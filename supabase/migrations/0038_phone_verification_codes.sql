-- ── phone_verification_codes ─────────────────────────────────────────────
-- One-time codes sent over WhatsApp to prove a new account's owner really holds the number they signed up
-- with. Same shape as password_reset_codes, kept separate so a signup code can never reset a password.
-- Hashed, short-lived, attempt-limited, and only ever touched by the service-role client.

create table phone_verification_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0,
  created_at  timestamptz not null default now()
);

create index phone_verification_codes_user_idx on phone_verification_codes (user_id);

alter table phone_verification_codes enable row level security;
