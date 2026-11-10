// Summons in the combat tracker, the player view and the encounter builder.
const fight = () => ({ round: 1, turn: 0, list: [
  { id: 'a', name: 'Ara', init: 15, dex: 2, hp: 20, max: 20, ac: 2, dodge: 1, cond: [] },
  { id: 'g', name: 'Goblin', init: 12, dex: 1, hp: 7, max: 7, ac: 1, dodge: 0, cond: [] },
  { id: 'o', name: 'Orc', init: 8, dex: 0, hp: 15, max: 15, ac: 2, dodge: 0, cond: [] }] });
module.exports = [
  { name: 'combat: summons act after their summoner, count down, and leave with them', run: async t => {
    const p = await t.open('combat');
    const wolf = await p.evaluate(f => { store.set('combat', f); renderCombat(); const m = [...MON_IDX.values()].find(m => /^wolf$/i.test(m.n) && m.sb) || [...MON_IDX.values()].find(m => /wolf/i.test(m.n) && m.sb); return m.n; }, fight());
    await p.click('button[title^="Call a creature"]');
    await p.selectOption('#sm-by', 'a'); await p.fill('#sm-mon', wolf); await p.fill('#sm-n', '2'); await p.fill('#sm-r', '2');
    await p.click('.cb-sum button.primary'); await p.waitForTimeout(300);
    const order = () => p.evaluate(() => CB.list.map(x => x.id === 'a' || x.id === 'g' || x.id === 'o' ? x.name : 'S' + (x.sum ? x.sum.left : '?')));
    t.eq(await order(), ['Ara', 'S2', 'S2', 'Goblin', 'Orc'], 'two summons right after Ara');
    // a full round: the summons tick down when their summoner's turn comes round again
    for (let i = 0; i < 5; i++) await p.evaluate(() => cbNext());
    t.eq(await order(), ['Ara', 'S1', 'S1', 'Goblin', 'Orc'], 'one round left');
    for (let i = 0; i < 5; i++) await p.evaluate(() => cbNext());
    t.eq(await order(), ['Ara', 'Goblin', 'Orc'], 'expired summons leave');
    // summoner removed takes their summons
    // the summon panel stays open for another
    await p.selectOption('#sm-by', 'o'); await p.fill('#sm-mon', 'Shadow Thing'); await p.fill('#sm-hp', '9'); await p.fill('#sm-ac', '3'); await p.fill('#sm-n', '1'); await p.fill('#sm-r', '');
    await p.click('.cb-sum button.primary'); await p.waitForTimeout(300);
    t.ok(await p.evaluate(() => CB.list.some(x => /Shadow/.test(x.name) && x.hp === 9 && x.ac === 3)), 'custom summon with its own HP and AC');
    await p.evaluate(() => cbRemove('o'));
    t.eq(await p.evaluate(() => CB.list.map(x => x.name)), ['Ara', 'Goblin'], 'removing the Orc removes its summon');
  } },
  { name: 'player view marks summons with their summoner', run: async t => {
    const p = await t.open('combat');
    const rows = await p.evaluate(() => {
      store.set('combat', { round: 1, turn: 0, list: [{ id: 'a', name: 'Ara', init: 15, hp: 20, max: 20, ac: 2, cond: [] },
        { id: 'w', name: "Wolf 1 (Ara's)", mon: 'Wolf', init: 15, hp: 6, max: 11, ac: 1, cond: [], sum: { by: 'a', base: 'Wolf', left: 3, own: false } }] });
      renderCombat(); pvOpen(); return [...document.querySelectorAll('#pv .pv-row')].map(r => r.className + '|' + r.innerText.replace(/\s+/g, ' '));
    });
    t.ok(rows.length === 2 && /Ara/.test(rows[1]), 'the summon row names Ara: ' + rows.join(' / '));
  } },
  { name: 'encounter builder: summons add XP and go to combat', run: async t => {
    const p = await t.open('encounter');
    const names = await p.evaluate(() => { const f = re => [...MON_IDX.values()].find(m => re.test(m.n) && m.sb); return [f(/^Orc$/i) || f(/orc/i), f(/^Skeleton$/i) || f(/skeleton/i)].map(m => m.n); });
    await p.evaluate(n => { store.set('enc', { size: 4, level: 3, realm: '', diff: 'Medium', list: [[n[0], 2]], sums: [] }); store.set('combat', { round: 1, turn: 0, list: [] }); renderEncounter(); }, names);
    const xp = () => p.evaluate(() => +(document.getElementById('en-out').innerText.match(/Adjusted XP\s*([\d,]+)/i) || [0, '0'])[1].replace(/,/g, ''));
    const before = await xp();
    await p.fill('#es-mon', names[1]); await p.fill('#es-n', '2'); await p.fill('#es-r', '5');
    await p.click('button:has-text("Add summon")'); await p.waitForTimeout(300);
    t.ok(await xp() > before, 'XP goes up with summons');
    await p.evaluate(() => sendToCombat()); await p.waitForLoadState('load');
    await p.waitForFunction(() => typeof CB !== 'undefined' && CB.list && CB.list.length > 0, null, { timeout: 20000 });
    t.eq(await p.evaluate(() => CB.list.filter(x => x.sum).length), 4, 'two summons for each of the two orcs');
  } },
];
