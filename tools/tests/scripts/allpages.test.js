const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(8787,r));const b=await chromium.launch();let errs=0;const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html'));
for(const pg of pages){for(const vp of [{width:1200,height:800},{width:390,height:800}]){const p=await b.newPage({viewport:vp});p.on('pageerror',e=>{errs++;console.log(pg,vp.width,'PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());await p.goto('http://127.0.0.1:8787/'+pg);try{await p.waitForFunction(()=>typeof TAB!=='undefined'&&!document.querySelector('#content > .loading'),null,{timeout:20000})}catch(e){errs++;console.log(pg,vp.width,'did not finish loading')}
 const w=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(w){console.log(pg,vp.width,'horizontal scroll');}await p.close()}}
console.log(pages.length+' pages ×2: '+(errs?errs+' ERRORS':'NO PAGE ERRORS'));await b.close();srv.close()})();
