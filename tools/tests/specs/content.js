// Content coverage: every realm written up, the Inner Realm's dimensions and the Outer Realm's pockets stocked, enough
// monsters at every deep realm's own levels, gear for every slot at every deep realm's levels, high-level spells in every
// school, and a place for every material.
module.exports = [
  { name: 'realm atlas: every realm written up, dimensions stocked', run: async t => {
    const p = await t.open('realms');
    const r = await p.evaluate(() => {
      const A = ATLAS, out = { missing: REALMS.filter(x => !A.realms[x.n] || !A.realms[x.n].ds || !(A.realms[x.n].hooks || []).length).map(x => x.n) };
      out.inner = A.dims.filter(d => d.realm === 'Inner Realm').length; out.outer = A.dims.filter(d => d.realm === 'Outer Realm').length;
      out.thin = A.dims.filter(d => d.mats.length < 2 || d.gear.length < 2 || d.mons.length < 3).map(d => d.n + ' ' + d.mats.length + '/' + d.gear.length + '/' + d.mons.length);
      out.broken = A.dims.flatMap(d => d.mats.filter(n => !findMat(n)).concat(d.gear.filter(n => !findBP(n)), d.mons.filter(n => !MON_IDX.get(lc(n)))));
      out.cards = document.querySelectorAll('.dim-card').length;
      return out;
    });
    t.eq(r.missing, [], 'every realm has a write-up with hooks');
    t.ok(r.inner >= 12, 'Inner Realm dimensions: ' + r.inner); t.ok(r.outer >= 15, 'Outer Realm pockets: ' + r.outer);
    t.eq(r.thin, [], 'every dimension has materials, gear and natives'); t.eq(r.broken, [], 'every dimension link resolves');
    t.eq(r.cards, r.inner + r.outer, 'the Realms page shows every dimension');
    await p.evaluate(() => openDim('Brassholm')); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => { const d = [...document.querySelectorAll('#modal .dim-card')].find(x => x.dataset.dim === 'Brassholm'); return !!d && d.open; }), 'a dimension link opens its realm at that dimension');
    await p.evaluate(() => openItem(MON_IDX.get('furnace guard'))); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => /Native to Brassholm/.test(document.getElementById('modal').innerText)), 'a native names its dimension');
  } },
  { name: 'deep realms: monsters at their own levels, gear for every slot', run: async t => {
    const p = await t.open('bestiary');
    const r = await p.evaluate(() => {
      const deep = REALMS.filter(x => x.tier >= 3), band = { 3: 21, 4: 31, 5: 41, 6: 51, 7: 61, 8: 71, 9: 81, 10: 91 }, out = { mons: {}, gear: {} };
      deep.forEach(R => {
        const M = MONSTERS.filter(m => m.realm === R.n), cr = m => { const c = String(m.cr || (m.sb && m.sb.cr) || ''); return c.includes('/') ? 0 : +c; };
        const onLevel = M.filter(m => cr(m) >= 11 && cr(m) <= 20).length;
        if (M.length < 50 || onLevel < 15) out.mons[R.n] = M.length + ' monsters, ' + onLevel + ' at CR 11-20';
        const lo = band[R.tier], B = BPS.filter(b => b.lv >= lo && b.lv <= lo + 9 && (b.mats || []).some(n => { const m = findMat(n); return m && m.realm === R.n; }));
        const need = ['Sword', 'Axe', 'Hammer', 'Dagger', 'Spear', 'Bow', 'Staff', 'Shield'].filter(c => !B.some(b => b.cat === c))
          .concat(['Body', 'Head', 'Hands', 'Feet', 'Back'].filter(s => !B.some(b => b.slot === s)), B.some(b => b.cat === 'Focus' || b.cat === 'Artifact') ? [] : ['focus']);
        if (need.length) out.gear[R.n] = need;
      });
      return out;
    });
    t.eq(r.mons, {}, 'each deep realm has 50+ monsters and 15+ at CR 11-20');
    t.eq(r.gear, {}, 'each deep realm has every weapon kind, armor slot, shield and focus at its own levels');
  } },
  { name: 'spells: high levels in every school; spells that roll damage list their dice', run: async t => {
    const p = await t.open('spells');
    const r = await p.evaluate(() => {
      const by = {}; SPELLS.forEach(s => { (by[s.sc] = by[s.sc] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])[s.lv]++; });
      const thin = Object.entries(by).filter(([k, v]) => v[7] < 6 || v[8] < 5 || v[9] < 5).map(([k, v]) => k + ' ' + v.slice(7).join('/'));
      const noDice = SPELLS.filter(s => !s.dmg && /\b\d+d\d+\b[^.]{0,40}\bdamage\b/i.test(s.desc || '') && !/(increases|rises|more) (by )?\d+d\d+|for each slot/i.test(s.desc || '')).map(s => s.n);
      return { thin, res: SPELLS.filter(s => s.sc === 'Resonance').length, noDice: noDice.slice(0, 10) };
    });
    t.eq(r.thin, [], 'every school has 6+ 7th-level and 5+ 8th- and 9th-level spells');
    t.ok(r.res >= 100, 'Resonance has ' + r.res + ' spells');
    t.eq(r.noDice, [], 'spells that roll damage dice list them');
  } },
  { name: 'every material says where it is found', run: async t => {
    const p = await t.open('materials');
    const r = await p.evaluate(() => ({ n: MATS.length, none: MATS.filter(m => !foundOf(m)).map(m => m.n).slice(0, 10) }));
    t.note(r.n + ' materials');
    t.eq(r.none, [], 'materials with no source');
  } },
];
