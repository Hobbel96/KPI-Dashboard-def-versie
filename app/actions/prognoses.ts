"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upsertPrognoseAction(formData: FormData) {
  const user = await requireAuth("MT");

  const amId = formData.get("amId") as string;
  const isoYear = parseInt(formData.get("isoYear") as string);
  const isoWeek = parseInt(formData.get("isoWeek") as string);

  const prognoseData = {
    // Prognose values
    weekcijfer: formData.get("weekcijfer") ? parseFloat(formData.get("weekcijfer") as string) : null,
    werkdagen: formData.get("werkdagen") ? parseFloat(formData.get("werkdagen") as string) : null,
    factureerbareDagen: formData.get("factureerbareDagen") ? parseFloat(formData.get("factureerbareDagen") as string) : null,
    bezoeken: formData.get("bezoeken") ? parseInt(formData.get("bezoeken") as string) : null,
    klanten: formData.get("klanten") ? parseInt(formData.get("klanten") as string) : null,
    afspraken: formData.get("afspraken") ? parseInt(formData.get("afspraken") as string) : null,
    nieuweAfspraken: formData.get("nieuweAfspraken") ? parseInt(formData.get("nieuweAfspraken") as string) : null,
    deals: formData.get("deals") ? parseInt(formData.get("deals") as string) : null,

    // Realisatie values
    weekcijferRealisatie: formData.get("weekcijferRealisatie") ? parseFloat(formData.get("weekcijferRealisatie") as string) : null,
    werkdagenRealisatie: formData.get("werkdagenRealisatie") ? parseFloat(formData.get("werkdagenRealisatie") as string) : null,
    factureerbareDagenRealisatie: formData.get("factureerbareDagenRealisatie") ? parseFloat(formData.get("factureerbareDagenRealisatie") as string) : null,
    bezoekenRealisatie: formData.get("bezoekenRealisatie") ? parseInt(formData.get("bezoekenRealisatie") as string) : null,
    klantenRealisatie: formData.get("klantenRealisatie") ? parseInt(formData.get("klantenRealisatie") as string) : null,
    afsprakenRealisatie: formData.get("afsprakenRealisatie") ? parseInt(formData.get("afsprakenRealisatie") as string) : null,
    nieuweAfsprakenRealisatie: formData.get("nieuweAfsprakenRealisatie") ? parseInt(formData.get("nieuweAfsprakenRealisatie") as string) : null,
    dealsRealisatie: formData.get("dealsRealisatie") ? parseInt(formData.get("dealsRealisatie") as string) : null,
  };

  try {
    await db.prognose.upsert({
      where: { amId_isoYear_isoWeek: { amId, isoYear, isoWeek } },
      update: { ...prognoseData, enteredById: user.id },
      create: {
        amId,
        isoYear,
        isoWeek,
        ...prognoseData,
        enteredById: user.id,
      },
    });
    revalidatePath("/mt/prognoses");
  } catch (error) {
    console.error(error);
  }
}
