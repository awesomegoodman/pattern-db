/**
 * Seed Extension — Cloud HCM Expansion
 *
 * Adds SAP SE and Oracle Corporation as the second and third
 * observations of the Cloud enterprise HCM implementation pattern.
 *
 * At 3 observations we can fill the first Winning/Failure Condition pairs:
 *   - Cloud HCM Platform (SP)       → maturity: proposed
 *   - Payroll processing infra (SP) → maturity: proposed (8 observations)
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/seed-hcm-expansion.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql, eq } from "drizzle-orm";
import {
  companies,
  companyTimeline,
  companyImplementationPatterns,
  companyProblems,
  solutionPatterns,
} from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { logger: false });

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING STABLE IDs (from seed.ts — do not change)
// ─────────────────────────────────────────────────────────────────────────────

const P = {
  wageCompliance: "a0000001-0000-0000-0000-000000000001",
} as const;

const SP = {
  payrollInfra: "b0000001-0000-0000-0000-000000000001",
  cloudHcm:     "b0000001-0000-0000-0000-000000000002",
} as const;

const IP = {
  enterpriseHcm: "c0000001-0000-0000-0000-000000000003",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// NEW COMPANY IDs
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  sap:    "d0000001-0000-0000-0000-000000000015",
  oracle: "d0000001-0000-0000-0000-000000000016",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// WINNING / FAILURE CONDITION PAIRS
//
// Both pairs are maturity: proposed — not established.
// Reason: all grounding observations are from the same industry (HR/payroll).
// Cross-industry confirmation (ERP, CRM, accounting) will be added in Phase 2
// when those domains are seeded. At that point, upgrade to established.
//
// Symmetry check performed inline below before insertion.
// ─────────────────────────────────────────────────────────────────────────────

const CONDITIONS = {

  cloudHcm: {
    // Grounding observations: Workday, SAP SuccessFactors, Oracle HCM Cloud (3)
    // Pattern: Innovator's dilemma applied to cloud transition.
    // The incumbent's installed base prevents it from going cloud without
    // cannibalising its own license revenue — creating the opening.
    //
    // Symmetry verification:
    //   Winning: incumbent cannot transition → opening exists
    //   Failure: incumbent successfully transitions → opening closes
    //   ✓ Direct logical inverse at same abstraction level.
    //
    // Transferability check (outside HR):
    //   CRM:        Salesforce vs. Siebel (Siebel couldn't go cloud without cannibalising)
    //   Accounting: Xero vs. MYOB/Sage desktop (same dynamic)
    //   Email:      Mailchimp vs. Constant Contact (same dynamic)
    //   → Transfers without restatement. Valid.

    winning: "Incumbent's installed-base lock-in prevents it from offering cloud delivery without cannibalising existing licence revenue, creating a durable opening for a cloud-native entrant whose cost structure carries no on-premise installed base to protect.",
    failure: "Incumbent successfully completes cloud transition — via acquisition, rebuild, or partner ecosystem — before the cloud-native entrant reaches sufficient scale, closing the cost structure window before the entrant achieves switching-cost parity.",
    maturity: "proposed" as const,
    validFrom: 2005,
    // 2005: Workday founded — the moment the pattern became actionable.
    // The on-premise era (PeopleSoft, SAP R/3) preceded this but that is
    // a different solution pattern (on-premise enterprise HCM), not this one.
  },

  payrollInfra: {
    // Grounding observations: ADP, Paychex, Paycom, Paylocity,
    //                         Gusto, BambooHR, Justworks (7 live) + Zenefits (disconfirming)
    // Pattern: Regulatory complexity creates non-discretionary outsourcing demand.
    // The Zenefits disconfirming case tests the failure condition:
    //   Zenefits failed not because the pattern failed but because its
    //   implementation (IP-004) violated the regulatory compliance requirement
    //   that is the pattern's foundation. Confirms the pattern.
    //
    // Symmetry verification:
    //   Winning: regulatory complexity keeps in-house cost above outsource cost
    //   Failure: regulatory complexity collapses OR general platform absorbs it
    //   ✓ Direct logical inverse at same abstraction level.
    //
    // Transferability check (outside payroll):
    //   Tax filing:       H&R Block, Jackson Hewitt (same regulatory complexity driver)
    //   Healthcare billing: athenahealth, Waystar (same dynamic)
    //   Legal compliance: Wolters Kluwer, Thomson Reuters legal (same dynamic)
    //   → Transfers without restatement. Valid.
    //
    // Note: valid_from is 1949 (ADP founding) because ADP IS the founding
    // observation of this pattern — it did not exist before ADP made it viable.

    winning: "Regulatory complexity creates recurring non-discretionary demand for compliance execution, and the rate of regulatory change keeps that complexity high enough that specialist knowledge cannot be cost-effectively replicated in-house.",
    failure: "Regulatory complexity stabilises or decreases to the point where in-house compliance execution becomes cheaper than specialist outsourcing, or a general-purpose software platform successfully abstracts the compliance layer at a price below specialist outsourcing cost.",
    maturity: "proposed" as const,
    validFrom: 1949,
  },

} as const;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  await db.transaction(async (tx) => {

    // ── 1. COMPANIES ─────────────────────────────────────────────────────────
    console.log("Inserting companies...");
    await tx.insert(companies).values([

      {
        id: C.sap,
        name: "SAP SE",
        founded: 1972,
        country: "Germany",
        status: "operating",
        stage: "public",
        fundingHistory: "Self-funded from founding. IPO 1998 (NYSE: SAP, XETRA: SAP). No VC dependency. Founded by five ex-IBM engineers.",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "FY2024 revenue EUR 33.3B (~$36B), operating profit EUR 3.9B (public filing). Founded 1972 as Systemanalyse und Programmentwicklung by Dietmar Hopp, Hasso Plattner, and three others — all ex-IBM. Entered cloud HCM via acquisition of SuccessFactors in 2012 for $3.4B. SuccessFactors was founded in 2001 and IPO'd in 2007 before acquisition. SAP's on-premise installed base (SAP R/3, launched 1992) was both its competitive advantage and its liability when the cloud transition came — the installed base created revenue that could not be abandoned without destroying short-term financials. This is the canonical illustation of the cloud HCM winning condition: incumbent lock-in created the opening Workday exploited.",
      },

      {
        id: C.oracle,
        name: "Oracle Corporation",
        founded: 1977,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Self-funded from founding by Larry Ellison, Bob Miner, Ed Oates. IPO March 1986 (Nasdaq: ORCL). No VC dependency.",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "FY2025 revenue $56.9B, operating income $12.7B (public filing). Entered HCM via hostile acquisition of PeopleSoft in 2005 for $10.3B (18-month hostile takeover battle). PeopleSoft was the dominant on-premise HCM vendor. Key strategic error: Oracle maintained PeopleSoft as a separate product line for years rather than integrating — giving Workday time to establish cloud HCM before Oracle had a credible cloud response. Oracle Fusion HCM (cloud-native) launched 2013, 8 years after the PeopleSoft acquisition. Also acquired Taleo (talent management cloud) in 2012 for $1.9B. The PeopleSoft acquisition is the disconfirming case for on-premise HCM as a standalone strategy — the acquirer absorbed the liability, not just the asset.",
      },

    ]).onConflictDoNothing();

    // ── 2. TIMELINES ─────────────────────────────────────────────────────────
    console.log("Inserting timelines...");
    await tx.insert(companyTimeline).values([

      // SAP ──────────────────────────────────────────────────────────────────
      {
        companyId: C.sap,
        year: 1972,
        eventType: "founding",
        description: "Founded as Systemanalyse und Programmentwicklung by five ex-IBM engineers in Weinheim, Germany. Initial product: financial accounting software running on IBM mainframes. First client: ICI (Imperial Chemical Industries).",
        source: "SAP company history / Wikipedia",
      },
      {
        companyId: C.sap,
        year: 1992,
        eventType: "product_launch",
        description: "Launched SAP R/3 — client-server enterprise software replacing mainframe-based R/2. R/3 became the dominant on-premise ERP globally. This is the installed base that later created lock-in and liability during the cloud transition.",
        source: "SAP company history / Wikipedia",
      },
      {
        companyId: C.sap,
        year: 2012,
        eventType: "acquisition",
        implementationPatternId: IP.enterpriseHcm,
        problemId: P.wageCompliance,
        description: "Acquired SuccessFactors for $3.4B — cloud HCM provider founded in 2001 and IPO'd in 2007. This was SAP's primary cloud HCM entry. Rationale: Workday had demonstrated the cloud HCM model was viable and SAP's on-premise R/3-era HR module could not be cloud-ified without disrupting the installed base. Acquisition was the only viable path to cloud HCM at speed.",
        capabilityDeployed: "SAP's global enterprise sales relationships and customer base — SuccessFactors got immediate access to SAP's 300,000+ customers.",
        capabilityAcquired: "Cloud-native HCM architecture and SaaS delivery model via SuccessFactors. SAP could not build this internally without cannibalising on-premise revenue.",
        source: "TechCrunch / SAP press release / Bloomberg",
      },
      {
        companyId: C.sap,
        year: 2023,
        eventType: "product_launch",
        implementationPatternId: IP.enterpriseHcm,
        description: "SAP SuccessFactors serves 10,000+ customers in 200 countries. SAP is now predominantly cloud revenue (75%+ of new business is cloud). RISE with SAP programme converts on-premise customers to cloud. Market share: ~22% of enterprise HCM market.",
        source: "SAP Annual Report 2023 / Gartner HCM Magic Quadrant",
      },

      // Oracle ───────────────────────────────────────────────────────────────
      {
        companyId: C.oracle,
        year: 1977,
        eventType: "founding",
        description: "Founded as Software Development Laboratories by Larry Ellison, Bob Miner, Ed Oates in Santa Clara. First product: Oracle Database (originally for the CIA). Became the dominant enterprise database vendor.",
        source: "Oracle company history / Wikipedia",
      },
      {
        companyId: C.oracle,
        year: 2005,
        eventType: "acquisition",
        description: "Completed hostile acquisition of PeopleSoft for $10.3B after an 18-month battle. PeopleSoft was the dominant on-premise HCM and ERP vendor. This acquisition directly triggered the founding of Workday: David Duffield (PeopleSoft CEO) and Aneel Bhusri (PeopleSoft SVP) founded Workday in 2005 as a direct response. Oracle's strategy: acquire the incumbent, maintain the installed base, charge maintenance fees. This created the market opening that Workday exploited for the next decade.",
        capabilityAcquired: "PeopleSoft's enterprise HCM customer base (thousands of large enterprises), HR domain expertise, and sales relationships.",
        source: "New York Times / Oracle press release / Workday origin story",
      },
      {
        companyId: C.oracle,
        year: 2012,
        eventType: "acquisition",
        implementationPatternId: IP.enterpriseHcm,
        problemId: P.wageCompliance,
        description: "Acquired Taleo for $1.9B — cloud talent management (recruiting, performance, learning). Oracle's first meaningful cloud HCM product. Also acquired RightNow (customer service cloud) and Eloqua (marketing cloud) in 2012 — broader cloud push.",
        capabilityAcquired: "Cloud-native talent management and recruiting capability via Taleo. Oracle could not build cloud HCM internally without disrupting PeopleSoft maintenance revenue.",
        source: "Oracle press release / TechCrunch",
      },
      {
        companyId: C.oracle,
        year: 2013,
        eventType: "product_launch",
        implementationPatternId: IP.enterpriseHcm,
        description: "Launched Oracle Fusion HCM (now Oracle HCM Cloud) — the cloud-native rebuild of Oracle's on-premise HR product. 8 years after the PeopleSoft acquisition. The long gap between acquisition and cloud product illustrates the execution difficulty of the incumbent cloud transition: the installed base created internal resistance to cannibalising on-premise revenue.",
        capabilityDeployed: "PeopleSoft HR domain knowledge and Oracle's enterprise infrastructure — both reapplied to cloud architecture after years of internal development.",
        source: "Oracle press release / Gartner",
      },
      {
        companyId: C.oracle,
        year: 2024,
        eventType: "product_launch",
        implementationPatternId: IP.enterpriseHcm,
        description: "Oracle HCM Cloud serves 30M+ users across 175+ countries. Oracle is now the second largest HCM vendor by market share (~18%). FY2025 cloud revenue $21.8B, up 25% YoY. Full transition from on-premise to cloud-first complete.",
        source: "Oracle FY2025 earnings / IDC HCM market share report",
      },

    ]).onConflictDoNothing();

    // ── 3. PATTERN + PROBLEM LINKS ───────────────────────────────────────────
    console.log("Inserting relationship links...");
    await tx.insert(companyImplementationPatterns).values([
      {
        companyId: C.sap,
        implementationPatternId: IP.enterpriseHcm,
        confidence: "high",
        source: "SAP Annual Report 2023 / SuccessFactors acquisition press release",
        notes: "SAP entered cloud enterprise HCM via acquisition (SuccessFactors, 2012) rather than organic build. Incumbent transition path — distinct from Workday's greenfield path. Both instantiate the same implementation pattern with meaningfully different execution.",
      },
      {
        companyId: C.oracle,
        implementationPatternId: IP.enterpriseHcm,
        confidence: "high",
        source: "Oracle FY2025 earnings / Taleo acquisition / Oracle Fusion HCM launch",
        notes: "Oracle entered cloud enterprise HCM via acquisition (Taleo, 2012) + internal rebuild (Oracle Fusion HCM, 2013). Second incumbent transition path. The 8-year gap between PeopleSoft acquisition (2005) and cloud HCM launch (2013) is the empirical measure of how long incumbent transition takes when an installed base must be protected.",
      },
    ]).onConflictDoNothing();

    await tx.insert(companyProblems).values([
      { companyId: C.sap,    problemId: P.wageCompliance, source: "SAP SuccessFactors product scope" },
      { companyId: C.oracle, problemId: P.wageCompliance, source: "Oracle HCM Cloud product scope" },
    ]).onConflictDoNothing();

    // ── 4. WINNING / FAILURE CONDITIONS ─────────────────────────────────────
    // Fill now that Cloud HCM has 3 grounding observations (Workday, SAP, Oracle).
    // Payroll infrastructure has 8 — also ready.
    //
    // Both set to 'proposed' not 'established':
    //   - All observations are in the same industry (HR/payroll/HCM)
    //   - Cross-industry confirmation deferred to Phase 2
    //     (accounting, CRM, legal compliance domains will confirm both)
    // ─────────────────────────────────────────────────────────────────────────

    console.log("Filling Winning/Failure Condition pairs...");

    await tx.update(solutionPatterns)
      .set({
        winningCondition:         CONDITIONS.cloudHcm.winning,
        failureCondition:         CONDITIONS.cloudHcm.failure,
        winningConditionMaturity: CONDITIONS.cloudHcm.maturity,
        winningConditionValidFrom: CONDITIONS.cloudHcm.validFrom,
        updatedAt: new Date(),
      })
      .where(eq(solutionPatterns.id, SP.cloudHcm));

    await tx.update(solutionPatterns)
      .set({
        winningCondition:          CONDITIONS.payrollInfra.winning,
        failureCondition:          CONDITIONS.payrollInfra.failure,
        winningConditionMaturity:  CONDITIONS.payrollInfra.maturity,
        winningConditionValidFrom: CONDITIONS.payrollInfra.validFrom,
        updatedAt: new Date(),
      })
      .where(eq(solutionPatterns.id, SP.payrollInfra));

  });

  // ── 5. EVIDENCE COUNT REFRESH ────────────────────────────────────────────
  console.log("Refreshing evidence counts...");

  await db.execute(sql`
    UPDATE implementation_patterns ip
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM company_implementation_patterns cip
      WHERE cip.implementation_pattern_id = ip.id
    )
  `);

  await db.execute(sql`
    UPDATE solution_patterns sp
    SET evidence_count = (
      SELECT COUNT(DISTINCT cip.company_id)
      FROM implementation_patterns ip
      JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
      WHERE ip.solution_pattern_id = sp.id
    )
  `);

  // ── 6. VERIFY ────────────────────────────────────────────────────────────
  console.log("\nVerification:");

  const hcm = await db.execute(sql`
    SELECT
      sp.name,
      sp.evidence_count,
      sp.winning_condition_maturity,
      sp.winning_condition_valid_from,
      LEFT(sp.winning_condition, 80) AS winning_preview,
      LEFT(sp.failure_condition, 80)  AS failure_preview,
      STRING_AGG(c.name, ', ' ORDER BY c.founded) AS grounding_companies
    FROM solution_patterns sp
    JOIN implementation_patterns ip ON ip.solution_pattern_id = sp.id
    JOIN company_implementation_patterns cip ON cip.implementation_pattern_id = ip.id
    JOIN companies c ON c.id = cip.company_id
    WHERE sp.id IN (${SP.cloudHcm}, ${SP.payrollInfra})
    GROUP BY sp.id, sp.name, sp.evidence_count,
             sp.winning_condition_maturity, sp.winning_condition_valid_from,
             sp.winning_condition, sp.failure_condition
    ORDER BY sp.evidence_count DESC
  `) as any[];

  for (const r of hcm) {
    console.log(`\n  ${r.name}`);
    console.log(`  Evidence count:  ${r.evidence_count} companies`);
    console.log(`  Maturity:        ${r.winning_condition_maturity}`);
    console.log(`  Valid from:      ${r.winning_condition_valid_from}`);
    console.log(`  Winning preview: ${r.winning_preview}...`);
    console.log(`  Failure preview: ${r.failure_preview}...`);
    console.log(`  Grounded by:     ${r.grounding_companies}`);
  }

  const total = await db.execute(sql`
    SELECT COUNT(*) AS total FROM companies
  `) as any[];
  console.log(`\n  Total companies in dataset: ${total[0].total}`);

  console.log("\nDone.");
  await client.end();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});