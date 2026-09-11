// Only the shipped placeholder templates; no candidate documents are discovered.
import { mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../bin/workspace.mjs';
const base = path.join(ROOT, 'test-output', 'pdf');
await mkdir(base, { recursive: true });
const output = await mkdtemp(path.join(base, 'smoke-'));
const windows = process.platform === 'win32';
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120_000, windowsHide: true });
  if (result.status !== 0) {
    console.error(command + ' failed. Check the TeX installation and logs in ' + output);
    console.error(result.error?.message || result.stderr || result.stdout);
    process.exit(1);
  }
}
for (const [folder, engine, name, pages] of [
  ['cv', 'lualatex', 'main_example', null],
  ['cover_letters', 'xelatex', 'cover_example', 1],
]) {
  const cwd = path.join(ROOT, 'workspace-template', folder);
  for (let pass = 0; pass < 2; pass++) run(engine, ['-no-shell-escape', '-halt-on-error', '-interaction=batchmode', '-output-directory=' + output, name + '.tex'], cwd);
  const args = [...(windows ? ['-3'] : []), path.join(ROOT, 'workspace-template/tools/verify_pdf.py'), path.join(output, name + '.pdf'), '--min-chars', '500'];
  if (pages) args.push('--pages', String(pages));
  run(windows ? 'py' : 'python3', args, ROOT);
  console.log('PASS ' + name + ': compilation and text layer.');
}
console.log('Render and visually inspect both PDFs before release: ' + output);
