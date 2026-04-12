import type { Extraction, ValidationResult, ValidationError } from "./types";

const REQUIRED_FIELDS = ["vendor", "date", "total"] as const;
const MATH_TOLERANCE = 0.02;

export function validateExtraction(extraction: Extraction): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (extraction[field] === null || extraction[field] === undefined) {
      errors.push({
        field,
        message: `Required field "${field}" is missing`,
        type: "missing_required",
      });
    }
  }

  if (extraction.subtotal !== null && extraction.lineItems.length > 0) {
    const lineItemsSum = extraction.lineItems.reduce((sum, item) => sum + item.total, 0);
    if (Math.abs(lineItemsSum - extraction.subtotal) > MATH_TOLERANCE) {
      errors.push({
        field: "subtotal",
        message: `Line items sum (${lineItemsSum.toFixed(2)}) doesn't match subtotal (${extraction.subtotal.toFixed(2)})`,
        type: "math_error",
      });
    }
  }

  if (extraction.subtotal !== null && extraction.tax !== null && extraction.total !== null) {
    const expectedTotal = extraction.subtotal + extraction.tax;
    if (Math.abs(expectedTotal - extraction.total) > MATH_TOLERANCE) {
      errors.push({
        field: "total",
        message: `Subtotal (${extraction.subtotal.toFixed(2)}) + tax (${extraction.tax.toFixed(2)}) = ${expectedTotal.toFixed(2)}, but total is ${extraction.total.toFixed(2)}`,
        type: "math_error",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
