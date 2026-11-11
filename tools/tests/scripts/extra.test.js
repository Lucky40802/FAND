const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(8775,r));const b=await chromium.launch();let errs=0;
for(const pg of ['sheet','dice','towers','tools','rules','about']){const p=await b.newPage();p.on('pageerror',e=>{errs++;console.log(pg,'PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());await p.goto('http://127.0.0.1:8775/'+pg+'.html');await p.waitForTimeout(1500);console.log(pg,(await p.$eval('#content',e=>e.textContent.length)));await p.close()}
console.log(errs?'ERRORS':'NO PAGE ERRORS');await b.close();srv.close()})();
