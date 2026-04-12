import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET() {
  const all = db.select({ count: count() }).from(invoices).get();
  const autoApproved = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "auto_approved")).get();
  const flagged = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "flagged")).get();
  const approved = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "approved")).get();
  const rejected = db.select({ count: count() }).from(invoices).where(eq(invoices.status, "rejected")).get();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const daily = db
    .select({
      date: sql<string>`date(${invoices.createdAt})`,
      count: count(),
    })
    .from(invoices)
    .where(sql`${invoices.createdAt} >= ${sevenDaysAgo.toISOString()}`)
    .groupBy(sql`date(${invoices.createdAt})`)
    .all();

  return NextResponse.json({
    total: all?.count ?? 0,
    autoApproved: autoApproved?.count ?? 0,
    flagged: flagged?.count ?? 0,
    approved: approved?.count ?? 0,
    rejected: rejected?.count ?? 0,
    daily,
  });
}
