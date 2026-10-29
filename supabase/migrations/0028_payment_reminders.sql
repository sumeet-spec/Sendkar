-- ── Payment reminders ─────────────────────────────────────────────────────
-- Outstanding bills a business wants chased automatically on WhatsApp.
-- Imported from an Excel/Tally paste or CSV, reminded on a fixed cadence
-- around the due date, and stopped the moment the linked payment lands.
--
-- Reminders go out as an approved Meta template, never free text: the
-- customer usually hasn't messaged recently, so there is no 24h window.

alter table workspaces
  add column reminder_template_id uuid references templates(id) on delete set null;

create table receivables (
  id                   uuid primary key default gen_random_uuid(),
  workspace_id         uuid not null references workspaces(id) on delete cascade,
  contact_id           uuid references contacts(id) on delete set null,
  party_name           text not null,
  phone                text not null, -- digits only incl. country code, same shape as contacts.phone
  amount               numeric(12,2) not null check (amount > 0),
  due_date             date not null,
  invoice_ref          text,
  status               text not null default 'open'
                         check (status in ('open', 'paid', 'stopped', 'failed')),
  reminders_sent       int not null default 0,
  last_reminded_at     timestamptz,
  failed_attempts      int not null default 0,
  last_error           text,
  payment_link_id      uuid references payment_links(id) on delete set null,
  -- Proof the business confirmed these customers agreed to WhatsApp payment
  -- reminders when the batch was imported. Reminders are never sent without it.
  consent_confirmed_at timestamptz not null,
  paid_at              timestamptz,
  created_at           timestamptz not null default now()
);

create index receivables_workspace_idx on receivables (workspace_id, status, due_date);
create index receivables_open_idx on receivables (due_date) where status = 'open';

alter table receivables enable row level security;

create policy "member can manage receivables" on receivables
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
