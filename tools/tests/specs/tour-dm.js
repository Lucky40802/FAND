// The DM's trading and treasure tutorial: it walks from the Shop to the Party page and points at each tool.
module.exports = [
  { name: 'tutorial: trading and treasure (DM) runs start to finish and its buttons open the tools', run: async t => {
    let p = await t.open('guide');
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    t.ok(/Trading and treasure \(DM\)/.test(await p.innerText('#content')), 'it is listed in the guide');
    await p.evaluate(() => { HC = []; setRole('dm'); PARTY.length = 0; PARTY.push({ id: 'a', name: 'Ara', gear: [], inv: [] }); saveParty(); openTour('dmtrade'); });
    await p.waitForTimeout(1500);
    const seen = [];
    for (let i = 0; i < 12; i++) {
      const h = await p.evaluate(() => { const g = $('gd'); return g ? g.querySelector('h3,h4,b').textContent : null; }).catch(() => null);
      if (!h) { await p.waitForTimeout(800); continue; }
      seen.push(h);
      if (/loot pool/i.test(h)) { const has = await p.isVisible('#gd [data-ga]'); t.ok(has, 'the loot pool step has a button'); }
      const last = await p.evaluate(() => /Done/.test(($('gd').querySelector('[data-gn]') || {}).textContent || ''));
      await p.click('#gd [data-gn]'); await p.waitForTimeout(900);
      if (last) break;
    }
    t.ok(seen.length === 9, 'all nine steps: ' + JSON.stringify(seen));
    t.ok(await p.evaluate(() => toursDone().includes('dmtrade')), 'finished');
    t.eq(errs, [], 'no errors on the way');
    await p.evaluate(() => { openTour('dmtrade', 5); }); await p.waitForTimeout(1200);
    await p.click('#gd [data-ga]'); await p.waitForTimeout(300);
    t.ok(await p.isVisible('#loot'), 'Open the loot pool opens it');
  } },
];
