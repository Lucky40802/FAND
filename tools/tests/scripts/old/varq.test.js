const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8811,r));const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8811/forge.html');await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{const n=Object.values(PROC).reduce((a,L)=>a+L.length,0);const NEW=['brained','scaled','smoked','felted','waxed','bog','steambent','charred','petrified','tinctured','candied','patterned','casehard','blued','gilded','granulated','scrimshaw','bonemeal','lacquered','honed','carved','powdered','glazed','tumbled','attuned','cleaved','fermented','clotted','infused','crystallized','diluted','volatile','calibrated','greased'];
   const found={},dupes=[];Object.entries(PROC).forEach(([k,L])=>{const seen=new Set();L.forEach(v=>{const lab=lc(v[5]||v[1]);if(seen.has(lab)||seen.has(v[0]))dupes.push(k+':'+v[0]);seen.add(lab);seen.add(v[0])})});
   // which new variants some real material can take, and does its name resolve to a working material
   const reach={},resolve={};MATS.forEach(m=>{if(m.variant||m.gen)return;procList(m).forEach(v=>{if(!NEW.includes(v[0])||reach[v[0]])return;reach[v[0]]=m.n;const vm=findMat(varName(m,v));resolve[v[0]]=!!(vm&&vm.prep===v[0]&&vm.price>=(m.price||0))})});
   const Q=FQUIRKS;let gap=[],cover=new Array(101).fill(0);Q.forEach(q=>{for(let d=q[0];d<=q[1];d++)cover[d]++});for(let d=41;d<=100;d++)if(cover[d]!==1)gap.push(d);for(let d=1;d<=40;d++)if(cover[d])gap.push(d);
   let none=0,god=0,names=new Set();for(let i=0;i<20000;i++){const q=fqQuirk();if(!q.n)none++;else names.add(q.n);if(q.god)god++}
   return {n,newCount:NEW.filter(k=>Object.values(PROC).some(L=>L.some(v=>v[0]===k))).length,dupes,unreached:NEW.filter(k=>!reach[k]),badResolve:Object.keys(resolve).filter(k=>!resolve[k]),quirks:Q.length,gap,none:none/20000,god:god/20000,names:names.size}});
 ok(r.newCount===34,'34 new variants added ('+r.newCount+'), '+r.n+' in all');ok(!r.dupes.length,'no variant repeats a key or name in its group '+r.dupes.join(','));
 ok(!r.unreached.length,'every new variant fits at least one real material '+(r.unreached.join(',')||''));ok(!r.badResolve.length,'each prepared name works as a material (dearer, marked prepared) '+r.badResolve.join(','));
 ok(r.quirks===18&&!r.gap.length,'18 quirks cover 41–100 exactly once, nothing on 1–40 '+r.gap.slice(0,5));ok(Math.abs(r.none-0.40)<0.02,'no quirk about 40% of the time ('+r.none.toFixed(3)+')');ok(r.god>0.03&&r.god<0.05,'a god notices about 4% ('+r.god.toFixed(3)+')');ok(r.names===18,'every quirk can come up ('+r.names+')');
 // a new variant changes a fit: steam-bent wood on a flex part, petrified wood is bad on flex
 const f=await p.evaluate(()=>{const w=MATS.find(m=>!m.variant&&procList(m).some(v=>v[0]==='petrified'));const s={kind:'flex',role:'structure',name:'Limb'};const poor={lv:'poor',why:''},good={lv:'good',why:''};
   return {up:procFit(s,w,poor,'steambent').lv,down:procFit(s,w,good,'petrified').lv}});ok(f.up==='good'&&f.down==='poor','steam-bent fixes a poor flex part; petrified spoils a good one');
 // the quirk table shows under How the Forge works
 const t=await p.evaluate(()=>{const d=[...document.querySelectorAll('summary')].find(x=>/quirk table/.test(x.textContent));if(!d)return '';d.parentElement.open=true;d.parentElement.parentElement.closest('details').open=true;return d.parentElement.innerText});
 console.log('   TABLE:',t.slice(0,300).replace(/\n/g,' | '));ok(/1–40/.test(t)&&/Twin-forged/.test(t)&&/A god notices/.test(t)&&/god marks it/.test(t),'quirk table shown in How the Forge works');
 // the Preparation bench offers a new variant and prepares it
 await p.evaluate(()=>{const m=MATS.find(x=>!x.variant&&procList(x).some(v=>v[0]==='brained'));PARTY.push({id:'pp',name:'Tess',level:5,abil:{},gear:[],inv:[[m.n,2]]});saveParty();PREP.who='pp';PREP.pick[lc(m.n)]='brained';window._m=m.n;prepDo(m.n,1)});
 const inv=await p.evaluate(()=>PARTY.find(c=>c.id==='pp').inv);ok(inv.some(x=>/Brain-Tanned/.test(x[0])&&x[1]===1)&&inv.some(x=>x[1]===1&&!/\(/.test(x[0])),'the bench turns one hide into a Brain-Tanned one: '+JSON.stringify(inv));
 const mv=await p.evaluate(()=>{const v=findMat(PARTY.find(c=>c.id==='pp').inv.find(x=>/Brain/.test(x[0]))[0]);return v&&v.ds});ok(/supple as cloth/.test(mv||''),'the prepared material says what it is');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
