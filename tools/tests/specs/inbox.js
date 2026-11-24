// The inbox: notices that used to vanish (trade answers, swap offers, handouts, combat starting) are kept until read.
module.exports = [
  { name: 'inbox: a bell with the unread count; open, read, mark all, clear with Undo', run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => { store.set('inbox', []); inboxBadge(); });
    t.ok(!(await p.isVisible('#inboxBtn')), 'no bell while the inbox is empty');
    await p.evaluate(() => { inboxPush('Your DM agreed to: buy 2 × Steel', 'shop'); inboxPush('New handout from your DM: The map', '', { ho: { t: 'The map', k: 'Letter', b: 'X marks it' } }); });
    t.ok(await p.isVisible('#inboxBtn') && (await p.innerText('#inboxN')) === '2', 'the bell shows 2 unread');
    t.ok(/2 unread/.test(await p.getAttribute('#inboxBtn', 'aria-label')), 'and says so to screen readers');
    await p.click('#inboxBtn'); await p.waitForTimeout(100);
    t.eq(await p.$$eval('#inboxpop .ib-row', r => r.map(x => x.querySelector('.ib-t').textContent)), ['New handout from your DM: The map', 'Your DM agreed to: buy 2 × Steel'], 'newest first');
    await p.click('#inboxpop .ib-row >> nth=0'); await p.waitForTimeout(150);
    t.ok(/X marks it/.test(await p.innerText('#hoView')), 'a handout opens from the inbox');
    t.eq(await p.innerText('#inboxN'), '1', 'and is read');
    await p.evaluate(() => { $('hoView').hidden = true; });
    await p.click('#inboxBtn'); await p.click('#inboxpop button:has-text("Mark all read")'); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#inboxN')), 'mark all read');
    await p.click('#inboxpop .ib-row >> nth=1'); await p.waitForTimeout(1200);
    t.ok(/shop/.test(p.url()), 'a trade answer opens the Shop');
    await p.click('#inboxBtn'); await p.click('#inboxpop button:has-text("Clear")'); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#inboxBtn')), 'cleared, the bell goes');
    await p.click('#toast button'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => store.get('inbox').length), 2, 'Undo brings them back');
    await p.click('#inboxBtn'); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#inboxpop')) && await p.evaluate(() => document.activeElement.id === 'inboxBtn'), 'Escape closes it and returns to the bell');
  } },
  { name: 'inbox: trade answers and swap offers land in it', run: async t => {
    const p = await t.open('shop');
    await p.evaluate(() => { store.set('inbox', []); CL.user = { id: 'pl1' }; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; PARTY.length = 0; PARTY.push({ id: 'ara', name: 'Ara', camp: 'k1', inv: [] }, { id: 'bo', name: 'Bo', camp: 'k1', _by: { u: 'pl2', n: 'Sam' }, inv: [] });
      TR.list = [{ id: 'r1', campaign_id: 'k1', character_id: 'ara', requester: 'pl1', kind: 'buy', item: 'Steel', qty: 1, status: 'open' }];
      trEvent({ eventType: 'UPDATE', new: { id: 'r1', campaign_id: 'k1', character_id: 'ara', requester: 'pl1', kind: 'buy', item: 'Steel', qty: 1, status: 'countered', price: 9, reply: 'Best I can do' } });
      SW.list = []; swEvent({ eventType: 'INSERT', new: { id: 's1', campaign_id: 'k1', from_char: 'bo', from_user: 'pl2', to_char: 'ara', to_user: 'pl1', give: { items: [['Rope', 1]] }, want: { gp: 2 }, status: 'offered' } }); });
    await p.waitForTimeout(200);
    const L = await p.evaluate(() => store.get('inbox').map(x => x.t));
    t.ok(L.length === 2 && /Bo offers Ara a swap: Rope for 2 gp/.test(L[0]) && /offers 9 gp each/.test(L[1]) && /Best I can do/.test(L[1]), 'both are in the inbox: ' + JSON.stringify(L));
  } },
  { name: 'inbox on a phone: the bell fits in the header', phone: true, run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => { store.set('inbox', []); for (let i = 0; i < 12; i++) inboxPush('Notice ' + i, 'shop'); });
    t.ok(await p.isVisible('#inboxBtn') && (await p.innerText('#inboxN')) === '9+', 'the bell shows 9+');
    await p.click('#inboxBtn'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => { const r = $('inboxpop').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; }), 'the inbox fits the screen');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
];
