"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE, gateToken } from "@/lib/authGate";

export type LoginState = { error: string | null };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const nextRaw = formData.get("next");
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/";
  const expected = process.env.APP_PASSWORD;

  if (typeof password !== "string" || !expected || password !== expected) {
    return { error: "Password incorreta." };
  }

  (await cookies()).set(AUTH_COOKIE, gateToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect(next);
}
