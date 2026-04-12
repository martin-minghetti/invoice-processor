"use client";
import { useState, useCallback } from "react";

type Props = {
  onUpload: (file: File) => void;
  onProcessSamples: () => void;
  isProcessing: boolean;
};

export function UploadZone({ onUpload, onProcessSamples, isProcessing }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        <p className="text-gray-500 mb-3">Drag & drop an invoice (PDF, JPG, PNG)</p>
        <label className="cursor-pointer inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Choose file
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-400">or</span>
      </div>
      <button
        onClick={onProcessSamples}
        disabled={isProcessing}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Try with sample invoices
      </button>
    </div>
  );
}
