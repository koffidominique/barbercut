"use client";

import { Phone } from "lucide-react";
import { CreditClient, clientStatus, formatFCFA, statusStyles } from "./credit-data";

type Props = { client: CreditClient };

export function ClientCreditHeader({ client }: Props) {
    const status = clientStatus(client);
    const usagePct = client.creditLimit > 0 ? Math.min(100, Math.round((client.balance / client.creditLimit) * 100)) : 100;
    return (
        <div>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-bold dark:text-white text-neutral-900">{client.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-neutral-500"><Phone className="h-3 w-3" />{client.phone}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles(status)}`}>{status}</span>
            </div>
            <div className="mb-2 flex items-baseline justify-between">
                <p className="text-2xl font-black text-red-500">{formatFCFA(client.balance)}</p>
                <p className="text-xs text-neutral-500">Plafond {formatFCFA(client.creditLimit)}</p>
            </div>
            <div className="h-2 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden mb-3">
                <div className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usagePct}%` }} />
            </div>
            <p className="text-xs text-neutral-500 mb-4">
                Échéance : <span className="font-semibold text-neutral-700 dark:text-neutral-200">{client.dueDate}</span>
                {client.daysOverdue > 0 && <span className="font-bold text-red-500"> — {client.daysOverdue} j de retard</span>}
                {client.lastReminder && <span> · Relance : {client.lastReminder}</span>}
            </p>
        </div>
    );
}
