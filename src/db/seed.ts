/**
 * Seed — Phase 1 Calibration Data
 * Domain: HR Tech / Payroll
 * 14 companies · 6 implementation patterns · 4 problems
 *
 * Run: set -a && source .env.local && set +a && npx tsx src/db/seed.ts
 *
 * Idempotent: all inserts use onConflictDoNothing().
 * Safe to re-run after schema changes.
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import {
  companies,
  companyTimeline,
  problems,
  solutionPatterns,
  implementationPatterns,
  companyImplementationPatterns,
  companyProblems,
  solutionPatternProblems,
  boundaryCases,
} from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { logger: false });

// ─────────────────────────────────────────────────────────────────────────────
// STABLE IDs
// Hardcoded so foreign keys resolve correctly across re-runs.
// ─────────────────────────────────────────────────────────────────────────────

const P = {
  wageCompliance:    "a0000001-0000-0000-0000-000000000001",
  employeeBenefits:  "a0000001-0000-0000-0000-000000000002",
  crossBorderEmploy: "a0000001-0000-0000-0000-000000000003",
  itProvisioning:    "a0000001-0000-0000-0000-000000000004",
} as const;

const SP = {
  payrollInfra:      "b0000001-0000-0000-0000-000000000001",
  cloudHcm:          "b0000001-0000-0000-0000-000000000002",
  globalEmployment:  "b0000001-0000-0000-0000-000000000003",
  compoundWorkforce: "b0000001-0000-0000-0000-000000000004",
} as const;

const IP = {
  bureau:           "c0000001-0000-0000-0000-000000000001",
  smbSaaS:          "c0000001-0000-0000-0000-000000000002",
  enterpriseHcm:    "c0000001-0000-0000-0000-000000000003",
  complianceFree:   "c0000001-0000-0000-0000-000000000004",
  compoundPlatform: "c0000001-0000-0000-0000-000000000005",
  globalEor:        "c0000001-0000-0000-0000-000000000006",
} as const;

const C = {
  adp:       "d0000001-0000-0000-0000-000000000001",
  paychex:   "d0000001-0000-0000-0000-000000000002",
  paycom:    "d0000001-0000-0000-0000-000000000003",
  paylocity: "d0000001-0000-0000-0000-000000000004",
  workday:   "d0000001-0000-0000-0000-000000000005",
  gusto:     "d0000001-0000-0000-0000-000000000006",
  zenefits:  "d0000001-0000-0000-0000-000000000007",
  rippling:  "d0000001-0000-0000-0000-000000000008",
  justworks: "d0000001-0000-0000-0000-000000000009",
  bamboohr:  "d0000001-0000-0000-0000-000000000010",
  papaya:    "d0000001-0000-0000-0000-000000000011",
  deel:      "d0000001-0000-0000-0000-000000000012",
  remote:    "d0000001-0000-0000-0000-000000000013",
  oyster:    "d0000001-0000-0000-0000-000000000014",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  await db.transaction(async (tx) => {

    // ── 1. PROBLEMS ──────────────────────────────────────────────────────────
    console.log("Inserting problems...");
    await tx.insert(problems).values([
      {
        id: P.wageCompliance,
        statement: "Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and labour regulations.",
        lifecycle: "mature",
        notes: "Status quo: manual calculation + paper cheques + accountant. Underlying constraint: regulatory friction + coordination failure. Frequency: bi-weekly. Urgency: high (legal obligation with penalties for non-compliance). Existing spend: significant — accountant fees, internal labour, penalty risk.",
      },
      {
        id: P.employeeBenefits,
        statement: "Businesses cannot provide employees with competitive benefits packages without the purchasing power of large employers.",
        lifecycle: "mature",
        notes: "Status quo: direct insurer negotiation (only viable at scale) or no benefits offered. Underlying constraint: scale requirements. SMBs cannot access group rates without aggregation. Urgency: high — benefits are a key hiring and retention lever.",
      },
      {
        id: P.crossBorderEmploy,
        statement: "Companies cannot legally employ workers in foreign jurisdictions without establishing local legal entities, which takes 12-18 months and significant capital.",
        lifecycle: "growing",
        notes: "Status quo: contractor misclassification (legally risky) or entity setup (slow, expensive, $20k-$100k+). Underlying constraint: regulatory friction per jurisdiction. Accelerated by remote work normalisation post-2020. Triggers: hiring a specific person abroad, entering a new market, distributed team formation.",
      },
      {
        id: P.itProvisioning,
        statement: "Businesses cannot provision or deprovision employee access to software, hardware, and corporate systems as a single coordinated action.",
        lifecycle: "growing",
        notes: "Status quo: manual IT tickets + email + spreadsheets per system. Underlying constraint: coordination failure — each system has separate admin. Urgency: grows with employee count and number of SaaS tools. Security risk on offboarding is significant driver.",
      },
    ]).onConflictDoNothing();

    // ── 2. SOLUTION PATTERNS ─────────────────────────────────────────────────
    console.log("Inserting solution patterns...");
    await tx.insert(solutionPatterns).values([
      {
        id: SP.payrollInfra,
        name: "Payroll processing infrastructure",
        firstObserved: 1949,
        patternDurability: "decades-old",
        notes: "The structural bet that a third party can handle wage calculation, tax withholding, and disbursement more reliably and cheaply than employers doing it themselves. Has produced profitable operators across three distinct technological eras: manual bureau, desktop/server, cloud SaaS. Winning/Failure conditions deferred — need 3+ cross-industry observations.",
      },
      {
        id: SP.cloudHcm,
        name: "Cloud HCM platform",
        firstObserved: 2005,
        patternDurability: "established",
        notes: "The structural bet that a unified cloud platform can replace fragmented on-premise HR software (PeopleSoft, SAP) for enterprise workforce management. Founded on the insight that cloud delivery enables continuous updates, cross-module data sharing, and lower total cost of ownership than on-premise.",
      },
      {
        id: SP.globalEmployment,
        name: "Global employment infrastructure",
        firstObserved: 2016,
        patternDurability: "emerging",
        notes: "The structural bet that a technology-enabled intermediary can absorb the legal and compliance complexity of cross-border employment, making global hiring accessible without entity setup. Two sub-approaches: entity-ownership model (Deel, Remote) vs. partner model (Papaya Global). Entity-ownership model appears to be winning as of 2025.",
      },
      {
        id: SP.compoundWorkforce,
        name: "Compound workforce management platform",
        firstObserved: 2016,
        patternDurability: "emerging",
        notes: "The structural bet that HR, IT, and Finance are not separate domains but a single operational problem — managing the employee lifecycle — that should be served by one data model. Requires a unified employee record as the core primitive. Parker Conrad's explicit thesis at Rippling after diagnosing Zenefits's failure.",
      },
    ]).onConflictDoNothing();

    // ── 3. IMPLEMENTATION PATTERNS ───────────────────────────────────────────
    console.log("Inserting implementation patterns...");
    await tx.insert(implementationPatterns).values([
      {
        id: IP.bureau,
        name: "Manual payroll bureau",
        solutionPatternId: SP.payrollInfra,
        firstObserved: 1949,
        status: "live",
        businessModel: "Per-employee-per-period fee (outsourced service)",
        pricingSignal: "<100/mo",
        notes: "Offline service model: employer sends payroll data, bureau processes and disburses. Initial advantage: batch processing at scale that individual employers could not achieve. Moat: switching cost from embedded payroll data + compliance records. Mechanism: delegation. Status quo displaced: in-house manual payroll by an accountant or bookkeeper.",
      },
      {
        id: IP.smbSaaS,
        name: "Cloud-native SMB payroll SaaS",
        solutionPatternId: SP.payrollInfra,
        firstObserved: 1998,
        status: "live",
        businessModel: "Per-employee-per-month subscription",
        pricingSignal: "<100/mo",
        notes: "Self-serve web-based payroll for businesses with 1-500 employees. Initial advantage: internet-native interface vs. desktop software and fax-based bureau model. Moat: payroll data stickiness + accountant referral network. Mechanism: abstraction. Status quo displaced: ADP/Paychex bureau model + QuickBooks desktop. Business model convergence confirmed: every surviving operator uses PEPM subscription — Paycom (1998), Paylocity (1997), Gusto (2012), BambooHR (2008), Justworks (2012).",
      },
      {
        id: IP.enterpriseHcm,
        name: "Cloud enterprise HCM platform",
        solutionPatternId: SP.cloudHcm,
        firstObserved: 2005,
        status: "live",
        businessModel: "Enterprise subscription (annual contract)",
        pricingSignal: "enterprise",
        notes: "Cloud-first replacement for on-premise HCM (PeopleSoft, SAP SuccessFactors) targeting Fortune 500 and large enterprises. Initial advantage: single-version cloud model (no costly upgrades) vs. on-premise maintenance burden. Moat: deep system-of-record integration, switching cost from years of workforce data. Mechanism: abstraction. Status quo displaced: Oracle PeopleSoft, SAP on-premise.",
      },
      {
        id: IP.complianceFree,
        name: "Compliance-led free HR SaaS (broker revenue model)",
        solutionPatternId: SP.payrollInfra,
        firstObserved: 2013,
        status: "dead",
        businessModel: "Insurance broker commissions (software free to employer)",
        pricingSignal: "free",
        notes: "DEAD PATTERN. Free HR software funded by insurance broker commissions. Structural failure mode: model requires operating as a licensed insurance broker in each state, which does not scale at venture speed. Zenefits was selling insurance without licences in multiple states. The compliance requirement scales linearly with geographic expansion, creating maximum friction at maximum growth. See boundary_cases for Zenefits/Rippling lineage.",
      },
      {
        id: IP.compoundPlatform,
        name: "Compound HR + IT + Finance platform",
        solutionPatternId: SP.compoundWorkforce,
        firstObserved: 2016,
        status: "live",
        businessModel: "Modular per-employee-per-month subscription",
        pricingSignal: "<100/mo",
        notes: "Unified workforce OS built on a single employee record (Employee Graph) powering HR, IT, and Finance simultaneously. Employee data is the same across all three domains — storing it once eliminates integration cost and enables cross-module automation. New modules reach $1M ARR within 5-6 months of launch because data setup is already complete. Mechanism: workflow orchestration + abstraction. Moat: the Employee Graph itself — more modules adopted = higher switching cost. Capability required: unified data architecture from day one (cannot be bolted on).",
      },
      {
        id: IP.globalEor,
        name: "Global payroll / Employer of Record platform",
        solutionPatternId: SP.globalEmployment,
        firstObserved: 2016,
        status: "live",
        businessModel: "Per-employee-per-month ($500-650 for EOR, lower for contractor)",
        pricingSignal: "<100/mo",
        notes: "Technology-enabled EOR: platform acts as legal employer in each country, handling local compliance, payroll, and benefits on behalf of client companies. Two sub-models: (1) entity-ownership (Deel, Remote — own legal entities per country, higher margin control, slower expansion); (2) partner model (Papaya Global — partners with local providers, faster expansion, lower margin, weaker moat). Entity-ownership appears to be winning as of 2025. Status quo displaced: traditional EOR agencies charging 15%+ of payroll with high-touch, non-transparent pricing. Mechanism: coordination.",
      },
    ]).onConflictDoNothing();

    // ── 4. COMPANIES ─────────────────────────────────────────────────────────
    console.log("Inserting companies...");
    await tx.insert(companies).values([
      {
        id: C.adp,
        name: "Automatic Data Processing (ADP)",
        founded: 1949,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Self-funded from founding. IPO September 1961 at $3/share (~$419k revenue at time). Nasdaq: ADP.",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "FY2025 revenue $20.6B, net income $4.08B (public filing). Processes payroll for ~1 in 6 US employees. 75 years operating, fully self-sustaining. Founded by Henry Taub with $6,000 initial investment. Founder visited a company where employees were not paid on time due to one clerk's illness — identified reliability as the core value proposition.",
      },
      {
        id: C.paychex,
        name: "Paychex, Inc.",
        founded: 1971,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Self-funded from founding. Tom Golisano started with $3,000. IPO 1983 (Nasdaq: PAYX).",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "FY2025 revenue $5.57B, net income $1.66B, operating income $2.21B (public filing). ~800,000 payroll clients. 100+ offices. Fortune 500 (#681). Focused on SMB segment vs. ADP's full-market coverage. 54 years operating.",
      },
      {
        id: C.paycom,
        name: "Paycom Software, Inc.",
        founded: 1998,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Self-funded until IPO April 15 2014 (NYSE: PAYC). No external VC. Founder Chad Richison retained majority control through IPO.",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "2025 revenue $2.05B, operating income $567M, net income $453M (public filing). One of the first fully online payroll providers. Founded by Chad Richison, who had prior payroll industry experience. S&P 600 component. 5,800 employees. Bootstrapped to IPO.",
      },
      {
        id: C.paylocity,
        name: "Paylocity Holding Corporation",
        founded: 1997,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Founded as Ameripay Payroll Ltd. Self-funded until IPO 2014 (Nasdaq: PCTY). Founder Steve Sarowitz held 44% at IPO.",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "2025 revenue $1.59B, operating income $304M, net income $227M (public filing). Targets SMB-mid market (50-1,000 employees). Active acquirer: BeneFLEX (2018), VidGrid (2020), Blue Marble Payroll (2021), Airbase (2024). S&P 400 component.",
      },
      {
        id: C.workday,
        name: "Workday, Inc.",
        founded: 2005,
        country: "USA",
        status: "operating",
        stage: "public",
        fundingHistory: "Greylock Partners (initial VC). IPO October 2012 at ~$9.5B valuation (Nasdaq: WDAY).",
        revenueSignal: ">1B",
        profitabilitySignal: "known_profitable",
        evidenceWeight: "strong_validator",
        signalConfidence: "high",
        notableFacts: "FY2026 revenue $9.55B, net income $693M (public filing). Founded by David Duffield and Aneel Bhusri after Oracle acquired PeopleSoft. Serves 10,000+ organizations including 50%+ of Fortune 500. Key structural decision: one-version cloud model (single codebase, no upgrade cycles). 9.8% global HCM market share.",
      },
      {
        id: C.gusto,
        name: "Gusto (formerly ZenPayroll)",
        founded: 2012,
        country: "USA",
        status: "operating",
        stage: "unicorn",
        fundingHistory: "Seed $6.1M 2012 (YC batch). Series A through E 2013-2022. Total: ~$746M across 9 rounds. Tender offer June 2025 at $9.3B valuation.",
        revenueSignal: ">100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Sacra estimates $975M revenue 2025 (up 30% YoY from $750M 2024). 500,000+ businesses (direct). 401k services grew 50% YoY 2024; Gusto Money grew 140% YoY 2024. US-only — geographic constraint creates documented international demand gap. Accountant referral channel is primary GTM.",
      },
      {
        id: C.zenefits,
        name: "Zenefits (acquired by TriNet)",
        founded: 2013,
        country: "USA",
        status: "acquired",
        stage: "series_c",
        fundingHistory: "$598M total across 4 rounds. Series A led by a16z (largest a16z investment at the time). Series C $500M at $4.5B valuation (Fidelity, TPG lead). 2015 peak.",
        revenueSignal: "<10M",
        profitabilitySignal: "known_unprofitable",
        evidenceWeight: "disconfirming",
        signalConfidence: "high",
        notableFacts: "DISCONFIRMING CASE. Founded by Parker Conrad and Laks Srini. Grew to 10,000+ businesses in 2 years. Fatal failure: selling insurance without licences in multiple states — discovered at scale in 2016. Parker Conrad resigned. Mass layoffs. $598M raised, $4.5B peak valuation, complete value destruction. Parker Conrad then founded Rippling as the corrected implementation. Acquired by TriNet ~2023. Most thoroughly post-mortemed failure in SMB HR SaaS.",
      },
      {
        id: C.rippling,
        name: "Rippling People Center, Inc.",
        founded: 2016,
        country: "USA",
        status: "operating",
        stage: "unicorn",
        fundingHistory: "Seed $7M 2016 (Initialized Capital + YC). Series B $145M 2020 ($1.35B valuation). Series E $500M 2023 ($11.3B). Series G $450M May 2025 ($16.8B). Total: ~$1.85B across 10 rounds.",
        revenueSignal: ">100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Sacra estimates $570M ARR February 2025. 20,000+ customers. 99.5% annual client retention. NRR approaching 200%. 10+ product lines each >$1M ARR, reaching that milestone within 5-6 months of launch. Founded by Parker Conrad (ex-Zenefits CEO) as the corrected version — compound platform thesis. Employee Graph is the core primitive. Anticipated IPO 2026.",
      },
      {
        id: C.justworks,
        name: "Justworks, Inc.",
        founded: 2012,
        country: "USA",
        status: "operating",
        stage: "series_e",
        fundingHistory: "$148M total across 7 rounds. Index Ventures, FirstMark, Redpoint. Series E $50M 2020. Formerly Clockwork Solutions.",
        revenueSignal: ">100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Latka estimates $350M revenue 2024 (up from $140M 2022). 12,000 customers. 1,500 employees. $1.4B valuation 2025. PEO (Professional Employer Organization) model — co-employment within the US. Gives SMBs access to Fortune 500-level benefits rates via co-employer aggregation.",
      },
      {
        id: C.bamboohr,
        name: "BambooHR",
        founded: 2008,
        country: "USA",
        status: "operating",
        stage: "bootstrapped",
        fundingHistory: "Minimal. Single round from Norwest Venture Partners. Primarily bootstrapped. No external VC dependency.",
        revenueSignal: ">100M",
        profitabilitySignal: "estimated_profitable_proxy",
        profitabilityProxyApplied: true,
        evidenceWeight: "strong_validator",
        signalConfidence: "low",
        notableFacts: "Growjo estimates ~$358M revenue 2024. 34,000+ organizations, ~2M employees, 100 countries. Bootstrapped 15+ years — proxy rule applied: no external funding + 15 years operating = Estimated profitable. Differentiated by starting with HRIS and adding payroll later (vs. payroll-first competitors). Customers include SoundCloud, Foursquare, Reddit.",
      },
      {
        id: C.papaya,
        name: "Papaya Global",
        founded: 2016,
        country: "Israel",
        status: "operating",
        stage: "series_d",
        fundingHistory: "$446M total. Series B $40M 2020 (Scale VP lead, Workday Ventures participated). Series D $250M 2021 ($3.7B valuation — peak). Bessemer, Insight Partners investors.",
        revenueSignal: ">100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Latka estimates $145M revenue 2024 (up from $100M 2023). Founded by Eynat Guez, Ruben Drong, Ofer Herman in Tel Aviv. Partner model (vs. entity-ownership): uses local providers rather than owning entities per country. Faster geographic expansion but lower margin control and weaker moat than Deel/Remote. Valuation compressed from $3.7B 2021 peak. Workday Ventures participation = strategic validation signal.",
      },
      {
        id: C.deel,
        name: "Deel (formerly Lifeslice)",
        founded: 2019,
        country: "USA",
        status: "operating",
        stage: "unicorn",
        fundingHistory: "YC 2019. Total $980M+ across 7 rounds. Series E $300M October 2025 (Ribbit Capital, Coatue, a16z) at $17.3B valuation.",
        revenueSignal: ">100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Category leader in global payroll/EOR as of 2025. Entity-ownership model: owns legal entities in each country. Founded by Alex Bouaziz, Shuo Wang, Ofer Simon. Only company to follow customers from contractors to EOR to global payroll to full HR suite while competitors remained point solutions. Key acquisitions: Playgroup (HCM), Capbase (equity management), Safeguard Global enterprise payroll division 2025. Launched US payroll 2024, entering Gusto's core market.",
      },
      {
        id: C.remote,
        name: "Remote Technology, Inc.",
        founded: 2019,
        country: "Estonia",
        status: "operating",
        stage: "series_c",
        fundingHistory: "$496M total. Series C $300M (SoftBank Vision Fund 2 lead). Accel, Sequoia, Index Ventures, Two Sigma, General Catalyst.",
        revenueSignal: "10-100M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "$3B+ valuation. Entity-ownership model (same structural choice as Deel). Founded as a fully distributed company with no single HQ. Notable enterprise customers: GitLab, DoorDash. Deliberate decision to build own legal entities rather than partner — takes longer, creates stronger moat. Competing with Deel for entity-ownership model leadership.",
      },
      {
        id: C.oyster,
        name: "Oyster HR",
        founded: 2020,
        country: "USA",
        status: "operating",
        stage: "series_b",
        fundingHistory: "$224M total raised across multiple rounds 2020-2022.",
        revenueSignal: "<10M",
        profitabilitySignal: "unknown",
        evidenceWeight: "weak_validator",
        signalConfidence: "low",
        notableFacts: "Global HR + payroll + employment in 120+ currencies. Added recruitment and benefits services (broader than most EOR competitors). Targets larger multinational companies. Founded at the same time as COVID-driven remote work acceleration. Competing in an increasingly Deel-dominated market.",
      },
    ]).onConflictDoNothing();

    // ── 5. COMPANY TIMELINE ──────────────────────────────────────────────────
    console.log("Inserting timelines...");
    await tx.insert(companyTimeline).values([

      // ADP
      { companyId: C.adp, year: 1949, eventType: "founding",
        implementationPatternId: IP.bureau, problemId: P.wageCompliance,
        description: "Founded as Automatic Payrolls, Inc. by Henry Taub. Manual payroll processing for local NJ businesses. Initial capital: $6,000. First client: one company.",
        source: "FundingUniverse company history" },
      { companyId: C.adp, year: 1957, eventType: "product_launch",
        implementationPatternId: IP.bureau,
        description: "Renamed to Automatic Data Processing. Adopted punch-card machines and mainframe computers. Revenue grown to $150,000 by fiscal year end.",
        source: "TrendSpider / company history" },
      { companyId: C.adp, year: 1961, eventType: "funding",
        implementationPatternId: IP.bureau,
        description: "IPO at $3/share. ~200 payroll clients at listing. $419k revenue, $25k net profit. Grew from operational scale, not capital.",
        source: "FundingUniverse company history" },
      { companyId: C.adp, year: 1990, eventType: "market_entry",
        implementationPatternId: IP.bureau, problemId: P.crossBorderEmploy,
        description: "Launched Employer Services International division. Began global expansion. Now operates in 140+ countries.",
        capabilityDeployed: "Payroll compliance expertise and regulatory relationships built across 40+ years of US operations — transferred to international compliance.",
        source: "TrendSpider / companieshistory.com" },

      // Paychex
      { companyId: C.paychex, year: 1971, eventType: "founding",
        implementationPatternId: IP.bureau, problemId: P.wageCompliance,
        description: "Founded by Tom Golisano with $3,000 in Rochester, NY. Targeted SMBs — the segment ADP underserved at the time.",
        source: "Wikipedia" },
      { companyId: C.paychex, year: 1983, eventType: "funding",
        implementationPatternId: IP.bureau,
        description: "IPO (Nasdaq: PAYX). Previously consolidated 18 franchises and partnerships into one private company in 1979.",
        source: "Wikipedia" },
      { companyId: C.paychex, year: 2000, eventType: "product_launch",
        implementationPatternId: IP.bureau, problemId: P.employeeBenefits,
        description: "Expanded to benefits administration, HR administration, and time & attendance. Followed the standard payroll-first expansion trajectory into adjacent HR problems.",
        capabilityDeployed: "Existing employer relationships and payroll processing infrastructure — enabled upsell of adjacent services to existing clients.",
        source: "Wikipedia / Paychex product history" },

      // Paycom
      { companyId: C.paycom, year: 1998, eventType: "founding",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Founded by Chad Richison in Oklahoma City as one of the first fully online payroll providers. No external funding — built from revenue.",
        source: "Wikipedia" },
      { companyId: C.paycom, year: 2001, eventType: "product_launch",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Expanded to include HR management modules. Early expansion along the standard payroll to HR trajectory.",
        capabilityDeployed: "Existing employer database and self-serve web infrastructure.",
        source: "Wikipedia" },
      { companyId: C.paycom, year: 2014, eventType: "funding",
        implementationPatternId: IP.smbSaaS,
        description: "IPO on NYSE (PAYC). Self-funded to IPO — no venture capital. Founder retained majority control. Demonstrates payroll SaaS economics without VC dependency.",
        source: "Wikipedia / SEC filing" },

      // Paylocity
      { companyId: C.paylocity, year: 1997, eventType: "founding",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Founded as Ameripay Payroll, Ltd. by Steve Sarowitz in Illinois. Online payroll for SMB-mid market (50-1,000 employees).",
        source: "Wikipedia" },
      { companyId: C.paylocity, year: 2014, eventType: "funding",
        implementationPatternId: IP.smbSaaS,
        description: "IPO (Nasdaq: PCTY). Founder held 44% at IPO. Self-funded to public markets.",
        source: "Wikipedia" },
      { companyId: C.paylocity, year: 2021, eventType: "acquisition",
        implementationPatternId: IP.smbSaaS, problemId: P.crossBorderEmploy,
        description: "Acquired Blue Marble Payroll — international payroll services. First move toward cross-border employment capability.",
        capabilityDeployed: "Existing SMB payroll infrastructure and customer relationships.",
        capabilityAcquired: "International payroll processing and local compliance relationships via Blue Marble.",
        source: "Wikipedia" },

      // Workday
      { companyId: C.workday, year: 2005, eventType: "founding",
        implementationPatternId: IP.enterpriseHcm, problemId: P.wageCompliance,
        description: "Founded by David Duffield and Aneel Bhusri after Oracle acquired PeopleSoft. Thesis: rebuild enterprise HR and finance on cloud with single-version delivery model.",
        source: "companieshistory.com" },
      { companyId: C.workday, year: 2012, eventType: "funding",
        implementationPatternId: IP.enterpriseHcm,
        description: "IPO (Nasdaq: WDAY) at ~$9.5B valuation. Greylock Partners was initial investor.",
        source: "companieshistory.com / Forbes" },
      { companyId: C.workday, year: 2018, eventType: "acquisition",
        problemId: P.wageCompliance,
        description: "Acquired Adaptive Insights for $1.55B — added enterprise financial planning and analytics. First major move into finance beyond HR.",
        capabilityDeployed: "Enterprise customer relationships and unified workforce data model — enabled natural extension into financial planning.",
        capabilityAcquired: "Enterprise performance management and financial planning (EPM) technology via Adaptive Insights.",
        source: "companieshistory.com" },
      { companyId: C.workday, year: 2025, eventType: "product_launch",
        implementationPatternId: IP.enterpriseHcm,
        description: "AI platform repositioning: rebranded as AI platform for managing people, money, and agents. 8.5% workforce reduction to fund AI investment. Acquired Paradox (conversational AI recruiting).",
        source: "companieshistory.com / SEC filings" },

      // Gusto
      { companyId: C.gusto, year: 2012, eventType: "founding",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Founded as ZenPayroll by Joshua Reeves, Tomer London, Edward Kim. YC batch 2012. Initial product: payroll for SMBs. First funding: $6.1M Seed.",
        source: "Sacra / Built In" },
      { companyId: C.gusto, year: 2014, eventType: "product_launch",
        implementationPatternId: IP.smbSaaS, problemId: P.employeeBenefits,
        description: "Renamed Gusto. Added health insurance benefits administration — first move beyond payroll. Standard payroll to benefits trajectory.",
        capabilityDeployed: "Existing employer database and payroll compliance infrastructure.",
        source: "Sacra / marketcurve.substack.com" },
      { companyId: C.gusto, year: 2020, eventType: "product_launch",
        problemId: P.wageCompliance,
        description: "Launched Gusto Cash Accounts — employee financial wellness product. First move into financial services for employees (not employers).",
        capabilityDeployed: "Direct banking relationship with 300k+ employees via payroll direct deposit.",
        source: "marketcurve.substack.com" },
      { companyId: C.gusto, year: 2021, eventType: "acquisition",
        problemId: P.crossBorderEmploy,
        description: "Acquired RemoteTeam (international contractor management). Added international contractor payments. Launched Gusto Embedded Payroll API — enables third-party apps to embed Gusto's payroll engine.",
        capabilityDeployed: "Payroll compliance engine and employer relationships.",
        capabilityAcquired: "International contractor management capability and API-first architecture.",
        source: "marketcurve.substack.com" },

      // Zenefits
      { companyId: C.zenefits, year: 2013, eventType: "founding",
        implementationPatternId: IP.complianceFree, problemId: P.wageCompliance,
        description: "Founded by Parker Conrad and Laks Srini. Free HR software funded by insurance broker commissions. Immediate hypergrowth — model attracted employers who paid nothing for software.",
        source: "Contrary Research / Fox News" },
      { companyId: C.zenefits, year: 2015, eventType: "funding",
        implementationPatternId: IP.complianceFree,
        description: "Series C $500M at $4.5B valuation (Fidelity, TPG lead). 10,000+ businesses across 48 states. 1,000 employees. a16z's largest investment at the time.",
        source: "Fox News / Entrepreneur" },
      { companyId: C.zenefits, year: 2016, eventType: "pivot",
        implementationPatternId: IP.complianceFree,
        description: "FAILURE EVENT. Regulatory investigation revealed Zenefits was selling insurance without broker licences in multiple states. Parker Conrad resigned. Mass layoffs. Demonstrates structural failure of IP-004: broker revenue requires state-by-state licences that cannot scale at venture speed.",
        source: "Contrary Research / Tracxn" },
      { companyId: C.zenefits, year: 2023, eventType: "acquisition",
        implementationPatternId: IP.complianceFree,
        description: "Acquired by TriNet. End of independent operation. $598M raised, $4.5B peak valuation — complete value destruction.",
        source: "Tracxn" },

      // Rippling
      { companyId: C.rippling, year: 2016, eventType: "founding",
        implementationPatternId: IP.compoundPlatform, problemId: P.wageCompliance,
        description: "Founded by Parker Conrad (ex-Zenefits CEO) and Prasanna Sankar. Thesis: unified employee record (Employee Graph) enabling one-click hire that simultaneously triggers payroll, benefits, device provisioning, and app access. Seed $7M.",
        source: "Sacra / businessmodelcanvastemplate.com" },
      { companyId: C.rippling, year: 2020, eventType: "product_launch",
        implementationPatternId: IP.compoundPlatform, problemId: P.itProvisioning,
        description: "Series B $145M ($1.35B valuation). Expanded into corporate spend management and IT management. First major step beyond HR into the compound platform thesis.",
        capabilityDeployed: "Employee Graph — unified employee record already contained app permissions and device data, making IT module launch at near-zero marginal cost.",
        source: "businessmodelcanvastemplate.com / Sacra" },
      { companyId: C.rippling, year: 2022, eventType: "market_entry",
        implementationPatternId: IP.globalEor, problemId: P.crossBorderEmploy,
        description: "Launched global payroll (October 2022). COO described it as biggest launch of his career. First direct competition with Deel and Remote.",
        capabilityDeployed: "Employee Graph with existing compliance and HR infrastructure — made international payroll a configuration rather than a rebuild.",
        source: "Contrary Research" },
      { companyId: C.rippling, year: 2025, eventType: "funding",
        implementationPatternId: IP.compoundPlatform,
        description: "Series G $450M at $16.8B valuation. 25,000+ customers. $570M ARR. 10+ product lines each >$1M ARR. Super Bowl ad. Anticipated IPO 2026.",
        source: "Sacra / Rainmaker Securities" },

      // Justworks
      { companyId: C.justworks, year: 2012, eventType: "founding",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Founded as Clockwork Solutions by Isaac Oates and Iris Ramos. Pivoted to PEO (Professional Employer Organization) model — co-employment for US SMBs.",
        source: "Tracxn" },
      { companyId: C.justworks, year: 2020, eventType: "funding",
        implementationPatternId: IP.smbSaaS,
        description: "Series E $50M. 12,000+ customers. $1.4B valuation 2025. Raised total $148M — capital-efficient relative to Gusto ($746M) serving similar customer base.",
        source: "Latka / Tracxn" },

      // BambooHR
      { companyId: C.bamboohr, year: 2008, eventType: "founding",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Founded in Utah. Initial product: cloud HRIS for SMBs — employee data management before payroll. Differentiated from Gusto/Paycom by starting with HRIS and adding payroll later.",
        source: "Software Report / BambooHR site" },
      { companyId: C.bamboohr, year: 2015, eventType: "product_launch",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Added US payroll processing. 25,000+ organizations, 2M+ employees across 100 countries. Demonstrates HRIS-first then payroll as viable alternative to payroll-first.",
        capabilityDeployed: "Existing employee data model and employer relationships — payroll added as natural extension of existing HR record.",
        source: "Software Report" },

      // Papaya Global
      { companyId: C.papaya, year: 2016, eventType: "founding",
        implementationPatternId: IP.globalEor, problemId: P.crossBorderEmploy,
        description: "Founded in Tel Aviv by Eynat Guez, Ruben Drong, Ofer Herman. Cloud-based global payroll via partner model (local providers rather than own entities).",
        source: "TechCrunch / BusinessWire" },
      { companyId: C.papaya, year: 2020, eventType: "funding",
        implementationPatternId: IP.globalEor,
        description: "Series B $40M (Scale VP lead). Workday Ventures participated — strategic signal of enterprise validation. 300% YoY revenue growth at this point.",
        source: "TechCrunch" },
      { companyId: C.papaya, year: 2021, eventType: "product_launch",
        implementationPatternId: IP.globalEor,
        description: "Series D $250M at $3.7B valuation. Launched Total Payroll — all global payroll through single panel including equity and benefits. Forbes Cloud 100 inclusion.",
        source: "BusinessWire" },

      // Deel
      { companyId: C.deel, year: 2019, eventType: "founding",
        implementationPatternId: IP.globalEor, problemId: P.crossBorderEmploy,
        description: "Founded as Lifeslice by Alex Bouaziz, Shuo Wang, Ofer Simon. Accepted into YC 2019. Initial product: contractor payment for international workers only.",
        source: "Contrary Research" },
      { companyId: C.deel, year: 2021, eventType: "product_launch",
        implementationPatternId: IP.globalEor,
        description: "Expanded from contractor payments to EOR to global payroll as early YC company customers grew. COVID-driven remote work demand. Became category leader. Entity-ownership model: owns legal entities in each country.",
        capabilityDeployed: "Early entity-ownership infrastructure and contractor payment rails — enabled natural expansion to EOR and then payroll for the same customers.",
        source: "Sacra / Contrary Research" },
      { companyId: C.deel, year: 2024, eventType: "market_entry",
        implementationPatternId: IP.smbSaaS, problemId: P.wageCompliance,
        description: "Launched US payroll — first in-house US payroll engine. Direct competition with Gusto and Rippling in domestic market. Expansion from global-first to domestic.",
        capabilityDeployed: "Global payroll compliance engine and employer-of-record infrastructure — US payroll is simpler than multi-country, making it a tractable expansion.",
        source: "Contrary Research" },
      { companyId: C.deel, year: 2025, eventType: "acquisition",
        implementationPatternId: IP.globalEor,
        description: "Acquired Safeguard Global's enterprise payroll division (effective March 2025). Series E $300M at $17.3B valuation (Ribbit Capital, Coatue, a16z).",
        capabilityAcquired: "Enterprise payroll customer relationships and contracts via Safeguard Global division.",
        source: "Sacra / employborderless.com" },

      // Remote
      { companyId: C.remote, year: 2019, eventType: "founding",
        implementationPatternId: IP.globalEor, problemId: P.crossBorderEmploy,
        description: "Founded in Estonia as a fully distributed company. Initial product: international payroll, benefits, compliance for employees and contractors. Entity-ownership model from day one.",
        source: "Contrary Research" },
      { companyId: C.remote, year: 2020, eventType: "product_launch",
        implementationPatternId: IP.globalEor,
        description: "Built own legal entities in each country rather than partnering with local providers like Papaya. Deliberate structural choice: slower but creates proprietary moat.",
        capabilityAcquired: "Per-country legal entity ownership and local compliance expertise — the primary moat of the entity-ownership model.",
        source: "Contrary Research" },
      { companyId: C.remote, year: 2021, eventType: "funding",
        implementationPatternId: IP.globalEor,
        description: "Series C $300M (SoftBank Vision Fund 2 lead). $3B+ valuation. Enterprise customers include GitLab and DoorDash.",
        source: "Contrary Research" },

      // Oyster
      { companyId: C.oyster, year: 2020, eventType: "founding",
        implementationPatternId: IP.globalEor, problemId: P.crossBorderEmploy,
        description: "Founded to serve global employment in 120+ currencies. Added recruitment and benefits on top of standard EOR. Targets larger multinational companies. Founded at exact moment of COVID-driven remote work acceleration.",
        source: "Contrary Research" },
      { companyId: C.oyster, year: 2022, eventType: "funding",
        implementationPatternId: IP.globalEor,
        description: "Raised $224M total across multiple rounds 2020-2022.",
        source: "Contrary Research" },

    ]).onConflictDoNothing();

    // ── 6. COMPANY ↔ IMPLEMENTATION PATTERN ─────────────────────────────────
    console.log("Inserting company-pattern relationships...");
    await tx.insert(companyImplementationPatterns).values([
      { companyId: C.adp,       implementationPatternId: IP.bureau,           source: "Wikipedia / companieshistory.com" },
      { companyId: C.paychex,   implementationPatternId: IP.bureau,           source: "Wikipedia" },
      { companyId: C.paycom,    implementationPatternId: IP.smbSaaS,          source: "Wikipedia" },
      { companyId: C.paylocity, implementationPatternId: IP.smbSaaS,          source: "Wikipedia" },
      { companyId: C.workday,   implementationPatternId: IP.enterpriseHcm,    source: "companieshistory.com / SEC filings" },
      { companyId: C.gusto,     implementationPatternId: IP.smbSaaS,          source: "Sacra / Built In" },
      { companyId: C.zenefits,  implementationPatternId: IP.complianceFree,   source: "Contrary Research",
        confidence: "high", notes: "DISCONFIRMING. Zenefits is the only known instantiation of IP-004. Pattern recorded as dead." },
      { companyId: C.rippling,  implementationPatternId: IP.compoundPlatform, source: "Sacra / Rainmaker Securities" },
      { companyId: C.justworks, implementationPatternId: IP.smbSaaS,          source: "Latka / Tracxn",
        notes: "PEO variant — co-employment model, not standard subscription." },
      { companyId: C.bamboohr,  implementationPatternId: IP.smbSaaS,          source: "Software Report" },
      { companyId: C.papaya,    implementationPatternId: IP.globalEor,        source: "TechCrunch / BusinessWire",
        notes: "Partner model (not entity-ownership). Distinct sub-approach within IP-006." },
      { companyId: C.deel,      implementationPatternId: IP.globalEor,        source: "Sacra / Contrary Research" },
      { companyId: C.remote,    implementationPatternId: IP.globalEor,        source: "Contrary Research" },
      { companyId: C.oyster,    implementationPatternId: IP.globalEor,        source: "Contrary Research" },
    ]).onConflictDoNothing();

    // ── 7. COMPANY ↔ PROBLEM ─────────────────────────────────────────────────
    console.log("Inserting company-problem relationships...");
    await tx.insert(companyProblems).values([
      { companyId: C.adp,       problemId: P.wageCompliance },
      { companyId: C.adp,       problemId: P.crossBorderEmploy },
      { companyId: C.paychex,   problemId: P.wageCompliance },
      { companyId: C.paychex,   problemId: P.employeeBenefits },
      { companyId: C.paycom,    problemId: P.wageCompliance },
      { companyId: C.paylocity, problemId: P.wageCompliance },
      { companyId: C.paylocity, problemId: P.crossBorderEmploy,
        confidence: "medium", notes: "Blue Marble acquisition 2021 — partial coverage." },
      { companyId: C.workday,   problemId: P.wageCompliance },
      { companyId: C.gusto,     problemId: P.wageCompliance },
      { companyId: C.gusto,     problemId: P.employeeBenefits },
      { companyId: C.gusto,     problemId: P.crossBorderEmploy,
        confidence: "medium", notes: "RemoteTeam acquisition 2021 — contractor-only, not full EOR." },
      { companyId: C.zenefits,  problemId: P.wageCompliance },
      { companyId: C.zenefits,  problemId: P.employeeBenefits },
      { companyId: C.rippling,  problemId: P.wageCompliance },
      { companyId: C.rippling,  problemId: P.employeeBenefits },
      { companyId: C.rippling,  problemId: P.itProvisioning },
      { companyId: C.rippling,  problemId: P.crossBorderEmploy },
      { companyId: C.justworks, problemId: P.wageCompliance },
      { companyId: C.justworks, problemId: P.employeeBenefits },
      { companyId: C.bamboohr,  problemId: P.wageCompliance },
      { companyId: C.papaya,    problemId: P.crossBorderEmploy },
      { companyId: C.deel,      problemId: P.crossBorderEmploy },
      { companyId: C.deel,      problemId: P.wageCompliance,
        confidence: "medium", notes: "US payroll launched 2024." },
      { companyId: C.remote,    problemId: P.crossBorderEmploy },
      { companyId: C.oyster,    problemId: P.crossBorderEmploy },
    ]).onConflictDoNothing();

    // ── 8. SOLUTION PATTERN ↔ PROBLEM ────────────────────────────────────────
    console.log("Inserting pattern-problem relationships...");
    await tx.insert(solutionPatternProblems).values([
      { solutionPatternId: SP.payrollInfra,      problemId: P.wageCompliance },
      { solutionPatternId: SP.payrollInfra,      problemId: P.employeeBenefits,
        confidence: "medium", notes: "Secondary — benefits is a common adjacency, not the primary problem." },
      { solutionPatternId: SP.cloudHcm,          problemId: P.wageCompliance },
      { solutionPatternId: SP.globalEmployment,  problemId: P.crossBorderEmploy },
      { solutionPatternId: SP.compoundWorkforce, problemId: P.wageCompliance },
      { solutionPatternId: SP.compoundWorkforce, problemId: P.itProvisioning },
      { solutionPatternId: SP.compoundWorkforce, problemId: P.crossBorderEmploy },
    ]).onConflictDoNothing();

    // ── 9. BOUNDARY CASE CATALOG ─────────────────────────────────────────────
    console.log("Inserting boundary cases...");
    await tx.insert(boundaryCases).values([
      {
        companyName: "Rippling",
        optionA: "IP-002 (cloud-native SMB payroll SaaS)",
        optionB: "IP-005 (compound HR+IT+Finance platform)",
        chosen: "IP-005 (compound HR+IT+Finance platform)",
        reason: "Rippling's core value proposition is the unified Employee Graph enabling cross-functional automation — payroll is the wedge, not the thesis. Gusto is the canonical IP-002 instantiation.",
      },
      {
        companyName: "Zenefits",
        optionA: "IP-002 (cloud-native SMB payroll SaaS)",
        optionB: "IP-004 (compliance-led free HR SaaS, broker revenue)",
        chosen: "IP-004 (compliance-led free HR SaaS, broker revenue)",
        reason: "Zenefits's mechanism was insurance broker commissions funding free software — structurally distinct from standard PEPM SaaS subscription. The revenue model difference is the analytically important fact.",
      },
      {
        companyName: "Justworks",
        optionA: "IP-002 (cloud-native SMB payroll SaaS)",
        optionB: "IP-006 (global payroll / EOR platform)",
        chosen: "IP-002 (cloud-native SMB payroll SaaS, PEO variant)",
        reason: "Justworks's PEO model is co-employment within the US, not cross-border employment. Conceptually closer to domestic outsourcing than international EOR. Recorded as a variant note on the IP-002 relationship.",
      },
      {
        companyName: "Deel (US payroll launch 2024)",
        optionA: "Keep as IP-006 only",
        optionB: "Add IP-002 relationship for US payroll",
        chosen: "Keep as IP-006 only, with note on company record and timeline",
        reason: "US payroll is a new expansion move for Deel, not its primary instantiation. Adding IP-002 would imply equivalence with Gusto — Deel's US payroll is a secondary product, not its founding pattern.",
      },
      {
        companyName: "Papaya Global vs. Deel/Remote",
        optionA: "All three as IP-006 with no distinction",
        optionB: "Split into IP-006a (entity-ownership) and IP-006b (partner model)",
        chosen: "All three as IP-006, with sub-model recorded in notes",
        reason: "The partner vs. entity-ownership distinction is meaningful but not yet supported by enough evidence to justify a separate pattern record. If entity-ownership dominance is confirmed across 3+ more observations, split warranted in Phase 2.",
      },
    ]).onConflictDoNothing();

  });

  // ── 10. REFRESH EVIDENCE COUNTS ─────────────────────────────────────────────
  console.log("Refreshing evidence counts...");

  await db.execute(sql`
    UPDATE problems p
    SET evidence_count = (
      SELECT COUNT(DISTINCT cp.company_id)
      FROM company_problems cp WHERE cp.problem_id = p.id
    )
  `);

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

  console.log("");
  console.log("Seed complete.");
  console.log("  14 companies");
  console.log("   4 problems");
  console.log("   4 solution patterns");
  console.log("   6 implementation patterns (1 dead)");
  console.log("   5 boundary cases");
  console.log("");
  console.log("Next: npx drizzle-kit studio");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});