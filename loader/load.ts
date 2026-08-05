import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { parse } from "yaml";
import { CompanySchema, VocabSchema, OpportunitySchema, type Company, type Vocab } from "./validate";

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

function readYaml(p: string) { return parse(fs.readFileSync(p, "utf8")); }

function readVocab(): Vocab {
  const raw = {
    sectors:                readYaml("data/_vocab/sectors.yaml"),
    capabilities:           readYaml("data/_vocab/capabilities.yaml"),
    problems:               readYaml("data/_vocab/problems.yaml"),
    solutionPatterns:       readYaml("data/_vocab/solution-patterns.yaml"),
    implementationPatterns: readYaml("data/_vocab/implementation-patterns.yaml"),
    boundaryCases:          readYaml("data/_vocab/boundary-cases.yaml"),
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
        console.error("\nInvalid: " + path.join(base, file));
        console.error(JSON.stringify(r.error.format(), null, 2));
        process.exit(1);
      }
      out.push(r.data);
    }
  }
  return out;
}

async function map(table: string, col = "slug"): Promise<Record<string, string>> {
  const rows = await client.unsafe("SELECT id, " + col + " AS slug FROM " + table + " WHERE " + col + " IS NOT NULL");
  return Object.fromEntries(rows.map((r: any) => [r.slug, r.id]));
}

function need(m: Record<string, string>, slug: string, ctx: string): string {
  const id = m[slug];
  if (!id) { console.error("  Unknown slug \"" + slug + "\" in " + ctx); process.exit(1); }
  return id;
}

export async function load() {
  const vocab     = readVocab();
  const companies = readCompanies();
  console.log("  " + vocab.sectors.length + " sectors  " + vocab.capabilities.length + " capabilities  " + vocab.problems.length + " problems");
  console.log("  " + vocab.solutionPatterns.length + " solution patterns  " + vocab.implementationPatterns.length + " impl patterns");
  console.log("  " + companies.length + " companies");

  await client.unsafe("BEGIN");
  try {

    // ── Sectors ──────────────────────────────────────────────────────────────
    for (const s of vocab.sectors)
      await client.unsafe(
        "INSERT INTO sectors (id,slug,name,created_at) VALUES (gen_random_uuid(),$1,$2,now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name",
        [s.slug, s.name]
      );
    const sectorMap = await map("sectors");

    // ── Capabilities ─────────────────────────────────────────────────────────
    for (const c of vocab.capabilities)
      await client.unsafe(
        "INSERT INTO capabilities (id,slug,name,description,status,created_at) VALUES (gen_random_uuid(),$1,$2,$3,'candidate',now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,status='candidate'",
        [c.slug, c.name, c.description]
      );
    const capMap = await map("capabilities");

    // Pass 2: upsert sector evidence
    for (const c of vocab.capabilities) {
      for (const e of c.sector_evidence ?? []) {
        const sid = sectorMap[e.sector];
        if (!sid) { console.error("  Unknown sector \"" + e.sector + "\""); process.exit(1); }
        await client.unsafe(
          "INSERT INTO capability_sector_evidence (id,capability_id,sector_id,example_company,evidence_note,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,now()) ON CONFLICT(capability_id,sector_id) DO UPDATE SET example_company=EXCLUDED.example_company,evidence_note=EXCLUDED.evidence_note",
          [capMap[c.slug], sid, e.example_company, e.evidence_note]
        );
      }
    }

    // Pass 3: promote to final status now that evidence rows exist
    for (const c of vocab.capabilities)
      await client.unsafe(
        "UPDATE capabilities SET status=$1 WHERE slug=$2",
        [c.status, c.slug]
      );

    // ── Problems ─────────────────────────────────────────────────────────────
    for (const p of vocab.problems)
      await client.unsafe(
        "INSERT INTO problems (id,slug,statement,lifecycle,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET statement=EXCLUDED.statement,lifecycle=EXCLUDED.lifecycle,notes=EXCLUDED.notes",
        [p.slug, p.statement, p.lifecycle ?? null, p.notes ?? null]
      );
    const problemMap = await map("problems");

    // ── Solution Patterns ────────────────────────────────────────────────────
    for (const sp of vocab.solutionPatterns)
      await client.unsafe(
        "INSERT INTO solution_patterns (id,slug,name,first_observed,pattern_durability,winning_condition,failure_condition,winning_condition_maturity,winning_condition_valid_from,winning_condition_valid_through,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,first_observed=EXCLUDED.first_observed,pattern_durability=EXCLUDED.pattern_durability,winning_condition=EXCLUDED.winning_condition,failure_condition=EXCLUDED.failure_condition,winning_condition_maturity=EXCLUDED.winning_condition_maturity,winning_condition_valid_from=EXCLUDED.winning_condition_valid_from,winning_condition_valid_through=EXCLUDED.winning_condition_valid_through,notes=EXCLUDED.notes,updated_at=now()",
        [sp.slug, sp.name, sp.first_observed ?? null, sp.pattern_durability ?? null, sp.winning_condition ?? null, sp.failure_condition ?? null, sp.winning_condition_maturity ?? null, sp.winning_condition_valid_from ?? null, sp.winning_condition_valid_through ?? null, sp.notes ?? null]
      );
    const spMap = await map("solution_patterns");

    // ── Implementation Patterns ───────────────────────────────────────────────
    for (const ip of vocab.implementationPatterns) {
      const spId = ip.solution_pattern ? (spMap[ip.solution_pattern] ?? null) : null;
      await client.unsafe(
        "INSERT INTO implementation_patterns (id,slug,name,solution_pattern_id,first_observed,status,business_model,pricing_signal,mechanism,notes,evidence_count,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,0,now(),now()) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,solution_pattern_id=EXCLUDED.solution_pattern_id,first_observed=EXCLUDED.first_observed,status=EXCLUDED.status,business_model=EXCLUDED.business_model,pricing_signal=EXCLUDED.pricing_signal,mechanism=EXCLUDED.mechanism,notes=EXCLUDED.notes,updated_at=now()",
        [ip.slug, ip.name, spId, ip.first_observed ?? null, ip.status ?? null, ip.business_model ?? null, ip.pricing_signal ?? null, ip.mechanism ?? null, ip.notes ?? null]
      );
    }
    const ipMap = await map("implementation_patterns");

    // ── Boundary Cases ────────────────────────────────────────────────────────
    for (const bc of vocab.boundaryCases)
      await client.unsafe(
        "INSERT INTO boundary_cases (id,company_name,option_a,option_b,chosen,reason,resolved_at,created_at) SELECT gen_random_uuid(),$1,$2,$3,$4,$5,$6,now() WHERE NOT EXISTS (SELECT 1 FROM boundary_cases WHERE company_name=$1 AND option_a=$2)",
        [bc.company, bc.option_a, bc.option_b, bc.chosen, bc.reason, bc.resolved_at ? new Date(bc.resolved_at).toISOString() : new Date().toISOString()]
      );

    // ── Companies ─────────────────────────────────────────────────────────────
    let inserted = 0, updated = 0;
    for (const c of companies) {
      const ex = await client.unsafe("SELECT id FROM companies WHERE slug=$1", [c.slug]);
      let cid: string;
      if (ex.length === 0) {
        const [row] = await client.unsafe(
          "INSERT INTO companies (id,slug,name,founded,country,status,stage,funding_history,revenue_signal,profitability_signal,profitability_proxy_applied,evidence_weight,signal_confidence,research_queue_source,notable_facts,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),now()) RETURNING id",
          [c.slug, c.name, c.founded ?? null, c.country ?? null, c.status, c.stage ?? null, c.funding_history ?? null, c.revenue_signal ?? null, c.profitability_signal ?? null, c.profitability_proxy_applied ?? false, c.evidence_weight, c.signal_confidence, c.research_queue_source, c.notable_facts ?? null]
        );
        cid = row.id; inserted++;
      } else {
        cid = ex[0].id;
        await client.unsafe(
          "UPDATE companies SET name=$1,founded=$2,country=$3,status=$4,stage=$5,funding_history=$6,revenue_signal=$7,profitability_signal=$8,profitability_proxy_applied=$9,evidence_weight=$10,signal_confidence=$11,research_queue_source=$12,notable_facts=$13,updated_at=now() WHERE id=$14",
          [c.name, c.founded ?? null, c.country ?? null, c.status, c.stage ?? null, c.funding_history ?? null, c.revenue_signal ?? null, c.profitability_signal ?? null, c.profitability_proxy_applied ?? false, c.evidence_weight, c.signal_confidence, c.research_queue_source, c.notable_facts ?? null, cid]
        );
        updated++;
      }

      for (const ip of c.implementation_patterns) {
        const ipId = need(ipMap, ip.slug, c.slug + " -> implementation_patterns");
        await client.unsafe(
          "INSERT INTO company_implementation_patterns (company_id,implementation_pattern_id,confidence,source,notes,created_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT(company_id,implementation_pattern_id) DO UPDATE SET confidence=EXCLUDED.confidence,source=EXCLUDED.source,notes=EXCLUDED.notes",
          [cid, ipId, ip.confidence ?? "high", ip.source ?? null, ip.notes ?? null]
        );
      }

      for (const p of c.problems) {
        const pid = need(problemMap, p.slug, c.slug + " -> problems");
        await client.unsafe(
          "INSERT INTO company_problems (company_id,problem_id,confidence,source,notes,created_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT(company_id,problem_id) DO UPDATE SET confidence=EXCLUDED.confidence,source=EXCLUDED.source,notes=EXCLUDED.notes",
          [cid, pid, p.confidence ?? "high", p.source ?? null, p.notes ?? null]
        );
      }

      await client.unsafe("DELETE FROM company_timeline WHERE company_id=$1", [cid]);
      for (const t of c.timeline) {
        await client.unsafe(
          "INSERT INTO company_timeline (id,company_id,year,event_type,description,implementation_pattern_id,problem_id,capability_id,capability_deployed,capability_acquired,source,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())",
          [cid, t.year, t.event_type, t.description, t.implementation_pattern ? (ipMap[t.implementation_pattern] ?? null) : null, t.problem ? (problemMap[t.problem] ?? null) : null, t.capability ? (capMap[t.capability] ?? null) : null, t.capability_deployed ?? null, t.capability_acquired ?? null, t.source]
        );
      }
    }

    // ── Evidence counts ───────────────────────────────────────────────────────
    await client.unsafe("UPDATE problems p SET evidence_count=(SELECT COUNT(DISTINCT cp.company_id) FROM company_problems cp WHERE cp.problem_id=p.id)");
    await client.unsafe("UPDATE implementation_patterns ip SET evidence_count=(SELECT COUNT(DISTINCT cip.company_id) FROM company_implementation_patterns cip WHERE cip.implementation_pattern_id=ip.id)");
    await client.unsafe("UPDATE solution_patterns sp SET evidence_count=(SELECT COUNT(DISTINCT cip.company_id) FROM implementation_patterns ip JOIN company_implementation_patterns cip ON cip.implementation_pattern_id=ip.id WHERE ip.solution_pattern_id=sp.id)");

    // ── Layer 3: Opportunities ────────────────────────────────────────────────
    const oppsDir = "data/opportunities";
    if (fs.existsSync(oppsDir)) {
      const oppFiles = fs.readdirSync(oppsDir).filter(function(f) { return f.endsWith(".yaml") && !f.startsWith("_"); });
      let oppInserted = 0, oppUpdated = 0;

      for (const file of oppFiles) {
        const raw = readYaml(path.join(oppsDir, file));
        const r   = OpportunitySchema.safeParse(raw);
        if (!r.success) {
          console.error("\nInvalid opportunity: " + file);
          console.error(JSON.stringify(r.error.format(), null, 2));
          process.exit(1);
        }
        const o = r.data;

        const problemId = need(problemMap, o.problem, o.slug + " -> problem");

        // Gap fingerprint for redundancy detection
        const capSlugs = o.capabilities_required.map(function(c: any) { return c.slug; }).sort().join(",");
        const gapFingerprint = createHash("md5")
          .update([o.problem, (o as any).lens ?? "", capSlugs].join("|"))
          .digest("hex").slice(0, 12);

        // Normalise open_questions to plain text
        const openQText = ((o as any).open_questions ?? []).map(function(q: any) {
          if (typeof q === "string") return q;
          return [q.question, q.method ? "Method: " + q.method : "", q.close_criteria ? "Close: " + q.close_criteria : ""].filter(Boolean).join(" | ");
        }).join("\n");

        // Predictions plain text summary
        const predictionsText = ((o as any).predictions ?? []).map(function(p: any) {
          return p.claim + " | Falsified by: " + p.falsification + (p.horizon ? " | By: " + p.horizon : "");
        }).join("\n");

        const gapEvidence = o.gap_evidence.join("\n");
        const statusQuo   = o.status_quo.join("\n");

        // well_formed flag
        const hasPair  = !!(o.winning_condition_required && o.failure_condition_to_avoid);
        const hasPreds = ((o as any).predictions ?? []).length >= 1;
        const hasQs    = ((o as any).open_questions ?? []).length >= 1;
        const hasDep   = (o as any).generation_mode !== "interpretive" || !!(o as any).departure_point;
        const hasLens  = !!(o as any).lens;
        const wellFormed = hasPair && hasPreds && hasQs && hasDep && hasLens;

        if (!wellFormed) {
          const why = [
            !hasPair  && "missing winning/failure condition pair",
            !hasPreds && "needs >=1 prediction with claim+falsification",
            !hasQs    && "needs >=1 open_question",
            !hasDep   && "interpretive mode requires departure_point",
            !hasLens  && "missing lens",
          ].filter(Boolean).join("; ");
          console.log("  WARNING " + o.slug + ": not well-formed (" + why + ") -- stored as draft");
        }

        const ex = await client.unsafe("SELECT id FROM opportunities WHERE slug=$1", [o.slug]);
        let oid: string;

        if (ex.length === 0) {
          const rows = await client.unsafe(
            "INSERT INTO opportunities" +
            " (id,slug,name,status,problem_id," +
            "  observed_gap,gap_evidence,evidence_strength,hypothesis," +
            "  winning_condition_required,failure_condition_to_avoid," +
            "  status_quo_to_displace,open_questions,notes," +
            "  generation_mode,departure_point,lens,gap_fingerprint,well_formed,predictions_text," +
            "  created_at,updated_at)" +
            " VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now(),now())" +
            " RETURNING id",
            [
              o.slug, o.name, o.status, problemId,
              o.observed_gap, gapEvidence, o.evidence_strength, o.hypothesis,
              o.winning_condition_required ?? null, o.failure_condition_to_avoid ?? null,
              statusQuo, openQText, o.notes ?? null,
              (o as any).generation_mode ?? "derived",
              (o as any).departure_point ?? null,
              (o as any).lens ?? null,
              gapFingerprint, wellFormed, predictionsText,
            ]
          );
          oid = rows[0].id; oppInserted++;
        } else {
          oid = ex[0].id;
          await client.unsafe(
            "UPDATE opportunities SET" +
            " name=$1,status=$2,problem_id=$3," +
            " observed_gap=$4,gap_evidence=$5,evidence_strength=$6,hypothesis=$7," +
            " winning_condition_required=$8,failure_condition_to_avoid=$9," +
            " status_quo_to_displace=$10,open_questions=$11,notes=$12," +
            " generation_mode=$13,departure_point=$14,lens=$15," +
            " gap_fingerprint=$16,well_formed=$17,predictions_text=$18,updated_at=now()" +
            " WHERE id=$19",
            [
              o.name, o.status, problemId,
              o.observed_gap, gapEvidence, o.evidence_strength, o.hypothesis,
              o.winning_condition_required ?? null, o.failure_condition_to_avoid ?? null,
              statusQuo, openQText, o.notes ?? null,
              (o as any).generation_mode ?? "derived",
              (o as any).departure_point ?? null,
              (o as any).lens ?? null,
              gapFingerprint, wellFormed, predictionsText, oid,
            ]
          );
          oppUpdated++;
        }

        // Rebuild pattern links
        await client.unsafe("DELETE FROM opportunity_patterns WHERE opportunity_id=$1", [oid]);
        for (const s of o.existing_patterns) {
          const pid = need(ipMap, s, o.slug + " -> existing_patterns");
          await client.unsafe(
            "INSERT INTO opportunity_patterns (opportunity_id,implementation_pattern_id,role,created_at) VALUES ($1,$2,'existing',now()) ON CONFLICT DO NOTHING",
            [oid, pid]
          );
        }
        for (const s of o.recombined_patterns) {
          const pid = need(ipMap, s, o.slug + " -> recombined_patterns");
          await client.unsafe(
            "INSERT INTO opportunity_patterns (opportunity_id,implementation_pattern_id,role,created_at) VALUES ($1,$2,'recombined',now()) ON CONFLICT DO NOTHING",
            [oid, pid]
          );
        }

        // Rebuild capability links
        await client.unsafe("DELETE FROM opportunity_capabilities WHERE opportunity_id=$1", [oid]);
        for (const cap of o.capabilities_required) {
          const cid = need(capMap, cap.slug, o.slug + " -> capabilities_required");
          await client.unsafe(
            "INSERT INTO opportunity_capabilities (opportunity_id,capability_id,possessed_by,available_to_new_entrant,note,created_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT DO NOTHING",
            [oid, cid, cap.possessed_by.join(",") || null, cap.available_to_new_entrant, cap.note ?? null]
          );
        }

        // Rebuild predictions
        await client.unsafe("DELETE FROM opportunity_predictions WHERE opportunity_id=$1", [oid]);
        for (const pred of ((o as any).predictions ?? [])) {
          await client.unsafe(
            "INSERT INTO opportunity_predictions (id,opportunity_id,claim,falsification,horizon,status,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,'open',now())",
            [oid, pred.claim, pred.falsification, pred.horizon ?? null]
          );
        }

        // Auto-link opportunities sharing the same gap fingerprint
        const twins = await client.unsafe(
          "SELECT id, slug FROM opportunities WHERE gap_fingerprint=$1 AND id!=$2",
          [gapFingerprint, oid]
        );
        for (const twin of twins) {
          await client.unsafe(
            "INSERT INTO opportunity_relationships (opportunity_id,related_opportunity_id,relationship_type,notes,created_at)" +
            " VALUES ($1,$2,'competing',$3,now()) ON CONFLICT DO NOTHING",
            [oid, twin.id, "Auto-linked: same gap_fingerprint " + gapFingerprint + ". Review and reclassify if not actually competing."]
          );
          console.log("  <-> " + o.slug + " same gap fingerprint as " + twin.slug);
        }
      }

      console.log("  opportunities: " + oppInserted + " inserted  " + oppUpdated + " updated");
    }

    await client.unsafe("COMMIT");

    const [counts] = await client.unsafe("SELECT (SELECT COUNT(*) FROM companies) AS co,(SELECT COUNT(*) FROM company_timeline) AS tl,(SELECT COUNT(*) FROM company_implementation_patterns) AS rel");
    console.log("\n  " + inserted + " inserted  " + updated + " updated  |  " + counts.co + " companies  " + counts.tl + " timeline entries  " + counts.rel + " relationships");

  } catch (err) {
    await client.unsafe("ROLLBACK");
    console.error("\nLoad failed -- rolled back.");
    throw err;
  } finally {
    await client.end();
  }
}
