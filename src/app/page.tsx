import Link from "next/link";

export default function HomePage() {
  const steps = [
    { num: "1", title: "Extract", desc: "Claude Vision reads your invoice and extracts vendor, amounts, line items, and dates automatically." },
    { num: "2", title: "Validate", desc: "Zod schemas check required fields and verify math — do line items add up to the subtotal?" },
    { num: "3", title: "Match", desc: "Fuzzy search finds matching purchase orders by vendor name and amount (10% tolerance)." },
    { num: "4", title: "Detect", desc: "Six anomaly rules flag duplicates, amount mismatches, missing fields, and math errors." },
    { num: "5", title: "Route", desc: "Clean invoices are auto-approved. Anything suspicious goes to the human review queue." },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">InvoiceAI</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          AI-powered invoice processing that extracts data from any document, catches anomalies, and knows when to ask a human.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href="/upload" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Upload an Invoice
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <p className="text-sm text-gray-500 text-center">Upload a PDF or image — the pipeline does the rest in seconds.</p>
        <div className="grid gap-4 sm:grid-cols-5">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{s.num}</div>
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What gets flagged */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">What Gets Flagged</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">High Severity</p>
            <p className="text-xs text-red-600 mt-1">Duplicate invoices, amounts over 2x the purchase order</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-700">Medium Severity</p>
            <p className="text-xs text-amber-600 mt-1">Missing required fields, math errors in line items</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Low Severity</p>
            <p className="text-xs text-gray-500 mt-1">No purchase order match, partial vendor match</p>
          </div>
        </div>
      </div>

      {/* Quick start */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center space-y-3">
        <p className="text-sm font-medium text-blue-800">Quick Demo</p>
        <p className="text-xs text-blue-600">Go to Upload and click "Try with sample invoices" — 5 pre-built invoices will run through the pipeline, each triggering a different scenario.</p>
        <Link href="/upload" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Try It Now
        </Link>
      </div>

      {/* Tech */}
      <div className="text-center space-y-2 pb-8">
        <p className="text-xs text-gray-400">Built with Next.js, Claude Vision API, Zod, Drizzle ORM, SQLite, and Tailwind CSS</p>
        <p className="text-xs text-gray-400">
          <a href="https://github.com/martin-minghetti/invoice-processor" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </div>
    </div>
  );
}
