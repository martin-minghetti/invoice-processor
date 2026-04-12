const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export function AnomalyBadge({ rule, severity }: { rule: string; severity: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${SEVERITY_STYLES[severity] ?? "bg-gray-100"}`}>
      {rule.replace(/_/g, " ")}
    </span>
  );
}
