// The visual pass: the sheet's play card, "⋯ More" menus instead of rows of buttons, and the phone header's ⋯ menu.
const ara = () => { PARTY.length = 0; PARTY.push({ id: 'v1', name: 'Ara Moonwhisper', cls: 'Wizard', level: 5, race: 'Elf', hp: 22, hpMax: 31, abil: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 }, gear: [], inv: [] }); saveParty(); SHEET_ID = 'v1'; renderSheet(); };
module.exports = [
  { name: 'sheet play card: HP at a glance, big buttons, tiles that roll', run: async t => {
    const p = await t.open('sheet');
    await p.evaluate(ara); await p.waitForTimeout(150);
    t.ok(/Ara Moonwhisper/.test(await p.innerText('.pk-card')) && /22/.test(await p.innerText('.pk-hp')), 'name and HP on the card');
    await p.click('.pk-hpbtns [data-hpd="-5"]'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY[0].hp), 17, '−5 takes 5 HP');
    await p.click('.pk-hpbtns [data-hpd="10"]'); await p.waitForTimeout(150);
    t.eq(await p.evaluate(() => PARTY[0].hp), 27, '+10 heals');
    t.eq(await p.evaluate(() => document.querySelectorAll('.pk-abil .pk-tile[data-roll]').length), 6, 'six ability tiles roll');
    t.eq(await p.evaluate(() => document.querySelector('.pk-abil .pk-tile[data-what="Intelligence check"]').dataset.roll), '1d20+4', 'Intelligence 18 rolls +4');
    // secondary actions live in ⋯ More
    t.ok(!(await p.isVisible('#sh-share')), 'Share is tucked away');
    await p.click('.sh-tabbar .more-menu summary'); t.ok(await p.isVisible('#sh-share'), '⋯ More shows it');
    await p.click('.pk-card'); t.ok(!(await p.isVisible('#sh-share')), 'a click elsewhere closes the menu');
  } },
  { name: 'combat: the main controls up front, the rest in ⋯ More', run: async t => {
    const p = await t.open('combat');
    await p.evaluate(() => { store.set('combat', { round: 1, turn: 0, list: [] }); renderCombat(); });
    t.ok(await p.isVisible('.cb-tool .cb-next') && await p.isVisible('#cb-add') && await p.isVisible('button:has-text("End fight")'), 'next turn, add monster and end fight are up front');
    t.ok(!(await p.isVisible('button:has-text("Roll monster initiative")')), 'the rest is tucked away');
    await p.click('.cb-moremenu summary'); t.ok(await p.isVisible('button:has-text("Roll monster initiative")') && await p.isVisible('#cb-ac'), '⋯ More shows it');
  } },
  { name: 'phone header: a ⋯ menu for theme and settings; the page name fits', phone: true, run: async t => {
    const p = await t.open('index');
    t.ok(!(await p.isVisible('#themeBtn')) && await p.isVisible('#hdrMore'), 'theme sits behind ⋯');
    await p.click('#hdrMore'); t.ok(await p.isVisible('#hdrpop button:has-text("Settings")'), 'the menu opens');
    const was = await p.evaluate(() => document.documentElement.dataset.theme);
    await p.click('#hdrpop button[data-h="theme"]'); t.ok(await p.evaluate(w => document.documentElement.dataset.theme !== w, was), 'the theme switches from the menu');
    t.ok(await p.evaluate(() => { const b = document.querySelector('.top .brand h1').getBoundingClientRect(); return b.width > 40; }), 'FAND shows in the header');
    t.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll');
  } },
  { name: 'computer header: no ⋯ menu, every button shown', run: async t => {
    const p = await t.open('index');
    t.ok(!(await p.isVisible('#hdrMore')) && await p.isVisible('#themeBtn'), 'the full header');
  } },
];
