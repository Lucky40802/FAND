const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8794,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8794/combat.html');await p.waitForFunction(()=>typeof scavDC==='function'&&typeof MONSTERS!=='undefined');
 const r=await p.evaluate(()=>{const by=sz=>MONSTERS.find(m=>m.sb&&m.sb.sz===sz&&(m.drops||[]).length);const out={};['Tiny','Small','Medium','Large','Huge','Gargantuan'].forEach(sz=>{const m=by(sz);if(!m)return;out[sz]={n:m.n,d0:scavDC(m,{tries:0}),d2:scavDC(m,{tries:2})}});return out});
 const want={Tiny:5,Small:5,Medium:4,Large:3,Huge:2,Gargantuan:1};
 Object.entries(r).forEach(([sz,x])=>ok(x.d2-x.d0===2*want[sz],sz+' corpse ('+x.n+'): 2 tries add '+(x.d2-x.d0)+' (+'+want[sz]+' each)'));
 // panel: scavenge a Huge corpse in the combat tracker and check the text
 const t=await p.evaluate(()=>{const m=MONSTERS.find(x=>x.sb&&x.sb.sz==='Huge'&&(x.drops||[]).length);store.set('combat',{round:1,turn:0,list:[]});renderCombat();CB.list.push(Object.assign(monCombatant(m,0),{hp:0}));saveCB();CB.harvest=CB.list[0].id;saveCB();renderCombat();
   const before=document.body.innerText;scavRoll('cb');const after=document.body.innerText;return {before:/adds 2 to the DC \(Huge body/.test(before),next:/The next try is DC \d+/.test(after),m:m.n,dc:scavDC(m,CB.corpses[CB.harvest])}});
 ok(t.before,'the scavenging panel says a Huge corpse adds 2 per try ('+t.m+')');ok(t.next,'after a roll it names the next DC');
 await p.goto('http://127.0.0.1:8794/bestiary.html');await p.waitForFunction(()=>typeof openItem==='function');
 const bt=await p.evaluate(()=>{const m=MONSTERS.find(x=>x.sb&&x.sb.sz==='Large'&&(x.drops||[]).length);openItem(m);return document.body.innerText.includes('adds 3 to the DC')});ok(bt,'the Bestiary drops note says a Large corpse adds 3 per try');
 await p.evaluate(()=>localStorage.clear());console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
