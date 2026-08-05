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
