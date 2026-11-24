// The loot pool: the DM adds treasure, gives items out and splits the coin; every hand-out goes in the Trade history.
module.exports = [
  { name: 'loot pool: add items and coin, give, split evenly, undo; logged in the trade history', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { PARTY.length = 0; PARTY.push({ id: 'l1', name: 'Ara', cls: 'Wizard', level: 3, coins: { gp: 0 }, gear: [], inv: [] }, { id: 'l2', name: 'Bo', cls: 'Fighter', level: 3, coins: { gp: 0 }, gear: [], inv: [] }); saveParty();
      store.set('lootpool', {}); store.set('tradelog', []); store.set('askmass', false); setRole('dm'); renderParty(); });
    await p.waitForTimeout(300); await p.evaluate(() => { const d = document.querySelector('[onclick="lootOpen()"]').closest('details'); d.open = true; });
    await p.click('button:has-text("Loot pool")'); await p.waitForTimeout(150);
    await p.fill('#lp-from', "the dragon's hoard"); await p.dispatchEvent('#lp-from', 'change');
    await p.fill('#lp-n', 'Steel'); await p.fill('#lp-q', '3'); await p.click('#loot button:has-text("Add")'); await p.waitForTimeout(100);
    await p.fill('#lp-n', 'steel'); await p.click('#loot button:has-text("Add")'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => lootPool().items), [{ n: 'Steel', q: 4 }], 'the same item stacks');
    await p.fill('#lp-gp', '25'); await p.click('button:has-text("Add coin")'); await p.waitForTimeout(100);
    await p.selectOption('[data-lpgive="0"]', 'l2'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [PARTY[1].inv.find(z => z[0] === 'Steel')[1], lootPool().items.length]), [4, 0], 'Bo gets the Steel and it leaves the pool');
    await p.click('button:has-text("Split evenly between 2")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [commonGp(PARTY[0]), commonGp(PARTY[1]), lootPool().gp]), [12.5, 12.5, 0], 'the coin splits evenly, down to the silver');
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [commonGp(PARTY[0]), lootPool().gp, store.get('tradelog').length]), [0, 25, 1], 'Undo takes the split back, history too');
    await p.selectOption('#lp-cointo', 'l1'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => commonGp(PARTY[0])), 25, 'all the coin to one');
    const L = await p.evaluate(() => tlRows().map(x => [x.who, x.kind, x.item, x.qty, x.gp, x.src]));
    t.eq(L, [['Ara', 'loot', "coin (from the dragon's hoard)", 1, 25, 'loot'], ['Bo', 'loot', "Steel (from the dragon's hoard)", 4, 0, 'loot']], 'both hand-outs are in the trade history');
    t.ok(await p.evaluate(() => (PARTY[1].log || []).some(e => /Loot \(from the dragon's hoard\): 4 × Steel/.test(e.deed))), 'and on the character\'s log');
  } },
  { name: 'loot pool on a phone', phone: true, run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { store.set('lootpool', { items: [{ n: 'A very long item name that goes on and on', q: 2 }], gp: 10 }); setRole('dm'); lootOpen(); }); await p.waitForTimeout(150);
    t.ok(await p.isVisible('#lp-n'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
