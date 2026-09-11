import { lstat, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export const PROVIDERS = Object.freeze({
  claude: { label: 'Claude Code', command: 'claude', company: 'Anthropic', cloud: true },
  codex: { label: 'OpenAI Codex', command: 'codex', company: 'OpenAI', cloud: true },
  gemini: { label: 'Gemini CLI', command: 'gemini', company: 'Google', cloud: true },
  ollama: { label: 'Yerel model (Ollama)', command: 'codex', company: null, cloud: false },
});
export const PROVIDER_FILE = '.rolpusula-provider.json';

function cleanModel(value) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > 120 || value.includes('..') || value.includes('//') || !/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(value)) throw new Error('Model adı geçersiz.');
  return value;
}
export function providerConfig(provider = 'claude', model = null) {
  if (!Object.hasOwn(PROVIDERS, provider)) throw new Error('Sağlayıcı claude, codex, gemini veya ollama olmalı.');
  const cleaned = cleanModel(model);
  if (provider === 'ollama' && !cleaned) throw new Error('Yerel kullanım için --model gerekli. Önce "ollama list" çalıştırın.');
  if (provider === 'ollama' && /(?:^|[:/_-])cloud(?:$|[:/_-])/i.test(cleaned)) throw new Error('Yerel kipte bulut model adı kullanılamaz. Ollama listesinde cihazda bulunan bir model seçin.');
  return { format: 'rolpusula-provider', version: 1, provider, model: cleaned };
}
export function validateProviderConfig(input) {
  if (!input || input.format !== 'rolpusula-provider' || input.version !== 1 || Object.keys(input).some(k => !['format', 'version', 'provider', 'model'].includes(k))) throw new Error('Sağlayıcı ayarı geçersiz.');
  return providerConfig(input.provider, input.model);
}
export async function readProviderConfig(workspace) {
  return validateProviderConfig(JSON.parse(await readFile(path.join(workspace, PROVIDER_FILE), 'utf8')));
}
export async function writeProviderConfig(workspace, provider, model, { initial = false } = {}) {
  const data = providerConfig(provider, model);
  const target = path.join(workspace, PROVIDER_FILE);
  if (!initial) {
    try { if ((await lstat(target)).isSymbolicLink()) throw new Error('Sağlayıcı ayarı sembolik bağlantı olamaz.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const body = JSON.stringify(data, null, 2) + '\n';
  if (initial) await writeFile(target, body, { flag: 'wx', mode: 0o600 });
  else {
    const temp = path.join(workspace, PROVIDER_FILE + '.pending-' + randomUUID());
    await writeFile(temp, body, { flag: 'wx', mode: 0o600 });
    await rename(temp, target);
  }
  return data;
}
export function launchSpec(workspace, config) {
  const c = validateProviderConfig(config), model = c.model ? ['--model', c.model] : [];
  if (c.provider === 'claude') return { command: 'claude', args: ['--setting-sources', 'project,local', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', ...model], cwd: workspace, env: {} };
  if (c.provider === 'codex') return { command: 'codex', args: ['-C', workspace, '--sandbox', 'workspace-write', '--ask-for-approval', 'on-request', '-c', 'mcp_servers={}', '-c', 'web_search="disabled"', ...model], cwd: workspace, env: {} };
  if (c.provider === 'gemini') return { command: 'gemini', args: [...(c.model ? ['--model', c.model] : [])], cwd: workspace, env: { GEMINI_TELEMETRY_ENABLED: 'false', GEMINI_TELEMETRY_LOG_PROMPTS: 'false' } };
  return { command: 'codex', args: ['-C', workspace, '--sandbox', 'workspace-write', '--ask-for-approval', 'on-request', '-c', 'mcp_servers={}', '-c', 'web_search="disabled"', '--oss', '--local-provider', 'ollama', '--model', c.model], cwd: workspace, env: {} };
}
export function commandAvailable(command, args = ['--version']) {
  const r = spawnSync(command, args, { encoding: 'utf8', timeout: 15_000, windowsHide: true });
  return { ok: r.status === 0, detail: r.status === 0 ? (r.stdout || r.stderr).trim().split(/\r?\n/)[0] : 'Bulunamadı veya çalışmadı.' };
}
export function localModels() {
  const r = spawnSync('ollama', ['list'], { encoding: 'utf8', timeout: 15_000, windowsHide: true });
  if (r.status !== 0) return [];
  return r.stdout.split(/\r?\n/).slice(1).map(line => line.trim().split(/\s+/)[0]).filter(name => name && !/(?:^|[:/_-])cloud(?:$|[:/_-])/i.test(name));
}
