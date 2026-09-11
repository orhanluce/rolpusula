import { mkdir, lstat, readdir, readFile, writeFile, realpath, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { parsePackage, MAX_PACKAGE } from '../extension/model.mjs';
import { writeProviderConfig, readProviderConfig, providerConfig, PROVIDERS, commandAvailable, localModels } from './providers.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function inside(parent, child) { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)); }
async function assertNoLink(file) {
  const info = await lstat(file);
  if (info.isSymbolicLink()) throw new Error('Sembolik bağlantı kullanılamaz: ' + path.basename(file));
  return info;
}
async function assertOutsideGit(directory) {
  // Git worktrees use a .git file; ordinary repositories use a directory.
  // Inspect ancestors directly so this boundary also works without Git installed.
  let current = directory;
  while (true) {
    try { await lstat(path.join(current, '.git')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) return;
      current = parent;
      continue;
    }
    throw new Error('Kişisel çalışma alanı bir Git reposunun içinde kullanılamaz.');
  }
}
async function copyPrivate(from, to) {
  const info = await assertNoLink(from);
  if (info.isDirectory()) {
    await mkdir(to, { mode: 0o700 });
    for (const entry of await readdir(from)) await copyPrivate(path.join(from, entry), path.join(to, entry));
  } else if (info.isFile()) {
    await writeFile(to, await readFile(from), { flag: 'wx', mode: 0o600 });
  } else throw new Error('Desteklenmeyen dosya türü.');
}
export async function initWorkspace(destination, provider = 'claude', model = null) {
  const selection = providerConfig(provider, model);
  const target = path.resolve(destination);
  const parent = await realpath(path.dirname(target)); // Parent must already exist.
  const actual = path.join(parent, path.basename(target));
  if (inside(await realpath(ROOT), actual)) throw new Error('Kişisel çalışma alanını dağıtım reposunun dışında oluşturun.');
  await assertOutsideGit(parent);
  // mkdir is exclusive; never overwrite even an empty existing directory.
  await copyPrivate(path.join(ROOT, 'workspace-template'), actual);
  await writeFile(path.join(actual, '.gitignore'), '*\n', { mode: 0o600 });
  await writeProviderConfig(actual, selection.provider, selection.model, { initial: true });
  // Marker is written last: interrupted installs can never be imported into.
  await writeFile(path.join(actual, '.rolpusula-workspace.json'), JSON.stringify({ format: 'rolpusula-workspace', version: 1 }) + '\n', { flag: 'wx', mode: 0o600 });
  return actual;
}
export async function setWorkspaceProvider(input, provider, model = null) {
  const dir = await verifyWorkspace(input);
  return writeProviderConfig(dir, provider, model);
}
export async function getWorkspaceProvider(input) {
  const dir = await verifyWorkspace(input);
  return { dir, config: await readProviderConfig(dir) };
}
export async function verifyWorkspace(input) {
  const resolved = path.resolve(input);
  await assertNoLink(resolved);
  const dir = await realpath(resolved);
  if (inside(await realpath(ROOT), dir)) throw new Error('Dağıtım reposuna kişisel veri yazılamaz.');
  const marker = path.join(dir, '.rolpusula-workspace.json');
  await assertNoLink(marker);
  const data = JSON.parse(await readFile(marker, 'utf8'));
  if (data.format !== 'rolpusula-workspace' || data.version !== 1) throw new Error('RolPusula çalışma alanı değil.');
  await assertOutsideGit(dir);
  for (const component of ['documents', 'documents/postings', 'documents/cv']) {
    const location = path.join(dir, component);
    if (!(await assertNoLink(location)).isDirectory() || !inside(dir, await realpath(location))) throw new Error('Güvenli olmayan belge klasörü.');
  }
  return dir;
}
export async function importJob(filename, workspace) {
  const dir = await verifyWorkspace(workspace);
  const info = await assertNoLink(filename);
  if (!info.isFile() || info.size > MAX_PACKAGE * 4) throw new Error('Başvuru paketi geçersiz veya çok büyük.');
  const pack = parsePackage(await readFile(filename, 'utf8'));
  // Atomic import directory: all data validated before any user file is written.
  const id = randomUUID();
  const temp = path.join(dir, 'documents', 'postings', '.pending-' + id);
  const final = path.join(dir, 'documents', 'postings', id);
  await mkdir(temp, { mode: 0o700 });
  await writeFile(path.join(temp, 'package.json'), JSON.stringify(pack, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  await rename(temp, final);
  return { id, directory: final, includesProfile: !!pack.profile };
}
export function doctor(config = null) {
  const provider = typeof config === 'string' ? config : config?.provider ?? null;
  const checks = [
    ['Node.js 22+', process.execPath, ['--version']],
    ['Bun (ilan arama)', 'bun', ['--version']],
    ['LuaLaTeX (CV)', 'lualatex', ['--version']],
    ['XeLaTeX (ön yazı)', 'xelatex', ['--version']],
    ['Python 3.10+', process.platform === 'win32' ? 'py' : 'python3', process.platform === 'win32' ? ['-3', '--version'] : ['--version']],
    ['PDF metin denetimi', process.platform === 'win32' ? 'py' : 'python3', [...(process.platform === 'win32' ? ['-3'] : []), '-c', 'import pypdf; print("pypdf", pypdf.__version__)']],
  ];
  const results = checks.map(([label, cmd, args]) => {
    const result = spawnSync(cmd, args, { encoding: 'utf8', timeout: 15_000, windowsHide: true });
    let ok = result.status === 0;
    if (label === 'Node.js 22+') ok &&= Number(process.versions.node.split('.')[0]) >= 22;
    if (label === 'Python 3.10+') {
      const v = result.stdout?.match(/Python (\d+)\.(\d+)/);
      ok &&= !!v && (Number(v[1]) > 3 || (Number(v[1]) === 3 && Number(v[2]) >= 10));
    }
    return { label, ok, required: true, detail: ok ? result.stdout.trim().split(/\r?\n/)[0] : 'Bulunamadı veya çalışmadı; kurulum kılavuzuna bakın.' };
  });
  for (const [id, p] of Object.entries(PROVIDERS)) {
    if (provider && id !== provider) continue;
    const test = commandAvailable(p.command);
    results.push({ label: p.label, ...test, required: !!provider });
    if (id === 'ollama') {
      const ollama = commandAvailable('ollama');
      results.push({ label: 'Ollama', ...ollama, required: provider === 'ollama' });
      if (provider === 'ollama' && config?.model) {
        const installed = localModels().includes(config.model);
        results.push({ label: 'Seçili yerel model', ok: installed, required: true, detail: installed ? config.model : config.model + ' cihazda bulunamadı.' });
      }
    }
  }
  return results;
}
