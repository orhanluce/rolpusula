import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseFiles } from '../scripts/files.mjs';
import { ROOT } from '../bin/workspace.mjs';

test('source release contains the user guide', async () => {
  assert.ok((await releaseFiles(ROOT)).includes('KULLANIM_KILAVUZU.md'));
});
