// The DM notepad: in the signed-in account's database table (dm_notes), never in the browser. The tests give the page a
// stand-in Supabase client that keeps rows in memory and, like the table's row-level security, shows each account only
// its own rows; it can also pretend the table is missing or the connection is down.
const fakeDB = () => {
  window.__FAKE = window.__FAKE || { rows: [], mode: 'ok', calls: [] };
  const F = window.__FAKE, mine = () => F.rows.filter(r => r.owner === (CL.user && CL.user.id));
  const err = () => F.mode === 'missing' ? { code: 'PGRST205', message: "Could not find the table 'public.dm_notes' in the schema cache" } : F.mode === 'offline' ? { message: 'Failed to fetch' } : null;
  const done = (data) => Promise.resolve(err() ? { data: null, error: err() } : { data, error: null });
  const chain = res => { const c = new Proxy(function () {}, { get: (t, k) => k === 'then' ? (ok, no) => Promise.resolve(res).then(ok, no) : () => c, apply: () => c }); return c; };
  CL.on = true; CL.sb = { from: t => t !== 'dm_notes' ? chain({ data: [], error: null }) : {
    select: () => ({ order: () => { F.calls.push('select'); return done(mine().slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(r => ({ id: r.id, title: r.title, body: r.body, pinned: r.pinned, updated_at: r.updated_at }))); } }),
    upsert: rows => { F.calls.push('upsert'); const e = err(); if (e) return Promise.resolve({ error: e });
      for (const r of [].concat(rows)) { if (r.owner !== CL.user.id) return Promise.resolve({ error: { message: 'new row violates row-level security policy' } }); const i = F.rows.findIndex(x => x.owner === r.owner && x.id === r.id); if (i >= 0) F.rows[i] = r; else F.rows.push(r); }
      return Promise.resolve({ error: null }); },
    delete: () => ({ match: m => { F.calls.push('delete'); const e = err(); if (e) return Promise.resolve({ error: e }); F.rows = F.rows.filter(r => !(r.owner === CL.user.id && r.owner === m.owner && r.id === m.id)); return Promise.resolve({ error: null }); } }) } };
};
const signIn = (p, id) => p.evaluate(id => { CL.user = { id, email: id + '@example.com' }; }, id);
module.exports = [
  { name: 'notepad: signed out asks to sign in; nothing is kept in the browser', run: async t => {
    const p = await t.open('bestiary');
    await p.evaluate(fakeDB); await p.evaluate(() => { CL.user = null; setRole('dm'); });
    await p.click('#dmPadBtn'); await p.waitForTimeout(100);
    t.ok(/Sign in to use the notepad/.test(await p.innerText('#dmpad')), 'asks to sign in');
    t.eq(await p.evaluate(() => localStorage.getItem('fand.dmpad')), null, 'no notes in the browser');
  } },
  { name: 'notepad: saves to the account table, per account', run: async t => {
    const p = await t.open('bestiary');
    await p.evaluate(fakeDB); await signIn(p, 'dm-one');
    await p.evaluate(() => dmPad(true)); await p.waitForTimeout(200);
    await p.fill('#dp-title', 'Session 12'); await p.fill('#dp-body', 'The party owes [[Wolf]] a favour. '); await p.waitForTimeout(700);
    const rows = await p.evaluate(() => __FAKE.rows.map(r => [r.owner, r.title, /Wolf/.test(r.body)]));
    t.ok(rows.some(r => r[0] === 'dm-one' && r[1] === 'Session 12' && r[2]), 'the page is a row owned by the account: ' + JSON.stringify(rows));
    t.eq(await p.evaluate(() => localStorage.getItem('fand.dmpad')), null, 'and not in the browser');
    await p.evaluate(() => dmPadRender()); t.ok(await p.evaluate(() => !!document.querySelector('.dp-links [data-ref]')), '[[Wolf]] links');
    // another account on the same browser sees none of it
    await p.evaluate(() => dmPad(false)); await signIn(p, 'dm-two'); await p.evaluate(() => dmPad(true)); await p.waitForTimeout(200);
    t.ok(!/Session 12/.test(await p.innerText('#dmpad')), 'another account sees none of the first account\'s pages');
    // back to the first account (as on another device): the page is there
    await p.evaluate(() => dmPad(false)); await signIn(p, 'dm-one'); await p.evaluate(() => dmPad(true)); await p.waitForTimeout(200);
    t.ok(/Session 12/.test(await p.innerText('#dmpad')), 'the first account gets its page back');
    // pages, delete and undo go to the table
    await p.click('#dmpad button:has-text("+ New page")'); await p.fill('#dp-title', 'Villains'); await p.waitForTimeout(700);
    t.eq(await p.evaluate(() => __FAKE.rows.filter(r => r.owner === 'dm-one').length), 2, 'a new page is a new row in this account');
    await p.click('#dmpad button:has-text("Delete page")'); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => !__FAKE.rows.some(r => r.title === 'Villains')), 'deleting removes the row');
    await p.click('text=Undo'); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.title === 'Villains')), 'undo puts it back');
  } },
  { name: 'notepad: old browser notes move to the account; offline retries; missing table explained', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => localStorage.setItem('fand.dmpad', JSON.stringify({ lock: false, notes: [{ id: 'old1', t: 'From before', body: 'kept locally', at: 1 }] })));
    await p.evaluate(fakeDB); await signIn(p, 'dm-one'); await p.evaluate(() => dmPad(true)); await p.waitForTimeout(300);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.owner === 'dm-one' && r.id === 'old1')), 'the old page is now a row in the account');
    t.eq(await p.evaluate(() => localStorage.getItem('fand.dmpad')), null, 'and the browser copy is gone');
    await p.evaluate(() => { __FAKE.mode = 'offline'; });
    await p.fill('#dp-body', 'written offline'); await p.waitForTimeout(700);
    t.ok(/retrying/.test(await p.innerText('#dp-saved')), 'says it is not saved yet');
    await p.evaluate(() => { __FAKE.mode = 'ok'; dmPadPush(); }); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.body === 'written offline')), 'saved once back online');
    await p.evaluate(() => { dmPad(false); __FAKE.mode = 'missing'; DP.state = 'idle'; dmPad(true); }); await p.waitForTimeout(200);
    t.ok(/isn't set up yet/.test(await p.innerText('#dmpad')), 'a missing table is explained, not silent');
  } },
  { name: 'notepad: hidden for players; passphrase lock', run: async t => {
    const p = await t.open('index');
    await p.evaluate(() => setRole('player')); await p.waitForTimeout(100);
    t.ok(!(await p.isVisible('#dmPadBtn')), 'players get no notepad button');
    await p.evaluate(() => setRole('dm')); await p.waitForTimeout(100);
    t.ok(await p.isVisible('#dmPadBtn'), 'the DM does');
    await p.evaluate(fakeDB); await signIn(p, 'dm-one');
    const locked = await p.evaluate(() => { __FAKE.rows = [{ owner: 'dm-one', id: 'a', title: 'Secret', body: 'the duke is the dragon', pinned: false, updated_at: new Date().toISOString() }];
      store.set('dmpadui', { lock: true }); const real = window.dmUnlocked; window.dmUnlocked = () => false; dmPad(true); const txt = $('dmpad').innerText; window.dmUnlocked = real; dmPad(false); return txt; });
    t.ok(/passphrase/.test(locked) && !/duke/.test(locked), 'locked: asks for the passphrase and shows nothing');
  } },
  { name: 'notepad on a phone fits the screen', phone: true, run: async t => {
    const p = await t.open('index');
    await p.evaluate(fakeDB); await signIn(p, 'dm-one'); await p.evaluate(() => { setRole('dm'); dmPad(true); }); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => { const r = $('dmpad').getBoundingClientRect(); return r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; }), 'no sideways scroll');
  } },
];
