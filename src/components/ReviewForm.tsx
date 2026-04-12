"use client";
import { useState } from "react";

type Props = {
  invoiceId: string;
  onReview: (action: "approved" | "rejected", notes: string) => void;
  isSubmitting: boolean;
};

export function ReviewForm({ invoiceId, onReview, isSubmitting }: Props) {
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <p className="text-sm font-medium text-gray-700">Review Decision</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes (optional)..."
        className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="flex gap-3">
        <button
          onClick={() => onReview("approved", notes)}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => onReview("rejected", notes)}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
