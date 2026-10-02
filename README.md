# CUM.G

CUM.G is an adult media, sexual education, and training platform. The first product priority is the Education Vertical Slice.

## V0.1 — Education Vertical Slice

`Entry → Age Consent → Assessment → Control Map → P01/L01 → Reflection → Map Update → P01/L02 → Reflection → Map Update → Next Step → Practice → Result → Safety Guidance → Offer`

The browser surface is available under `apps/web/` as a dependency-light static experience. It keeps the domain journey separate from the UI and does not persist private reflection text or offer state in browser storage.

## Architecture principles

- Modular monolith first; split services only when evidence demands it.
- Scientific evidence, professional experience, social opinion, and HNK methodology remain distinct provenance classes.
- Private sexual/health-related user data never enters generic analytics.
- Content claims are traceable to sources through the Knowledge Registry.
- Medical/safety guidance is never hidden behind a paywall.
- Resumable journey state belongs to the private Vault boundary and uses optimistic versioning.

## Repository map

- `apps/web` — product web application and P01 browser surface
- `packages/*` — domain packages
- `content/courses/CUMG-P01` — first educational program
- `assets/brand` — versioned brand assets
- `docs` — architecture, product, evidence, and brand records
- `tests` — cross-domain contract tests

## Current milestone

P01 FREE vertical slice — domain, content contracts, resumable state, and browser surface implemented; PostgreSQL/staging runtime evidence remains a separate verification gate.
