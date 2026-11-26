// Features past level 20: every class change (II-V) gives features at its 7th and 14th levels too, and every hidden
// class change gives its three features back, evolved, at the change's 1st, 7th and 14th levels
const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)bad++};
const p=await (await b.newContext({serviceWorkers:'block'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2],'sheet.html'));await p.waitForSelector('#sh-who');await p.waitForTimeout(800);
const S=await p.evaluate(()=>{const want=[27,34,47,54,67,74,87,94],bad=[];Object.entries(STAGES).forEach(([cls,L])=>{const lv=L.flatMap(s=>s.features.map(f=>f[0]));want.forEach(w=>{if(!lv.includes(w))bad.push(cls+' '+w)});L.forEach(s=>{if(s.features.length!==6)bad.push(cls+' '+s.name+' has '+s.features.length)})});return {n:Object.keys(STAGES).length,bad}});
ok(S.n===13&&!S.bad.length,'all 13 classes: six features in each change, at its 1st, 5th, 7th, 11th, 14th and 15th levels '+S.bad.slice(0,5));
const sh=await p.evaluate(()=>{PARTY.length=0;const c=genFill({cls:'Fighter',level:50}).c;c.id='f';PARTY.push(c);SHEET_ID='f';saveParty();renderSheet();return document.getElementById('content').textContent});
ok(/Indomitable \(four uses\)/.test(sh)&&/Riotous Footwork/.test(sh)&&/Action Surge \(three uses\)/.test(sh)&&!/Second Wind \(two uses\)/.test(sh),'a level 50 Fighter\'s sheet shows the new features up to its level, not past it');
const m=await p.evaluate(()=>[1,2,17,47,87].map(L=>surgeUses({cls:'Fighter',level:L})).join(',')+' '+[26,27].map(L=>{const c={cls:'Monk',level:L,abil:{dex:18},gear:[]};return Math.round(charRound(c,'Human',0).v)}).join('/'));
ok(/^0,1,2,3,4 /.test(m)&&+m.split(' ')[1].split('/')[1]>+m.split(' ')[1].split('/')[0],'Action Surge 1/2/3/4 uses at 2/17/47/87; a Monk\'s Flurry strikes three times from level 27: '+m);
// hidden classes
const H=await p.evaluate(()=>{const c={n:'Ashen Tester',features:[[1,'Skill: Ember Step','Teleport 30 ft. once per short rest.'],[7,'Skill: Cinder Ward','Gain 2d6 temporary hit points.'],[14,'Ultimate: Pyre','Deal 4d10 fire damage in a 20-ft. radius, once per long rest.']],evolves:'At level 20, it becomes more.'};
  const T=hcTrack(c),ev=T.filter(t=>/ (II|III|IV|V)$/.test(t[1])&&!/^Class change/.test(t[1]));const old=[[1,'Skill: Ember Step','x'],[7,'Skill: Cinder Ward','y'],[14,'Ultimate: Pyre','z'],[20,'Evolution','e'],[21,'Class change: Ashen Tester II','c']],W=hcWithEvo('Ashen Tester',old);
  return {n:ev.length,lv:ev.map(t=>t[0]).join(','),names:ev.slice(0,3).map(t=>t[1]),old:W.length,again:hcWithEvo('Ashen Tester',W).length,txt:ev[2][2],scaled:hcScale(ev[11][2],95,95)}});
ok(H.n===12&&H.lv==='21,27,34,41,47,54,61,67,74,81,87,94','a hidden class gets its three features back evolved at each change\'s 1st, 7th and 14th levels: '+H.lv);
ok(JSON.stringify(H.names)==='["Skill: Ember Step II","Skill: Cinder Ward II","Ultimate: Pyre II"]'&&/without paying its cost/.test(H.txt),'named after its own features, each a step stronger: '+H.names);
ok(H.old===5+12&&H.again===H.old,'a hidden class already on a sheet (stored before this rule) gets them too, once');
ok(!errs.length,'no errors '+errs.join('|'));console.log(bad?bad+' FAILED':'ALL PASSED');await b.close()})();
