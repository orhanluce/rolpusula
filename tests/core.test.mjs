import test from 'node:test';
import assert from 'node:assert/strict';
import { createKey, seal, unseal, validateEnvelope, fingerprint } from '../extension/vault.mjs';
import { cleanURL, job, profile, newVault, validateVault, prune, matchKeywords, makePackage, parsePackage } from '../extension/model.mjs';
const password = 'demo-only-random-words-2026';
test('vault: authenticated encryption, no plaintext, randomized IV, wrong passwords and tampering rejected', async () => {
  const keys = await createKey(password);
  assert.equal(keys.key.extractable, false);
  const data = { note: 'FICTIONAL-PRIVATE-CONTENT', city: 'İstanbul' };
  const a = await seal(data, keys.key, keys.salt), b = await seal(data, keys.key, keys.salt);
  assert.notEqual(a.iv, b.iv); assert.notEqual(a.ciphertext, b.ciphertext);
  assert.equal(fingerprint(a), fingerprint(Object.fromEntries(Object.entries(a).reverse())));
  assert.ok(!JSON.stringify(a).includes(data.note));
  assert.deepEqual((await unseal(a, password)).data, data);
  await assert.rejects(unseal(a, 'another-long-password'));
  await assert.rejects(unseal({ ...a, ciphertext: (a.ciphertext[0] === 'A' ? 'B' : 'A') + a.ciphertext.slice(1) }, password));
  assert.throws(() => validateEnvelope({ ...a, iterations: 1 }));
  assert.throws(() => validateEnvelope({ ...a, iterations: 999999999 }));
  assert.throws(() => validateEnvelope({ ...a, iv: '' }));
  assert.throws(() => validateEnvelope({ ...a, resume: 'Unencrypted payload must not be restored' }));
  await assert.rejects(createKey('short'));
});
test('URL boundary: no credentials, scripts, tracking, fragments or foreign schemes', () => {
  assert.equal(cleanURL('https://example.com/jobs?utm_source=x&token=secret&jobId=42#private'), 'https://example.com/jobs?jobId=42');
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'https://user:pass@example.com', 'chrome://settings']) assert.throws(() => cleanURL(url));
});
test('job and package schemas discard unrecognized fields and reject unsafe paths', () => {
  const p = makePackage(profile({ resume: 'Fictional demo resume' }), job({ title: 'Demo', text: 'SQL' }), false);
  assert.equal(p.profile, null);
  assert.equal(parsePackage(JSON.stringify({ ...p, command: 'do not execute' })).command, undefined);
  assert.throws(() => job({ title: 'Demo', text: 'SQL', id: '../../secret' }));
  assert.throws(() => job({ title: '', text: 'SQL' }));
  assert.throws(() => job({ title: 'Demo', text: {}, status: 'unsafe' }));
  assert.throws(() => parsePackage('x'.repeat(200001)));
  assert.throws(() => parsePackage(JSON.stringify({ format: 'rolpusula-job', version: 2 })));
  const roundTrip = parsePackage(JSON.stringify(makePackage({ resume: 'Only this profile' }, job({ title: 'A', text: '<script>untrusted data</script>' }), true)));
  assert.equal(roundTrip.profile.resume, 'Only this profile');
  assert.equal(roundTrip.job.text, '<script>untrusted data</script>');
});
test('keyword comparison: exact boundaries, Turkish casing, punctuation and no empty fake score', () => {
  assert.equal(matchKeywords(profile(), 'JavaScript SQL').score, null);
  const r = matchKeywords(profile({ keywords: 'Java, SQL, C++, İLETİŞİM, SQL' }), 'JavaScript SQL ve C++ ile iletişim');
  assert.equal(r.total, 4); assert.equal(r.score, 75);
  assert.deepEqual(r.missing, ['Java']);
});
test('retention uses original time, duplicate IDs and unknown states rejected', () => {
  const v = newVault(), old = Date.now() - 31 * 86400000;
  v.jobs = [job({ title: 'Old demo', text: 'Demo', created: new Date(old).toISOString() }), job({ title: 'New demo', text: 'Demo' })];
  assert.equal(prune(v), 1); assert.equal(v.jobs[0].title, 'New demo');
  assert.throws(() => validateVault({ ...v, jobs: [v.jobs[0], v.jobs[0]] }));
  assert.throws(() => validateVault({ ...v, retention: 0 }));
});
