"use client";

import { useMemo, useState } from "react";
import { TrendingDown, Trash2, Flame, HandCoins } from "lucide-react";
import { LossForm } from "@/components/pertes/LossForm";
import { LossHistory } from "@/components/pertes/LossHistory";
import { LossReason, LossRecord, PRODUCT_CATALOG, formatFCFA, initialLosses, lossAmount } from "@/components/pertes/loss-data";

export default function PertesPage() {
    const [losses, setLosses] = useState<LossRecord[]>(initialLosses);
    const [product, setProduct] = useState(PRODUCT_CATALOG[0].name);
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState<LossReason>("Invendu");
    const [recordedBy, setRecordedBy] = useState("Awa Koné");
    const [comment, setComment] = useState("");

    const stats = useMemo(() => {
        const total = losses.reduce((sum, l) => sum + lossAmount(l), 0);
        const totalQty = losses.reduce((sum, l) => sum + l.quantity, 0);
        const todayLabel = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const todayLoss = losses.filter((l) => l.date === todayLabel).reduce((sum, l) => sum + lossAmount(l), 0);
        const topProduct = losses.reduce<Record<string, number>>((acc, l) => {
            acc[l.product] = (acc[l.product] ?? 0) + lossAmount(l);
            return acc;
        }, {});
        const topName = Object.entries(topProduct).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return { total, totalQty, todayLoss, topName };
    }, [losses]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const catalog = PRODUCT_CATALOG.find((p) => p.name === product);
        const qty = Number(quantity) || 0;
        if (!catalog || qty <= 0) return;
        const today = new Date();
        const record: LossRecord = {
            id: `PT-${String(losses.length + 1).padStart(3, "0")}`,
            date: today.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
            product,
            quantity: qty,
            unitPrice: catalog.unitPrice,
            reason,
            recordedBy,
            comment: comment.trim(),
        };
        setLosses((prev) => [record, ...prev]);
        setQuantity("");
        setComment("");
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Étape 2 — Pertes</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">
                    Pertes &amp; invendus
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">Chaque pain perdu compte : déclarez, mesurez, réduisez.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><TrendingDown className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Manque à gagner total</p>
                    </div>
                    <p className="text-2xl font-black text-red-500">{formatFCFA(stats.total)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Trash2 className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Unités perdues</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.totalQty}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500"><Flame className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pertes du jour</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(stats.todayLoss)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500"><HandCoins className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Produit le plus touché</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.topName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
                <LossForm
                    product={product}
                    onProductChange={setProduct}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    reason={reason}
                    onReasonChange={setReason}
                    recordedBy={recordedBy}
                    onRecordedByChange={setRecordedBy}
                    comment={comment}
                    onCommentChange={setComment}
                    onSubmit={handleSubmit}
                />
                <LossHistory losses={losses} />
            </div>
        </div>
    );
}

