"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, TriangleAlert, Users, UserPlus, MessageCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ClientCreditHeader } from "@/components/credit/ClientCreditHeader";
import { ClientCreditActions } from "@/components/credit/ClientCreditActions";
import { CreditClient, clientStatus, formatFCFA, initialClients, reminderMessage } from "@/components/credit/credit-data";

export default function CreditPage() {
    const [clients, setClients] = useState<CreditClient[]>(initialClients);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [limit, setLimit] = useState("50000");

    const stats = useMemo(() => {
        const total = clients.reduce((s, c) => s + c.balance, 0);
        const overdue = clients.filter((c) => clientStatus(c) === "En retard" || clientStatus(c) === "Bloqué").length;
        return { total, overdue, count: clients.length };
    }, [clients]);

    function handleRemind(client: CreditClient) {
        const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, lastReminder: today } : c)));
    }

    function handleAddPayment(clientId: string, amount: number, method: "Espèces" | "Mobile money" | "Carte") {
        const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        setClients((prev) => prev.map((c) => {
            if (c.id !== clientId) return c;
            return {
                ...c,
                balance: Math.max(0, c.balance - amount),
                payments: [...c.payments, { id: `P-${Date.now()}`, date: today, amount, method }],
            };
        }));
    }

    function handleAddCredit(clientId: string, amount: number) {
        setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, balance: c.balance + amount } : c)));
    }

    function handleAddClient(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!name.trim() || !phone.trim()) return;
        const today = new Date();
        const due = new Date(today);
        due.setDate(due.getDate() + 7);
        const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        setClients((prev) => [{
            id: `CC-${String(prev.length + 1).padStart(3, "0")}`,
            name: name.trim(),
            phone: phone.trim(),
            creditLimit: Number(limit.replace(/\s/g, "")) || 0,
            balance: 0,
            dueDate: fmt(due),
            daysOverdue: 0,
            lastReminder: null,
            payments: [],
        }, ...prev]);
        setName("");
        setPhone("");
        setLimit("50000");
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Étape 4 — Crédit</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">Clients à crédit</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Plafonds, paiements partiels et relances WhatsApp.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><CircleDollarSign className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total à recouvrer</p>
                    </div>
                    <p className="text-2xl font-black text-red-500">{formatFCFA(stats.total)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><TriangleAlert className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Dossiers en retard / bloqués</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.overdue}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Users className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Clients suivis</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.count}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
                <div className="glass-card rounded-3xl p-6 sm:p-8 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><UserPlus className="h-6 w-6" /></div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white text-neutral-900">Nouveau client</h2>
                            <p className="text-sm text-neutral-500">Échéance par défaut : 7 jours.</p>
                        </div>
                    </div>
                    <form onSubmit={handleAddClient}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="credit-name">Nom</FieldLabel>
                                <Input id="credit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="M. Yao" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="credit-phone">Téléphone (WhatsApp)</FieldLabel>
                                <Input id="credit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="credit-limit">Plafond de crédit (FCFA)</FieldLabel>
                                <Input id="credit-limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="50000" required />
                            </Field>
                            <Button type="submit" className="mt-2 h-11 w-full bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
                                Ajouter le client
                            </Button>
                        </FieldGroup>
                    </form>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {clients.map((client) => {
                        const waLink = `https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(reminderMessage(client))}`;
                        return (
                            <div key={client.id} className="glass-card rounded-3xl p-6">
                                <ClientCreditHeader client={client} />
                                <ClientCreditActions client={client} onAddPayment={handleAddPayment} onAddCredit={handleAddCredit} />
                                <div className="grid grid-cols-2 gap-2">
                                    <a href={waLink} target="_blank" rel="noreferrer" onClick={() => handleRemind(client)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700">
                                        <MessageCircle className="h-4 w-4" /> WhatsApp
                                    </a>
                                    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-white/10 px-2 text-xs text-neutral-500">
                                        <History className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{client.payments.length} paiement(s)</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

