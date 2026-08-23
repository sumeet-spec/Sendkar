-- Sendkar v4: revenue attribution — link real sales back to the WhatsApp
-- campaign (or automation) that most plausibly drove them. WATI/Interakt
-- track delivery and read rates; neither surfaces "this campaign made ₹X in
-- actual sales." Orders can arrive from Shopify/WooCommerce webhooks or be
-- logged by hand — most of Instastarz's own ICP (Instagram sellers) take
-- payment over chat/UPI with no storefront at all, so manual logging isn't
-- a fallback, it's the primary path for that segment.

create table orders (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references workspaces(id) on delete cascade,
  contact_id            uuid references contacts(id) on delete set null,
  source                text not null default 'manual' check (source in ('shopify', 'woocommerce', 'manual')),
  external_order_id     text, -- Shopify/WooCommerce order id, for webhook dedupe; null for manual entries
  order_label           text, -- e.g. "#1001", shown in the UI
  total_amount          numeric(12,2) not null,
  currency              text not null default 'INR',
  -- Last-touch: the most recent campaign this contact was sent within the
  -- attribution window before the order. Null means organic/untracked.
  attributed_campaign_id uuid references campaigns(id) on delete set null,
  note                  text,
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now()
);

create index orders_workspace_idx on orders (workspace_id, created_at desc);
create index orders_contact_idx on orders (contact_id);
create index orders_attributed_campaign_idx on orders (attributed_campaign_id);

-- A webhook retry must not double-count the same real-world order. A plain
-- (non-partial) unique index is deliberate: Postgres never treats two NULLs
-- as conflicting, so manual entries (external_order_id always null) never
-- collide with each other — and ON CONFLICT (cols) DO NOTHING can only
-- infer a partial index as its arbiter if the WHERE predicate is repeated
-- verbatim in the upsert call, which the Supabase JS client has no option
-- for, so a partial index here would make every webhook upsert error out.
create unique index orders_dedupe_idx on orders (workspace_id, source, external_order_id);

alter table orders enable row level security;
create policy "member can manage orders" on orders
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
