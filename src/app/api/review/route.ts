import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const ReviewSchema = z.object({
  invoiceId: z.string(),
  action: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { invoiceId, action, notes } = parsed.data;

  const invoice = db.select().from(invoices).where(eq(invoices.id, invoiceId)).get();
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  db.update(invoices)
    .set({
      status: action,
      reviewerNotes: notes || null,
      reviewedAt: new Date().toISOString(),
    })
    .where(eq(invoices.id, invoiceId))
    .run();

  return NextResponse.json({ success: true, status: action });
}
