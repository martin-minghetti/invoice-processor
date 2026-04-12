# Architectural Decisions — InvoiceAI

This document records the key architectural decisions made during the design and implementation of this project. Each entry explains what was decided, why, and what trade-offs it introduces.

---

## 1. Next.js full-stack over FastAPI + separate frontend

**Decision:** Build the entire application — API routes, UI, and pipeline logic — as a single Next.js 15 App Router project.

**Context:** The most natural stack for an AI document processing backend in Python would be FastAPI, with a React frontend served separately. My portfolio already has two Python/FastAPI projects. A third would add little signal to potential employers or clients evaluating technical range.

Choosing Next.js for a full-stack invoice processor demonstrates something more valuable: the ability to pick the right tool for the job rather than defaulting to a comfort zone. Next.js API routes are production-capable for this workload. The App Router model encourages clean separation between server and client concerns without needing two separate repositories or deployment targets.

**Consequences:** Everything deploys as a single Vercel project. There is one process to run locally (`npm run dev`). The developer experience for someone cloning this repo is dramatically simpler — no virtual environments, no separate servers, no CORS configuration. The trade-off is that CPU-intensive pipeline work runs in Node.js rather than Python, and Python's AI/ML ecosystem is not available without a separate service. For this project — where all the heavy lifting is delegated to the Anthropic API — that trade-off is inconsequential.

---

## 2. SQLite over Supabase

**Decision:** Use SQLite (via Drizzle ORM) as the database layer instead of a hosted Postgres solution like Supabase.

**Context:** Supabase is the production database for my Gym Tracker project. Using it again here would mean every reviewer of this portfolio project needs to either have a Supabase account or stub out the data layer. More importantly, a hosted database introduces a hard dependency on external infrastructure for what is meant to be a self-contained demo.

SQLite with Drizzle ORM solves the zero-config problem entirely. The database is a file on disk. Clone the repo, run `npm install`, and the data layer is ready. No signup, no credentials, no network dependency.

**Consequences:** The database abstraction through Drizzle ORM means swapping to Postgres — including Supabase — is a configuration change, not a code change. Schema definitions, query logic, and migration files remain identical. The trade-off is that SQLite does not support concurrent writes well and is not suitable for multi-instance deployments. For a portfolio project running on a single Vercel instance, this is an irrelevant constraint. The decision optimizes for what matters: a reviewer can have the project running and processing invoices in under two minutes.

---

## 3. Claude Vision direct over OCR + LLM pipeline

**Decision:** Send invoice documents directly to the Claude Vision API for structured extraction, rather than running OCR preprocessing before passing text to a language model.

**Context:** The conventional approach to document processing pipelines is: OCR first (Tesseract, EasyOCR, or a cloud OCR service), then pass extracted text to a language model for parsing and structuring. This two-step approach made sense when language models could not process images directly.

Claude's vision capabilities make the intermediate OCR step unnecessary for most document types. A single API call takes an image or PDF page and returns structured JSON — vendor name, invoice number, line items, totals — without any preprocessing.

**Consequences:** The pipeline is simpler, with fewer failure modes. There is no Tesseract installation required, no image preprocessing step, and no OCR confidence thresholds to tune. Extraction accuracy is higher on complex layouts (multi-column invoices, scanned documents with varied fonts) because the model understands document semantics, not just character recognition. The trade-off is a dependency on the Anthropic API for every extraction — the pipeline cannot run fully offline. Latency is also higher per document than a pure OCR approach, though this is acceptable for an invoice processing workload where throughput matters more than sub-second response time.

---

## 4. Zod validation over post-hoc checking

**Decision:** Define invoice extraction schemas in Zod and validate Claude's structured output immediately upon extraction, before any downstream processing.

**Context:** A naive implementation would trust the AI extraction output and check for errors later — at the database write step, or when anomaly detection notices unexpected values. This pushes errors downstream where they are harder to surface clearly and may corrupt data before the problem is caught.

Schema-first validation with Zod establishes a contract at the boundary between the AI extraction step and the rest of the pipeline. If Claude returns an invoice with a missing total, a non-numeric amount, or line items that do not sum correctly, the validation step catches it immediately and returns a structured error to the caller.

**Consequences:** The schema definitions serve double duty: they validate runtime output and provide TypeScript types throughout the codebase from extraction to database write. Adding a new field to the invoice schema automatically propagates type-safe requirements through the pipeline. The math check — verifying that line item subtotals sum to the invoice total within a tolerance — catches a class of extraction errors that schema validation alone would miss. The trade-off is that strict validation may reject valid invoices with unusual formats; the anomaly detection layer handles edge cases that pass validation but still warrant human review.

---

## 5. In-app review queue over Slack integration

**Decision:** Build the human review interface as a page within the Next.js application rather than routing flagged invoices to a Slack channel or webhook.

**Context:** The human-in-the-loop component of an invoice processing system is often implemented as a notification to a Slack channel with approve/reject buttons, or as an email with a review link. This is the right production approach when reviewers already live in those tools.

For a portfolio project, a Slack integration creates a dependency that makes the demo impossible to run without configuring a Slack workspace, OAuth app, and webhook URL. A reviewer evaluating this project on their own machine cannot see the review queue in action.

**Consequences:** The review queue is a first-class feature of the UI — reviewers see flagged invoices, the anomalies that triggered the flag, and approve or reject with a single click. This is better for portfolio screenshots and live demos than a Slack message. It also demonstrates UI work that a Slack-only integration would hide. The trade-off is that in a real production deployment, finance reviewers would likely prefer notifications in their existing communication tools. Adding a Slack webhook would be straightforward and would not require changes to the core pipeline — the queue is already the source of truth for pending reviews.

---

## 6. Sample invoices included over BYOD-only

**Decision:** Ship a set of sample invoice files in the repository that can be processed immediately without uploading real documents.

**Context:** A bring-your-own-document demo requires the reviewer to find an invoice, potentially contains real vendor data that they may not want to upload to a demo app, and adds friction before the pipeline can be evaluated. The most common outcome is that the reviewer skips the demo entirely.

Including sample invoices in `samples/` solves the time-to-demo problem. A reviewer clones the repo, runs `npm run dev`, clicks "Try with sample invoices," and sees the pipeline running within 30 seconds of opening the browser.

**Consequences:** The samples cover a range of scenarios: a clean invoice that auto-approves, an invoice flagged for amount variance, a duplicate invoice, and an invoice with a missing PO reference. This means the review queue is populated immediately, and all the anomaly detection rules can be demonstrated without crafting test inputs. The trade-off is that sample invoices occupy space in the repository and the Anthropic API is called (and billed) when they are processed. Both costs are negligible for a portfolio project. The samples use fictional vendor names and amounts — no real financial data is committed to the repository.
