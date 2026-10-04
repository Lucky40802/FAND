// Original stat blocks in the Monster Manual layout, generated from a monster's challenge, body plan,
// and drops. Nothing here is copied from a book: numbers follow the usual by-CR math, and AC follows
// FAND's flat system (AC is subtracted from each hit's damage, so values stay small).
// statblock(monster, body, traitsByDrop) -> compact object for the app.

var XP = { '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000 };
var GRADE_CR = ['1/2', '2', '4', '6', '8', '11', '14', '17', '21', '25'];
function crNum(c) { if (String(c).indexOf('/') > 0) { var p = String(c).split('/'); return +p[0] / +p[1]; } return +c; }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mod(x) { return Math.floor((x - 10) / 2); }
function sgn(n) { return (n >= 0 ? '+' : '') + n; }

// STR DEX CON INT WIS CHA, and which scores grow with CR
var PLAN = {
  beast:      { ab: [14, 12, 13, 3, 12, 6],  grow: [0, 2], type: 'beast', align: 'unaligned', speed: '40 ft.', senses: [], lang: '—', skills: ['Perception', 'Stealth'], atk: [['Bite', 'piercing', 8], ['Claw', 'slashing', 6]] },
  bird:       { ab: [10, 16, 12, 3, 14, 6],  grow: [1, 4], type: 'beast', align: 'unaligned', speed: '10 ft., fly 60 ft.', senses: [], lang: '—', skills: ['Perception'], traits: [['Keen Sight', 'The creature has advantage on Wisdom (Perception) checks that rely on sight.']], atk: [['Talons', 'slashing', 6], ['Beak', 'piercing', 6]] },
  reptile:    { ab: [15, 12, 15, 4, 11, 5],  grow: [0, 2], type: 'monstrosity', align: 'unaligned', speed: '30 ft., swim 30 ft.', senses: ['darkvision 60 ft.'], lang: '—', skills: ['Stealth'], atk: [['Bite', 'piercing', 10], ['Tail', 'bludgeoning', 8]] },
  dragon:     { ab: [17, 10, 15, 12, 11, 15], grow: [0, 2, 5], type: 'dragon', align: 'chaotic evil', speed: '40 ft., climb 40 ft., fly 80 ft.', senses: ['blindsight 60 ft.', 'darkvision 120 ft.'], lang: 'Common, Draconic', skills: ['Perception', 'Stealth'], saves: [1, 2, 4, 5], atk: [['Bite', 'piercing', 10], ['Claw', 'slashing', 6]], breath: true },
  insect:     { ab: [14, 16, 12, 2, 11, 4],  grow: [1, 2], type: 'monstrosity', align: 'unaligned', speed: '30 ft., climb 30 ft.', senses: ['darkvision 60 ft.'], lang: '—', skills: ['Stealth'], traits: [['Spider Climb', 'The creature can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.']], atk: [['Bite', 'piercing', 8], ['Sting', 'piercing', 6]], poison: true },
  aquatic:    { ab: [16, 13, 15, 4, 12, 5],  grow: [0, 2], type: 'beast', align: 'unaligned', speed: '0 ft., swim 50 ft.', senses: ['blindsight 30 ft.'], lang: '—', skills: ['Perception'], traits: [['Water Breathing', 'The creature can breathe only underwater.']], atk: [['Bite', 'piercing', 10], ['Tail', 'bludgeoning', 8]] },
  aberration: { ab: [16, 12, 16, 18, 15, 16], grow: [3, 4, 2], type: 'aberration', align: 'lawful evil', speed: '20 ft., swim 40 ft.', senses: ['darkvision 120 ft.'], lang: 'Deep Speech, telepathy 120 ft.', skills: ['Perception', 'Insight'], saves: [2, 3, 4], atk: [['Tentacle', 'bludgeoning', 8]], mind: true },
  undead:     { ab: [13, 12, 15, 6, 10, 8],  grow: [0, 2], type: 'undead', align: 'neutral evil', speed: '30 ft.', senses: ['darkvision 60 ft.'], lang: 'understands the languages it knew in life but can\'t speak', skills: [], atk: [['Slam', 'bludgeoning', 8], ['Life Drain', 'necrotic', 6]], imm: ['poison'], res: ['necrotic'], cond: ['exhaustion', 'poisoned'], traits: [['Undead Nature', 'The creature doesn\'t require air, food, drink, or sleep.']] },
  construct:  { ab: [20, 8, 18, 3, 11, 1],   grow: [0, 2], type: 'construct', align: 'unaligned', speed: '30 ft.', senses: ['darkvision 60 ft.'], lang: 'understands the languages of its creator but can\'t speak', skills: [], atk: [['Slam', 'bludgeoning', 10]], imm: ['poison', 'psychic'], cond: ['charmed', 'exhaustion', 'frightened', 'paralyzed', 'petrified', 'poisoned'], traits: [['Immutable Form', 'The creature is immune to any spell or effect that would alter its form.'], ['Constructed Nature', 'The creature doesn\'t require air, food, drink, or sleep.']], acBonus: 3 },
  ooze:       { ab: [16, 5, 16, 1, 6, 1],    grow: [0, 2], type: 'ooze', align: 'unaligned', speed: '20 ft., climb 20 ft.', senses: ['blindsight 60 ft. (blind beyond this radius)'], lang: '—', skills: [], atk: [['Pseudopod', 'acid', 6]], imm: ['acid'], cond: ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'prone'], traits: [['Amorphous', 'The creature can move through a space as narrow as 1 inch wide without squeezing.']], acBonus: -2 },
  elemental:  { ab: [16, 14, 16, 6, 10, 8],  grow: [0, 1, 2], type: 'elemental', align: 'neutral', speed: '30 ft.', senses: ['darkvision 60 ft.'], lang: 'Primordial', skills: [], atk: [['Slam', 'bludgeoning', 8]], imm: ['poison'], cond: ['exhaustion', 'paralyzed', 'petrified', 'poisoned', 'unconscious'], res: ['bludgeoning, piercing, and slashing from nonmagical attacks'] },
  fiend:      { ab: [18, 14, 16, 12, 13, 15], grow: [0, 2, 5], type: 'fiend', align: 'chaotic evil', speed: '30 ft., fly 40 ft.', senses: ['darkvision 120 ft.'], lang: 'Abyssal, Infernal, telepathy 120 ft.', skills: ['Deception', 'Intimidation'], saves: [0, 2, 4], atk: [['Claw', 'slashing', 8], ['Bite', 'piercing', 10]], res: ['cold', 'fire', 'lightning'], imm: ['poison'], cond: ['poisoned'], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.']] },
  celestial:  { ab: [18, 16, 18, 16, 20, 20], grow: [4, 5], type: 'celestial', align: 'lawful good', speed: '30 ft., fly 90 ft.', senses: ['truesight 60 ft.'], lang: 'all, telepathy 120 ft.', skills: ['Insight', 'Perception'], saves: [4, 5], atk: [['Radiant Strike', 'radiant', 8]], res: ['radiant'], cond: ['charmed', 'exhaustion', 'frightened'], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.']] },
  plant:      { ab: [18, 8, 17, 8, 14, 9],   grow: [0, 2], type: 'plant', align: 'neutral', speed: '20 ft.', senses: ['blindsight 30 ft.'], lang: 'Sylvan', skills: [], atk: [['Slam', 'bludgeoning', 8], ['Vine Lash', 'bludgeoning', 6]], vuln: ['fire'], res: ['bludgeoning', 'piercing'], traits: [['False Appearance', 'While the creature remains motionless, it is indistinguishable from an ordinary plant.']] },
  giant:      { ab: [21, 9, 19, 9, 10, 9],   grow: [0, 2], type: 'giant', align: 'chaotic neutral', speed: '40 ft.', senses: [], lang: 'Giant', skills: ['Athletics', 'Perception'], saves: [0, 2], atk: [['Greatclub', 'bludgeoning', 8], ['Rock', 'bludgeoning', 10, 'ranged']] },
  fey:        { ab: [8, 18, 12, 14, 13, 18],  grow: [1, 5], type: 'fey', align: 'chaotic neutral', speed: '30 ft., fly 30 ft.', senses: ['darkvision 60 ft.'], lang: 'Common, Sylvan', skills: ['Deception', 'Stealth'], atk: [['Thorned Blade', 'piercing', 6]], traits: [['Fey Ancestry', 'The creature has advantage on saving throws against being charmed, and magic can\'t put it to sleep.']], mind: true },
  humanoid:   { ab: [14, 12, 13, 10, 11, 10], grow: [0, 1], type: 'humanoid', align: 'any alignment', speed: '30 ft.', senses: [], lang: 'Common', skills: ['Athletics', 'Perception'], atk: [['Longsword', 'slashing', 8], ['Shortbow', 'piercing', 6, 'ranged']] }
};
var ABN = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
var SKILL_AB = { Perception: 4, Stealth: 1, Insight: 4, Athletics: 0, Deception: 5, Intimidation: 5 };
var ELEMENT = [[/red|gold|brass|fire|flame|magma|hell|salamander|efreet|phoenix|ember|cinder/i, 'fire'], [/white|silver|frost|ice|cold|winter|yeti|remorhaz/i, 'cold'], [/blue|bronze|storm|lightning|thunder|behir|air|djinni/i, 'lightning'], [/black|copper|acid|ooze|pudding/i, 'acid'], [/green|poison|venom|toxic/i, 'poison'], [/shadow|necro|undead|death|ghost|wraith|vampire|lich/i, 'necrotic'], [/radiant|celestial|angel|solar|sun|holy/i, 'radiant'], [/psion|mind|brain|aboleth|beholder/i, 'psychic']];
function element(name) { for (var i = 0; i < ELEMENT.length; i++) if (ELEMENT[i][0].test(name)) return ELEMENT[i][1]; return null; }

function size(m, plan, cr) {
  var n = m.n;
  if (/ancient|elder brain|kraken|tarrasque|leviathan|colossus|purple worm|dragon turtle|roc\b|titan/i.test(n)) return ['Gargantuan', 20];
  if (/\badult\b|giant\b(?! (rat|frog|badger|centipede|fire beetle|wasp|spider|bat|weasel|crab|lizard|poisonous snake|owl|eagle|goat|boar|elk|hyena|toad|vulture|octopus|sea horse|scorpion|constrictor))|behemoth|mammoth|treant|hydra|behir|beholder|golem/i.test(n) && cr >= 8) return ['Huge', 12];
  if (/young|wyvern|owlbear|ogre|troll|horse|bear|griffon|hippogriff|manticore|elephant|minotaur|basilisk|chimera|ettin|giant (spider|scorpion|crab|octopus|elk|boar|toad|lizard|eagle|constrictor)/i.test(n)) return ['Large', 10];
  if (cr < 2 && /wyrmling|pseudodragon|rat|bat|cat\b|frog|toad|crab|weasel|raven|owl\b|hawk|sprite|pixie|imp\b|quasit|homunculus|stirge|spider\b|lizard\b|centipede|scorpion\b|snake\b|mephit/i.test(n) && !/giant|swarm/i.test(n)) return cr < 1 ? ['Tiny', 4] : ['Small', 6];
  if (cr < 4 && /kobold|goblin|gnome|halfling|grung|kenku|quickling|redcap|darkling|myconid|dretch|mane|faerie/i.test(n)) return ['Small', 6];
  if (plan === 'giant') return ['Huge', 12];
  if (cr >= 20) return ['Gargantuan', 20];
  if (cr >= 13) return ['Huge', 12];
  if (cr >= 6) return ['Large', 10];
  return ['Medium', 8];
}

// item-trait text ("While equipped, you ...") rewritten for the creature itself
var VERBS = /\b(it|It|The creature|the creature|and|but) (don't|have|drop|see|regain|take|gain|ignore|resist|are|aren't|know|spot|walk|move|fall|touch|count|slip|teleport|breathe|hang|burrow|climb|speak|read|need|finish|make|deal|can't be|deals)\b/g;
var FIX = { "don't": "doesn't", have: 'has', are: 'is', "aren't": "isn't", touch: 'touches', "can't be": "can't be", deals: 'deals' };
function voice(t) {
  t = t.replace(/^While equipped, you /, 'The creature ').replace(/^While equipped, /, '').replace(/^Once per (short|long) rest, you /, 'Once per $1 rest, the creature ')
    .replace(/^A weapon (coated )?with this material/, 'Its attacks').replace(/^Armor with this material/, 'Its body').replace(/^Items with this material/, 'Its body')
    .replace(/^Potions and salves made with this material/, 'Potions made from its parts').replace(/^Potions and food made with it/, 'Potions made from it')
    .replace(/(hit|struck) by a weapon (coated )?with this material/g, '$1 by its attacks').replace(/\bYou\b/g, 'It').replace(/\byou\b/g, 'it').replace(/\byour\b/g, 'its').replace(/\byourself\b/g, 'itself');
  return t.replace(VERBS, function (a, who, v) { return who + ' ' + (FIX[v] || (v + (/(s|sh|ch)$/.test(v) ? 'es' : 's'))); }).replace(/^it /, 'It ');
}
function statblock(m, body, bestDrop) {
  var cr = m.cr || GRADE_CR[Math.max(0, Math.min(9, (m.g || 1) - 1))], c = crNum(cr);
  var plan = PLAN[body] || PLAN.beast, h = hash(m.n);
  var prof = c < 1 ? 2 : 2 + Math.floor((c - 1) / 4);
  var sz = size(m, body, c);
  var ab = plan.ab.map(function (v, i) {
    var up = plan.grow.indexOf(i) >= 0 ? Math.floor(c / 3) : Math.floor(c / 6);
    var jitter = (h >> (i * 3) & 3) - 1;
    var sizeAdj = i === 0 || i === 2 ? ({ Tiny: -6, Small: -3, Medium: 0, Large: 3, Huge: 5, Gargantuan: 7 })[sz[0]] : 0;
    return Math.max(1, Math.min(30, v + up + jitter + sizeAdj));
  });
  var mods = ab.map(mod);
  var hp = c < 1 ? ({ 0: 4, 0.125: 9, 0.25: 13, 0.5: 22 })[c] || 4 : Math.round(15 * c + 10);
  var die = sz[1], per = die / 2 + 0.5 + mods[2];
  var hd = Math.max(1, Math.round(hp / Math.max(1, per)));
  hp = Math.max(1, Math.floor(hd * (die / 2 + 0.5)) + hd * mods[2]);
  var ac = Math.max(0, Math.floor(c / 2) + (plan.acBonus || 0) + (/scale|shell|carapace|plate|armor|armou?red/i.test(m.txt || '') ? 2 : 0));
  // attacks
  var pri = Math.max(mods[0], mods[1]), hit = prof + pri;
  var dpr = c < 1 ? ({ 0: 1, 0.125: 3, 0.25: 5, 0.5: 8 })[c] || 2 : Math.round(5 * c + 4);
  var n = c < 2 ? 1 : c < 8 ? 2 : 3;
  var elem = element(m.n + ' ' + (m.txt || ''));
  var actions = [], atks = plan.atk;
  if (n > 1) {
    var names = []; for (var k = 0; k < n; k++) names.push(atks[k % atks.length][0]);
    var cnt = {}; names.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    var words = ['', 'one', 'two', 'three'];
    actions.push(['Multiattack', 'The creature makes ' + words[n] + ' attacks: ' + Object.keys(cnt).map(function (x) { return words[cnt[x]] + ' with its ' + x.toLowerCase(); }).join(' and ') + '.']);
  }
  var dc = 8 + prof + Math.max(mods[2], mods[4], mods[5]);
  atks.forEach(function (a, i) {
    if (i > 0 && n === 1 && !a[3]) return;
    var per = Math.max(1, Math.round(dpr / n)), d = a[2], avg = d / 2 + 0.5;
    var dice = Math.max(1, Math.round((per - pri) / avg)), dmg = Math.max(1, Math.floor(dice * avg) + pri);
    var ranged = a[3] === 'ranged', kind = a[1];
    var txt = (ranged ? 'Ranged Weapon Attack: ' : 'Melee Weapon Attack: ') + sgn(hit) + ' to hit, ' + (ranged ? 'range 60/240 ft.' : 'reach ' + (/Large|Huge|Gargantuan/.test(sz[0]) ? 10 : 5) + ' ft.') + ', one target. Hit: ' + dmg + ' (' + dice + 'd' + d + (pri ? ' ' + (pri > 0 ? '+ ' : '− ') + Math.abs(pri) : '') + ') ' + kind + ' damage';
    if (elem && i === 0 && kind !== elem && c >= 2) { var ed = Math.max(1, Math.round(c / 3)); txt += ' plus ' + Math.floor(ed * 3.5) + ' (' + ed + 'd6) ' + elem + ' damage'; }
    if (plan.poison && /Sting|Bite/.test(a[0]) && i > 0) txt += ', and the target must make a DC ' + dc + ' Constitution saving throw or be poisoned for 1 minute';
    actions.push([a[0], txt + '.']);
  });
  if (plan.breath && c >= 1) {
    var bd = Math.max(2, Math.round(c * 1.2)), bt = elem || 'fire';
    actions.push(['Breath Weapon (Recharge 5–6)', 'The creature exhales ' + bt + ' in a ' + (c >= 17 ? 60 : c >= 10 ? 30 : 15) + '-foot cone. Each creature in that area must make a DC ' + dc + ' Dexterity saving throw, taking ' + Math.floor(bd * 3.5) + ' (' + bd + 'd6) ' + bt + ' damage on a failed save, or half as much on a successful one.']);
  }
  if (plan.mind && c >= 3) actions.push(['Mind Blast (Recharge 5–6)', 'Each creature of the creature\'s choice within 30 feet must succeed on a DC ' + dc + ' Intelligence saving throw or take ' + Math.floor(Math.max(2, Math.round(c)) * 3.5) + ' (' + Math.max(2, Math.round(c)) + 'd6) psychic damage and be stunned until the end of its next turn.']);
  // traits
  var traits = (plan.traits || []).slice();
  if (bestDrop && bestDrop.tr) traits.push(['Signature: ' + bestDrop.tr.n, 'From its ' + bestDrop.n.replace(m.n + ' ', '').toLowerCase() + '. ' + voice(bestDrop.tr.t)]);
  var boss = (m.g || 0) >= 10 || c >= 17;
  if (boss) traits.push(['Legendary Resistance (3/Day)', 'If the creature fails a saving throw, it can choose to succeed instead.']);
  var legendary = boss ? [['Detect', 'The creature makes a Wisdom (Perception) check.'], ['Attack', 'The creature makes one ' + atks[0][0].toLowerCase() + ' attack.'], ['Surge (Costs 2 Actions)', 'The creature moves up to half its speed without provoking opportunity attacks, then makes one attack.']] : null;
  // saves and skills
  var saves = (c >= 5 && plan.saves) ? plan.saves.map(function (i) { return ABN[i].charAt(0) + ABN[i].slice(1).toLowerCase() + ' ' + sgn(mods[i] + prof); }).join(', ') : '';
  var skills = plan.skills.map(function (s) { return s + ' ' + sgn(mods[SKILL_AB[s]] + prof); }).join(', ');
  var pp = 10 + mods[4] + (plan.skills.indexOf('Perception') >= 0 ? prof : 0);
  var res = (plan.res || []).slice(), imm = (plan.imm || []).slice();
  if (elem && (body === 'dragon' || body === 'elemental' || body === 'fiend') && imm.indexOf(elem) < 0) { imm.push(elem); var ri = res.indexOf(elem); if (ri >= 0) res.splice(ri, 1); }
  var type = plan.type + (body === 'fiend' && /devil|hell|infernal|pit|erinyes|imp\b/i.test(m.n) ? ' (devil)' : body === 'fiend' && /demon|abyss|balor|vrock|hezrou|quasit|dretch|glabrezu|marilith/i.test(m.n) ? ' (demon)' : '');
  return {
    sz: sz[0], ty: type, al: plan.align, ac: ac, hp: hp, hd: hd + 'd' + die + (mods[2] ? ' ' + (mods[2] > 0 ? '+ ' : '− ') + Math.abs(hd * mods[2]) : ''),
    sp: plan.speed, ab: ab, sv: saves, sk: skills, vu: (plan.vuln || []).join(', '), rs: res.join(', '), im: imm.join(', '), ci: (plan.cond || []).join(', '),
    se: plan.senses.concat(['passive Perception ' + pp]).join(', '), la: plan.lang, cr: cr, xp: XP[cr] || 0, pb: prof,
    tr: traits, ac2: actions, lg: legendary
  };
}
module.exports = { statblock: statblock, GRADE_CR: GRADE_CR };
