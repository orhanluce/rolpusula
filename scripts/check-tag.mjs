import { readFile } from 'node:fs/promises';
const version = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
if (process.env.GITHUB_REF_NAME !== 'v' + version) throw new Error('Git tag must equal v' + version);
