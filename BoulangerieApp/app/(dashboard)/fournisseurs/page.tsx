"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { SupplierCards } from "@/components/fournisseurs/SupplierCards";
import { OrderForm } from "@/components/fournisseurs/OrderForm";
import { OrderHistory } from "@/components/fournisseurs/OrderHistory";
import { OrderStatus, flourPriceTrend, formatFCFA, initialOrders, initialSuppliers, orderTotal } from "@/components/fournisseurs/supplier-data";

export default function FournisseursPage() {
    const [suppliers] = useState(initialSuppliers);
    const [orders, setOrders] = useState(initialOrders);
    const [supplierId, setSupplierId] = useState("F-01");
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("kg");
    const [unitPrice, setUnitPrice] = useState("");

    const stats = useMemo(() => {
        const active = orders.filter((o) => o.status !== "Annulée");
        const spent = active.reduce((s, o) => s + orderTotal(o), 0);
        const pending = orders.filter((o) => o.status === "En attente" || o.status === "Confirmée").length;
        return { spent, pending, trend: flourPriceTrend(orders) };
    }, [orders]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const qty = Number(quantity) || 0;
        const price = Number(unitPrice.replace(/\s/g, "")) || 0;
        if (!product.trim() || qty <= 0 || price <= 0) return;
        const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        setOrders((prev) => [{
            id: `CMD-${String(13 + prev.length).padStart(3, "0")}`,
            date: today,
            supplierId,
            product: product.trim(),
            quantity: qty,
            unit,
            unitPrice: price,
            status: "En attente",
            by: "Gérant",
        }, ...prev]);
        setProduct("");
        setQuantity("");
        setUnitPrice("");
    }

    function handleStatusChange(id: string, status: OrderStatus) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Bonus — Achats</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">Fournisseurs &amp; commandes</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Suivez le prix de la farine et vos achats en temps réel.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Wallet className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total des achats</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(stats.spent)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><ShoppingCart className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Commandes en cours</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.pending}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${stats.trend && stats.trend.diff > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                            {stats.trend && stats.trend.diff > 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        </div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Prix farine (kg)</p>
                    </div>
                    {stats.trend ? (
                        <p className="text-2xl font-black dark:text-white text-neutral-900">
                            {formatFCFA(stats.trend.last)}{" "}
                            <span className={`text-sm font-bold ${stats.trend.diff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                {stats.trend.diff > 0 ? "+" : ""}{stats.trend.pct}% vs {formatFCFA(stats.trend.first)}
                            </span>
                        </p>
                    ) : (
                        <p className="text-2xl font-black dark:text-white text-neutral-900">—</p>
                    )}
                </div>
            </div>
            <div className="mb-10">
                <h2 className="text-xl font-bold dark:text-white text-neutral-900 mb-4">Fournisseurs</h2>
                <SupplierCards suppliers={suppliers} orders={orders} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6">
                <OrderForm suppliers={suppliers} supplierId={supplierId} onSupplierChange={setSupplierId} product={product} onProductChange={setProduct} quantity={quantity} onQuantityChange={setQuantity} unit={unit} onUnitChange={setUnit} unitPrice={unitPrice} onUnitPriceChange={setUnitPrice} onSubmit={handleSubmit} />
                <OrderHistory orders={orders} suppliers={suppliers} onStatusChange={handleStatusChange} />
            </div>
        </div>
    );
}

