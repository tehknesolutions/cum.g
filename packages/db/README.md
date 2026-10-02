# CUM.G Database Package

M5.G2 establishes four PostgreSQL domains: `identity`, `knowledge`, `learning`, and the CUM.G-owned private namespace `cumg_vault`.

## FREE-FIRST development rule

Do not purchase infrastructure for this milestone. Contract tests that do not require PostgreSQL run with Node.js. PostgreSQL integration/RLS tests should use an approved free-tier staging database before any paid service is considered.

No real intimate/health user data is authorized in development or staging fixtures.

## Forward order

Apply migrations in this order:

1. `001_identity.sql`
2. `002_knowledge.sql`
3. `003_learning.sql`
4. `004_vault.sql`
5. `005_vault_rls.sql`
6. `005b_vault_runtime_grants.sql`
7. `006_seed_p01.sql`

The generic `vault` schema is not owned by CUM.G and must not be modified or dropped by CUM.G migrations.

## Rollback order

Apply matching `.down.sql` files in exact reverse order: `006 → 005b → 005 → 004 → 003 → 002 → 001`.

## Vault session contract

Before application access to `cumg_vault` inside a request transaction, the authenticated identity UUID must be bound with `SET LOCAL app.user_id = '<uuid>'`. RLS policies use this transaction-scoped value. Production authentication integration and production encryption/KMS are separate future gates.

## P01 seed

`006_seed_p01.sql` contains only public/structural Learning records for `CUMG-P01`. User answers, assessments, Control Maps and private training state must never be seeded there.

## Verification status

Static Node contract tests are useful but do not prove PostgreSQL runtime behavior. Runtime forward migrations, non-bypass cross-user RLS isolation, and scientific-provenance behavior have been verified on the FREE staging database and are recorded in `docs/execution/M5-G2-LEDGER.md`. The full destructive rollback/reapply lifecycle remains explicitly tooling-blocked/pending and must not be represented as PASS until executed. GitHub Actions infrastructure debt remains tracked separately in Issue #4.
