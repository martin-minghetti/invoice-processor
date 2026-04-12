import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectAnomalies } from "@/lib/pipeline/detect";
import { createTestDb } from "../helpers";
import * as schema from "@/lib/db/schema";
import type Database from "better-sqlite3";
import type { Extraction, ValidationResult, MatchResult } from "@/lib/pipeline/types";

const CLEAN_EXTRACTION: Extraction = {
  vendor: "Acme Corp", invoiceNumber: "INV-001", date: "2025-01-15",
  dueDate: "2025-02-15", lineItems: [{ description: "Widget", quantity: 10, unitPrice: 25, total: 250 }],
  subtotal: 250, tax: 25, total: 275, currency: "USD", paymentTerms: "Net 30",
};

const VALID: ValidationResult = { valid: true, errors: [] };
const MATCHED: MatchResult = { status: "matched", poId: "po-1", poNumber: "PO-001", confidence: "vendor+amount" };

describe("detectAnomalies", () => {
  let sqlite: Database.Database;
  let db: any;

  beforeEach(() => {
    const testDb = createTestDb();
    sqlite = testDb.sqlite;
    db = testDb.db;
  });

  afterEach(() => sqlite.close());

  it("returns no anomalies for clean invoice", () => {
    const result = detectAnomalies(CLEAN_EXTRACTION, VALID, MATCHED, db);
    expect(result).toHaveLength(0);
  });

  it("detects missing required fields", () => {
    const validation: ValidationResult = {
      valid: false,
      errors: [{ field: "vendor", message: "missing", type: "missing_required" }],
    };
    const result = detectAnomalies(CLEAN_EXTRACTION, validation, MATCHED, db);
    expect(result.some((a) => a.rule === "missing_fields" && a.severity === "medium")).toBe(true);
  });

  it("detects math errors", () => {
    const validation: ValidationResult = {
      valid: false,
      errors: [{ field: "subtotal", message: "mismatch", type: "math_error" }],
    };
    const result = detectAnomalies(CLEAN_EXTRACTION, validation, MATCHED, db);
    expect(result.some((a) => a.rule === "math_error" && a.severity === "medium")).toBe(true);
  });

  it("detects no PO match", () => {
    const noMatch: MatchResult = { status: "no_match", poId: null, poNumber: null, confidence: "none" };
    const result = detectAnomalies(CLEAN_EXTRACTION, VALID, noMatch, db);
    expect(result.some((a) => a.rule === "no_po_match" && a.severity === "low")).toBe(true);
  });

  it("detects amount mismatch (>2x PO)", () => {
    db.insert(schema.purchaseOrders).values({
      id: "po-small", poNumber: "PO-SMALL", vendor: "Acme Corp",
      amount: 100.0, date: "2025-01-01", description: "Small order",
    }).run();

    const matchWithSmallPO: MatchResult = {
      status: "matched", poId: "po-small", poNumber: "PO-SMALL", confidence: "vendor+amount",
    };

    const result = detectAnomalies(CLEAN_EXTRACTION, VALID, matchWithSmallPO, db);
    expect(result.some((a) => a.rule === "amount_mismatch" && a.severity === "high")).toBe(true);
  });

  it("detects duplicate invoice", () => {
    db.insert(schema.invoices).values({
      id: "existing-1", fileName: "old.pdf", fileType: "pdf",
      vendor: "Acme Corp", total: 275, date: "2025-01-15",
      status: "auto_approved", createdAt: new Date().toISOString(),
    }).run();

    const result = detectAnomalies(CLEAN_EXTRACTION, VALID, MATCHED, db);
    expect(result.some((a) => a.rule === "duplicate" && a.severity === "high")).toBe(true);
  });
});
