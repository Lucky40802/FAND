var fs = require('fs');
var D = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Blueprints';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var MAP = require(require('path').join(__dirname, '..', 'data', 'profmap.js'));
var groups = require(require('path').join(__dirname, '..', 'data', 'dups.json')).names.concat(require(require('path').join(__dirname, '..', 'data', 'dups.json')).body);
var BK = SC + '/dedup_backup'; if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var removed = [], renamed = [], kept = [], skipped = [], seen = {};
var oldTag = new RegExp(' \\((' + Object.keys(MAP).join('|') + ')( \\d+)?\\)$');
groups.forEach(function (g) {
  g = g.filter(function (n) { return !seen[n] && fs.existsSync(D + '/' + n + '.md'); });
  if (g.length < 2) return;
  var info = g.map(function (n) { var t = fs.readFileSync(D + '/' + n + '.md', 'utf8'); return { n: n, t: t, prof: (t.match(/^profession:\s*"([^"]*)"/m) || [])[1], len: t.replace(/^---[\s\S]*?---/, '').length }; });
  var profs = {}; info.forEach(function (x) { profs[x.prof] = 1; });
  if (Object.keys(profs).length > 1) { skipped.push(g.join(' | ')); return; }
  info.sort(function (a, b) { return b.len - a.len || a.n.length - b.n.length; });
  var keep = info[0];
  info.slice(1).forEach(function (x) { removed.push(x.n); seen[x.n] = 1; if (MODE === 'go') { fs.writeFileSync(BK + '/' + x.n + '.md', x.t); fs.unlinkSync(D + '/' + x.n + '.md'); } });
  seen[keep.n] = 1;
  var clean = keep.n.replace(oldTag, '');
  if (clean !== keep.n && !fs.existsSync(D + '/' + clean + '.md') || (clean !== keep.n && removed.indexOf(clean) >= 0)) {
    renamed.push(keep.n + ' -> ' + clean);
    if (MODE === 'go') { var nt = keep.t.replace(/^# .*$/m, '# ' + clean); fs.writeFileSync(BK + '/' + keep.n + '.md', keep.t); fs.unlinkSync(D + '/' + keep.n + '.md'); fs.writeFileSync(D + '/' + clean + '.md', nt); }
  } else kept.push(keep.n);
});
console.log(MODE, 'removed', removed.length, 'renamed', renamed.length, 'kept as-is', kept.length, 'skipped (different professions)', skipped.length);
console.log('renamed:\n  ' + renamed.join('\n  '));
console.log('skipped:\n  ' + skipped.join('\n  '));
fs.writeFileSync(require('path').join(__dirname, '..', 'data', 'dedup_result.json'), JSON.stringify({ removed: removed, renamed: renamed }));
