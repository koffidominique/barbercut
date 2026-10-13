import { cookies } from "next/headers";
import { getNeonClient } from "@/lib/db/neon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  const sql = getNeonClient();
  if (!sql) return session;
  const rows = await sql`select id, email, full_name from public.app_users where id = ${session.sub} limit 1`;
  const row = rows[0] as { id: string; email: string; full_name: string } | undefined;
  if (!row) return null;
  return { sub: row.id, email: row.email, fullName: row.full_name };
}
