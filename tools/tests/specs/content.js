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
  { name: 'balance: in every deep realm, bosses last and minions do not', run: async t => {
    const p = await t.open('encounter');
    const r = await p.evaluate(() => {
      const med = a => { a = a.filter(x => x > 0).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; }, crn = m => { const c = String(m.sb.cr); return c.includes('/') ? +c.split('/')[0] / +c.split('/')[1] : +c; };
      const out = {};
      for (let tier = 3; tier <= 10; tier++) {
        const L = 10 * tier - 5, rn = REALMS.find(x => x.tier === tier).n, chars = ['Fighter', 'Wizard', 'Rogue', 'Cleric'].map(cls => genFill({ cls, level: L }).c);
        const band = (lo, hi) => { const M = MONSTERS.filter(m => m.sb && REALM[m.realm].tier === tier && crn(m) >= lo && crn(m) <= hi); if (!M.length) return null;
          const mon = { hp: med(M.map(m => +m.sb.hp)), ac: med(M.map(m => +m.sb.ac)), h: med(M.map(m => monHits(m.sb).h)), n: med(M.map(m => monHits(m.sb).n)) };
          const party = chars.reduce((a, c) => a + charRound(c, rn, mon.ac).v * 0.85, 0), drop = chars.reduce((a, c) => { const inc = mon.n * Math.max(0, mon.h - charStats(c).ac) * 0.85; return a + (inc > 0 ? Math.min(99, (+c.hpMax) / inc) : 99); }, 0) / chars.length;
          return { kill: mon.hp / party, drop }; };
        out[rn] = { mid: band(11, 20), boss: band(21, 30), low: band(0, 10) };
      }
      return out;
    });
    const bad = [];
    Object.entries(r).forEach(([rn, b]) => {
      if (b.mid && (b.mid.kill < 0.8 || b.mid.kill > 5)) bad.push(rn + ': an on-level monster dies in ' + b.mid.kill.toFixed(1) + ' rounds');
      if (b.boss && b.mid && b.boss.kill < b.mid.kill * 1.2) bad.push(rn + ': bosses die as fast as on-level monsters');
      if (b.low && b.mid && b.low.drop < b.mid.drop * 1.3) bad.push(rn + ': weak monsters hurt as much as on-level ones');
    });
    t.eq(bad, [], 'deep-realm fights keep their shape');
  } },
  { name: 'dimensions at the table and schools of magic', run: async t => {
    let p = await t.open('realms');
    await p.evaluate(() => openDim('Thalassar')); await p.waitForTimeout(150);
    await p.click('#modal .dim-card[data-dim="Thalassar"] button:has-text("Random encounter")');
    t.ok(await p.evaluate(() => /\w/.test(document.querySelector('#modal .dim-card[data-dim="Thalassar"] .dim-out').innerText)), 'a random encounter is rolled');
    await p.click('#modal .dim-card[data-dim="Thalassar"] button:has-text("Someone from here")');
    t.ok(await p.evaluate(() => /from Thalassar/.test(document.querySelector('#modal .dim-card[data-dim="Thalassar"] .dim-out').innerText)), 'an NPC from the dimension');
    p = await t.open('encounter', p);
    await p.evaluate(() => { store.set('enc', { size: 4, level: 55, realm: 'Inner Realm', dim: 'Thalassar', diff: 'Medium', list: [] }); renderEncounter(); rollEncounter(); });
    t.ok(await p.evaluate(() => { const L = store.get('enc', {}).list || []; return L.length > 0 && L.every(([n]) => (MON_IDX.get(lc(n)) || {}).dim === 'Thalassar'); }), 'a fight built in a dimension uses its natives');
    p = await t.open('magic', p);
    const sch = await p.evaluate(() => { const miss = [...new Set(SP.map(x => x.sc))].filter(sc => !SCHOOL_INFO[sc]); return { miss, shown: !!document.querySelector('.school-info') }; });
    t.eq(sch.miss, [], 'every school has a write-up'); t.ok(sch.shown, 'the Magic Towers page shows it');
  } },
];
