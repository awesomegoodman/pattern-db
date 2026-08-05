"""
setup-loader.py — builds the complete loader system in one run.

Steps:
  1. Patches src/db/schema.ts  (adds slug columns to 4 tables)
  2. Writes loader/validate.ts
  3. Writes loader/load.ts
  4. Writes loader/index.ts
  5. Patches loader/export.ts  (adds named export)
  6. Runs drizzle-kit push     (adds slug columns to live DB)
  7. Backfills existing slugs
  8. Runs loader               (verifies round-trip)

Run: python3 setup-loader.py
"""

import os, subprocess, sys

# Load .env.local so subprocess calls inherit DATABASE_URL
if os.path.exists(".env.local"):
    with open(".env.local") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

def run(cmd, check=True):
    r = subprocess.run(cmd, shell=True)
    if check and r.returncode != 0:
        print(f"  FAILED: {cmd}")
        sys.exit(r.returncode)

def write(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  wrote   {path}")

def patch(path, old, new, label):
    with open(path) as f:
        content = f.read()
    if old not in content:
        print(f"  SKIP    {label} (already applied or target not found)")
        return
    with open(path, "w") as f:
        f.write(content.replace(old, new, 1))
    print(f"  patched {path} ({label})")

# ─────────────────────────────────────────────────────────────────────────────
print("\n1. Patching src/db/schema.ts")
# ─────────────────────────────────────────────────────────────────────────────

patch("src/db/schema.ts",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    name: text('name').notNull(),\n\n    // ── Core identity (MVR)",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    slug: text('slug').unique(),\n    name: text('name').notNull(),\n\n    // ── Core identity (MVR)",
    "companies slug")

patch("src/db/schema.ts",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    statement: text('statement').notNull().unique(),",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    slug: text('slug').unique(),\n    statement: text('statement').notNull().unique(),",
    "problems slug")

patch("src/db/schema.ts",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    name: text('name').notNull().unique(),\n\n    evidenceCount: integer('evidence_count').notNull().default(0),\n    firstObserved: integer('first_observed'),\n    patternDurability:",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    slug: text('slug').unique(),\n    name: text('name').notNull().unique(),\n\n    evidenceCount: integer('evidence_count').notNull().default(0),\n    firstObserved: integer('first_observed'),\n    patternDurability:",
    "solution_patterns slug")

patch("src/db/schema.ts",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    name: text('name').notNull().unique(),\n\n    solutionPatternId:",
    "    id: uuid('id').primaryKey().defaultRandom(),\n    slug: text('slug').unique(),\n    name: text('name').notNull().unique(),\n\n    solutionPatternId:",
    "implementation_patterns slug")

# ─────────────────────────────────────────────────────────────────────────────
print("\n2. Writing loader/validate.ts")
# ─────────────────────────────────────────────────────────────────────────────

write("loader/validate.ts", """\
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
""")

# ─────────────────────────────────────────────────────────────────────────────
print("\n3. Writing loader/load.ts")
# ─────────────────────────────────────────────────────────────────────────────

write("loader/load.ts", """\
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { parse } from "yaml";
import { CompanySchema, VocabSchema, type Company, type Vocab } from "./validate";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

function readYaml(p: string) { return parse(fs.readFileSync(p, "utf8")); }

function readVocab(): Vocab {
  const raw = {
    sectors:               readYaml("data/_vocab/sectors.yaml"),
    capabilities:          readYaml("data/_vocab/capabilities.yaml"),
    problems:              readYaml("data/_vocab/problems.yaml"),
    solutionPatterns:      readYaml("data/_vocab/solution-patterns.yaml"),
    implementationPatterns: readYaml("data/_vocab/implementation-patterns.yaml"),
    boundaryCases:         readYaml("data/_vocab/boundary-cases.yaml"),
  };
  const r = VocabSchema.safeParse(raw);
  if (!r.success) { console.error("Vocab invalid:", JSON.stringify(r.error.format(), null, 2)); process.exit(1); }
  return r.data;
}

function readCompanies(): Company[] {
  const out: Company[] = [];
  for (const dir of fs.readdirSync("data/companies", { withFileTypes: true }).filter(d => d.isDirectory())) {
    const base = path.join("data/companies", dir.name);
    for (const file of fs.readdirSync(base).filter(f => f.endsWith(".yaml"))) {
      const raw = readYaml(path.join(base, file));
      const r = CompanySchema.safeParse(raw);
      if (!r.success) {
        console.error(`\\nInvalid: ${path.join(base, file)}`);
        console.error(JSON.stringify(r.error.format(), null, 2));
        process.exit(1);
      }
      out.push(r.data);
    }
  }
  return out;
}

async function map(table: string, col = "slug"): Promise<Record<string, string>> {
  const rows = await client.unsafe(`SELECT id, ${col} AS slug FROM ${table} WHERE ${col} IS NOT NULL`);
  return Object.fromEntries(rows.map((r: any) => [r.slug, r.id]));
}

function need(m: Record<string, string>, slug: string, ctx: string): string {
  const id = m[slug];
  if (!id) { console.error(`  Unknown slug "${slug}" in ${ctx}`); process.exit(1); }
  return id;
}

export async function load() {
  const vocab     = readVocab();
  const companies = readCompanies();
  console.log(`  ${vocab.sectors.length} sectors  ${vocab.capabilities.length} capabilities  ${vocab.problems.length} problems`);
  console.log(`  ${vocab.solutionPatterns.length} solution patterns  ${vocab.implementationPatterns.length} impl patterns`);
  console.log(`  ${companies.length} companies`);

  await client.unsafe("BEGIN");
  try {

    for (const s of vocab.sectors)
      await client.unsafe(`INSERT INTO sectors (id,slug,name,created_at) VALUES (gen_random_uuid(),$1,$2,now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name`, [s.slug, s.name]);
    const sectorMap = await map("sectors");

    for (const c of vocab.capabilities)
      await client.unsafe(`INSERT INTO capabilities (id,slug,name,description,status,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,status=EXCLUDED.status`, [c.slug, c.name, c.description, c.status]);
    const capMap = await map("capabilities");
    for (const c of vocab.capabilities) {
      for (const e of c.sector_evidence ?? []) {
        const sid = sectorMap[e.sector];
        if (!sid) { console.error(`  Unknown sector "${e.sector}"`); process.exit(1); }
        await client.unsafe(`INSERT INTO capability_sector_evidence (id,capability_id,sector_id,example_company,evidence_note,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,now()) ON CONFLICT(capability_id,sector_id) DO UPDATE SET example_company=EXCLUDED.example_company,evidence_note=EXCLUDED.evidence_note`, [capMap[c.slug], sid, e.example_company, e.evidence_note]);
      }
    }

    for (const p of vocab.problems)
      await client.unsafe(`INSERT INTO problems (id,slug,statement,lifecycle,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET statement=EXCLUDED.statement,lifecycle=EXCLUDED.lifecycle,notes=EXCLUDED.notes`, [p.slug, p.statement, p.lifecycle ?? null, p.notes ?? null]);
    const problemMap = await map("problems");

    for (const sp of vocab.solutionPatterns)
      await client.unsafe(`INSERT INTO solution_patterns (id,slug,name,first_observed,pattern_durability,winning_condition,failure_condition,winning_condition_maturity,winning_condition_valid_from,winning_condition_valid_through,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,first_observed=EXCLUDED.first_observed,pattern_durability=EXCLUDED.pattern_durability,winning_condition=EXCLUDED.winning_condition,failure_condition=EXCLUDED.failure_condition,winning_condition_maturity=EXCLUDED.winning_condition_maturity,winning_condition_valid_from=EXCLUDED.winning_condition_valid_from,winning_condition_valid_through=EXCLUDED.winning_condition_valid_through,notes=EXCLUDED.notes,updated_at=now()`, [sp.slug, sp.name, sp.first_observed ?? null, sp.pattern_durability ?? null, sp.winning_condition ?? null, sp.failure_condition ?? null, sp.winning_condition_maturity ?? null, sp.winning_condition_valid_from ?? null, sp.winning_condition_valid_through ?? null, sp.notes ?? null]);
    const spMap = await map("solution_patterns");

    for (const ip of vocab.implementationPatterns) {
      const spId = ip.solution_pattern ? (spMap[ip.solution_pattern] ?? null) : null;
      await client.unsafe(`INSERT INTO implementation_patterns (id,slug,name,solution_pattern_id,first_observed,status,business_model,pricing_signal,mechanism,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,solution_pattern_id=EXCLUDED.solution_pattern_id,first_observed=EXCLUDED.first_observed,status=EXCLUDED.status,business_model=EXCLUDED.business_model,pricing_signal=EXCLUDED.pricing_signal,mechanism=EXCLUDED.mechanism,notes=EXCLUDED.notes,updated_at=now()`, [ip.slug, ip.name, spId, ip.first_observed ?? null, ip.status ?? null, ip.business_model ?? null, ip.pricing_signal ?? null, ip.mechanism ?? null, ip.notes ?? null]);
    }
    const ipMap = await map("implementation_patterns");

    for (const bc of vocab.boundaryCases)
      await client.unsafe(`INSERT INTO boundary_cases (id,company_name,option_a,option_b,chosen,reason,resolved_at,created_at) SELECT gen_random_uuid(),$1,$2,$3,$4,$5,$6,now() WHERE NOT EXISTS (SELECT 1 FROM boundary_cases WHERE company_name=$1 AND option_a=$2)`, [bc.company, bc.option_a, bc.option_b, bc.chosen, bc.reason, bc.resolved_at ? new Date(bc.resolved_at).toISOString() : new Date().toISOString()]);

    let inserted = 0, updated = 0;
    for (const c of companies) {
      const ex = await client.unsafe("SELECT id FROM companies WHERE slug=$1", [c.slug]);
      let cid: string;
      if (ex.length === 0) {
        const [row] = await client.unsafe(`INSERT INTO companies (id,slug,name,founded,country,status,stage,funding_history,revenue_signal,profitability_signal,profitability_proxy_applied,evidence_weight,signal_confidence,research_queue_source,notable_facts,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),now()) RETURNING id`, [c.slug, c.name, c.founded ?? null, c.country ?? null, c.status, c.stage ?? null, c.funding_history ?? null, c.revenue_signal ?? null, c.profitability_signal ?? null, c.profitability_proxy_applied ?? false, c.evidence_weight, c.signal_confidence, c.research_queue_source, c.notable_facts ?? null]);
        cid = row.id; inserted++;
      } else {
        cid = ex[0].id;
        await client.unsafe(`UPDATE companies SET name=$1,founded=$2,country=$3,status=$4,stage=$5,funding_history=$6,revenue_signal=$7,profitability_signal=$8,profitability_proxy_applied=$9,evidence_weight=$10,signal_confidence=$11,research_queue_source=$12,notable_facts=$13,updated_at=now() WHERE id=$14`, [c.name, c.founded ?? null, c.country ?? null, c.status, c.stage ?? null, c.funding_history ?? null, c.revenue_signal ?? null, c.profitability_signal ?? null, c.profitability_proxy_applied ?? false, c.evidence_weight, c.signal_confidence, c.research_queue_source, c.notable_facts ?? null, cid]);
        updated++;
      }

      for (const ip of c.implementation_patterns) {
        const ipId = need(ipMap, ip.slug, `${c.slug} → implementation_patterns`);
        await client.unsafe(`INSERT INTO company_implementation_patterns (company_id,implementation_pattern_id,confidence,source,notes,created_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT(company_id,implementation_pattern_id) DO UPDATE SET confidence=EXCLUDED.confidence,source=EXCLUDED.source,notes=EXCLUDED.notes`, [cid, ipId, ip.confidence ?? "high", ip.source ?? null, ip.notes ?? null]);
      }
      for (const p of c.problems) {
        const pid = need(problemMap, p.slug, `${c.slug} → problems`);
        await client.unsafe(`INSERT INTO company_problems (company_id,problem_id,confidence,source,notes,created_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT(company_id,problem_id) DO UPDATE SET confidence=EXCLUDED.confidence,source=EXCLUDED.source,notes=EXCLUDED.notes`, [cid, pid, p.confidence ?? "high", p.source ?? null, p.notes ?? null]);
      }

      // Timeline: delete-then-reinsert (no stable unique key on timeline entries)
      await client.unsafe("DELETE FROM company_timeline WHERE company_id=$1", [cid]);
      for (const t of c.timeline) {
        await client.unsafe(`INSERT INTO company_timeline (id,company_id,year,event_type,description,implementation_pattern_id,problem_id,capability_id,capability_deployed,capability_acquired,source,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())`, [cid, t.year, t.event_type, t.description, t.implementation_pattern ? (ipMap[t.implementation_pattern] ?? null) : null, t.problem ? (problemMap[t.problem] ?? null) : null, t.capability ? (capMap[t.capability] ?? null) : null, t.capability_deployed ?? null, t.capability_acquired ?? null, t.source]);
      }
    }

    // Refresh evidence counts
    await client.unsafe("UPDATE problems p SET evidence_count=(SELECT COUNT(DISTINCT cp.company_id) FROM company_problems cp WHERE cp.problem_id=p.id)");
    await client.unsafe("UPDATE implementation_patterns ip SET evidence_count=(SELECT COUNT(DISTINCT cip.company_id) FROM company_implementation_patterns cip WHERE cip.implementation_pattern_id=ip.id)");
    await client.unsafe("UPDATE solution_patterns sp SET evidence_count=(SELECT COUNT(DISTINCT cip.company_id) FROM implementation_patterns ip JOIN company_implementation_patterns cip ON cip.implementation_pattern_id=ip.id WHERE ip.solution_pattern_id=sp.id)");

    await client.unsafe("COMMIT");

    const [counts] = await client.unsafe("SELECT (SELECT COUNT(*) FROM companies) AS co,(SELECT COUNT(*) FROM company_timeline) AS tl,(SELECT COUNT(*) FROM company_implementation_patterns) AS rel");
    console.log(`\\n  ${inserted} inserted  ${updated} updated  |  ${counts.co} companies  ${counts.tl} timeline entries  ${counts.rel} relationships`);

  } catch (err) {
    await client.unsafe("ROLLBACK");
    console.error("\\nLoad failed — rolled back.");
    throw err;
  } finally {
    await client.end();
  }
}
""")

# ─────────────────────────────────────────────────────────────────────────────
print("\n4. Writing loader/index.ts")
# ─────────────────────────────────────────────────────────────────────────────

write("loader/index.ts", """\
/**
 * loader/index.ts  —  entry point
 *
 * npx tsx loader/index.ts load      — load all YAML files into DB (default)
 * npx tsx loader/index.ts export    — dump DB to YAML (one-time migration)
 * npx tsx loader/index.ts validate  — validate YAML without touching DB
 */

const cmd = process.argv[2] ?? "load";

if (cmd === "load") {
  console.log("Loading YAML files into database...");
  const { load } = await import("./load.js");
  await load();

} else if (cmd === "export") {
  console.log("Exporting database to YAML...");
  const { exportAll } = await import("./export.js");
  await exportAll();

} else if (cmd === "validate") {
  console.log("Validating YAML files...");
  const fs   = await import("fs");
  const path = await import("path");
  const { parse } = await import("yaml");
  const { CompanySchema, VocabSchema } = await import("./validate.js");

  let errors = 0;
  const vocab = {
    sectors:               parse(fs.readFileSync("data/_vocab/sectors.yaml","utf8")),
    capabilities:          parse(fs.readFileSync("data/_vocab/capabilities.yaml","utf8")),
    problems:              parse(fs.readFileSync("data/_vocab/problems.yaml","utf8")),
    solutionPatterns:      parse(fs.readFileSync("data/_vocab/solution-patterns.yaml","utf8")),
    implementationPatterns: parse(fs.readFileSync("data/_vocab/implementation-patterns.yaml","utf8")),
    boundaryCases:         parse(fs.readFileSync("data/_vocab/boundary-cases.yaml","utf8")),
  };
  const vr = VocabSchema.safeParse(vocab);
  if (!vr.success) { console.error("_vocab:", JSON.stringify(vr.error.format(),null,2)); errors++; }
  else console.log("  ✓  _vocab");

  for (const dir of fs.readdirSync("data/companies",{withFileTypes:true}).filter((d:any)=>d.isDirectory())) {
    const base = path.join("data/companies", dir.name);
    for (const file of fs.readdirSync(base).filter((f:string)=>f.endsWith(".yaml"))) {
      const cr = CompanySchema.safeParse(parse(fs.readFileSync(path.join(base,file),"utf8")));
      if (!cr.success) { console.error(`  ✗  ${file}`); console.error(JSON.stringify(cr.error.format(),null,2)); errors++; }
      else console.log(`  ✓  ${file}`);
    }
  }
  process.exit(errors > 0 ? 1 : 0);

} else {
  console.error(`Unknown command: ${cmd}. Use: load | export | validate`);
  process.exit(1);
}
""")

# ─────────────────────────────────────────────────────────────────────────────
print("\n5. Patching loader/export.ts — adding named export")
# ─────────────────────────────────────────────────────────────────────────────

with open("loader/export.ts") as f:
    content = f.read()

if "export async function exportAll" not in content:
    content = content.replace(
        "async function exportAll() {",
        "export async function exportAll() {"
    )
    old_call = (
        "exportAll()\n"
        "  .catch(e => { console.error(e); process.exit(1); })\n"
        "  .finally(() => client.end());"
    )
    new_call = (
        "if (process.argv[1]?.endsWith('export.ts') || process.argv[1]?.endsWith('export')) {\n"
        "  exportAll().catch(e => { console.error(e); process.exit(1); }).finally(() => client.end());\n"
        "}"
    )
    content = content.replace(old_call, new_call)
    with open("loader/export.ts", "w") as f:
        f.write(content)
    print("  patched export.ts")
else:
    print("  export.ts already has named export")

# ─────────────────────────────────────────────────────────────────────────────
print("\n6. drizzle-kit push")
# ─────────────────────────────────────────────────────────────────────────────

run("npx drizzle-kit push")

# ─────────────────────────────────────────────────────────────────────────────
print("\n7. Backfilling slugs on existing records")
# ─────────────────────────────────────────────────────────────────────────────

COMPANY_SLUGS = {
    "Automatic Data Processing (ADP)":       "adp",
    "Paychex, Inc.":                         "paychex",
    "Paycom Software, Inc.":                 "paycom",
    "Paylocity Holding Corporation":         "paylocity",
    "Workday, Inc.":                         "workday",
    "Gusto (formerly ZenPayroll)":           "gusto",
    "Zenefits (acquired by TriNet)":         "zenefits",
    "Rippling People Center, Inc.":          "rippling",
    "Justworks, Inc.":                       "justworks",
    "BambooHR":                             "bamboohr",
    "Papaya Global":                         "papaya-global",
    "Deel (formerly Lifeslice)":            "deel",
    "Remote Technology, Inc.":              "remote",
    "Oyster HR":                            "oyster-hr",
    "SAP SE":                               "sap",
    "Oracle Corporation":                   "oracle",
    "SeamlessHR":                           "seamlesshr",
    "Bento Africa (shut down Feb 2025)":    "bento-africa",
    "PaidHR (formerly Pade HCM)":          "paidhr",
    "Employment Hero":                      "employment-hero",
    "Personio SE and Co KG":               "personio",
    "Darwinbox":                            "darwinbox",
    "Charlie HR":                           "charlie-hr",
    "PeopleSoft, Inc.":                     "peoplesoft",
    "Namely":                               "namely",
    "SmartHR":                              "smarthr",
    "PayFit":                               "payfit",
    "Bayzat":                               "bayzat",
    "Workpay":                              "workpay",
    "PaySpace (now Deel Local Payroll)":    "payspace",
}
PROBLEM_SLUGS = {
    "Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and labour regulations.": "wage-compliance",
    "Businesses cannot provide employees with competitive benefits packages without the purchasing power of large employers.":       "employee-benefits",
    "Companies cannot legally employ workers in foreign jurisdictions without establishing local legal entities, which takes 12-18 months and significant capital.": "cross-border-employment",
    "Businesses cannot provision or deprovision employee access to software, hardware, and corporate systems as a single coordinated action.": "it-provisioning",
}
IP_SLUGS = {
    "Manual payroll bureau":                                 "manual-payroll-bureau",
    "Cloud-native SMB payroll SaaS":                        "cloud-native-smb-payroll-saas",
    "Cloud enterprise HCM platform":                        "cloud-enterprise-hcm-platform",
    "Compliance-led free HR SaaS (broker revenue model)":   "compliance-led-free-hr-saas",
    "Compound HR + IT + Finance platform":                  "compound-hr-it-finance-platform",
    "Global payroll / Employer of Record platform":         "global-payroll-eor-platform",
    "On-premise enterprise HCM platform":                   "on-premise-enterprise-hcm-platform",
}
SP_SLUGS = {
    "Payroll processing infrastructure":          "payroll-processing-infrastructure",
    "Cloud HCM platform":                        "cloud-hcm-platform",
    "Global employment infrastructure":          "global-employment-infrastructure",
    "Compound workforce management platform":    "compound-workforce-management-platform",
}

stmts = []
for name, s in COMPANY_SLUGS.items():
    stmts.append(f"UPDATE companies SET slug='{s}' WHERE name='{name.replace(chr(39), chr(39)+chr(39))}' AND slug IS NULL;")
for stmt, s in PROBLEM_SLUGS.items():
    stmts.append(f"UPDATE problems SET slug='{s}' WHERE statement='{stmt.replace(chr(39), chr(39)+chr(39))}' AND slug IS NULL;")
for name, s in IP_SLUGS.items():
    stmts.append(f"UPDATE implementation_patterns SET slug='{s}' WHERE name='{name.replace(chr(39), chr(39)+chr(39))}' AND slug IS NULL;")
for name, s in SP_SLUGS.items():
    stmts.append(f"UPDATE solution_patterns SET slug='{s}' WHERE name='{name.replace(chr(39), chr(39)+chr(39))}' AND slug IS NULL;")

ts = (
    'import postgres from "postgres";\n'
    '(async () => {\n'
    '  const c = postgres(process.env.DATABASE_URL!, { prepare: false });\n'
    + "".join(f'  await c.unsafe({repr(s)});\n' for s in stmts)
    + '  const [r] = await c.unsafe("SELECT (SELECT COUNT(*) FROM companies WHERE slug IS NOT NULL) AS co,(SELECT COUNT(*) FROM problems WHERE slug IS NOT NULL) AS pr,(SELECT COUNT(*) FROM implementation_patterns WHERE slug IS NOT NULL) AS ip,(SELECT COUNT(*) FROM solution_patterns WHERE slug IS NOT NULL) AS sp");\n'
    '  console.log(`  ${r.co} companies  ${r.pr} problems  ${r.ip} impl patterns  ${r.sp} solution patterns`);\n'
    '  await c.end();\n'
    '})();\n'
)
with open("src/db/_tmp_backfill.ts", "w") as f:
    f.write(ts)
run("npx tsx src/db/_tmp_backfill.ts")
os.remove("src/db/_tmp_backfill.ts")

# ─────────────────────────────────────────────────────────────────────────────
print("\n8. Running loader — verifying round-trip")
# ─────────────────────────────────────────────────────────────────────────────

run("npx tsx loader/index.ts load")

print("""
Done. From here on:

  Add a company   →  create data/companies/<domain>/<slug>.yaml
  Load into DB    →  npx tsx loader/index.ts load
  Validate only   →  npx tsx loader/index.ts validate
  Export from DB  →  npx tsx loader/index.ts export
""")