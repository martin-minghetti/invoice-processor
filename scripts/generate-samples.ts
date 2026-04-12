import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const SAMPLES_DIR = path.join(process.cwd(), "samples");

if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

interface LineItem {
  description: string;
  qty: number;
  unit: number;
  total: number;
}

function createInvoice(
  outputPath: string,
  opts: {
    vendor: string;
    vendorAddress: string;
    vendorEmail: string;
    billTo: string;
    invoiceNumber?: string;
    invoiceDate: string;
    dueDate?: string;
    poNumber?: string;
    lineItems: LineItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
  }
) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - 100; // margins on both sides

  // ── Header ──────────────────────────────────────────────────────────────
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(opts.vendor, 50, 50);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(opts.vendorAddress, 50, 78)
    .text(opts.vendorEmail, 50, 90);

  // INVOICE title (top-right)
  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#2563eb")
    .text("INVOICE", 350, 50, { width: 200, align: "right" });

  doc.fillColor("#000000");

  // ── Invoice meta box ────────────────────────────────────────────────────
  const metaTop = 110;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Invoice No:", 350, metaTop)
    .text("Invoice Date:", 350, metaTop + 14)
    .text("Due Date:", 350, metaTop + 28)
    .text("PO Number:", 350, metaTop + 42);

  doc
    .font("Helvetica")
    .text(opts.invoiceNumber ?? "(none)", 430, metaTop)
    .text(opts.invoiceDate, 430, metaTop + 14)
    .text(opts.dueDate ?? "(none)", 430, metaTop + 28)
    .text(opts.poNumber ?? "N/A", 430, metaTop + 42);

  // ── Bill To ─────────────────────────────────────────────────────────────
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("BILL TO", 50, metaTop);

  doc
    .font("Helvetica")
    .text(opts.billTo, 50, metaTop + 14, { width: 250 });

  // ── Divider ─────────────────────────────────────────────────────────────
  const tableTop = 230;
  doc
    .moveTo(50, tableTop - 5)
    .lineTo(550, tableTop - 5)
    .strokeColor("#d1d5db")
    .stroke();

  // ── Table header ────────────────────────────────────────────────────────
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#374151")
    .text("DESCRIPTION", 50, tableTop)
    .text("QTY", 320, tableTop, { width: 50, align: "right" })
    .text("UNIT PRICE", 375, tableTop, { width: 80, align: "right" })
    .text("AMOUNT", 460, tableTop, { width: 90, align: "right" });

  doc
    .moveTo(50, tableTop + 14)
    .lineTo(550, tableTop + 14)
    .stroke();

  // ── Line items ──────────────────────────────────────────────────────────
  doc.fillColor("#000000").font("Helvetica").fontSize(9);

  let y = tableTop + 22;
  for (const item of opts.lineItems) {
    doc.text(item.description, 50, y, { width: 265 });
    doc.text(String(item.qty), 320, y, { width: 50, align: "right" });
    doc.text(`$${item.unit.toFixed(2)}`, 375, y, { width: 80, align: "right" });
    doc.text(`$${item.total.toFixed(2)}`, 460, y, { width: 90, align: "right" });
    y += 18;
  }

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalsTop = y + 10;
  doc
    .moveTo(50, totalsTop)
    .lineTo(550, totalsTop)
    .strokeColor("#d1d5db")
    .stroke();

  const labelX = 380;
  const valueX = 460;
  const valueW = 90;

  doc.font("Helvetica").fontSize(9);
  doc.text("Subtotal:", labelX, totalsTop + 8, { width: 75, align: "right" });
  doc.text(`$${opts.subtotal.toFixed(2)}`, valueX, totalsTop + 8, { width: valueW, align: "right" });

  doc.text("Tax (8%):", labelX, totalsTop + 22, { width: 75, align: "right" });
  doc.text(`$${opts.tax.toFixed(2)}`, valueX, totalsTop + 22, { width: valueW, align: "right" });

  doc
    .moveTo(380, totalsTop + 36)
    .lineTo(550, totalsTop + 36)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(11);
  doc.text("TOTAL:", labelX, totalsTop + 40, { width: 75, align: "right" });
  doc
    .fillColor("#2563eb")
    .text(`$${opts.total.toFixed(2)}`, valueX, totalsTop + 40, { width: valueW, align: "right" });

  doc.fillColor("#000000");

  // ── Notes ────────────────────────────────────────────────────────────────
  if (opts.notes) {
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Notes: " + opts.notes, 50, totalsTop + 70, { width: 300 });
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  doc
    .fontSize(8)
    .fillColor("#9ca3af")
    .text("Thank you for your business.", 50, doc.page.height - 60, {
      width: pageWidth,
      align: "center",
    });

  doc.end();

  return new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function main() {
  console.log("Generating sample invoices in samples/...");

  // 1. invoice-clean.pdf — Acme Corp, $2500, matches PO-2024-001
  await createInvoice(path.join(SAMPLES_DIR, "invoice-clean.pdf"), {
    vendor: "Acme Corp",
    vendorAddress: "123 Main Street, Springfield, IL 62701",
    vendorEmail: "billing@acmecorp.com",
    billTo: "Buyer Co Ltd\n456 Commerce Ave\nNew York, NY 10001",
    invoiceNumber: "INV-2024-0891",
    invoiceDate: "2024-11-20",
    dueDate: "2024-12-20",
    poNumber: "PO-2024-001",
    lineItems: [
      { description: "Office Supplies — Paper reams (A4, 80gsm)", qty: 20, unit: 45.00, total: 900.00 },
      { description: "Ballpoint pens, assorted colors (box of 50)", qty: 10, unit: 18.00, total: 180.00 },
      { description: "Filing cabinet folders (pack of 100)", qty: 5, unit: 24.00, total: 120.00 },
      { description: "Desk organizer sets", qty: 8, unit: 55.00, total: 440.00 },
      { description: "Whiteboard markers (set of 12)", qty: 15, unit: 12.00, total: 180.00 },
      { description: "Sticky notes multi-pack", qty: 25, unit: 8.00, total: 200.00 },
      { description: "Printer ink cartridges (black, HP compat.)", qty: 7, unit: 68.57, total: 480.00 },
    ],
    subtotal: 2500.00,
    tax: 200.00,
    total: 2700.00,
    notes: "Payment due within 30 days. Reference PO-2024-001 on remittance.",
  });
  console.log("  ✓ invoice-clean.pdf");

  // 2. invoice-amount-mismatch.pdf — TechFlow Inc, $25000 (PO is $8750)
  await createInvoice(path.join(SAMPLES_DIR, "invoice-amount-mismatch.pdf"), {
    vendor: "TechFlow Inc",
    vendorAddress: "789 Tech Park Blvd, Austin, TX 78701",
    vendorEmail: "accounts@techflow.com",
    billTo: "Buyer Co Ltd\n456 Commerce Ave\nNew York, NY 10001",
    invoiceNumber: "TF-2024-4412",
    invoiceDate: "2024-11-25",
    dueDate: "2024-12-25",
    poNumber: "PO-2024-002",
    lineItems: [
      { description: "Enterprise Software License — Suite Pro (annual)", qty: 5, unit: 2400.00, total: 12000.00 },
      { description: "Developer seats — API access tier (annual)", qty: 10, unit: 850.00, total: 8500.00 },
      { description: "Premium support & SLA agreement (annual)", qty: 1, unit: 3000.00, total: 3000.00 },
      { description: "Onboarding & training sessions (8 hrs)", qty: 1, unit: 1500.00, total: 1500.00 },
    ],
    subtotal: 25000.00,
    tax: 2000.00,
    total: 27000.00,
    notes: "Invoice total reflects expanded scope per revised SOW dated 2024-11-22.",
  });
  console.log("  ✓ invoice-amount-mismatch.pdf");

  // 3. invoice-missing-fields.pdf — Missing invoice number and due date
  await createInvoice(path.join(SAMPLES_DIR, "invoice-missing-fields.pdf"), {
    vendor: "Global Logistics",
    vendorAddress: "321 Freight Way, Chicago, IL 60601",
    vendorEmail: "invoices@globallogistics.com",
    billTo: "Buyer Co Ltd\n456 Commerce Ave\nNew York, NY 10001",
    // invoiceNumber intentionally omitted
    invoiceDate: "2024-12-05",
    // dueDate intentionally omitted
    poNumber: "PO-2024-003",
    lineItems: [
      { description: "Domestic freight — Zone A (December batch)", qty: 14, unit: 180.00, total: 2520.00 },
      { description: "Fuel surcharge (7% of freight)", qty: 1, unit: 176.40, total: 176.40 },
      { description: "Packaging & handling fee", qty: 14, unit: 38.00, total: 532.00 },
      { description: "Liftgate service", qty: 3, unit: 75.00, total: 225.00 },
      { description: "Insurance rider (0.5% of declared value)", qty: 1, unit: 62.40, total: 62.40 },
    ],
    subtotal: 3515.80,
    tax: 281.26,
    total: 3797.06,
    notes: "Invoice number not yet assigned — contact accounting@globallogistics.com.",
  });
  console.log("  ✓ invoice-missing-fields.pdf");

  // 4. invoice-no-po.pdf — Quantum Dynamics Ltd, vendor not in PO seed
  await createInvoice(path.join(SAMPLES_DIR, "invoice-no-po.pdf"), {
    vendor: "Quantum Dynamics Ltd",
    vendorAddress: "55 Innovation Drive, Cambridge, MA 02139",
    vendorEmail: "finance@quantumdynamics.com",
    billTo: "Buyer Co Ltd\n456 Commerce Ave\nNew York, NY 10001",
    invoiceNumber: "QDL-2025-0042",
    invoiceDate: "2025-01-10",
    dueDate: "2025-02-10",
    // No poNumber — vendor is not in PO seed data
    lineItems: [
      { description: "Quantum computing consulting — Phase 1 research", qty: 40, unit: 250.00, total: 10000.00 },
      { description: "Lab access fee (shared quantum processor time)", qty: 8, unit: 500.00, total: 4000.00 },
      { description: "Technical report & IP documentation", qty: 1, unit: 2000.00, total: 2000.00 },
    ],
    subtotal: 16000.00,
    tax: 1280.00,
    total: 17280.00,
    notes: "No purchase order reference — please issue PO before payment processing.",
  });
  console.log("  ✓ invoice-no-po.pdf");

  // 5. invoice-math-error.pdf — Line items don't add up to subtotal
  await createInvoice(path.join(SAMPLES_DIR, "invoice-math-error.pdf"), {
    vendor: "DataSync Pro",
    vendorAddress: "900 Data Center Loop, Seattle, WA 98101",
    vendorEmail: "billing@datasyncpro.com",
    billTo: "Buyer Co Ltd\n456 Commerce Ave\nNew York, NY 10001",
    invoiceNumber: "DSP-2025-1107",
    invoiceDate: "2025-02-05",
    dueDate: "2025-03-07",
    poNumber: "PO-2025-003",
    lineItems: [
      // Correct totals: 1200 + 960 + 480 + 420 = 3060, but subtotal is stated as 5400
      { description: "Data migration — source extraction (40 hrs @ $30/hr)", qty: 40, unit: 30.00, total: 1200.00 },
      { description: "Data transformation & cleansing (32 hrs @ $30/hr)", qty: 32, unit: 30.00, total: 960.00 },
      { description: "Data loading & validation (16 hrs @ $30/hr)", qty: 16, unit: 30.00, total: 480.00 },
      { description: "Project management & reporting (14 hrs @ $30/hr)", qty: 14, unit: 30.00, total: 420.00 },
    ],
    // Claimed subtotal is $5400 but line items only sum to $3060 — math error
    subtotal: 5400.00,
    tax: 432.00,
    total: 5832.00,
    notes: "Data migration services per SOW-2025-003. Rates per agreed contract schedule.",
  });
  console.log("  ✓ invoice-math-error.pdf");

  console.log("\nDone! 5 sample invoices created in samples/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
