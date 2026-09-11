import { readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
export const RELEASE_ROOTS = ['extension', 'bin', 'scripts', 'tests', 'docs', 'assets', 'workspace-template', '.github',
  'package.json', 'package-lock.json', '.gitignore', '.gitattributes', 'AGENTS.md', 'README.md', 'README.en.md', 'KULLANIM_KILAVUZU.md', 'LICENSE', 'PRIVACY.md', 'SECURITY.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md', 'UPSTREAM.json', 'FONT-SOURCES.json'];
export async function walk(root, relative = '') {
  const location = path.join(root, relative);
  const info = await lstat(location);
  if (info.isSymbolicLink()) throw new Error('Symlinks are not distributable: ' + relative);
  if (info.isFile()) return [relative.replaceAll('\\', '/')];
  const result = [];
  for (const child of (await readdir(location)).sort()) result.push(...await walk(root, path.join(relative, child)));
  return result;
}
export async function releaseFiles(root) {
  const files = [];
  for (const entry of RELEASE_ROOTS) files.push(...await walk(root, entry));
  return files.sort();
}
