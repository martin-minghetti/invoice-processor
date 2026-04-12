import { purchaseOrders } from "../db/schema";
import type { MatchResult } from "./types";

const AMOUNT_TOLERANCE = 0.10;

export function matchInvoice(
  vendor: string | null,
  total: number | null,
  db: any
): MatchResult {
  if (!vendor) {
    return { status: "no_match", poId: null, poNumber: null, confidence: "none" };
  }

  const vendorLower = vendor.toLowerCase();
  const allPOs = db.select().from(purchaseOrders).all();
  const vendorMatches = allPOs.filter(
    (po: any) =>
      po.vendor.toLowerCase().includes(vendorLower) ||
      vendorLower.includes(po.vendor.toLowerCase())
  );

  if (vendorMatches.length === 0) {
    return { status: "no_match", poId: null, poNumber: null, confidence: "none" };
  }

  if (total !== null) {
    for (const po of vendorMatches) {
      const diff = Math.abs(po.amount - total) / po.amount;
      if (diff <= AMOUNT_TOLERANCE) {
        return {
          status: "matched",
          poId: po.id,
          poNumber: po.poNumber,
          confidence: "vendor+amount",
        };
      }
    }
  }

  return { status: "partial", poId: null, poNumber: null, confidence: "vendor_only" };
}
