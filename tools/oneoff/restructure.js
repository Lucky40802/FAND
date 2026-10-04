var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND';
var A = V + '/FAND/Atrious';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var MAP = require(require('path').join(__dirname, '..', 'data', 'profmap.js'));
var FILE = function (n) { return n === 'Alchemy' ? 'Alchemy (Profession)' : n; };
var NEW = {
  Blacksmithing: ['Working metal into weapons, armor, tools, and fittings, from village iron to the metals of Hell, Heaven, and the Void.', 'Ore / Metal', 'Hell, Heaven, and Void metals need a **realm specialty**: a Blacksmith works them at disadvantage until they have finished one item of that metal under a teacher who has the specialty. The specialties are Infernal Forging (Hell), Celestial Metallurgy (Heaven), and Void Smithing (Void and Inner Void).'],
  Carving: ['Shaping wood, stone, bone, horn, scale, crystal, and coral into bows, staffs, shields, foci, statues, and gem-set gear.', 'Wood / Plant, Stone, Bone / Fang / Horn / Scale, Crystal / Gem', ''],
  Tailoring: ['Cloth, leather, hide, silk, and shadow-thread made into light armor, cloaks, robes, bags, and enchanted garments.', 'Hide / Cloth / Fiber', ''],
  Alchemy: ['Potions, poisons, oils, elixirs, and the blood arts: anything brewed, distilled, or drawn from a living body.', 'Blood / Organ, plants, and supplies', ''],
  Cooking: ['Meals that strengthen, heal, and protect, from a hearty camp stew to feasts made with spirit-touched ingredients from other realms.', 'Food ingredients from any realm', ''],
  Enchanting: ['Putting power into things: runes, sigils, and glyphs; binding souls and elemental cores into items; and restoring broken relics.', 'Essence / Soul / Core, Crystal / Gem', ''],
  Engineering: ['Mechanisms, constructs, siege weapons, and buildings: clockwork, golems, catapults, bridges, walls, and keeps.', 'Mechanism, plus Stone and Wood for structures', ''],
  Harvesting: ['Gathering what the land and its creatures give: farming, mining, foraging, fishing, and raising or taming animals.', 'Any raw material; crafts crops, seed stock, and livestock', ''],
  Scavenging: ['Salvaging what others leave behind: butchering monsters for parts, looting ruins, and stripping wrecks. Scavengers can refine any material type, at disadvantage.', 'Any material, from any source', ''],
  Navigation: ['Maps, charts, and instruments for finding the way, in the Mortal Realm and across the Astral to other realms.', 'Maps and instruments', '']
};
var log = [], files = {}, removed = [];
var levelTable = fs.readFileSync(A + '/Professions/Cooking.md', 'utf8').match(/## Level Progression[\s\S]*?(?=\r?\n## )/)[0].trim();
// gather old notes
var olds = {};
Object.keys(MAP).forEach(function (o) {
  var p = A + '/Professions/' + o + '.md'; if (!fs.existsSync(p)) { log.push('missing old ' + o); return; }
  var t = fs.readFileSync(p, 'utf8');
  var summary = (t.split(/\r?\n/)[2] || '').trim();
  var sig = (t.match(/## Signature (?:Creations|Harvests)\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n## )/) || [])[1] || '';
  olds[o] = { t: t, summary: summary, sig: sig.split(/\r?\n/).filter(function (l) { return /^- /.test(l); }) };
});
// blueprint counts
var counts = {}, spec = {};
var BD = A + '/Blueprints';
var bpFiles = fs.readdirSync(BD).filter(function (f) { return /\.md$/.test(f); });
bpFiles.forEach(function (f) {
  var t = fs.readFileSync(BD + '/' + f, 'utf8'), m = t.match(/^profession:\s*"([^"]*)"/m); if (!m) return;
  var n = MAP[m[1]]; if (!n) { log.push('unmapped profession ' + m[1] + ' in ' + f); return; }
  counts[n] = (counts[n] || 0) + 1; spec[m[1]] = (spec[m[1]] || 0) + 1;
});
// new profession notes
Object.keys(NEW).forEach(function (n) {
  var specs = Object.keys(MAP).filter(function (o) { return MAP[o] === n; });
  var L = ['# ' + n, '', NEW[n][0], '', '**Works with:** ' + NEW[n][1] + '. See Material Types in [[FAND/Atrious/Material Grading|Material Grading]].', '',
    '**Blueprints:** [[FAND/Atrious/Blueprints/' + n + '.base|' + n + ' Blueprints]] (' + (counts[n] || 0) + '). Each Blueprint\'s `specialty` field shows which branch of the craft it comes from.', ''];
  if (NEW[n][2]) L.push(NEW[n][2], '');
  L.push('## Specialties', 'Branches of the craft. A character with this profession can make items from any specialty; the DM may require a teacher before someone tries an unfamiliar one.', '');
  specs.forEach(function (o) {
    var x = olds[o] || { summary: '', sig: [] };
    L.push('### ' + o + ' (' + (spec[o] || 0) + ' Blueprints)', x.summary);
    if (x.sig.length) { L.push('', '*Signature creations:*'); x.sig.forEach(function (s) { L.push(s); }); }
    L.push('');
  });
  L.push(levelTable, '', 'See [[FAND/Atrious/Profession Progression|Profession Progression]] for how to gain levels.', '',
    '## Related', '- [[FAND/Atrious/Master Professions|Master Professions]]', '- [[FAND/Atrious/Crafting Rules|Crafting Rules]]', '- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]', '');
  files[A + '/Professions/' + FILE(n) + '.md'] = L.join('\n');
});
// old notes to remove (not kept by file name)
Object.keys(MAP).forEach(function (o) { if (!files[A + '/Professions/' + o + '.md']) removed.push(A + '/Professions/' + o + '.md'); });
// bases
var oldBases = Object.keys(MAP).map(function (o) { return BD + '/' + o + '.base'; }).filter(function (p) { return fs.existsSync(p); });
Object.keys(NEW).forEach(function (n) {
  files[BD + '/' + n + '.base'] = ['filters:', '  and:', '    - profession == "' + n + '"', 'views:', '  - type: table', '    name: ' + n + ' Blueprints', '    order:',
    '      - file.name', '      - specialty', '      - category', '      - level', '      - rarity', '      - damage', '      - ac', '      - armorType', '      - slot', '      - materials', '      - property', '      - potency',
    '    sort:', '      - property: level', '        direction: ASC'].concat(Object.keys(MAP).filter(function (o) { return MAP[o] === n && o !== n; }).length ? [] : []).join('\n') + '\n';
});
// link rewriting helper
function relink(t) {
  t = t.replace(/\[\[FAND\/Atrious\/Professions\/([^\]|\\]+)(\\?\|)?([^\]]*)\]\]/g, function (m, o, pipe, lab) {
    var n = MAP[o]; if (!n) return m;
    var label = (!pipe || lab === o) ? (o === n ? n : n) : lab;
    return '[[FAND/Atrious/Professions/' + FILE(n) + (pipe || '|') + label + ']]';
  });
  t = t.replace(/\[\[FAND\/Atrious\/Blueprints\/([^\]|\\]+)\.base(\\?\|)?([^\]]*)\]\]/g, function (m, o, pipe, lab) {
    var n = MAP[o]; if (!n) return m;
    var label = (!pipe || lab === o) ? n : lab;
    return '[[FAND/Atrious/Blueprints/' + n + '.base' + (pipe || '|') + label + ']]';
  });
  return t;
}
// blueprint notes
var bpChanged = 0, bpBackup = {};
bpFiles.forEach(function (f) {
  var p = BD + '/' + f, t = fs.readFileSync(p, 'utf8'), m = t.match(/^profession:\s*"([^"]*)"/m); if (!m) return;
  var o = m[1], n = MAP[o]; if (!n) return;
  var nl = /\r\n/.test(t) ? '\r\n' : '\n';
  var nt = t.replace(/^profession:\s*"[^"]*"/m, 'profession: "' + n + '"' + nl + 'specialty: "' + o + '"');
  nt = nt.replace(new RegExp('\\[\\[FAND/Atrious/Professions/' + o.replace(/ /g, ' ') + '\\|' + o + '\\]\\]'), '[[FAND/Atrious/Professions/' + FILE(n) + '|' + n + ']]' + (o !== n ? ' (' + o + ')' : ''));
  nt = relink(nt);
  if (/^specialty:/m.test(t)) return;
  if (nt !== t) { bpChanged++; if (MODE === 'go') { bpBackup[f] = t; fs.writeFileSync(p, nt); } }
});
// other notes: relink everywhere except blueprint notes and old profession notes being replaced
var other = 0;
function walk(d) {
  fs.readdirSync(d).forEach(function (f) {
    if (f[0] === '.') return;
    var p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) { if (p === BD || /\/(Materials|Spells|Patch Notes)$/.test(p)) return; return walk(p); }
    if (!/\.md$/.test(f) || files[p] || removed.indexOf(p) >= 0) return;
    var t = fs.readFileSync(p, 'utf8'), nt = relink(t);
    if (nt !== t) { other++; if (MODE === 'go') { fs.writeFileSync(SC + '/restr_bak_' + f, t); fs.writeFileSync(p, nt); } }
  });
}
walk(V);
log.push('new profession notes ' + Object.keys(NEW).length + ', old notes removed ' + removed.length + ', old bases ' + oldBases.length + ', blueprints changed ' + bpChanged + ', other notes relinked ' + other);
log.push('counts ' + JSON.stringify(counts));
console.log(log.join('\n'));
if (MODE === 'go') {
  var bk = SC + '/restr_backup'; if (!fs.existsSync(bk)) fs.mkdirSync(bk);
  removed.concat(oldBases).concat(Object.keys(files).filter(function (p) { return fs.existsSync(p); })).forEach(function (p) { if (fs.existsSync(p)) fs.writeFileSync(bk + '/' + p.split('/').pop(), fs.readFileSync(p)); });
  fs.writeFileSync(bk + '/blueprints.json', JSON.stringify(bpBackup));
  removed.concat(oldBases).forEach(function (p) { if (fs.existsSync(p) && !files[p]) fs.unlinkSync(p); });
  Object.keys(files).forEach(function (p) { fs.writeFileSync(p, files[p]); });
  console.log('written');
}
