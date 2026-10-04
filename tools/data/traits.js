// Unique material traits, from what a material is and where it came from.
// - Creature parts get an effect from the creature's signature ability, shaped by the body part
//   (a hawk's eye sharpens sight; a troll's blood regenerates; a basilisk's eye petrifies).
// - Plants get a small herbal effect from what the plant is known for.
// - Ores, stones, gems, supplies, and crafted goods are basic: no trait beyond their property.
// Numbers scale with Potency (P, 1-10), matching data/properties.js.
// trait(material, creature) -> { org, origin, name, text } ; creature = { n, txt } or null.

// ---- body parts: which kind of effect a part carries
var PARTS = [
  [/\b(eye|eyes|lens|gaze|eyestalk|iris|pupil)\b/i, 'eye', 'sense'],
  [/\b(ear|ears|antenna|antennae|whisker|whiskers)\b/i, 'ear', 'sense'],
  [/\b(brain|mind|cranium|skull)\b/i, 'brain', 'mind'],
  [/\b(fang|fangs|tooth|teeth|tusk|tusks|maw|jaw|beak|mandible|bite)\b/i, 'fang', 'offense'],
  [/\b(claw|claws|talon|talons|nail|pincer|stinger|barb|spike|spikes|quill|quills|spine|spines)\b/i, 'claw', 'offense'],
  [/\b(horn|horns|antler|antlers)\b/i, 'horn', 'offense'],
  [/\b(venom|poison|gland|sac|bile|toxin|spit)\b/i, 'venom', 'offense'],
  [/\b(tail)\b/i, 'tail', 'offense'],
  [/\b(wing|wings|feather|feathers|plume|down|membrane)\b/i, 'wing', 'move'],
  [/\b(leg|legs|hoof|hooves|foot|paw|paws|sinew|tendon)\b/i, 'leg', 'move'],
  [/\b(hide|pelt|skin|fur|leather|mane|wool|hair)\b/i, 'hide', 'defense'],
  [/\b(scale|scales|shell|carapace|plate|plating|chitin|husk|armor|armour)\b/i, 'scale', 'defense'],
  [/\b(bone|bones|knucklebone|knuckle|rib|marrow|vertebra|skeleton)\b/i, 'bone', 'defense'],
  [/\b(heart)\b/i, 'heart', 'vital'],
  [/\b(blood|ichor|plasma)\b/i, 'blood', 'vital'],
  [/\b(fat|tallow|oil|lard|liver|organ|tongue|stomach|lung|lungs)\b/i, 'organ', 'vital'],
  [/\b(silk|web|thread|tendril|tentacle)\b/i, 'silk', 'move'],
  [/\b(essence|core|soul|spirit|ectoplasm|wisp|heartstone|spark|ember|breath|tear|cinder|dust|ash)\b/i, 'essence', 'mind'],
  [/\b(egg|eggs|pearl|ink)\b/i, 'egg', 'mind']
];

// ---- creature abilities: matched against the creature's name and description, first match wins.
// Each gives text per effect kind; {P} {B} {DC} {FT} {D} are filled from Potency.
var ABILITIES = [
  { re: /hawk|eagle|falcon|owl|raptor|griffon|gryphon|roc\b|vulture|peryton|kenku|aarakocra|harpy|hippogriff/i, label: 'Keen-Eyed Flier',
    sense: ['Hawk-Sight', 'While equipped, you see clearly twice as far as normal and have advantage on Wisdom (Perception) checks that rely on sight. You spot hidden creatures within {FT} ft on a passive Perception of 10 + {P}.'],
    move: ['Glider', 'While equipped, you take no falling damage and can glide 2 ft forward for every 1 ft you fall. At Potency 6+, you gain a flying speed of {FT} ft for 1 minute once per long rest.'],
    offense: ['Diving Strike', 'A weapon with this material deals +{P}d4 damage when you attack after moving at least 20 ft toward the target.'] },
  { re: /\bbat\b|bats\b|cave fisher|echo/i, label: 'Echolocation',
    sense: ['Echo-Sense', 'While equipped, you have blindsight out to {B0} ft, as long as you aren\'t deafened.'],
    move: ['Night Wing', 'While equipped, you can hang from ceilings and take no falling damage from {FT} ft or less.'] },
  { re: /wolf|hound|jackal|\bdog\b|worg|coyote|hyena|gnoll/i, label: 'Pack Hunter',
    sense: ['Keen Nose', 'While equipped, you have advantage on Wisdom (Perception) checks that rely on smell and can track a creature by scent for {P} days.'],
    offense: ['Pack Tactics', 'A weapon with this material deals +{P}d4 damage to a creature that one of your allies is within 5 ft of.'],
    defense: ['Thick Coat', 'While equipped, you ignore the effects of extreme cold and gain +{B} to saves against being knocked prone.'] },
  { re: /troll|hydra|regenerat|ooze king|treant/i, label: 'Regeneration',
    vital: ['Regenerating', 'While equipped, you regain {P} hit points at the start of each of your turns while you have at least 1 hit point. Fire or acid damage stops it until your next turn.'],
    defense: ['Self-Mending', 'Armor with this material repairs itself: Damaged armor is restored after a long rest, and you regain {P} hit points when you finish a short rest.'],
    offense: ['Festering Wound', 'A creature hit by a weapon with this material can\'t regain hit points until the start of your next turn.'] },
  { re: /basilisk|medusa|gorgon|cockatrice|petrif/i, label: 'Petrifying Gaze',
    sense: ['Stone Gaze', 'Once per long rest, as an action, a creature within 30 ft that can see you makes a Constitution save (DC {DC}) or is restrained as it begins to turn to stone; it is petrified if it fails again on its next turn.'],
    offense: ['Calcifying', 'A creature hit by a weapon with this material has its speed reduced by 10 ft until the end of its next turn as its flesh stiffens. On a critical hit it is restrained (DC {DC} Constitution save ends).'],
    defense: ['Stoneskin', 'While equipped, you resist bludgeoning, piercing, and slashing damage from nonmagical attacks for 1 minute once per long rest.'],
    vital: ['Unpetrifying', 'Potions and salves made with this material cure petrification. While equipped, you have advantage on saves against being petrified.'] },
  { re: /spider|ettercap|drider|arachn|web/i, label: 'Web-Spinner',
    move: ['Spider Climb', 'While equipped, you can climb difficult surfaces, including ceilings, without an ability check, and you ignore movement restrictions caused by webbing.'],
    offense: ['Webbed Strike', 'Once per turn, a creature hit by a weapon with this material is restrained by sticky strands (DC {DC} Strength check to escape).'],
    sense: ['Web-Sense', 'While equipped, you know the exact location of any creature touching the same surface as you within {FT} ft.'] },
  { re: /snake|serpent|viper|cobra|python|yuan-ti|naga|asp\b|constrictor/i, label: 'Serpent',
    offense: ['Venom Fang', 'A weapon with this material deals +{P}d6 poison damage, and the target makes a Constitution save (DC {DC}) or is poisoned until the end of its next turn.'],
    defense: ['Shed Skin', 'Once per long rest, when you would be grappled or restrained, you slip free automatically.'],
    sense: ['Tongue-Taste', 'While equipped, you have advantage on checks to detect invisible creatures within 10 ft.'] },
  { re: /shark|fish|\beel\b|sahuagin|merrow|kraken|octopus|squid|whale|sea |sea$|tide|coral|kuo-toa|marid|water|dragon turtle|leviathan|deep/i, label: 'Creature of the Deep',
    vital: ['Water-Breathing', 'While equipped, you can breathe underwater and have a swimming speed equal to your walking speed.'],
    move: ['Current-Rider', 'While equipped, you have a swimming speed of {FT} ft and can\'t be pushed by water currents.'],
    offense: ['Blood in the Water', 'A weapon with this material deals +{P}d4 damage to creatures that are below half their hit points.'],
    sense: ['Deep-Sight', 'While equipped, you have darkvision out to {FT} ft and can see normally through murky water.'] },
  { re: /red dragon|gold dragon|brass dragon|fire|flame|salamander|hell ?hound|magma|ember|cinder|phoenix|efreet|azer|lava|sun/i, label: 'Fire-Born',
    defense: ['Flameproof', 'While equipped, you resist fire damage{IMM} and ignore the effects of extreme heat.'],
    offense: ['Searing', 'A weapon with this material deals +{P}d6 fire damage and ignites flammable objects it hits.'],
    vital: ['Inner Furnace', 'While equipped, you don\'t need warm clothing or fire to survive the cold, and once per long rest you can regain {P5} hit points as a bonus action.'] },
  { re: /white dragon|silver dragon|frost|ice|cold|yeti|winter|remorhaz|polar|glacial|snow|rime/i, label: 'Frost-Born',
    defense: ['Frostproof', 'While equipped, you resist cold damage{IMM} and walk on ice and snow without slipping or slowing.'],
    offense: ['Freezing', 'A weapon with this material deals +{P}d6 cold damage, and a hit reduces the target\'s speed by 10 ft until the end of its next turn.'] },
  { re: /blue dragon|bronze dragon|storm|lightning|thunder|behir|spark|djinni|air/i, label: 'Storm-Born',
    defense: ['Grounded', 'While equipped, you resist lightning and thunder damage.'],
    offense: ['Thunderstrike', 'A weapon with this material deals +{P}d6 lightning damage. On a critical hit, the target is deafened until the end of its next turn.'],
    move: ['Wind-Step', 'While equipped, your speed increases by 10 ft and you can Dash as a bonus action once per short rest.'] },
  { re: /green dragon|black dragon|copper dragon|acid|ooze|pudding|jelly|slime|cube|oblex/i, label: 'Corrosive',
    defense: ['Acid-Proof', 'While equipped, you resist acid damage and your gear can\'t be corroded.'],
    offense: ['Dissolving', 'A weapon with this material deals +{P}d6 acid damage and lowers the target\'s AC by 1 until repaired.'] },
  { re: /dragon|wyvern|drake|wyrm|draconic/i, label: 'Draconic',
    defense: ['Dragon-Hide', 'While equipped, you gain +{B} AC and resist one damage type of the dragon\'s element.'],
    offense: ['Frightful Presence', 'Once per long rest, when you hit with a weapon with this material, each enemy within 30 ft makes a Wisdom save (DC {DC}) or is frightened of you for 1 minute.'],
    vital: ['Dragon-Blood', 'While equipped, you have advantage on saves against being frightened and +{P5} maximum hit points.'],
    sense: ['Dragon-Sight', 'While equipped, you have blindsight out to 10 ft and darkvision out to {FT} ft.'] },
  { re: /ghost|wraith|specter|spectre|banshee|shadow|shade|wight|poltergeist|phantom|allip/i, label: 'Incorporeal',
    move: ['Phasing', 'Once per long rest, you can move through creatures and objects as difficult terrain for 1 minute. You take 1d10 force damage if you end your turn inside an object.'],
    defense: ['Ghostly', 'While equipped, you resist necrotic damage and nonmagical attacks against you have disadvantage in dim light or darkness.'],
    offense: ['Chilling Touch', 'A weapon with this material deals +{P}d6 necrotic damage, and the target can\'t regain hit points until the start of your next turn.'],
    vital: ['Wail', 'Once per long rest, each creature of your choice within 30 ft makes a Wisdom save (DC {DC}) or is frightened until the end of your next turn.'] },
  { re: /vampire|blood|lamia|stirge|leech|mosquito/i, label: 'Blood-Drinker',
    offense: ['Life Drain', 'When you hit with a weapon with this material, you regain hit points equal to half the extra {P}d4 necrotic damage it deals.'],
    vital: ['Thirsting Vigor', 'While equipped, you regain {P} extra hit points whenever you spend a Hit Die.'] },
  { re: /zombie|skeleton|ghoul|ghast|mummy|lich|undead|revenant|bone|corpse|grave|death/i, label: 'Undying',
    vital: ['Undying', 'Once per long rest, when you drop to 0 hit points but aren\'t killed outright, you drop to 1 hit point instead.'],
    defense: ['Grave-Cold', 'While equipped, you resist necrotic and poison damage and have advantage on saves against disease.'],
    offense: ['Paralyzing', 'A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is paralyzed until the end of its next turn. Elves and undead are immune.'] },
  { re: /angel|deva|planetar|solar|celestial|unicorn|pegasus|couatl|ki-rin|seraph|holy|halo|empyrean|choir/i, label: 'Celestial',
    vital: ['Healing Touch', 'Once per long rest, as an action, you touch a creature and restore {P5} hit points and end one disease or poison.'],
    offense: ['Radiant', 'A weapon with this material deals +{P}d6 radiant damage, doubled against fiends and undead.'],
    defense: ['Warded', 'While equipped, you have advantage on saves against being charmed or frightened and resist radiant damage.'],
    sense: ['Truesight Glimpse', 'Once per long rest, you gain truesight out to 30 ft for 1 minute.'] },
  { re: /demon|devil|fiend|imp\b|hell|abyss|infernal|quasit|succubus|incubus|balor|pit fiend|nalfeshnee|hezrou|vrock/i, label: 'Fiendish',
    defense: ['Fiend-Hide', 'While equipped, you resist fire and poison damage and have advantage on saves against spells cast by fiends.'],
    offense: ['Hellish', 'A weapon with this material deals +{P}d6 fire or necrotic damage (your choice).'],
    sense: ['Devil\'s Sight', 'While equipped, you can see normally in magical and nonmagical darkness out to {FT} ft.'] },
  { re: /mind flayer|illithid|beholder|aboleth|brain|psionic|psychic|intellect|gith|nothic|elder brain/i, label: 'Psionic',
    mind: ['Telepathy', 'While equipped, you can speak telepathically with any creature within {FT} ft that shares a language with you.'],
    offense: ['Mind Spike', 'A weapon with this material deals +{P}d6 psychic damage, and the target has disadvantage on its next Intelligence or Wisdom save before the end of your next turn.'],
    sense: ['Thought-Sight', 'Once per long rest, you can read the surface thoughts of one creature you can see for 1 minute (Wisdom save DC {DC} negates).'] },
  { re: /displacer/i, label: 'Displacement',
    defense: ['Displacement', 'While equipped, attacks against you have disadvantage until you are hit; the effect returns at the start of your next turn.'] },
  { re: /blink|phase|teleport|hidden path/i, label: 'Blinking',
    move: ['Blink-Step', 'As a bonus action {P} times per long rest, you teleport up to {FT} ft to a space you can see.'] },
  { re: /mimic|doppelganger|shapechang|changeling|chameleon|kenku/i, label: 'Shapechanger',
    defense: ['Mimicry', 'While equipped, you can make the item look like any ordinary object of similar size, and you have advantage on checks to disguise yourself.'],
    mind: ['Borrowed Voice', 'While equipped, you can perfectly mimic any voice or sound you have heard.'] },
  { re: /boar|rhino|bull|minotaur|bison|ram\b|goat|charg|bulette|mammoth|elephant/i, label: 'Charging Beast',
    offense: ['Gore', 'If you move at least 20 ft straight toward a target and then hit it with a weapon with this material, it takes +{P}d6 damage and makes a Strength save (DC {DC}) or is knocked prone.'],
    defense: ['Relentless', 'Once per long rest, when you take damage that would drop you to 0 hit points, you drop to 1 instead.'] },
  { re: /\bcat\b|lion|tiger|panther|leopard|lynx|jaguar|sabre|saber|cougar|displacer/i, label: 'Stalking Cat',
    offense: ['Pounce', 'If you move at least 20 ft toward a creature and hit it with a weapon with this material, it makes a Strength save (DC {DC}) or is knocked prone, and you can make one more attack as a bonus action.'],
    move: ['Soft Step', 'While equipped, you have advantage on Dexterity (Stealth) checks and take half damage from falls.'],
    sense: ['Night Eyes', 'While equipped, you have darkvision out to {FT} ft.'] },
  { re: /scorpion|wasp|bee\b|hornet|centipede|crawler|ankheg|insect|beetle|mantis/i, label: 'Venomous Hunter',
    offense: ['Paralytic Venom', 'A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is poisoned for 1 minute; while poisoned this way it is also paralyzed if it fails by 5 or more.'],
    defense: ['Chitin Plating', 'While equipped, you gain +{B} AC against ranged attacks.'] },
  { re: /mole|bulette|purple worm|umber hulk|burrow|tunnel|xorn|rock crawler|earth|galeb|dao/i, label: 'Burrower',
    sense: ['Tremorsense', 'While equipped, you have tremorsense out to {B0} ft while you touch the ground.'],
    move: ['Earth-Glide', 'While equipped, you can burrow through loose earth and sand at half your walking speed.'] },
  { re: /turtle|tortoise|crab|crustac|shell|armadillo|ankylo/i, label: 'Shelled',
    defense: ['Shell Guard', 'While equipped, you can use your reaction to gain +{P} AC against one attack, and you have advantage on saves against being pushed or knocked prone.'] },
  { re: /horse|elk|deer|stag|antelope|camel|axe beak|gazelle/i, label: 'Swift',
    move: ['Fleet-Footed', 'While equipped, your walking speed increases by {MV} ft and difficult terrain costs you no extra movement on open ground.'] },
  { re: /frog|toad|bullywug|grung|kangaroo|grasshopper/i, label: 'Leaper',
    move: ['Great Leap', 'While equipped, your long jump is up to {FT} ft and your high jump up to {HJ} ft, with or without a running start.'] },
  { re: /\bape\b|gorilla|bear|giant|ogre|troll|owlbear|sasquatch|baboon|monkey/i, label: 'Mighty',
    offense: ['Crushing Blow', 'A weapon with this material deals +{P}d4 damage, and on a hit you can push the target 5 ft away from you.'],
    vital: ['Brute Strength', 'While equipped, you count as one size larger for carrying capacity and have advantage on Strength (Athletics) checks to climb or grapple.'],
    defense: ['Thick Hide', 'While equipped, you gain +{B} AC.'] },
  { re: /golem|construct|modron|clockwork|animated|automaton/i, label: 'Construct',
    defense: ['Unyielding', 'While equipped, you can\'t be charmed or poisoned, and you have advantage on saves against being stunned.'] },
  { re: /fey|faerie|fairy|pixie|sprite|dryad|satyr|hag|eladrin|quickling|redcap|moon|twilight|wisp/i, label: 'Fey',
    mind: ['Fey Charm', 'Once per long rest, as an action, one creature within 30 ft makes a Wisdom save (DC {DC}) or is charmed by you for 1 minute.'],
    move: ['Fey Step', 'Once per short rest, as a bonus action, you teleport up to 30 ft to a space you can see.'],
    defense: ['Glamoured', 'While equipped, you have advantage on saves against being charmed and magic can\'t put you to sleep.'] },
  { re: /chaos|slaad|wild|paradox|entropy|unmade/i, label: 'Chaotic',
    mind: ['Wild Surge', 'Once per long rest, when you cast a spell or hit with this item, roll on the wild magic table; you may keep or ignore the result.'] },
  { re: /void|null|absence|hollow|empty|silence|star spawn|far /i, label: 'Void-Touched',
    defense: ['Null Ward', 'While equipped, you have advantage on saves against spells and resist force damage.'],
    offense: ['Unmaking', 'A weapon with this material deals +{P}d6 force damage and ignores resistance to it.'] }
];

// generic effects per part when no ability matches
var GENERIC = {
  eye: ['Keen Eye', 'While equipped, you gain +{B} to Wisdom (Perception) checks that rely on sight.'],
  ear: ['Keen Ear', 'While equipped, you gain +{B} to Wisdom (Perception) checks that rely on hearing and can\'t be surprised while awake.'],
  brain: ['Sharp Mind', 'While equipped, you gain +{B} to Intelligence checks and saves against being charmed.'],
  fang: ['Rending Bite', 'A weapon with this material deals +{P}d4 piercing damage on a critical hit and bites deeper: the target bleeds for 1d4 at the start of its next turn.'],
  claw: ['Rending Claw', 'A weapon with this material deals +{P}d4 slashing damage to creatures that aren\'t wearing armor.'],
  horn: ['Goring', 'A weapon with this material deals +{P}d4 damage when you charge at least 10 ft before attacking.'],
  venom: ['Toxic', 'A weapon coated with this material deals +{P}d4 poison damage (Constitution save DC {DC} for half).'],
  tail: ['Lashing', 'A weapon with this material has reach +5 ft once per turn.'],
  wing: ['Featherfall', 'While equipped, you fall slowly enough to take no falling damage from {FT} ft or less.'],
  leg: ['Sure-Footed', 'While equipped, your speed increases by 5 ft and you have advantage on saves against being knocked prone.'],
  hide: ['Weathered', 'While equipped, you ignore the effects of extreme heat or cold (your choice when crafted) and gain +{B} to Constitution saves against exhaustion.'],
  scale: ['Hardened Scales', 'While equipped, you gain +{B} AC against one damage type of your choice (chosen when crafted).'],
  bone: ['Bone-Strong', 'Items with this material are hard to break: they can\'t be Damaged by nonmagical means, and you have +{B} to saves against being pushed.'],
  heart: ['Stout Heart', 'While equipped, you gain +{P5} maximum hit points.'],
  blood: ['Vital Blood', 'Potions and salves made with this material restore +{P} extra hit points.'],
  organ: ['Rendered', 'Potions and salves made with this material last twice as long; worn items keep you warm and dry.'],
  silk: ['Binding Strands', 'Items with this material can bind or snare: once per short rest, a creature you hit is restrained until it uses an action to break free (DC {DC}).'],
  essence: ['Living Essence', 'Items with this material can hold a charge: once per long rest, you regain one expended spell slot of level {SL} or lower.'],
  egg: ['Potential', 'Items with this material grow with you: the first time you finish a long rest while wearing it at a new character level, you gain {P} temporary hit points that last until your next long rest.']
};

var PLANTS = [
  [/silverleaf|heal|mint|bloom|lotus|life|sage|chamomile|aloe|balm|willow/i, 'Healing Herb', 'Potions and food made with it restore +{P} hit points, and worn charms of it give advantage on saves against disease.'],
  [/bane|night|shade|death|toad|hemlock|wolfsbane|nightshade|poison|rot|mushroom|fung|spore|cap\b/i, 'Toxic Plant', 'Poisons made with it deal +{P}d4 poison damage; a weapon coated with it poisons on a failed DC {DC} Constitution save.'],
  [/oak|iron|ironwood|stone|thorn|bark|briar|blackthorn|ash/i, 'Hardwood', 'Weapons and shields made with it can\'t be Damaged by nonmagical means. Thorned versions deal 1d4 piercing damage to creatures that grapple you.'],
  [/sun|fire|ember|pepper|flame|ash/i, 'Warming Plant', 'While carried or eaten, you ignore extreme cold and have advantage on saves against exhaustion from cold.'],
  [/frost|winter|ice|snow|cold/i, 'Frost Plant', 'While carried or eaten, you ignore extreme heat for 8 hours.'],
  [/dream|moon|poppy|sleep|lull|calm|lavender/i, 'Soporific Plant', 'Brewed or burned, a creature that breathes it makes a Constitution save (DC {DC}) or falls asleep for 1 minute.'],
  [/sap|resin|amber|gum|pitch/i, 'Sticky Resin', 'Seals and binds: items made with it are waterproof, and thrown flasks of it stick a creature in place (DC {DC} Strength to escape).'],
  [/vine|root|moss|reed|creeper|living|awakened|shrub/i, 'Living Plant', 'Items made with it slowly regrow: they mend minor damage after a long rest, and once per day you can make it sprout a 10 ft vine rope.'],
  [/wheat|grain|corn|rice|berry|fruit|apple|root vegetable|crop/i, 'Hearty Crop', 'Food made with it counts as a full day\'s ration in half the amount and grants {P} temporary hit points.']
];

var BASIC = {
  O: 'Basic metal. Forges standard weapons, armor, and tools; it carries only its property.',
  G: 'Basic gem. Used for focuses, settings, and enchantment anchors; it carries only its property.',
  S: 'Basic stone. Used for masonry, carvings, and heavy weapons; it carries only its property.',
  W: 'Basic wood. Used for bows, staves, hafts, and structures; it carries only its property.',
  F: 'Basic cloth or fiber. Used for clothing, padding, and bindings; it carries only its property.',
  K: 'Basic mechanism. Used in clockwork and engineering; it carries only its property.',
  U: 'Supply. Used up in crafting; it gives no trait or property.',
  E: 'Raw arcane essence. It carries only its property.',
  B: 'Basic animal part. It carries only its property.',
  L: 'Basic organic matter. It carries only its property.'
};
var KIND = { O: 'Mineral', G: 'Mineral', S: 'Mineral', W: 'Plant', F: 'Crafted', K: 'Crafted', U: 'Supply', E: 'Essence', B: 'Creature', L: 'Creature' };

function fill(s, P) {
  var B = Math.ceil(P / 2);
  return s.replace(/\{IMM\}/g, P >= 8 ? ' (immunity at this Potency)' : '')
    .replace(/\{P5\}/g, P * 5).replace(/\{FT\}/g, 20 + P * 10).replace(/\{B0\}/g, 10 + B * 10).replace(/\{MV\}/g, 5 + B * 5)
    .replace(/\{HJ\}/g, 5 + P * 2).replace(/\{SL\}/g, Math.min(9, B)).replace(/\{DC\}/g, 10 + B * 2)
    .replace(/\{P\}/g, P).replace(/\{B\}/g, B).replace(/\b1 hit points\b/g, '1 hit point');
}
function part(name) { for (var i = 0; i < PARTS.length; i++) if (PARTS[i][0].test(name)) return { p: PARTS[i][1], k: PARTS[i][2] }; return null; }
var ORDER = { sense: ['sense', 'mind', 'offense', 'move', 'vital', 'defense'], mind: ['mind', 'sense', 'vital', 'offense', 'defense', 'move'],
  offense: ['offense', 'vital', 'defense', 'move', 'sense', 'mind'], move: ['move', 'defense', 'sense', 'vital', 'offense', 'mind'],
  defense: ['defense', 'vital', 'move', 'offense', 'sense', 'mind'], vital: ['vital', 'defense', 'offense', 'mind', 'move', 'sense'] };

function trait(m, creature, typeCode) {
  var P = m.pot || 1, name = m.n, t = typeCode || '';
  var pt = part(name);
  var isCreature = !!creature || ((t === 'B' || t === 'L') && !!pt) || (t === 'F' && !!pt && pt.p === 'hide') || (t === 'E' && !!creature);
  if (t === 'U') return { org: 'Supply', origin: '', name: '', text: BASIC.U };
  if (isCreature) {
    var who = creature ? creature.n : '';
    var hay = (who + ' ' + (creature && creature.txt || '') + ' ' + name);
    var ab = null;
    for (var i = 0; i < ABILITIES.length; i++) if (ABILITIES[i].re.test(who) || ABILITIES[i].re.test(name)) { ab = ABILITIES[i]; break; }
    if (!ab) for (var j = 0; j < ABILITIES.length; j++) if (ABILITIES[j].re.test(hay)) { ab = ABILITIES[j]; break; }
    var kind = pt ? pt.k : (t === 'E' ? 'mind' : t === 'L' ? 'vital' : 'defense');
    var pick = null;
    if (pt && pt.p === 'venom' && !(ab && ab.offense && /poison|venom/i.test(ab.offense[1]))) ab = null;
    if (ab) { var ord = ORDER[kind]; for (var k = 0; k < ord.length; k++) if (ab[ord[k]]) { pick = ab[ord[k]]; break; } }
    if (!pick) pick = GENERIC[pt ? pt.p : (t === 'L' ? 'blood' : t === 'E' ? 'essence' : 'bone')];
    var nm = pick[0];
    if (!ab && who) nm = who.split(' ').pop() + ' ' + (pt && pt.p === 'venom' ? 'Venom' : nm);
    return { org: 'Creature', origin: who, name: nm, text: fill(pick[1], P), from: ab ? ab.label : '' };
  }
  if (t === 'W' || (t === 'F' && /fiber|leaf|reed|flax|cotton|hemp|moss|vine/i.test(name)) || (t === 'L' && /sap|resin/i.test(name))) {
    for (var q = 0; q < PLANTS.length; q++) if (PLANTS[q][0].test(name)) return { org: 'Plant', origin: m.where || '', name: PLANTS[q][1], text: fill(PLANTS[q][2], P) };
    return { org: 'Plant', origin: m.where || '', name: '', text: BASIC.W };
  }
  return { org: KIND[t] || 'Mineral', origin: m.where || '', name: '', text: BASIC[t] || BASIC.O };
}
module.exports = { trait: trait, part: part };
