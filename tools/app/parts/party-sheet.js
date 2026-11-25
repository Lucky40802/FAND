// ── Craft ─────────────────────────────────────────────────────
// What crafting costs, from the vault's Economy rules, scaled to the item's realm: materials at list price (half in their
// own realm and double in another when a buying realm is chosen; Void-grade ones in Favor); the finished item is worth
// twice its materials plus labor; hired labor is 10 gp × the item's level per day of crafting; a Blueprint costs by
// rarity. Labor and the Blueprint price follow the item's deepest material realm the way material prices do (×10 in the
// Mysterious Realm, ×100 in Hell and Heaven, …), and are paid in Favor from the Void down, labor at the realm's Favor base a week (website proposal).
const CRAFT_DAYS={Common:1,Uncommon:1,Rare:7,'Very Rare':7,Legendary:30,Artifact:30};
const BP_PRICE={Common:25,Uncommon:100,Rare:500,'Very Rare':2500,Legendary:10000};
const BP_FAVOR={Common:1,Uncommon:2,Rare:5,'Very Rare':10,Legendary:20};
function craftCost(b,q,buyIn,have){q=Math.max(1,q||1);have=have||(()=>0);
  const mats=b.mats.map(n=>{const m=findMat(n),miss=Math.max(0,q-have(n)),mod=!m||!buyIn||!m.price?1:m.realm===buyIn?0.5:2,unit=m&&m.price?Math.round(m.price*mod*100)/100:0,fv=m?favorOf(m):0;return {n,m,need:q,miss,unit,favor:fv}});
  const deep=mats.reduce((a,x)=>x.m&&realmPow(x.m.realm)>realmPow(a)?x.m.realm:a,'Human'),t=realmPow(deep),fb=favorBase(t),f=fb?0:realmBase(deep)/5;
  const matGp=mats.reduce((a,x)=>a+x.unit*x.need,0),matFavor=mats.reduce((a,x)=>a+x.favor*x.need,0),buyGp=mats.reduce((a,x)=>a+x.unit*x.miss,0),buyFavor=mats.reduce((a,x)=>a+x.favor*x.miss,0);
  const days=(CRAFT_DAYS[b.r]||1)*q,laborGp=fb?0:Math.round(10*(b.lv||1)*days*f),laborFavor=fb?fb*Math.ceil(days/7):0;
  const bpGp=fb||!BP_PRICE[b.r]?0:Math.round(BP_PRICE[b.r]*f),bpFavor=fb&&BP_FAVOR[b.r]?BP_FAVOR[b.r]*fb:0;
  return {mats,deep,days,matGp,matFavor,buyGp,buyFavor,laborGp,laborFavor,bpGp,bpFavor,valueGp:2*matGp+laborGp,valueFavor:2*matFavor+laborFavor,unsold:mats.some(x=>x.m&&!x.m.price&&!x.favor)}}
const costText=(g,fv)=>[g?gp(g):'',fv?fav(fv):''].filter(Boolean).join(' + ')||'—';
function renderCraft(){
  const st=store.get('craft',{bp:'',qty:1,who:'',buy:''});
  $('content').innerHTML=`<div class="page">${datalists()}
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Crafting planner</h3><p>Pick a Blueprint to see every material, where to get it, what it costs, and what a crafter is missing.</p></div>
    <div class="tool"><div class="form" style="grid-template-columns:2fr 1fr 1.5fr 1.5fr">
      <label>Blueprint<input id="cf-bp" list="dl-bp" placeholder="Start typing a Blueprint…" value="${esc(st.bp)}"></label>
      <label>How many<input id="cf-q" type="number" min="1" value="${st.qty||1}"></label>
      <label>Crafter<select id="cf-who"><option value="">No one in particular</option>${PARTY.map(c=>`<option value="${c.id}"${c.id===st.who?' selected':''}>${esc(c.name||'Unnamed')}</option>`).join('')}</select></label>
      <label>Buying in<select id="cf-buy"><option value="">List price</option>${REALMS.filter(r=>r.base||realmBase(r.n)).map(r=>`<option${r.n===st.buy?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
    </div></div><div id="cf-out" style="margin-top:14px"></div></div>`;
  const run=()=>{const o=store.get('craft',{});store.set('craft',Object.assign(o,{bp:$('cf-bp').value,qty:+$('cf-q').value||1,who:$('cf-who').value,buy:$('cf-buy').value}));craftOut()};
  ['cf-bp','cf-q','cf-who','cf-buy'].forEach(i=>{$(i).addEventListener('change',run);$(i).addEventListener('input',()=>{if(findBP($('cf-bp').value))run()})});
  craftOut();
}
function craftOut(){
  const st=store.get('craft',{}),b=findBP(st.bp),q=Math.max(1,st.qty||1),who=PARTY.find(c=>c.id===st.who);
  if(!b){$('cf-out').innerHTML=`<div class="empty" style="padding:30px"><b>Choose a Blueprint</b>Type its name above, or open any Blueprint and press “Plan crafting”.</div>`;return}
  const have=n=>{if(!who)return 0;const r=(who.inv||[]).find(x=>lc(x[0])===lc(n));return r?+r[1]||0:0};
  const C=craftCost(b,q,st.buy,have),total=C.buyGp,unsold=C.unsold;const missing=[];
  const rows=C.mats.map(({n,m,need,miss,unit,favor})=>{
    const h=have(n);if(miss)missing.push([n,miss]);
    const mons=m?(monByMat().get(lc(m.n))||[]).slice(0,3):[];
    const src=m?[mons.length?'Drops from '+mons.map(x=>refChip(x,esc(x.n),x.realm+' '+x.g)).join(' '):'',m.where?'Gathered at '+esc(m.where)+(m.by?' ('+esc(m.by)+')':''):'',m.price?'Sold by merchants':'Not sold'].filter(Boolean).join('<br>'):'Not in the materials list';
    const refine=m&&m.g>1?`${fmt(Math.pow(3,m.g-1)*need)} × ${esc(m.realm)} grade 1`:'';
    return `<tr><td>${m?refChip(m):esc(n)}${m&&m.tr?`<div style="font-size:.75rem;color:var(--gold2)">◆ ${esc(m.tr.n)}</div>`:''}</td><td>${m?esc(m.gr):''}</td><td class="num">${need}</td>${who?`<td class="num" style="color:${h>=need?'var(--green)':'var(--red)'}">${h}</td>`:''}<td class="num">${unit?gp(unit)+(st.buy&&m.realm===st.buy?' <small style="color:var(--green)">(native, ½)</small>':st.buy?' <small style="color:var(--red)">(foreign, ×2)</small>':''):favor?fav(favor):'—'}</td><td class="num">${unit&&miss?gp(unit*miss):favor&&miss?fav(favor*miss):'—'}</td><td style="font-size:.8rem;color:var(--text2)">${src}</td><td style="font-size:.78rem;color:var(--muted)">${refine?'or refine from '+refine:''}</td></tr>`;
  }).join('');
  const prof=who?hasProfession(who,b.pr):null,spec=who&&b.sp?(who.specs||[]).map(lc).includes(lc(b.sp)):null;
  const req=[`<b>${esc(b.pr)}</b>${b.sp&&b.sp!==b.pr?' · specialty <b>'+esc(b.sp)+'</b>':''} · level ${b.lv}`];
  if(who){req.push(prof?'<span class="b green">Has the profession</span>':'<span class="b red">Lacks the profession</span>');if(b.sp&&b.sp!==b.pr)req.push(spec?'<span class="b green">Has the specialty</span>':'<span class="b red">Crafts at disadvantage (outside their specialties)</span>')}
  if(/Infernal|Celestial|Void Smith/i.test(b.sp||''))req.push('<span class="b gold">Needs a smith with the matching realm specialty</span>');
  const traits=b.mats.map(findMat).filter(m=>m&&m.tr);
  $('cf-out').innerHTML=`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="font-size:1.25rem;margin:0">${refChip(b,esc(b.n))}</h4>${rarB(b.r)}<span class="b ghost">${esc(b.cat)}</span>${b.ac?`<span class="b">AC ${esc(b.ac)}</span>`:''}${b.dc?`<span class="b">${esc(b.dc)} ${esc(b.dm)}</span>`:''}</div>
    <div class="badges" style="gap:6px">${req.join('')}</div>
    ${craftCheckHTML(b,who)}
    <div class="tablewrap"><table class="t"><thead><tr><th>Material</th><th>Grade</th><th class="num">Need</th>${who?'<th class="num">Has</th>':''}<th class="num">Each</th><th class="num">To buy</th><th>Where to get it</th><th>Refining</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="out" style="margin:0"><div class="big">${costText(C.buyGp,C.buyFavor)}</div><div class="kv"><span>To make</span><span>${q} × ${esc(b.n)}</span><span>Still to buy</span><span>${missing.length?missing.map(([n,k])=>k+' × '+esc(n)).join(', '):'nothing, all materials on hand'}</span>
      <span>All materials</span><span>${costText(C.matGp,C.matFavor)}${st.buy?` <small style="color:var(--muted)">bought in the ${esc(st.buy)} Realm</small>`:''}</span>
      <span>Hired labor</span><span>${costText(C.laborGp,C.laborFavor)} <small style="color:var(--muted)">(${C.laborFavor?`paid in Favor for ${esc(C.deep)} materials: ${fmt(favorBase(realmPow(C.deep)))} a week, ${C.days} day${C.days>1?'s':''}`:'10 gp × level '+b.lv+(C.deep!=='Human'?' × '+fmt(realmBase(C.deep)/5)+' for '+esc(C.deep)+' materials':'')+' × '+C.days+' day'+(C.days>1?'s':'')}); nothing if a party member crafts it</small></span>
      <span>Blueprint</span><span>${costText(C.bpGp,C.bpFavor)} <small style="color:var(--muted)">if not already known</small></span>
      <span>Value when made</span><span><b>${costText(C.valueGp,C.valueFavor)}</b> <small style="color:var(--muted)">(twice the materials, plus labor)</small>${C.valueGp&&localPrice(C.valueGp,C.deep)?` · ${localPrice(C.valueGp,C.deep)}`:''}</span>
      ${unsold?'<span>Note</span><span>Some materials are not sold; they must be hunted, gathered, or traded.</span>':''}</div></div>
    ${traits.length?`<div><div class="blk"><h4>Traits when equipped</h4></div>${trListHTML(traits,gearKind(b))}</div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="copyShopping()">Copy shopping list</button>
      ${who&&!craftCheck(b,who).blocked?`<button class="btn primary" onclick="craftNow()">Craft it: use ${esc(who.name||'their')} materials and add to gear</button>`:''}
    </div></div>`;
  craftOut.missing=missing;
  if($('cf-forge'))$('cf-forge').onchange=e=>{const st=store.get('craft',{});st.forge=e.target.value;delete st.noShop;store.set('craft',st);craftOut()};
  if($('cf-roll'))$('cf-roll').onclick=craftRoll;
}
function copyShopping(){const st=store.get('craft',{});const t='Shopping list for '+st.bp+':\n'+(craftOut.missing||[]).map(([n,k])=>'- '+k+' × '+n).join('\n');(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Copied'),()=>toast('Copy failed'))}
// Crafting check, from the vault's Crafting Rules: d20 + profession bonus (half the profession level) vs a DC by rarity.
// Deeper realms add 5 to crafting and harvesting DCs per tier past the Human, in step with the profession bonus (half the
// profession level, about +5 a stage), so a crafter at a realm's own stage faces the same odds there as a Human crafter at home.
const realmDC=t=>5*Math.max(0,(t||1)-1);
const CRAFT_DC={Common:10,Uncommon:13,Rare:16,'Very Rare':19,Legendary:22,Artifact:25};
const CRAFT_TIME={Common:'about a day',Uncommon:'about a day',Rare:'about a week','Very Rare':'about a week',Legendary:'a month or more, at the DM\'s discretion, often with a story requirement (a special forge, a season, a witness)',Artifact:'a month or more, at the DM\'s discretion, often with a story requirement (a special forge, a season, a witness)'};
// Forge requirement: every Blueprint needs a workshop (its "forge") of a set grade, I to V. The grade is the
// highest of: its rarity, the stage of the realm its materials come from, and the stage of its own level.
const FORGE_STATION={Blacksmithing:'forge and anvil',Carving:'carving bench',Tailoring:'loom and tanning rack',Alchemy:'alchemy lab',Cooking:'kitchen hearth',Enchanting:'enchanting circle',Engineering:'engineering workshop',Navigation:'chart table and lens bench',Harvesting:'field kit',Scavenging:'butchering table'};
const FORGE_GRADES=[
  ['Common','Any town smithy or workshop. Rent one for 5 sp a day, or build your own for 50 gp.'],
  ['Guild','A city guild hall, or your own fitted out for 500 gp. It burns fuel from the realm the materials come from.'],
  ['Realm','Built inside that realm, or lined with its materials (5,000 gp), and fed its fuel.'],
  ['Great','A Tower forge, a temple forge, or a hall from legend. Found or earned, never bought.'],
  ['Primordial','One of a kind: a god\'s anvil, the first fire. Reaching it is a quest of its own.']];
const RAR_FORGE={Common:1,Uncommon:1,Rare:2,'Very Rare':3,Legendary:4,Artifact:5};
const REALM_FUEL={Human:'coal or charcoal',Mysterious:'moonwood charcoal',Hell:'brimstone',Heaven:'sunfire embers',Chaos:'wildfire',Abyss:'deep-vent heat','Inner Realm':'a clockwork furnace','Outer Realm':'starfire',Void:'null-flame','Inner Void':'a flame that burns nothing',Primordial:'the first fire'};
function forgeReq(b){const ms=(b.mats||[]).map(findMat).filter(Boolean),tierOf=m=>(REALM[m.realm]||{}).tier||1,top=ms.reduce((a,m)=>!a||tierOf(m)>tierOf(a)?m:a,null),mt=top?tierOf(top):1;
  const g=Math.min(MAX_STAGE,Math.max(RAR_FORGE[b.r]||1,tierStage(mt),stageOf(b.lv)));const realm=top?top.realm:'Human';
  return {g,station:FORGE_STATION[b.pr]||'workshop',realm,fuel:REALM_FUEL[realm]||'its own realm\'s fuel',name:FORGE_GRADES[g-1][0],how:FORGE_GRADES[g-1][1]}}
const forgeText=F=>`Grade ${ROMAN[F.g-1]} (${F.name}) ${F.station}${F.g>1?`, fuelled with ${F.fuel}`:''}`;
function craftCheck(b,who){
  const st=store.get('craft',{}),mt0=Math.max(1,...b.mats.map(n=>((REALM[(findMat(n)||{}).realm]||{}).tier||1))),dc=(CRAFT_DC[b.r]||10)+realmDC(mt0),lv=who?profLvIn(who,b.pr):null,bonus=lv!=null?Math.floor(lv/2)+peopleProf(who,b.pr):0;
  const hasProf=who?hasProfession(who,b.pr):null,hasSpec=who&&b.sp&&b.sp!==b.pr?(who.specs||[]).map(lc).includes(lc(b.sp)):true;
  const dis=[];if(who&&!hasSpec&&!(b.lv<=lv/2))dis.push('outside their specialties');const F=forgeReq(b),have=st.forge==null||st.forge===''?(st.noShop?0:F.g):+st.forge;let slow=false,fblock='';
  if(have<F.g){if(have===F.g-1){dis.push(have?`a grade ${ROMAN[have-1]} ${F.station}, one below the grade ${ROMAN[F.g-1]} it needs`:'no proper workspace or tools');slow=true}else fblock=`It needs a grade ${ROMAN[F.g-1]} ${F.station} (${F.name}); ${have?'a grade '+ROMAN[have-1]+' one':'working without one'} is too far below. ${F.how}`}
  const mt=Math.max(1,...b.mats.map(n=>((REALM[(findMat(n)||{}).realm]||{}).tier||1)));
  const blocked=who?(!hasProf?'They don\'t have the '+b.pr+' profession.':lv<b.lv?`Their ${b.pr} level (${lv}) is below the Blueprint's level (${b.lv}); they can't attempt it.`:stageOf(lv)<tierStage(mt)?`Its materials come from a tier-${mt} realm (${TIER_NAMES(mt)}); working them needs ${b.pr} stage ${ROMAN[tierStage(mt)-1]} (level ${stageStart(tierStage(mt))}+), and ${esc(who.name||'they')} ${lv?'are at stage '+stageOf(lv):'have no levels'}.`:''):'';
  return {dc,lv,bonus,dis,blocked:blocked||fblock,mt,F,have,time:(CRAFT_TIME[b.r]||'about a day')+(slow?', doubled for working at a lesser forge':'')};
}
function craftCheckHTML(b,who){
  const c=craftCheck(b,who),st=store.get('craft',{});
  return `<div class="callout" style="border-color:var(--gold)"><b>Crafting check</b>: d20 ${who?`+ ${c.bonus} (${esc(who.name||'crafter')}, ${esc(b.pr)} level ${c.lv})`:'+ profession bonus (half the profession level)'} vs <b>DC ${c.dc}</b> (${esc(b.r||'Common')})${tierStage(c.mt)>1?` · needs ${esc(b.pr)} stage ${ROMAN[tierStage(c.mt)-1]} (level ${stageStart(tierStage(c.mt))}+) for its ${esc(TIER_NAMES(c.mt))} materials`:''}${c.dis.length?` at <b>disadvantage</b> (${esc(c.dis.join('; '))})`:''}. Time: ${esc(c.time)}.
    <div style="margin-top:4px">🔥 <b>Forge needed:</b> ${esc(forgeText(c.F))}. <span class="note" style="margin:0">${esc(c.F.how)}</span></div>
    ${c.blocked?`<div style="color:var(--red);margin-top:4px"><b>Can't craft:</b> ${esc(c.blocked)}</div>`:''}
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px"><label class="note" style="display:flex;gap:6px;align-items:center;margin:0">Your forge<select class="sel" id="cf-forge"><option value=""${st.forge==null||st.forge===''?' selected':''}>The right one (grade ${ROMAN[c.F.g-1]})</option><option value="0"${st.forge==='0'?' selected':''}>None</option>${ROMAN.map((r,k)=>`<option value="${k+1}"${st.forge===String(k+1)?' selected':''}>Grade ${r}: ${FORGE_GRADES[k][0]}</option>`).join('')}</select></label>${!c.blocked?`<button class="btn" id="cf-roll">🎲 Roll the crafting check</button>`:''}<span id="cf-res"></span></div>
    <div class="note" style="margin:6px 0 0">Success: the item is finished and its materials are used. Failure: nothing is lost; try again. Natural 1: the materials are ruined. Natural 20: a maker's flourish.</div></div>`;
}
function craftRoll(){
  const st=store.get('craft',{}),b=findBP(st.bp),who=PARTY.find(c=>c.id===st.who),c=craftCheck(b,who);
  const r1=1+Math.floor(Math.random()*20),r2=1+Math.floor(Math.random()*20),d=c.dis.length?Math.min(r1,r2):r1,tot=d+c.bonus;
  const res=d===1?['red','Natural 1: the attempt fails and the materials are ruined.','ruin']:tot>=c.dc?['green',(d===20?'Natural 20! ':'')+'Success: '+b.n+' is finished.','ok']:['gold','Failure: nothing is lost; try again.',''];
  $('cf-res').innerHTML=`<b>${d}${c.dis.length?` <small>(${r1}, ${r2})</small>`:''} + ${c.bonus} = ${tot}</b> vs DC ${c.dc}: <span style="color:var(--${res[0]})">${esc(res[1])}</span>${who&&res[2]==='ok'?` <button class="btn primary" onclick="craftNow(true)">Use materials, add to gear</button>`:''}${who&&res[2]==='ruin'?` <button class="btn" onclick="craftRuin()">Remove the ruined materials</button>`:''}`;
}
function craftRuin(){const st=store.get('craft',{}),b=findBP(st.bp),q=Math.max(1,st.qty||1),c=PARTY.find(x=>x.id===st.who);if(!b||!c)return;c.inv=(c.inv||[]).map(([n,k])=>b.mats.some(x=>lc(x)===lc(n))?[n,Math.max(0,(+k||0)-q)]:[n,k]).filter(([,k])=>k>0);saveParty();toast('Ruined materials removed');craftOut()}
function craftNow(rolled){
  const st=store.get('craft',{}),b=findBP(st.bp),q=Math.max(1,st.qty||1),c=PARTY.find(x=>x.id===st.who);if(!b||!c)return;
  {const chk=craftCheck(b,c);if(chk.blocked){toast("Can't craft: "+chk.blocked);return}}
  if((craftOut.missing||[]).length&&!confirm('Some materials are missing. Craft anyway (only if the DM agrees) and use what is on hand?'))return;
  c.inv=(c.inv||[]).map(([n,k])=>b.mats.some(x=>lc(x)===lc(n))?[n,Math.max(0,(+k||0)-q)]:[n,k]).filter(([,k])=>k>0);
  c.gear=(c.gear||[]).concat(Array(q).fill(b.n));saveParty();toast(b.n+' added to '+(c.name||'character')+'\'s gear');craftOut();
}

// ── Party ─────────────────────────────────────────────────────
let PARTY_SEL=null;
// ════════════════════════════════════════════════════════════════
//  Character sheet: the classic three pages (core, details, spells), filled in with FAND's rules
// ════════════════════════════════════════════════════════════════
const ABIL=[['str','Strength'],['dex','Dexterity'],['con','Constitution'],['int','Intelligence'],['wis','Wisdom'],['cha','Charisma']];
const SKILLS=[['acrobatics','Acrobatics','dex'],['animal','Animal Handling','wis'],['arcana','Arcana','int'],['athletics','Athletics','str'],['deception','Deception','cha'],['history','History','int'],['insight','Insight','wis'],['intimidation','Intimidation','cha'],['investigation','Investigation','int'],['medicine','Medicine','wis'],['nature','Nature','int'],['perception','Perception','wis'],['performance','Performance','cha'],['persuasion','Persuasion','cha'],['religion','Religion','int'],['sleight','Sleight of Hand','dex'],['stealth','Stealth','dex'],['survival','Survival','wis']];
const CLASS_DIE={Barbarian:12,Fighter:10,Paladin:10,Ranger:10,Artificer:8,Bard:8,Cleric:8,Druid:8,Monk:8,Rogue:8,Warlock:8,Sorcerer:6,Wizard:6};
const CLASS_SAVES={Barbarian:['str','con'],Bard:['dex','cha'],Cleric:['wis','cha'],Druid:['int','wis'],Fighter:['str','con'],Monk:['str','dex'],Paladin:['wis','cha'],Ranger:['str','dex'],Rogue:['dex','int'],Sorcerer:['con','cha'],Warlock:['wis','cha'],Wizard:['int','wis'],Artificer:['con','int']};
// Steady Growth (campaign owner's rule): the levels a class table marks "Steady Growth" (2, 4, 6–9, 11–14 and 16–19 of
// every 20-level stage) each raise the class's main stat by 2, or its two main stats by 1 each. Hidden classes (bonus
// classes) add their own on their own class levels: Unique its named stats, Epic 4 points, Legendary 5, spent freely.
const CLASS_MAIN={Artificer:['int'],Barbarian:['str'],Bard:['cha'],Cleric:['wis'],Druid:['wis'],Fighter:['str','dex'],Monk:['dex','wis'],Paladin:['str','cha'],Ranger:['dex','wis'],Rogue:['dex'],Sorcerer:['cha'],Warlock:['cha'],Wizard:['int']};
const STEADY_AT=[2,4,6,7,8,9,11,12,13,14,16,17,18,19];
const isSteady=L=>STEADY_AT.includes(((L-1)%20)+1);
const steadyCount=L=>{let n=0;for(let l=2;l<=L;l++)if(isSteady(l))n++;return n};
const growthOf=cls=>{const m=CLASS_MAIN[cls]||[];return m.length===1?{[m[0]]:2}:Object.fromEntries(m.map(k=>[k,1]))};
const growthText=g=>Object.entries(g).map(([k,v])=>'+'+v+' '+k.toUpperCase()).join(', ');
const hcGrowthText=c=>c.tier==='Unique'&&c.grow?growthText(c.grow)+' (set by this class)':c.tier==='Epic'?'4 ability points to spend':c.tier==='Legendary'?'5 ability points to spend':'';
const CAST_ABIL={Bard:'cha',Paladin:'cha',Sorcerer:'cha',Warlock:'cha',Cleric:'wis',Druid:'wis',Ranger:'wis',Wizard:'int',Artificer:'int'};
const mod=v=>Math.floor(((+v||10)-10)/2),sgn=n=>(n>=0?'+':'')+n;
// Proficiency: the usual +2 to +6 through level 20, then +1 more with each class change (a website proposal).
const profBonus=L=>(L=+L||1)<=20?2+Math.floor((L-1)/4):6+(stageOf(L)-1);
let SHEET_ID=null,SHEET_TAB='core';
// Print blank sheet: the sheet drawn for an empty character that is never saved, every field cleared, for the table
let SHEET_BLANK=false;
function sheetChar(){if(SHEET_BLANK)return sheetChar.blank||(sheetChar.blank={id:'blank',name:'',level:1,gear:[],inv:[],abil:{}});let c=PARTY.find(x=>x.id===SHEET_ID)||PARTY[0];if(!c){c={id:uid(),name:'',level:1,gear:[],inv:[]};PARTY.push(c);saveParty()}SHEET_ID=c.id;return c}
const getP=(o,path)=>path.split('.').reduce((a,k)=>a==null?a:a[k],o);
function setP(o,path,v){const ks=path.split('.');let a=o;ks.slice(0,-1).forEach(k=>{if(a[k]==null||typeof a[k]!=='object')a[k]={};a=a[k]});a[ks[ks.length-1]]=v}
function sheetApprove(lv,i,on){if(!HC)return;const c=sheetChar(),n=((c.spells||{})[lv]||[])[i];if(!n)return;c.dmOk=c.dmOk||{};if(on)c.dmOk[lc(n)]=1;else delete c.dmOk[lc(n)];saveParty();hcLog(true,(on?'approved ':'revoked ')+n+' for '+(c.name||'a character'));renderSheet()}
// a character's spell slots by level ({1:4, 2:3, …}; a Warlock's pact slots at their level)
function slotTotals(c){const L=+c.level||1,L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,sl=mcSlots(c,L-L2,L2);if(!sl)return {};
  return sl.pact?{[({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[sl.lvl]||1)]:sl.n}:Object.fromEntries((sl.slots||[]).map((n,i)=>[i+1,n]))}
// Cast from the sheet: a caster in armor they aren't trained for rolls the failure check first (a fizzle still spends the
// slot); then the spell's dice are rolled, and a levelled spell ticks the lowest free slot of its level or higher
function sheetCast(lv,i){const c=sheetChar(),n=((c.spells||{})[lv]||[])[i],sp=n&&spByName(n);if(!sp)return;const CA=charStats(c).castArm;
  let paid=0;if(lv>0){const tot=slotTotals(c);c.slotUsed=c.slotUsed||{};for(const l of Object.keys(tot).map(Number).filter(l=>l>=lv).sort((a,b)=>a-b)){const u=c.slotUsed[l]||{};for(let k=0;k<tot[l];k++)if(!u[k]){u[k]=true;c.slotUsed[l]=u;paid=l;break}if(paid)break}
    if(!paid){toast('No free slot of level '+lv+' or higher is left: untick one if the sheet is behind');return}}
  const slot=paid?' (level '+paid+' slot)':'';
  if(CA){const r=1+Math.floor(Math.random()*20);if(r<=CA.fail){saveParty();renderSheet();rollToast(`${n} fizzles${slot}: d20 rolled ${r}, needed ${CA.fail+1} or higher (casting in armor)`);return}
    toast(`Armor check passed: d20 rolled ${r} (needed ${CA.fail+1}+)`)}
  saveParty();renderSheet();
  const bd=((c.spBound||{})[lc(n)])||spellHome(sp)||'Human',FO=focusOf(c),d=spellScales(sp)?focusDice(spellAt(spellDmg(sp),spellPow(c,bd,sp)),{dmg:focusFor(FO,sp).dmg}):'';
  const expr=(String(d).match(/\d+d\d+(?:\s*\+\s*\d+)*/)||[''])[0].replace(/\s+/g,'');
  if(expr)rollShow(expr,n+slot);else toast(`${n} cast${slot}`)}
const rollToast=s=>toast(s);
function sheetMageArmor(on){const c=sheetChar();if(on)delete c.noMageArmor;else c.noMageArmor=true;saveParty();renderSheet()}
function sheetBind(lv,i,rn){const c=sheetChar(),n=((c.spells||{})[lv]||[])[i];if(!n)return;c.spBound=c.spBound||{};c.spBound[lc(n)]=rn;saveParty();renderSheet()}
// Attunement (owner's choice, 2026-11-06): after a week in a realm, or a ritual at a temple or Magic Tower there, a caster
// attunes to it and rebinds spells they already know to it for free: as many as their proficiency bonus at once, then one
// more after each long rest in that realm (up to twice the bonus banked). Rune spells stay bound to their own realm.
const attuneOf=(c,rn)=>c&&c.attuned&&c.attuned[rn]||null;
function sheetAttune(){const c=sheetChar();if(!c)return;const rn=c.here||'Human';c.attuned=c.attuned||{};if(c.attuned[rn])return;const pb=profBonus(+c.level||1);
  c.attuned[rn]={pts:pb,d:new Date().toISOString().slice(0,10)};c.log=(c.log||[]).concat({d:c.attuned[rn].d,deed:'Attuned to the '+rn+' Realm'});saveParty();renderSheet();toast((c.name||'They')+' attuned to the '+rn+': '+pb+' free rebinds, and one more after each long rest here')}
function sheetRebind(lv,i){const c=sheetChar(),n=((c.spells||{})[lv]||[])[i],rn=c.here||'Human',A=attuneOf(c,rn);if(!n||!A||A.pts<1)return;const sp=SP.find(x=>lc(x.n)===lc(n));if(sp&&spellHome(sp))return;
  c.spBound=c.spBound||{};const was=c.spBound[lc(n)]||'Human';c.spBound[lc(n)]=rn;A.pts--;saveParty();renderSheet();toast(n+' now works in the '+rn+' (was the '+was+')'+(A.pts?' · '+A.pts+' rebind'+(A.pts>1?'s':'')+' left':''))}
function sheetHere(rn){const c=sheetChar();c.here=rn;saveParty();renderSheet()}
// the character's hidden classes, copied onto the sheet when the DM grants them (so the player can read them without the
// lock). A character can hold several; DM-only actions appear only with the list unlocked.
const hcList=c=>Array.isArray(c.hcls)?c.hcls:c.hcls?[c.hcls]:[];
function hcOneHTML(h,i,L){const hl=hcLevelAt(L,h.lv0),n=hcSteady(hl),p=n-(h.ga||0),pts=h.tier==='Epic'?4:h.tier==='Legendary'?5:0,hk=stageOf(hl),hname=h.n+(hk>1?' '+ROMAN[hk-1]:'')+(h.ba?' · '+h.ba.n+(h.bb?' / '+h.bb.n:''):'');
  return `<div style="${i?'border-top:1px solid var(--line);margin-top:10px;padding-top:10px':''}"><div class="sh-row" style="gap:10px;flex-wrap:wrap;align-items:baseline"><b style="font-family:var(--serif);font-size:1.15rem">${esc(hname)}</b><span class="b">${esc(h.tier)}</span><span><b>Class level ${hl}</b> of ${HC_MAX}${hl<HC_MAX?` <small style="color:var(--muted)">(unlocked at level ${h.lv0}; one level each time you level up)</small>`:' <small style="color:var(--gold2)">(maxed)</small>'}</span>${HC?`<span style="margin-left:auto;cursor:pointer;color:var(--muted);font-size:.8rem" onclick="sheetHcRemove(${i})">remove (DM)</span>`:''}</div>
    ${(()=>{const br=hcBranchRows(h,i,hl,L);return br.pick+`<div class="mlist" style="margin-top:6px">${h.track.map(([lv,nm,t])=>[lv,nm,t,'']).concat(br.rows).sort((x,y)=>x[0]-y[0]).map(([lv,nm,t,tag])=>{const got=hl>=lv;return `<div class="sh-feat" style="padding:5px 0;${got?'':'opacity:.5'}"><b>Class level ${lv}: ${esc(nm)}</b>${tag?` <span class="b ghost">${esc(tag)}</span>`:''}${got?'':' <small>(not yet)</small>'}<div>${esc(got&&!/^Class change/.test(nm)?hcScale(t,L,hl):t)}</div></div>`}).join('')}</div>`})()}
    <div class="note" style="margin:6px 0 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span><b>Steady Growth</b> ${h.grow?esc(growthText(h.grow)):pts+' points to spend'} at class levels 2, 4, 6–9, 11–14, 16–19 of every 20 · ${n} reached${p>0?` · <b style="color:var(--gold2)">${p} not yet ${h.grow?'added':'spent'}</b>`:''}</span>${p>0?`<button class="btn" type="button" onclick="sheetHcGrow(${i})">${h.grow?'Add '+esc(growthText(Object.fromEntries(Object.entries(h.grow).map(([k,v])=>[k,v*p])))):'Mark '+(pts*p)+' points spent'}</button>`:''}</div></div>`}
// subclasses of a hidden class: pick 1 of 3 at class level 5, then 1 of its 3 at class level 15; the end path gains a
// feature every 10 levels after. The pick is copied onto the character, so a shared sheet shows it without the list.
const HC_BR=[5,15];
const hcBranchesOf=h=>{const x=HC&&HC.find(y=>y.n===h.n);return x&&x.branches||null};
function hcBranchRows(h,i,hl,L){const rows=[];if(h.ba)rows.push([HC_BR[0],h.ba.f[0],h.ba.f[1],h.ba.n]);if(h.bb){rows.push([HC_BR[1],h.bb.f[0],h.bb.f[1],h.bb.n]);(h.bb.later||[]).forEach(([lv,nm,t])=>rows.push([lv,nm,t,h.bb.n]))}
  const B=hcBranchesOf(h),pick=(opts,lv)=>`<div class="callout" style="margin:6px 0;border-color:var(--gold)"><b>Class level ${lv}: choose a subclass</b>${opts?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${opts.map((o,k)=>`<button class="btn" type="button" title="${esc(o.d)}" onclick="sheetHcBranch(${i},${k})"><b>${esc(o.n)}</b></button>`).join('')}</div><div class="note" style="margin:4px 0 0">${opts.map(o=>`<b>${esc(o.n)}:</b> ${esc(o.d)}`).join('<br>')}</div>`:'<div class="note" style="margin:4px 0 0">Unlock the hidden class list on this device to see the choices.</div>'}</div>`;
  let p='';if(hl>=HC_BR[0]&&!h.ba&&(B||!HC))p=pick(B,HC_BR[0]);
  else if(hl>=HC_BR[1]&&h.ba&&!h.bb){const b=B&&B.find(b=>b.n===h.ba.n);if(b||!HC)p=pick(b&&b.kids,HC_BR[1])}
  return {rows,pick:p}}
function sheetHcBranch(i,k){if(!HC)return;const c=sheetChar(),list=hcList(c),h=list[i],B=h&&hcBranchesOf(h);if(!B)return;
  const opts=!h.ba?B:(B.find(b=>b.n===h.ba.n)||{}).kids;const o=opts&&opts[k];if(!o||!confirm('Choose '+o.n+' for '+h.n+'? This cannot be changed.'))return;
  if(!h.ba)h.ba={n:o.n,f:o.f};else h.bb={n:o.n,f:o.f,later:o.later};c.hcls=list;saveParty();hcLog(true,'chose '+o.n+' for '+h.n+' on '+(c.name||'a character'));renderSheet()}
// a renamed class keeps its first name in 'was': a character who holds it under the old name gets the new one
function hcRename(c){if(!HC)return;let ch=false;hcList(c).forEach(h=>{if(HC.some(x=>x.n===h.n))return;const x=HC.find(x=>x.was===h.n);if(x){h.n=x.n;ch=true}});if(ch){if(!Array.isArray(c.hcls))c.hcls=hcList(c);saveParty()}}
function hcSheetHTML(c,L){hcRename(c);const list=hcList(c),names=list.map(h=>h.n);
  const fusable=HC?HC.filter(x=>x.combo&&x.combo.every(n=>names.includes(n))&&!names.includes(x.n)):[];
  return `${list.length?list.map((h,i)=>hcOneHTML(h,i,L)).join(''):'<div class="note" style="margin:0">None yet. Hidden classes are earned in the Towers; the DM grants them here.</div>'}
    ${fusable.map(x=>`<div class="callout" style="margin-top:10px;border-color:var(--red)">✦ <b>${esc(x.n)}</b> can be formed from ${x.combo.map(esc).join(' + ')}. <button class="btn primary" type="button" onclick="sheetHcFuse(${HC.indexOf(x)})">Fuse (DM)</button></div>`).join('')}
    ${HC?`<div class="keyrow" style="margin-top:10px;flex-wrap:wrap"><input class="sel" id="sh-hc" list="dl-hc" placeholder="${list.length?'Grant another hidden class…':'Hidden class…'}" style="max-width:none;flex:1;min-width:180px"><datalist id="dl-hc">${HC.filter(x=>!names.includes(x.n)).map(x=>`<option value="${esc(x.n)}">${esc(x.tier)}${x.corpse?' · corpse':''}${x.combo?' · fusion':''}</option>`).join('')}</datalist><label class="note" style="margin:0;display:flex;gap:6px;align-items:center">unlocked at level <input class="sel" id="sh-hclv" type="number" min="1" max="${MAX_LEVEL}" value="${L}" style="width:70px"></label><button class="btn" type="button" onclick="sheetHcGrant()">Grant (DM)</button></div>`:''}`}
const hcEntry=(x,lv0)=>({n:x.n,tier:x.tier,lv0,track:hcTrack(x),grow:x.tier==='Unique'&&x.grow?x.grow:null,ga:0});
function sheetHcGrant(){if(!HC)return;const c=sheetChar(),x=HC.find(y=>lc(y.n)===lc($('sh-hc').value.trim()));if(!x){toast('Pick a hidden class from the list');return}
  const list=hcList(c);if(list.some(h=>h.n===x.n)){toast('Already held');return}const lv0=Math.max(1,Math.min(MAX_LEVEL,+$('sh-hclv').value||+c.level||1));
  c.hcls=list.concat(hcEntry(x,lv0));saveParty();hcLog(true,'granted '+x.n+' to '+(c.name||'a character'));renderSheet()}
// fusing: the Epic classes merge into the Legendary, which keeps the highest class level among them
function sheetHcFuse(k){if(!HC)return;const c=sheetChar(),x=HC[k],list=hcList(c);if(!x||!x.combo)return;const parts=list.filter(h=>x.combo.includes(h.n));if(parts.length<x.combo.length)return;
  if(!confirm('Fuse '+x.combo.join(' + ')+' into '+x.n+'? The three classes become one.'))return;const lv0=Math.min(...parts.map(h=>h.lv0));
  c.hcls=list.filter(h=>!x.combo.includes(h.n)).concat(hcEntry(x,lv0));saveParty();hcLog(true,'fused '+x.n+' for '+(c.name||'a character'));toast(x.n+' formed');renderSheet()}
function sheetHcRemove(i){if(!HC)return;const c=sheetChar(),list=hcList(c),h=list[i];if(!h)return;hcLog(true,'removed '+h.n+' from '+(c.name||'a character'));c.hcls=list.filter((_,j)=>j!==i);saveParty();renderSheet();undoToast(h.n+' removed',()=>{c.hcls=list;saveParty();hcLog(true,'put back '+h.n+' on '+(c.name||'a character'));if(TAB==='sheet')renderSheet()})}
function sheetHcGrow(i){const c=sheetChar(),list=hcList(c),h=list[i];if(!h)return;const n=hcSteady(hcLevelAt(+c.level||1,h.lv0)),p=n-(h.ga||0);if(p<=0)return;if(h.grow){c.abil=c.abil||{};Object.entries(h.grow).forEach(([k,v])=>{c.abil[k]=(+c.abil[k]||10)+v*p})}h.ga=n;c.hcls=list;saveParty();renderSheet();toast(h.grow?'Hidden class growth added':'Points marked as spent')}
function sheetGrow(){const c=sheetChar(),L=+c.level||1,L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,n=steadyCount(L-L2),p=n-(c.growApplied||0),n2=c.cls2?steadyCount(L2):0,p2=n2-(c.growApplied2||0);if((p<=0||!CLASS_MAIN[c.cls])&&(p2<=0||!CLASS_MAIN[c.cls2]))return;c.abil=c.abil||{};if(p>0&&CLASS_MAIN[c.cls]){Object.entries(growthOf(c.cls)).forEach(([k,v])=>{c.abil[k]=(+c.abil[k]||10)+v*p});c.growApplied=n}if(p2>0&&CLASS_MAIN[c.cls2]){Object.entries(growthOf(c.cls2)).forEach(([k,v])=>{c.abil[k]=(+c.abil[k]||10)+v*p2});c.growApplied2=n2}saveParty();renderSheet();toast('Steady Growth added')}
// Share a character: the whole sheet packed into a link (compressed, base64url) that opens this page on another device and
// offers to add it there. Nothing is uploaded; the link itself carries the character. A QR code shows the same link.
const b64u=u=>btoa(String.fromCharCode(...u)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),ub64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function packChar(c){const raw=new TextEncoder().encode(JSON.stringify(c));if(typeof CompressionStream==='undefined')return 'j'+b64u(raw);const z=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());return 'z'+b64u(z)}
async function unpackChar(s){const u=ub64(s.slice(1));const raw=s[0]==='z'?new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()):u;return JSON.parse(new TextDecoder().decode(raw))}
function loadQR(){return window.qrcode?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/qrcode.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
async function shareChar(){const c=sheetChar(),url=location.href.split('#')[0]+'#/sheet?char='+(await packChar(c)),name=c.name||'this character';
  let qr='';try{await loadQR();if(url.length<=2800){const q=qrcode(0,'L');q.addData(url);q.make();qr=q.createSvgTag({cellSize:4,margin:3,scalable:true}).replace('<svg ','<svg style="width:100%;height:auto;display:block" ')}}catch(e){}
  $('qBox').innerHTML=`<div class="mh"><div class="kind">Share</div><h2 id="qTitle">${esc(name)}</h2><div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div>
    <div class="mb" style="text-align:center">${qr?`<div style="background:#fff;padding:10px;border-radius:10px;max-width:300px;margin:0 auto">${qr}</div><p class="note">Scan it with the other phone's camera. It opens FAND there and offers to add ${esc(name)}.</p>`:`<p class="note">This sheet is too big for a QR code (${fmt(url.length)} characters); send the link instead.</p>`}
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn primary" type="button" id="sh-copy">Copy link</button>${navigator.share?'<button class="btn" type="button" id="sh-send">Send…</button>':''}</div>
    <p class="note" style="margin:0">The link carries the whole sheet (nothing is uploaded). Anyone with it can add a copy of ${esc(name)}; sending it again later updates their copy.</p></div>`;
  $('qbg').classList.add('open');
  $('sh-copy').onclick=()=>(navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>toast('Link copied'),()=>toast('Copy failed'));
  if($('sh-send'))$('sh-send').onclick=()=>navigator.share({title:'FAND: '+name,url}).catch(()=>{});
}
async function importSharedChar(code){try{const c=await unpackChar(code);if(!c||typeof c!=='object'||!c.id)throw 0;delete c.camp;delete c._by;delete c._cs;const old=PARTY.find(x=>x.id===c.id);
  if(confirm(old?`Update ${c.name||'this character'} on this device with the shared copy? The copy here is replaced.`:`Add ${c.name||'the shared character'}${c.cls?' ('+c.cls+' '+(c.level||1)+')':''} to this device?`)){if(old)Object.assign(old,c);else PARTY.push(c);saveParty();SHEET_ID=c.id;toast((c.name||'Character')+(old?' updated':' added'))}}
  catch(e){toast('That share link is damaged or incomplete')}history.replaceState(null,'',hashFor('sheet'));renderSheet()}
window.addEventListener('hashchange',()=>{const sc=parseHash().params.get('char');if(sc&&TAB==='sheet'&&renderSheet._imp!==sc){renderSheet._imp=sc;importSharedChar(sc)}});
// The printed blank sheet's FAND page: every homebrew box, ready to fill in by hand
function blankFandHTML(){const ln=(l,w='')=>`<div class="sh-bl"><span>${l}</span><i style="${w}"></i></div>`,box=(t,inner)=>`<div class="sh-box">${inner}<div class="sh-lab">${t}</div></div>`,
  tbl=(cols,rows)=>`<table class="t sh-t sh-bt"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${Array.from({length:rows},()=>`<tr>${cols.map(()=>'<td></td>').join('')}</tr>`).join('')}</tbody></table>`;
  return `<div class="sh-cols" style="grid-template-columns:1fr 1fr">
    <div class="sh-col">
      ${box('Stage &amp; realms',ln('Stage (I to V)')+ln('Class change name (e.g. Ranger II)')+ln('Realms this stage opens')+ln('Attunement')+ln('Strain (realm Pressure − Attunement)'))}
      ${box('Steady Growth',ln('Main stat(s) and gain per level')+ln('Steady Growth levels reached')+ln('Already added to the scores'))}
      ${box('Accomplishments (milestone levelling)',tbl(['Deed','Level gained'],6))}
      ${box('Profession',ln('Profession and level')+ln('Stage and title (e.g. Hellforger)')+ln('Specialties')+ln('Profession XP / XP for next level')+ln('Stage features'))}
      ${box('Schools of magic',tbl(['School','Mastery','Highest spell level'],4)+ln('School points spent / level')+ln('Casting in (realm): spells work only where they were learnt'))}
      ${box('Custom skills',tbl(['Skill','Ability','Bonus'],4))}
    </div>
    <div class="sh-col">
      ${box('Contracts with the gods',tbl(['God','Rank','Natural AC','Discount','Favor'],3)+ln('Contract spells (by rank)'))}
      ${box('Hidden classes (bonus)',tbl(['Class','Tier','Unlocked at','Class level','Subclass (5)','Path (15)'],3)+ln('Steady Growth points not yet spent'))}
      ${box('Undead servants <small>(summoning classes only)</small>',ln('Summon slots (one per point of INT) / used')+tbl(['Servant','Type','% kept','HP','AC','Upkeep','⛓'],6))}
      ${box('Materials &amp; Rune stones carried',tbl(['Material','Realm and grade','Qty'],6))}
      ${box('Money by realm',ln('Human / Mysterious')+ln('Hell / Heaven / Chaos')+ln('Abyss and deeper'))}
      <div class="note">FAND rules on page 1: AC = gear + CON modifier (×1) + contract; saving throws add no ability modifier or proficiency, only bonuses from abilities and equipment; skill rolls use the skill's bonus only, never skill + ability modifier; the ability modifier is only for a basic action no skill covers.</div>
    </div></div>`}
// ── Character wizard: a step-by-step guide for someone who has never made a character ──
// Each answer is in plain words; the wizard works out scores, hit points, skills, and gear, then opens the finished sheet.
const CW_CLASS={
  Fighter:{t:'A trained warrior who can use any weapon and armor.',play:'Hit things, protect friends, and stay standing.',easy:1,o:['str','con','dex','wis','int','cha'],sk:['athletics','perception'],pr:'All armor and shields; simple and martial weapons',kit:'Chain mail, longsword and shield, light crossbow with 20 bolts, dungeoneer\'s pack',gp:10,f:'Fighting Style: pick one way of fighting you are best at.\nSecond Wind: as a bonus action, heal 1d10 + your Fighter level; once per short or long rest.'},
  Barbarian:{t:'A fierce fighter who flies into a rage in battle.',play:'Charge in, take hits, and deal big damage.',easy:1,o:['str','con','dex','wis','cha','int'],sk:['athletics','survival'],pr:'Light and medium armor, shields; simple and martial weapons',kit:'Greataxe, two handaxes, four javelins, explorer\'s pack',gp:10,f:'Rage: as a bonus action, a few times per long rest, for 1 minute: extra melee damage, advantage on Strength checks and saves, and resistance to bludgeoning, piercing, and slashing damage. No spellcasting while raging.\nUnarmored Defense: tough even without armor (Dexterity and Constitution keep you safe).'},
  Rogue:{t:'A quick, sneaky expert who strikes from the shadows.',play:'Sneak, pick locks, find traps, and land deadly hits.',easy:1,o:['dex','con','int','wis','cha','str'],sk:['stealth','acrobatics'],pr:'Light armor; simple weapons, hand crossbows, longswords, rapiers, shortswords; thieves\' tools',kit:'Rapier, shortbow with 20 arrows, leather armor, two daggers, thieves\' tools, burglar\'s pack',gp:15,f:'Sneak Attack: once a turn, add 1d6 damage to a hit with a finesse or ranged weapon when you have advantage, or an ally is next to the target.\nExpertise: your proficiency bonus counts double for two skills (or one skill and thieves\' tools).\nThieves\' Cant: a secret language of hints and signs.'},
  Cleric:{t:'A priest whose god grants healing and holy magic.',play:'Heal your friends, protect them, and smite the wicked.',easy:1,o:['wis','con','str','dex','cha','int'],sk:['medicine','religion'],pr:'Light and medium armor, shields; simple weapons',kit:'Mace, scale mail, shield, light crossbow with 20 bolts, holy symbol, priest\'s pack',gp:15,f:'Spellcasting (Wisdom): prayers that heal and protect.\nDivine Domain: the part of your god\'s power you serve (in FAND you choose it at level 3).'},
  Ranger:{t:'A hunter and tracker of the wild places.',play:'Shoot from range, track prey, and guide the party.',o:['dex','wis','con','str','int','cha'],sk:['survival','perception'],pr:'Light and medium armor, shields; simple and martial weapons',kit:'Longbow with 20 arrows, two shortswords, scale mail, explorer\'s pack',gp:10,f:'Favored Enemy: one kind of creature you know well: advantage on Survival checks to track it and on Intelligence checks to recall facts about it, and you learn one of its languages.\nNatural Explorer: in one favored kind of terrain you travel and forage better and can\'t get lost by non-magical means.'},
  Paladin:{t:'A holy knight bound by a sacred oath.',play:'Wear heavy armor, heal with a touch, and hit with holy power.',o:['str','cha','con','wis','dex','int'],sk:['athletics','persuasion'],pr:'All armor and shields; simple and martial weapons',kit:'Longsword and shield, five javelins, chain mail, holy symbol, priest\'s pack',gp:10,f:'Divine Sense: feel the presence of the holy and the unholy nearby.\nLay on Hands: a pool of healing equal to 5 × your Paladin level, given by touch as an action; it refills on a long rest. You can spend 5 points to cure a disease or poison instead.'},
  Monk:{t:'A martial artist who fights with fists and focus.',play:'Move fast, strike many times, and dodge everything.',o:['dex','wis','con','str','int','cha'],sk:['acrobatics','insight'],pr:'Simple weapons and shortswords; no armor',kit:'Shortsword, ten darts, explorer\'s pack',gp:5,f:'Martial Arts: unarmed strikes and monk weapons can use Dexterity and deal your Martial Arts die; after you take the Attack action, make one unarmed strike as a bonus action.\nUnarmored Defense: hard to hit without armor.'},
  Wizard:{t:'A scholar who learns magic from books.',play:'Cast the widest range of spells; stay behind the fighters.',o:['int','con','dex','wis','cha','str'],sk:['arcana','investigation'],pr:'Daggers, darts, slings, quarterstaffs, light crossbows',kit:'Quarterstaff, spellbook, arcane focus, scholar\'s pack',gp:10,f:'Spellcasting (Intelligence): spells written in your spellbook.\nArcane Recovery: once a day, after a short rest, regain spell slots whose levels add up to half your Wizard level (rounded up), none of 6th level or higher.'},
  Sorcerer:{t:'Magic runs in your blood.',play:'Fewer spells than a wizard, but bent and boosted at will.',o:['cha','con','dex','wis','int','str'],sk:['arcana','persuasion'],pr:'Daggers, darts, slings, quarterstaffs, light crossbows',kit:'Light crossbow with 20 bolts, arcane focus, two daggers, dungeoneer\'s pack',gp:10,f:'Spellcasting (Charisma): magic you were born with.\nSorcerous Origin: where your power comes from (in FAND you choose it at level 3).'},
  Warlock:{t:'You struck a deal with a mighty being for power.',play:'A few strong spells that come back on a short rest.',o:['cha','con','dex','wis','int','str'],sk:['arcana','deception'],pr:'Light armor; simple weapons',kit:'Light crossbow with 20 bolts, arcane focus, leather armor, two daggers, scholar\'s pack',gp:10,f:'Pact Magic (Charisma): your spell slots return on a short rest.\nOtherworldly Patron: the being you made your deal with (in FAND you choose it at level 3).'},
  Bard:{t:'A performer whose music and words are magic.',play:'Help friends, charm enemies, and know a bit of everything.',o:['cha','dex','con','wis','int','str'],sk:['performance','persuasion'],pr:'Light armor; simple weapons, hand crossbows, longswords, rapiers, shortswords; three instruments',kit:'Rapier, lute, leather armor, dagger, entertainer\'s pack',gp:15,f:'Spellcasting (Charisma): spells sung, spoken, or played.\nBardic Inspiration: as a bonus action, give a creature within 60 feet a d6 to add to one ability check, attack roll, or save in the next 10 minutes; uses equal to your Charisma modifier per long rest.'},
  Druid:{t:'A guardian of nature with wild magic.',play:'Heal, control the battlefield, and later turn into animals.',o:['wis','con','dex','int','cha','str'],sk:['nature','animal'],pr:'Light and medium armor and shields (not metal); clubs, daggers, quarterstaffs, scimitars, slings, spears; herbalism kit',kit:'Wooden shield, scimitar, leather armor, druidic focus, explorer\'s pack',gp:10,f:'Spellcasting (Wisdom): magic drawn from nature.\nDruidic: the secret language of druids.'},
  Artificer:{t:'An inventor who puts magic into tools and gadgets.',play:'Build, repair, and support the party with clever devices.',o:['int','con','dex','wis','str','cha'],sk:['arcana','investigation'],pr:'Light and medium armor, shields; simple weapons; thieves\' tools and tinker\'s tools',kit:'Light crossbow with 20 bolts, scale mail, thieves\' tools, dungeoneer\'s pack',gp:10,f:'Magical Tinkering: with thieves\' or artisan\'s tools, give a tiny object a small lasting magical effect (light, a recorded message, a smell or sound, or a picture); a number of objects up to your Intelligence modifier.\nSpellcasting (Intelligence): magic worked through your tools.'}
};
// [name, description, ability bonus ('flex' = +2 and +1 placed on the class's best scores), speed, traits, group]
// People's spells (owner's request, 2026-11-05): the innate magic each people's traits give, so the sheet lists it. Each entry:
// [level gained, spell, note]; a cantrip is at will, any other spell once per long rest without a slot (a caster may also
// spend slots on it). ab is the casting ability ('ics' = choose INT, WIS, or CHA). From the peoples' own trait text.
const RACE_SPELLS={
  'Dark Elf':{ab:'cha',sp:[[1,'Dancing Lights'],[3,'Faerie Fire'],[5,'Darkness']]},
  'Forest Gnome':{ab:'int',sp:[[1,'Minor Illusion']]},
  'High Elf':{ab:'int',pick:'one wizard cantrip of your choice'},
  'Tiefling':{ab:'cha',sp:[[1,'Thaumaturgy'],[3,'Hellish Rebuke','as a 2nd-level spell'],[5,'Darkness']]},
  'Aasimar':{ab:'cha',sp:[[1,'Light']]},
  'Firbolg':{ab:'ics',sp:[[1,'Detect Magic'],[1,'Disguise Self','you can seem up to 3 feet shorter']]},
  'Triton':{ab:'ics',sp:[[1,'Fog Cloud'],[3,'Gust of Wind'],[5,'Water Walk']]},
  'Kobold':{ab:'ics',pick:'with the Draconic Sorcery legacy: one sorcerer cantrip of your choice'},
  'Yuan-ti':{ab:'ics',sp:[[1,'Poison Spray'],[1,'Animal Friendship','at will, on snakes only'],[3,'Suggestion']]},
  'Air Genasi':{ab:'ics',sp:[[1,'Shocking Grasp'],[3,'Feather Fall'],[5,'Levitate']]},
  'Earth Genasi':{ab:'ics',sp:[[1,'Blade Ward','also as a bonus action, proficiency bonus times per long rest'],[5,'Pass without Trace']]},
  'Fire Genasi':{ab:'ics',sp:[[1,'Produce Flame'],[3,'Burning Hands'],[5,'Flame Blade']]},
  'Water Genasi':{ab:'ics',sp:[[1,'Acid Splash'],[3,'Create or Destroy Water'],[5,'Water Walk']]},
  'Aarakocra':{ab:'ics',sp:[[3,'Gust of Wind']]},
  'Fairy':{ab:'ics',sp:[[1,'Druidcraft'],[3,'Faerie Fire'],[5,'Enlarge-Reduce']]},
  'Githyanki':{ab:'int',sp:[[1,'Mage Hand','the hand is invisible'],[3,'Jump'],[5,'Misty Step']]},
  'Githzerai':{ab:'wis',sp:[[1,'Mage Hand','the hand is invisible'],[3,'Shield'],[5,'Detect Thoughts']]},
  'Deep Dwarf':{ab:'int',sp:[[3,'Enlarge-Reduce','enlarge, on yourself only'],[5,'Invisibility','on yourself only']]},
  'Astral Elf':{ab:'ics',pick:'one of Dancing Lights, Light, or Sacred Flame'},
  'Hexblood':{ab:'ics',sp:[[1,'Disguise Self'],[1,'Hex']]},
  'Runeborn':{ab:'ics',pick:'one cantrip tied to the Law of your Rune, chosen with your DM',sp:[[3,'Detect Magic']]},
  'Abyssal Tiefling':{ab:'ics',sp:[[1,'Thaumaturgy'],[1,'Poison Spray'],[3,'Ray of Sickness'],[5,'Hold Person']]},
  'Chthonic Tiefling':{ab:'ics',sp:[[1,'Thaumaturgy'],[1,'Chill Touch'],[3,'False Life'],[5,'Ray of Enfeeblement']]},
  'Infernal Tiefling':{ab:'ics',sp:[[1,'Thaumaturgy'],[1,'Fire Bolt'],[3,'Hellish Rebuke'],[5,'Darkness']]},
  'Feral Tiefling':{ab:'cha',sp:[[1,'Thaumaturgy'],[3,'Hellish Rebuke','as a 2nd-level spell'],[5,'Darkness']]},
  'Tiefling of Baalzebul':{ab:'cha',sp:[[1,'Thaumaturgy'],[3,'Ray of Sickness','as a 2nd-level spell'],[5,'Crown of Madness']]},
  'Tiefling of Dispater':{ab:'cha',sp:[[1,'Thaumaturgy'],[3,'Disguise Self'],[5,'Detect Thoughts']]},
  'Tiefling of Fierna':{ab:'cha',sp:[[1,'Friends'],[3,'Charm Person','as a 2nd-level spell'],[5,'Suggestion']]},
  'Tiefling of Glasya':{ab:'cha',sp:[[1,'Minor Illusion'],[3,'Disguise Self'],[5,'Invisibility']]},
  'Tiefling of Levistus':{ab:'cha',sp:[[1,'Ray of Frost'],[3,'Armor of Agathys','as a 2nd-level spell'],[5,'Darkness']]},
  'Tiefling of Mammon':{ab:'cha',sp:[[1,'Mage Hand'],[3,'Floating Disk'],[5,'Arcane Lock']]},
  'Tiefling of Mephistopheles':{ab:'cha',sp:[[1,'Mage Hand'],[3,'Burning Hands','as a 2nd-level spell'],[5,'Flame Blade']]},
  'Tiefling of Zariel':{ab:'cha',sp:[[1,'Thaumaturgy'],[3,'Searing Smite','as a 2nd-level spell'],[5,'Branding Smite']]},
  'Lotusden Halfling':{ab:'wis',sp:[[1,'Druidcraft'],[3,'Entangle'],[5,'Spike Growth']]},
  'Pallid Elf':{ab:'wis',sp:[[1,'Light'],[3,'Sleep'],[5,'Invisibility','on yourself only']]},
  'Siren':{ab:'cha',sp:[[1,'Friends']]},
  'Mark of Detection':{ab:'int',sp:[[1,'Detect Magic'],[1,'Detect Poison and Disease'],[3,'See Invisibility']]},
  'Mark of Finding':{ab:'wis',sp:[[1,"Hunter's Mark"],[3,'Locate Object']]},
  'Mark of Handling':{ab:'wis',sp:[[1,'Animal Friendship'],[1,'Speak with Animals']]},
  'Mark of Healing':{ab:'wis',sp:[[1,'Cure Wounds']]},
  'Mark of Hospitality':{ab:'cha',sp:[[1,'Prestidigitation'],[1,'Purify Food and Drink'],[1,'Unseen Servant']]},
  'Mark of Making':{ab:'int',sp:[[1,'Mending'],[1,'Magic Weapon','lasts 1 hour without concentration']]},
  'Mark of Passage':{ab:'dex',sp:[[1,'Misty Step']]},
  'Mark of Scribing':{ab:'int',sp:[[1,'Message'],[1,'Comprehend Languages'],[3,'Magic Mouth']]},
  'Mark of Sentinel':{ab:'wis',sp:[[1,'Shield']]},
  'Mark of Shadow':{ab:'cha',sp:[[1,'Minor Illusion'],[1,'Invisibility']]},
  'Mark of Storm':{ab:'cha',sp:[[1,'Gust'],[3,'Gust of Wind']]},
  'Mark of Warding':{ab:'int',sp:[[1,'Alarm'],[1,'Mage Armor'],[3,'Arcane Lock','without its gold cost']]}};
// Peoples with kinds (owner's request, 2026-11-05): menus ask for the people first, then its type (a Tiefling of Dispater,
// a Chromatic Dragonborn, a Mark of Making human). A character still stores the exact type in c.race, so every rule,
// spell, and profile keeps working. Each dragonmark sits with the people that carries it.
const PEOPLE_FAMILY=[
  ['Human',['Human','Variant Human','Mark of Finding','Mark of Handling','Mark of Making','Mark of Passage','Mark of Sentinel']],
  ['Elf',['High Elf','Wood Elf','Dark Elf','Eladrin','Sea Elf','Shadow Elf','Pallid Elf','Astral Elf','Mark of Shadow']],
  ['Half-Elf',['Half-Elf','Aquatic Half-Elf','Mark of Detection','Mark of Storm']],
  ['Dwarf',['Hill Dwarf','Mountain Dwarf','Deep Dwarf','Mark of Warding']],
  ['Halfling',['Lightfoot Halfling','Stout Halfling','Ghostwise Halfling','Lotusden Halfling','Kender','Mark of Healing','Mark of Hospitality']],
  ['Gnome',['Rock Gnome','Forest Gnome','Deep Gnome','Mark of Scribing']],
  ['Tiefling',['Tiefling','Infernal Tiefling','Abyssal Tiefling','Chthonic Tiefling','Feral Tiefling','Winged Tiefling','Tiefling of Baalzebul','Tiefling of Dispater','Tiefling of Fierna','Tiefling of Glasya','Tiefling of Levistus','Tiefling of Mammon','Tiefling of Mephistopheles','Tiefling of Zariel']],
  ['Dragonborn',['Dragonborn','Chromatic Dragonborn','Metallic Dragonborn','Gem Dragonborn','Draconblood Dragonborn','Ravenite Dragonborn']],
  ['Genasi',['Air Genasi','Earth Genasi','Fire Genasi','Water Genasi']],
  ['Gith',['Githyanki','Githzerai']],
  ['Goliath',['Goliath','Cloud Giant Goliath','Fire Giant Goliath','Frost Giant Goliath','Hill Giant Goliath','Stone Giant Goliath','Storm Giant Goliath']],
  ['Shifter',['Shifter','Beasthide Shifter','Longtooth Shifter','Swiftstride Shifter','Wildhunt Shifter']],
  ['Birdfolk',['Corvum','Gallus','Luma','Raptor','Strig']],
  ['Humblefolk',['Cervan','Hedge','Jerbeen','Mapach','Vulpin']]];
const famOf=n=>{const f=PEOPLE_FAMILY.find(([,L])=>L.includes(n));return f?f[0]:n};
const famMembers=f=>{const x=PEOPLE_FAMILY.find(y=>y[0]===f);return x?x[1].filter(n=>CW_RACE.some(r=>r[0]===n)):[f]};
// the people menu: each family once (where its first member sits in the list) and every people without kinds
const peopleTop=()=>{const seen=new Set(),o=[];CW_RACE.forEach(r=>{const f=famOf(r[0]);if(!seen.has(f)){seen.add(f);o.push(f)}});return o};
const famRow=f=>CW_RACE.find(r=>r[0]===famMembers(f)[0])||CW_RACE.find(r=>r[0]===f);
const AB_NAME={str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
const spByName=n=>SP.find(x=>lc(x.n)===lc(n))||null;
// the casting ability for a people's spells: its own, or the best of INT, WIS, and CHA when the people lets you choose
function raceSpellAb(c,R){if(!R)return 'cha';if(R.ab!=='ics')return R.ab;const A=c.abil||{},o=(c.raceOpts||{}).spellAb;return o&&['int','wis','cha'].includes(o)?o:['int','wis','cha'].sort((a,b)=>(+A[b]||10)-(+A[a]||10))[0]}
// the people's spells a character has at their level, with any cantrip they chose for their people (High Elf, Astral Elf…)
function raceSpellsGot(c){const L=+c.level||1,out=[];[c.race,c.race2].filter(Boolean).forEach(p=>{const R=RACE_SPELLS[p];if(R)(R.sp||[]).filter(x=>x[0]<=L&&!out.some(y=>lc(y.n)===lc(x[1]))).forEach(x=>out.push({n:x[1],note:x[2]||'',from:p}))});
  (typeof PEOPLE_OPTS!=='undefined'?roSpecsFor(c.race,c.raceOpts):[]).forEach(x=>{const v=(c.raceOpts||{})[x.id];if(x.k==='cantrip'&&v&&!out.some(y=>lc(y.n)===lc(v)))out.push({n:v,note:'your choice',from:c.race})});return out}
// the sheet's picker for a people's chosen cantrip (High Elf, Astral Elf, a Draconic Sorcery kobold, …)
function raceCantripPicker(c){const x=roSpecsFor(c.race,c.raceOpts).find(y=>y.k==='cantrip');if(!x)return '';const cur=(c.raceOpts||{})[x.id]||'',ch=roChoices(x);
  return ch.length?` <select class="sh-noprint" aria-label="Choose your people's cantrip" onchange="sheetRaceCantrip('${x.id}',this.value)"><option value="">${cur?'Change…':'Choose a cantrip…'}</option>${ch.map(([v,l])=>`<option value="${esc(v)}"${v===cur?' selected':''}>${esc(l)}</option>`).join('')}</select>`:''}
function sheetRaceCantrip(id,v){const c=sheetChar();if(!c||!v)return;c.raceOpts=c.raceOpts||{};const old=c.raceOpts[id];c.raceOpts[id]=v;c.spells=c.spells||{};const L=c.spells[0]=(c.spells[0]||[]).filter(n=>!old||lc(n)!==lc(old));if(!L.some(n=>lc(n)===lc(v)))L.push(v);saveParty();renderSheet();toast(v+' is your people\'s cantrip')}
const raceChosen=c=>{const g=raceSpellsGot(c).find(x=>x.note==='your choice');return g?g.n:''};
function raceSpellsHTML(c){return raceSpellsBox(c,c.race)+(c.race2&&c.race2!==c.race?raceSpellsBox(c,c.race2,1):'')}
function raceSpellsBox(c,people,her){const R=RACE_SPELLS[people];if(!R)return '';const L=+c.level||1,ab=raceSpellAb(c,R),m=Math.floor(((+(c.abil||{})[ab]||10)-10)/2),pb=profBonus(L);
  const row=([lv,n,note])=>{const sp=SP.length?spByName(n):null,cant=sp?sp.lv===0:lv===1&&/^(Thaumaturgy|Dancing Lights|Minor Illusion|Light|Poison Spray|Shocking Grasp|Blade Ward|Produce Flame|Acid Splash|Druidcraft|Mage Hand|Chill Touch|Fire Bolt|Friends|Ray of Frost|Prestidigitation|Mending|Message|Gust)$/i.test(n),off=L<lv;
    return `<li style="${off?'opacity:.5':''}">${sp?refChip(sp,esc(n)):`<b>${esc(n)}</b>`} <small style="color:var(--muted)">${off?`at level ${lv}`:cant?'cantrip, at will':'once per long rest without a slot'}${note?' · '+esc(note):''}</small></li>`};
  return `<div class="sh-box" style="margin-bottom:12px"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:baseline"><b>${her?'Heritage spells':'People\'s spells'}</b><span class="note" style="margin:0">${esc(people)}${her?' heritage':''} · ${esc(AB_NAME[ab])}${R.ab==='ics'?' (your best of Intelligence, Wisdom, and Charisma)':''} · save DC ${8+pb+m} · spell Accuracy ${sgn(pb+m)}</span></div>
    <ul class="sh-ul" style="margin-top:6px">${(R.sp||[]).map(row).join('')}${R.pick&&!her?`<li><b>Your choice:</b> <small style="color:var(--muted)">${esc(R.pick)}${raceChosen(c)?' · chosen: <b>'+esc(raceChosen(c))+'</b>':''}</small>${raceCantripPicker(c)}</li>`:R.pick?`<li><small style="color:var(--muted)">A heritage gives no chosen cantrip (${esc(R.pick)}).</small></li>`:''}</ul>
    <div class="sh-lab">Innate magic from your people: it needs no school and no class, works in every realm, and a caster may also cast these with their own slots</div></div>`}
const CW_RACE=[
  ['Human','Adaptable and ambitious; the most common people of Vestige.',{str:1,dex:1,con:1,int:1,wis:1,cha:1},30,'One extra language','Common'],
  ['High Elf','Graceful and long-lived, with a gift for magic.',{dex:2,int:1},30,'Darkvision; keen senses; hard to charm; one wizard cantrip; meditates instead of sleeping','Common'],
  ['Wood Elf','A swift elf of the deep forests.',{dex:2,wis:1},35,'Darkvision; keen senses; hard to charm; hides in light cover outdoors','Common'],
  ['Dark Elf','An elf of the underground, at home in darkness (the drow).',{dex:2,cha:1},30,'Superior darkvision (120 ft); hard to charm; a little innate shadow magic; bright sunlight hurts the eyes','Common'],
  ['Hill Dwarf','Stout, stubborn, and hardier than most.',{con:2,wis:1},25,'Darkvision; resists poison; knows stonework; +1 hit point per level','Common'],
  ['Mountain Dwarf','A dwarf of the high peaks, raised in armor.',{con:2,str:2},25,'Darkvision; resists poison; knows stonework; trained in light and medium armor','Common'],
  ['Lightfoot Halfling','Small, cheerful, and very lucky.',{dex:2,cha:1},25,'Lucky (reroll a natural 1); brave; can hide behind bigger creatures','Common'],
  ['Stout Halfling','A sturdy halfling who shrugs off poison.',{dex:2,con:1},25,'Lucky (reroll a natural 1); brave; resists poison','Common'],
  ['Rock Gnome','Small, curious, and full of inventions.',{int:2,con:1},25,'Darkvision; hard to fool with magic; builds small clockwork toys','Common'],
  ['Forest Gnome','A shy gnome who talks with small animals.',{int:2,dex:1},25,'Darkvision; hard to fool with magic; a minor illusion cantrip; speaks with small beasts','Common'],
  ['Half-Elf','Between two peoples, at home with both.',{cha:2,dex:1},30,'Darkvision; hard to charm; two extra skills or languages','Common'],
  ['Half-Orc','Strong and fierce; hard to put down.',{str:2,con:1},30,'Darkvision; once per long rest, drop to 1 HP instead of 0; savage critical hits','Common'],
  ['Tiefling','Touched by a fiendish bloodline.',{cha:2,int:1},30,'Darkvision; resists fire; a little innate magic','Common'],
  ['Dragonborn','Proud people with the blood of dragons.',{str:2,cha:1},30,'A breath weapon; resists one damage type','Common'],
  ['Aasimar','A mortal with the light of a celestial ancestor.',{cha:2,wis:1},30,'Darkvision; resists necrotic and radiant; healing hands; a celestial transformation once per long rest','More peoples'],
  ['Firbolg','A gentle forest giant-kin who hides from sight.',{wis:2,str:1},30,'Powerful build; speaks with beasts and plants; can turn invisible briefly; a little druid magic','More peoples'],
  ['Goliath','A towering mountain-dweller with a giant\'s strength.',{str:2,con:1},30,'Powerful build; shrug off damage once per rest; at home in high, cold places','More peoples'],
  ['Kenku','A bird-folk who speaks only in mimicked sounds.',{dex:2,wis:1},30,'Perfect mimicry; perfect memory; skilled forger','More peoples'],
  ['Lizardfolk','A cold-eyed reptile hunter.',{con:2,wis:1},30,'Natural armor; a bite attack; holds breath 15 minutes; swims','More peoples'],
  ['Tabaxi','A curious cat-folk who loves stories and treasure.',{dex:2,cha:1},30,'Darkvision; claws; climbing speed; sudden bursts of speed','More peoples'],
  ['Triton','A guardian from the ocean depths.',{str:1,con:1,cha:1},30,'Amphibious; swims; speaks with sea creatures; resists cold; a little water magic','More peoples'],
  ['Tortle','A turtle-folk who carries their home on their back.',{str:2,wis:1},30,'Natural armor shell; can withdraw into the shell; holds breath an hour; claws','More peoples'],
  ['Bugbear','A long-limbed goblinoid with a knack for ambush.',{str:2,dex:1},30,'Darkvision; long reach; sneaky; extra damage on a surprise hit','More peoples'],
  ['Goblin','Small, quick, and tougher than they look.',{dex:2,con:1},30,'Darkvision; slip away as a bonus action; punish bigger foes','More peoples'],
  ['Hobgoblin','A disciplined goblinoid who fights best with friends.',{con:2,int:1},30,'Darkvision; turn a failed roll into a success with an ally\'s help','More peoples'],
  ['Kobold','A small dragon-kin who fights with cunning.',{dex:2,int:1},30,'Darkvision; a draconic cry that gives allies an edge','More peoples'],
  ['Orc','A powerful wanderer with endless stamina.',{str:2,con:1},30,'Darkvision; dash as a bonus action; drop to 1 HP instead of 0 once per long rest','More peoples'],
  ['Yuan-ti','A serpent-blooded person, cold and hard to sway.',{cha:2,int:1},30,'Darkvision; resists poison; advantage on saves against magic; a little snake magic','More peoples'],
  ['Air Genasi','Born with the breath of the wind in their blood.',{con:2,dex:1},35,'Darkvision; resists lightning; can hold breath forever; a little wind magic','More peoples'],
  ['Earth Genasi','Born with the strength of stone in their blood.',{con:2,str:1},30,'Darkvision; walks over rough stone freely; a little earth magic','More peoples'],
  ['Fire Genasi','Born with a spark of flame in their blood.',{con:2,int:1},30,'Darkvision; resists fire; a little fire magic','More peoples'],
  ['Water Genasi','Born with the tide in their blood.',{con:2,wis:1},30,'Darkvision; resists acid; breathes water; swims; a little water magic','More peoples'],
  ['Aarakocra','A winged bird-folk of the high skies.',{dex:2,wis:1},30,'Flying speed 30 ft; talons; a little wind magic','More peoples'],
  ['Centaur','Half person, half horse, fast across open land.',{str:2,wis:1},40,'Charge; carries riders; hooves','More peoples'],
  ['Minotaur','A horned, powerful bull-headed warrior.',{str:2,con:1},30,'Horns; goring charge; shove with a bonus action','More peoples'],
  ['Satyr','A merry goat-legged reveler.',{cha:2,dex:1},35,'Resists magic; a headbutt; leaps far; musical','More peoples'],
  ['Fairy','A small winged spirit of the wild places.',{dex:2,cha:1},30,'Flying speed; a little fey magic','More peoples'],
  ['Harengon','A rabbit-folk with lucky feet.',{dex:2,wis:1},30,'Hops away from danger as a reaction; big leaps','More peoples'],
  ['Owlin','An owl-folk who flies silently by night.',{dex:2,wis:1},30,'Darkvision 120 ft; flying speed; silent flight','More peoples'],
  ['Changeling','A shapeshifter who can wear many faces.',{cha:2,dex:1},30,'Change your appearance at will; two extra social skills','More peoples'],
  ['Shifter','Someone with a beast inside, waiting to come out.',{dex:2,con:1},30,'Darkvision; shift into a beastly form for a minute, gaining temporary hit points and a beast trait','More peoples'],
  ['Warforged','A living construct, built for a war long over.',{con:2,str:1},30,'Constructed resilience (resists poison, needs no food or sleep); built-in armor bonus','More peoples'],
  ['Kalashtar','A person bound to a dream spirit.',{wis:2,cha:1},30,'Telepathy; resists psychic; dreams cannot be invaded','More peoples'],
  ['Githyanki','A fierce warrior people of the space between realms.',{str:2,int:1},30,'Trained in armor and swords; a little psychic magic','More peoples'],
  ['Githzerai','A disciplined, monk-like people of order.',{wis:2,int:1},30,'Mental discipline against charm and fear; a little psychic magic','More peoples'],
  ['Eladrin','An elf whose mood shifts with the seasons.',{dex:2,cha:1},30,'Darkvision; hard to charm; teleport a short way with a seasonal effect','More peoples'],
  ['Sea Elf','An elf who lives beneath the waves.',{dex:2,con:1},30,'Darkvision; breathes water; swims; speaks with sea creatures','More peoples'],
  ['Shadow Elf','An elf of a grey, shadowy land (the shadar-kai).',{dex:2,con:1},30,'Darkvision; resists necrotic; teleport a short way through shadow','More peoples'],
  ['Deep Dwarf','A grim dwarf of the deep underground (the duergar).',{con:2,str:1},25,'Superior darkvision; resists poison and illusion; can grow larger or turn invisible briefly','More peoples'],
  ['Deep Gnome','A quiet gnome of the deep tunnels.',{int:2,dex:1},25,'Superior darkvision; hard to fool with magic; blends into stone','More peoples'],
  ['Leonin','A proud lion-folk of the plains.',{con:2,str:1},35,'Darkvision; claws; a frightening roar','More peoples'],
  ['Loxodon','A wise, elephant-headed people.',{con:2,wis:1},30,'Natural armor; a strong trunk; keen smell; very calm under pressure','More peoples'],
  ['Vedalken','A calm, blue-skinned people who seek perfection.',{int:2,wis:1},30,'Bonus to Intelligence, Wisdom, and Charisma checks once per rest; tireless precision','More peoples'],
  ['Simic Hybrid','A person changed with animal parts by magic.',{con:2,str:1},30,'Darkvision; choose animal enhancements such as gills, claws, or climbing','More peoples'],
  ['Locathah','A fish-folk of the coasts.',{str:2,dex:1},30,'Natural armor; breathes water; swims; hard to charm or paralyze','More peoples'],
  ['Verdan','A goblin-kin changed by chaos, still growing.',{cha:2,con:1},30,'Telepathic insight; grows from Small to Medium over time','More peoples'],
  ['Grung','A tiny, poisonous frog-folk.',{dex:2,con:1},25,'Poisonous skin; leaps far; climbs; needs to stay wet','More peoples'],
  ['Astral Elf','An elf from the starlit sea between realms.',{dex:2,int:1},30,'Darkvision; a little radiant magic; a starlit trance','More peoples'],
  ['Autognome','A small mechanical person, built by gnomes.',{int:2,con:1},30,'Built for success (add a die to a roll); constructed body','More peoples'],
  ['Giff','A large, hippo-headed soldier.',{str:2,con:1},30,'Powerful build; hits hard with heavy weapons','More peoples'],
  ['Hadozee','A glider with skin flaps for drifting on the wind.',{dex:2,con:1},30,'Climbs; glides; reduces damage with a quick dodge','More peoples'],
  ['Plasmoid','An amoeba-like person who can change shape.',{con:2,str:1},30,'Squeezes through tiny gaps; resists acid and poison; shapes pseudopods','More peoples'],
  ['Thri-kreen','A four-armed insect-folk of the deserts.',{dex:2,wis:1},30,'Natural armor; extra arms; telepathy; can sleep while awake','More peoples'],
  ['Dhampir','Part mortal, part vampire.',{con:2,dex:1},35,'Darkvision; climbs walls; a draining bite','More peoples'],
  ['Hexblood','A person touched by a hag\'s magic.',{cha:2,int:1},30,'Darkvision; a magic token; a little witch magic','More peoples'],
  ['Reborn','Someone who died and came back.',{con:2,wis:1},30,'Deathless nature (resists disease and poison, needs no sleep); memories of past lives','More peoples'],
  // FAND homebrew: peoples born of the realms of Vestige
  ['Hellbound','Born in Hell\'s contract halls, where every promise is binding.',{cha:2,con:1},30,'Resists fire; Contract Sense (knows when someone is under a contract or oath); no strain from Hell\'s Pressure','Peoples of the realms'],
  ['Haloed','Born in Heaven\'s cloud meadows, with a faint ring of light.',{wis:2,cha:1},30,'Resists radiant; sheds dim light at will; once per long rest, steady a dying creature with a touch; no strain from Heaven\'s Pressure','Peoples of the realms'],
  ['Chaosborn','Born where nothing stays the same.',{cha:2,con:1},30,'Resists one damage type, rolled again after each long rest; once per long rest, reroll any one die; no strain from Chaos\'s Pressure','Peoples of the realms'],
  ['Abyssal Deepkin','Born in the trenches of the Abyss.',{str:2,con:1},30,'Darkvision 120 ft; resists cold; holds breath an hour; swims; no strain from the Abyss\'s Pressure','Peoples of the realms'],
  ['Lawbound','Born in the ordered gardens of the Inner Realm.',{int:2,wis:1},30,'Knows when a spoken lie is told once per long rest; hard to charm; no strain from the Inner Realm\'s Pressure','Peoples of the realms'],
  ['Starwalker','Born on the star-plains of the Outer Realm.',{dex:2,wis:1},30,'Sees clearly up to a mile; leaps twice as far; no strain from the Outer Realm\'s Pressure','Peoples of the realms'],
  ['Hollowborn','Born in the silence of the Void.',{dex:2,int:1},30,'Resists necrotic; makes no sound when walking; no strain from the Void\'s Pressure','Peoples of the realms'],
  ['Mistborn','Born in the fog of the Mysterious Realm.',{dex:2,cha:1},30,'Darkvision; once per short rest, step 30 ft through mist; hard to charm','Peoples of the realms'],
  ['Edgeborn','Born on the rim of the Inner Void.',{wis:2,con:1},30,'Senses creatures within 30 ft even unseen; no strain from the Inner Void\'s Pressure','Peoples of the realms'],
  ['Firstblood','Descended from the first people of the Primordial realm.',{str:2,con:1},30,'Advantage on saves against exhaustion; once per long rest, shrug off a condition; no strain from the Primordial\'s Pressure','Peoples of the realms'],
  ['Runeborn','Born where a Rune\'s power spilled into the world.',{int:2,wis:1},30,'One cantrip from a Rune\'s Law (chosen with your DM); glowing rune-marks on the skin; can sense nearby Runes','Peoples of the realms'],
  ['Godspawn','A distant descendant of a god of Vestige.',{cha:2,wis:1},30,'Followers of your ancestor god recognise you, which counts as meeting a follower for a contract; resists one damage type tied to that god','Peoples of the realms']
];
// the full profile of every people (data/peoples: size, type, speed, darkvision, senses, languages, age, height, weight,
// description, its place in Vestige, and every trait), and the official peoples added from the 5e books and supplements
if(typeof PEOPLES!=='undefined')(PEOPLES.extra||[]).forEach(r=>{if(!CW_RACE.some(x=>x[0]===r[0]))CW_RACE.push(r)});
// a people's own choices at creation (the People options step): skills, tools, picks, a cantrip, a spellcasting ability.
// k: skill (n of `of`, or any), tool (n of `of`, or any), skilltool, pick (one of `of`; `then` adds choices per pick),
// abil (INT, WIS, or CHA), cantrip (from a class list, or `of`), text (written in, often with the DM)
const RO_CAST={k:'abil',t:'Spellcasting ability for your people\'s spells'};
const RO_INSTR=['Lute','Flute','Drum','Lyre','Horn','Bagpipes','Viol','Pan flute','Shawm','Dulcimer'];
const RO_DWARF={k:'tool',t:'Tool Proficiency',of:['Smith\'s tools','Brewer\'s supplies','Mason\'s tools']};
const RO_NATURE=['animal','medicine','nature','perception','stealth','survival'];
const PEOPLE_OPTS={
  'High Elf':[{k:'cantrip',t:'Cantrip',cls:'Wizard'}],
  'Hill Dwarf':[RO_DWARF],'Mountain Dwarf':[RO_DWARF],'Deep Dwarf':[RO_DWARF],
  'Half-Elf':[{k:'skill',t:'Skill Versatility',n:2}],
  'Dragonborn':[{k:'pick',t:'Draconic Ancestry',d:'Sets your breath weapon and the damage you resist.',of:['Black (acid)','Copper (acid)','Blue (lightning)','Bronze (lightning)','Brass (fire)','Gold (fire)','Red (fire)','Green (poison)','Silver (cold)','White (cold)']}],
  'Firbolg':[RO_CAST],'Triton':[RO_CAST],'Yuan-ti':[RO_CAST],'Air Genasi':[RO_CAST],'Earth Genasi':[RO_CAST],'Fire Genasi':[RO_CAST],'Water Genasi':[RO_CAST],'Aarakocra':[RO_CAST],'Fairy':[RO_CAST],
  'Kenku':[{k:'skill',t:'Kenku Recall',n:2}],
  'Lizardfolk':[{k:'skill',t:'Nature\'s Intuition',n:2,of:RO_NATURE}],
  'Tortle':[{k:'skill',t:'Nature\'s Intuition',n:1,of:RO_NATURE}],
  'Kobold':[{k:'pick',t:'Kobold Legacy',of:['Craftiness','Defiance','Draconic Sorcery'],then:{Craftiness:[{k:'skill',t:'Craftiness skill',n:1,of:['arcana','investigation','medicine','sleight','survival']}],'Draconic Sorcery':[{k:'cantrip',t:'Draconic Sorcery cantrip',cls:'Sorcerer'},RO_CAST]}}],
  'Centaur':[{k:'skill',t:'Natural Affinity',n:1,of:['animal','medicine','nature','survival']}],
  'Satyr':[{k:'tool',t:'Reveler: musical instrument',of:RO_INSTR}],
  'Changeling':[{k:'skill',t:'Changeling Instincts',n:2,of:['deception','insight','intimidation','performance','persuasion']}],
  'Shifter':[{k:'skill',t:'Bestial Instincts',n:1,of:['acrobatics','athletics','intimidation','survival']},{k:'pick',t:'Shifting form',d:'What your beastly form gives you while shifted.',of:['Beasthide','Longtooth','Swiftstride','Wildhunt']}],
  'Warforged':[{k:'skill',t:'Specialized Design: skill',n:1},{k:'tool',t:'Specialized Design: tool'}],
  'Githyanki':[{k:'skilltool',t:'Decadent Mastery: a skill or a tool'}],
  'Leonin':[{k:'skill',t:'Hunter\'s Instincts',n:1,of:['athletics','intimidation','perception','survival']}],
  'Vedalken':[{k:'skill',t:'Tireless Precision: skill',n:1,of:['arcana','history','investigation','medicine','performance','sleight']},{k:'tool',t:'Tireless Precision: tool'}],
  'Simic Hybrid':[{k:'pick',t:'Animal Enhancement',d:'You choose one more at level 5.',of:['Manta Glide','Nimble Climber','Underwater Adaptation']}],
  'Astral Elf':[{k:'cantrip',t:'Astral Fire',of:['Dancing Lights','Light','Sacred Flame']},RO_CAST],
  'Autognome':[{k:'tool',t:'Specialized Design',n:2}],
  'Dhampir':[{k:'skill',t:'Ancestral Legacy',n:2}],'Reborn':[{k:'skill',t:'Ancestral Legacy',n:2}],
  'Hexblood':[{k:'skill',t:'Ancestral Legacy',n:2},RO_CAST],
  'Hellbound':[{k:'skill',t:'Silver Tongue',n:1,of:['deception','persuasion']}],
  'Lawbound':[{k:'skill',t:'Careful Eye',n:1,of:['insight','investigation']}],
  'Godspawn':[{k:'text',t:'Ancestor god',ph:'Which god of Vestige?'},{k:'text',t:'Divine Resistance',ph:'Damage type, chosen with your DM'},{k:'skill',t:'Godly Presence',n:1,of:['religion','persuasion']}],
  'Runeborn':[{k:'text',t:'Rune Cantrip',ph:'Chosen with your DM'},RO_CAST]};
// skills a people always gives (+1 each at creation, like class and background skills)
const PEOPLE_SKILLS={'High Elf':['perception'],'Wood Elf':['perception'],'Dark Elf':['perception'],'Eladrin':['perception'],'Sea Elf':['perception'],'Shadow Elf':['perception'],'Astral Elf':['perception'],
  'Half-Orc':['intimidation'],'Goliath':['athletics'],'Tabaxi':['perception','stealth'],'Bugbear':['stealth'],'Harengon':['perception'],'Owlin':['stealth'],'Satyr':['performance','persuasion'],
  'Locathah':['athletics','perception'],'Verdan':['persuasion'],'Grung':['perception'],'Starwalker':['perception'],'Firstblood':['athletics'],'Runeborn':['arcana']};
// the choices open to the chosen people, with a Kobold-style pick adding its own follow-up choices
function roSpecs(race){return roSpecsFor(race,CW.ro)}
function roSpecsFor(race,ro){const out=[];(PEOPLE_OPTS[race]||[]).forEach((x,i)=>{out.push(Object.assign({id:''+i},x));const v=(ro||{})[i];if(x.then&&v&&x.then[v])x.then[v].forEach((y,j)=>out.push(Object.assign({id:i+'.'+j},y)))});return out}
const roHas=race=>!!(PEOPLE_OPTS[race]||PEOPLE_SKILLS[race]);
const roN=x=>x.k==='skill'||x.k==='tool'?(x.n||1):1;
const roAbil=[['int','Intelligence'],['wis','Wisdom'],['cha','Charisma']];
function roChoices(x){const skn=k=>(SKILLS.find(y=>y[0]===k)||[])[1]||k;
  if(x.k==='skill')return (x.of||SKILLS.map(s=>s[0])).map(k=>[k,skn(k)]);
  if(x.k==='tool')return (x.of||CW_PROF_GROUPS.filter(g=>/Tools|Instruments/.test(g[0])).flatMap(g=>g[1])).map(n=>[n,n]);
  if(x.k==='skilltool')return SKILLS.map(s=>['s:'+s[0],s[1]+' (skill)']).concat(CW_PROF_GROUPS.filter(g=>/Tools|Instruments/.test(g[0])).flatMap(g=>g[1]).map(n=>['t:'+n,n+' (tool)']));
  if(x.k==='pick')return x.of.map(n=>[n,n]);
  if(x.k==='abil')return roAbil;
  if(x.k==='cantrip')return (x.of||(typeof SP!=='undefined'?SP.filter(s=>s.lv===0&&(s.cls||[]).includes(x.cls)).map(s=>s.n).sort():[])).map(n=>[n,n]);
  return []}
const roVal=(x,j)=>{const v=(CW.ro||{})[x.id];return roN(x)>1?((v||[])[j]||''):(v||'')};
function roSet(id,j,v,n){CW.ro=CW.ro||{};if(n>1){const a=(CW.ro[id]||[]).slice();a[j]=v;CW.ro[id]=a}else CW.ro[id]=v;
  if(!id.includes('.'))Object.keys(CW.ro).filter(k=>k.startsWith(id+'.')).forEach(k=>{if(!roSpecs(CW.race).some(x=>x.id===k))delete CW.ro[k]});renderCharWiz()}
// the skills this people adds: fixed ones, chosen ones, and a skill picked as "a skill or a tool"
function roSkills(){const out=(PEOPLE_SKILLS[CW.race]||[]).slice();roSpecs(CW.race).forEach(x=>{const v=(CW.ro||{})[x.id];if(x.k==='skill')[].concat(v||[]).filter(Boolean).forEach(k=>out.push(k));if(x.k==='skilltool'&&v&&v.startsWith('s:'))out.push(v.slice(2))});return out}
function roTools(){const out=[];roSpecs(CW.race).forEach(x=>{const v=(CW.ro||{})[x.id];if(x.k==='tool')[].concat(v||[]).filter(Boolean).forEach(n=>out.push(n));if(x.k==='skilltool'&&v&&v.startsWith('t:'))out.push(v.slice(2))});return out}
function roMissing(){for(const x of roSpecs(CW.race)){if(x.k==='text')continue;const n=roN(x),v=(CW.ro||{})[x.id];const vals=n>1?(v||[]).filter(Boolean):[v].filter(Boolean);if(vals.length<n)return x.t;if(n>1&&new Set(vals).size<n)return x.t+': pick different ones'}return ''}
function roRandom(){CW.ro={};roSpecs(CW.race).forEach(function go(x){if(x.k==='text')return;const c=cwShuffle(roChoices(x).map(y=>y[0]));CW.ro[x.id]=roN(x)>1?c.slice(0,roN(x)):c[0];if(x.then&&x.then[CW.ro[x.id]])x.then[CW.ro[x.id]].forEach((y,j)=>go(Object.assign({id:x.id+'.'+j},y)))})}
// the lines the finished character keeps: one per choice, in plain words
function roLines(){const skn=k=>(SKILLS.find(y=>y[0]===k)||[])[1]||k;return roSpecs(CW.race).map(x=>{const v=(CW.ro||{})[x.id];if(!v||(Array.isArray(v)&&!v.filter(Boolean).length))return '';
  const show=x.k==='skill'?[].concat(v).map(skn).join(' and '):x.k==='abil'?(roAbil.find(a=>a[0]===v)||[])[1]:x.k==='skilltool'?(v.startsWith('s:')?skn(v.slice(2))+' (skill)':v.slice(2)+' (tool)'):[].concat(v).join(' and ');return x.t+': '+show}).filter(Boolean)}
function roStepHTML(){return roStepMain()+cwHeritageHTML()}
// the builder's optional heritage: a second people, its type, and one trait (see heritageHTML on the sheet)
function cwHeritageHTML(){const cur=CW.race2||'',f=cur?famOf(cur):'',M=f?famMembers(f):[],T=cur?heritageTraits(cur):[];
  return `<div class="cw-ro" style="margin:18px 0 0;border-top:1px dashed var(--line);padding-top:12px"><p class="cw-q" style="margin:0 0 6px"><b>Heritage</b> <small style="color:var(--muted)">optional: a second people in your family. It adds its innate spells, one of its traits, its language, and its darkvision if it sees farther.</small></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><select class="sel" onchange="cwHer('fam',this.value)"><option value="">No heritage</option>${peopleTop().filter(x=>x!==famOf(CW.race)||famMembers(x).length>1).map(x=>`<option${x===f?' selected':''}>${esc(x)}</option>`).join('')}</select>${M.length>1?`<select class="sel" onchange="cwHer('type',this.value)">${M.map(n=>`<option${n===cur?' selected':''}>${esc(n)}</option>`).join('')}</select>`:''}${T.length?`<select class="sel" onchange="cwHer('trait',this.value)"><option value="">Pick one trait…</option>${T.map(t=>`<option${t[0]===CW.race2Trait?' selected':''}>${esc(t[0])}</option>`).join('')}</select>`:''}</div>
    ${CW.race2Trait&&T.find(t=>t[0]===CW.race2Trait)?`<p class="note" style="margin:6px 0 0"><b>${esc(CW.race2Trait)}.</b> ${esc(T.find(t=>t[0]===CW.race2Trait)[1])}</p>`:''}</div>`}
function cwHer(k,v){if(k==='fam'){if(!v){delete CW.race2;delete CW.race2Trait}else{const M=famMembers(v);if(!M.includes(CW.race2)){CW.race2=M[0];delete CW.race2Trait}}}else if(k==='type'){if(CW.race2!==v)delete CW.race2Trait;CW.race2=v}else if(k==='trait'){if(v)CW.race2Trait=v;else delete CW.race2Trait}renderCharWiz()}
function roStepMain(){const skn=k=>(SKILLS.find(y=>y[0]===k)||[])[1]||k,fixed=PEOPLE_SKILLS[CW.race]||[],specs=roSpecs(CW.race);
  return `<p class="cw-q">Your people, <b>${esc(CW.race)}</b>, lets you make ${specs.length?'a few choices':fixed.length?'no choices, but gives you some skills':'no choices'}.${peopleInfo(CW.race)?` <span class="cw-info" role="link" tabindex="0" onclick="peoplePop(${esc(JSON.stringify(CW.race))})">ⓘ Full profile</span>`:''}</p>
    ${fixed.length?`<p class="note">Your people always gives <b>+1</b> to ${fixed.map(skn).join(' and ')}. It is added on the skills step.</p>`:''}
    ${specs.map(x=>{const n=roN(x),ch=roChoices(x);return `<div class="cw-ro" style="margin:12px 0"><p class="cw-q" style="margin:0 0 4px"><b>${esc(x.t)}</b>${x.d?` <small style="color:var(--muted)">${esc(x.d)}</small>`:''}${x.k==='skill'?` <small style="color:var(--muted)">(+1 to ${n===1?'it':'each'})</small>`:''}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${x.k==='text'?`<input class="sel" style="max-width:360px" placeholder="${esc(x.ph||'')}" value="${esc(roVal(x,0))}" onchange="CW.ro=CW.ro||{};CW.ro['${x.id}']=this.value.trim()">`:Array.from({length:n},(_,j)=>`<select class="sel" style="max-width:300px" onchange="roSet('${x.id}',${j},this.value,${n})"><option value="">Choose…</option>${ch.map(([v,l])=>`<option value="${esc(v)}"${roVal(x,j)===v?' selected':''}>${esc(l)}</option>`).join('')}</select>`).join('')}</div></div>`}).join('')}
    ${specs.some(x=>x.k==='tool'||x.k==='skilltool')?'<p class="note">A tool from your people is a proficiency of its own, on top of the one your background gives.</p>':''}`}
const peopleInfo=n=>typeof PEOPLES!=='undefined'&&PEOPLES.info?PEOPLES.info[n]||null:null;
// a people's knack for one profession (data/people-prof.json): +1 to that profession's rolls, before or after taking it
// up ('*' is the profession the character has); an orc adds +1 to Scavenging
// Professions on the sheet: the main one and an optional second one, each with its own level, stage and title; the
// specialties list covers both (campaign rule: a character can hold two professions, 2026-11-11)
function sheetProfHTML(c,inp){
  const one=(pk,lk,label)=>{const p=c[pk],lv=+c[lk]||0,pb=p?peopleProf(c,p):0;
    return `<div class="sh-row" style="flex-wrap:wrap"><select data-s="${pk}" aria-label="${label}"><option value="">${pk==='prof'?'Profession…':'Second profession…'}</option>${Object.keys(PROFS).filter(x=>pk==='prof'?x!==c.prof2:x!==c.prof).map(x=>`<option${x===p?' selected':''}>${x}</option>`).join('')}</select><label class="note" style="margin:0">Level ${inp(lk,'0','class="sh-mini" min="0" max="100"','number')}</label>${p?`<b>${esc(profTitle(p,lv))}</b><small>stage ${ROMAN[stageOf(lv)-1]} · ${p==='Scavenging'?'crafting and scavenging':'profession'} bonus +${Math.floor(lv/2)+pb}${pb?` (+${pb} from ${esc(c.race)})`:''}</small>`:''}</div>`};
  const P=peopleInfo(c.race),k=P&&P.prof&&Object.keys(P.prof)[0];
  const profs=[c.prof,c.prof2].filter(p=>p&&PROFS[p]);
  const all=specsFor(c);
  const feats=[['prof','profLv'],['prof2','prof2Lv']].flatMap(([pk,lk])=>{const p=c[pk],pl=+c[lk]||0;return p?profStages(p).filter(x=>x.stage<=stageOf(pl)).flatMap(x=>x.features.filter(f=>f[0]<=pl).map(f=>[p,f])):[]});
  return one('prof','profLv','Profession')
    +(c.prof||c.prof2?(()=>{const o=prof2Open(c),cap=prof2Cap(c);return o.ok?one('prof2','prof2Lv','Second profession')+(c.prof2&&(+c.prof2Lv||0)>cap?`<div class="note" style="margin:4px 0 0">Counts as level ${cap}: your table caps a second profession at the first's level.</div>`:''):`<div class="note" style="margin:6px 0 0">${esc(o.why)}${c.prof2?' '+esc(c.prof2)+' is kept but doesn\'t count until then.':''}</div>`})():'')
    +(k&&k!=='*'&&k!==c.prof&&k!==c.prof2?`<div class="note" style="margin:4px 0 0">${esc(c.race)}: +${P.prof[k]} to ${esc(k)} rolls, even without the profession.</div>`:'')
    +(all.length?`<div class="chips">${all.map(x=>{const on=(c.specs||[]).includes(x);return `<button class="chip" type="button" onclick="sheetSpec(${esc(JSON.stringify(x))})" style="${on?'border-color:var(--gold);background:var(--goldbg)':''}">${on?'✓ ':''}${esc(x)}</button>`}).join('')}</div><div class="note" style="margin:0">Specialties: tap to mark the ones you hold (one to start, one free every 5 levels in each profession).</div>`:'')
    +(feats.length?`<ul class="sh-ul">${feats.map(([p,f])=>`<li><b>${esc(f[1])}</b> (${profs.length>1?esc(p)+' ':''}Lv ${f[0]}): ${esc(f[2])}</li>`).join('')}</ul>`:'')}
// a character's professions and their levels (the main one first); a second profession levels on its own
// the table's rule for a second profession (Settings → Table rules): free, unlocked at a level of the first, capped at
// the first's level, both, or not allowed
const PROF2_MODES=[['free','Allowed freely'],['gate','Unlocks when the first profession reaches a level'],['cap','Allowed, never above the first profession\'s level'],['both','Unlocks at a level, and never above the first'],['off','Not allowed']];
const profRule=()=>{const r=store.get('rules',{})||{};return {mode:PROF2_MODES.some(m=>m[0]===r.prof2)?r.prof2:'free',at:Math.max(1,Math.min(100,+r.prof2At||10))}};
// whether a character may hold a second profession now, and if not, why
function prof2Open(c){const R=profRule(),l1=+(c&&c.profLv)||0;if(R.mode==='off')return {ok:false,why:'Your table doesn\'t allow a second profession.'};
  if((R.mode==='gate'||R.mode==='both')&&l1<R.at)return {ok:false,why:'A second profession unlocks when '+(c&&c.prof?c.prof:'the first profession')+' reaches level '+R.at+'.'};return {ok:true}}
const prof2Cap=c=>{const R=profRule();return R.mode==='cap'||R.mode==='both'?(+c.profLv||0):100};
const profsOf=c=>[c&&c.prof?[c.prof,+c.profLv||0]:null,c&&c.prof2&&prof2Open(c).ok?[c.prof2,Math.min(+c.prof2Lv||0,prof2Cap(c))]:null].filter(Boolean);
const hasProfession=(c,p)=>!!p&&profsOf(c).some(x=>lc(x[0])===lc(p));
const profLvIn=(c,p)=>{const x=profsOf(c).find(y=>lc(y[0])===lc(p||''));return x?x[1]:0};
// the specialties a character's professions offer; changing a profession keeps only the specialties still offered
const specsFor=c=>[...new Set([c.prof,c.prof2].filter(p=>p&&PROFS[p]).flatMap(p=>PROFS[p].abs.concat(BPS.filter(b=>b.pr===p&&b.sp&&b.sp!==b.pr).map(b=>b.sp))))].sort();
function specsKeep(c){const ok=new Set(specsFor(c));c.specs=(c.specs||[]).filter(x=>ok.has(x))}
const profLabel=c=>profsOf(c).map(([p,l])=>p+' '+l).join(', ');
function peopleProf(c,prof){const P=c&&peopleInfo(c.race),o=P&&P.prof;if(!o||!prof)return 0;return (o[prof]||0)+(o['*']&&hasProfession(c,prof)?o['*']:0)}
const peopleLine=n=>{const P=peopleInfo(n),r=CW_RACE.find(x=>x[0]===n);if(!P)return r?`speed ${r[3]} ft`:'';return [P.size,(P.type||'')+'',`speed ${P.speed||(r||[])[3]||30} ft`+(P.fly?`, fly ${P.fly}`:'')+(P.swim?`, swim ${P.swim}`:'')+(P.climb?`, climb ${P.climb}`:''),P.dv?`darkvision ${P.dv} ft`:'no darkvision'].filter(Boolean).join(' · ')};
function peopleHTML(n){const P=peopleInfo(n),r=CW_RACE.find(x=>x[0]===n)||[n,'',{},30,'',''];const b=r[2]||{},bon=Object.entries(b).map(([a,v])=>a.toUpperCase()+' +'+v).join(', ');
  if(!P)return `<p>${esc(r[1])}</p><p class="note">${esc(r[4])}</p>`;
  return `<p style="font-family:var(--serif);font-size:1.02rem;line-height:1.6;margin:0 0 8px">${esc(P.desc||r[1])}</p>${P.vestige?`<p class="note" style="margin:0 0 10px"><b>In Vestige:</b> ${esc(P.vestige)}</p>`:''}
    <div class="kvg" style="margin-bottom:12px">${[['Ability scores',bon||'—'],['Size',P.size],['Creature type',P.type],['Speed',`${P.speed||r[3]} ft`+(P.fly?` · fly ${P.fly} ft`:'')+(P.swim?` · swim ${P.swim} ft`:'')+(P.climb?` · climb ${P.climb} ft`:'')],['Darkvision',P.dv?P.dv+' ft':'None'],['Other senses',P.senses||'—'],['Languages',(P.langs||[]).join(', ')],['Height',P.height],['Weight',P.weight],['Age',P.age]].map(([k,v])=>`<div><span>${k}</span><b>${esc(v||'—')}</b></div>`).join('')}</div>
    <div class="blk"><h4>Traits</h4><div class="mlist">${(P.traits||[]).map(([t,d])=>`<div style="padding:8px 11px;border-bottom:1px solid var(--line)"><b>${esc(t)}.</b> <span style="font-size:.88rem;color:var(--text2)">${esc(d)}</span></div>`).join('')}</div></div>
    <p class="note" style="margin:8px 0 0">${esc(r[5]||'')}${r[5]==='Peoples of the realms'?' · FAND homebrew':' · from 5e, written in plain English'}. In FAND, the Common tongue plus one language from your people and one from your background.</p>`}
function peoplePop(n){let host=document.getElementById('peopleHost');if(!host){host=document.createElement('div');host.id='peopleHost';document.body.appendChild(host)}
  if(!n){host.innerHTML='';return}host.innerHTML=`<div class="scav-pop" onclick="if(event.target===this)peoplePop()" role="dialog" aria-modal="true" aria-label="${esc(n)}"><div class="scav-win"><div class="panel" style="border-color:var(--gold)"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:8px"><h4 style="margin:0;font-size:1.4rem;font-family:var(--serif)">${esc(n)}</h4><span class="note" style="margin:0">${esc(peopleLine(n))}</span><button class="btn" style="margin-left:auto" type="button" onclick="peoplePop()">Close</button></div>${peopleHTML(n)}</div></div></div>`}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#peopleHost .scav-pop'))peoplePop()});

// [name, description, two trained skills, group, starting profession (level 1) or '']
const CW_BG=[
  ['Soldier','You served in an army or a militia.',['athletics','intimidation'],'Classic',''],
  ['Acolyte','You served in a temple of a god.',['insight','religion'],'Classic',''],
  ['Criminal','You lived outside the law.',['deception','stealth'],'Classic',''],
  ['Sage','You spent years studying books and lore.',['arcana','history'],'Classic',''],
  ['Folk Hero','Common people see you as their champion.',['animal','survival'],'Classic',''],
  ['Noble','You were born to wealth and a family name.',['history','persuasion'],'Classic',''],
  ['Outlander','You grew up far from towns, in the wilds.',['athletics','survival'],'Classic',''],
  ['Entertainer','You performed for crowds.',['acrobatics','performance'],'Classic',''],
  ['Hermit','You lived alone for a long time, seeking something.',['medicine','religion'],'Classic',''],
  ['Sailor','You worked on ships and know the sea.',['athletics','perception'],'Classic',''],
  ['Urchin','You grew up poor on city streets.',['sleight','stealth'],'Classic',''],
  ['Charlatan','You made a living tricking people.',['deception','sleight'],'Classic',''],
  ['Guild Artisan','You learned a trade in a craft guild.',['insight','persuasion'],'Classic','Engineering'],
  ['Knight','You served a lord as a sworn knight.',['history','persuasion'],'Classic',''],
  ['Pirate','You sailed under a black flag.',['athletics','intimidation'],'Classic',''],
  ['Spy','You gathered secrets for someone powerful.',['deception','stealth'],'Classic',''],
  ['Gladiator','You fought in the arena for a crowd.',['acrobatics','performance'],'Classic',''],
  ['City Watch','You kept the peace in a town or city.',['athletics','insight'],'Classic',''],
  ['Courtier','You know the ways of a royal court.',['insight','persuasion'],'Classic',''],
  ['Far Traveler','You come from a distant land no one here knows.',['insight','perception'],'Classic',''],
  ['Mercenary Veteran','You fought for whoever paid best.',['athletics','persuasion'],'Classic',''],
  ['Bounty Hunter','You tracked people down for coin.',['investigation','stealth'],'Classic',''],
  ['Investigator','You solved crimes and mysteries.',['insight','investigation'],'Classic',''],
  ['Archaeologist','You dug up the ruins of the past.',['history','survival'],'Classic',''],
  ['Haunted One','Something terrible from your past still follows you.',['arcana','survival'],'Classic',''],
  ['Inheritor','You were left something important and mysterious.',['survival','arcana'],'Classic',''],
  ['Cloistered Scholar','You studied in a great library.',['history','religion'],'Classic',''],
  ['Clan Crafter','You learned your craft from your family clan.',['history','insight'],'Classic','Blacksmithing'],
  ['Farmhand','You worked the fields and tended animals.',['animal','nature'],'Classic','Harvesting'],
  ['Hunter','You hunted game to feed your village.',['survival','stealth'],'Classic',''],
  // FAND: lives that only make sense in Vestige; many start you in a profession
  ['Temple Ward','You were raised in a god\'s temple. Its followers know you, which counts as meeting a follower if you ever seek a contract.',['religion','insight'],'Vestige',''],
  ['Contract Runner','You carried messages and errands for a god\'s contractors.',['persuasion','athletics'],'Vestige',''],
  ['Tower Climber','You survived the lower floors of a Tower and want more.',['athletics','perception'],'Vestige',''],
  ['Realm Smuggler','You carried goods across realm borders, past the Pressure and the tolls.',['deception','survival'],'Vestige','Navigation'],
  ['Corpse Picker','You followed hunters and stripped what they killed.',['medicine','survival'],'Vestige','Scavenging'],
  ['Forge Apprentice','You swept the floors and worked the bellows in a smithy.',['athletics','history'],'Vestige','Blacksmithing'],
  ['Mine Hand','You dug in a realm\'s mine shafts.',['athletics','perception'],'Vestige','Harvesting'],
  ['Rune Scholar','You studied the Runes, their lineage, and the gods who hold them.',['arcana','history'],'Vestige','Enchanting'],
  ['Herb Gatherer','You gathered plants for an alchemist.',['nature','medicine'],'Vestige','Alchemy'],
  ['Camp Cook','You fed soldiers or caravans on the road.',['survival','insight'],'Vestige','Cooking'],
  ['Hide Worker','You tanned hides and sewed leather.',['animal','sleight'],'Vestige','Tailoring'],
  ['Woodcarver','You carved wood and bone in a workshop.',['nature','sleight'],'Vestige','Carving'],
  ['Moneychanger','You swapped coin between the realms and took your cut.',['insight','persuasion'],'Vestige',''],
  ['Pressure-Born','You grew up in a deeper realm, and its Pressure shaped you.',['survival','medicine'],'Vestige',''],
  ['Pilgrim','You walked the temple passages from shrine to shrine.',['religion','survival'],'Vestige',''],
  ['Necromancer\'s Servant','You served a necromancer and saw what the dead can be made to do.',['arcana','medicine'],'Vestige',''],
  ['Finger\'s Retainer','You served one of a god\'s Fingers, its five greatest contractors.',['insight','history'],'Vestige',''],
  ['Rift Survivor','You lived through a Chaos breach or a Void tear that swallowed your home.',['survival','perception'],'Vestige',''],
  ['Anthropologist','You lived among other peoples to learn their ways.',['insight','religion'],'Classic',''],
  ['Athlete','You trained your body for races, wrestling, and games.',['acrobatics','athletics'],'Classic',''],
  ['Faceless','You hide your true face behind a mask and a legend.',['deception','intimidation'],'Classic',''],
  ['Feylost','You spent years lost in a fey land and came back changed.',['deception','survival'],'Classic',''],
  ['Fisher','You worked the nets and lines on rivers and coasts.',['history','survival'],'Classic',''],
  ['Marine','You fought on ships and stormed beaches.',['athletics','survival'],'Classic',''],
  ['Shipwright','You built and mended ships in a dockyard.',['history','perception'],'Classic','Carving'],
  ['Smuggler','You moved goods past the guards and the tax collectors.',['athletics','deception'],'Classic',''],
  ['Guard','You stood watch on walls, gates, and caravans.',['athletics','perception'],'Classic',''],
  ['Guide','You led travellers through wild and dangerous country.',['stealth','survival'],'Classic',''],
  ['Merchant','You bought, sold, and haggled along the trade roads.',['animal','persuasion'],'Classic',''],
  ['Scribe','You copied books, letters, and contracts by hand.',['investigation','perception'],'Classic',''],
  ['Wayfarer','You grew up on the road with nothing but your wits.',['insight','stealth'],'Classic',''],
  ['Astral Drifter','You wandered the silver space between the realms.',['insight','religion'],'Classic',''],
  ['Wildspacer','You crewed a ship that sailed between the stars.',['athletics','survival'],'Classic',''],
  ['Reformed Cultist','You once served a dark power and walked away from it.',['deception','religion'],'Classic',''],
  ['Rewarded','A great power granted you a single wish, and it changed your life.',['insight','persuasion'],'Classic',''],
  ['Gate Warden','You guarded a crossing between two worlds.',['persuasion','survival'],'Classic',''],
  ['Planar Philosopher','You argued about the nature of the realms with anyone who would listen.',['arcana','persuasion'],'Classic',''],
  ['Grinner','You were a travelling performer who secretly fought a tyrant.',['deception','performance'],'Classic',''],
  ['Lorehold Student','You studied history and spoke with the spirits of the past.',['history','religion'],'Classic',''],
  ['Quandrix Student','You studied the magic of numbers and nature.',['arcana','nature'],'Classic',''],
  ['Witherbloom Student','You studied the magic of life, death, and swamps.',['nature','survival'],'Classic',''],
  ['Contract Clerk','You drew up binding contracts in Hell\'s halls, and you read the small print.',['insight','persuasion'],'Vestige',''],
  ['Halo Bearer','You carried lamps and messages for Heaven\'s choirs.',['religion','medicine'],'Vestige',''],
  ['Tower Guide','You led paying climbers up the first floors of a Tower, and brought most of them back.',['athletics','survival'],'Vestige',''],
  ['Godfall Digger','You dug through the remains where a god once fell.',['athletics','history'],'Vestige','Scavenging'],
  ['Abyssal Diver','You dove the drowned layers of the Abyss for treasure.',['athletics','survival'],'Vestige',''],
  ['Star-Chart Apprentice','You helped map the routes between the realms.',['arcana','perception'],'Vestige','Navigation'],
  ['Golem Tender','You oiled, wound, and repaired a workshop\'s golems.',['arcana','investigation'],'Vestige','Engineering'],
  ['Shrine Keeper','You kept a god\'s shrine clean and its followers fed.',['religion','insight'],'Vestige',''],
  ['Pressure Medic','You treated travellers who pushed too deep into a realm\'s Pressure.',['medicine','survival'],'Vestige',''],
  ['Finger\'s Messenger','You ran errands for one of a god\'s Fingers.',['persuasion','religion'],'Vestige',''],
  ['Void Watcher','You stood watch on the edge of the Void and counted what came out.',['perception','arcana'],'Vestige',''],
  ['Chaos Gambler','You bet on outcomes in a realm where nothing stays the same.',['deception','sleight'],'Vestige',''],
  ['Miner\'s Child','You grew up in a mining town and swung a pick before you could read.',['athletics','nature'],'Vestige','Harvesting']
];
const CW_ABIL_TXT={str:'Lifting, pushing, and hitting with heavy weapons',dex:'Speed, aim, balance, and dodging',con:'Toughness and hit points',int:'Memory, study, and book magic',wis:'Awareness, instinct, and priest or nature magic',cha:'Charm, presence, and inborn or pact magic'};
const CW_PERS={
  traits:['I always have a plan, even if it is a bad one.','I am slow to trust, but loyal for life once I do.','I talk too much when I am nervous.','I collect small trinkets from every place I visit.','I face danger with a joke.','I am polite to everyone, even my enemies.','I hate to sit still.','I write down everything that happens to me.'],
  ideals:['Freedom: no one should be owned by anyone.','Honor: I keep my word, whatever it costs.','Knowledge: the truth is worth any risk.','Family: the people close to me come first.','Glory: I want my name remembered.','Balance: too much of anything is dangerous.'],
  bonds:['I am searching for someone I lost.','I owe my life to the person who saved me.','I protect the place where I grew up.','I want to repay a debt that cannot be paid with coin.','An old friend betrayed me, and I want to know why.','I carry an heirloom that must not fall into the wrong hands.'],
  flaws:['I cannot resist a good bet.','I trust the wrong people too easily.','I lose my temper when I am insulted.','I keep secrets, even from my friends.','I run from a fight I think I cannot win.','I want more gold than I need.']
};
const CW_ALIGN=[['Lawful good','Does the right thing, by the rules'],['Neutral good','Does the right thing, whatever it takes'],['Chaotic good','Does the right thing, in their own way'],['Lawful neutral','Follows the rules above all'],['True neutral','Keeps to the middle'],['Chaotic neutral','Follows their heart and freedom'],['Lawful evil','Takes what they want, within a code'],['Neutral evil','Takes what they want'],['Chaotic evil','Takes what they want, any way they can']];
const CW_STEPS=['Welcome','Class','People','People options','Abilities','Background','Skills, proficiency, and languages','Magic','Equipment','Name and personality','Finish'];
// Campaign rules for a new character: the background gives +1 to its skills and at most ONE proficiency; then the player may
// move a skill point twice (take 1 from one skill, give 1 to another). Later, skills rise only through class or equipment, and
// every other proficiency must be taught by a teacher or earned by long use (written in the backstory).
const CW_MOVES=2,CW_SK_MIN=-1,CW_SK_MAX=2;
// proficiency is item by item (campaign rule): knowing the longsword does not teach the rapier
const CW_PROF_GROUPS=[['Simple weapons',['Club','Dagger','Greatclub','Handaxe','Javelin','Light hammer','Mace','Quarterstaff','Sickle','Spear','Light crossbow','Dart','Shortbow','Sling']],
  ['Martial weapons',['Battleaxe','Flail','Glaive','Greataxe','Greatsword','Halberd','Lance','Longsword','Maul','Morningstar','Pike','Rapier','Scimitar','Shortsword','Trident','War pick','Warhammer','Whip','Blowgun','Hand crossbow','Heavy crossbow','Longbow','Net']],
  ['Armor',['Padded armor','Leather armor','Studded leather','Hide armor','Chain shirt','Scale mail','Breastplate','Half plate','Ring mail','Chain mail','Splint armor','Plate armor','Shield']],
  ['Tools',['Thieves\' tools','Smith\'s tools','Tinker\'s tools','Herbalism kit','Alchemist\'s supplies','Cook\'s utensils','Leatherworker\'s tools','Woodcarver\'s tools','Navigator\'s tools','Disguise kit','Forgery kit','Poisoner\'s kit','Carpenter\'s tools','Mason\'s tools','Cartographer\'s tools']],
  ['Instruments and games',['Lute','Flute','Drum','Lyre','Horn','Bagpipes','Viol','Dice set','Playing cards']],
  ['Vehicles',['Land vehicles (cart, wagon)','Water vehicles (boat, ship)']]];
const CW_PROFS=CW_PROF_GROUPS.flatMap(g=>g[1]);
const CW_PROF_HINT={Fighter:'Longsword',Barbarian:'Greataxe',Paladin:'Longsword',Ranger:'Longbow',Rogue:'Thieves\' tools',Monk:'Quarterstaff',Cleric:'Mace',Druid:'Herbalism kit',Bard:'Lute',Artificer:'Tinker\'s tools',Wizard:'Quarterstaff',Sorcerer:'Dagger',Warlock:'Dagger'};
// languages (campaign rule): Common, one from the character's people, and one from their background
const CW_LANGS=['Dwarvish','Elvish','Giant','Gnomish','Goblin','Halfling','Orc','Abyssal','Celestial','Draconic','Deep Speech','Infernal','Primordial','Sylvan','Undercommon'];
function cwLangGuess(name,bg){const n=lc(name||'');if(!bg){if(/elf|eladrin|drow/.test(n))return 'Elvish';if(/dwar|duergar/.test(n))return 'Dwarvish';if(/gnome/.test(n))return 'Gnomish';if(/halfling/.test(n))return 'Halfling';if(/orc/.test(n))return 'Orc';if(/goblin|bugbear/.test(n))return 'Goblin';if(/dragon|kobold/.test(n))return 'Draconic';if(/tiefling|hell|devil/.test(n))return 'Infernal';if(/aasimar|heaven|angel/.test(n))return 'Celestial';if(/genasi|elemental/.test(n))return 'Primordial';if(/giant|goliath|firbolg/.test(n))return 'Giant';if(/fey|satyr|faun|pixie|sprite/.test(n))return 'Sylvan';if(/abyss|demon/.test(n))return 'Abyssal';return ''}
  if(/temple|acolyte|priest|heaven/.test(n))return 'Celestial';if(/hell|infernal/.test(n))return 'Infernal';if(/abyss/.test(n))return 'Abyssal';if(/sage|scholar|scribe|library/.test(n))return 'Draconic';if(/criminal|thief|urchin|smuggl/.test(n))return 'Undercommon';if(/forge|smith|mine|miner/.test(n))return 'Dwarvish';if(/forest|hunter|outlander|ranger/.test(n))return 'Sylvan';return ''}
// spells chosen at creation: [cantrips, 1st-level spells], all from the character's first school
// campaign rule: every caster starts with 4 cantrips; a full caster then learns 2 spells a level, a half caster 1
const CW_SPELLS={Bard:[4,2],Cleric:[4,2],Druid:[4,2],Sorcerer:[4,2],Warlock:[4,2],Wizard:[4,2],Artificer:[4,1],Paladin:[4,1],Ranger:[4,1]};
// point buy: 27 points, scores 8 to 15 before the people's bonus
const CW_BUY_COST={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9},CW_BUY_POINTS=27;
const cwBuyLeft=()=>CW_BUY_POINTS-ABIL.reduce((a,[k])=>a+(CW_BUY_COST[(CW.buy||{})[k]||8]||0),0);
function cwBuy(a,d){if(!CW.buy){const k=CW_CLASS[CW.cls];CW.buy={};k.o.forEach((x,i)=>CW.buy[x]=[15,14,13,12,10,8][i])}const v=(CW.buy[a]||8)+d;if(v<8||v>15)return;const old=CW.buy[a];CW.buy[a]=v;if(cwBuyLeft()<0){CW.buy[a]=old;toast('Not enough points left');return}renderCharWiz()}
// starting equipment: the class kit split into items and matched to the site's Blueprints and materials, or gold instead
const CW_GOLD={Fighter:155,Barbarian:75,Paladin:150,Ranger:150,Rogue:100,Monk:50,Cleric:110,Druid:50,Wizard:55,Sorcerer:50,Warlock:100,Bard:90,Artificer:150};
const CW_NUMW={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,ten:10,twenty:20};
function cwKitItems(kit){return String(kit||'').split(/,\s*|\s+and\s+|\s+with\s+/).map(x=>x.trim()).filter(Boolean).map(x=>{let q=1;const m=/^(\d+|a|an|one|two|three|four|five|six|ten|twenty)\s+(.+)$/i.exec(x);if(m){q=+m[1]||CW_NUMW[lc(m[1])]||1;x=m[2]}return {n:x.charAt(0).toUpperCase()+x.slice(1),q}})}
function cwMatch(n){const C=[n,n.replace(/ies$/,'y'),n.replace(/es$/,''),n.replace(/s$/,''),n.replace(/^Pouch of /i,'')];for(const c of C)for(const x of [findBP('Plain '+c),findBP(c)])if(x&&x.starter)return x;for(const c of C){const b=findBP(c);if(b)return b;const m=findMat(c);if(m)return m}return null}
// leaving a kit item out gives back its list price
const cwRefund=()=>CW.eqMode==='gold'?0:Math.round(cwKitItems((CW_CLASS[CW.cls]||{}).kit).reduce((a,x,i)=>a+((CW.eqOff||[]).includes(i)?((cwMatch(x.n)||{}).gp||0)*x.q:0),0)*100)/100;
const cwEquipList=()=>CW.eqMode==='gold'?[]:cwKitItems((CW_CLASS[CW.cls]||{}).kit).filter((x,i)=>!(CW.eqOff||[]).includes(i)).concat((CW.eqAdd||[]).map(n=>({n,q:1})));
// a background that starts you in a profession gives only the profession: no trained skill, and disadvantage on one
// skill of the player's choice (the years at the workbench cost something)
const cwBgSkills=bg=>bg?(bg[4]?[]:bg[2]):[];
// starting skills: the background's, plus +1 to each of the class's own skills
function cwSkillInit(){const key=CW.bg+'|'+CW.cls+'|'+CW.race+'|'+roSkills().join(',');if(CW.skFor===key)return;const bg=CW_BG.find(x=>x[0]===CW.bg);CW.sk={};cwBgSkills(bg).forEach(k=>CW.sk[k]=1);((CW_CLASS[CW.cls]||{}).sk||[]).forEach(k=>CW.sk[k]=(CW.sk[k]||0)+1);roSkills().forEach(k=>CW.sk[k]=(CW.sk[k]||0)+1);CW.moves=0;CW.skFor=key;if(!CW.prof)CW.prof=CW_PROF_HINT[CW.cls]||''}
function cwMove(){const a=$('cw-from').value,b=$('cw-to').value;if(!a||!b||a===b){toast('Pick two different skills');return}const va=CW.sk[a]||0,vb=CW.sk[b]||0;
  if(CW.moves>=CW_MOVES)return;if(va-1<CW_SK_MIN){toast('A skill cannot go below '+CW_SK_MIN);return}if(vb+1>CW_SK_MAX){toast('A skill cannot go above +'+CW_SK_MAX+' at creation');return}
  CW.sk[a]=va-1;CW.sk[b]=vb+1;CW.moves++;renderCharWiz()}
let CW=null;
const cwPick=a=>a[Math.floor(Math.random()*a.length)];
function cwName(){const A=['Ar','Bel','Cor','Da','El','Fen','Gar','Hal','Is','Jor','Kael','Lir','Mor','Nym','Or','Per','Quin','Ros','Syl','Tor','Ul','Vor','Wyn','Yr','Zan'],B=['a','e','i','o','ae','ia','or','an','el','ys'],C=['n','th','ra','dor','wen','mir','ric','vyn','las','ia','ro','ek','dra','mund','sha'];return cwPick(A)+cwPick(B)+cwPick(C)}
function cwRoll(){return Array.from({length:6},()=>{const d=[1,2,3,4].map(()=>1+Math.floor(Math.random()*6)).sort((a,b)=>b-a);return d[0]+d[1]+d[2]}).sort((a,b)=>b-a)}
function cwBase(){const k=CW_CLASS[CW.cls];if(CW.method==='buy'){if(!CW.buy){CW.buy={};k.o.forEach((x,i)=>CW.buy[x]=[15,14,13,12,10,8][i])}return Object.assign({},CW.buy)}const v=CW.method==='roll'?(CW.rolled||(CW.rolled=cwRoll())):[15,14,13,12,10,8],o={};k.o.forEach((a,i)=>o[a]=v[i]);return o}
function cwRaceBonus(){const r=(CW_RACE.find(x=>x[0]===CW.race)||[])[2]||{};if(r!=='flex')return r;const k=CW_CLASS[CW.cls];return k?{[k.o[0]]:2,[k.o[1]]:1}:{}}
function cwScores(){const b=cwBase(),r=cwRaceBonus(),o={};ABIL.forEach(([a])=>o[a]=b[a]+(r[a]||0));return o}
function charWizard(pre){CW={step:0,cls:'',race:'',method:'std',bg:'',name:'',align:'',traits:cwPick(CW_PERS.traits),ideals:cwPick(CW_PERS.ideals),bonds:cwPick(CW_PERS.bonds),flaws:cwPick(CW_PERS.flaws)};if(pre&&typeof pre==='object')Object.assign(CW,pre);if(TAB!=='sheet'){store.set('charwiz',pre&&typeof pre==='object'?pre:1);go('sheet');return}renderCharWiz()}
const cwSkip=()=>{const n=CW_STEPS[CW.step];return n==='Magic'&&!CW_SPELLS[CW.cls]||false};
function cwSet(k,v,next){CW[k]=v;if(k==='race'){CW.ro={};CW.famOpen='';if(CW.race2===v){delete CW.race2;delete CW.race2Trait}}if(k==='method'&&v==='roll'&&!CW.rolled)CW.rolled=cwRoll();if(next){CW.step++;if(cwSkip())CW.step++}renderCharWiz()}
function cwGo(d){if(d>0&&!cwOk())return;CW.step=Math.max(0,Math.min(CW_STEPS.length-1,CW.step+d));if(cwSkip())CW.step+=d>0?1:-1;renderCharWiz();window.scrollTo(0,0);$('content').scrollTop=0}
function cwOk(){const s=CW.step;if(s===3){const m=roMissing();if(m){toast('Choose: '+m);return false}}if(s===6&&STYLE_AT[CW.cls]===1&&!CW.style){toast('Choose a Fighting Style');return false}if(s===6&&!CW.prof){toast('Pick the one proficiency your background gives');return false}if(s===1&&!CW.cls){toast('Pick a class, or press Surprise me');return false}if(s===2&&!CW.race){toast('Pick a people, or press Surprise me');return false}if(s===5&&!CW.bg){toast('Pick a background, or press Surprise me');return false}if(s===6&&(CW_BG.find(x=>x[0]===CW.bg)||[])[4]&&!CW.disSkill){toast('Choose the skill with disadvantage');return false}if(s===6&&(!CW.langR||!CW.langB)){toast('Pick a language from your people and one from your background');return false}if(s===7&&CW_SPELLS[CW.cls]){if(!CW.school){toast('Choose your school of magic');return false}const [nc,n1]=CW_SPELLS[CW.cls];if((CW.sp0||[]).length<Math.min(nc,cwSchoolSpells(0).length)||(CW.sp1||[]).length<Math.min(n1,cwSchoolSpells(1).length)){toast(`Pick ${nc?nc+' cantrips and ':''}${n1} first-level spells`);return false}}if(s===9&&!CW.name.trim()){toast('Give your character a name (or press Random name)');return false}return true}
const CW_SEARCH_MIN=12;// a step with more choices than this gets a search bar
function cwSearch(n,ph){return n>CW_SEARCH_MIN?`<input class="sel cw-search" type="search" placeholder="${ph} (${n})" oninput="cwFilter(this)" style="max-width:none;width:100%;margin:0 0 10px">`:''}
function cwFilter(inp){const q=inp.value.trim().toLowerCase(),box=inp.closest('.cw');box.querySelectorAll('.cw-opt').forEach(b=>b.hidden=!!q&&!b.textContent.toLowerCase().includes(q));
  box.querySelectorAll('.cw-group').forEach(g=>g.hidden=![...g.querySelectorAll('.cw-opt')].some(b=>!b.hidden));const e=box.querySelector('.cw-none');if(e)e.style.display=box.querySelector('.cw-opt:not([hidden])')?'none':'block'}
function cwGroups(list,gi,card){const G=[];list.forEach(x=>{let g=G.find(y=>y[0]===x[gi]);if(!g)G.push(g=[x[gi],[]]);g[1].push(x)});
  return G.map(([n,xs])=>`<div class="cw-group">${G.length>1?`<h4 class="cw-gh">${esc(n)} <small>${xs.length}</small></h4>`:''}<div class="cw-grid">${xs.map(card).join('')}</div></div>`).join('')+'<div class="cw-none note" style="display:none">Nothing matches. Try another word.</div>'}
function cwOpt(on,title,body,click,tag){return `<button type="button" class="cw-opt${on?' on':''}" onclick="${click}"><b>${title}</b>${tag?` <span class="b gold">${tag}</span>`:''}<div>${body}</div></button>`}
function renderCharWiz(){
  const s=CW.step,k=CW_CLASS[CW.cls],skn=x=>(SKILLS.find(y=>y[0]===x)||[])[1]||x;let body='';
  if(s===0)body=`<div class="cw-hero"><h3>Make your first character</h3><p>No rulebook needed. Answer a few simple questions and the site fills in the whole character sheet for you: scores, hit points, skills, languages, spells, and starting gear. You can change anything afterwards.</p>
    <ol><li><b>Class:</b> what your character does in a fight and out of it.</li><li><b>People:</b> who they are born as.</li><li><b>People options:</b> the choices their people gives, like skills, a tool, or a dragon ancestry.</li><li><b>Abilities:</b> what they are good at.</li><li><b>Background:</b> what they did before adventuring, and the languages they speak.</li><li><b>Magic:</b> for spellcasters, their school and first spells.</li><li><b>Equipment:</b> their starting kit, or gold.</li><li><b>Name and personality.</b></li></ol>
    <p class="note">Everything starts at level 1. In FAND you level up by doing something big (beating a Tower floor, finishing a task for a god), when your DM says so.</p></div>`;
  if(s===1)body=`<p class="cw-q">How do you want to play? Pick the one that sounds most fun. Classes marked <span class="b gold">Easy start</span> are the simplest for a first game.</p>
    ${cwSearch(Object.keys(CW_CLASS).length,'Search classes')}<div class="cw-grid">${Object.entries(CW_CLASS).map(([n,x])=>cwOpt(CW.cls===n,n,`${esc(x.t)}<br><small>${esc(x.play)}</small>`,`cwSet('cls','${n}',1)`,x.easy?'Easy start':'')).join('')}</div>`;
  if(s===3)body=roStepHTML();
  if(s===2)body=`<p class="cw-q">Who is your character born as? Each people gives a small boost to some abilities and a few special traits. <b>Peoples of the realms</b> are FAND's own, born in Vestige's realms.</p>
    ${(()=>{const card=([n,t,b,sp,f])=>cwOpt(CW.race===n,n,`${esc(t)}<br><small>${b==='flex'?'+2 and +1 to the scores your class needs most':Object.entries(b).map(([a,v])=>a.toUpperCase()+' +'+v).join(', ')} · ${esc(peopleLine(n)||'speed '+sp+' ft')}</small><br><small>${esc(f)}</small>${peopleInfo(n)?`<span class="cw-info" role="link" tabindex="0" onclick="event.stopPropagation();peoplePop(${esc(JSON.stringify(n))})">ⓘ Full profile</span>`:''}`,`cwSet('race',${esc(JSON.stringify(n))},1)`);
      const open=CW.famOpen||(CW.race&&famMembers(famOf(CW.race)).length>1?famOf(CW.race):''),tops=peopleTop().map(f=>{const M=famMembers(f),r=famRow(f);return M.length>1?Object.assign(r.slice(),{fam:f,M}):r});
      return `${cwSearch(CW_RACE.length,'Search peoples, like elf, Dispater, or Hell')}${cwGroups(tops,5,r=>r.fam?cwOpt(famOf(CW.race)===r.fam||open===r.fam,r.fam,`${r.M.length} types: ${esc(r.M.join(', '))}`,`CW.famOpen=${esc(JSON.stringify(r.fam))};renderCharWiz();setTimeout(()=>{const t=document.getElementById('cw-types');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})},30)`,'choose a type'):card(r))}
        ${open?`<div id="cw-types" class="cw-types"><p class="cw-q" style="margin-top:14px">Which kind of <b>${esc(open)}</b>?</p><div class="cw-grid">${famMembers(open).map(n=>card(CW_RACE.find(r=>r[0]===n))).join('')}</div></div>`:''}`})()}`;
  if(s===4){const sc=cwScores(),b=cwBase();body=`<p class="cw-q">Your six abilities say what your ${esc(CW.cls)} is good at. Higher is better; 10 is average.</p>
    <div class="seg" style="margin-bottom:10px"><button class="${CW.method==='std'?'on':''}" onclick="cwSet('method','std')">Recommended scores</button><button class="${CW.method==='buy'?'on':''}" onclick="cwSet('method','buy')">Point buy</button><button class="${CW.method==='roll'?'on':''}" onclick="cwSet('method','roll')">🎲 Roll dice</button></div>
    <p class="note" style="margin:0 0 8px">${CW.method==='buy'?`Spend <b>${CW_BUY_POINTS} points</b>: every score starts at 8 and can go up to 15 (9 to 13 cost 1 point each step; 14 costs 2 more, 15 costs 2 more). <b style="color:${cwBuyLeft()?'var(--gold2)':'var(--green)'}">${cwBuyLeft()} point${cwBuyLeft()===1?'':'s'} left.</b>`:CW.method==='std'?'The usual set (15, 14, 13, 12, 10, 8), placed for you so your best score goes where '+aAn(CW.cls)+' '+esc(CW.cls)+' needs it.':'Four six-sided dice per score, keeping the best three, placed for you best-first. '+(CW.rerolled?'<b>You used your one reroll: these scores are final.</b>':`<a href="#" onclick="if(confirm('You get one reroll, and the new scores are final. Roll again?')){CW.rolled=cwRoll();CW.rerolled=1;renderCharWiz()}return false">Roll again (once)</a>`)}</p>
    <div class="tablewrap"><table class="t"><thead><tr><th>Ability</th><th>What it does</th><th class="num">Score</th><th class="num">Modifier</th></tr></thead><tbody>${ABIL.map(([a,n])=>`<tr${a===k.o[0]?' style="background:var(--goldbg)"':''}><td><b>${n}</b></td><td>${CW_ABIL_TXT[a]}</td><td class="num">${CW.method==='buy'?`<button class="btn" type="button" style="padding:0 8px;min-height:28px" onclick="cwBuy('${a}',-1)" aria-label="Lower">−</button> `:''}<b>${sc[a]}</b>${CW.method==='buy'?` <button class="btn" type="button" style="padding:0 8px;min-height:28px" onclick="cwBuy('${a}',1)" aria-label="Raise">+</button>`:''}${sc[a]!==b[a]?` <small style="color:var(--muted)">(${b[a]} +${sc[a]-b[a]} ${esc(CW.race)})</small>`:''}</td><td class="num">${sgn(mod(sc[a]))}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">The modifier is what you add to a basic action no skill covers (lifting, shoving, holding your breath). Skill rolls, saves, and initiative do not add it. Your highlighted best ability is the one ${aAn(CW.cls)} ${esc(CW.cls)} relies on.</p>`}
  if(s===5)body=`<p class="cw-q">What did your character do before they became an adventurer? It gives two trained skills and a bit of story. Backgrounds from <b>Vestige</b> are FAND's own, and many start you at level 1 in a profession.</p>
    ${cwSearch(CW_BG.length,'Search backgrounds, like smith or temple')}${cwGroups(CW_BG,3,([n,t,sk,g,pf])=>cwOpt(CW.bg===n,n,`${esc(t)}<br><small>${pf?`Starts with <b>${esc(pf)}</b> level 1 · <i>no trained skill, and disadvantage on one skill you choose</i>`:`Trained in ${sk.map(skn).join(' and ')}`}</small>`,`cwSet('bg',${esc(JSON.stringify(n))},1)`,pf?'Profession':''))}`;
  if(s===6){cwSkillInit();if(CW.langR==null)CW.langR=cwLangGuess(CW.race);if(CW.langB==null)CW.langB=cwLangGuess(CW.bg,1);const bg=CW_BG.find(x=>x[0]===CW.bg)||[],left=CW_MOVES-CW.moves,v=k2=>CW.sk[k2]||0;
    const csk=((CW_CLASS[CW.cls]||{}).sk||[]);
    body=`${STYLE_AT[CW.cls]===1?`<p class="cw-q">${esc(CW.cls)}s choose a <b>Fighting Style</b> at level 1:</p><select class="sel" style="max-width:520px" onchange="CW.style=this.value;renderCharWiz()"><option value="">Choose a Fighting Style…</option>${FIGHT_STYLES.map(([n,d])=>`<option value="${esc(n)}"${CW.style===n?' selected':''}>${esc(n)}: ${esc(d)}</option>`).join('')}</select>`:''}
    ${csk.length?`<p class="cw-q">Your class (${esc(CW.cls)}) trains you in <b>${csk.map(skn).join(' and ')}</b>: +1 to each, already counted below.</p>`:''}
    ${roSkills().length?`<p class="cw-q">Your people (${esc(CW.race)}) gives <b>${roSkills().map(skn).join(' and ')}</b>: +1 to each, already counted below.</p>`:''}
    <p class="cw-q">${bg[4]?`Your background (${esc(CW.bg)}) starts you in <b>${esc(bg[4])}</b> at level 1. That is all it gives: <b>no trained skill</b>, and <b>disadvantage on one skill</b> you choose below.`:`Your background (${esc(CW.bg)}) gives <b>+1</b> to ${cwBgSkills(bg).map(skn).join(' and ')}.`} You may <b>move a point twice</b>: take 1 from any skill and give it to another. After this, skills only go up through your class or your equipment.</p>
    <div class="cw-moves"><select class="sel" id="cw-from">${SKILLS.map(x=>`<option value="${x[0]}"${v(x[0])-1<CW_SK_MIN?' disabled':''}>${esc(x[1])} (${sgn(v(x[0]))})</option>`).join('')}</select><span>→</span><select class="sel" id="cw-to">${SKILLS.map(x=>`<option value="${x[0]}"${v(x[0])+1>CW_SK_MAX?' disabled':''}>${esc(x[1])} (${sgn(v(x[0]))})</option>`).join('')}</select><button class="btn primary" type="button" onclick="cwMove()"${left?'':' disabled'}>Move a point (${left} left)</button>${CW.moves?'<button class="btn" type="button" onclick="CW.skFor=null;cwSkillInit();renderCharWiz()">Undo moves</button>':''}</div>
    <div class="chips" style="margin:10px 0">${SKILLS.filter(x=>v(x[0])).map(x=>`<span class="chip"${v(x[0])<0?' style="border-color:var(--red)"':''}><b>${sgn(v(x[0]))}</b> ${esc(x[1])}</span>`).join('')||'<span class="note">No skill bonuses.</span>'}</div>
    ${bg[4]?`<p class="cw-q" style="margin-top:16px">Which skill has <b>disadvantage</b>? <small>(a profession background's cost)</small></p><select class="sel" style="max-width:360px" onchange="CW.disSkill=this.value"><option value="">Choose a skill…</option>${SKILLS.map(x=>`<option value="${x[0]}"${x[0]===CW.disSkill?' selected':''}>${esc(x[1])}</option>`).join('')}</select>`:''}
    <p class="cw-q" style="margin-top:16px">Your background also gives <b>one</b> proficiency. Which one?</p>
    <select class="sel" style="max-width:360px" onchange="CW.prof=this.value"><option value="">Choose one item…</option>${CW_PROF_GROUPS.map(([g,xs])=>`<optgroup label="${esc(g)}">${xs.map(x=>`<option${x===CW.prof?' selected':''}>${esc(x)}</option>`).join('')}</optgroup>`).join('')}</select>${CW_PROF_HINT[CW.cls]?` <small class="note">Suggested for ${aAn(CW.cls)} ${esc(CW.cls)}: ${esc(CW_PROF_HINT[CW.cls])}</small>`:''}
    <div class="callout" style="margin-top:12px"><b>Proficiency is item by item:</b> knowing the longsword does not teach you the rapier, and leather armor does not teach you chain mail. <b>Every other proficiency must be learned</b>, one item at a time. A ${esc(CW.cls)} usually works toward: ${esc(CW_CLASS[CW.cls].pr)}. Each item must be <b>taught by a teacher</b>, or earned by <b>using it for a long time</b>, and how you learned it must be written in your backstory.</div>
    <p class="cw-q" style="margin-top:16px">Languages: you speak <b>Common</b>, plus <b>one</b> from your people and <b>one</b> from your background.</p>
    <div class="form" style="max-width:560px"><label>From your people (${esc(CW.race)})<select class="sel" onchange="CW.langR=this.value"><option value="">Choose…</option>${CW_LANGS.map(x=>`<option${x===CW.langR?' selected':''}>${x}</option>`).join('')}</select></label><label>From your background (${esc(CW.bg)})<select class="sel" onchange="CW.langB=this.value"><option value="">Choose…</option>${CW_LANGS.map(x=>`<option${x===CW.langB?' selected':''}>${x}</option>`).join('')}</select></label></div>`}
  if(s===7){const opts=cwSchoolOpts(),[nc,n1]=CW_SPELLS[CW.cls]||[0,0],L0=cwSchoolSpells(0),L1=cwSchoolSpells(1),card=(x,lv)=>cwOpt((CW['sp'+lv]||[]).includes(x.n),esc(x.n),`<small>${esc([x.ct,x.rng,x.dur,x.dmg&&x.dmg!=="None"?x.dmg:""].filter(Boolean).join(' · ')||x.sc)}</small><span class="sp-info" role="button" tabindex="0" title="What it does" onclick="event.stopPropagation();openItem(deref('${ref(x)}'))">ⓘ What it does</span>`,`cwSpell(${lv},${esc(JSON.stringify(x.n))})`);
    body=!SP.length?'<p class="note">Spells are still loading…</p>':`<p class="cw-q">${aAn(CW.cls)==="an"?"An":"A"} ${esc(CW.cls)} casts spells. First choose the <b>school of magic</b> they come from: it gives you every spell in it, whatever classes a spell lists. ${ANY_ONE_SCHOOL.has(CW.cls)?`A Sorcerer can choose <b>any school</b>, but it is the <b>only one they will ever have</b>: choose carefully.`:`${aAn(CW.cls)==="an"?"An":"A"} ${esc(CW.cls)} can use <b>${esc(classSchoolText(CW.cls))}</b>.`} Schools marked <span class="b gold">suggested</span> suit ${aAn(CW.cls)} ${esc(CW.cls)}.</p>
    <select class="sel" style="max-width:420px" onchange="CW.school=this.value;CW.sp0=[];CW.sp1=[];renderCharWiz()"><option value="">Choose a school…</option>${opts.map(([n,k,sg])=>`<option value="${esc(n)}"${n===CW.school?' selected':''}>${esc(n)} (${k} spells)${sg?' · suggested':''}</option>`).join('')}</select>
    ${CW.school?`${nc?`<p class="cw-q" style="margin-top:14px">Pick <b>${nc} cantrip${nc>1?'s':''}</b> <small>(${(CW.sp0||[]).length} of ${nc})</small></p>${L0.length?`${cwSearch(L0.length,'Search cantrips')}<div class="cw-grid cw-small">${L0.map(x=>card(x,0)).join('')}</div>`:'<p class="note">This school has no cantrips.</p>'}`:''}
    <p class="cw-q" style="margin-top:14px">Pick <b>${n1} first-level spell${n1>1?'s':''}</b> <small>(${(CW.sp1||[]).length} of ${n1})</small></p>${L1.length?`${cwSearch(L1.length,'Search spells')}<div class="cw-grid cw-small">${L1.map(x=>card(x,1)).join('')}</div>`:'<p class="note">This school has no first-level spells.</p>'}`:''}`}
  if(s===8){const k2=CW_CLASS[CW.cls],items=cwKitItems(k2.kit);
    body=`<p class="cw-q">Starting equipment. Take your class's kit, or take gold and buy your own. Anything that is in the site's Blueprints or materials is linked and set up for you: weapons, armor, and packs are equipped, and the rest goes in your pack.</p>
    <div class="seg" style="margin-bottom:10px"><button class="${CW.eqMode!=='gold'?'on':''}" onclick="cwSet('eqMode','kit')">${esc(CW.cls)} kit</button><button class="${CW.eqMode==='gold'?'on':''}" onclick="cwSet('eqMode','gold')">${CW_GOLD[CW.cls]||100} gp instead</button></div>
    ${CW.eqMode==='gold'?`<p class="note">You start with <b>${CW_GOLD[CW.cls]||100} gp</b> and no gear. Buy what you need from the Shop on the Tools page.</p>`:`<div class="mlist">${items.map((x,i)=>{const m=cwMatch(x.n),off=(CW.eqOff||[]).includes(i);return `<button type="button" style="${off?'opacity:.45;text-decoration:line-through':''}" onclick="(()=>{const L=CW.eqOff||[];const j=L.indexOf(${i});j<0?L.push(${i}):L.splice(j,1);CW.eqOff=L;renderCharWiz()})()"><b style="width:34px">${x.q}×</b>${esc(x.n)}<span class="x">${m?'✓ '+esc(m.n)+(m._t==='bp'?' · '+esc(m.cat):''):'goes in the bag as written'}${m&&m.gp?' · '+(m.gp*x.q)+' gp':''}</span><span class="r">${off?(m&&m.gp?`+${m.gp*x.q} gp back · add back`:'add back'):'remove'+(m&&m.gp?` (+${m.gp*x.q} gp)`:'')}</span></button>`}).join('')}${(CW.eqAdd||[]).map((n,i)=>{const m=cwMatch(n);return `<button type="button" onclick="CW.eqAdd.splice(${i},1);renderCharWiz()"><b style="width:34px">1×</b>${esc(n)}<span class="x">${m?'✓ '+esc(m.n):'goes in the bag as written'} · added</span><span class="r">remove</span></button>`}).join('')}</div>
    <div class="keyrow" style="margin-top:8px;max-width:520px"><input class="sel" id="cw-eq" list="dl-bp" placeholder="Add any item (ask your DM)…" style="max-width:none;flex:1"><button class="btn" type="button" onclick="(()=>{const v=$('cw-eq').value.trim();if(!v)return;CW.eqAdd=(CW.eqAdd||[]).concat(v);renderCharWiz()})()">Add</button></div>${datalists()}
    <p class="note">Plus ${k2.gp} gp${cwRefund()?` and <b>${cwRefund()} gp</b> back for the items you left out (${k2.gp+cwRefund()} gp in all)`:''}. Tap an item to leave it out and get its price back.</p>`}`}
  if(s===9)body=`<div class="form" style="grid-template-columns:1fr auto;max-width:520px"><label>Character name<input id="cw-name" value="${esc(CW.name)}" placeholder="What are they called?" oninput="CW.name=this.value"></label><label style="align-self:end"><button class="btn" type="button" onclick="CW.name=cwName();renderCharWiz()">🎲 Random name</button></label></div>
    <p class="cw-q" style="margin-top:14px">How do they act? These were picked at random to get you started; reroll or type your own.</p>
    <div class="cw-pers">${[['traits','Personality'],['ideals','What they believe in'],['bonds','What they care about'],['flaws','A weakness']].map(([f,l])=>`<label><span>${l} <a href="#" onclick="CW.${f}=cwPick(CW_PERS.${f});renderCharWiz();return false" title="Pick another">🎲</a></span><textarea rows="2" oninput="CW.${f}=this.value">${esc(CW[f])}</textarea></label>`).join('')}</div>
    <p class="cw-q" style="margin-top:14px">How do they treat others? <small>(optional)</small></p>
    <div class="cw-grid cw-small">${CW_ALIGN.map(([n,t])=>cwOpt(CW.align===n,n,`<small>${t}</small>`,`cwSet('align','${n}')`)).join('')}</div>`;
  if(s===10){const sc=cwScores(),r=CW_RACE.find(x=>x[0]===CW.race),bg=CW_BG.find(x=>x[0]===CW.bg),hp=Math.max(1,CLASS_DIE[CW.cls]+mod(sc.con));
    body=`<div class="cw-hero"><h3>${esc(CW.name)}</h3><p><b>${esc(CW.race)} ${esc(CW.cls)}</b>, level 1 · ${esc(CW.bg)}${CW.align?' · '+esc(CW.align):''}</p>${roLines().length?`<p class="note" style="margin:4px 0 0">${esc(roLines().join(' · '))}</p>`:''}</div>
    <div class="kv" style="margin:10px 0">${ABIL.map(([a,n])=>`<span>${n}</span><span><b>${sc[a]}</b> (${sgn(mod(sc[a]))})</span>`).join('')}<span>Hit points</span><span><b>${hp}</b> (${CLASS_DIE[CW.cls]} for ${aAn(CW.cls)} ${esc(CW.cls)} ${mod(sc.con)>=0?'+':'−'} ${Math.abs(mod(sc.con))} Constitution)</span><span>Speed</span><span>${r[3]} ft</span><span>Skills</span><span>${SKILLS.filter(x=>(CW.sk||{})[x[0]]).map(x=>esc(x[1])+' '+sgn(CW.sk[x[0]])).join(', ')||'none'}</span><span>Proficiency</span><span>${esc(CW.prof)} (from your background)</span>${CW.disSkill?`<span>Disadvantage</span><span>${esc((SKILLS.find(x=>x[0]===CW.disSkill)||[])[1]||'')} checks (from the ${esc(CW.bg)} background)</span>`:''}<span>Languages</span><span>Common, ${esc(CW.langR||'?')}, ${esc(CW.langB||'?')}</span>${CW_SPELLS[CW.cls]?`<span>Magic</span><span>${esc(CW.school||'no school yet')}: ${[...(CW.sp0||[]),...(CW.sp1||[])].map(esc).join(', ')||'no spells yet'}</span>`:''}<span>Starting gear</span><span>${CW.eqMode==='gold'?(CW_GOLD[CW.cls]||100)+' gp':cwEquipList().map(x=>(x.q>1?x.q+'× ':'')+esc(x.n)).join(', ')+'; '+(k.gp+cwRefund())+' gp'}</span>${bg[4]?`<span>Profession</span><span>${esc(bg[4])} level 1</span>`:''}</div>
    <p class="note">Press <b>Create my character</b> to open the finished sheet. You can change anything on it later.</p>`}
  $('content').innerHTML=`<div class="page"><div class="cw">
    <div class="cw-top"><button class="btn" type="button" onclick="CW=null;renderSheet()">✕ Close</button><div class="cw-prog">${CW_STEPS.map((n,i)=>`<span class="${i<s?'done':i===s?'on':''}" title="${n}"></span>`).join('')}</div><small>Step ${s+1} of ${CW_STEPS.length}: <b>${CW_STEPS[s]}</b></small></div>
    ${body}
    <div class="cw-nav">${s>0?'<button class="btn" type="button" onclick="cwGo(-1)">← Back</button>':'<span></span>'}
      <span style="display:flex;gap:8px">${[1,2,3,5,7].includes(s)?`<button class="btn" type="button" onclick="cwSurprise()">🎲 ${s===7?'Pick for me':'Surprise me'}</button>`:''}${s<CW_STEPS.length-1?`<button class="btn primary" type="button" onclick="cwGo(1)">${s===0?'Start':'Next →'}</button>`:'<button class="btn primary" type="button" onclick="cwCreate()">✨ Create my character</button>'}</span></div>
  </div></div>`;
}
function cwSurprise(){const s=CW.step;if(s===1)CW.cls=cwPick(Object.keys(CW_CLASS));if(s===2){CW.race=cwPick(CW_RACE)[0];CW.ro={}}if(s===3)roRandom();if(s===5)CW.bg=cwPick(CW_BG)[0];if(s===7){const sc=cwSchoolOpts();CW.school=CW.school||(sc[0]||[])[0];const [nc,n1]=CW_SPELLS[CW.cls]||[0,0];CW.sp0=cwShuffle(cwSchoolSpells(0)).slice(0,nc).map(x=>x.n);CW.sp1=cwShuffle(cwSchoolSpells(1)).slice(0,n1).map(x=>x.n);renderCharWiz();return}CW.step++;renderCharWiz()}
// what a spell does, short enough for a card (its full text opens with the ⓘ link on the sheet)
const cwShuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
function cwSchoolOpts(){const own=Object.fromEntries(schoolsOf(CW.cls)),top=schoolsOf(CW.cls).slice(0,3).map(x=>x[0]),sug=new Set(top);return allSchools().filter(([n])=>schoolOk(CW.cls,n,[])&&SP.some(x=>x.sc===n&&x.lv<=1)).sort((a,b)=>(sug.has(b[0])-sug.has(a[0]))||((own[b[0]]||0)-(own[a[0]]||0))||b[1]-a[1]).map(([n,k])=>[n,k,sug.has(n)])}
const cwSchoolSpells=lv=>CW.school?SP.filter(x=>x.sc===CW.school&&x.lv===lv).sort((a,b)=>a.n<b.n?-1:1):[];
function cwSpell(lv,n){const k='sp'+lv,L=(CW[k]||[]).slice(),i=L.indexOf(n),max=(CW_SPELLS[CW.cls]||[0,0])[lv];if(i>=0)L.splice(i,1);else{if(L.length>=max){toast(`You can pick ${max} ${lv?'first-level spells':'cantrips'}; remove one first`);return}L.push(n)}CW[k]=L;renderCharWiz()}
// the character the builder's choices make (not saved yet); cwCreate saves it, the character generator previews it first
function cwBuild(){const k=CW_CLASS[CW.cls],sc=cwScores(),r=CW_RACE.find(x=>x[0]===CW.race),bg=CW_BG.find(x=>x[0]===CW.bg),hp=Math.max(1,CLASS_DIE[CW.cls]+mod(sc.con)),skillB={};Object.entries(CW.sk||{}).forEach(([x,v])=>{if(v)skillB[x]=v});
  const c={id:uid(),name:CW.name.trim(),level:1,cls:CW.cls,race:CW.race,...(CW.race2&&CW.race2!==CW.race?{race2:CW.race2,...(CW.race2Trait?{race2Trait:CW.race2Trait}:{})}:{}),bg:CW.bg,align:CW.align,abil:sc,hpMax:hp,hp,speed:r[3],skillB,size:(peopleInfo(CW.race)||{}).size||'',dv:(peopleInfo(CW.race)||{}).dv||0,
    profs:CW.prof+' (from the '+CW.bg+' background)'+roTools().map(t=>'\n'+t+' (from your people)').join('')+'\nLanguages: Common, '+(CW.langR||'one of your choice')+' (from your people), '+(CW.langB||'one of your choice')+' (from your background)\n\nProficiency is item by item. Still to learn, one item at a time (each needs a teacher, or long use written in the backstory): '+k.pr,equip:'',coins:{gp:CW.eqMode==='gold'?(CW_GOLD[CW.cls]||100):k.gp+cwRefund()},
    features:`${CW.cls} (level 1)\n${k.f}\n\n${CW.race}${(P=>P?` (${P.size}, ${P.type}${P.dv?', darkvision '+P.dv+' ft':''})\n${(P.traits||[]).map(([t,d])=>t+': '+d).join('\n')}`:'\n'+r[4])(peopleInfo(CW.race))}${roLines().length?'\nYour choices: '+roLines().join('; ')+'.':''}\n\n${CW.bg} background\n${bg[1]} ${cwBgSkills(bg).length?'Trained in '+cwBgSkills(bg).map(x=>(SKILLS.find(y=>y[0]===x)||[])[1]).join(' and ')+'.':''}${bg[4]?' Starts at '+bg[4]+' level 1, with disadvantage on '+((SKILLS.find(x=>x[0]===CW.disSkill)||[])[1]||'one skill')+' checks.':''}`,
    traits:CW.traits,ideals:CW.ideals,bonds:CW.bonds,flaws:CW.flaws,gear:[],inv:[],purse:{Human:0},specs:[],wizNext:1};
  if(STYLE_AT[CW.cls]===1&&CW.style)c.style=CW.style;
  if(Object.keys(CW.ro||{}).length)c.raceOpts=JSON.parse(JSON.stringify(CW.ro));
  if(bg[4]){c.prof=bg[4];c.profLv=1;if(CW.disSkill)c.disSkill=CW.disSkill}
  if(CW_SPELLS[CW.cls]&&CW.school){c.schools=[{n:CW.school,m:1}];c.spells={0:(CW.sp0||[]).slice(),1:(CW.sp1||[]).slice()}}
  roSpecs(CW.race).filter(x=>x.k==='cantrip'&&(CW.ro||{})[x.id]).forEach(x=>{c.spells=c.spells||{0:[],1:[]};c.spells[0]=c.spells[0]||[];if(!c.spells[0].includes(CW.ro[x.id]))c.spells[0].push(CW.ro[x.id])});
  cwEquipList().forEach(x=>{const m=cwMatch(x.n);if(m&&m._t==='bp'&&(ARMOR_CATS.includes(m.cat)||['Sword','Axe','Hammer','Dagger','Bow','Staff','Spear','Shield','Storage','Tool','Instrument','Focus'].includes(m.cat))){for(let i=0;i<x.q;i++)c.gear.push(m.n)}else invAdd(c,m?m.n:x.n,x.q,1,true)});
  if(CW.eqMode==='kit')armFit(c);
  return c}
function cwCreate(){const c=cwBuild();PARTY.push(c);saveParty();SHEET_ID=c.id;SHEET_TAB='core';CW=null;renderSheet();window.scrollTo(0,0);toast(c.name+' is ready')}
function cwNextHTML(c){if(!c.wizNext)return '';return `<div class="cw-next sh-noprint"><div class="sh-row" style="justify-content:space-between"><b>✨ ${esc(c.name||'Your character')} is ready. What next?</b><button class="btn" type="button" onclick="(()=>{const c=sheetChar();delete c.wizNext;saveParty();renderSheet()})()">Got it</button></div><ul>
  ${CAST_ABIL[c.cls]?`<li><b>Pick your magic.</b> On <a href="#" onclick="SHEET_TAB='spells';renderSheet();return false">Page 3: Spells</a>, choose the one school of magic your spells come from, then add your spells.</li>`:''}
  <li><b>Gear.</b> Your starting kit is written under Equipment. To use real FAND items with their own AC and damage, equip them on the <a href="${pageUrl('party')}" data-go="party">Party</a> page or build them in the <a href="${pageUrl('forge')}" data-go="forge">Forge</a>.</li>
  <li><b>Gods.</b> You start with no god contract. You can only gain one by meeting a follower of that god, doing a ritual with its core material, finding its temple, or holding an item integrated with it. Browse the <a href="${pageUrl('gods')}" data-go="gods">Gods</a>.</li>
  <li><b>Proficiencies.</b> You have one, from your background. Every other weapon, armor, or tool must be taught by a teacher, or earned by using it for a long time: write how in your backstory, then add it under Other proficiencies.</li>
  <li><b>Skills</b> only rise through your class or your equipment now (gear with Keen-Eyed, Hushed, Silver-Tongued, Learned, Wild-Wise, or Mighty materials adds to them).</li>
  <li><b>Subclass</b> at level 3, and <b>levels</b> come from big deeds: press ⬆ Level up when your DM says so.</li>
  <li>Not sure about a word? The <a href="${pageUrl('rules')}" data-go="rules">Rules</a> page explains FAND's changes to the usual game.</li></ul></div>`}

// Play from the sheet: every bonus on page 1 (abilities, saves, skills, initiative, attacks) rolls when tapped; hit points have
// quick buttons (damage takes temporary hit points first); conditions are chips you tap on and off.
const d20x=v=>'1d20'+(v?(v>0?'+':'-')+Math.abs(v):'');
const SHEET_CONDS=['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious'];
function sheetHpQuick(c){const cs=Array.isArray(c.cond)?c.cond:[];return `<div class="hpq sh-noprint"><button type="button" class="btn" data-hpd="-5">−5</button><button type="button" class="btn" data-hpd="-1">−1</button><input class="sel" id="hpAmt" type="number" min="0" placeholder="amount" aria-label="Amount"><button type="button" class="btn" data-hpa="-">Damage</button><button type="button" class="btn" data-hpa="+">Heal</button><button type="button" class="btn" data-hpd="1">+1</button><button type="button" class="btn" data-hpd="5">+5</button></div>
  <div class="sh-conds sh-noprint">${SHEET_CONDS.map(k=>`<button type="button" class="chip${cs.includes(k)?' on':''}" data-cond="${k}" title="${esc((typeof COND_TEXT!=='undefined'&&COND_TEXT[k])||k)}" aria-pressed="${cs.includes(k)}">${k}</button>`).join('')}</div>${cs.length?`<div class="note" style="margin:4px 0 0">${cs.map(k=>`<b>${k}</b>: ${esc((typeof COND_TEXT!=='undefined'&&COND_TEXT[k])||'')}`).join('<br>')}</div>`:''}`}
// the header's ⋯ menu on phones: the buttons that don't fit
function hdrMore(){let P=$('hdrpop');const b=$('hdrMore');if(P&&!P.hidden){P.hidden=true;b.setAttribute('aria-expanded','false');return}
  if(!P){P=document.createElement('div');P.id='hdrpop';P.className='hdrpop';P.setAttribute('role','menu');document.body.appendChild(P)}
  const dark=document.documentElement.dataset.theme!=='light',inst=$('installBtn')&&!$('installBtn').hidden;
  P.innerHTML=`<button role="menuitem" data-h="rules">📖 Quick rules</button><button role="menuitem" data-h="theme">${dark?'☀️ Light theme':'🌙 Dark theme'}</button>${inst?'<button role="menuitem" data-h="install">⬇️ Install as an app</button>':''}<button role="menuitem" data-h="settings">⚙️ Settings</button>`;
  const r=b.getBoundingClientRect();P.style.top=(r.bottom+6)+'px';P.style.right=Math.max(8,innerWidth-r.right)+'px';P.hidden=false;b.setAttribute('aria-expanded','true');P.querySelector('button').focus();
  P.onclick=e=>{const x=e.target.closest('[data-h]');if(!x)return;P.hidden=true;b.setAttribute('aria-expanded','false');const h=x.dataset.h;if(h==='rules')openQuick();else if(h==='theme')toggleTheme();else if(h==='install')installApp();else go('settings')}}
document.addEventListener('click',e=>{const P=$('hdrpop');if(P&&!P.hidden&&!e.target.closest('#hdrpop,#hdrMore')){P.hidden=true;$('hdrMore').setAttribute('aria-expanded','false')}
  document.querySelectorAll('details.more-menu[open]').forEach(d=>{if(!d.contains(e.target)||e.target===d)d.open=false})});
document.addEventListener('click',e=>{const p=e.target.closest('.sec-h.pg-h>p');if(p&&!e.target.closest('a,button,code')&&matchMedia('(max-width:600px)').matches)p.classList.toggle('open')});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const P=$('hdrpop');if(P&&!P.hidden){P.hidden=true;$('hdrMore').focus()}document.querySelectorAll('details.more-menu[open]').forEach(d=>{d.open=false;const s=d.querySelector('summary');if(s)s.focus()})});
// the character sheet's play card: what you look at during a fight, big enough to tap
function shPlayCard(c,s,pb,M,speedPen){if(SHEET_BLANK||!c||!c.id)return '';const max=+c.hpMax||0,hp=c.hp===''||c.hp==null?max:+c.hp||0,tmp=+c.tempHp||0,pct=max?Math.max(0,Math.min(100,hp/max*100)):0;
  const col=!max?'var(--muted)':pct>50?'var(--green)':pct>25?'var(--gold)':'var(--red)',init=(+c.initB||0)+s.gb.init,cs=Array.isArray(c.cond)?c.cond:[];
  const tile=(lab,val,roll,what,cls)=>roll?`<button type="button" class="pk-tile${cls?' '+cls:''}" data-roll="${roll}" data-what="${esc(what)}" title="Roll ${esc(what)}"><b>${val}</b><span>${lab}</span><i aria-hidden="true">🎲</i></button>`:`<div class="pk-tile${cls?' '+cls:''}"><b>${val}</b><span>${lab}</span></div>`;
  return `<section class="pk-card sh-noprint" aria-label="${esc(c.name||'Character')} at a glance">
    <div class="pk-top"><div class="pk-port">${c.portrait?`<img src="${esc(c.portrait)}" alt="">`:classCrest(c.cls,c.name,56)}</div>
      <div class="pk-id"><b>${esc(c.name||'Unnamed')}</b><small>${esc([c.cls?c.cls+' '+(c.level||1):'',c.race||''].filter(Boolean).join(' · '))}</small>${cs.length?`<span class="pk-conds">${cs.map(k=>`<span class="chip on">${esc(k)}</span>`).join('')}</span>`:''}${(()=>{const k=curseActive(c);return k.length?`<span class="pk-curse" title="${esc(k.map(x=>x.pn+' on '+x.n).join('; '))}">☠ Cursed: ${esc([...new Set(k.map(x=>x.pn))].join(', '))}</span>`:''})()}</div>
      <div class="pk-hp"><b style="color:${col}">${hp}</b><span>/ ${max||'?'} HP${tmp?` <em>+${tmp} temp</em>`:''}</span></div></div>
    <div class="pk-bar" role="meter" aria-label="Hit points" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${hp}"><i style="width:${pct}%;background:${col}"></i></div>
    <div class="pk-hpbtns" role="group" aria-label="Change hit points"><button type="button" class="pk-dmg" data-hpd="-10">−10</button><button type="button" class="pk-dmg" data-hpd="-5">−5</button><button type="button" class="pk-dmg" data-hpd="-1">−1</button><button type="button" class="pk-heal" data-hpd="1">+1</button><button type="button" class="pk-heal" data-hpd="5">+5</button><button type="button" class="pk-heal" data-hpd="10">+10</button></div>
    <div class="pk-stats">${tile('Armor Class',s.ac)}${tile('Dodge',sgn(s.dodge),d20x(s.dodge),'Dodge')}${tile('Initiative',sgn(init),d20x(init),'Initiative')}${tile('Speed',(Math.max(0,(+c.speed||30)-(speedPen||0)))+' ft')}${tile('Proficiency',sgn(pb))}${tile('Passive Perception',`<span class="sh-pp">${10+(+((c.skillB||{}).perception)||0)+(s.gb.perception||0)}</span>`)}</div>
    <div class="pk-abil">${ABIL.map(([k,n])=>tile(n.slice(0,3).toUpperCase(),sgn(M(k)),d20x(M(k)),n+' check','pk-ab').replace('<span>','<small>'+((c.abil||{})[k]||10)+'</small><span>')).join('')}</div>
  </section>`}
function sheetRedraw(){clearTimeout(sheetRedraw.t);sheetRedraw.t=setTimeout(()=>{if(TAB!=='sheet')return;const C=$('content'),y=C.scrollTop;renderSheet();C.scrollTop=y},0)}
function sheetHp(d){const c=sheetChar();if(!c||SHEET_BLANK)return;const max=+c.hpMax||0;let hp=c.hp===''||c.hp==null?max:+c.hp||0,tmp=+c.tempHp||0;// an empty current HP (a new character) counts as full health
  if(d<0){const take=Math.min(tmp,-d);tmp-=take;hp=Math.max(0,hp-(-d-take))}else hp=max?Math.min(max,hp+d):hp+d;
  c.hp=hp;c.tempHp=tmp||'';saveParty();renderSheet();toast(d<0?`${-d} damage · ${hp}${max?' / '+max:''} HP`+(hp===0?' · down!':''):`+${d} HP · ${hp}${max?' / '+max:''}`);if(navigator.vibrate&&d<0)try{navigator.vibrate(15)}catch(e){}}
document.addEventListener('click',e=>{if(TAB!=='sheet')return;const r=e.target.closest('[data-roll]');if(r&&r.closest('#content')){e.preventDefault();rollShow(r.dataset.roll,r.dataset.what);return}
  const d=e.target.closest('[data-hpd]');if(d){sheetHp(+d.dataset.hpd);return}const a=e.target.closest('[data-hpa]');if(a){const v=Math.abs(+($('hpAmt')||{}).value||0);if(!v){toast('Type an amount first');return}sheetHp(a.dataset.hpa==='-'?-v:v);return}
  const k=e.target.closest('[data-cond]');if(k&&k.closest('.sh-conds')){const c=sheetChar();const cs=Array.isArray(c.cond)?c.cond.slice():[];const i=cs.indexOf(k.dataset.cond);if(i<0)cs.push(k.dataset.cond);else cs.splice(i,1);c.cond=cs;saveParty();renderSheet()}});
// ── export a character as a clean one-page summary for printing or "Save as PDF": stats, gear with its powers, curses,
// inventory and coin, in a print-only frame so the site's own page is untouched ──
function sheetPDFHTML(c){const s=charStats(c),pb=profBonus(c.level),mod=v=>Math.floor(((+v||10)-10)/2),sg=n=>(n>=0?'+':'')+n,A=c.abil||{},sk=c.skillB||{};
  const gearRows=(c.gear||[]).map(n=>{const b=findBP(n),pw=b?gearPowers(b):[];return `<tr><td><b>${esc(n)}</b>${b&&b.cat?`<br><small>${esc(b.cat)}${b.ac?' · AC '+esc(b.ac):''}${b.dc?' · '+esc(b.dc+(b.dm?' '+b.dm:'')):''}</small>`:''}</td><td>${pw.length?pw.map(p=>`<b>${esc(p.n)}</b>: ${esc(p.t||'')}`).join('<br>'):'<small>—</small>'}</td></tr>`}).join('');
  const curses=curseList(c),inv=(c.inv||[]).filter(z=>(+z[1]||0)>0),purse=Object.entries(c.purse||{}).filter(([,v])=>+v>0),coins=c.coins||{};
  const skills=SKILLS.filter(([k])=>+sk[k]).map(([k,l])=>`${l} ${sg(+sk[k])}`);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.name||'Character')} · FAND</title><style>
    *{box-sizing:border-box}body{font:11pt/1.35 Georgia,'Times New Roman',serif;color:#111;margin:0;padding:14mm}h1{font-size:20pt;margin:0}h2{font-size:11pt;text-transform:uppercase;letter-spacing:.08em;border-bottom:1.5px solid #111;margin:12px 0 6px;padding-bottom:2px}
    .sub{color:#444;margin:2px 0 10px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.ab{border:1px solid #999;border-radius:6px;text-align:center;padding:4px}.ab b{display:block;font-size:14pt}.ab small{font-size:8pt;text-transform:uppercase;color:#444}
    .stats{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:6px}.st{border:1px solid #ccc;border-radius:6px;padding:3px 6px}.st small{display:block;font-size:7.5pt;color:#555;text-transform:uppercase}.st b{font-size:12pt}
    table{width:100%;border-collapse:collapse;font-size:9.5pt}td,th{border-top:1px solid #ccc;padding:4px 6px;vertical-align:top;text-align:left}small{color:#555}.cols{columns:2;column-gap:18px;font-size:9.5pt}.cols div{break-inside:avoid}
    .curse{border:1.5px solid #900;border-radius:6px;padding:6px 8px;margin:4px 0;font-size:9.5pt}.curse b{color:#900}.foot{margin-top:14px;font-size:8pt;color:#777;border-top:1px solid #ccc;padding-top:4px}@page{size:A4;margin:0}
  </style></head><body>
  <h1>${esc(c.name||'Unnamed')}</h1><div class="sub">${esc([c.race,c.cls?c.cls+' '+(c.level||1):'',c.cls2?c.cls2+' '+(c.level2||''):'',c.bg].filter(Boolean).join(' · '))}${c.god?' · Patron: '+esc(c.god):''}</div>
  <div class="grid">${ABIL.map(([k,l])=>`<div class="ab"><small>${l.slice(0,3)}</small><b>${sg(mod(A[k]))}</b>${+A[k]||10}</div>`).join('')}</div>
  <div class="stats"><div class="st"><small>Hit points</small><b>${c.hp===''||c.hp==null?+c.hpMax||0:+c.hp}</b> / ${+c.hpMax||'?'}</div><div class="st"><small>Armor Class</small><b>${esc(String(s.ac))}</b></div><div class="st"><small>Dodge</small><b>${sg(+s.dodge||0)}</b></div>
    <div class="st"><small>Speed</small><b>${+c.speed||30}</b> ft</div><div class="st"><small>Proficiency</small><b>${sg(pb)}</b></div><div class="st"><small>Passive Perception</small><b>${10+(+sk.perception||0)+(s.gb&&s.gb.perception||0)}</b></div></div>
  ${skills.length?`<h2>Skills</h2><div>${esc(skills.join(' · '))}</div>`:''}
  <h2>Equipped gear</h2>${gearRows?`<table><tbody>${gearRows}</tbody></table>`:'<div><small>Nothing equipped.</small></div>'}
  ${curses.length?`<h2>Cursed gear</h2>${curses.map(k=>{const [gift,curse]=curseText(k);return `<div class="curse"><b>☠ ${esc(k.pn)}</b> on ${esc(k.n)}${k.pot?` (Potency ${k.pot})`:''}${k.lifted?' · curse lifted':''}${gift?`<div>${esc(gift)}</div>`:''}${curse?`<div><b>Curse:</b> ${esc(curse)}</div>`:''}</div>`}).join('')}`:''}
  <h2>Inventory</h2>${inv.length?`<div class="cols">${inv.map(([n,q])=>`<div>${+q>1?(+q)+' × ':''}${esc(n)}</div>`).join('')}</div>`:'<div><small>The pack is empty.</small></div>'}
  <h2>Money</h2><div>${['pp','gp','ep','sp','cp'].filter(k=>+coins[k]).map(k=>(+coins[k])+' '+k).join(', ')||'0 gp'}${purse.length?' · '+purse.map(([z,v])=>`${fmt(+v)} ${(CURRENCY[z]||{}).pl||z}`).join(', '):''}</div>
  ${c.notes||c.traits?`<h2>Notes</h2><div style="white-space:pre-wrap;font-size:9.5pt">${esc([c.traits,c.notes].filter(Boolean).join('\n\n'))}</div>`:''}
  <div class="foot">FAND · ${esc(new Date().toLocaleDateString([], {dateStyle:'long'}))}</div></body></html>`}
function sheetPDF(){const c=sheetChar();if(!c||!c.id||SHEET_BLANK){toast('Open a character first');return}let f=$('pdfFrame');if(f)f.remove();f=document.createElement('iframe');f.id='pdfFrame';f.title='Character for printing';f.setAttribute('aria-hidden','true');
  f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(sheetPDFHTML(c));d.close();
  setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){toast('Printing is blocked here: use your browser\'s Print instead')}},250);toast('Choose “Save as PDF” as the printer to keep a PDF')}
function renderSheet(){
  if(CW){renderCharWiz();return}
  {const pw=store.get('charwiz',0);if(pw){store.set('charwiz',0);charWizard(typeof pw==='object'?pw:null);return}}
  {const sc=parseHash().params.get('char');if(sc&&renderSheet._imp!==sc){renderSheet._imp=sc;importSharedChar(sc)}}
  if(!HC&&!renderSheet._hc){renderSheet._hc=1;hcAuto().then(()=>{if(HC&&TAB==='sheet')renderSheet()}).catch(()=>{})}
  const c=sheetChar(),s=charStats(c),L=+c.level||1,pb=profBonus(L),A=c.abil||{},M=k=>mod(A[k]),L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,L1=L-L2,si=c.cls?stageInfo(c.cls,L1):null,siC=c.cls?stageInfo(c.cls,L):null,si2=c.cls2&&L2?stageInfo(c.cls2,L2):null;
  const inp=(path,ph,attr='',type='text')=>`<input data-s="${path}" type="${type}" value="${esc(getP(c,path)??'')}" placeholder="${esc(ph||'')}" ${attr}>`;
  const ta=(path,ph,rows=4)=>`<textarea data-s="${path}" rows="${rows}" placeholder="${esc(ph||'')}">${esc(getP(c,path)||'')}</textarea>`;
  const chk=(path,title='')=>`<input type="checkbox" data-s="${path}" data-chk="1" ${getP(c,path)?'checked':''} title="${esc(title)}">`;
  const box=(label,inner,cls='')=>`<div class="sh-box ${cls}">${inner}<div class="sh-lab">${label}</div></div>`;
  // campaign rule: skills add no ability modifier; each skill's bonus is written in by hand
  const skillVal=sk=>(+((c.skillB||{})[sk[0]])||0)+(s.gb[sk[0]]||0);
  const speedPen=s.drawback.filter(o=>/^Speed −(\d+)/.test(o.d)).reduce((a,o)=>a+(+o.d.match(/\d+/)[0]),0);
  const weapons=s.gear.filter(b=>(b.design&&b.design.dmg)||(b.dc&&b.dm&&!ARMOR_CATS.includes(b.cat)));
  const atkRow=b=>{const props=b.design?b.design.props:(genOf(b)&&BASES[genOf(b)].props)||'',fin=/Finesse/i.test(props),rng=/Ammunition|ranged/i.test(props)||['Bow'].includes(b.cat);const ab=rng?M('dex'):fin?Math.max(M('str'),M('dex')):M('str');const fx=gearFx(b),item=(b.design&&b.design.atk!=null?b.design.atk:0)+fx.atk;const ak=rng?ammoKind(b):'',am=ak?bestAmmo(c,ak):null,ai=ak?bestAmmo(c,ak,true):null,dmg=fxDmg(b.design?b.design.dmg:`${b.dc} ${b.dm}`,fx)+(am&&am.A.dmg?` + ${am.A.dmg}`:'');
    return `<tr><td><b>${esc(b.n)}</b>${am?`<br><small style="color:var(--muted)" title="The best ammunition for it that ${esc(c.name||'the character')} carries">shooting ${esc(am.b.n)}${am.A.dmg?' (+'+am.A.dmg+')':''}${am.A.pierce?', ignores '+am.A.pierce+' AC':''}</small>`:''}${(c.cls==='Rogue'||c.cls2==='Rogue')&&(fin||rng)?`<br><small style="color:var(--muted)" title="Once a turn, with advantage or an ally next to the target">Sneak Attack <button class="sh-roll" type="button" data-roll="${sneakDice(+c.level||1)}d6" data-what="Sneak Attack">+${sneakDice(+c.level||1)}d6</button> once a turn</small>`:''}${fx.src.length?`<br><small style="color:var(--muted)" ${fx.capDmg?'title="Capped: properties and traits add at most half the weapon\'s own damage"':''}>with ${esc(fx.src.join(', '))}${fx.capDmg?' (capped)':''}</small>`:''}</td><td class="num"><button class="sh-roll" type="button" data-roll="${d20x(ab+pb+item)}" data-what="${esc(b.n)} attack">${sgn(ab+pb+item)}</button>${ak?(ai?` <button class="btn sh-noprint sh-shoot" type="button" style="padding:0 6px;font-size:.75rem" data-roll="${d20x(ab+pb+item)}" data-w="${esc(b.n)}" onclick="sheetShoot(this)" title="Shoot: roll the attack and spend one ${esc(ai.b.n)} (${ai.q} left)">Shoot${ai.q<=5?' <b style="color:var(--red)">'+ai.q+'</b>':''}</button>`:` <small style="color:var(--red)" title="No ammunition for it in the bag">no ammo</small>`):''}</td><td>${esc(dmg.replace(/^(\d+d\d+)/,'$1'+(ab?(ab>0?' + ':' − ')+Math.abs(ab):'')))}</td></tr>`};
  const head=`<div class="sh-head"><div class="sh-id"><div class="sh-port">${c.portrait?`<img src="${esc(c.portrait)}" alt="Portrait of ${esc(c.name||'the character')}">`:classCrest(c.cls,c.name,104)}<label class="sh-port-btn sh-noprint" title="Choose a picture for this character">📷<input type="file" accept="image/*" style="display:none" onchange="sheetPortrait(this)"></label>${c.portrait?'<button type="button" class="sh-port-x sh-noprint" title="Remove the picture" onclick="sheetPortrait(null)">✕</button>':''}</div><div class="sh-name">${inp('name','Character name')}<div class="sh-lab">Character name</div></div></div>
    <div class="sh-hgrid">
      <div><select data-s="cls" aria-label="Class"><option value="">Class…</option>${Object.keys(CLASS_DIE).sort().map(x=>`<option${x===c.cls?' selected':''}>${x}</option>`).join('')}</select><select data-s="sub" title="Subclass (chosen at level 3)"><option value="">Subclass…</option>${SUBS.filter(x=>x.par===c.cls).map(x=>`<option${x.n===c.sub?' selected':''}>${esc(x.n)}</option>`).join('')}</select>${inp('level','',`min="1" max="${MAX_LEVEL}" style="width:64px"`,'number')}<div class="sh-lab">Class &amp; level${si&&si.k>1?` · <b style="color:var(--gold2)">${esc(si.name)}</b>`:''}${c.cls2&&L2?` · ${esc(c.cls)} ${L1} / ${esc(si2&&si2.k>1?si2.name:c.cls2)} ${L2}`:''}</div></div>
      <div>${inp('bg','Background','list="dl-bgs"')}<datalist id="dl-bgs">${CW_BG.map(b=>`<option value="${esc(b[0])}">${esc(b[3])}</option>`).join('')}</datalist><div class="sh-lab">Background</div></div><div>${inp('player','Player name')}<div class="sh-lab">Player name</div></div>
      <div>${(()=>{const cur=c.race||'',known=CW_RACE.some(r=>r[0]===cur),f=known?famOf(cur):'',M=f?famMembers(f):[];return `<div class="sh-race"><select aria-label="People" onchange="sheetRaceFam(this.value)"><option value="">${known||!cur?'Choose a people…':'Other: '+esc(cur)}</option>${peopleTop().map(x=>`<option${x===f?' selected':''}>${esc(x)}</option>`).join('')}<option value="__other">Other (type your own)…</option></select>${M.length>1?`<select aria-label="Type of ${esc(f)}" onchange="sheetSetRace(this.value)">${M.map(n=>`<option${n===cur?' selected':''}>${esc(n)}</option>`).join('')}</select>`:''}</div>`})()}<div class="sh-lab">Race${(()=>{const f=famOf(c.race||'');return famMembers(f).length>1?' and type':''})()}${c.race2?` · ${esc(c.race2)} heritage`:''}</div></div><div>${inp('align','Alignment')}<div class="sh-lab">Alignment</div></div><div><div class="sh-row"><b class="sh-pill">${(c.log||[]).length}</b><button class="btn primary" type="button" id="sh-lvl">⬆ Level up</button></div><div class="sh-lab">Accomplishments (milestone levelling)</div></div></div></div>`;
  const feats=`${(()=>{const P0=(typeof CLASS_PROG!=='undefined'&&CLASS_PROG[c.cls]||[]).filter(f=>f[0]<=L1&&f[1]!=='Subclass'),sa=P0.filter(f=>/^Sneak Attack/.test(f[1])),P=P0.filter(f=>!/^Sneak Attack/.test(f[1])||f===sa[sa.length-1]).map(f=>/^Sneak Attack/.test(f[1])?[f[0],`Sneak Attack (${sneakDice(L1)}d6)`,f[2]+(diceMult(bandOf(L1))>1?` At level ${L1} the dice are ${sneakBase(L1)}d6 × ${diceMult(bandOf(L1))} (the level-band table spells use).`:'')]:f);return P.length||c.style?`<details class="sh-feat"${P.length<=6?' open':''}><summary><b>${esc(c.cls)} features</b> <small>levels 1–${Math.min(L1,20)}</small></summary><ul>${c.style?`<li><b>Fighting Style: ${esc(c.style)}</b>: ${esc((FIGHT_STYLES.find(x=>x[0]===c.style)||[])[1]||'')}</li>`:''}${P.map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`).join('')}</ul></details>`:''})()}${si&&si.k>1&&si.st?`<div class="sh-feat"><b>${esc(si.name)}</b> <small>stage ${ROMAN[si.k-1]} of ${esc(c.cls)}</small><ul>${STAGES[c.cls].filter(x=>x.stage<=si.k).flatMap(x=>x.features.filter(f=>f[0]<=L1).map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`)).join('')}</ul></div>`:''}${(()=>{const x=c.sub&&SUBS.find(y=>y.n===c.sub),f=x&&x.lv?x.lv.filter(f=>f[0]<=L1):[];return f.length?`<div class="sh-feat"><b>${esc(c.sub)}</b> <small>subclass, levels 3–20${c.cls2?' ('+esc(c.cls)+')':''}</small><ul>${f.map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`).join('')}</ul></div>`:''})()}${si&&si.k>1&&c.sub&&typeof SUBSTAGES!=='undefined'&&SUBSTAGES[c.sub]?`<div class="sh-feat"><b>${esc(stageName(c.sub,si.k))}</b> <small>subclass, stage ${ROMAN[si.k-1]}</small><ul>${SUBSTAGES[c.sub].filter(x=>x.stage<=si.k).flatMap(x=>x.features.filter(f=>f[0]<=L1).map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`)).join('')}</ul></div>`:''}
        ${c.cls2&&L2?`<div class="sh-feat"><b>${esc(si2&&si2.k>1?si2.name:c.cls2)} ${L2}</b> <small>second class</small>${si2&&si2.k>1&&STAGES[c.cls2]?`<ul>${STAGES[c.cls2].filter(x=>x.stage<=si2.k).flatMap(x=>x.features.filter(f=>f[0]<=L2).map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`)).join('')}</ul>`:''}${(()=>{const x=c.sub2&&SUBS.find(y=>y.n===c.sub2),f=x&&x.lv?x.lv.filter(f=>f[0]<=L2):[];return f.length?`<div><b>${esc(c.sub2)}</b><ul>${f.map(f=>`<li><b>${esc(f[1])}</b> (Lv ${f[0]}): ${esc(f[2])}</li>`).join('')}</ul></div>`:''})()}<div class="note" style="margin:2px 0 0">Write its class features below (from the class's own levels 1 to ${L2}).</div></div>`:''}
        ${s.traits.map(t=>`<div class="sh-feat"><b>◆ ${esc(t.m.tr.n)}</b> <small>${esc(t.m.n)} in ${esc(t.b.n)}</small><div>${esc(t.m.tr.t)}</div></div>`).join('')}
        ${s.gb.src.length?`<div class="sh-feat"><b>Gear: saves, initiative, and skills</b><div>${s.gb.src.map(x=>`${esc(x.m.n)} in ${esc(x.b.n)}: ${esc(x.m.pn)} (Potency ${x.m.pot})`).join('; ')}</div></div>`:''}
        ${s.drawback.length?`<div class="sh-feat"><b>Armor drawbacks</b><div>${s.drawback.map(o=>esc(o.d)).join('; ')}</div></div>`:''}
        ${ta('features','Class, race, and background features',8)}`;
  // page 1, laid out like the classic 5e sheet (FAND's own boxes are on the FAND page)
  const core=`<div class="sh-cols">
    <div class="sh-col sh-c1">
      <div class="sh-abil">${ABIL.map(([k,n])=>`<div class="sh-ab"><div class="sh-lab">${n}</div><button class="sh-roll" type="button" data-roll="${d20x(M(k))}" data-what="${n} (basic action)" title="Basic action: a plain use of ${n} that no skill covers (lifting, shoving, holding your breath, keeping your balance). Skill rolls never add this." class="sh-mod sh-roll">${sgn(M(k))}</button><input data-s="abil.${k}" type="number" min="1" max="999" value="${A[k]??10}" aria-label="${n} score"></div>`).join('')}</div>
      <div class="sh-col2">
        <div class="sh-row sh-ins">${chk('insp')}<span class="sh-lab" style="margin:0">Inspiration</span></div>
        <div class="sh-row sh-ins"><b class="sh-pill">${sgn(pb)}</b><span class="sh-lab" style="margin:0">Proficiency bonus</span></div>
        <div class="sh-list">${ABIL.map(([k,n])=>`<label title="FAND: only class abilities and equipment add to a save${s.gb[k]?' · +'+s.gb[k]+' from gear':''}"><button class="sh-roll" type="button" data-roll="${d20x((+((c.saveB||{})[k])||0)+s.gb[k])}" data-what="${n} save">${sgn((+((c.saveB||{})[k])||0)+s.gb[k])}</button> ${n}${s.gb[k]?` <small style="color:var(--gold2)">+${s.gb[k]} gear</small>`:''} ${inp('saveB.'+k,'0','class="sh-mini" title="Bonus from class abilities (gear is added for you)"','number')}</label>`).join('')}<div class="sh-lab">Saving throws</div></div>
        <div class="sh-list">${SKILLS.map(sk=>`<label title="FAND: a skill roll is d20 + the skill's bonus only, never + an ability modifier (gear is added for you)"><button class="sh-roll" type="button" data-roll="${d20x(skillVal(sk))}" data-what="${esc(sk[1])}${c.disSkill===sk[0]?' (disadvantage)':''}">${sgn(skillVal(sk))}</button> ${sk[1]}${c.disSkill===sk[0]?' <small style="color:var(--red)" title="Disadvantage on these checks (background)">disadv.</small>':''}${s.gb[sk[0]]?` <small style="color:var(--gold2)">+${s.gb[sk[0]]} gear</small>`:''} ${inp('skillB.'+sk[0],'0','class="sh-mini" title="Skill bonus"','number')}</label>`).join('')}${(c.custom||[]).map((k,i)=>`<label><button class="sh-roll" type="button" data-roll="${d20x(+k.v||0)}" data-what="${esc(k.n)}">${sgn(+k.v||0)}</button> ${esc(k.n)} ${inp('custom.'+i+'.v','0','class="sh-mini" title="Skill bonus"','number')}</label>`).join('')}<div class="sh-lab">Skills <small>(skill bonus only, no ability modifier)</small></div></div>
      </div>
      <div class="sh-span sh-row sh-ins"><b class="sh-pill sh-pp">${10+skillVal(SKILLS.find(x=>x[0]==='perception'))}</b><span class="sh-lab" style="margin:0">Passive Wisdom (Perception)</span></div>
      <div class="sh-span">${box('Other proficiencies &amp; languages',ta('profs','Armor, weapons, tools, languages',6))}</div>
    </div>
    <div class="sh-col">
      <div class="sh-trio">${box('Armor class',`<div class="sh-big">${s.ac}</div><small>armor ${s.armorAC}${s.conAC?' · CON '+sgn(s.conAC):''}${s.unAC?' · unarmored +'+s.unAC:''}${s.maAC?' · Mage Armor +'+s.maAC:''}${s.styleAC?' · Defense +1':''}${s.ct?' · contract +'+s.ct.ac:''}${s.spare?` · <span title="Only the best piece in each slot (and one shield) is worn and counts; barding protects a mount, not its rider">${s.spare} spare piece${s.spare>1?'s':''} carried, not counted</span>`:''}${s.fxAC?` · <span title="From the properties and traits on the character's gear${s.fxACcap?'. Capped: an item\'s properties and traits add at most half its own AC':''}">properties &amp; traits +${s.fxAC}${s.fxACcap?' (capped)':''}</span>`:''}</small>${s.shieldSp?`<small title="The Shield spell: a reaction when you are hit, +5 AC until the start of your next turn">With the Shield spell <b>${s.ac+5}</b></small>`:''}${s.maKnown&&!s.body?`<label class="sh-noprint" style="font-size:.8rem;display:block"><input type="checkbox"${c.noMageArmor?'':' checked'} onchange="sheetMageArmor(this.checked)"> Mage Armor is up</label>`:''}<small title="When you are attacked, roll this against the attacker's Accuracy: higher roll wins">Dodge <button class="sh-roll" type="button" data-roll="${d20x(s.dodge)}" data-what="Dodge">${sgn(s.dodge)}</button> (DEX)</small>`,'sh-shield')}${box('Initiative',`<button class="sh-roll" type="button" data-roll="${d20x((+c.initB||0)+s.gb.init)}" data-what="Initiative" class="sh-big sh-roll">${sgn((+c.initB||0)+s.gb.init)}</button><small>class ${inp('initB','0','class="sh-mini" style="width:44px" title="Initiative from class features"','number')}${s.gb.init?' · gear +'+s.gb.init:''}</small>`)}${box('Speed',`${inp('speed','30','style="width:60px;text-align:center"','number')}${speedPen?`<small style="color:var(--red)">−${speedPen} ft from armor</small>`:''}${s.fxSpeed?`<small title="From the properties and traits on the character's gear${s.fxSpeedCap?'. Capped: gear can at most double your speed':''}">gear powers +${s.fxSpeed} ft${s.fxSpeedCap?' (capped)':''} · ${Math.max(0,(+c.speed||30)+s.fxSpeed-(speedPen||0))} ft in all</small>`:''}`)}</div>
      <div class="sh-row sh-noprint" style="gap:6px"><button class="btn primary" type="button" onclick="TBL.id=sheetChar().id;openTable('char')" title="A full-screen view for play">🎲 Table screen</button><button class="btn" type="button" onclick="sheetRest('short')" title="Get back one used spell slot of your choice (and Warlock pact slots)">☕ Short rest</button><button class="btn" type="button" onclick="sheetRest('long')" title="Full HP, all slots, half your hit dice back, death saves cleared">🌙 Long rest</button></div>
      ${box('Current hit points',`<div class="sh-row sh-hpmax"><span>Hit Point Maximum</span>${inp('hpMax','','style="width:70px"','number')}</div><div class="sh-big">${inp('hp','','style="width:100%;text-align:center;font-size:1.6rem"','number')}</div>${sheetHpQuick(c)}`)}
      ${box('Temporary hit points',inp('tempHp','','style="width:100%;text-align:center"','number'))}
      <div class="sh-trio" style="grid-template-columns:1fr 1fr">${box('Hit dice',`<div class="sh-row sh-hpmax"><span>Total</span><b>${L1}d${CLASS_DIE[c.cls]||8}${L2?` + ${L2}d${CLASS_DIE[c.cls2]||8}`:''}</b></div>${inp('hdUsed','used','style="width:60px"','number')}`)}${box('Death saves',`<div class="sh-row">Successes ${[0,1,2].map(i=>chk('ds.s'+i)).join('')}</div><div class="sh-row">Failures ${[0,1,2].map(i=>chk('ds.f'+i)).join('')}</div>`)}</div>
      ${box('Attacks &amp; spellcasting',`<table class="t sh-t"><thead><tr><th>Name</th><th class="num">Accuracy</th><th>Damage/type</th></tr></thead><tbody>${weapons.map(atkRow).join('')||'<tr><td colspan="3" class="note">Equip weapons on the Party page or from the Forge.</td></tr>'}</tbody>${c.shot&&Object.keys(c.shot).length?`<caption style="caption-side:bottom;text-align:left;padding-top:6px" class="sh-noprint"><small class="note">Shot this fight: ${esc(Object.entries(c.shot).map(([n,k])=>k+' '+n).join(', '))}</small> <button class="btn" type="button" style="padding:0 8px;font-size:.75rem" onclick="sheetRecover()" title="After the fight: half of the arrows, bolts, needles and bullets can be found again (firearm shot is spent)">Pick up ammunition</button></caption>`:''}</table>${ta('atkNotes','Other attacks, spell attacks',3)}`)}
      ${box('Equipment',`${GEAR_GROUPS.map(([g,t])=>{const L=(c.gear||[]).filter(n=>gearGroup(n)===g);return L.length?`<div class="sh-lab" style="text-align:left;margin:0">${t}</div><ul class="sh-ul">${L.map(n=>{const b=findBP(n);return `<li>${b?refChip(b,esc(n)):gearChip(n)}${b&&b.ac?` <small>(AC ${esc(String(b.ac))})</small>`:''} <small class="sh-where">${esc(wornOn(gearItem(n)||n))}</small></li>`}).join('')}</ul>`:''}).join('')}${ta('equip','Other equipment',3)}<div class="note sh-noprint" style="margin:4px 0 0">Money, materials, and what you carry are on <a href="#" onclick="SHEET_TAB='gear';renderSheet();return false">Equipment &amp; Materials</a> (carrying ${invUsed(c)} of ${invCap(c)}).</div>`)}
    </div>
    <div class="sh-col">
      <div class="sh-box sh-pers">${ta('traits','',3)}<div class="sh-lab">Personality traits</div>${ta('ideals','',2)}<div class="sh-lab">Ideals</div>${ta('bonds','',2)}<div class="sh-lab">Bonds</div>${ta('flaws','',2)}<div class="sh-lab">Flaws</div></div>
      ${(c.lvTodo||[]).length?`<div class="sh-box sh-noprint" style="margin-bottom:12px;border-color:var(--gold)"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:baseline"><b>✅ Level-up checklist</b><span class="note" style="margin:0">Still to do from your last level-ups. Tick each one when it is on your sheet.</span></div>${c.lvTodo.map((x,i)=>`<label style="display:flex;gap:8px;align-items:flex-start;margin-top:6px;cursor:pointer"><input type="checkbox" onchange="lvTodoDone(${i})" style="margin-top:3px"><span><b>Level ${x.lv}: ${esc(x.t)}</b> <small style="color:var(--text2)">${esc(x.d)}</small>${x.k==='asi'?' <small>(raise the scores in the ability boxes above)</small>':x.k==='style'?` <select class="sel" onclick="event.stopPropagation()" onchange="sheetStyle(this.value,${i})"><option value="">Choose…</option>${FIGHT_STYLES.map(([n])=>`<option>${esc(n)}</option>`).join('')}</select>`:''}</span></label>`).join('')}</div>`:''}
      ${resHTML(c)}
      ${box('Features &amp; traits',feats,'tall')}
    </div></div>`;
  // Equipment & Materials: what is equipped, the purse (all money lives here), and what is carried
  const gearPg=`${curseBoxHTML(c)}<div class="sh-cols" style="grid-template-columns:1fr 1fr">
    <div class="sh-col">
      ${(()=>{const li=(n,i,bare)=>{const b=findBP(n);if(isForeign(b))return `${bare?'':'<li>'}<span class="b red" title="Forged from someone else's Blueprint: only its maker can use it">⛔ Invalid item</span> ${esc(n)} <span class="sh-noprint" style="cursor:pointer;color:var(--muted)" onclick="sheetGear('rm',${i})" title="Unequip">✕</span>${bare?'':'</li>'}`;return `${bare?'':'<li>'}${b?refChip(b,esc(n),esc(b.cat)+(b.ac&&ARMOR_CATS.includes(b.cat)?' · AC '+esc(String(b.ac)):'')+(b.cap&&b.carry?' +'+(b.cap+(b.grow?b.grow*(+c.spaceFrags||0):0))+' room':'')):gearChip(n)}${bare?'':` <small class="sh-where">${esc(wornOn(gearItem(n)||n))}</small>`} <span class="sh-noprint" style="cursor:pointer;color:var(--muted)" onclick="sheetGear('rm',${i})" title="Unequip (back to the bag)">✕</span>${bare?'':'</li>'}`};
        const G=g=>(c.gear||[]).map((n,i)=>({n,i})).filter(x=>gearGroup(x.n)===g),add=(g,ph)=>`<div class="sh-row sh-noprint" style="margin-top:6px">${gearDatalist(c,g==='equip'?null:g)}<input class="sel" id="${g==='equip'?'gear-n':'gear-n-'+g}" list="${g==='equip'?'dl-gear':'dl-gear-'+g}" placeholder="${ph}" onkeydown="if(event.key==='Enter'){event.preventDefault();sheetGear('add',0,'${g}')}" style="flex:1;min-width:0"><button class="btn" type="button" onclick="sheetGear('add',0,'${g}')">Equip</button></div>`;
        const W=G('weapon'),hands=W.reduce((a,x)=>{const w=wornOn(gearItem(x.n)||x.n);return a+(w==='Both hands'?2:/^(One hand|One or both hands)/.test(w)?1:0)},0)+((c.gear||[]).some(n=>{const b=findBP(n);return b&&b.cat==='Shield'})?1:0);
        return box('⚔ Weapons',`<ul class="sh-ul">${W.map(x=>li(x.n,x.i)).join('')||'<li class="note">No weapon equipped.</li>'}</ul><div class="note" style="margin:4px 0 0">Hands in use: <b>${hands}</b> of 2</div>${gearClashHTML(c,'weapon')}${add('weapon','Equip a weapon…')}`)
          +box('🛡 Armour',`${armorSlotsHTML(c,li)}${gearClashHTML(c,'armor')}${add('armor','Equip armour or a shield…')}`)
          +box('🎒 Equipment',`<div class="note" style="margin:0 0 6px">Equipped items don't count toward carrying. Worn storage adds room.</div><ul class="sh-ul">${G('equip').map(x=>li(x.n,x.i)).join('')||'<li class="note">Nothing else equipped.</li>'}</ul>${add('equip','Equip anything: a focus, ring, tool, or item…')}${datalists()}`)})()}
      ${forgedHTML(c)?box('Forged items',forgedHTML(c)):''}
      ${box('Purse',(()=>{const cr=REALMS.filter(r=>CURRENCY[r.n]&&CURRENCY[r.n].coin),co=c.coins||{},small=(+co.cp||0)/100+(+co.sp||0)/10+(+co.ep||0)/2+(+co.gp||0)+(+co.pp||0)*10;return `<div class="sh-lab" style="text-align:left;margin:0">Common coins</div><div class="sh-coins" style="flex-direction:row;flex-wrap:wrap;gap:6px;margin-bottom:6px">${['cp','sp','ep','gp','pp'].map(k=>`<label><span>${k.toUpperCase()}</span>${inp('coins.'+k,'0','class="sh-mini"','number')}</label>`).join('')}</div><div class="sh-lab" style="text-align:left;margin:0">Realm money</div><div class="sh-purse">${cr.map(r=>`<label title="${esc(CURRENCY[r.n].what||'')}"><span>${esc(CURRENCY[r.n].coin)} <small>${esc(r.n)} · ${gp(CURRENCY[r.n].gp)}</small></span>${inp('purse.'+r.n,'0','class="sh-mini"','number')}</label>`).join('')}</div><div class="sh-row" style="gap:8px;margin:4px 0"><label style="display:flex;gap:8px;align-items:center;flex:1" title="Favor: what the Void and deeper realms trade in instead of coin"><span>⟡ Favor <small>Void and deeper</small></span>${inp('favor','0','class="sh-mini"','number')}</label></div><div class="sh-row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:4px"><span class="note" style="margin:0">Worth in all</span><b>${gp(Math.round((s.purseGp+small)*100)/100)}</b></div><div class="note sh-noprint" style="margin:0">Each realm mints its own money; prices on the site are in gp. Money is worth most in its own realm (see Economy on the Rules page).</div>`})())}
    </div>
    <div class="sh-col">
      ${box('Inventory',`${invHead(c)}<div class="sh-inv">${(c.inv||[]).map(([n,q],i)=>{const x=findMat(n)||findBP(n);return `<div class="sh-row"><input data-s="inv.${i}.1" type="number" min="0" value="${+q||0}" class="sh-mini" style="margin:0" aria-label="Quantity"> <span style="flex:1;min-width:0">${x?refChip(x,esc(n),esc(invLabel(n))):`${esc(n)} <small style="color:var(--muted)">${esc(invLabel(n))}</small>`}</span>${invRowBtns(c,n,i)}<span style="cursor:pointer;color:var(--muted)" onclick="sheetInvRm(${i})" title="Remove">✕</span></div>`}).join('')||'<div class="note" style="margin:0">Nothing carried yet.</div>'}</div><div class="sh-row sh-noprint" style="margin-top:4px"><input class="sel" id="inv-n" list="dl-item" placeholder="Add anything: a material, Blueprint, or item…" onkeydown="if(event.key==='Enter'){event.preventDefault();sheetInvAdd()}" style="flex:1;min-width:0">${itemDatalist()}<input class="sel" id="inv-q" type="number" min="1" value="1" style="width:60px"><button class="btn" type="button" onclick="sheetInvAdd()">Add</button></div><div class="note sh-noprint" style="margin:0">Scavenged parts, mined ore, and Party-page materials land here too.</div>`)}
    </div></div>`;
  // the FAND page: everything the classic sheet has no room for
  const fand=`<div class="sh-cols" style="grid-template-columns:1fr 1fr">
    <div class="sh-col">
      ${box('FAND',`<div class="sh-row" style="flex-wrap:wrap;gap:14px"><span><b>Stage</b> ${ROMAN[(siC?siC.k:1)-1]} ${(siC?siC.k:1)<MAX_STAGE?`<small>(next at level ${stageStart((siC?siC.k:1)+1)})</small>`:''}</span><span><b>Realms</b> ${(siC?siC.realms:['Human']).map(esc).join(', ')}</span><span><b>Attunement</b> ${s.att}</span><span><b>Contracts</b> ${s.contracts.map(x=>esc(godKey(x.g))+' ('+esc(x.ct.r)+')').join(', ')||'none'}</span></div><div class="note" style="margin:4px 0 0">Gear, materials, profession, and contracts are edited on the <a href="${pageUrl('party')}" data-go="party">Party</a> page; this sheet uses them. Saving throws add no ability modifier or proficiency: only abilities and equipment.</div><div class="sh-row" style="flex-wrap:wrap;gap:12px;margin-top:6px"><label class="note" style="margin:0">Other AC (traits, magic) ${inp('acBonus','0','class="sh-mini"','number')}</label><label class="note" style="margin:0">Attunement (if higher than worked out) ${inp('attune','0','class="sh-mini"','number')}</label></div>`)}
      ${c.cls&&CLASS_MAIN[c.cls]?box('Steady Growth',[[c.cls,L1,c.growApplied||0],[c.cls2,L2,c.growApplied2||0]].filter(([k,l])=>k&&l>0&&CLASS_MAIN[k]).map(([k,l,done])=>{const n=steadyCount(l),p=n-done,g=growthOf(k);return `<div class="note" style="margin:0"><b>${esc(k)} ${l}</b>: ${esc(growthText(g))} a level · ${n} reached${p>0?` · <b style="color:var(--gold2)">${p} not yet added (${esc(growthText(Object.fromEntries(Object.entries(g).map(([a,v])=>[a,v*p]))))})</b>`:p<0?` · <span style="color:var(--red)">${-p} more added than reached</span>`:' · all added'}</div>`}).join('')+(steadyCount(L1)>(c.growApplied||0)||(c.cls2&&steadyCount(L2)>(c.growApplied2||0))?`<button class="btn" type="button" onclick="sheetGrow()" style="align-self:flex-start">Add Steady Growth</button>`:'')):''}
      ${box('Second class (dual classing)',`${c.cls2?`<div class="sh-row" style="flex-wrap:wrap"><b>${esc(c.cls)} ${L1}</b> / <b>${esc(c.cls2)} ${L2}</b> <small>(character level ${L})</small></div><div class="sh-row" style="flex-wrap:wrap"><label class="note" style="margin:0">Subclass <select data-s="sub2"><option value=""></option>${SUBS.filter(x=>x.par===c.cls2).map(x=>`<option${x.n===c.sub2?' selected':''}>${esc(x.n)}</option>`).join('')}</select></label><button class="btn" type="button" onclick="sheetLv2(1)"${L1<=1?' disabled':''}>Give a level to ${esc(c.cls2)}</button><button class="btn" type="button" onclick="sheetLv2(-1)"${L2<=0?' disabled':''}>Give one back to ${esc(c.cls)}</button><span style="cursor:pointer;color:var(--muted)" onclick="sheetCls2('')" title="Drop the second class">✕</span></div>`:`<div class="sh-row" style="flex-wrap:wrap"><select class="sel" id="cls2-new"><option value="">Choose a second class…</option>${Object.keys(CLASS_DIE).sort().filter(x=>x!==c.cls).map(x=>`<option>${x}</option>`).join('')}</select><button class="btn" type="button" onclick="sheetCls2($('cls2-new').value)">Take it</button></div>`}<div class="note" style="margin:0">Levels are shared (5e style): each class has its own levels, features, class changes, and Steady Growth; proficiency, stage, and realms follow the character's total level; spell slots combine (full casters count every level, half casters half). Taking a second class needs a teacher of it or a trial (DM's call).</div>`)}
      ${box('Custom skills',`${(c.custom||[]).map((k,i)=>`<div class="sh-row"><b>${esc(k.n)}</b> <small>(${(k.ab||'int').toUpperCase()})</small> <span style="cursor:pointer;color:var(--muted)" onclick="sheetSkillRm(${i})" title="Remove">✕</span></div>`).join('')}<div class="sh-row"><input class="sel" id="sk-new" placeholder="Add a skill (e.g. Runecraft)" style="flex:1;min-width:0"><select class="sel" id="sk-ab">${ABIL.map(([k])=>`<option value="${k}">${k.toUpperCase()}</option>`).join('')}</select><button class="btn" type="button" onclick="sheetSkillAdd()">Add</button></div><div class="note" style="margin:0">They appear under Skills on page 1.</div>`)}
      ${box('Profession',sheetProfHTML(c,inp))}
    </div>
    <div class="sh-col">
      ${box('Contracts',`${[{god:c.god,rank:c.rank,how:c.ctHow,i:-1},...(c.extra||[]).map((x,i)=>Object.assign({},x,{i}))].filter(x=>x.god).map(x=>{const g=godByKey(x.god),ct=x.rank?contractOf(x.rank):null;return `<div class="sh-feat"><div class="sh-row" style="flex-wrap:wrap"><b>${g?refChip(g,esc(godKey(g))):esc(x.god)}</b><select class="sel" style="max-width:150px" onchange="sheetCtRank(${x.i},this.value)">${CONTRACT_RANKS.map(r=>`<option${ct&&r===ct.r?' selected':''}>${r}</option>`).join('')}</select><span style="cursor:pointer;color:var(--muted);margin-left:auto" onclick="sheetCtRm(${x.i})" title="End this contract">✕</span></div>${x.how?`<small>Gained by: ${esc(ctWay(x.how))}</small><br>`:''}${g&&ct?`<small>Natural AC +${ct.ac} · temple discount ${ct.disc}% · ⟡${ct.favor} Favor per task</small><div>${esc(ct.power)}</div>${(g.csp||[]).length?`<div style="margin-top:4px"><b>Contract spells:</b> ${g.csp.slice(0,ctSpellMax(ct)+1).map((n,lv)=>esc(n)+' ('+(lv?'level '+lv:'cantrip')+')').join(', ')}</div>`:''}<div class="sh-row" style="gap:6px;margin-top:4px"><span>Favor with ${esc(godKey(g))} ⟡</span>${inp('favor.'+lc(godKey(g)).replace(/[^a-z0-9]+/g,'_'),'0','style="max-width:90px"','number')}</div>`:''}</div>`}).join('')||'<div class="note" style="margin:0">No contract yet.</div>'}<div class="sh-row sh-noprint" style="flex-wrap:wrap;margin-top:4px"><select class="sel" id="ct-god" style="flex:1;min-width:160px"><option value="">Contract with a god…</option>${GODS.map(g=>`<option value="${esc(godKey(g))}">${esc(godKey(g))}</option>`).join('')}</select><select class="sel" id="ct-rank">${CONTRACT_RANKS.map(r=>`<option>${r}</option>`).join('')}</select>${ctWayOpts('','ct-how','style="flex:1;min-width:160px"')}<button class="btn" type="button" onclick="sheetCtAdd()">Add contract</button></div><div class="note sh-noprint" style="margin:0">A contract is only gained by meeting a follower of the god, a ritual with its core material, finding its temple, or an item integrated with it. Serving several gods is allowed; Natural AC does not stack (the highest counts). Gods who share a Rune are rivals.</div>`)}
      ${c.race?box('People: '+esc(c.race),peopleInfo(c.race)?`<div class="note" style="margin:0 0 4px">${esc(peopleLine(c.race))} · ${esc((peopleInfo(c.race).langs||[]).join(', '))}</div><div style="font-size:.85rem">${(peopleInfo(c.race).traits||[]).map(t=>`<b>${esc(t[0])}.</b> ${esc(t[1])}`).join('<br>')}</div><button class="btn sh-noprint" type="button" style="margin-top:6px" onclick="peoplePop(${esc(JSON.stringify(c.race))})">ⓘ Full profile</button>`:'<div class="note" style="margin:0">Not one of the site\'s peoples: write its traits in Features.</div>'):''}
      ${c.race?box('Heritage'+(c.race2?': '+esc(c.race2):''),heritageHTML(c)):''}
      ${box('Hidden classes (bonus)',`${inp('hidden','Hidden class (if unlocked)')}${hcSheetHTML(c,L)}`)}
      ${isSummoner(c)?box('Undead servants',`<div class="sh-row"><b class="sh-pill">${(c.undead||[]).length}/${summonSlots(c)}</b><span>summon slots used (one per point of INT)</span></div>${necroLv(c)>=6?`<div class="sh-row" style="gap:8px;flex-wrap:wrap"><b class="sh-pill">🦴 ${+c.essence||0}</b><span>essence (Bone Tithe)</span><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="sheetEssence(1)" aria-label="Add essence">+</button><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="sheetEssence(-1)" aria-label="Spend essence">−</button></div>`:''}${(c.undead||[]).map((u,i)=>{const N=servantNow(c,u),ess=+c.essence||0,nl=necroLv(c);return `<div class="sh-feat"${u.dead?' style="opacity:.6"':''}><b>${esc(u.n)}</b> <small>${u.p}% · ${esc(u.realm||'')}</small>${u.dead?' <span class="b red">destroyed</span>':''} <span style="cursor:pointer;color:var(--muted)" onclick="sheetUndeadRm(${i})" title="Release or lose it">✕</span><div>HP ${N.hp} · AC ${N.ac}${N.dmg?` · +${N.dmg} damage`:''}${u.ab&&u.ab.length?' · '+u.ab.join('/'):''} · upkeep: ${esc(u.up||'none')}</div>${N.th?`<div class="note" style="margin:0">Undead Thralls: at least ${u.p}% of a level ${+c.level||1} monster, + proficiency bonus</div>`:''}
  ${nl>=6?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${u.dead?`<button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="sheetUndeadRaise(${i})"${ess<3?' disabled title="Needs 3 essence"':''}>Re-raise (3 essence)</button>`:`<button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="sheetUndeadMend(${i})"${ess<1?' disabled title="Needs 1 essence"':''}>Restore to full HP (1 essence)</button><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="sheetUndeadDead(${i})">Mark destroyed</button>`}</div>`:''}${u.chain?`<label class="note" style="margin:2px 0 0;display:flex;gap:6px;align-items:center"><input type="checkbox" ${u.bound?'checked':''} onchange="sheetUndeadBind(${i},this.checked)"> ⛓ bound by the chain ritual</label>`:''}</div>`}).join('')||'<div class="note" style="margin:0">None yet. Raise one from a corpse (Scavenge panel in the combat tracker, or the Tools page).</div>'}`):''}${c.bondOn||dmUnlocked()?box('Bonded summons',bondHTML(c)):''}
    </div></div>`;
  const details=`<div class="sh-box" style="margin-bottom:12px"><div class="sh-row" style="flex-wrap:wrap"><b>Accomplishments</b><span class="note" style="margin:0">Characters level up when they do something big, at the DM's pace.</span></div>
      <div class="sh-row" style="flex-wrap:wrap"><input class="sel" id="ac-deed" list="dl-deeds" placeholder="What did they accomplish?" style="flex:1;min-width:220px"><datalist id="dl-deeds">${DEEDS.map(d=>`<option value="${esc(d)}">`).join('')}</datalist><button class="btn" type="button" id="ac-log">Record</button><button class="btn primary" type="button" id="ac-lvl">Record and level up</button></div>
      <ul class="sh-ul">${(c.log||[]).slice().reverse().map(x=>`<li>${esc(x.d||'')} · ${esc(x.deed)}${x.lv?` <b>→ level ${x.lv}</b>`:''}</li>`).join('')||'<li class="note">Nothing recorded yet.</li>'}</ul><div class="sh-lab">Accomplishments</div></div>
    <div class="sh-hgrid" style="margin-bottom:12px">${[['age','Age'],['height','Height'],['weight','Weight'],['eyes','Eyes'],['skin','Skin'],['hair','Hair']].map(([k,l])=>`<div>${inp('look.'+k,l)}<div class="sh-lab">${l}</div></div>`).join('')}</div>
    <div class="sh-cols" style="grid-template-columns:1fr 2fr"><div class="sh-col">${box('Character appearance',ta('appearance','',10))}${box('Character backstory',ta('backstory','',16))}</div>
    <div class="sh-col">${standSheetHTML(c)?box('Standing',standSheetHTML(c)):''}${box('Allies &amp; organizations',`<div class="sh-row"><span>Symbol / name</span>${inp('orgName','Faction or order')}</div>${ta('allies','',8)}`)}${box('Additional features &amp; traits',ta('features2','',8))}${box('Notes',ta('notes','Session notes, goals, debts, rumours',6))}${box('Treasure',`${ta('treasure','',6)}${(c.inv||[]).length?`<div class="note">Materials carried (Party page): ${(c.inv||[]).map(([n,q])=>q+'× '+esc(n)).join(', ')}</div>`:''}`)}</div></div>`;
  const cc=CAST_ABIL[c.cls]||!c.cls2?c.cls:c.cls2,ca=CAST_ABIL[cc],sch=(c.schools||[]).filter(x=>x&&x.n),slots0=mcSlots(c,L1,L2),slots=schoolSlots(slots0,sch.length),sm=ca?M(ca):0;
  const FO=focusOf(c),CA=charStats(c).castArm,schM=n=>{const x=sch.find(y=>y.n===n);return x?x.m:0},canTake=sp=>!slots0||!SP.length?true:sp.lv===0?schM(sp.sc)>0:schoolMax(cc,schM(sp.sc),slots0)>=sp.lv;
  const ptsLeft=L-sch.reduce((a,x)=>a+x.m,0),sugg=new Set(cc&&SP.length?[...schoolsOf(cc),...(c.cls2&&CAST_ABIL[c.cls2]&&c.cls2!==cc?schoolsOf(c.cls2):[])].map(x=>x[0]):[]),opts=cc&&SP.length?allSchools().filter(([n])=>schoolOk(c,n,sch)).sort((a,b)=>(sugg.has(b[0])-sugg.has(a[0]))||b[1]-a[1]):[];
  const schoolBox=slots0&&SP.length?`<div class="sh-box" style="margin-bottom:12px"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:baseline"><b>Schools of magic</b><span class="note" style="margin:0">${sch.length?`${ptsLeft>0?`<b style="color:var(--gold2)">${ptsLeft} school point${ptsLeft>1?'s':''} to spend</b> (one per level): progress a school or open a new one.`:ptsLeft<0?`<span style="color:var(--red)">${-ptsLeft} more point${ptsLeft<-1?'s':''} spent than levels</span>`:'All school points spent.'}`:'Choose the one school your spells come from.'}</span></div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">${sch.map((x,i)=>`<div class="sh-row" style="gap:8px;flex-wrap:wrap"><b>${esc(x.n)}</b>${i===0?'<span class="b gold">first school</span>':''}<span>Mastery ${x.m} · spells up to ${schoolMax(cc,x.m,slots0)?ORDN(schoolMax(cc,x.m,slots0))+' level':'cantrips'}</span>${ptsLeft>0?`<button class="btn" type="button" onclick="sheetSchool('up',${i})">+ Progress</button>`:''}${x.m>1?`<button class="btn" type="button" onclick="sheetSchool('down',${i})" title="Take a point back">−</button>`:''}${sch.length>1||x.m===1?`<span style="cursor:pointer;color:var(--muted)" title="Drop this school" onclick="sheetSchool('rm',${i})">✕</span>`:''}</div>`).join('')}</div>
    ${!sch.length||ptsLeft>0?`<div class="keyrow" style="margin-top:8px"><select class="sel" id="sch-new" style="max-width:none;flex:1">${opts.filter(([n])=>!sch.some(x=>x.n===n)).map(([n,k])=>`<option value="${esc(n)}">${esc(n)} (${k} spells)${sugg.has(n)?' · suggested':''}</option>`).join('')}</select><button class="btn" type="button" onclick="sheetSchool('add')">${sch.length?'Open a new school':'Choose school'}</button></div>`:''}
    ${sch.length>1?`<div class="note" style="margin:6px 0 0">Holding ${sch.length} schools costs ${sch.length-1} slot${sch.length>2?'s':''} at each spell level (never below 1).</div>`:''}<div class="sh-lab">Spells come only from your schools · a school gives every spell in it, whatever classes the spell lists</div></div>`:'';
  const spellLv=lv=>{const list=(c.spells||{})[lv]||[];const tot=slots?(slots.pact?(lv&&lv<=({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[slots.lvl]||5)&&lv===({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[slots.lvl]||5)?slots.n:0):(slots.slots||[])[lv-1]||0):0;
    return `<div class="sh-box"><div class="sh-row" style="gap:8px"><b class="sh-pill">${lv}</b><span>${lv?`Slots <b>${tot}</b> · used ${[...Array(tot)].map((_,i)=>chk('slotUsed.'+lv+'.'+i)).join('')}`:'Cantrips'}</span></div>
      <ul class="sh-ul">${list.map((n,i)=>{const sp=SP.find(x=>lc(x.n)===lc(n));const need=sp?spellNeed(sp):1,ok=!siC||need<=siC.k,inSch=!sp||!slots0||!SP.length||canTake(sp);const bd=((c.spBound||{})[lc(n)])||(sp&&spellHome(sp))||'Human',here=c.here||'Human',off=bd!==here,opts=REALMS.filter(r=>tierStage(r.tier)<=(si?si.k:1)||r.n===bd);
        return `<li style="${off?'opacity:.55':''}">${lv?chk('prep.'+lv+'.'+i,'Prepared'):''} ${sp?refChip(sp,esc(n)):esc(n)}${sp?` <button class="btn sh-noprint sh-cast" type="button" style="padding:0 7px;font-size:.75rem" onclick="sheetCast(${lv},${i})" title="Cast it: ${CA?'rolls the casting-in-armor check first, then ':''}rolls its dice${lv?' and ticks a free slot':''}">Cast</button>`:''}${sp&&spellScales(sp)?` <small class="mono" style="color:var(--red)" title="×${spellPow(c,bd,sp)}: the higher of the ${esc(bd)} Realm (×${diceMult(realmPow(bd))}) and level ${c.level||1} (×${diceMult(bandOf(c.level))})${sp&&sp.lv===0&&cantripStep(c.level)>1?`, ×${cantripStep(c.level)} for a cantrip at level ${c.level}`:''}${focusFor(FO,sp).dmg?`; +${focusFor(FO,sp).dmg} from ${esc(FO.n)}${focusFor(FO,sp).fav?' (a favoured school: double)':''}`:''}">${esc(focusDice(spellAt(spellDmg(sp),spellPow(c,bd,sp)),{dmg:focusFor(FO,sp).dmg}))}</small>${sp&&FO.buff&&focusRange(sp.rng,FO)!==String(sp.rng||'')?` <small style="color:var(--blue,#5a8dd6)" title="${esc(FO.n)}: ${esc(FO.buff.t)}">${esc(focusRange(sp.rng,FO))}</small>`:''}${sp&&(focusFor(FO,sp).dc||focusFor(FO,sp).acc)?` <small style="color:var(--gold2)" title="${esc(FO.n)}: ${esc(FO.buff.t)}">${focusFor(FO,sp).dc?'DC +1':'Accuracy +1'}</small>`:''}`:''} <small style="color:var(--muted)">${sp&&spellHome(sp)||!dmUnlocked()?`<span title="Bound to the ${esc(bd)} Realm${sp&&spellHome(sp)?' (a Rune spell)':'. Bring it to another realm with Attune on the Casting in box; the DM can set it directly'}">${esc(bd)}</span>`:`<select class="sel" style="padding:0 4px;font-size:.72rem;max-width:120px" title="DM: the realm this spell was learnt in (players rebind with Attune)" onchange="sheetBind(${lv},${i},this.value)">${opts.map(r=>`<option${r.n===bd?' selected':''}>${esc(r.n)}</option>`).join('')}</select>`}${off?' · not here':''}${off&&sp&&!spellHome(sp)&&attuneOf(c,here)&&attuneOf(c,here).pts>0&&opts.some(r=>r.n===here)?` <button class="btn sh-noprint" type="button" style="padding:0 8px;min-height:24px;font-size:.75rem" onclick="sheetRebind(${lv},${i})" title="Attunement: bind this spell to the ${esc(here)} for free">↻ Rebind here</button>`:''}</small>${sp&&spellLock(sp)?((c.dmOk||{})[lc(n)]?` <small style="color:var(--green)" title="The DM approved this spell for ${esc(c.name||'this character')}">✓ DM approved</small>${HC?` <span style="cursor:pointer;color:var(--muted);font-size:.75rem" onclick="sheetApprove(${lv},${i},0)">revoke</span>`:''}`:` <small style="color:var(--red)" title="This spell ${esc(spellLock(sp))}">🔒 needs DM approval</small>${HC?` <button class="btn" type="button" style="padding:1px 8px;font-size:.75rem" onclick="sheetApprove(${lv},${i},1)">Approve (DM)</button>`:''}`):''}${!ok?` <small style="color:var(--red)">needs the ${ORDN(need)} change</small>`:''}${!inSch?` <small style="color:var(--red)">${schM(sp.sc)?'needs more '+esc(sp.sc)+' mastery':'outside your schools ('+esc(sp.sc)+')'}</small>`:''} <span style="cursor:pointer;color:var(--muted)" onclick="sheetSpellRm(${lv},${i})">✕</span></li>`}).join('')}</ul>
      ${(()=>{const cs=s.contracts.filter(x=>x.g&&(x.g.csp||[])[lv]&&lv<=ctSpellMax(x.ct)).map(x=>({n:x.g.csp[lv],god:godKey(x.g)})).filter(x=>!list.some(n=>lc(n)===lc(x.n)));return cs.length?`<ul class="sh-ul">${cs.map(x=>{const sp=SP.find(y=>lc(y.n)===lc(x.n));return `<li>${sp?refChip(sp,esc(x.n)):esc(x.n)} <span class="b gold" title="Granted by the contract; it needs no school">contract: ${esc(x.god)}</span></li>`}).join('')}</ul>`:''})()}
      ${(()=>{const got=raceSpellsGot(c).filter(x=>{const sp=spByName(x.n);return sp&&sp.lv===lv&&!list.some(n=>lc(n)===lc(x.n))});return got.length?`<ul class="sh-ul">${got.map(x=>`<li>${refChip(spByName(x.n),esc(x.n))} <span class="b blue" title="Innate magic from your people: no school or slot needed${lv?'; once per long rest':''}">${x.from===c.race2&&x.from!==c.race?'heritage':'people'}: ${esc(x.from||c.race)}</span>${lv?' <small style="color:var(--muted)">once per long rest, no slot</small>':''}${x.note&&x.note!=='your choice'?` <small style="color:var(--muted)">${esc(x.note)}</small>`:''}</li>`).join('')}</ul>`:''})()}
      <div class="keyrow"><input class="sel" list="dl-sp${lv}" id="sp-add-${lv}" placeholder="Add a ${lv?ORDN(lv)+'-level spell':'cantrip'}…" style="max-width:none;flex:1"><button class="btn" type="button" onclick="sheetSpellAdd(${lv})">Add</button></div>
      <datalist id="dl-sp${lv}">${SP.filter(x=>x.lv===lv&&(sch.length?canTake(x):(!c.cls||!(x.cls||[]).length||(x.cls||[]).includes(c.cls)||(c.cls2&&(x.cls||[]).includes(c.cls2))))).slice(0,600).map(x=>`<option value="${esc(x.n)}">${esc(x.sc)}${spellNeed(x)>1?' · '+esc(spellRealm(x)):''}</option>`).join('')}</datalist></div>`};
  const spells=`<div class="sh-trio" style="grid-template-columns:2fr 1fr 1fr 1fr;margin-bottom:12px">${box('Spellcasting class',`<div class="sh-big" style="font-size:1.2rem">${esc([c.cls,c.cls2&&L2?c.cls2:''].filter(x=>x&&CAST_ABIL[x]).join(' / ')||c.cls||'—')}</div>`)}${box('Spellcasting ability',`<div class="sh-big">${ca?ca.toUpperCase():'—'}</div>`)}${box('Spell save DC',`<div class="sh-big">${ca?8+pb+sm+FO.acc+(CA?CA.dc:0):'—'}</div>${FO.vir?`<small title="${esc(FO.n)}: its ${esc(FO.virN)} material adds to ${esc((CLASS_FOCUS[FO.virN]||{}).t||'its')} spell Accuracy and save DCs">incl. ${esc(FO.virN)} +${FO.vir}</small>`:''}`)}${box('Spell accuracy',`<div class="sh-big">${ca?sgn(pb+sm+FO.acc+(CA?CA.acc:0)):'—'}</div>`)}</div>
    ${CA?`<div class="callout sh-armcast" style="border-color:var(--red);margin-bottom:12px"><b>Casting in armor.</b> ${esc(c.cls)}${c.cls2&&+c.lv2>0?' / '+esc(c.cls2):''} ${CA.train?'is trained for '+CA.trainN:'has no armor training'}, but ${CA.heavy>CA.train?'you wear '+CA.wornN+' armor':''}${CA.heavy>CA.train&&CA.shield?' and ':''}${CA.shield?'you carry a shield without shield training':''}: ${CA.steps} step${CA.steps>1?'s':''} over. Spell Accuracy and save DC ${CA.acc} (included above), and each spell <b>fails on a d20 roll of ${CA.fail} or lower</b> (the slot is spent). Take it off to cast freely.</div>`:''}
    ${raceSpellsHTML(c)}
    ${!SP.length?'<div class="note">Spells are still loading…</div>':''}
    ${CAST_ABIL[c.cls]?(()=>{const here=c.here||'Human',all=Object.values(c.spells||{}).flat(),ok=all.filter(n=>{const sp=SP.find(x=>lc(x.n)===lc(n));return (((c.spBound||{})[lc(n)])||(sp&&spellHome(sp))||'Human')===here}).length;return `<div class="sh-box" style="margin-bottom:12px"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:center"><b>Casting in</b><select class="sel" onchange="sheetHere(this.value)" style="max-width:200px">${REALMS.map(r=>`<option${r.n===here?' selected':''}>${esc(r.n)}</option>`).join('')}</select><span class="note" style="margin:0">${ok} of ${all.length} known spells work here · dice ×${spellPow(c,here)}</span></div>
      <div class="sh-row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><b>Focus</b><span class="note" style="margin:0">${FO.n?`<b>${esc(FO.n)}</b>: ${FO.acc?`+${FO.acc} spell Accuracy and save DC`:'no Accuracy bonus'}${FO.dmg?`, +${FO.dmg} to each spell's damage or healing`:''}${FO.buff?` · <b>${esc(FO.kind)}</b>: ${esc(focusBuffText(FO.kind))}`:''}`:'None equipped. Equip a focus (a Wand, Orb, Staff, Amulet, Rod, Tome, Holy Symbol, or a bard\'s instrument) to add to your spell Accuracy, save DC, and spell damage.'}</span></div>
      ${(()=>{const off=all.length-ok,A=attuneOf(c,here);return A?`<div class="sh-row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><b>Attuned</b><span class="note" style="margin:0">to the ${esc(here)} · <b>${A.pts}</b> free rebind${A.pts===1?'':'s'} left (one more after each long rest here, up to ${2*profBonus(+c.level||1)})${off&&A.pts?' · use ↻ Rebind here on a spell below':''}</span></div>`:off?`<div class="sh-row sh-noprint" style="gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn" type="button" onclick="sheetAttune()" title="After a week in this realm, or a ritual at a temple or Magic Tower here">✦ Attune to the ${esc(here)}</button><span class="note" style="margin:0">After a week here, or a ritual at a temple or Magic Tower: rebind ${profBonus(+c.level||1)} spells you know to this realm for free, then one more after each long rest.</span></div>`:''})()}
      <div class="sh-lab">Magic is bound to its realm: a spell works only in the realm where it was learnt · dice grow with the realm or your level, whichever is higher</div></div>`})():''}
    ${schoolBox}
    ${CAST_ABIL[c.cls]||(c.towerCards||[]).length?`<div class="sh-box sh-noprint" style="margin-bottom:12px"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:baseline"><b>🎴 Tower Cards</b><span class="note" style="margin:0">Buy more spells at a Magic Tower. A card teleports you there once per long rest, for one hour, then back to where you used it.</span></div>
      ${(c.towerCards||[]).length?`<div class="chips" style="margin-top:6px">${c.towerCards.map((x,i)=>`<span class="chip${x.used?'':' on'}">${esc((MAGIC_TOWERS[x.t]||[x.t])[0])} <small>${esc(x.t)}</small> ${x.used?'<small>used: recharges on a long rest</small>':`<button class="btn" type="button" style="padding:0 8px;min-height:26px" onclick="towerCardUse(${i})">Teleport</button>`} <span style="cursor:pointer;color:var(--muted)" onclick="towerCardRm(${i})" title="Give up">✕</span></span>`).join('')}</div>`:'<p class="note" style="margin:6px 0 0">No cards yet. Find a tower in its realm (or ride on a friend\'s card), then pay one spell slot there for your own.</p>'}
      ${(()=>{const left=Object.keys(MAGIC_TOWERS).filter(k=>!(c.towerCards||[]).some(x=>x.t===k));return left.length?`<div class="keyrow" style="margin-top:8px"><select class="sel" id="sh-tc" style="max-width:none;flex:1"><option value="">Add a card the DM gave you…</option>${left.map(k=>`<option value="${esc(k)}">${esc(MAGIC_TOWERS[k][0])} (${esc(k)})</option>`).join('')}</select><button class="btn" type="button" onclick="towerCardGive('${c.id}',$('sh-tc').value,1)">Add</button></div>`:''})()}
      <div class="note" style="margin:6px 0 0"><a href="${pageUrl('magic')}" data-go="magic">Open the Magic Towers</a> to buy spells or take a tower's card.</div></div>`:''}
    <div class="sh-spells">${[0,1,2,3,4,5,6,7,8,9].map(spellLv).join('')}</div>
    <div class="note">Spells from a deeper realm than this character's stage are marked; slots come from the vault's Spell Slots rules${slots&&slots.extra?`, with +${slots.extra} from class changes`:''}${slots&&slots.pen?`, minus ${slots.pen} for extra schools`:''}.</div>`;
  $('content').innerHTML=`<div class="page sheet">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Character sheet</h3><p>The classic 5e sheet, adjusted for FAND: fill it in like paper, and bonuses, AC, slots, and attacks are worked out with FAND's rules. FAND's own boxes are on the FAND page.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px" class="sh-noprint"><select class="sel" id="sh-who" aria-label="Character">${(()=>{const o=x=>`<option value="${x.id}"${x.id===c.id?' selected':''}>${esc(x.name||'Unnamed')}${x.cls?' · '+esc(x.cls)+' '+(x.level||1):''}</option>`,L=campList();if(!L.length)return PARTY.map(o).join('');const g=(t,l)=>l.length?`<optgroup label="${esc(t)}">${l.map(o).join('')}</optgroup>`:'';return L.map(k=>g(k.name,PARTY.filter(x=>x.camp===k.id))).join('')+g('Not shared',PARTY.filter(x=>!x.camp||!L.some(k=>k.id===x.camp)))})()}</select><button class="btn primary" type="button" onclick="charWizard()" title="A step-by-step guide that fills in the whole sheet for you">✨ Build a character for me</button><button class="btn" id="sh-new">+ Blank character</button>
      <span class="chips sh-tabbar" style="margin-left:auto">${[['core','Page 1'],['details','Page 2: Details'],['spells','Page 3: Spells'],['gear','Equipment & Materials'],['fand','FAND']].map(([k,l])=>`<button class="chip${SHEET_TAB===k?' on':''}" data-shtab="${k}" style="${SHEET_TAB===k?'border-color:var(--gold);background:var(--goldbg)':''}">${l}</button>`).join('')}<button class="chip" id="sh-qnote" title="Jot down a name, a clue or a promise without leaving the sheet">📝 Quick note</button><details class="more-menu"><summary class="btn" aria-label="More: share, print, delete">⋯ More</summary><div class="more-pop" role="menu"><button class="btn" id="sh-share" type="button" title="Send this character to another phone or computer: a link or a QR code that carries the whole sheet">📱 Share this character</button><button class="btn" id="sh-print" type="button">🖨 Print all pages</button><button class="btn" type="button" onclick="sheetPDF()" title="A clean one-page summary: stats, gear and its powers, curses, inventory and coin. Choose Save as PDF when it prints">📄 Export as PDF</button><button class="btn" id="sh-blank" type="button" title="An empty FAND character sheet to fill in by hand">🖨 Print a blank sheet</button><a class="btn" href="${pageUrl('hidden')}" title="The hidden classes: unlocked through quests and the Towers">🗝 Hidden classes</a><button class="btn" type="button" onclick="sheetDelete()" title="Delete this character" style="color:var(--red)">🗑 Delete this character</button></div></details></span></div>
    ${shPlayCard(c,s,pb,M,speedPen)}${!PARTY.some(x=>x.cls)?`<div class="cw-next sh-noprint"><b>New to this?</b> Press <b>✨ Build a character for me</b>: answer five simple questions (no rulebook needed) and the whole sheet is filled in for you.</div>`:''}${campCharHTML(c)}${cwNextHTML(c)}
    ${head}
    <div class="sh-page" data-pg="core" ${SHEET_TAB!=='core'?'hidden':''}>${core}</div>
    <div class="sh-page" data-pg="details" ${SHEET_TAB!=='details'?'hidden':''}>${details}</div>
    <div class="sh-page" data-pg="spells" ${SHEET_TAB!=='spells'?'hidden':''}>${spells}</div>
    <div class="sh-page" data-pg="gear" ${SHEET_TAB!=='gear'?'hidden':''}>${gearPg}</div>
    <div class="sh-page" data-pg="fand" ${SHEET_TAB!=='fand'?'hidden':''}>${fand}</div></div>`;
  const C=$('content');
  // every box gets a name screen readers can say: from its placeholder, the label under it, or its field
  const SH_NAME={cls:'Class',level:'Level',insp:'Inspiration',hpMax:'Hit point maximum',hp:'Current hit points',tempHp:'Temporary hit points',traits:'Personality traits',ideals:'Ideals',bonds:'Bonds',flaws:'Flaws'};
  C.querySelectorAll('[data-s]').forEach(el=>{if(el.getAttribute('aria-label')||(el.placeholder||'').trim()||(el.title||'').trim())return;const k=el.dataset.s,d=/^ds\.([sf])(\d)$/.exec(k);
    const lab=SH_NAME[k]||(d?`Death save ${d[1]==='s'?'success':'failure'} ${+d[2]+1}`:k.split('.').pop().replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,x=>x.toUpperCase()));el.setAttribute('aria-label',lab)});
  C.querySelectorAll('[data-s]').forEach(el=>el.addEventListener('change',()=>{const v=el.dataset.chk?el.checked:el.type==='number'?(el.value===''?'':+el.value):el.value;setP(c,el.dataset.s,v);if(el.dataset.s==='hpMax'&&(c.hp===''||c.hp==null)&&+v>0)c.hp=+v;if(el.dataset.s==='cls'){c.savesSet=false;c.sub=''}if(el.dataset.s==='prof'||el.dataset.s==='prof2'){if(el.dataset.s==='prof2'&&c.prof2&&!c.prof2Lv)c.prof2Lv=1;if(c.prof&&c.prof===c.prof2)c.prof2='';if(!c.prof&&c.prof2){c.prof=c.prof2;c.profLv=c.prof2Lv;c.prof2='';c.prof2Lv=''}specsKeep(c)}saveParty();sheetRedraw()}));
  // passive Perception follows the Perception box as you type (the rest of the sheet redraws when you leave the box)
  {const pin=C.querySelector('input[data-s="skillB.perception"]');if(pin)pin.addEventListener('input',()=>{const v=10+(+pin.value||0)+(s.gb.perception||0);C.querySelectorAll('.sh-pp').forEach(x=>{x.textContent=v})})}
  C.querySelectorAll('[data-shtab]').forEach(b=>b.onclick=()=>{SHEET_TAB=b.dataset.shtab;renderSheet()});
  $('sh-who').onchange=e=>{SHEET_ID=e.target.value;renderSheet()};
  $('sh-new').onclick=()=>{const n={id:uid(),name:'',level:1,gear:[],inv:[],abil:{str:10,dex:10,con:10,int:10,wis:10,cha:10}};PARTY.push(n);saveParty();SHEET_ID=n.id;renderSheet()};
  $('sh-lvl').onclick=()=>{const d=prompt('What did they accomplish to earn this level?','');if(d===null)return;levelUp(c,d.trim()||'Accomplishment');renderSheet()};
  if($('ac-log')){$('ac-log').onclick=()=>{const d=$('ac-deed').value.trim();if(!d)return;c.log=(c.log||[]).concat({d:new Date().toISOString().slice(0,10),deed:d});saveParty();renderSheet()};$('ac-lvl').onclick=()=>{const d=$('ac-deed').value.trim();if(!d)return;levelUp(c,d);renderSheet()}}
  $('sh-share').onclick=shareChar;{const q=$('sh-qnote');if(q)q.onclick=()=>quickNote(c)}
  $('sh-blank').onclick=()=>{SHEET_BLANK=true;sheetChar.blank=null;renderSheet();const C2=$('content');C2.querySelector('.sheet').classList.add('blank');
    C2.querySelectorAll('.sh-page').forEach(x=>x.hidden=false);
    {const fp=C2.querySelector('.sh-page[data-pg="fand"]');if(fp)fp.innerHTML=blankFandHTML()}
    C2.querySelectorAll('input:not([type=checkbox]),textarea').forEach(x=>{x.value='';x.placeholder=''});C2.querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=false);
    C2.querySelectorAll('select').forEach(x=>{const o=document.createElement('option');o.value='';o.textContent='';x.prepend(o);x.value=''});
    C2.querySelectorAll('.sh-mod,.sh-big,.sh-pill:not(.sh-keep),.bar').forEach(x=>{if(!x.closest('.sh-spells')||x.classList.contains('sh-mod'))x.textContent=''});
    // any number the sheet worked out (+0 saves and skills, armor 0, counts) goes too, leaving lines to write on
    C2.querySelectorAll('.sheet *').forEach(x=>{if(!x.children.length&&!x.closest('.sh-spells .sh-pill')&&/^([+\-−]?\d+|armor \d+)$/.test(x.textContent.trim()))x.textContent=''});
    C2.querySelectorAll('.sh-fand .sh-row>span').forEach(x=>{const b=x.querySelector('b');if(!b)return;x.textContent='';x.append(b,' ______________')});
    C2.querySelectorAll('.sh-spells .sh-box .sh-row>span').forEach(x=>{if(/Slots/.test(x.textContent))x.textContent='Slots ____ · used ____ · write each spell\'s realm beside it'});
    const sp=C2.querySelector('.sh-spells');if(sp&&!C2.querySelector('.blank-realm')){const d=document.createElement('div');d.className='blank-realm';d.style.cssText='margin:0 0 10px;font-weight:600';d.textContent='Casting in (realm): ______________________   Magic works only in the realm where each spell was learnt.';sp.before(d)}
    window.print();setTimeout(()=>{SHEET_BLANK=false;renderSheet()},400)};
  $('sh-print').onclick=()=>{C.querySelectorAll('.sh-page').forEach(x=>x.hidden=false);window.print();setTimeout(renderSheet,300)};
}
// Levelling by accomplishment (campaign rule): characters level up when they do something big, at the DM's pace; no XP.
const DEEDS=['Conquered a Tower boss floor','Completed a task for their god','Rose a rank in a god contract','Passed a class change trial','Slew a named monster or a boss','Unlocked a hidden class','Crafted a Rare or better item','Survived a week in a deeper realm','Claimed or broke a contract at great cost','Saved a settlement or a temple','Found a progenitor\'s remains','Ended a feud between gods\' contractors'];
// Carrying (campaign rule): a character holds 20 items, not counting what they have equipped. Identical items stack 10
// to a slot. Worn storage (a backpack, a satchel) adds room; a Bag of Holding adds 20, and 10 more for each further
// Fragment of Space bound into it. A Bag of Void unmakes what goes in; a Bag of Devotion gives it to its god.
const INV_BASE=20,INV_STACK=10;
const invUsed=c=>(c.inv||[]).reduce((a,[,q])=>a+Math.ceil((+q||0)/INV_STACK),0);
const gearBPs=c=>(c.gear||[]).map(findBP).filter(Boolean);
const invCap=c=>INV_BASE+gearBPs(c).filter(b=>b.cap&&b.carry).reduce((a,b)=>a+b.cap+(b.grow?b.grow*(+c.spaceFrags||0):0),0);
// force: what a player adds by hand always goes in (the bag can go over its limit, and the sheet says so); loot and
// scavenging stop at the limit
function invAdd(c,n,q,quiet,force){c.inv=c.inv||[];const r=c.inv.find(z=>lc(z[0])===lc(n)),have=r?+r[1]||0:0,slots=invCap(c)-invUsed(c)+Math.ceil(have/INV_STACK),add=force?q:Math.max(0,Math.min(q,slots*INV_STACK-have));
  if(add){if(r)r[1]=have+add;else c.inv.push([(findMat(n)||findBP(n)||{}).n||n,add])}
  if(add<q&&!quiet)toast(`${c.name||'Their'} pack is full: ${q-add} × ${n} left behind`);
  if(force&&!quiet&&invUsed(c)>invCap(c))toast(`${c.name||'Their'} bag is over its limit (${invUsed(c)} of ${invCap(c)} slots): equip a pack or bag, or drop something`);return add}
function invMove(id,i,act){const c=PARTY.find(x=>x.id===id);if(!c||!c.inv||!c.inv[i])return;const [n,q]=c.inv[i];
  if(act==='void'){if(!confirm(`Drop ${q} × ${n} into the Bag of Void? It is gone for good.`))return;c.inv.splice(i,1);toast(n+' is unmade')}
  else if(act==='offer'){const g=c.devGod;if(!g){toast('Choose the god the Bag of Devotion serves first');return}if(!confirm(`Offer ${q} × ${n} to ${g}?`))return;c.inv.splice(i,1);c.offered=(c.offered||[]).concat({n,q:+q||0,god:g,d:new Date().toISOString().slice(0,10)}).slice(-50);toast(`${n} given to ${g}`)}
  else if(act==='space'){if(!/^Fragment of Space$/i.test(n))return;c.spaceFrags=(+c.spaceFrags||0)+1;c.inv[i][1]=(+q||0)-1;if(c.inv[i][1]<=0)c.inv.splice(i,1);toast('The Bag of Holding grows by 10')}
  saveParty();typeof renderSheet==='function'&&TAB==='sheet'?renderSheet():renderParty()}
function invRowBtns(c,n,i){const G=gearBPs(c),out=[`<button class="chip" type="button" title="Equip one (${esc(wornOn(gearItem(n)||n))})" onclick="event.stopPropagation();invEquip('${c.id}',${i})">⇧ Equip</button>`];if(G.some(b=>b.voidbag)&&!/^Fragment of /.test(n))out.push(`<button class="chip" type="button" title="Drop it into the Bag of Void" onclick="event.stopPropagation();invMove('${c.id}',${i},'void')">🕳 Void</button>`);
  if(G.some(b=>b.devotion))out.push(`<button class="chip" type="button" title="Give it to ${esc(c.devGod||'the bag\'s god')}" onclick="event.stopPropagation();invMove('${c.id}',${i},'offer')">🙏 Offer</button>`);
  if(G.some(b=>b.grow)&&/^Fragment of Space$/i.test(n))out.push(`<button class="chip" type="button" onclick="event.stopPropagation();invMove('${c.id}',${i},'space')">Bind into the Bag of Holding</button>`);return out.join('')}
function invHead(c){const u=invUsed(c),cap=invCap(c),G=gearBPs(c),boh=G.find(b=>b.grow),dev=G.find(b=>b.devotion),full=u>cap;
  return `<div class="note" style="margin:0 0 6px;${full?'color:var(--red)':''}">Carrying <b>${u} of ${cap}</b> item slots${full?' (over the limit: drop or store something)':''}. Equipped items don't count; identical items stack ${INV_STACK} to a slot.${G.filter(b=>b.cap&&b.carry).length?' Room from '+G.filter(b=>b.cap&&b.carry).map(b=>esc(b.n)+' +'+(b.cap+(b.grow?b.grow*(+c.spaceFrags||0):0))).join(', ')+'.':' Equip a pouch, pack, or bag for more room.'}${boh?` The Bag of Holding has ${+c.spaceFrags||0} extra Fragment${(+c.spaceFrags||0)===1?'':'s'} of Space bound in.`:''}</div>${dev?`<label class="note" style="display:flex;gap:6px;align-items:center;margin:0 0 6px">Bag of Devotion serves <select class="sel" onchange="(c=>{c.devGod=this.value;saveParty()})(PARTY.find(x=>x.id==='${c.id}'))"><option value="">Choose a god…</option>${GODS.map(g=>`<option${godKey(g)===c.devGod?' selected':''}>${esc(godKey(g))}</option>`).join('')}</select></label>${(c.offered||[]).length?`<div class="note" style="margin:0 0 6px">Offered: ${(c.offered||[]).slice(-5).reverse().map(o=>`${o.q} × ${esc(o.n)} to ${esc(o.god)}`).join('; ')}</div>`:''}`:''}`}
// Level up (campaign rules): the window shows everything the new level brings. Hit points (roll or take the average),
// a subclass when one opens (level 3), a new stage and its class change trial, the school point every level, and new
// spells: a full caster learns 2 spells a level and a half caster 1, from the schools they hold, up to the level they can cast.
const LV_SPELLS=k=>({full:2,pact:2,half:1,arti:1})[CASTER[k]]||0;
let LVL=null;
function levelUp(c,deed){
  const before=+c.level||1;if(before>=MAX_LEVEL){toast('Already at level '+MAX_LEVEL);return}
  c.level=before+1;c.log=(c.log||[]).concat({d:new Date().toISOString().slice(0,10),deed:deed||'Accomplishment',lv:c.level});saveParty();
  const con=Math.floor(((+(c.abil||{}).con||10)-10)/2),hd=CLASS_DIE[c.cls]||8;
  LVL={id:c.id,from:before,hp:String(Math.max(1,Math.floor(hd/2)+1+con)),sub:'',sch:'',sp:[],q:''};renderLvl()}
const lvlChar=()=>LVL&&PARTY.find(x=>x.id===LVL.id);
function lvlCaster(c){return CAST_ABIL[c.cls]?c.cls:c.cls2&&CAST_ABIL[c.cls2]?c.cls2:''}
function lvlSchools(c){const S=(c.schools||[]).filter(x=>x&&x.n).map(x=>Object.assign({},x)),v=LVL.sch||'';if(v.startsWith('up:')){const x=S[+v.slice(3)];if(x)x.m++}else if(v.startsWith('new:'))S.push({n:v.slice(4),m:1});return S}
function lvlPool(c){const cc=lvlCaster(c);if(!cc||!SP.length)return [];const L=+c.level||1,L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,slots=mcSlots(c,L-L2,L2),S=lvlSchools(c),known=new Set(Object.values(c.spells||{}).flat().map(lc));
  return SP.filter(x=>x.lv>=1&&!known.has(lc(x.n))&&S.some(s=>s.n===x.sc&&x.lv<=schoolMax(cc,s.m,slots))).sort((a,b)=>b.lv-a.lv||(a.n<b.n?-1:1))}
function lvlSpell(n){const c=lvlChar(),max=LV_SPELLS(lvlCaster(c)),i=LVL.sp.indexOf(n);if(i>=0)LVL.sp.splice(i,1);else{if(LVL.sp.length>=max){toast(`You learn ${max} spell${max>1?'s':''} this level; remove one first`);return}LVL.sp.push(n)}renderLvl()}
function renderLvl(){let host=document.getElementById('lvlHost');if(!host){host=document.createElement('div');host.id='lvlHost';document.body.appendChild(host)}
  const c=lvlChar();if(!c){host.innerHTML='';return}const L=+c.level,cc=lvlCaster(c),nSp=LV_SPELLS(cc),k0=stageOf(LVL.from),k1=stageOf(L),st=k1>k0&&c.cls&&STAGES[c.cls]&&STAGES[c.cls].find(x=>x.stage===k1);
  const subs=L>=3&&!c.sub&&c.cls?SUBS.filter(x=>x.par===c.cls):[],own=(c.schools||[]).filter(x=>x&&x.n),pts=L-own.reduce((a,x)=>a+x.m,0),pool=cc?lvlPool(c):[],q=lc(LVL.q||''),shown=pool.filter(x=>!q||lc(x.n+' '+x.sc).includes(q)).slice(0,90),y=(document.querySelector('#lvlHost .scav-win')||{}).scrollTop||0;
  const sec=(t,b)=>`<div class="blk" style="margin-top:14px"><h4>${t}</h4>${b}</div>`;
  host.innerHTML=`<div class="scav-pop" role="dialog" aria-modal="true" aria-label="Level up"><div class="scav-win"><div class="panel" style="border-color:var(--gold)">
    <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-size:1.3rem">⬆ ${esc(c.name||'Character')} reaches level ${L}</h4><span class="note" style="margin:0">${esc(c.cls||'')}${c.sub?' · '+esc(c.sub):''}</span></div>
    ${sec('Hit points',`<label class="note" style="display:flex;gap:8px;align-items:center;margin:0">Gained this level <input class="sel" type="number" min="1" style="width:90px" value="${esc(LVL.hp)}" oninput="LVL.hp=this.value"> <small>roll 1d${CLASS_DIE[c.cls]||8} + CON, or take the average (filled in)</small></label>`)}
    ${(()=>{const I=lvlItems(c);LVL.items=I;const ck=LVL.chk||(LVL.chk={}),A=LVL.asi||(LVL.asi={mode:'2',a:'',b:''}),opt=v=>ABIL.map(([a,n])=>`<option value="${a}"${v===a?' selected':''}>${n} (${(c.abil||{})[a]||10})</option>`).join('');
      return sec(`Your level ${L} checklist <em>${I.filter(x=>ck[x.id]).length} of ${I.length} done</em>`,I.length?`<div style="display:flex;flex-direction:column;gap:8px">${I.map(x=>`<label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer"><input type="checkbox" ${ck[x.id]?'checked':''} onchange="LVL.chk[${esc(JSON.stringify(x.id))}]=this.checked;renderLvl()" style="margin-top:3px"><span><b>${esc(x.t)}</b> <small style="color:var(--text2)">${esc(x.d)}</small>
        ${x.asi?`<span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px" onclick="event.preventDefault()"><select class="sel" onchange="LVL.asi.mode=this.value;renderLvl()"><option value="2"${A.mode==='2'?' selected':''}>+2 to one</option><option value="11"${A.mode==='11'?' selected':''}>+1 to two</option></select><select class="sel" onchange="LVL.asi.a=this.value;LVL.chk.asi=!!(this.value&&(LVL.asi.mode==='2'||LVL.asi.b));renderLvl()"><option value="">Ability…</option>${opt(A.a)}</select>${A.mode==='11'?`<select class="sel" onchange="LVL.asi.b=this.value;LVL.chk.asi=!!(this.value&&LVL.asi.a);renderLvl()"><option value="">Second ability…</option>${opt(A.b)}</select>`:''}</span>`:''}
        ${x.style?`<span style="display:block;margin-top:4px" onclick="event.preventDefault()"><select class="sel" style="max-width:420px" onchange="LVL.style=this.value;LVL.chk.style=!!this.value;renderLvl()"><option value="">Choose a Fighting Style…</option>${FIGHT_STYLES.map(([n,d])=>`<option value="${esc(n)}"${LVL.style===n?' selected':''}>${esc(n)}: ${esc(d)}</option>`).join('')}</select></span>`:''}</span></label>`).join('')}</div><p class="note" style="margin:8px 0 0">Anything you leave unticked stays on the character sheet's checklist until you tick it there.</p>`:'<p class="note" style="margin:0">No new class features at this level.</p>')})()}
    ${st?sec('A new stage',`<div class="callout" style="border-color:var(--gold)"><b>${esc(c.cls)} becomes ${esc(stageName(c.cls,k1))}.</b> ${st.trial?'Trial: '+esc(st.trial):''}</div>`):''}
    ${subs.length?sec('Choose a subclass',`<select class="sel" style="max-width:420px" onchange="LVL.sub=this.value"><option value="">Choose later…</option>${subs.map(x=>`<option${x.n===LVL.sub?' selected':''}>${esc(x.n)}</option>`).join('')}</select> <small class="note">Your ${esc(c.cls)} subclass opens at level 3.</small>`):''}
    ${cc&&SP.length?sec(`School of magic${pts>0?` <em>${pts} point${pts>1?'s':''} to spend</em>`:''}`,pts>0?`<select class="sel" style="max-width:420px" onchange="LVL.sch=this.value;LVL.sp=[];renderLvl()"><option value="">Spend it later on the sheet</option>${own.map((x,i)=>`<option value="up:${i}"${LVL.sch==='up:'+i?' selected':''}>Progress ${esc(x.n)} (mastery ${x.m} → ${x.m+1})</option>`).join('')}${allSchools().filter(([n])=>!own.some(x=>x.n===n)&&schoolOk(c,n,own)).map(([n,k])=>`<option value="new:${esc(n)}"${LVL.sch==='new:'+n?' selected':''}>Open ${esc(n)} (${k} spells)</option>`).join('')}</select> <small class="note">One school point a level: raise a school's mastery to reach higher spells, or open a new one. ${esc(c.cls)} schools: ${esc(classSchoolText(c.cls))}${c.cls2&&CASTER[c.cls2]?'; '+esc(c.cls2)+': '+esc(classSchoolText(c.cls2)):''}.</small>`:'<p class="note" style="margin:0">No school point left to spend.</p>'):''}
    ${cc&&nSp?sec(`Learn ${nSp} new spell${nSp>1?'s':''} <em>${CASTER[cc]==='half'||CASTER[cc]==='arti'?'half caster: 1 a level':'full caster: 2 a level'} · ${LVL.sp.length} of ${nSp} chosen</em>`,!SP.length?'<p class="note">Spells are still loading…</p>':!pool.length?'<p class="note" style="margin:0">No new spells are open yet: choose or progress a school above.</p>':`${LVL.sp.length?`<div class="chips" style="margin-bottom:6px">${LVL.sp.map(n=>`<button class="chip on" type="button" onclick="lvlSpell(${esc(JSON.stringify(n))})">✓ ${esc(n)} ✕</button>`).join('')}</div>`:''}<input class="sel" id="lvl-q" type="search" placeholder="Search ${pool.length} spells you can learn" value="${esc(LVL.q||'')}" oninput="LVL.q=this.value;renderLvl();const e=$('lvl-q');e.focus();e.setSelectionRange(e.value.length,e.value.length)" style="max-width:none;width:100%;margin-bottom:6px"><div class="mlist" style="max-height:340px;overflow-y:auto">${shown.map(x=>`<button type="button" onclick="lvlSpell(${esc(JSON.stringify(x.n))})" style="flex-wrap:wrap;${LVL.sp.includes(x.n)?'background:var(--goldbg)':''}">${LVL.sp.includes(x.n)?'✓ ':''}<b>${esc(x.n)}</b><span class="x">${esc(x.sc)}</span><span class="r">${ORDN(x.lv)} level</span><span style="flex-basis:100%;font-size:.78rem;color:var(--muted);white-space:normal">${esc([x.ct,x.rng,x.dur,x.dmg&&x.dmg!=='None'?x.dmg:''].filter(Boolean).join(' · '))} <span class="sp-info" role="button" tabindex="0" title="What it does" onclick="event.stopPropagation();openItem(deref('${ref(x)}'))">ⓘ What it does</span></span></button>`).join('')}</div>`):''}
    ${!cc&&!subs.length&&!st?'<p class="note" style="margin-top:12px">Nothing else to choose this level. Check Steady Growth on the FAND page of the sheet.</p>':''}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap"><button class="btn" type="button" onclick="lvlSkip()" title="Takes the hit points shown; choose the subclass, school point, and spells later on the sheet">Skip the choices</button><button class="btn primary" type="button" onclick="lvlApply()">✓ Done</button></div>
  </div></div></div>`;const w=host.querySelector('.scav-win');if(w)w.scrollTop=y}
// ════════════════════════════════════════════════════════════════
//  Class features in play: Fighting Style, Ability Score Improvements, class resources, and the level-up checklist
// ════════════════════════════════════════════════════════════════
const FIGHT_STYLES=[['Archery','+2 Accuracy with ranged weapons.'],['Defense','+1 AC while you wear body armor.'],['Dueling','+2 damage with a one-handed melee weapon when you hold no other weapon.'],['Great Weapon Fighting','Reroll 1s and 2s on the damage dice of two-handed melee weapons.'],['Protection','With a shield, use your reaction to give disadvantage to an attack on a creature within 5 feet of you.'],['Two-Weapon Fighting','Add your ability modifier to the damage of your off-hand attack.']];
const STYLE_AT={Fighter:1,Paladin:2,Ranger:2};
const ASI_AT=k=>k==='Fighter'?[4,6,8,12,14,16,19]:k==='Rogue'?[4,8,10,12,16,19]:[4,8,12,16,19];
const classProg=(k,L)=>((typeof CLASS_PROG!=='undefined'&&CLASS_PROG[k])||[]).filter(f=>f[0]===L);
// resources a class spends and gets back on a rest: [id, name, uses, 'short'|'long', pool?] (a pool counts points, not uses)
function classRes(c){const L=+c.level||1,k=c.cls,m=a=>Math.floor(((+(c.abil||{})[a]||10)-10)/2),out=[],add=(id,n,uses,rest,pool)=>{if(uses>0)out.push({id,n,uses,rest,pool:!!pool})};
  if(k==='Barbarian')add('rage','Rage',L>=20?99:[0,2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6][L],'long');
  if(k==='Fighter'){add('sw','Second Wind',1,'short');if(L>=2)add('as','Action Surge',L>=17?2:1,'short');if(L>=9)add('ind','Indomitable',L>=17?3:L>=13?2:1,'long')}
  if(k==='Monk'&&L>=2)add('ki','Ki points',L,'short',1);
  if(k==='Paladin'){add('loh','Lay on Hands',5*L,'long',1);add('dsense','Divine Sense',1+Math.max(0,m('cha')),'long');if(L>=3)add('cdp','Channel Divinity',1,'short')}
  if(k==='Bard')add('bi','Bardic Inspiration',Math.max(1,m('cha')),L>=5?'short':'long');
  if(k==='Cleric'&&L>=2)add('cd','Channel Divinity',L>=18?3:L>=6?2:1,'short');
  if(k==='Druid'&&L>=2)add('ws','Wild Shape',2,'short');
  if(k==='Sorcerer'&&L>=2)add('sorc','Sorcery points',L,'long',1);
  if(k==='Wizard')add('ar','Arcane Recovery',1,'long');
  if(k==='Artificer'&&L>=7)add('fog','Flash of Genius',Math.max(1,m('int')),'long');
  return out}
function resHTML(c){const R=classRes(c);if(!R.length)return '';const u=c.resUsed||{};
  return `<div class="sh-box sh-noprint" style="margin-bottom:12px"><div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:baseline"><b>⚡ Class resources</b><span class="note" style="margin:0">Tick a use as you spend it. Short and long rests refill them.</span></div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${R.map(r=>{const used=Math.min(+u[r.id]||0,r.uses);return `<div class="sh-row" style="gap:8px;flex-wrap:wrap;align-items:center"><b style="min-width:150px">${esc(r.n)}</b>${r.uses>=99?'<span class="note" style="margin:0">unlimited</span>':r.pool||r.uses>10?`<input class="sel" type="number" min="0" max="${r.uses}" value="${r.uses-used}" style="width:80px" onchange="resSet('${r.id}',${r.uses}-(+this.value||0),${r.uses})"> <small>of ${r.uses} left</small>`:`<span class="chips" style="margin:0">${Array.from({length:r.uses},(_,i)=>`<button type="button" class="chip${i<used?'':' on'}" style="min-width:30px" title="${i<used?'Used: tap to give back':'Tap to spend'}" onclick="resSet('${r.id}',${i<used?i:i+1},${r.uses})">${i<used?'○':'●'}</button>`).join('')}</span>`} <small style="color:var(--muted)">${r.rest==='short'?'short or long rest':'long rest'}</small></div>`}).join('')}</div></div>`}
// everything a level brings, as a checklist: class and subclass features, an Ability Score Improvement, a Fighting Style,
// class resources that grew, and the choices below it (subclass, school point, spells)
function lvlItems(c){const L=+c.level||1,k=c.cls,out=[],prev=Object.assign({},c,{level:L-1});
  classProg(k,L).forEach(f=>{if(f[1]==='Subclass'||(f[1]==='Fighting Style'&&STYLE_AT[k]===L))return;if(/^Ability Score Improvement/i.test(f[1]))return;out.push({id:'f:'+f[1],t:`${k}: ${f[1]}`,d:f[2]})});
  const sx=c.sub&&SUBS.find(x=>x.n===c.sub);(sx&&sx.lv||[]).filter(f=>f[0]===L).forEach(f=>out.push({id:'s:'+f[1],t:`${c.sub}: ${f[1]}`,d:f[2]}));
  if(ASI_AT(k).includes(L))out.push({id:'asi',t:'Ability Score Improvement',d:'+2 to one ability score, or +1 to two. Choose it here.',asi:1});
  if(STYLE_AT[k]===L&&!c.style)out.push({id:'style',t:'Fighting Style',d:'Choose how you fight best.',style:1});
  const was=Object.fromEntries(classRes(prev).map(r=>[r.id,r.uses]));classRes(c).forEach(r=>{if(r.uses!==was[r.id])out.push({id:'r:'+r.id,t:`${r.n}: ${r.uses>=99?'unlimited':r.uses+(r.pool?' points':r.uses>1?' uses':' use')}`,d:was[r.id]?`Up from ${was[r.id]}. Tracked under Class resources on the sheet.`:'New. Tracked under Class resources on the sheet.'})});
  return out}
function lvTodoDone(i){const c=sheetChar(),[x]=(c.lvTodo||[]).splice(i,1);if(!c.lvTodo.length)delete c.lvTodo;saveParty();renderSheet();if(x)undoToast('Ticked: '+x.t,()=>{c.lvTodo=(c.lvTodo||[]);c.lvTodo.splice(i,0,x);saveParty();renderSheet()})}
function sheetStyle(v,i){if(!v)return;const c=sheetChar();c.style=v;c.lvTodo.splice(i,1);if(!c.lvTodo.length)delete c.lvTodo;saveParty();renderSheet();toast('Fighting Style: '+v)}
function resSet(id,used,max){const c=sheetChar();c.resUsed=c.resUsed||{};c.resUsed[id]=Math.max(0,Math.min(max,used));saveParty();renderSheet()}
// what a rest gives back
function resRest(c,kind){if(!c.resUsed)return;classRes(c).forEach(r=>{if(kind==='long'||r.rest==='short')delete c.resUsed[r.id]})}
function lvlSkip(){if(!LVL)return;LVL.sub='';LVL.sch='';LVL.sp=[];lvlApply()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&LVL&&!$('mbg').classList.contains('open')){lvlSkip();e.stopPropagation()}},true);// Esc keeps the level and its HP, like Skip
// the level's choices, applied to the character (the level-up window and the character generator both use it)
function lvlCommit(c){const hp=+LVL.hp||0;if(hp>0){c.hpMax=(+c.hpMax||0)+hp;if(c.hp!=null&&c.hp!=='')c.hp=(+c.hp||0)+hp}
  if(LVL.sub)c.sub=LVL.sub;if(LVL.sch)c.schools=lvlSchools(c);
  const A=LVL.asi;if(A&&A.a&&(A.mode==='2'||A.b&&A.b!==A.a)){c.abil=Object.assign({},c.abil);if(A.mode==='2')c.abil[A.a]=(+c.abil[A.a]||10)+2;else{c.abil[A.a]=(+c.abil[A.a]||10)+1;c.abil[A.b]=(+c.abil[A.b]||10)+1}}else if(LVL.chk)delete LVL.chk.asi;
  if(LVL.style){c.style=LVL.style}else if(LVL.chk)delete LVL.chk.style;
  const left=(LVL.items||[]).filter(x=>!(LVL.chk||{})[x.id]).map(x=>({lv:+c.level,t:x.t,d:x.d,k:x.asi?'asi':x.style?'style':''}));if(left.length)c.lvTodo=(c.lvTodo||[]).concat(left);
  LVL.sp.forEach(n=>{const x=SP.find(y=>y.n===n);if(!x)return;c.spells=c.spells||{};(c.spells[x.lv]=c.spells[x.lv]||[]).push(n)});
  return [hp>0?'+'+hp+' HP':'',LVL.sub,LVL.sp.length?LVL.sp.length+' new spell'+(LVL.sp.length>1?'s':''):''].filter(Boolean).join(', ')}
function lvlApply(){const c=lvlChar();if(!c)return;const done=lvlCommit(c);saveParty();LVL=null;renderLvl();
  if(TAB==='sheet')renderSheet();else if(TAB==='party')renderParty();toast(`${c.name||'Character'} is level ${c.level}${done?': '+done:''}`)}
function sheetDelete(){const c=sheetChar();if(!c)return;const i=PARTY.indexOf(c);PARTY=PARTY.filter(x=>x.id!==c.id);if(PARTY_SEL===c.id)PARTY_SEL=null;SHEET_ID=PARTY[0]?PARTY[0].id:null;saveParty();if(PARTY.length)renderSheet();undoToast((c.name||'Character')+' deleted',()=>{partyRestore(c,i);SHEET_ID=c.id;if(TAB==='sheet')renderSheet();else go('sheet')});if(!PARTY.length)go('party')}
// Where an item is worn or held (campaign owner's request: every armor piece and item says where it is equipped).
// Armor and shields use their slot; weapons say how many hands; anything else is read from its name and category.
const SLOT_LABEL={Body:'Body (torso)',Head:'Head',Hands:'Hands and forearms',Feet:'Feet and shins',Shoulders:'Shoulders',Back:'Back',Enhancement:'Fitted into another armor piece',Mount:'On a mount',Buckler:'Off hand (strapped to the forearm)',Shield:'Off hand',Tower:'Off hand (set down to brace it)'};
const WORN_WEAPONS=['Sword','Axe','Hammer','Dagger','Spear','Staff','Bow'];
const WORN_WORDS=[[/\b(ring|rings|band|signet)\b|-ring\b/i,'Finger'],[/\b(amulet|necklace|pendant|locket|torc|choker|talisman|medallion|collar)\b/i,'Neck'],
  [/\b(crown|circlet|tiara|diadem|helm|helmet|hood|hat|cap|veil|mask|headband|coif)\b/i,'Head'],[/\b(earring|earrings|ear-cuff)\b/i,'Ear'],[/\b(goggles|monocle|spectacles|eyepatch)\b/i,'Face'],
  [/\b(cloak|mantle|cape|shroud|wings|quiver)\b/i,'Back'],[/\b(backpack|pack|satchel|frame)\b/i,'Back'],[/\b(belt|girdle|sash|pouch|purse|bandolier)\b/i,'Waist (belt)'],
  [/\b(boots|sandals|slippers|shoes|greaves|anklet)\b/i,'Feet and shins'],[/\b(gloves|gauntlets|gauntlet|bracers|bracer|bracelet|bangle|vambraces|armlet|armband|wristband)\b/i,'Hands and forearms'],
  [/\b(robe|robes|vestments|coat|tunic|garb|jerkin|vest|armou?r|mail|plate|brigandine)\b/i,'Body (torso)'],[/\b(saddle|saddlebags|harness|barding|horseshoes?|reins|bridle)\b/i,'On a mount'],
  [/\b(messer|contus|kontos|whip|sword|blade|axe|mace|flail|dagger|knife|club|sickle|cleaver)\b/i,'One hand'],[/\b(lance|pike|polearm|halberd|glaive)\b/i,'Both hands'],
  [/\b(engine|automaton|cannon|ballista|catapult|throne|table|platform|bridge|tower|fortress|machine|chamber|array|network|system|forge|anvil|altar|beacon|trap|cage|chest|strongbox|vault|wagon|cart|boat|ship|drone|golem|sentinel|submarine|colossus|city|kraken|deployer|projector|turret)\b/i,'Not worn: set down or built'],
  [/\b(potion|elixir|draught|tonic|vial|flask|feast|meal|broth|supper|dish|stew|ration|rations|salve|poultice|oil|bomb|grenade|ink|grease|wash|tea|compound|powder|dust|paste|blood)\b|\bx\d+$/i,'Not worn: used from the bag'],
  [/\b(charm|token|stone|crystal|gem|idol|fetish|relic|sigil|glyph|rune|seal|coin|figurine|totem|bone|tooth|feather|shard|jewel|heartstone)\b/i,'Carried (pouch or pocket)'],
  [/\b(orb|wand|rod|scepter|sceptre|tome|book|lantern|lamp|torch|mirror|compass|bell|horn|whistle|key|lens|sextant|gauge|astrolabe|map|chart|atlas|scroll|symbol|focus|crowbar|rasp|comb|pot|leash|timer|log|tables|rule|staff|barometer|predictor|hook|net|rope|chain|tongs|hammer|pick|shovel|saw|needle)\b/i,'One hand when used'],
  [/\b(kit|set|tools|instruments|manacles|caltrops)\b/i,'Carried in the bag']];
// what a ranged weapon shoots (bow, crossbow, sling, blowgun, firearm, ballista), from its template and name
function ammoKind(b){const base=b.design?b.design.base:genOf(b),n=(base||'')+' '+(b.n||'');
  return /blowgun/i.test(n)?'blowgun':/crossbow|arbalest|gastraphetes/i.test(n)?'crossbow':/sling|pellet bow/i.test(n)?'sling':/arquebus|musket|pistol|blunderbuss|hand cannon|fire lance|repeater|flintlock|firearm|\bgun\b/i.test(n)?'firearm':/ballista|scorpion/i.test(n)?'siege':/\bbow\b|bow$|yumi|longbow|shortbow|greatbow/i.test(n)?'bow':''}
// the best ammunition a character carries (equipped or in the bag) for a kind: most extra damage plus AC it ignores
function bestAmmo(c,kind,bag){if(!c||!kind)return null;let best=null;const L=bag?(c.inv||[]).filter(x=>+x[1]>0).map(x=>[x[0],+x[1]]):[...(c.gear||[]).map(n=>[n,0]),...(c.inv||[]).filter(x=>+x[1]>0).map(x=>[x[0],+x[1]])];
  L.forEach(([n,q])=>{const b=findBP(n),A=b&&b.ammo;if(A&&A.fits===kind&&(!best||(+A.dmg||0)+(+A.pierce||0)>(+best.A.dmg||0)+(+best.A.pierce||0)))best={b,A,q}});return best}
// Shoot (owner's request, 2026-11-24): a ranged attack from the sheet spends one shot of the best ammunition in the bag; shots
// are counted, and after the fight half of what was shot comes back (arrows, bolts, needles, bullets: not firearm shot)
function sheetShoot(el){const c=sheetChar(),w=el.dataset.w,b=findBP(w),k=b&&ammoKind(b),am=k&&bestAmmo(c,k,true);if(!am){toast('No ammunition for the '+w+' in the bag');return}
  const r=(c.inv||[]).find(x=>lc(x[0])===lc(am.b.n));if(r){r[1]=(+r[1]||0)-1;if(r[1]<=0)c.inv=c.inv.filter(x=>x!==r)}c.shot=c.shot||{};c.shot[am.b.n]=(c.shot[am.b.n]||0)+1;saveParty();
  rollShow(el.dataset.roll,w+' · '+am.b.n);const left=r?Math.max(0,+r[1]||0):0;if(left<=5)toast(left?`${left} ${am.b.n} left`:`That was the last of the ${am.b.n}`);renderSheet()}
function ammoRecover(c,quiet){const S=c&&c.shot;if(!S)return 0;let back=0;Object.entries(S).forEach(([n,k])=>{const b=findBP(n),A=b&&b.ammo;if(A&&A.fits==='firearm')return;const q=Math.floor(k/2);if(q){invAdd(c,n,q,1,true);back+=q}});
  delete c.shot;if(!quiet)toast(back?`${back} shot${back>1?'s':''} picked up and back in the bag`:'Nothing to pick up');return back}
function sheetRecover(){const c=sheetChar();ammoRecover(c);saveParty();renderSheet()}
function wornOn(b){if(!b)return '';if(typeof b==='string')b={n:b};const n=b.n||'',cat=b.cat||'';
  if(b.slot&&SLOT_LABEL[b.slot])return SLOT_LABEL[b.slot];
  if(cat==='Shield')return SLOT_LABEL.Shield;
  // a Forge design knows its template's properties
  const dp=b.design&&b.design.dmg?b.design.props||'':'';if(dp)return /two-handed/i.test(dp)?'Both hands':/versatile/i.test(dp)?'One or both hands':'One hand';
  if(WORN_WEAPONS.includes(cat)){if(/\b(hand crossbow|sling|dart)\b/i.test(n))return 'One hand';if(cat==='Bow'||cat==='Staff'||/\b(great\w*|maul|halberd|glaive|pike|lance|quarterstaff|scythe|zweihander|claymore)\b/i.test(n))return 'Both hands';if(cat==='Spear'||/\b(warhammer|longsword|battleaxe|bastard)\b/i.test(n))return 'One or both hands';return 'One hand'}
  if(cat==='Ammunition')return 'Quiver or pouch';
  if(cat==='Potion'||cat==='Food')return 'Not worn: used from the bag';
  if(['Crop','Fertilizer','Livestock','Structure','Fortification','Siege Engine','Vehicle'].includes(cat))return 'Not worn';
  if(cat==='Trap')return 'Not worn: set down where it is used';if(cat==='Glyph')return 'Not worn: inscribed where it is used';if(cat==='Explosive')return 'Thrown or set from the bag';if(cat==='Beast Gear')return 'On a mount or beast';
  if(cat==='Storage'&&/\b(chest|vault|strongbox|box|trunk)\b/i.test(n))return 'Not worn: set down';
  for(const [re,w] of WORN_WORDS)if(re.test(n))return w;
  if(cat==='Armor')return SLOT_LABEL.Body;
  if(cat==='Tool'||cat==='Focus')return 'One hand when used';
  if(cat==='Instrument'||cat==='Map'||cat==='Book')return 'Held when used';
  if(cat==='Storage')return 'Back or belt';
  if(cat==='Jewelry'||cat==='Talisman')return 'Worn';if(cat==='Poison'||cat==='Oil & Coating')return 'Not worn: used from the bag';if(cat==='Navigation')return 'Held when used';if(cat==='Light Source')return 'One hand when used';if(cat==='Restraint')return 'Carried in the bag';if(cat==='Clothing')return 'Worn over armor';if(cat==='Mechanism')return 'Carried, or set up where it works';
  return b.cat?'Carried or held':'Where you choose'}
// equipped items that crowd the same place: one per armor slot, and two hands' worth of things held
function wornClashes(names){const by={},hands=names.reduce((a,n)=>{const w=wornOn(gearItem(n)||n);(by[w]=by[w]||[]).push(n);return a+(w==='Both hands'||w==='Off hand (set down to brace it)'?2:/^(One hand|Off hand|One or both hands)/.test(w)?1:0)},0),out=[];
  ['Body (torso)','Head','Hands and forearms','Feet and shins','Shoulders','Back','Waist (belt)'].forEach(w=>{if((by[w]||[]).length>1)out.push(by[w].length+' items on '+w.toLowerCase()+': '+by[w].join(', '))});
  if(hands>2)out.push('More than two hands’ worth held ('+hands+')');return out}
// Equipped takes anything (campaign owner's rule): a Blueprint, a material, something from the bag, or any typed item.
// Blueprints give their AC, bonuses, and traits; anything else is simply worn or held.
const gearItem=n=>findBP(n)||findMat(n)||null;
const gearName=v=>{const x=gearItem(v)||(PARTY.flatMap(c=>c.inv||[]).find(z=>lc(z[0])===lc(v))||[])[0];return x?(x.n||x):v};
function gearChip(n){const x=gearItem(n);return x?refChip(x,esc(n),esc(x.cat||x.gr||'')):`${esc(n)} <small style="color:var(--muted)">item</small>`}
// The bag takes anything too: suggestions list every Blueprint (with where it is worn) and the common materials.
let ITEM_DL='';function itemDatalist(){return ITEM_DL||(ITEM_DL=`<datalist id="dl-item">${BPS.map(b=>`<option value="${esc(b.n)}">${esc(b.cat+' · '+wornOn(b))}</option>`).join('')}${MATS.filter(m=>!m.gen).slice(0,1500).map(m=>`<option value="${esc(m.n)}">${esc(m.gr||'material')}</option>`).join('')}</datalist>`)}
// what a bag row says beside its name: a material's grade, or where a Blueprint or other item is worn
const invLabel=n=>{const m=findMat(n);if(m)return m.gr||'material';const b=findBP(n);return (b?b.cat+' · ':'')+wornOn(b||n)};
function invEquip(id,i){const c=PARTY.find(x=>x.id===id);if(!c||!c.inv||!c.inv[i])return;const n=c.inv[i][0];c.gear=(c.gear||[]).concat(n);c.inv[i][1]=(+c.inv[i][1]||0)-1;if(c.inv[i][1]<=0)c.inv.splice(i,1);saveParty();toast(n+' equipped ('+wornOn(gearItem(n)||n).toLowerCase()+')');TAB==='sheet'?renderSheet():renderParty()}
// unequipping puts the item back in the bag when there is room
function gearBack(c,n){invAdd(c,n,1,false,true)}
// Equipped items sorted into Weapons, Armour (by slot), and Equipment (owner's request, 2026-11-04). The character keeps one
// equipped list, so totals, syncing and older saves are unchanged; the sheet and the Party page only group it.
const GEAR_GROUPS=[['weapon','Weapons','⚔'],['armor','Armour','🛡'],['equip','Equipment','🎒']],ARMOR_ROWS=['Head','Shoulders','Body','Back','Hands','Feet','Shield'];
function gearGroup(n){const b=findBP(n);if(b){if(ARMOR_CATS.includes(b.cat))return 'armor';if(WEAPON_CATS.includes(b.cat)||b.cat==='Ammunition'||(b.design&&b.design.dmg&&!(BASES[b.design.base]||{}).focus))return 'weapon';return 'equip'}
  return /^(One hand|Both hands|One or both hands)$/.test(wornOn(gearItem(n)||n))?'weapon':'equip'}
const armorRow=b=>{const sl=b.cat==='Shield'?'Shield':armorPiece(b).slot;return ARMOR_ROWS.includes(sl)?sl:'Other'};
// the Armour box: every slot, what fills it, and the slots a heavy suit covers
function armorSlotsHTML(c,li){const G=(c.gear||[]).map((n,i)=>({n,i,b:findBP(n)})).filter(x=>x.b&&gearGroup(x.n)==='armor'),cov={};G.forEach(x=>(x.b.covers||[]).forEach(sl=>{if(sl!==armorRow(x.b))cov[sl]=x.n}));
  const rows=ARMOR_ROWS.concat(G.some(x=>armorRow(x.b)==='Other')?['Other']:[]);
  return `<div class="sh-slots">${rows.map(sl=>{const here=G.filter(x=>armorRow(x.b)===sl);return `<div class="sh-slot${here.length?'':' empty'}"><span class="sh-slotn">${sl==='Shield'?'Off hand':sl==='Other'?'Other':esc(sl)}</span><span class="sh-slotv">${here.length?here.map(x=>{const best=here.reduce((m,y)=>(+y.b.ac||0)>(+m.b.ac||0)?y:m,here[0]);return li(x.n,x.i,true)+(cov[sl]?` <small class="sh-where">(no AC: covered by ${esc(cov[sl])})</small>`:x!==best?` <small class="sh-where">(spare: only the best piece in a slot counts)</small>`:'')}).join(''):cov[sl]?`<small class="sh-where">covered by ${esc(cov[sl])}</small>`:'<small class="sh-where">empty</small>'}</span></div>`}).join('')}</div>`}
function gearClashHTML(c,which){const w=wornClashes(c.gear||[]).filter(x=>!which||(which==='weapon')===/hands’ worth/.test(x));return w.length?`<div class="note" style="margin:6px 0 0;color:var(--gold2)">⚠ ${w.map(esc).join('; ')}.</div>`:''}
function gearDatalist(c,g){const seen=new Set(),o=[],ok=n=>!g||gearGroup(n)===g;(c&&c.inv||[]).forEach(([n])=>{if(!seen.has(lc(n))&&ok(n)){seen.add(lc(n));o.push(`<option value="${esc(n)}">in the bag</option>`)}});BPS.forEach(b=>{if(!seen.has(lc(b.n))&&(!g||(g==='armor'?ARMOR_CATS.includes(b.cat):g==='weapon'?WEAPON_CATS.includes(b.cat)||b.cat==='Ammunition':!ARMOR_CATS.includes(b.cat)&&!WEAPON_CATS.includes(b.cat)&&b.cat!=='Ammunition'))){seen.add(lc(b.n));o.push(`<option value="${esc(b.n)}">${esc(wornOn(b))}</option>`)}});return `<datalist id="dl-gear${g?'-'+g:''}">${o.join('')}</datalist>`}
function sheetGear(act,i,g){const c=sheetChar();if(!c)return;c.gear=c.gear||[];if(act==='rm'){if(curseBlocks(c,c.gear[i]))return;const n=c.gear.splice(i,1)[0];if(n){gearBack(c,n);curseGone(c,n)}}else{const v=(($(g&&g!=='equip'?'gear-n-'+g:'gear-n')||{}).value||'').trim();if(!v){toast('Type what to equip');return}const b={n:gearName(v)};c.gear.push(b.n);const to=gearGroup(b.n);if(g&&to!==g)toast(b.n+' went to '+GEAR_GROUPS.find(x=>x[0]===to)[1]);const k=(c.inv||[]).findIndex(z=>lc(z[0])===lc(b.n));if(k>=0){c.inv[k][1]=(+c.inv[k][1]||0)-1;if(c.inv[k][1]<=0)c.inv.splice(k,1)}}saveParty();renderSheet()}
// A second people, as heritage (owner's choice, 2026-11-06): the main people gives ability bonuses, size, speed, and all
// its traits as before; the heritage adds its innate spells, one of its traits (the player picks), its own language, and
// its darkvision when that sees farther. c.race2 holds it, c.race2Trait the chosen trait.
const HER_SKIP=/\b(you know|can cast|cast .* once)\b/i;
const heritageTraits=n=>{const P=peopleInfo(n);return P?(P.traits||[]).filter(t=>!HER_SKIP.test(t[1])&&!/^darkvision$|^superior darkvision$|^languages?$/i.test(t[0])):[]};
function heritageHTML(c){const cur=c.race2||'',known=CW_RACE.some(r=>r[0]===cur),f=known?famOf(cur):'',M=f?famMembers(f):[];
  const pick=`<div class="sh-race sh-noprint" style="margin-bottom:6px"><select aria-label="Second people" onchange="sheetRace2Fam(this.value)"><option value="">${cur?'No heritage':'Add a second people…'}</option>${peopleTop().map(x=>`<option${x===f?' selected':''}>${esc(x)}</option>`).join('')}</select>${M.length>1?`<select aria-label="Type of ${esc(f)}" onchange="sheetSetRace2(this.value)">${M.map(n=>`<option${n===cur?' selected':''}>${esc(n)}</option>`).join('')}</select>`:''}</div>`;
  if(!cur)return pick+'<div class="note" style="margin:0">A character can have a second people as their heritage (a parent or grandparent). It adds its innate spells, one of its traits, its language, and its darkvision if it sees farther; the main people keeps its ability bonuses, size, speed, and traits.</div>';
  const P=peopleInfo(cur),P1=peopleInfo(c.race)||{},langs=P?(P.langs||[]).filter(l=>l!=='Common'&&!(P1.langs||[]).includes(l)):[],dv=P&&P.dv&&P.dv>(P1.dv||0)?P.dv:0,T=heritageTraits(cur),tr=T.find(t=>t[0]===c.race2Trait),spells=(RACE_SPELLS[cur]&&RACE_SPELLS[cur].sp||[]).length;
  return pick+`<ul class="sh-ul">${dv?`<li><b>Darkvision ${dv} ft</b> <small style="color:var(--muted)">(sees farther than your main people)</small></li>`:''}${langs.length?`<li><b>Language:</b> ${esc(langs.join(', '))}</li>`:''}${spells?`<li><b>Innate spells</b> <small style="color:var(--muted)">on the Spells page, as heritage spells</small></li>`:''}
    <li><b>One trait:</b> ${T.length?`<select class="sh-noprint" onchange="sheetRace2Trait(this.value)"><option value="">Choose…</option>${T.map(t=>`<option${t[0]===c.race2Trait?' selected':''}>${esc(t[0])}</option>`).join('')}</select>${tr?`<div style="font-size:.85rem;margin-top:4px"><b>${esc(tr[0])}.</b> ${esc(tr[1])}</div>`:''}`:'<small style="color:var(--muted)">none to choose: write one in Features with your DM</small>'}</li></ul>
    ${P?`<button class="btn sh-noprint" type="button" style="margin-top:6px" onclick="peoplePop(${esc(JSON.stringify(cur))})">ⓘ ${esc(cur)} profile</button>`:''}`}
function sheetRace2Fam(f){const c=sheetChar();if(!c)return;if(!f){delete c.race2;delete c.race2Trait}else{const M=famMembers(f);if(!M.includes(c.race2)){c.race2=M[0];delete c.race2Trait}if(M.length>1)toast('Now choose the type of '+f)}saveParty();renderSheet()}
function sheetSetRace2(n){const c=sheetChar();if(!c||!n)return;if(c.race2!==n)delete c.race2Trait;c.race2=n;saveParty();renderSheet()}
function sheetRace2Trait(t){const c=sheetChar();if(!c)return;if(t)c.race2Trait=t;else delete c.race2Trait;saveParty();renderSheet()}
function sheetRaceFam(f){const c=sheetChar();if(!c)return;if(f==='__other'){const t=prompt('Your people:',c.race||'');if(t!=null&&t.trim())c.race=t.trim()}else if(f){const M=famMembers(f);if(!M.includes(c.race))c.race=M[0];if(M.length>1)toast('Now choose the type of '+f)}else return;saveParty();renderSheet()}
function sheetSetRace(n){const c=sheetChar();if(!c||!n)return;c.race=n;saveParty();renderSheet()}
// a character's portrait: any picture, cut to a 256 px square and kept with the character (a few kB, so it syncs)
function sheetPortrait(input){const c=sheetChar();if(!c)return;if(!input){delete c.portrait;saveParty();renderSheet();return}const f=input.files&&input.files[0];if(!f)return;
  // a 192-pixel square JPEG (about 10–20 KB): sharp enough for the sheet, small enough that a big party fits in the browser
  const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const S=192,cv=document.createElement('canvas');cv.width=cv.height=S;const k=Math.min(img.width,img.height),x=cv.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,S,S);x.drawImage(img,(img.width-k)/2,(img.height-k)/2,k,k,0,0,S,S);const old=c.portrait;c.portrait=cv.toDataURL('image/jpeg',.8);
    if(!saveParty()){if(old)c.portrait=old;else delete c.portrait;saveParty();renderSheet();return}renderSheet();toast('Portrait set')};img.onerror=()=>toast('That file is not a picture');img.src=rd.result};rd.readAsDataURL(f)}
function sheetSkillAdd(){const c=sheetChar(),n=$('sk-new').value.trim();if(!n)return;c.custom=(c.custom||[]).concat({n,ab:$('sk-ab').value,prof:false});saveParty();renderSheet()}
function sheetInvAdd(){const c=sheetChar(),n=gearName($('inv-n').value.trim()),q=Math.max(1,+$('inv-q').value||1);if(!n)return;invAdd(c,n,q,false,true);saveParty();renderSheet()}
function sheetInvRm(i){const c=sheetChar();c.inv=(c.inv||[]).filter((_,j)=>j!==i);saveParty();renderSheet()}
// rests (5e): a long rest restores hit points, every spell slot, and half the hit dice (at least 1) and clears death
// saves and temporary hit points; a short rest restores a Warlock's pact slots
// one character's rest. The sheet asks which slot comes back on a short rest; the party rest gives back the highest used one.
function charRest(c,kind,lvl){const L=+c.level||1,pact=c.cls==='Warlock'||c.cls2==='Warlock';resRest(c,kind);if(kind==='long'){const A=attuneOf(c,c.here||'Human');if(A)A.pts=Math.min(2*profBonus(L),(+A.pts||0)+1)}
  if(kind==='long'){(c.towerCards||[]).forEach(x=>x.used=0);(c.bonds||[]).forEach(s=>{delete s.hp;delete s.dead});if(c.hpMax!=null&&c.hpMax!=='')c.hp=c.hpMax;c.tempHp='';c.slotUsed={};c.ds={};c.hdUsed=Math.max(0,(+c.hdUsed||0)-Math.max(1,Math.floor(L/2)));return {}}
  // campaign rule: a short rest gives back one used spell slot (a Warlock's pact slots come back too)
  const su=c.slotUsed||{},lvls=slotLevelsUsed(c);let slot=0;if(lvl==='auto')lvl=lvls[lvls.length-1];
  if(lvls.includes(+lvl)){const k=Object.keys(su[+lvl]).filter(i=>su[+lvl][i]).pop();su[+lvl][k]=false;slot=+lvl}
  c.slotUsed=pact?{}:su;return {slot,pact}}
function slotLevelsUsed(c){const su=c.slotUsed||{};return Object.keys(su).filter(l=>Object.values(su[l]||{}).some(Boolean)).map(Number).sort((x,y)=>x-y)}
function sheetRest(kind){const c=sheetChar();if(!confirm(kind==='long'?'Long rest: full hit points, all spell slots, half your hit dice back, death saves cleared?':'Short rest: get back one used spell slot of your choice (and pact slots)? Spend hit dice by hand.'))return;
  if(kind==='long'){charRest(c,'long');const up=(c.undead||[]).filter(u=>u.up&&!/^none/i.test(u.up));saveParty();renderSheet();toast('Long rest taken'+(up.length?': remember upkeep for '+up.length+' undead servant'+(up.length>1?'s':''):''));curseRestNote([c])}
  else{const lvls=slotLevelsUsed(c);let pick=null;if(lvls.length)pick=+prompt('Short rest: which spell slot level do you get back? Used slots at level '+lvls.join(', ')+'.',String(lvls[lvls.length-1]));
    const r=charRest(c,'short',pick);saveParty();renderSheet();toast('Short rest taken'+(r.slot?' · a level '+r.slot+' slot is back':'')+(r.pact?' · pact slots restored':''));curseRestNote([c])}}
// the whole party rests at once (Party page and combat tracker), by the same rules, with a line in the session journal
// Several campaigns (owner's request): the Party page shows one campaign at a time. The view is '' (every character),
// a campaign id, or 'solo' (characters shared with no campaign). Rests, standing, the DM controls, and "Add the party"
// in combat follow it, so a DM running two tables never mixes them up.
const campList=()=>typeof CL!=='undefined'&&CL.user&&Array.isArray(CL.camps)?CL.camps:[];
function campView(){const v=store.get('campview','')||'',L=campList();if(!L.length)return '';return v==='solo'||L.some(k=>k.id===v)?v:''}
const PV=()=>{const v=campView();return !v?PARTY:v==='solo'?PARTY.filter(c=>!c.camp):PARTY.filter(c=>c.camp===v)};
function campViewName(){const v=campView();if(!v)return '';if(v==='solo')return 'Not shared';const k=campList().find(x=>x.id===v);return k?k.name:''}
function campSetView(v){store.set('campview',v||'');const L=PV();if(!L.some(c=>c.id===PARTY_SEL))PARTY_SEL=L.length?L[0].id:null;
  if(TAB!=='party'){go('party');return}renderParty();const n=campViewName();toast(n?'Showing '+n:'Showing every character')}
function partyRest(kind){const L=PV().filter(c=>!c.camp||typeof clCanEdit!=='function'||clCanEdit(c));if(!L.length){toast('Add a character first');return}
  if(!massOk((kind==='long'?'Long rest for ':'Short rest for ')+L.map(c=>c.name||'Unnamed').join(', ')+'?\n'+(kind==='long'?'Full hit points, every spell slot, half their hit dice back, death saves cleared.':'Each caster gets back their highest used spell slot (and a Warlock\'s pact slots). Spend hit dice on each sheet.')))return;
  const before=JSON.stringify(PARTY),J0=JSON.stringify(store.get('journal',[]));
  const lines=L.map(c=>{const r=charRest(c,kind,'auto'),got=[r.slot&&'a level '+r.slot+' slot',r.pact&&'pact slots'].filter(Boolean);return '- '+(c.name||'Unnamed')+(kind==='long'?(c.hpMax?': '+c.hp+' HP':''):got.length?': '+got.join(' and ')+' back':'')});
  saveParty();curseRestNote(L);const J=store.get('journal',[]);J.push({t:kind==='long'?'Long rest':'Short rest',at:Date.now(),d:new Date().toISOString().slice(0,10),body:(kind==='long'?'The party took a long rest.':'The party took a short rest.')+'\n'+lines.join('\n')});store.set('journal',J);
  const re=()=>{if(TAB==='party')renderParty();else if(TAB==='combat')renderCombat();else if(TAB==='sheet')renderSheet()};re();
  undoToast((kind==='long'?'Long':'Short')+' rest taken by '+L.length+' character'+(L.length>1?'s':'')+' · noted in the journal',()=>{const B=JSON.parse(before);PARTY.length=0;B.forEach(c=>PARTY.push(c));saveParty();store.set('journal',JSON.parse(J0));re()})}
function sheetSpec(x){const c=sheetChar();c.specs=c.specs||[];c.specs=c.specs.includes(x)?c.specs.filter(y=>y!==x):c.specs.concat(x);saveParty();renderSheet()}
function sheetCls2(k){const c=sheetChar();if(!k&&c.cls2&&!confirm('Drop '+c.cls2+'? Its levels go back to '+(c.cls||'the first class')+'.'))return;if(k&&!confirm('Take '+k+' as a second class? It needs a teacher of '+k+' or a trial (DM\'s call).'))return;c.cls2=k||'';c.lv2=0;c.sub2='';c.growApplied2=0;saveParty();renderSheet()}
function sheetLv2(d){const c=sheetChar(),L=+c.level||1,v=Math.max(0,Math.min(L-1,(+c.lv2||0)+d));c.lv2=v;saveParty();renderSheet()}
function sheetCtAdd(){const c=sheetChar(),g=$('ct-god').value,r=$('ct-rank').value,how=$('ct-how').value;if(!g)return;if(!how){toast('A contract needs a way in: a follower, a ritual, a temple, or an integrated item');$('ct-how').focus();return}if(!c.god){c.god=g;c.rank=r;c.ctHow=how}else{c.extra=(c.extra||[]).concat({god:g,rank:r,how})}saveParty();renderSheet()}
function sheetCtRm(i){const c=sheetChar();if(!confirm('End this contract? Breaking a contract has a price (Rules page).'))return;if(i<0){const n=(c.extra||[])[0];if(n){c.god=n.god;c.rank=n.rank;c.ctHow=n.how||'';c.extra=c.extra.slice(1)}else{c.god='';c.rank='';c.ctHow=''}}else c.extra=(c.extra||[]).filter((_,j)=>j!==i);saveParty();renderSheet()}
function sheetCtRank(i,r){const c=sheetChar();if(i<0)c.rank=r;else if(c.extra&&c.extra[i])c.extra[i].rank=r;saveParty();renderSheet()}
function sheetUndeadRm(i){const c=sheetChar();if(!confirm('Release this servant?'))return;c.undead=(c.undead||[]).filter((_,j)=>j!==i);saveParty();renderSheet()}
function sheetEssence(d){const c=sheetChar();c.essence=Math.max(0,(+c.essence||0)+d);saveParty();renderSheet()}
function sheetUndeadDead(i){const c=sheetChar(),u=(c.undead||[])[i];if(!u)return;u.dead=true;saveParty();renderSheet();toast(u.n+' is destroyed'+(necroLv(c)>=6?': 3 essence re-raises it at your next long rest':''))}
function sheetUndeadMend(i){const c=sheetChar(),u=(c.undead||[])[i];if(!u||(+c.essence||0)<1)return;c.essence-=1;saveParty();renderSheet();toast(u.n+' is restored to full hit points (1 essence)')}
function sheetUndeadRaise(i){const c=sheetChar(),u=(c.undead||[])[i];if(!u||(+c.essence||0)<3)return;c.essence-=3;delete u.dead;saveParty();renderSheet();toast(u.n+' rises again at the end of the long rest (3 essence)')}
function sheetUndeadBind(i,v){const c=sheetChar(),u=(c.undead||[])[i];if(!u)return;u.bound=v;saveParty();renderSheet()}
function sheetSkillRm(i){const c=sheetChar();c.custom.splice(i,1);saveParty();renderSheet()}
function sheetSchool(op,i){const c=sheetChar();c.schools=(c.schools||[]).filter(x=>x&&x.n);
  if(op==='add'){const v=$('sch-new')&&$('sch-new').value;if(v&&!schoolOk(c,v,c.schools)){toast(schoolWhy(c,v));return}if(v&&!c.schools.some(x=>x.n===v))c.schools.push({n:v,m:1})}
  else if(op==='up')c.schools[i].m++;else if(op==='down')c.schools[i].m=Math.max(1,c.schools[i].m-1);else if(op==='rm')c.schools.splice(i,1);
  saveParty();renderSheet()}
function sheetSpellAdd(lv){const c=sheetChar(),v=$('sp-add-'+lv).value.trim();if(!v)return;c.spells=c.spells||{};(c.spells[lv]=c.spells[lv]||[]).push(v);const sp=SP.find(x=>lc(x.n)===lc(v));c.spBound=c.spBound||{};if(!c.spBound[lc(v)])c.spBound[lc(v)]=(sp&&spellHome(sp))||c.here||'Human';saveParty();renderSheet()}
function sheetSpellRm(lv,i){const c=sheetChar();c.spells[lv].splice(i,1);saveParty();renderSheet()}
// ── Standing: how the powers of Vestige see the party. Six steps from Hostile to Honored, kept on each character (so a
// shared campaign shows every player their own), moved by the DM a step at a time with a reason. It never changes prices
// or rules by itself: each step says what it usually means, and the DM applies it ──
const STAND=[[-2,'Hostile','They work against you','Agents, bounties, closed doors; they may act without being provoked','red'],
  [-1,'Wary','They want nothing to do with you','No services or help; questions asked; prices may be doubled','gold2'],
  [0,'Unknown','You are no one to them yet','Ordinary dealings; where every faction starts','muted'],
  [1,'Friendly','They know you and like you','Services offered, small favours, rumours and leads','green'],
  [2,'Trusted','You are one of theirs','Shelter, better prices, real quests, an introduction where it counts','acc2'],
  [3,'Honored','Your name carries weight','A great favour once in a while; they will act on your word','gold']];
const standStep=n=>STAND.find(x=>x[0]===n)||STAND[2];
const standPill=n=>{const S=standStep(n);return `<span class="b" style="color:var(--${S[4]==='gold'?'gold2':S[4]});background:color-mix(in srgb,var(--${S[4]}) 14%,transparent);border-color:color-mix(in srgb,var(--${S[4]}) 35%,transparent)" title="${esc(S[2]+'. '+S[3]+'.')}">${esc(S[1])}</span>`};
const charGods=c=>[c.god,...(c.extra||[]).map(x=>x.god)].filter(Boolean);
// every faction the DM can pick: the gods, the Magic Towers, each realm's smiths, and the DM's own
function standCatalog(){const L=[];
  GODS.forEach(g=>L.push({id:'god:'+godKey(g),n:godShort(g),k:'God'}));
  Object.entries(MAGIC_TOWERS).forEach(([sc,t])=>L.push({id:'tower:'+sc,n:t[0],k:'Magic Tower'}));
  Object.entries(SMITHS).forEach(([z,S])=>L.push({id:'smith:'+z,n:'The smiths of the '+z+' Realm',k:'Smiths',d:'led by '+S[0]}));
  (store.get('factions',[])||[]).forEach(f=>f&&f.id&&L.push(Object.assign({k:'Faction'},f)));return L}
const standInfo=id=>{const c=standCatalog().find(x=>x.id===id);if(c)return c;for(const ch of PARTY){const e=(ch.standing||{})[id];if(e&&e.n)return {id,n:e.n,k:e.k||'Faction'}}return {id,n:id.replace(/^\w+:/,''),k:'Faction'}};
// a character's standing with a faction; a god they hold a contract with is at least Friendly
function standOf(c,id){const e=(c.standing||{})[id];let s=e?+e.s||0:0;if(/^god:/.test(id)&&charGods(c).some(g=>lc(g)===lc(id.slice(4))))s=Math.max(s,1);return s}
// the factions this party has met: anything moved for someone, plus the gods they hold contracts with
function standKnown(){const ids=new Set();PV().forEach(c=>{Object.keys(c.standing||{}).forEach(k=>ids.add(k));charGods(c).forEach(g=>{const G=godByKey(g);ids.add('god:'+(G?godKey(G):g))})});return [...ids].map(standInfo)}
function standMove(id,d,why,who){const f=standInfo(id),T=who?PV().filter(c=>c.id===who):PV().filter(c=>clCanEdit(c));if(!T.length){toast('Add a character first');return}
  if(T.length>1&&!massOk((d>0?'Raise':'Lower')+' '+f.n+'\'s standing for all '+T.length+' characters?'))return;
  const snap=T.map(c=>JSON.stringify(c)),moved=[];
  T.forEach(c=>{const from=standOf(c,id),to=Math.max(-2,Math.min(3,from+d));if(to===from)return;c.standing=c.standing||{};c.standing[id]={s:to,n:f.n,k:f.k};
    c.standingLog=(c.standingLog||[]).concat({d:new Date().toISOString().slice(0,10),f:id,n:f.n,from,to,why:why||''}).slice(-60);moved.push(c.name||'Unnamed')});
  if(!moved.length){toast(f.n+(d>0?' can\'t think any better of them':' can\'t think any worse of them'));return}saveParty();if(TAB==='party')renderParty();else if(TAB==='forge')renderForge();
  undoToast(`${f.n}: ${d>0?'raised':'lowered'} for ${moved.join(', ')}`,()=>{T.forEach((c,i)=>{const o=JSON.parse(snap[i]);Object.keys(c).forEach(k=>{if(!(k in o))delete c[k]});Object.assign(c,o)});saveParty();if(TAB==='party')renderParty()})}
function standNewFaction(){const n=($('st-fn')||{}).value?.trim(),k=($('st-fk')||{}).value?.trim()||'Faction',d=($('st-fd')||{}).value?.trim()||'';if(!n){toast('Name the faction first');return}
  const L=store.get('factions',[])||[],id='f:'+lc(n).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(L.some(f=>f.id===id)||standCatalog().some(f=>f.id===id)){toast(n+' is already on the list');return}
  L.push({id,n,k,d});store.set('factions',L);ST_PICK=id;toast(n+' added: pick it and move the party\'s standing');renderParty()}
let ST_PICK='';
function standingHTML(){if(!PV().length)return '';const known=standKnown(),dm=role()!=='player'&&dmUnlocked(),cat=standCatalog(),kn=new Set(known.map(f=>f.id));
  const row=f=>{const vals=PV().map(c=>standOf(c,f.id)),same=vals.every(v=>v===vals[0]),last=PV().flatMap(c=>(c.standingLog||[]).filter(x=>x.f===f.id)).sort((a,b)=>(a.d<b.d?1:-1))[0];
    return `<tr><td><b>${esc(f.n)}</b><div class="note" style="margin:0">${esc(f.k)}${f.d?' · '+esc(f.d):''}</div></td><td>${same?standPill(vals[0]):PV().map((c,i)=>`<span style="white-space:nowrap">${esc(c.name||'?')} ${standPill(vals[i])}</span>`).join(' ')}</td><td class="note">${last?`${esc(last.why||'')}${last.why?' · ':''}<small>${esc(standStep(last.from)[1])} → ${esc(standStep(last.to)[1])}, ${esc(last.d)}</small>`:/^god:/.test(f.id)?'<small>a contract with this god</small>':'<small>—</small>'}</td></tr>`};
  const grp=(label,list)=>list.length?`<optgroup label="${esc(label)}">${list.map(f=>`<option value="${esc(f.id)}"${ST_PICK===f.id?' selected':''}>${esc(f.n)}</option>`).join('')}</optgroup>`:'';
  return `<details class="panel" style="margin-bottom:14px" ${store.get('standOpen',true)?'open':''} ontoggle="store.set('standOpen',this.open)"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;font-size:1.1rem">⚖ Standing <span class="note" style="margin:0;font-family:var(--sans);font-weight:400">${known.length?known.length+' faction'+(known.length===1?'':'s')+' know the party':'how the powers of Vestige see the party'}</span></summary>
    ${known.length?`<div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>Faction</th><th>Standing</th><th>Last change</th></tr></thead><tbody>${known.map(row).join('')}</tbody></table></div>`:'<p class="note" style="margin:8px 0 0">No faction knows the party yet. A god they hold a contract with shows here by itself.</p>'}
    <div class="note" style="margin:8px 0 0">${STAND.map(x=>`${standPill(x[0])} ${esc(x[2].toLowerCase())}`).join(' · ')}. Standing never changes prices or rules by itself: it says what each step usually means, and the DM applies it.</div>
    ${dm?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">
      <select class="sel" id="st-f" style="max-width:260px" onchange="ST_PICK=this.value"><option value="">Choose a faction…</option>${grp('Already know the party',cat.filter(f=>kn.has(f.id)).concat(known.filter(f=>!cat.some(c=>c.id===f.id))))}${grp('Your factions',cat.filter(f=>f.k!=='God'&&f.k!=='Magic Tower'&&f.k!=='Smiths'&&!kn.has(f.id)))}${grp('Smiths',cat.filter(f=>f.k==='Smiths'&&!kn.has(f.id)))}${grp('Magic Towers',cat.filter(f=>f.k==='Magic Tower'&&!kn.has(f.id)))}${grp('Gods',cat.filter(f=>f.k==='God'&&!kn.has(f.id)))}</select>
      <select class="sel" id="st-who" style="max-width:170px"><option value="">The whole party</option>${PV().filter(c=>clCanEdit(c)).map(c=>`<option value="${c.id}">${esc(c.name||'Unnamed')}</option>`).join('')}</select>
      <input class="sel" id="st-why" placeholder="Why? (Returned the lantern to Nim)" style="flex:1;min-width:180px;max-width:none">
      <button class="btn" onclick="standGo(1)">▲ Raise</button><button class="btn" onclick="standGo(-1)">▼ Lower</button></div>
      <details style="margin-top:8px"><summary class="note" style="cursor:pointer">+ A faction of your own</summary><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><input class="sel" id="st-fn" placeholder="Name (House Varrow)" style="max-width:200px"><input class="sel" id="st-fk" placeholder="Kind (guild, house, cult…)" style="max-width:180px"><input class="sel" id="st-fd" placeholder="Who they are (optional)" style="flex:1;min-width:160px;max-width:none"><button class="btn" onclick="standNewFaction()">Add</button></div></details>`:role()!=='player'?'<p class="note" style="margin:8px 0 0">Unlock the DM controls below to change the party\'s standing.</p>':''}
  </details>`}
function standGo(d){const id=($('st-f')||{}).value;if(!id){toast('Choose a faction first');return}ST_PICK=id;standMove(id,d,($('st-why')||{}).value.trim(),($('st-who')||{}).value)}
// the sheet's Standing box: what this character's factions think of them
function standSheetHTML(c){const ids=new Set([...Object.keys(c.standing||{}),...charGods(c).map(g=>{const G=godByKey(g);return 'god:'+(G?godKey(G):g)})]);if(!ids.size)return '';
  return `<ul class="sh-ul">${[...ids].map(id=>{const f=standInfo(id),last=(c.standingLog||[]).filter(x=>x.f===id).slice(-1)[0];return `<li>${standPill(standOf(c,id))} <b>${esc(f.n)}</b>${last&&last.why?` <small style="color:var(--muted)">· ${esc(last.why)}</small>`:''}</li>`}).join('')}</ul>`}
// on a Magic Tower's page: where the party stands with it, beside the tower ranks
function standTowerHTML(school){if(!PV().length)return '';const id='tower:'+school,vals=PV().map(c=>standOf(c,id)),same=vals.every(v=>v===vals[0]);
  return `<div class="note" style="margin:4px 0 8px">⚖ The party's standing here: ${same?standPill(vals[0]):PV().map((c,i)=>esc(c.name||'?')+' '+standPill(vals[i])).join(' ')}. As a guide for the DM, Member suits Friendly or better, and Archmage suits Honored. <a href="${pageUrl('party')}" data-go="party">Change it on the Party page</a>.</div>`}
// The DM's controls on the Party page: every character's standing with every faction set directly, the standing history
// corrected, and each character's level, hit points, and gold at hand. In a campaign the DM's changes save to the players' sheets.
const contractedGod=(c,id)=>/^god:/.test(id)&&charGods(c).some(g=>lc(g)===lc(id.slice(4)));
const dmToday=()=>new Date().toISOString().slice(0,10);
function dmRefresh(){setTimeout(()=>{const a=document.activeElement,fid=a&&a.id;if(TAB==='party')renderParty();if(fid&&$(fid))$(fid).focus()},0)}
function dmUndo(c,snap,msg){undoToast(msg,()=>{const o=JSON.parse(snap);Object.keys(c).forEach(k=>{if(!(k in o))delete c[k]});Object.assign(c,o);saveParty();if(TAB==='party')renderParty()})}
function standSet(cid,id,v){const c=PARTY.find(x=>x.id===cid);if(!c||!clCanEdit(c))return;const f=standInfo(id),from=standOf(c,id),to=Math.max(-2,Math.min(3,Math.round(+v)||0));
  if(contractedGod(c,id)&&to<1){toast('A god '+(c.name||'they')+' holds a contract with is at least Friendly');renderParty();return}if(to===from)return;
  const snap=JSON.stringify(c);c.standing=c.standing||{};c.standing[id]={s:to,n:f.n,k:f.k};
  c.standingLog=(c.standingLog||[]).concat({d:dmToday(),f:id,n:f.n,from,to,why:(($('dm-why')||{}).value||'').trim()||'Set by the DM'}).slice(-60);
  saveParty();dmRefresh();dmUndo(c,snap,`${c.name||'Unnamed'}: ${f.n} now ${standStep(to)[1]}`)}
// a faction for everyone at once (a new row in the grid starts at Neutral for the whole party)
function standAddRow(){const id=($('dm-addf')||{}).value;if(!id)return;const f=standInfo(id),T=PV().filter(c=>clCanEdit(c));if(!T.length)return;
  T.forEach(c=>{c.standing=c.standing||{};if(!c.standing[id])c.standing[id]={s:standOf(c,id),n:f.n,k:f.k}});saveParty();renderParty();toast(f.n+' added to the grid')}
function standDropRow(id){const f=standInfo(id),T=PV().filter(c=>clCanEdit(c)&&(c.standing||{})[id]);if(!T.length)return;
  if(!(T.length>1?massOk:confirm)('Take '+f.n+' off the grid for '+T.map(c=>c.name||'Unnamed').join(', ')+'? Their history with it stays.'))return;const snaps=T.map(c=>JSON.stringify(c));
  T.forEach(c=>{delete c.standing[id]});saveParty();renderParty();undoToast(f.n+' taken off the grid',()=>{T.forEach((c,i)=>{const o=JSON.parse(snaps[i]);Object.keys(c).forEach(k=>{if(!(k in o))delete c[k]});Object.assign(c,o)});saveParty();renderParty()})}
function standLogEdit(cid,i,act){const c=PARTY.find(x=>x.id===cid);if(!c||!clCanEdit(c)||!(c.standingLog||[])[i])return;const snap=JSON.stringify(c),e=c.standingLog[i];
  if(act==='del'){c.standingLog.splice(i,1);saveParty();renderParty();dmUndo(c,snap,'History entry removed (the standing itself is unchanged)');return}
  const w=prompt('Why did '+e.n+' change its mind about '+(c.name||'them')+'?',e.why||'');if(w==null)return;e.why=w.trim();saveParty();renderParty()}
function dmField(cid,k,v){const c=PARTY.find(x=>x.id===cid);if(!c||!clCanEdit(c))return;const snap=JSON.stringify(c),n=Math.round(+v);if(v!==''&&!isFinite(n))return;
  if(k==='level')c.level=Math.max(1,Math.min(MAX_LEVEL,n||1));
  else if(k==='hp')c.hp=v===''?'':Math.max(0,n);else if(k==='hpMax')c.hpMax=v===''?'':Math.max(1,n);else if(k==='tempHp')c.tempHp=v===''||n<=0?'':n;
  else if(k==='gp'){c.coins=c.coins||{};c.coins.gp=Math.max(0,n||0)}else return;
  saveParty();dmRefresh();dmUndo(c,snap,(c.name||'Unnamed')+': '+({level:'level',hp:'hit points',hpMax:'maximum hit points',tempHp:'temporary hit points',gp:'gold'})[k]+' changed')}
// like the Shop, the DM's controls open with the DM code (the same passphrase, pattern, or PIN as Hidden classes)
const dmUnlocked=()=>!!HC||!(typeof HIDDEN==='object'&&HIDDEN&&HIDDEN.lock);
let DM_AUTO=false;
function dmLockedHTML(){if(!DM_AUTO){DM_AUTO=true;hcAuto().then(()=>{if(HC&&TAB==='party')renderParty()}).catch(()=>{})}
  return `<details class="panel" style="margin-bottom:14px"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;font-size:1.1rem">👑 DM controls <span class="note" style="margin:0;font-family:var(--sans);font-weight:400">locked: the DM opens them with the DM code</span></summary><div id="dm-lock" style="margin-top:10px"><button class="btn primary" onclick="dmUnlockForm()">Unlock with the DM code</button></div></details>`}
function dmUnlockForm(){const box=$('dm-lock');if(!box)return;box.innerHTML=quickModes().length&&!PAT_SKIP&&window.crypto&&crypto.subtle?patLockHTML('renderParty'):hcLockHTML();if($('hc-pat')||$('hc-pin'))patLockBind(renderParty);else hcBindLock(renderParty)}
function dmPanelHTML(){if(role()==='player')return '';const T=PV().filter(c=>clCanEdit(c));if(!T.length)return '';if(!dmUnlocked())return dmLockedHTML();
  const known=standKnown(),cat=standCatalog(),kn=new Set(known.map(f=>f.id)),theirs=T.some(c=>!clMine(c));
  const cell=(c,f)=>{const v=standOf(c,f.id),min=contractedGod(c,f.id)?1:-2;return `<td><select class="sel" style="padding:3px 6px;font-size:.8rem;min-width:104px;color:var(--${standStep(v)[4]})" aria-label="${esc(c.name||'Unnamed')}: standing with ${esc(f.n)}" onchange="standSet('${c.id}','${esc(f.id)}',this.value)">${STAND.filter(x=>x[0]>=min).map(x=>`<option value="${x[0]}"${x[0]===v?' selected':''}>${esc(x[1])}</option>`).join('')}</select></td>`};
  const log=T.flatMap(c=>(c.standingLog||[]).map((e,i)=>({c,e,i}))).sort((a,b)=>a.e.d<b.e.d?1:a.e.d>b.e.d?-1:b.i-a.i).slice(0,25);
  const num=(c,k,val,w,lab)=>`<input class="sel" id="dm-${k}-${c.id}" type="number" value="${esc(val==null?'':val)}" style="width:${w}px;padding:3px 6px" aria-label="${esc(c.name||'Unnamed')}: ${lab}" onchange="dmField('${c.id}','${k}',this.value)">`;
  return `<details class="panel" style="margin-bottom:14px" ${store.get('dmOpen',false)?'open':''} ontoggle="store.set('dmOpen',this.open)"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;font-size:1.1rem">👑 DM controls <span class="note" style="margin:0;font-family:var(--sans);font-weight:400">set any character's standing, hit points, level, and gold${theirs?' · your changes save to the players\' sheets':''}</span></summary>
    <h4 style="margin:12px 0 6px">The party</h4>
    <div class="tablewrap"><table class="t"><thead><tr><th>Character</th><th class="num">Level</th><th class="num">HP</th><th class="num">Max HP</th><th class="num">Temp</th><th class="num">Gold</th><th></th></tr></thead><tbody>${T.map(c=>`<tr><td><b>${esc(c.name||'Unnamed')}</b>${c._by&&!clMine(c)?` <small class="note" style="margin:0">${esc(c._by.n||'a player')}'s</small>`:''}</td><td class="num">${num(c,'level',c.level||1,64,'level')}</td><td class="num">${num(c,'hp',c.hp,64,'hit points')}</td><td class="num">${num(c,'hpMax',c.hpMax,64,'maximum hit points')}</td><td class="num">${num(c,'tempHp',c.tempHp,56,'temporary hit points')}</td><td class="num">${num(c,'gp',(c.coins||{}).gp||0,80,'gold pieces')}</td><td><button class="btn" style="padding:3px 10px" data-go="sheet" data-setup='${esc(JSON.stringify({id:c.id}))}'>Full sheet →</button></td></tr>`).join('')}</tbody></table></div>
    <h4 style="margin:16px 0 6px">Standing, character by character</h4>
    ${known.length?`<div class="tablewrap"><table class="t"><thead><tr><th>Faction</th>${T.map(c=>`<th>${esc(c.name||'Unnamed')}</th>`).join('')}<th></th></tr></thead><tbody>${known.map(f=>`<tr><td><b>${esc(f.n)}</b><div class="note" style="margin:0">${esc(f.k)}</div></td>${T.map(c=>cell(c,f)).join('')}<td>${T.some(c=>(c.standing||{})[f.id])?`<button class="btn" style="padding:2px 8px" title="Take this faction off the grid" aria-label="Take ${esc(f.n)} off the grid" onclick="standDropRow('${esc(f.id)}')">✕</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note" style="margin:0">No faction knows the party yet: add one below.</p>'}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><select class="sel" id="dm-addf" style="max-width:260px"><option value="">Add a faction to the grid…</option>${cat.filter(f=>!kn.has(f.id)).map(f=>`<option value="${esc(f.id)}">${esc(f.n)} (${esc(f.k)})</option>`).join('')}</select><button class="btn" onclick="standAddRow()">Add</button>
      <input class="sel" id="dm-why" placeholder="Reason for the next change (optional)" style="flex:1;min-width:200px;max-width:none"></div>
    ${log.length?`<details style="margin-top:12px"><summary class="note" style="cursor:pointer">Standing history (${log.length})</summary><div class="tablewrap" style="margin-top:6px"><table class="t"><thead><tr><th>Date</th><th>Character</th><th>Faction</th><th>Change</th><th>Why</th><th></th></tr></thead><tbody>${log.map(({c,e,i})=>`<tr><td style="white-space:nowrap">${esc(e.d)}</td><td>${esc(c.name||'Unnamed')}</td><td>${esc(e.n)}</td><td style="white-space:nowrap">${standPill(e.from)} → ${standPill(e.to)}</td><td>${esc(e.why||'—')}</td><td style="white-space:nowrap"><button class="btn" style="padding:2px 8px" onclick="standLogEdit('${c.id}',${i},'why')" title="Change the reason">✎</button> <button class="btn" style="padding:2px 8px" onclick="standLogEdit('${c.id}',${i},'del')" title="Remove this entry" aria-label="Remove this entry">✕</button></td></tr>`).join('')}</tbody></table></div></details>`:''}
  </details>`}
function renderParty(){
  const V=PV(),vn=campViewName();if(!V.some(x=>x.id===PARTY_SEL))PARTY_SEL=V.length?V[0].id:null;
  const c=V.find(x=>x.id===PARTY_SEL);
  $('content').innerHTML=`<div class="page">${datalists()}
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Party${vn?` <span class="camp-in">· ${esc(vn)}</span>`:''}</h3><p>Characters, contracts, gear, materials, and money. Saved in this browser${CL.on?' (and in your account when you sign in)':''}; export to share or back up.</p>
      <span class="pg-act"><button class="btn primary" onclick="charWizard()" title="A step-by-step guide for new players">✨ Build one for me</button><button class="btn" onclick="addChar()">+ Add character</button>${moreMenu([`<button type="button" data-go="chargen" title="A whole level 1 character in one tap">🎲 Generate one</button>`,V.length?`<button type="button" onclick="partyRest('short')" title="Everyone takes a short rest: each caster gets a spell slot back">⛺ Short rest for everyone</button>`:'',V.length?`<button type="button" onclick="partyRest('long')" title="Everyone takes a long rest: full hit points and spell slots">🌙 Long rest for everyone</button>${role()!=='player'?'<button type="button" onclick="lootOpen()" title="Treasure outside a fight: give items out and split the coin">💰 Loot pool</button>':''}<button type="button" onclick="calOpen()" title="The day, coming events, and downtime">📅 Calendar and downtime</button><button type="button" onclick="stashOpen()" title="One pack the whole party shares">🎒 Party stash</button>`:'','<hr>',`<button type="button" onclick="exportParty()">⇩ Export the party</button>`,`<label>⇧ Import a party<input type="file" accept=".json,application/json" style="display:none" onchange="importParty(this)"></label>`,`<button type="button" onclick="clearPartyNotes()" title="Empty the Notes box of every character on this device">Clear all notes</button>`])}</span></div>
    ${campTabsHTML()}
    ${standingHTML()}
    ${dmPanelHTML()}
    ${partyChipsHTML(V)}
    ${c?campCharHTML(c)+charEditor(c):''}</div>`;
  if(c)bindChar(c);
  campLinkJoin();
}
function partyChipsHTML(V){const chip=x=>{const s=charStats(x),mx=+x.hpMax||0,hp=hpNow(x),pct=mx?Math.max(0,Math.min(100,hp/mx*100)):100;return `<button class="chip pc-tab${x.id===PARTY_SEL?' on':''}" onclick="PARTY_SEL='${x.id}';renderParty()">${x.portrait?`<img class="crest" src="${esc(x.portrait)}" alt="">`:classCrest(x.cls,x.name,30)}<span class="pc-tab-t"><b>${esc(x.name||'Unnamed')}</b> <small>Lv ${x.level||1} ${esc(x.cls||'')} · AC ${s.ac}${x.camp&&CL.user?' · 🌐'+(x._by?' '+esc(x._by.n||''):''):''}</small><span class="pc-hp" title="${hp} / ${mx||'?'} HP"><i style="width:${pct}%;background:${pct>50?'var(--green)':pct>25?'var(--gold)':'var(--red)'}"></i></span></span></button>`},row=L=>`<div class="chips" style="margin-bottom:14px">${L.map(chip).join('')}</div>`,v=campView(),L=campList();
  if(!PARTY.length)return `<div class="empty"><b>No characters yet</b>Add the party to track contracts, rivals, gear, and materials.</div>`;
  if(!V.length)return `<div class="empty"><b>No characters in ${esc(campViewName())} yet</b>${v==='solo'?'Every character is shared with a campaign.':'Open a character and choose this campaign under Share with, or build a new one.'} <div style="margin-top:10px"><button class="btn" type="button" onclick="campSetView('')">Show every character</button></div></div>`;
  if(v||!L.length)return row(V);
  const grp=(t,list)=>list.length?`<div class="camp-grp"><small>${t}</small>${row(list)}</div>`:'';
  return L.map(k=>grp(esc(k.name),V.filter(c=>c.camp===k.id))).join('')+grp('Not shared',V.filter(c=>!c.camp||!L.some(k=>k.id===c.camp)))}
function addChar(){const c={id:uid(),name:'New character',level:1,hpMax:10,hp:10,acBonus:0,attune:0,gear:[],inv:[],purse:{Human:0},specs:[]};const v=campView();if(v&&v!=='solo'&&typeof clIdOk==='function'){clIdOk(c);c.camp=v}PARTY.push(c);PARTY_SEL=c.id;saveParty();renderParty()}
function clearPartyNotes(){const n=PARTY.filter(c=>(c.notes||'').trim()).length;if(!n){toast('No notes to clear');return}if(!confirm('Delete the notes of '+n+' character'+(n>1?'s':'')+' on this device? This cannot be undone.'))return;PARTY.forEach(c=>{c.notes=''});saveParty();renderParty();toast('All party notes cleared')}
function exportParty(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(PARTY,null,2)],{type:'application/json'}));a.download='fand-party.json';document.body.appendChild(a);a.click();a.remove()}
// Imported characters: keep only objects, and reset any field whose type would crash the pages (a list that is not a list, and so on)
const CHAR_LISTS=['inv','extra','gear','undead','towerCards','schools','log','offered','custom','specs','features'],CHAR_MAPS=['spells','abil','spBound','purse','skillB','saveB','dmOk','raceOpts'];
function cleanChar(x){const o=Object.assign({},x);delete o.camp;delete o._by;delete o._cs;if(typeof o.id!=='string'||!o.id)o.id=uid();if(o.name!=null)o.name=String(o.name);
  CHAR_LISTS.forEach(k=>{if(k in o&&!Array.isArray(o[k]))delete o[k]});CHAR_MAPS.forEach(k=>{if(k in o&&(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k])))delete o[k]});
  ['level','hp','hpMax','profLv','prof2Lv'].forEach(k=>{if(k in o&&!isFinite(+o[k]))delete o[k]});
  // a portrait must be a small picture saved by the sheet (a base64 JPEG, PNG or WebP), nothing else
  if('portrait' in o&&!(typeof o.portrait==='string'&&o.portrait.length<400000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(o.portrait)))delete o.portrait;return o}
function importParty(inp){const f=inp.files[0];inp.value='';if(!f)return;f.text().then(t=>{let d;try{d=JSON.parse(t)}catch(e){}if(!Array.isArray(d)){toast('That file is not a FAND party export');return}
  const list=d.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).map(cleanChar);if(!list.length){toast('That file has no characters in it');return}
  if(PARTY.length&&!confirm('Replace the '+PARTY.length+' character'+(PARTY.length>1?'s':'')+' on this device with the '+list.length+' in the file?'))return;
  const old=PARTY;PARTY=list;saveParty();PARTY_SEL=null;renderParty();undoToast('Imported '+list.length+' character'+(list.length>1?'s':''),()=>{PARTY=old;saveParty();renderParty()})})}
function charEditor(c){
  const s=charStats(c),classes=[...new Set(SUBS.map(x=>x.par))].sort();
  const subs=SUBS.filter(x=>x.par===c.cls);
  const specsAll=specsFor(c);
  const coinRealms=REALMS.filter(r=>CURRENCY[r.n]&&CURRENCY[r.n].coin);
  const f=(k,l,type='text',extra='')=>`<label>${l}<input data-k="${k}" type="${type}" value="${esc(c[k]??'')}" ${extra}></label>`;
  return `<div class="cols" style="align-items:start">
   <div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="form">${f('name','Name')}${f('player','Player')}
      <label>Class<select data-k="cls"><option value=""></option>${classes.map(x=>`<option${x===c.cls?' selected':''}>${esc(x)}</option>`).join('')}</select></label>
      <label>Subclass<select data-k="sub"><option value=""></option>${subs.map(x=>`<option${x.n===c.sub?' selected':''}>${esc(x.n)}</option>`).join('')}</select></label>
      ${f('level','Level','number','min="1" max="100"')}${f('attune','Attunement','number','min="0" max="9"')}
      ${f('hp','HP','number')}${f('hpMax','Max HP','number')}
      ${f('acBonus','Other AC (traits, magic)','number')}
      ${f('profLv','Profession level','number','min="0" max="100"')}<label>Profession<select data-k="prof"><option value=""></option>${Object.keys(PROFS).filter(p=>p!==c.prof2).map(p=>`<option${p===c.prof?' selected':''}>${p}</option>`).join('')}</select></label>
      ${(c.prof||c.prof2)&&prof2Open(c).ok?`${f('prof2Lv','Second profession level','number','min="0" max="100"')}<label>Second profession<select data-k="prof2"><option value="">None</option>${Object.keys(PROFS).filter(p=>p!==c.prof).map(p=>`<option${p===c.prof2?' selected':''}>${p}</option>`).join('')}</select></label>`:''}
      <label class="full">Specialties<select data-k="specs" multiple size="${Math.min(6,Math.max(2,specsAll.length))}">${specsAll.map(x=>`<option${(c.specs||[]).includes(x)?' selected':''}>${esc(x)}</option>`).join('')}</select></label>
      <label>God contract<select data-k="god"><option value="">None</option>${GODS.map(g=>`<option value="${esc(godKey(g))}"${godKey(g)===c.god?' selected':''}>${esc(godKey(g))} (${esc(g.grp.replace(' Pantheon',''))})</option>`).join('')}</select></label>
      <label>Gained by${ctWayOpts(c.ctHow,'','data-k="ctHow"')}</label>
      <label>Contract rank<select data-k="rank"><option value=""></option>${CONTRACT_RANKS.map(r=>`<option${r===(OLD_RANK[c.rank]||c.rank)?' selected':''}>${r}</option>`).join('')}</select></label>
      <div class="full"><div class="note" style="margin:0 0 4px">More contracts (a character can serve several gods; a conflict of interest forces a choice)</div>${(c.extra||[]).map((x,i)=>`<span class="chip"${x.how?` title="${esc(ctWay(x.how))}"`:''}>${esc(x.god)} · ${esc(x.rank||'Minor')} <span style="cursor:pointer" onclick="rmContract('${c.id}',${i})" title="Remove">✕</span></span>`).join(' ')}
        <span class="keyrow" style="margin-top:4px"><select class="sel" id="xc-god"><option value="">Add a god…</option>${GODS.map(g=>`<option value="${esc(godKey(g))}">${esc(godKey(g))}</option>`).join('')}</select><select class="sel" id="xc-rank">${CONTRACT_RANKS.map(r=>`<option>${r}</option>`).join('')}</select>${ctWayOpts('','xc-how')}<button class="btn" type="button" onclick="addContract('${c.id}')">Add</button></span></div>
      <label class="full">Notes<textarea data-k="notes" rows="3" style="background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:7px 9px;color:var(--text);font:inherit">${esc(c.notes||'')}</textarea></label></div>
    <div style="display:flex;justify-content:space-between"><button class="btn" onclick="partyDelete('${c.id}')">Delete character</button><span style="display:flex;gap:8px"><button class="btn primary" onclick="(()=>{const d=prompt('What did they accomplish to earn this level?','');if(d===null)return;levelUp(PARTY.find(x=>x.id==='${c.id}'),d.trim()||'Accomplishment');renderParty()})()">⬆ Level up</button><button class="btn" onclick="go('craft')">Crafting planner →</button></span></div>
   </div>
   <div style="display:flex;flex-direction:column;gap:14px">
    <div class="panel">${kv([['AC',`${s.ac} <small style="font-weight:400;color:var(--muted)">(armor ${s.armorAC}${s.conAC?', CON '+sgn(s.conAC):''}${s.unAC?', unarmored +'+s.unAC:''}${s.styleAC?', Defense +1':''}${s.ct?', contract +'+s.ct.ac:''}${s.ac-s.armorAC-s.conAC-s.unAC-s.styleAC-(s.ct?s.ct.ac:0)?', other '+(s.ac-s.armorAC-s.conAC-s.unAC-s.styleAC-(s.ct?s.ct.ac:0)):''})</small>`],['Dodge',`${sgn(s.dodge)} <small style="font-weight:400;color:var(--muted)">(DEX: roll d20 + Dodge against an attacker\'s d20 + Accuracy)</small>`],['HP',`${c.hp===''||c.hp==null?(c.hpMax??'?'):c.hp} / ${c.hpMax??'?'}`],['Class stage',c.cls?(()=>{const si=stageInfo(c.cls,+c.level||1);return `<b>${esc(si.name)}</b>${si.k>1?` <small style="font-weight:400;color:var(--muted)">${ORDN(si.k)} change of ${esc(c.cls)}</small>`:''}<br><small style="font-weight:400;color:var(--muted)">Can use spells from: ${si.realms.map(esc).join(', ')}${si.k<10?` · next change at level ${stageStart(si.k+1)}`:''}</small>`})():''],['Spell slots',(()=>{const r=slotsFor(c.cls,+c.level||1);return !r?'':r.pact?`${r.n} × ${esc(r.lvl)}-level (short rest)`:r.slots.map((k,i)=>k?`${['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]} ${k}`:'').filter(Boolean).join(' · ')||'none yet'})()],['Armor drawbacks',s.drawback.length?`<ul style="margin:0;padding-left:16px;font-weight:400">${s.drawback.map(o=>`<li>${esc(o.d)} <small style="color:var(--muted)">(${esc(o.from.join(', '))})</small></li>`).join('')}</ul>`:'None'],['Contract',s.god?refChip(s.god,esc(godKey(s.god)))+(s.ct?' · '+esc(s.ct.r):''):'None']])}
      ${s.conflicts.map(x=>`<div class="callout" style="border-color:var(--red);margin-top:10px"><b style="color:var(--red)">Conflict of interest</b>: ${esc(godKey(x.a.g))} and ${esc(godKey(x.b.g))} both hold the ${x.shared.map(esc).join(', ')} Rune${x.shared.length>1?'s':''}. ${esc(c.name||'This character')} must choose a side and suffer the consequences.<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn" onclick="chooseSide('${c.id}',${esc(JSON.stringify(godKey(x.a.g)))},${esc(JSON.stringify(godKey(x.b.g)))})">Keep ${esc(godKey(x.a.g))} <small>(break ${esc(x.b.ct.r)})</small></button><button class="btn" onclick="chooseSide('${c.id}',${esc(JSON.stringify(godKey(x.b.g)))},${esc(JSON.stringify(godKey(x.a.g)))})">Keep ${esc(godKey(x.b.g))} <small>(break ${esc(x.a.ct.r)})</small></button></div></div>`).join('')}
      ${s.contracts.length>1?`<div class="note" style="margin-top:8px">Serving ${s.contracts.length} gods: ${s.contracts.map(x=>esc(godKey(x.g))+' ('+esc(x.ct.r)+')').join(', ')}. Natural AC doesn't stack; the highest rank counts.</div>`:''}
      ${s.god&&s.ct?`<div class="blk" style="margin-top:10px"><h4>Contract: ${esc(s.ct.r)} <em>Natural AC +${s.ct.ac}</em></h4><div style="font-size:.88rem;line-height:1.55"><b>Power:</b> ${esc(s.ct.power)}${(s.god.csp||[]).length?`<br><b>Spells:</b> ${s.god.csp.slice(0,ctSpellMax(s.ct)+1).map((n,lv)=>godSpellChip(n,lv)).join(' ')}`:''}<br><b>Reward:</b> ${contractReward(s.ct,s.god)}<br><b>Duties:</b> ${esc(s.ct.duty)}${CONTRACTS[CONTRACTS.indexOf(s.ct)+1]?`<br><b>Next rank (${CONTRACTS[CONTRACTS.indexOf(s.ct)+1].r}):</b> ${esc(CONTRACTS[CONTRACTS.indexOf(s.ct)+1].rise)}`:''}</div></div>`:''}
      ${s.rivals.length?`<div class="blk" style="margin-top:10px"><h4>Rival gods <em>they share a Rune with your patron</em></h4><div class="chips">${s.rivals.map(g=>refChip(g,esc(godKey(g)))).join('')}</div></div>`:''}
      <div class="blk" style="margin-top:10px"><h4>Realm Pressure <em>Attunement ${s.att}${s.att>(+c.attune||0)?' (from level or contract)':''}</em></h4><div class="chips">${REALMS.map(r=>{const d=r.pressure-s.att;return `<span class="chip" style="${d>0?'border-color:var(--red)':''}"><span class="sw" style="background:${r.color}"></span>${esc(r.n)} <small>${d>0?'strain +'+d+': '+['','disadv. on Con saves','+1 exhaustion/day','no long rests','1 exhaustion/hour'][Math.min(4,d)]:'safe'}</small></span>`}).join('')}</div></div></div>
    <div class="panel"><h4>Gear <em style="font-family:var(--sans);font-size:.75rem;color:var(--muted);font-weight:400">equipped Blueprints</em></h4>
      ${(c.gear||[]).length?GEAR_GROUPS.map(([g,t,ic])=>{const L=(c.gear||[]).map((n,i)=>({n,i})).filter(x=>gearGroup(x.n)===g);return L.length?`<div class="sh-lab" style="text-align:left;margin:8px 0 0">${ic} ${t}</div><div class="mlist" style="margin:4px 0">${L.map(({n,i})=>{const b=gearItem(n);return `<button ${b?`data-ref="${ref(b)}"`:''}>${esc(n)}<span class="x">${b?esc(b.cat||b.gr||'')+(b.ac?' · AC '+esc(b.ac):''):'item'} · ${esc(wornOn(b||n))}</span><span class="r" onclick="event.stopPropagation();rmGear('${c.id}',${i})" title="Unequip (back to the bag)">✕</span></button>`}).join('')}</div>`:''}).join(''):'<div class="mlist" style="margin:8px 0"><button disabled>Nothing equipped</button></div>'}${gearClashHTML(c)}
      <div class="keyrow">${gearDatalist(c)}<input class="sel" id="pg-add" list="dl-gear" placeholder="Equip anything: a Blueprint, material, or item…" style="max-width:none;flex:1"><button class="btn" onclick="addGear('${c.id}')">Add</button></div>
      ${(()=>{const at=s.gear.map(b=>{const fx=gearFx(b);return b.design&&b.design.dmg?{n:b.n,dmg:fxDmg(b.design.dmg,fx)+(b.design.vers?` (${fxDmg(b.design.vers,fx)} two-handed)`:''),atk:b.design.atk!=null||fx.atk?(+b.design.atk||0)+fx.atk:null,props:b.design.props}:b.dc&&b.dm&&!ARMOR_CATS.includes(b.cat)?{n:b.n,dmg:fxDmg(b.dc+' '+b.dm,fx),atk:fx.atk||null,props:genOf(b)&&BASES[genOf(b)].props||''}:null}).filter(Boolean);return at.length?`<div class="blk" style="margin-top:10px"><h4>Attacks <em>weapon Accuracy: add your ability modifier and proficiency</em></h4><div class="tablewrap"><table class="t"><tbody>${at.map(a=>`<tr><td><b>${esc(a.n)}</b>${a.props?`<br><small style="color:var(--muted)">${esc(a.props)}</small>`:''}</td><td class="num">${a.atk!=null?'Accuracy '+(a.atk>=0?'+':'')+a.atk:''}</td><td class="mono">${esc(a.dmg)}</td></tr>`).join('')}</tbody></table></div></div>`:''})()}
      ${s.traits.length?`<div class="blk" style="margin-top:10px"><h4>Active traits</h4><div class="mlist">${s.traits.map(({m,b})=>`<button data-ref="${ref(m)}" style="flex-direction:column;align-items:flex-start"><span><b style="color:var(--gold2)">◆ ${esc(m.tr.n)}</b> <span class="x">${esc(m.n)} in ${esc(b.n)}</span></span><span style="font-size:.8rem">${esc(m.tr.t)}</span></button>`).join('')}</div></div>`:''}</div>
    <div class="panel"><h4>Bag <em style="font-family:var(--sans);font-size:.75rem;color:var(--muted);font-weight:400">materials worth ${gp(s.invGp)}</em></h4>
      ${invHead(c)}<div class="mlist" style="margin:8px 0">${s.inv.map((x,i)=>`<button ${x.m||findBP(x.n)?`data-ref="${ref(x.m||findBP(x.n))}"`:''}><b style="width:38px">${x.q}×</b>${esc(x.n)}<span class="x">${esc(invLabel(x.n))}</span>${invRowBtns(c,x.n,i)}<span class="r">${x.m&&x.m.price?gp(x.m.price*x.q):''} <span onclick="event.stopPropagation();rmInv('${c.id}',${i})" title="Remove">✕</span></span></button>`).join('')||'<button disabled>Nothing carried</button>'}</div>
      <div class="keyrow"><input class="sel" id="pi-n" type="number" min="1" value="1" style="width:70px">${itemDatalist()}<input class="sel" id="pi-add" list="dl-item" placeholder="Add anything: a material, Blueprint, or item…" style="max-width:none;flex:1"><button class="btn" onclick="addInv('${c.id}')">Add</button></div></div>
    <div class="panel"><h4>Purse <em style="font-family:var(--sans);font-size:.75rem;color:var(--muted);font-weight:400">worth ${gp(Math.round(s.purseGp))}</em></h4>
      <div class="form" style="margin-top:8px">${coinRealms.map(r=>`<label>${esc(CURRENCY[r.n].coin)} <small style="text-transform:none;letter-spacing:0">(${esc(r.n)})</small><input type="number" min="0" data-purse="${esc(r.n)}" value="${(c.purse||{})[r.n]||0}"></label>`).join('')}</div></div>
   </div></div>`;
}
function bindChar(c){
  $('content').querySelectorAll('[data-k]').forEach(el=>el.addEventListener('change',()=>{
    const k=el.dataset.k;if(k==='ctHow'&&!el.value&&c.god){toast('A contract needs a way in: remove the god first to clear it');el.value=c.ctHow||'';return}
    if(k==='god'&&el.value&&(c.extra||[]).some(x=>x.god===el.value)){toast(el.value+' is already one of this character’s contracts');el.value=c.god||'';return}
    if(k==='god'&&el.value&&!c.ctHow){toast('Pick how the contract was gained first: a follower, a ritual, a temple, or an integrated item');el.value=c.god||'';const w=$('content').querySelector('[data-k="ctHow"]');if(w)w.focus();return}c[k]=el.multiple?[...el.selectedOptions].map(o=>o.value):el.type==='number'?+el.value:el.value;
    if(el.type==='number'){const lo=k==='level'?1:k==='acBonus'?-10:0,hi=k==='level'?MAX_LEVEL:k==='hp'&&+c.hpMax>0?+c.hpMax:1e6;c[k]=Math.min(hi,Math.max(lo,Math.round(+c[k]||0)));if(k==='hpMax'&&+c.hp>c[k])c.hp=c[k];if(k==='hpMax'&&(c.hp===''||c.hp==null)&&c[k]>0)c.hp=c[k]}
    if(k==='cls')c.sub='';if(k==='prof'||k==='prof2'){if(c.prof&&c.prof===c.prof2)c.prof2='';if(!c.prof&&c.prof2){c.prof=c.prof2;c.profLv=c.prof2Lv;c.prof2='';c.prof2Lv=''}if(k==='prof2'&&c.prof2&&!c.prof2Lv)c.prof2Lv=1;specsKeep(c)}saveParty();setTimeout(renderParty);
  }));
  $('content').querySelectorAll('[data-purse]').forEach(el=>el.addEventListener('change',()=>{c.purse=c.purse||{};c.purse[el.dataset.purse]=Math.max(0,Math.round(+el.value||0));saveParty();setTimeout(renderParty)}));
}
function addGear(id){const c=PARTY.find(x=>x.id===id),v=$('pg-add').value.trim();if(!v){toast('Type what to equip');return}const b={n:gearName(v)};c.gear=(c.gear||[]).concat(b.n);saveParty();renderParty()}
// ── cursed gear in play: gear made from an Abyssal cursed material carries its curse; it can't come off until the curse is lifted ──
const CURSE_PN=()=>CURSE_PN.s||(CURSE_PN.s=new Set(MATS.filter(m=>m.cursed&&m.pn).map(m=>m.pn)));
function gearCurses(n){const m0=findMat(n),b=findBP(n),out=new Map();
  if(!b&&m0){if(m0.cursed&&m0.pn)out.set(m0.pn,{pn:m0.pn,pot:m0.pot||0,from:m0.n});return [...out.values()]}
  if(!b)return [];gearPowers(b).forEach(p=>{if(p.k==='p'&&CURSE_PN().has(p.n))out.set(p.n,{pn:p.n,pot:p.pot||0,t:p.t})});
  const cap=bpPotCap(b);(b.mats||[]).map(findMat).filter(m=>m&&m.cursed&&m.pn).forEach(m=>{if(!out.has(m.pn))out.set(m.pn,{pn:m.pn,pot:Math.min(m.pot||0,cap),from:m.n})});return [...out.values()]}
function curseList(c){const off=c.curseOff||[];return (c.gear||[]).flatMap((n,i)=>gearCurses(n).map(k=>Object.assign({n,i,lifted:off.includes(n)},k)))}
const curseActive=c=>curseList(c).filter(k=>!k.lifted);
function curseText(k){const t=k.t||propAt(k.pn,k.pot)||'',i=t.indexOf('Cursed:');return i<0?[t,'']:[t.slice(0,i).trim(),t.slice(i+7).trim()]}
function curseBoxHTML(c){const L=curseList(c);if(!L.length)return '';
  return `<div class="sh-box cz-box"><div class="sh-row" style="gap:8px;align-items:baseline;flex-wrap:wrap"><b>☠ Cursed gear</b><span class="note" style="margin:0">It can't be taken off while the curse holds. <i>Remove Curse</i> (or your DM) lifts it.</span></div>
    ${L.map(k=>{const [gift,curse]=curseText(k);return `<div class="cz-row${k.lifted?' off':''}"><div><b>${esc(k.pn)}</b> on ${esc(k.n)}${k.pot?` <small>Potency ${k.pot}</small>`:''}${k.lifted?' <span class="b green">curse lifted</span>':''}
      ${gift?`<div class="cz-gift">${esc(gift)}</div>`:''}${curse?`<div class="cz-curse"><b>Curse:</b> ${esc(curse)}</div>`:''}</div>
      ${k.lifted?`<button class="btn sh-noprint" onclick="curseLift('${c.id}',${esc(JSON.stringify(k.n))},false)" title="The curse takes hold again">Curse again</button>`:`<button class="btn sh-noprint" onclick="curseLift('${c.id}',${esc(JSON.stringify(k.n))},true)">Remove curse</button>`}</div>`}).join('')}</div>`}
function curseLift(id,n,on){const c=PARTY.find(x=>x.id===id);if(!c)return;if(on&&!confirm(`Lift the curse on ${n}? Use this when Remove Curse is cast on it, or your DM says so. It can then be taken off; it stays a cursed item.`))return;
  c.curseOff=(c.curseOff||[]).filter(x=>x!==n);if(on)c.curseOff.push(n);if(!c.curseOff.length)delete c.curseOff;saveParty();if(TAB==='sheet')renderSheet();else if(TAB==='party')renderParty();toast(on?`The curse on ${n} is lifted: it can come off now`:`${n}'s curse holds again`)}
// a cursed item won't leave its wearer; once it does, its lifted mark goes with it
function curseBlocks(c,n){const k=curseActive(c).find(x=>x.n===n);if(!k)return false;toast(`${n} is cursed (${k.pn}): it won't come off until the curse is lifted. Use Remove curse on the sheet.`);return true}
const curseGone=(c,n)=>{if(c.curseOff&&!(c.gear||[]).includes(n)){c.curseOff=c.curseOff.filter(x=>x!==n);if(!c.curseOff.length)delete c.curseOff}};
// after a rest: one reminder of every curse that still holds
function curseRestNote(L){const hit=L.map(c=>[c,curseActive(c)]).filter(([,k])=>k.length);if(!hit.length)return;
  setTimeout(()=>actToast(`☠ After the rest, curses still hold: ${hit.map(([c,k])=>`${c.name||'Unnamed'} (${[...new Set(k.map(x=>x.pn))].join(', ')})`).join('; ')}`,'Open sheet',()=>{SHEET_ID=hit[0][0].id;store.set('sheetid',SHEET_ID);go('sheet')}),400)}
function rmGear(id,i){const c=PARTY.find(x=>x.id===id);if(curseBlocks(c,c.gear[i]))return;const n=c.gear.splice(i,1)[0];if(n){gearBack(c,n);curseGone(c,n)}saveParty();renderParty()}
function addInv(id){const c=PARTY.find(x=>x.id===id),v=$('pi-add').value.trim(),k=Math.max(1,+$('pi-n').value||1);if(!v){toast('Type what to add');return}invAdd(c,gearName(v),k,false,true);saveParty();renderParty()}
function rmInv(id,i){const c=PARTY.find(x=>x.id===id);c.inv.splice(i,1);saveParty();renderParty()}

