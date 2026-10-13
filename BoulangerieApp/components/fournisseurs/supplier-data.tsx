export type OrderStatus = "En attente" | "Confirmée" | "Reçue" | "Annulée";

export type Supplier = {
    id: string;
    name: string;
    contact: string;
    phone: string;
    category: string;
    paymentTerms: string;
};

export type PurchaseOrder = {
    id: string;
    date: string;
    supplierId: string;
    product: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    status: OrderStatus;
    by: string;
};

export const initialSuppliers: Supplier[] = [
    { id: "F-01", name: "Moulins d'Abidjan", contact: "Service commercial", phone: "+225 27 20 11 22", category: "Farine & céréales", paymentTerms: "30 jours" },
    { id: "F-02", name: "Levure Prestige CI", contact: "K. Bamba", phone: "+225 07 44 55 66", category: "Levure & intrants", paymentTerms: "Comptant" },
    { id: "F-03", name: "Beurrerie du Plateau", contact: "A. Diallo", phone: "+225 05 11 22 33", category: "Beurre & lait", paymentTerms: "15 jours" },
    { id: "F-04", name: "Emballages Pro", contact: "S. Ouattara", phone: "+225 01 99 88 77", category: "Sacs & emballages", paymentTerms: "Comptant" },
];

export const initialOrders: PurchaseOrder[] = [
    { id: "CMD-012", date: "05/10/2026", supplierId: "F-01", product: "Farine de blé", quantity: 500, unit: "kg", unitPrice: 650, status: "Reçue", by: "Awa Koné" },
    { id: "CMD-011", date: "04/10/2026", supplierId: "F-03", product: "Beurre", quantity: 25, unit: "kg", unitPrice: 4500, status: "Confirmée", by: "Jean-Claude" },
    { id: "CMD-010", date: "03/10/2026", supplierId: "F-02", product: "Levure", quantity: 10, unit: "kg", unitPrice: 3500, status: "Reçue", by: "Awa Koné" },
    { id: "CMD-009", date: "02/10/2026", supplierId: "F-01", product: "Farine de blé", quantity: 500, unit: "kg", unitPrice: 625, status: "Reçue", by: "Awa Koné" },
    { id: "CMD-008", date: "01/10/2026", supplierId: "F-04", product: "Sacs pain", quantity: 2000, unit: "pièce", unitPrice: 25, status: "Annulée", by: "Mariam Traoré" },
];

export function orderTotal(order: Pick<PurchaseOrder, "quantity" | "unitPrice">) {
    return order.quantity * order.unitPrice;
}

export function formatFCFA(value: number) {
    return `${Math.round(value).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function orderStatusStyles(status: OrderStatus) {
    switch (status) {
        case "Reçue": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
        case "Confirmée": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
        case "En attente": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        case "Annulée": return "bg-neutral-500/10 text-neutral-500";
    }
}

export function flourPriceTrend(orders: PurchaseOrder[]) {
    const flour = orders
        .filter((o) => o.product.toLowerCase().includes("farine") && o.status !== "Annulée")
        .sort((a, b) => a.date.localeCompare(b.date));
    if (flour.length < 2) return null;
    const first = flour[0].unitPrice;
    const last = flour[flour.length - 1].unitPrice;
    const diff = last - first;
    const pct = first > 0 ? Math.round((diff / first) * 100) : 0;
    return { first, last, diff, pct };
}
