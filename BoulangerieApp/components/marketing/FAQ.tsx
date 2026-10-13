"use client";

import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";

const questions = [
    {
        question: "À quel type de boulangerie s’adresse Boulangerie CI ?",
        answer: "La solution est pensée pour les boulangeries artisanales, les pâtisseries et les points de vente qui veulent mieux suivre leur activité au quotidien.",
    },
    {
        question: "Que puis-je gérer avec la plateforme ?",
        answer: "La démonstration présente le suivi des ventes, des stocks, de la caisse, de la production et des indicateurs de gestion. Le périmètre final est défini avec vous selon votre organisation.",
    },
    {
        question: "La solution est-elle adaptée aux réalités en Côte d’Ivoire ?",
        answer: "Le produit est conçu pour le marché ivoirien, avec des tarifs affichés en FCFA et une attention portée aux besoins des équipes de boulangerie locales.",
    },
    {
        question: "Puis-je utiliser l’application sur téléphone ou tablette ?",
        answer: "L’interface est conçue pour s’adapter aux écrans mobiles et aux tablettes, en plus des ordinateurs de comptoir ou de bureau.",
    },
    {
        question: "Comment obtenir un devis adapté à mon établissement ?",
        answer: "Remplissez le formulaire de demande d’accès en précisant votre ville, vos points de vente et vos besoins. Notre équipe vous recontactera pour vous présenter la solution.",
    },
    {
        question: "Combien coûte la mise en place ?",
        answer: "Le tarif dépend de la formule choisie et du niveau d’accompagnement souhaité. Demandez un devis pour recevoir une proposition adaptée à votre activité.",
    },
];

export function FAQ() {
    return (
        <MotionConfig reducedMotion="user">
            <section className="px-6 py-20 lg:px-40" id="faq">
                <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">FAQ</p>
                        <h2 className="mb-5 text-3xl font-black text-neutral-900 dark:text-white md:text-5xl">
                            Vos questions, nos réponses
                        </h2>
                        <p className="max-w-[420px] text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                            Besoin d’un éclairage avant de vous décider ? Retrouvez ici les informations essentielles.
                        </p>
                        <Link
                            href="/demande-acces"
                            className="mt-7 inline-flex items-center justify-center rounded-full border border-primary/40 px-6 py-3 font-bold text-neutral-900 transition-colors hover:bg-primary/10 dark:text-white"
                        >
                            Demander un échange
                        </Link>
                    </motion.div>

                    <div className="border-t border-neutral-200 dark:border-white/10">
                        {questions.map(({ question, answer }, index) => (
                            <motion.div key={question} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                                <details className="group border-b border-neutral-200 dark:border-white/10">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-bold text-neutral-900 marker:content-none dark:text-white md:text-lg">
                                        {question}
                                        <span aria-hidden="true" className="shrink-0 text-2xl font-normal text-primary transition-transform group-open:rotate-45">+</span>
                                    </summary>
                                    <p className="max-w-[680px] pb-6 pr-8 leading-relaxed text-neutral-600 dark:text-neutral-300">
                                        {answer}
                                    </p>
                                </details>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </MotionConfig>
    );
}