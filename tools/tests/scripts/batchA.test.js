const { chromium } = require('../pw.js');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2],S=process.env.S;
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8846,r));const b=await chromium.launch();
const party=[{id:'a',name:'Bran',level:5,cls:'Wizard',abil:{},gear:[],inv:[],hp:3,hpMax:30,slotUsed:{1:{0:true,1:true},3:{0:true}},ds:{s:1}},{id:'b',name:'Ayla',level:4,cls:'Warlock',abil:{},gear:[],inv:[],hp:10,hpMax:25,slotUsed:{2:{0:true}}}];
const mk=async vp=>{const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(pt=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.role',JSON.stringify('dm'));localStorage.setItem('fand.party',JSON.stringify(pt));localStorage.setItem('fand.combat',JSON.stringify({round:1,turn:0,list:[]}));localStorage.setItem('fand.journal','[]')},party);const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});p.on('dialog',d=>d.accept());await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
let [ctx,p]=await mk({width:1280,height:900});
await p.goto('http://127.0.0.1:8846/combat.html');await p.waitForTimeout(1300);
await p.evaluate(()=>{['Goblin','Owlbear'].forEach(n=>{$('cb-add').value=n;$('cb-n').value=1;cbAddMon()});cbAddParty()});await p.waitForTimeout(300);
const st=await p.evaluate(()=>({n:document.querySelectorAll('.cbtile').length,on:document.querySelectorAll('.cbtile.on').length,pics:document.querySelectorAll('.cbtile .art svg').length,now:!!document.querySelector('.cbtile.on .cbturn')}));
ok(st.n===4&&st.on===1&&st.pics===4&&st.now,'turn-order strip: 4 tiles with pictures, one marked NOW '+JSON.stringify(st));
await p.evaluate(()=>cbNext());await p.waitForTimeout(200);ok(await p.evaluate(()=>[...document.querySelectorAll('.cbtile')].indexOf(document.querySelector('.cbtile.on'))===CB.turn&&CB.turn===1),'Next turn moves the NOW marker');
// down: hit the goblin hard
await p.evaluate(()=>{const g=CB.list.find(x=>x.mon==='Goblin');g.hp=0;saveCB();renderCombat()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>{const t=[...document.querySelectorAll('.cbtile')].find(b=>/Goblin/.test(b.textContent));return t.classList.contains('down')&&!!t.querySelector('.cbskull svg')}),'a fallen monster is greyed out under a skull');
// condition with symbol
await p.evaluate(()=>{const o=CB.list.find(x=>x.mon==='Owlbear');cbCond(o.id,'Poisoned')});await p.waitForTimeout(200);
const cd=await p.evaluate(()=>{const ch=[...document.querySelectorAll('.cb-cond button')].find(x=>/Poisoned/.test(x.textContent));const t=[...document.querySelectorAll('.cbtile')].find(b=>/Owlbear/.test(b.textContent));return {sym:!!(ch&&ch.querySelector('.sym svg')),title:ch&&ch.title,tile:!!t.querySelector('.cbconds .sym')}});
ok(cd.sym&&/Poisoned: .{10,}/.test(cd.title)&&cd.tile,'conditions show a symbol and their rule ('+(cd.title||'').slice(0,60)+'…), and appear on the tile');
// quick card
await p.evaluate(()=>[...document.querySelectorAll('.cbtile')].find(b=>/Owlbear/.test(b.textContent)).click());await p.waitForTimeout(200);
const qc=await p.evaluate(()=>{const q=$('qcard');return q&&!q.hidden?q.innerText:''});
ok(/Owlbear/.test(qc)&&/AC/.test(qc)&&/HP/.test(qc)&&/Beak/.test(qc)&&/STR/.test(qc)&&/Speed/.test(qc),'tapping a tile opens a quick card with AC, HP, speed, abilities and actions');
ok(await p.evaluate(()=>!!$('qcard').querySelector('.dice,[data-dice],.die')||/1d10/.test($('qcard').innerText)),'the card has its damage dice');
// damage updates the open card
await p.evaluate(()=>{const o=CB.list.find(x=>x.mon==='Owlbear');o.hp=20;saveCB();renderCombat()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>!$('qcard').hidden&&/20 \/ 51/.test($('qcard').innerText)),'the open card follows the tracker (HP 20 / 51)');
await p.screenshot({path:S+'/batchA-combat.png'});
await p.keyboard.press('Escape');await p.waitForTimeout(100);ok(await p.evaluate(()=>$('qcard').hidden),'Escape closes the card');
await p.evaluate(()=>document.querySelector('.cb-pic').click());await p.waitForTimeout(150);ok(await p.evaluate(()=>!$('qcard').hidden),'the picture beside a name opens the card too');
await p.evaluate(()=>{$('qcard').querySelector('.icon-btn').click()});
// PC card
await p.evaluate(()=>[...document.querySelectorAll('.cbtile')].find(b=>/Bran/.test(b.textContent)).click());await p.waitForTimeout(150);ok(await p.evaluate(()=>/Player character/.test($('qcard').innerText)),'a player character gets a card too');
await p.evaluate(()=>cbQuickClose());
// long rest from combat
await p.evaluate(()=>partyRest('long'));await p.waitForTimeout(300);
const lr=await p.evaluate(()=>({p:PARTY.map(c=>({hp:c.hp,su:c.slotUsed,ds:c.ds})),j:store.get('journal',[]),cb:CB.list.filter(x=>x.pc).map(x=>x.hp)}));
ok(lr.p[0].hp===30&&lr.p[1].hp===25&&!Object.keys(lr.p[0].su).length&&!Object.keys(lr.p[0].ds).length,'long rest: full HP, slots and death saves cleared for everyone');
ok(lr.j.length===1&&/Long rest/.test(lr.j[0].t)&&/Bran/.test(lr.j[0].body)&&/Ayla/.test(lr.j[0].body),'the rest is noted in the session journal');
ok(lr.cb.join()==='30,25','the combat tracker shows their new HP ('+lr.cb.join()+')');
// undo
await p.evaluate(()=>{const b=[...document.querySelectorAll('#toast button,.toast button,[class*=toast] button')].find(x=>/undo/i.test(x.textContent));if(b)b.click()});await p.waitForTimeout(300);
ok(await p.evaluate(()=>PARTY[0].hp===3&&store.get('journal',[]).length===0),'undo puts HP and the journal back');
await ctx.close();
// short rest on the party page
[ctx,p]=await mk({width:1280,height:900});await p.goto('http://127.0.0.1:8846/party.html');await p.waitForTimeout(1300);
ok(await p.evaluate(()=>[...document.querySelectorAll('button')].some(b=>/Short rest/.test(b.textContent))&&[...document.querySelectorAll('button')].some(b=>/Long rest/.test(b.textContent))),'Party page has Short rest and Long rest buttons');
await p.evaluate(()=>partyRest('short'));await p.waitForTimeout(300);
const sr=await p.evaluate(()=>PARTY.map(c=>c.slotUsed));
ok(sr[0][3][0]===false&&sr[0][1][0]===true&&!Object.keys(sr[1]).length,'short rest: Bran gets his level 3 slot back (highest), Ayla the Warlock gets her pact slots');
ok(await p.evaluate(()=>/level 3 slot/.test(store.get('journal',[])[0].body)),'the journal says which slot came back');
await ctx.close();
// sheet still works
[ctx,p]=await mk({width:1280,height:900});await p.goto('http://127.0.0.1:8846/sheet.html');await p.waitForTimeout(1300);
await p.evaluate(()=>{PARTY_SEL='a';sheetRest('long')});await p.waitForTimeout(200);ok(await p.evaluate(()=>PARTY[0].hp===30),'the sheet\'s own Long rest still works');
await ctx.close();
// phone: card as a bottom sheet, no sideways scroll
[ctx,p]=await mk({width:390,height:844});await p.goto('http://127.0.0.1:8846/combat.html');await p.waitForTimeout(1300);
await p.evaluate(()=>{['Goblin','Owlbear','Young Red Dragon'].forEach(n=>{$('cb-add').value=n;$('cb-n').value=1;cbAddMon()})});await p.waitForTimeout(200);
await p.evaluate(()=>document.querySelectorAll('.cbtile')[2].click());await p.waitForTimeout(200);
const ph=await p.evaluate(()=>{const r=$('qcard').getBoundingClientRect();return {l:r.left,r:innerWidth-r.right,b:innerHeight-r.bottom,sw:document.documentElement.scrollWidth<=innerWidth+1}});
ok(ph.l>=10&&ph.r>=10&&ph.b>0&&ph.sw,'phone: the card sits at the bottom inside the screen, no sideways scroll '+JSON.stringify(ph));
await p.screenshot({path:S+'/batchA-phone.png'});
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
