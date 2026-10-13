"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatus, PurchaseOrder, Supplier, formatFCFA, orderStatusStyles, orderTotal } from "./supplier-data";

type Props = {
    orders: PurchaseOrder[];
    suppliers: Supplier[];
    onStatusChange: (id: string, status: OrderStatus) => void;
};

export function OrderHistory({ orders, suppliers, onStatusChange }: Props) {
    const nameOf = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
    const nextStatus = (s: OrderStatus): OrderStatus | null => {
        if (s === "En attente") return "Confirmée";
        if (s === "Confirmée") return "Reçue";
        return null;
    };
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><History className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Commandes</h2>
                    <p className="text-sm text-neutral-500">Faites avancer le statut en un clic.</p>
                </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10">
                <table className="w-full text-left text-sm min-w-[720px]">
                    <thead className="bg-neutral-100 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">N°</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Fournisseur</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Produit</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Total</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Statut</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => {
                            const next = nextStatus(o.status);
                            return (
                                <tr key={o.id} className="border-t border-neutral-200 dark:border-white/10">
                                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{o.id}<br /><span className="text-xs font-normal text-neutral-500">{o.date}</span></td>
                                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{nameOf(o.supplierId)}</td>
                                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{o.quantity} {o.unit} × {o.product}<br /><span className="text-xs text-neutral-500">{formatFCFA(o.unitPrice)}/{o.unit}</span></td>
                                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">{formatFCFA(orderTotal(o))}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${orderStatusStyles(o.status)}`}>{o.status}</span></td>
                                    <td className="px-4 py-3">
                                        {next ? (
                                            <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => onStatusChange(o.id, next)}>→ {next}</Button>
                                        ) : (
                                            <span className="text-xs text-neutral-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
