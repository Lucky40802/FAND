// The session timeline: fights, trades, loot, rests and journal entries since the session started, in order; the recap
// picks up the trades and loot.
module.exports = [
  { name: 'session timeline: what happened since the session started, in order, with filters', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { const now = Date.now(); store.set('sess', { at: now - 3600e3, d: new Date().toISOString().slice(0, 10) });
      store.set('fights', [{ id: 'f1', at: now - 1800e3, d: '', mons: '2× Wolf', won: true, rounds: 3, dropped: [] }, { id: 'f0', at: now - 7200e3, d: '', mons: 'Old fight', won: true, rounds: 1, dropped: [] }]);
      store.set('tradelog', [{ id: 't1', at: now - 600e3, who: 'Ara', kind: 'buy', item: 'Steel', qty: 2, gp: 20, src: 'market' }, { id: 't2', at: now - 900e3, who: 'Bo', kind: 'loot', item: "coin (from the hoard)", qty: 1, gp: 12.5, src: 'loot' }]);
      store.set('journal', [{ t: 'Long rest', at: now - 300e3, d: new Date().toISOString().slice(0, 10), body: '' }]); sessTimeline(); });
    await p.waitForTimeout(150);
    const rows = await p.$$eval('#stl .stl-row', r => r.map(x => x.children[2].textContent));
    t.eq(rows, ['2× Wolf: won in 3 rounds', 'Bo got 12.5 gp (from the hoard)', 'Ara bought 2 × Steel for 20 gp', 'Long rest for the party'], 'in order, and only since the session started');
    await p.click('#stl [data-stk="trade"]'); await p.waitForTimeout(100);
    t.eq(await p.$$eval('#stl .stl-row', r => r.length), 1, 'filter by kind');
    const rec = await p.evaluate(() => sessRecapText().body);
    t.ok(/## Trades, loot and handouts/.test(rec) && /Ara bought 2 × Steel for 20 gp/.test(rec) && /Bo got 12\.5 gp/.test(rec), 'the recap includes trades and loot: ' + rec);
  } },
  { name: 'session timeline: empty, and on a phone', phone: true, run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { store.set('sess', { at: Date.now() }); store.set('fights', []); store.set('tradelog', []); store.set('journal', []); sessTimeline(); }); await p.waitForTimeout(150);
    t.ok(/Nothing yet/.test(await p.innerText('#stl')), 'says so when empty');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
