import postgres from "postgres";

// Use a separate client for UI queries — read-only, can pool.
const q = postgres(process.env.DATABASE_URL!, { prepare: false });

export async function getImplementationPatterns() {
  return q.unsafe(`
    SELECT slug, name, status, business_model
    FROM implementation_patterns
    ORDER BY status DESC, name
  `);
}

export async function getProblems() {
  return q.unsafe(`SELECT slug, statement FROM problems ORDER BY statement`);
}

export async function getCapabilities() {
  return q.unsafe(`
    SELECT slug, name, status
    FROM capabilities
    WHERE status IN ('proposed','established')
    ORDER BY name
  `);
}

export async function getResearchQueue() {
  return q.unsafe(`
    SELECT priority_rank, quest_type, pattern_name, score, brief, search_directive
    FROM research_queue LIMIT 10
  `);
}

export async function getCompanies() {
  return q.unsafe(`
    SELECT c.slug, c.name, c.country, c.founded, c.status,
           c.evidence_weight, c.signal_confidence, c.research_queue_source,
           COUNT(DISTINCT ct.id)  AS timeline_count,
           COUNT(DISTINCT cip.implementation_pattern_id) AS pattern_count
    FROM companies c
    LEFT JOIN company_timeline ct ON ct.company_id = c.id
    LEFT JOIN company_implementation_patterns cip ON cip.company_id = c.id
    GROUP BY c.id, c.slug, c.name, c.country, c.founded, c.status,
             c.evidence_weight, c.signal_confidence, c.research_queue_source
    ORDER BY c.founded NULLS LAST, c.name
  `);
}

export async function getStats() {
  const [r] = await q.unsafe(`
    SELECT
      (SELECT COUNT(*) FROM companies)                                            AS total,
      (SELECT COUNT(*) FROM companies WHERE evidence_weight='strong_validator') AS strong,
      (SELECT COUNT(*) FROM companies WHERE evidence_weight='weak_validator')   AS weak,
      (SELECT COUNT(*) FROM companies WHERE evidence_weight='disconfirming')    AS disconfirming,
      (SELECT COUNT(*) FROM companies WHERE status='operating')                 AS operating,
      (SELECT COUNT(*) FROM company_timeline)                                    AS timeline_entries,
      (SELECT COUNT(DISTINCT country) FROM companies WHERE country IS NOT NULL)  AS countries
  `);
  return r;
}
