const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8852,r));const b=await chromium.launch();
const mk=async role=>{const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});await ctx.addInitScript(r=>{localStorage.setItem('fand.role',JSON.stringify(r));localStorage.removeItem('fand.forge')},role);const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
const prep=p=>p.evaluate(()=>{const iron=MATS.find(m=>/Iron Ingot/.test(m.n))||MATS.find(m=>matCode(m)==='O'&&m.realm==='Human'),wood=MATS.find(m=>matCode(m)==='W'&&m.realm==='Human');
  PARTY.length=0;PARTY.push({id:'c1',name:'Bran',level:12,prof:'Blacksmithing',profLv:6,abil:{str:16},gear:[],inv:[[iron.n,9],[wood.n,9]]});saveParty();
  FORGE.base='Battleaxe';FORGE.parts={};forgeSlots(BASES.Battleaxe,false).forEach(s=>{if(!s.optional)FORGE.parts[s.id]=s.role==='structure'?wood.n:iron.n});store.set('forge',FORGE);FF.who='c1';renderForge()});
let [ctx,p]=await mk('player');
// the Shop stays locked
await p.goto('http://127.0.0.1:8852/shop.html');await p.waitForTimeout(1300);ok(await p.evaluate(()=>/run by the DM/.test(document.body.innerText)&&!!document.querySelector('#hc-form,#hc-pat,#hc-pin')),'Shop: locked for players');
// the Forge: planning view
await p.goto('http://127.0.0.1:8852/forge.html');await p.waitForTimeout(1300);await prep(p);await p.waitForTimeout(300);
const v=await p.evaluate(()=>{const t=document.body.innerText,e=(document.querySelector('.fg-est')||{}).innerText||'';return {pv:/Player view/.test(t),dmBtn:[...document.querySelectorAll('button')].some(b=>/I'm the DM/.test(b.textContent)),design:!!$('fg-find'),parts:!!document.querySelector('.fg-est'),
  ready:/Ready for the forge/.test(e)&&/Show your DM/.test(e),words:/(Easy work|Steady work|A fair challenge|Hard work|Beyond their skill)/.test(e),mats:/Materials from the party/i.test(e),
  roll:!!document.querySelector('.fg-strike'),hire:!!$('ff-smith'),dc:/DC \d+/.test(e),nums:/Show the numbers/.test(e),smelt:/Smelter/.test(t)&&!!document.querySelector('#content section:not([hidden]) h3')&&[...document.querySelectorAll('#content section.sec:not([hidden]) h3')].some(h=>/Smelter/.test(h.textContent)),
  masters:[...document.querySelectorAll('#content section.sec:not([hidden]) h3')].some(h=>/Master smiths/.test(h.textContent)),board:[...document.querySelectorAll('#content section.sec h3')].some(h=>/Commission board/.test(h.textContent)),combos:/Material combos/.test(t)}});
ok(v.pv&&v.dmBtn,'player: the Forge opens in Player view, with an I\'m the DM button');
ok(v.design&&v.parts&&v.mats,'player: can choose a design and fill parts from the pack');
ok(v.ready&&v.words,'player: sees the work in words and "Ready for the forge: show your DM"');
ok(!v.roll&&!v.hire&&!v.dc&&!v.nums,'player: no roll button, no hire list, no DC, no numbers switch');
ok(!v.smelt&&!v.masters&&!v.board&&v.combos&&await p.evaluate(()=>![...document.querySelectorAll('.fg-jump a')].some(a=>/Master smiths|Smelter|Commission/.test(a.textContent))),'player: no smelter, master smiths or commission board (material combos stay)');
ok(await p.evaluate(()=>{FF.who='c1';fmOpen();return !$('fmo')||$('fmo').hidden}),'player: the anvil scene cannot be opened');
await p.screenshot({path:S+'/forge-player.png'});
const pm=await p.evaluate(()=>navGroups().flatMap(g=>g[1]));ok(pm.includes('forge')&&!pm.includes('shop'),'player menu: Forge back (planning), Shop still out');
// I'm the DM: the lock form appears in place; entering the code (simulated) opens the full Forge
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/I'm the DM/.test(b.textContent)).click());await p.waitForTimeout(200);
ok(await p.evaluate(()=>!!document.querySelector('#fg-lock input,#fg-lock #hc-pat,#fg-lock #hc-pin,#fg-lock button')),'I\'m the DM shows the DM code form in place');
await p.evaluate(()=>{HC=HC||[];renderForge()});await p.waitForTimeout(300);
const f=await p.evaluate(()=>{const t=document.body.innerText;return {pv:/Player view/.test(t),roll:!!document.querySelector('.fg-strike'),hire:!!$('ff-smith'),masters:[...document.querySelectorAll('#content section.sec:not([hidden]) h3')].some(h=>/Master smiths/.test(h.textContent)),board:[...document.querySelectorAll('#content section.sec h3')].some(h=>/Commission board/.test(h.textContent))}});
ok(!f.pv&&f.roll&&f.hire&&f.masters&&f.board,'DM: the full Forge (roll, hire list, master smiths, commission board)');
await p.screenshot({path:S+'/forge-dm.png'});
await ctx.close();
[ctx,p]=await mk('dm');await p.goto('http://127.0.0.1:8852/index.html');await p.waitForTimeout(1300);
const dm=await p.evaluate(()=>{const G=navGroups();return G[0][0]==='DM'&&G[0][1].includes('shop')&&G[0][1].includes('forge')});ok(dm,'DM view: the Shop and the Forge are in the DM group');
await ctx.close();
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
