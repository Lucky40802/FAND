var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious', D = A + '/Blueprints';
var MODE = process.argv[2] || 'dry';
var H = require(require('path').join(__dirname, '..', 'checks', 'htmlscan2.js')), t = H.t;
var s = H.span('BPS'), BPS = JSON.parse(t.slice(s.start, s.end));
var byName = {}; BPS.forEach(function (b, i) { byName[b.n.toLowerCase()] = b; });
var added = 0, updated = 0;
fs.readdirSync(D).forEach(function (f) {
  if (!/\.md$/.test(f)) return;
  var tx = fs.readFileSync(D + '/' + f, 'utf8'), g = function (k) { return ((tx.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '').trim(); };
  var prof = g('profession'); if (!prof) return;
  var n = f.slice(0, -3), dmg = g('damage'), dm = dmg.match(/^(\d+d\d+(?:\+\d+)?)\s+(.*)$/);
  var extra = { pr: prof, sp: g('specialty'), ac: g('ac'), prop: g('property') ? g('property') + ' (Potency ' + g('potency') + ')' : '', gr: g('materialGrade') };
  var b = byName[n.toLowerCase()];
  if (b) { Object.keys(extra).forEach(function (k) { if (extra[k]) b[k] = extra[k]; }); if (dm) { b.dc = dm[1]; b.dm = dm[2]; } var lvv = +g('level'); if (lvv) b.lv = lvv; updated++; return; }
  var body = tx.replace(/^---[\s\S]*?---/, '').replace(/^# .*$/m, '').replace(/^\*[^\r\n]*\*$/m, '').split(/\r?\n## /)[0];
  body = body.replace(/\*\*Stat variants:\*\*[^\r\n]*/, '').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\s+/g, ' ').trim();
  var o = { n: n, cat: g('category'), lv: +g('level') || 0, pr: prof, dc: dm ? dm[1] : '', dm: dm ? dm[2] : (dmg && !/^\d/.test(dmg) ? dmg : ''), r: g('rarity'), mg: 0, ds: body, mats: g('materials') ? g('materials').split(/\s*,\s*/) : [], conns: [] };
  Object.keys(extra).forEach(function (k) { if (extra[k]) o[k] = extra[k]; });
  BPS.push(o); byName[n.toLowerCase()] = o; added++;
});
var out = t.slice(0, s.start) + JSON.stringify(BPS) + t.slice(s.end);
var errs = [];
function rep(a, b2) { if (out.indexOf(a) < 0) { errs.push('miss: ' + a.slice(0, 60)); return; } out = out.split(a).join(b2); }
rep("const rs=[['Profession',`<strong>${esc(x.pr)}</strong>`],['Item Type',x.cat],['Level',x.lv],['Rarity',x.r]];",
  "const rs=[['Profession',`<strong>${esc(x.pr)}</strong>`],['Item Type',x.cat],['Level',x.lv],['Rarity',x.r]];\n    if(x.sp&&x.sp!==x.pr) rs.push(['Specialty',esc(x.sp)]);\n    if(x.gr) rs.push(['Material Grade',esc(x.gr)]);\n    if(x.ac) rs.push(['AC',esc(x.ac)]);\n    if(x.prop) rs.push(['Property',esc(x.prop)]);");
var total = BPS.length;
out = out.replace(/(<span class="tab-n" id="tn-blueprints">)[\d,]+(<\/span>)/, '$1' + total.toLocaleString() + '$2').replace(/(id="pill-bp">)[\d,]+( Blueprints)/, '$1' + total.toLocaleString() + '$2');
console.log(MODE, 'updated', updated, 'added', added, 'total', total, 'errors', errs, 'size', t.length, '->', out.length);
if (MODE === 'go') { fs.writeFileSync(SC + '/FAND.html.bps.bak', t); fs.writeFileSync(A + '/FAND.html', out); console.log('written'); }
