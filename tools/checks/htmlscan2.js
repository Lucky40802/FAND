var fs = require('fs'), t = fs.readFileSync('C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/FAND.html', 'utf8');
function at(name) { var m = new RegExp('(const|let|var)\\s+' + name + '\\s*=').exec(t); return m ? m.index : -1; }
function show(name, n) { var i = at(name); console.log('== ' + name + ' @' + i + ': ' + t.slice(i, i + (n || 500)).replace(/\n/g, ' ')); }
function span(name) {
  var i = at(name), s = t.indexOf('=', i) + 1; while (/\s/.test(t[s])) s++;
  var depth = 0, j = s, items = 0;
  for (; j < t.length; j++) {
    var ch = t[j];
    if (ch === '"' || ch === "'") { var q = ch; j++; while (t[j] !== q) { if (t[j] === '\\') j++; j++; } continue; }
    if (ch === '[' || ch === '{') { depth++; if (depth === 2) items++; }
    else if (ch === ']' || ch === '}') { depth--; if (depth === 0) break; }
  }
  return { start: s, end: j + 1, items: items };
}
module.exports = { t: t, at: at, span: span };
if (require.main === module) {
  ['BPS', 'SPELLS', 'MATS', 'SUBS', 'GODS', 'MAT_FX', 'PARTY', 'CLASSES'].forEach(function (k) { show(k, 400); });
  ['BPS', 'SPELLS', 'MATS', 'SUBS', 'GODS', 'DEMONS', 'PATRONS', 'MAT_FX', 'PARTY'].forEach(function (k) { var r = span(k); console.log(k, 'items', r.items, 'span', r.start, r.end); });
}
