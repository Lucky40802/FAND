// The Artificer's Forge: infusions in the Artificer's gear (counts by level, AC, attack rows, Repeating Shot), a construct
// built from materials in its pack (used up), on the sheet, in the combat tracker, back after a long rest, counted in the
// Party check; the character builder's Artificers come with both; phone width
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:1200,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+path.resolve(process.argv[2],'forge.html'));await p.waitForTimeout(3000);
const caps=await p.evaluate(()=>[1,2,6,10,14,18,40,100].map(infCap));ok(JSON.stringify(caps)==='[0,2,3,4,5,6,7,10]','infusions by level: '+caps);
const d=await p.evaluate(()=>[infDmg(5).txt,infDmg(15).txt,infDmg(95).txt]);ok(JSON.stringify(d)==='["+1","4d4","80d4"]','weapon infusion damage: '+d);
const none=await p.evaluate(()=>{PARTY.length=0;saveParty();renderForge();return document.getElementById('art-forge').textContent});ok(/No Artificer in the party yet/.test(none),'with no Artificer the section says how to get one');
await p.evaluate(()=>{const g=MATS.filter(m=>m.realm==='Hell'&&!m.gen),pick=cs=>g.find(m=>cs.includes(matCode(m))).n;
  PARTY.push({id:'a1',name:'Tink',level:25,cls:'Artificer',sub:'Battle Smith',abil:{int:18,dex:14,con:14},gear:['Longsword','Chain Mail','Light Crossbow'],inv:[[pick(['O']),2],[pick(['G','E','K']),1]]});saveParty();renderForge()});
const ac0=await p.evaluate(()=>charStats(PARTY[0]).ac);
await p.selectOption('#art-forge select[aria-label="Add an infusion"]','Enhanced Weapon');await p.selectOption('#art-forge select[aria-label="Item to infuse"]','Longsword');
await p.selectOption('#art-forge select[aria-label="Add an infusion"]','Enhanced Defense');let S=await p.$$('#art-forge select[aria-label="Item to infuse"]');await S[1].selectOption('Chain Mail');
await p.selectOption('#art-forge select[aria-label="Add an infusion"]','Repeating Shot');S=await p.$$('#art-forge select[aria-label="Item to infuse"]');
const fits=await S[2].evaluate(s=>[...s.options].map(o=>o.value).filter(Boolean));ok(JSON.stringify(fits)==='["Light Crossbow"]','Repeating Shot offers only the crossbow: '+fits);await S[2].selectOption('Light Crossbow');
const I=await p.evaluate(()=>({inf:PARTY[0].infuse.map(x=>x.n+'>'+x.item),ac:charStats(PARTY[0]).ac,on:infOn(PARTY[0]).length}));
ok(I.on===3&&I.ac===ac0+2,'three infusions active; Enhanced Defense adds +2 AC at level 25 ('+ac0+' → '+I.ac+')');
for(const i of [1,2,3]){const L=await p.$$('#art-forge .panel label select');await L[i].selectOption({index:1})}
await p.click('#art-forge button.primary');await p.waitForTimeout(300);
const K=await p.evaluate(()=>{const c=PARTY[0],N=artNow(c);return {kind:c.construct&&c.construct.kind,inv:c.inv.length,N:N&&{hp:N.hp,dmg:N.dmg,q:N.q},ref:bondRef(25)}});
ok(K.kind==='Steel Defender'&&K.inv===0,'a Battle Smith builds a Steel Defender and the three materials are used up');
ok(K.N&&K.N.q===1&&K.N.hp===Math.round(K.ref.hp*.75)&&K.N.dmg===K.ref.h,'Hell parts count fully at level 25: 75% of the typical monster\'s HP and its hit ('+JSON.stringify(K.N)+')');
// sheet
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
const sh=await p.evaluate(()=>{SHEET_ID='a1';renderSheet();const T=document.getElementById('content').textContent;return {t:T,shoot:!!document.querySelector('.sh-shoot')}});
ok(/Artificer's Forge/.test(sh.t)&&/Steel Defender/.test(sh.t)&&/Infused \(3\/6\)/.test(sh.t),'the sheet has the Artificer\'s Forge box with infusions and the construct');
ok(/Enhanced Weapon: \+2 Accuracy \(included\), damage \+12d4/.test(sh.t),'the infused longsword shows its bonus');ok(/no ammo needed/.test(sh.t)&&!sh.shoot,'the Repeating Shot crossbow needs no ammunition');
// party check and combat
const cr=await p.evaluate(()=>{const c=PARTY[0],r=charRound(c,'Hell',10);c.construct.dead=true;const r2=charRound(c,'Hell',10);delete c.construct.dead;return [r.v,r2.v,r.how]});ok(cr[0]>cr[1]&&/Steel Defender/.test(cr[2]),'the construct adds to the Party check, not while fallen: '+cr[2]);
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(2000);
const cb=await p.evaluate(()=>{CB.list=[];cbAddParty();const x=CB.list.find(y=>y.art);if(!x)return null;x.hp=0;saveCB();const dead=PARTY[0].construct.dead;charRest(PARTY[0],'long');return {n:x.name,dead,back:!PARTY[0].construct.dead&&PARTY[0].construct.hp==null}});
ok(cb&&/Steel Defender \(Tink's\)/.test(cb.n)&&cb.dead&&cb.back,'the construct joins the tracker, falls at 0 HP and is back after a long rest '+JSON.stringify(cb));
// generator
const g=await p.evaluate(()=>{const c=genFill({cls:'Artificer',level:55}).c,N=artNow(c);return {inf:infOn(c).length,cap:infCap(55),N:N&&N.q,ammo:(c.infuse||[]).some(x=>{const b=findBP(x.item);return b&&b.ammo})}});
ok(g.inf>=2&&g.N===1&&!g.ammo,'a generated level 55 Artificer has infusions (none on ammunition) and a construct of its realm\'s materials '+JSON.stringify(g));
// phone
const ph=await b.newContext({serviceWorkers:'block',viewport:{width:375,height:800}});const q=await ph.newPage();q.on('pageerror',e=>errs.push(e.message));
await q.goto('file://'+path.resolve(process.argv[2],'forge.html'));await q.waitForTimeout(3000);
const w=await q.evaluate(()=>{PARTY.length=0;PARTY.push({id:'a2',name:'Pip',level:12,cls:'Artificer',gear:['Dagger','Leather Armor'],infuse:[{n:'Enhanced Weapon',item:'Dagger'}]});saveParty();renderForge();const s=document.getElementById('art-forge');s.scrollIntoView();return {sw:document.documentElement.scrollWidth,W:innerWidth,r:Math.round(s.getBoundingClientRect().right)}});
ok(w.sw<=w.W&&w.r<=w.W,'the section fits a phone '+JSON.stringify(w));await (await q.$('#art-forge')).screenshot({path:path.join(process.env.S||'.','artforge-phone.png')});
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
