import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { matchInvoice } from "@/lib/pipeline/match";
import { createTestDb, seedPurchaseOrders } from "../helpers";
import type Database from "better-sqlite3";

describe("matchInvoice", () => {
  let sqlite: Database.Database;
  let db: any;

  beforeEach(() => {
    const testDb = createTestDb();
    sqlite = testDb.sqlite;
    db = testDb.db;
    seedPurchaseOrders(db);
  });

  afterEach(() => sqlite.close());

  it("returns matched when vendor and amount match", () => {
    const result = matchInvoice("Acme Corp", 2500.0, db);
    expect(result.status).toBe("matched");
    expect(result.poId).toBe("po-1");
    expect(result.poNumber).toBe("PO-2024-001");
  });

  it("returns matched within 10% tolerance", () => {
    const result = matchInvoice("Acme Corp", 2600.0, db);
    expect(result.status).toBe("matched");
  });

  it("returns partial when vendor matches but amount is off", () => {
    const result = matchInvoice("Acme Corp", 9999.0, db);
    expect(result.status).toBe("partial");
    expect(result.poId).toBeNull();
  });

  it("returns no_match when vendor not found", () => {
    const result = matchInvoice("Unknown Vendor", 1000.0, db);
    expect(result.status).toBe("no_match");
    expect(result.poId).toBeNull();
  });

  it("matches case-insensitively", () => {
    const result = matchInvoice("acme corp", 2500.0, db);
    expect(result.status).toBe("matched");
  });

  it("handles null vendor", () => {
    const result = matchInvoice(null, 2500.0, db);
    expect(result.status).toBe("no_match");
  });
});
