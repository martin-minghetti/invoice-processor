import { extractInvoice } from "./extract";
import { validateExtraction } from "./validate";
import { matchInvoice } from "./match";
import { detectAnomalies } from "./detect";
import { storeInvoice } from "./store";
import type { PipelineResult } from "./types";

export async function processInvoice(
  fileBuffer: Buffer,
  mediaType: string,
  fileName: string,
  db: any
): Promise<PipelineResult> {
  const extraction = await extractInvoice(fileBuffer, mediaType);
  const validation = validateExtraction(extraction);
  const match = matchInvoice(extraction.vendor, extraction.total, db);
  const anomalies = detectAnomalies(extraction, validation, match, db);
  const invoiceId = storeInvoice(
    fileName,
    mediaType.split("/")[1] || "unknown",
    extraction,
    match,
    anomalies,
    db
  );

  const hasMediumOrHigh = anomalies.some((a) => a.severity === "medium" || a.severity === "high");
  const status = hasMediumOrHigh || match.status !== "matched" ? "flagged" : "auto_approved";

  return { extraction, validation, match, anomalies, status, invoiceId };
}
