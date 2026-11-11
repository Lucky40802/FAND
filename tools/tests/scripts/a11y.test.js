const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8851,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
await ctx.addInitScript(()=>{localStorage.setItem('fand.role',JSON.stringify('dm'));localStorage.setItem('fand.guided','1')});
const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
await p.goto('http://127.0.0.1:8851/bestiary.html');await p.waitForTimeout(1500);
const act=()=>p.evaluate(()=>{const a=document.activeElement;return a?(a.id||a.className||a.tagName)+'|'+(a.textContent||'').trim().slice(0,30):''});
// skip link is the first thing Tab reaches
await p.keyboard.press('Tab');const s1=await act();ok(/skip/.test(s1),'first Tab lands on Skip to the page ('+s1+')');
await p.keyboard.press('Enter');await p.waitForTimeout(100);ok(/^content/.test(await act()),'Enter jumps to the page content');
// toast is announced
ok(await p.evaluate(()=>$('toast').getAttribute('role')==='status'&&$('toast').getAttribute('aria-live')==='polite'),'messages are announced (role=status, polite)');
// menu by keyboard
await p.evaluate(()=>document.querySelector('.navg .tab').focus());await p.keyboard.press('Enter');await p.waitForTimeout(200);
const m1=await p.evaluate(()=>document.activeElement.getAttribute('role'));ok(m1==='menuitem','Enter on a menu group opens it and focuses the first entry');
const firstTxt=await p.evaluate(()=>document.activeElement.textContent);await p.keyboard.press('ArrowDown');const secondTxt=await p.evaluate(()=>document.activeElement.textContent);
await p.keyboard.press('ArrowUp');const back=await p.evaluate(()=>document.activeElement.textContent);ok(firstTxt!==secondTxt&&back===firstTxt,'arrow keys move through the menu');
await p.keyboard.press('Escape');await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('navpop').classList.contains('open')&&document.activeElement.classList.contains('tab')),'Escape closes the menu and returns to its button');
// modal focus management
await p.evaluate(()=>document.querySelector('#content .card').focus());await p.keyboard.press('Enter');await p.waitForTimeout(400);
ok(await p.evaluate(()=>$('mbg').classList.contains('open')&&$('mbg').contains(document.activeElement)),'opening a card moves focus into the detail page');
let inside=true;for(let i=0;i<40;i++){await p.keyboard.press('Tab');if(!(await p.evaluate(()=>$('mbg').contains(document.activeElement)))){inside=false;break}}ok(inside,'Tab stays inside the detail page (40 presses)');
for(let i=0;i<5;i++)await p.keyboard.press('Shift+Tab');ok(await p.evaluate(()=>$('mbg').contains(document.activeElement)),'Shift+Tab stays inside too');
await p.keyboard.press('Escape');await p.waitForTimeout(300);ok(await p.evaluate(()=>!$('mbg').classList.contains('open')&&document.activeElement.classList.contains('card')),'closing hands focus back to the card that opened it');
// combat input labels
await p.goto('http://127.0.0.1:8851/combat.html');await p.waitForTimeout(1300);await p.evaluate(()=>{$('cb-add').value='Goblin';$('cb-n').value=1;cbAddMon()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>[...document.querySelectorAll('#content table input, #content table select')].every(x=>x.getAttribute('aria-label')||x.labels&&x.labels.length)),'every box in the combat tracker has a label');
// quick card focus return
await p.evaluate(()=>document.querySelector('.cbtile').focus());await p.keyboard.press('Enter');await p.waitForTimeout(200);ok(await p.evaluate(()=>$('qcard').contains(document.activeElement)),'the quick card takes focus');
await p.keyboard.press('Escape');await p.waitForTimeout(150);ok(await p.evaluate(()=>document.activeElement.classList.contains('cbtile')),'closing it returns focus to the tile');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
