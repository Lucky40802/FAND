var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND';
var files = [], full = {}, base = {};
function walk(d, rel) {
  fs.readdirSync(d).forEach(function (f) {
    if (f[0] === '.') return;
    var p = d + '/' + f, r = rel ? rel + '/' + f : f;
    if (fs.statSync(p).isDirectory()) return walk(p, r);
    var lower = r.toLowerCase();
    full[lower] = r;
    if (/\.md$/.test(f)) { files.push({ p: p, r: r }); full[lower.slice(0, -3)] = r; (base[f.slice(0, -3).toLowerCase()] = base[f.slice(0, -3).toLowerCase()] || []).push(r); }
    else base[f.toLowerCase()] = [r];
  });
}
walk(V, '');
var inCount = {}, outCount = {}, broken = {}, brokenFiles = {};
files.forEach(function (f) {
  var t = fs.readFileSync(f.p, 'utf8'), re = /!?\[\[([^\]]+)\]\]/g, m;
  outCount[f.r] = 0;
  while ((m = re.exec(t))) {
    var target = m[1].split('|')[0].replace(/\\$/, '').split('#')[0].trim();
    if (!target) continue;
    var tl = target.toLowerCase(), hit = full[tl] || full[tl + '.md'] || (base[tl] && base[tl][0]) || (base[tl.split('/').pop()] && base[tl.split('/').pop()][0]);
    if (!hit) { broken[target] = (broken[target] || 0) + 1; (brokenFiles[target] = brokenFiles[target] || {})[f.r] = 1; continue; }
    outCount[f.r]++;
    if (hit !== f.r) inCount[hit] = (inCount[hit] || 0) + 1;
  }
});
var bk = Object.keys(broken).sort(function (a, b) { return broken[b] - broken[a]; });
console.log('files', files.length, 'broken targets', bk.length, 'broken links', bk.reduce(function (s, k) { return s + broken[k]; }, 0));
bk.slice(0, 60).forEach(function (k) { console.log('  ' + broken[k] + '  [[' + k + ']]  in: ' + Object.keys(brokenFiles[k]).slice(0, 3).join('; ')); });
var orph = files.filter(function (f) { return !inCount[f.r] && !outCount[f.r]; }).map(function (f) { return f.r; });
var noIn = files.filter(function (f) { return !inCount[f.r]; }).length;
console.log('orphans (0 in, 0 out):', orph.length); orph.slice(0, 40).forEach(function (o) { console.log('  ' + o); });
console.log('notes with no incoming links:', noIn);
