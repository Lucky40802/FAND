// Account tables beyond the notepad: characters and journal entries as rows, the campaign wiki, live initiative, and the
// notepad's session tools. The page gets a stand-in Supabase client that keeps rows in memory and applies the same access
// rules as tools/cloud/schema.sql: your own rows only; wiki pages for the campaign's DM, or published ones for members.
const fakeDB = () => {
  window.__FAKE = window.__FAKE || { t: {}, mode: 'ok', dm: {} };
  const F = window.__FAKE, me = () => CL.user && CL.user.id, T = n => F.t[n] || (F.t[n] = []);
  const OWNED = ['dm_notes', 'user_characters', 'journal_entries'], CAMP = ['campaign_pages', 'campaign_combat'];
  const visible = (n, r) => OWNED.includes(n) ? r.owner === me() : n === 'campaign_pages' ? F.dm[r.campaign_id] === me() || r.published : CAMP.includes(n) ? true : true;
  const canWrite = (n, r) => OWNED.includes(n) ? r.owner === me() : CAMP.includes(n) ? F.dm[r.campaign_id] === me() : true;
  const key = (n, r) => OWNED.includes(n) ? r.owner + '|' + r.id : n === 'campaign_combat' ? r.campaign_id : r.campaign_id + '|' + r.id;
  const res = d => Promise.resolve(F.mode === 'missing' ? { data: null, error: { code: 'PGRST205', message: 'Could not find the table in the schema cache' } } : { data: d, error: null });
  const q = (n) => { const f = []; let ord = null; const run = () => { let rows = T(n).filter(r => visible(n, r) && f.every(g => g(r))); if (ord) rows = rows.slice().sort((a, b) => String(a[ord]).localeCompare(String(b[ord]))); return res(JSON.parse(JSON.stringify(rows))) };
    const c = { eq: (k, v) => { f.push(r => r[k] === v); return c }, in: (k, v) => { f.push(r => v.includes(r[k])); return c }, order: k => { ord = k; return c }, then: (a, b) => run().then(a, b) }; return c };
  CL.on = true; CL.sb = {
    from: n => ({
      select: () => q(n),
      upsert: rows => { if (F.mode === 'missing') return res(null); for (const r0 of [].concat(rows)) { const r = Object.assign({}, r0); if (OWNED.includes(n) && !r.owner) r.owner = me();
        if (!canWrite(n, r)) return Promise.resolve({ error: { message: 'new row violates row-level security policy' } }); const i = T(n).findIndex(x => key(n, x) === key(n, r)); if (i >= 0) T(n)[i] = r; else T(n).push(r) } return Promise.resolve({ error: null }) },
      delete: () => ({ match: m => { F.t[n] = T(n).filter(r => !(canWrite(n, r) && Object.entries(m).every(([k, v]) => r[k] === v))); return Promise.resolve({ error: null }) } }),
    }),
    rpc: () => Promise.resolve({ error: null }),
    channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {},
  };
};
const signIn = (p, id) => p.evaluate(id => { CL.user = { id, email: id + '@example.com' }; }, id);
module.exports = [
  { name: 'notepad: formatting, read view with tick-boxes, links back from items', run: async t => {
    const p = await t.open('bestiary');
    await p.evaluate(fakeDB); await signIn(p, 'dm1'); await p.evaluate(() => { setRole('dm'); dmPad(true); }); await p.waitForTimeout(200);
    await p.fill('#dp-body', 'Plans'); await p.evaluate(() => { const t = $('dp-body'); t.selectionStart = t.selectionEnd = 0; }); await p.click('.dp-tools button:has-text("Checklist")');
    t.eq(await p.inputValue('#dp-body'), '- [ ] Plans', 'checklist button marks the line');
    await p.fill('#dp-body', '## Villains\n**Wolf** pack [[Wolf]]\n- [ ] Ambush\n- note'); await p.waitForTimeout(600);
    await p.click('#dp-view'); await p.waitForTimeout(100);
    const r = await p.evaluate(() => { const R = $('dp-read'); return { h: !!R.querySelector('h5'), b: !!R.querySelector('strong'), link: !!R.querySelector('a[data-ref]'), box: R.querySelectorAll('input[type=checkbox]').length, li: R.querySelectorAll('li').length }; });
    t.eq(r, { h: true, b: true, link: true, box: 1, li: 2 }, 'read view formats the page');
    await p.click('#dp-read input[type=checkbox]'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => __FAKE.t.dm_notes.some(x => /- \[x\] Ambush/.test(x.body))), 'ticking a box saves the page');
    await p.evaluate(() => { dmPad(false); openItem(MON_IDX.get('wolf')); }); await p.waitForTimeout(200);
    t.ok(/In your notepad/.test(await p.innerText('#modal')), 'the Wolf window lists the page that links to it');
    await p.evaluate(() => setRole('player')); await p.evaluate(() => openItem(MON_IDX.get('wolf'))); await p.waitForTimeout(150);
    t.ok(!/In your notepad/.test(await p.innerText('#modal')), 'players never see it');
  } },
  { name: 'notepad: start a session, recap it, share a page as a handout', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(fakeDB); await signIn(p, 'dm1');
    await p.evaluate(() => { PARTY.push({ id: 'pa', name: 'Ara', cls: 'Wizard', level: 4, hp: 20, hpMax: 30, log: [{ d: new Date().toISOString().slice(0, 10), deed: 'Spoils from the Wolf fight: 2 × Wolf Pelt' }] }); saveParty();
      store.set('enc', { realm: 'Nexus', list: [['Wolf', 2]] }); setRole('dm'); dmPad(true); });
    await p.waitForTimeout(200); await p.click('#dmpad button:has-text("Start session")'); await p.waitForTimeout(200);
    const body = await p.inputValue('#dp-body');
    t.ok(/\*\*Ara\*\* · Wizard 4, HP 20\/30/.test(body) && /2 × \[\[Wolf\]\]/.test(body) && /Wolf Pelt/.test(body) && /- \[ \] /.test(body), 'the page has the party, the fight ready and recent loot: ' + body.slice(0, 200));
    await p.fill('#dp-body', body.replace('- [ ] ', '- [x] Meet the duke\n- [ ] Find the map')); await p.waitForTimeout(600);
    await p.evaluate(() => { store.set('fights', [{ id: 'f', d: new Date().toISOString().slice(0, 10), mons: '2× Wolf', won: true, rounds: 3, dropped: [] }]); });
    await p.click('#dmpad button:has-text("Session recap")'); await p.waitForTimeout(200);
    const rec = await p.evaluate(() => dmPadCur().body);
    t.ok(/2× Wolf: won in 3 rounds/.test(rec) && /Ara: 2 × Wolf Pelt/.test(rec) && /## Done\n- Meet the duke/.test(rec) && /- \[ \] Find the map/.test(rec), 'the recap: ' + rec);
    await p.click('#toast button'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => store.get('journal', []).some(e => /^Recap/.test(e.t))), 'the recap goes into the journal');
    await p.evaluate(() => { dmPadCur().body = 'Secret: [[Wolf]] den is under the mill'; }); await p.click('#dmpad button:has-text("Share with players")'); await p.waitForTimeout(150);
    t.eq(await p.inputValue('#hoB'), 'Secret: Wolf den is under the mill', 'the handout gets this page only, links as plain names');
    t.ok(await p.evaluate(() => $('dmpad').hidden), 'the notepad closes so the handout is in front');
  } },
  { name: 'characters and journal entries are rows; changes from another device merge; deletions stay deleted', run: async t => {
    const p = await t.open('journal');
    await p.evaluate(fakeDB); await signIn(p, 'u1');
    await p.evaluate(async () => { PARTY.length = 0; PARTY.push({ id: 'c1', name: 'Ara', level: 3 }); saveParty(); store.set('journal', [{ t: 'Old entry', d: '2026-01-01', body: 'x' }, { t: 'Second', d: '2026-01-02', body: 'y' }]); await rtSyncAll(); });
    let r = await p.evaluate(() => ({ chars: __FAKE.t.user_characters.map(x => [x.owner, x.id, x.data.name]), j: __FAKE.t.journal_entries.map(x => [x.id, x.data.t]), ids: store.get('journal').map(e => e.id) }));
    t.eq(r.chars, [['u1', 'c1', 'Ara']], 'each character is a row of the account');
    t.eq(r.j.map(x => x[1]), ['Old entry', 'Second'], 'each journal entry is a row'); t.ok(r.ids.every(Boolean) && r.ids[0] === r.j[0][0], 'entries got ids');
    // another device adds an entry and renames the character; this device adds its own entry meanwhile
    await p.evaluate(() => { const now = Date.now() + 5000; __FAKE.t.journal_entries.push({ owner: 'u1', id: 'remote1', data: { t: 'From the phone', d: '2026-01-03', body: 'z', _m: now }, deleted: false, updated_at: new Date(now).toISOString() });
      const c = __FAKE.t.user_characters[0]; c.data = Object.assign({}, c.data, { name: 'Ara the Bold', _m: now }); c.updated_at = new Date(now).toISOString();
      const J = store.get('journal'); J.push({ t: 'From the laptop', d: '2026-01-03', body: 'w' }); store.set('journal', J); });
    const changed = await p.evaluate(async () => { const real = CL.sb.from; CL.sb.from = n => n === 'user_data' ? { select: () => Promise.resolve({ data: [], error: null }) } : real(n); return cloudPull(); });
    r = await p.evaluate(() => ({ titles: store.get('journal').map(e => e.t), name: PARTY.find(c => c.id === 'c1').name }));
    t.ok(changed.includes('journal'), 'the pull reports the journal changed');
    t.eq(r.titles.sort(), ['From the laptop', 'From the phone', 'Old entry', 'Second'], 'both devices\' entries are kept');
    t.eq(r.name, 'Ara the Bold', 'the newer character wins');
    // delete an entry here: its row is marked deleted, and a pull doesn't bring it back
    await p.evaluate(async () => { store.set('journal', store.get('journal').filter(e => e.t !== 'Second')); await rtSyncAll(); });
    t.ok(await p.evaluate(() => __FAKE.t.journal_entries.some(x => x.data && x.deleted && !x.data.t)), 'the deleted entry is a deleted row');
    await p.evaluate(async () => { const real = CL.sb.from; CL.sb.from = n => n === 'user_data' ? { select: () => Promise.resolve({ data: [], error: null }) } : real(n); await cloudPull(); });
    t.ok(!(await p.evaluate(() => store.get('journal').some(e => e.t === 'Second'))), 'it stays deleted');
    // another account sees none of it
    await signIn(p, 'u2'); t.eq(await p.evaluate(async () => (await CL.sb.from('journal_entries').select()).data.length), 0, 'another account sees no rows');
    // tables missing: quiet
    await signIn(p, 'u1'); await p.evaluate(async () => { __FAKE.mode = 'missing'; RT.off = {}; RT.sent = {}; store.set('journal', store.get('journal').concat({ t: 'Offline', d: '2026-01-04', body: '' })); await rtSyncAll(); });
    t.ok(await p.evaluate(() => RT.off.journal_entries === true), 'no table: rows are skipped without an error');
  } },
  { name: 'campaign wiki: the DM writes and publishes; players read published pages only', run: async t => {
    const p = await t.open('index');
    await p.evaluate(fakeDB); await signIn(p, 'dm1');
    await p.evaluate(() => { __FAKE.dm.k1 = 'dm1'; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1', invite: 'ABC' }]; wikiOpen('k1'); }); await p.waitForTimeout(150);
    await p.click('#qBox button:has-text("New page")'); await p.fill('#wkT', 'Millbrook'); await p.fill('#wkK', 'Place'); await p.fill('#wkB', 'A town. See [[Wolf]] and [[Duke Varn]].');
    await p.check('#wkP'); await p.click('#qBox button:has-text("Save")'); await p.waitForTimeout(150);
    await p.click('#qBox button:has-text("New page")'); await p.fill('#wkT', 'Duke Varn'); await p.fill('#wkB', 'Secretly the dragon.'); await p.click('#qBox button:has-text("Save")'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => __FAKE.t.campaign_pages.map(x => [x.title, x.published])), [['Millbrook', true], ['Duke Varn', false]], 'pages saved, one published');
    await p.click('#qBox [data-wkp]:has-text("Millbrook")'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => !!document.querySelector('#qBox a[data-wiki]') && !!document.querySelector('#qBox a[data-ref]')), 'pages link to other pages and to site items');
    await p.evaluate(() => closeQuick()); await signIn(p, 'pl1');
    await p.evaluate(() => { CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1', invite: 'ABC' }]; wikiOpen('k1'); }); await p.waitForTimeout(150);
    const pl = await p.evaluate(() => ({ list: [...document.querySelectorAll('#qBox [data-wkp]')].map(b => b.innerText.trim()), txt: $('qBox').innerText }));
    t.eq(pl.list.map(x => x.split('\n')[0]), ['Millbrook'], 'the player sees the published page only');
    t.ok(!/dragon/.test(pl.txt) && !/New page|Edit/.test(pl.txt), 'no draft text and no way to write');
    t.eq(await p.evaluate(async () => (await CL.sb.from('campaign_pages').upsert({ campaign_id: 'k1', id: 'z', title: 'hack' })).error ? 'refused' : 'ok'), 'refused', 'a player write is refused');
  } },
  { name: 'live initiative: the DM\'s tracker on players\' phones, without monster numbers', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(fakeDB); await signIn(p, 'dm1');
    await p.evaluate(() => { __FAKE.dm.k1 = 'dm1'; CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; setRole('dm');
      store.set('combat', { round: 2, turn: 1, list: [{ id: 'a', name: 'Ara', pc: 'pa', hp: 12, max: 30, init: 15, cond: [] }, { id: 'b', name: 'Ogre', mon: 'Ogre', hp: 20, max: 59, ac: 11, init: 9, cond: ['Prone'] }] }); renderCombat(); });
    await p.selectOption('select[aria-label="Show this fight on players\' phones"]', 'k1'); await p.waitForTimeout(300);
    const row = await p.evaluate(() => __FAKE.t.campaign_combat[0]);
    t.ok(row && row.campaign_id === 'k1' && row.data.round === 2, 'the fight is shared with the campaign');
    t.eq(row.data.list.map(x => [x.n, x.hp, x.st]), [['Ara', 12, 'Bloodied'], ['Ogre', null, 'Bloodied']], 'PCs show HP; monsters only how hurt they look');
    t.ok(!JSON.stringify(row.data.list).includes('59') && !('ac' in row.data.list[1]) && row.data.list[1].max === null && row.data.list[1].hp === null, 'no monster numbers leave the DM\'s device');
    await p.evaluate(() => { CB.list[1].hp = 0; saveCB(); }); await p.waitForTimeout(900);
    t.eq(await p.evaluate(() => __FAKE.t.campaign_combat[0].data.list[1].st), 'Down', 'changes follow live');
    // a player's phone
    await signIn(p, 'pl1');
    await p.evaluate(() => { CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; LIVE.data = {}; liveEvent({ eventType: 'INSERT', new: __FAKE.t.campaign_combat[0] }); });
    await p.click('#toast button'); await p.waitForTimeout(100);
    const v = await p.innerText('#liveView'); t.ok(/Round 2/.test(v) && /Ogre/.test(v) && /Down/.test(v) && /12 \/ 30 HP/.test(v) && !/59/.test(v), 'the player watches it: ' + v);
    await p.evaluate(() => liveClose()); await signIn(p, 'dm1'); await p.evaluate(() => { CL.camps = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }]; renderCombat(); }); await p.click('button:has-text("Live: Ashfall")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __FAKE.t.campaign_combat.length), 0, 'stopping removes it');
  } },
  { name: 'content check: new peoples match their traits; Bladesinging casts in light armor', run: async t => {
    const p = await t.open('sheet');
    const r = await p.evaluate(() => {
      const leather = BPS.find(b => b.cat !== 'Shield' && armorPiece(b).weight === 'Light' && armorPiece(b).slot !== 'Mount');
      const st = sub => { const c = { id: 'w', name: 'W', cls: 'Wizard', sub, level: 5 }; return castArmor(c, [leather]); };
      return { blade: st('Bladesinging'), evoc: !!st('School of Evocation'), lt: !!leather };
    });
    t.ok(r.lt, 'a light armor piece exists'); t.eq(r.blade, null, 'a Bladesinger in light armor casts freely'); t.ok(r.evoc, 'other wizards still pay');
  } },
];
