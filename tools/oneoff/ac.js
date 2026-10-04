var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry'; // dry | go
var BK = SC + '/backup_blueprints';

var HEAVY_P = /^(Blacksmithing|Infernal Forging|Celestial Metallurgy|Clockwork Engineering|Stonecutting|Siege Engineering)$/;
var MED_P = /^(Crystal Shaping|Dragon Carving|Bone Carving|Beast Taming|Woodworking|Elemental Binding|Blood Alchemy|Soul Binding)$/;
// Arcane Tailoring, Shadow Weaving, Astral Navigation, Tide Craft -> Light

function has(name, words) { return new RegExp('\\b(' + words + ')\\b', 'i').test(name); }

function classify(name, cat, prof, lvl) {
  if (cat === 'Shield') {
    if (has(name, 'Buckler|Targe|Parma|Adarga|Rotella')) return { t: 'Buckler', s: 'Shield', ac: Math.max(1, Math.floor(lvl / 3)) };
    if (has(name, 'Tower|Slab|Pavise|Scutum|Wall|Bastion|Unmoved')) return { t: 'Tower Shield', s: 'Shield', ac: Math.max(1, Math.floor(lvl * 0.75)) };
    return { t: 'Shield', s: 'Shield', ac: Math.max(1, Math.floor(lvl / 2)) };
  }
  // Enhancements applied onto worn armor
  if (/^Rune of /i.test(name)) return { t: 'Enhancement', s: 'Enhancement', ac: Math.max(1, Math.floor(lvl / 5)) };
  // Pieces
  var slot = null;
  if (has(name, 'Helm|Helmet|Cap|Hat|Hood|Morion|Sallet|Armet|Veil|Crown|Circlet|Mask')) slot = 'Head';
  else if (has(name, 'Gauntlets|Gauntlet|Bracer|Bracers|Vambrace|Vambraces|Arms|Armlet|Gloves')) slot = 'Hands';
  else if (has(name, 'Boots|Greaves|Sabaton|Sabatons|Slippers|Shoes')) slot = 'Feet';
  else if (has(name, 'Pauldron|Pauldrons')) slot = 'Shoulders';
  else if (has(name, 'Cloak|Mantle|Shroud|Cape')) slot = 'Back';
  if (!slot && has(name, 'Insert|Inserts|Coating|Lining')) return { t: 'Enhancement', s: 'Enhancement', ac: Math.max(1, Math.floor(lvl / 5)) };
  if (slot) return { t: 'Piece', s: slot, ac: Math.max(1, Math.floor(lvl / 4)) };
  if (has(name, 'Barding|Horseshoe')) return { t: 'Barding', s: 'Mount', ac: Math.floor(lvl * 1.5) };
  // Body armor weight
  var w;
  if (has(name, 'Plate|Plates|Hellplate|Sunplate|Full|Colossus|Heavy|Segmentata|Exoskeleton|Throne')) w = 'Heavy';
  else if (has(name, 'Mail|Chainmail|Chain|Scale|Hauberk|Haubergeon|Brigandine|Breastplate|Cuirass|Hamata|Linothorax|Thornmail|Carapace')) w = 'Medium';
  else if (has(name, 'Robe|Clothes|Vest|Doublet|Gambeson|Jerkin|Leather|Shirt|Tabard|Coat')) w = 'Light';
  else if (HEAVY_P.test(prof)) w = 'Heavy';
  else if (MED_P.test(prof)) w = 'Medium';
  else w = 'Light';
  var mult = { Light: 1, Medium: 1.5, Heavy: 2 }[w];
  return { t: w + ' Armor', s: 'Body', ac: Math.max(1, Math.floor(lvl * mult)) };
}

var stats = {}, out = [], changed = 0, samples = {};
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var p = D + '/' + f, t = fs.readFileSync(p, 'utf8');
  var m = t.match(/^category:\s*"?(Armor|Shield)"?\s*$/m);
  if (!m) return;
  if (/^ac:/m.test(t)) return;
  var prof = (t.match(/^profession:\s*"?([^"\r\n]*)"?/m) || [])[1] || '';
  var lvl = parseInt((t.match(/^level:\s*"?(\d+)/m) || [])[1], 10) || 1;
  var name = f.replace(/\.md$/, '');
  var c = classify(name, m[1], prof, lvl);
  var k = c.t + '/' + c.s; stats[k] = (stats[k] || 0) + 1;
  if (!samples[k]) samples[k] = [];
  if (samples[k].length < 4) samples[k].push(name + ' [' + prof + ' L' + lvl + '] ac ' + c.ac);
  var nl = /\r\n/.test(t) ? '\r\n' : '\n';
  var ins = 'ac: "' + c.ac + '"' + nl + 'armorType: "' + c.t + '"' + nl + 'slot: "' + c.s + '"' + nl;
  var nt = t.replace(/^(rarity:[^\r\n]*\r?\n)/m, '$1' + ins);
  if (nt === t) { console.log('NO RARITY LINE: ' + f); return; }
  if (MODE === 'go') { fs.writeFileSync(BK + '/' + f, t); fs.writeFileSync(p, nt); }
  changed++;
});
console.log(stats); console.log(samples); console.log(MODE + ' changed ' + changed);
