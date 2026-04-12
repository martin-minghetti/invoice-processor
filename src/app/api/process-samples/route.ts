import { NextResponse } from "next/server";
import { processInvoice } from "@/lib/pipeline/process";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST() {
  const samplesDir = path.join(process.cwd(), "samples");
  if (!fs.existsSync(samplesDir)) {
    return NextResponse.json({ error: "No samples directory found" }, { status: 404 });
  }

  const files = fs.readdirSync(samplesDir).filter((f) =>
    /\.(jpg|jpeg|png|pdf)$/i.test(f)
  );

  const results = [];
  for (const file of files) {
    const filePath = path.join(samplesDir, file);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const mediaType = ext === ".pdf" ? "application/pdf"
      : ext === ".png" ? "image/png"
      : "image/jpeg";

    const result = await processInvoice(buffer, mediaType, file, db);
    results.push(result);
  }

  return NextResponse.json({ processed: results.length, results });
}
