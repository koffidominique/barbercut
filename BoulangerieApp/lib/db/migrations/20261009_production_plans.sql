-- Migration : table des plans de production hebdomadaires
-- Date: 06/10/2026

create table if not exists public.production_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    plan_date date not null,
    planned_qty integer not null check (planned_qty > 0),
    suggested_qty integer check (suggested_qty is null or suggested_qty >= 0),
    status text not null default 'planned' check (status in ('planned', 'done', 'skipped')),
    notes text,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, product_id, plan_date)
);

create index if not exists production_plans_user_date_idx on public.production_plans(user_id, plan_date);
create index if not exists production_plans_product_idx on public.production_plans(product_id);

drop trigger if exists set_timestamp_production_plans on public.production_plans;
create trigger set_timestamp_production_plans before update on public.production_plans for each row execute function update_updated_at();
