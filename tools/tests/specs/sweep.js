// Every page on desktop and phone: no script errors, no sideways scroll, no duplicate ids.
const fs = require('fs'), path = require('path');
const PAGES = fs.readdirSync(path.join(__dirname, '..', '..', '..', 'site')).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const sweep = phone => async t => {
  const bad = [];
  for (const pg of PAGES) {
    const p = await t.ctx.newPage();
    try {
      await t.open(pg, p);
      const r = await p.evaluate(() => {
        const ids = {}; document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
        return { h: document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0, dup: Object.keys(ids).filter(k => ids[k] > 1) };
      });
      if (r.h) bad.push(pg + ': page is ' + r.h + 'px wide');
      if (r.dup.length) bad.push(pg + ': duplicate ids ' + r.dup.slice(0, 5).join(', '));
    } catch (e) { bad.push(pg + ': ' + e.message.split('\n')[0]); }
    await p.close();
  }
  t.eq(bad, [], (phone ? 'phone' : 'desktop') + ' sweep');
};
module.exports = [
  { name: 'every page on desktop', slow: true, run: sweep(false) },
  { name: 'every page on a phone', slow: true, phone: true, run: sweep(true) },
];
