# CUM.G — P01 Vertical Slice Verification Ledger

**Program:** CUMG-P01 — Controle Ejaculatório  
**Scope:** V1 FREE educational vertical slice  
**Branch:** feat/m5-g2-database-contracts  
**Status:** IMPLEMENTED / SAFETY-HARDENED / RUNTIME VERIFICATION PENDING WHERE ENVIRONMENT IS REQUIRED

## PASS — static/contract implementation evidence

- [x] Adult + versioned-consent gate exists and fails closed.
- [x] Assessment instrument has 12 core questions and a hard maximum of 32 answers.
- [x] Assessment branching is deterministic and cycle-checked.
- [x] Control Map has exactly seven educational dimensions and no aggregate score/diagnosis field.
- [x] P01-L01 has all seven stages in order.
- [x] Provenance classes remain explicit: SCIENTIFIC / EXPERIENTIAL / SOCIAL / HNK.
- [x] Initial PRACTICE is explicitly non-sexual.
- [x] Private reflection storage is under `cumg_vault` with FORCE RLS.
- [x] Learning progress is not extended with private reflection payloads.
- [x] Safety guidance is resolved before premium offer in the web journey.
- [x] Entitlement gate independently refuses PREMIUM when a safety escalation is present.
- [x] FREE journey exposes meaningful Control Map/L01 value before offer.
- [x] Analytics allowlist contains only coarse P01 lifecycle identifiers and recursively rejects sensitive/private keys.
- [x] No real intimate/health fixtures are used by P01 tests.

## CURRENT GATE

The implementation is complete for the planned P01 vertical slice. The remaining gate is executable/runtime evidence; no implementation work is being blocked by the lack of a local runner.

## PENDING — requires runtime execution

- [x] CI workflow is configured to execute full Node test discovery on GitHub with Node 22.
- [x] CI workflow includes a focused P01 database/web test pass.
- [ ] Apply migration 007 to authorized FREE PostgreSQL staging.
- [ ] Prove user A cannot read/write user B `cumg_vault.reflections` under non-bypass authenticated runtime role.
- [ ] Verify RLS behavior with transaction-scoped `app.user_id`.
- [ ] Execute forward migration + rollback/reapply on disposable/staging database.
- [ ] Verify the full E2E journey against real package implementations rather than test doubles.

## TOOLING-BLOCKED / DEBT

- Production KMS/encryption authorization is deferred by design; the staging codec is an opaque serialization contract, not production encryption.
- Existing M5.G2 destructive-lifecycle/CI debt remains separate and must not be represented as cleared by P01 static implementation.

## Privacy invariant

`PUBLIC/MEDIA ≠ EDUCATION ≠ PRIVATE VAULT ≠ ANALYTICS/ADS`

Assessment answers, Control Maps, reflections and safety/private signals must never become generic analytics or advertising properties.

## Acceptance gate

P01 becomes runtime-verified only after the PENDING database and executable-suite checks are performed with fresh evidence. Static implementation completion is not substituted for runtime evidence.

- [x] CI workflow is configured to execute full Node test discovery on GitHub with Node 22.
- [x] CI workflow includes a focused P01 database/web test pass.
- [x] Current branch has no reported status checks for the inspected commit; CI PASS is therefore not asserted.

- [x] Canonical `verify.yml` supports manual dispatch and requests read-only repository permissions.
- [x] Latest inspected main commit still has no reported GitHub workflow/status evidence; CI PASS remains unasserted.
