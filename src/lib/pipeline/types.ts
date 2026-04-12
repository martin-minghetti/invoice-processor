import { z } from "zod";

export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

export const ExtractionSchema = z.object({
  vendor: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  date: z.string().nullable(),
  dueDate: z.string().nullable(),
  lineItems: z.array(LineItemSchema),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().nullable(),
  currency: z.string().nullable(),
  paymentTerms: z.string().nullable(),
});

export type LineItem = z.infer<typeof LineItemSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;

export type ValidationError = {
  field: string;
  message: string;
  type: "missing_required" | "math_error" | "invalid_format";
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type MatchStatus = "matched" | "partial" | "no_match";

export type MatchResult = {
  status: MatchStatus;
  poId: string | null;
  poNumber: string | null;
  confidence: string;
};

export type AnomalySeverity = "low" | "medium" | "high";

export type Anomaly = {
  rule: string;
  severity: AnomalySeverity;
  message: string;
};

export type InvoiceStatus =
  | "processing"
  | "auto_approved"
  | "flagged"
  | "approved"
  | "rejected";

export type PipelineResult = {
  extraction: Extraction;
  validation: ValidationResult;
  match: MatchResult;
  anomalies: Anomaly[];
  status: InvoiceStatus;
  invoiceId: string;
};
