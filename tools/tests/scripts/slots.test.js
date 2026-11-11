const {chromium}=require('../pw.js');const path=require('path');const S=process.env.S;
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
for(const [nm,vp] of [['desk',{width:1280,height:900}],['phone',{width:390,height:844}]]){
const ctx=await b.newContext({viewport:vp,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>{const c={id:'s1',name:'Tess',cls:'Fighter',level:5,abil:{str:16,dex:12,con:14},hpMax:44,hp:44,gear:['Plate Armor','Iron Gauntlets','Shield','Longsword','Shortbow','Arcane Focus','Lucky Coin'],inv:[]};PARTY=[c];SHEET_ID='s1';SHEET_TAB='gear';saveParty();renderSheet()});await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const t=document.getElementById('content').innerText;const slot=n=>{const el=[...document.querySelectorAll('.sh-slot')].find(x=>x.querySelector('.sh-slotn').textContent.toLowerCase()===n.toLowerCase());return el?el.innerText.replace(/\s+/g,' '):''};
 return {boxes:['WEAPONS','ARMOUR','EQUIPMENT'].map(x=>t.toUpperCase().includes(x)),groups:PARTY[0].gear.map(n=>n+':'+gearGroup(n)),body:slot('Body'),hands:slot('Hands'),back:slot('Back'),off:slot('Off hand'),head:slot('Head'),handsUsed:(t.match(/Hands in use: (\d+)/)||[])[1],inputs:['gear-n-weapon','gear-n-armor','gear-n'].map(i=>!!document.getElementById(i))}});
if(nm==='desk')console.log(JSON.stringify(r,null,0));
ok(r.boxes.every(Boolean),nm+': three boxes');
ok(/Plate Armor/.test(r.body)&&/covered by Plate Armor/.test(r.back)&&/Iron Gauntlets/.test(r.hands)&&/no AC: covered/.test(r.hands)&&/Shield/.test(r.off)&&/empty/.test(r.head),nm+': armour slots, covered slots, empty slots');
ok(r.groups.join()==='Plate Armor:armor,Iron Gauntlets:armor,Shield:armor,Longsword:weapon,Shortbow:weapon,Arcane Focus:equip,Lucky Coin:equip',nm+': items sorted');
ok(r.handsUsed==='4',nm+': hands counted (sword 1-2, bow 2, shield 1) = '+r.handsUsed);
ok(r.inputs.every(Boolean),nm+': an Equip field in each box');
await p.fill('#gear-n-armor','Iron Helm');await p.click('#gear-n-armor ~ button');await p.waitForTimeout(200);
ok(await p.evaluate(()=>PARTY[0].gear.includes('Iron Helm')&&[...document.querySelectorAll('.sh-slot')].some(x=>/head/i.test(x.querySelector('.sh-slotn').textContent)&&/Iron Helm/.test(x.innerText))),nm+': equipping into Armour fills the Head slot');
await p.fill('#gear-n','Dagger');await p.click('#gear-n ~ button');await p.waitForTimeout(200);
ok(await p.evaluate(()=>gearGroup('Dagger')==='weapon'&&PARTY[0].gear.includes('Dagger')),nm+': the general field still takes anything and sorts it');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),nm+': no sideways scroll');
await p.screenshot({path:S+'/slots-'+nm+'.png',fullPage:true});
await p.evaluate(()=>{PARTY_SEL='s1';go('party')});await p.waitForTimeout(1200);
ok(await p.evaluate(()=>/Weapons/.test(document.body.innerText)&&/Armour/.test(document.body.innerText)),nm+': Party page groups the gear');
ok(!errs.length,nm+': no errors '+errs.join(';'));await ctx.close()}
console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
