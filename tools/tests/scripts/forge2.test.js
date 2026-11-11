const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8797,r));const b=await chromium.launch();
 for(const vw of [{width:1300,height:900},{width:390,height:844}]){const p=await b.newPage({viewport:vw});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());console.log('-- '+vw.width);
 await p.goto('http://127.0.0.1:8797/forge.html');await p.waitForFunction(()=>typeof GEN!=='undefined'&&typeof renderForge==='function'&&document.querySelector('#content .page'));await p.evaluate(()=>{if(!HC){HC=[];renderForge()}});await p.waitForFunction(()=>document.getElementById('fg-find'));
 // search
 await p.fill('#fg-find','shovel');await p.waitForTimeout(100);ok(await p.evaluate(()=>!!document.querySelector('#fg-bases [data-base="Shovel"]')),'searching "shovel" finds the Shovel template');
 await p.fill('#fg-find','two-handed sword');await p.waitForTimeout(100);const hits=await p.evaluate(()=>[...document.querySelectorAll('#fg-bases [data-base]')].map(x=>x.dataset.base));ok(hits.includes('Greatsword')&&hits.includes('Claymore')&&!hits.includes('Dagger'),'searching "two-handed sword" finds greatswords: '+hits.slice(0,6).join(', '));
 await p.fill('#fg-find','');await p.waitForTimeout(100);ok(await p.evaluate(()=>/Browse all \d+ templates/.test(document.getElementById('fg-bases').textContent)),'with nothing typed there is a Browse all fold');
 await p.fill('#fg-find','shovel');await p.click('#fg-bases [data-base="Shovel"]');await p.waitForFunction(()=>FORGE.base==='Shovel');
 ok(await p.evaluate(()=>/Spade blade/.test(document.getElementById('content').textContent)),'the Shovel has a spade blade part');
 // without the checkbox, no Everchanging core
 ok(await p.evaluate(()=>!/Everchanging core/.test([...document.querySelectorAll('#content .panel b')].map(x=>x.textContent).join('|'))),'no Everchanging core until the box is ticked');
 // build an Everchanging longsword
 const sub=await p.evaluate(()=>{const m=MATS.filter(x=>/everchanging substance/i.test(x.n)).sort((a,b)=>(b.tier-a.tier)||(b.g-a.g))[0];return m&&{n:m.n,tier:m.tier,g:m.g,gr:m.gr}});console.log('   substance',JSON.stringify(sub));
 await p.evaluate(sub=>{FORGE.base='Longsword';FORGE.parts={blade:'Iron',['hilt-and-guard']:'Iron',['grip-wrap']:'Leather'};FORGE.ever=false;FORGE.everForms=[];saveForge();renderForge()},sub);
 await p.check('#fg-ever');await p.waitForFunction(()=>FORGE.ever);
 ok(await p.evaluate(()=>/Put an Everchanging Substance/.test(document.getElementById('content').textContent)),'ticking it asks for an Everchanging Substance');
 ok(await p.evaluate(()=>document.querySelector('#fg-out .btn.primary').disabled),'it cannot be saved without the substance (the core is now required)');
 await p.evaluate(sub=>{FORGE.parts['everchanging-core']=sub.n;saveForge();renderForge()},sub);
 const n=await p.evaluate(()=>forgeResult().forms);ok(n===await p.evaluate(sub=>formsFor(MATS.find(m=>m.n===sub.n)),sub)&&n>=2,'the substance gives '+n+' forms');
 ok(await p.evaluate(n=>document.querySelectorAll('[data-ever-base]').length===n-1,n),'one template search per extra form');
 // form 2: a Spear (iron point carries over; the wooden shaft does not)
 await p.fill('[data-ever-base="0"]','Spear');await p.dispatchEvent('[data-ever-base="0"]','change');await p.waitForFunction(()=>(FORGE.everForms[0]||{}).base==='Spear');
 const f2=await p.evaluate(()=>{const e=everParts(0);const x=everResults(forgeResult().forms)[0];return {from:e.from,missing:x.missing,txt:document.getElementById('content').textContent.includes('carries over')}});
 ok(f2.from.point==='Blade'&&f2.txt,'the iron blade carries over to the spear\'s point: '+JSON.stringify(f2.from));
 ok(!f2.missing.length,'a spear needs nothing new: the iron hilt is a good shaft too');
 // form 3: a Shortbow (no iron or leather makes good limbs): needs a material added
 await p.fill('[data-ever-base="1"]','Shortbow');await p.dispatchEvent('[data-ever-base="1"]','change');await p.waitForFunction(()=>(FORGE.everForms[1]||{}).base==='Shortbow');
 const f3=await p.evaluate(()=>everResults(forgeResult().forms)[1].missing);ok(f3.includes('Limbs'),'the shortbow\'s limbs need a material (nothing carries over): '+f3.join(', '));
 await p.evaluate(()=>{const ss=BASES.Shortbow.slots.find(s=>s.id==='string'),st=MATS.find(m=>!m.gen&&slotFit(ss,m).lv==='good');FORGE.everForms[1].parts={limbs:'Yew',string:st.n};FORGE.everForms[0].parts={shaft:'Oak'};saveForge();renderForge()});
 const x2=await p.evaluate(()=>{const x=everResults(forgeResult().forms)[0];return {missing:x.missing,dmg:x.r.damage,added:x.added.map(m=>m.n)}});ok(!x2.missing.length&&x2.added.includes('Oak'),'a player can still choose their own material for a form (Oak shaft, '+x2.dmg+')');
 const x3=await p.evaluate(()=>{const x=everResults(forgeResult().forms)[1];return {missing:x.missing,dmg:x.r.damage,fit:x.r.parts.map(p=>p.s.name+':'+p.fit.lv)}});ok(!x3.missing.length,'adding Yew limbs completes form 3 ('+x3.dmg+'; '+x3.fit.join(', ')+')');
 if(vw.width===390)await p.screenshot({path:process.env.S+'/forge-390.png'});else{await p.evaluate(()=>document.querySelector('[data-ever-base]').scrollIntoView({block:'center'}));await p.screenshot({path:process.env.S+'/forge-1300.png'})}
 await p.evaluate(()=>{FORGE.name='Test Shifter '+innerWidth;saveForge();renderForge();saveDesign()});
 const d=await p.evaluate(()=>DESIGNS.find(x=>/^Test Shifter/.test(x.n)));ok(d&&d.forms.length>=2&&d.forms[1].n==='Spear'&&d.forms[1].parts.shaft==='Oak'&&d.mats.includes('Oak'),'the saved design keeps form 2 and its Oak shaft');
 await p.evaluate(()=>{FORGE={base:'Club',parts:{},showAll:false,realm:''};saveForge();loadDesign(DESIGNS.findIndex(x=>/^Test Shifter/.test(x.n)))});
 ok(await p.evaluate(()=>FORGE.ever&&FORGE.everForms[0].base==='Spear'&&FORGE.everForms[0].parts.shaft==='Oak'),'loading the design brings back Everchanging and its forms');
 // armor has no checkbox
 await p.evaluate(()=>{FORGE.base='Breastplate';FORGE.parts={};saveForge();renderForge()});ok(await p.evaluate(()=>!document.getElementById('fg-ever')),'armor has no Everchanging checkbox');
 await p.evaluate(()=>localStorage.clear());await p.close()}
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
