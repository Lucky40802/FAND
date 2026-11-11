const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8858,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
await ctx.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.party','[]');localStorage.removeItem('fand.genopts')});
const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
await p.goto('http://127.0.0.1:8858/chargen.html');await p.waitForTimeout(1300);
ok(await p.evaluate(()=>!!$('gen-level')&&+$('gen-level').max===MAX_LEVEL),'there is a Level box (1 to '+'MAX_LEVEL)');
// a level 10 wizard
const w=await p.evaluate(()=>{const g=genFill({cls:'Wizard',level:10,method:'std'}),c=g.c,base=genFill({cls:'Wizard',level:1,method:'std'}).c;const nsp=Object.values(c.spells||{}).flat().length,n1=Object.values(base.spells||{}).flat().length;
  return {lv:c.level,hp:c.hpMax,hp1:base.hpMax,sub:c.sub,subOk:SUBS.some(x=>x.n===c.sub&&x.par==='Wizard'),nsp,n1,int:c.abil.int,int1:base.abil.int,todo:(c.lvTodo||[]).length,mast:(c.schools||[]).reduce((a,x)=>a+x.m,0),hiSpell:Math.max(...Object.keys(c.spells||{}).map(Number)),log:(c.log||[]).slice(-1)[0],hpNow:c.hp,cw:typeof CW==='undefined'||CW===null,lvl:typeof LVL==='undefined'||LVL===null}});
ok(w.lv===10&&w.hp>w.hp1+9&&w.hpNow===w.hp,'level 10 Wizard: level 10, hit points grew ('+w.hp1+' → '+w.hp+'), at full health');
ok(w.subOk,'it has a Wizard subclass ('+w.sub+')');
ok(w.nsp-18>=w.n1-1&&w.nsp-18<=w.n1+1,'it learned 2 spells a level (18 more: '+w.nsp+' in all; a people can add a cantrip)');
ok(w.mast===10&&w.hiSpell>=2,'one school point a level ('+w.mast+'), reaching level '+w.hiSpell+' spells');
ok(w.int>=w.int1+2,'ability score improvements raised Intelligence ('+w.int1+' → '+w.int+')');
ok(w.todo===0&&/level 10/.test(w.log.deed),'no leftover level-up checklist, and a log line ('+w.log.deed+')');
ok(w.cw&&w.lvl,'the builder and the level-up window are untouched');
// a level 20 fighter: no spells, a style, seven improvements
const f=await p.evaluate(()=>{const c=genFill({cls:'Fighter',race:CW_RACE[0][0],level:20}).c,b=genFill({cls:'Fighter',race:CW_RACE[0][0],level:1}).c;const sum=o=>ABIL.reduce((a,[k])=>a+(+o[k]||0),0);return {lv:c.level,style:c.style,sp:Object.values(c.spells||{}).flat().length,gain:sum(c.abil)-sum(b.abil),sub:!!c.sub,max:Math.max(...ABIL.map(([k])=>c.abil[k]))}});
ok(f.lv===20&&f.style&&f.sp===0&&f.sub,'level 20 Fighter: style, subclass, no spells');
ok(f.gain>=11&&f.gain<=14&&f.max<=20,'seven ability score improvements (+'+f.gain+' total, best '+f.max+', never above 20)');
// level 100, all classes: complete and quick
const t=await p.evaluate(()=>{const t0=performance.now(),bad=[];Object.keys(CW_CLASS).forEach(k=>{const c=genFill({cls:k,level:100}).c;if(c.level!==100||!(c.hpMax>100)||!c.sub)bad.push(k)});return {ms:Math.round(performance.now()-t0),bad}});
ok(!t.bad.length,'every class reaches level 100 complete '+t.bad.join(','));ok(t.ms<15000,'13 level-100 characters in '+t.ms+' ms');
// the page: level 7 random, card shows it
await p.evaluate(()=>{$('gen-level').value='7';$('gen-cls').value='Cleric'});await p.evaluate(()=>document.querySelector('.gen-go').click());await p.waitForTimeout(400);
const card=await p.evaluate(()=>({t:$('gen-card').innerText,tune:[...document.querySelectorAll('#gen-card button')].some(b=>/Fine-tune/.test(b.textContent)),lv:CGEN.c.level}));
ok(card.lv===7&&/Level 7/i.test(card.t)&&/Levels/i.test(card.t)&&/Cantrips/i.test(card.t),'the card says level 7, how the levels were made, and spells by level');
ok(!card.tune,'Fine-tune (a level 1 builder) is hidden above level 1');
await p.screenshot({path:S+'/genlvl.png',fullPage:true});
// a bad level falls back
await p.evaluate(()=>{$('gen-level').value='500'});await p.evaluate(()=>genGo());ok(await p.evaluate(()=>CGEN.c.level===1&&$('gen-level').value==='1'),'a level outside 1 to 100 falls back to 1');
// keep a level 12 and open it on the sheet
await p.evaluate(()=>{$('gen-level').value='12';genGo();genKeep()});await p.waitForTimeout(200);
await p.goto('http://127.0.0.1:8858/sheet.html');await p.waitForTimeout(1500);
const sh=await p.evaluate(()=>({lv:PARTY[0].level,txt:document.body.innerText}));ok(sh.lv===12&&/12/.test(sh.txt),'a kept level 12 character opens on the sheet at level 12');
// the sheet's own Level up still works on it
await p.evaluate(()=>{levelUp(PARTY[0],'Test');lvlSkip()});await p.waitForTimeout(200);ok(await p.evaluate(()=>PARTY[0].level===13),'the sheet\'s Level up still works (12 → 13)');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
