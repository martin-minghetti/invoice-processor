import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, lineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = db.select().from(invoices).where(eq(invoices.id, id)).get();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const items = db.select().from(lineItems).where(eq(lineItems.invoiceId, id)).all();
  return NextResponse.json({ ...invoice, lineItems: items });
}
