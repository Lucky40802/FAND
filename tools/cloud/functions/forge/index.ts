// FAND `forge` Edge Function: runs Groq requests with the site's own keys, for signed-in accounts.
//   kind 'forge'  Forge with Groq (key fand_groq_key, FORGE_DAILY_LIMIT a day, default 20)
//   kind 'sort'   filing a new design on the Blueprints page (key fand_sort_key, SORT_DAILY_LIMIT a day, default 60)
// The keys stay in Supabase Vault (see ../../ai-keys.sql); only this function reads them, through fand_private.ai_key.
// The browser sends the prompt and gets back the reply text.
import postgres from 'npm:postgres@3.4.5';

const DB_URL = Deno.env.get('SUPABASE_DB_URL') || '';
const sql = postgres(DB_URL || 'postgres://missing', { prepare: false, max: 1 });
const KINDS: Record<string, { limit: number; model: string; what: string }> = {
  forge: { limit: Number(Deno.env.get('FORGE_DAILY_LIMIT') || 20), model: Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile', what: 'forges' },
  sort: { limit: Number(Deno.env.get('SORT_DAILY_LIMIT') || 60), model: Deno.env.get('SORT_MODEL') || Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile', what: 'Blueprint filings' },
};
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
      JSON.stringify(messages).length > 150000) return out(400, { error: 'Bad request' });

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

  const call = (json: boolean) => fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ model: K.model, messages, temperature: kind === 'sort' ? 0.3 : 0.8, ...(json ? { response_format: { type: 'json_object' } } : {}) }),
  });
  let r = await call(true);
  if (r.status === 400) r = await call(false); // a model without JSON mode
  if (!r.ok) {
    console.error('Groq', r.status, (await r.text()).slice(0, 400));
    return out(502, { error: r.status === 429 ? 'Groq is busy or over its limit. Try again in a minute.' : `Groq returned an error (${r.status}).` });
  }
  const j = await r.json();
  try { await sql`select fand_private.ai_used(${user.id}::uuid, ${kind})`; } catch (e) { console.error('ai_used', e); }
  return out(200, { content: j.choices?.[0]?.message?.content || '' });
});
