var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var DIR = ROOT + '/Atrious/Materials';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js')), PR = require(require('path').join(__dirname, '..', 'data', 'properties.js'));
var all = require(require('path').join(__dirname, '..', 'data', 'all.json'));

// existing note basenames (outside Materials) to avoid link clashes
var names = {};
function walk(d) { fs.readdirSync(d).forEach(function (f) { var p = d + '/' + f; if (p === DIR) return; var s = fs.statSync(p); if (s.isDirectory()) walk(p); else if (/\.md$/.test(f)) names[f.slice(0, -3).toLowerCase()] = p; }); }
walk(ROOT);

function rarity(c, g) {
  var t = R.tier(c);
  if (t === 1) return g <= 5 ? 'Common' : 'Uncommon';
  if (t === 2) return g <= 5 ? 'Uncommon' : 'Rare';
  if (t === 3) return g <= 5 ? 'Rare' : 'Very Rare';
  if (t === 4) return 'Very Rare';
  if (t === 5) return g <= 5 ? 'Very Rare' : 'Legendary';
  if (t <= 7) return 'Legendary';
  return 'Artifact';
}
var BASE = { Hu: 5, My: 50, He: 500, Hv: 500, Ch: 2500, Ab: 10000, In: 50000, Ou: 100000 };
function price(c, g, t) { var b = BASE[c]; if (!b) return 0; var v = b * g * (g >= 9 ? 2 : 1); return t === 'U' ? Math.max(1, Math.round(v / 5)) : v; }
var q = function (s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; };
var safe = function (s) { return s.replace(/[\\/:*?"<>|#^\[\]]/g, '-'); };

var files = {}, clashes = [], dupFile = [];
all.forEach(function (m) {
  var base = safe(m.n);
  if (names[base.toLowerCase()]) { clashes.push(m.n + ' -> ' + names[base.toLowerCase()].replace(ROOT + '/', '')); base += ' (Material)'; }
  if (files[DIR + '/' + base + '.md']) { dupFile.push(base); return; }
  var p = PR.prop(m.n, m.t, m.c, m.g), x = m.x || {};
  var rank = R.rank(m.c, m.g), il = R.level(m.c, m.g), rar = rarity(m.c, m.g);
  var page = x.page || ('FAND/Atrious/' + (/[BL]/.test(m.t) ? 'Bestiary/' + R.name(m.c) + ' Bestiary' : 'Gathering/' + R.name(m.c) + ' Gathering'));
  var pageLabel = page.split('/').pop();
  var drops = [];
  if (x.from) drops.push(x.from);
  (x.also || []).forEach(function (a) { if (drops.indexOf(a) < 0) drops.push(a); });
  var fm = ['---',
    'realm: ' + q(R.name(m.c)), 'tier: ' + R.tier(m.c), 'grade: ' + m.g, 'rank: ' + rank, 'itemLevel: ' + il, 'rarity: ' + q(rar),
    'type: ' + q(R.TYPES[m.t]), 'property: ' + q(p.k === 'supply' ? 'None' : p.name), 'potency: ' + (p.k === 'supply' ? 0 : p.P),
    'source: ' + q(x.kind || 'Blueprint material'), 'dropsFrom: ' + q(drops.join(', ')), 'gatheredBy: ' + q(x.by || ''),
    'foundIn: ' + q(x.where || ''), 'usedInBlueprints: ' + (x.used || 0), 'price: ' + price(m.c, m.g, m.t), 'tags: [material]', '---', ''];
  var L = fm.concat(['# ' + m.n, '', '*' + R.name(m.c) + ' ' + m.g + ' · ' + R.TYPES[m.t] + ' · ' + rar + '*', '',
    '- **Grade:** [[' + R.page(m.c) + '|' + R.name(m.c) + ']] ' + m.g + ' (Material Rank ' + rank + ', Item Level ' + il + ')',
    '- **Property:** ' + (p.k === 'supply' ? 'none (Supply: used up in crafting)' : '**' + p.name + '** (Potency ' + p.P + '): ' + p.text)]);
  var pr = price(m.c, m.g, m.t); L.push('- **Price:** ' + (pr ? pr.toLocaleString() + ' gp each (merchants buy at half)' : 'not sold: traded only between gods and their Fingers') + ' (see [[FAND/Atrious/Economy|Economy]])');
  if (drops.length) L.push('- **Drops from:** ' + drops.join(', ') + ' (see [[' + page + '|' + pageLabel + ']])');
  if (x.kind === 'Gathered') L.push('- **Gathered:** ' + x.where + ', by ' + x.by + ' (see [[' + page + '|' + pageLabel + ']])');
  if (x.used) L.push('- **Used in** ' + x.used + ' existing Blueprints');
  if (x.use) L.push('- **Used for:** ' + x.use);
  if (!drops.length && x.kind !== 'Gathered') L.push('- **Listed on:** [[' + page + '|' + pageLabel + ']]');
  L.push('', 'See [[FAND/Atrious/Material Properties|Material Properties]] and [[FAND/Atrious/Custom Blueprints|Custom Blueprints]].', '');
  files[DIR + '/' + base + '.md'] = L.join('\n');
});

// Base
var cols = ['file.name', 'realm', 'grade', 'rank', 'itemLevel', 'rarity', 'type', 'property', 'potency', 'price', 'source', 'dropsFrom', 'gatheredBy', 'usedInBlueprints'];
function view(name, filter) {
  var v = ['  - type: table', '    name: ' + name];
  if (filter) v.push('    filters:', '      and:', '        - ' + filter);
  v.push('    order:'); cols.forEach(function (c) { v.push('      - ' + c); });
  v.push('    sort:', '      - property: rank', '        direction: ASC');
  return v.join('\n');
}
var B = ['filters:', '  and:', '    - file.inFolder("FAND/Atrious/Materials")', 'views:', view('All Materials')];
B.push(view('Monster Drops', 'source == "Monster drop"'), view('Gathered', 'source == "Gathered"'), view('Blueprint Materials', 'source == "Blueprint material"'));
R.order.forEach(function (c) { B.push(view(R.name(c), 'realm == "' + R.name(c) + '"')); });
files[DIR + '/Materials.base'] = B.join('\n') + '\n';

console.log('notes', Object.keys(files).length - 1, 'clashes renamed', clashes.length, 'dup files', dupFile);
console.log(clashes.join('\n'));
if (MODE === 'go') {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR);
  Object.keys(files).forEach(function (f) { fs.writeFileSync(f, files[f]); });
  console.log('written');
}
