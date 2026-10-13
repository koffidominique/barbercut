import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
    children: ReactNode;
    title: string;
    subtitle: string;
};

const highlights = [
    {
        value: "Ventes",
        label: "Suivi de la caisse en temps réel",
    },
    {
        value: "Stocks",
        label: "Matières premières sous contrôle",
    },
    {
        value: "Comptabilité",
        label: "Marges et paiements simplifiés",
    },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-neutral-950">
            {/* Panneau gauche : formulaire */}
            <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <Link href="/" className="mb-10 inline-flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">
                            B
                        </span>
                        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                            Boulangerie CI
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>

            {/* Panneau droit : vidéo + arguments */}
            <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
                <video
                    src="/videos/connexion.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

                <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
                        Gestion de boulangerie — Côte d’Ivoire
                    </p>
                    <h2 className="max-w-lg text-3xl font-bold leading-tight text-white xl:text-4xl">
                        Pilotez ventes, stocks et caisse depuis un seul espace.
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                        Un outil sobre et fiable, pensé pour le rythme du fournil et les
                        décisions du quotidien.
                    </p>

                    <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                        {highlights.map((item) => (
                            <div
                                key={item.value}
                                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                            >
                                <dt className="text-base font-bold text-white">{item.value}</dt>
                                <dd className="mt-1 text-xs leading-relaxed text-white/70">
                                    {item.label}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
