// The DM notepad: opens from the header on any page, saves as you type, links [[names]], pages, delete with undo,
// hidden for players, and optionally kept behind the DM passphrase.
module.exports = [
  { name: 'notepad: write, link, pages, undo', run: async t => {
    let p = await t.open('bestiary');
    t.ok(await p.isVisible('#dmPadBtn'), 'the header has a notepad button');
    await p.click('#dmPadBtn'); await p.waitForTimeout(100);
    t.ok(await p.isVisible('#dmpad'), 'it opens');
    await p.fill('#dp-title', 'Session 12'); await p.fill('#dp-body', 'The party owes [[Wolf]] a favour. ');
    await p.waitForTimeout(600);
    t.eq(await p.evaluate(() => { const d = store.get('dmpad', {}); const n = d.notes.find(x => x.id === d.cur); return [n.t, /Wolf/.test(n.body)]; }), ['Session 12', true], 'saved as you type');
    await p.evaluate(() => dmPadRender());
    t.ok(await p.evaluate(() => !!document.querySelector('.dp-links [data-ref]')), '[[Wolf]] becomes a link');
    await p.evaluate(() => openItem(MON_IDX.get('owlbear') || MONSTERS[0])); await p.waitForTimeout(150);
    const name = await p.evaluate(() => CUR.n.split(' - ')[0]);
    await p.click('button:has-text("Link what\'s open")'); await p.waitForTimeout(600);
    t.ok(await p.evaluate(n => $('dp-body').value.includes('[[' + n + ']]'), name), 'links the item that is open');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    await p.click('#dmpad button:has-text("+ New page")'); await p.fill('#dp-title', 'Villains'); await p.waitForTimeout(600);
    t.eq(await p.evaluate(() => store.get('dmpad', {}).notes.length), 2, 'two pages');
    await p.click('#dmpad button:has-text("Delete page")'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => store.get('dmpad', {}).notes.length), 1, 'deleted');
    await p.click('text=Undo'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => store.get('dmpad', {}).notes.map(n => n.t).sort()), ['Session 12', 'Villains'], 'undo brings it back');
    // a fresh load keeps the notes, Alt+N toggles
    p = await t.open('combat', p);
    await p.keyboard.press('Alt+n'); await p.waitForTimeout(150);
    t.ok(await p.isVisible('#dmpad') && await p.evaluate(() => [...document.querySelectorAll('.dp-item b')].map(b => b.textContent).includes('Session 12')), 'Alt+N opens it on another page, notes kept');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#dmpad')), 'Escape closes it');
  } },
  { name: 'notepad: hidden for players; passphrase lock', run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => setRole('player')); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#dmPadBtn')), 'players get no notepad button');
    await p.evaluate(() => setRole('dm')); await p.waitForTimeout(100);
    t.ok(await p.isVisible('#dmPadBtn'), 'the DM does');
    const locked = await p.evaluate(() => { store.set('dmpad', { lock: true, notes: [{ id: 'a', t: 'Secret', body: 'the duke is the dragon', at: 1 }] });
      const real = window.dmUnlocked; window.dmUnlocked = () => false; dmPad(true); const txt = $('dmpad').innerText; window.dmUnlocked = real; dmPad(false); return txt; });
    t.ok(/passphrase/.test(locked) && !/duke/.test(locked), 'locked: asks for the passphrase and shows nothing');
  } },
  { name: 'notepad on a phone fits the screen', phone: true, run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => { setRole('dm'); dmPad(true); }); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => { const r = $('dmpad').getBoundingClientRect(); return r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; }), 'no sideways scroll');
  } },
];
