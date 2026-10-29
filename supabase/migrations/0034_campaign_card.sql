-- A campaign can carry its own picture (a card made in the card maker). Templates with an image
-- header send this picture; Meta fetches it by URL at send time, so it must be a public storage URL.
alter table campaigns add column if not exists image_url text;
