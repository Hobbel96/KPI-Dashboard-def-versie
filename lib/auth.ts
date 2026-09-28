import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "vlasschuur_kpi_v2_session";
const SESSION_EXPIRY_DAYS = 30;

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || new Date() > session.expiresAt) {
    return null;
  }

  return session.user;
}

export async function requireAuth(role?: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (role) {
    // Multi-role users (Dave, Naftali, Tim, Jan) can access both AM and MT
    const multiRoleUsers = [
      "dave.niestadt@devlasschuur.nl",
      "naftali.vlaanderen@devlasschuur.nl",
      "tim.schepmans@devlasschuur.nl",
      "jan.hobbel@devlasschuur.nl",
    ];

    const isMultiRole = multiRoleUsers.includes(user.email);
    const hasAccess = user.role === role || (isMultiRole && (role === "AM" || role === "MT"));

    if (!hasAccess) redirect("/");
  }

  return user;
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await db.session.delete({
      where: { token: sessionToken },
    }).catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  return user;
}
