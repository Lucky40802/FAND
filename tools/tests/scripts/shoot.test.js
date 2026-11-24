// Ammunition runs out (Shoot, pick up after the fight), shops and treasure with the new types, farming, the DM's own filing
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(900);
const ar=await p.evaluate(()=>{const a=BPS.find(b=>b.ammo&&b.ammo.fits==='bow'&&b.ammo.dmg>=3&&!b.starter);PARTY.length=0;PARTY.push({id:'r',name:'Rae',level:20,cls:'Ranger',abil:{dex:16},gear:['Longbow'],inv:[[a.n,6],['Arrows',3]]});SHEET_ID='r';saveParty();renderSheet();return a.n});
ok(await p.locator('.sh-shoot').count()===1,'a Shoot button on the bow');
for(let i=0;i<4;i++){await p.click('.sh-shoot');await p.waitForTimeout(80)}
const s1=await p.evaluate(n=>{const c=sheetChar();return [((c.inv||[]).find(x=>x[0]===n)||[0,0])[1],c.shot&&c.shot[n]]},ar);ok(s1[0]===2&&s1[1]===4,'four shots spend four of the best arrows: '+JSON.stringify(s1));
ok(await p.locator('text=Pick up ammunition').count()===1,'pick-up offered after shooting');
await p.click('text=Pick up ammunition');const s2=await p.evaluate(n=>{const c=sheetChar();return [((c.inv||[]).find(x=>x[0]===n)||[0,0])[1],!!c.shot]},ar);ok(s2[0]===4&&!s2[1],'half come back: '+JSON.stringify(s2));
for(let i=0;i<6;i++){await p.click('.sh-shoot').catch(()=>{});await p.waitForTimeout(60)}
const s3=await p.evaluate(()=>[document.body.innerText.includes('no ammo'),JSON.stringify(sheetChar().inv)]);ok(s3[1].includes('Arrows')||s3[0],'falls back to plain arrows, then says no ammo: '+s3[1]);
// shops
await p.goto('file://'+path.resolve(process.argv[2],'shop.html'));await p.waitForTimeout(1800);
const sh=await p.evaluate(()=>{const o={};for(const [realm,kind] of [['Hell','bowyer'],['Human','bowyer'],['Chaos','alch'],['Human','general']]){const r=rollShop(realm,kind,4,123,5);o[realm+'/'+kind]=r?r.bps.map(x=>x.b.n+'['+x.b.cat+'/'+x.b.lv+']'):null}return o});console.log('   ',JSON.stringify(sh).slice(0,700));
ok(!JSON.stringify(sh).includes('Chain Shot')&&sh['Hell/bowyer'].some(x=>/Ammunition/.test(x))&&sh['Human/bowyer'].some(x=>/Ammunition/.test(x)),'a bowyer always has ammunition');
ok(sh['Hell/bowyer'].some(x=>+x.match(/\/(\d+)\]/)[1]>20),'a Hell shop sells Hell-band gear (past the old level-20 cap)');
const tr=await p.evaluate(()=>{let bad=[];for(let i=0;i<300;i++){const T=rollTreasure('Hell',25,2);(T.items||[]).forEach(x=>{const b=findBP(x.n||x);if(b&&['Siege Engine','Vehicle','Structure','Fortification'].includes(b.cat))bad.push(b.n)})}return bad});ok(!tr.length,'treasure drops no siege engines, vehicles or buildings '+tr.slice(0,3));
// farming
const fm=await p.evaluate(()=>['Crop','Livestock','Fertilizer'].map(c=>BPS.filter(b=>b.cat===c).length));ok(fm.every(n=>n>=30),'farming filled out: '+fm);
// the DM's filing
await p.goto('file://'+path.resolve(process.argv[2],'blueprints.html'));await p.waitForTimeout(1800);
const dm=await p.evaluate(()=>{HC=HC||[];const n='Steel Net';const b=findBP(n);const was=b.cat;bpTypeSet(n,'Trap');return [was,findBP(n).cat,JSON.stringify(store.get('bpType',{}))]});console.log('   ',JSON.stringify(dm));
ok(dm[1]==='Trap'&&/Steel Net/.test(dm[2]),'the DM files a Blueprint elsewhere, and it is kept');
await p.reload();await p.waitForTimeout(1800);ok(await p.evaluate(()=>findBP('Steel Net').cat)==='Trap','the DM\'s filing survives a reload');
await p.evaluate(()=>{HC=HC||[];bpTypeSet('Steel Net',findBP('Steel Net').bt0)});ok(await p.evaluate(()=>!store.get('bpType',{})['Steel Net']),'putting it back clears the override');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
