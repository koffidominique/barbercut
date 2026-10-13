"use client";

import { useMemo, useState } from "react";
import { Store, Users, Banknote } from "lucide-react";
import { BoutiqueCards } from "@/components/boutiques/BoutiqueCards";
import { StaffTable } from "@/components/boutiques/StaffTable";
import { TransferPanel } from "@/components/boutiques/TransferPanel";
import { AttendanceStatus, formatFCFA, initialBoutiques, initialEmployees, initialTransfers } from "@/components/boutiques/shop-data";

export default function BoutiquesPage() {
    const [boutiques] = useState(initialBoutiques);
    const [employees, setEmployees] = useState(initialEmployees);
    const [transfers, setTransfers] = useState(initialTransfers);
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [fromId, setFromId] = useState("B-01");
    const [toId, setToId] = useState("B-03");

    const stats = useMemo(() => {
        const sales = boutiques.reduce((s, b) => s + b.dailySales, 0);
        const present = employees.filter((e) => e.status === "Présent" || e.status === "Retard").length;
        const payroll = employees.reduce((s, e) => s + (e.salary - e.advances), 0);
        return { sales, present, total: employees.length, payroll };
    }, [boutiques, employees]);

    function handleStatusChange(id: string, status: AttendanceStatus) {
        setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    }

    function handleAdvance(id: string, amount: number) {
        setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, advances: e.advances + amount } : e)));
    }

    function handleTransfer(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const qty = Number(quantity) || 0;
        if (!product.trim() || qty <= 0 || fromId === toId) return;
        const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        setTransfers((prev) => [{
            id: `T-${String(prev.length + 1).padStart(2, "0")}`,
            date: today,
            product: product.trim(),
            quantity: qty,
            fromId,
            toId,
            by: "Gérant",
        }, ...prev]);
        setProduct("");
        setQuantity("");
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Étape 5 — Boutiques</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">Multi-boutique &amp; personnel</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Comparez les points de vente, pointez les équipes, transférez le stock.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Store className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ventes cumulées du jour</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(stats.sales)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Users className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Présents aujourd’hui</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.present} / {stats.total}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Banknote className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Masse salariale nette</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(stats.payroll)}</p>
                </div>
            </div>
            <div className="mb-10">
                <h2 className="text-xl font-bold dark:text-white text-neutral-900 mb-4">Points de vente</h2>
                <BoutiqueCards boutiques={boutiques} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                <StaffTable employees={employees} onStatusChange={handleStatusChange} onAdvance={handleAdvance} />
                <TransferPanel boutiques={boutiques} transfers={transfers} product={product} onProductChange={setProduct} quantity={quantity} onQuantityChange={setQuantity} fromId={fromId} onFromChange={setFromId} toId={toId} onToChange={setToId} onSubmit={handleTransfer} />
            </div>
        </div>
    );
}

