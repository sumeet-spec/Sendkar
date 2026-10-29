-- A hold on a campaign while a send run is working through it, so the daily job and the "Start"
-- button can never send to the same people twice. The hold expires by itself if a run dies.
alter table campaigns add column if not exists send_lock_until timestamptz;
