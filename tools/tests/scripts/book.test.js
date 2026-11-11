const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(8799,r));const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('PAGEERROR',e.message));await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8799/towers.html');await p.waitForFunction(()=>typeof makeTrial==='function');
 const r=await p.evaluate(()=>{const T0=TOWERS[0];
   // a fake hidden class on floor 5 of the first Tower so every floor roll has a book to give
   HC=[{n:'Test Book',tier:'Epic',tower:T0.realm,base:'Rogue'}];const c=HC[0];const T=towerOf(hcTower(c));const f=hcFloor(c);
   let at=0,over=0,N=4000;for(let s=1;s<=N;s++){if(makeTrial({tower:T.id,floor:f,level:floorLevel(T.realm,f),seed:s}).rw.some(x=>x.k==='book'))at++;if(makeTrial({tower:T.id,floor:f,level:floorLevel(T.realm,f)+7,seed:s}).rw.some(x=>x.k==='book'))over++}
   const t1=makeTrial({tower:T.id,floor:f,level:floorLevel(T.realm,f),seed:1}),t2=makeTrial({tower:T.id,floor:f,level:floorLevel(T.realm,f)+20,seed:1});return {floor:f,at:at/N,over:over/N,ch1:t1.bookCh,ch2:t2.bookCh,gold2:t2.rw.some(x=>x.k==='gold')}});
 console.log(JSON.stringify(r));const ok=Math.abs(r.at-.5)<.04&&Math.abs(r.over-.25)<.04&&r.ch1===.5&&r.ch2===.25&&!r.gold2;console.log(ok?'ALL PASSED':'FAILED');
 await b.close();srv.close();process.exit(ok?0:1)})();
