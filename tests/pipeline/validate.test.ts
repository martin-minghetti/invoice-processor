import { describe, it, expect } from "vitest";
import { validateExtraction } from "@/lib/pipeline/validate";
import type { Extraction } from "@/lib/pipeline/types";

const VALID_EXTRACTION: Extraction = {
  vendor: "Acme Corp",
  invoiceNumber: "INV-001",
  date: "2025-01-15",
  dueDate: "2025-02-15",
  lineItems: [
    { description: "Widget A", quantity: 10, unitPrice: 25.0, total: 250.0 },
    { description: "Widget B", quantity: 5, unitPrice: 50.0, total: 250.0 },
  ],
  subtotal: 500.0,
  tax: 50.0,
  total: 550.0,
  currency: "USD",
  paymentTerms: "Net 30",
};

describe("validateExtraction", () => {
  it("passes for a valid extraction", () => {
    const result = validateExtraction(VALID_EXTRACTION);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when required fields are missing", () => {
    const extraction: Extraction = {
      ...VALID_EXTRACTION,
      vendor: null,
      date: null,
      total: null,
    };
    const result = validateExtraction(extraction);
    expect(result.valid).toBe(false);
    expect(result.errors.filter((e) => e.type === "missing_required")).toHaveLength(3);
  });

  it("detects math error: line items don't sum to subtotal", () => {
    const extraction: Extraction = {
      ...VALID_EXTRACTION,
      subtotal: 999.0,
    };
    const result = validateExtraction(extraction);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === "math_error" && e.field === "subtotal")).toBe(true);
  });

  it("detects math error: subtotal + tax != total", () => {
    const extraction: Extraction = {
      ...VALID_EXTRACTION,
      total: 999.0,
    };
    const result = validateExtraction(extraction);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === "math_error" && e.field === "total")).toBe(true);
  });

  it("tolerates small rounding differences (0.01)", () => {
    const extraction: Extraction = {
      ...VALID_EXTRACTION,
      subtotal: 500.01,
      total: 550.01,
    };
    const result = validateExtraction(extraction);
    expect(result.valid).toBe(true);
  });

  it("passes when optional fields are null", () => {
    const extraction: Extraction = {
      ...VALID_EXTRACTION,
      invoiceNumber: null,
      dueDate: null,
      paymentTerms: null,
    };
    const result = validateExtraction(extraction);
    expect(result.valid).toBe(true);
  });
});
