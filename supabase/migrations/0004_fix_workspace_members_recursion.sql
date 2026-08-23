-- CRITICAL FIX — run this immediately, before anything else tonight's
-- session touched. The RLS policy on workspace_members has been
-- self-referential since 0001_init.sql (day one): evaluating it requires
-- querying workspace_members again, which requires evaluating the same
-- policy again, forever. Postgres raises "infinite recursion detected in
-- policy for relation workspace_members" (error 42P17) for ANY real
-- session-scoped query against workspace_members — and therefore against
-- EVERY other table too, since their own RLS policies all subquery
-- workspace_members for tenant scoping (contacts, campaigns, templates,
-- messages, flows, products, everything).
--
-- Why this went unnoticed until tonight: every prior verification in this
-- project — signup, workspace/membership row checks — was done with the
-- service-role key, which bypasses RLS entirely. Tonight's actual
-- browser-driven login+dashboard test is the first time a REAL end-user
-- session ever exercised this policy for real, and it failed immediately
-- and consistently (confirmed directly against Supabase's REST API,
-- independent of any application code).
--
-- Fix: a SECURITY DEFINER function runs with the privileges of its owner
-- (the migration-running role, which owns the tables and therefore
-- bypasses RLS on them) — its internal query never re-triggers the
-- calling policy, breaking the recursive cycle. This is the standard fix
-- for this exact class of Postgres RLS bug.

create or replace function public.user_workspace_ids(uid uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select workspace_id from workspace_members where user_id = uid;
$$;

drop policy if exists "member can read own membership rows" on workspace_members;
create policy "member can read own membership rows" on workspace_members
  for select using (user_id = auth.uid() or workspace_id in (select user_workspace_ids(auth.uid())));
