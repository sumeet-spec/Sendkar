-- campaign_recipients (0001) only ever had a select policy. startCampaign
-- inserts the audience snapshot through the session-scoped client, not the
-- admin client — with RLS enabled and no insert-permitting policy, Postgres
-- denies that insert by default. The action didn't check the error, so the
-- campaign still flipped to "sending" with zero recipients ever created;
-- the cron then found nothing queued and marked it "completed" a moment
-- later. Every campaign launched from the UI (as opposed to the MCP tool's
-- start_campaign, which correctly uses the admin client) has silently sent
-- to nobody since this table was created.
drop policy if exists "member can read campaign recipients" on campaign_recipients;
create policy "member can manage campaign recipients" on campaign_recipients
  for all using (
    campaign_id in (
      select id from campaigns where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
