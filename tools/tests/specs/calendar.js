// Calendar and downtime: the day comes from the session clock; downtime costs coin, takes days, and finishes on its own.
module.exports = [
  { name: 'calendar: start downtime, pay for it, advance days, it finishes (and work pays); coming events', run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { PARTY.length = 0; PARTY.push({ id: 'c1', name: 'Ara', cls: 'Rogue', level: 3, coins: { gp: 200 }, gear: [], inv: [] }, { id: 'c2', name: 'Bo', cls: 'Fighter', level: 3, coins: { gp: 1 }, gear: [], inv: [] }); saveParty();
      store.set('clock', { day: 10, min: 480, lights: [] }); store.set('downtime', []); store.set('calevents', []); store.set('inbox', []); store.set('journal', []); calOpen(); });
    await p.waitForTimeout(150);
    t.ok(/Day 10/.test(await p.innerText('#cal')), 'today is the session clock\'s day');
    await p.selectOption('#dt-act', 'train'); await p.waitForTimeout(100);
    t.eq([await p.inputValue('#dt-days'), await p.inputValue('#dt-cost')], ['70', '105'], 'training: ten workweeks at 1.5 gp a day');
    await p.fill('#dt-days', '14'); await p.dispatchEvent('#dt-days', 'input'); t.eq(await p.inputValue('#dt-cost'), '21', 'the cost follows the days');
    await p.fill('#dt-note', "Thieves' tools"); await p.click('#cal button:has-text("Start")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [commonGp(PARTY[0]), calDT().map(x => [x.who, x.label, x.start, x.end])]), [179, [['Ara', "Training: Thieves' tools", 10, 24]]], 'Ara pays 21 gp and trains days 10–24');
    await p.selectOption('#dt-who', 'c2'); await p.selectOption('#dt-act', 'carouse'); await p.waitForTimeout(100); await p.selectOption('#dt-who', 'c2');
    await p.click('#cal button:has-text("Start")'); await p.waitForTimeout(150);
    t.ok(/can't afford/.test(await p.innerText('#toast')), 'Bo can\'t afford a week of carousing');
    await p.selectOption('#dt-who', 'c2'); await p.selectOption('#dt-act', 'work'); await p.waitForTimeout(100); await p.selectOption('#dt-who', 'c2'); await p.click('#cal button:has-text("Start")'); await p.waitForTimeout(150);
    await p.fill('#ce-day', '12'); await p.fill('#ce-t', 'The caravan arrives'); await p.click('#cal button:has-text("Add")'); await p.waitForTimeout(100);
    t.ok(/Day 12.*in 2 days.*The caravan arrives/.test((await p.innerText('#cal')).replace(/\n/g, ' ')), 'a coming event');
    await p.click('#cal button:has-text("+1 week")'); await p.waitForTimeout(200);
    const r = await p.evaluate(() => [calDay(), calDT().map(x => x.done), commonGp(PARTY[1]), store.get('inbox').map(x => x.t)]);
    t.ok(r[0] === 17 && !r[1][0] && r[1][1] === true && r[2] === 8, 'a week on: Bo\'s job is done and paid 7 gp; Ara still training: ' + JSON.stringify(r));
    t.ok(r[3].some(x => /Bo finished Working a job and earned 7 gp/.test(x)), 'the inbox says so');
    t.ok(await p.evaluate(() => store.get('journal').some(e => /^Downtime: Bo/.test(e.t))), 'and the journal');
    await p.evaluate(() => { clockAdd(1440 * 7); }); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => calDT()[0].done), 'the clock on the Tools page finishes downtime too');
    t.ok(await p.evaluate(() => sessEvents(0).some(e => e.k === 'downtime' && /Ara finished Training/.test(e.t))), 'and it is on the session timeline');
  } },
  { name: 'calendar on a phone', phone: true, run: async t => {
    const p = await t.open('party');
    await p.evaluate(() => { store.set('downtime', []); calOpen(); }); await p.waitForTimeout(150);
    t.ok(await p.isVisible('#cal'), 'shown');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
