# CUM.G Architecture Baseline V1

## Product domains

Identity · Catalog · Learning · Training · Knowledge · Private Vault · Commerce · Media · Analytics · Safety.

## Hard boundaries

1. `SCIENTIFIC != EXPERIENTIAL != SOCIAL != HNK`.
2. Private sexual/health responses must not be emitted to generic analytics, URLs, query strings, CDN metadata, ad pixels, or ordinary application logs.
3. Claims must remain traceable to their evidence/source records.
4. Control Map is educational self-observation, not diagnosis.
5. Medical and safety guidance cannot depend on paid entitlement.

## Initial runtime

Modular monolith, PostgreSQL-oriented persistence, first-party event contract, S3-compatible media abstraction, and provider adapters for commerce/media infrastructure.

## Vertical slice

Landing → Assessment → P01/L01 → P01/L02 → Control Map → HNK Performance Lab → Offer → Checkout → Dashboard.
