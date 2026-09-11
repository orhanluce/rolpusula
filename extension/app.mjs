import { newVault, validateVault, profile, job, prune, matchKeywords, makePackage, cleanURL, MAX_JOBS, STATUSES } from './model.mjs';
import { createKey, seal, unseal, validateEnvelope, fingerprint } from './vault.mjs';
import { capturePosting } from './capture.mjs';
const $ = id => document.getElementById(id);
let vault = null, key = null, salt = null, baseline = null, editing = null, exporting = null;
let generation = 0, lastActive = Date.now(), busy = false;
let pendingRestore = null;
const IDLE = 5 * 60_000;
function notice(message, error = false) { $('notice').textContent = message; $('notice').classList.toggle('error', error); }
async function readStored() { return (await chrome.storage.local.get('vault')).vault ?? null; }
async function gate() {
  const exists = !!(await readStored());
  $('gate-title').textContent = exists ? 'Kasanı aç' : 'Önce kendi kasanı oluştur.';
  $('unlock-submit').textContent = exists ? 'Kasayı aç' : 'Şifreli kasa oluştur';
  $('confirm-wrap').hidden = exists;
  $('password-confirm').required = !exists;
}
function lock(message = 'Kasa kilitlendi.') {
  generation++;
  vault = key = salt = baseline = editing = exporting = null;
  document.querySelectorAll('input:not([type=file]),textarea').forEach(el => { el.value = ''; if (el.type === 'checkbox') el.checked = false; });
  $('job-list').replaceChildren();
  $('export-preview').textContent = '';
  $('export-dialog').close();
  $('restore-dialog').close(); pendingRestore = null;
  $('editor').hidden = true;
  $('workspace').hidden = true;
  $('lock').hidden = true;
  $('gate').hidden = false;
  $('locked-tools').hidden = false;
  notice(message);
  gate().catch(() => notice('Kasa durumu okunamadı.', true));
}
function requireUnlocked() {
  if (!vault || Date.now() - lastActive >= IDLE) { lock(); throw new Error('Devam etmek için kasayı açın.'); }
}
async function currentEnvelope() {
  requireUnlocked();
  const epoch = generation;
  const stored = await readStored();
  if (epoch !== generation || fingerprint(stored) !== baseline) {
    lock('Kasa başka bir pencerede değişti. Güncel kasayı yeniden açın.');
    throw new Error('İşlem yapılmadı; kasa değişti.');
  }
  return stored;
}
async function mutate(change) {
  requireUnlocked();
  const epoch = generation;
  await navigator.locks.request('rolpusula-vault', async () => {
    await currentEnvelope();
    const next = structuredClone(vault);
    change(next);
    next.revision++;
    const validated = validateVault(next);
    const encrypted = await seal(validated, key, salt);
    if (epoch !== generation) throw new Error('Kasa kilitlendi; değişiklik kaydedilmedi.');
    await chrome.storage.local.set({ vault: encrypted });
    if (epoch !== generation) return;
    baseline = fingerprint(encrypted);
    vault = validated;
  });
  if (epoch === generation) render();
}
function action(id, fn) {
  $(id).addEventListener('click', async event => {
    if (busy) return;
    busy = true;
    try { await fn(event); } catch (e) { notice(e.message, true); } finally { busy = false; }
  });
}
function form(id, fn) {
  $(id).addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    try { await fn(); } catch (err) { notice(err.message, true); } finally { busy = false; }
  });
}
function el(tag, value, cls) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (cls) node.className = cls;
  return node;
}
function button(label, callback, cls = 'secondary') {
  const b = el('button', label, cls);
  b.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try { requireUnlocked(); await callback(); } catch (e) { notice(e.message, true); } finally { busy = false; }
  });
  return b;
}
function tab(name) {
  requireUnlocked();
  for (const n of ['jobs', 'profile', 'privacy']) $(n + '-panel').hidden = n !== name;
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === name)));
  if (name === 'profile') for (const field of ['resume', 'keywords', 'target']) $(field).value = vault.profile[field];
  if (name === 'privacy') $('retention').value = vault.retention;
}
function render() {
  if (!vault) return;
  $('job-count').textContent = vault.jobs.length ? vault.jobs.length + ' ilan kasanda.' : 'Henüz ilan kaydetmedin.';
  const list = $('job-list'); list.replaceChildren();
  if (!vault.jobs.length) {
    const empty = el('div', undefined, 'empty');
    empty.append(el('h2', 'İlk ilanla başla.'), el('p', 'Bir ilan aç, eklentiyi seç ve “İlan ekle”ye bas. İstersen ilan metnini doğrudan yapıştır.'));
    list.append(empty); return;
  }
  const jobs = [...vault.jobs].sort((a, b) => (matchKeywords(vault.profile, b.text).score ?? -1) - (matchKeywords(vault.profile, a.text).score ?? -1));
  for (const j of jobs) {
    const score = matchKeywords(vault.profile, j.text);
    const row = el('article', undefined, 'job'), content = el('div');
    content.append(el('h2', j.title), el('p', [j.company, j.status].filter(Boolean).join(' · ')));
    content.append(el('p', 'Geçen: ' + (score.matched.join(', ') || '—')));
    if (score.missing.length) content.append(el('p', 'Metinde bulunmayan: ' + score.missing.join(', ')));
    const count = el('div', score.score === null ? '—' : '%' + score.score, 'score');
    count.append(el('span', score.total ? 'kelime eşleşmesi' : 'Profiline beceri ekle'));
    const actions = el('div', undefined, 'actions');
    actions.append(button('İncele', () => edit(j)), button('Başvuru hazırla', () => openExport(j)));
    actions.append(button('Sil', async () => {
      if (!confirm('Bu ilanı kasadan silmek istiyor musun?')) return;
      await mutate(v => { v.jobs = v.jobs.filter(x => x.id !== j.id); });
      notice('İlan silindi. İndirdiğin dosyalar etkilenmedi.');
    }, 'quiet'));
    content.append(actions); row.append(content, count); list.append(row);
  }
}
function edit(j = null) {
  requireUnlocked(); editing = j;
  for (const field of ['title', 'company', 'url', 'text']) $('job-' + field).value = j?.[field] ?? '';
  $('job-status').value = j?.status ?? STATUSES[0];
  $('editor').hidden = false; $('job-title').focus();
}
function download(name, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = el('a'); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
function exportPreview() {
  requireUnlocked();
  $('export-preview').textContent = JSON.stringify(makePackage(vault.profile, exporting, $('include-profile').checked), null, 2);
  $('export-consent').checked = false; $('export-download').disabled = true;
}
async function openExport(j) {
  await currentEnvelope(); exporting = j;
  $('include-profile').checked = false;
  exportPreview(); $('export-dialog').showModal();
}
form('unlock-form', async () => {
  const epoch = generation;
  const password = $('password').value, confirmation = $('password-confirm').value;
  $('password').value = $('password-confirm').value = '';
  await navigator.locks.request('rolpusula-vault', async () => {
    let stored = await readStored();
    let unlocked;
    if (!stored) {
      if (password !== confirmation) throw new Error('Parolalar eşleşmiyor.');
      const keys = await createKey(password);
      unlocked = { ...keys, data: newVault() };
      stored = await seal(unlocked.data, keys.key, keys.salt);
      if (epoch !== generation) return;
      await chrome.storage.local.set({ vault: stored });
    } else { unlocked = await unseal(stored, password); }
    if (epoch !== generation) return;
    vault = validateVault(unlocked.data); key = unlocked.key; salt = unlocked.salt;
    baseline = fingerprint(stored); lastActive = Date.now();
  });
  if (!vault || epoch !== generation) return;
  let removed = 0;
  await mutate(v => { removed = prune(v); });
  $('gate').hidden = true; $('locked-tools').hidden = true;
  $('workspace').hidden = false; $('lock').hidden = false;
  tab('jobs'); render();
  notice(removed ? removed + ' eski ilan saklama süresine göre silindi.' : 'Kasa açık. Veriler cihazından gönderilmedi.');
});
for (const s of STATUSES) { const option = el('option', s); option.value = s; $('job-status').append(option); }
document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { try { tab(b.dataset.tab); } catch (e) { notice(e.message, true); } }));
action('lock', () => lock());
action('new-job', () => edit());
action('cancel-job', () => { $('job-form').reset(); editing = null; $('editor').hidden = true; });
action('capture', async () => {
  requireUnlocked();
  const epoch = generation;
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!active?.id || !/^https?:\/\//.test(active.url ?? '')) throw new Error('İlan sayfasındaki araç çubuğundan eklentiyi açın. Tarayıcı ayar sayfaları okunamaz.');
  cleanURL(active.url);
  let result;
  try { [result] = await chrome.scripting.executeScript({ target: { tabId: active.id }, func: capturePosting, world: 'ISOLATED' }); }
  catch { throw new Error('Sayfa okunamadı. İlan metnini seçip tekrar deneyin veya elle yapıştırın.'); }
  if (epoch !== generation) return;
  if (!result?.result) throw new Error('İlan alanı bulunamadı. Metni elle yapıştırın.');
  const captured = result.result;
  for (const field of ['title', 'company', 'text']) $('job-' + field).value = captured[field] ?? '';
  $('job-url').value = cleanURL(captured.url);
  notice(captured.truncated ? 'İlan 40.000 karakterde kesildi. Tam metni kontrol edin.' : 'Metin alındı. Henüz kaydedilmedi; gözden geçirip kaydet.');
});
form('job-form', async () => {
  requireUnlocked();
  const value = job({ ...(editing ?? {}), title: $('job-title').value, company: $('job-company').value, url: $('job-url').value, text: $('job-text').value, status: $('job-status').value });
  await mutate(v => {
    const index = v.jobs.findIndex(j => j.id === value.id);
    if (index >= 0) v.jobs[index] = value;
    else {
      if (v.jobs.length >= MAX_JOBS) throw new Error('En fazla 150 ilan saklanabilir. Önce eski ilanları silin.');
      if (value.url && v.jobs.some(j => j.url === value.url)) throw new Error('Bu bağlantı zaten kayıtlı. Mevcut ilanı düzenleyin.');
      v.jobs.push(value);
    }
  });
  $('job-form').reset(); $('editor').hidden = true; editing = null; notice('İlan şifreli kaydedildi.');
});
form('profile-form', async () => {
  const value = profile({ resume: $('resume').value, keywords: $('keywords').value, target: $('target').value });
  await mutate(v => { v.profile = value; }); notice('Profil şifreli kaydedildi.');
});
action('save-retention', async () => {
  const days = Number($('retention').value);
  if (!confirm('Saklama süresi uygulanınca süresi dolan ilanlar silinecek. Devam edilsin mi?')) return;
  let removed = 0; await mutate(v => { v.retention = days; removed = prune(v); });
  notice('Saklama süresi kaydedildi. Silinen ilan: ' + removed);
});
action('backup', async () => { const data = await currentEnvelope(); download('rolpusula-yedek.rpvault.json', data); notice('Şifreli yedek indirildi. Parolanı ayrı ve güvenli bir yerde tut.'); });
async function erase() {
  if (prompt('Bu cihazdaki profil ve ilanlar silinecek. İndirilen yedekler kalır. Onaylamak için SİL yazın:') !== 'SİL') return;
  await navigator.locks.request('rolpusula-vault', async () => { await chrome.storage.local.remove('vault'); lock('Yerel kasa silindi. İndirilmiş dosyalar silinmedi.'); });
}
action('erase', erase); action('erase-locked', erase);
async function restore(file) {
  if (!file || file.size > 9_100_000) throw new Error('Yedek dosyası geçersiz veya çok büyük.');
  if (await readStored()) throw new Error('Mevcut kasa var. Önce yedeğini alın, ardından kasayı silin.');
  const envelope = JSON.parse(await file.text());
  validateEnvelope(envelope);
  pendingRestore = envelope;
  $('restore-dialog').showModal(); $('restore-password').focus();
}
form('restore-form', async () => {
  const envelope = pendingRestore;
  const password = $('restore-password').value;
  $('restore-password').value = '';
  if (!envelope) throw new Error('Önce bir yedek dosyası seçin.');
  validateVault((await unseal(envelope, password)).data);
  await navigator.locks.request('rolpusula-vault', async () => {
    if (await readStored()) throw new Error('Mevcut kasa var. Önce yedeğini alın, ardından kasayı silin.');
    await chrome.storage.local.set({ vault: envelope });
  });
  lock('Yedek yüklendi. Açmak için yedeğin parolasını girin.');
});
action('restore-cancel', () => { pendingRestore = null; $('restore-password').value = ''; $('restore-dialog').close(); });
action('restore-open', () => $('restore').click());
action('restore-locked-open', () => $('restore-locked').click());
for (const id of ['restore', 'restore-locked']) $(id).addEventListener('change', async e => {
  if (busy) return;
  busy = true;
  try { await restore(e.target.files[0]); } catch (error) { notice(error.message, true); } finally { e.target.value = ''; busy = false; }
});
$('include-profile').addEventListener('change', exportPreview);
$('export-consent').addEventListener('change', () => { $('export-download').disabled = !$('export-consent').checked; });
action('export-cancel', () => { exporting = null; $('export-preview').textContent = ''; $('export-dialog').close(); });
action('export-download', async () => {
  await currentEnvelope();
  if (!$('export-consent').checked || !exporting) throw new Error('Önce aktarılacak içeriği kontrol edip onaylayın.');
  download('rolpusula-' + exporting.id + '.rpjob.json', makePackage(vault.profile, exporting, $('include-profile').checked));
  $('export-dialog').close(); $('export-preview').textContent = ''; exporting = null;
  notice('Başvuru paketi indirildi. Kılavuzdaki import komutuyla yerel çalışma alanına alın.');
});
action('expand', () => chrome.runtime.openOptionsPage());
function activity() {
  if (vault && Date.now() - lastActive >= IDLE) { lock('Hareketsizlik nedeniyle kasa kilitlendi.'); return; }
  lastActive = Date.now();
}
for (const event of ['pointerdown', 'keydown']) document.addEventListener(event, activity, true);
setInterval(() => { if (vault && Date.now() - lastActive >= IDLE) lock('Hareketsizlik nedeniyle kasa kilitlendi.'); }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && vault && Date.now() - lastActive >= IDLE) lock(); });
window.addEventListener('pagehide', () => lock());
try {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  const thisTab = await chrome.tabs.getCurrent();
  document.body.classList.toggle('popup', !thisTab);
  if (thisTab) { $('capture').hidden = true; $('expand').hidden = true; }
  await gate();
} catch { notice('Tarayıcı depolaması açılamadı. Eklentiyi Chrome, Edge veya uyumlu bir Chromium tarayıcısında kurun.', true); $('unlock-submit').disabled = true; }
