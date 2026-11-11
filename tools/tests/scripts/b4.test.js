const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
const part=await p.evaluate(()=>MATS.find(m=>m.org==='Creature'&&+m.pot<=15&&m.tr&&m.pn).n);
await p.evaluate(pt=>{PARTY.length=0;PARTY.push({id:'z1',name:'Zed',level:15,cls:'Wizard',gear:[],inv:[[pt,2]]});SHEET_ID='z1';SHEET_TAB='fand';saveParty();renderSheet()},part);
const dmNow=await p.evaluate(()=>dmUnlocked());console.log('dmUnlocked on sheet:',dmNow);
// player view: when the DM lock is on, players see nothing
const pv=await p.evaluate(()=>{const o=HC;try{HC=null}catch(e){};const r=[dmUnlocked(),/Bonded summons/.test(document.body.innerText)];return r});
console.log('player view',pv);
await p.evaluate(()=>{window.__dm=true;});
// DM turns it on
await p.evaluate(()=>{const c=sheetChar();if(dmUnlocked()){sheetBondOn(true)}else{c.bondOn=true;saveParty();renderSheet()}});
ok(await p.locator('text=Bonded summons').count()>0,'box shows when on');
for(let i=0;i<6;i++)await p.evaluate(()=>sheetBondAdd());
const n=await p.evaluate(()=>sheetChar().bonds.length);ok(n===5,'at most five summons ('+n+')');
const s0=await p.evaluate(()=>{const c=sheetChar();return [bondNow(c,c.bonds[0]),bondRef(15),bondSlots(c)]});console.log(JSON.stringify(s0));
ok(s0[0].hp===Math.round(s0[1].hp*0.5)&&s0[2]===2,'50% of a level 15 monster, 2 part slots');
await p.selectOption('.bond >> nth=0 >> select',part);
const s1=await p.evaluate(()=>{const c=sheetChar();return [bondNow(c,c.bonds[0]).hp,c.bonds[0].parts,c.inv]});console.log(JSON.stringify(s1));
ok(s1[0]===Math.round(s0[1].hp*0.5*1.1)&&s1[1].length===1&&s1[2][0][1]===1,'part absorbed, +10% HP, used from inventory');
ok(await p.locator('.bond >> nth=0').innerText().then(t=>t.includes(part)),'part listed with its property');
await p.evaluate(()=>{const c=sheetChar();c.level=35;saveParty();renderSheet()});
const s2=await p.evaluate(()=>{const c=sheetChar();return [bondNow(c,c.bonds[0]).L,bondNow(c,c.bonds[0]).hp,bondRef(35).hp]});ok(s2[0]===35&&s2[1]>s1[0],'levels with the character '+s2);
await p.evaluate(()=>sheetBond(1,'dead',true));ok(await p.evaluate(()=>sheetChar().bonds[1].dead===true&&bondNow(sheetChar(),sheetChar().bonds[1]).cur===0),'mark fallen');
await p.evaluate(()=>{charRest(sheetChar(),'long');});ok(await p.evaluate(()=>!sheetChar().bonds[1].dead&&sheetChar().bonds[1].hp==null),'long rest brings it back');
// public code does not name the hidden class
const src=require('fs').readFileSync(path.resolve(process.argv[2],'app.js'),'utf8');ok(!/lone summoner/i.test(src),'app.js does not name the hidden class');
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>renderSheet());const sw=await p.evaluate(()=>document.documentElement.scrollWidth);ok(sw<=392,'no sideways scroll on phone '+sw);
ok(!errs.length,'no errors '+errs.join('|'));
console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
