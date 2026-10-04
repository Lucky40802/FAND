// Harvestable parts per monster, so every monster yields 6-10 materials.
// The body plan comes from the monster's name and description; each part has a material type
// (B bone/fang/horn/scale, F hide/fiber, L blood/organ, E essence/core, W plant, K mechanism)
// and a grade offset from the monster's grade (rare organs above, common scraps below).
// parts(monster) -> [[partName, typeCode, gradeOffset, use], ...] in a stable order.

var PLANS = [
  ['construct', /golem|construct|modron|clockwork|animated|automaton|helmed horror|shield guardian|homunculus|marut|inevitable|warforged|scarecrow/i],
  ['ooze', /ooze|pudding|jelly|slime|cube|oblex|blob/i],
  ['elemental', /elemental|mephit|salamander|azer|efreet|djinni|dao|marid|galeb|xorn|magmin|wisp|will-o|invisible stalker|fire snake|genie|spark/i],
  ['undead', /zombie|skeleton|ghoul|ghast|wight|wraith|specter|spectre|ghost|banshee|lich|mummy|vampire|revenant|poltergeist|shadow|allip|bodak|death|dracolich|demilich|boneclaw|nightwalker|sword wraith|undead|grave|corpse/i],
  ['dragon', /dragon|wyvern|drake|wyrm|dracolisk|faerie dragon|pseudodragon|dragon turtle/i],
  ['fiend', /demon|devil|fiend|imp\b|quasit|balor|pit fiend|succubus|incubus|hezrou|vrock|glabrezu|nalfeshnee|marilith|barbed|bearded|bone devil|chain devil|erinyes|horned devil|ice devil|lemure|manes|dretch|yugoloth|rakshasa|night hag|nightmare|hell ?hound|cambion|abyss|hell|archdevil/i],
  ['celestial', /angel|deva|planetar|solar|couatl|unicorn|pegasus|ki-rin|empyrean|celestial|seraph|archon/i],
  ['plant', /treant|shrub|blight|myconid|shrieker|violet fungus|vine|tree|dryad|plant|fung|mold|moss|corpse flower|thorn/i],
  ['aberration', /beholder|spectator|gauth|mind flayer|illithid|aboleth|chuul|cloaker|grell|nothic|otyugh|gibbering|intellect devourer|neogi|neothelid|elder brain|star spawn|choker|flumph|balhannoth|morkoth|aberration|tentacle/i],
  ['insect', /spider|scorpion|wasp|bee\b|ant\b|beetle|centipede|crawler|ankheg|kruthik|mantis|insect|ettercap|drider|phase spider|tick|chitine|choldrith|thri-kreen|cave fisher|stirge|locust|hornet/i],
  ['aquatic', /shark|fish|eel|sahuagin|merrow|kraken|octopus|squid|whale|kuo-toa|sea |sea$|crab|lobster|reef|leviathan|deepmaw|piranha|plesiosaur|quipper|sea hag|merfolk|water weird/i],
  ['bird', /hawk|eagle|falcon|owl\b|raptor|roc\b|vulture|peryton|griffon|gryphon|hippogriff|harpy|kenku|aarakocra|phoenix|axe beak|cockatrice|bird|raven|crow|blood hawk|stormhawk/i],
  ['reptile', /lizard|snake|serpent|viper|crocodile|basilisk|naga|yuan-ti|salamander|dinosaur|tyrannosaurus|triceratops|ankylosaurus|allosaurus|pteranodon|dimetrodon|turtle|tortoise|behir|hydra|bullywug|frog|toad|troglodyte|kobold|lizardfolk/i],
  ['giant', /giant|ogre|ettin|cyclops|fomorian|troll|oni|titan|hill|frost giant|fire giant/i],
  ['fey', /fey|faerie|fairy|pixie|sprite|satyr|hag|eladrin|quickling|redcap|korred|meenlock|darkling|boggle|yeth|nymph|siren|sea hag/i],
  ['humanoid', /bandit|guard|cultist|knight|mage|priest|thug|veteran|noble|acolyte|scout|spy|gladiator|berserker|assassin|archer|warrior|soldier|goblin|hobgoblin|bugbear|orc|gnoll|drow|duergar|gith|kenku|grimlock|derro|svirfneblin|gnome|elf|dwarf|human|captain|chief|shaman|warlord|champion|apprentice|sage|cleric/i]
];

var P = {
  // name, type, grade offset, use
  hide: ['Hide', 'F', -1, 'Light and medium armor, straps, and bindings'],
  pelt: ['Pelt', 'F', -1, 'Cloaks, linings, and light armor'],
  fang: ['Fang', 'B', 0, 'Daggers, arrowheads, and charms'],
  claw: ['Claw', 'B', 0, 'Gauntlet spikes and claw weapons'],
  bone: ['Bone', 'B', -1, 'Hafts, frames, and bone carvings'],
  sinew: ['Sinew', 'F', -1, 'Bowstrings and bindings'],
  heart: ['Heart', 'L', 1, 'Binding agent for potions and enchantments'],
  blood: ['Blood', 'L', 0, 'Potions, inks, and blood rites'],
  eye: ['Eye', 'L', 1, 'Lenses, scrying focuses, and charms of sight'],
  fat: ['Fat', 'L', -2, 'Tallow, salves, and waterproofing'],
  marrow: ['Marrow', 'L', 0, 'Restorative broths and potions'],
  skull: ['Skull', 'B', 0, 'Helms, totems, and focuses'],
  tooth: ['Tooth', 'B', -1, 'Arrowheads, charms, and inlays'],
  hair: ['Hair', 'F', -2, 'Brushes, rope, and weaving'],
  scale: ['Scale', 'B', 0, 'Scale armor and shields'],
  horn: ['Horn', 'B', 0, 'Horns, hilts, and spear tips'],
  wingm: ['Wing Membrane', 'F', 0, 'Gliders, cloaks, and sails'],
  breath: ['Breath Gland', 'L', 1, 'Elemental flasks and breath weapons'],
  heartscale: ['Heartscale', 'B', 2, 'The finest scale armor and shields'],
  feather: ['Feather', 'F', -1, 'Fletching and charms of flight'],
  talon: ['Talon', 'B', 0, 'Blades, hooks, and climbing gear'],
  beak: ['Beak', 'B', 0, 'Picks, awls, and piercing heads'],
  down: ['Down', 'F', -2, 'Padding and warm linings'],
  gizzard: ['Gizzard Stone', 'B', -1, 'Grinding stones and charms'],
  wingbone: ['Wing Bone', 'B', 0, 'Light hafts and flutes'],
  skin: ['Skin', 'F', -1, 'Supple armor and waterskins'],
  venom: ['Venom Gland', 'L', 1, 'Poisons and coated weapons'],
  tail: ['Tail', 'B', -1, 'Whips and flails'],
  carapace: ['Carapace', 'B', 0, 'Segmented armor and shields'],
  mandible: ['Mandible', 'B', 0, 'Blades, pincers, and saws'],
  stinger: ['Stinger', 'B', 1, 'Piercing weapons and poisons'],
  silk: ['Silk Gland', 'L', 0, 'Rope, nets, and fine cloth'],
  leg: ['Leg', 'B', -1, 'Light hafts and spikes'],
  ceye: ['Compound Eye', 'L', 1, 'Lenses and warding charms'],
  chitin: ['Chitin Plate', 'B', -1, 'Light armor plates'],
  fin: ['Fin', 'F', -1, 'Swim gear and sails'],
  gill: ['Gill', 'L', 0, 'Water-breathing charms and potions'],
  ink: ['Ink Sac', 'L', 0, 'Inks, smoke flasks, and scrolls'],
  oil: ['Oil', 'L', -2, 'Lamp oil and preservatives'],
  shell: ['Shell', 'B', 0, 'Shields and armor plates'],
  tentacle: ['Tentacle', 'F', 0, 'Whips, bindings, and grapples'],
  brain: ['Brain', 'L', 2, 'Psionic focuses and memory draughts'],
  ichor: ['Ichor', 'L', 0, 'Strange inks and aberrant potions'],
  membrane: ['Membrane', 'F', 0, 'Thin wards and lenses'],
  dust: ['Grave Dust', 'E', -1, 'Necromantic powders and rituals'],
  ecto: ['Ectoplasm', 'E', 0, 'Spirit inks and ghost-touched weapons'],
  soul: ['Soul Shard', 'E', 2, 'Soul binding and undead commands'],
  shroud: ['Shroud', 'F', -1, 'Grave cloth for cloaks and wraps'],
  core: ['Core', 'E', 1, 'Power sources for constructs and enchantments'],
  plate: ['Plating', 'B', 0, 'Armor plates and shields'],
  gear: ['Gear', 'K', -1, 'Clockwork and mechanisms'],
  rune: ['Rune Shard', 'E', 1, 'Enchanting and glyph inscription'],
  joint: ['Joint', 'K', -1, 'Clockwork limbs and hinges'],
  wire: ['Binding Wire', 'K', -2, 'Wiring and lashings'],
  residue: ['Residue', 'L', -1, 'Acids, solvents, and glues'],
  nucleus: ['Nucleus', 'E', 1, 'Living cores and catalysts'],
  acid: ['Acid', 'L', 0, 'Acid flasks and etching'],
  slime: ['Slime', 'L', -1, 'Lubricants and adhesives'],
  essence: ['Essence', 'E', 1, 'Elemental binding and enchantment'],
  shard: ['Shard', 'E', 0, 'Focuses and elemental weapons'],
  mote: ['Mote', 'E', -1, 'Light sources and minor charms'],
  ash: ['Ash', 'E', -2, 'Inks, glazes, and fire salts'],
  brim: ['Brimstone Gland', 'L', 1, 'Infernal flasks and fire weapons'],
  fiendhide: ['Hide', 'F', 0, 'Fiend-hide armor'],
  halo: ['Halo Shard', 'E', 2, 'Holy focuses and relics'],
  tear: ['Tear', 'L', 1, 'Holy water and healing potions'],
  bark: ['Bark', 'W', -1, 'Armor, shields, and hafts'],
  sap: ['Sap', 'L', 0, 'Resins, glues, and healing salves'],
  seed: ['Seed', 'W', 1, 'Living items and druidic focuses'],
  root: ['Root', 'W', -1, 'Rope, bindings, and staves'],
  leaf: ['Leaf', 'W', -2, 'Poultices and teas'],
  heartwood: ['Heartwood', 'W', 2, 'Staves and living weapons'],
  spore: ['Spore Sac', 'L', 0, 'Poisons, smoke, and sleep powders'],
  wingdust: ['Wing Dust', 'E', 0, 'Glamours, dreams, and illusions'],
  petal: ['Petal', 'W', -1, 'Perfumes and charms'],
  tusk: ['Tusk', 'B', 0, 'Daggers and spear tips'],
  hoof: ['Hoof', 'B', -1, 'Glue, charms, and hammer heads']
};

var BODY = {
  beast: ['hide', 'fang', 'claw', 'bone', 'heart', 'blood', 'eye', 'sinew', 'fat', 'marrow', 'skull'],
  bird: ['feather', 'talon', 'beak', 'eye', 'heart', 'down', 'wingbone', 'blood', 'gizzard', 'sinew'],
  reptile: ['scale', 'fang', 'claw', 'eye', 'heart', 'skin', 'bone', 'blood', 'venom', 'tail'],
  dragon: ['scale', 'fang', 'claw', 'horn', 'wingm', 'heart', 'blood', 'eye', 'bone', 'breath', 'heartscale'],
  insect: ['carapace', 'mandible', 'venom', 'silk', 'leg', 'ceye', 'chitin', 'stinger', 'ichor', 'heart'],
  aquatic: ['scale', 'fin', 'fang', 'eye', 'bone', 'gill', 'oil', 'heart', 'ink', 'shell'],
  aberration: ['eye', 'tentacle', 'brain', 'ichor', 'hide', 'membrane', 'ink', 'heart', 'fang', 'bone'],
  undead: ['bone', 'dust', 'ecto', 'skull', 'marrow', 'soul', 'shroud', 'eye', 'tooth', 'heart'],
  construct: ['core', 'plate', 'gear', 'rune', 'joint', 'wire', 'shard', 'eye', 'heart', 'dust'],
  ooze: ['residue', 'nucleus', 'acid', 'membrane', 'slime', 'core', 'ichor', 'shard', 'mote', 'oil'],
  elemental: ['essence', 'core', 'heart', 'shard', 'mote', 'ash', 'eye', 'dust', 'rune', 'tear'],
  fiend: ['horn', 'fiendhide', 'ichor', 'heart', 'claw', 'fang', 'eye', 'brim', 'bone', 'tail', 'soul'],
  celestial: ['feather', 'ichor', 'halo', 'heart', 'eye', 'down', 'tear', 'bone', 'essence', 'hair'],
  plant: ['bark', 'sap', 'seed', 'root', 'leaf', 'heartwood', 'spore', 'petal', 'core', 'ichor'],
  giant: ['hide', 'bone', 'heart', 'blood', 'tooth', 'hair', 'eye', 'sinew', 'skull', 'marrow', 'fat'],
  fey: ['wingdust', 'hair', 'eye', 'blood', 'heart', 'petal', 'tear', 'bone', 'essence', 'skin'],
  humanoid: ['bone', 'blood', 'heart', 'hair', 'tooth', 'sinew', 'skull', 'eye', 'marrow', 'skin']
};

function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function plan(name, txt) {
  for (var i = 0; i < PLANS.length; i++) if (PLANS[i][1].test(name)) return PLANS[i][0];
  for (var j = 0; j < PLANS.length; j++) if (PLANS[j][1].test(txt || '')) return PLANS[j][0];
  return 'beast';
}
function parts(m) {
  var kind = plan(m.n, m.txt), list = BODY[kind].slice();
  if (kind === 'beast' && /boar|elephant|mammoth|walrus|tusk/i.test(m.n)) list.splice(2, 0, 'tusk');
  if (kind === 'beast' && /horse|elk|deer|stag|goat|ram\b|bull|bison|camel|antelope|moose/i.test(m.n)) { list.splice(1, 1, 'horn'); list.splice(2, 0, 'hoof'); }
  if (kind === 'beast' && /wolf|bear|ape|lion|tiger|panther|fox|cat\b|leopard|badger|hyena|jackal|baboon|weasel|rat\b|mastiff|dog/i.test(m.n)) list[0] = 'pelt';
  if (/owlbear/i.test(m.n)) { kind = 'beast'; list = ['pelt', 'beak', 'claw', 'feather', 'bone', 'heart', 'blood', 'eye', 'sinew', 'fat']; }
  var count = 6 + hash(m.n) % 5;
  return { kind: kind, count: count, parts: list.map(function (k) { return P[k]; }) };
}
module.exports = { parts: parts, plan: plan };
