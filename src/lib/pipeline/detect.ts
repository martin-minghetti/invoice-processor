import { eq, and, sql } from "drizzle-orm";
import { invoices, purchaseOrders } from "../db/schema";
import type { Extraction, ValidationResult, MatchResult, Anomaly } from "./types";

export function detectAnomalies(
  extraction: Extraction,
  validation: ValidationResult,
  match: MatchResult,
  db: any
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  const missingErrors = validation.errors.filter((e) => e.type === "missing_required");
  if (missingErrors.length > 0) {
    anomalies.push({
      rule: "missing_fields",
      severity: "medium",
      message: `Missing required fields: ${missingErrors.map((e) => e.field).join(", ")}`,
    });
  }

  const mathErrors = validation.errors.filter((e) => e.type === "math_error");
  if (mathErrors.length > 0) {
    anomalies.push({
      rule: "math_error",
      severity: "medium",
      message: `Math discrepancies: ${mathErrors.map((e) => e.message).join("; ")}`,
    });
  }

  if (match.status === "no_match") {
    anomalies.push({
      rule: "no_po_match",
      severity: "low",
      message: `No purchase order found for vendor "${extraction.vendor}"`,
    });
  }

  if (match.status === "partial") {
    anomalies.push({
      rule: "partial_po_match",
      severity: "low",
      message: `Vendor matched but amount doesn't match any PO`,
    });
  }

  if (match.poId && extraction.total !== null) {
    const po = db.select().from(purchaseOrders).where(eq(purchaseOrders.id, match.poId)).get();
    if (po && extraction.total > po.amount * 2) {
      anomalies.push({
        rule: "amount_mismatch",
        severity: "high",
        message: `Invoice total (${extraction.total}) is more than 2x the PO amount (${po.amount})`,
      });
    }
  }

  if (extraction.vendor && extraction.total !== null && extraction.date) {
    const invoiceDate = new Date(extraction.date);
    const dayBefore = new Date(invoiceDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(invoiceDate);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const existing = db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.vendor, extraction.vendor),
          eq(invoices.total, extraction.total),
          sql`${invoices.date} >= ${dayBefore.toISOString().split("T")[0]}`,
          sql`${invoices.date} <= ${dayAfter.toISOString().split("T")[0]}`
        )
      )
      .all();

    if (existing.length > 0) {
      anomalies.push({
        rule: "duplicate",
        severity: "high",
        message: `Possible duplicate: invoice from ${extraction.vendor} for ${extraction.total} on ${extraction.date} already exists`,
      });
    }
  }

  return anomalies;
}
