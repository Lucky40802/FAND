// Finds class names that are styled in ways that can clash: a class with more than one site-wide rule of its own (`.x{}`
// twice, outside @media), and a class with a site-wide rule that is also styled as a part of other things (`.a .x{}`).
// Used by specs/cssclash.js; run `node tools/tests/cssclash.js --update` to accept the current set as the baseline.
const fs = require('fs'), path = require('path');
const CSS = path.join(__dirname, '..', 'app', 'parts', 'styles.css'), BASE = path.join(__dirname, 'css-baseline.json');
function topRules(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = []; let i = 0, depth = 0, start = 0, inMedia = [];
  for (; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') { const sel = css.slice(start, i).trim(); if (/^@/.test(sel)) { inMedia.push(depth); } else out.push({ sel, media: inMedia.length > 0 }); depth++; start = i + 1; }
    else if (ch === '}') { depth--; if (inMedia.length && inMedia[inMedia.length - 1] === depth) inMedia.pop(); start = i + 1; }
    else if (ch === ';' && depth === 0) start = i + 1;
  }
  return out;
}
function scan() {
  const rules = topRules(fs.readFileSync(CSS, 'utf8')), bare = {}, scoped = {};
  rules.forEach(r => r.sel.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
    const m = /^\.([A-Za-z][\w-]*)$/.exec(s); if (m) { if (!r.media) bare[m[1]] = (bare[m[1]] || 0) + 1; return; }
    const parts = s.split(/\s+|>|\+|~/).filter(Boolean); if (parts.length < 2) return;
    const last = /^\.([A-Za-z][\w-]*)(?![\w-])/.exec(parts[parts.length - 1]); if (last && !/^:root|^html|^body/.test(parts[0])) (scoped[last[1]] = scoped[last[1]] || new Set()).add(parts[0]);
  }));
  const found = [];
  Object.entries(bare).forEach(([c, n]) => { if (n > 1) found.push('twice: .' + c); if (scoped[c] && [...scoped[c]].some(a => a !== '.' + c && !a.startsWith('.' + c + '.') && !a.startsWith('.' + c + ':'))) found.push('mixed: .' + c); });
  return found.sort();
}
if (require.main === module) {
  const f = scan();
  if (process.argv.includes('--update')) { fs.writeFileSync(BASE, JSON.stringify(f, null, 1) + '\n'); console.log('baseline written: ' + f.length + ' known cases'); }
  else console.log(f.join('\n'));
}
module.exports = { scan, BASE };
