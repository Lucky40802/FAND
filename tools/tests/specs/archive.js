// The Archive: notes and mind maps for anyone signed in, shared with a campaign or by link; mind-map and graph views.
// The page gets a stand-in Supabase client for archive_items that applies the same rules as tools/cloud/schema.sql:
// owners and campaign members read; owners (and members, when allowed) edit the text; only owners change the sharing;
// fand_archive_open returns the one item a link names.
const fakeDB = () => {
  window.__FAKE = window.__FAKE || { rows: [], mem: {}, mode: 'ok' };
  const F = window.__FAKE, me = () => CL.user && CL.user.id, member = c => !!c && (F.mem[c] || []).includes(me());
  const isDM = c => (F.dms || {})[c] === me(), seen = r => member(r.campaign_id) && (r.audience !== 'dm' || isDM(r.campaign_id));
  const vis = r => r.owner === me() || seen(r), canEdit = r => r.owner === me() || (r.can_edit && seen(r));
  const miss = () => F.mode === 'missing' ? { code: 'PGRST205', message: "Could not find the table 'public.archive_items' in the schema cache" } : null;
  const copy = x => JSON.parse(JSON.stringify(x));
  CL.on = true; CL.sb = {
    from: n => n !== 'archive_items' ? { select: () => ({ order: () => Promise.resolve({ data: [], error: null }), then: (a) => Promise.resolve({ data: [], error: null }).then(a) }), insert: () => Promise.resolve({ error: null }), upsert: () => Promise.resolve({ error: null }) } : {
      select: () => ({ order: () => Promise.resolve(miss() ? { data: null, error: miss() } : { data: copy(F.rows.filter(vis)), error: null }) }),
      insert: r0 => { if (miss()) return Promise.resolve({ error: miss() }); const r = Object.assign({ campaign_id: null, can_edit: false, link: null, audience: 'all' }, copy(r0));
        if (r.kind === 'party' && F.rows.some(x => x.kind === 'party' && x.campaign_id === r.campaign_id)) return Promise.resolve({ error: { code: '23505', message: 'duplicate key value violates unique constraint "archive_items_party"' } });
        if (r.owner !== me() || (r.campaign_id && !member(r.campaign_id))) return Promise.resolve({ error: { message: 'new row violates row-level security policy' } }); r.updated_by = me(); F.rows.push(r); return Promise.resolve({ error: null }) },
      update: patch => ({ eq: (k, v) => { const r = F.rows.find(x => x[k] === v); if (!r || !vis(r) || !canEdit(r)) return Promise.resolve({ error: null, data: [] });
        if (r.owner !== me() && ['owner', 'campaign_id', 'can_edit', 'link', 'kind', 'audience'].some(f => f in patch && JSON.stringify(patch[f]) !== JSON.stringify(r[f]))) return Promise.resolve({ error: { message: 'only the owner can change how an archive item is shared' } });
        if (patch.campaign_id && !member(patch.campaign_id)) return Promise.resolve({ error: { message: 'new row violates row-level security policy' } });
        Object.assign(r, copy(patch), { updated_by: me() }); return Promise.resolve({ error: null }) } }),
      delete: () => ({ match: m => { F.rows = F.rows.filter(r => !(r.owner === me() && r.id === m.id)); return Promise.resolve({ error: null }) } }),
    },
    rpc: (fn, a) => { if (fn !== 'fand_archive_open') return Promise.resolve({ error: null }); const r = F.rows.find(x => x.link && x.link === a.p_link);
      return Promise.resolve({ data: r ? [{ id: r.id, kind: r.kind, title: r.title, body: r.body, data: copy(r.data), updated_at: r.updated_at, mine: r.owner === me() }] : [], error: null }) },
    channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch }, removeChannel: () => {},
  };
};
const as = (p, id, camps) => p.evaluate(([id, camps]) => { CL.user = id ? { id, email: id + '@example.com' } : null; CL.camps = camps || []; ARC.state = 'idle'; ARC.cur = null; ARC.linked = null; ARC.sec = 'all'; ARC.kind = ''; ARC.tag = ''; ARC.view = ''; renderArchive(); }, [id, camps]);
const CAMP = [{ id: 'k1', name: 'Ashfall', dm: 'dm1' }];
module.exports = [
  { name: 'archive: anyone signed in writes notes; the note as a mind map; links between notes; graph', run: async t => {
    const p = await t.open('archive');
    t.ok(/Sign in to use the Archive/.test(await p.innerText('#content')) || /accounts aren't set up/.test(await p.innerText('#content')), 'signed out: asks to sign in');
    await p.evaluate(fakeDB); await as(p, 'pl1'); await p.waitForTimeout(100);
    await p.click('[data-nbnew="note"]'); await p.waitForTimeout(100);
    await p.fill('#ar-title', 'Villains'); await p.fill('#ar-body', '## The Duke\n- secretly a [[Wolf]]\n  - has a den\n## Cult\n- meets at night\n\nSee [[Places]].'); await p.waitForTimeout(800);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.owner === 'pl1' && r.title === 'Villains' && /The Duke/.test(r.body))), 'a player\'s note is saved to their account');
    await p.click('[data-nbnew="note"]'); await p.fill('#ar-title', 'Places'); await p.fill('#ar-body', 'Back to [[Villains]]'); await p.waitForTimeout(800);
    await p.click('[data-arit]:has-text("Villains")'); await p.click('[data-arv="mind"]'); await p.waitForTimeout(250);
    const mm = await p.evaluate(() => ({ nodes: [...document.querySelectorAll('#ar-board .mm-node')].map(n => n.innerText.trim()), edges: document.querySelectorAll('#ar-board .mm-edges path').length }));
    t.eq(mm.nodes, ['Villains', 'The Duke', 'secretly a Wolf', 'has a den', 'Cult', 'meets at night'], 'headings and lists become the map');
    t.eq(mm.edges, 5, 'each branch is linked to its parent');
    await p.click('[data-arv="read"]'); await p.click('#ar-read a[data-arlink]'); await p.waitForTimeout(100);
    t.eq(await p.inputValue('#ar-title'), 'Places', '[[a note title]] opens that note');
    await p.click('[data-nbsec="graph"]'); await p.waitForTimeout(300);
    const g = await p.evaluate(() => ({ dots: document.querySelectorAll('#ar-graph g.gr-n').length, site: document.querySelectorAll('#ar-graph g.gr-n.site').length, lines: document.querySelectorAll('#ar-graph line').length }));
    t.eq(g, { dots: 3, site: 1, lines: 2 }, 'graph: two notes, the monster they link, and the links');
  } },
  { name: 'archive: mind maps you build: add, link, move, colour, delete', run: async t => {
    const p = await t.open('archive');
    await p.evaluate(fakeDB); await as(p, 'pl1');
    await p.click('[data-nbnew="map"]'); await p.waitForTimeout(200);
    await p.click('#ar-board .mm-node'); await p.click('#ar-board [data-mm="child"]'); await p.keyboard.type('Goblins'); await p.keyboard.press('Enter');
    await p.click('#ar-board .mm-node >> text=Main idea'); await p.click('#ar-board [data-mm="child"]'); await p.keyboard.type('Treasure [[Wolf]]'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    // link the two children
    await p.click('#ar-board .mm-node >> text=Goblins'); await p.click('#ar-board [data-mm="link"]'); await p.click('#ar-board .mm-node >> text=Treasure');
    await p.click('#ar-board .mm-node >> text=Goblins'); await p.click('#ar-board [data-mmc="red"]');
    const box = await p.locator('#ar-board .mm-node >> text=Goblins').boundingBox();
    await p.mouse.move(box.x + 10, box.y + 10); await p.mouse.down(); await p.mouse.move(box.x + 90, box.y + 140, { steps: 5 }); await p.mouse.up();
    await p.waitForTimeout(800);
    let d = await p.evaluate(() => __FAKE.rows[0].data);
    t.eq(d.nodes.map(n => n.t), ['Main idea', 'Goblins', 'Treasure [[Wolf]]'], 'cards saved');
    t.eq(d.edges.length, 3, 'two branches and the link between them');
    const gob = d.nodes.find(n => n.t === 'Goblins'); t.ok(gob.c === 'red' && gob.y > 30, 'colour and position saved: ' + JSON.stringify(gob));
    t.ok(await p.evaluate(() => !!document.querySelector('#ar-board .mm-node a[data-ref]')), '[[Wolf]] in a card links the monster');
    await p.click('#ar-board .mm-node >> text=Goblins'); await p.click('#ar-board [data-mm="del"]'); await p.waitForTimeout(800);
    d = await p.evaluate(() => __FAKE.rows[0].data); t.eq([d.nodes.length, d.edges.length], [2, 1], 'deleting a card removes its links');
  } },
  { name: 'archive: share with a campaign (read only or editable) and by link', run: async t => {
    const p = await t.open('archive');
    await p.evaluate(fakeDB); await p.evaluate(() => { __FAKE.mem.k1 = ['dm1', 'pl1', 'pl2']; });
    await as(p, 'pl1', CAMP);
    await p.click('[data-nbnew="note"]'); await p.fill('#ar-title', 'Party plan'); await p.fill('#ar-body', 'Rob the bank'); await p.waitForTimeout(800);
    await p.click('[data-nbnew="note"]'); await p.fill('#ar-title', 'My diary'); await p.fill('#ar-body', 'private'); await p.waitForTimeout(800);
    await p.click('[data-arit]:has-text("Party plan")'); await p.click('.ar-share summary'); await p.selectOption('#ar-camp', 'k1'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => __FAKE.rows.find(r => r.title === 'Party plan').campaign_id), 'k1', 'shared with the campaign');
    // another member sees it, read only, and not the diary
    await as(p, 'pl2', CAMP); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => [...document.querySelectorAll('[data-arit] b')].map(b => b.innerText.replace(/^\W+/, ''))), ['Party plan'], 'members see the shared note only');
    await p.click('[data-arit]:has-text("Party plan")'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => $('ar-title').readOnly && !$('ar-body')), 'read only for members');
    // the owner lets members edit
    await as(p, 'pl1', CAMP); await p.click('[data-arit]:has-text("Party plan")'); await p.check('#ar-edit'); await p.waitForTimeout(150);
    await as(p, 'pl2', CAMP); await p.click('[data-arit]:has-text("Party plan")'); await p.click('[data-arv="edit"]'); await p.fill('#ar-body', 'Rob the bank at dawn'); await p.waitForTimeout(800);
    t.eq(await p.evaluate(() => __FAKE.rows.find(r => r.title === 'Party plan').body), 'Rob the bank at dawn', 'a member edits when allowed');
    t.ok(!(await p.$('#ar-camp')), 'members get no sharing controls');
    // a link: the owner makes one; someone outside the campaign opens it and saves a copy
    await as(p, 'pl1', CAMP); await p.click('[data-arit]:has-text("My diary")'); await p.click('.ar-share summary'); await p.click('[data-ar="link"]'); await p.waitForTimeout(150);
    const link = await p.evaluate(() => __FAKE.rows.find(r => r.title === 'My diary').link); t.ok(/^[A-Za-z0-9]{24}$/.test(link), 'a link token: ' + link);
    await p.evaluate(l => history.replaceState(null, '', location.pathname + '?a=' + l), link); await as(p, 'out1', []); await p.waitForTimeout(150);
    const txt = await p.innerText('#content'); t.ok(/Shared with you by link/.test(txt) && /My diary/.test(txt) && /private/.test(txt) && !/Party plan/.test(txt), 'the link opens that one item');
    await p.click('[data-ar="savelinked"]'); await p.waitForTimeout(800);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.owner === 'out1' && r.title === 'My diary' && r.body === 'private')), 'saved as their own copy');
    await p.evaluate(() => { const r = __FAKE.rows.find(x => x.owner === 'pl1' && x.title === 'My diary'); r.link = null; });
    await as(p, 'out2', []); await p.waitForTimeout(150); t.ok(/doesn't open anything/.test(await p.innerText('#content')), 'a stopped link opens nothing');
    await p.evaluate(() => history.replaceState(null, '', location.pathname));
  } },
  { name: 'archive: missing table explained; notepad mind map, graph and copy to the Archive', run: async t => {
    let p = await t.open('archive');
    await p.evaluate(fakeDB); await p.evaluate(() => { __FAKE.mode = 'missing'; }); await as(p, 'pl1'); await p.waitForTimeout(100);
    t.ok(/isn't set up yet/.test(await p.innerText('#content')), 'explains the missing table');
    p = await t.open('bestiary', p);
    await p.evaluate(fakeDB); await p.evaluate(() => { __FAKE.mode = 'ok'; });
    // the notepad uses dm_notes; give it an in-memory stand-in too
    await p.evaluate(() => { const real = CL.sb.from; const rows = []; CL.sb.from = n => n !== 'dm_notes' ? real(n) : { select: () => ({ order: () => Promise.resolve({ data: rows.slice(), error: null }) }), upsert: r => { [].concat(r).forEach(x => { const i = rows.findIndex(y => y.id === x.id); if (i >= 0) rows[i] = x; else rows.push(x) }); return Promise.resolve({ error: null }) }, delete: () => ({ match: () => Promise.resolve({ error: null }) }) };
      CL.user = { id: 'dm1' }; setRole('dm'); dmPad(true); });
    await p.waitForTimeout(200); await p.fill('#dp-title', 'Plot'); await p.fill('#dp-body', '# Act one\n- meet [[Wolf]]\n# Act two'); await p.waitForTimeout(600);
    await p.click('#dmpad button:has-text("Mind map")'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => [...document.querySelectorAll('#dp-board .mm-node')].map(n => n.innerText.trim())), ['Plot', 'Act one', 'meet Wolf', 'Act two'], 'the page as a mind map');
    await p.click('#dmpad button:has-text("Graph")'); await p.waitForTimeout(250);
    t.ok(await p.evaluate(() => document.querySelectorAll('#dp-graph g.gr-n').length === 2), 'the notepad graph: the page and the monster it links');
    await p.click('#dmpad button:has-text("To Archive")'); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => __FAKE.rows.some(r => r.owner === 'dm1' && r.title === 'Plot' && !r.campaign_id && /Act one/.test(r.body))), 'the page is copied into the Archive, private');
  } },
  { name: 'archive on a phone fits the screen', phone: true, run: async t => {
    const p = await t.open('archive');
    await p.evaluate(fakeDB); await as(p, 'pl1'); await p.click('[data-nbnew="map"]'); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
  { name: 'archive is one page: sections in a sidebar, the journal and the DM notepad inside it', run: async t => {
    let p = await t.open('archive');
    await p.evaluate(fakeDB); await p.evaluate(() => setRole('player')); await as(p, 'pl1', CAMP); await p.waitForTimeout(100);
    const secs = await p.evaluate(() => [...document.querySelectorAll('.nb-side [data-nbsec]')].map(b => b.dataset.nbsec));
    t.eq(secs, ['all', 'note', 'map', 'npc', 'quest', 'party:k1', 'journal', 'graph'], 'one sidebar: every kind, the party notebook, the journal and the graph (no DM notepad for players)');
    await p.click('[data-nbsec="journal"]'); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => !!$('jn-add') && !!document.querySelector('.nb-side [data-nbsec="journal"].on') && SITE.page === 'archive'), 'the journal opens inside the same page');
    await p.fill('#jn-t', 'Session 3'); await p.fill('#jn-b', 'We met the Duke.'); await p.click('#jn-add'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => store.get('journal', []).some(e => e.t === 'Session 3') && !!document.querySelector('.nb-side')), 'journal entries still save, and the sidebar stays');
    await p.click('[data-nbsec="all"]'); await p.waitForTimeout(100); t.ok(await p.evaluate(() => !!$('ar-items')), 'back to the archive list');
    await p.evaluate(() => setRole('dm')); await as(p, 'dm1', CAMP); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => !!document.querySelector('[data-nbsec="dmpad"]')), 'the DM gets a notepad section');
    p = await t.open('journal', p); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => !!document.querySelector('.nb-side [data-nbsec="journal"].on') && !!$('jn-add')), 'journal.html is the same page, opened at the journal');
    t.ok(await p.evaluate(() => !NAV_GROUPS.some(g => g[1].includes('journal')) && NAV_GROUPS.some(g => g[1].includes('archive'))), 'the menu has one entry for notes');
  } },
  { name: 'archive: contacts and quests with their own fields; tags filter; DM-only notes', run: async t => {
    const p = await t.open('archive');
    await p.evaluate(fakeDB); await p.evaluate(() => { __FAKE.mem.k1 = ['dm1', 'pl1', 'pl2']; __FAKE.dms = { k1: 'dm1' }; });
    await as(p, 'pl1', CAMP);
    await p.click('[data-nbnew="npc"]'); await p.fill('#ar-title', 'Bram the innkeeper'); await p.selectOption('[data-arfld="att"]', 'Friendly');
    await p.fill('[data-arfld="where"]', 'The Gilded Goat'); await p.fill('[data-arfld="wants"]', 'His daughter back'); await p.fill('#ar-tags', 'millbrook, ally'); await p.waitForTimeout(800);
    let r = await p.evaluate(() => __FAKE.rows.find(x => x.title === 'Bram the innkeeper'));
    t.eq([r.kind, r.data.att, r.data.where, r.data.wants, r.data.tags], ['npc', 'Friendly', 'The Gilded Goat', 'His daughter back', ['millbrook', 'ally']], 'a contact keeps its fields');
    t.ok(/Friendly · The Gilded Goat/.test(await p.innerText('#ar-items')), 'the list says how they feel and where we met them');
    await p.click('[data-nbnew="quest"]'); await p.fill('#ar-title', 'Find the daughter'); await p.fill('[data-arfld="giver"]', '[[Bram the innkeeper]]'); await p.fill('[data-arfld="reward"]', '50 gp');
    await p.fill('#ar-body', '- [ ] ask at the mill #clue\n- [ ] search the woods'); await p.waitForTimeout(800);
    await p.click('[data-nbnew="quest"]'); await p.fill('#ar-title', 'Old job'); await p.selectOption('[data-arfld="status"]', 'Done'); await p.waitForTimeout(800);
    await p.click('[data-nbsec="quest"]'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => [...document.querySelectorAll('[data-arit] b')].map(b => b.innerText.replace(/^\W+/, ''))), ['Find the daughter', 'Old job'], 'quests: open ones first');
    t.ok(await p.evaluate(() => [...document.querySelectorAll('[data-nbtag]')].map(b => b.dataset.nbtag).join(',') === 'ally,clue,millbrook'), 'tags from the tag box and #hashtags in the text');
    await p.click('[data-nbtag="clue"]'); await p.waitForTimeout(100);
    t.eq(await p.evaluate(() => [...document.querySelectorAll('[data-arit] b')].map(b => b.innerText.replace(/^\W+/, ''))), ['Find the daughter'], 'a tag filters everything');
    // a secret only the DM sees
    await p.evaluate(() => { ARC.tag = ''; }); await p.click('[data-nbnew="note"]'); await p.fill('#ar-title', 'My secret'); await p.fill('#ar-body', 'I am the duke\'s son'); await p.waitForTimeout(800);
    await p.click('.ar-share summary'); await p.selectOption('#ar-camp', 'k1'); await p.waitForTimeout(150); await p.selectOption('#ar-aud', 'dm'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => __FAKE.rows.find(x => x.title === 'My secret').audience), 'dm', 'shared with the DM only');
    await as(p, 'pl2', CAMP); t.ok(!/My secret/.test(await p.innerText('#content')), 'another player never sees it');
    await as(p, 'dm1', CAMP); t.ok(/My secret/.test(await p.innerText('#ar-items')) && /DM only/.test(await p.innerText('#ar-items')), 'the DM does, marked DM only');
  } },
  { name: 'archive: the party notebook, one per campaign, every member edits', run: async t => {
    const p = await t.open('archive');
    await p.evaluate(fakeDB); await p.evaluate(() => { __FAKE.mem.k1 = ['dm1', 'pl1', 'pl2']; });
    await as(p, 'pl1', CAMP); await p.click('[data-nbsec="party:k1"]'); await p.waitForTimeout(200);
    t.ok(/Plans/.test(await p.inputValue('#ar-body')), 'a fresh notebook with headings');
    await p.fill('#ar-body', '## Plans\n- [ ] buy rope'); await p.waitForTimeout(800);
    await as(p, 'pl2', CAMP); await p.click('[data-nbsec="party:k1"]'); await p.waitForTimeout(200);
    t.eq(await p.evaluate(() => __FAKE.rows.filter(r => r.kind === 'party').length), 1, 'the second player opens the same notebook, not a new one');
    await p.fill('#ar-body', '## Plans\n- [ ] buy rope\n- [ ] sell the gem'); await p.waitForTimeout(800);
    const r = await p.evaluate(() => __FAKE.rows.find(x => x.kind === 'party'));
    t.ok(/sell the gem/.test(r.body) && r.updated_by === 'pl2' && r.can_edit, 'every member edits it');
    t.ok(/every member reads and edits it/.test(await p.innerText('#content')) && !(await p.$('[data-ar="del"]')), 'no sharing or delete controls on a notebook');
  } },
  { name: 'quick note from the character sheet: into today\'s session notes', run: async t => {
    let p = await t.open('sheet');
    await p.evaluate(() => { PARTY.push({ id: 'q1', name: 'Ara', cls: 'Wizard', level: 3, hp: 10, hpMax: 10, gear: [], inv: [] }); saveParty(); SHEET_ID = 'q1'; renderSheet(); });
    await p.click('#sh-qnote'); await p.fill('#qn-t', 'Innkeeper is Bram'); await p.click('#qn-save'); await p.waitForTimeout(200);
    t.ok(await p.evaluate(() => store.get('journal', []).some(e => /^Session notes/.test(e.t) && /\*\*Ara\*\*: Innkeeper is Bram/.test(e.body))), 'signed out: into the journal on this device');
    await p.evaluate(fakeDB); await p.evaluate(() => { CL.user = { id: 'pl1' }; CL.camps = []; ARC.state = 'idle'; });
    await p.click('#sh-qnote'); await p.fill('#qn-t', 'The key opens the north door'); await p.click('#qn-save'); await p.waitForTimeout(300);
    await p.click('#sh-qnote'); await p.fill('#qn-t', 'Owe Bram 5 gp'); await p.click('#qn-save'); await p.waitForTimeout(300);
    const rows = await p.evaluate(() => __FAKE.rows.filter(r => r.owner === 'pl1'));
    t.eq(rows.length, 1, 'one note for today'); t.ok(/north door/.test(rows[0].body) && /Owe Bram/.test(rows[0].body) && /^Session notes/.test(rows[0].title), 'both lines in it: ' + rows[0].body);
  } },
];
