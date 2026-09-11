// No key or plaintext is persisted. Keys stay in this page's memory.
export const ITERATIONS = 600_000;
const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
const MAX_CIPHER = 9_000_000;
export function fingerprint(e) {
  // chrome.storage can reorder object keys; compare fields in a canonical order.
  return e ? JSON.stringify([e.format, e.version, e.kdf, e.iterations, e.salt, e.iv, e.ciphertext]) : null;
}
function b64(a) {
  let s = '';
  for (let i = 0; i < a.length; i += 16_384) s += String.fromCharCode(...a.subarray(i, i + 16_384));
  return btoa(s);
}
function unb64(s, max) {
  if (typeof s !== 'string' || s.length > max || !/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('Geçersiz şifreli kasa.');
  try { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); } catch { throw new Error('Geçersiz şifreli kasa.'); }
}
export function validateEnvelope(e) {
  if (!e || e.format !== 'rolpusula-vault' || e.version !== 1 || e.kdf !== 'PBKDF2-SHA256' || e.iterations !== ITERATIONS) throw new Error('Desteklenmeyen kasa biçimi.');
  const fields = ['format', 'version', 'kdf', 'iterations', 'salt', 'iv', 'ciphertext'];
  if (Object.keys(e).some(field => !fields.includes(field))) throw new Error('Kasada beklenmeyen alan var.');
  const salt = unb64(e.salt, 32), iv = unb64(e.iv, 32), ciphertext = unb64(e.ciphertext, MAX_CIPHER);
  if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16) throw new Error('Geçersiz kasa uzunluğu.');
  return { salt, iv, ciphertext };
}
async function keyFor(password, salt) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 1024) throw new Error('Parola 12–1024 karakter olmalı. Birkaç rastgele kelime seçin.');
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function createKey(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { key: await keyFor(password, salt), salt };
}
export async function seal(data, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = enc.encode(JSON.stringify(data));
  if (bytes.length > 6_500_000) throw new Error('Kasa dolu; eski ilanları silin.');
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('rolpusula-vault:1') }, key, bytes));
  return { format: 'rolpusula-vault', version: 1, kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), ciphertext: b64(ciphertext) };
}
export async function unseal(e, password) {
  const { salt, iv, ciphertext } = validateEnvelope(e);
  const key = await keyFor(password, salt);
  try {
    const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('rolpusula-vault:1') }, key, ciphertext);
    return { data: JSON.parse(dec.decode(bytes)), key, salt };
  } catch { throw new Error('Parola yanlış veya kasa dosyası bozulmuş.'); }
}
