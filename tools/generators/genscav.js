var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND', D = ROOT + '/Atrious/Blueprints';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js')), data = require(require('path').join(__dirname, '..', 'data', 'scavbp.js')), mat = {};
require(require('path').join(__dirname, '..', 'data', 'all.json')).forEach(function (m) { mat[m.n] = m; });
var names = {};
function walk(d) { fs.readdirSync(d).forEach(function (f) { var p = d + '/' + f; if (fs.statSync(p).isDirectory()) walk(p); else if (/\.md$/.test(f)) names[f.slice(0, -3).toLowerCase()] = p; }); }
walk(ROOT);
function rarity(l) { return l <= 4 ? 'Common' : l <= 8 ? 'Uncommon' : l <= 11 ? 'Rare' : l <= 16 ? 'Very Rare' : l <= 19 ? 'Legendary' : 'Artifact'; }
var errs = [], out = {};
data.forEach(function (b) {
  if (names[b[0].toLowerCase()]) errs.push('clash ' + b[0]);
  var best = null;
  b[3].split(/\s*,\s*/).forEach(function (m) { var x = mat[m]; if (!x) { errs.push('material ' + m + ' in ' + b[0]); return; } var rk = R.rank(x.c, x.g); if (!best || rk > best.rk) best = { rk: rk, lab: R.name(x.c) + ' ' + x.g }; });
  if (!best) return;
  out[D + '/' + b[0] + '.md'] = ['---', 'profession: "Scavenging"', 'specialty: "Scavenging"', 'category: "' + b[1] + '"', 'level: "' + b[2] + '"', 'damage: ""', 'rarity: "' + rarity(b[2]) + '"',
    'materials: "' + b[3] + '"', 'materialGrade: "' + best.lab + '"', 'materialRank: "' + best.rk + '"', '---', '', '# ' + b[0], '',
    '*' + b[1] + ' — [[FAND/Atrious/Professions/Scavenging|Scavenging]] — ' + rarity(b[2]) + '*', '', b[4], ''].join('\n');
});
console.log('errors', errs, 'items', Object.keys(out).length);
if (MODE === 'go' && !errs.length) { Object.keys(out).forEach(function (p) { fs.writeFileSync(p, out[p]); }); console.log('written'); }
