import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { InvoiceTable } from "@/components/InvoiceTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  const flagged = db
    .select().from(invoices)
    .where(eq(invoices.status, "flagged"))
    .orderBy(desc(invoices.createdAt))
    .all();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Invoices flagged by the anomaly detection pipeline. Click on any invoice to review the details and approve or reject it.
        </p>
      </div>

      {flagged.length > 0 ? (
        <>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              <span className="font-medium">{flagged.length} invoice(s)</span> need human review — flagged for anomalies like missing fields, math errors, duplicate detection, or unmatched purchase orders.
            </p>
          </div>
          <InvoiceTable invoices={flagged} />
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center space-y-3">
          <p className="text-gray-500">No invoices pending review.</p>
          <p className="text-sm text-gray-400">All processed invoices either passed validation or have already been reviewed.</p>
          <Link href="/upload" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors mt-2">
            Upload New Invoice
          </Link>
        </div>
      )}
    </div>
  );
}
