# Economic Pattern Database — Agent Context

Paste this into a new AI chat session for full working context.
Generated dynamically — includes live DB state.

---

## What this project is

A relational knowledge graph of recurring economic problems, the solution
patterns that address them, and the structural conditions under which those
patterns succeed or fail. Companies are empirical observations used to
construct patterns — not the primary subject of analysis.

Three layers, strictly separated:
- Layer 1: Observed facts about companies (founding, funding, revenue, timeline)
- Layer 2: Derived abstractions (Problems, Solution Patterns, Implementation
  Patterns, Mechanisms, Winning/Failure Conditions, Capabilities)
- Layer 3: Hypotheses about what might be built (Opportunities)

The philosophical core: if a company disappeared tomorrow, almost nothing in
the dataset should change. The problem persists, the mechanism persists, the
customers persist. Companies are evidence, not the object of study.

---

## Stack

- Database: PostgreSQL via Supabase
- ORM: Drizzle (schema.ts is single source of truth)
- Runtime: Node.js / TypeScript via tsx
- Loader: YAML → DB (idempotent, validates with Zod before touching DB)
- Framework: Next.js (UI not yet built — data entry via Supabase table editor)

---

## Key commands

```bash
# Load all YAML into database (idempotent — safe to re-run)
npm run load

# Validate YAML without touching database
npm run validate

# Project status (companies, patterns, queue, opportunities)
npm run status

# Full analytical query suite
npm run queries

# Regenerate this context file
npm run context

# Schema changes
npx drizzle-kit push    # push schema.ts changes to Supabase
npx drizzle-kit studio  # visual DB browser
```

IMPORTANT — before drizzle-kit push if views exist, run in Supabase SQL editor:
```sql
DROP VIEW IF EXISTS research_queue CASCADE;
DROP VIEW IF EXISTS gap_failure_case CASCADE;
DROP VIEW IF EXISTS gap_strong_validator CASCADE;
DROP VIEW IF EXISTS gap_pattern_promotion CASCADE;
DROP VIEW IF EXISTS gap_implementation_fill CASCADE;
DROP VIEW IF EXISTS gap_geographic_whitespace CASCADE;
```
Then push, then re-run src/db/raw-sql/triggers-and-views.sql in Supabase.

---

## How to add a company (daily workflow)

```bash
# 1. Copy the template
cp data/companies/hr-payroll/gusto.yaml data/companies/<domain>/<slug>.yaml

# 2. Edit — fill all MVR fields (see template for required fields)

# 3. Validate
npm run validate

# 4. Load
npm run load
```

---

## How to expand to a new domain

```bash
# 1. Create the domain directory
mkdir -p data/companies/<new-domain>

# 2. Add vocab entries as needed
# Edit data/_vocab/problems.yaml, solution-patterns.yaml,
# implementation-patterns.yaml, capabilities.yaml

# 3. Add 10 foundation companies (see docs/candidate-selection.md)
# Use research_queue_source: "OFF_QUEUE:foundation-record" for first 10

# 4. Load and check
npm run load
npm run status
```

Foundation record slot requirements:
- At least 1 strong validator (public financials preferred)
- At least 1 disconfirming case (documented failure)
- At least 2 geographies
- At least 2 distinct implementation patterns
- Do not fill all 10 slots with the most prominent companies in one pattern

---

## How to add a Layer 3 opportunity

```bash
cp data/opportunities/_template.yaml data/opportunities/<slug>.yaml
# Edit, then:
npm run load
```

The loader computes well_formed automatically. A record missing lens,
winning/failure condition pair, predictions (>=1), or open questions (>=1)
is stored as draft and flagged with specific reasons.

---

## Research queue scoring

The research queue (visible in npm run status) tells you which company type
to find next. Scoring weights:
- FAILURE_CASE_NEEDED:           25  (3+ strong validators, 0 disconfirming)
- STRONG_VALIDATOR_NEEDED:       20  (2+ companies, 0 known-profitable)
- PATTERN_PROMOTION:             15x (winning condition needs cross-industry confirmation)
- GEOGRAPHIC_WHITESPACE:         12  (strong validator in A, nothing in B)
- IMPLEMENTATION_FILL:           10x (fewer than 3 companies in pattern)

Set research_queue_source on every company file to the queue item it satisfies.

---

## Interpretation philosophy

Three kinds of uncertainty, three different responses:
1. Observational (Layer 1): fact genuinely unknown → store raw source + bucket + reasoning
2. Interpretive (Layer 2): experts may disagree → make reasoning visible in notable_facts
3. Predictive (Layer 3): nobody knows → make claim falsifiable, record predictions

The Boundary Case Catalog (data/_vocab/boundary-cases.yaml) is the primary
calibration reference. Search it before creating any new pattern.
Full doc: docs/interpretation-across-layers.md

---

## Current project status

```

══════════════════════════════════════════════════
  Economic Pattern Database — Status
══════════════════════════════════════════════════

  Companies:               79
  Timeline entries:        282
  Implementation patterns: 18
  Solution patterns:       7
  Problems:                10
  Capabilities:            9
  Opportunities:           1
  
── Companies by solution pattern ────────────────
  Payment processing infrastructure        ████████████████████ 24 (✓9 ·1✗)
  Cross-border payment network             ███████████████████░ 23 (✓10 ·2✗)
  Payroll processing infrastructure        █████████████████░░░ 20 (✓6 ·3✗)
  Cloud HCM platform                       ████░░░░░░░░░░░░░░░░ 5 (✓3 ·1✗)
  Global employment infrastructure         ███░░░░░░░░░░░░░░░░░ 4 (✓0 ·0✗)
  Embedded banking infrastructure          ███░░░░░░░░░░░░░░░░░ 3 (✓0 ·2✗)
  Compound workforce management platform   █░░░░░░░░░░░░░░░░░░░ 1 (✓0 ·0✗)

── Implementation patterns ──────────────────────
  ████████████ 19  Established  Cross-border account-to-account infrastructure
  ███████████░ 17  Established  Cloud-native SMB payroll SaaS
  ████░░░░░░░░  6  Strong       Developer-first payment API
  ████░░░░░░░░  6  Strong       Full-stack payment processor
  ███░░░░░░░░░  5  Strong       Domestic payment infrastructure platform
  ███░░░░░░░░░  4  Emerging     Agent network remittance
  ███░░░░░░░░░  4  Emerging     Cloud enterprise HCM platform
  ███░░░░░░░░░  4  Emerging     Global payroll / Employer of Record platform
  ███░░░░░░░░░  4  Emerging     Local payment rail aggregation
  ██░░░░░░░░░░  3  Emerging     Accounts payable automation
  ██░░░░░░░░░░  3  Emerging     Payment orchestration and ledger layer
  █░░░░░░░░░░░  2  Emerging     Banking-as-a-Service middleware [dead]
  █░░░░░░░░░░░  2  Emerging     Manual payroll bureau
  █░░░░░░░░░░░  2  Emerging     Telco-owned mobile money network
  █░░░░░░░░░░░  1  Anecdotal    Compliance-led free HR SaaS (broker revenue model) [dead]
  █░░░░░░░░░░░  1  Anecdotal    Compound HR + IT + Finance platform
  █░░░░░░░░░░░  1  Anecdotal    Direct bank partnership for embedded finance
  █░░░░░░░░░░░  1  Anecdotal    On-premise enterprise HCM platform [dead]

── Research queue (top 10) ──────────────────────
  #1   [30] PATTERN_PROMOTION
       Pattern: Compound workforce management platform
       Find:    Find a company using the same structural approach as [Compound workforce management platform] in an unrepresented industry.

  #2   [30] PATTERN_PROMOTION
       Pattern: Embedded banking infrastructure
       Find:    Find a company using the same structural approach as [Embedded banking infrastructure] in an unrepresented industry.

  #3   [25] FAILURE_CASE_NEEDED
       Pattern: Cloud enterprise HCM platform
       Find:    Find a company that attempted [Cloud enterprise HCM platform] and failed. Search: Crunchbase shutdowns, TechCrunch graveyard, YC dark.

  #4   [25] FAILURE_CASE_NEEDED
       Pattern: Domestic payment infrastructure platform
       Find:    Find a company that attempted [Domestic payment infrastructure platform] and failed. Search: Crunchbase shutdowns, TechCrunch graveyard, YC dark.

  #5   [20] IMPLEMENTATION_FILL
       Pattern: Compound HR + IT + Finance platform
       Find:    Find any company using [Compound HR + IT + Finance platform]. Prioritise strong validators.

  #6   [20] IMPLEMENTATION_FILL
       Pattern: Direct bank partnership for embedded finance
       Find:    Find any company using [Direct bank partnership for embedded finance]. Prioritise strong validators.

  #7   [20] STRONG_VALIDATOR_NEEDED
       Pattern: Global payroll / Employer of Record platform
       Find:    Find a self-funded (5+ yrs) or public company using [Global payroll / Employer of Record platform]. Search: Indie Hackers, public 10-K filings.

  #8   [12] GEOGRAPHIC_WHITESPACE
       Pattern: Accounts payable automation
       Find:    Find a company in [Nigeria] using [Accounts payable automation].

  #8   [12] GEOGRAPHIC_WHITESPACE
       Pattern: Accounts payable automation
       Find:    Find a company in [Philippines] using [Accounts payable automation].

  #8   [12] GEOGRAPHIC_WHITESPACE
       Pattern: Accounts payable automation
       Find:    Find a company in [Senegal] using [Accounts payable automation].

── Open opportunities ───────────────────────────
  [open] Standalone IT lifecycle platform for mid-market companies (derived · ✓ · 2 predictions)
          Problem: Businesses cannot provision or deprovision employee access to software, hardware, and corporate systems as a single coordinated action.

── Recent boundary cases (last 5) ───────────────
  Interswitch Group: chose "both — domestic-payment-infrastructure primary, full-stack-payment-processor medium confidence secondary" — Interswitch's primary business is operating Nigerian switching infrastructure for all banks (domestic-payment-infrastructure). It also owns and processes the Verve card scheme directly (full-stack-payment-processor). Both are genuine instantiations. Medium confidence on the secondary pattern signals its supporting role. Cross-border payment results showing Interswitch are expected from the secondary linkage — not a data error, a classification nuance to track.
  Rippling: chose "IP-005 (compound HR+IT+Finance platform)" — Rippling's core value proposition is the unified Employee Graph enabling cross-functional automation — payroll is the wedge, not the thesis. Gusto is the canonical IP-002 instantiation.
  Zenefits: chose "IP-004 (compliance-led free HR SaaS, broker revenue)" — Zenefits's mechanism was insurance broker commissions funding free software — structurally distinct from standard PEPM SaaS subscription. The revenue model difference is the analytically important fact.
  Justworks: chose "IP-002 (cloud-native SMB payroll SaaS, PEO variant)" — Justworks's PEO model is co-employment within the US, not cross-border employment. Conceptually closer to domestic outsourcing than international EOR. Recorded as a variant note on the IP-002 relationship.
  Deel (US payroll launch 2024): chose "Keep as IP-006 only, with note on company record and timeline" — US payroll is a new expansion move for Deel, not its primary instantiation. Adding IP-002 would imply equivalence with Gusto — Deel's US payroll is a secondary product, not its founding pattern.

══════════════════════════════════════════════════

```

---

## File structure

```
.
./.env.local
./.git
./.gitignore
./.next
./README.md
./components.json
./context.md
./data
./data/_vocab
./data/_vocab/_append-capabilities.yaml
./data/_vocab/_append-impl-direct-bank-partnership.yaml
./data/_vocab/_append-implementation-patterns.yaml
./data/_vocab/_append-problems.yaml
./data/_vocab/_append-solution-patterns.yaml
./data/_vocab/_template-reference.yaml
./data/_vocab/boundary-cases.yaml
./data/_vocab/capabilities.yaml
./data/_vocab/implementation-patterns.yaml
./data/_vocab/problems.yaml
./data/_vocab/sectors.yaml
./data/_vocab/solution-patterns.yaml
./data/companies
./data/companies/_template.yaml
./data/companies/b2b-payments
./data/companies/b2b-payments/adyen.yaml
./data/companies/b2b-payments/airwallex.yaml
./data/companies/b2b-payments/bill.yaml
./data/companies/b2b-payments/checkout-com.yaml
./data/companies/b2b-payments/corpay.yaml
./data/companies/b2b-payments/dlocal.yaml
./data/companies/b2b-payments/fawry.yaml
./data/companies/b2b-payments/flutterwave.yaml
./data/companies/b2b-payments/global-payments.yaml
./data/companies/b2b-payments/interswitch.yaml
./data/companies/b2b-payments/modern-treasury.yaml
./data/companies/b2b-payments/mollie.yaml
./data/companies/b2b-payments/moniepoint.yaml
./data/companies/b2b-payments/nium.yaml
./data/companies/b2b-payments/ofx.yaml
./data/companies/b2b-payments/payoneer.yaml
./data/companies/b2b-payments/paystack.yaml
./data/companies/b2b-payments/primer.yaml
./data/companies/b2b-payments/railsr.yaml
./data/companies/b2b-payments/rapyd.yaml
./data/companies/b2b-payments/razorpay.yaml
./data/companies/b2b-payments/spreedly.yaml
./data/companies/b2b-payments/stripe.yaml
./data/companies/b2b-payments/synapse-financial.yaml
./data/companies/b2b-payments/thunes.yaml
./data/companies/b2b-payments/tipalti.yaml
./data/companies/b2b-payments/unit.yaml
./data/companies/b2b-payments/verto.yaml
./data/companies/b2b-payments/wirecard.yaml
./data/companies/b2b-payments/wise.yaml
./data/companies/b2b-payments/xendit.yaml
./data/companies/b2b-payments/yoco.yaml
./data/companies/c2c-payments
./data/companies/c2c-payments/azimo.yaml
./data/companies/c2c-payments/chipper-cash.yaml
./data/companies/c2c-payments/gcash.yaml
./data/companies/c2c-payments/grey.yaml
./data/companies/c2c-payments/lemfi.yaml
./data/companies/c2c-payments/moneygram.yaml
./data/companies/c2c-payments/mpesa.yaml
./data/companies/c2c-payments/mukuru.yaml
./data/companies/c2c-payments/nala.yaml
./data/companies/c2c-payments/paga.yaml
./data/companies/c2c-payments/paysend.yaml
./data/companies/c2c-payments/remitly.yaml
./data/companies/c2c-payments/ria.yaml
./data/companies/c2c-payments/wave.yaml
./data/companies/c2c-payments/western-union.yaml
./data/companies/c2c-payments/xoom.yaml
./data/companies/c2c-payments/zepz.yaml
./data/companies/hr-payroll
./data/companies/hr-payroll/adp.yaml
./data/companies/hr-payroll/bamboohr.yaml
./data/companies/hr-payroll/bayzat.yaml
./data/companies/hr-payroll/bento-africa.yaml
./data/companies/hr-payroll/charlie-hr.yaml
./data/companies/hr-payroll/darwinbox.yaml
./data/companies/hr-payroll/deel.yaml
./data/companies/hr-payroll/employment-hero.yaml
./data/companies/hr-payroll/gusto.yaml
./data/companies/hr-payroll/justworks.yaml
./data/companies/hr-payroll/namely.yaml
./data/companies/hr-payroll/oracle.yaml
./data/companies/hr-payroll/oyster-hr.yaml
./data/companies/hr-payroll/paidhr.yaml
./data/companies/hr-payroll/papaya-global.yaml
./data/companies/hr-payroll/paychex.yaml
./data/companies/hr-payroll/paycom.yaml
./data/companies/hr-payroll/payfit.yaml
./data/companies/hr-payroll/paylocity.yaml
./data/companies/hr-payroll/payspace.yaml
./data/companies/hr-payroll/peoplesoft.yaml
./data/companies/hr-payroll/personio.yaml
./data/companies/hr-payroll/remote.yaml
./data/companies/hr-payroll/rippling.yaml
./data/companies/hr-payroll/sap.yaml
./data/companies/hr-payroll/seamlesshr.yaml
./data/companies/hr-payroll/smarthr.yaml
./data/companies/hr-payroll/workday.yaml
./data/companies/hr-payroll/workpay.yaml
./data/companies/hr-payroll/zenefits.yaml
./data/opportunities
./data/opportunities/_template.yaml
./data/opportunities/it-provisioning-standalone.yaml
./docker-compose.metabase.yml
./docs
./docs/BRIEF.md
./docs/candidate-selection.md
./docs/interpretation-across-layers.md
./drizzle.config.ts
./loader
./loader/export.ts
./loader/index.ts
./loader/load.ts
./loader/validate.ts
./next-env.d.ts
./next.config.ts
./node_modules
./package-lock.json
./package.json
./postcss.config.mjs
./public
./public/file.svg
./public/globe.svg
./public/next.svg
./public/vercel.svg
./public/window.svg
./scripts
./scripts/context-dump.sh
./src
./src/app
./src/app/companies
./src/app/companies/new
./src/app/companies/new/CompanyForm.tsx
./src/app/companies/new/actions.ts
./src/app/companies/new/page.tsx
./src/app/companies/page.tsx
./src/app/favicon.ico
./src/app/globals.css
./src/app/layout.tsx
./src/app/page.tsx
./src/components
./src/components/ui
./src/components/ui/badge.tsx
./src/components/ui/button.tsx
./src/components/ui/card.tsx
./src/components/ui/checkbox.tsx
./src/components/ui/input.tsx
./src/components/ui/label.tsx
./src/components/ui/select.tsx
./src/components/ui/table.tsx
./src/components/ui/textarea.tsx
./src/db
./src/db/migrations
./src/db/queries
./src/db/queries/run-all.ts
./src/db/queries/status.ts
./src/db/raw-sql
./src/db/raw-sql/triggers-and-views.sql
./src/db/schema.ts
./src/lib
./src/lib/db.ts
./src/lib/queries.ts
./src/lib/supabase.ts
./src/lib/utils.ts
./tsconfig.json
```

---

## README

```markdown
# Economic Pattern Database

A knowledge graph of recurring economic problems, the solution patterns that address them, and the structural conditions under which those patterns succeed or fail. Companies are evidence used to construct the patterns — not the object of study.

**Full project brief:** `docs/economic-pattern-database-brief.md`
**Candidate selection protocol:** `docs/candidate-selection.md`

---

## Stack

- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle
- **Runtime:** Node.js / TypeScript via tsx
- **Framework:** Next.js (UI not yet built)

---

## Structure

```
data/
  _vocab/
    sectors.yaml                  # 8 sectors
    capabilities.yaml             # capability vocabulary
    problems.yaml                 # recurring economic problems
    solution-patterns.yaml        # structural bets against problems
    implementation-patterns.yaml  # concrete instantiations of patterns
    boundary-cases.yaml           # logged classification decisions
  companies/
    hr-payroll/                   # one file per company
      gusto.yaml
      rippling.yaml
      ...

loader/
  index.ts      # entry point
  validate.ts   # Zod schemas
  load.ts       # upsert engine
  export.ts     # DB → YAML (one-time migration, already run)

src/db/
  schema.ts     # Drizzle schema
  queries/      # priority analytical queries

docs/
  economic-pattern-database-brief.md
  candidate-selection.md
```

---

## Daily workflow

**Add a company:**

```bash
# 1. Copy the closest existing company as a template
cp data/companies/hr-payroll/gusto.yaml data/companies/hr-payroll/newcompany.yaml

# 2. Edit the file
# Minimum required: slug, name, domain, status, evidence_weight,
#                   signal_confidence, research_queue_source,
#                   implementation_patterns, problems, timeline (2+ entries)

# 3. Validate before loading
npx tsx loader/index.ts validate

# 4. Load into database
npx tsx loader/index.ts load
```

**Adding a new domain (e.g. payments):**

```bash
mkdir -p data/companies/payments
# Add companies to data/companies/payments/<slug>.yaml
# Add new vocab entries to data/_vocab/ files as needed
npx tsx loader/index.ts load
```

---

## Commands

```bash
# Load all YAML files into database (idempotent — safe to re-run)
npx tsx loader/index.ts load

# Validate all YAML without touching database
npx tsx loader/index.ts validate

# Run priority queries
set -a && source .env.local && set +a
npx tsx src/db/queries/run-all.ts

# Drizzle schema management
npx drizzle-kit push       # push schema changes to database
npx drizzle-kit studio     # visual database browser
```

---

## research_queue_source

Every company file requires this field. Format:

```
FAILURE_CASE_NEEDED:implementation-pattern-slug
STRONG_VALIDATOR_NEEDED:implementation-pattern-slug
PATTERN_PROMOTION:solution-pattern-slug:sector
GEOGRAPHIC_WHITESPACE:implementation-pattern-slug:Country
IMPLEMENTATION_FILL:implementation-pattern-slug
OFF_QUEUE:reason
```

See `docs/candidate-selection.md` for the full protocol and how to run the research queue.

---

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
``````

---

## Candidate selection protocol

```markdown
# Candidate Selection Protocol

## Why this document exists

Without a written protocol, company selection defaults to researcher recall.
This produces three failure modes that compound as the dataset grows:

1. **Clustering** — well-known companies in already-confirmed patterns
   accumulate observations that add no analytical value.
2. **Blind spots** — entire geographies, failure cases, and structural
   contrasts are never added because they were not top of mind.
3. **Non-reproducibility** — two researchers given the same database produce
   different next batches with no principled way to compare them.

The protocol below replaces researcher recall with a deterministic query
against the database. The database declares what evidence is missing;
the researcher's only job is to find a company that satisfies the specification.

---

## Core principle

**The database selects candidates. The researcher finds them.**

Every research session begins by running the research queue. A company is a
valid target if and only if it satisfies an open queue item. Companies added
outside the queue must set research_queue_source to OFF_QUEUE:reason. That
field is the audit trail. "I knew about this company" is not a valid OFF_QUEUE
justification. The only valid justifications are: (a) first ten foundation
records in a new domain, (b) a boundary case resolution, or (c) a cross-industry
PATTERN_PROMOTION target not yet reflected in the queue because the domain has
not been seeded.

---

## The six gap types

### 1. FAILURE_CASE_NEEDED (score: 25)

**Trigger:** An implementation pattern has 3+ strong validators and zero
disconfirming cases.

**Why highest priority:** A pattern with only successes has an unvalidated
failure condition. Survivor bias is actively corrupting the conditions. A single
well-documented failure is worth more than a tenth confirming success.

**What to find:** A company that attempted the pattern and shut down, was
acquired at a loss, or pivoted away. The failure does not need to be cleanly
attributable to the pattern — ambiguous cases are captured with a confidence
label.

**Search:** Crunchbase shutdown filter by industry, TechCrunch graveyard posts,
YC alumni directory checked against current web presence, Wayback Machine on
dead product pages.

#### Failure Attribution Confidence

Failure causation is often genuinely ambiguous. Every disconfirming company
record carries a failure_attribution_confidence field:

- High: Available evidence clearly links the failure to a structural property
  of the pattern — not execution, fraud, or unrelated market conditions.
- Medium: Evidence partially supports pattern attribution but other explanations
  are plausible and not ruled out.
- Low: Failure occurred while attempting the pattern, but the cause is unclear
  or primarily non-structural.
- Unknown: Insufficient post-mortem evidence to assess attribution.

Only High confidence disconfirming cases should be used to revise a
Winning/Failure Condition pair. Medium and Low cases are retained as evidence
of the pattern's risk surface but not as grounds for condition revision without
additional corroboration.

---

### 2. CONTRADICTORY_EVIDENCE_NEEDED (score: 22)

**Trigger:** A Solution Pattern has a Winning/Failure Condition pair at
proposed or established maturity, evidence count exceeds 5, and all grounding
observations are consistent with the stated condition — no counterexample exists.

**Why second priority:** FAILURE_CASE_NEEDED finds companies that tried and
failed. This is different: it finds companies that succeeded while apparently
violating the stated winning condition. If such a company exists, the winning
condition is incomplete or wrong — which matters more than another confirming
observation. The more uniform the evidence, the more important it becomes to
actively test that uniformity.

**What to find:** A company that instantiated the same pattern but succeeded
under conditions where the stated winning condition did not hold. Or succeeded
with a fundamentally different structural approach that the current condition
does not account for.

**Example:** Payroll processing infrastructure winning condition states
regulatory complexity makes in-house execution uneconomic. Find a profitable
payroll company operating in a low-regulation jurisdiction where this argument
does not apply. If it exists, the condition needs revision. If it cannot be
found after exhaustive search, that absence strengthens the condition.

**Search:** The winning condition text is the search specification. Extract the
mechanism. Search for it operating under conditions where the stated enabler
is absent.

---

### 3. STRONG_VALIDATOR_NEEDED (score: 20)

**Trigger:** An implementation pattern has 2+ companies but zero strong
validators (no known-profitable company).

**Why it matters:** Funded-but-unproven companies tell us investors believe in
the pattern. Only a strong validator proves the economics actually work. Global
EOR currently has four companies and zero strong validators.

**What to find:** A self-funded company operating 5+ years (profitability
proxy), or a public company with this pattern as its core product.

**Search:** Indie Hackers, Bootstrappers.io, public company 10-K filings
filtered by revenue segment, regional SaaS directories.

---

### 4. PATTERN_PROMOTION (score: 15 x observations needed)

**Trigger:** A Solution Pattern's Winning/Failure Conditions are at draft or
proposed and need cross-industry observations to advance.

Maturity thresholds:
- draft to proposed: 2 observations, symmetry verified
- proposed to established: 3+ observations across 2+ unrelated industries

**Critical:** Adding more companies in the same industry never upgrades a
condition from proposed to established. Only cross-industry confirmation does.

**What to find:** A company in any industry other than those already
represented, where the same structural condition holds. The winning condition
text itself is the specification.

**Example:** Payroll processing infrastructure winning condition: regulatory
complexity creates non-discretionary outsourcing demand. This appears in tax
filing (H&R Block), healthcare billing (athenahealth), legal compliance
(Wolters Kluwer). Adding one upgrades proposed to established.

**Search:** G2/Capterra categories in adjacent industries. YC batches sorted
by industry. VC portfolio pages in other domains. The winning condition text
copied directly into a search engine often surfaces relevant operators.

---

### 5. GEOGRAPHIC_WHITESPACE (score: 12)

**Trigger:** A pattern has strong validators in one country and zero
observations in another country where companies exist in the dataset.

**What to find:** A company in the missing geography using the pattern. If
none exists after sufficient search, record the absence explicitly.

#### Declaring Documented Absence

An absence is documented — not merely unknown — when all three of the
following have been completed:

1. At least three independent source types searched (e.g. local VC portfolio
   page, regional SaaS directory, Crunchbase country filter).
2. At least one local market expert source consulted if available (local VC
   blog posts, regional tech media such as Techpoint Africa, Wamda, e27).
3. The absence note on the implementation pattern record names the sources
   searched and the date of search.

An absence recorded without meeting this threshold is Unknown, not Documented.
These are different evidence states and must not be aggregated.

**Search:** Crunchbase filtered by country + industry. Local VC portfolio pages.
Regional tech media. "Best [product category] in [country]" in local language.

---

### 6. IMPLEMENTATION_FILL (score: 10 x observations needed)

**Trigger:** An implementation pattern has fewer than 3 observations.

**Why it matters:** A single-observation pattern is a company fact, not a
pattern. Three independent observations are the minimum for conditional claims.

**What to find:** Any company using the pattern — any geography, size, or
funding status. A third observation from a different geography is doubly
valuable.

**Search:** The pattern name is the primary search query. G2 category for
the problem the pattern addresses. Competitor pages of companies already in
the pattern.

---

## Scoring formula

FAILURE_CASE_NEEDED:             25
CONTRADICTORY_EVIDENCE_NEEDED:   22
STRONG_VALIDATOR_NEEDED:         20
PATTERN_PROMOTION:               15 x observations_needed_for_next_maturity_level
GEOGRAPHIC_WHITESPACE:           12
IMPLEMENTATION_FILL:             10 x observations_needed_to_reach_3

**Weights are fixed.** They are not adjusted per session or per researcher.
If the output seems wrong, log the issue and review the formula — do not
deviate silently from the queue. If a weight is genuinely wrong, revise this
document and record the change with a rationale.

**Weight rationale:**

Failure cases (25) rank highest because they correct the most dangerous
systematic bias. Contradictory evidence (22) ranks second because it tests
whether current conclusions are actually correct, not merely well-supported.
Strong validators (20) rank third because economic viability is the primary
filter on whether a pattern is real or just well-funded. Pattern promotion
(15x) ranks fourth because cross-industry confirmation is the only path to
established conditions. Geographic whitespace (12) ranks fifth because it
directly populates the opportunity identification query. Implementation fill
(10x) ranks last because adding a third observation is less urgent than fixing
structural gaps.

---

## Extending to new domains

**Why ten foundation records?**

Ten companies is the practical minimum to seed the vocabulary before the
queue generates meaningful scores. Fewer than ten leaves gaps in the vocabulary
that produce low-quality first-run directives. More than ten risks clustering
before the queue takes over. Ten is the empirically stable threshold at which
the queue becomes self-directing.

Foundation records should span the pattern space of the domain: at least one
strong validator, at least one disconfirming case, at least two geographies,
at least two distinct implementation patterns. Do not use all ten slots on the
most prominent companies in a single pattern.

1. First ten records: OFF_QUEUE:foundation-record.
2. After ten records: queue takes over automatically.
3. Any new capability observed must be checked against the capabilities table
   before creating a new record. Cross-domain capability reuse is one of the
   highest-value findings the dataset produces.

---

## research_queue_source format

FAILURE_CASE_NEEDED:cloud-native-smb-payroll-saas
STRONG_VALIDATOR_NEEDED:global-payroll-eor-platform
CONTRADICTORY_EVIDENCE_NEEDED:payroll-processing-infrastructure
PATTERN_PROMOTION:payroll-processing-infrastructure:financial-services-sector
GEOGRAPHIC_WHITESPACE:cloud-native-smb-payroll-saas:Nigeria
IMPLEMENTATION_FILL:compound-hr-it-finance-platform
OFF_QUEUE:foundation-record
OFF_QUEUE:boundary-case-resolution

---

## Anti-patterns

- Adding a company because it is well-known. Prominence is not a criterion.
- Batches of the same type — five companies in the same pattern and geography.
  The queue prevents this by dropping scores as gaps fill.
- Skipping research_queue_source. A record without provenance is
  non-reproducible research.
- Treating High failure attribution as a default. When the failure cause is
  genuinely unclear, record Unknown or Low.
- Declaring documented absence without meeting the three-source search
  threshold. Silence is Unknown, not Documented Absent.

---

## Foundation Record Discovery Protocol

This section governs how to identify the initial candidate pool when entering a
new domain for the first time. The queue-driven process cannot run until the
vocabulary exists. These are the steps that create it.

### Step 1: Map structural axes before picking any names

Do not start from a list of companies. Start from a list of structurally
distinct approaches to the same underlying problem. For any domain, identify
3-5 axes along which implementation patterns meaningfully differ:

- Who bears the regulatory liability (licensed entity vs. middleware vs. platform)?
- What is the core asset (owned infrastructure vs. aggregated rails vs. software layer)?
- What is the primary motion (domestic vs. cross-border)?
- What is the profit mechanism (transaction fee vs. spread vs. subscription vs. float)?
- Which customer segment (enterprise vs. SMB vs. developer vs. consumer)?

Map these before opening a browser. The axes define the slots. Companies fill
the slots. This prevents the most common failure mode: ten companies in the
same quadrant because they were the most prominent names in memory.

### Step 2: Source hierarchy

Use sources in this order. Stop when the candidate pool is large enough to
fill the slots defined by the axes.

Tier 1 — Structure (reveals what types of companies exist, not which are
largest): industry stack maps, CB Insights market maps, analyst category
reports, regulatory licensing registers (FCA e-money register, central bank
payment service provider lists), API documentation and pricing pages. These
reveal implementation patterns before they reveal names.

Tier 2 — Failure post-mortems (required — do not skip): Crunchbase shutdown
filter, bankruptcy court filings, TechCrunch graveyard, "site:medium.com
post-mortem [domain]", acquisition announcements below the acquiring company's
disclosed threshold (signals distressed sale). Failures do not appear in
market maps. They require deliberate search.

Tier 3 — Geographic coverage: local VC portfolio pages (Partech Africa, TLcom
Capital, Flourish Ventures, Sequoia India, Kaszek LatAm), regional tech media
(Techpoint Africa, Wamda, e27, Latam List), "best [product category] in
[country]" searches in the local language. US-centric and European sources
systematically miss emerging-market operators.

Tier 4 — Economics verification: public company annual reports and 10-K
filings, S-1 filings, credit rating agency reports (Moody's, S&P on private
companies), earnings call transcripts. Used to confirm which candidates qualify
as strong validators before selecting them.

### Step 3: Score candidates on ontology expansion

For each candidate in the pool, estimate before researching how many new nodes
it would add to the vocabulary. Prefer candidates with higher scores.

New implementation pattern:    +5
New problem statement:         +5
New capability:                +4
New business model:            +3
New expansion path:            +3
New geography:                 +2
Confirms existing only:        +1

A company scoring +1 can wait. A company scoring +12 should be in the first
ten regardless of its prominence. This is the anti-clustering mechanism: a
structurally unique company in an underrepresented geography will almost
always outscore a tenth variation of the dominant pattern.

### Step 4: Fill slots, do not rank

Once the axes and candidate pool exist, fill slots rather than producing a
ranked list. Define the required slots from the constraints:

Slot 1:    Primary strong validator (public financials preferred)
Slot 2:    Second strong validator (different geography or pattern from slot 1)
Slot 3:    Primary disconfirming case (High failure attribution confidence)
Slot 4:    Second disconfirming case if available (distinct failure mode from slot 3)
Slots 5-8: Representatives of each distinct implementation pattern not yet covered
Slots 9-10: Geographic coverage — at least one non-US, non-European operator
           if the domain has meaningful operators in other regions

A slot is filled by the candidate that best satisfies it AND has the highest
ontology expansion score. A company that fills two slots simultaneously (strong
validator AND new geography) is doubly valuable.

### Step 5: Inclusion vs. deferral criteria

Include if the company:
- Is the clearest exemplar of an implementation pattern not yet represented
- Adds a new geography while instantiating any pattern
- Has verified economics (public) or assessed economics (Moody's, credit
  rating, long operating history) that make it a strong validator
- Has a documented, pattern-attributable failure making it a disconfirming case

Defer if the company:
- Instantiates the same pattern and geography as a company already selected,
  even if it is larger or more prominent. Adyen in the payments domain covers
  the full-stack acquirer pattern with public financials; adding Checkout.com
  in the first ten wastes a slot. Add it in session 2 when the queue requests
  IMPLEMENTATION_FILL or CONTRADICTORY_EVIDENCE_NEEDED.
- Has been acquired by a larger company and no longer operates as an
  independent entity. The acquiring company may be the right record, not the
  subsidiary.
- Was founded less than 3 years ago with insufficient track record to fill
  the timeline requirement.
- Cannot be MVR-completed in under 60 minutes from public sources.
```

---

## Interpretation across layers

```markdown
# Interpretation Across All Three Layers

## The actual problem

Every layer of this database requires judgment to fill correctly. The governance
artifacts — abstraction tests, evidence labels, candidate selection protocol —
specify what a correct record looks like. They do not specify how to produce one.
That gap is where inconsistency enters, compounds upward, and becomes invisible.

This document does not try to close that gap with more rules. More rules produce
formal compliance without substantive agreement, which is worse than acknowledged
inconsistency. What it does instead is describe the nature of the judgment at each
layer, give practical mechanisms for keeping that judgment visible and improvable,
and name the failure modes to watch for.

---

## Three kinds of uncertainty, not one

The database contains three structurally different kinds of uncertainty that require
different responses. Treating them as the same produces governance artifacts that
are wrong for at least two of the three.

**Observational uncertainty (Layer 1):** The fact is genuinely unknown or
ambiguous. Was this company profitable? No protocol resolves missing information.
The right response is to record what is known, label what is inferred, and store
the raw source rather than only the interpreted bucket.

**Interpretive uncertainty (Layer 2):** The facts are available but two experts
may legitimately disagree about what they mean. Is this a distinct implementation
pattern or a variant of an existing one? This is not a question with a single
correct answer derivable from the facts. The right response is to make the
reasoning behind the interpretation visible and revisable, not to specify the
interpretation more tightly.

**Predictive uncertainty (Layer 3):** Nobody knows yet. The right response is
to make the claim specific and falsifiable and then track whether it turns out
to be correct.

---

## Why more rules fail

The abstraction tests use open-textured concepts: "meaningfully different
execution," "transfers without modification," "in the customer's language." These
cannot be closed by additional definitional text. This is not a failure of the
current tests that better wording would fix. It is a structural property of the
kind of concepts this database uses.

Legal systems learned this: decades of case law, not rule refinement, is what
gives "reasonable" operational meaning. The Boundary Case Catalog is the database's
equivalent of case law. The abstraction tests are the statutes. You need both,
and the catalog is the one that does the actual operational work.

The implication: when facing an abstraction judgment, search the Boundary Case
Catalog before reading the abstraction tests. The tests describe what you are
aiming for. The catalog shows what aiming for it looks like on real companies.

---

## Layer 1: preserve raw, record derivation

Layer 1 is described as the factual layer — things looked up, not inferred. In
practice, nearly every field requires a judgment call before it can be filled.

**The right response is not to eliminate the judgment. It is to store both the
raw source and the derivation that connects the source to the field value.**

For any field where interpretation was required, the record should contain:

- The raw source value (verbatim estimate, exact quote, specific filing reference)
- The bucket or label assigned
- One sentence on why the raw value maps to that bucket

Example: `revenue_signal: ">100M"` with `revenue_raw: "Sacra estimates $975M
2025"` and a note in `notable_facts`: "$1B boundary — Sacra is an estimate not a
reported figure; assigned <1B pending audited financials." The bucket disagreement
between two contributors becomes harmless because the raw data is preserved and
the reasoning is auditable.

For founding year on a pivoted company: store both `founded_legal` (incorporation)
and `founded` (first revenue under current mission), with a note on which is used
for temporal queries and why. Do not force a single value and silently discard
the other.

**The rule is: when you had to think about which value to use, store what you
thought alongside the value you chose.**

This is not additional documentation. It is part of the record. The record is
both data and reasoning log simultaneously.

### Detecting Layer 1 inconsistency

Periodically take a sample of existing records and have a second contributor
re-classify them without seeing the original classification. Measure the
disagreement rate by field. High disagreement on a specific field is the signal
that the field definition is not working — not a signal about contributor quality.
Fields with persistent high disagreement need either better-documented boundary
cases or acknowledgment that the field captures genuine ambiguity and should
store both values rather than forcing a single one.

This is the most immediately actionable governance mechanism available. It is
empirical — you get a number — and it tells you where to focus without requiring
a theory about why problems exist.

---

## Layer 2: the catalog is primary, the tests are secondary

Layer 2 abstraction tests specify desired properties. They cannot specify the
reasoning required to apply those properties to a specific company on a specific
day. The test says "could two companies instantiate this pattern with meaningfully
different execution?" It does not say what counts as meaningful difference in the
space of payroll SaaS companies, or HR platforms, or cross-border payment APIs.

That knowledge accumulates in the Boundary Case Catalog. The catalog is currently
treated as a secondary artifact — a log of decisions already made. It should be
treated as the primary reference.

**Before creating a new implementation pattern, mechanism assignment, or winning
condition, search the catalog.** Not for an identical case but for the nearest
analogous decision. If the catalog has an entry on why Stripe and Adyen were
assigned to different patterns, that entry calibrates the judgment about any
subsequent payment company more effectively than re-reading the abstraction test.

### What a useful Boundary Case Catalog entry contains

- The company or companies involved
- The two options that were live alternatives
- The specific structural difference that decided it — not "they are different"
  but the concrete operational fact that made the difference
- The option chosen and why
- Any dissenting reasoning that was considered and why it lost

Entries that say "we chose Pattern A because it fits better" are not useful. Entries
that say "we chose Pattern A because Stripe's revenue model is a percentage of
transaction value with no monthly fee, while Adyen's IC++ model passes interchange
at cost — the pricing structure is the structural difference, not the customer
segment" are useful.

### Compounding and correction

Layer 2 abstractions are derived from Layer 1 observations. When a Layer 1 record
is revised in a way that affects classification — profitability signal, status,
implementation pattern link, evidence weight — the patterns that included that
company as evidence should be flagged for review. This does not mean automatic
re-derivation. It means a human reviews whether the revision changes the pattern's
evidence base materially.

Twice a year, take a domain with 20+ companies and have a contributor who was
not involved in building its patterns re-derive the implementation pattern
clustering from scratch using only the current Layer 1 records. Compare the result
to the stored patterns. Divergence is the signal that Layer 2 has drifted from
its Layer 1 foundation. The comparison is not about who is right — it is about
whether the stored abstractions remain defensible given current evidence.

Periodically take a pattern that looks mature by the internal metrics and have a
contributor try to falsify it: find Layer 1 cases that should have been included
but weren't, test whether the winning conditions fail to transfer, demonstrate
that a different mechanism assignment fits equally well. If the pattern survives
this pressure, confidence in it increases. If it doesn't, the maturity status was
based on the wrong evidence.

---

## Layer 3: preserve reasoning, record predictions

Layer 3 hypotheses cannot be evaluated at creation time by whether they are
correct. They can only be evaluated by whether the reasoning is coherent and
honest, and by whether they turn out to be correct over time.

### The two tracks

**Derived** — follows directly from query output. Another contributor running
the same queries would produce a similar record. The gap is in the data.

**Interpretive** — makes a connection the data does not force. Another contributor
following the same protocol would not produce this record. Requires `departure_point`.

The `departure_point` is not optional for interpretive records. Without it, a
novel hypothesis is indistinguishable from a poorly-reasoned one. A well-formed
departure point states:

1. What the data actually shows
2. What a derived inference from that data would conclude
3. Where and why this hypothesis departs from that inference
4. What assumption is being imported from outside the dataset
5. How that assumption could be tested

The departure point is not a defense of the hypothesis. It is an honest map of
where the contributor left the data and started following a different logic.

### The well_formed checklist

Computed automatically by the loader. A record that fails is stored with status
`open` and flagged with the specific reasons. Required:

- `lens` is set
- `winning_condition_required` AND `failure_condition_to_avoid` both filled
- At least 1 prediction with `claim` + `falsification`
- At least 1 open question
- If `generation_mode: interpretive` → `departure_point` is filled

Passing means the record is structurally complete. It does not mean the hypothesis
is correct or well-grounded.

### Predictions

The only mechanism by which Layer 3 calibrates over time. Without them, old
records have no feedback loop and the database never learns whether its hypotheses
were good ones.

A well-formed prediction has three parts:

- `claim`: specific assertion about what will be observable in the future
- `falsification`: the specific observable event that would prove it wrong
- `horizon`: the year by which this should be checkable

After every load, the loader compares new company records against open opportunity
records. A new company that directly confirms or falsifies an open opportunity
flags it for immediate status review — not on the annual horizon date, but when
the evidence arrives.

### Open questions

Each must be researchable. Required fields:

- `question`: the specific unknown
- `method`: how to research it
- `close_criteria`: what constitutes a satisfactory answer

A question without a method and close_criteria is a concern, not a question.
Move it to `notes`.

### Status transitions

Triggered by specific events, not contributor discretion:

- `open` → `investigating`: contributor has begun researching open questions
- `open/investigating` → `validated`: open questions answered favourably;
  winning condition confirmed present in target market
- `open/investigating` → `rejected`: falsification condition met, or a new
  Layer 1 company already fills the gap
- `open/investigating` → `building`: a company is actively building this
- Any → `superseded`: newer opportunity with same gap fingerprint and
  stronger evidence replaces this one

Every status change requires a note with the specific evidence that caused it.

### Gap fingerprints

The loader computes `hash(problem_slug|lens|sorted_capability_slugs)` for each
opportunity. Opportunities sharing a fingerprint address the same underlying gap
and are automatically linked as `competing` in `opportunity_relationships`. After
auto-detection, manually update the relationship type if appropriate:

- `competing`: mutually exclusive bets; evidence will determine which is right
- `complementary`: both can succeed simultaneously
- `refinement`: one is a more specific version of the other
- `redundant`: same gap, same framing; merge one into the other

### Running the query suite before creating an opportunity

Run at minimum: Q06 (structural gaps), Q04 (capability reuse), Q03 (expansion
sequences), Q01 (winning conditions by maturity), Q09 (research queue).

Derived opportunities must cite which query surfaced the gap. Interpretive
opportunities must cite at least two query outputs that their synthesis reads
across.

---

## Goodhart across all layers

Any property introduced as a quality signal becomes a target. The only partial
defenses are:

**Make metrics compute from data, not be filled by contributors.** Evidence count
is computed. Maturity status is computed from evidence count. Well-formed status
is computed from field presence. These are outputs of good work, not targets
contributors aim at.

**Make the research queue optimise for diversity, not quantity.** The research
queue already does this: failure cases score highest, geographic whitespace scores
next. These are Goodhart-resistant because optimising them actually improves the
dataset. A contributor who games the queue by finding failure cases and filling
geographic gaps produces exactly the records the database needs. Extend this logic
to Layer 2: score which patterns need cross-industry stress testing, which winning
conditions have never been tested outside their originating domain, which
capabilities have sector evidence from only one industry.

**Keep the number of required fields minimal.** Every additional required field
is another dimension along which contributors can optimise for appearance. The
minimum viable record is the right instinct; resist additions that do not directly
serve a query in the priority suite.

**Use the calibration sprint for inter-rater measurement, not as a compliance
check.** Quarterly, take ten ambiguous companies and have all contributors classify
them independently. The goal is not to identify who classified correctly. The goal
is to measure where intuitions diverge, surface those cases as boundary catalog
entries, and improve calibration for next quarter. The result of the sprint is not
a score for any contributor — it is a set of new catalog entries documenting the
disagreements and how they were resolved.

---

## What to discard

**Fractional pattern membership** (e.g., Rippling: Compound 0.6, Payroll 0.3).
Evidence counts become floating point, maturity thresholds break, aggregate queries
become ambiguous. The right solution to genuine pattern ambiguity is a Boundary
Case Catalog entry with the reasoning, not a fractional assignment.

**Universal cascade triggers** on any Layer 1 field change. Only field changes
that materially affect classification should propagate — profitability signal,
status, evidence weight, implementation pattern link. Fixing a typo in
`notable_facts` should not trigger re-evaluation of dependent patterns.

**Quality scores computed at creation time for Layer 3.** A hypothesis that
scores well on a creation-time rubric is not more likely to be correct than one
that doesn't. The only score that matters is whether the prediction turned out
to be right, and that is only available after the horizon year.

**Per-record dual-blind entry.** Correct in principle, impractical for a small
team. The calibration sprint does the same work periodically without blocking
every record on a second contributor's availability.

---

## Summary

| Layer | Primary judgment type | Governance mechanism | Failure mode to watch |
|---|---|---|---|
| Layer 1 | Classification | Store raw + derivation in record; measure inter-rater disagreement by field | Silent redefinition of bucket boundaries; interpretation collapsed into field value with no trace |
| Layer 2 | Abstraction | Boundary Case Catalog as primary reference; periodic re-derivation; adversarial falsification of mature patterns | Premature convergence; patterns split finer than the evidence supports; winning conditions that survive only because nobody tried to break them |
| Layer 3 | Inference | Two-track (derived / interpretive); departure point required for interpretive; predictions with horizons; loader-triggered review when new evidence arrives | Unfalsifiable hypotheses; departure point absent on interpretive opportunities; predictions never reviewed because no mechanism triggers it |

The common thread is not more specification. It is making judgment visible,
making reasoning auditable, and letting evidence accumulate against explicit
claims rather than against vague quality assessments.
```

---

## Company template

```yaml
# ── COMPANY TEMPLATE ─────────────────────────────────────────────────────────
# Copy to data/companies/<domain>/<slug>.yaml
# Minimum required fields (MVR): slug, name, domain, founded, country, status,
# stage, funding_history, revenue_signal, profitability_signal, evidence_weight,
# signal_confidence, research_queue_source, implementation_patterns (>=1),
# problems (>=1), timeline (>=2 entries)
#
# research_queue_source format:
#   FAILURE_CASE_NEEDED:pattern-slug
#   STRONG_VALIDATOR_NEEDED:pattern-slug
#   CONTRADICTORY_EVIDENCE_NEEDED:solution-pattern-slug
#   PATTERN_PROMOTION:solution-pattern-slug:sector
#   GEOGRAPHIC_WHITESPACE:pattern-slug:Country
#   IMPLEMENTATION_FILL:pattern-slug
#   OFF_QUEUE:foundation-record
#   OFF_QUEUE:boundary-case-resolution
#
# evidence_weight:
#   strong_validator  — known profitable, sustained, self-funded or unit-economics positive
#   weak_validator    — operating but externally funded, unproven economics
#   disconfirming     — attempted the pattern and failed; failure mode recorded
#   unknown           — insufficient information
#
# profitability proxy: if no external funding AND 5+ years operating,
# use profitability_signal: estimated_profitable_proxy
# and set profitability_proxy_applied: true

slug: company-slug
name: Company Name
domain: hr-payroll           # hr-payroll | b2b-payments | c2c-payments | <new-domain>
research_queue_source: "OFF_QUEUE:foundation-record"

founded: 2015                # year of first revenue under current mission
# founded_legal: 2013        # incorporation year if different from founded

country: USA
status: operating            # operating | acquired | dead | pivoted | merged
stage: series_b              # public | unicorn | series_[a-g] | bootstrapped | yc | seed

funding_history: "Series A $10M 2016, Series B $40M 2018. Total: $50M."
# "none" is valid and significant — triggers profitability proxy if 5+ years old

revenue_signal: "10-100M"    # <10M | 10-100M | 100M-1B | >1B | null
# revenue_raw: "Sacra estimates $75M 2024"   # verbatim source before bucketing

profitability_signal: unknown
# known_profitable | known_unprofitable | estimated_profitable_proxy | unknown
# profitability_proxy_applied: true   # set if proxy rule applied

evidence_weight: weak_validator
signal_confidence: low       # high (public financials) | low (inference or proxy)

notable_facts: |
  Key facts that don't belong on the pattern record.
  If any field required judgment to fill, record the reasoning here.
  e.g. "Founded year is 2015 (product launch), not 2013 (incorporation),
  because the pre-2015 entity had no customers and different product."

implementation_patterns:
  - slug: cloud-native-smb-payroll-saas
    source: "Company website / Crunchbase"
    # confidence: high | medium | low (default: high)
    # notes: "Optional clarification"

problems:
  - slug: wage-compliance
  - slug: employee-benefits
    confidence: medium
    notes: "Added benefits in 2019, secondary to core payroll"

timeline:
  - year: 2015
    event_type: founding
    implementation_pattern: cloud-native-smb-payroll-saas
    problem: wage-compliance
    description: "Founded by X and Y. Initial product: cloud payroll for SMBs."
    source: "Company website / LinkedIn"

  - year: 2019
    event_type: product_launch
    implementation_pattern: cloud-native-smb-payroll-saas
    problem: employee-benefits
    capability: employer-database-and-relationships
    capability_deployed: "Existing employer database and payroll compliance infrastructure."
    description: "Launched benefits administration. First move beyond core payroll."
    source: "Press release / TechCrunch"
```

---

## Vocab template reference

```yaml
# ── VOCAB TEMPLATE REFERENCE ─────────────────────────────────────────────────
# This file documents the structure of each vocab file.
# Do not load this file — it is reference only (starts with _).
#
# IMPORTANT: Before adding any new vocab entry, check the existing files for
# near-duplicates. The loader will fail on duplicate slugs.
# Slugs: lowercase, alphanumeric, hyphens only. e.g. my-new-slug

# ── problems.yaml entry ───────────────────────────────────────────────────────
# - slug: wage-compliance
#   statement: "Businesses cannot calculate, withhold, and disburse employee
#     wages while remaining compliant with tax and labour regulations."
#   lifecycle: mature    # emerging | growing | mature | declining | dead
#   notes: "Status quo, underlying constraint, urgency, etc."

# ── solution-patterns.yaml entry ─────────────────────────────────────────────
# - slug: payroll-processing-infrastructure
#   name: Payroll processing infrastructure
#   first_observed: 1949
#   pattern_durability: decades-old  # emerging | established | decades-old | declining
#   winning_condition: "One transferable sentence. No industry-specific language."
#   failure_condition: "Direct logical inverse of winning_condition."
#   winning_condition_maturity: established  # draft | proposed | established
#   winning_condition_valid_from: 1949
#   # winning_condition_valid_through: 2020   # only if superseded
#   notes: "Why this pattern keeps reappearing."
#
# winning_condition + failure_condition: fill both or neither.

# ── implementation-patterns.yaml entry ───────────────────────────────────────
# - slug: cloud-native-smb-payroll-saas
#   name: Cloud-native SMB payroll SaaS
#   solution_pattern: payroll-processing-infrastructure
#   first_observed: 1998
#   status: live         # live | dead | niche
#   business_model: "Per-employee-per-month subscription"
#   pricing_signal: "<100/mo"   # free | <100/mo | 1k+/mo | enterprise
#   mechanism: abstraction
#   notes: "Moat, status quo displaced, capabilities required, etc."

# ── capabilities.yaml entry ──────────────────────────────────────────────────
# - slug: payroll-compliance-infrastructure
#   name: Payroll compliance infrastructure
#   description: "What this capability is and why it is hard to replicate quickly."
#   status: proposed   # candidate | proposed | established | deprecated
#   sector_evidence:
#     - sector: hr-and-workforce
#       example_company: Automatic Data Processing ADP
#       evidence_note: "ADP built payroll compliance over 40+ years, transferred
#         to international markets in 1990."

# ── sectors.yaml entry ───────────────────────────────────────────────────────
# - slug: hr-and-workforce
#   name: HR and Workforce

# ── boundary-cases.yaml entry ────────────────────────────────────────────────
# - company: Rippling
#   option_a: cloud-native-smb-payroll-saas
#   option_b: compound-hr-it-finance-platform
#   chosen: compound-hr-it-finance-platform
#   reason: "Rippling's core value is the unified Employee Graph enabling
#     cross-functional automation — not payroll per se."
#   resolved_at: "2024-01-01"
```

---

## Opportunity template

```yaml
# ── OPPORTUNITY TEMPLATE ──────────────────────────────────────────────────────
# Copy to data/opportunities/<slug>.yaml. Fill every field.
# Read docs/layer3-protocol.md before creating a new opportunity.
#
# well_formed checklist (computed by loader):
#   ✓ lens is set
#   ✓ winning_condition_required AND failure_condition_to_avoid both filled
#   ✓ at least 1 prediction with claim + falsification
#   ✓ at least 1 open_question
#   ✓ if generation_mode = interpretive → departure_point is filled
#
# A record that fails the checklist is stored as draft and cannot be promoted.

slug: your-slug
name: Short descriptive name
status: open  # open | investigating | validated | rejected | building

# ── Track ─────────────────────────────────────────────────────────────────────
generation_mode: derived
# derived:       follows directly from query output; reproducible
# interpretive:  non-obvious synthesis; departure_point required below

lens: structural_gap
# structural_gap | geographic_whitespace | segment_underserved |
# capability_recombination | pattern_transfer | condition_shift |
# cross_domain | pattern_inversion | other

# ── Required for interpretive only ───────────────────────────────────────────
# departure_point: |
#   What the data shows: [specific Layer 1/2 observation].
#   What a derived inference would conclude: [the obvious read].
#   Where this hypothesis departs: [the non-obvious step and why].
#   The departure relies on: [assumption imported from outside the dataset].
#   Testable by: [specific research method].

# ── Layer 2 references ────────────────────────────────────────────────────────
problem: problem-slug

existing_patterns:
  - existing-implementation-pattern-slug

recombined_patterns:
  - pattern-being-recombined

# ── The gap ───────────────────────────────────────────────────────────────────
observed_gap: |
  State the specific gap in Layer 1/2 terms. Cite evidence counts,
  pattern names, company names. Do not state the hypothesis here.

gap_evidence:
  - "Q06: problem X has 1 implementation pattern and 0 profitable confirmations"

evidence_strength: moderate  # strong | moderate | weak

# ── The hypothesis ────────────────────────────────────────────────────────────
hypothesis: |
  Concrete claim. What, for whom, using which mechanism, in which market.

# ── Structural conditions — fill both or neither ─────────────────────────────
winning_condition_required: |
  One transferable sentence. The structural condition that must hold.

failure_condition_to_avoid: |
  The direct logical inverse. What would kill this if present.

# ── Capabilities ──────────────────────────────────────────────────────────────
capabilities_required:
  - slug: capability-slug
    possessed_by: []
    available_to_new_entrant: false
    note: "Why this is or is not replicable by a new entrant"

# ── Predictions — at least 1 required ────────────────────────────────────────
predictions:
  - claim: "A company will emerge using this pattern in [market] by [year]"
    falsification: "Two well-funded attempts fail with documented unit economics failures before [year]"
    horizon: 2028

# ── Status quo ────────────────────────────────────────────────────────────────
status_quo:
  - "Current workaround customers use"

# ── Open questions — at least 1 required ─────────────────────────────────────
open_questions:
  - question: "Is [specific unknown] true?"
    method: "Interview [N] [persona]; check [specific source]"
    close_criteria: "Majority confirm [specific signal], or [public data] shows [threshold]"

notes: |
  Any caveats or analyst notes.
```

---

## Sample company (gusto.yaml)

```yaml
slug: gusto
name: Gusto (formerly ZenPayroll)
domain: hr-payroll
research_queue_source: "OFF_QUEUE:foundation-record"
founded: 2012
country: USA
status: operating
stage: unicorn
funding_history: "Seed $6.1M 2012 (YC batch). Series A through E 2013-2022. Total: ~$746M across 9 rounds. Tender offer
  June 2025 at $9.3B valuation."
revenue_signal: ">100M"
profitability_signal: unknown
evidence_weight: weak_validator
signal_confidence: low
notable_facts: Sacra estimates $975M revenue 2025 (up 30% YoY from $750M 2024). 500,000+ businesses (direct). 401k
  services grew 50% YoY 2024; Gusto Money grew 140% YoY 2024. US-only — geographic constraint creates documented
  international demand gap. Accountant referral channel is primary GTM.
implementation_patterns:
  - slug: cloud-native-smb-payroll-saas
    source: Sacra / Built In
problems:
  - slug: wage-compliance
  - slug: employee-benefits
  - slug: cross-border-employment
    confidence: medium
    notes: RemoteTeam acquisition 2021 — contractor-only, not full EOR.
timeline:
  - year: 2012
    event_type: founding
    implementation_pattern: cloud-native-smb-payroll-saas
    problem: wage-compliance
    description: "Founded as ZenPayroll by Joshua Reeves, Tomer London, Edward Kim. YC batch 2012. Initial product: payroll
      for SMBs. First funding: $6.1M Seed."
    source: Sacra / Built In
  - year: 2014
    event_type: product_launch
    implementation_pattern: cloud-native-smb-payroll-saas
    problem: employee-benefits
    capability: employer-database-and-relationships
    capability_deployed: Existing employer database and payroll compliance infrastructure.
    description: Renamed Gusto. Added health insurance benefits administration — first move beyond payroll. Standard payroll
      to benefits trajectory.
    source: Sacra / marketcurve.substack.com
  - year: 2020
    event_type: product_launch
    problem: wage-compliance
    capability: direct-banking-relationships
    capability_deployed: Direct banking relationship with 300k+ employees via payroll direct deposit.
    description: Launched Gusto Cash Accounts — employee financial wellness product. First move into financial services for
      employees (not employers).
    source: marketcurve.substack.com
  - year: 2021
    event_type: acquisition
    problem: cross-border-employment
    capability: payroll-compliance-infrastructure
    capability_deployed: Payroll compliance engine and employer relationships.
    capability_acquired: International contractor management capability and API-first architecture.
    description: Acquired RemoteTeam (international contractor management). Added international contractor payments.
      Launched Gusto Embedded Payroll API — enables third-party apps to embed Gusto's payroll engine.
    source: marketcurve.substack.com
```

---

## Vocab snapshots

### problems.yaml (first 40 lines)
```yaml
- slug: wage-compliance
  statement: Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and
    labour regulations.
  lifecycle: mature
  notes: "Status quo: manual calculation + paper cheques + accountant. Underlying constraint: regulatory friction +
    coordination failure. Frequency: bi-weekly. Urgency: high (legal obligation with penalties for non-compliance).
    Existing spend: significant — accountant fees, internal labour, penalty risk."
- slug: employee-benefits
  statement: Businesses cannot provide employees with competitive benefits packages without the purchasing power of large
    employers.
  lifecycle: mature
  notes: "Status quo: direct insurer negotiation (only viable at scale) or no benefits offered. Underlying constraint:
    scale requirements. SMBs cannot access group rates without aggregation. Urgency: high — benefits are a key hiring
    and retention lever."
- slug: it-provisioning
  statement: Businesses cannot provision or deprovision employee access to software, hardware, and corporate systems as a
    single coordinated action.
  lifecycle: growing
  notes: "Status quo: manual IT tickets + email + spreadsheets per system. Underlying constraint: coordination failure —
    each system has separate admin. Urgency: grows with employee count and number of SaaS tools. Security risk on
    offboarding is significant driver."
- slug: cross-border-employment
  statement: Companies cannot legally employ workers in foreign jurisdictions without establishing local legal entities,
    which takes 12-18 months and significant capital.
  lifecycle: growing
  notes: "Status quo: contractor misclassification (legally risky) or entity setup (slow, expensive, $20k-$100k+).
    Underlying constraint: regulatory friction per jurisdiction. Accelerated by remote work normalisation post-2020.
    Triggers: hiring a specific person abroad, entering a new market, distributed team formation."
- slug: programmatic-payment-acceptance
  statement: "Businesses cannot accept money from customers programmatically without
    building or licensing regulated payment processing infrastructure from scratch."
  lifecycle: mature
  notes: "Status quo: cash, cheque, or manual bank transfer. Underlying constraint:
    regulatory friction (banking licences, PCI-DSS, card scheme membership, AML/KYC)
    + scale requirements (card network access requires minimum volume commitments).
    Frequency: per transaction. Urgency: high — inability to accept payment is inability
    to do business online. This problem grounds the payroll-processing-infrastructure
    winning condition cross-industry: the same mechanism (regulatory complexity makes
    in-house execution uneconomic) operates identically in payments."

```

### implementation-patterns.yaml (first 30 lines)
```yaml
- slug: manual-payroll-bureau
  name: Manual payroll bureau
  solution_pattern: payroll-processing-infrastructure
  first_observed: 1949
  status: live
  business_model: Per-employee-per-period fee (outsourced service)
  pricing_signal: <100/mo
  notes: "Offline service model: employer sends payroll data, bureau processes and disburses. Initial advantage: batch
    processing at scale that individual employers could not achieve. Moat: switching cost from embedded payroll data +
    compliance records. Mechanism: delegation. Status quo displaced: in-house manual payroll by an accountant or
    bookkeeper."
- slug: on-premise-enterprise-hcm-platform
  name: On-premise enterprise HCM platform
  solution_pattern: cloud-hcm-platform
  first_observed: 1987
  status: dead
  business_model: Perpetual software licence + annual maintenance fees (17-22% of licence)
  pricing_signal: enterprise
  notes: "The dominant enterprise HR delivery model from the late 1980s through mid-2000s. Client-server architecture
    installed on customer infrastructure. High implementation cost ($1M-$10M+), long deployment cycles (12-24 months),
    and expensive upgrade projects every 3-5 years. Pattern lost to cloud HCM because incumbent vendors (PeopleSoft,
    SAP) could not transition to SaaS without cannibalising their own maintenance revenue streams. This is the
    structural opening that Workday exploited at founding in 2005. Mechanism: abstraction (same as cloud HCM). Status
    quo displaced: manual HR processes, paper-based records, basic accounting software. Status: dead as an independent
    pattern — remaining on-premise deployments are maintained by Oracle (via PeopleSoft) and SAP but no new net-new
    on-premise deployments are occurring at scale."
- slug: cloud-native-smb-payroll-saas
  name: Cloud-native SMB payroll SaaS
  solution_pattern: payroll-processing-infrastructure
  first_observed: 1998
```

### capabilities.yaml (first 25 lines)
```yaml
- slug: direct-banking-relationships
  name: Direct banking relationships
  description: Direct financial relationships with end customers established through an existing product. Makes financial
    product expansion tractable.
  status: proposed
  sector_evidence:
    - sector: hr-and-workforce
      example_company: Gusto formerly ZenPayroll
      evidence_note: Gusto established direct banking relationships via payroll direct deposit. In 2020 it launched Gusto Cash
        Accounts using these relationships as foundation.
- slug: employer-database-and-relationships
  name: Employer database and relationships
  description: Accumulated employer accounts and administrative access built through an existing product. Makes adjacent
    product expansion tractable because distribution is already solved.
  status: proposed
  sector_evidence:
    - sector: hr-and-workforce
      example_company: Gusto formerly ZenPayroll
      evidence_note: Gusto built employer relationships through payroll for 500000+ businesses. Each expansion was an upsell
        to an existing account, not cold acquisition.
- slug: enterprise-sales-network
  name: Enterprise sales network
  description: Trained enterprise sales organisation for large-organisation contracts. Makes adjacent enterprise product
    expansion tractable because the sales motion transfers.
  status: proposed
```

---

## Boundary cases (current)

```yaml
- company: Rippling
  option_a: IP-002 (cloud-native SMB payroll SaaS)
  option_b: IP-005 (compound HR+IT+Finance platform)
  chosen: IP-005 (compound HR+IT+Finance platform)
  reason: Rippling's core value proposition is the unified Employee Graph enabling cross-functional automation — payroll
    is the wedge, not the thesis. Gusto is the canonical IP-002 instantiation.
  resolved_at: 2026-08-04
- company: Zenefits
  option_a: IP-002 (cloud-native SMB payroll SaaS)
  option_b: IP-004 (compliance-led free HR SaaS, broker revenue)
  chosen: IP-004 (compliance-led free HR SaaS, broker revenue)
  reason: Zenefits's mechanism was insurance broker commissions funding free software — structurally distinct from
    standard PEPM SaaS subscription. The revenue model difference is the analytically important fact.
  resolved_at: 2026-08-04
- company: Justworks
  option_a: IP-002 (cloud-native SMB payroll SaaS)
  option_b: IP-006 (global payroll / EOR platform)
  chosen: IP-002 (cloud-native SMB payroll SaaS, PEO variant)
  reason: Justworks's PEO model is co-employment within the US, not cross-border employment. Conceptually closer to
    domestic outsourcing than international EOR. Recorded as a variant note on the IP-002 relationship.
  resolved_at: 2026-08-04
- company: Deel (US payroll launch 2024)
  option_a: Keep as IP-006 only
  option_b: Add IP-002 relationship for US payroll
  chosen: Keep as IP-006 only, with note on company record and timeline
  reason: US payroll is a new expansion move for Deel, not its primary instantiation. Adding IP-002 would imply
    equivalence with Gusto — Deel's US payroll is a secondary product, not its founding pattern.
  resolved_at: 2026-08-04
- company: Papaya Global vs. Deel/Remote
  option_a: All three as IP-006 with no distinction
  option_b: Split into IP-006a (entity-ownership) and IP-006b (partner model)
  chosen: All three as IP-006, with sub-model recorded in notes
  reason: The partner vs. entity-ownership distinction is meaningful but not yet supported by enough evidence to justify a
    separate pattern record. If entity-ownership dominance is confirmed across 3+ more observations, split warranted in
    Phase 2.
  resolved_at: 2026-08-04

- company: Interswitch Group
  option_a: domestic-payment-infrastructure only
  option_b: both domestic-payment-infrastructure (primary) and full-stack-payment-processor
    (medium confidence secondary)
  chosen: both — domestic-payment-infrastructure primary, full-stack-payment-processor
    medium confidence secondary
  reason: Interswitch's primary business is operating Nigerian switching infrastructure
    for all banks (domestic-payment-infrastructure). It also owns and processes the
    Verve card scheme directly (full-stack-payment-processor). Both are genuine
    instantiations. Medium confidence on the secondary pattern signals its supporting
    role. Cross-border payment results showing Interswitch are expected from the
    secondary linkage — not a data error, a classification nuance to track.
  resolved_at: "2025-08-05"
```
