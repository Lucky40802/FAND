var fs = require('fs');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious';
var SC = require('path').join(__dirname, '..', 'data');
var RULES = {
  Blacksmithing: [['Blacksmithing', 'A forge and anvil. The default specialty every Blacksmith starts with.'], ['Infernal Forging', 'Hell metal (Brimstone Iron, Infernium, and so on) and a forge hot enough for it: a Hell vent, a Realm Forge, or a fiend-fire forge. Items carry a trace of Hell; Heaven contractors distrust them.'], ['Celestial Metallurgy', 'Heaven metal and consecrated tools. Items can\'t be used to harm a celestial without the wielder taking the same damage.'], ['Void Smithing', 'Void or Inner Void metal and a forge that burns nothing: usually a Realm Forge connected to the Void.']],
  Carving: [['Woodworking', 'Carving tools and seasoned wood.'], ['Stonecutting', 'Chisels and a quarry or workshop able to hold the stone.'], ['Bone Carving', 'Fresh or properly cured bone; carving bone of a sentient creature is a crime in most lands.'], ['Dragon Carving', 'Dragon or wyvern material. Dragons can smell their own kind\'s parts on you.'], ['Crystal Shaping', 'A gem-cutting wheel and a steady hand: crafting checks are at disadvantage while moving or in combat.'], ['Tide Craft', 'A workshop near the sea; coral and sea materials dry out and crack inland.']],
  Tailoring: [['Arcane Tailoring', 'The ability to cast at least one cantrip, or a partner who can, to weave magic into the cloth.'], ['Shadow Weaving', 'Work only in dim light or darkness; in bright light the thread unravels.']],
  Alchemy: [['Potionmaking', 'An alchemist\'s kit and clean water.'], ['Blood Alchemy', 'Fresh blood from a willing donor or a kill no more than an hour old. Most temples frown on it.']],
  Cooking: [['Cooking', 'A fire and a pot.'], ['Spirit Cooking', 'At least one ingredient from the Mysterious Realm or higher, and a meal shared with at least one other person.']],
  Enchanting: [['Sigilcraft', 'Inks or chisels to carve sigils; works on gear that will be worn or wielded.'], ['Glyph Inscription', 'Inks and a surface that won\'t be moved: walls, floors, doors, scrolls.'], ['Soul Binding', 'A soul vessel (such as an Empty Vessel) and a soul that is willing or recently departed. Heaven contractors treat it as a crime.'], ['Elemental Binding', 'An elemental core or essence to bind.'], ['Relic Restoration', 'The broken relic itself, and a week of study before the first attempt.']],
  Engineering: [['Clockwork Engineering', 'Fine tools and springs or gears.'], ['Golemancy', 'An animating core (Spark Core, Keeper Gear, or similar) for every construct.'], ['Siege Engineering', 'A crew of at least four laborers for anything Large or bigger.'], ['Building', 'A site, laborers, and a season for anything larger than a cottage.'], ['Masonry', 'Quarried stone and laborers; structures take weeks, not days.']],
  Harvesting: [['Farming', 'Land and a growing season. Crops from other realms need soil from that realm, or Godfall Soil.'], ['Beast Taming', 'A week of daily time with the animal before any check to tame or breed it.']],
  Scavenging: [['Scavenging', 'A kill, a ruin, or a wreck to work. Scavengers can refine any material type, at disadvantage.']],
  Navigation: [['Navigation', 'Instruments and a clear view of sky or landmarks.'], ['Astral Navigation', 'Having crossed the Astral at least once, with someone who already has the specialty.']]
};
var GEN = ['## Specialty rules',
  '- You start a profession with **one specialty** of your choice.',
  '- Crafting a Blueprint from a specialty you don\'t have is at **disadvantage**, unless its level is no more than half your profession level.',
  '- **Gaining a specialty:** finish one item of it under a teacher who has it, or pick a new one free at profession levels 5, 10, 15, and 20.',
  '- Each specialty also has its own requirement:', ''];
var log = [];
Object.keys(RULES).forEach(function (n) {
  var p = A + '/Professions/' + (n === 'Alchemy' ? 'Alchemy (Profession)' : n) + '.md', t = fs.readFileSync(p, 'utf8');
  if (t.indexOf('## Specialty rules') >= 0) return;
  var block = GEN.concat(['| Specialty | Needs |', '|---|---|']).concat(RULES[n].map(function (r) { return '| ' + r[0] + ' | ' + r[1] + ' |'; })).concat(['', '']).join('\n');
  var i = t.indexOf('## Level Progression'); if (i < 0) { log.push('MISS ' + n); return; }
  fs.writeFileSync(SC + '/spec_bak_' + n + '.md', t);
  fs.writeFileSync(p, t.slice(0, i) + block + t.slice(i));
  log.push('added ' + n);
});
// Profession Progression: general section
var pp = A + '/Profession Progression.md', t = fs.readFileSync(pp, 'utf8');
if (t.indexOf('## Specialties') < 0) {
  var sec = ['## Specialties', 'Each of the 10 professions has **specialties**, the narrower crafts it absorbed (see [[FAND/Atrious/Master Professions|Master Professions]]). Every Blueprint has a `specialty` field.',
    '- You start a profession with one specialty of your choice.',
    '- Crafting outside your specialties is at disadvantage, unless the Blueprint\'s level is no more than half your profession level.',
    '- You gain a specialty by finishing one item of it under a teacher who has it, or free at profession levels 5, 10, 15, and 20.',
    '- Some specialties have extra requirements (Blood Alchemy needs fresh blood, Void Smithing needs a Void forge, and so on); each profession\'s page lists them.', '', ''].join('\n');
  t = t.replace('## Profession XP', sec + '## Profession XP'); fs.writeFileSync(pp, t); log.push('Profession Progression');
}
console.log(log.join('\n'));
