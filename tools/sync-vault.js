// Mirrors the Obsidian vault into this repo's vault/ folder. app/FAND.html is NOT touched: it is built by generators/buildapp.js.
// Leaves out secrets and machine-local files: .mcp.json (writes a placeholder copy instead),
// .claude/, .obsidian/plugins/ (plugin data can hold API keys), .obsidian/workspace.json.
// Usage (from the repo's tools folder):  node sync-vault.js        -> dry run
//                                        node sync-vault.js go     -> copy and prune
var fs = require('fs'), path = require('path');
var VAULT = process.env.FAND_VAULT || 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND';
var REPO = path.join(__dirname, '..');
var DEST = path.join(REPO, 'vault');
var MODE = process.argv[2] || 'dry';
var OBSIDIAN_KEEP = ['app.json', 'appearance.json', 'core-plugins.json', 'community-plugins.json', 'graph.json'];
var SKIP_IN_FAND = ['Atrious/FAND.html']; // lives in app/
var stats = { copied: 0, unchanged: 0, removed: 0 };
function mkdirp(d) { if (fs.existsSync(d)) return; mkdirp(path.dirname(d)); fs.mkdirSync(d); }
function same(a, b) { if (!fs.existsSync(b)) return false; var sa = fs.statSync(a), sb = fs.statSync(b); return sa.size === sb.size && fs.readFileSync(a).equals(fs.readFileSync(b)); }
function copy(src, dst) { if (same(src, dst)) { stats.unchanged++; return; } stats.copied++; if (MODE === 'go') { mkdirp(path.dirname(dst)); fs.writeFileSync(dst, fs.readFileSync(src)); } }
var wanted = {};
function walk(srcDir, rel) {
  fs.readdirSync(srcDir).forEach(function (f) {
    var s = path.join(srcDir, f), r = rel ? rel + '/' + f : f;
    if (fs.statSync(s).isDirectory()) return walk(s, r);
    if (SKIP_IN_FAND.indexOf(r) >= 0) return;
    var d = path.join(DEST, 'FAND', r); wanted[path.normalize(d)] = 1; copy(s, d);
  });
}
walk(path.join(VAULT, 'FAND'), '');
[['CLAUDE.md', 'CLAUDE.md']].forEach(function (x) { var d = path.join(DEST, x[1]); wanted[path.normalize(d)] = 1; copy(path.join(VAULT, x[0]), d); });
OBSIDIAN_KEEP.forEach(function (f) { var s = path.join(VAULT, '.obsidian', f); if (!fs.existsSync(s)) return; var d = path.join(DEST, '.obsidian', f); wanted[path.normalize(d)] = 1; copy(s, d); });
// .mcp.json with the token replaced
var mcpSrc = path.join(VAULT, '.mcp.json');
if (fs.existsSync(mcpSrc)) {
  var ex = fs.readFileSync(mcpSrc, 'utf8').replace(/Bearer [A-Za-z0-9._-]+/g, 'Bearer YOUR_OBSIDIAN_LOCAL_REST_API_KEY');
  var md = path.join(DEST, '.mcp.example.json'); wanted[path.normalize(md)] = 1;
  if (!fs.existsSync(md) || fs.readFileSync(md, 'utf8') !== ex) { stats.copied++; if (MODE === 'go') { mkdirp(DEST); fs.writeFileSync(md, ex); } } else stats.unchanged++;
}
// prune files in vault/ that no longer exist in the vault
function prune(d) {
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(function (f) {
    var p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { prune(p); if (MODE === 'go' && !fs.readdirSync(p).length) fs.rmdirSync(p); return; }
    if (!wanted[path.normalize(p)]) { stats.removed++; if (MODE === 'go') fs.unlinkSync(p); }
  });
}
prune(DEST);
console.log(MODE, JSON.stringify(stats));
