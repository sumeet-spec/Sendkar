-- ── Brand kit ─────────────────────────────────────────────────────────────
-- One brand kit per workspace: the shop's name in each language, logo, colours,
-- and contact line. The card maker reads it so "make a Diwali card" comes out
-- with the shop's own name, logo and colours — no designer needed.
--
-- Names are kept per language because a Gujarati shopkeeper wants the Gujarati
-- name on a Gujarati card. Anything missing falls back to `name`.

create table brand_kits (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  name         text not null default '',
  names        jsonb not null default '{}'::jsonb,   -- { "hi": "शर्मा ट्रेडर्स", "gu": "…" }
  tagline      text not null default '',
  logo_url     text,
  primary_color text not null default '#0f766e',
  accent_color  text not null default '#f59e0b',
  phone        text not null default '',
  address      text not null default '',
  website      text not null default '',
  updated_at   timestamptz not null default now()
);

alter table brand_kits enable row level security;

create policy "member can view brand kit" on brand_kits
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
create policy "member can write brand kit" on brand_kits
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

grant select, insert, update, delete on brand_kits to authenticated;
grant all on brand_kits to service_role;

-- Public bucket for logos (PNG/JPG/WebP, max 1 MB). Cards themselves go in the
-- existing `campaign-images` bucket so WhatsApp can fetch them by URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-assets', 'brand-assets', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
