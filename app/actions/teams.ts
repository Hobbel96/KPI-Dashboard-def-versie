"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTeamAction(formData: FormData) {
  await requireAuth("MT");

  const name = formData.get("name") as string;

  if (!name.trim()) return;

  try {
    await db.team.create({
      data: {
        name: name.trim(),
      },
    });
    revalidatePath("/mt/teams");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteTeamAction(formData: FormData) {
  await requireAuth("MT");

  const teamId = (formData.get("itemId") || formData.get("teamId")) as string;

  try {
    await db.user.updateMany({
      where: { teamId },
      data: { teamId: null },
    });

    await db.team.delete({
      where: { id: teamId },
    });
    revalidatePath("/mt/teams");
  } catch (error) {
    console.error(error);
  }
}

export async function assignAmToTeamAction(formData: FormData) {
  await requireAuth("MT");

  const userId = formData.get("userId") as string;
  const teamId = formData.get("teamId") as string | null;

  try {
    await db.user.update({
      where: { id: userId },
      data: { teamId: teamId || null },
    });
    revalidatePath("/mt/teams");
  } catch (error) {
    console.error(error);
  }
}
