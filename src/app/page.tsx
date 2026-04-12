// src/app/page.tsx
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { StatCard } from "@/components/StatCard";
import { InvoiceTable } from "@/components/InvoiceTable";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const all = db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(10).all();
  const total = db.select({ count: count() }).from(invoices).get()?.count ?? 0;
  const autoApprovedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "auto_approved")).get()?.count ?? 0;
  const flaggedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "flagged")).get()?.count ?? 0;
  const rejectedCount = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "rejected")).get()?.count ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Processed" value={total} />
        <StatCard label="Auto Approved" value={autoApprovedCount} color="text-green-600" />
        <StatCard label="Needs Review" value={flaggedCount} color="text-amber-600" />
        <StatCard label="Rejected" value={rejectedCount} color="text-red-600" />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>
        <InvoiceTable invoices={all} />
      </div>
    </div>
  );
}
