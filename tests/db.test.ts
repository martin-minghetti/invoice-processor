import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

describe("database schema", () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof drizzle>;

  beforeAll(() => {
    sqlite = new Database(":memory:");
    sqlite.exec(`
      CREATE TABLE purchase_orders (
        id TEXT PRIMARY KEY, po_number TEXT NOT NULL, vendor TEXT NOT NULL,
        amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL
      );
      CREATE TABLE invoices (
        id TEXT PRIMARY KEY, file_name TEXT NOT NULL, file_type TEXT NOT NULL,
        raw_extraction TEXT, vendor TEXT, invoice_number TEXT, date TEXT,
        due_date TEXT, subtotal REAL, tax REAL, total REAL, currency TEXT,
        po_match_id TEXT REFERENCES purchase_orders(id), match_status TEXT,
        status TEXT NOT NULL DEFAULT 'processing', anomalies TEXT,
        reviewer_notes TEXT, created_at TEXT NOT NULL, reviewed_at TEXT
      );
      CREATE TABLE line_items (
        id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES invoices(id),
        description TEXT NOT NULL, quantity REAL NOT NULL,
        unit_price REAL NOT NULL, total REAL NOT NULL
      );
    `);
    db = drizzle(sqlite, { schema });
  });

  afterAll(() => {
    sqlite.close();
  });

  it("creates purchase_orders table", () => {
    const result = db.select().from(schema.purchaseOrders).all();
    expect(result).toEqual([]);
  });

  it("creates invoices table", () => {
    const result = db.select().from(schema.invoices).all();
    expect(result).toEqual([]);
  });

  it("creates line_items table", () => {
    const result = db.select().from(schema.lineItems).all();
    expect(result).toEqual([]);
  });
});
