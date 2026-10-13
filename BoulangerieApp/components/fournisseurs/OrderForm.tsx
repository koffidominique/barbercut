"use client";

import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Supplier, formatFCFA } from "./supplier-data";

type Props = {
    suppliers: Supplier[];
    supplierId: string;
    onSupplierChange: (v: string) => void;
    product: string;
    onProductChange: (v: string) => void;
    quantity: string;
    onQuantityChange: (v: string) => void;
    unit: string;
    onUnitChange: (v: string) => void;
    unitPrice: string;
    onUnitPriceChange: (v: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function OrderForm(props: Props) {
    const qty = Number(props.quantity) || 0;
    const price = Number(props.unitPrice.replace(/\s/g, "")) || 0;
    const total = qty * price;
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><ClipboardList className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Nouvelle commande</h2>
                    <p className="text-sm text-neutral-500">Statut initial : En attente.</p>
                </div>
            </div>
            <form onSubmit={props.onSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="cmd-supplier">Fournisseur</FieldLabel>
                        <Select value={props.supplierId} onValueChange={(v) => v && props.onSupplierChange(v)}>
                            <SelectTrigger id="cmd-supplier"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {props.suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="cmd-product">Produit</FieldLabel>
                        <Input id="cmd-product" value={props.product} onChange={(e) => props.onProductChange(e.target.value)} placeholder="Farine de blé" required />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                        <Field>
                            <FieldLabel htmlFor="cmd-qty">Quantité</FieldLabel>
                            <Input id="cmd-qty" inputMode="numeric" value={props.quantity} onChange={(e) => props.onQuantityChange(e.target.value)} placeholder="500" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="cmd-unit">Unité</FieldLabel>
                            <Select value={props.unit} onValueChange={(v) => v && props.onUnitChange(v)}>
                                <SelectTrigger id="cmd-unit"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="pièce">pièce</SelectItem>
                                    <SelectItem value="sac">sac</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="cmd-price">Prix unit. (FCFA)</FieldLabel>
                            <Input id="cmd-price" inputMode="numeric" value={props.unitPrice} onChange={(e) => props.onUnitPriceChange(e.target.value)} placeholder="650" required />
                        </Field>
                    </div>
                    {total > 0 && (
                        <p className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                            Total estimé : {formatFCFA(total)}
                        </p>
                    )}
                    <Button type="submit" className="mt-2 h-11 w-full bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
                        Passer la commande
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
