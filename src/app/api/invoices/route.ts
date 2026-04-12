import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  const results = status
    ? db.select().from(invoices).where(eq(invoices.status, status)).orderBy(desc(invoices.createdAt)).all()
    : db.select().from(invoices).orderBy(desc(invoices.createdAt)).all();

  return NextResponse.json(results);
}
