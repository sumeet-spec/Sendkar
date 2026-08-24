-- The billing webhook's dedup (processed_dodo_webhooks) only stops the same
-- delivery ID from being handled twice — it doesn't stop a genuinely older
-- event, redelivered late after a retry, from overwriting a plan state a
-- newer event already set. A late "subscription.renewed" arriving after a
-- newer "subscription.cancelled" was already processed would silently
-- re-upgrade a workspace the customer had already cancelled. This column
-- lets the webhook only apply an event whose timestamp is at least as new
-- as the last one it already applied.
alter table workspaces add column plan_synced_at timestamptz;
