"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ClosureRecord } from "./closure-data";

type ClosureFormProps = {
    cashier: string;
    onCashierChange: (value: string) => void;
    openingFund: string;
    onOpeningFundChange: (value: string) => void;
    cashSales: string;
    onCashSalesChange: (value: string) => void;
    mobileSales: string;
    onMobileSalesChange: (value: string) => void;
    cardSales: string;
    onCardSalesChange: (value: string) => void;
    expenses: string;
    onExpensesChange: (value: string) => void;
    countedCash: string;
    onCountedCashChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ClosureForm(props: ClosureFormProps) {
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Plus className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Clôture du jour</h2>
                    <p className="text-sm text-neutral-500">Remplissez les montants en FCFA.</p>
                </div>
            </div>
            <form onSubmit={props.onSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="caisse-cashier">Caissier / caissière</FieldLabel>
                        <Select value={props.cashier} onValueChange={(value) => value && props.onCashierChange(value)}>
                            <SelectTrigger id="caisse-cashier">
                                <SelectValue placeholder="Choisir le caissier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Awa Koné">Awa Koné</SelectItem>
                                <SelectItem value="Jean-Claude">Jean-Claude</SelectItem>
                                <SelectItem value="Mariam Traoré">Mariam Traoré</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="caisse-opening">Fond de caisse (matin)</FieldLabel>
                            <Input id="caisse-opening" inputMode="numeric" value={props.openingFund} onChange={(e) => props.onOpeningFundChange(e.target.value)} placeholder="50000" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="caisse-counted">Espèces comptées (soir)</FieldLabel>
                            <Input id="caisse-counted" inputMode="numeric" value={props.countedCash} onChange={(e) => props.onCountedCashChange(e.target.value)} placeholder="338000" required />
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field>
                            <FieldLabel htmlFor="caisse-cash">Ventes espèces</FieldLabel>
                            <Input id="caisse-cash" inputMode="numeric" value={props.cashSales} onChange={(e) => props.onCashSalesChange(e.target.value)} placeholder="312500" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="caisse-mobile">Ventes mobile money</FieldLabel>
                            <Input id="caisse-mobile" inputMode="numeric" value={props.mobileSales} onChange={(e) => props.onMobileSalesChange(e.target.value)} placeholder="148000" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="caisse-card">Ventes carte</FieldLabel>
                            <Input id="caisse-card" inputMode="numeric" value={props.cardSales} onChange={(e) => props.onCardSalesChange(e.target.value)} placeholder="42000" required />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="caisse-expenses">Dépenses du jour (sacs, transport, gaz…)</FieldLabel>
                        <Input id="caisse-expenses" inputMode="numeric" value={props.expenses} onChange={(e) => props.onExpensesChange(e.target.value)} placeholder="25000" required />
                    </Field>
                    <Button type="submit" className="mt-2 h-11 w-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                        Enregistrer la clôture
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}

export type { ClosureRecord };
