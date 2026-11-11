const { chromium } = require('../pw.js');
const http=require('http'),fs=require('fs'),path=require('path');const ROOT=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(8838,r));const b=await chromium.launch();
 const mk=async(role,party)=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(([r,pt])=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fand.role',JSON.stringify(r));localStorage.removeItem('fand.shop');localStorage.setItem('fand.party',JSON.stringify(pt))},[role,party]);
   const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('PAGEERROR',e.message)});await p.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());return [ctx,p]};
 const iron=null;let [ctx,p]=await mk('dm',[{id:'a',name:'Bran',level:5,abil:{},gear:[],inv:[],purse:{Human:200},coins:{gp:5,sp:3}}]);
 await p.goto('http://127.0.0.1:8838/shop.html');await p.waitForTimeout(1200);await p.evaluate(()=>{HC=HC||[];renderShop()});await p.waitForTimeout(200);
 const t=await p.evaluate(()=>document.body.innerText);ok(/Shop/.test(t)&&/General store/.test(t)&&/Sell to/.test(t),'Shop page loads with shop kinds and a sell panel');
 ok(await p.evaluate(()=>NAV_GROUPS.some(g=>g[1].includes('shop'))),'Shop is in the menu (Items & Crafting)');
 await p.evaluate(()=>{SHOPST.kind='smith';SHOPST.size=4;shopSave();renderShop()});await p.waitForTimeout(200);
 const st=await p.evaluate(()=>{const s=shopStock();return {n:s.rows.length,r:s.rows.map(x=>({n:x.n,q:x.q,price:x.price}))}});ok(st.n>3,'a capital smithy has stock ('+st.n+' lines)');
 // buy the cheapest in-stock item
 const pick=await p.evaluate(()=>{const s=shopStock();let best=-1;s.rows.forEach((x,i)=>{if(x.q&&(best<0||x.price<s.rows[best].price))best=i});return best});
 const before=await p.evaluate(()=>({h:shopHave(PARTY[0],'Human'),inv:JSON.stringify(PARTY[0].inv)}));const row=st.r[pick];
 await p.evaluate(i=>shopBuy(i),pick);await p.waitForTimeout(200);
 const after=await p.evaluate(n=>({h:shopHave(PARTY[0],'Human'),inv:PARTY[0].inv,q:shopStock().rows.find(x=>x.n===n).q}),row.n);
 ok(Math.abs(before.h-after.h-row.price)<0.01,'buying '+row.n+' cost '+row.price+' gp ('+before.h+' → '+after.h+')');ok(after.inv.some(x=>x[0]===row.n)&&after.q===row.q-1,'it is in the pack and the stock went down');
 // can't afford: make purse tiny
 await p.evaluate(()=>{PARTY[0].purse.Human=0;PARTY[0].coins={};saveParty();renderShop()});const inv2=await p.evaluate(()=>JSON.stringify(PARTY[0].inv));await p.evaluate(i=>shopBuy(i),pick);ok(await p.evaluate(v=>JSON.stringify(PARTY[0].inv)===v,inv2),"can't buy with an empty purse");
 // sell it back at half the list price
 const m=await p.evaluate(n=>({v:shopValue(n),n}),row.n);await p.evaluate(n=>{renderShop()},0);await p.evaluate(n=>shopSell(n,0),row.n);
 const sold=await p.evaluate(()=>({g:commonGp(PARTY[0]),inv:PARTY[0].inv}));ok(Math.abs(sold.g-m.v/2)<0.011&&!sold.inv.some(x=>x[0]===row.n&&x[1]>0),'selling pays half the list price ('+m.v+' gp list → '+sold.g+' gp)');
 // another realm: prices in local coin, and the moneychanger takes 10%
 await p.evaluate(()=>{PARTY[0].coins={gp:500};saveParty();SHOPST.realm='Mysterious';shopSave();renderShop()});await p.waitForTimeout(200);
 const mt=await p.evaluate(()=>({txt:document.body.innerText,C:shopCoin('Mysterious')}));ok(new RegExp(mt.C.pl).test(mt.txt)&&/Moneychanger/.test(mt.txt),'Mysterious market: prices in '+mt.C.coin+'s and a moneychanger');
 await p.evaluate(()=>{$('mc-n').value='100';$('mc-from').value='Human (common coins)';shopChange()});const ch=await p.evaluate(()=>({g:commonGp(PARTY[0]),loc:+PARTY[0].purse.Mysterious||0,C:shopCoin('Mysterious').gp}));
 ok(Math.abs(ch.g-400)<0.01&&ch.loc===Math.floor(100*0.9/ch.C),'changed 100 gp into '+ch.loc+' Mysterious coins (10% kept)');
 // DM price change
 const p0=await p.evaluate(()=>shopStock().rows[0].price);await p.evaluate(()=>{SHOPST.adj=-25;shopSave();renderShop()});const p1=await p.evaluate(()=>shopStock().rows[0].price);ok(p1<p0,'DM price change lowers prices ('+p0+' → '+p1+' gp)');
 // pack full stops buying
 await p.evaluate(()=>{SHOPST.adj=0;SHOPST.realm='Human';SHOPST.kind='general';shopSave();PARTY[0].purse.Human=100000;PARTY[0].inv=Array.from({length:20},(_,i)=>['Pebble'+i,10]);saveParty();renderShop()});
 const full=await p.evaluate(()=>{const s=shopStock(),i=s.rows.findIndex(x=>x.q);const h=shopHave(PARTY[0],'Human');shopBuy(i);return {spent:h-shopHave(PARTY[0],'Human')}});ok(full.spent===0,'a full pack buys nothing and pays nothing');
 await ctx.close();
 // player: no DM controls
 [ctx,p]=await mk('player',[{id:'a',name:'Bran',level:5,abil:{},gear:[],inv:[],purse:{Human:50}}]);await p.goto('http://127.0.0.1:8838/shop.html');await p.waitForTimeout(900);await p.evaluate(()=>{HC=HC||[];renderShop()});await p.waitForTimeout(150);
 ok(!(await p.$('#sh-adj'))&&!/Restock the market/.test(await p.evaluate(()=>document.body.innerText)),'player view: no price change or restock');
 // mobile layout has no sideways gap
 await ctx.close();const c2=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const q=await c2.newPage();await q.route('https://vppvpmwjqcgixtfxpukh.supabase.co/**',r=>r.abort());await q.goto('http://127.0.0.1:8838/shop.html');await q.waitForTimeout(900);await q.evaluate(()=>{HC=HC||[];renderShop()});await q.waitForTimeout(150);
 ok(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'phone: no sideways scroll');await q.screenshot({path:path.join(process.env.S,'shop-phone.png')});
 console.log(fails?fails+' FAILED':'ALL PASSED');await b.close();srv.close();process.exit(fails?1:0)})();
