-- Scheduled send time — null means "send as soon as the next cron run"
alter table campaigns add column if not exists scheduled_at timestamptz;

-- Variable substitution mapping — {"1": "name", "2": "email", ...}
-- Maps each Meta template placeholder index to a contact field name
alter table campaigns add column if not exists variable_mapping jsonb default '{}'::jsonb;
