// ── Encounters ────────────────────────────────────────────────
const XP_TH=[null,[25,50,75,100],[50,100,150,200],[75,150,225,400],[125,250,375,500],[250,500,750,1100],[300,600,900,1400],[350,750,1100,1700],[450,900,1400,2100],[550,1100,1600,2400],[600,1200,1900,2800],[800,1600,2400,3600],[1000,2000,3000,4500],[1100,2200,3400,5100],[1250,2500,3800,5700],[1400,2800,4300,6400],[1600,3200,4800,7200],[2000,3900,5900,8800],[2100,4200,6300,9500],[2400,4900,7300,10900],[2800,5700,8500,12700]];
const DIFFS=['Easy','Medium','Hard','Deadly'];
const xpMult=n=>n<=1?1:n===2?1.5:n<=6?2:n<=10?2.5:n<=14?3:4;
function renderEncounter(){
  const st=store.get('enc',{size:Math.max(1,PARTY.length||4),level:Math.max(1,Math.round(PARTY.reduce((a,c)=>a+(+c.level||1),0)/(PARTY.length||1))||3),realm:'Human',diff:'Medium',hb:false,list:[]});
  // the results read the saved settings: save the starting ones so a first visit shows real budgets, not 0
  if(!store.get('enc',null))store.set('enc',st);
  $('content').innerHTML=`<div class="page">${datalists()}
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Encounter builder</h3><p>Balanced fights from a realm's Bestiary, using the standard XP budget by party level.</p></div>
    <div class="tool"><div class="form" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
      <label>Party size<input id="en-size" type="number" min="1" max="10" value="${st.size}"></label>
      <label>Average level<input id="en-lv" type="number" min="1" max="100" value="${st.level}"></label>
      <label>Realm<select id="en-realm"><option value="">Any realm</option>${REALMS.map(r=>`<option${r.n===st.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
      <label>Dimension<select id="en-dim"><option value="">Anywhere in the realm</option>${dimsOf(st.realm||'').map(d=>`<option${d.n===st.dim?' selected':''}>${esc(d.n)}</option>`).join('')}</select></label>
      <label>Difficulty<select id="en-diff">${DIFFS.map(d=>`<option${d===st.diff?' selected':''}>${d}</option>`).join('')}</select></label>
      <label class="chk" style="align-self:end"><input type="checkbox" id="en-hb"${st.hb?' checked':''}> Homebrew only</label>
      <label class="chk" style="align-self:end" title="The strongest monster in a built encounter is a champion: a monster with a class"><input type="checkbox" id="en-champ"${st.champ?' checked':''}> ★ Lead with a champion</label>
      <label class="chk" style="align-self:end" title="Build for the characters in the campaign: AC comes off every hit, so the XP budget alone can be far off"><input type="checkbox" id="en-aim"${st.aim!==false?' checked':''}> Aim for my party</label>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn primary" onclick="rollEncounter()">🎲 Build encounter</button>
      <span class="keyrow" style="flex:1;min-width:260px"><input class="sel" id="en-add" list="dl-mon" placeholder="Or add a monster by name…" style="max-width:none;flex:1"><button class="btn" onclick="addEncMon()">Add</button></span>
      <button class="btn" onclick="encSpoils()" title="What this fight is likely to drop">🎁 Preview spoils</button>
      <button class="btn" onclick="sendToCombat()">Send to combat tracker →</button></div><div id="en-spoils" style="margin-top:10px"></div></div>
    <div id="en-out" style="margin-top:14px"></div>
    <details class="fold" id="en-bal" style="margin-top:14px"><summary><b>⚖ Balance report</b> <small style="color:var(--muted)">how characters stack up against each realm's monsters</small></summary><div class="note" style="margin:6px 0">Builds sample characters (a Fighter, a Wizard, a Rogue, a Cleric) in the middle of each realm's levels with the character generator, and runs them against the realm's typical monster with the Party check's arithmetic. Run it again after changing a rule to see what it did.</div><button class="btn" type="button" onclick="balRun()">Run the report</button><div id="en-bal-out" style="margin-top:8px"></div></details></div>`;
  ['en-size','en-lv','en-realm','en-dim','en-diff','en-hb','en-champ','en-aim'].forEach(i=>$(i).addEventListener('change',()=>{saveEncInputs();if(i==='en-realm')renderEncounter();else encOut()}));
  encOut();
  // arriving from a dimension's "Build a fight here": build it at once
  if(st.autoroll){delete st.autoroll;store.set('enc',st);rollEncounter()}
}
function saveEncInputs(){const st=store.get('enc',{});Object.assign(st,{size:Math.min(10,Math.max(1,Math.round(+$('en-size').value)||4)),level:Math.min(MAX_LEVEL,Math.max(1,+$('en-lv').value||1)),realm:$('en-realm').value,dim:$('en-dim')&&dimsOf($('en-realm').value).some(d=>d.n===$('en-dim').value)?$('en-dim').value:'',diff:$('en-diff').value,hb:$('en-hb').checked,champ:$('en-champ').checked,aim:$('en-aim')?$('en-aim').checked:true});store.set('enc',st);return st}
const monXP=m=>m.sb?m.sb.xp:0;
// Deeper realms' monsters already scale their AC, HP, and damage by realm tier, and characters scale by stage, so the
// budget is realm-relative: each realm tier past the Mysterious takes 10 levels off the party's level (a level-95 party in
// the Primordial counts as level 15). A party above a realm's stage counts higher; past 20 the budget grows about 12% a level.
function encLevel(st){const t=st.realm&&REALM[st.realm]?REALM[st.realm].tier:bandOf(st.level);return Math.max(1,(+st.level||1)-10*Math.max(0,t-2))}
function encBudget(st){const L=encLevel(st),th=L>20?XP_TH[20].map(x=>Math.round(x*Math.pow(1.12,L-20))):(XP_TH[L]||XP_TH[1]);return th.map(x=>x*st.size)}
// the best group of up to six monsters from a pool for an XP budget (R: a random source, so prep can be seeded)
function encPick(pool,size,budget,R){let best=null,bestScore=1e18;
  for(let t=0;t<400;t++){
    const k=1+Math.floor(R()*Math.min(6,size+2)),pick=[];
    const lead=pool[Math.floor(R()*pool.length)];pick.push(lead);
    for(let i=1;i<k;i++){const same=R()<.5;const x=same?lead:pool[Math.floor(R()*pool.length)];pick.push(monXP(x)<=monXP(lead)?x:lead)}
    const adj=pick.reduce((a,m)=>a+monXP(m),0)*xpMult(pick.length);
    const score=adj>budget*1.1?(adj-budget)*3:budget-adj;
    if(score<bestScore){bestScore=score;best=pick}
  }
  return best}
function rollEncounter(){
  const st=saveEncInputs(),want=DIFFS.indexOf(st.diff),budget=encBudget(st)[want];
  const build=b=>{const base=m=>(!st.realm||m.realm===st.realm)&&(!st.hb||m.hb)&&monXP(m)>0&&monXP(m)<=b;
    // in a dimension: its natives, and the realm's monsters that belong to no dimension only when no native fits
    let pool=MONSTERS.filter(m=>base(m)&&(!st.dim||m.dim===st.dim));if(st.dim&&!pool.length)pool=MONSTERS.filter(m=>base(m)&&!m.dim);if(!pool.length)return [];
    let best=encPick(pool,st.size,b,Math.random);
    // a champion leads: the strongest monster gains a class, then the weakest drop out until the fight fits the budget again
    if(st.champ&&best.length){const lead=best.reduce((a,m)=>monXP(m)>monXP(a)?m:a,best[0]);best[best.indexOf(lead)]=champRandom(lead);
      const adj=p=>p.reduce((a,m)=>a+monXP(m),0)*xpMult(p.length);best.sort((a,b2)=>monXP(b2)-monXP(a));while(best.length>1&&adj(best)>b*1.15)best.pop()}
    return best};
  let best=build(budget),msg='';
  if(!best.length){st.list=[];store.set('enc',st);encOut('No monsters fit that budget in '+(st.realm||'any realm')+'. Try another realm or a higher level.');return}
  // aim by the party check (website rule, 2026-11-11): with characters in the campaign, try budgets around the XP one
  // and keep the fight whose AC-aware reading matches the difficulty asked for (closest to the middle of its band)
  const party=st.aim!==false?encParty():[];
  if(party.length){const mid=want<0?0.1:want===3?1.8:(AWARE_BANDS[want]+AWARE_BANDS[want+1])/2,score=A=>A?Math.abs(A.di-want)*10+Math.abs(Math.log((A.pressure||0.01)/mid)):99;
    let pick={m:best,A:encAware(st,best,party)};
    // each candidate, and smaller versions of it (the weakest monsters dropped one at a time), so a fragile party can
    // still get a fight between Easy and Hard
    for(const k of [0.15,0.25,0.4,0.6,0.8,1,1.25,1.6,2,2.5,3.2,4])for(let i=0;i<3;i++){const m=build(budget*k);if(!m.length)continue;const S=m.slice().sort((x,y)=>monXP(y)-monXP(x));
      for(let j=S.length;j>=1;j--){const sub=S.slice(0,j),A=encAware(st,sub,party);if(score(A)<score(pick.A))pick={m:sub,A}}}
    best=pick.m;msg=pick.A&&pick.A.di===want?'Picked to play like '+st.diff+' for '+party.length+' character'+(party.length>1?'s':'')+' (Party check).':pick.A?'The closest to '+st.diff+' this realm offers for your party plays like '+pick.A.label+'.':''}
  const counts=new Map();best.forEach(m=>counts.set(m,(counts.get(m)||0)+1));
  st.list=[...counts].map(([m,n])=>[m.n,n]);store.set('enc',st);encOut(msg);
}
function encDeed(d){if(!PARTY.length)return;PARTY.forEach(ch=>{ch.log=(ch.log||[]).concat({d:new Date().toISOString().slice(0,10),deed:d})});saveParty();toast('Logged for '+PARTY.length+' character'+(PARTY.length>1?'s':'')+': '+d+'. Level them up on the character sheet if the DM agrees.')}
function addEncMon(){const v=$('en-add').value.trim(),m=MON_IDX.get(lc(v));if(!m){toast('No monster named “'+v+'”');return}const st=saveEncInputs();st.list=st.list||[];const r=st.list.find(x=>x[0]===m.n);if(r)r[1]++;else st.list.push([m.n,1]);store.set('enc',st);$('en-add').value='';encOut()}
function encChamp(name){const st=store.get('enc',{}),r=(st.list||[]).find(x=>x[0]===name),m=MON_IDX.get(lc(name));if(!r||!m||m.champ)return;const c=champRandom(m);r[1]--;st.list=st.list.filter(x=>x[1]>0);const r2=st.list.find(x=>x[0]===c.n);if(r2)r2[1]++;else st.list.push([c.n,1]);store.set('enc',st);encOut();toast('One '+m.n+' is now a '+c.champ.cls+' champion')}
function encSet(name,d){const st=store.get('enc',{});const r=(st.list||[]).find(x=>x[0]===name);if(!r)return;r[1]+=d;st.list=st.list.filter(x=>x[1]>0);store.set('enc',st);encOut()}
// Summons in an encounter (website addition): each copy of a monster in it calls the same creatures when the fight
// starts. They count toward the fight's difficulty (they fight too) but never toward its spoils.
const encSums=st=>(Array.isArray(st.sums)?st.sums:[]).filter(S=>S&&(st.list||[]).some(([n])=>n===S.by));
const encSumN=st=>{const L=st.list||[];return encSums(st).reduce((a,S)=>a+S.n*((L.find(([n])=>n===S.by)||[0,0])[1]),0)};
const encSumXP=st=>{const L=st.list||[];return encSums(st).reduce((a,S)=>{const m=MON_IDX.get(lc(S.mon));return a+(m?monXP(m):0)*S.n*((L.find(([n])=>n===S.by)||[0,0])[1])},0)};
function encSumHTML(st,list){if(!list.length)return '';const S=encSums(st);
  return `<div class="blk" style="margin-top:4px"><h4>✨ Summons <em>creatures the monsters call when the fight starts</em></h4></div>
    ${S.length?`<div class="mlist">${S.map((x,i)=>{const m=MON_IDX.get(lc(x.mon)),per=(st.list.find(([n])=>n===x.by)||[0,0])[1];return `<button type="button" ${m?`data-ref="${ref(m)}"`:''}><b style="width:36px">${x.n}×</b>✨ ${esc(x.mon)} <span class="x">from each ${esc(x.by)}${per>1?` (${per*x.n} in all)`:''} · ${x.r?x.r+' round'+(x.r>1?'s':''):'until dismissed'} · ${x.own?'own initiative':'acts after its summoner'}${m&&m.sb?` · AC ${m.sb.ac} · HP ${m.sb.hp}`:' · custom'}</span><span class="r"><span onclick="event.stopPropagation();encSumDel(${i})" title="Remove">✕</span>${m?' '+fmt(monXP(m)*x.n*per)+' XP':''}</span></button>`}).join('')}</div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
      <label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">Each<select class="sel" id="es-by">${list.map(x=>`<option>${esc(x.m.n)}</option>`).join('')}</select></label>
      <label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">Summons<input class="sel" id="es-mon" list="dl-mon" placeholder="Skeleton, Imp, or any name" style="min-width:190px"></label>
      <label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">How many<input class="sel" id="es-n" type="number" min="1" max="20" value="1" style="width:70px"></label>
      <label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">Lasts (rounds)<input class="sel" id="es-r" type="number" min="0" placeholder="Until dismissed" style="width:130px"></label>
      <label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">Acts<select class="sel" id="es-act"><option value="after">Right after its summoner</option><option value="own">On its own initiative</option></select></label>
      <button class="btn" type="button" onclick="encSumAdd()">✨ Add summon</button></div>`}
function encSumAdd(){const st=store.get('enc',{}),by=($('es-by')||{}).value,mon=(($('es-mon')||{}).value||'').trim();if(!by||!mon){toast('Name the creature to summon');return}
  const m=MON_IDX.get(lc(mon));st.sums=encSums(st).concat({by,mon:m?m.n:mon,n:Math.max(1,Math.min(20,Math.round(+$('es-n').value||1))),r:Math.max(0,Math.round(+$('es-r').value||0)),own:$('es-act').value==='own'});store.set('enc',st);encOut()}
function encSumDel(i){const st=store.get('enc',{});st.sums=encSums(st);st.sums.splice(i,1);store.set('enc',st);encOut()}
function encOut(msg){
  const st=store.get('enc',{}),list=(st.list||[]).map(([n,k])=>({m:MON_IDX.get(lc(n)),k})).filter(x=>x.m);
  const sumN=encSumN(st),sumXP=encSumXP(st),th=encBudget(st),count=list.reduce((a,x)=>a+x.k,0)+sumN,raw=list.reduce((a,x)=>a+monXP(x.m)*x.k,0)+sumXP,adj=raw*xpMult(count);
  let diff='Trivial';th.forEach((t,i)=>{if(adj>=t)diff=DIFFS[i]});
  const loot=list.reduce((a,x)=>a+x.k*(x.m.drops||[]).reduce((s,d)=>s+((findMat(d[0])||{}).price||0),0),0);
  $('en-out').innerHTML=(msg?`<div class="note">${esc(msg)}</div>`:'')+`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
    ${kv([['Difficulty',`<span style="color:${diff==='Deadly'?'var(--red)':diff==='Hard'?'var(--gold2)':'var(--green)'}">${diff}</span>`],...(encLevel(st)!==(+st.level||1)?[['Counts as level',`${encLevel(st)} <small style="font-weight:400;color:var(--muted)">level ${st.level} in ${esc(st.realm||REALMS.find(r=>r.tier===stageOf(st.level)).n)}: the realm's monsters already scale with its tier</small>`]]:[]),['Adjusted XP',fmt(Math.round(adj))+(sumN?` <small style="font-weight:400;color:var(--muted)">with ${sumN} summoned</small>`:'')],['If they win',(()=>{const named=list.some(x=>x.m.hb&&x.m.g>=10)||list.some(x=>/named|boss/i.test(x.m.n));const d=named?'Slew a named monster or a boss':diff==='Deadly'?'Won a deadly fight in the '+(st.realm?realmLabel(st.realm):'realms'):diff==='Hard'?'Won a hard fight in the '+(st.realm?realmLabel(st.realm):'realms'):'';return d?`<b>${esc(d)}</b> <small style="font-weight:400;color:var(--muted)">a deed worth a level at the DM's call</small> ${PARTY.length?`<button class="btn" type="button" onclick="encDeed(${esc(JSON.stringify(d))})">Log for the party</button>`:''}`:'<span style="font-weight:400;color:var(--muted)">An everyday fight: not a levelling deed on its own (levels come from accomplishments, not XP).</span>'})()],['Budgets',th.map((t,i)=>DIFFS[i][0]+' '+fmt(t)).join(' · ')],['Loot value',gp(loot)+' <small style="font-weight:400;color:var(--muted)">one of each part</small>']])}
    ${list.length?`<div class="mlist">${list.map(x=>`<button ${x.m.champ?`data-champ="${esc(x.m.n)}"`:`data-ref="${ref(x.m)}"`}><b style="width:36px">${x.k}×</b>${x.m.champ?'<span class="b gold" title="Champion: a monster with a class">★</span> ':''}${esc(x.m.n)} <span class="x">${esc(x.m.realm)} ${x.m.g} · CR ${esc(x.m.sb.cr)} · AC ${x.m.sb.ac} · HP ${x.m.sb.hp}</span><span class="r">${x.m.champ?'':`<span onclick="event.stopPropagation();encChamp(${esc(JSON.stringify(x.m.n))})" title="Make one of these a champion (a random class)">★</span> `}<span onclick="event.stopPropagation();encSet(${esc(JSON.stringify(x.m.n))},1)" title="One more">＋</span> <span onclick="event.stopPropagation();encSet(${esc(JSON.stringify(x.m.n))},-1)" title="One fewer">－</span> ${fmt(monXP(x.m)*x.k)} XP</span></button>`).join('')}</div>`:'<div class="note" style="margin:0">Press “Build encounter” or add monsters by name.</div>'}
    ${encSumHTML(st,list)}
    ${encCheckHTML(st,list)}
  </div>`;
}
// Party check (website rule, 2026-11-10): the XP budget doesn't know that AC here is taken off every hit, so a fight the
// budget calls Hard can barely scratch an armored party, and a "Medium" one can drop a robed caster in a round. This
// runs the same arithmetic as the balance check on the actual party: each side's hits minus the other side's AC, 85% of
// attacks landing. It is an estimate for the DM, not a rule: tactics, spells and terrain change everything.
const MON_ATK_W={two:2,three:3,four:4,five:5,six:6};
function monHits(sb){const A=(sb&&sb.ac2)||[];let n=1;const mm=A.find(x=>/Multiattack/i.test(x[0]));if(mm){const k=(mm[1].match(/makes (two|three|four|five|six) /i)||[])[1];if(k)n=MON_ATK_W[k.toLowerCase()]}
  const hs=A.map(x=>+((x[1].match(/Hit: (\d+)/)||[])[1]||0)).filter(Boolean);return hs.length?{n,h:Math.max(...hs)}:{n:0,h:0}}
const atksPer=c=>{const L=+c.level||1;return c.cls==='Fighter'?1+(L>=5)+(L>=11)+(L>=20):['Barbarian','Paladin','Ranger','Monk'].includes(c.cls)?1+(L>=5):1};
// a character's best round: weapon hits (each one against the target's AC) or the strongest damage spell it knows
function charRound(c,rn,tAC){const s=charStats(c),M=a=>Math.floor(((+(c.abil||{})[a]||10)-10)/2),ab=Math.max(M('str'),M('dex')),n=atksPer(c);
  // each weapon's round: its hits, the class riders on them (each hit against the target's AC), a once-a-turn rider
  // (Sneak Attack, Divine Smite) on one of them, and a Monk's Flurry of Blows; the best weapon's round counts
  const tr=(REALM[rn]||{tier:1}).tier,RD=classRiders(c),sneak=c.cls==='Rogue'||c.cls2==='Rogue'?sneakDice(+c.level||1)*3.5:0,MA=RD.find(r=>r.strike),ms=MA?MA.avg+M('dex'):0;
  const W=s.gear.filter(b=>gearKind(b)==='weapon').map(b=>({h:dmgAvg(fxDmg(b.design?b.design.dmg:`${b.dc} ${b.dm}`,gearFx(b)))+ab+(infAcc(c,b)?infDmg(+c.level||1).avg:0),mel:!wpnRanged(b)}));if(MA)W.push({h:ms,mel:true,fist:true});
  let wpn=0,hit=0,used=[];W.filter(w=>w.h>ab).forEach(w=>{const R=RD.filter(r=>!r.strike&&(!r.melee||w.mel)),per=R.filter(r=>r.per).reduce((a,r)=>a+r.avg,0),once=sneak+R.filter(r=>r.once).reduce((a,r)=>a+r.avg,0),h=MA&&w.mel?Math.max(w.h,ms):w.h;
    const v=n*acTaken(h+per,tAC,tr)+(once?acTaken(h+per+once,tAC,tr)-acTaken(h+per,tAC,tr):0)+(MA?2*acTaken(ms+per,tAC,tr):0);if(v>wpn){wpn=v;hit=h;used=R.map(r=>r.n).concat(sneak?['Sneak Attack']:[],MA?['Flurry of Blows']:[])}});
  let sp=0,spn='';const hexSp=RD.filter(r=>r.spell).reduce((a,r)=>a+r.avg,0);
  if(CASTER[c.cls]&&typeof SP!=='undefined'){const FO=focusOf(c);Object.values(c.spells||{}).flat().forEach(nm=>{const x=SP.find(y=>lc(y.n)===lc(nm));if(!x||!spellScales(x)||/heal/i.test(spellDmg(x)))return;
    const v=acTaken(dmgAvg(spellAt(spellDmg(x),spellPow(c,rn,x)))+focusFor(FO,x).dmg+hexSp,tAC,tr);if(v>sp){sp=v;spn=x.n+(hexSp?' + Hex':'')}});const CA=s.castArm;if(CA&&sp){sp*=1-CA.fail/20;spn+=' (in armor: fails on '+CA.fail+' or lower)'}}
  // bonded summons add their hits, each against the target's AC
  const bd=c.bondOn?(c.bonds||[]).filter(s=>!s.dead).reduce((a,s)=>a+acTaken(bondNow(c,s).dmg,tAC,tr),0):0,nb=c.bondOn?(c.bonds||[]).filter(s=>!s.dead).length:0,AN=artNow(c),ad=AN&&!AN.dead?acTaken(AN.dmg,tAC,tr):0,plus=(bd?` + ${nb} summon${nb>1?'s':''}`:'')+(ad?' + '+AN.n:'');
  // Action Surge: once a fight (twice from level 17) the Fighter takes its whole round again
  const su=surgeUses(c);
  return sp>wpn?{v:sp+bd+ad,how:spn+plus,burst:su*sp,surge:su}:{v:wpn+bd+ad,how:(wpn?n+' × '+Math.round(hit)+(used.length?' + '+used.join(', '):''):'')+plus,burst:su*wpn,surge:su}}
// the AC-aware reading of a fight for the campaign's party: rounds to get through the monsters, rounds until the weakest
// character drops if focused, and their ratio (pressure) read as a difficulty: under 0.25 Trivial, then Easy (0.5),
// Medium (0.9), Hard (1.4), Deadly above
const encParty=()=>(typeof PV==='function'?PV():PARTY).filter(c=>+c.hpMax>0);
const AWARE_BANDS=[0.25,0.5,0.9,1.4];
function encAware(st,mons,party,raw){party=party||encParty();if(!mons.length||!party.length)return null;
  const rn=st.realm||mons[0].realm||'Human',mHP=mons.reduce((a,m)=>a+(+m.sb.hp||0),0),mAC=mons.reduce((a,m)=>a+(+m.sb.ac||0),0)/mons.length,H=mons.map(m=>monHits(m.sb));
  const R=party.map(c=>{const s=charStats(c),inc=H.reduce((a,h)=>a+h.n*acTaken(h.h,s.ac,(REALM[rn]||{tier:1}).tier)*0.85,0),raw=H.reduce((a,h)=>a+h.n*h.h*0.85,0);
    return {c,ac:s.ac,hp:+c.hpMax,drop:inc>0?(+c.hpMax)/inc:Infinity,shrug:raw>0&&inc<raw*0.25,r:charRound(c,rn,mAC)}});
  const pace=!raw&&store.get('fightPaceOn',false)?fightPace():null,dpr=R.reduce((a,x)=>a+x.r.v*0.85,0),burst=R.reduce((a,x)=>a+(x.r.burst||0)*0.85,0),clear=dpr>0?Math.max(0.5,(mHP-burst)/dpr)*(pace||1):Infinity,minDrop=Math.min(...R.map(x=>x.drop));
  const pressure=clear===Infinity?99:minDrop===Infinity?0:clear/minDrop;let di=-1;AWARE_BANDS.forEach((b,i)=>{if(pressure>=b)di=i});
  return {R,mHP,mAC,clear,minDrop,pressure,di,label:di<0?'Trivial':DIFFS[di]}}
// Fight reports (website rule, 2026-11-16): End fight saves how a fight went (rounds, who dropped and when, damage the
// characters took) beside what the Party check predicted for the same party and monsters. Over a few sessions the
// reports show whether the table's fights run longer or shorter than the estimate, and the DM can let the Party check
// use that pace (the median of actual ÷ predicted rounds, kept between ½× and 3×).
const fightPace=()=>{const F=store.get('fights',[]).filter(f=>f.pred&&f.pred.clear>0&&f.won);if(F.length<3)return null;const r=F.map(f=>f.rounds/f.pred.clear).sort((a,b)=>a-b);return Math.max(0.5,Math.min(3,r[Math.floor(r.length/2)]))};
function cbEndFight(){const L=CB.list||[],pcs=L.filter(x=>x.pc),mons=L.filter(x=>x.mon&&!x.sum).map(x=>({x,m:MON_IDX.get(lc(x.mon))})).filter(o=>o.m&&o.m.sb);
  if(!pcs.length||!mons.length){toast('A fight report needs characters and monsters in the tracker');return}
  if(!massOk('End the fight? It saves a fight report and clears all '+L.length+' combatants from the tracker.'))return;
  const party=PARTY.filter(c=>pcs.some(x=>x.pc===c.id)&&+c.hpMax>0),cnt={};mons.forEach(o=>cnt[o.m.realm]=(cnt[o.m.realm]||0)+1);const realm=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
  const A=encAware({realm},mons.map(o=>o.m),party,true),names={};mons.forEach(o=>names[o.m.n]=(names[o.m.n]||0)+1);
  const rep={id:uid(),at:Date.now(),d:new Date().toISOString().slice(0,10),realm,rounds:+CB.round||1,mons:Object.entries(names).map(([n,k])=>k>1?k+'× '+n:n).join(', '),won:mons.every(o=>o.x.hp<=0),
    dropped:pcs.filter(x=>x.fdown||x.hp<=0).map(x=>({n:x.name,r:x.fdownR||CB.round})),dmg:pcs.reduce((a,x)=>a+(+x.fdmg||0),0),
    pred:A?{clear:+A.clear.toFixed(1),minDrop:A.minDrop===Infinity?99:+A.minDrop.toFixed(1),label:A.label}:null};
  const F=store.get('fights',[]);F.unshift(rep);store.set('fights',F.slice(0,50));
  let picked=0;party.forEach(c=>{picked+=ammoRecover(c,true)});if(picked){saveParty();toast(picked+' arrows, bolts and bullets picked up after the fight')}
  const was=store.get('combat',null);store.set('combat',{round:1,turn:0,list:[]});CB=store.get('combat');renderCombat();
  undoToast('Fight saved to the reports, tracker cleared',()=>{store.set('combat',was);const G=store.get('fights',[]).filter(f=>f.id!==rep.id);store.set('fights',G);if(TAB==='combat'){CB=store.get('combat');renderCombat()}})}
function cbFightRm(id){store.set('fights',store.get('fights',[]).filter(f=>f.id!==id));renderCombat()}
function cbFightsHTML(){const F=store.get('fights',[]);if(!F.length)return '';const pace=fightPace(),use=store.get('fightPaceOn',false);
  const how=f=>{if(!f.pred)return '';const p=f.pred,longer=f.rounds>p.clear*1.5,shorter=f.rounds<p.clear*0.67,early=f.dropped.length&&f.dropped.some(d=>d.r<p.minDrop*0.7),safe=!f.dropped.length&&p.minDrop<f.rounds*0.7;
    return early?'<span style="color:var(--red)">deadlier than predicted</span>':safe?'<span style="color:var(--green)">safer than predicted</span>':longer?'longer than predicted':shorter?'shorter than predicted':'as predicted'};
  return `<details class="fold cb-fights" style="margin-top:12px"><summary><b>📋 Fight reports</b> <small style="color:var(--muted)">${F.length} fight${F.length>1?'s':''}${pace?` · your fights run about ${pace.toFixed(1)}× the Party check's rounds`:''}</small></summary>
    <div class="tablewrap"><table class="t"><thead><tr><th>Date</th><th>Monsters</th><th class="num">Rounds<br><small>predicted</small></th><th>Dropped<br><small>predicted first drop</small></th><th class="num">Damage taken</th><th>How it went</th><th></th></tr></thead><tbody>${F.map(f=>`<tr><td>${esc(f.d)}</td><td>${esc(f.mons)}${f.won?'':' <small>(not all down)</small>'}</td><td class="num">${f.rounds}${f.pred?` <small>(${f.pred.clear})</small>`:''}</td><td>${f.dropped.length?f.dropped.map(d=>esc(d.n)+' <small>r'+d.r+'</small>').join(', '):'nobody'}${f.pred?` <small>(${f.pred.minDrop>=99?'never':'r'+f.pred.minDrop})</small>`:''}</td><td class="num">${fmt(f.dmg)}</td><td>${how(f)}${f.pred?` <small style="color:var(--muted)">· rated ${esc(f.pred.label)}</small>`:''}</td><td><button class="btn" style="padding:0 6px" onclick="cbFightRm('${f.id}')" title="Delete this report">✕</button></td></tr>`).join('')}</tbody></table></div>
    ${pace?`<label class="note" style="display:flex;gap:6px;align-items:center;margin:6px 0 0"><input type="checkbox"${use?' checked':''} onchange="store.set('fightPaceOn',this.checked);renderCombat()"> Let the Party check use my table's pace (×${pace.toFixed(1)} rounds to win)</label>`:'<div class="note" style="margin:6px 0 0">After three fights the party won, the reports show how your table\'s pace compares with the Party check, and you can let the check use it.</div>'}</details>`}
function encCheckHTML(st,list){const party=encParty();if(!list.length||!party.length)return '';
  const A=encAware(st,list.flatMap(x=>Array(x.k).fill(x.m)),party);if(!A)return '';const {R,mHP,mAC,clear}=A,f=x=>x===Infinity?'never':x<1?'under 1 round':x.toFixed(1)+' rounds';
  const count=list.reduce((a,x)=>a+x.k,0),adj=list.reduce((a,x)=>a+monXP(x.m)*x.k,0)*xpMult(count);let xi=-1;encBudget(st).forEach((b,i)=>{if(adj>=b)xi=i});
  const same=A.di===xi,col=A.di>=3?'var(--red)':A.di===2?'var(--gold2)':'var(--green)';
  const why=A.minDrop<=1.2?'Someone can drop in about a round if the monsters focus them.':A.clear>=6?'The party needs a long time to get through all those hit points.':A.minDrop===Infinity||A.minDrop>=8?'The monsters\' hits barely get past the party\'s armor.':'';
  return `<details class="fold enc-check"><summary><b>Party check</b> plays like <span style="color:${col}">${A.label}</span>${same?' <small style="color:var(--muted)">(as its XP says)</small>':` <small style="color:var(--muted)">(${A.di>xi?'harder':'easier'} than its XP: ${xi<0?'Trivial':DIFFS[xi]})</small>`}</summary>
    <div class="note" style="margin:6px 0">${why?why+' ':''}Here AC is taken off every hit, which the XP budget doesn't know. This assumes 85% of attacks land, the monsters focus one target, and each character uses their best attack or damage spell. It compares how long the party needs to win with how long the weakest character lasts.</div>
    <div class="tablewrap"><table class="t"><thead><tr><th>Character</th><th class="num">HP</th><th class="num">AC</th><th>Drops in</th><th>Best round</th></tr></thead><tbody>${R.map(x=>`<tr><td><b>${esc(x.c.name||'Unnamed')}</b></td><td class="num">${x.hp}</td><td class="num">${x.ac}</td><td>${f(x.drop)}${x.shrug?' <small style="color:var(--muted)">(armor stops most of it)</small>':''}</td><td>${Math.round(x.r.v)} <small style="color:var(--muted)">${esc(x.r.how)}</small></td></tr>`).join('')}</tbody></table></div>
    <div class="sh-row" style="margin-top:6px">The party gets through ${fmt(mHP)} monster HP (AC ${Math.round(mAC)}) in about <b>${f(clear)}</b>.</div></details>`}
// Balance report (website rule, 2026-11-11): generated characters against each realm's median monster, AC off every hit
function balRun(){const el=$('en-bal-out');if(!el)return;el.innerHTML='<div class="note">Building characters…</div>';setTimeout(()=>{
  const med=a=>{a=a.filter(x=>x>0).sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:0},f=x=>x===Infinity||x>=99?'never':x.toFixed(1);
  const rows=[];for(let tier=1;tier<=10;tier++){const L=10*tier-5,rn=(REALMS.find(r=>r.tier===tier)||{}).n;const M=MONSTERS.filter(m=>m.sb&&(REALM[m.realm]||{}).tier===tier);if(!M.length)continue;
    const mon={hp:med(M.map(m=>+m.sb.hp)),ac:med(M.map(m=>+m.sb.ac)),h:med(M.map(m=>monHits(m.sb).h)),n:med(M.map(m=>monHits(m.sb).n))};
    const cell=cls=>{const S=[];for(let i=0;i<3;i++){const c=genFill({cls,level:L}).c,s=charStats(c),inc=mon.n*acTaken(mon.h,s.ac,tier)*0.85,R0=charRound(c,rn,mon.ac),r=R0.v*0.85;S.push({kill:r>0?Math.max(0.5,(mon.hp-(R0.burst||0)*0.85)/r):99,drop:inc>0?(+c.hpMax)/inc:99,ac:s.ac,hp:+c.hpMax})}
      const av=k=>S.reduce((a,x)=>a+(k==='kill'||k==='drop'?Math.min(99,x[k]):x[k]),0)/S.length;return {kill:av('kill'),drop:av('drop'),ac:Math.round(av('ac')),hp:Math.round(av('hp'))}};
    rows.push({tier,L,rn,mon,c:['Fighter','Wizard','Rogue','Cleric'].map(cell),all:BAL_ALL.map(k=>['Fighter','Wizard','Rogue','Cleric'].includes(k)?null:cell(k))});rows[rows.length-1].all=rows[rows.length-1].all.map((x,i)=>x||rows[rows.length-1].c[['Fighter','Wizard','Rogue','Cleric'].indexOf(BAL_ALL[i])])}
  const flag=x=>x.drop>=10?' style="color:var(--blue,#5a8dd6)" title="Barely hurt: the monster\'s hits hardly get past this AC"':x.drop<1.5?' style="color:var(--red)" title="Drops very fast"':'';
  el.innerHTML=`<div class="tablewrap"><table class="t"><thead><tr><th>Realm (level)</th><th>Typical monster</th>${['Fighter','Wizard','Rogue','Cleric'].map(k=>`<th>${k}<br><small>kills in · drops in</small></th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.rn)}</b> <small>(${r.L})</small></td><td><small>HP ${fmt(r.mon.hp)} · AC ${r.mon.ac} · ${r.mon.n}×${r.mon.h}</small></td>${r.c.map(x=>`<td><span>${f(x.kill)}</span> · <span${flag(x)}>${f(x.drop)}</span><br><small style="color:var(--muted)">AC ${x.ac} · HP ${fmt(x.hp)}</small></td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="note" style="margin:6px 0 0">Rounds for one character alone to kill one typical monster, and for that monster to drop them. Blue: the monster barely hurts them; red: they drop in under a round and a half. Sample characters are random, so numbers move a little between runs. Class damage riders (Sneak Attack, Rage, Divine Smite, Hunter's Mark, Hex, Martial Arts and Flurry of Blows) are counted, and a Fighter's Action Surge counts as one extra round (two from level 17).</div>
  <details class="fold" style="margin-top:8px"><summary><b>Every class</b> <small style="color:var(--muted)">rounds to kill the typical monster alone</small></summary><div class="tablewrap"><table class="t"><thead><tr><th>Realm</th>${BAL_ALL.map(k=>`<th class="num">${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>{const mid=[...r.all.map(x=>x.kill)].sort((a,b)=>a-b)[Math.floor(r.all.length/2)];return `<tr><td><b>${esc(r.rn)}</b></td>${r.all.map(x=>`<td class="num"${x.kill>mid*1.6?' style="color:var(--red)" title="Much slower than the middle class here"':''}>${f(x.kill)}</td>`).join('')}</tr>`}).join('')}</tbody></table></div><div class="note" style="margin:6px 0 0">Red: more than 1.6 times as slow as the middle class in that realm.</div></details>`},30)}
const BAL_ALL=['Fighter','Barbarian','Paladin','Ranger','Monk','Rogue','Wizard','Sorcerer','Warlock','Cleric','Druid','Bard','Artificer'];
function encSpoils(){const st=store.get('enc',{}),list=(st.list||[]).map(([n,k])=>({m:MON_IDX.get(lc(n)),k})).filter(x=>x.m);if(!list.length){toast('Build an encounter first');return}
  const count=list.reduce((a,x)=>a+x.k,0),adj=list.reduce((a,x)=>a+monXP(x.m)*x.k,0)*xpMult(count),th=encBudget(st);let di=-1;th.forEach((t,i)=>{if(adj>=t)di=i});
  const realm=st.realm||list[0].m.realm,sz=list.some(x=>x.m.champ)||DIFFS[di]==='Deadly'?2:di>=1?1:0,T=rollTreasure(realm,+st.level||1,sz),c=spoilCoins(T.gold,realm,T.favor),el=$('en-spoils');if(!el)return;
  el.innerHTML=`<div class="note" style="margin:0 0 6px"><b>Likely spoils:</b> ${esc(SPOIL_SIZE[sz])} (${esc(di<0?'Trivial':DIFFS[di])} fight). One roll; the real haul is rolled when the fight ends in the combat tracker.</div><div class="chips"><span class="chip" style="cursor:default">${c.favor?'⟡':'🪙'} ${fmt(c.n)} ${esc(c.pl)}</span>${T.mats.map(x=>refChip(x.m,(x.q>1?x.q+'× ':'')+esc(x.m.n),'G'+x.m.g)).join('')}${T.items.map(b=>refChip(b,esc(b.n),b.r)).join('')}</div>${role()!=='player'?`<div style="margin-top:8px"><button class="btn" onclick="encToLoot()" title="Put this treasure in the loot pool to hand out">💰 Send to the loot pool</button></div>`:''}`;
  ENC_LAST={realm,gp:c.favor?0:Math.round(T.gold*100)/100,favor:c.favor||0,items:T.mats.map(x=>({n:x.m.n,q:x.q})).concat(T.items.map(b=>({n:b.n,q:1}))),from:list.map(x=>(x.k>1?x.k+' × ':'')+x.m.n).join(', ')}}
var ENC_LAST=null;
// the previewed treasure goes into the loot pool, ready to give out (coin in gp; Favor is a god's, so it stays out)
function encToLoot(){const E=ENC_LAST;if(!E)return;const P=lootPool();E.items.forEach(x=>{const r=P.items.find(y=>lc(y.n)===lc(x.n));if(r)r.q+=x.q;else P.items.push({n:x.n,q:x.q})});P.gp=Math.round((P.gp+E.gp)*100)/100;if(!P.from)P.from='the fight with '+E.from;store.set('lootpool',P);
  actToast(`Sent to the loot pool: ${E.items.length} item${E.items.length===1?'':'s'}${E.gp?' and '+gp(E.gp):''}${E.favor?' (the Favor stays with the god: award it by hand)':''}`,'Open the pool',()=>lootOpen())}
function sendToCombat(){
  const st=store.get('enc',{}),cb=store.get('combat',{round:1,turn:0,list:[]});
  const fresh={};(st.list||[]).forEach(([n,k])=>{const m=MON_IDX.get(lc(n));if(!m)return;const have=cb.list.filter(x=>x.mon===m.n).length;for(let i=0;i<k;i++){const x=monCombatant(m,k>1||have?have+i+1:0);cb.list.push(x);(fresh[m.n]=fresh[m.n]||[]).push(x)}});
  // each of a monster's copies brings its summons, linked to it in the tracker
  encSums(st).forEach(S=>(fresh[S.by]||[]).forEach(by=>cb.list.push(...summonMake(cb.list,by,S.mon,S.n,S.r,S.own))));if(encSums(st).length)cb.list=cbOrder(cb.list);
  PARTY.forEach(c=>{if(!cb.list.some(x=>x.pc===c.id))cb.list.push({id:uid(),name:c.name||'PC',pc:c.id,init:0,dex:0,hp:hpNow(c),max:+c.hpMax||0,thp:+c.tempHp||0,ac:charStats(c).ac,cond:[]})});
  store.set('combat',cb);go('combat');
}
// monsters follow the same rule as characters: initiative is a plain d20 (no DEX); dex holds any initiative bonus from features
function monCombatant(m,i){return {id:uid(),name:m.n+(i?' '+i:''),mon:m.n,init:0,dex:0,hp:m.sb?m.sb.hp:10,max:m.sb?m.sb.hp:10,ac:m.sb?m.sb.ac:0,dodge:m.sb?sbDodge(m.sb):0,cond:[]}}
// Dodge of a combatant: what it was given, else its DEX modifier from its stat block or character sheet
function cbDodge(x){if(x.dodge!=null)return x.dodge;const m=x.mon&&MON_IDX.get(lc(x.mon));if(m&&m.sb)return sbDodge(m.sb);const c=x.pc&&PARTY.find(p=>p.id===x.pc);return dodgeOf(c&&(c.abil||{}).dex)}

// ── Combat ────────────────────────────────────────────────────
let CB=null;
// Player characters' HP lives on the Party page: Combat reads it when it draws and writes damage and healing back
function cbPullHP(C){let ch=0;(C.list||[]).forEach(x=>{if(x.art){const c=PARTY.find(p=>p.id===x.art.pc),A=c&&artNow(c);if(A){const hp=A.dead?0:A.cur;if(x.hp!==hp||x.max!==A.hp){x.hp=hp;x.max=A.hp;ch=1}}return}if(x.bond){const c=PARTY.find(p=>p.id===x.bond.pc),s=c&&(c.bonds||[])[x.bond.i];if(s){const N=bondNow(c,s),hp=s.dead?0:N.cur;if(x.hp!==hp||x.max!==N.hp){x.hp=hp;x.max=N.hp;ch=1}}return}if(!x.pc)return;const c=PARTY.find(p=>p.id===x.pc);if(!c)return;const mx=+c.hpMax||x.max,hp=c.hp===''||c.hp==null?mx:Math.max(0,+c.hp||0),t=+c.tempHp||0,D=dsFromSheet(c);if(x.hp!==hp||x.max!==mx||(+x.thp||0)!==t||JSON.stringify(x.ds||{s:0,f:0})!==JSON.stringify(D)){x.hp=hp;x.max=mx;x.thp=t;x.ds=D;ch=1}});return ch}
// death saves: the tracker counts them (s, f: 0-3); the sheet keeps three tick boxes for each
// a character's current HP: empty (a new character) means full health, never 0
const hpNow=c=>c.hp===''||c.hp==null?(+c.hpMax||0):Math.max(0,+c.hp||0);
const dsFromSheet=c=>{const d=c.ds||{};return {s:[0,1,2].filter(i=>d['s'+i]).length,f:[0,1,2].filter(i=>d['f'+i]).length}};
const dsToSheet=D=>{const o={};for(let i=0;i<3;i++){if(i<D.s)o['s'+i]=true;if(i<D.f)o['f'+i]=true}return o};
function cbPushHP(C){let ch=0;(C.list||[]).forEach(x=>{if(x.art){const c=PARTY.find(p=>p.id===x.art.pc),K=c&&c.construct;if(K){const hp=Math.max(0,+x.hp||0);if(+K.hp!==hp||K.hp==null){K.hp=hp;ch=1}if(hp<=0&&!K.dead){K.dead=true;ch=1}else if(hp>0&&K.dead){delete K.dead;ch=1}}return}if(x.bond){const c=PARTY.find(p=>p.id===x.bond.pc),s=c&&(c.bonds||[])[x.bond.i];if(s){const hp=Math.max(0,+x.hp||0);if(+s.hp!==hp||s.hp==null){s.hp=hp;ch=1}if(hp<=0&&!s.dead){s.dead=true;ch=1}else if(hp>0&&s.dead){delete s.dead;ch=1}}return}if(!x.pc)return;const c=PARTY.find(p=>p.id===x.pc);if(!c)return;if(+c.hp!==x.hp||c.hp===''){c.hp=x.hp;ch=1}const t=+x.thp||0;if((+c.tempHp||0)!==t){c.tempHp=t||'';ch=1}const D=x.ds||{s:0,f:0};if(JSON.stringify(dsFromSheet(c))!==JSON.stringify({s:D.s||0,f:D.f||0})){c.ds=dsToSheet(D);ch=1}});if(ch)saveParty()}
const saveCB=()=>{store.set('combat',CB);cbPushHP(CB)};
// ════════════════════════════════════════════════════════════════
//  Adventure hooks: built from the gods, Runes, realms, monsters, and materials on this site
// ════════════════════════════════════════════════════════════════
// One treasure roller for the Tools page and Spoils: gold at the realm's prices, materials of the realm at a grade that
// fits the party's level, and a chance of a named item. sz: 0 a pouch (one foe), 1 a chest (an encounter), 2 a hoard.
function rollTreasure(rn,lv,sz,R){R=R||Math.random;const pk=a=>a[Math.floor(R()*a.length)];
  // Favor realms (the Void and deeper, where nothing is bought with coin) pay Favor instead of gold: a level's treasure
  // there is worth about two of the realm's 9th-level spells (owner's request, 2026-11-05)
  const start=towerStart(rn),over=Math.max(0,lv-start),fb=favorBase((REALM[rn]||{tier:1}).tier),roll=(1+0.15*Math.min(over,20))*(0.6+R()*0.8);
  const gold=fb?0:Math.max(1,Math.round(realmBase(rn)*[2,8,30][sz]*roll)),favor=fb?Math.max(1,Math.round(fb*[1,4,15][sz]*roll)):0;
  const grade=Math.max(1,Math.min(10,1+Math.max(0,lv-start))),mats=[];
  for(let k=0,n=[1,2+Math.floor(R()*2),4+Math.floor(R()*3)][sz];k<n;k++){const gg=Math.max(1,Math.min(10,grade+(R()<.25?1:0)-(R()<.25?1:0))),pool=MATS.filter(m=>m.realm===rn&&!m.gen&&m.g===gg);if(pool.length){const m=pk(pool),had=mats.find(x=>x.m===m);had?had.q++:mats.push({m,q:1+(sz===2?Math.floor(R()*3):0)})}}
  const RAR=['Common','Uncommon','Rare','Very Rare','Legendary'],BL=Math.min(20,lv),rmax=RAR[Math.min(4,Math.floor((BL-1)/4)+(sz===2?1:0))];
  const items=[];for(const ch of [[.15,.5,1][sz],sz===2?.5:0]){if(R()<ch){const bp=BPS.filter(b=>!b.design&&b.lv<=BL+1&&b.lv>=Math.max(1,BL-3)&&RAR.indexOf(b.r)<=RAR.indexOf(rmax)&&!['Food','Crop','Fertilizer','Livestock','Structure','Fortification','Siege Engine','Vehicle'].includes(b.cat));if(bp.length)items.push(pk(bp))}}
  return {start,gold,favor,grade,mats,items,val:gold+mats.reduce((a,x)=>a+(x.m.price||0)*x.q,0)}}
function rng32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const HOOK_KINDS=[['contract','A god\'s contract'],['rival','A Rune feud'],['progenitor','A progenitor\'s remains'],['hunt','A hunt'],['craft','A commission'],['pact','A dark offer'],['inane','Signs of Inane']];
function hookRealms(level,realm){const k=stageOf(level);const rs=REALMS.filter(r=>realm?r.n===realm:tierStage(r.tier)<=k&&r.tier<=Math.max(2,bandOf(level)+1));return rs.length?rs:REALMS.filter(r=>r.tier===1)}
function makeHook(kind,R,level,realm){
  const pk=a=>a.length?a[Math.floor(R()*a.length)]:null;
  const rs=hookRealms(level,realm),r=pk(rs),a=x=>refChip(x,esc(x._t==='god'?godKey(x):x.n));
  const mons=MONSTERS.filter(m=>rs.includes(REALM[m.realm])&&crNum(m.sb?m.sb.cr:m.cr)<=level+2&&crNum(m.sb?m.sb.cr:m.cr)>=Math.max(0,level-6));
  const mats=MATS.filter(m=>rs.includes(REALM[m.realm])&&m.price);
  const reward=Math.round((50+level*level*40)*(0.75+R()*0.5)/10)*10;
  if(kind==='contract'){const g=pk(GODS.filter(g=>g.wants));if(!g)return null;const sig=(g.sig||[]).map(findMat).filter(Boolean);const m=pk(sig);
    return {g,text:`A ${pk(['Minor','Normal','Major','newly contracted'])} servant of ${a(g)} comes to the party with an offer. The god wants this: <i>${esc(g.wants.replace(/\.$/,''))}</i>.${m?` The servant also needs ${a(m)}, one of the god's signature materials${m.where?`, found at ${esc(m.where)}`:''}.`:''} ${g.seated!=null&&g.seated<5?`${esc(godKey(g))} has open Finger seats (${g.seated} of 5 filled). Do well and one of them could be offered.`:`Success earns the god's favor and ${gp(reward)}.`}`}}
  if(kind==='rival'){const rn=pk(CONTESTED);if(!rn)return null;const gs=RUNE_GODS.get(rn)||[];const [x,y]=[...gs].sort(()=>R()-.5);const ru=RUNE_IDX.get(lc(rn));
    return {g:x,text:`${a(x)} and ${a(y)} both claim the ${ru?a(ru):esc(rn)} Rune. A Finger of ${esc(godKey(x))} asks the party to ${pk(['steal a relic tied to the Rune from a shrine of '+esc(godKey(y)),'escort a mortal who carries a sliver of the Rune to safety','find out who among '+esc(godKey(y))+'\'s contracted servants is selling secrets','break a contract '+esc(godKey(y))+' holds over a village'])}. Infinatas forbids open war between the gods, so neither side can be seen to act. Whoever the party helps, the other god remembers.`}}
  if(kind==='progenitor'){const ru=pk(RUNES.filter(x=>x.fig&&x.fig.fate&&x.fig.fate!=='Never lost'));if(!ru)return null;const f=ru.fig;
    return {g:null,text:`Word spreads that remains of <b>${esc(f.name)}</b>${f.title?`, ${esc(f.title)},`:''} the progenitor of the ${a(ru)} Rune, have surfaced in the ${esc(r.n)} Realm${f.remains?`: ${esc(f.remains)}`:''}. ${f.fate==='Vanished'?'Some say the progenitor only vanished, and that whatever was found is still warm.':'The progenitor was killed long ago, but its remains still hold the Rune\'s power.'} ${(ru.gods||[]).length?`${ru.gods.map(a).join(' and ')} will want it.`:'No god holds this Rune yet, so whoever takes the remains could become its holder.'}`}}
  if(kind==='hunt'){const m=pk(mons);if(!m)return null;const d=(m.drops||[]).map(x=>findMat(x[0])).filter(Boolean);const best=d.sort((p,q)=>(q.price||0)-(p.price||0))[0];
    return {g:null,text:`A ${a(m)} has been seen near a ${pk(['mining town','river crossing','monastery','border fort','market road','farming village'])} in the ${esc(m.realm)} Realm${m.sb?` (CR ${esc(m.sb.cr)})`:''}. The locals offer ${gp(reward)}${best?`, and its ${a(best)} alone is worth ${gp(best.price)} to the right buyer`:''}. ${pk(['It is not hunting. Something drove it out of its lair.','It has taken a hostage, or something it treats like one.','Another party went after it first and has not come back.','A god\'s servant wants it taken alive.'])}`}}
  if(kind==='craft'){const b=pk(BPS.filter(b=>b.lv<=level+2&&b.lv>=Math.max(1,level-4)&&b.mats.length));if(!b)return null;const ms=b.mats.map(findMat).filter(Boolean);const m=ms.sort((p,q)=>(q.rank||0)-(p.rank||0))[0];
    return {g:null,text:`A ${pk(['master smith','guild alchemist','court enchanter','retired adventurer','temple artificer'])} has a commission for ${a(b)} and cannot finish it without ${m?a(m):'one rare material'}${m&&m.where?`, gathered at ${esc(m.where)}`:m&&m.from&&m.from.length?`, taken from a ${esc(m.from[0])}`:''}. They offer ${gp(reward)}, or the finished piece at cost.`}}
  if(kind==='pact'){const e=pk([...DEMONS,...PATRONS].filter(e=>e.ds));if(!e)return null;
    return {g:null,text:`A stranger who speaks for ${a(e)} makes the party an offer: ${pk(['power now, and a favor named later','a cure for a dying friend','the location of a progenitor\'s remains','a way past a god\'s contract'])}. <span class="note">${esc(e.ds)}</span>`}}
  if(kind==='inane'){const pl=pk(['a village','a stretch of forest','a castle','an old road','a monastery','a lake']);
    return {g:null,text:`In the ${esc(r.n)} Realm, ${pl} is wearing away: stone crumbles, wood rots, and the people there remember less every day, as if centuries are passing in a few weeks. Scholars of the Runes whisper that this is how the gods' old world ended. Is it ${a(RUNE_IDX.get('destruction')||RUNES[0])} working on its own, or has someone found a way to call on Inane?`}}
  return null;
}
// NPCs built from the world: a name, a contract with a god (and its rank), a profession, what they want, what they carry.
const NPC_FIRST=['Aldric','Brenna','Corvin','Dalia','Edda','Fenn','Garreth','Hesta','Ivo','Jora','Kael','Liora','Maren','Nils','Orla','Pell','Quill','Rhea','Soren','Tamsin','Ulric','Vessa','Wren','Yara','Zeph','Ansel','Bryn','Cass','Doran','Elske'];
const NPC_LAST=['Ashdown','Brightwater','Coldbrook','Duskmantle','Emberly','Fairholt','Greystone','Hollowell','Ironwood','Kettering','Larkspur','Marrow','Nettleby','Oakhart','Pennick','Quarry','Ravensworth','Saltmarsh','Thistle','Underhill','Vane','Whitlock'];
const NPC_TRAITS=['speak only in questions when nervous','never sit with their back to a door','collect buttons from every town','owe money to three different temples','are terrified of birds','laugh at the wrong moments','keep a ledger of every favor','were once a Finger\'s servant','claim to have seen Inane\'s work','hum hymns to a god they don\'t serve'];
const NPC_LOOKS2=['a broken nose set crooked','ink-stained fingers','a voice too soft for their size','one grey eye and one brown','a coat patched with three other coats','burn scars up one arm','a shaved head painted with a god\'s sign','a missing front tooth they whistle through','rings on every finger, none of them gold','a limp they hide badly','hair braided with copper wire','a child\'s drawing pinned to their chest'];
const NPC_VOICE=['talks fast and finishes your sentences','answers every question with a price','calls everyone "friend" and means none of it','whispers, as if the walls are listening','swears by gods they do not serve','repeats the last word you said','laughs before the joke lands','never says a name aloud'];
const NPC_SECRETS=['is spying for a rival god\'s Hand','owes their life to a monster in the local Bestiary','stole the thing they are selling','is a climber who fled a Tower floor and left a friend behind','carries a Class Change Book they cannot read','has broken a god\'s contract and is hiding from its collectors','is not from this realm at all, and the Pressure is slowly killing them','knows where an unclaimed Rune\'s Tower door is'];
// how living in each realm marks a person
const NPC_MARK={Human:'sun-browned and ordinary',Mysterious:'blurred at the edges when you look away',Hell:'smelling faintly of smoke and old paper',Heaven:'too clean, and quiet when they walk',Chaos:'wearing clothes that never quite match twice',Abyss:'pale, with ears that pop when they talk','Inner Realm':'with skin that grows moss in the damp','Outer Realm':'with star-specks in their eyes','Void':'hard to hear, as if from far away','Inner Void':'unsure of their own birthday','Primordial':'with a shadow a moment late'};
function makeNPC(R,realm){
  const pk=a=>a[Math.floor(R()*a.length)],rs=realm?[REALM[realm]]:REALMS.filter(r=>r.tier<=3),r=pk(rs);
  const g=R()<.7?pk(GODS):null,rank=g?pk(['Minor','Minor','Normal','Normal','Major','Senior']):'';const ct=g&&contractOf(rank);
  const prof=pk(Object.keys(PROFS)),priced=MATS.filter(m=>m.realm===r.n&&!m.gen&&m.price),realmMats=priced.length?priced:MATS.filter(m=>m.realm===r.n&&!m.gen),low=realmMats.filter(m=>m.g<=4),mats=low.length?low:realmMats.filter(m=>m.g<=Math.min(...realmMats.map(x=>x.g))+1),carry=[...new Set([pk(mats),pk(mats)])].filter(Boolean);
  const look=pk(NPC_LOOKS2),voice=pk(NPC_VOICE),secret=pk(NPC_SECRETS),level=towerStart(r.n)+Math.floor(R()*10);
  // their class and subclass, at the stage their level has reached, with the abilities that stage has given them so far
  const cls=pk(Object.keys(CLASS_DIE)),k=stageOf(level),subs=SUBS.filter(x=>x.par===cls),sub=level>=3&&subs.length?pk(subs):null;
  const si=stageInfo(cls,level),abil=[...(si.st?si.st.features.filter(f=>f[0]<=level).slice(-2).map(f=>[f[1],f[2],si.name]):[]),...(sub?subFeats(sub.n,k,level).slice(-2).map(f=>[f[1],f[2],subStageName(sub.n,k)]):[])];
  return {cls,sub,k,abil,clsName:si.name,subName:sub?subStageName(sub.n,k):'',look,voice,secret,level,name:pk(NPC_FIRST)+' '+pk(NPC_LAST),realm:r,g,rank,ct,prof,trait:pk(NPC_TRAITS),want:g&&g.wants?`Serves ${godKey(g)}'s will: ${g.wants.charAt(0).toLowerCase()+g.wants.slice(1).replace(/\.$/,'')}.`:pk(['Wants to clear a family debt.','Wants passage to a higher realm.','Wants revenge on a contractor of a rival god.','Wants a rare material nobody will sell them.','Wants to be left alone.']),carry,purse:Math.round((5+R()*40)*realmBase(r.n)/5)};
}
const NPC_SHOWN=[];
function npcText(n){return `${n.name}, level ${n.level} ${n.clsName}${n.subName?' ('+n.subName+')':''}, ${n.prof}, from ${n.dim?n.dim+' in ':''}the ${/Realm$/.test(n.realm.n)?n.realm.n:n.realm.n+' Realm'}.${n.abil.length?' Abilities: '+n.abil.map(a=>a[0]+' ('+a[1]+')').join('; ')+'.':''} Looks: ${n.look}, ${NPC_MARK[n.realm.n]||'marked by their realm'}. Voice: ${n.voice}. ${n.g?`${n.rank} contract with ${godKey(n.g)}.`:'No god holds a contract with them.'} ${n.want} They ${n.trait}. Secret: ${n.secret}.`}
function npcSave(i){const n=NPC_SHOWN[i];if(!n)return;const J=store.get('journal',[]);J.push({t:'NPC: '+n.name,d:new Date().toISOString().slice(0,10),body:npcText(n)});store.set('journal',J);toast(n.name+' saved to the Journal')}
function npcHTML(n){
  const i=NPC_SHOWN.push(n)-1;
  return `<div class="callout" style="border-color:var(--acc)"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:1.1rem">${esc(n.name)}</b><span class="note" style="margin:0">Level ${n.level} ${esc(n.clsName)}${n.subName?' ('+esc(n.subName)+')':''} · ${esc(n.prof)} · from ${n.dim?esc(n.dim)+' in ':''}the ${esc(/Realm$/.test(n.realm.n)?n.realm.n:n.realm.n+' Realm')}</span><button class="btn" style="margin-left:auto;padding:3px 10px;font-size:.8rem" onclick="npcSave(${i})">Save to Journal</button><button class="btn" style="padding:3px 10px;font-size:.8rem" onclick="npcKeep(${i})" title="Keep them in your NPC roster">Keep in NPCs</button></div>
    <div style="line-height:1.6;margin-top:4px"><b>Looks:</b> ${esc(n.look)}; ${esc(NPC_MARK[n.realm.n]||'marked by their realm')}. <b>Voice:</b> ${esc(n.voice)}.</div>
    <div style="line-height:1.6;margin-top:4px">${n.g?`Holds a <b>${esc(n.rank)}</b> contract with ${refChip(n.g,esc(godKey(n.g)))}: ${esc(n.ct.power.charAt(0).toLowerCase()+n.ct.power.slice(1))}.`:'No god holds a contract with them.'} ${esc(n.want)} They ${esc(n.trait)}.
    ${n.abil.length||n.sub?`<details style="margin-top:4px"><summary class="note" style="margin:0;cursor:pointer">Class abilities</summary><div style="margin-top:4px;display:flex;flex-direction:column;gap:4px">${n.abil.length?n.abil.map(([a,t,from])=>`<div><b>${esc(a)}</b> <small style="color:var(--muted)">${esc(from)}</small>: ${esc(t)}</div>`).join(''):`<div><b>${esc(n.sub.n)}</b>: ${esc(String(n.sub.ds||'').replace(/\s*\([^()]*\)\s*$/,''))}</div>`}</div></details>`:''}
    <details style="margin-top:4px"><summary class="note" style="margin:0;cursor:pointer">DM: their secret</summary><div style="margin-top:4px">${esc(n.secret.charAt(0).toUpperCase()+n.secret.slice(1))}.</div></details>
    <span class="note" style="margin:0">Carries ${n.carry.length?n.carry.map(m=>refChip(m)).join(', ')+(n.carry.length>1?', and ':' and '):''}${gp(n.purse)}${localPrice(n.purse,n.realm.n)?` (${localPrice(n.purse,n.realm.n)})`:''}.</span></div></div>`;
}
// ════════════════════════════════════════════════════════════════
//  NPCs: the DM's roster of named NPCs (kept on this device; share one with the players as a handout)
// ════════════════════════════════════════════════════════════════
const NPC_ROLES=['Merchant','Innkeeper','Guard','Soldier','Noble','Priest','Mage','Scholar','Smith','Thief','Spy','Farmer','Hunter','Sailor','Healer','Bard','Contractor','Villain','Monster','Other'];
let NPCS=store.get('npcs',[]);if(!Array.isArray(NPCS))NPCS=[];NPCS=NPCS.filter(n=>n&&typeof n==='object'&&n.id);
let NPC_EDIT=null;
const npcSave2=()=>store.set('npcs',NPCS);
function npcPic(n,cls){const b=n.pic&&n.pic.b?n.pic.b:typeof ART!=='undefined'&&ART.npc?ART.icons[ART.npc[n.role]!=null?ART.npc[n.role]:ART.npc.Other]:'';if(!b)return '';
  const f=n.fac&&standInfo(n.fac),tint=n.realm&&n.realm!=='Human'&&REALM[n.realm]?rcol(n.realm):n.att<0?'#e2513f':n.att>0?'#5fd08a':'#d8c7a4';
  return `<span class="art ${cls||''}" style="--ac:${tint}" aria-hidden="true"><svg viewBox="0 0 512 512" focusable="false">${b}</svg></span>`}
function npcFromRandom(r){return {id:uid(),name:r.name,role:'Other',home:r.dim||'',title:'Works in '+lc(r.prof),fac:r.g?'god:'+godKey(r.g):'',realm:r.realm.n,att:0,looks:r.look+'; '+(NPC_MARK[r.realm.n]||'marked by their realm'),voice:r.voice,wants:r.want,secret:r.secret.charAt(0).toUpperCase()+r.secret.slice(1)+'.',
  notes:`Level ${r.level} ${r.clsName}${r.subName?' ('+r.subName+')':''}. They ${r.trait}.${r.g?' '+r.rank+' contract with '+godKey(r.g)+'.':''}`,d:new Date().toISOString().slice(0,10)}}
function npcRandom(){const n=npcFromRandom(makeNPC(rng32((Math.random()*4294967296)>>>0)));NPCS.unshift(n);npcSave2();NPC_EDIT=n.id;renderNpcs();toast(n.name+' added: change anything, then Save')}
// from the Hooks page's random NPCs
function npcKeep(i){const r=NPC_SHOWN[i];if(!r)return;const n=npcFromRandom(r);NPCS.unshift(n);npcSave2();actToast(n.name+' saved to your NPCs','Open',()=>go('npcs'))}
function npcNew(){const n={id:uid(),name:'',role:'Other',title:'',fac:'',realm:'Human',att:0,looks:'',voice:'',wants:'',secret:'',notes:'',d:new Date().toISOString().slice(0,10)};NPCS.unshift(n);npcSave2();NPC_EDIT=n.id;renderNpcs();setTimeout(()=>{const e=$('npc-name');if(e)e.focus()},0)}
function npcFormSave(){const n=NPCS.find(x=>x.id===NPC_EDIT);if(!n)return;const v=id=>(($(id)||{}).value||'').trim();
  n.name=v('npc-name')||'Unnamed';n.role=v('npc-role')||'Other';n.title=v('npc-title');n.fac=v('npc-fac');n.realm=v('npc-realm');n.att=+v('npc-att')||0;['looks','voice','wants','secret','notes'].forEach(k=>n[k]=v('npc-'+k));
  NPC_EDIT=null;npcSave2();renderNpcs();toast(n.name+' saved')}
function npcCancel(){const n=NPCS.find(x=>x.id===NPC_EDIT);if(n&&!n.name&&!n.looks&&!n.notes)NPCS=NPCS.filter(x=>x!==n),npcSave2();NPC_EDIT=null;renderNpcs()}
function npcDel(id){const i=NPCS.findIndex(x=>x.id===id);if(i<0)return;const [n]=NPCS.splice(i,1);npcSave2();if(NPC_EDIT===id)NPC_EDIT=null;renderNpcs();undoToast((n.name||'NPC')+' deleted',()=>{NPCS.splice(i,0,n);npcSave2();renderNpcs()})}
function npcPicture(id){const n=NPCS.find(x=>x.id===id);if(!n)return;artPicker({_t:'npc',n:n.name||'this NPC',pic:n.pic},pic=>{const was=n.pic;if(pic)n.pic=pic;else delete n.pic;npcSave2();renderNpcs();undoToast('Picture changed for '+(n.name||'the NPC'),()=>{if(was)n.pic=was;else delete n.pic;npcSave2();renderNpcs()})})}
const npcText2=(n,secret)=>[n.title||n.role!=='Other'?[n.role!=='Other'?n.role:'',n.title].filter(Boolean).join(', '):'',n.realm?'From the '+(/Realm$/.test(n.realm)?n.realm:n.realm+' Realm')+'.':'',n.fac?'Belongs to '+standInfo(n.fac).n+'.':'',n.looks?'Looks: '+n.looks+'.':'',n.voice?'Voice: '+n.voice+'.':'',n.wants?n.wants:'',secret&&n.secret?'Secret: '+n.secret:'',secret&&n.notes?n.notes:''].filter(Boolean).join(' ').replace(/\.\./g,'.');
// an NPC becomes a shopkeeper: a DM shop with their name, voice and realm, stocked for their trade (or open the one they have)
const NPC_SHOPKIND={Smith:'smith',Soldier:'smith',Guard:'smith',Hunter:'bowyer',Farmer:'general',Healer:'alch',Priest:'alch',Mage:'arcane',Scholar:'arcane',Contractor:'arcane',Noble:'jewel',Thief:'butcher',Spy:'butcher',Monster:'butcher',Sailor:'general',Merchant:'general',Innkeeper:'general',Bard:'general'};
function npcShop(id){const n=NPCS.find(x=>x.id===id);if(!n)return;const have=myShops().find(x=>x.npc===id);
  if(have){const S=shopState();S.custom=have.id;if(have.realm&&REALM[have.realm]&&REALM[have.realm].base)S.realm=have.realm;shopSave();go('shop');return}
  const realm=n.realm&&REALM[n.realm]&&REALM[n.realm].base?n.realm:'Human',kind=NPC_SHOPKIND[n.role]||'general',seed=[...String(id)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)>>>0,res=rollShop(realm,kind,2,seed,stageOf(+n.level||1));
  const items=res?res.mats.map(x=>({n:x.m.n,q:x.q,price:x.price})).concat(res.bps.map(x=>({n:x.b.n,q:1,price:x.price}))):[];
  const label=(SHOP_KINDS.find(k=>k[0]===kind)||[0,'Shop'])[1].split(' and ')[0];
  myShopEdit(null,{id:'',npc:id,name:`${n.name||'The NPC'}'s ${label}`,keeper:n.name||'',line:n.voice?`(${n.voice})`:'',realm,items:items.length?items:[{n:'',q:1,price:''}]})}
function npcHandout(id){const n=NPCS.find(x=>x.id===id);if(n)openHandout({t:n.name||'An NPC',k:'Character',b:npcText2(n,false)})}
function npcJournal(id){const n=NPCS.find(x=>x.id===id);if(!n)return;const J=store.get('journal',[]);J.push({t:'NPC: '+(n.name||'Unnamed'),d:new Date().toISOString().slice(0,10),body:npcText2(n,true)});store.set('journal',J);toast((n.name||'The NPC')+' noted in the journal')}
function npcFormHTML(n){const opt=(L,v)=>L.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join(''),cat=standCatalog(),grp=k=>cat.filter(f=>f.k===k);
  const facOpts=`<option value="">None</option>${['God','Magic Tower','Smiths','Faction'].map(k=>grp(k).length?`<optgroup label="${k==='Faction'?'Your factions':k+'s'}">${grp(k).map(f=>`<option value="${esc(f.id)}"${f.id===n.fac?' selected':''}>${esc(f.n)}</option>`).join('')}</optgroup>`:'').join('')}`;
  const ta=(k,l,ph)=>`<label style="grid-column:1/-1">${l}<textarea class="sel" id="npc-${k}" rows="2" placeholder="${esc(ph)}" style="max-width:none;width:100%">${esc(n[k]||'')}</textarea></label>`;
  return `<div class="tool" style="margin-bottom:14px"><div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><button type="button" class="art-edit" onclick="npcPicture('${n.id}')" title="Choose a picture" aria-label="Choose a picture">${npcPic(n,'lg')}<span class="art-pen" aria-hidden="true">✎</span></button>
    <div class="form" style="flex:1;min-width:260px;grid-template-columns:repeat(3,1fr)"><label>Name<input class="sel" id="npc-name" value="${esc(n.name)}" placeholder="Hesta Coldbrook"></label><label>Role<select class="sel" id="npc-role">${opt(NPC_ROLES,n.role)}</select></label><label>Title<input class="sel" id="npc-title" value="${esc(n.title||'')}" placeholder="Harbourmaster of Greyport"></label>
    <label>Faction<select class="sel" id="npc-fac">${facOpts}</select></label><label>Realm<select class="sel" id="npc-realm">${REALMS.map(r=>`<option${r.n===n.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label><label>Attitude to the party<select class="sel" id="npc-att">${STAND.map(x=>`<option value="${x[0]}"${x[0]===(+n.att||0)?' selected':''}>${esc(x[1])}</option>`).join('')}</select></label>
    ${ta('looks','Looks','A broken nose set crooked; smells faintly of tar')}${ta('voice','Voice and manner','Answers every question with a price')}${ta('wants','Wants','Wants passage to a higher realm')}${ta('secret','Secret (only you see this)','Owes their life to a monster in the local Bestiary')}${ta('notes','Notes','Where the party met them, what they promised')}</div></div>
    <div style="display:flex;gap:8px;margin-top:10px"><button class="btn primary" onclick="npcFormSave()">Save</button><button class="btn" onclick="npcCancel()">Cancel</button></div></div>`}
function npcCardHTML(n){const f=n.fac?standInfo(n.fac):null;
  return `<div class="card" style="cursor:default"><div class="t">${npcPic(n)}<div class="nm">${esc(n.name||'Unnamed')}<div class="ep" style="font-weight:400;font-size:.86rem;margin-top:2px">${esc([n.role!=='Other'?n.role:'',n.title].filter(Boolean).join(' · ')||'NPC')}</div></div></div>
    <div class="badges">${standPill(+n.att||0)}${n.realm?realmB(n.realm):''}${f?`<span class="b acc">${esc(f.n)}</span>`:''}</div>
    ${n.voice?`<div class="ln"><b>Voice:</b> ${esc(n.voice)}</div>`:''}${n.wants?`<div class="ds">${esc(n.wants)}</div>`:''}
    ${n.secret?`<details><summary class="note" style="cursor:pointer;margin:0">Secret</summary><div class="ds">${esc(n.secret)}</div></details>`:''}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px"><button class="btn" style="padding:3px 10px" onclick="NPC_EDIT='${n.id}';renderNpcs();window.scrollTo&&$('content').scrollTo(0,0)">Edit</button><button class="btn" style="padding:3px 10px" onclick="npcHandout('${n.id}')" title="Share with the players (the secret stays out)">📜 Handout</button><button class="btn" onclick="npcShop('${n.id}')" title="${myShops().some(x=>x.npc===n.id)?'Open their shop':'Make them a shopkeeper with a shop of their own'}">🛒 ${myShops().some(x=>x.npc===n.id)?'Their shop':'Shop'}</button><button class="btn" style="padding:3px 10px" onclick="npcJournal('${n.id}')">📓 Journal</button><button class="btn" style="padding:3px 10px" onclick="npcDel('${n.id}')" aria-label="Delete ${esc(n.name||'NPC')}">✕</button></div></div>`}
// any redraw of the roster (a keystroke, or a sync arriving) keeps the cursor where it was in the search box
function renderNpcs(){const a=document.activeElement,keep=a&&a.id==='npc-q'?[a.selectionStart,a.selectionEnd]:null;renderNpcs0();if(keep){const n=$('npc-q');if(n&&document.activeElement!==n){n.focus();try{n.setSelectionRange(keep[0],keep[1])}catch(e){}}}}
function renderNpcs0(){if(!dmUnlocked())return npcLocked();const S=store.get('npcf',{q:'',fac:''}),q=lc(S.q||''),ed=NPCS.find(x=>x.id===NPC_EDIT);
  const L=NPCS.filter(n=>(!S.fac||n.fac===S.fac)&&(!q||lc([n.name,n.role,n.title,n.realm,n.looks,n.voice,n.wants,n.notes,n.fac&&standInfo(n.fac).n].join(' ')).includes(q)));
  const facs=[...new Set(NPCS.map(n=>n.fac).filter(Boolean))].map(standInfo);
  $('content').innerHTML=`<div class="page"><div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">NPCs</h3><p>Your roster of named NPCs: a face, a role, who they answer to, how they feel about the party, and what they hide. Kept on this device; share one with the players as a handout.</p>
      <span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button class="btn primary" onclick="npcNew()">+ New NPC</button><button class="btn" onclick="npcRandom()" title="A random NPC from the world of Vestige">🎲 Random NPC</button></span></div>
    ${ed?npcFormHTML(ed):''}
    ${NPCS.length?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><input class="sel" id="npc-q" type="search" placeholder="Search NPCs…" value="${esc(S.q||'')}" style="max-width:280px" aria-label="Search NPCs"><select class="sel" id="npc-ff" style="max-width:240px" aria-label="Filter by faction"><option value="">Every faction</option>${facs.map(f=>`<option value="${esc(f.id)}"${f.id===S.fac?' selected':''}>${esc(f.n)}</option>`).join('')}</select><span class="note" style="margin:auto 0">${fmt(L.length)} of ${fmt(NPCS.length)}</span></div>
      <div class="grid">${L.map(npcCardHTML).join('')||'<div class="empty"><b>Nothing matches</b>Try a different search.</div>'}</div>`:`<div class="empty"><b>No NPCs yet</b>Make one, roll a random one, or keep one from the Hooks page.<div style="margin-top:12px;display:flex;gap:8px;justify-content:center"><button class="btn primary" onclick="npcNew()">+ New NPC</button><button class="btn" onclick="npcRandom()">🎲 Random NPC</button></div></div>`}</div>`;
  const qi=$('npc-q');if(qi)qi.oninput=e=>{store.set('npcf',Object.assign(S,{q:e.target.value}));const pos=e.target.selectionStart;renderNpcs();const n=$('npc-q');if(n){n.focus();n.setSelectionRange(pos,pos)}};
  const ff=$('npc-ff');if(ff)ff.onchange=e=>{store.set('npcf',Object.assign(S,{fac:e.target.value}));renderNpcs()}}
async function npcLocked(){await hcAuto();if(TAB!=='npcs')return;if(dmUnlocked())return renderNpcs();
  const lock=quickModes().length&&!PAT_SKIP&&window.crypto&&crypto.subtle?patLockHTML('renderNpcs'):hcLockHTML();
  $('content').innerHTML=`<div class="page"><div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">NPCs</h3><p>The DM's roster of NPCs, with their secrets. It opens with the DM code.</p></div>${lock}</div>`;
  if($('hc-pat')||$('hc-pin'))patLockBind(renderNpcs);else hcBindLock(renderNpcs)}
// ════════════════════════════════════════════════════════════════
//  Character generator: a whole level 1 character in one tap. Every choice the builder would ask for is made by the
//  builder's own rules (random, or what the player picked), then shown as a card to keep, reroll, or fine-tune.
// ════════════════════════════════════════════════════════════════
let CGEN=null,CGEN_HIST=[];
function genFill(o){o=o||{};const lvTo=Math.max(1,Math.min(MAX_LEVEL,Math.round(+o.level)||1));CW={step:0,cls:'',race:'',method:o.method==='roll'?'roll':'std',bg:'',name:'',align:'',traits:cwPick(CW_PERS.traits),ideals:cwPick(CW_PERS.ideals),bonds:cwPick(CW_PERS.bonds),flaws:cwPick(CW_PERS.flaws)};
  CW.cls=CW_CLASS[o.cls]?o.cls:cwPick(Object.keys(CW_CLASS));CW.race=CW_RACE.some(x=>x[0]===o.race)?o.race:o.fam&&famMembers(o.fam).length?cwPick(famMembers(o.fam)):cwPick(CW_RACE)[0];CW.ro={};roRandom();
  if(o.her){const pool=o.her==='random'?CW_RACE.map(r=>r[0]).filter(n=>famOf(n)!==famOf(CW.race)):famMembers(o.her).filter(n=>n!==CW.race);if(pool.length){CW.race2=cwPick(pool);const T=heritageTraits(CW.race2);if(T.length)CW.race2Trait=cwPick(T)[0]}}
  if(CW.method==='roll')CW.rolled=cwRoll();
  CW.bg=CW_BG.some(x=>x[0]===o.bg)?o.bg:cwPick(CW_BG)[0];cwSkillInit();
  const bg=CW_BG.find(x=>x[0]===CW.bg);if(bg&&bg[4])CW.disSkill=cwPick(SKILLS)[0];
  if(!CW.prof)CW.prof=cwPick(CW_PROF_GROUPS.flatMap(g=>g[1]));
  CW.langR=cwLangGuess(CW.race)||cwPick(CW_LANGS);const lb=cwLangGuess(CW.bg,1);CW.langB=lb&&lb!==CW.langR?lb:cwPick(CW_LANGS.filter(x=>x!==CW.langR));
  if(STYLE_AT[CW.cls]===1)CW.style=cwPick(FIGHT_STYLES)[0];
  if(CW_SPELLS[CW.cls]){const sc=cwSchoolOpts().slice(0,3);CW.school=(cwPick(sc)||[])[0];const [nc,n1]=CW_SPELLS[CW.cls];CW.sp0=cwShuffle(cwSchoolSpells(0)).slice(0,nc).map(x=>x.n);CW.sp1=cwShuffle(cwSchoolSpells(1)).slice(0,n1).map(x=>x.n)}
  CW.eqMode='kit';CW.align=cwPick(CW_ALIGN)[0];CW.name=String(o.name||'').trim()||cwName();
  const cw=JSON.parse(JSON.stringify(CW)),c=cwBuild();CW=null;if(lvTo>1){genLevel(c,lvTo);genGear(c,lvTo)}armFit(c);return {c,cw}}
// from level 1 to the level asked for, one level at a time, by the level-up window's rules: average hit points, a subclass at
// level 3, the school point (into the main school until it reaches the highest spell level, then sometimes another), the level's new spells, ability score
// improvements into the class's best abilities, and a Fighting Style when it opens
function genLevel(c,to){to=Math.max(1,Math.min(MAX_LEVEL,Math.round(+to)||1));const hd=CLASS_DIE[c.cls]||8,pri=(CW_CLASS[c.cls]||{}).o||ABIL.map(a=>a[0]),keep=LVL;
  while((+c.level||1)<to){const before=+c.level||1;c.level=before+1;
    LVL={id:c.id,from:before,hp:String(Math.max(1,Math.floor(hd/2)+1+mod((c.abil||{}).con))),sub:'',sch:'',sp:[],q:'',chk:{}};
    if(c.level>=3&&!c.sub&&c.cls){const subs=SUBS.filter(x=>x.par===c.cls);if(subs.length)LVL.sub=cwPick(subs).n}
    const cc=lvlCaster(c);
    if(cc&&SP.length){const own=(c.schools||[]).filter(x=>x&&x.n),pts=c.level-own.reduce((a,x)=>a+x.m,0);
      if(pts>0){const fresh=allSchools().filter(([n])=>!own.some(x=>x.n===n)&&schoolOk(c,n,own));
        // the main school (most mastery) takes every point until it unlocks the highest spell level the next level allows
        // (mastery 2×level−1), so it never falls behind; only a point beyond that may sometimes go to another school
        if(own.length){const L=Math.min(MAX_LEVEL,(+c.level||1)+1),L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,cap=schoolMax(cc,99,mcSlots(c,L-L2,L2)),
            p=own.reduce((b,x,i)=>x.m>own[b].m?i:b,0),others=own.map((x,i)=>i).filter(i=>i!==p);
          LVL.sch=own[p].m<Math.max(1,2*cap-1)||Math.random()<.7?'up:'+p:fresh.length&&(!others.length||Math.random()<.6)?'new:'+cwPick(fresh)[0]:others.length?'up:'+cwPick(others):'up:'+p}
        else LVL.sch=fresh.length?'new:'+cwPick(fresh)[0]:''}
      const n=LV_SPELLS(cc),pool=lvlPool(c);if(n&&pool.length){const top=pool[0].lv,near=pool.filter(x=>x.lv>=top-1);LVL.sp=cwShuffle(near.length>=n?near:pool).slice(0,n).map(x=>x.n)}}
    const items=lvlItems(c);LVL.items=items;items.forEach(x=>LVL.chk[x.id]=true);
    if(items.some(x=>x.asi)){const a=pri.find(k=>(+c.abil[k]||10)<=18);if(a)LVL.asi={mode:'2',a,b:''};else{const L2=pri.filter(k=>(+c.abil[k]||10)<20);LVL.asi=L2.length>=2?{mode:'11',a:L2[0],b:L2[1]}:{mode:'2',a:'',b:''}}}
    if(items.some(x=>x.style))LVL.style=cwPick(FIGHT_STYLES)[0];
    lvlCommit(c)}
  LVL=keep;c.hp=c.hpMax;if(to>1)c.log=(c.log||[]).concat({d:new Date().toISOString().slice(0,10),deed:'Made by the character generator at level '+to,lv:to});return c}
// gear for the level: every weapon, armor, and shield from the starting kit becomes a vault version of the same design
// (a Longsword stays a Longsword, and light armor stays light) at or below the character's level, picked from the closest levels; then potions,
// artifacts, and coin that grow with the level. Packs and tools stay as they are.
function genGear(c,L){if(L<=1)return c;const near=list=>{const ok=list.filter(b=>(+b.lv||1)<=L);if(!ok.length)return null;const top=Math.max(...ok.map(b=>+b.lv||1)),band=ok.filter(b=>(+b.lv||1)>=Math.max(1,Math.min(top,L)-9));return cwPick(band.length?band:ok)};
  const pick={},up=[];c.gear=(c.gear||[]).map(n=>{const x=BPS.find(b=>b.n===n),g=x&&genOf(x);if(!g)return n;const key=g+(x.cat==='Armor'?'|'+armorPiece(x).weight+'|'+armorPiece(x).slot:'');if(!(key in pick)){const same=b=>x.cat!=='Armor'||(armorPiece(b).weight===armorPiece(x).weight&&armorPiece(b).slot===armorPiece(x).slot),v=near((BP_BY_GEN().get(g)||[]).filter(b=>b.n!==n&&same(b)));pick[key]=v&&(+v.lv||1)>(+x.lv||1)?v.n:null;if(pick[key])up.push(pick[key])}return pick[key]||n});
  const extra=(cat,k)=>{const L2=BPS.filter(b=>(b.cat0||b.cat)===cat&&(+b.lv||1)<=L&&!c.gear.includes(b.n)),out=[];for(let i=0;i<k&&L2.length;i++){const v=near(L2.filter(b=>!out.includes(b.n)));if(!v)break;out.push(v.n)}return out};
  const pots=extra('Potion',Math.min(5,1+Math.floor(L/10))),arts=extra('Artifact',L>=50?3:L>=20?2:L>=5?1:0);
  pots.forEach(n=>invAdd(c,n,1,1,true));arts.forEach(n=>c.gear.push(n));
  const gold=genGold(L),fv=genFavor(L);c.coins=c.coins||{};c.coins.gp=(+c.coins.gp||0)+gold;if(fv)c.favor=(+c.favor||0)+fv;c.genGear={up,pots,arts,gp:gold,favor:fv};artGen(c);return c}
// and in the Favor realms (the Void and deeper), a party member's share of a level's Favor
function genFavor(L){L=Math.max(1,+L||1);const r=REALMS.find(x=>x.tier===Math.max(1,bandOf(L)))||REALMS[0],fb=favorBase(r.tier);return fb?Math.round(fb*47*(1+0.15*Math.min(Math.max(0,L-towerStart(r.n)),20))/4):0}
// what a generated character has saved by their level: a quarter (one party member's share) of the gold one level of
// adventuring brings in the realm they have reached (eight encounters and a hoard, as the treasure roller pays), and at
// least 50 gp a level (economy audit, 2026-11-04: a flat 50 gp a level bought nothing past level 20)
function genGold(L){L=Math.max(1,+L||1);const rn=(REALMS.find(r=>r.tier===Math.max(1,bandOf(L)))||REALMS[0]).n,over=Math.max(0,L-towerStart(rn));
  return Math.max(L*50,Math.round(realmBase(rn)*94*(1+0.15*Math.min(over,20))/4/10)*10)}
function genTypeOpts(f,cur){const M=f?famMembers(f):[];return M.length>1?`<option value="">Any type</option>${M.map(n=>`<option${n===cur?' selected':''}>${esc(n)}</option>`).join('')}`:''}
function genFam(){const f=$('gen-fam').value,M=f?famMembers(f):[],t=$('gen-race'),l=$('gen-type-l');if(t)t.innerHTML=genTypeOpts(f,'');if(l)l.hidden=M.length<2}
function genOpts(){const v=id=>(($(id)||{}).value||''),f=v('gen-fam'),M=f?famMembers(f):[];return {cls:v('gen-cls'),fam:f,her:v('gen-her'),race:M.length===1?M[0]:M.includes(v('gen-race'))?v('gen-race'):'',bg:v('gen-bg'),method:v('gen-method'),name:v('gen-name'),level:v('gen-level')}}
function genGo(keepName){const o=genOpts();if(!(+o.level>=1&&+o.level<=MAX_LEVEL)){o.level=1;const e=$('gen-level');if(e)e.value=1}store.set('genopts',Object.assign({},o,{name:''}));if(keepName&&CGEN)o.name=CGEN.c.name;if(CGEN){CGEN_HIST.unshift(CGEN);CGEN_HIST=CGEN_HIST.slice(0,6)}CGEN=genFill(o);CGEN.fresh=1;renderCharGen();const r=$('gen-card');if(r)r.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'})}
function genBack(i){const g=CGEN_HIST[i];if(!g)return;CGEN_HIST.splice(i,1);if(CGEN)CGEN_HIST.unshift(CGEN);CGEN_HIST=CGEN_HIST.slice(0,6);CGEN=g;CGEN.fresh=1;renderCharGen()}
function genReset(){['gen-cls','gen-fam','gen-race','gen-her','gen-bg','gen-name'].forEach(id=>{const e=$(id);if(e)e.value=''});const m=$('gen-method');if(m)m.value='std';const l=$('gen-level');if(l)l.value='1';store.set('genopts',{});renderCharGen();toast('Every choice is back on Random')}
function genLv(v){const e=$('gen-level');if(e)e.value=v;document.querySelectorAll('.gen-lv .chip').forEach(b=>b.classList.toggle('on',b.textContent==String(v)))}
function genName(){if(!CGEN)return;CGEN.c.name=cwName();CGEN.cw.name=CGEN.c.name;renderCharGen()}
function genKeep(){if(!CGEN)return;const c=CGEN.c;PARTY.push(c);saveParty();CGEN=null;renderCharGen();actToast(c.name+' joins the party','Open sheet',()=>{SHEET_ID=c.id;SHEET_TAB='core';go('sheet',{id:c.id})})}
function genTune(){if(!CGEN)return;const pre=Object.assign({},CGEN.cw,{step:CW_STEPS.length-1});CGEN=null;charWizard(pre)}
function genCardHTML(g){const c=g.c,cw=g.cw,sk=Object.keys(c.skillB||{}).map(k=>(SKILLS.find(x=>x[0]===k)||[])[1]).filter(Boolean).sort(),items=[...(c.gear||[]),...(c.inv||[]).map(([n,q])=>n+(q>1?' ×'+q:''))],key=((CW_CLASS[c.cls]||{}).o||[]).slice(0,2);
  const pic=typeof ART!=='undefined'&&ART.cls&&ART.cls[c.cls]!=null?`<span class="art lg" style="--ac:#ecc04f" aria-hidden="true"><svg viewBox="0 0 512 512" focusable="false">${ART.icons[ART.cls[c.cls]]}</svg></span>`:'';
  const spells=c.spells?Object.keys(c.spells).map(Number).sort((a,b)=>a-b).filter(l=>(c.spells[l]||[]).length).map(l=>[l===0?'Cantrips':ORDN(l)+' level',c.spells[l]]):[],nSp=spells.reduce((a,x)=>a+x[1].length,0),sch=(c.schools||[]).filter(x=>x&&x.n);
  const clsName=c.level>20?stageInfo(c.cls,c.level).name||c.cls:c.cls;
  const sec=(t,b,em)=>`<div class="blk" style="margin-top:12px"><h4>${t}${em?' <em>'+em+'</em>':''}</h4></div>${b}`;
  const gear=(()=>{if(!items.length)return '';const G=c.genGear,lvl=n=>{const b=BPS.find(x=>x.n===n);return b?`<button class="chip" type="button" data-ref="${ref(b)}">${esc(b.n)} <small>${esc(b.cat)} · level ${b.lv}${b.r?' · '+esc(b.r):''}</small></button>`:`<span class="chip">${esc(n)}</span>`};
    if(!G)return sec('Equipment',`<div class="note" style="margin:0;line-height:1.6">${items.map(esc).join(' · ')}${c.coins&&c.coins.gp?` · ${fmt(c.coins.gp)} gp`:''}</div>`);
    const special=new Set([...G.up,...G.arts]),rest=items.filter(x=>!special.has(x)&&!G.pots.some(p=>x===p||x.startsWith(p+' ×')));
    return sec('Equipment',`${G.up.length?`<div class="gen-spl"><small>Weapons and armor</small><div class="chips">${G.up.map(lvl).join('')}</div></div>`:''}${G.arts.length?`<div class="gen-spl"><small>Artifacts</small><div class="chips">${G.arts.map(lvl).join('')}</div></div>`:''}${G.pots.length?`<div class="gen-spl"><small>Potions</small><div class="chips">${G.pots.map(lvl).join('')}</div></div>`:''}<div class="note" style="margin:6px 0 0;line-height:1.6">Also carries ${rest.map(esc).join(' · ')}${c.coins&&c.coins.gp?` · ${fmt(c.coins.gp)} gp`:''}.</div>`,'for level '+c.level)})();
  const made=[cw.method==='roll'?'Ability scores rolled (4d6, dropping the lowest)':'Ability scores from the standard array, the best where the class needs them',c.level>1?'levels 2 to '+c.level+' by the level-up rules: average hit points'+(c.sub?', a subclass at level 3':'')+(ASI_AT(c.cls).some(l=>l<=c.level)?', ability score improvements':'')+(lvlCaster(c)?', a school point and new spells each level':''):''].filter(Boolean).join('; ');
  const btns=`<button class="btn primary" type="button" onclick="genKeep()">✓ Keep: add to the party</button><button class="btn" type="button" onclick="genGo(true)" title="A new character with the same name and choices">🎲 Reroll (keep the name)</button><button class="btn" type="button" onclick="genName()">New name</button>${c.level===1?'<button class="btn" type="button" onclick="genTune()" title="Open this character in the step-by-step builder to change any choice">Fine-tune in the builder</button>':''}`;
  return `<article class="panel gen-card${g.fresh?' gen-in':''}" id="gen-card" aria-label="${esc(c.name)}"><div class="gen-top">${pic}<div class="gen-who"><div class="gen-kicker">Level ${c.level} ${esc(c.race)} ${esc(clsName)}</div><h2 class="gen-name">${esc(c.name)}</h2>
      <div class="badges"><span class="b acc">${esc(c.bg)} background</span>${c.sub?`<span class="b gold">${esc(c.sub)}</span>`:''}<span class="b ghost">${esc(c.align)}</span>${c.style?`<span class="b gold">${esc(c.style)}</span>`:''}${cw.school?`<span class="b blue">${esc(cw.school)}${/magic$/i.test(cw.school)?'':' magic'}</span>`:''}</div></div>
      <div class="gen-topbtns">${btns}</div></div>
    <div class="gen-body">
    <div class="gen-ab">${ABIL.map(([a,n])=>`<div class="${key.includes(a)?'key':''}" title="${key.includes(a)?esc(c.cls)+' relies on '+esc(n):''}"><small>${esc(n.slice(0,3).toUpperCase())}</small><b>${c.abil[a]}</b><span>${sgn(mod(c.abil[a]))}</span></div>`).join('')}</div>
    <div class="gen-vit"><div><small>Hit points</small><b>${c.hpMax}</b></div><div><small>Speed</small><b>${c.speed||30} ft.</b></div><div><small>Languages</small><b>Common, ${esc(cw.langR)}, ${esc(cw.langB)}</b></div><div><small>Trained in</small><b>${esc(cw.prof)}</b></div>${c.coins&&c.coins.gp?`<div><small>Coin</small><b>${fmt(c.coins.gp)} gp</b></div>`:''}${c.favor?`<div><small>Favor</small><b>⟡ ${fmt(c.favor)}</b></div>`:''}</div>
    <div class="gen-cols"><div>
      ${sk.length?sec('Trained skills',`<div class="chips">${sk.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`):''}
      ${sec('Personality',`<div class="gen-pers">${[['Trait',c.traits],['Ideal',c.ideals],['Bond',c.bonds],['Flaw',c.flaws]].filter(x=>x[1]).map(([k,v])=>`<div><b>${k}.</b> ${esc(v)}</div>`).join('')}</div>`)}
    </div><div>
      ${spells.length?sec('Spells',spells.map(([l,L])=>`<div class="gen-spl"><small>${l}</small><div class="chips">${L.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></div>`).join(''),nSp+(sch.length?' · '+sch.map(x=>esc(x.n)+(x.m>1?' mastery '+x.m:'')).join(', '):'')):''}
      ${(()=>{const R=RACE_SPELLS[c.race];if(!R||!R.sp)return '';const L=c.level||1,got=R.sp.filter(x=>x[0]<=L);return got.length?sec("People's spells",`<div class="gen-spl"><small>${esc(c.race)}</small><div class="chips">${got.map(x=>`<span class="chip">${esc(x[1])}</span>`).join('')}</div></div>`,AB_NAME[raceSpellAb(c,R)]):''})()}
      ${gear}
    </div></div>
    <div class="gen-foot">How ${esc(c.name)} was made: ${esc(made)}. Levels, gear, and choices follow FAND's own rules; change anything on the sheet once you keep them.</div>
    <div class="gen-btns">${btns}</div></div></article>`}
function renderCharGen(){const O=store.get('genopts',{})||{},sel=(id,lab,list,v)=>`<label>${lab}<select class="sel" id="${id}"><option value="">Random</option>${list.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('')}</select></label>`,lv=String(O.level||1);
  const emptyPic=typeof ART!=='undefined'&&ART.pg&&ART.pg.chargen!=null?`<span class="art lg" style="--ac:#ecc04f" aria-hidden="true"><svg viewBox="0 0 512 512" focusable="false">${ART.icons[ART.pg.chargen]}</svg></span>`:'';
  $('content').innerHTML=`<div class="page"><div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Character generator</h3><p>A whole character in one tap, at any level from 1 to ${MAX_LEVEL}. Pick what you care about and leave the rest on Random: FAND makes every other choice by its own rules.</p></div>
    <div class="tool"><div class="form gen-form">${sel('gen-cls','Class',Object.keys(CW_CLASS),O.cls)}<label>People<select class="sel" id="gen-fam" onchange="genFam()"><option value="">Random</option>${peopleTop().map(f=>`<option${f===(O.fam||(O.race?famOf(O.race):''))?' selected':''}>${esc(f)}</option>`).join('')}</select></label><label id="gen-type-l"${famMembers(O.fam||(O.race?famOf(O.race):'')).length>1?'':' hidden'}>Type<select class="sel" id="gen-race">${genTypeOpts(O.fam||(O.race?famOf(O.race):''),O.race)}</select></label>${sel('gen-bg','Background',CW_BG.map(x=>x[0]),O.bg)}
      <label>Level<span class="gen-lv"><input class="sel" id="gen-level" type="number" min="1" max="${MAX_LEVEL}" value="${esc(lv)}" inputmode="numeric" aria-label="Level, 1 to ${MAX_LEVEL}">${[1,5,10,20,50].map(n=>`<button type="button" class="chip${String(n)===lv?' on':''}" onclick="genLv(${n})" aria-label="Level ${n}">${n}</button>`).join('')}</span></label>
      <label>Heritage<select class="sel" id="gen-her"><option value=""${!O.her?' selected':''}>None</option><option value="random"${O.her==='random'?' selected':''}>Random</option>${peopleTop().map(f=>`<option${f===O.her?' selected':''}>${esc(f)}</option>`).join('')}</select></label><label>Ability scores<select class="sel" id="gen-method"><option value="std"${O.method!=='roll'?' selected':''}>Standard array</option><option value="roll"${O.method==='roll'?' selected':''}>Roll 4d6, drop the lowest</option></select></label>
      <label>Name<input class="sel" id="gen-name" placeholder="Random"></label></div>
      <div class="gen-actions"><button class="btn primary gen-go" type="button" onclick="genGo()">🎲 Generate a character</button><button class="btn" type="button" onclick="genReset()">Reset choices</button><span class="note">Want every choice yourself? <a href="#" onclick="event.preventDefault();charWizard()">Use the step-by-step builder</a>.</span></div>
      ${CGEN_HIST.length?`<div class="gen-hist"><small>Earlier rolls:</small>${CGEN_HIST.map((g,i)=>`<button type="button" class="chip" onclick="genBack(${i})" title="Bring ${esc(g.c.name)} back">${esc(g.c.name)} <small>${esc(g.c.cls)} ${g.c.level}</small></button>`).join('')}</div>`:''}</div>
    ${CGEN?genCardHTML(CGEN):`<div class="gen-empty">${emptyPic}<b>No character yet</b><span>Press Generate. Reroll as often as you like: nothing is saved until you keep one.</span></div>`}</div>`;
  if(CGEN)CGEN.fresh=0;
  const n=$('gen-name');if(n)n.onkeydown=e=>{if(e.key==='Enter')genGo()};const l=$('gen-level');if(l){l.onkeydown=e=>{if(e.key==='Enter')genGo()};l.oninput=()=>document.querySelectorAll('.gen-lv .chip').forEach(b=>b.classList.toggle('on',b.textContent===l.value))}}
// Session journal: dated entries kept on this device; [[Name]] links to any entry on the site.
function renderJournal(){
  let J=store.get('journal',[]);if(!Array.isArray(J))J=[];if(J.some(e=>!e||typeof e!=='object')){J=J.filter(e=>e&&typeof e==='object');store.set('journal',J)}const q=lc(store.get('jq','')),list=J.map((e,i)=>[e,i]).reverse(),jhit=e=>!q||lc(e.t+' '+e.body).includes(q);
  nbFrame('journal').innerHTML=`<div class="nb-jn">
    <div class="sec-h" style="margin-top:0"><h3>📔 Session journal</h3><p>Notes from each session${typeof CL!=='undefined'&&CL.on&&CL.user?', kept in your account':', saved on this device'}. Write <code>[[Owlbear]]</code> or <code>[[Demeter]]</code> to link any monster, god, material, Blueprint, realm, or spell.</p></div>
    <div class="tool" style="display:flex;flex-direction:column;gap:8px">
      <div class="form" style="grid-template-columns:2fr 1fr"><label>Title<input id="jn-t" placeholder="Session ${J.length+1}: …"></label><label>Date<input id="jn-d" type="date" value="${new Date().toISOString().slice(0,10)}"></label></div>
      <textarea id="jn-b" rows="5" placeholder="What happened? Who did the party meet? What did they find?" style="background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:8px 10px;color:var(--text);font:inherit"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" id="jn-add">Add entry</button><input class="sel" id="jn-q" placeholder="Search the journal…" value="${esc(store.get('jq',''))}" style="max-width:240px"><span style="margin-left:auto;display:flex;gap:8px"><button class="btn" id="jn-exp">Export</button><label class="btn" style="cursor:pointer">Import<input type="file" id="jn-imp" accept=".json" hidden></label></span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:14px">${list.length?list.map(([e,i])=>`<div class="panel" data-jentry="${i}"${jhit(e)?'':' style="display:none"'}><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:1.15rem">${esc(e.t||'Untitled')}</b><span class="note" style="margin:0">${esc(e.d||'')}</span><span style="margin-left:auto;display:flex;gap:6px"><button class="btn" data-jedit="${i}">Edit</button><button class="btn" data-jdel="${i}">Delete</button></span></div><div class="prose" style="margin-top:6px;white-space:pre-wrap">${linkify(esc(e.body||''))}</div></div>`).join(''):`<div class="empty" style="padding:30px"><b>${J.length?'No entries match':'No entries yet'}</b>${J.length?'':'Write the first session above.'}</div>`}</div></div>`;
  const save=J2=>{store.set('journal',J2);renderJournal()};
  $('jn-add').onclick=()=>{const t=$('jn-t').value.trim(),b=$('jn-b').value.trim();if(!t&&!b)return;const ed=store.get('jedit',null),J2=store.get('journal',[]),e={t:t||'Session '+(J2.length+1),d:$('jn-d').value,body:b};if(ed!=null&&J2[ed]){J2[ed]=e;store.set('jedit',null)}else J2.push(e);save(J2)};
  $('jn-q').oninput=e=>{store.set('jq',e.target.value);const q2=lc(e.target.value),J2=store.get('journal',[]);$('content').querySelectorAll('[data-jentry]').forEach(el=>{const x=J2[+el.dataset.jentry];el.style.display=!q2||(x&&lc(x.t+' '+x.body).includes(q2))?'':'none'})};
  $('content').querySelectorAll('[data-jdel]').forEach(b=>b.onclick=()=>{const J2=store.get('journal',[]),k=+b.dataset.jdel,[x]=J2.splice(k,1);save(J2);undoToast('Entry deleted',()=>{const J3=store.get('journal',[]);J3.splice(k,0,x);save(J3)})});
  $('content').querySelectorAll('[data-jedit]').forEach(b=>b.onclick=()=>{const e=store.get('journal',[])[+b.dataset.jedit];store.set('jedit',+b.dataset.jedit);$('jn-t').value=e.t;$('jn-d').value=e.d||'';$('jn-b').value=e.body;$('jn-add').textContent='Save changes';$('content').scrollTop=0;$('jn-b').focus()});
  $('jn-exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(store.get('journal',[]),null,1)],{type:'application/json'}));a.download='FAND journal.json';a.click()};
  $('jn-imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d0=JSON.parse(t);if(!Array.isArray(d0))throw 0;const d=d0.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).map(x=>({t:String(x.t??''),d:String(x.d??''),body:String(x.body??'')})).filter(x=>x.t||x.body);if(!d.length)throw 0;save(store.get('journal',[]).concat(d));toast('Imported '+d.length+' entr'+(d.length>1?'ies':'y')+(d.length<d0.length?' (skipped '+(d0.length-d.length)+' that were not journal entries)':''))}catch(err){toast('That file is not a FAND journal')}})};
  store.set('jedit',null);
}
// ════════════════════════════════════════════════════════════════
//  Hidden classes and Towers (campaign owner's rules; details in data/hidden.js)
// ════════════════════════════════════════════════════════════════
const HC_TIERS=[['Unique','One of a kind: only one person in the world can hold it at a time. When the holder dies or gives it up, it can be claimed again.','var(--gold)'],['Epic','A specialisation of a basic class: the class\'s own skills honed into something sharper (a Rogue\'s poisons, for example, can become a class of their own).','var(--acc)'],['Legendary','Follows one of the Rune progenitors, the original holders of the Laws, and carries a share of that progenitor\'s way.','var(--red)']];
const HC_FLOOR={Epic:.5,Unique:.75,Legendary:1};
// The class list is encrypted; HC holds it once the code is entered (remembered for this browser session).
let HC=null;
// Class texts were written when each realm had one Tower, so they name that realm's first Tower ("floor 10 of the Milestone
// Spire"). Now that a realm has up to five, rewrite each class's text to name the Tower it actually waits in.
function hcRetower(list){list.forEach(c=>{const t=towerOf(hcTower(c)),first=towersIn(c.tower)[0];if(!first||t.id===first.id)return;
  const from=first.name.replace(/^The /,''),to=t.name.replace(/^The /,'');Object.keys(c).forEach(k=>{if(typeof c[k]==='string')c[k]=c[k].split(from).join(to);else if(Array.isArray(c[k]))c[k]=JSON.parse(JSON.stringify(c[k]).split(from).join(to))})});return list}
// Unlocking: the passphrase derives the key in the browser (PBKDF2-SHA256, 1,000,000 rounds; about a second), so every
// guess is slow. After 5 wrong tries in a row each try waits 30 seconds, doubling up to an hour. Every attempt on this
// device is written to an access log (shown on the Hidden classes page once unlocked). A static site has no server, so the
// log only covers this browser.
const HC_LOG_MAX=200;
function hcLog(ok,how){try{const L=store.get('hclog',[]);L.push({t:new Date().toISOString(),ok,how});store.set('hclog',L.slice(-HC_LOG_MAX))}catch(e){}}
function hcWait(){const g=store.get('hcguard',{fails:0,until:0});return Math.max(0,(g.until||0)-Date.now())}
function hcFail(){const g=store.get('hcguard',{fails:0,until:0});g.fails=(g.fails||0)+1;if(g.fails>=5)g.until=Date.now()+Math.min(3600e3,30e3*Math.pow(2,g.fails-5));store.set('hcguard',g);return g}
// the website keeps the locked list's ciphertext in its own file (data/hidden-lock.js), fetched the first time someone unlocks
function loadHiddenLock(){if(typeof HIDDEN_LOCK_DATA!=='undefined')return Promise.resolve();return new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='data/hidden-lock.js'+(typeof SITE==='object'&&SITE&&SITE.v?'?v='+SITE.v:'');sc.onload=res;sc.onerror=()=>rej(new Error('The locked list could not load. Check your connection and try again.'));document.body.appendChild(sc)})}
async function hcUnlock(code,how){
  const L=HIDDEN.lock;if(!L)return HC=hcRetower(HIDDEN.classes||[]);if(!(window.crypto&&crypto.subtle))throw new Error('This browser cannot unlock the list.');
  const w=hcWait();if(w){hcLog(false,'blocked (locked out)');throw new Error('Too many wrong tries. Wait '+Math.ceil(w/1000)+' seconds.')}
  const b=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0)),base=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b(L.salt),iterations:L.it,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
  let LD=L.data;if(!LD&&L.ext){await loadHiddenLock();LD=typeof HIDDEN_LOCK_DATA!=='undefined'?HIDDEN_LOCK_DATA:''}
  let out;try{out=await crypto.subtle.decrypt({name:'AES-GCM',iv:b(L.iv)},key,b(LD))}catch(e){const g=hcFail();hcLog(false,how||'wrong passphrase');throw new Error(g.until>Date.now()?'Wrong passphrase. Too many wrong tries: wait '+Math.ceil(hcWait()/1000)+' seconds.':'That passphrase is not right.'+(g.fails>=3?' '+(5-g.fails)+(5-g.fails===1?' try':' tries')+' left before a wait.':''))}
  HC=hcRetower(JSON.parse(new TextDecoder().decode(out)));store.set('hcguard',{fails:0,until:0});if(how!=='remembered')hcLog(true,how||'unlocked');
  try{sessionStorage.setItem('fand.hc',code)}catch(e){}return HC;
}
async function hcAuto(){if(HC||!HIDDEN.lock)return;let c=null;try{c=sessionStorage.getItem('fand.hc')}catch(e){}if(c)try{await hcUnlock(c,'remembered')}catch(e){try{sessionStorage.removeItem('fand.hc')}catch(x){}}
  if(!HC){const k=await clHcAuto();if(k&&!HC)try{await hcUnlock(k,'account')}catch(e){}}}
function hcLockHTML(){return `<div class="panel" style="max-width:460px;margin:20px auto;text-align:center;border-top:3px solid var(--gold)"><div style="font-size:2rem">🔒</div><b style="font-family:var(--serif);font-size:1.2rem">The list is sealed</b><p class="note">Enter the passphrase to see every hidden class.</p><form id="hc-form" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><input class="sel" id="hc-code" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Passphrase" style="max-width:280px;flex:1;text-align:center"><button class="btn primary" id="hc-go">Unlock</button></form><div id="hc-err" class="note" style="color:var(--red);min-height:1.2em"></div></div>`}
function hcBindLock(after){const f=$('hc-form');if(!f)return;f.onsubmit=async e=>{e.preventDefault();const btn=$('hc-go');btn.disabled=true;btn.textContent='Unlocking…';$('hc-err').textContent='';try{await hcUnlock($('hc-code').value.trim());after()}catch(err){$('hc-err').textContent=err&&err.message||'That passphrase is not right.';$('hc-code').select()}finally{if($('hc-go')){$('hc-go').disabled=false;$('hc-go').textContent='Unlock'}}};$('hc-code').focus()}
let PAT_SKIP=false;
// Pattern unlock (campaign owner's request): draw a path through 9 dots instead of typing the passphrase. A pattern has
// too few combinations to guard the list by itself, so it only unlocks the passphrase that was saved on this device:
// the passphrase is stored here encrypted with a key made from the pattern, and the list stays sealed by the passphrase.
// Five wrong patterns erase the saved one, and the passphrase is needed again.
const PAT_IT=300000,PAT_TRIES=5;
const patB64=u=>btoa(String.fromCharCode(...new Uint8Array(u))),patBin=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
const QK={pattern:'hcpat',PIN:'hcpin'};
async function patKey(seq,salt,kind,it){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode((kind==='PIN'?'fand-pin:':'fand-pattern:')+seq),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it||PAT_IT,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function patSave(seq,kind){kind=kind||'pattern';let code=null;try{code=sessionStorage.getItem('fand.hc')}catch(e){}if(!code)throw new Error('Unlock with the passphrase first.');
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await patKey(seq,salt,kind);
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(code));store.set(QK[kind],{salt:patB64(salt),iv:patB64(iv),ct:patB64(ct),fails:0});hcLog(true,kind+' set on this device')}
// the site-wide PIN (set by the DM with hidden-tool.js pin): the passphrase wrapped under the PIN, published with the
// site so the PIN pad works on any device. Wrong tries count toward the usual lockout (30 s, doubling, up to an hour).
async function sitePinUnlock(seq){const S=HIDDEN.pin;const w=hcWait();if(w){hcLog(false,'blocked (locked out)');throw new Error('Too many wrong tries. Wait '+Math.ceil(w/1000)+' seconds.')}
  let code;try{const key=await patKey(seq,patBin(S.salt),'PIN',S.it);code=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:patBin(S.iv)},key,patBin(S.ct)))}
  catch(e){const g=hcFail();hcLog(false,'wrong PIN');throw new Error(g.until>Date.now()?'Wrong PIN. Too many wrong tries: wait '+Math.ceil(hcWait()/1000)+' seconds.':'Wrong PIN.'+(g.fails>=3?' '+(5-g.fails)+(5-g.fails===1?' try':' tries')+' left before a wait.':''))}
  return hcUnlock(code,'PIN');}
async function patUnlock(seq,kind){kind=kind||'pattern';const K=QK[kind],P=store.get(K,null);
  if(kind==='PIN'&&HIDDEN.pin){if(P){try{const key=await patKey(seq,patBin(P.salt),kind);const code=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:patBin(P.iv)},key,patBin(P.ct)));P.fails=0;store.set(K,P);return hcUnlock(code,kind)}catch(e){}}return sitePinUnlock(seq)}
  if(!P)throw new Error('No '+kind+' is saved on this device.');
  const w=hcWait();if(w){hcLog(false,'blocked (locked out)');throw new Error('Too many wrong tries. Wait '+Math.ceil(w/1000)+' seconds.')}
  let code;try{const key=await patKey(seq,patBin(P.salt),kind);code=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:patBin(P.iv)},key,patBin(P.ct)))}
  catch(e){P.fails=(P.fails||0)+1;hcLog(false,'wrong '+kind);if(P.fails>=PAT_TRIES){store.set(K,null);hcLog(false,kind+' erased after '+PAT_TRIES+' wrong tries');throw new Error('Wrong '+kind+' '+PAT_TRIES+' times: the saved '+kind+' is erased. Use the passphrase.')}store.set(K,P);throw new Error('Wrong '+kind+'. '+(PAT_TRIES-P.fails)+(PAT_TRIES-P.fails===1?' try':' tries')+' left before it is erased.')}
  P.fails=0;store.set(K,P);return hcUnlock(code,kind);}
// the 3 by 3 pad: press and drag through the dots (a dot passed over on the way is joined too, as on a phone)
function patPadHTML(id){return `<div class="patpad" id="${id}"><svg viewBox="0 0 300 300"><g class="pl"></g>${[0,1,2,3,4,5,6,7,8].map(i=>`<circle class="pd" data-i="${i+1}" cx="${50+(i%3)*100}" cy="${50+Math.floor(i/3)*100}" r="14"/>`).join('')}</svg></div>`}
function patPadBind(id,done){const el=$(id);if(!el)return;const svg=el.querySelector('svg'),pl=el.querySelector('.pl'),dots=[...el.querySelectorAll('.pd')];let seq=[],on=false,tail=null;
  const pos=e=>{const r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*300,(e.clientY-r.top)/r.height*300]};
  const xy=i=>[50+((i-1)%3)*100,50+Math.floor((i-1)/3)*100];
  const draw=p=>{pl.innerHTML=(seq.length>1?`<polyline points="${seq.map(i=>xy(i).join(',')).join(' ')}"/>`:'')+(p&&seq.length?`<line x1="${xy(seq[seq.length-1])[0]}" y1="${xy(seq[seq.length-1])[1]}" x2="${p[0]}" y2="${p[1]}"/>`:'');dots.forEach(d=>d.classList.toggle('on',seq.includes(+d.dataset.i)))};
  const hit=p=>{const d=dots.find(d=>Math.hypot(p[0]-d.cx.baseVal.value,p[1]-d.cy.baseVal.value)<34);if(!d)return;const i=+d.dataset.i;if(seq.includes(i))return;
    if(seq.length){const a=seq[seq.length-1],m=(a+i)/2;if(Number.isInteger(m)&&(a+i)%2===0&&Math.abs(((a-1)%3)-((i-1)%3))!==1&&Math.abs(Math.floor((a-1)/3)-Math.floor((i-1)/3))!==1&&!seq.includes(m))seq.push(m)}seq.push(i);if(navigator.vibrate)try{navigator.vibrate(8)}catch(e){}};
  svg.addEventListener('pointerdown',e=>{e.preventDefault();on=true;seq=[];el.classList.remove('bad','good');svg.setPointerCapture(e.pointerId);const p=pos(e);hit(p);draw(p)});
  svg.addEventListener('pointermove',e=>{if(!on)return;const p=pos(e);hit(p);draw(p)});
  const end=()=>{if(!on)return;on=false;draw(null);const s=seq.slice();if(s.length)done(s.join('-'),s.length)};
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  el.reset=(cls)=>{seq=[];draw(null);el.classList.remove('bad','good');if(cls)el.classList.add(cls)}}
// the number pad: 4 to 8 digits, typed with the keys or a keyboard
// Every key press is part of the PIN, the delete key too (a PIN can be "⌫ ⌫ 1 3 5 7"): a delete takes a dot off the
// screen, or does nothing visible on an empty pad, but is still recorded. To fix a mistake, Clear and start again.
function pinPadHTML(id){return `<div class="pinpad" id="${id}"><div class="pin-dots"></div><div class="pin-keys">${[1,2,3,4,5,6,7,8,9].map(d=>`<button type="button" data-k="${d}">${d}</button>`).join('')}<button type="button" data-k="del" aria-label="Delete">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="ok" aria-label="Enter">✓</button></div><a href="#" class="note pin-clear" data-k="clear" style="display:block;text-align:center;margin-top:8px">Clear</a></div>`}
function pinPadBind(id,done){const el=$(id);if(!el)return;let v='',vis=0;const dots=el.querySelector('.pin-dots');
  const show=()=>{dots.innerHTML=Array.from({length:Math.max(4,vis)},(_,i)=>`<i class="${i<vis?'on':''}"></i>`).join('')};
  const key=k=>{el.classList.remove('bad','good');if(k==='clear'){v='';vis=0}else if(k==='del'){if(v.length<24)v+='D';vis=Math.max(0,vis-1)}else if(k==='ok'){if(v)done(v,v.replace(/D/g,'').length);return}else if(/^\d$/.test(k)&&v.length<24&&vis<8){v+=k;vis++}else return;if(navigator.vibrate)try{navigator.vibrate(6)}catch(e){}show()};
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=e=>{e.preventDefault();key(b.dataset.k)});
  if(pinPadBind.kb)document.removeEventListener('keydown',pinPadBind.kb);
  pinPadBind.kb=e=>{const live=$(id);if(!live||e.target.closest('input,textarea,select'))return;if(/^\d$/.test(e.key))key(e.key);else if(e.key==='Backspace')key('del');else if(e.key==='Enter')key('ok');else return;e.preventDefault()};
  document.addEventListener('keydown',pinPadBind.kb);
  el.reset=cls=>{v='';vis=0;show();el.classList.remove('bad','good');if(cls)el.classList.add(cls)};show()}
// the lock screen: the pattern or the PIN saved on this device (either, when both are), or the passphrase
let QUICK_MODE=null;
const quickModes=()=>Object.keys(QK).filter(k=>store.get(QK[k],null)||(k==='PIN'&&HIDDEN.pin));
function patLockHTML(again='renderHidden'){const av=quickModes(),pref=QUICK_MODE||store.get('hcqm',null),m=av.includes(pref)?pref:av[0],other=av.find(x=>x!==m);
  return `<div class="panel" style="max-width:360px;margin:20px auto;text-align:center;border-top:3px solid var(--gold)"><div style="font-size:2rem">🔒</div><b style="font-family:var(--serif);font-size:1.2rem">${m==='PIN'?'Enter your PIN':'Draw your pattern'}</b><p class="note" style="margin:4px 0 8px">${m==='PIN'&&HIDDEN.pin&&!store.get('hcpin',null)?'The DM PIN opens the hidden list on any device.':'This device keeps the passphrase behind your '+m+'.'}</p>${m==='PIN'?pinPadHTML('hc-pin'):patPadHTML('hc-pat')}<div id="hc-err" class="note" style="color:var(--red);min-height:1.2em"></div>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">${other?`<a href="#" class="note" onclick="QUICK_MODE='${other}';${again}();return false">Use the ${other} instead</a>`:''}<a href="#" class="note" onclick="PAT_SKIP=true;${again}();return false">Use the passphrase instead</a></div></div>`}
function patLockBind(after){const kind=$('hc-pin')?'PIN':'pattern',id=kind==='PIN'?'hc-pin':'hc-pat';
  (kind==='PIN'?pinPadBind:patPadBind)(id,async(seq,n)=>{const pad=$(id);if(n<4){$('hc-err').textContent=kind==='PIN'?'A PIN has at least 4 digits.':'Join at least 4 dots.';pad.reset('bad');return}$('hc-err').style.color='var(--muted)';$('hc-err').textContent='Unlocking…';
    try{await patUnlock(seq,kind);store.set('hcqm',kind);pad.reset('good');after()}catch(err){$('hc-err').style.color='var(--red)';$('hc-err').textContent=err&&err.message||'Wrong '+kind+'.';pad.reset('bad');if(!store.get(QK[kind],null))setTimeout(after,1500)}})}
// set, change, or remove this device's pattern and PIN (shown once the list is open)
function patSetHTML(){const hp=!!store.get('hcpat',null),hn=!!store.get('hcpin',null),b=on=>on?'<span class="b green">on</span>':'<span class="b ghost">off</span>';
  return `<details class="fold" style="margin-top:14px" id="hc-patset"><summary>Quick unlock: pattern ${b(hp)} PIN ${b(hn)}${HIDDEN.pin?' · site PIN <span class="b green">on</span>':''}</summary>${HIDDEN.pin?'<p class="note" style="margin:8px 0 0">The DM PIN works on every device with no setup. The pattern and PIN below are extra, for this device only.</p>':''}
  <p class="note" style="margin:8px 0">A pattern or a PIN has far fewer combinations than the passphrase, so it only works on a device where the passphrase was entered first, and 5 wrong tries erase it. Keep the passphrase written down.</p>
  <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
    <div style="width:240px"><b>Pattern</b><p class="note" id="hc-patmsg" style="margin:4px 0 8px">${hp?'Draw a new pattern to replace the saved one.':'Draw a pattern of at least 4 dots, then again to confirm.'}</p>${patPadHTML('hc-patnew')}${hp?'<button class="btn" type="button" id="hc-patrm" style="margin-top:6px">Remove the pattern</button>':''}</div>
    <div style="width:240px"><b>PIN</b><p class="note" id="hc-pinmsg" style="margin:4px 0 8px">${hn?'Enter a new PIN to replace the saved one.':'Enter at least 4 digits and press ✓, then again to confirm. The ⌫ key counts as part of the PIN (⌫ ⌫ 1 3 5 7 is a PIN), so press Clear to fix a mistake.'}</p>${pinPadHTML('hc-pinnew')}${hn?'<button class="btn" type="button" id="hc-pinrm" style="margin-top:6px">Remove the PIN</button>':''}</div>
  </div></details>`}
function patSetBind(){
  const setup=(kind,id,msgId,rmId,bind,short,again,nomatch)=>{let first=null;const msg=t=>{$(msgId).textContent=t};
    bind(id,async(seq,n)=>{const pad=$(id);if(n<4){msg(short);pad.reset('bad');first=null;return}
      if(!first){first=seq;pad.reset('good');msg(again);return}
      if(seq!==first){first=null;pad.reset('bad');msg(nomatch);return}
      try{await patSave(seq,kind);PAT_SKIP=false;QUICK_MODE=kind;store.set('hcqm',kind);toast((kind==='PIN'?'PIN':'Pattern')+' saved on this device');renderHidden();setTimeout(()=>{const d=$('hc-patset');if(d)d.open=true},0)}catch(err){msg(err&&err.message||'Could not save it.');pad.reset('bad');first=null}});
    const rm=$(rmId);if(rm)rm.onclick=()=>{if(confirm('Remove the '+kind+' from this device?')){store.set(QK[kind],null);hcLog(true,kind+' removed from this device');renderHidden();setTimeout(()=>{const d=$('hc-patset');if(d)d.open=true},0)}}};
  setup('pattern','hc-patnew','hc-patmsg','hc-patrm',patPadBind,'Join at least 4 dots.','Draw it again to confirm.','The patterns did not match. Draw a new one.');
  setup('PIN','hc-pinnew','hc-pinmsg','hc-pinrm',pinPadBind,'A PIN has at least 4 digits.','Enter it again to confirm.','The PINs did not match. Enter a new one.');
}
function hcLogHTML(){const L=store.get('hclog',[]).slice().reverse();return `<details class="fold" style="margin-top:14px"><summary>Access log on this device (${L.length})</summary><div class="note" style="margin:6px 0">Every attempt to open the hidden class list in this browser: successful unlocks and wrong passphrases. The site has no server, so tries on other devices are not seen here.${L.length?` <a href="#" onclick="if(confirm('Clear the access log on this device?')){store.set('hclog',[]);renderHidden()}return false">Clear</a>`:''}</div>${L.length?`<div class="tablewrap"><table class="t"><thead><tr><th>When</th><th>Result</th></tr></thead><tbody>${L.slice(0,100).map(x=>`<tr><td style="white-space:nowrap">${esc(new Date(x.t).toLocaleString())}</td><td style="color:${x.ok?'var(--green)':'var(--red)'}">${x.ok?'Unlocked':'Failed'} <small style="color:var(--muted)">${esc(x.how||'')}</small></td></tr>`).join('')}</tbody></table></div>`:'<div class="note">No attempts yet.</div>'}</details>`}
// Each unclaimed Rune's excess energy pools into one realm's Tower (fixed by the Rune's name).
const TOWER_RUNES=(()=>{const m=new Map(REALMS.map(r=>[r.n,[]]));RUNES.filter(r=>!r.gods.length&&!runeHolder(r)).forEach(r=>{let h=0;for(const c of r.n)h=(h*31+c.charCodeAt(0))>>>0;m.get(REALMS[h%REALMS.length].n).push(r)});return m})();
// Up to five Towers per realm (campaign owner's rule). A realm's unclaimed Runes are grouped by lineage (the Rune they derive
// from), and every six or so feed one Tower, at most five. The first Tower keeps the vault's name; the others are named for
// the Rune most of their Runes descend from. Every Tower in a realm has the realm's floor count and level bands.
const runeRoot=x=>{const ch=(x.lin&&x.lin.chain)||[];return ch.length?ch[ch.length-1].n:x.n};
const TOWERS=(()=>{const out=[],used=new Set(Object.values(HIDDEN.towers||{}).map(t=>t.name));REALMS.forEach(r=>{const rs=(TOWER_RUNES.get(r.n)||[]).slice().sort((a,b)=>runeRoot(a).localeCompare(runeRoot(b))||a.n.localeCompare(b.n)),base=(HIDDEN.towers||{})[r.n]||{},n=Math.max(1,Math.min(5,Math.ceil(rs.length/6)));
  for(let i=0;i<n;i++){const part=rs.slice(Math.round(i*rs.length/n),Math.round((i+1)*rs.length/n)),cnt={};part.forEach(x=>{const k=runeRoot(x);cnt[k]=(cnt[k]||0)+1});const cands=Object.entries(cnt).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(x=>x[0]).concat(part.map(x=>x.n)),top=i?(cands.find(n=>!used.has(`The ${n} Spire`))||r.n):(cands[0]||r.n);if(i)used.add(`The ${top} Spire`);
    const lore=i?(HIDDEN.towers||{})[r.n+' '+(i+1)]:null;out.push({id:i?r.n+' '+(i+1):r.n,realm:r.n,i,top,name:lore?lore.name:i?`The ${top} Spire`:(base.name||`The ${r.n} Tower`),look:lore?lore.look:i?`A lesser spire of the ${r.n} Realm, risen from the overflow of ${part.length} unclaimed Runes, the strongest of them ${top}. Its stairs and guardians follow the same bands as ${base.name||'the realm\'s great Tower'}.`:(base.look||''),floors:base.floors||(r.tier||1)*10,runes:part})}});
  return out})();
const TOWER_IDX=new Map(TOWERS.map(t=>[t.id,t]));
const towersIn=realm=>TOWERS.filter(t=>t.realm===realm);
function towerOf(id){return TOWER_IDX.get(id)||TOWERS.find(t=>t.realm===id)||{id,realm:id,i:0,name:`The ${id} Tower`,look:'',floors:((REALM[id]||{}).tier||1)*10,runes:[]}}
// which Tower a hidden class waits in: a Legendary class in the Tower fed by its Rune; others spread across the realm's Towers
// some classes in the (encrypted) list wait in no Tower; what they are is DM-only data
const hcInTower=c=>!c.corpse&&!c.combo;
const hcPartOf=c=>(HC||[]).filter(x=>(x.combo||[]).includes(c.n));
function hcTower(c){if(c._tw)return c._tw;const ts=towersIn(c.tower);if(!ts.length)return c._tw=c.tower;
  if(c.rune){const t=ts.find(t=>t.runes.some(r=>lc(r.n)===lc(c.rune)));if(t)return c._tw=t.id}
  let h=0;for(const ch of (c.was||c.n))h=(h*31+ch.charCodeAt(0))>>>0;return c._tw=ts[h%ts.length].id}
// sealed (still locked) hidden classes are counted per realm by the build; spread them evenly for a Tower's estimate
const sealedIn=t=>{const n=(HIDDEN.byTower||{})[t.realm]||0,k=towersIn(t.realm).length;return Math.floor(n/k)+(t.i<n%k?1:0)}
// Floors spread within each tier's band (Epic 40-60%, Unique 70-85%, Legendary 90-100% of the way up), fixed by the name
const HC_BAND={Epic:[.4,.6],Unique:[.7,.85],Legendary:[.9,1]};
function hcFloor(c){const t=towerOf(hcTower(c)),[a,b]=HC_BAND[c.tier]||[.5,.5];let h=0;for(const ch of (c.was||c.n))h=(h*31+ch.charCodeAt(0))>>>0;return Math.max(1,Math.min(t.floors,Math.round(t.floors*(a+(b-a)*(h%1000)/999))))}
// Hidden classes scale like everything else (campaign owner's rule): their damage and healing dice multiply every 10
// levels (by DICE_MULT: ×2 at 11, ×6 at 21 … ×40 at 91, as spells do), and at each class change (II at 21 … V at 81) the hidden class turns with
// the character, its limited-use features gaining one more use per stage. The Hidden classes page shows every card at a
// chosen level.
const HC_WORDS={once:1,twice:2,'three times':3,'four times':4};
// dice follow the holder's character level (to keep pace with the realms); extra uses follow the hidden class's own stage
// when its class level is given (hl), otherwise the holder's
function hcScale(t,L,hl){if(!L||L<1)return t;const k=stageOf(hl||L)-1;let out=spellAt(t,diceMult(bandOf(L)));
  if(k>0)out=out.replace(/\b(once|twice|three times|four times)( per | a | each )(long rest|short rest|day|turn of the moon|week)/gi,(m,w,mid,per)=>{const n=HC_WORDS[w.toLowerCase()]+k;return n+' times'+mid+per});
  return out}
// Hidden classes are bonus classes (campaign owner's rule): held alongside a character's own class and subclass, each
// with its own level from 1 (when unlocked) to 100, gaining a level every time its holder levels up, on the same scheme
// as every class: its three features at class levels 1, 7 and 14, its evolution at 20, and a class change every 20
// levels (II at 21, III at 41, IV at 61, V at 81) that strengthens what it already has.
const HC_TRACK=[1,7,14],HC_MAX=100;
const hcTrack=c=>[...(c.features||[]).slice(0,3).map((f,i)=>[HC_TRACK[i]||HC_TRACK[2],f[1],f[2]]),...(c.evolves?[[20,'Evolution',String(c.evolves).replace(/^At (character )?level \d+,?\s*/i,'').replace(/^./,x=>x.toUpperCase())]]:[]),
  ...[2,3,4,5].map(k=>[stageStart(k),'Class change: '+c.n+' '+ROMAN[k-1],`The class turns with you into ${c.n} ${ROMAN[k-1]}: every limited-use feature gains ${k-1} extra use${k>2?'s':''}, and its dice keep pace with your character level.`])];
const hcLevelAt=(L,lv0)=>Math.max(1,Math.min(HC_MAX,(+L||1)-(+lv0||1)+1));
const hcSteady=hl=>{let n=0;for(let l=2;l<=hl;l++)if(isSteady(l))n++;return n};
const hcTierOf=c=>HC_TIERS.find(t=>t[0]===c.tier)||HC_TIERS[1];
const hcBadges=c=>`<span class="b" style="color:${hcTierOf(c)[2]}">${esc(c.tier)}</span>${c.base&&c.base!=='Any'?`<span class="b ghost">${esc(c.base)}${c.sub?' · '+esc(c.sub):''}</span>`:''}${c.prog?`<span class="b ghost">follows ${esc(c.prog)}${c.rune?' · '+esc(c.rune)+' Rune':''}</span>`:''}`;
const hcWhere=c=>c.combo?'Fusion of '+c.combo.length+' Epic classes':c.corpse?'In a predecessor\'s corpse':towerOf(hcTower(c)).name+' · floor '+hcFloor(c);
// a hidden class's full write-up (the detail pane of the Hidden classes page)
function hcBody(c){
  const pr=c.prog&&RUNE_IDX.get(lc(c.prog));
  return `    ${c.notice?`<div class="mono" style="margin-top:8px;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--gold2);font-size:.85rem">${esc(c.notice)}</div>`:''}
    <div style="margin-top:8px;line-height:1.6">${esc(c.blurb||'')}</div>
    ${kv([['Requires',esc(c.requires||'')],['Unlock',esc(c.unlock||'')],c.combo?['Fusion',`${c.combo.map(n=>{const x=(HC||[]).find(y=>y.n===n);return x?`<a href="#hc-${pid(n)}">${esc(n)}</a>${x.corpse?' <small style="color:var(--muted)">(corpse)</small>':''}`:esc(n)}).join(' + ')}<br><small style="color:var(--muted)">A character who holds all of them can fuse them into this class (on the character sheet).</small>`]:c.corpse?['Where',`${esc(c.corpse)}${/Riverend/.test(c.corpse)?` <a href="${pageUrl('realms')}" data-go="realms">(map)</a>`:''}<br><small style="color:var(--muted)">Not in any Tower: claimed from the body of the class's last holder.</small>`]:['Tower',`<a href="${pageUrl('towers')}#tw-${pid(hcTower(c))}" data-go="towers">${esc(towerOf(hcTower(c)).name)}</a> (${esc(c.tower)} Realm), floor ${hcFloor(c)} of ${towerOf(c.tower).floors}: a level ${towerStart(c.tower)+Math.floor((hcFloor(c)-1)/10)} floor, so the climb itself needs a party of about that level`],c.prog?['Progenitor',pr?refChip(pr,esc(c.prog)):esc(c.prog)]:null,c.base?['Basic class',`<a href="#" data-go="subclasses" data-setup='${esc(JSON.stringify({side:c.base}))}'>${esc(c.base)}</a>`]:null].filter(Boolean))}
    <div class="note" style="margin:8px 0 0">A <b>bonus class</b>: held alongside the holder's own class and subclass. It starts at class level 1 when unlocked and gains a level each time its holder levels up, up to ${HC_MAX}, turning into II, III, IV and V every 20 class levels like every class.</div>
    ${(()=>{const L=store.get('hclv',0),k=stageOf(L);return L&&(bandOf(L)>1||k>1)?`<div class="note" style="margin:8px 0 0">For a level ${L} holder: dice ×${diceMult(bandOf(L))}${k>1?`; limited-use features +${k-1} use${k>2?'s':''}`:''}.</div>`:''})()}
    <div class="tablewrap" style="margin-top:8px"><table class="t"><tbody>${hcTrack(c).map(([lv,n,t])=>{const L=store.get('hclv',0),sc=L?hcScale(t,L):t;return `<tr><td class="num" style="white-space:nowrap">Class Lv ${lv}</td><td><b>${esc(n)}</b>${lv===20?' <span class="b gold">evolution</span>':''}<br><span style="color:var(--text2)"${sc!==t?` title="${esc('As written: '+t)}"`:''}>${esc(sc)}</span>${sc!==t?` <small style="color:var(--gold2)">(holder level ${L})</small>`:''}</td></tr>`}).join('')}</tbody></table></div>
    ${c.branches?`<details class="fold" style="margin-top:8px"><summary>Subclasses: choose 1 of ${c.branches.length} at class level ${HC_BR[0]}, then 1 of 3 at class level ${HC_BR[1]} (${c.branches.reduce((a,b)=>a+b.kids.length,0)} paths)</summary>${c.branches.map(b=>`<div style="margin-top:8px;padding-left:10px;border-left:2px solid var(--gold)"><b style="font-family:var(--serif)">${esc(b.n)}</b> <span class="note" style="margin:0">${esc(b.d)}</span><div style="margin:2px 0"><small><b>Class Lv ${HC_BR[0]}: ${esc(b.f[0])}</b></small> ${esc(b.f[1])}</div>${b.kids.map(k=>`<details class="fold" style="margin:4px 0 0 10px"><summary><b>${esc(k.n)}</b> <span class="note" style="margin:0">${esc(k.d)}</span></summary><div class="mlist">${[[HC_BR[1],k.f[0],k.f[1]],...k.later].map(([lv,nm,t])=>`<div style="padding:3px 0"><small><b>Class Lv ${lv}: ${esc(nm)}</b></small> ${esc(t)}</div>`).join('')}</div></details>`).join('')}</div>`).join('')}</details>`:''}
    ${(()=>{const ru=c.rune&&RUNE_IDX.get(lc(c.rune));return ru&&ru.gods.length?`<div class="callout" style="margin-top:8px;border-color:var(--gold)"><b>The ${esc(c.rune)} Rune has since been claimed</b> by ${ru.gods.map(g=>refChip(g,esc(godKey(g)))).join(' ')}. Whoever takes this class becomes ${ru.gods.length>1?'their':'that god\'s'} rival, and the Tower's top floor is now watched.</div>`:''})()}
    ${hcPartOf(c).length?`<div class="callout" style="margin-top:8px;border-color:${(HC_TIERS.find(t=>t[0]==='Legendary')||[])[2]||'var(--red)'}">✦ <b>Part of a Legendary class:</b> ${hcPartOf(c).map(x=>`<a href="#hc-${pid(x.n)}">${esc(x.n)}</a> (with ${x.combo.filter(n=>n!==c.n).map(esc).join(' and ')})`).join('; ')}.</div>`:''}
    ${c.tier==='Legendary'&&!c.combo?`<div class="note" style="margin:8px 0 0">✦ Besides its own Tower, this class's trial can wait in a secret room on any floor of any Tower whose level is ${hcReqLevel(c)} or more (${Math.round(LEG_TRIAL[0]*100)}% a floor, ${Math.round(LEG_TRIAL[1]*100)}% on boss floors), apart from the floor's mission; whoever finds the room and passes it earns the class.</div>`:''}
    ${hcGrowthText(c)?`<div class="note" style="margin:8px 0 0;color:var(--text2)"><b>Steady Growth:</b> ${esc(hcGrowthText(c))} on each of its own Steady Growth levels (class levels 2, 4, 6–9, 11–14, 16–19 of every 20), on top of the holder's own class.</div>`:''}
    ${c.cost?`<div class="callout" style="border-color:var(--red);margin-top:8px"><b>The price:</b> ${esc(c.cost)}</div>`:''}
    ${c.secret?`<details class="fold" style="margin-top:8px"><summary>DM only: the hidden condition</summary><div class="note" style="margin:4px 0 0">${esc(c.secret)}</div></details>`:''}`;
}
function hcCard(c,open){return `<details class="panel" ${open?'open':''} style="border-left:3px solid ${hcTierOf(c)[2]};padding:12px 14px" id="hc-${pid(c.n)}"><summary style="cursor:pointer;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;list-style:none"><b style="font-family:var(--serif);font-size:1.12rem">${esc(c.n)}</b>${hcBadges(c)}<span class="note" style="margin:0 0 0 auto">${esc(hcWhere(c))}</span></summary>${hcBody(c)}</details>`}
// The Hidden classes page, once unlocked: a menu of every class on the left (search, tier tabs, grouping, filters) and the
// chosen class on the right, with the DM's tools (who holds it, grant it to a character). On phones the two take turns.
const HCX_GROUPS={tier:['Tier',c=>c.tier],tower:['Tower',c=>c.combo?'Fused Legendaries':c.corpse?'Corpse classes':c.tower+' Realm'],base:['Basic class',c=>c.base&&c.base!=='Any'?c.base:'Any class'],prog:['Progenitor',c=>c.prog||'No progenitor'],az:['A to Z',c=>/[A-Z]/.test((c.n[0]||'').toUpperCase())?c.n[0].toUpperCase():'#']};
const hcSt=()=>Object.assign({tier:'',q:'',base:'',sub:'',tower:'',prog:'',group:'tier',sel:''},store.get('hc',{}));
function hcSet(o){store.set('hc',Object.assign(hcSt(),o))}
function hcFiltered(){const st=hcSt(),q=lc(st.q||'');return (HC||[]).filter(c=>(!st.tier||c.tier===st.tier)&&(!st.base||c.base===st.base)&&(!st.sub||c.sub===st.sub)&&(!st.tower||c.tower===st.tower)&&(!st.prog||c.prog===st.prog)&&(!q||lc([c.n,c.was,c.base,c.sub,c.prog,c.rune,c.blurb,c.tower,c.corpse].join(' ')).includes(q)))}
function hcGroups(C){const st=hcSt(),g=HCX_GROUPS[st.group]||HCX_GROUPS.tier,m=new Map();C.forEach(c=>{const k=g[1](c);if(!m.has(k))m.set(k,[]);m.get(k).push(c)});
  const order=st.group==='tier'?HC_TIERS.map(t=>t[0]):st.group==='tower'?REALMS.map(r=>r.n+' Realm').concat(['Corpse classes','Fused Legendaries']):[...m.keys()].sort((a,b)=>a.localeCompare(b));
  return order.filter(k=>m.has(k)).map(k=>[k,m.get(k).sort(byName)])}
function hcListHTML(C){const st=hcSt(),gs=hcGroups(C),meta=c=>st.group==='tower'?(c.base&&c.base!=='Any'?c.base:c.tier):c.combo?'fusion':c.corpse?'corpse':c.tower;
  return gs.length?gs.map(([k,cs])=>{const tc=st.group==='tier'?hcTierOf(cs[0])[2]:'';return `<details class="hcx-g" open><summary><span${tc?` class="rcx" style="--rc:${tc}"`:''}>${esc(k)}</span><span>${cs.length}</span></summary>${cs.map(c=>`<button type="button" class="hcx-row${c.n===st.sel?' on':''}" data-hci="${HC.indexOf(c)}"><i style="background:${hcTierOf(c)[2]}"></i><span>${esc(c.n)}</span><small>${esc(meta(c)||'')}</small></button>`).join('')}</details>`}).join('')
    :`<div class="empty" style="padding:24px 10px">No hidden classes match.${st.q||st.base||st.tower||st.prog||st.tier?' <a href="#" data-hcx-clear>Clear the search and filters</a>':''}</div>`}
const hcHolders=c=>PARTY.filter(ch=>hcList(ch).some(h=>h.n===c.n));
function hcDetailHTML(c,C){const tier=hcTierOf(c),k=C.indexOf(c),held=hcHolders(c),free=PARTY.filter(ch=>!held.includes(ch));
  return `<div class="hcx-dnav"><button type="button" class="btn hcx-back" data-hcx-back>← All hidden classes</button><span class="sp"></span>${k>=0?`<span class="note" style="margin:0">${k+1} of ${C.length}</span><button type="button" class="icon-btn" data-hcx-step="-1" aria-label="Previous hidden class" title="Previous (↑)" ${k<1?'disabled':''}>‹</button><button type="button" class="icon-btn" data-hcx-step="1" aria-label="Next hidden class" title="Next (↓)" ${k>=C.length-1?'disabled':''}>›</button>`:''}<button type="button" class="icon-btn" data-hcx-link aria-label="Copy a link to this class" title="Copy link">${ICON.link}</button></div>
    <div class="hcx-kind">${esc(c.tier)} hidden class</div><h2>${esc(c.n)}</h2><div class="badges" style="display:flex;gap:6px;flex-wrap:wrap">${hcBadges(c)}</div><div class="note" style="margin:6px 0 0">${esc(hcWhere(c))}</div>
    <div class="hcx-dm"><div><b>Held by</b> ${held.length?held.map(ch=>`<span class="b ghost">${esc(ch.name||'Unnamed')} · level ${+ch.level||1}</span>`).join(' '):'<span class="note" style="margin:0">no one in your party</span>'}${c.tier==='Unique'&&held.length?' <span class="b gold">Unique: taken</span>':''}</div>
      ${free.length?`<div class="keyrow"><select class="sel" id="hcx-to" aria-label="Character to grant this class to">${free.map(ch=>`<option value="${esc(ch.id)}">${esc(ch.name||'Unnamed')} (level ${+ch.level||1})</option>`).join('')}</select><button type="button" class="btn" data-hcx-grant="${HC.indexOf(c)}">Grant</button></div>`:PARTY.length?'':`<div class="note" style="margin:0">Add characters on the <a href="${pageUrl('party')}" data-go="party">Party</a> page to grant them hidden classes.</div>`}</div>
    ${hcBody(c)}`}
function hcOverviewHTML(){const held=PARTY.map(ch=>[ch,hcList(ch)]).filter(([,l])=>l.length);
  return `<div class="hcx-kind" style="color:var(--gold2)">Hidden classes</div><h2 style="margin-bottom:10px">Choose a class from the menu</h2>
    <div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">${HC_TIERS.map(([t,,col])=>`<button type="button" class="stat" data-hct="${t}" style="border-top:3px solid ${col}"><span class="v" style="color:${col}">${fmt(HC.filter(c=>c.tier===t).length)}</span><span class="l">${t}</span></button>`).join('')}</div>
    <div class="blk"><h4>Your party's hidden classes</h4></div>${held.length?`<div class="mlist">${held.map(([ch,l])=>`<div style="padding:4px 0"><b>${esc(ch.name||'Unnamed')}</b> <small style="color:var(--muted)">level ${+ch.level||1}</small> ${l.map(h=>{const x=HC.find(y=>y.n===h.n);return x?`<a href="#" class="chip" data-hci="${HC.indexOf(x)}">${esc(h.n)}</a>`:`<span class="chip">${esc(h.n)}</span>`}).join(' ')}</div>`).join('')}</div>`:'<div class="note">No one in your party holds a hidden class yet. Open a class and use Grant, or grant one on the character sheet.</div>'}
    <div class="note" style="margin-top:12px">Tips: type in the search box to find a class, a subclass, a Rune, or a progenitor; <kbd>↑</kbd> <kbd>↓</kbd> step through the list; Group by sorts the menu by tier, Tower, basic class, or progenitor.</div>`}
function hcxPaint(){const C=hcFiltered(),st=hcSt();if($('hcx-list'))$('hcx-list').innerHTML=hcListHTML(C);if($('hcx-n'))$('hcx-n').textContent=C.length+' of '+HC.length;
  const c=st.sel&&HC.find(x=>x.n===st.sel),d=$('hcx-detail');if(!d)return;d.style.setProperty('--tc',c?hcTierOf(c)[2]:'var(--line3)');d.innerHTML=c?hcDetailHTML(c,C):hcOverviewHTML();diceify(d);
  $('hcx').classList.toggle('d',!!c)}
function hcxShow(i,scroll){const c=HC[i];if(!c)return;hcSet({sel:c.n});if(SITE)history.replaceState(null,'','#hc-'+pid(c.n));
  const d=$('hcx-detail');d.style.setProperty('--tc',hcTierOf(c)[2]);d.innerHTML=hcDetailHTML(c,hcFiltered());diceify(d);$('hcx').classList.add('d');
  $('hcx-list').querySelectorAll('.hcx-row').forEach(b=>b.classList.toggle('on',+b.dataset.hci===i));const row=$('hcx-list').querySelector('.hcx-row.on');if(row&&scroll!==false)row.scrollIntoView({block:'nearest'});
  if(matchMedia('(max-width:800px)').matches)$('content').scrollTop=0;else d.scrollIntoView({block:'nearest'})}
function hcxStep(n){const C=hcFiltered(),st=hcSt(),gs=hcGroups(C).flatMap(g=>g[1]),k=gs.findIndex(c=>c.n===st.sel),nx=gs[k<0?(n>0?0:gs.length-1):Math.max(0,Math.min(gs.length-1,k+n))];if(nx)hcxShow(HC.indexOf(nx))}
function hcGrantTo(i){const c=HC[i],ch=$('hcx-to')&&PARTY.find(x=>x.id===$('hcx-to').value);if(!c||!ch)return;const list=hcList(ch),held=hcHolders(c);if(list.some(h=>h.n===c.n)){toast('Already held');return}
  if(c.tier==='Unique'&&held.length&&!confirm(c.n+' is Unique and '+(held[0].name||'another character')+' already holds it. Grant it anyway?'))return;
  ch.hcls=list.concat(hcEntry(c,Math.max(1,+ch.level||1)));saveParty();hcLog(true,'granted '+c.n+' to '+(ch.name||'a character'));toast(c.n+' granted to '+(ch.name||'the character'));hcxShow(i,false)}
// the DM's dice check for hidden classes: each feature's dice (as hcScale grows them) against the realm's median monster HP
function hcDiceRun(){const el=$('hc-dice-out');if(!el||!HC)return;const LV=[5,25,55,95],ref=L=>bondRef(L).hp||1,rows=[];
  HC.forEach(c=>hcTrack(c).forEach(([lv,n,tx])=>{const m=String(tx||'').match(/\d+d\d+(?:\s*\+\s*\d+)?/);if(!m)return;
    const at=LV.map(L=>{const d=(hcScale(m[0],L).match(/\d+d\d+(?:\s*\+\s*\d+)?/)||[''])[0],avg=dmgAvg(d);return {d,avg,pct:avg/ref(L)}});rows.push({c:c.n,tier:c.tier,f:n,base:m[0],at})}));
  if(!rows.length){el.innerHTML='<div class="note">No feature rolls dice.</div>';return}
  rows.sort((a,b)=>b.at[2].pct-a.at[2].pct);const col=p=>p>0.5?' style="color:var(--red);font-weight:600"':p<0.05?' style="color:var(--blue,#5a8dd6)"':'',pc=p=>Math.round(p*100)+'%';
  const hot=rows.filter(r=>r.at.some(x=>x.pct>0.5)).length,weak=rows.filter(r=>r.at.slice(1).every(x=>x.pct<0.05)).length;
  el.innerHTML=`<div class="sh-row" style="margin-bottom:6px">${rows.length} features with dice · <b style="color:var(--red)">${hot}</b> take over half a monster somewhere · <b style="color:var(--blue,#5a8dd6)">${weak}</b> under 5% from level 25 on</div>
    <div class="tablewrap"><table class="t"><thead><tr><th>Class</th><th>Feature</th><th>Dice</th>${LV.map(L=>`<th class="num">Level ${L}<br><small>vs ${fmt(ref(L))} HP</small></th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.c)}</b> <small style="color:var(--muted)">${esc(r.tier||'')}</small></td><td>${esc(r.f)}</td><td class="mono">${esc(r.base)}</td>${r.at.map(x=>`<td class="num"${col(x.pct)}><span class="mono">${esc(x.d)}</span><br><small>${pc(x.pct)}</small></td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
async function renderHidden(){
  await hcAuto();
  const st=hcSt(),ALL=HC||[],dm=role()==='dm',player=role()==='player';
  const tiers=`<div class="hcx-tabs" role="tablist" aria-label="Tiers">${[['','All',ALL.length||Object.values(HIDDEN.counts||{}).reduce((a,b)=>a+b,0),'var(--acc)']].concat(HC_TIERS.map(([t,,col])=>[t,t,HC?ALL.filter(c=>c.tier===t).length:(HIDDEN.counts||{})[t]||0,col])).map(([v,l,n,col])=>`<button type="button" role="tab" aria-selected="${st.tier===v}" class="hcx-tab${st.tier===v?' on':''}" style="--tc:${col}" data-hct="${v}"><i></i>${l} <span class="b ghost">${fmt(n)}</span></button>`).join('')}</div>`;
  const about=`<div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-bottom:14px">${HC_TIERS.map(([t,d,col])=>`<div class="panel" style="border-top:3px solid ${col}"><b style="font-family:var(--serif);font-size:1.15rem;color:${col}">${t}</b> <span class="b ghost">${HC?ALL.filter(c=>c.tier===t).length:(HIDDEN.counts||{})[t]||0}</span><div style="margin-top:4px;font-size:.88rem;color:var(--text2)">${esc(d)}</div></div>`).join('')}</div>`;
  const lock=quickModes().length&&!PAT_SKIP&&window.crypto&&crypto.subtle?patLockHTML():hcLockHTML();
  if(!HC){$('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Hidden classes</h3><p>Beyond the basic classes are hidden classes. No one picks them at character creation: they are unlocked only through quests and by climbing the <a href="${pageUrl('towers')}" data-go="towers">Towers</a> that stand in every realm.</p></div>
    ${about}
    ${player?`<div class="callout" style="margin-bottom:12px"><b>Looking for a hidden class?</b> The list is kept by your DM. Climb the <a href="${pageUrl('towers')}" data-go="towers">Towers</a>, follow rumours, and finish quests; when you earn one, your DM grants it on your <a href="${pageUrl('sheet')}" data-go="sheet">character sheet</a>, where its features appear.</div><details class="fold"><summary>I'm the DM: unlock the list</summary>${lock}</details>`:lock}
  </div>`;
    if($('hc-pat')||$('hc-pin'))patLockBind(renderHidden);else hcBindLock(renderHidden);return}
  const h=location.hash.match(/#hc-([\w-]+)/);if(h){const x=ALL.find(c=>pid(c.n)===h[1]);if(x&&x.n!==st.sel){hcSet({sel:x.n,tier:st.tier&&st.tier!==x.tier?'':st.tier});return renderHidden()}}
  const sel=(k,label,vals)=>`<select class="sel" data-hcf="${k}" aria-label="${esc(label)}"><option value="">${label}</option>${vals.map(v=>`<option${v===st[k]?' selected':''}>${esc(v)}</option>`).join('')}</select>`,u=f=>[...new Set(ALL.map(f).filter(Boolean))].sort();
  const nf=['base','tower','prog'].filter(k=>st[k]).length;
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Hidden classes ${dm?'<span class="b gold" style="vertical-align:middle">DM</span>':''}</h3><p>Every hidden class in Vestige: where it waits, what it asks, and what it grants. Players never see this list. <a href="#" data-hcx-lock>Lock it again</a></p></div>
    ${tiers}
    <div class="hcx-layout${st.sel&&ALL.some(c=>c.n===st.sel)?' d':''}" id="hcx">
      <aside class="hcx-menu" aria-label="Hidden class menu"><div class="hcx-mtop">
        <input class="sel" id="hc-q" type="search" placeholder="Find a class, subclass, Rune, progenitor…" value="${esc(st.q||'')}" style="max-width:none" autocomplete="off">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><label class="note" style="margin:0;display:flex;gap:6px;align-items:center">Group by <select class="sel" data-hcf="group" style="width:auto">${Object.entries(HCX_GROUPS).map(([k,[l]])=>`<option value="${k}"${st.group===k?' selected':''}>${l}</option>`).join('')}</select></label><span class="note" style="margin:0 0 0 auto" id="hcx-n"></span></div>
        <details class="fold hcx-f"${nf?' open':''}><summary>Filters${nf?` <span class="b gold">${nf}</span>`:''}</summary><div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${sel('base','Any basic class',u(c=>c.base).filter(x=>x!=='Any'))}${st.base?sel('sub','Any '+st.base+' subclass',u(c=>c.base===st.base?c.sub:'')):''}${sel('tower','Any Tower realm',REALMS.map(r=>r.n).filter(r=>ALL.some(c=>c.tower===r)))}${sel('prog','Any progenitor',u(c=>c.prog))}
          <label class="note" style="margin:0;display:flex;gap:6px;align-items:center" title="Show every class's numbers at this character level: dice grow every 10 levels, and at 21, 41, 61, and 81 the class turns II to V">Numbers at level <input class="sel" id="hc-lv" type="number" min="1" max="100" placeholder="as written" value="${store.get('hclv',0)||''}" style="width:96px"></label>${nf?'<button type="button" class="btn" data-hcx-clear>Clear filters</button>':''}</div></details>
      </div><div class="hcx-list" id="hcx-list"></div></aside>
      <section class="hcx-detail" id="hcx-detail" aria-live="polite"></section>
    </div>
    <details class="fold" style="margin-top:14px"><summary>About the tiers</summary><div style="margin-top:8px">${about}</div></details>
    ${dm?`<details class="fold" id="hc-dice" style="margin-top:14px"><summary><b>⚖ Dice check</b> <small style="color:var(--muted)">every feature's dice against each realm's typical monster (DM)</small></summary><div class="note" style="margin:6px 0">Each feature that rolls dice, at the middle of four realms' levels, as the share of a typical monster's hit points there (the median monster of that realm). Red: one use takes more than half a monster; blue: under 5%, likely too weak to matter. Dice follow the spell table (×1, ×2, ×6, ×9 … ×40).</div><button class="btn" type="button" onclick="hcDiceRun()">Run the check</button><div id="hc-dice-out" style="margin-top:8px"></div></details>`:''}
    <details class="fold" style="margin-top:14px"><summary>DM rules: classes outside the Towers</summary><ul class="note" style="margin:6px 0 0;padding-left:18px;line-height:1.6"><li><b>Corpse classes.</b> Some Epic classes wait in no Tower: they are claimed from the body of their last holder, wherever that holder fell. Their card says where.</li><li><b>Fused Legendaries.</b> Some Legendary classes are made from Epic classes. A character holding every part can fuse them on the character sheet (DM only); the parts become one class that keeps the highest class level among them.</li><li>Neither kind drops from a Tower floor, appears in a Tower's list, or waits in a secret room. None of this is shown to players anywhere on the site.</li></ul></details>${patSetHTML()+cloudHcHTML()+hcLogHTML()}
  </div>`;
  hcxPaint();patSetBind();
  const root=$('content');
  root.onclick=e=>{const t=e.target;
    const r=t.closest('[data-hci]');if(r){e.preventDefault();hcxShow(+r.dataset.hci);return}
    const tb=t.closest('[data-hct]');if(tb){hcSet({tier:tb.dataset.hct});renderHidden();return}
    if(t.closest('[data-hcx-back]')){hcSet({sel:''});if(SITE)history.replaceState(null,'',location.pathname+location.search);hcxPaint();return}
    const s=t.closest('[data-hcx-step]');if(s){hcxStep(+s.dataset.hcxStep);return}
    if(t.closest('[data-hcx-link]')){const url=location.href.split('#')[0]+'#hc-'+pid(hcSt().sel);(navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>toast('Link copied'),()=>toast(url));return}
    const g=t.closest('[data-hcx-grant]');if(g){hcGrantTo(+g.dataset.hcxGrant);return}
    if(t.closest('[data-hcx-clear]')){e.preventDefault();hcSet({q:'',base:'',sub:'',tower:'',prog:'',tier:''});renderHidden();return}
    if(t.closest('[data-hcx-lock]')){e.preventDefault();HC=null;try{sessionStorage.removeItem('fand.hc')}catch(x){}hcLog(true,'locked again');toast('Hidden classes locked');renderHidden();return}
    const a=t.closest('a[href^="#hc-"]');if(a){const x=ALL.find(c=>'#hc-'+pid(c.n)===a.getAttribute('href'));if(x){e.preventDefault();hcxShow(ALL.indexOf(x))}}};
  root.querySelectorAll('[data-hcf]').forEach(el=>el.onchange=()=>{const o={[el.dataset.hcf]:el.value};if(el.dataset.hcf==='base')o.sub='';hcSet(o);renderHidden()});
  if($('hc-lv'))$('hc-lv').onchange=()=>{const v=Math.max(0,Math.min(MAX_LEVEL,+$('hc-lv').value||0));store.set('hclv',v);hcxPaint()};
  let qt=0;$('hc-q').oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{hcSet({q:e.target.value});hcxPaint()},120)};
  $('hc-q').onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();hcxStep(e.key==='ArrowDown'?1:-1)}else if(e.key==='Enter'){const r=$('hcx-list').querySelector('.hcx-row');if(r&&!hcSt().sel)hcxShow(+r.dataset.hci)}};
  $('hcx-list').onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();hcxStep(e.key==='ArrowDown'?1:-1);const r=$('hcx-list').querySelector('.hcx-row.on');if(r)r.focus()}};
  const on=$('hcx-list').querySelector('.hcx-row.on');if(on)on.scrollIntoView({block:'center'});
}
// Tower trials (campaign owner's rules): every floor is one level (the Milestone Spire's floor 5 is level 5, with grade-5
// guardians), every 10th floor has a boss, a conquered boss floor lets the party teleport to it, and a party above
// a floor's level gets no loot. Rewards are gold, an item, or a Class Change Book for a hidden class.
// Floor missions: every floor gives the party one clear mission. Placeholders: {R} the floor's Rune, {L} its Law, {T} a
// number of rounds, {N} an NPC, {D} a destination, {I} an item, {S} a maze size, {DC} a check DC.
const TRIAL_KINDS=[
  ['Slay','Kill every enemy on the floor.','The doors seal as the party enters and open only when the last guardian falls.'],
  ['Maze','Navigate the maze to the stairs.','The floor is a {S} by {S} labyrinth whose walls shift each round. Each leg takes a DC {DC} Wisdom (Survival) or Intelligence check; every failure wakes a guardian, and three failures in a row bring them all.'],
  ['Escort','Escort {N} to {D}.','{N}, a climber left behind by an earlier party, must reach {D} alive. The guardians go for them first, and they cannot fight.'],
  ['Hold','Hold the centre of the floor for {T} rounds.','Waves of guardians come from every side; the stairs open when the last round ends with someone still standing on the centre stone.'],
  ['Retrieve','Retrieve {I} and carry it to the stairs.','{I} lies at the far end of the floor. Whoever carries it moves at half speed and is the guardians\' first target.'],
  ['Stealth','Cross the floor unseen.','Guardians patrol in loops. Each character makes a DC {DC} Dexterity (Stealth) check per stretch; every failure raises the alarm and adds a guardian to the fight at the stairs.'],
  ['Race','Reach the stairs before the floor falls away ({T} rounds).','The floor crumbles behind the party, one stretch a round. Guardians block the way; anyone left behind falls to the floor below.'],
  ['Protect','Protect the floor\'s shrine for {T} rounds.','A shrine of the {R} Law stands in the centre (AC 0, 10 hit points per party level). If it breaks, the guardians double; if it stands, the stairs open.'],
  ['Riddle','Answer the riddle of the {R} Law.','A voice speaks a riddle about the {R} Law. A right answer halves the guardians; a wrong one releases them all at once.'],
  ['Law','Endure the {R} Law.','The floor bends to the {R} Law: {L} Cross it to the stairs while the Law works on you.'],
];
const TRIAL_PLACES=['the stairs','the far gate of the floor','the shrine at the floor\'s centre','an old campfire by the east wall','a rope bridge over the floor\'s chasm'],TRIAL_ITEMS=['the {R} Rune-shard','a sealed reliquary','the floor guardian\'s key','a progenitor\'s tooth','a cracked Class Change Book'];
const ORD=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
// A Tower's first floor matches its realm's stage: Human level 1, Mysterious 11, Hell and Heaven 21, ...
// and every floor is one level (campaign owner's rule): floor 5 of the Milestone Spire is a level-5 floor with grade-5
// guardians. A realm's monster grades run 1 to 10, so floors past the 10th keep grade-10 guardians.
const towerStart=realm=>((REALM[realm]||{tier:1}).tier-1)*10+1;
const floorLevel=(realm,floor)=>towerStart(realm)+Math.max(1,floor|0)-1;
const floorGrade=floor=>Math.max(1,Math.min(10,floor|0));
// CR for a level: the level itself up to 20, then slowly toward 30
const crFor=L=>L<=20?L:Math.min(30,20+Math.round((L-20)/9));
// Tower guardians: monsters of the floor's grade from the Tower's own realm (the nearest grade where the realm has none);
// a boss floor's guardian is one of the strongest of that grade
function trialMonsters(realm,G,boss,R){const own=MONSTERS.filter(m=>m.realm===realm),c=m=>crNum(m.sb?m.sb.cr:m.cr);
  let pool=own.filter(m=>m.g===G);for(let d=1;!pool.length&&d<10;d++)pool=own.filter(m=>Math.abs(m.g-G)===d);
  if(!pool.length)pool=MONSTERS.filter(m=>m.g===G);
  if(boss){pool=pool.slice().sort((a,b)=>c(b)-c(a));pool=pool.slice(0,Math.max(1,Math.ceil(pool.length/3)))}
  const pk=()=>pool[Math.floor(R()*pool.length)];
  return (boss?[pk()]:Array.from({length:2+Math.floor(R()*3)},pk)).filter(Boolean);
}
const LEG_TRIAL=[.03,.08];
const hcReqLevel=c=>{const m=/level (\d+)/i.exec(c.requires||'');return m?+m[1]:1};
function makeTrial(o){
  {const T0=towerOf(o.tower||o.realm);o=Object.assign({},o,{realm:T0.realm,tower:T0.id})}
  const T=towerOf(o.tower),floor=Math.max(1,Math.min(T.floors,o.floor|0)),start=towerStart(o.realm),L=floorLevel(o.realm,floor),G=floorGrade(floor),boss=floor%10===0;
  const R=rng32((o.seed||0)+floor*7919+o.tower.length*31+(o.rune||'').length*131);
  const runes=T.runes,rune=RUNE_IDX.get(lc(o.rune||''))||runes[Math.floor(R()*runes.length)]||RUNES[0];
  const law=rune.note?plainMd(rune.note.md).split(/(?<=\.)\s/)[0].slice(0,200):`${rune.n} is in the air of every room.`;
  const kind=boss?['Boss','Defeat the floor guardian.','The floor guardian waits at the top of the stairs. The {R} Law hums in its weapon; defeat it to conquer the floor.']:TRIAL_KINDS[Math.floor(R()*TRIAL_KINDS.length)];
  const fill=x=>x.replace(/\{R\}/g,rune.n).replace(/\{T\}/g,String(3+Math.floor(R()*4))).replace('{L}',law).replace(/\{DC\}/g,String(10+Math.ceil(L/4))).replace(/\{S\}/g,String(5+Math.floor(L/10)*2)).replace(/\{N\}/g,fill.npc||(fill.npc=NPC_FIRST[Math.floor(R()*NPC_FIRST.length)]+' '+NPC_LAST[Math.floor(R()*NPC_LAST.length)])).replace(/\{D\}/g,fill.dest||(fill.dest=TRIAL_PLACES[Math.floor(R()*TRIAL_PLACES.length)])).replace(/\{I\}/g,fill.item||(fill.item=TRIAL_ITEMS[Math.floor(R()*TRIAL_ITEMS.length)].replace('{R}',rune.n)));
  const mission=fill(kind[1]),text=fill(kind[2]);
  const mons=trialMonsters(o.realm,G,boss,R),over=(o.level|0)>L;
  const rw=[];
  // a Class Change Book drops half the time for a party at the floor's level (or below it), and a quarter of the time for
  // an over-level party, which gets no gold, materials, or items (campaign owner's rule)
  const BOOK_CH=[.5,.25],bookCh=over?BOOK_CH[1]:BOOK_CH[0];
  if(!over){
    // gold follows the realm's prices: a floor pays about one grade-5 material of its realm, a boss about three, rising 15% a level
    const tier=(REALM[o.realm]||{}).tier||1,g=Math.max(5,Math.round(realmBase(o.realm)*5*(1+0.15*(L-start))*(boss?3:1)*(0.75+R()*0.5)/5)*5);rw.push({k:'gold',t:gp(g),v:g});
    // materials of the Tower's realm, their grade rising with the floor's level (a boss gives one grade more)
    const mg=Math.max(1,Math.min(10,1+(L-start)+(boss?1:0))),mp=MATS.filter(m=>m.realm===o.realm&&m.g===mg&&!m.gen);if(mp.length){const m=mp[Math.floor(R()*mp.length)];rw.push({k:'mat',x:m,q:(boss?3:1)+Math.floor(R()*2)})}
    // items at the floor's level; rarer the higher the floor
    const RAR=['Common','Uncommon','Rare','Very Rare','Legendary'],rmax=RAR[Math.min(4,Math.floor((Math.min(L,20)-1)/2)+(boss?1:0))],BL=Math.min(20,L);
    if((boss||R()<.4)&&L>20){const pool=GEN.filter(([n,b])=>!b.potion&&b.group!=='Focuses'||b.focus),pick=pool[Math.floor(R()*pool.length)],B=pick[1],prim=B.slots.find(x=>x.role==='primary')||B.slots[0],ms=MATS.filter(m=>m.realm===o.realm&&!m.gen&&Math.abs(m.g-mg)<=1&&slotFit(prim,m).lv==='good');if(ms.length)rw.push({k:'forged',base:pick[0],x:ms[Math.floor(R()*ms.length)]})}
    else if(boss||R()<.4){const bp=BPS.filter(b=>b.lv<=BL+1&&b.lv>=Math.max(1,BL-2)&&RAR.indexOf(b.r)<=RAR.indexOf(rmax)&&!['Food','Crop','Fertilizer','Livestock','Structure','Fortification','Siege Engine','Vehicle'].includes(b.cat));const b=bp.sort((a,c)=>RAR.indexOf(c.r)-RAR.indexOf(a.r)).slice(0,Math.max(8,bp.length>>2))[Math.floor(R()*Math.min(bp.length,Math.max(8,bp.length>>2)))];if(b)rw.push({k:'item',x:b})}
  }
  {
    const here=HC?HC.filter(c=>hcInTower(c)&&hcTower(c)===T.id):[],sealed=sealedIn(T);
    const onFloor=here.filter(c=>hcFloor(c)===floor),bookRoll=R();
    if(bookRoll<bookCh&&onFloor.length)rw.push({k:'book',c:onFloor[Math.floor(R()*onFloor.length)]});
    if(bookRoll<bookCh&&!onFloor.length&&boss&&R()<.3){const can=here.filter(c=>hcFloor(c)<=floor);if(can.length)rw.push({k:'book',c:can[Math.floor(R()*can.length)]});else if(!HC&&sealed)rw.push({k:'sealed'})}
    if(bookRoll<bookCh&&!HC&&sealed&&!rw.some(x=>x.k==='sealed')&&[.5,.75,1].some(f=>Math.round(T.floors*f)===floor))rw.push({k:'sealed'});
  }
  // Hidden Legendary conditions (campaign owner's rule): any floor of any Tower may also hide the condition of a Legendary
  // class (3% a floor, 8% on boss floors), drawn from those whose level requirement the floor's level meets. Nothing on the
  // floor announces it and the party never needs it to climb: a character who happens to meet the condition earns the
  // class's Class Change Book. Only the DM sees it. Rolled on its own seed so the rest of the floor stays the same.
  const R2=rng32((o.seed||0)*7+floor*31337+o.tower.length*101);let legend=null;
  if(R2()<(boss?LEG_TRIAL[1]:LEG_TRIAL[0])){
    if(HC){const pool=HC.filter(c=>c.tier==='Legendary'&&!c.combo&&hcReqLevel(c)<=L);if(pool.length)legend=pool[Math.floor(R2()*pool.length)]}
  }
  return {T,floor,L,G,boss,rune,kind:kind[0],mission,text,mons,over,rw,bookCh,legend};
}
function trialHTML(t,o){
  const prog=store.get('towerprog',{})[t.T.id]||0,ports=[1];for(let f=10;f<=prog;f+=10)ports.push(f);
  return `<div class="panel" style="border-top:3px solid ${(REALM[o.realm]||{}).color||'var(--gold)'}">
    <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:1.2rem">${esc(t.T.name)}, ${ORD(t.floor)} floor</b>${t.boss?'<span class="b red">Boss floor</span>':''}<span class="b">Level ${t.L}</span><span class="b ghost">Grade ${t.G} guardians</span><span class="b ghost">${esc(t.kind)}</span><span class="note" style="margin:0">Built on ${refChip(t.rune)}</span></div>
    <div style="margin:10px 0 4px;font-size:1.05rem"><b>Mission:</b> ${esc(t.mission)}</div>
    <p style="line-height:1.6;margin:4px 0 8px">${esc(t.text)}</p>
    <details open style="margin:6px 0 10px"><summary style="cursor:pointer;font-weight:600">Floor map</summary><div style="margin-top:8px">${floorMapSVG(t,o)}</div></details>
    ${trackHTML(t,o)}
    ${t.mons.length?`<div class="blk"><h4>${t.boss?'Floor guardian':'Guardians'}</h4></div><div class="chips">${t.mons.map(m=>refChip(m,esc(m.n),'CR '+(m.sb?m.sb.cr:m.cr))).join('')}</div>`:''}
    <div class="blk" style="margin-top:10px"><h4>Reward <em>scaled to floor ${t.floor} (level ${t.L}, grade ${t.G}) of a tier-${(REALM[o.realm]||{}).tier||1} Tower</em></h4></div>
    ${t.over?`<div class="callout" style="border-color:var(--red)"><b>No loot.</b> The party (level ${o.level}) is above this floor's level (${t.L}). The Tower gives nothing to those who climb beneath themselves, except perhaps a Class Change Book: a ${Math.round(t.bookCh*100)}% chance (50% at the floor's level).</div>`:''}${!t.rw.length?(t.over?'<div class="note">No Class Change Book this time.</div>':''):`<div class="mlist">${t.rw.map(r=>r.k==='gold'?`<button disabled style="opacity:1;cursor:default">💰 <b>${r.t}</b><span class="x">${localPrice(r.v,o.realm)||''}</span></button>`:r.k==='mat'?`<button data-ref="${ref(r.x)}">⛏ <b>${r.q}× ${esc(r.x.n)}</b><span class="x">${esc(r.x.gr)}${r.x.pn?' · '+esc(r.x.pn):''}</span></button>`:r.k==='item'?`<button data-ref="${ref(r.x)}">🎁 <b>${esc(r.x.n)}</b><span class="x">${esc(r.x.cat)} · Lv ${r.x.lv}${r.x.r?' · '+esc(r.x.r):''}</span></button>`:r.k==='forged'?`<button data-ref="${ref(r.x)}">🎁 <b>${esc(r.x.n)} ${esc(r.base)}</b><span class="x">Forge design · Item Level ${r.x.il||1} · ${esc(r.x.gr)}</span></button>`:r.k==='book'?`<a class="chip" href="${pageUrl('hidden')}#hc-${pid(r.c.n)}" data-go="hidden" style="text-decoration:none;padding:8px 12px">📕 <b>Class Change Book: ${esc(r.c.n)}</b> <small>${esc(r.c.tier)}${r.c.base&&r.c.base!=='Any'?' · for '+esc(r.c.base):''}</small></a>`:`<a class="chip" href="${pageUrl('hidden')}" data-go="hidden" style="padding:8px 12px;white-space:normal;max-width:100%">📕 <b>A sealed Class Change Book</b> <small>unlock the hidden class list to see which</small></a>`).join('')}</div>`}
    ${t.legend&&HC?(()=>{const dc=10+Math.ceil(t.L/4);if(t.legend==='sealed')return `<details class="fold" style="margin-top:10px"><summary>DM: secret room on this floor</summary><div class="note" style="margin:6px 0 0">A secret room on this floor holds a Legendary class's trial. Unlock the hidden class list to see which.</div></details>`;
      const own=towerOf(hcTower(t.legend)).name,core=own.replace(/^The /,''),trial=String(t.legend.unlock||'').replace(new RegExp('\\b(the |The )?'+core.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),'this secret room').replace(/^(At|On) the top of this secret room,?\s*/i,'Inside, ').replace(/^Climb this secret room to /i,'Inside, reach ');
      return `<details class="fold" style="margin-top:10px"><summary>DM: secret room on this floor</summary><div style="line-height:1.6;margin:6px 0 0">Hidden off the main floor is a <b>secret room</b>. It does not interfere with the floor's mission, and the party can clear the floor without ever finding it.
      <ul style="margin:6px 0;padding-left:20px"><li><b>Finding it:</b> Wisdom (Perception) or Intelligence (Investigation) DC ${dc}, or a clue you plant on the floor.</li>
      <li><b>Inside, the trial of the Legendary class <a href="${pageUrl('hidden')}#hc-${pid(t.legend.n)}" data-go="hidden">${esc(t.legend.n)}</a></b>${t.legend.prog?' (follower of '+esc(t.legend.prog)+')':''}. ${esc(trial)}</li>
      ${t.legend.secret?`<li><b>Hidden condition:</b> ${esc(t.legend.secret)}</li>`:''}
      <li><b>Reward:</b> whoever passes it earns the Class Change Book for ${esc(t.legend.n)}${t.over?` (over-level: ${Math.round(t.bookCh*100)}% chance)`:''}.</li></ul></div></details>`})():''}
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px">${t.boss?`<button class="btn primary" id="tr-conquer">⚔ Mark floor ${t.floor} conquered</button>`:''}<span class="note" style="margin:0">Teleport to: ${ports.map(f=>`<button class="chip" data-tp="${f}">Floor ${f}</button>`).join(' ')}${prog?` · conquered up to floor ${prog}`:''}</span></div></div>`;
}
// Mission tracker: what the DM ticks off while the party works the floor's mission (kept per Tower, floor, and seed on this device).
// Counters with a goal, hit points that must stay above 0, checks, and failure tallies (which never block the stairs).
function trialTrack(t,o){
  const n=re=>{const m=(t.mission+' '+t.text).match(re);return m?+m[1]:0},T=n(/(\d+) rounds/)||4,S=n(/(\d+) by \1/)||5,g=Math.max(1,t.mons.length);
  const name=(t.text.match(/^(.+?), a climber/)||[])[1]||'The climber',item=(t.mission.match(/^Retrieve (.+?) and carry/)||[])[1]||'the item';
  return {
    Boss:[{t:'check',l:'Floor guardian defeated'}],
    Slay:[{t:'count',l:'Guardians down',max:g}],
    Maze:[{t:'count',l:'Legs of the maze crossed',max:Math.ceil(S/2)},{t:'fail',l:'Failed checks in a row',warn:3,note:'At 3, every guardian comes. Reset it after a success.'}],
    Escort:[{t:'hp',l:name+"'s hit points",max:6+4*t.L},{t:'count',l:'Stretches covered',max:4}],
    Hold:[{t:'count',l:'Rounds held on the centre stone',max:T}],
    Retrieve:[{t:'check',l:'Found '+item},{t:'check',l:'Carried it to the stairs'}],
    Stealth:[{t:'count',l:'Stretches crossed',max:4},{t:'fail',l:'Alarms raised',note:'Each alarm adds a guardian to the fight at the stairs.'}],
    Race:[{t:'count',l:'Stretches crossed before the floor falls',max:T}],
    Protect:[{t:'hp',l:'Shrine hit points',max:10*Math.max(1,o.level|0)},{t:'count',l:'Rounds survived',max:T}],
    Riddle:[{t:'pick',l:'The riddle',opts:['Answered right (guardians halved)','Answered wrong (all guardians at once)']},{t:'count',l:'Guardians down',max:g}],
    Law:[{t:'count',l:'Stretches crossed under the Law',max:4}],
  }[t.kind]||[];
}
const trackKey=(t,o)=>[t.T.id,t.floor,o.seed||0,o.rune||''].join('|');
function trackState(k){return (store.get('trialtrack',{})[k])||{}}
function trackSet(k,v){const all=store.get('trialtrack',{});delete all[k];all[k]=v;const ks=Object.keys(all);ks.slice(0,Math.max(0,ks.length-40)).forEach(x=>delete all[x]);store.set('trialtrack',all)}
function trackHTML(t,o){
  const spec=trialTrack(t,o);if(!spec.length)return '';
  const st=trackState(trackKey(t,o)),val=(it,i)=>st[i]!=null?st[i]:it.t==='hp'?it.max:it.t==='pick'?-1:0;
  const done=spec.every((it,i)=>it.t==='count'?val(it,i)>=it.max:it.t==='check'?!!val(it,i):it.t==='hp'?val(it,i)>0:it.t==='pick'?val(it,i)>=0:true),lost=spec.some((it,i)=>it.t==='hp'&&val(it,i)<=0);
  const bar=(v,m,col)=>`<div class="bar" style="margin-top:4px"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%;background:${col}"></i></div>`;
  const pm=(i,d,lab)=>`<button class="btn" data-tk="${i}" data-d="${d}" style="min-width:40px">${lab}</button>`;
  return `<div class="tool" id="tr-track" style="margin-top:12px;border-color:${lost?'var(--red)':done?'var(--green)':'var(--line)'}"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Mission tracker</h3><span class="note" style="margin:0">Tick it off as the party plays the floor.</span><button class="btn" data-tk="reset" style="margin-left:auto">Reset</button></div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">${spec.map((it,i)=>{const v=val(it,i);
      if(it.t==='check')return `<label style="display:flex;gap:10px;align-items:center;font-size:1rem"><input type="checkbox" data-tk="${i}" ${v?'checked':''} style="width:22px;height:22px"> ${esc(it.l)}</label>`;
      if(it.t==='pick')return `<div><div style="margin-bottom:6px">${esc(it.l)}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${it.opts.map((x,j)=>`<button class="btn${v===j?' primary':''}" data-tk="${i}" data-v="${j}">${esc(x)}</button>`).join('')}</div></div>`;
      const ctl=it.t==='hp'?`${pm(i,-5,'−5')}${pm(i,-1,'−1')}${pm(i,1,'+1')}`:`${pm(i,-1,'−')}${pm(i,1,'+')}`;
      const shown=it.t==='fail'?`<b style="font-size:1.15rem;color:${it.warn&&v>=it.warn?'var(--red)':'var(--text)'}">${v}</b>${it.warn?` / ${it.warn}`:''}`:`<b style="font-size:1.15rem">${v}</b> / ${it.max}`;
      return `<div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="flex:1;min-width:150px">${esc(it.l)}</span>${shown}<span style="display:flex;gap:4px">${ctl}</span></div>${it.t==='hp'?bar(v,it.max,v/it.max>.5?'var(--green)':v/it.max>.25?'var(--gold)':'var(--red)'):it.t==='count'?bar(v,it.max,'var(--acc)'):''}${it.note?`<div class="note" style="margin:4px 0 0">${esc(it.note)}</div>`:''}</div>`}).join('')}</div>
    ${lost?`<div class="callout" style="border-color:var(--red);margin-top:12px"><b>Mission failed.</b> ${t.kind==='Protect'?'The shrine is broken: the guardians double. The stairs stay shut until every guardian falls.':'The climber is down. The stairs stay shut until every guardian falls, and the floor remembers.'}</div>`:done?`<div class="callout" style="border-color:var(--green);margin-top:12px"><b>Mission complete.</b> The stairs to floor ${Math.min(t.T.floors,t.floor+1)} open.</div>`:''}</div>`;
}
function trackBind(t,o,redraw){
  const box=$('tr-track');if(!box)return;const k=trackKey(t,o),spec=trialTrack(t,o);
  const put=(i,v)=>{const st=trackState(k);st[i]=v;trackSet(k,st);redraw()};
  box.querySelectorAll('[data-tk]').forEach(el=>{const i=el.dataset.tk;
    if(i==='reset'){el.onclick=()=>{trackSet(k,{});redraw()};return}
    const it=spec[+i],cur=()=>{const v=trackState(k)[i];return v!=null?v:it.t==='hp'?it.max:0};
    if(el.type==='checkbox')el.onchange=()=>put(i,el.checked);
    else if(el.dataset.v!=null)el.onclick=()=>put(i,+el.dataset.v);
    else el.onclick=()=>put(i,Math.max(0,Math.min(it.max||999,cur()+(+el.dataset.d))));
  });
}

// Floor map: a simple plan of the floor that fits its mission, drawn from its own seed (the same floor always gets the same map).
// Maze floors are a true S by S labyrinth; the others are rooms joined by passages, with the mission's places marked.
function floorMapSVG(t,o){
  const R=rng32((o.seed||0)*13+t.floor*7919+t.T.id.length*977),pk=a=>a[Math.floor(R()*a.length)];
  const ink='var(--text2)',wall='var(--line3)',room='var(--surf2)',hot='var(--gold)',bad='var(--red)',acc='var(--acc)';
  const label=(x,y,s,col,size)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size||13}" fill="${col||ink}" font-family="var(--sans)">${s}</text>`;
  const legend=items=>`<div class="note" style="display:flex;gap:12px;flex-wrap:wrap;margin:6px 0 0">${items.map(([s,l])=>`<span><b>${s}</b> ${esc(l)}</span>`).join('')}</div>`;
  if(t.kind==='Maze'){
    const S=Math.min(15,+((t.text.match(/(\d+) by \1/)||[])[1])||5),C=24,P=8,seen=new Set(),walls=new Set();
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){walls.add(`h${x},${y}`);walls.add(`v${x},${y}`)}
    const stack=[[0,S-1]];seen.add(`0,${S-1}`);
    while(stack.length){const [x,y]=stack[stack.length-1],nb=[[x+1,y,'v',x+1,y],[x-1,y,'v',x,y],[x,y+1,'h',x,y+1],[x,y-1,'h',x,y]].filter(([a,b])=>a>=0&&b>=0&&a<S&&b<S&&!seen.has(a+','+b));
      if(!nb.length){stack.pop();continue}const [a,b,d,wx,wy]=pk(nb);walls.delete(`${d}${wx},${wy}`);seen.add(a+','+b);stack.push([a,b])}
    const W=S*C+P*2,lines=[];
    walls.forEach(w=>{const [x,y]=w.slice(1).split(',').map(Number);if(w[0]==='h'&&y>0)lines.push([x,y,x+1,y]);if(w[0]==='v'&&x>0)lines.push([x,y,x,y+1])});
    lines.push([0,0,S,0],[0,S,S,S],[0,0,0,S],[S,0,S,S]);
    return `<svg viewBox="0 0 ${W} ${W}" style="width:100%;max-width:420px;display:block;margin:0 auto" role="img" aria-label="Maze map">${lines.map(([a,b,c,d])=>`<line x1="${P+a*C}" y1="${P+b*C}" x2="${P+c*C}" y2="${P+d*C}" stroke="${wall}" stroke-width="3" stroke-linecap="round"/>`).join('')}
      <circle cx="${P+C/2}" cy="${P+(S-.5)*C}" r="${C/3}" fill="${acc}"/>${label(P+C/2,P+(S-.5)*C,'E','#fff',11)}<rect x="${P+(S-1)*C+4}" y="${P+4}" width="${C-8}" height="${C-8}" rx="3" fill="${hot}"/>${label(P+(S-.5)*C,P+C/2,'S','#000',11)}</svg>
      ${legend([['E','Entrance'],['S','Stairs up'],['','The walls shift each round: redraw (🎲 New trial) if the party is lost for too long.']])}`;
  }
  // rooms on a grid, joined by a spanning tree plus a few loops
  const boss=t.kind==='Boss',GW=boss?3:4,GH=boss?3:4,C=80,P=10,W=GW*C+P*2,H=GH*C+P*2,id=(x,y)=>y*GW+x;
  const rooms=[];for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const w=36+R()*30,h=32+R()*30;rooms.push({x,y,w,h,cx:P+x*C+C/2,cy:P+y*C+C/2})}
  const edges=new Set(),seen=new Set([id(0,GH-1)]),stack=[[0,GH-1]];
  while(stack.length){const [x,y]=stack[stack.length-1],nb=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>a>=0&&b>=0&&a<GW&&b<GH&&!seen.has(id(a,b)));if(!nb.length){stack.pop();continue}
    const [a,b]=pk(nb);edges.add([id(x,y),id(a,b)].sort((p,q)=>p-q).join('-'));seen.add(id(a,b));stack.push([a,b])}
  for(let i=0;i<3;i++){const x=Math.floor(R()*(GW-1)),y=Math.floor(R()*GH);edges.add([id(x,y),id(x+1,y)].join('-'))}
  const adj=rooms.map(()=>[]);edges.forEach(e=>{const [a,b]=e.split('-').map(Number);adj[a].push(b);adj[b].push(a)});
  const bfs=s=>{const d=rooms.map(()=>-1),prev=rooms.map(()=>-1),q=[s];d[s]=0;while(q.length){const u=q.shift();adj[u].forEach(v=>{if(d[v]<0){d[v]=d[u]+1;prev[v]=u;q.push(v)}})}return {d,prev}};
  const ent=id(Math.floor(R()*GW),GH-1),fromE=bfs(ent),top=rooms.map((r,i)=>i).filter(i=>rooms[i].y===0),stairs=top.sort((a,b)=>fromE.d[b]-fromE.d[a])[0];
  const path=[];for(let u=stairs;u>=0;u=fromE.prev[u])path.unshift(u);
  const mid=rooms.map((r,i)=>i).sort((a,b)=>Math.hypot(rooms[a].x-(GW-1)/2,rooms[a].y-(GH-1)/2)-Math.hypot(rooms[b].x-(GW-1)/2,rooms[b].y-(GH-1)/2))[0];
  const far=rooms.map((r,i)=>i).filter(i=>i!==stairs&&i!==ent).sort((a,b)=>fromE.d[b]-fromE.d[a])[0];
  const others=rooms.map((r,i)=>i).filter(i=>i!==ent&&i!==stairs);
  const marks=[],extra=[],leg=[['E','Entrance'],['S','Stairs up']];
  const mk=(i,s,col,txt)=>marks.push({i,s,col,txt});
  const g=Math.max(1,t.mons.length),spread=n=>{const pool=others.slice(),out=[];for(let k=0;k<n&&pool.length;k++)out.push(pool.splice(Math.floor(R()*pool.length),1)[0]);return out};
  if(boss){mk(mid,'B',bad,'#fff');leg.push(['B','The floor guardian'])}
  else if(t.kind==='Slay'){spread(g).forEach(i=>mk(i,'G',bad,'#fff'));leg.push(['G','Guardians (doors sealed until all fall)'])}
  else if(t.kind==='Hold'){mk(mid,'◆',hot,'#000');leg.push(['◆','The centre stone'])}
  else if(t.kind==='Protect'){mk(mid,'✦',hot,'#000');leg.push(['✦','The shrine'])}
  else if(t.kind==='Escort'){mk(path[1]!=null?path[1]:ent,'N',acc,'#fff');mk(far,'D',hot,'#000');leg.push(['N','Where the climber waits'],['D','The destination'])}
  else if(t.kind==='Retrieve'){mk(far,'★',hot,'#000');leg.push(['★','The item'])}
  else if(t.kind==='Stealth'){spread(Math.min(4,others.length)).forEach(i=>extra.push(`<circle cx="${rooms[i].cx}" cy="${rooms[i].cy}" r="${C*.46}" fill="none" stroke="${bad}" stroke-width="2" stroke-dasharray="5 5"/>`));leg.push(['◌','Patrol loops'])}
  else if(t.kind==='Race'){path.forEach((u,k)=>{if(u!==ent&&u!==stairs)mk(u,String(k),'var(--surf3)',ink)});leg.push(['1, 2, …','Stretches (each falls a round after the party leaves it)'])}
  else if(t.kind==='Riddle'){mk(path[Math.floor(path.length/2)],'?',acc,'#fff');leg.push(['?','Where the voice speaks'])}
  else if(t.kind==='Law'){spread(3).forEach(i=>mk(i,'ᚱ',acc,'#fff'));leg.push(['ᚱ','Rooms where the Law is strongest'])}
  if(!boss&&t.kind!=='Slay')spread(Math.min(2,g)).filter(i=>!marks.some(m=>m.i===i)).forEach(i=>mk(i,'G',bad,'#fff'));
  if(!boss&&t.kind!=='Slay')leg.push(['G','Guardians']);
  mk(ent,'E',acc,'#fff');mk(stairs,'S',hot,'#000');
  const corr=[...edges].map(e=>{const [a,b]=e.split('-').map(Number);return `<line x1="${rooms[a].cx}" y1="${rooms[a].cy}" x2="${rooms[b].cx}" y2="${rooms[b].cy}" stroke="${wall}" stroke-width="9" stroke-linecap="round"/>`}).join('');
  const path2=t.kind==='Race'?`<polyline points="${path.map(u=>rooms[u].cx+','+rooms[u].cy).join(' ')}" fill="none" stroke="${hot}" stroke-width="2" stroke-dasharray="4 4"/>`:'';
  const rs=rooms.map((r,i)=>boss&&i===mid?`<rect x="${P+r.x*C+4}" y="${P+r.y*C+4}" width="${C-8}" height="${C-8}" rx="6" fill="${room}" stroke="${bad}" stroke-width="2"/>`:`<rect x="${r.cx-r.w/2}" y="${r.cy-r.h/2}" width="${r.w}" height="${r.h}" rx="4" fill="${room}" stroke="${wall}" stroke-width="1.5"/>`).join('');
  const ms=[],per={};marks.forEach(m=>{const k=per[m.i]=(per[m.i]||0)+1,off=(k-1)*16-(marks.filter(x=>x.i===m.i).length-1)*8,r=rooms[m.i];ms.push(`<circle cx="${r.cx+off}" cy="${r.cy}" r="9" fill="${m.col}"/>${label(r.cx+off,r.cy,m.s,m.txt,m.s.length>1?9:11)}`)});
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:0 auto" role="img" aria-label="Floor map">${corr}${rs}${extra.join('')}${path2}${ms.join('')}</svg>${legend(leg)}`;
}
function trialTool(){
  const o=Object.assign({realm:'Human',rune:'',floor:1,level:1,seed:1},store.get('trial',{}));
  const T=towerOf(o.tower||o.realm),runes=T.runes;
  return `<section class="sec" id="trial"><div class="sec-h"><h3>Tower trial</h3><p>Pick a Tower (or the unclaimed Rune it is built on) and a floor. Every floor is one level, starting at the realm's stage: floor 5 of the Milestone Spire is level 5 with grade-5 guardians (Mysterious Towers start at level 11, Hell and Heaven at 21, …; past floor 10 the guardians stay grade 10), with a boss on every 10th floor.</p></div>
    <div class="tool"><div class="form" style="grid-template-columns:repeat(5,1fr)">
      <label>Tower<select id="tr-realm">${REALMS.map(r=>`<optgroup label="${esc(r.n)} Realm">${towersIn(r.n).map(t=>`<option value="${esc(t.id)}"${t.id===T.id?' selected':''}>${esc(t.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <label>Built on the Rune<select id="tr-rune"><option value="">Any of its ${runes.length}</option>${runes.slice().sort(byName).map(r=>`<option${r.n===o.rune?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
      <label>Floor (1–${T.floors})<input id="tr-floor" type="number" min="1" max="${T.floors}" value="${Math.min(o.floor,T.floors)}"></label>
      <label>Party level<input id="tr-lv" type="number" min="1" max="100" value="${o.level}"></label>
      <label style="align-self:end"><button class="btn" id="tr-new" type="button" style="width:100%">🎲 New trial</button></label></div></div>
    <div id="tr-out" style="margin-top:12px"></div></section>`;
}
function trialBind(){
  const get=()=>Object.assign({realm:'Human',rune:'',floor:1,level:1,seed:1},store.get('trial',{}));
  const show=()=>{const o=get(),t=makeTrial(o);$('tr-out').innerHTML=trialHTML(t,o);
    const tk=()=>{const b=$('tr-track');if(b){b.outerHTML=trackHTML(t,o);trackBind(t,o,tk)}};trackBind(t,o,tk);
    const c=$('tr-conquer');if(c)c.onclick=()=>{const tid=towerOf(o.tower||o.realm).id,p=store.get('towerprog',{});p[tid]=Math.max(p[tid]||0,o.floor);store.set('towerprog',p);const deed=`Conquered floor ${o.floor} of ${towerOf(tid).name}`;if(PARTY.length&&confirm(deed+'. Record it as an accomplishment for the party? (The DM decides whether it is worth a level.)')){PARTY.forEach(ch=>{ch.log=(ch.log||[]).concat({d:new Date().toISOString().slice(0,10),deed})});saveParty()}toast(`Floor ${o.floor} conquered: teleport unlocked`);show()};
    $('tr-out').querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{const s2=get();s2.floor=+b.dataset.tp+(+b.dataset.tp>1?1:0);s2.floor=Math.min(s2.floor,towerOf(s2.tower||s2.realm).floors);store.set('trial',s2);$('tr-floor').value=s2.floor;show()})};
  const save=()=>{const s2=get();const tid=$('tr-realm').value,T2=towerOf(tid);if(tid!==towerOf(s2.tower||s2.realm).id){s2.rune='';s2.tower=T2.id;s2.realm=T2.realm;store.set('trial',s2);$('trial').outerHTML=trialTool();trialBind();return}
    Object.assign(s2,{rune:$('tr-rune').value,floor:Math.max(1,Math.min(T2.floors,+$('tr-floor').value||1)),level:Math.max(1,Math.min(MAX_LEVEL,+$('tr-lv').value||1))});store.set('trial',s2);show()};
  ['tr-realm','tr-rune','tr-floor','tr-lv'].forEach(i=>$(i).addEventListener('change',save));
  $('tr-new').onclick=()=>{const s2=get();s2.seed=(Math.random()*2**31)|0;store.set('trial',s2);show()};
  show();
}
async function renderTowers(){
  await hcAuto();
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">The Towers</h3><p>Up to five Towers stand in every realm (${TOWERS.length} in all). No one built them: they grew out of the excess energy of unclaimed Runes, Laws no god holds, whose power has nowhere else to go; related Runes feed the same Tower. The deeper the realm, the taller its Towers. Climbing one is the only way, besides certain quests, to unlock a <a href="${pageUrl('hidden')}" data-go="hidden">hidden class</a>.</p></div>
    ${trialTool()}
    <div class="callout" style="margin:14px 0">Every floor is one level, starting at the realm's own level: floor 5 of the Milestone Spire is a level-5 floor for a level-5 party, guarded by grade-5 monsters of the Human Realm. The Mysterious Towers start at level 11, Hell's and Heaven's at 21, and so on; past floor 10 the guardians stay grade 10. A boss waits on every 10th floor. Conquer a boss floor and you can teleport to it from then on. A party whose level is above a floor's level gets no gold, materials, or items there; a Class Change Book drops half the time for a party at the floor's level and a quarter of the time for an over-level party. Each floor is guarded by creatures of the Tower's realm whose grade matches the floor. Epic classes wait halfway up, Unique classes three quarters of the way, and Legendary classes at the top, ${HC?' Any floor of any Tower may also hide a secret room with a Legendary class\'s trial (3% a floor, 8% on boss floors), apart from the floor\'s mission (shown to you in the trial while the hidden class list is unlocked).':''} When a god claims one of a Tower's Runes, that Rune stops feeding it, so Towers can shrink, and new floors open when a Rune is lost.</div>
    ${TOWERS.map(t=>{const r=REALM[t.realm],rs=t.runes,cls=(HC||[]).filter(c=>hcInTower(c)&&hcTower(c)===t.id).sort((a,b)=>hcFloor(a)-hcFloor(b)),nLocked=sealedIn(t);
      const mons=MONSTERS.filter(m=>m.realm===r.n),bands=[0,.25,.5,.75].map((f,i)=>{const lo=Math.max(1,Math.round(t.floors*f)+1),hi=Math.round(t.floors*(f+.25)),gs=mons.filter(m=>m.g>=1+i*2.5&&m.g<=3+i*2.5).sort((a,b)=>a.g-b.g);return [lo,hi,gs.slice(0,6)]});
      return `${t.i===0?`<div class="sec-h" style="margin-top:22px" id="tw-${pid(r.n)}-realm"><h3>${esc(r.n)} Realm</h3><p>${towersIn(r.n).length} Tower${towersIn(r.n).length>1?'s':''} · ${t.floors} floors each · floor 1 is level ${towerStart(r.n)}, each floor one level higher</p></div>`:''}<section class="sec" id="tw-${pid(t.id)}${t.i?'-'+(t.i+1):''}" style="margin-top:8px"><div class="panel" style="border-top:3px solid ${r.color}"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-size:1.25rem;font-family:var(--serif)">${esc(t.name)}</h4><span class="note" style="margin:0">${refChip(r,esc(r.n)+' Realm')} · ${t.floors} floors · fed by ${rs.length} unclaimed Runes</span></div>
        ${t.look?`<p style="font-style:italic;color:var(--text2);margin:6px 0">${esc(t.look)}</p>`:''}
        <div class="tablewrap" style="margin-top:6px"><table class="t"><thead><tr><th>Floors</th><th>Guardians</th></tr></thead><tbody>${bands.map(([lo,hi,gs])=>`<tr><td style="white-space:nowrap">${lo}–${hi}</td><td>${gs.length?gs.map(m=>refChip(m,esc(m.n),'G'+m.g)).join(' '):'<span class="note">the Tower\'s own constructs</span>'}</td></tr>`).join('')}</tbody></table></div>
        ${!HC&&nLocked?`<div class="blk" style="margin-top:8px"><h4>Hidden classes in this Tower</h4></div><a class="chip" href="${pageUrl('hidden')}" data-go="hidden">🔒 ${nLocked} sealed: unlock the list to see them</a>`:''}
        ${cls.length?`<div class="blk" style="margin-top:8px"><h4>Hidden classes in this Tower</h4></div><div class="mlist">${cls.map(c=>`<a class="chip" href="${pageUrl('hidden')}#hc-${pid(c.n)}" data-go="hidden" style="text-decoration:none">Floor ${hcFloor(c)} · <b>${esc(c.n)}</b> <small>${esc(c.tier)}${c.base?' · '+esc(c.base):''}${c.prog?' · '+esc(c.prog):''}</small></a>`).join('')}</div>`:''}
        <details class="fold" style="margin-top:8px"><summary>The ${rs.length} unclaimed Runes that feed it</summary><div class="chips">${rs.map(x=>refChip(x)).join('')}</div></details>
      </div></section>`}).join('')}
  </div>`;
  trialBind();
  const h=location.hash.match(/#tw-([\w-]+)/);if(h&&$('tw-'+h[1]))$('tw-'+h[1]).scrollIntoView();
}
