// Saved searches: a list page's search and filters are kept and shown on Home; opening one brings them back.
module.exports = [
  { name: 'saved searches: save from a list, open from Home, remove with Undo', run: async t => {
    let p = await t.open('materials');
    await p.evaluate(() => { store.set('savedq', []); window.prompt = () => 'Diving metals'; });
    t.ok(!(await p.isVisible('.sq-save')), 'nothing to save with no search');
    await p.fill('#q', 'hawk'); await p.waitForTimeout(500);
    await p.evaluate(() => { st('materials').f.tr = 'Diving Strike'; renderList(); updateActive(); }).catch(() => {});
    await p.waitForTimeout(200);
    const want = await p.evaluate(() => filtered().length);
    await p.click('.sq-save'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => store.get('savedq').map(x => [x.tab, x.name, x.s.q, x.s.f.tr])), [['materials', 'Diving metals', 'hawk', 'Diving Strike']], 'saved with its name, search and filters');
    await p.click('.sq-save'); await p.waitForTimeout(150);
    t.ok(/already saved/.test(await p.innerText('#toast')), 'the same search is not saved twice');
    p = await t.open('index', p);
    t.ok(/Saved searches/.test(await p.innerText('#content')) && /Diving metals/.test(await p.innerText('.sq-grid')), 'it shows on Home');
    await p.click('.sq-open'); await p.waitForTimeout(1200);
    t.ok(/materials/.test(p.url()) && await p.evaluate(w => st('materials').q === 'hawk' && st('materials').f.tr === 'Diving Strike' && filtered().length === w, want), 'opening it brings back the search and the filter');
    p = await t.open('index', p);
    await p.click('.sq-x'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => store.get('savedq').length), 0, 'removed');
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => store.get('savedq').length), 1, 'Undo brings it back');
  } },
  { name: 'saved searches on a phone', phone: true, run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => { store.set('savedq', [{ id: 'sq1', tab: 'bestiary', name: 'Hell grade 5 monsters with a very long name that goes on', s: { q: '', f: {}, tg: {}, side: '' } }]); renderHome(); }); await p.waitForTimeout(150);
    t.ok(await p.isVisible('.sq-card'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
