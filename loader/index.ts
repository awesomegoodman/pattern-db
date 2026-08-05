/**
 * loader/index.ts
 *
 * npx tsx loader/index.ts          — load (default)
 * npx tsx loader/index.ts load     — load all YAML into DB
 * npx tsx loader/index.ts export   — dump DB to YAML (one-time)
 * npx tsx loader/index.ts validate — validate YAML without touching DB
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "yaml";
import { CompanySchema, VocabSchema } from "./validate";

const cmd = process.argv[2] ?? "load";

(async () => {

  if (cmd === "load") {
    console.log("Loading YAML files into database...");
    const { load } = await import("./load");
    await load();

  } else if (cmd === "export") {
    console.log("Exporting database to YAML...");
    const { exportAll } = await import("./export");
    await exportAll();

  } else if (cmd === "validate") {
    console.log("Validating YAML files...");
    let errors = 0;

    const vocab = {
      sectors:               parse(fs.readFileSync("data/_vocab/sectors.yaml",       "utf8")),
      capabilities:          parse(fs.readFileSync("data/_vocab/capabilities.yaml",   "utf8")),
      problems:              parse(fs.readFileSync("data/_vocab/problems.yaml",        "utf8")),
      solutionPatterns:      parse(fs.readFileSync("data/_vocab/solution-patterns.yaml","utf8")),
      implementationPatterns: parse(fs.readFileSync("data/_vocab/implementation-patterns.yaml","utf8")),
      boundaryCases:         parse(fs.readFileSync("data/_vocab/boundary-cases.yaml", "utf8")),
    };
    const vr = VocabSchema.safeParse(vocab);
    if (!vr.success) { console.error("_vocab:", JSON.stringify(vr.error.format(),null,2)); errors++; }
    else console.log("  ✓  _vocab");

    for (const dir of fs.readdirSync("data/companies",{withFileTypes:true}).filter((d:any)=>d.isDirectory())) {
      const base = path.join("data/companies", dir.name);
      for (const file of fs.readdirSync(base).filter((f:string)=>f.endsWith(".yaml"))) {
        const raw = parse(fs.readFileSync(path.join(base,file),"utf8"));
        const cr = CompanySchema.safeParse(raw);
        if (!cr.success) {
          console.error(`  ✗  ${file}`);
          console.error(JSON.stringify(cr.error.format(),null,2));
          errors++;
        } else {
          console.log(`  ✓  ${file}`);
        }
      }
    }
    process.exit(errors > 0 ? 1 : 0);

  } else {
    console.error(`Unknown command: ${cmd}. Use: load | export | validate`);
    process.exit(1);
  }

})();
