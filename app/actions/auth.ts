"use server";

import { loginUser, createSession, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(
  prevState: any,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email en wachtwoord zijn verplicht" };
  }

  const user = await loginUser(email, password);

  if (!user) {
    return { error: "Ongeldige email of wachtwoord" };
  }

  await createSession(user.id);
  redirect(user.role === "MT" ? "/mt/dashboard" : "/am/rapportage");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
