// The style-clash guard: no new class may get a second site-wide rule, or a site-wide rule while it is also styled as a
// part of other things (that is how the realm dots were pushed below their text). Cases that were already there are in
// tools/tests/css-baseline.json; if a new one is meant, run `node tools/tests/cssclash.js --update`.
const { scan, BASE } = require('../cssclash.js');
module.exports = [
  { name: 'no new style clashes', run: async t => {
    const base = new Set(JSON.parse(require('fs').readFileSync(BASE, 'utf8'))), now = scan(), fresh = now.filter(x => !base.has(x));
    t.ok(!fresh.length, 'no new clashes' + (fresh.length ? ': ' + fresh.join(', ') + '. Rename the new class (for example with a prefix of its own), or if it is meant, run node tools/tests/cssclash.js --update' : ''));
    const gone = [...base].filter(x => !now.includes(x)); if (gone.length) console.log('   (fixed since the baseline: ' + gone.join(', ') + '; run node tools/tests/cssclash.js --update to tighten it)');
  } },
  { name: 'the guard catches the realm-dot clash', run: async t => {
    const fs = require('fs'), p = require('path').join(__dirname, '..', '..', 'app', 'parts', 'styles.css'), was = fs.readFileSync(p, 'utf8');
    try { fs.writeFileSync(p, was + '\n.sw{margin-top:12px}\n'); t.ok(scan().includes('mixed: .sw'), 'a site-wide .sw rule is caught'); } finally { fs.writeFileSync(p, was); }
  } },
];
