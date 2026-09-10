-- ── password_reset_codes ─────────────────────────────────────────────────
-- No real email exists for any user (login identity is a WhatsApp number;
-- the stored email is synthetic and never delivered — see phoneToAuthEmail).
-- So password recovery works over WhatsApp instead: a 6-digit code, sent via
-- a Meta-approved Authentication template, hashed here rather than stored in
-- the clear since this table is only ever read by the service-role client.

create table password_reset_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0,
  created_at  timestamptz not null default now()
);

create index password_reset_codes_user_idx on password_reset_codes (user_id);

-- No RLS policy needed — this table is only ever touched by the service-role
-- client (createAdminClient()) from the forgot/reset-password server actions,
-- which run before any user session exists.
alter table password_reset_codes enable row level security;
