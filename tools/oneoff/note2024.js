var fs = require('fs');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious';
var M = {
  Barbarian: [['Path of the Berserker'], ['Path of the Wild Heart', 'Path of the Totem Warrior'], ['Path of the World Tree'], ['Path of the Zealot']],
  Bard: [['College of Dance'], ['College of Glamour'], ['College of Lore'], ['College of Valor']],
  Cleric: [['Life Domain'], ['Light Domain'], ['Trickery Domain'], ['War Domain']],
  Druid: [['Circle of the Land'], ['Circle of the Moon'], ['Circle of the Sea'], ['Circle of Stars']],
  Fighter: [['Battle Master'], ['Champion'], ['Eldritch Knight'], ['Psi Warrior']],
  Monk: [['Warrior of Mercy', 'Way of Mercy'], ['Warrior of Shadow', 'Way of Shadow'], ['Warrior of the Elements', 'Way of the Four Elements'], ['Warrior of the Open Hand', 'Way of the Open Hand']],
  Paladin: [['Oath of Devotion'], ['Oath of Glory'], ['Oath of the Ancients'], ['Oath of Vengeance']],
  Ranger: [['Beast Master'], ['Fey Wanderer'], ['Gloom Stalker'], ['Hunter']],
  Rogue: [['Arcane Trickster'], ['Assassin'], ['Soulknife'], ['Thief']],
  Sorcerer: [['Aberrant Sorcery', 'Aberrant Mind'], ['Clockwork Sorcery', 'Clockwork Soul'], ['Draconic Sorcery', 'Draconic Bloodline'], ['Wild Magic Sorcery', 'Wild Magic (Sorcerer)']],
  Warlock: [['Archfey Patron', 'The Archfey (Patron)'], ['Celestial Patron', 'The Celestial (Patron)'], ['Fiend Patron', 'The Fiend (Patron)'], ['Great Old One Patron', 'The Great Old One (Patron)']],
  Wizard: [['Abjurer', 'School of Abjuration (Wizard)'], ['Diviner', 'School of Divination (Wizard)'], ['Evoker', 'School of Evocation'], ['Illusionist', 'School of Illusion (Wizard)']]
};
var errs = [], n = 0;
Object.keys(M).forEach(function (c) {
  var p = A + '/Classes/' + c + '.md', t = fs.readFileSync(p, 'utf8');
  if (t.indexOf('2024 Player\'s Handbook') >= 0) return;
  var items = M[c].map(function (x) {
    var file = x[1] || x[0];
    if (!fs.existsSync(A + '/Subclasses/' + file + '.md')) errs.push(c + ': ' + file);
    return '[[FAND/Atrious/Subclasses/' + file + '|' + x[0] + ']]' + (x[1] ? ' (revised ' + x[1].replace(/ \((Sorcerer|Patron|Wizard)\)$/, '') + ')' : '');
  });
  var note = '**2024 Player\'s Handbook:** every class picks its subclass at level 3. The 2024 book includes these four for ' + c + ': ' + items.join(', ') +
    '. Revised versions change some features and levels; the notes here summarize the original versions unless marked (2024). Check the 2024 book for its wording.';
  var nt = t.replace(/(## Available Subclasses\r?\n)/, '$1' + note + '\n\n');
  if (nt === t) { errs.push('no section ' + c); return; }
  if (process.argv[2] === 'go') fs.writeFileSync(p, nt);
  n++;
});
console.log('errors', errs, 'class pages', n);
