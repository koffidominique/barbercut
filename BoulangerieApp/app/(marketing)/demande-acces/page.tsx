import Link from "next/link";
import { AccessRequestForm } from "@/components/marketing/AccessRequestForm";
import { PRICING_PLANS } from "@/lib/constants";

type AccessRequestPageProps = {
    searchParams: Promise<{ plan?: string }>;
};

export default async function AccessRequestPage({ searchParams }: AccessRequestPageProps) {
    const { plan } = await searchParams;
    const selectedPlan = PRICING_PLANS.find((pricingPlan) => pricingPlan.id === plan);

    return (
        <section className="px-6 py-12 lg:px-40 lg:py-20">
            <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div className="pt-2">
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">Accès sur invitation</p>
                    <h1 className="mb-6 text-4xl font-black leading-tight text-neutral-900 dark:text-white md:text-5xl">
                        Parlons de votre boulangerie.
                    </h1>
                    <p className="mb-8 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                        Décrivez votre activité et vos priorités. Notre équipe vous recontactera pour une démonstration et l’étude de votre accès.
                    </p>
                    {selectedPlan && (
                        <p className="mb-8 inline-flex rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                            Formule souhaitée : {selectedPlan.name}
                        </p>
                    )}
                    <Link href="/auth/login" className="block text-sm font-semibold text-neutral-600 underline decoration-primary/50 underline-offset-4 hover:text-primary dark:text-neutral-300">
                        Vous avez déjà reçu vos identifiants ? Se connecter
                    </Link>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#101712] md:p-9">
                    <AccessRequestForm selectedPlanId={selectedPlan?.id} />
                </div>
            </div>
        </section>
    );
}