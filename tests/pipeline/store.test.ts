import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { storeInvoice } from "@/lib/pipeline/store";
import { createTestDb } from "../helpers";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Database from "better-sqlite3";
import type { Extraction, MatchResult, Anomaly } from "@/lib/pipeline/types";

const EXTRACTION: Extraction = {
  vendor: "Acme Corp", invoiceNumber: "INV-001", date: "2025-01-15",
  dueDate: "2025-02-15", lineItems: [{ description: "Widget", quantity: 10, unitPrice: 25, total: 250 }],
  subtotal: 250, tax: 25, total: 275, currency: "USD", paymentTerms: "Net 30",
};

const MATCHED: MatchResult = { status: "matched", poId: "po-1", poNumber: "PO-001", confidence: "vendor+amount" };

describe("storeInvoice", () => {
  let sqlite: Database.Database;
  let db: any;

  beforeEach(() => {
    const testDb = createTestDb();
    sqlite = testDb.sqlite;
    db = testDb.db;
  });

  afterEach(() => sqlite.close());

  it("stores auto_approved invoice when no anomalies and matched", () => {
    const id = storeInvoice("test.pdf", "pdf", EXTRACTION, MATCHED, [], db);

    const invoice = db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).get();
    expect(invoice.status).toBe("auto_approved");
    expect(invoice.vendor).toBe("Acme Corp");
    expect(invoice.matchStatus).toBe("matched");

    const items = db.select().from(schema.lineItems).where(eq(schema.lineItems.invoiceId, id)).all();
    expect(items).toHaveLength(1);
    expect(items[0].description).toBe("Widget");
  });

  it("stores flagged invoice when anomalies with severity >= medium", () => {
    const anomalies: Anomaly[] = [
      { rule: "math_error", severity: "medium", message: "Math mismatch" },
    ];
    const id = storeInvoice("test.pdf", "pdf", EXTRACTION, MATCHED, anomalies, db);

    const invoice = db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).get();
    expect(invoice.status).toBe("flagged");
  });

  it("stores flagged invoice when no PO match", () => {
    const noMatch: MatchResult = { status: "no_match", poId: null, poNumber: null, confidence: "none" };
    const id = storeInvoice("test.pdf", "pdf", EXTRACTION, noMatch, [], db);

    const invoice = db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).get();
    expect(invoice.status).toBe("flagged");
  });

  it("stores auto_approved when only low-severity anomalies and matched", () => {
    const anomalies: Anomaly[] = [
      { rule: "partial_po_match", severity: "low", message: "Amount off" },
    ];
    const id = storeInvoice("test.pdf", "pdf", EXTRACTION, MATCHED, anomalies, db);

    const invoice = db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).get();
    expect(invoice.status).toBe("auto_approved");
  });
});
