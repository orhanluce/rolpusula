// Maintainer-only download of public, unmodified OFL fonts at a pinned commit.
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT } from '../bin/workspace.mjs';
const revision = '5d3b76120a319730fda218cc7410174a462b32cb';
const base = 'https://raw.githubusercontent.com/google/fonts/' + revision + '/ofl/';
const directory = path.join(ROOT, 'workspace-template/cover_letters/OpenFonts/fonts');
const aliases = {
  'Lato-Bla.ttf': 'Lato-Black.ttf', 'Lato-BlaIta.ttf': 'Lato-BlackItalic.ttf',
  'Lato-Bol.ttf': 'Lato-Bold.ttf', 'Lato-BolIta.ttf': 'Lato-BoldItalic.ttf',
  'Lato-Hai.ttf': 'Lato-Thin.ttf', 'Lato-HaiIta.ttf': 'Lato-ThinItalic.ttf',
  'Lato-Lig.ttf': 'Lato-Light.ttf', 'Lato-LigIta.ttf': 'Lato-LightItalic.ttf',
  'Lato-Reg.ttf': 'Lato-Regular.ttf', 'Lato-RegIta.ttf': 'Lato-Italic.ttf',
};
const provenance = [];
async function download(relative, destination) {
  const response = await fetch(base + relative, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error('Font download failed: ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (destination.endsWith('.ttf') && bytes.readUInt32BE(0) !== 0x00010000) throw new Error('Not a TrueType font');
  await writeFile(destination, bytes);
  provenance.push({ source: base + relative, file: path.relative(ROOT, destination).replaceAll('\\', '/'), sha256: createHash('sha256').update(bytes).digest('hex') });
}
await Promise.all(Object.entries(aliases).map(([alias, original]) => download('lato/' + original, path.join(directory, 'lato', alias))));
await download('lato/OFL.txt', path.join(directory, 'lato/OFL.txt'));
await download('raleway/OFL.txt', path.join(directory, 'raleway/OFL.txt'));
await writeFile(path.join(ROOT, 'FONT-SOURCES.json'), JSON.stringify(provenance.sort((a, b) => a.file.localeCompare(b.file)), null, 2) + '\n');
console.log('Fonts and OFL licenses downloaded, source hashes recorded.');
