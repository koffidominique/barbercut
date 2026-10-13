import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/user";
import DashboardClientLayout from "./client-layout";
import { StatsPanelProvider } from "@/contexts/StatsPanelContext";

export const DEMO_COOKIE_NAME = "boulangerie-demo";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";
    console.log("👤 Utilisateur démo ?", isDemo);

    // SI C'EST UN UTILISATEUR DÉMO : ON RETOURNE DIRECTEMENT, RIEN D'AUTRE N'EST EXÉCUTÉ
    if (isDemo) {
        console.log("✅ Accès démo autorisé, affichage du dashboard");
        return <StatsPanelProvider><DashboardClientLayout userEmail="demo@boulangerie.ci">{children}</DashboardClientLayout></StatsPanelProvider>;
    }

    // Seulement si PAS démo : on fait les vérifications classiques
    const allCookies = cookieStore.getAll();
    console.log("📊 Dashboard layout - Tous les cookies (utilisateur normal):", allCookies.map(c => c.name));

    // Le JSX n'est construit qu'après le try/catch (règle react-hooks/error-boundaries)
    let userEmail = "demo@boulangerie.ci";
    try {
        const user = await getCurrentUser();
        console.log("👤 Utilisateur connecté ?", user ? "Oui" : "Non");

        if (!user) {
            console.log("❌ Redirection vers login car aucun utilisateur trouvé");
            redirect("/auth/login?next=%2Fdashboard");
        }

        userEmail = user.email || "";
    } catch (err) {
        // Si getCurrentUser() plante mais on est en démo, on affiche quand même
        console.log("⚠️ Erreur getCurrentUser, mais on affiche le dashboard en démo :", err);
    }

    return <StatsPanelProvider><DashboardClientLayout userEmail={userEmail}>{children}</DashboardClientLayout></StatsPanelProvider>;
}