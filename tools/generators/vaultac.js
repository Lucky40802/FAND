// Updates the AC of every armor and shield Blueprint note in the vault to FAND's flat system
// (a full set of iron gear gives 10; see data/armor.js), so the vault matches the website.
// Usage (from the tools folder):  node generators/vaultac.js            dry run: prints a report and samples
//                                 node generators/vaultac.js go         writes the notes (backs them up first)
//                                 node generators/vaultac.js go "<vault>/FAND/Atrious/Blueprints"
// For each note with category Armor or Shield it sets `ac` to the new value and keeps the old one as `acOld`
// (only the first time, so rerunning is safe). It uses the note's `slot` and `materials` frontmatter and the
// material grades from site/data/core.js, so run `node generators/buildapp.js go` first.
var fs = require('fs'), path = require('path');
var MODE = process.argv[2] || 'dry';
var DIR = process.argv[3] || 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var BK = path.join(__dirname, '..', 'out', 'backup_blueprints_ac');
var ARM = require(path.join(__dirname, '..', 'data', 'armor.js'));
if (!fs.existsSync(DIR)) { console.log('Blueprints folder not found: ' + DIR + '\nPass the path: node generators/vaultac.js go "<vault>/FAND/Atrious/Blueprints"'); process.exit(1); }
var core = fs.readFileSync(path.join(__dirname, '..', '..', 'site', 'data', 'core.js'), 'utf8'), MATS = null;
core.split('\n').forEach(function (l) { if (l.indexOf('const MATS=') === 0) MATS = JSON.parse(l.slice(11, -1)); });
var byName = {}; MATS.forEach(function (m) { byName[m.n.toLowerCase()] = m; });
function walk(d, out) { fs.readdirSync(d).forEach(function (f) { var p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.md$/i.test(f)) out.push(p); }); return out; }
function field(t, k) { var m = new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?\\s*$', 'm').exec(t); return m ? m[1].trim() : ''; }
var changed = 0, same = 0, noMats = 0, total = 0, unknown = {}, bySlot = {}, samples = [];
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK, { recursive: true });
walk(DIR, []).forEach(function (file) {
  var t = fs.readFileSync(file, 'utf8');
  var cat = field(t, 'category'); if (cat !== 'Armor' && cat !== 'Shield') return;
  var fm = /^---\r?\n[\s\S]*?\r?\n---/.exec(t); if (!fm) return;
  total++;
  var name = path.basename(file, '.md');
  var names = field(t, 'materials').split(/\s*,\s*/).filter(Boolean);
  var mats = names.map(function (n) { var m = byName[n.toLowerCase()]; if (!m) unknown[n] = (unknown[n] || 0) + 1; return m; }).filter(Boolean);
  if (!mats.length) noMats++;
  var r = ARM.armorAC(name, cat, mats, field(t, 'slot'));
  var old = field(t, 'ac'), next = String(r.ac);
  bySlot[r.slot] = (bySlot[r.slot] || 0) + 1;
  if (old === next) { same++; return; }
  if (samples.length < 15) samples.push(name + ': ' + (old || '-') + ' -> ' + next + ' [' + r.slot + ']');
  var nl = /\r\n/.test(t) ? '\r\n' : '\n', head = fm[0];
  if (/^ac:/m.test(head)) head = head.replace(/^ac:[^\r\n]*/m, 'ac: "' + next + '"');
  else head = head.replace(/\r?\n---$/, nl + 'ac: "' + next + '"' + nl + '---');
  if (!/^acOld:/m.test(head) && old) head = head.replace(/^(ac:[^\r\n]*)/m, '$1' + nl + 'acOld: "' + old + '"');
  changed++;
  if (MODE === 'go') { fs.writeFileSync(path.join(BK, path.basename(file)), t); fs.writeFileSync(file, head + t.slice(fm[0].length)); }
});
console.log(MODE + ': ' + total + ' armor and shield notes, ' + changed + ' to update, ' + same + ' already right');
console.log('by slot: ' + JSON.stringify(bySlot));
if (noMats) console.log(noMats + ' notes list no known materials; they use the lowest class (hide/cloth, Item Level 1)');
var u = Object.keys(unknown); if (u.length) console.log('materials not found in the website data (' + u.length + '): ' + u.slice(0, 20).join(', ') + (u.length > 20 ? ', …' : ''));
console.log(samples.join('\n'));
if (MODE === 'go') console.log('written; originals backed up to ' + BK);
