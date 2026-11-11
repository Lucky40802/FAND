const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8834,r));const b=await chromium.launch();
 const mk=async(role)=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(r=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');if(r)localStorage.setItem('fand.role',JSON.stringify(r));
   localStorage.setItem('fand.party',JSON.stringify([{id:'a',name:'Bran',level:5,abil:{},gear:[],inv:[],purse:{Human:10},god:'Ares'},{id:'b',name:'Tess',level:5,abil:{},gear:[],inv:[],purse:{Human:0}}]))},role);
   const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
 let [ctx,p]=await mk('dm');
 // ── Spoils ──
 await p.goto('http://127.0.0.1:8834/combat.html');await p.waitForTimeout(1200);
 await p.evaluate(()=>{const m=MONSTERS.find(x=>x.realm==='Human'&&(x.drops||[]).length&&x.sb&&x.sb.xp>=200);store.set('combat',{round:1,turn:0,list:[monCombatant(m,1),monCombatant(m,2)]});window._mon=m.n;renderCombat()});
 ok(await p.evaluate(()=>/Spoils open here when every monster is down/.test(document.body.innerText)),'spoils wait until the fight is over');
 await p.evaluate(()=>{CB.list.forEach(x=>x.hp=0);saveCB();renderCombat()});
 const sp=await p.evaluate(()=>({txt:(()=>{const e=document.querySelector('.spoils');if(!e)return '';const c=e.cloneNode(true);c.querySelectorAll('g-sym[aria-label]').forEach(g=>g.replaceWith(g.getAttribute('aria-label')));document.body.appendChild(c);const t=c.innerText;c.remove();return t})(),S:CB.spoils}));
 ok(!!sp.S&&/Spoils/.test(sp.txt)&&/Among the fallen/.test(sp.S.line),'all down: the Spoils panel opens with a line to read: '+(sp.S&&sp.S.line).slice(0,110));
 ok(sp.S&&sp.S.coins.n>0&&['pouch','chest','hoard'].includes(['pouch','chest','hoard'][sp.S.sz]),'haul has coin ('+(sp.S&&sp.S.coins.n)+' '+(sp.S&&sp.S.coins.pl)+') and a size ('+['pouch','chest','hoard'][sp.S&&sp.S.sz]+')');
 ok(/🔪/.test(sp.txt)&&/scavenge each body/.test(sp.txt),'corpses listed for scavenging, not given free');
 // split coins
 const before=await p.evaluate(()=>PARTY.map(c=>+(c.purse||{}).Human||0));await p.evaluate(()=>spoilsSplit());
 const after=await p.evaluate(()=>({p:PARTY.map(c=>+(c.purse||{}).Human||0),left:CB.spoils.left,n:CB.spoils.coins.n,log:PARTY[0].log}));
 ok(after.p[0]+after.p[1]-before[0]-before[1]===after.n&&after.left===0,'Split: all '+after.n+' coins shared (Bran '+before[0]+'→'+after.p[0]+', Tess '+before[1]+'→'+after.p[1]+')');
 ok((after.log||[]).some(x=>/Spoils from the .* fight/.test(x.deed)),'each character logs the spoils');
 // give a material (or item) to Tess via the select
 const hasMat=await p.evaluate(()=>CB.spoils.mats.length+CB.spoils.items.length);
 if(hasMat){const k=await p.evaluate(()=>CB.spoils.mats.length?'mats':'items');await p.selectOption(`[data-spgive="${k}:0"]`,'b');await p.waitForTimeout(300);
   const g=await p.evaluate(k=>({to:CB.spoils[k][0].to,inv:PARTY.find(c=>c.id==='b').inv,n:CB.spoils[k][0].n}),k);ok(g.to==='b'&&g.inv.some(x=>x[0]===g.n||x[0].startsWith(g.n)),'Give: '+g.n+' went into Tess\'s pack');}
 else ok(true,'(no materials this roll)');
 // a player doesn't see the spoils tool
 await ctx.close();[ctx,p]=await mk('player');await p.goto('http://127.0.0.1:8834/combat.html');await p.waitForTimeout(900);
 await p.evaluate(()=>{const m=MONSTERS.find(x=>x.realm==='Human'&&x.sb);store.set('combat',{round:1,turn:0,list:[Object.assign(monCombatant(m,0),{hp:0})]});renderCombat()});ok(!(await p.$('.spoils')),'player view: no Spoils tool');
 // Tools page treasure still works off the shared roller
 await p.goto('http://127.0.0.1:8834/tools.html');await p.waitForTimeout(800);await p.evaluate(()=>{const b=document.getElementById('l-go');if(b)b.click()});await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/About .* in all/.test((document.getElementById('l-out')||{}).textContent||'')),'Tools page treasure roller still works');
 await ctx.close();
 // encounter preview
 [ctx,p]=await mk('dm');await p.goto('http://127.0.0.1:8834/encounter.html');await p.waitForTimeout(900);await p.evaluate(()=>rollEncounter());await p.waitForTimeout(200);await p.evaluate(()=>encSpoils());
 ok(await p.evaluate(()=>/Likely spoils/.test(document.getElementById('en-spoils').textContent)),'encounter builder previews spoils');
 // ── Standing ──
 await p.goto('http://127.0.0.1:8834/party.html');await p.waitForTimeout(900);
 const st0=await p.evaluate(()=>(document.querySelector('details.panel')||{}).innerText||'');ok(/Standing/.test(st0)&&/Ares/.test(st0)&&/Friendly/.test(st0),'a god with a contract shows at Friendly by itself');
 await p.evaluate(()=>{HC=HC||[];ST_PICK='tower:Evocation';renderParty()});await p.fill('#st-why','Recovered the Thunderhall\'s lost tome');await p.evaluate(()=>standGo(1));await p.waitForTimeout(200);
 const st1=await p.evaluate(()=>PARTY.map(c=>standOf(c,'tower:Evocation')));ok(st1.every(v=>v===1),'raise for the whole party: both Friendly with the Thunderhall');
 await p.evaluate(()=>{$('st-f').value='tower:Evocation';$('st-who').value='a';$('st-why').value='Insulted the archmage'});await p.evaluate(()=>standGo(-1));await p.evaluate(()=>{$('st-f').value='tower:Evocation';$('st-who').value='a';$('st-why').value='Burned a library'});await p.evaluate(()=>standGo(-1));await p.evaluate(()=>{$('st-f').value='tower:Evocation';$('st-who').value='a'});await p.evaluate(()=>standGo(-1));await p.evaluate(()=>{$('st-f').value='tower:Evocation';$('st-who').value='a'});await p.evaluate(()=>standGo(-1));
 const st2=await p.evaluate(()=>[standOf(PARTY[0],'tower:Evocation'),standOf(PARTY[1],'tower:Evocation'),PARTY[0].standingLog.length]);ok(st2[0]===-2&&st2[1]===1,'one character lowered alone, and it stops at Hostile ('+st2.join(', ')+')');
 // a faction of your own
 await p.evaluate(()=>{$('st-fn').value='House Varrow';$('st-fk').value='Noble house';standNewFaction()});await p.evaluate(()=>{$('st-f').value='f:house-varrow';$('st-why').value='Saved the heir'});await p.evaluate(()=>standGo(1));
 ok(await p.evaluate(()=>PARTY.every(c=>standOf(c,'f:house-varrow')===1)&&/House Varrow/.test(document.body.innerText)),'a faction of your own works');
 // sheet box and Magic Tower cue
 await p.evaluate(()=>{SHEET_ID='a';go('sheet')});await p.waitForTimeout(500);await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Page 2: Details');if(b)b.click()});await p.waitForTimeout(400);const sh=await p.evaluate(()=>document.body.innerText);
ok(/Standing/i.test(sh)&&/Thunderhall/.test(sh)&&/Hostile/i.test(sh),'character sheet shows Standing');if(!/Thunderhall/.test(sh))console.log('DBG',JSON.stringify(sh.slice(0,1200)));
 await p.goto('http://127.0.0.1:8834/magic.html');await p.waitForTimeout(800);ok(await p.evaluate(()=>/standing here/.test(document.body.innerText)),'Magic Tower page shows the party\'s standing');
 // Forge: master's task raises the smiths
 await p.goto('http://127.0.0.1:8834/forge.html');await p.waitForTimeout(900);await p.evaluate(()=>{if(typeof HC!=='undefined'&&!HC&&TAB==='forge'){HC=[];renderForge()}}).catch(()=>{});await p.waitForTimeout(200);await p.evaluate(()=>{FF.smith=10;FF.who='a';renderForge()});await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/Task done: raise the Human smiths/.test(document.body.innerText)),'Forge offers to raise the smiths after a master\'s task');
 await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Task done: raise the Human smiths/.test(b.textContent)).click());await p.waitForTimeout(200);
 ok(await p.evaluate(()=>PARTY.every(c=>standOf(c,'smith:Human')===1)),'pressing it raises the Human smiths to Friendly');
 await ctx.close();
 // player: reads standing, can't change it
 [ctx,p]=await mk('player');await p.goto('http://127.0.0.1:8834/party.html');await p.waitForTimeout(900);ok(!(await p.$('#st-f'))&&/Standing/.test(await p.evaluate(()=>document.body.innerText)),'player view: standing shown, no controls');
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
