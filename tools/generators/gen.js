var fs = require('fs');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious';
var SC = require('path').join(__dirname, '..', 'data');
var DRY = process.argv[2] !== 'go';
var all = require(require('path').join(__dirname, '..', 'data', 'data1.js')).concat(require(require('path').join(__dirname, '..', 'data', 'data2.js')));
var made = 0, skipped = 0, byClass = {};
var bk = SC + '/backup_classes';
if (!DRY && !fs.existsSync(bk)) fs.mkdirSync(bk);

all.forEach(function (x) {
  var p = ROOT + '/Subclasses/' + x.n + '.md';
  if (fs.existsSync(p)) { console.log('SKIP exists: ' + x.n); skipped++; return; }
  var L = [];
  L.push('# ' + x.n, '');
  L.push('*Unofficial summary of an official subclass — ' + x.s + '. Paraphrased from memory in my own words; check the book for exact wording and numbers.*', '');
  L.push('## Overview', x.o, '');
  L.push('## Level Unlocks', '| Level | Feature | Effect |', '|---|---|---|');
  x.f.forEach(function (r) { L.push('| ' + r[0] + ' | ' + r[1] + ' | ' + r[2] + ' |'); });
  L.push('', '## Gameplay Identity', '- ' + x.g, '');
  L.push('## Related', '- [[FAND/Atrious/Classes/' + x.c + '|' + x.c + ']]');
  if (x.r) L.push('- [[' + x.r + ']] (thematically related Rune; not in the Class acquisition table)');
  if (x.sch) L.push('- [[FAND/Atrious/Spells/' + x.sch + ' (School)|' + x.sch + ' (School)]]');
  L.push('');
  if (!DRY) fs.writeFileSync(p, L.join('\n'));
  made++;
  (byClass[x.c] = byClass[x.c] || []).push('- [[FAND/Atrious/Subclasses/' + x.n + '|' + x.n + ']] (official — ' + x.s + ')');
});

Object.keys(byClass).forEach(function (c) {
  var p = ROOT + '/Classes/' + c + '.md';
  var t = fs.readFileSync(p, 'utf8');
  var lines = t.split(/\r?\n/);
  var s = lines.indexOf('## Available Subclasses');
  if (s < 0) throw new Error('no section in ' + c);
  var last = s;
  for (var i = s + 1; i < lines.length && !/^## /.test(lines[i]); i++) if (/^- \[\[FAND\/Atrious\/Subclasses\//.test(lines[i])) last = i;
  var add = byClass[c].filter(function (l) { return t.indexOf(l.split('|')[0]) < 0; });
  Array.prototype.splice.apply(lines, [last + 1, 0].concat(add));
  if (!DRY) { fs.writeFileSync(bk + '/' + c + '.md', t); fs.writeFileSync(p, lines.join('\n')); }
  console.log(c + ': +' + add.length);
});
console.log((DRY ? 'DRY ' : '') + 'made ' + made + ', skipped ' + skipped);
