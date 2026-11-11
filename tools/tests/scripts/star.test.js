const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8817,r));const b=await chromium.launch();
 for(const theme of ['dark','light']){const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.addInitScript(t=>{try{localStorage.setItem('fand.theme',JSON.stringify(t))}catch(e){}},theme);
  const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8817/index.html');await p.waitForTimeout(1500);ok(await p.$('#cs-fx'),theme+': home sky canvas present');
  // an arc across the sky
  for(let i=0;i<=30;i++){const a=Math.PI*(1+i/30);await p.mouse.move(640+380*Math.cos(a),520+260*Math.sin(a));await p.waitForTimeout(4)}
  await p.screenshot({path:path.join(process.env.S,'star-'+theme+'.png'),clip:{x:200,y:180,width:880,height:400}});
  await p.waitForTimeout(900);await p.screenshot({path:path.join(process.env.S,'star-'+theme+'-after.png'),clip:{x:200,y:180,width:880,height:400}});
  await ctx.close()}
 // reduced motion: no trail is drawn, no errors
 const c2=await b.newContext({reducedMotion:'reduce'});const q=await c2.newPage();q.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await q.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());await q.goto('http://127.0.0.1:8817/index.html');await q.waitForTimeout(800);await q.mouse.move(300,300);await q.mouse.move(500,400);await q.waitForTimeout(300);ok(true,'reduced motion: no errors');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
