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
  // tools that are weapons too (each has a general Blueprint in the Forge)
  ['Shovel', 'Hammer', '1d8', 'Bludgeoning', 'Blacksmithing', ['Iron', 'Oak'], { ds: 'A spade on a long handle. It digs a trench or a grave, and swings for 1d8 bludgeoning damage.' }],
  ['Pickaxe', 'Hammer', '1d8', 'Piercing', 'Blacksmithing', ['Iron', 'Oak'], { ds: 'A miner\'s pick. It digs ore, gems, and stone from a vein, and swings two-handed for 1d8 piercing damage.' }],
  // armor: FAND armor adds a little AC to a base of 0
  ['Padded Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '1' }], ['Leather Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '2' }],
  ['Studded Leather', 'Armor', '', '', 'Tailoring', ['Leather', 'Iron'], { slot: 'Body', ac: '2' }], ['Hide Armor', 'Armor', '', '', 'Tailoring', ['Leather'], { slot: 'Body', ac: '3' }],
  ['Chain Shirt', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '3' }], ['Scale Mail', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '4' }],
  ['Ring Mail', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '3' }], ['Breastplate', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '4' }],
  ['Chain Mail', 'Armor', '', '', 'Blacksmithing', ['Iron'], { slot: 'Body', ac: '5', covers: ['Body', 'Shoulders'] }], ['Half Plate', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '5', covers: ['Body', 'Shoulders'] }],
  ['Splint Armor', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '6', covers: ['Body', 'Shoulders', 'Back'] }], ['Plate Armor', 'Armor', '', '', 'Blacksmithing', ['Iron', 'Leather'], { slot: 'Body', ac: '7', covers: ['Body', 'Shoulders', 'Back', 'Hands'] }],
  ['Shield', 'Shield', '', '', 'Blacksmithing', ['Iron', 'Oak'], { slot: 'Shield', ac: '1' }], ['Wooden Shield', 'Shield', '', '', 'Carving', ['Oak', 'Leather'], { slot: 'Shield', ac: '1' }],
  // ammunition, foci, tools, instruments, packs
  ['Arrows', 'Ammunition', '', '', 'Carving', ['Oak', 'Feathers'], { q: 20 }], ['Bolts', 'Ammunition', '', '', 'Carving', ['Oak', 'Iron'], { q: 20 }],
  ['Arcane Focus', 'Focus', '', '', 'Enchanting', ['Crystal'], { ds: 'A crystal, orb, rod, staff, or wand that channels arcane spells.' }],
  ['Holy Symbol', 'Focus', '', '', 'Enchanting', ['Silver'], { ds: 'An amulet, emblem, or reliquary bearing a god\'s symbol; a focus for divine spells.' }],
  ['Druidic Focus', 'Focus', '', '', 'Carving', ['Oak'], { ds: 'A sprig of mistletoe, a totem, a yew wand, or a wooden staff; a focus for druid spells.' }],
  ['Spellbook', 'Book', '', '', 'Tailoring', ['Leather'], { ds: 'A leather-bound book of 100 blank pages where a wizard writes the spells they know.' }],
  ["Thieves' Tools", 'Tool', '', '', 'Blacksmithing', ['Iron', 'Leather'], { ds: 'Picks, a small file, a mirror on a handle, and narrow scissors, for locks and traps.' }],
  ['Lute', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A stringed instrument for any bard.' }],
  // the rest of the bard's instruments (owner's request, 2026-11-04): each is a spellcasting focus for a bard
  ['Bagpipes', 'Instrument', '', '', 'Tailoring', ['Leather', 'Oak'], { ds: 'A leather bag and drone pipes. Loud enough to carry across a battlefield; a bard\'s spellcasting focus.' }],
  ['Drum', 'Instrument', '', '', 'Carving', ['Oak', 'Leather'], { ds: 'A wooden shell with a hide head. Heard 300 feet away; a bard\'s spellcasting focus.' }],
  ['Dulcimer', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A flat box of strings struck with small hammers; a bard\'s spellcasting focus.' }],
  ['Flute', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A wooden flute; a bard\'s spellcasting focus.' }],
  ['Horn', 'Instrument', '', '', 'Blacksmithing', ['Iron'], { ds: 'A brass horn. Heard a mile away; a bard\'s spellcasting focus.' }],
  ['Lyre', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A small harp-like frame of strings; a bard\'s spellcasting focus.' }],
  ['Pan Flute', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A row of reed pipes bound together; a bard\'s spellcasting focus.' }],
  ['Shawm', 'Instrument', '', '', 'Carving', ['Oak'], { ds: 'A double-reed pipe with a piercing voice; a bard\'s spellcasting focus.' }],
  ['Viol', 'Instrument', '', '', 'Carving', ['Oak', 'Leather'], { ds: 'A bowed, stringed instrument; a bard\'s spellcasting focus.' }],
  ["Dungeoneer's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a crowbar, a hammer, 10 pitons, 10 torches, a tinderbox, 10 days of rations, a waterskin, and 50 feet of rope.' }],
  ["Burglar's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with ball bearings, string, a bell, candles, a crowbar, a hammer, pitons, a hooded lantern, oil, rations, a tinderbox, a waterskin, and 50 feet of rope.' }],
  ["Priest's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a blanket, candles, a tinderbox, an alms box, incense, a censer, vestments, rations, and a waterskin.' }],
  ["Scholar's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a book of lore, ink, an ink pen, 10 sheets of parchment, a little bag of sand, and a small knife.' }],
  ["Entertainer's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A backpack with a bedroll, two costumes, candles, rations, a waterskin, and a disguise kit.' }],
  ["Diplomat's Pack", 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 10, carry: 1, ds: 'A chest with cases for maps and scrolls, fine clothes, ink, a pen, a lamp, oil, paper, perfume, sealing wax, and soap.' }],
  // the everyday gear every table expects (owner's request, 2026-11-23: "component bags are not there ... look for similar holes")
  // bags and cases: each holds a few things on top of what its owner can carry
  ['Component Pouch', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 5, carry: 1, cpouch: 1, ds: 'A watertight belt pouch of little compartments for spell components: bat guano, a pinch of sulfur, a bit of fleece. It holds 5 small things on top of what you carry, and a spellcaster can cast through it as a plain focus: +1 spell damage per 10 levels of the pouch, but none of a true focus\'s Accuracy or school edge. Spells that name a costly component still need that component.' }],
  ['Quiver', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 3, carry: 1, ds: 'A leather quiver worn at the hip or back. It holds 3 stacks of arrows or bolts (60) on top of what you carry, and they come out fast enough to draw as part of an attack.' }],
  ['Scroll Case', 'Storage', '', '', 'Carving', ['Bone', 'Leather'], { cap: 4, carry: 1, ds: 'A capped bone tube for scrolls and maps. It holds 4 of them on top of what you carry, and keeps them dry and uncreased.' }],
  ['Potion Belt', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 4, carry: 1, ds: 'A belt of padded loops for vials. It holds 4 stacks of potions on top of what you carry, and drinking one from it takes a bonus action instead of an action.' }],
  ['Bandolier', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 3, carry: 1, ds: 'A shoulder strap of loops and pockets for darts, daggers, sling bullets or flasks. It holds 3 stacks on top of what you carry.' }],
  ['Sack', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 3, carry: 1, ds: 'A plain cloth sack with a drawstring. It holds 3 things on top of what you carry, but anything fragile inside breaks if you fall.' }],
  // tools and kits
  ["Healer's Kit", 'Tool', '', '', 'Alchemy', ['Leather'], { ds: 'A pouch of bandages, salves and splints with 10 uses. Spend a use to stabilize a creature at 0 hit points without a check; spend one during a short rest and the patient regains an extra 1d4 hit points.' }],
  ['Herbalism Kit', 'Tool', '', '', 'Alchemy', ['Leather', 'Iron'], { ds: 'Clippers, a mortar and pestle, pouches and vials for gathering and drying herbs. +2 to foraging rolls, and it is what makes healing potions and antitoxin.' }],
  ["Alchemist's Supplies", 'Tool', '', '', 'Alchemy', ['Crystal', 'Iron'], { ds: 'Glass beakers, a metal frame, a small burner and tongs. An alchemist needs them to brew, and +2 to rolls to identify a potion or poison.' }],
  ["Poisoner's Kit", 'Tool', '', '', 'Alchemy', ['Crystal', 'Leather'], { ds: 'Vials, a mortar and pestle, gloves and a strainer for harvesting and preparing poisons. +2 to rolls to make, identify or apply poison.' }],
  ['Disguise Kit', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'Cosmetics, hair dye, small props and a few pieces of clothing. +2 to checks to pass yourself off as someone else.' }],
  ['Forgery Kit', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'Papers, inks, seals, sealing wax, gold and silver leaf and fine pens for copying a document or a hand. +2 to rolls to make or spot a forgery.' }],
  ["Navigator's Tools", 'Tool', '', '', 'Engineering', ['Brass', 'Leather'], { ds: 'A sextant, a compass, calipers, a ruler and charts. With them you can\'t get lost at sea or in open country on a clear night, and +2 to Survival rolls to find your way.' }],
  ["Climber's Kit", 'Tool', '', '', 'Blacksmithing', ['Iron', 'Leather'], { ds: 'Pitons, boot tips, gloves and a harness. While it is anchored you can\'t fall more than 25 feet, and you can\'t move more than 25 feet from where you anchored it without undoing it.' }],
  ["Smith's Tools", 'Tool', '', '', 'Blacksmithing', ['Iron', 'Oak'], { ds: 'Hammers, tongs, a file and a whetstone. A blacksmith needs them to work metal away from a forge, and they repair a damaged weapon or armor during a long rest.' }],
  ["Tinker's Tools", 'Tool', '', '', 'Engineering', ['Iron', 'Brass'], { ds: 'Small hand tools, thread, needles, a whetstone, cloth, leather and glue for mending everyday things. They repair a broken object during a short rest.' }],
  ["Cook's Utensils", 'Tool', '', '', 'Cooking', ['Iron', 'Oak'], { ds: 'A pot, knives, forks, a stirring spoon and a ladle. A cook needs them to make meals on the road, and a meal made with them at a short rest gives everyone who eats it 1 extra hit point per hit die they spend.' }],
  ['Fishing Tackle', 'Tool', '', '', 'Carving', ['Oak', 'Iron'], { ds: 'A rod, silk line, cork floats, hooks, sinkers and lures. +2 to Survival rolls to catch fish, and a day of fishing feeds two.' }],
  ['Mess Kit', 'Tool', '', '', 'Blacksmithing', ['Tin'], { ds: 'A tin box with a cup and cutlery. It opens out into a frying pan and a plate.' }],
  ['Tinderbox', 'Tool', '', '', 'Blacksmithing', ['Iron', 'Flint'], { ds: 'Flint, fire steel and tinder in a small box. Lighting a torch or anything else easy to burn takes an action; lighting anything else takes a minute.' }],
  ['Bedroll', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'A rolled blanket and pad. Sleeping on bare ground without one, a long rest gives back only half the usual hit dice.' }],
  ['Tent', 'Tool', '', '', 'Tailoring', ['Leather', 'Oak'], { ds: 'A two-person canvas shelter. Inside it you are sheltered from rain, snow and wind for a rest.' }],
  ['Waterskin', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'A leather skin that holds 4 pints of water: a day\'s drinking for one.' }],
  ['Torch', 'Tool', '', '', 'Carving', ['Oak'], { ds: 'Burns for 1 hour, giving bright light for 20 feet and dim light for 20 more. Used as a weapon it deals 1 fire damage.' }],
  ['Hooded Lantern', 'Tool', '', '', 'Blacksmithing', ['Iron', 'Crystal'], { ds: 'Burns a flask of oil for 6 hours: bright light for 30 feet and dim light for 30 more. Lowering the hood cuts it to dim light for 5 feet.' }],
  ['Hempen Rope', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: '50 feet of rope. It holds 1,000 pounds and can be burst with a DC 17 Strength check.' }],
  ['Silk Rope', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: '50 feet of light silk rope, half the weight of hemp. It holds 1,000 pounds and can be burst with a DC 17 Strength check.' }],
  ['Pitons', 'Tool', '', '', 'Blacksmithing', ['Iron'], { ds: 'Ten iron spikes for hammering into rock to hold a rope.' }],
  ['Hunting Trap', 'Tool', '', '', 'Blacksmithing', ['Iron'], { ds: 'A sawtoothed steel jaw. A creature that steps on it makes a DC 13 Dexterity save or takes 1d4 piercing damage and stops moving; escaping takes a DC 13 Strength check.' }],
  ['Ball Bearings', 'Tool', '', '', 'Blacksmithing', ['Iron'], { ds: 'A bag of 1,000 tiny metal balls. Spilled, they cover a 10-foot square: anyone moving across it makes a DC 10 Dexterity save or falls prone.' }],
  ['Caltrops', 'Tool', '', '', 'Blacksmithing', ['Iron'], { ds: 'A bag of four-pointed spikes that cover a 5-foot square. A creature entering it makes a DC 15 Dexterity save or takes 1 piercing damage and moves 10 feet slower until healed.' }],
  ['Block and Tackle', 'Tool', '', '', 'Engineering', ['Iron', 'Oak'], { ds: 'Pulleys, a cable and a hook. With them you can lift four times the weight you normally could.' }],
  ['Magnifying Glass', 'Tool', '', '', 'Engineering', ['Crystal', 'Brass'], { ds: 'A ground lens in a brass rim. Advantage on checks to appraise or examine a small or detailed object, and it can light a fire in bright sun.' }],
  ['Spyglass', 'Tool', '', '', 'Engineering', ['Crystal', 'Brass'], { ds: 'Objects seen through it look twice as close.' }],
  ['Abacus', 'Tool', '', '', 'Carving', ['Oak', 'Bone'], { ds: 'A frame of beads for counting. +2 to checks to keep accounts or find a mistake in them.' }],
  ['Signet Ring', 'Tool', '', '', 'Blacksmithing', ['Gold'], { ds: 'A ring carved with a family\'s or guild\'s seal, for pressing into wax.' }],
  ['Playing Cards', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'A deck of cards for games of chance and skill.' }],
  ['Dice Set', 'Tool', '', '', 'Carving', ['Bone'], { ds: 'A set of bone dice for games of chance.' }],
  ['Holy Water', 'Potion', '', '', 'Alchemy', ['Silver'], { ds: 'A flask of water blessed by a cleric. Thrown (20 ft), it deals 2d6 radiant damage to a fiend or undead it hits.' }],
  ['Sling Bullets', 'Ammunition', '', '', 'Blacksmithing', ['Lead'], { q: 20 }],
  // the rest of the everyday ammunition and the gear that goes with it (owner's request, 2026-11-23: "add more arrowhead ... make sure there is no gaps")
  ['Blowgun Needles', 'Ammunition', '', '', 'Blacksmithing', ['Iron'], { q: 50 }], ['Firearm Shot', 'Ammunition', '', '', 'Blacksmithing', ['Lead'], { q: 20, ds: 'Twenty lead balls with wadding, for a musket, pistol, arquebus or hand cannon. A firearm also needs a Powder Horn.' }],
  ['Ballista Bolts', 'Ammunition', '', '', 'Carving', ['Oak', 'Iron'], { q: 5, ds: 'Five iron-headed bolts as long as a spear, for a ballista or a scorpion.' }], ['Arrowheads', 'Ammunition', '', '', 'Blacksmithing', ['Iron'], { q: 20, ds: 'Twenty loose iron arrowheads. Fit them to plain shafts with Fletcher\'s Tools (an hour for twenty) to make arrows.' }],
  ['Bolt Case', 'Storage', '', '', 'Tailoring', ['Leather'], { cap: 2, carry: 1, ds: 'A stiff leather case for crossbow bolts, worn at the belt. It holds 2 stacks of bolts (40) on top of what you carry.' }],
  ["Fletcher's Tools", 'Tool', '', '', 'Carving', ['Iron', 'Feathers'], { ds: 'A knife, glue, thread, a fletching jig and a bundle of feathers. A fletcher needs them to make and mend arrows and bolts, and to fit new arrowheads.' }],
  ['Spare Bowstrings', 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'Three waxed bowstrings in a pouch. Restringing a bow takes an action; a snapped string without a spare ends the bow\'s fight.' }],
  ['Powder Horn', 'Tool', '', '', 'Carving', ['Leather'], { ds: 'A sealed horn of black powder, enough for 20 shots. A firearm can\'t fire without powder, and wet powder won\'t light.' }],
  // the rest of the artisan's tools, each tied to the profession that uses it
  ["Brewer's Supplies", 'Tool', '', '', 'Cooking', ['Oak', 'Copper'], { ds: 'A copper kettle, a mash tun, tubing and siphons. With them a cook brews ale and spirits, and can tell spoiled or poisoned drink by taste.' }],
  ["Calligrapher's Supplies", 'Tool', '', '', 'Tailoring', ['Leather'], { ds: 'Fine inks, quills and parchment. +2 to rolls to write a document that looks right, or to read a faded or coded one.' }],
  ["Carpenter's Tools", 'Tool', '', '', 'Carving', ['Iron', 'Oak'], { ds: 'A saw, a hammer, nails, a hatchet, a square and a plane. A carver needs them to build or mend wooden things away from a workshop.' }],
  ["Cartographer's Tools", 'Tool', '', '', 'Navigation', ['Brass', 'Leather'], { ds: "Quills, ink, parchment, compasses and calipers. +2 to rolls to map a place you have walked or to read a map's mistakes." }],
  ["Cobbler's Tools", 'Tool', '', '', 'Tailoring', ['Iron', 'Leather'], { ds: 'A hammer, an awl, a knife, a shoe stand and thread. Boots mended with them on a long rest let their wearer travel a day longer before a forced-march check.' }],
  ["Glassblower's Tools", 'Tool', '', '', 'Engineering', ['Iron'], { ds: 'A blowpipe, a marver, blocks and tweezers. They make vials, lenses and glass components.' }],
  ["Jeweler's Tools", 'Tool', '', '', 'Blacksmithing', ['Iron', 'Brass'], { ds: 'A small saw and hammer, files, pliers and tweezers. +2 to rolls to appraise or set a gem, and needed to cut one.' }],
  ["Leatherworker's Tools", 'Tool', '', '', 'Tailoring', ['Iron', 'Leather'], { ds: 'A knife, a mallet, an edger, a hole punch and thread. A tailor needs them to work hide away from a workshop.' }],
  ["Mason's Tools", 'Tool', '', '', 'Engineering', ['Iron'], { ds: 'A trowel, a hammer, a chisel, brushes and a square. They build and mend stonework, and +2 to rolls to spot a weak wall or a hidden door in stone.' }],
  ["Painter's Supplies", 'Tool', '', '', 'Tailoring', ['Oak', 'Leather'], { ds: 'An easel, canvas, paints, brushes and charcoal. +2 to rolls to copy a likeness or a heraldic device.' }],
  ["Potter's Tools", 'Tool', '', '', 'Carving', ['Oak'], { ds: "Potter's needles, ribs, scrapers, a knife and calipers. They make jars, pots and clay components." }],
  ["Weaver's Tools", 'Tool', '', '', 'Tailoring', ['Oak'], { ds: 'A spindle, thread and needles, and a small loom. They make and mend cloth.' }],
  ["Woodcarver's Tools", 'Tool', '', '', 'Carving', ['Iron', 'Oak'], { ds: 'A knife, a gouge and a small saw. A carver needs them to shape arrows, bows and small wooden things.' }]
];
// 5e list prices in gp: a character who leaves an item out of their starting kit gets this much back
var STARTER_GP = { Club: 0.1, Dagger: 2, Greatclub: 0.2, Handaxe: 5, Javelin: 0.5, 'Light Hammer': 2, Mace: 5, Quarterstaff: 0.2, Sickle: 1, Spear: 1, 'Light Crossbow': 25, Dart: 0.05,
  Shortbow: 25, Sling: 0.1, Battleaxe: 10, Flail: 10, Glaive: 20, Greataxe: 30, Greatsword: 50, Halberd: 20, Lance: 10, Longsword: 15, Maul: 10, Morningstar: 15, Pike: 5, Rapier: 25,
  Scimitar: 25, Shortsword: 10, Trident: 5, 'War Pick': 5, Warhammer: 15, Whip: 2, 'Hand Crossbow': 75, 'Heavy Crossbow': 50, Longbow: 50, 'Padded Armor': 5, 'Leather Armor': 10,
  'Studded Leather': 45, 'Hide Armor': 10, 'Chain Shirt': 50, 'Scale Mail': 50, 'Ring Mail': 30, Breastplate: 400, 'Chain Mail': 75, 'Half Plate': 750, 'Splint Armor': 200,
  'Plate Armor': 1500, Shovel: 2, Pickaxe: 2, Shield: 10, 'Wooden Shield': 10, Arrows: 1, Bolts: 1, 'Arcane Focus': 10, 'Holy Symbol': 5, 'Druidic Focus': 1, Spellbook: 50, "Thieves' Tools": 25, Lute: 35, Bagpipes: 30, Drum: 6, Dulcimer: 25, Flute: 2, Horn: 3, Lyre: 30, 'Pan Flute': 12, Shawm: 2, Viol: 30,
"Component Pouch": 25, Quiver: 1, 'Scroll Case': 1, 'Potion Belt': 2, Bandolier: 1, Sack: 0.01, "Healer's Kit": 5, 'Herbalism Kit': 5, "Alchemist's Supplies": 50,
  "Poisoner's Kit": 50, 'Disguise Kit': 25, 'Forgery Kit': 15, "Navigator's Tools": 25, "Climber's Kit": 25, "Smith's Tools": 20, "Tinker's Tools": 50, "Cook's Utensils": 1,
  'Fishing Tackle': 1, 'Mess Kit': 0.2, Tinderbox: 0.5, Bedroll: 1, Tent: 2, Waterskin: 0.2, Torch: 0.01, 'Hooded Lantern': 5, 'Hempen Rope': 1, 'Silk Rope': 10, Pitons: 0.5,
  'Hunting Trap': 5, 'Ball Bearings': 1, Caltrops: 1, 'Block and Tackle': 1, 'Magnifying Glass': 100, Spyglass: 1000, Abacus: 2, 'Signet Ring': 5, 'Playing Cards': 0.5,
  'Dice Set': 0.1, 'Holy Water': 25, 'Sling Bullets': 0.04, 'Blowgun Needles': 1, 'Firearm Shot': 3, 'Ballista Bolts': 5, Arrowheads: 0.5, 'Bolt Case': 1, "Fletcher's Tools": 15, 'Spare Bowstrings': 1, 'Powder Horn': 3,
  "Brewer's Supplies": 20, "Calligrapher's Supplies": 10, "Carpenter's Tools": 8, "Cartographer's Tools": 15, "Cobbler's Tools": 5, "Glassblower's Tools": 30, "Jeweler's Tools": 25, "Leatherworker's Tools": 5, "Mason's Tools": 10, "Painter's Supplies": 10, "Potter's Tools": 10, "Weaver's Tools": 1, "Woodcarver's Tools": 1,
  "Dungeoneer's Pack": 12, "Burglar's Pack": 16, "Priest's Pack": 19, "Scholar's Pack": 40, "Entertainer's Pack": 40, "Diplomat's Pack": 39 };
STARTER.forEach(function (x) {
  var e = x[6] || {}, b = { n: x[0], cat: x[1], lv: 1, pr: x[4], sp: x[4], r: 'Common', mats: x[5], starter: 1, dc: x[2], dm: x[3],
    ds: e.ds || ('A plain ' + x[0].toLowerCase() + ', the kind a new adventurer starts with.' + (x[2] ? ' It deals ' + x[2] + ' ' + x[3].toLowerCase() + ' damage.' : '') + (e.ac ? ' It gives +' + e.ac + ' AC.' : '') + (e.q ? ' A bundle of ' + e.q + '.' : '')) };
  ['slot', 'ac', 'cap', 'carry', 'covers', 'cpouch', 'q'].forEach(function (k) { if (e[k] != null) b[k] = e[k]; });
  if (STARTER_GP[x[0]] != null) b.gp = STARTER_GP[x[0]];
  if (e.covers) b.ds += ' A full suit: it covers the ' + e.covers.join(', ').replace(/, ([^,]*)$/, ' and $1') + ' slots, so other armor in those slots adds no AC on top.';
  if (e.cap) b.ds += ' Holds ' + e.cap + ' items on top of the 20 a character can carry.';
  NEW.push(b);
});

// the Back piece of the iron set (Iron Armour, Helm, Gauntlets, Greaves, Pauldrons), so a full set of iron gear reaches
// the 10 AC the Armor Class rules promise (Body 4, Head 2, Hands 1, Feet 1, Shoulders 1, Back 1)
NEW.push({ n: 'Iron Mantle', cat: 'Armor', lv: 1, pr: 'Blacksmithing', sp: 'Blacksmithing', r: 'Common', mats: ['Iron'], slot: 'Back', ac: '1',
  ds: 'A short cape of riveted iron scales hung from the shoulders, guarding the back and the spine. It completes a set of iron armour.' });
// music gear and magic instruments for bards (owner's request, 2026-11-04). The magic instruments are spellcasting foci too:
// their Item Level sets the focus bonus, and their kind of instrument sets the focus's buff (see the Rules, Spellcasting focus).
[
  { n: 'Songbook', cat: 'Book', lv: 1, pr: 'Tailoring', r: 'Common', mats: ['Leather'], gp: 25, ds: 'A bound book of staves and lyrics with room for 30 songs. A bard who studies a song in it during a long rest can perform it from memory afterwards.' },
  { n: 'Tuning Fork', cat: 'Tool', lv: 2, pr: 'Blacksmithing', r: 'Common', mats: ['Iron'], gp: 5, ds: 'A two-pronged fork that rings true. Struck before a performance, it gives +1 to the next Performance check. Tuned forks keyed to a realm are how planar travellers find a way across.' },
  { n: 'Spare Strings and Rosin', cat: 'Tool', lv: 1, pr: 'Tailoring', r: 'Common', mats: ['Leather'], gp: 1, ds: 'Gut strings, reeds, and a cake of rosin. Restrings or re-reeds a broken instrument in 10 minutes.' },
  { n: 'Instrument Case', cat: 'Storage', lv: 1, pr: 'Tailoring', r: 'Common', mats: ['Leather', 'Oak'], gp: 8, cap: 2, carry: 1, ds: 'A padded, hard-shelled case. Holds 2 instruments on top of the 20 items a character can carry; anything inside is safe from rain and falls.' },
  { n: 'Songbird Flute', cat: 'Instrument', lv: 3, pr: 'Carving', r: 'Uncommon', m: [['Human', 'W', 3], ['Human', 'B', 3]], ds: 'Carved with tiny birds. Once per long rest, cast Animal Friendship through it without a spell slot, and birds within a mile answer its call. A bard\'s spellcasting focus.' },
  { n: 'Siren-Gut Lyre', cat: 'Instrument', lv: 8, pr: 'Carving', r: 'Uncommon', m: [['Human', 'W', 7], ['Human', 'F', 7]], ds: 'Strung with the gut of a sea siren. A creature that saves against an Enchantment spell you cast through it has disadvantage on that first save. A bard\'s spellcasting focus.' },
  { n: 'Thunderhide War Drum', cat: 'Instrument', lv: 15, pr: 'Carving', r: 'Rare', m: [['Mysterious', 'F', 6], ['Mysterious', 'W', 6]], ds: 'While you play it (a bonus action each turn), allies within 60 feet who hear it add 1d4 to their initiative and to their first attack roll each round. A bard\'s spellcasting focus.' },
  { n: 'Hellbrass Horn', cat: 'Instrument', lv: 30, pr: 'Blacksmithing', r: 'Very Rare', m: [['Hell', 'O', 5], ['Hell', 'B', 5]], ds: 'A horn of brass forged in Hell. Once per short rest, blow it as an action: every enemy within 60 feet makes a Wisdom save against your spell save DC or is frightened for 1 minute. A bard\'s spellcasting focus.' },
  { n: 'Choir-of-Ash Harp', cat: 'Instrument', lv: 50, pr: 'Carving', r: 'Legendary', m: [['Abyss', 'B', 5], ['Abyss', 'F', 5]], ds: 'Its strings hum with a hundred voices. When you cast a Healing or Resonance spell through it that restores hit points, one more creature within 30 feet regains half as much. A bard\'s spellcasting focus.' },
  { n: 'Primordial Bell', cat: 'Instrument', lv: 80, pr: 'Blacksmithing', r: 'Artifact', m: [['Primordial', 'O', 5], ['Primordial', 'G', 5]], ds: 'A bell cast before the realms were divided. Once per long rest, ring it: everyone of your choice within 120 feet who can hear it ends one condition, and you take an extra turn right after this one. A bard\'s spellcasting focus.' }
].forEach(function (b) { b.sp = b.pr; NEW.push(b); });
// magic instruments in every realm (owner's request, 2026-11-05): a Lute, Lyre, Harp, Flute, Drum, and War Horn at each
// realm tier, levels 6 to 96. Each is made with its realm's instrument material (Virtuoso: bard spell Accuracy and save
// DCs), and like every instrument it is a bard's spellcasting focus; its kind sets the focus's buff.
(function () {
  var TIER = [
    // level, realm, word, Virtuoso material, rarity
    [6, 'Human', 'Songwood', 'Songwood', 'Uncommon'], [16, 'Mysterious', 'Echo', 'Echo Spruce', 'Uncommon'],
    [26, 'Heaven', 'Hymnal', 'Hymnal Cedar', 'Rare', 'Hell', 'Hellstrung', 'Hellstring Gut'], [36, 'Chaos', 'Wildchord', 'Wildchord Reed', 'Very Rare'],
    [46, 'Abyss', 'Pit-Siren', 'Pit-Siren Gut', 'Very Rare'], [56, 'Inner Realm', 'Resonant', 'Resonance Silver', 'Legendary'],
    [66, 'Outer Realm', 'Starchord', 'Starchord Silver', 'Legendary'], [76, 'Void', 'Void-Hum', 'Void-Hum Wire', 'Legendary'],
    [86, 'Inner Void', 'Last-Note', 'Last-Note Steel', 'Artifact'], [96, 'Primordial', 'First-Song', 'First-Song Heartwood', 'Artifact']];
  var INST = [
    // instrument, profession, second material type, what it does in the hand, uses the second realm of a split tier
    ['Lute', 'Carving', 'F', 'Its strings carry a spell farther into a listener\'s heart.', 0], ['Lyre', 'Carving', 'F', 'Its clear voice makes a charm hard to shake.', 0],
    ['Harp', 'Carving', 'F', 'Its notes reach the wounded from across a room.', 0], ['Flute', 'Carving', 'B', 'Its call carries a spell over a great distance.', 1],
    ['Drum', 'Carving', 'F', 'Its beat spreads a spell wide.', 1], ['War Horn', 'Blacksmithing', 'B', 'Its blast rolls out across a battlefield.', 1]];
  TIER.forEach(function (t, k) {
    INST.forEach(function (x) {
      var hell = x[4] && t[5], realm = hell ? t[5] : t[1], word = hell ? t[6] : t[2], mat = hell ? t[7] : t[3];
      NEW.push({ n: word + ' ' + x[0], cat: 'Instrument', lv: t[0], pr: x[1], sp: x[1], r: t[4], mats: [mat],
        ds: 'A ' + x[0].toLowerCase() + ' made with ' + mat + ' of the ' + realm + (/Realm$/.test(realm) ? '. ' : ' Realm. ') + x[3] + ' A bard\'s spellcasting focus: its level sets the focus bonus, its kind sets the focus\'s buff, and its ' + mat + ' gives Virtuoso (bard spell Accuracy and save DCs).' });
    });
  });
})();
// class focuses in every realm (owner's request, 2026-11-10): for each caster family two kinds of focus at each realm tier,
// levels 6 to 96, made with that realm's class focus material (Devout, Wildbound, Bloodspark, Pactbound, Arcanist).
(function () {
  var REALMS = [[6, 'Human', 'Uncommon'], [16, 'Mysterious', 'Uncommon'], [26, 'Heaven', 'Rare', 'Hell'], [36, 'Chaos', 'Very Rare'],
    [46, 'Abyss', 'Very Rare'], [56, 'Inner Realm', 'Legendary'], [66, 'Outer Realm', 'Legendary'], [76, 'Void', 'Legendary'],
    [86, 'Inner Void', 'Artifact'], [96, 'Primordial', 'Artifact']];
  var FAMS = [
    // property, who, [focus, profession, use the second realm of a split tier], materials and words by realm
    ['Devout', 'cleric and paladin', [['Holy Symbol', 'Enchanting', 0], ['Amulet', 'Enchanting', 1]],
      { Human: ['Votive Silver', 'Votive'], Mysterious: ['Dawnpetal Pearl', 'Dawnpetal'], Hell: ['Penitent Iron', 'Penitent'], Heaven: ['Choirstone', 'Choirsung'],
        Chaos: ['Pilgrim Glass', 'Pilgrim'], Abyss: ['Absolution Salt', 'Absolving'], 'Inner Realm': ['Covenant Gold', 'Covenant'], 'Outer Realm': ['Haloed Quartz', 'Haloed'],
        Void: ['Vigil Ember', 'Vigil'], 'Inner Void': ['Last-Rite Bone', 'Last-Rite'], Primordial: ['First-Prayer Amber', 'First-Prayer'] }],
    ['Wildbound', 'druid and ranger', [['Totem', 'Carving', 0], ['Staff', 'Carving', 1]],
      { Human: ['Hearthoak Burl', 'Hearthoak'], Mysterious: ['Fairy-Ring Cap', 'Fairy-Ring'], Hell: ['Cinder-Root', 'Cinder-Root'], Heaven: ['Edenbark', 'Edenbark'],
        Chaos: ['Wildmoss Knot', 'Wildmoss'], Abyss: ['Pit-Thorn', 'Pit-Thorn'], 'Inner Realm': ['Lawgrove Ash', 'Lawgrove'], 'Outer Realm': ['Comet-Seed', 'Comet-Seed'],
        Void: ['Void-Lichen', 'Lichen'], 'Inner Void': ['Hollow Antler', 'Hollow-Antler'], Primordial: ['Elder Taproot', 'Elder-Root'] }],
    ['Bloodspark', 'sorcerer', [['Crystal', 'Enchanting', 0], ['Orb', 'Enchanting', 1]],
      { Human: ['Bloodruby', 'Bloodruby'], Mysterious: ['Glamour Opal', 'Glamour'], Hell: ['Brimstone Garnet', 'Brimstone'], Heaven: ['Seraph Spinel', 'Seraph'],
        Chaos: ['Wildsurge Geode', 'Wildsurge'], Abyss: ['Demonheart Jet', 'Demonheart'], 'Inner Realm': ['Lineage Topaz', 'Lineage'], 'Outer Realm': ['Starborn Beryl', 'Starborn'],
        Void: ['Null-Spark Shard', 'Null-Spark'], 'Inner Void': ['Riftblood Garnet', 'Riftblood'], Primordial: ['Dragonsire Ruby', 'Dragonsire'] }],
    ['Pactbound', 'warlock', [['Rod', 'Enchanting', 0], ['Scepter', 'Enchanting', 1]],
      { Human: ['Oathbound Onyx', 'Oathbound'], Mysterious: ['Bargain Moonstone', 'Bargain'], Hell: ['Contract Brass', 'Contract'], Heaven: ['Martyr-Seal Gold', 'Martyr-Seal'],
        Chaos: ['Fickle Obsidian', 'Fickle'], Abyss: ['Debt-Iron', 'Debt-Iron'], 'Inner Realm': ['Clause Silver', 'Clause'], 'Outer Realm': ['Farstar Jet', 'Farstar'],
        Void: ['Whisper-Void Pearl', 'Whisper-Void'], 'Inner Void': ['Patron-Eye Stone', 'Patron-Eye'], Primordial: ['First-Pact Obsidian', 'First-Pact'] }],
    ['Arcanist', 'wizard and artificer', [['Wand', 'Carving', 0], ['Tome', 'Enchanting', 1]],
      { Human: ['Scribe Ash', 'Scribe-Ash'], Mysterious: ['Moonvellum', 'Moonvellum'], Hell: ['Ashscript Ink', 'Ashscript'], Heaven: ['Gloria Vellum', 'Gloria'],
        Chaos: ['Shifting Ink', 'Shifting'], Abyss: ['Abyssal Vellum', 'Abyssal'], 'Inner Realm': ['Theorem Silver', 'Theorem'], 'Outer Realm': ['Starlight Ink', 'Starlight'],
        Void: ['Blank-Rune Slate', 'Blank-Rune'], 'Inner Void': ['Unwritten Paper', 'Unwritten'], Primordial: ['First-Word Slate', 'First-Word'] }]];
  FAMS.forEach(function (F) {
    REALMS.forEach(function (t) {
      F[2].forEach(function (x) {
        var realm = x[2] && t[3] ? t[3] : t[1], M = F[3][realm], mat = M[0];
        NEW.push({ n: M[1] + ' ' + x[0], cat: 'Focus', lv: t[0], pr: x[1], sp: x[1], r: t[2], mats: [mat],
          ds: 'A ' + x[0].toLowerCase() + ' made with ' + mat + ' of the ' + realm + (/Realm$/.test(realm) ? '. ' : ' Realm. ') + 'A spellcasting focus: its level sets the focus bonus, its kind sets the focus\'s buff, and its ' + mat + ' gives ' + F[0] + ' (' + F[1] + ' spell Accuracy and save DCs).' });
      });
    });
  });
})();
// dimension gear (owner's request, 2026-11-11): what each Inner Realm dimension (levels 51-60) and Outer Realm pocket
// (levels 61-70) makes from its own materials, from data/realm-atlas.js. Numbers follow the Blueprints past level 20.
(function () {
  var A = require('./realm-atlas.js'), TYPE = { Blacksmithing: 'O', Engineering: 'O', Carving: 'W', Tailoring: 'F', Enchanting: 'G' };
  var BASE = { 'Inner Realm': 51, 'Outer Realm': 61 };
  A.DIMS.forEach(function (d) {
    (d.gear || []).forEach(function (x, i) {
      // its main material: the dimension's material that suits the craft (metal for smiths, wood for carvers, hide or
      // cloth for tailors), the stronger one for higher levels; failing that, any of the dimension's materials
      var KIND = { Blacksmithing: 'ore', Engineering: 'ore', Carving: 'herb', Tailoring: 'hide' }[x[2]];
      var fit = d.mats.filter(function (m) { return !KIND || m[2] === KIND || (x[2] === 'Carving' && m[2] === 'hide'); }).sort(function (a, b) { return a[1] - b[1]; });
      if (!fit.length) fit = d.mats.slice().sort(function (a, b) { return a[1] - b[1]; });
      var L = BASE[d.realm] + (x[7] || 0), mat = x[8] || fit[Math.min(fit.length - 1, Math.floor((x[7] || 0) * fit.length / 10))][0];
      var b = { n: x[0], cat: x[1], lv: L, pr: x[2], sp: x[3], r: 'Legendary', mats: [mat], m: [[d.realm, TYPE[x[2]] || 'O', Math.min(10, 2 + (x[7] || 0))]], dim: d.n };
      if (x[4]) { b.dc = Math.ceil(L * 0.65) + x[4]; b.dm = x[5]; }
      if (x[6]) { b.slot = x[6]; b.ac = String(x[6] === 'Body' ? 4 + Math.floor((L - 20) / 10) : x[6] === 'Shield' ? 2 + Math.floor((L - 20) / 15) : 1 + Math.floor((L - 20) / 20)); }
      b.ds = 'A ' + x[0].replace(/^(The |A |An )/, '').toLowerCase() + ' from ' + d.n + ', ' + d.kind.charAt(0).toLowerCase() + d.kind.slice(1) + ' in the ' + d.realm + ', made with ' + mat + ' (level ' + L + ').' +
        (b.dc ? ' It deals ' + b.dc + ' ' + b.dm.toLowerCase() + ' damage.' : '') + (b.ac ? ' It gives ' + b.ac + ' AC.' : '') + (x[1] === 'Artifact' && !b.dc && !b.ac ? ' A spellcasting focus and keepsake of its dimension.' : '');
      NEW.push(b);
    });
  });
})();
// a full set for every deep realm (owner's request, 2026-11-11): the realms past the Mysterious had few Blueprints at their
// own levels. Every weapon kind, armor slot, shield and focus, at five steps through the realm's band of levels (every other level), made from
// that realm's materials (picked by type and grade at build time). Numbers follow the Blueprints past level 20.
(function () {
  var REALMS = [['Hell', 21, 'Infernal'], ['Heaven', 21, 'Seraphic'], ['Chaos', 31, 'Wildforged'], ['Abyss', 41, 'Abyssal'], ['Inner Realm', 51, 'Anchor-Forged'],
    ['Outer Realm', 61, 'Far-Shore'], ['Void', 71, 'Voidsteel'], ['Inner Void', 81, 'Hollowed'], ['Primordial', 91, 'Primeval']];
  var KINDS = [
    // noun, category, profession, specialty, main type, second type, die, damage type, slot
    ['Greatsword', 'Sword', 'Blacksmithing', 'Blacksmithing', 'O', 'F', 'd12', 'Slashing'], ['Longsword', 'Sword', 'Blacksmithing', 'Blacksmithing', 'O', 'F', 'd8', 'Slashing'],
    ['Rapier', 'Sword', 'Blacksmithing', 'Blacksmithing', 'O', 'F', 'd8', 'Piercing'], ['Dagger', 'Dagger', 'Blacksmithing', 'Blacksmithing', 'O', 'B', 'd4', 'Piercing'],
    ['Greataxe', 'Axe', 'Blacksmithing', 'Blacksmithing', 'O', 'W', 'd12', 'Slashing'], ['Warhammer', 'Hammer', 'Blacksmithing', 'Blacksmithing', 'O', 'W', 'd8', 'Bludgeoning'],
    ['Maul', 'Hammer', 'Blacksmithing', 'Blacksmithing', 'O', 'W', 'd12', 'Bludgeoning'], ['Glaive', 'Spear', 'Blacksmithing', 'Blacksmithing', 'O', 'W', 'd10', 'Slashing'],
    ['Spear', 'Spear', 'Carving', 'Woodworking', 'W', 'O', 'd8', 'Piercing'], ['Longbow', 'Bow', 'Carving', 'Woodworking', 'W', 'F', 'd8', 'Piercing'],
    ['Crossbow', 'Bow', 'Engineering', 'Clockwork Engineering', 'W', 'O', 'd10', 'Piercing'], ['Quarterstaff', 'Staff', 'Carving', 'Crystal Shaping', 'W', 'G', 'd6', 'Bludgeoning'],
    ['Plate Cuirass', 'Armor', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Body'], ['Helm', 'Armor', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Head'],
    ['Gauntlets', 'Armor', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Hands'], ['Greaves', 'Armor', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Feet'],
    ['Pauldrons', 'Armor', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Shoulders'], ['Cloak', 'Armor', 'Tailoring', 'Arcane Tailoring', 'F', 'E', '', '', 'Back'],
    ['Robe', 'Armor', 'Tailoring', 'Arcane Tailoring', 'F', 'G', '', '', 'Body'], ['Tower Shield', 'Shield', 'Blacksmithing', 'Blacksmithing', 'O', 'W', '', '', 'Shield'],
    ['Buckler', 'Shield', 'Blacksmithing', 'Blacksmithing', 'O', 'F', '', '', 'Shield'], ['Wand', 'Focus', 'Carving', 'Crystal Shaping', 'W', 'G'],
    ['Orb', 'Focus', 'Enchanting', 'Soul Binding', 'G', 'E'], ['Amulet', 'Artifact', 'Enchanting', 'Soul Binding', 'G', 'O']];
  var STEPS = [['', 1, 2], ['Fine ', 3, 4], ['Greater ', 5, 5], ['Superior ', 7, 7], ['Exalted ', 9, 9]]; // name prefix, level offset in the band, material grade
  REALMS.forEach(function (R) {
    STEPS.forEach(function (S) {
      KINDS.forEach(function (k) {
        var L = R[1] + S[1], n = S[0] + R[2] + ' ' + k[0], r = S[1] >= 9 || R[1] >= 61 ? 'Artifact' : 'Legendary';
        var b = { n: n, cat: k[1], lv: L, pr: k[2], sp: k[3], r: r, m: [[R[0], k[4], S[2]], [R[0], k[5], Math.max(1, S[2] - 1)]], pp: 1 };
        if (k[6]) { b.dc = Math.ceil(L * 0.65) + k[6]; b.dm = k[7]; }
        if (k[8]) { b.slot = k[8]; b.ac = String(k[8] === 'Body' ? 4 + Math.floor((L - 20) / 10) : k[8] === 'Shield' ? (k[0] === 'Buckler' ? 1 : 2) + Math.floor((L - 20) / 15) : 1 + Math.floor((L - 20) / 20)); }
        b.ds = (r === 'Artifact' ? 'An ' : 'A ') + r.toLowerCase() + ' ' + k[0].toLowerCase() + ' of the ' + R[0] + (/Realm$/.test(R[0]) ? '' : ' Realm') + ', for level ' + L + ', made from that realm\'s own materials.' +
          (b.dc ? ' It deals ' + b.dc + ' ' + b.dm.toLowerCase() + ' damage.' : '') + (b.ac ? ' It gives ' + b.ac + ' AC.' : '') + (k[1] === 'Focus' ? ' A spellcasting focus.' : k[1] === 'Artifact' ? ' A spellcasting focus, worn.' : '');
        NEW.push(b);
      });
    });
  });
})();
// ammunition in every realm (owner's request, 2026-11-23: "add more arrowhead ... add arrow blueprint and ammunition
// blueprint ... make sure there is no gaps"): every kind of shot for every kind of ranged weapon (bows, crossbows, slings,
// blowguns, firearms, ballistas) and loose arrowheads, at two steps in each realm's band of levels, made from that realm's
// own materials. ammo: what it fits, how many a craft makes, extra damage per hit, and AC a hit ignores.
(function () {
  var REALMS = [['Human', 1, "Hunter's", 'Common'], ['Mysterious', 11, 'Fey-Fletched', 'Uncommon'], ['Hell', 21, 'Infernal', 'Rare'], ['Heaven', 21, 'Seraphic', 'Rare'],
    ['Chaos', 31, 'Wildforged', 'Rare'], ['Abyss', 41, 'Abyssal', 'Very Rare'], ['Inner Realm', 51, 'Anchor-Forged', 'Legendary'], ['Outer Realm', 61, 'Far-Shore', 'Legendary'],
    ['Void', 71, 'Voidsteel', 'Legendary'], ['Inner Void', 81, 'Hollowed', 'Artifact'], ['Primordial', 91, 'Primeval', 'Artifact']];
  var FITS = { bow: 'bows', crossbow: 'crossbows', sling: 'slings and slingshots', blowgun: 'blowguns', firearm: 'firearms', siege: 'ballistas and scorpions', parts: 'plain arrow shafts' };
  var KINDS = [
    // noun, fits, how many, profession, specialty, main type, second type, damage per level, pierce per level, what else it does
    ['Broadhead Arrows', 'bow', 20, 'Carving', 'Woodworking', 'O', 'W', 4, 0, 'Wide heads that cut deep.'],
    ['Bodkin Arrows', 'bow', 20, 'Carving', 'Woodworking', 'O', 'W', 10, 8, 'Narrow heads that punch through armor.'],
    ['Barbed Arrows', 'bow', 20, 'Carving', 'Woodworking', 'B', 'W', 5, 0, 'A creature hit has its speed cut by 10 feet until it spends an action to pull the arrow out.'],
    ['Fire Arrows', 'bow', 10, 'Alchemy', 'Alchemy', 'E', 'W', 5, 0, 'The damage is fire, and a hit sets alight anything flammable it strikes; the arrow burns away.'],
    ['Arrowheads', 'parts', 20, 'Blacksmithing', 'Blacksmithing', 'O', 'B', 5, 0, 'Fit them to plain shafts with Fletcher\'s Tools (an hour for twenty): the arrows they make carry these numbers.'],
    ['Heavy Bolts', 'crossbow', 20, 'Blacksmithing', 'Blacksmithing', 'O', 'W', 4, 0, 'Thick, heavy bolts that hit like a hammer.'],
    ['Piercing Quarrels', 'crossbow', 20, 'Blacksmithing', 'Blacksmithing', 'O', 'W', 10, 6, 'Square-headed quarrels that split plate.'],
    ['Sling Bullets', 'sling', 20, 'Blacksmithing', 'Blacksmithing', 'O', 'S', 5, 0, 'Weighted, shaped shot that flies true.'],
    ['Venom Needles', 'blowgun', 50, 'Alchemy', 'Alchemy', 'O', 'E', 10, 0, 'Each hit: Constitution save or poisoned for 1 minute.'],
    ['Firearm Shot', 'firearm', 20, 'Blacksmithing', 'Engineering', 'O', 'E', 4, 2, 'Balls with wadding and a charge of powder in a paper cartridge.'],
    ['Ballista Bolts', 'siege', 5, 'Carving', 'Siege Engineering', 'W', 'O', 2, 4, 'Bolts as long as a spear, for a ballista or a scorpion.']];
  var STEPS = [['', 2, 3], ['Fine ', 7, 7]]; // name prefix, level offset in the band, material grade
  REALMS.forEach(function (R) {
    STEPS.forEach(function (S) {
      KINDS.forEach(function (k) {
        var L = R[1] + S[1], n = S[0] + R[2] + ' ' + k[0], dmg = Math.max(1, Math.floor(L / k[7])), pierce = k[8] ? Math.max(1, Math.floor(L / k[8])) : 0;
        if (k[1] === 'blowgun') dmg = Math.max(0, Math.floor(L / k[7]));
        var dc = 10 + Math.floor(L / 5), extra = k[1] === 'blowgun' ? k[9].replace('Constitution save', 'Constitution save (DC ' + dc + ')') : k[9];
        var b = { n: n, cat: 'Ammunition', lv: L, pr: k[3], sp: k[4], r: R[3], m: [[R[0], k[5], S[2]], [R[0], k[6], Math.max(1, S[2] - 1)]], q: k[2],
          ammo: { fits: k[1], qty: k[2], dmg: dmg, pierce: pierce } };
        b.ds = 'A bundle of ' + k[2] + ' ' + k[0].toLowerCase() + ' of the ' + R[0] + (/Realm$/.test(R[0]) ? '' : ' Realm') + ', for level ' + L + ', made from that realm\'s own materials. For ' + FITS[k[1]] + ': ' +
          (dmg ? '+' + dmg + ' damage per hit' : 'no extra damage') + (pierce ? ', and a hit ignores ' + pierce + ' AC' : '') + '. ' + extra;
        NEW.push(b);
      });
    });
  });
})();
// the thin categories filled out (owner's request, 2026-11-24: "look for categories with less item and add item"): books,
// explosives, vehicles, poisons, traps, light sources, restraints, storage, clothing, fortifications and oils had a handful
// of Blueprints each. Each kind here comes in every realm (at the middle of its band of levels), from that realm's own
// materials, with numbers that grow with its level (b = level ÷ 10 rounded up, dc = 10 + level ÷ 5).
(function () {
  var REALMS = [['Human', 1, 'Stalwart', 'Common'], ['Mysterious', 11, 'Feywrought', 'Uncommon'], ['Hell', 21, 'Infernal', 'Rare'], ['Heaven', 21, 'Seraphic', 'Rare'],
    ['Chaos', 31, 'Wildforged', 'Rare'], ['Abyss', 41, 'Abyssal', 'Very Rare'], ['Inner Realm', 51, 'Anchor-Forged', 'Legendary'], ['Outer Realm', 61, 'Far-Shore', 'Legendary'],
    ['Void', 71, 'Void-Touched', 'Legendary'], ['Inner Void', 81, 'Hollowed', 'Artifact'], ['Primordial', 91, 'Primeval', 'Artifact']];
  var KINDS = [
    // noun, category, profession, specialty, main type, second type, what it does (L level, b, dc, d), extra fields
    ['Bestiary Folio', 'Book', 'Enchanting', 'Enchanting', 'F', 'E', function (L, b) { return 'Notes and sketches of the realm\'s creatures: advantage on checks to recall a creature\'s weaknesses, and +' + b + ' to them.'; }],
    ['Survival Almanac', 'Book', 'Navigation', 'Navigation', 'F', 'W', function (L, b) { return 'Paths, weather and edible things of its realm: +' + b + ' to Survival and foraging checks there.'; }],
    ['Fire Bomb', 'Explosive', 'Alchemy', 'Alchemy', 'E', 'O', function (L, b, dc) { return 'Thrown (20/60 ft): ' + Math.max(2, Math.ceil(L / 3)) + 'd6 fire damage in a 10-foot radius, Dexterity save DC ' + dc + ' for half.'; }],
    ['Smoke Bomb', 'Explosive', 'Alchemy', 'Alchemy', 'E', 'F', function (L, b) { return 'Thrown (20/60 ft): a 20-foot cloud of thick smoke that lasts ' + (1 + b) + ' minutes; the area is heavily obscured.'; }],
    ['Thunderclap Charge', 'Explosive', 'Engineering', 'Engineering', 'E', 'O', function (L, b, dc) { return 'Set and lit (a 1-round fuse): ' + Math.max(2, Math.ceil(L / 3)) + 'd8 thunder damage within 15 feet, Constitution save DC ' + dc + ' or deafened and knocked prone. Double damage to objects and structures.'; }],
    ['Wagon', 'Vehicle', 'Carving', 'Woodworking', 'W', 'O', function (L) { return 'Carries 2 tons and six riders at 30 feet a round behind two draft beasts; ' + (30 + L * 2) + ' hit points.'; }],
    ['Skiff', 'Vehicle', 'Carving', 'Woodworking', 'W', 'F', function (L) { return 'A light boat for four, rowed or sailed at 30 feet a round; ' + (20 + L * 2) + ' hit points.'; }],
    ['Blade Venom', 'Poison', 'Alchemy', 'Alchemy', 'L', 'E', function (L, b, dc) { return 'Coats one weapon or three pieces of ammunition for 1 minute: a hit deals +' + b + 'd6 poison damage, Constitution save DC ' + dc + ' for half.'; }],
    ['Sleep Draught', 'Poison', 'Alchemy', 'Alchemy', 'L', 'W', function (L, b, dc) { return 'Slipped into food or drink: Constitution save DC ' + dc + ' or asleep for 1 hour (a slap or damage wakes them).'; }],
    ['Snare Trap', 'Trap', 'Engineering', 'Engineering', 'F', 'O', function (L, b, dc) { return 'Hidden (Perception DC ' + dc + ' to spot): a creature that steps in is restrained until it breaks free (Strength DC ' + dc + ').'; }],
    ['Spike Pit Kit', 'Trap', 'Engineering', 'Engineering', 'O', 'W', function (L, b, dc) { return 'Dug and hidden in an hour: a creature that falls in takes ' + Math.max(1, Math.ceil(L / 5)) + 'd10 piercing damage (Dexterity DC ' + dc + ' to catch the edge).'; }],
    ['Lantern', 'Light Source', 'Blacksmithing', 'Blacksmithing', 'O', 'G', function (L) { return 'Bright light for 30 feet and dim light 30 feet beyond, for ' + (6 + L) + ' hours a filling.'; }],
    ['Torch Bundle', 'Light Source', 'Carving', 'Woodworking', 'W', 'F', function (L, b) { return 'Five torches, each burning an hour with bright light for 20 feet; swung as a club, +' + b + ' fire damage.'; }],
    ['Manacles', 'Restraint', 'Blacksmithing', 'Blacksmithing', 'O', 'O', function (L, b, dc) { return 'Slipping free: Dexterity DC ' + dc + '; breaking them: Strength DC ' + (dc + 5) + '; ' + (10 + L) + ' hit points.'; }],
    ['Weighted Net', 'Restraint', 'Tailoring', 'Tailoring', 'F', 'O', function (L, b, dc) { return 'Thrown (5/15 ft): a Large or smaller creature hit is restrained until it frees itself (Strength DC ' + dc + ') or the net (' + (5 + L) + ' hit points) is cut.'; }],
    ['Satchel', 'Storage', 'Tailoring', 'Tailoring', 'F', 'F', function () { return 'A shoulder bag. It holds 2 items on top of the 20 a character can carry.'; }, { cap: 2, carry: 1 }],
    ['Strongbox', 'Storage', 'Blacksmithing', 'Blacksmithing', 'O', 'W', function (L, b, dc) { return 'A locked iron box (lock DC ' + dc + '), set down rather than carried. It holds 6 items.'; }, { cap: 6, carry: 0 }],
    ["Traveler's Cloak", 'Clothing', 'Tailoring', 'Tailoring', 'F', 'F', function (L, b) { return 'Made for its realm\'s weather: the wearer is comfortable in it, and gains +' + b + ' to Stealth there.'; }],
    ['Gloves', 'Clothing', 'Tailoring', 'Tailoring', 'F', 'B', function (L, b) { return '+' + b + ' to Sleight of Hand and to climbing checks.'; }],
    ['Palisade Section', 'Fortification', 'Carving', 'Woodworking', 'W', 'O', function (L, b) { return 'Twenty feet of wall, 10 feet high: AC ' + (10 + b) + ', ' + (50 + L * 5) + ' hit points; four workers raise it in an hour.'; }],
    ['Watchtower Kit', 'Fortification', 'Engineering', 'Engineering', 'W', 'O', function (L, b) { return 'A 30-foot tower for four lookouts, who see twice as far: AC ' + (10 + b) + ', ' + (100 + L * 10) + ' hit points.'; }],
    ['Weapon Oil', 'Oil & Coating', 'Alchemy', 'Alchemy', 'E', 'W', function (L, b) { return 'Coats a weapon for 1 hour: +' + b + ' damage per hit, and its damage counts as magical.'; }],
    ['Armor Polish', 'Oil & Coating', 'Alchemy', 'Alchemy', 'E', 'O', function () { return 'Polishes a suit for a day: rust and acid can\'t harm it, and the first hit against the wearer in each fight deals 1 less damage.'; }]];
  REALMS.forEach(function (R) {
    KINDS.forEach(function (k) {
      var L = R[1] + 4, b = Math.ceil(L / 10), dc = 10 + Math.floor(L / 5), n = R[2] + ' ' + k[0];
      var x = { n: n, cat: k[1], lv: L, pr: k[2], sp: k[3], r: R[3], m: [[R[0], k[4], 5], [R[0], k[5], 4]] };
      if (k[7]) Object.keys(k[7]).forEach(function (f) { x[f] = k[7][f]; });
      x.ds = 'A ' + k[0].replace(/^(\w)/, function (c) { return c.toLowerCase(); }) + ' of the ' + R[0] + (/Realm$/.test(R[0]) ? '' : ' Realm') + ', for level ' + L + ', made from that realm\'s own materials. ' + k[6](L, b, dc);
      NEW.push(x);
    });
  });
})();
// the everyday ammunition shoots plain: no extra damage, but the sheet and the Forge know what it fits
NEW.forEach(function (b) { var F = { Arrows: 'bow', Bolts: 'crossbow', 'Sling Bullets': 'sling', 'Blowgun Needles': 'blowgun', 'Firearm Shot': 'firearm', 'Ballista Bolts': 'siege', Arrowheads: 'parts' }[b.n];
  if (F && b.starter) b.ammo = { fits: F, qty: b.q || 20, dmg: 0, pierce: 0 }; });
NEW.forEach(function (b) { if (b.n === "Explorer's Pack") b.gp = 10; if (b.n === 'Backpack') b.gp = 2; });

module.exports = {
  NEW: NEW,
  TOOLS: {
    Pickaxe: { mine: 1 },
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
