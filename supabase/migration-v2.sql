-- RITMO · Migración v2 — ejecutar COMPLETA en Supabase > SQL Editor > New query.
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- La app funciona sin esta migración (usa fallbacks), pero con ella gana:
--   1) integridad en exercise_sets (imposible duplicar series),
--   2) lista de la compra con unicidad por categoría,
--   3) columna profiles.schedule (horarios habituales),
--   4) reinicio de datos atómico (todo o nada).

-- 1) exercise_sets: eliminar duplicados históricos y bloquear los futuros.
delete from public.exercise_sets a
 using public.exercise_sets b
 where a.id > b.id
   and a.user_id = b.user_id
   and a.exercise_name = b.exercise_name
   and a.set_number = b.set_number
   and (timezone('utc', a.performed_at))::date = (timezone('utc', b.performed_at))::date;

create unique index if not exists exercise_sets_unique_daily
  on public.exercise_sets (user_id, exercise_name, set_number, ((timezone('utc', performed_at))::date));

-- 2) grocery_items: la categoría entra en la unicidad (mismo nombre puede
--    existir en dos categorías, p. ej. "Tomate" en Verdura y en Conserva).
alter table public.grocery_items
  drop constraint if exists grocery_items_user_id_week_start_name_key;

create unique index if not exists grocery_items_user_week_cat_name
  on public.grocery_items (user_id, week_start, category, name);

-- 3) profiles.schedule: horarios habituales de comidas y entreno.
alter table public.profiles
  add column if not exists schedule jsonb not null default
  '{"Desayuno":"08:00","Media mañana":"11:00","Comida":"13:30","Merienda":"17:00","Cena":"21:00","Entreno":"19:00"}'::jsonb;

-- 4) RPC de reinicio atómico (sustituye los 7 round-trips del cliente).
create or replace function public.reset_user_data()
returns public.profiles
language plpgsql
security definer set search_path = ''
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  delete from public.weight_logs      where user_id = auth.uid();
  delete from public.exercise_sets    where user_id = auth.uid();
  delete from public.food_preferences where user_id = auth.uid();
  delete from public.grocery_items    where user_id = auth.uid();
  delete from public.excluded_meals   where user_id = auth.uid();
  delete from public.meal_completions where user_id = auth.uid();
  update public.profiles set
    name = 'Usuario', sex = 'other', birth_date = null, height_cm = 170,
    current_weight_kg = 70, target_weight_kg = 70, goal = 'maintain',
    weighing_day = 0, activity_level = 'moderate',
    exercise_types = array['Gimnasio']::text[], training_days = 3,
    meal_count = 4,
    schedule = '{"Desayuno":"08:00","Media mañana":"11:00","Comida":"13:30","Merienda":"17:00","Cena":"21:00","Entreno":"19:00"}'::jsonb,
    onboarding_completed = false, updated_at = now()
  where id = auth.uid()
  returning * into result;
  return result;
end;
$$;

revoke all on function public.reset_user_data() from public, anon;
grant execute on function public.reset_user_data() to authenticated;
