# Candidate Selection Protocol

**Status:** Active
**Applies to:** All company records added to the dataset

---

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

Every research session begins by running the research queue:

```bash
set -a && source .env.local && set +a && npx tsx << 'EOF'
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);
const q = await db.execute(sql\`
  SELECT priority_rank, quest_type, pattern_name, score, brief, search_directive
  FROM research_queue LIMIT 10
\`) as any[];
for (const r of q) {
  console.log(\`\n[\${r.priority_rank}] \${r.quest_type} — score \${r.score}\`);
  console.log(\`    Pattern: \${r.pattern_name}\`);
  console.log(\`    Gap:     \${r.brief}\`);
  console.log(\`    Find:    \${r.search_directive}\`);
}
await client.end();
EOF
```

A company is a valid target if and only if it satisfies an open queue item.
Companies added outside the queue must set `research_queue_source` to
`OFF_QUEUE:reason`. That field is the audit trail.

---

## The five gap types

The queue generates five types of directives, in fixed priority order.

### 1. FAILURE_CASE_NEEDED (score: 25) — highest priority

**Trigger:** An implementation pattern has 3+ strong validators and zero
disconfirming cases.

**Why highest priority:** A pattern with only successes has an unvalidated
failure condition. The Winning/Failure Condition pair is describing a world
where the pattern always works — which is analytically useless. Survivor bias
is actively corrupting the conditions. A single well-documented failure is
worth more than a tenth confirming success.

**What to find:** A company that attempted the pattern and failed — shut down,
acquired at a loss, pivoted away, or collapsed mid-execution. Failure must be
pattern-attributable, not caused by fraud or unrelated misconduct.

**Search:** Crunchbase shutdown filter, TechCrunch graveyard, YC companies
gone dark, Wayback Machine on dead product pages.

---

### 2. STRONG_VALIDATOR_NEEDED (score: 20)

**Trigger:** An implementation pattern has 2+ companies but zero strong
validators (no known-profitable company).

**Why it matters:** Funded-but-unproven companies tell us investors believe in
the pattern. Only a strong validator (self-funded + 5+ years, or public with
positive operating income) proves the economics actually work.

**What to find:** A self-funded company operating 5+ years (profitability
proxy), or a public company with this pattern as its core product.

**Search:** Indie Hackers, bootstrapped SaaS directories, public company
10-K filings filtered by revenue segment.

---

### 3. PATTERN_PROMOTION (score: 15 x observations needed)

**Trigger:** A Solution Pattern's Winning/Failure Conditions are at draft or
proposed and need cross-industry observations to advance.

**Maturity thresholds:**
- draft -> proposed: 2 observations, symmetry verified
- proposed -> established: 3+ observations across 2+ unrelated industries

**Critical:** Adding more companies in the same industry never upgrades a
condition from proposed to established. Only cross-industry confirmation does.

**What to find:** A company in any industry other than those already
represented, where the same structural condition holds. The winning condition
text itself is the specification — read it, extract the mechanism, find it
elsewhere.

**Search:** G2/Capterra categories in adjacent industries. YC batches sorted
by industry. VC portfolio pages in other domains.

---

### 4. GEOGRAPHIC_WHITESPACE (score: 12)

**Trigger:** A pattern has strong validators in one country and zero
observations in another country where companies exist in the dataset.

**Why it matters:** The whitespace query ("which patterns exist in Market A
but not Market B") is the primary opportunity identification output. It only
returns useful results when absences are actively recorded, not inferred
from silence.

**What to find:** A company in the missing geography using the pattern. If
none exists, record that absence explicitly in the implementation pattern notes.

**Search:** Crunchbase filtered by country + industry. Local VC portfolio pages
(TLcom Capital, Partech Africa, Flourish Ventures for emerging markets).
YC companies filtered by country.

**African market priority (current dataset):** Strong validators exist only in
the US and Europe. Seamless HR (Nigeria), WorkPay (Kenya), Omnibiz (Nigeria)
are active targets for geographic whitespace on cloud-native SMB payroll SaaS.

---

### 5. IMPLEMENTATION_FILL (score: 10 x observations needed)

**Trigger:** An implementation pattern has fewer than 3 observations.

**Why it matters:** A single-observation pattern is a company fact, not a
pattern. Three independent observations are the minimum for conditional claims
("companies using this pattern tend to...").

**What to find:** Any company using the pattern — any geography, size, or
funding status. Prioritise strong validators where possible.

**Search:** The pattern name is the search query. G2 category for the problem
the pattern addresses. Competitor pages of companies already in the pattern.

---

## Scoring formula

```
FAILURE_CASE_NEEDED:     25
STRONG_VALIDATOR_NEEDED: 20
PATTERN_PROMOTION:       15 x observations_needed
GEOGRAPHIC_WHITESPACE:   12
IMPLEMENTATION_FILL:     10 x observations_needed
```

**Weight rationale:**

Failure cases (25) rank highest because they correct the most dangerous
systematic bias — a dataset without failures is a testimonial, not a dataset.
Strong validators (20) rank second because economic viability is the primary
filter on whether a pattern is real or just well-funded. Pattern promotion
(15x) ranks third because cross-industry confirmation is the only path to
established conditions. Geographic whitespace (12) ranks fourth because it
directly populates the opportunity identification query. Implementation fill
(10x) ranks last because adding a third observation is less urgent than fixing
structural gaps.

**Weights are fixed.** They are not adjusted per session or per researcher.
If the output seems wrong, log the issue and review the formula — do not
deviate silently from the queue.

---

## research_queue_source format

Every company record must set this field:

```
QUEST_TYPE:implementation-pattern-slug[:geography-if-applicable]
```

Examples:
```
FAILURE_CASE_NEEDED:cloud-native-smb-payroll-saas
STRONG_VALIDATOR_NEEDED:global-payroll-eor-platform
PATTERN_PROMOTION:payroll-processing-infrastructure:financial-services-sector
GEOGRAPHIC_WHITESPACE:cloud-native-smb-payroll-saas:Nigeria
IMPLEMENTATION_FILL:compound-hr-it-finance-platform
OFF_QUEUE:first-10-foundation-records-for-payments-domain
```

`OFF_QUEUE` is valid for: (1) first 10 foundation records in a new domain,
(2) boundary case resolutions, (3) explicit cross-industry promotion not yet
in the queue because the domain has not been seeded. "I knew about this
company" is not a valid off-queue justification.

---

## Extending to new industries

When seeding a new domain for the first time:

1. The first 10 records are **foundation records** — exempt from queue-driven
   selection. Set `research_queue_source` to `OFF_QUEUE:foundation-record`.
2. After 10 records, the queue takes over automatically.
3. Any new capability observed must be checked against the capabilities table
   (fuzzy similarity query) before creating a new record. Cross-domain
   capability reuse is one of the highest-value findings the dataset produces.

---

## Anti-patterns

- **Adding a company because it is well-known.** Prominence is not a criterion.
- **Batches of the same type.** Five companies in the same pattern/geography
  in one session. The queue prevents this by dropping scores as gaps fill.
- **Skipping research_queue_source.** A record with no source is
  non-reproducible research. Treat it as technical debt.
- **Treating the queue as advisory.** It is the protocol. Deviate only with
  documented justification.
