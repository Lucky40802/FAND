const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8788,r));const b=await chromium.launch();
 for(const vw of [{width:1200,height:850},{width:390,height:844}]){
 const p=await b.newPage({viewport:vw});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 console.log('-- '+vw.width);
 await p.goto('http://127.0.0.1:8788/bestiary.html');await p.waitForFunction(()=>typeof MONSTERS!=='undefined'&&typeof champion==='function');
 const all=await p.evaluate(()=>{let bad=[],n=0;const ms=MONSTERS.filter(m=>m.sb).filter((m,i)=>i%7===0);ms.forEach(m=>champClasses().forEach(c=>champSubs(c).forEach(s=>{const x=champion(m,c,{sub:s.n});n++;const j=JSON.stringify(x.sb);if(/undefined|NaN|\{DC\}/.test(j)||MON_IDX.get(lc(x.n))!==x)bad.push(x.n)})));return {n,nb:bad.length,bad:bad.slice(0,4)}});
 ok(all.nb===0,all.n+' monster × class × subclass champions are valid and found by name '+(all.nb?JSON.stringify(all.bad):''));
 const r=await p.evaluate(()=>{const m=MON_IDX.get('goblin'),c=champion(m,'Rogue',{sub:'Assassin'});return {n:c.n,tr:c.sb.tr.map(t=>t[0]),L:c.champ.L}});console.log('   '+JSON.stringify(r));
 ok(r.L>=3&&r.tr.some(t=>/\(Assassin/.test(t)),'a goblin Rogue (Assassin) champion has Assassin features at level 3+');
 // fake an unlocked hidden class list
 await p.evaluate(()=>{HC=[{n:'Test Shadow',tier:'Epic',base:'Rogue',blurb:'A test hidden class.',features:[[1,'Shade Step','Once per short rest, it teleports 30 feet.'],[7,'Gloom Veil','It is invisible in dim light.'],[14,'Night Lord','z']]},{n:'Wizard Only',tier:'Unique',base:'Wizard',features:[]}]});
 await p.evaluate(()=>openItem(MON_IDX.get('wolf')));await p.waitForSelector('#mon-champ');
 ok(!(await p.$('#mon-champ-sub')),'no subclass box before a class is picked');
 await p.selectOption('#mon-champ','Rogue');await p.waitForSelector('#mon-champ-sub');await p.selectOption('#mon-champ-sub','Assassin');
 const hcOpts=await p.$$eval('#mon-champ-hc option',o=>o.map(x=>x.value));ok(hcOpts.includes('Test Shadow')&&!hcOpts.includes('Wizard Only'),'hidden class list shows only classes for a Rogue '+JSON.stringify(hcOpts));
 await p.selectOption('#mon-champ-hc','Test Shadow');const t=await p.textContent('#mon-sb');
 ok(/Wolf, Rogue Champion · Assassin ✦ Test Shadow/.test(t)&&/Shade Step/.test(t)&&/Assassin/.test(t),'stat block shows the subclass and hidden class features');
 await p.click('#modal .qa button:has-text("Add to encounter")');const L=await p.evaluate(()=>store.get('enc',{}).list);ok(L.some(x=>x[0]==='Wolf, Rogue Champion · Assassin ✦ Test Shadow'),'Add to encounter keeps subclass and hidden class '+JSON.stringify(L));
 if(vw.width===390)await p.screenshot({path:process.env.S+'/champ2-390.png'});else{await p.evaluate(()=>document.getElementById('mon-champ-box').scrollIntoView());await p.screenshot({path:process.env.S+'/champ2-1200.png'})}
 await p.evaluate(()=>hideModal());
 await p.goto('http://127.0.0.1:8788/encounter.html');await p.waitForSelector('#en-out');
 // locked: the hidden class is named but sealed
 const sealed=await p.evaluate(()=>{const c=MON_IDX.get(lc('Wolf, Rogue Champion · Assassin ✦ Test Shadow'));return c&&c.sb.tr.find(t=>/Hidden class/.test(t[0]))});ok(sealed&&/Sealed/.test(sealed[1]),'with the list locked the hidden class shows as sealed');
 await p.click('#en-out [data-champ]');await p.waitForSelector('#mon-champ-sub');ok(await p.evaluate(()=>CHAMP_SEL==='Rogue'&&CHAMP_SUB==='Assassin'&&CHAMP_HC==='Test Shadow'),'opening the champion row restores class, subclass, and hidden class');
 await p.evaluate(()=>hideModal());
 await p.evaluate(()=>{const st=store.get('enc',{});st.list=[['Orc',4]];store.set('enc',st);encOut()});for(let i=0;i<4;i++)await p.click('#en-out [title^="Make one of these a champion"]');
 ok(await p.evaluate(()=>(store.get('enc',{}).list||[]).filter(x=>/Champion/.test(x[0])).every(x=>!!MON_IDX.get(lc(x[0])))),'random ★ champions (with subclasses) resolve: '+JSON.stringify(await p.evaluate(()=>store.get('enc',{}).list.map(x=>x[0]))));
 await p.evaluate(()=>localStorage.clear());await p.close();}
 const p=await b.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});
 await p.goto('http://127.0.0.1:8788/tools.html');await p.waitForFunction(()=>typeof sbMake==='function');
 const t=await p.evaluate(()=>sbMake({kind:'boss',realm:'Human',cr:'9',body:'beast',champ:'Cleric',champSub:'Life Domain',seed:3}).m.sb.tr.map(t=>t[0]).join(', '));
 ok(/Life Domain/.test(t),'stat block creator gives a boss a champion subclass: '+t.slice(0,200));
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
