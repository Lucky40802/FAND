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
module.exports.push(
  { name: 'encounter rewards: preview spoils, then send them to the loot pool', run: async t => {
    const p = await t.open('encounter');
    await p.evaluate(() => { store.set('lootpool', {}); setRole('dm'); const m = MONSTERS.find(x => x.realm === 'Human' && +x.cr >= 3); store.set('enc', { size: 4, level: 5, realm: 'Human', diff: 'Hard', list: [[m.n, 3]] }); renderEncounter(); });
    await p.waitForTimeout(150);
    await p.click('button:has-text("Preview spoils")'); await p.waitForTimeout(150);
    await p.click('button:has-text("Send to the loot pool")'); await p.waitForTimeout(150);
    const P = await p.evaluate(() => [lootPool(), ENC_LAST]);
    t.ok(P[0].items.length === P[1].items.length && P[0].gp === P[1].gp && /the fight with 3 × /.test(P[0].from), 'the pool has the previewed treasure: ' + JSON.stringify(P[0]).slice(0, 200));
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.ok(await p.isVisible('#loot'), 'Open the pool shows it');
  } },
);
// shared loot: a stand-in Supabase client keeps campaign_loot in memory with schema.sql's rules
const fakeLoot = () => {
  const F = window.__LT = { rows: [], n: 0, rolls: [17, 9, 12] }, me = () => CL.user && CL.user.id, owner = id => ({ ara: 'pl1', bo: 'pl2' })[id], nm = { ara: 'Ara', bo: 'Bo' };
  CL.on = true; CL.ready = Promise.resolve(); CL.sb = {
    from: n => ({ upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }),
      select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve({ data: n === 'campaign_loot' ? JSON.parse(JSON.stringify(F.rows)) : [], error: null }).then(a, b) }; return c } }),
    rpc: (fn, a) => { const R = x => Promise.resolve(x);
      if (fn === 'fand_share_loot') { if (me() !== 'dm1') return R({ error: { message: 'Only the DM can share loot.' } }); a.p_items.forEach(it => F.rows.push({ id: 'l' + (++F.n), campaign_id: a.p_campaign, n: it.n, q: it.q, src: a.p_src, status: 'open', claims: [], given_to: null, created_at: new Date().toISOString() })); return R({ data: a.p_items.length, error: null }) }
      const r = F.rows.find(x => x.id === a.p_id);
      if (fn === 'fand_claim_loot') { if (!r || r.status !== 'open' || owner(a.p_char) !== me()) return R({ error: { message: 'no' } }); const roll = a.p_mode === 'pass' ? 0 : F.rolls.shift() || 1; r.claims = r.claims.filter(x => x.char !== a.p_char).concat({ char: a.p_char, name: nm[a.p_char], mode: a.p_mode, roll }); return R({ data: roll, error: null }) }
      if (fn === 'fand_award_loot') { if (!r || r.status !== 'open' || me() !== 'dm1') return R({ error: { message: 'no' } }); r.status = a.p_char ? 'given' : 'withdrawn'; r.given_to = a.p_char; return R({ error: null }) }
      return R({ error: null }) },
    channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {},
  };
};
const device = (p, who) => p.evaluate(who => { CL.user = { id: who }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0;
  [['ara', 'pl1', 'Ara'], ['bo', 'pl2', 'Bo']].forEach(([id, u, n]) => PARTY.push(Object.assign({ id, name: n, camp: 'k1', gear: [], inv: [] }, u === who ? {} : { _by: { u, n: u } })));
  saveParty(); openModal(); LT.list = []; LT.loaded = false; TR.list = []; TR.loaded = true; SW.list = []; SW.loaded = true; HC = who === 'dm1' ? [] : null; setRole(who === 'dm1' ? 'dm' : 'player'); }, who);
module.exports.push(
  { name: 'shared loot: the DM shares, players claim need or greed (rolled), the DM gives it to the winner', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fakeLoot); await device(p, 'dm1');
    await p.evaluate(() => { store.set('lootpool', { items: [{ n: 'Steel', q: 2 }, { n: 'Rope', q: 1 }], gp: 0, from: 'the crypt' }); lootOpen(); }); await p.waitForTimeout(200);
    await p.click('button:has-text("Let players claim the items")'); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [__LT.rows.map(r => [r.n, r.q, r.src]), lootPool().items.length]), [[['Steel', 2, 'the crypt'], ['Rope', 1, 'the crypt']], 0], 'shared, and out of the DM\'s pool');
    // Ara needs the Steel (rolls 17), Bo greeds it (rolls 9) then needs it (12); Ara passes on the Rope
    await device(p, 'pl1'); await p.evaluate(() => renderShop()); await p.waitForSelector('[data-lt="l1"]', { timeout: 5000 });
    t.ok(/Loot to claim/.test(await p.innerText('#content')), 'players see the loot on the Shop page');
    await p.click('[data-lt="l1"] button:has-text("Need")'); await p.waitForTimeout(150);
    await p.click('[data-lt="l2"] button:has-text("Pass")'); await p.waitForTimeout(150);
    await device(p, 'pl2'); await p.evaluate(() => renderShop()); await p.waitForSelector('[data-lt="l1"]', { timeout: 5000 });
    t.ok(/Ara: need 17/.test(await p.innerText('[data-lt="l1"]')), 'Bo sees Ara\'s claim');
    await p.click('[data-lt="l1"] button:has-text("Greed")'); await p.waitForTimeout(150);
    await p.click('[data-lt="l1"] button:has-text("Need")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => __LT.rows[0].claims.map(c => [c.name, c.mode, c.roll])), [['Ara', 'need', 17], ['Bo', 'need', 12]], 'claiming again replaces the claim');
    // the DM awards
    await device(p, 'dm1'); await p.evaluate(() => lootOpen()); await p.waitForTimeout(300);
    t.ok(await p.isVisible('#loot button:has-text("Give to Ara")'), 'the winner: need, highest roll');
    await p.click('#loot button:has-text("Give to Ara")'); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [PARTY.find(c => c.id === 'ara').inv.find(z => z[0] === 'Steel')[1], __LT.rows[0].status, __LT.rows[0].given_to]), [2, 'given', 'ara'], 'Ara gets the Steel');
    t.ok(await p.evaluate(() => tlRows().some(x => x.who === 'Ara' && /Steel \(from the crypt\)/.test(x.item))), 'it goes in the trade history');
    t.ok(!(await p.isVisible('#loot [data-lt="l2"] button.primary')), 'nobody wants the Rope: no winner button');
    await p.click('#loot [data-lt="l2"] button[title="Back to your pool"]'); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => [__LT.rows[1].status, lootPool().items]), ['withdrawn', [{ n: 'Rope', q: 1 }]], 'taken back to the pool');
  } },
);
module.exports.push(
  { name: 'quest rewards: a Done quest puts its reward in the loot pool once; due quests show on the calendar and timeline', run: async t => {
    const p = await t.open('party');
    const r = await p.evaluate(() => { window.arQueue = () => {}; store.set('lootpool', {}); store.set('questlog', []); setRole('dm');
      const q = { id: 'q1', kind: 'quest', title: 'Rats in the cellar', data: { status: 'Done', rgp: '50 gp', ritems: '2 × Steel, Healing Potion; 3x Iron' } };
      const parsed = questItems(q.data.ritems); questPay(q); const first = JSON.parse(JSON.stringify(lootPool())); questPay(q);
      return { parsed, first, second: lootPool(), paid: !!q.data.paid, log: store.get('questlog').map(x => x.t) }; });
    t.eq(r.parsed, [{ n: 'Steel', q: 2 }, { n: 'Healing Potion', q: 1 }, { n: 'Iron', q: 3 }], '“2 × Steel, Healing Potion; 3x Iron” reads as three items');
    t.ok(r.first.gp === 50 && r.first.items.length === 3 && /Rats in the cellar/.test(r.first.from) && r.paid, 'the reward goes to the pool: ' + JSON.stringify(r.first));
    t.eq(r.second, r.first, 'and never twice');
    t.ok(/Quest done: Rats in the cellar \(reward: 50 gp, 2 × Steel, Healing Potion, 3 × Iron\)/.test(r.log[0]), 'on the session timeline: ' + r.log[0]);
    const cal = await p.evaluate(() => { ARC.items = [{ id: 'q2', kind: 'quest', title: 'Find the map', data: { status: 'Open', due: '15' } }]; store.set('clock', { day: 10, min: 480, lights: [] }); calOpen(); return $('cal').innerText; });
    t.ok(/Day 15.*in 5 days.*Quest due: Find the map/.test(cal.replace(/\n/g, ' ')), 'a due quest is on the calendar');
    const pl = await p.evaluate(() => { setRole('player'); store.set('lootpool', {}); const q = { kind: 'quest', title: 'X', data: { status: 'Done', rgp: '9' } }; questPay(q); return [lootPool().gp, !!q.data.paid]; });
    t.eq(pl, [0, false], 'a player marking their own quest Done does not touch the DM\'s pool');
  } },
);
