import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/user";
import {
  ensureUserProducts,
  listUserProducts,
  type ProductRecord,
  type ProductVariant,
} from "@/lib/sales/catalog";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (Number.isInteger(n)) return n;
  }
  return null;
}

function toFloat(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, ""));
    if (!isNaN(n)) return n;
  }
  return null;
}

/** Convertit une ligne brute de product_variants (snake_case) vers ProductVariant */
function toProductVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    userId: row.user_id as string,
    name: row.name as string,
    variantType: (row.variant_type ?? "size") as ProductVariant["variantType"],
    sku: (row.sku as string | null | undefined) ?? undefined,
    barcode: (row.barcode as string | null | undefined) ?? undefined,
    priceAdjustment: Number(row.price_adjustment ?? 0),
    weightAdjustmentKg: Number(row.weight_adjustment_kg ?? 0),
    stockAdjustment: Number(row.stock_adjustment ?? 0),
    active: Boolean(row.active),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    await ensureUserProducts(user.sub);
    const products = await listUserProducts(user.sub);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Unable to load products:", error);
    return NextResponse.json(
      { error: "Impossible de charger les produits." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("bad");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Validation des champs obligatoires
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 160) {
    return NextResponse.json(
      { error: "Le nom du produit doit faire entre 1 et 160 caractères." },
      { status: 400 },
    );
  }

  const salePrice = toInt(body.salePrice);
  if (salePrice === null || salePrice < 0) {
    return NextResponse.json(
      { error: "Le prix de vente est invalide." },
      { status: 400 },
    );
  }

  // Validation des champs optionnels avec conversion
  const unitCost = toInt(body.unitCost) ?? 0;
  const promotionalPrice = body.promotionalPrice
    ? toInt(body.promotionalPrice)
    : null;
  const purchasePrice = body.purchasePrice ? toInt(body.purchasePrice) : null;
  const productionCost = body.productionCost
    ? toInt(body.productionCost)
    : null;
  const marginPercent = body.marginPercent ? toFloat(body.marginPercent) : null;
  const tvaRate = body.tvaRate ? toFloat(body.tvaRate) : 20.0;
  const weightKg = body.weightKg ? toFloat(body.weightKg) : null;
  const minStock = toInt(body.minStock) ?? 0;
  const currentStock = toInt(body.currentStock) ?? 0;
  const sku = typeof body.sku === "string" ? body.sku.trim() : null;
  const barcode = typeof body.barcode === "string" ? body.barcode.trim() : null;
  const category = typeof body.category === "string" ? body.category : null;
  const subcategory =
    typeof body.subcategory === "string" ? body.subcategory : null;
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
  const description =
    typeof body.description === "string" ? body.description : null;
  const unitOfMeasure =
    typeof body.unitOfMeasure === "string" ? body.unitOfMeasure : "unit";
  const dimensions =
    typeof body.dimensions === "string" ? body.dimensions : null;
  const maxStock = body.maxStock ? toInt(body.maxStock) : null;
  const primarySupplierId =
    typeof body.primarySupplierId === "string" ? body.primarySupplierId : null;

  const sql = getNeonClient();
  if (!sql)
    return NextResponse.json(
      { error: "Base non configurée." },
      { status: 503 },
    );

  try {
    // Vérification unicité SKU et barcode si fournis
    if (sku) {
      const existingSku = await sql`
        select id from public.products where user_id = ${user.sub} and sku = ${sku}
      `;
      if (existingSku.length > 0) {
        return NextResponse.json(
          { error: "Un produit avec cette référence SKU existe déjà." },
          { status: 409 },
        );
      }
    }

    if (barcode) {
      const existingBarcode = await sql`
        select id from public.products where user_id = ${user.sub} and barcode = ${barcode}
      `;
      if (existingBarcode.length > 0) {
        return NextResponse.json(
          { error: "Un produit avec ce code-barres existe déjà." },
          { status: 409 },
        );
      }
    }

    // Insertion du produit avec tous les champs
    const [inserted] = await sql`
      insert into public.products (
        user_id, name, sale_price, unit_cost, sku, barcode, category, subcategory,
        image_url, description, promotional_price, purchase_price, production_cost,
        margin_percent, tva_rate, unit_of_measure, weight_kg, dimensions, min_stock,
        max_stock, current_stock, primary_supplier_id
      )
      values (
        ${user.sub}, ${name}, ${salePrice}, ${unitCost}, ${sku}, ${barcode}, ${category}, ${subcategory},
        ${imageUrl}, ${description}, ${promotionalPrice}, ${purchasePrice}, ${productionCost},
        ${marginPercent}, ${tvaRate}, ${unitOfMeasure}, ${weightKg}, ${dimensions}, ${minStock},
        ${maxStock}, ${currentStock}, ${primarySupplierId}
      )
      returning *
    `;

    // Insertion des variantes si fournies
    const variants: ProductVariant[] = [];
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      for (const variant of body.variants) {
        if (typeof variant === "object" && variant.name) {
          const variantName = String(variant.name).trim();
          const variantType = String(variant.variantType || "size");
          const variantSku = variant.sku ? String(variant.sku).trim() : null;
          const variantBarcode = variant.barcode
            ? String(variant.barcode).trim()
            : null;
          const priceAdjustment = toInt(variant.priceAdjustment) ?? 0;
          const weightAdjustmentKg = toFloat(variant.weightAdjustmentKg) ?? 0;
          const stockAdjustment = toInt(variant.stockAdjustment) ?? 0;

          const [insertedVariant] = await sql`
            insert into public.product_variants (
              product_id, user_id, name, variant_type, sku, barcode,
              price_adjustment, weight_adjustment_kg, stock_adjustment
            )
            values (
              ${inserted.id}, ${user.sub}, ${variantName}, ${variantType}, ${variantSku}, ${variantBarcode},
              ${priceAdjustment}, ${weightAdjustmentKg}, ${stockAdjustment}
            )
            returning *
          `;
          variants.push(toProductVariant(insertedVariant));
        }
      }
    }

    // Mapping du produit inséré vers le type ProductRecord
    const product: ProductRecord = {
      id: inserted.id,
      userId: inserted.user_id,
      name: inserted.name,
      sku: inserted.sku,
      barcode: inserted.barcode,
      category: inserted.category,
      subcategory: inserted.subcategory,
      imageUrl: inserted.image_url,
      description: inserted.description,
      salePrice: inserted.sale_price,
      promotionalPrice: inserted.promotional_price,
      unitCost: inserted.unit_cost,
      purchasePrice: inserted.purchase_price,
      productionCost: inserted.production_cost,
      marginPercent: inserted.margin_percent,
      tvaRate: inserted.tva_rate,
      unitOfMeasure: inserted.unit_of_measure,
      weightKg: inserted.weight_kg,
      dimensions: inserted.dimensions,
      minStock: inserted.min_stock,
      maxStock: inserted.max_stock,
      currentStock: inserted.current_stock,
      primarySupplierId: inserted.primary_supplier_id,
      active: inserted.active,
      variants,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Impossible de créer le produit." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sql = getNeonClient();
  if (!sql)
    return NextResponse.json(
      { error: "Base non configurée." },
      { status: 503 },
    );

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID du produit requis et valide." },
        { status: 400 },
      );
    }

    // Vérifier que le produit appartient bien à l'utilisateur
    const existing =
      await sql`select * from public.products where id = ${id} and user_id = ${user.sub}`;
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 },
      );
    }

    // Mapping des champs du body vers les colonnes SQL
    const fieldMap: Record<string, string> = {
      name: "name",
      sku: "sku",
      barcode: "barcode",
      category: "category",
      subcategory: "subcategory",
      imageUrl: "image_url",
      description: "description",
      salePrice: "sale_price",
      promotionalPrice: "promotional_price",
      unitCost: "unit_cost",
      purchasePrice: "purchase_price",
      productionCost: "production_cost",
      marginPercent: "margin_percent",
      tvaRate: "tva_rate",
      unitOfMeasure: "unit_of_measure",
      weightKg: "weight_kg",
      dimensions: "dimensions",
      minStock: "min_stock",
      maxStock: "max_stock",
      currentStock: "current_stock",
      primarySupplierId: "primary_supplier_id",
      active: "active",
    };

    // Construction dynamique de la requête SQL avec postgres.js
    const updateClauseParts: string[] = [];
    const queryParams: unknown[] = [id, user.sub];
    let paramCount = 2;

    for (const [jsField, sqlField] of Object.entries(fieldMap)) {
      if (updates[jsField] !== undefined) {
        // Vérification unicité SKU/barcode si modifiés
        if ((jsField === "sku" || jsField === "barcode") && updates[jsField]) {
          // Requête séparée pour la vérification d'unicité
          const checkQuery =
            jsField === "sku"
              ? sql`select id from public.products where user_id = ${user.sub} and sku = ${updates[jsField]} and id != ${id}`
              : sql`select id from public.products where user_id = ${user.sub} and barcode = ${updates[jsField]} and id != ${id}`;
          const conflict = await checkQuery;
          if (conflict.length > 0) {
            return NextResponse.json(
              {
                error: `Un produit avec ce ${jsField === "sku" ? "SKU" : "code-barres"} existe déjà.`,
              },
              { status: 409 },
            );
          }
        }
        // Ajouter la partie de la clause SET
        updateClauseParts.push(`${sqlField} = $${++paramCount}`);
        queryParams.push(updates[jsField]);
      }
    }

    // Toujours mettre à jour updated_at
    updateClauseParts.push("updated_at = now()");

    // Si aucun champ à mettre à jour
    if (updateClauseParts.length === 1) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour." },
        { status: 400 },
      );
    }

    // Construire la requête complète avec postgres.js template literal
    const setClause = updateClauseParts.join(", ");
    const updateQuery = `update public.products set ${setClause} where id = $1 and user_id = $2 returning *`;
    const [updated] = await sql.query(updateQuery, queryParams);

    // Gestion des variantes : si fournies dans la requête, supprimer les anciennes et réinsérer
    if (Array.isArray(updates.variants)) {
      // Supprimer les anciennes variantes
      await sql`delete from public.product_variants where product_id = ${id} and user_id = ${user.sub}`;

      // Insérer les nouvelles variantes
      const variants: ProductVariant[] = [];
      for (const variant of updates.variants) {
        if (typeof variant === "object" && variant.name) {
          const variantName = String(variant.name).trim();
          const variantType = String(variant.variantType || "size");
          const variantSku = variant.sku ? String(variant.sku).trim() : null;
          const variantBarcode = variant.barcode
            ? String(variant.barcode).trim()
            : null;
          const priceAdjustment = toInt(variant.priceAdjustment) ?? 0;
          const weightAdjustmentKg = toFloat(variant.weightAdjustmentKg) ?? 0;
          const stockAdjustment = toInt(variant.stockAdjustment) ?? 0;

          const [insertedVariant] = await sql`
            insert into public.product_variants (
              product_id, user_id, name, variant_type, sku, barcode,
              price_adjustment, weight_adjustment_kg, stock_adjustment
            )
            values (
              ${id}, ${user.sub}, ${variantName}, ${variantType}, ${variantSku}, ${variantBarcode},
              ${priceAdjustment}, ${weightAdjustmentKg}, ${stockAdjustment}
            )
            returning *
          `;
          variants.push(toProductVariant(insertedVariant));
        }
      }

      // Ajouter les variantes mises à jour au produit retourné
      updated.variants = variants;
    }

    // Mapping vers le type ProductRecord
    const product: ProductRecord = {
      id: updated.id,
      userId: updated.user_id,
      name: updated.name,
      sku: updated.sku,
      barcode: updated.barcode,
      category: updated.category,
      subcategory: updated.subcategory,
      imageUrl: updated.image_url,
      description: updated.description,
      salePrice: updated.sale_price,
      promotionalPrice: updated.promotional_price,
      unitCost: updated.unit_cost,
      purchasePrice: updated.purchase_price,
      productionCost: updated.production_cost,
      marginPercent: updated.margin_percent,
      tvaRate: updated.tva_rate,
      unitOfMeasure: updated.unit_of_measure,
      weightKg: updated.weight_kg,
      dimensions: updated.dimensions,
      minStock: updated.min_stock,
      maxStock: updated.max_stock,
      currentStock: updated.current_stock,
      primarySupplierId: updated.primary_supplier_id,
      active: updated.active,
      variants: updated.variants || [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId || !UUID_RE.test(productId)) {
    return NextResponse.json(
      { error: "ID de produit invalide." },
      { status: 400 },
    );
  }

  const sql = getNeonClient();
  if (!sql)
    return NextResponse.json(
      { error: "Base non configurée." },
      { status: 503 },
    );

  try {
    const [existing] = await sql`
      select id from public.products where id = ${productId} and user_id = ${user.sub}
    `;
    if (!existing) {
      return NextResponse.json(
        { error: "Produit non trouvé." },
        { status: 404 },
      );
    }

    const hasSales = await sql`
      select 1 from public.sale_items where product_id = ${productId} limit 1
    `;
    if (hasSales.length > 0) {
      await sql`
        update public.products set active = false where id = ${productId}
      `;
      return NextResponse.json({
        message:
          "Le produit a été désactivé (il est utilisé dans des ventes passées).",
        softDelete: true,
      });
    }

    await sql`
      delete from public.products where id = ${productId} and user_id = ${user.sub}
    `;

    return NextResponse.json({ message: "Produit supprimé avec succès." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer le produit." },
      { status: 500 },
    );
  }
}
