#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { initWorkspace, importJob, doctor, setWorkspaceProvider, getWorkspaceProvider } from './workspace.mjs';
import { PROVIDERS, providerConfig, launchSpec, localModels } from './providers.mjs';

const argv = process.argv.slice(2), command = argv.shift();
const HELP = [
  'RolPusula — kişisel başvuru çalışma alanı', '',
  'node bin/rolpusula.mjs providers',
  'node bin/rolpusula.mjs doctor [çalışma-klasörü]',
  'node bin/rolpusula.mjs init <yeni-klasör> [--provider claude|codex|gemini|ollama] [--model MODEL]',
  'node bin/rolpusula.mjs provider <çalışma-klasörü>',
  'node bin/rolpusula.mjs provider set <çalışma-klasörü> <sağlayıcı> [--model MODEL]',
  'node bin/rolpusula.mjs launch <çalışma-klasörü>',
  'node bin/rolpusula.mjs import <paket.rpjob.json> <çalışma-klasörü>', '',
  'Anahtar saklanmaz, paket kurulmaz ve başvuru gönderilmez.',
  'Kişisel çalışma klasörü dağıtım reposunun dışında olmalıdır.',
].join('\n');
function options(args) {
  const positional = [], out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' || args[i] === '--model') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(args[i] + ' için değer gerekli.');
      out[args[i].slice(2)] = args[++i];
    } else if (args[i].startsWith('--')) throw new Error('Bilinmeyen seçenek: ' + args[i]);
    else positional.push(args[i]);
  }
  return { positional, ...out };
}
function nextInstruction(provider, id = null) {
  const task = id ? 'apply-local ' + id : 'setup';
  if (provider === 'claude' || provider === 'gemini') return '/' + task;
  return '$rolpusula ' + task;
}
try {
  if (!command || command === '--help' || command === 'help') console.log(HELP);
  else if (command === 'providers' && argv.length === 0) {
    for (const [id, p] of Object.entries(PROVIDERS)) console.log(id.padEnd(8) + p.label + (p.cloud ? ' — bulut: ' + p.company : ' — cihaz içi; Codex ajan kabuğu + Ollama'));
    const models = localModels();
    console.log('\nBu cihazdaki yerel Ollama modelleri: ' + (models.length ? models.join(', ') : 'bulunamadı'));
  } else if (command === 'init') {
    const { positional, provider = 'claude', model = null } = options(argv);
    if (positional.length !== 1) throw new Error('init için tek bir yeni klasör yolu gerekli.');
    const selected = providerConfig(provider, model);
    const dir = await initWorkspace(positional[0], selected.provider, selected.model);
    console.log('Özel çalışma alanı oluşturuldu: ' + dir + '\nSeçilen AI: ' + PROVIDERS[selected.provider].label + (selected.model ? ' / ' + selected.model : '') + '\nBaşlatmak için: node bin/rolpusula.mjs launch "' + dir + '"\nİlk görev: ' + nextInstruction(selected.provider));
  } else if (command === 'provider' && argv[0] !== 'set' && argv.length === 1) {
    const { config } = await getWorkspaceProvider(argv[0]);
    console.log(PROVIDERS[config.provider].label + (config.model ? ' / ' + config.model : ' / varsayılan model'));
  } else if (command === 'provider' && argv.shift() === 'set') {
    const { positional, model = null } = options(argv);
    if (positional.length !== 2) throw new Error('provider set için çalışma klasörü ve sağlayıcı gerekli.');
    const config = await setWorkspaceProvider(positional[0], positional[1], model);
    console.log('AI seçimi kaydedildi: ' + PROVIDERS[config.provider].label + (config.model ? ' / ' + config.model : '') + '\nAnahtar veya oturum bilgisi kaydedilmedi.');
  } else if (command === 'doctor' && argv.length <= 1) {
    let selected = null;
    if (argv.length) selected = (await getWorkspaceProvider(argv[0])).config;
    const results = doctor(selected);
    for (const r of results) console.log((r.ok ? 'HAZIR   ' : r.required ? 'EKSİK   ' : 'OPSİYON ') + r.label + ': ' + r.detail);
    if (results.some(r => r.required && !r.ok)) process.exitCode = 1;
  } else if (command === 'launch' && argv.length === 1) {
    const { dir, config } = await getWorkspaceProvider(argv[0]);
    const spec = launchSpec(dir, config);
    console.log('Başlatılıyor: ' + PROVIDERS[config.provider].label + (config.model ? ' / ' + config.model : '') + '\nİlk görev: ' + nextInstruction(config.provider));
    const run = spawnSync(spec.command, spec.args, { cwd: spec.cwd, env: { ...process.env, ...spec.env }, stdio: 'inherit', windowsHide: false });
    if (run.error) throw new Error(PROVIDERS[config.provider].label + ' başlatılamadı: ' + run.error.message);
    if (run.status !== 0) process.exitCode = run.status ?? 1;
  } else if (command === 'import' && argv.length === 2) {
    const result = await importJob(argv[0], argv[1]);
    const { config } = await getWorkspaceProvider(argv[1]);
    console.log('Paket yalnızca diske alındı. AI servisine gönderilmedi.\nSeçili AI içinde şunu yazın:\n' + nextInstruction(config.provider, result.id) + '\nProfil pakette: ' + (result.includesProfile ? 'evet; kullanmadan önce doğrulanacak' : 'hayır; setup ile kendi profilinizi oluşturun'));
  } else throw new Error('Geçersiz komut veya argüman.\n' + HELP);
} catch (error) { console.error(error.message); process.exitCode = 1; }
