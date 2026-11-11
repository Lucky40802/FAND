const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8784,r));const b=await chromium.launch();
 for(const vp of [{width:1200,height:850},{width:390,height:844}]){
 const p=await b.newPage({viewport:vp});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8784/index.html');await p.waitForSelector('.stats');
 ok(!(await p.isVisible('#gd')),vp.width+': guide does not pop up under automation');
 await p.evaluate(()=>openGuide(0));ok(await p.isVisible('#gd h3:has-text("Welcome")'),'guide opens on Welcome');
 await p.screenshot({path:(process.env.S||'.')+'/'+'guide1-'+vp.width+'.png'});
 await p.click('#gd [data-gr="player"]');ok(await p.evaluate(()=>role()==='player'&&GSTEP===1),'choosing a role sets it and moves on');
 ok(await p.isVisible('#gd-ring'),'step 2 rings the search button');await p.screenshot({path:(process.env.S||'.')+'/'+'guide2-'+vp.width+'.png'});
 await p.click('#gd [data-gn]');await p.click('#gd [data-gn]');await p.click('#gd [data-gn]');ok(await p.isVisible('#gd [data-gn]:has-text("Done")'),'last step says Done');
 await p.click('#gd [data-gn]');ok(!(await p.isVisible('#gd'))&&await p.evaluate(()=>store.get('guided')),'Done closes and remembers');
 await p.evaluate(()=>{openGuide(0)});await p.keyboard.press('Escape');ok(!(await p.isVisible('#gd')),'Escape closes the guide');
 await p.goto('http://127.0.0.1:8784/help.html');await p.waitForSelector('#help-trouble');ok((await p.$$('.set-sec.help')).length===10,'Help page has 10 sections');
 ok(await p.isVisible('#help-trouble >> text=Check for updates'),'troubleshooting explains updates');
 await p.click('#help-start button');ok(await p.isVisible('#gd'),'Help can replay the guide');await p.keyboard.press('Escape');
 await p.screenshot({path:(process.env.S||'.')+'/'+'help-'+vp.width+'.png'});
 await p.evaluate(()=>localStorage.clear());await p.close()}
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
