-- MM Fitness App V2
-- Roles, permissions, defaults, and owner bootstrap.

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  allowed boolean not null default true,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (user_id, permission_id)
);

insert into public.roles (name, description, is_system_role)
values
  ('owner', 'Full access to everything. Cannot be removed by admins.', true),
  ('admin', 'Can manage athletes and viewers when owner grants permission.', true),
  ('athlete', 'Can view and edit their own training data.', true),
  ('viewer', 'Read-only access to assigned athlete data.', true)
on conflict (name) do update
set description = excluded.description,
    is_system_role = excluded.is_system_role;

insert into public.permissions (key, description, category)
values
  ('users.view', 'View users', 'User Management'),
  ('users.invite', 'Invite users', 'User Management'),
  ('users.create', 'Create users through trusted backend', 'User Management'),
  ('users.edit', 'Edit user profiles', 'User Management'),
  ('users.deactivate', 'Deactivate users', 'User Management'),
  ('users.change_role', 'Change user role', 'User Management'),
  ('athletes.view_all', 'View all athletes', 'Athlete Management'),
  ('athletes.view_assigned', 'View assigned athletes', 'Athlete Management'),
  ('athletes.create', 'Create athlete profiles', 'Athlete Management'),
  ('athletes.edit', 'Edit athlete profiles', 'Athlete Management'),
  ('athletes.deactivate', 'Deactivate athlete profiles', 'Athlete Management'),
  ('athletes.assign_user', 'Assign users to athletes', 'Athlete Management'),
  ('plans.view', 'View workout plans', 'Workout Plan'),
  ('plans.create', 'Create workout plans', 'Workout Plan'),
  ('plans.edit', 'Edit workout plans', 'Workout Plan'),
  ('plans.delete', 'Delete workout plans', 'Workout Plan'),
  ('plans.assign', 'Assign plans', 'Workout Plan'),
  ('workouts.view', 'View workouts', 'Workout Logging'),
  ('workouts.create', 'Create workouts', 'Workout Logging'),
  ('workouts.edit_own', 'Edit own workouts', 'Workout Logging'),
  ('workouts.edit_assigned', 'Edit assigned workouts', 'Workout Logging'),
  ('workouts.delete_own', 'Delete own workouts', 'Workout Logging'),
  ('workouts.delete_assigned', 'Delete assigned workouts', 'Workout Logging'),
  ('performance.view', 'View own performance', 'Performance'),
  ('performance.view_all', 'View all accessible performance', 'Performance'),
  ('performance.export', 'Export performance data', 'Performance'),
  ('daily_logs.view', 'View daily logs', 'Daily Logs'),
  ('daily_logs.create', 'Create daily logs', 'Daily Logs'),
  ('daily_logs.edit_own', 'Edit own daily logs', 'Daily Logs'),
  ('daily_logs.edit_assigned', 'Edit assigned daily logs', 'Daily Logs'),
  ('nutrition.view', 'View nutrition logs', 'Nutrition'),
  ('nutrition.create', 'Create nutrition logs', 'Nutrition'),
  ('nutrition.edit_own', 'Edit own nutrition logs', 'Nutrition'),
  ('nutrition.edit_assigned', 'Edit assigned nutrition logs', 'Nutrition'),
  ('padel.view', 'View padel sessions', 'Padel'),
  ('padel.create', 'Create padel sessions', 'Padel'),
  ('padel.edit_own', 'Edit own padel sessions', 'Padel'),
  ('padel.edit_assigned', 'Edit assigned padel sessions', 'Padel'),
  ('admin_panel.access', 'Access admin panel', 'Admin'),
  ('settings.view', 'View settings', 'Admin'),
  ('settings.edit', 'Edit settings', 'Admin'),
  ('audit_logs.view', 'View audit logs', 'Admin')
on conflict (key) do update
set description = excluded.description,
    category = excluded.category;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'athletes.view_assigned',
  'plans.view',
  'plans.edit',
  'workouts.view',
  'workouts.create',
  'workouts.edit_own',
  'workouts.delete_own',
  'performance.view',
  'daily_logs.view',
  'daily_logs.create',
  'daily_logs.edit_own',
  'nutrition.view',
  'nutrition.create',
  'nutrition.edit_own',
  'padel.view',
  'padel.create',
  'padel.edit_own',
  'settings.view'
)
where r.name = 'athlete'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'athletes.view_assigned',
  'plans.view',
  'workouts.view',
  'performance.view',
  'daily_logs.view',
  'nutrition.view',
  'padel.view',
  'settings.view'
)
where r.name = 'viewer'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'users.view',
  'athletes.view_assigned',
  'athletes.edit',
  'athletes.assign_user',
  'plans.view',
  'plans.create',
  'plans.edit',
  'plans.assign',
  'workouts.view',
  'workouts.create',
  'workouts.edit_own',
  'workouts.edit_assigned',
  'performance.view',
  'performance.view_all',
  'daily_logs.view',
  'daily_logs.create',
  'daily_logs.edit_own',
  'daily_logs.edit_assigned',
  'nutrition.view',
  'nutrition.create',
  'nutrition.edit_own',
  'nutrition.edit_assigned',
  'padel.view',
  'padel.create',
  'padel.edit_own',
  'padel.edit_assigned',
  'admin_panel.access',
  'settings.view'
)
where r.name = 'admin'
on conflict do nothing;

-- Bootstrap Mohammad as owner when the auth user exists.
-- This does not create an auth user; it only assigns role after signup/invite exists.
update public.profiles p
set role_id = r.id,
    is_active = true
from public.roles r
where lower(p.email) = 'm@mytamreen.com'
  and r.name = 'owner';

create index if not exists permissions_key_idx on public.permissions(key);
create index if not exists user_permissions_user_idx on public.user_permissions(user_id);
