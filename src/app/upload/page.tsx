// src/app/upload/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/UploadZone";
import { PipelineProgress } from "@/components/PipelineProgress";

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setIsProcessing(true);
    setError(null);
    setStep(0);

    const formData = new FormData();
    formData.append("file", file);

    const stepInterval = setInterval(() => {
      setStep((s) => (s < 4 ? s + 1 : s));
    }, 800);

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      clearInterval(stepInterval);
      if (!res.ok) throw new Error((await res.json()).error || "Processing failed");
      const data = await res.json();
      setStep(5);
      setResult(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message);
      setStep(-1);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleProcessSamples() {
    setIsProcessing(true);
    setError(null);
    setStep(0);

    const stepInterval = setInterval(() => {
      setStep((s) => (s < 4 ? s + 1 : s));
    }, 1500);

    try {
      const res = await fetch("/api/process-samples", { method: "POST" });
      clearInterval(stepInterval);
      if (!res.ok) throw new Error((await res.json()).error || "Processing failed");
      const data = await res.json();
      setStep(5);
      setResult(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message);
      setStep(-1);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Upload Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a PDF or image of an invoice. Claude Vision will extract all data and run it through the anomaly detection pipeline.</p>
      </div>
      <UploadZone onUpload={handleUpload} onProcessSamples={handleProcessSamples} isProcessing={isProcessing} />
      {!isProcessing && !result && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500">Supported formats</p>
          <p className="text-xs text-gray-400">PDF, JPEG, PNG, WebP — any invoice, receipt, or billing document.</p>
          <p className="text-xs font-medium text-gray-500 pt-2">What happens next</p>
          <p className="text-xs text-gray-400">The pipeline extracts vendor, amounts, and line items, validates math, matches against purchase orders, and flags anomalies. Clean invoices are auto-approved; suspicious ones go to the review queue.</p>
        </div>
      )}
      <PipelineProgress currentStep={step} status={step >= 5 ? "done" : "processing"} />
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <p className="font-medium">Processing complete!</p>
          {result.invoiceId && (
            <button onClick={() => router.push(`/invoices/${result.invoiceId}`)} className="mt-2 text-green-800 underline">
              View invoice details
            </button>
          )}
          {result.processed && (
            <button onClick={() => router.push("/")} className="mt-2 text-green-800 underline">
              View {result.processed} processed invoices on dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}
