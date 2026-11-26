// The 3D Dice Table (dice-table.html): it loads and rolls on its own, its embed mode and postMessage API work, and with
// "Roll with the 3D Dice Table" on, rolls on the site are thrown on it and land in the site's dice history.
module.exports = [
  { name: 'dice table page: loads clean, rolls every die type, advantage, skip, embed mode', run: async t => {
    let p = await t.open('dice'); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    t.ok(await p.isVisible('a.d3-card'), 'the Dice page links to it');
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
