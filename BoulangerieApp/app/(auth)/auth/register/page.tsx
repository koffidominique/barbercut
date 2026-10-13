import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Créez votre compte"
            subtitle="Rejoignez les boulangeries qui pilotent leur activité avec rigueur et simplicité."
        >
            <RegisterForm />
            <p className="mt-6 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                Déjà inscrit ?{" "}
                <Link href="/auth/login" className="font-semibold text-neutral-900 hover:underline dark:text-white">
                    Se connecter
                </Link>
            </p>
        </AuthLayout>
    );
}

