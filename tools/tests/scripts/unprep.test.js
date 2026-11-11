const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8832,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
 // a character saved before the change, holding prepared materials, and a design made from one
 await ctx.addInitScript(()=>{if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');localStorage.setItem('fand.party',JSON.stringify([{id:'c1',name:'Bran',level:12,prof:'Blacksmithing',profLv:6,abil:{},gear:['Aboleth Hide (Tanned)'],inv:[['Aboleth Hide (Tanned)',2],['Aboleth Hide',1],['Aboleth Hide (Rawhide)',4],['Iron Ore',3]]}]));
   localStorage.setItem('fand.forge',JSON.stringify({base:'Battleaxe',parts:{head:'Aboleth Hide (Tanned)'},proc:{head:'tanned'},name:'',showAll:false,realm:''}))});
 const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8832/forge.html');await p.waitForTimeout(1500);await p.evaluate(()=>{if(typeof HC!=='undefined'&&!HC&&TAB==='forge'){HC=[];renderForge()}}).catch(()=>{});await p.waitForTimeout(200);
 const r=await p.evaluate(()=>({inv:PARTY[0].inv,gear:PARTY[0].gear,saved:JSON.parse(localStorage.getItem('fand.party'))[0].inv,parts:FORGE.parts,proc:FORGE.proc,find:(findMat('Aboleth Hide (Tanned)')||{}).n,real:(findMat(MATS[5].n)||{}).n===MATS[5].n?'Iron Ore':'x'}));
 ok(JSON.stringify(r.inv)==='[["Aboleth Hide",7],["Iron Ore",3]]','packs: prepared hides back as plain Aboleth Hide, merged (2+1+4=7): '+JSON.stringify(r.inv));
 ok(JSON.stringify(r.saved)===JSON.stringify(r.inv),'the converted pack is saved');ok(r.gear[0]==='Aboleth Hide','gear names converted too');
 ok(r.parts.head==='Aboleth Hide'&&r.proc===undefined,'the Forge\'s chosen part and old picks converted');ok(r.find==='Aboleth Hide','an old variant name still finds the plain material');ok(r.real==='Iron Ore','normal names unchanged');
 const page=await p.evaluate(()=>document.body.innerText);ok(!/Preparation bench/.test(page),'no Preparation bench');ok(!(await p.$('[data-proc]')),'no "Prepared as" picker on parts');
 ok(await p.evaluate(()=>![...document.querySelectorAll('.fg-jump a')].some(a=>/Preparation/.test(a.textContent))),'no bench in the shortcut bar');
 ok(await p.evaluate(()=>!Object.values(PROC_GONE_CHECK=typeof PROC==='undefined'?{}:{x:1}).length),'variant data gone');
 // a hide's page has no Variants block
 await p.goto('http://127.0.0.1:8832/materials.html');await p.waitForTimeout(800);await p.evaluate(()=>{const m=MATS.find(x=>/Hide/.test(x.n));const el=document.createElement('a');el.dataset.ref=m._t+':'+m._i;el.href='#';document.body.appendChild(el);el.click()});await p.waitForTimeout(500);
 const det=await p.evaluate(()=>document.body.innerText);ok(!/Variants/.test(det)&&!/Prepared at the Forge/.test(det),'material page: no Variants list');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
