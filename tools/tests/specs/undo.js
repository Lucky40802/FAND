// Undo and Redo for changes to saved data, and the question before changes to many things at once (a setting).
const addTwo = p => p.evaluate(() => { PARTY.length = 0; PARTY.push({ id: 'u1', name: 'Ara', cls: 'Wizard', level: 3, hp: 5, hpMax: 20, gear: [], inv: [] }, { id: 'u2', name: 'Bo', cls: 'Fighter', level: 3, hp: 8, hpMax: 30, gear: [], inv: [] }); saveParty(); UNDO.steps = []; UNDO.redo = []; undoBtn(); });
module.exports = [
  { name: 'undo: a change is taken back, and redone', run: async t => {
    const p = await t.open('party');
    await addTwo(p);
    t.ok(await p.evaluate(() => $('undoBtn').disabled), 'nothing to undo yet');
    await p.evaluate(() => { PARTY[0].hp = 1; saveParty(); }); await p.waitForTimeout(400);
    t.ok(await p.evaluate(() => !$('undoBtn').disabled && /party/.test($('undoBtn').title)), 'the button says what it will undo');
    await p.click('#undoBtn'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [PARTY.find(c => c.id === 'u1').hp, store.get('party').find(c => c.id === 'u1').hp]), [5, 5], 'undone, in memory and saved');
    t.ok(/Undone/.test(await p.innerText('#toast')), 'it says so');
    await p.click('#toast button'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY.find(c => c.id === 'u1').hp), 1, 'Redo puts it back');
    // a deleted character comes back, and stays back after the next save (it is stamped as new, not as deleted)
    await p.evaluate(() => { UNDO.steps = []; PARTY.splice(1, 1); saveParty(); }); await p.waitForTimeout(1100);
    await p.evaluate(() => undoDo()); await p.waitForTimeout(150);
    t.ok(await p.evaluate(() => PARTY.some(c => c.id === 'u2') && store.get('party').some(c => c.id === 'u2')), 'a deleted character is back');
  } },
  { name: 'undo: typing makes one step; Ctrl+Z outside a text box; steps survive moving to another page', run: async t => {
    let p = await t.open('party');
    await addTwo(p);
    await p.evaluate(async () => { for (const n of ['A', 'Ar', 'Ara ', 'Ara t', 'Ara the']) { PARTY[0].name = n; saveParty(); await new Promise(r => setTimeout(r, 200)); } }); await p.waitForTimeout(400);
    t.eq(await p.evaluate(() => UNDO.steps.length), 1, 'five quick edits of one thing are one step');
    await p.keyboard.press('Control+z'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY[0].name), 'Ara', 'Ctrl+Z undoes the whole burst');
    await p.evaluate(() => { PARTY[0].level = 9; saveParty(); }); await p.waitForTimeout(400);
    p = await t.open('sheet', p);
    t.ok(await p.evaluate(() => UNDO.steps.length === 1 && !$('undoBtn').disabled), 'the step is still there on another page');
    await p.evaluate(() => undoDo()); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY.find(c => c.id === 'u1').level), 3, 'and undoes there');
    await p.evaluate(() => { store.set('theme', 'dark'); store.set('jq', 'x'); }); await p.waitForTimeout(400);
    t.eq(await p.evaluate(() => UNDO.steps.length), 0, 'page settings (theme, search boxes) are not undo steps');
  } },
  { name: 'undo: the combat tracker', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => { store.set('combat', { round: 3, turn: 0, list: [{ id: 'a', name: 'Ogre', hp: 10, max: 59, init: 9, cond: [] }] }); UNDO.steps = []; renderCombat(); CB.list[0].hp = 0; saveCB(); });
    await p.waitForTimeout(400); await p.evaluate(() => undoDo()); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => [CB.list[0].hp, store.get('combat').list[0].hp]), [10, 10], 'damage taken back');
  } },
  { name: 'mass changes ask first; the question can be turned off in Settings', run: async t => {
    let p = await t.open('party');
    const asked = []; p.on('dialog', d => asked.push(d.message()));
    await addTwo(p);
    await p.evaluate(() => partyRest('long')); await p.waitForTimeout(200);
    t.ok(asked.length === 1 && /Long rest for Ara, Bo/.test(asked[0]) && /Settings/.test(asked[0]), 'a rest for the whole party asks once: ' + JSON.stringify(asked));
    t.eq(await p.evaluate(() => PARTY.map(c => c.hp)), [20, 30], 'and goes ahead when you say yes');
    await p.evaluate(() => undoDo()); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY.map(c => c.hp)), [5, 8], 'Undo takes the whole rest back');
    p = await t.open('settings', p);
    await p.uncheck('#setAskMass'); await p.waitForTimeout(100);
    p = await t.open('party', p); await addTwo(p);
    const before = asked.length; await p.evaluate(() => partyRest('long')); await p.waitForTimeout(200);
    t.eq(asked.length, before, 'turned off: no question'); t.eq(await p.evaluate(() => PARTY.map(c => c.hp)), [20, 30], 'the rest happens');
  } },
  { name: 'undo button on a phone', phone: true, run: async t => {
    const p = await t.open('party');
    t.ok(await p.isVisible('#undoBtn'), 'in the header');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'the header still fits');
  } },
];
