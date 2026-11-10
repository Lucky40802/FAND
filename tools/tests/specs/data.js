// The built data: unique names, Blueprints made of real materials, and class focus materials kept to their own focuses.
module.exports = [
  { name: 'built data hangs together', run: async t => {
    const p = await t.open('blueprints');
    const r = await p.evaluate(() => {
      const dup = a => { const s = new Set(), d = new Set(); a.forEach(n => { const k = String(n).toLowerCase(); if (s.has(k)) d.add(n); s.add(k); }); return [...d]; };
      const noMat = BPS.filter(b => (b.mats || []).some(n => !findMat(n))).map(b => b.n);
      const focusMats = MATS.filter(m => /^(Virtuoso|Devout|Wildbound|Bloodspark|Pactbound|Arcanist)$/.test(m.pn || ''));
      return { bps: BPS.length, mats: MATS.length, dupBP: dup(BPS.map(b => b.n)).slice(0, 10), dupMat: dup(MATS.map(m => m.n)).slice(0, 10), noMat: noMat.slice(0, 10), noMatN: noMat.length,
        focusMats: focusMats.length, focusNoFlag: focusMats.filter(m => !m.instr).map(m => m.n),
        godLeak: (typeof GODS !== 'undefined' ? GODS : []).filter(g => (g.mats || []).some(n => { const m = findMat(n); return m && m.instr; })).map(g => g.n) };
    });
    t.note(r.bps + ' Blueprints, ' + r.mats + ' materials');
    t.eq(r.dupBP, [], 'Blueprint names are unique'); t.eq(r.dupMat, [], 'material names are unique');
    t.eq(r.noMat, [], 'every Blueprint material exists (' + r.noMatN + ' missing)');
    t.eq(r.focusMats, 66, 'six class focus properties, eleven realms each'); t.eq(r.focusNoFlag, [], 'class focus materials are flagged');
    t.eq(r.godLeak, [], 'gods do not stock class focus materials');
  } },
];
