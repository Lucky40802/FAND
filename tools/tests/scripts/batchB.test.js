const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8848,r));const b=await chromium.launch();
const mk=async role=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(r=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.role',JSON.stringify(r));localStorage.removeItem('fand.artPick')},role);const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk('dm');
// materials and blueprints: type plates + chip symbols
await p.goto('http://127.0.0.1:8848/materials.html');await p.waitForTimeout(1300);
const mt=await p.evaluate(()=>{const cs=[...document.querySelectorAll('#content .card')];return {n:cs.length,a:cs.filter(c=>c.querySelector('.art.ty svg path')).length}});ok(mt.n>10&&mt.a===mt.n,'material cards show a type plate ('+mt.a+'/'+mt.n+')');
ok(await p.evaluate(()=>MATS.filter(m=>typeIdx(Object.assign({_t:'mat'},m))<0).length===0),'every material type has a symbol');
await p.screenshot({path:S+'/batchB-mats.png'});
await p.goto('http://127.0.0.1:8848/blueprints.html');await p.waitForTimeout(1300);
const bt=await p.evaluate(()=>{const cs=[...document.querySelectorAll('#content .card')];return {n:cs.length,a:cs.filter(c=>c.querySelector('.art.ty svg')).length,miss:[...new Set(BPS.filter(b=>typeIdx(Object.assign({_t:'bp'},b))<0).map(b=>b.cat))]}});
ok(bt.n>10&&bt.a===bt.n&&!bt.miss.length,'Blueprint cards show a type plate ('+bt.a+'/'+bt.n+'), every category mapped '+bt.miss.join(','));
// chips in a monster page (drops are materials)
await p.goto('http://127.0.0.1:8848/bestiary.html');await p.waitForTimeout(1300);
await p.evaluate(()=>showModal(MONSTERS.find(m=>m.n==='Owlbear')));await p.waitForTimeout(300);
ok(await p.evaluate(()=>[...document.querySelectorAll('#modal [data-ref]')].some(c=>c.querySelector('.tsym svg'))),'material drops carry their symbol');
// picture picker
ok(await p.evaluate(()=>!!document.querySelector('#modal .art-edit')),'DM view: the portrait has a change-picture button');
await p.evaluate(()=>document.querySelector('#modal .art-edit').click());await p.waitForTimeout(1500);
const pk=await p.evaluate(()=>({open:!$('artpick').hidden,n:document.querySelectorAll('#ap-grid .ap-i').length,loaded:typeof ICON_PICK!=='undefined'?ICON_PICK.length:0}));
ok(pk.open&&pk.n>50&&pk.loaded>800,'the picker opens and loads its pictures ('+pk.loaded+', showing '+pk.n+')');
await p.fill('#ap-q','dragon');await p.waitForTimeout(200);const q=await p.evaluate(()=>[...document.querySelectorAll('#ap-grid .ap-i')].map(b=>b.title));ok(q.length>3&&q.every(t=>/dragon/.test(t)),'search filters the pictures ('+q.length+' dragons)');
await p.screenshot({path:S+'/batchB-picker.png'});
const before=await p.evaluate(()=>artBody(MONSTERS.find(m=>m.n==='Owlbear')));
await p.evaluate(()=>document.querySelector('#ap-grid .ap-i').click());await p.waitForTimeout(300);
const after=await p.evaluate(()=>({b:artBody(MONSTERS.find(m=>m.n==='Owlbear')),closed:$('artpick').hidden,saved:Object.keys(store.get('artPick',{})),modal:document.querySelector('#modal .art.lg svg').innerHTML}));
ok(after.closed&&after.b!==before&&after.saved.includes('mon:Owlbear')&&after.modal.slice(0,60).replace(/\s/g,'')===after.b.slice(0,60).replace(/\s/g,''),'choosing one changes the picture and saves it');if(!(after.closed&&after.b!==before))console.log('DBG',after.closed,after.b===before);console.log('DBG2',JSON.stringify(after.modal.slice(0,80)),JSON.stringify(after.b.slice(0,80)));
await p.evaluate(()=>closeModal());await p.waitForTimeout(100);
ok(await p.evaluate(b=>{const c=[...document.querySelectorAll('#content .card')].find(x=>/Owlbear/.test(x.textContent));return !c||c.querySelector('.art svg').innerHTML===b},after.b),'the list card shows the new picture');
// survives a reload
await p.reload();await p.waitForTimeout(1300);ok(await p.evaluate(b=>artBody(MONSTERS.find(m=>m.n==='Owlbear'))===b,after.b),'the choice is still there after a reload');
// reset
await p.evaluate(()=>{showModal(MONSTERS.find(m=>m.n==='Owlbear'));artPicker(CUR)});await p.waitForTimeout(800);await p.evaluate(()=>artPickSet(null));await p.waitForTimeout(200);
ok(await p.evaluate(b=>artBody(MONSTERS.find(m=>m.n==='Owlbear'))===b,before),'Use the default picture puts it back');
// escape closes
await p.evaluate(()=>artPicker(CUR));await p.waitForTimeout(500);await p.keyboard.press('Escape');ok(await p.evaluate(()=>$('artpick').hidden&&$('mbg').classList.contains('open')),'Escape closes the picker (the page stays open)');
await ctx.close();
// players can't change pictures
[ctx,p]=await mk('player');await p.goto('http://127.0.0.1:8848/gods.html');await p.waitForTimeout(1300);await p.evaluate(()=>showModal(GODS[0]));await p.waitForTimeout(300);
ok(await p.evaluate(()=>!document.querySelector('#modal .art-edit')&&!!document.querySelector('#modal .art.lg')),'player view: the picture shows but cannot be changed');
await ctx.close();
// phone picker fits
const ctx2=await b.newContext({viewport:{width:390,height:844}});await ctx2.addInitScript(()=>localStorage.setItem('fand.role',JSON.stringify('dm')));const p2=await ctx2.newPage();await p2.goto('http://127.0.0.1:8848/demons.html');await p2.waitForTimeout(1300);
await p2.evaluate(()=>{showModal(DEMONS[0]);artPicker(CUR)});await p2.waitForTimeout(1200);
ok(await p2.evaluate(()=>{const r=document.querySelector('.ap-box').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth+1}),'phone: the picker fits the screen');await p2.screenshot({path:S+'/batchB-phone.png'});
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
