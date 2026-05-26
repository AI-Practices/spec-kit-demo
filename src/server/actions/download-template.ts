"use server";

import { createTemplate } from "@/lib/excel-utils";
import type { ActionResult } from "@/src/server/types";

export async function downloadTemplate(
  month?: number,
  year?: number,
): Promise<ActionResult<{ data: string; filename: string }>> {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  try {
    const buffer = createTemplate(m, y);
    const base64 = buffer.toString("base64");
    const filename = `Template-${m < 10 ? "0" : ""}${m}-${y}.xlsx`;
    return { success: true, data: { data: base64, filename } };
  } catch {
    return { success: false, errors: { _form: ["Failed to generate template"] } };
  }
}
