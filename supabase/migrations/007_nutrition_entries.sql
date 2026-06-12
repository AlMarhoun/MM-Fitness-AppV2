-- MM Fitness App V2 - additive nutrition entries and saved meals.
-- This migration is intentionally not applied automatically.

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  client_entry_id text not null,
  nutrition_log_id uuid references public.nutrition_logs(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  entry_type text not null check (entry_type in ('meal', 'snack', 'beverage')),
  name text not null check (length(trim(name)) > 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  calculated_calories numeric not null default 0 check (calculated_calories >= 0),
  calorie_mode text not null default 'auto' check (calorie_mode in ('auto', 'manual')),
  manual_calories numeric check (manual_calories is null or manual_calories >= 0),
  entry_time time,
  notes text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, client_entry_id)
);

create table if not exists public.nutrition_saved_meals (
  id uuid primary key default gen_random_uuid(),
  client_meal_id text not null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('meal', 'snack', 'beverage')),
  name text not null check (length(trim(name)) > 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  calculated_calories numeric not null default 0 check (calculated_calories >= 0),
  calorie_mode text not null default 'auto' check (calorie_mode in ('auto', 'manual')),
  manual_calories numeric check (manual_calories is null or manual_calories >= 0),
  notes text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, client_meal_id)
);

create index if not exists nutrition_entries_athlete_date_idx
  on public.nutrition_entries (athlete_id, date desc)
  where is_deleted = false;

create index if not exists nutrition_entries_log_idx
  on public.nutrition_entries (nutrition_log_id)
  where nutrition_log_id is not null;

create index if not exists nutrition_saved_meals_athlete_name_idx
  on public.nutrition_saved_meals (athlete_id, lower(name))
  where is_deleted = false;

drop trigger if exists nutrition_entries_updated_at on public.nutrition_entries;
create trigger nutrition_entries_updated_at before update on public.nutrition_entries
for each row execute function public.set_updated_at();

drop trigger if exists nutrition_saved_meals_updated_at on public.nutrition_saved_meals;
create trigger nutrition_saved_meals_updated_at before update on public.nutrition_saved_meals
for each row execute function public.set_updated_at();

alter table public.nutrition_entries enable row level security;
alter table public.nutrition_saved_meals enable row level security;

create policy "nutrition entries select accessible" on public.nutrition_entries
for select using (
  public.can_access_athlete(athlete_id)
  and public.has_permission('nutrition.view')
);

create policy "nutrition entries insert own or assigned" on public.nutrition_entries
for insert with check (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
);

create policy "nutrition entries update own or assigned" on public.nutrition_entries
for update using (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
)
with check (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
);

create policy "nutrition saved meals select accessible" on public.nutrition_saved_meals
for select using (
  public.can_access_athlete(athlete_id)
  and public.has_permission('nutrition.view')
);

create policy "nutrition saved meals insert own or assigned" on public.nutrition_saved_meals
for insert with check (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
);

create policy "nutrition saved meals update own or assigned" on public.nutrition_saved_meals
for update using (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
)
with check (
  public.can_edit_athlete(athlete_id)
  and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned'))
);
