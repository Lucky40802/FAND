// The Forge: old designs upgrade once to the level-scaled numbers, and the DM forge makes gear for anyone.
module.exports = [
  { name: 'old forged items upgrade once and stay upgraded', run: async t => {
    let p = await t.open('forge');
    const info = await p.evaluate(() => { const v = MATS.find(m => m.n === 'Void Iron'); return { lp: assignParts('Longsword', [v]), ap: assignParts('Cuirass', [v]), il: v.il }; });
    const designs = [
      { n: 'Old Void Longsword', base: 'Longsword', parts: info.lp, il: info.il, dmg: '16d10 + 5 slashing', vers: '16d12 + 3', atk: 2, forged: { q: 'Fine' }, mats: ['Void Iron'], cat: 'Sword' },
      { n: 'Old Void Cuirass', base: 'Cuirass', parts: info.ap, il: info.il, ac: 7, forged: { q: 'Standard' }, mats: ['Void Iron'], cat: 'Armor' }];
    await p.evaluate(d => localStorage.setItem('fand.designs', JSON.stringify(d)), designs);
    p = await t.open('forge', p);
    const a = await p.evaluate(() => DESIGNS.map(d => [d.n, d.dmg || d.ac, d.lvV]));
    t.ok(a.every(x => x[2] === 2), 'both marked upgraded: ' + JSON.stringify(a));
    t.ok(a[0][1] !== '16d10 + 5 slashing', 'the longsword damage was rescaled');
    p = await t.open('forge', p);
    const b = await p.evaluate(() => DESIGNS.map(d => [d.n, d.dmg || d.ac, d.lvV]));
    t.eq(b, a, 'a second load changes nothing');
  } },
  { name: 'DM forge makes an item for the DM or a player', run: async t => {
    const p = await t.open('forge');
    // stand in for an unlocked DM (an empty hidden-content set; no passphrase needed)
    await p.evaluate(() => { PARTY.push({ id: 'pc1', name: 'Ara', level: 5, gear: [], inv: [] }); saveParty(); HC = []; renderForge(); });
    await p.click('.fg-dmbar button:has-text("DM forge")'); await p.waitForTimeout(300);
    t.ok(await p.evaluate(() => forgeDM()), 'DM forge switched on');
    await p.evaluate(() => { FORGE.base = 'Longsword'; FORGE.parts = {}; BASES.Longsword.slots.forEach(sl => { if (sl.optional) return; const m = MATS.find(m => slotFit(sl, m).lv === 'good'); if (m) FORGE.parts[sl.id] = m.n; }); saveForge(); renderForge(); });
    await p.selectOption('#ff-who', 'pc1'); await p.waitForTimeout(200);
    const n0 = await p.evaluate(() => DESIGNS.length);
    await p.click('button:has-text("Make it")'); await p.waitForTimeout(1500);
    t.eq(await p.evaluate(n0 => DESIGNS.length - n0, n0), 1, 'one new design');
    t.eq(await p.evaluate(() => PARTY.find(x => x.id === 'pc1').gear.length), 1, 'Ara holds it');
  } },
];
