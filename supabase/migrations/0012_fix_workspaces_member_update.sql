-- workspaces (0001) only ever let the OWNER update the row. Every other
-- multi-tenant table in this schema treats "member of this workspace" as
-- the authorization boundary, but several settings actions any team member
-- is expected to use — connecting WhatsApp/Instagram/Messenger, Shopify/
-- WooCommerce/Klaviyo, picking the order-confirmation template — all
-- update `workspaces` through the session-scoped client. For a non-owner
-- member, RLS silently denied every one of these; disconnectShopify
-- doesn't check the error, so that one *looked* like it worked while the
-- row went untouched. owner_id and plan are never written through the
-- session client (plan only changes via the billing webhook's admin
-- client), so widening this to any member is safe in practice, not just
-- in theory.
create policy "member can update own workspace" on workspaces
  for update using (id in (select workspace_id from workspace_members where user_id = auth.uid()));
