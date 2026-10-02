# P01 Educational Vertical Slice V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable FREE educational journey for `CUMG-P01`, from 18+/consent through adaptive assessment, seven-dimension Control Map, complete P01-L01, private reflection, explainable next step, and premium offer.

**Architecture:** Keep the existing modular-monolith direction and add focused pure Node.js domain packages for assessment, Control Map, learning runtime, safety/recommendation, and entitlement. Public/versioned definitions live under `content/courses/CUMG-P01`; intimate answers and derived private snapshots remain behind the existing `cumg_vault` boundary, while generic analytics stays fail-closed. The web vertical slice composes these domain interfaces rather than embedding scoring, safety, or entitlement logic in UI code.

**Tech Stack:** Node.js 22 ESM, built-in `node:test`, pnpm 10.17.1 workspace, PostgreSQL 16+/Supabase FREE staging, existing SQL domain migrations, JSON-authored course/instrument content.

**Spec:** `docs/superpowers/specs/2026-10-02-p01-vertical-slice-design.md`

## Global Constraints

- Explicit adult sexual-education flow is 18+.
- Education is not diagnosis or medical treatment.
- Essential safety and professional-care guidance is never paywalled.
- `SCIENTIFIC` is the factual/evidential authority; `EXPERIENTIAL`, `SOCIAL`, and `HNK` remain visibly distinct complementary classes.
- HNK content is not scientific evidence unless separately supported by qualifying scientific evidence.
- Private assessment answers, Control Maps, and private reflections remain only in `cumg_vault` storage paths.
- `ADS ←X→ VAULT`: advertising and generic analytics never receive intimate answers, maps, scores/states, or reflections.
- Assessment V1 is versioned and deterministic, with ~12 core questions and an absolute maximum of 32 questions.
- Control Map V1 has exactly seven dimensions and no aggregate sexual-performance score or diagnostic label.
- P01-L01 follows `LEARN → OBSERVE → PRACTICE → RECORD → REFLECT → COMPARE → ADVANCE` and its first guided practice is non-sexual.
- FREE includes 18+/consent, initial Assessment, basic Control Map, complete P01-L01, and essential safety/professional-care guidance before the premium offer.
- PREMIUM V1 is a one-time per-program entitlement; subscription is deferred.
- Development/staging remains FREE-FIRST and uses no real intimate/health user fixtures.
- M5.G2 remains `VERIFIED EXCEPT DESTRUCTIVE LIFECYCLE GATE`; this plan must not rewrite that debt as complete.
- Production KMS and production launch authorization are outside this plan.

## Review Focus

1. Missing/revoked/wrong-version consent must block assessment start before any intimate answer is accepted — pinned in Task 2.
2. Malformed or cyclic branch definitions must fail closed and the runtime must never exceed 32 answered questions — pinned in Task 3.
3. Partial/malformed answer sets must return an incomplete Control Map rather than fabricate one or collapse to a single score — pinned in Task 4.
4. A safety escalation and a premium gate occurring together must return safety guidance first and never hide it behind entitlement — pinned in Task 7.
5. Any nested private reflection/map/answer accidentally passed toward generic analytics must still be rejected — pinned in Task 8.

---

## File Structure

- `packages/access/src/adult-consent-gate.mjs` — pure 18+/versioned-consent eligibility decision.
- `packages/assessment/src/instrument.mjs` — instrument loading/validation.
- `packages/assessment/src/session.mjs` — deterministic adaptive assessment state machine.
- `packages/control-map/src/control-map.mjs` — seven-dimension private-map calculation.
- `packages/learning/src/lesson-runtime.mjs` — provenance-aware lesson sequencing and progression.
- `packages/guidance/src/safety-gate.mjs` — deterministic safety escalation rules.
- `packages/guidance/src/recommendation-engine.mjs` — explainable educational next-step rules.
- `packages/commerce/src/entitlement-gate.mjs` — FREE/PREMIUM access decision without intimate inputs.
- `packages/db/migrations/007_p01_vertical_slice.sql` — minimal persistence additions for age/consent version and private reflection/snapshot lifecycle where existing M5.G2 tables are insufficient.
- `packages/db/rollback/007_p01_vertical_slice.down.sql` — exact rollback peer for 007.
- `content/courses/CUMG-P01/assessment/control-map-v1.json` — versioned ~12-core / ≤32-question instrument.
- `content/courses/CUMG-P01/lessons/P01-L01.json` — complete L01 block sequence with provenance metadata.
- `content/courses/CUMG-P01/guidance/safety-v1.json` — non-diagnostic escalation rules and copy keys.
- `content/courses/CUMG-P01/guidance/recommendations-v1.json` — explainable next-step rules.
- `apps/web/src/p01/free-journey.mjs` — application orchestration for the FREE vertical slice.
- `tests/p01/*.test.mjs` — focused unit/contract tests.
- `tests/p01/free-journey.e2e.test.mjs` — in-process end-to-end contract for the vertical slice.
- `tests/db/p01-vertical-slice-contract.test.mjs` — static migration/privacy contract.
- `package.json` and `.github/workflows/verify.yml` — make the full nested Node test suite discoverable.

### Task 1: Repair the verification baseline before adding new product behavior

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/verify.yml`
- Modify: `tests/db/migration-lifecycle.test.mjs`
- Modify: `packages/db/rollback/004_vault.down.sql`
- Modify: `packages/db/README.md`

**Interfaces:**
- Consumes: existing Node 22 test suite and M5.G2 migration tree.
- Produces: `pnpm test` as the single recursive contract-test command; rollback documentation consistently names `cumg_vault` and includes `005b`.

- [ ] **Step 1: Write/adjust the failing lifecycle assertions** so the migration test expects `cumg_vault`, recognizes `005b_vault_runtime_grants.sql` and its rollback peer, and no longer hard-codes exactly six forward/rollback files.
- [ ] **Step 2: Run `node --test tests/db/migration-lifecycle.test.mjs`**; expect FAIL because `004_vault.down.sql` still targets the obsolete Supabase-owned `vault` namespace.
- [ ] **Step 3: Fix the baseline**: change `004_vault.down.sql` to drop only `cumg_vault.*`/`cumg_vault`; update `packages/db/README.md` forward/rollback order to include `005b`; change root `test` to `node --test tests/**/*.test.mjs`; make `.github/workflows/verify.yml` run `pnpm test`.
- [ ] **Step 4: Run `pnpm test`**; expect all existing static tests PASS. If Issue #4 still prevents GitHub-hosted execution, record that as infrastructure debt rather than converting it to a product failure.
- [ ] **Step 5: Commit** with `fix(verify): align M5.G2 baseline with cumg vault`.

### Task 2: Adult and versioned-consent gate

**Files:**
- Create: `packages/access/src/adult-consent-gate.mjs`
- Create: `tests/p01/adult-consent-gate.test.mjs`
- Create: `packages/db/migrations/007_p01_vertical_slice.sql`
- Create: `packages/db/rollback/007_p01_vertical_slice.down.sql`
- Create: `tests/db/p01-vertical-slice-contract.test.mjs`

**Interfaces:**
- Consumes: `identity.users`, `identity.consent_receipts`.
- Produces: `evaluateAdultConsent({ ageConfirmed, consentReceipt, requiredConsentType, requiredPolicyVersion }) -> { allowed: boolean, reason: string }`.
- Produces persistence fields sufficient to record an explicit 18+ confirmation receipt/version without storing intimate answers in `identity`.

- [ ] **Step 1: Write failing tests** asserting: age not confirmed → `AGE_REQUIRED`; missing consent → `CONSENT_REQUIRED`; revoked consent → `CONSENT_REVOKED`; wrong policy version/type → blocked; valid 18+ + active matching receipt → `allowed: true`.
- [ ] **Step 2: Run `node --test tests/p01/adult-consent-gate.test.mjs tests/db/p01-vertical-slice-contract.test.mjs`**; expect FAIL because the module/migration do not exist.
- [ ] **Step 3: Implement `evaluateAdultConsent(...)`** as a pure fail-closed decision and add the minimal 007 SQL additions required to represent the 18+ gate/versioned consent contract; do not add intimate answer fields to `identity`.
- [ ] **Step 4: Run the two tests**; expect PASS.
- [ ] **Step 5: Commit** with `feat(access): add adult consent gate`.

### Task 3: Versioned adaptive Assessment Engine

**Files:**
- Create: `content/courses/CUMG-P01/assessment/control-map-v1.json`
- Create: `packages/assessment/src/instrument.mjs`
- Create: `packages/assessment/src/session.mjs`
- Create: `tests/p01/assessment-engine.test.mjs`

**Interfaces:**
- Consumes: approved adult/consent decision from Task 2 and the JSON instrument.
- Produces: `loadInstrument(raw) -> Instrument`; `startAssessment({ instrument, accessDecision }) -> AssessmentState`; `answerQuestion(state, { questionCode, value }) -> AssessmentState`; `nextQuestion(state) -> Question | null`.
- `AssessmentState` exposes instrument code/version, ordered answered question codes, status (`IN_PROGRESS|COMPLETE|ERROR`), and error reason; it never exposes an analytics projection.

- [ ] **Step 1: Author failing tests and fixture expectations** for exactly 12 core question definitions, stable question codes, seven-dimension mappings, deterministic optional branches, a normal 12-question completion path, at least one adaptive path, unknown version rejection, unknown question rejection, malformed branch rejection, cycle detection, and an absolute 32-answer guard.
- [ ] **Step 2: Run `node --test tests/p01/assessment-engine.test.mjs`**; expect FAIL because instrument/runtime are absent.
- [ ] **Step 3: Create `control-map-v1.json`** with public question definitions only: code, version, purpose, allowed response domain, dimension mapping, and deterministic branch metadata. Do not include user answers or partner-identifying fields.
- [ ] **Step 4: Implement `loadInstrument`, `startAssessment`, `answerQuestion`, and `nextQuestion`** with fail-closed validation and deterministic branching; reject start unless `accessDecision.allowed === true`.
- [ ] **Step 5: Run the assessment tests**; expect PASS and prove no path exceeds 32 answers.
- [ ] **Step 6: Commit** with `feat(assessment): add adaptive P01 instrument`.

### Task 4: Seven-dimension Control Map Engine

**Files:**
- Create: `packages/control-map/src/control-map.mjs`
- Create: `tests/p01/control-map.test.mjs`

**Interfaces:**
- Consumes: a COMPLETE Task-3 `AssessmentState`, instrument dimension mappings, and authorized private answer values supplied by the caller.
- Produces: `buildControlMap({ instrument, assessmentState, answers }) -> { status: 'COMPLETE'|'INCOMPLETE', instrumentVersion, dimensions, missingQuestionCodes }`.
- `dimensions` has exactly `bodyAwareness`, `arousalAwareness`, `selfRegulation`, `mentalAttention`, `emotionalResponse`, `contextCommunication`, `perceivedConfidence`; each value is a bounded educational dimension result plus interpretation key. No aggregate score is produced.

- [ ] **Step 1: Write failing tests** for deterministic output from a fixed answer set, exactly seven dimension keys, absence of aggregate `score`/diagnosis fields, bounded dimension values, and partial/malformed inputs returning `INCOMPLETE` with explicit missing codes instead of invented values.
- [ ] **Step 2: Run `node --test tests/p01/control-map.test.mjs`**; expect FAIL.
- [ ] **Step 3: Implement `buildControlMap(...)`** using only the versioned mappings in the instrument; interpretation output must be educational copy keys, not diagnostic labels.
- [ ] **Step 4: Run the Control Map tests**; expect PASS.
- [ ] **Step 5: Commit** with `feat(control-map): add seven-dimension map engine`.

### Task 5: Provenance-aware P01-L01 runtime

**Files:**
- Create: `content/courses/CUMG-P01/lessons/P01-L01.json`
- Create: `packages/learning/src/lesson-runtime.mjs`
- Create: `tests/p01/lesson-runtime.test.mjs`

**Interfaces:**
- Consumes: L01 JSON blocks and existing provenance vocabulary `SCIENTIFIC|EXPERIENTIAL|SOCIAL|HNK`.
- Produces: `loadLesson(raw) -> Lesson`; `createLessonSession(lesson) -> LessonSession`; `advanceLesson(session, action) -> LessonSession`.
- Each content block exposes `stage`, `provenanceClass`, and claim/source reference metadata when applicable.

- [ ] **Step 1: Write failing tests** asserting the exact stage order `LEARN, OBSERVE, PRACTICE, RECORD, REFLECT, COMPARE, ADVANCE`; all four provenance classes remain distinct; SCIENTIFIC blocks require claim references; the PRACTICE block is explicitly `nonSexual: true`; invalid provenance or missing scientific claim reference fails closed.
- [ ] **Step 2: Run `node --test tests/p01/lesson-runtime.test.mjs`**; expect FAIL.
- [ ] **Step 3: Author `P01-L01.json`** as the complete structural lesson contract with copy keys/claim references rather than unsupported scientific assertions; preserve source traceability for later editorial population.
- [ ] **Step 4: Implement lesson loading/progression** so stages cannot be silently skipped and provenance metadata survives to the renderer.
- [ ] **Step 5: Run the lesson tests**; expect PASS.
- [ ] **Step 6: Commit** with `feat(learning): add provenance-aware P01 L01 runtime`.

### Task 6: Private reflection and Control Map snapshot lifecycle

**Files:**
- Modify: `packages/db/migrations/007_p01_vertical_slice.sql`
- Modify: `packages/db/rollback/007_p01_vertical_slice.down.sql`
- Modify: `tests/db/p01-vertical-slice-contract.test.mjs`
- Create: `packages/control-map/src/private-record.mjs`
- Create: `tests/p01/private-record.test.mjs`

**Interfaces:**
- Consumes: existing `cumg_vault.assessments`, `cumg_vault.control_maps`, `cumg_vault.training_sessions`, Task-4 map result.
- Produces: `encodePrivateRecord(record) -> Uint8Array`; `decodePrivateRecord(bytes) -> object` for staging/test opaque serialization only; production KMS remains explicitly deferred.
- Produces 007 SQL support for private reflection records owned by `user_id` under RLS, without adding reflection text to `learning.progress` or analytics tables.

- [ ] **Step 1: Extend failing DB/static tests** to require a `cumg_vault` private-reflection structure with `user_id`, encrypted/opaque `bytea` payload, RLS enable+force/policy, and a rollback peer; assert no reflection/free-text payload is added to `learning.progress`.
- [ ] **Step 2: Write failing codec tests** for deterministic round-trip of a synthetic non-real fixture and rejection of unsupported values/oversized records; assert encoded private state is never a generic analytics event.
- [ ] **Step 3: Run `node --test tests/db/p01-vertical-slice-contract.test.mjs tests/p01/private-record.test.mjs`**; expect FAIL.
- [ ] **Step 4: Implement the 007 private-reflection persistence/RLS additions and staging codec**. Document clearly that this is an opaque application payload contract, not production KMS authorization.
- [ ] **Step 5: Run the tests**; expect PASS.
- [ ] **Step 6: Commit** with `feat(vault): add private P01 reflection lifecycle`.

### Task 7: Safety, recommendation, and entitlement precedence

**Files:**
- Create: `content/courses/CUMG-P01/guidance/safety-v1.json`
- Create: `content/courses/CUMG-P01/guidance/recommendations-v1.json`
- Create: `packages/guidance/src/safety-gate.mjs`
- Create: `packages/guidance/src/recommendation-engine.mjs`
- Create: `packages/commerce/src/entitlement-gate.mjs`
- Create: `tests/p01/guidance-entitlement.test.mjs`

**Interfaces:**
- Produces: `evaluateSafety({ ruleSet, privateSignals }) -> { escalated, guidanceKey, ruleId }`.
- Produces: `recommendNextStep({ rules, controlMap, lessonState, consentState, instrumentVersion }) -> { kind, targetId, ruleId, explanationKey }`.
- Produces: `evaluateEntitlement({ productId, entitlements, resourceTier }) -> { allowed, reason }`.
- Entitlement functions must not accept assessment answers, Control Map snapshots, or private reflections.

- [ ] **Step 1: Write failing tests** for deterministic recommendation output, unknown rule/version fail-closed behavior, FREE access to P01-L01/basic map/safety guidance, PREMIUM gate for later premium resources, and the key collision case: `safety.escalated === true` plus missing premium entitlement still returns safety guidance before any paywall result.
- [ ] **Step 2: Run `node --test tests/p01/guidance-entitlement.test.mjs`**; expect FAIL.
- [ ] **Step 3: Author minimal deterministic safety/recommendation rule JSON** using non-diagnostic guidance keys and explicit rule IDs; do not encode medical diagnosis logic or unsupported clinical thresholds.
- [ ] **Step 4: Implement the three pure engines** with safety precedence and no intimate input to entitlement.
- [ ] **Step 5: Run the guidance tests**; expect PASS.
- [ ] **Step 6: Commit** with `feat(guidance): add safety-first next-step rules`.

### Task 8: Keep analytics fail-closed for the new journey

**Files:**
- Modify: `packages/db/src/analytics-event-contract.mjs`
- Modify: `tests/db/analytics-boundary.test.mjs`

**Interfaces:**
- Consumes: existing `projectAnalyticsEvent(name, input)`.
- Produces: only the minimum coarse events needed by the FREE journey; no answer-, map-, reflection-, safety-signal-, or assessment-content fields.

- [ ] **Step 1: Extend failing tests** for the minimum new coarse lifecycle events selected during implementation (for example `assessment_started`/`assessment_completed`) using IDs/version only; add nested rejection cases for `reflection`, `dimension`, `safetySignal`, `privateSignals`, and synonyms introduced by Tasks 3–7.
- [ ] **Step 2: Run `node --test tests/db/analytics-boundary.test.mjs`**; expect FAIL for new allowed lifecycle events while sensitive nested fields remain rejected.
- [ ] **Step 3: Extend the allowlist minimally** and expand sensitive-key normalization only as required by the new domain vocabulary. Do not add a generic metadata escape hatch.
- [ ] **Step 4: Run the analytics test**; expect PASS.
- [ ] **Step 5: Commit** with `feat(privacy): extend fail-closed P01 analytics`.

### Task 9: Compose the FREE journey in the web application boundary

**Files:**
- Create: `apps/web/src/p01/free-journey.mjs`
- Create: `tests/p01/free-journey.e2e.test.mjs`
- Modify: `apps/web/product.manifest.json`
- Modify: `content/courses/CUMG-P01/course.json`

**Interfaces:**
- Consumes: Tasks 2–8 interfaces.
- Produces: `createP01FreeJourney(deps) -> Journey`; `Journey.dispatch(event) -> JourneyState`.
- Journey states cover `ENTRY`, `AGE_CONSENT`, `ASSESSMENT`, `CONTROL_MAP`, `L01`, `REFLECTION`, `MAP_UPDATE`, `NEXT_STEP`, `OFFER`, `SAFETY_GUIDANCE`, `BLOCKED`, `ERROR`.

- [ ] **Step 1: Write the failing E2E contract** for an adult synthetic user completing consent → 12-core or adaptive Assessment → initial seven-dimension map → complete L01 stages → private reflection → map update → explainable next step → premium offer. Assert meaningful FREE result exists before `OFFER`.
- [ ] **Step 2: Add negative E2E assertions** for missing consent, unknown instrument version, safety escalation overriding offer, attempted private-data analytics emission, and incomplete Control Map recovery.
- [ ] **Step 3: Run `node --test tests/p01/free-journey.e2e.test.mjs`**; expect FAIL because orchestration is absent.
- [ ] **Step 4: Implement `createP01FreeJourney(deps)` and `Journey.dispatch(event)`** as orchestration only; scoring, safety, provenance, and entitlement decisions must remain in their domain packages.
- [ ] **Step 5: Reconcile manifests** so V0.1 reflects the approved journey `entry → age/consent → assessment → control-map → P01-L01 → reflection/map-update → next-step → offer`, while preserving P02/P03 and full premium curriculum as deferred.
- [ ] **Step 6: Run the E2E test and `pnpm test`**; expect zero failures in the executable Node suite.
- [ ] **Step 7: Commit** with `feat(web): compose P01 free vertical slice`.

### Task 10: PostgreSQL staging gate and verification ledger

**Files:**
- Create: `docs/execution/P01-VERTICAL-SLICE-LEDGER.md`
- Modify only if evidence requires: `docs/execution/M5-G2-LEDGER.md`

**Interfaces:**
- Consumes: 007 migration/rollback, existing Supabase FREE staging, existing `authenticated` non-bypass runtime role.
- Produces: fresh evidence classification for the P01 slice; no claim of production readiness.

- [ ] **Step 1: Apply `007_p01_vertical_slice.sql` to the dedicated FREE staging project** and record exact result. Do not use real intimate/health data.
- [ ] **Step 2: Execute transaction-scoped synthetic A/B tests** proving user A cannot read/write user B private reflection/map state under `authenticated` with `rolbypassrls=false`; roll fixtures back.
- [ ] **Step 3: Execute consent/entitlement persistence checks** with synthetic fixtures and confirm safety data is not coupled to entitlement records.
- [ ] **Step 4: Execute a private-data boundary probe** confirming generic analytics has no database path/table containing answer/map/reflection payloads.
- [ ] **Step 5: Run the full Node suite in an available runner**. If GitHub Actions Issue #4 still blocks before workflow steps, record the exact blocker and use another authorized runner when available; do not invent PASS.
- [ ] **Step 6: Attempt the 007 rollback/reapply only on an authorized disposable/staging path**. If destructive DDL is tooling-blocked, preserve the staging database and record the debt explicitly.
- [ ] **Step 7: Write `P01-VERTICAL-SLICE-LEDGER.md`** separating `PASS`, `PENDING`, and `TOOLING-BLOCKED`; retain the existing M5.G2 destructive-lifecycle debt until actually cleared.
- [ ] **Step 8: Commit** with `docs: record P01 vertical slice verification`.

## Final acceptance gate

Before calling the vertical slice complete, fresh evidence must show:

- Adult/versioned-consent gate blocks invalid entry.
- Adaptive instrument has ~12 core questions and no execution path above 32 answers.
- Seven-dimension map is deterministic, non-diagnostic, and has no aggregate sexual-performance score.
- L01 completes all seven learning stages and preserves provenance labels.
- Initial practice is explicitly non-sexual.
- Private reflection/map state remains under `cumg_vault` + RLS.
- Safety guidance overrides entitlement/paywall decisions.
- FREE user receives useful Assessment + basic map + complete L01 before offer.
- Generic analytics rejects nested private data.
- Cross-user Vault access is denied under a non-bypass role.
- `pnpm test` records zero executable test failures on an available runner.
- FREE-FIRST staging remains sufficient.
- Any destructive-lifecycle or CI infrastructure debt is reported, not hidden.
