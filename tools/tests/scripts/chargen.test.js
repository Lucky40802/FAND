const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8856,r));const b=await chromium.launch();
const mk=async vp=>{const ctx=await b.newContext({viewport:vp||{width:1280,height:900},serviceWorkers:'block',reducedMotion:'reduce'});await ctx.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.party','[]');localStorage.removeItem('fand.genopts')});const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk();
await p.goto('http://127.0.0.1:8856/chargen.html');await p.waitForTimeout(1300);
ok(await p.evaluate(()=>/Character generator/.test(document.body.innerText)&&!!$('gen-cls')&&/No character yet/.test(document.body.innerText)),'the page opens with its choices and an empty card');
ok(await p.evaluate(()=>NAV_GROUPS.some(g=>g[1].includes('chargen'))),'it is in the Play menu');
// 40 fully random characters: every one valid
const many=await p.evaluate(()=>{const bad=[];for(let i=0;i<40;i++){const g=genFill({});const c=g.c;
  const okAb=ABIL.every(([a])=>c.abil[a]>=3&&c.abil[a]<=20);
  if(!c.name||!c.cls||!c.race||!c.bg||!okAb||!(c.hpMax>=1)||!g.cw.langR||!g.cw.langB||!g.cw.prof||(STYLE_AT[c.cls]===1&&!c.style)||(CW_SPELLS[c.cls]&&!(c.schools&&c.spells))||!(c.gear.length+c.inv.length))bad.push(c.cls+'/'+c.race+'/'+c.bg)}return {bad,cw:typeof CW==='undefined'||CW===null}});
ok(!many.bad.length,'40 random characters are all complete (scores, HP, languages, proficiency, style, spells, gear) '+many.bad.slice(0,3).join(' '));
ok(many.cw,'generating leaves the builder untouched');
// choices are respected
await p.evaluate(()=>{$('gen-cls').value='Wizard';$('gen-fam').value=famOf(CW_RACE[0][0]);genFam();$('gen-race').value=CW_RACE[0][0];$('gen-bg').value=CW_BG[0][0];$('gen-method').value='roll';$('gen-name').value='Vessa Coldbrook'});
await p.evaluate(()=>document.querySelector('.gen-go').click());await p.waitForTimeout(300);
const c1=await p.evaluate(()=>({c:CGEN.c,race:CW_RACE[0][0],bg:CW_BG[0][0],txt:$('gen-card').innerText,pic:!!document.querySelector('#gen-card .art svg')}));
ok(c1.c.cls==='Wizard'&&c1.c.race===c1.race&&c1.c.bg===c1.bg&&c1.c.name==='Vessa Coldbrook','the chosen class, people, background and name are used');
ok(/Vessa Coldbrook/.test(c1.txt)&&/Level 1/i.test(c1.txt)&&/Hit points/i.test(c1.txt)&&/Spells/i.test(c1.txt)&&/Equipment/i.test(c1.txt)&&/Personality/i.test(c1.txt)&&c1.pic,'the card shows the whole character, with a class picture');
ok(await p.evaluate(()=>PARTY.length===0),'nothing is saved before Keep');
// reroll keeps the name, new name changes it
await p.evaluate(()=>genGo(true));await p.waitForTimeout(200);ok(await p.evaluate(()=>CGEN.c.name==='Vessa Coldbrook'&&CGEN.c.cls==='Wizard'),'Reroll keeps the name and the chosen class');
await p.evaluate(()=>genName());ok(await p.evaluate(()=>CGEN.c.name!=='Vessa Coldbrook'&&!!CGEN.c.name),'New name gives a new name');
await p.screenshot({path:S+'/chargen.png',fullPage:true});
// keep
const nm=await p.evaluate(()=>CGEN.c.name);await p.evaluate(()=>genKeep());await p.waitForTimeout(200);
ok(await p.evaluate(n=>PARTY.length===1&&PARTY[0].name===n&&store.get('party',[]).length===1,nm),'Keep adds the character to the party');
// it opens on the sheet
await p.goto('http://127.0.0.1:8856/sheet.html');await p.waitForTimeout(1300);ok(await p.evaluate(n=>new RegExp(n).test(document.body.innerText),nm),'the kept character opens on the sheet');
// party page link
await p.goto('http://127.0.0.1:8856/party.html');await p.waitForTimeout(1200);ok(await p.evaluate(()=>[...document.querySelectorAll('[data-go="chargen"]')].some(b=>/Generate one/.test(b.textContent))),'Party page has Generate one');
await ctx.close();
[ctx,p]=await mk({width:390,height:844});await p.goto('http://127.0.0.1:8856/chargen.html');await p.waitForTimeout(1300);await p.evaluate(()=>genGo());await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'phone: no sideways scroll');await p.screenshot({path:S+'/chargen-phone.png',fullPage:true});
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
