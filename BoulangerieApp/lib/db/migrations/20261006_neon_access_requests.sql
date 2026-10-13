create table if not exists public.access_requests (
    id uuid primary key default gen_random_uuid(),
    contact_name text not null check (char_length(contact_name) between 2 and 120),
    bakery_name text not null check (char_length(bakery_name) between 2 and 160),
    city text not null check (char_length(city) between 2 and 120),
    phone text not null check (char_length(phone) between 8 and 32),
    email text not null check (char_length(email) between 5 and 254),
    outlet_count smallint not null check (outlet_count between 1 and 500),
    requested_plan text check (requested_plan in ('starter', 'pro', 'enterprise')),
    preferred_demo_date date,
    preferred_contact text not null default 'whatsapp' check (preferred_contact in ('whatsapp', 'call', 'email')),
    needs text not null check (char_length(needs) between 8 and 1500),
    status text not null default 'pending' check (status in ('pending', 'contacted', 'approved', 'rejected')),
    created_at timestamptz not null default now()
);

-- Comptes utilisateurs locaux (remplace Supabase Auth).
create table if not exists public.app_users (
    id uuid primary key default gen_random_uuid(),
    full_name text not null check (char_length(full_name) between 2 and 160),
    email text not null unique check (char_length(email) between 5 and 254),
    password_hash text not null,
    created_at timestamptz not null default now()
);
create unique index if not exists app_users_email_unique on public.app_users (lower(email));
