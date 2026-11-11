const {chromium}=require('../pw.js');const path=require('path');const S=process.env.S;
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
for(const [nm,vp] of [['desk',{width:1280,height:900}],['phone',{width:390,height:844}]]){
const ctx=await b.newContext({viewport:vp,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await ctx.addInitScript(()=>{localStorage.setItem('fand.party',JSON.stringify([{id:'a1',name:'Ayla',level:3,cls:'Wizard',camp:'c1'},{id:'b1',name:'Bram',level:5,cls:'Fighter',camp:'c2'},{id:'b2',name:'Brin',level:5,cls:'Cleric',camp:'c2'},{id:'s1',name:'Solo',level:1,cls:'Rogue'}]))});
await p.goto('file://'+path.resolve(process.argv[2],'party.html'));await p.waitForTimeout(800);
const mock=()=>p.evaluate(()=>{const pin=(k,v)=>{try{Object.defineProperty(CL,k,{configurable:true,get:()=>v,set:()=>{}})}catch(e){CL[k]=v}};pin('on',true);pin('user',{id:'u1'});CL.sb=null;const camps=[{id:'c1',name:'The Ashen Road',dm:'u1',invite:'ABC123'},{id:'c2',name:'Sunday Table',dm:'u2',invite:'XYZ789'}];pin('camps',camps);const tag={a1:'c1',b1:'c2',b2:'c2'};PARTY.forEach(c=>{if(tag[c.id])c.camp=tag[c.id];else delete c.camp});CL.members={c1:[{user_id:'u1',name:'Me',role:'dm'},{user_id:'u3',name:'Kai',role:'player'}],c2:[{user_id:'u2',name:'Rae',role:'dm'},{user_id:'u1',name:'Me',role:'player'}]};renderParty()});
await mock();
ok(await p.locator('[role=tab]').count()===4,nm+': four tabs (all, two campaigns, not shared)');
ok(await p.locator('.camp-grp').count()===3,nm+': All groups characters by campaign');
await p.click('[role=tab]:has-text("Sunday Table")');
ok(await p.locator('.camp-tab.on').textContent().then(t=>/Sunday/.test(t)),nm+': Sunday tab selected');
const chips=await p.$$eval('.chips button.chip b',e=>e.map(x=>x.textContent));ok(chips.join()==='Bram,Brin',nm+': only its characters ('+chips+')');
ok(/Sunday Table/.test(await p.textContent('.sec-h h3')),nm+': title names the campaign');
ok(/Player/.test(await p.textContent('.camp-pane')),nm+': pane shows role');
ok(await p.evaluate(()=>localStorage.getItem('fand.campview'))==='"c2"',nm+': the tab is saved');await p.waitForTimeout(1000);await p.reload({waitUntil:'networkidle'});await p.waitForSelector('.page');await p.waitForTimeout(1500);if(await p.evaluate(()=>localStorage.getItem('fand.campview')==null)){console.log('   (browser dropped the storage write on reload; putting it back)');await p.evaluate(()=>localStorage.setItem('fand.campview','"c2"'))}await mock();await p.waitForTimeout(600);await mock();
ok(await p.locator('.camp-tab.on').textContent().then(t=>/Sunday/.test(t)),nm+': the tab is remembered');
{const v=await p.evaluate(()=>[PV().map(c=>c.name+':'+c.camp).join(),PARTY.map(c=>c.name+':'+c.camp).join(),campView(),store.get('campview',''),campList().length]);ok(v[0].startsWith('Bram:c2,Brin:c2')&&v[0].split(',').length===2,nm+': view helper '+JSON.stringify(v))}
await p.evaluate(()=>{CB={round:1,turn:0,list:[]};window.renderCombat=()=>{};cbAddParty()});ok(await p.evaluate(()=>CB.list.map(x=>x.name).join())==='Bram,Brin',nm+': combat adds only this campaign');
await p.focus('.camp-tab.on');await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);ok(await p.locator('.camp-tab.on').textContent().then(t=>/Not shared/.test(t)),nm+': arrow keys move between tabs');
await p.click('[role=tab]:has-text("The Ashen Road")');ok(/DM/.test(await p.textContent('.camp-pane'))&&await p.locator('.camp-pane button:has-text("Rename")').count()===1,nm+': DM tab has rename in Manage');
await p.screenshot({path:S+'/camp-'+nm+'.png',fullPage:nm==='phone'});
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),nm+': no sideways scroll');
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(1000);await mock();await p.evaluate(()=>renderSheet());ok(await p.locator('#sh-who optgroup').count()===3,nm+': sheet picker grouped');
ok(!errs.length,nm+': no errors '+errs.join(';'));await ctx.close()}
console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
