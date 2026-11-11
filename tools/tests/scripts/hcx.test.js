const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
const FAKE=`(()=>{const T=['Epic','Unique','Legendary'],B=['Rogue','Wizard','Fighter','Cleric','Any'],R=REALMS.map(r=>r.n);const out=[];for(let i=0;i<300;i++){const t=T[i%3];out.push({n:(t==='Unique'?'Lone ':'')+['Venom','Ash','Star','Iron','Mist','Bone'][i%6]+' '+['Walker','Herald','Blade','Seer','Warden'][i%5]+' '+i,tier:t,base:B[i%5],sub:i%5===0?'Assassin':'',prog:t==='Legendary'?'Progenitor '+(i%4):'',rune:t==='Legendary'?'Fire':'',tower:R[i%R.length],blurb:'A test class number '+i+'. Deals 2d6 + 3 damage.',requires:'Level 10',unlock:'Clear the floor',features:[['1','First','Does 1d8 damage.'],['7','Second','Heals 2d4.'],['14','Third','Big 3d10 burst.']],evolves:'At level 20, it evolves.',secret:'Only on a full moon.'})}return out})()`;
(async()=>{await new Promise(r=>srv.listen(8781,r));const b=await chromium.launch();
 for(const vp of [{width:1300,height:900},{width:390,height:844}]){
 const p=await b.newPage({viewport:vp});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8781/hidden.html');await p.waitForSelector('#content .page');
 ok(await p.isVisible('#hc-form, #hc-pat, #hc-pin'),vp.width+': locked view shows an unlock form');
 await p.evaluate(()=>{store.set('role','player')});await p.evaluate(()=>renderHidden());await p.waitForTimeout(200);
 ok(await p.isVisible('text=Looking for a hidden class?'),'player view explains how hidden classes are earned');
 ok(await p.evaluate(()=>!navGroups().some(([g,ids])=>ids.includes('hidden'))),'player menu has no Hidden classes entry');
 await p.evaluate(f=>{store.set('role','dm');HC=hcRetower(eval(f));renderTabs();return renderHidden()},FAKE);await p.waitForTimeout(300);
 ok(await p.evaluate(()=>navGroups()[0][0]==='DM'&&navGroups()[0][1][0]==='hidden'),'DM menu starts with a DM group led by Hidden classes');
 const rows=await p.$$eval('.hcx-row',x=>x.length);ok(rows===300,'menu lists every class ('+rows+')');
 ok(await p.$$eval('.hcx-g>summary',x=>x.map(e=>e.textContent).join('|')).then(t=>/Unique/.test(t)&&/Epic/.test(t)&&/Legendary/.test(t)),'grouped by tier');
 if(vp.width>800)ok(await p.isVisible('#hcx-detail >> text=Choose a class from the menu'),'overview shown before a class is chosen');
 await p.fill('#hc-q','Venom Walker');await p.waitForTimeout(250);const n=await p.$$eval('.hcx-row',x=>x.length);ok(n>0&&n<300,'search narrows the menu ('+n+')');
 await p.click('.hcx-row >> nth=0');await p.waitForTimeout(150);
 ok(await p.isVisible('#hcx-detail h2'),'choosing a class opens its page');
 ok(await p.evaluate(()=>/#hc-/.test(location.hash)),'the class has its own link');
 ok(await p.isVisible('#hcx-detail .dice'),'dice in the class text can be rolled');
 if(vp.width<=800){ok(!(await p.isVisible('.hcx-menu')),'phone: the class page replaces the menu');await p.click('[data-hcx-back]');ok(await p.isVisible('.hcx-menu'),'phone: back returns to the menu');await p.click('.hcx-row >> nth=0')}
 await p.screenshot({path:(process.env.S||'.')+'/'+'hcx-'+vp.width+'.png'});
 await p.evaluate(()=>{hcSet({q:''});hcxPaint()});
 const before=await p.textContent('#hcx-detail h2');await p.click('[data-hcx-step="1"]');const after=await p.textContent('#hcx-detail h2');ok(before!==after,'next button steps to the next class');
 await p.evaluate(()=>{hcSet({group:'tower',sel:''});renderHidden()});await p.waitForTimeout(150);ok(await p.$$eval('.hcx-g>summary',x=>x[0].textContent).then(t=>/Realm/.test(t)),'group by Tower');
 await p.evaluate(()=>{hcSet({tier:'Legendary',group:'tier'});renderHidden()});await p.waitForTimeout(150);ok(await p.$$eval('.hcx-row i',x=>x.length===100),'tier tab filters to Legendary');
 // grant to a party member
 await p.evaluate(()=>{PARTY.push({id:'t1',name:'Tess',level:12,gear:[],inv:[],abil:{}});saveParty();renderHidden()});await p.waitForTimeout(150);
 if(!(await p.isVisible('#hcx-to')))await p.click('.hcx-row >> nth=0');
 await p.click('[data-hcx-grant]');ok(await p.evaluate(()=>hcList(PARTY.find(x=>x.id==='t1')).length===1),'Grant gives the class to the character');
 ok(await p.isVisible('#hcx-detail >> text=Tess · level 12'),'detail shows who holds it');
 await p.evaluate(()=>{PARTY.length=0;saveParty();localStorage.clear()});await p.close()}
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
