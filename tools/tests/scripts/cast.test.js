// The sheet's Cast button: the casting-in-armor check, the spell's dice, and the slot it ticks
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(1000);
const set=gear=>p.evaluate(g=>{PARTY.length=0;PARTY.push({id:'w',name:'Wren',level:5,cls:'Wizard',abil:{int:16,con:12},gear:g,inv:[],spells:{0:['Fire Bolt'],3:['Fireball']}});SHEET_ID='w';SHEET_TAB='spells';saveParty();renderSheet()},gear);
await set([]);ok(await p.locator('.sh-cast').count()===2,'a Cast button on each spell');
const toasts=[];await p.exposeFunction('__t',s=>toasts.push(s));await p.evaluate(()=>{const o=toast;window.toast=s=>{__t(String(s));o(s)}});
await p.evaluate(()=>{Math.random=(()=>{let i=0;const v=[0.99,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5];return()=>v[(i++)%v.length]})()});
await p.click('.sh-cast >> nth=1');await p.waitForTimeout(200);
const s1=await p.evaluate(()=>[JSON.stringify(sheetChar().slotUsed||{}),(store.get('dicelog',[])[0]||{}).e||'']);console.log('   ',JSON.stringify(s1));
ok(/"3":\{"0":true\}/.test(s1[0]),'Fireball ticks a level 3 slot');ok(/Fireball/.test(s1[1])&&/d6/.test(s1[1]),'and rolls its dice: '+s1[1]);
// in plate: a low roll fizzles and still spends the slot
await set(['Plate Armor']);await p.evaluate(()=>{Math.random=()=>0.1});toasts.length=0;
await p.click('.sh-cast >> nth=1');await p.waitForTimeout(200);
const s2=await p.evaluate(()=>JSON.stringify(sheetChar().slotUsed||{}));ok(toasts.some(t=>/fizzles/.test(t))&&/"3":\{"0":true\}/.test(s2),'in plate a d20 of 3 fizzles and spends the slot: '+toasts.join(' | '));
await p.evaluate(()=>{Math.random=()=>0.95});toasts.length=0;await p.click('.sh-cast >> nth=1');await p.waitForTimeout(200);
ok(toasts.some(t=>/Armor check passed/.test(t)),'a high roll passes the armor check');
// no free slot
await p.evaluate(()=>{const c=sheetChar();c.slotUsed={3:{0:true,1:true}};saveParty();renderSheet()});toasts.length=0;await p.click('.sh-cast >> nth=1');await p.waitForTimeout(200);
ok(toasts.some(t=>/No free slot/.test(t)),'no free slot: says so');
// cantrips need no slot
await p.click('.sh-cast >> nth=0');await p.waitForTimeout(200);ok(await p.evaluate(()=>/Fire Bolt/.test((store.get('dicelog',[])[0]||{}).e||'')),'a cantrip rolls without a slot');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
