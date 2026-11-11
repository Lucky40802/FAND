const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
// builder heritage
const w=await p.evaluate(async()=>{for(let i=0;i<60&&!SP.length;i++)await new Promise(r=>setTimeout(r,100));charWizard();CW.cls='Fighter';CW.step=2;renderCharWiz();cwSet('race','Human',1);const step=CW_STEPS[CW.step];const has=/Heritage/.test(document.querySelector('.cw').innerText);
 cwHer('fam','Tiefling');cwHer('type','Tiefling of Dispater');const T=heritageTraits('Tiefling of Dispater');cwHer('trait',T[0]&&T[0][0]);
 CW.name='Test';CW.bg=CW_BG[0][0];CW.align='Neutral';const c=cwBuild();return {step,has,race2:c.race2,trait:c.race2Trait,T:T.map(t=>t[0])}});
console.log(JSON.stringify(w));
ok(w.step==='People options'&&w.has,'the builder always shows People options with a Heritage section');
ok(w.race2==='Tiefling of Dispater'&&!!w.trait,'a built character keeps its heritage and trait');
// cantrip picker on the sheet + DM-only realm menu
const s=await p.evaluate(async()=>{CW=null;PARTY=[{id:'e',name:'Ae',race:'High Elf',cls:'Wizard',level:3,abil:{int:16},raceOpts:{0:'Light'},spells:{0:['Light','Mage Hand'],1:['Magic Missile']},spBound:{'magic missile':'Human'}}];SHEET_ID='e';SHEET_TAB='spells';saveParty();HC=null;renderSheet();await new Promise(r=>setTimeout(r,150));
 const pick=document.querySelector('select[onchange^="sheetRaceCantrip"]');const playerSel=document.querySelectorAll('select[onchange^="sheetBind"]').length;
 sheetRaceCantrip('0','Fire Bolt');const c=PARTY[0];HC=HC||[];renderSheet();const dmSel=document.querySelectorAll('select[onchange^="sheetBind"]').length;HC=null;
 return {pick:!!pick,opts:pick?pick.options.length:0,c0:c.spells[0],ro:c.raceOpts,playerSel,dmSel,chosen:/chosen: Fire Bolt/.test(document.getElementById('content').innerText)}});
console.log(JSON.stringify(s));
ok(s.pick&&s.opts>5,'the People\'s spells box offers a cantrip picker');
ok(s.ro[0]==='Fire Bolt'&&s.c0.includes('Fire Bolt')&&!s.c0.includes('Light'),'changing it swaps the cantrip in the list');
ok(s.playerSel===0&&s.dmSel>0,'the spell realm menu shows only for the DM ('+s.playerSel+' / '+s.dmSel+')');
// generator heritage
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(1500);
const g=await p.evaluate(()=>{const out=[];$('gen-her').value='random';for(let i=0;i<6;i++){genGo();out.push([CGEN.c.race,CGEN.c.race2||'',CGEN.c.race2Trait||'',famOf(CGEN.c.race)!==famOf(CGEN.c.race2||'')])}$('gen-her').value='Gith';genGo();const gith=CGEN.c.race2;$('gen-her').value='';genGo();return {out,gith,none:CGEN.c.race2||''}});
console.log(JSON.stringify(g));
ok(g.out.every(([a,b2,t,diff])=>b2&&diff),'Random heritage: always a people from another family');
ok(/Githyanki|Githzerai/.test(g.gith)&&g.none==='','a chosen heritage family, and None');
ok(!errs.length,'no errors '+errs.join(';'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
