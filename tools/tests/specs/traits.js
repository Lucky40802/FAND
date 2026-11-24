// Traits, searchable: the site search finds peoples' traits and materials' unique traits by name or by what they do,
// and a trait browser lists them all.
module.exports = [
  { name: 'search finds traits by name and by what they do', run: async t => {
    const p = await t.open('index');
    await p.keyboard.press('Control+k'); await p.fill('#pq', 'darkvis'); await p.waitForTimeout(200);
    const g = await p.innerText('#pres').catch(() => p.innerText('#pbg'));
    t.ok(/Traits/i.test(g) && /Darkvision/.test(g) && /trait of/.test(g), 'Darkvision shows under Traits, with who has it');
    await p.fill('#pq', 'diving strike'); await p.waitForTimeout(200);
    t.ok(/material trait · 176 materials/.test(await p.innerText('#pbg')), 'a material trait says how many materials carry it');
    await p.click('#pbg .pal-i:has-text("Diving Strike")'); await p.waitForTimeout(900);
    t.ok(/materials/.test(p.url()) && await p.evaluate(() => { const L = filtered(); return L.length === 176 && L.every(m => m.tr && m.tr.n === 'Diving Strike'); }), 'picking it lists those 176 materials');
  } },
  { name: 'trait browser: search names and descriptions, filter peoples or materials, open a people', run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => traitBrowse()); await p.waitForTimeout(200);
    const count = async () => +((await p.innerText('#tb-out')).match(/([\d,]+) traits?/)[1].replace(/,/g, ''));
    t.ok(await count() > 1000, 'every trait is listed: ' + await count());
    await p.fill('#tb-q', 'fey ancestry'); await p.waitForTimeout(150);
    t.ok(/Fey Ancestry/.test(await p.innerText('#tb-out')) && await p.evaluate(() => document.querySelectorAll('#tb-out [data-tbp]').length) >= 8, 'a people trait shows the peoples who have it');
    await p.fill('#tb-q', 'regain'); await p.waitForTimeout(150); const all = await count();
    t.ok(all > 0 && !(await p.evaluate(() => [...document.querySelectorAll('#tb-out .tb-h b')].every(b => /regain/i.test(b.textContent)))), 'it searches what a trait does, not just its name');
    await p.click('#tb-k [data-tbk="people"]'); await p.waitForTimeout(150);
    t.ok(await count() < all && await p.evaluate(() => [...document.querySelectorAll('#tb-out .tb-h .b')].every(b => b.textContent === 'People')), 'Peoples narrows it');
    await p.fill('#tb-q', 'fey ancestry'); await p.waitForTimeout(150);
    const who = await p.evaluate(() => document.querySelector('#tb-out [data-tbp]').dataset.tbp);
    await p.click('#tb-out [data-tbp]'); await p.waitForTimeout(300);
    t.ok((await p.innerText('#peopleHost')).includes(who), 'a people chip opens that people');
  } },
  { name: 'trait browser on a phone', phone: true, run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => traitBrowse('fire')); await p.waitForTimeout(200);
    t.ok(await p.isVisible('#tb-q'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
