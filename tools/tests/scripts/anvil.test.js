const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8853,r));const b=await chromium.launch();
const setup=async(motion)=>{const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',reducedMotion:motion||'reduce'});await ctx.addInitScript(()=>{localStorage.setItem('fand.role',JSON.stringify('dm'));localStorage.removeItem('fand.forge');localStorage.setItem('fand.forgeSound','false')});
  const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8853/forge.html');await p.waitForTimeout(1200);
  await p.evaluate(()=>{HC=HC||[];const iron=MATS.find(m=>/Iron Ingot/.test(m.n))||MATS.find(m=>matCode(m)==='O'&&m.realm==='Human'),wood=MATS.find(m=>matCode(m)==='W'&&m.realm==='Human');
    PARTY.length=0;PARTY.push({id:'c1',name:'Bran',level:12,prof:'Blacksmithing',profLv:6,abil:{str:16},coins:{gp:5000},gear:[],inv:[[iron.n,9],[wood.n,9]]});saveParty();
    FORGE.base='Battleaxe';FORGE.parts={};forgeSlots(BASES.Battleaxe,false).forEach(s=>{if(!s.optional)FORGE.parts[s.id]=s.role==='structure'?wood.n:iron.n});store.set('forge',FORGE);FF.who='c1';renderForge()});
  await p.waitForTimeout(300);return [ctx,p]};
const txt=p=>p.evaluate(()=>{const o=$('fmo');return o&&!o.hidden?o.innerText:''});
let [ctx,p]=await setup();
ok(await p.evaluate(()=>/Call for the roll/.test(document.querySelector('.fg-strike').textContent)&&!document.querySelector('.fg-strike').disabled),'the anvil button is Call for the roll');
await p.evaluate(()=>document.querySelector('.fg-strike').click());await p.waitForTimeout(200);
let t=await txt(p);const two=await p.evaluate(()=>!!FM.I.mode);
ok(/Bran takes up the hammer/.test(t)&&/roll Blacksmithing/.test(t)&&/d20 [+−]/.test(t)&&/Roll the die/.test(t)&&/We rolled real dice/.test(t),'the anvil scene opens full screen: Bran, what to roll, and both ways to roll');
ok(await p.evaluate(()=>document.activeElement&&document.activeElement.classList.contains('fmo-roll')),'focus is on Roll the die');
await p.screenshot({path:S+'/anvil-call.png'});
// real dice: a natural 20 is a masterwork
const before=await p.evaluate(()=>JSON.stringify(PARTY[0].inv));
await p.evaluate(()=>[...document.querySelectorAll('#fmo button')].find(x=>/real dice/.test(x.textContent)).click());await p.waitForTimeout(150);
ok(await p.evaluate(two=>!!$('fm-d1')&&(!!$('fm-d2'))===two,two),'real dice: one box'+(two?' per die (advantage/disadvantage: two)':''));
await p.evaluate(()=>{$('fm-d1').value='25'});await p.evaluate(()=>fmReal());ok(await p.evaluate(()=>FM.step==='real'),'a number outside 1 to 20 is refused');
await p.evaluate(()=>{$('fm-d1').value='20';if($('fm-d2'))$('fm-d2').value='20';fmReal()});await p.waitForTimeout(1200);
t=await txt(p);const made=await p.evaluate(()=>{const d=DESIGNS.filter(x=>x.forged).slice(-1)[0];return d?{n:d.n,q:d.forged.q,gear:PARTY[0].gear.includes(d.n)}:null});
ok(/A masterwork!/.test(t)&&made&&made.q==='Masterwork'&&made.gear,'a natural 20 on real dice: "A masterwork!", made and in Bran\'s gear ('+(made&&made.n)+')');
ok(await p.evaluate(b=>JSON.stringify(PARTY[0].inv)!==b,before),'the materials are used');
ok(/goes into Bran's gear/.test(t)&&/See the item/.test(t),'the reveal says where it went');
await p.screenshot({path:S+'/anvil-done.png'});
await p.evaluate(()=>[...document.querySelectorAll('#fmo button')].find(x=>/See the item/.test(x.textContent)).click());await p.waitForTimeout(200);ok(await p.evaluate(()=>$('fmo').hidden),'See the item closes the scene');
// a natural 1 cracks the metal
await p.evaluate(()=>{renderForge();forgeStrike();FM.step='real';fmDraw()});await p.waitForTimeout(100);const inv1=await p.evaluate(()=>PARTY[0].inv.reduce((a,x)=>a+x[1],0));
await p.evaluate(()=>{$('fm-d1').value='1';if($('fm-d2'))$('fm-d2').value='1';fmReal()});await p.waitForTimeout(1200);t=await txt(p);
ok(/The metal cracks/.test(t)&&/Try again/.test(t)&&await p.evaluate(n=>PARTY[0].inv.reduce((a,x)=>a+x[1],0)===n-1,inv1),'a natural 1: "The metal cracks", one material lost, Try again offered');
await p.evaluate(()=>[...document.querySelectorAll('#fmo button')].find(x=>/Try again/.test(x.textContent)).click());await p.waitForTimeout(100);ok(/takes up the hammer/.test(await txt(p)),'Try again returns to the call');
await p.keyboard.press('Escape');await p.waitForTimeout(100);ok(await p.evaluate(()=>$('fmo').hidden),'Escape steps away from the anvil');
await ctx.close();
// with motion: the dice tumble, three blows ring out, then the reveal
[ctx,p]=await setup('no-preference');await p.evaluate(()=>{forgeStrike()});await p.waitForTimeout(100);await p.evaluate(()=>fmRoll());await p.waitForTimeout(300);
ok(await p.evaluate(()=>!!document.querySelector('#fmo .fmo-die.spin')),'Roll the die: the dice tumble');
await p.keyboard.press('Escape');ok(await p.evaluate(()=>!$('fmo').hidden),'the scene cannot be dismissed mid-roll');
await p.waitForTimeout(2000);const l1=await p.evaluate(()=>($('fm-line')||{}).textContent||'');ok(await p.evaluate(()=>/rolls/.test(($('fm-roll')||{}).textContent||'')),'the roll stays on screen during the strikes');ok(/blow|strike|Again/i.test(l1),'a hammer blow is narrated: "'+l1+'"');
await p.screenshot({path:S+'/anvil-roll.png'});
await p.waitForTimeout(5200);t=await txt(p);ok(/rolls/.test(t)&&/(masterwork|Fine work|It holds|Flawed|doesn't take|cracks)/i.test(t),'then the result is revealed');
await ctx.close();
// a hired smith rolls for the work
[ctx,p]=await setup();await p.evaluate(()=>{const R=smithRoster(forgeResult().cost);const S=R.find(x=>smithCan(x,forgeBP(forgeResult()),forgeReq(forgeBP(forgeResult()))));FF.smith=String(S.lv);renderForge()});await p.waitForTimeout(200);
await p.evaluate(()=>forgeStrike());await p.waitForTimeout(150);t=await txt(p);ok(/takes Bran's materials/.test(t)&&/Let them work/.test(t)&&!/real dice/.test(t),'a hired smith: they take the materials and roll for the work');
await ctx.close();
// phone
const c2=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});await c2.addInitScript(()=>localStorage.setItem('fand.role',JSON.stringify('dm')));const q=await c2.newPage();await q.goto('http://127.0.0.1:8853/forge.html');await q.waitForTimeout(1200);
await q.evaluate(()=>{HC=HC||[];const iron=MATS.find(m=>/Iron Ingot/.test(m.n))||MATS.find(m=>matCode(m)==='O'&&m.realm==='Human'),wood=MATS.find(m=>matCode(m)==='W'&&m.realm==='Human');PARTY.length=0;PARTY.push({id:'c1',name:'Bran',level:12,prof:'Blacksmithing',profLv:6,abil:{str:16},gear:[],inv:[[iron.n,9],[wood.n,9]]});FORGE.base='Battleaxe';FORGE.parts={};forgeSlots(BASES.Battleaxe,false).forEach(s=>{if(!s.optional)FORGE.parts[s.id]=s.role==='structure'?wood.n:iron.n});FF.who='c1';renderForge();forgeStrike()});await q.waitForTimeout(200);
ok(await q.evaluate(()=>{const r=document.querySelector('.fmo-box').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1}),'phone: the scene fits the screen');await q.screenshot({path:S+'/anvil-phone.png'});
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
