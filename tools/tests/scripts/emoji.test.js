// No colour emoji on the site: every emoji in the code and data has a game-icons symbol (or is left out where the browser
// draws the text), and pages, the DM's views, a character sheet, the combat tracker, an item's window and the menus show
// none once drawn
const {chromium}=require('../pw.js');const path=require('path'),fs=require('fs');
(async()=>{let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const root=process.argv[2];
// emoji drawn as text, not pictures: arrows, ticks, stars, typographic dingbats, box and keyboard marks
const TEXT=new Set([...'←→↑↓↔↕⇄⇅↺↻↩↪↶↷↗↘▲▼◀▶►◄▸▾▴◂■□▪▫●○◆◇◦★☆✓✔✕✖✗✘⌫⌘⏎✦✧✎☽✠❖♛♆✪❂✺❦✶☐◌⌈⌉⌊⌋⌖▢△⟡']);
const RX=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u;
const ART=JSON.parse(fs.readFileSync(path.join(root,'data/art.js'),'utf8').trim().replace(/^const ART=/,'').replace(/;$/,'')),SYM=new Set(Object.keys(ART.sym||{}).map(k=>k.replace(/️/g,'')));
const files=['app.js','data/core.js','data/vault.js','data/spells.js','data/vault-details.js'].map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]);
const miss={};for(const [f,t] of files)for(const ch of t)if(RX.test(ch)&&!TEXT.has(ch)&&!SYM.has(ch))(miss[ch]=miss[ch]||new Set()).add(f);
ok(!Object.keys(miss).length,'every emoji in the code and data has a symbol: '+(Object.entries(miss).map(([c,s])=>c+' ('+[...s].join(', ')+')').join(' ')||'all '+SYM.size+' mapped'));
const b=await chromium.launch();const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());
const scan=()=>p.evaluate(()=>{const RX=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u,TX='←→↑↓↔↕⇄⇅↺↻↩↪↶↷↗↘▲▼◀▶►◄▸▾▴◂■□▪▫●○◆◇◦★☆✓✔✕✖✗✘⌫⌘⏎✦✧✎☽✠❖♛♆✪❂✺❦✶☐◌⌈⌉⌊⌋⌖▢△⟡',out=[];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode,par=n.parentElement;if(!par||par.closest('script,style,textarea'))continue;const ch=[...n.data].filter(c=>RX.test(c)&&!TX.includes(c));if(ch.length)out.push(ch.join('')+' in "'+n.data.trim().slice(0,40)+'"')}
  document.querySelectorAll('[title],[placeholder]').forEach(e=>['title','placeholder'].forEach(a=>{const v=e.getAttribute(a)||'',ch=[...v].filter(c=>RX.test(c)&&!TX.includes(c));if(ch.length)out.push(ch.join('')+' in '+a+' "'+v.slice(0,40)+'"')}));
  const t=[...document.title].filter(c=>RX.test(c)&&!TX.includes(c));if(t.length)out.push(t.join('')+' in the tab title');return out});
// dice-table.html is a finished page of its own (tools/app/dice-table/), kept as delivered: its buttons use emoji by design
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.html')&&f!=='404.html'&&f!=='dice-table.html');let found=[];
for(const pg of pages){await p.goto('file://'+path.resolve(root,pg));await p.waitForTimeout(1200);await p.evaluate(()=>{try{HC=HC||[]}catch(e){}try{if(typeof render==='function')render()}catch(e){}});await p.waitForTimeout(400);(await scan()).forEach(x=>found.push(pg+': '+x))}
ok(!found.length,'no emoji on any of '+pages.length+' pages, with the DM\'s views on '+found.slice(0,8).join(' | '));
// a sheet, the combat tracker, an item's window, the menus
await p.goto('file://'+path.resolve(root,'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(600);
let more=await p.evaluate(()=>{PARTY.length=0;const c=genFill({cls:'Artificer',level:25}).c;c.id='e1';PARTY.push(c,genFill({cls:'Wizard',level:25}).c);saveParty();SHEET_ID='e1';renderSheet();return 1});await p.waitForTimeout(400);found=(await scan()).map(x=>'sheet: '+x);
await p.goto('file://'+path.resolve(root,'combat.html'));await p.waitForTimeout(1500);await p.evaluate(()=>{CB.list=[];cbAddParty();const m=MONSTERS.find(x=>x.sb);CB.list.push(monCombatant(m,0));CB.list[0].cond=['Poisoned','Prone'];saveCB();renderCombat()});await p.waitForTimeout(400);(await scan()).forEach(x=>found.push('combat: '+x));
await p.goto('file://'+path.resolve(root,'blueprints.html'));await p.waitForTimeout(2000);await p.evaluate(()=>{const x=BPS.find(b=>b.mats&&b.mats.length);openItem(x)});await p.waitForTimeout(500);(await scan()).forEach(x=>found.push('item window: '+x));
await p.evaluate(()=>document.querySelectorAll('nav button, .nav button, [aria-haspopup]').forEach(x=>{try{x.click()}catch(e){}}));await p.waitForTimeout(300);(await scan()).forEach(x=>found.push('menus: '+x));
ok(!found.length,'no emoji on a sheet, in the combat tracker, an item\'s window or the menus '+found.slice(0,8).join(' | '));
ok(!errs.length,'no errors '+errs.slice(0,3).join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
