/**
 * seeder.ts — Generic seeding engine. Contains zero data.
 *
 * Data lives entirely in data.ts.
 * To add records: edit data.ts, append to the relevant array, run this file.
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/seeder.ts
 *
 * Idempotency:
 *   - Companies, timelines, problems, implementation patterns,
 *     join tables, boundary cases: onConflictDoNothing (additive)
 *   - Solution patterns: onConflictDoUpdate on winning/failure condition
 *     fields — data.ts is the source of truth for conditions
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import {
  companies,
  companyTimeline,
  problems,
  solutionPatterns,
  implementationPatterns,
  companyImplementationPatterns,
  companyProblems,
  solutionPatternProblems,
  boundaryCases,
} from "./schema";
import {
  PROBLEMS,
  SOLUTION_PATTERNS,
  IMPLEMENTATION_PATTERNS,
  COMPANIES,
  TIMELINE,
  COMPANY_IMPLEMENTATION_PATTERNS,
  COMPANY_PROBLEMS,
  SOLUTION_PATTERN_PROBLEMS,
  BOUNDARY_CASES,
} from "./data";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { logger: false });

async function seed() {
  await db.transaction(async (tx) => {

    // Insert order follows FK dependency graph.
    // Tables with no FK dependencies first, join tables last.

    console.log(`  Problems                  ${PROBLEMS.length} records`);
    await tx.insert(problems)
      .values(PROBLEMS)
      .onConflictDoNothing();

    // Solution patterns: upsert winning/failure conditions so data.ts
    // remains the source of truth. All other fields: additive only.
    console.log(`  Solution patterns         ${SOLUTION_PATTERNS.length} records`);
    await tx.insert(solutionPatterns)
      .values(SOLUTION_PATTERNS)
      .onConflictDoUpdate({
        target: solutionPatterns.id,
        set: {
          winningCondition:          sql`excluded.winning_condition`,
          failureCondition:          sql`excluded.failure_condition`,
          winningConditionMaturity:  sql`excluded.winning_condition_maturity`,
          winningConditionValidFrom: sql`excluded.winning_condition_valid_from`,
          patternDurability:         sql`excluded.pattern_durability`,
          updatedAt:                 sql`now()`,
        },
      });

    console.log(`  Implementation patterns   ${IMPLEMENTATION_PATTERNS.length} records`);
    await tx.insert(implementationPatterns)
      .values(IMPLEMENTATION_PATTERNS)
      .onConflictDoNothing();

    console.log(`  Companies                 ${COMPANIES.length} records`);
    await tx.insert(companies)
      .values(COMPANIES)
      .onConflictDoNothing();

    console.log(`  Timeline entries          ${TIMELINE.length} records`);
    await tx.insert(companyTimeline)
      .values(TIMELINE)
      .onConflictDoNothing();

    console.log(`  Company <> pattern        ${COMPANY_IMPLEMENTATION_PATTERNS.length} records`);
    await tx.insert(companyImplementationPatterns)
      .values(COMPANY_IMPLEMENTATION_PATTERNS)
      .onConflictDoNothing();

    console.log(`  Company <> problem        ${COMPANY_PROBLEMS.length} records`);
    await tx.insert(companyProblems)
      .values(COMPANY_PROBLEMS)
      .onConflictDoNothing();

    console.log(`  Pattern <> problem        ${SOLUTION_PATTERN_PROBLEMS.length} records`);
    await tx.insert(solutionPatternProblems)
      .values(SOLUTION_PATTERN_PROBLEMS)
      .onConflictDoNothing();

    console.log(`  Boundary cases            ${BOUNDARY_CASES.length} records`);
    await tx.insert(boundaryCases)
      .values(BOUNDARY_CASES)
      .onConflictDoNothing();
  });

  // Evidence counts are denormalised computed fields.
  // Refresh after every seeding run.
  await db.execute(sql`
    UPDATE problems p
    SET evidence_count = (
      SELECT COUNT(DISTINCT cp.company_id)
      FROM company_problems cp WHERE cp.problem_id = p.id
    )
  `);
  await db.execute(sql`
    UPDATE implementation_patterns ip
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM company_implementation_patterns cip
      WHERE cip.implementation_pattern_id = ip.id
    )
  `);
  await db.execute(sql`
    UPDATE solution_patterns sp
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM implementation_patterns ip
      JOIN company_implementation_patterns cip
        ON cip.implementation_pattern_id = ip.id
      WHERE ip.solution_pattern_id = sp.id
    )
  `);

  // Verification summary
  const counts = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM companies)               AS companies,
      (SELECT COUNT(*) FROM problems)                AS problems,
      (SELECT COUNT(*) FROM solution_patterns)       AS solution_patterns,
      (SELECT COUNT(*) FROM implementation_patterns) AS impl_patterns,
      (SELECT COUNT(*) FROM company_timeline)        AS timeline_entries,
      (SELECT COUNT(*) FROM boundary_cases)          AS boundary_cases,
      (SELECT COUNT(*) FROM solution_patterns
        WHERE winning_condition IS NOT NULL)         AS patterns_with_conditions
  `) as any[];

  const c = counts[0];
  console.log("");
  console.log("  ── Totals ──────────────────────────────");
  console.log(`  Companies:                ${c.companies}`);
  console.log(`  Problems:                 ${c.problems}`);
  console.log(`  Solution patterns:        ${c.solution_patterns} (${c.patterns_with_conditions} with conditions)`);
  console.log(`  Implementation patterns:  ${c.impl_patterns}`);
  console.log(`  Timeline entries:         ${c.timeline_entries}`);
  console.log(`  Boundary cases:           ${c.boundary_cases}`);
}

console.log("Seeding...");
seed()
  .then(() => {
    console.log("Done.");
    client.end();
  })
  .catch((err) => {
    console.error(err);
    client.end();
    process.exit(1);
  });