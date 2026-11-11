// The stand-alone test scripts in tools/tests/scripts/*.test.js, one test each. Each script drives the built site in
// its own Chromium (node <script> <site folder>), prints "ok"/"FAIL" lines, and ends with ALL PASSED, N FAILED, or a
// sweep summary; screenshots go to tools/tests/out/. Run just these with: node tools/tests/run.js scripts
const path = require('path'), fs = require('fs'), { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..', '..', '..'), DIR = path.join(__dirname, '..', 'scripts'), OUT = path.join(__dirname, '..', 'out');
const run = f => new Promise(res => {
  fs.mkdirSync(OUT, { recursive: true });
  execFile(process.execPath, [path.join(DIR, f), path.join(ROOT, 'site')], { cwd: ROOT, env: Object.assign({}, process.env, { S: OUT }), timeout: 300000, maxBuffer: 1 << 24 },
    (err, out, errOut) => res({ code: err ? (err.killed ? 'timeout' : err.code || 1) : 0, out: String(out || '') + String(errOut || '') }));
});
module.exports = fs.readdirSync(DIR).filter(f => f.endsWith('.test.js')).sort().map(f => ({
  name: 'script ' + f.replace(/\.test\.js$/, ''), run: async t => {
    const r = await run(f), bad = r.out.split('\n').filter(l => /^\s*FAIL\b|\b\d+ FAILED\b|^(Type|Reference|Syntax)Error|Error: /.test(l));
    t.ok(r.code === 0 && !bad.length, (r.code ? 'exit ' + r.code + '. ' : '') + (bad.slice(0, 4).join(' | ') || r.out.trim().split('\n').slice(-3).join(' | ')).slice(0, 600));
  } }));
