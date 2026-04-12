const STEPS = ["Extracting data", "Validating fields", "Matching PO", "Detecting anomalies", "Storing result"];

type Props = { currentStep: number; status?: "processing" | "done" | "error" };

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
                isCurrent ? "bg-blue-100 text-blue-700 animate-pulse" :
                "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? "\u2713" : i + 1}
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
