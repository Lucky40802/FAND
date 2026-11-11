const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8790,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());
 await p.goto('http://127.0.0.1:8790/party.html');await p.waitForFunction(()=>typeof PARTY!=='undefined');
 const mat=await p.evaluate(()=>MATS.find(m=>!m.gen&&m.tr).n),bp=await p.evaluate(()=>BPS[0].n);
 await p.evaluate(([mat])=>{PARTY.push({id:'e1',name:'Eve',level:3,cls:'Fighter',gear:[],inv:[['Healer\'s Kit',1],[mat,2]],abil:{}});saveParty();SHEET_ID='e1'},[mat]);
 await p.goto('http://127.0.0.1:8790/sheet.html#e1');await p.waitForFunction(()=>typeof renderSheet==='function'&&typeof PARTY!=='undefined');await p.evaluate(()=>{SHEET_ID='e1';SHEET_TAB='gear';renderSheet()}).catch(()=>{});
 await p.evaluate(()=>{const t=[...document.querySelectorAll('button.chip')].find(x=>/Equipment/.test(x.textContent));if(t)t.click()});await p.waitForSelector('#gear-n');
 ok(await p.evaluate(()=>document.querySelector('#dl-gear option[value="Healer\'s Kit"]')!==null),'the picker suggests items from the bag');
 for(const v of ["Healer's Kit",mat,bp,'Lucky Coin']){await p.fill('#gear-n',v);await p.click('#gear-n ~ button');await p.waitForSelector('#gear-n')}
 const c=await p.evaluate(()=>PARTY.find(x=>x.id==='e1'));
 ok(JSON.stringify(c.gear)===JSON.stringify(["Healer's Kit",mat,bp,'Lucky Coin']),'equipped a bag item, a material, a Blueprint, and a typed item: '+JSON.stringify(c.gear));
 ok(!c.inv.some(z=>z[0]==="Healer's Kit")&&c.inv.find(z=>z[0]===mat)[1]===1,'equipping takes one out of the bag');
 ok(await p.evaluate(()=>/Lucky Coin/.test(document.body.textContent)&&/Healer's Kit/.test(document.body.textContent)),'equipped items show on the sheet');
 for(const v of ['Iron Armour','Iron Helm','Bone Greatsword','Iron Shield']){await p.fill('#gear-n',v);await p.click('#gear-n ~ button');await p.waitForSelector('#gear-n')}
 const txt=await p.evaluate(()=>document.querySelector('.sheet').textContent);
 ok(/Iron Armour[^]*Body \(torso\)/.test(txt)&&/Iron Helm[^]*Head/.test(txt),'the sheet says where Iron Armour (body) and Iron Helm (head) are worn');
 ok(/More than two hands/.test(txt),'the sheet warns when a greatsword and a shield need more than two hands');
 await p.fill('#gear-n','Bone Armour');await p.click('#gear-n ~ button');await p.waitForSelector('#gear-n');
 ok(/2 items on body \(torso\)/.test(await p.evaluate(()=>document.querySelector('.sheet').textContent)),'the sheet warns when two armors share the body');
 // the bag takes anything; rows say where items are worn; Equip moves one; unequip puts it back
 await p.evaluate(()=>{const c=PARTY.find(x=>x.id==='e1');c.gear=[];c.inv=[];saveParty();renderSheet()});await p.waitForSelector('#inv-n');
 for(const v of ['Iron Helm','Torch']){await p.fill('#inv-n',v);await p.evaluate(()=>sheetInvAdd());await p.waitForSelector('#inv-n')}
 let c2=await p.evaluate(()=>PARTY.find(x=>x.id==='e1'));ok(c2.inv.some(z=>z[0]==='Iron Helm')&&c2.inv.some(z=>z[0]==='Torch'),'the bag takes a Blueprint and a typed item: '+JSON.stringify(c2.inv));
 ok(await p.evaluate(()=>!!document.querySelector('#dl-item option[value="Iron Armour"]')),'bag suggestions include Blueprints');
 let st=await p.evaluate(()=>document.querySelector('.sheet').textContent);ok(/Iron Helm[^]*Armor · Head/.test(st)&&/Torch[^]*One hand when used/.test(st),'bag rows say where items are worn');
 await p.evaluate(()=>{const c=PARTY.find(x=>x.id==='e1');invEquip('e1',c.inv.findIndex(z=>z[0]==='Iron Helm'))});
 c2=await p.evaluate(()=>PARTY.find(x=>x.id==='e1'));ok(c2.gear.includes('Iron Helm')&&!c2.inv.some(z=>z[0]==='Iron Helm'),'⇧ Equip moves the helm from the bag to Equipped');
 await p.evaluate(()=>sheetGear('rm',0));c2=await p.evaluate(()=>PARTY.find(x=>x.id==='e1'));ok(!c2.gear.length&&c2.inv.some(z=>z[0]==='Iron Helm'),'unequipping puts it back in the bag');
 await p.fill('#inv-n','Arrow');await p.fill('#inv-q','350');await p.evaluate(()=>sheetInvAdd());
 c2=await p.evaluate(()=>PARTY.find(x=>x.id==='e1'));ok((c2.inv.find(z=>z[0]==='Arrow')||[])[1]===350,'a hand-added 350 arrows all go in, past the bag limit');
 ok(/over the limit/.test(await p.evaluate(()=>document.querySelector('.sheet').textContent)),'the sheet warns the bag is over its limit');
 await p.evaluate(()=>{const c=PARTY.find(x=>x.id==='e1');c.gear=['Lucky Coin','Iron Armour'];saveParty();SHEET_TAB='core';renderSheet()});
 ok(/Lucky Coin/.test(await p.evaluate(()=>document.querySelector('.sheet').textContent)),'page 1 Equipment lists typed items too');
 await p.goto('http://127.0.0.1:8790/blueprints.html');await p.waitForSelector('.card');
 ok(await p.evaluate(()=>/Worn on:/.test(document.querySelector('.card').textContent)),'Blueprint cards say where they are worn');
 await p.evaluate(()=>openItem(BPS.find(b=>b.n==='Iron Armour')));await p.waitForSelector('#modal');ok(/Worn on\s*Body \(torso\)/.test(await p.textContent('#modal')),'the Iron Armour window says Worn on: Body (torso)');await p.evaluate(()=>hideModal());
 await p.goto('http://127.0.0.1:8790/party.html');await p.waitForFunction(()=>typeof renderParty==='function'&&typeof PARTY!=='undefined');await p.evaluate(()=>{PARTY_SEL='e1';renderParty()});
 if(await p.$('#pg-add')){await p.fill('#pg-add','Rope (50 ft)');await p.evaluate(()=>addGear('e1'));ok(await p.evaluate(()=>PARTY.find(x=>x.id==='e1').gear.includes('Rope (50 ft)')),'the Party page equips a typed item too')}else ok(false,'no #pg-add on Party page');
 if(await p.$('#pi-add')){await p.fill('#pi-add','Grappling Hook');await p.evaluate(()=>addInv('e1'));ok(await p.evaluate(()=>PARTY.find(x=>x.id==='e1').inv.some(z=>z[0]==='Grappling Hook')),'the Party page bag takes a typed item')}
 await p.evaluate(()=>localStorage.clear());console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
