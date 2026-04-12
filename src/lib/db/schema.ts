import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  poNumber: text("po_number").notNull(),
  vendor: text("vendor").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  rawExtraction: text("raw_extraction"),
  vendor: text("vendor"),
  invoiceNumber: text("invoice_number"),
  date: text("date"),
  dueDate: text("due_date"),
  subtotal: real("subtotal"),
  tax: real("tax"),
  total: real("total"),
  currency: text("currency"),
  poMatchId: text("po_match_id").references(() => purchaseOrders.id),
  matchStatus: text("match_status"),
  status: text("status").notNull().default("processing"),
  anomalies: text("anomalies"),
  reviewerNotes: text("reviewer_notes"),
  createdAt: text("created_at").notNull(),
  reviewedAt: text("reviewed_at"),
});

export const lineItems = sqliteTable("line_items", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  total: real("total").notNull(),
});
