// API: GET /api/production-suggestions
// Génère (ou relit) le planning de production simulé pour la semaine courante.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { getProductionSuggestions } from "@/lib/production/suggestions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const suggestions = await getProductionSuggestions();
    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error("[production-suggestions] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 },
    );
  }
}
