-- Backfill legacy theme values to the new semantic theme IDs.
-- store_settings.theme previously stored 'light' | 'dark'. The dashboard now
-- uses named themes (keel-light, forest, keel-dark, midnight). Keep the legacy
-- values mapped to their closest new theme so existing shops don't fall back
-- to the default on their next load.

update store_settings
set theme = 'keel-light'
where theme = 'light';

update store_settings
set theme = 'keel-dark'
where theme = 'dark';
