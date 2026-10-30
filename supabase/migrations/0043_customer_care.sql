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

-- Notes already exist (written from the inbox). They now also hold follow-up tasks with a day to do them.
alter table contact_notes add column if not exists kind text not null default 'note';
alter table contact_notes drop constraint if exists contact_notes_kind_check;
alter table contact_notes add constraint contact_notes_kind_check check (kind in ('note', 'task'));
alter table contact_notes add column if not exists due_date date;           -- for a task: the day to follow up
alter table contact_notes add column if not exists done boolean not null default false;
create index if not exists contact_notes_due_idx on contact_notes (workspace_id, due_date) where kind = 'task' and done = false;
grant select, insert, update, delete on contact_notes to authenticated;
grant all on contact_notes to service_role;

-- Switches for the messages the system sends by itself. Off until the shop turns them on.
alter table workspaces add column if not exists birthday_wishes_enabled boolean not null default false;
alter table workspaces add column if not exists reorder_nudges_enabled boolean not null default false;
