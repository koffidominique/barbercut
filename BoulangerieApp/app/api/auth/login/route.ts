import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";
import { verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1) {
    return NextResponse.json(
      { error: "Vérifiez vos identifiants." },
      { status: 400 },
    );
  }

  const sql = getNeonClient();
  if (!sql) {
    return NextResponse.json(
      { error: "La connexion n’est pas encore configurée." },
      { status: 503 },
    );
  }

  try {
    const rows = await sql`select id, email, password_hash from public.app_users where lower(email) = ${email} limit 1`;
    const user = rows[0] as { id: string; email: string; password_hash: string } | undefined;
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Connexion impossible. Vérifiez vos identifiants." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({ sub: user.id, email: user.email });
    if (!token) {
      return NextResponse.json(
        { error: "La connexion n’est pas encore configurée." },
        { status: 503 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Unable to log in:", error);
    return NextResponse.json(
      { error: "Connexion impossible. Réessayez plus tard." },
      { status: 500 },
    );
  }
}
