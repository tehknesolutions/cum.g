export function evaluateEntitlement({ productId, entitlements = [], resourceTier } = {}) {
  if (!productId || !resourceTier) throw new Error('INVALID_ENTITLEMENT_REQUEST');
  if (resourceTier === 'FREE') return { allowed:true, reason:'FREE_ACCESS' };
  const allowed=entitlements.some((entry)=>entry?.productId===productId && entry?.active===true);
  return { allowed, reason:allowed?'ENTITLED':'PREMIUM_REQUIRED' };
}
