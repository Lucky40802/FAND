// Blueprints past profession level 20 (website addition, original). Each profession gets a blueprint on every odd level from
// 21 to 99, and a masterwork at levels 40, 60, 80, and 100 (the top of each stage). Materials come from the realms the
// stage opens; the grade rises through the stage. Kinds: [noun, category, main material types, second material types,
// weapon die, damage type, armor slot]. Types: O ore/metal, W wood/plant, G gem, S stone, F hide/cloth, B bone/scale,
// L blood/organ, E essence/soul, K mechanism.
module.exports = {
  STAGE_REALMS: { 2: ['Hell', 'Heaven', 'Chaos'], 3: ['Abyss', 'Inner Realm'], 4: ['Outer Realm', 'Void'], 5: ['Inner Void', 'Primordial'] },
  PROF: {
    Blacksmithing: { verb: 'forged', sp: { Hell: 'Infernal Forging', Heaven: 'Celestial Metallurgy', Void: 'Void Smithing', 'Inner Void': 'Void Smithing' }, sp0: 'Blacksmithing', kinds: [
      ['Longsword', 'Sword', 'O', 'F', 'd8', 'Slashing'], ['Greataxe', 'Axe', 'O', 'W', 'd12', 'Slashing'], ['Plate Cuirass', 'Armor', 'O', 'F', '', '', 'Body'],
      ['Warhammer', 'Hammer', 'O', 'W', 'd8', 'Bludgeoning'], ['Tower Shield', 'Shield', 'O', 'W', '', '', 'Shield'], ['Glaive', 'Spear', 'O', 'W', 'd10', 'Slashing'],
      ['Plate Helm', 'Armor', 'O', 'F', '', '', 'Head'], ['Rapier', 'Sword', 'O', 'F', 'd8', 'Piercing'], ['Plate Gauntlets', 'Armor', 'O', 'F', '', '', 'Hands'], ['Dagger', 'Dagger', 'O', 'F', 'd4', 'Piercing']] },
    Carving: { verb: 'carved', sp: {}, sp0: 'Crystal Shaping', kinds: [
      ['Longbow', 'Bow', 'W', 'F', 'd8', 'Piercing'], ['Spellstaff', 'Staff', 'W', 'G', 'd6', 'Bludgeoning'], ['Bone Shield', 'Shield', 'B', 'F', '', '', 'Shield'],
      ['Crystal Idol', 'Artifact', 'G', 'S', ''], ['Scale Mail', 'Armor', 'B', 'F', '', '', 'Body'], ['Throwing Spear', 'Spear', 'W', 'B', 'd6', 'Piercing'], ['Horn Bow', 'Bow', 'B', 'F', 'd10', 'Piercing']] },
    Tailoring: { verb: 'sewn', sp: { Void: 'Shadow Weaving', 'Inner Void': 'Shadow Weaving' }, sp0: 'Arcane Tailoring', kinds: [
      ['Cloak', 'Armor', 'F', 'E', '', '', 'Back'], ['Robe', 'Armor', 'F', 'G', '', '', 'Body'], ['Gloves', 'Armor', 'F', 'B', '', '', 'Hands'], ['Boots', 'Armor', 'F', 'B', '', '', 'Feet'], ['Hood', 'Armor', 'F', 'E', '', '', 'Head']] },
    Alchemy: { verb: 'brewed', sp: { Hell: 'Blood Alchemy', Abyss: 'Blood Alchemy' }, sp0: 'Potionmaking', kinds: [
      ['Elixir', 'Potion', 'L', 'W'], ['Draught', 'Potion', 'W', 'L'], ['Weapon Oil', 'Potion', 'L', 'E'], ['Tincture', 'Potion', 'E', 'W']] },
    Cooking: { verb: 'cooked', sp: {}, sp0: 'Spirit Cooking', kinds: [['Feast', 'Food', 'L', 'W'], ['Stew', 'Food', 'W', 'L'], ['Travel Rations', 'Food', 'W', 'B'], ['Tea', 'Food', 'W', 'E']] },
    Enchanting: { verb: 'enchanted', sp: { Primordial: 'Relic Restoration' }, sp0: 'Soul Binding', kinds: [
      ['Ring', 'Artifact', 'G', 'O'], ['Amulet', 'Artifact', 'G', 'E'], ['Focus Orb', 'Artifact', 'E', 'G'], ['Rune Circlet', 'Artifact', 'O', 'G'], ['Sigil Stone', 'Artifact', 'S', 'E']] },
    Engineering: { verb: 'built', sp: {}, sp0: 'Clockwork Engineering', kinds: [
      ['Automaton', 'Tool', 'O', 'K'], ['Siege Engine', 'Structure', 'W', 'O'], ['Ward Bastion', 'Fortification', 'S', 'O'], ['Repeating Crossbow', 'Bow', 'O', 'W', 'd10', 'Piercing']] },
    Harvesting: { verb: 'raised', sp: {}, sp0: 'Beast Taming', kinds: [['Seed Stock', 'Crop', 'W', 'S'], ['Beast Line', 'Livestock', 'L', 'W'], ['Soil Blend', 'Fertilizer', 'S', 'W']] },
    Scavenging: { verb: 'prepared', sp: {}, sp0: 'Scavenging', kinds: [['Trophy Cloak', 'Armor', 'F', 'B', '', '', 'Back'], ['Preserving Kit', 'Tool', 'B', 'L'], ['Fang Knife', 'Dagger', 'B', 'F', 'd4', 'Slashing']] },
    Navigation: { verb: 'drawn', sp: {}, sp0: 'Astral Navigation', kinds: [['Realm Chart', 'Map', 'F', 'G'], ['Astrolabe', 'Instrument', 'O', 'G'], ['Wayfinder Compass', 'Tool', 'O', 'E']] }
  }
};
