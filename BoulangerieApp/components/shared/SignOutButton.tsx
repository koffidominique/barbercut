"use client";

import { useState } from "react";

export function SignOutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function handleSignOut() {
        setIsSigningOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // La redirection nettoie quand même la navigation.
        }
        window.location.assign("/");
    }

    return (
        <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-white/15 dark:text-neutral-200">
            {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
    );
}