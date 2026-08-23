-- Click-to-WhatsApp Ads attribution — captured from the `referral` field
-- Meta includes on the first inbound message when someone messages in
-- from a CTWA ad. A real, novel feature from researching WATI's product
-- (their CTWA page also feeds a conversion event back to Meta's ad
-- algorithm — NOT built here, since that needs a Pixel/ad-account
-- credential to verify against a live ad account, unlike this capture
-- side which only needs the webhook payload Meta already sends).

alter table contacts
  add column ctwa_clid text,
  add column ad_source_id text,
  add column ad_headline text;
