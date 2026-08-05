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
```