// The party stash: on this device for a party without a campaign, and shared through campaign_stash for a campaign.
module.exports = [
  { name: 'stash on this device: put in, take out, coin, the log, and limits', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { PARTY.length = 0; PARTY.push({ id: 'a', name: 'Ara', coins: { gp: 20 }, gear: [], inv: [['Iron', 4]] }, { id: 'b', name: 'Bo', coins: { gp: 0 }, gear: [], inv: [] }); saveParty(); store.set('stash', {}); stashOpen(); });
    await p.waitForTimeout(150);
    await p.fill('#sx-q', '3'); await p.click('#stash button:has-text("Put in")'); await p.waitForTimeout(100);
    await p.fill('#sx-gp', '7.5'); await p.click('#stash button:has-text("Put coin in")'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => [stashLocal().items, PARTY[0].inv.find(z => z[0] === 'Iron')[1], commonGp(PARTY[0])]), [{ Iron: 3, '¤gp': 7.5 }, 1, 12.5], 'Ara puts 3 Iron and 7.5 gp in');
    await p.selectOption('#sx-who', 'b'); await p.waitForTimeout(100);
    await p.fill('[data-sxq="Iron"]', '2'); await p.click('[data-sxt="Iron"]'); await p.waitForTimeout(100);
    await p.selectOption('#sx-who', 'b'); await p.fill('[data-sxq="¤gp"]', '5'); await p.click('[data-sxt="¤gp"]'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => [stashLocal().items, PARTY[1].inv.find(z => z[0] === 'Iron')[1], commonGp(PARTY[1])]), [{ Iron: 1, '¤gp': 2.5 }, 2, 5], 'Bo takes 2 Iron and 5 gp');
    t.eq(await p.evaluate(() => stashLocal().log.map(x => [x.who, x.n, x.q])), [['Bo', '¤gp', -5], ['Bo', 'Iron', -2], ['Ara', '¤gp', 7.5], ['Ara', 'Iron', 3]], 'every move is logged, newest first');
    await p.evaluate(() => stashTake('Iron', 9)); await p.waitForTimeout(100);
    t.ok(/only has 1/.test(await p.innerText('#toast')), 'not more than the stash has');
  } },
  { name: 'shared stash: one player puts in, another takes out, through the database', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { const F = window.__SX = { items: {}, log: [] }, me = () => CL.user.id, own = { a: 'pl1', b: 'pl2' };
      CL.on = true; CL.ready = Promise.resolve(); CL.sb = { from: () => ({ upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }), select: () => { const c = { in: () => c, order: () => c, then: (r, j) => Promise.resolve({ data: [{ campaign_id: 'k1', items: Object.assign({}, F.items), log: F.log.slice() }], error: null }).then(r, j) }; return c } }),
        rpc: (fn, a) => { if (fn !== 'fand_stash_move') return Promise.resolve({ error: null }); if (own[a.p_char] !== me()) return Promise.resolve({ error: { message: 'Only your own character, shared with the campaign, can use the stash.' } });
          const have = F.items[a.p_n] || 0; if (a.p_q < 0 && have < -a.p_q) return Promise.resolve({ error: { message: 'The stash only has ' + have + ' of that.' } }); const l = have + a.p_q; if (l <= 0) delete F.items[a.p_n]; else F.items[a.p_n] = l; F.log.unshift({ who: a.p_char, n: a.p_n, q: a.p_q }); return Promise.resolve({ data: Object.assign({}, F.items), error: null }) },
        channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {} }; });
    const as = (who) => p.evaluate(who => { CL.user = { id: who }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0;
      PARTY.push(Object.assign({ id: 'a', name: 'Ara', camp: 'k1', coins: { gp: 0 }, gear: [], inv: [['Rope', 2]] }, who === 'pl1' ? {} : { _by: { u: 'pl1' } }), Object.assign({ id: 'b', name: 'Bo', camp: 'k1', coins: { gp: 0 }, gear: [], inv: [] }, who === 'pl2' ? {} : { _by: { u: 'pl2' } }));
      saveParty(); STASH.loaded = false; STASH.sel = ''; openModal(); stashOpen(); }, who);
    await as('pl1'); await p.waitForTimeout(300);
    t.ok(/Ashfall/.test(await p.innerText('#stash')) || await p.evaluate(() => STASH.sel === 'k1'), 'the campaign\'s stash');
    await p.click('#stash button:has-text("Put in")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => [__SX.items, PARTY[0].inv.find(z => z[0] === 'Rope')[1]]), [{ Rope: 1 }, 1], 'Ara puts a Rope in');
    t.eq(await p.evaluate(() => stashWho('k1').map(c => c.id)), ['a'], 'she can only move things for her own character');
    await as('pl2'); await p.waitForTimeout(300);
    await p.click('[data-sxt="Rope"]'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => [__SX.items, PARTY.find(c => c.id === 'b').inv.find(z => z[0] === 'Rope')[1]]), [{}, 1], 'Bo takes it on his device');
  } },
];
