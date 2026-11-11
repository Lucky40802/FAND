const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8786,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:850}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8786/materials.html');await p.waitForFunction(()=>typeof MATS!=='undefined'&&typeof gearKind==='function');
 const r=await p.evaluate(()=>{const hide=MATS.find(m=>m.n==='Baboon Hide'),bone=MATS.find(m=>m.n==='Baboon Bone');
   const BL=Object.values(BASES),club=BL.find(b=>gearKind(b)==='weapon'),shield=BL.find(b=>gearKind(b)==='armor');
   return {hide:hide&&hide.tr,bone:bone&&bone.tr,club:club&&club.n,shield:shield&&shield.n,
     wOk:trWorks(hide.tr,'weapon'),aOk:trWorks(hide.tr,'armor'),eOk:trWorks(hide.tr,'worn'),ring:gearKind({n:'Ring'}),
     wList:trListHTML([hide],'weapon'),aList:trListHTML([hide],'armor')}});
 console.log('  Baboon Hide:',JSON.stringify(r.hide),'\n  Baboon Bone:',JSON.stringify(r.bone));
 ok(r.hide&&r.hide.s==='a','Baboon Hide trait works only in armor');
 ok(!r.wOk&&r.aOk,'trWorks: not in a weapon, yes in armor ('+r.club+' / '+r.shield+')');
 ok(/Not active/.test(r.wList)&&!/Not active/.test(r.aList),'trait list says it is not active in a weapon');
 ok(r.bone&&!/Undying/.test(r.bone.a||''),'Baboon Bone no longer takes the Undying trait ('+(r.bone&&r.bone.n)+')');
 await p.goto('http://127.0.0.1:8786/bestiary.html');await p.waitForFunction(()=>typeof MONSTERS!=='undefined');
 const bat=await p.evaluate(()=>{const m=MONSTERS.find(x=>x.n==='Bat');return m.sb});
 ok(/fly 40/.test(bat.sp)&&/blindsight/.test(bat.se)&&bat.tr.some(t=>t[0]==='Echolocation'),'Bat flies and has echolocation');
 const horse=await p.evaluate(()=>MONSTERS.find(x=>x.n==='Riding Horse').sb);ok(horse.ac2.some(a=>a[0]==='Hooves')&&!horse.ac2.some(a=>a[0]==='Claw'),'Horse kicks with hooves, no claws');
 await p.evaluate(()=>localStorage.clear());
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
