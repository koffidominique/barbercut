"use client";

import { Store } from "lucide-react";
import { Boutique, formatFCFA } from "./shop-data";

export function BoutiqueCards({ boutiques }: { boutiques: Boutique[] }) {
    const max = Math.max(...boutiques.map((b) => b.dailySales), 1);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {boutiques.map((b) => (
                <div key={b.id} className="glass-card rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Store className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-lg font-bold dark:text-white text-neutral-900">{b.name}</h3>
                            <p className="text-xs text-neutral-500">{b.address} · {b.manager}</p>
                        </div>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(b.dailySales)}</p>
                    <p className="text-xs text-neutral-500 mb-3">Ventes du jour · {b.staff} employés</p>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${Math.round((b.dailySales / max) * 100)}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
