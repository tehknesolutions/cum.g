export function recommendNextStep({ rules, controlMap, lessonState, consentState, instrumentVersion } = {}) {
  if (!rules?.version || !Array.isArray(rules.rules)) throw new Error('UNKNOWN_RECOMMENDATION_RULESET');
  if (consentState?.allowed !== true) throw new Error('CONSENT_REQUIRED');
  if (!instrumentVersion) throw new Error('INSTRUMENT_VERSION_REQUIRED');
  const rule = rules.rules.find((candidate) => {
    const when=candidate.when ?? {};
    if (typeof when.lessonComplete === 'boolean' && when.lessonComplete !== (lessonState?.status === 'COMPLETE')) return false;
    return true;
  });
  if (!rule) return { kind:'NONE', targetId:null, ruleId:null, explanationKey:null };
  return { kind:rule.kind, targetId:rule.targetId, ruleId:rule.id, explanationKey:rule.explanationKey };
}
