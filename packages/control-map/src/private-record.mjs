const MAX_PRIVATE_RECORD_BYTES = 64 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function assertPlainJsonValue(value, seen = new Set()) {
  if (value === null) return;
  const type = typeof value;
  if (type === 'string' || type === 'boolean') return;
  if (type === 'number' && Number.isFinite(value)) return;
  if (type !== 'object') throw new Error('INVALID_PRIVATE_RECORD');
  if (seen.has(value)) throw new Error('INVALID_PRIVATE_RECORD');
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) assertPlainJsonValue(item, seen);
  } else {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw new Error('INVALID_PRIVATE_RECORD');
    for (const item of Object.values(value)) assertPlainJsonValue(item, seen);
  }
  seen.delete(value);
}

export function encodePrivateRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('INVALID_PRIVATE_RECORD');
  assertPlainJsonValue(record);
  let json;
  try {
    json = JSON.stringify(record);
  } catch {
    throw new Error('INVALID_PRIVATE_RECORD');
  }
  const bytes = encoder.encode(json);
  if (bytes.byteLength > MAX_PRIVATE_RECORD_BYTES) throw new Error('PRIVATE_RECORD_TOO_LARGE');
  return bytes;
}

export function decodePrivateRecord(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0 || bytes.byteLength > MAX_PRIVATE_RECORD_BYTES) throw new Error('INVALID_PRIVATE_RECORD');
  try {
    const value = JSON.parse(decoder.decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    assertPlainJsonValue(value);
    return value;
  } catch {
    throw new Error('INVALID_PRIVATE_RECORD');
  }
}
