// UI regressions that have bitten before: generic class names colliding ('set', 'top', 'qcard'), the phone filter badge,
// the More menus, the home shortcut grid, and combat on a phone.
module.exports = [
  { name: 'home shortcuts sit in the grid (not floating) and fill it', run: async t => {
    for (const role of ['dm', 'player']) for (const w of [1280, 820, 390]) {
      const p = await t.ctx.newPage(); await p.setViewportSize({ width: w, height: 900 });
      await p.goto(t.base + 'index.html'); await p.evaluate(r => localStorage.setItem('fand.role', JSON.stringify(r)), role);
      await t.open('index', p);
      const r = await p.evaluate(() => {
        const g = document.querySelector('.qgrid.hq'); if (!g) return { none: 1 };
        const pos = [...document.querySelectorAll('.home-qlink')].map(e => getComputedStyle(e).position);
        const rows = {}; [...g.children].forEach(e => { const r = e.getBoundingClientRect(); rows[Math.round(r.top)] = (rows[Math.round(r.top)] || 0) + r.width; });
        const last = Math.max(...Object.keys(rows).map(Number)); return { pos: [...new Set(pos)], fill: rows[last] / g.getBoundingClientRect().width };
      });
      t.ok(!r.none, 'shortcut grid present'); t.eq(r.pos, ['static'], role + ' ' + w + ' shortcuts are in the flow');
      t.ok(r.fill > 0.9, role + ' ' + w + ' last row is full (' + Math.round(r.fill * 100) + '%)');
      await p.close();
    }
  } },
  { name: 'combat quick card opens as a fixed overlay', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => { store.set('combat', { round: 1, turn: 0, list: [{ id: 'g', name: 'Goblin', mon: 'Goblin', init: 12, hp: 7, max: 7, ac: 1, cond: [] }] }); renderCombat(); });
    await p.click('.cbtile'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => { const q = document.getElementById('qcard'); return q && !q.hidden ? getComputedStyle(q).position : 'none'; }), 'fixed');
  } },
  { name: 'More menu opens and closes on an outside click', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { PARTY.push({ id: 'v1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }); saveParty(); renderParty(); });
    await p.click('details.mmenu>summary');
    t.ok(await p.evaluate(() => !!document.querySelector('details.mmenu[open]')), 'opened');
    await p.mouse.click(5, 400); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => !document.querySelector('details.mmenu[open]')), 'closed');
    await p.click('details.mmenu>summary'); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => !document.querySelector('details.mmenu[open]')), 'Escape closes it');
  } },
  { name: 'phone: filter badge hidden until a filter is set', phone: true, run: async t => {
    const p = await t.open('bestiary');
    const vis = () => p.evaluate(() => getComputedStyle(document.getElementById('ctrl-n')).display);
    t.eq(await vis(), 'none', 'no badge with no filters');
    await p.click('#ctrl .more-btn'); await p.selectOption('#ctrl select[data-f]', { index: 1 }); await p.waitForTimeout(300);
    t.ok(await vis() !== 'none', 'badge shows'); t.eq(await p.textContent('#ctrl-n'), '1');
  } },
  { name: 'phone: combat bottom bar runs the turn', phone: true, run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => { PARTY.push({ id: 'v1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }, { id: 'v2', name: 'Bram', cls: 'Fighter', level: 3, hp: 20, hpMax: 20, gear: [] }); saveParty(); store.set('combat', { round: 1, turn: 0, list: [] }); renderCombat(); });
    await p.click('text=+ Add the party'); await p.waitForTimeout(300);
    t.eq(await p.evaluate(() => CB.list.length), 2, 'party added from the empty state');
    const t0 = await p.evaluate(() => CB.turn); await p.click('.cb-dock-next'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => CB.turn), t0 + 1, 'Next turn advanced');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
  { name: 'phone: table screen and player view fit the screen', phone: true, run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => { PARTY.push({ id: 'pa', name: 'Ara Moonwhisper', cls: 'Cleric', level: 5, hp: 20, hpMax: 32, gear: [] }); saveParty();
      store.set('combat', { round: 2, turn: 1, list: [{ id: 'a', name: 'Ara Moonwhisper', pc: 'pa', init: 15, hp: 20, max: 32, ac: 2, cond: ['Blessed'] },
        { id: 'w', name: "Wolf 1 (Ara Moonwhisper's)", mon: 'Wolf', init: 15, hp: 6, max: 11, ac: 1, cond: [], sum: { by: 'a', base: 'Wolf', left: 3, own: false } },
        { id: 'o', name: 'Orc War Chief', init: 8, hp: 15, max: 93, ac: 2, cond: [] }] }); renderCombat(); });
    const fits = sel => p.evaluate(sel => { const el = document.querySelector(sel); return el ? [...el.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1; }).map(e => e.tagName + ':' + (e.textContent || '').trim().slice(0, 15)) : ['missing ' + sel]; }, sel);
    for (const tab of ['init', 'char']) { await p.evaluate(tab => openTable(tab), tab); await p.waitForTimeout(300); t.eq(await fits('#tbl'), [], 'table screen ' + tab + ' tab fits'); }
    await p.evaluate(() => { document.querySelector('#tbl .tbl-x').click(); pvOpen(); }); await p.waitForTimeout(300);
    t.eq(await fits('#pv'), [], 'player view fits');
    const gutter = await p.evaluate(() => { const r = document.querySelector('#pv .pv-row:not(.on)'); const n = r.querySelector('b,strong,.pv-n') || r.children[1]; return Math.round(n.getBoundingClientRect().left - r.getBoundingClientRect().left); });
    t.ok(gutter <= 20, 'no empty marker column on a phone (' + gutter + 'px)');
  } },
];
