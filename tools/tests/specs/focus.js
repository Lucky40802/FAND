// Spellcasting focus: class focus materials (Virtuoso, Devout, Wildbound, Bloodspark, Pactbound, Arcanist) only help their own
// classes, through their own kinds of focus, and the sheet shows the bonus in the spell save DC.
module.exports = [
  { name: 'class focus properties fit their classes and focus kinds', run: async t => {
    const p = await t.open('sheet');
    const r = await p.evaluate(() => {
      const mk = (cls, gear) => focusOf({ cls, level: 10, gear });
      const out = {};
      out.clericSymbol = mk('Cleric', ['Votive Holy Symbol']);
      out.paladinAmulet = mk('Paladin', ['Votive Amulet']);
      out.fighterSymbol = mk('Fighter', ['Votive Holy Symbol']);
      out.wizardSymbol = mk('Wizard', ['Votive Holy Symbol']);
      out.druidTotem = mk('Druid', ['Hearthoak Totem']);
      out.rangerStaff = mk('Ranger', ['Hearthoak Staff']);
      out.sorcCrystal = mk('Sorcerer', ['Bloodruby Crystal']);
      out.warlockRod = mk('Warlock', ['Oathbound Rod']);
      out.wizardWand = mk('Wizard', ['Scribe-Ash Wand']);
      out.artificerTome = mk('Artificer', ['Scribe-Ash Tome']);
      out.bardLute = mk('Bard', ['Starchord Lute']);
      out.multiclass = focusOf({ cls: 'Fighter', cls2: 'Warlock', level: 10, gear: ['Oathbound Rod'] });
      out.plainSymbol = mk('Cleric', ['Holy Symbol']);
      const strip = o => ({ n: o.n, vir: o.vir || 0, virN: o.virN || '', acc: o.acc });
      Object.keys(out).forEach(k => { out[k] = strip(out[k]); });
      out.bpCount = BPS.filter(b => /Devout|Wildbound|Bloodspark|Pactbound|Arcanist/.test(b.ds || '')).length;
      out.notFocus = BPS.filter(b => /Devout|Wildbound|Bloodspark|Pactbound|Arcanist/.test(b.ds || '') && !(genOf(b) && BASES[genOf(b)].focus)).map(b => b.n);
      out.matsLeak = BPS.filter(b => !/Devout|Wildbound|Bloodspark|Pactbound|Arcanist|Virtuoso/.test(b.ds || '') && (b.mats || []).some(n => { const m = findMat(n); return m && /^(Virtuoso|Devout|Wildbound|Bloodspark|Pactbound|Arcanist)$/.test(m.pn || ''); })).map(b => b.n).slice(0, 5);
      return out;
    });
    for (const k of ['clericSymbol', 'paladinAmulet', 'druidTotem', 'rangerStaff', 'sorcCrystal', 'warlockRod', 'wizardWand', 'artificerTome', 'bardLute', 'multiclass'])
      t.ok(r[k].vir > 0, k + ' should get its class focus bonus: ' + JSON.stringify(r[k]));
    t.eq(r.clericSymbol.virN, 'Devout'); t.eq(r.druidTotem.virN, 'Wildbound'); t.eq(r.sorcCrystal.virN, 'Bloodspark');
    t.eq(r.warlockRod.virN, 'Pactbound'); t.eq(r.wizardWand.virN, 'Arcanist'); t.eq(r.bardLute.virN, 'Virtuoso');
    t.eq(r.fighterSymbol.vir, 0, 'a fighter gets no Devout bonus'); t.eq(r.wizardSymbol.vir, 0, 'a wizard gets no Devout bonus');
    t.ok(r.fighterSymbol.n === 'Votive Holy Symbol', 'the holy symbol is still a focus for anyone');
    t.ok(r.plainSymbol.n === 'Holy Symbol', 'a plain Holy Symbol counts as a focus');
    t.eq(r.bpCount, 100, 'ready-made class focuses'); t.eq(r.notFocus, [], 'every class focus Blueprint is a focus');
    t.eq(r.matsLeak, [], 'class focus materials stay out of other Blueprints');
  } },
  { name: 'sheet shows the class focus bonus in the save DC', run: async t => {
    const p = await t.open('sheet');
    const txt = await p.evaluate(() => {
      PARTY.push({ id: 'cf1', name: 'Edda', cls: 'Cleric', level: 10, abil: { wis: 16 }, gear: ['Votive Holy Symbol'], hp: 50, hpMax: 50 }); saveParty();
      SHEET_ID = 'cf1'; SHEET_TAB = 'spells'; renderSheet(); return document.getElementById('content').innerText;
    });
    t.ok(/incl\. Devout \+\d/.test(txt), 'the save DC box says "incl. Devout +N"');
  } },
];
