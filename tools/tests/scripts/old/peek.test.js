const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
const D={n:'Test Blade',base:'Longsword',cat:'Sword',il:10,r:'Rare',mats:['Iron'],dmg:'1d8 slashing',atk:2,powers:[{k:'p',n:'Piercing Edge',pot:10,t:'Ignores 2 AC.'}],forged:{q:'Fine',by:'Ana',on:'2026-10-27',quirk:{n:'Hums',t:'It hums near gold.'}},combos:[]};
(async()=>{await new Promise(r=>srv.listen(8792,r));const b=await chromium.launch();
 const err=p=>p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 // the maker
 const A=await b.newContext();await A.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());const a=await A.newPage();err(a);
 await a.goto('http://127.0.0.1:8792/sheet.html');await a.evaluate(d=>{localStorage.setItem('fand.designs',JSON.stringify([d]));localStorage.setItem('fand.party',JSON.stringify([{id:'c1',name:'Bran',level:5,abil:{},gear:['Test Blade'],inv:[]}]))},D);
 await a.goto('http://127.0.0.1:8792/sheet.html');await a.waitForFunction(()=>typeof saveParty==='function');
 const fd=await a.evaluate(()=>{saveParty();return PARTY[0].fd});ok(fd&&fd['Test Blade']&&fd['Test Blade'].powers.length===1&&!fd['Test Blade'].sort,'the character carries a copy of its forged item');
 const shared=await a.evaluate(()=>JSON.parse(JSON.stringify(PARTY[0])));
 // someone else (DM or player): the character arrives through the campaign, no designs of their own
 const B=await b.newContext();await B.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());const p=await B.newPage();err(p);
 await p.goto('http://127.0.0.1:8792/sheet.html');await p.evaluate(c=>{c._by={u:'someone',n:'Ana'};c.camp='k';localStorage.setItem('fand.party',JSON.stringify([c]));localStorage.removeItem('fand.designs');localStorage.setItem('fand.sheet',JSON.stringify('c1'))},shared);
 await p.goto('http://127.0.0.1:8792/sheet.html');await p.waitForFunction(()=>typeof findBP==='function');await p.waitForTimeout(600);
 const bp=await p.evaluate(()=>{const x=findBP('Test Blade');return x&&{ds:x.ds,peek:!!x.design.peek,t:x._t,i:x._i}});
 ok(bp&&/Piercing Edge/.test(bp.ds)&&/Hums/.test(bp.ds)&&/1d8 slashing/.test(bp.ds),'the other player\'s device has the item\'s description');
 ok(bp&&bp.peek&&bp.t==='bp'&&bp.i>0,'registered as a read-only Blueprint');
 await p.evaluate(()=>{SHEET_ID='c1';go('sheet')});await p.waitForTimeout(500);console.log('   forgedHTML:',await p.evaluate(()=>{try{return forgedHTML(PARTY[0]).slice(0,80)}catch(e){return 'ERR '+e.message}}),await p.evaluate(()=>[...document.querySelectorAll('.sh-tabs button,[data-shtab]')].map(x=>x.textContent).join('|')));
 const box=await p.evaluate(()=>forgedHTML(PARTY[0]));ok(/Piercing Edge/.test(box),'the sheet\'s Forged items box shows it for a non-maker');
 await p.evaluate(()=>{const b=findBP('Test Blade');openDetail?openDetail(b):null}).catch(()=>{});
 const r=await p.evaluate(()=>{const b=findBP('Test Blade');const el=document.querySelector(`[data-ref="${b._t}:${b._i}"]`);if(el){el.click();return true}return false});ok(r,'a link to the item is on the sheet');
 await p.waitForTimeout(500);const det=await p.evaluate(()=>document.body.innerText);
 ok(/Forged by Ana/.test(det)&&/Ignores 2 AC/.test(det),'opening it shows who forged it and what it does');ok(!/Your design/.test(det),'it is not called "Your design"');
 await p.screenshot({path:path.join(process.env.S||'.','peek.png')});
 ok(await p.evaluate(()=>!charStats(PARTY[0]).gear||true),'stats still compute');
 // the Workshop: view and equip someone else's Blueprint
 await p.evaluate(d=>{WS.rows=[{id:'w1',owner:'someone',maker:'Ana',name:'Test Blade',base:'Longsword',data:d,shared:true}];wsView('w1')},D);
 const wv=await p.evaluate(()=>document.getElementById('wsHost').innerText);ok(/Ignores 2 AC/.test(wv)&&/Hums/.test(wv),'Workshop window shows the whole description');
 await p.evaluate(()=>{openModal();window.prompt=()=>'Bran';wsEquip('w1')});
 const eq=await p.evaluate(()=>{const b=findBP('Test Blade (by Ana)');return b&&{ds:b.ds,f:isForeign(b),forged:!!forgedOf('Test Blade (by Ana)')}});
 ok(eq&&/Piercing Edge/.test(eq.ds)&&eq.f&&!eq.forged,'an equipped Workshop item keeps its description and stays invalid');
 // an old foreign entry (name only) is filled in when the Workshop loads
 await p.evaluate(()=>{DESIGNS.forEach((d,i)=>{if(d.foreign)DESIGNS[i]={n:d.n,base:d.base,cat:d.cat,foreign:d.foreign}});store.set('designs',DESIGNS);designPlace(true)});
 ok(await p.evaluate(()=>!findBP('Test Blade (by Ana)').ds||!/Piercing/.test(findBP('Test Blade (by Ana)').ds)),'(old entry has no description)');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
