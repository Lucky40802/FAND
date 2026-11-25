// ── Session prep: one page that rolls everything a session needs for a party, from the site's own generators ──
function renderPrep(){
  const avg=Math.max(1,Math.round(PARTY.reduce((a,c)=>a+(+c.level||1),0)/(PARTY.length||1))||3);
  const st=store.get('prep',{level:avg,size:Math.max(1,PARTY.length||4),realm:'',seed:(Math.random()*2**31)|0});
  $('content').innerHTML=`<div class="page prep">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem;white-space:nowrap">Session prep</h3><p>Everything for one session in one place: hooks, people, three fights, a named foe, a Tower floor, the loot, and the deeds that would earn a level. Every part is rolled from this site's own data and links to its entry.</p></div>
    <div class="tool sh-noprint"><div class="form" style="grid-template-columns:repeat(3,1fr)">
      <label>Party level<input id="pp-lv" type="number" min="1" max="100" value="${st.level}"></label>
      <label>Party size<input id="pp-size" type="number" min="1" max="10" value="${st.size}"></label>
      <label>Realm<select id="pp-realm"><option value="">The party's own stage realm</option>${REALMS.map(r=>`<option${r.n===st.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
    </div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn primary" id="pp-roll">🎲 Roll a new session</button><button class="btn" id="pp-journal">📓 Save to Journal</button><button class="btn" onclick="print()">🖨 Print</button></div></div>
    <div id="pp-out" style="margin-top:14px;display:flex;flex-direction:column;gap:6px"></div></div>`;
  const save=()=>{const s=store.get('prep',st);Object.assign(s,{level:Math.min(MAX_LEVEL,Math.max(1,+$('pp-lv').value||1)),size:Math.min(10,Math.max(1,+$('pp-size').value||4)),realm:$('pp-realm').value});store.set('prep',s);return s};
  const out=()=>{$('pp-out').innerHTML=prepHTML(store.get('prep',st));$('pp-out').querySelectorAll('#tr-conquer,[data-tp]').forEach(b=>b.remove())};
  ['pp-lv','pp-size','pp-realm'].forEach(i=>$(i).addEventListener('change',()=>{save();out()}));
  $('pp-roll').onclick=()=>{const s=save();s.seed=(Math.random()*2**31)|0;store.set('prep',s);out()};
  $('pp-journal').onclick=()=>{const s=save(),J=store.get('journal',[]);J.push({t:'Session prep: level '+s.level+', '+(s.realm||REALMS.find(r=>r.tier===bandOf(s.level)).n),d:new Date().toISOString().slice(0,10),body:$('pp-out').innerText.replace(/\n{3,}/g,'\n\n').trim()});store.set('journal',J);toast('Saved to the Journal')};
  out();
}
function prepHTML(s){
  const R=rng32(s.seed||1),L=s.level,realm=s.realm||REALMS.find(r=>r.tier===bandOf(L)).n,RL=REALM[realm];
  const sec=(t,sub,body)=>`<section class="sec" style="margin-top:10px"><div class="sec-h"><h3>${t}</h3>${sub?`<p>${sub}</p>`:''}</div>${body}</section>`;
  // hooks and people
  const hooks=[];for(let i=0;i<30&&hooks.length<2;i++){const k=HOOK_KINDS[Math.floor(R()*HOOK_KINDS.length)][0];const h=makeHook(k,R,L,realm);if(h&&!hooks.some(x=>x[0]===k))hooks.push([k,h])}
  const npcs=[0,1].map(()=>makeNPC(R,realm));
  // three fights, Easy to Hard, from the realm's Bestiary (budgets realm-relative, as in the encounter builder)
  const est={level:L,size:s.size,realm},th=encBudget(est),fights=[0,1,2].map(d=>{const pool=MONSTERS.filter(m=>m.realm===realm&&monXP(m)>0&&monXP(m)<=th[d]);if(!pool.length)return null;const pick=encPick(pool,s.size,th[d],R),c=new Map();pick.forEach(m=>c.set(m,(c.get(m)||0)+1));return {d:DIFFS[d],list:[...c]}});
  // a named foe at the party's level, with a full profile
  const foeCR=String(Math.min(30,crFor(encLevel(est))+2)),foe=sbMake({kind:'named',level:L,realm,cr:foeCR,seed:(R()*2**31)|0}),fo={kind:'named',level:L,realm,cr:foeCR};
  // the realm's Tower: the floor that matches the party's level (each floor is one level), if the party has reached that Tower
  const tws=towersIn(realm),T=tws.length?tws[Math.floor(R()*tws.length)]:towerOf(realm),start=towerStart(realm),band=L-start;let tower='';
  if(T&&band>=0){const floor=Math.min(T.floors,band+1),o={realm,tower:T.id,floor,level:L,seed:(R()*2**31)|0};tower=trialHTML(makeTrial(o),o)}
  else if(T)tower=`<div class="note">The ${esc(realm)} Realm's Towers start at level ${start}; this party (level ${L}) can't climb them yet.</div>`;
  // loot: every fight's drops, priced
  const drops=new Map();fights.filter(Boolean).forEach(f=>f.list.forEach(([m,n])=>(m.drops||[]).forEach(d=>{const x=findMat(d[0]);if(x)drops.set(x,(drops.get(x)||0)+n)})));
  const lootVal=[...drops].reduce((a,[m,n])=>a+(m.price||0)*n,0);
  const deeds=DEEDS.slice().sort(()=>R()-.5).slice(0,3);
  const nextChange=L<MAX_LEVEL&&L%20===0;
  return `<div class="callout" style="border-color:var(--gold)"><b>Level ${L} party of ${s.size}</b> · ${esc(realm)} Realm (tier ${RL.tier}) · stage ${ROMAN[stageOf(L)-1]}${RL.tier>1?` · spell dice ×${RL.tier} here`:''}${encLevel(est)!==L?` · fights budget as level ${encLevel(est)}`:''}${tierStage(RL.tier)>stageOf(L)?` · <span style="color:var(--red)">this realm is deeper than the party's stage: its spells and materials are beyond them</span>`:''}</div>`
    +sec('Hooks','Pick one to open the session.',`<div style="display:flex;flex-direction:column;gap:10px">${hooks.map(([k,h])=>`<div class="callout" style="border-color:var(--gold)"><div style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">${HOOK_KINDS.find(x=>x[0]===k)[1]}</div><div style="line-height:1.6">${h.text}</div></div>`).join('')}</div>`)
    +sec('People to meet','',`<div style="display:flex;flex-direction:column;gap:10px">${npcs.map(npcHTML).join('')}</div>`)
    +sec('Fights','Easy, Medium, and Hard, from the realm\'s Bestiary.',`<div style="display:flex;flex-direction:column;gap:8px">${fights.map((f,i)=>f?`<div class="panel" style="padding:10px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="min-width:70px">${f.d}</b>${f.list.map(([m,n])=>`<span>${n}× ${refChip(m,esc(m.n),'CR '+esc(m.sb.cr))}</span>`).join('')}</div>`:`<div class="note">No ${DIFFS[i]} fight fits in ${esc(realm)} at this level.</div>`).join('')}</div>`)
    +sec('Named foe',`A recurring enemy at CR ${foeCR} (the realm's own scaling on top), ready to drop into any of the hooks.`,sbProfileHTML(foe,fo)+sbHTML(foe.m))
    +(tower?sec('Tower floor',T?`${esc(T.name)}, one of the ${esc(realm)} Realm's ${tws.length} Towers, at the floor that matches the party's level.`:'',tower):'')
    +sec('Loot',drops.size?`Harvestable drops from all three fights, worth about ${gp(lootVal)}.`:'',drops.size?`<div class="chips">${[...drops].map(([m,n])=>refChip(m,n+'× '+esc(m.n),esc(m.gr))).join('')}</div>`:'<div class="note">These fights drop nothing harvestable.</div>')
    +sec('Deeds that earn a level','Levelling is by accomplishment: any of these, done this session, is worth a level at your call.',`<ul style="line-height:1.8;margin:0">${deeds.map(d=>`<li>${esc(d)}</li>`).join('')}${nextChange?`<li><b>Level ${L+1} is a class change</b>: each class turns into its ${ROMAN[stageOf(L+1)-1]} (Ranger ${ROMAN[stageOf(L+1)-1]}, and so on), a fitting moment for a class change trial.</li>`:''}</ul>`);
}
function renderHooks(){
  const st=store.get('hooks',{level:Math.max(1,Math.round(PARTY.reduce((a,c)=>a+(+c.level||1),0)/(PARTY.length||1))||3),realm:'',kinds:[],seed:1});
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Adventure hooks</h3><p>Story starters built from this site's own gods, Runes, realms, monsters, and Blueprints, scaled to your party. Every name links to its entry.</p></div>
    <div class="tool"><div class="form" style="grid-template-columns:repeat(3,1fr)">
      <label>Party level<input id="hk-lv" type="number" min="1" max="100" value="${st.level}"></label>
      <label>Realm<select id="hk-realm"><option value="">Any realm the party can reach</option>${REALMS.map(r=>`<option${r.n===st.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
      <label>Kind<select id="hk-kind"><option value="">Any kind</option>${HOOK_KINDS.map(([k,l])=>`<option value="${k}"${st.kinds[0]===k?' selected':''}>${l}</option>`).join('')}</select></label>
    </div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" id="hk-roll">🎲 New hooks</button></div></div>
    <div id="hk-out" style="margin-top:14px;display:flex;flex-direction:column;gap:10px"></div>
    <section class="sec"><div class="sec-h"><h3>People to meet</h3><p>NPCs from the same world: contracts, professions, wants, and what's in their pockets.</p><button class="btn" id="npc-roll" style="margin-left:auto">🎲 New NPCs</button></div><div id="npc-out" style="display:flex;flex-direction:column;gap:10px"></div></section></div>`;
  const save=()=>{const s=store.get('hooks',st);Object.assign(s,{level:Math.min(MAX_LEVEL,Math.max(1,+$('hk-lv').value||1)),realm:$('hk-realm').value,kinds:$('hk-kind').value?[$('hk-kind').value]:[]});store.set('hooks',s);return s};
  const out=()=>{const s=store.get('hooks',st),R=rng32(s.seed||1),kinds=s.kinds.length?s.kinds:HOOK_KINDS.map(k=>k[0]);const res=[];
    for(let i=0;i<40&&res.length<6;i++){const k=s.kinds.length?kinds[0]:kinds[(i+(s.seed||0))%kinds.length];const h=makeHook(k,R,s.level,s.realm);if(h)res.push([k,h])}
    $('hk-out').innerHTML=res.length?res.map(([k,h])=>`<div class="callout" style="border-color:var(--gold)"><div style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">${HOOK_KINDS.find(x=>x[0]===k)[1]}</div><div style="line-height:1.6">${h.text}</div></div>`).join(''):'<div class="empty">No hooks fit. Try another realm or a higher level.</div>'};
  ['hk-lv','hk-realm','hk-kind'].forEach(i=>$(i).addEventListener('change',()=>{save();out()}));
  const npcs=seed=>{const R=rng32(seed),s=store.get('hooks',st);$('npc-out').innerHTML=[0,1,2].map(()=>npcHTML(makeNPC(R,s.realm))).join('')};npcs((Math.random()*2**31)|0);$('npc-roll').onclick=()=>npcs((Math.random()*2**31)|0);
  $('hk-roll').onclick=()=>{const s=save();s.seed=(Math.random()*2**31)|0;store.set('hooks',s);out()};
  out();
}
// Rune family tree: every Rune under the Rune it came from (the vault's lineage), roots are progenitors and
// original Laws; Laws born from mortal emotion gather under the Mortal Realm.
function runeTreeHTML(){
  const kids=new Map(),par=new Map(),add=(p,c)=>{if(!kids.has(p))kids.set(p,[]);kids.get(p).push(c);par.set(c,p)};
  RUNES.forEach(r=>{const ch=(r.lin&&r.lin.chain)||[];if(['Infinatas','Creation','Destruction','Balance'].includes(r.n)){add('✦ Infinatas and Inane',r.n);return}let p=ch[1]&&ch[0].rel!=='opposite'&&ch[1].n;if(!p&&r.vprog&&r.vprog!==r.n)p=r.vprog;if(!p&&r.lin&&r.lin.origin)p='⟡ Mortal Realm';if(p&&lc(p)!==lc(r.n))add(p,r.n)});
  const roots=[...kids.keys()].filter(k=>!par.has(k));
  const size=(n,seen=new Set())=>{if(seen.has(n))return 0;seen.add(n);return (kids.get(n)||[]).reduce((a,c)=>a+1+size(c,seen),0)};
  roots.sort((a,b)=>size(b)-size(a)||a.localeCompare(b));
  const node=(n,d,seen)=>{if(seen.has(n)||d>7)return '';seen.add(n);const r=RUNE_IDX.get(lc(n)),ks=(kids.get(n)||[]).slice().sort((a,b)=>size(b)-size(a)||a.localeCompare(b)),tot=size(n);
    const lab=r?`<a href="#" data-ref="${ref(r)}" style="font-weight:600">${esc(n)}</a>${r.gods.length?` <small style="color:var(--gold2)">${r.gods.map(godKey).map(esc).join(', ')}</small>`:''}`:`<b>${esc(n)}</b>${PROG_STATUS[n]?` <small style="color:var(--muted)">${esc(PROG_STATUS[n])}</small>`:''}`;
    if(!ks.length)return `<li>${lab}</li>`;
    return `<li><details${d<1&&tot<40?' open':''}><summary>${lab} <span class="b ghost">${tot}</span></summary><ul class="rtree">${ks.map(k=>node(k,d+1,seen)).join('')}</ul></details></li>`};
  const seen=new Set(),loose=RUNES.filter(r=>!par.has(r.n)&&!kids.has(r.n));
  return `<p>Every Rune below hangs from the Rune it came from, as the vault's notes describe it: a corpse, a child, a splinter, or a Law formed from others. The roots are the progenitors and original Laws; Laws born from mortal emotion gather under the Mortal Realm. The number is how many Runes descend from each.</p>
  <ul class="rtree" style="margin-top:8px">${roots.map(r=>node(r,0,seen)).join('')}</ul>
  ${loose.length?`<details class="fold"><summary>${loose.length} Runes with no recorded parent or descendants</summary><div class="chips">${loose.map(r=>refChip(r)).join('')}</div></details>`:''}
  <p class="note"><a href="${pageUrl('runes')}" data-go="runes">All Runes →</a></p>`;
}
function godWarsHTML(){
  const fronts=CONTESTED.map(rn=>{const gs=RUNE_GODS.get(rn)||[];const pans=[...new Set(gs.map(g=>g.grp))];return {rn,gs,pans}}).sort((a,b)=>b.gs.length-a.gs.length||b.pans.length-a.pans.length||a.rn.localeCompare(b.rn));
  const cross=fronts.filter(f=>f.pans.length>1).length;
  const most=(()=>{const c=new Map();fronts.forEach(f=>f.gs.forEach(g=>c.set(g,(c.get(g)||0)+1)));return [...c].sort((a,b)=>b[1]-a[1]).slice(0,5)})();
  return `<p>Infinatas let the gods into Vestige on one condition: no open war. The gods obey the letter of it. Where two gods hold the same Rune, neither can take it from the other by force, so they fight through what they are allowed to use: contracts, Fingers, relics, and mortals. Each shared Rune is a front.</p>
  <p>There are <b>${fronts.length}</b> fronts. ${cross===fronts.length?'Every one of them crosses pantheon lines: no two gods of the same pantheon share a Rune.':`<b>${cross}</b> of them cross pantheon lines; the other ${fronts.length-cross} are feuds inside a single pantheon.`} The gods with the most fronts are ${most.map(([g,n])=>`${refChip(g,esc(godKey(g)),n+' fronts')}`).join(' ')}.</p>
  <div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>Front (Rune)</th><th>Claimants</th><th>Kind</th></tr></thead><tbody>${fronts.map(f=>{const ru=RUNE_IDX.get(lc(f.rn));return `<tr><td style="white-space:nowrap">${ru?`<a href="#" data-ref="${ref(ru)}">${esc(f.rn)}</a>`:esc(f.rn)}</td><td>${f.gs.map(g=>`<a href="#" data-ref="${ref(g)}">${esc(godKey(g))}</a> <small style="color:var(--muted)">${esc(g.grp.replace(' Pantheon',''))}</small>`).join(', ')}</td><td>${f.pans.length>1?'Between pantheons':'Inside the '+esc(f.pans[0].replace(' Pantheon',''))+' pantheon'}</td></tr>`}).join('')}</tbody></table></div>
  <p class="note">The vault lists the god wars as still to be written. This section only arranges what the vault already says (who holds which Rune); the battles themselves are yours to tell. <a href="${pageUrl('hooks')}" data-go="hooks">Roll a Rune-feud adventure hook →</a></p>`;
}
// Scavenging a corpse (campaign rules). DC = 10 + the monster's grade + 5 for each realm tier above Human. Meeting the DC
// takes 1 part, and every 2 points above it takes 1 more. Each new try on a corpse that has already been scavenged raises
// the DC by a step that depends on the corpse's size (campaign owner's rule): a big body has untouched places left to
// work, so its DC climbs more slowly (Tiny and Small +5, Medium +4, Large +3, Huge +2, Gargantuan +1). A corpse holds a set number of each part (by body plan and size), and what is taken is gone. A natural 1
// spoils the soft parts (blood, organs, essences). Without the Scavenging profession, or below the stage the realm
// needs, the roll is at disadvantage. The same panel serves the combat tracker and the Tools page.
const SCAV_STEP=5;
const SCAV_SIZE_STEP={Tiny:5,Small:5,Medium:4,Large:3,Huge:2,Gargantuan:1};
const scavSize=m=>m&&m.sb&&m.sb.sz||'Medium';
const scavStep=m=>SCAV_SIZE_STEP[scavSize(m)]||4;
// gathering (ores, gems, stone, plants, essences): the same DC as a corpse of that grade and realm; search time grows with the grade
const gatherDC=m=>10+(m.g||1)+realmDC((REALM[m.realm]||{}).tier);
const gatherHours=m=>{const h=(m.g||1)*((REALM[m.realm]||{}).tier||1);return h<24?h+' hour'+(h>1?'s':''):Math.round(h/8)+' days'};
const scavMon=S=>S&&MON_IDX.get(lc(S.mon));
// The killing blow's damage type decides what is left of a corpse: each type keeps only a share of some kinds of part
// (rounded at random, so a half share of 1 heart is a coin flip). Cold freezes the corpse: nothing is lost and the
// soft parts no longer spoil on a natural 1.
const PART_KIND=n=>{const w=n.split(' ').slice(-2).join(' '),x=findMat(n),c=x?matCode(x):'';
  if(/Brain/.test(w))return 'brain';if(/Eye/.test(w))return 'eye';if(/Venom|Silk Gland|Ink Sac|Breath Gland|Brimstone Gland|Spore Sac/.test(w))return 'gland';
  if(/Meat/.test(w))return 'meat';if(/\bFat|\bOil/.test(w))return 'fat';if(/Blood|Ichor|\bSap\b/.test(w))return 'blood';
  if(/Hide|Pelt|Skin|Scale$|Feather|Down$|Hair|Membrane|Wing$|\bFin\b|Shroud|Bark|Leaf|Petal/.test(w))return 'cover';
  if(/Bone|Skull|Shell|Carapace|Horn|Beak|Tooth|Fang|Tusk|Chitin|Plat|Shard|Gizzard|Heartscale|Claw|Talon|Hoof|Mandible|Stinger|Gear|Joint/.test(w))return 'hard';
  return c==='E'?'essence':c==='L'?'organ':'other'};
const KILL_FX={
  Bludgeoning:['crushes bone, shell, and eyes',{hard:.5,eye:.5,organ:.75}],
  Slashing:['cuts up the hide and spills the blood',{cover:.5,blood:.5}],
  Piercing:['the cleanest weapon kill: only some blood is lost',{blood:.75}],
  Fire:['burns the hide, melts the fat, and boils the blood (the meat comes out cooked)',{cover:.25,fat:0,blood:.5}],
  Cold:['freezes the corpse: nothing is lost, and soft parts do not spoil on a natural 1',{}],
  Acid:['eats the hide and the eyes and taints the blood',{cover:.5,eye:0,blood:.5}],
  Lightning:['cooks the organs from inside and bursts the eyes',{organ:.5,brain:0,eye:.5}],
  Thunder:['shatters bone and shell and bursts the eyes',{hard:.5,eye:0,organ:.75}],
  Poison:['taints every organ, the blood, and the meat (venom glands survive)',{organ:0,blood:0,meat:0,brain:0,eye:.5}],
  Necrotic:['rots the soft tissue',{organ:.5,blood:.5,meat:0,cover:.5,fat:.5}],
  Radiant:['burns away essences and scorches the hide',{essence:.5,cover:.75}],
  Force:['tears through everything a little',{hard:.75,cover:.75,organ:.75}],
  Psychic:['leaves the body untouched but destroys the brain',{brain:0}]};
const killShare=(n,kt)=>{const fx=KILL_FX[kt];if(!fx)return 1;const k=PART_KIND(n);return k in fx[1]?fx[1][k]:1};
// Tools for taking parts (data/gear-bp.js tags the blueprints with the part kinds each one can take and its bonus).
// Bare hands take only loose parts: feathers, hair, fur, down, loose scales, leaves, petals. Everything else needs a tool.
const BARE_RE=/(Feathers?|Down|Hair|Fur|Leaf|Leaves|Petals?|Quills?|Tuft|Scales?)$/;
const partBare=n=>PART_KIND(n)==='cover'&&BARE_RE.test(n);
const KIND_TOOL={cover:'a skinning knife or field kit',hard:'a bone saw or field kit',meat:'a knife or field kit',fat:'a knife or field kit',organ:'jars, a gutting hook, or a field kit',eye:'jars, a gutting hook, or a field kit',brain:'jars, a gutting hook, or a field kit',other:'a knife or field kit',blood:'a Blood Kit',gland:'a venom extractor or sample jars',essence:'a spirit jar'};
const KIND_LABEL={cover:'hide and skin',hard:'bone, horn, and shell',meat:'meat',fat:'fat',organ:'organs',eye:'eyes',brain:'brains',other:'other parts',blood:'blood',gland:'venom and glands',essence:'essences'};
const BASE_KIT="Scavenger's Field Kit",TOOL_PICKS=[BASE_KIT,'Blood Kit','Sample Jars','Spirit Jar','Master Harvesting Kit'];
function heldTools(who,S,def){if(who&&who.id)return [...(who.gear||[]),...(who.inv||[]).map(r=>r[0])].map(findBP).filter(b=>b&&(b.kit||b.kg||b.mine));return (S&&S.tools!=null?S.tools:def).map(findBP).filter(Boolean)}
const toolKind=(tools,k)=>tools.filter(t=>(t.kit||[]).includes(k)).sort((a,b)=>(b.kb||0)-(a.kb||0))[0];
const canTake=(n,tools)=>partBare(n)||!!toolKind(tools,PART_KIND(n));
const toolBonus=(tools,realm)=>Math.max(0,...tools.filter(t=>t.kit).map(t=>t.kb||0))+Math.max(0,...tools.filter(t=>t.kg&&(t.kr||[]).includes(realm)).map(t=>t.kg));
function scavTool(k,n){const C=SCAV[k],S=C.get();if(!S)return;const L=S.tools!=null?S.tools.slice():[BASE_KIT];const i=L.indexOf(n);i<0?L.push(n):L.splice(i,1);S.tools=L;C.set(S);C.render()}
const scavNew=(m,kt)=>{const left={},lost={};(m.drops||[]).forEach(d=>{const q=d[2]||1,f=q*killShare(d[0],kt),keep=Math.min(q,Math.floor(f)+(Math.random()<f%1?1:0));left[d[0]]=keep;if(keep<q)lost[d[0]]=q-keep});
  return {mon:m.n,kt:kt||'',left,lost,tries:0,who:'',picks:0,basket:{},res:''}};
const scavBase=m=>10+(m.g||1)+realmDC((REALM[m.realm]||{}).tier);
const scavDC=(m,S)=>scavBase(m)+scavStep(m)*(S.tries||0);
// The rollers default to someone with the base profession (level 1, stage I): trained, +0. Pick "no training" for disadvantage.
const BASE_SCAV={name:'A base Scavenger',prof:'Scavenging',profLv:1},BASE_MINE={name:'A base miner',prof:'Harvesting',profLv:1};
const workerOf=(id,base)=>id==='none'?null:(PARTY.find(c=>c.id===id)||base);
const scavTrained=(who,m)=>!!who&&hasProfession(who,'Scavenging')&&stageOf(profLvIn(who,'Scavenging'))>=tierStage((REALM[m.realm]||{}).tier||1);
const scavBonus=who=>who?Math.floor(profLvIn(who,'Scavenging')/2)+peopleProf(who,'Scavenging'):0;
const scavPicks=(tot,dc)=>tot<dc?0:1+Math.floor((tot-dc)/2);
const scavSoft=n=>{const x=findMat(n);return !!x&&['L','E'].includes(matCode(x))};
// The Scavenge panel opens as a pop-up window (from the combat tracker and from any monster's window); it keeps its
// scroll position when it redraws after a roll. Escape or a click outside closes it.
function scavPopHTML(k,title){const h=scavHTML(k,title);return h?`<div class="scav-pop" onclick="if(event.target===this)SCAV.${k}.close()" role="dialog" aria-modal="true" aria-label="Scavenge"><div class="scav-win">${h}</div></div>`:''}
const keepScroll=f=>{const w=document.querySelector('.scav-win'),y=w?w.scrollTop:0;f();const w2=document.querySelector('.scav-win');if(w2)w2.scrollTop=y};
const aAn=n=>/^[aeiou]/i.test(String(n))?'an':'a';
function scavPop(name){const m=MON_IDX.get(lc(name));if(!m)return;store.set('scavpop',scavNew(m));if(typeof hideModal==='function'){hideModal();history.replaceState(null,'',hashFor(TAB))}renderScavPop()}
function renderScavPop(){let host=document.getElementById('scavpopHost');if(!host){host=document.createElement('div');host.id='scavpopHost';document.body.appendChild(host)}const S=store.get('scavpop',null);keepScroll(()=>{host.innerHTML=S&&scavMon(S)?scavPopHTML('pop','Scavenge '+aAn(S.mon)+' '+esc(S.mon)+' corpse'):''})}
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!document.querySelector('.scav-pop'))return;if(store.get('scavpop',null))SCAV.pop.close();else if(typeof CB!=='undefined'&&CB&&CB.harvest)SCAV.cb.close()});
const SCAV={cb:{get:()=>CB.corpses&&CB.corpses[CB.harvest],set:S=>{CB.corpses=CB.corpses||{};CB.corpses[CB.harvest]=S;saveCB()},render:()=>keepScroll(renderCombat),close:()=>{CB.harvest=null;saveCB();renderCombat()}},
  pop:{get:()=>store.get('scavpop',null),set:S=>store.set('scavpop',S),render:()=>renderScavPop(),close:()=>{store.set('scavpop',null);renderScavPop()}},
  tool:{get:()=>store.get('scav',null),set:S=>store.set('scav',S),render:()=>renderScavTool(),close:()=>{store.set('scav',null);renderScavTool()}}};
// A saved corpse from an older version (or another device) may lack fields: rebuild what is missing instead of failing.
function scavFix(C,S,m){if(!S||!m)return S;let fixed=false;
  if(!S.left||typeof S.left!=='object'){const N=scavNew(m,S.kt);S.left=N.left;S.lost=N.lost;fixed=true}
  if(!S.basket||typeof S.basket!=='object'){S.basket={};fixed=true}if(!S.lost||typeof S.lost!=='object'){S.lost={};fixed=true}
  if(typeof S.picks!=='number'){S.picks=0;fixed=true}if(typeof S.tries!=='number'){S.tries=0;fixed=true}
  if(fixed)try{C.set(S)}catch(e){}return S}
function scavHTML(k,title){try{return scavHTML0(k,title)}catch(e){console.error(e);const C=SCAV[k];try{C.set(null)}catch(e2){}
  return `<div class="panel"><b>This corpse could not be opened</b><div class="note">Its saved state was damaged, so it has been cleared. Open the corpse again to start fresh.</div><button class="btn" onclick="SCAV.${k}.close()">Close</button></div>`}}
function scavHTML0(k,title){const C=SCAV[k],S=scavFix(C,C.get(),scavMon(C.get())),m=scavMon(S);if(!m)return '';
  const who=workerOf(S.who,BASE_SCAV),ok=scavTrained(who,m),dc=scavDC(m,S),tools=heldTools(who,S,[BASE_KIT]),tb=toolBonus(tools,m.realm),parts=Object.entries(S.left),remain=parts.filter(([n])=>canTake(n,tools)).reduce((a,[,q])=>a+q,0),inB=Object.values(S.basket||{}).reduce((a,b)=>a+b,0),tier=(REALM[m.realm]||{}).tier||1;
  return `<div class="panel" style="border-color:var(--gold)"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-size:1.15rem">🔪 ${title}</h4><span class="note" style="margin:0">Scavenging DC <b>${dc}</b> (10 + grade ${m.g}${realmDC(tier)?' + '+realmDC(tier)+' for the '+esc(m.realm):''}${S.tries?` + ${scavStep(m)*S.tries} for ${S.tries} earlier ${S.tries>1?'tries':'try'}, +${scavStep(m)} each for a ${scavSize(m).toLowerCase()} corpse`:''}) · ${remain} part${remain===1?'':'s'} left</span><button class="btn" style="margin-left:auto" onclick="SCAV.${k}.close()">Close</button></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0"><label class="note" style="margin:0">Scavenger <select class="sel" onchange="scavSet('${k}','who',this.value)"><option value="">A base Scavenger (Scavenging 1, +0)</option><option value="none"${S.who==='none'?' selected':''}>Someone with no training (+0, disadvantage)</option>${PARTY.map(c=>`<option value="${c.id}"${c.id===S.who?' selected':''}>${esc(c.name||'Unnamed')}${hasProfession(c,'Scavenging')?` (Scavenging ${profLvIn(c,'Scavenging')}, +${scavBonus(c)})`:' (+0, no Scavenging)'}</option>`).join('')}</select></label>
    <button class="btn primary" onclick="scavRoll('${k}')"${S.picks||!remain?' disabled':''}>🎲 Roll Scavenging</button>${!ok?`<span class="b gold">At disadvantage: no Scavenging profession, or below stage ${tierStage(tier)} (level ${stageStart(tierStage(tier))}+) for ${esc(m.realm)} corpses</span>`:''}</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 8px"><span class="note" style="margin:0">Tools${tb?` (+${tb})`:''}:</span>${who&&who.id?(tools.length?tools.map(t=>refChip(t,esc(t.n),t.kb?'+'+t.kb:'')).join(''):'<span class="b gold">Bare hands only: nothing in their gear or pack</span>')+'<span class="note" style="margin:0">from their gear and pack</span>':TOOL_PICKS.map(n=>`<button class="chip${tools.some(t=>t.n===n)?' on':''}" type="button" onclick="scavTool('${k}',${esc(JSON.stringify(n))})">${tools.some(t=>t.n===n)?'✓ ':''}${esc(n)}</button>`).join('')}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 8px"><label class="note" style="margin:0">Killed by <select class="sel" onchange="scavKill('${k}',this.value)"${S.tries?' disabled title="Set before the first roll"':''}><option value="">Unknown or none (whole corpse)</option>${Object.keys(KILL_FX).map(t=>`<option${t===S.kt?' selected':''}>${t}</option>`).join('')}</select></label>${S.kt&&KILL_FX[S.kt]?`<span class="note" style="margin:0">${esc(S.kt)} ${esc(KILL_FX[S.kt][0])}.</span>`:''}</div>
    ${S.res?`<div style="margin:6px 0">${S.res}</div>`:''}
    ${S.picks?`<div class="callout" style="border-color:var(--green)"><b>Choose ${S.picks} part${S.picks>1?'s':''}</b> (${inB} of ${S.picks} chosen)<div class="chips" style="margin-top:6px">${parts.filter(([n,q])=>q-(S.basket[n]||0)>0&&canTake(n,tools)).map(([n,q])=>`<button class="chip" onclick="scavPick('${k}',${esc(JSON.stringify(n))},1)"${inB>=S.picks?' disabled':''}>+ ${esc(n)} <small>${q-(S.basket[n]||0)} left</small></button>`).join('')}</div>
      ${inB?`<div class="chips" style="margin-top:6px">${Object.entries(S.basket).filter(([,q])=>q).map(([n,q])=>`<button class="chip" style="border-color:var(--green)" onclick="scavPick('${k}',${esc(JSON.stringify(n))},-1)" title="Put back">${q}× ${esc(n)} ✕</button>`).join('')}</div>`:''}
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${PARTY.length?`<select class="sel" id="scav-to-${k}">${PARTY.map(c=>`<option value="${c.id}"${c.id===S.who?' selected':''}>${esc(c.name||'Unnamed')}</option>`).join('')}</select>`:''}<button class="btn primary" onclick="scavTake('${k}')"${inB?'':' disabled'}>${PARTY.length?'Add to their materials':'Take them'}</button><button class="btn" onclick="scavSet('${k}','picks',0)">Leave the rest</button></div></div>`:''}
    <div class="tablewrap" style="margin-top:8px"><table class="t"><thead><tr><th>Part</th><th>Kind</th><th>Needs</th><th class="num">Left</th><th class="num">Lost${S.kt?' to '+esc(S.kt):''}</th><th class="num">Per corpse</th></tr></thead><tbody>${(m.drops||[]).map(d=>{const x=findMat(d[0]),lo=(S.lost||{})[d[0]]||0;return `<tr${S.left[d[0]]?'':' style="opacity:.45"'}><td>${x?`<a href="#" data-ref="${ref(x)}">${esc(d[0])}</a>`:esc(d[0])} <small style="color:var(--muted)">${esc(d[1])}</small></td><td>${scavSoft(d[0])?'soft':'hard'}</td><td>${partBare(d[0])?'<small>bare hands</small>':(t=>t?`<small style="color:var(--green)">✓ ${esc(t.n)}</small>`:`<small style="color:var(--red)">✗ ${esc(KIND_TOOL[PART_KIND(d[0])]||'a tool')}</small>`)(toolKind(tools,PART_KIND(d[0])))}</td><td class="num">${S.left[d[0]]||0}</td><td class="num"${lo?' style="color:var(--red)"':''}>${lo?'−'+lo:''}</td><td class="num">${d[2]||1}</td></tr>`}).join('')}</tbody></table></div>
    <div class="note">Meet the DC to take 1 part; every 2 points above the DC takes 1 more. Bare hands take only loose parts (feathers, hair, fur, scales, leaves); hide, bone, meat, and organs need a knife, saw, or field kit, blood needs a Blood Kit, venom a venom extractor, and essences a spirit jar. The best tool's bonus adds to the roll. Each new try on this corpse adds ${scavStep(m)} to the DC (${scavSize(m)} body: Tiny and Small +5, Medium +4, Large +3, Huge +2, Gargantuan +1). A natural 1 spoils the soft parts (blood, organs, essences). The killing blow's damage type decides what is left (bludgeoning crushes bone, slashing cuts the hide, fire burns it, poison taints the organs, cold keeps everything). Parts must be taken within a day of death.</div>${raiseHTML(k)}</div>`}
function scavKill(k,kt){const C=SCAV[k],S=C.get(),m=scavMon(S);if(!m||S.tries)return;const N=scavNew(m,kt);N.who=S.who;C.set(N);C.render()}
function scavSet(k,f,v){const C=SCAV[k],S=C.get();if(!S)return;S[f]=v;if(f==='picks'&&!v)S.basket={};C.set(S);C.render()}
function scavRoll(k){const C=SCAV[k],S=C.get(),m=scavMon(S);if(!m||S.picks)return;const who=workerOf(S.who,BASE_SCAV),ok=scavTrained(who,m),tools=heldTools(who,S,[BASE_KIT]),b=scavBonus(who)+toolBonus(tools,m.realm),dc=scavDC(m,S);
  const r1=1+Math.floor(Math.random()*20),r2=1+Math.floor(Math.random()*20),d=ok?r1:Math.min(r1,r2),tot=d+b,remain=Object.entries(S.left).filter(([n])=>canTake(n,tools)).reduce((a,[,q])=>a+q,0);if(!remain){toast('Nothing here can be taken with these tools');return}S.tries=(S.tries||0)+1;S.basket={};
  let msg;if(d===1&&S.kt!=='Cold'){Object.keys(S.left).forEach(n=>{if(scavSoft(n))S.left[n]=0});S.picks=0;msg='<span style="color:var(--red)">Natural 1: the soft parts (blood, organs, essences) spoil.</span>'}
  else if(d===1){S.picks=0;msg='<span style="color:var(--gold2)">Natural 1: nothing this time, but the frozen soft parts keep.</span>'}
  else{S.picks=Math.min(remain,scavPicks(tot,dc));msg=S.picks?`<span style="color:var(--green)">Success: ${S.picks} part${S.picks>1?'s':''}${tot>dc+1?` (${tot-dc} over the DC)`:''}.</span>`:'<span style="color:var(--gold2)">Failure: nothing comes away cleanly.</span>'}
  S.res=`<b>${d}${!ok?` <small>(${r1}, ${r2}, disadvantage)</small>`:''} + ${b} = ${tot}</b> vs DC ${dc}: ${msg} The next try is DC ${dc+scavStep(m)}.`;C.set(S);C.render()}
function scavPick(k,n,dq){const C=SCAV[k],S=C.get();if(!S||!S.picks)return;S.basket=S.basket||{};const inB=Object.values(S.basket).reduce((a,b)=>a+b,0),cur=S.basket[n]||0;
  if(dq>0&&(inB>=S.picks||cur>=(S.left[n]||0)))return;S.basket[n]=Math.max(0,cur+dq);C.set(S);C.render()}
function scavTake(k){const C=SCAV[k],S=C.get();if(!S)return;const got=Object.entries(S.basket||{}).filter(([,q])=>q>0);if(!got.length)return;const to=$('scav-to-'+k),c=to&&PARTY.find(z=>z.id===to.value);
  if(c){got.forEach(g=>{g[1]=invAdd(c,g[0],g[1])});saveParty();if(!got.some(([,q])=>q)){toast((c.name||'Their')+' pack is full');return}}
  got.forEach(([n,q])=>{S.left[n]=Math.max(0,(S.left[n]||0)-q)});S.picks=0;S.basket={};S.res+=`<div class="note" style="margin:4px 0 0">Taken: ${got.map(([n,q])=>q+'× '+esc(n)).join(', ')}${c?' → '+esc(c.name||'character'):''}.</div>`;C.set(S);toast(got.reduce((a,[,q])=>a+q,0)+' parts taken');C.render()}
// Necromancy (campaign owner's rules). Raising a corpse needs only the corpse. Chance = 2/10^(d+1), where d is the
// corpse's level (its CR, at least 1) minus the necromancer's level, +1 for each stage its realm lies beyond theirs:
// same level 20%, one above 2%, two above 0.2%; a corpse below their level always rises. One try per corpse. A raised
// servant keeps a share of the original's stats by type. Each point of INT is one summon slot. Servants at
// 95% or more, spirits, and the Vampire, Lich, Grim Reaper and Dullahan stay bound only through a ritual with a chain
// device. A Death Knight comes only from a living person who contracts with the necromancer before dying.
// Corpse requirements are the site's proposals, approved in outline by the campaign owner.
const nLeft=(S,re)=>Object.entries(S.left).filter(([n])=>re.test(n.split(' ').slice(-2).join(' '))).reduce((a,[,q])=>a+q,0);
const nAll=(m,re)=>(m.drops||[]).filter(d=>re.test(d[0].split(' ').slice(-2).join(' '))).reduce((a,d)=>a+(d[2]||1),0);
const halfBones=(m,S)=>{const t=nAll(m,/\bBone$/);return !t||nLeft(S,/\bBone$/)*2>=t};
const fresh=(R,S,d)=>(+R.days||0)<=(S.kt==='Cold'?d*2:d);
const mindOk=S=>S.kt!=='Psychic';
// flesh is any soft tissue left on the corpse: many creatures (humanoids, giants, fiends) drop fat, liver, or sinew rather than "Meat"
const FLESH=/(Meat|Flesh|Fat|Liver|Sinew|Tentacle|Muscle|Gizzard)$/;
const UNDEAD=[
  {n:'Crawling Hand',p:70,need:'One hand or limb with its bones',up:'None',ok:(m,S)=>nLeft(S,/Bone$|Claw$|Talon$|Hand$/)>0},
  {n:'Skeleton',p:80,need:'The skull and at least half its bones',up:'None',ok:(m,S)=>nLeft(S,/Skull$/)>0&&halfBones(m,S)},
  {n:'Zombie',p:85,need:'A whole body with flesh and hide, dead under a week, not burned',up:'Embalming salts weekly, or it rots apart',ok:(m,S,R)=>S.kt!=='Fire'&&fresh(R,S,7)&&nLeft(S,FLESH)>0&&nLeft(S,/Hide$|Pelt$|Skin$|Scale$/)>0},
  {n:'Shape-shifter',p:85,need:'A shapeshifter\'s corpse with its skin or hide',up:'A fresh skin to take a new form',ok:(m,S)=>/shape|lycan|were|doppel|changel|mimic|skinwalker/i.test(m.n+' '+(m.txt||''))&&nLeft(S,/Hide$|Pelt$|Skin$/)>0},
  {n:'Ghoul',p:90,need:'Fresh (3 days or less) with flesh and heart; not poisoned or burned',up:'Flesh: 1 Meat a day',ok:(m,S,R)=>!/Poison|Fire/.test(S.kt||'')&&fresh(R,S,3)&&nLeft(S,FLESH)>0&&nLeft(S,/Heart$/)>0},
  {n:'Shadow',p:85,spirit:1,need:'Killed by necrotic damage or in total darkness',up:'Rests 8 hours a day in darkness',ok:(m,S,R)=>S.kt==='Necrotic'||R.dark},
  {n:'Ghost / Specter',p:90,spirit:1,need:'Its soul is still here (dead under a day); its mind intact',up:'An anchor object it is bound to',ok:(m,S,R)=>fresh(R,S,1)&&mindOk(S)},
  {n:'Ghast',p:92,need:'As a Ghoul, from a creature that ate flesh (or a Ghoul fed for a month)',up:'Flesh: 2 Meat a day',ok:(m,S,R)=>!/Poison|Fire/.test(S.kt||'')&&fresh(R,S,3)&&nLeft(S,FLESH)>0&&nLeft(S,/Heart$/)>0&&/ghoul|ghast|wolf|bear|lion|tiger|shark|croc|dragon|giant|troll|ogre|fiend|demon|devil|beast/i.test(m.n+' '+(m.body||''))},
  {n:'Banshee',p:92,spirit:1,need:'Died grieving, its tongue intact, under a day ago',up:'Must mourn (wail) once a day',ok:(m,S,R)=>fresh(R,S,1)&&mindOk(S)&&(nLeft(S,/Tongue$/)>0||!nAll(m,/Tongue$/))},
  {n:'Wraith',p:93,spirit:1,need:'Died hating its killer, under a day ago',up:'Drains life: 1 Heart or 10 HP from a creature a week',ok:(m,S,R)=>fresh(R,S,1)&&mindOk(S)},
  {n:'Mummy',p:94,need:'Embalmed (or kept by Gentle Repose), organs saved in jars',up:'Wrappings renewed monthly',ok:(m,S,R)=>R.emb&&nLeft(S,/Heart$/)>0},
  {n:'Hupia',p:94,spirit:1,need:'Died at night',up:'Fruit each night; it works only at night',ok:(m,S,R)=>R.night},
  {n:'Revenant',p:95,need:'Murdered, its killer still alive; mind intact',up:'None until its revenge is done (then it falls)',ok:(m,S,R)=>R.wronged&&mindOk(S)},
  {n:'Fext',p:95,need:'A warrior\'s corpse with at least half its bones',up:'None; harmed only by glass or silver',ok:(m,S)=>/humanoid|giant/.test(m.body||'')&&halfBones(m,S)},
  {n:'Jiangshi',p:95,need:'An intact, stiff body (cold kills are best), not burned',up:'Talisman on the brow renewed weekly',ok:(m,S)=>S.kt!=='Fire'&&halfBones(m,S)&&nLeft(S,FLESH)>0},
  {n:'Wendigo',p:96,need:'Starved or ate people, and died in the cold',up:'Flesh: 3 Meat a day, or it turns on you',ok:(m,S,R)=>R.starve},
  {n:'Nightwalker',p:97,need:'Killed by necrotic or force damage in the Void or deeper',up:'Drains life (as a Wraith)',ok:(m,S)=>/Necrotic|Force/.test(S.kt||'')&&((REALM[m.realm]||{}).tier||1)>=9},
  {n:'Vampire',p:97,need:'Drained or bitten, its blood parts intact, under a day ago; not burned',up:'Blood: 1 Blood a day',ok:(m,S,R)=>S.kt!=='Fire'&&fresh(R,S,1)&&nLeft(S,/Blood$/)>0},
  {n:'Dullahan',p:98,need:'A beheaded corpse whose skull is kept apart from the body',up:'Its head must be carried',ok:(m,S)=>nLeft(S,/Skull$/)>0&&halfBones(m,S)},
  {n:'Death Knight',p:98,need:'Only a living person who contracts with the necromancer while alive; never a found corpse',up:'None (bound by the contract)',ok:()=>false},
  {n:'Lich',p:99,need:'A spellcaster\'s corpse with its skull and mind intact',up:'A phylactery kept safe',ok:(m,S)=>mindOk(S)&&nLeft(S,/Skull$/)>0&&/spell|mage|lich|wizard|priest|sorcer|warlock|witch|hag|caster/i.test(m.n+' '+(m.txt||'')+' '+JSON.stringify(m.sb&&m.sb.tr||''))},
  {n:'Grim Reaper',p:100,spirit:1,need:'A corpse of the Abyss or deeper with a soul still in it (a Soul Shard part)',up:'Harvests one soul a week for its master',ok:(m,S)=>((REALM[m.realm]||{}).tier||1)>=6&&nLeft(S,/Soul Shard$/)>0}];
UNDEAD.forEach(u=>{u.chain=u.p>=95||!!u.spirit||/Vampire|Lich|Grim Reaper|Dullahan/.test(u.n)});
const corpseLv=m=>Math.max(1,Math.ceil(crNum(m.sb&&m.sb.cr||m.cr||'1')));
// School of Necromancy (Wizard), revamped 2026-11-04 (campaign owner's choice): the horde wizard. necroLv is the character's
// Wizard level when that is their subclass (0 otherwise); Death's Ledger (3) counts corpses one level lower and allows one
// retry for a spell slot, Bone Tithe (6) renders spare corpses into essence, Undead Thralls (6) keeps servants at a share of
// a same-level monster plus the proficiency bonus.
const NECRO_SUB='School of Necromancy (Wizard)';
const necroLv=c=>{if(!c)return 0;const L=+c.level||1,L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0;return c.cls==='Wizard'&&c.sub===NECRO_SUB?L-L2:c.cls2==='Wizard'&&c.sub2===NECRO_SUB?L2:0};
const raiseChance=(who,m)=>{const L=+who.level||1,gap=Math.max(0,tierStage((REALM[m.realm]||{}).tier||1)-stageOf(L)),led=necroLv(who)>=3?1:0,d=corpseLv(m)+gap-L-led;return {d,gap,led,p:Math.min(1,2/Math.pow(10,d+1))}};
// a typical monster at a level (average HP and AC of stat-blocked monsters whose corpse level is within 1); past the
// highest levels with monsters, HP grows with the level
const MON_REF={};function monRef(L){L=Math.max(1,+L||1);if(MON_REF[L])return MON_REF[L];const all=MONSTERS.filter(m=>m.sb&&+m.sb.hp);
  let lv=L,pick=[];for(let w=1;w<=4&&!pick.length;w++)pick=all.filter(m=>Math.abs(corpseLv(m)-L)<=w);
  if(!pick.length){const top=Math.max(...all.map(corpseLv));lv=top;pick=all.filter(m=>corpseLv(m)>=top-1)}
  const avg=k=>pick.reduce((a,m)=>a+(+m.sb[k]||0),0)/(pick.length||1);return MON_REF[L]={hp:Math.round(avg('hp')*(L>lv?L/lv:1)),ac:Math.round(avg('ac'))}}
// what a servant fights with now: its own share, raised by Undead Thralls for a School of Necromancy wizard of level 6+
function servantNow(c,u){const nl=necroLv(c);if(nl<6)return {hp:u.hp,ac:u.ac,dmg:0,th:false};const R=monRef(+c.level||1),f=x=>Math.floor(x*(u.p||80)/100),pb=profBonus(+c.level||1);
  return {hp:Math.max(+u.hp||0,f(R.hp)),ac:Math.max(+u.ac||0,f(R.ac))+pb,dmg:pb,th:true}}
// Bonded summons (website rule; the DM turns them on for a character): up to five summons bound to the character for
// good. They level with it (each is a share of a same-level monster: HP, AC, and damage per hit), come back at full
// strength after every long rest, and grow by absorbing monster parts from the character's inventory: one part per 10
// character levels each, of Potency up to the character's level. A part adds its property and its trait, and a tenth
// more hit points. The share (default 50%) is the DM's to set.
// Balance (2026-11-10): the reference is the typical monster of the character's realm band (bondRef). At 50% a summon has
// half its HP, its AC, and a hit the size of its best attack, so five summons deal about 65-115% of a same-level
// Fighter's damage after AC at every realm.
const BOND_MAX=5;
const bondShare=c=>Math.max(20,Math.min(100,Math.round(+c.bondShare||50)));
const bondSlots=c=>Math.max(1,Math.min(10,Math.ceil((+c.level||1)/10)));
// the typical monster of a level's realm band (median HP, AC, and best single hit of the stat-blocked monsters of that
// realm tier), eased halfway toward the next tier across the band's ten levels
const BOND_REF={};function bondRef(L){const t=bandOf(L);if(!BOND_REF[t]){const med=a=>{a=a.filter(x=>x>0).sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:0};
  for(let k=1;k<=10;k++){const M=MONSTERS.filter(m=>m.sb&&(REALM[m.realm]||{}).tier===k);BOND_REF[k]={hp:med(M.map(m=>+m.sb.hp)),ac:med(M.map(m=>+m.sb.ac)),h:med(M.map(m=>monHits(m.sb).h))}}}
  const A=BOND_REF[t],B=BOND_REF[Math.min(10,t+1)]||A,f=t<10?(((+L||1)-1)%10)/20:0,mix=k=>Math.round(A[k]+((B[k]||A[k])-A[k])*f);return {hp:mix('hp'),ac:mix('ac'),h:mix('h')}}
function bondNow(c,s){const L=+c.level||1,R=bondRef(L),sh=bondShare(c)/100,parts=(s.parts||[]).map(findMat).filter(Boolean);
  const hp=Math.max(1,Math.round(R.hp*sh*(1+0.1*parts.length)));
  return {L,hp,cur:s.hp==null||s.hp===''?hp:Math.max(0,Math.min(hp,+s.hp||0)),ac:Math.max(0,R.ac),acc:profBonus(L)+2,dmg:Math.max(1,Math.round(R.h*sh*2)),parts}}
const bondParts=c=>(c.inv||[]).map(([n,q])=>({m:findMat(n),q:+q||0})).filter(x=>x.m&&x.q>0&&x.m.org==='Creature'&&(+x.m.pot||0)<=(+c.level||1));
function bondHTML(c){const dm=dmUnlocked(),L=+c.level||1;
  if(!c.bondOn)return `<div class="note" style="margin:0">Bonded summons are off for this character. <label class="sh-noprint" style="display:inline-flex;gap:4px;align-items:center"><input type="checkbox" onchange="sheetBondOn(this.checked)"> Turn them on (DM)</label></div>`;
  const B=c.bonds=c.bonds||[],avail=bondParts(c),slots=bondSlots(c),sb='padding:1px 8px;font-size:.78rem';
  return `<div class="note" style="margin:0 0 6px">Up to ${BOND_MAX} summons bound to you. Each has ${bondShare(c)}% of the hit points of a typical monster of your realm band (and its AC), levels with you, and returns at full strength after a long rest. Feed them monster parts: ${slots} part${slots>1?'s':''} each at level ${L} (one per 10 levels), Potency up to ${L}.</div>${dm?`<div class="sh-row sh-noprint" style="gap:8px;flex-wrap:wrap"><label class="note" style="margin:0">Share (DM) <input type="number" min="20" max="100" step="5" value="${bondShare(c)}" style="width:62px" onchange="sheetBondSet('bondShare',+this.value)">%</label><label class="note" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox" checked onchange="sheetBondOn(this.checked)"> On (DM)</label></div>`:''}
  ${B.map((s,i)=>{const N=bondNow(c,s),full=N.parts.length>=slots;return `<div class="sh-feat bond"${s.dead?' style="opacity:.6"':''}><input aria-label="Summon name" value="${esc(s.n||'')}" placeholder="Name" style="width:9em;font-weight:600" onchange="sheetBond(${i},'n',this.value)"> <input aria-label="What it looks like" value="${esc(s.f||'')}" placeholder="Form (wolf, spirit…)" style="width:10em" onchange="sheetBond(${i},'f',this.value)">${s.dead?' <span class="b red">fallen until a long rest</span>':''} <span style="cursor:pointer;color:var(--muted)" onclick="sheetBondRm(${i})" title="Release this summon">✕</span>
    <div class="bond-stats">Level ${N.L} · HP <input type="number" aria-label="Current HP" min="0" max="${N.hp}" value="${N.cur}" style="width:64px" onchange="sheetBond(${i},'hp',this.value)"> / ${N.hp} · AC ${N.ac} · Accuracy +${N.acc} · Hit: ${N.dmg} damage</div>
    ${N.parts.map((m,j)=>`<div class="note" style="margin:2px 0 0"><b>${esc(m.n)}</b> (Potency ${+m.pot||0}): ${esc(m.pn?propAt(m.pn,m.pot)||m.prop||'':m.prop||'')}${m.tr&&m.tr.n?` <i>${esc(m.tr.n)}:</i> ${esc(m.tr.t||'')}`:''} <span style="cursor:pointer;color:var(--muted)" onclick="sheetBondPartRm(${i},${j})" title="Remove (the part is used up)">✕</span></div>`).join('')}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px" class="sh-noprint">${full?`<small class="note" style="margin:0">Parts full (${slots}/${slots})</small>`:avail.length?`<select class="sel" aria-label="Feed a monster part" onchange="sheetBondPart(${i},this.value)"><option value="">Feed a monster part (${N.parts.length}/${slots})…</option>${avail.map(x=>`<option value="${esc(x.m.n)}">${esc(x.m.n)} · Potency ${+x.m.pot||0}${x.q>1?' ×'+x.q:''}</option>`).join('')}</select>`:`<small class="note" style="margin:0">No monster parts in your inventory (Potency up to ${L})</small>`}<button class="btn" type="button" style="${sb}" onclick="sheetBond(${i},'dead',${s.dead?'false':'true'})">${s.dead?'Back now':'Mark fallen'}</button></div></div>`}).join('')}
  ${B.length<BOND_MAX?`<button class="btn sh-noprint" type="button" style="margin-top:6px" onclick="sheetBondAdd()">+ Bind a summon (${B.length}/${BOND_MAX})</button>`:''}`}
function sheetBondOn(on){if(!dmUnlocked()){toast('Only the DM can turn bonded summons on or off');renderSheet();return}const c=sheetChar();if(on)c.bondOn=true;else delete c.bondOn;saveParty();renderSheet()}
function sheetBondSet(k,v){if(!dmUnlocked())return;const c=sheetChar();c[k]=v;saveParty();renderSheet()}
function sheetBondAdd(){const c=sheetChar();if(!c.bondOn)return;c.bonds=c.bonds||[];if(c.bonds.length>=BOND_MAX)return;c.bonds.push({n:'Summon '+(c.bonds.length+1),parts:[]});saveParty();renderSheet()}
function sheetBondRm(i){const c=sheetChar();if(!confirm('Release this summon? Its monster parts are lost.'))return;c.bonds=(c.bonds||[]).filter((_,j)=>j!==i);saveParty();renderSheet()}
function sheetBond(i,k,v){const c=sheetChar(),s=(c.bonds||[])[i];if(!s)return;if(k==='dead'){if(v)s.dead=true;else delete s.dead;if(v)s.hp=0;else delete s.hp}else if(k==='hp'){s.hp=Math.max(0,Math.round(+v||0))}else s[k]=String(v||'').slice(0,60);saveParty();renderSheet()}
function sheetBondPart(i,n){const c=sheetChar(),s=(c.bonds||[])[i];if(!s||!n)return;const x=bondParts(c).find(y=>y.m.n===n);s.parts=s.parts||[];if(!x||s.parts.length>=bondSlots(c))return;
  const r=(c.inv||[]).find(z=>lc(z[0])===lc(n));if(r){r[1]=(+r[1]||0)-1;if(r[1]<=0)c.inv=c.inv.filter(z=>z!==r)}s.parts.push(x.m.n);saveParty();renderSheet();toast((s.n||'Your summon')+' absorbs the '+x.m.n)}
function sheetBondPartRm(i,j){const c=sheetChar(),s=(c.bonds||[])[i];if(!s||!confirm('Remove this part? It is used up.'))return;s.parts=(s.parts||[]).filter((_,k)=>k!==j);saveParty();renderSheet()}
// Summon slots belong only to summoning characters: a class, subclass, hidden class, or school of magic that raises or calls servants (or one who already has a servant)
const SUMMON_RX=/necro|summon|conjur|shepherd|undead|grave|spirits|lich/i;
const isSummoner=c=>!!c&&(((c.undead||[]).length>0)||[c.cls,c.sub,c.cls2,c.sub2,c.hidden,...(c.schools||[]).map(x=>x&&x.n)].some(x=>x&&SUMMON_RX.test(x)));
const summonSlots=c=>isSummoner(c)?Math.max(0,+((c.abil||{}).int??10)||0):0;
function raiseHTML(k){const C=SCAV[k],S=C.get(),m=scavMon(S);if(!m)return '';const R=S.rz=S.rz||{};const who=PARTY.find(c=>c.id===R.who);
  const flags=[['dark','Died in total darkness'],['night','Died at night'],['emb','Embalmed or kept by Gentle Repose'],['wronged','Murdered, killer still alive'],['starve','Starved or ate people, died in the cold']];
  const rc=who&&raiseChance(who,m),slots=who?summonSlots(who):0,used=who?(who.undead||[]).length:0;
  return `<details class="fold" style="margin-top:10px"${R.open?' open':''} ontoggle="raiseSet('${k}','open',this.open)"><summary><b>⚰ Raise it as undead</b> <small style="color:var(--muted)">necromancy</small></summary>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0"><label class="note" style="margin:0">Necromancer <select class="sel" onchange="raiseSet('${k}','who',this.value)"><option value="">${PARTY.some(isSummoner)?'Choose…':'No summoner in the party'}</option>${PARTY.filter(isSummoner).map(c=>`<option value="${c.id}"${c.id===R.who?' selected':''}>${esc(c.name||'Unnamed')} (level ${+c.level||1}, ${summonSlots(c)} slot${summonSlots(c)===1?'':'s'})</option>`).join('')}</select></label>
      <label class="note" style="margin:0">Days since death <input type="number" min="0" value="${+R.days||0}" style="width:60px" onchange="raiseSet('${k}','days',+this.value)"></label></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px">${flags.map(([f,l])=>`<label class="note" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox"${R[f]?' checked':''} onchange="raiseSet('${k}','${f}',this.checked)"> ${l}</label>`).join('')}</div>
    ${who?`<div class="note" style="margin:0 0 6px">Corpse level ${corpseLv(m)} (CR ${esc(String(m.sb&&m.sb.cr||m.cr||'?'))})${rc.gap?` +${rc.gap} because the ${esc(m.realm)} lies beyond ${esc(who.name||'their')} stage`:''} vs level ${+who.level||1}${rc.led?' (Death\'s Ledger: counts one level lower)':''}: <b>${rc.p>=1?'it always rises':Math.round(rc.p*1e4)/100+'% chance'}</b> (${rc.p>=1?'certain':'2/10^'+(rc.d+1)}). Summon slots: ${used} of ${slots} used (one per point of INT).</div>`:''}
    <div class="tablewrap"><table class="t"><thead><tr><th>Undead</th><th class="num">Keeps</th><th>Corpse needed</th><th>Upkeep</th><th></th></tr></thead><tbody>${UNDEAD.map((u,i)=>{const ok=u.ok(m,S,R);return `<tr${ok?'':' style="opacity:.45"'}><td><b>${esc(u.n)}</b>${u.chain?' <span class="b gold" title="Needs a binding ritual with a chain device">⛓</span>':''}${u.spirit?' <small style="color:var(--muted)">spirit</small>':''}</td><td class="num">${u.p}%</td><td>${esc(u.need)}</td><td>${esc(u.up)}</td><td>${ok&&who&&!R.done?`<button class="btn" onclick="raiseRoll('${k}',${i})"${used>=slots?' disabled title="No summon slot free"':''}>Raise</button>`:''}</td></tr>`}).join('')}</tbody></table></div>
    ${R.res?`<div style="margin-top:6px">${R.res}</div>`:''}
    ${who&&R.fail&&!R.retried&&necroLv(who)>=3?`<div style="margin-top:6px"><button class="btn" type="button" onclick="raiseRetry('${k}')">↻ Try again (spend a spell slot): Death's Ledger</button></div>`:''}
    ${who&&!R.done&&necroLv(who)>=6?`<div style="margin-top:6px"><button class="btn" type="button" onclick="raiseRender('${k}')" title="Bone Tithe: 10 minutes">🦴 Render it into essence (+1): Bone Tithe</button> <small class="note" style="margin:0">${esc(who.name||'They')} have ${+who.essence||0} essence</small></div>`:''}
    <div class="note">One try per corpse${PARTY.some(c=>necroLv(c)>=3)?' (a School of Necromancy wizard may retry once for a spell slot)':''}. A servant keeps its share of the original's ability scores, HP, AC, and attack and damage numbers (rounded down). ⛓ = it stays a servant only through a ritual with a chain device; if the chain breaks, it is freed (spirits flee, the rest turn on their master).</div></details>`}
function raiseSet(k,f,v){const C=SCAV[k],S=C.get();if(!S)return;S.rz=S.rz||{};S.rz[f]=v;C.set(S);if(f!=='open')C.render()}
function raiseRoll(k,i){const C=SCAV[k],S=C.get(),m=scavMon(S),u=UNDEAD[i],R=S.rz||{};const who=PARTY.find(c=>c.id===R.who);if(!m||!u||!who||R.done)return;
  if((who.undead||[]).length>=summonSlots(who)){toast('No summon slot free');return}const rc=raiseChance(who,m),r=Math.random();R.done=true;
  if(r<rc.p){const b=m.sb||{},f=x=>Math.floor((+x||0)*u.p/100),sv={n:u.n+' ('+m.n+')',type:u.n,from:m.n,realm:m.realm,p:u.p,hp:f(b.hp),ac:f(b.ac),ab:(b.ab||[]).map(f),chain:u.chain,up:u.up,bound:!u.chain};
    who.undead=(who.undead||[]).concat(sv);saveParty();R.res=`<span style="color:var(--green)"><b>It rises.</b></span> ${esc(sv.n)} serves ${esc(who.name||'the necromancer')}: HP ${sv.hp}, AC ${sv.ac}, scores ${sv.ab.join('/')} (${u.p}% of the original).${u.chain?' <b>Bind it with the chain ritual</b> (1 hour), or it is not a servant.':''}`}
  else{R.res=`<span style="color:var(--red)"><b>It does not rise.</b></span> The chance was ${Math.round(rc.p*1e4)/100}%; ${necroLv(who)>=3&&!R.retried?'Death\'s Ledger lets '+esc(who.name||'them')+' spend a spell slot to try once more.':'this corpse is spent for '+esc(who.name||'them')+'.'}`;R.fail=true;R.ui=i}
  C.set(S);C.render()}
function raiseRetry(k){const C=SCAV[k],S=C.get(),R=S&&S.rz;if(!R||!R.fail||R.retried)return;const who=PARTY.find(c=>c.id===R.who);if(!who||necroLv(who)<3)return;
  R.retried=true;R.fail=false;R.done=false;C.set(S);toast('A spell slot spent: mark it on '+(who.name||'the')+'\u2019s sheet');raiseRoll(k,R.ui)}
function raiseRender(k){const C=SCAV[k],S=C.get(),R=S&&S.rz;if(!R||R.done)return;const who=PARTY.find(c=>c.id===R.who);if(!who||necroLv(who)<6)return;
  who.essence=(+who.essence||0)+1;R.done=true;R.res=`🦴 <b>Rendered.</b> ${esc(who.name||'The necromancer')} now has ${who.essence} essence.`;saveParty();C.set(S);C.render()}
// combat tracker: the downed monster's corpse
// ── Spoils: when a fight ends, what the party carries away. The haul follows the fight (a pouch, a chest, or a hoard from
// the shared treasure roller), the corpses keep their own scavenging, and the DM hands everything out to characters ──
const SPOIL_SIZE=['pouch','chest','hoard'];
function spoilsFight(){const mons=(CB.list||[]).filter(x=>x.mon&&!x.sum).map(x=>({x,m:MON_IDX.get(lc(x.mon))})).filter(o=>o.m);if(!mons.length)return null;
  const rc={};mons.forEach(o=>{rc[o.m.realm]=(rc[o.m.realm]||0)+1});const realm=Object.keys(rc).sort((a,b)=>rc[b]-rc[a])[0]||'Human';
  const lv=Math.max(1,Math.round(PARTY.reduce((a,c)=>a+(+c.level||1),0)/(PARTY.length||1))||1),th=encBudget({size:PARTY.length||4,level:lv,realm}),adj=mons.reduce((a,o)=>a+monXP(o.m),0)*xpMult(mons.length);
  let di=-1;th.forEach((t,i)=>{if(adj>=t)di=i});const champ=mons.some(o=>o.m.champ),sz=champ||DIFFS[di]==='Deadly'?2:di>=1?1:0;
  const lead=mons.slice().sort((a,b)=>monXP(b.m)-monXP(a.m))[0].m,down=mons.every(o=>o.x.hp<=0);return {mons,realm,lv,sz,diff:di<0?'Trivial':DIFFS[di],champ,lead,down}}
// money goes into the realm's own coin where it has one (gold pieces in the Human Realm); otherwise its worth in gp
function spoilCoins(gold,rn,favor){if(favor)return {n:favor,coin:'Favor',pl:'Favor',realm:'',favor:1};const C=CURRENCY[rn];return C&&C.coin&&C.gp?{n:Math.max(1,Math.round(gold/C.gp)),coin:C.coin,pl:C.pl||C.coin,realm:rn}:{n:gold,coin:'gold piece',pl:'gp',realm:''}}
function spoilsNew(F){const T=rollTreasure(F.realm,F.lv,F.sz),c=spoilCoins(T.gold,F.realm,T.favor),kinds={};F.mons.forEach(o=>{const k=o.m.n.replace(/\s\d+$/,'');kinds[k]=(kinds[k]||0)+1});
  const who=Object.entries(kinds).map(([n,k])=>k>1?k+' '+n+(/s$/.test(n)?'':'s'):aAn(n)+' '+n),list=who.length>1?who.slice(0,-1).join(', ')+' and '+who[who.length-1]:who[0];
  const goods=[`${SPOIL_SIZE[F.sz]==='pouch'?'a pouch':SPOIL_SIZE[F.sz]==='chest'?'a stash':'a hoard'} of ${fmt(c.n)} ${c.n===1?c.coin.toLowerCase():c.pl}`].concat(T.mats.map(x=>(x.q>1?x.q+' × ':'')+x.m.n),T.items.map(b=>b.n));
  return {at:Date.now(),realm:F.realm,sz:F.sz,lead:F.lead.n,coins:c,left:c.n,mats:T.mats.map(x=>({n:x.m.n,q:x.q,to:''})),items:T.items.map(b=>({n:b.n,to:''})),
    line:`Among the fallen (${list}): ${goods.length>1?goods.slice(0,-1).join(', ')+', and '+goods[goods.length-1]:goods[0]}.`}}
function spoilsHTML(){if(role()==='player')return '';const F=spoilsFight();if(!F)return '';
  if(!F.down&&!CB.ended)return `<div class="note" style="margin-top:10px">🎁 Spoils open here when every monster is down. <button class="btn" style="padding:2px 10px" onclick="CB.ended=1;saveCB();renderCombat()">End the fight now</button></div>`;
  if(!CB.spoils){CB.spoils=spoilsNew(F);store.set('combat',CB)}const S=CB.spoils,P=PARTY.filter(c=>clCanEdit(c)),opt=sel=>`<option value="">Give to…</option>${P.map(c=>`<option value="${c.id}"${sel===c.id?' selected':''}>${esc(c.name||'Unnamed')}</option>`).join('')}`;
  const nm=id=>(PARTY.find(c=>c.id===id)||{}).name||'someone',corpses=[...new Map(F.mons.filter(o=>o.x.hp<=0&&(o.m.drops||[]).length).map(o=>[o.m.n,o])).values()];
  return `<section class="panel spoils" style="margin-top:14px;border-color:var(--gold)">
    <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-family:var(--serif);font-size:1.25rem">🎁 Spoils</h4><span class="b gold">${esc(SPOIL_SIZE[S.sz])}</span><span class="note" style="margin:0">${esc(F.diff)} fight${F.champ?', led by a champion':''} in the ${esc(S.realm)} Realm</span>
      <span style="margin-left:auto;display:flex;gap:6px"><button class="btn" onclick="spoilsReroll()" title="Roll a different haul">🎲 Reroll</button><button class="btn" onclick="CB.spoils=null;CB.ended=0;saveCB();renderCombat()" title="Close the spoils (they roll again next time)">Close</button></span></div>
    <p class="quote-line" style="font-family:var(--serif);font-style:italic;color:var(--text2);margin:8px 0;border-left:3px solid var(--gold);padding-left:10px">${esc(S.line)}</p>
    <div class="mlist" style="margin-top:6px">
      <div class="enc-row" style="padding:8px 12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><b>${S.coins.favor?'⟡':'🪙'} ${fmt(S.left)} ${esc(S.coins.favor?'Favor':S.left===1?S.coins.coin.toLowerCase():S.coins.pl)}</b>${S.coins.favor?' <small class="note" style="margin:0">(this realm trades in Favor, not coin)</small>':''}${S.coins.realm&&S.coins.realm!=='Human'?` <small class="note" style="margin:0">(${esc(S.coins.realm)} coin)</small>`:''}
        ${S.left&&P.length?`<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button class="btn" onclick="spoilsSplit()">Split between ${P.length}</button><select class="sel" id="sp-coin" style="max-width:160px">${opt('')}</select><button class="btn" onclick="spoilsCoinsTo($('sp-coin').value)">Give all</button></span>`:S.left?'':'<span class="note" style="margin:0 0 0 auto">handed out</span>'}</div>
      ${S.mats.map((x,i)=>spoilRow(x,i,'mats',opt)).join('')}${S.items.map((x,i)=>spoilRow(x,i,'items',opt)).join('')}</div>
    ${corpses.length?`<div class="note" style="margin:10px 0 4px"><b>The corpses.</b> Harvest parts aren't in the haul: scavenge each body (its own checks and DCs).</div><div class="chips">${corpses.map(o=>`<button class="chip" onclick="CB.harvest='${o.x.id}';saveCB();renderCombat()">🔪 ${esc(o.m.n)}</button>`).join('')}</div>`:''}
  </section>`}
function spoilRow(x,i,k,opt){const it=k==='items'?findBP(x.n):findMat(x.n),nm=(PARTY.find(c=>c.id===x.to)||{}).name;
  return `<div class="enc-row" style="padding:8px 12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${x.q>1?x.q+' × ':''}${it?refChip(it,esc(x.n),k==='items'?it.r:'G'+it.g):esc(x.n)}
    <span style="margin-left:auto;display:flex;gap:6px;align-items:center">${x.to?`<span class="b green">→ ${esc(nm||'given')}</span>`:`<select class="sel" data-spgive="${k}:${i}" style="max-width:170px">${opt('')}</select>`}</span></div>`}
function spoilsLog(c,what){c.log=(c.log||[]).concat({d:new Date().toISOString().slice(0,10),deed:'Spoils from the '+(CB.spoils.lead||'fight')+' fight: '+what});return shopLog({c,kind:'loot',item:what+' (spoils from the '+(CB.spoils.lead||'fight')+' fight)',qty:1,gpv:0,rn:'Human',src:'loot'})}
function spoilsGive(k,i,id){const S=CB.spoils,x=S&&S[k][i],c=PARTY.find(p=>p.id===id);if(!x||!c||x.to)return;const before=JSON.stringify(c);
  invAdd(c,x.n,x.q||1,true,true);x.to=id;const lid=spoilsLog(c,(x.q>1?x.q+' × ':'')+x.n);saveParty();saveCB();renderCombat();
  undoToast((x.q>1?x.q+' × ':'')+x.n+' → '+(c.name||'them'),()=>{shopUnlog(lid);Object.assign(c,JSON.parse(before));Object.keys(c).forEach(key=>{if(!(key in JSON.parse(before)))delete c[key]});x.to='';saveParty();saveCB();if(TAB==='combat')renderCombat()})}
function spoilsAddCoins(c,n){const S=CB.spoils,C=S.coins;if(C.favor){c.favor=(+c.favor||0)+n;return}if(C.realm){c.purse=c.purse||{};c.purse[C.realm]=(+c.purse[C.realm]||0)+n}else{c.coins=c.coins||{};c.coins.gp=(+c.coins.gp||0)+n}}
function spoilsSplit(){const S=CB.spoils,P=PARTY.filter(c=>clCanEdit(c));if(!S||!S.left||!P.length)return;if(P.length>1&&!massOk('Split the coins between all '+P.length+' characters?'))return;const snap=P.map(c=>JSON.stringify(c)),was=S.left,each=Math.floor(S.left/P.length);let rest=S.left-each*P.length;const lids=[];
  P.forEach(c=>{const n=each+(rest>0?1:0);if(rest>0)rest--;if(n){spoilsAddCoins(c,n);lids.push(spoilsLog(c,fmt(n)+' '+(n===1?S.coins.coin.toLowerCase():S.coins.pl)))}});S.left=0;saveParty();saveCB();renderCombat();
  undoToast(`Split ${fmt(was)} ${S.coins.pl} between ${P.length}`,()=>{lids.forEach(shopUnlog);P.forEach((c,i)=>Object.assign(c,JSON.parse(snap[i])));S.left=was;saveParty();saveCB();if(TAB==='combat')renderCombat()})}
function spoilsCoinsTo(id){const S=CB.spoils,c=PARTY.find(p=>p.id===id);if(!S||!S.left)return;if(!c){toast('Choose who gets the coins');return}const snap=JSON.stringify(c),was=S.left;spoilsAddCoins(c,was);const lid=spoilsLog(c,fmt(was)+' '+(was===1?S.coins.coin.toLowerCase():S.coins.pl));S.left=0;saveParty();saveCB();renderCombat();
  undoToast(`${fmt(was)} ${S.coins.pl} → ${c.name||'them'}`,()=>{shopUnlog(lid);Object.assign(c,JSON.parse(snap));S.left=was;saveParty();saveCB();if(TAB==='combat')renderCombat()})}
function spoilsReroll(){const F=spoilsFight(),S=CB.spoils;if(!F)return;if(S&&(S.left!==S.coins.n||S.mats.some(x=>x.to)||S.items.some(x=>x.to))){toast('Some of this haul is already handed out');return}CB.spoils=spoilsNew(F);saveCB();renderCombat()}
document.addEventListener('change',e=>{const el=e.target.closest&&e.target.closest('[data-spgive]');if(!el||!el.value)return;const [k,i]=el.dataset.spgive.split(':');spoilsGive(k,+i,el.value)});
function harvestHTML(){const x=CB.harvest&&CB.list.find(y=>y.id===CB.harvest),m=x&&MON_IDX.get(lc(x.mon));if(!m)return '';CB.corpses=CB.corpses||{};
  if(!CB.corpses[x.id]||CB.corpses[x.id].mon!==m.n){CB.corpses[x.id]=scavNew(m,x.kt);saveCB()}return scavPopHTML('cb','Scavenge the '+esc(x.name))}
// Tools page: scavenge any monster's corpse
function renderScavTool(){const el=$('sc-box');if(!el)return;const S=store.get('scav',null);
  el.innerHTML=S&&scavMon(S)?scavHTML('tool','Scavenge '+aAn(S.mon)+' '+esc(S.mon)+' corpse'):`<div class="form"><label class="full">Monster<input class="sel" id="sc-mon" list="sc-mons" placeholder="Type a monster's name…"></label><datalist id="sc-mons">${MONSTERS.map(m=>`<option value="${esc(m.n)}">${esc(m.realm+' '+m.g)}</option>`).join('')}</datalist><div style="display:flex;justify-content:flex-end"><button class="btn primary" id="sc-go">Lay out the corpse</button></div></div>`;
  const go=$('sc-go');if(go)go.onclick=()=>{const m=MON_IDX.get(lc($('sc-mon').value.trim()));if(!m){toast('Pick a monster from the list');return}store.set('scav',scavNew(m));renderScavTool()}}
// Mine shafts (Tools page): dig a shaft in a realm. Each level is 60 ft deeper and holds rarer ground: level L brings
// up the realm's minerals of grade L-1 to L+1. Veins start hidden: a Harvesting search of the level finds every vein
// whose Find DC (10 + grade + the realm's step) it meets, and each new search of the same level adds 5. Mining a
// vein uses the same DC: meet it for 1 unit, 1 more for every 2 points above, until it is worked out. Deeper
// levels bring more hazards and more of the realm's creatures.
const MINE_REALM={
  Human:{rock:'timbered tunnels through granite, shale and clay',air:'Lamps and candles; the air thins below 400 ft.',hz:[['Cave-in','Timbers groan and the roof comes down','Dexterity','4d10 bludgeoning, and buried until dug out'],['Bad air','A pocket of choking damp','Constitution','1 level of exhaustion'],['Flooding','An underground stream breaks through','Strength','swept 30 ft and the level floods for 1d4 days']]},
  Mysterious:{rock:'glittering rock that rearranges its seams overnight',air:'Faint light from the stone itself; sounds echo wrongly.',hz:[['Shifting gallery','The tunnel quietly moves while you sleep','Wisdom','lost for 1d6 hours'],['Glamour seam','A vein that is not really there','Intelligence','a day of work wasted'],['Whisper pocket','Voices in the rock call names','Wisdom','frightened for 1 minute']]},
  Hell:{rock:'black basalt veined with cooling brimstone',air:'Red heat from below; every breath tastes of sulphur.',hz:[['Brimstone vent','A seam splits and spits fire','Dexterity','6d6 fire'],['Chain-rock','The walls grow hooks and grip','Strength','restrained until freed (DC to escape as the save)'],['Sulphur cloud','Yellow smoke rolls down the shaft','Constitution','poisoned for 1 hour']]},
  Heaven:{rock:'white marble and veins of solid light',air:'Never dark; the deeper you go, the brighter it shines.',hz:[['Blinding seam','A vein of pure light opens','Constitution','blinded for 1 hour'],['Choir echo','The stone sings a hymn that stops the heart','Wisdom','stunned for 1 round'],['Sacred ground','The rock refuses to be broken','Charisma','tools break; the level is closed for a day']]},
  Chaos:{rock:'rock that changes colour, hardness and direction',air:'Gravity drifts; down is not always down.',hz:[['Gravity flip','Down becomes up for a minute','Dexterity','fall 4d6 bludgeoning'],['Wild seam','Raw chaos leaks out','Charisma','a random effect from the wild-magic table'],['Fold','The tunnel loops back into itself','Intelligence','lose 1d4 hours']]},
  Abyss:{rock:'drowned stone under black water and pressure',air:'No light at all; the water presses harder every level.',hz:[['Pressure surge','The deep leans on you','Constitution','5d8 bludgeoning'],['Blackwater flood','The level fills from below','Strength','swept away and half-drowned'],['Lure light','A glow in the dark that is a mouth','Wisdom','charmed and walking towards it']]},
  'Inner Realm':{rock:'bedrock of raw law, every stratum a rule',air:'The rules of the deep apply: speak only truth below 300 ft.',hz:[['Law seam','A layer that enforces a rule','Wisdom','bound by the rule for a day'],['Collapse of order','Laws contradict and the stone splits','Dexterity','8d6 force'],['Silence stratum','Sound is not allowed here','Constitution','deafened and unable to cast verbal spells for 1 hour']]},
  'Outer Realm':{rock:'pale stone at the edge of everything, thin as paper in places',air:'Distances stretch; a ten-foot gallery can take an hour to cross.',hz:[['Thin rock','The wall opens onto the outside','Dexterity','fall into the space between (DM decides where)'],['Far echo','Something far away hears the digging','Wisdom','a creature of the realm arrives in 1d4 hours'],['Stretch','The tunnel grows longer behind you','Intelligence','a day lost']]},
  Void:{rock:'stone that is mostly absence, mined by what is missing',air:'No air worth the name below 120 ft; bring your own.',hz:[['Null pocket','A space where nothing exists','Constitution','10d6 necrotic and lose one carried item'],['Unmaking','The rock stops existing around you','Dexterity','fall to the next level'],['Hush','Even thought goes quiet','Intelligence','stunned for 1 minute']]},
  'Inner Void':{rock:'the hollow under the Void, where even absence wears thin',air:'Time slips; the shaft remembers you before you arrive.',hz:[['Echo of nothing','Your shadow mines against you','Wisdom','12d6 psychic'],['Time slip','You lose or gain a day','Charisma','1d4 days pass outside'],['Hollow fall','The floor was never there','Dexterity','fall two levels']]},
  Primordial:{rock:'the first matter of creation, still soft and still deciding what to be',air:'The rock is alive with possibility; every swing changes it.',hz:[['Unformed surge','The stone tries to become something else','Constitution','14d6 force and one random condition'],['First flame','The fire that came before fire','Dexterity','14d6 fire, ignoring resistance'],['Waking deep','The rock notices you','Charisma','a primordial creature of the realm arrives']]}};
const MINE_LEVEL_FT=60;
const mineRng=seed=>{let h=2166136261;for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296}};
const mineMats=realm=>{const all=MATS.filter(m=>m.realm===realm&&!m.gen&&m.org==='Mineral');const sh=all.filter(m=>m.shaft);return sh.length?sh:all.filter(m=>/Ore|Gem|Stone|Metal/.test(m.ty||''))};
function mineNew(realm,levels,seed){const R=mineRng(realm+'|'+levels+'|'+seed),pool=mineMats(realm),tier=(REALM[realm]||{}).tier||1,hz=(MINE_REALM[realm]||MINE_REALM.Human).hz;
  const under=/insect|ooze|elemental|aberration|undead|construct/,mons=MONSTERS.filter(m=>m.realm===realm);
  const L=[];for(let l=1;l<=levels;l++){const band=pool.filter(m=>Math.abs((m.g||1)-l)<=1),src=band.length?band:pool,nv=1+Math.floor(R()*3),veins=[];
    for(let i=0;i<nv&&src.length;i++){const m=src[Math.floor(R()*src.length)];veins.push({n:m.n,units:Math.max(1,Math.round((2+R()*6)*(1-(m.g||1)/15))),found:false,tries:0})}
    const hazard=R()<.15+.05*l?hz[Math.floor(R()*hz.length)][0]:null;
    const mb=mons.filter(m=>Math.abs((m.g||1)-l)<=1),mu=mb.filter(m=>under.test(m.body||'')),mp=mu.length?mu:mb;
    const mon=R()<.1+.04*l&&mp.length?mp[Math.floor(R()*mp.length)].n:null;
    L.push({l,veins,hazard,mon,searches:0})}
  return {realm,levels,seed,tier,L,who:'',log:[]}}
const mineDC=(n)=>{const m=findMat(n);return m?gatherDC(m):10};
const mineTrained=(who,realm)=>!!who&&hasProfession(who,'Harvesting')&&stageOf(profLvIn(who,'Harvesting'))>=tierStage((REALM[realm]||{}).tier||1);
const mineBonus=who=>who?Math.floor(profLvIn(who,'Harvesting')/2)+peopleProf(who,'Harvesting'):0;
const minePick=S=>heldTools(workerOf(S.who,BASE_MINE),S,["Miner's Pick"]).filter(t=>t.mine).sort((a,b)=>(b.kb||0)-(a.kb||0))[0];
function mineRoll(S,pb){const who=workerOf(S.who,BASE_MINE),ok=mineTrained(who,S.realm),b=mineBonus(who)+(pb||0),r1=1+Math.floor(Math.random()*20),r2=1+Math.floor(Math.random()*20),d=ok?r1:Math.min(r1,r2);return {d,tot:d+b,b,txt:`${d}${ok?'':` <small>(${r1}, ${r2}, disadvantage)</small>`} + ${b} = ${d+b}`}}
function mineSearch(l){const S=store.get('mine',null);if(!S)return;const lv=S.L[l-1];if(!lv)return;const r=mineRoll(S),extra=SCAV_STEP*lv.searches;lv.searches++;
  const hit=lv.veins.filter(v=>!v.found&&r.tot>=mineDC(v.n)+extra);hit.forEach(v=>v.found=true);
  S.log.unshift(`Level ${l} search: <b>${r.txt}</b>${extra?` (veins need +${extra} for earlier searches)`:''}: ${hit.length?'found '+hit.map(v=>esc(v.n)).join(', '):'nothing new'}.`);store.set('mine',S);renderMineTool()}
function mineDig(l,i){const S=store.get('mine',null);if(!S)return;const v=S.L[l-1]&&S.L[l-1].veins[i];if(!v||!v.found||!v.units)return;const pk=minePick(S);if(!pk){toast('Veins cannot be worked by hand: the miner needs a pick');return}const r=mineRoll(S,pk.kb||0),dc=mineDC(v.n);v.tries++;
  const n=Math.min(v.units,scavPicks(r.tot,dc)),who=PARTY.find(c=>c.id===S.who);v.units-=n;
  if(n&&who){const k=invAdd(who,v.n,n);v.units+=n-k;saveParty()}
  S.log.unshift(`Level ${l}, ${esc(v.n)}: <b>${r.txt}</b> vs DC ${dc}: ${n?`<span style="color:var(--green)">${n} unit${n>1?'s':''}${who?' → '+esc(who.name||'character'):''}</span>`:'<span style="color:var(--gold2)">nothing</span>'}${v.units?'':' · the vein is worked out'}.`);store.set('mine',S);renderMineTool()}
function mineSVG(S){const W=320,H=40+S.levels*44,hz=new Set();return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:6px auto" role="img" aria-label="Cross-section of the shaft">
  <rect x="0" y="0" width="${W}" height="18" fill="${rcol(S.realm)}" opacity=".35"/><rect x="0" y="18" width="${W}" height="${H-18}" fill="var(--surf2)"/>
  <rect x="24" y="10" width="14" height="${H-24}" fill="var(--bg)" stroke="var(--line)"/>
  ${S.L.map(lv=>{const y=18+lv.l*44-14;return `<rect x="38" y="${y-6}" width="${W-60}" height="12" fill="var(--bg)" stroke="var(--line)"/><text x="4" y="${y+4}" font-size="10" fill="var(--muted)">${lv.l*MINE_LEVEL_FT}′</text>
    ${lv.veins.map((v,i)=>`<circle cx="${70+i*70}" cy="${y}" r="7" fill="${v.found?(v.units?rcol((findMat(v.n)||{}).realm||S.realm):'var(--muted)'):'none'}" stroke="${v.found?'var(--text)':'var(--muted)'}" stroke-dasharray="${v.found?'':'2 2'}"><title>${v.found?esc(v.n)+' ('+v.units+' left)':'unfound vein'}</title></circle>`).join('')}
    ${lv.hazard?`<text x="${W-30}" y="${y+4}" font-size="12">⚠</text>`:''}${lv.mon?`<text x="${W-16}" y="${y+4}" font-size="12">👁</text>`:''}`}).join('')}</svg>`}
function renderMineTool(){const el=$('mn-box');if(!el)return;const S=store.get('mine',null);
  const form=`<div class="form"><label>Realm<select id="mn-realm">${realmOpts(S?S.realm:'Human')}</select></label><label>Levels<input type="number" id="mn-lv" value="${S?S.levels:5}" min="1" max="10"></label><div style="display:flex;justify-content:flex-end;align-items:end"><button class="btn primary" id="mn-go">${S?'Dig a new shaft':'Dig a shaft'}</button></div></div>`;
  if(!S){el.innerHTML=form;mineBind();return}const MR=MINE_REALM[S.realm]||MINE_REALM.Human,who=workerOf(S.who,BASE_MINE),ok=mineTrained(who,S.realm);
  el.innerHTML=form+`<div style="margin-top:10px"><b>${esc(S.realm)} shaft, ${S.levels} level${S.levels>1?'s':''} (${S.levels*MINE_LEVEL_FT} ft)</b><div class="note" style="margin:2px 0">${esc(MR.rock[0].toUpperCase()+MR.rock.slice(1))}. ${esc(MR.air)} Digging each level takes a crew of four ${2+S.tier} days.</div>
    ${mineSVG(S)}
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0"><label class="note" style="margin:0">Miner <select class="sel" id="mn-who"><option value="">A base miner (Harvesting 1, +0)</option><option value="none"${S.who==='none'?' selected':''}>Someone with no training (+0, disadvantage)</option>${PARTY.map(c=>`<option value="${c.id}"${c.id===S.who?' selected':''}>${esc(c.name||'Unnamed')}${hasProfession(c,'Harvesting')?` (Harvesting ${profLvIn(c,'Harvesting')}, +${mineBonus(c)})`:' (+0, no Harvesting)'}</option>`).join('')}</select></label>${!ok?`<span class="b gold">At disadvantage: no Harvesting profession, or below stage ${tierStage(S.tier)} for the ${esc(S.realm)}</span>`:''}</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 6px">${(()=>{const p=minePick(S);return who&&who.id?(p?`<span class="note" style="margin:0">Pick:</span>${refChip(p,esc(p.n),p.kb?'+'+p.kb:'')}`:'<span class="b gold">No pick in their gear or pack: they can search, but not dig</span>'):`<button class="chip${p?' on':''}" type="button" onclick="(S=>{S.tools=minePick(S)?[]:[&quot;Miner's Pick&quot;];store.set('mine',S);renderMineTool()})(store.get('mine',null))">${p?'✓ ':''}Miner's Pick</button><span class="note" style="margin:0">${p?'':'Without a pick, veins can be found but not dug.'}</span>`})()}</div>
    ${S.L.map(lv=>{const g0=Math.max(1,lv.l-1),g1=Math.min(10,lv.l+1),hz=lv.hazard&&MR.hz.find(h=>h[0]===lv.hazard),m=lv.mon&&MON_IDX.get(lc(lv.mon)),hid=lv.veins.filter(v=>!v.found).length;
      return `<div class="panel" style="margin-top:8px;padding:10px 12px"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b>Level ${lv.l}</b><span class="note" style="margin:0">${lv.l*MINE_LEVEL_FT} ft · grades ${g0}–${g1}${hid?` · ${hid} vein${hid>1?'s':''} not found yet`:''}</span><button class="btn" style="margin-left:auto" onclick="mineSearch(${lv.l})">🔍 Search${lv.searches?` (+${SCAV_STEP*lv.searches} DC)`:''}</button></div>
        ${hz?`<div class="callout" style="border-color:var(--red);margin:6px 0">⚠ <b>${esc(hz[0])}</b>: ${esc(hz[1])}. ${esc(hz[2])} save DC ${10+realmDC(S.tier)+lv.l} or ${esc(hz[3])}.</div>`:''}
        ${m?`<div class="note" style="margin:4px 0">👁 Something lives down here: ${refChip(m,esc(m.n),m.realm+' '+m.g)}</div>`:''}
        ${lv.veins.some(v=>v.found)?`<div class="mlist" style="margin-top:4px">${lv.veins.map((v,i)=>{if(!v.found)return '';const x=findMat(v.n);return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:3px 0">${x?refChip(x,esc(v.n),x.gr):esc(v.n)}<span class="note" style="margin:0">${v.units} unit${v.units===1?'':'s'} left · DC ${mineDC(v.n)} · about an hour a try</span><button class="btn" style="margin-left:auto" onclick="mineDig(${lv.l},${i})"${v.units?'':' disabled'}>⛏ Mine</button></div>`}).join('')}</div>`:''}</div>`}).join('')}
    ${S.log.length?`<details class="fold" style="margin-top:8px" open><summary>Log</summary><div class="note" style="margin:4px 0">${S.log.slice(0,30).join('<br>')}</div></details>`:''}
    <div class="note">Search a level to find its veins: each vein's Find DC is 10 + its grade + the realm's step, and each new search of the same level adds ${SCAV_STEP}. Mining a vein (about an hour a try): meet its DC for 1 unit, 1 more for every 2 points above, until the vein is worked out. With a miner picked, units go straight into their materials.</div></div>`;
  mineBind()}
function mineBind(){const go=$('mn-go');if(go)go.onclick=()=>{const S=store.get('mine',null);if(S&&S.log.length&&!confirm('Fill in this shaft and dig a new one?'))return;const lv=Math.max(1,Math.min(10,+$('mn-lv').value||5));store.set('mine',mineNew($('mn-realm').value,lv,Date.now()));renderMineTool()};
  const w=$('mn-who');if(w)w.onchange=()=>{const S=store.get('mine',null);if(!S)return;S.who=w.value;store.set('mine',S);renderMineTool()}}
// the installed app has no browser Back button: this one steps back (closing an open window first), or goes Home
function appBack(){const open=id=>{const e=$(id);return e&&!e.hidden};
  if(open('dmpad')){dmPad(false);return}
  if($('qbg').classList.contains('open')){closeQuick();return}
  if(open('hoView')){$('hoView').hidden=true;return}
  if(open('liveView')){liveClose();return}
  if(typeof TBL!=='undefined'&&TBL.open){closeTable();return}
  if($('pv')&&!$('pv').hidden&&!PV_SECOND){pvClose();return}
  if($('mbg').classList.contains('open')){closeModal();return}
  if(TAB==='archive'&&ARC.cur&&document.querySelector('[data-nbback]')){document.querySelector('[data-nbback]').click();return}
  if(history.length>1)history.back();else go('home')}
if(navigator.standalone)document.documentElement.classList.add('standalone');
// Table screen: a full-screen view for the table. "Character": big hit points with quick damage and healing, AC, initiative,
// conditions, and dice (with advantage). "Initiative": the combat tracker's order in big type, with Next turn. The screen
// stays awake while it is open; on a phone held sideways the two halves sit side by side.
const TBL={open:false,tab:'char',id:null};
function openTable(tab){TBL.open=true;TBL.tab=tab||(CB&&CB.list&&CB.list.length&&role()==='dm'?'init':'char');TBL.id=TBL.id||SHEET_ID||PARTY_SEL||(PARTY[0]&&PARTY[0].id);let el=$('tbl');if(!el){el=document.createElement('div');el.id='tbl';el.className='tbl';el.setAttribute('role','dialog');el.setAttribute('aria-label','Table screen');document.body.appendChild(el)}
  el.hidden=false;drawTable();wakeSync();try{if(matchMedia('(pointer:coarse)').matches&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}}
function closeTable(){TBL.open=false;const el=$('tbl');if(el)el.hidden=true;wakeSync();try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}if(TAB==='sheet')renderSheet();if(TAB==='combat')renderCombat()}
function drawTable(){const el=$('tbl');if(!el||!TBL.open)return;const c=PARTY.find(x=>x.id===TBL.id),C=store.get('combat',{round:1,turn:0,list:[]});
  const charV=()=>{if(!c)return `<div class="tbl-empty">No characters yet. <a href="#" onclick="closeTable();charWizard();return false">Build one</a> or add one on the Party page.</div>`;const s=charStats(c),max=+c.hpMax||0,hp=hpNow(c),pct=max?Math.max(0,Math.min(100,hp/max*100)):100,cs=Array.isArray(c.cond)?c.cond:[],init=(+c.initB||0)+(s.gb?s.gb.init:0);
    return `<div class="tbl-hp${pct<=25?' low':pct<=50?' mid':''}"><div class="tbl-hpn"><b>${hp}</b>${max?`<span>/ ${max}</span>`:''}</div>${+c.tempHp?`<div class="tbl-tmp">+${+c.tempHp} temporary</div>`:''}<div class="tbl-bar"><i style="width:${pct}%"></i></div>
      <div class="tbl-hpb"><button type="button" data-th="-10">−10</button><button type="button" data-th="-5">−5</button><button type="button" data-th="-1">−1</button><button type="button" data-th="1">+1</button><button type="button" data-th="5">+5</button><button type="button" data-th="10">+10</button></div>
      <div class="tbl-amt"><input type="number" id="tblAmt" min="0" inputmode="numeric" placeholder="amount" aria-label="Amount"><button type="button" data-ta="-">Damage</button><button type="button" data-ta="+">Heal</button></div></div>
      <div class="tbl-stats"><div><small>AC</small><b>${s.ac}</b></div><button type="button" data-tr="${d20x(init)}" data-tw="Initiative"><small>Initiative</small><b>${sgn(init)}</b></button><div><small>Speed</small><b>${esc(String((+c.speed||30)+(s.fxSpeed||0)))}</b></div></div>
      <div class="tbl-conds">${SHEET_CONDS.map(k=>`<button type="button" class="${cs.includes(k)?'on':''}" data-tc="${k}">${k}</button>`).join('')}</div>${(()=>{const me=C.list.find(x=>x.pc===c.id),S=me?C.list.filter(x=>x.sum&&x.sum.by===me.id):[];return S.length?`<div class="tbl-mine"><b>✨ ${esc(c.name||'Their')}'s summons</b>${S.map(x=>`<div class="${x.hp<=0?'down':''}"><span class="n">${esc(x.name)}</span>${sumTag(x)}<span class="h">${x.hp}/${x.max}</span></div>`).join('')}</div>`:''})()}`};
  const diceV=`<div class="tbl-dice">${[4,6,8,10,12,20,100].map(n=>`<button type="button" data-tr="1d${n}">d${n}</button>`).join('')}<button type="button" data-tadv="adv">d20 adv</button><button type="button" data-tadv="dis">d20 dis</button></div>`;
  const sumTag=x=>x.sum?`<span class="s" title="${x.sum.left?x.sum.left+' round'+(x.sum.left>1?'s':'')+' left':'Until dismissed'}">✨ ${x.sum.left?'⏱'+x.sum.left:'summon'}</span>`:'';
  const who=C.list.filter(x=>!x.sum),cur=C.list[C.turn],pick=C.sumBy&&who.some(x=>x.id===C.sumBy)?C.sumBy:cur&&!cur.sum?cur.id:(who.find(x=>x.pc)||who[0]||{}).id;
  const sumV=()=>!who.length?'':TBL.sum?`<div class="tbl-sum"><b>✨ Summon</b>
      <label>Summoned by<select class="sel" id="tsm-by">${who.map(x=>`<option value="${x.id}"${x.id===pick?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
      <label>Creature<input class="sel" id="tsm-mon" list="tdl-mon" placeholder="Wolf, Skeleton, or any name" autocomplete="off"></label>
      <div class="row"><label>How many<input class="sel" id="tsm-n" type="number" min="1" max="20" value="1" inputmode="numeric"></label><label>Lasts (rounds)<input class="sel" id="tsm-r" type="number" min="0" placeholder="Until dismissed" inputmode="numeric"></label></div>
      <label>Acts<select class="sel" id="tsm-act"><option value="after">Right after the summoner</option><option value="own">On its own initiative</option></select></label>
      <div class="row"><button type="button" class="tbl-next" data-tsgo>✨ Summon</button><button type="button" class="tbl-sumbtn" data-tsum>Cancel</button></div></div>`:`<button type="button" class="tbl-sumbtn" data-tsum style="margin-top:10px">✨ Summon</button>`;
  const initV=()=>C.list.length?`<div class="tbl-round">Round ${C.round}</div><ol class="tbl-init">${C.list.map((x,i)=>`<li class="${i===C.turn?'cur':''}${x.hp<=0?' down':''}${x.sum&&!x.sum.own?' sum':''}"><span class="n">${esc(x.name)}</span>${sumTag(x)}<span class="i">${x.init}</span><span class="h">${x.hp}/${x.max}${+x.thp?` +${+x.thp}`:''}</span></li>`).join('')}</ol><button type="button" class="tbl-next" data-tnext>Next turn →</button>${sumV()}${TBL.sum?`<datalist id="tdl-mon">${MONSTERS.map(m=>`<option value="${esc(m.n)}">`).join('')}</datalist>`:''}`:`<div class="tbl-empty">The combat tracker is empty. Add the party and monsters on the <a href="#" onclick="closeTable();go('combat');return false">Combat</a> page.</div>`;
  el.innerHTML=`<div class="tbl-top"><div class="tbl-tabs"><button type="button" class="${TBL.tab==='char'?'on':''}" data-tt="char">Character</button><button type="button" class="${TBL.tab==='init'?'on':''}" data-tt="init">Initiative</button></div>${TBL.tab==='char'&&PARTY.length>1?`<select class="sel" id="tblWho" aria-label="Character">${PARTY.map(x=>`<option value="${esc(x.id)}"${x.id===TBL.id?' selected':''}>${esc(x.name||'Unnamed')}</option>`).join('')}</select>`:TBL.tab==='char'&&c?`<b class="tbl-name">${esc(c.name||'Unnamed')}</b>`:''}<button type="button" class="tbl-x" data-tx aria-label="Close table screen">✕</button></div>
    <div class="tbl-body">${TBL.tab==='char'?`<div class="tbl-a">${charV()}</div><div class="tbl-b">${diceV}</div>`:`<div class="tbl-a">${initV()}</div><div class="tbl-b">${diceV}</div>`}</div>`;
  el.onclick=e=>{const t=e.target;const q=a=>t.closest(a);
    if(q('[data-tx]'))return closeTable();const tt=q('[data-tt]');if(tt){TBL.tab=tt.dataset.tt;return drawTable()}
    const r=q('[data-tr]');if(r)return rollShow(r.dataset.tr,r.dataset.tw);const av=q('[data-tadv]');if(av){const R2=rollMulti('2d20'),a=R2.r[0],b=R2.r[1],k=av.dataset.tadv==='adv'?Math.max(a,b):Math.min(a,b);return diceOverlay({e:(av.dataset.tadv==='adv'?'Advantage':'Disadvantage')+' · 2d20 ('+a+', '+b+')',t:k,r:[k],sd:[20],mod:0},20)}
    const h=q('[data-th]');if(h)return tblHp(+h.dataset.th);const ta=q('[data-ta]');if(ta){const v=Math.abs(+($('tblAmt')||{}).value||0);if(!v)return toast('Type an amount first');return tblHp(ta.dataset.ta==='-'?-v:v)}
    const tc=q('[data-tc]');if(tc&&c){const cs=Array.isArray(c.cond)?c.cond.slice():[];const i=cs.indexOf(tc.dataset.tc);if(i<0)cs.push(tc.dataset.tc);else cs.splice(i,1);c.cond=cs;saveParty();return drawTable()}
    if(q('[data-tnext]')){CB=store.get('combat',C);cbNext();return drawTable()}
    if(q('[data-tsum]')){TBL.sum=!TBL.sum;drawTable();if(TBL.sum&&$('tsm-mon'))$('tsm-mon').focus();return}
    if(q('[data-tsgo]')){CB=store.get('combat',C);if(cbSummonDo('tsm')){TBL.sum=false;drawTable();if(TAB==='combat')renderCombat()}return}};
  const w=$('tblWho');if(w)w.onchange=()=>{TBL.id=w.value;drawTable()}}
function tblHp(d){const c=PARTY.find(x=>x.id===TBL.id);if(!c)return;const max=+c.hpMax||0;let hp=c.hp===''||c.hp==null?max:+c.hp||0,tmp=+c.tempHp||0;if(d<0){const take=Math.min(tmp,-d);tmp-=take;hp=Math.max(0,hp-(-d-take))}else hp=max?Math.min(max,hp+d):hp+d;c.hp=hp;c.tempHp=tmp||'';saveParty();drawTable();if(navigator.vibrate&&d<0)try{navigator.vibrate(15)}catch(e){}}
document.addEventListener('keydown',e=>{if(TBL.open&&e.key==='Escape'&&!$('dice-ov')?.classList.contains('on')){closeTable();e.stopPropagation()}},true);
// Keep screen on (Combat, the table screen): a screen wake lock while it is open and visible
const WAKE={lock:null};
function wakeSync(){
  const want=(TBL.open||TAB==='combat'&&store.get('wakelock',false))&&document.visibilityState==='visible'&&'wakeLock'in navigator;
  if(want&&!WAKE.lock)navigator.wakeLock.request('screen').then(l=>{WAKE.lock=l;l.addEventListener('release',()=>{WAKE.lock=null})}).catch(()=>{});
  else if(!want&&WAKE.lock){WAKE.lock.release().catch(()=>{});WAKE.lock=null}
}
document.addEventListener('visibilitychange',wakeSync);
// Player view: turn order and how hurt each combatant looks, safe to show the table (monsters show a state, not numbers).
// Open it full-screen on this device, or on a second screen (combat.html?pv=1), which follows the tracker live.
const PV_SECOND=SITE&&new URLSearchParams(location.search).has('pv');
function pvState(x){if(x.hp<=0)return ['Down','var(--muted)'];const f=x.max?x.hp/x.max:1;return f>=1?['Unhurt','var(--green)']:f>.5?['Hurt','var(--green)']:f>.25?['Bloodied','var(--gold)']:['Near death','var(--red)']}
function pvRender(){
  const C=store.get('combat',{round:1,turn:0,list:[]}),cur=C.list[C.turn];
  $('pv').innerHTML=`<div style="max-width:720px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><span style="font-family:var(--serif);font-size:1.8rem;font-weight:700">Round ${C.round}</span>${cur?`<span class="b gold" style="font-size:.95rem">${esc(cur.name)}'s turn</span>`:''}
      <span style="margin-left:auto;display:flex;gap:6px">${PV_SECOND?'':`<button class="btn" onclick="cbNext();pvRender()">Next turn →</button><button class="btn" onclick="window.open('${pageUrl('combat')}?pv=1','fand-pv')" title="Open on a second screen; it follows this tracker">↗ Second screen</button>`}<button class="btn primary" onclick="pvClose()">${PV_SECOND?'Tracker':'Close'}</button></span></div>
    ${C.list.length?C.list.map((x,i)=>{const [w,col]=pvState(x),pct=x.max?Math.max(0,Math.min(100,x.hp/x.max*100)):0;
      // a summon of a player character is the party's: its numbers show like a PC's; a monster's summon only shows how hurt it looks
      const by=x.sum&&C.list.find(y=>y.id===x.sum.by),mine=!!(by&&by.pc),l=x.sum&&x.sum.left;
      return `<div class="pv-row${i===C.turn?' on':''}${x.hp<=0?' down':''}${x.sum&&!x.sum.own&&by?' sum':''}"><span class="pv-mk" style="font-size:1.3rem;width:1.4em">${i===C.turn?'▶':''}</span>
        <div style="flex:1;min-width:0"><div style="font-size:1.25rem;font-weight:700">${esc(x.name)}${x.pc?' <span class="b green">PC</span>':''}${x.sum?` <span class="b acc" title="${mine?'Summoned by '+esc(by.name):'A summoned creature'}${l?': '+l+' round'+(l>1?'s':'')+' left':''}">✨ ${mine?esc(by.name)+'\'s summon':'Summoned'}${l?' · ⏱'+l:''}</span>`:''}</div>
        ${x.pc||mine?`<div style="margin-top:4px"><b>${x.hp}</b> / ${x.max} HP<div class="bar" style="margin-top:4px"><i style="width:${pct}%;background:${col}"></i></div></div>`:`<div style="margin-top:4px;font-weight:600;color:${col}">${w}</div>`}
        ${x.cond.length?`<div class="chips" style="margin-top:6px">${x.cond.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div>`:''}</div></div>`}).join(''):'<div class="empty">No combatants yet.</div>'}
    <div class="note">Monsters show how hurt they look, never their numbers.</div></div>`;
}
function pvOpen(){pvRender();$('pv').hidden=false;document.body.style.overflow='hidden'}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('pv')&&!$('pv').hidden&&!PV_SECOND)pvClose()});
function pvClose(){if(PV_SECOND){location.href=pageUrl('combat');return}$('pv').hidden=true;document.body.style.overflow=''}
window.addEventListener('storage',e=>{if(e.key==='fand.combat'&&!$('pv').hidden)pvRender();if(e.key==='fand.combat'&&TAB==='combat'&&$('pv').hidden)renderCombat()});
// turn order with pictures: who acts now, how hurt everyone is, who is down; a tap opens the quick card
function cbPic(x,cls){const m=x.mon&&MON_IDX.get(lc(x.mon));if(m)return artHTML(m,cls);if(typeof ART==='undefined')return '';return `<span class="art ${cls||''}" style="--ac:${x.pc?'#5fd08a':'#b8c2cc'}" aria-hidden="true">${iconSVG(ART.pg[x.pc?'classes':'hidden'])}</span>`}
function cbStripHTML(){if(!CB.list.length)return '';setTimeout(cbQuickSync,0);
  return `<div class="cbstrip" role="list" aria-label="Turn order">${CB.list.map((x,i)=>{const down=x.hp<=0,pct=x.max?Math.max(0,Math.min(100,x.hp/x.max*100)):0;
    return `<button type="button" role="listitem" class="cbtile${i===CB.turn?' on':''}${down?' down':''}" data-id="${esc(x.id)}" onclick="cbQuick('${x.id}',this)" aria-label="${esc(x.name)}${i===CB.turn?', acting now':''}${down?', down':''}: open its card">${i===CB.turn?'<span class="cbturn">NOW</span>':''}${cbPic(x)}${down&&typeof ART!=='undefined'?`<span class="cbskull" aria-hidden="true">${iconSVG(ART.sym['☠'])}</span>`:''}<b>${esc(x.name)}</b><span class="cbhp" aria-hidden="true"><span style="--p:${pct}%;--c:${pct>50?'var(--green)':pct>25?'var(--gold)':'var(--red)'}"></span></span>${x.cond.length?`<span class="cbconds" aria-hidden="true">${x.cond.map(condSym).join('')}</span>`:''}</button>`}).join('')}</div>`}
// the quick card: the numbers a combatant needs on its turn, without opening its whole page
function cbQuick(id,el,keep){const x=CB.list.find(y=>y.id===id);if(!x)return cbQuickClose();let q=$('qcard');
  if(!q){q=document.createElement('div');q.id='qcard';q.className='qcard';q.setAttribute('role','dialog');q.setAttribute('aria-label','Combatant card');q.hidden=true;document.body.appendChild(q)}
  if(!keep&&!q.hidden&&q.dataset.id===id)return cbQuickClose();
  const m=x.mon&&MON_IDX.get(lc(x.mon)),sb=m&&m.sb||null,mod=v=>{const n=Math.floor((+v-10)/2);return (n>=0?'+':'')+n};
  const list=(t,a)=>Array.isArray(a)&&a.length?`<h5>${t}</h5>${a.map(r=>Array.isArray(r)?`<p><b>${esc(r[0])}.</b> ${esc(r[1]||'')}</p>`:`<p>${esc(r)}</p>`).join('')}`:'';
  q.dataset.id=id;q._m=m;
  q.innerHTML=`<div class="qh">${cbPic(x)}<div style="flex:1;min-width:0"><b>${esc(x.name)}</b><div class="note" style="margin:0">${m?esc([sb&&sb.sz,sb&&sb.ty].filter(Boolean).join(' '))+((sb&&sb.cr)||m.cr?' · CR '+esc((sb&&sb.cr)||m.cr):''):x.pc?'Player character':'Custom combatant'}</div></div><button type="button" class="icon-btn" onclick="cbQuickClose()" aria-label="Close the card">${ICON.x}</button></div>
    <div class="qstats"><div>AC<b>${esc(x.ac)}</b></div><div>HP<b>${x.hp} / ${x.max}${+x.thp?' +'+(+x.thp):''}</b></div><div>Dodge<b>${cbDodge(x)}</b></div></div>
    ${x.cond.length?`<div class="chips" style="margin:4px 0">${x.cond.map(c=>`<span class="chip" title="${esc((typeof COND_TEXT!=='undefined'&&COND_TEXT[c])||'')}">${condSym(c)} ${esc(c)}</span>`).join('')}</div>`:''}
    ${sb?(sb.sp?`<p><b>Speed</b> ${esc(sb.sp)}</p>`:'')+(Array.isArray(sb.ab)?`<div class="qab">${['STR','DEX','CON','INT','WIS','CHA'].map((k,i)=>`<div>${k}<b>${sb.ab[i]} (${mod(sb.ab[i])})</b></div>`).join('')}</div>`:'')+[['Senses',sb.se],['Resistances',sb.rs],['Immunities',sb.im],['Vulnerabilities',sb.vu]].filter(r=>r[1]&&r[1]!=='—').map(([k,v])=>`<p><b>${k}</b> ${esc(v)}</p>`).join('')+list('Actions',sb.ac2)+list('Traits',sb.tr)+list('Legendary actions',sb.lg):''}
    ${m?`<div style="margin-top:8px"><button type="button" class="btn" onclick="const m=$('qcard')._m;cbQuickClose();showModal(m)">Full page →</button></div>`:''}`;
  q.hidden=false;diceify(q);
  if(innerWidth>640){const r=el.getBoundingClientRect(),w=q.offsetWidth,h=q.offsetHeight;q.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';q.style.top=(r.bottom+8+h>innerHeight-12?Math.max(12,r.top-h-8):r.bottom+8)+'px'}
  if(!keep)setTimeout(()=>{const b=q.querySelector('.icon-btn');if(b)b.focus()},0)}
function cbQuickClose(){const q=$('qcard');if(!q||q.hidden)return;const back=q.contains(document.activeElement);q.hidden=true;if(back){const t=[...document.querySelectorAll('.cbtile')].find(b=>b.dataset.id===q.dataset.id);if(t)t.focus()}}
// after the tracker redraws (a hit, a heal, the next turn), an open card shows the new numbers
function cbQuickSync(){const q=$('qcard');if(!q||q.hidden)return;if(TAB!=='combat')return cbQuickClose();const t=[...document.querySelectorAll('.cbtile')].find(b=>b.dataset.id===q.dataset.id);if(t)cbQuick(q.dataset.id,t,true);else cbQuickClose()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const q=$('qcard');if(q&&!q.hidden){cbQuickClose();e.stopPropagation()}}},true);
document.addEventListener('mousedown',e=>{const q=$('qcard');if(q&&!q.hidden&&!e.target.closest('#qcard,.cbtile,.cb-pic'))cbQuickClose()});
// phones: the tracker's tools fold away behind a bottom bar (Next turn, Add, More); More opens them all
let CB_MORE=false;
function renderCombat(){
  setTimeout(wakeSync,0);if(PV_SECOND&&$('pv').hidden)setTimeout(pvOpen,0);
  CB=store.get('combat',{round:1,turn:0,list:[]});if(cbPullHP(CB))store.set('combat',CB);
  const cur=CB.list[CB.turn];
  $('content').innerHTML=`<div class="page">${datalists()}
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Combat tracker</h3><p>Initiative, HP, and conditions. Damage applies FAND's flat AC automatically, and player characters' HP stays in step with the Party page.</p></div>
    <div class="tool cb-tool${CB_MORE?' open':''}" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span style="font-family:var(--serif);font-size:1.3rem;font-weight:700">Round ${CB.round}</span>
      ${cur?`<span class="b gold">Turn: ${esc(cur.name)}</span>`:''}
      <button class="btn primary cb-x cb-next" onclick="cbNext()">Next turn →</button>
      <span class="keyrow cb-addrow" style="flex:1;min-width:240px"><input class="sel" id="cb-n" type="number" min="1" value="1" aria-label="How many to add" title="How many to add" style="width:56px;flex:0 0 56px;min-width:0"><input class="sel" id="cb-add" list="dl-mon" placeholder="Add monster…" style="max-width:none;flex:1;min-width:0"><button class="btn" onclick="cbAddMon()">Add</button></span>
      <button class="btn" onclick="cbAddParty()">+ Party</button>
      <details class="more-menu cb-moremenu"><summary class="btn" aria-label="More combat tools">⋯ More</summary><div class="more-pop" role="menu"><button class="btn" onclick="cbRoll()">🎲 Roll monster initiative</button><button class="btn" onclick="cbSort()">Sort by initiative</button><button class="btn" onclick="cbAddCustom()">+ Custom</button><button class="btn${CB.sumOpen?' primary':''}" onclick="CB.sumOpen=!CB.sumOpen;saveCB();renderCombat()" title="Call a creature into the fight on someone's side">✨ Summon</button><div class="more-sep"></div><label class="note" style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" id="cb-ac" ${CB.noAC?'':'checked'} onchange="CB.noAC=!this.checked;saveCB()"> Subtract AC from damage</label><label class="note" style="display:flex;gap:6px;align-items:center;margin:0">Damage type <select class="sel" style="padding:2px 6px" onchange="CB.dt=this.value;saveCB()"><option value="">—</option>${Object.keys(KILL_FX).map(t=>`<option${t===CB.dt?' selected':''}>${t}</option>`).join('')}</select></label>${'wakeLock'in navigator?`<label class="note" style="display:flex;gap:6px;align-items:center;margin:0" title="Stops the phone or tablet from dimming and locking while this page is open"><input type="checkbox" id="cb-wake" ${store.get('wakelock',false)?'checked':''} onchange="store.set('wakelock',this.checked);wakeSync()"> Keep screen on</label>`:''}<div class="more-sep"></div>${PARTY.length?`<span class="rest-btns" style="display:inline-flex;gap:6px"><button class="btn" onclick="partyRest('short')" title="The whole party takes a short rest">⛺ Short rest</button><button class="btn" onclick="partyRest('long')" title="The whole party takes a long rest">🌙 Long rest</button></span>`:''}<button class="btn" onclick="if((CB.list||[]).length>1&&!massOk('Clear all '+CB.list.length+' combatants from the tracker?'))return;const was=store.get('combat',null);store.set('combat',{round:1,turn:0,list:[]});renderCombat();undoToast('Combat cleared',()=>{store.set('combat',was);if(TAB==='combat')renderCombat()})">Clear</button></div></details>
      <span class="cb-row2"><button class="btn" onclick="pvOpen()" title="A view to show the players: turn order and how hurt everyone looks, no monster numbers">👁 Player view</button>${liveBtnHTML()}<button class="btn primary" onclick="openTable('init')" title="A full-screen view for the table">🎲 Table screen</button><button class="btn" onclick="cbEndFight()" title="Save how the fight went (rounds, who dropped, damage) next to what the Party check predicted, then clear the tracker">📋 End fight</button></span>
    </div>
    ${cbSummonHTML()}
    ${cbStripHTML()}
    <div class="tablewrap" style="margin-top:14px"><table class="t cbt"><thead><tr><th class="num">Init</th><th>Combatant</th><th class="num">AC</th><th class="num" title="Rolled against an attacker's Accuracy: higher roll wins">Dodge</th><th>HP</th><th>Damage / heal / temp</th><th>Conditions</th><th></th></tr></thead><tbody>
    ${CB.list.length?CB.list.map((x,i)=>{const m=x.mon&&MON_IDX.get(lc(x.mon)),pct=x.max?Math.max(0,Math.min(100,x.hp/x.max*100)):0,down=x.hp<=0;
      return `<tr style="${i===CB.turn?'background:var(--goldbg);':''}${down?'opacity:.55':''}">
        <td class="num" data-l="Init"><input type="number" value="${x.init}" data-cb="${x.id}" data-f="init" aria-label="Initiative for ${esc(x.name)}" style="width:56px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px;color:var(--text);text-align:right"></td>
        <td>${i===CB.turn?'▶ ':''}<button type="button" class="cb-pic" onclick="cbQuick('${x.id}',this)" aria-label="Quick card for ${esc(x.name)}">${cbPic(x,'xs')}</button>${m?`<a href="#" ${m.champ?`data-champ="${esc(m.n)}"`:`data-ref="${ref(m)}"`} style="font-weight:600;color:var(--text)">${esc(x.name)}</a>${m.champ?' <span class="b gold" title="Champion: a monster with a class">★</span>':''}`:`<b>${esc(x.name)}</b>`}${x.pc?' <span class="b green">PC</span>':''}${x.sum?cbSumBadge(x):''}${x.bond&&x.atk?` <small style="color:var(--muted)" title="Bonded summon">${esc(x.atk)}</small>`:''}${down?(x.pc&&x.ds&&x.ds.f>=3?' <span class="b red">Dead</span>':x.pc&&x.ds&&x.ds.s>=3?' <span class="b gold">Stable</span>':' <span class="b red">Down</span>'):''}</td>
        <td class="num" data-l="AC"><input type="number" value="${x.ac}" data-cb="${x.id}" data-f="ac" aria-label="AC for ${esc(x.name)}" style="width:52px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px;color:var(--text);text-align:right"></td>
        <td class="num" data-l="Dodge" style="white-space:nowrap"><input type="number" value="${cbDodge(x)}" data-cb="${x.id}" data-f="dodge" aria-label="Dodge for ${esc(x.name)}" style="width:48px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px;color:var(--text);text-align:right"> <button class="btn" style="padding:2px 6px" onclick="cbDodgeRoll('${x.id}')" title="Roll d20 + Dodge">🎲</button></td>
        <td style="min-width:130px" data-l="HP"><b>${x.hp}</b> / ${x.max}${+x.thp?` <button class="b blue" style="border:0;cursor:pointer" onclick="cbTemp('${x.id}',1)" title="Temporary hit points: damage takes these first. Click to clear.">+${+x.thp} temp ✕</button>`:''}<div class="bar" style="margin-top:4px;position:relative"><i style="width:${pct}%;background:${pct>50?'var(--green)':pct>25?'var(--gold)':'var(--red)'}"></i>${+x.thp&&x.max?`<i style="position:absolute;left:0;top:0;height:100%;width:${Math.min(100,+x.thp/x.max*100)}%;background:var(--blue);opacity:.75"></i>`:''}</div>${x.pc&&down?cbDsHTML(x):''}</td>
        <td style="white-space:nowrap"><input type="number" min="0" id="dmg-${x.id}" placeholder="0" aria-label="Damage, healing, or temporary hit points for ${esc(x.name)}" style="width:64px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px;color:var(--text)"> <button class="btn" onclick="cbHit('${x.id}')">Hit</button> <button class="btn" onclick="cbHeal('${x.id}')">Heal</button> <button class="btn" onclick="cbTemp('${x.id}')" title="Give this many temporary hit points (they don't stack: the higher amount stays)">Temp</button></td>
        <td data-l="Conditions"><div class="chips">${x.cond.map(c=>{const t=(x.ct||{})[c];return `<span class="chip cb-cond"><button type="button" onclick="cbCond('${x.id}','${c}')" title="${c}: ${esc((typeof COND_TEXT!=='undefined'&&COND_TEXT[c])||'')} Click to remove.">${condSym(c)}${c} ✕</button><button type="button" class="cb-t${t===1?' last':''}" onclick="cbTimer('${x.id}','${c}')" title="${t?t+' round'+(t===1?'':'s')+' left: it ends at the start of '+esc(x.name)+'\'s turn when this reaches 0. Click to change.':'No timer: click to set how many rounds it lasts'}">⏱${t||''}</button></span>`}).join('')}<select class="sel" style="padding:2px 6px;font-size:.75rem" aria-label="Add a condition to ${esc(x.name)}" onchange="cbCond('${x.id}',this.value)"><option value="">+ condition</option>${CONDITIONS.filter(c=>!x.cond.includes(c)).map(c=>`<option>${c}</option>`).join('')}</select><input type="number" min="0" id="cbr-${x.id}" class="cb-rounds" placeholder="rounds" title="Rounds the next condition lasts (empty: no timer)" aria-label="Rounds the condition lasts"></div></td>
        <td style="white-space:nowrap">${down&&m&&!x.sum&&(m.drops||[]).length?`<button class="btn" onclick="CB.harvest='${x.id}';saveCB();renderCombat()" title="Scavenge its corpse">🔪 Scavenge</button> `:''}<button class="btn" onclick="cbRemove('${x.id}')" title="Remove">✕</button></td></tr>`}).join(''):`<tr class="cb-empty"><td colspan="8"><div class="empty" style="padding:30px"><div class="cb-empty-art" aria-hidden="true">⚔</div><b>No combatants yet</b>Start a fight in one tap, or send one from the <a href="${pageUrl('encounter')}" data-go="encounter">Encounter builder</a>.<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">${PARTY.length?'<button class="btn primary" type="button" onclick="cbAddParty()">+ Add the party</button>':''}<button class="btn" type="button" onclick="const i=$(\'cb-add\');if(i){i.scrollIntoView({block:\'center\'});i.focus()}">+ Add a monster</button></div></div></td></tr>`}
    </tbody></table></div>
    <div class="note">An attack is an opposed roll: the attacker's d20 + Accuracy against the target's d20 + Dodge (🎲 rolls it); the higher roll wins and a tie misses. Hit subtracts the target's AC from the damage (at least 1). Untick “Subtract AC” for damage that ignores armor.</div>${harvestHTML()}${spoilsHTML()}</div>
    ${cbFightsHTML()}
    <div class="cb-dock" role="toolbar" aria-label="Combat"><button class="btn primary cb-dock-next" type="button" onclick="cbNext()">Next turn →</button><button class="btn" type="button" onclick="const i=$('cb-add');if(i){i.scrollIntoView({block:'center'});i.focus()}">+ Add</button><button class="btn" type="button" aria-expanded="${CB_MORE}" onclick="CB_MORE=!CB_MORE;renderCombat();if(CB_MORE)document.querySelector('.cb-tool').scrollIntoView({block:'start'})">${CB_MORE?'✓ Less':'⋯ More'}</button></div>`;
  $('content').querySelectorAll('[data-cb]').forEach(el=>el.addEventListener('change',()=>{const x=CB.list.find(y=>y.id===el.dataset.cb);x[el.dataset.f]=+el.value||0;saveCB()}));
}
const cbFind=id=>CB.list.find(x=>x.id===id);
function cbDodgeRoll(id){const x=cbFind(id);if(x)rollShow(d20x(cbDodge(x)),x.name+' dodges')}
function cbHit(id){const x=cbFind(id),d=Math.max(0,+$('dmg-'+id).value||0),taken=CB.noAC?d:acTaken(d,+x.ac||0,cbTier()),soak=Math.min(+x.thp||0,taken);x.thp=(+x.thp||0)-soak;const was=x.hp,hit=taken-soak;x.hp=Math.max(0,x.hp-hit);if(was>0&&!x.hp)x.kt=CB.dt||'';if(x.pc){x.fdmg=(+x.fdmg||0)+(was-x.hp);if(was>0&&!x.hp){x.fdown=1;x.fdownR=CB.round}}let note='';
  if(x.pc&&hit>0){const over=was>0?hit-was:hit;x.ds=x.ds||{s:0,f:0};if(!x.hp&&over>=x.max&&x.max){x.ds={s:0,f:3};note=' · the damage left over reaches their maximum HP: dead'}else if(!was){x.ds.f=Math.min(3,(x.ds.f||0)+1);note=' · a failed death save ('+x.ds.f+' of 3; a critical hit is two: mark it)'+(x.ds.f>=3?': dead':'')}else if(!x.hp){x.ds={s:0,f:0};note=' · down: death saves start on their turn'}}
  saveCB();toast(x.name+' takes '+taken+(CB.noAC||!x.ac?'':' ('+d+' − AC '+x.ac+')')+(soak?' · '+soak+' from temporary HP':'')+note);renderCombat()}
function cbHeal(id){const x=cbFind(id),d=Math.max(0,+$('dmg-'+id).value||0);if(d&&x.ds&&x.ds.f>=3&&x.pc){toast(x.name+' is dead: healing alone can\'t bring them back');return}if(d)x.ds={s:0,f:0};x.hp=Math.min(x.max,x.hp+d);saveCB();renderCombat()}
// death saving throws (5e): d20, 10+ a success, 9 or lower a failure, a 1 two failures, a 20 back up with 1 HP;
// three successes and they are stable, three failures and they are dead
function cbDeathSave(id){const x=cbFind(id);if(!x)return;const D=x.ds=x.ds||{s:0,f:0};if(D.s>=3||D.f>=3)return;const r=1+Math.floor(Math.random()*20);let msg;
  if(r===20){x.hp=1;x.ds={s:0,f:0};msg='a natural 20: back up with 1 HP!'}else if(r===1){D.f=Math.min(3,D.f+2);msg='a natural 1: two failures'}else if(r>=10){D.s++;msg='a success'}else{D.f++;msg='a failure'}
  if(x.ds.s>=3)msg+=' · stable';if(x.ds.f>=3)msg+=' · dead';saveCB();toast(x.name+' rolls '+r+' on a death save: '+msg);renderCombat()}
function cbDs(id,k,n){const x=cbFind(id);if(!x)return;const D=x.ds=x.ds||{s:0,f:0};D[k]=D[k]===n?n-1:n;saveCB();renderCombat()}
const cbDsHTML=x=>{const D=x.ds||{s:0,f:0},pip=(k,i,col)=>`<button type="button" class="ds-pip" onclick="cbDs('${x.id}','${k}',${i})" title="${k==='s'?'Success':'Failure'} ${i} of 3 (click to mark)" style="--c:${col}" aria-pressed="${D[k]>=i}">${D[k]>=i?'●':'○'}</button>`;
  if(D.f>=3)return `<div class="ds"><span class="b red">☠ Dead</span> <button class="btn" style="padding:1px 8px" onclick="cbDs('${x.id}','f',3)" title="Undo the last failure">undo</button></div>`;if(D.s>=3)return `<div class="ds"><span class="b green">Stable</span> <small style="color:var(--muted)">unconscious at 0 HP; 1 HP after 1d4 hours</small></div>`;
  return `<div class="ds"><span class="ds-l">Death saves</span> <span title="Successes">${[1,2,3].map(i=>pip('s',i,'var(--green)')).join('')}</span> <span title="Failures">${[1,2,3].map(i=>pip('f',i,'var(--red)')).join('')}</span> <button class="btn" style="padding:1px 8px" onclick="cbDeathSave('${x.id}')" title="Roll a death saving throw: d20, 10 or higher succeeds">🎲 Save</button></div>`};
// temporary hit points don't stack: a new amount replaces the old only if it is higher; damage takes them first
function cbTemp(id,clear){const x=cbFind(id);if(!x)return;if(clear){x.thp=0;saveCB();renderCombat();return}const d=Math.max(0,+$('dmg-'+id).value||0);if(!d){toast('Type an amount first');return}const was=+x.thp||0;x.thp=Math.max(was,d);saveCB();toast(x.name+(x.thp>was?' has '+x.thp+' temporary HP':' keeps '+was+' temporary HP (they don\'t stack; the higher stays)'));renderCombat()}
function cbCond(id,c){if(!c)return;const x=cbFind(id);x.ct=x.ct||{};if(x.cond.includes(c)){x.cond=x.cond.filter(y=>y!==c);delete x.ct[c]}else{x.cond=x.cond.concat(c);const n=Math.max(0,Math.round(+(($('cbr-'+id)||{}).value)||0));if(n)x.ct[c]=n}saveCB();renderCombat()}
// condition timers: a condition can last a number of rounds, counted down at the start of that creature's turn; at 0 it ends
function cbTimer(id,c){const x=cbFind(id);if(!x)return;x.ct=x.ct||{};const v=prompt('How many rounds is '+x.name+' '+c+'? It counts down at the start of their turn. Leave empty for no timer.',x.ct[c]||'');if(v===null)return;const n=Math.max(0,Math.round(+v||0));if(n)x.ct[c]=n;else delete x.ct[c];saveCB();renderCombat()}
function cbTick(x){if(!x||!x.ct)return [];const gone=[];Object.keys(x.ct).forEach(c=>{if(!x.cond.includes(c)){delete x.ct[c];return}x.ct[c]--;if(x.ct[c]<=0){delete x.ct[c];x.cond=x.cond.filter(y=>y!==c);gone.push(c)}});return gone}
function cbRemove(id){const x=cbFind(id);if(!x)return;const S=CB.list.filter(y=>y.sum&&y.sum.by===id);
  if(S.length&&confirm(`Also dismiss ${x.name}'s summon${S.length>1?'s':''} (${S.map(y=>y.name).join(', ')})?`))S.forEach(y=>cbDrop(y.id));cbDrop(id);saveCB();renderCombat()}
function cbDrop(id){const i=CB.list.findIndex(x=>x.id===id);if(i<0)return;CB.list.splice(i,1);if(i<CB.turn)CB.turn--;if(CB.turn>=CB.list.length)CB.turn=0}
function cbNext(){if(!CB.list.length)return;let n=0;do{CB.turn++;if(CB.turn>=CB.list.length){CB.turn=0;CB.round++}n++}while(CB.list[CB.turn].hp<=0&&!CB.list[CB.turn].pc&&n<CB.list.length);const x=CB.list[CB.turn],gone=cbTick(x),left=cbSumTick(x);saveCB();renderCombat();const D=x.ds||{};if(left.length)setTimeout(()=>toast(left.join(', ')+(left.length>1?' fade':' fades')+': the summoning ends'),gone.length||x.pc&&x.hp<=0?2600:0);
  if(gone.length)toast(x.name+' is no longer '+gone.join(' or ')+(x.pc&&x.hp<=0&&!(D.s>=3)&&!(D.f>=3)?' · and is down: roll a death saving throw (🎲 Save)':''));else if(x.pc&&x.hp<=0&&!(D.s>=3)&&!(D.f>=3))toast(x.name+' is down: roll a death saving throw (🎲 Save)')}
function cbRoll(){CB.list.forEach(x=>{if(!x.pc&&!(x.sum&&!x.sum.own))x.init=1+Math.floor(Math.random()*20)+(x.dex||0)});cbSort()}
function cbSort(){const cur=CB.list[CB.turn];CB.list=cbOrder(CB.list);CB.turn=Math.max(0,CB.list.indexOf(cur));saveCB();renderCombat()}
function cbAddMon(){const v=$('cb-add').value.trim(),m=MON_IDX.get(lc(v)),k=Math.max(1,Math.min(20,+$('cb-n').value||1));if(!m){toast('No monster named “'+v+'”');return}const have=CB.list.filter(x=>x.mon===m.n).length;for(let i=0;i<k;i++)CB.list.push(monCombatant(m,k>1||have?have+i+1:0));saveCB();renderCombat()}
function cbAddParty(){const V=PV();if(!V.length){toast(PARTY.length?'No characters in '+campViewName()+': pick another campaign on the Party page':'No characters yet: add them on the Party page');return}if(campViewName())toast('Adding '+campViewName()+'\u2019s characters');V.forEach(c=>{if(!CB.list.some(x=>x.pc===c.id))CB.list.push({id:uid(),name:c.name||'PC',pc:c.id,init:0,dex:0,hp:hpNow(c),max:+c.hpMax||0,thp:+c.tempHp||0,ac:charStats(c).ac,dodge:charStats(c).dodge,cond:[]});cbAddBonds(c)});const cur=CB.list[CB.turn];CB.list=cbOrder(CB.list);CB.turn=Math.max(0,CB.list.indexOf(cur));saveCB();renderCombat()}
// a character's bonded summons join with them: they act right after their summoner, and their HP stays in step with the
// sheet (a summon dropped to 0 is marked fallen until the next long rest)
function cbAddBonds(c){const by=CB.list.find(x=>x.pc===c.id);if(!by)return 0;let n=0;
  // an Artificer's construct joins with it, bonded summons or not
  const A=artNow(c);if(A&&!A.dead&&!CB.list.some(x=>x.art&&x.art.pc===c.id)){CB.list.push({id:uid(),name:`${A.n} (${c.name||'PC'}'s)`,init:by.init,dex:0,hp:A.cur,max:A.hp,ac:A.ac,dodge:profBonus(A.L),cond:[],sum:{by:by.id,base:'construct',left:0,own:false},art:{pc:c.id},atk:`Accuracy +${A.acc}, hit ${A.dmg}`});n++}
  if(!c.bondOn)return n;(c.bonds||[]).forEach((s,i)=>{if(s.dead||CB.list.some(x=>x.bond&&x.bond.pc===c.id&&x.bond.i===i))return;const N=bondNow(c,s);
  CB.list.push({id:uid(),name:`${s.n||'Summon '+(i+1)} (${c.name||'PC'}'s)`,init:by.init,dex:0,hp:N.cur,max:N.hp,ac:N.ac,dodge:profBonus(N.L),cond:[],sum:{by:by.id,base:'bonded',left:0,own:false},bond:{pc:c.id,i},atk:`Accuracy +${N.acc}, hit ${N.dmg}`});n++});return n}
function cbAddCustom(){const n=prompt('Name?');if(!n)return;const hp=+prompt('Max HP?','10')||10,ac=+prompt('AC?','0')||0;CB.list.push({id:uid(),name:n,init:0,dex:0,hp,max:hp,ac,dodge:0,cond:[]});saveCB();renderCombat()}
// Summons (website addition): a creature called into the fight by a combatant. It fights on the summoner's side, acts
// right after them (or on its own initiative), and can last a set number of rounds, counted down at the start of the
// summoner's turn; when the count runs out it fades. Summons never count toward the Spoils and can't be scavenged.
function cbSummonHTML(){if(!CB.sumOpen)return '';const who=CB.list.filter(x=>!x.sum),cur=CB.list[CB.turn],pick=CB.sumBy&&who.some(x=>x.id===CB.sumBy)?CB.sumBy:cur&&!cur.sum?cur.id:(who.find(x=>x.pc)||who[0]||{}).id;
  const lab=(t,h)=>`<label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">${t}${h}</label>`;
  return `<div class="panel cb-sum" style="margin-top:12px;border-color:var(--acc)"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:1.15rem">✨ Summon</b><span class="note" style="margin:0">Call a creature into the fight on someone's side: a familiar, conjured beasts, raised undead, a bound demon.</span></div>
    ${who.length?`<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:10px">
      ${lab('Summoned by',`<select class="sel" id="sm-by">${who.map(x=>`<option value="${x.id}"${x.id===pick?' selected':''}>${esc(x.name)}</option>`).join('')}</select>`)}
      ${lab('Creature',`<input class="sel" id="sm-mon" list="dl-mon" placeholder="Wolf, Skeleton, or any name" style="min-width:200px">`)}
      ${lab('How many',`<input class="sel" id="sm-n" type="number" min="1" max="20" value="1" style="width:70px">`)}
      ${lab('Lasts (rounds)',`<input class="sel" id="sm-r" type="number" min="0" placeholder="Until dismissed" style="width:130px">`)}
      ${lab('Acts',`<select class="sel" id="sm-act"><option value="after">Right after the summoner</option><option value="own">On its own initiative</option></select>`)}
      ${lab('HP <small>(optional)</small>',`<input class="sel" id="sm-hp" type="number" min="1" placeholder="Its own" style="width:90px">`)}
      ${lab('AC <small>(optional)</small>',`<input class="sel" id="sm-ac" type="number" min="0" placeholder="Its own" style="width:90px">`)}
      <button class="btn primary" type="button" onclick="cbSummon()">✨ Summon</button><button class="btn" type="button" onclick="CB.sumOpen=false;saveCB();renderCombat()">Close</button></div>
    <div class="note" style="margin:8px 0 0">A Bestiary creature comes with its own HP and AC (fill HP or AC to change them); any other name makes a custom creature (10 HP unless you set it). The rounds count down at the start of the summoner's turn.</div>`
    :'<div class="note" style="margin:8px 0 0">Add the party or a monster first: someone has to do the summoning.</div>'}</div>`}
function cbSummon(){if(cbSummonDo('sm'))renderCombat()}
// read a summon form (ids <p>-by, <p>-mon, <p>-n, <p>-r, <p>-act, and optionally <p>-hp, <p>-ac) and summon; true when done
function cbSummonDo(p){const f=k=>$(p+'-'+k),by=cbFind((f('by')||{}).value);if(!by){toast('Choose who summons it');return false}const v=((f('mon')||{}).value||'').trim();if(!v){toast('Name the creature to summon');return false}
  const m=MON_IDX.get(lc(v)),k=Math.max(1,Math.min(20,Math.round(+(f('n')||{}).value||1))),r=Math.max(0,Math.round(+(f('r')||{}).value||0)),own=(f('act')||{}).value==='own',hp=Math.max(0,Math.round(+(f('hp')||{}).value||0)),acv=(f('ac')||{}).value||'';
  const base=m?m.n:v,made=summonMake(CB.list,by,v,k,r,own,hp,acv);
  const cur=CB.list[CB.turn];CB.list.push(...made);CB.list=cbOrder(CB.list);CB.turn=Math.max(0,CB.list.indexOf(cur));CB.sumBy=by.id;saveCB();
  toast(`${by.name} summons ${k>1?k+' × ':''}${base}${r?' for '+r+' round'+(r>1?'s':''):''}${own?' (own initiative)':' (acts right after them)'}`);return true}
// k summons of v (a Bestiary name, or any name for a custom creature) for the combatant by, numbered after any of theirs
// already in the list L; hp and acv ('' keeps its own) override the creature's numbers
function summonMake(L,by,v,k,r,own,hp,acv){const m=MON_IDX.get(lc(v)),base=m?m.n:v,have=L.filter(x=>x.sum&&x.sum.by===by.id&&x.sum.base===base).length,made=[];
  for(let i=0;i<k;i++){const x=m?monCombatant(m,0):{id:uid(),name:v,init:0,dex:0,hp:hp||10,max:hp||10,ac:0,dodge:0,cond:[]};
    if(m&&hp){x.hp=x.max=hp}if(acv!==''&&acv!=null)x.ac=Math.max(0,+acv||0);x.name=`${base}${k>1||have?' '+(have+i+1):''} (${by.name}'s)`;
    x.sum={by:by.id,base,left:r||0,own:!!own};x.init=own?1+Math.floor(Math.random()*20)+(x.dex||0):by.init;made.push(x)}return made}
// turn order: summons that act with their summoner sit right after them (in the order they came); everyone else by initiative
function cbOrder(L){const alive=id=>L.find(y=>y.id===id),after=L.filter(x=>x.sum&&!x.sum.own&&alive(x.sum.by)),rest=L.filter(x=>!after.includes(x)).sort((a,b)=>b.init-a.init||(b.dex||0)-(a.dex||0));
  after.forEach(x=>{const by=alive(x.sum.by);x.init=by.init;let j=rest.indexOf(by)+1;while(j<rest.length&&rest[j].sum&&rest[j].sum.by===by.id&&!rest[j].sum.own)j++;rest.splice(j,0,x)});return rest}
// at the start of a summoner's turn their timed summons count down; those that reach 0 fade (and leave the tracker)
function cbSumTick(x){if(!x)return [];const gone=[];CB.list.filter(y=>y.sum&&y.sum.by===x.id&&y.sum.left>0).forEach(y=>{y.sum.left--;if(y.sum.left<=0){gone.push(y.name);cbDrop(y.id)}});return gone}
const cbSumBadge=x=>{const by=cbFind(x.sum.by),l=x.sum.left;return ` <button type="button" class="b acc" style="border:0;cursor:pointer" onclick="cbSumTimer('${x.id}')" title="Summoned by ${esc(by?by.name:'someone no longer in the fight')}${l?': '+l+' round'+(l>1?'s':'')+' left, counted down at the start of their turn':': lasts until dismissed'}. Click to change.">✨ ${l?'⏱'+l:'summon'}</button>`};
function cbSumTimer(id){const x=cbFind(id);if(!x||!x.sum)return;const v=prompt('How many rounds does '+x.name+' have left? Leave empty to keep it until dismissed.',x.sum.left||'');if(v==null)return;x.sum.left=Math.max(0,Math.round(+v||0));saveCB();renderCombat()}

