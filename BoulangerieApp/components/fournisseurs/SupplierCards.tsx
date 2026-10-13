"use client";

import { Truck, Phone } from "lucide-react";
import { Supplier, PurchaseOrder, formatFCFA, orderTotal } from "./supplier-data";

export function SupplierCards({ suppliers, orders }: { suppliers: Supplier[]; orders: PurchaseOrder[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {suppliers.map((s) => {
                const supOrders = orders.filter((o) => o.supplierId === s.id && o.status !== "Annulée");
                const spent = supOrders.reduce((sum, o) => sum + orderTotal(o), 0);
                return (
                    <div key={s.id} className="glass-card rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Truck className="h-6 w-6" /></div>
                            <div>
                                <h3 className="font-bold dark:text-white text-neutral-900">{s.name}</h3>
                                <p className="text-xs text-neutral-500">{s.category}</p>
                            </div>
                        </div>
                        <p className="flex items-center gap-1 text-xs text-neutral-500 mb-1"><Phone className="h-3 w-3" />{s.phone} · {s.contact}</p>
                        <p className="text-xs text-neutral-500 mb-3">Paiement : {s.paymentTerms}</p>
                        <div className="rounded-xl bg-neutral-100 dark:bg-white/5 p-3">
                            <p className="text-xs text-neutral-500">Total acheté</p>
                            <p className="font-black text-neutral-900 dark:text-white">{formatFCFA(spent)}</p>
                            <p className="text-xs text-neutral-500">{supOrders.length} commande(s)</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
