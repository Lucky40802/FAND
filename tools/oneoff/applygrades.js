var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js'));
var G = {};
require(require('path').join(__dirname, '..', 'data', 'grades.js')).trim().split('\n').forEach(function (l) {
  var p = l.split('|'), q = p[1].split(' ');
  G[p[0]] = { realm: q[0], grade: +q[1], type: q[2] };
});
var BK = SC + '/backup_blueprints_grades';
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var changed = 0, unknown = {}, noMat = 0;
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var p = D + '/' + f, t = fs.readFileSync(p, 'utf8');
  var m = t.match(/^materials:\s*"?([^"\r\n]*)"?\s*$/m);
  if (!m) return;
  if (/^materialGrade:/m.test(t)) return;
  var best = null;
  m[1].split(/\s*,\s*/).forEach(function (x) {
    x = x.trim(); if (!x) return;
    var g = G[x];
    if (!g) { if (!/^-+$/.test(x)) unknown[x] = 1; return; }
    var rank = R.rank(g.realm, g.grade);
    if (!best || rank > best.rank) best = { rank: rank, label: R.name(g.realm) + ' ' + g.grade };
  });
  if (!best) { noMat++; return; }
  var nl = /\r\n/.test(t) ? '\r\n' : '\n';
  var nt = t.replace(/^(materials:[^\r\n]*\r?\n)/m, '$1materialGrade: "' + best.label + '"' + nl + 'materialRank: "' + best.rank + '"' + nl);
  if (MODE === 'go') { fs.writeFileSync(BK + '/' + f, t); fs.writeFileSync(p, nt); }
  changed++;
});
console.log(MODE, 'changed', changed, 'no gradable material', noMat, 'unknown', Object.keys(unknown));
