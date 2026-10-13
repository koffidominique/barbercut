"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const fullName = String(formData.get("fullName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (password !== confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas.");
            setIsSubmitting(false);
            return;
        }

        if (password.length < 8) {
            setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error ?? "Inscription impossible.");

            window.location.assign("/dashboard");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Inscription impossible. Vérifiez vos informations ou contactez l’équipe.");
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="register-name">Nom complet</FieldLabel>
                    <Input
                        id="register-name"
                        name="fullName"
                        type="text"
                        placeholder="Awa Koné"
                        autoComplete="name"
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="register-email">Adresse e-mail</FieldLabel>
                    <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="vous@boulangerie.ci"
                        autoComplete="email"
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="register-password">Mot de passe</FieldLabel>
                    <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="8 caractères minimum"
                        autoComplete="new-password"
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="register-confirm">Confirmer le mot de passe</FieldLabel>
                    <Input
                        id="register-confirm"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </Field>
            </FieldGroup>

            {errorMessage && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {successMessage}
                </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="h-11 w-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                {isSubmitting ? "Création en cours…" : "Créer mon compte"}
            </Button>

            <p className="text-center text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                En créant un compte, vous acceptez nos conditions d’utilisation et notre
                politique de confidentialité.
            </p>
        </form>
    );
}
