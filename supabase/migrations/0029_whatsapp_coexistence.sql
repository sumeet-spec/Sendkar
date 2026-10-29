-- ── WhatsApp Business app coexistence ─────────────────────────────────────
-- A number can run on the WhatsApp Business app and the Cloud API at once.
-- These columns record how a workspace was connected and how the one-time
-- contacts/history sync Meta allows after onboarding went. All additive;
-- existing workspaces keep whatsapp_coexistence = false.

alter table workspaces
  add column whatsapp_coexistence boolean not null default false,
  add column coexistence_onboarded_at timestamptz,
  add column coexistence_sync_requested_at timestamptz,
  add column coexistence_sync_error text,
  add column coexistence_history_progress int;
