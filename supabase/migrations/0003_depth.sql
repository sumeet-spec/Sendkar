-- Sendkar v3: the depth pass — compliance (24h session window + opt-out),
-- real Meta template submission (structured components, not a manual
-- record), contact tags/segmentation, reliable webhook delivery with a
-- real log + retry trail, and canned responses for the team inbox.

-- ── Compliance: 24h customer-service window + opt-out ─────────────────────
-- Meta requires free-text replies only within 24h of the customer's last
-- inbound message, and a documented opt-out path for marketing sends.
-- Both are enforced in code against these columns, not just assumed.

alter table contacts
  add column session_expires_at timestamptz,
  add column opted_out boolean not null default false,
  add column tags text[] not null default array[]::text[];

create index contacts_tags_idx on contacts using gin (tags);
create index contacts_opted_out_idx on contacts (workspace_id, opted_out);

-- A campaign can optionally narrow its audience to one tag on top of the
-- template's language, e.g. "Hindi sellers tagged vip" instead of every
-- Hindi contact.
alter table campaigns add column segment_tag text;

-- ── Real template submission to Meta — structured components instead of a
-- name you typed in by hand. ──────────────────────────────────────────────

alter table templates
  add column header_type text check (header_type in ('none', 'text', 'image')),
  add column header_text text,
  add column body_text text,
  add column footer_text text,
  add column buttons jsonb,
  add column meta_response jsonb,
  add column rejection_reason text;

-- ── Webhook delivery reliability — a real log with retry attempts, not
-- fire-and-forget. ─────────────────────────────────────────────────────────

create table webhook_deliveries (
  id             uuid primary key default gen_random_uuid(),
  webhook_id     uuid not null references outbound_webhooks(id) on delete cascade,
  event          text not null,
  payload        jsonb not null,
  status         text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  attempts       int not null default 0,
  last_error     text,
  response_status int,
  created_at     timestamptz not null default now(),
  delivered_at   timestamptz
);

create index webhook_deliveries_webhook_idx on webhook_deliveries (webhook_id, created_at desc);

alter table webhook_deliveries enable row level security;
create policy "member can view webhook deliveries" on webhook_deliveries
  for select using (webhook_id in (
    select id from outbound_webhooks where workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  ));

-- ── Canned responses — quick-insert replies for the team inbox ────────────

create table canned_responses (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  shortcut     text not null,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index canned_responses_workspace_idx on canned_responses (workspace_id);

alter table canned_responses enable row level security;
create policy "member can manage canned responses" on canned_responses
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
