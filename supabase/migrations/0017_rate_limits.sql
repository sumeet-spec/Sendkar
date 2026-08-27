create table rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

-- Atomic fixed-window counter: one round trip, no read-then-write race
-- between concurrent requests hitting the same key. Returns true when the
-- caller should be BLOCKED (count now exceeds p_max_attempts within the
-- current window).
create or replace function check_rate_limit(p_key text, p_max_attempts int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
        when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval then now()
        else rate_limits.window_start
      end
  returning count into v_count;

  return v_count > p_max_attempts;
end;
$$;
