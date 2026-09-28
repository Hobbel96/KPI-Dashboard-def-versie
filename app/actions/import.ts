"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

export async function importBezettingsgradAction(formData: FormData) {
  await requireAuth("MT");

  const file = formData.get("file") as File;
  const type = formData.get("type") as "prognose" | "realisatie";
  const amIdOrTeam = formData.get("amIdOrTeam") as string;

  if (!file || !type) {
    throw new Error("File en type zijn verplicht");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  if (data.length < 2) {
    throw new Error("Excel file is leeg");
  }

  const headers = data[0];
  const bezettingsgradRow = data.find((row) =>
    row[0]?.toString().toLowerCase().includes("bezettingsgraad")
  );

  if (!bezettingsgradRow) {
    throw new Error("Bezettingsgraad rij niet gevonden");
  }

  const weekColumns = headers
    .map((h, i) => ({
      index: i,
      header: h?.toString() || "",
      week: parseInt(h?.toString().match(/\d+/)?.[0] || "0"),
    }))
    .filter((col) => col.week > 0);

  if (type === "prognose") {
    // Save as Prognose (Doelstelling) for ALL AMs
    const allAMs = await db.user.findMany({
      where: { role: "AM" },
    });

    const currentUser = await requireAuth("MT");

    for (const col of weekColumns) {
      const value = bezettingsgradRow[col.index];
      if (!value) continue;

      const percentage = parseFloat(value.toString().replace("%", ""));
      if (isNaN(percentage)) continue;

      // Calculate year from week (assuming current year)
      const year = new Date().getFullYear();
      const isoWeek = col.week;

      // Apply percentage to ALL AMs
      for (const am of allAMs) {
        const factureerbareDagen = (percentage / 100) * (am.availableDaysPerWeek || 40);

        await db.prognose.upsert({
          where: {
            amId_isoYear_isoWeek: { amId: am.id, isoYear: year, isoWeek: isoWeek },
          },
          update: { factureerbareDagen },
          create: {
            amId: am.id,
            isoYear: year,
            isoWeek: isoWeek,
            factureerbareDagen,
            enteredById: currentUser.id,
          },
        });
      }
    }
  }

  revalidatePath("/mt/dashboard", "layout");

  return { success: true, rowsProcessed: weekColumns.length };
}
