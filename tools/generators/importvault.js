// Copies the vault's notes into tools/data/vault.json so the website can show them in its Codex.
// Usage (from the tools folder):  node generators/importvault.js                 dry run: prints what would be imported
//                                 node generators/importvault.js go              writes tools/data/vault.json
//                                 node generators/importvault.js go "<vault>/FAND"
// Then run `node generators/buildapp.js go` and commit tools/data/vault.json with the rebuilt site.
// Every folder is imported. The build attaches notes that match a website entry (Blueprint, material, spell, subclass,
// monster, god) to that entry as "From the vault"; the rest go in the Codex. Where a note and the website disagree,
// the website takes priority (see SUPERSEDED in tools/app/template.html).
var fs = require('fs'), path = require('path');
var MODE = process.argv[2] || 'dry';
var ROOT = process.argv[3] || 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var OUT = process.env.VAULT_OUT || path.join(__dirname, '..', 'data', 'vault.json');
var SKIP = /(^|\/)(\.obsidian|\.trash|templates?)(\/|$)/i;
if (!fs.existsSync(ROOT)) { console.log('Vault folder not found: ' + ROOT + '\nPass it: node generators/importvault.js go "<vault>/FAND"'); process.exit(1); }
function walk(d, out) {
  fs.readdirSync(d).forEach(function (f) {
    var p = path.join(d, f), rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP.test(rel)) return;
    if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.md$/i.test(f)) out.push({ p: p, rel: rel });
  });
  return out;
}
var notes = [], bytes = 0, skippedEmpty = 0;
walk(ROOT, []).forEach(function (f) {
  var t = fs.readFileSync(f.p, 'utf8').replace(/\r\n/g, '\n'), fm = {};
  var m = /^---\n([\s\S]*?)\n---\n?/.exec(t);
  if (m) {
    m[1].split('\n').forEach(function (l) { var k = /^([\w -]+):\s*(.*)$/.exec(l); if (k && k[2] && k[2].length < 300) fm[k[1].trim()] = k[2].trim().replace(/^["']|["']$/g, ''); });
    t = t.slice(m[0].length);
  }
  t = t.trim(); if (!t) { skippedEmpty++; return; }
  var folder = path.dirname(f.rel); if (folder === '.') folder = 'FAND';
  notes.push({ n: path.basename(f.rel, '.md'), f: folder, fm: fm, md: t });
  bytes += t.length;
});
notes.sort(function (a, b) { return (a.f + '/' + a.n).localeCompare(b.f + '/' + b.n); });
var byFolder = {}; notes.forEach(function (n) { byFolder[n.f] = (byFolder[n.f] || 0) + 1; });
console.log(MODE + ': ' + notes.length + ' notes (' + (bytes / 1e6).toFixed(2) + ' MB of text), ' + skippedEmpty + ' empty notes skipped');
Object.keys(byFolder).sort().forEach(function (k) { console.log('  ' + k + ': ' + byFolder[k]); });
if (MODE === 'go') { fs.writeFileSync(OUT, JSON.stringify({ imported: new Date().toISOString().slice(0, 10), notes: notes })); console.log('written ' + OUT + '\nNow run: node generators/buildapp.js go'); }
