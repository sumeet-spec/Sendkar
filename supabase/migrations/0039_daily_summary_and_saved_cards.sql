-- ── Owner daily summary ───────────────────────────────────────────────────
-- Every morning the owner can get a short WhatsApp: yesterday's messages, replies and new customers.
-- daily_summary is the owner's on/off switch; daily_summary_sent_on stops the same day being sent twice.
alter table workspaces add column if not exists daily_summary boolean not null default true;
alter table workspaces add column if not exists daily_summary_sent_on date;

-- ── Saved cards ───────────────────────────────────────────────────────────
-- Every card a shop makes is kept, so last year's Diwali card can be sent again in one click.
create table if not exists saved_cards (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title        text not null default '',
  occasion     text,
  design_id    text,
  url          text not null,                 -- the card (first language when there are several)
  urls         jsonb,                          -- { "hi": url, "gu": url } for one card per language
  created_at   timestamptz not null default now()
);
create index if not exists saved_cards_workspace_idx on saved_cards (workspace_id, created_at desc);

alter table saved_cards enable row level security;
create policy "member can view saved cards" on saved_cards
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
create policy "member can delete saved cards" on saved_cards
  for delete using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
grant select, delete on saved_cards to authenticated;
grant all on saved_cards to service_role;
