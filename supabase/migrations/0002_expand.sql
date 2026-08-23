-- Sendkar v2: billing, team invites, Instagram channel, automations,
-- outbound webhooks. Same posture as v1 — every new table carries
-- workspace_id, RLS follows the identical "member of this workspace" shape.

-- ── Billing (Dodo Payments, same pattern as Continuum) ────────────────────────

alter table workspaces
  add column plan text not null default 'free' check (plan in ('free', 'starter', 'growth', 'scale')),
  add column dodo_customer_id text;

-- Dodo retries webhook deliveries; this is what makes re-processing the
-- same event a no-op instead of a double-charge or a duplicate downgrade.
create table processed_dodo_webhooks (
  id         text primary key,
  created_at timestamptz not null default now()
);

-- ── Team invites (workspace_members already models roles; this is how a
-- second person actually gets one) ───────────────────────────────────────────

create table workspace_invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email        text not null,
  role         text not null default 'member' check (role in ('owner', 'member')),
  token        text not null unique,
  invited_by   uuid not null references auth.users(id),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index workspace_invites_workspace_idx on workspace_invites (workspace_id);
create index workspace_invites_token_idx on workspace_invites (token);

alter table workspace_invites enable row level security;
create policy "member can manage invites" on workspace_invites
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Multi-channel: Instagram rides the same Meta App as WhatsApp, just a
-- different connected asset (a Page + its access token) and a channel tag
-- on contacts/messages so one inbox can hold both. ───────────────────────────

alter table workspaces
  add column instagram_page_id text,
  add column instagram_access_token text;

alter table contacts
  add column channel text not null default 'whatsapp' check (channel in ('whatsapp', 'instagram'));

alter table messages
  add column channel text not null default 'whatsapp' check (channel in ('whatsapp', 'instagram'));

-- A phone number is WhatsApp-specific and an Instagram-scoped ID isn't a
-- phone number, so the old (workspace_id, phone) uniqueness has to become
-- (workspace_id, channel, phone) to let the same person exist as two rows
-- (one per channel) without colliding.
alter table contacts drop constraint contacts_workspace_id_phone_key;
alter table contacts add constraint contacts_workspace_channel_phone_key unique (workspace_id, channel, phone);

-- ── Automations: keyword-triggered auto-replies — real automation, not the
-- full drag-and-drop flow builder WATI/Interakt ship. ─────────────────────────

create table automations (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  name           text not null,
  trigger_keyword text not null,
  match_type     text not null default 'contains' check (match_type in ('exact', 'contains')),
  reply_body     text not null,
  is_active      bool not null default true,
  created_at     timestamptz not null default now()
);

create index automations_workspace_idx on automations (workspace_id);

alter table automations enable row level security;
create policy "member can manage automations" on automations
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Outbound webhooks: generic event dispatch (Zapier-style) — covers
-- "integrate with anything" far more cheaply than building a dedicated
-- Shopify/HubSpot/Salesforce connector for each one. ──────────────────────────

create table outbound_webhooks (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  url          text not null,
  events       text[] not null default array['message.received'],
  secret       text not null,
  is_active    bool not null default true,
  created_at   timestamptz not null default now()
);

create index outbound_webhooks_workspace_idx on outbound_webhooks (workspace_id);

alter table outbound_webhooks enable row level security;
create policy "member can manage outbound webhooks" on outbound_webhooks
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
