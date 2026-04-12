# InvoiceAI

> InvoiceAI helps finance teams process invoices automatically without manual data entry — and knows when to ask a human.

A portfolio project demonstrating a production-grade AI document processing pipeline built with Next.js, Claude Vision, and a human-in-the-loop review queue.

---

## Architecture

```mermaid
flowchart LR
    A[📄 Upload] --> B[🤖 Extract\nClaude Vision]
    B --> C[✅ Validate\nZod Schema]
    C --> D[🔍 Match\nPO Lookup]
    D --> E[⚠️ Detect\nAnomaly Rules]
    E --> F[💾 Store\nSQLite]
    F --> G{Status?}
    G -->|No anomalies + PO match| H[Auto Approved]
    G -->|Anomalies or no match| I[Flagged]
    I --> J[👤 Human Review Queue]
    J --> K[Approved / Rejected]

    style H fill:#dcfce7,stroke:#16a34a,color:#000
    style I fill:#fef3c7,stroke:#d97706,color:#000
    style K fill:#dbeafe,stroke:#2563eb,color:#000
```

---

## Features

- **5-step pipeline** — upload, extract, validate, match, detect, store in a single request
- **Claude Vision extraction** — structured data from any invoice format (PDF, image, scan) via a single API call
- **Zod validation with math checks** — catches extraction errors at the schema boundary, not downstream
- **Fuzzy PO matching** — tolerant vendor name matching against purchase order records
- **6 anomaly detection rules** — duplicate detection, amount variance, missing PO, suspicious line items, and more
- **Human-in-the-loop review queue** — flagged invoices surface in an in-app queue for human approval or rejection
- **Sample invoices for instant demo** — clone, run, and see the pipeline processing real data in under 30 seconds

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
| Framework | Next.js 15 (App Router) |
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

## License

MIT — see [LICENSE](LICENSE)
