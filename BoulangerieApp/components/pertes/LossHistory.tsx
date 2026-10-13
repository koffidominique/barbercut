"use client";

import { History } from "lucide-react";
import { LossRecord, formatFCFA, lossAmount, reasonStyles } from "./loss-data";

export function LossHistory({ losses }: { losses: LossRecord[] }) {
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><History className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Pertes déclarées</h2>
                    <p className="text-sm text-neutral-500">Les plus récentes en premier.</p>
                </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10">
                <table className="w-full text-left text-sm min-w-[680px]">
                    <thead className="bg-neutral-100 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Date</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Produit</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Qté</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Motif</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Montant</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Par</th>
                        </tr>
                    </thead>
                    <tbody>
                        {losses.map((row) => (
                            <tr key={row.id} className="border-t border-neutral-200 dark:border-white/10">
                                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{row.date}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{row.product}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{row.quantity}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${reasonStyles(row.reason)}`}>
                                        {row.reason}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-red-500">{formatFCFA(lossAmount(row))}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{row.recordedBy}</td>
                            </tr>
                        ))}
                        {losses.length === 0 && (
                            <tr className="border-t border-neutral-200 dark:border-white/10">
                                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">Aucune perte déclarée pour le moment.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
