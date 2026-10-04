var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var D = ROOT + '/Atrious/Blueprints';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js'));
var data = require(require('path').join(__dirname, '..', 'data', 'profbp.js')), all = require(require('path').join(__dirname, '..', 'data', 'all.json')), mat = {};
all.forEach(function (m) { mat[m.n] = m; });
var names = {};
function walk(d) { fs.readdirSync(d).forEach(function (f) { var p = d + '/' + f; if (fs.statSync(p).isDirectory()) walk(p); else if (/\.md$/.test(f)) names[f.slice(0, -3).toLowerCase()] = p; }); }
walk(ROOT);
function rarity(l) { return l <= 4 ? 'Common' : l <= 8 ? 'Uncommon' : l <= 11 ? 'Rare' : l <= 16 ? 'Very Rare' : l <= 19 ? 'Legendary' : 'Artifact'; }
var out = {}, errs = [], counts = {};
Object.keys(data).forEach(function (prof) {
  counts[prof] = data[prof].length;
  data[prof].forEach(function (b) {
    var name = b[0], p = D + '/' + name + '.md';
    if (names[name.toLowerCase()]) errs.push('clash ' + name + ' -> ' + names[name.toLowerCase()]);
    var best = null;
    b[3].split(/\s*,\s*/).forEach(function (m) {
      var x = mat[m]; if (!x) { errs.push('material ' + m + ' in ' + name); return; }
      var rk = R.rank(x.c, x.g); if (!best || rk > best.rk) best = { rk: rk, lab: R.name(x.c) + ' ' + x.g };
    });
    if (!best) return;
    var L = ['---', 'profession: "' + prof + '"', 'category: "' + b[1] + '"', 'level: "' + b[2] + '"', 'damage: ""', 'rarity: "' + rarity(b[2]) + '"',
      'materials: "' + b[3] + '"', 'materialGrade: "' + best.lab + '"', 'materialRank: "' + best.rk + '"', '---', '',
      '# ' + name, '', '*' + b[1] + ' — [[FAND/Atrious/Professions/' + prof + '|' + prof + ']] — ' + rarity(b[2]) + '*', '', b[4], ''];
    out[p] = L.join('\n');
  });
  out[D + '/' + prof + '.base'] = ['filters:', '  and:', '    - profession == "' + prof + '"', 'views:', '  - type: table', '    name: ' + prof + ' Blueprints', '    order:',
    '      - file.name', '      - category', '      - level', '      - rarity', '      - materials', '      - materialGrade', '    sort:', '      - property: level', '        direction: ASC', ''].join('\n');
  if (fs.existsSync(D + '/' + prof + '.base')) errs.push('base exists ' + prof);
});
console.log('errors', errs); console.log(counts, 'files', Object.keys(out).length);
if (MODE === 'go' && !errs.length) { Object.keys(out).forEach(function (p) { fs.writeFileSync(p, out[p]); }); console.log('written'); }
