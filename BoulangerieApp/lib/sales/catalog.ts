import { getNeonClient } from "@/lib/db/neon";
import { RECIPES, costPerUnit } from "@/components/recettes/recipe-data";

// Types complets pour la gestion des produits avec toutes les fonctionnalités demandées
export type ProductCategory =
  | "pains"
  | "viennoiseries"
  | "patisseries"
  | "gateaux"
  | "tartes"
  | "sandwichs"
  | "snacks"
  | "biscuits"
  | "produits_sales"
  | "boissons"
  | "produits_complementaires"
  | "produits_personnalises";

export type VariantType =
  | "size"
  | "weight"
  | "format"
  | "flavor"
  | "garnish"
  | "packaging";
export type UnitOfMeasure = "unit" | "kg" | "g" | "l" | "cl" | "piece";

export type ProductVariant = {
  id: string;
  productId: string;
  userId: string;
  name: string;
  variantType: VariantType;
  sku?: string;
  barcode?: string;
  priceAdjustment: number;
  weightAdjustmentKg: number;
  stockAdjustment: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Supplier = {
  id: string;
  userId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRecord = {
  id: string;
  userId: string;
  name: string;
  sku?: string;
  barcode?: string;
  category?: ProductCategory;
  subcategory?: string;
  imageUrl?: string;
  description?: string;
  salePrice: number;
  promotionalPrice?: number;
  unitCost: number;
  purchasePrice?: number; // Prix d'achat fournisseur
  productionCost?: number; // Coût de production
  marginPercent?: number;
  tvaRate: number;
  unitOfMeasure: UnitOfMeasure;
  weightKg?: number;
  dimensions?: string;
  minStock: number;
  maxStock?: number;
  currentStock: number;
  primarySupplierId?: string;
  active: boolean;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export function defaultCatalogJson() {
  return JSON.stringify(
    RECIPES.map((recipe) => ({
      name: recipe.productName,
      sale_price: recipe.salePrice,
      unit_cost: Math.round(costPerUnit(recipe)),
    })),
  );
}

/**
 * Insère le catalogue par défaut (dérivé des fiches recettes) si l'utilisateur
 * n'a encore aucun produit. Une seule requête — le driver HTTP Neon n'accepte
 * pas les transactions multi-requêtes ici.
 */
export async function ensureUserProducts(userId: string) {
  const sql = getNeonClient();
  if (!sql) return;

  const existing = await sql`
    select 1 from public.products where user_id = ${userId} limit 1
  `;
  if (existing.length > 0) return;

  await sql`
    insert into public.products (user_id, name, sale_price, unit_cost)
    select ${userId}, x.name, x.sale_price, x.unit_cost
    from json_to_recordset(${defaultCatalogJson()}::jsonb)
      as x(name text, sale_price integer, unit_cost integer)
    on conflict (user_id, name) do nothing
  `;
}

export async function listUserProducts(
  userId: string,
  includeInactive = false,
): Promise<ProductRecord[]> {
  const sql = getNeonClient();
  if (!sql) return [];

  const rows = await sql`
    select 
      id, user_id, name, sku, barcode, category, subcategory, 
      image_url, description, sale_price, promotional_price, 
      unit_cost, purchase_price, production_cost, margin_percent,
      tva_rate, unit_of_measure, weight_kg, dimensions, min_stock,
      max_stock, current_stock, primary_supplier_id, active,
      created_at, updated_at
    from public.products
    where user_id = ${userId} ${includeInactive ? sql`` : sql`and active`}
    order by name
    limit 500
  `;

  return (
    rows as unknown as {
      id: string;
      user_id: string;
      name: string;
      sku?: string;
      barcode?: string;
      category?: string;
      subcategory?: string;
      image_url?: string;
      description?: string;
      sale_price: number;
      promotional_price?: number;
      unit_cost: number;
      purchase_price?: number;
      production_cost?: number;
      margin_percent?: number;
      tva_rate: number;
      unit_of_measure: string;
      weight_kg?: number;
      dimensions?: string;
      min_stock: number;
      max_stock?: number;
      current_stock: number;
      primary_supplier_id?: string;
      active: boolean;
      created_at: Date;
      updated_at: Date;
    }[]
  ).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    category: row.category as ProductCategory | undefined,
    subcategory: row.subcategory,
    imageUrl: row.image_url,
    description: row.description,
    salePrice: row.sale_price,
    promotionalPrice: row.promotional_price,
    unitCost: row.unit_cost,
    purchasePrice: row.purchase_price,
    productionCost: row.production_cost,
    marginPercent: row.margin_percent,
    tvaRate: row.tva_rate,
    unitOfMeasure: (row.unit_of_measure as UnitOfMeasure) || "unit",
    weightKg: row.weight_kg,
    dimensions: row.dimensions,
    minStock: row.min_stock,
    maxStock: row.max_stock,
    currentStock: row.current_stock,
    primarySupplierId: row.primary_supplier_id,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Récupère les variantes associées à un produit
 */
export async function getProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  const sql = getNeonClient();
  if (!sql) return [];

  const rows = await sql`
    select id, product_id, user_id, name, variant_type, sku, barcode,
           price_adjustment, weight_adjustment_kg, stock_adjustment,
           active, created_at, updated_at
    from public.product_variants
    where product_id = ${productId} and active
    order by name
  `;

  return (
    rows as unknown as {
      id: string;
      product_id: string;
      user_id: string;
      name: string;
      variant_type: string;
      sku?: string;
      barcode?: string;
      price_adjustment: number;
      weight_adjustment_kg: number;
      stock_adjustment: number;
      active: boolean;
      created_at: Date;
      updated_at: Date;
    }[]
  ).map((row) => ({
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    name: row.name,
    variantType: row.variant_type as VariantType,
    sku: row.sku,
    barcode: row.barcode,
    priceAdjustment: row.price_adjustment,
    weightAdjustmentKg: row.weight_adjustment_kg,
    stockAdjustment: row.stock_adjustment,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
