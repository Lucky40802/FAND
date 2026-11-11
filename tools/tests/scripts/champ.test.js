const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8787,r));const b=await chromium.launch();
 for(const vw of [{width:1200,height:850},{width:390,height:844}]){
 const p=await b.newPage({viewport:vw});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 console.log('-- '+vw.width);
 await p.goto('http://127.0.0.1:8787/bestiary.html');await p.waitForFunction(()=>typeof MONSTERS!=='undefined'&&typeof champion==='function');
 // every monster and class makes a valid champion
 const all=await p.evaluate(()=>{let bad=[],n=0;MONSTERS.forEach(m=>{if(!m.sb)return;champClasses().forEach(c=>{const x=champion(m,c);n++;const j=JSON.stringify(x.sb);if(/undefined|NaN|\{DC\}|\{MOD\}|\{L/.test(j)||!(x.sb.hp>m.sb.hp)||!(x.sb.xp>=m.sb.xp))bad.push(x.n)})});return {n,bad:bad.slice(0,5),nb:bad.length}});
 ok(all.nb===0,'all '+all.n+' monster × class champions are valid '+(all.nb?JSON.stringify(all.bad):''));
 const w=await p.evaluate(()=>{const m=MON_IDX.get('wolf'),c=champion(m,'Fighter');return {n:c.n,hp:[m.sb.hp,c.sb.hp],ac:[m.sb.ac,c.sb.ac],cr:[m.sb.cr,c.sb.cr],tr:c.sb.tr.map(t=>t[0]),hit:c.sb.ac2.map(a=>a[1].slice(0,40)),look:MON_IDX.get('wolf, fighter champion')===c}});
 console.log('  ',JSON.stringify(w));ok(w.look,'MON_IDX finds "Wolf, Fighter Champion"');ok(w.tr[0].startsWith('Champion (Fighter'),'first trait names the class');
 const wiz=await p.evaluate(()=>champion(MON_IDX.get('adult red dragon'),'Wizard').sb.tr.map(t=>t[0]+': '+t[1].slice(0,160)));ok(wiz.some(t=>/^Spellcasting/.test(t)),'a Wizard champion casts spells');console.log('   '+wiz.slice(0,4).join('\n   '));
 // Bestiary window picker
 await p.evaluate(()=>openItem(MON_IDX.get('wolf')));await p.waitForSelector('#mon-champ');
 await p.selectOption('#mon-champ','Rogue');ok(/Wolf, Rogue Champion/.test(await p.textContent('#mon-sb'))&&/Sneak Attack/.test(await p.textContent('#mon-sb')),'picking Rogue shows the champion block with Sneak Attack');
 await p.click('#modal .qa button:has-text("Add to encounter")');ok(await p.evaluate(()=>(store.get('enc',{}).list||[]).some(x=>x[0]==='Wolf, Rogue Champion')),'Add to encounter adds the champion');
 await p.click('#modal .qa button:has-text("Add to combat")');ok(await p.evaluate(()=>store.get('combat',{list:[]}).list.some(x=>x.mon==='Wolf, Rogue Champion'&&x.max>MON_IDX.get('wolf').sb.hp)),'Add to combat adds the champion with its HP');
 if(vw.width===390)await p.screenshot({path:process.env.S+'/champ-390.png',fullPage:false});else{await p.evaluate(()=>document.getElementById('mon-champ').scrollIntoView());await p.screenshot({path:process.env.S+'/champ-1200.png'})}
 await p.evaluate(()=>hideModal());
 // Encounter: star a row, champion rows open their class
 await p.goto('http://127.0.0.1:8787/encounter.html');await p.waitForSelector('#en-out');
 await p.evaluate(()=>{const st=store.get('enc',{});st.list=[['Goblin',3]];store.set('enc',st);encOut()});
 await p.click('#en-out [title^="Make one of these a champion"]');const L=await p.evaluate(()=>store.get('enc',{}).list);ok(L.length===2&&L[0][1]===2&&/^Goblin, \w+ Champion( · .+)?$/.test(L[1][0]),'★ turns one goblin into a champion '+JSON.stringify(L));
 await p.click('#en-out [data-champ]');await p.waitForSelector('#mon-champ');ok(await p.evaluate(()=>CUR.n==='Goblin'&&!!CHAMP_SEL&&document.getElementById('mon-champ').value===CHAMP_SEL),'a champion row opens the monster with its class picked');
 await p.evaluate(()=>hideModal());
 await p.check('#en-champ');await p.evaluate(()=>{document.getElementById('en-realm').value='Human';document.getElementById('en-diff').value='Hard'});await p.click('button:has-text("Build encounter")');
 ok(await p.evaluate(()=>(store.get('enc',{}).list||[]).some(x=>/ Champion( · |$)/.test(x[0]))),'Lead with a champion builds one in');
 await p.click('button:has-text("Send to combat")');await p.waitForURL(/combat/);await p.waitForFunction(()=>typeof CB!=='undefined'&&CB);
 ok(await p.evaluate(()=>document.querySelectorAll('#content [data-champ]').length>0),'combat tracker links champions');
 await p.evaluate(()=>localStorage.clear());await p.close();}
 // creator
 const p=await b.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await p.goto('http://127.0.0.1:8787/tools.html');await p.waitForFunction(()=>typeof sbMake==='function');
 const t=await p.evaluate(()=>{const x=sbMake({kind:'named',realm:'Human',cr:'6',body:'beast',champ:'Paladin',seed:3});return x.m.sb.tr.map(t=>t[0]).join(', ')});
 ok(/Divine Smite/.test(t),'stat block creator gives a named monster Paladin features: '+t);
 await p.evaluate(()=>localStorage.clear());
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
