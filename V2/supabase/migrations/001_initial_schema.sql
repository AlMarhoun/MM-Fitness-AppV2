-- MM Fitness App - Initial Supabase schema
-- Safe for Git/version control: contains no passwords, no service-role keys, no private tokens.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'player' check (role in ('admin', 'player')),
  created_by uuid references auth.users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  assigned_admin_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  title text not null,
  start_weight numeric,
  target_weight numeric,
  total_weeks integer not null default 36,
  source text not null default 'app',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  day_index integer not null check (day_index between 0 and 6),
  day_name text not null,
  workout_name text,
  category text,
  duration_minutes integer not null default 0,
  session_goal text,
  nutrition_type text,
  calories integer,
  protein integer,
  carbs integer,
  fats integer,
  has_padel boolean not null default false,
  padel_time text,
  padel_duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_plan_id, day_index)
);

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null,
  secondary_muscle_group text,
  equipment text,
  movement_type text,
  notes text,
  coaching_cues text,
  is_system boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  exercise_library_id uuid references public.exercise_library(id),
  exercise_name text not null,
  sort_order integer not null default 0,
  target_sets integer not null default 3,
  target_reps text,
  target_weight numeric,
  intensity text,
  rest_seconds integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  workout_plan_id uuid references public.workout_plans(id) on delete set null,
  plan_day_id uuid references public.plan_days(id) on delete set null,
  local_session_id text,
  session_date date not null default current_date,
  workout_name text not null,
  category text,
  session_goal text,
  started_at timestamptz,
  finished_at timestamptz,
  duration_minutes integer,
  status text not null default 'completed' check (status in ('active', 'paused', 'completed', 'cancelled')),
  total_volume numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  exercise_library_id uuid references public.exercise_library(id),
  exercise_name text not null,
  exercise_index integer not null default 0,
  set_index integer not null default 0,
  weight numeric,
  reps integer,
  completed boolean not null default false,
  set_volume numeric generated always as (coalesce(weight, 0) * coalesce(reps, 0)) stored,
  estimated_1rm numeric generated always as (
    case
      when coalesce(weight, 0) > 0 and coalesce(reps, 0) > 0
      then round((weight * (1 + (reps::numeric / 30)))::numeric, 2)
      else null
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  exercise_library_id uuid references public.exercise_library(id),
  exercise_name text not null,
  record_type text not null check (record_type in ('heaviest_weight', 'most_reps', 'best_estimated_1rm', 'best_set_volume', 'best_exercise_volume', 'best_workout_volume')),
  value numeric not null,
  workout_session_id uuid references public.workout_sessions(id) on delete set null,
  workout_set_id uuid references public.workout_sets(id) on delete set null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (athlete_id, exercise_name, record_type)
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  log_date date not null,
  body_weight numeric,
  waist numeric,
  energy_score integer check (energy_score between 1 and 5),
  soreness_score integer check (soreness_score between 1 and 5),
  sleep_score integer check (sleep_score between 1 and 5),
  achilles_score integer check (achilles_score between 1 and 5),
  diet_adherence text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, log_date)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  log_date date not null,
  target_calories integer,
  actual_calories integer,
  target_protein integer,
  actual_protein integer,
  target_carbs integer,
  actual_carbs integer,
  target_fats integer,
  actual_fats integer,
  day_type text,
  adherence text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, log_date)
);

create table if not exists public.padel_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  session_date date not null,
  scheduled boolean not null default true,
  session_time text,
  duration_minutes integer,
  intensity integer check (intensity between 1 and 5),
  completed boolean not null default false,
  energy_before integer check (energy_before between 1 and 5),
  energy_after integer check (energy_after between 1 and 5),
  achilles_after integer check (achilles_after between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, setting_key)
);

create table if not exists public.backup_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete cascade,
  export_type text not null default 'localStorage',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  action text not null,
  table_name text,
  row_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    'player'
  )
  on conflict (id) do nothing;

  insert into public.athletes (user_id, display_name, created_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1), 'Athlete'),
    new.id
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger touch_profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger touch_athletes_updated_at before update on public.athletes for each row execute function public.touch_updated_at();
create trigger touch_workout_plans_updated_at before update on public.workout_plans for each row execute function public.touch_updated_at();
create trigger touch_plan_days_updated_at before update on public.plan_days for each row execute function public.touch_updated_at();
create trigger touch_exercise_library_updated_at before update on public.exercise_library for each row execute function public.touch_updated_at();
create trigger touch_plan_exercises_updated_at before update on public.plan_exercises for each row execute function public.touch_updated_at();
create trigger touch_workout_sessions_updated_at before update on public.workout_sessions for each row execute function public.touch_updated_at();
create trigger touch_workout_sets_updated_at before update on public.workout_sets for each row execute function public.touch_updated_at();
create trigger touch_daily_logs_updated_at before update on public.daily_logs for each row execute function public.touch_updated_at();
create trigger touch_nutrition_logs_updated_at before update on public.nutrition_logs for each row execute function public.touch_updated_at();
create trigger touch_padel_sessions_updated_at before update on public.padel_sessions for each row execute function public.touch_updated_at();
create trigger touch_app_settings_updated_at before update on public.app_settings for each row execute function public.touch_updated_at();

create or replace function public.assert_athlete_relationships()
returns trigger
language plpgsql
as $$
declare
  parent_athlete_id uuid;
begin
  if tg_table_name = 'plan_days' then
    select athlete_id into parent_athlete_id from public.workout_plans where id = new.workout_plan_id;
    if parent_athlete_id is distinct from new.athlete_id then
      raise exception 'plan_days athlete_id must match workout_plans athlete_id';
    end if;
  elsif tg_table_name = 'plan_exercises' then
    select athlete_id into parent_athlete_id from public.plan_days where id = new.plan_day_id;
    if parent_athlete_id is distinct from new.athlete_id then
      raise exception 'plan_exercises athlete_id must match plan_days athlete_id';
    end if;
  elsif tg_table_name = 'workout_sessions' then
    if new.workout_plan_id is not null then
      select athlete_id into parent_athlete_id from public.workout_plans where id = new.workout_plan_id;
      if parent_athlete_id is distinct from new.athlete_id then
        raise exception 'workout_sessions athlete_id must match workout_plans athlete_id';
      end if;
    end if;
    if new.plan_day_id is not null then
      select athlete_id into parent_athlete_id from public.plan_days where id = new.plan_day_id;
      if parent_athlete_id is distinct from new.athlete_id then
        raise exception 'workout_sessions athlete_id must match plan_days athlete_id';
      end if;
    end if;
  elsif tg_table_name = 'workout_sets' then
    select athlete_id into parent_athlete_id from public.workout_sessions where id = new.workout_session_id;
    if parent_athlete_id is distinct from new.athlete_id then
      raise exception 'workout_sets athlete_id must match workout_sessions athlete_id';
    end if;
  elsif tg_table_name = 'exercise_records' then
    if new.workout_session_id is not null then
      select athlete_id into parent_athlete_id from public.workout_sessions where id = new.workout_session_id;
      if parent_athlete_id is distinct from new.athlete_id then
        raise exception 'exercise_records athlete_id must match workout_sessions athlete_id';
      end if;
    end if;
    if new.workout_set_id is not null then
      select athlete_id into parent_athlete_id from public.workout_sets where id = new.workout_set_id;
      if parent_athlete_id is distinct from new.athlete_id then
        raise exception 'exercise_records athlete_id must match workout_sets athlete_id';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger assert_plan_days_athlete before insert or update on public.plan_days for each row execute function public.assert_athlete_relationships();
create trigger assert_plan_exercises_athlete before insert or update on public.plan_exercises for each row execute function public.assert_athlete_relationships();
create trigger assert_workout_sessions_athlete before insert or update on public.workout_sessions for each row execute function public.assert_athlete_relationships();
create trigger assert_workout_sets_athlete before insert or update on public.workout_sets for each row execute function public.assert_athlete_relationships();
create trigger assert_exercise_records_athlete before insert or update on public.exercise_records for each row execute function public.assert_athlete_relationships();

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_athletes_user_id on public.athletes(user_id);
create index if not exists idx_athletes_assigned_admin_id on public.athletes(assigned_admin_id);
create index if not exists idx_workout_plans_athlete_id on public.workout_plans(athlete_id);
create index if not exists idx_plan_days_athlete_id on public.plan_days(athlete_id);
create index if not exists idx_plan_days_workout_plan_id on public.plan_days(workout_plan_id);
create index if not exists idx_plan_exercises_athlete_id on public.plan_exercises(athlete_id);
create index if not exists idx_plan_exercises_plan_day_id on public.plan_exercises(plan_day_id);
create index if not exists idx_workout_sessions_athlete_date on public.workout_sessions(athlete_id, session_date desc);
create index if not exists idx_workout_sets_session_id on public.workout_sets(workout_session_id);
create index if not exists idx_workout_sets_athlete_exercise on public.workout_sets(athlete_id, exercise_name);
create index if not exists idx_exercise_records_athlete on public.exercise_records(athlete_id, exercise_name);
create index if not exists idx_daily_logs_athlete_date on public.daily_logs(athlete_id, log_date desc);
create index if not exists idx_nutrition_logs_athlete_date on public.nutrition_logs(athlete_id, log_date desc);
create index if not exists idx_padel_sessions_athlete_date on public.padel_sessions(athlete_id, session_date desc);
create index if not exists idx_app_settings_athlete_key on public.app_settings(athlete_id, setting_key);
create index if not exists idx_backup_exports_user_id on public.backup_exports(user_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_user_id, created_at desc);
