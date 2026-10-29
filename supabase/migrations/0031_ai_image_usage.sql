-- ── AI image usage ────────────────────────────────────────────────────────
-- One row per AI image generated. Each image is a real Gemini charge, so plans
-- carry a monthly allowance (see lib/plans.ts: imagesPerMonth). A row is
-- reserved before generating and deleted again if generation fails, so the
-- count is also the bill.
--
-- Written only by the server (service role). Members can read their own
-- workspace's rows so Billing can show a usage meter.

create table ai_image_usage (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index ai_image_usage_workspace_month_idx on ai_image_usage (workspace_id, created_at);

alter table ai_image_usage enable row level security;

create policy "member can view image usage" on ai_image_usage
  for select using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
