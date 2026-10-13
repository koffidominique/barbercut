export type ClosureRecord = {
    id: string;
    date: string;
    cashier: string;
    openingFund: number;
    cashSales: number;
    mobileSales: number;
    cardSales: number;
    expenses: number;
    expectedCash: number;
    countedCash: number;
    difference: number;
    status: "Équilibrée" | "Excédent" | "Manquant";
};

export const initialHistory: ClosureRecord[] = [];

export function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function statusStyles(status: ClosureRecord["status"]) {
    if (status === "Équilibrée") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (status === "Excédent") return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
    return "bg-red-500/10 text-red-600 dark:text-red-400";
}
