-- ============================================================
-- Correctif P2 — Persistance local → base (cf AMELIORATIONS.md §2)
-- À appliquer après 20240103000000_fix_appointments_rls.sql
--
-- Problème corrigé : les avis clients, les comptes clients, les
-- abonnements et les invitations d'équipe n'existaient QUE dans le
-- localStorage du navigateur. Deux appareils (ou un changement de
-- machine) ne voyaient pas la même chose, et les avis affichés sur
-- la marketplace n'étaient jamais persistés.
-- Cette migration crée les tables correspondantes côté Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table : salon_reviews (avis clients)
--    - `date` conserve l'ancienne colonne ; `review_date` est la
--      colonne canonique ajoutée par la suite (les deux sont écrites
--      par l'application pour compatibilité).
--    - note moyenne du salon recalculée par trigger : la valeur
--      affichée n'est plus jamais une divergence client/base.
-- ------------------------------------------------------------
create table if not exists public.salon_reviews (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  client_name text not null,
  client_phone text,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  source text not null default 'direct', -- direct, marketplace
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.salon_reviews add column if not exists review_date timestamp with time zone;

create index if not exists salon_reviews_salon_id_idx on public.salon_reviews(salon_id);
create index if not exists salon_reviews_salon_created_idx on public.salon_reviews(salon_id, created_at desc);

-- Note moyenne + nombre d'avis toujours cohérents avec les lignes.
create or replace function public.recompute_salon_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
begin
  select coalesce(avg(rating), 0), count(*)
    into v_avg, v_count
    from public.salon_reviews
   where salon_id = coalesce(new.salon_id, old.salon_id);

  update public.salons
     set rating = round(v_avg, 1),
         reviews_count = v_count
   where id = coalesce(new.salon_id, old.salon_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists salon_reviews_recompute_rating on public.salon_reviews;
create trigger salon_reviews_recompute_rating
  after insert or update or delete on public.salon_reviews
  for each row execute function public.recompute_salon_rating();

-- ------------------------------------------------------------
-- 2. Table : client_accounts (comptes de fidélisation clients)
--    total_visits / total_spent restent des compteurs applicatifs :
--    la source de vérité des visites demeure `appointments`.
--    Téléphone unique = identifiant naturel du compte client.
-- ------------------------------------------------------------
create table if not exists public.client_accounts (
  id uuid default gen_random_uuid() primary key,
  phone text not null unique,
  name text not null,
  email text,
  status text not null default 'Nouveau', -- VIP, Régulier, Nouveau
  source text not null default 'direct',  -- direct, marketplace
  total_visits integer not null default 0,
  total_spent numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists client_accounts_phone_idx on public.client_accounts(phone);

-- ------------------------------------------------------------
-- 3. Table : team_invitations (invitations d'équipe)
--    L'invitation est émise par le propriétaire du salon ; elle ne
--    devient lisible par l'invité que lorsqu'il est authentifié avec
--    l'email ciblé (policy ci-dessous) — fin des invitations
--    « stockées localement sans effet ».
-- ------------------------------------------------------------
create table if not exists public.team_invitations (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  email text not null,
  role text not null default 'coiffeur', -- admin, coiffeur, receptionniste
  invited_by uuid references public.users(id),
  status text not null default 'pending', -- pending, accepted, declined
  responded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists team_invitations_salon_id_idx on public.team_invitations(salon_id);
create index if not exists team_invitations_email_idx on public.team_invitations(email);

-- ------------------------------------------------------------
-- 4. Table : salon_subscriptions (abonnements des salons)
--    Le plan et le statut vivent déjà en colonnes sur `salons` ;
--    cette table garde l'historique complet (essai, upgrades,
--    annulations) pour la facturation future.
-- ------------------------------------------------------------
create table if not exists public.salon_subscriptions (
  salon_id uuid references public.salons(id) on delete cascade primary key,
  plan text not null default 'gratuit',            -- gratuit, pro
  status text not null default 'active',           -- active, trial, expired, cancelled
  price_fcfa integer not null default 0,           -- 0 gratuit / 35000 pro
  trial_ends_at timestamp with time zone,
  billing_cycle_start timestamp with time zone,
  billing_cycle_end timestamp with time zone,
  payment_method text,                             -- cash, wave, orange_money, card
  last_payment_at timestamp with time zone,
  next_payment_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------
alter table public.salon_reviews enable row level security;
alter table public.client_accounts enable row level security;
alter table public.team_invitations enable row level security;
alter table public.salon_subscriptions enable row level security;

-- Avis : lecture publique (la marketplace affiche les notes), écriture
-- restreinte au propriétaire du salon (le dépôt d'avis visiteur passera
-- par une fonction RPC dédiée lorsque le flux sera branché).
drop policy if exists "Anyone can read published salon reviews" on public.salon_reviews;
create policy "Anyone can read published salon reviews"
  on public.salon_reviews for select
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_reviews.salon_id
        and s.is_published = true
    )
    or exists (
      select 1 from public.salons s
      where s.id = salon_reviews.salon_id
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Owner can manage reviews of their salons" on public.salon_reviews;
create policy "Owner can manage reviews of their salons"
  on public.salon_reviews for all
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_reviews.salon_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = salon_reviews.salon_id
        and s.owner_id = auth.uid()
    )
  );

-- Comptes clients : chaque client authentifié voit/modifie SON compte
-- (repère : email ou téléphone = claim/authentification futur) ; les
-- gérants voient les comptes rattachés à leurs rendez-vous. En attendant
-- l'authentification client, la gestion passe par le store local du
-- salon ; la policy proprio couvre les usages actuels.
drop policy if exists "Owner can view client accounts of their appointments" on public.client_accounts;
create policy "Owner can view client accounts of their appointments"
  on public.client_accounts for select
  to authenticated
  using (
    exists (
      select 1
        from public.appointments a
        join public.salons s on s.id = a.salon_id
       where s.owner_id = auth.uid()
         and (a.client_phone = client_accounts.phone
              or (client_accounts.email is not null
                  and a.client_email = client_accounts.email))
    )
  );

drop policy if exists "Owner can manage client accounts of their appointments" on public.client_accounts;
create policy "Owner can manage client accounts of their appointments"
  on public.client_accounts for all
  to authenticated
  using (
    exists (
      select 1
        from public.appointments a
        join public.salons s on s.id = a.salon_id
       where s.owner_id = auth.uid()
         and (a.client_phone = client_accounts.phone
              or (client_accounts.email is not null
                  and a.client_email = client_accounts.email))
    )
  )
  with check (
    exists (
      select 1
        from public.appointments a
        join public.salons s on s.id = a.salon_id
       where s.owner_id = auth.uid()
         and (a.client_phone = client_accounts.phone
              or (client_accounts.email is not null
                  and a.client_email = client_accounts.email))
    )
  );

-- Invitations : le propriétaire gère les siennes ; l'invité ne voit la
-- sienne qu'une fois authentifié avec l'email ciblé.
drop policy if exists "Owner manages invitations of their salons" on public.team_invitations;
create policy "Owner manages invitations of their salons"
  on public.team_invitations for all
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = team_invitations.salon_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = team_invitations.salon_id
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Invitee can view own invitation" on public.team_invitations;
create policy "Invitee can view own invitation"
  on public.team_invitations for select
  to authenticated
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Abonnements : uniquement le propriétaire du salon.
drop policy if exists "Owner manages own subscription" on public.salon_subscriptions;
create policy "Owner manages own subscription"
  on public.salon_subscriptions for all
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_subscriptions.salon_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = salon_subscriptions.salon_id
        and s.owner_id = auth.uid()
    )
  );
