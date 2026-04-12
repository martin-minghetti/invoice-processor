import { NextRequest, NextResponse } from "next/server";
import { processInvoice } from "@/lib/pipeline/process";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
  fs.writeFileSync(filePath, buffer);

  const result = await processInvoice(buffer, file.type, file.name, db);
  return NextResponse.json(result);
}
