import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from '../bin/workspace.mjs';
import { capturePosting } from '../extension/capture.mjs';
const require = createRequire(process.env.ROL_TEST_NODE_MODULES ? path.join(process.env.ROL_TEST_NODE_MODULES, '_entry.cjs') : import.meta.url);
const { chromium } = require('playwright');
const directory = await mkdtemp(path.join(os.tmpdir(), 'rolpusula-browser-'));
const extension = path.join(ROOT, 'extension');
const output = path.join(ROOT, 'test-output', process.env.ROL_BROWSER_CHANNEL || 'chromium');
await mkdir(output, { recursive: true });
const context = await chromium.launchPersistentContext(directory, {
  headless: true,
  channel: process.env.ROL_BROWSER_CHANNEL || 'chromium',
  args: ['--disable-extensions-except=' + extension, '--load-extension=' + extension],
  viewport: { width: 1180, height: 900 }, acceptDownloads: true,
});
const checks = [], errors = [];
async function step(label, fn) {
  try { await fn(); checks.push(label); console.log('PASS ' + label); }
  catch (error) {
    for (const p of context.pages().filter(p => p.url().includes('/app.html'))) {
      console.error('UI failure:', await p.locator('#notice').innerText(), 'errors:', errors);
      await p.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    }
    throw error;
  }
}
try {
  const manager = await context.newPage();
  let id;
  if (process.env.ROL_BROWSER_CHANNEL === 'msedge') {
    await manager.goto('edge://extensions');
    const card = manager.locator('extension-card').filter({ has: manager.getByText('RolPusula', { exact: true }) });
    await card.locator('fluent-button').filter({ hasText: /^(\s*)(Ayrıntılar|Details)(\s*)$/ }).click();
    await manager.waitForURL(/(?:[?&]id=|\/detail)/, { timeout: 10000 });
    id = new URL(manager.url()).searchParams.get('id') || new URL(manager.url()).pathname.split('/').filter(Boolean).at(-1);
  } else {
    await manager.goto('chrome://extensions');
    await manager.locator('extensions-item').filter({ hasText: 'RolPusula' }).waitFor({ timeout: 15000 });
    id = await manager.locator('extensions-item').filter({ hasText: 'RolPusula' }).getAttribute('id');
  }
  assert.match(id, /^[a-p]{32}$/);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const network = [];
  page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
  await page.goto('chrome-extension://' + id + '/app.html');
  const password = 'demo-random-words-passphrase';
  const q = s => page.locator('#' + s);
  await step('real extension loads with exact permission boundary', async () => {
    assert.deepEqual((await page.evaluate(() => chrome.runtime.getManifest())).permissions.sort(), ['activeTab', 'scripting', 'storage'].sort());
    await q('password').fill(password); await q('password-confirm').fill(password);
    await q('unlock-submit').click(); await q('workspace').waitFor({ state: 'visible' });
  });
  await step('fictional profile and job persist only as ciphertext', async () => {
    await page.getByRole('button', { name: 'Profilim', exact: true }).click();
    await q('resume').fill('FICTIONAL-CV-MARKER. SQL ile rapor geliştiren örnek aday.');
    await q('keywords').fill('SQL, Excel, Python');
    await q('target').fill('Veri analisti · Uzaktan');
    await page.getByRole('button', { name: 'Profili şifreli kaydet' }).click();
    await page.getByText('Profil şifreli kaydedildi.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'İlanlarım', exact: true }).click();
    await q('new-job').click();
    await q('job-title').fill('Veri Analisti');
    await q('job-company').fill('Örnek Teknoloji');
    await q('job-url').fill('https://example.com/jobs/42?token=private&utm_source=test');
    await q('job-text').fill('SQL ve Excel ile raporlama. Tamamen kurmaca test ilanı.');
    await page.getByRole('button', { name: 'İlanı kaydet', exact: true }).click();
    await page.getByText('İlan şifreli kaydedildi.', { exact: true }).waitFor();
    assert.equal(await page.locator('.score').first().innerText(), '%67\nkelime eşleşmesi');
    const stored = JSON.stringify(await page.evaluate(() => chrome.storage.local.get(null)));
    for (const value of ['FICTIONAL-CV-MARKER', 'Örnek Teknoloji', 'SQL', 'private']) assert.ok(!stored.includes(value));
    const sync = await page.evaluate(() => chrome.storage.sync.get(null));
    assert.deepEqual(sync, {});
    await page.screenshot({ path: path.join(output, 'workspace.png'), fullPage: true });
  });
  await step('export defaults to one job, excludes profile and requires fresh consent', async () => {
    await page.getByRole('button', { name: 'Başvuru hazırla', exact: true }).click();
    assert.equal(await q('include-profile').isChecked(), false);
    assert.equal(await q('export-download').isDisabled(), true);
    const preview = JSON.parse(await q('export-preview').innerText());
    assert.equal(preview.profile, null);
    assert.equal(preview.job.url, 'https://example.com/jobs/42');
    await q('export-consent').check();
    await q('include-profile').check();
    assert.equal(await q('export-consent').isChecked(), false);
    await q('export-consent').check();
    const pending = page.waitForEvent('download');
    await q('export-download').click();
    const download = await pending;
    await download.saveAs(path.join(output, 'fictional.rpjob.json'));
    const pack = JSON.parse(await readFile(path.join(output, 'fictional.rpjob.json'), 'utf8'));
    assert.ok(pack.profile.resume.includes('FICTIONAL-CV-MARKER'));
    assert.equal(pack.job.title, 'Veri Analisti');
  });
  await step('lock removes all private DOM, wrong password cannot unlock', async () => {
    await q('lock').click(); await q('gate').waitFor({ state: 'visible' });
    assert.ok(!(await page.content()).includes('FICTIONAL-CV-MARKER'));
    assert.equal(await q('resume').inputValue(), '');
    await q('password').fill('wrong-long-password'); await q('unlock-submit').click();
    await page.getByText('Parola yanlış veya kasa dosyası bozulmuş.').waitFor();
    assert.equal(await q('workspace').isVisible(), false);
    await q('password').fill(password); await q('unlock-submit').click();
    await q('workspace').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.job h2').innerText(), 'Veri Analisti');
  });
  await step('concurrent stale window cannot overwrite a newer vault', async () => {
    const other = await context.newPage();
    await other.goto(page.url());
    await other.locator('#password').fill(password); await other.locator('#unlock-submit').click();
    await other.locator('#workspace').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Profilim', exact: true }).click();
    await q('target').fill('Should not overwrite');
    await page.getByRole('button', { name: 'Profili şifreli kaydet' }).click();
    await q('gate').waitFor({ state: 'visible' });
    assert.match(await q('notice').innerText(), /kasa değişti/);
    await other.close();
    await q('password').fill(password); await q('unlock-submit').click();
    await q('workspace').waitFor({ state: 'visible' });
  });
  await step('encrypted backup, confirmed erase, restore, and idle lock', async () => {
    await page.getByRole('button', { name: 'Gizlilik ve aktarım', exact: true }).click();
    const pending = page.waitForEvent('download'); await q('backup').click();
    await (await pending).saveAs(path.join(output, 'fictional.rpvault.json'));
    const backup = JSON.parse(await readFile(path.join(output, 'fictional.rpvault.json'), 'utf8'));
    assert.equal(backup.format, 'rolpusula-vault');
    assert.ok(!JSON.stringify(backup).includes('FICTIONAL'));
    page.once('dialog', d => d.accept('SİL'));
    await q('erase').click();
    await page.getByText('Yerel kasa silindi. İndirilmiş dosyalar silinmedi.', { exact: true }).waitFor();
    assert.equal((await page.evaluate(() => chrome.storage.local.get('vault'))).vault, undefined);
    await q('restore-locked').setInputFiles(path.join(output, 'fictional.rpvault.json'));
    await q('restore-password').fill(password);
    await page.getByRole('button', { name: 'Yedeği yükle', exact: true }).click();
    await page.getByText('Yedek yüklendi. Açmak için yedeğin parolasını girin.', { exact: true }).waitFor();
    await q('password').fill(password); await q('unlock-submit').click();
    await q('workspace').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.job h2').innerText(), 'Veri Analisti');
    await page.clock.install();
    await page.clock.fastForward('06:00');
    await q('gate').waitFor({ state: 'visible' });
    assert.equal(await q('resume').inputValue(), '');
    assert.equal(await q('job-list').innerText(), '');
  });
  await step('visible extraction excludes forms and hidden text', async () => {
    const fixture = await context.newPage();
    await fixture.setContent('<h1>Demo role</h1><article><p>SQL visible role</p><input value="SECRET-FORM"><textarea>SECRET-TEXTAREA</textarea><p hidden>SECRET-HIDDEN</p><p style="display:none">SECRET-CSS</p><p contenteditable>SECRET-EDITABLE</p></article>');
    const result = await fixture.evaluate(capturePosting);
    assert.equal(result.text, 'SQL visible role');
    await fixture.locator('textarea').focus();
    await assert.rejects(fixture.evaluate(capturePosting), /Form alanları okunmaz/);
    await fixture.setContent('<div style="opacity:0"><article>SECRET-ANCESTOR</article></div>');
    await assert.rejects(fixture.evaluate(capturePosting), /İlan alanı bulunamadı/);
    await fixture.setContent('<h1>No posting</h1><input value="not a job">');
    await assert.rejects(fixture.evaluate(capturePosting), /İlan alanı bulunamadı/);
    await fixture.close();
  });
  await step('responsive screens and no outbound extension requests', async () => {
    await page.screenshot({ path: path.join(output, 'onboarding.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 850 });
    await page.screenshot({ path: path.join(output, 'narrow.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(network, []);
    assert.deepEqual(errors, []);
  });
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ checks, browser: context.browser()?.version(), networkRequests: network.length, errors }, null, 2));
  console.log('Browser test complete: ' + checks.length + ' checks.');
} finally { await context.close(); }
