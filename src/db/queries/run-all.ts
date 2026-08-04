/**
 * Priority Query Suite — 8 queries
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/queries/run-all.ts
 *
 * Each query is also saved as a named Question in Metabase under:
 * Pattern DB — Priority Queries
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

function section(title: string) {
  const line = "═".repeat(64);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
}

function row(label: string, value: any, indent = 2) {
  console.log(`${" ".repeat(indent)}${label.padEnd(26)} ${value ?? "—"}`);
}

async function run() {

  // Q01: Winning conditions
  section("Q01 — Winning conditions: what predicts success and how proven");
  const q01 = await db.execute(sql`
    SELECT
      sp.name                          AS solution_pattern,
      sp.evidence_count                AS total_companies,
      sp.winning_condition_maturity    AS maturity,
      sp.winning_condition_valid_from  AS valid_from,
      sp.winning_condition,
      sp.failure_condition,
      COUNT(DISTINCT CASE WHEN c.evidence_weight = 'strong_validator'
        THEN c.id END)                 AS profitable_confirmations,
      COUNT(DISTINCT CASE WHEN c.evidence_weight = 'disconfirming'
        THEN c.id END)                 AS disconfirming_cases,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS grounded_by
    FROM solution_patterns sp
    JOIN implementation_patterns ip
      ON ip.solution_pattern_id = sp.id
    JOIN company_implementation_patterns cip
      ON cip.implementation_pattern_id = ip.id
    JOIN companies c
      ON c.id = cip.company_id
    WHERE sp.winning_condition IS NOT NULL
    GROUP BY
      sp.id, sp.name, sp.evidence_count,
      sp.winning_condition_maturity,
      sp.winning_condition_valid_from,
      sp.winning_condition, sp.failure_condition
    ORDER BY sp.evidence_count DESC
  `) as any[];

  for (const r of q01) {
    console.log(`\n  ${r.solution_pattern}`);
    row("Total companies:", r.total_companies);
    row("Profitable confirmations:", r.profitable_confirmations);
    row("Disconfirming cases:", r.disconfirming_cases);
    row("Maturity:", r.maturity);
    row("Valid from:", r.valid_from);
    console.log(`  ${"Winning:".padEnd(26)} ${r.winning_condition}`);
    console.log(`  ${"Failure:".padEnd(26)} ${r.failure_condition}`);
    console.log(`  ${"Grounded by:".padEnd(26)} ${r.grounded_by}`);
  }

  // Q02: Business model convergence
  section("Q02 — Business model convergence: what the market has decided");
  const q02 = await db.execute(sql`
    SELECT
      p.statement                      AS problem,
      ip.business_model,
      COUNT(DISTINCT c.id)             AS total_companies,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'strong_validator')  AS profitable_confirmations,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'disconfirming')     AS failures,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies
    FROM problems p
    JOIN company_problems cp
      ON cp.problem_id = p.id
    JOIN companies c
      ON c.id = cp.company_id
    JOIN company_implementation_patterns cip
      ON cip.company_id = c.id
    JOIN implementation_patterns ip
      ON ip.id = cip.implementation_pattern_id
    WHERE ip.business_model IS NOT NULL
    GROUP BY p.statement, ip.business_model
    ORDER BY profitable_confirmations DESC, total_companies DESC
  `) as any[];

  for (const r of q02) {
    console.log(`\n  ${r.problem}`);
    console.log(`  -> ${r.business_model}`);
    row("Total / Profitable / Failed:", `${r.total_companies} / ${r.profitable_confirmations} / ${r.failures}`);
    row("Companies:", r.companies);
  }

  // Q03: Expansion sequence
  section("Q03 — Expansion sequence: what comes after any starting problem");
  const q03 = await db.execute(sql`
    SELECT
      p_start.statement                AS starting_problem,
      ct.year - c.founded              AS years_out,
      p_next.statement                 AS problem_entered,
      ct.capability_deployed,
      COUNT(*)                         AS times_observed,
      COUNT(*) FILTER (
        WHERE c.evidence_weight = 'strong_validator') AS confirmed_by_profitable,
      STRING_AGG(DISTINCT c.name, ', '
        ORDER BY c.name)               AS companies
    FROM companies c
    JOIN company_problems cp_start ON cp_start.company_id = c.id
    JOIN problems p_start          ON p_start.id = cp_start.problem_id
    JOIN company_timeline ct       ON ct.company_id = c.id
    JOIN problems p_next           ON p_next.id = ct.problem_id
    WHERE ct.event_type IN ('product_launch', 'market_entry', 'acquisition')
      AND ct.problem_id IS NOT NULL
      AND p_start.id <> p_next.id
    GROUP BY p_start.statement, (ct.year - c.founded),
             p_next.statement, ct.capability_deployed
    ORDER BY times_observed DESC, years_out ASC
  `) as any[];

  for (const r of q03) {
    console.log(`\n  FROM: ${r.starting_problem}`);
    console.log(`  INTO: ${r.problem_entered}`);
    row("Years out:", r.years_out);
    row("Observed / Profitable:", `${r.times_observed} / ${r.confirmed_by_profitable}`);
    if (r.capability_deployed) row("Capability:", r.capability_deployed);
    row("Companies:", r.companies);
  }

  // Q04: Capability reuse
  section("Q04 — Capability reuse: which capabilities unlock the most expansion");
  const q04 = await db.execute(sql`
    SELECT
      cap.name                         AS capability,
      cap.status                       AS maturity,
      (SELECT COUNT(DISTINCT sector_id)
         FROM capability_sector_evidence
        WHERE capability_id = cap.id)  AS sectors_confirmed,
      COUNT(*)                         AS expansion_events,
      COUNT(*) FILTER (
        WHERE c.evidence_weight = 'strong_validator') AS confirmed_by_profitable,
      STRING_AGG(
        DISTINCT p.statement, ' | '
        ORDER BY p.statement)          AS problems_unlocked,
      STRING_AGG(
        DISTINCT c.name, ', '
        ORDER BY c.name)               AS companies
    FROM company_timeline ct
    JOIN capabilities cap ON cap.id   = ct.capability_id
    JOIN companies c      ON c.id     = ct.company_id
    JOIN problems p       ON p.id     = ct.problem_id
    WHERE ct.capability_id IS NOT NULL
      AND ct.event_type IN ('market_entry', 'product_launch', 'acquisition')
    GROUP BY cap.id, cap.name, cap.status
    ORDER BY expansion_events DESC, confirmed_by_profitable DESC
  `) as any[];

  for (const r of q04) {
    console.log(`\n  ${r.capability} [${r.maturity} — ${r.sectors_confirmed} sector(s)]`);
    row("Expansion events:", r.expansion_events);
    row("Confirmed by profitable:", r.confirmed_by_profitable);
    row("Problems unlocked:", r.problems_unlocked);
    row("Companies:", r.companies);
  }

  // Q05: Dead patterns
  section("Q05 — Dead patterns: what failed and why");
  const q05 = await db.execute(sql`
    SELECT
      ip.name                          AS implementation_pattern,
      ip.business_model,
      ip.status                        AS pattern_status,
      c.name                           AS company,
      c.founded,
      c.status                         AS company_status,
      c.evidence_weight,
      c.funding_history,
      c.notable_facts
    FROM implementation_patterns ip
    JOIN company_implementation_patterns cip
      ON cip.implementation_pattern_id = ip.id
    JOIN companies c
      ON c.id = cip.company_id
    WHERE ip.status = 'dead'
       OR c.evidence_weight = 'disconfirming'
       OR c.status IN ('dead', 'acquired', 'pivoted')
    ORDER BY ip.name, c.founded
  `) as any[];

  for (const r of q05) {
    console.log(`\n  ${r.company} (founded ${r.founded})`);
    row("Pattern:", `${r.implementation_pattern} [${r.pattern_status}]`);
    row("Company status:", r.company_status);
    row("Evidence weight:", r.evidence_weight);
    row("Business model:", r.business_model);
    if (r.notable_facts)
      console.log(`  ${"Notes:".padEnd(26)} ${r.notable_facts.substring(0, 200)}...`);
  }

  // Q06: Structural gaps
  section("Q06 — Structural gaps: problems with few distinct solution approaches");
  const q06 = await db.execute(sql`
    SELECT
      p.statement                      AS problem,
      COUNT(DISTINCT cip.implementation_pattern_id)  AS pattern_count,
      COUNT(DISTINCT cp.company_id)                  AS company_count,
      COUNT(DISTINCT cp.company_id) FILTER (
        WHERE c.evidence_weight = 'strong_validator') AS profitable_companies,
      ROUND(
        COUNT(DISTINCT cp.company_id)::numeric /
        NULLIF(COUNT(DISTINCT cip.implementation_pattern_id), 0), 1
      )                                AS companies_per_pattern,
      STRING_AGG(DISTINCT ip.name, ' | '
        ORDER BY ip.name)              AS patterns,
      STRING_AGG(DISTINCT ip.name, ' | ')
        FILTER (WHERE ip.status = 'dead') AS dead_patterns
    FROM problems p
    JOIN company_problems cp
      ON cp.problem_id = p.id
    JOIN companies c
      ON c.id = cp.company_id
    JOIN company_implementation_patterns cip
      ON cip.company_id = c.id
    JOIN implementation_patterns ip
      ON ip.id = cip.implementation_pattern_id
    GROUP BY p.id, p.statement
    ORDER BY pattern_count ASC, profitable_companies DESC
  `) as any[];

  for (const r of q06) {
    console.log(`\n  ${r.problem}`);
    row("Patterns / Companies:", `${r.pattern_count} / ${r.company_count}`);
    row("Profitable:", r.profitable_companies);
    row("Companies per pattern:", r.companies_per_pattern);
    row("Patterns:", r.patterns);
    if (r.dead_patterns) row("Dead patterns:", r.dead_patterns);
  }

  // Q07: Unvalidated demand
  section("Q07 — Unvalidated demand: capital deployed, economics unproven");
  const q07 = await db.execute(sql`
    SELECT
      p.statement                      AS problem,
      COUNT(DISTINCT c.id)             AS total_companies,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'strong_validator')  AS profitable_confirmations,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'weak_validator')    AS funded_unproven,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'disconfirming')     AS failed,
      STRING_AGG(DISTINCT ip.name, ' | '
        ORDER BY ip.name)              AS patterns_attempted,
      STRING_AGG(DISTINCT c.name, ', '
        ORDER BY c.name)               AS companies
    FROM problems p
    JOIN company_problems cp
      ON cp.problem_id = p.id
    JOIN companies c
      ON c.id = cp.company_id
    JOIN company_implementation_patterns cip
      ON cip.company_id = c.id
    JOIN implementation_patterns ip
      ON ip.id = cip.implementation_pattern_id
    GROUP BY p.id, p.statement
    HAVING COUNT(DISTINCT c.id) FILTER (
      WHERE c.evidence_weight = 'strong_validator') = 0
    ORDER BY total_companies DESC, funded_unproven DESC
  `) as any[];

  for (const r of q07) {
    console.log(`\n  ${r.problem}`);
    row("Total / Funded / Failed:", `${r.total_companies} / ${r.funded_unproven} / ${r.failed}`);
    row("Patterns attempted:", r.patterns_attempted);
    row("Companies:", r.companies);
  }

  // Q08: Pattern longevity
  section("Q08 — Pattern longevity: which patterns have survived decades");
  const q08 = await db.execute(sql`
    SELECT
      ip.name                          AS implementation_pattern,
      ip.first_observed,
      DATE_PART('year', NOW())::int
        - ip.first_observed            AS years_alive,
      ip.status                        AS pattern_status,
      COUNT(DISTINCT c.id)             AS total_companies,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'strong_validator')  AS profitable_today,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'weak_validator')    AS funded_unproven,
      COUNT(DISTINCT c.id) FILTER (
        WHERE c.evidence_weight = 'disconfirming')     AS failed,
      STRING_AGG(DISTINCT c.name, ', '
        ORDER BY c.name)               AS companies
    FROM implementation_patterns ip
    JOIN company_implementation_patterns cip
      ON cip.implementation_pattern_id = ip.id
    JOIN companies c
      ON c.id = cip.company_id
    WHERE ip.first_observed IS NOT NULL
      AND ip.status != 'dead'
    GROUP BY ip.id, ip.name, ip.first_observed, ip.status
    ORDER BY years_alive DESC, profitable_today DESC
  `) as any[];

  for (const r of q08) {
    console.log(`\n  ${r.implementation_pattern}`);
    row("First observed:", r.first_observed);
    row("Years alive:", r.years_alive);
    row("Profitable today:", r.profitable_today);
    row("Funded unproven:", r.funded_unproven);
    row("Failed:", r.failed);
    row("Companies:", r.companies);
  }

  console.log("\n");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});