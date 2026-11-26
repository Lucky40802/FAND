// The Artificer's Forge: known and active infusions (in the Artificer's or a party member's gear), the long-rest lock and
// charges, the construct (realm, grade, frame, upgrades, property and trait), Artillerist cannon modes and two cannons,
// Arcane Armor, Experimental Elixirs, Extra Attack, enemy Artificers' cannons, the character builder, phone width
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:1200,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+path.resolve(process.argv[2],'forge.html'));await p.waitForTimeout(3000);
const caps=await p.evaluate(()=>[[1,2,6,10,14,18,40,100].map(infCap),[2,6,18,40].map(infKnownCap),[5,15,95].map(L=>infDmg(L).txt)]);
ok(JSON.stringify(caps)==='[[0,2,3,4,5,6,7,10],[4,6,12,14],["+1","4d4","80d4"]]','active and known infusions by level, weapon damage: '+JSON.stringify(caps));
const none=await p.evaluate(()=>{PARTY.length=0;saveParty();renderForge();return document.getElementById('art-forge').textContent});ok(/No Artificer in the party yet/.test(none),'with no Artificer the section says how to get one');
await p.evaluate(()=>{const g=MATS.filter(m=>m.realm==='Hell'&&!m.gen),pick=cs=>g.filter(m=>cs.includes(matCode(m))).sort((a,b)=>(b.g||0)-(a.g||0))[0].n,org=MATS.find(m=>m.realm==='Hell'&&!m.gen&&['L','E'].includes(matCode(m))).n;
  window.T_MAT={metal:pick(['O']),core:pick(['G','E','K']),org};
  PARTY.push({id:'a1',name:'Tink',level:25,cls:'Artificer',sub:'Battle Smith',abil:{int:18,dex:14,con:14},gear:['Longsword','Chain Mail','Light Crossbow'],inv:[[T_MAT.metal,3],[T_MAT.core,1],[org,2]]},
    {id:'f1',name:'Bo',level:25,cls:'Fighter',abil:{str:18,con:14},gear:['Greatsword','Chain Mail']});saveParty();ARTF={};renderForge()});
// known infusions
for(const n of ['Enhanced Weapon','Enhanced Defense','Radiant Weapon','Repeating Shot']){await p.click(`#art-forge label:has-text("${n}") input`)}
const kn=await p.evaluate(()=>infKnown(PARTY[0]));ok(kn.length===4,'four infusions known: '+kn);
const add=async n=>{await p.selectOption('#art-forge select[aria-label="Add an infusion"]',n)},item=async(i,label)=>{const S=await p.$$('#art-forge select[aria-label="Item to infuse"]');const v=await S[i].evaluate((s,l)=>[...s.options].find(o=>o.textContent===l).value,label);await S[i].selectOption(v)};
const acBo0=await p.evaluate(()=>charStats(PARTY[1]).ac);
await add('Enhanced Weapon');await item(0,'Greatsword · Bo');await add('Enhanced Defense');await item(1,'Chain Mail · Bo');await add('Radiant Weapon');await item(2,'Longsword');await add('Repeating Shot');await item(3,'Light Crossbow');
const I=await p.evaluate(()=>({on:infOn(PARTY[0]).length,ac:charStats(PARTY[1]).ac,acc:infAcc(PARTY[1],findBP('Greatsword')),own:infAcc(PARTY[0],findBP('Longsword'))}));
ok(I.on===4&&I.ac===acBo0+2&&I.acc===2&&I.own===2,'infusions in Bo\'s greatsword and armor (+2 Accuracy, +2 AC) and in Tink\'s own gear '+JSON.stringify(I));
const fits=await p.evaluate(()=>{const S=[...document.querySelectorAll('#art-forge select[aria-label="Item to infuse"]')][3];return [...S.options].map(o=>o.textContent).filter(t=>!/Choose/.test(t))});ok(JSON.stringify(fits)==='["Light Crossbow"]','Repeating Shot fits only the crossbow: '+fits);
await p.click('#art-forge button:has-text("Done: lock the infusions")');const lk=await p.evaluate(()=>!!PARTY[0].infLocked);ok(lk,'the Artificer locks its infusions');
// construct
await p.selectOption('#art-forge select[aria-label="Frame"]',await p.evaluate(()=>T_MAT.metal));await p.selectOption('#art-forge select[aria-label="Core"]',await p.evaluate(()=>T_MAT.core));await p.selectOption('#art-forge select[aria-label="Armament"]',await p.evaluate(()=>T_MAT.metal));
await p.click('#art-forge button.primary');await p.waitForTimeout(200);
const K=await p.evaluate(()=>{const c=PARTY[0],N=artNow(c),R=bondRef(25),gb=N.parts.reduce((a,m)=>a+((+m.g||5)-5)*.02,0)/3;return {kind:N.kind,q:N.q,f:N.f,want:1+gb,ac:N.ac,refac:R.ac,metal:(c.inv.find(x=>x[0]===T_MAT.metal)||[0,0])[1],hp:N.hp,slots:artUpSlots(25)}});
ok(K.kind==='Steel Defender'&&K.q===1&&Math.abs(K.f-K.want)<1e-9,'a Battle Smith builds a Steel Defender; Hell parts count fully and grades move it '+K.f.toFixed(3));
ok(K.ac===K.refac+3&&K.metal===1,'a metal frame adds +1 AC (AC '+K.ac+'), and the frame and armament are used up');
await p.selectOption('#art-forge select[aria-label="Add an upgrade"]',await p.evaluate(()=>T_MAT.metal));
const U=await p.evaluate(()=>{const N=artNow(PARTY[0]);return {ups:N.ups.length,hp:N.hp,lines:new RegExp(T_MAT.metal.replace(/[^\w ]/g,'.')+'( ×\\d)? \\(Hell, grade').test(document.getElementById('art-forge').textContent)}});ok(U.ups===1&&U.hp===Math.round(K.hp/1*1.1)||Math.abs(U.hp-K.hp*1.1)<=1,'an upgrade adds 10% hit points ('+K.hp+' → '+U.hp+'), '+K.slots+' slots at level 25');ok(U.lines,'parts and upgrades list their properties and traits');
// sheet: charges, construct, ally lines
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
const sh=await p.evaluate(()=>{SHEET_ID='a1';renderSheet();const T=document.getElementById('content').textContent;SHEET_ID='f1';renderSheet();const B=document.getElementById('content').textContent;return {T,B}});
ok(/Radiant Weapon charges: ●●●●/.test(sh.T)&&/Steel Defender/.test(sh.T)&&/no ammo needed/.test(sh.T),'Tink\'s sheet: charges, the construct, Repeating Shot needs no ammunition');
ok(/Enhanced Weapon \(by Tink\): \+2 Accuracy \(included\), damage \+12d4/.test(sh.B),'Bo\'s sheet shows the infusion Tink put in his greatsword');
const rest=await p.evaluate(()=>{const c=PARTY[0];artCharge('a1','Radiant Weapon|Longsword',4,1);const used=c.infCh['Radiant Weapon|Longsword'];c.construct.dead=true;charRest(c,'long');return {used,after:c.infCh,open:!c.infLocked,dead:c.construct.dead}});
ok(rest.used===1&&!rest.after&&rest.open&&!rest.dead,'a long rest brings back charges and the construct, and opens the infusions '+JSON.stringify(rest));
// subclasses
const S=await p.evaluate(()=>{const R=bondRef(15),T_MAT={org:MATS.find(m=>m.realm==='Hell'&&!m.gen&&['L','E'].includes(matCode(m))).n};const art={id:'r1',name:'Boom',level:15,cls:'Artificer',sub:'Artillerist',abil:{int:18},gear:['Dagger'],construct:{kind:'Eldritch Cannon',n:'Boomer',parts:{},ups:[]}};PARTY.push(art);
  const N=artNow(art),v1=artRound(art,0,2).v;art.construct.mode='Protector';const v2=artRound(art,0,2).v;art.construct.mode='Force Ballista';
  const arm={id:'m1',name:'Plate',level:15,cls:'Artificer',sub:'Armorer',abil:{int:18,str:14},gear:['Chain Mail'],arcArmor:{item:'Chain Mail',model:'Guardian'}};const X=arcNow(arm),r=charRound(arm,'Mysterious',0);
  const alc={id:'c1',name:'Vial',level:9,cls:'Artificer',sub:'Alchemist',abil:{int:16},gear:[],inv:[[T_MAT.org,1]]};PARTY.push(alc);charRest(alc,'long');const free=alc.elixirs.length;ARTF.who='c1';ARTF.elixMat=T_MAT.org;ARTF.elixT='Healing';artElix('brew');
  return {count:N.count,mode:N.mode,v1,v2,X:X&&X.dice,how:r.how,atk:atksPer(arm),free,el:alc.elixirs.length,inv:alc.inv.length,heal:elixHeal(alc)}});
ok(S.count===2&&S.mode==='Flamethrower'&&S.v1>0&&S.v2===0,'a level 15 Artillerist keeps two cannons; Protector mode heals instead of hitting '+JSON.stringify([S.count,S.mode,S.v1,S.v2]));
ok(S.X==='4d8'&&/Thunder|2 ×/.test(S.how)&&S.atk===2,'an Armorer\'s Guardian gauntlets roll 2d8 × 2 at level 15 and it attacks twice: '+S.X+' · '+S.how);
ok(S.free===2&&S.el===3&&S.inv===0&&/^2d4 \+ 3$/.test(S.heal),'a level 9 Alchemist gets 2 free elixirs and brews a third from an organ ('+JSON.stringify([S.free,S.el,S.inv,S.heal])+')');
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(2000);
const cb=await p.evaluate(()=>{CB.list=[];cbAddParty();return CB.list.filter(x=>x.art).map(x=>x.name)});ok(cb.filter(n=>/Boomer/.test(n)).length===2&&cb.some(n=>/Steel Defender/.test(n)),'both cannons and the defender join the tracker: '+cb);
// enemies and the character builder
const E=await p.evaluate(()=>{const m=MONSTERS.find(x=>x.sb&&x.realm==='Hell'&&+x.sb.hp>50),ch=champion(m,'Artificer',{fresh:true}),f=ch.sb.tr.find(t=>t[0]==='Eldritch Cannon');const npc=sbMake({kind:'npc',cls:'Artificer',level:30,realm:'Hell',seed:4}).m.sb,g=npc.tr.find(t=>t[0]==='Eldritch Cannon');
  const c=genFill({cls:'Artificer',level:55}).c;return {f:f&&f[1].slice(0,60),g:!!g,gen:{known:infKnown(c).length,on:infOn(c).length,con:!!c.construct}}});
ok(E.f&&E.g,'enemy Artificers (a champion and an NPC) field an Eldritch Cannon: '+E.f);ok(E.gen.known>=E.gen.on&&E.gen.on>=2&&E.gen.con,'a generated Artificer knows its infusions and has a construct '+JSON.stringify(E.gen));
// phone
const ph=await b.newContext({serviceWorkers:'block',viewport:{width:375,height:800}});const q=await ph.newPage();q.on('pageerror',e=>errs.push(e.message));
await q.goto('file://'+path.resolve(process.argv[2],'forge.html'));await q.waitForTimeout(3000);
const w=await q.evaluate(()=>{PARTY.length=0;PARTY.push({id:'a2',name:'Pip',level:22,cls:'Artificer',sub:'Armorer',gear:['Dagger','Chain Mail'],infKnown:['Enhanced Weapon'],infuse:[{n:'Enhanced Weapon',item:'Dagger'}],arcArmor:{item:'Chain Mail',model:'Infiltrator'},construct:{kind:'Eldritch Cannon',parts:{},ups:[]}});saveParty();ARTF={};renderForge();const s=document.getElementById('art-forge');s.scrollIntoView();return {sw:document.documentElement.scrollWidth,W:innerWidth,r:Math.round(s.getBoundingClientRect().right)}});
ok(w.sw<=w.W&&w.r<=w.W,'the section fits a phone '+JSON.stringify(w));await (await q.$('#art-forge')).screenshot({path:path.join(process.env.S||'.','artforge-phone.png')});
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
