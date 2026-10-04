var fs = require('fs');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var D = ROOT + '/Atrious/Spells';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var SCHOOL = {
  'Void Magic': ['Warlock', 'Wizard'], 'Transmutation': ['Artificer', 'Druid', 'Wizard'], 'Abjuration': ['Artificer', 'Cleric', 'Paladin', 'Wizard'],
  'Enchantment': ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], 'Conjuration': ['Druid', 'Sorcerer', 'Warlock', 'Wizard'], 'Runic Magic': ['Artificer', 'Wizard'],
  'Nature Magic': ['Druid', 'Ranger'], 'Healing': ['Bard', 'Cleric', 'Druid', 'Paladin'], 'Infernal': ['Sorcerer', 'Warlock'],
  'Shadow Magic': ['Sorcerer', 'Warlock', 'Wizard'], 'Blood Magic': ['Sorcerer', 'Warlock', 'Wizard'], 'Celestial': ['Cleric', 'Paladin'],
  'Necromancy': ['Cleric', 'Warlock', 'Wizard'], 'Elemental': ['Druid', 'Sorcerer', 'Wizard'], 'Evocation': ['Sorcerer', 'Wizard'],
  'Wild Magic': ['Bard', 'Sorcerer'], 'Illusion': ['Bard', 'Sorcerer', 'Wizard'], 'Psionics': ['Sorcerer', 'Warlock', 'Wizard'],
  'Chronomancy': ['Sorcerer', 'Wizard'], 'Divination': ['Bard', 'Cleric', 'Druid', 'Wizard']
};
// Rune -> class from Runes/Class.md
var RC = {};
fs.readFileSync(ROOT + '/Runes/Class.md', 'utf8').split(/\r?\n/).forEach(function (l) {
  var m = l.match(/^\|\s*\[\[([^\]|\\]+)\]\]\s*\|\s*\[\[FAND\/Atrious\/Classes\/(\w+)/);
  if (m) RC[m[1]] = m[2];
});
var BK = SC + '/backup_spells';
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var n = 0, runeHits = 0, noSchool = {}, dist = {};
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var p = D + '/' + f, t = fs.readFileSync(p, 'utf8');
  if (!/^class:\s*""\s*$/m.test(t)) return;
  var school = (t.match(/^school:\s*"([^"]*)"/m) || [])[1];
  var rune = (t.match(/^rune:\s*"([^"]*)"/m) || [])[1] || '';
  var cls = (SCHOOL[school] || []).slice();
  if (!SCHOOL[school]) { noSchool[school] = (noSchool[school] || 0) + 1; return; }
  if (rune && RC[rune]) { runeHits++; if (cls.indexOf(RC[rune]) < 0) cls.push(RC[rune]); }
  cls.sort();
  var v = cls.join(', ');
  dist[v] = (dist[v] || 0) + 1;
  var nt = t.replace(/^class:\s*""\s*$/m, 'class: "' + v + '"');
  if (MODE === 'go') { fs.writeFileSync(BK + '/' + f, t); fs.writeFileSync(p, nt); }
  n++;
});
console.log(MODE, 'updated', n, 'rune-class hits', runeHits, 'rune map size', Object.keys(RC).length, 'unmapped schools', JSON.stringify(noSchool));
