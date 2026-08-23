-- Sendkar v1 schema.
-- Multi-tenant from day one (workspace_id on everything) even though there's
-- only one real workspace (Instastarz) at launch — retrofitting tenant
-- isolation later is expensive; building it in now is nearly free.

create extension if not exists "pgcrypto";

-- ── workspaces ────────────────────────────────────────────────────────────────

create table workspaces (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  owner_id               uuid not null references auth.users(id) on delete restrict,
  whatsapp_phone_number_id text,
  whatsapp_waba_id       text,
  whatsapp_access_token  text,
  -- Meta's messaging-tier ladder: 250 -> 1000 -> 10000 -> 100000 unique
  -- recipients/24h, rising only as the number keeps a good quality rating.
  messaging_tier         int not null default 250,
  daily_send_count       int not null default 0,
  daily_reset_at         timestamptz not null default (date_trunc('day', now()) + interval '1 day'),
  created_at             timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner', 'member')),
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Auto-add the creator as owner-member the moment a workspace is created —
-- this is what makes the signup flow "just insert a workspace row" instead
-- of two round-trips the client has to get right every time.
create function handle_new_workspace()
returns trigger as $$
begin
  insert into workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created
  after insert on workspaces
  for each row execute function handle_new_workspace();

-- ── contacts ───────────────────────────────────────────────────────────────────

create table contacts (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  phone        text not null, -- E.164-ish, digits only incl. country code (e.g. 919408305599)
  name         text,
  email        text,
  language     text, -- 'hi' | 'mr' | 'ta' | 'te' | 'kn' | ...
  -- Provenance stays visible in the data, not just in a memory/chat log —
  -- matters for judging risk before a send, not just at import time.
  source       text not null default 'manual',
  created_at   timestamptz not null default now(),
  unique (workspace_id, phone)
);

create index contacts_workspace_idx on contacts (workspace_id);

-- ── templates ──────────────────────────────────────────────────────────────────

create table templates (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references workspaces(id) on delete cascade,
  name               text not null,
  language           text not null,
  meta_template_name text not null, -- exact name registered with Meta
  category           text not null default 'MARKETING' check (category in ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  body_preview       text,
  created_at         timestamptz not null default now()
);

create index templates_workspace_idx on templates (workspace_id);

-- ── campaigns ──────────────────────────────────────────────────────────────────

create table campaigns (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name         text not null,
  template_id  uuid not null references templates(id),
  status       text not null default 'draft' check (status in ('draft', 'sending', 'completed', 'paused')),
  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  completed_at timestamptz
);

create index campaigns_workspace_idx on campaigns (workspace_id);
create index campaigns_status_idx on campaigns (status);

-- ── campaign_recipients ────────────────────────────────────────────────────────

create table campaign_recipients (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references campaigns(id) on delete cascade,
  contact_id     uuid not null references contacts(id) on delete cascade,
  status         text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  meta_message_id text unique,
  error          text,
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index campaign_recipients_campaign_idx on campaign_recipients (campaign_id);
create index campaign_recipients_status_idx on campaign_recipients (campaign_id, status);
create index campaign_recipients_meta_id_idx on campaign_recipients (meta_message_id);

-- ── messages (unified per-contact timeline the inbox reads from) ─────────────

create table messages (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  contact_id     uuid not null references contacts(id) on delete cascade,
  direction      text not null check (direction in ('inbound', 'outbound')),
  body           text,
  meta_message_id text,
  status         text not null default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
  created_at     timestamptz not null default now()
);

create index messages_workspace_idx on messages (workspace_id);
create index messages_contact_idx on messages (contact_id, created_at);
create index messages_meta_id_idx on messages (meta_message_id);

-- ── webhook_events (raw payload log, same posture as Continuum's SendEvent) ──

create table webhook_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete set null,
  event_type   text not null,
  raw_payload  jsonb not null,
  created_at   timestamptz not null default now()
);

create index webhook_events_workspace_idx on webhook_events (workspace_id);

-- ── Row Level Security ─────────────────────────────────────────────────────────
-- Every table's access rule is the same shape: "is this row's workspace one
-- I'm a member of." The webhook/cron routes use the service-role key and
-- bypass RLS entirely — they have no user session to key a policy off of.

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table contacts enable row level security;
alter table templates enable row level security;
alter table campaigns enable row level security;
alter table campaign_recipients enable row level security;
alter table messages enable row level security;
alter table webhook_events enable row level security;

create policy "member can read own workspace" on workspaces
  for select using (id in (select workspace_id from workspace_members where user_id = auth.uid()));
create policy "owner can update own workspace" on workspaces
  for update using (owner_id = auth.uid());
create policy "authenticated user can create a workspace" on workspaces
  for insert with check (owner_id = auth.uid());

create policy "member can read own membership rows" on workspace_members
  for select using (user_id = auth.uid() or workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "member can manage contacts" on contacts
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "member can manage templates" on templates
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "member can manage campaigns" on campaigns
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "member can read campaign recipients" on campaign_recipients
  for select using (
    campaign_id in (
      select id from campaigns where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );

create policy "member can manage messages" on messages
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "member can read webhook events" on webhook_events
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
