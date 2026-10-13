-- Migration pour ajouter tous les champs de gestion complète des produits
-- Date: 06/10/2026

-- 1. Table suppliers : créée AVANT l'alter table products (clé étrangère)
create table if not exists public.suppliers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    name text not null check (char_length(name) between 1 and 160),
    contact_name text,
    phone text,
    email text,
    address text,
    payment_terms text, -- Conditions de paiement
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name)
);

-- 2. Ajout des colonnes manquantes à la table products
alter table if exists public.products
add column if not exists sku text, -- Référence / SKU
add column if not exists barcode text, -- Code-barres
add column if not exists category text, -- Catégorie principale
add column if not exists subcategory text, -- Sous-catégorie
add column if not exists image_url text, -- URL de la photo
add column if not exists description text, -- Description
add column if not EXISTS promotional_price integer check (promotional_price >= 0), -- Prix promotionnel
add column if not exists purchase_price integer check (purchase_price >= 0), -- Prix d'achat (fournisseur)
add column if not exists production_cost integer check (production_cost >= 0), -- Coût de production
add column if not exists margin_percent numeric(5,2), -- Marge en pourcentage
add column if not exists tva_rate numeric(4,2) default 20.00 check (tva_rate >= 0 and tva_rate <= 100), -- Taux de TVA
add column if not exists unit_of_measure text default 'unit', -- Unité de mesure (unit, kg, l, etc.)
add column if not exists weight_kg numeric(8,3), -- Poids en kg
add column if not exists dimensions text, -- Taille/Dimensions (format stocké comme "Lxlxh cm")
add column if not exists min_stock integer default 0 check (min_stock >= 0), -- Stock minimum (seuil d'alerte)
add column if not exists max_stock integer check (max_stock >= min_stock), -- Stock maximum
add column if not exists current_stock integer default 0 check (current_stock >= 0), -- Stock actuel
add column if not exists primary_supplier_id uuid, -- Fournisseur principal (FK ajoutée après création de suppliers)
add column if not exists updated_at timestamptz not null default now();

-- Ajout d'une contrainte unique sur SKU par utilisateur
alter table if exists public.products
add constraint unique_user_sku unique (user_id, sku);

-- Ajout d'une contrainte unique sur code-barres par utilisateur
alter table if exists public.products
add constraint unique_user_barcode unique (user_id, barcode);

-- Contrainte FK vers suppliers sur products.primary_supplier_id
alter table if exists public.products
add constraint fk_products_supplier foreign key (primary_supplier_id) references public.suppliers(id);

-- Création de la table des variantes de produits
create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    user_id uuid not null references public.app_users(id) on delete cascade,
    name text not null, -- Nom de la variante (ex: "Grand format", "Chocolat")
    variant_type text not null, -- Type de variante: size, weight, flavor, garnish, packaging, etc.
    sku text, -- SKU spécifique à la variante
    barcode text, -- Code-barres spécifique à la variante
    price_adjustment integer default 0, -- Ajustement de prix (+/- X FCFA)
    weight_adjustment_kg numeric(8,3) default 0, -- Ajustement de poids
    stock_adjustment integer default 0, -- Stock spécifique à cette variante
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (product_id, name),
    unique (user_id, sku)
);

-- Index pour optimiser les requêtes
create index if not exists products_category_idx on public.products(user_id, category);
create index if not exists products_active_idx on public.products(user_id, active);
create index if not exists products_stock_idx on public.products(user_id, current_stock);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists suppliers_user_idx on public.suppliers(user_id);

-- Trigger pour mettre à jour updated_at automatiquement
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Associer le trigger aux tables qui ont updated_at
drop trigger if exists set_timestamp_products on public.products;
create trigger set_timestamp_products before update on public.products for each row execute function update_updated_at();

drop trigger if exists set_timestamp_suppliers on public.suppliers;
create trigger set_timestamp_suppliers before update on public.suppliers for each row execute function update_updated_at();

drop trigger if exists set_timestamp_variants on public.product_variants;
create trigger set_timestamp_variants before update on public.product_variants for each row execute function update_updated_at();