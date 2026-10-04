var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var ROOT = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
var MODE = process.argv[2] || 'dry';
var R = require(require('path').join(__dirname, '..', 'data', 'realms.js'));
var gods = require(require('path').join(__dirname, '..', 'data', 'gods.js')), hands = require(require('path').join(__dirname, '..', 'data', 'hands.js'));
var h2 = require(require('path').join(__dirname, '..', 'data', 'hands2.js')); Object.keys(h2).forEach(function (k) { hands[k] = h2[k]; });
var all = require(require('path').join(__dirname, '..', 'data', 'all.json')), mat = {};
all.forEach(function (m) { mat[m.n] = m; });
var errs = [];
function matLink(n) {
  var m = mat[n]; if (!m) { errs.push('material ' + n); return n; }
  var f = fs.existsSync(ROOT + '/Atrious/Materials/' + n + '.md') ? n : n + ' (Material)';
  if (!fs.existsSync(ROOT + '/Atrious/Materials/' + f + '.md')) errs.push('file ' + f);
  return { txt: '[[FAND/Atrious/Materials/' + f + '|' + n + ']] (' + R.name(m.c) + ' ' + m.g + ')', rank: R.rank(m.c, m.g) };
}
var runeOwners = {};
gods.forEach(function (g) {
  if (g[8] && (!hands[g[0]] || hands[g[0]].length !== g[8])) errs.push('hand count ' + g[0] + ' ' + (hands[g[0]] || []).length + '/' + g[8]);
  g[3].forEach(function (r) { if (!fs.existsSync(ROOT + '/Runes/' + r + '.md')) errs.push('rune ' + r); (runeOwners[r] = runeOwners[r] || []).push(g[0]); });
  if (!fs.existsSync(ROOT + '/Runes/' + g[4] + '.md')) errs.push('realm ' + g[4]);
});
var tiers = ['Normal', 'Senior', 'Apostle'];
var L = ['# God Roster', '',
  'Every god that offers [[FAND/Atrious/God Contracts|contracts]] in FAND. Each is a replica built from the Runes of a dead original god (see [[Runes]]). A god\'s power is the Runes it holds, so **gods that hold the same Rune are rivals**: each wants the other\'s share. Only [[Infinatas]] is still an original.', '',
  'The pantheons are drawn from real-world mythology (see the [[FAND/Atrious/Gods Index|Gods Index]]). In FAND they are the current holders of those names and Runes, not necessarily the gods from the myths.', '',
  '## How to read an entry',
  '- **Runes:** the Laws the god holds. Its contractors\' spells come from these.',
  '- **Home realm:** where its temple-palace stands. Its Apostles can use that realm as a Realm Forge.',
  '- **Wants:** the duties it gives contractors.',
  '- **Signature materials:** what it rewards contractors with at Normal, Senior, and Apostle rank (see Rewards in [[FAND/Atrious/God Contracts|God Contracts]]).',
  '- **Finger relic:** the unique item carried by its 1st Finger.',
  '- **The Hand:** how many of its five Finger seats are filled. Empty seats can be claimed.',
  '- **Rivals:** gods that share one of its Runes.', '',
  '## At a glance', '| God | Pantheon | Runes | Home realm | Fingers seated |', '|---|---|---|---|---|'];
gods.forEach(function (g) { L.push('| ' + g[0] + ' | ' + g[1] + ' | ' + g[3].join(', ') + ' | ' + g[4] + ' | ' + g[8] + ' of 5 |'); });
L.push('');
var order = ['Greek', 'Norse', 'Egyptian', 'Hindu', 'Japanese', 'Mesopotamian', 'Aztec', 'Celtic'];
order.forEach(function (p) {
  L.push('## ' + p + ' Pantheon', '');
  gods.filter(function (g) { return g[1] === p; }).forEach(function (g) {
    var mats = g[6].map(matLink).filter(function (x) { return x.txt; }).sort(function (a, b) { return a.rank - b.rank; });
    var riv = {};
    g[3].forEach(function (r) { runeOwners[r].forEach(function (o) { if (o !== g[0]) (riv[o] = riv[o] || []).push(r); }); });
    var rivTxt = Object.keys(riv).map(function (o) { return o + ' (' + riv[o].join(', ') + ')'; }).join(', ') || 'none by Rune';
    var relic = g[7].split(': ');
    L.push('### ' + g[0], '*' + g[2] + ' · [[' + g[4] + ']]*', '',
      '- **Runes:** ' + g[3].map(function (r) { return '[[' + r + ']]'; }).join(', '),
      '- **Wants:** ' + g[5],
      '- **Signature materials:** ' + mats.map(function (x, i) { return tiers[i] + ': ' + x.txt; }).join(' · '),
      '- **Finger relic:** **' + relic[0] + '**: ' + relic.slice(1).join(': '),
      '- **The Hand:** ' + g[8] + ' of 5 seated' + (g[8] < 5 ? ' (' + (5 - g[8]) + ' open, lowest seats first)' : ''));
    if (hands[g[0]]) hands[g[0]].forEach(function (h, i) { L.push('  - ' + ['1st', '2nd', '3rd', '4th', '5th'][i] + ' Finger: ' + h); });
    L.push('- **Rivals:** ' + rivTxt, '');
  });
});
L.push('## Not on the roster',
  '- **[[Infinatas]]**, the last original god, offers no known contracts.',
  '- The [[FAND/Atrious/Demons/Demon Princes — The Abyss|Demon Princes]] and [[FAND/Atrious/Demons/Archdevils — The Nine Hells|Archdevils]] offer [[Pacts]], not contracts.', '',
  '## Related', '- [[FAND/Atrious/God Contracts|God Contracts]]', '- [[FAND/Atrious/Gods Index|Gods Index]]', '- [[FAND/Atrious/Material Index|Material Index]]', '');
console.log('errors', errs);
var shared = Object.keys(runeOwners).filter(function (r) { return runeOwners[r].length > 1; }).map(function (r) { return r + ': ' + runeOwners[r].join('/'); });
console.log('contested runes', shared.length, shared.join('; '));
if (MODE === 'go' && !errs.length) { fs.writeFileSync(ROOT + '/Atrious/God Roster.md', L.join('\n')); console.log('written'); }
