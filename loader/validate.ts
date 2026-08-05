import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens");

export const SectorSchema = z.object({ slug, name: z.string().min(1) });

export const CapabilitySchema = z.object({
  slug, name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["candidate","proposed","established","deprecated"]),
  sector_evidence: z.array(z.object({
    sector: z.string(), example_company: z.string(), evidence_note: z.string(),
  })).default([]),
});

export const ProblemSchema = z.object({
  slug, statement: z.string().min(10),
  lifecycle: z.enum(["emerging","growing","mature","declining","dead"]).optional(),
  notes: z.string().optional(),
});

export const SolutionPatternSchema = z.object({
  slug, name: z.string().min(1),
  first_observed: z.number().int().optional(),
  pattern_durability: z.string().optional(),
  winning_condition: z.string().optional(),
  failure_condition: z.string().optional(),
  winning_condition_maturity: z.enum(["draft","proposed","established"]).optional(),
  winning_condition_valid_from: z.number().int().optional(),
  winning_condition_valid_through: z.number().int().optional(),
  notes: z.string().optional(),
}).refine(d => !((d.winning_condition && !d.failure_condition) || (!d.winning_condition && d.failure_condition)),
  { message: "winning_condition and failure_condition must be filled together or both empty" });

export const ImplementationPatternSchema = z.object({
  slug, name: z.string().min(1),
  solution_pattern: slug.optional(),
  first_observed: z.number().int().optional(),
  status: z.enum(["live","dead","niche"]).optional(),
  business_model: z.string().optional(),
  pricing_signal: z.string().optional(),
  mechanism: z.string().optional(),
  notes: z.string().optional(),
});

export const BoundaryCaseSchema = z.object({
  company: z.string().min(1), option_a: z.string().min(1),
  option_b: z.string().min(1), chosen: z.string().min(1),
  reason: z.string().min(1), resolved_at: z.string().optional(),
});

export const TimelineEntrySchema = z.object({
  year: z.number().int().min(1900).max(2100),
  event_type: z.enum(["founding","product_launch","market_entry","acquisition","pivot","shutdown","capability_acquisition","funding"]),
  implementation_pattern: slug.optional(),
  problem: slug.optional(),
  capability: slug.optional(),
  capability_deployed: z.string().optional(),
  capability_acquired: z.string().optional(),
  description: z.string().min(1),
  source: z.string().min(1),
});

export const CompanySchema = z.object({
  slug, name: z.string().min(1), domain: z.string().min(1),
  founded: z.number().int().optional(), country: z.string().optional(),
  status: z.enum(["operating","acquired","dead","pivoted","merged"]),
  stage: z.string().optional(), funding_history: z.string().optional(),
  revenue_signal: z.string().optional(),
  profitability_signal: z.enum(["known_profitable","known_unprofitable","estimated_profitable_proxy","unknown"]).optional(),
  profitability_proxy_applied: z.boolean().optional(),
  evidence_weight: z.enum(["strong_validator","weak_validator","disconfirming","unknown"]),
  signal_confidence: z.enum(["high","low"]),
  research_queue_source: z.string().min(1),
  notable_facts: z.string().optional(),
  implementation_patterns: z.array(z.object({
    slug, confidence: z.enum(["high","medium","low"]).optional(),
    source: z.string().optional(), notes: z.string().optional(),
  })).min(1),
  problems: z.array(z.object({
    slug, confidence: z.enum(["high","medium","low"]).optional(),
    source: z.string().optional(), notes: z.string().optional(),
  })).min(1),
  timeline: z.array(TimelineEntrySchema).min(1),
});

export const VocabSchema = z.object({
  sectors:               z.array(SectorSchema).default([]),
  capabilities:          z.array(CapabilitySchema).default([]),
  problems:              z.array(ProblemSchema).default([]),
  solutionPatterns:      z.array(SolutionPatternSchema).default([]),
  implementationPatterns: z.array(ImplementationPatternSchema).default([]),
  boundaryCases:         z.array(BoundaryCaseSchema).default([]),
});

export type Company = z.infer<typeof CompanySchema>;
export type Vocab   = z.infer<typeof VocabSchema>;

export const OpportunitySchema = z.object({
  slug,
  name:   z.string().min(1),
  status: z.enum(['open', 'investigating', 'validated', 'rejected', 'building']).default('open'),
  problem: slug,
  existing_patterns:   z.array(slug).default([]),
  recombined_patterns: z.array(slug).default([]),
  observed_gap:      z.string().min(1),
  gap_evidence:      z.array(z.string()).default([]),
  evidence_strength: z.enum(['strong', 'moderate', 'weak']),
  hypothesis:        z.string().min(1),
  capabilities_required: z.array(z.object({
    slug,
    possessed_by:             z.array(z.string()).default([]),
    available_to_new_entrant: z.boolean().default(false),
    note:                     z.string().optional(),
  })).default([]),
  winning_condition_required: z.string().optional(),
  failure_condition_to_avoid: z.string().optional(),
  status_quo:     z.array(z.string()).default([]),
  open_questions: z.array(z.string()).default([]),
  notes:          z.string().optional(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
