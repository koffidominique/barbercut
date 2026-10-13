import { ReceiptText } from "lucide-react";
import { formatFCFA, paymentLabel } from "./SaleEntryForm";

export type SaleRecord = {
    id: string;
    date: string;
    paymentMethod: string;
    total: number;
    items: { name: string; quantity: number; unitPrice: number }[];
};

export function SalesHistory({ sales }: { sales: SaleRecord[] }) {
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Historique</p>
                    <h3 className="text-xl font-bold dark:text-white text-neutral-900">Dernières ventes</h3>
                </div>
                <ReceiptText className="h-5 w-5 text-primary" />
            </div>

            <ul className="space-y-3">
                {sales.map((sale) => (
                    <li
                        key={sale.id}
                        className="rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-neutral-900 dark:text-white">{sale.date}</span>
                            <span className="font-black text-primary">{formatFCFA(sale.total)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                                {paymentLabel(sale.paymentMethod)}
                            </span>
                            {sale.items.map((item) => (
                                <span key={item.name}>
                                    {item.quantity} × {item.name}
                                </span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
