"use client";

import { FormEvent, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type SaleProduct = {
    id: string;
    name: string;
    salePrice: number;
    unitCost: number;
};

export type CartLine = {
    productId: string;
    quantity: number;
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: "Espèces",
    mobile: "Mobile money",
    card: "Carte",
};

export function paymentLabel(method: string) {
    return PAYMENT_LABELS[method] ?? method;
}

export function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

type SaleEntryFormProps = {
    products: SaleProduct[];
    isSubmitting: boolean;
    error: string;
    onSubmit: (items: CartLine[], paymentMethod: string) => void;
};

export function SaleEntryForm({ products, isSubmitting, error, onSubmit }: SaleEntryFormProps) {
    const [selectedId, setSelectedId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cart, setCart] = useState<CartLine[]>([]);

    const selectedProduct = products.find((p) => p.id === selectedId);

    const cartTotal = useMemo(
        () =>
            cart.reduce((sum, line) => {
                const product = products.find((p) => p.id === line.productId);
                return sum + (product ? product.salePrice * line.quantity : 0);
            }, 0),
        [cart, products],
    );

    function handleAddLine() {
        if (!selectedProduct) return;
        const qty = Math.max(1, Math.min(10_000, Number(quantity) || 1));
        setCart((prev) => {
            const existing = prev.find((line) => line.productId === selectedProduct.id);
            if (existing) {
                return prev.map((line) =>
                    line.productId === selectedProduct.id
                        ? { ...line, quantity: Math.min(10_000, line.quantity + qty) }
                        : line,
                );
            }
            return [...prev, { productId: selectedProduct.id, quantity: qty }];
        });
        setQuantity("1");
    }

    function handleChangeLine(productId: string, delta: number) {
        setCart((prev) =>
            prev
                .map((line) =>
                    line.productId === productId
                        ? { ...line, quantity: Math.max(0, Math.min(10_000, line.quantity + delta)) }
                        : line,
                )
                .filter((line) => line.quantity > 0),
        );
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (cart.length === 0 || isSubmitting) return;
        onSubmit(cart, paymentMethod);
    }

    if (products.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-6 sm:p-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Aucun produit disponible. Créez d’abord une fiche recette pour vendre.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <ShoppingBasket className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Caisse</p>
                    <h3 className="text-xl font-bold dark:text-white text-neutral-900">Nouvelle vente</h3>
                </div>
            </div>

            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="sale-product">Produit</FieldLabel>
                    <Select value={selectedId} onValueChange={(value) => value && setSelectedId(value)}>
                        <SelectTrigger id="sale-product">
                            <SelectValue placeholder="Choisir un produit" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                    {product.name} — {formatFCFA(product.salePrice)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor="sale-qty">Quantité</FieldLabel>
                        <Input
                            id="sale-qty"
                            inputMode="numeric"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="sale-payment">Paiement</FieldLabel>
                        <Select value={paymentMethod} onValueChange={(value) => value && setPaymentMethod(value)}>
                            <SelectTrigger id="sale-payment">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Espèces</SelectItem>
                                <SelectItem value="mobile">Mobile money</SelectItem>
                                <SelectItem value="card">Carte</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </FieldGroup>

            <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                disabled={!selectedProduct || isSubmitting}
                onClick={handleAddLine}
            >
                <Plus className="h-4 w-4" /> Ajouter au ticket
            </Button>

            <div className="mt-6 space-y-3">
                {cart.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Le ticket est vide — ajoutez au moins un produit.
                    </p>
                ) : (
                    cart.map((line) => {
                        const product = products.find((p) => p.id === line.productId);
                        if (!product) return null;
                        return (
                            <div
                                key={line.productId}
                                className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <p className="font-bold text-neutral-900 dark:text-white truncate">{product.name}</p>
                                    <p className="text-xs text-neutral-500">
                                        {formatFCFA(product.salePrice)} × {line.quantity} ={" "}
                                        {formatFCFA(product.salePrice * line.quantity)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        aria-label={`Retirer un ${product.name}`}
                                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
                                        onClick={() => handleChangeLine(line.productId, -1)}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center font-black text-neutral-900 dark:text-white">
                                        {line.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label={`Ajouter un ${product.name}`}
                                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
                                        onClick={() => handleChangeLine(line.productId, 1)}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 dark:border-white/10 pt-4">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total du ticket</span>
                <span className="text-2xl font-black text-primary">{formatFCFA(cartTotal)}</span>
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}
                </p>
            )}

            <Button type="submit" className="mt-4 w-full" disabled={cart.length === 0 || isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer la vente"}
            </Button>
        </form>
    );
}