// Class damage riders on the level-band table (Rage, Divine Smite, Hunter's Mark, Hex, Martial Arts + Flurry), Action
// Surge in the Party check, every class in the Balance report, enemy class dice by realm
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(900);
const R=await p.evaluate(()=>{const t=(cls,level)=>classRiders({cls,level}).map(r=>r.n+' '+r.txt).join(', ');return {b5:t('Barbarian',5),b25:t('Barbarian',25),p25:t('Paladin',25),m25:t('Monk',25),r25:t('Ranger',25),w25:t('Warlock',25),f:t('Fighter',25)}});
ok(R.b5==='Rage +2','level 5 Rage keeps its plain +2: '+R.b5);ok(R.b25==='Rage 24d4','level 25 Rage: 4d4 × 6 = '+R.b25);
ok(R.p25==='Divine Smite 12d8, Improved Divine Smite 6d8','Paladin smites × 6: '+R.p25);ok(R.m25==='Martial Arts 12d10','Monk Martial Arts 2d10 × 6: '+R.m25);
ok(R.r25==="Hunter's Mark 6d6"&&R.w25==='Hex 6d6','Hunter\'s Mark and Hex × 6');ok(R.f==='','Fighters have no rider');
const C=await p.evaluate(()=>{const monk=charRound({cls:'Monk',level:25,abil:{dex:18},gear:[]},'Hell',10),f=charRound({cls:'Fighter',level:25,abil:{str:18},gear:['Longsword']},'Hell',10),f1=charRound({cls:'Fighter',level:1,abil:{str:18},gear:['Longsword']},'Human',0);return {monk,f,f1}});
ok(C.monk.v>0&&/Flurry of Blows/.test(C.monk.how),'an unarmed Monk still has a round, with Flurry of Blows: '+JSON.stringify(C.monk));
ok(C.f.surge===2&&Math.abs(C.f.burst-2*C.f.v)<1e-6&&C.f1.burst===0,'Action Surge: two extra rounds from level 17, none at level 1');
const sh=await p.evaluate(()=>{PARTY.length=0;PARTY.push({id:'r',name:'Grum',level:25,cls:'Barbarian',abil:{str:18},gear:['Greataxe','Longbow']});SHEET_ID='r';saveParty();renderSheet();return document.getElementById('content').textContent});
ok((sh.match(/Rage \+24d4/g)||[]).length===1,'the sheet offers Rage on the melee weapon only');ok(/At level 25: 24d4 on each melee hit while raging/.test(sh),'the Rage feature shows its dice');
// enemies
await p.goto('file://'+path.resolve(process.argv[2],'npcs.html'));await p.waitForTimeout(2000);
const E=await p.evaluate(()=>{const sb=sbMake({kind:'npc',cls:'Rogue',level:95,realm:'Primordial',seed:3}).m.sb,sa=sb.tr.find(t=>t[0]==='Sneak Attack');const m=MONSTERS.find(x=>x.sb&&x.realm==='Hell'),ch=champion(m,'Rogue',{fresh:true}),cs=ch.sb.tr.find(t=>t[0]==='Sneak Attack');return [sa&&sa[1],cs&&cs[1],m.n]});
ok(/100d6/.test(E[0]),'a level 95 enemy Rogue in the Primordial Realm: 100d6 (× 10, like its spells) '+E[0]);ok(/× 3 for its realm/.test(E[1]||''),'a Hell champion\'s class dice × 3: '+E[1]);
// Balance report: every class
await p.goto('file://'+path.resolve(process.argv[2],'encounter.html'));await p.waitForTimeout(2500);await p.click('#en-bal summary');await p.click('text=Run the report');
await p.waitForFunction(()=>document.querySelectorAll('#en-bal-out details tbody tr').length>=8,null,{timeout:180000});
const T=await p.evaluate(()=>{const tb=document.querySelector('#en-bal-out details table');return {cols:[...tb.querySelectorAll('th')].map(t=>t.textContent),last:[...tb.querySelectorAll('tbody tr')].pop().textContent}});
ok(T.cols.length===14&&T.cols.includes('Monk')&&T.cols.includes('Artificer'),'Every class table has all 13 classes');ok(!/never/.test(T.last),'every class can kill the Primordial monster: '+T.last);
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
