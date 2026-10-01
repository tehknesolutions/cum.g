DROP TRIGGER IF EXISTS enforce_scientific_claim_evidence ON knowledge.claims;
DROP FUNCTION IF EXISTS knowledge.enforce_scientific_claim_evidence();
DROP TABLE IF EXISTS knowledge.claim_evidence;
DROP TABLE IF EXISTS knowledge.claims;
DROP TABLE IF EXISTS knowledge.evidence;
DROP TABLE IF EXISTS knowledge.sources;
DROP SCHEMA IF EXISTS knowledge;
