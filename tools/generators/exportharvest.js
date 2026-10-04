// Writes the website's generated harvest parts as vault notes, in the same format as genmaterials.js,
// plus a "Harvest Parts.md" index grouped by realm and monster.
// Usage (from the tools folder):  node generators/exportharvest.js                     dry run
//                                 node generators/exportharvest.js go                  writes to tools/out/harvest
//                                 node generators/exportharvest.js go "<vault>/FAND/Atrious/Materials"
// Reads site/data/core.js, so run `node generators/buildapp.js go` first.
var fs = require('fs'), path = require('path');
var MODE = process.argv[2] || 'dry', OUT = process.argv[3] || path.join(__dirname, '..', 'out', 'harvest');
var core = fs.readFileSync(path.join(__dirname, '..', '..', 'site', 'data', 'core.js'), 'utf8');
var D = {}; core.split('\n').forEach(function (l) { var m = /^const (\w+)=(.*);$/.exec(l); if (m) D[m[1]] = JSON.parse(m[2]); });
var q = function (s) { return '"' + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; };
var safe = function (s) { return s.replace(/[\\/:*?"<>|#^\[\]]/g, '-'); };
var PAGE = { Human: 'Mortal Realm', Mysterious: 'Mysterious Realm', Chaos: 'Chaos Realm', Primordial: 'Primordial Realm' };
var gen = D.MATS.filter(function (m) { return m.gen; }), files = {};
gen.forEach(function (m) {
  var mon = m.from && m.from[0];
  var L = ['---', 'realm: ' + q(m.realm), 'tier: ' + m.tier, 'grade: ' + m.g, 'rank: ' + m.rank, 'itemLevel: ' + m.il, 'rarity: ' + q(m.rar),
    'type: ' + q(m.ty), 'property: ' + q(m.pn || 'None'), 'potency: ' + (m.pot || 0), 'source: "Monster drop"', 'dropsFrom: ' + q(mon),
    'uniqueTrait: ' + q(m.tr ? m.tr.n : ''), 'price: ' + (m.price || 0), 'harvestPart: true', 'tags: [material, harvest]', '---', '',
    '# ' + m.n, '', '*' + m.realm + ' ' + m.g + ' · ' + m.ty + ' · ' + m.rar + '*', '',
    '- **Grade:** [[' + (PAGE[m.realm] || m.realm) + '|' + m.realm + ']] ' + m.g + ' (Material Rank ' + m.rank + ', Item Level ' + m.il + ')',
    '- **Property:** ' + (m.pn ? '**' + m.pn + '** (Potency ' + m.pot + '): ' + (m.prop || '').replace(/^[^:]+:\s*/, '') : 'none'),
    m.tr ? '- **Unique trait:** **' + m.tr.n + '**: ' + m.tr.t : '',
    '- **Price:** ' + (m.price ? m.price.toLocaleString('en-US') + ' gp each (merchants buy at half)' : 'not sold') + ' (see [[FAND/Atrious/Economy|Economy]])',
    '- **Drops from:** ' + mon + ' (see [[FAND/Atrious/Bestiary/' + m.realm + ' Bestiary|' + m.realm + ' Bestiary]])',
    '- **Used for:** ' + (m.use || ''), '', 'Harvest part added by the FAND website so every monster yields 6-10 materials.', ''];
  files[safe(m.n) + '.md'] = L.filter(function (x, i) { return x !== '' || i > 16; }).join('\n');
});
var byRealm = {};
gen.forEach(function (m) { var r = byRealm[m.realm] = byRealm[m.realm] || {}; var k = m.from && m.from[0] || '?'; (r[k] = r[k] || []).push(m); });
var idx = ['# Harvest Parts', '', gen.length + ' materials generated so every monster yields 6-10 parts. Each links to its own note.', ''];
Object.keys(byRealm).forEach(function (r) {
  idx.push('## ' + r, '');
  Object.keys(byRealm[r]).sort().forEach(function (mon) { idx.push('- **' + mon + ':** ' + byRealm[r][mon].map(function (m) { return '[[' + safe(m.n) + '|' + m.n.replace(mon + ' ', '') + ']]'; }).join(', ')); });
  idx.push('');
});
files['Harvest Parts.md'] = idx.join('\n');
console.log(MODE + ': ' + gen.length + ' harvest-part notes + index -> ' + OUT);
if (MODE === 'go') {
  fs.mkdirSync(OUT, { recursive: true });
  var skipped = 0;
  Object.keys(files).forEach(function (f) { var p = path.join(OUT, f); if (fs.existsSync(p) && !/Harvest Parts\.md$/.test(f) && fs.readFileSync(p, 'utf8').indexOf('harvestPart: true') < 0) { skipped++; return; } fs.writeFileSync(p, files[f]); });
  console.log('written' + (skipped ? ', skipped ' + skipped + ' existing notes that are not harvest parts' : ''));
}
