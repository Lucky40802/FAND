const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8794,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:850}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8794/index.html');await p.waitForSelector('.hero');
 ok(await p.isVisible('.ladder')&&await p.isVisible('[data-hedit]'),'Home draws every section, with Customise Home');
 await p.click('[data-hedit]');ok((await p.$$('.hsec')).length>=8,'edit mode shows each section with controls ('+(await p.$$('.hsec')).length+')');
 await p.click('[data-hk="ladder"] [data-hhide]');await p.click('[data-hk="changes"] [data-hmv="-1"]');await p.screenshot({path:(process.env.S||'.')+'/'+'home-edit.png'});await p.click('[data-hdone]');
 ok(!(await p.isVisible('.ladder')),'hidden section gone');
 const order=await p.evaluate(()=>homeL().order);ok(order.indexOf('changes')<order.indexOf('builder'),'Latest changes moved above the builder');
 await p.reload();await p.waitForSelector('.hero');ok(!(await p.isVisible('.ladder')),'layout kept after reload');
 await p.click('[data-hedit]');await p.click('[data-hreset]');ok(await p.isVisible('.ladder'),'Reset brings everything back');
 // sync dot
 await p.evaluate(()=>{CL.user={id:'u',email:'a@b.c'};CL.err='';CL.dirty=new Set(['x']);CL.on=true;clHeader();clDot()});ok(await p.evaluate(()=>$('acctBtn').dataset.sync==='saving'),'saving shows the amber light');
 await p.evaluate(()=>{CL.dirty=new Set();CL.last=Date.now();clDot()});ok(await p.evaluate(()=>$('acctBtn').dataset.sync==='ok'),'synced shows green');
 await p.evaluate(()=>{CL.err='boom';clDot()});ok(await p.evaluate(()=>$('acctBtn').dataset.sync==='err'),'error shows red');
 await p.evaluate(()=>localStorage.clear());
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
