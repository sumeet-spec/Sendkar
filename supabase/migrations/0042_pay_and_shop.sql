-- ── How customers pay, and what a shop sells ─────────────────────────────
-- 1. A shop chooses how customers pay a bill: its own UPI ID, a connected Razorpay/PayU account, or any
--    payment link it pastes. 2. A shop lists its items and services, and gets a public page where a customer
--    picks some and sends the order to the shop's WhatsApp.

-- ── Payment settings ─────────────────────────────────────────────────────
alter table workspaces add column if not exists pay_mode text check (pay_mode in ('upi', 'gateway', 'link'));
alter table workspaces add column if not exists upi_id text;
alter table workspaces add column if not exists upi_name text;          -- the name a customer sees in their UPI app
alter table workspaces add column if not exists manual_pay_link text;   -- an https payment link the shop pasted

-- The short address of the shop's public page: sendkar.shop/s/<slug>
alter table workspaces add column if not exists shop_slug text;
create unique index if not exists workspaces_shop_slug_idx on workspaces (lower(shop_slug)) where shop_slug is not null;

-- ── Bills get a public pay code and a paid date ──────────────────────────
alter table bills add column if not exists pay_code text not null default encode(gen_random_bytes(6), 'hex');
create unique index if not exists bills_pay_code_idx on bills (pay_code);
alter table bills add column if not exists paid_at timestamptz;
alter table bills add column if not exists paid_via text check (paid_via in ('manual', 'gateway'));

-- A gateway link made for a bill points back at it.
alter table payment_links add column if not exists bill_id uuid references bills(id) on delete set null;
create index if not exists payment_links_bill_idx on payment_links (bill_id) where bill_id is not null;

-- When a gateway reports a bill's link paid, the bill (and its payment reminder) is marked paid too.
create or replace function bill_paid_from_link() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and new.bill_id is not null then
    update bills set paid = true, paid_at = coalesce(paid_at, now()), paid_via = 'gateway' where id = new.bill_id and paid = false;
    update receivables set status = 'paid', paid_at = now()
      where id = (select receivable_id from bills where id = new.bill_id) and status = 'open';
  end if;
  return new;
end;
$$;
drop trigger if exists payment_links_bill_paid on payment_links;
create trigger payment_links_bill_paid after update of status on payment_links
  for each row when (new.status = 'paid' and old.status is distinct from 'paid') execute function bill_paid_from_link();

-- ── Items and services ───────────────────────────────────────────────────
create table if not exists shop_items (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind         text not null default 'item' check (kind in ('item', 'service')),
  name         text not null,
  price        numeric(12,2) check (price is null or price >= 0),   -- null means "ask for a price"
  unit         text,                                                -- "per kg", "per hour"
  description  text,
  image_url    text,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists shop_items_workspace_idx on shop_items (workspace_id, sort_order, created_at);

alter table shop_items enable row level security;
drop policy if exists "member can manage shop items" on shop_items;
create policy "member can manage shop items" on shop_items
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
grant select, insert, update, delete on shop_items to authenticated;
grant all on shop_items to service_role;

-- Item photos are meant to be seen by anyone who opens the shop page, so this bucket is public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-items', 'shop-items', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ── WhatsApp assistant ───────────────────────────────────────────────────
-- Orders the assistant took in a chat, for the shop to turn into a bill.
create table if not exists order_requests (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete set null,
  items        jsonb not null default '[]'::jsonb,     -- [{ "name": "Basmati rice 5kg", "qty": 2 }]
  note         text,
  status       text not null default 'new' check (status in ('new', 'billed', 'dismissed')),
  bill_id      uuid references bills(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists order_requests_workspace_idx on order_requests (workspace_id, status, created_at desc);

alter table order_requests enable row level security;
drop policy if exists "member can manage order requests" on order_requests;
create policy "member can manage order requests" on order_requests
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
grant select, insert, update, delete on order_requests to authenticated;
grant all on order_requests to service_role;

-- The assistant answers customers by default. A shop that never set it up had it off, so "hi" got no reply.
alter table workspaces alter column ai_agent_enabled set default true;
update workspaces set ai_agent_enabled = true where ai_agent_enabled = false and ai_agent_knowledge is null;
