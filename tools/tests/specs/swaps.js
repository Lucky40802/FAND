// Swaps between players: a stand-in Supabase client keeps campaign_swaps in memory with schema.sql's rules. Ara (pl1)
// offers Bo (pl2) some Iron and coin for his Steel; Bo accepts and his half moves; Ara's half moves on her device after.
const fake = () => {
  const F = window.__SW = window.__SW || { rows: [], n: 0 }, me = () => CL.user && CL.user.id;
  const owner = id => ({ ara: 'pl1', bo: 'pl2' })[id];
  CL.on = true; CL.ready = Promise.resolve(); CL.sb = {
    from: n => ({ upsert: () => Promise.resolve({ error: null }), delete: () => ({ match: () => Promise.resolve({ error: null }) }),
      select: () => { const c = { in: () => c, order: () => c, then: (a, b) => Promise.resolve(n === 'campaign_swaps' ? { data: JSON.parse(JSON.stringify(F.rows.filter(r => r.from_user === me() || r.to_user === me() || me() === 'dm1'))), error: null } : { data: [], error: null }).then(a, b) }; return c } }),
    rpc: (fn, a) => { const R = x => Promise.resolve(x);
      if (fn === 'fand_offer_swap') { if (owner(a.p_from) !== me()) return R({ error: { message: 'Only your own character, shared with the campaign, can offer a swap.' } });
        const id = 's' + (++F.n); F.rows.push({ id, campaign_id: a.p_campaign, from_char: a.p_from, from_user: me(), to_char: a.p_to, to_user: owner(a.p_to), give: a.p_give, want: a.p_want, note: a.p_note, status: 'offered', from_done: false, to_done: false, created_at: new Date(Date.now() + F.n).toISOString() }); return R({ data: id, error: null }) }
      const r = F.rows.find(x => x.id === a.p_id);
      if (fn === 'fand_answer_swap') { if (!r || r.status !== 'offered' || !((a.p_status !== 'withdrawn' && r.to_user === me()) || (a.p_status === 'withdrawn' && r.from_user === me()))) return R({ error: { message: 'That offer is no longer open, or it is not yours to answer.' } }); r.status = a.p_status; return R({ error: null }) }
      if (fn === 'fand_swap_done') { if (!r || r.status !== 'accepted') return R({ error: { message: 'no' } }); if (r.from_user === me()) r.from_done = true; if (r.to_user === me()) r.to_done = true; return R({ error: null }) }
      return R({ error: null }) },
    channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {},
  };
};
// each account's device: its own character, and the other's as shared (the other's copy shows what was last synced)
const as = (p, who, chars) => p.evaluate(([who, chars]) => { CL.user = { id: who }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0;
  chars.forEach(c => PARTY.push(Object.assign({ camp: 'k1', gear: [] }, c, c.u === who ? {} : { _by: { u: c.u, n: c.u === 'pl1' ? 'Pat' : 'Sam' } }))); PARTY.forEach(c => delete c.u);
  saveParty(); HC = null; TR.list = []; TR.loaded = true; SW.list = []; SW.loaded = false; SW.draft = { give: [], want: [] }; setRole(who === 'dm1' ? 'dm' : 'player'); renderShop(); }, [who, chars]);
const ara = () => ({ id: 'ara', u: 'pl1', name: 'Ara', coins: { gp: 30 }, inv: [['Iron', 5]] }), bo = () => ({ id: 'bo', u: 'pl2', name: 'Bo', coins: { gp: 2 }, inv: [['Steel', 2]] });
module.exports = [
  { name: 'swaps: offer, accept, and both halves move, once each', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fake); await as(p, 'pl1', [ara(), bo()]); await p.waitForTimeout(300);
    t.ok(await p.isVisible('.swp') && /Bo \(Sam\)/.test(await p.innerText('#sw-to')), 'Ara can offer to Bo');
    await p.selectOption('#sw-gn', 'Iron'); await p.fill('#sw-gq', '9'); await p.click('.swp button:has-text("Add") >> nth=0'); await p.waitForTimeout(100);
    await p.fill('#sw-gg', '10'); await p.click('button:has-text("Send the offer")'); await p.waitForTimeout(200);
    t.ok(/don't have 9 × Iron/.test(await p.innerText('#toast')), 'not more than she has');
    await p.click('.swp .chip .sw-x'); await p.selectOption('#sw-gn', 'Iron'); await p.fill('#sw-gq', '3'); await p.click('.swp button:has-text("Add") >> nth=0'); await p.waitForTimeout(100);
    await p.selectOption('#sw-wn', 'Steel'); await p.click('.swp button:has-text("Add") >> nth=1'); await p.waitForTimeout(100);
    await p.fill('#sw-gg', '10'); await p.fill('#sw-note', 'For the climb'); await p.click('button:has-text("Send the offer")'); await p.waitForTimeout(250);
    t.eq(await p.evaluate(() => __SW.rows.map(r => [r.from_char, r.to_char, r.give, r.want, r.status])), [['ara', 'bo', { items: [['Iron', 3]], gp: 10 }, { items: [['Steel', 1]], gp: 0 }, 'offered']], 'the offer is sent');
    t.ok(/Your offers/.test(await p.innerText('.swp')), 'Ara sees it waiting');
    // Bo's device
    await as(p, 'pl2', [ara(), bo()]); await p.waitForTimeout(300);
    t.ok(/Offers to you/.test(await p.innerText('.swp')) && /For the climb/.test(await p.innerText('.swp')), 'Bo sees the offer');
    await p.click('.swp button:has-text("Accept")'); await p.waitForTimeout(300);
    t.eq(await p.evaluate(() => { const b = PARTY.find(c => c.id === 'bo'); return [b.inv.find(z => z[0] === 'Iron')[1], (b.inv.find(z => z[0] === 'Steel') || [])[1], commonGp(b), __SW.rows[0].status, __SW.rows[0].to_done, __SW.rows[0].from_done]; }), [3, 1, 12, 'accepted', true, false], 'Bo gets the Iron and 10 gp and gives 1 Steel; his half is done');
    t.eq(await p.evaluate(() => PARTY.find(c => c.id === 'ara').inv.find(z => z[0] === 'Iron')[1]), 5, 'Bo\'s device leaves Ara alone (it is hers to move)');
    // Ara's device again: her half moves when she loads
    await as(p, 'pl1', [ara(), bo()]); await p.waitForTimeout(400);
    t.eq(await p.evaluate(() => { const a = PARTY.find(c => c.id === 'ara'); return [a.inv.find(z => z[0] === 'Iron')[1], a.inv.find(z => z[0] === 'Steel')[1], commonGp(a), __SW.rows[0].from_done, a.swaps]; }), [2, 1, 20, true, ['s1']], 'Ara gives 3 Iron and 10 gp and gets the Steel');
    await p.evaluate(() => swSync()); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY.find(c => c.id === 'ara').inv.find(z => z[0] === 'Iron')[1]), 2, 'and never twice');
    // decline and withdraw
    await p.selectOption('#sw-gn', 'Iron'); await p.click('.swp button:has-text("Add") >> nth=0'); await p.click('button:has-text("Send the offer")'); await p.waitForTimeout(250);
    await p.click('.swp button:has-text("Withdraw")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __SW.rows[1].status), 'withdrawn', 'Ara can withdraw a waiting offer');
    // the DM sees it in the trade history
    await p.evaluate(() => { CL.user = { id: 'dm1' }; HC = []; setRole('dm'); SW.loaded = false; store.set('tlopen', true); renderShop(); }); await p.waitForTimeout(400);
    t.ok(/Ara gave 3 × Iron, 10 gp to Bo, for Steel/.test((await p.innerText('#tl')).replace(/\s+/g, ' ')), 'the DM\'s trade history has the swap');
  } },
  { name: 'swaps on a phone', phone: true, run: async t => {
    const p = await t.open('shop');
    await p.evaluate(fake); await as(p, 'pl1', [ara(), bo()]); await p.waitForTimeout(300);
    t.ok(await p.isVisible('#sw-gn'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
