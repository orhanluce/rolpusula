// Maintainer utility: import committed template files, never a user's working tree.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [repo, revision] = process.argv.slice(2);
if (!repo || !/^[a-f0-9]{40}$/.test(revision ?? '')) throw new Error('Usage: node scripts/vendor.mjs <repo> <full-commit>');
const target = path.join(root, 'workspace-template');
try { await access(target); throw new Error('Template exists; refusing to overwrite'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const names = execFileSync('git', ['-C', repo, 'ls-tree', '-r', '--name-only', revision], { encoding: 'utf8' }).trim().split('\n');
const allowed = /^(\.claude\/|\.agents\/|tools\/|cv\/|cover_letters\/|documents\/|templates\/|company_research\/|job_scraper\/|upskill\/|LICENSE$|SETUP.md$|README.md$|salary_lookup.py$|AGENTS.md$|CLAUDE.md$|\.gitignore$)/;
for (const name of names.filter(n => allowed.test(n))) {
  if (name.includes('..') || path.isAbsolute(name)) throw new Error('Unsafe vendor path');
  const destination = path.join(target, name);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, execFileSync('git', ['-C', repo, 'show', `${revision}:${name}`], { maxBuffer: 20_000_000 }));
}
await writeFile(path.join(root, 'UPSTREAM.json'), JSON.stringify({ repository: 'https://github.com/MadsLorentzen/ai-job-search', commit: revision, method: 'git committed blobs, never working-tree content', modifications: ['RolPusula private-workspace boundary and local import command'] }, null, 2) + '\n');
console.log('Committed template exported. Review before redistribution.');
