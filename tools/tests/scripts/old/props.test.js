const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8791,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 // an old forged design (Potency on the 1-10 scale) is migrated once
 await p.goto('http://127.0.0.1:8791/properties.html');await p.evaluate(()=>{localStorage.clear();store.set('designs',[{n:'Old Blade',forged:{marks:0},powers:[{k:'p',n:'Burning',pot:4,t:'x'}],prop:'Burning (Potency 4)'}])});
 await p.goto('http://127.0.0.1:8791/properties.html');await p.waitForFunction(()=>typeof PROPS!=='undefined'&&document.querySelector('.card'));
 const l=await p.evaluate(()=>({n:PROPS.length,cards:document.querySelectorAll('.card').length,d:store.get('designs',[])[0]}));
 ok(l.n>=92&&l.cards>0,'Properties page lists '+l.n+' properties ('+l.cards+' cards shown)');
 ok(l.d.potV===2&&l.d.powers[0].pot===20&&/Potency 20/.test(l.d.prop),'an old forged item moves to the new scale: Potency 4 → 20');
 await p.evaluate(()=>openItem(PROPS.find(x=>x.n==='Burning')));await p.waitForTimeout(300);await p.screenshot({path:process.env.S+'/prop.png'});
 const t=await p.evaluate(()=>document.body.innerText);
 ok(/Potency is how strongly a material carries its property/.test(t),'the property page explains Potency');
 ok(/Every 5 Potency/i.test(t)&&/immunity to fire damage/i.test(t)&&/vulnerable to fire/.test(t),'it lists the every-5 ladder up to Potency 50');
 ok(/Materials that carry it/i.test(t),'it lists the materials that carry it');
 const nw=await p.evaluate(()=>['Thorned','Preserving','Clockwork','Tolling','Sprouting'].map(n=>{const x=PROPS.find(y=>y.n===n);return n+':'+(x?x.mats:'missing')}));ok(nw.every(x=>!/missing|:0$/.test(x)),'new properties exist and are on materials: '+nw.join(', '));
 const m=await p.evaluate(()=>{const m=MATS.find(x=>x.pn==='Warding'&&x.pot>=20);return {n:m&&m.n,pot:m&&m.pot,rank:m&&potRank(m.pot)}});ok(m.pot>=20&&m.rank===Math.floor(m.pot/5),'a Warding material shows Potency '+m.pot+' (rank '+m.rank+')');
 // gear bonus still uses the rank: wearing a Warding material gives +B (half the rank, rounded up)
 const gb=await p.evaluate(()=>{const m=MATS.find(x=>x.pn==='Warding'&&x.pot>=20);const b={n:'Test Ring',cat:'Ring',mats:[m.n],prop:''};const r=gearBonus([b]);return {r:JSON.stringify(r).slice(0,200),want:Math.ceil(potRank(m.pot)/2)}});
 ok(gb.r.includes(String(gb.want)),'gear bonus uses the rank (want +'+gb.want+'): '+gb.r);
 await p.evaluate(()=>{const m=MATS.find(x=>x.pn==='Warding'&&x.pot>=20);openItem(m)});await p.waitForTimeout(300);
 const link=await p.evaluate(()=>{const a=[...document.querySelectorAll('.callout a[data-ref^="prop:"]')][0];return a?a.textContent:null});ok(link==='Warding','the material page links to the Warding property page');
 await p.goto('http://127.0.0.1:8791/rules.html');await p.waitForTimeout(700);const rt=await p.evaluate(()=>document.body.innerText);ok(/Potency = min\(50/.test(rt),'rules page has the new Potency formula');
 await p.evaluate(()=>localStorage.clear());console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
