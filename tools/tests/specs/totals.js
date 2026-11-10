// Gear power totals on the character sheet: property and trait bonuses reach the full totals, caps hold, nothing counts twice.
const P = (n, pot) => ({ k: 'p', n, pot });
module.exports = [
  { name: 'weapon and armor powers reach the sheet totals', run: async t => {
    const p = await t.open('sheet');
    const r = await p.evaluate(() => {
      DESIGNS.push({ n: 'T Flameblade', base: 'Longsword', cat: 'Sword', il: 20, dmg: '13d8 + 2 slashing', atk: 1, props: 'Versatile (1d10)', vers: '13d10 + 2', mats: ['Steel'],
        powers: [{ k: 'p', n: 'Burning', pot: 25 }, { k: 'p', n: 'Tempered', pot: 15 }, { k: 't', n: 'Searing', t: 'A weapon with this material deals +1d6 fire damage and ignites flammable objects it hits.' }], forged: { q: 'Standard' }, lvV: 2, potV: 2 });
      DESIGNS.push({ n: 'T Hardplate', base: 'Cuirass', cat: 'Armor', il: 20, ac: 6, mats: ['Steel'], powers: [{ k: 'p', n: 'Hardened', pot: 20 }, { k: 'p', n: 'Skyborne', pot: 10 }], forged: { q: 'Standard' }, lvV: 2, potV: 2 });
      store.set('designs', DESIGNS); designPlace(true);
      PARTY.push({ id: 'fx1', name: 'Fen', level: 10, abil: { str: 14, dex: 12, con: 12 }, gear: ['T Flameblade', 'T Hardplate'], speed: 30, hp: 40, hpMax: 40 }); saveParty();
      SHEET_ID = 'fx1'; renderSheet();
      const s = charStats(PARTY.find(x => x.id === 'fx1')), txt = document.getElementById('content').innerText;
      return { armorAC: s.armorAC, fxAC: s.fxAC, fxSpeed: s.fxSpeed, line: (txt.match(/13d8[^\n]*/) || [''])[0] };
    });
    t.eq(r.armorAC, 6, 'armor AC'); t.ok(r.fxAC > 0, 'Hardened adds AC'); t.ok(r.fxSpeed > 0, 'Skyborne adds speed');
    t.ok(/fire/.test(r.line) && /\+ \d+ slashing/.test(r.line), 'attack line carries fire dice and the flat bonus: ' + r.line);
  } },
  { name: 'power caps: AC at half the armor, speed at base speed, damage at half the weapon', run: async t => {
    const p = await t.open('sheet');
    const r = await p.evaluate(() => {
      const P = (n, pot) => ({ k: 'p', n, pot }), mk = (n, base, o) => Object.assign({ n, base, lvV: 2, potV: 2, forged: { q: 'Standard' }, mats: ['Steel'], il: 100 }, o);
      const slots = [['Cuirass', 'Armor', 14], ['Helm', 'Armor', 7], ['Gauntlets', 'Armor', 4], ['Boots', 'Armor', 4], ['Shield', 'Shield', 7]];
      const D = slots.map(([b, cat, ac]) => mk('Max ' + b, b, { cat, ac, powers: [P('Tempered', 50), P('Hardened', 50), P('Skyborne', 50)] }));
      D.push(mk('Max Blade', 'Longsword', { cat: 'Sword', dmg: '6d8 + 2 slashing', atk: 5, powers: [P('Burning', 50), P('Freezing', 50), P('Holy', 50)] }));
      DESIGNS.push(...D); store.set('designs', DESIGNS); designPlace(true);
      PARTY.push({ id: 'm1', name: 'Max', level: 100, abil: { con: 10 }, gear: D.map(d => d.n), speed: 30, hp: 500, hpMax: 500 }); saveParty();
      const s = charStats(PARTY.find(x => x.id === 'm1')), f = gearFx(findBP('Max Blade'));
      const pAvg = f.dice.reduce((a, [k, x]) => a + k * (x + 1) / 2, 0) + f.dmg;
      return { armorAC: s.armorAC, fxAC: s.fxAC, acCap: s.fxACcap, fxSpeed: s.fxSpeed, spCap: s.fxSpeedCap, capDmg: !!f.capDmg, pAvg, base: dmgAvg(findBP('Max Blade').design.dmg) };
    });
    t.ok(r.acCap && r.fxAC <= Math.ceil(r.armorAC / 2), 'AC from powers is capped: ' + JSON.stringify(r));
    t.ok(r.spCap && r.fxSpeed <= 30, 'speed from powers is capped at base speed');
    t.ok(r.capDmg && r.pAvg <= r.base / 2 + 0.01, 'weapon power damage is capped at half the weapon');
  } },
  { name: 'nothing counts twice: spare armor and duplicate powers', run: async t => {
    const p = await t.open('sheet');
    const r = await p.evaluate(() => {
      DESIGNS.push({ n: 'Dup Plate', base: 'Cuirass', cat: 'Armor', il: 20, ac: 6, mats: ['Steel'], powers: [{ k: 'p', n: 'Hardened', pot: 20 }], forged: { q: 'Standard' }, lvV: 2, potV: 2 });
      DESIGNS.push({ n: 'Dup Helm', base: 'Helm', cat: 'Armor', il: 20, ac: 3, mats: ['Steel'], powers: [{ k: 'p', n: 'Hardened', pot: 20 }], forged: { q: 'Standard' }, lvV: 2, potV: 2 });
      store.set('designs', DESIGNS); designPlace(true);
      const one = charStats({ id: 'a', level: 5, abil: { con: 10 }, gear: ['Dup Plate'], hp: 1, hpMax: 1 });
      const two = charStats({ id: 'b', level: 5, abil: { con: 10 }, gear: ['Dup Plate', 'Dup Plate'], hp: 1, hpMax: 1 });
      const both = charStats({ id: 'c', level: 5, abil: { con: 10 }, gear: ['Dup Plate', 'Dup Helm'], hp: 1, hpMax: 1 });
      return { one: [one.armorAC, one.fxAC], two: [two.armorAC, two.fxAC], both: [both.armorAC, both.fxAC] };
    });
    t.eq(r.two, r.one, 'a spare cuirass adds nothing');
    t.eq(r.both[1], r.one[1], 'the same power on two pieces counts once');
    t.eq(r.both[0], r.one[0] + 3, 'the helm still adds its own AC');
  } },
];
