import Anthropic from "@anthropic-ai/sdk";
import { ExtractionSchema, type Extraction } from "./types";

const SYSTEM_PROMPT = `You are an invoice data extraction system. Extract structured data from the invoice image provided.

Return ONLY a JSON object with these exact fields:
{
  "vendor": string or null,
  "invoiceNumber": string or null,
  "date": "YYYY-MM-DD" or null,
  "dueDate": "YYYY-MM-DD" or null,
  "lineItems": [{"description": string, "quantity": number, "unitPrice": number, "total": number}],
  "subtotal": number or null,
  "tax": number or null,
  "total": number or null,
  "currency": "USD" (3-letter ISO code) or null,
  "paymentTerms": string or null
}

Rules:
- Return ONLY the JSON, no markdown, no explanation
- Use null for fields you cannot find or read
- Amounts must be numbers (no currency symbols)
- Dates must be YYYY-MM-DD format
- Line item totals should be quantity * unitPrice`;

export async function extractInvoice(
  fileBuffer: Buffer,
  mediaType: string,
  client?: Anthropic
): Promise<Extraction> {
  const anthropic = client ?? new Anthropic();

  const base64 = fileBuffer.toString("base64");
  const isPdf = mediaType === "application/pdf";

  const fileBlock = isPdf
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: base64,
        },
      };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          fileBlock,
          {
            type: "text",
            text: "Extract all invoice data from this document.",
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const text = response.content[0];
  if (text.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const cleaned = text.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return ExtractionSchema.parse(parsed);
}
