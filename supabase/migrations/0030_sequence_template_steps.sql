-- ── Sequence steps that send an approved WhatsApp template ────────────────
-- Until now every step was free text, which WhatsApp only delivers inside 24
-- hours of the customer's last message — so a "thank you now, a tip in a week,
-- a nudge in six weeks" journey could not work past its first step. A step can
-- now name an approved template instead; variable_mapping fills its {{n}}
-- slots (contact name, order amount/number from the sale, or fixed text).
-- message_body keeps a copy of the template text for display.

alter table sequence_steps
  add column template_id uuid references templates(id) on delete set null,
  add column variable_mapping jsonb not null default '{}'::jsonb;
