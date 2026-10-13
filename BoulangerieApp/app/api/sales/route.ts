import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/user";
import { listUserProducts } from "@/lib/sales/catalog";

type SaleRow = {
  id: string;
  sale_date: string;
  payment_method: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[] | null;
};

const PAYMENT_METHODS = ["cash", "mobile", "card"] as const;

function toSaleRecord(row: SaleRow) {
  return {
    id: row.id,
    date: new Date(`${row.sale_date}T00:00:00.000Z`).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    paymentMethod: row.payment_method,
    total: row.total,
    items: row.items ?? [],
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const sql = getNeonClient();
  if (!sql) return NextResponse.json({ error: "Base non configurée." }, { status: 503 });

  const rows = (await sql`
    select
      s.id,
      s.sale_date::text as sale_date,
      s.payment_method,
      s.total,
      coalesce(
        json_agg(
          json_build_object('name', p.name, 'quantity', si.quantity, 'unitPrice', si.unit_price)
          order by p.name
        ) filter (where si.id is not null),
        '[]'::json
      ) as items
    from public.sales s
    left join public.sale_items si on si.sale_id = s.id
    left join public.products p on p.id = si.product_id
    where s.user_id = ${user.sub}
    group by s.id
    order by s.created_at desc
    limit 50
  `) as unknown as SaleRow[];

  return NextResponse.json({ sales: rows.map(toSaleRecord) });
}

function toInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (Number.isInteger(n)) return n;
  }
  return null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "";
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
    return NextResponse.json({ error: "Mode de paiement invalide." }, { status: 400 });
  }

  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) {
    return NextResponse.json({ error: "Ajoutez au moins un produit au ticket." }, { status: 400 });
  }

  type Item = { productId: string; quantity: number };
  const items: Item[] = [];
  for (const entry of rawItems) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return NextResponse.json({ error: "Ligne de vente invalide." }, { status: 400 });
    }
    const { productId, quantity } = entry as { productId?: unknown; quantity?: unknown };
    const qty = toInt(quantity);
    if (typeof productId !== "string" || !UUID_RE.test(productId) || qty === null || qty < 1 || qty > 10_000) {
      return NextResponse.json({ error: "Quantité ou produit invalide." }, { status: 400 });
    }
    items.push({ productId, quantity: qty });
  }

  const sql = getNeonClient();
  if (!sql) return NextResponse.json({ error: "Base non configurée." }, { status: 503 });

  try {
    const products = await listUserProducts(user.sub);
    const byId = new Map(products.map((p) => [p.id, p]));

    type ResolvedItem = { productId: string; quantity: number; unitPrice: number; unitCost: number };
    const resolved: ResolvedItem[] = [];
    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Un produit du ticket n’existe plus." }, { status: 400 });
      }
      resolved.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        unitCost: product.unitCost,
      });
    }

    const total = resolved.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (total > 100_000_000) {
      return NextResponse.json({ error: "Montant du ticket trop élevé." }, { status: 400 });
    }

    // Insertion atomique du ticket + de ses lignes en une seule requête SQL
    // (le driver HTTP Neon n'autorise pas plusieurs instructions par requête).
    const itemsJson = JSON.stringify(resolved);
    const inserted = (await sql`
      with new_sale as (
        insert into public.sales (user_id, payment_method, total)
        values (${user.sub}, ${paymentMethod}, ${total})
        returning id, sale_date::text as sale_date, payment_method, total
      ),
      inserted_items as (
        insert into public.sale_items (sale_id, product_id, quantity, unit_price, unit_cost)
        select ns.id, x.product_id, x.quantity, x.unit_price, x.unit_cost
        from new_sale ns
        cross join json_to_recordset(${itemsJson}::jsonb)
          as x(product_id uuid, quantity integer, unit_price integer, unit_cost integer)
        returning sale_id
      )
      select id, sale_date, payment_method, total from new_sale
    `) as unknown as { id: string; sale_date: string; payment_method: string; total: number }[];

    const sale = inserted[0];
    if (!sale) {
      console.error("Sale insert returned no row", { userId: user.sub });
      return NextResponse.json({ error: "Impossible d’enregistrer la vente." }, { status: 500 });
    }

    const nameById = new Map(resolved.map((r) => [r.productId, byId.get(r.productId)?.name ?? ""]));

    return NextResponse.json(
      {
        sale: {
          ...toSaleRecord({
            id: sale.id,
            sale_date: sale.sale_date,
            payment_method: sale.payment_method,
            total: sale.total,
            items: null,
          }),
          items: resolved.map((r) => ({
            name: nameById.get(r.productId) ?? "",
            quantity: r.quantity,
            unitPrice: r.unitPrice,
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to save sale:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer la vente." }, { status: 500 });
  }
}

