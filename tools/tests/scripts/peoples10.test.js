// The birdfolk and humblefolk peoples: in the builder's family menu, the generator, the sheet, and their profiles
const {chromium}=require('../pw.js');const path=require('path');
const NEW=['Corvum','Gallus','Luma','Raptor','Strig','Cervan','Hedge','Jerbeen','Mapach','Vulpin'];
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(2000);
const r=await p.evaluate(N=>({have:N.filter(n=>CW_RACE.some(x=>x[0]===n)),fam:N.map(famOf),top:peopleTop().filter(f=>f==='Birdfolk'||f==='Humblefolk'),
  prof:N.filter(n=>{const P=typeof PEOPLE_INFO!=='undefined'?PEOPLE_INFO[n]:null;return !P||P.prof}).length,
  gen:N.map(n=>{const g=genFill({race:n,level:7}).c;return g.race===n&&+g.hpMax>0})}),NEW);
ok(r.have.length===10,'all ten in the people list ('+r.have.length+')');
ok(r.fam.slice(0,5).every(f=>f==='Birdfolk')&&r.fam.slice(5).every(f=>f==='Humblefolk'),'families: '+[...new Set(r.fam)]);
ok(r.top.length===2,'Birdfolk and Humblefolk each once in the people menu');
ok(r.gen.every(Boolean),'the generator builds each one');
const fam=await p.evaluate(()=>{const c=genFill({fam:'Birdfolk',level:3}).c;return c.race});ok(['Corvum','Gallus','Luma','Raptor','Strig'].includes(fam),'generator family pick: '+fam);
// sheet with each people renders its traits
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
for(const n of ['Strig','Hedge','Mapach']){const t=await p.evaluate(n=>{PARTY.length=0;PARTY.push({id:'x',name:'T',level:5,cls:'Rogue',race:n,gear:[],inv:[]});SHEET_ID='x';SHEET_TAB='fand';saveParty();renderSheet();return document.body.innerText},n);
  ok(new RegExp(n).test(t),n+' shows on the sheet')}
// aliases
const al=await p.evaluate(()=>['Dark Elf','Deep Dwarf','Shadow Elf'].map(n=>(CW_RACE.find(x=>x[0]===n)||[])[1]).join(' | '));ok(/drow/.test(al)&&/duergar/.test(al)&&/shadar-kai/.test(al),'other names shown: '+al);
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
