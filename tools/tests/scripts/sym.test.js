const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8844,r));const b=await chromium.launch();
const mk=async vp=>{const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(()=>{localStorage.setItem('fand.role',JSON.stringify('dm'));localStorage.setItem('fand.party',JSON.stringify([{id:'a',name:'Bran',level:5,abil:{},gear:[],inv:[['Iron Ingot',3]],purse:{Human:50}}]))});const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk({width:1280,height:900});
const left=async()=>p.evaluate(()=>{const re=SYM_RE;const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;let el=n.parentNode,skip=false;for(;el&&el!==document.body;el=el.parentNode)if(SYM_SKIP[el.nodeName]){skip=true;break}if(skip)continue;re.lastIndex=0;if(re.test(n.data))out.push(n.data.slice(0,40))}return out});
for(const pg of ['forge','combat','sheet','party','shop','tools','encounter','dice','help','guide','craft','workshop','magic','prep']){await p.goto('http://127.0.0.1:8844/'+pg+'.html');await p.waitForTimeout(1300);await p.evaluate(()=>{if(typeof HC!=='undefined'&&!HC&&TAB==='forge'){HC=[];renderForge()}}).catch(()=>{});await p.waitForTimeout(200);
 const l=await left();const n=await p.evaluate(()=>document.querySelectorAll('#content .sym').length);const h=await p.evaluate(()=>!!document.querySelector('#content .pgsym'));
 ok(!l.length&&(h||pg==='forge'),pg+': no mapped emoji left as text ('+n+' symbols), page symbol on its title'+(l.length?' LEFT: '+JSON.stringify(l.slice(0,3)):''));
 if(pg==='forge')await p.screenshot({path:S+'/sym-forge.png'});if(pg==='combat')await p.screenshot({path:S+'/sym-combat.png'});if(pg==='shop')await p.screenshot({path:S+'/sym-shop.png'})}
// shop re-renders itself: symbol stays
await p.goto('http://127.0.0.1:8844/shop.html');await p.waitForTimeout(1200);await p.evaluate(()=>renderShop());await p.waitForTimeout(100);ok(await p.evaluate(()=>!!document.querySelector('#content .pgsym')),'a page that redraws itself keeps its title symbol');
// menu
await p.evaluate(()=>document.querySelector('.navg .tab').click());await p.waitForTimeout(200);const mn=await p.evaluate(()=>[...document.querySelectorAll('#navpop a')].map(a=>!!a.querySelector('.sym')));ok(mn.length>3&&mn.every(Boolean),'every menu entry has a symbol ('+mn.length+')');
ok(await p.evaluate(()=>[...document.querySelectorAll('#tabs .tab')].every(t=>t.querySelector('.sym'))),'every menu group button has a symbol');
await p.screenshot({path:S+'/sym-menu.png'});
// dropdowns keep emoji
ok(await p.evaluate(()=>{const o=[...document.querySelectorAll('option')].find(x=>SYM_RE&&(SYM_RE.lastIndex=0,SYM_RE.test(x.textContent)));return !o||!o.querySelector('.sym')}),'dropdown options keep plain text');
// a toast with an emoji gets a symbol
await p.evaluate(()=>toast('🎲 Rolled'));await p.waitForTimeout(100);ok(await p.evaluate(()=>[...document.querySelectorAll('.sym')].some(s=>s.closest('#toast,.toast,[class*=toast]'))),'toasts get symbols too');
await ctx.close();[ctx,p]=await mk({width:390,height:844});await p.goto('http://127.0.0.1:8844/forge.html');await p.waitForTimeout(1300);await p.evaluate(()=>{if(typeof HC!=='undefined'&&!HC&&TAB==='forge'){HC=[];renderForge()}}).catch(()=>{});await p.waitForTimeout(200);await p.screenshot({path:S+'/sym-phone.png'});
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'phone: no sideways scroll');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
