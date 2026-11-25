// The DM's Artificer's Forge: DM mode only for the DM; any character; infusions past the known list, level and limit;
// constructs from any vault material (nothing used up) at a set strength; upgrades; restore all; enemy constructs
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:1200,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+path.resolve(process.argv[2],'forge.html'));await p.waitForTimeout(3000);
const pl=await p.evaluate(()=>{PARTY.length=0;PARTY.push({id:'a1',name:'Tink',level:4,cls:'Artificer',gear:['Longsword','Chain Mail','Shield'],inv:[]},{id:'f1',name:'Bo',level:12,cls:'Fighter',gear:['Greatsword']});saveParty();ARTF={dm:true};renderForge();return {dm:dmUnlocked(),txt:document.getElementById('art-forge').textContent}});
ok(!pl.dm&&!/DM mode/.test(pl.txt)&&!/Enemy construct/.test(pl.txt),'players see no DM mode, even with it saved on');
await p.evaluate(()=>{HC=HC||[];renderForge()});
const t=await p.evaluate(()=>document.getElementById('art-forge').textContent);ok(/DM mode/.test(t)&&/The party's Artificers/.test(t)&&/Enemy construct/.test(t),'the DM gets DM mode, the overview and the enemy construct maker');
// infusions beyond the rules: a level 4 Artificer gets a level 10 infusion, past its limit of 2
await p.evaluate(()=>{const c=PARTY[0];c.infKnown=['Enhanced Weapon'];c.infuse=[{n:'Enhanced Weapon',item:'Longsword'}];saveParty();renderForge()});
for(const [inf,item] of [['Helm of Awareness','Chain Mail'],['Enhanced Defense','Shield'],['Enhanced Weapon','Greatsword · Bo']]){await p.selectOption('#adm-inf',inf);const v=await p.$eval('#adm-item',(s,l)=>[...s.options].find(o=>o.textContent===l).value,item);await p.selectOption('#adm-item',v);await p.click('#art-forge button:has-text("✦ Infuse")')}
const I=await p.evaluate(()=>({on:infOn(PARTY[0]).map(o=>o.d.n+(o.x.dm?'*':'')),cap:infCap(4),bo:infAcc(PARTY[1],findBP('Greatsword'))}));
ok(I.on.length===4&&I.on.includes('Helm of Awareness*')&&I.bo===1,'DM infusions skip the known list, level and limit (Artificer limit '+I.cap+'): '+I.on);
// a construct from vault materials, nothing used up, at a set strength
const mats=await p.evaluate(()=>{const g=MATS.filter(m=>m.realm==='Primordial'&&!m.gen);return [g.find(m=>matCode(m)==='O').n,g.find(m=>['G','E','K'].includes(matCode(m))).n]});
await p.selectOption('#adm-kind','Eldritch Cannon');await p.fill('#adm-name','Big Bertha');await p.fill('#adm-frame',mats[0]);await p.fill('#adm-core',mats[1]);await p.fill('#adm-arm',mats[0]);await p.click('#art-forge button:has-text("Build (DM)")');
const K1=await p.evaluate(()=>{const N=artNow(PARTY[0]);return N&&{n:N.n,lv:N.L,f:N.f,inv:PARTY[0].inv.length,hp:N.hp}});ok(K1&&K1.n==='Big Bertha'&&K1.f===1&&K1.inv===0,'a level 4 Artificer gets a Primordial-material cannon from the vault, nothing taken from its pack '+JSON.stringify(K1));
await p.fill('#adm-pct','150');await p.click('#art-forge button:has-text("Rebuild (DM)")');const K2=await p.evaluate(()=>{const N=artNow(PARTY[0]);return {f:N.f,hp:N.hp,txt:/150% strength \(set by the DM\)/.test(document.getElementById('art-forge').textContent)}});
ok(Math.abs(K2.f-1.5)<1e-9&&K2.hp>K1.hp&&K2.txt,'the DM sets its strength to 150% ('+K1.hp+' → '+K2.hp+' HP)');
await p.fill('#adm-up',mats[1]);await p.click('#art-forge button:has-text("＋ Upgrade")');const up=await p.evaluate(()=>PARTY[0].construct.ups.length);ok(up===1,'an upgrade past the level\'s slots (level 4 has none)');
// a construct for a non-Artificer
await p.evaluate(()=>{artSet('who','f1')});await p.fill('#adm-frame',mats[0]);await p.fill('#adm-core',mats[1]);await p.fill('#adm-arm',mats[0]);await p.click('#art-forge button:has-text("Build (DM)")');
const bo=await p.evaluate(()=>({N:!!artNow(PARTY[1]),r:charRound(PARTY[1],'Mysterious',0).how}));ok(bo.N&&/Steel Defender|Eldritch Cannon|Homunculus/.test(bo.r),'the DM gives a Fighter a construct, and it counts in the Party check: '+bo.r);
// restore all
const rs=await p.evaluate(()=>{const c=PARTY[0];c.infLocked=true;c.construct.dead=true;artDmRestAll();return {open:!c.infLocked,back:!c.construct.dead}});ok(rs.open&&rs.back,'Restore every Artificer acts as a long rest');
// enemy construct
await p.selectOption('#aen-kind','Steel Defender');await p.fill('#aen-lv','45');await p.fill('#aen-n','2');await p.fill('#aen-name','Gate Warden');await p.click('#art-forge button:has-text("Add to the combat tracker")');
const E=await p.evaluate(()=>{const L=store.get('combat',{list:[]}).list.filter(x=>/Gate Warden/.test(x.name)),R=bondRef(45);return {n:L.length,hp:L[0]&&L[0].hp,want:Math.round(R.hp*.75),atk:L[0]&&L[0].atk,pc:L.some(x=>x.pc||x.art)}});
ok(E.n===2&&E.hp===E.want&&/hit \d+/.test(E.atk)&&!E.pc,'two level 45 enemy Steel Defenders join the tracker on the monsters\' side '+JSON.stringify(E));
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
