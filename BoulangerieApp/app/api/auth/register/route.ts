import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";
import { hashPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: { fullName?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (
    fullName.length < 2 ||
    fullName.length > 160 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: "Vérifiez les champs du formulaire." },
      { status: 400 },
    );
  }

  const sql = getNeonClient();
  if (!sql) {
    return NextResponse.json(
      { error: "L’inscription n’est pas encore configurée." },
      { status: 503 },
    );
  }

  const existing =
    await sql`select id from public.app_users where lower(email) = ${email} limit 1`;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet e-mail." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const inserted = await sql`
    insert into public.app_users (full_name, email, password_hash)
    values (${fullName}, ${email}, ${passwordHash})
    returning id, email
  `;
  const user = inserted[0] as { id: string; email: string };

  const token = await createSessionToken({ sub: user.id, email: user.email });
  if (!token) {
    return NextResponse.json(
      { error: "L’inscription n’est pas encore configurée." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return response;
}
