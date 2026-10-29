-- ── Send scheduled campaigns on time ────────────────────────────────────────
-- Vercel's free plan can only run a job once a day, so scheduled campaigns would wait for the 8:30 AM run.
-- Supabase can call the same endpoint every 5 minutes for free (pg_cron + pg_net). Run this ONCE in the
-- Supabase SQL editor, after replacing PUT_YOUR_CRON_SECRET_HERE with the CRON_SECRET value from Vercel.
--
-- Safe to run next to the daily job: a campaign is only ever worked on by one run at a time, and a run that
-- finds nothing due does nothing. The morning summary only goes out in the 8 AM India hour.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sendkar-send-scheduled',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://www.sendkar.shop/api/cron/send',
    headers := jsonb_build_object('authorization', 'Bearer PUT_YOUR_CRON_SECRET_HERE')
  );
  $$
);

-- To stop it later:  select cron.unschedule('sendkar-send-scheduled');
