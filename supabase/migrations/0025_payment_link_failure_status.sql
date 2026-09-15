-- Audit finding: a declined/failed PayU payment left payment_links.paid_at
-- null forever with no way to distinguish "customer's payment was declined"
-- from "link hasn't been clicked yet" — both looked identical to the
-- dashboard and to support. Adds a real 'failed' status and a reason field
-- for the PayU return route to record it into.

alter table payment_links drop constraint payment_links_status_check;
alter table payment_links add constraint payment_links_status_check
  check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled'));

alter table payment_links add column failure_reason text;
