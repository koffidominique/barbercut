create table if not exists public.cash_closures (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    closure_date date not null default current_date,
    cashier text not null check (char_length(cashier) between 2 and 160),
    opening_fund integer not null check (opening_fund >= 0),
    cash_sales integer not null check (cash_sales >= 0),
    mobile_sales integer not null default 0 check (mobile_sales >= 0),
    card_sales integer not null default 0 check (card_sales >= 0),
    expenses integer not null default 0 check (expenses >= 0),
    counted_cash integer not null check (counted_cash >= 0),
    created_at timestamptz not null default now()
);

create index if not exists cash_closures_user_date_idx
    on public.cash_closures (user_id, closure_date desc);
