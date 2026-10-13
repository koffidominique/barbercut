"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox, CheckboxField, CheckboxLabel } from "@/components/ui/checkbox";

export function LoginForm() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Même correction pour la connexion standard
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error ?? "Connexion impossible.");

            window.location.assign("/dashboard");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Connexion impossible. Vérifiez vos identifiants ou contactez l’équipe.");
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="login-email">Adresse e-mail</FieldLabel>
                    <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="vous@boulangerie.ci"
                        autoComplete="email"
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
                    <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                </Field>
            </FieldGroup>

            <div className="flex items-center justify-between">
                <CheckboxField>
                    <Checkbox id="remember-me" name="remember-me" />
                    <CheckboxLabel htmlFor="remember-me">Se souvenir de moi</CheckboxLabel>
                </CheckboxField>
                <Link href="#" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                    Mot de passe oublié ?
                </Link>
            </div>

            {errorMessage && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                    {errorMessage}
                </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="h-11 w-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                {isSubmitting ? "Connexion en cours…" : "Se connecter"}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-neutral-400 dark:bg-neutral-950 dark:text-neutral-500">
                        ou
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={async () => {
                    console.log("🔘 Bouton démo CLICKÉ !");
                    setErrorMessage("");
                    setIsSubmitting(true);
                    try {
                        console.log("📤 Appel API /api/demo-login...");
                        const response = await fetch("/api/demo-login", {
                            method: "POST",
                            credentials: "include"
                        });
                        console.log("📥 Réponse API :", response.status, response.ok);
                        if (!response.ok) throw new Error("demo");
                        const data = await response.json();
                        console.log("📦 Données API :", data);
                        // Petit délai pour garantir que le cookie est stocké par le navigateur
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log("🍪 Cookies actuels :", document.cookie);
                        console.log("🔄 Redirection vers /demo...");
                        window.location.replace("/demo");
                    } catch (err) {
                        console.error("❌ ERREUR BOUTON DEMO :", err);
                        setErrorMessage("Accès démo impossible pour le moment. Réessayez.");
                        setIsSubmitting(false);
                    }
                }}
                className="h-11 w-full text-sm font-semibold"
            >
                Accéder à la démo sans compte
            </Button>
        </form>
    );
}