const STEPS = ["Extracting data", "Validating fields", "Matching PO", "Detecting anomalies", "Storing result"];

type Props = { currentStep: number; status?: "processing" | "done" | "error" };

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PipelineProgress({ currentStep, status = "processing" }: Props) {
  if (currentStep < 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-700 mb-3">Pipeline Progress</p>
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep || status === "done";
          const isCurrent = i === currentStep && status === "processing";
          return (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium ${
                isDone ? "bg-green-100 text-green-700" :
                isCurrent ? "bg-blue-50" :
                "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? "\u2713" : isCurrent ? <Spinner /> : i + 1}
              </span>
              <span className={isDone ? "text-gray-700" : isCurrent ? "text-blue-700 font-medium" : "text-gray-400"}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
