var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Spells';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var QUOTA = { 'Healing': 1, 'Divination': 1, 'Abjuration': .7, 'Chronomancy': .7, 'Enchantment': .7, 'Illusion': .7, 'Transmutation': .7, 'Celestial': .5, 'Nature Magic': .5, 'Shadow Magic': .5,
  'Conjuration': .4, 'Psionics': .4, 'Blood Magic': .3, 'Runic Magic': .3, 'Wild Magic': .3, 'Necromancy': .2, 'Void Magic': .15, 'Elemental': .15, 'Infernal': .15, 'Evocation': .1 };
var VIOLENT = /Strike|Blast|Bolt|Lance|Spear|Burn|Scorch|Flame|Fire|Smite|Rend|Crush|Shatter|Wound|Death|Kill|Slay|Lash|Fang|Claw|Blade|Arrow|Spike|Bomb|Ruin|Doom|Bite|Fury|Wrath|Rage|Pierce|Cut|Agony|Torment|Chasm|Storm|Thunder|Lightning|Acid|Poison|Venom|Plague|Rot|Decay|Explo|Barrage|Assault|Annihil|Obliter|Destr|Execut|Maul|Ravag|Sear|Scald|Blight|Sting|Bane|Curse|Hex|Shock|Crash|Volley|Hammer|Punch|Kick|Slash|Stab/i;
function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
var Bf = function (L) { return Math.max(1, Math.ceil(L / 3)); };
// effect builders: return [text, damageField]
var FX = {
  heal: function (L, area) { return area ? ['Up to six creatures of the caster\'s choice in the area regain ' + Math.max(1, L) + 'd4 + the caster\'s spellcasting modifier hit points.', Math.max(1, L) + 'd4 Healing'] : ['A willing creature within range regains ' + Math.max(1, L) + 'd8 + the caster\'s spellcasting modifier hit points.', Math.max(1, L) + 'd8 Healing']; },
  cure: function (L) { return ['A willing creature within range is cured of one disease or one condition (blinded, deafened, paralyzed, or poisoned) and regains ' + Math.max(1, L) + 'd6 hit points.', Math.max(1, L) + 'd6 Healing']; },
  ward: function (L) { return ['A willing creature within range gains ' + (L * 5) + ' temporary hit points and resistance to one damage type of the caster\'s choice for 1 hour.', 'None']; },
  haste: function (L) { return ['A willing creature\'s speed doubles, and on each of its turns it can take one extra action (Dash, Disengage, or Use an Object only) for ' + (L >= 5 ? '10 minutes' : '1 minute') + '. Requires concentration.', 'None']; },
  rally: function (L) { return ['Up to ' + (L + 1) + ' allies within range gain advantage on Wisdom saving throws, immunity to being frightened, and a +' + Bf(L) + ' bonus to attack rolls for 1 minute. Requires concentration.', 'None']; },
  invis: function (L) { return ['The caster and up to ' + L + ' willing creatures within range become invisible for 1 minute, or until one of them attacks or casts a spell. Requires concentration.', 'None']; },
  locate: function (L) { return ['The caster learns the direction and distance to one creature or object they name within ' + L + ' miles, and whether it is in danger.', 'None']; },
  teleport: function (L) { return ['The caster and up to ' + L + ' willing creatures within range teleport to an unoccupied spot the caster can see within ' + (L * 30) + ' feet.', 'None']; },
  adapt: function (L) { return ['A willing creature gains a climbing and swimming speed equal to its walking speed, can breathe water, and ignores difficult terrain for ' + (L >= 4 ? '8 hours' : '1 hour') + '.', 'None']; },
  link: function (L) { return ['The caster opens a telepathic link among up to ' + (L + 1) + ' willing creatures for 1 hour. They can share thoughts and images over any distance on the same plane.', 'None']; },
  veil: function (L) { return ['A willing creature has advantage on Stealth checks, can see through magical darkness, and is heavily obscured to anyone more than 30 feet away for 1 hour.', 'None']; },
  bloom: function (L) { return ['Plants within a 30-foot radius bloom and bear fruit. Up to ' + (L * 2) + ' creatures who eat a fruit within the next hour regain ' + Math.max(1, L) + 'd4 hit points and are cured of one poison.', Math.max(1, L) + 'd4 Healing']; },
  bloodgift: function (L) { return ['The caster spends ' + Math.max(1, L) + 'd4 of their own hit points to restore twice that many hit points to a willing creature they touch.', 'Healing (2 × ' + Math.max(1, L) + 'd4)']; },
  lastbreath: function (L) { return ['A dying creature within range is stabilized and regains ' + Math.max(1, L) + 'd6 hit points. Undead the caster controls within range regain the same amount.', Math.max(1, L) + 'd6 Healing']; },
  runeguard: function (L) { return ['The caster inscribes a rune on a willing creature. Once in the next hour, when that creature would take damage, the damage is reduced by ' + (L * 5) + '.', 'None']; },
  wildgift: function (L) { return ['The caster rolls a d6 for a willing creature within range: on 1–2 it regains ' + Math.max(1, L) + 'd8 hit points; on 3–4 it gains ' + (L * 5) + ' temporary hit points; on 5–6 it has advantage on all d20 rolls for 1 minute.', Math.max(1, L) + 'd8 Healing (random)']; },
  weightless: function (L) { return ['A willing creature becomes weightless for ' + Math.max(1, L) + ' rounds: it can float, fly at its walking speed, and pass through nonmagical objects.', 'None']; },
  elementward: function (L) { return ['A willing creature gains resistance to fire, cold, lightning, and thunder damage for 1 hour' + (L >= 5 ? ', and immunity to one of them of the caster\'s choice' : '') + '.', 'None']; },
  shieldwall: function (L) { return ['A shimmering barrier surrounds up to ' + Math.max(1, L) + ' creatures of the caster\'s choice, granting each ' + (L * 4) + ' temporary hit points.', 'None']; },
  hellvigor: function (L) { return ['A willing creature gains ' + (L * 5) + ' temporary hit points and advantage on Strength checks for 1 minute. When the spell ends, it takes 1d6 fire damage.', 'None']; }
};
var BYSCHOOL = { 'Healing': ['heal', 'cure'], 'Celestial': ['heal', 'cure'], 'Nature Magic': ['bloom', 'heal'], 'Abjuration': ['ward', 'shieldwall'], 'Chronomancy': ['haste'], 'Enchantment': ['rally'], 'Illusion': ['invis', 'veil'],
  'Divination': ['locate'], 'Conjuration': ['teleport'], 'Transmutation': ['adapt'], 'Psionics': ['link', 'rally'], 'Shadow Magic': ['veil', 'invis'], 'Blood Magic': ['bloodgift'], 'Necromancy': ['lastbreath'],
  'Runic Magic': ['runeguard'], 'Wild Magic': ['wildgift'], 'Void Magic': ['weightless'], 'Elemental': ['elementward'], 'Evocation': ['shieldwall'], 'Infernal': ['hellvigor'] };
var KINDNAME = { heal: 'healing', cure: 'healing', bloom: 'healing', bloodgift: 'healing', lastbreath: 'healing', wildgift: 'healing' };
var cand = {};
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var t = fs.readFileSync(D + '/' + f, 'utf8'), g = function (k) { return ((t.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '').trim(); };
  var tier = g('tier'); if (tier !== 'Tertiary' && tier !== 'Secondary') return;
  var dmg = g('damage'); if (!dmg || /none|heal/i.test(dmg)) return;
  var n = f.slice(0, -3);
  var sc = g('school'); if (!QUOTA[sc]) return;
  (cand[sc] = cand[sc] || []).push({ f: f, n: n, t: t, L: +g('level') || 1, dmg: dmg, rng: g('range') });
});
var POOL = { heal: ['Mending', 'Restoration', 'Renewal', 'Balm', 'Recovery'], cure: ['Purification', 'Cleansing', 'Absolution'], ward: ['Ward', 'Aegis', 'Bulwark', 'Shelter'], shieldwall: ['Barrier', 'Bastion', 'Circle'],
  haste: ['Quickening', 'Hastening', 'Swiftness'], rally: ['Resolve', 'Rally', 'Courage'], invis: ['Vanishing', 'Unseeing'], veil: ['Shroud', 'Veil', 'Cloak'], locate: ['Finding', 'Seeking', 'Compass'],
  teleport: ['Step', 'Passage', 'Crossing'], adapt: ['Adaptation', 'Reshaping', 'Second Skin'], link: ['Mindlink', 'Communion', 'Chorus'], bloom: ['Bloom', 'Harvest', 'Orchard'], bloodgift: ['Blood Gift', 'Lifeshare', 'Transfusion'],
  lastbreath: ['Reprieve', 'Last Breath', 'Respite'], runeguard: ['Ward-Rune', 'Guardian Sigil', 'Rune of Shelter'], wildgift: ['Fickle Blessing', 'Lucky Gift', 'Wild Boon'], weightless: ['Drift', 'Weightlessness', 'Float'],
  elementward: ['Elemental Ward', 'Weathering', 'Element Shield'], hellvigor: ['Vigor', 'Brimstone Vigor', 'Ember Heart'] };
var PREFIX = { 'Healing': ['Gentle', 'Mother\'s', 'Bright', 'Warm', 'Steady'], 'Celestial': ['Dawn', 'Halo', 'Seraph\'s', 'Radiant', 'Heaven\'s'], 'Nature Magic': ['Verdant', 'Grove', 'Spring', 'Mossy', 'Wild'], 'Abjuration': ['Iron', 'Steadfast', 'Warden\'s', 'Stone', 'Silver'],
  'Chronomancy': ['Hourglass', 'Moment\'s', 'Swift', 'Clockwork', 'Borrowed'], 'Enchantment': ['Heartening', 'Bold', 'Captain\'s', 'Kindred', 'Rousing'], 'Illusion': ['Mirror', 'Phantom', 'Glass', 'Hidden', 'Misty'],
  'Divination': ['Seer\'s', 'Oracle\'s', 'Lantern', 'Far', 'True'], 'Conjuration': ['Blink', 'Portal', 'Door', 'Summoner\'s', 'Folded'], 'Transmutation': ['Tide', 'Climber\'s', 'Beast', 'Wanderer\'s', 'Shifting'],
  'Psionics': ['Quiet', 'Thought', 'Mind', 'Inner', 'Kindred'], 'Shadow Magic': ['Dusk', 'Night', 'Umbral', 'Shade', 'Gloam'], 'Blood Magic': ['Crimson', 'Heart\'s', 'Kin', 'Vein', 'Red'], 'Necromancy': ['Grave', 'Pale', 'Final', 'Bone', 'Ashen'],
  'Runic Magic': ['Carved', 'Etched', 'Old', 'Iron', 'Stone'], 'Wild Magic': ['Chance', 'Gambler\'s', 'Lucky', 'Twisting', 'Coin'], 'Void Magic': ['Void', 'Hollow', 'Empty', 'Starless', 'Null'], 'Elemental': ['Four Winds', 'Storm-Proof', 'Hearth', 'Salt', 'Ember'],
  'Evocation': ['Shining', 'Bright', 'Arc', 'Prism', 'Lantern'], 'Infernal': ['Infernal', 'Pit', 'Sulfur', 'Cinder', 'Hellborn'] };
var vaultNames = {};
(function walk(d) { fs.readdirSync(d).forEach(function (f) { var p = d + '/' + f; if (fs.statSync(p).isDirectory()) walk(p); else if (/\.md$/.test(f)) vaultNames[f.slice(0, -3).toLowerCase()] = 1; }); })('C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND');
function newName(sc, k, seed) {
  var pre = PREFIX[sc], pool = POOL[k];
  for (var a = 0; a < pre.length * pool.length; a++) {
    var nm = pre[(seed + a) % pre.length] + ' ' + pool[Math.floor((seed + a) / pre.length) % pool.length];
    if (!vaultNames[nm.toLowerCase()]) { vaultNames[nm.toLowerCase()] = 1; return nm; }
  }
  for (var b = 2; b < 50; b++) { var nm2 = pre[seed % pre.length] + ' ' + pool[0] + ' ' + ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][(b - 2) % 9]; if (!vaultNames[nm2.toLowerCase()]) { vaultNames[nm2.toLowerCase()] = 1; return nm2; } }
  return null;
}
var renames = [];
var BK = SC + '/spells_support_backup'; if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var stats = {}, total = 0, kinds = {}, sample = [];
Object.keys(cand).forEach(function (sc) {
  var list = cand[sc].sort(function (a, b) { return hash(a.n) - hash(b.n); });
  var take = Math.round(list.length * QUOTA[sc]);
  list.slice(0, take).forEach(function (s, i) {
    var opts = BYSCHOOL[sc], k = opts[i % opts.length];
    var area = /radius|cone|cube|line|sphere/i.test(s.rng) || /area|every|all creatures/i.test(s.t.split(/^# /m)[1] || '');
    var fx = FX[k](s.L, area);
    var lines = s.t.split(/\r?\n/), hi = -1;
    for (var j = 0; j < lines.length; j++) if (/^\*.*-tier .*\*$|^\*.*\*$/.test(lines[j]) && j > 0 && /^# /.test(lines[j - 2] || '')) { hi = j; break; }
    var pi = -1; for (var j2 = hi + 1; j2 < lines.length; j2++) if (lines[j2].trim()) { pi = j2; break; }
    if (pi < 0) return;
    var sents = lines[pi].match(/[^.!?]+[.!?]+(\s|$)/g) || [lines[pi]];
    var di = -1; sents.forEach(function (x, idx) { if (di < 0 && /damage/i.test(x)) di = idx; });
    if (di < 0) return;
    sents[di] = fx[0] + ' ';
    var kept = sents.filter(function (x, idx) { return idx === di || !/damage|saving throw/i.test(x); });
    lines[pi] = kept.join('').trim();
    var nt = lines.join('\n').replace(/^damage:\s*"[^"]*"/m, 'damage: "' + fx[1] + '"');
    nt = nt.replace(/^tags: \[([^\]]*)\]/m, function (m, x) { var tg = x.split(/\s*,\s*/).filter(Boolean); var add = KINDNAME[k] || 'support'; if (tg.indexOf(add) < 0) tg.push(add); return 'tags: [' + tg.join(', ') + ']'; });
    var nn = newName(sc, k, hash(s.n)); if (!nn) return;
    nt = nt.replace(/^# .*$/m, '# ' + nn);
    renames.push(s.n + ' -> ' + nn);
    if (MODE === 'go') { fs.writeFileSync(BK + '/' + s.f, s.t); fs.unlinkSync(D + '/' + s.f); fs.writeFileSync(D + '/' + nn + '.md', nt); }
    s.n = nn;
    stats[sc] = (stats[sc] || 0) + 1; total++; kinds[k] = (kinds[k] || 0) + 1;
    if (sample.length < 3 && i === 0) sample.push(s.n + ': ' + lines[pi]);
  });
});
console.log(MODE, 'converted', total); console.log(JSON.stringify(stats)); console.log(JSON.stringify(kinds)); console.log(sample.join('\n'));
console.log(renames.slice(0,12).join('\n'));
