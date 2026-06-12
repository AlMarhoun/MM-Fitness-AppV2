-- Additive profile-photo framing metadata. Existing avatars remain centered at 1x.

alter table public.profiles
  add column if not exists avatar_position_x numeric not null default 50,
  add column if not exists avatar_position_y numeric not null default 50,
  add column if not exists avatar_zoom numeric not null default 1;

alter table public.profiles
  drop constraint if exists profiles_avatar_position_x_range,
  add constraint profiles_avatar_position_x_range check (avatar_position_x between 0 and 100),
  drop constraint if exists profiles_avatar_position_y_range,
  add constraint profiles_avatar_position_y_range check (avatar_position_y between 0 and 100),
  drop constraint if exists profiles_avatar_zoom_range,
  add constraint profiles_avatar_zoom_range check (avatar_zoom between 1 and 3);
