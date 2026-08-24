-- Sendkar v5: catching up to what the Cloud API actually supports now —
-- reactions, interactive buttons/lists (in both the inbox and chatbot
-- flows), and native WhatsApp Flows (rich in-chat forms). Named wa_flows
-- to avoid colliding with the existing `flows` table, which is Sendkar's
-- own keyword-branching chatbot feature — a different thing from Meta's
-- Flows product despite the name clash.

-- ── Reactions — one emoji per message, whichever side set it last ────────
alter table messages add column reaction text;

-- ── Interactive messages — chatbot flow steps can now send buttons or a
-- list, not just plain text. interactive_payload holds either
-- {buttons: [{id, title}]} (max 3) or {sections: [{title, rows: [{id,
-- title, description}]}]} depending on message_type. ─────────────────────
alter table flow_steps add column message_type text not null default 'text' check (message_type in ('text', 'buttons', 'list'));
alter table flow_steps add column interactive_payload jsonb;

-- ── Native WhatsApp Flows — Meta's rich in-chat forms. Sendkar builds a
-- static screen/field definition and compiles it to Meta's Flow JSON;
-- there is no dynamic per-screen data-exchange endpoint in this version —
-- that requires an RSA keypair registered with Meta and a public
-- encrypt/decrypt endpoint, a separate, larger piece of work than
-- shipping the flows themselves. ─────────────────────────────────────────
create table wa_flows (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  name              text not null,
  meta_flow_id      text, -- assigned once created on Meta's side
  status            text not null default 'draft' check (status in ('draft', 'published', 'error')),
  categories        text[] not null default array['OTHER'],
  screens           jsonb not null default '[]'::jsonb, -- Sendkar's own screen/field schema, compiled to Flow JSON on publish
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index wa_flows_workspace_idx on wa_flows (workspace_id);
alter table wa_flows enable row level security;
create policy "member can manage wa flows" on wa_flows
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- One flow_token per send, so an eventual completion webhook (nfm_reply)
-- can be matched back to which contact and which flow it belongs to.
create table wa_flow_sends (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  wa_flow_id    uuid not null references wa_flows(id) on delete cascade,
  contact_id    uuid not null references contacts(id) on delete cascade,
  flow_token    text not null unique,
  response      jsonb,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index wa_flow_sends_token_idx on wa_flow_sends (flow_token);
create index wa_flow_sends_workspace_idx on wa_flow_sends (workspace_id, created_at desc);
alter table wa_flow_sends enable row level security;
create policy "member can view wa flow sends" on wa_flow_sends
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
