// src/app/review/page.tsx
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { InvoiceTable } from "@/components/InvoiceTable";

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
        <p className="text-sm text-gray-500 mt-1">{flagged.length} invoice(s) need human review</p>
      </div>
      <InvoiceTable invoices={flagged} />
    </div>
  );
}
