# M5.G1 Execution Ledger

Status: IN PROGRESS

- Branch: `feat/m5-repository-genesis`
- Product identity: CUM.G
- Release target: CUM.G V0.1 — EDUCATION VERTICAL SLICE

## Decisions

- Ruling: repository starts as a minimal pnpm workspace; framework dependencies are deferred until runtime implementation to avoid speculative dependency surface.
- Ruling: G1 tests validate product/domain contracts using Node built-ins so the genesis gate can run without external dependencies.
- Ruling: directories are materialized by real files only; no placeholder `.gitkeep` forest.

## TDD ledger

- RED contract authored first in `tests/genesis.test.mjs`, referencing product/course contracts before those files existed.
- GREEN implementation added via `apps/web/product.manifest.json` and `content/courses/CUMG-P01/course.json`.
- Verification pending execution in an isolated runtime checkout.
