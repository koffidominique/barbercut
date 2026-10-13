"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditClient } from "./credit-data";

type Props = {
    client: CreditClient;
    onAddPayment: (clientId: string, amount: number, method: "Espèces" | "Mobile money" | "Carte") => void;
    onAddCredit: (clientId: string, amount: number) => void;
};

export function ClientCreditActions({ client, onAddPayment, onAddCredit }: Props) {
    const [showPayment, setShowPayment] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payMethod, setPayMethod] = useState<"Espèces" | "Mobile money" | "Carte">("Espèces");
    const [showCredit, setShowCredit] = useState(false);
    const [creditAmount, setCreditAmount] = useState("");

    return (
        <div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <Button type="button" variant="outline" onClick={() => { setShowPayment(!showPayment); setShowCredit(false); }} className="h-10 text-xs font-bold">+ Paiement</Button>
                <Button type="button" variant="outline" onClick={() => { setShowCredit(!showCredit); setShowPayment(false); }} className="h-10 text-xs font-bold">+ Crédit</Button>
            </div>
            {showPayment && (
                <div className="rounded-xl border border-neutral-200 dark:border-white/10 p-3 space-y-2 mb-2">
                    <Field>
                        <FieldLabel htmlFor={`pay-${client.id}`}>Montant reçu (FCFA)</FieldLabel>
                        <Input id={`pay-${client.id}`} inputMode="numeric" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="10000" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`pm-${client.id}`}>Moyen</FieldLabel>
                        <Select value={payMethod} onValueChange={(v) => v && setPayMethod(v as typeof payMethod)}>
                            <SelectTrigger id={`pm-${client.id}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Espèces">Espèces</SelectItem>
                                <SelectItem value="Mobile money">Mobile money</SelectItem>
                                <SelectItem value="Carte">Carte</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Button type="button" className="h-9 w-full text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" onClick={() => { const a = Number(payAmount.replace(/\s/g, "")) || 0; if (a <= 0) return; onAddPayment(client.id, a, payMethod); setPayAmount(""); setShowPayment(false); }}>
                        Enregistrer le paiement
                    </Button>
                </div>
            )}
            {showCredit && (
                <div className="rounded-xl border border-neutral-200 dark:border-white/10 p-3 space-y-2 mb-2">
                    <Field>
                        <FieldLabel htmlFor={`cr-${client.id}`}>Nouvelle vente à crédit (FCFA)</FieldLabel>
                        <Input id={`cr-${client.id}`} inputMode="numeric" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="15000" />
                    </Field>
                    <Button type="button" className="h-9 w-full text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" onClick={() => { const a = Number(creditAmount.replace(/\s/g, "")) || 0; if (a <= 0) return; onAddCredit(client.id, a); setCreditAmount(""); setShowCredit(false); }}>
                        Ajouter au solde
                    </Button>
                </div>
            )}
        </div>
    );
}
