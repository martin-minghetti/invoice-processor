// src/app/invoices/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { AnomalyBadge } from "@/components/AnomalyBadge";
import { ReviewForm } from "@/components/ReviewForm";

type InvoiceDetail = {
  id: string; fileName: string; vendor: string | null;
  invoiceNumber: string | null; date: string | null; dueDate: string | null;
  subtotal: number | null; tax: number | null; total: number | null;
  currency: string | null; matchStatus: string | null; status: string;
  anomalies: string | null; reviewerNotes: string | null;
  reviewedAt: string | null; createdAt: string;
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then(setInvoice);
  }, [id]);

  async function handleReview(action: "approved" | "rejected", notes: string) {
    setIsSubmitting(true);
    await fetch("/api/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: id, action, notes }),
    });
    router.push("/review");
  }

  if (!invoice) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const anomalies = invoice.anomalies ? JSON.parse(invoice.anomalies) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{invoice.vendor ?? "Unknown Vendor"}</h1>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-medium text-gray-500">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Invoice #:</span> {invoice.invoiceNumber ?? "\u2014"}</div>
              <div><span className="text-gray-400">Date:</span> {invoice.date ?? "\u2014"}</div>
              <div><span className="text-gray-400">Due:</span> {invoice.dueDate ?? "\u2014"}</div>
              <div><span className="text-gray-400">Currency:</span> {invoice.currency ?? "\u2014"}</div>
              <div><span className="text-gray-400">PO Match:</span> {invoice.matchStatus?.replace("_", " ") ?? "\u2014"}</div>
              <div><span className="text-gray-400">File:</span> {invoice.fileName}</div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Line Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-400">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-sm text-right space-y-1">
              <div>Subtotal: ${invoice.subtotal?.toFixed(2) ?? "\u2014"}</div>
              <div>Tax: ${invoice.tax?.toFixed(2) ?? "\u2014"}</div>
              <div className="font-bold text-base">Total: ${invoice.total?.toFixed(2) ?? "\u2014"}</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {anomalies.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-medium text-amber-700 mb-3">Anomalies Detected</h2>
              <div className="space-y-2">
                {anomalies.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <AnomalyBadge rule={a.rule} severity={a.severity} />
                    <span className="text-sm text-gray-700">{a.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {invoice.status === "flagged" && (
            <ReviewForm invoiceId={invoice.id} onReview={handleReview} isSubmitting={isSubmitting} />
          )}
          {invoice.reviewerNotes && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Reviewer Notes</h2>
              <p className="text-sm">{invoice.reviewerNotes}</p>
              <p className="text-xs text-gray-400 mt-2">Reviewed: {invoice.reviewedAt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
