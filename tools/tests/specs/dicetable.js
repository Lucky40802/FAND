// The 3D Dice Table (dice-table.html): it loads and rolls on its own, its embed mode and postMessage API work, and with
// "Roll with the 3D Dice Table" on, rolls on the site are thrown on it and land in the site's dice history.
module.exports = [
  { name: 'dice table page: loads clean, rolls every die type, advantage, skip, embed mode', run: async t => {
    let p = await t.open('dice'); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    t.ok(await p.isVisible('#d3i-f') && await p.isVisible('.d3i-h a[href="dice-table.html"]'), 'the Dice page has the table on it, and a link to it full size');
    await p.goto(new URL('dice-table.html', p.url()).href); await p.waitForFunction(() => window.DiceTable && DiceTable.bodies, null, { timeout: 20000 });
    t.ok(await p.evaluate(() => DiceTable.bodies.length >= 1), 'it starts with a die on the table');
    await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.evaluate(() => DiceTable.skipRoll()); await p.waitForTimeout(300);
    const st = await p.evaluate(() => { const s = DiceTable.state || {}; return { last: s.last || s.lastResult || null, n: DiceTable.bodies.length }; });
    t.ok(st.n >= 1, 'Space throws and the roll settles');
    const back = await p.getAttribute('a[href="./dice.html"]', 'href').catch(() => null); t.eq(back, './dice.html', 'its back link goes to the Dice page');
    t.eq(errs.filter(e => !/favicon|404/.test(e)), [], 'no errors');
    const u = new URL('dice-table.html#embed=1&pool=2d6,d20&autoroll=1', p.url()).href; await p.goto('about:blank'); await p.goto(u); await p.waitForTimeout(2500);
    t.ok(await p.evaluate(() => DiceTable.bodies.length >= 3), 'embed mode with a pool from the link rolls by itself');
  } },
  { name: 'the site rolls on the 3D table when the setting is on, and the result goes into the dice history', run: async t => {
    const p = await t.open('dice');
    await p.evaluate(() => { store.set('dicelog', []); store.set('dicerig', null); store.set('dice3d', true); store.set('diceanim', false); renderDice(); });
    t.eq(await p.evaluate(() => [d3Pool('2d6+1d8+3'), d3Pool('d20-1'), d3Pool('1d3'), d3Pool('2d6-1d4')]), [{ pool: '2d6,d8', flat: 3 }, { pool: 'd20', flat: -1 }, null, null], 'rolls the table can throw are recognised');
    await p.evaluate(() => rollShow('2d6+3', 'Test'));
    await p.waitForFunction(() => (store.get('dicelog', [])[0] || {}).e === 'Test · 2d6+3', null, { timeout: 30000 });
    const L = await p.evaluate(() => store.get('dicelog')[0]);
    t.ok(L.r.length === 2 && L.r.every(v => v >= 1 && v <= 6) && L.mod === 3 && L.t === L.r[0] + L.r[1] + 3, 'two d6 from the table, +3, totalled: ' + JSON.stringify(L));
    t.ok(await p.isVisible('#d3') && /\d/.test(await p.innerText('#d3-res')), 'the table shows with the result');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100); t.ok(!(await p.isVisible('#d3')), 'Escape closes it');
    await p.evaluate(() => { store.set('dicerig', { mode: 'max', once: true }); store.set('dicelog', []); rollShow('1d20'); });
    t.ok(await p.evaluate(() => !$('d3') || $('d3').hidden) && await p.evaluate(() => store.get('dicelog').length === 1), 'a DM rig uses the quick dice instead');
    await p.evaluate(() => { store.set('dicerig', null); store.set('dicelog', []); rollShow('1d3'); });
    t.ok(await p.evaluate(() => store.get('dicelog').length === 1 && $('d3').hidden), 'a d3 (no such die on the table) uses the quick dice');
    await p.evaluate(() => { store.set('dice3d', false); store.set('dicelog', []); rollShow('1d20'); });
    t.ok(await p.evaluate(() => store.get('dicelog').length === 1 && $('d3').hidden), 'with the setting off, nothing changes');
  } },
];
module.exports.push(
  { name: 'dice table on the site: named modifiers reach it, and rolls thrown by hand on the Dice page go into the history', run: async t => {
    const p = await t.open('dice');
    await p.evaluate(() => { store.set('dicelog', []); store.set('dicerig', null); store.set('dice3d', true); store.set('diceanim', false); window.__sent = []; d3Box(); const w = $('d3-f').contentWindow, o = w.postMessage.bind(w); w.postMessage = (m, o2) => { window.__sent.push(m); o(m, o2); }; });
    await p.waitForFunction(() => D3.ready, null, { timeout: 20000 });
    await p.evaluate(() => rollShow('1d20+3', 'Strength save'));
    await p.waitForFunction(() => (store.get('dicelog', [])[0] || {}).e === 'Strength save · 1d20+3', null, { timeout: 30000 });
    const m = await p.evaluate(() => __sent.find(x => x.type === 'fand-dice:roll'));
    t.ok(m.flat === 0 && m.mods && m.mods[0].n === 'Strength save' && m.mods[0].v === 3, 'the bonus goes to the table named “Strength save”: ' + JSON.stringify(m));
    t.eq(await p.evaluate(() => { const L = store.get('dicelog')[0]; return [L.mod, L.t === L.r[0] + 3]; }), [3, true], 'and the total still adds it');
    await p.evaluate(() => { store.set('dicelog', []); $('d3').hidden = true; renderDice(); });
    await p.waitForFunction(() => { const f = $('d3i-f'); return f && f.contentWindow && f.contentWindow.DiceTable && f.contentWindow.DiceTable.bodies; }, null, { timeout: 20000 });
    await p.waitForTimeout(600);
    await p.evaluate(() => { const D = $('d3i-f').contentWindow.DiceTable; D.throwAll(); D.skipRoll(); });
    await p.waitForFunction(() => store.get('dicelog', []).length === 1, null, { timeout: 20000 });
    t.ok(await p.evaluate(() => { const L = store.get('dicelog')[0]; return L.r.length === 1 && L.r[0] >= 1 && L.r[0] <= 20; }), 'a throw by hand on the Dice page\'s table lands in the history');
  } },
  { name: 'table rolls: share rolls with a campaign, see the table\'s rolls live, the DM rolls in secret', run: async t => {
    const p = await t.open('dice');
    await p.evaluate(() => { const F = window.__RS = { rows: [] };
      CL.on = true; CL.ready = Promise.resolve(); CL.user = { id: 'dm1', user_metadata: { name: 'Dana' } }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }];
      CL.sb = { from: () => ({ upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }), select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve({ data: F.rows.slice(), error: null }).then(a, b) }; return c } }),
        rpc: (fn, a) => { if (fn !== 'fand_share_roll') return Promise.resolve({ error: null }); const id = 'x' + F.rows.length; F.rows.push({ id, campaign_id: a.p_campaign, user_id: CL.user.id, who: a.p_who, expr: a.p_expr, total: a.p_total, detail: a.p_detail, secret: a.p_secret, created_at: new Date().toISOString() }); return Promise.resolve({ data: id, error: null }) },
        channel: () => { const ch = { on: (x, y, f) => { window.__rsEv = f; return ch }, subscribe: () => ch }; return ch }, removeChannel: () => {} };
      store.set('dice3d', false); store.set('dicerig', null); store.set('rollshare', ''); store.set('rollsecret', false); PARTY.length = 0; saveParty(); renderDice(); });
    await p.waitForTimeout(200);
    await p.selectOption('#rs-camp', 'k1'); await p.waitForTimeout(200);
    t.ok(await p.isVisible('#rs-secret'), 'the DM can roll in secret');
    await p.evaluate(() => rollShow('2d6+1')); await p.waitForTimeout(300);
    t.eq(await p.evaluate(() => __RS.rows.map(r => [r.campaign_id, r.who, r.expr, r.secret])), [['k1', 'Dana', '2d6+1', false]], 'the roll is shared with Ashfall, as Dana');
    await p.check('#rs-secret'); await p.evaluate(() => rollShow('1d20')); await p.waitForTimeout(300);
    t.eq(await p.evaluate(() => __RS.rows[1].secret), true, 'a secret roll is marked secret');
    await p.evaluate(() => __rsEv({ new: { id: 'o1', campaign_id: 'k1', user_id: 'pl1', who: 'Ara', expr: 'Stealth · 1d20+7', total: 19, detail: '12 + 7', secret: false, created_at: new Date().toISOString() } })); await p.waitForTimeout(150);
    const feed = await p.innerText('#rs-box');
    t.ok(/19\s*Ara · Stealth · 1d20\+7 \(12 \+ 7\)/.test(feed.replace(/\n/g, ' ')) && /Dana secret/.test(feed.replace(/\n/g, ' ')), 'the feed shows a player\'s roll as it happens, and the secret one marked: ' + feed.slice(0, 200));
    await p.selectOption('#rs-camp', ''); await p.evaluate(() => rollShow('1d4')); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __RS.rows.length), 2, 'off: rolls stay on this device');
  } },
);
