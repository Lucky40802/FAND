const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const hits=[];const srv=http.createServer((q,r)=>{hits.push(q.url);let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8850,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
await p.goto('http://127.0.0.1:8850/index.html');await p.waitForTimeout(1500);
ok(await p.evaluate(()=>typeof renderTab==='function'&&!!document.querySelector('#content')&&!/Loading the compendium/.test(document.body.innerText)),'the home page starts from the shared app.js');
ok(hits.some(u=>/^\/app\.js\?v=/.test(u))&&!hits.some(u=>/hidden-lock/.test(u)),'it loads app.js, and not the locked list');
ok(await p.evaluate(()=>!!HIDDEN.lock&&HIDDEN.lock.data===''&&HIDDEN.lock.ext===1&&typeof HIDDEN_LOCK_DATA==='undefined'),'core.js holds the lock without its ciphertext');
const r=await p.evaluate(async()=>{try{await hcUnlock('definitely-not-the-code','test');return 'unlocked?!'}catch(e){return e.message}});
ok(/not right|Wrong passphrase|tries/i.test(r)&&hits.some(u=>/hidden-lock\.js/.test(u)),'unlocking fetches the locked list, then checks the code ('+r+')');
ok(await p.evaluate(()=>typeof HIDDEN_LOCK_DATA==='string'&&HIDDEN_LOCK_DATA.length>1e6),'the locked list arrived intact');
// second page: shell only
const before=hits.length;await p.goto('http://127.0.0.1:8850/bestiary.html');await p.waitForTimeout(1500);
ok(await p.evaluate(()=>document.querySelectorAll('#content .card').length>10),'a second page works');
const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');ok(/"app\.js\?v=/.test(sw)&&!/hidden-lock/.test(sw),'the offline worker keeps app.js (the locked list only once a DM fetches it)');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');ok(html.length<300000&&!/x-fand/.test(html),'pages are small shells ('+(html.length/1024|0)+' KB)');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
