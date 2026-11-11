const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{const s=SUBS.find(x=>x.n===NECRO_SUB);const lv=(s.lv||[]).map(x=>x[0]+' '+x[1]);
  const W={id:'n1',name:'Mort',cls:'Wizard',sub:NECRO_SUB,level:12,abil:{str:8,dex:12,con:12,int:18,wis:10,cha:10},hpMax:70,hp:70,undead:[{n:'Skeleton (Goblin)',type:'Skeleton',from:'Goblin',realm:'Human',p:80,hp:5,ac:1,ab:[8,10,8,6,6,4],up:'none'}]};
  const P={id:'p1',name:'Plain',cls:'Wizard',sub:'School of Evocation (Wizard)',level:12,undead:[]};
  const m=MONSTERS.find(x=>x.sb&&corpseLv(x)===12);
  const sn=servantNow(W,W.undead[0]),sp=servantNow(P,W.undead[0]);
  PARTY=[W];SHEET_ID='n1';saveParty();let t='';for(const tb of ['fand','core','details']){SHEET_TAB=tb;renderSheet();await new Promise(r=>setTimeout(r,150));const x=document.getElementById('content').innerText;if(/Undead servants/i.test(x)){t=x;break}}
  return {lv,rcW:raiseChance(W,m),rcP:raiseChance(P,m),ref:monRef(12),sn,sp,nl:necroLv(W),nlp:necroLv(P),ess:/essence \(Bone Tithe\)/i.test(t),th:/Undead Thralls: at least 80%/.test(t),hp:t.includes('HP '+sn.hp)}});
console.log(JSON.stringify(r));
ok(r.lv[0].startsWith('3 ')&&r.lv.some(x=>/Death's Ledger/.test(x))&&r.lv.some(x=>/6 Bone Tithe/.test(x))&&r.lv.some(x=>/10 Horde Discipline/.test(x))&&r.lv.some(x=>/14 Grave Surge/.test(x)),'subclass features at 3/6/10/14');
ok(r.nl===12&&r.nlp===0,'necromancer level only for the subclass');
ok(r.rcW.p===1&&Math.abs(r.rcP.p-0.2)<1e-9,'same-level corpse: always rises for the necromancer, 20% for others');
ok(r.sn.hp>=Math.floor(r.ref.hp*.8)&&r.sn.ac>=Math.floor(r.ref.ac*.8)+4&&r.sn.dmg===4&&r.sp.hp===5,'Undead Thralls lifts a goblin skeleton to level-12 strength');
ok(r.ess&&r.th&&r.hp,'sheet shows essence and the thrall stats');
// essence buttons
await p.evaluate(()=>{sheetEssence(1);sheetEssence(1);sheetEssence(1);sheetUndeadDead(0)});
ok(await p.evaluate(()=>PARTY[0].undead[0].dead===true),'mark destroyed');
await p.evaluate(()=>sheetUndeadRaise(0));ok(await p.evaluate(()=>!PARTY[0].undead[0].dead&&PARTY[0].essence===0),'re-raise spends 3 essence');
// raise panel: retry and render
await p.goto('file://'+path.resolve(process.argv[2],'tools.html'));await p.waitForTimeout(1500);
const rp=await p.evaluate(()=>{const W=PARTY[0];W.level=3;saveParty();const k='tool';const C=SCAV[k];const m=MONSTERS.find(x=>x.sb&&corpseLv(x)===5&&x.drops&&x.drops.length);
  let S=scavNew(m,'Slashing');S.rz={who:W.id,open:true};C.set(S);C.render();const html1=document.getElementById('content').innerHTML;
  const orig=Math.random;Math.random=()=>0.99;const i=UNDEAD.findIndex(u=>u.ok(m,C.get(),C.get().rz));raiseRoll(k,i);const h2=document.getElementById('content').innerHTML;Math.random=orig;
  return {k,i,mon:m.n,scav:!!S,retryBtn:/Try again \(spend a spell slot\)/.test(h2),failed:/does not rise/.test(h2)}});
console.log(JSON.stringify(rp));
ok(rp.failed&&rp.retryBtn,'a failed raise offers the spell-slot retry');
ok(!errs.length,'no errors '+errs.join(';'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
