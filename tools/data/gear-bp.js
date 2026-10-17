// Harvesting tools, storage, and the Bag of Holding (website addition, original).
// TOOLS: what each tool lets you take from a corpse (part kinds, as the site's PART_KIND sorts them) and the bonus it adds
// to the Scavenging roll (kb). A guide adds kg in the realms listed (kr). mine: 1 means it can dig a vein (a pick).
// Bare hands can take only loose parts (feathers, hair, down, loose scales, leaves, petals); everything else needs a tool.
// STORE: how many extra items a storage blueprint holds. carry: 1 when it is worn or carried (adds to what a character can
// hold), 0 when it stays put (a chest or a vault). A character holds 20 items, not counting what they have equipped.
// NEW: blueprints added here. Materials are chosen at build time from the realm and type given ([realm, type, grade]),
// like the high-level blueprints. Types: O ore/metal, W wood/plant, G gem, S stone, F hide/cloth, B bone/scale, E essence.
var ALL = ['cover', 'hard', 'meat', 'fat', 'organ', 'eye', 'brain', 'other'];
var TIERS = [
  // prefix, level, rarity, realm, grade, bonus
  ['', 1, 'Common', 'Human', 2, 0],
  ['Fine ', 8, 'Uncommon', 'Human', 7, 1],
  ['Masterwork ', 15, 'Rare', 'Mysterious', 6, 2],
  ['Hellforged ', 30, 'Very Rare', 'Hell', 5, 3],
  ['Abyssal ', 50, 'Legendary', 'Abyss', 5, 4],
  ['Primordial ', 80, 'Artifact', 'Primordial', 5, 5]
];
var LINES = [
  // base name, profession, specialty, kinds it unlocks (or 'mine'), main type, second type, category, what it is
  ["Scavenger's Field Kit", 'Scavenging', 'Scavenger', ALL, 'O', 'F', 'Tool', 'A roll of knives, a hook, a bone saw, and a few jars: everything for hide, bone, meat, fat, and organs. It has no vials for blood, venom, or essences.'],
  ['Blood Kit', 'Scavenging', 'Scavenger', ['blood'], 'G', 'O', 'Tool', 'A needle, tubing, and stoppered vials. Blood cannot be taken from a corpse without one.'],
  ["Miner's Pick", 'Blacksmithing', 'Blacksmithing', 'mine', 'O', 'W', 'Tool', 'A pick for breaking ore, gems, and stone out of a vein. Veins cannot be worked by hand.']
];
var NEW = [];
LINES.forEach(function (L) {
  TIERS.forEach(function (T) {
    var b = { n: T[0] + L[0], cat: L[6], lv: Math.max(1, T[1] + (L[0] === 'Blood Kit' ? 0 : 1)), pr: L[1], sp: L[2], r: T[2], m: [[T[3], L[4], T[4]], [T[3], L[5], Math.max(1, T[4] - 1)]],
      ds: L[7] + (T[5] ? ' This one adds +' + T[5] + ' to the roll.' : '') };
    if (L[3] === 'mine') b.mine = 1; else b.kit = L[3];
    b.kb = T[5];
    NEW.push(b);
  });
});
// storage: [name, profession, level, rarity, realm, type, second type, grade, extra items, carried?, what it is]
[
  ['Belt Pouch', 'Tailoring', 1, 'Common', 'Human', 'F', 'F', 1, 2, 1, 'A small leather pouch worn on the belt.'],
  ['Satchel', 'Tailoring', 3, 'Common', 'Human', 'F', 'O', 3, 5, 1, 'A shoulder bag with a flap and a buckle.'],
  ['Backpack', 'Tailoring', 5, 'Uncommon', 'Human', 'F', 'W', 4, 10, 1, 'A framed pack with straps for bedroll and tools.'],
  ["Explorer's Pack", 'Tailoring', 10, 'Uncommon', 'Human', 'F', 'W', 7, 15, 1, 'A large pack with side pockets and a frame that spreads the weight.'],
  ["Hauler's Frame", 'Engineering', 14, 'Rare', 'Mysterious', 'W', 'O', 5, 25, 1, 'A wooden frame with straps and hooks. Its wearer needs Strength 13 or moves at half speed.'],
  ['Hellhide Pack', 'Tailoring', 25, 'Very Rare', 'Hell', 'F', 'B', 5, 30, 1, 'A pack of fireproof hide. What is inside cannot burn.'],
  ['Strongbox', 'Blacksmithing', 4, 'Common', 'Human', 'O', 'O', 4, 30, 0, 'An iron box with a good lock. It stays where you leave it.'],
  ['Sea Chest', 'Carving', 8, 'Uncommon', 'Human', 'W', 'O', 6, 60, 0, 'A big wooden chest, tarred against water. It stays where you leave it.'],
  ['Stone Vault', 'Engineering', 18, 'Rare', 'Mysterious', 'S', 'O', 7, 200, 0, 'A locked storeroom built into a home or guild hall.']
].forEach(function (s) {
  NEW.push({ n: s[0], cat: 'Storage', lv: s[2], pr: s[1], sp: s[1], r: s[3], m: [[s[4], s[5], s[7]], [s[4], s[6], Math.max(1, s[7] - 1)]], cap: s[8], carry: s[9],
    ds: s[10] + ' Holds ' + s[8] + ' items' + (s[9] ? ' on top of the 20 a character can carry.' : ', but it is not carried: what is inside stays with it.') });
});
NEW.push({ n: 'Bag of Holding', cat: 'Storage', lv: 15, pr: 'Enchanting', sp: 'Soul Binding', r: 'Very Rare', mats: ['Fragment of Time', 'Fragment of Space'], m: [['Mysterious', 'F', 6]], cap: 20, carry: 1, grow: 10,
  ds: 'A plain cloth bag that is bigger inside than out, made by binding a fragment of the Time Rune and a fragment of the Space Rune into its seams. It holds 20 items on top of what its owner can carry. Each further Fragment of Space bound into it adds 10 more. The Space Rune is held by Infinatas alone, so every Fragment of Space is his gift.' });

NEW.push({ n: 'Bag of Void', cat: 'Storage', lv: 18, pr: 'Enchanting', sp: 'Soul Binding', r: 'Very Rare', mats: ['Fragment of Void'], needs: ['Bag of Holding'], voidbag: 1,
  ds: 'A Bag of Holding with a fragment of the Void Rune bound into its mouth: a portable trash can. Whatever is dropped inside is gone for good, unmade by the Void. It never fills, never grows heavier, and cannot be emptied, so check twice before letting go. Living creatures and Rune fragments slip back out. Made from a finished Bag of Holding, which is used up.' });
NEW.push({ n: 'Bag of Devotion', cat: 'Storage', lv: 18, pr: 'Enchanting', sp: 'Soul Binding', r: 'Very Rare', mats: [], needs: ['Bag of Holding', "a signature material of the god it serves"], devotion: 1,
  ds: "A Bag of Holding sewn shut around one of a god's signature materials, which ties it to that god. Anything placed inside is given to that god: it leaves the bag at once and arrives as an offering. The god knows who gave it, and a fitting gift may be remembered (the DM decides how). Like the Bag of Void, it holds nothing of its own. Made from a finished Bag of Holding, which is used up." });

// Starter gear: plain level-1 versions of the 5e starting equipment, so a new character's kit is in the site and its
// weapons show as attacks. [name, category, damage dice, damage type, profession, materials, extra]
var STARTER = [
  ['Club', 'Hammer', '1d4', 'Bludgeoning', 'Carving', ['Oak']], ['Dagger', 'Dagger', '1d4', 'Piercing', 'Blacksmithing', ['Iron', 'Leather']],
  ['Greatclub', 'Hammer', '1d8', 'Bludgeoning', 'Carving', ['Oak']], ['Handaxe', 'Axe', '1d6', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Javelin', 'Spear', '1d6', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']], ['Light Hammer', 'Hammer', '1d4', 'Bludgeoning', 'Blacksmithing', ['Iron', 'Oak']],
  ['Mace', 'Hammer', '1d6', 'Bludgeoning', 'Blacksmithing', ['Iron']], ['Quarterstaff', 'Staff', '1d6', 'Bludgeoning', 'Carving', ['Oak']],
  ['Sickle', 'Dagger', '1d4', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']], ['Spear', 'Spear', '1d6', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Light Crossbow', 'Bow', '1d8', 'Piercing', 'Carving', ['Oak', 'Iron']], ['Dart', 'Dagger', '1d4', 'Piercing', 'Blacksmithing', ['Iron']],
  ['Shortbow', 'Bow', '1d6', 'Piercing', 'Carving', ['Yew', 'Leather']], ['Sling', 'Bow', '1d4', 'Bludgeoning', 'Tailoring', ['Leather']],
  ['Battleaxe', 'Axe', '1d8', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']], ['Flail', 'Hammer', '1d8', 'Bludgeoning', 'Blacksmithing', ['Iron']],
  ['Glaive', 'Spear', '1d10', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']], ['Greataxe', 'Axe', '1d12', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Greatsword', 'Sword', '2d6', 'Slashing', 'Blacksmithing', ['Iron', 'Leather']], ['Halberd', 'Spear', '1d10', 'Slashing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Lance', 'Spear', '1d12', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']], ['Longsword', 'Sword', '1d8', 'Slashing', 'Blacksmithing', ['Iron', 'Leather']],
  ['Maul', 'Hammer', '2d6', 'Bludgeoning', 'Blacksmithing', ['Iron', 'Oak']], ['Morningstar', 'Hammer', '1d8', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Pike', 'Spear', '1d10', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']], ['Rapier', 'Sword', '1d8', 'Piercing', 'Blacksmithing', ['Iron', 'Leather']],
  ['Scimitar', 'Sword', '1d6', 'Slashing', 'Blacksmithing', ['Iron', 'Leather']], ['Shortsword', 'Sword', '1d6', 'Piercing', 'Blacksmithing', ['Iron', 'Leather']],
  ['Trident', 'Spear', '1d6', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']], ['War Pick', 'Hammer', '1d8', 'Piercing', 'Blacksmithing', ['Iron', 'Oak']],
  ['Warhammer', 'Hammer', '1d8', 'Bludgeoning', 'Blacksmithing', ['Iron', 'Oak']], ['Whip', 'Dagger', '1d4', 'Slashing', 'Tailoring', ['Leather']],
  ['Hand Crossbow', 'Bow', '1d6', 'Piercing', 'Carving', ['Oak', 'Iron']], ['Heavy Crossbow', 'Bow', '1d10', 'Piercing', 'Carving', ['Oak', 'Iron']],
  ['Longbow', 'Bow', '1d8', 'Piercing', 'Carving', ['Yew', 'Leather']],
  // armor: FAND armor adds a little AC to a base of 0
  ['Padded Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '1' }], ['Leather Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '2' }],
  ['Studded Leather', 'Armor', '', '', 'Tailoring', ['Leather', 'Iron'], { slot: 'Body', ac: '2' }], ['Hide Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '3' }],
  ['Chain Shirt', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '3' }], ['Scale Mail', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '4' }],
  ['Ring Mail', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '3' }], ['Breastplate', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '4' }],
  ['Chain Mail', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '5' }], ['Half Plate', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '5' }],
  ['Splint Armor', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '6' }], ['Plate Armor', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '7' }],
  ['Shield', 'Shield', '', '', 'Blacksmithing', ['Iron', 'Oak'], { slot: 'Shield', ac: '1' }], ['Wooden Shield', 'Shield', '', '', 'Carving', ['Oak', 'Leather'], { slot: 'Shield', ac: '1' }],
  // ammunition, foci, tools, instruments, packs
  ['Arrows', 'Ammunition', '', '', 'Carving', ['Oak', 'Feathers'], { q: 20 }], ['Bolts', 'Ammunition', '', '', 'Carving', ['Oak', 'Iron'], { q: 20 }],
  ['Arcane Focus', 'Focus', '', '', 'Enchanting', ['Crystal'], { ds: 'A crystal, orb, rod, staff, or wand that channels arcane spells.' }],
  ['Holy Symbol', 'Focus', '', '', 'Enchanting', ['Silver'], { ds: 'An amulet, emblem, or reliquary bearing a god\'s symbol; a focus for divine spells.' }],
  ['Druidic Focus', 'Focus', '', '', 'Carving', ['Oak'], { ds: 'A sprig of mistletoe, a totem, a yew wand, or a wooden staff; a focus for druid spells.' }],
  ['Spellbook', 'Book', '', '', 'Tailoring', ['Leather'], { ds: 'A leather-bound book of 100 blank pages where a wizard writes the spells they know.' }],
  ["Thieves' Tools", 'Tool', '', '', 'Blacksmithing', ['Iron', 'Leather'], { ds: 'Picks, a small file, a mirror on a handle, and narrow scissors, for locks and traps.' }],
  ['Lute', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A stringed instrument for any bard.' }],
  ["Dungeoneer's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a crowbar, a hammer, 10 pitons, 10 torches, a tinderbox, 10 days of rations, a waterskin, and 50 feet of rope.' }],
  ["Burglar's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with ball bearings, string, a bell, candles, a crowbar, a hammer, pitons, a hooded lantern, oil, rations, a tinderbox, a waterskin, and 50 feet of rope.' }],
  ["Priest's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a blanket, candles, a tinderbox, an alms box, incense, a censer, vestments, rations, and a waterskin.' }],
  ["Scholar's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a book of lore, ink, an ink pen, 10 sheets of parchment, a little bag of sand, and a small knife.' }],
  ["Entertainer's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a bedroll, two costumes, candles, rations, a waterskin, and a disguise kit.' }],
  ["Diplomat's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A chest with cases for maps and scrolls, fine clothes, ink, a pen, a lamp, oil, paper, perfume, sealing wax, and soap.' }]
];
// 5e list prices in gp: a character who leaves an item out of their starting kit gets this much back
var STARTER_GP = { Club: 0.1, Dagger: 2, Greatclub: 0.2, Handaxe: 5, Javelin: 0.5, 'Light Hammer': 2, Mace: 5, Quarterstaff: 0.2, Sickle: 1, Spear: 1, 'Light Crossbow': 25, Dart: 0.05,
  Shortbow: 25, Sling: 0.1, Battleaxe: 10, Flail: 10, Glaive: 20, Greataxe: 30, Greatsword: 50, Halberd: 20, Lance: 10, Longsword: 15, Maul: 10, Morningstar: 15, Pike: 5, Rapier: 25,
  Scimitar: 25, Shortsword: 10, Trident: 5, 'War Pick': 5, Warhammer: 15, Whip: 2, 'Hand Crossbow': 75, 'Heavy Crossbow': 50, Longbow: 50, 'Padded Armor': 5, 'Leather Armor': 10,
  'Studded Leather': 45, 'Hide Armor': 10, 'Chain Shirt': 50, 'Scale Mail': 50, 'Ring Mail': 30, Breastplate: 400, 'Chain Mail': 75, 'Half Plate': 750, 'Splint Armor': 200,
  'Plate Armor': 1500, Shield: 10, 'Wooden Shield': 10, Arrows: 1, Bolts: 1, 'Arcane Focus': 10, 'Holy Symbol': 5, 'Druidic Focus': 1, Spellbook: 50, "Thieves' Tools": 25, Lute: 35,
  "Dungeoneer's Pack": 12, "Burglar's Pack": 16, "Priest's Pack": 19, "Scholar's Pack": 40, "Entertainer's Pack": 40, "Diplomat's Pack": 39 };
STARTER.forEach(function (x) {
  var e = x[6] || {}, b = { n: x[0], cat: x[1], lv: 1, pr: x[4], sp: x[4], r: 'Common', mats: x[5], starter: 1, dc: x[2], dm: x[3],
    ds: e.ds || ('A plain ' + x[0].toLowerCase() + ', the kind a new adventurer starts with.' + (x[2] ? ' It deals ' + x[2] + ' ' + x[3].toLowerCase() + ' damage.' : '') + (e.ac ? ' It gives +' + e.ac + ' AC.' : '') + (e.q ? ' A bundle of ' + e.q + '.' : '')) };
  ['slot', 'ac', 'cap', 'carry'].forEach(function (k) { if (e[k] != null) b[k] = e[k]; });
  if (STARTER_GP[x[0]] != null) b.gp = STARTER_GP[x[0]];
  if (e.cap) b.ds += ' Holds ' + e.cap + ' items on top of the 20 a character can carry.';
  NEW.push(b);
});

NEW.forEach(function (b) { if (b.n === "Explorer's Pack") b.gp = 10; if (b.n === 'Backpack') b.gp = 2; });

module.exports = {
  NEW: NEW,
  TOOLS: {
    "Harvester's Knife": { kit: ['cover', 'meat', 'fat', 'other'] },
    'Gutting Hook': { kit: ['organ', 'eye', 'brain', 'meat', 'other'] },
    'Hide Scraper': { kit: ['cover'] },
    'Bone Saw': { kit: ['hard'] },
    'Bone Saw Kit': { kit: ['hard'], kb: 1 },
    'Fang Pliers': { kit: ['hard'] },
    'Dragon-Flensing Set': { kit: ['cover', 'hard'], kb: 1 },
    'Dragon-Hide Flensing Blades': { kit: ['cover'], kb: 1 },
    'Fiend-Rendering Knife': { kit: ['cover', 'hard', 'meat', 'fat', 'other'], kb: 2 },
    'Master Harvesting Kit': { kit: ALL.concat(['blood', 'gland']), kb: 2 },
    'Blood Siphon': { kit: ['blood'], kb: 1 },
    'Sample Jars': { kit: ['gland', 'organ', 'eye'] },
    'Preserving Salts Kit': { kit: ['organ', 'eye', 'brain'] },
    'Venom Extractor': { kit: ['gland'], kb: 1 },
    'Spirit Jar': { kit: ['essence'] },
    'Spirit-Bottling Kit': { kit: ['essence'], kb: 1 },
    'Ghost-Light Lantern': { kit: ['essence'] },
    "Godfall Excavator's Kit": { kit: ALL.concat(['blood', 'gland', 'essence']), kb: 3 },
    'Monster Field Guide': { kg: 2, kr: ['Human'] },
    'Monster Atlas': { kg: 2, kr: ['Mysterious', 'Hell'] },
    'Ore Pick': { mine: 1 }
  },
  STORE: { 'Scrap Sack': [6, 1], 'Realm-Sealed Satchel': [8, 1], 'Fey-Proof Satchel': [8, 1], "Master Scavenger's Coat": [20, 1] },
  // rune fragments: materials, so they can be carried, traded, and used in a blueprint
  FRAGMENTS: [
    { n: 'Fragment of Space', rune: 'Space', ds: 'A sliver of the Space Rune: a knot of folded room that fits in a palm. The Space Rune is held by Infinatas alone, so a Fragment of Space exists only where he has given one. Bound into a Bag of Holding, each one adds 10 items of room.', src: 'A gift of Infinatas' },
    { n: 'Fragment of Void', rune: 'Void', ds: 'A sliver of the Void Rune: a chip of nothing that light falls into. Whatever touches its open face is unmade. Used to turn a Bag of Holding into a Bag of Void.', src: 'Given by a god who holds the Void Rune, or torn from a Void-touched creature at great risk' },
    { n: 'Fragment of Time', rune: 'Time', ds: 'A sliver of the Time Rune that ticks faintly against the skin. Given by a god who holds Time (Cronus, Mani, Khonsu, Kali, or Xiuhtecuhtli), usually for a great service.', src: 'A gift of a god who holds the Time Rune' }
  ]
};
