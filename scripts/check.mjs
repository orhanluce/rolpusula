import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT } from '../bin/workspace.mjs';
import { releaseFiles } from './files.mjs';
export async function check(root = ROOT) {
  const errors = [], files = await releaseFiles(root);
  const allowedEmail = /@(?:example\.(?:com|org|net)|latofonts\.com)$/i;
  for (const file of files) {
    if (/(^|\/)(node_modules|\.git|\.env[^/]*|settings\.local\.json|\.private)(\/|$)|\.(pdf|rpjob\.json|rpvault\.json|log|aux|zip)$/i.test(file)) errors.push('Private/build file in distribution: ' + file);
    if (/^workspace-template\/documents\/.*[^/]\.(?!md$|gitkeep$)/.test(file)) errors.push('Candidate document in template: ' + file);
    if (!/\.(md|mjs|ts|json|html|css|py|tex|txt|yml)$/.test(file)) continue;
    const body = await readFile(path.join(root, file), 'utf8');
    if (/[A-Za-z]:[\\/]Users[\\/][^<\[\s]+|\/Users\/[A-Za-z0-9_-]+\//.test(body)) errors.push('Personal absolute path: ' + file);
    // Concrete credentials only; regex source and placeholder strings are not credentials.
    if (/(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-ant-[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(body)) errors.push('Possible secret: ' + file);
    if (file.startsWith('workspace-template/.claude/skills/job-application-assistant/01-') || file === 'workspace-template/CLAUDE.md' || file === 'workspace-template/cv/main_example.tex') {
      if (!body.includes('[YOUR_NAME]')) errors.push('Personalized template: ' + file);
      const emails = body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
      if (emails.some(e => !allowedEmail.test(e))) errors.push('Non-example contact in profile: ' + file);
    }
  }
  const manifest = JSON.parse(await readFile(path.join(root, 'extension/manifest.json'), 'utf8'));
  if (manifest.manifest_version !== 3 || JSON.stringify([...manifest.permissions].sort()) !== JSON.stringify(['activeTab', 'scripting', 'storage'].sort())) errors.push('Permission boundary changed');
  for (const field of ['host_permissions', 'optional_host_permissions', 'content_scripts', 'externally_connectable', 'web_accessible_resources', 'background']) if (manifest[field]) errors.push('Unreviewed extension capability: ' + field);
  if (!manifest.content_security_policy.extension_pages.includes("connect-src 'none'")) errors.push('Network CSP is not closed');
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  if (packageJson.version !== manifest.version) errors.push('Package and extension versions differ');
  const geminiSettings = JSON.parse(await readFile(path.join(root, 'workspace-template/.gemini/settings.json'), 'utf8'));
  if (geminiSettings.telemetry?.enabled !== false || geminiSettings.telemetry?.logPrompts !== false) errors.push('Gemini telemetry defaults changed');
  if (geminiSettings.security?.disableYoloMode !== true || geminiSettings.security?.disableAlwaysAllow !== true) errors.push('Gemini confirmation boundary changed');
  for (const file of files.filter(f => f.startsWith('workspace-template/.gemini/commands/') && f.endsWith('.toml'))) {
    const body = await readFile(path.join(root, file), 'utf8');
    if (!body.includes('prompt = """') || body.includes('!{')) errors.push('Unsafe or malformed Gemini command: ' + file);
  }
  for (const file of files.filter(f => f.startsWith('extension/') && f.endsWith('.mjs'))) {
    const body = await readFile(path.join(root, file), 'utf8');
    if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|eval)\s*\(|\.innerHTML\s*=|storage\.sync|localStorage/.test(body)) errors.push('Unsafe extension API: ' + file);
  }
  const fonts = JSON.parse(await readFile(path.join(root, 'FONT-SOURCES.json'), 'utf8'));
  for (const font of fonts) {
    const actual = createHash('sha256').update(await readFile(path.join(root, font.file))).digest('hex');
    if (actual !== font.sha256) errors.push('Font hash changed: ' + font.file);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return files.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log('Distribution/privacy checks passed: ' + await check() + ' files.'); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
