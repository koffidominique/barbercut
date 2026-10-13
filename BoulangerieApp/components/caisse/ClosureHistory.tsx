"use client";

import { History } from "lucide-react";
import { ClosureRecord, formatFCFA, statusStyles } from "./closure-data";

export function ClosureHistory({ history }: { history: ClosureRecord[] }) {
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><History className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Historique des clôtures</h2>
                    <p className="text-sm text-neutral-500">Les plus récentes en premier.</p>
                </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10">
                <table className="w-full text-left text-sm min-w-[640px]">
                    <thead className="bg-neutral-100 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Date</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Caissier</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Attendu</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Compté</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Écart</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((row) => (
                            <tr key={row.id} className="border-t border-neutral-200 dark:border-white/10">
                                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{row.date}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{row.cashier}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatFCFA(row.expectedCash)}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatFCFA(row.countedCash)}</td>
                                <td className={`px-4 py-3 font-bold ${row.difference === 0 ? "text-emerald-500" : row.difference > 0 ? "text-cyan-500" : "text-red-500"}`}>
                                    {row.difference > 0 ? "+" : ""}{formatFCFA(row.difference)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
