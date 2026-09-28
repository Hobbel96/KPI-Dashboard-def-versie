"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek } from "@/lib/period";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

interface ExcelRow {
  [key: string]: any;
}

export async function importExcelAction(formData: FormData) {
  try {
    await requireAuth("MT");

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "Geen bestand geselecteerd" };
    }

    // Read file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get all AMs from database
    const ams = await db.user.findMany({
      where: { role: "AM" },
      select: { id: true, name: true },
    });

    let totalImported = 0;
    const currentYear = new Date().getFullYear();

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      // Find matching AM by first name
      const firstName = sheetName.trim();
      const am = ams.find(
        (a) => a.name.split(" ")[0].toLowerCase() === firstName.toLowerCase()
      );

      if (!am) {
        console.log(`⚠️ Sheet "${sheetName}" - geen AM gevonden`);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      // Process each row
      for (const row of rows) {
        const weekStr = String(row.Week || row.week || "").trim();
        if (!weekStr) continue;

        // Parse week number (could be "W16" or "16")
        const weekMatch = weekStr.match(/\d+/);
        if (!weekMatch) continue;

        const weekNum = parseInt(weekMatch[0]);
        if (weekNum < 15 || weekNum > 49) continue;

        const factureerbareDagen = parseFloat(row["Factureerbare Dagen"] || row["factureerbare_dagen"] || row["Factureerbare dagen"] || 0);
        const bezoeken = parseInt(row.Bezoeken || row.bezoeken || 0);
        const klanten = parseInt(row.Klanten || row.klanten || 0);
        const afspraken = parseInt(row.Afspraken || row.afspraken || 0);

        // Create or update WeeklyReport
        const report = await db.weeklyReport.upsert({
          where: {
            amId_isoYear_isoWeek: {
              amId: am.id,
              isoYear: currentYear,
              isoWeek: weekNum,
            },
          },
          update: {
            status: "SUBMITTED",
          },
          create: {
            amId: am.id,
            isoYear: currentYear,
            isoWeek: weekNum,
            status: "SUBMITTED",
          },
        });

        // Find or create seed opdracht for this AM
        let opdracht = await db.opdracht.findFirst({
          where: { amId: am.id, naam: "Seed Data" },
        });

        if (!opdracht) {
          const klant = await db.klant.findFirst({
            where: { naam: "De Vlasschuur" },
          });

          opdracht = await db.opdracht.create({
            data: {
              naam: "Seed Data",
              rol: "WAM",
              amId: am.id,
              klantId: klant?.id || "",
            },
          });
        }

        // Delete existing entry for this week
        await db.opdrachtEntry.deleteMany({
          where: {
            weeklyReportId: report.id,
            opdrachtId: opdracht.id,
          },
        });

        // Create new entry
        await db.opdrachtEntry.create({
          data: {
            weeklyReportId: report.id,
            opdrachtId: opdracht.id,
            factureerbareDagen,
            bezoeken,
            klanten,
            afspraken,
            werkdagen: 0,
            deals: 0,
          },
        });

        totalImported++;
      }
    }

    revalidatePath("/mt/dashboard");
    revalidatePath("/mt/prognoses");

    return { success: true, imported: totalImported };
  } catch (error) {
    console.error("Excel import error:", error);
    return { error: "Fout bij importeren van Excel bestand" };
  }
}
