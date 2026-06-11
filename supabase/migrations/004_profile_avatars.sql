-- Profile identity and isolated avatar storage.

alter table public.profiles
  add column if not exists avatar_path text,
  add column if not exists bio text;

create or replace function public.can_view_user_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_user_id = auth.uid()
    or public.is_owner()
    or public.has_permission('users.view')
    or exists (
      select 1
      from public.athlete_user_assignments target_assignment
      join public.athlete_user_assignments viewer_assignment
        on viewer_assignment.athlete_id = target_assignment.athlete_id
      where target_assignment.user_id = target_user_id
        and viewer_assignment.user_id = auth.uid()
    )
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile avatars read permitted" on storage.objects;
create policy "profile avatars read permitted" on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-avatars'
  and public.can_view_user_profile((storage.foldername(name))[1]::uuid)
);

drop policy if exists "profile avatars insert own" on storage.objects;
create policy "profile avatars insert own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "profile avatars update own" on storage.objects;
create policy "profile avatars update own" on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "profile avatars delete own" on storage.objects;
create policy "profile avatars delete own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create index if not exists profiles_avatar_path_idx on public.profiles(avatar_path)
where avatar_path is not null;
