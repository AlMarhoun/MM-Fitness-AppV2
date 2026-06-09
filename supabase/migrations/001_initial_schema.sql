-- MM Fitness App V2
-- Initial normalized cloud schema.
-- Apply in Supabase SQL editor or with Supabase CLI after linking the project.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('owner', 'admin', 'athlete', 'viewer')),
  description text not null,
  is_system_role boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role_id uuid references public.roles(id),
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_user_assignments (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_type text not null default 'self' check (relationship_type in ('self', 'owner', 'admin', 'viewer', 'coach')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (athlete_id, user_id)
);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_weight numeric,
  target_weight numeric,
  weeks integer not null default 36,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_index integer not null check (day_index between 0 and 6),
  day_name text not null,
  workout_name text,
  category text,
  duration integer not null default 0,
  goal text,
  nutrition_type text,
  calories integer,
  protein integer,
  carbs integer,
  fats integer,
  has_padel boolean not null default false,
  padel_time text,
  padel_duration integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, day_index)
);

create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_index integer not null,
  exercise_name text not null,
  sets integer,
  reps text,
  weight_target text,
  intensity text,
  rest_seconds integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_day_id, exercise_index)
);

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  secondary_muscle_group text,
  equipment text,
  movement_type text,
  notes text,
  coaching_cues text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  client_session_id text unique,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.workout_plans(id) on delete set null,
  date date not null,
  day_index integer,
  workout_name text not null,
  category text,
  duration_minutes integer,
  started_at timestamptz,
  completed_at timestamptz,
  completed boolean not null default true,
  total_volume numeric not null default 0,
  completed_sets integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_snapshots (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_index integer not null,
  exercise_id uuid,
  exercise_name text not null,
  sets_prescription integer,
  reps_prescription text,
  intensity text,
  rest_seconds integer,
  notes text,
  completed_sets integer not null default 0,
  total_volume numeric not null default 0,
  best_estimated_1rm numeric,
  created_at timestamptz not null default now(),
  unique (workout_session_id, exercise_index)
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_snapshot_id uuid references public.exercise_snapshots(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_index integer not null,
  set_index integer not null,
  weight numeric,
  reps integer,
  completed boolean not null default false,
  set_volume numeric,
  estimated_1rm numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_session_id, exercise_index, set_index)
);

create table if not exists public.exercise_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  record_type text not null check (record_type in ('best_weight', 'best_reps', 'estimated_1rm', 'set_volume', 'exercise_volume', 'workout_volume')),
  value numeric not null,
  workout_session_id uuid references public.workout_sessions(id) on delete set null,
  workout_set_id uuid references public.workout_sets(id) on delete set null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  body_weight numeric,
  waist numeric,
  energy_score integer,
  soreness_score integer,
  sleep_score integer,
  achilles_score integer,
  diet_adherence text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, date)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  target_calories integer,
  actual_calories integer,
  target_protein integer,
  actual_protein integer,
  target_carbs integer,
  actual_carbs integer,
  target_fats integer,
  actual_fats integer,
  adhered text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, date)
);

create table if not exists public.padel_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  scheduled boolean not null default false,
  time text,
  duration integer,
  intensity text,
  completed boolean not null default false,
  energy_before integer,
  energy_after integer,
  achilles_after integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, date)
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_id_idx on public.profiles(role_id);
create index if not exists athletes_owner_user_id_idx on public.athletes(owner_user_id);
create index if not exists athlete_assignments_user_id_idx on public.athlete_user_assignments(user_id);
create index if not exists workout_plans_athlete_id_idx on public.workout_plans(athlete_id);
create index if not exists plan_days_plan_id_idx on public.plan_days(plan_id);
create index if not exists plan_exercises_plan_day_id_idx on public.plan_exercises(plan_day_id);
create index if not exists workout_sessions_athlete_date_idx on public.workout_sessions(athlete_id, date desc);
create index if not exists workout_sets_session_idx on public.workout_sets(workout_session_id);
create index if not exists exercise_snapshots_session_idx on public.exercise_snapshots(workout_session_id);
create index if not exists exercise_records_athlete_name_idx on public.exercise_records(athlete_id, exercise_name, achieved_at desc);
create index if not exists daily_logs_athlete_date_idx on public.daily_logs(athlete_id, date desc);
create index if not exists nutrition_logs_athlete_date_idx on public.nutrition_logs(athlete_id, date desc);
create index if not exists padel_sessions_athlete_date_idx on public.padel_sessions(athlete_id, date desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);
create unique index if not exists app_settings_unique_scope_idx
  on public.app_settings (athlete_id, user_id, setting_key);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger athletes_updated_at before update on public.athletes for each row execute function public.set_updated_at();
create trigger workout_plans_updated_at before update on public.workout_plans for each row execute function public.set_updated_at();
create trigger plan_days_updated_at before update on public.plan_days for each row execute function public.set_updated_at();
create trigger plan_exercises_updated_at before update on public.plan_exercises for each row execute function public.set_updated_at();
create trigger exercise_library_updated_at before update on public.exercise_library for each row execute function public.set_updated_at();
create trigger workout_sessions_updated_at before update on public.workout_sessions for each row execute function public.set_updated_at();
create trigger workout_sets_updated_at before update on public.workout_sets for each row execute function public.set_updated_at();
create trigger daily_logs_updated_at before update on public.daily_logs for each row execute function public.set_updated_at();
create trigger nutrition_logs_updated_at before update on public.nutrition_logs for each row execute function public.set_updated_at();
create trigger padel_sessions_updated_at before update on public.padel_sessions for each row execute function public.set_updated_at();
create trigger app_settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();
