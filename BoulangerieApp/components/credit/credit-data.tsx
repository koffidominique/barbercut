export type CreditStatus = "À jour" | "À relancer" | "En retard" | "Bloqué";

export type Payment = {
    id: string;
    date: string;
    amount: number;
    method: "Espèces" | "Mobile money" | "Carte";
};

export type CreditClient = {
    id: string;
    name: string;
    phone: string;
    creditLimit: number;
    balance: number;
    dueDate: string;
    daysOverdue: number;
    lastReminder: string | null;
    payments: Payment[];
};

export const initialClients: CreditClient[] = [
    {
        id: "CC-001",
        name: "M. Kouassi",
        phone: "+225 07 00 11 22",
        creditLimit: 50000,
        balance: 32500,
        dueDate: "07/10/2026",
        daysOverdue: 0,
        lastReminder: "03/10/2026",
        payments: [
            { id: "P-11", date: "28/09/2026", amount: 15000, method: "Espèces" },
            { id: "P-12", date: "01/10/2026", amount: 10000, method: "Mobile money" },
        ],
    },
    {
        id: "CC-002",
        name: "Restaurant Elodie",
        phone: "+225 05 44 55 66",
        creditLimit: 100000,
        balance: 48000,
        dueDate: "09/10/2026",
        daysOverdue: 0,
        lastReminder: null,
        payments: [
            { id: "P-21", date: "25/09/2026", amount: 30000, method: "Carte" },
        ],
    },
    {
        id: "CC-003",
        name: "M. Tano",
        phone: "+225 01 22 33 44",
        creditLimit: 25000,
        balance: 17500,
        dueDate: "06/10/2026",
        daysOverdue: 0,
        lastReminder: "04/10/2026",
        payments: [],
    },
    {
        id: "CC-004",
        name: "Maquis Le Baobab",
        phone: "+225 07 99 88 77",
        creditLimit: 60000,
        balance: 62000,
        dueDate: "28/09/2026",
        daysOverdue: 7,
        lastReminder: "02/10/2026",
        payments: [
            { id: "P-41", date: "20/09/2026", amount: 20000, method: "Espèces" },
        ],
    },
];

export function clientStatus(client: CreditClient): CreditStatus {
    if (client.balance >= client.creditLimit) return "Bloqué";
    if (client.daysOverdue > 0) return "En retard";
    if (client.balance > client.creditLimit * 0.7) return "À relancer";
    return "À jour";
}

export function statusStyles(status: CreditStatus) {
    switch (status) {
        case "À jour": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
        case "À relancer": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        case "En retard": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
        case "Bloqué": return "bg-red-500/10 text-red-600 dark:text-red-400";
    }
}

export function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function reminderMessage(client: CreditClient) {
    return `Bonjour ${client.name}, ceci est un rappel de la Boulangerie CI : votre solde restant est de ${formatFCFA(client.balance)}, à régler avant le ${client.dueDate}. Merci de votre fidélité !`;
}
