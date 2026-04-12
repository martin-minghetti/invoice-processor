type Props = { label: string; value: number; color?: string };

export function StatCard({ label, value, color = "text-gray-900" }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
