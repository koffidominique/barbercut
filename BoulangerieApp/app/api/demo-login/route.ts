import { NextResponse } from "next/server";
// On utilise la même constante mais on vérifie bien l'import
const DEMO_COOKIE_NAME = "boulangerie-demo";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // On ajoute le cookie avec des paramètres garantis
  response.cookies.set(DEMO_COOKIE_NAME, "1", {
    path: "/",
    maxAge: 60 * 60 * 12, // 12 heures
    sameSite: "lax",
    httpOnly: false,
    secure: false, // En localhost, secure ne fonctionne pas
  });
  console.log("🍪 Cookie démo créé :", DEMO_COOKIE_NAME);
  return response;
}
