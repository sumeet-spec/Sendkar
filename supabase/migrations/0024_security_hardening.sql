-- ── RLS gaps ──────────────────────────────────────────────────────────────
-- Three tables from earlier migrations were created without RLS enabled.
-- Without it, Postgres grants full row access to any role holding the
-- table-level grant — which under Supabase's default privileges includes
-- `anon` and `authenticated`, i.e. anyone with the public anon key baked
-- into the frontend bundle. All three are reachable via PostgREST directly,
-- bypassing application code entirely.

-- rate_limits: an attacker could DELETE their own key's row via the anon
-- key to reset the fixed-window counter, defeating login/signup/password-
-- reset throttling outright. Only ever touched by the service-role client
-- (see lib/rateLimit.ts) — deny everyone else, same posture as
-- password_reset_codes in 0023.
alter table rate_limits enable row level security;

-- processed_dodo_webhooks: dedupe ledger for billing webhook delivery IDs.
-- Only ever touched by the service-role client from the billing webhook
-- route — deleting a row here would let a captured/replayed Dodo delivery
-- be reprocessed as if new.
alter table processed_dodo_webhooks enable row level security;

-- meta_rate_card: WhatsApp per-message pricing shown on the campaign cost
-- estimate (read via the session-scoped client in
-- app/(app)/campaigns/[id]/page.tsx, so it does need an authenticated-read
-- policy, unlike the two above). Not secret, but with RLS off any
-- authenticated user could also INSERT/UPDATE/DELETE it, corrupting the
-- cost estimates every workspace sees.
alter table meta_rate_card enable row level security;

create policy "authenticated user can read rate card" on meta_rate_card
  for select to authenticated using (true);
