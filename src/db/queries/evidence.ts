/**
 * Evidence count refresh utilities.
 *
 * evidence_count on Layer 2 entities (problems, solution_patterns,
 * implementation_patterns) is a denormalised computed field.
 * Run refreshAllEvidenceCounts() periodically — or after bulk inserts —
 * to keep it accurate.
 *
 * In Phase 2 this can be replaced with PostgreSQL triggers or
 * a scheduled Supabase Edge Function.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function refreshProblemEvidenceCounts() {
  await db.execute(sql`
    UPDATE problems p
    SET evidence_count = (
      SELECT COUNT(DISTINCT cp.company_id)
      FROM company_problems cp
      WHERE cp.problem_id = p.id
    )
  `);
}

export async function refreshImplementationPatternEvidenceCounts() {
  await db.execute(sql`
    UPDATE implementation_patterns ip
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM company_implementation_patterns cip
      WHERE cip.implementation_pattern_id = ip.id
    )
  `);
}

export async function refreshSolutionPatternEvidenceCounts() {
  await db.execute(sql`
    UPDATE solution_patterns sp
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM implementation_patterns ip
      JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
      WHERE ip.solution_pattern_id = sp.id
    )
  `);
}

export async function refreshAllEvidenceCounts() {
  await refreshProblemEvidenceCounts();
  await refreshImplementationPatternEvidenceCounts();
  await refreshSolutionPatternEvidenceCounts();
  console.log('✓ Evidence counts refreshed');
}
