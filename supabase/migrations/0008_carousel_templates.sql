-- Sendkar v6: carousel templates — 2-10 scrollable cards, each with an
-- image header (a Meta media handle from the Resumable Upload API — there
-- is no plain-URL shortcut for a template's stored example asset the way
-- there is for a one-off session send) and its own body text/buttons.
alter table templates add column carousel_cards jsonb;
