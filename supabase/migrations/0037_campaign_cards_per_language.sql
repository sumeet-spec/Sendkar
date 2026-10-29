-- One card per customer language for a campaign: { "hi": "<url>", "gu": "<url>" }.
-- Each contact gets the card in their own language; anyone else gets campaigns.image_url.
alter table campaigns add column if not exists image_urls jsonb;
