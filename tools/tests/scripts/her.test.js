const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
for(const [nm,vp] of [['desk',{width:1280,height:900}],['phone',{width:390,height:844}]]){
const ctx=await b.newContext({viewport:vp,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{for(let i=0;i<60&&!SP.length;i++)await new Promise(r=>setTimeout(r,100));
 PARTY=[{id:'h',name:'Vex',race:'Tiefling of Dispater',cls:'Sorcerer',level:5,abil:{cha:16,int:10,wis:12}}];SHEET_ID='h';SHEET_TAB='fand';saveParty();renderSheet();
 const before=/Add a second people/.test(document.getElementById('content').innerText);
 sheetRace2Fam('Elf');const t1=PARTY[0].race2;sheetSetRace2('Wood Elf');const T=heritageTraits('Wood Elf').map(t=>t[0]);sheetRace2Trait(T[0]);
 const fandTxt=document.getElementById('content').innerText;
 SHEET_TAB='core';renderSheet();const core=document.getElementById('content').innerText;
 PARTY[0].race2='Dark Elf';delete PARTY[0].race2Trait;saveParty();SHEET_TAB='spells';renderSheet();await new Promise(r=>setTimeout(r,200));const sp=document.getElementById('content').innerText;
 SHEET_TAB='fand';PARTY[0].race='Human';renderSheet();const dvTxt=document.getElementById('content').innerText;
 sheetRace2Fam('');const cleared=!('race2' in PARTY[0]);
 return {before,t1,T,fandHas:fandTxt.includes(T[0]),core:/Wood Elf heritage/i.test(core),heritageBox:/Heritage spells[\s\S]*Dark Elf heritage/i.test(sp),dancing:/Dancing Lights[\s\S]{0,40}heritage: Dark Elf/.test(sp),thaum:/Thaumaturgy[\s\S]{0,40}people: Tiefling of Dispater/.test(sp),faerie:/Faerie Fire[\s\S]{0,60}heritage: Dark Elf/.test(sp),dv:/Darkvision 120 ft/.test(dvTxt),lang:/Language:/.test(dvTxt),cleared}});
if(nm==='desk')console.log(JSON.stringify(r));
ok(r.before,nm+': the Heritage box offers a second people');
ok(r.t1==='High Elf'&&r.T.length>0&&r.fandHas,nm+': choosing Elf then Wood Elf, then a trait ('+r.T.join(', ')+')');
ok(!r.T.some(t=>/Darkvision/i.test(t)),nm+': spells and darkvision aren\'t offered as the one trait');
ok(r.core,nm+': page 1 names the heritage');
ok(r.heritageBox&&r.dancing&&r.thaum&&r.faerie,nm+': both peoples\' spells on the Spells page, each tagged');
ok(r.dv&&r.lang,nm+': a Human with Dark Elf heritage gets darkvision 120 ft and a language');
ok(r.cleared,nm+': No heritage clears it');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),nm+': no sideways scroll');
ok(!errs.length,nm+': no errors '+errs.join(';'));await ctx.close()}
console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
