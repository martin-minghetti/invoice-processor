import { describe, it, expect, vi } from "vitest";
import { extractInvoice } from "@/lib/pipeline/extract";
import type { Extraction } from "@/lib/pipeline/types";

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      };
    },
  };
});

const MOCK_EXTRACTION: Extraction = {
  vendor: "Acme Corp",
  invoiceNumber: "INV-2025-001",
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

describe("extractInvoice", () => {
  it("extracts structured data from an image buffer", async () => {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    (client.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(MOCK_EXTRACTION) }],
    });

    const buffer = Buffer.from("fake-image-data");
    const result = await extractInvoice(buffer, "image/jpeg", client);

    expect(result.vendor).toBe("Acme Corp");
    expect(result.invoiceNumber).toBe("INV-2025-001");
    expect(result.lineItems).toHaveLength(2);
    expect(result.total).toBe(550.0);
  });

  it("handles partial extraction (null fields)", async () => {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const partial: Extraction = {
      ...MOCK_EXTRACTION,
      invoiceNumber: null,
      dueDate: null,
      paymentTerms: null,
    };

    (client.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(partial) }],
    });

    const buffer = Buffer.from("fake-image-data");
    const result = await extractInvoice(buffer, "image/jpeg", client);

    expect(result.vendor).toBe("Acme Corp");
    expect(result.invoiceNumber).toBeNull();
    expect(result.dueDate).toBeNull();
  });

  it("throws on completely invalid response", async () => {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    (client.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: "text", text: "I cannot process this image" }],
    });

    const buffer = Buffer.from("fake-image-data");
    await expect(extractInvoice(buffer, "image/jpeg", client)).rejects.toThrow();
  });
});
