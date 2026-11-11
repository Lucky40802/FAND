const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{for(let i=0;i<40&&!SP.length;i++)await new Promise(r=>setTimeout(r,100));
  const wand=BPS.find(b=>!b.design&&genOf(b)==='Wand'&&b.lv>=8)||BPS.find(b=>BASES[genOf(b)]&&BASES[genOf(b)].focus);
  const c={id:'w1',name:'Vex',cls:'Wizard',level:15,abil:{str:8,dex:14,con:12,int:18,wis:10,cha:10},spells:{0:['Fire Bolt']},gear:[],hpMax:60,hp:60};
  const noF=focusOf(c);c.gear=[wand.n];const F=focusOf(c);
  PARTY=[c];SHEET_ID='w1';SHEET_TAB='spells';saveParty();renderSheet();await new Promise(r=>setTimeout(r,300));
  const t=document.getElementById('content').innerText;
  const fb=SP.find(x=>x.n==='Fire Bolt');
  return {wand:wand.n,lv:wand.lv,il:wand.il,F,noF,pow:spellPow(c,'Human'),pow5:spellPow({level:5},'Human'),powHell:spellPow({level:5},'Hell'),dice:focusDice(spellAt(spellDmg(fb),spellPow(c,'Human')),F),hasFocusLine:/Focus/.test(t)&&t.includes(wand.n),txt:(t.match(/Spell save DC\s*\n?\s*(\d+)/)||[])[1]}});
console.log(JSON.stringify(r));
ok(r.pow===2&&r.pow5===1&&r.powHell===6,'spell power: level band or realm, whichever is higher');
ok(r.noF.acc===0&&r.noF.dmg===0,'no focus: no bonus');ok(r.F.dmg>0&&r.F.n===r.wand,'a ready-made wand gives spell damage');
ok(/^2d10 \+ \d+/.test(r.dice),'Fire Bolt at level 15 with the wand: '+r.dice);ok(r.hasFocusLine,'sheet shows the focus');
// forged focus
const ff=await p.evaluate(()=>{const B=BASES.Orb,parts={};B.slots.forEach(s=>{const m=MATS.find(m=>slotFit(s,m).lv==='good'&&(m.il||1)>=15);if(m)parts[s.id]=m.n});const r=forgeResult('Orb',parts,{form:true});return {acc:r.focusBonus,dmg:r.focusDmg}});
ok(ff.dmg>0&&ff.acc>0,'a forged orb gives Accuracy and damage '+JSON.stringify(ff));
// shop imports
await p.goto('file://'+path.resolve(process.argv[2],'shop.html'));await p.waitForTimeout(1200);
const sh=await p.evaluate(()=>{const a=rollShop('Human','alch',4,1234,1),b=rollShop('Human','alch',4,1234,3),c0=rollShop('Human','alch',4,1234,1);
  return {n1:a.imports.length,r1:[...new Set(a.imports.map(x=>x.m.realm))],r3:[...new Set(b.imports.map(x=>x.m.realm))],same:JSON.stringify(a.mats.map(x=>x.m.n))===JSON.stringify(c0.mats.map(x=>x.m.n)),mk:a.imports.every(x=>x.price>=x.m.price*2.2),small:rollShop('Human','alch',1,5,1).imports.length}});
console.log(JSON.stringify(sh));
ok(sh.n1===4&&sh.r1.every(r=>r==='Mysterious'),'stage I buyer in the Human Realm: imports only from the Mysterious');
ok(sh.r3.every(r=>REALMS_OK(r)),'stage III buyer: imports from opened realms');
ok(sh.mk&&sh.same&&sh.small===1,'import markup, stable stock, small market has one');
await p.evaluate(()=>{HC=HC||[];store.set('shop',Object.assign(shopState(),{realm:'Human',kind:'alch',size:4}));renderShop()});await p.waitForTimeout(300);
ok(await p.locator('text=Import from the Mysterious Realm').count()>0,'Shop table shows imports');
ok(!errs.length,'no errors '+errs.join(';'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
function REALMS_OK(r){return ['Mysterious','Hell','Heaven','Chaos','Abyss','Inner Realm','Inner'].includes(r)}
