/**
 * Priority queries from the brief's Purpose section.
 *
 * These are the payoff queries — the analytical output of the dataset.
 * Add to this file as new queries become relevant.
 * Each function returns typed results from the Drizzle schema.
 *
 * Note: Some queries (graph traversal, cross-domain pattern matching)
 * require sufficient data to return meaningful results:
 *   - Single-domain queries: meaningful at 50+ records
 *   - Cross-domain queries: meaningful at 300+ records across 3+ domains
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * Q1: Find every successful expansion path that followed solving a payroll problem.
 *
 * Dependencies:
 * - company_timeline.problem_id must be filled on each entry
 * - company_timeline.capability_deployed must be filled on market_entry events
 * - companies.founded must be filled
 *
 * Returns: company name, expansion year, years since founding,
 *          new problem entered, capability that enabled the move.
 */
export async function payrollExpansionPaths() {
  return db.execute(sql`
    WITH payroll_companies AS (
      SELECT DISTINCT c.id, c.name, c.founded
      FROM companies c
      JOIN company_problems cp ON cp.company_id = c.id
      JOIN problems p ON p.id = cp.problem_id
      WHERE p.statement ILIKE '%wage%'
         OR p.statement ILIKE '%payroll%'
         OR p.statement ILIKE '%pay employees%'
    )
    SELECT
      pc.name AS company,
      pc.founded,
      ct.year AS expansion_year,
      ct.year - pc.founded AS years_since_founding,
      p.statement AS problem_entered,
      ct.capability_deployed,
      ct.description,
      ct.source
    FROM payroll_companies pc
    JOIN company_timeline ct ON ct.company_id = pc.id
    JOIN problems p ON p.id = ct.problem_id
    WHERE ct.event_type IN ('product_launch', 'market_entry')
      AND ct.problem_id IS NOT NULL
    ORDER BY pc.name, ct.year
  `);
}

/**
 * Q2: Which problems have few solution approaches despite company count > 1?
 * (Candidates for whitespace opportunities)
 *
 * Returns: problem statement, number of companies, number of distinct
 *          implementation patterns — low ratio = opportunity signal.
 */
export async function problemsWithFewApproaches() {
  return db.execute(sql`
    SELECT
      p.statement,
      COUNT(DISTINCT cp.company_id) AS company_count,
      COUNT(DISTINCT cip.implementation_pattern_id) AS pattern_count,
      ROUND(
        COUNT(DISTINCT cp.company_id)::numeric /
        NULLIF(COUNT(DISTINCT cip.implementation_pattern_id), 0),
        1
      ) AS companies_per_pattern
    FROM problems p
    JOIN company_problems cp ON cp.problem_id = p.id
    JOIN company_implementation_patterns cip ON cip.company_id = cp.company_id
    GROUP BY p.id, p.statement
    HAVING COUNT(DISTINCT cp.company_id) > 1
    ORDER BY pattern_count ASC, company_count DESC
  `);
}

/**
 * Q3: Business model convergence — which problems have every surviving solution
 * converged on the same business model?
 *
 * Returns problems where all linked implementation patterns share the same business_model.
 */
export async function businessModelConvergence() {
  return db.execute(sql`
    SELECT
      p.statement AS problem,
      ip.business_model,
      COUNT(DISTINCT ip.id) AS pattern_count,
      COUNT(DISTINCT cp.company_id) AS company_count
    FROM problems p
    JOIN company_problems cp ON cp.problem_id = p.id
    JOIN company_implementation_patterns cip ON cip.company_id = cp.company_id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    WHERE ip.business_model IS NOT NULL
    GROUP BY p.id, p.statement, ip.business_model
    HAVING COUNT(DISTINCT ip.id) = (
      SELECT COUNT(DISTINCT ip2.id)
      FROM company_implementation_patterns cip2
      JOIN implementation_patterns ip2 ON ip2.id = cip2.implementation_pattern_id
      JOIN company_problems cp2 ON cp2.company_id = cip2.company_id
      WHERE cp2.problem_id = p.id
    )
    ORDER BY company_count DESC
  `);
}

/**
 * Q4: Strong validators only — companies with known profitable signal.
 * The highest-confidence pattern evidence.
 */
export async function strongValidators() {
  return db.execute(sql`
    SELECT
      c.name,
      c.founded,
      c.country,
      c.stage,
      c.revenue_signal,
      ip.name AS implementation_pattern,
      sp.name AS solution_pattern,
      p.statement AS problem
    FROM companies c
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    LEFT JOIN solution_patterns sp ON sp.id = ip.solution_pattern_id
    JOIN company_problems cp ON cp.company_id = c.id
    JOIN problems p ON p.id = cp.problem_id
    WHERE c.evidence_weight = 'strong_validator'
      AND c.profitability_signal = 'known_profitable'
    ORDER BY c.founded ASC
  `);
}

/**
 * Q5: Disconfirming cases — failed companies with recorded failure patterns.
 * Essential for avoiding survivor bias in pattern analysis.
 */
export async function disconfirmingCases() {
  return db.execute(sql`
    SELECT
      c.name,
      c.founded,
      c.status,
      c.notable_facts,
      ip.name AS implementation_pattern,
      ip.status AS pattern_status
    FROM companies c
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    WHERE c.evidence_weight = 'disconfirming'
       OR c.status IN ('dead', 'acquired', 'pivoted')
    ORDER BY c.founded ASC
  `);
}
