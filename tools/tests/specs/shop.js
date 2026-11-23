// The Shop: the DM picks who is at the counter, and trades with them directly at the DM's own price.
const two = () => { PARTY.length = 0; PARTY.push({ id: 's1', name: 'Ara', cls: 'Wizard', level: 3, coins: { gp: 100 }, gear: [], inv: [['Iron', 4], ['Odd Pebble', 2]] }, { id: 's2', name: 'Bo', cls: 'Fighter', level: 3, coins: { gp: 5 }, gear: [], inv: [] }, { id: 's3', name: 'Cy', cls: 'Rogue', level: 3, coins: { gp: 0 }, gear: [], inv: [] }); saveParty(); HC = []; SHOPST = null; store.set('shop', {}); renderShop(); };
module.exports = [
  { name: 'shop: the DM chooses who is at the counter', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(two); await p.waitForTimeout(150);
    const who = () => p.$$eval('#sh-who option', o => o.map(x => x.textContent));
    t.eq(await who(), ['Ara', 'Bo', 'Cy'], 'with nobody added, everyone can shop');
    await p.selectOption('#sh-add', 's2'); await p.waitForTimeout(150);
    await p.selectOption('#sh-add', 's1'); await p.waitForTimeout(150);
    t.eq(await who(), ['Bo', 'Ara'], 'only the players at the counter');
    t.ok(/DM trade with Ara/.test(await p.innerText('.sh-dm')), 'the last one added is the one trading');
    await p.click('.sh-counter .chip:has-text("Bo") button:not(.sh-drop)'); await p.waitForTimeout(150);
    t.ok(/DM trade with Bo/.test(await p.innerText('.sh-dm')), 'a chip switches to that player');
    await p.click('.sh-counter .chip:has-text("Bo") .sh-drop'); await p.waitForTimeout(150);
    t.eq(await who(), ['Ara'], 'and ✕ sends them away');
    t.eq(await p.evaluate(() => store.get('shop').at), ['s1'], 'the counter is saved');
  } },
  { name: 'shop: the DM buys from a player\'s pack and sells them anything, at the DM\'s price, with Undo', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(two); await p.evaluate(() => shopAtAdd('s1')); await p.waitForTimeout(150);
    // buy 2 Odd Pebbles (worth nothing to a merchant) for 3 gp each
    const row = '.sh-dm tr:has-text("Odd Pebble")';
    await p.fill(row + ' input[id^="db-q"]', '2'); await p.fill(row + ' input[id^="db-p"]', '3'); await p.click(row + ' button');
    await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [PARTY[0].inv.some(z => z[0] === 'Odd Pebble'), commonGp(PARTY[0])]), [false, 106], 'the pebbles leave the pack and 6 gp comes in');
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [PARTY[0].inv.find(z => z[0] === 'Odd Pebble')[1], commonGp(PARTY[0])]), [2, 100], 'Undo puts it back');
    // sell them Iron for 10 gp each
    await p.fill('#dt-n', 'Iron'); await p.fill('#dt-q', '3'); await p.fill('#dt-p', '10'); await p.click('button:has-text("Sell to them")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [PARTY[0].inv.find(z => z[0] === 'Iron')[1], commonGp(PARTY[0])]), [7, 70], '3 Iron in, 30 gp out');
    await p.fill('#dt-n', 'Iron'); await p.fill('#dt-q', '1'); await p.fill('#dt-p', '500'); await p.click('button:has-text("Sell to them")'); await p.waitForTimeout(150);
    t.ok(/can't afford/.test(await p.innerText('#toast')), 'too dear: it says so');
    t.eq(await p.evaluate(() => PARTY[0].inv.find(z => z[0] === 'Iron')[1]), 7, 'and nothing changes');
    await p.fill('#dt-n', 'Iron'); await p.fill('#dt-p', '0'); await p.click('button:has-text("Sell to them")'); await p.waitForTimeout(150);
    t.ok(/as a gift/.test(await p.innerText('#toast')), 'price 0 is a gift');
  } },
  { name: 'shop on a phone: the counter and DM trade fit', phone: true, run: async t => {
    const p = await t.open('shop');
    await p.evaluate(two); await p.evaluate(() => shopAtAdd('s1')); await p.waitForTimeout(150);
    t.ok(await p.isVisible('.sh-dm') && await p.isVisible('#dt-n'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
