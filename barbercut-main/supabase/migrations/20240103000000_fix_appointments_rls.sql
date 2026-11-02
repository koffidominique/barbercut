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
  select not exists (
    select 1
    from public.appointments a
    where a.salon_id = p_salon_id
      and a.date = p_date
      and coalesce(a.staff_name, '') = coalesce(p_staff_name '', '')
      and a.status <> 'cancelled'
      and abs(
            (extract(epoch from (a.time::time)) - extract(epoch from (p_time::time)))
          ) < 60 * coalesce(
              (select ss.duration
                 from public.salon_services ss
                where ss.salon_id = p_salon_id
                  and (ss.id = p_service_id or ss.name = a.service_name)
                limit 1),
              45
            )
  );
$$;

-- Réservation marketplace depuis la marketplace ( (marketplace) :
-- autorisée seulement si le créneau est libre.
create policy "Anyone can book a free free slot"
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

create unique index if not exists uniq_appointment_slot_unique
  on public.appointments (salon_id, staff_name, date, time)
  where status <> 'cancelled';
