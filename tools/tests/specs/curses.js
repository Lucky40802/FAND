// Cursed gear in play: gear made from a cursed Abyssal metal shows its curse, won't come off until the curse is lifted,
// and a rest reminds the table which curses still hold.
const pick = "Abyssal Miner's Pick";
module.exports = [
  { name: 'cursed gear: the curse shows on the sheet and play card, blocks unequipping, and Remove curse lifts it', run: async t => {
    const p = await t.open('sheet');
    await p.evaluate(n => { PARTY.length = 0; PARTY.push({ id: 'cz', name: 'Ara', cls: 'Fighter', level: 5, hp: 30, hpMax: 40, gear: [n, 'Iron Shortsword'].filter(x => findBP(x)), inv: [] }); saveParty(); SHEET_ID = 'cz'; SHEET_TAB = 'core'; renderSheet(); }, pick);
    await p.waitForTimeout(200);
    t.ok(/Cursed: Cacophony/.test(await p.innerText('.pk-card')), 'the play card says what curse they carry');
    await p.evaluate(() => { SHEET_TAB = 'gear'; renderSheet(); }); await p.waitForTimeout(200);
    const box = await p.innerText('.cz-box');
    t.ok(/Cacophony/.test(box) && /Miner's Pick/.test(box) && /Curse:/.test(box) && /never stops ringing/.test(box), 'the sheet shows the gift and the curse: ' + box.slice(0, 300));
    await p.evaluate(n => sheetGear('rm', PARTY[0].gear.indexOf(n)), pick); await p.waitForTimeout(150);
    t.ok(await p.evaluate(n => PARTY[0].gear.includes(n), pick), 'it will not come off');
    t.ok(/won't come off/.test(await p.innerText('#toast')), 'and says why');
    await p.click('.cz-box button:has-text("Remove curse")'); await p.waitForTimeout(200);
    t.ok(/curse lifted/.test(await p.innerText('.cz-box')), 'Remove curse marks it lifted');
    await p.evaluate(n => sheetGear('rm', PARTY[0].gear.indexOf(n)), pick); await p.waitForTimeout(150);
    t.eq(await p.evaluate(n => [PARTY[0].gear.includes(n), !!PARTY[0].curseOff, (PARTY[0].inv.find(z => z[0] === n) || [])[1]], pick), [false, false, 1], 'then it comes off into the bag, and is a cursed item again');
  } },
  { name: 'cursed gear: a rest reminds the table which curses still hold', run: async t => {
    const p = await t.open('party');
    await p.evaluate(n => { PARTY.length = 0; PARTY.push({ id: 'cz', name: 'Ara', cls: 'Fighter', level: 5, hp: 10, hpMax: 40, gear: [n], inv: [] }, { id: 'c2', name: 'Bo', cls: 'Wizard', level: 5, hp: 10, hpMax: 20, gear: [], inv: [] }); saveParty(); store.set('askmass', false); }, pick);
    await p.evaluate(() => partyRest('long')); await p.waitForTimeout(700);
    const tt = await p.innerText('#toast'); t.ok(/curses still hold/.test(tt) && /Ara \(Cacophony\)/.test(tt) && !/Bo/.test(tt), 'the reminder names who and which curse: ' + tt);
    await p.evaluate(() => { PARTY[0].curseOff = [PARTY[0].gear[0]]; saveParty(); toast(''); partyRest('short'); }); await p.waitForTimeout(700);
    t.ok(!/curses still hold/.test(await p.innerText('#toast')), 'a lifted curse is not reminded');
    t.ok(await p.evaluate(() => { try { rmGear('cz', 0); } catch (e) { return false; } return !PARTY[0].gear.length; }), 'and it can come off on the Party page too');
  } },
];
module.exports.push({ name: 'export as PDF: a clean summary with stats, gear powers, curses, inventory and coin', run: async t => {
  const p = await t.open('sheet');
  await p.evaluate(n => { PARTY.length = 0; PARTY.push({ id: 'x', name: 'Ara <b>', cls: 'Rogue', level: 5, race: 'Elf', hp: 20, hpMax: 33, abil: { dex: 18, wis: 14 }, skillB: { perception: 4, stealth: 7 }, coins: { gp: 42, sp: 3 }, gear: [n], inv: [['Iron', 3], ['Rope', 1]], notes: 'Owes Hesta 10 gp' }); saveParty(); SHEET_ID = 'x'; renderSheet(); window.__printed = 0; }, "Abyssal Miner's Pick");
  await p.waitForTimeout(150);
  await p.evaluate(() => { const o = HTMLIFrameElement.prototype; const f = () => { const fr = document.getElementById('pdfFrame'); if (fr) fr.contentWindow.print = () => { window.__printed++ } }; setTimeout(f, 50); sheetPDF(); setTimeout(f, 0); });
  await p.waitForTimeout(500);
  const html = await p.evaluate(() => document.getElementById('pdfFrame').contentDocument.body.innerText);
  t.ok(/Ara <b>/.test(html) && /Elf · Rogue 5/.test(html), 'the name (escaped) and who they are');
  t.ok(/DEX\s*\+4/i.test(html) && /Passive Perception\s*14/i.test(html) && /Stealth \+7/.test(html), 'abilities, passive Perception and skills');
  t.ok(/Miner's Pick/.test(html) && /Cacophony/.test(html), 'the gear and its power');
  t.ok(/Cursed gear/i.test(html) && /Curse:/.test(html), 'the curse');
  t.ok(/3 × Iron/.test(html) && /42 gp, 3 sp/.test(html) && /Owes Hesta/.test(html), 'inventory, money and notes');
  t.ok(await p.evaluate(() => getComputedStyle(document.getElementById('pdfFrame')).visibility === 'hidden'), 'the page itself is untouched');
} });
