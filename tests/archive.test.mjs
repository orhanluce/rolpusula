import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, zip } from '../scripts/zip.mjs';
test('release ZIP is deterministic, UTF-8, CRC protected, and rejects traversal', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
  const entries = [{ name: 'eklenti/İlan.txt', data: 'Tamamen örnek' }];
  const a = zip(entries), b = zip(entries);
  assert.deepEqual(a, b);
  assert.equal(a.readUInt32LE(0), 0x04034b50);
  assert.equal(a.readUInt16LE(6), 0x800);
  assert.equal(a.readUInt32LE(a.length - 22), 0x06054b50);
  for (const name of ['../private', '/absolute', 'C:/private', 'x/../../private']) assert.throws(() => zip([{ name, data: '' }]));
});
