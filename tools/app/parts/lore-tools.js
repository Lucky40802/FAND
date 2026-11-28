// ── Lore ──────────────────────────────────────────────────────
// the twenty-one heroes who keep Infinatas's balance: named NPCs, each past the level cap at 999.
// Their names and stories are the campaign owner's to reveal; fill an entry's n and t as they are decided.
const BALANCE_KEEPERS=Array.from({length:21},()=>({n:'',t:''}));
function balanceKeepersHTML(){return `<p>Infinatas does not keep the balance alone. Twenty-one heroes serve as his <b>Balance Keepers</b>: mortals who broke through the level cap and now stand at <b>level 999</b>, far beyond the level 100 any other mortal can reach. They answer to no god and hold no contract. They step in only when the balance itself is at stake, and they leave the rest of Vestige to the gods and the mortals who live in it.</p>
  <div class="mlist" style="margin-top:10px">${BALANCE_KEEPERS.map((k,i)=>`<div style="padding:6px 10px;border:1px ${k.n?'solid var(--gold)':'dashed var(--line)'};border-radius:8px"><b>${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][i]}. ${k.n?esc(k.n):'<span style="color:var(--muted)">Not yet revealed</span>'}</b> <small style="color:var(--muted)">level 999</small>${k.t?`<div style="font-size:.84rem">${esc(k.t)}</div>`:''}</div>`).join('')}</div>`}
function renderLore(){
  const pantheons={};GODS.forEach(g=>{(pantheons[g.grp]=pantheons[g.grp]||[]).push(g)});
  const runes=[...RUNE_GODS].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
  const prog=MATS.filter(m=>m.pn==='Progenitor Piece');
  const groups=(arr)=>{const o={};arr.forEach(e=>{(o[e.grp]=o[e.grp]||[]).push(e)});return o};
  const toc=[['cosmos','Infinatas and Inane'],['keepers','The Twenty-One'],['timeline','Timeline'],['tree','Rune family tree'],['wars','The god wars'],['towers','Towers and hidden classes'],['pantheons','The pantheons'],['runes','Runes'],['realms','The realms'],['progenitors','The progenitors'],['powers','Other powers'],['contracts','Contracts and the Hand']];
  const sec=(id,title,body,sub)=>`<section class="rule" id="lore-${id}"><h3>${title}</h3>${sub?`<div class="src">${sub}</div>`:''}${body}</section>`;
  $('content').innerHTML=`<div class="page">
    <section class="hero" style="margin-bottom:18px"><h2>The Lore of Vestige</h2><p>What is known of the powers that shape FAND: the being above the gods, the gods who came here as refugees, the Runes they fight over, and the realms they rule.</p></section>
    <div class="rules"><nav class="toc">${toc.map(([id,t])=>`<a href="#lore-${id}" onclick="document.getElementById('lore-${id}').scrollIntoView();return false">${t}</a>`).join('')}</nav><div>
    ${sec('cosmos','Infinatas and Inane',cosmologyHTML(true)+`<p style="margin-top:12px">Above every god stands <b>Infinatas</b>, the creator of all things, whose only concern is balance. Infinatas keeps it by creating. <b>Inane</b>, Infinatas's other self, keeps the same balance by destroying. The gods did not know what Inane was; they only saw their world wear away until nothing was left. Infinatas let them into this realm, but the gods of Vestige are guests, and they live by Infinatas's rules.</p><p><b>Infinatas cannot stay dead.</b> If he is ever killed, Inane takes over and destroys everything, what remains of Infinatas included, until nothing is left. Only then does Infinatas return, and he creates everything again. Killing the creator does not end him; it ends the world.</p>${noteByName('Infinatas')||noteByName('Infinitas')?`<p class="note">Read the full vault entry: <a href="#" data-ref="${ref(noteByName('Infinatas')||noteByName('Infinitas'))}">Infinatas</a>.</p>`:''}<p class="note">Infinatas has its own Rune page and Blueprints in the vault, such as <a href="#" data-ref="${ref(BPS.find(b=>/^Infinatas's/.test(b.n))||BPS[0])}">${esc((BPS.find(b=>/^Infinatas's/.test(b.n))||{}).n||'')}</a>.</p>`)}
    ${sec('keepers','The Twenty-One: Infinatas\'s Balance Keepers',balanceKeepersHTML(),'Named NPCs, still to be revealed')}
    ${sec('timeline','Timeline',`<ol style="padding-left:20px;display:flex;flex-direction:column;gap:8px">
      <li><b>The beginning.</b> Infinatas creates all things.</li><li><b>Before the gods came.</b> Infinatas keeps the balance of this realm through creation.</li>
      <li><b>The erosion.</b> The gods' own world erodes away, worn down by Inane, an entity the gods cannot name.</li>
      <li><b>The arrival.</b> Infinatas allows the surviving gods into this realm under strict regulation.</li>
      <li><b>The Hands.</b> Each god binds mortals by contract, from Minor up to the five Fingers that make up its Hand. ${GODS.reduce((a,g)=>a+(g.hand||[]).length,0)} Fingers are named so far.</li>
      <li><b>The rivalries.</b> ${CONTESTED.length} Runes are claimed by more than one god, and every shared Rune is a feud.</li>
      <li><b>The god wars.</b> Open war between gods is forbidden, so the feuds over shared Runes are fought through contracts and Fingers. <a href="#lore-wars" onclick="document.getElementById('lore-wars').scrollIntoView();return false">See every front below.</a></li>
      <li><b>If Infinatas falls.</b> Inane takes over and unmakes everything, Infinatas included, until nothing is left; then Infinatas returns and creates it all again.</li></ol>`,'Known so far, in order')}
    ${sec('tree','Rune family tree',runeTreeHTML(),'Built from the vault\'s Rune lineage')}
    ${sec('towers','Towers and hidden classes',`<p>Not every Rune has a god. The excess energy of the unclaimed Runes pools and rises into <b>Towers</b>, up to five in every realm (${TOWERS.length} in all), taller the deeper the realm (${REALMS.map(r=>esc(r.n)+' '+towersIn(r.n).length+'×'+towerOf(r.n).floors).join(', ')} floors).</p><p>Climbing them, or finishing certain quests, unlocks the <b>hidden classes</b>: <b>Unique</b> classes, one of a kind, held by one person at a time; <b>Epic</b> classes, specialisations of a basic class; and <b>Legendary</b> classes, which follow the progenitors of the Runes.</p><p>Hidden classes scale with their holder: their dice grow every 10 levels like spells, and at each class change (21, 41, 61, 81) the hidden class turns II to V, its limited-use features gaining a use per stage.</p><p class="note"><a href="${pageUrl('towers')}" data-go="towers">The Towers →</a> · <a href="${pageUrl('hidden')}" data-go="hidden">Hidden classes →</a></p>`,'The campaign\'s rules')}
    ${sec('wars','The god wars',godWarsHTML(),'Draft built from the vault\'s data: every Rune held by more than one god')}
    ${sec('pantheons','The pantheons',`<p>${GODS.length} gods from ${Object.keys(pantheons).length} pantheons now live in Vestige. Most make their homes in ${(()=>{const c={};GODS.forEach(g=>{if(g.home)c[g.home]=(c[g.home]||0)+1});return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([r,n])=>esc(r)+' ('+n+')').join(', ')})()}.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">${Object.entries(pantheons).map(([p,gs])=>`<div><b style="font-family:var(--serif)">${esc(p)}</b> <span class="note">${gs.length} gods</span><div class="chips" style="margin-top:4px">${gs.map(g=>refChip(g,esc(godKey(g)),g.home||'')).join('')}</div></div>`).join('')}</div>
      <p class="note"><a href="${pageUrl('gods')}" data-go="gods">Browse the gods →</a></p>`)}
    ${sec('runes','Runes',`<p>Every god holds one or more Runes, the domains of its power, and every Rune had a progenitor: its original holder, who vanished or was killed before the gods arrived and inherited what was left. <a href="${pageUrl('runes')}" data-go="runes">Meet the progenitors on the Runes page →</a></p><p> <b style="color:var(--red)">Contested</b> Runes are held by more than one god; those gods are rivals.</p>
      <div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>Rune</th><th>Held by</th></tr></thead><tbody>${runes.map(([r,gs])=>`<tr><td style="white-space:nowrap">${RUNE_IDX.get(lc(r))?`<a href="#" data-ref="${ref(RUNE_IDX.get(lc(r)))}" style="text-decoration:none">`:''}<b style="${gs.length>1?'color:var(--red)':''}">ᚱ ${esc(r)}</b>${RUNE_IDX.get(lc(r))?'</a>':''}${gs.length>1?' <span class="b red">contested</span>':''}</td><td><div class="chips">${gs.map(g=>refChip(g,esc(godKey(g)))).join('')}</div></td></tr>`).join('')}</tbody></table></div>`,runes.length+' Runes · '+CONTESTED.length+' contested')}
    ${sec('realms','The realms',`<p>Eleven realms in ten tiers. The deeper the tier, the stronger its materials and the heavier its Pressure on travelers.</p><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${REALMS.map(r=>{const c=CURRENCY[r.n]||{};const gods=GODS.filter(g=>g.home===r.n);return `<div style="border-left:3px solid ${r.color};padding:4px 12px"><a href="#" data-ref="${ref(r)}" style="font-family:var(--serif);font-weight:700;color:${r.color};text-decoration:none">${esc(r.n)}</a> <span class="note">tier ${r.tier} · Pressure ${r.pressure}${c.coin?' · coin: '+esc(c.coin):' · no coin'}${gods.length?' · '+gods.length+' gods at home':''}</span><p style="margin-top:2px">${esc(REALM_BLURB[r.n]||'')}</p></div>`}).join('')}</div>`)}
    ${sec('progenitors','The progenitors',`<p>Every Rune once had a progenitor, its original holder. ${RUNES.filter(r=>r.fig.fate==='Killed').length} were killed and ${RUNES.filter(r=>r.fig.fate==='Vanished').length} vanished; only the Runes of Infinatas and Inane were never lost. <a href="${pageUrl('runes')}" data-go="runes">All progenitors →</a></p><p>The Primordial Realm belongs to the progenitors, older than the gods. Their remains count as Primary pieces toward the elemental classes.</p><div class="mlist" style="margin-top:10px">${prog.map(m=>`<button data-ref="${ref(m)}"><b style="color:var(--gold2)">${esc(m.n.split(' ')[0])}</b> ${esc(m.n)}<span class="x">${esc((m.ds||'').replace(/\. Property:.*$/,''))}</span></button>`).join('')}</div>
      <p class="note">Divine Spark materials (${MATS.filter(m=>m.pn==='Divine Spark').length}) hold fragments of a god's power and are sought by gods and their Fingers.</p>`)}
    ${sec('powers','Other powers',`${[['Demons and devils',DEMONS,'demons'],['Warlock patrons',PATRONS,'patrons']].map(([t,arr,tab])=>`<h4 style="margin:6px 0">${t}</h4><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">${Object.entries(groups(arr)).map(([g,es])=>`<div><b>${esc(g)}</b> <span class="note">${es.length}</span><div class="chips" style="margin-top:4px">${es.slice(0,12).map(e=>refChip(e,esc(e.n.split(' - ')[0]))).join('')}${es.length>12?`<button class="chip" data-go="${tab}" data-setup='${esc(JSON.stringify({side:g}))}'>+${es.length-12} more</button>`:''}</div></div>`).join('')}</div>`).join('')}`)}
    ${sec('contracts','Contracts and the Hand',`<ul><li>Mortals serve the gods by contract, in ten ranks from <b>Minor</b> up to <b>1st Finger</b>.</li><li>No one signs with a god they have never reached: a contract comes only through one of the god's followers, a ritual with its core material, its temple, or an item integrated with it.</li><li>The five Fingers together form the god's <b>Hand</b>. Each rank brings spells, AC, duties, and rewards.</li><li>A contractor is expected to stay loyal to one god. Breaking a contract and the death of a god have their own rules: <a href="${pageUrl('rules')}#rule-contracts" data-go="rules">ranks, rewards, duties, and breaking a contract</a>.</li><li>Gods that share a Rune are rivals, and so are their Hands.</li></ul><p class="note"><a href="${pageUrl('rules')}" data-go="rules">God Contracts in the rules →</a></p>`)}
    </div></div></div>`;
}

// ── Tools ─────────────────────────────────────────────────────
// Merchant shops: which material categories and Blueprint professions each kind of shop stocks.
const SHOP_KINDS=[['smith','Smithy and armorer'],['bowyer','Bowyer and woodworker'],['tanner','Tanner and tailor'],['alch','Alchemist and herbalist'],['jewel','Jeweler and gem cutter'],['arcane','Arcane curios'],['butcher','Monster-parts dealer'],['general','General store']];
const SHOP_STOCK={smith:{cats:['O','S'],bp:['Blacksmithing'],gens:/Axe|Sword|Dagger|Hammer|Spear|Cuirass|Helm|Gauntlets|Boots|Shield|Mace|Pike|Halberd|Glaive|Flail|Maul|Pick|Rapier|Scimitar|Morningstar/},
  bowyer:{cats:['W'],bp:['Carving'],gens:/Bow|Crossbow|Quarterstaff|Staff|Club|Spear|Javelin|Dart|Shield/,cat:/^Ammunition$/,ammo:['bow','crossbow','sling','parts']},tanner:{cats:['F'],bp:['Tailoring'],gens:/Cloak|Boots|Gauntlets|Cuirass|Whip|Sling|Net/,cat:/^Clothing$/},
  alch:{cats:['L','W'],bp:['Alchemy'],cat:/^(Potion|Poison|Oil & Coating|Explosive)$/,ammo:['blowgun']},jewel:{cats:['G'],bp:['Enchanting'],gens:/Ring|Amulet|Orb/,cat:/^(Jewelry|Talisman)$/},arcane:{cats:['E','G'],bp:['Enchanting'],gens:/Wand|Orb|Staff|Amulet|Ring/,cat:/^(Glyph|Arcane Core|Relic|Focus)$/},
  butcher:{cats:['B','L','F'],bp:[],harvest:true},general:{cats:['U','W','F','O'],bp:['Cooking','Engineering','Navigation','Harvesting'],cat:/^(Tool|Food|Map|Instrument|Navigation|Light Source|Storage|Vessel|Restraint|Book)$/,ammo:['bow','crossbow','sling','firearm']}};
// Shops charge 50% over the list price (campaign rule); they still buy at half the list price
const SHOP_MARKUP=1.5;
// Imports (owner-approved, 2026-11-03): besides its own realm's goods, every market keeps a small shelf of materials from
// other realms the buyer's stage has opened (never deeper), at a steep import markup, a lower grade cap, and one or two of
// each. Anything else is a special order for the DM to arrange. reach = the highest stage the buyer can travel to.
const IMPORT_MARKUP=2.5;
function rollShop(realm,kind,size,seed,reach){
  const R=rng32(seed),K=SHOP_STOCK[kind],r=REALM[realm];if(!r||!r.base)return null;
  const maxG=[0,3,5,7,10][size],nMat=[0,5,8,11,14][size],nBp=[0,2,4,6,8][size];
  const pool=MATS.filter(m=>m.realm===realm&&m.price&&m.g<=maxG&&K.cats.includes(matCode(m))&&(K.harvest?true:!m.gen)&&!(m.tier>=8));
  const pick=(arr,n)=>{const a=arr.slice(),o=[];while(a.length&&o.length<n){o.push(a.splice(Math.floor(R()*a.length),1)[0])}return o};
  const staple=K.harvest?pool:pool.filter(m=>m.org!=='Creature'),rest=pool.filter(m=>!staple.includes(m));
  const chosen=pick(staple,nMat);if(chosen.length<nMat)chosen.push(...pick(rest,nMat-chosen.length));
  const mats=chosen.sort((a,b)=>a.g-b.g||byName(a,b)).map(m=>({m,q:1+Math.floor(R()*(m.g<=3?8:m.g<=6?4:2)),price:Math.round(m.price*SHOP_MARKUP*(0.85+R()*0.3))}));
  // what a shop of this size stocks: up to level 20 in the Human and Mysterious realms (by size), and in a deeper realm its
  // band's first levels (a bigger shop reaches further into the band)
  const lvCap=r.tier<=2?maxG*2:(r.tier-1)*10+maxG,lvOk=b=>b.lv<=lvCap&&(r.tier<=2||b.lv>(r.tier-2)*10);
  const bps=pick(BPS.filter(b=>lvOk(b)&&!(b.ammo&&!(K.ammo||[]).includes(b.ammo.fits))&&(K.bp.includes(b.pr)||(K.gens&&genOf(b)&&K.gens.test(genOf(b)))||(K.cat&&K.cat.test(b.cat)))&&b.mats.every(n=>{const m=findMat(n);return !m||m.realm===realm||(REALM[m.realm]||{}).tier<=r.tier})),nBp)
    .map(b=>{const cost=b.mats.reduce((a,n)=>a+((findMat(n)||{}).price||0),0);return {b,price:Math.max(5,Math.round((cost*1.5+b.lv*15)*SHOP_MARKUP*(0.85+R()*0.3)/5)*5)}}).sort((a,b)=>a.b.lv-b.b.lv);
  // ammunition on the shelf: a bowyer or general store always has some for the weapons it serves, in bundles
  if(K.ammo){const have=new Set(bps.map(x=>x.b.n)),pool=BPS.filter(b=>b.ammo&&K.ammo.includes(b.ammo.fits)&&!have.has(b.n)&&(b.starter||lvOk(b)&&b.mats.every(n=>{const m=findMat(n);return !m||m.realm===realm||(REALM[m.realm]||{}).tier<=r.tier})));
    const plain=pool.filter(b=>b.starter),own=pool.filter(b=>!b.starter),n=[0,1,2,2,3][size]||1;
    [...pick(plain,1),...pick(own,n)].forEach(b=>{const cost=b.mats.reduce((a,m)=>a+((findMat(m)||{}).price||0),0);bps.push({b,price:b.gp!=null?Math.max(1,Math.round(b.gp*SHOP_MARKUP)):Math.max(5,Math.round((cost*1.5+b.lv*15)*SHOP_MARKUP*(0.85+R()*0.3)/5)*5)})});bps.sort((a,b)=>a.b.lv-b.b.lv)}
  const nIm=[0,1,2,3,4][size]||0,open=new Set(REALMS.filter(x=>x.n!==realm&&x.base&&tierStage(x.tier)<=(reach||1)).map(x=>x.n)),imG=Math.max(1,maxG-2);
  const imports=nIm&&open.size?pick(MATS.filter(m=>open.has(m.realm)&&m.price&&m.g<=imG&&K.cats.includes(matCode(m))&&(K.harvest||(!m.gen&&m.org!=='Creature'))&&!(m.tier>=8)),nIm)
    .sort((a,b)=>(REALM[a.realm].tier-REALM[b.realm].tier)||a.g-b.g||byName(a,b)).map(m=>({m,q:1+Math.floor(R()*2),price:Math.round(m.price*IMPORT_MARKUP*(0.9+R()*0.2))})):[];
  // ammunition is used up: a bundle costs a quarter of what an item of its level and materials would (everyday bundles keep their list price)
  bps.forEach(x=>{if(x.b.ammo&&x.b.gp==null)x.price=Math.max(1,Math.round(x.price/4))});
  return {mats,bps,imports};
}
// Stages (campaign owner's rules): every 20 levels is a stage, up to level 100. Levels 1-20 are a character's original
// class; at 21 it turns into the class II (Ranger II), at 41 III, at 61 IV, and at 81 V. Each stage opens the next band of
// realms (two realm tiers): I Human and Mysterious, II Hell, Heaven, and Chaos, III Abyss and Inner Realm, IV Outer Realm and
// Void, V Inner Void and Primordial. Professions use the same stages. Realms keep their difficulty order in 10-level bands
// (monster scaling, Tower level bands, spell power): bandOf(level) is that finer ladder.
const MAX_LEVEL=100,MAX_STAGE=5,ROMAN=['I','II','III','IV','V'];
const stageOf=lv=>Math.max(1,Math.min(MAX_STAGE,Math.ceil((+lv||1)/20)));
const stageStart=k=>(Math.max(1,k)-1)*20+1;
const stageEnd=k=>Math.max(1,k)*20;
const bandOf=lv=>Math.max(1,Math.min(10,Math.ceil((+lv||1)/10)));
const tierStage=t=>Math.max(1,Math.min(MAX_STAGE,Math.ceil((t||1)/2)));
const ORDN=k=>k+(k===1?'st':k===2?'nd':k===3?'rd':'th');
const TIER_NAMES=t=>REALMS.filter(r=>r.tier===t).map(r=>r.n).join(' and ');
const STAGE_REALMS=k=>REALMS.filter(r=>tierStage(r.tier)===k).map(r=>r.n);
const stageName=(cls,k)=>k>1?cls+' '+ROMAN[k-1]:cls;
// a subclass at a stage: its own name for that stage (Gloom Stalker II, …) and the features it has gained by level L
const subStage=(sub,k)=>typeof SUBSTAGES!=='undefined'&&SUBSTAGES[sub]?SUBSTAGES[sub].find(x=>x.stage===k):null;
const subStageName=(sub,k)=>{const x=subStage(sub,k);return x&&x.name||(k>1?sub+' '+ROMAN[k-1]:sub)};
const subFeats=(sub,k,L)=>{const x=subStage(sub,k);return x?(x.features||[]).filter(f=>f[0]<=L):[]};
function stageInfo(cls,lv){const k=stageOf(lv),st=k>1&&typeof STAGES!=='undefined'&&STAGES[cls]?STAGES[cls].find(x=>x.stage===k):null;return {k,name:stageName(cls,k),st,realms:REALMS.filter(r=>tierStage(r.tier)<=k).map(r=>r.n)}}
// A spell's realm: the home realm of the god holding its Rune (the most accessible one if several do); a Rune no god
// holds belongs to the realm whose Tower it feeds; a spell with no Rune is Human-realm magic open to everyone.
function spellRealm(s){
  if(s._realm!==undefined)return s._realm;
  const ru=s.rune&&RUNE_IDX.get(lc(s.rune));let realm='Human';
  if(ru){const homes=ru.gods.map(g=>REALM[g.home]).filter(Boolean).sort((a,b)=>a.tier-b.tier);if(homes.length)realm=homes[0].n;else{for(const [rn,list] of TOWER_RUNES)if(list.includes(ru)){realm=rn;break}}}
  return s._realm=realm;
}
const spellNeed=s=>tierStage((REALM[spellRealm(s)]||{tier:1}).tier);
// Spell power keeps pace with weapons (whose dice grow with Item Level) and deeper realms' monsters: a caster's damage and
// healing dice are multiplied by their stage (×1 at levels 1–10, ×2 at 11–20, … ×10 at 91–100). Flat numbers stay as written.
const spellAt=(d,k)=>String(d||'').replace(/(\d+)d(\d+)/g,(_,n,x)=>(n*Math.max(1,k||1))+'d'+x);
// a spell's dice: its damage line, or (when that is empty) the first damage or healing dice its text names, so spells
// written as "it takes 4d6 bludgeoning damage" scale with their realm too
function spellDmg(s){if(!s)return '';if(s._dmg!==undefined)return s._dmg;let d='';if(/\d+d\d+/.test(s.dmg||''))d=s.dmg;else{const t=s.desc||'',m=t.match(/(\d+d\d+(?:\s*[+]\s*\d+)?)\s+([a-z]+)\s+damage/i),h=t.match(/regains?\s+(\d+d\d+(?:\s*[+]\s*[^ ]+)?)\s+hit points/i);d=m?m[1]+' '+m[2].charAt(0).toUpperCase()+m[2].slice(1):h?h[1]+' healing':''}return s._dmg=d}
const spellScales=s=>!!spellDmg(s);
// DM approval (campaign owner's rule): spells that can break the game are locked; a character may learn or cast one only
// once the DM approves it for them (approvals are made on the character sheet with the DM passphrase entered).
const SPELL_LOCK_WHY={reality:'bends reality or time',death:'brings back the dead',kill:'kills or removes a foe with no fight',mind:'takes control of a mind',travel:'skips realm travel and Tower floors',copy:'makes copies, armies, or free materials',rune:'channels a Rune directly (a Primary spell)'};
const SPELL_LOCK={'Wish':'reality','Time Stop':'reality','Endless Moment':'reality','True Polymorph':'reality','True Reshaping':'reality','Shapechange':'reality','Mirage Arcane':'reality','The Final Question':'reality',
  'Revivify':'death','Raise Dead':'death','Resurrection':'death','True Resurrection':'death','Reincarnate':'death','Clone':'death',
  'Power Word Kill':'kill',"Death's Door":'kill','Imprisonment':'kill','Forcecage':'kill',
  'Dominate Person':'mind','Dominate Monster':'mind','Dominate Will':'mind','Geas':'mind','Mass Suggestion':'mind','Magic Jar':'mind','Planar Binding':'mind',
  'Gate':'travel','Plane Shift':'travel','Etherealness':'travel','Astral Projection':'travel','Teleport':'travel','Teleportation Circle':'travel','Word of Recall':'travel','Demiplane':'travel',
  'Simulacrum':'copy','Create Undead':'copy','Fabricate':'copy','Creation':'copy'};
const spellLock=s=>s?(SPELL_LOCK[s.n]?SPELL_LOCK_WHY[SPELL_LOCK[s.n]]:s.tier==='Primary'?SPELL_LOCK_WHY.rune:null):null;
// Realm-bound magic (campaign owner's rule): magic draws its power from the realm it comes from. A spell is bound to the
// realm where it is learnt and can be cast only there (a god's domain counts as the god's home realm). Its power is that
// realm's: damage and healing dice ×1 in the Human Realm, ×2 Mysterious, ×6 Hell and Heaven, … ×40 Primordial (DICE_MULT).
// A Rune spell can be learnt only in its own realm; a spell with no Rune can be learnt in any realm the caster's stage opens.
const realmPow=rn=>(REALM[rn]||{tier:1}).tier;
// The dice multiplier for each step (owner-approved, 2026-11-10): a realm tier or a 10-level band of 1-10 multiplies a
// player's spell and hidden-class dice by this table instead of by the step itself. A straight ×step fell behind from
// the third realm on, where monster HP jumps about 3.5× (median HP by realm: 51, 115, ~407, 665, 920, 1302, 1822,
// 2295, 2783, 3480); the table keeps a feature at about 60% of the pace of a same-realm monster's HP. Enemy NPC
// casters keep the plain ×band, so their spells don't outgrow the characters' hit points.
const DICE_MULT=[1,2,6,9,12,16,22,27,32,40];
const diceMult=k=>DICE_MULT[Math.max(1,Math.min(10,Math.round(+k||1)))-1];
// Sneak Attack (owner-approved, 2026-11-24): a Rogue's dice (1d6 per two levels, 10d6 at level 19) follow the same table by
// level band as spells, so a deep-realm Rogue keeps pace (alone, a Primordial monster took a Rogue 34 rounds, a Wizard 6).
// Enemy NPCs keep the plain dice, as their spells do.
const sneakBase=L=>Math.ceil(Math.min(+L||1,20)/2),sneakDice=L=>sneakBase(L)*diceMult(bandOf(L));
// Class damage riders (website rule, 2026-11-25): like Sneak Attack, the extra damage the martial classes add to their
// hits follows the level-band table, so it keeps pace with deep-realm monsters. Past the first band Rage's +2 to +4
// becomes that many d4 times the multiplier; Divine Smite, Improved Divine Smite and Hunter's Mark roll their dice
// times the multiplier, and so does a Warlock's Hex; a Monk's Martial Arts strike rolls its die (two of them from level 11) times the multiplier,
// and Flurry of Blows adds two strikes a turn. A Fighter's Action Surge is a whole extra turn
// once a fight (twice from level 17), which the Party check and the Balance report now count.
const rageBase=L=>L<9?2:L<16?3:4,maDie=L=>L<5?4:L<11?6:L<17?8:10,maBase=L=>L<11?1:2;
function classRiders(c){const L=+c.level||1,m=diceMult(bandOf(L)),has=k=>c.cls===k||c.cls2===k,R=[];
  if(has('Barbarian'))R.push(m>1?{n:'Rage',per:1,melee:1,dice:rageBase(L)*m,d:4,how:'on each melee hit while raging (its +'+rageBase(L)+' becomes '+rageBase(L)+'d4 × '+m+')'}:{n:'Rage',per:1,melee:1,flat:rageBase(L),how:'on each melee hit while raging'});
  if(has('Paladin')&&L>=2)R.push({n:'Divine Smite',once:1,melee:1,dice:2*m,d:8,how:'once a turn on a melee hit, for a spell slot (+'+m+'d8 per slot level above 1st)'});
  if(has('Paladin')&&L>=11)R.push({n:'Improved Divine Smite',per:1,melee:1,dice:m,d:8,how:'on every melee hit'});
  if(has('Ranger'))R.push({n:"Hunter's Mark",per:1,dice:m,d:6,how:'on each weapon hit against the marked creature'});
  if(has('Warlock'))R.push({n:'Hex',per:1,spell:1,dice:m,d:6,how:'on each hit against the hexed creature, spells included'});
  if(has('Monk'))R.push({n:'Martial Arts',strike:1,dice:maBase(L)*m,d:maDie(L),how:'per unarmed strike'+(maBase(L)*m>1?' ('+maBase(L)+'d'+maDie(L)+' × '+m+')':'')+'; Flurry of Blows adds two strikes a turn'});
  return R.map(r=>Object.assign(r,{avg:r.flat!=null?r.flat:r.dice*(r.d+1)/2,txt:r.flat!=null?'+'+r.flat:r.dice+'d'+r.d}))}
// Action Surge: one use from level 2, two at 17, three at 47 and four at 87 (the class changes' Action Surge features)
const surgeUses=c=>{if(c.cls!=='Fighter'&&c.cls2!=='Fighter')return 0;const L=+c.level||1;return L>=87?4:L>=47?3:L>=17?2:L>=2?1:0};
const wpnProps=b=>b.design?b.design.props||'':(genOf(b)&&BASES[genOf(b)]&&BASES[genOf(b)].props)||'',wpnRanged=b=>/Ammunition|ranged/i.test(wpnProps(b))||['Bow'].includes(b.cat);
// Spell power (owner-approved fix, 2026-11-03): a spell's dice are multiplied by the realm it is bound to OR by the caster's
// 10-level band (by DICE_MULT: ×1 at levels 1–10, ×2 at 11–20, ×6 at 21–30, … ×40 at 91–100), whichever is higher. With the realm alone, Human-realm
// spells stayed ×1 for a whole stage while weapon dice grew with Item Level and monster AC rose from about 4 to 17.
// Cantrips also take the usual cantrip steps on top (×2 at level 5, ×3 at 11, ×4 at 17), so they keep pace with a
// weapon's growing dice instead of vanishing against monster armor (site scaling pass, 2026-11-04).
const cantripStep=L=>(L=+L||1)>=17?4:L>=11?3:L>=5?2:1;
const spellPow=(c,rn,sp)=>Math.max(diceMult(realmPow(rn)),diceMult(bandOf(c&&c.level)))*(sp&&sp.lv===0?cantripStep(c&&c.level):1);
// Spellcasting focus (owner-approved, 2026-11-03): an equipped Wand, Orb, Staff, or Amulet adds to spell Accuracy and the
// spell save DC, and adds flat damage (or healing) to every spell that rolls dice, the way a weapon's main part adds to its
// hits. Only the best focus counts. A forged focus uses its Forge result; a ready-made one uses its Item Level
// (Accuracy and DC +Item Level ÷ 10, spell damage +Item Level ÷ 5, at least +1).
// Each kind of focus has its own buff (owner's request, 2026-11-04): a longer reach, a wider area, or an edge with
// certain schools, and its favoured schools take twice the focus's flat damage. rm range ×, ra range +ft, ar area +ft,
// tr touch spells reach that far, dc/acc +1 for the favoured schools.
const FOCUS_BUFF={
  Wand:{sch:['Evocation','Elemental'],rm:1.5,t:'spell range ×1.5'},
  Staff:{sch:['Nature Magic','Transmutation','Abjuration'],ra:30,t:'spell range +30 ft'},
  Rod:{sch:['Evocation','Runic Magic'],ar:5,t:'spell areas +5 ft'},
  Orb:{sch:['Divination','Illusion','Chronomancy'],ar:5,t:'spell areas +5 ft'},
  Amulet:{sch:['Healing','Abjuration','Celestial'],tr:30,t:'touch spells reach 30 ft'},
  Scepter:{sch:['Enchantment','Celestial','Infernal'],dc:1,t:'+1 save DC with its schools'},
  Tome:{sch:['Runic Magic','Divination','Chronomancy'],acc:1,t:'+1 spell Accuracy with its schools'},
  Totem:{sch:['Nature Magic','Elemental','Wild Magic'],ra:30,t:'spell range +30 ft'},
  'Holy Symbol':{sch:['Celestial','Healing'],ar:5,t:'spell areas +5 ft'},
  Crystal:{sch:['Psionics','Divination','Void Magic'],rm:1.5,t:'spell range ×1.5'},
  Lute:{sch:['Enchantment','Resonance'],dc:1,t:'+1 save DC with its schools'},
  Flute:{sch:['Illusion','Enchantment'],rm:1.5,t:'spell range ×1.5'},
  Drum:{sch:['Resonance','Evocation'],ar:10,t:'spell areas +10 ft'},
  Harp:{sch:['Healing','Enchantment','Resonance'],tr:30,t:'touch spells reach 30 ft'},
  'War Horn':{sch:['Resonance'],ar:15,t:'spell areas +15 ft'},
  Lyre:{sch:['Enchantment','Divination'],dc:1,t:'+1 save DC with its schools'},
  Viol:{sch:['Illusion','Shadow Magic'],ra:30,t:'spell range +30 ft'},
  Bagpipes:{sch:['Resonance','Evocation'],ar:10,t:'spell areas +10 ft'},
  'Pan Flute':{sch:['Nature Magic','Enchantment','Illusion'],rm:1.5,t:'spell range ×1.5'},
  Dulcimer:{sch:['Healing','Resonance'],ar:5,t:'spell areas +5 ft'},
  Shawm:{sch:['Resonance','Elemental'],ra:30,t:'spell range +30 ft'},
  Chimes:{sch:['Divination','Chronomancy','Celestial'],acc:1,t:'+1 spell Accuracy with its schools'}};
const focusBuffText=k=>{const B=FOCUS_BUFF[k];return B?`${B.t}; ${B.sch.join(', ')} spells take double the focus damage`:''};
// a spell's range with a focus's buff ('60 ft (15-ft radius)' → '90 ft (20-ft radius)'); unchanged when the buff doesn't touch it
function focusRange(r,F){r=String(r||'');const B=F&&F.buff;if(!B||!r)return r;let o=r;
  if(/^touch$/i.test(r.trim()))return B.tr?B.tr+' ft (touch)':r;
  if(B.rm||B.ra)o=o.replace(/^(\d+)(\s*(?:ft|feet))/i,(_,n,u)=>(B.rm?Math.round(n*B.rm/5)*5:+n+B.ra)+u);
  if(B.ar)o=o.replace(/(\d+)(-ft|-foot)(\s+(?:radius|cone|line|cube|sphere|square))/i,(_,n,u,w)=>(+n+B.ar)+u+w);return o}
// class focus properties: each adds +half its rank to its classes' spell Accuracy and save DCs, through its own kinds of focus
const CLASS_FOCUS={Virtuoso:{cls:['Bard'],inst:1,t:'a bard\'s instrument'},Devout:{cls:['Cleric','Paladin'],bases:['Holy Symbol','Amulet'],t:'a cleric\'s or paladin\'s holy symbol or amulet'},
  Wildbound:{cls:['Druid','Ranger'],bases:['Totem','Staff'],t:'a druid\'s or ranger\'s totem or staff'},Bloodspark:{cls:['Sorcerer'],bases:['Crystal','Orb'],t:'a sorcerer\'s crystal or orb'},
  Pactbound:{cls:['Warlock'],bases:['Rod','Scepter'],t:'a warlock\'s rod or scepter'},Arcanist:{cls:['Wizard','Artificer'],bases:['Wand','Tome'],t:'a wizard\'s or artificer\'s wand or tome'}};
const classFocusFits=(c,base,k)=>{const F=CLASS_FOCUS[k];if(!F||!c||!BASES[base])return false;return F.cls.some(x=>c.cls===x||c.cls2===x)&&(F.inst?BASES[base].cat==='Instrument':F.bases.includes(base))};
function focusOf(c){let best={acc:0,dmg:0,n:''};
  (c&&c.gear||[]).map(findBP).filter(b=>b&&!isForeign(b)).forEach(b=>{const base=b.design?b.design.base:genOf(b);if(!base||!BASES[base]||!BASES[base].focus)return;let f=null;
    if(b.design&&b.design.parts){try{const r=forgeResult(base,b.design.parts,{form:true});f={acc:+r.focusBonus||0,dmg:+r.focusDmg||0}}catch(e){}}
    if(!f){const il=+(b.il||b.lv||1);f={acc:Math.floor(il/10),dmg:Math.max(1,Math.floor(il/5))}}
    // Virtuoso (a bard's instrument material): +half its rank to a bard's spell Accuracy and save DCs through an instrument
    // (Virtuoso and the other class focus properties): the strongest one that fits this character and this kind of focus
    let vir=0,virN='';gearPowers(b).forEach(x=>{if(x.k!=='p'||!classFocusFits(c,base,x.n))return;const v=Math.ceil(potRank(x.pot||(b.design?((b.design.powers||[]).find(y=>y.n===x.n)||{}).pot:0)||1)/2);if(v>vir){vir=v;virN=x.n}});
    if(!best.n||f.acc+f.dmg+vir>best.acc+best.dmg+(best.vir||0))best={acc:f.acc+vir,dmg:f.dmg,vir,virN,n:b.n,kind:base,buff:FOCUS_BUFF[base]||null}});
  // no true focus: a component pouch serves as a plain one (a little spell damage, none of a focus's Accuracy or school edge)
  if(!best.n)(c&&c.gear||[]).map(findBP).filter(b=>b&&b.cpouch&&!isForeign(b)).forEach(b=>{const d=Math.max(1,Math.floor((+(b.il||b.lv||1))/10));if(!best.n||d>best.dmg)best={acc:0,dmg:d,n:b.n,kind:'Component Pouch',buff:null}});
  return best}
// the focus's flat damage, accuracy and DC for one spell: its favoured schools take double damage and the school edge
const focusFor=(F,sp)=>{if(!F||!F.n)return {dmg:0,acc:0,dc:0,fav:false};const B=F.buff,fav=!!(B&&sp&&B.sch.includes(sp.sc));return {dmg:(F.dmg||0)*(fav?2:1),acc:fav&&B.acc?1:0,dc:fav&&B.dc?1:0,fav}};
const focusDice=(d,F)=>F&&F.dmg?String(d).replace(/(\d+d\d+(?:\s*\+\s*\d+)?)/,m=>m+' + '+F.dmg):d;
const spellHome=sp=>sp&&sp.rune&&RUNE_IDX.get(lc(sp.rune))?spellRealm(sp):null;
const spellLearnIn=sp=>spellHome(sp)?[spellHome(sp)]:REALMS.map(r=>r.n);
// Spell slots, read from the vault's Spell Slots note (its tables: full casters, half casters, pact magic).
const CASTER={Bard:'full',Cleric:'full',Druid:'full',Sorcerer:'full',Wizard:'full',Paladin:'half',Ranger:'half',Artificer:'arti',Warlock:'pact'};
function slotTables(){if(slotTables.t)return slotTables.t;const n=noteByName('Spell Slots');if(!n)return null;const T=[];let cur=null;
  n.md.split('\n').forEach(l=>{if(/^\s*\|/.test(l)){if(/^\s*\|\s*-/.test(l))return;const c=l.split('|').slice(1,-1).map(x=>x.trim());if(!cur){cur={h:c,rows:[]};T.push(cur)}else cur.rows.push(c)}else cur=null});
  return slotTables.t={full:T[0],half:T[1],pact:T[2]}}
function slotsFor(cls,lv){const T=slotTables(),k=CASTER[cls];if(!T||!k)return null;const extra=lv>20?stageOf(lv)-1:0;lv=Math.max(1,Math.min(20,lv||1));
  if(k==='pact'){let row=null;T.pact.rows.forEach(r=>{if(+r[0]<=lv&&/\d/.test(r[1]))row=r});return row?{pact:true,n:+row[1]+extra,lvl:row[2],extra}:null}
  const t=k==='full'?T.full:T.half,L=k==='arti'?Math.min(20,lv+1):lv,row=t.rows.find(r=>+r[0]===L);if(!row)return null;
  const sl=row.slice(1).map(v=>(+v||0)+((+v||0)?extra:0));if(k==='arti'&&lv===1)sl[0]=2;return {slots:sl,extra}}
// Schools of magic (campaign owner's rule): a caster starts with ONE school and learns spells only from the schools they hold.
// Every level gives one school point: progress (+1 mastery in a school you hold) or open a new school (mastery 1). The highest
// spell level you can take from a school is half its mastery, rounded up (within what your class can cast), so a caster who
// stays in one school keeps the usual progression. Every school beyond the first costs 1 slot at each spell level (never
// below 1 at a level you have). Cantrips come from any school you hold.
// Choosing a school opens every spell in it, whatever class it lists (campaign rule: a spell's classes are only suggestions).
// Personal Signature schools belong to one character and are not offered.
const allSchools=()=>{const n={};SP.forEach(s=>{if(!/^Signature/.test(s.sc))n[s.sc]=(n[s.sc]||0)+1});return Object.entries(n)};
const schoolsOf=cls=>{const n={};SP.forEach(s=>{if((s.cls||[]).includes(cls))n[s.sc]=(n[s.sc]||0)+1});return Object.entries(n).sort((a,b)=>b[1]-a[1])};
const schoolMax=(cls,m,slots)=>{const cap=slots?(slots.pact?({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[slots.lvl]||1):slots.slots.reduce((a,v,i)=>v?i+1:a,0)):9;return Math.min(cap,Math.ceil((m||0)/2))};
function mcSlots(c,L1,L2){const list=[[c.cls,L1],[c.cls2,L2]].filter(([k,l])=>k&&l>0&&CASTER[k]);if(!list.length)return null;
  const np=list.filter(([k])=>CASTER[k]!=='pact');if(!np.length)return slotsFor(list[0][0],list[0][1]);if(np.length===1)return slotsFor(np[0][0],np[0][1]);
  const CL=np.reduce((a,[k,l])=>a+(CASTER[k]==='full'?l:CASTER[k]==='arti'?Math.ceil(l/2):Math.floor(l/2)),0);return slotsFor('Wizard',CL)}
function schoolSlots(slots,nSchools){const pen=Math.max(0,(nSchools||1)-1);if(!slots||!pen)return slots;
  if(slots.pact)return Object.assign({},slots,{n:Math.max(1,slots.n-pen),pen});return Object.assign({},slots,{slots:slots.slots.map(v=>v?Math.max(1,v-pen):0),pen})}
function realmOpts(sel,filter){return REALMS.filter(filter||(()=>true)).map(r=>`<option value="${esc(r.n)}"${r.n===sel?' selected':''}>T${r.tier} · ${esc(r.n)}</option>`).join('')}
/*__SBGEN__*/
// ════════════════════════════════════════════════════════════════
//  Stat block creator: NPCs, bosses, and named monsters, with a full profile (who they are, habits, goals, gear)
// ════════════════════════════════════════════════════════════════
const SB_BODIES=['humanoid','beast','bird','reptile','dragon','insect','aquatic','aberration','undead','construct','ooze','elemental','fiend','celestial','plant','giant','fey'];
const NPC_LOOKS=['a scar through one eyebrow','ink-stained fingers','a voice too soft for their size','mismatched eyes','a braid threaded with copper wire','a limp they never mention','burn marks along both arms','an immaculate coat, always','a tattoo of a Rune they do not hold','teeth filed to points','a crooked, friendly smile','hands that never stop moving'];
const NPC_HABITS=['counts their coins twice before every deal','hums the same three notes when thinking','never eats in front of strangers','sharpens a blade that is already sharp','quotes their god\'s law at every chance','keeps a journal of every lie they hear','always sits facing the door','feeds every stray animal they pass','touches iron before making a promise','talks to the dead as if they are listening','bargains for everything, even gifts','collects teeth from defeated foes'];
const NPC_PERSONA=['cold and exacting','warm until crossed','loud, proud, and generous','patient and quietly cruel','nervous but brilliant','devout to the point of blindness','cheerfully amoral','haunted and tired','ambitious and charming','honest to a fault'];
const NPC_BACK=['a former soldier of a fallen god\'s army','a guild crafter cast out for forbidden work','a Tower climber who turned back on the last floor','the heir of a merchant house','a temple orphan raised by contractors','a scavenger who once found a progenitor\'s bone','a refugee from a realm that wore away','a smuggler of Void-grade materials','a scholar of the Runes','an ex-Finger who lost their seat'];
const NPC_GOALS=['to claim an open Finger seat','to pay off a contract debt before it comes due','to find the Tower floor that holds a lost sibling','to steal a relic from a rival god\'s temple','to be left alone with their craft','to see Inane\'s work with their own eyes','to forge a weapon from a progenitor\'s remains','to break a contract without the curse','to buy passage to a deeper realm','to protect a village nobody else will'];
const BOSS_LAIRS=['the floor tilts toward its master, and every creature not touching it must make a Dexterity save or slide 10 feet','a Rune flares on the wall; spells of that Law cost the boss no slot until its next turn','the air thickens with the realm\'s Pressure; non-natives gain one level of strain until initiative 20 next round','shadows of its past victims rise and grapple one creature','the ground cracks, creating difficult terrain in a 20-foot radius'];
const BOSS_WEAK=['its old wound under the left arm (critical hits there deal an extra die)','the name of the god it betrayed (speaking it gives it disadvantage on its next attack)','silver from its home realm','its own reflection','music in a minor key','the Rune it never managed to claim'];
function sbMake(o){
  const R=rng32(o.seed||1),pk=a=>a[Math.floor(R()*a.length)];
  const realm=REALM[o.realm]||REALMS[0],L=Math.max(1,+o.level||1);
  let cr=o.cr||(o.kind==='npc'?String(Math.max(1,Math.min(30,Math.round(crFor(L)*0.8)))):'5');
  const name=o.name||(o.kind==='npc'?pk(NPC_FIRST)+' '+pk(NPC_LAST):o.kind==='named'?pk(['Gorrak','Vessimar','Old Teeth','Hollowmaw','Saint Ash','Kettle-Eye','the Pale Shepherd','Mother Thorn','Ironjaw','Cinderwife'])+' '+pk(['the Unbowed','of the Seventh Floor','Who Ate the Bridge','the Patient','the Last of Its Brood','the Tower-Warden','the Hungering','Twice-Slain']):pk(['Warden','Tyrant','Matriarch','Devourer','Sovereign','Horror','Colossus'])+' of the '+o.realm+' Tower');
  const body=o.kind==='npc'?'humanoid':(o.body||'beast'),txt=(o.kind==='npc'?'humanoid ':'')+(o.flavor||'');
  const g=Math.max(1,Math.min(10,Math.round(crNum(cr)/3)+1));
  const mat=o.mat&&findMat(o.mat);
  const m={n:name,txt,cr,g,tier:realm.tier,realm:realm.n};
  m.sb=SBGEN.statblock(m,body,mat&&mat.tr?mat:null);
  if(o.kind!=='npc'&&o.champ&&CLASS_DIE[o.champ]){const c=champion(m,o.champ,{fresh:true,sub:o.champSub,hc:o.champHc});m.sb=c.sb;m.champ=c.champ}
  const sb=m.sb,tr=sb.tr=(sb.tr||[]).slice(),ac2=sb.ac2=(sb.ac2||[]).slice();
  // NPC: class features, spellcasting, contract
  if(o.kind==='npc'&&o.cls){
    const si=stageInfo(o.cls,L),ca=CAST_ABIL[o.cls],slots=slotsFor(o.cls,L),abIdx={str:0,dex:1,con:2,int:3,wis:4,cha:5};
    // a person, not a monster: Medium, scores shaped by the class, HP from the class's hit die
    const prim={Fighter:'str',Barbarian:'str',Paladin:'str',Rogue:'dex',Ranger:'dex',Monk:'dex'}[o.cls]||ca||'str',top=15+Math.min(5,Math.floor(L/4)),base=[10,12,13,10,11,10];
    sb.ab=base.map(v=>v+Math.floor(R()*3)-1);sb.ab[abIdx[prim]]=top;if(prim!=='con')sb.ab[2]=Math.max(sb.ab[2],12+Math.floor(L/8));sb.sz='Medium';
    const die=CLASS_DIE[o.cls]||8,cm=Math.floor((sb.ab[2]-10)/2);sb.hp=Math.max(1,die+cm+(L-1)*(die/2+1+cm));sb.hd=L+'d'+die+(cm?(cm>0?' + ':' − ')+Math.abs(cm*L):'');
    const md=i=>Math.floor((sb.ab[i]-10)/2),SKC={Fighter:[['Athletics',0],['Perception',4]],Barbarian:[['Athletics',0],['Survival',4]],Paladin:[['Athletics',0],['Persuasion',5]],Rogue:[['Stealth',1],['Deception',5]],Ranger:[['Survival',4],['Stealth',1]],Monk:[['Acrobatics',1],['Insight',4]],Bard:[['Performance',5],['Persuasion',5]],Cleric:[['Religion',3],['Insight',4]],Druid:[['Nature',3],['Survival',4]],Sorcerer:[['Arcana',3],['Deception',5]],Warlock:[['Arcana',3],['Intimidation',5]],Wizard:[['Arcana',3],['History',3]],Artificer:[['Arcana',3],['Investigation',3]]}[o.cls]||[];
    sb.sk=SKC.map(([n,i])=>n+' '+sgn(md(i)+sb.pb)).join(', ');sb.se='passive Perception '+(10+md(4)+(SKC.some(x=>x[0]==='Perception')?sb.pb:0));
    // AC from the armor the class would wear (FAND's flat AC), plus the realm's gear
    sb.ac=Math.max(0,({Fighter:8,Paladin:8,Cleric:5,Barbarian:4,Ranger:4,Artificer:5,Rogue:3,Monk:3,Bard:3,Druid:3,Warlock:3,Wizard:1,Sorcerer:1})[o.cls]+Math.max(0,realm.tier-1)+Math.floor((sb.ab[2]-10)/2));
    sb.ty='humanoid';sb.al=pk(['any alignment','lawful neutral','neutral good','chaotic neutral','lawful evil','neutral']);
    if(ca){const scs=SP.length?schoolsOf(o.cls).slice(0,4):[],school=scs.length?scs[Math.floor(R()*scs.length)][0]:null;const i=abIdx[ca];sb.ab[i]=Math.max(sb.ab[i],14+Math.min(6,Math.floor(L/4)));const md=Math.floor((sb.ab[i]-10)/2),dc=8+sb.pb+md;
      tr.push(['Spellcasting',`${name} is a level ${L} ${si.name.toLowerCase()===o.cls.toLowerCase()?o.cls:si.name+' ('+o.cls+')'} spellcaster.${school?` Its school of magic is ${school}; it learns spells only from that school.`:''} Its spellcasting ability is ${({cha:'Charisma',wis:'Wisdom',int:'Intelligence'})[ca]} (spell save DC ${dc}, spell Accuracy +${sb.pb+md}). ${slots?slots.pact?`It has ${slots.n} pact slots of ${slots.lvl} level (short rest).`:'Slots: '+slots.slots.map((k,j)=>k?`${ORDN(j+1)} ${k}`:'').filter(Boolean).join(', ')+'.':''} It can cast spells from ${si.realms.length>1?'these realms':'this realm'}: ${si.realms.join(', ')}.${realmPow(realm.n)>1?` Its spells are bound to the ${realm.n} Realm, so their damage and healing dice are multiplied by ${realmPow(realm.n)}.`:''}${npcSpells(o.cls,si.k,slots,R,school,realmPow(realm.n))}`])}
    const CF=classCF(o.cls,L,realmPow(realm.n));
    if(CF)tr.push(CF);if(o.cls==='Artificer'){const AF=artEnemyFeat(sb,L);if(AF)tr.push(AF)}
    if(si.k>1&&si.st)si.st.features.forEach(f=>{if(f[0]<=L)tr.push([f[1]+' ('+si.name+')',f[2]])});
    const sub=o.sub&&L>=3&&SUBS.find(x=>x.n===o.sub&&x.par===o.cls);
    if(sub){const sn=subStageName(sub.n,si.k),fs=subFeats(sub.n,si.k,L);if(si.k===1||!fs.length)tr.push(['Subclass: '+sn,String(sub.ds||'').replace(/\s*\([^()]*\)\s*$/,'')]);fs.forEach(f=>tr.push([f[1]+' ('+sn+')',f[2]]))}
  }
  if(o.god){const g2=godByKey(o.god),ct=contractOf(o.rank||'Minor');if(g2&&ct){tr.push([`Contract: ${godKey(g2)} (${ct.r})`,ct.power+'. Natural AC +'+ct.ac+'.']);sb.ac+=ct.ac}}
  // boss and named: tougher, legendary, lair, second phase
  if(o.kind!=='npc'){
    if(o.kind==='boss'){sb.hp=Math.round(sb.hp*1.5);tr.push(['Second Phase','The first time it drops to half its hit points, it roars, ends every condition on itself, and takes an extra turn immediately.'])}
    if(!tr.some(t=>/Legendary Resistance/.test(t[0])))tr.push(['Legendary Resistance (3/Day)','If it fails a saving throw, it can choose to succeed instead.']);
    if(!sb.lg)sb.lg=[['Detect','It makes a Wisdom (Perception) check.'],['Attack','It makes one attack.'],['Surge (Costs 2 Actions)','It moves up to its speed without provoking opportunity attacks and makes one attack.']];
  }
  if(mat&&mat.tr&&!tr.some(t=>/Signature/.test(t[0])))tr.push(['Signature: '+mat.tr.n,voice2(mat.tr.t)]);
  // profile
  const P={look:pk(NPC_LOOKS),habit:pk(NPC_HABITS),persona:pk(NPC_PERSONA),back:pk(NPC_BACK),goal:pk(NPC_GOALS)};
  if(o.kind!=='npc'){P.lair=[pk(BOSS_LAIRS),pk(BOSS_LAIRS)].filter((x,i,a)=>a.indexOf(x)===i);P.weak=pk(BOSS_WEAK)}
  const rm=MATS.filter(x=>x.realm===realm.n&&!x.gen),rp=rm.filter(x=>x.price),gear=(rp.length?rp:rm).filter(x=>x.g<=g+1);P.carry=[...new Set([pk(gear),pk(gear)])].filter(Boolean);
  P.drops=o.kind==='npc'?[]:MATS.filter(x=>x.realm===realm.n&&x.gen&&Math.abs(x.g-g)<=1).sort(()=>R()-.5).slice(0,3);
  P.purse=Math.round((10+R()*60)*realmBase(realm.n)/5*Math.max(1,crNum(cr)));
  return {m,P};
}
// ════════════════════════════════════════════════════════════════
//  Champion enemies: any monster that has trained in a class. A champion is stronger than others of its kind: half
//  again the hit points, +1 AC (+2 in the armored classes), +2 Accuracy, +2 Dodge and +2 save DCs, its class's main scores
//  raised, and the class's features at a level set by its challenge (CR + 2, up to 20). It counts as 2 or more CR steps
//  higher, so it is worth more XP, and its corpse gives one extra roll of drops. Named "Wolf, Fighter Champion".
// ════════════════════════════════════════════════════════════════
const champClasses=()=>Object.keys(CLASS_DIE).sort(); // CLASS_DIE is defined further down, so read it when asked
const CR_STEPS=['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))];
const champLevel=m=>Math.max(1,Math.min(20,Math.ceil(crNum(m.sb?m.sb.cr:m.cr||1))+2));
// what each class adds as it levels, on top of its signature feature and spellcasting: [level, name, text]
const CHAMP_FEATS={
  Barbarian:[[1,'Reckless Attack','It can attack recklessly: advantage on its melee attacks this turn, and attacks against it have advantage until its next turn.'],[2,'Danger Sense','It has advantage on Dexterity saving throws against effects it can see.'],[5,'Extra Attack','It makes one more attack when it takes the Attack action or uses Multiattack.'],[9,'Brutal Critical','A critical hit with a melee attack rolls one extra damage die.'],[11,'Relentless Rage','If it drops to 0 hit points while raging, it can make a DC 10 Constitution saving throw to drop to 1 hit point instead (+5 to the DC each time).']],
  Fighter:[[2,'Action Surge (1/Short Rest)','It takes one extra action on its turn.'],[5,'Extra Attack','It makes one more attack when it takes the Attack action or uses Multiattack.'],[9,'Indomitable (1/Day)','It rerolls a saving throw it failed and must use the new roll.'],[11,'Extra Attack (2)','It makes two more attacks instead of one.'],[20,'Extra Attack (3)','It makes three more attacks instead of one.']],
  Paladin:[[1,'Lay on Hands','It has a pool of {L5} hit points it can restore by touch, to itself or an ally, as an action.'],[5,'Extra Attack','It makes one more attack when it takes the Attack action or uses Multiattack.'],[6,'Aura of Protection','It and its allies within 10 feet add +{MOD} to their saving throws while it is conscious.']],
  Ranger:[[1,'Favored Prey','It has advantage on Wisdom (Survival) checks to track, and on its first attack each turn against a creature it has tracked.'],[5,'Extra Attack','It makes one more attack when it takes the Attack action or uses Multiattack.'],[11,'Volley','It can make a ranged attack against any number of creatures within 10 feet of a point it can see, with a separate roll for each.']],
  Rogue:[[2,'Cunning Action','As a bonus action it can Dash, Disengage, or Hide.'],[5,'Uncanny Dodge','When an attacker it can see hits it, it can use its reaction to halve the damage.'],[7,'Evasion','When it makes a Dexterity saving throw to take half damage, it takes none on a success and half on a failure.']],
  Monk:[[2,'Unarmored Movement','Its walking speed is 10 feet higher (included above).'],[3,'Deflect Missiles','It can use its reaction to reduce the damage of a ranged weapon attack by 1d10 + {L}.'],[5,'Stunning Strike','When it hits with a melee attack, the target must succeed on a DC {DC} Constitution saving throw or be stunned until the end of its next turn.'],[7,'Evasion','When it makes a Dexterity saving throw to take half damage, it takes none on a success and half on a failure.']],
  Cleric:[[2,'Turn Undead','As an action, each undead within 30 feet that can see or hear it must succeed on a DC {DC} Wisdom saving throw or be turned for 1 minute.'],[8,'Divine Strike','Once on each of its turns when it hits, it deals an extra 1d8 radiant damage (2d8 at level 14).']],
  Druid:[[2,'Wild Shape','It can become a beast twice per short rest, keeping its own hit points as a second pool.'],[18,'Timeless Body','It ages one year for every ten.']],
  Wizard:[[2,'Arcane Ward','When it casts a spell of 1st level or higher, it gains a ward with {L2} temporary hit points.']],
  Sorcerer:[[3,'Quickened Spell','It can spend 2 sorcery points to cast a spell that takes an action as a bonus action instead.']],
  Warlock:[[2,'Agonizing Blast','Each beam of its Eldritch Bolt adds +{MOD} to its damage.'],[5,'Pact Weapon','Its natural attacks count as magical.']],
  Bard:[[3,'Cutting Words','When a creature it can see within 60 feet makes an attack roll, ability check, or damage roll, it can use its reaction to subtract a Bardic Inspiration die from the roll.'],[6,'Countercharm','It and allies within 30 feet have advantage on saving throws against being frightened or charmed.']],
  Artificer:[[3,'Eldritch Cannon','As an action it creates a small cannon that, on its turn, blasts a 15-foot cone (DC {DC} Dexterity save, 2d8 fire damage) or heals an ally 1d8 hit points.'],[7,'Flash of Genius','When it or an ally within 30 feet makes a check or save, it can add +{MOD} with its reaction.']]
};
const CHAMP_CACHE=new Map();
// o: {sub: a subclass of cls, hc: a hidden class, fresh: skip the cache}. A subclass needs class level 3, so it lifts the
// champion to at least level 3. A hidden class is a bonus class held alongside (its level is the champion's level): its
// features at class levels 1, 7 and 14, one more CR step, and a quarter more hit points. A hidden class shows only once
// the Hidden classes list is unlocked; until then it is named but sealed.
function champion(m,cls,o){
  o=o===true?{fresh:true}:o||{};
  if(!m||!m.sb||!CLASS_DIE[cls])return m;const S=o.sub?SUBS.find(x=>x.n===o.sub&&x.par===cls):null,H=o.hc&&HC?HC.find(x=>x.n===o.hc):null;
  const key=[m.n,cls,S?S.n:'',o.hc||'',H?1:0].join('|');if(!o.fresh&&CHAMP_CACHE.has(key))return CHAMP_CACHE.get(key);
  const L=Math.max(champLevel(m),S?3:1),b=JSON.parse(JSON.stringify(m.sb)),R=rng32(hashStr(key)),abIdx={str:0,dex:1,con:2,int:3,wis:4,cha:5};
  const name=m.n+', '+cls+' Champion'+(S?' · '+S.n:'')+(o.hc?' ✦ '+o.hc:''),main=(CLASS_MAIN[cls]||[]).concat(CAST_ABIL[cls]?[CAST_ABIL[cls]]:[]);
  [...new Set(main)].forEach(k=>{const i=abIdx[k];b.ab[i]=Math.min(30,Math.max(b.ab[i]+2,14+Math.floor(L/4)))});
  const md=i=>Math.floor((b.ab[i]-10)/2),key1=abIdx[CAST_ABIL[cls]||(CLASS_MAIN[cls]||['str'])[0]],mod=md(key1);
  b.hp=Math.round(b.hp*(o.hc?1.75:1.5));b.hd+=o.hc?', ×1.75 for a champion with a hidden class':', ×1.5 for a champion';b.ac+=({Fighter:2,Paladin:2,Cleric:2}[cls]||1);
  const steps=2+Math.floor(L/6)+(o.hc?1:0),ci=CR_STEPS.indexOf(String(b.cr));b.cr=CR_STEPS[Math.min(CR_STEPS.length-1,(ci<0?4:ci)+steps)];b.xp=SBGEN.XP[b.cr]||b.xp;
  const c=crNum(b.cr);b.pb=c<1?2:2+Math.floor((c-1)/4);const dc=8+b.pb+mod;
  const up=t=>accText(t).replace(/Accuracy ([+−-])(\d+)/g,(a,s,n)=>'Accuracy '+sgn((s==='+'?1:-1)*+n+2)).replace(/DC (\d+)/g,(a,n)=>'DC '+(+n+2));
  b.ac2=b.ac2.map(([n,t])=>[n,up(t)]);b.dodgeB=(b.dodgeB||0)+2;b.tr=b.tr.map(([n,t])=>[n,up(t)]);if(b.lg)b.lg=b.lg.map(([n,t])=>[n,up(t)]);
  if(cls==='Monk'&&L>=2)b.sp=b.sp.replace(/^(\d+) ft\./,(a,n)=>(+n+(L<6?10:L<10?15:20))+' ft.');
  if(cls==='Ranger'&&!b.ac2.some(a=>/^Ranged/.test(a[1]))){const hit=b.pb+md(1)+2,dmg=Math.max(1,4+md(1));b.ac2.push(['Longbow',`Ranged Weapon Attack: Accuracy ${sgn(hit)}, range 150/600 ft., one target. Hit: ${dmg} (1d8 ${md(1)>=0?'+':'−'} ${Math.abs(md(1))}) piercing damage.`])}
  const fill=t=>t.replace(/\{DC\}/g,dc).replace(/\{MOD\}/g,Math.max(1,mod)).replace(/\{L5\}/g,5*L).replace(/\{L2\}/g,2*L).replace(/\{L\}/g,L);
  const feats=[['Champion ('+cls+' '+L+(S?', '+S.n:'')+')',`This ${m.n.toLowerCase()} has trained as a level ${L} ${cls}${S?' ('+S.n+')':''}${o.hc?', and holds the hidden class '+o.hc:''}. It is stronger than others of its kind: ${o.hc?'three quarters more':'half again the'} hit points, better armor, and +2 Accuracy, +2 Dodge, and +2 to its save DCs (all included above). Its corpse gives one extra roll of drops.`]];
  const cf=classCF(cls,L,realmPow(m.realm));if(cf)feats.push([cf[0],fill(cf[1])]);if(cls==='Artificer'){const AF=artEnemyFeat(b,L);if(AF)feats.push(AF)}
  (CHAMP_FEATS[cls]||[]).forEach(([lv,n,t])=>{if(lv<=L&&!(/^Extra Attack/.test(n)&&(CHAMP_FEATS[cls]||[]).some(f=>/^Extra Attack \(/.test(f[1])&&f[0]<=L&&f[0]>lv)))feats.push([n,fill(t)])});
  const ca=CAST_ABIL[cls],slots=ca&&slotsFor(cls,L);
  if(ca&&slots)feats.push(['Spellcasting',`It casts spells as a level ${L} ${cls} (spell save DC ${dc}, spell Accuracy ${sgn(b.pb+mod)}). ${slots.pact?`It has ${slots.n} pact slots of ${slots.lvl} level (short rest).`:'Slots: '+slots.slots.map((k,j)=>k?`${ORDN(j+1)} ${k}`:'').filter(Boolean).join(', ')+'.'}${npcSpells(cls,stageOf(L),slots,R,null,realmPow(m.realm))}`]);
  // a subclass's levels 3-20 are on the subclass itself (lv); a champion never passes level 20
  if(S){const sn=S.n,fs=(S.lv||[]).filter(f=>f[0]<=L);if(!fs.length)feats.push(['Subclass: '+sn,String(S.ds||'').replace(/\s*\([^()]*\)\s*$/,'')]);fs.forEach(f=>feats.push([f[1]+' ('+sn+')',up(f[2])]))}
  if(o.hc&&!H)feats.push(['✦ Hidden class: '+o.hc,'Sealed. Unlock the Hidden classes page to see what this class gives it.']);
  if(H){feats.push(['✦ Hidden class: '+H.n+' ('+H.tier+')',(H.blurb||'')+(H.tier==='Unique'&&hcHolders(H).length?' Unique: '+hcHolders(H).map(ch=>ch.name||'someone').join(', ')+' already holds it, so this champion took it from them or is its rightful holder.':'')]);
    hcTrack(H).filter(([lv])=>lv<=L).forEach(([lv,n,t])=>feats.push(['✦ '+n+' ('+H.n+')',up(hcScale(t,L))]))}
  b.tr=feats.concat(b.tr);
  const out=Object.assign({},m,{n:name,sb:b,champ:{base:m.n,cls,L,sub:S?S.n:'',hc:o.hc||''}});if(!o.fresh)CHAMP_CACHE.set(key,out);return out;
}
// "Wolf, Rogue Champion · Assassin ✦ Some Hidden Class", looked up in lower case
function champFromName(k,get){const r=/^(.*), (\w+) champion(?: · (.*?))?(?: ✦ (.*))?$/.exec(k);if(!r)return undefined;const base=get(r[1]),cls=champClasses().find(c=>lc(c)===r[2]);if(!base||!cls)return undefined;
  const sub=r[3]&&SUBS.find(x=>lc(x.n)===r[3]&&x.par===cls),h=r[4]&&(HC&&HC.find(x=>lc(x.n)===r[4])),hc=r[4]?(h?h.n:r[4].replace(/\b\w/g,x=>x.toUpperCase())):'';
  return champion(base,cls,{sub:sub?sub.n:'',hc})}
const champSubs=cls=>SUBS.filter(x=>x.par===cls).sort(byName);
const champHCs=cls=>(HC||[]).filter(h=>!h.base||h.base==='Any'||h.base===cls).sort((a,b)=>HC_TIERS.findIndex(t=>t[0]===a.tier)-HC_TIERS.findIndex(t=>t[0]===b.tier)||byName(a,b));
// a random class, and usually one of its subclasses (hidden classes are the DM's own choice, never random)
const champRandom=m=>{const cs=champClasses(),cls=cs[Math.floor(Math.random()*cs.length)],ss=champSubs(cls);return champion(m,cls,{sub:ss.length&&Math.random()<.7?ss[Math.floor(Math.random()*ss.length)].n:''})};
// the Bestiary window remembers which class, subclass, and hidden class it shows for the monster that is open
let CHAMP_FOR=null,CHAMP_SEL='',CHAMP_SUB='',CHAMP_HC='',CHAMP_NEXT=null,CHAMP_HC_TRIED=false;
const champOpts=()=>({sub:CHAMP_SUB,hc:CHAMP_HC});
function champPickerHTML(m){const cls=CHAMP_SEL,lockLink=!HC&&HIDDEN.lock&&role()!=='player';
  return `<label>★ Champion <select class="sel" id="mon-champ" onchange="champPick('cls',this.value)"><option value="">None (a normal ${esc(m.n.toLowerCase())})</option>${champClasses().map(c=>`<option${c===cls?' selected':''}>${c}</option>`).join('')}</select></label>
    ${cls?`<label>Subclass <select class="sel" id="mon-champ-sub" onchange="champPick('sub',this.value)"><option value="">None</option>${champSubs(cls).map(x=>`<option${x.n===CHAMP_SUB?' selected':''}>${esc(x.n)}</option>`).join('')}</select></label>`:''}
    ${cls&&HC?`<label>✦ Hidden class <select class="sel" id="mon-champ-hc" onchange="champPick('hc',this.value)"><option value="">None</option>${champHCs(cls).map(x=>`<option value="${esc(x.n)}"${x.n===CHAMP_HC?' selected':''}>${esc(x.n)} (${esc(x.tier)})</option>`).join('')}</select></label>`:cls&&lockLink?`<a href="${pageUrl('hidden')}" data-go="hidden" class="note" style="margin:0">🔒 Unlock hidden classes to give it one</a>`:''}
    ${cls?(()=>{const c=champCur(),b=c&&c.sb,n=m.sb,ac=sbAcc(b),ac0=sbAcc(n);return b?`<span class="chips" style="flex-basis:100%"><span class="chip" style="cursor:default">🎯 Accuracy <b>${ac!=null?sgn(ac):'—'}</b>${ac0!=null&&ac!=null&&ac!==ac0?` <small>(was ${sgn(ac0)})</small>`:''}</span><span class="chip" style="cursor:default">💨 Dodge <b>${sgn(sbDodge(b))}</b>${sbDodge(b)!==sbDodge(n)?` <small>(was ${sgn(sbDodge(n))})</small>`:''}</span></span>`:''})():''}
    <span class="note" style="margin:0;flex-basis:100%">A champion has trained in a class: tougher, sharper (+2 Accuracy and +2 Dodge), the class's features (and its subclass's), and more XP. Add to combat or an encounter adds the one shown.</span>`}
function champRefresh(){const m=CUR,box=$('mon-champ-box'),el=$('mon-sb');if(!m||!box||!el)return;box.innerHTML=champPickerHTML(m);el.innerHTML=sbHTML(champCur());diceify(el)}
function champPick(f,v){if(f==='cls'){CHAMP_SEL=v;if(!champSubs(v).some(x=>x.n===CHAMP_SUB))CHAMP_SUB='';if(CHAMP_HC&&!champHCs(v).some(x=>x.n===CHAMP_HC))CHAMP_HC=''}else if(f==='sub')CHAMP_SUB=v;else CHAMP_HC=v;champRefresh()}
const champCur=()=>CUR&&CUR._t==='mon'&&CHAMP_SEL&&CHAMP_FOR===CUR.n?champion(CUR,CHAMP_SEL,champOpts()):CUR;
function openChamp(n){const c=MON_IDX.get(lc(n));if(!c)return;if(c.champ){CHAMP_NEXT=c.champ;openItem(MON_IDX.get(lc(c.champ.base)))}else openItem(c)}
document.addEventListener('click',e=>{const el=e.target.closest('[data-champ]');if(!el||e.target.closest('[onclick]:not([data-champ])'))return;e.preventDefault();openChamp(el.dataset.champ)});
// each class's signature feature at level L, as a stat block trait
// k: the realm multiplier an enemy's spells already use (its realm's tier, 1 to 10). Enemies' class dice grow with it,
// not with the characters' table: on the characters' table a level 95 enemy Rogue's Sneak Attack (400d6) would drop a
// character with about 900 hit points in one hit. With the realm's tier it is 100d6.
function classCF(cls,L,k){k=k||1;const D=(n,d)=>n*k+'d'+d,X=k>1?` (× ${k} for its realm, like its spells)`:'';return ({Fighter:['Second Wind','Once per short rest, as a bonus action, it regains 1d10 + '+L+' hit points.'],Rogue:['Sneak Attack','Once per turn it deals an extra '+D(sneakBase(L),6)+' damage when it has advantage or an ally is next to the target'+X+'.'],Barbarian:['Rage','As a bonus action it rages for 1 minute: advantage on Strength checks and saves, +'+(k>1?D(rageBase(L),4):rageBase(L))+' melee damage'+X+', resistance to bludgeoning, piercing, and slashing.'],Monk:['Flurry of Blows','After attacking, it can make two unarmed strikes as a bonus action ('+D(maBase(L),maDie(L))+' each'+X+').'],Paladin:['Divine Smite','When it hits, it can spend a slot to deal an extra '+D(2,8)+' radiant damage, +'+D(1,8)+' per slot level above 1st'+X+'.'],Ranger:['Hunter\'s Mark','It marks a creature; its weapon attacks against that creature deal an extra '+D(1,6)+X+'.'],Bard:['Inspiration','As a bonus action, an ally within 60 ft. gains a d'+(L<5?6:L<10?8:L<15?10:12)+' to add to one roll.'],Cleric:['Channel Divinity','It turns undead or calls its god\'s power once per short rest.'],Druid:['Wild Shape','It can become a beast of CR '+Math.max(1,Math.floor(L/3))+' or lower twice per short rest.'],Sorcerer:['Metamagic','It has '+L+' sorcery points to twin, quicken, or empower spells.'],Warlock:['Eldritch Bolt','Ranged spell attack, 120 ft.: '+D(1,10)+' force damage per beam'+X+' ('+(L<5?1:L<11?2:L<17?3:4)+' beams).'],Wizard:['Arcane Recovery','Once per day it regains spent slots totalling '+Math.ceil(L/2)+' levels.'],Artificer:['Infused Gear','Its weapon and armor carry infusions (+'+(L>=10?2:1)+' to Accuracy and damage, and to AC); it can fix a broken item in a minute.']})[cls]}
const voice2=t=>t.replace(/^While equipped, you /,'It ').replace(/\byou\b/g,'it').replace(/\byour\b/g,'its');
function sbProfileHTML(x,o){const {m,P}=x;return `<div class="panel" style="display:flex;flex-direction:column;gap:8px;line-height:1.6">
  <b style="font-family:var(--serif);font-size:1.25rem">${esc(m.n)}</b><span class="note" style="margin:0">${o.kind==='npc'?esc((o.cls?stageInfo(o.cls,+o.level||1).name+(o.sub&&(+o.level||1)>=3?' · '+subStageName(o.sub,stageOf(+o.level||1)):'')+' · level '+(o.level||1):'NPC')):o.kind==='boss'?'Boss':'Named monster'} · ${esc(o.realm)} Realm${o.god?' · contracted to '+esc(o.god)+' ('+esc(o.rank||'Minor')+')':''}</span>
  <div><b>Looks:</b> ${esc(P.look)}. <b>Habit:</b> ${esc(P.habit)}. <b>Manner:</b> ${esc(P.persona)}.</div>
  <div><b>Background:</b> ${esc(P.back.charAt(0).toUpperCase()+P.back.slice(1))}. <b>Wants:</b> ${esc(P.goal)}.</div>
  ${P.lair?`<div><b>Lair actions</b> (initiative 20): ${P.lair.map(esc).join('; ')}.</div><div><b>Weakness:</b> ${esc(P.weak)}.</div>`:''}
  <div><b>Carries:</b> ${P.carry.length?P.carry.map(c=>refChip(c)).join(' ')+' and ':''}${gp(P.purse)}${localPrice(P.purse,o.realm)?' ('+localPrice(P.purse,o.realm)+')':''}.</div>
  ${P.drops.length?`<div><b>Drops:</b> ${P.drops.map(c=>refChip(c)).join(' ')}</div>`:''}
  <textarea data-sbnote rows="3" placeholder="Your notes for this one" style="background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:6px 8px;color:var(--text);font:inherit">${esc(o.note||'')}</textarea></div>`}
// a few spells an NPC caster knows: a cantrip and up to three of its highest slot levels, from realms its stage allows,
// damage-dealing ones first, with dice already multiplied by its stage
// an NPC's spells keep the plain ×band (not DICE_MULT): enemy casters shouldn't outgrow the characters' hit points
function npcSpells(cls,k,slots,R,school,band){
  if(!SP.length||!slots)return '';const top=slots.pact?({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[slots.lvl]||1):slots.slots.reduce((a,v,i)=>v?i+1:a,0);
  const pick=lv=>{const pool=SP.filter(s=>s.lv===lv&&(s.cls||[]).includes(cls)&&spellNeed(s)<=k&&(!school||s.sc===school));if(!pool.length)return null;const dm=pool.filter(spellScales),from=dm.length&&R()<.7?dm:pool;return from[Math.floor(R()*from.length)]};
  const out=[pick(0)];for(let lv=top;lv>=1&&out.length<4;lv-=Math.max(1,Math.ceil(top/3)))out.push(pick(lv));
  const list=out.filter(Boolean);
  return list.length?' Spells known include: '+list.map(s=>`${s.n} (${s.lv?ORDN(s.lv):'cantrip'}${spellScales(s)?', '+spellAt(spellDmg(s),band||1):''})`).join('; ')+'.':'';
}
function sbToolHTML(){
  const o=Object.assign({kind:'npc',realm:'Human',level:5,cls:'Fighter',cr:'',body:'beast',seed:1},store.get('sbt',{}));
  return `<div class="tool" style="grid-column:1/-1" id="t-sb"><h3>Stat block creator</h3><div class="sub">An NPC, a boss, or a named monster: a full stat block in the Bestiary's style (scaled to its realm) with who they are, their habits, goals, and gear.</div>
    <div class="form" style="grid-template-columns:repeat(4,1fr)">
      <label>Kind<select id="sbt-kind">${[['npc','NPC'],['named','Named monster'],['boss','Boss']].map(([k,l])=>`<option value="${k}"${k===o.kind?' selected':''}>${l}</option>`).join('')}</select></label>
      <label>Name<input id="sbt-name" value="${esc(o.name||'')}" placeholder="Leave empty to roll one"></label>
      <label>Realm<select id="sbt-realm">${REALMS.map(r=>`<option${r.n===o.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
      ${o.kind==='npc'?`<label>Class<select id="sbt-cls">${Object.keys(CLASS_DIE).sort().map(c=>`<option${c===o.cls?' selected':''}>${c}</option>`).join('')}</select></label><label>Subclass<select id="sbt-sub"><option value="">None (or below level 3)</option>${SUBS.filter(x=>x.par===o.cls).sort(byName).map(x=>`<option${x.n===o.sub?' selected':''}>${esc(x.n)}</option>`).join('')}</select></label><label>Level<input id="sbt-level" type="number" min="1" max="${MAX_LEVEL}" value="${o.level}"></label>`:`<label>Body<select id="sbt-body">${SB_BODIES.filter(b=>b!=='humanoid').map(b=>`<option${b===o.body?' selected':''}>${b}</option>`).join('')}<option${o.body==='humanoid'?' selected':''}>humanoid</option></select></label><label>Challenge<input id="sbt-cr" value="${esc(o.cr||'8')}" placeholder="e.g. 8"></label><label>★ Champion class<select id="sbt-champ"><option value="">None</option>${champClasses().map(c=>`<option${c===o.champ?' selected':''}>${c}</option>`).join('')}</select></label>${o.champ?`<label>Champion subclass<select id="sbt-champsub"><option value="">None</option>${champSubs(o.champ).map(x=>`<option${x.n===o.champSub?' selected':''}>${esc(x.n)}</option>`).join('')}</select></label>${HC?`<label>✦ Hidden class<select id="sbt-champhc"><option value="">None</option>${champHCs(o.champ).map(x=>`<option value="${esc(x.n)}"${x.n===o.champHc?' selected':''}>${esc(x.n)} (${esc(x.tier)})</option>`).join('')}</select></label>`:''}`:''}`}
      <label>God contract<select id="sbt-god"><option value="">None</option>${GODS.map(g=>`<option${godKey(g)===o.god?' selected':''}>${esc(godKey(g))}</option>`).join('')}</select></label>
      <label>Rank<select id="sbt-rank">${CONTRACT_RANKS.map(r=>`<option${r===o.rank?' selected':''}>${r}</option>`).join('')}</select></label>
      <label>Signature material<input id="sbt-mat" list="dl-mat" value="${esc(o.mat||'')}" placeholder="optional: its trait becomes theirs"></label>
      <label style="align-self:end"><button class="btn primary" id="sbt-roll" type="button" style="width:100%">🎲 New</button></label></div>
    <div class="cols" style="margin-top:12px;align-items:start"><div id="sbt-block"></div><div id="sbt-prof"></div></div>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" id="sbt-save" type="button">Save to my NPCs</button><button class="btn" id="sbt-combat" type="button">Send to combat tracker →</button><span class="chips" id="sbt-saved"></span></div></div>`;
}
function sbToolBind(){
  const get=()=>Object.assign({kind:'npc',realm:'Human',level:5,cls:'Fighter',cr:'',body:'beast',seed:1},store.get('sbt',{}));
  const draw=()=>{const o=get(),x=sbMake(o);$('sbt-block').innerHTML=sbHTML(x.m);$('sbt-prof').innerHTML=sbProfileHTML(x,o);diceify($('sbt-block'));
    $('sbt-prof').querySelector('[data-sbnote]').onchange=e=>{const s2=get();s2.note=e.target.value;store.set('sbt',s2)};
    const saved=store.get('npcs',[]);$('sbt-saved').innerHTML=saved.map((n,i)=>`<button class="chip" data-sbload="${i}">${esc(n.name||'?')}</button>`).join('');
    $('sbt-saved').querySelectorAll('[data-sbload]').forEach(b=>b.onclick=()=>{store.set('sbt',Object.assign({},saved[+b.dataset.sbload]));$('t-sb').outerHTML=sbToolHTML();sbToolBind()});
    sbToolBind.cur=x};
  const save=()=>{const s2=get(),k=$('sbt-kind').value;const kindChanged=k!==s2.kind;Object.assign(s2,{kind:k,name:$('sbt-name').value.trim(),realm:$('sbt-realm').value,god:$('sbt-god').value,rank:$('sbt-rank').value,mat:$('sbt-mat').value.trim()});
    let clsChanged=false;if($('sbt-cls')){clsChanged=$('sbt-cls').value!==s2.cls;Object.assign(s2,{cls:$('sbt-cls').value,sub:clsChanged?'':$('sbt-sub').value,level:Math.max(1,Math.min(MAX_LEVEL,+$('sbt-level').value||1))})}let champChanged=false;if($('sbt-body')){champChanged=$('sbt-champ').value!==(s2.champ||'');Object.assign(s2,{champSub:champChanged?'':($('sbt-champsub')||{}).value||'',champHc:champChanged?'':($('sbt-champhc')||{}).value||''})}if($('sbt-body'))Object.assign(s2,{body:$('sbt-body').value,champ:$('sbt-champ').value,cr:$('sbt-cr').value.trim()||'8'});
    store.set('sbt',s2);if(kindChanged||clsChanged||champChanged){$('t-sb').outerHTML=sbToolHTML();sbToolBind()}else draw()};
  ['sbt-kind','sbt-name','sbt-realm','sbt-cls','sbt-sub','sbt-level','sbt-body','sbt-cr','sbt-champ','sbt-champsub','sbt-champhc','sbt-god','sbt-rank','sbt-mat'].forEach(i=>{if($(i))$(i).addEventListener('change',save)});
  $('sbt-roll').onclick=()=>{const s2=get();s2.seed=(Math.random()*2**31)|0;s2.name='';s2.note='';store.set('sbt',s2);$('sbt-name').value='';draw()};
  $('sbt-save').onclick=()=>{const s2=get(),x=sbToolBind.cur;s2.name=x.m.n;const L=store.get('npcs',[]).filter(n=>n.name!==s2.name);L.push(s2);store.set('npcs',L.slice(-30));store.set('sbt',s2);$('sbt-name').value=s2.name;toast('Saved '+s2.name);draw()};
  $('sbt-combat').onclick=()=>{const x=sbToolBind.cur;const C=store.get('combat',{round:1,turn:0,list:[]});C.list.push({id:uid(),name:x.m.n,init:1+Math.floor(Math.random()*20),dex:0,hp:x.m.sb.hp,max:x.m.sb.hp,ac:x.m.sb.ac,dodge:sbDodge(x.m.sb),cond:[]});store.set('combat',C);toast(x.m.n+' added to the combat tracker')};
  draw();
}
// whole-device backup: every fand.* setting except the DM lock, its log, the dice rig, and the assistant key
const backupSkip=k=>/^fand\.(hc|dicerig|anthropicKey|groqKey)/.test(k);
function backupSave(){
  const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('fand.')&&!backupSkip(k))o[k]=localStorage.getItem(k)}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({fand:'backup',saved:new Date().toISOString(),data:o},null,1)],{type:'application/json'}));
  a.download='FAND backup '+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();toast('Backup downloaded');
}
function backupLoad(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  f.text().then(t=>{const j=JSON.parse(t);if(!j||j.fand!=='backup'||typeof j.data!=='object')throw 0;
    const D={};Object.keys(j.data).forEach(k=>{if(typeof j.data[k]==='string')D[k.startsWith('fand.')?k:'fand.'+k]=j.data[k]});j.data=D;// accepts the Settings backup too (keys without the fand. prefix)
    const ks=Object.keys(D).filter(k=>/^fand\.[\w.-]{1,64}$/.test(k)&&!backupSkip(k)&&k!==KEY_NAME&&!k.startsWith('fand.__')&&k!=='fand.anthropicKey'&&k!==GROQ_KEY);
    if(!confirm('Restore '+ks.length+' saved items from '+(j.saved||j.at||'this file').slice(0,10)+'? Items in the file replace the ones on this device.'))return;
    ks.forEach(k=>{try{localStorage.setItem(k,j.data[k])}catch(e){}});toast('Backup restored');setTimeout(()=>location.reload(),600);
  }).catch(()=>toast('That file is not a FAND backup')).finally(()=>{inp.value=''});
}
// The Dice page: quick rolls, a dice pool, saved rolls, and the roll history
// The Dice pool: dice of every kind rolled together, with ways to read them (sum, keep highest or lowest, count
// successes), advantage on d20s, exploding dice, and FAND's critical hit (x1.5). Every die can be rerolled on its own.
const DP_SIDES=[4,6,8,10,12,20,100];
const DPOOL=Object.assign({d:{},mod:0,mode:'sum',n:1,target:5,adv:'',explode:false,crit:false,last:null},(()=>{try{const o=JSON.parse(localStorage.getItem('fand.dpool')||'null');return o&&typeof o==='object'?{d:o.d||{},mod:+o.mod||0,mode:o.mode||'sum',n:+o.n||1,target:+o.target||5,adv:o.adv||'',explode:!!o.explode,crit:!!o.crit}:{}}catch(e){return {}}})());
const dpSpec=()=>({d:Object.assign({},DPOOL.d),mod:DPOOL.mod,mode:DPOOL.mode,n:DPOOL.n,target:DPOOL.target,adv:DPOOL.adv,explode:DPOOL.explode,crit:DPOOL.crit});
const dpCount=sp=>DP_SIDES.reduce((a,x)=>a+(sp.d[x]|0),0);
function dicePoolExpr(sp){sp=sp||DPOOL;const t=DP_SIDES.filter(x=>sp.d[x]).map(x=>sp.d[x]+'d'+x);if(!t.length)return '';if(sp.mod)t.push(String(sp.mod));return t.join('+').replace('+-','-')}
// a plain-words name for the roll, used in the history
function dpLabel(sp){const e=dicePoolExpr(sp);if(!e)return '';const bits=[];if(sp.adv&&sp.d[20])bits.push(sp.adv==='adv'?'advantage':'disadvantage');if(sp.mode==='kh')bits.push('keep highest '+sp.n);if(sp.mode==='kl')bits.push('keep lowest '+sp.n);if(sp.mode==='succ')bits.push('successes on '+sp.target+'+');if(sp.explode)bits.push('exploding');if(sp.crit)bits.push('critical ×1.5');return e+(bits.length?' ('+bits.join(', ')+')':'')}
// one die through the DM rig (as rollMulti does: a 'next roll only' rig covers the whole pool)
function dpDie(x){const r=rigDice(1,x,0);return r?r[0]:DIE(x)}
function dpEntry(x,sp){const e={x,rolls:[]};if(x===20&&sp.adv){e.rolls=[dpDie(20),dpDie(20)];e.v=sp.adv==='adv'?Math.max(...e.rolls):Math.min(...e.rolls);e.pair=true}
  else{let v=dpDie(x);e.rolls.push(v);let k=0;while(sp.explode&&v===x&&x>1&&k<10){v=dpDie(x);e.rolls.push(v);k++}e.v=e.rolls.reduce((a,b)=>a+b,0)}return e}
function dpScore(R){const sp=R.sp,es=R.es;es.forEach(e=>e.drop=false);
  if((sp.mode==='kh'||sp.mode==='kl')&&es.length){const keep=Math.max(1,Math.min(es.length,sp.n|0)),ord=es.map((e,i)=>[e.v,i]).sort((a,b)=>sp.mode==='kh'?b[0]-a[0]:a[0]-b[0]);ord.slice(keep).forEach(([,i])=>es[i].drop=true)}
  if(sp.mode==='succ'){R.succ=es.filter(e=>e.v>=sp.target).length;R.t=R.succ;return R}
  let t=es.filter(e=>!e.drop).reduce((a,e)=>a+e.v,0)+(sp.mod|0);if(sp.crit)t=Math.floor(t*1.5);R.t=t;return R}
function dpRoll(sp){if(!dpCount(sp))return null;const g=store.get('dicerig',null);
  // an exact-total rig on a plain sum is spread over the dice exactly, as Quick roll does
  if(g&&g.mode==='total'&&sp.mode==='sum'&&!sp.adv&&!sp.explode&&!sp.crit){const M=rollMulti(dicePoolExpr(sp));if(M){let i=0;const es=[];DP_SIDES.forEach(x=>{for(let k=0;k<(sp.d[x]|0);k++){const v=M.r[i++];es.push({x,rolls:[v],v})}});return dpScore({sp,es})}}
  if(g&&g.mode)store.set('dicerig',{...g,once:false});
  try{const es=[];DP_SIDES.forEach(x=>{for(let k=0;k<Math.min(50,sp.d[x]|0);k++)es.push(dpEntry(x,sp))});return dpScore({sp,es})}
  finally{if(g&&g.mode)store.set('dicerig',g.once?null:g);if($('dr-rig-state'))rigState()}}
function dpLog(R){const sp=R.sp,log=store.get('dicelog',[]);log.unshift({e:dpLabel(sp),t:R.t,r:R.es.map(e=>e.drop?'('+e.v+')':e.v),mod:sp.mode==='succ'?0:sp.mod});store.set('dicelog',log.slice(0,50));if($('dl-log'))diceLog()}
function dpShow(R){if(!R)return;DPOOL.last=R;dpLog(R);
  const first=DP_SIDES.find(x=>R.sp.d[x])||20;if(store.get('diceanim',true))diceOverlay({e:dpLabel(R.sp),t:R.t,r:R.es.filter(e=>!e.drop).map(e=>e.v),sd:R.es.filter(e=>!e.drop).map(e=>e.x),mod:R.sp.mode==='succ'?0:R.sp.mod,again:()=>dpShow(dpRoll(R.sp))},first);dicePool()}
function dicePoolRoll(sp){dpShow(dpRoll(sp||dpSpec()))}
// reroll one die of the last roll (Lucky, Portent, a bardic reroll...)
function dpReroll(i){const R=DPOOL.last;if(!R||!R.es[i])return;const sp=R.sp,g=store.get('dicerig',null);if(g&&g.mode)store.set('dicerig',{...g,once:false});
  try{const old=R.es[i].v;R.es[i]=dpEntry(R.es[i].x,sp);dpScore(R);toast('Rerolled a d'+R.es[i].x+': '+old+' → '+R.es[i].v+(sp.mode==='succ'?' · '+R.t+' successes':' · total '+R.t))}
  finally{if(g&&g.mode)store.set('dicerig',g.once?null:g)}
  dpLog(R);dicePool()}
function dpSet(k,v){DPOOL[k]=v;if(k==='d'||k==='mod'||k==='mode'||k==='n'||k==='target'||k==='adv'||k==='explode'||k==='crit')DPOOL.last=DPOOL.last&&JSON.stringify(DPOOL.last.sp)===JSON.stringify(dpSpec())?DPOOL.last:null;
  try{localStorage.setItem('fand.dpool',JSON.stringify(dpSpec()))}catch(e){}dicePool()}
function dpAdd(x,n){const d=Object.assign({},DPOOL.d);d[x]=Math.max(0,Math.min(50,(d[x]|0)+n));if(!d[x])delete d[x];dpSet('d',d)}
function dpPreset(k){const P={ability:{d:{6:4},mod:0,mode:'kh',n:3,adv:'',explode:false,crit:false},adv:{d:{20:1},mode:'sum',adv:'adv',explode:false,crit:false},dis:{d:{20:1},mode:'sum',adv:'dis',explode:false,crit:false},fireball:{d:{6:8},mod:0,mode:'sum',adv:'',explode:false,crit:false}}[k];if(!P)return;Object.assign(DPOOL,P);if(P.mod===undefined)DPOOL.mod=0;dpSet('last',null);dicePoolRoll()}
function dicePool(){const box=$('dp-box');if(!box)return;const sp=DPOOL,e=dicePoolExpr(sp),R=DPOOL.last;
  box.innerHTML=`<div class="dp-grid">${DP_SIDES.map(x=>`<div class="dp-t${sp.d[x]?' on':''}"><button type="button" class="dp-add" onclick="dpAdd(${x},1)" aria-label="Add a d${x}">${dieSVG(x,null,'pt'+x).svg}<span>d${x}</span></button>${sp.d[x]?`<b class="dp-c">${sp.d[x]}</b><button type="button" class="dp-rm" onclick="dpAdd(${x},-1)" aria-label="Remove a d${x}">−</button>`:''}</div>`).join('')}</div>
    <div class="dp-opts">
      <label>Modifier <span class="dp-step"><button class="btn" type="button" onclick="dpSet('mod',DPOOL.mod-1)" aria-label="Lower the modifier">−</button><b>${sp.mod>0?'+':''}${sp.mod}</b><button class="btn" type="button" onclick="dpSet('mod',DPOOL.mod+1)" aria-label="Raise the modifier">+</button></span></label>
      <label>Read the dice <select class="sel" onchange="dpSet('mode',this.value)">${[['sum','Add them up'],['kh','Keep the highest…'],['kl','Keep the lowest…'],['succ','Count successes…']].map(([v,l])=>`<option value="${v}"${sp.mode===v?' selected':''}>${l}</option>`).join('')}</select></label>
      ${sp.mode==='kh'||sp.mode==='kl'?`<label>How many to keep <input class="sel" type="number" min="1" max="50" value="${sp.n}" onchange="dpSet('n',Math.max(1,Math.min(50,+this.value||1)))" style="width:80px"></label>`:''}
      ${sp.mode==='succ'?`<label>A success is <span style="display:flex;gap:4px;align-items:center"><input class="sel" type="number" min="1" max="100" value="${sp.target}" onchange="dpSet('target',Math.max(1,Math.min(100,+this.value||1)))" style="width:80px"> or more</span></label>`:''}
      <label>d20s <select class="sel" onchange="dpSet('adv',this.value)">${[['','Normal'],['adv','Advantage (roll 2, keep higher)'],['dis','Disadvantage (roll 2, keep lower)']].map(([v,l])=>`<option value="${v}"${sp.adv===v?' selected':''}>${l}</option>`).join('')}</select></label>
      <label class="dp-chk"><input type="checkbox" ${sp.explode?'checked':''} onchange="dpSet('explode',this.checked)"><span>Exploding dice<small>a die that rolls its highest face rolls again and adds</small></span></label>
      ${sp.mode!=='succ'?`<label class="dp-chk"><input type="checkbox" ${sp.crit?'checked':''} onchange="dpSet('crit',this.checked)"><span>Critical hit ×1.5<small>FAND: a headshot deals 1.5 × damage (rounded down), before AC</small></span></label>`:''}
    </div>
    <div class="dp-sum"><span class="mono">${esc(e?dpLabel(sp):'Tap a die to add it to the pool')}</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="button" ${e?'':'disabled'} onclick="dicePoolRoll()">🎲 ${R?'Roll again':'Roll the pool'}</button><button class="btn" type="button" onclick="DPOOL.last=null;dpSet('d',{});dpSet('mod',0)">Clear</button><button class="btn" type="button" ${e?'':'disabled'} onclick="dpSave()">Save this roll</button></div>
    <div class="chips" style="margin:10px 0 0"><span class="note" style="margin:0 4px 0 0">Quick:</span><button class="chip" type="button" onclick="dpPreset('ability')">Ability score (4d6, keep 3)</button><button class="chip" type="button" onclick="dpPreset('adv')">d20 advantage</button><button class="chip" type="button" onclick="dpPreset('dis')">d20 disadvantage</button><button class="chip" type="button" onclick="dpPreset('fireball')">Fireball (8d6)</button></div>
    ${R?`<div class="dp-res"><div class="dp-total"><b>${R.t}</b><span>${R.sp.mode==='succ'?(R.t===1?'success':'successes'):'total'}</span></div>
      <div class="dp-dice">${R.es.map((d,i)=>{const hi=d.rolls.some(v=>v===d.x),lo=!d.pair&&d.rolls[0]===1||d.pair&&d.v===1,ok=R.sp.mode==='succ'&&d.v>=R.sp.target;
        return `<button type="button" class="dp-r${d.drop?' drop':''}${hi?' hi':''}${lo?' lo':''}${ok?' ok':''}" onclick="dpReroll(${i})" title="d${d.x}${d.pair?': rolled '+d.rolls.join(' and '):d.rolls.length>1?': exploded '+d.rolls.join(' + '):''}. Tap to reroll this die">${d.v}<small>d${d.x}${d.pair?' '+d.rolls.join('/'):d.rolls.length>1?' 💥':''}</small></button>`}).join('')}</div>
      <div class="note" style="margin:6px 0 0">${R.sp.mode==='succ'?`Dice at ${R.sp.target} or more count as successes.`:`${R.es.filter(d=>!d.drop).map(d=>d.v).join(' + ')}${R.sp.mod?(R.sp.mod>0?' + ':' − ')+Math.abs(R.sp.mod):''}${R.sp.crit?' × 1.5':''}${R.es.some(d=>d.drop)?' · struck-out dice are dropped':''}`} · tap a die to reroll just that one.</div></div>`:''}`}
function dpSave(){const e=dicePoolExpr();if(!e)return;const sp=dpSpec(),plain=sp.mode==='sum'&&!sp.adv&&!sp.explode&&!sp.crit,n=prompt('Name this roll (for example: Greatsword damage)',dpLabel(sp));if(!n)return;const L=store.get('dicesaved',[]);L.push(plain?{n,e}:{n,e:dpLabel(sp),pool:sp});store.set('dicesaved',L);diceSaved();toast('Saved '+n)}
function diceSaved(){const L=store.get('dicesaved',[]);$('ds-list').innerHTML=L.length?L.map((x,i)=>`<div class="enc-row" style="display:flex;gap:8px;align-items:center;padding:7px 12px"><button class="btn primary" type="button" style="padding:4px 10px" onclick="${x.pool?`dicePoolRoll(store.get('dicesaved',[])[${i}].pool)`:`rollShow(${esc(JSON.stringify(x.e))})`}">🎲</button><b style="flex:1">${esc(x.n)}</b><span class="mono">${esc(x.e)}</span><button class="btn" type="button" style="padding:3px 8px" title="Remove" onclick="const L=store.get('dicesaved',[]);L.splice(${i},1);store.set('dicesaved',L);diceSaved()">✕</button></div>`).join(''):'<div class="note">No saved rolls yet. Save the ones you use every session, like a weapon\'s damage or an initiative roll.</div>'}
function renderDice(){
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Dice</h3><p>Roll anything at the table. Your history and saved rolls stay on this device.</p></div>
    ${SITE?`<section class="d3-inline"><div class="d3i-h"><b>The 3D Dice Table</b><span class="note" style="margin:0">Scoop the dice up and throw them. Rolls here go into your history${typeof CL!=='undefined'&&CL.user?' and, if you share them, to your table':''}.</span><a class="btn" href="dice-table.html" title="Every setting: surfaces, maps, weather, dice colours, replays, the Dice Dungeon">Full size ↗</a></div><iframe id="d3i-f" title="3D Dice Table" src="dice-table.html#embed=1&pool=d20" loading="lazy"></iframe></section><section class="panel rs-panel"><h4>Table rolls</h4><div id="rs-box"></div></section>`:''}
    <div class="tools">
      <div class="tool" id="t-dice"><h3>Quick roll</h3><div class="sub">Type any roll, like 2d6+3, d20, or a mix like 2d6+1d8+3. Dice written anywhere on the site can be clicked to roll too.</div>
        <div class="form" style="grid-template-columns:2fr 1fr"><label>Roll<input id="dr-e" value="1d20" placeholder="2d6+3"></label><label style="align-self:end"><button class="btn primary" id="dr-go" type="button" style="width:100%">🎲 Roll</button></label></div>
        <div class="chips" style="margin:8px 0">${['d4','d6','d8','d10','d12','d20','d100','2d6','4d6'].map(d=>`<button class="chip" type="button" onclick="rollShow('${d}')">${d}</button>`).join('')}<button class="chip" type="button" onclick="(()=>{const a=rollExpr('2d20');a.e='d20 advantage / disadvantage';a.t=Math.max(...a.r);store.get('diceanim',true)?diceOverlay(a,20):0;toast('🎲 Advantage: '+Math.max(...a.r)+' · disadvantage: '+Math.min(...a.r)+' ('+a.r.join(', ')+')')})()">d20 adv/dis</button></div>
        <label class="note" style="display:flex;gap:6px;align-items:center;margin:0 0 6px"><input type="checkbox" id="dr-anim" ${store.get('diceanim',true)?'checked':''} onchange="store.set('diceanim',this.checked)"> Show rolling dice</label>
        ${SITE?`<label class="note" style="display:flex;gap:6px;align-items:center;margin:0 0 6px"><input type="checkbox" id="dr-3d" ${store.get('dice3d',false)?'checked':''} onchange="store.set('dice3d',this.checked);toast(this.checked?'Rolls go to the 3D Dice Table':'Rolls use the quick dice')"> Roll with the 3D Dice Table (real physics)</label>`:''}
        <details class="fold" id="dr-rig-box" ${HC?'':'hidden'} style="margin:0 0 8px"><summary style="font-size:.8rem;color:var(--muted)">DM: rig</summary><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px">
          <select class="sel" id="dr-rig" onchange="rigSet()" style="max-width:none;flex:1">${(()=>{const g=store.get('dicerig',null)||{};return RIG_MODES.map(([v,l])=>`<option value="${v}"${(g.mode||'')===v?' selected':''}>${l}</option>`).join('')})()}</select>
          <input class="sel" id="dr-rig-v" type="number" placeholder="Total" value="${(store.get('dicerig',null)||{}).value||''}" onchange="rigSet()" style="width:90px;${(store.get('dicerig',null)||{}).mode==='total'?'':'display:none'}">
          <label class="note" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox" id="dr-rig-once" ${(store.get('dicerig',null)||{once:true}).once!==false?'checked':''} onchange="rigSet()"> next roll only</label></div>
          <div class="note" id="dr-rig-state" style="margin:6px 0 0"></div><div class="note" style="margin:4px 0 0">Applies to every roll on the site (this tool, clickable dice, the combat and encounter pages). Rigged rolls look exactly like fair ones.</div></details>
        <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0"><b style="font-size:.85rem">History</b><button class="btn" type="button" style="padding:3px 9px;font-size:.75rem" onclick="store.set('dicelog',[]);diceLog()">Clear</button></div><div id="dl-log" style="display:flex;flex-direction:column;gap:3px;max-height:none;overflow:auto"></div></div>

      <div class="tool" id="t-pool"><h3>Dice pool</h3><div class="sub">Tap dice to build a roll, choose how to read them (add up, keep the best, count successes), and roll them together. Tap any die in the result to reroll just that one.</div>
        <div id="dp-box"></div></div>

      <div class="tool" id="t-style"><h3>Dice style</h3><div class="sub">How your dice look when they roll: ${DSK.length} styles of colour, metal, gemstone, and resin. Tap one to try it.</div>${diceSkinGrid('dp')}</div>

      <div class="tool" id="t-saved"><h3>Saved rolls</h3><div class="sub">One tap for the rolls you make every session.</div>
        <div class="form" style="grid-template-columns:1fr 1fr auto"><label>Name<input id="ds-n" placeholder="Longsword damage"></label><label>Roll<input id="ds-e" placeholder="1d8+4"></label><label style="align-self:end"><button class="btn" type="button" id="ds-add">Save</button></label></div>
        <div class="mlist" id="ds-list" style="margin-top:8px"></div></div>
    </div></div>`;
  diceLog();rigState();dicePool();diceSaved();hcAuto().then(()=>{if(HC&&$('dr-rig-box'))$('dr-rig-box').hidden=false});
  $('dr-go').onclick=()=>rollShow($('dr-e').value);$('dr-e').onkeydown=e=>{if(e.key==='Enter')rollShow($('dr-e').value)};
  $('ds-add').onclick=()=>{const n=$('ds-n').value.trim(),e=$('ds-e').value.trim();if(!e)return;if(!rollMulti(e)){toast('Not a roll: try 1d8+4 or 2d6+1d4');return}const L=store.get('dicesaved',[]);L.push({n:n||e,e});store.set('dicesaved',L);$('ds-n').value=$('ds-e').value='';diceSaved()};
  if($('rs-box')){if(typeof CL!=='undefined'&&CL.user&&(RS.camp!==rsCamp()||(rsCamp()&&!RS.chan)))rsLoad().catch(()=>{});else rsDraw()}
}
// The Tools page shows one tool at a time, picked from a row of tabs; the last one used is remembered
function toolTabs(){const box=document.querySelector('.tools');if(!box)return;const bk=$('t-backup');if(bk)box.append(bk);
  const T=[...box.children].filter(t=>t.classList.contains('tool'));const bar=document.createElement('div');bar.className='tooltabs';bar.setAttribute('role','tablist');
  bar.innerHTML=T.map(t=>`<button type="button" role="tab" data-tt="${t.id}">${t.querySelector('h3').innerHTML}</button>`).join('');box.before(bar);box.classList.add('tabbed');
  const show=id=>{if(!T.some(t=>t.id===id))id=T[0].id;T.forEach(t=>t.hidden=t.id!==id);bar.querySelectorAll('[data-tt]').forEach(b=>{const on=b.dataset.tt===id;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);if(on)b.scrollIntoView({block:'nearest',inline:'nearest'})});store.set('tooltab',id)};
  bar.onclick=e=>{const b=e.target.closest('[data-tt]');if(b)show(b.dataset.tt)};show(store.get('tooltab',T[0].id))}
// ── Tools for running a session at the table: in-game clock, a quick NPC, travel with weather and encounters, conditions ──
const WEATHER={
  Human:['Clear and mild','Grey drizzle all day','Strong wind from the hills','Fog until noon','Hot and still','A thunderstorm in the afternoon'],
  Mysterious:['A silver mist that hides the road','Lights drifting between the trees','Rain that falls upward for an hour','Still air and no birdsong','A warm, sweet-smelling wind','Fog that whispers names'],
  Hell:['Ash falling like snow','Heat haze over the brimstone flats','A storm of embers','Sulphur fog','Red skies and burning wind','A rain of hot cinders'],
  Heaven:['Blinding clear light','Choir-song on the wind','Clouds underfoot','A gentle golden rain','Calm, with a single bell ringing','Wind that smells of incense'],
  Chaos:['The weather changes every hour','Snow and sunshine at once','Gravity drifts for a few minutes','Rain of tiny stones','Colours bleed out of the sky','Three suns, then none'],
  Abyss:['Crushing pressure and black water','A cold current from below','Faint glowing tides','Silt storms that hide everything','Still, silent dark','Whale-song shaking the stones'],
  'Inner Realm':['Perfectly ordered calm','Wind that blows on the hour','Measured, even rain','Clockwork thunder at noon','Fog in neat squares','Bright, flat light'],
  'Outer Realm':['A sky full of falling stars','Thin, cold air','Starlight brighter than day','A comet passing overhead','Silence and frost','Aurora that hums'],
  Void:['Nothing: no wind, no sound','Darkness that eats torchlight','Cold that numbs thought','A sudden echo with no source','Grey emptiness','Drifting motes of nothing'],
  'Inner Void':['Edges of the world flicker','Thoughts feel heavy','A hum from everywhere','Light bends around you','Time stutters for a moment','Total stillness'],
  Primordial:['Storms of raw creation','New land rising from the ground','Rain that tastes like iron','Giant shapes in the clouds','The first dawn, over and over','Earthquakes and blooming flowers']
};
const PACE=[['slow',18,'Slow: 18 miles a day; can use Stealth'],['normal',24,'Normal: 24 miles a day'],['fast',30,'Fast: 30 miles a day; −5 to passive Perception']];
const COND_RULES=[
  ['Blinded','Cannot see. Fails any check that needs sight. Attacks against it have advantage; its attacks have disadvantage.'],
  ['Charmed','Cannot attack or harm the charmer. The charmer has advantage on social checks with it.'],
  ['Deafened','Cannot hear. Fails any check that needs hearing.'],
  ['Frightened','Disadvantage on checks and attacks while it can see the source of its fear. Cannot move closer to it.'],
  ['Grappled','Speed 0. Ends if the grappler is incapacitated or the creature is moved out of reach.'],
  ['Incapacitated','Cannot take actions or reactions.'],
  ['Invisible','Cannot be seen without magic. Attacks against it have disadvantage; its attacks have advantage.'],
  ['Paralyzed','Incapacitated, cannot move or speak. Fails Strength and Dexterity saves. Attacks have advantage; hits from within 5 ft are critical hits.'],
  ['Petrified','Turned to stone: incapacitated, unaware, resists all damage, immune to poison and disease.'],
  ['Poisoned','Disadvantage on attack rolls and ability checks.'],
  ['Prone','Can only crawl. Disadvantage on attacks. Attacks within 5 ft have advantage; from farther, disadvantage.'],
  ['Restrained','Speed 0. Disadvantage on attacks and Dexterity saves. Attacks against it have advantage.'],
  ['Stunned','Incapacitated, cannot move, speaks falteringly. Fails Strength and Dexterity saves. Attacks against it have advantage.'],
  ['Unconscious','Incapacitated, drops what it holds, falls prone. Fails Strength and Dexterity saves. Attacks have advantage; hits from within 5 ft are critical hits.'],
  ['Exhaustion','Levels 1–6: 1 disadvantage on checks; 2 speed halved; 3 disadvantage on attacks and saves; 4 HP maximum halved; 5 speed 0; 6 death. A long rest removes one level. In FAND, realm Pressure strain can add levels.']
];
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
// in-game clock: day, minutes since midnight, and light sources that burn down
// ── the campaign calendar and downtime: days come from the session clock; activities take days and cost coin ──
// [key, name, default days, gp cost (per day if perDay), what it does, perDay, earns gp per day]
const DOWNTIME=[['train','Training (a tool or a language)',70,1.5,'Learn a tool or a language: about ten workweeks, less with a high Intelligence.',1,0],
  ['craft','Crafting',7,0,'Make an item from a Blueprint; the Workshop has its own rules and costs.',0,0],
  ['carouse','Carousing',7,10,'A week of parties and contacts: roll for what comes of it.',1,0],
  ['research','Research',7,50,'A week in libraries and with sages: learn lore about one thing.',0,0],
  ['work','Working a job',7,0,'A steady job pays a modest wage (about 1 gp a day).',0,1],
  ['recuperate','Recuperating',3,0,'Rest to shake off a lingering injury, disease or poison.',0,0],
  ['worship','Religious service',7,0,'Serve at a temple: gain favour with its priests.',0,0],
  ['crime','Crime',7,25,'A week of scheming for a big score; the DM rolls the risk.',0,0],
  ['other','Something else',7,0,'Anything the table agrees on.',0,0]];
const calDay=()=>clockGet().day;
const calDT=()=>store.get('downtime',[]);
const calEvents=()=>store.get('calevents',[]);
// finish every activity whose last day has passed (called whenever the clock moves)
function calTick(){const d=calDay(),L=calDT();let ch=false;L.forEach(x=>{if(x.done||d<x.end)return;x.done=true;x.doneAt=Date.now();ch=true;const c=PARTY.find(p=>p.id===x.cid),A=DOWNTIME.find(a=>a[0]===x.act)||DOWNTIME[8];
    let paid='';if(c&&clCanEdit(c)&&A[6]){const gpv=A[6]*x.days;lootCoin(c,gpv);paid=` and earned ${gp(gpv)}`;saveParty()}
    const m=`${x.who} finished ${x.label}${paid} (day ${x.end})`;inboxPush(m,'party');toast(m);const J=store.get('journal',[]);J.push({t:'Downtime: '+x.who,at:Date.now(),d:new Date().toISOString().slice(0,10),body:`${x.who} spent days ${x.start}–${x.end} on ${x.label}.${x.note?'\n'+x.note:''}${paid?'\nThey'+paid+'.':''}`});store.set('journal',J)});
  if(ch)store.set('downtime',L);
  calEvents().forEach(e=>{if(e.day===d&&!e.seen){e.seen=1;const m=`Today (day ${d}): ${e.t}`;inboxPush(m,'party');toast(m)}});store.set('calevents',calEvents().map(e=>e.day===d?Object.assign(e,{seen:1}):e))}
function calOpen(){openModal('<div id="cal"></div>');calRender()}
function calRender(){const el=$('cal');if(!el)return;const C=clockGet(),d=C.day,W=PV().filter(c=>clCanEdit(c)),L=calDT(),act=L.filter(x=>!x.done),done=L.filter(x=>x.done).slice(-6).reverse(),E=calEvents().concat(questsDue()).filter(e=>e.day>=d).sort((a,b)=>a.day-b.day),A=DOWNTIME.find(a=>a[0]===(($('dt-act')||{}).value||'train'))||DOWNTIME[0];
  const week=Math.floor((d-1)/7)+1,dow=['Firstday','Seconday','Thirdday','Fourthday','Fifthday','Sixthday','Restday'][(d-1)%7];
  el.innerHTML=`<h3 style="margin:0 0 4px;font-family:var(--serif)">Calendar and downtime</h3>
    <div class="cal-now"><div><div class="big" style="font-size:1.6rem">Day ${d}</div><small>${dow}, week ${week} · ${String(Math.floor(C.min/60)).padStart(2,'0')}:${String(C.min%60).padStart(2,'0')}</small></div><div class="chips"><button class="chip" onclick="clockAdd(1440);calTick();calRender()">+1 day</button><button class="chip" onclick="clockAdd(10080);calTick();calRender()">+1 week</button><button class="chip" onclick="go('tools');store.set('tooltab','t-clock')" title="Hours, rests and torches">Session clock →</button></div></div>
    <div class="sh-lab" style="text-align:left;margin-top:12px">Downtime</div>
    ${act.length?`<div class="tr-list">${act.map(x=>{const pct=Math.max(0,Math.min(100,(d-x.start)/(x.end-x.start||1)*100));return `<div class="tr-row cal-dt"><div><b>${esc(x.who)}</b>: ${esc(x.label)} <small>days ${x.start}–${x.end} · ${x.end-d} to go</small><div class="cal-bar" role="meter" aria-label="${esc(x.label)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct}%"></i></div>${x.note?`<div class="note" style="margin:2px 0 0">${esc(x.note)}</div>`:''}</div><button class="btn" onclick="calStop('${x.id}')" title="Stop it now">Stop</button></div>`}).join('')}</div>`:'<div class="note">Nobody is busy.</div>'}
    ${W.length?`<div class="cal-form"><select class="sel" id="dt-who" aria-label="Who">${W.map(c=>`<option value="${c.id}">${esc(c.name||'Unnamed')}${act.some(x=>x.cid===c.id)?' (busy)':''}</option>`).join('')}</select>
      <select class="sel" id="dt-act" aria-label="Activity" onchange="calRender()">${DOWNTIME.map(a=>`<option value="${a[0]}"${a===A?' selected':''}>${esc(a[1])}</option>`).join('')}</select>
      <label>Days<input type="number" class="sel" id="dt-days" value="${A[2]}" min="1" max="3650"></label><label>Cost, gp<input type="number" class="sel" id="dt-cost" value="${A[5]?Math.round(A[3]*A[2]*100)/100:A[3]}" min="0" step="0.01"></label>
      <input class="sel cal-note" id="dt-note" maxlength="200" placeholder="${esc(A[0]==='train'?'What they learn (e.g. Thieves\' tools)':'Details (optional)')}" aria-label="Details"><button class="btn primary" onclick="calStart()">Start</button></div><div class="note" style="margin:4px 0 0">${esc(A[4])}</div>`:'<div class="note">Add characters on the Party page first.</div>'}
    ${done.length?`<div class="sh-lab" style="text-align:left;margin-top:12px">Finished</div><ul class="sh-ul">${done.map(x=>`<li>${esc(x.who)}: ${esc(x.label)} <small>(days ${x.start}–${x.end})</small></li>`).join('')}</ul>`:''}
    <div class="sh-lab" style="text-align:left;margin-top:12px">Coming up</div>${E.length?`<ul class="sh-ul">${E.map(e=>`<li><b>Day ${e.day}</b>${e.day===d?' (today)':` (in ${e.day-d} day${e.day-d>1?'s':''})`}: ${esc(e.t)}${e.quest?'':` <a href="#" aria-label="Remove ${esc(e.t)}" onclick="calEvDrop('${e.id}');return false">✕</a>`}</li>`).join('')}</ul>`:'<div class="note">Nothing planned.</div>'}
    <div class="cal-form"><label>Day<input type="number" class="sel" id="ce-day" value="${d+7}" min="1"></label><input class="sel cal-note" id="ce-t" maxlength="120" placeholder="Festival of Ash, the caravan arrives…" aria-label="What happens"><button class="btn" onclick="calEvAdd()">Add</button></div>`;
  const ds=$('dt-days'),co=$('dt-cost');if(ds&&co&&A[5])ds.oninput=()=>{co.value=Math.round(A[3]*(+ds.value||0)*100)/100}}
function calStart(){const c=PARTY.find(x=>x.id===$('dt-who').value),A=DOWNTIME.find(a=>a[0]===$('dt-act').value);if(!c||!A)return;const days=Math.max(1,Math.round(+$('dt-days').value||A[2])),cost=Math.max(0,+$('dt-cost').value||0),note=$('dt-note').value.trim();
  if(calDT().some(x=>!x.done&&x.cid===c.id)&&!confirm(`${c.name||'They'} are already busy. Start this as well?`))return;
  if(cost&&commonGp(c)+1e-9<cost){toast(`${c.name||'They'} can't afford ${gp(cost)}: they have ${gp(commonGp(c))}`);return}
  const snap=JSON.stringify(c);if(cost){commonTake(c,cost);saveParty()}const d=calDay(),label=A[1].replace(/ \(.*\)$/,'')+(note?': '+note:''),x={id:'dt'+Date.now().toString(36),cid:c.id,who:c.name||'Unnamed',act:A[0],label,days,start:d,end:d+days,cost,note:'',at:Date.now()};
  const L=calDT();L.push(x);store.set('downtime',L);calRender();undoToast(`${x.who} starts ${label} (days ${x.start}–${x.end})${cost?' for '+gp(cost):''}`,()=>{shopRestore(c,snap);store.set('downtime',calDT().filter(y=>y.id!==x.id));calRender()})}
function calStop(id){const L=calDT(),x=L.find(y=>y.id===id);if(!x||!confirm(`Stop ${x.who}'s ${x.label} now? Coin already spent stays spent.`))return;x.done=true;x.end=Math.max(x.start,calDay());x.doneAt=Date.now();store.set('downtime',L);calRender()}
function calEvAdd(){const day=Math.max(1,Math.round(+$('ce-day').value||0)),t=$('ce-t').value.trim();if(!t){toast('Say what happens');return}const E=calEvents();E.push({id:'ce'+Date.now().toString(36),day,t});store.set('calevents',E);calRender()}
function calEvDrop(id){store.set('calevents',calEvents().filter(e=>e.id!==id));calRender()}
function clockGet(){return store.get('clock',{day:1,min:8*60,lights:[]})}
function clockAdd(m,label){const C=clockGet();C.min+=m;while(C.min>=1440){C.min-=1440;C.day++}C.lights=(C.lights||[]).map(l=>Object.assign(l,{left:l.left-m})).filter(l=>{if(l.left<=0){toast(l.n+' burns out');return false}return true});store.set('clock',C);if(label)toast(label);renderClock();calTick()}
function clockLight(n,mins){const C=clockGet();C.lights=(C.lights||[]).concat({n,left:mins});store.set('clock',C);renderClock()}
function renderClock(){const el=$('ck-box');if(!el)return;const C=clockGet(),h=Math.floor(C.min/60),mm=C.min%60,part=h<5?'deep night':h<8?'dawn':h<12?'morning':h<14?'midday':h<18?'afternoon':h<21?'evening':'night';
  el.innerHTML=`<div class="big">Day ${C.day}, ${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')} <small style="font-size:.9rem;color:var(--muted)">${part}</small></div>
  <div class="chips" style="margin:8px 0">${[[1,'+1 min (10 rounds)'],[10,'+10 min'],[60,'+1 hour'],[60,'Short rest (1 h)'],[480,'Long rest (8 h)'],[1440,'+1 day']].map(([m,l])=>`<button class="chip" type="button" onclick="clockAdd(${m},${l.includes('rest')?`'${l} done'`:'null'})">${l}</button>`).join('')}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="note" style="margin:0">Light:</span><button class="btn" type="button" onclick="clockLight('Torch',60)">🔥 Torch (1 h)</button><button class="btn" type="button" onclick="clockLight('Lantern',360)">🏮 Lantern (6 h of oil)</button><button class="btn" type="button" onclick="clockLight('Candle',60)">Candle (1 h)</button></div>
  ${(C.lights||[]).length?`<ul class="sh-ul" style="margin-top:6px">${C.lights.map((l,i)=>`<li>${esc(l.n)}: ${l.left>=60?Math.floor(l.left/60)+' h ':''}${l.left%60?l.left%60+' min':''} left <a href="#" onclick="const C=clockGet();C.lights.splice(${i},1);store.set('clock',C);renderClock();return false">put out</a></li>`).join('')}</ul>`:''}
  <div style="margin-top:8px;display:flex;gap:12px;flex-wrap:wrap"><a href="#" onclick="calOpen();return false">📅 Calendar and downtime</a><a href="#" onclick="if(confirm('Reset the clock to day 1, 08:00?')){store.set('clock',{day:1,min:480,lights:[]});renderClock()}return false">Reset</a></div>`}
// one NPC, ready to play right now
function npcQuick(){const el=$('nq-out');if(!el)return;const role=$('nq-role').value,realm=$('nq-realm').value;
  const n=pickOf(NPC_FIRST)+' '+pickOf(NPC_LAST),god=pickOf(GODS.filter(g=>!realm||g.home===realm).length?GODS.filter(g=>!realm||g.home===realm):GODS);
  el.innerHTML=`<div class="big">${esc(n)}</div><div class="kv" style="margin-top:6px"><span>Role</span><span>${esc(role||pickOf(['innkeeper','guard','merchant','priest','smith','scavenger','courier','beggar','noble','Tower climber']))}${realm?' in the '+esc(realm)+' Realm':''}</span><span>Looks</span><span>${esc(pickOf(NPC_LOOKS2))}</span><span>Voice</span><span>${esc(pickOf(NPC_VOICE))}</span><span>Manner</span><span>${esc(pickOf(NPC_PERSONA))}</span><span>Quirk</span><span>They ${esc(pickOf(NPC_TRAITS))}</span><span>Wants</span><span>${esc(pickOf(NPC_GOALS))}</span><span>Worships</span><span>${refChip(god,esc(godKey(god)))}</span></div>`}
// a journey: days on the road, the weather each day, and whether something finds the party
function travelRoll(){const el=$('tr-out');if(!el)return;const realm=$('tr-realm').value,miles=Math.max(1,+$('tr-mi').value||1),pace=PACE.find(p=>p[0]===$('tr-pace').value)||PACE[1],days=Math.ceil(miles/pace[1]);
  const W=WEATHER[realm]||WEATHER.Human,pool=MONSTERS.filter(m=>m.realm===realm),R=REALM[realm],out=[];
  for(let d=1;d<=Math.min(days,30);d++){const r=1+Math.floor(Math.random()*20),m=r>=17&&pool.length?pickOf(pool):null;out.push(`<tr><td class="num">${d}</td><td>${esc(pickOf(W))}</td><td>${m?`<b>Encounter</b> (d20 ${r}): ${refChip(m,esc(m.n))} <small>${esc(m.realm+' '+m.g)}</small>`:`<span class="note" style="margin:0">Quiet (d20 ${r})</span>`}</td></tr>`)}
  el.innerHTML=`<div class="note">${miles} miles at ${esc(pace[2].toLowerCase())}: <b>${days} day${days>1?'s':''}</b>. An encounter comes on a d20 roll of 17+ each day.${R?` The ${esc(realm)} has Pressure ${R.pressure}: travellers below that Attunement suffer strain (Rules).`:''}${days>30?' (Showing the first 30 days.)':''}</div><div class="tablewrap"><table class="t"><thead><tr><th class="num">Day</th><th>Weather</th><th>On the road</th></tr></thead><tbody>${out.join('')}</tbody></table></div>`}
function renderTools(){
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Table tools</h3><p>Everything to run a session: the clock, NPCs, travel, conditions, scavenging, mining, treasure, and shops here, plus the pages below.</p></div>
    <div class="chips" style="margin:0 0 12px">${[['prep','📋 Session prep'],['combat','⚔ Combat tracker'],['encounter','🐉 Encounters'],['hooks','🪝 Hooks'],['dice','🎲 Dice'],['journal','📓 Journal'],['party','👥 Party'],['rules','📖 Rules']].map(([t,l])=>`<a class="chip" href="${pageUrl(t)}" data-go="${t}">${l}</a>`).join('')}</div>
    <div class="tools">
      <div class="tool" id="t-clock"><h3>Session clock</h3><div class="sub">Keep the in-game time: advance it by rounds, hours, or rests, and track how long torches and lanterns have left.</div><div id="ck-box"></div></div>

      <div class="tool" id="t-npc"><h3>Quick NPC</h3><div class="sub">Someone the party just met, ready to play: name, look, voice, manner, a quirk, what they want, and their god.</div>
        <div class="form" style="grid-template-columns:1fr 1fr auto"><label>Role<input id="nq-role" placeholder="Any (innkeeper, guard…)"></label><label>Realm<select id="nq-realm"><option value="">Any</option>${REALMS.map(r=>`<option>${esc(r.n)}</option>`).join('')}</select></label><label style="align-self:end"><button class="btn primary" type="button" onclick="npcQuick()">🎲 New NPC</button></label></div>
        <div id="nq-out" style="margin-top:10px"></div></div>

      <div class="tool" id="t-trip"><h3>Travel and weather</h3><div class="sub">A journey day by day: how long it takes at your pace, the realm's weather each day, and whether something finds the party.</div>
        <div class="form" style="grid-template-columns:repeat(3,1fr) auto"><label>Realm<select id="tr-realm">${realmOpts('Human')}</select></label><label>Miles<input id="tr-mi" type="number" min="1" value="60"></label><label>Pace<select id="tr-pace">${PACE.map(p=>`<option value="${p[0]}"${p[0]==='normal'?' selected':''}>${p[2].split(':')[0]}</option>`).join('')}</select></label><label style="align-self:end"><button class="btn primary" type="button" onclick="travelRoll()">🎲 Roll the trip</button></label></div>
        <div id="tr-out" style="margin-top:10px"></div></div>

      <div class="tool" id="t-cond"><h3>Conditions</h3><div class="sub">What each condition does, at a glance.</div>
        <input class="sel" type="search" placeholder="Find a condition" style="max-width:none;width:100%;margin-bottom:8px" oninput="const q=this.value.toLowerCase();this.parentNode.querySelectorAll('.cond-row').forEach(r=>r.hidden=!!q&&!r.textContent.toLowerCase().includes(q))">
        <div class="mlist">${COND_RULES.map(([n,t])=>`<div class="cond-row" style="padding:7px 10px;border-bottom:1px solid var(--line)"><b>${n}</b><div class="note" style="margin:2px 0 0">${t}</div></div>`).join('')}</div></div>

      <div class="tool" id="t-backup"><h3>Backup</h3><div class="sub">Everything this device has saved (party, sheets, journal, encounters, Tower progress, pins, settings) in one file. Keep a copy before switching devices or if you use FAND as a Home Screen app.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn primary" onclick="backupSave()">Download backup</button><label class="btn">Restore from file<input type="file" accept=".json,application/json" hidden onchange="backupLoad(this)"></label></div>
        <div class="note" style="margin-top:8px">The DM lock, its log, and the assistant key are never included.</div></div>

      <div class="tool" id="t-mine"><h3>Mine shaft</h3><div class="sub">Dig a shaft in any realm. Each level is ${MINE_LEVEL_FT} ft deeper and rarer; search for veins, mine them, and mind the realm's hazards.</div><div id="mn-box"></div></div>

      <div class="tool" id="t-scav"><h3>Scavenge a corpse</h3><div class="sub">Every part one corpse holds, and the Scavenging rolls to take them.</div><div id="sc-box"></div></div>

      <div class="tool" id="t-dmg"><h3>Damage vs. Armor Class</h3><div class="sub">A hit that beats the Dodge deals its damage minus the target's AC (at least 1).</div>
        <div class="form"><label>Incoming damage<input type="number" id="d-dmg" value="24" min="0"></label><label>Target AC<input type="number" id="d-ac" value="10" min="0"></label></div>
        <div class="out"><div class="big" id="d-out"></div><div class="kv" id="d-kv"></div><div class="bar"><i id="d-bar"></i></div></div></div>

      <div class="tool" id="t-grade"><h3>Material grade</h3><div class="sub">Rank, Item Level, Potency, rarity, and price from realm and grade.</div>
        <div class="form"><label>Realm<select id="g-realm">${realmOpts('Mysterious')}</select></label><label>Grade<input type="number" id="g-g" value="6" min="1" max="10"></label>
        <label class="chk full"><input type="checkbox" id="g-sup"> Supply (no property, ⅕ price)</label></div>
        <div class="out"><div class="big" id="g-out"></div><div class="kv" id="g-kv"></div></div><div id="g-ex" style="margin-top:10px"></div></div>

      <div class="tool" id="t-ref"><h3>Refining planner</h3><div class="sub">3 of a grade make 1 of the next; 5 + a binding agent + a Realm Forge step up a realm.</div>
        <div class="form"><label>From realm<select id="r-fr">${realmOpts('Human')}</select></label><label>From grade<input type="number" id="r-fg" value="1" min="1" max="10"></label>
        <label>To realm<select id="r-tr">${realmOpts('Mysterious')}</select></label><label>To grade<input type="number" id="r-tg" value="1" min="1" max="10"></label>
        <label class="full">How many<input type="number" id="r-n" value="1" min="1"></label></div>
        <div class="out"><div class="big" id="r-out"></div><div class="kv" id="r-kv"></div></div><div class="note">Assumes a realm step turns five grade-10 materials into one grade-1 material of the next tier.</div></div>

      <div class="tool" id="t-enc"><h3>Encounter &amp; loot roller</h3><div class="sub">Random monsters from a realm's Bestiary, with their drops and value.</div>
        <div class="form"><label>Realm<select id="e-realm">${realmOpts('Human')}</select></label><label>Monsters<input type="number" id="e-n" value="3" min="1" max="12"></label>
        <label>Min grade<input type="number" id="e-lo" value="1" min="1" max="10"></label><label>Max grade<input type="number" id="e-hi" value="5" min="1" max="10"></label>
        <label class="chk"><input type="checkbox" id="e-hb"> Homebrew only</label><div style="display:flex;justify-content:flex-end"><button class="btn primary" id="e-go">Roll encounter</button></div></div>
        <div class="enc" id="e-out"></div></div>

      <div class="tool" id="t-loot"><h3>Treasure</h3><div class="sub">A pouch, chest, or hoard for a realm and party level: gold at the realm's prices, materials of the realm at a grade that fits the level, and a chance of an item.</div>
        <div class="form"><label>Realm<select id="l-realm">${realmOpts('Human')}</select></label><label>Party level<input type="number" id="l-lv" value="5" min="1" max="100"></label>
        <label>Size<select id="l-size"><option value="0">Pouch (a single foe)</option><option value="1" selected>Chest (an encounter)</option><option value="2">Hoard (a boss or a lair)</option></select></label><div style="display:flex;justify-content:flex-end;align-items:end"><button class="btn primary" id="l-go">🎲 Roll treasure</button></div></div>
        <div id="l-out" style="margin-top:10px"></div></div>

      <div class="tool" id="t-cur"><h3>Currency converter</h3><div class="sub">Swap coin between realms. Moneychangers take ${EXCHANGE_FEE*100}%.</div>
        <div class="form"><label>Amount<input type="number" id="x-n" value="100" min="0"></label><label>From<select id="x-a">${REALMS.filter(r=>CURRENCY[r.n]&&CURRENCY[r.n].coin).map(r=>`<option value="${esc(r.n)}">${esc(CURRENCY[r.n].coin)} (${esc(r.n)})</option>`).join('')}</select></label>
        <label>To<select id="x-b">${REALMS.filter(r=>CURRENCY[r.n]&&CURRENCY[r.n].coin).map(r=>`<option value="${esc(r.n)}"${r.n==='Hell'?' selected':''}>${esc(CURRENCY[r.n].coin)} (${esc(r.n)})</option>`).join('')}</select></label>
        <label class="chk" style="align-self:end"><input type="checkbox" id="x-fee" checked> Moneychanger fee</label></div>
        <div class="out"><div class="big" id="x-out"></div><div class="kv" id="x-kv"></div></div></div>
      <div class="tool" id="t-travel"><h3>Realm Pressure check</h3><div class="sub">Compare a traveler's Attunement with each realm's Pressure.</div>
        <div class="form"><label class="full">Attunement<input type="number" id="p-a" value="2" min="0" max="9"></label></div>
        <div class="enc" id="p-out"></div><div class="note">Strain is Pressure minus Attunement: 1 disadvantage on Constitution saves; 2 also 1 level of exhaustion per day; 3 also no benefit from long rests; 4+ 1 level of exhaustion every hour.</div></div>

      <div class="tool" id="t-slots"><h3>Spell slots</h3><div class="sub">From the vault's Spell Slots rules: full casters start with 3 first-level slots; half casters get none until level 2; Warlock slots return on a short rest.</div>
        <div class="form"><label>Class<select id="ss-c">${Object.keys(CASTER).map(c=>`<option>${c}</option>`).join('')}</select></label><label>Level<input type="number" id="ss-l" value="5" min="1" max="100"></label><label>Schools held<input type="number" id="ss-s" value="1" min="1" max="20"></label></div>
        <div class="out" id="ss-out"></div></div>

      ${sbToolHTML()}

      <div class="tool full" id="t-shop" style="grid-column:1/-1"><h3>Merchant shop</h3><div class="sub">What a shop has in stock today, priced in gp and the realm's own coin, 50% over list price. Void-grade materials and above are never sold.</div>
        <div class="form" style="grid-template-columns:repeat(4,1fr)"><label>Realm<select id="s-realm">${realmOpts('Human',r=>r.base)}</select></label>
        <label>Shop<select id="s-kind">${SHOP_KINDS.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></label>
        <label>Settlement<select id="s-size"><option value="1">Village</option><option value="2" selected>Town</option><option value="3">City</option><option value="4">Capital</option></select></label>
        <label style="align-self:end"><button class="btn" id="s-roll" type="button" style="width:100%">🎲 Restock</button></label></div>
        <div id="s-out" style="margin-top:10px"></div></div>
    </div></div>`;
  renderMineTool();renderScavTool();renderClock();npcQuick();travelRoll();
  const v=id=>$(id).value,n=id=>+$(id).value||0,on=(ids,f)=>{ids.forEach(i=>{$(i).addEventListener('input',f);$(i).addEventListener('change',f)});f()};
  const clampG=g=>Math.min(10,Math.max(1,Math.round(g||1)));
  sbToolBind();
  // dice and spell slots
  const slotsOut=()=>{const r=schoolSlots(slotsFor(v('ss-c'),n('ss-l')),n('ss-s')||1);$('ss-out').innerHTML=!r?'<div class="note">The vault\'s Spell Slots note isn\'t loaded.</div>':r.pact?`<div class="big">${r.n} × ${esc(r.lvl)}-level</div><div class="note">Pact Magic: always cast at this level; all slots return on a short rest.${r.pen?` −${r.pen} for extra schools.`:''}</div>`:r.slots.every(x=>!x)?'<div class="big">No slots yet</div><div class="note">Half casters gain their first slots at level 2.</div>':`<div class="kv">${r.slots.map((k,i)=>k?`<span>${['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]}</span><span><b>${k}</b> ${'●'.repeat(k)}</span>`:'').join('')}</div>${r.pen?`<div class="note">−${r.pen} slot${r.pen>1?'s':''} at each level for holding ${r.pen+1} schools (never below 1).</div>`:''}`};
  on(['ss-c','ss-l','ss-s'],slotsOut);
  // merchant shop
  let shopSeed=(Math.random()*2**31)|0;
  const shop=()=>{const res=rollShop(v('s-realm'),v('s-kind'),+v('s-size'),shopSeed+v('s-realm').length*7+v('s-kind').length);const realm=v('s-realm');
    if(!res||(!res.mats.length&&!res.bps.length)){$('s-out').innerHTML='<div class="empty">Nothing in stock here. Try a bigger settlement or another shop.</div>';return}
    const row=(x,label,sub,price,q)=>`<tr><td><a href="#" data-ref="${ref(x)}">${esc(label)}</a> <small style="color:var(--muted)">${esc(sub)}</small></td><td class="num">${q!=null?q:''}</td><td class="num">${gp(price)}</td><td class="num" style="color:var(--muted)">${localPrice(price,realm)||''}</td></tr>`;
    $('s-out').innerHTML=`<div class="tablewrap"><table class="t"><thead><tr><th>Item</th><th class="num">In stock</th><th class="num">Price</th><th class="num">Local coin</th></tr></thead><tbody>${res.mats.map(({m,q,price})=>row(m,m.n,m.gr+(m.pn?' · '+m.pn:''),price,q)).join('')}${res.bps.length?`<tr><td colspan="4" style="font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-top:12px">Finished goods</td></tr>`+res.bps.map(({b,price})=>row(b,b.n,(genOf(b)||b.cat)+' · Lv '+b.lv+(b.r?' · '+b.r:''),price,1)).join(''):''}</tbody></table></div><div class="note">Shop prices are 50% over the list price. Merchants buy at half the list price (a third of these). Finished goods cost their materials ×1.5 plus labor, then the shop's 50%.</div>`};
  on(['s-realm','s-kind','s-size'],shop);$('s-roll').onclick=()=>{shopSeed=(Math.random()*2**31)|0;shop()};
  // damage
  on(['d-dmg','d-ac'],()=>{
    const d=Math.max(0,n('d-dmg')),ac=Math.max(0,n('d-ac')),fin=acTaken(d,ac,1);
    $('d-out').textContent=fmt(fin)+' damage';
    $('d-kv').innerHTML=`<span>Damage</span><span>${fmt(d)}</span><span>AC</span><span>− ${fmt(ac)}</span><span>Blocked</span><span>${fmt(d-fin)}${d?' ('+Math.round((d-fin)/d*100)+'%)':''}</span>`;
    $('d-bar').style.width=(d?(d-fin)/d*100:0)+'%';
  });
  // grade
  on(['g-realm','g-g','g-sup'],()=>{
    const r=REALM[v('g-realm')],g=clampG(n('g-g')),rank=(r.tier-1)*10+g,il=Math.ceil(rank/2),pot=Math.min(50,Math.max(1,il+(g===10?10:g===9?5:0)));
    const t=r.tier,rar=t===1?(g<=5?'Common':'Uncommon'):t===2?(g<=5?'Uncommon':'Rare'):t===3?(g<=5?'Rare':'Very Rare'):t===4?'Very Rare':t===5?(g<=5?'Very Rare':'Legendary'):t<=7?'Legendary':'Artifact';
    const sup=$('g-sup').checked;let pr=r.base?r.base*g*(g>=9?2:1):0;if(sup&&pr)pr=Math.max(1,Math.round(pr/5));
    $('g-out').textContent='Rank '+rank;
    $('g-kv').innerHTML=`<span>Item Level</span><span>${il}</span><span>Potency</span><span>${sup?'— (supply)':pot}</span><span>Rarity</span><span>${rar}</span><span>Price</span><span>${pr?gp(pr)+' (sells for '+gp(Math.floor(pr/2))+')':'Not sold'}</span>`;
    const ex=MATS.filter(m=>m.realm===r.n&&m.g===g).sort(byName);
    $('g-ex').innerHTML=ex.length?`<div class="blk"><h4>${ex.length} materials at ${esc(r.n)} ${g}</h4></div><div class="chips">${ex.slice(0,18).map(m=>refChip(m)).join('')}${ex.length>18?`<button class="chip" data-go="materials" data-setup='${esc(JSON.stringify({side:r.n,f:{g:String(g)}}))}'>+${ex.length-18} more</button>`:''}</div>`:'';
  });
  // refining
  on(['r-fr','r-fg','r-tr','r-tg','r-n'],()=>{
    const A=REALM[v('r-fr')],B=REALM[v('r-tr')],fg=clampG(n('r-fg')),tg=clampG(n('r-tg')),N=Math.max(1,Math.round(n('r-n')));
    const s=(A.tier-1)*10+fg,e=(B.tier-1)*10+tg;
    if(e<s){$('r-out').textContent='Pick a higher target';$('r-kv').innerHTML='<span>Note</span><span>Refining only moves materials up.</span>';return}
    // walk down from target to source
    let need=N,binders=0,forges=0,crafts=0,tier=B.tier,g=tg;
    while(tier>A.tier||g>fg){
      if(g>1&&!(tier===A.tier&&g<=fg)){crafts+=need;need*=3;g--}
      else{binders+=need;forges+=need;crafts+=need;need*=5;tier--;g=10}
    }
    $('r-out').textContent=fmt(need)+' × '+A.n+' '+fg;
    const cost=A.base?A.base*fg*(fg>=9?2:1)*need:0,val=B.base?B.base*tg*(tg>=9?2:1)*N:0;
    $('r-kv').innerHTML=`<span>Produces</span><span>${fmt(N)} × ${esc(B.n)} ${tg}</span><span>Refining steps</span><span>${fmt(crafts)}</span><span>Binding agents</span><span>${fmt(binders)}</span><span>Realm Forge uses</span><span>${fmt(forges)}</span><span>Input value</span><span>${cost?gp(cost):'not sold'}</span><span>Output value</span><span>${val?gp(val):'not sold'}</span>`;
  });
  // encounter
  const roll=()=>{
    const r=REALM[v('e-realm')],lo=clampG(n('e-lo')),hi=Math.max(lo,clampG(n('e-hi'))),k=Math.min(12,Math.max(1,n('e-n'))),hb=$('e-hb').checked;
    const pool=MONSTERS.filter(m=>m.realm===r.n&&m.g>=lo&&m.g<=hi&&(!hb||m.hb));
    if(!pool.length){$('e-out').innerHTML=`<div class="note">No ${hb?'homebrew ':''}monsters in ${esc(r.n)} between grades ${lo} and ${hi}.</div>`;return}
    let total=0;const rows=[];
    for(let i=0;i<k;i++){
      const m=pool[Math.floor(Math.random()*pool.length)];
      let drops=(m.drops||[]).map(d=>findMat(d[0])).filter(Boolean),sug=false;
      if(!drops.length){drops=suggestDrops(m,2);sug=true}
      const val=drops.reduce((a,x)=>a+(x.price||0),0);total+=val;
      rows.push(`<div class="enc-row"><div class="h"><button data-ref="${ref(m)}">${esc(m.n)}</button>${realmB(m.realm+' '+m.g)}${m.cr?`<span class="b">CR ${esc(m.cr)}</span>`:'<span class="b gold">Homebrew</span>'}<span class="count" style="margin-left:auto">${val?gp(val):''}</span></div><div class="chips">${drops.map(x=>matChip(x.n,x.price?gp(x.price):'')).join('')}${sug?'<span class="chip" style="border-style:dashed">suggested</span>':''}</div></div>`);
    }
    $('e-out').innerHTML=rows.join('')+`<div class="out" style="margin-top:4px"><div class="kv"><span>Loot value</span><span><b style="color:var(--gold2)">${gp(total)}</b> (one of each drop)</span><span>Pool</span><span>${pool.length} monsters</span></div></div>`;
  };
  $('e-go').onclick=roll;roll();
  // Treasure: gold follows the realm's prices and rises 15% a level above the realm's own band; materials are the realm's own,
  // their grade climbing one a level inside the realm's band, as Tower rewards do; items come from Blueprints at or near the level.
  const loot=()=>{const rn=$('l-realm').value,lv=Math.max(1,Math.min(MAX_LEVEL,+$('l-lv').value||1)),sz=+$('l-size').value,{start,gold,favor,grade,mats,items,val}=rollTreasure(rn,lv,sz);
    $('l-out').innerHTML=`<div class="mlist"><div class="enc-row" style="padding:8px 12px">${favor?`<b>${fav(favor)}</b> <span class="note" style="margin:0">(the ${esc(rn)} trades in Favor, not coin)</span>`:`<b>${gp(gold)}</b>${localPrice(gold,rn)?` <span class="note" style="margin:0">(${localPrice(gold,rn)})</span>`:''}`}</div>${mats.map(x=>`<div class="enc-row" style="padding:8px 12px">${x.q>1?x.q+' × ':''}${refChip(x.m,esc(x.m.n),'G'+x.m.g)}</div>`).join('')}${items.map(b=>`<div class="enc-row" style="padding:8px 12px">${refChip(b,esc(b.n),b.r)}</div>`).join('')}</div>
      <div class="note">${favor?`Plus materials worth ${gp(val)} at list price.`:`About ${gp(val)} in all (materials at list price).`} Grade ${grade} fits level ${lv} in the ${esc(rn)} Realm${lv<start?`, which is above the party (its band starts at level ${start})`:''}.</div>`};
  $('l-go').onclick=loot;['l-realm','l-lv','l-size'].forEach(i=>$(i).addEventListener('change',loot));loot();
  // currency
  on(['x-n','x-a','x-b','x-fee'],()=>{
    const A=CURRENCY[v('x-a')],B=CURRENCY[v('x-b')],amt=Math.max(0,n('x-n')),g=amt*A.gp,fee=$('x-fee').checked&&v('x-a')!==v('x-b')?g*EXCHANGE_FEE:0,out=(g-fee)/B.gp;
    $('x-out').textContent=(out%1?out.toFixed(2):fmt(out))+' '+(out===1?B.coin.toLowerCase():B.pl);
    $('x-kv').innerHTML=`<span>Worth</span><span>${gp(g)}</span><span>Fee</span><span>${fee?gp(Math.round(fee)):'none'}</span><span>Rate</span><span>1 ${esc(A.coin.toLowerCase())} = ${(A.gp/B.gp)%1?(A.gp/B.gp).toFixed(3):fmt(A.gp/B.gp)} ${esc(B.pl)}</span>`;
  });
  // pressure
  on(['p-a'],()=>{const a=n('p-a');$('p-out').innerHTML=REALMS.map(r=>{const d=r.pressure-a;return `<div class="enc-row" style="display:flex;align-items:center;gap:10px;padding:7px 12px"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:${r.color}"></span><a href="#" data-ref="${ref(r)}" style="color:var(--text);text-decoration:none;font-weight:600">${esc(r.n)}</a><span class="b ghost">Pressure ${r.pressure}</span><span style="margin-left:auto" class="b ${d>0?'red':'green'}">${d>0?'Strain +'+d:'Safe'}</span></div>`}).join('')});
  toolTabs();
}

// ════════════════════════════════════════════════════════════════
//  Table tools: Craft, Party, Encounters, Combat
//  All state is kept in this browser (localStorage); Party can be exported and imported as JSON.
// ════════════════════════════════════════════════════════════════
// Armor drawbacks come from what is actually worn: each piece's slot and the weight of its material
// (metal = heavy, bone/scale/stone/gem = medium, hide/cloth and the rest = light). Light armor never has drawbacks.
// A full heavy set (metal on 8+ armor units) keeps the campaign's rule: you lose Acrobatics, Athletics, and Dexterity.
const ARMOR_WEIGHT={O:'Heavy',B:'Medium',S:'Medium',G:'Medium'};
const weightOfCodes=codes=>codes.includes('O')?'Heavy':codes.some(c=>ARMOR_WEIGHT[c])?'Medium':'Light';
const PIECE_DRAWBACKS={
  Body:{Heavy:['Disadvantage on Dexterity (Stealth) checks','Speed −5 ft'],Medium:['Disadvantage on Dexterity (Stealth) checks']},
  Head:{Heavy:['Disadvantage on Wisdom (Perception) checks that rely on hearing or sight to the sides']},
  Hands:{Heavy:['Disadvantage on Dexterity (Sleight of Hand) checks and on fine work with tools'],Medium:['Disadvantage on Dexterity (Sleight of Hand) checks']},
  Feet:{Heavy:['Disadvantage on Dexterity (Stealth) checks (loud footsteps)']},
  Shoulders:{Heavy:['Disadvantage on Dexterity (Acrobatics) checks']},
  Back:{Heavy:['Disadvantage on Dexterity (Acrobatics) checks']},
  Mount:{Heavy:['The mount\'s speed −10 ft'],Medium:['The mount\'s speed −5 ft']},
  Tower:{Heavy:['Speed −5 ft','Disadvantage on Dexterity (Stealth) checks'],Medium:['Speed −5 ft'],Light:['Speed −5 ft']},
  Shield:{Heavy:['Disadvantage on Dexterity (Acrobatics) checks']},
};
// Casting in armor (owner-approved, 2026-11-13): each class is trained for some weight of armor (Fighters and Paladins
// all of it, Wizards and Sorcerers none). A spellcaster wearing a piece heavier than their training, or a shield without
// shield training, is that many steps over (light 1, medium 2, heavy 3; an untrained shield adds 1). Each step costs −2
// spell Accuracy and spell save DC, and spells fail on a d20 roll of 3 × steps or lower (the slot or use is spent).
// A multiclass character uses the better training of their two classes.
const ARMOR_TRAIN={Fighter:3,Paladin:3,Cleric:2,Druid:2,Ranger:2,Barbarian:2,Artificer:2,Bard:1,Warlock:1,Rogue:1,Wizard:0,Sorcerer:0,Monk:0};
const SHIELD_TRAIN=new Set(['Fighter','Paladin','Cleric','Druid','Ranger','Barbarian','Artificer']);
// subclasses that train more armor (as in 5e): the heavy-armor Cleric domains and the Armorer, medium for Valor, Swords and Hexblade, light for Bladesinging
const SUB_TRAIN=[[/^Cleric$/,/Life|Nature|Tempest|War|Forge|Order|Twilight/,3,true],[/^Artificer$/,/Armorer/,3,true],[/^Bard$/,/Valor/,2,true],[/^Bard$/,/Swords/,2,false],[/^Warlock$/,/Hexblade/,2,true],[/^Wizard$/,/Bladesing/,1,false]];
const ARMOR_W={Light:1,Medium:2,Heavy:3},TRAIN_NAME=['no armor','light armor','light and medium armor','all armor'];
function castArmor(c,worn){const cls=[c.cls,c.cls2&&+c.lv2>0?c.cls2:null].filter(Boolean);if(!cls.some(k=>CASTER[k]))return null;
  const subs=[[c.cls,c.sub],[c.cls2,c.sub2]].filter(([k])=>k&&cls.includes(k)),st=subs.map(([k,s])=>SUB_TRAIN.find(([a,b])=>a.test(k)&&b.test(s||''))).filter(Boolean);
  const train=Math.max(0,...cls.map(k=>ARMOR_TRAIN[k]??1),...st.map(x=>x[2])),shT=cls.some(k=>SHIELD_TRAIN.has(k))||st.some(x=>x[3]);
  const body=(worn||[]).filter(b=>b.cat!=='Shield'),heavy=body.reduce((a,b)=>{const pc=armorPiece(b);return pc.slot==='Mount'?a:Math.max(a,ARMOR_W[pc.weight]||0)},0),shield=(worn||[]).some(b=>b.cat==='Shield');
  const steps=Math.max(0,heavy-train)+(shield&&!shT?1:0);if(!steps)return null;
  return {steps,acc:-2*steps,dc:-2*steps,fail:Math.min(15,3*steps),train,heavy,shield:shield&&!shT,trainN:TRAIN_NAME[train],wornN:['','light','medium','heavy'][heavy]||''}}
// a caster's armor fitted to their training (the generator and the builder's starting kit): each piece too heavy to cast
// in is swapped for the best piece of the same slot they are trained for (at their level), or dropped; an untrained shield goes
function armFit(c){const s=charStats(c);if(!s.castArm)return c;const L=+c.level||1,A=s.castArm,trained=A.train,shOk=!A.shield,mats=b=>armorPiece(b);
  c.gear=(c.gear||[]).flatMap(n=>{const b=findBP(n);if(!b||!ARMOR_CATS.includes(b.cat))return [n];if(b.cat==='Shield')return shOk?[n]:[];const pc=mats(b);if(pc.slot==='Mount'||(ARMOR_W[pc.weight]||0)<=trained)return [n];
    const alt=BPS.filter(x=>x.cat==='Armor'&&(+x.lv||1)<=L&&!x.design&&mats(x).slot===pc.slot&&(ARMOR_W[mats(x).weight]||0)<=trained).sort((x,y)=>(+y.ac||0)-(+x.ac||0)||(+y.lv||1)-(+x.lv||1))[0];return alt?[alt.n]:[]});
  return c}
const SET_DRAWBACKS=[['Heavy',8,'Full heavy set: you lose Acrobatics, Athletics, and Dexterity (Dexterity counts as 10 and you cannot use it for AC, attacks, or saves that would benefit).'],
  ['Medium',8,'Full medium set: disadvantage on Strength (Athletics) and Dexterity (Acrobatics) checks.']];
const SLOT_UNIT_ALL={Body:4,Head:2,Hands:1,Feet:1,Shoulders:1,Back:1,Enhancement:1,Mount:4,Buckler:1,Shield:2,Tower:3};
// piece: {slot, weight}
function pieceDrawbacks(pc){return ((PIECE_DRAWBACKS[pc.slot]||{})[pc.weight])||[]}
function armorPiece(b){const ms=(b.mats||[]).map(findMat).filter(Boolean);return {slot:b.slot||(b.cat==='Shield'?'Shield':'Body'),weight:weightOfCodes(ms.map(matCode)),n:b.n,b}}
function setDrawbacks(pieces){
  const out=[];pieces.forEach(pc=>pieceDrawbacks(pc).forEach(d=>{const x=out.find(o=>o.d===d);if(x)x.from.push(pc.n);else out.push({d,from:[pc.n]})}));
  const speed=out.filter(o=>/^Speed −(\d+)/.test(o.d));if(speed.length>1){const tot=speed.reduce((a,o)=>a+(+o.d.match(/\d+/)[0]),0);const from=speed.flatMap(o=>o.from);speed.forEach(o=>out.splice(out.indexOf(o),1));out.unshift({d:`Speed −${tot} ft`,from})}
  SET_DRAWBACKS.forEach(([w,min,d])=>{const u=pieces.filter(pc=>pc.weight===w||(w==='Medium'&&pc.weight==='Heavy')).filter(pc=>!['Mount','Enhancement','Buckler','Shield','Tower'].includes(pc.slot)).reduce((a,pc)=>a+(SLOT_UNIT_ALL[pc.slot]||0),0);
    if(u>=min&&!out.some(o=>/^Full heavy/.test(o.d))&&!(w==='Medium'&&pieces.filter(pc=>pc.weight==='Heavy'&&!['Mount','Enhancement','Buckler','Shield','Tower'].includes(pc.slot)).reduce((a,pc)=>a+(SLOT_UNIT_ALL[pc.slot]||0),0)>=8))out.unshift({d,from:['the whole set']})});
  return out;
}
const drawbackText=list=>list.length?list.map(o=>o.d).join('; '):'None';
const ARMOR_CATS=['Armor','Shield'];
// Campaign rule: a contract can only be gained in one of four ways
const CT_WAYS=[['follower','Met a follower of the god'],['ritual','A ritual with the god\'s core material'],['temple','Found the god\'s temple'],['item','An item integrated with the god']];
const ctWay=k=>(CT_WAYS.find(w=>w[0]===k)||[])[1]||'';
const coreMat=g=>g&&(g.sig||[])[0]||'';
const ctWayOpts=(sel,id,extra='')=>`<select class="sel"${id?` id="${id}"`:''} ${extra}><option value="">How was it gained?…</option>${CT_WAYS.map(([k,l])=>`<option value="${k}"${k===sel?' selected':''}>${l}</option>`).join('')}</select>`;
const ctWaysHTML=g=>`<ul><li><b>Meet a follower</b> of ${g?esc(godKey(g)):'the god'} (a priest, a contractor, or a believer who vouches for you).</li><li><b>Perform a ritual</b> with ${g?(coreMat(g)?'its core material, <b>'+esc(coreMat(g))+'</b>':'its core material'):'the god\'s core material (the first of its signature materials)'}.</li><li><b>Find its temple</b> or a shrine and ask there.</li><li><b>Hold an item integrated with it</b>: a relic, or gear with its Rune or core material worked into it.</li></ul>`;
// God contract ranks, from the vault's God Contracts note (v1.08, v1.15). sig: which of the god's three
// signature materials (Normal, Senior, Apostle) the reward refers to.
const CONTRACTS=[
  {r:'Minor',holders:'Unlimited',power:'One cantrip from the god\'s Law; +1 to one skill tied to the god',ac:1,grant:'',duty:'Obey the god\'s core rule (its Law); a small task or offering now and then',reward:'Buy the temple\'s general goods (basic materials of every kind), its temple stock, and its Minor signature material at the god\'s temples at a discount',rise:'',brk:'All contract power is lost immediately',multi:true},
  {r:'Normal',holders:'Unlimited',power:'One 1st-level spell of the god\'s Law, once per long rest; the god can send you dreams',ac:2,grant:'',duty:'Obey the god\'s core rule (its Law); a small task or offering now and then',reward:'The god\'s temples sell its Normal signature material to you',sig:0,rise:'Serve faithfully and finish the god\'s tasks',brk:'All contract power is lost immediately',multi:true},
  {r:'Major',holders:'Hundreds',power:'The god\'s spells up to 2nd level; you can sense other contractors of your god',ac:3,grant:'',duty:'Spread worship (bring new followers); take missions from the god\'s higher contractors',reward:'One free Normal signature material per completed task; the temples sell its Major signature material to you; temple crafters work for you at half cost',sig:0,rise:'Serve faithfully and finish the god\'s tasks',brk:'Power is lost, and the god places a curse: a DM-chosen disadvantage until you atone or the god dies'},
  {r:'Senior',holders:'Dozens',power:'Spells up to 3rd level; resistance to one damage type tied to the god',ac:4,grant:'Minor',duty:'Spread worship (bring new followers); take missions from the god\'s higher contractors',reward:'One Senior signature material each time you rise in rank or finish a major task; access to one existing Blueprint that fits the god\'s theme',sig:1,rise:'Bring the god a meaningful number of new followers, or win a notable victory in its name',brk:'Power is lost, and the god places a curse: a DM-chosen disadvantage until you atone or the god dies'},
  {r:'Apostle',holders:'12',power:'Spells up to 5th level; a Secondary-tier link to the god\'s Rune, which unlocks one unique ability',ac:6,grant:'Normal',duty:'Lead a region or order for the god; answer any summons',reward:'One Apostle signature material on taking the seat; the god\'s home realm counts as a Realm Forge for you',sig:2,rise:'An Apostle seat must be empty (by death, betrayal, or promotion), and the god must choose you',brk:'Power and Natural AC are lost, and the god sends its other contractors to hunt you'},
  {r:'5th Finger',holders:'1',power:'Spells up to 6th level; a Primary-tier fragment of the god\'s Rune, with its own unique ability',ac:8,grant:'Major',finger:5},
  {r:'4th Finger',holders:'1',power:'Spells up to 7th level; immune to being charmed or frightened by other gods\' contractors',ac:10,grant:'Senior',finger:4},
  {r:'3rd Finger',holders:'1',power:'Spells up to 8th level; once per day, use one of the god\'s Rune spells without holding the Rune',ac:12,grant:'Senior',finger:3},
  {r:'2nd Finger',holders:'1',power:'Spells up to 9th level; can create new spells from the god\'s Law, which normally only those close to godhood can do',ac:14,grant:'Apostle',finger:2},
  {r:'1st Finger',holders:'1',power:'Acts as the god\'s avatar: speaks with its voice and can channel its power directly; everything above',ac:16,grant:'Apostle',finger:1},
];
// Website proposal, making the contract rewards concrete: a temple discount on the god's goods (coin or Favor) and the
// Favor a contractor earns for each task done for the god.
[[10,1],[20,2],[25,3],[30,5],[40,8],[50,12],[50,15],[50,20],[50,25],[50,30]].forEach(([d,f],i)=>{CONTRACTS[i].disc=d;CONTRACTS[i].favor=f});
CONTRACTS.forEach(c=>{if(c.finger){c.duty='Act as the god\'s weapon in wars with other gods; guard the god\'s Runes; carry out the god\'s bets on mortal wars and successions';
  c.reward=c.finger===1?'The god\'s Finger relic itself':'A personal relic of your own design, crafted by the god\'s forges from its Apostle and Finger signature materials; Potency counts as 10 higher than normal (two ranks)';if(c.finger>1)c.sig=2;
  c.rise='The position must be empty, or you defeat its current holder';c.brk='The Rune fragment tears itself out. Constitution save DC '+(10+2*CONTRACTS.indexOf(c)+2)+'; on a failure you drop to 0 hit points. The god\'s whole Hand hunts you'}});
const CONTRACT_RANKS=CONTRACTS.map(c=>c.r);
const OLD_RANK={'Rank 2':'Normal','Rank 3':'Major','Rank 4':'Senior','Rank 5':'Apostle'};
const contractOf=r=>CONTRACTS.find(c=>c.r===(OLD_RANK[r]||r));
// What a rank gives, filled in with one god's own materials and relic when a god is given.
function contractReward(c,g){
  let t=esc(c.reward);if(!g)return t;
  const sig=(g.sig||[]),m=c.sig!=null&&sig[c.sig];
  if(g.rk)t=t.replace(/(Minor|Major|Finger) signature material/g,(w,rk)=>{const x=g.rk[rk]&&findMat(g.rk[rk]);return x?`${w} (<a href="#" data-ref="${ref(x)}">${esc(x.n)}</a>)`:w});
  if(m){const x=findMat(m),pr=x?(x.price?gp(Math.round(x.price*(100-c.disc)/100)):favorOf(x)?fav(Math.max(1,Math.round(favorOf(x)*(100-c.disc)/100))):''):'';t=t.replace(/(Normal|Senior|Apostle) signature material/,`$1 signature material (${x?`<a href="#" data-ref="${ref(x)}">${esc(m)}</a>`:esc(m)}${pr?`; ${pr} at this rank's discount`:''})`)}
  if(c.finger===1&&g.relic)t+=`: <b>${esc(g.relic)}</b>`;
  if(c.r==='Apostle'&&g.home)t=t.replace('home realm',`home realm (${esc(g.home)})`);
  return t;
}
// The spells a god gives its contractors (g.csp: one of each level 0-9, chosen to fit the god's Runes). The rank sets
// the highest level: Minor a cantrip, Normal 1st, Major 2nd, Senior 3rd, Apostle 5th, then 6th to 9th for the Fingers.
// Contract spells are gifts, not learnt: they work in every realm (their dice follow the god's home realm), need no
// spell slots (the cantrip at will, each other spell once per long rest, or with the caster's own slots), and are
// lost if the contract breaks.
const CT_SPELL_MAX=[0,1,2,3,5,6,7,8,9,9];
const ctSpellMax=ct=>CT_SPELL_MAX[CONTRACTS.indexOf(ct)]??0;
const ctRankForLv=lv=>CONTRACTS[CT_SPELL_MAX.findIndex(m=>m>=lv)];
const CT_SPELL_RULE='Contract spells are the god\'s gift, not learnt: they work in every realm (their dice follow the god\'s home realm) and need no spell slots: the cantrip at will, each other spell once per long rest (or with your own slots, if you have them). Breaking the contract takes them away.';
function godSpellChip(n,lv){const s=SP.find(x=>x.n===n),t=lv?'level '+lv:'cantrip';return s?refChip(s,esc(n),t):`<a class="chip" href="${pageUrl('spells')}" onclick="go('spells',{q:${esc(JSON.stringify(n))}});return false">${esc(n)} <small>${t}</small></a>`}
function godSpellsHTML(g,ct){if(!g||!(g.csp||[]).length)return '';const max=ct?ctSpellMax(ct):9;
  return `<div class="mlist">${g.csp.map((n,lv)=>{const r=ctRankForLv(lv),on=!ct||lv<=max;return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:2px 0;${on?'':'opacity:.45'}">${godSpellChip(n,lv)}<small style="color:var(--muted)">${r?'from '+esc(r.r):''}${ct&&!on?' (not yet)':''}</small></div>`}).join('')}</div><div class="note">${esc(CT_SPELL_RULE)}</div>`}
function contractTable(g){
  return `<div class="tablewrap"><table class="t"><thead><tr><th>#</th><th>Rank</th><th>Power granted</th><th class="num">Natural AC</th><th class="num">Temple discount</th><th class="num">Favor per task</th><th>Reward</th></tr></thead><tbody>${CONTRACTS.map((c,i)=>`<tr${g&&c.finger&&g.seated!=null&&c.finger>5-g.seated?' style="opacity:.6" title="Seat filled"':''}><td class="num">${i+1}</td><td style="white-space:nowrap"><b>${c.r}</b><br><small style="color:var(--muted)">${esc(c.holders)} per god</small></td><td>${esc(c.power)}${c.grant?`<br><small style="color:var(--muted)">Can grant contracts up to ${c.grant}</small>`:''}</td><td class="num">+${c.ac}</td><td class="num">${c.disc}%</td><td class="num">⟡ ${c.favor}</td><td>${contractReward(c,g)}</td></tr>`).join('')}</tbody></table></div><div class="note">The temple discount applies to everything the god's temples sell, including its signature materials: in coin, or in <b>Favor</b> for Void-grade and deeper materials, which are never sold for coin. Favor is earned per task done for the god (the column above) and is spent only with that god.</div>`;
}
const CONDITIONS=['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious','Exhaustion','Concentrating'];
const uid=()=>Math.random().toString(36).slice(2,9);
const BP_IDX=new Map();BPS.forEach(b=>{if(!BP_IDX.has(lc(b.n)))BP_IDX.set(lc(b.n),b)});
// the DM's own filing (owner's request, 2026-11-24): a DM can put any Blueprint under another item type; kept in the account
// with the rest of the DM's settings, applied whenever the site opens (cat0 remembers the build's filing for the rules)
const BP_TYPES=()=>[...new Set(BPS.map(b=>b.cat0!=null&&b.cat0!==b.cat?[b.cat,b.cat0]:[b.cat]).flat().concat(typeof BP_GROUP_ORDER!=='undefined'?BP_GROUP_ORDER:[]))].filter(Boolean).sort();
function bpTypeApply(){const O=store.get('bpType',{})||{};Object.entries(O).forEach(([n,c])=>{const b=BP_IDX.get(lc(n));if(!b||!c)return;if(b.bt0==null)b.bt0=b.cat;if(b.cat0==null)b.cat0=b.cat;b.cat=c})}
bpTypeApply();
function bpTypeSet(n,c){if(!dmUnlocked())return;const O=store.get('bpType',{})||{},b=BP_IDX.get(lc(n));if(!b)return;const base=b.bt0!=null?b.bt0:b.cat;
  if(!c||c===base){delete O[n];b.cat=base}else{O[n]=c;if(b.bt0==null)b.bt0=base;if(b.cat0==null)b.cat0=base;b.cat=c}store.set('bpType',O);toast(n+' is now filed under '+b.cat);if(typeof renderTab==='function')renderTab();if(typeof openRef==='function'&&document.querySelector('#qBox'))try{openRef('bp',n)}catch(e){}}
// a name saved before the build dropped " x1" from the vault's names still finds its Blueprint
let findBP=n=>BP_IDX.get(lc(n||''))||(/\s+x\s?1$/i.test(n||'')?BP_IDX.get(lc(n).replace(/\s+x\s?1$/,'')):undefined);
const godByKey=n=>GOD_IDX.get(lc(n||''));
let PARTY=store.get('party',[]);
// variants were removed: a pack holding "Wolf Hide (Tanned)" now holds Wolf Hide (added to any Wolf Hide already there)
(()=>{let ch=0;(Array.isArray(PARTY)?PARTY:[]).forEach(c=>{
  if(Array.isArray(c.inv)&&c.inv.some(r=>Array.isArray(r)&&unprep(r[0])!==r[0])){ch=1;
    const out=c.inv.filter(r=>Array.isArray(r)&&unprep(r[0])===r[0]);
    c.inv.forEach(r=>{if(!Array.isArray(r)||unprep(r[0])===r[0])return;const b=unprep(r[0]),ex=out.find(x=>lc(x[0])===lc(b));if(ex)ex[1]=(+ex[1]||0)+(+r[1]||0);else out.push([b].concat(r.slice(1)))});
    c.inv=out}
  if(Array.isArray(c.gear)&&c.gear.some(n=>unprep(n)!==n)){ch=1;c.gear=c.gear.map(unprep)}});
  if(ch)store.set('party',PARTY)})();
// A forged item lives in its maker's saved designs, so on anyone else's device (the DM, the other players in a campaign)
// the character's gear was only a name. Each character now carries a copy of its forged items (fd: name -> record), for
// reading only: the item still belongs to, and changes only for, the one who forged it.
function forgedSnap(c){try{if(!c||(c._by&&!(CL&&CL.user&&c._by.u===CL.user.id)))return;const fd={};
  (c.gear||[]).forEach(n=>{const d=DESIGNS.find(x=>x&&x.n===n&&!x.foreign);if(d&&d.forged)fd[n]=wsData(d)});
  if(Object.keys(fd).length)c.fd=fd;else delete c.fd}catch(e){}}
const saveParty=()=>{PARTY.forEach(forgedSnap);partyStamp();return store.set('party',PARTY)};
function partyDelete(id){const i=PARTY.findIndex(x=>x.id===id),c=PARTY[i];if(!c)return;PARTY.splice(i,1);PARTY_SEL=null;saveParty();renderParty();undoToast((c.name||'Character')+' deleted',()=>{partyRestore(c,i);PARTY_SEL=c.id;if(TAB==='party')renderParty()})}
// Undo a deleted character: put it back where it was and forget its deletion marker (so other devices keep it too)
function partyRestore(c,i){try{const g=store.get('partygone',{});if(g[c.id]){delete g[c.id];store.set('partygone',g)}}catch(e){}if(typeof CL!=='undefined'&&CL.cgone)CL.cgone=CL.cgone.filter(x=>x[1]!==c.id);
  PARTY.splice(Math.max(0,Math.min(i,PARTY.length)),0,c);saveParty()}
function datalists(){
  if($('dl-bp'))return '';
  return `<datalist id="dl-bp">${BPS.map(b=>`<option value="${esc(b.n)}">`).join('')}</datalist>
    <datalist id="dl-mat">${MATS.map(m=>`<option value="${esc(m.n)}">`).join('')}</datalist>
    <datalist id="dl-mon">${MONSTERS.map(m=>`<option value="${esc(m.n)}">`).join('')}</datalist>`;
}
function addContract(id){const c=PARTY.find(x=>x.id===id),g=$('xc-god').value,how=$('xc-how').value;if(!c||!g)return;if(!how){toast('A contract needs a way in: a follower, a ritual, a temple, or an integrated item');return}if(c.god===g||(c.extra||[]).some(x=>x.god===g)){toast(g+' is already one of this character’s contracts');return}c.extra=(c.extra||[]).concat({god:g,rank:$('xc-rank').value,how});saveParty();renderParty()}
function rmContract(id,i){const c=PARTY.find(x=>x.id===id);if(!c)return;c.extra.splice(i,1);saveParty();renderParty()}
// Choosing a side: keep one god's contract and break the other, which costs what breaking that rank costs.
function chooseSide(id,keep,drop){const c=PARTY.find(x=>x.id===id);if(!c)return;const all=[{god:c.god,rank:c.rank},...(c.extra||[])];const d=all.find(x=>x.god===drop);if(!d)return;const ct=contractOf(d.rank);
  if(!confirm(`Keep ${keep} and break the contract with ${drop}?\n\n${ct?ct.brk:''}`))return;
  if(c.god===drop){const nx=(c.extra||[]).shift();c.god=nx?nx.god:'';c.rank=nx?nx.rank:'';c.ctHow=nx&&nx.how||''}else c.extra=(c.extra||[]).filter(x=>x.god!==drop);
  c.notes=(c.notes?c.notes+'\n':'')+`Broke the ${d.rank||'Minor'} contract with ${drop} to keep ${keep}: ${ct?ct.brk:''}`;saveParty();renderParty()}
// Saving throws and initiative only change with class and equipment (campaign rule). Gear made with these materials raises
// them by the material's Potency P (B = half of it, rounded up). Bonuses of one kind don't stack: the highest worn one counts.
// What an item is, for which material traits and properties work in it: 'weapon', 'armor' (armor and shields), or 'worn'
// (anything else equipped: clothing, jewelry, focuses, tools). A trait marked for weapons or for armor works only there.
function gearKind(b){if(!b)return 'worn';if(b.dc||b.dmg||(b.design&&b.design.dmg))return 'weapon';if(b.armor||ARMOR_CATS.includes(b.cat)||(+b.ac||0)>0)return 'armor';return 'worn'}
const trWorks=(t,kind)=>!t||!t.s||(t.s==='w'?kind==='weapon':kind==='armor');
const TR_WHERE={w:'in a weapon',a:'in armor or a shield'};
// the traits of an item's materials: the ones that work in it, and a note for the ones that don't
function trListHTML(ms,kind,label){const on=ms.filter(m=>trWorks(m.tr,kind)),off=ms.filter(m=>!trWorks(m.tr,kind));
  return (on.length?`<div class="mlist">${on.map(m=>`<button data-ref="${ref(m)}" style="flex-direction:column;align-items:flex-start;gap:2px"><span><b style="color:var(--gold2)">◆ ${esc(m.tr.n)}</b> <span class="x">${label?label(m):'from '+esc(m.n)}</span></span><span style="font-size:.8rem">${esc(m.tr.t)}</span></button>`).join('')}</div>`:'')
    +(off.length?`<div class="note" style="margin:6px 0 0">Not active in this ${kind==='weapon'?'weapon':kind==='armor'?'armor':'item'}: ${off.map(m=>`<b>${esc(m.tr.n)}</b> (${esc(m.n)}, works only ${TR_WHERE[m.tr.s]})`).join('; ')}.</div>`:'')}
const MAT_BONUS={'Keen-Eyed':{perception:'B',insight:'B',investigation:'B'},'Hushed':{stealth:'B',sleight:'B',acrobatics:'B'},'Silver-Tongued':{persuasion:'B',deception:'B',performance:'B'},'Learned':{arcana:'B',history:'B',religion:'B'},'Wild-Wise':{nature:'B',survival:'B',animal:'B',medicine:'B'},'Mighty':{athletics:'B',intimidation:'B'},'Warding':{all:'B'},'Steadfast':{str:'P',con:'P'},'Clear-Minded':{int:'P',wis:'P',cha:'P'},'Quickening':{init:'P',dex:'B'},'Ever-Ready':{init:'P'},'Timebound':{init:'B'},'Hoard-Cursed':{all:'B'},'Rightful Heir':{persuasion:'B',intimidation:'B'}};
// Powers that are always on join the sheet's totals: extra weapon dice and flat damage, Accuracy, AC, and speed,
// read from the property's text at the item's own Potency (the same fill the vault uses) or from the trait's text.
// A clause with a condition (when, if, against, once per, …) stays in the text only: it is the player's to apply.
const potText=s=>String(s).replace(/Potency (\d+)(\+|\b)/g,(a,n,plus)=>+n<=10?'Potency '+(+n*5)+plus:a);
const propAt=(n,pot)=>{const x=PROP_IDX.get(lc(n||''));if(!x||!x.t)return '';const P=potRank(pot),B=Math.ceil(P/2);
  return potText(x.t).replace(/\{P1\}/g,P+1).replace(/\{B1\}/g,B+1).replace(/\{P2\}/g,P*2).replace(/\{P5\}/g,P*5).replace(/\{P10\}/g,P*10).replace(/\{DC\}/g,10+B*2).replace(/\{P\}/g,P).replace(/\{B\}/g,B)};
const POW_COND=/\b(when|whenever|if|against|once|after|before|until|on a hit|critical|to creatures?|for each|below|above|that (?:is|are|has|have)|while (?!equipped)|at potency|pick|chosen|choose|instead|underwater|in water|dim light|darkness|per day|bonus action|reaction|with them|first|allies|ally|beyond|to a creature|of your choice|to them|poisons? made|sunlight|bright light)\b/i;
function powFx(text,kind,shield){const o={dice:[],dmg:0,atk:0,ac:0,speed:0};let sec='any';
  String(text||'').split(/(?<=\.)\s+/).forEach(sen=>{
    const pre=/^(Weapons?|Armor or shield|Armor|Shield|Worn|(?:Thrown|Ranged|Melee) weapons?|[A-Z][a-z]+(?: and [a-z]+)? focus|Focus)\s*:\s*/.exec(sen);
    if(pre){const w=pre[1].toLowerCase();sec=/^(thrown|ranged|melee) /.test(w)?'focus':/^weapon/.test(w)?'weapon':w==='armor or shield'?'armor':w==='armor'?'armor':w==='shield'?'shield':w==='worn'?'worn':'focus';sen=sen.slice(pre[0].length)}
    else if(/^A weapon (?:with|coated with) this material\b/i.test(sen)){sec='weapon';sen=sen.replace(/^A weapon (?:with|coated with) this material:?\s*/i,'')}
    else if(/^While equipped,\s*/i.test(sen)){sec='any';sen=sen.replace(/^While equipped,\s*/i,'')}
    const fits=sec==='any'||(sec==='weapon'&&kind==='weapon')||(sec==='armor'&&kind==='armor')||(sec==='shield'&&shield)||(sec==='worn'&&kind!=='weapon');
    if(!fits)return;
    let before='';sen.split(/;|,| and (?=[a-z]+s\b)/).forEach(cl=>{const held=POW_COND.test(before+' '+cl);before+=' '+cl;if(held)return;let m;
      if(kind==='weapon'){if((m=/\+(\d+)d(\d+)(?:\s+([a-z]+(?: or [a-z]+)?))?\s+damage\b/.exec(cl)))o.dice.push([+m[1],+m[2],m[3]||'']);
        else if((m=/\+(\d+) damage\b/.exec(cl)))o.dmg+=+m[1];
        if((m=/\+(\d+) (?:to (?:weapon )?attack rolls|Accuracy)\b/.exec(cl)))o.atk+=+m[1]}
      if(kind!=='weapon'&&(m=/\+(\d+) (?:Gear )?AC\b/.exec(cl)))o.ac+=+m[1];
      if((m=/\+(\d+) ft speed\b|speed increases by (\d+) ft/.exec(cl)))o.speed+=+(m[1]||m[2])})});return o}
// an item's powers with their text: a forged design's chosen ones, or each material's for a vault item
// A ready-made Blueprint's properties work at no more than its level allows (owner-approved rebalance, 2026-11-04):
// rank ≤ level ÷ 10 + 2, so a level-1 relic built from a Potency 46 fragment acts at Potency 14, not 46. Forged items are
// unaffected: their level comes from their materials.
const bpPotCap=b=>b&&!b.design?(Math.floor((+b.lv||1)/10)+2)*5+4:99;
function gearPowers(b){if(!b)return [];const D=b.design;
  if(D)return (Array.isArray(D.powers)?D.powers:[]).filter(Boolean).map(x=>({n:x.n,k:x.k,t:x.k==='p'?propAt(x.n,x.pot)||x.t||'':x.t||''}));
  // a vault item carries the property of its strongest material (the vault's rule) and every material's trait
  const seen=new Map(),kind=gearKind(b),ms=(b.mats||[]).map(findMat).filter(Boolean),m0=ms.filter(m=>m.pn&&m.prop).sort((x,y)=>(y.rank||0)-(x.rank||0)||(y.pot||0)-(x.pot||0))[0];
  if(m0){const cap=bpPotCap(b),pot=Math.min(m0.pot||0,cap);seen.set('p:'+m0.pn,{n:m0.pn,k:'p',pot,t:(m0.pot||0)>cap?propAt(m0.pn,pot):m0.prop.replace(/^[^:]+:\s*/,'')})}
  ms.forEach(m=>{
    if(m.tr&&trWorks(m.tr,kind)&&!seen.has('t:'+m.tr.n))seen.set('t:'+m.tr.n,{n:m.tr.n,k:'t',t:m.tr.t||''})});return [...seen.values()]}
// everything an item's powers add, summed: extra dice merged by size and type
function gearFx(b){const kind=gearKind(b),shield=!!b&&b.cat==='Shield',o={dice:[],dmg:0,atk:0,ac:0,speed:0,src:[]};
  o.parts=[];gearPowers(b).forEach(pw=>{const f=powFx(pw.t,kind,shield);if(!f.dice.length&&!f.dmg&&!f.atk&&!f.ac&&!f.speed)return;o.src.push(pw.n);o.parts.push({n:pw.n,ac:f.ac,speed:f.speed});
    f.dice.forEach(([n,x,t])=>{const e=o.dice.find(d=>d[1]===x&&d[2]===t);if(e)e[0]+=n;else o.dice.push([n,x,t])});['dmg','atk','ac','speed'].forEach(k=>o[k]+=f[k])});
  // balance (website rule): powers add at most half of what the item does on its own. AC: half the item's AC (at
  // least +1); weapon damage: half the weapon's average damage, the extra dice scaled down to fit. Speed is capped
  // per character in charStats (at most the character's own speed).
  const D=b&&b.design,baseAC=+(D&&D.ac!=null?D.ac:b&&b.ac)||0,acCap=Math.max(1,Math.ceil(baseAC/2));o.acCap=acCap;if(o.ac>acCap){o.ac=acCap;o.capAC=true}
  if(kind==='weapon'&&(o.dice.length||o.dmg)){const base=dmgAvg(D&&D.dmg?D.dmg:b&&b.dc?String(b.dc):''),pw=o.dice.reduce((a,[n,x])=>a+n*(x+1)/2,0)+o.dmg,cap=base/2;
    if(base>0&&pw>cap){const f=cap/pw;o.dice.forEach(d=>{d[0]=Math.max(1,Math.floor(d[0]*f))});o.dmg=Math.floor(o.dmg*f);o.capDmg=true}}
  return o}
// a damage string's average: each NdX averages N(X+1)/2, plus every flat "+ N"
const dmgAvg=s=>{let t=0;String(s||'').replace(/(\d+)d(\d+)/g,(_,n,x)=>{t+=n*(+x+1)/2;return ''}).replace(/\+\s*(\d+)/g,(_,n)=>{t+=+n;return ''});return t};
// a weapon's damage with its powers added: the flat bonus joins the base, extra dice follow it ("22d8 + 8 slashing + 2d6 fire")
const fxDmg=(base,f)=>{let s=String(base||'').replace(/^(\d+d\d+)\s*\+\s*(\d+)/,'$1 + $2');if(f&&f.dmg)s=/^\d+d\d+/.test(s)?bumpDmg(s,f.dmg):s;return s+(f?f.dice.map(([n,x,t])=>` + ${n}d${x}${t?' '+t:''}`).join(''):'')};
function gearBonus(gear){const o={str:0,dex:0,con:0,int:0,wis:0,cha:0,init:0,src:[]};SKILLS.forEach(k=>o[k[0]]=0);
  gear.forEach(b=>{if(isForeign(b))return;const D=b.design,list=D&&Array.isArray(D.powers)?D.powers.filter(x=>x.k==='p').map(x=>Object.assign({},findMat((x.from||[])[0])||{n:x.n,prop:''},{pn:x.n,pot:x.pot})):(b.mats||[]).map(findMat).filter(m=>m&&m.pn).sort((x,y)=>(y.rank||0)-(x.rank||0)||(y.pot||0)-(x.pot||0)).slice(0,1);list.forEach(m=>{const e=m&&MAT_BONUS[m.pn];if(!e||!m.pot)return;if(/Worn:/.test(m.prop||'')&&gearKind(b)==='weapon')return;const P=potRank(Math.min(m.pot,D?99:bpPotCap(b))),B=Math.ceil(P/2);let got=false;
    Object.entries(e).forEach(([k,v])=>{const val=v==='P'?P:B;(k==='all'?['str','dex','con','int','wis','cha']:[k]).forEach(a=>{if(val>o[a]){o[a]=val;got=true}})});
    if(got&&!o.src.some(x=>x.m===m))o.src.push({m,b})})});return o}
function charStats(c){
  const gear=(c.gear||[]).map(findBP).filter(b=>b&&!isForeign(b));
  // a heavy suit (Plate, Splint, Chain Mail, Half Plate) covers several slots: other armor there adds no AC on top
  // what is worn (website rule): the best piece in each armor slot and one shield; spare pieces are only carried and add
  // nothing; barding protects a mount, not its rider; two of the same item count once
  const acOf=b=>+b.ac||0,aSlot=b=>b.cat==='Shield'?'Shield':b.slot||(b.design&&BASES[b.design.base]&&BASES[b.design.base].slot)||armorPiece(b).slot,bestSlot=new Map();
  gear.filter(b=>ARMOR_CATS.includes(b.cat)&&aSlot(b)!=='Mount').forEach(b=>{const k=aSlot(b),o=bestSlot.get(k);if(!o||acOf(b)>acOf(o))bestSlot.set(k,b)});
  const worn=[...bestSlot.values()],spare=gear.filter(b=>ARMOR_CATS.includes(b.cat)).length-worn.length;
  const covered=new Set(worn.filter(b=>Array.isArray(b.covers)).flatMap(b=>b.covers)),suit=b=>Array.isArray(b.covers);
  const onBody=worn.filter(b=>suit(b)||!covered.has(aSlot(b))),others=[...new Map(gear.filter(b=>!ARMOR_CATS.includes(b.cat)).map(b=>[lc(b.n),b])).values()],act=onBody.concat(others);
  const armorAC=onBody.reduce((a,b)=>a+acOf(b),0);
  const otherAC=others.reduce((a,b)=>a+acOf(b),0);
  // every contract the character holds (the main one plus any more); Natural AC doesn't stack, so the highest rank counts
  const contracts=[{god:c.god,rank:c.rank},...(c.extra||[])].map(x=>({g:godByKey(x.god),ct:x.rank?contractOf(x.rank):null})).filter(x=>x.g&&x.ct);
  const ct=contracts.reduce((b,x)=>!b||CONTRACTS.indexOf(x.ct)>CONTRACTS.indexOf(b)?x.ct:b,null);
  // a conflict of interest: two of the character's gods hold the same Rune
  const conflicts=[];contracts.forEach((a,i)=>contracts.slice(i+1).forEach(b=>{const shared=(a.g.runes||[]).filter(r=>(b.g.runes||[]).includes(r));if(shared.length&&a.g!==b.g)conflicts.push({a,b,shared})}));
  // CON adds its modifier to Armor Class (campaign owner's rule): toughness takes the edge off every hit; AC never drops below 0
  // the modifier counts once (×1), with no cap
  const conAC=Math.floor(((+(c.abil||{}).con||10)-10)/2);
  const body=worn.some(b=>b.cat!=='Shield'&&aSlot(b)==='Body'),shield=worn.some(b=>b.cat==='Shield'),ab=a=>Math.floor(((+(c.abil||{})[a]||10)-10)/2);
  // class AC: the Defense fighting style (+1 in body armor); Unarmored Defense adds DEX (Barbarian) or DEX + WIS (Monk, no shield) without body armor
  const styleAC=c.style==='Defense'&&body?1:0,unAC=body?0:c.cls==='Barbarian'?Math.max(0,ab('dex')):c.cls==='Monk'&&!shield?Math.max(0,ab('dex'))+Math.max(0,ab('wis')):0;
  // caster AC (website rule): a character who knows Mage Armor keeps it up (+3, like Hide, while wearing no body armor; it
  // doesn't stack with Unarmored Defense, the better one counts). Shield is a reaction: +5 until the start of their next turn
  const knowsSp=n=>Object.values(c.spells||{}).some(L=>Array.isArray(L)&&L.some(x=>lc(x)===lc(n)))||(()=>{try{return typeof raceSpellsGot==='function'&&raceSpellsGot(c).some(x=>lc(x.n)===lc(n))}catch(e){return false}})();
  const maKnown=knowsSp('Mage Armor'),maAC=!body&&maKnown&&!c.noMageArmor?Math.max(0,3-unAC):0,shieldSp=knowsSp('Shield')?5:0;
  // always-on powers of the gear (properties and traits): AC and speed
  // always-on powers of what is worn and carried: a power counts once however many items carry it (the best one),
  // and each item adds at most its own cap; speed from gear at most doubles the character's speed
  const fxs=act.map(gearFx),bestAC={},bestSp={};fxs.forEach((f,i)=>(f.parts||[]).forEach(q=>{if(q.ac&&(!bestAC[q.n]||q.ac>bestAC[q.n].v))bestAC[q.n]={v:q.ac,i};if(q.speed&&(!bestSp[q.n]||q.speed>bestSp[q.n].v))bestSp[q.n]={v:q.speed,i}}));
  const perAC=fxs.map(()=>0);Object.values(bestAC).forEach(x=>perAC[x.i]+=x.v);
  const fxAC=perAC.reduce((a,v,i)=>a+Math.min(v,fxs[i].acCap||1),0),fxACcap=perAC.some((v,i)=>v>(fxs[i].acCap||1)),fxSpeedRaw=Object.values(bestSp).reduce((a,x)=>a+x.v,0),fxSpeed=Math.min(fxSpeedRaw,+c.speed||30),fxSpeedCap=fxSpeedRaw>fxSpeed;
  const infA=infAC(c,act),ac=Math.max(0,armorAC+otherAC+(+c.acBonus||0)+(ct?ct.ac:0)+conAC+styleAC+unAC+maAC+fxAC+infA);
  const traits=[];act.forEach(b=>(b.mats||[]).forEach(n=>{const m=findMat(n);if(m&&m.tr&&trWorks(m.tr,gearKind(b))&&!traits.some(t=>t.m===m))traits.push({m,b})}));
  const inv=(c.inv||[]).map(([n,q])=>({m:findMat(n),n,q:+q||0}));
  const invGp=inv.reduce((a,x)=>a+(x.m&&x.m.price||0)*x.q,0);
  const purseGp=Object.entries(c.purse||{}).reduce((a,[r,v])=>a+(CURRENCY[r]&&CURRENCY[r].gp||0)*(+v||0),0);
  const god=godByKey(c.god);const rivals=[];
  if(god)(god.runes||[]).forEach(r=>(RUNE_GODS.get(r)||[]).forEach(o=>{if(o!==god&&!rivals.includes(o))rivals.push(o)}));
  const pieces=onBody.map(armorPiece);
  // Attunement from level: one point per 10 levels (campaign owner's choice; level ÷ 4 dated from the old level-20 cap and
  // let a level 36 character stand in the Primordial, a stage V realm)
  const att=Math.max(+c.attune||0,Math.floor((+c.level||0)/10),ct?Math.floor((CONTRACTS.indexOf(ct)+1)/2):0);
  const gb=gearBonus(act);
  const dodge=dodgeOf((c.abil||{}).dex);
  return {castArm:castArmor(c,worn),dodge,gb,fxAC,fxSpeed,fxSpeedCap,fxACcap,spare,worn,conAC,styleAC,unAC,maAC,maKnown,body,shieldSp,att,contracts,conflicts,gear,armorAC,ac,ct,traits,inv,invGp,purseGp,god,rivals,pieces,drawback:setDrawbacks(pieces)};
}

