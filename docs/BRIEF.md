# Economic Pattern Database — Project Brief

## Table of Contents

1. [Purpose](#purpose)
2. [The Three Layers](#the-three-layers)
3. [Core Design Principles](#core-design-principles)
4. [Minimum Viable Record](#minimum-viable-record)
5. [Data Entry Protocol](#data-entry-protocol)
6. [Boundary Case Catalog](#boundary-case-catalog)
7. [Abstraction Tests](#abstraction-tests)
8. [Canonical Relationship Vocabulary](#canonical-relationship-vocabulary)
9. [The Ontology](#the-ontology)
10. [Entity Fields](#entity-fields)
11. [Evidence and Provenance](#evidence-and-provenance)
12. [Query Traceability](#query-traceability)
13. [Companion Documents](#companion-documents)

---

## Purpose

A knowledge graph of recurring economic problems, the solution patterns that emerge to solve them, and the structural mechanisms through which businesses create, capture, defend, and expand economic value. Companies are empirical observations used to construct and continuously refine the ontology — not the primary subject of analysis.

If a company disappeared tomorrow, almost nothing in this dataset should change — the problem persists, the mechanism persists, the customers persist, and another company occupies the implementation slot. That is the philosophical core of the project and it governs every structural decision below.

The goal is not to catalogue companies. It is to understand how value is consistently created, captured, and defended. The objective is to identify **transferable mechanisms and winning conditions** — the structural patterns that explain why certain solutions succeed in certain market conditions, regardless of which company instantiates them. At sufficient scale, the dataset shifts from describing businesses to extracting reusable laws about how businesses succeed.

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
- Find every successful expansion path that followed solving a payroll problem.
- Find mechanisms that repeatedly emerged after regulatory change.
- Find problems where every surviving solution converged on the same business model.
- Which recorded opportunities have the strongest evidence base and the fewest existing solutions?
- Which solution patterns exist in Market A but not Market B, where demand in Market B is documented?
- What adjacent problem do payment infrastructure companies typically enter after reaching scale, and how many years after founding does it happen?
- Which capabilities most commonly enable expansion into adjacent problems?
- Which capabilities are required by the most implementation patterns but possessed by the fewest companies?

---

## The Three Layers

The dataset is strictly organised into three layers that must never be mixed.

**Layer 1 — Observation.** Directly recorded facts about things that exist or have existed. These are looked up, not inferred. Entities: Company, Company Timeline, pricing, funding, geography, revenue and profit evidence, sources. Evidence label: Known or Unknown only.

**Layer 2 — Derived Abstractions.** Interpretations constructed by induction from accumulated Layer 1 observations. These are models, not facts. Entities: Problem, Solution Pattern, Implementation Pattern, Mechanism, Underlying Constraint, Winning Condition, Failure Condition, Capability, Status Quo Pattern, Business Model, Distribution Pattern. Evidence label: Known / Estimated / Unknown. A derived abstraction cannot be asserted without at least one grounding Layer 1 observation. Every Layer 2 entity carries an `evidence_count` tracking the number of distinct Company records that ground it.

**Layer 3 — Hypotheses.** Structured speculation about things that might be built. Entities: Opportunity. Every field is explicitly a hypothesis linked to Layer 1 or Layer 2 evidence. Hypotheses are never promoted into Layer 2 without grounding observations.

---

## Core Design Principles

**If a company disappeared tomorrow, almost nothing should change.** The problem persists, the mechanism persists, the customers persist. This test governs every structural decision. If removing a company would require changing an abstraction, the abstraction is too close to the company.

**The ontology is inductive, not predefined.** Higher-order abstractions are inferred from accumulated company observations, not defined in advance. Every abstract claim must be grounded in at least one company observation before it is entered.

**Companies are evidence, not the object of study.** Every company record exists to ground a pattern claim in observable reality. The analytical unit is the pattern, not the company.

**Consistency of classification over theoretical completeness.** A schema that is 90% as expressive but enables consistent classification across 10,000 companies is more valuable than a perfectly elegant ontology that becomes ambiguous after a few hundred records. When the same company could be plausibly classified two different ways, that is a schema problem, not a contributor problem.

**Profitability as signal, not filter.** Evidence of sustained profitability is one of the strongest available signals of genuine market validation. Funding, valuation, and user growth measure investor conviction rather than proven economic sustainability. Where direct profitability data is unavailable, a proxy rule applies: a company that has raised no external funding and has operated continuously for 5 or more years is recorded as Estimated profitable. This is Tier 6 inference and must be labelled explicitly.

**The status quo is always a competitor.** The dataset assumes customers always have a solution — Excel, email, hiring a person, doing nothing. Every problem node must identify the status quo before any commercial solutions are recorded.

**Breadth and consistency over depth.** Every field must be answerable from publicly available information within a reasonable research budget per record.

**Evidence strength is field-level.** Every non-trivial field carries a label: Known / Estimated / Unknown.

**Mechanisms are interpreted, not observed.** Mechanisms carry Estimated by default. When two mechanisms are both plausible, assign the one that explains why customers pay, not the one that describes how the product technically operates.

**Winning Condition and Failure Condition are required as a logical pair.** Both must be filled together or left empty together. The failure condition must be the explicit logical inverse of the winning condition at the same level of abstraction. The pair carries a maturity status — Draft, Proposed, or Established.

**Temporal decay is explicit.** Winning Conditions change as markets mature. The schema attaches `valid_from`, `valid_through`, and `superseded_by` to every Winning/Failure Condition pair. A condition without `valid_from` is incomplete.

**Time is a first-class dimension.** Company Timeline is a required sub-record on every Company entry. The sequence and timing of expansion moves are among the richest signals in the dataset.

**Capability reuse explains expansion more reliably than problem adjacency.** Companies expand not only because adjacent problems exist but because they possess capabilities that make specific expansions tractable at low marginal cost.

**Abstract concepts are added when data demands them, not before.** If a concept cannot be grounded in multiple independent company observations at the time of proposal, defer it.

---

## Minimum Viable Record

### The Governing Test

The Minimum Viable Record (MVR) is the smallest set of fields that keeps a record analytically useful — contributing to pattern queries — while remaining consistently fillable from public information in under 60 minutes per company.

**A field is in the MVR if both conditions hold:**
1. It is consistently available from public sources in under 60 minutes, for both well-funded and bootstrapped private companies.
2. Leaving it blank prevents at least one priority query from returning meaningful results at scale.

A record that satisfies the MVR with stub links to patterns is a valid, useful, incomplete record.

### MVR Field Set

| Field | Evidence Label | Why It Is MVR |
|---|---|---|
| Company name | — | Identity anchor |
| Founded year | Known | Required for all temporal queries |
| Country / HQ | Known | Required for geographic whitespace queries |
| Status | Known | Without this, survivor bias corrupts every pattern query |
| Stage | Known | Affects evidence weight interpretation |
| Funding history | Known | "None" + 5+ years triggers the profitability proxy |
| Revenue signal | Known / Estimated / Unknown | Required for evidence weight assignment |
| Profitability signal | Known / Estimated / Unknown | Required to separate strong from weak validators |
| Evidence weight | — | Computed from profitability signal + status |
| Signal confidence | — | Separates public-financials-backed from proxy-backed claims |
| Implementation pattern link | — | Without this, the company cannot contribute to any pattern query |
| Problem link | — | Without this, the company cannot be grouped into problem clusters |
| Timeline (≥2 entries) | Known | Without Timeline, no temporal query works |

Everything else is enrichment.

### Time Budget

- Well-documented company (public, YC-backed, analyst coverage): 30–45 min
- Moderately documented (Series A–C, Crunchbase coverage): 45–60 min
- Poorly documented (bootstrapped, minimal press): 60–90 min

---

## Data Entry Protocol

**The ontology reads top-down. Data entry runs bottom-up.**

Every record begins with a company. You encounter Stripe before you abstract "API-first developer payment infrastructure" as an implementation pattern, abstract that before you identify "payment infrastructure" as the solution pattern, and abstract that before you identify "businesses cannot accept online payments" as the problem node.

### MVR Entry Sequence

1. **Fill the Company record.** Name, founded, country, status, stage, funding history, revenue signal, profitability signal, evidence weight, signal confidence.
2. **Add at least two Timeline entries.** Founding event + one significant expansion. Each entry: year, event type, description, implementation pattern linked (stub if new).
3. **Link to one Implementation Pattern.** If an existing pattern matches, link to it. If not, create a stub: name only.
4. **Link to one Problem.** If an existing problem matches, link to it. If not, create a stub: problem statement only.

A record satisfying steps 1–4 is a valid MVR.

### Enrichment Sequence (after MVR is complete)

5. **Enrich the Implementation Pattern.** Fill business model, status quo displaced, capabilities required, moat, customer/ICP.
6. **Enrich the Solution Pattern.** Fill winning and failure condition pair (as Draft), fill valid_from.
7. **Assign cross-cutting nodes.** Link to Business Model, Distribution Pattern, Status Quo Pattern, Capability.
8. **Fill Mechanism last.** Mechanism is derived — fill only after all other fields are complete. Apply the tiebreaker rule.
9. **Fill Winning and Failure Condition as a pair.** Fill together or not at all. Assign maturity status and valid_from.

### Layer 1 interpretation principle

Every Layer 1 field where judgment was required should include the raw source alongside the interpreted value. When you had to think about which value to use, write what you thought in `notable_facts`. The record is both data and reasoning log simultaneously. See `docs/interpretation-across-layers.md`.

---

## Boundary Case Catalog

Every time a genuine ambiguity arises — a company that could plausibly sit under two different Solution Patterns, or a mechanism assignment the tiebreaker rule does not settle — the case is documented in the Boundary Case Catalog (`data/_vocab/boundary-cases.yaml`).

**Before creating a new implementation pattern, mechanism assignment, or winning condition, search the catalog.** Not for an identical case but for the nearest analogous decision. The catalog is the primary calibration reference. The abstraction tests are the statutes. The catalog is the case law.

Each entry records: the company or companies involved, the two options considered, the specific structural difference that decided it, the option chosen and why, and any dissenting reasoning that was considered.

Entries that say "we chose Pattern A because it fits better" are not useful. Entries that cite the concrete operational fact that made the difference are useful.

The catalog is reviewed periodically. If the same boundary is hit more than three times in different directions, the abstraction test needs a new worked example.

---

## Abstraction Tests

### Underlying Constraint

**Test:** Is this a structural reason a problem persists — stated without reference to any solution? If removing it would dissolve the problem entirely, it is a constraint.

**Canonical example:** "information asymmetry" — one party knows something the other needs to transact efficiently.

**Counterexample:** "no API exists" — this is a technical gap, not a structural constraint.

---

### Problem

**Test:** Is this a specific, recurring pain a customer experiences, stated in the customer's language without reference to any solution?

**Canonical example:** "Businesses cannot calculate, withhold, and disburse employee wages while remaining compliant with tax and labour regulations."

**Counterexample:** "Businesses need payroll software" — implies a solution.

---

### Solution Pattern

**Test:** Could multiple meaningfully different implementations exist under this name? If yes, it is at the right level. If only one implementation is conceivable, it belongs at Implementation Pattern level.

**Canonical example:** "Payroll infrastructure" — bureau outsourcing, cloud SaaS, enterprise HCM, and embedded APIs all fit.

**Counterexample:** "Per-employee-per-month cloud payroll SaaS for US SMBs" — only one class fits.

---

### Implementation Pattern

**Test:** Could two companies instantiate this pattern with meaningfully different execution while still fitting the description?

**Canonical example:** "Cloud-native SMB payroll SaaS" — Gusto, Paycom, Paylocity, and BambooHR all fit while differing substantially.

**Counterexample:** "Gusto's accountant-first referral channel combined with embedded payroll API" — a Company fact, not a pattern.

---

### Mechanism

**Test:** Does this mechanism apply equally to companies in at least three unrelated industries without restatement?

**Canonical example:** "matching" — applies to ride-hailing, home rental, freelance labour, and handmade goods without modification.

**Counterexample:** "two-sided marketplace for gig workers" — this is an Implementation Pattern. The mechanism is "matching."

**Tiebreaker rule:** When two mechanisms are both plausible, assign the one that explains why customers pay, not the one that describes how the product technically operates. Document the case in the Boundary Case Catalog either way.

---

### Winning Condition / Failure Condition

**Test:** Is this condition transferable to a completely unrelated industry without modification? Is the failure condition the direct logical inverse of the winning condition at the same abstraction level?

**Canonical example:**
- Winning: "supply is fragmented enough that search costs exceed switching costs."
- Failure: "supply consolidates to the point where incumbents can serve demand directly, eliminating search cost as a driver."

**Maturity status:**
- **Draft** — fewer than 2 grounding observations or symmetry not verified
- **Proposed** — 2+ observations, symmetry verified, not yet cross-industry tested
- **Established** — 3+ observations across 2+ unrelated industries, transferability confirmed

---

### Capability

**Test:** Is this something a company built or acquired that is hard to replicate quickly and that makes specific expansion moves tractable at low marginal cost?

**Canonical example:** "banking integrations and regulatory expertise" — built over years, directly enabled expansion into Treasury, Issuing, and Capital.

**Counterexample:** "good engineering team" — not a specific capability in this schema.

---

## Canonical Relationship Vocabulary

All typed relationships use the following controlled vocabulary. Every relationship carries: `confidence` (high / medium / low), `source` (grounding records), `notes` (one sentence explaining why asserted).

### Problem relationships
`solved_by` → Solution Pattern · `enables` → Problem · `prerequisite_for` → Problem · `causes` → Problem · `blocks` → Problem · `substitutes` → Problem · `depends_on` → Problem · `complements` → Problem · `creates` → Problem · `automates` → Problem · `replaces` → Problem

### Solution Pattern relationships
`implemented_by` → Implementation Pattern · `rooted_in` → Underlying Constraint · `succeeds_when` → Winning Condition *(paired with fails_when)* · `fails_when` → Failure Condition *(paired with succeeds_when)* · `direct_competitor` → Solution Pattern · `alternative_approach` → Solution Pattern · `adjacent` → Solution Pattern · `evolved_into` → Solution Pattern · `preceded_by` → Solution Pattern

### Implementation Pattern relationships
`instantiated_by` → Company · `uses_mechanism` → Mechanism *(Estimated by default)* · `monetised_by` → Business Model · `distributed_by` → Distribution Pattern · `displaces` → Status Quo Pattern · `requires` → Capability · `built_on` → Implementation Pattern · `failed_competitor` → Implementation Pattern

### Company relationships
`instantiates` → Implementation Pattern · `possesses` → Capability · `acquired` → Company · `acquired_by` → Company · `spin_out_of` → Company · `pivoted_from` → Implementation Pattern

### Capability relationships
`possessed_by` → Company · `required_by` → Implementation Pattern · `enables_expansion_to` → Problem

### Opportunity relationships
`addresses` → Problem · `recombines` → Solution Pattern · `displaces` → Status Quo Pattern · `requires_winning_condition` → Winning Condition · `avoids_failure_condition` → Failure Condition

---

## The Ontology

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

                           ▼
┌──────────────────────────────────────────────────────┐
│              Opportunity (Layer 3)                   │
│  [derived or interpretive · predictions · lens]      │
└──────────────────────────────────────────────────────┘
```

---

## Entity Fields

### Problem (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Problem statement | — | Customer's language — no solution implied |
| Evidence count | Computed | Distinct Company records grounding this problem |
| Customer segment variations | Known / Estimated | How constraints, urgency, and status quo differ by segment |
| Underlying constraint (linked) | — | FK to Underlying Constraint node |
| Status quo pattern (linked) | — | FK to Status Quo Pattern node |
| Frequency | Known / Estimated / Unknown | Daily / weekly / monthly / annually / once |
| Urgency | Known / Estimated / Unknown | High / medium / low |
| Existing spend | Known / Estimated / Unknown | Order of magnitude |
| Switching cost | Known / Estimated / Unknown | High / medium / low — one-line reason |
| Why status quo persists | Known / Estimated | The specific inertia holding it in place |
| Triggers | Known / Estimated | Events pushing customer from passive to active search |
| Why now | Known / Estimated | The unlock making this newly solvable |
| Lifecycle | Estimated | Emerging / growing / mature / declining / dead |
| Linked solution patterns | — | Many-to-many join table |

---

### Solution Pattern (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | Abstract structural approach |
| Evidence count | Computed | |
| Problem(s) (linked) | — | Many-to-many via join table |
| First observed | Known | Approximate year this approach first appeared |
| Pattern durability | Estimated | Emerging / established / decades-old / declining |
| **Winning condition** | Known / Estimated | One transferable sentence. Required paired with Failure Condition. |
| **Failure condition** | Known / Estimated | Direct logical inverse of Winning Condition. |
| **Maturity status** | Computed / Manual | Draft / Proposed / Established |
| **valid_from** | Known / Estimated | Required — a condition without valid_from is incomplete |
| **valid_through** | Known / Estimated | Nullable |
| **superseded_by** | — | Link to replacement pair. Nullable. |
| Linked implementation patterns | — | Many-to-many join table |

---

### Implementation Pattern (Layer 2)

| Field | Evidence Label | Notes |
|---|---|---|
| Pattern name | — | Specific enough that two companies could instantiate it differently |
| Evidence count | Computed | |
| Solution pattern (linked) | — | FK |
| Mechanism (linked) | Estimated | Derived — filled last |
| Business model | — | |
| Status quo displaced | — | FK to Status Quo Pattern |
| Capabilities required | — | Many-to-many to Capability |
| Status | Known | live / dead / niche |
| First observed | Known | Approximate year |
| Moat | Known / Estimated | What prevents replacement today |
| Expansion trajectory | Known / Estimated | Sequence of adjacent problems entered, with capabilities enabling each |
| Customer / ICP | Known / Estimated | Who pays — role, size, context |
| Pricing signal | Known | Free / <$100/mo / $1k+/mo / enterprise |

---

### Company (Layer 1)

| Field | Evidence Label | Notes |
|---|---|---|
| Company name | — | Identity anchor |
| Founded | Known | Year of first revenue under current mission. Store legal incorporation year separately in `founded_legal` if different. |
| Country | Known | HQ geography |
| Status | Known | Operating / acquired / dead / pivoted / merged |
| Stage | Known | Public / unicorn / series A–G / bootstrapped / YC |
| Funding history | Known | Round, amount, year — "none" is a valid and significant entry |
| Revenue signal | Known / Estimated / Unknown | Order of magnitude: <10M / 10-100M / 100M-1B / >1B |
| Revenue raw | Known / Estimated | Verbatim estimate before bucketing. e.g. "Sacra estimates $975M 2025" |
| Profitability signal | Known / Estimated / Unknown | Known profitable / unprofitable / estimated proxy / unknown |
| Evidence weight | — | Strong validator / Weak validator / Disconfirming / Unknown |
| Signal confidence | — | High / Low |
| Research queue source | — | Format: QUEST_TYPE:pattern-slug or OFF_QUEUE:reason. See candidate-selection.md. |
| Notable facts | — | Company-specific facts that don't belong on the pattern record. Also used as reasoning log for non-obvious field classifications. |

#### Company Timeline (required sub-record)

| Field | Evidence Label | Notes |
|---|---|---|
| Year | Known | The year this event occurred |
| Event type | Known | founding / product_launch / market_entry / acquisition / pivot / shutdown / capability_acquisition / funding |
| Description | Known | What specifically changed — concrete, not narrative |
| Implementation pattern (linked) | — | The new pattern entered, if applicable |
| Problem (linked) | — | The new problem addressed, if applicable |
| Capability deployed | — | Which existing capability made this expansion tractable |
| Capability acquired | — | If this event was a capability acquisition |
| Source | Known | What grounds this timeline entry |

---

### Opportunity (Layer 3 — hypothesis)

Opportunities are structured hypotheses. Every field is explicitly a hypothesis, not an observation. The loader computes `well_formed` automatically — a record that fails is stored as draft.

**Two tracks:**

**Derived** — follows directly from query output. Another contributor running the same queries would produce a similar record. Cite which query surfaced the gap.

**Interpretive** — makes a connection the data does not force. Requires `departure_point`: a statement of what the data actually shows, what a derived inference would conclude, and where and why this hypothesis departs from that inference.

| Field | Notes |
|---|---|
| Name | Short descriptive label |
| Generation mode | derived / interpretive |
| Lens | structural_gap / geographic_whitespace / segment_underserved / capability_recombination / pattern_transfer / condition_shift / cross_domain / pattern_inversion / other |
| Departure point | Required for interpretive. What data shows → what derived inference would conclude → where and why this departs. |
| Problem (linked) | Layer 2 problem this addresses |
| Existing patterns (linked) | What currently addresses this problem |
| Recombined patterns (linked) | Patterns being recombined in the hypothesis |
| Observed gap | Specific capability, segment, geography, or price point not served |
| Gap evidence | Layer 1/2 records or external evidence supporting the gap |
| Evidence strength | Strong / Moderate / Weak |
| Hypothesis | The proposed implementation — what, for whom, using which mechanism |
| Capabilities required | Which Capability nodes this requires; whether a new entrant can possess them |
| Winning condition required | Structural condition that must hold |
| Failure condition to avoid | What would kill this if present |
| Predictions | Specific falsifiable claims with horizon year. Minimum 1 for well_formed. The feedback loop that lets Layer 3 calibrate over time. |
| Open questions | Specific unknowns with method and close criteria. Minimum 1 for well_formed. |
| Gap fingerprint | Computed: hash(problem|lens|sorted capabilities). Opportunities sharing a fingerprint auto-linked as competing. |
| Well formed | Computed by loader. |
| Status | open / investigating / validated / rejected / building |

**Status transitions** are triggered by specific events, not contributor discretion. Every status change requires a note with the evidence that caused it. See `docs/interpretation-across-layers.md` for the full transition rules.

---

## Evidence and Provenance

Every non-trivial field carries one of three labels:

- **Known** — directly observed: pricing page, public filing, primary interview, case study
- **Estimated** — reasoned inference from observable behaviour, explicitly labelled
- **Unknown** — not yet established

**Profitability proxy rule:** A company that has raised no external funding and has operated continuously for 5 or more years is recorded as `Estimated profitable (proxy)`. This is Tier 6 inference — plausible reasoning, not observation — and carries signal confidence Low. It is not equivalent to Known profitable.

**Evidence weight scale in query output:**
- Established — 10+ companies
- Strong — 5–9 companies
- Emerging — 2–4 companies
- Anecdotal — 1 company

**Acceptable sources in rough order of reliability:** public financial statement / SEC filing → pricing page → founder or operator interview → customer case study → credible third-party reporting (Sacra, Contrary Research) → inference from observable behaviour.

---

## Query Traceability

The five queries most likely to expose field consistency problems:

**Q1: "Find every successful expansion path that followed solving a payroll problem"**
Depends on: `problem` FK filled on each Timeline entry + `capability_deployed` filled on market_entry events. The field most likely skipped: `capability_deployed`. Without it, the query answers timing but not the why-question.

**Q2: "Which mechanisms have consistently produced businesses for 30+ years?"**
Depends on: `first_observed` on Implementation Pattern + `valid_from` on Winning/Failure Condition pairs + `status = dead` on failed companies.

**Q3: "Which solution patterns exist in Market A but not Market B, where demand in Market B is documented?"**
Depends on: geographic penetration filled with specific markets, not "global." The absence must be actively recorded with a source.

**Q4: "What adjacent problem do payment infrastructure companies enter after reaching scale?"**
Depends on: consistent Problem node naming + Timeline entries with `problem` FK + `capability_deployed` + `founded` on Company.

**Q5: "Which capabilities are required by the most implementation patterns but possessed by the fewest companies?"**
Depends on: `capabilities_required` on Implementation Pattern AND capability references on Company Timeline entries. Capability names must be deduplicated rigorously.

---

## Companion Documents

| Document | Purpose |
|---|---|
| `README.md` | Technical setup, stack, commands, daily workflow |
| `docs/candidate-selection.md` | Protocol for selecting which company to research next. Scoring formula, gap types, research queue. Read before every research session. |
| `docs/interpretation-across-layers.md` | How interpretation works at each layer, why more rules fail, the Goodhart problem, what to do instead. Read before contributing to any layer. |
| `data/_vocab/boundary-cases.yaml` | The living case law of the abstraction tests. Search here before making any pattern judgment. |
| `data/opportunities/_template.yaml` | Template for new Layer 3 opportunity records. |