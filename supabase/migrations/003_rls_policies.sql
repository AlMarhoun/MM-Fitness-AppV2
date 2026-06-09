-- MM Fitness App V2
-- Row Level Security policies.

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(r.name, 'athlete')
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and p.is_active = true
  limit 1
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'owner'
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('owner', 'admin')
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select up.allowed
    from public.user_permissions up
    join public.permissions p on p.id = up.permission_id
    where up.user_id = auth.uid()
      and p.key = permission_key
    limit 1
  ), exists (
    select 1
    from public.profiles pr
    join public.roles r on r.id = pr.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where pr.id = auth.uid()
      and pr.is_active = true
      and p.key = permission_key
  ))
$$;

create or replace function public.can_access_athlete(target_athlete_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner()
    or exists (
      select 1
      from public.athletes a
      where a.id = target_athlete_id
        and a.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.athlete_user_assignments aua
      where aua.athlete_id = target_athlete_id
        and aua.user_id = auth.uid()
    )
$$;

create or replace function public.can_edit_athlete(target_athlete_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner()
    or exists (
      select 1
      from public.athletes a
      where a.id = target_athlete_id
        and a.owner_user_id = auth.uid()
    )
    or (
      public.has_permission('workouts.edit_assigned')
      and exists (
        select 1
        from public.athlete_user_assignments aua
        where aua.athlete_id = target_athlete_id
          and aua.user_id = auth.uid()
      )
    )
$$;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_user_assignments enable row level security;
alter table public.workout_plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.exercise_snapshots enable row level security;
alter table public.exercise_library enable row level security;
alter table public.exercise_records enable row level security;
alter table public.daily_logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.padel_sessions enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read own or permitted" on public.profiles
for select using (id = auth.uid() or public.has_permission('users.view'));

create policy "profiles insert self" on public.profiles
for insert with check (
  id = auth.uid()
  and (
    role_id is null
    or role_id = (select id from public.roles where name = 'athlete')
    or (lower(email) = 'm@mytamreen.com' and role_id = (select id from public.roles where name = 'owner'))
  )
);

create policy "profiles update self no role escalation" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid() and role_id = (select role_id from public.profiles where id = auth.uid()));

create policy "profiles owner manages" on public.profiles
for update using (
  public.is_owner()
  or (
    public.has_permission('users.edit')
    and role_id <> (select id from public.roles where name = 'owner')
  )
)
with check (
  public.is_owner()
  or (
    public.has_permission('users.edit')
    and role_id <> (select id from public.roles where name = 'owner')
  )
);

create policy "roles readable by signed in" on public.roles
for select using (auth.uid() is not null);

create policy "permissions readable by signed in" on public.permissions
for select using (auth.uid() is not null);

create policy "role permissions readable by signed in" on public.role_permissions
for select using (auth.uid() is not null);

create policy "user permissions readable own or permitted" on public.user_permissions
for select using (user_id = auth.uid() or public.has_permission('users.view'));

create policy "user permissions owner manages" on public.user_permissions
for all using (public.is_owner() or public.has_permission('users.change_role'))
with check (public.is_owner() or public.has_permission('users.change_role'));

create policy "athletes select accessible" on public.athletes
for select using (public.can_access_athlete(id) or public.has_permission('athletes.view_all'));

create policy "athletes insert own" on public.athletes
for insert with check (owner_user_id = auth.uid() or public.has_permission('athletes.create'));

create policy "athletes update permitted" on public.athletes
for update using (owner_user_id = auth.uid() or public.has_permission('athletes.edit'))
with check (owner_user_id = auth.uid() or public.has_permission('athletes.edit'));

create policy "athlete assignments select accessible" on public.athlete_user_assignments
for select using (user_id = auth.uid() or public.can_access_athlete(athlete_id) or public.has_permission('athletes.assign_user'));

create policy "athlete assignments manage permitted" on public.athlete_user_assignments
for all using (public.is_owner() or public.has_permission('athletes.assign_user'))
with check (public.is_owner() or public.has_permission('athletes.assign_user'));

create policy "workout plans select accessible" on public.workout_plans
for select using (public.can_access_athlete(athlete_id) and public.has_permission('plans.view'));

create policy "workout plans insert permitted" on public.workout_plans
for insert with check (public.can_edit_athlete(athlete_id) and public.has_permission('plans.create'));

create policy "workout plans update permitted" on public.workout_plans
for update using (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'))
with check (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'));

create policy "plan days select accessible" on public.plan_days
for select using (public.can_access_athlete(athlete_id) and public.has_permission('plans.view'));

create policy "plan days write permitted" on public.plan_days
for all using (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'))
with check (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'));

create policy "plan exercises select accessible" on public.plan_exercises
for select using (public.can_access_athlete(athlete_id) and public.has_permission('plans.view'));

create policy "plan exercises write permitted" on public.plan_exercises
for all using (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'))
with check (public.can_edit_athlete(athlete_id) and public.has_permission('plans.edit'));

create policy "workout sessions select accessible" on public.workout_sessions
for select using (public.can_access_athlete(athlete_id) and public.has_permission('workouts.view'));

create policy "workout sessions insert own or assigned" on public.workout_sessions
for insert with check (public.can_edit_athlete(athlete_id) and public.has_permission('workouts.create'));

create policy "workout sessions update own or assigned" on public.workout_sessions
for update using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')));

create policy "workout sets select accessible" on public.workout_sets
for select using (public.can_access_athlete(athlete_id) and public.has_permission('workouts.view'));

create policy "workout sets write own or assigned" on public.workout_sets
for all using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')));

create policy "exercise snapshots select accessible" on public.exercise_snapshots
for select using (public.can_access_athlete(athlete_id) and public.has_permission('workouts.view'));

create policy "exercise snapshots write own or assigned" on public.exercise_snapshots
for all using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('workouts.edit_assigned')));

create policy "exercise library select accessible" on public.exercise_library
for select using (athlete_id is null or public.can_access_athlete(athlete_id));

create policy "exercise library write permitted" on public.exercise_library
for all using (athlete_id is null or public.can_edit_athlete(athlete_id))
with check (athlete_id is null or public.can_edit_athlete(athlete_id));

create policy "exercise records select accessible" on public.exercise_records
for select using (public.can_access_athlete(athlete_id) and public.has_permission('performance.view'));

create policy "exercise records write own or assigned" on public.exercise_records
for all using (public.can_edit_athlete(athlete_id))
with check (public.can_edit_athlete(athlete_id));

create policy "daily logs select accessible" on public.daily_logs
for select using (public.can_access_athlete(athlete_id) and public.has_permission('daily_logs.view'));

create policy "daily logs write own or assigned" on public.daily_logs
for all using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('daily_logs.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('daily_logs.edit_assigned')));

create policy "nutrition logs select accessible" on public.nutrition_logs
for select using (public.can_access_athlete(athlete_id) and public.has_permission('nutrition.view'));

create policy "nutrition logs write own or assigned" on public.nutrition_logs
for all using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('nutrition.edit_assigned')));

create policy "padel sessions select accessible" on public.padel_sessions
for select using (public.can_access_athlete(athlete_id) and public.has_permission('padel.view'));

create policy "padel sessions write own or assigned" on public.padel_sessions
for all using (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('padel.edit_assigned')))
with check (public.can_edit_athlete(athlete_id) and (user_id = auth.uid() or public.has_permission('padel.edit_assigned')));

create policy "app settings select own accessible" on public.app_settings
for select using (user_id = auth.uid() or public.can_access_athlete(athlete_id));

create policy "app settings write own accessible" on public.app_settings
for all using (user_id = auth.uid() or public.can_edit_athlete(athlete_id))
with check (user_id = auth.uid() or public.can_edit_athlete(athlete_id));

create policy "audit logs owner or permitted" on public.audit_logs
for select using (public.is_owner() or public.has_permission('audit_logs.view'));

create policy "audit logs insert signed in" on public.audit_logs
for insert with check (actor_user_id = auth.uid());
