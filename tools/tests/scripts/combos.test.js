const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8815,r));const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8815/forge.html');await p.waitForTimeout(1500);await p.evaluate(()=>{if(typeof HC!=='undefined'&&!HC&&TAB==='forge'){HC=[];renderForge()}}).catch(()=>{});await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{const P=new Set(),T=new Set();MATS.forEach(m=>{if(m.pn)P.add(m.pn);if(m.tr)T.add(m.tr.n)});const real=n=>P.has(n)||T.has(n);
   const names=FCOMBOS.map(x=>x[2]),dupN=names.filter((n,i)=>names.indexOf(n)!==i),pairs=FCOMBOS.map(x=>[x[0],x[1]].sort().join('+')),dupP=pairs.filter((n,i)=>pairs.indexOf(n)!==i);
   const unreal=FCOMBOS.filter(x=>!real(x[0])||!real(x[1])).map(x=>x[2]);
   const newer=['Rooted','Slick','Blossoming','Tolling','Shifting Sands','Mycelial','Clockwork','Thorned','Ashen','Moulded','Smoky','Sprouting','Preserving'].filter(n=>FCOMBOS.filter(x=>x[0]===n||x[1]===n).length<2);
   // an item holding both halves of a new combo finds it
   const fake=(a,b)=>{const ma=MATS.find(m=>m.pn===a||(m.tr&&m.tr.n===a)),mb=MATS.find(m=>m.pn===b||(m.tr&&m.tr.n===b));return {props:[ma,mb].filter(m=>m&&m.pn).map(m=>({m,half:false})),parts:[ma,mb].map(m=>({m,fit:{lv:'good'}}))}};
   const got=['Mountain\'s Root','Salamander','Briar Guard','Watchtower'].map(n=>{const c=FCOMBOS.find(x=>x[2]===n);return forgeCombos(fake(c[0],c[1])).some(x=>x[2]===n)});
   return {n:FCOMBOS.length,dupN,dupP,unreal,newer,got,sec:(document.body.innerText.match(/Found \d+ of \d+/)||[''])[0]}});
 ok(r.n===179+69,'combos: '+r.n+' (179 + 69)');ok(!r.dupN.length,'no two combos share a name '+r.dupN);ok(!r.dupP.length,'no pair has two combos '+r.dupP);
 ok(!r.unreal.length,'every combo uses properties or traits real materials carry '+r.unreal.join(', '));ok(!r.newer.length,'each newer property has at least two combos '+r.newer);
 ok(r.got.every(Boolean),'an item holding both halves discovers the combo '+r.got);ok(/of 248/.test(r.sec),'the Forge counts them: '+r.sec);
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
