import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/user";
import { getNeonClient } from "@/lib/db/neon";
import { getSalesMetrics } from "@/lib/sales/metrics";
import { DEMO_COOKIE_NAME } from "@/app/(dashboard)/layout";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";

    // Si c'est un utilisateur démo, retourner des données mockées
    if (isDemo) {
      return NextResponse.json({
        user: { email: "demo@boulangerie.ci", name: "Utilisateur Démo" },
        closures: [],
        salesMetrics: null,
        isDemo: true,
      });
    }

    // Vérifier l'utilisateur connecté
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les données depuis la base de données
    const neon = getNeonClient();
    if (!neon) {
      return NextResponse.json(
        { error: "Base non configurée." },
        { status: 503 },
      );
    }

    const [closuresResult, salesMetrics] = await Promise.all([
      neon`SELECT * FROM cash_closures ORDER BY created_at DESC LIMIT 5`,
      getSalesMetrics(user.sub),
    ]);

    return NextResponse.json({
      user,
      closures: closuresResult,
      salesMetrics,
      isDemo: false,
    });
  } catch (error) {
    console.error("Erreur API dashboard-metrics:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
