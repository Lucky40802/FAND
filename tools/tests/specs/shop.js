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
      if (fn === 'fand_answer_trade') { const r = F.rows.find(x => x.id === a.p_id), st = r && r.status;
        const ok = r && ((a.p_status === 'done' && ['open', 'agreed'].includes(st) && dm(r.campaign_id)) || (a.p_status === 'declined' && ['open', 'agreed', 'countered'].includes(st) && dm(r.campaign_id)) || (a.p_status === 'withdrawn' && ['open', 'countered', 'agreed'].includes(st) && r.requester === me()));
        if (!ok) return Promise.resolve({ error: { message: 'That request is no longer open, or it is not yours to answer.' } });
        Object.assign(r, { status: a.p_status, price: a.p_status === 'done' ? a.p_price : null }, a.p_status === 'withdrawn' ? {} : { reply: a.p_reply }); return Promise.resolve({ error: null }) }
      if (fn === 'fand_counter_trade') { const r = F.rows.find(x => x.id === a.p_id); if (!r || !['open', 'agreed'].includes(r.status) || !dm(r.campaign_id)) return Promise.resolve({ error: { message: 'no' } }); Object.assign(r, { status: 'countered', price: a.p_price, reply: a.p_reply }); return Promise.resolve({ error: null }) }
      if (fn === 'fand_reply_counter') { const r = F.rows.find(x => x.id === a.p_id); if (!r || r.status !== 'countered' || r.requester !== me()) return Promise.resolve({ error: { message: 'no' } }); if (a.p_accept) { r.status = 'agreed'; r.offer = r.price } else r.status = 'withdrawn'; return Promise.resolve({ error: null }) }
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
module.exports.push(
  { name: 'trade history: Shop trades and answered requests are logged for the DM, filtered, undone, downloaded', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fakeTrades); await p.evaluate(() => store.set('tradelog', []));
    // a player request, then the DM
    await p.evaluate(asPlayer); await p.waitForTimeout(150);
    await p.fill('#tr-item', 'Rope'); await p.fill('#tr-note', 'for the climb'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    await p.evaluate(asDM); await p.evaluate(() => { PARTY.push({ id: 'bo', name: 'Bo', cls: 'Fighter', level: 3, coins: { gp: 40 }, gear: [], inv: [['Iron', 2]] }); saveParty(); store.set('tlopen', true); renderShop(); }); await p.waitForTimeout(300);
    const rq = await p.evaluate(() => __TR.rows[0].id);
    await p.fill('#tp-' + rq, '2'); await p.fill('#tm-' + rq, 'Here you go'); await p.click(`[data-tr="${rq}"] button:has-text("Agree")`); await p.waitForTimeout(250);
    // a DM trade with Bo, and a market sale
    await p.evaluate(() => shopAtAdd('bo')); await p.waitForTimeout(150);
    await p.fill('#dt-n', 'Steel'); await p.fill('#dt-p', '5'); await p.click('button:has-text("Sell to them")'); await p.waitForTimeout(150);
    await p.evaluate(() => { SHOPST.who = 'bo'; renderShop(); }); await p.waitForTimeout(100);
    const list = () => p.$$eval('#tl .tl-row', r => r.map(x => x.querySelector('.tl-what').textContent.replace(/\s+/g, ' ').trim()));
    let L = await list();
    t.ok(L.length === 2 && /Bo bought Steel for 5 gp/.test(L[0]) && /Ara bought Rope for 2 gp/.test(L[1]) && /for the climb/.test(L[1]) && /Here you go/.test(L[1]), 'newest first: the DM trade and the answered request: ' + JSON.stringify(L));
    t.ok(/bought 7 gp/.test(await p.innerText('#tl .tl-sum')), 'with totals');
    await p.selectOption('#tl-who', 'ara'); await p.waitForTimeout(150);
    t.eq((await list()).length, 1, 'filter by player'); await p.selectOption('#tl-who', ''); await p.waitForTimeout(100);
    await p.selectOption('#tl-src', 'dm'); await p.waitForTimeout(150);
    t.ok((await list()).every(x => /Bo/.test(x)), 'filter by kind'); await p.selectOption('#tl-src', ''); await p.waitForTimeout(100);
    await p.fill('#tl-q', 'rope'); await p.waitForTimeout(400);
    t.ok((await list()).length === 1 && await p.evaluate(() => document.activeElement.id === 'tl-q'), 'search, and typing keeps the focus');
    await p.fill('#tl-q', ''); await p.waitForTimeout(400);
    // a trade that is undone leaves no entry
    await p.fill('#dt-n', 'Iron'); await p.fill('#dt-p', '1'); await p.click('button:has-text("Sell to them")'); await p.waitForTimeout(150);
    t.eq((await list()).length, 3, 'logged');
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq((await list()).length, 2, 'undone, and gone from the history');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#tl button:has-text("Download CSV")')]);
    const csv = require('fs').readFileSync(await dl.path(), 'utf8');
    t.ok(/^When,Who,Trade,Item/.test(csv) && /Rope/.test(csv) && /Steel/.test(csv) && dl.suggestedFilename() === 'fand-trade-history.csv', 'the CSV has every row');
    t.eq(await p.evaluate(() => store.get('tradelog').length), 1, 'Shop trades are kept with the DM (requests stay in the campaign)');
  } },
  { name: 'trade history is the DM\'s: players do not see it', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fakeTrades); await p.evaluate(asPlayer); await p.waitForTimeout(150);
    t.ok(!(await p.isVisible('#tl')), 'not on the player\'s Shop page');
  } },
);
module.exports.push(
  { name: 'DM shops: write a shop, sell from it, edit, copy a market, delete with Undo', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(two); await p.evaluate(() => { store.set('myshops', []); setRole('dm'); renderShop(); }); await p.waitForTimeout(150);
    await p.click('button:has-text("＋ New shop")'); await p.waitForTimeout(150);
    await p.fill('#ms-name', 'The Gilded Anvil'); await p.fill('#ms-keeper', 'Hesta'); await p.fill('#ms-line', 'No haggling.');
    await p.fill('#mse [data-ms=n][data-i="0"]', 'Steel'); await p.fill('#mse [data-ms=q][data-i="0"]', '2'); await p.fill('#mse [data-ms=price][data-i="0"]', '10');
    await p.click('#mse button:has-text("Add a row")'); await p.fill('#mse [data-ms=n][data-i="1"]', 'Lucky Horseshoe'); await p.fill('#mse [data-ms=q][data-i="1"]', '1'); await p.fill('#mse [data-ms=price][data-i="1"]', '7');
    await p.click('#mse button:has-text("Save shop")'); await p.waitForTimeout(200);
    const txt = await p.innerText('#content');
    t.ok(/The Gilded Anvil/.test(txt) && /No haggling/.test(txt) && /Sell to Hesta/.test(txt) && /Lucky Horseshoe/.test(txt), 'the shop opens with its name, keeper and stock');
    t.eq(await p.evaluate(() => shopStock().rows.map(r => [r.n, r.q, r.price])), [['Steel', 2, 10], ['Lucky Horseshoe', 1, 7]], 'its stock and prices');
    await p.evaluate(() => { SHOPST.who = 's1'; renderShop(); }); await p.waitForTimeout(100);
    await p.evaluate(() => shopBuy(0)); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [commonGp(PARTY[0]), shopStock().rows[0].q, PARTY[0].inv.find(z => z[0] === 'Steel')[1]]), [90, 1, 1], 'Ara buys a Steel for 10 gp and the stock goes down');
    await p.evaluate(() => { SHOPST.adj = 10; renderShop(); }); t.eq(await p.evaluate(() => shopStock().rows[0].price), 11, 'the DM price change applies');
    await p.evaluate(() => { SHOPST.adj = 0; renderShop(); });
    await p.click('button:has-text("✎ Edit")'); await p.fill('#mse [data-ms=q][data-i="0"]', '5'); await p.click('#mse button:has-text("Save shop")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => shopStock().rows[0].q), 5, 'editing restocks it');
    await p.click('.chips .chip >> nth=0'); await p.waitForTimeout(150);
    t.ok(!/Gilded Anvil/.test(await p.innerText('.shop .panel h4')), 'a market shop chip goes back to the market');
    await p.click('button:has-text("Copy this stock")'); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => MSE.items.length > 0 && /my copy/.test(MSE.name)), 'copying a market starts a shop from its stock');
    await p.click('#mse button:has-text("Save shop")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => myShops().length), 2, 'two shops');
    await p.click('button:has-text("✎ Edit")'); await p.evaluate(() => { window.confirm = () => true; }); await p.click('#mse button:has-text("Delete shop")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => myShops().length), 1, 'deleted'); await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => myShops().length), 2, 'Undo brings it back');
    await p.evaluate(() => { setRole('player'); HC = null; renderShop(); }); await p.waitForTimeout(150);
    t.ok(!/Gilded Anvil/.test(await p.innerText('#content')), 'players never see the DM\'s shop list');
  } },
);
module.exports.push(
  { name: 'haggling: the DM counters, the player agrees, the DM completes at that price; or the player turns it down', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fakeTrades); await p.evaluate(() => { window.__TR.rows.length = 0; });
    await p.evaluate(asPlayer); await p.waitForTimeout(150);
    await p.fill('#tr-item', 'Steel'); await p.fill('#tr-qty', '2'); await p.fill('#tr-offer', '5'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    await p.fill('#tr-item', 'Rope'); await p.click('button:has-text("Send to the DM")'); await p.waitForTimeout(200);
    const [steel, rope] = await p.evaluate(() => __TR.rows.map(r => r.id));
    await p.evaluate(asDM); await p.waitForTimeout(300);
    await p.fill('#tp-' + steel, '12'); await p.fill('#tm-' + steel, 'Steel is dear this season'); await p.click(`[data-tr="${steel}"] button:text-is("Counter")`); await p.waitForTimeout(200);
    await p.fill('#tp-' + rope, '3'); await p.click(`[data-tr="${rope}"] button:text-is("Counter")`); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __TR.rows.map(r => [r.status, r.price])), [['countered', 12], ['countered', 3]], 'both countered, prices in gp each');
    t.ok(/Counter-offers waiting for the player/.test(await p.innerText('.tr-dm')), 'the DM sees them waiting');
    await p.evaluate(asPlayer); await p.waitForTimeout(200);
    t.ok(/DM's price: 12 gp each/.test(await p.innerText('.tr-ask')) && /Steel is dear/.test(await p.innerText('.tr-ask')), 'the player sees the counter and the reply');
    await p.click('.tr-ask .tr-row:has-text("Steel") button:has-text("Agree")'); await p.waitForTimeout(200);
    await p.click('.tr-ask .tr-row:has-text("Rope") button:has-text("Turn down")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __TR.rows.map(r => [r.status, r.offer])), [['agreed', 12], ['withdrawn', null]], 'Steel agreed at 12, Rope turned down');
    await p.evaluate(asDM); await p.waitForTimeout(300);
    t.eq(await p.inputValue('#tp-' + steel), '12', 'the agreed price is filled in');
    t.ok(await p.isVisible(`[data-tr="${steel}"] button:has-text("Complete")`) && !(await p.isVisible(`[data-tr="${steel}"] button:text-is("Counter")`)), 'Complete, no more counters: ' + await p.innerText(`[data-tr="${steel}"]`));
    await p.click(`[data-tr="${steel}"] button:has-text("Complete")`); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [PARTY[0].inv.find(z => z[0] === 'Steel')[1], commonGp(PARTY[0]), __TR.rows[0].status]), [2, 26, 'done'], 'completed: 2 Steel for 24 gp');
  } },
);
module.exports.push(
  { name: 'NPC shopkeepers: an NPC gets a shop stocked for their trade, and opens it after', run: async t => {
    let p = await t.open('npcs');
    await p.evaluate(() => { HC = []; setRole('dm'); store.set('myshops', []); NPCS.length = 0; NPCS.push({ id: 'n1', name: 'Hesta Coldbrook', role: 'Smith', voice: 'gravel and ash', realm: 'Human' }); npcSave2(); renderNpcs(); });
    await p.waitForTimeout(200);
    await p.click('button:has-text("🛒 Shop")'); await p.waitForTimeout(200);
    const m = await p.evaluate(() => ({ name: MSE.name, keeper: MSE.keeper, line: MSE.line, realm: MSE.realm, npc: MSE.npc, n: MSE.items.length, smith: MSE.items.filter(x => findBP(x.n) || findMat(x.n)).length }));
    t.ok(m.name === "Hesta Coldbrook's Smithy" && m.keeper === 'Hesta Coldbrook' && /gravel and ash/.test(m.line) && m.realm === 'Human' && m.npc === 'n1', 'named for them, in their voice: ' + JSON.stringify(m));
    t.ok(m.n > 2 && m.smith === m.n, 'stocked for a smithy (' + m.n + ' items)');
    await p.click('#mse button:has-text("Save shop")'); await p.waitForTimeout(1500);
    t.ok(/shop/.test(p.url()) && await p.evaluate(() => { const s = myShop(shopState().custom); return !!s && s.npc === 'n1'; }), 'saving opens their shop on the Shop page');
    p = await t.open('npcs', p);
    await p.evaluate(() => { HC = []; setRole('dm'); renderNpcs(); }); await p.waitForTimeout(200);
    t.ok(await p.isVisible('button:has-text("🛒 Their shop")'), 'the card now says Their shop');
    await p.click('button:has-text("🛒 Their shop")'); await p.waitForTimeout(1500);
    t.ok(/shop/.test(p.url()) && await p.evaluate(() => myShops().length === 1), 'it opens the same shop, no copy');
  } },
);
module.exports.push(
  { name: 'merchant reputation: trading earns better prices with that shopkeeper; a faction\'s standing counts too', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(two); await p.evaluate(() => { PARTY[0].coins = { gp: 5000 }; saveParty(); store.set('myshops', [{ id: 'm1', name: 'Anvil', keeper: 'Hesta', line: '', realm: 'Human', npc: 'n1', items: [{ n: 'Steel', q: 99, price: 100 }] }]);
      NPCS.length = 0; NPCS.push({ id: 'n1', name: 'Hesta', role: 'Smith', fac: 'god:' + GODS[0].n }); SHOPST.custom = 'm1'; SHOPST.who = 's1'; renderShop(); });
    await p.waitForTimeout(150);
    t.ok(/Full price/.test(await p.innerText('.rep-line')) && /a stranger/.test(await p.innerText('.rep-line')), 'a stranger pays full price');
    const buy = async n => { for (let i = 0; i < n; i++) await p.evaluate(() => shopBuy(0)); await p.waitForTimeout(100); };
    await buy(1); t.eq(await p.evaluate(() => [commonGp(PARTY[0]), repTier(repGp(PARTY[0]))[1]]), [4900, 'known'], '100 gp spent: now known');
    t.eq(await p.evaluate(() => shopStock().rows[0].price && repBuy(100, PARTY[0])), 95, 'known: 5% off');
    await p.waitForTimeout(400); t.ok(/known/.test(await p.innerText('#toast')), 'the shopkeeper says so');
    await buy(5); t.eq(await p.evaluate(() => [repTier(repGp(PARTY[0]))[1], repPct(PARTY[0])]), ['a regular', 10], 'a regular after 500 gp: 10%');
    await p.evaluate(() => { PARTY[0].standing = { [NPCS[0].fac]: { s: 2 } }; saveParty(); renderShop(); });
    t.eq(await p.evaluate(() => repPct(PARTY[0])), 20, 'a friendly standing (+2) with her faction adds 10%');
    await p.evaluate(() => { PARTY[0].standing = { [NPCS[0].fac]: { s: -2 } }; saveParty(); renderShop(); });
    t.eq(await p.evaluate(() => repPct(PARTY[0])), 0, 'a hostile one (−2) takes it away');
    t.eq(await p.evaluate(() => repGp(PARTY[1])), 0, 'Bo has his own standing');
    const before = await p.evaluate(() => repGp(PARTY[0])); await p.evaluate(() => shopBuy(0)); await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => repGp(PARTY[0])), before, 'Undo takes the standing back too');
  } },
);
