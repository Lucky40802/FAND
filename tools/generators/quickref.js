var fs = require('fs');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious', D = A + '/Blueprints';
var NEWS = ['Blacksmithing', 'Carving', 'Tailoring', 'Alchemy', 'Cooking', 'Enchanting', 'Engineering', 'Harvesting', 'Scavenging', 'Navigation'];
var LVS = [1, 5, 10, 15, 20];
var bp = {};
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var t = fs.readFileSync(D + '/' + f, 'utf8'), g = function (k) { return ((t.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '').trim(); };
  var p = g('profession'); if (!p) return;
  (bp[p] = bp[p] || []).push({ n: f.slice(0, -3), lv: +g('level') || 0, cat: g('category'), mg: g('materialGrade') });
});
var counts = {}; Object.keys(bp).forEach(function (k) { counts[k] = bp[k].length; });
function pick(list, L) {
  var best = null, cands = [];
  for (var d = 0; d <= 3 && cands.length < 2; d++) {
    cands = list.filter(function (x) { return Math.abs(x.lv - L) <= d && !/ \(|x\d+$/.test(x.n); });
  }
  if (!cands.length) return [];
  cands.sort(function (a, b) { return Math.abs(a.lv - L) - Math.abs(b.lv - L) || (a.n < b.n ? -1 : 1); });
  var out = [], cats = {};
  cands.forEach(function (x) { if (out.length < 2 && !cats[x.cat]) { out.push(x); cats[x.cat] = 1; } });
  if (out.length < 2 && cands.length > 1) cands.forEach(function (x) { if (out.length < 2 && out.indexOf(x) < 0) out.push(x); });
  return out;
}
var UNLOCK = { 1: 'Basic Recipes, +0', 5: 'Advanced Components, +2', 10: 'Rare Crafting, +5', 15: 'Masterwork Techniques, +7', 20: 'Legendary Creation, +10' };
var L = ['# Profession Quick Reference', '', 'What each of the 10 professions can make at key levels, with real Blueprints as examples. A crafter needs a profession level at least equal to an item\'s level (see [[FAND/Atrious/Crafting Rules|Crafting Rules]]). Leveling up is in [[FAND/Atrious/Profession Progression|Profession Progression]], and specialties are on each profession\'s page.', '',
  '## Milestones', '| Level | Unlock and crafting bonus | Also |', '|---|---|---|',
  '| 1 | ' + UNLOCK[1] + ' | Start with one specialty |', '| 5 | ' + UNLOCK[5] + ' | Journeyman: take apprentices; a free specialty |', '| 10 | ' + UNLOCK[10] + ' | Design Rare Custom Blueprints without disadvantage; a free specialty |',
  '| 15 | ' + UNLOCK[15] + ' | Master: matching gods may offer a contract; a free specialty |', '| 20 | ' + UNLOCK[20] + ' | Grandmaster: Abyss-grade and higher crafting at a Realm Forge; a free specialty |', '',
  '## Examples by level', '| Profession | Lv 1 | Lv 5 | Lv 10 | Lv 15 | Lv 20 |', '|---|---|---|---|---|---|'];
NEWS.forEach(function (n) {
  var row = ['[[FAND/Atrious/Professions/' + (n === 'Alchemy' ? 'Alchemy (Profession)' : n) + '\\|' + n + ']] (' + counts[n] + ')'];
  LVS.forEach(function (lv) { var ps = pick(bp[n] || [], lv); row.push(ps.length ? ps.map(function (x) { return '[[FAND/Atrious/Blueprints/' + x.n + '\\|' + x.n + ']]' + (x.lv !== lv ? ' (L' + x.lv + ')' : ''); }).join('<br>') : '—'); });
  L.push('| ' + row.join(' | ') + ' |');
});
L.push('', '## What each profession covers');
var COVER = { Blacksmithing: 'Metal weapons and armor; Hell, Heaven, and Void metals with a realm specialty', Carving: 'Bows, staffs, shields, foci; wood, stone, bone, scale, crystal, coral', Tailoring: 'Light armor, cloaks, robes, bags', Alchemy: 'Potions, poisons, oils, blood items', Cooking: 'Meals that heal, protect, and buff', Enchanting: 'Runes, glyphs, bound souls and elements, restored relics', Engineering: 'Mechanisms, constructs, siege weapons, buildings, lockpicks and climbing gear', Harvesting: 'Gathers ore, stone, crystal, and plants; farms; raises and tames animals', Scavenging: 'Strips hide, bone, blood, organs, and essences from corpses', Navigation: 'Maps, charts, instruments, realm routes' };
NEWS.forEach(function (n) { L.push('- **' + n + ':** ' + COVER[n]); });
L.push('', '## Related', '- [[FAND/Atrious/Master Professions|Master Professions]] · [[FAND/Atrious/Blueprints Index|Blueprints Index]] · [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]', '');
fs.writeFileSync(A + '/Profession Quick Reference.md', L.join('\n'));
console.log('written');
