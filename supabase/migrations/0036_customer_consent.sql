-- ── Customer permission ──────────────────────────────────────────────────
-- A shop shares one link (and a printable QR poster). A customer opens it, types their number and
-- ticks "yes, send me offers". We keep when and how they agreed, so the shop can show real permission.
--
-- join_code is the public part of the link (/join/<code>); it only lets someone add THEMSELVES to
-- that shop's list, nothing more.

alter table workspaces add column if not exists join_code text unique;
alter table contacts add column if not exists consent_at timestamptz;
alter table contacts add column if not exists consent_source text;

create index if not exists contacts_consent_idx on contacts (workspace_id) where consent_at is not null;
