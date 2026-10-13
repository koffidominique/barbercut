// API: GET /api/production-plans
//   - renvoie les plans de production de la semaine courante (Lundi → Dimanche)
//     enrichis des suggestions du moteur et du stock réel du produit.
//
// API: POST /api/production-plans
//   - upserte les plans de la semaine à partir du payload fourni.
//   - payload : { weekStart: string, entries: Array<{ product_id, plan_date, planned_qty, suggested_qty?, status?, notes? }> }
import { getNeonClient } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/user";
import { getProductionSuggestions } from "@/lib/production/suggestions";
import { listUserProducts } from "@/lib/sales/catalog";

type PlanEntry = {
  product_id: string;
  plan_date: string;
  planned_qty: number;
  suggested_qty?: number;
  status?: "planned" | "done" | "skipped";
  notes?: string;
};

type PlanView = {
  id: string;
  product_id: string;
  plan_date: string;
  planned_qty: number;
  suggested_qty: number | null;
  status: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    current_stock: number;
    min_stock: number;
    category: string | null;
  } | null;
  suggestion: {
    weekly_target: number;
    trend: string | null;
    start_qty: number;
  } | null;
  can_produce: boolean;
};

const WEEKDAY_LABELS = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
];

function parseIso(date: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`date invalide: ${date}`);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (Number.isInteger(n)) return n;
  }
  return 0;
}

function sanitizeEntry(entry: PlanEntry): PlanEntry {
  return {
    product_id: entry.product_id,
    plan_date: entry.plan_date,
    planned_qty: Math.max(1, toInt(entry.planned_qty)),
    suggested_qty: entry.suggested_qty === undefined ? null : Math.max(0, toInt(entry.suggested_qty)),
    status: entry.status ?? "planned",
    notes: entry.notes?.slice(0, 500) ?? null,
  };
}

function mondayOf(date: string | Date): string {
  const d = typeof date === "string" ? parseIso(date) : date;
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(utc).getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(utc + diff * 86400000);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
    monday.getDate(),
  ).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    const db = getNeonClient();
    if (!db) {
      return NextResponse.json(
        { error: "Base de données non configurée (DATABASE_URL manquant)." },
        { status: 500 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const weekStart = mondayOf(today);

    const rows = await db`select
      id, product_id, plan_date, planned_qty, suggested_qty, status, notes, completed_at, created_at, updated_at
    from public.production_plans
    where user_id = ${user.sub}
      and plan_date >= ${weekStart}
      and plan_date < ((${weekStart})::date + 7)
    order by product_id, plan_date`;

    const plans = (rows as unknown as PlanView[]) ?? [];

    const suggestions = await getProductionSuggestions();
    const productById = new Map<string, PlanView["product"]>();
    const products = await listUserProducts(user.sub, false);
    for (const p of products) {
      productById.set(p.id, {
        id: p.id,
        name: p.name,
        current_stock: p.currentStock,
        min_stock: p.minStock,
        category: p.category ?? null,
      });
    }
    const suggestionByProduct = new Map<string, PlanView["suggestion"]>();
    for (const sp of suggestions.productPlans) {
      suggestionByProduct.set(sp.productId, {
        weekly_target: sp.weeklyTarget,
        trend: sp.trend === "up" ? "up" : sp.trend === "down" ? "down" : "stable",
        start_qty: sp.startQty,
      });
    }

    return NextResponse.json({
      weekStart,
      weekdayLabels: WEEKDAY_LABELS,
      plans: plans.map((p) => ({
        ...p,
        product: productById.get(p.product_id) ?? null,
        suggestion: suggestionByProduct.get(p.product_id) ?? null,
        can_produce: p.product?.current_stock >= (p.product?.min_stock ?? 0),
      })),
    });
  } catch (error) {
    console.error("[production-plans] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 },
    );
  }

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    const db = getNeonClient();
    if (!db) {
      return NextResponse.json({ error: "Base de données non configurée (DATABASE_URL manquant)." }, { status: 500 });
    }

    const body = await request.json();
    const weekStart = typeof body.weekStart === "string" ? body.weekStart : mondayOf(new Date().toISOString().slice(0, 10));
    const entries = (body.entries ?? []) as PlanEntry[];
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Aucun plan à créer." }, { status: 400 });
    }

    const products = await listUserProducts(user.sub, false);
    const allowed = new Set(products.map((p) => p.id));
    const seen = new Set<string>();

    for (const entry of entries) {
      const safe = sanitizeEntry(entry);
      if (!allowed.has(safe.product_id)) {
        return NextResponse.json({ error: "Produit inconnu ou non autorisé : " + safe.product_id }, { status: 400 });
      }
      const weekEnd = new Date(parseIso(weekStart).getTime() + 7 * 86400000).toISOString().slice(0, 10);
      if (safe.plan_date < weekStart || safe.plan_date >= weekEnd) {
        return NextResponse.json({ error: "plan_date en dehors de la semaine : " + safe.plan_date }, { status: 400 });
      }
      const key = safe.product_id + "|" + safe.plan_date;
      if (seen.has(key)) {
        return NextResponse.json({ error: "Doublon : " + key }, { status: 400 });
      }
      seen.add(key);
    }

    for (const entry of entries) {
      const safe = sanitizeEntry(entry);
      await db`insert into public.production_plans (user_id, product_id, plan_date, planned_qty, suggested_qty, status, notes) values (${user.sub}, ${safe.product_id}, ${safe.plan_date}, ${safe.planned_qty}, ${safe.suggested_qty}, ${safe.status}, ${safe.notes}) on conflict (user_id, product_id, plan_date) do update set planned_qty = excluded.planned_qty, suggested_qty = excluded.suggested_qty, status = excluded.status, notes = excluded.notes, updated_at = now()`;
    }

    return NextResponse.json({ ok: true, created: entries.length });
  } catch (error) {
    console.error("[production-plans] POST failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur interne" }, { status: 500 });
  }
}

function mondayOf(date: string | Date): string {
  const d = typeof date === "string" ? parseIso(date) : date;
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(utc).getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(utc + diff * 86400000);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

}
