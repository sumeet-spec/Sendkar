-- ── Quick Bill ────────────────────────────────────────────────────────────
-- A shop enters a sale (customer's number, amount, optional items) and the customer gets the bill on WhatsApp.
-- Each bill is kept here, with where it was stored and whether it reached the customer.
--
-- The bill picture lives in a PRIVATE bucket: it carries a customer's name and number, so it is only ever handed
-- to WhatsApp as a short-lived signed link, never as a public address.

create table bills (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  contact_id    uuid references contacts(id) on delete set null,
  bill_no       text not null,
  customer_name text not null default '',
  phone         text not null,                          -- digits with country code, like contacts.phone
  lang          text,                                   -- language the bill and message were written in
  items         jsonb not null default '[]'::jsonb,     -- [{ "name": "Rice 5kg", "qty": 2, "rate": 340 }]
  amount        numeric(12,2) not null check (amount > 0),
  paid          boolean not null default true,
  due_date      date,                                   -- for an unpaid bill
  note          text,
  external_ref  text,                                   -- e.g. the Tally voucher number, so a pasted sale is never billed twice
  image_path    text,                                   -- in the private "bills" bucket
  send_status   text not null default 'pending' check (send_status in ('pending', 'sent', 'failed', 'not_sent')),
  send_error    text,
  meta_message_id text,
  order_id      uuid references orders(id) on delete set null,
  receivable_id uuid references receivables(id) on delete set null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  unique (workspace_id, bill_no)
);

create index bills_workspace_created_idx on bills (workspace_id, created_at desc);
create index bills_contact_idx on bills (contact_id);
create unique index bills_external_ref_idx on bills (workspace_id, external_ref) where external_ref is not null;

alter table bills enable row level security;
create policy "member can view bills" on bills
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
grant select on bills to authenticated;
grant all on bills to service_role;

-- Bill numbers: a prefix and a running number per shop (B1, B2, ...). Taken in one statement, so two bills made at
-- the same moment never get the same number.
alter table workspaces add column if not exists bill_prefix text not null default 'B';
alter table workspaces add column if not exists next_bill_no int not null default 1;

create or replace function next_bill_number(p_workspace uuid) returns text
language sql security definer set search_path = public as $$
  update workspaces set next_bill_no = next_bill_no + 1
  where id = p_workspace
  returning bill_prefix || (next_bill_no - 1)::text;
$$;
revoke all on function next_bill_number(uuid) from public;
grant execute on function next_bill_number(uuid) to service_role;

-- GSTIN printed on the bill, if the shop has one.
alter table brand_kits add column if not exists gstin text not null default '';

-- Private storage for the bill pictures.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bills', 'bills', false, 2097152, array['image/png'])
on conflict (id) do nothing;
