-- MM Fitness App - Row Level Security policies
-- Safe for Git/version control: contains no passwords, no service-role keys, no private tokens.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

create or replace function public.can_access_athlete(target_athlete_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.athletes a
    where a.id = target_athlete_id
      and a.is_active = true
      and (
        a.user_id = auth.uid()
        or public.is_admin()
        or a.assigned_admin_id = auth.uid()
      )
  );
$$;

create or replace function public.owns_athlete(target_athlete_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.athletes a
    where a.id = target_athlete_id
      and a.user_id = auth.uid()
      and a.is_active = true
  );
$$;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.id <> auth.uid() then
    raise exception 'Users can only update their own profile';
  end if;

  new.role := old.role;
  new.created_by := old.created_by;
  new.is_active := old.is_active;
  new.email := old.email;
  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_escalation_trigger on public.profiles;
create trigger prevent_profile_privilege_escalation_trigger
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

alter table public.profiles enable row level security;
alter table public.athletes enable row level security;
alter table public.workout_plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.exercise_library enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.exercise_records enable row level security;
alter table public.daily_logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.padel_sessions enable row level security;
alter table public.app_settings enable row level security;
alter table public.backup_exports enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self_player" on public.profiles
for insert with check (id = auth.uid() and role = 'player');

create policy "profiles_update_own_safe_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin_only" on public.profiles
for delete using (public.is_admin());

create policy "athletes_select_own_assigned_or_admin" on public.athletes
for select using (user_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin());

create policy "athletes_insert_self_or_admin" on public.athletes
for insert with check (user_id = auth.uid() or public.is_admin());

create policy "athletes_update_own_assigned_or_admin" on public.athletes
for update using (user_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin());

create policy "athletes_delete_admin_only" on public.athletes
for delete using (public.is_admin());

create policy "workout_plans_select_accessible_athlete" on public.workout_plans
for select using (public.can_access_athlete(athlete_id));

create policy "workout_plans_insert_accessible_athlete" on public.workout_plans
for insert with check (public.can_access_athlete(athlete_id));

create policy "workout_plans_update_accessible_athlete" on public.workout_plans
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "workout_plans_delete_accessible_athlete" on public.workout_plans
for delete using (public.can_access_athlete(athlete_id));

create policy "plan_days_select_accessible_athlete" on public.plan_days
for select using (public.can_access_athlete(athlete_id));

create policy "plan_days_insert_accessible_athlete" on public.plan_days
for insert with check (public.can_access_athlete(athlete_id));

create policy "plan_days_update_accessible_athlete" on public.plan_days
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "plan_days_delete_accessible_athlete" on public.plan_days
for delete using (public.can_access_athlete(athlete_id));

create policy "plan_exercises_select_accessible_athlete" on public.plan_exercises
for select using (public.can_access_athlete(athlete_id));

create policy "plan_exercises_insert_accessible_athlete" on public.plan_exercises
for insert with check (public.can_access_athlete(athlete_id));

create policy "plan_exercises_update_accessible_athlete" on public.plan_exercises
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "plan_exercises_delete_accessible_athlete" on public.plan_exercises
for delete using (public.can_access_athlete(athlete_id));

create policy "exercise_library_select_authenticated" on public.exercise_library
for select using (auth.uid() is not null);

create policy "exercise_library_insert_admin" on public.exercise_library
for insert with check (public.is_admin());

create policy "exercise_library_update_admin" on public.exercise_library
for update using (public.is_admin()) with check (public.is_admin());

create policy "exercise_library_delete_admin" on public.exercise_library
for delete using (public.is_admin());

create policy "workout_sessions_select_accessible_athlete" on public.workout_sessions
for select using (public.can_access_athlete(athlete_id));

create policy "workout_sessions_insert_accessible_athlete" on public.workout_sessions
for insert with check (public.can_access_athlete(athlete_id));

create policy "workout_sessions_update_accessible_athlete" on public.workout_sessions
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "workout_sessions_delete_accessible_athlete" on public.workout_sessions
for delete using (public.can_access_athlete(athlete_id));

create policy "workout_sets_select_accessible_athlete" on public.workout_sets
for select using (public.can_access_athlete(athlete_id));

create policy "workout_sets_insert_accessible_athlete" on public.workout_sets
for insert with check (public.can_access_athlete(athlete_id));

create policy "workout_sets_update_accessible_athlete" on public.workout_sets
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "workout_sets_delete_accessible_athlete" on public.workout_sets
for delete using (public.can_access_athlete(athlete_id));

create policy "exercise_records_select_accessible_athlete" on public.exercise_records
for select using (public.can_access_athlete(athlete_id));

create policy "exercise_records_insert_accessible_athlete" on public.exercise_records
for insert with check (public.can_access_athlete(athlete_id));

create policy "exercise_records_update_accessible_athlete" on public.exercise_records
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "exercise_records_delete_accessible_athlete" on public.exercise_records
for delete using (public.can_access_athlete(athlete_id));

create policy "daily_logs_select_accessible_athlete" on public.daily_logs
for select using (public.can_access_athlete(athlete_id));

create policy "daily_logs_insert_accessible_athlete" on public.daily_logs
for insert with check (public.can_access_athlete(athlete_id));

create policy "daily_logs_update_accessible_athlete" on public.daily_logs
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "daily_logs_delete_accessible_athlete" on public.daily_logs
for delete using (public.can_access_athlete(athlete_id));

create policy "nutrition_logs_select_accessible_athlete" on public.nutrition_logs
for select using (public.can_access_athlete(athlete_id));

create policy "nutrition_logs_insert_accessible_athlete" on public.nutrition_logs
for insert with check (public.can_access_athlete(athlete_id));

create policy "nutrition_logs_update_accessible_athlete" on public.nutrition_logs
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "nutrition_logs_delete_accessible_athlete" on public.nutrition_logs
for delete using (public.can_access_athlete(athlete_id));

create policy "padel_sessions_select_accessible_athlete" on public.padel_sessions
for select using (public.can_access_athlete(athlete_id));

create policy "padel_sessions_insert_accessible_athlete" on public.padel_sessions
for insert with check (public.can_access_athlete(athlete_id));

create policy "padel_sessions_update_accessible_athlete" on public.padel_sessions
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "padel_sessions_delete_accessible_athlete" on public.padel_sessions
for delete using (public.can_access_athlete(athlete_id));

create policy "app_settings_select_accessible_athlete" on public.app_settings
for select using (public.can_access_athlete(athlete_id));

create policy "app_settings_insert_accessible_athlete" on public.app_settings
for insert with check (public.can_access_athlete(athlete_id));

create policy "app_settings_update_accessible_athlete" on public.app_settings
for update using (public.can_access_athlete(athlete_id))
with check (public.can_access_athlete(athlete_id));

create policy "app_settings_delete_accessible_athlete" on public.app_settings
for delete using (public.can_access_athlete(athlete_id));

create policy "backup_exports_select_own_or_admin" on public.backup_exports
for select using (user_id = auth.uid() or public.is_admin());

create policy "backup_exports_insert_own" on public.backup_exports
for insert with check (user_id = auth.uid());

create policy "backup_exports_delete_own_or_admin" on public.backup_exports
for delete using (user_id = auth.uid() or public.is_admin());

create policy "audit_logs_select_admin_only" on public.audit_logs
for select using (public.is_admin());

create policy "audit_logs_insert_authenticated" on public.audit_logs
for insert with check (actor_user_id = auth.uid() or public.is_admin());

