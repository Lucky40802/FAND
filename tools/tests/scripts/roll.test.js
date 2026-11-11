const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8788,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:700}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8788/dice.html');await p.waitForFunction(()=>typeof rollShow==='function');
 await p.evaluate(()=>{store.set('dicesound',false);rollShow('3d6+2')});
 for(const t of [120,380,620,900,1500]){await p.waitForTimeout(t===120?120:t-(t===380?120:t===620?380:t===900?620:900));await p.screenshot({path:(process.env.S||'.')+'/'+'roll-'+t+'.png'})}
 ok(await p.isVisible('.dice-total.show'),'the total appears after the dice settle');
 ok(await p.evaluate(()=>{const s=[...document.querySelectorAll('.die span')].map(x=>+x.textContent),f=[...document.querySelectorAll('.die span')].map(x=>Math.abs(+x.dataset.final));return JSON.stringify(s)===JSON.stringify(f)}),'each die shows its real result');
 ok(await p.evaluate(()=>{const s=[...document.querySelectorAll('.die span')].reduce((a,x)=>a+ +x.dataset.final,0);return +document.querySelector('.dice-total b').textContent===s+2}),'total = dice + 2');
 await p.click('.dice-acts [data-again]');await p.waitForTimeout(1700);ok(await p.isVisible('.dice-total.show'),'Roll again rolls once more');
 // natural 20
 await p.evaluate(()=>diceOverlay({e:'1d20',t:20,r:[20],sd:[20],mod:0},20));await p.waitForTimeout(1550);ok(await p.isVisible('.dice-total.crit'),'natural 20 gets the gold burst');await p.screenshot({path:(process.env.S||'.')+'/'+'roll-crit.png'});
 await p.evaluate(()=>diceOverlay({e:'1d20',t:1,r:[1],sd:[20],mod:0},20));await p.waitForTimeout(1550);ok(await p.isVisible('.dice-total.fumble'),'natural 1 shakes');
 // reduced motion
 await p.evaluate(()=>{store.set('motion','reduce');applyComfort();rollShow('2d8')});await p.waitForTimeout(50);ok(await p.isVisible('.dice-total.show'),'less motion: result at once, no throw');
 await p.evaluate(()=>localStorage.clear());
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
