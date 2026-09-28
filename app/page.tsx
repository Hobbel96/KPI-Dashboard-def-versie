import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "MT") {
    redirect("/mt/dashboard");
  }

  redirect("/am/rapportage");
}
