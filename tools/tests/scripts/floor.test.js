// The damage floor setting (Rules page) and the DM's hidden-class dice check
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'rules.html'));await p.waitForTimeout(1500);
ok(await p.locator('select[aria-label="Damage floor"]').count()===1,'floor menu on the Rules page');
const r=await p.evaluate(()=>{const o={};for(const m of ['one','realm','quarter']){store.set('dmgFloor',m);o[m]=[acTaken(12,15,1),acTaken(12,15,4),acTaken(40,35,1),acTaken(8,2,6)]}store.set('dmgFloor','one');return o});console.log('   ',JSON.stringify(r));
ok(JSON.stringify(r.one)==='[1,1,5,6]','at least 1');ok(JSON.stringify(r.realm)==='[1,4,5,6]','at least the realm tier');ok(JSON.stringify(r.quarter)==='[3,3,10,6]','at least a quarter');
await p.selectOption('select[aria-label="Damage floor"]','realm');ok(await p.evaluate(()=>store.get('dmgFloor'))==='realm','menu saves the choice');
// the combat tracker uses the fight's realm
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(1500);
const hp=await p.evaluate(()=>{const m=[...MON_IDX.values()].find(m=>m.sb&&m.realm==='Hell');CB={round:1,turn:0,list:[{id:'k',name:'Knight',pc:'',init:10,dex:0,hp:50,max:50,ac:20,dodge:0,cond:[]},monCombatant(m,0)]};saveCB();renderCombat();$('dmg-k').value=5;cbHit('k');return CB.list[0].hp});
ok(hp===50-3,'Hell fight, realm floor: a 5-damage hit on AC 20 deals 3 ('+(50-hp)+')');
await p.evaluate(()=>store.set('dmgFloor','one'));
// hidden-class dice check (with a stand-in class)
await p.goto('file://'+path.resolve(process.argv[2],'hidden.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>{store.set('role','dm');HC=hcRetower([{n:'Test Reaver',tier:'Rare',base:'Fighter',features:[['','Rend','Deals 3d6 slashing damage.'],['','Burst','Deals 10d10 fire damage once per long rest.'],['','Guard','Gain +1 AC.']]}]);renderTabs();return renderHidden()});await p.waitForTimeout(300);
await p.click('#hc-dice summary');await p.click('text=Run the check');await p.waitForTimeout(300);
const t=await p.locator('#hc-dice-out').innerText();console.log('   ',t.replace(/\s+/g,' ').slice(0,300));
ok(/2 features with dice/.test(t)&&/Rend/.test(t)&&/Burst/.test(t)&&/18d6/.test(t),'dice check lists features with grown dice');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
