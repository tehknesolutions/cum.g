# M5.G2 — Database Contracts Specification

Status: PROPOSED FOR REVIEW

## Goal

Define the durable data boundaries for CUM.G V0.1 Education Vertical Slice while keeping intimate sexual/health data isolated by design.

## Architecture decision

Use PostgreSQL with four explicit domain schemas:

- `identity` — accounts, consent receipts, entitlements and non-intimate account state.
- `knowledge` — sources, evidence records, claims and provenance.
- `learning` — programs, modules, lessons, exercises and learning progress.
- `vault` — private assessments, intimate responses, Control Map snapshots and training-session private state.

All primary identifiers are UUIDs. Cross-schema references use identifiers only and must not duplicate sensitive payloads.

## Provenance contract

Every educational claim that can affect content or training guidance has one provenance class:

- `SCIENTIFIC` — academic/scientific evidence.
- `EXPERIENTIAL` — attributed professional/performer experience.
- `SOCIAL` — social opinion, survey or community observation.
- `HNK` — HNK methodology or training model.

These classes MUST remain distinguishable in storage and presentation. A claim may cite multiple evidence records, but provenance is never silently upgraded from experience/opinion/HNK to scientific evidence.

## Schema: identity

### `identity.users`
- `id uuid PK`
- `created_at timestamptz`
- `status text`

No intimate sexual answers belong here.

### `identity.consent_receipts`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `consent_type text`
- `policy_version text`
- `granted_at timestamptz`
- `revoked_at timestamptz nullable`

### `identity.entitlements`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `product_id text`
- `status text`
- `starts_at timestamptz`
- `ends_at timestamptz nullable`

Medical/safety guidance MUST NOT depend on an entitlement.

## Schema: knowledge

### `knowledge.sources`
- `id uuid PK`
- `source_type text`
- `title text`
- `authors text[] nullable`
- `publisher text nullable`
- `published_at date nullable`
- `canonical_url text nullable`
- `citation text`
- `metadata jsonb`

### `knowledge.evidence`
- `id uuid PK`
- `source_id uuid FK knowledge.sources`
- `provenance_class text CHECK IN (SCIENTIFIC, EXPERIENTIAL, SOCIAL, HNK)`
- `locator text nullable`
- `summary text`
- `limitations text nullable`
- `review_status text`

### `knowledge.claims`
- `id uuid PK`
- `claim_text text`
- `provenance_class text CHECK IN (SCIENTIFIC, EXPERIENTIAL, SOCIAL, HNK)`
- `safety_class text`
- `status text`
- `created_at timestamptz`

### `knowledge.claim_evidence`
Many-to-many bridge between claims and evidence.

Invariant: a claim shown as `SCIENTIFIC` must have at least one approved `SCIENTIFIC` evidence record. Enforcement may combine DB constraints/triggers with application validation.

## Schema: learning

### `learning.programs`
- `id text PK` (first: `CUMG-P01`)
- `title text`
- `status text`

### `learning.modules`
- `id uuid PK`
- `program_id text FK learning.programs`
- `position int`
- `title text`

### `learning.lessons`
- `id uuid PK`
- `module_id uuid FK learning.modules`
- `lesson_code text`
- `position int`
- `title text`
- `status text`

### `learning.lesson_claims`
Bridge from lessons to `knowledge.claims`; educational copy should be traceable through this relation.

### `learning.exercises`
- `id uuid PK`
- `lesson_id uuid FK learning.lessons`
- `exercise_type text`
- `title text`
- `public_config jsonb`

`public_config` MUST NOT contain a user's intimate answers.

### `learning.progress`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `lesson_id uuid FK learning.lessons`
- `state text`
- `completed_at timestamptz nullable`

Progress records may say a lesson was completed; they must not reproduce Vault responses.

## Schema: vault

The Vault is the only V0.1 domain authorized to persist intimate assessment/training payloads.

### `vault.assessments`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `instrument_code text`
- `instrument_version text`
- `started_at timestamptz`
- `completed_at timestamptz nullable`

### `vault.responses`
- `id uuid PK`
- `assessment_id uuid FK vault.assessments`
- `question_code text`
- `encrypted_payload bytea`
- `created_at timestamptz`

Raw intimate answers MUST NOT be stored in plaintext analytics/event payloads.

### `vault.control_maps`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `assessment_id uuid FK vault.assessments`
- `instrument_version text`
- `encrypted_snapshot bytea`
- `created_at timestamptz`

Control Map is an educational self-observation instrument, not a medical diagnosis.

### `vault.training_sessions`
- `id uuid PK`
- `user_id uuid FK identity.users`
- `program_id text FK learning.programs`
- `protocol_code text`
- `started_at timestamptz`
- `completed_at timestamptz nullable`
- `encrypted_private_state bytea nullable`

## Analytics boundary

Generic analytics MAY receive minimal product events such as:

- `lesson_started`
- `lesson_completed`
- `offer_viewed`
- `checkout_started`

Generic analytics MUST NOT receive:

- sexual/health answers or free text;
- Control Map content or scores that reveal intimate state;
- assessment question/answer pairs;
- private training-session notes;
- sensitive values in URL/query strings;
- Vault payloads in ordinary application logs, ad pixels, CDN metadata or marketing systems.

Analytics identifiers should be pseudonymous and purpose-limited; advertising integrations are not authorized to access Vault data.

## Access-control contract

1. Users can access only their own Vault records unless a future explicit privileged workflow is separately designed and audited.
2. Service roles touching Vault must be narrower than general application/analytics roles.
3. RLS is required before production user data is accepted.
4. Sensitive Vault payloads are designed for application-layer or field-level encryption; key management is outside this spec and must be specified before production.
5. Consent records are auditable and versioned.
6. Deletion/export workflows must include Vault records and derived private artifacts.

## V0.1 vertical-slice relations

`Source -> Evidence -> Claim -> Lesson -> Exercise`

Separately:

`User -> Consent -> Private Assessment -> Control Map -> Training Session`

The bridge between these flows uses identifiers and explicitly approved derived state only; it does not copy raw Vault payloads into Learning or Analytics.

## Safety and product constraints

- CUM.G educational content is not represented as diagnosis or individualized medical treatment unless a future regulated/qualified workflow explicitly supports that claim.
- Medical/safety guidance cannot be paywalled.
- Evidence limitations and provenance remain visible to the content system.
- Adult-only product surfaces require an age/eligibility policy before production launch; implementation is outside this database-contract milestone.

## M5.G2 acceptance criteria

- Four domain schemas and ownership boundaries are represented in migrations.
- Provenance classes are constrained and testable.
- `CUMG-P01` can be represented without storing intimate data in Learning.
- Vault records are user-scoped and ready for RLS tests.
- Cross-domain tests prove generic analytics cannot consume Vault payload fields through approved event contracts.
- Migration rollback/forward behavior is documented and tested.
- No production deployment is authorized by this spec alone.

## Explicitly deferred

- payment provider schema details;
- ad network integrations;
- production encryption/KMS implementation;
- clinician/professional access;
- AI personalization using Vault content;
- recommendation engines;
- age-verification implementation;
- media catalog/storage schema beyond identifiers needed by Learning.
