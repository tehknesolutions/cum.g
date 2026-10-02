# M5.G2 — Database Contracts Verification Ledger

Status: VERIFIED EXCEPT DESTRUCTIVE LIFECYCLE GATE
Date: 2026-10-02
Branch: `feat/m5-g2-database-contracts`
Staging: Supabase FREE `cum-g-staging` (`sa-east-1`)

## Implemented artifacts

- `001_identity.sql` + rollback
- `002_knowledge.sql` + rollback
- `003_learning.sql` + rollback
- `004_vault.sql` using the CUM.G-owned `cumg_vault` namespace + rollback
- `005_vault_rls.sql` + rollback
- `005b_vault_runtime_grants.sql` + rollback
- `006_seed_p01.sql` + rollback
- fail-closed analytics event contract
- static Node contract tests for Identity, Knowledge, Learning, Vault, RLS, Analytics, P01 seed and migration lifecycle

## Runtime evidence

### PASS — forward migrations

PostgreSQL staging accepted the forward chain through Identity, Knowledge, Learning, `cumg_vault`, RLS and `CUMG-P01` seed. The original `vault` namespace collided with a Supabase-owned schema (`supabase_admin`, no CREATE privilege for the migration executor); the CUM.G domain was therefore renamed to `cumg_vault` rather than modifying Supabase system ownership or grants.

### PASS — RLS A/B isolation

Runtime testing was repeated under the Supabase `authenticated` role, which has `rolbypassrls = false`. Minimal runtime grants were added separately in `005b_vault_runtime_grants.sql`. With `app.user_id` bound to user A, A saw only A's assessment. With the identity bound to user B, an attempted update of A's assessment affected zero rows. Test fixtures were transaction-scoped and rolled back.

### PASS — scientific provenance constraint

A negative runtime case attempted to approve a `SCIENTIFIC` claim without approved scientific evidence and was rejected by the deferred constraint trigger. A positive case created Source → approved SCIENTIFIC Evidence → Claim/Evidence link and then promoted the claim to `SCIENTIFIC / APPROVED` successfully. Fixtures were rolled back. PostgreSQL runtime verification uses `SET CONSTRAINTS ALL IMMEDIATE` to force the deferred trigger within the test transaction.

### PASS — privacy architecture evidence

Private assessment/training payloads remain opaque `bytea` fields in `cumg_vault`. Generic analytics remains fail-closed by explicit event/property allowlists and recursively rejects private/sensitive keys. `CUMG-P01` seed contains structural Learning data only and no real user/intimate fixtures.

## Remaining verification debt

### TOOLING-BLOCKED — destructive lifecycle gate

The requested full rollback (`006 → 001`, including schema drops), absence check and clean re-apply was submitted only against the dedicated FREE staging project with no real user data. The connected execution layer blocked the destructive SQL before it reached PostgreSQL. Therefore no destructive lifecycle PASS is claimed and staging was left intact.

This is classified as a tooling limitation, not a PostgreSQL migration failure. It must be re-run later from an authorized disposable runner/database capable of destructive DDL.

### CI / Node runner

GitHub Actions runner provisioning remains tracked separately in Issue #4. A fresh full Node suite result must be captured when that runner path is restored or replaced.

## FREE-FIRST decision

No paid infrastructure is required to continue. Supabase FREE staging is sufficient for the verified runtime gates. Do not purchase hosting solely to clear the remaining destructive lifecycle verification debt.

## Current milestone disposition

M5.G2 is accepted for roadmap continuation as `VERIFIED EXCEPT DESTRUCTIVE LIFECYCLE GATE`.

It MUST NOT be represented as fully `DONE` until:

1. rollback removes the CUM.G-owned schemas cleanly on a disposable database;
2. the forward chain re-applies cleanly afterward; and
3. a fresh full Node contract suite records zero failures.

No production deployment or real intimate user data is authorized by this milestone.
