-- ── Free card tool ────────────────────────────────────────────────────────
-- Anyone can make a festival card with their shop name at /free-card, no account. Every card made is a row
-- here, so we can see how many shops are using it; a person who also leaves their WhatsApp number (and ticks
-- the box) is a lead we may message about new festival designs and the free trial.
-- Only the service-role client touches this table.

create table free_card_leads (
  id          uuid primary key default gen_random_uuid(),
  shop_name   text not null,
  lang        text,
  design_id   text,
  phone       text,                    -- digits with country code; only set when the person chose to leave it
  consent_at  timestamptz,             -- when they ticked "send me new festival designs"
  source      text,                    -- e.g. expo, group, flyer: from ?src= on the link
  created_at  timestamptz not null default now()
);

create index free_card_leads_created_idx on free_card_leads (created_at desc);
create unique index free_card_leads_phone_idx on free_card_leads (phone) where phone is not null;

alter table free_card_leads enable row level security;
