// FAND `forge` Edge Function: runs a Forge with Grok request with the site's own xAI key, for signed-in accounts.
// The key stays in Supabase Vault (see ../../ai-keys.sql); only this function reads it, through fand_private.ai_key,
// and each account gets FORGE_DAILY_LIMIT forges a day. The browser sends the prompt and gets back Grok's reply text.
import postgres from 'npm:postgres@3.4.5';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 1 });
const LIMIT = Number(Deno.env.get('FORGE_DAILY_LIMIT') || 20);
const MODEL = Deno.env.get('GROK_MODEL') || 'grok-4';
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
  if (!user?.id || user.is_anonymous) return out(401, { error: 'Sign in to forge with FAND\'s Grok.' });

  // the prompt: a system and a user message, nothing larger than the Forge sends
  let messages: { role: string; content: string }[];
  try { messages = (await req.json()).messages; } catch { return out(400, { error: 'Bad request' }); }
  if (!Array.isArray(messages) || !messages.length || messages.length > 4 ||
      messages.some((m) => !m || !['system', 'user'].includes(m.role) || typeof m.content !== 'string') ||
      JSON.stringify(messages).length > 150000) return out(400, { error: 'Bad request' });

  let key: string;
  try {
    [{ key }] = await sql`select fand_private.ai_key(${user.id}::uuid, 'forge', ${LIMIT}) as key`;
  } catch (e) {
    const m = String((e as Error).message || e);
    if (m.includes('daily limit')) return out(429, { error: `That's today's ${LIMIT} forges for this account. Try again tomorrow.` });
    if (m.includes('no key')) return out(503, { error: 'This site has no Grok key yet. Add your own in Settings.' });
    console.error('ai_key', m);
    return out(500, { error: 'The forge server had a problem. Try again.' });
  }

  const call = (json: boolean) => fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.8, ...(json ? { response_format: { type: 'json_object' } } : {}) }),
  });
  let r = await call(true);
  if (r.status === 400) r = await call(false); // a model without JSON mode
  if (!r.ok) {
    console.error('xAI', r.status, (await r.text()).slice(0, 400));
    return out(502, { error: r.status === 429 ? 'Grok is busy or out of credit. Try again later.' : `Grok returned an error (${r.status}).` });
  }
  const j = await r.json();
  try { await sql`select fand_private.ai_used(${user.id}::uuid, 'forge')`; } catch (e) { console.error('ai_used', e); }
  return out(200, { content: j.choices?.[0]?.message?.content || '' });
});
