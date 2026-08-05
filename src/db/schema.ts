/**
 * Economic Pattern Database — Phase 1 Schema
 *
 * Implements the Minimum Viable Record (MVR) field set.
 * Enrichment fields (capabilities, mechanisms, winning conditions, etc.)
 * are added in Phase 2 after the ontology is stable.
 *
 * Layer structure:
 *   Layer 1 — Observation:  companies, company_timeline
 *   Layer 2 — Derived:      problems, solution_patterns, implementation_patterns
 *   Catalog: boundary_cases
 *
 * Entry direction: bottom-up (Company first, abstract upward).
 * Read direction:  top-down (Problem → Solution Pattern → Implementation Pattern → Company).
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// All enums are defined upfront — even those used only in Phase 2 enrichment —
// so the schema never needs enum migrations as enrichment progresses.
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceLabelEnum = pgEnum('evidence_label', [
  'known',
  'estimated',
  'unknown',
]);

export const evidenceWeightEnum = pgEnum('evidence_weight', [
  'strong_validator',   // Known profitable, sustained, self-funded or unit-economics positive
  'weak_validator',     // Operating but externally funded, unproven economics
  'disconfirming',      // Attempted the pattern and failed — failure mode recorded
  'unknown',            // Insufficient information
]);

export const companyStatusEnum = pgEnum('company_status', [
  'operating',
  'acquired',
  'dead',
  'pivoted',
  'merged',
]);

export const profitabilitySignalEnum = pgEnum('profitability_signal', [
  'known_profitable',
  'known_unprofitable',
  'estimated_profitable_proxy', // No external funding + 5+ years operating (Tier 6 inference)
  'unknown',
]);

export const signalConfidenceEnum = pgEnum('signal_confidence', [
  'high', // Public financials, direct reporting
  'low',  // Inference or proxy
]);

export const maturityStatusEnum = pgEnum('maturity_status', [
  'draft',     // < 2 grounding observations or symmetry not verified
  'proposed',  // 2+ observations, symmetry verified, not cross-industry tested
  'established', // 3+ observations across 2+ unrelated industries
]);

export const timelineEventTypeEnum = pgEnum('timeline_event_type', [
  'founding',
  'product_launch',
  'market_entry',
  'acquisition',
  'pivot',
  'shutdown',
  'capability_acquisition',
  'funding',
]);

export const relationshipConfidenceEnum = pgEnum('relationship_confidence', [
  'high',
  'medium',
  'low',
]);

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — OBSERVATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * COMPANY
 * The primary observational unit. Every other record flows from here.
 * Data entry always starts with this table.
 *
 * MVR fields only. Enrichment fields (acquisition history, founding team,
 * detailed ICP) are added as text notes in notableFacts until Phase 2.
 */
export const capabilityStatusEnum = pgEnum('capability_status', [
  'candidate',    // Created. No cross-sector evidence yet.
  'proposed',     // 1+ sectors documented. Usable in timeline entries.
  'established',  // 3+ distinct sectors documented. Cross-industry confirmed.
  'deprecated',   // Retired. No new references allowed.
]);

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique(),
    name: text('name').notNull(),

    // ── Core identity (MVR) ──────────────────────────────────────────────────
    founded: integer('founded'),                            // Year (Known)
    country: text('country'),                               // HQ geography (Known)
    status: companyStatusEnum('status').notNull().default('operating'), // (Known)
    stage: text('stage'),                                   // 'public' | 'unicorn' | 'series_[a-g]' | 'bootstrapped' | 'yc'

    // ── Economic signal (MVR) ────────────────────────────────────────────────
    fundingHistory: text('funding_history'),
    // Format: "Seed $6.1M 2012 (YC), Series A $20M 2013, Series B $60M 2014"
    // "none" is a valid and significant entry.

    revenueSignal: text('revenue_signal'),
    // Controlled values: '<10M' | '10-100M' | '100M-1B' | '>1B' | null

    profitabilitySignal: profitabilitySignalEnum('profitability_signal')
      .notNull()
      .default('unknown'),

    profitabilityProxyApplied: boolean('profitability_proxy_applied').default(false),
    // True when: no external funding + 5+ years operating.
    // Tier 6 inference — not equivalent to known_profitable.

    evidenceWeight: evidenceWeightEnum('evidence_weight').notNull().default('unknown'),
    signalConfidence: signalConfidenceEnum('signal_confidence').notNull().default('low'),

    // ── Notes ────────────────────────────────────────────────────────────────
    notableFacts: text('notable_facts'),
  researchQueueSource: text('research_queue_source'),
  // Format: "QUEST_TYPE:pattern-slug[:geography]" or "OFF_QUEUE:reason"
  // See docs/candidate-selection.md for the full specification.
    // Anything company-specific that doesn't belong on a pattern record.
    // Phase 1: also captures founding team, acquisition history, etc.

    // ── Metadata ─────────────────────────────────────────────────────────────
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index('companies_name_idx').on(t.name),
    statusIdx: index('companies_status_idx').on(t.status),
    foundedIdx: index('companies_founded_idx').on(t.founded),
  })
);

/**
 * COMPANY TIMELINE
 * Required sub-record on every Company. Minimum 2 entries.
 * This is where expansion trajectory data lives.
 * Time is a first-class dimension — without Timeline entries, no temporal query works.
 *
 * CRITICAL FIELD: capabilityDeployed
 * Records which existing capability made an expansion tractable at low marginal cost.
 * This converts timing data ("Stripe entered lending at year 9") into causal insight
 * ("Stripe entered lending at year 9 using its existing banking integration and
 * regulatory compliance capability"). Never skip this field on market_entry events.
 */
export const companyTimeline = pgTable(
  'company_timeline',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),

    year: integer('year').notNull(),
    eventType: timelineEventTypeEnum('event_type').notNull(),
    description: text('description').notNull(),

    // ── Pattern links (stub FKs — point to Layer 2 tables) ──────────────────
    implementationPatternId: uuid('implementation_pattern_id'),
    // FK to implementation_patterns.id — set after pattern record exists
    problemId: uuid('problem_id'),
    // FK to problems.id — set after problem record exists

    // ── Capability tracking ──────────────────────────────────────────────────
    capabilityId: uuid('capability_id').references(() => capabilities.id),
  // FK to capabilities.id — set alongside capability_label.
  // Guard trigger: capability must be at least 'proposed' to be referenced.
  capabilityLabel: text('capability_label'),
  // Controlled vocabulary slug — enables grouping in Q04.
  // Set alongside capability_deployed (free text detail).
  // Valid values: see CAPABILITY_LABELS in src/db/data.ts
  capabilityDeployed: text('capability_deployed'),
    // Which existing capability made this expansion tractable.
    // Free text in Phase 1 (e.g. "banking integrations and regulatory expertise").
    // Becomes a FK to capabilities table in Phase 2.

    capabilityAcquired: text('capability_acquired'),
    // If this event was a capability acquisition.
    // Free text in Phase 1.

    source: text('source').notNull(),
    // What grounds this entry: "Wikipedia", "Sacra estimate", "SEC filing", etc.

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    companyIdIdx: index('timeline_company_id_idx').on(t.companyId),
    yearIdx: index('timeline_year_idx').on(t.year),
    companyYearIdx: index('timeline_company_year_idx').on(t.companyId, t.year),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — DERIVED ABSTRACTIONS (Phase 1: stubs only)
// Full enrichment fields added in Phase 2 via migrations.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PROBLEMS
 * Recurring economic pains stated in the customer's language, without solution implied.
 *
 * Abstraction test: Is this a specific recurring pain a customer experiences,
 * stated without reference to any solution? If it implies a solution or requires
 * knowing the industry to understand, restate it.
 *
 * Correct:   "Businesses cannot calculate and disburse wages while remaining tax-compliant."
 * Incorrect: "Businesses need payroll software." (implies a solution)
 */
export const problems = pgTable(
  'problems',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique(),
    statement: text('statement').notNull().unique(),
    // BEFORE creating a new record: run the deduplication query (pg_trgm similarity > 0.6)
    // to check for near-duplicate existing records.

    evidenceCount: integer('evidence_count').notNull().default(0),
    // Computed. Refresh periodically:
    // UPDATE problems p SET evidence_count = (
    //   SELECT COUNT(DISTINCT c.id) FROM companies c
    //   JOIN company_problems cp ON cp.company_id = c.id
    //   WHERE cp.problem_id = p.id
    // );

    lifecycle: text('lifecycle'),
    // 'emerging' | 'growing' | 'mature' | 'declining' | 'dead'

    notes: text('notes'),
    // Phase 1: capture status_quo_pattern, underlying_constraint, etc. as free text.
    // These become proper FK fields in Phase 2.

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    statementIdx: index('problems_statement_idx').on(t.statement),
  })
);

/**
 * SOLUTION PATTERNS
 * The structural bet against a problem — abstract approach stripped of
 * customer specifics, business model, and distribution.
 *
 * Abstraction test: Could multiple meaningfully different implementations
 * exist under this name? If yes: right level. If only one fits: too specific,
 * belongs at Implementation Pattern level.
 *
 * Correct:   "Payroll infrastructure" (bureau, cloud SaaS, embedded API all fit)
 * Incorrect: "Per-employee SaaS payroll for US SMBs" (only one class fits)
 *
 * Winning/Failure Condition: left NULL until 3+ company observations exist.
 * Never fill one without the other. The failure condition must be the direct
 * logical inverse of the winning condition at the same abstraction level.
 */
export const solutionPatterns = pgTable(
  'solution_patterns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),

    evidenceCount: integer('evidence_count').notNull().default(0),
    firstObserved: integer('first_observed'),
    // Approximate year this structural approach first appeared in any market.

    patternDurability: text('pattern_durability'),
    // 'emerging' | 'established' | 'decades-old' | 'declining'

    // ── Winning/Failure Condition pair ───────────────────────────────────────
    // Required as a logical pair — fill both or neither.
    // Both null = valid incomplete record.
    // One filled without the other = schema violation.
    winningCondition: text('winning_condition'),
    failureCondition: text('failure_condition'),
    // Must be the direct logical inverse at the same abstraction level.

    winningConditionMaturity: maturityStatusEnum('winning_condition_maturity'),
    winningConditionValidFrom: integer('winning_condition_valid_from'),
    // Required when filling the condition pair. A condition without valid_from is incomplete.
    winningConditionValidThrough: integer('winning_condition_valid_through'),
    // Nullable — leave empty if condition is believed to currently hold.
    winningConditionSupersededBy: uuid('winning_condition_superseded_by'),
    // Self-reference: link to the replacement condition pair when retiring this one.

    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index('solution_patterns_name_idx').on(t.name),
  })
);

/**
 * IMPLEMENTATION PATTERNS
 * The concrete instantiation of a solution pattern:
 * specific customer, business model, distribution, economics, moat.
 *
 * Abstraction test: Could two companies instantiate this with meaningfully
 * different execution while still fitting the description?
 * If yes: right level. If only one company fits: that's a Company fact.
 *
 * Correct:   "Cloud-native SMB payroll SaaS" (Gusto, Paycom, Paylocity all fit)
 * Incorrect: "Gusto's accountant referral + embedded API" (Company fact)
 *
 * MECHANISM IS FILLED LAST — after all other fields are complete.
 * It carries 'estimated' by default. Use the tiebreaker rule:
 * assign the mechanism that explains why customers pay, not how the product works.
 */
export const implementationPatterns = pgTable(
  'implementation_patterns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique(),
    name: text('name').notNull().unique(),

    solutionPatternId: uuid('solution_pattern_id')
      .references(() => solutionPatterns.id),
    // FK to parent solution pattern.

    evidenceCount: integer('evidence_count').notNull().default(0),
    firstObserved: integer('first_observed'),

    status: text('status'),
    // 'live' | 'dead' | 'niche'
    // 'dead' = the pattern itself is no longer viable (e.g., IP-004: compliance-led free HR SaaS)

    businessModel: text('business_model'),
    // Free text in Phase 1: "per-employee-per-month subscription"
    // Becomes FK to business_models table in Phase 2.

    pricingSignal: text('pricing_signal'),
    // 'free' | '<100/mo' | '1k+/mo' | 'enterprise'

    mechanism: text('mechanism'),
    // FILL LAST. Free text in Phase 1 (e.g. "abstraction", "delegation").
    // Estimated by default. Becomes FK to mechanisms table in Phase 2.

    notes: text('notes'),
    // Phase 1: capture moat, status_quo_displaced, capabilities_required as free text.

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index('implementation_patterns_name_idx').on(t.name),
    solutionPatternIdx: index('impl_patterns_solution_pattern_idx').on(t.solutionPatternId),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// JOIN TABLES
// ─────────────────────────────────────────────────────────────────────────────

/** Company ↔ Implementation Pattern (many-to-many) */
export const companyImplementationPatterns = pgTable(
  'company_implementation_patterns',
  {
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    implementationPatternId: uuid('implementation_pattern_id')
      .references(() => implementationPatterns.id, { onDelete: 'cascade' })
      .notNull(),
    confidence: relationshipConfidenceEnum('confidence').notNull().default('high'),
    source: text('source'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.implementationPatternId] }),
    companyIdx: index('cip_company_idx').on(t.companyId),
    patternIdx: index('cip_pattern_idx').on(t.implementationPatternId),
  })
);

/** Company ↔ Problem (many-to-many) */
export const companyProblems = pgTable(
  'company_problems',
  {
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    problemId: uuid('problem_id')
      .references(() => problems.id, { onDelete: 'cascade' })
      .notNull(),
    confidence: relationshipConfidenceEnum('confidence').notNull().default('high'),
    source: text('source'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.problemId] }),
    companyIdx: index('cp_company_idx').on(t.companyId),
    problemIdx: index('cp_problem_idx').on(t.problemId),
  })
);

/** Solution Pattern ↔ Problem (many-to-many) */
export const solutionPatternProblems = pgTable(
  'solution_pattern_problems',
  {
    solutionPatternId: uuid('solution_pattern_id')
      .references(() => solutionPatterns.id, { onDelete: 'cascade' })
      .notNull(),
    problemId: uuid('problem_id')
      .references(() => problems.id, { onDelete: 'cascade' })
      .notNull(),
    confidence: relationshipConfidenceEnum('confidence').notNull().default('high'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.solutionPatternId, t.problemId] }),
    patternIdx: index('spp_pattern_idx').on(t.solutionPatternId),
    problemIdx: index('spp_problem_idx').on(t.problemId),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// BOUNDARY CASE CATALOG
// Log every ambiguous classification decision here.
// Prevents re-litigating the same calls as the dataset grows.
// If the same boundary is hit 3+ times in different directions: schema problem.
// ─────────────────────────────────────────────────────────────────────────────

export const boundaryCases = pgTable(
  'boundary_cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyName: text('company_name').notNull(),
    optionA: text('option_a').notNull(),
    optionB: text('option_b').notNull(),
    chosen: text('chosen').notNull(),
    reason: text('reason').notNull(),
    // One sentence. Why this option over the other.
    resolvedAt: timestamp('resolved_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    companyNameIdx: index('bc_company_name_idx').on(t.companyName),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// DRIZZLE RELATIONS
// Required for Drizzle's type-safe relational query API.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY VOCABULARY (Layer 2 — cross-cutting)
// Governance: docs/candidate-selection.md
// ─────────────────────────────────────────────────────────────────────────────

export const sectors = pgTable(
  'sectors',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    slug:      text('slug').notNull().unique(),
    name:      text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index('sectors_slug_idx').on(t.slug),
  })
);

export const capabilities = pgTable(
  'capabilities',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    slug:        text('slug').notNull().unique(),
    name:        text('name').notNull(),
    description: text('description').notNull(),
    status:      capabilityStatusEnum('status').notNull().default('candidate'),
    createdAt:   timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    slugIdx:   index('capabilities_slug_idx').on(t.slug),
    statusIdx: index('capabilities_status_idx').on(t.status),
  })
);

export const capabilitySectorEvidence = pgTable(
  'capability_sector_evidence',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    capabilityId:   uuid('capability_id')
                      .references(() => capabilities.id, { onDelete: 'cascade' })
                      .notNull(),
    sectorId:       uuid('sector_id')
                      .references(() => sectors.id)
                      .notNull(),
    exampleCompany: text('example_company').notNull(),
    evidenceNote:   text('evidence_note').notNull(),
    timelineId:     uuid('timeline_id').references(() => companyTimeline.id),
    createdAt:      timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqCapSector: unique('cse_unique_cap_sector').on(t.capabilityId, t.sectorId),
    capIdx:        index('cse_capability_idx').on(t.capabilityId),
  })
);

export const capabilitySynonyms = pgTable(
  'capability_synonyms',
  {
    synonymSlug:  text('synonym_slug').primaryKey(),
    capabilityId: uuid('capability_id')
                    .references(() => capabilities.id)
                    .notNull(),
    addedAt:      timestamp('added_at').defaultNow().notNull(),
  }
);

export const companiesRelations = relations(companies, ({ many }) => ({
  timeline: many(companyTimeline),
  implementationPatterns: many(companyImplementationPatterns),
  problems: many(companyProblems),
}));

export const companyTimelineRelations = relations(companyTimeline, ({ one }) => ({
  company: one(companies, {
    fields: [companyTimeline.companyId],
    references: [companies.id],
  }),
  capability: one(capabilities, {
    fields: [companyTimeline.capabilityId],
    references: [capabilities.id],
  }),
}));

export const problemsRelations = relations(problems, ({ many }) => ({
  companies: many(companyProblems),
  solutionPatterns: many(solutionPatternProblems),
}));

export const solutionPatternsRelations = relations(solutionPatterns, ({ many }) => ({
  problems: many(solutionPatternProblems),
  implementationPatterns: many(implementationPatterns),
}));

export const implementationPatternsRelations = relations(implementationPatterns, ({ one, many }) => ({
  solutionPattern: one(solutionPatterns, {
    fields: [implementationPatterns.solutionPatternId],
    references: [solutionPatterns.id],
  }),
  companies: many(companyImplementationPatterns),
}));

export const companyImplementationPatternsRelations = relations(
  companyImplementationPatterns,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyImplementationPatterns.companyId],
      references: [companies.id],
    }),
    implementationPattern: one(implementationPatterns, {
      fields: [companyImplementationPatterns.implementationPatternId],
      references: [implementationPatterns.id],
    }),
  })
);

export const companyProblemsRelations = relations(companyProblems, ({ one }) => ({
  company: one(companies, {
    fields: [companyProblems.companyId],
    references: [companies.id],
  }),
  problem: one(problems, {
    fields: [companyProblems.problemId],
    references: [problems.id],
  }),
}));

export const solutionPatternProblemsRelations = relations(
  solutionPatternProblems,
  ({ one }) => ({
    solutionPattern: one(solutionPatterns, {
      fields: [solutionPatternProblems.solutionPatternId],
      references: [solutionPatterns.id],
    }),
    problem: one(problems, {
      fields: [solutionPatternProblems.problemId],
      references: [problems.id],
    }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS
// Use these types throughout the app instead of re-deriving them.
// ─────────────────────────────────────────────────────────────────────────────

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type CompanyTimeline = typeof companyTimeline.$inferSelect;
export type NewCompanyTimeline = typeof companyTimeline.$inferInsert;
export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type SolutionPattern = typeof solutionPatterns.$inferSelect;
export type NewSolutionPattern = typeof solutionPatterns.$inferInsert;
export type ImplementationPattern = typeof implementationPatterns.$inferSelect;
export type NewImplementationPattern = typeof implementationPatterns.$inferInsert;
export const sectorsRelations = relations(sectors, ({ many }) => ({
  capabilityEvidence: many(capabilitySectorEvidence),
}));

export const capabilitiesRelations = relations(capabilities, ({ many }) => ({
  sectorEvidence:  many(capabilitySectorEvidence),
  synonyms:        many(capabilitySynonyms),
  timelineEntries: many(companyTimeline),
}));

export const capabilitySectorEvidenceRelations = relations(
  capabilitySectorEvidence,
  ({ one }) => ({
    capability: one(capabilities, {
      fields: [capabilitySectorEvidence.capabilityId],
      references: [capabilities.id],
    }),
    sector: one(sectors, {
      fields: [capabilitySectorEvidence.sectorId],
      references: [sectors.id],
    }),
    timeline: one(companyTimeline, {
      fields: [capabilitySectorEvidence.timelineId],
      references: [companyTimeline.id],
    }),
  })
);

export const capabilitySynonymsRelations = relations(capabilitySynonyms, ({ one }) => ({
  capability: one(capabilities, {
    fields: [capabilitySynonyms.capabilityId],
    references: [capabilities.id],
  }),
}));

export type BoundaryCase = typeof boundaryCases.$inferSelect;
export type NewBoundaryCase           = typeof boundaryCases.$inferInsert;
export type Sector                      = typeof sectors.$inferSelect;
export type NewSector                   = typeof sectors.$inferInsert;
export type Capability                  = typeof capabilities.$inferSelect;
export type NewCapability               = typeof capabilities.$inferInsert;
export type CapabilitySectorEvidence    = typeof capabilitySectorEvidence.$inferSelect;
export type NewCapabilitySectorEvidence = typeof capabilitySectorEvidence.$inferInsert;
export type CapabilitySynonym           = typeof capabilitySynonyms.$inferSelect;
export type NewCapabilitySynonym        = typeof capabilitySynonyms.$inferInsert;
