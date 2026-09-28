"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMtOnlyKpiAction(formData: FormData) {
  await requireAuth("MT");

  const naam = formData.get("naam") as string;
  const eenheid = formData.get("eenheid") as string;

  if (!naam.trim()) return;

  try {
    await db.mtOnlyKpi.create({
      data: {
        naam: naam.trim(),
        eenheid: eenheid.trim() || null,
      },
    });
    revalidatePath("/mt/mt-only-kpis");
  } catch (error) {
    console.error(error);
  }
}

export async function upsertMtOnlyKpiValueAction(formData: FormData) {
  const user = await requireAuth("MT");

  const mtOnlyKpiId = formData.get("mtOnlyKpiId") as string;
  const periodKey = formData.get("periodKey") as string;
  const waarde = formData.get("waarde") ? parseFloat(formData.get("waarde") as string) : null;

  if (!waarde) return;

  try {
    await db.mtOnlyKpiValue.upsert({
      where: { mtOnlyKpiId_periodKey: { mtOnlyKpiId, periodKey } },
      update: { waarde, enteredById: user.id, enteredAt: new Date() },
      create: {
        mtOnlyKpiId,
        periodKey,
        waarde,
        enteredById: user.id,
      },
    });
    revalidatePath("/mt/mt-only-kpis");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteMtOnlyKpiAction(formData: FormData) {
  await requireAuth("MT");

  const kpiId = (formData.get("itemId") || formData.get("kpiId")) as string;

  try {
    await db.mtOnlyKpi.delete({
      where: { id: kpiId },
    });
    revalidatePath("/mt/mt-only-kpis");
  } catch (error) {
    console.error(error);
  }
}
