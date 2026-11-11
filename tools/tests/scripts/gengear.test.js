const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8860,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
await ctx.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.party','[]');localStorage.removeItem('fand.genopts')});
const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
await p.goto('http://127.0.0.1:8860/chargen.html');await p.waitForTimeout(1300);
// level 1: kit unchanged
ok(await p.evaluate(()=>{const c=genFill({cls:'Fighter',level:1}).c;return !c.genGear&&c.gear.includes('Plain Longsword')}),'level 1 keeps the starting kit');
// level 30 fighter: same designs, levels near 30 and never above
const f=await p.evaluate(()=>{const k=genFill({cls:'Fighter',level:1}).c,c=genFill({cls:'Fighter',level:30}).c,G=c.genGear,bp=n=>BPS.find(b=>b.n===n);
  const kitGens=k.gear.map(n=>bp(n)).filter(x=>x&&genOf(x)).map(genOf).sort(),newGens=c.gear.filter(n=>!G.arts.includes(n)).map(bp).filter(x=>x&&genOf(x)).map(genOf).sort();
  return {up:G.up.map(n=>[n,bp(n).lv,genOf(bp(n))]),same:JSON.stringify(kitGens)===JSON.stringify(newGens),maxLv:Math.max(...G.up.map(n=>bp(n).lv)),minLv:Math.min(...G.up.map(n=>bp(n).lv)),pots:G.pots.length,arts:G.arts.length,artOk:G.arts.every(n=>bp(n).cat==='Artifact'&&bp(n).lv<=30),potOk:G.pots.every(n=>bp(n).cat==='Potion'&&bp(n).lv<=30&&c.inv.some(x=>x[0]===n)),gp:c.coins.gp,kgp:k.coins.gp,pack:c.gear.includes("Dungeoneer's Pack")}});
ok(f.up.length>=3&&f.same,'level 30 Fighter: weapons and armor upgraded to the same designs ('+f.up.map(x=>x[0]+' '+x[2]+' lv'+x[1]).join(', ')+')');
ok(f.maxLv<=30&&f.minLv>=1,'upgrades are never above the character\'s level (levels '+f.minLv+' to '+f.maxLv+')');
ok(f.pots===4&&f.potOk&&f.arts===2&&f.artOk,'4 potions in the pack and 2 artifacts, all at or below level 30');
ok(f.gp===f.kgp+27610&&f.pack,'gold for level 30 in Hell (27,610 gp) more, and the pack and tools stay');
// closeness: designs with versions near the level land within 9 levels when possible
const near=await p.evaluate(()=>{let hit=0,n=0;for(let i=0;i<20;i++){const c=genFill({cls:'Fighter',level:40}).c;c.genGear.up.forEach(nm=>{const b=BPS.find(x=>x.n===nm),vs=BP_BY_GEN().get(genOf(b)).filter(v=>v.lv<=40&&(b.cat!=='Armor'||(armorPiece(v).weight===armorPiece(b).weight&&armorPiece(v).slot===armorPiece(b).slot))),top=Math.max(...vs.map(v=>v.lv));n++;if(b.lv>=Math.min(top,40)-9)hit++})}return [hit,n]});
ok(near[0]===near[1],'every upgrade is within 9 levels of the best version available ('+near[0]+'/'+near[1]+')');
// every class at 20 and 100: no errors, gear present
const all=await p.evaluate(()=>{const bad=[];Object.keys(CW_CLASS).forEach(k=>[20,100].forEach(L=>{const c=genFill({cls:k,level:L}).c;if(!c.genGear||c.gear.some(n=>{const b=BPS.find(x=>x.n===n);return b&&b.lv>L}))bad.push(k+L)}));return bad});
ok(!all.length,'every class at levels 20 and 100 gets gear, none above their level '+all.join(','));
// armor keeps its weight: a rogue's light armor stays light, a fighter's heavy armor stays heavy
const wt=await p.evaluate(()=>{const bad=[];for(let i=0;i<15;i++)['Rogue','Fighter','Cleric','Ranger'].forEach(k=>{const kit=genFill({cls:k,level:1}).c,c=genFill({cls:k,level:25}).c,w=g=>g.map(n=>BPS.find(b=>b.n===n)).filter(b=>b&&b.cat==='Armor').map(b=>armorPiece(b).weight).sort().join();if(w(kit.gear)!==w(c.gear.filter(n=>!c.genGear.arts.includes(n))))bad.push(k+':'+w(kit.gear)+'→'+w(c.gear))});return bad});
ok(!wt.length,'armor keeps its weight (light stays light, heavy stays heavy) '+wt.slice(0,3).join(' '));
// the card
await p.evaluate(()=>{$('gen-cls').value='Rogue';$('gen-level').value='15';genGo()});await p.waitForTimeout(300);
const t=await p.evaluate(()=>({txt:$('gen-card').innerText,refs:document.querySelectorAll('#gen-card [data-ref]').length}));
ok(/Equipment\s+for level 15/i.test(t.txt)&&/Weapons and armor/i.test(t.txt)&&/Potions/i.test(t.txt)&&/Artifacts/i.test(t.txt)&&/level \d+/i.test(t.txt)&&t.refs>=4,'the card lists the gear by kind, with levels, each opening its page ('+t.refs+' links)');
await p.evaluate(()=>document.querySelector('#gen-card [data-ref]').click());await p.waitForTimeout(300);ok(await p.evaluate(()=>$('mbg').classList.contains('open')),'an item opens its own page');
await p.evaluate(()=>closeModal());await p.screenshot({path:S+'/gengear.png',fullPage:true});
// kept: gear on the sheet
await p.evaluate(()=>genKeep());await p.waitForTimeout(200);const kept=await p.evaluate(()=>({g:PARTY[0].gear,i:PARTY[0].inv}));
await p.goto('http://127.0.0.1:8860/sheet.html');await p.waitForTimeout(1500);ok(await p.evaluate(g=>g.filter(n=>BPS.find(b=>b.n===n&&b.cat!=='Storage')).slice(0,2).every(n=>document.body.innerText.includes(n)),kept.g),'the kept character\'s gear shows on the sheet');
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
