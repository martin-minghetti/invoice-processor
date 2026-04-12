import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { seedPurchaseOrders } from "./seed-data";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "invoices.db");

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");

  // Auto-create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, po_number TEXT NOT NULL, vendor TEXT NOT NULL,
      amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, file_type TEXT NOT NULL,
      file_path TEXT, raw_extraction TEXT, vendor TEXT, invoice_number TEXT, date TEXT,
      due_date TEXT, subtotal REAL, tax REAL, total REAL, currency TEXT,
      po_match_id TEXT REFERENCES purchase_orders(id), match_status TEXT,
      status TEXT NOT NULL DEFAULT 'processing', anomalies TEXT,
      reviewer_notes TEXT, created_at TEXT NOT NULL, reviewed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES invoices(id),
      description TEXT NOT NULL, quantity REAL NOT NULL,
      unit_price REAL NOT NULL, total REAL NOT NULL
    );
  `);

  const db = drizzle(sqlite, { schema });

  // Seed purchase orders if empty
  const count = sqlite.prepare("SELECT COUNT(*) as count FROM purchase_orders").get() as any;
  if (count.count === 0) {
    seedPurchaseOrders(db);
  }

  return db;
}

export const db = getDb();
