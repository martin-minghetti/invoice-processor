import { nanoid } from "nanoid";
import { purchaseOrders } from "./schema";

const PO_DATA = [
  { poNumber: "PO-2024-001", vendor: "Acme Corp", amount: 2500.00, date: "2024-11-15", description: "Office supplies Q4" },
  { poNumber: "PO-2024-002", vendor: "TechFlow Inc", amount: 8750.00, date: "2024-11-20", description: "Software licenses annual" },
  { poNumber: "PO-2024-003", vendor: "Global Logistics", amount: 4200.00, date: "2024-12-01", description: "Shipping services December" },
  { poNumber: "PO-2024-004", vendor: "CloudBase Solutions", amount: 12000.00, date: "2024-12-05", description: "Cloud hosting Q1 2025" },
  { poNumber: "PO-2024-005", vendor: "Martinez & Associates", amount: 6500.00, date: "2024-12-10", description: "Legal consultation" },
  { poNumber: "PO-2025-001", vendor: "Acme Corp", amount: 3100.00, date: "2025-01-08", description: "Office supplies Q1" },
  { poNumber: "PO-2025-002", vendor: "PrintWorks Ltd", amount: 1800.00, date: "2025-01-15", description: "Marketing materials" },
  { poNumber: "PO-2025-003", vendor: "DataSync Pro", amount: 5400.00, date: "2025-02-01", description: "Data migration services" },
  { poNumber: "PO-2025-004", vendor: "Green Energy Co", amount: 9800.00, date: "2025-02-10", description: "Solar panel installation" },
  { poNumber: "PO-2025-005", vendor: "TechFlow Inc", amount: 4500.00, date: "2025-03-01", description: "Hardware upgrade batch" },
  { poNumber: "PO-2025-006", vendor: "Office Depot", amount: 750.00, date: "2025-03-15", description: "Printer cartridges" },
  { poNumber: "PO-2025-007", vendor: "SecureNet Systems", amount: 15000.00, date: "2025-03-20", description: "Security audit annual" },
];

export function seedPurchaseOrders(db: any) {
  for (const po of PO_DATA) {
    db.insert(purchaseOrders).values({ id: nanoid(), ...po }).run();
  }
}
