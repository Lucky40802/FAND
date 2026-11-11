const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8847,r));const b=await chromium.launch();
const party=[{id:'a',name:'Bran',level:5,cls:'Wizard',abil:{},gear:[],inv:[],hp:12,hpMax:30,coins:{gp:7},standing:{'tower:Evocation':{s:1,n:'The Thunderhall',k:'Magic Tower'}},standingLog:[{d:'2026-10-20',f:'tower:Evocation',n:'The Thunderhall',from:0,to:1,why:'Returned a tome'}]},
 {id:'b',name:'Ayla',level:4,cls:'Warlock',god:'Zeus',rank:'Minor',abil:{},gear:[],inv:[],hp:10,hpMax:25}];
const mk=async role=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(([pt,r])=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.role',JSON.stringify(r));localStorage.setItem('fand.party',JSON.stringify(pt));localStorage.setItem('fand.dmOpen','true')},[party,role]);const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});p.on('dialog',d=>d.type()==='prompt'?d.accept('Rescued the archmage'):d.accept());await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk('dm');await p.goto('http://127.0.0.1:8847/party.html');await p.waitForTimeout(1300);
const lk=await p.evaluate(()=>({lock:HIDDEN&&!!HIDDEN.lock,txt:document.body.innerText,grid:!!document.querySelector('select[aria-label^="Bran: standing"]'),raise:[...document.querySelectorAll('button')].some(b=>/Raise/.test(b.textContent))}));
ok(!lk.lock||(/locked: the DM opens them with the DM code/.test(lk.txt)&&!lk.grid&&!lk.raise),'locked until the DM code is entered: no grid, no Raise/Lower');
await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Unlock with the DM code/.test(x.textContent));if(b)b.click()});await p.waitForTimeout(200);
ok(!lk.lock||await p.evaluate(()=>!!document.querySelector('#dm-lock input,#dm-lock #hc-pat,#dm-lock #hc-pin,#dm-lock canvas,#dm-lock svg')),'Unlock shows the DM code form in place');
// the DM enters the code (simulated: the same state the real unlock leaves)
await p.evaluate(()=>{HC=HC||[];renderParty()});await p.waitForTimeout(200);
const t=await p.evaluate(()=>document.body.innerText);ok(/DM controls/.test(t)&&/Standing, character by character/.test(t),'DM controls panel is on the Party page');
// set standing directly for one character
await p.evaluate(()=>{$('dm-why').value='Insulted the dean';const s=document.querySelector('select[aria-label="Bran: standing with The Thunderhall"]');s.value='-2';s.dispatchEvent(new Event('change'))});await p.waitForTimeout(300);
const st=await p.evaluate(()=>({b:standOf(PARTY[0],'tower:Evocation'),a:standOf(PARTY[1],'tower:Evocation'),log:PARTY[0].standingLog.slice(-1)[0]}));
ok(st.b===-2&&st.a===0&&st.log.from===1&&st.log.to===-2&&st.log.why==='Insulted the dean','set Bran straight to Hostile with the Thunderhall (two steps at once), Ayla untouched, logged with the reason');
// contracted god can't go below Friendly
ok(await p.evaluate(()=>{const s=document.querySelector('select[aria-label="Ayla: standing with Zeus"]');return !!s&&![...s.options].some(o=>+o.value<1)}),'a contracted god offers nothing below Friendly');
await p.evaluate(()=>{const s=document.querySelector('select[aria-label="Ayla: standing with Zeus"]');s.value='3';s.dispatchEvent(new Event('change'))});await p.waitForTimeout(300);
ok(await p.evaluate(()=>standOf(PARTY[1],'god:Zeus')===3),'Ayla raised to Honored with Zeus');
// add a faction row
await p.evaluate(()=>{$('dm-addf').value='smith:Human';standAddRow()});await p.waitForTimeout(300);
ok(await p.evaluate(()=>!!document.querySelector('select[aria-label="Bran: standing with The smiths of the Human Realm"]')&&PARTY.every(c=>(c.standing||{})['smith:Human'])),'a new faction joins the grid for everyone');
// history edit + delete
await p.evaluate(()=>standLogEdit('a',0,'why'));await p.waitForTimeout(200);ok(await p.evaluate(()=>PARTY[0].standingLog[0].why==='Rescued the archmage'),'a past reason can be corrected');
const n0=await p.evaluate(()=>PARTY[0].standingLog.length);await p.evaluate(()=>standLogEdit('a',0,'del'));await p.waitForTimeout(200);ok(await p.evaluate(n=>PARTY[0].standingLog.length===n-1&&standOf(PARTY[0],'tower:Evocation')===-2,n0),'a history entry can be removed (standing unchanged)');
// fields
await p.evaluate(()=>{const f=(id,v)=>{const e=$(id);e.value=v;e.dispatchEvent(new Event('change'))};f('dm-level-a','7');f('dm-hp-a','30');f('dm-gp-b','150');f('dm-tempHp-b','5')});await p.waitForTimeout(400);
const fl=await p.evaluate(()=>({l:PARTY[0].level,hp:PARTY[0].hp,gp:PARTY[1].coins.gp,t:PARTY[1].tempHp}));ok(fl.l===7&&fl.hp===30&&fl.gp===150&&fl.t===5,'level, HP, temp HP and gold edit from the table '+JSON.stringify(fl));
// undo last
await p.evaluate(()=>{const b=[...document.querySelectorAll('#toast button,.toast button,[class*=toast] button')].find(x=>/undo/i.test(x.textContent));if(b)b.click()});await p.waitForTimeout(300);
ok(await p.evaluate(()=>PARTY[1].tempHp===''||PARTY[1].tempHp==null),'undo reverts the last edit');
// remove row
await p.evaluate(()=>standDropRow('smith:Human'));await p.waitForTimeout(200);ok(await p.evaluate(()=>PARTY.every(c=>!(c.standing||{})['smith:Human'])),'a faction can be taken off the grid');
await p.evaluate(()=>{document.querySelector('details.panel[open] summary') ;});await p.screenshot({path:S+'/dm-panel.png',fullPage:true});
// full sheet link
ok(await p.evaluate(()=>[...document.querySelectorAll('[data-go="sheet"]')].some(b=>/"id":"b"/.test(b.dataset.setup))),'each row links to the full sheet');
await ctx.close();
// player view: no DM controls
[ctx,p]=await mk('player');await p.goto('http://127.0.0.1:8847/party.html');await p.waitForTimeout(1300);ok(await p.evaluate(()=>!/DM controls/.test(document.body.innerText)),'player view: no DM controls');await ctx.close();
// campaign: DM can edit a player's character, a fellow player cannot
[ctx,p]=await mk('dm');await p.goto('http://127.0.0.1:8847/party.html');await p.waitForTimeout(1300);
const camp=await p.evaluate(()=>{HC=HC||[];CL.user={id:'dm1'};CL.camps=[{id:'k1',dm:'dm1',name:'The Table'}];PARTY[1].camp='k1';PARTY[1]._by={u:'p2',n:'Sam'};renderParty();const asDM=!!document.querySelector('select[aria-label="Ayla: standing with Zeus"]')&&/save to the players/.test(document.body.innerText);
  CL.camps=[{id:'k1',dm:'someone',name:'The Table'}];renderParty();const asPlayer=!document.querySelector('select[aria-label="Ayla: standing with Zeus"]');return {asDM,asPlayer}});
ok(camp.asDM,'campaign DM can edit a player\'s character (and is told it saves to their sheet)');ok(camp.asPlayer,'a fellow player cannot edit someone else\'s character');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
