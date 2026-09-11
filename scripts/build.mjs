import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT } from '../bin/workspace.mjs';
import { check } from './check.mjs';
import { releaseFiles, walk } from './files.mjs';
import { zip } from './zip.mjs';
await check();
const version = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8')).version;
const manifest = JSON.parse(await readFile(path.join(ROOT, 'extension/manifest.json'), 'utf8'));
if (manifest.version !== version || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Release versions must match.');
await mkdir(path.join(ROOT, 'dist'), { recursive: true });
const sums = [];
async function bundle(name, files, source) {
  const entries = [];
  for (const f of files) entries.push({ name: source ? 'rolpusula/' + f : f.replace(/^extension\//, ''), data: await readFile(path.join(ROOT, f)) });
  const bytes = zip(entries);
  await writeFile(path.join(ROOT, 'dist', name), bytes);
  sums.push(createHash('sha256').update(bytes).digest('hex') + '  ' + name);
  console.log(name + ': ' + entries.length + ' files, ' + bytes.length + ' bytes');
}
await bundle('rolpusula-extension-' + version + '.zip', await walk(ROOT, 'extension'), false);
await bundle('rolpusula-source-' + version + '.zip', await releaseFiles(ROOT), true);
await writeFile(path.join(ROOT, 'dist/SHA256SUMS.txt'), sums.join('\n') + '\n');
