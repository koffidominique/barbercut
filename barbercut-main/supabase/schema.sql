-- ============================================================
-- Schéma complet Supabase — régénéré depuis supabase/migrations/
-- SOURCE DE VÉRITÉ : les fichiers de migration. Ce fichier est la
-- concaténation appliquée dans l'ordre ; vérifié par `npm run check:migrations`.
-- ============================================================

-- ============================================
-- Schéma de base de données Barber Cuts
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- gen_random_uuid() est natif dans PostgreSQL 13+, pas besoin d'extension uuid-ossp

-- -----------------------------------------------------
-- Table : users (profils utilisateurs liés à Supabase Auth)
-- -----------------------------------------------------
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'owner', -- owner, staff, receptionist
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : salons
-- -----------------------------------------------------
create table public.salons (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.users(id) not null,
  name text not null,
  tagline text,
  description text,
  city text,
  neighborhood text,
  address text,
  phone text,
  whatsapp text,
  rating numeric default 0,
  reviews_count integer default 0,
  is_published boolean default false,
  cover_image text,
  opening_hours text,
  rccm text,
  currency text default 'FCFA',
  sms_reminders_enabled boolean default true,
  whatsapp_confirmation_enabled boolean default true,
  subscription_plan text default 'free', -- free, pro
  subscription_status text default 'inactive', -- active, inactive, past_due
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : salon_staff (membres de l'équipe)
-- -----------------------------------------------------
create table public.salon_staff (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  name text not null,
  role text,
  specialty text,
  phone text,
  schedule text,
  color text,
  initials text,
  rating numeric default 4.9,
  reviews_count integer default 0,
  appointments_count integer default 0,
  status text default 'active', -- active, leave
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : salon_services (catalogue prestations)
-- -----------------------------------------------------
create table public.salon_services (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  name text not null,
  category text check (category in ('Hommes', 'Dames', 'Soins & Barbe', 'Enfants')),
  price integer, -- en FCFA
  duration integer, -- en minutes
  description text,
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : showcase_photos (photos de vitrine)
-- -----------------------------------------------------
create table public.showcase_photos (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  url text not null,
  title text not null,
  description text,
  tags text[] default '{}',
  is_cover boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : salon_clients (fiche clients)
-- -----------------------------------------------------
create table public.salon_clients (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  favorite_service text,
  preferred_staff text,
  total_visits integer default 0,
  total_spent integer default 0, -- en FCFA
  last_visit date,
  next_appointment text,
  status text check (status in ('VIP', 'Régulier', 'Nouveau')) default 'Nouveau',
  source text check (source in ('marketplace', 'direct')) default 'direct',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : appointments (rendez-vous)
-- -----------------------------------------------------
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade not null,
  client_name text not null,
  client_phone text not null,
  service_id text, -- référence vers salon_services.id (texte pour compatibilité avec l'existant)
  service_name text not null,
  service_price integer, -- en FCFA
  staff_name text,
  date date not null,
  time text not null,
  status text check (status in ('confirmed', 'pending', 'completed', 'cancelled')) default 'pending',
  source text check (source in ('marketplace', 'direct')) default 'direct',
  notes text,
  payment_status text check (payment_status in ('unpaid', 'partial', 'paid')) default 'unpaid',
  payment_method text check (payment_method in ('cash', 'wave', 'orange_money', 'card')) default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Index pour performance des requêtes courantes
-- -----------------------------------------------------
create index idx_salons_owner_id on public.salons(owner_id);
create index idx_salon_staff_salon_id on public.salon_staff(salon_id);
create index idx_salon_services_salon_id on public.salon_services(salon_id);
create index idx_showcase_photos_salon_id on public.showcase_photos(salon_id);
create index idx_salon_clients_salon_id on public.salon_clients(salon_id);
create index idx_appointments_salon_id on public.appointments(salon_id);
create index idx_appointments_date on public.appointments(date);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_source on public.appointments(source);

-- -----------------------------------------------------
-- Row Level Security (RLS)
-- Chaque utilisateur ne voit que les données de ses propres salons
-- -----------------------------------------------------
alter table public.salons enable row level security;
alter table public.salon_staff enable row level security;
alter table public.salon_services enable row level security;
alter table public.showcase_photos enable row level security;
alter table public.salon_clients enable row level security;
alter table public.appointments enable row level security;
alter table public.users enable row level security;

-- Politiques : un utilisateur peut lire/écrire ses propres salons
create policy "Users can view their own salons"
  on public.salons for select
  using (auth.uid() = owner_id);

create policy "Users can insert their own salons"
  on public.salons for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own salons"
  on public.salons for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own salons"
  on public.salons for delete
  using (auth.uid() = owner_id);

-- Politiques cascade pour les tables liées à un salon
create policy "Users can view staff of their salons"
  on public.salon_staff for select
  using (exists (select 1 from public.salons where salons.id = salon_staff.salon_id and salons.owner_id = auth.uid()));

create policy "Users can insert staff to their salons"
  on public.salon_staff for insert
  with check (exists (select 1 from public.salons where salons.id = salon_staff.salon_id and salons.owner_id = auth.uid()));

create policy "Users can update staff of their salons"
  on public.salon_staff for update
  using (exists (select 1 from public.salons where salons.id = salon_staff.salon_id and salons.owner_id = auth.uid()));

create policy "Users can delete staff of their salons"
  on public.salon_staff for delete
  using (exists (select 1 from public.salons where salons.id = salon_staff.salon_id and salons.owner_id = auth.uid()));

create policy "Users can view services of their salons"
  on public.salon_services for select
  using (exists (select 1 from public.salons where salons.id = salon_services.salon_id and salons.owner_id = auth.uid()));

create policy "Users can insert services to their salons"
  on public.salon_services for insert
  with check (exists (select 1 from public.salons where salons.id = salon_services.salon_id and salons.owner_id = auth.uid()));

create policy "Users can update services of their salons"
  on public.salon_services for update
  using (exists (select 1 from public.salons where salons.id = salon_services.salon_id and salons.owner_id = auth.uid()));

create policy "Users can delete services of their salons"
  on public.salon_services for delete
  using (exists (select 1 from public.salons where salons.id = salon_services.salon_id and salons.owner_id = auth.uid()));

create policy "Users can view photos of their salons"
  on public.showcase_photos for select
  using (exists (select 1 from public.salons where salons.id = showcase_photos.salon_id and salons.owner_id = auth.uid()));

create policy "Users can insert photos to their salons"
  on public.showcase_photos for insert
  with check (exists (select 1 from public.salons where salons.id = showcase_photos.salon_id and salons.owner_id = auth.uid()));

create policy "Users can update photos of their salons"
  on public.showcase_photos for update
  using (exists (select 1 from public.salons where salons.id = showcase_photos.salon_id and salons.owner_id = auth.uid()));

create policy "Users can delete photos of their salons"
  on public.showcase_photos for delete
  using (exists (select 1 from public.salons where salons.id = showcase_photos.salon_id and salons.owner_id = auth.uid()));

create policy "Users can view clients of their salons"
  on public.salon_clients for select
  using (exists (select 1 from public.salons where salons.id = salon_clients.salon_id and salons.owner_id = auth.uid()));

create policy "Users can insert clients to their salons"
  on public.salon_clients for insert
  with check (exists (select 1 from public.salons where salons.id = salon_clients.salon_id and salons.owner_id = auth.uid()));

create policy "Users can update clients of their salons"
  on public.salon_clients for update
  using (exists (select 1 from public.salons where salons.id = salon_clients.salon_id and salons.owner_id = auth.uid()));

create policy "Users can delete clients of their salons"
  on public.salon_clients for delete
  using (exists (select 1 from public.salons where salons.id = salon_clients.salon_id and salons.owner_id = auth.uid()));

create policy "Users can view appointments of their salons"
  on public.appointments for select
  using (exists (select 1 from public.salons where salons.id = appointments.salon_id and salons.owner_id = auth.uid()));

create policy "Users can insert appointments to their salons"
  on public.appointments for insert
  with check (exists (select 1 from public.salons where salons.id = appointments.salon_id and salons.owner_id = auth.uid()));

create policy "Users can update appointments of their salons"
  on public.appointments for update
  using (exists (select 1 from public.salons where salons.id = appointments.salon_id and salons.owner_id = auth.uid()));

create policy "Users can delete appointments of their salons"
  on public.appointments for delete
  using (exists (select 1 from public.salons where salons.id = appointments.salon_id and salons.owner_id = auth.uid()));

-- Les utilisateurs peuvent voir et modifier leur propre profil
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Permettre la création de profil lors de l'inscription (trigger ou manuel)
-- voir https://supabase.com/docs/guides/auth/auth-helpers#managing-user-data-with-triggers-- ============================================================
-- Correctifs P0 — inscription, marketplace publique, réservation
-- À appliquer après 20240101000000_initial_schema.sql
--
-- Sans ces correctifs :
--   * aucun nouveau gérant ne peut créer son salon (FK owner_id) ;
--   * la marketplace est vide pour les visiteurs non connectés ;
--   * la réservation depuis la marketplace est refusée par RLS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Coordonnées GPS (lues et écrites par l'application)
-- ------------------------------------------------------------
alter table public.salons add column if not exists latitude numeric;
alter table public.salons add column if not exists longitude numeric;

-- ------------------------------------------------------------
-- 2. Profil applicatif créé automatiquement à l'inscription
--    (public.users est référencée par salons.owner_id)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'owner'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 3. Policy INSERT manquante sur public.users
-- ------------------------------------------------------------
drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- 4. Lecture publique des salons publiés (marketplace)
--    Les autres policies existantes restent valables : elles
--    sont combinées avec OR (permissif).
-- ------------------------------------------------------------
drop policy if exists "Anyone can view published salons" on public.salons;
create policy "Anyone can view published salons"
  on public.salons for select
  to anon, authenticated
  using (is_published = true);

-- ------------------------------------------------------------
-- 5. Contenus publics d'un salon publié
-- ------------------------------------------------------------
drop policy if exists "Anyone can view services of published salons" on public.salon_services;
create policy "Anyone can view services of published salons"
  on public.salon_services for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_services.salon_id and s.is_published
    )
  );

drop policy if exists "Anyone can view staff of published salons" on public.salon_staff;
create policy "Anyone can view staff of published salons"
  on public.salon_staff for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_staff.salon_id and s.is_published
    )
  );

drop policy if exists "Anyone can view photos of published salons" on public.showcase_photos;
create policy "Anyone can view photos of published salons"
  on public.showcase_photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = showcase_photos.salon_id and s.is_published
    )
  );

-- ------------------------------------------------------------
-- 6. Réservation depuis la marketplace (visiteur non connecté)
--    Un client ne peut réserver que sur un salon publié.
--    À noter : sans compte, il ne peut pas relire ses rendez-vous ;
--    « Mes rendez-vous » nécessitera Supabase Auth (phase suivante).
-- ------------------------------------------------------------
drop policy if exists "Anyone can book an appointment" on public.appointments;
create policy "Anyone can book an appointment"
  on public.appointments for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id and s.is_published
    )
  );

-- ------------------------------------------------------------
-- 7. Anti double réservation (à activer après nettoyage des
--    éventuels doublons déjà présents en base)
-- ------------------------------------------------------------
-- create unique index if not exists uniq_appointment_slot
--   on public.appointments (salon_id, staff_name, date, time)
--   where status <> 'cancelled';
-- ============================================================
-- Correctif P1 — Sécurisation RLS des rendez-vous + anti
-- double réservation au niveau base.
-- À appliquer après 20240102000000_public_access_and_profiles.sql
--
-- Problème corrigé (cf AMELIORATIONS.md §5, bloquant « Sécurité ») :
--   la policy « Users can view appointments of their salons »
--   (migration initiale) n'était pas restreinte à un rôle : tout
--   requête SELECT combinée en OR avec les autres policies laissait
--   filtrage défaillant. En pratique les coordonnées clients
--   (noms + téléphones) pouvaient être exposées.
--   Cette migration réécrit TOUTES les policies de la table
--   appointments avec une restriction explicite TO et auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- 1. Suppression des policies existantes sur appointments
-- ------------------------------------------------------------
drop policy if exists "Users can view appointments of their salons"  on public.appointments;
drop policy if exists "Users can insert appointments to their salons" on public.appointments;
drop policy if exists "Users can update appointments of their salons" on public.appointments;
drop policy if exists "Users can delete appointments of their salons" on public.appointments;
drop policy if exists "Anyone can book an appointment"               on public.appointments;

-- ------------------------------------------------------------
-- 2. Lecture réservée au propriétaire du salon (authentiifié).
--    Un visiteur non connecté (anon) ne peut plus lire aucun
--    rendez-vous : les coordonnées clients sont protégées.
-- ------------------------------------------------------------
create policy "Owner can view appointments of their salons"
  on public.appointments for select
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 3. Mise à jour / suppression réservées au propriétaire.
-- ------------------------------------------------------------
create policy "Owner can update appointments of their salons"
  on public.appointments for update
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.owner_id = auth.uid()
    )
  );

create policy "Owner can delete appointments of their salons"
  on public.appointments for delete
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. Insertion :
--    a) le gérant authentifié peut créer un RDV sur SES salons ;
--    b) tout visiteur peut réserver sur un salon PUBLIÉ, à
--       condition que ce créneau ne soit pas déjà pris
--       (fonction de vérification anti-conflit, section 5).
--    Les deux policies sont combinées en OR (policies permisses).
-- ------------------------------------------------------------
create policy "Owner can insert appointments to their salons"
  on public.appointments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. Fonction de contrôle de conflit de créneau :
--    même salon + même membre d'équipe + même date, un créneau
--    [time, time+durée) ne doit pas chevaucher un RDV existant
--    (hors annulés). La durée est dérivée de la prestation
--    (salon_services.duration), sinon 45 min par défaut.
-- ------------------------------------------------------------
create or replace function public.is_slot_free(
  p_salon_id uuid,
  p_staff_name text,
  p_date date,
  p_time text,
  p_service_id text default null
) returns boolean
language sql
stable
as $$
-- Deux rendez-vous se chevauchent si chaque début est antérieur à la fin
-- de l'autre : start_a < end_b AND start_b < end_a (intervalles half-open).
  select not exists (
    select 1
    from public.appointments a
    where a.salon_id = p_salon_id
      and a.date = p_date
      and coalesce(a.staff_name, '') = coalesce(p_staff_name, '')
      and a.status <> 'cancelled'
      and extract(epoch from (a.time::time))
          < extract(epoch from (p_time::time)) + 60 * coalesce(
              (select ss.duration
                 from public.salon_services ss
                where ss.salon_id = p_salon_id
                  and (ss.id = p_service_id or ss.name = a.service_name)
                limit 1),
              45
            )
      and extract(epoch from (p_time::time))
          < extract(epoch from (a.time::time)) + 60 * coalesce(
              (select ss.duration
                 from public.salon_services ss
                where ss.salon_id = p_salon_id
                  and (ss.id = a.service_id or ss.name = a.service_name)
                limit 1),
              45
            )
  );
$$;

-- Réservation publique : autorisée seulement sur un salon publié
-- et si le créneau est libre (contrôle anti-conflit côté base).
create policy "Anyone can book a free slot"
  on public.appointments for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id
        and s.is_published
    )
    and public.is_slot_free(
          appointments.salon_id,
          appointments.staff_name,
          appointments.date,
          appointments.time,
          appointments.service_id
        )
  );

-- ------------------------------------------------------------
-- 6. Filet unique de dernier recours : même salon + équipe +
--    date + heure ne peut exister deux fois (hors annulés).
--    Nettoyage préalable des doublons historiques.
-- ------------------------------------------------------------
delete from public.appointments a
using public.appointments b
where a.ctid < b.ctid
  and a.salon_id = b.salon_id
  and coalesce(a.staff_name, '') = coalesce(b.staff_name, '')
  and a.date = b.date
  and a.time = b.time
  and a.status <> 'cancelled'
  and b.status <> 'cancelled';

create unique index if not exists uniq_appointment_slot
  on public.appointments (
    salon_id,
    coalesce(staff_name, ''),
    date,
    time
  )
  where status <> 'cancelled';
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
