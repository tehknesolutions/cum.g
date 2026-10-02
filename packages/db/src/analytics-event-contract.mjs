const EVENT_PROPERTIES = Object.freeze({
  lesson_started: new Set(['lessonId', 'programId']),
  lesson_completed: new Set(['lessonId', 'programId']),
  assessment_started: new Set(['assessmentId', 'instrumentVersion']),
  assessment_completed: new Set(['assessmentId', 'instrumentVersion']),
  offer_viewed: new Set(['offerId', 'placement']),
  checkout_started: new Set(['productId', 'offerId']),
});

const SENSITIVE_KEYS = new Set([
  'response','answer','freetext','controlmap','score','assessment',
  'privatestate','encryptedpayload','encryptedsnapshot','encryptedprivatestate',
  'reflection','dimension','safetysignal','privatesignals','controlmapvalue',
  'intimateresponse','healthstate','healthsignal',
]);

function assertNoSensitiveKeys(value, path = 'properties') {
  if (value === null || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    const normalized = key.replaceAll('_', '').toLowerCase();
    if (SENSITIVE_KEYS.has(normalized)) throw new TypeError(`Sensitive analytics property rejected: ${path}.${key}`);
    assertNoSensitiveKeys(nested, `${path}.${key}`);
  }
}

export function projectAnalyticsEvent(name, input = {}) {
  const allowlist = EVENT_PROPERTIES[name];
  if (!allowlist) throw new TypeError(`Analytics event not allowed: ${name}`);
  if (input === null || Array.isArray(input) || typeof input !== 'object') throw new TypeError('Analytics properties must be an object');
  assertNoSensitiveKeys(input);
  const properties = {};
  for (const [key, value] of Object.entries(input)) {
    if (!allowlist.has(key)) throw new TypeError(`Analytics property not allowed: ${key}`);
    if (value !== null && !['string','number','boolean'].includes(typeof value)) throw new TypeError(`Analytics property must be scalar: ${key}`);
    properties[key] = value;
  }
  return { name, properties };
}
