import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { StatCard } from "@/components/StatCard";
import { InvoiceTable } from "@/components/InvoiceTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const all = db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(10).all();
  const total = db.select({ count: count() }).from(invoices).get()?.count ?? 0;
  const autoApprovedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "auto_approved")).get()?.count ?? 0;
  const approvedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "approved")).get()?.count ?? 0;
  const flaggedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "flagged")).get()?.count ?? 0;
  const rejectedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "rejected")).get()?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all processed invoices and their current status.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Processed" value={total} />
        <StatCard label="Auto Approved" value={autoApprovedCount + approvedCount} color="text-green-600" />
        <StatCard label="Needs Review" value={flaggedCount} color="text-amber-600" />
        <StatCard label="Rejected" value={rejectedCount} color="text-red-600" />
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center space-y-3">
          <p className="text-gray-500">No invoices processed yet.</p>
          <p className="text-sm text-gray-400">Upload an invoice or try the sample invoices to see the pipeline in action.</p>
          <Link href="/upload" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors mt-2">
            Go to Upload
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            {flaggedCount > 0 && (
              <Link href="/review" className="text-sm text-amber-600 hover:underline">
                {flaggedCount} invoice(s) need review →
              </Link>
            )}
          </div>
          <InvoiceTable invoices={all} />
        </div>
      )}
    </div>
  );
}
