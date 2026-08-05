/**
 * status.ts — Lightweight project status for context dumps and quick checks.
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/queries/status.ts
 *
 * Outputs: company counts by sector + evidence weight, pattern coverage,
 * research queue top 10, open opportunities, recent boundary cases.
 * Designed to stay fast and readable as the dataset grows.
 */

import postgres from "postgres";
const db = postgres(process.env.DATABASE_URL!, { prepare: false });

function bar(n: number, max: number, width = 20): string {
  const filled = Math.round((n / Math.max(max, 1)) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function evWeight(n: number): string {
  if (n >= 10) return "Established";
  if (n >= 5)  return "Strong";
  if (n >= 2)  return "Emerging";
  if (n === 1) return "Anecdotal";
  return "None";
}

async function run() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  Economic Pattern Database — Status");
  console.log("══════════════════════════════════════════════════");

  // ── Totals ──────────────────────────────────────────────────────────────────
  const [totals] = await db.unsafe(`
    SELECT
      (SELECT COUNT(*) FROM companies)               AS companies,
      (SELECT COUNT(*) FROM implementation_patterns) AS impl_patterns,
      (SELECT COUNT(*) FROM solution_patterns)       AS solution_patterns,
      (SELECT COUNT(*) FROM problems)                AS problems,
      (SELECT COUNT(*) FROM capabilities)            AS capabilities,
      (SELECT COUNT(*) FROM opportunities)           AS opportunities,
      (SELECT COUNT(*) FROM company_timeline)        AS timeline_entries
  `);
  console.log(`
  Companies:               ${totals.companies}
  Timeline entries:        ${totals.timeline_entries}
  Implementation patterns: ${totals.impl_patterns}
  Solution patterns:       ${totals.solution_patterns}
  Problems:                ${totals.problems}
  Capabilities:            ${totals.capabilities}
  Opportunities:           ${totals.opportunities}
  `);

  // ── Companies by solution pattern ─────────────────────────────────────────
  console.log("── Companies by solution pattern ────────────────");
  const bySector = await db.unsafe(`
    SELECT
      sp.name                                                                          AS sector,
      COUNT(DISTINCT c.id)                                                             AS total,
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator')      AS strong,
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'weak_validator')        AS weak,
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'disconfirming')         AS fail,
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'unknown')               AS unknown
    FROM companies c
    JOIN company_implementation_patterns cip ON cip.company_id = c.id
    JOIN implementation_patterns ip          ON ip.id = cip.implementation_pattern_id
    JOIN solution_patterns sp                ON sp.id = ip.solution_pattern_id
    GROUP BY sp.name
    ORDER BY total DESC
  `);

  if (bySector.length === 0) {
    console.log("  (no solution pattern linkages found)");
  } else {
    const maxD = Math.max(...bySector.map((r: any) => Number(r.total)));
    for (const r of bySector) {
      console.log(`  ${String(r.sector).padEnd(40)} ${bar(Number(r.total), maxD)} ${r.total} (✓${r.strong} ·${r.fail}✗)`);
    }
  }

  // ── Implementation patterns by evidence ────────────────────────────────────
  console.log("\n── Implementation patterns ──────────────────────");
  const patterns = await db.unsafe(`
    SELECT name, evidence_count, status
    FROM implementation_patterns
    ORDER BY evidence_count DESC, name
  `);
  const maxP = Math.max(...patterns.map((r: any) => Number(r.evidence_count)));
  for (const r of patterns) {
    const dead = r.status === "dead" ? " [dead]" : "";
    const ev = evWeight(Number(r.evidence_count));
    console.log(`  ${bar(Number(r.evidence_count), maxP, 12)} ${String(r.evidence_count).padStart(2)}  ${ev.padEnd(12)} ${r.name}${dead}`);
  }

  // ── Research queue top 10 ──────────────────────────────────────────────────
  console.log("\n── Research queue (top 10) ──────────────────────");
  try {
    const queue = await db.unsafe(`
      SELECT priority_rank, quest_type, pattern_name, score, search_directive
      FROM research_queue
      LIMIT 10
    `);
    for (const r of queue) {
      console.log(`  #${String(r.priority_rank).padEnd(3)} [${r.score}] ${r.quest_type}`);
      console.log(`       Pattern: ${r.pattern_name}`);
      console.log(`       Find:    ${r.search_directive}\n`);
    }
  } catch {
    console.log("  (research_queue view not yet created — run triggers-and-views.sql)");
  }

  // ── Open opportunities ─────────────────────────────────────────────────────
  console.log("── Open opportunities ───────────────────────────");
  const opps = await db.unsafe(`
    SELECT o.slug, o.name, o.status, o.generation_mode, o.well_formed,
           o.evidence_strength, p.statement AS problem,
           COUNT(op2.id) AS prediction_count
    FROM opportunities o
    JOIN problems p ON p.id = o.problem_id
    LEFT JOIN opportunity_predictions op2 ON op2.opportunity_id = o.id
    WHERE o.status NOT IN ('rejected')
    GROUP BY o.id, o.slug, o.name, o.status, o.generation_mode,
             o.well_formed, o.evidence_strength, p.statement
    ORDER BY o.status, o.created_at DESC
  `);
  if (opps.length === 0) {
    console.log("  (none)");
  }
  for (const r of opps) {
    const wf = r.well_formed ? "✓" : "⚠ draft";
    console.log(`  [${r.status}] ${r.name} (${r.generation_mode} · ${wf} · ${r.prediction_count} predictions)`);
    console.log(`          Problem: ${r.problem}\n`);
  }

  // ── Recent boundary cases ──────────────────────────────────────────────────
  console.log("── Recent boundary cases (last 5) ───────────────");
  const bcs = await db.unsafe(`
    SELECT company_name, option_a, option_b, chosen, reason
    FROM boundary_cases
    ORDER BY created_at DESC
    LIMIT 5
  `);
  if (bcs.length === 0) {
    console.log("  (none)");
  }
  for (const r of bcs) {
    console.log(`  ${r.company_name}: chose "${r.chosen}" — ${r.reason}`);
  }

  console.log("\n══════════════════════════════════════════════════\n");
  await db.end();
}

run().catch(err => { console.error(err); process.exit(1); });