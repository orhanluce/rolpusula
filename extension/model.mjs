export const MAX_TEXT = 40_000;
export const MAX_JOBS = 150;
export const MAX_PACKAGE = 200_000;
export const STATUSES = ['Kaydedildi', 'Hazırlanıyor', 'Başvuruldu', 'Görüşme', 'Kapandı'];
export function text(value, max = MAX_TEXT) {
  if (typeof value !== 'string' || value.length > max) throw new Error('Metin türü veya uzunluğu geçersiz.');
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim();
}
export function cleanURL(input) {
  if (!input) return '';
  let u;
  try { u = new URL(text(input, 3000)); } catch { throw new Error('Geçerli bir ilan bağlantısı girin.'); }
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) throw new Error('Yalnızca HTTP/HTTPS ilan bağlantıları kullanılabilir.');
  u.hash = '';
  // Preserve only common requisition IDs; discard tracking and authentication parameters.
  for (const key of [...u.searchParams.keys()]) if (!['id', 'jobId', 'jobid', 'jk', 'gh_jid', 'requisitionId'].includes(key)) u.searchParams.delete(key);
  return u.href;
}
export function profile(input = {}) {
  if (!input || typeof input !== 'object') throw new Error('Profil geçersiz.');
  return { resume: text(input.resume ?? ''), keywords: text(input.keywords ?? '', 2000), target: text(input.target ?? '', 500) };
}
export function job(input) {
  if (!input || typeof input !== 'object') throw new Error('İlan geçersiz.');
  const title = text(input.title, 500), body = text(input.text);
  if (!title || !body) throw new Error('İlan başlığı ve metni gerekli.');
  const id = input.id ?? crypto.randomUUID();
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) throw new Error('İlan kimliği geçersiz.');
  const created = input.created ?? new Date().toISOString();
  if (typeof created !== 'string' || !Number.isFinite(Date.parse(created)) || Date.parse(created) > Date.now() + 60_000) throw new Error('İlan tarihi geçersiz.');
  const status = input.status ?? STATUSES[0];
  if (!STATUSES.includes(status)) throw new Error('İlan durumu geçersiz.');
  return { id, title, company: text(input.company ?? '', 300), url: cleanURL(input.url ?? ''), text: body, created, status };
}
export function newVault() { return { version: 1, revision: 0, profile: profile(), jobs: [], retention: 30 }; }
export function validateVault(input) {
  if (!input || input.version !== 1 || !Number.isSafeInteger(input.revision) || input.revision < 0 ||
    !Array.isArray(input.jobs) || input.jobs.length > MAX_JOBS || ![7, 30, 90].includes(input.retention)) throw new Error('Kasa biçimi geçersiz.');
  const jobs = input.jobs.map(job);
  if (new Set(jobs.map(j => j.id)).size !== jobs.length) throw new Error('Tekrarlanan ilan kimliği.');
  return { version: 1, revision: input.revision, profile: profile(input.profile), jobs, retention: input.retention };
}
export function prune(vault, now = Date.now()) {
  const before = vault.jobs.length;
  vault.jobs = vault.jobs.filter(j => now - Date.parse(j.created) < vault.retention * 86_400_000);
  return before - vault.jobs.length;
}
function normalize(s) { return s.toLocaleLowerCase('tr-TR').normalize('NFKC').replace(/ı/g, 'i'); }
export function matchKeywords(p, body) {
  const words = [...new Set(p.keywords.split(/[,;\n]/).map(s => s.trim()).filter(Boolean))].slice(0, 50);
  const hay = normalize(body);
  const matched = words.filter(w => {
    const escaped = normalize(w).replace(/[.*+?^{}$()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^\\p{L}\\p{N}])' + escaped + '(?=$|[^\\p{L}\\p{N}])', 'u').test(hay);
  });
  return { total: words.length, matched, missing: words.filter(w => !matched.includes(w)), score: words.length ? Math.round(100 * matched.length / words.length) : null };
}
export function makePackage(p, j, includeProfile) {
  return { format: 'rolpusula-job', version: 1, job: job(j), profile: includeProfile ? profile(p) : null };
}
export function parsePackage(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_PACKAGE) throw new Error('Başvuru paketi çok büyük.');
  const data = JSON.parse(raw);
  if (!data || data.format !== 'rolpusula-job' || data.version !== 1 || !Object.hasOwn(data, 'profile')) throw new Error('Desteklenmeyen başvuru paketi.');
  return makePackage(data.profile ?? {}, data.job, data.profile !== null);
}
