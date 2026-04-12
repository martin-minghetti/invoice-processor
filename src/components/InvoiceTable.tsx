"use client";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { AnomalyBadge } from "./AnomalyBadge";

type Invoice = {
  id: string; vendor: string | null; total: number | null;
  currency: string | null; date: string | null; status: string;
  anomalies: string | null; createdAt: string;
};

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Vendor</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Anomalies</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoices.map((inv) => {
            const anomalies = inv.anomalies ? JSON.parse(inv.anomalies) : [];
            return (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                    {inv.vendor ?? "Unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {inv.total != null ? `${inv.currency ?? "$"}${inv.total.toFixed(2)}` : "\u2014"}
                </td>
                <td className="px-4 py-3 text-gray-500">{inv.date ?? "\u2014"}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {anomalies.map((a: any, i: number) => (
                      <AnomalyBadge key={i} rule={a.rule} severity={a.severity} />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
          {invoices.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No invoices yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
