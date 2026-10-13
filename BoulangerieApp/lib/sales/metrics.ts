import { getNeonClient } from "@/lib/db/neon";

export type PeriodTotals = {
  caDay: number;
  caWeek: number;
  caMonth: number;
  linesDay: number;
  ticketsDay: number;
  ticketsMonth: number;
};

export type MonthItems = {
  linesMonth: number;
  unitsMonth: number;
  revenueMonth: number;
  profitMonth: number;
};

export type ProductPerf = {
  productId: string;
  name: string;
  qty: number;
  profit: number;
};

export type StockPerf = {
  productId: string;
  name: string;
  currentStock: number;
  minThreshold: number;
};

export type RawMaterial = {
  name: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
};

export type StaffPerformance = {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  role: "caissier" | "vendeur" | "livreur" | "boulanger";
};

export type BoutiquePerformance = {
  id: string;
  name: string;
  caDay: number;
  caMonth: number;
  ticketCount: number;
};

export type OrderStatus = {
  pending: number;
  toPrepare: number;
  toDeliver: number;
  inDelivery: number;
};

export type Financials = {
  returns: number;
  losses: number;
  waste: number;
  expenses: number;
  cashIn: number;
  receivables: number;
  payables: number;
  cashBalance: number;
};

export type StockHistory = {
  date: string;
  stock: number;
};

export type CAByTime = {
  hour: string;
  value: number;
}[];

export type CAByDay = {
  date: string;
  value: number;
}[];

export type CAByCategory = {
  category: string;
  value: number;
}[];

export type CAByProduct = {
  name: string;
  value: number;
}[];

export type SalesMetrics = {
  // Métriques de base existantes
  totals: PeriodTotals;
  items: MonthItems;
  basket: number;
  grossMargin: number;
  topSellers: ProductPerf[];
  topProfitable: ProductPerf[];
  unsoldCount: number;
  hasSales: boolean;

  // Nouvelles métriques ajoutées
  lowStockProducts: StockPerf[]; // Produits proches de la rupture
  criticalMaterials: RawMaterial[]; // Matières premières critiques
  productionToday: number; // Production du jour
  orders: OrderStatus; // État des commandes
  financials: Financials; // Finances : retours, pertes, dépenses...
  staffPerformance: StaffPerformance[]; // Performance vendeurs/livreurs
  boutiquePerformance: BoutiquePerformance[]; // Performance boutiques
  cashRegisters: { id: string; name: string; balance: number }[]; // État des caisses

  // Données pour graphiques
  caByHour: CAByTime; // CA par heure (jour)
  caByDay: CAByDay; // CA par jour (semaine/mois)
  caByCategory: CAByCategory; // CA par catégorie
  caByProduct: CAByProduct; // CA par produit
  stockEvolution: StockHistory[]; // Évolution des stocks
  marginEvolution: { date: string; value: number }[]; // Évolution des marges
  lossEvolution: { date: string; value: number }[]; // Évolution des pertes
  salesEvolution: { month: string; sales: number }[]; // Évolution des ventes
  caByChannel: { channel: string; value: number }[]; // CA par canal (boutique / livraison / click&collect)
};

type Numeric = number | string | null | undefined;

function toNumber(value: Numeric) {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Agrégats temps réel des ventes pour le dashboard :
 * - CA jour / semaine (lundi →) / mois courant
 * - Tickets et lignes de vente du jour
 * - Panier moyen, bénéfice estimé, marge brute du mois
 * - Produits les plus vendus / les plus rentables / invendus du mois
 */
export async function getSalesMetrics(userId: string): Promise<SalesMetrics> {
  const sql = getNeonClient();
  if (!sql) {
    return emptyMetrics();
  }

  const [totalsRows, itemsRows, perfRows, productRows] = await Promise.all([
    sql`
      select
        coalesce(sum(total) filter (where sale_date = current_date), 0)::int as ca_day,
        coalesce(sum(total) filter (where sale_date >= date_trunc('week', current_date)), 0)::int as ca_week,
        coalesce(sum(total) filter (where sale_date >= date_trunc('month', current_date)), 0)::int as ca_month,
        count(*) filter (where sale_date = current_date)::int as tickets_day,
        count(*) filter (where sale_date >= date_trunc('month', current_date))::int as tickets_month
      from public.sales
      where user_id = ${userId}
    `,
    sql`
      select
        count(*) filter (where s.sale_date = current_date)::int as lines_day,
        count(*)::int as lines_month,
        coalesce(sum(si.quantity), 0)::int as units_month,
        coalesce(sum(si.unit_price * si.quantity), 0)::int as revenue_month,
        coalesce(sum((si.unit_price - si.unit_cost) * si.quantity), 0)::int as profit_month
      from public.sale_items si
      join public.sales s on s.id = si.sale_id
      where s.user_id = ${userId}
        and s.sale_date >= date_trunc('month', current_date)
    `,
    sql`
      select
        p.id as product_id,
        p.name,
        coalesce(sum(si.quantity), 0)::int as qty,
        coalesce(sum((si.unit_price - si.unit_cost) * si.quantity), 0)::int as profit
      from public.sale_items si
      join public.sales s on s.id = si.sale_id
      join public.products p on p.id = si.product_id
      where s.user_id = ${userId}
        and s.sale_date >= date_trunc('month', current_date)
      group by p.id, p.name
    `,
    sql`
      select count(*)::int as total_products
      from public.products
      where user_id = ${userId} and active
    `,
  ]);

  const totals: TotalsRow = (totalsRows as unknown as TotalsRow[])[0] ?? {};
  const items: ItemsRow = (itemsRows as unknown as ItemsRow[])[0] ?? {};
  const perf = (perfRows as unknown as ProductPerfRaw[]).map((row) => ({
    productId: row.product_id,
    name: row.name,
    qty: row.qty,
    profit: row.profit,
  }));
  const totalProducts = toNumber(
    (productRows as unknown as ProductsRow[])[0]?.total_products,
  );

  const monthItems: MonthItems = {
    linesMonth: toNumber(items.lines_month),
    unitsMonth: toNumber(items.units_month),
    revenueMonth: toNumber(items.revenue_month),
    profitMonth: toNumber(items.profit_month),
  };

  const periodTotals: PeriodTotals = {
    caDay: toNumber(totals.ca_day),
    caWeek: toNumber(totals.ca_week),
    caMonth: toNumber(totals.ca_month),
    linesDay: toNumber(items.lines_day),
    ticketsDay: toNumber(totals.tickets_day),
    ticketsMonth: toNumber(totals.tickets_month),
  };

  const soldProductIds = new Set(perf.map((p) => p.productId));
  const unsoldCount = totalProducts - soldProductIds.size;

  const byQty = [...perf].sort((a, b) => b.qty - a.qty);
  const byProfit = [...perf].sort((a, b) => b.profit - a.profit);

  return {
    ...emptyMetrics(),
    totals: periodTotals,
    items: monthItems,
    basket:
      periodTotals.ticketsDay > 0
        ? Math.round(periodTotals.caDay / periodTotals.ticketsDay)
        : 0,
    grossMargin:
      monthItems.revenueMonth > 0
        ? Math.round((monthItems.profitMonth / monthItems.revenueMonth) * 100)
        : 0,
    topSellers: byQty.slice(0, 3),
    topProfitable: byProfit.slice(0, 3),
    unsoldCount: Math.max(0, unsoldCount),
    hasSales: periodTotals.ticketsMonth > 0,
  };
}

type ProductPerfRaw = {
  product_id: string;
  name: string;
  qty: number;
  profit: number;
};

type TotalsRow = {
  ca_day?: number;
  ca_week?: number;
  ca_month?: number;
  tickets_day?: number;
  tickets_month?: number;
};

type ItemsRow = {
  lines_day?: number;
  lines_month?: number;
  units_month?: number;
  revenue_month?: number;
  profit_month?: number;
};

type ProductsRow = {
  total_products?: number;
};

function emptyMetrics(): SalesMetrics {
  return {
    // Métriques de base
    totals: {
      caDay: 0,
      caWeek: 0,
      caMonth: 0,
      linesDay: 0,
      ticketsDay: 0,
      ticketsMonth: 0,
    },
    items: { linesMonth: 0, unitsMonth: 0, revenueMonth: 0, profitMonth: 0 },
    basket: 0,
    grossMargin: 0,
    topSellers: [],
    topProfitable: [],
    unsoldCount: 0,
    hasSales: false,

    // Nouvelles métriques (valeurs par défaut)
    lowStockProducts: [],
    criticalMaterials: [],
    productionToday: 0,
    orders: { pending: 0, toPrepare: 0, toDeliver: 0, inDelivery: 0 },
    financials: {
      returns: 0,
      losses: 0,
      waste: 0,
      expenses: 0,
      cashIn: 0,
      receivables: 0,
      payables: 0,
      cashBalance: 0,
    },
    staffPerformance: [],
    boutiquePerformance: [],
    cashRegisters: [],

    // Données graphiques
    caByHour: [],
    caByDay: [],
    caByCategory: [],
    caByProduct: [],
    stockEvolution: [],
    marginEvolution: [],
    lossEvolution: [],
    salesEvolution: [],
    caByChannel: [],
  };
}
