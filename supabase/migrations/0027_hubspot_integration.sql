-- HubSpot CRM sync — same shape as Klaviyo (a private-app API key, no OAuth
-- app or review needed). Replaces the "Salesforce, HubSpot, Zoho — Coming
-- soon" placeholder on the integrations page for HubSpot specifically;
-- Salesforce and Zoho both need a full OAuth app and stay on the roadmap.

alter table workspaces add column hubspot_api_key text;
