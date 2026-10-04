var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND';
var A = V + '/FAND/Atrious';
var SC = require('path').join(__dirname, '..', 'data');
var MAP = require(require('path').join(__dirname, '..', 'data', 'profmap.js'));
var NEWS = ['Blacksmithing', 'Carving', 'Tailoring', 'Alchemy', 'Cooking', 'Enchanting', 'Engineering', 'Harvesting', 'Scavenging', 'Navigation'];
var FILE = function (n) { return n === 'Alchemy' ? 'Alchemy (Profession)' : n; };
var PL = function (n, tbl) { return '[[FAND/Atrious/Professions/' + FILE(n) + (tbl ? '\\|' : '|') + n + ']]'; };
var log = [];
function rw(p, fn) { var t = fs.readFileSync(p, 'utf8'), n = fn(t); if (n !== t) { fs.writeFileSync(SC + '/restr2_bak_' + p.split('/').pop(), t); fs.writeFileSync(p, n); log.push('updated ' + p.replace(V + '/', '')); } else log.push('unchanged ' + p.replace(V + '/', '')); }
function dedupe(t) { var re = /(\[\[[^\]]+\]\])((?:, |; | or |, and | and )\1)+/g, o; do { o = t; t = t.replace(re, '$1'); } while (t !== o); return t; }
// counts
var counts = {}; fs.readdirSync(A + '/Blueprints').forEach(function (f) { if (!/\.md$/.test(f)) return; var m = fs.readFileSync(A + '/Blueprints/' + f, 'utf8').match(/^profession:\s*"([^"]*)"/m); if (m) counts[m[1]] = (counts[m[1]] || 0) + 1; });
var total = Object.keys(counts).reduce(function (s, k) { return s + counts[k]; }, 0);
// 1. Blueprints Index
rw(A + '/Blueprints Index.md', function (t) {
  var lines = t.split(/\r?\n/), out = [], done = false;
  lines.forEach(function (l) {
    if (/^- \[\[FAND\/Atrious\/Blueprints\/.*\.base\|/.test(l)) { if (!done) { NEWS.slice().sort().forEach(function (n) { out.push('- [[FAND/Atrious/Blueprints/' + n + '.base|' + n + ']] (' + counts[n] + ')'); }); done = true; } return; }
    out.push(l);
  });
  return out.join('\n').replace(/All \d+ blueprints, organized by crafting profession\. Individual notes with YAML frontmatter \(profession, category/, 'All ' + total + ' blueprints, organized by the 10 crafting professions. Individual notes with YAML frontmatter (profession, specialty, category');
});
// 2. Master Professions
var MP = ['# Master Professions', '', 'FAND has **10 crafting professions**. Each covers a whole field of work; the older, narrower crafts (Infernal Forging, Golemancy, Sigilcraft, and so on) are now **specialties** inside them, listed on each profession\'s page. See [[FAND/Atrious/Crafting Rules|Crafting Rules]] for how a Blueprint, materials, and a profession level become an item, and [[FAND/Atrious/Profession Progression|Profession Progression]] for how professions level up.', '',
  '| Profession | Covers | Specialties | Blueprints |', '|---|---|---|---|'];
var COVER = { Blacksmithing: 'All metalwork: weapons, armor, tools', Carving: 'Wood, stone, bone, scale, crystal, coral', Tailoring: 'Cloth, leather, hide, silk', Alchemy: 'Potions, poisons, oils, blood arts', Cooking: 'Meals and feasts, mundane and spirit-touched', Enchanting: 'Runes, glyphs, bound souls and elements, relics', Engineering: 'Mechanisms, constructs, siege weapons, buildings', Harvesting: 'Farming, mining, foraging, animals', Scavenging: 'Salvage, butchering monsters, looting', Navigation: 'Maps, charts, instruments, realm routes' };
NEWS.forEach(function (n) { MP.push('| ' + PL(n, true) + ' | ' + COVER[n] + ' | ' + Object.keys(MAP).filter(function (o) { return MAP[o] === n; }).join(', ') + ' | [[FAND/Atrious/Blueprints/' + n + '.base\\|' + counts[n] + ']] |'); });
MP.push('', 'See [[FAND/Atrious/Blueprints Index|Blueprints Index]] for every profession\'s Blueprints.', '');
fs.writeFileSync(SC + '/restr2_bak_Master Professions.md', fs.readFileSync(A + '/Master Professions.md'));
fs.writeFileSync(A + '/Master Professions.md', MP.join('\n')); log.push('rewrote Master Professions');
// 3. Custom Blueprints step 3
rw(A + '/Custom Blueprints.md', function (t) {
  var s = t.indexOf('| Form | Crafter |'), e = t.indexOf('**Profession level required:**');
  if (s < 0 || e < 0) { log.push('MISS custom blueprints section'); return t; }
  var rows = [['Metal weapons, metal armor, helms, gauntlets, metal shields', 'Blacksmithing'], ['Bows, staffs, wands, clubs, wooden, stone, bone, dragon-part, and crystal gear', 'Carving'],
    ['Cloth and leather armor, cloaks, robes, stealth gear', 'Tailoring'], ['Potions, elixirs, oils, poisons, blood items', 'Alchemy'], ['Crossbows, gadgets, constructs, siege weapons, buildings', 'Engineering'],
    ['Runes and sigils on gear; items with a bound soul or elemental core; restored relics', 'Enchanting'], ['Food and drink buffs', 'Cooking'], ['Crops, seed stock, livestock lines', 'Harvesting'], ['Harvesting and salvage tools', 'Scavenging'], ['Maps, charts, navigation instruments', 'Navigation']];
  var block = ['| Form | Crafter |', '|---|---|'].concat(rows.map(function (r) { return '| ' + r[0] + ' | ' + PL(r[1], true) + ' |'; })).concat(['',
    '**Realm specialties.** Hell, Heaven, and Void metals need a Blacksmith with the matching specialty: Infernal Forging (Hell), Celestial Metallurgy (Heaven), or Void Smithing (Void and Inner Void). Without it, the craft is made at disadvantage. A Blacksmith gains a specialty by finishing one item of that metal under a teacher who has it (see ' + PL('Blacksmithing') + ').', '', '']).join('\n');
  return t.slice(0, s) + block + t.slice(e);
});
// 4. dedupe repeated links in relinked notes
['Material Grading.md', 'Crafting Rules.md', 'Armor Class.md', 'Material Refining.md', 'Realm Travel.md', 'Custom Blueprints.md', 'Economy.md', 'Profession Progression.md', "Player's Guide.md"].forEach(function (f) { if (fs.existsSync(A + '/' + f)) rw(A + '/' + f, dedupe); });
// 5. Gathering "Gathered by" plain text, and world data for future regeneration
var olds = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
function remapNames(s) { olds.forEach(function (o) { s = s.split(o).join(MAP[o]); }); return s; }
fs.readdirSync(A + '/Gathering').forEach(function (f) {
  rw(A + '/Gathering/' + f, function (t) {
    return t.split(/\r?\n/).map(function (l) {
      if (!/^\| /.test(l) || /^\|---/.test(l)) return l;
      var c = l.split(' | ');
      if (c.length >= 8) { var by = remapNames(c[6]).split(/,\s*/); var u = []; by.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); }); c[6] = u.join(', '); }
      return c.join(' | ');
    }).join('\n');
  });
});
['world1.js', 'world2.js'].forEach(function (f) {
  var p = SC + '/' + f, t = fs.readFileSync(p, 'utf8');
  t = t.replace(/("[^"]*", "[^"]*")(, "[^"]*"\]\s*[,\]])/g, function (m) { return m; });
  var lines = t.split('\n').map(function (l) {
    var m = l.match(/^(\["[^"]+", \d+, "[A-Z]", "[^"]*", ")([^"]*)(", "[^"]*"\],?)\s*$/);
    if (!m) return l;
    var by = remapNames(m[2]).split(/,\s*/), u = []; by.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); });
    return m[1] + u.join(', ') + m[3];
  });
  fs.writeFileSync(p, lines.join('\n'));
});
// 6. Horizon Walker
rw(A + '/Subclasses/Horizon Walker.md', function (t) { return t.replace("this vault's Astral Navigation profession", "this vault's Navigation profession"); });
console.log(log.join('\n'));
console.log('counts', JSON.stringify(counts), 'total', total);
