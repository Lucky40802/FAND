var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var items = [];
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var t = fs.readFileSync(D + '/' + f, 'utf8');
  var g = function (k) { return ((t.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '').trim(); };
  var body = t.replace(/^---[\s\S]*?---/, '').replace(/^#.*$/m, '').replace(/^\*.*\*$/m, '').replace(/## Material Property[\s\S]*$/, '').trim();
  items.push({ f: f.slice(0, -3), prof: g('profession'), spec: g('specialty'), cat: g('category'), lv: g('level'), dmg: g('damage'), mats: g('materials'), body: body });
});
var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); };
// 1. identical body text
var byBody = {};
items.forEach(function (x) { var k = norm(x.body); if (k.length < 20) return; (byBody[k] = byBody[k] || []).push(x); });
var bodyDups = Object.keys(byBody).filter(function (k) { return byBody[k].length > 1; });
// 2. same profession + category + level + materials + damage, and descriptions differing only in the material/name words
var byStats = {};
items.forEach(function (x) { var k = [x.prof, x.cat, x.lv, x.mats, x.dmg].join('|'); (byStats[k] = byStats[k] || []).push(x); });
var statDups = Object.keys(byStats).filter(function (k) { return byStats[k].length > 1 && byStats[k][0].mats; });
// 3. names that differ only by a "x1"-style suffix or punctuation
var byName = {};
items.forEach(function (x) { var k = norm(x.f.replace(/ x\d+$/, '').replace(/\(.*?\)/g, '')); (byName[k] = byName[k] || []).push(x); });
var nameDups = Object.keys(byName).filter(function (k) { return byName[k].length > 1; });
console.log('blueprints', items.length);
console.log('identical descriptions:', bodyDups.length, 'groups,', bodyDups.reduce(function (s, k) { return s + byBody[k].length; }, 0), 'notes');
bodyDups.slice(0, 8).forEach(function (k) { console.log('  ' + byBody[k].map(function (x) { return x.f + ' [' + x.prof + '/' + x.spec + ' ' + x.cat + ' L' + x.lv + ']'; }).join(' | ')); });
console.log('same stats+materials:', statDups.length, 'groups,', statDups.reduce(function (s, k) { return s + byStats[k].length; }, 0), 'notes');
statDups.slice(0, 8).forEach(function (k) { console.log('  ' + k + ' :: ' + byStats[k].map(function (x) { return x.f; }).join(' | ')); });
console.log('near-identical names:', nameDups.length, 'groups');
nameDups.slice(0, 12).forEach(function (k) { console.log('  ' + byName[k].map(function (x) { return x.f + ' [' + x.prof + ' ' + x.cat + ' L' + x.lv + ']'; }).join(' | ')); });
fs.writeFileSync(__dirname + '/dups.json', JSON.stringify({ body: bodyDups.map(function (k) { return byBody[k].map(function (x) { return x.f; }); }), stats: statDups.map(function (k) { return byStats[k].map(function (x) { return x.f; }); }), names: nameDups.map(function (k) { return byName[k].map(function (x) { return x.f; }); }) }));
