var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js'));
var PR = require(require('path').join(__dirname, '..', 'data', 'properties.js'));
var pn = function (n, t, c, g) { return PR.prop(n, t, c, g).name; };
var W = {}, w1 = require(require('path').join(__dirname, '..', 'data', 'world1.js')), w2 = require(require('path').join(__dirname, '..', 'data', 'world2.js'));
Object.keys(w1).forEach(function (k) { W[k] = w1[k]; }); Object.keys(w2).forEach(function (k) { W[k] = w2[k]; });

// existing graded materials + usage counts
var G = {}, used = {};
require(require('path').join(__dirname, '..', 'data', 'grades.js')).trim().split('\n').forEach(function (l) { var p = l.split('|'), q = p[1].split(' '); G[p[0]] = { r: q[0], g: +q[1], t: q[2] }; });
fs.readFileSync(require('path').join(__dirname, '..', 'data', 'mats.tsv'), 'utf8').split('\n').forEach(function (l) { var p = l.split('\t'); used[p[0]] = +p[1]; });
var lower = {}; Object.keys(G).forEach(function (k) { lower[k.toLowerCase()] = k; });

var esc = function (s) { return s.replace(/\|/g, '\\|'); };
var link = function (path, label) { return '[[' + path + '\\|' + label + ']]'; };
var bpage = function (c) { return 'FAND/Atrious/Bestiary/' + R.name(c) + ' Bestiary'; };
var gpage = function (c) { return 'FAND/Atrious/Gathering/' + R.name(c) + ' Gathering'; };
var gradeStr = function (c, g) { return R.name(c) + ' ' + g; };

var all = [], dup = [], seen = {};
var dropRefs = {};
function addMat(name, c, g, t, src, extra) {
  var k = name.toLowerCase();
  if (lower[k]) dup.push(name + ' (exists in Blueprints as ' + lower[k] + ')');
  if (seen[k]) dup.push(name + ' (defined twice)');
  seen[k] = 1;
  all.push({ n: name, c: c, g: g, t: t, src: src, x: extra || {} });
}
// official D&D monsters
var OFF = {};
['official1', 'official2', 'official3', 'official4', 'official5'].forEach(function (f) {
  require(SC + '/' + f + '.js').trim().split('\n').forEach(function (l) {
    var p = l.split('|'); if (p.length < 6) throw new Error('bad line ' + l);
    (OFF[p[2]] = OFF[p[2]] || []).push({ n: p[0], cr: p[1], c: p[2], t: p[3], s: p[4], d: p[5], drops: p[6] });
  });
});
function crNum(s) { if (s.indexOf('/') > 0) { var q = s.split('/'); return +q[0] / +q[1]; } return +s; }
function band(cr) { var b = [[0.5, 1], [2, 2], [4, 3], [6, 4], [8, 5], [11, 6], [14, 7], [17, 8], [21, 9]]; for (var i = 0; i < b.length; i++) if (cr <= b[i][0]) return b[i][1]; return 10; }
var TPL = { be: [['Hide', 'F'], ['Fang', 'B']], mo: [['Hide', 'F'], ['Claw', 'B']], gi: [['Bone', 'B'], ['Blood', 'L']], dr: [['Scale', 'B'], ['Blood', 'L']], un: [['Essence', 'E']], fi: [['Horn', 'B'], ['Ichor', 'L']], ce: [['Feather', 'F'], ['Essence', 'E']], fe: [['Dust', 'E']], el: [['Core', 'E']], ab: [['Eye', 'L'], ['Ichor', 'L']], co: [['Core', 'E'], ['Plating', 'O']], oo: [['Residue', 'L']], pl: [['Fiber', 'W'], ['Sap', 'L']], hu: [] };
var WK = {};
R.order.forEach(function (c) {
  W[c].monsters.forEach(function (m) { m[4].forEach(function (x) { WK[x[0].toLowerCase()] = { c: c, g: x[1], t: x[2] }; }); });
  W[c].gather.forEach(function (x) { WK[x[0].toLowerCase()] = { c: c, g: x[1], t: x[2] }; });
});
var HORNED = {}; ['Imp','Spined Devil','Bearded Devil','Barbed Devil','Horned Devil','Pit Fiend','Balor','Goristro','Bulezau','Armanite','Tanarukk','Cambion','Succubus','Molydeus','Orthon','White Abishai','Black Abishai','Green Abishai','Blue Abishai','Red Abishai','Babau','Quasit','Draegloth','Glabrezu','Nalfeshnee','Barlgura','Narzugon','Shoosuva','Rutterkin'].forEach(function (n) { HORNED[n] = 1; });
var norm = function (s) { return s.toLowerCase().replace(/[^a-z]/g, ''); };
var offCount = 0, offDup = [], offGrade = {};

function mstats(c, g, drops) {
  var L = R.level(c, g), boss = g === 10, hp = 12 * L * (boss ? 2 : 1), ac = 2 * L, red = Math.round(100 * ac / (ac + 30));
  var n = L < 5 ? 1 : L < 15 ? 2 : 3, dice = Math.max(1, Math.round(3 * L / n / 4.5)), dc = 10 + Math.ceil(L / 3);
  var best = null; drops.forEach(function (x) { if (x[2] === 'U') return; var rk = R.rank(c, x[1]); if (!best || rk > best.rk) best = { rk: rk, x: x }; });
  var s = '**Stats:** Level ' + L + ' · HP ' + hp + ' · Natural AC ' + ac + ' (' + red + '% reduction) · ' + n + (n > 1 ? ' attacks' : ' attack') + ' of ' + dice + 'd8 · Save DC ' + dc;
  if (best) { var q = PR.prop(best.x[0], best.x[2], c, best.x[1]); if (q.k !== 'supply') s += '\n**Trait (' + q.name + ', Potency ' + q.P + '):** ' + q.text.replace(/^Weapon: /, 'Its attacks: ').replace(/ Armor: /, ' Its hide: ').replace(/ The item (repairs itself overnight|slowly regrows if damaged)./, '').replace(/; the item counts as a relic that gods and their contractors will want/, '').replace(/\byour\b/g, 'its').replace(/\bYour\b/g, 'Its').replace(/\byou\b/g, 'it').replace(/\bYou\b/g, 'It').replace(/\bthe wielder\b/g, 'it').replace(/\bit attack\b/g, 'it attacks').replace(/ Weapon: /g, ' Its attacks: ').replace(/^Regain /, 'Regains ').replace(/\. Weapons work normally/, '. Its attacks work normally'); }
  if (boss) s += '\n**Boss:** double HP, and 3 legendary actions per round (one attack each).';
  return s;
}
var out = {};
R.order.forEach(function (c) {
  var d = W[c]; if (!d) throw new Error('no data ' + c);
  var rn = R.name(c);
  // Bestiary
  var L = ['# ' + rn + ' Bestiary', '', d.intro, '',
    'Realm: [[' + R.page(c) + ']] (tier ' + R.tier(c) + '). A monster\'s grade is its strength within this realm, from 1 to 10. Its drops use the same scale; see [[FAND/Atrious/Material Grading|Material Grading]] for how grades turn into Item Level. Stripping a corpse for its drops uses the [[FAND/Atrious/Professions/Scavenging|Scavenging]] profession.', '',
    '## Monsters at a glance', '| Monster | Grade | Habitat |', '|---|---|---|'];
  d.monsters.forEach(function (m) { L.push('| ' + m[0] + ' | ' + gradeStr(c, m[1]) + ' | ' + m[3] + ' |'); });
  L.push('');
  d.monsters.forEach(function (m) {
    L.push('## ' + m[0], '*' + gradeStr(c, m[1]) + ' · ' + m[3] + '*', '', m[2], '', mstats(c, m[1], m[4]), '', '| Drop | Grade | Type | Property | Used for |', '|---|---|---|---|---|');
    m[4].forEach(function (x) {
      L.push('| ' + x[0] + ' | ' + gradeStr(c, x[1]) + ' | ' + R.TYPES[x[2]] + ' | ' + pn(x[0], x[2], c, x[1]) + ' | ' + x[3] + ' |');
      addMat(x[0], c, x[1], x[2], link(bpage(c), rn + ' Bestiary') + ': ' + m[0], { kind: 'Monster drop', from: m[0], use: x[3], page: bpage(c) });
    });
    L.push('');
  });
  var offs = OFF[c] || [];
  var origNames = {}; d.monsters.forEach(function (m) { origNames[norm(m[0])] = m[0]; });
  L.push('## D&D monsters', offs.length ?
    'Official monsters from the Monster Manual (MM), Volo\'s Guide to Monsters (VGM), Mordenkainen\'s Tome of Foes (MTF), Fizban\'s Treasury of Dragons (FTD), and Bigby Presents: Glory of the Giants (BGG). Names are official; descriptions are my own and there are no stat blocks, so check the book for stats. CR is from memory; BGG CRs are approximate. Grade comes from CR: CR 0–½ = 1, 1–2 = 2, 3–4 = 3, 5–6 = 4, 7–8 = 5, 9–11 = 6, 12–14 = 7, 15–17 = 8, 18–21 = 9, 22+ = 10. Humanoids drop gear and coin, not materials. **Converting a book stat block to FAND:** keep its HP and damage, and use Natural AC = 2 × (book AC − 10) + CR (see [[FAND/Atrious/Monster Stats|Monster Stats]]). Named unique characters (deities, demon lords, archdevils) are left out; the vault already has renamed versions.'
    : 'No official D&D monsters belong to this realm.', '');
  if (offs.length) {
    L.push('| Monster | CR | Grade | Source | Description | Drops |', '|---|---|---|---|---|---|');
    offs.sort(function (a, b) { return crNum(a.cr) - crNum(b.cr) || (a.n < b.n ? -1 : 1); }).forEach(function (o) {
      var g = band(crNum(o.cr)); offCount++;
      var dropsTxt;
      if (origNames[norm(o.n)]) { dropsTxt = 'See ' + origNames[norm(o.n)] + ' above'; offDup.push(o.n); }
      else {
        var list = o.drops ? o.drops.split(';').map(function (s) { var q = s.split(':'); return [q[0], q[1]]; })
          : (o.t === 'fi' && !HORNED[o.n] ? [['Ichor', 'L'], ['Essence', 'E']] : TPL[o.t]).map(function (x) { return [o.n + ' ' + x[0], x[1]]; });
        dropsTxt = list.length ? list.map(function (x) {
          var k = x[0].toLowerCase();
          if (lower[k]) { (dropRefs[lower[k]] = dropRefs[lower[k]] || []).push(o.n); var e = G[lower[k]]; return esc(lower[k]) + ' (' + gradeStr(e.r, e.g) + ', ' + pn(lower[k], e.t, e.r, e.g) + ')'; }
          if (WK[k]) return x[0] + ' (' + gradeStr(WK[k].c, WK[k].g) + ', ' + pn(x[0], WK[k].t, WK[k].c, WK[k].g) + ')';
          if (offGrade[k]) { (dropRefs[x[0]] = dropRefs[x[0]] || []).push(o.n); } if (offGrade[k]) return x[0] + ' (' + offGrade[k] + ')';
          offGrade[k] = gradeStr(c, g) + ', ' + pn(x[0], x[1], c, g);
          addMat(x[0], c, g, x[1], link(bpage(c), rn + ' Bestiary') + ': ' + esc(o.n), { kind: 'Monster drop', from: o.n, page: bpage(c) });
          return x[0] + ' (' + offGrade[k] + ')';
        }).join(', ') : 'Gear and coin only';
      }
      L.push('| ' + esc(o.n) + ' | ' + o.cr + ' | ' + gradeStr(c, g) + ' | ' + o.s + ' | ' + esc(o.d) + ' | ' + dropsTxt + ' |');
    });
    L.push('');
  }
  var ex = Object.keys(G).filter(function (k) { return G[k].r === c && /[BL]/.test(G[k].t); }).sort();
  if (ex.length) {
    L.push('## Other creature materials from this realm', 'Already used in existing Blueprints. The DM decides which creature drops them.', '', '| Material | Grade | Type | Property | Blueprints using it |', '|---|---|---|---|---|');
    ex.forEach(function (k) { L.push('| ' + esc(k) + ' | ' + gradeStr(c, G[k].g) + ' | ' + R.TYPES[G[k].t] + ' | ' + pn(k, G[k].t, c, G[k].g) + ' | ' + (used[k] || 0) + ' |'); });
    L.push('');
  }
  L.push('## Related', '- [[' + gpage(c) + '|' + rn + ' Gathering]]', '- [[FAND/Atrious/Material Index|Material Index]]', '- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]', '');
  out[A + '/Bestiary/' + rn + ' Bestiary.md'] = L.join('\n');

  // Gathering
  L = ['# ' + rn + ' Gathering', '', 'Ores, stone, crystals, plants, and other materials gathered in the [[' + R.page(c) + ']] (tier ' + R.tier(c) + '). Anyone can try to gather; characters with the [[FAND/Atrious/Professions/Harvesting|Harvesting]] profession gather more and better, while parts taken from corpses (hide, bone, blood, organs, essences) come from [[FAND/Atrious/Professions/Scavenging|Scavenging]] and are listed in the Bestiaries. The material type decides which profession crafts with it (see [[FAND/Atrious/Master Professions|Master Professions]]).', '',
    '| Material | Grade | Item Level | Type | Property | Where | Gathered by | Used for |', '|---|---|---|---|---|---|---|---|'];
  d.gather.forEach(function (x) {
    L.push('| ' + x[0] + ' | ' + gradeStr(c, x[1]) + ' | ' + R.level(c, x[1]) + ' | ' + R.TYPES[x[2]] + ' | ' + pn(x[0], x[2], c, x[1]) + ' | ' + x[3] + ' | ' + x[4] + ' | ' + x[5] + ' |');
    addMat(x[0], c, x[1], x[2], link(gpage(c), rn + ' Gathering'), { kind: 'Gathered', where: x[3], by: x[4], use: x[5], page: gpage(c) });
  });
  L.push('');
  ex = Object.keys(G).filter(function (k) { return G[k].r === c && !/[BL]/.test(G[k].t); }).sort();
  if (ex.length) {
    L.push('## Also from this realm', 'Materials already used in existing Blueprints. Supplies are crafting consumables and can\'t be a Primary or Secondary material.', '', '| Material | Grade | Type | Property | Blueprints using it |', '|---|---|---|---|---|');
    ex.forEach(function (k) { L.push('| ' + esc(k) + ' | ' + gradeStr(c, G[k].g) + ' | ' + R.TYPES[G[k].t] + ' | ' + pn(k, G[k].t, c, G[k].g) + ' | ' + (used[k] || 0) + ' |'); });
    L.push('');
  }
  L.push('## Related', '- [[' + bpage(c) + '|' + rn + ' Bestiary]]', '- [[FAND/Atrious/Material Index|Material Index]]', '- [[FAND/Atrious/Crafting Rules|Crafting Rules]]', '');
  out[A + '/Gathering/' + rn + ' Gathering.md'] = L.join('\n');
});

// Material Index
Object.keys(G).forEach(function (k) { all.push({ n: k, c: G[k].r, g: G[k].g, t: G[k].t, src: 'Existing Blueprints (' + (used[k] || 0) + ')', old: 1, x: { kind: 'Blueprint material', used: used[k] || 0 } }); });
var I = ['# Material Index', '', 'Every graded material in FAND: ' + all.length + ' in total. ' + Object.keys(G).length + ' come from the existing Blueprints and ' + (all.length - Object.keys(G).length) + ' are new, from the Bestiary and Gathering pages. Rules: [[FAND/Atrious/Material Grading|Material Grading]].', '',
  '**Notes on grading the existing materials**',
  '- A Blueprint\'s `level` is the profession skill needed to make it; a material\'s grade is the material\'s own power. They don\'t have to match. Every Blueprint now also lists `materialGrade` and `materialRank` for its strongest material.',
  '- Void-named materials in the existing Blueprints (Voidmetal, Void Nullstone, etc.) are Void leakage caught in lower realms, graded Mysterious or Chaos. True Void materials, such as Nullsteel, start at Void 1.',
  '- Every material has a **property** it gives to a [[FAND/Atrious/Custom Blueprints|Custom Blueprint]]. How properties work and scale: [[FAND/Atrious/Material Properties|Material Properties]].',
  '- Supplies (oils, inks, wire, tools) are graded low and can\'t be used as a Primary or Secondary material.', '',
  '## Realm pages', '| Realm | Bestiary | Gathering |', '|---|---|---|'];
R.order.forEach(function (c) { I.push('| [[' + R.page(c) + ']] | ' + link(bpage(c), R.name(c) + ' Bestiary') + ' | ' + link(gpage(c), R.name(c) + ' Gathering') + ' |'); });
I.push('');
R.order.forEach(function (c) {
  var rows = all.filter(function (m) { return m.c === c; }).sort(function (a, b) { return a.g - b.g || (a.n < b.n ? -1 : 1); });
  I.push('## ' + R.name(c) + ' (' + rows.length + ')', '| Material | Grade | Rank | Item Level | Type | Property | Source |', '|---|---|---|---|---|---|---|');
  rows.forEach(function (m) { I.push('| ' + esc(m.n) + ' | ' + m.g + ' | ' + R.rank(c, m.g) + ' | ' + R.level(c, m.g) + ' | ' + R.TYPES[m.t] + ' | ' + (function () { var q = PR.prop(m.n, m.t, c, m.g); return q.k === 'supply' ? '—' : '**' + q.name + '** (Potency ' + q.P + '): ' + q.text; })() + ' | ' + m.src + ' |'); });
  I.push('');
});
I.push('## Related', '- [[FAND/Atrious/Material Grading|Material Grading]]', '- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]', '');
out[A + '/Material Index.md'] = I.join('\n');

all.forEach(function (m) { if (dropRefs[m.n]) m.x.also = dropRefs[m.n]; });
fs.writeFileSync(require('path').join(__dirname, '..', 'data', 'all.json'), JSON.stringify(all));
console.log('duplicates:', dup);
console.log('official monsters', offCount, 'matched homebrew', offDup);
var nm = all.filter(function (m) { return !m.old; });
console.log('files', Object.keys(out).length, 'total materials', all.length, 'new', nm.length,
  'monsters', R.order.reduce(function (s, c) { return s + W[c].monsters.length; }, 0));
if (MODE === 'go') {
  ['Bestiary', 'Gathering'].forEach(function (d) { if (!fs.existsSync(A + '/' + d)) fs.mkdirSync(A + '/' + d); });
  Object.keys(out).forEach(function (p) { fs.writeFileSync(p, out[p]); });
  console.log('written');
}
