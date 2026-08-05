-- Triggers and views not managed by Drizzle.
-- Apply via Supabase SQL editor on database rebuild.
-- All statements are idempotent (CREATE OR REPLACE / DROP IF EXISTS).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── CAPABILITY TRIGGERS ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_promote_capability()
RETURNS TRIGGER AS $$
DECLARE
  sector_count   INT;
  current_status TEXT;
BEGIN
  SELECT status INTO current_status FROM capabilities WHERE id = NEW.capability_id;
  SELECT COUNT(*) INTO sector_count FROM capability_sector_evidence WHERE capability_id = NEW.capability_id;
  IF current_status = 'candidate' AND sector_count >= 1 THEN
    UPDATE capabilities SET status = 'proposed' WHERE id = NEW.capability_id;
  END IF;
  IF current_status IN ('candidate','proposed') AND sector_count >= 3 THEN
    UPDATE capabilities SET status = 'established' WHERE id = NEW.capability_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_promote_capability ON capability_sector_evidence;
CREATE TRIGGER trg_auto_promote_capability
AFTER INSERT ON capability_sector_evidence
FOR EACH ROW EXECUTE FUNCTION auto_promote_capability();

CREATE OR REPLACE FUNCTION guard_capability_status()
RETURNS TRIGGER AS $$
DECLARE
  sector_count INT;
BEGIN
  SELECT COUNT(*) INTO sector_count FROM capability_sector_evidence WHERE capability_id = NEW.id;
  IF NEW.status = 'proposed' AND sector_count < 1 THEN
    RAISE EXCEPTION 'Cannot set capability "%" to proposed: no sector evidence', NEW.slug;
  END IF;
  IF NEW.status = 'established' AND sector_count < 3 THEN
    RAISE EXCEPTION 'Cannot set "%" to established: % sectors documented (need 3)', NEW.slug, sector_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_capability_status ON capabilities;
CREATE TRIGGER trg_guard_capability_status
BEFORE UPDATE OF status ON capabilities
FOR EACH ROW EXECUTE FUNCTION guard_capability_status();

CREATE OR REPLACE FUNCTION guard_capability_deployment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.capability_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM capabilities
      WHERE id = NEW.capability_id AND status IN ('proposed','established')
    ) THEN
      RAISE EXCEPTION 'Capability must be at least proposed before use (id: %)', NEW.capability_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_capability_deployment ON company_timeline;
CREATE TRIGGER trg_guard_capability_deployment
BEFORE INSERT OR UPDATE ON company_timeline
FOR EACH ROW EXECUTE FUNCTION guard_capability_deployment();

-- ── VIEW TEARDOWN (dependency order) ────────────────────────────────────────
-- Required for idempotency. CREATE OR REPLACE VIEW cannot replace a view
-- when a dependent view exists. Drop in reverse dependency order first.

DROP VIEW IF EXISTS research_queue            CASCADE;
DROP VIEW IF EXISTS gap_failure_case          CASCADE;
DROP VIEW IF EXISTS gap_strong_validator      CASCADE;
DROP VIEW IF EXISTS gap_pattern_promotion     CASCADE;
DROP VIEW IF EXISTS gap_implementation_fill   CASCADE;
DROP VIEW IF EXISTS gap_geographic_whitespace CASCADE;

-- ── RESEARCH QUEUE VIEWS ──────────────────────────────────────────────────────
-- Scoring weights documented in docs/candidate-selection.md.
-- Do not change weights without updating that document.

CREATE OR REPLACE VIEW gap_pattern_promotion AS
SELECT
  sp.id   AS pattern_id,
  sp.name AS pattern_name,
  COALESCE(sp.winning_condition_maturity::text, 'no-conditions') AS current_status,
  sp.evidence_count,
  CASE COALESCE(sp.winning_condition_maturity::text, 'no-conditions')
    WHEN 'no-conditions' THEN 2
    WHEN 'draft'         THEN GREATEST(0, 2 - sp.evidence_count)
    WHEN 'proposed'      THEN GREATEST(0, 3 - sp.evidence_count)
    ELSE 0
  END AS observations_needed
FROM solution_patterns sp
WHERE CASE COALESCE(sp.winning_condition_maturity::text,'no-conditions')
        WHEN 'no-conditions' THEN 2
        WHEN 'draft' THEN GREATEST(0,2-sp.evidence_count)
        WHEN 'proposed' THEN GREATEST(0,3-sp.evidence_count)
        ELSE 0 END > 0;

CREATE OR REPLACE VIEW gap_implementation_fill AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
       ip.evidence_count, GREATEST(0,3-ip.evidence_count) AS observations_needed
FROM implementation_patterns ip
WHERE ip.status != 'dead' AND ip.evidence_count < 3;

CREATE OR REPLACE VIEW gap_strong_validator AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
       COUNT(DISTINCT c.id) AS total_companies,
       COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='strong_validator') AS strong_validators
FROM implementation_patterns ip
JOIN company_implementation_patterns cip ON cip.implementation_pattern_id=ip.id
JOIN companies c ON c.id=cip.company_id
WHERE ip.status!='dead'
GROUP BY ip.id,ip.name
HAVING COUNT(DISTINCT c.id)>=2
   AND COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='strong_validator')=0;

CREATE OR REPLACE VIEW gap_failure_case AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
       COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='strong_validator') AS successes,
       COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='disconfirming')    AS failures
FROM implementation_patterns ip
JOIN company_implementation_patterns cip ON cip.implementation_pattern_id=ip.id
JOIN companies c ON c.id=cip.company_id
WHERE ip.status!='dead'
GROUP BY ip.id,ip.name
HAVING COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='strong_validator')>=3
   AND COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight='disconfirming')=0;

CREATE OR REPLACE VIEW gap_geographic_whitespace AS
SELECT DISTINCT ip.id AS pattern_id, ip.name AS pattern_name,
  c_has.country AS proven_in, c_all.country AS missing_in
FROM implementation_patterns ip
JOIN company_implementation_patterns cip_has ON cip_has.implementation_pattern_id=ip.id
JOIN companies c_has ON c_has.id=cip_has.company_id
  AND c_has.evidence_weight='strong_validator' AND c_has.country IS NOT NULL
CROSS JOIN (SELECT DISTINCT country FROM companies WHERE country IS NOT NULL) c_all
WHERE c_all.country!=c_has.country
  AND NOT EXISTS (
    SELECT 1 FROM company_implementation_patterns cip2
    JOIN companies c2 ON c2.id=cip2.company_id
    WHERE cip2.implementation_pattern_id=ip.id AND c2.country=c_all.country
  );

CREATE OR REPLACE VIEW research_queue AS
WITH scored AS (
  SELECT 'FAILURE_CASE_NEEDED' AS quest_type, pattern_id, pattern_name, 25 AS score,
    successes||' successes, zero failures. Failure condition unvalidated. Survivor bias active.' AS brief,
    'Find a company that attempted ['||pattern_name||'] and failed. Search: Crunchbase shutdowns, TechCrunch graveyard, YC dark.' AS search_directive
  FROM gap_failure_case
  UNION ALL
  SELECT 'STRONG_VALIDATOR_NEEDED', pattern_id, pattern_name, 20,
    total_companies||' companies, zero with known profitability. Economics unconfirmed.',
    'Find a self-funded (5+ yrs) or public company using ['||pattern_name||']. Search: Indie Hackers, public 10-K filings.'
  FROM gap_strong_validator
  UNION ALL
  SELECT 'PATTERN_PROMOTION', pattern_id, pattern_name, observations_needed*15,
    'Conditions at ['||current_status||']. Need '||observations_needed||' observation(s) from a different industry.',
    'Find a company using the same structural approach as ['||pattern_name||'] in an unrepresented industry.'
  FROM gap_pattern_promotion WHERE observations_needed>0
  UNION ALL
  SELECT 'GEOGRAPHIC_WHITESPACE', pattern_id, pattern_name, 12,
    'Strong validators in ['||proven_in||'], zero in ['||missing_in||'].',
    'Find a company in ['||missing_in||'] using ['||pattern_name||'].'
  FROM gap_geographic_whitespace
  UNION ALL
  SELECT 'IMPLEMENTATION_FILL', pattern_id, pattern_name, observations_needed*10,
    'Only '||(3-observations_needed)||' observation(s). Conditional claims unvalidated until 3.',
    'Find any company using ['||pattern_name||']. Prioritise strong validators.'
  FROM gap_implementation_fill WHERE observations_needed>0
)
SELECT RANK() OVER (ORDER BY score DESC, quest_type, pattern_name) AS priority_rank,
  quest_type, pattern_name, score, brief, search_directive
FROM scored ORDER BY priority_rank;
