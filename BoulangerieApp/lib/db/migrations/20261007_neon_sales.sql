create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    name text not null check (char_length(name) between 1 and 160),
    sale_price integer not null check (sale_price >= 0),
    unit_cost integer not null default 0 check (unit_cost >= 0),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (user_id, name)
);

create table if not exists public.sales (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    sale_date date not null default current_date,
    payment_method text not null default 'cash' check (payment_method in ('cash', 'mobile', 'card')),
    total integer not null default 0 check (total >= 0),
    created_at timestamptz not null default now()
);

create index if not exists sales_user_date_idx
    on public.sales (user_id, sale_date desc);

create table if not exists public.sale_items (
    id uuid primary key default gen_random_uuid(),
    sale_id uuid not null references public.sales(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    unit_price integer not null check (unit_price >= 0),
    unit_cost integer not null default 0 check (unit_cost >= 0)
);

create index if not exists sale_items_sale_idx
    on public.sale_items (sale_id);

create index if not exists sale_items_product_idx
    on public.sale_items (product_id);
