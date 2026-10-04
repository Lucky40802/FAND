// Material properties. P = Potency (1-10) = max(1, floor(Item Level / 5)); B = ceil(P / 2) (1-5).
var R = require('./realms.js');
var A = {
  shape: ['Shapeshifting', 'The item can switch between {P1} forms you design (for example sword, spear, whip, shield) as a bonus action. Each form uses its own weapon die or AC.'],
  sovereign: ['Sovereign of the Dead', 'Necromancy focus: +{B} to necromancy spell attacks and save DCs. Each casting that raises undead raises one extra. Your undead get +{B} to attacks and {P5} extra hit points. You resist necrotic damage.'],
  necro: ['Necromantic', 'Necromancy focus: +{B} to necromancy spell attacks and save DCs. Undead you raise get {P5} extra hit points.'],
  fire: ['Burning', 'Weapon: +{P}d6 fire damage. Armor: fire resistance (immunity at Potency 8+).'],
  cold: ['Freezing', 'Weapon: +{P}d6 cold damage, and a hit cuts the target\'s speed by 10 ft. Armor: cold resistance.'],
  storm: ['Stormcharged', 'Weapon: +{P}d6 lightning or thunder damage. Armor: lightning resistance.'],
  acid: ['Corrosive', 'Weapon: +{P}d6 acid damage, and a hit lowers the target\'s Gear AC by 1 until repaired. Armor: acid resistance.'],
  poison: ['Venomous', 'Weapon: +{P}d6 poison damage; Constitution save (DC {DC}) or poisoned. Armor: poison resistance.'],
  radiant: ['Holy', 'Weapon: +{P}d6 radiant damage, doubled against fiends and undead. Focus: +{B} to healing.'],
  shadow: ['Shadowed', '+{B} to Stealth. Once per rest, turn invisible in dim light or darkness until you attack. Weapon: +{P}d6 necrotic damage.'],
  psychic: ['Psychic', 'Weapon: +{P}d6 psychic damage. Focus: +{B} to enchantment spell DCs.'],
  mindblast: ['Mind Blast', 'Weapon: +{P}d6 psychic damage. Once per long rest, a 30-ft cone: Intelligence save (DC {DC}) or stunned for 1 round.'],
  eyeray: ['Eye Ray', 'Once per short rest, fire a ray (60 ft, DC {DC}): charm, fear, sleep, or slow. At Potency 6+ also paralysis or disintegration (10d6 force).'],
  null: ['Nullifying', 'Weapon: once per turn, a hit ends one spell of level {B1} or lower on the target. Armor: advantage on saves against spells.'],
  time: ['Timebound', '+{B} to initiative. Once per long rest, take one extra action (once per short rest at Potency 5+).'],
  gravity: ['Gravitic', 'Weapon: a hit pushes or pulls the target up to {P5} ft. Armor: you can\'t be knocked prone or moved against your will.'],
  regen: ['Regenerating', 'Regain {P} hit points at the start of each of your turns while above 0. The item repairs itself overnight.'],
  rebirth: ['Rebirth', 'Once per long rest, when you drop to 0 hit points, return with half your hit points in a burst of fire ({P}d6 fire to creatures within 10 ft).'],
  sight: ['All-Seeing', 'Darkvision 60 ft. At Potency 3+ see invisible; at Potency 6+ truesight 30 ft. Focus: +{B} to divination spell DCs.'],
  far: ['Farreaching', 'Ranged weapons and spells cast through the item gain +{P10} ft range.'],
  flight: ['Skyborne', '+{P5} ft speed. At Potency 3+ you take no falling damage; at Potency 6+ you gain a fly speed equal to your walking speed.'],
  blink: ['Blinking', 'Bonus action: teleport up to 30 ft, once per short rest (at will at Potency 5+).'],
  displace: ['Displacement', 'Attacks against you have disadvantage until you are hit; the effect returns at the start of your next turn.'],
  hard: ['Hardened', 'Armor or shield: +{B} AC. Weapon: can\'t be broken, and ignores {P} Natural AC.'],
  sharp: ['Piercing Edge', 'Weapon: ignores {P2} AC (see Armor Class) and crits on 19–20 (18–20 at Potency 6+).'],
  bind: ['Binding', 'Weapon: on a hit, Strength save (DC {DC}) or restrained. Armor: advantage on grapple checks.'],
  petrify: ['Petrifying', 'Weapon: on a hit, Constitution save (DC {DC}) or slowed. A creature slowed twice is petrified until the end of its next turn.'],
  blood: ['Lifedrinking', 'Weapon: once per turn, regain {P2} hit points when you hit.'],
  core: ['Elemental Core', 'Pick one element when the item is made: weapon +{P}d6 of that type, or armor resistance to it.'],
  gem: ['Spell Vessel', 'Stores one spell of level {B} or lower, recast once per long rest. Focus: +{B} to spell attacks.'],
  nature: ['Living', 'Druid and ranger focus: +{B} to spell DCs. The item slowly regrows if damaged.'],
  stone: ['Enduring', 'Can\'t be broken by nonmagical means. Shield: +{B} AC. Weapon: +{B} damage.'],
  metal: ['Tempered', 'Weapon: +{B} damage. Armor: +{B} Gear AC.'],
  supple: ['Supple', 'Light or medium armor: +{B} AC and no disadvantage on Stealth. Cloth: +{B} to one Charisma skill.'],
  mech: ['Mechanical', 'Ranged mechanisms reload as a free action; +{B} to attacks with them.'],
  fey: ['Glamoured', 'Once per long rest cast charm person or disguise self (also mislead at Potency 5+). +{B} to Deception.'],
  luck: ['Fortunate', '{B} times per long rest, reroll one d20 you rolled.'],
  wild: ['Chaotic', 'Weapon: +{P}d6 damage of a random type each hit. Once per long rest, trigger a wild magic surge on purpose.'],
  sound: ['Resonant', 'Weapon: +{P}d6 thunder damage. Once per rest, a shout: creatures within 15 ft make a Wisdom save (DC {DC}) or are frightened.'],
  water: ['Tidal', 'Swim speed and water breathing. Weapons work normally underwater and deal +{P}d6 cold to creatures in water.'],
  earth: ['Earthbound', 'Tremorsense {P5} ft while touching the ground. Weapon: +{P}d6 damage against objects and structures.'],
  law: ['Lawful', 'Can\'t be disarmed or moved against your will. Once per day, bind a creature to a spoken promise; breaking it deals {P}d6 psychic damage.'],
  fiend: ['Dreadful', 'Weapon: on a hit, Wisdom save (DC {DC}) or frightened. Armor: advantage on saves against fear.'],
  holyhorn: ['Purifying', 'Weapon: +{P}d6 radiant damage. Once per day, end one poison or disease by touch.'],
  invuln: ['Invulnerable', 'Resistance to damage from nonmagical sources. At Potency 6+, spells that target only you are reflected back on a d20 roll of 15+.'],
  ink: ['Ink Cloud', 'Once per short rest, fill a 20-ft sphere with magical darkness around you.'],
  progenitor: ['Progenitor Piece', 'Counts as a Primary acquisition toward this progenitor\'s class (see Class) and unlocks a unique ability the DM designs.'],
  divine: ['Divine Spark', 'Holds a fragment of a god\'s power. The DM designs one legendary ability; the item counts as a relic that gods and their contractors will want.'],
  supply: ['—', 'Supply: used up in crafting; no property.']
};
// ordered rules: first match wins
var RULES = [
  [/Ignis Cinder|Undine Tear|Sylph Breath|Gnome Knuckle/, 'progenitor'],
  [/Heart Shard|Returning Heart|Genesis|Progenitor Bone|Fragment of the Original|Unclaimed Core|Herald's Nullheart|Root Guardian Heart|Unmade Remnant/, 'divine'],
  [/Undead King|Lich|Phylactery|Demilich|Death Knight|Mummy Lord|Skull Lord|Vampire|Nightwalker|Alhoon|Dracolich|Boneclaw/, 'sovereign'],
  [/Mimic|Doppelganger|Shapechang|Were(bear|boar|rat|tiger|wolf)|Lycanthrope|Mutable|Shifting|Warp|Many-Formed|Hoard Mimic/, 'shape'],
  [/Phoenix/, 'rebirth'], [/Tarrasque|Behemoth|Colossus Shell|Astral Dreadnought/, 'invuln'], [/Kraken Ink|Ink Gland|Astral Ink|Far-tide Ink|Kraken Beak/, 'ink'],
  [/Beholder|Death Tyrant|Spectator|Gauth|Gazer|Death Kiss|Mindwitness/, 'eyeray'],
  [/Mind Flayer|Elder Brain|Ulitharid|Neothelid|Intellect Devourer/, 'mindblast'],
  [/Displacer/, 'displace'], [/Blink|Hidden Path|Phase|Astral(?! Ink| Dreadnought)/, 'blink'], [/Unicorn/, 'holyhorn'],
  [/Troll|Hydra|Regenerat/, 'regen'],
  [/Basilisk|Medusa|Gorgon|Cockatrice|Petrif/, 'petrify'],
  [/Paradox|Chaos|Slaad|Unmade|Wild Magic|Maybe-Moss|Glitter|Entropy/, 'wild'],
  [/Probability|Fate|Luck|Destiny/, 'luck'],
  [/Modron|drone|Marut|Law|Anchor|Axiom|Keystone|Oath|Stratum|Veinwater|Vein |Keeper Gear/, 'law'],
  [/Time|Chrono|Timeworn/, 'time'], [/Gravity|Collapsed|Orbit|Dead Star/, 'gravity'],
  [/Null|Zero|Empty|Absence|Negation|Hollow|Void|Silence|Silent|Still/, 'null'],
  [/Watcher|Eye|Lens|Seer|Oracle|Divination|Prophet|Truth|Verdict|Sphinx/, 'sight'],
  [/Far |Horizon|Distant|Starless|Nebula|Edge|Unknown|Star Spawn/, 'far'],
  [/Undead|Ghoul|Ghast|Wight|Wraith|Mummy|Skeleton|Zombie|Bone Naga|Specter|Ghost|Banshee|Revenant|Grave|Necromancy|Corpse|Death Giant|Sorrow|Deathlock|Poltergeist|Allip|Eidolon|Sword Wraith|Bodak|Witherling|Wraithbone|Ectoplasm|Spectral|Lich/, 'necro'],
  [/Red Dragon|Gold Dragon|Brass Dragon|Fire|Flame|Ember|Magma|Cinder|Brimstone|Hellfire|Infern|Salamander|Sulfur|Blackflame|Heat|Hell Hound|Hellhound|Azer|Efreeti|Lava|Sun Lion|Sunfire|Burn/, 'fire'],
  [/White Dragon|Silver Dragon|Frost|Ice|Cold|Glacial|Winter|Yeti|Remorhaz|Rime|Snow|Polar/, 'cold'],
  [/Blue Dragon|Bronze Dragon|Sapphire Dragon|Storm|Lightning|Thunder|Charged|Spark|Behir|Djinni/, 'storm'],
  [/Black Dragon|Copper Dragon|Acid|Rust|Pudding|Jelly|Ooze|Cube|Corros|Oblex|Vitriol|Bulette/, 'acid'],
  [/Green Dragon|Venom|Poison|Toxic|Nightshade|Kingsbane|Stinger|Stirge|Rot|Spore|Brood|Yuan-ti|Anathema|Abomination Scale|Scorpion|Wasp|Wyvern/, 'poison'],
  [/Crystal Dragon|Radiant|Holy|Celestial|Heaven|Halo|Seraph|Angel|Deva|Planetar|Solar|Sun(?!ken)|Dawn|Consecrat|Sanctif|Prayer|Manna|Aurorite|Empyrean|Choir|Hymn|Couatl|Ki-rin|Pegasus|Light(?!less)|Herald|Sentinel|Judgement|Godsteel|Ichor Bronze|Godplate|Throne Wheel|Wheel/, 'radiant'],
  [/Topaz Dragon|Shadow|Shade|Umbral|Dark|Night|Dusk|Gloom|Lightless|Black Water|Shadar|Meazel|Dim /, 'shadow'],
  [/Amethyst Dragon|Emerald Dragon|Deep Dragon|Psionic|Psychic|Mind|Brain|Dream|Draconic Shard|Cranium|Grell|Nothic|Gith|Berbalang|Neogi|Aboleth|Morkoth|Balhannoth|Choker|Chuul|Cloaker|Mouther|Otyugh|Flumph|Su-monster/, 'psychic'],
  [/Moonstone Dragon|Fey|Faerie|Pixie|Sprite|Glamour|Moon|Wisp|Dryad|Satyr|Hag|Eladrin|Quickling|Redcap|Korred|Meenlock|Darkling|Boggle|Yeth|Twilight|Mirror|Reflection|Thornplate/, 'fey'],
  [/Siren|Voice|Banshee|Echo|Wail|Harpy|Resonan|Horn of|Trumpet|Leucrotta/, 'sound'],
  [/Water|Tide|Sea |Sea$|Marid|Coral|Pearl|Kraken|Shark|Deepmaw|Leviathan|Serpent Scale|Merrow|Sahuagin|Kelp|Drowned|Fathom|Dragon Turtle|Octopus|Whale|Eel/, 'water'],
  [/Earth|Xorn|Galeb|Dao|Zaratan|Golem|Gargoyle|Tremor|Purple Worm|Umber Hulk|Ankheg|Kruthik/, 'earth'],
  [/Feather|Wing|Roc |Roc$|Griffon|Hippogriff|Peryton|Sky|Cloud|Air|Aarakocra|Stormhawk|Down|Pteranodon|Quetzal|Vulture|Eagle|Owl|Hawk|Bat /, 'flight'],
  [/Silk|Web|Thread|Chain|Tendril|Tentacle|Rope|Sinew|Roper|Ettercap|Drider|Spider|Cave Fisher|Carrion Crawler|Vine|Snake|Constrictor|Hair/, 'bind'],
  [/Blood|Ichor|Heart$|Heart |Gland|Bile|Marrow/, 'blood'],
  [/Fang|Claw|Tooth|Teeth|Tusk|Horn|Spine|Barb|Talon|Beak|Maw|Hook|Mandible|Antler|Quill|Proboscis|Fin/, 'sharp'],
  [/Hide|Pelt|Scale|Carapace|Shell|Plate|Plating|Chitin|Membrane|Husk|Skin|Mane|Wool/, 'hard']
];
var REALM_DEFAULT = { He: 'fiend', Ab: 'fiend', Hv: 'radiant', Ch: 'wild', In: 'law', Ou: 'far', Vo: 'null', IV: 'null', Pr: 'divine' };
var TYPE_DEFAULT = { O: 'metal', W: 'nature', G: 'gem', S: 'stone', F: 'supple', B: 'sharp', L: 'blood', E: 'core', K: 'mech', U: 'supply' };

function key(name, t, c) {
  if (t === 'U') return 'supply';
  for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(name)) return RULES[i][1];
  if (REALM_DEFAULT[c] && /[BLEF]/.test(t)) return REALM_DEFAULT[c];
  return TYPE_DEFAULT[t] || 'metal';
}
function potency(c, g) { return Math.min(10, Math.max(1, Math.floor(R.level(c, g) / 5)) + (g === 10 ? 2 : g === 9 ? 1 : 0)); }
function fill(s, P) {
  var B = Math.ceil(P / 2);
  return s.replace(/\{P1\}/g, P + 1).replace(/\{B1\}/g, B + 1).replace(/\{P2\}/g, P * 2).replace(/\{P5\}/g, P * 5).replace(/\{P10\}/g, P * 10)
    .replace(/\{DC\}/g, 10 + B * 2).replace(/\{P\}/g, P).replace(/\{B\}/g, B);
}
module.exports = {
  A: A, RULES: RULES, REALM_DEFAULT: REALM_DEFAULT, TYPE_DEFAULT: TYPE_DEFAULT, potency: potency,
  prop: function (name, t, c, g) { var k = key(name, t, c), P = potency(c, g); return { k: k, name: A[k][0], text: fill(A[k][1], P), P: P }; }
};
