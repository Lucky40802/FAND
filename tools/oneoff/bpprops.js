var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js')), PR = require(require('path').join(__dirname, '..', 'data', 'properties.js'));
var mat = {}; require(require('path').join(__dirname, '..', 'data', 'all.json')).forEach(function (m) { mat[m.n] = m; });
var CATS = /^(Sword|Bow|Staff|Hammer|Dagger|Axe|Spear|Armor|Shield)$/;
var BK = SC + '/backup_bpprops';
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var n = 0, skipped = 0, dist = {};
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var p = D + '/' + f, t = fs.readFileSync(p, 'utf8');
  var cat = (t.match(/^category:\s*"?([^"\r\n]*)"?\s*$/m) || [])[1];
  if (!cat || !CATS.test(cat) || /^property:/m.test(t)) return;
  var mats = ((t.match(/^materials:\s*"?([^"\r\n]*)"?\s*$/m) || [])[1] || '').split(/\s*,\s*/);
  var best = null;
  mats.forEach(function (x) {
    var m = mat[x.trim()]; if (!m || m.t === 'U') return;
    var rk = R.rank(m.c, m.g); if (!best || rk > best.rk) best = { rk: rk, m: m };
  });
  if (!best) { skipped++; return; }
  var pr = PR.prop(best.m.n, best.m.t, best.m.c, best.m.g);
  dist[pr.name] = (dist[pr.name] || 0) + 1;
  var nl = /\r\n/.test(t) ? '\r\n' : '\n';
  var nt = t.replace(/^(materialRank:[^\r\n]*\r?\n)/m, '$1property: "' + pr.name + '"' + nl + 'potency: "' + pr.P + '"' + nl);
  if (nt === t) { skipped++; return; }
  nt = nt.replace(/\s*$/, '') + nl + nl + '## Material Property' + nl + '**' + pr.name + '** (Potency ' + pr.P + ', from ' + best.m.n + '): ' + pr.text + nl +
    nl + 'See [[FAND/Atrious/Material Properties|Material Properties]].' + nl;
  if (MODE === 'go') { fs.writeFileSync(BK + '/' + f, t); fs.writeFileSync(p, nt); }
  n++;
});
console.log(MODE, 'updated', n, 'skipped (no gradable material)', skipped);
console.log(Object.keys(dist).sort(function (a, b) { return dist[b] - dist[a]; }).slice(0, 12).map(function (k) { return k + ' ' + dist[k]; }).join(', '));
