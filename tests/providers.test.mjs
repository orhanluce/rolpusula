import test from 'node:test';
import assert from 'node:assert/strict';
import { providerConfig, validateProviderConfig, launchSpec } from '../bin/providers.mjs';

test('provider settings are strict and local mode rejects cloud model names', () => {
  assert.deepEqual(providerConfig('gemini'), {
    format: 'rolpusula-provider', version: 1, provider: 'gemini', model: null,
  });
  assert.throws(() => providerConfig('unknown'), /claude, codex, gemini/);
  assert.throws(() => providerConfig('ollama'), /--model/);
  assert.throws(() => providerConfig('ollama', 'gpt-oss:120b-cloud'), /bulut model/);
  assert.throws(() => providerConfig('codex', 'bad model;rm'), /geçersiz/);
  assert.throws(() => providerConfig('ollama', 'namespace/../model'), /geçersiz/);
  assert.throws(() => validateProviderConfig({ format: 'rolpusula-provider', version: 1, provider: 'codex', model: null, apiKey: 'x' }), /geçersiz/);
});

test('launch specs constrain MCP, web, sandbox and approval settings', () => {
  const cwd = process.cwd();
  const codex = launchSpec(cwd, providerConfig('codex', 'gpt-5'));
  assert.equal(codex.command, 'codex');
  assert.ok(codex.args.includes('mcp_servers={}'));
  assert.ok(codex.args.includes('web_search="disabled"'));
  assert.ok(codex.args.includes('workspace-write'));
  assert.ok(codex.args.includes('on-request'));
  assert.ok(!codex.args.includes('--search'));
  assert.doesNotMatch(codex.args.join(' '), /dangerously|bypass/i);

  const local = launchSpec(cwd, providerConfig('ollama', 'fictional-local:8b'));
  assert.equal(local.command, 'codex');
  assert.ok(local.args.includes('--oss'));
  assert.deepEqual(local.args.slice(-4), ['--local-provider', 'ollama', '--model', 'fictional-local:8b']);

  const gemini = launchSpec(cwd, providerConfig('gemini'));
  assert.equal(gemini.env.GEMINI_TELEMETRY_ENABLED, 'false');
  assert.equal(gemini.env.GEMINI_TELEMETRY_LOG_PROMPTS, 'false');

  const claude = launchSpec(cwd, providerConfig('claude'));
  assert.ok(claude.args.includes('--strict-mcp-config'));
  assert.ok(claude.args.includes('{"mcpServers":{}}'));
});
