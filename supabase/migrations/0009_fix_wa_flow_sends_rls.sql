-- wa_flow_sends (0007) only had a select policy. sendWaFlowToContact inserts
-- a row through the session-scoped client (not the admin client) to record
-- the flow_token that correlates the eventual completion webhook — with no
-- insert-permitting policy, RLS silently rejected that insert for every real
-- workspace member. Same "member of this workspace" shape as every other
-- table, just covering all operations instead of only select.
drop policy if exists "member can view wa flow sends" on wa_flow_sends;
create policy "member can manage wa flow sends" on wa_flow_sends
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
