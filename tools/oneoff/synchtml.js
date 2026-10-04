var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious';
var MODE = process.argv[2] || 'dry';
var H = require(require('path').join(__dirname, '..', 'checks', 'htmlscan2.js')), t = H.t;
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js')), PR = require(require('path').join(__dirname, '..', 'data', 'properties.js'));
var log = [];
function getArr(name) { var s = H.span(name); return { s: s, v: JSON.parse(t.slice(s.start, s.end)) }; }
var ed = {}; // name -> new JSON value
var plain = function (s) { return String(s || '').replace(/\[\[[^\]|]*\\?\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/\*\*/g, ''); };

// ---- MATERIALS
var M = getArr('MATS'), all = require(require('path').join(__dirname, '..', 'data', 'all.json')), byName = {};
all.forEach(function (m) { byName[m.n.toLowerCase()] = m; });
var seen = {};
M.v.forEach(function (m) {
  var g = byName[m.n.toLowerCase()];
  if (g) { var p = PR.prop(g.n, g.t, g.c, g.g); m.realm = R.name(g.c); m.gr = R.name(g.c) + ' ' + g.g; m.prop = p.k === 'supply' ? '' : p.name + ' (Potency ' + p.P + '): ' + p.text; seen[m.n.toLowerCase()] = 1; }
  else m.realm = 'Unsorted';
});
var addedM = 0;
all.forEach(function (g) {
  if (seen[g.n.toLowerCase()]) return;
  var p = PR.prop(g.n, g.t, g.c, g.g), x = g.x || {};
  var src = x.kind === 'Monster drop' ? 'Drops from ' + [x.from].concat(x.also || []).filter(Boolean).join(', ') : x.kind === 'Gathered' ? 'Gathered: ' + x.where + ' (' + x.by + ')' : 'Used in ' + (x.used || 0) + ' Blueprints';
  M.v.push({ n: g.n, cat: R.TYPES[g.t], realm: R.name(g.c), gr: R.name(g.c) + ' ' + g.g, src: src, bonus: '', prop: p.k === 'supply' ? '' : p.name + ' (Potency ' + p.P + '): ' + p.text, ds: (x.use ? x.use + '. ' : '') + (p.k === 'supply' ? 'Supply: used up in crafting.' : 'Property: ' + p.name + '.') });
  addedM++;
});
M.v.sort(function (a, b) { return a.n < b.n ? -1 : 1; });
ed.MATS = M; log.push('materials ' + (M.v.length - addedM) + ' kept + ' + addedM + ' added = ' + M.v.length);

// ---- SUBCLASSES
var S = getArr('SUBS'), have = {};
S.v.forEach(function (s) { have[s.n.toLowerCase()] = 1; });
var addedS = 0;
fs.readdirSync(A + '/Subclasses').forEach(function (f) {
  var n = f.replace(/\.md$/, ''); if (have[n.toLowerCase()]) return;
  var txt = fs.readFileSync(A + '/Subclasses/' + f, 'utf8');
  var par = (txt.match(/\[\[FAND\/Atrious\/Classes\/(\w+)/) || [])[1]; if (!par) return;
  var ov = (txt.match(/## Overview\r?\n([^\r\n]+)/) || [])[1] || '';
  var srcm = txt.match(/official subclass — ([^.]+)\./);
  S.v.push({ n: n, par: par, ds: plain(ov) + (srcm ? ' (' + srcm[1] + ')' : '') }); addedS++;
});
S.v.sort(function (a, b) { return a.par === b.par ? (a.n < b.n ? -1 : 1) : (a.par < b.par ? -1 : 1); });
ed.SUBS = S; log.push('subclasses +' + addedS + ' = ' + S.v.length);

// ---- GODS (roster details)
var G = getArr('GODS'), gods = require(require('path').join(__dirname, '..', 'data', 'gods.js')), hands = require(require('path').join(__dirname, '..', 'data', 'hands.js')), h2 = require(require('path').join(__dirname, '..', 'data', 'hands2.js'));
Object.keys(h2).forEach(function (k) { hands[k] = h2[k]; });
var gi = {}; gods.forEach(function (g) { gi[g[0]] = g; });
var gdone = 0;
G.v.forEach(function (e) {
  var key = e.n.split(' - ')[0].trim(), g = gi[key]; if (!g || /Runes:/.test(e.ds || '')) return;
  var hand = (hands[key] || []).map(function (h, i) { return ['1st', '2nd', '3rd', '4th', '5th'][i] + ' Finger: ' + h.split(',')[0]; }).join('; ');
  e.ds = (e.ds || '') + ' — In FAND: Runes: ' + g[3].join(', ') + '. Home realm: ' + g[4] + '. Wants: ' + g[5] + '. Signature materials: ' + g[6].join(', ') + '. Finger relic: ' + g[7].split(':')[0] + '. Hand: ' + g[8] + ' of 5 seated' + (hand ? ' (' + hand + ')' : '') + '.';
  gdone++;
});
ed.GODS = G; log.push('gods updated ' + gdone);

// ---- MONSTERS (new array)
var W = {}, w1 = require(require('path').join(__dirname, '..', 'data', 'world1.js')), w2 = require(require('path').join(__dirname, '..', 'data', 'world2.js'));
Object.keys(w1).forEach(function (k) { W[k] = w1[k]; }); Object.keys(w2).forEach(function (k) { W[k] = w2[k]; });
function crNum(s) { if (s.indexOf('/') > 0) { var q = s.split('/'); return +q[0] / +q[1]; } return +s; }
function band(cr) { var b = [[0.5, 1], [2, 2], [4, 3], [6, 4], [8, 5], [11, 6], [14, 7], [17, 8], [21, 9]]; for (var i = 0; i < b.length; i++) if (cr <= b[i][0]) return b[i][1]; return 10; }
var MON = [], orig = {};
R.order.forEach(function (c) {
  W[c].monsters.forEach(function (m) {
    orig[m[0].toLowerCase().replace(/[^a-z]/g, '')] = 1;
    MON.push({ n: m[0], grp: R.name(c) + ' Bestiary', ds: R.name(c) + ' ' + m[1] + ' · ' + m[3] + '. ' + m[2] + ' Drops: ' + m[4].map(function (x) { return x[0] + ' (' + R.name(c) + ' ' + x[1] + ')'; }).join(', ') + '.' });
  });
});
['official1', 'official2', 'official3', 'official4', 'official5'].forEach(function (f) {
  require(SC + '/' + f + '.js').trim().split('\n').forEach(function (l) {
    var p = l.split('|'); if (orig[p[0].toLowerCase().replace(/[^a-z]/g, '')]) return;
    var g = band(crNum(p[1]));
    MON.push({ n: p[0], grp: R.name(p[2]) + ' Bestiary', ds: R.name(p[2]) + ' ' + g + ' · CR ' + p[1] + ' · ' + p[4] + '. ' + p[5] + '. Drops: see the ' + R.name(p[2]) + ' Bestiary in the vault.' });
  });
});
MON.sort(function (a, b) { return a.n < b.n ? -1 : 1; });
log.push('monsters ' + MON.length);

// ---- SPELL classes (fill empty cls where a vault spell of the same name has classes)
var spSpan = H.span('SPELLS'), vcls = {};
fs.readdirSync(A + '/Spells').forEach(function (f) {
  if (!/\.md$/.test(f)) return; var tx = fs.readFileSync(A + '/Spells/' + f, 'utf8');
  var c = (tx.match(/^class:\s*"([^"]+)"/m) || [])[1]; if (c) vcls[f.replace(/\.md$/, '').toLowerCase()] = c.split(/\s*,\s*/);
});
var sp = 0;
var spText = t.slice(spSpan.start, spSpan.end).replace(/\{"n":"((?:[^"\\]|\\.)*)"([^{}]*?)"cls":\[\]/g, function (m, n, mid) {
  var c = vcls[n.toLowerCase()]; if (!c) return m; sp++; return '{"n":"' + n + '"' + mid + '"cls":' + JSON.stringify(c);
});
ed.SPELLS = { s: spSpan, raw: spText }; log.push('spell classes filled ' + sp);

// ---- BLUEPRINTS (add the six new professions)
var B = getArr('BPS'), bhave = {};
B.v.forEach(function (b) { bhave[b.n.toLowerCase()] = 1; });
var pb = require(require('path').join(__dirname, '..', 'data', 'profbp.js')), addedB = 0;
function rarity(l) { return l <= 4 ? 'Common' : l <= 8 ? 'Uncommon' : l <= 11 ? 'Rare' : l <= 16 ? 'Very Rare' : l <= 19 ? 'Legendary' : 'Artifact'; }
Object.keys(pb).forEach(function (prof) { pb[prof].forEach(function (b) { if (bhave[b[0].toLowerCase()]) return; B.v.push({ n: b[0], cat: b[1], lv: b[2], pr: prof, dc: '', dm: '', r: rarity(b[2]), mg: 0, ds: b[4], mats: b[3].split(/\s*,\s*/), conns: [] }); addedB++; }); });
ed.BPS = B; log.push('blueprints +' + addedB + ' = ' + B.v.length);

// ---- rebuild: replace spans from the end backwards
var order = Object.keys(ed).sort(function (a, b) { return ed[b].s.start - ed[a].s.start; });
var out = t;
var parts = [], cur = t.length;
order.forEach(function (k) { parts.unshift(t.slice(ed[k].s.end, cur)); parts.unshift(ed[k].raw !== undefined ? ed[k].raw : JSON.stringify(ed[k].v)); cur = ed[k].s.start; });
parts.unshift(t.slice(0, cur));
out = parts.join('');

// ---- code patches
var errs = [];
function rep(a, b) { if (out.indexOf(a) < 0) { errs.push('miss: ' + a.slice(0, 60)); return; } out = out.split(a).join(b); }
rep("const SUBS=", "const MONSTERS=" + JSON.stringify(MON) + ";\nconst SUBS=");
rep("else if(TAB==='patrons') renderEntities(PATRONS,'patrons','🕯');", "else if(TAB==='patrons') renderEntities(PATRONS,'patrons','🕯');\n  else if(TAB==='monsters') renderEntities(MONSTERS,'monsters','🐉');");
rep('<div class="tab" data-tab="party"', '<div class="tab" data-tab="monsters"   onclick="switchTab(this)"><span class="tab-icon">🐉</span>Bestiary<span class="tab-n">' + MON.length.toLocaleString() + '</span></div>\n  <div class="tab" data-tab="party"');
rep("desc=`Member of the ${esc(x.grp)} group in Atrious.`;", "desc=x.ds?esc(x.ds):`Member of the ${esc(x.grp)} group in Atrious.`;");
rep("buildSidebar(MATS,'cat','materials');", "buildSidebar(MATS,'realm','materials');");
rep("if(SIDE&&m.cat!==SIDE)return false;", "if(SIDE&&m.realm!==SIDE)return false;");
rep('<div class="badges"><span class="b bc">${esc(m.cat)}</span>', '<div class="badges"><span class="b bc">${esc(m.cat)}</span>${m.gr?`<span class="b bs">${esc(m.gr)}</span>`:\'\'}');
rep("if(x.src) rs.push(['Source',esc(x.src)]);", "if(x.gr) rs.push(['Grade',esc(x.gr)]);\n    if(x.prop) rs.push(['Property',esc(x.prop)]);\n    if(x.src) rs.push(['Source',esc(x.src)]);");
rep('Materials<span class="tab-n">233</span>', 'Materials<span class="tab-n">' + M.v.length.toLocaleString() + '</span>');
rep('Subclasses<span class="tab-n">59</span>', 'Subclasses<span class="tab-n">' + S.v.length + '</span>');
rep('<span class="pill">59 Subclasses</span>', '<span class="pill">' + S.v.length + ' Subclasses</span>');
rep('<span class="tab-n" id="tn-blueprints">4,116</span>', '<span class="tab-n" id="tn-blueprints">' + B.v.length.toLocaleString() + '</span>');
log.push('errors: ' + JSON.stringify(errs));
log.push('size ' + t.length + ' -> ' + out.length);
console.log(log.join('\n'));
if (MODE === 'go' && !errs.length) {
  fs.writeFileSync(SC + '/FAND.html.bak', t);
  fs.writeFileSync(A + '/FAND.html', out);
  console.log('written (backup in scratchpad)');
}
