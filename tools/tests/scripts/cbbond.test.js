const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await ctx.addInitScript(()=>{if(!localStorage.getItem('fand.party'))localStorage.setItem('fand.party',JSON.stringify([{id:'z1',name:'Zed',level:15,cls:'Wizard',hpMax:80,hp:80,gear:[],inv:[],bondOn:true,bonds:[{n:'Fang',parts:[]},{n:'Ash',parts:[],dead:true,hp:0},{n:'Wisp',parts:[]}]},{id:'k1',name:'Kai',level:15,cls:'Fighter',hpMax:120,hp:120,gear:[],inv:[]}]))});
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(1500);
await p.click('button[onclick="cbAddParty()"]');await p.waitForTimeout(300);
const L=await p.evaluate(()=>CB.list.map(x=>[x.name,x.hp,x.max,x.ac,!!x.bond,x.sum&&x.sum.by]));console.log(JSON.stringify(L));
ok(L.length===4,'two characters and two living summons (the fallen one stays out)');
const zi=L.findIndex(x=>x[0]==='Zed');ok(L[zi+1]&&/Fang/.test(L[zi+1][0])&&/Wisp/.test(L[zi+2][0]),'summons act right after their summoner');
ok(await p.locator('text=/Accuracy \\+\\d+, hit \\d+/').count()===2,'attack line shown');
await p.click('button[onclick="cbAddParty()"]');ok(await p.evaluate(()=>CB.list.length)===4,'adding the party again does not duplicate summons');
// damage Fang down to 0 → sheet marks it fallen
await p.evaluate(()=>{const x=CB.list.find(y=>/Fang/.test(y.name));x.hp=0;saveCB()});
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('fand.party')).find(c=>c.id==='z1').bonds[0]);ok(s.dead===true&&s.hp===0,'0 HP in combat marks it fallen on the sheet');
await p.evaluate(()=>{const x=CB.list.find(y=>/Wisp/.test(y.name));x.hp=50;saveCB()});
const w=await p.evaluate(()=>JSON.parse(localStorage.getItem('fand.party')).find(c=>c.id==='z1').bonds[2].hp);ok(w===50,'HP synced to the sheet '+w);
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
