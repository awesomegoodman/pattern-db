import postgres from "postgres";
(async () => {
  const c = postgres(process.env.DATABASE_URL!, { prepare: false });
  await c.unsafe("CREATE OR REPLACE VIEW gap_pattern_promotion AS
SELECT sp.id AS pattern_id, sp.name AS pattern_name,
  COALESCE(sp.winning_condition_maturity::text,'no-conditions') AS current_status,
  sp.evidence_count,
  CASE COALESCE(sp.winning_condition_maturity::text,'no-conditions')
    WHEN 'no-conditions' THEN 2
    WHEN 'draft'         THEN GREATEST(0, 2 - sp.evidence_count)
    WHEN 'proposed'      THEN GREATEST(0, 3 - sp.evidence_count)
    ELSE 0 END AS observations_needed
FROM solution_patterns sp
WHERE CASE COALESCE(sp.winning_condition_maturity::text,'no-conditions')
  WHEN 'no-conditions' THEN 2
  WHEN 'draft'         THEN GREATEST(0, 2 - sp.evidence_count)
  WHEN 'proposed'      THEN GREATEST(0, 3 - sp.evidence_count)
  ELSE 0 END > 0");
  console.log("  view 1/6 created");
  await c.unsafe("CREATE OR REPLACE VIEW gap_implementation_fill AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
  ip.evidence_count, GREATEST(0, 3 - ip.evidence_count) AS observations_needed
FROM implementation_patterns ip
WHERE ip.status != 'dead' AND ip.evidence_count < 3");
  console.log("  view 2/6 created");
  await c.unsafe("CREATE OR REPLACE VIEW gap_strong_validator AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
  COUNT(DISTINCT c.id) AS total_companies,
  COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator') AS strong_validators
FROM implementation_patterns ip
JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
JOIN companies c ON c.id = cip.company_id
WHERE ip.status != 'dead'
GROUP BY ip.id, ip.name
HAVING COUNT(DISTINCT c.id) >= 2
   AND COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator') = 0");
  console.log("  view 3/6 created");
  await c.unsafe("CREATE OR REPLACE VIEW gap_failure_case AS
SELECT ip.id AS pattern_id, ip.name AS pattern_name,
  COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator') AS successes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'disconfirming')    AS failures
FROM implementation_patterns ip
JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
JOIN companies c ON c.id = cip.company_id
WHERE ip.status != 'dead'
GROUP BY ip.id, ip.name
HAVING COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator') >= 3
   AND COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'disconfirming') = 0");
  console.log("  view 4/6 created");
  await c.unsafe("CREATE OR REPLACE VIEW gap_geographic_whitespace AS
SELECT DISTINCT ip.id AS pattern_id, ip.name AS pattern_name,
  c_has.country AS proven_in, c_all.country AS missing_in
FROM implementation_patterns ip
JOIN company_implementation_patterns cip_has ON cip_has.implementation_pattern_id = ip.id
JOIN companies c_has ON c_has.id = cip_has.company_id
  AND c_has.evidence_weight = 'strong_validator' AND c_has.country IS NOT NULL
CROSS JOIN (SELECT DISTINCT country FROM companies WHERE country IS NOT NULL) c_all
WHERE c_all.country != c_has.country
  AND NOT EXISTS (
    SELECT 1 FROM company_implementation_patterns cip2
    JOIN companies c2 ON c2.id = cip2.company_id
    WHERE cip2.implementation_pattern_id = ip.id AND c2.country = c_all.country
  )");
  console.log("  view 5/6 created");
  await c.unsafe("CREATE OR REPLACE VIEW research_queue AS
WITH scored AS (
  SELECT 'FAILURE_CASE_NEEDED' AS quest_type, pattern_id, pattern_name, 25 AS score,
    successes||' successes, zero failures. Failure condition unvalidated. Survivor bias active.' AS brief,
    'Find a company that attempted ['||pattern_name||'] and failed. Signals: shut down, acquired at loss, pivoted away.' AS search_directive
  FROM gap_failure_case
  UNION ALL
  SELECT 'STRONG_VALIDATOR_NEEDED', pattern_id, pattern_name, 20,
    total_companies||' companies, zero with known profitability. Economics unconfirmed.',
    'Find a self-funded (5+ yrs) or public company using ['||pattern_name||'].'
  FROM gap_strong_validator
  UNION ALL
  SELECT 'PATTERN_PROMOTION', pattern_id, pattern_name, observations_needed * 15,
    'Conditions at ['||current_status||']. Need '||observations_needed||' observation(s) from a different industry.',
    'Find a company applying the same structural approach as ['||pattern_name||'] in an unrepresented industry.'
  FROM gap_pattern_promotion WHERE observations_needed > 0
  UNION ALL
  SELECT 'GEOGRAPHIC_WHITESPACE', pattern_id, pattern_name, 12,
    'Strong validators in ['||proven_in||'], zero observations in ['||missing_in||'].',
    'Find a company in ['||missing_in||'] using ['||pattern_name||'].'
  FROM gap_geographic_whitespace
  UNION ALL
  SELECT 'IMPLEMENTATION_FILL', pattern_id, pattern_name, observations_needed * 10,
    'Only '||(3 - observations_needed)||' observation(s). Conditional claims unvalidated until 3.',
    'Find any company using ['||pattern_name||']. Prioritise strong validators.'
  FROM gap_implementation_fill WHERE observations_needed > 0
)
SELECT RANK() OVER (ORDER BY score DESC, quest_type, pattern_name) AS priority_rank,
  quest_type, pattern_name, score, brief, search_directive
FROM scored ORDER BY priority_rank");
  console.log("  view 6/6 created");
  console.log("All views recreated.");
  await c.end();
})();
