-- ============================================
-- Schéma de base de données Barber Cuts
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Activer l'extension uuid-ossp pour générer des UUID
create extension if not exists "uuid-ossp";

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
  id uuid default uuid_generate_v4() primary key,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------
-- Table : salon_staff (membres de l'équipe)
-- -----------------------------------------------------
create table public.salon_staff (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Politiques d'accès public pour la Marketplace (salons publiés)
create policy "Anyone can view published salons"
  on public.salons for select
  using (is_published = true);

create policy "Anyone can view services of published salons"
  on public.salon_services for select
  using (exists (select 1 from public.salons where salons.id = salon_services.salon_id and salons.is_published = true));

create policy "Anyone can view staff of published salons"
  on public.salon_staff for select
  using (exists (select 1 from public.salons where salons.id = salon_staff.salon_id and salons.is_published = true));

create policy "Anyone can view photos of published salons"
  on public.showcase_photos for select
  using (exists (select 1 from public.salons where salons.id = showcase_photos.salon_id and salons.is_published = true));

-- Réservation publique (Marketplace)
create policy "Anyone can insert appointments to published salons"
  on public.appointments for insert
  with check (exists (select 1 from public.salons where salons.id = appointments.salon_id and salons.is_published = true));

create policy "Clients can view their own appointments"
  on public.appointments for select
  using (true);

-- Trigger automatique de création de profil à l'inscription auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'owner'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
