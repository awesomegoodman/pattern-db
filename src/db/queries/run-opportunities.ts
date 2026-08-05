/**
 * run-opportunities.ts — Gap-driven opportunity generator
 *
 * Scans Layer 1+2 for structural gaps backed by Established winning conditions
 * and writes draft YAML opportunity files for researcher review. Only gaps with
 * Established (not Draft/Proposed) conditions are surfaced — weaker evidence
 * produces too many false positives to be useful.
 *
 * Two lenses are currently supported:
 *   1. geographic_whitespace — pattern has strong validators in geography A,
 *      zero companies in geography B
 *   2. structural_gap — problem has an established solution pattern but no
 *      implementation pattern has a confirmed strong validator
 *
 * Output: one YAML file per gap in data/opportunities/. Files are draft and
 * require researcher review before loading. The loader's well_formed check
 * will flag exactly what is missing.
 *
 * Idempotent: skips slugs where a file already exists on disk.
 *
 * Fingerprint note: gap_fingerprint is NOT set in generated files. The loader
 * owns fingerprint computation (hash of problem_slug|lens|sorted_capability_slugs
 * per the Layer 3 protocol). Pre-setting it here in a different format would
 * conflict with auto-linking in opportunity_relationships.
 *
 * Run:
 *   set -a && source .env.local && set +a
 *   npx tsx src/db/queries/run-opportunities.ts
 *
 * After reviewing generated files:
 *   npm run validate && npm run load
 */

import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const db = postgres(process.env.DATABASE_URL!, { prepare: false });
const OPPORTUNITIES_DIR = path.join(process.cwd(), "data/opportunities");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugsOnDisk(): Set<string> {
  if (!fs.existsSync(OPPORTUNITIES_DIR)) {
    fs.mkdirSync(OPPORTUNITIES_DIR, { recursive: true });
  }
  return new Set(
    fs
      .readdirSync(OPPORTUNITIES_DIR)
      .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))
      .map((f) => f.replace(".yaml", ""))
  );
}

function writeIfNew(slug: string, yaml: string, label: string): "new" | "skip" {
  const filePath = path.join(OPPORTUNITIES_DIR, `${slug}.yaml`);
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] ${slug}`);
    return "skip";
  }
  fs.writeFileSync(filePath, yaml, "utf8");
  console.log(`  [new]  ${slug} — ${label}`);
  return "new";
}

function indentBlock(text: string | null | undefined, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return (text ?? "# TODO").replace(/\n/g, `\n${pad}`);
}

// Truncate winning condition for embedding in a question string.
// Strips newlines so it reads as a single sentence.
function conditionExcerpt(text: string | null | undefined, maxLen = 200): string {
  if (!text) return "(not yet set)";
  return text.replace(/\n/g, " ").slice(0, maxLen).trim() + (text.length > maxLen ? "…" : "");
}

const TODAY = new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────────────────────
// Lens 1: geographic_whitespace
//
// Source: gap_geographic_whitespace view joined to solution_patterns WHERE
// winning_condition_maturity = 'established'.
//
// Only established conditions are surfaced. Proposed conditions are not yet
// cross-industry confirmed — generating opportunities against them would be
// gaps backed by gaps.
//
// Open question design:
//   Q1 — demand confirmation: method pre-filled with standard search sources.
//   Q2 — winning condition transfer: method pre-filled from the condition text
//        itself, which IS the specification for what to investigate.
//   Both questions are fully formed (question + method + close_criteria) so
//   the loader's well_formed check treats them as questions, not concerns.
// ─────────────────────────────────────────────────────────────────────────────

async function runGeographicWhitespace(): Promise<number> {
  console.log("\n── Lens: geographic_whitespace ──────────────────");

  const rows = await db.unsafe(`
    SELECT
      ip.slug                        AS impl_slug,
      ip.name                        AS impl_name,
      ggw.missing_in                 AS geography,
      sp.slug                        AS sp_slug,
      sp.name                        AS sp_name,
      sp.winning_condition,
      sp.failure_condition,
      p.slug                         AS problem_slug,
      p.statement                    AS problem_statement,
      STRING_AGG(
        DISTINCT c.name || ' (' || c.country || ')',
        ', '
        ORDER BY c.name || ' (' || c.country || ')'
      ) FILTER (WHERE c.evidence_weight = 'strong_validator') AS strong_validators,
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator')
                                     AS strong_validator_count
    FROM gap_geographic_whitespace ggw
    JOIN implementation_patterns ip      ON ip.id = ggw.pattern_id
    JOIN solution_patterns sp            ON sp.id = ip.solution_pattern_id
    LEFT JOIN solution_pattern_problems spp ON spp.solution_pattern_id = sp.id
    LEFT JOIN problems p                    ON p.id = spp.problem_id
    JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
    JOIN companies c                         ON c.id = cip.company_id
    WHERE sp.winning_condition_maturity = 'established'
    GROUP BY
      ip.slug, ip.name, ggw.missing_in,
      sp.slug, sp.name, sp.winning_condition, sp.failure_condition,
      p.slug, p.statement
    ORDER BY ip.name, ggw.missing_in
  `);

  if (rows.length === 0) {
    console.log("  No geographic whitespace gaps with established conditions.");
    return 0;
  }

  let newCount = 0;

  for (const r of rows) {
    const geoSlug = toSlug(r.geography ?? "unknown");
    const slug = `${r.impl_slug}-${geoSlug}`;

    const problemSlug = r.problem_slug ?? null;
    const problemStatement = r.problem_statement ?? null;
    const validators = r.strong_validators ?? "(none recorded — check dataset)";
    const validatorCount = Number(r.strong_validator_count ?? 0);
    const condSnippet = conditionExcerpt(r.winning_condition);

    // ── Open question 2: winning condition transfer ─────────────────────────
    // The condition text IS the research specification. The researcher must
    // verify each dimension of the condition holds in the target geography.
    // method and close_criteria are pre-filled — not TODO — so the loader
    // treats this as a question, not a concern (per interpretation doc).
    const q2Method = `Identify each structural claim in the winning condition: "${condSnippet}". ` +
      `For each claim, check: (1) local regulatory environment, (2) incumbent ` +
      `capability relative to the condition, (3) customer switching cost evidence ` +
      `from local tech media (Techpoint Africa, Wamda, e27 as relevant). ` +
      `Source: local VC portfolio pages, central bank registers, regional analyst reports.`;

    const q2Close = `A clear yes/no for each structural claim in the winning condition, ` +
      `with at least one source per claim. If any claim does not hold in ${r.geography}, ` +
      `the opportunity record should be revised or rejected — not validated.`;

    const yaml = `# AUTO-GENERATED by run-opportunities.ts on ${TODAY}
# Lens:   geographic_whitespace
# Source: gap_geographic_whitespace view × sp.winning_condition_maturity = 'established'
#
# DRAFT — the loader will compute well_formed and flag what is missing.
# Required before this record is well-formed:
#   1. Fill 'hypothesis' — what specifically would be built, for whom, how
#   2. Fill 'status_quo' — what customers in ${r.geography} currently use
#   3. Confirm 'problem' slug is correct (check data/_vocab/problems.yaml)
#   4. npm run validate && npm run load
#
# gap_fingerprint is intentionally omitted — the loader computes it.

slug: ${slug}
name: ${r.impl_name} — ${r.geography}
status: open
generation_mode: derived
lens: geographic_whitespace

${problemSlug
  ? `problem: ${problemSlug}`
  : `# problem: # TODO — no problem linked to solution pattern '${r.sp_name}' yet\n# Add to data/_vocab/solution-patterns.yaml before loading`
}

existing_patterns:
  - ${r.impl_slug}

observed_gap: |
  [${r.impl_name}] has ${validatorCount} confirmed strong validator(s) in other
  geographies but zero companies recorded in ${r.geography}. If documented demand
  exists in ${r.geography}, this is an addressable whitespace gap. Absence of
  recorded companies may reflect genuine market absence or research coverage gaps —
  the open questions below distinguish between the two.

gap_evidence:
  - "gap_geographic_whitespace view: 0 companies using [${r.impl_slug}] in ${r.geography}"
  - "Strong validators in other geographies: ${validators}"

evidence_strength: moderate
# Downgrade to 'weak' if demand in ${r.geography} cannot be confirmed.
# Upgrade to 'strong' only if a Layer 1 company already operates here
# but has not yet been added to the dataset.

winning_condition_required: |
  ${indentBlock(r.winning_condition)}

failure_condition_to_avoid: |
  ${indentBlock(r.failure_condition)}

status_quo:
  - "# TODO: What do potential customers in ${r.geography} currently use instead?"
  - "# Canonical options: spreadsheets, manual process, paper forms, local incumbent, doing nothing"

hypothesis: |
  # TODO: Fill this in before loading.
  #
  # Required:
  #   - What specifically would be built? (not just 'the same product elsewhere')
  #   - Who is the ICP in ${r.geography}? How does local context change the pattern?
  #   - Why would the winning condition hold in ${r.geography}?
  #   - Is there a local incumbent? If yes, what is their specific structural weakness?
  #   - What is the beachhead — the smallest wedge that proves the pattern?

predictions:
  - claim: "A company using [${r.impl_slug}] will emerge and sustain operations in ${r.geography} by 2029"
    falsification: "Two or more funded attempts shut down before 2029 with documented unit economics failures attributable to the pattern structure, not execution"
    horizon: 2029

open_questions:
  - question: "Is there documented willingness to pay for [${r.impl_name}] in ${r.geography}?"
    method: "Search: (1) local VC portfolio pages (Partech Africa, TLcom, Flourish, Kaszek as relevant), (2) Crunchbase country filter + industry category, (3) regional tech media (Techpoint Africa, Wamda, e27, Latam List as relevant). Minimum 3 independent source types per candidate-selection.md documented-absence threshold."
    close_criteria: "Either a company is found and added to the dataset, OR documented absence is confirmed — all three source types searched, search date recorded, and absence note added to the implementation pattern record."

  - question: "Does the winning condition transfer to ${r.geography}? Condition: '${condSnippet}'"
    method: "${q2Method}"
    close_criteria: "${q2Close}"

notes: |
  Solution pattern: ${r.sp_name}
  ${problemStatement ? `Problem: ${problemStatement}` : `Problem: not yet linked to solution pattern — update data/_vocab/solution-patterns.yaml`}
  Auto-generated. Researcher judgment is required on hypothesis before this record is analytically trustworthy.
`;

    const result = writeIfNew(slug, yaml, `${r.impl_name} → ${r.geography}`);
    if (result === "new") newCount++;
  }

  return newCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lens 2: structural_gap
//
// Finds problems where an established solution pattern exists but NO
// implementation pattern has a confirmed strong validator.
//
// existing_patterns: populated from actual ip.slug values queried from the DB.
// The prior version used ip.name in YAML comments (- # Name...), which parsed
// as null list items. This version queries slugs directly.
//
// Open question design:
//   Q1 — timing/geography/model diagnosis: method pre-filled with concrete
//        research steps for each of the three hypotheses.
//   Q2 — bootstrapped operator search: method pre-filled with specific sources.
//   Both questions are fully formed so the loader treats them as questions.
// ─────────────────────────────────────────────────────────────────────────────

async function runStructuralGap(): Promise<number> {
  console.log("\n── Lens: structural_gap ─────────────────────────");

  const rows = await db.unsafe(`
    SELECT
      p.slug                         AS problem_slug,
      p.statement                    AS problem_statement,
      sp.slug                        AS sp_slug,
      sp.name                        AS sp_name,
      sp.winning_condition,
      sp.failure_condition,
      sp.evidence_count              AS sp_evidence_count,
      COUNT(DISTINCT ip.id)          AS impl_pattern_count,
      COUNT(DISTINCT c.id)
        FILTER (WHERE c.evidence_weight = 'strong_validator')
                                     AS strong_validator_count,
      COUNT(DISTINCT c.id)
        FILTER (WHERE c.evidence_weight = 'disconfirming')
                                     AS disconfirming_count,
      COUNT(DISTINCT c.id)           AS total_companies,
      -- Slugs (not names) for the existing_patterns YAML field
      STRING_AGG(DISTINCT ip.slug, '|||' ORDER BY ip.slug)
                                     AS impl_pattern_slugs,
      -- Names go to notes only — for human context, not YAML list values
      STRING_AGG(DISTINCT ip.name, ', ' ORDER BY ip.name)
                                     AS impl_pattern_names
    FROM problems p
    JOIN solution_pattern_problems spp ON spp.problem_id = p.id
    JOIN solution_patterns sp          ON sp.id = spp.solution_pattern_id
    JOIN implementation_patterns ip    ON ip.solution_pattern_id = sp.id
    LEFT JOIN company_implementation_patterns cip
      ON cip.implementation_pattern_id = ip.id
    LEFT JOIN companies c ON c.id = cip.company_id
    WHERE sp.winning_condition_maturity = 'established'
      AND ip.status != 'dead'
    GROUP BY
      p.slug, p.statement,
      sp.slug, sp.name, sp.winning_condition, sp.failure_condition, sp.evidence_count
    HAVING
      COUNT(DISTINCT c.id) FILTER (WHERE c.evidence_weight = 'strong_validator') = 0
      AND COUNT(DISTINCT ip.id) >= 1
      AND COUNT(DISTINCT c.id) >= 2
    ORDER BY sp.evidence_count DESC
  `);

  if (rows.length === 0) {
    console.log("  No structural gaps with established conditions and zero strong validators.");
    return 0;
  }

  let newCount = 0;

  for (const r of rows) {
    const slug = `structural-gap-${r.sp_slug}`;

    const totalCompanies = Number(r.total_companies ?? 0);
    const disconfirming = Number(r.disconfirming_count ?? 0);
    const implCount = Number(r.impl_pattern_count ?? 0);

    // Slugs as a real YAML list — queried directly, not derived from names
    const implSlugs: string[] = (r.impl_pattern_slugs ?? "")
      .split("|||")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const existingPatternsYaml = implSlugs.length > 0
      ? implSlugs.map((s) => `  - ${s}`).join("\n")
      : "  [] # No implementation patterns found — check solution pattern linkage";

    // Pre-fill Q1 method with concrete steps for each of the three hypotheses
    const q1Method =
      `For TIMING: check founded year and funding history of all companies in ` +
      `[${r.impl_pattern_names}]. If all are < 5 years old and externally funded, ` +
      `timing is the likely explanation. ` +
      `For GEOGRAPHY: search Indie Hackers, Bootstrappers.io, and regional SaaS ` +
      `directories for operators outside the current dataset's geographic coverage. ` +
      `For MODEL: review failure modes of any disconfirming cases — if all failures ` +
      `share a structural cause (unit economics, supply density, regulation), ` +
      `a model gap may explain the absence.`;

    const yaml = `# AUTO-GENERATED by run-opportunities.ts on ${TODAY}
# Lens:   structural_gap
# Source: problems × established SP with 0 strong validators across all IPs
#
# DRAFT — the loader will compute well_formed and flag what is missing.
# Required before this record is well-formed:
#   1. Identify which gap type applies (timing / geography / model) in 'hypothesis'
#   2. Confirm 'problem' slug is correct
#   3. npm run validate && npm run load
#
# gap_fingerprint is intentionally omitted — the loader computes it.

slug: ${slug}
name: Structural gap — ${r.sp_name}
status: open
generation_mode: derived
lens: structural_gap

problem: ${r.problem_slug ?? "# TODO — verify slug in data/_vocab/problems.yaml"}

existing_patterns:
${existingPatternsYaml}

observed_gap: |
  Solution pattern [${r.sp_name}] has an established winning condition and
  ${implCount} implementation pattern(s) with ${totalCompanies} total companies,
  but zero strong validators — no company has confirmed the economics work.
  ${disconfirming > 0
    ? `${disconfirming} disconfirming case(s) exist, which is evidence the pattern has real failure modes worth investigating.`
    : `No disconfirming cases are recorded yet. This may reflect survivor bias (failed attempts not yet found) rather than pattern strength — run FAILURE_CASE_NEEDED items from the research queue before treating this gap as low-risk.`
  }

gap_evidence:
  - "0 strong validators across ${implCount} implementation pattern(s) with ${totalCompanies} total companies"
  - "Established winning condition confirms the structural bet has held in other contexts"
  - "Solution pattern evidence count: ${r.sp_evidence_count} companies"

evidence_strength: moderate
# The absence of a strong validator is a real signal, but its interpretation
# requires identifying whether the cause is timing, geography, or model structure.

winning_condition_required: |
  ${indentBlock(r.winning_condition)}

failure_condition_to_avoid: |
  ${indentBlock(r.failure_condition)}

status_quo:
  - "# TODO: What are customers currently using instead?"

hypothesis: |
  # TODO: Fill this in. Identify which explanation applies before loading.
  #
  # A. TIMING GAP: The pattern exists but profitable operators are young.
  #    Evidence for: all companies < 5 years old, externally funded, growing.
  #    If so: who is closest to profitability and what would accelerate it?
  #
  # B. GEOGRAPHY GAP: Profitable operators exist in geographies not yet in
  #    the dataset.
  #    Evidence for: no bootstrapped operators found after exhaustive search
  #    within current dataset geographies; operators found outside them.
  #    If so: which geographies, and are they addressable?
  #
  # C. MODEL GAP: The current implementation patterns have a structural flaw
  #    preventing profitability. A different approach is needed.
  #    Evidence for: disconfirming cases share a structural failure cause;
  #    the winning condition does not fully hold for this problem type.
  #    If so: what would a viable implementation pattern look like?

predictions:
  - claim: "A strong validator (profitable operator) will emerge in [${r.sp_name}] by 2028"
    falsification: "All current companies either raise further rounds to sustain losses, pivot away, or shut down before 2028, with no new entrant achieving profitability"
    horizon: 2028

open_questions:
  - question: "Is the absence of strong validators explained by timing, geography coverage, or a structural model gap?"
    method: "${q1Method}"
    close_criteria: "One of the three hypotheses (timing / geography / model) can be affirmed with source citations, and the other two can be ruled out or assessed as less likely."

  - question: "Do self-funded operators exist in this pattern outside the current dataset?"
    method: "Search Indie Hackers (tag: ${r.sp_name.toLowerCase().replace(/\s+/g, '-')}), Bootstrappers.io, Crunchbase filtered by industry + country + no-funding, regional SaaS directories for operators in [${r.impl_pattern_names}] with 5+ years operating and no recorded external funding."
    close_criteria: "Either a strong validator candidate is found and added to the dataset with research_queue_source STRONG_VALIDATOR_NEEDED, OR documented absence is confirmed via 3-source search with sources named."

notes: |
  Problem: ${r.problem_statement}
  Implementation patterns surveyed: ${r.impl_pattern_names}
  Auto-generated. Do not treat this as a buildable opportunity until the hypothesis
  identifies which of the three gap types applies and why.
`;

    const result = writeIfNew(slug, yaml, `${r.sp_name} — ${totalCompanies} companies, 0 strong validators`);
    if (result === "new") newCount++;
  }

  return newCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  Opportunity Generator");
  console.log("══════════════════════════════════════════════════");
  console.log("  Scanning Layer 1+2 for gaps with Established winning conditions.");
  console.log("  Draft/Proposed conditions excluded — evidence too thin.\n");

  const before = slugsOnDisk().size;
  console.log(`  Existing opportunity files on disk: ${before}`);

  const geoNew = await runGeographicWhitespace();
  const structNew = await runStructuralGap();
  const totalNew = geoNew + structNew;

  console.log("\n── Summary ───────────────────────────────────────");
  console.log(`  geographic_whitespace: ${geoNew} new file(s)`);
  console.log(`  structural_gap:        ${structNew} new file(s)`);
  console.log(`  Total new:             ${totalNew}`);

  if (totalNew > 0) {
    console.log(`
  Each generated file is a draft. Before loading:
    1. Read 'observed_gap' — confirm the gap is real, not a dataset coverage gap
    2. Fill 'hypothesis' — this is the only field that requires your judgment
    3. Fill 'status_quo' — what customers currently use
    4. Review both open_questions — method + close_criteria are pre-filled but
       may need adjustment for local context
    5. npm run validate && npm run load
`);
  } else {
    console.log(`
  No new gaps found, or all gaps already have files on disk.
  If the research queue shows GEOGRAPHIC_WHITESPACE items but no files were
  generated, the linked solution patterns likely have Draft/Proposed winning
  conditions — promote them to Established first, then re-run.
`);
  }

  console.log("══════════════════════════════════════════════════\n");
  await db.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});