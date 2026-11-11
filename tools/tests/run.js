#!/usr/bin/env node
// FAND browser regression tests.
//
//   node tools/tests/run.js            run everything (about 4 minutes; the page sweep is most of it)
//   node tools/tests/run.js focus ui   run only the spec files or tests whose name contains one of the words
//   node tools/tests/run.js --quick    skip the slow whole-site sweep
//   node tools/tests/run.js scripts    only the stand-alone scripts in tools/tests/scripts/ (about 12 minutes)
//
// Build first (cd tools && node generators/buildapp.js go): the tests drive the built site/ folder in a real
// Chromium through Playwright. Each test gets a fresh browser context, so nothing in localStorage carries over,
// and any uncaught page error fails the test. Specs live in tools/tests/specs/*.js; each exports a list of
// { name, run: async (t) => {} } and uses t.open(page), t.ok(cond, msg) and t.eq(actual, expected, msg).
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let playwright;
try { playwright = require('playwright'); } catch (e) {
  try { playwright = require(require('child_process').execFileSync('npm', ['root', '-g']).toString().trim() + '/playwright'); } catch (e2) {
    console.error('Playwright is not installed. Run: npm install -g playwright && npx playwright install chromium'); process.exit(2);
  }
}
const SITE = path.join(__dirname, '..', '..', 'site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(SITE, path.normalize(p));
      if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); rsp.end('not found'); return; }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

class Fail extends Error {}
(async () => {
  const args = process.argv.slice(2), quick = args.includes('--quick'), words = args.filter(a => !a.startsWith('--')).map(a => a.toLowerCase());
  if (!fs.existsSync(path.join(SITE, 'app.js'))) { console.error('site/app.js is missing: build first (cd tools && node generators/buildapp.js go)'); process.exit(2); }
  const srv = await serve(), base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await playwright.chromium.launch();
  const specDir = path.join(__dirname, 'specs');
  const all = [];
  fs.readdirSync(specDir).filter(f => f.endsWith('.js')).sort().forEach(f => {
    require(path.join(specDir, f)).forEach(T => all.push(Object.assign({ file: f.replace(/\.js$/, '') }, T)));
  });
  const pick = all.filter(T => (!quick || !T.slow) && (!words.length || words.some(w => T.file.includes(w) || T.name.toLowerCase().includes(w))));
  let pass = 0, fail = 0; const failed = [], t0 = Date.now();
  for (const T of pick) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 900 } }, T.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : {}, T.context || {}));
    const errs = [], notes = [];
    const t = {
      base, ctx, browser, notes,
      // open a page of the site and wait for the app to draw it
      open: async (pg, page) => {
        page = page || await ctx.newPage();
        if (!page.__fandErr) { page.__fandErr = 1; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept().catch(() => {})); }
        await page.goto(base + pg + '.html', { waitUntil: 'load', timeout: 60000 });
        await page.waitForFunction(() => typeof renderTab === 'function' && document.getElementById('content') && document.getElementById('content').children.length > 0, null, { timeout: 30000 });
        await page.waitForTimeout(300);
        return page;
      },
      ok: (c, msg) => { if (!c) throw new Fail(msg || 'expected true'); },
      eq: (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Fail((msg ? msg + ': ' : '') + 'got ' + JSON.stringify(a) + ', expected ' + JSON.stringify(b)); },
      note: s => notes.push(s),
    };
    const s0 = Date.now(); let err = null;
    try { await T.run(t); if (errs.length) err = 'page error: ' + errs.slice(0, 3).join(' | '); } catch (e) { err = e instanceof Fail ? e.message : (e.stack || String(e)).split('\n').slice(0, 3).join('\n   '); }
    await ctx.close();
    const label = T.file + ' › ' + T.name, secs = ((Date.now() - s0) / 1000).toFixed(1) + 's';
    if (err) { fail++; failed.push(label); console.log('✗ ' + label + ' (' + secs + ')\n   ' + err); }
    else { pass++; console.log('✓ ' + label + ' (' + secs + ')' + (notes.length ? '\n   ' + notes.join('\n   ') : '')); }
  }
  await browser.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + Math.round((Date.now() - t0) / 1000) + 's' + (failed.length ? '\nFailed:\n  ' + failed.join('\n  ') : ''));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
