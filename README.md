<p align="center">
  <h1 align="center">InvoiceAI</h1>
  <p align="center">
    AI-powered invoice processing with Claude Vision extraction, anomaly detection, and human-in-the-loop review queue.
  </p>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#architecture">Architecture</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#screenshots">Screenshots</a> &middot;
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Claude-Vision_API-7C3AED?logo=anthropic" alt="Claude Vision" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vitest-31_tests-6E9F18?logo=vitest&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
</p>

---

## The Problem

Finance teams still process invoices by hand. Someone opens a PDF, types numbers into a spreadsheet, checks them against a purchase order, and hopes they don't miss a duplicate or a $10k typo. It's slow, error-prone, and nobody enjoys it.

Full-auto AI extraction sounds great until it silently approves a fraudulent invoice or misreads a decimal point. You need automation that knows when to stop and ask a human.

## The Solution

InvoiceAI runs a 5-step pipeline that extracts, validates, matches, and flags invoices automatically -- then routes anything suspicious to a human review queue. It handles the boring 80% so your team can focus on the 20% that actually needs judgment.

**Three principles:**

1. **Extract with AI, validate with code.** Claude Vision reads the invoice; Zod schemas and math checks catch extraction errors before they propagate.
2. **Flag, don't guess.** When something looks off -- duplicate, amount mismatch, missing PO -- the invoice gets flagged for human review instead of auto-approved.
3. **Demo in 30 seconds.** Clone, install, run. Sample invoices are included so you see the full pipeline working immediately.

---

## Architecture

```mermaid
flowchart LR
    A[Upload] --> B[Extract\nClaude Vision]
    B --> C[Validate\nZod Schema]
    C --> D[Match\nPO Lookup]
    D --> E[Detect\nAnomaly Rules]
    E --> F[Store\nSQLite]
    F --> G{Status?}
    G -->|No anomalies + PO match| H[Auto Approved]
    G -->|Anomalies or no match| I[Flagged]
    I --> J[Human Review Queue]
    J --> K[Approved / Rejected]

    style H fill:#dcfce7,stroke:#16a34a,color:#000
    style I fill:#fef3c7,stroke:#d97706,color:#000
    style K fill:#dbeafe,stroke:#2563eb,color:#000
```

---

## Features

| Capability | What it does |
|------------|-------------|
| **Claude Vision extraction** | Structured data from any invoice format (PDF, image, scan) via a single API call |
| **Zod validation + math checks** | Catches extraction errors at the schema boundary, not downstream |
| **Fuzzy PO matching** | Tolerant vendor name matching against purchase order records |
| **6 anomaly detection rules** | Duplicate detection, amount variance, missing PO, suspicious line items, and more |
| **Human-in-the-loop review** | Flagged invoices surface in an in-app queue for approval or rejection |
| **Sample invoices** | Clone, run, and see the pipeline processing real data in under 30 seconds |

---

## Quick Start

```bash
git clone https://github.com/martin-minghetti/invoice-processor.git
cd invoice-processor
npm install
cp .env.example .env  # add your ANTHROPIC_API_KEY
npm run dev
# Open http://localhost:3000 and click "Try with sample invoices"
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| AI | Claude Vision API (Anthropic SDK) |
| Validation | Zod |
| Database | SQLite via Drizzle ORM |
| Testing | Vitest (~31 tests) |
| Styling | Tailwind CSS v4 |
| Deploy | Vercel |

---

## Testing

```bash
npm test
```

Runs ~31 unit tests covering the full pipeline: extraction schema validation, PO matching logic, anomaly detection rules, database operations, and end-to-end pipeline flow.

---

## Screenshots

| Home | Dashboard |
|------|-----------|
| ![Home](public/screenshots/home.png) | ![Dashboard](public/screenshots/dashboard.png) |

| Upload | Review Queue |
|--------|--------------|
| ![Upload](public/screenshots/upload.png) | ![Review Queue](public/screenshots/review.png) |

| Invoice Detail |
|---------------|
| ![Invoice Detail](public/screenshots/detail.png) |

---

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    api/             # REST endpoints (process, review, stats)
    dashboard/       # Processing dashboard
    invoices/[id]/   # Invoice detail view
    review/          # Human review queue
    upload/          # File upload page
  components/        # Shared UI components
  lib/
    db/              # Drizzle ORM schema, seed data
    pipeline/        # Core processing pipeline
      extract.ts     # Claude Vision extraction
      validate.ts    # Zod schema validation
      match.ts       # Fuzzy PO matching
      detect.ts      # Anomaly detection rules
      store.ts       # Database persistence
      process.ts     # Pipeline orchestrator
tests/               # Vitest test suite
samples/             # Sample invoices for demo
```

---

## Contributing

Contributions are welcome. Here's how to get started:

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `npm test` and make sure all tests pass
4. Run `npm run lint` to check for style issues
5. Open a pull request with a clear description of what you changed and why

If you're adding a new anomaly detection rule or pipeline step, include tests that cover the new behavior.

---

## License

MIT -- see [LICENSE](LICENSE)
