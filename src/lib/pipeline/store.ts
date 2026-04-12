import { nanoid } from "nanoid";
import { invoices, lineItems } from "../db/schema";
import type { Extraction, MatchResult, Anomaly, InvoiceStatus } from "./types";

function determineStatus(match: MatchResult, anomalies: Anomaly[]): InvoiceStatus {
  const hasMediumOrHighAnomaly = anomalies.some(
    (a) => a.severity === "medium" || a.severity === "high"
  );
  if (hasMediumOrHighAnomaly) return "flagged";
  if (match.status !== "matched") return "flagged";
  return "auto_approved";
}

export function storeInvoice(
  fileName: string,
  fileType: string,
  extraction: Extraction,
  match: MatchResult,
  anomalies: Anomaly[],
  db: any
): string {
  const id = nanoid();
  const status = determineStatus(match, anomalies);

  db.insert(invoices)
    .values({
      id,
      fileName,
      fileType,
      rawExtraction: JSON.stringify(extraction),
      vendor: extraction.vendor,
      invoiceNumber: extraction.invoiceNumber,
      date: extraction.date,
      dueDate: extraction.dueDate,
      subtotal: extraction.subtotal,
      tax: extraction.tax,
      total: extraction.total,
      currency: extraction.currency,
      poMatchId: match.poId,
      matchStatus: match.status,
      status,
      anomalies: JSON.stringify(anomalies),
      createdAt: new Date().toISOString(),
    })
    .run();

  for (const item of extraction.lineItems) {
    db.insert(lineItems)
      .values({
        id: nanoid(),
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })
      .run();
  }

  return id;
}
