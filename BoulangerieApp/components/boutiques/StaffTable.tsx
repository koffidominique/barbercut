"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AttendanceStatus, Employee, attendanceStyles, formatFCFA } from "./shop-data";

type Props = {
    employees: Employee[];
    onStatusChange: (id: string, status: AttendanceStatus) => void;
    onAdvance: (id: string, amount: number) => void;
};

export function StaffTable({ employees, onStatusChange, onAdvance }: Props) {
    const [advanceFor, setAdvanceFor] = useState<string | null>(null);
    const [advanceAmount, setAdvanceAmount] = useState("");

    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold dark:text-white text-neutral-900 mb-2">Personnel &amp; pointage</h2>
            <p className="text-sm text-neutral-500 mb-6">Présences du jour, avances et net à payer.</p>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10">
                <table className="w-full text-left text-sm min-w-[720px]">
                    <thead className="bg-neutral-100 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Employé</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Rôle</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Arrivée</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Statut</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Avances</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Net à payer</th>
                            <th className="px-4 py-3 font-bold text-neutral-700 dark:text-neutral-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((e) => (
                            <tr key={e.id} className="border-t border-neutral-200 dark:border-white/10">
                                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{e.name}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{e.role}</td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{e.checkIn ?? "—"}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={e.status}
                                        onChange={(e2) => onStatusChange(e.id, e2.target.value as AttendanceStatus)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold border-0 cursor-pointer ${attendanceStyles(e.status)}`}
                                    >
                                        <option value="Présent">Présent</option>
                                        <option value="Retard">Retard</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Congé">Congé</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-semibold">{formatFCFA(e.advances)}</td>
                                <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">{formatFCFA(e.salary - e.advances)}</td>
                                <td className="px-4 py-3">
                                    {advanceFor === e.id ? (
                                        <div className="flex gap-1">
                                            <Input value={advanceAmount} onChange={(ev) => setAdvanceAmount(ev.target.value)} inputMode="numeric" placeholder="15000" className="h-8 w-24 text-xs" />
                                            <Button type="button" className="h-8 text-xs" onClick={() => { const a = Number(advanceAmount.replace(/\s/g, "")) || 0; if (a > 0) onAdvance(e.id, a); setAdvanceFor(null); setAdvanceAmount(""); }}>OK</Button>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => setAdvanceFor(e.id)}>+ Avance</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <Field>
                    <FieldLabel>Pointage rapide</FieldLabel>
                    <p className="text-xs text-neutral-500">Changez le statut dans le tableau : le compteur du header se met à jour instantanément.</p>
                </Field>
            </div>
        </div>
    );
}
