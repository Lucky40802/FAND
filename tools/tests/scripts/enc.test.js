const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
// build a party on the chargen page, then open the encounter builder
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(2000);
await p.evaluate(()=>{PARTY.length=0;['Fighter','Wizard','Cleric','Rogue'].forEach((k,i)=>{const c=genFill({cls:k,level:25}).c;c.name=k;PARTY.push(c)});saveParty();store.set('enc',{size:4,level:25,realm:'Hell',diff:'Medium',list:[]})});
await p.goto('file://'+path.resolve(process.argv[2],'encounter.html'));await p.waitForSelector('#en-out');await p.waitForTimeout(1200);
ok(await p.locator('.enc-check').count()===0,'no party check before an encounter is built');
await p.click('text=Build encounter');await p.waitForTimeout(500);
ok(await p.locator('.enc-check').count()===1,'party check shown');
await p.click('.enc-check summary');const txt=await p.locator('.enc-check').innerText();console.log(txt.replace(/\n+/g,' | ').slice(0,700));
ok(/Fighter/.test(txt)&&/Wizard/.test(txt)&&/rounds|round|never/.test(txt),'rows per character');
ok(/plays like (Trivial|Easy|Medium|Hard|Deadly)/.test(txt),'verdict');
const wiz=await p.evaluate(()=>{const c=PARTY.find(x=>x.cls==='Wizard');return charRound(c,'Hell',13)});console.log('wizard round',JSON.stringify(wiz));ok(wiz.v>0,'wizard best round counts a spell or weapon');
// a weak human-realm encounter for a level 25 party: easier
await p.evaluate(()=>{const st=store.get('enc',{});st.realm='Human';st.list=[['Goblin',2]];store.set('enc',st);encOut()});
const t2=await p.locator('.enc-check summary').innerText();ok(/plays like (Trivial|Easy)/.test(t2)&&/easier than its XP|as its XP says/.test(t2),'goblins vs level 25 party read as trivial or easy: '+t2);
await p.setViewportSize({width:390,height:844});await p.click('.enc-check summary');const sw=await p.evaluate(()=>document.documentElement.scrollWidth);ok(sw<=392,'no sideways scroll on phone '+sw);
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
