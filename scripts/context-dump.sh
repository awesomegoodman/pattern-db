#!/bin/bash
set -a && source .env.local && set +a

OUT="context.md"

{
cat << 'HEADER'
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

HEADER

echo "## Current project status"
echo ""
echo '```'
npx tsx src/db/queries/status.ts 2>/dev/null || echo "(status query failed — check .env.local)"
echo '```'
echo ""

echo "---"
echo ""
echo "## File structure"
echo ""
echo '```'
find . \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/.git/*' \
  -not -path '*/migrations/*' \
  | sort | grep -v '\.js$\|\.d\.ts$\|\.map$'
echo '```'
echo ""

echo "---"
echo ""
echo "## README"
echo ""
echo '```markdown'
cat README.md
echo '```'
echo ""

echo "---"
echo ""
echo "## Candidate selection protocol"
echo ""
echo '```markdown'
cat docs/candidate-selection.md
echo '```'
echo ""

echo "---"
echo ""
echo "## Interpretation across layers"
echo ""
echo '```markdown'
cat docs/interpretation-across-layers.md
echo '```'
echo ""

echo "---"
echo ""
echo "## Company template"
echo ""
echo '```yaml'
cat data/companies/_template.yaml
echo '```'
echo ""

echo "---"
echo ""
echo "## Vocab template reference"
echo ""
echo '```yaml'
cat data/_vocab/_template-reference.yaml
echo '```'
echo ""

echo "---"
echo ""
echo "## Opportunity template"
echo ""
echo '```yaml'
cat data/opportunities/_template.yaml
echo '```'
echo ""

echo "---"
echo ""
echo "## Sample company (gusto.yaml)"
echo ""
echo '```yaml'
cat data/companies/hr-payroll/gusto.yaml
echo '```'
echo ""

echo "---"
echo ""
echo "## Vocab snapshots"
echo ""
echo "### problems.yaml (first 40 lines)"
echo '```yaml'
head -40 data/_vocab/problems.yaml
echo '```'
echo ""
echo "### implementation-patterns.yaml (first 30 lines)"
echo '```yaml'
head -30 data/_vocab/implementation-patterns.yaml
echo '```'
echo ""
echo "### capabilities.yaml (first 25 lines)"
echo '```yaml'
head -25 data/_vocab/capabilities.yaml
echo '```'
echo ""

echo "---"
echo ""
echo "## Boundary cases (current)"
echo ""
echo '```yaml'
cat data/_vocab/boundary-cases.yaml
echo '```'

} > "$OUT"

echo "✓ $OUT generated ($(wc -l < "$OUT") lines)"
