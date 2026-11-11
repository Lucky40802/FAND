const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.webmanifest')?'application/json':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
const H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','content-type':'application/json'};
const user={id:'11111111-1111-1111-1111-111111111111',aud:'authenticated',role:'authenticated',email:'me@example.com',user_metadata:{name:'Me'},app_metadata:{},created_at:new Date().toISOString()};
async function mock(ctx){const seen=[];await ctx.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>{const u=r.request().url();seen.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,''));
  if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:H});
  if(/\/auth\/v1\/otp/.test(u))return r.fulfill({status:200,headers:H,body:'{}'});
  if(/\/auth\/v1\/verify/.test(u))return r.fulfill({status:200,headers:H,body:JSON.stringify({access_token:'a.b.c',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user})});
  if(/\/auth\/v1\/user/.test(u))return r.fulfill({status:200,headers:H,body:JSON.stringify(user)});
  if(/\/realtime\//.test(u))return r.abort();
  return r.fulfill({status:200,headers:H,body:'[]'})});return seen}
(async()=>{await new Promise(r=>srv.listen(8791,r));const b=await chromium.launch();
 // ── an iPhone Home Screen app ──
 const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'standalone',{get:()=>true,configurable:true})});
 await mock(ctx);let p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await p.goto('http://127.0.0.1:8791/account.html');await p.waitForSelector('#clEmail');
 ok(!(await p.$('#clGoogle')),'no Google button in the iPhone app');
 await p.fill('#clEmail','me@example.com');await p.click('#clSend');await p.waitForSelector('#clCode');
 const t=await p.evaluate(()=>document.querySelector('.acct-card').innerText);ok(/Type the code/.test(t)&&/not in this app/.test(t),'code step explains the link opens outside the app');
 ok(await p.evaluate(()=>!!JSON.parse(localStorage.getItem('fand.__pending')||'null')),'the waiting email is kept on the device');
 await p.screenshot({path:path.join(process.env.S||'.','ios-code.png')});
 // the app is closed and opened again (it starts at index.html)
 await p.close();p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await p.goto('http://127.0.0.1:8791/index.html');await p.waitForSelector('#clCode',{timeout:8000}).catch(()=>{});
 ok(await p.evaluate(()=>TAB==='account'&&!!document.getElementById('clCode')),'after a restart the app goes back to the code step');
 ok(await p.evaluate(()=>/me@example\.com/.test(document.querySelector('.acct-card').innerText)),'it remembers which email');
 await p.fill('#clCode','123456');await p.click('#clVerify');
 await p.waitForFunction(()=>CL.user&&CL.user.email==='me@example.com',null,{timeout:8000}).catch(()=>{});
 ok(await p.evaluate(()=>!!(CL.user&&CL.user.email==='me@example.com')),'the code signs in inside the app');
 ok(await p.evaluate(()=>localStorage.getItem('fand.__pending')===null),'nothing left waiting once signed in');
 await ctx.close();
 // ── an ordinary browser tab: no jump to the account page, the step is still remembered there ──
 const c2=await b.newContext();await mock(c2);const q=await c2.newPage();q.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await q.goto('http://127.0.0.1:8791/index.html');await q.evaluate(()=>localStorage.setItem('fand.__pending',JSON.stringify({email:'x@example.com',at:Date.now()})));
 await q.goto('http://127.0.0.1:8791/index.html');await q.waitForTimeout(900);ok(await q.evaluate(()=>TAB!=='account'),'a browser tab is not sent to the account page');
 await q.goto('http://127.0.0.1:8791/account.html');await q.waitForSelector('#clCode');ok(await q.evaluate(()=>/Tap the link/.test(document.querySelector('.acct-card').innerText)),'browser keeps the link-or-code wording');
 await q.click('text=Use a different email');ok(await q.evaluate(()=>localStorage.getItem('fand.__pending')===null&&!!document.getElementById('clEmail')),'"Use a different email" forgets it');
 // an old one (over an hour) is ignored
 await q.evaluate(()=>localStorage.setItem('fand.__pending',JSON.stringify({email:'x@example.com',at:Date.now()-2*3600000})));await q.goto('http://127.0.0.1:8791/account.html');await q.waitForSelector('#clEmail');ok(true,'a code over an hour old is forgotten');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
