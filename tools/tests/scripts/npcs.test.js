const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8849,r));const b=await chromium.launch();
const mk=async(vp)=>{const ctx=await b.newContext({viewport:vp||{width:1280,height:900}});await ctx.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.role',JSON.stringify('dm'));localStorage.setItem('fand.npcs','[]');localStorage.setItem('fand.journal','[]')});const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});p.on('dialog',d=>d.accept());await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk();
await p.goto('http://127.0.0.1:8849/npcs.html');await p.waitForTimeout(1300);
ok(await p.evaluate(()=>/opens with the DM code/.test(document.body.innerText)&&!$('npc-q')),'locked until the DM code is entered');
ok(await p.evaluate(()=>NAV_GROUPS.some(g=>g[1].includes('npcs'))&&DM_PAGES.includes('npcs')),'NPCs is in the Play menu and the DM group');
await p.evaluate(()=>{HC=HC||[];renderNpcs()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>/No NPCs yet/.test(document.body.innerText)),'empty roster explains what to do');
// new NPC via form
await p.evaluate(()=>npcNew());await p.waitForTimeout(200);
await p.evaluate(()=>{$('npc-name').value='Hesta Coldbrook';$('npc-role').value='Merchant';$('npc-title').value='Harbourmaster';$('npc-fac').value='tower:Evocation';$('npc-realm').value='Mysterious';$('npc-att').value='2';$('npc-voice').value='Answers every question with a price';$('npc-secret').value='Smuggles Glimmers';npcFormSave()});await p.waitForTimeout(200);
const n1=await p.evaluate(()=>({n:NPCS[0],stored:store.get('npcs',[]).length,txt:document.querySelector('#content .grid').innerText,pic:!!document.querySelector('#content .grid .card .art svg')}));
ok(n1.n.name==='Hesta Coldbrook'&&n1.n.role==='Merchant'&&n1.n.fac==='tower:Evocation'&&n1.n.att===2&&n1.stored===1,'a new NPC saves with role, faction, realm and attitude');
ok(/Trusted/.test(n1.txt)&&/Thunderhall/.test(n1.txt)&&/Harbourmaster/.test(n1.txt)&&n1.pic,'its card shows a picture, attitude, faction and title');
// random NPC
await p.evaluate(()=>npcRandom());await p.waitForTimeout(200);
const r=await p.evaluate(()=>({n:NPCS.length,ed:NPC_EDIT===NPCS[0].id,name:NPCS[0].name,looks:NPCS[0].looks,secret:NPCS[0].secret}));ok(r.n===2&&r.ed&&r.name&&r.looks&&r.secret,'Random NPC fills a whole NPC and opens it for editing ('+r.name+')');
await p.evaluate(()=>npcFormSave());await p.waitForTimeout(150);
// search + filter
await p.fill('#npc-q','hesta');await p.waitForFunction(()=>document.querySelectorAll('#content .grid .card').length===1,null,{timeout:3000}).catch(()=>{});ok(await p.evaluate(()=>document.querySelectorAll('#content .grid .card').length===1&&document.activeElement.id==='npc-q'),'search narrows the roster (and keeps the cursor in the box)');
await p.fill('#npc-q','');await p.waitForTimeout(150);
await p.evaluate(()=>{$('npc-ff').value='tower:Evocation';$('npc-ff').dispatchEvent(new Event('change'))});await p.waitForTimeout(150);ok(await p.evaluate(()=>document.querySelectorAll('#content .grid .card').length===1),'filter by faction');
await p.evaluate(()=>{$('npc-ff').value='';$('npc-ff').dispatchEvent(new Event('change'))});
// handout excludes secret
const h=await p.evaluate(()=>{let got=null;const o=window.openHandout;window.openHandout=x=>{got=x};npcHandout(NPCS.find(n=>n.name==='Hesta Coldbrook').id);window.openHandout=o;return got});
ok(h&&/Hesta/.test(h.t)&&/price/.test(h.b)&&!/Smuggles/.test(h.b),'a handout shares the NPC without the secret');
await p.evaluate(()=>npcJournal(NPCS.find(n=>n.name==='Hesta Coldbrook').id));ok(await p.evaluate(()=>{const j=store.get('journal',[]);return j.length===1&&/Smuggles/.test(j[0].body)}),'the journal note keeps the secret (it is the DM\'s)');
// picture picker for an NPC
await p.evaluate(()=>npcPicture(NPCS.find(n=>n.name==='Hesta Coldbrook').id));await p.waitForTimeout(1300);await p.evaluate(()=>document.querySelector('#ap-grid .ap-i').click());await p.waitForTimeout(200);
ok(await p.evaluate(()=>{const n=NPCS.find(n=>n.name==='Hesta Coldbrook');return n.pic&&n.pic.b&&store.get('npcs',[]).find(x=>x.id===n.id).pic}),'an NPC can get a picture from the picker');
await p.screenshot({path:S+'/npcs.png'});
// delete + undo
await p.evaluate(()=>npcDel(NPCS[0].id));await p.waitForTimeout(150);ok(await p.evaluate(()=>NPCS.length===1),'delete removes an NPC');
await p.evaluate(()=>{const b=[...document.querySelectorAll('#toast button,.toast button,[class*=toast] button')].find(x=>/undo/i.test(x.textContent));if(b)b.click()});await p.waitForTimeout(150);ok(await p.evaluate(()=>NPCS.length===2),'undo brings it back');
// keep from the Hooks page
await p.goto('http://127.0.0.1:8849/hooks.html');await p.waitForTimeout(1300);
const kb=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Keep in NPCs/.test(x.textContent));if(!b)return false;b.click();return true});await p.waitForTimeout(200);
ok(kb&&await p.evaluate(()=>store.get('npcs',[]).length===3),'Hooks page random NPCs have Keep in NPCs');
await ctx.close();
[ctx,p]=await mk({width:390,height:844});await p.goto('http://127.0.0.1:8849/npcs.html');await p.waitForTimeout(1300);await p.evaluate(()=>{HC=HC||[];npcRandom()});await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'phone: no sideways scroll with the form open');await p.screenshot({path:S+'/npcs-phone.png'});
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
