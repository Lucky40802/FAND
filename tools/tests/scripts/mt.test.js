const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const fb=SP.find(s=>s.n==='Fireball'),bolt=SP.find(s=>s.n==='Fire Bolt');const at=(L,rn,sp)=>spellPow({level:L},rn,sp);
return {mult:DICE_MULT.join(),h1:at(5,'Human',fb),h25:at(25,'Human',fb),hell5:at(5,'Hell',fb),prim95:at(95,'Primordial',fb),bolt30:at(30,'Human',bolt),
 fb25:spellAt(spellDmg(fb),at(25,'Human',fb)),hc25:hcScale('deals 3d6 fire damage',25),hc5:hcScale('deals 3d6 fire damage',5),hc95:hcScale('3d6',95),
 npc:typeof npcSpells}});
console.log(JSON.stringify(r));
ok(r.mult==='1,2,6,9,12,16,22,27,32,40','table');ok(r.h1===1&&r.h25===6&&r.hell5===6&&r.prim95===40,'spell power by level and realm');
ok(r.bolt30===24,'Fire Bolt at 30 is ×24 (×6 band × 4 cantrip)');ok(/48d6/.test(r.fb25),'Fireball 8d6 → 48d6 at 25: '+r.fb25);
ok(/18d6/.test(r.hc25)&&/3d6/.test(r.hc5)&&/120d6/.test(r.hc95),'hidden-class dice '+r.hc25+' / '+r.hc95);
await p.goto('file://'+path.resolve(process.argv[2],'rules.html'));await p.waitForTimeout(1200);
const rt=await p.evaluate(()=>document.body.innerText);ok(/×1, ×2, ×6, ×9/.test(rt)&&/24d10/.test(rt),'rules text updated');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
