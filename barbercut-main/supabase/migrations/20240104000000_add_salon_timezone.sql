-- P3 localisation : fuseau horaire du salon (IANA), pour un affichage
-- correct des dates/heure de réservation quel que soit le pays du gérant.
alter table public.salons
  add column if not exists timezone text default 'Africa/Dakar';

comment on column public.salons.timezone is
  'Identifiant de fuseau IANA (ex. Africa/Dakar, Europe/Paris). Défaut : Afrique de l''Ouest.';
