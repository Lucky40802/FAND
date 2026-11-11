const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});
  if(/data\/core/.test(q.url)){let i=0;const step=()=>{if(i>=d.length)return r.end();r.write(d.slice(i,i+1500000));i+=1500000;setTimeout(step,250)};step()}else r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8786,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:800}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 const t0=Date.now();await p.goto('http://127.0.0.1:8786/bestiary.html',{waitUntil:'commit'});
 await p.waitForSelector('.top .brand',{timeout:5000});ok(Date.now()-t0<1500,'the frame (top bar) shows before the data arrives ('+(Date.now()-t0)+' ms)');
 await p.waitForFunction(()=>{const b=document.getElementById('bootbar');return b&&parseFloat(b.style.width)>10},null,{timeout:8000});
 const w=await p.$eval('#bootbar',e=>e.style.width),t=await p.textContent('#boots');ok(true,'progress bar moving: '+w+' · '+t);await p.screenshot({path:(process.env.S||'.')+'/'+'loading.png'});
 await p.waitForSelector('.card',{timeout:20000});ok(await p.evaluate(()=>typeof BPS!=='undefined'&&BPS.length>1000&&TAB==='bestiary'),'the app starts once the data is in');
 ok(await p.evaluate(()=>document.getElementById('fand-app').textContent===''),'app text freed after start');
 // file:// copy falls back to script tags
 const f=await b.newPage();f.on('pageerror',e=>{fails++;console.log('PAGEERROR file',e.message)});await f.goto('file://'+ROOT+'/dice.html');await f.waitForSelector('#t-style .dsk',{timeout:20000});ok(true,'a file:// copy of the site still loads (script-tag fallback)');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
