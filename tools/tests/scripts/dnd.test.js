const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8828,r));const b=await chromium.launch();
 const setup=async(role)=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(r=>{try{if(r)localStorage.setItem('fand.role',JSON.stringify(r));localStorage.removeItem('fand.forge')}catch(e){}},role);
  const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8828/forge.html');await p.waitForTimeout(1200);await p.evaluate(()=>{HC=HC||[]});
  // a smith with the materials for a battleaxe
  await p.evaluate(()=>{const iron=MATS.find(m=>/Iron Ingot/.test(m.n))||MATS.find(m=>matCode(m)==='O'&&m.realm==='Human'),wood=MATS.find(m=>matCode(m)==='W'&&m.realm==='Human');
    PARTY.length=0;PARTY.push({id:'c1',name:'Bran',level:12,prof:'Blacksmithing',profLv:6,abil:{str:16},coins:{gp:5000},gear:[],inv:[[iron.n,5],[wood.n,5]]});saveParty();
    FORGE.base='Battleaxe';FORGE.parts={};forgeSlots(BASES.Battleaxe,false).forEach(s=>{if(!s.optional)FORGE.parts[s.id]=s.role==='structure'?wood.n:iron.n});store.set('forge',FORGE);FF.who='c1';renderForge()});
  await p.waitForTimeout(400);return [ctx,p]};
 const est=p=>p.evaluate(()=>(document.querySelector('.fg-est')||{}).innerText||'');
 // a player
 let [ctx,p]=await setup('');let t=await est(p);
 ok(!(await p.$('.fg-est .fg-odds')),'player: no odds bar');ok(!/DC \d+/.test(t)&&!/vs DC/.test(t),'player: no DC shown');
 ok(/(Easy work|Steady work|A fair challenge|Hard work|Beyond their skill)/.test(t)&&/DM calls for a Blacksmithing check/.test(t),'player: the work in words, and the DM calls for the check');
 const opts=await p.$$eval('#ff-smith option',o=>o.map(x=>x.textContent));const groups=await p.$$eval('#ff-smith optgroup',g=>g.map(x=>x.label));
 ok(opts.length<=50&&groups.length>=8,'hire list: '+(opts.length-1)+' named smiths in '+groups.length+' realms (was 100 levels)');ok(!opts.some(o=>/^Level \d/.test(o)||/\(level \d+\)/.test(o)),'player: no levels in the hire list');
 ok(opts.some(o=>/Bram Ashdown/.test(o))&&opts.some(o=>/apprentice/.test(o)),'named masters and apprentices are there: '+opts.slice(1,5).join(' | '));
 const sec=await p.evaluate(()=>[...document.querySelectorAll('section.sec')].find(s=>/Master smiths/.test(s.textContent)).querySelector('.sec-h p').textContent);ok(!/100 ×/.test(sec)&&/takes? commissions/.test(sec),'Master smiths explained in words, no formula');
 // strike three times: the roll shows a total but no DC
 await p.evaluate(()=>{forgeStrike();fmRoll()});await p.waitForTimeout(5200);
 const res=await p.evaluate(()=>(FF.res&&FF.res.html)||(DESIGNS.filter(d=>d.forged).slice(-1)[0]||{forged:{}}).forged.line||'');ok(/rolls/.test(res)&&!/vs DC/.test(res),'player: roll shows the total, not the DC: '+res.replace(/<[^>]+>/g,'').slice(0,80));
 await ctx.close();
 // the toggle brings the numbers back
 [ctx,p]=await setup('');await p.evaluate(()=>{FORGE.nums=true;store.set('forge',FORGE);renderForge()});await p.waitForTimeout(300);t=await est(p);
 ok(!!(await p.$('.fg-est .fg-odds'))&&/DC \d+/.test(t),'Show the numbers: odds and DC come back');ok((await p.$$eval('#ff-smith option',o=>o.map(x=>x.textContent))).some(o=>/\(level \d+\)/.test(o)),'Show the numbers: levels in the hire list');
 await ctx.close();
 // the DM's view shows the numbers by itself
 [ctx,p]=await setup('dm');t=await est(p);ok(!!(await p.$('.fg-est .fg-odds'))&&/DC \d+/.test(t),'DM view: numbers shown by default');await ctx.close();
 // a smith hired by an old saved level still works
 [ctx,p]=await setup('');await p.evaluate(()=>{FF.smith=13;FF.who='c1';forgeOut()});await p.waitForTimeout(200);ok(await p.$eval('#ff-smith',s=>s.value==='13'),'an old saved smith level (13) still shows and works');await ctx.close();
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
