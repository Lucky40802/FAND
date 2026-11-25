// This week (Home): what is waiting for this person's characters.
module.exports = [
  { name: 'this week: loot to claim, offers, counter-offers, downtime and coming events, each with a link', run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => { CL.user = { id: 'pl1' }; CL.camps = [{ id: 'k1', name: 'A', dm: 'dm1' }]; PARTY.length = 0; PARTY.push({ id: 'ara', name: 'Ara', camp: 'k1', gear: [], inv: [] }, { id: 'bo', name: 'Bo', camp: 'k1', _by: { u: 'pl2', n: 'Sam' }, gear: [], inv: [] }); saveParty();
      TR.loaded = SW.loaded = LT.loaded = true;
      LT.list = [{ id: 'l1', campaign_id: 'k1', n: 'Steel', q: 1, status: 'open', claims: [] }, { id: 'l2', campaign_id: 'k1', n: 'Rope', q: 1, status: 'open', claims: [{ char: 'ara', mode: 'pass', roll: 0 }] }];
      SW.list = [{ id: 's1', campaign_id: 'k1', from_char: 'bo', from_user: 'pl2', to_char: 'ara', to_user: 'pl1', give: { items: [['Iron', 2]] }, want: { gp: 3 }, status: 'offered' }];
      TR.list = [{ id: 'r1', requester: 'pl1', campaign_id: 'k1', character_id: 'ara', kind: 'buy', item: 'Steel', qty: 2, status: 'countered', price: 9 }, { id: 'r2', requester: 'pl1', campaign_id: 'k1', character_id: 'ara', kind: 'buy', item: 'Rope', qty: 1, status: 'open' }];
      store.set('clock', { day: 10, min: 480, lights: [] }); store.set('downtime', [{ id: 'd', cid: 'ara', who: 'Ara', act: 'train', label: "Training: Thieves' tools", start: 5, end: 40 }]); store.set('calevents', [{ id: 'e', day: 12, t: 'The caravan arrives' }, { id: 'f', day: 90, t: 'Far off' }]);
      store.set('inbox', [{ id: 'i', at: Date.now(), t: 'x', read: false }]); renderHome(); });
    await p.waitForTimeout(200);
    const L = await p.$$eval('.wk-row .wk-t', r => r.map(x => x.textContent));
    t.ok(/1 loot item to claim: Steel/.test(L[0]), 'loot not yet claimed (the Rope she passed on is left out): ' + L[0]);
    t.ok(L.some(x => /Bo offers Ara 2 × Iron for 3 gp/.test(x)) && L.some(x => /Your DM offers 9 gp each to buy 2 × Steel/.test(x)), 'the swap offer and the counter-offer');
    t.ok(L.some(x => /1 request or offer waiting on others/.test(x)), 'what she is waiting on');
    t.ok(L.some(x => /Ara: Training: Thieves' tools, 30 days to go/.test(x)) && L.some(x => /Day 12: The caravan arrives/.test(x)) && !L.some(x => /Far off/.test(x)), 'her downtime, and the next two weeks of the calendar');
    t.ok(L.some(x => /1 unread in your inbox/.test(x)), 'unread inbox');
    await p.click('.wk-row:has-text("Training") button'); await p.waitForTimeout(150);
    t.ok(await p.isVisible('#cal'), 'Calendar opens it');
  } },
];
