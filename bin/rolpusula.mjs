#!/usr/bin/env node
import { initWorkspace, importJob, doctor } from './workspace.mjs';
const [command, ...args] = process.argv.slice(2);
const HELP = [
  'RolPusula — kişisel başvuru çalışma alanı',
  '',
  'node bin/rolpusula.mjs doctor',
  'node bin/rolpusula.mjs init <yeni-klasör>',
  'node bin/rolpusula.mjs import <paket.rpjob.json> <çalışma-klasörü>',
  '',
  'Bu araç AI servisine bağlanmaz, paket kurmaz, başvuru göndermez.',
  'Kişisel çalışma klasörü dağıtım reposunun dışında olmalıdır.',
].join('\n');
try {
  if (!command || command === '--help' || command === 'help') console.log(HELP);
  else if (command === 'doctor' && args.length === 0) {
    const results = doctor();
    for (const r of results) console.log((r.ok ? 'HAZIR   ' : 'EKSİK   ') + r.label + ': ' + r.detail);
    if (results.some(r => !r.ok)) process.exitCode = 1;
  } else if (command === 'init' && args.length === 1) {
    const dir = await initWorkspace(args[0]);
    console.log('Özel çalışma alanı oluşturuldu: ' + dir + '\nBu klasörde claude çalıştırıp /setup yazın.\nClaude kullanıldığında sağladığınız metinler Anthropic tarafından işlenir. Ayrıntılar: PRIVACY.md.');
  } else if (command === 'import' && args.length === 2) {
    const result = await importJob(args[0], args[1]);
    console.log('Paket yalnızca diske alındı. AI servisine gönderilmedi.\nÇalışma klasöründe Claude Code açın ve şunu yazın:\n/apply-local ' + result.id + '\nProfil pakette: ' + (result.includesProfile ? 'evet; kullanmadan önce doğrulanacak' : 'hayır; /setup ile kendi profilinizi oluşturun'));
  } else throw new Error('Geçersiz komut veya argüman.\n' + HELP);
} catch (error) { console.error(error.message); process.exitCode = 1; }
