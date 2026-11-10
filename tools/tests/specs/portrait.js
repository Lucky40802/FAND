// Character portraits: small enough to keep, rolled back with a warning when the browser's storage is full,
// and only real pictures survive an imported party file.
const picture = async p => Buffer.from((await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 900; c.height = 600; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 900, 600); g.addColorStop(0, '#c33'); g.addColorStop(1, '#33c'); x.fillStyle = g; x.fillRect(0, 0, 900, 600);
  for (let i = 0; i < 400; i++) { x.fillStyle = `hsl(${i * 37 % 360} 70% 50%)`; x.fillRect((i * 97) % 900, (i * 53) % 600, 30, 30); } return c.toDataURL('image/png').split(',')[1]; })), 'base64');
const seed = p => p.evaluate(() => { PARTY.push({ id: 'pp', name: 'Edda', cls: 'Cleric', level: 3, hp: 20, hpMax: 20, gear: [] }); saveParty(); SHEET_ID = 'pp'; renderSheet(); });
module.exports = [
  { name: 'upload, show on the Party tab, remove', run: async t => {
    let p = await t.open('sheet'); await seed(p);
    await p.setInputFiles('.sh-port-btn input', { name: 'me.png', mimeType: 'image/png', buffer: await picture(p) }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const c = PARTY.find(x => x.id === 'pp'); return { kb: Math.round((c.portrait || '').length / 1024), img: !!document.querySelector('.sh-port img') }; });
    t.ok(r.img, 'the sheet shows it'); t.ok(r.kb > 0 && r.kb < 40, 'stored small: ' + r.kb + ' KB');
    p = await t.open('party', p);
    t.ok(await p.evaluate(() => !!document.querySelector('.pc-tab img.crest')), 'the Party tab shows it');
    p = await t.open('sheet', p); await p.evaluate(() => { SHEET_ID = 'pp'; renderSheet(); });
    await p.click('.sh-port-x');
    t.ok(await p.evaluate(() => !PARTY.find(x => x.id === 'pp').portrait && !!document.querySelector('.sh-port .crest')), 'removed, back to the class crest');
  } },
  { name: 'full storage: the portrait is not kept and FAND says so', run: async t => {
    const p = await t.open('sheet'); await seed(p);
    await p.evaluate(() => { const orig = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'fand.party' && v.length > 3000) { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); }; });
    await p.setInputFiles('.sh-port-btn input', { name: 'me.png', mimeType: 'image/png', buffer: await picture(p) }); await p.waitForTimeout(800);
    t.ok(await p.evaluate(() => !PARTY.find(x => x.id === 'pp').portrait), 'portrait rolled back');
    t.ok(await p.evaluate(() => /storage is full/.test(document.body.innerText)), 'a warning is shown');
  } },
  { name: 'imported party keeps real portraits only; Settings shows space used', run: async t => {
    const p = await t.open('party');
    const r = await p.evaluate(() => [cleanChar({ name: 'A', portrait: 'data:image/jpeg;base64,AAAA' }).portrait, cleanChar({ name: 'B', portrait: 'javascript:alert(1)' }).portrait, cleanChar({ name: 'C', portrait: '"><img src=x onerror=alert(1)>' }).portrait]);
    t.eq(r, ['data:image/jpeg;base64,AAAA', null, null].map(x => x === null ? undefined : x), 'only data-URL pictures survive');
    await t.open('settings', p);
    t.ok(await p.evaluate(() => /Space used on this device/.test(document.body.innerText) && !!document.querySelector('meter')), 'Settings shows the space used');
  } },
];
