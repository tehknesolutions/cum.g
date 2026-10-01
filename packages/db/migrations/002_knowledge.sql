CREATE SCHEMA IF NOT EXISTS knowledge;

CREATE TABLE knowledge.sources (
  id uuid PRIMARY KEY,
  source_type text NOT NULL,
  title text NOT NULL,
  authors text[] NULL,
  publisher text NULL,
  published_at date NULL,
  canonical_url text NULL,
  citation text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE knowledge.evidence (
  id uuid PRIMARY KEY,
  source_id uuid NOT NULL REFERENCES knowledge.sources(id) ON DELETE RESTRICT,
  provenance_class text NOT NULL CHECK (provenance_class IN ('SCIENTIFIC', 'EXPERIENTIAL', 'SOCIAL', 'HNK')),
  locator text NULL,
  summary text NOT NULL,
  limitations text NULL,
  review_status text NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE knowledge.claims (
  id uuid PRIMARY KEY,
  claim_text text NOT NULL,
  provenance_class text NOT NULL CHECK (provenance_class IN ('SCIENTIFIC', 'EXPERIENTIAL', 'SOCIAL', 'HNK')),
  safety_class text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE knowledge.claim_evidence (
  claim_id uuid NOT NULL REFERENCES knowledge.claims(id) ON DELETE CASCADE,
  evidence_id uuid NOT NULL REFERENCES knowledge.evidence(id) ON DELETE RESTRICT,
  PRIMARY KEY (claim_id, evidence_id)
);

CREATE INDEX evidence_source_idx ON knowledge.evidence(source_id);
CREATE INDEX evidence_provenance_review_idx ON knowledge.evidence(provenance_class, review_status);
CREATE INDEX claims_provenance_status_idx ON knowledge.claims(provenance_class, status);

CREATE OR REPLACE FUNCTION knowledge.enforce_scientific_claim_evidence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.provenance_class = 'SCIENTIFIC' AND NEW.status = 'APPROVED' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM knowledge.claim_evidence ce
      JOIN knowledge.evidence e ON e.id = ce.evidence_id
      WHERE ce.claim_id = NEW.id
        AND e.provenance_class = 'SCIENTIFIC'
        AND e.review_status = 'APPROVED'
    ) THEN
      RAISE EXCEPTION 'Scientific claim requires approved scientific evidence';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER enforce_scientific_claim_evidence
AFTER INSERT OR UPDATE OF provenance_class, status ON knowledge.claims
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION knowledge.enforce_scientific_claim_evidence();

COMMENT ON SCHEMA knowledge IS 'Evidence and claims with explicit, non-interchangeable provenance classes.';
