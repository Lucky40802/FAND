// Ammunition: Forge templates, a Blueprint for every ranged weapon in every realm (no gaps), the sheet using it, categories
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'blueprints.html'));await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const A=BPS.filter(b=>b.cat==='Ammunition'),kinds=['bow','crossbow','sling','blowgun','firearm','siege','parts'],gaps={};
  kinds.forEach(k=>{const L=[...new Set(A.filter(b=>b.ammo&&b.ammo.fits===k).map(b=>+b.lv||1))].sort((x,y)=>x-y);let g=L.length?L[0]-1:99;for(let i=1;i<L.length;i++)g=Math.max(g,L[i]-L[i-1]);gaps[k]=[L.length,g,L[L.length-1]]});
  const realms={};A.filter(b=>b.ammo).forEach(b=>{const m=(b.mats||[]).map(findMat).find(Boolean);if(m)realms[m.realm]=(realms[m.realm]||0)+1});
  const cats={};BPS.forEach(b=>cats[b.cat]=(cats[b.cat]||0)+1);
  return {n:A.length,withAmmo:A.filter(b=>b.ammo).length,gaps,realms,shotel:(BPS.find(b=>b.n==='Shotel')||{}).cat,arrowheads:(BPS.find(b=>b.n==='Bronze Arrowheads x20')||{}).cat,helm:(BPS.find(b=>b.n==='Arrow Proof Helm')||{}).cat,
    thin:Object.entries(cats).filter(([k,v])=>v<20),art:cats.Artifact,glyph:cats.Glyph,cats:Object.keys(cats).length,amulet:(()=>{const x=BPS.find(b=>b.n==='Exalted Abyssal Amulet');return x?[x.cat,x.cat0,genOf(x)]:null})()}});
console.log('   ',JSON.stringify(r));
ok(r.n>=260&&r.withAmmo>=255,'ammunition Blueprints: '+r.n);
for(const k of ['bow','crossbow','sling','blowgun','firearm','siege','parts'])ok(r.gaps[k][1]<=10&&r.gaps[k][2]>=95,k+': no gap over 10 levels, up to level 95+ '+JSON.stringify(r.gaps[k]));
ok(Object.keys(r.realms).length>=11,'from every realm\'s materials ('+Object.keys(r.realms).length+')');
ok(r.shotel==='Sword'&&r.arrowheads==='Ammunition'&&r.helm==='Armor','misfiled items fixed (Shotel '+r.shotel+', arrowheads '+r.arrowheads+', helm '+r.helm+')');
ok(!r.thin.length,'no item type is left with under 20 Blueprints: '+JSON.stringify(r.thin));
ok(r.art<1000&&r.glyph>300,'Artifact is no longer a catch-all ('+r.art+' left; Glyph '+r.glyph+')');
ok(r.amulet&&r.amulet[0]==='Jewelry'&&r.amulet[2]==='Amulet','a re-filed amulet is still an Amulet focus: '+JSON.stringify(r.amulet));
const opts=await p.$$eval('select',S=>{const s=S.find(x=>[...x.options].some(o=>/All item types/.test(o.text)));return s?[...s.options].map(o=>o.text).join('|'):''});ok(/Ammunition/.test(opts)&&/Glyph/.test(opts)&&/Siege Engine/.test(opts),'Blueprints page filter lists the categories');
// the Forge
await p.goto('file://'+path.resolve(process.argv[2],'forge.html'));await p.waitForTimeout(2500);
const f=await p.evaluate(()=>{const G=BASE_GROUPS.includes('Ammunition'),bases=GEN.filter(([,b])=>b.group==='Ammunition').map(([n])=>n);
  const r1=forgeResult('Arrows',{arrowheads:'Iron',shafts:'Oak',fletching:'Feathers'}),r2=forgeResult('Bodkin Arrows',{'bodkin-points':'Iron',shafts:'Oak'});
  const hi=MATS.filter(m=>matCode(m)==='O'&&(m.il||0)>=40)[0],r3=hi?forgeResult('Broadhead Arrows',{broadheads:hi.n,shafts:'Oak'}):null;
  return {G,bases,r1:r1.ammo,r2:r2.ammo,r3:r3&&r3.ammo,hi:hi&&hi.n,adds:(r3||r1).adds.map(a=>a[2]).join(' | ')}});
console.log('   ',JSON.stringify(f).slice(0,600));
ok(f.G&&f.bases.length>=12,'Forge has an Ammunition group: '+f.bases.join(', '));
ok(f.r1&&f.r1.fits==='bow'&&f.r1.qty===20,'Forge arrows: 20 for bows');ok(f.r2&&f.r2.pierce>=1,'bodkin arrows ignore AC');ok(f.r3&&f.r3.dmg>=8,'a level-40 metal broadhead adds damage: '+JSON.stringify(f.r3));
// the sheet
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
const s=await p.evaluate(()=>{const ar=BPS.find(b=>b.ammo&&b.ammo.fits==='bow'&&b.ammo.dmg>=5),qu=BPS.find(b=>b.ammo&&b.ammo.fits==='crossbow');PARTY.length=0;PARTY.push({id:'r',name:'Rae',level:24,cls:'Ranger',abil:{dex:16},gear:['Longbow','Light Crossbow'],inv:[[ar.n,20],[qu.n,20],['Arrows',20]]});SHEET_ID='r';saveParty();renderSheet();
  return {ar:ar.n,qu:qu.n,txt:document.body.innerText}});
ok(s.txt.includes('shooting '+s.ar)&&s.txt.includes('shooting '+s.qu),'each ranged weapon shoots its best ammunition ('+s.ar+' / '+s.qu+')');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
