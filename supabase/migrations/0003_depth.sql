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

-- wa.me click-to-chat links need the actual E.164 number, not the opaque
-- phone_number_id the Cloud API uses for sending — that ID alone can't
-- build a link.
alter table workspaces add column whatsapp_display_number text;

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

-- ── Team inbox: conversation assignment + private notes ───────────────────

alter table contacts add column assignee_id uuid references auth.users(id);

create table contact_notes (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid not null references contacts(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  author_id    uuid not null references auth.users(id),
  body         text not null,
  created_at   timestamptz not null default now()
);

create index contact_notes_contact_idx on contact_notes (contact_id, created_at desc);

alter table contact_notes enable row level security;
create policy "member can manage contact notes" on contact_notes
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── API keys — service-to-service auth for the MCP server and any future
-- external integration. Session cookies (what every other action in this
-- app uses) don't exist for a non-browser client like Claude Desktop. ────

create table api_keys (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name         text not null,
  key_prefix   text not null, -- shown in the UI so a key is recognizable without ever re-displaying it
  key_hash     text not null, -- sha256 of the real key — the real value is shown once, at creation, only
  created_by   uuid not null references auth.users(id),
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index api_keys_workspace_idx on api_keys (workspace_id);
create index api_keys_hash_idx on api_keys (key_hash) where revoked_at is null;

alter table api_keys enable row level security;
create policy "member can manage api keys" on api_keys
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Multi-language broadcasts — one campaign, per-recipient language ──────
-- A shared group name links translated templates of the same message so a
-- single campaign can auto-pick each contact's own-language version
-- instead of the sender manually segmenting and launching N campaigns.

alter table templates add column template_group text;
alter table campaigns add column template_group text;

-- ── Chatbot flows — multi-step, branching conversations, not just a single
-- keyword-to-reply automation. Each step sends a message and waits for the
-- next inbound reply; branches route to a specific next step by keyword,
-- with an optional default when nothing matches. ──────────────────────────

create table flows (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  name           text not null,
  trigger_keyword text not null,
  match_type     text not null default 'contains' check (match_type in ('exact', 'contains')),
  is_active      bool not null default true,
  created_at     timestamptz not null default now()
);
create index flows_workspace_idx on flows (workspace_id);
alter table flows enable row level security;
create policy "member can manage flows" on flows
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create table flow_steps (
  id                    uuid primary key default gen_random_uuid(),
  flow_id               uuid not null references flows(id) on delete cascade,
  step_order            int not null,
  message_body          text not null,
  branches              jsonb not null default '[]'::jsonb, -- [{keyword, matchType, nextStepOrder}]
  default_next_step_order int, -- null = end the flow here if nothing else matches
  created_at            timestamptz not null default now(),
  unique (flow_id, step_order)
);
create index flow_steps_flow_idx on flow_steps (flow_id, step_order);
alter table flow_steps enable row level security;
create policy "member can manage flow steps" on flow_steps
  for all using (flow_id in (
    select id from flows where workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ));

-- Where each contact currently is inside an active flow — deleted when the
-- flow ends (no matching branch and no default). Only the webhook route
-- (service-role) writes this; members only need to read it.
create table contact_flow_state (
  contact_id        uuid primary key references contacts(id) on delete cascade,
  flow_id           uuid not null references flows(id) on delete cascade,
  current_step_order int not null,
  updated_at        timestamptz not null default now()
);
alter table contact_flow_state enable row level security;
create policy "member can view flow state" on contact_flow_state
  for select using (flow_id in (
    select id from flows where workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ));

-- ── Product catalog — WhatsApp's native "browse products in-chat" message
-- types, referencing a Meta Commerce Manager catalog. The catalog itself is
-- still set up once in Meta Commerce Manager (same "submitted elsewhere,
-- referenced here" pattern as templates) — this table is Sendkar's own
-- mirror for display and for picking which product_retailer_id to send. ──

alter table workspaces add column catalog_id text;

create table products (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  retailer_id  text not null, -- must match the product's retailer id in the Meta catalog
  name         text not null,
  price_label  text, -- free text ("₹499"), not parsed — Meta's catalog is the price source of truth
  image_url    text,
  description  text,
  is_active    bool not null default true,
  created_at   timestamptz not null default now(),
  unique (workspace_id, retailer_id)
);
create index products_workspace_idx on products (workspace_id);
alter table products enable row level security;
create policy "member can manage products" on products
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Shopify — one real native e-commerce integration instead of ten shallow
-- ones. OAuth-connected per workspace; order webhooks trigger an automatic
-- WhatsApp order-confirmation send using a template the workspace picks. ──

alter table workspaces
  add column shopify_shop_domain text,
  add column shopify_access_token text,
  add column order_confirmation_template_id uuid references templates(id);

-- ── WooCommerce — same order-confirmation idea, but the merchant generates
-- their own webhook secret in WP admin (no OAuth app to register on our
-- side at all) and pastes the delivery URL Sendkar shows them. ────────────

alter table workspaces
  add column woocommerce_store_url text,
  add column woocommerce_webhook_secret text;

-- ── Klaviyo — private API key, no OAuth review process, so a new WhatsApp
-- contact syncs there as a profile the moment they message in. ───────────

alter table workspaces add column klaviyo_api_key text;

-- ── Multiple WhatsApp numbers per workspace — additive, not a rewrite of
-- the existing single-number fields on `workspaces` (which stay as the
-- default/primary number so nothing that already works changes behavior).
-- A workspace can register additional numbers (e.g. sales + support) here;
-- contacts and campaigns can optionally pin to one. ───────────────────────

create table whatsapp_numbers (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  label             text not null,
  phone_number_id   text not null,
  whatsapp_waba_id  text,
  access_token      text not null,
  display_number    text,
  messaging_tier    int not null default 250,
  daily_send_count  int not null default 0,
  daily_reset_at    timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (workspace_id, phone_number_id)
);
create index whatsapp_numbers_workspace_idx on whatsapp_numbers (workspace_id);
alter table whatsapp_numbers enable row level security;
create policy "member can manage whatsapp numbers" on whatsapp_numbers
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- Which registered number a contact's conversation belongs to — null means
-- "the workspace's default number", preserving today's single-number
-- behavior for every contact that predates this feature.
alter table contacts add column whatsapp_number_id uuid references whatsapp_numbers(id) on delete set null;

-- Which number a campaign sends from — null means the default number,
-- same backward-compatible convention.
alter table campaigns add column whatsapp_number_id uuid references whatsapp_numbers(id) on delete set null;

-- ── Facebook Messenger + a real Instagram inbound path ────────────────────
-- Instagram previously had a send function but NO webhook receiver at all —
-- it couldn't track the 24h window or even create a contact from an inbound
-- DM. This adds Messenger as its own channel and gives both a real inbound
-- path via one shared webhook (Meta's Messenger Platform payload shape is
-- identical for both, differing only in the top-level `object` field).

alter table workspaces
  add column messenger_page_id text,
  add column messenger_access_token text;

alter table contacts drop constraint contacts_channel_check;
alter table contacts add constraint contacts_channel_check check (channel in ('whatsapp', 'instagram', 'messenger'));
alter table messages drop constraint messages_channel_check;
alter table messages add constraint messages_channel_check check (channel in ('whatsapp', 'instagram', 'messenger'));

-- ── AI-native features WATI/Interakt don't have: template drafting from a
-- description, and automatic per-message tagging/sentiment so contacts
-- self-segment by intent without anyone tagging them by hand. ────────────

alter table contacts add column last_sentiment text check (last_sentiment in ('positive', 'neutral', 'negative', 'urgent'));
create index contacts_last_sentiment_idx on contacts (workspace_id, last_sentiment) where last_sentiment in ('negative', 'urgent');

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
