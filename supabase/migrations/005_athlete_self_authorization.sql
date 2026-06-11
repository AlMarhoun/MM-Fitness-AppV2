-- Correct athlete self-access while preserving owner/admin isolation.

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
    or exists (
      select 1
      from public.athlete_user_assignments aua
      where aua.athlete_id = target_athlete_id
        and aua.user_id = auth.uid()
        and aua.relationship_type = 'self'
    )
    or (
      public.has_permission('workouts.edit_assigned')
      and exists (
        select 1
        from public.athlete_user_assignments aua
        where aua.athlete_id = target_athlete_id
          and aua.user_id = auth.uid()
          and aua.relationship_type in ('owner', 'admin', 'coach')
      )
    )
$$;
