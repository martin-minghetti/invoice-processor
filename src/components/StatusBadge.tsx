const STYLES: Record<string, string> = {
  auto_approved: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  flagged: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
};

const LABELS: Record<string, string> = {
  auto_approved: "Auto Approved",
  approved: "Approved",
  flagged: "Needs Review",
  rejected: "Rejected",
  processing: "Processing",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? "bg-gray-100 text-gray-700"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
