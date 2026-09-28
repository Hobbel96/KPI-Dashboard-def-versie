"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getISOWeek } from "@/lib/period";
import { revalidatePath } from "next/cache";

export async function createKlantAction(naam: string) {
  await requireAuth("AM");

  if (!naam.trim()) {
    return { error: "Naam is verplicht" };
  }

  try {
    const klant = await db.klant.upsert({
      where: { naam },
      update: {},
      create: { naam },
    });

    return { klant: { id: klant.id, naam: klant.naam } };
  } catch (error) {
    console.error("Error creating klant:", error);
    return { error: "Fout bij aanmaken opdrachtgever" };
  }
}

export async function submitReportAction(formData: FormData) {
  try {
    const user = await requireAuth("AM");
    const currentWeek = getISOWeek();

    const opdrachtenJson = formData.get("opdrachten") as string;
    const entriesJson = formData.get("entries") as string;
    const weekcijfer = formData.get("weekcijfer") as string;
    const status = (formData.get("status") as string) || "SUBMITTED";

    console.log("submitReportAction - status:", status, "weekcijfer:", weekcijfer);

    if (!opdrachtenJson || !entriesJson) {
      throw new Error("Incomplete form data");
    }

    const opdrachten = JSON.parse(opdrachtenJson);
    const entries = JSON.parse(entriesJson);

    // Create or update weekly report
    const report = await db.weeklyReport.upsert({
      where: {
        amId_isoYear_isoWeek: {
          amId: user.id,
          isoYear: currentWeek.year,
          isoWeek: currentWeek.week,
        },
      },
      update: {
        weekcijfer: weekcijfer ? parseFloat(weekcijfer) : null,
        status,
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      },
      create: {
        amId: user.id,
        isoYear: currentWeek.year,
        isoWeek: currentWeek.week,
        weekcijfer: weekcijfer ? parseFloat(weekcijfer) : null,
        status,
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      },
    });

    // Delete existing entries for this report
    await db.opdrachtEntry.deleteMany({
      where: { weeklyReportId: report.id },
    });

    // Create new entries
    for (const opdracht of opdrachten) {
      const entry = entries[opdracht.klantId];
      if (!entry) continue;

      // Find or create opdracht for this klant
      let opdrachtRecord = await db.opdracht.findFirst({
        where: { klantId: opdracht.klantId, amId: user.id },
      });

      if (!opdrachtRecord) {
        const klant = await db.klant.findUnique({ where: { id: opdracht.klantId } });
        opdrachtRecord = await db.opdracht.create({
          data: {
            naam: klant?.naam || "Opdracht",
            klantId: opdracht.klantId,
            rol: opdracht.rol,
            amId: user.id,
          },
        });
      }

      // Create entry
      await db.opdrachtEntry.create({
        data: {
          weeklyReportId: report.id,
          opdrachtId: opdrachtRecord.id,
          werkdagen: entry.werkdagen,
          factureerbareDagen: entry.factureerbareDagen,
          bezoeken: entry.bezoeken || null,
          klanten: entry.klanten || null,
          afspraken: entry.afspraken || null,
          nieuweAfspraken: entry.nieuweAfspraken || null,
          deals: entry.deals || null,
        },
      });
    }

    revalidatePath("/am/rapportage");
    revalidatePath("/mt/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
}
