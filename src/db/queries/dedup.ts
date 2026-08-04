/**
 * Deduplication utilities using pg_trgm similarity.
 *
 * Run these BEFORE creating any new Problem, Solution Pattern,
 * Implementation Pattern, Mechanism, or Capability record.
 *
 * A similarity score > 0.6 means the proposed name is likely a near-duplicate.
 * Review the results before proceeding.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

type SimilarRecord = {
  id: string;
  text: string;
  similarity: number;
};

/**
 * Check for near-duplicate problem statements before insert.
 * @example
 * const dupes = await findSimilarProblems(
 *   "Businesses cannot calculate wages while remaining tax-compliant"
 * );
 * if (dupes.length > 0) console.warn('Possible duplicates:', dupes);
 */
export async function findSimilarProblems(
  candidate: string,
  threshold = 0.4
): Promise<SimilarRecord[]> {
  const results = await db.execute(sql`
    SELECT id, statement AS text,
           similarity(statement, ${candidate}) AS similarity
    FROM problems
    WHERE similarity(statement, ${candidate}) > ${threshold}
    ORDER BY similarity DESC
    LIMIT 5
  `);
  return results.rows as SimilarRecord[];
}

export async function findSimilarSolutionPatterns(
  candidate: string,
  threshold = 0.4
): Promise<SimilarRecord[]> {
  const results = await db.execute(sql`
    SELECT id, name AS text,
           similarity(name, ${candidate}) AS similarity
    FROM solution_patterns
    WHERE similarity(name, ${candidate}) > ${threshold}
    ORDER BY similarity DESC
    LIMIT 5
  `);
  return results.rows as SimilarRecord[];
}

export async function findSimilarImplementationPatterns(
  candidate: string,
  threshold = 0.4
): Promise<SimilarRecord[]> {
  const results = await db.execute(sql`
    SELECT id, name AS text,
           similarity(name, ${candidate}) > ${threshold}
    FROM implementation_patterns
    WHERE similarity(name, ${candidate}) > ${threshold}
    ORDER BY similarity DESC
    LIMIT 5
  `);
  return results.rows as SimilarRecord[];
}
