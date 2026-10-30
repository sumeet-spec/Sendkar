-- ── Customer care: dates, credit, notes, tags, and the switches for automatic messages ──

alter table contacts add column if not exists birthday date;
alter table contacts add column if not exists anniversary date;
alter table contacts add column if not exists credit_limit numeric(12,2) check (credit_limit is null or credit_limit >= 0);
-- Tags the system works out from what a customer does (regular, lapsed, owes money...). Kept apart from the
-- tags a shop types, so a recalculation never touches those.
alter table contacts add column if not exists auto_tags text[] not null default '{}';
-- The year a wish was last sent, so a birthday is wished once a year even if the daily job runs twice.
alter table contacts add column if not exists birthday_wished_year int;
alter table contacts add column if not exists anniversary_wished_year int;
-- When a reorder nudge last went out, so the same customer is not nudged again until they buy again.
alter table contacts add column if not exists last_reorder_nudge_at timestamptz;

create index if not exists contacts_auto_tags_idx on contacts using gin (auto_tags);

-- A running list of notes and follow-up tasks for each customer.
create table if not exists contact_notes (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id   uuid not null references contacts(id) on delete cascade,
  kind         text not null default 'note' check (kind in ('note', 'task')),
  body         text not null,
  due_date     date,                              -- for a task: the day to follow up
  done         boolean not null default false,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);
create index if not exists contact_notes_contact_idx on contact_notes (contact_id, created_at desc);
create index if not exists contact_notes_due_idx on contact_notes (workspace_id, due_date) where kind = 'task' and done = false;

alter table contact_notes enable row level security;
drop policy if exists "member can manage contact notes" on contact_notes;
create policy "member can manage contact notes" on contact_notes
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
grant select, insert, update, delete on contact_notes to authenticated;
grant all on contact_notes to service_role;

-- Switches for the messages the system sends by itself. Off until the shop turns them on.
alter table workspaces add column if not exists birthday_wishes_enabled boolean not null default false;
alter table workspaces add column if not exists reorder_nudges_enabled boolean not null default false;
