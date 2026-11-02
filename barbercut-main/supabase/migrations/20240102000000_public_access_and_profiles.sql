-- ============================================================
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
