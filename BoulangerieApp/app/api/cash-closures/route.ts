import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/user";

type ClosureRow = {
  id: string;
  closure_date: string;
  cashier: string;
  opening_fund: number;
  cash_sales: number;
  mobile_sales: number;
  card_sales: number;
  expenses: number;
  counted_cash: number;
};

function toRecord(row: ClosureRow) {
  const expectedCash = row.opening_fund + row.cash_sales - row.expenses;
  const difference = row.counted_cash - expectedCash;
  return {
    id: row.id,
    date: new Date(`${row.closure_date}T00:00:00.000Z`).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    cashier: row.cashier,
    openingFund: row.opening_fund,
    cashSales: row.cash_sales,
    mobileSales: row.mobile_sales,
    cardSales: row.card_sales,
    expenses: row.expenses,
    expectedCash,
    countedCash: row.counted_cash,
    difference,
    status: (difference === 0 ? "Équilibrée" : difference > 0 ? "Excédent" : "Manquant") as
      | "Équilibrée"
      | "Excédent"
      | "Manquant",
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const sql = getNeonClient();
  if (!sql) return NextResponse.json({ error: "Base non configurée." }, { status: 503 });

  const rows = (await sql`
    select id, closure_date::text as closure_date, cashier, opening_fund, cash_sales, mobile_sales, card_sales, expenses, counted_cash
    from public.cash_closures
    where user_id = ${user.sub}
    order by closure_date desc, created_at desc
    limit 60
  `) as unknown as ClosureRow[];

  return NextResponse.json({ closures: rows.map(toRecord) });
}

function toInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (Number.isInteger(n)) return n;
  }
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const cashier = typeof body.cashier === "string" ? body.cashier.trim() : "";
  const openingFund = toInt(body.openingFund);
  const cashSales = toInt(body.cashSales);
  const mobileSales = toInt(body.mobileSales ?? 0) ?? 0;
  const cardSales = toInt(body.cardSales ?? 0) ?? 0;
  const expenses = toInt(body.expenses ?? 0) ?? 0;
  const countedCash = toInt(body.countedCash);

  if (
    cashier.length < 2 ||
    cashier.length > 160 ||
    openingFund === null || openingFund < 0 || openingFund > 100_000_000 ||
    cashSales === null || cashSales < 0 || cashSales > 100_000_000 ||
    mobileSales < 0 || mobileSales > 100_000_000 ||
    cardSales < 0 || cardSales > 100_000_000 ||
    expenses < 0 || expenses > 100_000_000 ||
    countedCash === null || countedCash < 0 || countedCash > 100_000_000
  ) {
    return NextResponse.json({ error: "Vérifiez les montants saisis." }, { status: 400 });
  }

  const sql = getNeonClient();
  if (!sql) return NextResponse.json({ error: "Base non configurée." }, { status: 503 });

  try {
    const inserted = (await sql`
      insert into public.cash_closures
        (user_id, cashier, opening_fund, cash_sales, mobile_sales, card_sales, expenses, counted_cash)
      values
        (${user.sub}, ${cashier}, ${openingFund}, ${cashSales}, ${mobileSales}, ${cardSales}, ${expenses}, ${countedCash})
      returning id, closure_date::text as closure_date, cashier, opening_fund, cash_sales, mobile_sales, card_sales, expenses, counted_cash
    `) as unknown as ClosureRow[];

    return NextResponse.json({ closure: toRecord(inserted[0]) }, { status: 201 });
  } catch (error) {
    console.error("Unable to save cash closure:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer la clôture." }, { status: 500 });
  }
}
