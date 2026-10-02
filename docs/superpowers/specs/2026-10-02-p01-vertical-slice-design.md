# CUM.G — P01 Educational Vertical Slice V1 Design

**Date:** 2026-10-02  
**Status:** DESIGN APPROVED / SPEC REVIEW REQUIRED  
**Program:** `CUMG-P01 — Controle Ejaculatório`

## 1. Intent

Build the first usable and sellable educational vertical slice of CUM.G. The slice must demonstrate the complete product loop while remaining educational rather than diagnostic, privacy-first, FREE-FIRST, and explicit about evidence provenance.

Success means an adult user can enter P01, give informed consent, complete an adaptive assessment, receive immediate educational value through a private multidimensional Control Map, complete P01-L01, perform a safe non-sexual initial practice, record private reflection, and receive a next-step recommendation without exposing intimate data to analytics, advertising, or the media layer.

## 2. Product boundaries

- Adult product: explicit sexual-education flow is 18+.
- Education is not diagnosis or medical treatment.
- Essential safety and professional-care guidance is never paywalled.
- `SCIENTIFIC` is the factual/evidential authority layer.
- `EXPERIENTIAL`, `SOCIAL`, and `HNK` are complementary provenance classes and must remain visibly distinguishable.
- HNK methods are presented as complementary/authored mental-training methods, not scientific evidence unless separately supported by qualifying scientific evidence.
- Private assessment/training data belongs only to `cumg_vault`.
- Advertising and generic analytics must never receive assessment answers, Control Maps, intimate scores/states, or private reflections.
- Adult media and education are separate product domains and receive no automatic cross-access to private educational data.

## 3. Vertical-slice journey

`P01 Entry → 18+ Gate → Versioned Consent → Adaptive Assessment → Initial Control Map → P01-L01 → Evidence/Misconception Blocks → Complementary Perspectives → Safe Practice → Private Reflection → Control Map Update → Next Step → Premium Offer`

The user receives meaningful results before encountering the premium offer.

## 4. Adaptive Assessment V1

### 4.1 Shape

- Core: approximately 12 questions.
- Target completion: approximately 3–5 minutes for the core path.
- Adaptive branches open only when an answer requires more context.
- Maximum target: approximately 32 questions.
- Branching must be deterministic and versioned.
- The assessment may describe self-reported patterns but must not emit a medical diagnosis.

### 4.2 Data minimization

Questions must have a clear educational purpose. Avoid partner names, identifying partner details, unnecessary narrative free text, or intimate details that do not change educational guidance.

Each question definition contains a stable code, instrument version, purpose, dimension mapping, branch rule where applicable, and provenance metadata where the wording/interpretation depends on a claim.

Private answers are encrypted/opaque Vault payloads. Analytics receives no answer-level representation.

## 5. Control Map V1

The Control Map is a private educational self-observation artifact with seven dimensions:

1. Body awareness
2. Arousal awareness
3. Self-regulation
4. Mental attention
5. Emotional response
6. Context and communication
7. Perceived confidence

The map must not collapse the user into one sexual-performance score. Each dimension communicates perceived state, context, relevant educational interpretation, and change over time when longitudinal data exists.

Language should use forms such as: "Your responses indicate lower perceived control in this context; the next material explores related mechanisms and practices." Avoid labels such as normal/abnormal unless a sourced clinical context explicitly requires such terminology, and never convert the map into a diagnosis.

The seven-dimension structure may align aesthetically/conceptually with HNK structures, but scientific measurement and scientific claims must remain independently justified.

## 6. P01-L01 — Mapa Inicial e Fundamentos

L01 demonstrates the full CUM.G learning method rather than functioning as a passive article.

Sequence:

`LEARN → OBSERVE → PRACTICE → RECORD → REFLECT → COMPARE → ADVANCE`

### 6.1 Learning content

L01 introduces sexual-response variability, arousal/perception, body awareness, attention, situational anxiety/context, self-regulation concepts, and the distinction between self-reported experience and clinical criteria.

The first lesson does not promise a technique that makes the user "last longer." It first builds a usable mental/body model.

### 6.2 Provenance presentation

Content units expose provenance visibly:

- `SCIENTIFIC`: evidence-backed claims, source traceability, limitations.
- `EXPERIENTIAL`: relevant professional/adult-industry lived or practitioner experience; never promoted to clinical proof.
- `SOCIAL`: culture, expectations, perceptions, and social observations.
- `HNK`: authored/complementary mental-training interpretation and practice.

A lesson may combine classes, but the UI must never visually erase their boundaries.

### 6.3 Initial practice

The first guided practice is non-sexual: neutral body-attention/self-observation, natural breathing, noticing tension, and private reflection. This allows the vertical slice to validate Learning + Vault + Control Map without requiring explicit sexual practice in V1.

## 7. Personalization and next-step engine

The V1 recommendation engine is deterministic/rule-based, not an opaque AI diagnosis engine.

Inputs may include the seven Control Map dimensions, completed lesson state, consent state, and assessment instrument version. Outputs are educational next steps: lesson/exercise recommendations, explanatory content, or professional-care guidance when predefined safety rules require it.

Every recommendation must be explainable from its rule and source claims. No ad targeting output is produced from this engine.

## 8. Monetization V1

### FREE

- 18+ gate and consent
- Adaptive initial Assessment
- Basic initial Control Map
- Complete P01-L01
- Essential health/safety information
- Professional-care escalation guidance
- Demonstration of the CUM.G learning method

### PREMIUM

- Full P01 curriculum
- Progressive authored exercises/protocols
- Deeper educational material
- Longitudinal Control Map/history
- Personalized learning paths based on permitted private state
- Premium complementary material

V1 monetization preference: one-time purchase per program. Subscription is deferred until recurring value exists.

The user must receive useful FREE value before the offer. Safety-critical information is never withheld to increase conversion.

## 9. Privacy, age, consent and health boundary

### 9.1 Age

Explicit adult sexual-education experiences require an 18+ gate. The system must not intentionally build intimate profiles for minors.

### 9.2 Consent

Consent is versioned and recorded before private Assessment collection. The product explains the purpose of collection and the private-data boundary in understandable language.

### 9.3 Storage boundary

`PUBLIC/MEDIA ≠ EDUCATION ≠ PRIVATE VAULT ≠ ANALYTICS/ADS`

`ADS ←X→ VAULT` is an architectural invariant.

Assessment responses, Control Maps, and private training/reflection state live only in `cumg_vault`. Generic analytics uses approved minimal events/properties only.

### 9.4 Health escalation

Predefined safety rules can interrupt or supplement the educational path when user responses indicate that professional evaluation may be appropriate. The UI gives neutral guidance to seek a qualified healthcare professional; it does not diagnose the user.

### 9.5 User control

Architecture must preserve a path for user access/export and deletion of private records. V1 need not expose every lifecycle UI if it is outside the vertical-slice implementation, but the data model/API must not make later implementation impractical.

## 10. Architecture

The slice reuses the M5.G2 domains:

- `identity`: account, consent, entitlement.
- `knowledge`: sources, evidence, claims and provenance.
- `learning`: program/module/lesson/exercise/progress.
- `cumg_vault`: private assessment responses, Control Maps and training state under RLS.

New application-level units should remain isolated:

1. **Assessment Engine** — loads a versioned instrument and resolves deterministic branches.
2. **Control Map Engine** — maps private answers to seven educational dimensions and produces a private snapshot.
3. **Lesson Runtime** — renders provenance-aware lesson blocks and exercise progression.
4. **Recommendation Engine** — deterministic explainable next-step rules.
5. **Safety Gate** — evaluates predefined escalation rules separately from monetization.
6. **Entitlement Gate** — determines FREE/PREMIUM access without reading intimate payloads.
7. **Analytics Boundary** — existing fail-closed projection remains the only generic analytics exit.

The media/advertising domain is not a dependency of Assessment, Control Map, or Safety Gate.

## 11. Data flow

1. Identity establishes authenticated user and 18+/consent state.
2. Assessment Engine loads public/versioned question definitions.
3. User answers are written as private Vault payloads.
4. Control Map Engine processes authorized private input inside the private application boundary and persists an opaque private snapshot.
5. Lesson Runtime reads public Knowledge/Learning content plus only the minimum private derived state needed for personalization.
6. Recommendation/Safety rules produce explainable educational next steps.
7. Learning progress stores non-intimate completion state.
8. Analytics receives only explicitly allowed coarse events; private payloads fail closed.
9. Entitlement Gate controls premium content independently of health/safety guidance.

## 12. Error and safety behavior

- Missing/invalid consent: assessment collection does not start.
- Unknown assessment version: fail closed and do not reinterpret old answers using a new instrument.
- Invalid branch rule: stop the affected assessment path and surface a recoverable product error; do not guess.
- Missing scientific evidence for an approved scientific claim: database constraint blocks approval.
- Vault authorization mismatch: RLS denies access.
- Unknown analytics event/property or sensitive key: analytics projection rejects it.
- Control Map cannot be calculated reliably: show an incomplete-map state and request only the missing permitted information; do not fabricate values.
- Safety rule and paywall conflict: safety guidance wins.

## 13. Testing strategy

### Contract/unit

- Assessment core path and every adaptive branch.
- 12-question core can terminate without unnecessary branches.
- Maximum/question-loop guard prevents runaway branching.
- Seven-dimension mapping is deterministic for a fixed instrument version.
- Recommendation rules are explainable and deterministic.
- Provenance badges/metadata cannot silently downgrade or merge classes.
- Analytics rejects private/sensitive payloads recursively.

### PostgreSQL integration

- Existing M5.G2 RLS A/B isolation remains mandatory.
- Consent ownership and entitlement boundaries.
- Control Map ownership and assessment/user composite FK.
- Scientific claim approval requires approved scientific evidence.

### End-to-end vertical slice

Adult user → consent → core/adaptive Assessment → Control Map → L01 → practice → private reflection → map update → next step → premium offer.

Negative E2E paths include missing consent, unauthorized cross-user Vault access, unknown instrument version, safety escalation, and attempted private-data analytics emission.

No real intimate/health user data is permitted in development fixtures.

## 14. Acceptance criteria

The vertical slice is accepted when:

1. An adult test user can complete the entire FREE journey.
2. Core Assessment is approximately 12 questions and adaptive branches remain bounded to the defined V1 maximum.
3. A seven-dimension Control Map is generated without a single sexual-performance score or diagnostic label.
4. P01-L01 completes the LEARN→OBSERVE→PRACTICE→RECORD→REFLECT→COMPARE→ADVANCE loop.
5. Scientific claims remain traceable to approved scientific evidence.
6. Complementary provenance classes remain visibly distinct.
7. Private answers/maps/reflections never appear in generic analytics or advertising payloads.
8. User A cannot read/write user B private state under a non-bypass runtime role.
9. Safety guidance overrides monetization gates.
10. FREE user receives meaningful result/content before premium offer.
11. No paid infrastructure is required for the V1 staging path.
12. The existing M5.G2 destructive-lifecycle verification debt remains tracked and is not misrepresented as complete.

## 15. Explicitly deferred

- Subscription billing model.
- AI-generated medical diagnosis or opaque AI personalization.
- Ad targeting based on intimate/health data.
- Cross-linking adult-media behavior to educational private profiles.
- Full P01 curriculum beyond what is required to prove the V1 vertical slice.
- P02/P03 implementation.
- Production KMS/production launch authorization.

## 16. Design decisions approved in discovery

- Educational module is the product priority and source of authored sellable content.
- Assessment is adaptive: ~12 core questions, up to ~32 with branches.
- Control Map uses seven dimensions rather than a single score.
- P01-L01 starts with understanding/self-observation rather than a performance promise.
- Scientific evidence is the authority layer; Experiential/Social/HNK are complementary and labeled.
- FREE provides Assessment + useful Control Map + complete L01 + safety information.
- PREMIUM initially uses per-program purchase.
- Privacy invariant: advertising/analytics cannot consume Vault intimate payloads.
- Adult explicit education uses an 18+ gate and versioned consent.
- Product remains FREE-FIRST during staging/development.
