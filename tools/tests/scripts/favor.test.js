const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'chargen.html'));await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{const R=(s=>()=>{s=(s*16807)%2147483647;return (s-1)/2147483646})(5);const avg=(rn,L)=>{let g=0,f=0;for(let i=0;i<300;i++){const ts=[0,1,2].map(sz=>rollTreasure(rn,L,sz,R));g+=8*ts[1].gold+ts[2].gold;f+=8*ts[1].favor+ts[2].favor}return [Math.round(g/300),Math.round(f/300)]};
 const sp=lv=>{const x={lv,_realm:'Void',rune:null};return spellPrice(x)};
 return {human:avg('Human',5),void:avg('Void',80),iv:avg('Inner Void',90),prim:avg('Primordial',100),spVoid:sp(9),spPrim:spellPrice({lv:9,_realm:'Primordial',rune:null}),
  coin:spoilCoins(0,'Void',12),coinH:spoilCoins(100,'Human',0),gen80:genFavor(80),gen20:genFavor(20),genC:genFill({cls:'Fighter',level:85}).c.favor}});
console.log(JSON.stringify(r));
ok(r.human[0]>0&&r.human[1]===0,'Human Realm treasure pays gold, no Favor');
ok(r.void[0]===0&&r.void[1]>0&&r.iv[1]>r.void[1]&&r.prim[1]>r.iv[1],'Void and deeper pay Favor, not gold, more the deeper');
ok(r.void[1]/r.spVoid.favor>=1.5&&r.void[1]/r.spVoid.favor<=3.5,'a level in the Void is about two 9th-level spells ('+r.void[1]+' vs '+r.spVoid.favor+')');
ok(r.coin.favor&&r.coin.n===12&&!r.coinH.favor,'Spoils coins know Favor');
ok(r.gen80>0&&r.gen20===0&&r.genC>0,'generated characters in the Favor realms start with Favor');
// spoils hand-out and the sheet
await p.goto('file://'+path.resolve(process.argv[2],'combat.html'));await p.waitForTimeout(1500);
const s=await p.evaluate(()=>{PARTY=[{id:'a',name:'Ash',level:80,cls:'Fighter'},{id:'b',name:'Bo',level:80,cls:'Wizard'}];saveParty();HC=HC||[];
 CB={round:1,turn:0,list:[],spoils:{at:1,realm:'Void',sz:1,lead:'X',coins:spoilCoins(0,'Void',11),left:11,mats:[],items:[],line:''}};spoilsSplit();return PARTY.map(c=>c.favor)});
ok(s.join()==='6,5','Spoils split Favor between the party ('+s+')');
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForTimeout(1200);
ok(await p.evaluate(()=>{PARTY=[{id:'a',name:'Ash',level:80,cls:'Fighter',favor:42}];SHEET_ID='a';SHEET_TAB='gear';saveParty();renderSheet();const i=document.querySelector('[data-s="favor"]');return !!i&&i.value==='42'}),'the sheet Purse shows Favor');
await p.goto('file://'+path.resolve(process.argv[2],'tools.html'));await p.waitForTimeout(1500);
const tl=await p.evaluate(()=>{store.set('tooltab','t-loot');const rs=$('l-realm');if(!rs)return 'no tool';rs.value='Void';$('l-lv').value=80;rs.dispatchEvent(new Event('change'));return $('l-out').innerText});
ok(/Favor/.test(tl)&&!/\d gp\b(?! at list)/.test(tl.split('\n')[0]),'the treasure roller shows Favor in the Void: '+tl.split('\n')[0]);
ok(!errs.length,'no errors '+errs.join(';'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
