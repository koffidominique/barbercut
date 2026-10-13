"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LOSS_REASONS, LossReason, PRODUCT_CATALOG, formatFCFA } from "./loss-data";

type LossFormProps = {
    product: string;
    onProductChange: (value: string) => void;
    quantity: string;
    onQuantityChange: (value: string) => void;
    reason: LossReason;
    onReasonChange: (value: LossReason) => void;
    recordedBy: string;
    onRecordedByChange: (value: string) => void;
    comment: string;
    onCommentChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function LossForm(props: LossFormProps) {
    const selected = PRODUCT_CATALOG.find((p) => p.name === props.product);
    const qty = Number(props.quantity) || 0;
    const preview = selected ? qty * selected.unitPrice : 0;

    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Plus className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Déclarer une perte</h2>
                    <p className="text-sm text-neutral-500">Compteur du soir, en 30 secondes.</p>
                </div>
            </div>
            <form onSubmit={props.onSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="perte-produit">Produit</FieldLabel>
                        <Select value={props.product} onValueChange={(v) => v && props.onProductChange(v)}>
                            <SelectTrigger id="perte-produit">
                                <SelectValue placeholder="Choisir le produit" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRODUCT_CATALOG.map((p) => (
                                    <SelectItem key={p.name} value={p.name}>
                                        {p.name} — {formatFCFA(p.unitPrice)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="perte-qte">Quantité perdue</FieldLabel>
                            <Input id="perte-qte" inputMode="numeric" value={props.quantity} onChange={(e) => props.onQuantityChange(e.target.value)} placeholder="45" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="perte-motif">Motif</FieldLabel>
                            <Select value={props.reason} onValueChange={(v) => v && props.onReasonChange(v as LossReason)}>
                                <SelectTrigger id="perte-motif">
                                    <SelectValue placeholder="Choisir le motif" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOSS_REASONS.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="perte-auteur">Déclaré par</FieldLabel>
                        <Select value={props.recordedBy} onValueChange={(v) => v && props.onRecordedByChange(v)}>
                            <SelectTrigger id="perte-auteur">
                                <SelectValue placeholder="Qui déclare ?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Awa Koné">Awa Koné</SelectItem>
                                <SelectItem value="Jean-Claude">Jean-Claude</SelectItem>
                                <SelectItem value="Mariam Traoré">Mariam Traoré</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="perte-comment">Commentaire (optionnel)</FieldLabel>
                        <Textarea id="perte-comment" value={props.comment} onChange={(e) => props.onCommentChange(e.target.value)} placeholder="Ex : pluie en soirée, four trop chaud…" rows={2} />
                    </Field>
                    {preview > 0 && (
                        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
                            Manque à gagner estimé : {formatFCFA(preview)}
                        </p>
                    )}
                    <Button type="submit" className="mt-2 h-11 w-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                        Enregistrer la perte
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
