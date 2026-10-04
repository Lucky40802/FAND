// Replaces the spell list in app/FAND.html with the spells from the vault's Spells folder.
// Usage (from the tools folder):  node generators/importspells.js "<vault>/FAND/Atrious/Spells"        dry run, prints a report
//                                 node generators/importspells.js "<vault>/FAND/Atrious/Spells" go     writes app/FAND.html
// Then run `node generators/buildapp.js go` to rebuild the website.
// Reads each note's frontmatter. Recognised keys (any case, spaces or underscores): school, level, casting time,
// range, duration, damage, class / classes. The description is the first paragraph of the note body.
var fs = require('fs'), path = require('path');
var DIR = process.argv[2], MODE = process.argv[3] || 'dry';
var APP = path.join(__dirname, '..', '..', 'app', 'FAND.html');
if (!DIR || !fs.existsSync(DIR)) { console.log('Give the path to the vault Spells folder, e.g.\n  node generators/importspells.js "C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Spells"'); process.exit(1); }
function walk(d, out) { fs.readdirSync(d).forEach(function (f) { var p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.md$/i.test(f)) out.push(p); }); return out; }
var KEYS = { school: 'sc', level: 'lv', castingtime: 'ct', casttime: 'ct', time: 'ct', range: 'rng', duration: 'dur', damage: 'dmg', class: 'cls', classes: 'cls' };
var unknown = {}, spells = [], skipped = 0;
walk(DIR, []).forEach(function (file) {
  var tx = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  var fm = /^---\n([\s\S]*?)\n---\n?/.exec(tx); if (!fm) { skipped++; return; }
  var o = { n: path.basename(file, '.md'), sc: '', lv: 0, ct: '', rng: '', dur: '', dmg: '', cls: [], desc: '' };
  fm[1].split('\n').forEach(function (line) {
    var m = /^([A-Za-z _-]+):\s*(.*)$/.exec(line); if (!m) return;
    var k = m[1].toLowerCase().replace(/[ _-]/g, ''), v = m[2].trim().replace(/^["']|["']$/g, '');
    var f = KEYS[k]; if (!f) { unknown[k] = (unknown[k] || 0) + 1; return; }
    if (f === 'lv') o.lv = /cantrip/i.test(v) ? 0 : (parseInt(v, 10) || 0);
    else if (f === 'cls') o.cls = v.replace(/^\[|\]$/g, '').replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2').split(/\s*,\s*/).filter(Boolean);
    else o[f] = v.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2');
  });
  var body = tx.slice(fm[0].length).replace(/^#.*\n/gm, '').trim().split(/\n\s*\n/)[0] || '';
  o.desc = body.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  spells.push(o);
});
spells.sort(function (a, b) { return a.n < b.n ? -1 : 1; });
var html = fs.readFileSync(APP, 'utf8');
var m = /const SPELLS=\[[\s\S]*?\];\n/.exec(html);
if (!m) { console.log('SPELLS not found in ' + APP); process.exit(1); }
console.log('notes read: ' + spells.length + ', skipped (no frontmatter): ' + skipped);
console.log('with classes: ' + spells.filter(function (s) { return s.cls.length; }).length + ', with school: ' + spells.filter(function (s) { return s.sc; }).length);
console.log('frontmatter keys not used: ' + JSON.stringify(unknown));
console.log('example: ' + JSON.stringify(spells[0]));
if (MODE === 'go') {
  fs.writeFileSync(APP, html.slice(0, m.index) + 'const SPELLS=' + JSON.stringify(spells).replace(/<\/(script)/gi, '<\\/$1') + ';\n' + html.slice(m.index + m[0].length));
  console.log('written: ' + APP + ' (now run: node generators/buildapp.js go)');
}
