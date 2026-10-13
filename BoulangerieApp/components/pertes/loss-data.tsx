export type LossReason = "Invendu" | "Brûlé" | "Pâte ratée" | "Don" | "Bradé" | "Autre";

export type LossRecord = {
    id: string;
    date: string;
    product: string;
    quantity: number;
    unitPrice: number;
    reason: LossReason;
    recordedBy: string;
    comment: string;
};

export const LOSS_REASONS: LossReason[] = ["Invendu", "Brûlé", "Pâte ratée", "Don", "Bradé", "Autre"];

export const PRODUCT_CATALOG: { name: string; unitPrice: number }[] = [
    { name: "Baguette classique", unitPrice: 150 },
    { name: "Pain de mie", unitPrice: 1000 },
    { name: "Brioche", unitPrice: 500 },
    { name: "Croissant", unitPrice: 300 },
    { name: "Pain au chocolat", unitPrice: 350 },
    { name: "Gâteau", unitPrice: 2500 },
];

export const initialLosses: LossRecord[] = [
    { id: "PT-003", date: "04/10/2026", product: "Baguette classique", quantity: 45, unitPrice: 150, reason: "Invendu", recordedBy: "Awa Koné", comment: "Fermeture 20h, pluie en soirée" },
    { id: "PT-002", date: "04/10/2026", product: "Croissant", quantity: 12, unitPrice: 300, reason: "Brûlé", recordedBy: "Jean-Claude", comment: "Four trop chaud, 2e fournée" },
    { id: "PT-001", date: "03/10/2026", product: "Baguette classique", quantity: 30, unitPrice: 150, reason: "Bradé", recordedBy: "Awa Koné", comment: "Vendus 100 F au lieu de 150 F" },
];

export function lossAmount(record: Pick<LossRecord, "quantity" | "unitPrice">) {
    return record.quantity * record.unitPrice;
}

export function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function reasonStyles(reason: LossReason) {
    switch (reason) {
        case "Invendu": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        case "Brûlé": return "bg-red-500/10 text-red-600 dark:text-red-400";
        case "Pâte ratée": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
        case "Don": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
        case "Bradé": return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
        default: return "bg-neutral-500/10 text-neutral-500";
    }
}
