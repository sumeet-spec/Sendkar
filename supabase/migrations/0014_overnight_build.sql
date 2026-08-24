-- Sendkar v4: business hours, multi-step sequences (drip automations +
-- abandoned-cart recovery share one engine), inbox auto-assignment, saved
-- segments, quality-rating history, in-chat payment links, and WhatsApp
-- Calling. Same posture as every migration before this one: every new
-- table carries workspace_id, RLS follows the identical "member of this
-- workspace" shape, everything is additive.

-- ── Business hours + away message ──────────────────────────────────────────
-- A contact who messages outside business hours gets one automatic reply,
-- same posture as the existing keyword automations but time-gated instead
-- of keyword-gated. Hours are stored per weekday in the workspace's own
-- timezone so "closed till 10am" means the owner's 10am, not UTC's.

alter table workspaces
  add column business_hours_enabled bool not null default false,
  add column business_hours_timezone text not null default 'Asia/Kolkata',
  add column away_message text not null default 'Thanks for reaching out! We''re outside business hours right now — we''ll reply as soon as we''re back.';

create table business_hours (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6), -- 0 = Sunday
  opens_at     time not null,
  closes_at    time not null,
  unique (workspace_id, day_of_week)
);
create index business_hours_workspace_idx on business_hours (workspace_id);
alter table business_hours enable row level security;
create policy "member can manage business hours" on business_hours
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Sequences: multi-step, delay-aware automations ─────────────────────────
-- Generalizes the single-shot `automations` table into real drip sequences:
-- N steps, each with its own delay, triggered by a keyword OR an event
-- (cart_abandoned, order_placed) instead of only ever a keyword. Abandoned-
-- cart recovery is just a sequence with trigger_type = 'cart_abandoned' —
-- no separate subsystem needed.

create table sequences (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  name          text not null,
  trigger_type  text not null check (trigger_type in ('keyword', 'cart_abandoned', 'order_placed')),
  trigger_keyword text, -- only meaningful when trigger_type = 'keyword'
  match_type    text not null default 'contains' check (match_type in ('exact', 'contains')),
  is_active     bool not null default true,
  created_at    timestamptz not null default now()
);
create index sequences_workspace_idx on sequences (workspace_id);
create index sequences_trigger_idx on sequences (workspace_id, trigger_type) where is_active;
alter table sequences enable row level security;
create policy "member can manage sequences" on sequences
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create table sequence_steps (
  id           uuid primary key default gen_random_uuid(),
  sequence_id  uuid not null references sequences(id) on delete cascade,
  step_order   int not null,
  delay_minutes int not null default 0, -- time after enrollment (step 1) or after the previous step fired
  message_body text not null,
  -- Steps after the first can optionally attach a Razorpay/PayU payment
  -- link generated fresh per contact (e.g. the cart-recovery nudge) —
  -- amount is filled in from the triggering cart/order at enrollment time.
  include_payment_link bool not null default false,
  unique (sequence_id, step_order)
);
create index sequence_steps_sequence_idx on sequence_steps (sequence_id, step_order);
alter table sequence_steps enable row level security;
create policy "member can manage sequence steps" on sequence_steps
  for all using (sequence_id in (
    select id from sequences where workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  ));

-- Where each enrolled contact currently is — one active enrollment per
-- (sequence, contact) at a time. `next_send_at` is what the cron scans;
-- `context` carries per-enrollment data (e.g. the cart total/checkout url)
-- that steps' payment links are generated from.
create table sequence_enrollments (
  id            uuid primary key default gen_random_uuid(),
  sequence_id   uuid not null references sequences(id) on delete cascade,
  contact_id    uuid not null references contacts(id) on delete cascade,
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  current_step_order int not null default 0, -- 0 = not sent yet, advances after each step fires
  status        text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  context       jsonb not null default '{}'::jsonb,
  next_send_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (sequence_id, contact_id)
);
create index sequence_enrollments_due_idx on sequence_enrollments (next_send_at) where status = 'active';
create index sequence_enrollments_workspace_idx on sequence_enrollments (workspace_id);
alter table sequence_enrollments enable row level security;
create policy "member can view sequence enrollments" on sequence_enrollments
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Abandoned carts (Shopify checkouts that never became an order) ────────

create table carts (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  contact_id          uuid references contacts(id) on delete set null,
  shopify_checkout_id text not null,
  checkout_url        text,
  total_amount        numeric(12,2) not null default 0,
  currency            text not null default 'INR',
  status              text not null default 'open' check (status in ('open', 'recovered', 'abandoned', 'expired')),
  abandoned_at        timestamptz, -- set once the recovery window (from checkouts/update webhook age) has passed
  created_at          timestamptz not null default now(),
  unique (workspace_id, shopify_checkout_id)
);
create index carts_workspace_idx on carts (workspace_id);
create index carts_status_idx on carts (workspace_id, status);
alter table carts enable row level security;
create policy "member can view carts" on carts
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Inbox auto-assignment ───────────────────────────────────────────────────
-- Load-balanced: the next inbound contact with no assignee goes to whichever
-- active member currently has the fewest open (unresolved) conversations,
-- not a rigid round-robin ordering — matches what Interakt calls "load
-- balancer" assignment.

alter table workspaces add column auto_assignment_enabled bool not null default false;

-- ── Quality-rating history ──────────────────────────────────────────────────
-- A daily snapshot per connected number so a drop shows up as a trend on
-- the dashboard instead of only being visible the moment someone happens to
-- reconnect the channel.

create table quality_rating_history (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  whatsapp_number_id uuid references whatsapp_numbers(id) on delete cascade, -- null = the workspace's default number
  quality_rating   text not null,
  checked_at       timestamptz not null default now()
);
create index quality_rating_history_workspace_idx on quality_rating_history (workspace_id, checked_at desc);
alter table quality_rating_history enable row level security;
create policy "member can view quality rating history" on quality_rating_history
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Payment links (Razorpay / PayU) ──────────────────────────────────────────
-- Credentials live on the workspace row, same "off until configured"
-- pattern as every other integration here (Shopify, Klaviyo, ...).

alter table workspaces
  add column razorpay_key_id text,
  add column razorpay_key_secret text,
  add column payu_merchant_key text,
  add column payu_salt text;

create table payment_links (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  contact_id      uuid references contacts(id) on delete set null,
  cart_id         uuid references carts(id) on delete set null,
  provider        text not null check (provider in ('razorpay', 'payu')),
  provider_ref    text not null, -- Razorpay payment_link_id, or Sendkar's own txnid for PayU
  amount          numeric(12,2) not null,
  currency        text not null default 'INR',
  url             text not null,
  status          text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);
create index payment_links_workspace_idx on payment_links (workspace_id);
create index payment_links_provider_ref_idx on payment_links (provider, provider_ref);
alter table payment_links enable row level security;
create policy "member can view payment links" on payment_links
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── WhatsApp Calling ──────────────────────────────────────────────────────
-- Feature-flagged: Meta's Calling API needs to be explicitly enabled per
-- WABA by Meta before any of this can place/receive a real call, so this
-- ships "off until Meta grants it" exactly like every other "configured
-- elsewhere, used here" integration.

alter table workspaces add column calling_enabled bool not null default false;

create table calls (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  contact_id     uuid references contacts(id) on delete set null,
  direction      text not null check (direction in ('inbound', 'outbound')),
  status         text not null default 'initiated' check (status in ('initiated', 'ringing', 'connected', 'ended', 'failed', 'missed')),
  meta_call_id   text,
  started_at     timestamptz not null default now(),
  connected_at   timestamptz,
  ended_at       timestamptz,
  duration_seconds int
);
create index calls_workspace_idx on calls (workspace_id, started_at desc);
create index calls_meta_call_id_idx on calls (meta_call_id);
alter table calls enable row level security;
create policy "member can view calls" on calls
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- ── Saved segments — real multi-condition audience filters instead of one
-- free-text tag on a campaign. Conditions are AND-combined; each is
-- {field, operator, value} evaluated against contacts at send time. ───────

create table segments (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name         text not null,
  conditions   jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);
create index segments_workspace_idx on segments (workspace_id);
alter table segments enable row level security;
create policy "member can manage segments" on segments
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

alter table campaigns add column segment_id uuid references segments(id) on delete set null;

-- ── Meta rate card — per-category message costs, seeded with India rates
-- (checked against Interakt's published card) so the cost-transparency
-- meter can estimate a campaign's Meta fees before it sends, including the
-- service-message rate that starts billing October 1, 2026. ───────────────

create table meta_rate_card (
  id            uuid primary key default gen_random_uuid(),
  country_code  text not null default 'IN',
  category      text not null check (category in ('MARKETING', 'UTILITY', 'AUTHENTICATION', 'SERVICE')),
  price_inr     numeric(10,4) not null,
  effective_from date not null default current_date,
  unique (country_code, category, effective_from)
);
-- India rates, current as of Aug 2026 — service messages become billable
-- Oct 1, 2026 at the same per-message rate utility/authentication carry.
insert into meta_rate_card (country_code, category, price_inr, effective_from) values
  ('IN', 'MARKETING', 0.9580, '2026-01-01'),
  ('IN', 'UTILITY', 0.1500, '2026-01-01'),
  ('IN', 'AUTHENTICATION', 0.1280, '2026-01-01'),
  ('IN', 'SERVICE', 0.1500, '2026-10-01');
