// Accessibility of the newer panels: every field and button has a name a screen reader can say, icon-only buttons are
// labelled, ids are unique, and text has enough contrast (WCAG AA) in both themes.
const audit = root => {
  const el = typeof root === 'string' ? document.querySelector(root) : root; if (!el) return ['missing ' + root];
  const out = [], name = e => (e.getAttribute('aria-label') || e.getAttribute('title') || '').trim() || (e.labels && [...e.labels].map(l => l.textContent).join(' ').trim()) || (e.getAttribute('aria-labelledby') ? (document.getElementById(e.getAttribute('aria-labelledby')) || {}).textContent : '') || '';
  el.querySelectorAll('input:not([type=hidden]),select,textarea').forEach(e => { if (e.offsetParent === null) return; if (!name(e)) out.push('field without a name: ' + (e.id || e.outerHTML.slice(0, 80))) });
  el.querySelectorAll('button,[role=button]').forEach(e => { if (e.offsetParent === null) return; const t = (e.textContent || '').replace(/\s+/g, ' ').trim(); const n = (e.getAttribute('aria-label') || '').trim() || (/[A-Za-z0-9]{2}/.test(t) ? t : '') || (e.getAttribute('title') || '').trim(); if (!n) out.push('button without a name: ' + e.outerHTML.slice(0, 100)) });
  const ids = {}; document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1 }); Object.entries(ids).filter(([, n]) => n > 1).forEach(([k]) => { if (el.querySelector('#' + CSS.escape(k))) out.push('duplicate id: ' + k) });
  const rgb = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const p = m[1].split(',').map(x => +x.trim()); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] } };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b) };
  const bg = e => { let stack = []; for (let x = e; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break } } let base = { r: 255, g: 255, b: 255 }; if (!stack.length || stack[stack.length - 1].a < 1) base = rgb(getComputedStyle(document.body).backgroundColor) || base; for (let i = stack.length - 1; i >= 0; i--) { const c = stack[i]; base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) } } return base };
  const seen = new Set(); el.querySelectorAll('*').forEach(e => { if (e.offsetParent === null || !e.childNodes.length) return; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1); if (!own) return; const cs = getComputedStyle(e); if (+cs.opacity < 1 || e.closest('[disabled],.off,.down')) return; const fg = rgb(cs.color); if (!fg) return; const b = bg(e), l1 = lum(fg), l2 = lum(b), ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05), px = parseFloat(cs.fontSize), large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700); if (ratio < (large ? 3 : 4.5)) { const k = cs.color + '|' + e.className; if (!seen.has(k)) { seen.add(k); out.push(`contrast ${ratio.toFixed(2)} on “${e.textContent.trim().slice(0, 30)}” (${e.tagName.toLowerCase()}.${e.className})`) } } });
  return out;
};
const setup = async (p, theme) => p.evaluate(th => { document.documentElement.dataset.theme = th; CL.on = true; CL.ready = Promise.resolve(); CL.user = { id: 'dm1' }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }];
  CL.sb = { from: () => ({ select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve({ data: [], error: null }).then(a, b) }; return c }, upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }) }), rpc: () => Promise.resolve({ error: null }), channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {} };
  PARTY.length = 0; PARTY.push({ id: 'a', name: 'Ara', camp: 'k1', _by: { u: 'pl1', n: 'Pat' }, cls: 'Wizard', level: 5, coins: { gp: 50 }, gear: ["Abyssal Miner's Pick"], inv: [['Iron', 3]] }, { id: 'b', name: 'Bo', cls: 'Fighter', level: 5, coins: { gp: 9 }, gear: [], inv: [['Rope', 1]] }); saveParty();
  TR.loaded = SW.loaded = LT.loaded = true; TR.list = [{ id: 'r1', campaign_id: 'k1', character_id: 'a', requester: 'pl1', kind: 'buy', item: 'Steel', qty: 2, offer: 5, note: 'please', status: 'open', created_at: new Date().toISOString() }, { id: 'r2', campaign_id: 'k1', character_id: 'a', requester: 'pl1', kind: 'sell', item: 'Iron', qty: 1, status: 'done', price: 2, created_at: new Date().toISOString() }];
  LT.list = [{ id: 'l1', campaign_id: 'k1', n: 'Steel', q: 1, status: 'open', claims: [{ char: 'a', name: 'Ara', mode: 'need', roll: 14 }] }];
  store.set('tradelog', [{ id: 't1', at: Date.now(), cid: 'b', who: 'Bo', kind: 'buy', item: 'Rope', qty: 1, gp: 1, src: 'market', rn: 'Human' }]); store.set('tlopen', true);
  store.set('inbox', [{ id: 'i1', at: Date.now(), t: 'Your DM agreed', go: 'shop', read: false }, { id: 'i2', at: Date.now() - 6e5, t: 'Old notice', go: '', read: true }]);
  store.set('savedq', [{ id: 'sq1', tab: 'bestiary', name: 'Hell monsters', s: { q: '', f: {}, tg: {}, side: '' } }]); store.set('myshops', [{ id: 'ms1', name: 'The Anvil', keeper: 'Hesta', line: 'Hi', realm: 'Human', items: [{ n: 'Steel', q: 2, price: 10 }] }]);
  store.set('lootpool', { items: [{ n: 'Steel', q: 2 }], gp: 10, from: 'a chest' }); store.set('downtime', [{ id: 'd1', cid: 'b', who: 'Bo', act: 'work', label: 'Working a job', days: 7, start: 1, end: 8, at: Date.now() }]); store.set('calevents', [{ id: 'e1', day: 5, t: 'Festival' }]);
  HC = []; setRole('dm'); inboxBadge(); }, theme);
const panels = [
  ['the DM Shop (requests, counter, DM trade, history)', async p => { await p.evaluate(() => { SHOPST = null; renderShop(); shopAtAdd('b'); }); return '#content' }],
  ['the DM shop editor', async p => { await p.evaluate(() => myShopEdit('ms1')); return '#mse' }],
  ['the loot pool', async p => { await p.evaluate(() => lootOpen()); return '#loot' }],
  ['the session timeline', async p => { await p.evaluate(() => { store.set('sess', { at: Date.now() - 36e5 }); sessTimeline(); }); return '#stl' }],
  ['the calendar', async p => { await p.evaluate(() => calOpen()); return '#cal' }],
  ['the inbox', async p => { await p.evaluate(() => { openModal(); inboxToggle(true); }); return '#inboxpop' }],
  ['the trait browser', async p => { await p.evaluate(() => { inboxToggle(false); traitBrowse('fire'); }); return '#wsHost' }],
  ['saved searches on Home', async p => { await p.evaluate(() => { openModal(); renderHome(); }); return '.sq-grid' }],
  ['the player\'s Shop (requests, swaps, loot)', async p => { await p.evaluate(() => { CL.user = { id: 'pl1' }; PARTY[0]._by = null; PARTY[1]._by = { u: 'pl2', n: 'Sam' }; PARTY[1].camp = 'k1'; HC = null; setRole('player'); TR.list.forEach(r => r.status = 'countered'); renderShop(); }); await p.waitForTimeout(400); return '#tr-slot' }],
];
module.exports = ['light', 'dark'].map(theme => ({ name: `accessibility of the new panels (${theme} theme)`, run: async t => {
  let p = await t.open('shop'); const bad = [];
  for (const [label, show] of panels) {
    if (/Home/.test(label)) { p = await t.open('index', p); }
    if (/player/.test(label)) { p = await t.open('shop', p); }
    await setup(p, theme); await p.waitForTimeout(100);
    const sel = await show(p); await p.waitForTimeout(250);
    const v = await p.evaluate(audit, sel);
    if (v.length) bad.push(label + ': ' + v.slice(0, 12).join('; '));
  }
  t.ok(!bad.length, 'every panel passes' + (bad.length ? '\n      ' + bad.join('\n      ') : ''));
} }));
module.exports.push({ name: 'pop-up windows: focus goes in, Tab stays inside, Escape closes and focus comes back', run: async t => {
  const p = await t.open('party');
  await p.evaluate(() => { PARTY.length = 0; PARTY.push({ id: 'a', name: 'Ara', coins: { gp: 5 }, gear: [], inv: [] }); saveParty(); setRole('dm'); renderParty(); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const b = document.createElement('button'); b.id = 'opener'; b.textContent = 'Open'; b.onclick = () => calOpen(); document.body.prepend(b); b.focus(); });
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  t.ok(await p.evaluate(() => $('wsHost').contains(document.activeElement)), 'focus moves into the window');
  t.eq(await p.getAttribute('#wsHost [role=dialog]', 'aria-label'), 'Calendar and downtime', 'the window is named by its heading');
  for (let i = 0; i < 40; i++) await p.keyboard.press('Tab');
  t.ok(await p.evaluate(() => $('wsHost').contains(document.activeElement)), 'Tab stays inside');
  await p.keyboard.press('Shift+Tab'); t.ok(await p.evaluate(() => $('wsHost').contains(document.activeElement)), 'and so does Shift+Tab');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  t.ok(await p.evaluate(() => !$('wsHost').innerHTML && document.activeElement.id === 'opener'), 'Escape closes it and focus returns to the button');
} });
