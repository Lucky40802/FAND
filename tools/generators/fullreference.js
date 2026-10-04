// Builds one detailed Markdown reference of the FAND vault (rules, professions, realms, gods, full patch history).
// Usage: node generators/fullreference.js [output path]
var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var OUT = process.argv[2] || 'C:/Users/Lakshan Jagadeishan/Downloads/FAND Complete Reference.md';
var A = V + '/Atrious';
function plain(t) {
  return t.replace(/!\[\[[^\]]*\]\]\r?\n?/g, '')
    .replace(/\[\[([^\]|\\]+)\\?\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, function (m, p) { return p.split('/').pop().replace(/\.base$/, ''); });
}
function demote(t, by) { return t.replace(/^(#{1,5}) /gm, function (m, h) { return '#'.repeat(Math.min(6, h.length + by)) + ' '; }); }
function body(p) { return fs.readFileSync(p, 'utf8').replace(/^---[\s\S]*?---\s*/, ''); }
function section(title, path, by) {
  if (!fs.existsSync(path)) return '';
  var t = body(path).replace(/^# .*\r?\n/, '');
  return '## ' + title + '\n\n' + demote(plain(t), by || 1).trim() + '\n\n';
}
var out = [];
var date = new Date().toISOString().slice(0, 10);
out.push('# FAND Complete Reference', '', '*Generated ' + date + ' from the FAND Obsidian vault. Links are flattened to plain text.*', '',
  'This document collects everything built for FAND in one place:', '',
  '1. Overview', '2. Rules: Armor Class, materials, crafting, economy', '3. Professions (all 10, with specialties)', '4. Monsters', '5. Gods and contracts', '6. Realms', '7. Runes added', '8. Player-facing pages', '9. Full patch history', '',
  'The large databases aren\'t reproduced in full. They live in the vault: the Materials database (1,597 notes), the Bestiaries (103 homebrew and 643 official monsters), the Gathering pages, 6,503 Blueprints, and about 2,330 spells.', '', '---', '');
out.push('# 1. Overview', '', demote(plain(body(V + '/Development Summary.md').replace(/^# .*\r?\n/, '')), 1).trim(), '', '---', '');
out.push('# 2. Rules', '');
[['Armor Class', 'Armor Class.md'], ['Material Grading', 'Material Grading.md'], ['Material Properties', 'Material Properties.md'], ['Material Refining', 'Material Refining.md'],
  ['Crafting Rules', 'Crafting Rules.md'], ['Custom Blueprints', 'Custom Blueprints.md'], ['Economy', 'Economy.md'], ['Profession Progression', 'Profession Progression.md']].forEach(function (x) { out.push(section(x[0], A + '/' + x[1], 2)); });
out.push('---', '', '# 3. Professions', '', section('Master Professions', A + '/Master Professions.md', 2), section('Profession Quick Reference', A + '/Profession Quick Reference.md', 2));
['Blacksmithing', 'Carving', 'Tailoring', 'Alchemy (Profession)', 'Cooking', 'Enchanting', 'Engineering', 'Harvesting', 'Scavenging', 'Navigation'].forEach(function (n) { out.push(section(n.replace(' (Profession)', ''), A + '/Professions/' + n + '.md', 2)); });
out.push('---', '', '# 4. Monsters', '', section('Monster Stats', A + '/Monster Stats.md', 2));
var R = require('../data/realms.js'), W = {}, w1 = require('../data/world1.js'), w2 = require('../data/world2.js');
Object.keys(w1).forEach(function (k) { W[k] = w1[k]; }); Object.keys(w2).forEach(function (k) { W[k] = w2[k]; });
var counts = R.order.map(function (c) {
  var t = fs.readFileSync(A + '/Bestiary/' + R.name(c) + ' Bestiary.md', 'utf8');
  var off = (t.match(/^\| [^|]+ \| [\d/]+ \| [A-Za-z ]+ \d+ \| /gm) || []).length;
  var gat = (W[c].gather || []).length;
  return '| ' + R.name(c) + ' | ' + W[c].monsters.length + ' | ' + off + ' | ' + W[c].monsters.map(function (m) { return m[0]; }).join(', ') + ' | ' + gat + ' |';
});
out = out.concat(['## Bestiaries and gathering by realm', '', '| Realm | Homebrew monsters | Official monsters | Homebrew monster names | New gatherables |', '|---|---|---|---|---|'], counts, ['', '---', '']);
out.push('# 5. Gods and contracts', '', section('God Contracts', A + '/God Contracts.md', 2), section('God Roster', A + '/God Roster.md', 2), '---', '');
out.push('# 6. Realms', '', section('Realm Travel', A + '/Realm Travel.md', 2), section('Realm Map', A + '/Realm Map.md', 2));
['Mortal Realm', 'Mysterious Realm', 'Chaos Realm', 'Abyss', 'Inner Realm', 'Primordial Realm'].forEach(function (n) { out.push(section(n, V + '/Runes/' + n + '.md', 2)); });
out.push('---', '', '# 7. Runes added', '');
['Ignis', 'Sylph', 'Infinatas', 'Elves', 'Horn', 'Terraformation', 'Ambulance', 'Nick', 'Knocking', 'God-Specific Runes'].forEach(function (n) { out.push(section(n, V + '/Runes/' + n + '.md', 2)); });
out.push('---', '', '# 8. Player-facing pages', '', section("Player's Guide", A + "/Player's Guide.md", 2), '---', '');
out.push('# 9. Full patch history', '');
var notes = fs.readdirSync(V + '/Patch Notes').filter(function (f) { return /^Patch v[\d.]+\.md$/.test(f); })
  .sort(function (a, b) { return parseFloat(b.slice(7)) - parseFloat(a.slice(7)); });
notes.forEach(function (f) {
  var t = body(V + '/Patch Notes/' + f).replace(/\r?\n---\r?\nBack to[\s\S]*$/, '');
  out.push(demote(plain(t), 1).trim(), '');
});
var text = out.join('\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(OUT, text);
console.log('written', OUT, Math.round(text.length / 1024) + ' KB', text.split('\n').length + ' lines');
