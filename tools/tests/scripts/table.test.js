const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8797,r));const b=await chromium.launch();
 for(const vp of [{width:390,height:844},{width:844,height:390}]){const p=await b.newPage({viewport:vp,hasTouch:true,isMobile:true});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8797/sheet.html');await p.waitForFunction(()=>typeof PARTY!=='undefined');
 await p.evaluate(()=>{PARTY.push({id:'t1',name:'Rhea',cls:'Fighter',level:3,hp:20,hpMax:24,gear:[],inv:[],abil:{}});saveParty();SHEET_ID='t1';store.set('dicesound',false);store.set('combat',{round:2,turn:0,list:[{id:'a',name:'Rhea',init:15,hp:20,max:24,ac:14,cond:[]},{id:'b',name:'Goblin',init:12,hp:7,max:7,ac:13,cond:[]}]});renderSheet()});
 await p.tap('button:has-text("Table screen")');await p.waitForSelector('#tbl .tbl-hpn');ok(/20/.test(await p.textContent('.tbl-hpn')),vp.width+'x'+vp.height+': table screen shows big HP');
 await p.tap('[data-th="-5"]');ok(await p.evaluate(()=>PARTY.find(x=>x.id==='t1').hp===15),'−5 works');
 await p.screenshot({path:(process.env.S||'.')+'/'+'table-'+vp.width+'.png'});
 await p.tap('[data-tr="1d20"]');await p.waitForSelector('#dice-ov.on');ok(true,'d20 rolls');await p.evaluate(()=>$('dice-ov').classList.remove('on'));
 await p.tap('[data-tt="init"]');ok(/Round 2/.test(await p.textContent('#tbl'))&&await p.isVisible('.tbl-init li.cur'),'initiative view');await p.tap('[data-tnext]');ok(await p.evaluate(()=>store.get('combat').turn===1),'Next turn advances');
 await p.screenshot({path:(process.env.S||'.')+'/'+'table-init-'+vp.width+'.png'});
 await p.tap('[data-tx]');ok(!(await p.isVisible('#tbl')),'close');
 await p.evaluate(()=>localStorage.clear());await p.close()}
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
