import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Bon retour parmi nous"
            subtitle="Connectez-vous pour retrouver vos ventes, vos stocks et votre caisse du jour."
        >
            <LoginForm />
            <p className="mt-6 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="font-semibold text-neutral-900 hover:underline dark:text-white">
                    Créer un compte
                </Link>
            </p>
        </AuthLayout>
    );
}

