import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE purchase_orders (
      id TEXT PRIMARY KEY, po_number TEXT NOT NULL, vendor TEXT NOT NULL,
      amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL
    );
    CREATE TABLE invoices (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, file_type TEXT NOT NULL,
      file_path TEXT, raw_extraction TEXT, vendor TEXT, invoice_number TEXT, date TEXT,
      due_date TEXT, subtotal REAL, tax REAL, total REAL, currency TEXT,
      po_match_id TEXT, match_status TEXT, status TEXT NOT NULL DEFAULT 'processing',
      anomalies TEXT, reviewer_notes TEXT, created_at TEXT NOT NULL, reviewed_at TEXT
    );
    CREATE TABLE line_items (
      id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL, description TEXT NOT NULL,
      quantity REAL NOT NULL, unit_price REAL NOT NULL, total REAL NOT NULL
    );
  `);
  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

export function seedPurchaseOrders(db: ReturnType<typeof drizzle>) {
  db.insert(schema.purchaseOrders)
    .values([
      { id: "po-1", poNumber: "PO-2024-001", vendor: "Acme Corp", amount: 2500.0, date: "2024-11-15", description: "Office supplies" },
      { id: "po-2", poNumber: "PO-2024-002", vendor: "TechFlow Inc", amount: 8750.0, date: "2024-11-20", description: "Software licenses" },
      { id: "po-3", poNumber: "PO-2025-001", vendor: "Acme Corp", amount: 3100.0, date: "2025-01-08", description: "Office supplies Q1" },
    ])
    .run();
}
