// Rebuilds app/FAND.html: takes the data arrays from the current FAND.html, cleans and enriches them,
// and wraps them in the UI from tools/app/template.html. Safe to rerun (every step is idempotent).
// Usage (from the tools folder):  node generators/buildapp.js        dry run, prints a report
//                                 node generators/buildapp.js go     writes app/FAND.html
//                                 node generators/buildapp.js go <in.html> <out.html>
var fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..', '..');
var MODE = process.argv[2] || 'dry';
var IN = process.argv[3] || path.join(ROOT, 'app', 'FAND.html');
var OUT = process.argv[4] || IN;
var TEMPLATE = path.join(__dirname, '..', 'app', 'template.html');
var R = require(path.join(__dirname, '..', 'data', 'realms.js'));
var all = require(path.join(__dirname, '..', 'data', 'all.json'));
var t = fs.readFileSync(IN, 'utf8');
var log = [];

// ---- read a `const NAME=` literal out of the page (same scan as checks/htmlscan2.js)
function span(name) {
  var m = new RegExp('(const|let|var)\\s+' + name + '\\s*=').exec(t); if (!m) return null;
  var s = t.indexOf('=', m.index) + 1; while (/\s/.test(t[s])) s++;
  var depth = 0, j = s;
  for (; j < t.length; j++) {
    var ch = t[j];
    if (ch === '"' || ch === "'") { var q = ch; j++; while (t[j] !== q) { if (t[j] === '\\') j++; j++; } continue; }
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') { depth--; if (depth === 0) break; }
  }
  return JSON.parse(t.slice(s, j + 1));
}
var D = {};
['BPS', 'SPELLS', 'MATS', 'MONSTERS', 'SUBS', 'GODS', 'DEMONS', 'PATRONS', 'MAT_FX'].forEach(function (k) {
  D[k] = span(k); if (!D[k]) throw new Error('missing ' + k + ' in ' + IN);
});

// ---- realms
var CODE = {}; R.order.forEach(function (c) { CODE[R.name(c)] = c; });
var BASE = { Hu: 5, My: 50, He: 500, Hv: 500, Ch: 2500, Ab: 10000, In: 50000, Ou: 100000 };
function rarity(c, g) {
  var x = R.tier(c);
  if (x === 1) return g <= 5 ? 'Common' : 'Uncommon';
  if (x === 2) return g <= 5 ? 'Uncommon' : 'Rare';
  if (x === 3) return g <= 5 ? 'Rare' : 'Very Rare';
  if (x === 4) return 'Very Rare';
  if (x === 5) return g <= 5 ? 'Very Rare' : 'Legendary';
  if (x <= 7) return 'Legendary';
  return 'Artifact';
}
function price(c, g, ty) { var b = BASE[c]; if (!b) return 0; var v = b * g * (g >= 9 ? 2 : 1); return ty === 'U' ? Math.max(1, Math.round(v / 5)) : v; }
function parseGrade(s) { var m = /^(.+) (\d+)$/.exec(String(s || '').trim()); return m && CODE[m[1]] ? { c: CODE[m[1]], g: +m[2] } : null; }
var REALMS = R.order.map(function (c) {
  return { c: c, n: R.name(c), tier: R.tier(c), page: R.page(c), base: BASE[c] || 0 };
});

// ---- blueprints
var before = D.BPS.length;
D.BPS = D.BPS.filter(function (b) { return !/^-+$/.test(b.n); });
log.push('blueprints: removed ' + (before - D.BPS.length) + ' separator rows');
var fixed = 0;
D.BPS.forEach(function (b) {
  // A past sync stored the material list in the description ("['Oak', 'Steel',…") and spread the
  // first characters of the description across `mats`. Recover the material names; the text is lost.
  if (/^\[/.test(b.ds) && b.mats.every(function (m) { return m.length <= 1; })) {
    var names = [], re = /'([^']+)'/g, m;
    while ((m = re.exec(b.ds))) names.push(m[1]);
    b.mats = names; b.ds = ''; b.lost = 1; fixed++;
  }
  b.mats = b.mats.filter(function (m) { return m && m.length > 1; });
  if (b.lv == null) b.lv = 0;
});
log.push('blueprints: recovered materials on ' + fixed + ' rows whose description was lost');

// ---- strip vault markup that leaked into descriptions ([[links]], **bold**, trailing ---)
function plain(s) {
  return String(s || '').replace(/\[\[[^\]|]*\\?\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, function (m, x) { return x.split('/').pop(); })
    .replace(/\*\*/g, '').replace(/\s+-{3,}\s*$/, '').trim();
}
var cleaned = 0;
D.BPS.concat(D.MATS).forEach(function (x) { var c = plain(x.ds); if (c !== x.ds) { x.ds = c; cleaned++; } });
log.push('descriptions: cleaned markup in ' + cleaned);

// ---- materials
var byName = {}; all.forEach(function (m) { byName[m.n.toLowerCase()] = m; });
var joined = 0;
D.MATS.forEach(function (m) {
  m.src = String(m.src || '').replace(/\s*\|\s*$/, '');
  m.bonus = String(m.bonus || '').replace(/\s*\|\s*$/, '');
  var g = parseGrade(m.gr), a = byName[m.n.toLowerCase()], ty = a ? a.t : '';
  if (g) {
    m.tier = R.tier(g.c); m.g = g.g; m.rank = R.rank(g.c, g.g); m.il = R.level(g.c, g.g);
    m.rar = rarity(g.c, g.g); m.price = price(g.c, g.g, ty);
  }
  var pm = /\(Potency (\d+)\)/.exec(m.prop || ''); if (pm) m.pot = +pm[1];
  if (m.prop) m.pn = m.prop.split(' (Potency')[0];
  if (a) {
    joined++;
    m.ty = R.TYPES[ty] || m.cat;
    var x = a.x || {};
    if (x.from) m.from = [x.from].concat(x.also || []).filter(function (v, i, arr) { return v && arr.indexOf(v) === i; });
    if (x.where) m.where = x.where;
    if (x.by) m.by = x.by;
    if (x.used) m.used = x.used;
    if (x.use) m.use = x.use;
    if (ty === 'U') m.supply = 1;
  }
});
log.push('materials: ' + D.MATS.length + ', ' + joined + ' joined to data/all.json');

// ---- monsters: split the one-line description into fields
var MRE = /^(.+?) (\d+) · (?:CR ([\d\/]+) · )?(.+?)\. (.*?)\s*Drops: (.*)\.$/;
var mp = 0;
D.MONSTERS.forEach(function (m) {
  var x = MRE.exec(m.ds || ''); if (!x) return;
  mp++;
  m.realm = x[1]; m.g = +x[2]; m.tier = CODE[x[1]] ? R.tier(CODE[x[1]]) : 0;
  if (x[3]) { m.cr = x[3]; m.book = x[4]; } else { m.hab = x[4]; m.hb = 1; }
  m.txt = x[5];
  var drops = [], dre = /([^,]+?) \(([A-Za-z ]+?) (\d+)\)/g, d;
  while ((d = dre.exec(x[6]))) drops.push([d[1].trim(), d[2] + ' ' + d[3]]);
  m.drops = drops;
});
log.push('monsters: parsed ' + mp + ' of ' + D.MONSTERS.length);

// ---- gods: split the roster details into fields; drop vault index pages that slipped into the lists
function dropConnections(arr, label) {
  var n = arr.length, out = arr.filter(function (e) { return e.grp !== 'Connections'; });
  log.push(label + ': removed ' + (n - out.length) + ' index-page entries');
  return out;
}
D.GODS = dropConnections(D.GODS, 'gods');
D.PATRONS = dropConnections(D.PATRONS, 'patrons');
var LABELS = ['Runes', 'Home realm', 'Wants', 'Signature materials', 'Finger relic', 'Hand'];
D.GODS.forEach(function (g) {
  var ds = g.ds || '', k = ds.indexOf(' — In FAND: '); if (k < 0) return;
  g.myth = ds.slice(0, k); var rest = ds.slice(k + 12), f = {};
  var re = new RegExp('(' + LABELS.join('|') + '): ', 'g'), hits = [], m;
  while ((m = re.exec(rest))) hits.push({ k: m[1], at: m.index, v: m.index + m[0].length });
  hits.forEach(function (h, i) { f[h.k] = rest.slice(h.v, i + 1 < hits.length ? hits[i + 1].at : rest.length).replace(/\.\s*$/, '').trim(); });
  if (f.Runes) g.runes = f.Runes.split(/\s*,\s*/);
  if (f['Home realm']) g.home = f['Home realm'];
  if (f.Wants) g.wants = f.Wants;
  if (f['Signature materials']) g.sig = f['Signature materials'].split(/\s*,\s*/);
  if (f['Finger relic']) g.relic = f['Finger relic'];
  if (f.Hand) {
    var hm = /^(\d) of 5 seated(?: \((.*)\))?/.exec(f.Hand);
    if (hm) { g.seated = +hm[1]; g.hand = hm[2] ? hm[2].split(/;\s*/).map(function (s) { return s.replace(/^\d\w\w Finger:\s*/, ''); }) : []; }
  }
});

// ---- write
var tpl = fs.readFileSync(TEMPLATE, 'utf8');
var META = { built: new Date().toISOString().slice(0, 10), version: '1.24', realms: REALMS };
var data = ['BPS', 'SPELLS', 'MATS', 'MONSTERS', 'SUBS', 'GODS', 'DEMONS', 'PATRONS', 'MAT_FX'].map(function (k) {
  return 'const ' + k + '=' + JSON.stringify(D[k]).replace(/<\/(script)/gi, '<\\/$1') + ';';
}).concat(['const META=' + JSON.stringify(META) + ';']).join('\n');
if (tpl.indexOf('/*__DATA__*/') < 0) throw new Error('template is missing the /*__DATA__*/ marker');
var out = tpl.split('/*__DATA__*/').join(data);
console.log(log.join('\n'));
console.log(MODE, IN, '->', OUT, (t.length / 1e6).toFixed(2) + ' MB ->', (out.length / 1e6).toFixed(2) + ' MB');
if (MODE === 'go') { fs.writeFileSync(OUT, out); console.log('written'); }
