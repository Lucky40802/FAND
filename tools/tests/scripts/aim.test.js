// Encounter builder aiming for the party, the Balance report, and the players' What's new handout
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(2000);
await p.evaluate(()=>{PARTY.length=0;['Fighter','Wizard','Cleric','Rogue'].forEach(k=>{const c=genFill({cls:k,level:25}).c;c.name=k;PARTY.push(c)});saveParty()});
await p.goto('file://'+path.resolve(process.argv[2],'encounter.html'));await p.waitForSelector('#en-out');await p.waitForTimeout(1200);
ok(await p.locator('#en-aim').isChecked(),'Aim for my party is on by default');
const hits={};for(const d of ['Easy','Medium','Hard','Deadly']){await p.selectOption('#en-diff',d);await p.selectOption('#en-realm','Hell');
  let got=0;for(let i=0;i<3;i++){await p.click('text=Build encounter');await p.waitForTimeout(150);const s=await p.locator('.enc-check summary').innerText();if(new RegExp('plays like '+d).test(s))got++}hits[d]=got}
console.log('aimed hits out of 3:',JSON.stringify(hits));ok(Object.values(hits).reduce((a,x)=>a+x,0)>=11,'aimed fights mostly play like the difficulty asked for');
ok(await p.locator('#en-out .note').first().innerText().then(t=>/Party check|closest/.test(t)),'says how it was picked');
// the XP-only builder still works when aiming is off
await p.uncheck('#en-aim');await p.click('text=Build encounter');await p.waitForTimeout(200);ok(await p.evaluate(()=>store.get('enc',{}).aim===false&&(store.get('enc',{}).list||[]).length>0),'aim off: XP builder');
// balance report
await p.click('#en-bal summary');await p.click('text=Run the report');await p.waitForFunction(()=>document.querySelectorAll('#en-bal-out tbody tr').length>=8,null,{timeout:120000});
const rows=await p.locator('#en-bal-out tbody tr').count();ok(rows>=8,'balance report rows: '+rows);console.log((await p.locator('#en-bal-out tbody tr').first().innerText()).replace(/\s+/g,' '));
// what's new handout
await p.goto('file://'+path.resolve(process.argv[2],'about.html'));await p.waitForTimeout(1200);
await p.click("text=What's new, for players");await p.waitForTimeout(300);
const ho=await p.evaluate(()=>[($('hoT')||{}).value,(document.querySelector('#qBox textarea')||{}).value||'']);ok(/What's new/.test(ho[0])&&/48d6/.test(ho[1])&&/Mage Armor/.test(ho[1]),'handout prefilled');
await p.setViewportSize({width:390,height:844});await p.goto('file://'+path.resolve(process.argv[2],'encounter.html'));await p.waitForTimeout(1200);const sw=await p.evaluate(()=>document.documentElement.scrollWidth);ok(sw<=392,'no sideways scroll on phone '+sw);
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
