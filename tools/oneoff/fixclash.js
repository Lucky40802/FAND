var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
var NAMES = ['Glaive', 'Blight', 'Clone', 'Confusion', 'Creation', 'Fear', 'Haste', 'Heal', 'Identify', 'Jump', 'Light', 'Resistance', 'Resurrection', 'Shield', 'Telepathy', 'Wish'];
var re = new RegExp('\\[\\[(' + NAMES.join('|') + ')(\\\\?\\|[^\\]]*)?\\]\\]', 'g');
var BK = SC + '/backup_clash';
if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
var changed = 0, links = 0;
function walk(d) {
  fs.readdirSync(d).forEach(function (f) {
    var p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) { if (/\/(Spells|Blueprints|Materials)$/.test(p)) return; return walk(p); }
    if (!/\.md$/.test(f)) return;
    var t = fs.readFileSync(p, 'utf8'), n = 0;
    var nt = t.split(/(\r?\n)/).map(function (line) {
      var inTable = /^\s*\|/.test(line);
      return line.replace(re, function (m, name, lab) {
        n++;
        var label = lab ? lab.replace(/^\\?\|/, '') : name;
        return '[[FAND/Runes/' + name + (inTable ? '\\|' : '|') + label + ']]';
      });
    }).join('');
    if (n) { changed++; links += n; if (MODE === 'go') { fs.writeFileSync(BK + '/' + p.replace(/[\/:]/g, '_'), t); fs.writeFileSync(p, nt); } }
  });
}
walk(V);
console.log(MODE, 'files', changed, 'links', links);
