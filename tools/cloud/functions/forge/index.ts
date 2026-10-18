// FAND `forge` Edge Function: runs Groq requests with the site's own keys, for signed-in accounts.
//   kind 'forge'  Forge with Groq (key fand_groq_key, FORGE_DAILY_LIMIT a day, default 20)
//   kind 'sort'   filing a new design on the Blueprints page (key fand_sort_key, SORT_DAILY_LIMIT a day, default 60)
// The keys stay in Supabase Vault (see ../../ai-keys.sql); only this function reads them, through fand_private.ai_key.
// The browser sends the prompt and gets back the reply text.
import postgres from 'npm:postgres@3.4.5';

const DB_URL = Deno.env.get('SUPABASE_DB_URL') || '';
const sql = postgres(DB_URL || 'postgres://missing', { prepare: false, max: 1 });
const KINDS: Record<string, { limit: number; model: string; what: string }> = {
  forge: { limit: Number(Deno.env.get('FORGE_DAILY_LIMIT') || 20), model: Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b', what: 'forges' },
  sort: { limit: Number(Deno.env.get('SORT_DAILY_LIMIT') || 60), model: Deno.env.get('SORT_MODEL') || Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b', what: 'Blueprint filings' },
};
// Groq retires models over time: when the configured one is gone, ask Groq which models this key can use and pick
// the best general chat model (remembered until the function restarts)
let AUTO_MODEL = '';
const MODEL_PREF = [/gpt-oss-120b/i, /llama-4-maverick/i, /llama-3\.3-70b/i, /kimi-k2/i, /qwen3/i, /llama-4-scout/i, /gpt-oss-20b/i, /llama/i];
async function pickModel(key: string): Promise<string> {
  const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: 'Bearer ' + key } });
  if (!r.ok) return '';
  const ids: string[] = ((await r.json()).data || []).filter((m: { active?: boolean }) => m.active !== false).map((m: { id: string }) => m.id)
    .filter((id: string) => !/whisper|tts|guard|playai|orpheus|distil|compound|vision/i.test(id));
  for (const rx of MODEL_PREF) { const f = ids.find((i) => rx.test(i)); if (f) return f; }
  return ids[0] || '';
}
const modelGone = (status: number, text: string) => status === 404 || /model_not_found|decommissioned|does not exist|not supported/i.test(text);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const out = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return out(405, { error: 'Use POST' });

  // who is asking: the browser's own session token, checked with Supabase Auth
  const who = await fetch(Deno.env.get('SUPABASE_URL') + '/auth/v1/user', {
    headers: { Authorization: req.headers.get('Authorization') || '', apikey: req.headers.get('apikey') || '' },
  });
  const user = who.ok ? await who.json() : null;
  if (!user?.id || user.is_anonymous) return out(401, { error: 'Sign in to use FAND\'s Groq.' });

  // the request: which job, and a system and a user message no larger than the site sends
  let body: { kind?: string; messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return out(400, { error: 'Bad request' }); }
  const kind = body.kind || 'forge', K = KINDS[kind], messages = body.messages;
  if (!K || !Array.isArray(messages) || !messages.length || messages.length > 4 ||
      messages.some((m) => !m || !['system', 'user'].includes(m.role) || typeof m.content !== 'string') ||
      JSON.stringify(messages).length > 40000) return out(400, { error: 'Bad request' });

  let key: string;
  try {
    [{ key }] = await sql`select fand_private.ai_key(${user.id}::uuid, ${kind}, ${K.limit}) as key`;
  } catch (e) {
    const m = String((e as Error).message || e);
    if (m.includes('daily limit')) return out(429, { error: `That's today's ${K.limit} ${K.what} for this account. Try again tomorrow.` });
    if (m.includes('no key')) return out(503, { error: 'This site has no Groq key for that yet. Add your own in Settings.' });
    console.error('ai_key', m);
    // say which setup step is missing (these messages name database objects only, never a key)
    if (/fand_private|does not exist/i.test(m)) return out(500, { error: 'Server setup: run tools/cloud/schema.sql in the Supabase SQL Editor, then try again.' });
    if (/vault/i.test(m)) return out(500, { error: 'Server setup: Supabase Vault is not available to the function (' + m.slice(0, 120) + ').' });
    if (/connect|ECONN|timeout|password|SUPABASE_DB_URL/i.test(m)) return out(500, { error: 'Server setup: the function could not reach the database (' + m.slice(0, 120) + ').' });
    return out(500, { error: 'The FAND server had a problem: ' + m.slice(0, 160) });
  }

  const call = (model: string, json: boolean) => fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    // a short reply cap: Groq counts the reserved reply against the per-minute token limit
    body: JSON.stringify({ model, messages, temperature: kind === 'sort' ? 0.3 : 0.8, max_completion_tokens: kind === 'sort' ? 600 : 1500, ...(/gpt-oss/i.test(model) ? { reasoning_effort: 'low' } : {}), ...(json ? { response_format: { type: 'json_object' } } : {}) }),
  });
  let model = AUTO_MODEL || K.model, r = await call(model, true), text = r.ok ? '' : await r.text();
  if (!r.ok && modelGone(r.status, text)) { // the model was retired or is not on this account: switch to one that is
    const m = await pickModel(key);
    if (m && m !== model) { console.log('Groq model', model, 'unavailable; using', m); AUTO_MODEL = model = m; r = await call(model, true); text = r.ok ? '' : await r.text(); }
  }
  if (!r.ok && r.status === 400) { r = await call(model, false); text = r.ok ? '' : await r.text(); } // a model without JSON mode
  if (!r.ok) {
    console.error('Groq', r.status, model, text.slice(0, 400));
    let why = ''; try { why = JSON.parse(text).error.message || ''; } catch { /* not JSON */ }
    return out(502, { error: r.status === 429 ? 'Groq is busy or over its limit. Try again in a minute.' : r.status === 401 ? 'Groq did not accept the site\'s key: check it in Supabase Vault.' : r.status === 413 ? 'That request was too large for Groq\'s per-minute limit. Try fewer materials, or wait a minute.' : `Groq returned an error (${r.status})${why ? ': ' + why.slice(0, 200) : ''}.` });
  }
  const j = await r.json();
  try { await sql`select fand_private.ai_used(${user.id}::uuid, ${kind})`; } catch (e) { console.error('ai_used', e); }
  return out(200, { content: j.choices?.[0]?.message?.content || '' });
});
