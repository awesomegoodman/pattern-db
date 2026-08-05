# Economic Pattern Database — Project Brief

---

## Table of Contents

1. [Purpose](#purpose)
2. [Minimum Viable Record](#minimum-viable-record)
3. [Starting Domain](#starting-domain)
4. [Implementation Note](#implementation-note)
5. [The Three Layers](#the-three-layers)
6. [Core Design Principles](#core-design-principles)
7. [Data Entry Protocol](#data-entry-protocol)
8. [Boundary Case Catalog](#boundary-case-catalog)
9. [Abstraction Tests](#abstraction-tests)
10. [Canonical Relationship Vocabulary](#canonical-relationship-vocabulary)
11. [The Ontology](#the-ontology)
12. [Entity Fields](#entity-fields)
13. [Evidence and Provenance](#evidence-and-provenance)
14. [Query Traceability](#query-traceability)
15. [Phased Approach](#phased-approach)
16. [Technical Architecture](#technical-architecture)

---

## Purpose

A knowledge graph of recurring economic problems, the solution patterns that emerge to solve them, and the structural mechanisms through which businesses create, capture, defend, and expand economic value. Companies are treated as empirical observations used to construct and continuously refine the ontology rather than as the primary subject of analysis.

If a company disappeared tomorrow, almost nothing in this dataset should change — the problem persists, the mechanism persists, the customers persist, and another company occupies the implementation slot. That is the philosophical core of the project and it governs every structural decision below.

Companies are evidence, not the object of study. The ontology is inductive — higher-order abstractions are inferred from company behaviour, not defined in advance and then populated. Every abstract claim must be grounded in at least one company observation before it is entered. The ontology is continuously revised as observations accumulate.

The goal is not to catalogue companies. It is to understand how value is consistently created, captured, and defended. The objective is to identify **transferable mechanisms and winning conditions** — the structural patterns that explain why certain solutions succeed in certain market conditions, regardless of which company instantiates them. At sufficient scale, the dataset shifts from describing businesses to extracting reusable laws about how businesses succeed: what combinations of problem, mechanism, business model, distribution pattern, and winning condition repeatedly produce profitable operators across unrelated industries.

The questions the dataset must be able to answer:

- Which problems have few solution approaches despite documented willingness to pay?
- Which mechanisms repeatedly produce sustainable businesses across unrelated industries?
- Which winning conditions recur across unrelated markets?
- Which failure conditions recur across unrelated markets?
- Which solution patterns remain dominated by inefficient status quo alternatives with low switching cost?
- Show all solution patterns that replaced spreadsheets as the status quo.
- Show all solution patterns that replaced email as the status quo.
- Which business models consistently produce profitable operators, and in which problem types?
- Which customer segments exhibit repeated willingness to pay but limited supplier diversity?
- Which underlying constraints — trust, coordination failure, information asymmetry — appear across the most industries?
- Which mechanisms have consistently produced businesses for 30+ years?
- Find all patterns where push factors drove adoption more than pull factors.
- Find every successful expansion path that followed solving a payroll problem.
- Find mechanisms that repeatedly emerged after regulatory change.
- Find problems where every surviving solution converged on the same business model.
- Which recorded opportunities have the strongest evidence base and the fewest existing solutions?
- Which solution patterns exist in Market A but not Market B, where demand in Market B is documented?
- Which winning conditions are supported by the most independent observations?
- What adjacent problem do payment infrastructure companies typically enter after reaching scale, and how many years after founding does it happen?
- Which capabilities most commonly enable expansion into adjacent problems?
- Which implementation patterns failed due to insufficient supply or demand density?
- Which capabilities are required by the most implementation patterns but possessed by the fewest companies?

---

## Minimum Viable Record

### The Governing Test

The schema as designed is the right target state. It is not the right starting state. A fully-complete record requires 2–4 hours of careful research per company. At 1,000+ companies needed before cross-industry pattern queries are reliable, that is 2,000–4,000 hours of work before the dataset pays off at its full potential. This kills momentum before the dataset reaches critical mass.

The Minimum Viable Record (MVR) is the smallest set of fields that keeps a record analytically useful — contributing to pattern queries — while remaining consistently fillable from public information in under 60 minutes per company.

**A field is in the MVR if both conditions hold:**
1. It is consistently available from public sources in under 60 minutes, for both well-funded and bootstrapped private companies.
2. Leaving it blank prevents at least one priority query from returning meaningful results at scale.

**A field is enrichment (not MVR) if either condition fails.**

A record that satisfies the MVR with stub links to patterns is a valid, useful, incomplete record. A record that asserts pattern-level abstractions without grounding company observations is not valid, regardless of how many other fields are filled.

### MVR Field Set

| Field | Evidence Label | Why It Is MVR |
|---|---|---|
| Company name | — | Identity anchor. |
| Founded year | Known | Required for all temporal queries. Without this, "which mechanisms produced businesses for 30+ years" returns nothing. Always public. |
| Country / HQ | Known | Required for geographic whitespace queries. Always public. |
| Status | Known | Operating / Acquired / Dead / Pivoted. Without this, survivor bias silently corrupts every pattern query. Disconfirming companies must be in the dataset. |
| Stage | Known | Public / Unicorn / Series A–E / Bootstrapped / YC. Always findable. Affects evidence weight interpretation. |
| Funding history | Known | Round + amount + year, or "none." Available on Crunchbase / PitchBook for virtually every company. "None" + 5+ years operating triggers the profitability proxy. |
| Revenue signal | Known / Estimated / Unknown | Order of magnitude only: <$10M / $10–100M / $100M–1B / >$1B. Required for evidence weight assignment. Available exactly for public companies; estimated from funding and employee count for private. |
| Profitability signal | Known / Estimated / Unknown | Known profitable / Known unprofitable / Estimated profitable (proxy) / Unknown. Required to separate strong validators from weak validators. |
| Evidence weight | — | Strong validator / Weak validator / Disconfirming / Unknown. Computed from profitability signal + status. Makes confidence calibration automatic. |
| Signal confidence | — | High / Low. One bit. Separates public-financials-backed claims from proxy-backed claims. |
| Implementation pattern link | — | Stub is acceptable. Without this, the company cannot contribute to any pattern query. The core analytical connection. |
| Problem link | — | Stub is acceptable. Without this, the company cannot be grouped into problem clusters. Required for the whitespace query. |
| Timeline (≥2 entries) | Known | Minimum: founding event + one significant expansion or product launch. Each entry: year + event type + one-sentence description + implementation pattern linked (if applicable). A company with a single Timeline entry is an incomplete record. Without Timeline, no temporal query works. |

**That is 12 field groups.** Everything else — capability mapping, geographic penetration detail, push/pull factors, buying trigger language, mechanism assignment, winning/failure conditions, full failure modes, ICP detail, pricing signal — is enrichment, filled after the MVR is complete.

### Time Budget

Based on actual research across 15 companies during calibration:

- **Well-documented company** (public, YC-backed, Sacra/Contrary Research coverage): 30–45 min. The bottleneck is abstraction judgment, not data retrieval.
- **Moderately documented** (Series A–C, Crunchbase coverage, some press): 45–60 min.
- **Poorly documented** (bootstrapped, minimal press): 60–90 min. Profitability proxy is often the only available signal.

**At 1,000 companies, blended average 60 min/company: ~1,000 hours.** At 2 focused hours per day, that is 500 days — approximately 18 months solo. The dataset becomes meaningfully queryable well before completion: single-industry pattern queries work at 100 company records; cross-industry queries emerge at 300–500 across 3–4 domains.

---

## Starting Domain

### Selection Criteria

The first domain must score high on every dimension that affects data quality and time-to-usefulness:

| Criterion | What It Measures |
|---|---|
| Documentation quality | How much verified public data exists per company |
| Company count | Can 50–100 companies be identified without scraping |
| Failure case availability | Are disconfirming companies documented in detail |
| Pattern variety | Multiple distinct solution patterns and mechanisms visible |
| Temporal depth | Long enough history to see pattern evolution across eras |
| Expansion trajectory visibility | Can capability-reuse sequences be traced with timestamped data |
| Named query coverage | Does the domain directly answer the spec's hardest queries |

### Selected Domain: HR Tech / Payroll

**Documentation quality is the highest of any candidate domain.** Six public companies provide full SEC filings: ADP (founded 1949, FY2025 revenue $20.6B, net income $4.08B), Paychex (founded 1971, FY2025 revenue $5.57B, net income $1.66B), Workday (founded 2005, FY2025 revenue $8.45B), Paycom (founded 1998, 2025 revenue $2.05B, operating income $567M), Paylocity (founded 1997, 2025 revenue $1.59B). Sacra and Contrary Research provide high-quality estimates for major private companies: Gusto (~$975M estimated 2025 revenue), Rippling (~$570M ARR February 2025), Deel ($17.3B valuation October 2025), Remote ($3B+ valuation), Papaya Global ($145M 2024 revenue).

**Company count is more than sufficient.** Forty to sixty companies are identifiable immediately from public sources without scraping. The broader domain contains 80–120 companies across the sub-clusters described below.

**The best-documented failure case in enterprise SaaS is in this domain.** Zenefits (founded 2013, raised $598M, peaked at $4.5B valuation 2015) collapsed due to regulatory compliance failures and is one of the most thoroughly post-mortemed companies in technology history. Parker Conrad then founded Rippling — making this one of the only cases where the founder of a failed company publicly diagnosed exactly what went wrong and built the corrected version. This sequence is analytically invaluable: a disconfirming record (Zenefits/IP-004) directly informing a success record (Rippling/IP-005), with the capability differences between them clearly documented.

**Pattern variety is high and immediately visible.** Four distinct implementation patterns are identifiable from the first 15 records alone:

| Implementation Pattern | Representative Companies | Mechanism |
|---|---|---|
| Manual payroll bureau | ADP (1949), Paychex (1971) | Delegation |
| Cloud-native SMB payroll SaaS | Paycom (1998), Paylocity (1997), Gusto (2012), BambooHR (2008), Justworks (2012) | Abstraction |
| Cloud enterprise HCM | Workday (2005) | Abstraction |
| Compliance-led free HR SaaS *(dead pattern)* | Zenefits (2013) | Abstraction + regulatory arbitrage |
| Compound HR+IT+Finance platform | Rippling (2016) | Abstraction + workflow orchestration |
| Global payroll / EOR | Deel (2019), Remote (2019), Papaya Global (2016), Oyster (2020) | Coordination |

**Temporal depth is 75 years.** ADP was founded in 1949 as a manual payroll bureau. The domain has three fully observable technological eras — manual bureau (1949–1990s), client-server and desktop (1990s–2005), cloud SaaS (2005–present) — with a fourth (AI-native) currently forming. No other candidate domain offers this.

**The domain directly answers the spec's named query** "Find every successful expansion path that followed solving a payroll problem." That query exists in the spec because the domain is already known to be rich. The expansion sequence — payroll → benefits → HR → time tracking → compliance → financial services → IT management → global — is observable across multiple companies with verifiable timeline data.

**Geographic whitespace is immediately visible.** Gusto operates only in the US. The global payroll cluster (Deel, Remote, Papaya Global) exists precisely because Gusto's domestic constraint created documented unmet demand in international markets. This is the whitespace query — "which solution patterns exist in Market A but not Market B, where demand in Market B is documented" — working in real time, with real companies grounding it.

**Start here. Reach 100 records in this domain before expanding to a second domain.**

---

## Implementation Note

This is designed as a **relational database**. The ontology maps cleanly onto tables with foreign keys and typed relationship tables. Many-to-many relationships are handled through join tables. Graph traversal can be executed against a relational schema using recursive CTEs; if query patterns eventually require graph-native operations, the schema can be projected into a graph database at that point. Starting relational keeps data entry, validation, deduplication, and querying practical at the scale where patterns begin to emerge.

---

## The Three Layers

The dataset is strictly organised into three layers that must never be mixed.

**Layer 1 — Observation.** Directly recorded facts about things that exist or have existed. These are looked up, not inferred. Entities: Company, Company Timeline, pricing, funding, geography, competitors, revenue and profit evidence, sources. Evidence label: Known or Unknown only — observations are not estimated, they are either recorded or not yet recorded.

**Layer 2 — Derived Abstractions.** Interpretations constructed by induction from accumulated Layer 1 observations. These are models, not facts. Entities: Problem, Solution Pattern, Implementation Pattern, Mechanism, Underlying Constraint, Winning Condition, Failure Condition, Capability, Status Quo Pattern, Business Model, Distribution Pattern. Evidence label: Known / Estimated / Unknown. A derived abstraction cannot be asserted without at least one grounding Layer 1 observation. Every Layer 2 entity carries an `evidence_count` — a computed property tracking the number of distinct Company records that ground it either directly or through linked Implementation Pattern records. Evidence count makes confidence calibration automatic: a Winning Condition observed across 47 implementations carries different epistemic weight than one observed in two.

**Layer 3 — Hypotheses.** Structured speculation about things that might be built. Entities: Opportunity. Every field is explicitly a hypothesis linked to Layer 1 or Layer 2 evidence. Hypotheses are never promoted into Layer 2 without grounding observations. Opportunity records are also generatable as derived queries against Layers 1 and 2 — the stored records exist to carry annotations, open questions, and evidence links that a query view cannot hold.

---

## Core Design Principles

**If a company disappeared tomorrow, almost nothing should change.** The problem persists, the mechanism persists, the customers persist. This test governs every structural decision. If removing a company would require changing an abstraction, the abstraction is too close to the company.

**The ontology is inductive, not predefined.** Higher-order abstractions are inferred from accumulated company observations, not defined in advance. Every abstract claim must be grounded in at least one company observation before it is entered. The ontology is continuously refined as observations accumulate.

**Companies are evidence, not the object of study.** Every company record exists to ground a pattern claim in observable reality. The analytical unit is the pattern, not the company.

**Consistency of classification over theoretical completeness.** A schema that is 90% as expressive but enables consistent classification across 10,000 companies is more valuable than a perfectly elegant ontology that becomes ambiguous after a few hundred records. When a design choice trades expressiveness for classification clarity, clarity wins. When the same company could be plausibly classified two different ways under the current schema, that is a schema problem, not a contributor problem.

**Profitability as signal, not filter.** Evidence of sustained profitability is one of the strongest available signals of genuine market validation. Funding, valuation, and user growth are also captured but measure investor conviction rather than proven economic sustainability. Profitability is a weight on signal quality, not an inclusion criterion. Where direct profitability data is unavailable — which will be the majority of private company records — a proxy rule applies: a company that has raised no external funding and has operated continuously for 5 or more years is recorded as Estimated profitable. This proxy is Tier 6 inference (plausible reasoning, not observation) and must be labelled explicitly as such.

**The status quo is always a competitor.** The dataset assumes customers always have a solution — Excel, email, hiring a person, doing nothing. Every problem node must identify the status quo before any commercial solutions are recorded. Status Quo Pattern is a first-class entity because the same status quo recurs across unrelated problems and this recurrence is itself a signal worth querying.

**Breadth and consistency over depth.** Every field must be answerable from publicly available information within a reasonable research budget per record. A dataset with consistent signal across thousands of records is more valuable than exhaustive detail on a few hundred.

**Evidence strength is field-level.** Every non-trivial field carries a label: Known / Estimated / Unknown. The three layers are kept strictly separate.

**Mechanisms are interpreted, not observed.** Mechanisms are a derived layer filled after all other fields on an Implementation Pattern record are complete. They carry Estimated by default, not Known, because the same company can legitimately be interpreted as instantiating multiple mechanisms simultaneously. Mechanism assignment is an analytical judgment, not a fact lookup. When two mechanisms are both plausible, assign the one that explains the value creation — why customers pay — not the one that describes the technical implementation — how the product works. If this tiebreaker does not resolve the ambiguity, both mechanisms are recorded and the case is added to the Boundary Case Catalog.

**Winning Condition and Failure Condition are required as a logical pair, with explicit maturity status.** They are the primary analytical payoff of the dataset. Both must be filled together or left empty together — a half-filled pair is not permitted. The failure condition must be the explicit logical inverse of the winning condition at the same level of abstraction. The pair carries a maturity status — Draft, Proposed, or Established — that reflects how well-grounded the pair is.

**Temporal decay is explicit.** Winning Conditions change as markets mature, incumbents adapt, or technology eliminates original advantages. The schema attaches `valid_from`, `valid_through`, and `superseded_by` to every Winning/Failure Condition pair so that queries about long-running patterns return an evolutionary picture, not a static snapshot. A condition recorded without `valid_from` is incomplete.

**Relationship confidence is explicit.** Every typed relationship carries its own confidence level and source list. Field-level Known/Estimated/Unknown is insufficient for relationships because the graph degrades when there is no record of why a relationship was asserted.

**Evidence weight is not the same as data confidence.** Signal confidence measures how reliable our information about a company is. Evidence weight measures how much epistemic force that company's existence lends to the patterns it instantiates. These are tracked separately.

**Time is a first-class dimension.** Companies are not static records — they are evolving bundles of experiments. The sequence and timing of expansion moves are among the richest signals in the dataset and are only queryable if time is attached to company events. Company Timeline is a required sub-record on every Company entry.

**Capability reuse explains expansion more reliably than problem adjacency.** Companies expand not only because adjacent problems exist but because they possess capabilities that make specific expansions tractable at low marginal cost. Capability is a first-class cross-cutting node.

**Abstract concepts are added when data demands them, not before.** The ontology should emerge from repeated observations rather than assumptions. If a concept cannot be grounded in multiple independent company observations at the time of proposal, defer it.

---

## Data Entry Protocol

**The ontology reads top-down. Data entry runs bottom-up. These are opposite directions and the distinction is critical.**

The schema is organised Problem → Solution Pattern → Implementation Pattern → Company because that reflects the analytical hierarchy. But in practice, every record begins with a company. You encounter Stripe before you abstract "API-first developer payment infrastructure" as an implementation pattern, abstract the implementation pattern before you identify "payment infrastructure" as the solution pattern, and abstract the solution pattern before you identify "businesses cannot accept online payments" as the problem node.

If this is not acknowledged explicitly, records created by different contributors will abstract at inconsistent levels and the dataset becomes unqueryable.

### Phase 1 (MVR) Entry Sequence

For the minimum viable record, the mandatory sequence is:

1. **Fill the Company record.** Name, founded, country, status, stage, funding history, revenue signal, profitability signal, evidence weight, signal confidence.
2. **Add at least two Timeline entries.** Founding event + one significant expansion. Each entry: year, event type, description, implementation pattern linked (stub if new).
3. **Link to one Implementation Pattern.** If an existing pattern matches, link to it. If not, create a stub: name only. Do not fill other Implementation Pattern fields yet.
4. **Link to one Problem.** If an existing problem matches, link to it. If not, create a stub: problem statement only.

A record that satisfies steps 1–4 is a valid MVR. All further fields are enrichment.

### Full Entry Sequence (enrichment phase)

Only after the MVR is complete:

5. **Enrich the Implementation Pattern.** Fill business model, distribution pattern, status quo displaced, capabilities required, key inputs, output/value created, moat, customer/ICP, economic validation sub-record.
6. **Enrich the Solution Pattern.** Link to underlying constraint, fill winning and failure condition pair (as Draft), fill valid_from.
7. **Assign cross-cutting nodes.** Link the Implementation Pattern to its Business Model, Distribution Pattern, Status Quo Pattern, and Capability requirements.
8. **Fill Mechanism last on Implementation Pattern.** Mechanism is derived — fill only after all other fields are complete. Carries Estimated by default. Apply the tiebreaker rule. If unresolved, record both and log in Boundary Case Catalog.
9. **Fill Winning Condition and Failure Condition as a pair on Solution Pattern.** Fill together or not at all. Assign maturity status. Assign valid_from.

A record with a complete MVR entry and stub links is a valid, useful, incomplete record. A record that asserts a Pattern without a grounding Company observation is not valid.

### Boundary Case Catalog

Every time a genuine ambiguity arises — a company that could plausibly sit under two different Solution Patterns, or a mechanism assignment the tiebreaker rule does not settle — the case is documented in a living Boundary Case Catalog separate from the main schema.

Each entry records: the company name, the two options considered, the option chosen, the one-sentence reason it was chosen, and the date of the decision. The catalog is reviewed periodically. If the same boundary is hit more than three times in different directions, the abstraction test needs a new worked example.

---

## Boundary Case Catalog

The abstraction tests resolve most classification decisions. They will not resolve all of them. Every time a genuine ambiguity arises — a company that could plausibly sit under two different Solution Patterns, or a mechanism assignment the tiebreaker rule does not settle — the case is documented in a living Boundary Case Catalog separate from the main schema.

Each entry records: the company name, the two options considered, the option chosen, the one-sentence reason it was chosen, and the date of the decision. The catalog is reviewed periodically. If the same boundary is hit more than three times in different directions, the abstraction test needs a new worked example.

The catalog serves two functions: it prevents re-litigating the same decisions as the dataset grows, and it surfaces abstraction problems before they accumulate into silent inconsistency. A growing catalog is not a failure — it is the mechanism by which the ontology self-corrects.

**Seed entries from calibration phase:**

| Company | Option A | Option B | Chosen | Reason | Date |
|---|---|---|---|---|---|
| Rippling | IP-002 (cloud-native SMB payroll SaaS) | IP-005 (compound HR+IT+Finance) | IP-005 | Rippling's core value proposition is the unified employee record enabling cross-functional automation — not payroll per se. Gusto is the right IP-002 instantiation. | 2024 |
| Zenefits | IP-002 | IP-004 (compliance-led free HR SaaS) | IP-004 | Zenefits' mechanism was insurance broker commissions funding free software — structurally distinct from standard SaaS subscription. | 2024 |
| Justworks | IP-002 | IP-006 (global payroll/EOR) | IP-002 (PEO variant) | Justworks' PEO model is co-employment within the US, not cross-border employment. Conceptually closer to US-domestic outsourcing than international EOR. | 2024 |

---

## Abstraction Tests

Consistent abstraction is the primary determinant of long-term data quality. The following tests resolve ambiguity at the point of entry, before inconsistency accumulates.

### Underlying Constraint

**Test question:** Is this a structural reason a problem persists — the specific friction that prevents the status quo from being adequate — stated without reference to any solution? If removing it would dissolve the problem entirely, it is a constraint.

**Canonical example:** "information asymmetry" — one party knows something the other needs to know to transact efficiently. This constraint explains why the problem exists, not how it is solved.

**Counterexample:** "no API exists" — this is a technical gap, not a structural constraint. The underlying constraint is probably "standardisation is required before integration becomes cheap enough to be worth building."

---

### Problem

**Test question:** Is this a specific, recurring pain a customer experiences, stated in the customer's language without reference to any solution? If it implies a solution or requires knowing the industry to understand, restate it.

**Canonical example:** "Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and labour regulations." The customer experiences this pain. The solution is unspecified.

**Counterexample:** "Businesses need payroll software" — this implies a solution. The problem is not a problem statement; it is a solution statement in disguise.

---

### Solution Pattern

**Test question:** Could multiple meaningfully different implementations exist under this name? If yes, it is at the right level of abstraction. If only one implementation is conceivable, it is too specific and belongs at Implementation Pattern level.

**Canonical example:** "Payroll infrastructure" — this could be implemented as a bureau outsourcing model, as cloud SaaS for SMBs, as enterprise HCM, or as embedded payroll APIs. Multiple distinct implementations exist.

**Counterexample:** "Per-employee-per-month cloud payroll SaaS for US SMBs with accountant referral channel" — only one class of implementation fits. It belongs at Implementation Pattern level.

**Boundary with Mechanism:** Solution Pattern is the structural approach to a problem — what is being built. Mechanism is the operational logic by which value is created — how it works at an abstract level. "Payroll infrastructure" is a Solution Pattern. "Abstraction" is the Mechanism. If a proposed Solution Pattern name sounds like a verb describing an operation rather than a noun describing an approach, it is probably a Mechanism.

---

### Implementation Pattern

**Test question:** Could two companies instantiate this pattern with meaningfully different execution while still fitting the description? If yes, it is at the right level. If the description fits only one company, it is a Company fact.

**Canonical example:** "Cloud-native SMB payroll SaaS" — Gusto, Paycom, Paylocity, and BambooHR all fit this description while differing substantially in execution, customer focus, distribution, and geographic coverage.

**Counterexample:** "Gusto's accountant-first referral channel combined with embedded payroll API product" — this is a Company fact about Gusto's specific GTM and product strategy, not a pattern.

---

### Mechanism

**Test question:** Does this mechanism apply equally to companies in at least three unrelated industries without restatement? If it requires knowing the industry to understand, raise the abstraction.

**Canonical example:** "matching" — applies to ride-hailing (Uber), home rental (Airbnb), freelance labour (Fiverr), and handmade goods (Etsy) without modification.

**Counterexample:** "two-sided marketplace for gig workers" — this is an Implementation Pattern, not a mechanism. The mechanism is "matching."

**Boundary with Solution Pattern:** Mechanism describes the operational logic — the how. Solution Pattern describes the structural approach — the what. "Marketplace" is a Solution Pattern. "Matching" is the Mechanism that marketplaces use.

**Tiebreaker rule:** When two mechanisms are both plausible, assign the one that explains why customers pay — the value creation logic — not the one that describes how the product technically operates. If a company simultaneously aggregates supply AND matches buyers to it, the mechanism that explains the economic value (matching) takes precedence over the mechanism that describes the infrastructure (aggregation) unless aggregation is itself the source of the pricing power. Document the case in the Boundary Case Catalog either way.

---

### Winning Condition / Failure Condition

**Test question:** Is this condition transferable to a completely unrelated industry without modification? If it requires knowing the specific market to interpret, restate it at a higher level of abstraction. Is the failure condition the direct logical inverse of the winning condition at the same abstraction level? If not, both fields need reworking.

**Canonical example:**
- Winning: "supply is fragmented enough that search costs exceed switching costs."
- Failure: "supply consolidates to the point where incumbents can serve demand directly, eliminating search cost as a driver."

**Temporal validity:** Winning Conditions are not eternal. Every Winning/Failure Condition pair must carry `valid_from`, `valid_through` (nullable), and `superseded_by` (nullable). A condition without `valid_from` is an incomplete record.

**Maturity status:**
- **Draft** — stated but not yet symmetry-verified or grounded in fewer than 2 company observations.
- **Proposed** — internally consistent, symmetry-verified, grounded in 2+ observations, not yet cross-industry tested.
- **Established** — grounded in 3+ observations across 2+ unrelated industries, transferability confirmed without restatement, logical symmetry verified.

---

### Capability

**Test question:** Is this something a company built or acquired that is hard to replicate quickly and that makes specific expansion moves tractable at low marginal cost? If it is a generic business skill, it is not a capability in this schema.

**Canonical example:** "banking integrations and regulatory expertise" — Stripe built this over years of navigating financial regulation. It directly enabled expansion into Treasury, Issuing, and Capital. A new entrant cannot replicate it in months.

**Counterexample:** "good engineering team" — this is not a specific capability in the sense this schema uses.

---

## Canonical Relationship Vocabulary

All typed relationships in the dataset use the following controlled vocabulary. Every relationship carries three metadata fields: `confidence` (high / medium / low), `source` (list of company names or records that ground the relationship), and `notes` (one sentence explaining why the relationship was asserted, if not self-evident). Relationships not in this list are not permitted — if a new relationship type is needed, it is added here first.

### Problem relationships
- `solved_by` → Solution Pattern
- `enables` → Problem
- `prerequisite_for` → Problem
- `causes` → Problem
- `blocks` → Problem
- `substitutes` → Problem
- `depends_on` → Problem
- `complements` → Problem
- `creates` → Problem
- `automates` → Problem
- `replaces` → Problem

### Solution Pattern relationships
- `implemented_by` → Implementation Pattern
- `rooted_in` → Underlying Constraint
- `succeeds_when` → Winning Condition *(required paired with fails_when)*
- `fails_when` → Failure Condition *(required paired with succeeds_when)*
- `direct_competitor` → Solution Pattern
- `alternative_approach` → Solution Pattern
- `adjacent` → Solution Pattern
- `evolved_into` → Solution Pattern *(directional)*
- `preceded_by` → Solution Pattern *(directional)*

### Implementation Pattern relationships
- `instantiated_by` → Company
- `uses_mechanism` → Mechanism *(Estimated by default — derived, not observed)*
- `monetised_by` → Business Model
- `distributed_by` → Distribution Pattern
- `displaces` → Status Quo Pattern
- `requires` → Capability
- `built_on` → Implementation Pattern
- `failed_competitor` → Implementation Pattern

### Company relationships
- `instantiates` → Implementation Pattern
- `possesses` → Capability
- `acquired` → Company
- `acquired_by` → Company
- `spin_out_of` → Company
- `pivoted_from` → Implementation Pattern

### Capability relationships
- `possessed_by` → Company
- `required_by` → Implementation Pattern
- `enables_expansion_to` → Problem

### Opportunity relationships
- `addresses` → Problem
- `recombines` → Solution Pattern *(one or more)*
- `displaces` → Status Quo Pattern
- `requires_winning_condition` → Winning Condition
- `avoids_failure_condition` → Failure Condition

---

## The Ontology

The relationship between Problems and Solution Patterns is **many-to-many** — handled through a join table. Solution Patterns link to Implementation Patterns, also many-to-many. Company is a leaf node linked to one or more Implementation Patterns, with a required Timeline sub-record capturing the temporal dimension. Six cross-cutting nodes — Underlying Constraint, Status Quo Pattern, Mechanism, Business Model, Distribution Pattern, and Capability — are referenced laterally. Opportunity is a separate hypothesis layer linked back to the observational ontology.

```
┌──────────────────────┐         ┌──────────────────────┐
│  Underlying          │         │  Status Quo          │
│  Constraint          │         │  Pattern             │
│  (cross-cutting)     │         │  (cross-cutting)     │
└──────────┬───────────┘         └───────────┬──────────┘
           │ (lateral)                       │ (lateral)
           ▼                                 ▼
┌──────────────────────────────────────────────────────┐
│                       Problem                        │
└──────────────────────────┬───────────────────────────┘
                           │ solved_by (many-to-many)
                           ▼
┌──────────────────────────────────────────────────────┐
│                   Solution Pattern                   │
│  [Winning Condition + Failure Condition + maturity]  │
│  [valid_from · valid_through · superseded_by]        │
└──────────────────────────┬───────────────────────────┘
                           │ implemented_by (many-to-many)
                           ▼
┌──────────────────────────────────────────────────────┐
│                Implementation Pattern                │
└──────┬──────────────┬──────────────┬─────────────────┘
       │              │              │
       │ instantiated │ uses_        │ monetised_by
       │ _by          │ mechanism    │
       ▼              ▼              ▼
┌──────────────┐  ┌──────────┐  ┌──────────────────┐
│   Company    │  │ Mechanism│  │  Business Model  │
│  + Timeline  │  │          │  │                  │
└──────┬───────┘  └──────────┘  └──────────────────┘
       │
       ├── possesses ──► Capability ──► enables_expansion_to ──► Problem
       └── Timeline ──► [year: event, pattern linked, capability deployed]
```

---

## Entity Fields

### Problem (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Problem statement | — | Customer's language — no solution implied |
| Evidence count | Computed | Number of distinct Company records grounding this problem |
| Customer segment variations | Known / Estimated | How constraints, urgency, and status quo differ by segment |
| Desired outcome | Known / Estimated | What customers want to achieve |
| Core constraint | Known / Estimated | The specific structural reason this problem persists |
| Underlying constraint (linked) | — | FK to Underlying Constraint node |
| Status quo pattern (linked) | — | FK to Status Quo Pattern node |
| Frequency | Known / Estimated / Unknown | Daily / weekly / monthly / annually / once |
| Urgency | Known / Estimated / Unknown | High / medium / low |
| Existing spend | Known / Estimated / Unknown | Order of magnitude in money or time |
| Switching cost | Known / Estimated / Unknown | High / medium / low — one-line reason |
| Why status quo persists | Known / Estimated | The specific inertia holding it in place |
| Failure conditions | Known / Estimated | When the status quo breaks down |
| Triggers | Known / Estimated | Specific events pushing customer from passive to active search |
| Why now | Known / Estimated | The unlock making this newly solvable |
| Lifecycle | Estimated | Emerging / growing / mature / declining / dead |
| Linked solution patterns | — | Many-to-many join table |

---

### Status Quo Pattern (cross-cutting — Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | "Spreadsheets + manual reconciliation" / "Email chains" / "Hiring a person" / "Paper forms" / "Phone calls" / "Doing nothing" |
| Evidence count | Computed | Number of distinct Company records grounding this node |
| Description | — | What this status quo actually involves for the customer |
| Why it persists | — | The general inertia that keeps it alive across multiple problems |
| Common switching friction | — | What typically needs to happen before customers abandon it |
| Linked problems | — | All problem records where this is the dominant status quo |
| Linked implementation patterns | — | Patterns that most commonly displace this status quo |

---

### Underlying Constraint (cross-cutting — Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Constraint name | — | Trust / coordination failure / information asymmetry / fragmented supply / demand uncertainty / idle capacity / search costs / regulatory friction / scale requirements |
| Evidence count | Computed | |
| Description | — | Why this constraint is structurally persistent |
| Common industries | — | Where this constraint most frequently appears |
| Linked problems | — | All problem records rooted in this constraint |
| Linked mechanisms | — | Mechanisms that most commonly address this constraint type |

---

### Mechanism (cross-cutting — Layer 2, derived)

Mechanisms are derived interpretations, not observed facts. All mechanism assignments carry Estimated by default. The same company can instantiate multiple mechanisms simultaneously. Mechanism names must be abstract enough to apply across at least three unrelated industries without restatement.

| Field | Evidence Label | Notes |
|---|---|---|
| Mechanism name | — | One of: aggregation / standardisation / matching / automation / trust creation / workflow orchestration / financing / prediction / optimisation / scheduling / discovery / abstraction / coordination / delegation / certification / monitoring / protection / collaboration. New names require: (1) clear written distinction from all existing names, (2) grounding in at least three independent company observations, (3) an entry in the Boundary Case Catalog. |
| Evidence count | Computed | |
| How it works | Estimated | One paragraph — no specific company or industry reference |
| Why it keeps reappearing | Estimated | The structural reason it gets independently reinvented |
| Common inputs | Estimated | What this mechanism typically consumes or transforms |
| Common outputs | Estimated | What it produces for the customer |
| Linked underlying constraints | — | Which constraint types this mechanism typically addresses |
| Linked implementation patterns | — | All implementation patterns using this mechanism |

---

### Business Model (cross-cutting — Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Model name | — | Transaction fee / subscription / marketplace rake / licensing / bundled / usage-based / freemium |
| Evidence count | Computed | |
| How money moves | — | One-line description |
| Typical cash timing | — | Prepay / at delivery / post-delivery |
| Common problem types | — | Which problem categories this model tends to dominate |
| Linked implementation patterns | — | |

---

### Distribution Pattern (cross-cutting — Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | Short descriptive label |
| Evidence count | Computed | |
| First acquisition channel | Known / Estimated | How first customers were actually reached |
| Current dominant channel | Known / Estimated | How majority of customers are acquired today |
| Sales motion | Known / Estimated | Self-serve / sales-led / hybrid |
| Channel types | Known / Estimated | Outbound / inbound / viral / marketplace / partnerships / SEO / community |
| Viral mechanism | Known / Estimated | If viral: what specifically drives spread |
| Linked implementation patterns | — | |

---

### Capability (cross-cutting — Layer 2)

Capabilities are specific competencies a company built or acquired that are hard to replicate quickly and that make particular expansion moves tractable at low marginal cost.

| Field | Evidence Label | Notes |
|---|---|---|
| Capability name | — | Specific and concrete: "banking integrations and regulatory expertise," "marketplace liquidity management." Generic terms like "good engineering" are not capabilities in this schema. |
| Evidence count | Computed | |
| Description | Known / Estimated | What this capability consists of and why it is hard to replicate quickly |
| How typically acquired | Known / Estimated | Built over time / acquired via M&A / licensed / hired as a team |
| Why it creates expansion optionality | Known / Estimated | The specific reason possessing this capability makes adjacent problems tractable at low marginal cost |
| Linked companies | — | Companies that have demonstrated this capability |
| Linked implementation patterns | — | Patterns that require this capability to instantiate |
| Expansion problems enabled | — | Which adjacent problems this capability makes tractable |

---

### Solution Pattern (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | Abstract structural approach |
| Evidence count | Computed | |
| Problem(s) (linked) | — | Many-to-many via join table |
| Underlying constraint (linked) | — | FK |
| First observed | Known | Approximate year this structural approach first appeared in any market |
| Pattern durability | Estimated | Emerging / established / decades-old / declining |
| Why this pattern keeps reappearing | Known / Estimated | The structural reason it gets independently reinvented |
| **Winning condition** | Known / Estimated | The structural market condition under which this pattern consistently wins. Required paired with Failure Condition. One transferable sentence without industry-specific language. Carries maturity status and temporal fields. |
| **Failure condition** | Known / Estimated | The explicit logical inverse of Winning Condition at the same abstraction level. Required paired with Winning Condition. |
| **Winning/Failure maturity status** | Computed / Manual | Draft / Proposed / Established |
| **valid_from** | Known / Estimated | Required — a condition without valid_from is incomplete |
| **valid_through** | Known / Estimated | Nullable |
| **superseded_by** | — | Link to replacement pair. Nullable. |
| Linked implementation patterns | — | Many-to-many join table |

---

### Implementation Pattern (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | Specific enough that two companies could instantiate it with meaningfully different execution |
| Evidence count | Computed | |
| Solution pattern (linked) | — | FK |
| Mechanism (linked) | Estimated | Derived — filled last. If ambiguous, apply tiebreaker; if unresolved, record both and log in Boundary Case Catalog. |
| Business model (linked) | — | FK |
| Distribution pattern (linked) | — | FK |
| Status quo displaced (linked) | — | FK to Status Quo Pattern |
| Capabilities required (linked) | — | Many-to-many to Capability |
| Key inputs | Known / Estimated | |
| Output / value created | Known / Estimated | |
| Resource advantage | Known / Estimated | What inputs are structurally painful to replicate |
| Geographic penetration | Known / Estimated | Markets where mature, markets with documented demand but no mature solution, conditions explaining the difference |
| Status | Known | Operating / acquired / dead / pivoted / merged |
| Why this exists now | Known / Estimated | The specific enabler that made this approach possible at this moment |
| Prerequisites | Known / Estimated | Technologies or infrastructure this pattern depends on |
| First observed | Known | Approximate year |
| Initial advantage | Known / Estimated | The specific first move that broke the market open |
| Why incumbents lost | Known / Estimated | The incumbent's specific failure mode that created the opening |
| Moat | Known / Estimated | What prevents replacement today |
| Expansion trajectory | Known / Estimated | The sequence of adjacent problems this pattern moved into, and the capabilities that enabled each move |
| Customer / ICP | Known / Estimated | Who pays — role, size, context |
| Pricing signal | Known | Free / <$100/mo / $1k+/mo / enterprise |
| Push factors | Known / Estimated | Why customers leave the incumbent |
| Pull factors | Known / Estimated | Why customers choose this pattern |
| Why customers don't switch | Known / Estimated | The friction keeping the status quo alive |
| Buying trigger in customer's own words | Known / Estimated | |
| **Failure modes** | | Structured sub-record — see below |
| **Economic Validation** | | Structured sub-record — see below |

#### Failure Modes (sub-record on Implementation Pattern)

| Field | Evidence Label | Notes |
|---|---|---|
| Failure type | Known / Estimated | One of: unit economics / insufficient supply density / insufficient demand density / regulation / customer acquisition cost / timing / technical / competition / execution / capability gap |
| Description | Known / Estimated | One sentence on the specific failure mechanism |
| Source | Known | What grounded this classification |
| Conditions under which this failure mode activates | Known / Estimated | |

#### Economic Validation (sub-record on Implementation Pattern)

| Field | Evidence Label | Notes |
|---|---|---|
| Profitability signal | Known / Estimated / Unknown | Known profitable / Known unprofitable / Estimated profitable (proxy) / Unknown |
| Profitability proxy applied | — | If Estimated profitable (proxy): records whether the no-external-funding + 5-year operating rule was applied. Tier 6 inference. Not equivalent to Known profitable. |
| Years operating | Known / Estimated | |
| Revenue evidence | Known / Estimated / Unknown | Order of magnitude if available |
| Funding dependence | Known / Estimated | Primarily self-sustaining / partially funded / fully externally dependent |
| Publicly reported margins | Known / Unknown | |
| Known shutdowns | Known | Whether any companies instantiating this pattern have shut down |
| Signal confidence | — | High / Low |

---

### Company (Layer 1)

| Field | Evidence Label | Notes |
|---|---|---|
| Company name | — | Identity anchor |
| Implementation patterns (linked) | — | Many-to-many |
| Capabilities (linked) | — | Many-to-many via `possesses` relationship |
| Founded | Known | Year |
| Country | Known | HQ geography |
| Stage | Known | Private / public / acquired / dead |
| Status | Known | Operating / acquired / dead / pivoted |
| Founding team | Known | Brief — relevant expertise only |
| Funding history | Known | Round, amount, year — "none" is a valid and significant entry |
| Acquisition history | Known | Companies acquired |
| Revenue signal | Known / Unknown | Order of magnitude if available |
| Profitability signal | Known / Estimated / Unknown | |
| Signal confidence | — | High / Low |
| **Evidence weight** | — | **Strong validator** — profitable, sustained, self-funded or demonstrably unit-economics positive. **Weak validator** — operating but externally funded with unproven economics. **Disconfirming** — attempted the pattern and failed. **Unknown** — insufficient information. |
| Notable facts | — | Company-specific facts that don't belong on the pattern record |

#### Company Timeline (required sub-record)

| Field | Evidence Label | Notes |
|---|---|---|
| Year | Known | The year this event occurred |
| Event type | Known | Product launch / market entry / acquisition / pivot / shutdown / capability acquisition / funding |
| Description | Known | What specifically changed — concrete, not narrative |
| Implementation pattern (linked) | — | The new pattern entered, if applicable |
| Problem (linked) | — | The new problem addressed, if applicable |
| Capability deployed | — | Which existing capability made this expansion tractable |
| Capability acquired | — | If this event was a capability acquisition |
| Source | Known | What grounds this timeline entry |

---

### Opportunity (Layer 3 — hypothesis)

| Field | Notes |
|---|---|
| Opportunity name | Short descriptive label |
| Problem (linked) | The Layer 2 problem this addresses |
| Existing solution patterns (linked) | What currently exists to solve this problem |
| Recombined patterns (linked) | The specific implementation patterns being recombined or reapplied |
| Observed gap | The specific capability, segment, geography, or price point existing solutions don't serve |
| Gap evidence | What Layer 1 or Layer 2 records or external evidence supports the existence of this gap |
| Evidence strength | Strong (Layer 1 observations) / Moderate (Layer 2 inferences) / Weak (Layer 3 inference) |
| Hypothesis | The proposed implementation pattern |
| Capabilities required | Which Capability nodes this requires — and whether any company currently possesses them |
| Winning condition required | Which structural market condition would need to hold |
| Failure condition to avoid | Which known failure condition from existing records would kill this |
| Status quo to displace | Linked to Status Quo Pattern |
| Open questions | The specific unknowns that must be resolved before this moves from hypothesis to attempt |

---

## Evidence and Provenance

Every non-trivial field carries one of three labels:

- **Known** — directly observed: pricing page, public filing, primary interview, case study
- **Estimated** — reasoned inference from observable behaviour, explicitly labelled
- **Unknown** — not yet established

**Profitability proxy rule:** Where direct profitability evidence is unavailable for a private company, the following proxy may be applied and must be explicitly labelled: a company that has raised no external funding and has operated continuously for 5 or more years is recorded as `Estimated profitable (proxy)`. This is a Tier 6 inference — plausible reasoning, not observation — and carries signal confidence Low. It is not equivalent to Known profitable.

**Acceptable sources in rough order of reliability:** public financial statement / SEC filing → pricing page → founder or operator interview → customer case study → credible third-party reporting (Sacra, Contrary Research) → inference from observable behaviour.

Every typed relationship carries: `confidence` (high / medium / low), `source` (list of grounding records), `notes` (one sentence explaining why asserted).

---

## Query Traceability

The five queries most likely to expose field consistency problems:

**Query 1: "Find every successful expansion path that followed solving a payroll problem"**
Depends on: Company Timeline with `problem (linked)` FK filled on each entry + `capability deployed` filled. The field most likely skipped: `capability deployed`. Without it, the query answers timing but not the why-question, which is the more transferable signal.

**Query 2: "Which mechanisms have consistently produced businesses for 30+ years?"**
Depends on: `first_observed` on Implementation Pattern + `valid_from` on Winning/Failure Condition pairs + `status = Dead` on failed companies. Silently undercounts if disconfirming companies are excluded.

**Query 3: "Which solution patterns exist in Market A but not Market B, where demand in Market B is documented?"**
Depends on: `geographic_penetration` on Implementation Pattern filled with specific markets, not "global." The "documented demand but no mature solution" sub-field must be actively recorded with a source.

**Query 4: "What adjacent problem do payment infrastructure companies typically enter after reaching scale, and how many years after founding does it happen?"**
Depends on: consistent Problem node naming (no fragmentation across synonyms) + Timeline entries with `problem (linked)` + `capability deployed` + `founded` on Company.

**Query 5: "Which capabilities are required by the most implementation patterns but possessed by the fewest companies?"**
Depends on: `capabilities_required` on Implementation Pattern AND `possesses` relationships on Company — both of which require judgment and are easy to skip. Capability names must be deduplicated rigorously (controlled vocabulary).

---

## Phased Approach

The dataset does not become useful all at once. These phases define what to build and when, so momentum is preserved and each phase generates analytical value before the next begins.

### Phase 1 — Solo, first 100 records (Months 1–6)

**Goal:** Establish the ontology in one domain. Prove the abstraction tests work. Calibrate the MVR time budget.

**Domain:** HR tech / payroll (as justified above).

**Protocol:** Enter MVR-only records. Do not fill enrichment fields. Do not attempt cross-cutting node linkages beyond Implementation Pattern and Problem stubs. Focus on data entry speed and consistency, not completeness.

**Output at phase end:** 100 company records, each with a valid MVR, distributed across 4–6 implementation patterns. The abstraction tests should resolve 90%+ of classification decisions without needing the Boundary Case Catalog. If not, the ontology needs refinement before Phase 2.

**What you can query at phase end:** Single-domain pattern clustering. The payroll expansion sequence. Business model convergence within implementation patterns. The Zenefits/Rippling failure-to-corrected-version sequence.

### Phase 2 — Enrich and expand (Months 6–18)

**Goal:** Enrich Phase 1 records with full enrichment fields. Expand to 2–3 adjacent domains. Begin cross-industry Winning/Failure Condition work.

**Domains to add:** B2B payments infrastructure (Stripe, Adyen, Checkout.com, etc.) and developer tools infrastructure (GitHub, Vercel, Cloudflare, etc.). Both are well-documented with clear expansion trajectories.

**Protocol:** Alternate between enriching Phase 1 records and entering MVR-level records in new domains. Mechanism assignment and Winning/Failure Condition pairs should be attempted only after 3+ company observations exist per pattern.

**Output at phase end:** 300–500 records across 3–4 domains. First cross-industry pattern queries become viable.

### Phase 3 — Cross-industry intelligence (Months 18+)

**Goal:** Reach the scale where cross-industry pattern queries return statistically meaningful results. Begin systematic Opportunity generation.

**Protocol:** Broaden data entry. Add VC portfolio sweeps (YC, a16z, Sequoia). Add disconfirming companies actively. Run Opportunity generation queries quarterly.

**Output at phase end:** 1,000+ records. All priority queries from the Purpose section return meaningful results. Opportunity records are grounded in multi-domain evidence.

---

## Technical Architecture

### Design Priorities

In order: **simplicity, development speed, collaboration, scalability, maintenance ease**. Every tool decision is evaluated against this stack. A more powerful tool that requires 3× the setup and maintenance time loses.

---

### Layer 1: Database

**Decision: PostgreSQL via Supabase.**

PostgreSQL is the only reasonable choice. The brief explicitly specifies a relational database with foreign keys, typed join tables, and graph traversal via recursive CTEs. PostgreSQL is the strongest open-source relational database with native support for all of these, plus recursive CTEs (for graph traversal), materialized views (for computed `evidence_count` fields), pg_trgm (for fuzzy matching and deduplication), ENUM types (for evidence labels and status fields), and JSONB (for flexible metadata fields).

Supabase wraps PostgreSQL with managed hosting, authentication, row-level security, auto-generated REST and GraphQL APIs (via PostgREST), a built-in table editor, and real-time subscriptions — all without running your own infrastructure. 55% of Y Combinator companies choose Supabase. It is production-ready for this workload. The only limitation to note: the free tier pauses projects after a week of inactivity. Use the $25/month Pro plan from the moment you want always-on access.

**Supabase gives you everything the data layer needs with zero infrastructure to maintain.** The data stays in standard PostgreSQL. If you ever need to migrate off Supabase, you export a standard PostgreSQL dump and point any client at a new host. No vendor lock-in at the data layer.

**Key PostgreSQL features to enable immediately:**

```sql
-- Fuzzy matching for deduplication checking
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums for evidence labels and status fields
CREATE TYPE evidence_label AS ENUM ('known', 'estimated', 'unknown');
CREATE TYPE evidence_weight AS ENUM ('strong_validator', 'weak_validator', 'disconfirming', 'unknown');
CREATE TYPE company_status AS ENUM ('operating', 'acquired', 'dead', 'pivoted', 'merged');
CREATE TYPE profitability_signal AS ENUM (
  'known_profitable', 'known_unprofitable',
  'estimated_profitable_proxy', 'unknown'
);
CREATE TYPE relationship_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE maturity_status AS ENUM ('draft', 'proposed', 'established');
CREATE TYPE timeline_event_type AS ENUM (
  'product_launch', 'market_entry', 'acquisition',
  'pivot', 'shutdown', 'capability_acquisition', 'funding'
);

-- Materialized view for evidence_count on Solution Pattern
CREATE MATERIALIZED VIEW solution_pattern_evidence_count AS
  SELECT sp.id, COUNT(DISTINCT c.id) as evidence_count
  FROM solution_pattern sp
  JOIN implementation_pattern ip ON ip.solution_pattern_id = sp.id
  JOIN company_implementation_pattern cip ON cip.implementation_pattern_id = ip.id
  JOIN company c ON c.id = cip.company_id
  GROUP BY sp.id;

-- Refresh on demand (add to cron job or trigger as data grows)
REFRESH MATERIALIZED VIEW solution_pattern_evidence_count;
```

**Recursive CTE for graph traversal (example — "show all companies within two hops of a given implementation pattern"):**

```sql
WITH RECURSIVE pattern_graph AS (
  -- Base case: direct instantiations
  SELECT ip.id, ip.name, 0 AS depth
  FROM implementation_pattern ip
  WHERE ip.id = $1

  UNION ALL

  -- Recursive case: adjacent patterns via shared solution pattern or capability
  SELECT ip2.id, ip2.name, pg.depth + 1
  FROM pattern_graph pg
  JOIN implementation_pattern ip2
    ON ip2.solution_pattern_id = (
      SELECT solution_pattern_id FROM implementation_pattern WHERE id = pg.id
    )
  WHERE pg.depth < 2
)
SELECT DISTINCT id, name, depth FROM pattern_graph ORDER BY depth, name;
```

**Deduplication check on Problem insert (using pg_trgm similarity):**

```sql
-- Before inserting a new Problem node, check for near-duplicates
SELECT id, problem_statement,
       similarity(problem_statement, $1) AS sim
FROM problem
WHERE similarity(problem_statement, $1) > 0.6
ORDER BY sim DESC
LIMIT 5;
-- If results return, review before creating a new record.
```

---

### Layer 2: Schema Management and Type Safety

**Decision: Drizzle ORM.**

The schema has complex many-to-many relationships, recursive queries, and computed fields. The ORM must produce transparent, predictable SQL — no hidden N+1 queries, no query planner surprises on joins. Drizzle's API maps nearly 1:1 to SQL, which matters when writing the priority queries (recursive CTEs, window functions, multi-join aggregations).

Drizzle has no generation step — you define the schema in TypeScript and types are immediately available, with no `prisma generate` needed after every schema change. For a schema that will be iterated frequently as the ontology self-corrects, this removes constant friction. Bundle size is ~7.4KB vs Prisma's ~1.6MB (even post-Prisma 7), which matters if the frontend ever runs server-side queries in an edge environment.

Prisma 7 has closed the performance gap significantly, and either is technically viable. Drizzle wins here because **this project has complex joins and requires SQL transparency** — the Drizzle benchmark page documents that complex reporting queries with CTEs, window functions, or lateral joins map nearly 1:1 from SQL to Drizzle's API, while Prisma's abstraction breaks down on these cases and requires `$queryRaw` fallbacks.

**Schema definition example (core tables):**

```typescript
import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const evidenceLabelEnum = pgEnum('evidence_label', ['known', 'estimated', 'unknown']);
export const evidenceWeightEnum = pgEnum('evidence_weight', [
  'strong_validator', 'weak_validator', 'disconfirming', 'unknown'
]);
export const companyStatusEnum = pgEnum('company_status', [
  'operating', 'acquired', 'dead', 'pivoted', 'merged'
]);

export const company = pgTable('company', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  founded: integer('founded'),
  country: text('country'),
  status: companyStatusEnum('status').notNull(),
  stage: text('stage'),
  fundingHistory: text('funding_history'),           // structured JSON string
  revenueSignal: text('revenue_signal'),             // '<10M' | '10-100M' | '100M-1B' | '>1B' | null
  profitabilitySignal: text('profitability_signal'),
  evidenceWeight: evidenceWeightEnum('evidence_weight').notNull(),
  signalConfidence: text('signal_confidence'),       // 'high' | 'low'
  notableFacts: text('notable_facts'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const companyTimeline = pgTable('company_timeline', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => company.id).notNull(),
  year: integer('year').notNull(),
  eventType: text('event_type').notNull(),           // uses timeline_event_type enum
  description: text('description').notNull(),
  implementationPatternId: text('implementation_pattern_id'),
  problemId: text('problem_id'),
  capabilityDeployed: text('capability_deployed'),
  capabilityAcquired: text('capability_acquired'),
  source: text('source').notNull(),
});

// Many-to-many: Company <-> ImplementationPattern
export const companyImplementationPattern = pgTable('company_implementation_pattern', {
  companyId: text('company_id').references(() => company.id).notNull(),
  implementationPatternId: text('implementation_pattern_id').notNull(),
  confidence: text('confidence'),
  source: text('source'),
  notes: text('notes'),
});
```

**Migrations** are managed with Drizzle Kit:
```bash
npx drizzle-kit generate  # generates SQL migration from schema diff
npx drizzle-kit migrate   # applies migration to database
npx drizzle-kit studio    # opens Drizzle Studio (visual database browser)
```

---

### Layer 3: Data Entry Interface

**Decision: Phased — Supabase Table Editor first, then custom Next.js app.**

The data entry protocol is highly opinionated: bottom-up entry sequence, mandatory abstraction tests, fuzzy deduplication checking before creating new pattern nodes, mechanism assignment last. No off-the-shelf tool (Directus, Airtable, Retool) enforces this workflow. A custom interface is ultimately necessary.

But it is not necessary on Day 1.

**Phase 1 — Supabase Table Editor + SQL (Months 1–6, 0 cost)**

The Supabase dashboard includes a table editor adequate for solo MVR-level data entry. It supports: row creation, foreign key dropdowns, filtering, and direct SQL queries via the SQL editor. For the first 100 records entered by one person who has internalised the abstraction tests, this is sufficient. Do not spend engineering time building a frontend before the ontology is stable.

The critical discipline during Phase 1: run the deduplication query manually before creating any new Problem, Solution Pattern, Implementation Pattern, Mechanism, or Capability record. Paste the proposed name into the pg_trgm similarity query and check for near-matches. This takes 30 seconds and prevents silent inconsistency.

**Phase 2 — Custom Next.js App (Months 6+, when adding collaborators)**

Once a second contributor joins or the ontology is stable enough to codify as a guided workflow, build a lightweight custom frontend. This is the point where the investment pays off.

**Stack:**
- **Next.js 14+** (App Router, TypeScript) — React meta-framework with file-based routing, server components for data fetching without client-side API calls, and excellent TypeScript support. The dominant choice for TypeScript full-stack applications; 55% of YC companies use it.
- **shadcn/ui** — component library built on Radix UI primitives. Accessible, unstyled by default, installed per-component (no full library import). Best-in-class for building internal tools without design overhead.
- **Drizzle ORM** — same ORM used server-side for all database queries.
- **Supabase Auth** — authentication with row-level security on the database.

**Key screens to build, in priority order:**

1. **Company entry form** — implements the MVR entry sequence as a guided multi-step form. Step 1: core fields. Step 2: Timeline entries (minimum 2). Step 3: Implementation Pattern link (search existing or create stub). Step 4: Problem link (search existing or create stub). Deduplication check runs automatically on pattern name inputs via pg_trgm before allowing new record creation.

2. **Pattern search and link** — a searchable list of existing Implementation Patterns and Problems with fuzzy matching, so contributors can find existing records instead of creating duplicates.

3. **Boundary Case Catalog** — a simple form for logging ambiguous classification decisions, with fields for: company name, options considered, chosen option, one-sentence reason, date.

4. **Query dashboard** — the priority queries from the Purpose section, implemented as saved queries and displayed as tables. This is what makes the dataset useful for idea generation.

**The query dashboard is the payoff screen.** Every priority query from the Purpose section should be a saved, runnable query that returns a formatted table. The queries run directly against Supabase PostgreSQL via server components — no separate API layer needed.

---

### Layer 4: Analytics and Query Interface

**Decision: Metabase Community Edition, self-hosted on Railway.**

For querying the dataset beyond the custom dashboard, Metabase is the right tool. It connects directly to PostgreSQL, supports both visual (no-SQL) query building and raw SQL, and now ships with an AI assistant on all plans including the open-source edition (bring-your-own Anthropic API key). Non-technical collaborators can run queries without writing SQL. The priority queries from the Purpose section can be saved as Metabase Questions and shared as a collection.

Metabase Community Edition is free and open-source. Self-host it on Railway's free tier (sufficient for low-traffic internal tooling) using the official Metabase Docker image. The setup takes approximately 30 minutes.

```bash
# docker-compose.yml for Metabase self-hosted
version: '3'
services:
  metabase:
    image: metabase/metabase:latest
    ports:
      - "3001:3000"
    environment:
      MB_DB_TYPE: postgres
      MB_DB_DBNAME: metabase
      MB_DB_PORT: 5432
      MB_DB_USER: ${MB_DB_USER}
      MB_DB_PASS: ${MB_DB_PASS}
      MB_DB_HOST: ${MB_DB_HOST}
```

Connect Metabase to the Supabase PostgreSQL connection string (available in Supabase dashboard → Settings → Database → Connection string). All priority queries are immediately writable via Metabase's SQL editor.

**Note:** Metabase's free tier does not include embedding or multi-tenant access controls. For this project — a private internal tool — this is irrelevant.

---

### Layer 5: Infrastructure and Hosting

| Component | Tool | Tier | Cost |
|---|---|---|---|
| Database | Supabase | Pro ($25/month) | $25/month |
| Frontend | Vercel | Hobby (free) → Pro ($20/month) | $0–$20/month |
| Analytics | Railway (Metabase Docker) | Hobby ($5/month) | $5/month |
| Schema management | Drizzle Kit (local CLI) | Free | $0 |
| Version control | GitHub | Free | $0 |

**Total at Phase 1:** $0 (Supabase free tier is sufficient for solo work; pauses after inactivity, acceptable for early stage).

**Total at Phase 2+:** $30–$50/month for always-on database + analytics + frontend.

This is the cost profile of an internal research tool, not a SaaS product. It scales linearly with data volume rather than user count.

---

### Development Workflow

**Repository structure:**

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── companies/          # Company entry and list views
│   │   ├── patterns/           # Implementation + Solution Pattern views
│   │   ├── problems/           # Problem node views
│   │   ├── queries/            # Priority query dashboard
│   │   └── boundary-cases/     # Boundary Case Catalog
│   ├── components/             # Reusable UI components (shadcn/ui)
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema definition (single source of truth)
│   │   ├── migrations/         # Generated SQL migrations
│   │   └── queries/            # Named, reusable query functions
│   └── lib/
│       ├── deduplication.ts    # pg_trgm similarity check functions
│       ├── evidence.ts         # Evidence weight computation logic
│       └── supabase.ts         # Supabase client
├── drizzle.config.ts
├── .env.local                  # Supabase URL + anon key + service role key
└── package.json
```

**The schema file is the single source of truth for the data model.** Every table, enum, relationship, and index is defined in `src/db/schema.ts`. Running `drizzle-kit generate` produces a SQL migration. Running `drizzle-kit migrate` applies it to the Supabase database. The TypeScript types in the application are inferred directly from the schema — no separate type definitions, no generation step.

**Local development:**

```bash
npm create next-app@latest economic-pattern-db -- --typescript --tailwind --app
cd economic-pattern-db
npm install drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit
npx shadcn@latest init
```

**Environment variables:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

---

### What Is Explicitly Not Included and Why

**Graph database (Neo4j, etc.):** The schema projects cleanly into PostgreSQL with recursive CTEs. A graph database adds significant operational complexity (separate infrastructure, separate query language, synchronisation with the relational store) for queries that PostgreSQL handles adequately at this dataset's scale. Revisit if query performance becomes a problem after 50,000+ records — not before.

**Vector database (Pinecone, Weaviate):** Not needed until semantic search across unstructured text fields becomes a priority. The pg_trgm fuzzy matching extension handles deduplication at this scale. Supabase includes pgvector if this becomes relevant later.

**Separate ETL pipeline:** All data entry is manual. No pipeline needed. If bulk imports from external sources become necessary (VC portfolio scrapes, Crunchbase API), write a simple TypeScript script using the Drizzle ORM and run it locally. No pipeline infrastructure required.

**Redis or separate cache:** Supabase handles connection pooling. Materialized views handle expensive computed fields. No separate cache layer needed at this scale.

**Docker for local development:** Not necessary. The Drizzle schema runs against the Supabase cloud database even in local development. Metabase is the only self-hosted component and it runs in Docker on Railway, not locally.

---

### Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    DATA ENTRY                           │
│  Phase 1: Supabase Table Editor (free, zero setup)      │
│  Phase 2: Next.js app (guided MVR workflow, shadcn/ui)  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                       │
│  PostgreSQL via Supabase Pro ($25/month)                │
│  - pg_trgm: deduplication checking                      │
│  - Materialized views: evidence_count computation       │
│  - Recursive CTEs: graph traversal                      │
│  - ENUM types: evidence labels, status fields           │
│  - Row-level security: multi-contributor access         │
│  Schema managed by Drizzle ORM (TypeScript source)      │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌───────────────────────────────┐
│  ANALYTICS LAYER     │  │  APPLICATION LAYER            │
│  Metabase OSS        │  │  Next.js (App Router, TS)     │
│  Railway ($5/month)  │  │  Vercel ($0–$20/month)        │
│  Priority queries    │  │  Priority query dashboard     │
│  saved as Questions  │  │  Boundary Case Catalog        │
│  AI assistant        │  │  Drizzle ORM queries          │
│                      │  │  Supabase Auth                │
└──────────────────────┘  └───────────────────────────────┘
```

**Total monthly cost at scale: $30–$50. Total setup time for Phase 1 (database + schema + Metabase): under 4 hours.**

The critical constraint is not technical — it is ontological consistency at data entry time. The tools above are as simple as they can be while supporting the protocol the brief requires. The investment is in the data, not the infrastructure.