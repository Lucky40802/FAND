const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'blueprints.html'));await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const P=n=>(PROP_IDX.get(lc(n))||{}).t||'';
 const lowInv=MATS.find(m=>m.pn==='Invulnerable'&&m.pot<=10),lowDis=MATS.find(m=>m.pn==='Displacement');
 const siege=['The Reality Breaker','The Godkiller Siege Array','The Continent Crusher','Fortress Breaker'].map(n=>(BPS.find(b=>b.n===n)||{}).lv);
 const frag=BPS.find(b=>b.n==='Simple Fragment of the Original Relic'),fm=findMat('Fragment of the Original');
 const pw=gearPowers(frag).find(x=>x.k==='p');
 const plate=BPS.find(b=>b.n==='Plate Armor'),helm=BPS.find(b=>!b.design&&b.cat==='Armor'&&b.slot==='Head'&&b.lv<=3),gaunt=BPS.find(b=>!b.design&&b.cat==='Armor'&&b.slot==='Hands'&&b.lv<=3),paul=BPS.find(b=>!b.design&&b.cat==='Armor'&&b.slot==='Shoulders'&&b.lv<=3);
 const C=g=>charStats({id:'x',level:1,abil:{con:10},gear:g.map(x=>x.n)}).ac;
 return {inv:P('Invulnerable'),dis:P('Displacement'),reb:P('Rebirth'),tim:P('Timebound'),sharp:P('Piercing Edge'),temp:P('Tempered'),lowInv:lowInv&&lowInv.prop,lowDis:lowDis&&lowDis.prop,siege,
  cap:bpPotCap(frag),fragPot:fm&&fm.pot,pw:pw&&[pw.pot,pw.t.slice(0,80)],covers:plate.covers,ds:plate.ds.slice(-140),
  acPlate:C([plate]),acPlateHelm:C([plate,helm]),acPlateAll:C([plate,helm,gaunt,paul]),gauntAC:gaunt&&gaunt.ac,helmAC:helm&&helm.ac,paulAC:paul&&paul.ac}});
console.log(JSON.stringify(r,null,1));
ok(/one damage type/.test(r.inv)&&/Potency 6\+|Potency 30\+/.test(r.inv),'Invulnerable: one type first');
ok(/Once per short rest/.test(r.lowDis||'')&&/Potency 30\+/.test(r.lowDis||''),'Displacement: once per short rest, always on at 30+');
ok(/1 hit point/.test(r.reb),'Rebirth: 1 hit point first');ok(/At Potency 15\+/.test(r.tim),'Timebound: extra action needs Potency 15+');
ok(/At Potency 15\+ it crits/.test(r.sharp)&&/\+\{P\} damage/.test(r.temp),'Piercing Edge crit later, Tempered +P');
ok(r.siege.join()==='90,90,80,70','siege engines moved to 70–90');
ok(r.cap===14&&r.fragPot>40&&r.pw&&r.pw[0]===14,'a level-1 relic works at Potency 14');
ok(r.covers&&r.covers.length===4,'Plate covers four slots');
ok(r.acPlateAll===r.acPlateHelm&&r.acPlateHelm>r.acPlate,'pieces in covered slots add no AC; a helm still does ('+[r.acPlate,r.acPlateHelm,r.acPlateAll]+')');
// the blueprint window note
await p.evaluate(()=>{const b=BPS.find(x=>x.n==='Simple Fragment of the Original Relic');openItem(b)}).catch(()=>{});await p.waitForTimeout(400);
const note=await p.evaluate(()=>/Held back by its level/.test(document.body.innerText));
ok(note,'the Blueprint window explains the cap');
ok(!errs.length,'no errors '+errs.join(';'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
