const {chromium}=require('../pw.js');const path=require('path');const S=process.env.S;
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
for(const [nm,vp] of [['desk',{width:1280,height:900}],['phone',{width:390,height:844}]]){
const ctx=await b.newContext({viewport:vp,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
const f=await p.evaluate(()=>{const all=PEOPLE_FAMILY.flatMap(x=>x[1]),miss=all.filter(n=>!CW_RACE.some(r=>r[0]===n)),dup=all.filter((n,i)=>all.indexOf(n)!==i),top=peopleTop();return {miss,dup,top:top.length,all:CW_RACE.length,hasT:top.includes('Tiefling')&&!top.includes('Tiefling of Dispater')}});
if(nm==='desk')console.log(JSON.stringify(f));
ok(!f.miss.length&&!f.dup.length,nm+': every family member is a real people, none twice');
ok(f.hasT&&f.top<f.all,nm+': the people menu shows Tiefling once ('+f.top+' entries for '+f.all+' peoples)');
// builder
await p.evaluate(()=>{charWizard();CW.cls='Fighter';CW.step=2;renderCharWiz()});await p.waitForTimeout(200);
const t1=await p.evaluate(()=>{const cards=[...document.querySelectorAll('.cw-opt b')].map(x=>x.textContent);return {tief:cards.filter(x=>/Tiefling/.test(x)),disp:cards.includes('Tiefling of Dispater')}});
ok(t1.tief.length===1&&!t1.disp,nm+': builder shows one Tiefling card');
await p.evaluate(()=>{[...document.querySelectorAll('.cw-opt')].find(x=>x.querySelector('b').textContent==='Tiefling').click()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>!!document.getElementById('cw-types')&&/Tiefling of Dispater/.test(document.getElementById('cw-types').innerText)),nm+': choosing Tiefling shows its 14 types');
await p.evaluate(()=>{[...document.querySelectorAll('#cw-types .cw-opt')].find(x=>x.querySelector('b').textContent==='Tiefling of Dispater').click()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>(console.log('STEP',CW.race,CW.step),CW.race==='Tiefling of Dispater'&&CW.step>=3)),nm+': picking a type moves on with the exact people');
await p.evaluate(()=>{CW.step=2;CW.race='';CW.famOpen='';renderCharWiz();const s=document.querySelector('.cw-search');if(s){s.value='dispater';cwFilter(s)}});
ok(await p.evaluate(()=>[...document.querySelectorAll('.cw-opt')].filter(x=>!x.hidden).some(x=>x.querySelector('b').textContent==='Tiefling')),nm+': searching "dispater" finds the Tiefling card');
await p.evaluate(()=>{const w=document.querySelector('.cw-close,.cw-x');closeAll&&closeAll()}).catch(()=>{});
// generator
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(1500);
ok(await p.evaluate(()=>$('gen-type-l').hidden),nm+': generator Type menu hidden until a people with kinds is chosen');
const g=await p.evaluate(()=>{$('gen-fam').value='Dragonborn';genFam();const shown=!$('gen-type-l').hidden,opts=[...$('gen-race').options].map(o=>o.value);const rs=new Set();for(let i=0;i<12;i++){genGo();rs.add(CGEN.c.race)}$('gen-race').value='Gem Dragonborn';genGo();return {shown,opts,rs:[...rs],pick:CGEN.c.race}});
ok(g.shown&&g.opts.includes('Chromatic Dragonborn')&&g.rs.every(r=>/Dragonborn/.test(r))&&g.pick==='Gem Dragonborn',nm+': Dragonborn → Type; Any type stays a dragonborn ('+g.rs.join(', ')+'); Gem picks Gem');
ok(await p.evaluate(()=>{$('gen-fam').value='Aasimar';genFam();genGo();return $('gen-type-l').hidden&&CGEN.c.race==='Aasimar'}),nm+': a people without kinds needs no type');
// sheet
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1200);
await p.evaluate(()=>{PARTY=[{id:'s',name:'Kai',race:'Human',cls:'Fighter',level:1}];SHEET_ID='s';SHEET_TAB='core';saveParty();renderSheet()});
const sh=await p.evaluate(()=>{const sels=document.querySelectorAll('.sh-race:not(.sh-noprint) select');sheetRaceFam('Tiefling');const a=PARTY[0].race;sheetSetRace('Tiefling of Dispater');const sel2=document.querySelectorAll('.sh-race:not(.sh-noprint) select');return {n0:sels.length,a,b:PARTY[0].race,n1:sel2.length,typeVal:sel2[1]&&sel2[1].value}});
ok(sh.n0===2&&sh.a==='Tiefling'&&sh.b==='Tiefling of Dispater'&&sh.n1===2&&sh.typeVal==='Tiefling of Dispater',nm+': sheet People then Type menus set the exact people ('+JSON.stringify(sh)+')');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),nm+': no sideways scroll');
ok(!errs.length,nm+': no errors '+errs.join(';'));await ctx.close()}
console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
