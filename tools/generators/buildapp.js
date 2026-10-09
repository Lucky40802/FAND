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
    m.tc = ty;
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

// ---- mythological creatures (data/myth.js), rebuilt on every run
D.MONSTERS = D.MONSTERS.filter(function (m) { return !m.myth; });
var haveMon = {}; D.MONSTERS.forEach(function (m) { haveMon[m.n.toLowerCase()] = 1; });
function crBand(cr) { var b = [[0.5, 1], [2, 2], [4, 3], [6, 4], [8, 5], [11, 6], [14, 7], [17, 8], [21, 9]]; for (var i = 0; i < b.length; i++) if (cr <= b[i][0]) return b[i][1]; return 10; }
var mythAdded = 0;
require(path.join(__dirname, '..', 'data', 'myth.js')).trim().split('\n').forEach(function (l) {
  if (!l || l.charAt(0) === '/') return;
  var p = l.split('|'); if (p.length < 6 || haveMon[p[0].toLowerCase()]) return;
  var c = p[2], cr = p[1], crn = cr.indexOf('/') > 0 ? +cr.split('/')[0] / +cr.split('/')[1] : +cr;
  D.MONSTERS.push({ n: p[0], grp: R.name(c) + ' Bestiary', realm: R.name(c), g: crBand(crn), tier: R.tier(c), cr: cr, book: 'Myth', myth: p[3], txt: p[4] + '.', hab: p[5], drops: [] });
  haveMon[p[0].toLowerCase()] = 1; mythAdded++;
});
D.MONSTERS.sort(function (a, b) { return a.n < b.n ? -1 : a.n > b.n ? 1 : 0; });
log.push('mythological creatures: +' + mythAdded + ' (Bestiary now ' + D.MONSTERS.length + ')');

// ---- harvest parts: every monster yields 6-10 materials (data/harvest.js). Generated parts are marked gen:1;
// they exist only in this app, not in the vault. Rebuilt from scratch on every run.
var HV = require(path.join(__dirname, '..', 'data', 'harvest.js')), PR = require(path.join(__dirname, '..', 'data', 'properties.js'));
D.MATS = D.MATS.filter(function (m) { return !m.gen; });
var matIdx = {}; D.MATS.forEach(function (m) { matIdx[m.n.toLowerCase()] = m; });
var genAdded = 0, kinds = {};
D.MONSTERS.forEach(function (mon) {
  var c = CODE[mon.realm]; if (!c) return;
  var have = (mon.drops || []).slice(), hp = HV.parts(mon);
  mon.body = hp.kind; kinds[hp.kind] = (kinds[hp.kind] || 0) + 1;
  hp.parts.forEach(function (p) {
    if (have.length >= hp.count) return;
    var word = p[0].toLowerCase().split(' ').pop();
    if (have.some(function (d) { return d[0].toLowerCase().split(' ').pop() === word; })) return;
    var name = mon.n + ' ' + p[0], g = Math.max(1, Math.min(10, mon.g + p[2]));
    var ex = matIdx[name.toLowerCase()];
    if (!ex) {
      var pr = PR.prop(name, p[1], c, g);
      ex = { n: name, realm: mon.realm, gr: mon.realm + ' ' + g,
        prop: pr.k === 'supply' ? '' : pr.name + ' (Potency ' + pr.P + '): ' + pr.text, gen: 1, tc: p[1], use: p[3], from: [mon.n],
        tier: R.tier(c), g: g, rank: R.rank(c, g), il: R.level(c, g), rar: rarity(c, g), price: price(c, g, p[1]), ty: R.TYPES[p[1]] };
      if (pr.k !== 'supply') { ex.pot = pr.P; ex.pn = pr.name; }
      D.MATS.push(ex); matIdx[name.toLowerCase()] = ex; genAdded++;
    }
    have.push([ex.n, ex.gr, 1]);
  });
  mon.drops = have;
});
D.MATS.sort(function (a, b) { return a.n < b.n ? -1 : a.n > b.n ? 1 : 0; });
var dropCounts = D.MONSTERS.map(function (m) { return (m.drops || []).length; });
log.push('harvest parts: +' + genAdded + ' materials (now ' + D.MATS.length + '); drops per monster ' + Math.min.apply(null, dropCounts) + '-' + Math.max.apply(null, dropCounts) + '; body plans ' + JSON.stringify(kinds));

// ---- gathered materials (data/gathered.js): ores, herbs and flora, and small fauna in every realm, with alchemy effects.
(function () {
  var G; try { G = require(path.join(__dirname, '..', 'data', 'gathered.js')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; return; }
  var have = {}; D.MATS.forEach(function (m) { have[m.n.toLowerCase()] = 1; });
  var CODEK = { ore: 'O', herb: 'W', fauna: 'L' }, BY = { ore: 'Harvesting (Mining)', herb: 'Harvesting (Foraging)', fauna: 'Scavenging' }, added = 0;
  G.forEach(function (r) {
    var name = r[0], realm = r[1], g = Math.max(1, Math.min(10, +r[2] || 1)), kind = r[3], c = CODE[realm];
    if (!c || have[name.toLowerCase()]) return;
    var tc = CODEK[kind] || 'W', pr = PR.prop(name, tc, c, g);
    var ex = { n: name, realm: realm, gr: realm + ' ' + g, prop: pr.k === 'supply' ? '' : pr.name + ' (Potency ' + pr.P + '): ' + pr.text, tc: tc,
      tier: R.tier(c), g: g, rank: R.rank(c, g), il: R.level(c, g), rar: rarity(c, g), price: price(c, g, tc), ty: R.TYPES[tc],
      ds: r[4] || '', where: r[5] || '', by: BY[kind] || '', gath: kind, site: 1 };
    if (r[6]) ex.alch = r[6];
    if (pr.k !== 'supply') { ex.pot = pr.P; ex.pn = pr.name; }
    D.MATS.push(ex); have[name.toLowerCase()] = 1; added++;
  });
  D.MATS.sort(function (a, b) { return a.n < b.n ? -1 : a.n > b.n ? 1 : 0; });
  log.push('gathered materials (ores, herbs, fauna): +' + added);
})();

// ---- filling gaps. Every generated value is marked (dsg, mi) so the site can say it was written by the site,
// and it is only ever written where the vault left the field empty.
var gap = { mon: 0, part: 0, bpMats: 0, bpDs: 0 };
D.MONSTERS.forEach(function (m) { if (!m.ds && m.txt) { m.ds = m.txt; gap.mon++; } });
function article(w) { return /^[aeiou]/i.test(w) ? 'an' : 'a'; }
D.MATS.forEach(function (m) {
  if (!m.gen || m.ds) return;
  var mon = m.from && m.from[0], part = mon ? m.n.slice(mon.length).trim().toLowerCase() : m.n.toLowerCase();
  m.ds = 'The ' + part + ' of ' + article(mon || '') + ' ' + (mon || 'creature') + ', harvested at grade ' + m.g + ' in the ' + m.realm + ' Realm.'
    + (m.use ? ' Crafters use it for ' + m.use.charAt(0).toLowerCase() + m.use.slice(1) + '.' : '');
  m.dsg = 1; gap.part++;
});
// Blueprints with no materials: first, materials the description already names; otherwise a recipe by item
// type, picking vault materials whose Item Level fits the Blueprint's level.
var vaultMats = D.MATS.filter(function (m) { return !m.gen; });
var nameRe = vaultMats.filter(function (m) { return m.n.length >= 4 && /^[A-Z][A-Za-z' -]+$/.test(m.n) && m.n.split(' ').length <= 4; }).sort(function (a, b) { return b.n.length - a.n.length; });
var RECIPE = {
  Sword: ['Ore / Metal', 'Wood / Plant', 'Hide / Cloth / Fiber'], Dagger: ['Ore / Metal', 'Bone / Fang / Horn / Scale'], Axe: ['Ore / Metal', 'Wood / Plant'],
  Hammer: ['Ore / Metal', 'Wood / Plant'], Spear: ['Ore / Metal', 'Wood / Plant'], Bow: ['Wood / Plant', 'Hide / Cloth / Fiber'],
  Staff: ['Wood / Plant', 'Crystal / Gem'], Armor: ['Ore / Metal', 'Hide / Cloth / Fiber'], Shield: ['Ore / Metal', 'Wood / Plant'],
  Potion: ['Blood / Organ', 'Wood / Plant', 'Essence / Soul / Core'], Artifact: ['Crystal / Gem', 'Ore / Metal', 'Essence / Soul / Core'],
  Tool: ['Ore / Metal', 'Wood / Plant'], Food: ['Wood / Plant', 'Supply'], Structure: ['Stone', 'Wood / Plant'], Fortification: ['Stone', 'Ore / Metal']
};
function h32(t) { var x = 2166136261; for (var i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
var CREATURE_OK = { 'Blood / Organ': 1, 'Essence / Soul / Core': 1, 'Bone / Fang / Horn / Scale': 1 };
function pickMat(ty, lv, seed) {
  var want = Math.max(1, lv), pool = [];
  for (var d = 1; d <= 50 && !pool.length; d += 1) pool = vaultMats.filter(function (m) { return (m.ty || m.cat) === ty && Math.abs((m.il || 1) - want) <= d && (CREATURE_OK[ty] || !(m.from && m.from.length) && m.org !== 'Creature'); });
  return pool.length ? pool[h32(seed) % pool.length].n : null;
}
D.BPS.forEach(function (b) {
  if (b.mats.length) return;
  var found = [], text = (b.ds || '') + ' ' + b.n;
  for (var i = 0; i < nameRe.length && found.length < 3; i++) {
    var n = nameRe[i].n, re = new RegExp('(^|[^A-Za-z])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])');
    if (re.test(text) && !found.some(function (f) { return f.indexOf(n) >= 0; })) found.push(n);
  }
  var rec = RECIPE[b.cat] || RECIPE.Artifact;
  if (b.cat === 'Armor' || b.cat === 'Shield') rec = { Tailoring: ['Hide / Cloth / Fiber'], Leatherworking: ['Hide / Cloth / Fiber'], Harvesting: ['Bone / Fang / Horn / Scale', 'Hide / Cloth / Fiber'], Carving: ['Bone / Fang / Horn / Scale', 'Wood / Plant'], Enchanting: ['Hide / Cloth / Fiber', 'Crystal / Gem'] }[b.pr] || rec;
  if (/\b(cloth|clothes|canvas|robe|jerkin|tunic|padded|silk|wool|linen|leather|hide)\b/i.test(b.n + ' ' + (b.ds || ''))) rec = ['Hide / Cloth / Fiber'];
  if (!found.length) rec.forEach(function (ty, k) { var m = pickMat(ty, b.lv || 1, b.n + k); if (m && found.indexOf(m) < 0) found.push(m); });
  if (found.length) { b.mats = found; b.mi = 1; gap.bpMats++; }
});
D.BPS.forEach(function (b) {
  if (b.ds) return;
  var what = (b.r ? b.r.toLowerCase() + ' ' : '') + b.cat.toLowerCase();
  b.ds = b.n + ': ' + article(what) + ' ' + what + ' made through ' + b.pr + (b.sp ? ' (' + b.sp + ')' : '') + ' at level ' + b.lv + '.'
    + (b.mats.length ? ' It is built from ' + b.mats.slice(0, -1).join(', ') + (b.mats.length > 1 ? ' and ' : '') + b.mats[b.mats.length - 1] + '.' : '')
    + (b.prop ? ' Property: ' + b.prop.replace(/\.?$/, '.') : '');
  b.dsg = 1; gap.bpDs++;
});
// Demons and patrons with no description: data/entity-lore.js (website lore, original writing).
try {
  var EL = require(path.join(__dirname, '..', 'data', 'entity-lore.js'));
  [['DEMONS', 'demons'], ['PATRONS', 'patrons']].forEach(function (k) {
    var n = 0; D[k[0]].forEach(function (e) { if (EL.rewrite && EL.rewrite[e.n] && !e.dsr) { e.ds = EL.rewrite[e.n]; e.dsr = 1; } if (!e.ds && EL[k[1]][e.n]) { e.ds = EL[k[1]][e.n]; e.dsg = 1; n++; } }); gap[k[1]] = n;
  });
} catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
log.push('gaps filled: ' + JSON.stringify(gap));

// ---- Armor Class rescale to the flat system (data/armor.js): a full set of iron gear gives 10.
// The vault's original value is kept as ac0. generators/vaultac.js applies the same formula to the vault notes.
var ARM = require(path.join(__dirname, '..', 'data', 'armor.js'));
var matByN = {}; D.MATS.forEach(function (m) { matByN[m.n.toLowerCase()] = m; });
var acDone = 0;
D.BPS.forEach(function (b) {
  if (b.ac0 === undefined && !b.ac) return;
  if (b.ac0 === undefined) b.ac0 = b.ac;
  var ms = b.mats.map(function (n) { return matByN[n.toLowerCase()]; }).filter(Boolean);
  var r = ARM.armorAC(b.n, b.cat, ms);
  b.slot = r.slot; b.ac = String(r.ac); acDone++;
});
log.push('armor AC rescaled on ' + acDone + ' Blueprints');

// ---- material origins and unique traits (data/traits.js)
var TR = require(path.join(__dirname, '..', 'data', 'traits.js'));
var monByName = {}; D.MONSTERS.forEach(function (m) { monByName[m.n.toLowerCase()] = m; });
var monNames = D.MONSTERS.map(function (m) { return m.n; }).sort(function (a, b) { return b.length - a.length; });
var orgCount = {};
D.MATS.forEach(function (m) {
  var a = byName[m.n.toLowerCase()], ty = a ? a.t : (m.tc || '');
  var c = null;
  if (m.from && m.from.length) c = monByName[m.from[0].toLowerCase()] || { n: m.from[0], txt: '' };
  if (!c) { var ln = m.n.toLowerCase(); for (var i = 0; i < monNames.length; i++) { var mn = monNames[i].toLowerCase(); if (ln.indexOf(mn + ' ') === 0 || ln === mn) { c = monByName[mn]; break; } } }
  var t = TR.trait(m, c ? { n: c.n, txt: c.txt || c.ds || '' } : null, ty);
  m.org = t.org; if (t.origin) m.origin = t.origin;
  if (t.name) m.tr = { n: t.name, t: t.text, a: t.from || '' }; else { delete m.tr; m.basic = t.text; }
  orgCount[t.org] = (orgCount[t.org] || 0) + 1;
});
log.push('material origins: ' + JSON.stringify(orgCount) + ', unique traits on ' + D.MATS.filter(function (m) { return m.tr; }).length);

// ---- stat blocks (data/statblock.js): generated in the Monster Manual layout, not copied from any book
var SB = require(path.join(__dirname, '..', 'data', 'statblock.js'));
var matByName = {}; D.MATS.forEach(function (m) { matByName[m.n.toLowerCase()] = m; });
D.MONSTERS.forEach(function (mon) {
  var best = null;
  (mon.drops || []).forEach(function (d) { var x = matByName[d[0].toLowerCase()]; if (x && x.tr && (!best || (x.rank || 0) > (best.rank || 0))) best = x; });
  mon.sb = SB.statblock(mon, mon.body, best);
});
log.push('stat blocks: ' + D.MONSTERS.filter(function (m) { return m.sb; }).length);


// ---- gods: split the roster details into fields; drop vault index pages that slipped into the lists
function dropConnections(arr, label) {
  var n = arr.length, out = arr.filter(function (e) { return e.grp !== 'Connections'; });
  log.push(label + ': removed ' + (n - out.length) + ' index-page entries');
  return out;
}
D.GODS = dropConnections(D.GODS, 'gods');
D.PATRONS = dropConnections(D.PATRONS, 'patrons');
// ---- completing the pantheons (data/gods-extra/*.json): every major god of each mythology the campaign uses.
// Written in the vault's own roster format so the parser below reads them the same way.
(function () {
  var dir = path.join(__dirname, '..', 'data', 'gods-extra'); if (!fs.existsSync(dir)) return;
  var have = {}; D.GODS.forEach(function (g) { have[g.n.split(' - ')[0].trim().toLowerCase()] = 1; });
  var ord = ['1st', '2nd', '3rd', '4th', '5th'], added = 0;
  fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort().forEach(function (f) {
    JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).forEach(function (g) {
      var key = String(g.n || '').split(' - ')[0].trim().toLowerCase(); if (!key || have[key]) return;
      var hand = (g.hand || []).slice(0, 5), seated = Math.min(5, g.seated != null ? g.seated : hand.length);
      g.ds = g.myth + ' \u2014 In FAND: Runes: ' + (g.runes || []).join(', ') + '. Home realm: ' + g.home + '. Wants: ' + g.wants + '. Signature materials: ' + (g.sig || []).join(', ') + '. Finger relic: ' + g.relic + '. Hand: ' + seated + ' of 5 seated' + (seated ? ' (' + hand.slice(0, seated).map(function (n, i) { return ord[i] + ' Finger: ' + n; }).join('; ') + ')' : '') + '.';
      D.GODS.push({ n: g.n, grp: g.grp, ds: g.ds, site: 1 }); have[key] = 1; added++;
    });
  });
  log.push('gods added to complete the pantheons: +' + added);
})();
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

// ---- More materials for every god (website addition). The vault gives each god three signature materials (Normal, Senior,
// Apostle). The site adds one for each other rank that names a material (Minor, Major, and a Finger material above the
// Apostle one, for the Fingers' relics) and a temple stock of six more the god's temples sell. Each is picked from the
// materials list by theme (the god's Runes, title, wants, and existing materials) and by Material Rank around the rank's step.
(function () {
  var STOP = { the: 1, of: 1, and: 1, god: 1, goddess: 1, a: 1, an: 1, to: 1, in: 1, for: 1, with: 1, its: 1, their: 1, from: 1, all: 1, every: 1, be: 1, kept: 1, no: 1, never: 1, who: 1, are: 1, is: 1, on: 1, or: 1, that: 1, those: 1, each: 1, by: 1, at: 1 };
  var words = function (t) { return String(t || '').toLowerCase().split(/[^a-z]+/).filter(function (w) { return w.length > 2 && !STOP[w]; }); };
  var pool = D.MATS.filter(function (m) { return !m.gen && m.rank; });
  var idx = {}; D.MATS.forEach(function (m) { idx[m.n.toLowerCase()] = m; });
  var used = {}, hay = pool.map(function (m) { return ' ' + words(m.n + ' ' + (m.pn || '') + ' ' + (m.tr ? m.tr.n + ' ' + m.tr.t : '') + ' ' + String(m.ds || '').slice(0, 240)).join(' ') + ' '; });
  var added = 0;
  D.GODS.forEach(function (g) {
    var sig = (g.sig || []).map(function (n) { return idx[n.toLowerCase()]; });
    if (sig.length < 3 || sig.some(function (x) { return !x; })) return;
    var title = (g.n.split(' - ')[1] || '');
    var kw = {}; words((g.runes || []).join(' ') + ' ' + (g.runes || []).join(' ') + ' ' + title + ' ' + title + ' ' + (g.wants || '') + ' ' + sig.map(function (m) { return m.n; }).join(' ')).forEach(function (w) { kw[w] = (kw[w] || 0) + 1; });
    var kws = Object.keys(kw), mine = {}; sig.forEach(function (m) { mine[m.n] = 1; });
    var homeTier = (D.MATS.find(function (m) { return m.realm === g.home; }) || {}).tier || 3;
    var pick = function (lo, hi, want, noCreature) {
      var best = null, bs = -1e9;
      pool.forEach(function (m, i) {
        if (mine[m.n] || m.rank < lo || m.rank > hi || (noCreature && m.org === 'Creature')) return;
        var sc = 0; kws.forEach(function (w) { if (hay[i].indexOf(' ' + w) >= 0) sc += 3 * kw[w]; });
        if (m.realm === g.home) sc += 2; if (sig.some(function (x) { return x.realm === m.realm; })) sc += 1;
        sc -= Math.abs(m.rank - want) / 4 + (used[m.n] || 0) * 2 + (m.org === 'Creature' ? 3 : 0);
        if (sc > bs) { bs = sc; best = m; }
      });
      if (best) { mine[best.n] = 1; used[best.n] = (used[best.n] || 0) + 1; }
      return best;
    };
    var r0 = sig[0].rank, r1 = sig[1].rank, r2 = sig[2].rank;
    var minor = pick(1, Math.max(12, r0), Math.max(1, Math.min(r0 - 3, 8)), true);  // the Minor material is also the passage offering: something a pilgrim can gather
    var major = pick(Math.min(r0, r1), Math.max(r0, r1), Math.round((r0 + r1) / 2));
    var finger = pick(Math.min(100, Math.max(r2 + 1, 20)), 100, Math.min(100, Math.max(r2 + 8, homeTier * 10)));
    g.rk = {};
    if (minor) g.rk.Minor = minor.n; g.rk.Normal = sig[0].n; if (major) g.rk.Major = major.n; g.rk.Senior = sig[1].n; g.rk.Apostle = sig[2].n; if (finger) g.rk.Finger = finger.n;
    var lo = Math.max(1, Math.min(r0, r1) - 10), hi = Math.max(r1, Math.min(100, homeTier * 10));
    g.stock = [];
    for (var k = 0; k < 6; k++) { var m = pick(lo, hi, lo + Math.round((hi - lo) * k / 5)); if (m) g.stock.push(m.n); }
    added += Object.keys(g.rk).length - 3 + g.stock.length;
  });
  log.push('god materials: +' + added + ' (rank materials for Minor, Major, and Finger, and a six-material temple stock per god)');
})();

// ---- write
// Two outputs from one template:
//   app/FAND.html  one self-contained file with every data array inline (works offline, and the other scripts patch it)
//   site/          one page per section; pages share data/core.js, and only spells.html loads the large spell list
var SITE_DIR = process.argv[5] || path.join(ROOT, 'site');
var tpl = fs.readFileSync(TEMPLATE, 'utf8');
// The stat block generator (data/statblock.js) also runs in the page, for the stat block creator on the Tools page.
tpl = tpl.replace('/*__SBGEN__*/', function () { return 'const SBGEN=(function(){var module={exports:{}};' + fs.readFileSync(path.join(__dirname, '..', 'data', 'statblock.js'), 'utf8').replace(/<\/(script)/gi, '<\\/$1') + '\nreturn module.exports})();'; });
if (tpl.indexOf('<!--__DATA__-->') < 0) throw new Error('template is missing the <!--__DATA__--> marker');
var META = { built: new Date().toISOString().slice(0, 10), version: '1.24', realms: REALMS, counts: { spells: D.SPELLS.length } };
// The world is called Vestige on the site (Atrious in older vault notes). Folder paths and links keep the vault's names.
var WORLD = function (t) { return t.replace(/(^|[^\/\w])Atrious\b(?!\/)/g, '$1Vestige'); };
var FOLDER = function (o) { if (o && typeof o.f === 'string') o.f = o.f.replace(/^Atrious(?=\/|$)/, 'Vestige'); };
function lit(k) {
  if (k === 'VAULT' && D.VAULT) D.VAULT.notes.forEach(FOLDER);
  if (k === 'VAULT_DETAILS' && D.VAULT_DETAILS) Object.keys(D.VAULT_DETAILS).forEach(function (t) { var o = D.VAULT_DETAILS[t]; Object.keys(o).forEach(function (n) { FOLDER(o[n]); }); });
  var j = JSON.stringify(D[k]); if (k !== 'VAULT' && k !== 'VAULT_DETAILS') j = WORLD(j); return 'const ' + k + '=' + j.replace(/<\/(script)/gi, '<\\/$1') + ';'; }
var VAULT_FILE = process.env.VAULT_JSON || path.join(__dirname, '..', 'data', 'vault.json');
D.VAULT = fs.existsSync(VAULT_FILE) ? JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8')) : { imported: '', notes: [] };
D.VAULT.notes = D.VAULT.notes.filter(function (n) { return !/^-+$/.test(n.n); });
// Notes written for the site in vault format (tools/data/vault-extra). A vault note with the same name wins.
(function () {
  var dir = path.join(__dirname, '..', 'data', 'vault-extra'), have = {}, added = 0;
  if (!fs.existsSync(dir)) return;
  D.VAULT.notes.forEach(function (n) { have[n.n.toLowerCase()] = 1; });
  (function walk(d) { fs.readdirSync(d).forEach(function (f) {
    var p = path.join(d, f); if (fs.statSync(p).isDirectory()) return walk(p);
    if (!/\.md$/i.test(f) || have[f.slice(0, -3).toLowerCase()]) return;
    var t = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'), fm = {}, m = /^---\n([\s\S]*?)\n---\n?/.exec(t);
    if (m) { m[1].split('\n').forEach(function (l) { var k = /^([\w -]+):\s*(.*)$/.exec(l); if (k) fm[k[1].trim()] = k[2].trim().replace(/^["']|["']$/g, ''); }); t = t.slice(m[0].length); }
    D.VAULT.notes.push({ n: f.slice(0, -3), f: path.relative(dir, d).split(path.sep).join('/') || 'FAND', fm: fm, md: t.trim(), site: 1 }); added++;
  }); })(dir);
  if (added) log.push('site notes in vault format added: ' + added + ' (tools/data/vault-extra)');
})();
// Spells come from the vault when it has them: every spell note with a school becomes a spell on the site.
(function () {
  var vs = D.VAULT.notes.filter(function (n) { return /(^|\/)Spells(\/|$)/i.test(n.f) && n.fm && n.fm.school; });
  if (!vs.length) return;
  D.SPELLS = vs.map(function (n) {
    var fm = n.fm, body = n.md.replace(/^#.*\n+/, '').replace(/^\*[^*\n]+\*\s*\n+/, '').split(/\n\s*\n/)[0] || '';
    var lv = /cantrip/i.test(fm.level || '') ? 0 : parseInt(fm.level, 10) || 0;
    return { n: n.n, sc: fm.school, lv: lv, ct: fm.castingTime || '', rng: fm.range || '', dur: fm.duration || '', dmg: fm.damage || '', comp: fm.components || '',
      tier: fm.tier || '', rune: fm.rune || '', cls: (fm.class || '').replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1').split(/\s*,\s*/).filter(Boolean),
      desc: body.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, function (m, a) { return a.split('/').pop(); }).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim() };
  }).sort(function (a, b) { return a.n < b.n ? -1 : 1; });
  log.push('spells: ' + D.SPELLS.length + ' from the vault (replacing the generated list)');
  // healing spells that state their dice only in the text (e.g. Cure Wounds) get a Healing value, so stage scaling applies
  var healed = 0; D.SPELLS.forEach(function (x) { if (x.dmg && x.dmg !== 'None') return; var m = /(?:regains?|heals?|restores?)[^.]{0,60}?(\d+d\d+)/i.exec(x.desc || ''); if (m) { x.dmg = m[1] + ' Healing'; healed++; } });
  log.push('healing spells given a Healing value from their text: ' + healed);
})();
// Notes that match a website entry are attached to it ("From the vault"); the rest stay in the Codex.
D.VAULT_DETAILS = { bp: {}, mat: {}, spell: {}, sub: {}, mon: {}, god: {} };
(function () {
  var idx = {};
  function add(t, arr, key) { arr.forEach(function (x) { var name = key ? key(x) : x.n, k = name.toLowerCase(); if (!idx[k]) idx[k] = [t, name]; }); }
  add('god', D.GODS, function (g) { return g.n.split(' - ')[0].trim(); }); add('bp', D.BPS); add('mat', D.MATS); add('mon', D.MONSTERS); add('sub', D.SUBS);
  var spellNames = {}; D.SPELLS.forEach(function (x) { spellNames[x.n.toLowerCase()] = x.n; });
  var codex = [], attached = 0;
  D.VAULT.notes.forEach(function (n) {
    var k = n.n.toLowerCase(), hit = idx[k] || (spellNames[k] ? ['spell', spellNames[k]] : null);
    var dataFolder = /(^|\/)(Blueprints|Materials|Spells|Subclasses)(\/|$)/i.test(n.f);
    if (hit && !/(^|\/)Runes(\/|$)/i.test(n.f) && (dataFolder || hit[0] === 'god' || hit[0] === 'mon' || hit[0] === 'sub')) { D.VAULT_DETAILS[hit[0]][hit[1]] = { f: n.f, md: n.md }; attached++; }
    else codex.push(n);
  });
  D.VAULT = { imported: D.VAULT.imported, notes: codex };
  log.push('vault notes: ' + codex.length + ' in the Codex, ' + attached + ' attached to website entries' + (D.VAULT.imported ? ' (imported ' + D.VAULT.imported + ')' : ' (none yet: run generators/importvault.js)'));
})();
// Hidden classes and Towers (data/hidden.js): website lore on the campaign owner's rules.
try { D.HIDDEN = require(path.join(__dirname, '..', 'data', 'hidden.js')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; D.HIDDEN = { towers: {}, classes: [] }; }
// more hidden classes written in parts (data/hidden-parts/out-*.json); duplicate names get their subclass or Rune added
(function () {
  var dir = path.join(__dirname, '..', 'data', 'hidden-parts');
  if (!fs.existsSync(dir)) return;
  var seen = {}; D.HIDDEN.classes.forEach(function (c) { seen[c.n.toLowerCase()] = 1; });
  fs.readdirSync(dir).filter(function (f) { return /^out-.*\.json$/.test(f); }).sort().forEach(function (f) {
    JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).forEach(function (c) {
      if (!c || !c.n || !c.tier) return;
      var n = c.n; if (seen[n.toLowerCase()]) n = c.n + ' (' + (c.sub || c.rune || c.base) + ')';
      if (seen[n.toLowerCase()]) return;
      seen[n.toLowerCase()] = 1; c.n = n; D.HIDDEN.classes.push(c);
    });
  });
})();
log.push('hidden classes: ' + D.HIDDEN.classes.length + ', towers: ' + Object.keys(D.HIDDEN.towers).length);
// The hidden class list is locked behind a code (asked for by the campaign owner): the classes are encrypted with
// AES-256-GCM under a key derived from the code (PBKDF2-SHA256), and the page decrypts them when the code is entered.
// This keeps the list from casual reading; it is not strong security (the code is short and lives here).
var HIDDEN_CODE = '4321';
(function () {
  var crypto = require('crypto'), cls = D.HIDDEN.classes || [];
  if (!cls.length) return;
  var plain = Buffer.from(JSON.stringify(cls), 'utf8');
  var salt = crypto.createHash('sha256').update('fand-hidden-classes').digest().slice(0, 16);
  var iv = crypto.createHash('sha256').update(plain).digest().slice(0, 12);
  var key = crypto.pbkdf2Sync(HIDDEN_CODE, salt, 150000, 32, 'sha256');
  var c = crypto.createCipheriv('aes-256-gcm', key, iv), enc = Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]);
  var counts = {}, byTower = {};
  cls.forEach(function (x) { counts[x.tier] = (counts[x.tier] || 0) + 1; byTower[x.tower] = (byTower[x.tower] || 0) + 1; });
  D.HIDDEN = { towers: D.HIDDEN.towers, counts: counts, byTower: byTower, lock: { salt: salt.toString('base64'), iv: iv.toString('base64'), data: enc.toString('base64'), it: 150000 } };
})();
// Class changes past level 20 (data/stages.js)
try { D.STAGES = require(path.join(__dirname, '..', 'data', 'stages.js')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; D.STAGES = {}; }
log.push('class stages: ' + Object.keys(D.STAGES).length + ' classes');
var CORE = ['BPS', 'MATS', 'MONSTERS', 'SUBS', 'GODS', 'DEMONS', 'PATRONS', 'MAT_FX', 'HIDDEN', 'STAGES'];
var metaLine = 'const META=' + JSON.stringify(META) + ';';
var VENDOR = fs.readFileSync(path.join(__dirname, '..', 'app', 'vendor', 'anthropic.js'), 'utf8');
var single = '<script>\n' + VENDOR.replace(/<\/(script)/gi, '<\\/$1') + '\n</script>\n<script>\nconst SITE=null;\n' + ['BPS', 'SPELLS', 'VAULT', 'VAULT_DETAILS'].concat(CORE.slice(1)).map(lit).join('\n') + '\n' + metaLine + '\n</script>';
var out = tpl.split('<!--__DATA__-->').join(single);
var PAGES = ['home', 'lore', 'codex', 'blueprints', 'materials', 'bestiary', 'realms', 'gods', 'runes', 'professions', 'spells', 'subclasses', 'demons', 'patrons', 'forge', 'craft', 'party', 'sheet', 'encounter', 'prep', 'hooks', 'journal', 'hidden', 'towers', 'combat', 'rules', 'tools', 'about'];
var site = {};
var PAGE_INFO = {
  home: ['Home', 'FAND (Fantasy and Numerous Disasters) campaign compendium: Blueprints, materials, monsters, realms, gods, spells, rules, and table tools for the world of Vestige.'],
  blueprints: ['Blueprints', D.BPS.length.toLocaleString('en-US') + ' craftable Blueprints across ten professions, with materials, rarity, damage, AC, and properties.'],
  materials: ['Materials', D.MATS.length.toLocaleString('en-US') + ' graded materials from eleven realms, with rank, Item Level, property, Potency, price, and sources.'],
  bestiary: ['Bestiary', D.MONSTERS.length.toLocaleString('en-US') + ' monsters across eleven realms, with grades, habitats, and drops.'],
  realms: ['Realms', 'The eleven realms of Vestige in ten tiers: their monsters, materials, gathering, and gods.'],
  gods: ['Gods', D.GODS.length + ' gods with their Runes, home realms, signature materials, Hands, and rivals.'],
  professions: ['Professions', 'The ten professions of FAND, their specialties, and example Blueprints by level.'],
  spells: ['Spells', D.SPELLS.length.toLocaleString('en-US') + ' spells across twenty schools, filterable by class, level, and casting time.'],
  subclasses: ['Subclasses', D.SUBS.length + ' official and homebrew subclasses for every class.'],
  demons: ['Demons', 'Archdevils, demon princes, Great Old Ones, and the named corruptions of FAND.'],
  patrons: ['Patrons', 'Warlock patrons of FAND: fiends, archfey, Great Old Ones, the undying, celestials, genies, and homebrew.'],
  rules: ['Rules', 'Rules summaries for Armor Class, material grading, properties, refining, economy, professions, realm travel, god contracts, classes, spells, and monster stats.'],
  tools: ['Tools', 'Table tools: damage vs. AC, material grade, refining planner, encounter and loot roller, and realm Pressure check.'],
  forge: ['Forge', 'General Blueprints for every weapon, armor piece, shield, and focus: choose a material for each part (head, haft, grip) and see the finished item, with heavy penalties for the wrong materials.'],
  craft: ['Crafting planner', 'Plan a Blueprint: every material, where to get it, what it costs, and what your crafter is missing.'],
  party: ['Party', 'Track each character: god contract, rivals, gear and traits, materials, money, and realm Pressure.'],
  hidden: ['Hidden classes', 'Hidden classes of Vestige, unlocked only through quests and the Towers: Unique (one of a kind), Epic (a basic class specialised), and Legendary (following a Rune progenitor).'],
  towers: ['Towers', 'The Towers in every realm, built from the excess energy of unclaimed Runes: their floors, guardians, the Runes that feed them, and the hidden classes they hold.'],
  sheet: ['Character sheet', 'Create and play a character on a full sheet: abilities, saves, skills, AC from worn gear, attacks, spells and slots, contracts, class stage, and backstory, worked out with FAND\'s rules.'],
  journal: ['Session journal', 'Notes from each session of the campaign, saved on your device, with links to every monster, god, material, and realm.'],
  prep: ['Session prep', 'One page that rolls a whole session for your party: hooks, NPCs, three fights, a named foe, a Tower floor, loot, and the deeds that earn a level.'],
  hooks: ['Adventure hooks', 'Story starters built from the gods, Runes, realms, monsters, and Blueprints of Vestige, scaled to your party.'],
  encounter: ['Encounters', 'Build balanced encounters from a realm\'s Bestiary by party size and level.'],
  combat: ['Combat', 'Initiative, HP, and conditions, with FAND\'s flat AC applied to every hit.'],
  lore: ['Lore', 'The lore of Vestige: Infinatas and Inane, how the gods came to this realm, the pantheons, the contested Runes, the realms, and the progenitors.'],
  runes: ['Runes', 'Every Rune in FAND: its progenitor, who held it before vanishing or being killed, the gods who inherited and contest it, and the relics that channel it.'],
  codex: ['Codex', 'Every note from the FAND Obsidian vault: rules, Runes, realms, classes, gods, the Player\'s Guide, and patch notes.'],
  about: ['About', 'What has been built in FAND, version by version, and what is still open.']
};
site['data/core.js'] = CORE.map(lit).join('\n') + '\n' + metaLine + '\n';
site['data/spells.js'] = lit('SPELLS') + '\n';
site['vendor/anthropic.js'] = VENDOR;
site['data/vault.js'] = lit('VAULT') + '\n';
site['data/vault-details.js'] = lit('VAULT_DETAILS') + '\n';
PAGES.forEach(function (pg) {
  var tags = '<script>const SITE={page:' + JSON.stringify(pg) + '};</script>\n<script src="data/core.js"></script>\n<script src="data/vault.js"></script>' + (pg === 'spells' || pg === 'sheet' || pg === 'tools' ? '\n<script src="data/spells.js"></script>' : '');
  var html = tpl.split('<!--__DATA__-->').join(tags);
  var info = PAGE_INFO[pg];
  html = html.replace('<title>FAND · Fantasy and Numerous Disasters</title>', '<title>' + (pg === 'home' ? 'FAND · Fantasy and Numerous Disasters' : info[0] + ' · FAND') + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, function () {
      var d = info[1].replace(/"/g, '&quot;');
      return '<meta name="description" content="' + d + '">\n<meta property="og:title" content="' + (pg === 'home' ? 'FAND Compendium' : info[0] + ' · FAND Compendium') + '">\n<meta property="og:description" content="' + d + '">\n<meta property="og:type" content="website">';
    });
  if (pg === 'spells') html = html.replace('Loading the compendium…', 'Loading ' + D.SPELLS.length.toLocaleString('en-US') + ' spells…');
  site[pg === 'home' ? 'index.html' : pg + '.html'] = html;
});
console.log(log.join('\n'));
console.log(MODE, IN, '->', OUT, (t.length / 1e6).toFixed(2) + ' MB ->', (out.length / 1e6).toFixed(2) + ' MB');
console.log('site', SITE_DIR + ':', Object.keys(site).map(function (f) { return f + ' ' + (site[f].length / 1e6).toFixed(2) + ' MB'; }).join(', '));
if (MODE === 'go') {
  fs.writeFileSync(OUT, out);
  [SITE_DIR, path.join(SITE_DIR, 'data'), path.join(SITE_DIR, 'vendor')].forEach(function (d) { if (!fs.existsSync(d)) fs.mkdirSync(d); });
  Object.keys(site).forEach(function (f) { fs.writeFileSync(path.join(SITE_DIR, f), site[f]); });
  console.log('written');
}
