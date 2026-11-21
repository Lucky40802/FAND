// Fight reports: End fight saves rounds, drops and damage beside the Party check's prediction; the table's pace
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept().catch(()=>{}));
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(2000);
await p.evaluate(()=>{PARTY.length=0;['Fighter','Wizard'].forEach(k=>{const c=genFill({cls:k,level:5}).c;c.name=k;PARTY.push(c)});saveParty();store.set('fights',[])});
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(1500);
const fight=async(rounds,dropWiz)=>p.evaluate(([rounds,dropWiz])=>{CB={round:1,turn:0,list:[]};saveCB();cbAddParty();const m=[...MON_IDX.values()].find(m=>m.sb&&m.realm==='Human'&&/^Orc$/i.test(m.n))||[...MON_IDX.values()].find(m=>m.sb&&m.realm==='Human'&&+m.sb.hp>20);
  CB.list.push(Object.assign(monCombatant(m,0),{}));CB.list.push(Object.assign(monCombatant(m,0),{}));saveCB();renderCombat();
  const w=CB.list.find(x=>x.pc&&x.name==='Wizard');if(dropWiz){$('dmg-'+w.id).value=999;cbHit(w.id)}
  CB.list.filter(x=>x.mon).forEach(x=>{x.hp=0});CB.round=rounds;saveCB();renderCombat();cbEndFight();return store.get('fights',[])[0]},[rounds,dropWiz]);
const f1=await fight(3,true);console.log('   ',JSON.stringify(f1));
ok(f1&&f1.rounds===3&&f1.won&&f1.dropped.length===1&&f1.dropped[0].n==='Wizard'&&f1.dmg>0&&f1.dmg<200,'report: rounds, won, the Wizard dropped, damage taken (HP lost, not overkill)');
ok(f1.pred&&f1.pred.clear>0&&f1.pred.label,'prediction saved: '+JSON.stringify(f1.pred));
ok(await p.evaluate(()=>CB.list.length===0),'tracker cleared');
await p.click('.cb-fights summary');ok(await p.locator('.cb-fights tbody tr').count()===1,'report listed');
ok(await p.locator('.cb-fights').innerText().then(t=>/After three fights/.test(t)),'pace explained before three fights');
await fight(4,false);await fight(5,false);await p.click('.cb-fights summary').catch(()=>{});
const pace=await p.evaluate(()=>fightPace());ok(pace>0,'pace after three fights: '+pace);
const txt=await p.locator('.cb-fights').innerText();ok(/run about/.test(txt)&&/Let the Party check use my table/.test(txt),'pace shown with the option');
const pr=await p.evaluate(()=>{const mons=[...MON_IDX.values()].filter(m=>m.sb&&m.realm==='Human').slice(0,2);store.set('fightPaceOn',false);const a=encAware({realm:'Human'},mons);store.set('fightPaceOn',true);const b=encAware({realm:'Human'},mons);return [a.clear,b.clear,fightPace()]});
ok(Math.abs(pr[1]-pr[0]*pr[2])<0.01,'Party check uses the pace when on: '+pr.map(x=>x.toFixed(2)));
await p.evaluate(()=>cbFightRm(store.get('fights',[])[0].id));ok(await p.evaluate(()=>store.get('fights',[]).length)===2,'delete a report');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
