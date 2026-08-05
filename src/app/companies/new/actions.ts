"use server";

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { stringify } from "yaml";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveCompany(data: unknown) {
  try {
    // Basic shape check
    const d = data as Record<string, any>;
    if (!d.name || !d.status || !d.evidence_weight) {
      return { error: "name, status, and evidence_weight are required" };
    }

    // Derive slug if not provided
    if (!d.slug) d.slug = toSlug(d.name);

    // Domain defaults to hr-payroll
    const domain = (d.domain as string) || "hr-payroll";

    // Clean up empty optional fields
    const clean = Object.fromEntries(
      Object.entries(d).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );

    // Write YAML
    const dir = join(process.cwd(), "data", "companies", domain);
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, `${d.slug}.yaml`);
    writeFileSync(filePath, stringify(clean, { indent: 2, lineWidth: 120 }), "utf8");

    // Run loader
    const { stderr } = await execAsync("npx tsx loader/index.ts load", {
      cwd: process.cwd(),
      env: process.env,
    });
    if (stderr && stderr.includes("Load failed")) {
      return { error: `Loader error: ${stderr.slice(0, 300)}` };
    }

    return { success: true, slug: d.slug, file: filePath };
  } catch (err: any) {
    return { error: err.message ?? "Unknown error" };
  }
}
