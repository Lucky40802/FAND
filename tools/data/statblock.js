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
    .replace(/^While you wear armor or hold a shield with this material, you /, 'The creature ').replace(/^Armor or a shield with this material gives \+(\d+) AC/, 'Its natural armor is tougher than most (+$1 AC, included above)')
    .replace(/^When you hit with a weapon (coated )?with this material, you /, 'When it hits, it ').replace(/^If you move (.*?) and (then )?hit (it|a creature) with a weapon (coated )?with this material/, 'If it moves $1 and $2hits $3 with an attack')
    .replace(/^A weapon (coated )?with this material/, 'Its attacks').replace(/^Armor with this material/, 'Its body').replace(/^Items with this material/, 'Its body')
    .replace(/^Potions and salves made with this material/, 'Potions made from its parts').replace(/^Potions and food made with it/, 'Potions made from it')
    .replace(/(hit|struck) by a weapon (coated )?with this material/g, '$1 by its attacks').replace(/\bYou\b/g, 'It').replace(/\byou\b/g, 'it').replace(/\byour\b/g, 'its').replace(/\byourself\b/g, 'itself');
  return t.replace(VERBS, function (a, who, v) { return who + ' ' + (FIX[v] || (v + (/(s|sh|ch)$/.test(v) ? 'es' : 's'))); }).replace(/^it /, 'It ');
}
// Creature kits: what a kind of creature actually does, laid over its body plan (first name match wins). Attacks are
// [name, damage type, die, 'ranged' or '', what else a hit does ({DC} is the creature's save DC)]; traits and extra actions
// are [name, text]. A kit can also set speed, senses, skills, type, and languages, so a horse kicks instead of clawing,
// a bat flies and hears in the dark, a spider webs, and a kobold fights with a dagger and a sling.
var KNOCK = 'If the target is a creature, it must succeed on a DC {DC} Strength saving throw or be knocked prone';
var GRAB = 'and the target is grappled (escape DC {DC})';
var POISON = 'and the target must make a DC {DC} Constitution saving throw or be poisoned for 1 minute';
var CHARGE = ['Charge', 'If the creature moves at least 20 feet straight toward a target and then hits it with its first attack on the same turn, the target takes an extra die of damage and must succeed on a DC {DC} Strength saving throw or be knocked prone.'];
var PACK = ['Pack Tactics', 'The creature has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the target and the ally isn\'t incapacitated.'];
var NOSE = ['Keen Smell', 'The creature has advantage on Wisdom (Perception) checks that rely on smell.'];
var EARNOSE = ['Keen Hearing and Smell', 'The creature has advantage on Wisdom (Perception) checks that rely on hearing or smell.'];
var EYES = ['Keen Sight', 'The creature has advantage on Wisdom (Perception) checks that rely on sight.'];
var POUNCE = ['Pounce', 'If the creature moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC {DC} Strength saving throw or be knocked prone. If the target is prone, the creature can make one bite attack against it as a bonus action.'];
var TRAMPLE = ['Trampling Charge', 'If the creature moves at least 20 feet straight toward a creature and then hits it with an attack on the same turn, that target must succeed on a DC {DC} Strength saving throw or be knocked prone. If the target is prone, the creature can make one stomp attack against it as a bonus action.'];
var BREATH = ['Hold Breath', 'The creature can hold its breath for 30 minutes.'];
var AMPHI = ['Amphibious', 'The creature can breathe air and water.'];
var FLYBY = ['Flyby', 'The creature doesn\'t provoke opportunity attacks when it flies out of an enemy\'s reach.'];
var ECHO = ['Echolocation', 'The creature can\'t use its blindsight while deafened.'];
var CLIMB = ['Spider Climb', 'The creature can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.'];
var WEBSENSE = ['Web Sense', 'While in contact with a web, the creature knows the exact location of any other creature in contact with the same web.'];
var WEBWALK = ['Web Walker', 'The creature ignores movement restrictions caused by webbing.'];
var WEB = ['Web (Recharge 5–6)', 'Ranged Weapon Attack against one creature within 30 feet. Hit: the target is restrained by webbing. As an action, the restrained target can make a DC {DC} Strength check, bursting the webbing on a success.'];
var FRENZY = ['Blood Frenzy', 'The creature has advantage on melee attack rolls against any creature that doesn\'t have all its hit points.'];
var SUN = ['Sunlight Sensitivity', 'While in sunlight, the creature has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.'];
var SHAPE = ['Shapechanger', 'The creature can use its action to polymorph into a beast form or a humanoid form, or back into its true form. Its statistics are the same in each form, and any equipment it is carrying isn\'t transformed.'];
var FALSE = ['False Appearance', 'While the creature remains motionless, it is indistinguishable from an ordinary object of its kind.'];
var KITS = [
  // were-creatures and shapechangers fight with weapons as well as their beast form
  [/^were(wolf)/i, { atk: [['Bite', 'piercing', 8, '', 'If the target is a humanoid, it must succeed on a DC {DC} Constitution saving throw or be cursed with werewolf lycanthropy'], ['Spear', 'piercing', 6]], traits: [SHAPE, EARNOSE] }],
  [/^were(bear)/i, { atk: [['Bite', 'piercing', 10], ['Claw', 'slashing', 8], ['Greataxe', 'slashing', 12]], traits: [SHAPE, NOSE] }],
  [/^were(boar)/i, { atk: [['Tusks', 'slashing', 6], ['Maul', 'bludgeoning', 6]], traits: [SHAPE, CHARGE, ['Relentless (Recharges after a Short or Long Rest)', 'If the creature takes damage that would reduce it to 0 hit points, it is reduced to 1 hit point instead.']] }],
  [/^were(rat)/i, { atk: [['Bite', 'piercing', 4], ['Shortsword', 'piercing', 6], ['Hand Crossbow', 'piercing', 6, 'ranged']], traits: [SHAPE, NOSE], speed: '30 ft.' }],
  [/^were(tiger)/i, { atk: [['Bite', 'piercing', 10], ['Claw', 'slashing', 8], ['Scimitar', 'slashing', 6]], traits: [SHAPE, POUNCE, EARNOSE] }],
  [/doppelganger/i, { al: 'neutral', atk: [['Slam', 'bludgeoning', 6]], traits: [SHAPE, ['Ambusher', 'In the first round of a combat, the creature has advantage on attack rolls against any creature it surprised.']], acts: [['Read Thoughts', 'The creature magically reads the surface thoughts of one creature within 60 feet of it.']], type: 'monstrosity (shapechanger)', lang: 'Common', speed: '30 ft.' }],
  [/mimic/i, { atk: [['Pseudopod', 'bludgeoning', 8, '', 'and the creature is stuck to it (escape DC {DC})'], ['Bite', 'piercing', 8, '', 'plus acid damage']], traits: [SHAPE, ['Adhesive', 'The creature adheres to anything that touches it. A Huge or smaller creature adhered to it is also grappled (escape DC {DC}).'], FALSE], type: 'monstrosity (shapechanger)', speed: '15 ft.' }],
  [/gargoyle/i, { al: 'chaotic evil', atk: [['Bite', 'piercing', 6], ['Claws', 'slashing', 6]], traits: [FALSE], type: 'elemental', speed: '30 ft., fly 60 ft.', lang: 'Terran' }],
  [/flying sword/i, { atk: [['Longsword', 'slashing', 8]], traits: [['Antimagic Susceptibility', 'The creature is incapacitated while in the area of an antimagic field.'], FALSE], type: 'construct', speed: '0 ft., fly 50 ft. (hover)', senses: ['blindsight 60 ft. (blind beyond this radius)'] }],
  [/rug of smothering/i, { atk: [['Smother', 'bludgeoning', 10, '', GRAB + '; while grappled, the target is blinded and restrained and takes the damage again at the start of each of its turns']], traits: [FALSE], type: 'construct', speed: '10 ft.' }],
  [/piercer/i, { atk: [['Drop', 'piercing', 6, '', 'The creature drops from the ceiling onto a target below; it misses if the target moved']], traits: [FALSE, CLIMB], speed: '5 ft., climb 5 ft.', senses: ['blindsight 30 ft.', 'darkvision 60 ft.'] }],
  [/trapper/i, { atk: [['Smother', 'bludgeoning', 10, '', GRAB + ' and restrained, and it can\'t breathe']], traits: [FALSE, CLIMB], speed: '10 ft., climb 10 ft.' }],
  [/darkmantle/i, { atk: [['Crush', 'bludgeoning', 6, '', 'and the creature attaches to the target: the target is blinded and can\'t breathe while it is attached']], traits: [ECHO, FALSE], acts: [['Darkness Aura (1/Day)', 'A 15-foot radius of magical darkness extends out from the creature, moves with it, and spreads around corners.']], speed: '10 ft., fly 30 ft.', senses: ['blindsight 60 ft.'] }],
  [/grick/i, { atk: [['Tentacles', 'slashing', 6], ['Beak', 'piercing', 6]], traits: [['Stone Camouflage', 'The creature has advantage on Dexterity (Stealth) checks made to hide in rocky terrain.']], speed: '30 ft., climb 30 ft.' }],
  [/hook horror/i, { atk: [['Hook', 'piercing', 10]], traits: [ECHO, ['Keen Hearing', 'The creature has advantage on Wisdom (Perception) checks that rely on hearing.']], speed: '30 ft., climb 30 ft.', senses: ['blindsight 60 ft.', 'darkvision 120 ft.'] }],
  [/umber hulk/i, { atk: [['Claw', 'slashing', 8], ['Mandibles', 'slashing', 8]], traits: [['Confusing Gaze', 'When a creature starts its turn within 30 feet and can see the creature\'s eyes, it must succeed on a DC {DC} Charisma saving throw or be confused until the start of its next turn.'], ['Tunneler', 'The creature can burrow through solid rock at half its burrow speed and leaves a tunnel behind.']], speed: '30 ft., burrow 20 ft.', senses: ['darkvision 120 ft.', 'tremorsense 60 ft.'] }],
  [/purple worm|timeworm/i, { atk: [['Bite', 'piercing', 8, '', 'If the target is a creature of a smaller size, it must succeed on a DC {DC} Dexterity saving throw or be swallowed'], ['Tail Stinger', 'piercing', 6, '', POISON]], traits: [['Tunneler', 'The creature can burrow through solid rock at half its burrow speed and leaves a tunnel behind.']], speed: '50 ft., burrow 30 ft.', senses: ['blindsight 30 ft.', 'tremorsense 60 ft.'] }],
  [/remorhaz/i, { atk: [['Bite', 'piercing', 10, '', 'plus fire damage from its heated body']], traits: [['Heated Body', 'A creature that touches the creature or hits it with a melee attack while within 5 feet of it takes fire damage.']], speed: '30 ft., burrow 20 ft.', senses: ['darkvision 60 ft.', 'tremorsense 60 ft.'] }],
  [/owlbear/i, { atk: [['Beak', 'piercing', 10], ['Claws', 'slashing', 8]], traits: [['Keen Sight and Smell', 'The creature has advantage on Wisdom (Perception) checks that rely on sight or smell.']], speed: '40 ft.' }],
  [/slaad/i, { al: 'chaotic neutral', atk: [['Bite', 'piercing', 8], ['Claw', 'slashing', 10]], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.'], ['Regeneration', 'The creature regains 10 hit points at the start of its turn if it has at least 1 hit point.']], type: 'aberration', lang: 'Slaad, telepathy 60 ft.', speed: '30 ft.' }],
  [/manticore/i, { atk: [['Bite', 'piercing', 8], ['Claw', 'slashing', 6], ['Tail Spike', 'piercing', 8, 'ranged']], speed: '30 ft., fly 50 ft.' }],
  [/chimera hound|cerberus|orthrus|garmr/i, { atk: [['Bite', 'piercing', 10, '', KNOCK]], traits: [EARNOSE, ['Multiple Heads', 'The creature has advantage on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious, and it can\'t be surprised.']], speed: '50 ft.' }],
  // dogs and wolves
  [/winter wolf/i, { atk: [['Bite', 'piercing', 8, '', KNOCK]], traits: [EARNOSE, PACK, ['Snow Camouflage', 'The creature has advantage on Dexterity (Stealth) checks made to hide in snowy terrain.']], acts: [['Cold Breath (Recharge 5–6)', 'The creature exhales a blast of freezing wind in a 15-foot cone. Each creature in that area must make a DC {DC} Dexterity saving throw, taking cold damage on a failed save, or half as much on a successful one.']], speed: '50 ft.', lang: 'Common, Giant, Winter Wolf' }],
  [/\bwolf\b(?! spider)|wolves|worg|jackal|hyena|\bhound\b|\bdog\b|mastiff|fenrir|fenris|skoll|hati|cu sith|hollow hound|judgement hound/i, { atk: [['Bite', 'piercing', 8, '', KNOCK]], traits: [EARNOSE, PACK], speed: '50 ft.' }],
  // bears, great cats, apes
  [/polar bear/i, { atk: [['Bite', 'piercing', 8], ['Claws', 'slashing', 6]], traits: [NOSE], speed: '40 ft., swim 30 ft.' }],
  [/\bbear\b/i, { atk: [['Bite', 'piercing', 8], ['Claws', 'slashing', 6]], traits: [NOSE], speed: '40 ft., climb 30 ft.' }],
  [/saber|sabre|\blion\b|tiger|panther|leopard|jaguar|serpopard/i, { atk: [['Claw', 'slashing', 6], ['Bite', 'piercing', 10]], traits: [POUNCE, NOSE, ['Running Leap', 'With a 10-foot running start, the creature can long jump up to 25 feet.']], speed: '50 ft., climb 30 ft.', skills: ['Perception', 'Stealth'] }],
  [/girallon/i, { atk: [['Bite', 'piercing', 6], ['Claw', 'slashing', 6]], traits: [['Four Arms', 'The creature makes four claw attacks as part of its Multiattack.'], NOSE], speed: '40 ft., climb 40 ft.' }],
  [/\bape\b|gorilla|quaggoth|yeti|sasquatch/i, { atk: [['Fist', 'bludgeoning', 6], ['Rock', 'bludgeoning', 6, 'ranged']], speed: '30 ft., climb 30 ft.', skills: ['Athletics', 'Perception'] }],
  [/baboon|monkey/i, { atk: [['Bite', 'piercing', 4]], traits: [PACK], speed: '30 ft., climb 30 ft.' }],
  // hooved and horned
  [/boar/i, { atk: [['Tusk', 'slashing', 6]], traits: [CHARGE, ['Relentless (Recharges after a Short or Long Rest)', 'If the creature takes damage that would reduce it to 0 hit points, it is reduced to 1 hit point instead.']], speed: '40 ft.' }],
  [/mammoth|elephant|behemoth|tarrasque/i, { atk: [['Gore', 'piercing', 10], ['Stomp', 'bludgeoning', 10]], traits: [TRAMPLE], speed: '40 ft.' }],
  [/rhino|triceratops|\bbull\b|minotaur|gorgon|catoblepas|ophiotaurus/i, { atk: [['Gore', 'piercing', 8], ['Hooves', 'bludgeoning', 6]], traits: [CHARGE], speed: '40 ft.' }],
  [/\bgoat\b|\bram\b/i, { atk: [['Ram', 'bludgeoning', 6]], traits: [CHARGE, ['Sure-Footed', 'The creature has advantage on Strength and Dexterity saving throws made against effects that would knock it prone.']], speed: '40 ft., climb 30 ft.' }],
  [/(?<!sea )horse|pony|mule|camel|\belk\b|\bhind\b|\bdeer\b|stag|\box\b/i, { atk: [['Hooves', 'bludgeoning', 6]], traits: [TRAMPLE], speed: '50 ft.' }],
  // small beasts
  [/swarm of (bats|rats|cranium rats|ravens|insects)|swarm/i, { atk: [['Bites', 'piercing', 6, '', 'or half damage if the swarm has half of its hit points or fewer']], traits: [['Swarm', 'The swarm can occupy another creature\'s space and vice versa, and it can move through any opening large enough for a Tiny creature. It can\'t regain hit points or gain temporary hit points.']] }],
  [/\bbat\b|fall bat/i, { atk: [['Bite', 'piercing', 4]], traits: [ECHO, ['Keen Hearing', 'The creature has advantage on Wisdom (Perception) checks that rely on hearing.']], speed: '5 ft., fly 40 ft.', senses: ['blindsight 60 ft.'] }],
  [/\brat\b|cranium rat/i, { atk: [['Bite', 'piercing', 4]], traits: [NOSE], speed: '30 ft.', senses: ['darkvision 30 ft.'] }],
  [/badger/i, { atk: [['Bite', 'piercing', 6], ['Claws', 'slashing', 4]], traits: [NOSE], speed: '20 ft., burrow 5 ft.', senses: ['darkvision 30 ft.'] }],
  [/moon moth/i, { atk: [['Proboscis', 'piercing', 4]], speed: '10 ft., fly 40 ft.' }],
  [/quetzalcoatlus|pteranodon/i, { atk: [['Bite', 'piercing', 8]], traits: [FLYBY], speed: '10 ft., fly 60 ft.' }],
  // birds and bird-folk
  [/velociraptor|deinonychus|allosaurus/i, { atk: [['Bite', 'piercing', 8], ['Claw', 'slashing', 6]], traits: [POUNCE, PACK], speed: '60 ft.', type: 'beast' }],
  [/axe beak/i, { atk: [['Beak', 'slashing', 8]], speed: '50 ft.' }],
  [/cockatrice/i, { atk: [['Bite', 'piercing', 4, '', 'and the target must succeed on a DC {DC} Constitution saving throw against being magically petrified: on a failure it begins to turn to stone and is restrained, and is petrified for 24 hours if it fails again at the end of its next turn']], speed: '20 ft., fly 40 ft.', type: 'monstrosity' }],
  [/aarakocra/i, { al: 'neutral good', atk: [['Talon', 'slashing', 4], ['Javelin', 'piercing', 6, 'ranged']], traits: [['Dive Attack', 'If the creature is flying and dives at least 30 feet straight toward a target and then hits it with a melee attack, the attack deals an extra die of damage.']], type: 'humanoid', speed: '20 ft., fly 50 ft.', lang: 'Auran, Aarakocra' }],
  [/kenku/i, { al: 'chaotic neutral', atk: [['Shortsword', 'piercing', 6], ['Shortbow', 'piercing', 6, 'ranged']], traits: [['Mimicry', 'The creature can mimic any sounds it has heard, including voices.'], ['Ambusher', 'In the first round of a combat, the creature has advantage on attack rolls against any creature it surprised.']], type: 'humanoid', speed: '30 ft.', lang: 'understands Auran and Common but speaks only through Mimicry' }],
  [/harpy|^siren/i, { al: 'chaotic evil', atk: [['Claws', 'slashing', 4], ['Club', 'bludgeoning', 4]], acts: [['Luring Song', 'The creature sings a magical melody. Every humanoid and giant within 300 feet that can hear it must succeed on a DC {DC} Wisdom saving throw or be charmed and move toward it until the song ends.']], type: 'monstrosity', speed: '20 ft., fly 40 ft.', lang: 'Common' }],
  [/nagpa/i, { al: 'neutral evil', atk: [['Staff', 'bludgeoning', 6]], traits: [['Corruption', 'As a bonus action, the creature targets one creature it can see within 90 feet: the target must make a DC {DC} Charisma saving throw or be charmed until the end of its next turn.']], type: 'humanoid', speed: '30 ft.', lang: 'Common, and many others' }],
  [/hawk|eagle|owl\b|vulture|falcon|raven|sparrow|stormhawk|griffon|hippogriff|peryton|roc\b|thunderbird|ziz|anzu|simurgh|garuda|bennu|phoenix|stymphalian|piasa|impundulu|alkonost/i, { atk: [['Beak', 'piercing', 6], ['Talons', 'slashing', 8]], traits: [EYES], speed: '10 ft., fly 80 ft.' }],
  // reptiles and reptile-folk
  [/winged kobold/i, { al: 'lawful evil', atk: [['Dagger', 'piercing', 4], ['Dropped Rock', 'bludgeoning', 6, 'ranged']], traits: [SUN, PACK], type: 'humanoid', speed: '30 ft., fly 30 ft.', senses: ['darkvision 60 ft.'], lang: 'Common, Draconic' }],
  [/kobold/i, { al: 'lawful evil', atk: [['Dagger', 'piercing', 4], ['Sling', 'bludgeoning', 4, 'ranged']], traits: [SUN, PACK], type: 'humanoid', speed: '30 ft.', senses: ['darkvision 60 ft.'], lang: 'Common, Draconic' }],
  [/lizardfolk|lizard king/i, { al: 'neutral', atk: [['Bite', 'piercing', 6], ['Heavy Club', 'bludgeoning', 6], ['Javelin', 'piercing', 6, 'ranged']], traits: [BREATH], type: 'humanoid', speed: '30 ft., swim 30 ft.', lang: 'Draconic' }],
  [/yuan-ti/i, { al: 'neutral evil', atk: [['Scimitar', 'slashing', 6], ['Bite', 'piercing', 4, '', 'plus poison damage'], ['Longbow', 'piercing', 8, 'ranged', 'plus poison damage']], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.']], acts: [['Innate Spellcasting', 'The creature can cast animal friendship (snakes only) at will, and suggestion three times a day (save DC {DC}).']], type: 'monstrosity', speed: '30 ft.', lang: 'Abyssal, Common, Draconic' }],
  [/troglodyte/i, { al: 'chaotic evil', atk: [['Bite', 'piercing', 4], ['Claw', 'slashing', 4]], traits: [['Chameleon Skin', 'The creature has advantage on Dexterity (Stealth) checks made to hide.'], ['Stench', 'Any creature other than a troglodyte that starts its turn within 5 feet of it must succeed on a DC {DC} Constitution saving throw or be poisoned until the start of its next turn.'], SUN], type: 'humanoid', speed: '30 ft.', lang: 'Troglodyte' }],
  [/grung/i, { al: 'lawful evil', atk: [['Dagger', 'piercing', 4, '', POISON]], traits: [AMPHI, ['Poisonous Skin', 'Any creature that grapples the creature or otherwise comes into direct contact with its skin must succeed on a DC {DC} Constitution saving throw or become poisoned for 1 minute.'], ['Standing Leap', 'The creature\'s long jump is up to 25 feet and its high jump is up to 15 feet, with or without a running start.']], type: 'humanoid', speed: '25 ft., climb 25 ft.', lang: 'Grung' }],
  [/tortle/i, { al: 'lawful good', atk: [['Claw', 'slashing', 4], ['Quarterstaff', 'bludgeoning', 6]], traits: [BREATH], acts: [['Shell Defense', 'The creature withdraws into its shell: until it emerges it gains +4 AC and has advantage on Strength and Constitution saving throws, but it is prone and its speed is 0.']], type: 'humanoid', speed: '30 ft.', lang: 'Aquan, Common' }],
  [/bullywug/i, { al: 'neutral evil', atk: [['Bite', 'bludgeoning', 4], ['Spear', 'piercing', 6]], traits: [AMPHI, ['Speak with Frogs and Toads', 'The creature can communicate simple concepts to frogs and toads.'], ['Standing Leap', 'The creature\'s long jump is up to 20 feet and its high jump is up to 10 feet, with or without a running start.']], type: 'humanoid', speed: '20 ft., swim 40 ft.', lang: 'Bullywug' }],
  [/frog|toad|froghemoth/i, { atk: [['Bite', 'piercing', 6, '', GRAB + ', and the creature can try to swallow a grappled target smaller than itself on its next turn']], traits: [AMPHI, ['Standing Leap', 'The creature\'s long jump is up to 20 feet and its high jump is up to 10 feet, with or without a running start.']], speed: '20 ft., swim 40 ft.', senses: ['darkvision 30 ft.'] }],
  [/crocodile|makara|ninki nanka/i, { atk: [['Bite', 'piercing', 10, '', GRAB], ['Tail', 'bludgeoning', 8]], traits: [BREATH], speed: '20 ft., swim 30 ft.' }],
  [/constrictor/i, { atk: [['Bite', 'piercing', 6], ['Constrict', 'bludgeoning', 8, '', GRAB + ' and restrained']], speed: '30 ft., swim 30 ft.', senses: ['blindsight 10 ft.'] }],
  [/flying snake/i, { atk: [['Bite', 'piercing', 4, '', 'plus poison damage']], traits: [FLYBY], speed: '30 ft., fly 60 ft., swim 30 ft.', senses: ['blindsight 10 ft.'] }],
  [/poisonous snake|\basp\b|viper|uraeus/i, { atk: [['Bite', 'piercing', 4, '', POISON]], speed: '30 ft., swim 30 ft.', senses: ['blindsight 10 ft.'] }],
  [/tyrannosaurus/i, { atk: [['Bite', 'piercing', 12, '', GRAB + ' if it is Medium or smaller'], ['Tail', 'bludgeoning', 8]], speed: '50 ft.' }],
  [/ankylosaurus|stegosaurus|hadrosaurus/i, { atk: [['Tail', 'bludgeoning', 10, '', KNOCK]], speed: '30 ft.' }],
  [/brontosaurus|mokele/i, { atk: [['Stomp', 'bludgeoning', 10], ['Tail', 'bludgeoning', 8, '', KNOCK]], speed: '30 ft.' }],
  [/dimetrodon/i, { atk: [['Bite', 'piercing', 8]], speed: '30 ft., swim 20 ft.' }],
  [/basilisk|medusa/i, { atk: [['Bite', 'piercing', 6, '', 'plus poison damage']], traits: [['Petrifying Gaze', 'If a creature starts its turn within 30 feet of the creature and the two of them can see each other, it must make a DC {DC} Constitution saving throw: on a failure it begins to turn to stone and is restrained, and it is petrified if it fails again at the end of its next turn.']], speed: '20 ft.' }],
  [/hydra/i, { atk: [['Bite', 'piercing', 10]], traits: [BREATH, ['Multiple Heads', 'The creature has five heads and makes one bite attack per head. When it takes 25 or more damage in a single turn, one head dies; at the end of its turn it grows two heads for each head that died since its last turn, unless it took fire damage.'], ['Reactive Heads', 'For each head beyond one, the creature gets an extra reaction that can be used only for opportunity attacks.']], speed: '30 ft., swim 30 ft.' }],
  [/naga/i, { al: 'lawful evil', atk: [['Bite', 'piercing', 6, '', POISON]], traits: [['Rejuvenation', 'If it dies, the creature returns to life in 1d6 days and regains all its hit points, unless it is destroyed with a wish spell.']], acts: [['Spellcasting', 'The creature casts spells of its own choosing (save DC {DC}), chosen by the DM to fit its kind.']], type: 'monstrosity', lang: 'Abyssal, Celestial, Common', speed: '40 ft.' }],
  [/serpent|snake|wurm|lindworm|jormungandr|apep|vritra|zmey|uktena|grootslang|ladon|echidna|jiaolong|tatzelwurm|mushussu/i, { atk: [['Bite', 'piercing', 10, '', POISON], ['Constrict', 'bludgeoning', 8, '', GRAB + ' and restrained']], speed: '40 ft., swim 40 ft.', senses: ['blindsight 30 ft.', 'darkvision 60 ft.'] }],
  [/giant lizard|lizard/i, { atk: [['Bite', 'piercing', 8]], speed: '30 ft., climb 30 ft.', senses: ['darkvision 30 ft.'] }],
  // the sea: folk who walk on land, and creatures that only swim
  [/merfolk|selkie/i, { al: 'neutral', atk: [['Spear', 'piercing', 6]], traits: [AMPHI], type: 'humanoid', speed: '10 ft., swim 40 ft.', lang: 'Aquan, Common' }],
  [/sahuagin/i, { al: 'lawful evil', atk: [['Bite', 'piercing', 4], ['Claws', 'slashing', 4], ['Spear', 'piercing', 6]], traits: [FRENZY, ['Limited Amphibiousness', 'The creature can breathe air and water, but it needs to be submerged at least once every 4 hours to avoid suffocating.'], ['Shark Telepathy', 'The creature can magically command any shark within 120 feet of it, using a limited telepathy.']], type: 'humanoid', speed: '30 ft., swim 40 ft.', lang: 'Sahuagin' }],
  [/kuo-toa/i, { al: 'neutral evil', atk: [['Bite', 'piercing', 4], ['Spear', 'piercing', 6], ['Net', 'bludgeoning', 4, 'ranged', 'and the target is restrained (escape DC {DC})']], traits: [AMPHI, ['Otherworldly Perception', 'The creature can sense the presence of any creature within 30 feet of it that is invisible or on the Ethereal Plane.'], ['Slippery', 'The creature has advantage on ability checks and saving throws made to escape a grapple.'], SUN], type: 'humanoid', speed: '30 ft., swim 30 ft.', lang: 'Undercommon' }],
  [/merrow/i, { al: 'chaotic evil', atk: [['Bite', 'piercing', 8], ['Claws', 'slashing', 4], ['Harpoon', 'piercing', 6, 'ranged', 'and the creature can pull the target up to 20 feet toward it']], traits: [AMPHI], type: 'monstrosity', speed: '10 ft., swim 40 ft.', lang: 'Abyssal, Aquan' }],
  [/sea hag|kappa|vodyanoy|ichthyocentaur|kraken priest/i, { atk: [['Claws', 'slashing', 6]], traits: [AMPHI], speed: '30 ft., swim 40 ft.' }],
  [/hippocamp|kelpie|each-uisge/i, { atk: [['Hooves', 'bludgeoning', 6], ['Bite', 'piercing', 6]], traits: [AMPHI], speed: '20 ft., swim 60 ft.' }],
  [/bulette/i, { atk: [['Bite', 'piercing', 12]], traits: [['Standing Leap', 'The creature\'s long jump is up to 30 feet and its high jump is up to 15 feet, with or without a running start.']], acts: [['Deadly Leap', 'If the creature jumps at least 15 feet as part of its movement, it can land on its feet in a space that contains one or more other creatures. Each of those creatures must succeed on a DC {DC} Strength or Dexterity saving throw or be knocked prone and take bludgeoning and slashing damage.']], type: 'monstrosity', speed: '40 ft., burrow 40 ft.', senses: ['darkvision 60 ft.', 'tremorsense 60 ft.'] }],
  [/crab/i, { atk: [['Claw', 'bludgeoning', 6, '', GRAB]], traits: [AMPHI], speed: '30 ft., swim 30 ft.', senses: ['blindsight 30 ft.'] }],
  [/octopus|kraken|scylla|squid/i, { atk: [['Tentacles', 'bludgeoning', 8, '', GRAB + ' and restrained']], traits: [BREATH, ['Underwater Camouflage', 'The creature has advantage on Dexterity (Stealth) checks made while underwater.']], acts: [['Ink Cloud (Recharges after a Short or Long Rest)', 'A 20-foot-radius cloud of ink extends all around the creature if it is underwater. The area is heavily obscured for 1 minute, and the creature can then use the Dash action as a bonus action.']], speed: '10 ft., swim 60 ft.', senses: ['darkvision 60 ft.'] }],
  [/shark/i, { atk: [['Bite', 'piercing', 8]], traits: [FRENZY, ['Water Breathing', 'The creature can breathe only underwater.']], speed: '0 ft., swim 50 ft.', senses: ['blindsight 30 ft.'] }],
  [/killer whale|whale/i, { atk: [['Bite', 'piercing', 12]], traits: [ECHO, BREATH, ['Keen Hearing', 'The creature has advantage on Wisdom (Perception) checks that rely on hearing.']], speed: '0 ft., swim 60 ft.', senses: ['blindsight 120 ft.'] }],
  [/\beel\b/i, { atk: [['Bite', 'piercing', 8], ['Shock', 'lightning', 6]], traits: [['Water Breathing', 'The creature can breathe only underwater.']], speed: '0 ft., swim 40 ft.' }],
  [/sea horse/i, { atk: [['Ram', 'bludgeoning', 6]], traits: [['Charge', 'If the creature moves at least 20 feet straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra die of damage. If the target is a creature, it must succeed on a DC {DC} Strength saving throw or be knocked prone.']], speed: '0 ft., swim 40 ft.' }],
  [/plesiosaurus/i, { atk: [['Bite', 'piercing', 10]], traits: [BREATH], speed: '20 ft., swim 40 ft.' }],
  // insects and spiders
  [/drider/i, { al: 'chaotic evil', atk: [['Longsword', 'slashing', 8], ['Bite', 'piercing', 4, '', 'plus poison damage'], ['Longbow', 'piercing', 8, 'ranged', 'plus poison damage']], traits: [CLIMB, SUN, WEBWALK], type: 'monstrosity', lang: 'Elvish, Undercommon' }],
  [/ettercap/i, { al: 'neutral evil', atk: [['Bite', 'piercing', 8, '', POISON], ['Claws', 'slashing', 4]], traits: [CLIMB, WEBSENSE, WEBWALK], acts: [WEB], type: 'monstrosity' }],
  [/chitine|choldrith/i, { al: 'chaotic evil', atk: [['Dagger', 'piercing', 4, '', 'plus poison damage']], traits: [CLIMB, SUN, WEBSENSE, WEBWALK], acts: [WEB], type: 'monstrosity', lang: 'Undercommon' }],
  [/spider/i, { atk: [['Bite', 'piercing', 8, '', 'plus poison damage; the target must make a DC {DC} Constitution saving throw or take more poison damage and, if reduced to 0 hit points, is stable but poisoned and paralyzed for 1 hour']], traits: [CLIMB, WEBSENSE, WEBWALK], acts: [WEB], speed: '30 ft., climb 30 ft.', senses: ['blindsight 10 ft.', 'darkvision 60 ft.'] }],
  [/scorpion|tlincalli/i, { atk: [['Claw', 'bludgeoning', 8, '', GRAB], ['Sting', 'piercing', 10, '', POISON]], speed: '40 ft.', senses: ['blindsight 60 ft.'] }],
  [/centipede/i, { atk: [['Bite', 'piercing', 4, '', POISON]], speed: '30 ft., climb 30 ft.', senses: ['blindsight 30 ft.'] }],
  [/wasp|bee\b|hornet/i, { atk: [['Sting', 'piercing', 6, '', POISON]], speed: '10 ft., fly 50 ft.' }],
  [/fire beetle/i, { atk: [['Bite', 'slashing', 6]], traits: [['Illumination', 'The creature sheds bright light in a 10-foot radius and dim light for an additional 10 feet.']], speed: '30 ft.', senses: ['blindsight 30 ft.'] }],
  [/ankheg/i, { atk: [['Bite', 'slashing', 6, '', 'plus acid damage, ' + GRAB]], acts: [['Acid Spray (Recharge 6)', 'The creature spits acid in a line 30 feet long and 5 feet wide. Each creature in that line must make a DC {DC} Dexterity saving throw, taking acid damage on a failed save, or half as much on a successful one.']], speed: '30 ft., burrow 10 ft.', senses: ['darkvision 60 ft.', 'tremorsense 60 ft.'] }],
  [/rust monster/i, { atk: [['Bite', 'piercing', 8]], traits: [['Iron Scent', 'The creature can pinpoint, by scent, the location of ferrous metal within 30 feet of it.'], ['Rust Metal', 'Any nonmagical weapon made of metal that hits the creature corrodes: it takes a permanent and cumulative −1 penalty to damage rolls, and is destroyed if the penalty drops to −5.']], acts: [['Antennae', 'The creature corrodes a nonmagical ferrous metal object it can see within 5 feet of it. Armor touched loses 1 AC.']], speed: '40 ft.' }],
  [/carrion crawler/i, { atk: [['Tentacles', 'poison', 4, '', 'and the target must succeed on a DC {DC} Constitution saving throw or be poisoned for 1 minute; until this poison ends, the target is paralyzed'], ['Bite', 'piercing', 6]], traits: [CLIMB, NOSE], speed: '30 ft., climb 30 ft.' }],
  [/stirge/i, { atk: [['Blood Drain', 'piercing', 4, '', 'and the creature attaches to the target, draining blood at the start of each of its turns until it detaches']], speed: '10 ft., fly 40 ft.' }],
  [/thri-kreen/i, { al: 'chaotic neutral', atk: [['Bite', 'piercing', 6, '', POISON], ['Claws', 'slashing', 8], ['Gythka', 'slashing', 8]], traits: [['Chameleon Carapace', 'The creature can change the color of its carapace to match its surroundings, and has advantage on Dexterity (Stealth) checks made to hide.'], ['Standing Leap', 'The creature\'s long jump is up to 30 feet and its high jump is up to 15 feet, with or without a running start.']], type: 'humanoid', speed: '40 ft.', lang: 'Thri-kreen' }],
  [/roper/i, { atk: [['Tendril', 'bludgeoning', 4, '', GRAB + ', and the target is restrained and has disadvantage on Strength checks and saves'], ['Bite', 'piercing', 8]], traits: [FALSE, CLIMB, ['Grasping Tendrils', 'The creature can have up to six tendrils at a time, and can pull grappled creatures up to 25 feet toward it as an action.']], speed: '10 ft., climb 10 ft.', senses: ['darkvision 60 ft.'] }],
  [/cave fisher/i, { atk: [['Claw', 'slashing', 8], ['Filament', 'bludgeoning', 4, 'ranged', 'and the target is grappled and pulled toward the creature']], traits: [CLIMB], speed: '20 ft., climb 20 ft.' }],
  [/displacer beast/i, { atk: [['Tentacle', 'bludgeoning', 6, '', 'plus piercing damage']], traits: [['Avoidance', 'If the creature is subjected to an effect that allows it to make a saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails.'], ['Displacement', 'The creature projects a magical illusion that makes it appear to be standing near its actual location, causing attack rolls against it to have disadvantage. If it is hit by an attack, this trait is disrupted until the end of its next turn.']], type: 'monstrosity', al: 'lawful evil', speed: '40 ft.', senses: ['darkvision 60 ft.'], lang: '—', body: 'beast' }],
  [/giant weasel|weasel/i, { atk: [['Bite', 'piercing', 4]], traits: [EARNOSE], speed: '40 ft.', senses: ['darkvision 60 ft.'], body: 'beast' }],
  [/giant strider/i, { atk: [['Beak', 'piercing', 8], ['Fire Burst', 'fire', 6, 'ranged']], traits: [['Fire Absorption', 'Whenever the creature is subjected to fire damage, it takes no damage and instead regains hit points equal to the fire damage dealt.']], type: 'monstrosity', speed: '50 ft.', body: 'beast' }],
  [/steeder/i, { atk: [['Bite', 'piercing', 8, '', 'plus poison damage'], ['Sticky Leg', 'bludgeoning', 4, '', 'and the target is stuck to the creature\'s leg and grappled (escape DC {DC})']], traits: [CLIMB, ['Extraordinary Leap', 'The distance of the creature\'s long jumps is tripled; every foot of its walking speed that it spends on the jump allows it to move 3 feet.']], speed: '30 ft., climb 30 ft.', senses: ['darkvision 120 ft.'] }],
  [/myrmekes|giant ant/i, { atk: [['Bite', 'piercing', 8, '', GRAB], ['Sting', 'piercing', 6, '', POISON]], traits: [PACK], speed: '40 ft., burrow 20 ft., climb 40 ft.', senses: ['darkvision 60 ft.', 'tremorsense 60 ft.'] }],
  [/gray render/i, { atk: [['Bite', 'piercing', 12, '', GRAB + ' if it is Medium or smaller'], ['Claw', 'slashing', 8, '', KNOCK]], type: 'monstrosity', speed: '30 ft.', senses: ['darkvision 60 ft.'] }],
  [/leucrotta/i, { atk: [['Bite', 'piercing', 10], ['Hooves', 'bludgeoning', 6]], traits: [EARNOSE, ['Kicking Retreat', 'If the creature attacks with its hooves, it can take the Disengage action as a bonus action.'], ['Mimicry', 'The creature can mimic animal sounds and humanoid voices.'], ['Rampage', 'When the creature reduces a creature to 0 hit points with a melee attack on its turn, it can take a bonus action to move up to half its speed and make a bite attack.']], type: 'monstrosity', al: 'chaotic evil', speed: '50 ft.', senses: ['darkvision 60 ft.'], lang: 'Abyssal, Gnoll' }],
  [/chupacabra/i, { atk: [['Bite', 'piercing', 6, '', 'and the creature drains blood: the target\'s hit point maximum is reduced by the damage taken until it finishes a long rest'], ['Claws', 'slashing', 4]], traits: [EARNOSE, ['Standing Leap', 'The creature\'s long jump is up to 20 feet and its high jump is up to 10 feet, with or without a running start.']], type: 'monstrosity', speed: '40 ft.', senses: ['darkvision 60 ft.'] }],
  [/bunyip/i, { atk: [['Bite', 'piercing', 10, '', GRAB]], traits: [BREATH, ['Terrifying Bellow', 'Once per day the creature can bellow: each creature within 60 feet that can hear it must succeed on a DC {DC} Wisdom saving throw or be frightened of it for 1 minute.']], type: 'monstrosity', speed: '20 ft., swim 50 ft.', senses: ['darkvision 60 ft.'] }],
  [/\bnue\b/i, { atk: [['Bite', 'piercing', 8], ['Claws', 'slashing', 6], ['Snake Tail', 'piercing', 6, '', POISON]], traits: [['Cursed Cry', 'As a bonus action, the creature cries out: each creature within 60 feet that can hear it must succeed on a DC {DC} Wisdom saving throw or be frightened until the end of its next turn.']], type: 'monstrosity', speed: '40 ft., fly 40 ft.', senses: ['darkvision 60 ft.'] }],
  [/berbalang/i, { atk: [['Bite', 'piercing', 8], ['Claws', 'slashing', 6]], acts: [['Spectral Duplicate (Recharges after a Short or Long Rest)', 'The creature creates one spectral duplicate of itself in an unoccupied space it can see within 60 feet. While the duplicate exists the creature is unconscious; it sees and hears through the duplicate and can act through it.']], type: 'aberration', al: 'neutral evil', speed: '30 ft., fly 40 ft.', senses: ['truesight 120 ft.'], lang: 'all, but rarely speaks' }],
  [/crawling claw/i, { atk: [['Claw', 'bludgeoning', 4, '', 'or slashing damage (the creature\'s choice)']], traits: [['Turn Immunity', 'The creature is immune to effects that turn undead.']], type: 'undead', speed: '20 ft., climb 20 ft.', senses: ['blindsight 30 ft. (blind beyond this radius)'] }],
  [/shambling mound/i, { atk: [['Slam', 'bludgeoning', 8], ['Engulf', 'bludgeoning', 8, '', GRAB + '; while grappled the target is blinded, restrained, and unable to breathe']], traits: [['Lightning Absorption', 'Whenever the creature is subjected to lightning damage, it takes no damage and regains a number of hit points equal to the lightning damage dealt.']], type: 'plant', speed: '20 ft., swim 20 ft.', senses: ['blindsight 60 ft. (blind beyond this radius)'] }],
  [/wood woad/i, { atk: [['Club', 'bludgeoning', 8]], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.'], ['Plant Camouflage', 'The creature has advantage on Dexterity (Stealth) checks it makes in any terrain with ample obscuring plant life.'], ['Tree Stride', 'Once on each of its turns, the creature can use 10 feet of its movement to step magically into one living tree within 5 feet of it and emerge from a second living tree within 60 feet of the first.']], type: 'plant', al: 'lawful neutral', speed: '30 ft., climb 30 ft.', senses: ['darkvision 60 ft.'], lang: 'Sylvan' }],
  [/\bgiff\b/i, { atk: [['Longsword', 'slashing', 8], ['Musket', 'piercing', 12, 'ranged']], traits: [['Headfirst Charge', 'If the creature moves at least 20 feet straight toward a target and then hits it with a melee attack on the same turn, the target takes an extra die of damage and must succeed on a DC {DC} Strength saving throw or be knocked prone.'], ['Firearms Knowledge', 'The creature\'s mastery of its weapons lets it ignore the loading property of muskets and pistols.']], type: 'humanoid', al: 'lawful neutral', speed: '30 ft.', lang: 'Common' }],
  [/nycaloth/i, { atk: [['Claw', 'slashing', 6, '', 'and the target must succeed on a DC {DC} Constitution saving throw or take extra damage at the start of each of its turns from a wound that won\'t close, until someone uses an action to stanch it'], ['Greataxe', 'slashing', 12]], traits: [['Magic Resistance', 'The creature has advantage on saving throws against spells and other magical effects.']], acts: [['Teleport', 'The creature magically teleports, along with any equipment it is wearing or carrying, up to 60 feet to an unoccupied space it can see.']], type: 'fiend (yugoloth)', al: 'neutral evil', speed: '40 ft., fly 60 ft.', senses: ['blindsight 60 ft.', 'darkvision 60 ft.'], lang: 'Abyssal, Infernal, telepathy 60 ft.' }],
  [/ahuizotl/i, { atk: [['Bite', 'piercing', 8], ['Tail Hand', 'bludgeoning', 6, '', GRAB + ', and the creature can drag the grappled target with it as it swims']], traits: [AMPHI, ['Mimicry', 'The creature can mimic the sound of a crying child to lure prey toward the water.']], type: 'monstrosity', speed: '30 ft., swim 40 ft.', senses: ['darkvision 60 ft.'] }],
  [/behir/i, { atk: [['Bite', 'piercing', 10], ['Constrict', 'bludgeoning', 10, '', GRAB + ' and restrained']], traits: [CLIMB], acts: [['Lightning Breath (Recharge 5–6)', 'The creature exhales a line of lightning 20 feet long and 5 feet wide. Each creature in that line must make a DC {DC} Dexterity saving throw, taking lightning damage on a failed save, or half as much on a successful one.']], type: 'monstrosity', al: 'neutral evil', speed: '50 ft., climb 40 ft.', senses: ['darkvision 90 ft.'], lang: 'Draconic' }],
  [/zaratan|dragon turtle|turtle/i, { atk: [['Bite', 'piercing', 12], ['Flipper', 'bludgeoning', 8, '', KNOCK]], traits: [BREATH, ['Siege Monster', 'The creature deals double damage to objects and structures.']], acts: [['Shell Defense', 'The creature withdraws into its shell: until it emerges it gains +4 AC and has advantage on Strength and Constitution saving throws, but its speed is 0.']], speed: '20 ft., swim 40 ft.' }],
  [/kruthik/i, { atk: [['Stab', 'piercing', 6], ['Spike', 'piercing', 6, 'ranged']], traits: [PACK, ['Tunneler', 'The creature can burrow through solid rock at half its burrow speed and leaves a tunnel behind.']], speed: '40 ft., burrow 20 ft., climb 40 ft.', senses: ['darkvision 60 ft.', 'tremorsense 60 ft.'] }]
];
function kitFor(n) { for (var i = 0; i < KITS.length; i++) if (KITS[i][0].test(n)) return KITS[i][1]; return null; }
function statblock(m, body, bestDrop) {
  var cr = m.cr || GRADE_CR[Math.max(0, Math.min(9, (m.g || 1) - 1))], c = crNum(cr);
  // a kit decides how the creature fights; a giant animal ("Giant Goat") uses the beast plan, not the giant one, and
  // people with a beast's name (kobolds, lizardfolk, kenku) use the humanoid plan
  var kit = kitFor(m.n), ANIMAL = { beast: 1, bird: 1, reptile: 1, aquatic: 1, insect: 1 };
  if (kit && (kit.body || (body === 'giant' && /^giant /i.test(m.n)) || (kit.type === 'humanoid' && ANIMAL[body]))) body = kit.type === 'humanoid' && body !== 'humanoid' ? 'humanoid' : kit.body || 'beast';
  var plan = PLAN[body] || PLAN.beast, h = hash(m.n);
  // a kit that speaks (yuan-ti, harpies, nagas) thinks like a person, whatever its body
  var base = plan.ab.slice(); if (kit && kit.lang) for (var bi = 3; bi < 6; bi++) base[bi] = Math.max(base[bi], PLAN.humanoid.ab[bi]);
  var prof = c < 1 ? 2 : 2 + Math.floor((c - 1) / 4);
  var sz = size(m, body, c);
  var ab = base.map(function (v, i) {
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
  // Realm scaling (campaign rule: everything scales through the realms). Deeper realms mean tougher, harder-hitting
  // monsters: +15% HP per realm tier past the Human Realm, and a flat bonus on every hit that keeps pace with the AC
  // that gear of that realm gives (+4 per tier), since AC is subtracted from each hit.
  var tier0 = Math.max(0, (m.tier || 1) - 1), realmHit = 4 * tier0;
  if (tier0) { hd = Math.max(1, Math.round(hd * (1 + 0.15 * tier0))); hp = Math.max(1, Math.floor(hd * (die / 2 + 0.5)) + hd * mods[2]); }
  // AC scales through the realms as player damage does (deeper-realm materials hit harder): half the CR, natural armor,
  // +1 for each realm tier past the Human Realm, and +1 for every 5 grades within the realm.
  var tierBonus = Math.max(0, (m.tier || 1) - 1), gradeBonus = Math.floor((m.g || 1) / 5);
  // CON adds its modifier to AC once (×1), as for characters (campaign owner's rule): no cap, and a negative modifier
  // lowers it, never below 0.
  var conAC = mods[2];
  var ac = Math.max(0, Math.floor(c / 2) + (plan.acBonus || 0) + (/scale|shell|carapace|plate|armor|armou?red/i.test(m.txt || '') ? 2 : 0) + tierBonus + gradeBonus + conAC);
  // attacks
  var pri = Math.max(mods[0], mods[1]), hit = prof + pri;
  var dpr = c < 1 ? ({ 0: 1, 0.125: 3, 0.25: 5, 0.5: 8 })[c] || 2 : Math.round(5 * c + 4);
  var n = c < 2 ? 1 : c < 8 ? 2 : 3;
  var elem = element(m.n + ' ' + (m.txt || ''));
  var actions = [], atks = kit ? kit.atk : plan.atk, melee = atks.filter(function (a) { return !a[3]; });
  if (!melee.length) melee = atks;
  if (n > 1) {
    var names = []; for (var k = 0; k < n; k++) names.push(melee[k % melee.length][0]);
    var cnt = {}; names.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    var words = ['', 'one', 'two', 'three'];
    actions.push(['Multiattack', 'The creature makes ' + words[n] + ' attacks: ' + Object.keys(cnt).map(function (x) { return words[cnt[x]] + ' with its ' + x.toLowerCase(); }).join(' and ') + '.']);
  }
  var dc = 8 + prof + Math.max(mods[2], mods[4], mods[5]);
  var fill = function (t) { return t.replace(/\{DC\}/g, dc); };
  atks.forEach(function (a, i) {
    if (i > 0 && n === 1 && !a[3] && !kit) return; // a kit lists every attack the creature has, even if it makes one per turn
    var per = Math.max(1, Math.round(dpr / n)), d = a[2], avg = d / 2 + 0.5;
    var dice = Math.max(1, Math.round((per - pri) / avg)), dmg = Math.max(1, Math.floor(dice * avg) + pri + realmHit);
    var ranged = a[3] === 'ranged', kind = a[1];
    var txt = (ranged ? 'Ranged Weapon Attack: ' : 'Melee Weapon Attack: ') + sgn(hit) + ' to hit, ' + (ranged ? 'range 60/240 ft.' : 'reach ' + (/Large|Huge|Gargantuan/.test(sz[0]) ? 10 : 5) + ' ft.') + ', one target. Hit: ' + dmg + ' (' + dice + 'd' + d + ((pri + realmHit) ? ' ' + ((pri + realmHit) > 0 ? '+ ' : '− ') + Math.abs(pri + realmHit) : '') + ') ' + kind + ' damage';
    if (elem && i === 0 && kind !== elem && c >= 2) { var ed = Math.max(1, Math.round(c / 3)); txt += ' plus ' + Math.floor(ed * 3.5) + ' (' + ed + 'd6) ' + elem + ' damage'; }
    // what else a hit does: a new sentence ("If the target..."), extra damage ("plus..."), or more of this one ("and...")
    if (a[4]) txt += (/^[A-Z]/.test(a[4]) ? '. ' : /^plus /.test(a[4]) ? ' ' : ', ') + fill(a[4]);
    if (!kit && plan.poison && /Sting|Bite/.test(a[0]) && i > 0) txt += ', and the target must make a DC ' + dc + ' Constitution saving throw or be poisoned for 1 minute';
    actions.push([a[0], txt + '.']);
  });
  if (plan.breath && c >= 1) {
    var bd = Math.max(2, Math.round(c * 1.2 * (1 + 0.1 * tier0))), bt = elem || 'fire';
    actions.push(['Breath Weapon (Recharge 5–6)', 'The creature exhales ' + bt + ' in a ' + (c >= 17 ? 60 : c >= 10 ? 30 : 15) + '-foot cone. Each creature in that area must make a DC ' + dc + ' Dexterity saving throw, taking ' + Math.floor(bd * 3.5) + ' (' + bd + 'd6) ' + bt + ' damage on a failed save, or half as much on a successful one.']);
  }
  if (kit && kit.acts) kit.acts.forEach(function (x) { actions.push([x[0], fill(x[1])]); });
  if (plan.mind && c >= 3) actions.push(['Mind Blast (Recharge 5–6)', 'Each creature of the creature\'s choice within 30 feet must succeed on a DC ' + dc + ' Intelligence saving throw or take ' + Math.floor(Math.max(2, Math.round(c)) * 3.5) + ' (' + Math.max(2, Math.round(c)) + 'd6) psychic damage and be stunned until the end of its next turn.']);
  // traits
  var traits = (kit ? kit.traits || [] : plan.traits || []).map(function (x) { return [x[0], fill(x[1])]; });
  if (bestDrop && bestDrop.tr) { var st = bestDrop.tr.t, up = /^Armor or a shield with this material gives \+(\d+) AC/.exec(st); if (up) ac += +up[1];
    traits.push(['Signature: ' + bestDrop.tr.n, 'From its ' + bestDrop.n.replace(m.n + ' ', '').toLowerCase() + '. ' + voice(st)]); }
  var boss = (m.g || 0) >= 10 || c >= 17;
  if (boss) traits.push(['Legendary Resistance (3/Day)', 'If the creature fails a saving throw, it can choose to succeed instead.']);
  var legendary = boss ? [['Detect', 'The creature makes a Wisdom (Perception) check.'], ['Attack', 'The creature makes one ' + atks[0][0].toLowerCase() + ' attack.'], ['Surge (Costs 2 Actions)', 'The creature moves up to half its speed without provoking opportunity attacks, then makes one attack.']] : null;
  // saves and skills
  var saves = (c >= 5 && plan.saves) ? plan.saves.map(function (i) { return ABN[i].charAt(0) + ABN[i].slice(1).toLowerCase() + ' ' + sgn(mods[i] + prof); }).join(', ') : '';
  var skl = kit && kit.skills || plan.skills, skills = skl.map(function (s) { return s + ' ' + sgn(mods[SKILL_AB[s]] + prof); }).join(', ');
  var pp = 10 + mods[4] + (skl.indexOf('Perception') >= 0 ? prof : 0);
  var res = (plan.res || []).slice(), imm = (plan.imm || []).slice();
  if (elem && (body === 'dragon' || body === 'elemental' || body === 'fiend') && imm.indexOf(elem) < 0) { imm.push(elem); var ri = res.indexOf(elem); if (ri >= 0) res.splice(ri, 1); }
  var type = kit && kit.type ? kit.type : plan.type + (body === 'fiend' && /devil|hell|infernal|pit|erinyes|imp\b/i.test(m.n) ? ' (devil)' : body === 'fiend' && /demon|abyss|balor|vrock|hezrou|quasit|dretch|glabrezu|marilith/i.test(m.n) ? ' (demon)' : '');
  return {
    sz: sz[0], ty: type, al: kit && kit.al || (kit && kit.lang && plan.align === 'unaligned' ? 'any alignment' : plan.align), ac: ac, hp: hp, hd: hd + 'd' + die + (mods[2] ? ' ' + (mods[2] > 0 ? '+ ' : '− ') + Math.abs(hd * mods[2]) : ''),
    sp: kit && kit.speed || plan.speed, ab: ab, sv: '', /* campaign rule: saves add no ability modifier or proficiency */ sk: skills, vu: (plan.vuln || []).join(', '), rs: res.join(', '), im: imm.join(', '), ci: (plan.cond || []).join(', '),
    se: (kit && kit.senses || plan.senses).concat(['passive Perception ' + pp]).join(', '), la: kit && kit.lang || plan.lang, cr: cr, xp: XP[cr] || 0, pb: prof,
    tr: traits, ac2: actions, lg: legendary
  };
}
module.exports = { statblock: statblock, GRADE_CR: GRADE_CR, XP: XP };
