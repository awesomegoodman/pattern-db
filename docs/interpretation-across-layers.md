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
2025"` and `revenue_derivation: "$1B boundary — Sacra is an estimate not a
reported figure; assigned <1B pending audited financials."` The bucket
disagreement between two contributors becomes harmless because the raw data is
preserved and the reasoning is auditable.

For founding year on a pivoted company: store both `founded_legal` (incorporation)
and `founded_operational` (first revenue under current mission), with a note on
which is used for temporal queries and why. Do not force a single value and
silently discard the other.

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
- The specific structural difference that decided it (not just "they are different"
  but the concrete operational fact that made the difference)
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
this pressure, confidence in it increases. If it doesn't, the maturity status is
based on the wrong evidence.

---

## Layer 3: preserve reasoning, record predictions

Layer 3 hypotheses cannot be evaluated at creation time by whether they are
correct. They can only be evaluated by whether the reasoning is coherent and
honest, and by whether they turn out to be correct over time.

The two-track distinction — derived and interpretive — is the right structure.
Derived opportunities follow directly from query output; another contributor
running the same queries on the same dataset would produce a similar record.
Interpretive opportunities make a connection the data does not force; another
contributor following the same protocol would not produce this record.

Both tracks require the same minimum: a specific falsifiable claim with a year
by which it should be checkable.

For interpretive opportunities, one additional field is required: the departure
point. This is a statement of what the data actually shows, what a derived
inference from that data would conclude, and where and why this hypothesis
departs from that inference. A well-formed departure point allows a skeptical
reader to locate the interpretive move precisely, understand the assumption being
imported, and evaluate whether the reasoning is coherent — even if they disagree
with the conclusion.

The departure point is not a defense of the hypothesis. It is an honest map of
where the contributor left the data and started following a different logic.

### The feedback loop

Predictions recorded at creation are the only mechanism by which Layer 3 can
improve its own calibration. Without them, old opportunity records have no feedback
loop and the database never learns whether its hypotheses were good ones.

After every load, the loader should compare new company records against open
opportunity records. A new company that directly confirms or falsifies an open
opportunity should flag it for immediate status review — not on the annual horizon
date but now. The most valuable feedback is contemporaneous with the evidence.

---

## Goodhart across all layers

Any property introduced as a quality signal becomes a target. The only partial
defenses are:

**Make metrics compute from data, not be filled by contributors.** Evidence count
is computed. Maturity status is computed from evidence count. Well-formed status
is computed from field presence. These are outputs of good work, not targets
contributors aim at. The contributor never sees "your evidence count is 2, you
need 1 more for Proposed" as a prompt. They see the maturity status after the fact.

**Make the research queue optimize for diversity, not quantity.** The research
queue already does this: failure cases score highest, geographic whitespace scores
next. These are Goodhart-resistant because optimizing them actually improves the
dataset. A contributor who games the queue by finding failure cases and filling
geographic gaps produces exactly the records the database needs. Extend this logic
to Layer 2: score which patterns need cross-industry stress testing, which winning
conditions have never been tested outside their originating domain, which
capabilities have sector evidence from only one industry.

**Keep the number of required fields minimal.** Every additional required field
is another dimension along which contributors can optimize for appearance. The
minimum viable record is the right instinct; resist additions that do not
directly serve a query in the priority suite.

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
