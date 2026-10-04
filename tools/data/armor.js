// Armor Class on FAND's flat system: AC is subtracted from each hit's damage, and a full set of iron gear gives 10.
// AC = units (by slot) x material class x (1 + (Item Level - 1) / 20), rounded, minimum 1.
//   Slot units: Body 4, Head 2, Hands 1, Feet 1, Shoulders 1, Back 1 (a full set is 10); Enhancement 1; Mount (barding) 4.
//   Shields: Buckler 1, Shield 2, Tower 3.
//   Material class, from the piece's best material: metal 1, bone/scale/stone/gem 0.7, hide/cloth/other 0.4.
// Used by generators/buildapp.js (website) and generators/vaultac.js (vault notes). The Forge in
// tools/app/template.html has the same formula in armorAC(); keep them in step.
var SLOT_UNITS = { Body: 4, Head: 2, Hands: 1, Feet: 1, Shoulders: 1, Back: 1, Enhancement: 1, Mount: 4 };
var SHIELD_UNITS = { Buckler: 1, Shield: 2, Tower: 3 };
function has(name, words) { return new RegExp('\\b(' + words + ')\\b', 'i').test(name); }
// Same keywords as the vault's original classifier (tools/oneoff/ac.js)
function slotOf(name, cat, vaultSlot) {
  if (cat === 'Shield') return has(name, 'Buckler|Targe|Parma|Adarga|Rotella') ? 'Buckler' : has(name, 'Tower|Slab|Pavise|Scutum|Wall|Bastion|Unmoved') ? 'Tower' : 'Shield';
  if (vaultSlot && SLOT_UNITS[vaultSlot]) return vaultSlot;
  if (/^Rune of /i.test(name)) return 'Enhancement';
  if (has(name, 'Helm|Helmet|Cap|Hat|Hood|Morion|Sallet|Armet|Veil|Crown|Circlet|Mask|Coif|Cowl|Visor')) return 'Head';
  if (has(name, 'Gauntlets|Gauntlet|Bracer|Bracers|Vambrace|Vambraces|Arms|Armlet|Gloves|Mitts')) return 'Hands';
  if (has(name, 'Boots|Greaves|Sabaton|Sabatons|Slippers|Shoes|Sandals|Treads')) return 'Feet';
  if (has(name, 'Pauldron|Pauldrons|Spaulders|Epaulets')) return 'Shoulders';
  if (has(name, 'Cloak|Mantle|Shroud|Cape')) return 'Back';
  if (has(name, 'Insert|Inserts|Coating|Lining')) return 'Enhancement';
  if (has(name, 'Barding|Horseshoe|Horseshoes')) return 'Mount';
  return 'Body';
}
function materialClass(codes) {
  if (codes.indexOf('O') >= 0) return 1;
  if (codes.some(function (c) { return /[BSG]/.test(c || ''); })) return 0.7;
  return 0.4;
}
// mats: [{ tc: type code, il: Item Level }]
function armorAC(name, cat, mats, vaultSlot) {
  var slot = slotOf(name, cat, vaultSlot);
  var units = cat === 'Shield' ? SHIELD_UNITS[slot] : SLOT_UNITS[slot];
  var cls = materialClass(mats.map(function (m) { return m.tc; }));
  var il = mats.reduce(function (a, m) { return Math.max(a, m.il || 1); }, 1);
  return { slot: slot, ac: Math.max(1, Math.round(units * cls * (1 + (il - 1) / 20))) };
}
module.exports = { armorAC: armorAC, slotOf: slotOf, SLOT_UNITS: SLOT_UNITS, SHIELD_UNITS: SHIELD_UNITS };
