-- ── 7-day trial replaces the Free plan, and extra AI image packs ───────────
-- "free" stops being something you choose: a new account starts on a 7-day
-- "trial" with the whole product, and "free" now only means "no active plan"
-- (a trial that ended, or a cancelled subscription). Nothing is deleted when
-- that happens — the workspace just cannot send until a plan is chosen.

-- 1. Allow the new plan value. The old check was created inline on the column,
--    so find it by what it checks rather than guessing its name.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'workspaces'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%plan%' and pg_get_constraintdef(oid) ilike '%starter%'
  loop
    execute format('alter table workspaces drop constraint %I', c.conname);
  end loop;
end $$;

alter table workspaces
  add constraint workspaces_plan_check check (plan in ('free', 'trial', 'starter', 'growth', 'scale'));

alter table workspaces add column trial_ends_at timestamptz;

-- 2. Existing accounts. The system sender (the sandbox number that sends password codes) is
--    internal, so it is kept on a paid-level plan and keeps working. Everyone else on Free gets a
--    fresh 7-day trial from now.
update workspaces set plan = 'scale' where name = 'FlowTest QA' and plan = 'free';
update workspaces set plan = 'trial', trial_ends_at = now() + interval '7 days' where plan = 'free';

-- 3. Extra image packs. A purchase is one row; the balance is everything bought minus every image
--    drawn from packs (ai_image_usage.from_pack). provider_payment_id is unique so a redelivered
--    payment webhook can never credit the same purchase twice.
create table image_pack_purchases (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  images              int not null check (images > 0),
  pack                text not null,
  provider_payment_id text not null unique,
  created_at          timestamptz not null default now()
);

create index image_pack_purchases_workspace_idx on image_pack_purchases (workspace_id);

alter table image_pack_purchases enable row level security;

-- Members can see their own purchases; only the server (service role) can write them.
create policy "member can view image pack purchases" on image_pack_purchases
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

alter table ai_image_usage add column from_pack boolean not null default false;
