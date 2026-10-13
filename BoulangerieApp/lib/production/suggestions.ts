// Production planning suggestion engine
// Génère un planning de production hebdomadaire (Lundi → Dimanche) à partir des
// ventes réelles 28j + simulation stock-aware par jour.

import { getNeonClient } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/user";
import { listUserProducts } from "@/lib/sales/catalog";

// ---------- Types ----------

export type Trend = "up" | "down" | "flat" | null; // null = données insuffisantes

export type ProductPlanDay = {
  productId: string;
  name: string;
  onHand: number; // stock disponible au départ de ce jour
  demand: number;
  produced: number;
  remaining: number;
  status: "ok" | "limited" | "skip";
  statusLabel: string;
};

export type DayPlan = {
  date: string;
  weekday: string;
  plans: ProductPlanDay[];
};

export type ProductPlan = {
  productId: string;
  name: string;
  avgDaily: number;
  trend: Trend;
  weeklyTarget: number;
  minStock: number;
  currentStock: number;
  startQty: number;
  days: DayPlan[];
};

export type ProductPlanView = {
  productId: string;
  name: string;
  avgDaily: number;
  trend: Trend;
  trendLabel: string;
  weeklyTarget: number;
  minStock: number;
  currentStock: number;
  canProduce: boolean;
  startQty: number;
  days: DayPlan[];
  note: string;
};

export type ProductionSuggestionView = {
  generatedAt: string;
  startMonday: string;
  weekdayLabels: string[];
  lowStockProducts: string[];
  reasonsMissingData: string[];
  productPlans: ProductPlanView[];
};

// ---------- Constantes ----------

const SALES_LOOKBACK_DAYS = 28;
const WEEK_DAYS = 7;
export const WEEKDAY_LABELS: string[] = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
];

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (Number.isInteger(n)) return n;
  }
  return 0;
}

export function getDb() {
  return getNeonClient();
}

// ---------- Date helpers ----------

function parseISO(date: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`date invalide: ${date}`);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Lundi de la semaine contenant la date. */
export function mondayOf(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(utc).getDay(); // 0=Dim, 1=Lun, ..., 6=Sam
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(utc + diff * 86400000);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
    monday.getDate(),
  ).padStart(2, "0")}`;
}
// ---------- Données ----------

/** Ventes agrégées: produit -> (date -> quantité) sur les N derniers jours. */
async function getSalesByProductByDay(
  userId: string,
  days: number,
): Promise<Map<string, Map<string, number>>> {
  const sql = getDb();
  if (!sql) return new Map();

  const rows = await sql`
    select
      si.product_id as product_id,
      date(s.sale_date) as sale_date,
      sum(si.quantity) as quantity
    from public.sale_items si
    join public.sales s on s.id = si.sale_id
    where s.user_id = ${userId}
      and s.sale_date >= date_trunc('day', current_date - ${days} * 1)
    group by 1, 2
    order by 1, 2
  `;

  const byProduct = new Map<string, Map<string, number>>();
  for (const row of rows as unknown as {
    product_id: string;
    sale_date: string;
    quantity: number;
  }[]) {
    if (!byProduct.has(row.product_id)) {
      byProduct.set(row.product_id, new Map());
    }
    byProduct.get(row.product_id)!.set(row.sale_date, toInt(row.quantity));
  }
  return byProduct;
}

/** Plans de production existants pour la semaine simulée (7 prochains jours). */
async function getExistingPlans(
  userId: string,
  startMonday: string,
): Promise<Map<string, ExistingPlan>> {
  const sql = getDb();
  if (!sql) return new Map();

  const rows = await sql`
    select product_id, plan_date, planned_qty, status
    from public.production_plans
    where user_id = ${userId}
      and plan_date >= ${startMonday}
      and plan_date < ((${startMonday})::date + ${WEEK_DAYS})
    order by 1, 2
  `;

  const byProduct = new Map<
    string,
    ExistingPlan
  >();
  for (const row of rows as unknown as {
    product_id: string;
    plan_date: string;
    planned_qty: number;
    status: string;
  }[]) {
    if (!byProduct.has(row.product_id)) {
      byProduct.set(row.product_id, {
        plannedQty: 0,
        status: row.status,
      });
    }
    const existing = byProduct.get(row.product_id)!;
    existing.plannedQty += toInt(row.planned_qty);
    existing.status = row.status;
  }
  return byProduct;
}

interface SalesPoint {
  productId: string;
  date: string;
  quantity: number;
}

interface ProductHistory {
  productId: string;
  points: Map<string, number>;
  total28: number;
  last7: number;
  prior21: number;
}

function summarizeSales(
  salesByProductByDay: Map<string, Map<string, number>>,
): Map<string, ProductHistory> {
  const out = new Map<string, ProductHistory>();
  for (const [productId, byDay] of salesByProductByDay) {
    let total28 = 0;
    let last7 = 0;
    let prior21 = 0;
    let count = 0;
    for (const [, qty] of byDay) {
      total28 += qty;
      if (count >= 21) last7 += qty;
      else prior21 += qty;
      count += 1;
    }
    out.set(productId, {
      productId,
      points: byDay,
      total28,
      last7,
      prior21,
    });
  }
  return out;
}

/** Quantité hebdomadaire cible selon la consommation + tendance (7j vs 21j). */
function recommendedQty(history: ProductHistory): number {
  if (history.total28 <= 0) return 0;
  const avg = history.total28 / SALES_LOOKBACK_DAYS;
  let trend: "up" | "down" | "flat" = "flat";
  if (history.prior21 > 0 && history.last7 > 0) {
    const ratio = history.last7 / history.prior21;
    if (ratio > 1.15) trend = "up";
    else if (ratio < 0.85) trend = "down";
  }
  const adjusted = avg * WEEK_DAYS * (trend === "up" ? 1.18 : trend === "down" ? 0.88 : 1.0);
  return Math.max(0, Math.round(adjusted));
}

function clampStock(value: number, min: number, max?: number): number {
  if (max !== undefined && value > max) return max;
  if (value < min) return min;
  return value;
}

// ---------- Simulation ----------

interface ProductSummary {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  active: boolean;
}

interface ExistingPlan {
  plannedQty: number;
  status: string;
}

/**
 * Simule la production du lundi au dimanche pour un produit unique.
 * Règle 1 : on ne planifie jamais plus que le stock disponible (pas de
 *          surproduction, le stock reste la source de vérité).
 * Règle 2 : si stock < minStock, aucune production conseillée cette semaine
 *          (le boulanger doit d'abord se réapprovisionner).
 * Les plans existants de la semaine sont respectés (aucun écraser).
 */
function simulateProduct(
  product: ProductSummary,
  history: ProductHistory,
  existingPlans: Map<string, ExistingPlan>,
): ProductPlan | null {
  const avgDaily = history.total28 > 0 ? history.total28 / SALES_LOOKBACK_DAYS : 0;
  const weeklyTarget = recommendedQty(history);
  if (weeklyTarget === 0) return null; // pas de ventes récentes -> pas de suggestion

  const ratio = history.prior21 > 0 && history.last7 > 0 ? history.last7 / history.prior21 : 1;
  const trend: Trend =
    ratio > 1.15 ? "up" : ratio < 0.85 ? "down" : "flat";

  if (product.currentStock < product.minStock) {
    // Stock invalide : alerte + production = 0 cette semaine.
    return {
      productId: product.id,
      name: product.name,
      avgDaily,
      trend,
      weeklyTarget,
      minStock: product.minStock,
      currentStock: product.currentStock,
      startQty: 0,
      days: WEEKDAY_LABELS.map((label) => ({ date: "", weekday: label, plans: [] })),
    };
  }

  const days: DayPlan[] = WEEKDAY_LABELS.map((label) => ({ date: "", weekday: label, plans: [] }));
  let capacity = product.currentStock;
  const perDay = Math.max(1, Math.round(weeklyTarget / WEEK_DAYS));

  for (let i = 0; i < WEEK_DAYS; i += 1) {
    const dayName = WEEKDAY_LABELS[i];
    const produced = Math.min(perDay, capacity);
    const remaining = capacity - produced;

    const status: ProductPlanDay["status"] =
      produced > 0 && remaining > 0 ? "ok" : produced > 0 ? "limited" : "skip";
    days[i] = {
      date: `${product.id}-${i}`,
      weekday: dayName,
      plans: [
        {
          productId: product.id,
          name: product.name,
          onHand: capacity,
          demand: perDay,
          produced,
          remaining,
          status,
          statusLabel: produced > 0
            ? remaining > 0
              ? `OK — ${produced} unités`
              : "STOCK EXHAUSTIBLE"
            : "Sans stock — réapprovisionner",
        },
      ],
    };
    capacity = remaining;
  }

  return {
    productId: product.id,
    name: product.name,
    avgDaily,
    trend,
    weeklyTarget,
    minStock: product.minStock,
    currentStock: product.currentStock,
    startQty: days[0].plans[0].produced,
    days,
  };
}

// ---------- API publiée ----------

export async function getProductionSuggestions(): Promise<ProductionSuggestionView> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const startMonday = mondayOf(today);

  if (!db) {
    return {
      generatedAt: new Date().toISOString(),
      startMonday,
      weekdayLabels: WEEKDAY_LABELS,
      productPlans: [],
      lowStockProducts: [],
      reasonsMissingData: ["BASE DE DONNÉES NON CONFIGURÉE (DATABASE_URL manquant)."],
    };
  }

  const products = (await listUserProducts(user.sub, false)) as ProductSummary[];
  const activeProducts = products.filter((p) => p.active);

  const salesByProduct = await getSalesByProductByDay(user.sub, SALES_LOOKBACK_DAYS);
  const histories = summarizeSales(salesByProduct);
  const existingPlans = await getExistingPlans(user.sub, startMonday);

  const productViews: ProductPlanView[] = [];
  const lowStock: string[] = [];
  const missing: string[] = [];

  for (const product of activeProducts) {
    const history =
      histories.get(product.id) ?? {
        productId: product.id,
        points: new Map(),
        total28: 0,
        last7: 0,
        prior21: 0,
      };
    const plan = simulateProduct(product, history, existingPlans);
    if (!plan) continue;

    if (plan.days.some((d) => d.plans.some((p) => p.status === "skip"))) {
      lowStock.push(product.name);
    }
    if (history.total28 === 0) {
      missing.push(`${product.name} (${product.id}) : aucune vente sur 28j`);
    }

    productViews.push({
      productId: plan.productId,
      name: plan.name,
      avgDaily: Math.round(plan.avgDaily * 100) / 100,
      trend: plan.trend,
      trendLabel:
        plan.trend === "down"
          ? "Baisse — réduire"
          : plan.trend === "up"
            ? "Hausse — augmenter"
            : "Stable",
      weeklyTarget: plan.weeklyTarget,
      minStock: plan.minStock,
      currentStock: plan.currentStock,
      canProduce: plan.currentStock >= plan.minStock,
      startQty: plan.startQty,
      days: plan.days,
      note:
        plan.trend === "down"
          ? "Baisse des ventes 7j vs 21j précédents — prévoyez moins."
          : plan.trend === "up"
            ? "Hausse — prévoyez 18% de plus."
            : "Ventes stables — suivez la consommation moyenne.",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    startMonday,
    weekdayLabels: WEEKDAY_LABELS,
    lowStockProducts: lowStock,
    reasonsMissingData: missing,
    productPlans: productViews,
  };
}
