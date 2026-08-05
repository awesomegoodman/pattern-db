/**
 * loader/export.ts
 *
 * One-time migration: dumps the existing PostgreSQL database to YAML files.
 * After this runs, the YAML files are the source of truth.
 *
 * Run: set -a && source .env.local && set +a && npx tsx loader/export.ts
 *
 * Output structure:
 *   data/_vocab/sectors.yaml
 *   data/_vocab/capabilities.yaml
 *   data/_vocab/problems.yaml
 *   data/_vocab/solution-patterns.yaml
 *   data/_vocab/implementation-patterns.yaml
 *   data/_vocab/boundary-cases.yaml
 *   data/companies/hr-payroll/<slug>.yaml   (one per company)
 */

import postgres from "postgres";
import { stringify } from "yaml";
import * as fs from "fs";
import * as path from "path";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// ─────────────────────────────────────────────────────────────────────────────
// SLUG MAPS
// All slugs are defined here, not auto-generated, so they are stable,
// human-readable, and never change once the system is live.
// ─────────────────────────────────────────────────────────────────────────────

// Company name → slug
const COMPANY_SLUG: Record<string, string> = {
  "Automatic Data Processing (ADP)":        "adp",
  "Paychex, Inc.":                          "paychex",
  "Paycom Software, Inc.":                  "paycom",
  "Paylocity Holding Corporation":          "paylocity",
  "Workday, Inc.":                          "workday",
  "Gusto (formerly ZenPayroll)":            "gusto",
  "Zenefits (acquired by TriNet)":          "zenefits",
  "Rippling People Center, Inc.":           "rippling",
  "Justworks, Inc.":                        "justworks",
  "BambooHR":                              "bamboohr",
  "Papaya Global":                          "papaya-global",
  "Deel (formerly Lifeslice)":             "deel",
  "Remote Technology, Inc.":               "remote",
  "Oyster HR":                             "oyster-hr",
  "SAP SE":                                "sap",
  "Oracle Corporation":                    "oracle",
  "SeamlessHR":                            "seamlesshr",
  "Bento Africa (shut down Feb 2025)":     "bento-africa",
  "PaidHR (formerly Pade HCM)":           "paidhr",
  "Employment Hero":                       "employment-hero",
  "Personio SE and Co KG":                "personio",
  "Darwinbox":                             "darwinbox",
  "Charlie HR":                            "charlie-hr",
  "PeopleSoft, Inc.":                      "peoplesoft",
  "Namely":                                "namely",
  "SmartHR":                               "smarthr",
  "PayFit":                                "payfit",
  "Bayzat":                                "bayzat",
  "Workpay":                               "workpay",
  "PaySpace (now Deel Local Payroll)":     "payspace",
};

// Implementation pattern name → slug
const IP_SLUG: Record<string, string> = {
  "Manual payroll bureau":                                  "manual-payroll-bureau",
  "Cloud-native SMB payroll SaaS":                         "cloud-native-smb-payroll-saas",
  "Cloud enterprise HCM platform":                         "cloud-enterprise-hcm-platform",
  "Compliance-led free HR SaaS (broker revenue model)":    "compliance-led-free-hr-saas",
  "Compound HR + IT + Finance platform":                   "compound-hr-it-finance-platform",
  "Global payroll / Employer of Record platform":          "global-payroll-eor-platform",
  "On-premise enterprise HCM platform":                    "on-premise-enterprise-hcm-platform",
};

// Solution pattern name → slug
const SP_SLUG: Record<string, string> = {
  "Payroll processing infrastructure":           "payroll-processing-infrastructure",
  "Cloud HCM platform":                         "cloud-hcm-platform",
  "Global employment infrastructure":           "global-employment-infrastructure",
  "Compound workforce management platform":     "compound-workforce-management-platform",
};

// Problem statement → slug
const PROBLEM_SLUG: Record<string, string> = {
  "Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and labour regulations.": "wage-compliance",
  "Businesses cannot provide employees with competitive benefits packages without the purchasing power of large employers.":       "employee-benefits",
  "Companies cannot legally employ workers in foreign jurisdictions without establishing local legal entities, which takes 12-18 months and significant capital.": "cross-border-employment",
  "Businesses cannot provision or deprovision employee access to software, hardware, and corporate systems as a single coordinated action.": "it-provisioning",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function write(filePath: string, data: unknown) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const content = stringify(data, { indent: 2, lineWidth: 120 });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`  wrote  ${filePath}`);
}

function clean<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "")
  ) as Partial<T>;
}

function ipSlug(name: string | null): string | undefined {
  if (!name) return undefined;
  return IP_SLUG[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function spSlug(name: string | null): string | undefined {
  if (!name) return undefined;
  return SP_SLUG[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function problemSlug(statement: string | null): string | undefined {
  if (!statement) return undefined;
  return PROBLEM_SLUG[statement] ?? statement.toLowerCase().slice(0, 40).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function companySlug(name: string): string {
  return COMPANY_SLUG[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function exportAll() {

  // ── 1. SECTORS ─────────────────────────────────────────────────────────────
  console.log("\nExporting sectors...");
  const sectors = await client.unsafe(`SELECT id, slug, name FROM sectors ORDER BY slug`);
  const sectorById: Record<string, string> = {};
  for (const s of sectors) sectorById[s.id] = s.slug;

  write("data/_vocab/sectors.yaml",
    sectors.map(s => ({ slug: s.slug, name: s.name }))
  );

  // ── 2. CAPABILITIES ─────────────────────────────────────────────────────────
  console.log("Exporting capabilities...");
  const caps = await client.unsafe(`
    SELECT c.id, c.slug, c.name, c.description, c.status
    FROM capabilities c ORDER BY c.slug
  `);
  const evidence = await client.unsafe(`
    SELECT cse.capability_id, s.slug AS sector_slug,
           cse.example_company, cse.evidence_note
    FROM capability_sector_evidence cse
    JOIN sectors s ON s.id = cse.sector_id
    ORDER BY cse.capability_id, s.slug
  `);
  const evidenceByCapId: Record<string, any[]> = {};
  for (const e of evidence) {
    if (!evidenceByCapId[e.capability_id]) evidenceByCapId[e.capability_id] = [];
    evidenceByCapId[e.capability_id].push({
      sector: e.sector_slug,
      example_company: e.example_company,
      evidence_note: e.evidence_note,
    });
  }
  write("data/_vocab/capabilities.yaml",
    caps.map(c => clean({
      slug: c.slug,
      name: c.name,
      description: c.description,
      status: c.status,
      sector_evidence: evidenceByCapId[c.id] ?? [],
    }))
  );

  // ── 3. PROBLEMS ─────────────────────────────────────────────────────────────
  console.log("Exporting problems...");
  const problems = await client.unsafe(`
    SELECT id, statement, lifecycle, notes FROM problems ORDER BY statement
  `);
  const problemById: Record<string, string> = {};
  for (const p of problems) {
    const slug = problemSlug(p.statement)!;
    problemById[p.id] = slug;
  }
  write("data/_vocab/problems.yaml",
    problems.map(p => clean({
      slug: problemSlug(p.statement),
      statement: p.statement,
      lifecycle: p.lifecycle,
      notes: p.notes,
    }))
  );

  // ── 4. SOLUTION PATTERNS ────────────────────────────────────────────────────
  console.log("Exporting solution patterns...");
  const sps = await client.unsafe(`
    SELECT id, name, first_observed, pattern_durability,
           winning_condition, failure_condition,
           winning_condition_maturity, winning_condition_valid_from,
           winning_condition_valid_through, notes
    FROM solution_patterns ORDER BY first_observed NULLS LAST
  `);
  const spById: Record<string, string> = {};
  for (const sp of sps) {
    const slug = spSlug(sp.name)!;
    spById[sp.id] = slug;
  }
  write("data/_vocab/solution-patterns.yaml",
    sps.map(sp => clean({
      slug: spSlug(sp.name),
      name: sp.name,
      first_observed: sp.first_observed,
      pattern_durability: sp.pattern_durability,
      winning_condition: sp.winning_condition,
      failure_condition: sp.failure_condition,
      winning_condition_maturity: sp.winning_condition_maturity,
      winning_condition_valid_from: sp.winning_condition_valid_from,
      winning_condition_valid_through: sp.winning_condition_valid_through,
      notes: sp.notes,
    }))
  );

  // ── 5. IMPLEMENTATION PATTERNS ──────────────────────────────────────────────
  console.log("Exporting implementation patterns...");
  const ips = await client.unsafe(`
    SELECT ip.id, ip.name, sp.name AS solution_pattern_name,
           ip.first_observed, ip.status, ip.business_model,
           ip.pricing_signal, ip.mechanism, ip.notes
    FROM implementation_patterns ip
    LEFT JOIN solution_patterns sp ON sp.id = ip.solution_pattern_id
    ORDER BY ip.first_observed NULLS LAST
  `);
  const ipById: Record<string, string> = {};
  for (const ip of ips) {
    const slug = ipSlug(ip.name)!;
    ipById[ip.id] = slug;
  }
  write("data/_vocab/implementation-patterns.yaml",
    ips.map(ip => clean({
      slug: ipSlug(ip.name),
      name: ip.name,
      solution_pattern: spSlug(ip.solution_pattern_name),
      first_observed: ip.first_observed,
      status: ip.status,
      business_model: ip.business_model,
      pricing_signal: ip.pricing_signal,
      mechanism: ip.mechanism,
      notes: ip.notes,
    }))
  );

  // ── 6. BOUNDARY CASES ───────────────────────────────────────────────────────
  console.log("Exporting boundary cases...");
  const bcs = await client.unsafe(`
    SELECT company_name, option_a, option_b, chosen, reason,
           resolved_at
    FROM boundary_cases ORDER BY resolved_at
  `);
  write("data/_vocab/boundary-cases.yaml",
    bcs.map(bc => clean({
      company: bc.company_name,
      option_a: bc.option_a,
      option_b: bc.option_b,
      chosen: bc.chosen,
      reason: bc.reason,
      resolved_at: bc.resolved_at
        ? new Date(bc.resolved_at).toISOString().split("T")[0]
        : undefined,
    }))
  );

  // ── 7. COMPANIES ────────────────────────────────────────────────────────────
  console.log("Exporting companies...");
  const companies = await client.unsafe(`
    SELECT id, name, founded, country, status, stage,
           funding_history, revenue_signal, profitability_signal,
           profitability_proxy_applied, evidence_weight, signal_confidence,
           research_queue_source, notable_facts
    FROM companies ORDER BY founded NULLS LAST, name
  `);

  // Company → implementation pattern links
  const cipRows = await client.unsafe(`
    SELECT cip.company_id, ip.name AS ip_name,
           cip.confidence, cip.source, cip.notes
    FROM company_implementation_patterns cip
    JOIN implementation_patterns ip ON ip.id = cip.implementation_pattern_id
  `);
  const cipByCompany: Record<string, any[]> = {};
  for (const r of cipRows) {
    if (!cipByCompany[r.company_id]) cipByCompany[r.company_id] = [];
    cipByCompany[r.company_id].push(clean({
      slug: ipSlug(r.ip_name),
      confidence: r.confidence !== "high" ? r.confidence : undefined,
      source: r.source,
      notes: r.notes,
    }));
  }

  // Company → problem links
  const cpRows = await client.unsafe(`
    SELECT cp.company_id, p.statement,
           cp.confidence, cp.source, cp.notes
    FROM company_problems cp
    JOIN problems p ON p.id = cp.problem_id
  `);
  const cpByCompany: Record<string, any[]> = {};
  for (const r of cpRows) {
    if (!cpByCompany[r.company_id]) cpByCompany[r.company_id] = [];
    cpByCompany[r.company_id].push(clean({
      slug: problemSlug(r.statement),
      confidence: r.confidence !== "high" ? r.confidence : undefined,
      source: r.source,
      notes: r.notes,
    }));
  }

  // Timeline entries per company
  const tlRows = await client.unsafe(`
    SELECT ct.company_id, ct.year, ct.event_type, ct.description,
           ip.name AS ip_name, p.statement AS problem_statement,
           cap.slug AS capability_slug, ct.capability_deployed,
           ct.capability_acquired, ct.source
    FROM company_timeline ct
    LEFT JOIN implementation_patterns ip ON ip.id = ct.implementation_pattern_id
    LEFT JOIN problems p ON p.id = ct.problem_id
    LEFT JOIN capabilities cap ON cap.id = ct.capability_id
    ORDER BY ct.company_id, ct.year
  `);
  const tlByCompany: Record<string, any[]> = {};
  for (const r of tlRows) {
    if (!tlByCompany[r.company_id]) tlByCompany[r.company_id] = [];
    tlByCompany[r.company_id].push(clean({
      year: r.year,
      event_type: r.event_type,
      implementation_pattern: ipSlug(r.ip_name),
      problem: problemSlug(r.problem_statement),
      capability: r.capability_slug,
      capability_deployed: r.capability_deployed,
      capability_acquired: r.capability_acquired,
      description: r.description,
      source: r.source,
    }));
  }

  // Write one file per company
  let written = 0;
  const unrecognised: string[] = [];
  for (const c of companies) {
    const slug = companySlug(c.name);
    if (!COMPANY_SLUG[c.name]) unrecognised.push(c.name);

    const doc = clean({
      slug,
      name: c.name,
      domain: "hr-payroll",
      founded: c.founded,
      country: c.country,
      status: c.status,
      stage: c.stage,
      funding_history: c.funding_history,
      revenue_signal: c.revenue_signal,
      profitability_signal: c.profitability_signal,
      profitability_proxy_applied: c.profitability_proxy_applied || undefined,
      evidence_weight: c.evidence_weight,
      signal_confidence: c.signal_confidence,
      research_queue_source: c.research_queue_source,
      notable_facts: c.notable_facts,
      implementation_patterns: cipByCompany[c.id] ?? [],
      problems: cpByCompany[c.id] ?? [],
      timeline: tlByCompany[c.id] ?? [],
    });

    write(`data/companies/hr-payroll/${slug}.yaml`, doc);
    written++;
  }

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log(`\n✓  Export complete`);
  console.log(`   ${sectors.length} sectors`);
  console.log(`   ${caps.length} capabilities`);
  console.log(`   ${problems.length} problems`);
  console.log(`   ${sps.length} solution patterns`);
  console.log(`   ${ips.length} implementation patterns`);
  console.log(`   ${bcs.length} boundary cases`);
  console.log(`   ${written} companies → data/companies/hr-payroll/`);
  if (unrecognised.length > 0) {
    console.log(`\n⚠  Slugs auto-generated for ${unrecognised.length} unrecognised companies:`);
    for (const n of unrecognised) console.log(`   "${n}"`);
    console.log(`   Review these files and rename if the auto-slug is wrong.`);
  }
}

if (process.argv[1]?.endsWith('export.ts') || process.argv[1]?.endsWith('export')) {
  exportAll().catch(e => { console.error(e); process.exit(1); }).finally(() => client.end());
}