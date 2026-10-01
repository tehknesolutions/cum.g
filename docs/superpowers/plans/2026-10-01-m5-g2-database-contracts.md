# M5.G2 Database Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the PostgreSQL contracts for CUM.G identity, evidence-backed learning, and privacy-isolated intimate data.

**Architecture:** A modular PostgreSQL baseline uses four schemas (`identity`, `knowledge`, `learning`, `vault`) with UUID identities and explicit cross-domain foreign keys. Sensitive payloads remain only in `vault`; analytics receives a separately validated allowlisted event projection and never raw Vault fields.

**Tech Stack:** PostgreSQL 16+, SQL migrations, Node.js 22 built-in test runner, `pg` test adapter when database integration tests are introduced.

**Spec:** `docs/specs/M5-G2-DATABASE-CONTRACTS.md`

## Global Constraints

- `SCIENTIFIC`, `EXPERIENTIAL`, `SOCIAL`, and `HNK` remain distinct provenance classes.
- `vault` is the only V0.1 domain authorized to persist intimate assessment/training payloads.
- Medical/safety guidance cannot depend on paid entitlement.
- RLS is required before production user data is accepted.
- Raw Vault payloads never enter generic analytics, URLs, ad pixels, CDN metadata, marketing systems, or ordinary logs.
- Control Map is educational self-observation, not diagnosis.
- No production deployment is authorized by this milestone.

## Review Focus

1. A `SCIENTIFIC` claim without approved scientific evidence must be rejected — covered in Task 2.
2. Cross-user Vault reads/writes must be denied once RLS is enabled — covered in Task 4.
3. Analytics projection receiving a Vault/private field must fail closed — covered in Task 5.
4. Learning progress must never duplicate intimate response payloads — covered in Task 3.
5. Forward + rollback migrations must leave no partial domain schema — covered in Task 6.

## File Structure

- `packages/db/migrations/001_identity.sql` — account, consent and entitlement contracts.
- `packages/db/migrations/002_knowledge.sql` — evidence/provenance/claim contracts.
- `packages/db/migrations/003_learning.sql` — program, lesson, exercise and progress contracts.
- `packages/db/migrations/004_vault.sql` — intimate assessment/training storage.
- `packages/db/migrations/005_vault_rls.sql` — Vault row-level security policies.
- `packages/db/migrations/006_seed_p01.sql` — minimal CUMG-P01 structural seed.
- `packages/db/rollback/` — exact reverse migrations.
- `packages/db/src/analytics-event-contract.mjs` — fail-closed analytics projection.
- `tests/db/` — migration, constraint, RLS and analytics-boundary tests.

### Task 1: Identity boundary

**Files:** Create `packages/db/migrations/001_identity.sql`, rollback peer, and `tests/db/identity-contract.test.mjs`.

**Interfaces:** Produces `identity.users(id)`, `identity.consent_receipts(user_id)`, `identity.entitlements(user_id)` for later foreign keys.

- [ ] Write a failing integration test asserting the three tables exist, UUID user IDs are accepted, consent is versioned, and no intimate-answer column exists.
- [ ] Run `node --test tests/db/identity-contract.test.mjs`; expect failure because migration is absent.
- [ ] Implement `001_identity.sql` with the exact fields from the approved spec and foreign-key/index basics.
- [ ] Run the identity test; expect PASS.
- [ ] Commit: `feat(db): add identity contracts`.

### Task 2: Knowledge provenance and claim evidence

**Files:** Create `002_knowledge.sql`, rollback peer, `tests/db/knowledge-contract.test.mjs`.

**Interfaces:** Consumes no private data; produces `knowledge.claims(id)` for Learning.

- [ ] Write failing tests for allowed provenance values, rejection of an unknown provenance, claim/evidence linking, and rejection of a `SCIENTIFIC` published/approved claim without approved scientific evidence.
- [ ] Run the knowledge test; expect FAIL.
- [ ] Implement sources, evidence, claims and claim-evidence bridge plus the minimum constraint/trigger required for the scientific-evidence invariant.
- [ ] Run the knowledge test; expect PASS.
- [ ] Commit: `feat(db): enforce evidence provenance contracts`.

### Task 3: Learning without intimate-data leakage

**Files:** Create `003_learning.sql`, rollback peer, `tests/db/learning-contract.test.mjs`.

**Interfaces:** Consumes `identity.users(id)` and `knowledge.claims(id)`; produces program/lesson IDs used by Vault training sessions.

- [ ] Write failing tests for program → module → lesson → exercise, lesson → claim traceability, user progress, and absence of response/free-text/private-payload columns from progress.
- [ ] Run the learning test; expect FAIL.
- [ ] Implement the approved Learning tables and constraints.
- [ ] Run the learning test; expect PASS.
- [ ] Commit: `feat(db): add learning contracts`.

### Task 4: Private Vault and RLS

**Files:** Create `004_vault.sql`, `005_vault_rls.sql`, rollback peers, `tests/db/vault-contract.test.mjs`, `tests/db/vault-rls.test.mjs`.

**Interfaces:** Consumes user/program IDs; persists encrypted opaque payload bytes only for private response/snapshot/state fields.

- [ ] Write failing contract tests asserting response payloads use `bytea`, Control Map/private session state is opaque, and plaintext response columns do not exist.
- [ ] Write failing RLS tests with users A/B proving each can select/update only their own Vault rows and cannot bind a foreign user's assessment to their response.
- [ ] Run both Vault tests; expect FAIL.
- [ ] Implement Vault tables, ownership constraints and RLS policies using a test-set session user identifier contract documented beside the policies.
- [ ] Run both Vault tests; expect PASS.
- [ ] Commit: `feat(db): isolate private vault with rls`.

### Task 5: Fail-closed analytics event projection

**Files:** Create `packages/db/src/analytics-event-contract.mjs`, `tests/db/analytics-boundary.test.mjs`.

**Interfaces:** `projectAnalyticsEvent(name: string, input: object) -> {name: string, properties: object}`; allowlisted event names are `lesson_started`, `lesson_completed`, `offer_viewed`, `checkout_started`.

- [ ] Write failing tests proving approved minimal fields survive while keys such as `response`, `answer`, `freeText`, `controlMap`, `score`, `assessment`, `privateState`, and nested variants cause rejection rather than silent forwarding.
- [ ] Run analytics-boundary test; expect FAIL.
- [ ] Implement a recursive fail-closed validator/projector with explicit event/property allowlists; unknown events or properties throw.
- [ ] Run analytics-boundary test; expect PASS.
- [ ] Commit: `feat(privacy): enforce analytics vault boundary`.

### Task 6: CUMG-P01 seed and migration lifecycle

**Files:** Create `006_seed_p01.sql`, rollback peer, `tests/db/p01-seed.test.mjs`, `tests/db/migration-lifecycle.test.mjs`, `packages/db/README.md`.

**Interfaces:** Seeds only structural/public learning records for `CUMG-P01`; no user or Vault data.

- [ ] Write failing seed test asserting `CUMG-P01` exists and its vertical-slice lesson structure can reference claims without private payloads.
- [ ] Write failing lifecycle test that applies migrations in order, verifies schemas, rolls back in reverse order, and verifies no partial CUM.G schemas/tables remain.
- [ ] Run both tests; expect FAIL.
- [ ] Implement the minimal P01 structural seed, rollback scripts and migration instructions.
- [ ] Run both tests; expect PASS.
- [ ] Commit: `feat(db): seed p01 and verify migration lifecycle`.

### Task 7: Full M5.G2 verification and ledger

**Files:** Create `docs/execution/M5-G2-LEDGER.md`; modify database test script/package manifest only if required by the implemented harness.

**Interfaces:** No new product interface; records evidence from Tasks 1–6.

- [ ] Run the complete DB suite and existing Genesis suite.
- [ ] Verify zero failures and record exact commands/results in the ledger; if GitHub Actions remains blocked, record local/alternate-runner evidence separately and keep Issue #4 open.
- [ ] Verify the repo contains no committed secrets, real intimate user data, or production credentials.
- [ ] Commit: `docs: close M5.G2 verification ledger`.

## Self-review result

Spec coverage checked: identity, consent, entitlements, knowledge provenance, learning traceability, Vault isolation, RLS, analytics boundary, P01 seed, rollback/forward lifecycle and non-production constraint all map to tasks above. Deferred items remain deferred; this plan does not introduce payments, ad-network Vault access, clinician access, AI personalization, age-verification implementation or production KMS.
