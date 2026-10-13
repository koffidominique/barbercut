"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Wallet, PiggyBank, ReceiptText, Scale } from "lucide-react";
import { ClosureForm } from "@/components/caisse/ClosureForm";
import { ClosureHistory } from "@/components/caisse/ClosureHistory";
import { ClosureRecord, formatFCFA } from "@/components/caisse/closure-data";

export default function CaissePage() {
    const [history, setHistory] = useState<ClosureRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [cashier, setCashier] = useState("Awa Koné");
    const [openingFund, setOpeningFund] = useState("50000");
    const [cashSales, setCashSales] = useState("");
    const [mobileSales, setMobileSales] = useState("");
    const [cardSales, setCardSales] = useState("");
    const [expenses, setExpenses] = useState("");
    const [countedCash, setCountedCash] = useState("");

    useEffect(() => {
        async function loadClosures() {
            try {
                const response = await fetch("/api/cash-closures");
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error ?? "Chargement impossible.");
                setHistory(result.closures ?? []);
            } catch (error) {
                setLoadError(error instanceof Error ? error.message : "Chargement impossible.");
            } finally {
                setIsLoading(false);
            }
        }
        loadClosures();
    }, []);

    const numbers = useMemo(() => {
        const toNumber = (value: string) => Number(value.replace(/\s/g, "")) || 0;
        const opening = toNumber(openingFund);
        const cash = toNumber(cashSales);
        const mobile = toNumber(mobileSales);
        const card = toNumber(cardSales);
        const expense = toNumber(expenses);
        const counted = toNumber(countedCash);
        const totalSales = cash + mobile + card;
        const expectedCash = opening + cash - expense;
        const difference = counted - expectedCash;
        return { opening, cash, expense, totalSales, expectedCash, difference };
    }, [openingFund, cashSales, mobileSales, cardSales, expenses, countedCash]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveError("");
        setIsSaving(true);

        try {
            const response = await fetch("/api/cash-closures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cashier,
                    openingFund,
                    cashSales,
                    mobileSales: mobileSales || "0",
                    cardSales: cardSales || "0",
                    expenses: expenses || "0",
                    countedCash,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error ?? "Enregistrement impossible.");

            setHistory((prev) => [result.closure, ...prev]);
            setCashSales("");
            setMobileSales("");
            setCardSales("");
            setExpenses("");
            setCountedCash("");
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Enregistrement impossible.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Étape 1 — Caisse</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">
                    Clôture de caisse journalière
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">Fond de caisse du matin, ventes du jour, dépenses et écart de comptage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Wallet className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ventes totales</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(numbers.totalSales)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><ReceiptText className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Espèces attendues</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(numbers.expectedCash)}</p>
                    <p className="mt-1 text-xs text-neutral-500">Fond + espèces − dépenses</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Scale className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Écart de comptage</p>
                    </div>
                    <p className="text-2xl font-black text-amber-500">
                        {numbers.difference > 0 ? "+" : ""}{formatFCFA(numbers.difference)}
                    </p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500"><PiggyBank className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Clôtures enregistrées</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{history.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
                <div>
                    <ClosureForm
                        cashier={cashier}
                        onCashierChange={setCashier}
                        openingFund={openingFund}
                        onOpeningFundChange={setOpeningFund}
                        cashSales={cashSales}
                        onCashSalesChange={setCashSales}
                        mobileSales={mobileSales}
                        onMobileSalesChange={setMobileSales}
                        cardSales={cardSales}
                        onCardSalesChange={setCardSales}
                        expenses={expenses}
                        onExpensesChange={setExpenses}
                        countedCash={countedCash}
                        onCountedCashChange={setCountedCash}
                        onSubmit={handleSubmit}
                    />
                    {saveError && (
                        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                            {saveError}
                        </p>
                    )}
                    {isSaving && (
                        <p role="status" className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                            Enregistrement en cours…
                        </p>
                    )}
                </div>
                <div>
                    {isLoading ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chargement des clôtures…</p>
                        </div>
                    ) : loadError ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Aucune clôture enregistrée pour le moment. Remplissez le formulaire pour créer la première.
                            </p>
                        </div>
                    ) : (
                        <ClosureHistory history={history} />
                    )}
                </div>
            </div>
        </div>
    );
}
