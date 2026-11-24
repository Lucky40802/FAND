// Sneak Attack by the level-band table, the compendium filters (Bestiary, Spells, Materials), ammunition prices
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(900);
const s=await p.evaluate(()=>[sneakDice(5),sneakDice(15),sneakDice(25),sneakDice(95)]);ok(JSON.stringify(s)==='[3,16,60,400]','Sneak Attack dice by level: '+s);
const t=await p.evaluate(()=>{PARTY.length=0;PARTY.push({id:'r',name:'Vex',level:25,cls:'Rogue',abil:{dex:18},gear:['Rapier','Shortbow'],inv:[['Arrows',20]]});SHEET_ID='r';saveParty();renderSheet();return document.getElementById('content').textContent});
ok(/Sneak Attack \(60d6\)/.test(t),'the feature shows 60d6 at level 25');ok((t.match(/\+60d6/g)||[]).length>=2,'finesse and ranged attacks offer the Sneak Attack roll');
// filters
await p.goto('file://'+path.resolve(process.argv[2],'bestiary.html'));await p.waitForTimeout(2500);
const be=await p.evaluate(()=>{const s=[...document.querySelectorAll('select')].map(x=>x.getAttribute('aria-label')||x.options[0].text);const lv=[...document.querySelectorAll('select')].find(x=>/All levels/.test(x.options[0].text));return {s,deep:lv?[...lv.options].filter(o=>/Primordial \((\d+)\)/.test(o.text)&&!/\(0\)/.test(o.text)).length:0,ty:monType(MONSTERS.find(m=>m.sb&&/fiend/i.test(m.sb.ty)))}});
ok(be.s.some(x=>/creature types/.test(x))&&be.s.some(x=>/sizes/.test(x))&&be.deep===1,'Bestiary: type, size and level filters, deep bands filled '+JSON.stringify(be.s));ok(be.ty==='Fiend','creature type read from the stat block');
await p.goto('file://'+path.resolve(process.argv[2],'spells.html'));await p.waitForTimeout(2500);
const sp=await p.evaluate(()=>{const d=[...document.querySelectorAll('select')].find(x=>/damage type/.test(x.options[0].text));return d?[...d.options].slice(1).map(o=>o.text.replace(/ \(.*/,'')):[]});ok(sp.length>=10&&sp.every(x=>['Acid','Bludgeoning','Cold','Fire','Force','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder','Healing'].includes(x)),'Spells: damage-type filter lists only damage types '+sp);
// prices
await p.goto('file://'+path.resolve(process.argv[2],'shop.html'));await p.waitForTimeout(2000);
const pr=await p.evaluate(()=>{let am=null,wp=null;for(let k=1;k<=400&&(!am||!wp);k++){const x=rollShop('Hell','bowyer',4,k*13,5);x.bps.forEach(y=>{if(!am&&y.b.ammo&&!y.b.gp&&/Infernal/.test(y.b.n))am=y;if(!wp&&/Infernal (Crossbow|Longbow)/.test(y.b.n))wp=y})}return am&&wp?[am.b.n,am.b.lv,am.price,wp.b.n,wp.b.lv,wp.price]:null});console.log('   ',JSON.stringify(pr));
ok(pr&&pr[2]<pr[5],'an Infernal ammunition bundle costs less than an Infernal bow of about its level');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
