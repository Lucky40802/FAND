// Casting in armor: penalties by class training, shown on the sheet, counted in the Party check, explained in the rules
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(1000);
const r=await p.evaluate(()=>{const ch=(cls,gear,x)=>Object.assign({id:cls+gear.join(),name:cls,level:5,cls,abil:{int:16,wis:16,cha:16,con:12},gear,inv:[]},x||{});
  const T=[['wizard robes',ch('Wizard',[])],['wizard leather',ch('Wizard',['Leather Armor'])],['wizard plate',ch('Wizard',['Plate Armor'])],['wizard shield',ch('Wizard',['Shield'])],
    ['cleric chain',ch('Cleric',['Chain Mail','Shield'])],['cleric breastplate',ch('Cleric',['Breastplate','Shield'])],['war cleric chain',ch('Cleric',['Chain Mail','Shield'],{sub:'War Domain'})],['valor bard chain shirt',ch('Bard',['Chain Shirt','Shield'],{sub:'College of Valor'})],['bard chain shirt',ch('Bard',['Chain Shirt'])],['fighter plate',ch('Fighter',['Plate Armor'])],
    ['wizard/fighter multiclass plate',ch('Wizard',['Plate Armor'],{cls2:'Fighter',lv2:2})]];
  return T.map(([k,c])=>{const s=charStats(c),A=s.castArm;return [k,A?A.steps:0,A?A.acc:0,A?A.fail:0,(s.worn||[]).map(b=>armorPiece(b).weight).join('/')]})});
r.forEach(x=>console.log('   ',JSON.stringify(x)));const g=k=>r.find(x=>x[0]===k);
ok(g('wizard robes')[1]===0,'wizard in robes: no penalty');
ok(g('wizard leather')[1]===1&&g('wizard leather')[2]===-2&&g('wizard leather')[3]===3,'wizard in leather: 1 step, -2, fails on 3');
ok(g('wizard plate')[1]===3&&g('wizard plate')[3]===9,'wizard in plate: 3 steps, fails on 9');
ok(g('wizard shield')[1]===1,'wizard with a shield: 1 step');
ok(g('cleric chain')[1]===1,'cleric in heavy chain mail: 1 step (trained for medium)');
ok(g('cleric breastplate')[1]===1,'cleric in an iron breastplate: metal is heavy, 1 step');ok(g('war cleric chain')[1]===0,'War Domain cleric: trained for heavy');ok(g('valor bard chain shirt')[1]===1,'Valor bard in iron: medium training, metal is heavy: 1 step');
ok(g('fighter plate')[1]===0,'fighters aren\'t casters: no penalty');
ok(g('wizard/fighter multiclass plate')[1]===0,'a fighter multiclass is trained');
// the sheet shows it and the numbers include it
const t=await p.evaluate(()=>{PARTY.length=0;PARTY.push({id:'w',name:'Wren',level:5,cls:'Wizard',abil:{int:16,con:12},gear:['Plate Armor'],inv:[],spells:{0:['Fire Bolt'],1:['Magic Missile']}});SHEET_ID='w';SHEET_TAB='spells';saveParty();renderSheet();return document.body.innerText});
ok(/Casting in armor/i.test(t)&&/fails on a d20 roll of 9 or lower/i.test(t),'sheet warning');
const n=await p.evaluate(()=>{const c=PARTY[0],dc=[...document.querySelectorAll('.sh-big')].map(e=>e.textContent);c.gear=[];saveParty();renderSheet();const dc2=[...document.querySelectorAll('.sh-big')].map(e=>e.textContent);return [dc,dc2]});
console.log('   numbers in plate / without:',JSON.stringify(n[0].slice(-2)),JSON.stringify(n[1].slice(-2)));
ok(+n[1][n[1].length-2]-+n[0][n[0].length-2]===6&&n[1][n[1].length-1]==='+6'&&n[0][n[0].length-1]==='+0','DC and Accuracy include the -6');
const pc=await p.evaluate(()=>{const c={id:'w2',name:'W',level:5,cls:'Wizard',abil:{int:18,con:12},gear:['Plate Armor'],inv:[],spells:{3:['Fireball']},hpMax:30};const a=charRound(c,'Human',4);c.gear=[];const b=charRound(c,'Human',4);return [a,b]});
ok(pc[0].v<pc[1].v&&/in armor/.test(pc[0].how),'Party check counts the failure chance: '+Math.round(pc[0].v)+' vs '+Math.round(pc[1].v));
// the generator fits casters' armor to their training
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(1800);
const gen=await p.evaluate(()=>['Cleric','Ranger','Artificer','Wizard','Bard'].flatMap(k=>[1,8,25].map(L=>{const c=genFill({cls:k,level:L}).c,s=charStats(c);return [k+L,!!s.castArm,s.ac]})));
ok(gen.every(x=>!x[1]),'generated casters cast freely');ok(gen.filter(x=>/Ranger|Cleric/.test(x[0])).every(x=>x[2]>0),'and still wear armor: '+gen.map(x=>x[0]+':'+x[2]).join(' '));
// rules
await p.goto('file://'+path.resolve(process.argv[2],'rules.html'));await p.waitForTimeout(1200);const rt=await p.evaluate(()=>document.body.innerText);ok(/Casting in armor/.test(rt)&&/Wizard no armor/.test(rt),'rules text');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
