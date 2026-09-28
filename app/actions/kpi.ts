"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createKpiAction(formData: FormData) {
  await requireAuth("MT");

  const naam = formData.get("naam") as string;
  const eenheid = formData.get("eenheid") as string;
  const prognose = formData.get("prognose") ? parseFloat(formData.get("prognose") as string) : null;
  const teamId = (formData.get("teamId") as string) || null;

  if (!naam.trim()) return;

  try {
    await db.kpi.create({
      data: {
        naam: naam.trim(),
        eenheid: eenheid.trim() || null,
        prognose,
        teamId,
      },
    });
    revalidatePath("/mt/kpi-beheer");
  } catch (error) {
    console.error(error);
  }
}

export async function updateKpiAction(formData: FormData) {
  await requireAuth("MT");

  const id = formData.get("id") as string;
  const naam = formData.get("naam") as string;
  const eenheid = formData.get("eenheid") as string;
  const prognose = formData.get("prognose") ? parseFloat(formData.get("prognose") as string) : null;
  const teamId = (formData.get("teamId") as string) || null;

  try {
    await db.kpi.update({
      where: { id },
      data: {
        naam,
        eenheid: eenheid || null,
        prognose,
        teamId,
      },
    });
    revalidatePath("/mt/kpi-beheer");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteKpiAction(formData: FormData) {
  await requireAuth("MT");

  const kpiId = (formData.get("itemId") || formData.get("kpiId")) as string;

  try {
    await db.kpi.delete({
      where: { id: kpiId },
    });
    revalidatePath("/mt/kpi-beheer");
  } catch (error) {
    console.error(error);
  }
}
