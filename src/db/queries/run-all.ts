/**
 * Query Suite — Full one-shot run
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/queries/run-all.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

function section(title: string) {
  const line = "═".repeat(54);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
}

function row(label: string, value: any, indent = 2) {
  const pad = " ".repeat(indent);
  console.log(`${pad}${label.padEnd(22)} ${value ?? "—"}`);
}

async function run() {

  // ── Q1: Payroll expansion paths ──────────────────────────────────────────
  section("Q1 — Payroll expansion paths (with capability)");
  const q1 = await db.execute(sql`
    WITH payroll_cos AS (
      SELECT DISTINCT c.id, c.name, c.founded
      FROM companies c
      JOIN company_problems cp ON cp.company_id = c.id
      JOIN problems p ON p.id = cp.problem_id
      WHERE p.statement ILIKE '%wage%' OR p.statement ILIKE '%payroll%'
    )
    SELECT
      pc.name                                     AS company,
      pc.founded,
      ct.year                                     AS expansion_year,
      ct.year - pc.founded                        AS years_out,
      ct.event_type,
      p.statement                                 AS problem_entered,
      ct.capability_deployed
    FROM payroll_cos pc
    JOIN company_timeline ct ON ct.company_id = pc.id
    JOIN problems p ON p.id = ct.problem_id
    WHERE ct.event_type IN ('product_launch','market_entry','acquisition')
      AND ct.problem_id IS NOT NULL
      AND (p.statement NOT ILIKE '%wage%' AND p.statement NOT ILIKE '%payroll%')
    ORDER BY pc.founded ASC, ct.year ASC
  `) as any[];

  for (const r of q1) {
    console.log(`\n  ${r.company} (founded ${r.founded})`);
    console.log(`  → +${String(r.years_out).padStart(2)} yrs [${r.event_type}]: ${r.problem_entered}`);
    if (r.capability_deployed)
      console.log(`     ↳ ${r.capability_deployed}`);
  }

  // ── Q2: Strong validators ────────────────────────────────────────────────
  section("Q2 — Strong validators (Known profitable)");
  const q2 = await db.execute(sql`
    SELECT
      c.name, c.founded, c.country, c.revenue_signal,
      c.profitability_signal,
      ip.name  AS implementation_pattern,
      sp.name  AS solution_pattern
    FROM companies c
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    LEFT JOIN solution_patterns sp ON sp.id = ip.solution_pattern_id
    WHERE c.evidence_weight = 'strong_validator'
    ORDER BY c.founded ASC
  `) as any[];

  console.log(`\n  ${"Founded".padEnd(8)} ${"Revenue".padEnd(10)} ${"Country".padEnd(10)} Company`);
  console.log("  " + "─".repeat(70));
  for (const r of q2) {
    console.log(
      `  ${String(r.founded).padEnd(8)} ${(r.revenue_signal ?? "?").padEnd(10)} ${(r.country ?? "?").padEnd(10)} ${r.name}`
    );
    console.log(`  ${" ".repeat(28)} ↳ ${r.implementation_pattern}`);
  }

  // ── Q3: Business model convergence ───────────────────────────────────────
  section("Q3 — Business model convergence");
  const q3 = await db.execute(sql`
    SELECT
      ip.business_model,
      COUNT(DISTINCT ip.id)          AS pattern_count,
      COUNT(DISTINCT cip.company_id) AS company_count,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies
    FROM implementation_patterns ip
    JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
    JOIN companies c ON c.id = cip.company_id
    WHERE ip.business_model IS NOT NULL
    GROUP BY ip.business_model
    ORDER BY company_count DESC
  `) as any[];

  for (const r of q3) {
    console.log(`\n  [${r.company_count} co, ${r.pattern_count} pattern] ${r.business_model}`);
    console.log(`   ${r.companies}`);
  }

  // ── Q4: Evidence count + winning conditions by solution pattern ───────────
  section("Q4 — Solution patterns: evidence + winning conditions");
  const q4 = await db.execute(sql`
    SELECT
      sp.name,
      sp.evidence_count,
      sp.first_observed,
      sp.pattern_durability,
      sp.winning_condition_maturity  AS maturity,
      sp.winning_condition_valid_from AS valid_from,
      sp.winning_condition,
      sp.failure_condition
    FROM solution_patterns sp
    ORDER BY sp.evidence_count DESC
  `) as any[];

  for (const r of q4) {
    console.log(`\n  ${r.name}`);
    row("Evidence count:", `${r.evidence_count} companies`);
    row("First observed:", r.first_observed);
    row("Durability:", r.pattern_durability);
    row("Maturity:", r.maturity ?? "— (not yet filled)");
    row("Valid from:", r.valid_from);
    if (r.winning_condition) {
      console.log(`    Winning:  ${r.winning_condition}`);
      console.log(`    Failure:  ${r.failure_condition}`);
    }
  }

  // ── Q5: Disconfirming cases ───────────────────────────────────────────────
  section("Q5 — Disconfirming cases");
  const q5 = await db.execute(sql`
    SELECT
      c.name, c.founded, c.status, c.notable_facts,
      ip.name   AS implementation_pattern,
      ip.status AS pattern_status
    FROM companies c
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    WHERE c.evidence_weight = 'disconfirming'
       OR c.status IN ('dead','acquired','pivoted')
    ORDER BY c.founded
  `) as any[];

  for (const r of q5) {
    console.log(`\n  ${r.founded}  ${r.name}`);
    row("Company status:", r.status);
    row("Pattern:", `${r.implementation_pattern} [${r.pattern_status}]`);
    if (r.notable_facts)
      console.log(`    Notes: ${r.notable_facts.substring(0, 160)}...`);
  }

  // ── Q6: Capability → what it unlocked ────────────────────────────────────
  section("Q6 — Capabilities: what each unlocked (user query 1)");
  const q6 = await db.execute(sql`
    SELECT
      ct.capability_deployed,
      COUNT(*)  AS expansion_count,
      STRING_AGG(
        DISTINCT p.statement, E'\n                              '
        ORDER BY p.statement
      ) AS problems_entered,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies
    FROM company_timeline ct
    JOIN companies c ON c.id = ct.company_id
    LEFT JOIN problems p ON p.id = ct.problem_id
    WHERE ct.capability_deployed IS NOT NULL
      AND ct.event_type IN ('market_entry','product_launch','acquisition')
    GROUP BY ct.capability_deployed
    ORDER BY expansion_count DESC
  `) as any[];

  for (const r of q6) {
    console.log(`\n  [${r.expansion_count}x] ${r.capability_deployed}`);
    console.log(`       Problems unlocked: ${r.problems_entered ?? "—"}`);
    console.log(`       Companies:         ${r.companies}`);
  }

  // ── Q7: Adjacent problem × capability — frequency table ──────────────────
  section("Q7 — Adjacent problem × capability deployed (user query 2)");
  const q7 = await db.execute(sql`
    SELECT
      p.statement          AS adjacent_problem,
      ct.capability_deployed,
      COUNT(*)             AS observations,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies
    FROM company_timeline ct
    JOIN companies c ON c.id = ct.company_id
    JOIN problems p ON p.id = ct.problem_id
    WHERE ct.capability_deployed IS NOT NULL
      AND ct.event_type IN ('market_entry','product_launch','acquisition')
    GROUP BY p.statement, ct.capability_deployed
    ORDER BY observations DESC, p.statement
  `) as any[];

  for (const r of q7) {
    console.log(`\n  [${r.observations}x] ${r.adjacent_problem}`);
    console.log(`       Via: ${r.capability_deployed}`);
    console.log(`       Who: ${r.companies}`);
  }

  // ── Q8: Problem adjacency map ─────────────────────────────────────────────
  section("Q8 — Problem adjacency map (user query 3)");
  const q8 = await db.execute(sql`
    SELECT
      p1.statement                                  AS original_problem,
      p2.statement                                  AS adjacent_problem,
      COUNT(*)                                      AS observations,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies
    FROM company_timeline ct
    JOIN companies c ON c.id = ct.company_id
    JOIN company_problems cp ON cp.company_id = c.id
    JOIN problems p1 ON p1.id = cp.problem_id
    JOIN problems p2 ON p2.id = ct.problem_id
    WHERE ct.event_type IN ('market_entry','product_launch','acquisition')
      AND p1.id <> p2.id
      AND ct.problem_id IS NOT NULL
    GROUP BY p1.statement, p2.statement
    ORDER BY observations DESC
  `) as any[];

  for (const r of q8) {
    console.log(`\n  [${r.observations}x] ${r.original_problem}`);
    console.log(`       → ${r.adjacent_problem}`);
    console.log(`       Companies: ${r.companies}`);
  }

  // ── Q9: Entry path — greenfield vs. acquisition ──────────────────────────
  // Which companies entered an implementation pattern via organic build
  // vs. acquisition? Acquisition entries show a capability gap that had
  // to be closed externally — a signal about what's hard to build internally.
  section("Q9 — Entry path: greenfield vs. acquisition");
  const q9 = await db.execute(sql`
    SELECT
      ip.name                                         AS implementation_pattern,
      ct.event_type                                   AS entry_type,
      COUNT(DISTINCT c.id)                            AS company_count,
      STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS companies,
      ROUND(AVG(ct.year - c.founded), 1)              AS avg_years_to_enter
    FROM company_timeline ct
    JOIN companies c ON c.id = ct.company_id
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
    WHERE ct.event_type IN ('founding','acquisition','product_launch','market_entry')
      AND ct.implementation_pattern_id = ip.id
    GROUP BY ip.name, ct.event_type
    ORDER BY ip.name, ct.event_type
  `) as any[];

  for (const r of q9) {
    console.log(
      `\n  ${r.implementation_pattern}`
    );
    console.log(`  via ${r.entry_type}: ${r.company_count} co, avg ${r.avg_years_to_enter} yrs after founding`);
    console.log(`  ${r.companies}`);
  }

  // ── Q10: Capability acquisition — what was bought vs. built ──────────────
  // Tracks capability_acquired on timeline entries.
  // What capabilities are companies unable to build organically?
  section("Q10 — Acquired capabilities (what couldn't be built internally)");
  const q10 = await db.execute(sql`
    SELECT
      ct.capability_acquired,
      ct.event_type,
      ct.year,
      c.name        AS company,
      c.founded,
      ct.year - c.founded AS years_since_founding,
      ct.description
    FROM company_timeline ct
    JOIN companies c ON c.id = ct.company_id
    WHERE ct.capability_acquired IS NOT NULL
    ORDER BY c.founded ASC, ct.year ASC
  `) as any[];

  for (const r of q10) {
    console.log(`\n  ${r.company} (founded ${r.founded}) — year ${r.year} [+${r.years_since_founding} yrs]`);
    console.log(`  Acquired: ${r.capability_acquired}`);
    console.log(`  Via:      ${r.event_type}`);
    console.log(`  Context:  ${r.description.substring(0, 140)}...`);
  }

  // ── Q11: Market maturity — time compression ───────────────────────────────
  // How long did each company take to move from founding to
  // first expansion beyond core problem?
  // Reveals how market maturity compresses the expansion timeline.
  section("Q11 — Time compression: years to first adjacency move");
  const q11 = await db.execute(sql`
    WITH first_expansion AS (
      SELECT
        ct.company_id,
        MIN(ct.year) AS first_expansion_year
      FROM company_timeline ct
      JOIN problems p ON p.id = ct.problem_id
      JOIN company_problems cp_core
        ON cp_core.company_id = ct.company_id
        AND cp_core.problem_id != ct.problem_id
      WHERE ct.event_type IN ('product_launch','market_entry','acquisition')
        AND ct.problem_id IS NOT NULL
      GROUP BY ct.company_id
    )
    SELECT
      c.name,
      c.founded,
      fe.first_expansion_year,
      fe.first_expansion_year - c.founded  AS years_to_expand,
      c.stage,
      c.evidence_weight
    FROM companies c
    JOIN first_expansion fe ON fe.company_id = c.id
    ORDER BY c.founded ASC
  `) as any[];

  console.log(`\n  ${"Company".padEnd(42)} ${"Founded".padEnd(8)} ${"Expanded".padEnd(10)} ${"Years".padEnd(7)} Weight`);
  console.log("  " + "─".repeat(80));
  for (const r of q11) {
    console.log(
      `  ${r.name.padEnd(42)} ${String(r.founded).padEnd(8)} ${String(r.first_expansion_year).padEnd(10)} ${String(r.years_to_expand).padEnd(7)} ${r.evidence_weight}`
    );
  }

  // ── Q12: Dataset health ──────────────────────────────────────────────────
  section("Q12 — Dataset health");
  const health = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM companies)                    AS total_companies,
      (SELECT COUNT(*) FROM companies
        WHERE evidence_weight = 'strong_validator')       AS strong_validators,
      (SELECT COUNT(*) FROM companies
        WHERE evidence_weight = 'weak_validator')         AS weak_validators,
      (SELECT COUNT(*) FROM companies
        WHERE evidence_weight = 'disconfirming')          AS disconfirming,
      (SELECT COUNT(*) FROM problems)                     AS problems,
      (SELECT COUNT(*) FROM solution_patterns)            AS solution_patterns,
      (SELECT COUNT(*) FROM implementation_patterns)      AS impl_patterns,
      (SELECT COUNT(*) FROM company_timeline)             AS timeline_entries,
      (SELECT COUNT(*) FROM company_timeline
        WHERE capability_deployed IS NOT NULL)            AS timeline_with_capability,
      (SELECT COUNT(*) FROM boundary_cases)               AS boundary_cases,
      (SELECT COUNT(*) FROM solution_patterns
        WHERE winning_condition IS NOT NULL)              AS patterns_with_conditions
  `) as any[];

  const h = health[0];
  console.log("");
  row("Companies:", h.total_companies);
  row("  Strong validators:", h.strong_validators);
  row("  Weak validators:", h.weak_validators);
  row("  Disconfirming:", h.disconfirming);
  row("Problems:", h.problems);
  row("Solution patterns:", h.solution_patterns);
  row("  With W/F conditions:", h.patterns_with_conditions);
  row("Impl. patterns:", h.impl_patterns);
  row("Timeline entries:", h.timeline_entries);
  row("  With capability:", h.timeline_with_capability);
  row("Boundary cases:", h.boundary_cases);

  console.log("\n");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});