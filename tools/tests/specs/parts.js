// The page is built from tools/app/parts: every include in the template exists, each part is used once, and nothing of
// the include markers is left in the built page.
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..', '..');
module.exports = [
  { name: 'the template\'s parts: all present, each used once, and stitched cleanly', run: async t => {
    const tpl = fs.readFileSync(path.join(R, 'app', 'template.html'), 'utf8');
    const inc = [...tpl.matchAll(/^[ \t]*(?:\/\*@include (\S+?)\*\/|\/\/@include (\S+))[ \t]*$/gm)].map(m => m[1] || m[2]);
    t.ok(inc.length >= 10 && inc.every(p => fs.existsSync(path.join(R, 'app', p))), 'every include exists (' + inc.length + ')');
    const files = fs.readdirSync(path.join(R, 'app', 'parts')).filter(f => /\.(js|css)$/.test(f)).map(f => 'parts/' + f).sort();
    t.eq(inc.slice().sort(), files, 'every part is used, once');
    const app = fs.readFileSync(path.join(R, '..', 'site', 'app.js'), 'utf8'), html = fs.readFileSync(path.join(R, '..', 'site', 'index.html'), 'utf8');
    t.ok(!/@include parts\//.test(app) && !/@include parts\//.test(html), 'no include marker is left in the built site');
  } },
];
