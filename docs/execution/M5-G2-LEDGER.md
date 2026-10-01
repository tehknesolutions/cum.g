# M5.G2 — Database Contracts Verification Ledger

Status: IMPLEMENTED / RUNTIME VERIFICATION PENDING
Date: 2026-10-01
Branch: `feat/m5-g2-database-contracts`

## Implemented artifacts

- `001_identity.sql` + rollback
- `002_knowledge.sql` + rollback
- `003_learning.sql` + rollback
- `004_vault.sql` + rollback
- `005_vault_rls.sql` + rollback
- `006_seed_p01.sql` + rollback
- fail-closed analytics event contract
- static Node contract tests for Identity, Knowledge, Learning, Vault, RLS, Analytics, P01 seed and migration lifecycle

## Repository evidence captured

The branch tree confirms all six numbered forward migrations and all six matching rollback files are present, together with the database README, specification and implementation plan.

## Verification classification

### VERIFIED BY REPOSITORY INSPECTION

- Four domain boundaries are represented: `identity`, `knowledge`, `learning`, `vault`.
- Provenance values are explicitly represented in the Knowledge migration.
- Vault private payload fields are designed as opaque `bytea` values.
- RLS migration exists separately from Vault table creation.
- Analytics contract is fail-closed by explicit event/property allowlists.
- `CUMG-P01` seed is structural Learning data and contains no user fixture inserts.
- Every numbered forward migration 001–006 has a rollback peer.

### NOT YET RUNTIME-VERIFIED

The following claims MUST NOT be marked PASS until fresh commands execute successfully:

- Node test suite returns zero failures.
- PostgreSQL 16+ applies migrations 001–006 successfully.
- Scientific-claim trigger behaves correctly in PostgreSQL.
- User A cannot read/write User B Vault data under RLS.
- Response authorization through assessment ownership behaves correctly.
- Reverse rollback 006→001 succeeds without partial schemas.

## Current blocker

GitHub Actions runner provisioning remains blocked before the first workflow step (Issue #4). Previous runs therefore do not constitute application-test evidence.

## FREE-FIRST runtime gate

Use free infrastructure only for this verification gate: local PostgreSQL or an approved free-tier staging PostgreSQL. Do not purchase hosting solely to close M5.G2.

No real sexual/health/intimate user data may be used in verification fixtures.

## Exit criteria for M5.G2 = DONE

1. Execute the full Node contract suite fresh and record command/output with zero failures.
2. Apply migrations 001→006 to PostgreSQL 16+.
3. Execute cross-user A/B RLS tests and prove denial in both read/write directions.
4. Exercise scientific provenance constraint with positive and negative cases.
5. Roll back 006→001 and verify CUM.G schemas are removed cleanly.
6. Re-apply migrations to prove forward recovery.
7. Record runtime evidence here.

Until those seven checks have fresh execution evidence, M5.G2 remains `IMPLEMENTED / RUNTIME VERIFICATION PENDING`, not `DONE`.
