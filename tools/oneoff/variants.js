var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var items = [];
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var t = fs.readFileSync(D + '/' + f, 'utf8');
  var g = function (k) { return ((t.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '').trim(); };
  items.push({ f: f, n: f.slice(0, -3), t: t, key: [g('profession'), g('category'), g('level'), g('materials'), g('damage'), g('ac'), g('slot')].join('|'), mats: g('materials') });
});
var groups = {};
items.forEach(function (x) { if (!x.mats) return; (groups[x.key] = groups[x.key] || []).push(x); });
var BK = SC + '/variants_backup'; if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var changed = 0, gcount = 0;
Object.keys(groups).forEach(function (k) {
  var g = groups[k]; if (g.length < 2) return; gcount++;
  g.forEach(function (x) {
    if (/\*\*Stat variants:\*\*/.test(x.t)) return;
    var sibs = g.filter(function (y) { return y !== x; }).map(function (y) { return '[[FAND/Atrious/Blueprints/' + y.n + '|' + y.n + ']]'; });
    var line = '**Stat variants:** shares exactly the same stats (level, damage, materials' + (k.split('|')[5] ? ', AC' : '') + ') with ' + sibs.join(', ') + '. The difference is form and handling: pick whichever shape suits the wielder.';
    var nl = /\r\n/.test(x.t) ? '\r\n' : '\n', i = x.t.indexOf('## Material Property'), nt;
    if (i >= 0) nt = x.t.slice(0, i) + line + nl + nl + x.t.slice(i);
    else nt = x.t.replace(/\s*$/, '') + nl + nl + line + nl;
    if (MODE === 'go') { fs.writeFileSync(BK + '/' + x.f, x.t); fs.writeFileSync(D + '/' + x.f, nt); }
    changed++;
  });
});
console.log(MODE, 'groups', gcount, 'notes updated', changed);
