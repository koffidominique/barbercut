"use client";

import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Boutique, StockTransfer } from "./shop-data";

type Props = {
    boutiques: Boutique[];
    transfers: StockTransfer[];
    product: string;
    onProductChange: (v: string) => void;
    quantity: string;
    onQuantityChange: (v: string) => void;
    fromId: string;
    onFromChange: (v: string) => void;
    toId: string;
    onToChange: (v: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function TransferPanel(props: Props) {
    const nameOf = (id: string) => props.boutiques.find((b) => b.id === id)?.name ?? id;
    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><ArrowRightLeft className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Transferts de stock</h2>
                    <p className="text-sm text-neutral-500">Dépannez une boutique depuis une autre.</p>
                </div>
            </div>
            <form onSubmit={props.onSubmit} className="mb-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="tr-product">Produit</FieldLabel>
                        <Input id="tr-product" value={props.product} onChange={(e) => props.onProductChange(e.target.value)} placeholder="Baguette classique" required />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                        <Field>
                            <FieldLabel htmlFor="tr-from">De</FieldLabel>
                            <Select value={props.fromId} onValueChange={(v) => v && props.onFromChange(v)}>
                                <SelectTrigger id="tr-from"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {props.boutiques.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tr-to">Vers</FieldLabel>
                            <Select value={props.toId} onValueChange={(v) => v && props.onToChange(v)}>
                                <SelectTrigger id="tr-to"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {props.boutiques.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tr-qty">Qté</FieldLabel>
                            <Input id="tr-qty" inputMode="numeric" value={props.quantity} onChange={(e) => props.onQuantityChange(e.target.value)} placeholder="100" required />
                        </Field>
                    </div>
                    <Button type="submit" className="h-10 w-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
                        Enregistrer le transfert
                    </Button>
                </FieldGroup>
            </form>
            <div className="space-y-2">
                {props.transfers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm">
                        <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{t.quantity} × {t.product}</p>
                            <p className="text-xs text-neutral-500">{t.date} · par {t.by}</p>
                        </div>
                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{nameOf(t.fromId)} → {nameOf(t.toId)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
