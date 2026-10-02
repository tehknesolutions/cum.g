import test from 'node:test';
import assert from 'node:assert/strict';
import { encodePrivateRecord, decodePrivateRecord } from '../../packages/control-map/src/private-record.mjs';

const fixture = {
  kind: 'P01_REFLECTION',
  version: 1,
  reflectionKey: 'SYNTHETIC_FIXTURE_ONLY',
  controlMapVersion: '1.0.0',
};

test('opaque staging codec round-trips a synthetic private record', () => {
  const encoded = encodePrivateRecord(fixture);
  assert.ok(encoded instanceof Uint8Array);
  assert.deepEqual(decodePrivateRecord(encoded), fixture);
});

test('codec rejects unsupported and oversized private records', () => {
  assert.throws(() => encodePrivateRecord(null), /INVALID_PRIVATE_RECORD/);
  assert.throws(() => encodePrivateRecord({ value: BigInt(1) }), /INVALID_PRIVATE_RECORD/);
  assert.throws(() => encodePrivateRecord({ value: 'x'.repeat(70_000) }), /PRIVATE_RECORD_TOO_LARGE/);
});

test('private record codec never emits a generic analytics event envelope', () => {
  const decoded = decodePrivateRecord(encodePrivateRecord(fixture));
  assert.equal(Object.hasOwn(decoded, 'eventName'), false);
  assert.equal(Object.hasOwn(decoded, 'properties'), false);
});
