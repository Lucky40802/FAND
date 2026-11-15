// A hit that lands always deals at least 1 damage, in the combat tracker, the damage calculator, and the Party check
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(()=>[acTaken(12,5),acTaken(12,15),acTaken(12,12),acTaken(0,3),acTaken(1,0)]);ok(JSON.stringify(r)==='[7,1,1,0,1]','acTaken: '+r);
await p.evaluate(()=>{store.set('combat',{round:1,turn:0,list:[{id:'k',name:'Knight',init:10,dex:0,hp:30,max:30,ac:20,dodge:0,cond:[]}]});CB=store.get('combat');renderCombat()});
await p.fill('#dmg-k','8');await p.evaluate(()=>cbHit('k'));const hp=await p.evaluate(()=>CB.list[0].hp);ok(hp===29,'combat: an 8-damage hit on AC 20 takes 1 HP ('+hp+')');
await p.goto('file://'+path.resolve(process.argv[2],'rules.html'));await p.waitForTimeout(1200);const t=await p.evaluate(()=>document.body.innerText);ok(/at least 1/.test(t)&&!/There is no minimum/.test(t),'rules text');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
