// ── Classes: every class with its ladder of class changes (campaign owner's rules: a change every 10 levels, up to 100) ──
function subLadderHTML(sub){const L=typeof SUBSTAGES!=='undefined'&&SUBSTAGES[sub]||[],x0=SUBS.find(x=>x.n===sub),first=x0&&x0.lv&&x0.lv.length?`<div style="margin:6px 0"><b>${esc(sub)}</b> <small style="color:var(--muted)">levels 3–20 · the original subclass</small>${x0.lv.map(f=>`<div class="sh-feat" style="padding:3px 0 3px 10px"><b>Level ${f[0]}: ${esc(f[1])}</b>${f[3]?' <small class="b ghost" title="Added by the site so this subclass matches its class; the vault page is unchanged">added by the site</small>':''} ${esc(f[2])}</div>`).join('')}</div>`:'';if(!L.length&&!first)return '';
  return first+L.map(x=>`<div style="margin:6px 0"><b>${esc(x.name)}</b> <small style="color:var(--muted)">level ${stageStart(x.stage)} · ${esc(STAGE_REALMS(x.stage).join(', '))}</small>${x.features.map(f=>`<div class="sh-feat" style="padding:3px 0 3px 10px"><b>Level ${f[0]}: ${esc(f[1])}</b> ${esc(f[2])}</div>`).join('')}</div>`).join('')}
// Apostle classes: one per god, given only to that god's true successor. Built from the god's own data (its Runes, its will
// and mission, its signature materials, Finger relic, Hand, and contract spells), so every god has one and they stay in step.
const APOSTLE_LV=[1,3,5,7,9,11,13,15,17,20];
function apostleOf(g){if(!g)return null;const nm=godKey(g),R=(g.runes||[]).length?g.runes:['Divinity'],r0=R[0],rk=g.rk||{},sp=g.csp||[],want=(g.wants||'the spread of '+nm+'\'s worship').replace(/\.$/,'');
  const mantle=(r,i)=>[`Mantle of ${r}`,`${nm}'s ${r} Rune runs through you. You resist damage and effects that come from the ${r} Rune, and once per turn a hit you make carries it for an extra ${i+1}d8 damage (the DM sets its kind from the Rune). Creatures that hold the ${r} Rune for a rival god know you on sight.`];
  const F=[
    ['Chosen Heir',`${nm} names you its successor. You bear its mark, every follower of ${nm} recognises it, and your contract counts as Apostle rank (or higher) whatever it was. You can cast ${nm}'s contract cantrip${sp[0]?' ('+sp[0]+')':''} and its 1st-level spell${sp[1]?' ('+sp[1]+')':''} without spell slots, the cantrip at will and the spell once per short rest.`],
    [`Voice of ${nm}`,`Once per long rest you speak with ${nm}'s full authority for 1 minute. Its followers and contractors who hear you obey any command that serves the god, and contractors of its rivals must make a Wisdom save (DC 8 + your Apostle level) or be frightened of you.`],
    mantle(r0,0),
    ['The Mission',`You carry ${nm}'s will: ${want}. Once per long rest, when you act directly for that mission, you have advantage on every roll for 1 minute. The DM may grant one more use each time you complete a great step of it.`],
    R[1]?mantle(R[1],1):[`Undying Faith`,`You cannot be charmed or frightened against ${nm}'s will, and your hit point maximum rises by your Apostle level.`],
    ['Relic-Bearer',`You can wield ${g.relic||nm+'\'s Finger relic'} as if you were a Finger. ${nm}'s temples sell you its Apostle material${rk.Apostle?' ('+rk.Apostle+')':''} and its Finger material${rk.Finger?' ('+rk.Finger+')':''} at cost.`],
    R[2]?mantle(R[2],2):[`Domain of ${nm}`,`Once per long rest you can open a temple passage to ${nm}'s own domain from any shrine of it, for yourself and up to eight companions.`],
    ['Hand of the Hand',`${nm}'s Hand${(g.hand||[]).length?' ('+g.hand.filter(Boolean).join(', ')+')':''} must heed you as the god's voice. Once per long rest you can call one Finger to your side, if it lives.`],
    ['Divine Spells',`You can cast each of ${nm}'s ten contract spells${sp.length?' ('+sp.join(', ')+')':''} once per long rest without spell slots, at the highest level your stage allows.`],
    ['True Successor',`Once per long rest you become ${nm}'s avatar for 1 minute: resistance to all damage, immunity to the ${R.join(', ')} Rune${R.length>1?'s':''}, and every hit deals an extra 2d10. When ${nm} dies, you reach its remains first, claim its Primary Rune piece, and may take its place as a god.`]
  ];
  if(!apostleOf.n){apostleOf.n={};GODS.forEach(x=>{const k=((x.runes||[])[0])||'Divinity';apostleOf.n[k]=(apostleOf.n[k]||0)+1})}
  return {god:g,name:apostleOf.n[r0]>1?`The ${r0} Heir of ${nm}`:`The ${r0} Heir`,title:`Apostle of ${nm}`,will:R.map(r=>`Hold and spread the ${r} Rune; never let a rival god take it.`),mission:want,
    req:`Only one living Apostle per god. ${nm} grants this class itself, to its true successor: a contractor of Apostle rank or a Finger who has proven the god's will through a great deed for its mission. It is never bought, taught, or taken.`,
    burden:`If you act against ${nm}'s will or abandon its mission, ${nm} takes the class back: every Apostle feature ends and your contract breaks (Rules page).`,
    feats:F.map((f,i)=>[APOSTLE_LV[i],f[0],f[1]])}}
function apostleHTML(g,open){const a=apostleOf(g);if(!a)return '';
  return `<details class="fold"${open?' open':''}><summary><b>${esc(a.name)}</b> <small style="color:var(--muted)">${esc(a.title)} · the god's true successor</small></summary>
    <div class="note" style="margin:6px 0">${esc(a.req)}</div>
    <div class="kv" style="margin:6px 0"><span>Its will</span><span>${a.will.map(esc).join(' ')}</span><span>Its mission</span><span>${esc(a.mission)}</span></div>
    ${a.feats.map(([l,n,t])=>`<div class="sh-feat" style="padding:3px 0"><b>Apostle level ${l}: ${esc(n)}</b><div>${esc(t)}</div></div>`).join('')}
    <div class="callout" style="margin-top:6px"><b>Burden:</b> ${esc(a.burden)}</div>
    <div class="note">Apostle levels are gained like a hidden class: alongside your class, at the DM's pace, as you carry out the mission.</div></details>`}
function renderClasses(){
  const S=typeof STAGES!=='undefined'?STAGES:{},classes=Object.keys(CLASS_DIE).sort();
  const casterNote=c=>({full:'Full caster',half:'Half caster',arti:'Half caster (Artificer)',pact:'Pact magic'})[CASTER[c]]||'No spellcasting';
  $('content').innerHTML=`<div class="page">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Classes and class changes</h3><p>Every class turns into a stronger version of itself every 20 levels: the original class for levels 1–20, then <b>II at level 21</b> (a Ranger becomes a Ranger II), <b>III at 41</b>, <b>IV at 61</b>, and <b>V at 81</b> (level 100 is the cap). Each change has a trial to earn it and new features, and opens the next band of realms. Subclasses turn with their class, each with features of its own.</p></div>
    <div class="chips" style="margin-bottom:12px">${classes.map(c=>`<a class="chip" href="#cl-${pid(c)}" data-cl="cl-${pid(c)}">${esc(c)}</a>`).join('')}</div>
    <details class="panel fold" style="margin-bottom:14px"><summary><b style="font-family:var(--serif)">Playable peoples</b> <small style="color:var(--muted)">${CW_RACE.length} peoples: size, speed, darkvision, languages, and every trait</small></summary>${[...new Set(CW_RACE.map(r=>r[5]))].map(g=>`<h4 class="cw-gh" style="margin-top:10px">${esc(g)}</h4><div class="chips">${CW_RACE.filter(r=>r[5]===g).map(r=>`<button class="chip" type="button" onclick="peoplePop(${esc(JSON.stringify(r[0]))})">${esc(r[0])} <small>${esc((peopleInfo(r[0])||{}).size||'')}${(peopleInfo(r[0])||{}).dv?' · DV '+peopleInfo(r[0]).dv:''}</small></button>`).join('')}</div>`).join('')}</details>
    <details class="panel fold" style="margin-bottom:14px"><summary><b style="font-family:var(--serif)">Apostle classes</b> <small style="color:var(--muted)">one for each of the ${GODS.length} gods, given only to its true successor</small></summary>
      <p class="note" style="margin:6px 0">A god grants its Apostle class to one person at a time: the contractor it chooses to inherit it. The class carries the god's will and mission, ten features from Apostle level 1 to 20, and a burden: betray the god and it takes the class back.</p>
      <input class="sel" type="search" placeholder="Search Apostle classes by god, Rune, or name" style="max-width:none;width:100%;margin-bottom:8px" oninput="const q=this.value.toLowerCase();this.parentNode.querySelectorAll('.ap-item').forEach(x=>x.hidden=!!q&&!x.dataset.k.includes(q))">
      <div class="mlist">${GODS.map(g=>{const a=apostleOf(g);return `<button class="ap-item" data-ref="${ref(g)}" data-k="${esc((a.name+' '+a.title+' '+(g.runes||[]).join(' ')+' '+g.grp).toLowerCase())}"><b>${esc(a.name)}</b> <span class="x">${esc(a.title)}</span><span class="r">${esc(g.grp.replace(' Pantheon',''))}</span></button>`}).join('')}</div><div class="note">Open one to read its will, mission, features, and burden in the god's window.</div></details>
    ${classes.map(c=>{const ladder=S[c]||[],subs=SUBS.filter(x=>x.par===c);
      return `<section class="sec" id="cl-${pid(c)}"><div class="panel">
        <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-size:1.35rem;font-family:var(--serif)">${esc(c)}</h4><span class="note" style="margin:0">Steady Growth <b>${esc(growthText(growthOf(c)))}</b> · Hit die d${CLASS_DIE[c]} · no saving throw bonus (FAND) · ${casterNote(c)}${CAST_ABIL[c]?' ('+CAST_ABIL[c].toUpperCase()+')':''}</span></div>
        <div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th class="num">Stage</th><th>Levels</th><th>Class</th><th>Opens the realms</th></tr></thead><tbody>
          <tr><td class="num">I</td><td>1–20</td><td><b>${esc(c)}</b> <small style="color:var(--muted)">original class</small></td><td>${esc(STAGE_REALMS(1).map(realmLabel).join(', '))}</td></tr>
          ${ladder.map(x=>`<tr><td class="num">${ROMAN[x.stage-1]}</td><td>${stageStart(x.stage)}–${stageEnd(x.stage)}</td><td><a href="#cl-${pid(c)}-${x.stage}" data-cl="cl-${pid(c)}-${x.stage}"><b>${esc(x.name)}</b></a></td><td>${esc(STAGE_REALMS(x.stage).map(realmLabel).join(', '))}</td></tr>`).join('')}
        </tbody></table></div>
        ${subs.length?`<div class="blk" style="margin-top:10px"><h4>Subclasses <em>chosen at level 3; each turns II to V with its class, with features of its own</em></h4></div><div style="display:flex;flex-direction:column;gap:6px">${subs.map(x=>`<details class="fold" id="cl-${pid(c)}-sub-${pid(x.n)}"><summary>${esc(x.n)} <small style="color:var(--muted)">→ ${esc(x.n)} II, III, IV, V</small></summary><div class="note" style="margin:4px 0">${esc(String(x.ds||'').replace(/\s*\([^()]*\)\s*$/,''))}</div>${subLadderHTML(x.n)}</details>`).join('')}</div>`:''}
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">${ladder.map(x=>`<details class="fold" id="cl-${pid(c)}-${x.stage}"><summary><b>${esc(x.name)}</b> <small style="color:var(--muted)">level ${stageStart(x.stage)} · ${esc(STAGE_REALMS(x.stage).join(', '))}</small></summary>
          <div style="line-height:1.6;margin:6px 0 4px">${esc(x.blurb||'')}</div>
          ${x.trial?`<div class="callout" style="margin:6px 0"><b>Class change trial:</b> ${esc(x.trial)}</div>`:''}
          ${(x.features||[]).length?`<div class="mlist">${x.features.map(f=>`<div class="sh-feat" style="padding:6px 0"><b>Level ${f[0]}: ${esc(f[1])}</b><div>${esc(f[2])}</div></div>`).join('')}</div>`:''}</details>`).join('')}</div>
      </div></section>`}).join('')}
  </div>`;
  const focus=id=>{const el=document.getElementById(id);if(!el)return;if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'start'})};
  $('content').querySelectorAll('[data-cl]').forEach(a=>a.onclick=e=>{e.preventDefault();focus(a.dataset.cl)});
  const f=store.get('clsfocus',null);if(f){store.set('clsfocus',null);setTimeout(()=>focus(f),50)}
}
// ── Magic Towers (campaign owner's rule): every school of magic is kept by its own Magic Tower, where its spells are
// taught and sold. A spell can be learned for good or bought as a one-use scroll (a fifth of the price). What a visitor
// can buy depends on rank: Visitors cantrips to 3rd level, Members to 6th (10% off), Archmages 7th to 9th (25% off).
// Primary spells, tied to a Rune, are never sold. Prices grow with the spell's level and its realm (Void-grade spells
// cost Favor, like Void goods). Website proposals: the realms, ranks, and prices.
// The schools of magic, written for the site (2026-11-11): what each school is and how it plays. Who casts it, which
// focuses favour it, and its signature spells are read from the data, so they stay true as spells are added.
const SCHOOL_INFO={
  'Abjuration':['Magic that keeps things out: wards, shields, counterspells and banishments.','Plays defensively. An abjurer decides what gets through, protects the party from the worst hit of the fight and shuts down enemy casters.'],
  'Blood Magic':['Power paid for in blood, yours or someone else\'s.','Hits hard and heals itself, but most spells cost hit points. Strongest when the caster is willing to bleed.'],
  'Celestial':['The light of Heaven and the gods who rule from it.','Radiant damage, holy wards and blessings. Devastating against fiends and undead, generous to allies.'],
  'Chronomancy':['Time bent, slowed, rewound and stolen.','Control rather than damage: extra turns, lost turns, undone mistakes. A chronomancer wins by changing when things happen.'],
  'Conjuration':['Calling things from elsewhere: creatures, objects, and the caster themselves.','Summons, teleports and walls. Fills the battlefield with allies and obstacles and moves the party where it needs to be.'],
  'Divination':['Knowing what should not be known.','Few damage spells, but it sees ambushes coming, finds what is hidden and lets the party choose its fights.'],
  'Elemental':['Fire, water, earth and air, raw and loud.','Big areas and big numbers. The elementalist\'s choice of element is its answer to every resistance.'],
  'Enchantment':['Minds bent to the caster\'s will.','Charms, commands and sleep. Ends fights without killing anyone, and opens doors no key could.'],
  'Evocation':['Energy shaped into force, fire and lightning.','The classic blaster: the most direct damage in any school, aimed precisely so allies are spared.'],
  'Healing':['Life restored, wounds closed, death delayed.','Keeps the party standing. Its high-level spells bring back the dead and end every affliction.'],
  'Illusion':['What the senses report is a lie.','Deception, invisibility and phantoms. Clever play is rewarded; brute force is not its way.'],
  'Infernal':['The fire and contracts of Hell.','Hellfire that ignores resistance, bargains with real power, and devils that answer the call, at a price.'],
  'Nature Magic':['The wild world, its growth and its beasts.','Terrain, plants and animals. Turns the battlefield itself against the enemy and keeps the party fed and hidden.'],
  'Necromancy':['Death, undeath and the life force between.','Drains life, raises servants and curses. Strong and sinister, and rarely welcome in polite company.'],
  'Psionics':['The power of the mind alone.','Psychic damage, telepathy and mental control, cast with almost no outward sign.'],
  'Resonance':['The Bard\'s own school: magic sung into being through a personal chant.','Subtle and flexible. It registers as no school to Detect Magic and trades raw power for stacking, lingering effects; silence is its weakness.'],
  'Runic Magic':['Power written down: runes, glyphs and seals.','Prepared magic that waits to trigger. Traps, seals and inscriptions that outlast the caster.'],
  'Shadow Magic':['Darkness given purpose.','Stealth, fear and movement through shadow. Strikes from where no one is looking.'],
  'Transmutation':['Changing what things are.','Shapes, sizes and substances altered. The most versatile school: a solution to almost any problem, if you know the right spell.'],
  'Void Magic':['Absence, force and the pull of nothing.','Force damage, gravity and erasure. Ignores most defenses and removes things from the world entirely at its peak.'],
  'Wild Magic':['Chaos that refuses to be controlled.','Unpredictable and powerful. Every casting can surge, for better or worse; its masters learn to ride the luck.']};
function schoolInfoHTML(sc){const I=SCHOOL_INFO[sc];if(!I)return '';const S=SP.filter(x=>x.sc===sc);
  const cls=Object.keys(CLASS_SCHOOLS).filter(k=>CLASS_SCHOOLS[k].includes(sc)),foc=Object.keys(FOCUS_BUFF).filter(k=>FOCUS_BUFF[k].sch.includes(sc));
  const lv=[0,1,2,3,4,5,6,7,8,9].map(l=>S.filter(x=>x.lv===l).length);
  // signature spells: at cantrip, 3rd, 5th, 7th and 9th level, the one that rolls the most dice (or the first by name)
  const sig=[0,3,5,7,9].map(l=>{const L=S.filter(x=>x.lv===l);if(!L.length)return null;const dice=x=>{const m=/(\d+)d(\d+)/.exec(x.dmg||'');return m?(+m[1])*(+m[2]+1)/2:0};return L.slice().sort((a,b)=>dice(b)-dice(a)||a.n.localeCompare(b.n))[0]}).filter(Boolean);
  return `<div class="school-info"><p><b>${esc(I[0])}</b> ${esc(I[1])}</p>
    <div class="kvg" style="margin:6px 0"><div><span>Spells</span><b>${fmt(S.length)}</b></div><div><span>By level</span><b class="mono" style="font-size:.78rem">${lv.join(' · ')}</b></div>${cls.length?`<div><span>Cast by</span><b>${esc(cls.join(', '))}</b></div>`:''}${foc.length?`<div><span>Favoured by</span><b>${esc(foc.join(', '))}</b></div>`:''}</div>
    ${sig.length?`<div class="chips"><span class="note" style="margin:0 4px 0 0">Signature spells</span>${sig.map(x=>refChip(x,esc(x.n),x.lv?ORDN(x.lv):'cantrip')).join('')}</div>`:''}</div>`}
const MAGIC_TOWERS={
  'Abjuration':['The Bastion of Wards','Heaven','A white tower ringed by seven floating walls of light, each one a ward its students must learn to raise before they may pass it.'],
  'Blood Magic':['The Crimson Conservatory','Hell','A red stone tower whose mortar is mixed with the blood of every teacher it has had. Lessons are paid for in coin, and practised in something warmer.'],
  'Celestial':['The Halo Observatory','Heaven','An open-roofed tower where the stars come close enough to read. Its choir never stops, and every spell is taught as a hymn.'],
  'Chronomancy':['The Clockless Spire','Outer Realm','A tower with no clocks in it, because inside it time is the lesson: students meet their older selves on the stairs.'],
  'Conjuration':['The Summoners\' Gate','Mysterious','A tower built around one great doorway that opens somewhere new each hour. Its masters sell the names of what comes through.'],
  'Divination':['The Seer\'s Lantern','Mysterious','A thin tower topped by a lantern that shows tomorrow\'s weather and next year\'s wars. Buyers are told the price before they ask.'],
  'Elemental':['The Four-Wind Spire','Chaos','A tower that is fire on one side, water on another, stone and storm on the last two, held in balance by its masters\' constant work.'],
  'Enchantment':['The Velvet Academy','Human','A graceful tower of courtyards and music rooms, where everyone is friendly and every student leaves agreeing to something.'],
  'Evocation':['The Thunderhall','Human','A squat, scorched tower with reinforced floors and a long list of rules about practising indoors. Its spells are loud and honest.'],
  'Healing':['The House of Mending','Human','A tower of open wards and herb gardens where the sick are treated free and the healing arts are taught to anyone who will practise them.'],
  'Illusion':['The Mirror Pavilion','Mysterious','A tower no two visitors describe the same way. The shop is real; most of the rest is a test.'],
  'Infernal':['The Brimstone Scriptorium','Hell','A tower of black iron and contract-paper where every spell comes with terms, and the clerks read them aloud before the sale.'],
  'Nature Magic':['The Rootbound Tower','Inner Realm','A living tree grown into a tower, its rooms hollowed from the trunk. Spells are sold by the season and taught among the roots.'],
  'Necromancy':['The Ossuary College','Abyss','A tower of stacked bone in the drowned dark, quiet as a tomb, where the dead are lecturers and the living take notes.'],
  'Psionics':['The Quiet Mind','Outer Realm','A silent tower on an empty plain where nothing is spoken: lessons pass mind to mind, and prices are agreed without a word.'],
  'Runic Magic':['The Graven Spire','Inner Realm','A tower carved, floor by floor, with every Rune its masters have ever studied. Spells are sold as carved stones, read once and learned.'],
  'Shadow Magic':['The Umbral Library','Void','A tower of shadows cast by nothing. Its books can only be read in the dark, and its shopkeepers are never quite where they seem.'],
  'Transmutation':['The Crucible','Chaos','A tower that changes its own shape between visits, its masters turning lead to gold and stairs to slides for practice.'],
  'Void Magic':['The Hollow Archive','Void','A tower that keeps what is missing: lost words, erased spells, the gaps between things. Its deepest spells, from Void-grade realms, are traded only for Favor.'],
  'Wild Magic':['The Surge Spire','Chaos','A tower that sparks and hiccups with stray magic. Every sale comes with a free side effect, and the masters will not say which.'],
  'Resonance':['The Chorus Hall','Human','A round tower where every room is tuned to a note. Only Bards may buy here: Resonance spells are sung, never written.'],
};
const MT_RANKS=[['Visitor',3,0,'Anyone may enter and buy spells up to 3rd level.'],['Member',6,10,'Join by a fee or a service to the tower: spells up to 6th level, 10% off.'],['Archmage',9,25,'Earned by a deed for the tower (the DM decides): spells of 7th to 9th level, 25% off.']];
// Spell prices at a Magic Tower, by spell level, times the realm's price level ÷ 5 (economy audit, 2026-11-04): a gentler
// climb, so a caster's highest spell costs about 1½–4 levels' worth of treasure instead of 10–50 (it was 15,000–80,000
// for 7th–9th level).
const SPELL_BASE=[10,50,120,250,500,900,1500,2500,4000,6000];
function spellPrice(sp){const r=REALM[spellRealm(sp)]||REALMS[0],fb=favorBase(r.tier);return fb?{favor:(sp.lv+1)*fb*5}:{gp:SPELL_BASE[sp.lv]*realmBase(r.n)/5}}
const priceText=(p,mult)=>p.favor?fav(Math.max(1,Math.round(p.favor*mult))):gp(Math.round(p.gp*mult));
// Tower Cards (campaign rule): a card teleports its holder to one Magic Tower once per long rest, for one hour, then back
// to where it was used. It costs one spell slot, paid at the tower (reach it on foot, or on a friend's card).
function towerCardTake(id,school){const c=PARTY.find(x=>x.id===id);if(!c)return;if(!c.cls||!CASTER[c.cls]){toast('Only a spellcaster can pay a spell slot for a card');return}
  const L=+c.level||1,L2=c.cls2?Math.max(0,Math.min(L-1,+c.lv2||0)):0,sl=mcSlots(c,L-L2,L2);let paid=0;c.slotUsed=c.slotUsed||{};
  if(sl){const tot=sl.pact?{[({'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5}[sl.lvl]||1)]:sl.n}:Object.fromEntries((sl.slots||[]).map((n,i)=>[i+1,n]));for(const lv of Object.keys(tot).map(Number).sort((a,b)=>a-b)){const u=c.slotUsed[lv]||{};for(let i=0;i<tot[lv];i++)if(!u[i]){u[i]=true;c.slotUsed[lv]=u;paid=lv;break}if(paid)break}}
  if(!paid&&!confirm('No unused spell slot is marked on the sheet. Take the card anyway (the DM checks the slot)?'))return;
  c.towerCards=(c.towerCards||[]).concat({t:school,used:0});saveParty();toast(`${c.name||'They'} hold${c.name?'s':''} the ${(MAGIC_TOWERS[school]||[school])[0]} card${paid?' (a level '+paid+' slot spent)':''}`);renderMagic()}
// The DM hands a card to any character: found in the realm, a reward, or a gift (no spell slot is spent)
function towerCardGive(id,school,fromSheet){const c=PARTY.find(x=>x.id===id);if(!c||!school)return;if((c.towerCards||[]).some(x=>x.t===school)){toast((c.name||'They')+' already hold'+(c.name?'s':'')+' that card');return}
  c.towerCards=(c.towerCards||[]).concat({t:school,used:0});saveParty();toast(`${c.name||'They'} now hold${c.name?'s':''} the ${(MAGIC_TOWERS[school]||[school])[0]} card`);fromSheet?renderSheet():renderMagic()}
function towerCardUse(i){const c=sheetChar(),x=(c.towerCards||[])[i];if(!x)return;if(x.used){toast('Already used: it recharges on a long rest');return}x.used=1;saveParty();toast(`Teleported to ${(MAGIC_TOWERS[x.t]||[x.t])[0]}: one hour, then back to where you stood`);renderSheet()}
function towerCardRm(i){const c=sheetChar();if(!confirm('Give up this card?'))return;c.towerCards.splice(i,1);saveParty();renderSheet()}
// ════════════════════════════════════════════════════════════════
//  The Shop: a realm's market where characters spend and earn their own coin. Stock comes from the same shop roller as
//  the Tools page; prices follow the Economy rules (shops charge 50% over list, merchants buy at half list, a moneychanger
//  takes 10% to swap coin between realms). The DM may move prices for haggling or standing; nothing else changes.
// ════════════════════════════════════════════════════════════════
const SHOP_KEEP={smith:['Forge','hammers out blades and plate while you wait'],bowyer:['Workshop','smells of cedar shavings and linseed oil'],tanner:['Leatherworks','has hides drying on every rafter'],
  alch:['Apothecary','keeps a hundred jars and knows what is in most of them'],jewel:['Gemcutter','weighs everything twice, including you'],arcane:['Curiosities','sells things that hum, glow, or whisper'],
  butcher:['Monster Market','buys anything with teeth and sells it by the pound'],general:['Supply','has rope, lamps, rations, and an opinion on all of them']};
function shopKeeper(realm,kind){const t=((REALM[realm]||{}).tier||1),k=SHOP_KINDS.findIndex(x=>x[0]===kind),f=SMITH_FIRST[(t*17+k*11)%SMITH_FIRST.length],l=SMITH_LAST[(t*7+k*13+3)%SMITH_LAST.length],K=SHOP_KEEP[kind]||['Shop','is ready to trade'];
  return {name:f+' '+l,shop:l+'\'s '+K[0],line:f+' '+K[1]+'.'}}
const shopCoin=rn=>{const C=CURRENCY[rn];return C&&C.coin&&C.gp?C:CURRENCY.Human};
// common coins (copper to platinum) in gp
const commonGp=c=>{const o=c.coins||{};return (+o.cp||0)/100+(+o.sp||0)/10+(+o.ep||0)/2+(+o.gp||0)+(+o.pp||0)*10};
// what a character can pay in a realm, in that realm's coin; in the Human Realm the common coins count too
// take an amount in gp from the common coins (change comes back as gold, silver, and copper)
function commonTake(c,n){const o=c.coins=c.coins||{};let cp=Math.round(commonGp(c)*100-n*100);o.pp=0;o.ep=0;o.gp=Math.floor(cp/100);cp-=o.gp*100;o.sp=Math.floor(cp/10);o.cp=cp-o.sp*10}
const shopHave=(c,rn)=>(+(c.purse||{})[rn]||0)+(rn==='Human'?commonGp(c):0);
// whole local coins for a price in gp (at least one coin)
const shopCoins=(gpv,rn)=>Math.max(1,Math.ceil(gpv/shopCoin(rn).gp-1e-9));
function shopPay(c,rn,n){if(shopHave(c,rn)+1e-9<n)return false;c.purse=c.purse||{};const lp=+c.purse[rn]||0,a=Math.min(lp,n);c.purse[rn]=Math.round((lp-a)*100)/100;let rest=n-a;
  if(rest>1e-9&&rn==='Human')commonTake(c,rest);return true}
function shopEarn(c,rn,gpv){if(rn==='Human'){const o=c.coins=c.coins||{};let cp=Math.round(gpv*100);const g=Math.floor(cp/100);o.gp=(+o.gp||0)+g;cp-=g*100;const sp=Math.floor(cp/10);o.sp=(+o.sp||0)+sp;o.cp=(+o.cp||0)+(cp-sp*10);return fmtCoin(gpv,rn)}
  const n=Math.floor(gpv/shopCoin(rn).gp);if(n<1)return '';c.purse=c.purse||{};c.purse[rn]=(+c.purse[rn]||0)+n;return fmtCoin(n*shopCoin(rn).gp,rn)}
const fmtCoin=(gpv,rn)=>{const C=shopCoin(rn);if(rn==='Human'){const cp=Math.round(gpv*100);return cp%100?(cp>=100?fmt(Math.floor(cp/100))+' gp ':'')+(cp%100>=10?Math.floor(cp%100/10)+' sp ':'')+(cp%10?cp%10+' cp':'').trim():fmt(cp/100)+' gp'}const n=Math.round(gpv/C.gp*100)/100;return fmt(n)+' '+(n===1?C.coin.toLowerCase():C.pl)};
// what an item in a pack is worth at list price (a merchant pays half): materials at their price, vault goods at the shop's
// cost basis without the markup; player designs aren't bought (each is one of a kind)
function shopValue(n){const m=findMat(n);if(m&&m.price)return m.price;const b=findBP(n);if(b&&!b.design){const cost=(b.mats||[]).reduce((a,x)=>a+((findMat(x)||{}).price||0),0);return Math.max(5,Math.round((cost*1.5+b.lv*15)/5)*5)}return 0}
let SHOPST=null;
function shopState(){if(!SHOPST){SHOPST=Object.assign({realm:'Human',size:2,kind:'general',who:'',seed:(Math.random()*2**31)|0,adj:0,sold:{}},store.get('shop',{}))}if(!REALM[SHOPST.realm]||!REALM[SHOPST.realm].base)SHOPST.realm='Human';return SHOPST}
const shopSave=()=>store.set('shop',SHOPST);
function shopStock(){const S=shopState(),my=S.custom&&myShop(S.custom);if(my){const key='c|'+my.id+'|'+S.seed,gone=S.sold[key]||{},f=1+(+S.adj||0)/100;
    return {key,rows:(my.items||[]).filter(x=>x.n).map(x=>{const it=findBP(x.n)||findMat(x.n);return {it:it||null,n:x.n,sub:it?(it._t==='bp'?(genOf(it)||it.cat)+' · Lv '+it.lv:it.gr+(it.pn?' · '+it.pn:'')):'',q:Math.max(0,(+x.q||0)-(gone[x.n]||0)),price:Math.max(1,Math.round((+x.price||1)*f*100)/100)}})}}
  const who=PARTY.find(x=>x.id===S.who)||PARTY[0],res=rollShop(S.realm,S.kind,+S.size,S.seed+S.realm.length*7+S.kind.length,stageOf(who&&who.level));if(!res)return null;const key=S.realm+'|'+S.kind+'|'+S.size+'|'+S.seed,gone=S.sold[key]||{},f=1+(+S.adj||0)/100;
  const res2=res;return {key,rows:res2.mats.map(x=>({it:x.m,n:x.m.n,sub:x.m.gr+(x.m.pn?' · '+x.m.pn:''),q:Math.max(0,x.q-(gone[x.m.n]||0)),price:Math.max(1,Math.round(x.price*f))})).concat(res.bps.map(x=>({it:x.b,n:x.b.n,sub:(genOf(x.b)||x.b.cat)+' · Lv '+x.b.lv+(x.b.r?' · '+x.b.r:''),q:Math.max(0,1-(gone[x.b.n]||0)),price:Math.max(1,Math.round(x.price*f)),bp:1}))).concat((res.imports||[]).map(x=>({it:x.m,n:x.m.n,sub:'Import from the '+x.m.realm+' Realm · '+x.m.gr+(x.m.pn?' · '+x.m.pn:''),q:Math.max(0,x.q-(gone[x.m.n]||0)),price:Math.max(1,Math.round(x.price*f)),imp:1})))}}
// the Shop hands out gear for coin, so it is the DM's: it opens only with the DM lock (the same passphrase, pattern, or PIN as Hidden classes)
async function shopLocked(){await hcAuto();if(TAB!=='shop')return;if(HC)return renderShop();
  const lock=quickModes().length&&!PAT_SKIP&&window.crypto&&crypto.subtle?patLockHTML('renderShop'):hcLockHTML();
  $('content').innerHTML=`<div class="page"><div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Shop</h3><p>The Shop is run by the DM. Ask your DM to open it when your party reaches a market; they unlock it with the DM code.</p></div>${lock}<div id="tr-slot" style="margin-top:14px">${ltPlayerHTML()}${trPlayerHTML()}${swHTML()}</div></div>`;if(!LT.loaded)ltLoad().then(()=>{if(TAB==='shop'&&!HC&&$('tr-slot'))$('tr-slot').innerHTML=ltPlayerHTML()+trPlayerHTML()+swHTML()}).catch(()=>{});if(!TR.loaded)trLoad().then(()=>{if(TAB==='shop'&&!HC&&$('tr-slot'))$('tr-slot').innerHTML=ltPlayerHTML()+trPlayerHTML()+swHTML()}).catch(()=>{});if(!SW.loaded)swLoad().then(()=>{if(TAB==='shop'&&!HC&&$('tr-slot'))$('tr-slot').innerHTML=ltPlayerHTML()+trPlayerHTML()+swHTML()}).catch(()=>{});
  const b=document.querySelector('#content .panel b'),n=document.querySelector('#content .panel p.note');if(b&&$('hc-form'))b.textContent='The Shop is locked';if(n&&$('hc-form'))n.textContent='Enter the DM passphrase to open the Shop.';
  if($('hc-pat')||$('hc-pin'))patLockBind(renderShop);else hcBindLock(renderShop)}
// the DM chooses which players are at the counter; the Shop then trades only with them
function shopAt(){const S=shopState();S.at=(S.at||[]).filter(id=>PARTY.some(c=>c.id===id&&clCanEdit(c)));return S.at.map(id=>PARTY.find(c=>c.id===id))}
function shopAtAdd(id){const S=shopState();if(!id)return;S.at=S.at||[];if(!S.at.includes(id))S.at.push(id);S.who=id;shopSave();renderShop()}
function shopAtDrop(id){const S=shopState();S.at=(S.at||[]).filter(x=>x!==id);if(S.who===id)S.who=S.at[0]||'';shopSave();renderShop()}
function weekLoad(){if(typeof CL==='undefined'||!CL.user)return;const L=[];if(!TR.loaded)L.push(trLoad());if(!SW.loaded)L.push(swLoad());if(!LT.loaded)L.push(ltLoad());if(L.length)Promise.all(L.map(p=>p.catch(()=>{}))).then(()=>{if(TAB==='home')renderHome()})}
function renderShop(){if(!HC)return shopLocked();if(!TR.loaded)trLoad().catch(()=>{});if(!SW.loaded)swLoad().catch(()=>{});if(!LT.loaded)ltLoad().catch(()=>{});const S=shopState(),at=shopAt(),pool=at.length?at:PARTY.filter(x=>clCanEdit(x)),c=pool.find(x=>x.id===S.who)||pool[0]||null;if(c&&S.who!==c.id)S.who=c.id;const my=S.custom&&myShop(S.custom);if(S.custom&&!my)S.custom='';const rn=S.realm,C=shopCoin(rn),K=my?{shop:my.name||'Unnamed shop',line:my.line||'',name:my.keeper||'the shopkeeper'}:shopKeeper(rn,S.kind),st=shopStock(),dm=role()!=='player';
  const on='background:var(--goldbg);border-color:var(--gold)',kinds=SHOP_KINDS.map(([k,l])=>`<button class="chip${k===S.kind&&!my?' on':''}" style="${k===S.kind&&!my?on:''}" onclick="SHOPST.kind='${k}';SHOPST.custom='';shopSave();renderShop()">${esc(l)}</button>`).join('')
    +(dm?`<span class="ms-sep" aria-hidden="true"></span>${myShops().map(x=>`<button class="chip ms-chip${my&&my.id===x.id?' on':''}" style="${my&&my.id===x.id?on:''}" onclick="SHOPST.custom='${x.id}';${x.realm&&REALM[x.realm]&&REALM[x.realm].base?`SHOPST.realm='${esc(x.realm)}';`:''}shopSave();renderShop()" title="Your own shop">★ ${esc(x.name||'Unnamed shop')}</button>`).join('')}<button class="chip" onclick="myShopEdit()">＋ New shop</button>${my?`<button class="chip" onclick="myShopEdit('${my.id}')">✎ Edit ${esc(my.name||'shop')}</button>`:`<button class="chip" onclick="myShopFromMarket()" title="Start a shop of your own from what this market has now">⧉ Copy this stock</button>`}`:'');
  const sellable=c?(c.inv||[]).map(([n,q])=>({n,q:+q||0,v:Math.min(shopValue(n)*2,shopValue(n)*(1+repPct(c)/100))})).filter(x=>x.q>0&&x.v>0):[];
  const others=c?Object.entries(c.purse||{}).filter(([z,v])=>z!==rn&&+v>0&&CURRENCY[z]&&CURRENCY[z].coin).concat(rn!=='Human'&&commonGp(c)>0?[['Human (common coins)',commonGp(c)]]:[]):[];
  $('content').innerHTML=`<div class="page shop">${datalists()}
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem;white-space:nowrap">Shop</h3><p>Buy and sell at a realm's market with a character's own coin. Shops charge 50% over list price, merchants buy at half the list price, and a moneychanger takes ${EXCHANGE_FEE*100}% to swap coin between realms. Every market also keeps a small <b>imports</b> shelf from other realms the shopper's stage has opened, at 2.5× list price; anything else is a special order for the DM.</p></div>
    <div class="tool"><div class="form" style="grid-template-columns:repeat(4,1fr)">
      <label>Market in<select id="sh-realm">${realmOpts(rn,r=>r.base)}</select></label>
      <label>Settlement<select id="sh-size">${[['1','Village'],['2','Town'],['3','City'],['4','Capital']].map(([v,l])=>`<option value="${v}"${+S.size===+v?' selected':''}>${l}</option>`).join('')}</select></label>
      <label>Shopping<select id="sh-who">${pool.length?pool.map(x=>`<option value="${x.id}"${c&&x.id===c.id?' selected':''}>${esc(x.name||'Unnamed')}</option>`).join(''):'<option value="">Add a character first</option>'}</select></label>
      <div style="align-self:end">${c?`<div class="note" style="margin:0">Purse here: <b>${esc(fmtCoin(shopHave(c,rn)*C.gp,rn))}</b>${rn!=='Human'?` <small>(${esc(C.coin)}, ${gp(C.gp)} each)</small>`:''}</div>`:''}</div></div>
      ${dm?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><label class="note" style="margin:0;display:flex;gap:6px;align-items:center" title="For haggling or a faction's standing: changes buying prices only">DM price change <select class="sel" id="sh-adj">${[[-25,'25% off'],[-10,'10% off'],[0,'None'],[10,'10% more'],[25,'25% more'],[100,'Double']].map(([v,l])=>`<option value="${v}"${+S.adj===v?' selected':''}>${l}</option>`).join('')}</select></label><button class="btn" onclick="SHOPST.seed=(Math.random()*2**31)|0;shopSave();renderShop()">🎲 Restock the market</button></div>`:''}
      ${dm?shopCounterHTML(at,c):''}</div>
    ${dm?trDmHTML(rn,C):''}${trChars().length?`<div style="margin-top:12px">${ltPlayerHTML()}${trPlayerHTML()}${swHTML()}</div>`:''}
    <div class="chips" style="margin:12px 0">${kinds}</div>
    <div class="cols" style="align-items:start">
      <section class="panel"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><h4 style="margin:0;font-family:var(--serif);font-size:1.25rem">${esc(K.shop)}</h4><span class="note" style="margin:0">${esc(K.line)}</span></div>${repHTML(c,K)}
        ${!st||!st.rows.length?`<div class="empty" style="margin-top:10px">Nothing in stock here. Try a bigger settlement, another shop, or restock.</div>`:`<div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>Item</th><th class="num">Stock</th><th class="num">Price</th><th></th></tr></thead><tbody>
          ${st.rows.map((x,i)=>{const coins=shopCoins(repBuy(x.price,c),rn),afford=c&&shopHave(c,rn)+1e-9>=coins;return `<tr${x.q?'':' style="opacity:.5"'}><td>${x.imp?'<span class="b blue" title="From another realm, at 2.5× the list price">Import</span> ':''}${x.it?`<a href="#" data-ref="${ref(x.it)}">${esc(x.n)}</a>`:`<b>${esc(x.n)}</b>`} <small style="color:var(--muted)">${esc(x.sub)}</small></td><td class="num">${x.q||'sold out'}</td><td class="num"><b>${esc(fmtCoin(coins*C.gp,rn))}</b>${rn!=='Human'?`<div class="note" style="margin:0">${gp(x.price)}</div>`:''}</td>
            <td style="white-space:nowrap">${x.q&&c?`${x.q>1?`<input type="number" class="sel" id="sb-${i}" value="1" min="1" max="${x.q}" style="width:58px;display:inline-block" aria-label="How many ${esc(x.n)} to buy"> `:''}<button class="btn${afford?' primary':''}" onclick="shopBuy(${i})"${afford?'':` title="Not enough ${esc(C.pl)} in the purse"`}>Buy</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`}
        ${c&&rn!=='Human'?`<div class="note" style="margin:8px 0 0">Prices are in ${esc(C.coin)}s (${gp(C.gp)} each). No local coin? Use the moneychanger.</div>`:''}</section>
      <div style="display:flex;flex-direction:column;gap:14px">
      <section class="panel"><h4 style="margin:0;font-family:var(--serif);font-size:1.15rem">Sell to ${esc(K.name)}</h4><div class="note" style="margin:2px 0 8px">Half the list price, paid in ${esc(rn==='Human'?'gold, silver, and copper':C.coin+'s')}. Your own forged designs are one of a kind and aren't bought.</div>
        ${!c?'<div class="note">Choose who is shopping.</div>':sellable.length?`<div class="tablewrap"><table class="t"><thead><tr><th>In ${esc(c.name||'their')}'s pack</th><th class="num">Have</th><th class="num">Offer each</th><th></th></tr></thead><tbody>${sellable.map((x,i)=>`<tr><td>${esc(x.n)}</td><td class="num">${x.q}</td><td class="num">${esc(fmtCoin(x.v/2,rn))}</td><td style="white-space:nowrap">${x.q>1?`<input type="number" class="sel" id="ss-${i}" value="1" min="1" max="${x.q}" style="width:58px;display:inline-block" aria-label="How many ${esc(x.n)} to sell"> `:''}<button class="btn" onclick="shopSell(${esc(JSON.stringify(x.n))},${i})">Sell</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="note">Nothing in the pack a merchant will buy.</div>'}</section>
      ${dm&&c?shopDmTradeHTML(c,rn,C):''}
      ${c&&rn!=='Human'?`<section class="panel"><h4 style="margin:0;font-family:var(--serif);font-size:1.15rem">Moneychanger</h4><div class="note" style="margin:2px 0 8px">Swap other coin for ${esc(C.coin)}s. The changer keeps ${EXCHANGE_FEE*100}%.</div>
        ${others.length?`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><input type="number" class="sel" id="mc-n" value="1" min="1" style="width:80px"><select class="sel" id="mc-from" style="max-width:220px">${others.map(([z,v])=>`<option value="${esc(z)}">${esc(z==='Human (common coins)'?'gp (common coins)':CURRENCY[z].pl+' · '+z)} · have ${fmt(Math.floor(+v*100)/100)}</option>`).join('')}</select><button class="btn" onclick="shopChange()">Change</button></div>`:'<div class="note">No other coin in the purse to change.</div>'}</section>`:''}
      </div></div>${dm?`<div style="margin-top:14px">${tlHTML()}</div>`:''}</div>`;
  tlBind();$('sh-realm').onchange=e=>{S.realm=e.target.value;shopSave();renderShop()};$('sh-size').onchange=e=>{S.size=+e.target.value;shopSave();renderShop()};if($('sh-who'))$('sh-who').onchange=e=>{S.who=e.target.value;shopSave();renderShop()};if($('sh-adj'))$('sh-adj').onchange=e=>{S.adj=+e.target.value;shopSave();renderShop()}
  if($('sh-add'))$('sh-add').onchange=e=>shopAtAdd(e.target.value);
  if($('dt-n'))$('dt-n').oninput=()=>{const v=shopValue($('dt-n').value.trim());if(v)$('dt-p').value=shopCoins(v*1.5,rn)}}
function shopCounterHTML(at,c){const rest=PV().filter(x=>clCanEdit(x)&&!at.includes(x));
  return `<div class="sh-counter"><b>At the counter</b>${at.length?at.map(x=>`<span class="chip${c&&x.id===c.id?' on':''}" style="${c&&x.id===c.id?'background:var(--goldbg);border-color:var(--gold)':''}"><button class="linkbtn" onclick="SHOPST.who='${x.id}';shopSave();renderShop()">${esc(x.name||'Unnamed')}</button> <button class="linkbtn sh-drop" title="Send ${esc(x.name||'them')} away from the counter" aria-label="Remove ${esc(x.name||'them')}" onclick="shopAtDrop('${x.id}')">✕</button></span>`).join(''):'<span class="note" style="margin:0">Everyone can shop. Add players to trade only with them.</span>'}
    ${rest.length?`<select class="sel" id="sh-add" style="max-width:200px" aria-label="Add a player to the counter"><option value="">+ Add a player…</option>${rest.map(x=>`<option value="${x.id}">${esc(x.name||'Unnamed')}${x.camp?'':' (yours)'}</option>`).join('')}</select>`:''}</div>`}
// the DM trades with a player directly, at the DM's own price: buy anything from their pack, or sell them anything at all
function shopDmTradeHTML(c,rn,C){const inv=(c.inv||[]).filter(z=>(+z[1]||0)>0),pl=esc(rn==='Human'?'gp':C.pl);
  if(!$('dl-shopitem'))document.body.insertAdjacentHTML('beforeend',`<datalist id="dl-shopitem">${BPS.filter(b=>!b.design).concat(MATS).map(x=>`<option value="${esc(x.n)}">`).join('')}</datalist>`);
  return `<section class="panel sh-dm"><h4 style="margin:0;font-family:var(--serif);font-size:1.15rem">DM trade with ${esc(c.name||'them')}</h4><div class="note" style="margin:2px 0 8px">You name the price, in ${pl}. Buy anything from their pack, even what no merchant wants, or sell them anything at all. Price 0 is a gift.</div>
    ${inv.length?`<div class="tablewrap"><table class="t"><thead><tr><th>Their pack</th><th class="num">Have</th><th>Qty</th><th>You pay each</th><th></th></tr></thead><tbody>${inv.map(([n,q],i)=>`<tr><td>${esc(n)}</td><td class="num">${+q}</td><td><input type="number" class="sel" id="db-q-${i}" value="1" min="1" max="${+q}" style="width:58px" aria-label="How many ${esc(n)} to buy from them"></td><td><input type="number" class="sel" id="db-p-${i}" value="${Math.floor(shopValue(n)/2/C.gp)}" min="0" style="width:80px" aria-label="You pay each for ${esc(n)}, in ${pl}"></td><td><button class="btn" onclick="shopDmBuy(${esc(JSON.stringify(n))},${i})">Buy</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="note">Their pack is empty.</div>'}
    <div class="sh-dmsell"><input class="sel" id="dt-n" list="dl-shopitem" placeholder="Sell them an item…" aria-label="Item to sell"><input type="number" class="sel" id="dt-q" value="1" min="1" aria-label="How many" style="width:58px"><input type="number" class="sel" id="dt-p" value="0" min="0" aria-label="Price each in ${pl}" title="Price each, in ${pl}" style="width:80px"><button class="btn primary" onclick="shopDmSell()">Sell to them</button></div></section>`}
function shopRestore(c,snap){const o=JSON.parse(snap);Object.keys(c).forEach(k=>{if(!(k in o))delete c[k]});Object.assign(c,o);saveParty();if(TAB==='shop')renderShop()}
function shopDmBuy(n,i){const S=shopState(),c=PARTY.find(x=>x.id===S.who);if(!c||!clCanEdit(c))return;const row=(c.inv||[]).find(z=>z[0]===n);if(!row)return;const rn=S.realm,C=shopCoin(rn),q=Math.max(1,Math.min(+row[1]||0,Math.round(+(($('db-q-'+i)||{}).value)||1))),each=Math.max(0,+(($('db-p-'+i)||{}).value)||0);
  const snap=JSON.stringify(c),paid=each*q?shopEarn(c,rn,each*q*C.gp):'nothing';row[1]=(+row[1]||0)-q;c.inv=c.inv.filter(z=>(+z[1]||0)>0);const lid=shopLog({c,kind:'sell',item:n,qty:q,gpv:each*q*C.gp,rn,src:'dm'});saveParty();renderShop();
  undoToast(`Bought ${q>1?q+' × ':''}${n} from ${c.name||'them'} for ${paid}`,()=>{shopUnlog(lid);shopRestore(c,snap)})}
function shopDmSell(){const S=shopState(),c=PARTY.find(x=>x.id===S.who);if(!c||!clCanEdit(c))return;const rn=S.realm,C=shopCoin(rn),raw=(($('dt-n')||{}).value||'').trim(),it=findBP(raw)||findMat(raw),n=it?it.n:raw;if(!n){toast('Name the item to sell');return}
  const q=Math.max(1,Math.round(+(($('dt-q')||{}).value)||1)),each=Math.max(0,Math.round(+(($('dt-p')||{}).value)||0)),cost=each*q;
  if(cost&&shopHave(c,rn)+1e-9<cost){toast(`${c.name||'They'} can't afford that: ${fmtCoin(cost*C.gp,rn)}, and they have ${fmtCoin(shopHave(c,rn)*C.gp,rn)}`);return}
  const snap=JSON.stringify(c),got=invAdd(c,n,q,true,false);if(!got){toast(`${c.name||'Their'} pack is full`);return}
  if(cost)shopPay(c,rn,each*got);const lid=shopLog({c,kind:cost?'buy':'gift',item:n,qty:got,gpv:each*got*C.gp,rn,src:'dm'});saveParty();renderShop();
  undoToast(`${c.name||'They'} ${cost?'bought':'got'} ${got>1?got+' × ':''}${n}${cost?' for '+fmtCoin(each*got*C.gp,rn):' as a gift'}${got<q?' (the pack is full)':''}`,()=>{shopUnlog(lid);shopRestore(c,snap)})}
