// Screenshot checks: key screens, drawn from fixed sample data, are compared with the approved pictures in
// tools/tests/screens. More than 0.2% of pixels changed (or a different size) fails, and the new picture and a diff (the
// changed pixels in red) are saved in tools/tests/out/screens. To approve the new look: SCREENS_UPDATE=1 node tools/tests/run.js screens
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'screens'), OUT = path.join(__dirname, '..', 'out', 'screens'), UPDATE = !!process.env.SCREENS_UPDATE, LIMIT = 0.002;
const T0 = Date.UTC(2026, 10, 20, 15, 0);
const still = '#pa-fx,#cs-fx,canvas#fgfx{visibility:hidden!important}*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';
async function compare(p, buf, name) {
  const base = path.join(DIR, name + '.png');
  if (UPDATE || !fs.existsSync(base)) { fs.writeFileSync(base, buf); return { ok: true, note: UPDATE ? 'approved' : 'new: approved as the first picture' }; }
  const r = await p.evaluate(async ([a, b]) => {
    const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const A = await load(a), B = await load(b);
    if (A.width !== B.width || A.height !== B.height) return { size: `${B.width}×${B.height} → ${A.width}×${A.height}` };
    const w = A.width, h = A.height, cv = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const da = cv(A), db = cv(B), out = document.createElement('canvas'); out.width = w; out.height = h; const ox = out.getContext('2d'), od = ox.createImageData(w, h); let n = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]); const hit = d > 60; if (hit) n++; od.data[i] = hit ? 255 : db[i] * .3 + 178; od.data[i + 1] = hit ? 0 : db[i + 1] * .3 + 178; od.data[i + 2] = hit ? 0 : db[i + 2] * .3 + 178; od.data[i + 3] = 255; }
    ox.putImageData(od, 0, 0); return { ratio: n / (w * h), diff: out.toDataURL('image/png') };
  }, ['data:image/png;base64,' + buf.toString('base64'), 'data:image/png;base64,' + fs.readFileSync(base).toString('base64')]);
  if (r.size || r.ratio > LIMIT) {
    fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, name + '.actual.png'), buf);
    if (r.diff) fs.writeFileSync(path.join(OUT, name + '.diff.png'), Buffer.from(r.diff.split(',')[1], 'base64'));
    return { ok: false, note: r.size ? 'size changed ' + r.size : (r.ratio * 100).toFixed(2) + '% of pixels changed; see tools/tests/out/screens/' + name + '.diff.png' };
  }
  return { ok: true, note: (r.ratio * 100).toFixed(3) + '%' };
}
// the same sample party, trades, loot and calendar every time
const sample = (theme) => { document.documentElement.dataset.theme = theme; Math.random = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  CL.on = true; CL.ready = Promise.resolve(); CL.user = { id: 'dm1' }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }];
  CL.sb = { from: () => ({ select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve({ data: [], error: null }).then(a, b) }; return c }, upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }) }), rpc: () => Promise.resolve({ error: null }), channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {} };
  const T0 = Date.UTC(2026, 10, 20, 15, 0);
  PARTY.length = 0; PARTY.push({ id: 'a', name: 'Ara Moonwhisper', camp: 'k1', _by: { u: 'pl1', n: 'Pat' }, cls: 'Wizard', level: 5, race: 'Elf', hp: 22, hpMax: 31, abil: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 }, coins: { gp: 50 }, gear: ["Abyssal Miner's Pick"], inv: [['Iron', 3], ['Rope', 1]] }, { id: 'b', name: 'Bo Hammerfall', cls: 'Fighter', level: 5, coins: { gp: 9 }, gear: [], inv: [['Steel', 2]] }); saveParty();
  TR.loaded = SW.loaded = LT.loaded = STASH.loaded = true; TR.list = [{ id: 'r1', campaign_id: 'k1', character_id: 'a', requester: 'pl1', kind: 'buy', item: 'Steel', qty: 2, offer: 5, note: 'For a new blade', status: 'open', created_at: new Date(T0).toISOString() }];
  LT.list = [{ id: 'l1', campaign_id: 'k1', n: 'Steel', q: 1, status: 'open', claims: [{ char: 'a', name: 'Ara Moonwhisper', mode: 'need', roll: 14 }] }]; SW.list = [];
  store.set('tradelog', [{ id: 't1', at: T0, cid: 'b', who: 'Bo Hammerfall', kind: 'buy', item: 'Rope', qty: 1, gp: 1.5, src: 'market', rn: 'Human' }, { id: 't2', at: T0 - 36e5, cid: 'a', who: 'Ara Moonwhisper', kind: 'loot', item: 'coin (from the crypt)', qty: 1, gp: 12, src: 'loot', rn: 'Human' }]); store.set('tlopen', true);
  store.set('inbox', [{ id: 'i1', at: Date.now() - 2 * 36e5, t: 'Your DM agreed to: buy 2 × Steel', go: 'shop', read: false }, { id: 'i2', at: Date.now() - 5 * 36e5, t: 'Bo offers Ara a swap: Rope for 2 gp', go: 'shop', read: true }]);
  store.set('savedq', [{ id: 'sq1', tab: 'bestiary', name: 'Hell monsters', s: { q: '', f: {}, tg: {}, side: '' } }, { id: 'sq2', tab: 'materials', name: 'Diving metals', s: { q: 'hawk', f: {}, tg: {}, side: '' } }]);
  store.set('myshops', [{ id: 'ms1', name: 'The Gilded Anvil', keeper: 'Hesta', line: 'No haggling.', realm: 'Human', items: [{ n: 'Steel', q: 2, price: 10 }, { n: 'Iron', q: 5, price: 3 }] }]);
  store.set('lootpool', { items: [{ n: 'Steel', q: 2 }, { n: 'Rope', q: 1 }], gp: 10, from: 'the crypt' });
  store.set('clock', { day: 10, min: 480, lights: [] }); store.set('downtime', [{ id: 'd1', cid: 'b', who: 'Bo Hammerfall', act: 'work', label: 'Working a job', days: 7, start: 6, end: 13, at: T0 }]); store.set('calevents', [{ id: 'e1', day: 12, t: 'The caravan arrives' }]);
  store.set('sess', { at: T0 - 2 * 36e5 }); store.set('fights', [{ id: 'f1', at: T0 - 36e5, mons: '2× Wolf', won: true, rounds: 3, dropped: [] }]); store.set('journal', []); store.set('questlog', []);
  store.set('stash', { items: { Steel: 1, '¤gp': 12.5 }, log: [] }); HC = []; setRole('dm'); inboxBadge(); openModal(); };
const SHOTS = [
  ['material-badges', 'materials', async p => { await p.evaluate(() => openItem(MATS.find(m => /^Heaven 7/.test(m.gr) && m.rar))); return '#modal .badges' }],
  ['play-card', 'sheet', async p => { await p.evaluate(() => { SHEET_ID = 'b'; SHEET_TAB = 'core'; renderSheet(); }); return '.pk-card' }],
  ['cursed-box', 'sheet', async p => { await p.evaluate(() => { SHEET_ID = 'a'; PARTY[0]._by = null; SHEET_TAB = 'gear'; renderSheet(); }); return '.cz-box' }],
  ['shop-requests', 'shop', async p => { await p.evaluate(() => { SHOPST = null; renderShop(); }); return '.tr-dm' }],
  ['trade-history', 'shop', async p => { await p.evaluate(() => { SHOPST = null; renderShop(); }); return '#tl' }],
  ['loot-pool', 'party', async p => { await p.evaluate(() => lootOpen()); return '.scav-win' }],
  ['calendar', 'party', async p => { await p.evaluate(() => calOpen()); return '.scav-win' }],
  ['timeline', 'party', async p => { await p.evaluate(() => sessTimeline()); return '.scav-win' }],
  ['stash', 'party', async p => { await p.evaluate(() => { PARTY.forEach(c => { delete c.camp; delete c._by }); stashOpen(); }); return '.scav-win' }],
  ['shop-editor', 'shop', async p => { await p.evaluate(() => myShopEdit('ms1')); return '.scav-win' }],
  ['inbox', 'index', async p => { await p.evaluate(() => inboxToggle(true)); return '#inboxpop' }],
  ['saved-searches', 'index', async p => { await p.evaluate(() => renderHome()); return '.sq-grid' }],
  ['header', 'index', async p => '.top'],
  ['bestiary-cards', 'bestiary', async p => { await p.evaluate(() => { const g = document.querySelector('#content .grid'); if (g) [...g.children].slice(6).forEach(x => x.remove()); }); return '#content .grid' }],
];
const run = (theme, phone) => async t => {
  let p = null; const bad = [], notes = [];
  for (const [name, page, show] of SHOTS) {
    if (phone && ['trade-history', 'bestiary-cards', 'shop-requests'].includes(name)) continue;
    p = await t.open(page, p); await p.addStyleTag({ content: still }); await p.evaluate(sample, theme); await p.waitForTimeout(80);
    const sel = await show(p); await p.waitForTimeout(250); await p.evaluate(() => document.activeElement && document.activeElement.blur());
    const loc = p.locator(sel).first(); if (!(await loc.count())) { bad.push(name + ': not found (' + sel + ')'); continue; }
    const buf = await loc.screenshot({ animations: 'disabled', caret: 'hide', scale: 'css' });
    const r = await compare(p, buf, `${name}-${theme}${phone ? '-phone' : ''}`); (r.ok ? notes : bad).push(name + ': ' + r.note);
  }
  t.ok(!bad.length, `${notes.length} screens match` + (bad.length ? '\n      ' + bad.join('\n      ') : ''));
};
module.exports = [
  { name: 'screenshots match the approved pictures (light, computer)', context: { reducedMotion: 'reduce' }, run: run('light', false) },
  { name: 'screenshots match the approved pictures (dark, computer)', context: { reducedMotion: 'reduce' }, run: run('dark', false) },
  { name: 'screenshots match the approved pictures (dark, phone)', phone: true, context: { reducedMotion: 'reduce' }, run: run('dark', true) },
];
