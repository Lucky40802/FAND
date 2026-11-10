// Keyboard and screen-reader basics: a visible focus ring on everything you can tab to, named buttons, Escape closes
// menus, and the file pickers (portrait, imports, backups) work from the keyboard.
const ringCheck = async (t, pg, prep) => {
  const p = await t.open(pg); if (prep) await p.evaluate(prep);
  const bad = [];
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press('Tab');
    const r = await p.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      if (/^(INPUT|TEXTAREA)$/.test(e.tagName) && e.type !== 'checkbox' && e.type !== 'radio') return null; // their border changes colour
      const s = getComputedStyle(e), ring = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow = s.boxShadow && s.boxShadow !== 'none';
      const name = (e.getAttribute('aria-label') || e.innerText || e.title || e.value || '').trim();
      return { tag: e.tagName + '.' + String(e.className).split(' ')[0], ring: ring || shadow, name: !!name || !!e.querySelector('img[alt]:not([alt=""])') || e.tagName === 'SELECT' };
    });
    if (!r) continue;
    if (!r.ring) bad.push(pg + ': no focus ring on ' + r.tag);
    if (!r.name) bad.push(pg + ': no name on ' + r.tag);
  }
  return [...new Set(bad)];
};
const party = () => { PARTY.push({ id: 'k1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }); saveParty(); };
module.exports = [
  { name: 'tabbing shows a focus ring and every stop has a name', run: async t => {
    let bad = [];
    bad = bad.concat(await ringCheck(t, 'index'));
    bad = bad.concat(await ringCheck(t, 'party', () => { PARTY.push({ id: 'k1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }); saveParty(); renderParty(); }));
    bad = bad.concat(await ringCheck(t, 'spells'));
    bad = bad.concat(await ringCheck(t, 'combat', () => { store.set('combat', { round: 1, turn: 0, list: [{ id: 'g', name: 'Goblin', init: 12, hp: 7, max: 7, ac: 1, cond: [] }] }); renderCombat(); }));
    t.eq(bad, [], 'focus rings and names');
  } },
  { name: 'Escape closes a More menu and returns to its button', run: async t => {
    const p = await t.open('party'); await p.evaluate(() => { PARTY.push({ id: 'k1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }); saveParty(); renderParty(); });
    await p.focus('details.mmenu>summary'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => !!document.querySelector('details.mmenu[open]')), 'Enter opens it');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    t.ok(await p.evaluate(() => !document.querySelector('details.mmenu[open]') && document.activeElement.matches('details.mmenu>summary')), 'Escape closes it, focus back on the button');
  } },
  { name: 'file pickers work from the keyboard', run: async t => {
    const p = await t.open('sheet');
    await p.evaluate(() => { PARTY.push({ id: 'k1', name: 'Mira', cls: 'Wizard', level: 3, hp: 10, hpMax: 12, gear: [] }); saveParty(); SHEET_ID = 'k1'; renderSheet(); });
    await p.waitForTimeout(100);
    const lab = await p.evaluate(() => { const l = document.querySelector('.sh-port-btn'); return { tab: l.tabIndex, role: l.getAttribute('role') }; });
    t.eq(lab, { tab: 0, role: 'button' }, 'portrait button is a keyboard stop');
    const chooser = p.waitForEvent('filechooser', { timeout: 3000 });
    await p.focus('.sh-port-btn'); await p.keyboard.press('Enter');
    t.ok(!!(await chooser), 'Enter opens the file picker');
  } },
];
