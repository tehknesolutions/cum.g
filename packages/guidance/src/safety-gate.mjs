export function evaluateSafety({ ruleSet, privateSignals } = {}) {
  if (!ruleSet?.version || !Array.isArray(ruleSet.rules)) throw new Error('UNKNOWN_SAFETY_RULESET');
  if (!privateSignals || typeof privateSignals !== 'object') return { escalated:false, guidanceKey:null, ruleId:null };
  const matches = ruleSet.rules.filter((rule) => privateSignals[rule.signal] === true);
  if (!matches.length) return { escalated:false, guidanceKey:null, ruleId:null };
  matches.sort((a,b)=>(b.priority??0)-(a.priority??0));
  const rule=matches[0];
  return { escalated:true, guidanceKey:rule.guidanceKey, ruleId:rule.id };
}
