-- FAND: the site's own Groq keys, kept encrypted in Supabase Vault.
-- Run schema.sql first (it makes the private functions that read these). Then, in the SQL Editor, run the lines
-- below with your real keys in place of the placeholders. Get keys at https://console.groq.com/keys (they start with gsk_).
-- Never commit a real key.

-- ── add the keys (first time) ──
select vault.create_secret('gsk_PASTE-YOUR-FORGE-KEY', 'fand_groq_key', 'Groq key for Forge with Groq');
select vault.create_secret('gsk_PASTE-YOUR-SORTING-KEY', 'fand_sort_key', 'Groq key for filing new designs on the Blueprints page');
select vault.create_secret('gsk_PASTE-YOUR-CHAT-KEY', 'fand_chat_key', 'Groq key for the chat assistant (not used yet)');

-- ── replace a key later ──
-- select vault.update_secret((select id from vault.secrets where name = 'fand_groq_key'), 'gsk_NEW-KEY');
-- select vault.update_secret((select id from vault.secrets where name = 'fand_sort_key'), 'gsk_NEW-KEY');
-- select vault.update_secret((select id from vault.secrets where name = 'fand_chat_key'), 'gsk_NEW-KEY');

-- ── check which keys are stored (names only, never the keys) ──
-- select name, description, updated_at from vault.secrets where name like 'fand_%';

-- ── remove a key (that feature then falls back to each player's own key, or to FAND's rules for filing) ──
-- delete from vault.secrets where name = 'fand_groq_key';

-- ── see today's use per account ──
-- select * from fand_private.ai_usage where day = current_date order by n desc;
