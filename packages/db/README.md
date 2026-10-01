# CUM.G Database Package

M5.G2 establishes four PostgreSQL domains: `identity`, `knowledge`, `learning`, and `vault`.

## FREE-FIRST development rule

Do not purchase infrastructure for this milestone. Contract tests that do not require PostgreSQL run with Node.js. PostgreSQL integration/RLS tests should use a free local PostgreSQL instance or an approved free-tier staging database before any paid service is considered.

No real intimate/health user data is authorized in development or staging fixtures.

## Forward order

Apply migrations in numeric order:

1. `001_identity.sql`
2. `002_knowledge.sql`
3. `003_learning.sql`
4. `004_vault.sql`
5. `005_vault_rls.sql`
6. `006_seed_p01.sql`

## Rollback order

Apply matching `.down.sql` files in exact reverse order: 006 → 001.

## Vault session contract

Before application access to Vault inside a request transaction, the authenticated identity UUID must be bound with `SET LOCAL app.user_id = '<uuid>'`. RLS policies use this transaction-scoped value. Production authentication integration and production encryption/KMS are separate future gates.

## P01 seed

`006_seed_p01.sql` contains only public/structural Learning records for `CUMG-P01`. User answers, assessments, Control Maps and private training state must never be seeded there.

## Verification status

Static Node contract tests are useful but do not prove PostgreSQL runtime behavior. Before M5.G2 is marked fully verified, run forward migrations, cross-user RLS tests and reverse rollback against a real PostgreSQL 16+ database. GitHub Actions infrastructure blocker is tracked separately in Issue #4.
