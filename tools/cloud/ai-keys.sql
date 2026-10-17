-- FAND: the site's own AI keys, kept encrypted in Supabase Vault.
-- Run schema.sql first (it makes the private functions that read these). Then, in the SQL Editor,
-- run ONE of the blocks below, with your real key in place of the placeholder. Never commit a real key.

-- ── add the keys (first time) ──
select vault.create_secret('xai-PASTE-YOUR-GROK-KEY', 'fand_grok_key', 'Grok (xAI) key for the Forge');
select vault.create_secret('sk-ant-PASTE-YOUR-CLAUDE-KEY', 'fand_claude_key', 'Anthropic key for the chat assistant');

-- ── replace a key later ──
-- select vault.update_secret((select id from vault.secrets where name = 'fand_grok_key'), 'xai-NEW-KEY');
-- select vault.update_secret((select id from vault.secrets where name = 'fand_claude_key'), 'sk-ant-NEW-KEY');

-- ── check which keys are stored (shows names only, never the keys) ──
-- select name, description, updated_at from vault.secrets where name like 'fand_%';

-- ── remove a key (the Forge then asks players for their own) ──
-- delete from vault.secrets where name = 'fand_grok_key';

-- ── see today's use per account ──
-- select * from fand_private.ai_usage where day = current_date order by n desc;
