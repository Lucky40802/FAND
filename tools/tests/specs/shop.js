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
// trade requests: a stand-in Supabase client that keeps campaign_trades in memory and applies schema.sql's rules
const fakeTrades = () => {
  const F = window.__TR = { rows: [], n: 0 }, me = () => CL.user && CL.user.id, dm = c => (CL.camps.find(k => k.id === c) || {}).dm === me();
  CL.on = true; CL.ready = Promise.resolve(); CL.sb = {
    from: () => ({ upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }), select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve({ data: JSON.parse(JSON.stringify(F.rows.filter(r => r.requester === me() || dm(r.campaign_id)))), error: null }).then(a, b) }; return c } }),
    rpc: (fn, a) => {
      if (fn === 'fand_request_trade') { const ch = PARTY.find(c => c.id === a.p_character && c.camp === a.p_campaign); if (!ch || (ch._by && ch._by.u !== me())) return Promise.resolve({ error: { message: 'Only your own characters, shared with the campaign, can ask for a trade.' } });
        const id = 't' + (++F.n); F.rows.push({ id, campaign_id: a.p_campaign, character_id: a.p_character, requester: me(), kind: a.p_kind, item: a.p_item, qty: a.p_qty, offer: a.p_offer, note: a.p_note, status: 'open', price: null, reply: '', created_at: new Date(Date.now() + F.n).toISOString() }); return Promise.resolve({ data: id, error: null }) }
      if (fn === 'fand_answer_trade') { const r = F.rows.find(x => x.id === a.p_id); if (!r || r.status !== 'open' || !((a.p_status !== 'withdrawn' && dm(r.campaign_id)) || (a.p_status === 'withdrawn' && r.requester === me()))) return Promise.resolve({ error: { message: 'That request is no longer open, or it is not yours to answer.' } });
        Object.assign(r, { status: a.p_status, price: a.p_status === 'done' ? a.p_price : null, reply: a.p_reply }); return Promise.resolve({ error: null }) }
      return Promise.resolve({ error: null });
    },
    channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {},
  };
};
const asPlayer = () => { CL.user = { id: 'pl1', email: 'p@example.com' }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0;
  PARTY.push({ id: 'ara', name: 'Ara', camp: 'k1', cls: 'Wizard', level: 3, coins: { gp: 50 }, gear: [], inv: [['Iron', 5]] }); saveParty(); HC = null; TR.list = window.__TR.rows.filter(r => r.requester === 'pl1'); TR.loaded = true; setRole('player'); renderShop(); };
const asDM = () => { CL.user = { id: 'dm1', email: 'd@example.com' }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0;
  PARTY.push({ id: 'ara', name: 'Ara', camp: 'k1', _by: { u: 'pl1', n: 'Pat' }, cls: 'Wizard', level: 3, coins: { gp: 50 }, gear: [], inv: [['Iron', 5]] }); saveParty(); HC = []; SHOPST = null; store.set('shop', {}); TR.loaded = false; setRole('dm'); renderShop(); };
module.exports.push(
  { name: 'trade requests: a player asks from the locked Shop, the DM agrees or declines, the player sees the answer', run: async t => {
    let p = await t.open('shop');
    await p.evaluate(fakeTrades); await p.evaluate(asPlayer); await p.waitForTimeout(200);
    t.ok(await p.isVisible('.tr-ask') && /The Shop is locked|DM/.test(await p.innerText('#content')), 'the locked Shop offers the request form');
    await p.fill('#tr-item', 'Steel'); await p.fill('#tr-qty', '2'); await p.fill('#tr-offer', '20'); await p.fill('#tr-note', 'For a new blade'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    await p.selectOption('#tr-kind', 'sell'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => [...$('tr-item').options].some(o => o.value === 'Iron')), 'selling picks from the pack');
    await p.fill('#tr-qty', '9'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(150);
    t.ok(/only have 5/.test(await p.innerText('#toast')), 'not more than they have');
    await p.fill('#tr-qty', '3'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __TR.rows.map(r => [r.kind, r.item, r.qty, r.offer, r.status])), [['buy', 'Steel', 2, 20, 'open'], ['sell', 'Iron', 3, null, 'open']], 'two requests sent');
    t.eq(await p.evaluate(() => document.querySelectorAll('.tr-ask .tr-row').length), 2, 'listed under Your requests');
    // the DM
    await p.evaluate(asDM); await p.waitForTimeout(300);
    t.eq(await p.evaluate(() => document.querySelectorAll('.tr-dm .tr-row').length), 2, 'the DM sees both requests');
    t.ok(/For a new blade/.test(await p.innerText('.tr-dm')), 'with the note');
    const buy = await p.evaluate(() => __TR.rows[0].id), sell = await p.evaluate(() => __TR.rows[1].id);
    t.eq(await p.inputValue('#tp-' + buy), '20', 'the price starts at the offer');
    await p.fill('#tp-' + buy, '15'); await p.fill('#tm-' + buy, 'A deal'); await p.click(`[data-tr="${buy}"] button:has-text("Agree")`); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [PARTY[0].inv.find(z => z[0] === 'Steel')[1], commonGp(PARTY[0]), __TR.rows[0].status, __TR.rows[0].price, __TR.rows[0].reply]), [2, 20, 'done', 15, 'A deal'], 'agreeing moves the Steel and 30 gp, and marks it done');
    await p.click(`[data-tr="${sell}"] button:has-text("Decline")`); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [__TR.rows[1].status, PARTY[0].inv.find(z => z[0] === 'Iron')[1]]), ['declined', 5], 'declining changes nothing in the pack');
    t.eq(await p.evaluate(() => document.querySelectorAll('.tr-dm .tr-row').length), 0, 'answered requests leave the list');
    // back to the player: answers, and withdraw
    await p.evaluate(asPlayer); await p.waitForTimeout(200);
    const txt = await p.innerText('.tr-ask'); t.ok(/Done/.test(txt) && /Declined/.test(txt) && /A deal/.test(txt), 'the player sees what the DM said');
    await p.fill('#tr-item', 'Rope'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    await p.click('.tr-ask button:has-text("Withdraw")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __TR.rows[2].status), 'withdrawn', 'a waiting request can be withdrawn');
  } },
  { name: 'trade requests on a phone', phone: true, run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fakeTrades); await p.evaluate(asPlayer); await p.waitForTimeout(200);
    t.ok(await p.isVisible('#tr-item'), 'the form shows');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
);
