const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8808,r));const b=await chromium.launch();
 for(const [w,h,m] of [[1280,800,false],[390,844,true]]){const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:m,isMobile:m,reducedMotion:'reduce'});const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8808/forge.html');await p.waitForTimeout(1500);
  const L=await p.$$eval('.fg-jump a',a=>a.map(x=>x.textContent));ok(L.length>=8&&L.includes('🔮 Mystic Forge')&&L.some(x=>/Master smiths/.test(x)),w+': shortcut bar lists the parts ('+L.length+')');
  await p.evaluate(()=>[...document.querySelectorAll('.fg-jump a')].find(a=>/Master smiths/.test(a.textContent)).click());await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const t=[...document.querySelectorAll('.page.forge>section.sec h3')].find(h=>/Master smiths/.test(h.textContent)).closest('section').getBoundingClientRect().top,bar=document.querySelector('.fg-jump').getBoundingClientRect();return {t:Math.round(t),barTop:Math.round(bar.top),barBottom:Math.round(bar.bottom),on:(document.querySelector('.fg-jump a.on')||{}).textContent||''}});
  ok(r.t>=r.barBottom-4&&r.t<r.barBottom+80,w+': jumps to Master smiths, just under the bar ('+r.t+' vs bar bottom '+r.barBottom+')');ok(/Master smiths/.test(r.on),w+': that shortcut is lit');
  ok(r.barTop<=Math.max(60,r.barTop)&&r.barTop<200,w+': bar stays at the top while scrolled ('+r.barTop+')');
  await p.evaluate(()=>{FORGE.base='Longsword';renderForge()});await p.waitForTimeout(300);ok(await p.$$eval('.fg-jump',x=>x.length)===1,w+': one bar after the page redraws');
  await p.goto('http://127.0.0.1:8808/materials.html');await p.waitForTimeout(500);ok(!(await p.$('.fg-jump')),w+': no bar on other pages');
  await ctx.close()}
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
