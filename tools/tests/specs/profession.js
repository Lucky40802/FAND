// Two professions: a second profession levels on its own, and every crafting and gathering check accepts either one.
module.exports = [
  { name: 'sheet: pick a second profession; specialties from both', run: async t => {
    const p = await t.open('sheet');
    await p.evaluate(() => { PARTY.push({ id: 'dp', name: 'Tam', cls: 'Fighter', level: 10, prof: 'Blacksmithing', profLv: 12, specs: [], gear: [], hp: 50, hpMax: 50 }); saveParty(); SHEET_ID = 'dp'; SHEET_TAB = 'fand'; renderSheet(); });
    t.ok(await p.$('select[data-s="prof2"]'), 'a second-profession picker is offered');
    t.ok(await p.evaluate(() => ![...document.querySelectorAll('select[data-s="prof2"] option')].some(o => o.value === 'Blacksmithing')), 'the first profession is not offered again');
    await p.selectOption('select[data-s="prof2"]', 'Alchemy'); await p.waitForTimeout(200);
    const c = await p.evaluate(() => { const c = PARTY.find(x => x.id === 'dp'); return { prof2: c.prof2, lv: c.prof2Lv, specs: specsFor(c) }; });
    t.eq([c.prof2, c.lv], ['Alchemy', 1], 'second profession starts at level 1');
    t.ok(c.specs.length > 0 && await p.evaluate(() => { const s = specsFor(PARTY.find(x => x.id === 'dp')); return PROFS.Alchemy.abs.some(a => s.includes(a)) && PROFS.Blacksmithing.abs.some(a => s.includes(a)); }), 'specialties come from both');
    t.ok(await p.evaluate(() => /Second profession|Alchemy/.test(document.getElementById('content').innerText)), 'the sheet shows it');
  } },
  { name: 'crafting, forging, scavenging and mining accept either profession', run: async t => {
    const p = await t.open('forge');
    const r = await p.evaluate(() => {
      const c = { id: 'x', name: 'Tam', prof: 'Blacksmithing', profLv: 12, prof2: 'Scavenging', prof2Lv: 10, specs: [] };
      const alch = BPS.find(b => b.pr === 'Alchemy' && b.lv <= 5), smith = BPS.find(b => b.pr === 'Blacksmithing' && b.lv <= 5), scav = BPS.find(b => b.pr === 'Scavenging' && b.lv <= 5);
      const k1 = craftCheck(smith, c), k2 = craftCheck(scav, c), k3 = craftCheck(alch, c);
      return { smith: [k1.lv, !!k1.blocked], scav: [k2.lv, !!k2.blocked], alch: !!k3.blocked, scavBonus: scavBonus(c), mine: mineBonus(c), label: profLabel(c),
        forgeMsg: forgeCheck(alch, c).blocked || '' };
    });
    t.eq(r.smith, [12, false], 'main profession level'); t.eq(r.scav, [10, false], 'second profession level');
    t.ok(r.alch, 'a profession they lack is still blocked'); t.ok(/Blacksmithing and Scavenging/.test(r.forgeMsg), 'the Forge names both: ' + r.forgeMsg);
    t.eq(r.scavBonus, 5, 'scavenging bonus from the second profession'); t.eq(r.mine, 0, 'no mining bonus without Harvesting');
    t.eq(r.label, 'Blacksmithing 12, Scavenging 10');
  } },
  { name: 'removing the first profession promotes the second', run: async t => {
    const p = await t.open('sheet');
    await p.evaluate(() => { PARTY.push({ id: 'dq', name: 'Ro', cls: 'Rogue', level: 5, prof: 'Tailoring', profLv: 6, prof2: 'Cooking', prof2Lv: 3, specs: [], gear: [], hp: 30, hpMax: 30 }); saveParty(); SHEET_ID = 'dq'; SHEET_TAB = 'fand'; renderSheet(); });
    await p.selectOption('select[data-s="prof"]', ''); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => { const c = PARTY.find(x => x.id === 'dq'); return [c.prof, +c.profLv, c.prof2 || '']; }), ['Cooking', 3, '']);
  } },
];
