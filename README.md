# Pattern DB

A structured knowledge graph of recurring economic problems, the solution patterns that address them, and the mechanisms by which businesses create and defend value.

Companies are observational evidence used to ground and continuously refine the pattern ontology — not the primary subject of study. **If a company disappeared tomorrow, almost nothing in this dataset should change.** The problem persists, the mechanism persists, the customers persist. That principle governs every structural decision.

Designed to answer questions like:
- Which problems have few solution approaches despite documented willingness to pay?
- Which mechanisms repeatedly produce sustainable businesses across unrelated industries?
- Which solution patterns exist in Market A but not Market B, where demand in Market B is documented?
- What did companies that started with problem X consistently expand into, and which capabilities made the move tractable?

---

## Stack

| Component | Tool |
|---|---|
| Database | PostgreSQL via Supabase |
| ORM + migrations | Drizzle ORM |
| Application | Next.js 14 (App Router, TypeScript) |
| Components | shadcn/ui |
| Analytics | Metabase (Docker, local) |

---

## Prerequisites

- Node.js 18+
- Docker Desktop (for Metabase)
- A Supabase project

---

## Setup

**1. Install**
```bash
npm install
```

**2. Environment**

Copy `.env.local.example` to `.env.local` and fill in the four values from your Supabase project (Settings → API and Settings → Database):

```bash
cp .env.local.example .env.local
```

**3. Enable pg_trgm**

In Supabase SQL Editor — required for deduplication checking:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**4. Push schema**
```bash
npx drizzle-kit generate && npx drizzle-kit migrate
```

**5. Seed**
```bash
set -a && source .env.local && set +a && \
npx tsx src/db/seed.ts && \
npx tsx src/db/seed-hcm-expansion.ts
```

**6. Start Metabase**
```bash
docker compose -f docker-compose.metabase.yml up -d
```

Open [http://localhost:3001](http://localhost:3001). Connect using Supabase Session mode (port 5432). See [Metabase](#metabase) below.

---

## Data Entry

### The protocol

The schema is read top-down (Problem → Solution Pattern → Implementation Pattern → Company) but **entered bottom-up**. You encounter a company before you can abstract the pattern it instantiates. Never work top-down.

The mandatory entry sequence:

1. **Fill the Company record** — all MVR fields (see below)
2. **Add at least two Timeline entries** — founding event + at least one expansion
3. **Link to one Implementation Pattern** — create a stub if none exists yet
4. **Link to one Problem** — create a stub if none exists yet
5. *(Enrichment)* Fill remaining Implementation Pattern fields
6. *(Enrichment)* Fill the Winning/Failure Condition pair on the Solution Pattern — only after 3+ grounding company observations exist for that pattern. Both fields or neither.

A record with complete MVR fields and stub links is valid. A pattern asserted without grounding company observations is not.

### Minimum Viable Record

All fields below are required before a company record is considered valid.

| Field | Accepted values |
|---|---|
| Company name | — |
| Founded | Year |
| Country | HQ geography |
| Status | `operating` `acquired` `dead` `pivoted` `merged` |
| Stage | `public` `unicorn` `series_a`–`series_g` `bootstrapped` `yc` |
| Funding history | `"Series A $5M 2019, Series B $20M 2021"` or `"none"` |
| Revenue signal | `<10M` `10-100M` `100M-1B` `>1B` |
| Profitability signal | `known_profitable` `known_unprofitable` `estimated_profitable_proxy` `unknown` |
| Evidence weight | `strong_validator` `weak_validator` `disconfirming` `unknown` |
| Signal confidence | `high` `low` |
| Implementation pattern link | Stub acceptable |
| Problem link | Stub acceptable |
| Timeline ≥ 2 entries | Founding + one expansion. See Timeline rules below. |

**Profitability proxy:** A company with no external funding that has operated continuously for 5+ years may be recorded as `estimated_profitable_proxy`. This is a Tier 6 inference — label it explicitly. It is not equivalent to `known_profitable`.

**Evidence weight:**

| Value | Meaning |
|---|---|
| `strong_validator` | Known profitable, sustained, self-funded or demonstrably unit-economics positive |
| `weak_validator` | Operating but externally funded, unproven economics |
| `disconfirming` | Attempted the pattern and failed — failure mode must be recorded |
| `unknown` | Insufficient information |

Disconfirming companies must be in the dataset. A dataset that only records survivors silently corrupts every pattern query.

### Timeline rules

Each Timeline entry requires: year, event type, description, source.

**Never leave `capability_deployed` blank on `market_entry` or `acquisition` events.** This field converts timing data ("entered lending at year 9") into causal insight ("entered lending at year 9 using existing banking integration and regulatory compliance capability"). It is the most analytically valuable field in the dataset.

Event types: `founding` `product_launch` `market_entry` `acquisition` `pivot` `shutdown` `capability_acquisition` `funding`

### Deduplication check

Run this before creating any new Problem, Solution Pattern, Implementation Pattern, or Capability node. Similarity > 0.4 warrants review before creating a new record.

```bash
set -a && source .env.local && set +a && npx tsx << 'EOF'
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const candidate = "YOUR PROPOSED NAME HERE";
const table = "problems";        // or: solution_patterns, implementation_patterns
const column = "statement";      // or: name (for pattern tables)

const results = await db.execute(sql`
  SELECT id, ${sql.raw(column)} AS text,
         similarity(${sql.raw(column)}, ${candidate}) AS sim
  FROM ${sql.raw(table)}
  WHERE similarity(${sql.raw(column)}, ${candidate}) > 0.4
  ORDER BY sim DESC LIMIT 5
`) as any[];

console.log(results.length ? results : "No near-duplicates found.");
await client.end();
EOF
```

### Classification ambiguity

Every ambiguous classification decision goes into the Boundary Case Catalog before proceeding. Fields: company name, option A, option B, chosen, one-sentence reason, date. If the same boundary is hit 3+ times with different resolutions, the abstraction test needs a new worked example — it is a schema problem, not a data entry problem.

---

## Querying

### Terminal

```bash
set -a && source .env.local && set +a && npx tsx src/db/queries/run-all.ts
```

Runs all priority queries and prints results.

### Metabase

Queries saved in the `Pattern DB — Priority Queries` collection. Each has optional filter fields that narrow results by keyword — leave blank to see all data across all domains.

```bash
# Start
docker compose -f docker-compose.metabase.yml up -d

# Stop
docker compose -f docker-compose.metabase.yml down

# Logs
docker logs -f pattern-db-metabase
```

---

## Architecture

### Three layers

The dataset is organised into three layers that must never be mixed.

| Layer | Contains | Evidence labels |
|---|---|---|
| **L1 — Observation** | Company, Company Timeline | `known` or `unknown` only — observations are not estimated |
| **L2 — Derived** | Problem, Solution Pattern, Implementation Pattern, Mechanism, Underlying Constraint, Capability, Status Quo Pattern, Business Model, Distribution Pattern, Winning/Failure Condition | `known` `estimated` `unknown` |
| **L3 — Hypothesis** | Opportunity | Every field explicitly a hypothesis, linked to L1/L2 evidence |

A Layer 2 entity cannot be asserted without at least one grounding Layer 1 observation. A Layer 3 entity cannot be promoted to Layer 2 without grounding observations.

### Winning/Failure Condition maturity

| Maturity | Threshold |
|---|---|
| `draft` | Stated but not yet symmetry-verified, or fewer than 2 grounding observations |
| `proposed` | Internally consistent, symmetry-verified, 2+ observations — not yet cross-industry tested |
| `established` | 3+ observations across 2+ unrelated industries, transferability confirmed without restatement |

Both conditions are filled together or neither. The failure condition must be the direct logical inverse of the winning condition at the same level of abstraction. A condition without `valid_from` is an incomplete record.

### File structure

```
src/
├── db/
│   ├── schema.ts                  # Single source of truth for the data model
│   ├── migrations/                # Generated by drizzle-kit — do not edit manually
│   ├── seed*.ts                    # Phase 1 calibration data
│   └── queries/
│       ├── run-all.ts             # One-shot terminal query suite
│       ├── dedup.ts               # Deduplication utilities (pg_trgm)
│       └── evidence.ts            # Evidence count refresh utilities
├── lib/
│   ├── db.ts                      # Drizzle client (postgres.js, transaction mode)
│   └── supabase.ts                # Supabase client (auth only — queries go through Drizzle)
└── app/                           # Next.js App Router (Phase 2 — data entry UI)

docker-compose.metabase.yml        # Metabase local instance
drizzle.config.ts                  # Drizzle configuration
BRIEF.md                           # Full design document — ontology, abstraction tests,
                                   # relationship vocabulary, query traceability
```

---

## Design reference

Full design decisions, abstraction tests, canonical relationship vocabulary, entity field definitions, and query traceability traces are in [`BRIEF.md`](./BRIEF.md).