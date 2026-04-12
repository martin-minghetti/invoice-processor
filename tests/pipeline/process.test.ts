import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processInvoice } from "@/lib/pipeline/process";
import { createTestDb, seedPurchaseOrders } from "../helpers";
import type Database from "better-sqlite3";

vi.mock("@/lib/pipeline/extract", () => ({
  extractInvoice: vi.fn().mockResolvedValue({
    vendor: "Acme Corp",
    invoiceNumber: "INV-001",
    date: "2025-01-15",
    dueDate: "2025-02-15",
    lineItems: [{ description: "Widget", quantity: 100, unitPrice: 25, total: 2500 }],
    subtotal: 2500,
    tax: 0,
    total: 2500,
    currency: "USD",
    paymentTerms: "Net 30",
  }),
}));

describe("processInvoice", () => {
  let sqlite: Database.Database;
  let db: any;

  beforeEach(() => {
    const testDb = createTestDb();
    sqlite = testDb.sqlite;
    db = testDb.db;
    seedPurchaseOrders(db);
  });

  afterEach(() => sqlite.close());

  it("processes a clean invoice end-to-end", async () => {
    const buffer = Buffer.from("fake");
    const result = await processInvoice(buffer, "image/jpeg", "test.jpg", db);

    expect(result.invoiceId).toBeDefined();
    expect(result.extraction.vendor).toBe("Acme Corp");
    expect(result.validation.valid).toBe(true);
    expect(result.status).toBe("auto_approved");
  });

  it("returns all pipeline stages in the result", async () => {
    const buffer = Buffer.from("fake");
    const result = await processInvoice(buffer, "image/jpeg", "test.jpg", db);

    expect(result).toHaveProperty("extraction");
    expect(result).toHaveProperty("validation");
    expect(result).toHaveProperty("match");
    expect(result).toHaveProperty("anomalies");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("invoiceId");
  });
});
