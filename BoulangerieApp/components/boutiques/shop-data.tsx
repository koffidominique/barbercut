export type Boutique = {
    id: string;
    name: string;
    address: string;
    manager: string;
    dailySales: number;
    staff: number;
};

export type AttendanceStatus = "Présent" | "Absent" | "Retard" | "Congé";

export type Employee = {
    id: string;
    name: string;
    role: string;
    boutiqueId: string;
    salary: number;
    advances: number;
    status: AttendanceStatus;
    checkIn: string | null;
};

export type StockTransfer = {
    id: string;
    date: string;
    product: string;
    quantity: number;
    fromId: string;
    toId: string;
    by: string;
};

export const initialBoutiques: Boutique[] = [
    { id: "B-01", name: "Plateau Centre", address: "Av. Noguès, Abidjan", manager: "Awa Koné", dailySales: 485000, staff: 6 },
    { id: "B-02", name: "Cocody Riviera", address: "Rue des Jardins, Abidjan", manager: "Jean-Claude", dailySales: 362000, staff: 4 },
    { id: "B-03", name: "Yopougon Selmer", address: "Rue Principale, Yopougon", manager: "Mariam Traoré", dailySales: 298000, staff: 5 },
];

export const initialEmployees: Employee[] = [
    { id: "E-01", name: "Awa Koné", role: "Gérante", boutiqueId: "B-01", salary: 250000, advances: 30000, status: "Présent", checkIn: "06:45" },
    { id: "E-02", name: "Jean-Claude", role: "Boulanger", boutiqueId: "B-01", salary: 200000, advances: 0, status: "Présent", checkIn: "05:30" },
    { id: "E-03", name: "Mariam Traoré", role: "Caissière", boutiqueId: "B-02", salary: 150000, advances: 20000, status: "Retard", checkIn: "08:15" },
    { id: "E-04", name: "Ibrahim Sylla", role: "Boulanger", boutiqueId: "B-02", salary: 190000, advances: 50000, status: "Présent", checkIn: "05:45" },
    { id: "E-05", name: "Fatou Diallo", role: "Vendeuse", boutiqueId: "B-03", salary: 130000, advances: 0, status: "Absent", checkIn: null },
    { id: "E-06", name: "Koffi Mensah", role: "Livreur", boutiqueId: "B-03", salary: 140000, advances: 15000, status: "Congé", checkIn: null },
];

export const initialTransfers: StockTransfer[] = [
    { id: "T-03", date: "05/10/2026", product: "Baguette classique", quantity: 100, fromId: "B-01", toId: "B-03", by: "Awa Koné" },
    { id: "T-02", date: "04/10/2026", product: "Farine de blé (kg)", quantity: 50, fromId: "B-01", toId: "B-02", by: "Jean-Claude" },
    { id: "T-01", date: "03/10/2026", product: "Brioche", quantity: 40, fromId: "B-02", toId: "B-03", by: "Mariam Traoré" },
];

export function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function attendanceStyles(status: AttendanceStatus) {
    switch (status) {
        case "Présent": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
        case "Retard": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        case "Absent": return "bg-red-500/10 text-red-600 dark:text-red-400";
        case "Congé": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
    }
}
