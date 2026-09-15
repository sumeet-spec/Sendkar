-- Web Push subscriptions for the inbox — lets a browser (including the
-- installed PWA / Android TWA wrapper) receive a native OS notification when
-- a new message arrives, instead of only updating while the tab is open.
-- Numbered 0026 rather than 0025 since 0025 (payment_links failure status)
-- was applied directly against prod ahead of this migration's branch.

create table push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth_key     text not null,
  created_at   timestamptz not null default now()
);
create index push_subscriptions_user_idx on push_subscriptions (user_id);
create index push_subscriptions_workspace_idx on push_subscriptions (workspace_id);

alter table push_subscriptions enable row level security;

-- A user manages only their own subscriptions (one per browser/device they
-- opted in from) — never another member's, even within the same workspace.
create policy "user can manage their own push subscriptions" on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
