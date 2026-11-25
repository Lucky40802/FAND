// ── The New player guide: every feature in plain words, and hands-on tutorials that walk you around the real pages ──
const TOURS={
  find:{icon:'🔍',t:'Finding anything',d:'Search, filter the big lists, and open anything for its full details.',steps:[
    {go:'home',at:['#content .hero-search'],t:'Search from Home',b:'This box searches the whole compendium at once: Blueprints, materials, monsters, spells, gods, rules, and notes. Type a few letters and pick a result.'},
    {at:['.search-btn','#bnav button:nth-child(2)'],t:'Search from any page',b:'The search is always up here, on every page. On a computer, press Ctrl K (or /) to open it without the mouse.'},
    {go:'bestiary',at:['#ctrl input','#ctrl'],t:'Filter a list',b:'Every big list (the Bestiary, Materials, Blueprints, Spells) has a filter box. Type to narrow the list as you go.'},
    {at:['#sb','#ctrl'],t:'Narrow it down',b:'The side panel filters by realm, grade, type, and more. On a phone it opens from the Filters button. Pick a few and the list shrinks to match.'},
    {at:['#content .card'],t:'Open anything',b:'Click any card to open its full details. Everything links: a monster shows what it drops, a material shows what uses it, a god shows their Runes and rivals.'},
    {go:'codex',at:['#ctrl input','#ctrl','#content .card','#content'],t:'The Codex',b:'Every note from the campaign\'s own vault lives here, word for word. If you want the source text for something, this is where it is.'}]},
  character:{icon:'🧙',t:'Your first character',d:'Build a character step by step, then use the sheet in play.',steps:[
    {go:'sheet',at:['button[onclick="charWizard()"]'],t:'Build a character for me',b:'The easiest start: a step-by-step builder asks a few questions (people, class, background, scores, gear) and fills in the whole sheet for you. No rulebook needed.'},
    {at:['#sh-new'],t:'Or start from a blank sheet',b:'If you already know your character, make a blank one and fill it in yourself. Everything saves as you type.'},
    {at:['.sh-noprint .chips'],t:'The sheet\'s pages',b:'Page 1 is what you need in play. Details, Spells, Equipment & Materials, and the FAND page hold the rest. You can print any of them, or all at once.'},
    {at:['[data-s="abil.str"]'],t:'Type and the sheet does the maths',b:'Change a score and its modifier, your saves, and everything that depends on it update straight away.'},
    {at:['.hpq'],t:'Hit points in play',b:'Take damage or heal with these buttons. Temporary hit points go first, and the sheet tracks conditions, rests, and death saves too.'},
    {at:['#sh-lvl'],t:'Level up',b:'When you level up, this walks you through it: hit points, new class features, and a checklist of what to choose.'},
    {at:['button[onclick*="openTable"]'],t:'The table screen',b:'A big, simple view for the table: your hit points, dice, and the initiative order, easy to read on a phone or tablet.'}]},
  dice:{icon:'🎲',t:'Rolling dice',d:'Roll anything, build dice pools, save your favourite rolls.',steps:[
    {go:'dice',at:['#dr-e'],t:'Type any roll',b:'Write a roll the way you would say it: 1d20 + 5, 2d6 + 3, 4d6 drop lowest. Then press Roll.'},
    {at:['#dr-go'],t:'Roll it',b:'The dice tumble on screen and the total is added up for you, with each die shown.'},
    {at:['#dp-box'],t:'A dice pool',b:'Click dice to gather a handful, then roll them all at once: handy for big damage rolls.'},
    {at:['#ds-e','#ds-add'],t:'Save your rolls',b:'Save rolls you make often (your sword attack, a fireball) and roll them with one tap.'},
    {go:'bestiary',at:['#content .card'],t:'Tap dice anywhere',b:'Anywhere you see a roll written on a page, like 2d6 + 3 in a monster\'s attack, tap it to roll it.'}]},
  crafting:{icon:'⚒',t:'Gear and crafting',d:'Blueprints, materials, the Forge, the Shop, and planning what to make.',steps:[
    {go:'blueprints',at:['#ctrl input','#ctrl'],t:'Blueprints',b:'Thousands of designs for weapons, armor, potions, tools, and more, across ten professions. Each one lists its materials, level, and what it does.'},
    {go:'materials',at:['#content .card'],t:'Materials',b:'Everything things are made of, graded by realm and quality. A material\'s property and trait go into whatever you make from it.'},
    {go:'forge',at:['#fg-find'],t:'The Forge: pick a design',b:'Search a general design (a longsword, a shield, a staff) to build your own item part by part.'},
    {at:['#content input[data-mc^="fg:"]'],t:'Fill each part',b:'Choose a material for each part from your party\'s packs. The Forge shows how well it fits and what powers it brings, and some pairs unlock hidden combos.'},
    {at:['#gk'],t:'Or describe it',b:'The Mystic Forge designs an item from your words and your materials. Its stats still follow the Forge\'s rules.'},
    {at:['.fg-strike','#fg-out'],t:'Three strikes',b:'Pick who forges it, then strike the anvil three times. The roll decides the quality, and only then is the item fully revealed.'},
    {go:'workshop',at:['#content .page'],t:'The Workshop',b:'Items players have forged and chosen to share. Browse them for ideas.'},
    {go:'shop',at:['#content .panel','#content .page'],t:'The Shop',b:'Buy and sell at a realm\'s market with your character\'s own coin. Prices follow the realm you are in. The DM opens it with the DM code when the party reaches a market.'},
    {go:'craft',at:['#cf-bp'],t:'Plan what to make',b:'Pick a Blueprint and how many, and the planner adds up the materials, the cost, and what you still need to gather or buy.'}]},
  world:{icon:'🌍',t:'The world of Vestige',d:'The lore, the realms, the gods, and the Towers.',steps:[
    {go:'lore',at:['#content .hero'],t:'The Lore',b:'Start here to learn the world: Infinatas, the gods who came as refugees, the Runes they fight over, and the realms. The chapters are listed down the side.'},
    {go:'realms',at:['#content .ladder','#content svg','#content .page'],t:'The Realms',b:'Eleven realms, from the Mortal Realm up to the Primordial. Deeper realms have stronger monsters and finer materials. The map shows how to travel between them.'},
    {go:'gods',at:['#content .card'],t:'The Gods',b:'Every god with their pantheon, Runes, rivals, and Hand of mortal followers. Players can sign contracts with gods for power.'},
    {go:'magic',at:['#content .chips','#mt-q'],t:'The Magic Towers',b:'Each school of magic has a Tower where its spells are taught and sold. Pick a Tower to see what you can learn at your rank.'},
    {go:'towers',at:['#content .panel'],t:'The Rune Towers',b:'Towers grown from unclaimed Runes, floor after floor of trials. Climbing them is one way to unlock a hidden class.'},
    {go:'classes',at:['#content .page'],t:'Classes',b:'Every class with its features from level 1 to 100, and the class changes (II to V) as you grow.'}]},
  table:{icon:'🛡',t:'Running a game',d:'For the DM: the party, encounters, combat, and session notes.',steps:[
    {go:'party',at:['#content .page'],t:'The Party',b:'Every character in your group in one place: hit points, gear, money, and contracts. Characters made on the sheet appear here.'},
    {go:'encounter',at:['#en-lv','#en-out'],t:'Build an encounter',b:'Set the party\'s level and the realm, and the builder picks a fair fight. Send it straight to the combat tracker.'},
    {go:'combat',at:['button[onclick="cbAddParty()"]'],t:'Start combat',b:'Add the party and the monsters, roll initiative, and the tracker keeps the order.'},
    {at:['button[onclick="cbNext()"]'],t:'Take turns',b:'Next turn moves down the order and counts the rounds. Condition timers count down and end on their own.'},
    {at:['table.cbt'],t:'Track everything',b:'Hit, Heal, and Temp change hit points (armour is taken off damage for you). Party members at 0 HP roll death saves here, and conditions can have timers.'},
    {go:'prep',at:['#pp-roll','#pp-out'],t:'Session prep',b:'Plan a session in one place: the party, a Tower floor, encounters, and story hooks.'},
    {go:'hooks',at:['#hk-roll'],t:'Story hooks',b:'Stuck for an idea? Roll a story hook or an NPC drawn from the gods, Runes, and monsters of the world.'},
    {go:'journal',at:['#jn-t','#jn-add'],t:'The journal',b:'Keep session notes that link to everything in the compendium.'}]},
  dmtrade:{icon:'🪙',t:'Trading and treasure (DM)',d:'For the DM: the Shop counter, trade requests and haggling, your own shops, the loot pool, downtime, and what happened this session.',steps:[
    {go:'shop',at:['.sh-counter','#content .page'],t:'Who is at the counter',b:'Add the players who are shopping. Once anyone is added, the Shop trades only with them, and you switch between them with their chips. (The Shop opens with your DM code.)'},
    {at:['.tr-dm','.sh-dm','#content .page'],t:'Trade requests and haggling',b:'Players ask to buy or sell from their own Shop page. Agree at a price, Counter with your own price (they agree or turn it down), or Decline. Agreeing moves the item and the coin.'},
    {at:['.sh-dm','#content .page'],t:'Your own price',b:'DM trade buys anything from the chosen player\'s pack, or sells them anything at all, at the price you name. Price 0 is a gift.'},
    {at:['.ms-chip','button[onclick="myShopEdit()"]','#content .chips'],t:'Shops of your own',b:'＋ New shop writes a shop with a shopkeeper, their line, and set stock and prices. ⧉ Copy this stock starts one from the market. On the NPCs page, 🛒 Shop turns an NPC into a shopkeeper.'},
    {at:['#tl','#content .page'],t:'The trade history',b:'Every trade, gift, loot hand-out, answered request and swap between players, with filters, totals and a CSV download.'},
    {go:'party',at:['.mmenu summary','#content .page'],t:'The loot pool',b:'Treasure outside a fight: add items and coin, give each thing out or split the coin, or let the players claim items (need, greed or pass, with a d20 each).',act:['Open the loot pool',()=>lootOpen()]},
    {at:['.mmenu summary','#content .page'],t:'Calendar and downtime',b:'The day from the session clock, coming events, and downtime that takes days and costs coin (training, carousing, research, work). It finishes on its own as the days pass.',act:['Open the calendar',()=>calOpen()]},
    {at:['#dmPadBtn','.top'],t:'What happened this session',b:'In the notepad\'s ⋯ menu, the Session timeline lists every fight, trade, loot, rest and journal entry since the session started; the recap gathers them up.',act:['Open the timeline',()=>sessTimeline()]},
    {at:['#inboxBtn:not([hidden])','.top'],t:'The inbox',b:'Requests, agreements, swaps and handouts stay in the 🔔 inbox until you have read them, for you and for your players.'}]},
  account:{icon:'⚙',t:'Your account and settings',d:'Sign in, change how FAND looks, and get help.',steps:[
    {go:'account',at:['#clEmail','#clGoogle','#content .page'],t:'Sign in',b:'Sign in to keep your characters on every device, join your DM\'s campaign, and share forged items in the Workshop.'},
    {go:'settings',at:['#content .page'],t:'Settings',b:'Light or dark (light is the Heaven Forge, dark the Hell Forge), text size, and more.'},
    {at:['#aiFab','.ai-fab'],t:'Ask FAND',b:'Ask a question in your own words and FAND answers from the compendium, with links to what it found.'},
    {go:'help',at:['#content .page'],t:'Help',b:'How each page works, and what to do if something looks wrong. You can come back to this guide any time from the Reference menu.'}]},
};
const GLOSSARY=[['Realm','One of eleven worlds stacked from the Mortal Realm up to the Primordial. The deeper the realm, the stronger everything in it.'],['Grade','How fine a material is within its realm, 1 to 10.'],['Rank','A material\'s overall strength, 1 to 100: its realm and grade together.'],['Blueprint','A design for something you can make, with the materials it needs.'],['Potency','How strong a material\'s property is, 1 to 50. Higher Potency adds more at every 5.'],['Rune','A Law of the world that a god holds. Runes give powers, spells, and Towers.'],['Stage','Your class grows in stages, I to V, as you level, with a new class name at each.'],['Hidden class','A secret class unlocked through quests and the Rune Towers; the DM keeps the list.'],['Contract','A deal with a god: power for service, in ten ranks from Minor to 1st Finger.']];
function renderGuide(){const done=toursDone(),T=Object.entries(TOURS),n=T.filter(([k])=>done.includes(k)).length,next=T.find(([k])=>!done.includes(k));
  const label=id=>(TABS.find(t=>t[0]===id)||[])[1]||id,tourOf=id=>T.filter(([,v])=>v.steps.some(s=>s.go===id)).map(([k])=>k)[0];
  $('content').innerHTML=`<div class="page guide">
    <section class="hero" style="margin-bottom:16px"><h2>📖 New player guide</h2><p>Everything FAND can do, in plain words, and hands-on tutorials that walk you around the real pages. Each one takes a minute or two.</p>
      <div class="gd-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${T.length}" aria-valuenow="${n}"><i style="width:${n/T.length*100}%"></i></div><div class="note" style="margin:6px 0 10px">${n} of ${T.length} tutorials done${n===T.length?' · you have seen it all!':''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${next?`<button class="btn primary" onclick="openTour('${next[0]}')">▶ ${n?'Next tutorial':'Start the first tutorial'}: ${esc(next[1].t)}</button>`:''}<button class="btn" onclick="openGuide(0)">The quick welcome</button>${n?`<button class="btn" onclick="store.set('toursDone',[]);renderGuide()">Reset progress</button>`:''}</div></section>
    <section class="sec"><div class="sec-h"><h3>Tutorials</h3><p>Pick any order. Each one opens the pages it talks about and points at the real buttons.</p></div>
      <div class="gd-grid">${T.map(([k,v])=>`<div class="panel gd-tc${done.includes(k)?' done':''}"><div class="gd-ti">${v.icon}</div><div style="flex:1;min-width:0"><b>${esc(v.t)}</b>${done.includes(k)?' <span class="b green">✓ Done</span>':''}<div class="note" style="margin:2px 0 8px">${esc(v.d)} · ${v.steps.length} steps</div><button class="btn${done.includes(k)?'':' primary'}" onclick="openTour('${k}')">${done.includes(k)?'Again':'Start'}</button></div></div>`).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h3>Every feature</h3><p>Every page of FAND, by what it is for.</p></div>
      ${NAV_GROUPS.map(([g,ids])=>`<details class="panel gd-grp" open><summary><b>${esc(g)}</b> <small style="color:var(--muted)">${ids.length} pages</small></summary><div class="gd-feats">${ids.map(id=>{const tk=tourOf(id);return `<div class="gd-feat"><div style="flex:1;min-width:0"><a href="${pageUrl(id)}" data-go="${id}"><b>${esc(label(id))}</b></a><div class="note" style="margin:2px 0 0">${esc(NAV_BLURB[id]||'')}</div></div>${tk?`<button class="btn" style="padding:2px 10px" onclick="openTour('${tk}',TOURS['${tk}'].steps.findIndex(s=>s.go==='${id}'))" title="The part of the ${esc(TOURS[tk].t)} tutorial about this page">▶ Show me</button>`:''}<a class="btn" style="padding:2px 10px" href="${pageUrl(id)}" data-go="${id}">Go there →</a></div>`}).join('')}</div></details>`).join('')}</section>
    <section class="sec"><div class="sec-h"><h3>Words to know</h3><p>FAND\'s own terms, in a sentence each.</p></div><div class="panel"><dl class="gd-gl">${GLOSSARY.map(([w,d])=>`<dt>${esc(w)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></div></section>
  </div>`}
// first visit: only on Home, only for someone with nothing saved yet (and never for browser automation)
function guideAuto(){if(TAB!=='home'||store.get('guided',false)||navigator.webdriver||location.hash.length>2)return;let has=false;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('fand.')&&!/^fand\.(theme|__)/.test(k)){has=true;break}}}catch(e){}if(has){store.set('guided',true);return}setTimeout(()=>{if(TAB==='home'&&GSTEP<0)openGuide(0)},600)}
const HELP=[
  ['start','Getting started',`<p>FAND is the compendium of the FAND campaign: the world of Vestige and its rules, with tools for players and DMs. Nothing needs installing, and it works offline once a page has loaded.</p><p><button class="btn primary" type="button" onclick="openGuide(0)">Show me around</button> <a class="btn" href="${pageUrl('settings')}#set-play" data-go="settings">Player or DM view</a></p>`],
  ['find','Finding things',`<ul><li><b>Search everything</b>: the search box at the top (or <kbd>Ctrl</kbd> <kbd>K</kbd>) finds Blueprints, materials, monsters, gods, Runes, spells, and rules.</li><li><b>Lists</b> (Blueprints, Bestiary, Spells, …) have filters; press <kbd>/</kbd> to type a filter and <kbd>←</kbd> <kbd>→</kbd> to step through results in a window.</li><li><b>Filters in search</b>: <code>monster realm:Hell grade:5</code>, <code>rarity:legendary sword</code>, <code>spell school:evocation lv:3</code>. Type <code>roll 2d6+3</code> to roll.</li><li><b>Pins</b>: the ★ in any window pins it to Home. <b>Recently viewed</b> is on Home and in the search box. 📝 adds your own note to anything, and ⚖ compares Blueprints, monsters, or materials side by side.</li><li>Every window has a link you can copy and share.</li></ul>`],
  ['chars','Characters',`<ul><li><a href="#" onclick="charWizard();return false">Build a character</a> step by step, or fill in a blank sheet on the <a href="${pageUrl('sheet')}" data-go="sheet">Character sheet</a>.</li><li>The sheet works out hit points, armour, attacks, spells, and money; <b>Level up</b> asks only what changes.</li><li>The <a href="${pageUrl('party')}" data-go="party">Party</a> page holds every character on this device: gear, contracts, and inventory.</li><li>Deleted something by mistake? Press <b>Undo</b> in the message at the bottom (it stays for a few seconds).</li></ul>`],
  ['dice','Dice',`<ul><li>Tap any dice written on a page, like 2d6 + 3, to roll it.</li><li>The <a href="${pageUrl('dice')}" data-go="dice">Dice</a> page has a dice pool (keep highest, advantage, exploding dice, successes), saved rolls, and 30 dice styles.</li><li><b>Exploding dice</b>: a die that rolls its highest face rolls again and adds.</li><li>On the character sheet, tap any bonus to roll it. <b>Table screen</b> (from the sheet or Combat) is a big, touch-friendly view for play.</li></ul>`],
  ['together','Playing together',`<ul><li><a href="${pageUrl('account')}" data-go="account">Sign in</a> with your email to keep your characters, journal, and settings on every device.</li><li>A DM can make a <b>campaign</b> and send an invite link; players who join share their characters with the DM.</li><li>Changes sync by themselves; Sync now in the account menu does it at once.</li></ul>`],
  ['dm','For the DM',`<ul><li><a href="${pageUrl('prep')}" data-go="prep">Session prep</a>, <a href="${pageUrl('encounter')}" data-go="encounter">Encounters</a>, <a href="${pageUrl('combat')}" data-go="combat">Combat</a>, and <a href="${pageUrl('hooks')}" data-go="hooks">Hooks</a> run the table.</li><li><a href="${pageUrl('hidden')}" data-go="hidden">Hidden classes</a> are locked for the DM: unlock them to browse the menu, open any class, and grant it to a character.</li><li><b>Handouts</b>: tap 📜 on any monster, item, or god (or search "new handout"), edit what players may know, then show it, share the link, or send it to your campaign.</li><li>Choose <b>DM</b> in Settings → How you play to put these first.</li></ul>`],
  ['phone','Phones and offline',`<ul><li>On a phone, the bar at the bottom has Home, Search, Dice, your character, and Menu (every page).</li><li><b>Install</b>: in Settings → App, or your browser's "Add to Home Screen", gives FAND its own icon and window.</li><li>FAND keeps a copy of itself on the device, so it works without signal.</li></ul>`],
  ['settings','Settings',`<ul><li><a href="${pageUrl('settings')}" data-go="settings">Settings</a>: theme, text size, high contrast, less motion, dice style, the assistant's API key, backups, and the version.</li><li><b>Back up everything</b> downloads a file with all your saved data; Restore brings it back on any device.</li></ul>`],
  ['trouble','Something looks wrong',`<ul><li><b>A new change isn't showing.</b> A new version takes up to 10 minutes to reach everyone. Then use <a href="${pageUrl('settings')}#set-app" data-go="settings">Settings → App → Check for updates</a>, or close the tab and open it again. On a computer, <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>R</kbd> reloads everything.</li><li><b>My characters are missing on another device.</b> Sign in on both with the same email; or download a backup on one and restore it on the other.</li><li><b>The sign-in email doesn't arrive.</b> Check spam, wait a minute, and ask for a new code; use the newest code only.</li><li><b>Still stuck?</b> Clearing the site's data in your browser settings resets this device (sign in first so nothing is lost).</li></ul>`],
  ['keys','Keyboard shortcuts',`<div class="tablewrap"><table class="t"><tbody>${[['Ctrl K','Search everything'],['/','Filter the current list'],['← →','Previous and next in a window'],['↑ ↓','Step through the Hidden classes menu'],['Esc','Close a window, the menu, or the guide']].map(([k,d])=>`<tr><td style="white-space:nowrap"><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}</tbody></table></div>`],
];
function renderHelp(){
  $('content').innerHTML=`<div class="page set-wrap">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Help</h3><p>How to use FAND, and what to do when something looks wrong.</p></div>
    <div class="set-layout"><nav class="set-nav" aria-label="Help sections">${HELP.map(([id,t])=>`<a href="#" onclick="document.getElementById('help-${id}').scrollIntoView({behavior:'smooth'});return false">${t}</a>`).join('')}</nav>
    <div class="set-main">${HELP.map(([id,t,b])=>`<section class="panel set-sec help" id="help-${id}"><h3>${t}</h3>${b}</section>`).join('')}</div></div></div>`;
  diceify($('content'))}
// Quick rules: the rules a table checks mid-session, one tap from any page (works offline like the rest of the app)
const COND_TEXT={Blinded:'Cannot see. Attacks against it have advantage; its own attacks have disadvantage; checks that need sight fail.',Charmed:'Cannot attack the charmer or target it with harm. The charmer has advantage on social checks with it.',Deafened:'Cannot hear; checks that need hearing fail.',Frightened:'Disadvantage on checks and attacks while the source of its fear is in sight; cannot willingly move closer to it.',Grappled:'Speed 0. Ends if the grappler is incapacitated or the two are pulled apart.',Incapacitated:'No actions and no reactions.',Invisible:'Cannot be seen without magic or a special sense. Its attacks have advantage; attacks against it have disadvantage.',Paralyzed:'Incapacitated and cannot move or speak. Fails Strength and Dexterity saves. Attacks against it have advantage, and a hit from within 5 feet is a critical hit.',Petrified:'Turned to stone: incapacitated, unaware, resistant to all damage, and immune to poison and disease.',Poisoned:'Disadvantage on attack rolls and ability checks.',Prone:'Can only crawl; standing costs half its speed. Disadvantage on its attacks. Attacks from within 5 feet have advantage, from farther away disadvantage.',Restrained:'Speed 0. Disadvantage on its attacks and Dexterity saves; attacks against it have advantage.',Stunned:'Incapacitated, cannot move, speaks only haltingly. Fails Strength and Dexterity saves; attacks against it have advantage.',Unconscious:'Incapacitated, drops what it holds and falls prone. Fails Strength and Dexterity saves; attacks have advantage, and a hit from within 5 feet is a critical hit.',Exhaustion:'Levels stack. 1: disadvantage on checks. 2: speed halved. 3: disadvantage on attacks and saves. 4: hit point maximum halved. 5: speed 0. 6: death.',Concentrating:'Keeps a spell going. Taking damage calls for a Constitution save, DC 10 or half the damage, whichever is higher; failing ends the spell.'};
function openQuick(){
  const sec=(t,body,open)=>`<details class="blk" ${open?'open':''} style="border-top:1px solid var(--line);padding-top:10px"><summary style="cursor:pointer;font-family:var(--serif);font-size:1.08rem;font-weight:700">${t}</summary><div style="margin-top:8px;line-height:1.6">${body}</div></details>`;
  $('qBox').innerHTML=`<div class="mh"><div class="kind">At the table</div><h2 id="qTitle">Quick rules</h2>
      <div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div>
    <div class="mb">
      ${sec('Damage and Armor Class',`<p style="margin:0 0 6px"><b>To hit:</b> the attacker rolls <b>d20 + Accuracy</b>, the target rolls <b>d20 + Dodge</b> (DEX modifier). Higher roll wins; a tie is a miss. A natural 20 Accuracy roll that hits is a critical (×1.5 damage).</p><p style="margin:0">AC (gear, contract, and your <b>CON modifier</b>) is <b>subtracted</b> from the damage of each hit that beats the Dodge: <b>damage taken = damage − AC</b>, at least 1.</p><p class="note" style="margin:6px 0 0">Example: a 12-damage hit on AC 5 deals 7; a 12-damage hit on AC 15 deals 1.</p>`,true)}
      ${sec('Levels, class changes and realms',`<div class="tablewrap"><table class="t"><thead><tr><th>Levels</th><th>Class</th><th>Realms of this stage</th></tr></thead><tbody>${ROMAN.map((r,i)=>`<tr><td style="white-space:nowrap">${i*20+1}–${(i+1)*20}</td><td>${i?'Class '+r+' (at '+(i*20+1)+')':'Base class'}</td><td>${esc(STAGE_REALMS(i+1).join(', '))}</td></tr>`).join('')}</tbody></table></div><p class="note" style="margin:6px 0 0">Levels come from deeds, not XP. Every 20 levels the class changes (Ranger, Ranger II, …), and so does each subclass.</p>`)}
      ${sec('Raising the dead',`<p style="margin:0 0 6px">Chance = <b>2 / 10^(d+1)</b>, d = corpse level (its CR) − yours: <b>20%</b> at your level, <b>2%</b> one above, <b>0.2%</b> two above; always below your level. One try per corpse. <b>Summon slots:</b> summoning classes only, one per point of INT.</p><div style="display:flex;flex-wrap:wrap;gap:4px">${UNDEAD.map(u=>`<span class="chip" style="cursor:default">${esc(u.n)} <small>${u.p}%${u.chain?' ⛓':''}</small></span>`).join('')}</div><p class="note" style="margin:6px 0 0">⛓ needs a chain ritual to stay a servant. Full table: Rules page, Necromancy.</p>`)}
      ${sec('Saving throws and initiative',`<p style="margin:0">A save is a <b>plain d20</b>: no ability modifier, no proficiency. <b>Initiative</b> works the same way, monsters included: no DEX. Only <b>class abilities</b> and <b>equipment</b> add to them. Gear made with Warding, Steadfast, Clear-Minded, Quickening, Ever-Ready, or Timebound materials raises them by the material's Potency; the highest worn bonus of each kind counts, and the sheet adds it for you. <b>Skills</b> add no ability modifier either: a skill roll is d20 + the skill's bonus, never skill + modifier.</p><p style="margin:8px 0 0"><b>Basic actions</b> use the ability modifier. When a character does something rudimentary that no skill covers (lifting a gate, shoving a door, holding their breath, keeping their balance on a ledge), they roll d20 + that ability's modifier. Pick one or the other: a skill, or a basic action with its ability. Never both.</p>`)}
      ${sec('Realm Pressure',`<p style="margin:0 0 6px">Strain is a realm's Pressure minus the traveler's Attunement (level ÷ 10, contract rank ÷ 2, or the Potency rank of realm-material gear).</p><ul style="margin:0 0 8px;padding-left:20px"><li><b>1:</b> disadvantage on Constitution saves</li><li><b>2:</b> also 1 level of exhaustion per day</li><li><b>3:</b> also no benefit from long rests</li><li><b>4+:</b> 1 level of exhaustion every hour</li></ul><div class="chips">${REALMS.map(r=>`<span class="chip" style="border-color:${r.color}">${esc(r.n)} <b>${r.pressure}</b></span>`).join('')}</div><p class="note" style="margin:6px 0 0">Inside a god's own domain (through a temple passage) Pressure does not apply.</p>`)}
      ${sec('Conditions',`<div style="display:flex;flex-direction:column;gap:6px">${CONDITIONS.map(c=>`<div><b>${c}.</b> ${esc(COND_TEXT[c]||'')}</div>`).join('')}</div>`)}
      ${sec('Tower floors',`<ul style="margin:0;padding-left:20px"><li>Each Tower floor gives a <b>mission</b>; every 10th floor is a boss.</li><li>Every floor is one level, starting at the realm's stage: floor 5 of the Milestone Spire is level 5, with grade-5 guardians.</li><li>A Class Change Book drops 50% of the time at the floor's level; a party above the floor's level gets no other loot and only a 25% chance of a book.</li><li>Boss floors you conquer become teleport points.</li></ul><p style="margin:8px 0 0"><a href="${pageUrl('towers')}" data-go="towers">Open the Tower trial →</a></p>`)}
      <div class="note" style="margin:0">Full rules: <a href="${pageUrl('rules')}" data-go="rules">Rules page</a>.</div>
    </div>`;
  $('qbg').classList.add('open');
}
function closeQuick(){$('qbg').classList.remove('open');$('qBox').style.maxWidth='640px';$('qBox').onclick=null}
$('qbg').addEventListener('mousedown',e=>{if(e.target===$('qbg'))closeQuick()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('qbg').classList.contains('open'))closeQuick()});
document.addEventListener('click',e=>{if(e.target.closest('#qBox [data-go]'))closeQuick()},true);

// ════════════════════════════════════════════════════════════════
//  Accounts and campaigns (Supabase; set up with tools/cloud/, see the README)
// ════════════════════════════════════════════════════════════════
// Signed in, everything this site saves in the browser also goes to the account and follows it to every device. Each
// saved key keeps the time it last changed on this device, and the newest change wins. The party is merged character by
// character instead: each character keeps its own change time (_m) and a deleted one leaves a marker (partygone), so
// editing different characters on two devices loses nothing. A DM's campaign shares characters: every member sees the
// shared characters live, and only a character's owner or the DM can change it (the database enforces this).
var CL={on:typeof CLOUD!=='undefined'&&!!(CLOUD&&CLOUD.url&&CLOUD.key),sb:null,user:null,avatars:{},ready:null,signing:null,camps:[],members:{},
  dirty:new Set(),cdirty:new Set(),cgone:[],timer:0,ctimer:0,rtimer:0,pushing:false,cpushing:false,err:'',last:0,touched:false,chan:null,step:'',email:'',hc:false,later:false};
// kept on each device only: appearance, screen state (filters, searches, recently viewed), and the hidden-class locks
const CL_LOCAL=new Set(['dmpad','dmpadui','livecamp','recentq','theme','wakelock','tooltab','viewmode','charwiz','jedit','clsfocus','placefocus','diceanim','recent','spells','hc','hclv','jq','magic','rmap','dpool','hcpat','hcpin','hcqm','hcguard','hclog','anthropicKey','groqKey','groqModel']);
const clSkip=k=>!k||k.startsWith('__')||CL_LOCAL.has(k);
// A Home Screen app on an iPhone is often closed and restarted while you switch to Mail to read the code, which lost the
// "type your code" step. The email waiting for a code is kept on this device for an hour (as long as the code lasts).
const clIOSApp=()=>navigator.standalone===true;
const clApp=()=>clIOSApp()||matchMedia('(display-mode: standalone)').matches;
function clPending(){try{const p=JSON.parse(localStorage.getItem('fand.__pending')||'null');if(p&&p.email&&Date.now()-p.at<3600000)return p}catch(e){}return null}
function clPendingSet(e){try{if(e)localStorage.setItem('fand.__pending',JSON.stringify({email:e,at:Date.now()}));else localStorage.removeItem('fand.__pending')}catch(x){}}
{const p=clPending();if(p){CL.step='code';CL.email=p.email}}
function clMeta(){if(!clMeta.m){try{clMeta.m=JSON.parse(localStorage.getItem('fand.__cloud')||'null')}catch(e){}if(!clMeta.m||typeof clMeta.m!=='object')clMeta.m={};clMeta.m.ts=clMeta.m.ts||{}}return clMeta.m}
function clMetaSave(){try{localStorage.setItem('fand.__cloud',JSON.stringify(clMeta()))}catch(e){}}
function clRaw(k,v){try{localStorage.setItem('fand.'+k,JSON.stringify(v))}catch(e){}}
function clKeys(){const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('fand.')&&!clSkip(k.slice(5)))o.push(k.slice(5))}}catch(e){}return o}
function clMsg(e){const m=String(e&&(e.message||e.error_description||e.msg)||e||'Something went wrong.');
  if(/failed to fetch|networkerror|load failed|network request failed/i.test(m))return 'Couldn\'t reach the account server. Check your connection.';
  if(/rate limit/i.test(m))return 'Too many sign-in emails were sent. Wait a few minutes and try again.';
  if(/expired|invalid.*(token|otp)|token.*invalid/i.test(m))return 'That code is wrong or has expired. Ask for a new one.';
  return m}
// called by store.set: note when a key changed here, and send it to the account shortly
function cloudMark(k){if(!CL||!CL.on||clSkip(k))return;clMeta().ts[k]=Date.now();clMetaSave();if(CL.user){CL.dirty.add(k);clSchedule()}}
function clSchedule(){setTimeout(clDot,0);clearTimeout(CL.timer);CL.timer=setTimeout(()=>{cloudPush().catch(()=>{})},1200)}

// ── the party, character by character ──
var PH=null,PHC={};
const charHash=c=>JSON.stringify(c,(k,v)=>k&&k[0]==='_'?undefined:v);
function partyHashInit(){PH={};PHC={};PARTY.forEach(c=>{if(c._m==null)c._m=0;PH[c.id]=charHash(c);PHC[c.id]=c.camp||''})}
const clMine=c=>!c._by||!!(CL.user&&c._by.u===CL.user.id);
const clIsDM=camp=>!!(CL.user&&CL.camps.some(k=>k.id===camp&&k.dm===CL.user.id));
const clCanEdit=c=>clMine(c)||clIsDM(c.camp);
// called by saveParty: stamp the characters that changed, and note the deleted ones
function partyStamp(){if(!CL||!CL.on)return;if(!PH)partyHashInit();const now=Date.now(),seen=new Set();let gone=null;
  PARTY.forEach(c=>{if(!c.id)c.id=uid();seen.add(c.id);const h=charHash(c);if(PH[c.id]!==h){c._m=now;PH[c.id]=h;if(c.camp&&clCanEdit(c))CL.cdirty.add(c.id)}PHC[c.id]=c.camp||''});
  Object.keys(PH).forEach(id=>{if(seen.has(id))return;const camp=PHC[id];delete PH[id];delete PHC[id];(gone||(gone=store.get('partygone',{})))[id]=now;if(camp)CL.cgone.push([camp,id])});
  if(gone){Object.keys(gone).forEach(id=>{if(now-gone[id]>180*864e5)delete gone[id]});store.set('partygone',gone)}
  if(CL.user&&(CL.cdirty.size||CL.cgone.length))clCampSchedule()}
function partyMerge(L,R,G){const by=new Map(),order=[];
  const put=c=>{if(!c||typeof c!=='object'||!c.id)return;const o=by.get(c.id);if(!o)order.push(c.id);if(!o||(+c._m||0)>(+o._m||0))by.set(c.id,c)};
  L.forEach(put);R.forEach(put);return order.map(id=>by.get(id)).filter(c=>c._by||!(G[c.id]>=(+c._m||0)))}
const partySig=list=>JSON.stringify(list.map(c=>[c.id,+c._m||0,charHash(c)]));
const clOwnParty=()=>PARTY.filter(clMine).map(c=>{const o=Object.assign({},c);delete o._by;return o});
const clStrip=c=>{const o=Object.assign({},c);delete o._by;delete o._cs;delete o.camp;return o};
function clPartyChanged(){if(PARTY_SEL&&!PARTY.some(x=>x.id===PARTY_SEL))PARTY_SEL=null;saveParty();clRerender()}
// redraw the party or the sheet after a change from elsewhere, but never under the player's fingers
function clRerender(){designPlace(true);if(TAB==='forge'&&$('gk')){const C=$('content'),y=C.scrollTop;renderForge();C.scrollTop=y;return}if(TAB!=='party'&&TAB!=='sheet'&&TAB!=='account'&&TAB!=='settings')return;const a=document.activeElement;
  if(a&&$('content').contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){CL.later=true;return}
  CL.later=false;const y=$('content').scrollTop;if(TAB==='party')renderParty();else if(TAB==='account')renderAccount();else if(TAB==='settings')renderSettings();else renderSheet();$('content').scrollTop=y}
document.addEventListener('focusout',()=>{if(CL.later)setTimeout(()=>{if(CL.later)clRerender()},400)});

// ── your own data ──
async function cloudPull(){
  const {data,error}=await CL.sb.from('user_data').select('key,value,ts');if(error)throw error;
  const M=clMeta(),R=new Map((data||[]).map(r=>[r.key,r])),changed=[];
  CL.hc=R.has('__hc');
  R.forEach((r,k)=>{if(clSkip(k)||k==='party'||k==='partygone')return;const L=+M.ts[k]||0,ts=+r.ts||0;
    if(ts>L){clRaw(k,r.value);M.ts[k]=ts;changed.push(k)}else if(L>ts)CL.dirty.add(k)});
  clKeys().forEach(k=>{if(R.has(k)||k==='party'||k==='partygone')return;if(!M.ts[k])M.ts[k]=Date.now();CL.dirty.add(k)});
  const G=Object.assign({},store.get('partygone',{})),rg=R.get('partygone'),rc=await rtPull('user_characters');
  if(rg&&rg.value&&typeof rg.value==='object')Object.entries(rg.value).forEach(([id,t])=>{if(!(G[id]>=t))G[id]=t});
  if(rc)Object.entries(rc.gone).forEach(([id,t])=>{if(!(G[id]>=t))G[id]=t});
  if(Object.keys(G).length){clRaw('partygone',G);if(!rg||JSON.stringify(rg.value)!==JSON.stringify(G)){M.ts.partygone=Date.now();CL.dirty.add('partygone')}}
  const rp=R.get('party'),rem=rp&&Array.isArray(rp.value)?rp.value:[],merged=partyMerge(PARTY,rc?rem.concat(rc.live):rem,G);
  if(partySig(merged)!==partySig(PARTY)){PARTY=merged;partyHashInit();clRaw('party',PARTY);changed.push('party')}
  if(!rp||partySig(clOwnParty())!==partySig(rem)){M.ts.party=Date.now();CL.dirty.add('party')}
  const rj=await rtPull('journal_entries');
  if(rj){let J=store.get('journal',[]);if(!Array.isArray(J))J=[];if(J.some(e=>e&&!e.id)){store.set('journal',J);J=store.get('journal',[])}
    const JG=Object.assign({},store.get('journalgone',{}));Object.entries(rj.gone).forEach(([id,t])=>{if(!(JG[id]>=t))JG[id]=t});if(JSON.stringify(JG)!==JSON.stringify(store.get('journalgone',{})))clRaw('journalgone',JG);
    const JM=journalMerge(J,rj.live,JG);if(jSig(JM)!==jSig(J)){clRaw('journal',JM);JH=null;if(!changed.includes('journal'))changed.push('journal')}}
  clMetaSave();CL.last=Date.now();setTimeout(rtSyncAll,0);return changed}
async function cloudPush(){if(!CL.user||CL.pushing||!CL.dirty.size)return;CL.pushing=true;const M=clMeta(),keys=[...CL.dirty];CL.dirty.clear();
  try{const rows=keys.map(k=>({user_id:CL.user.id,key:k,value:k==='party'?clOwnParty():store.get(k,null),ts:+M.ts[k]||(M.ts[k]=Date.now())}));clMetaSave();
    for(let i=0;i<rows.length;i+=50){const {error}=await CL.sb.from('user_data').upsert(rows.slice(i,i+50));if(error)throw error}
    CL.err='';CL.last=Date.now();if(keys.some(k=>k==='party'||k==='partygone'||k==='journal'||k==='journalgone'))rtSyncAll()}
  catch(e){keys.forEach(k=>CL.dirty.add(k));CL.err=clMsg(e)}
  finally{CL.pushing=false;clStatus()}
  if(CL.dirty.size&&!CL.err)clSchedule()}
// ── characters and journal entries, one row each (user_characters, journal_entries) ──
// The account still keeps the whole list in user_data; each character and journal entry is also its own row, so two
// devices that change different entries never overwrite each other, and a deleted one is kept as a "deleted" row so it
// stays deleted everywhere. If the tables aren't set up yet (schema.sql not run again), this is skipped quietly.
const RT={off:{},sent:{}};
const dbMissing=(e,t)=>!!e&&(e.code==='42P01'||e.code==='PGRST205'||new RegExp(t).test(e.message||'')&&/(exist|find|schema cache)/i.test(e.message||''));
const rtHash=o=>JSON.stringify(o,(k,v)=>k==='_by'||k==='_cs'?undefined:v);
async function rtPush(table,list,gone){if(RT.off[table]||!CL.user||!CL.sb)return;const S=RT.sent[table]||(RT.sent[table]={}),rows=[],marks=[];
  (list||[]).forEach(x=>{if(!x||!CL_ID.test(String(x.id)))return;const h=rtHash(x);if(S[x.id]===h||h.length>390000)return;rows.push({owner:CL.user.id,id:String(x.id),data:x,deleted:false,updated_at:new Date(+x._m||Date.now()).toISOString()});marks.push([x.id,h])});
  Object.entries(gone||{}).forEach(([id,t])=>{if(!CL_ID.test(id)||S[id]==='gone'||(list||[]).some(x=>x&&x.id===id))return;rows.push({owner:CL.user.id,id,data:{},deleted:true,updated_at:new Date(+t||Date.now()).toISOString()});marks.push([id,'gone'])});
  for(let i=0;i<rows.length;i+=25){const {error}=await CL.sb.from(table).upsert(rows.slice(i,i+25),{onConflict:'owner,id'});
    if(error){if(dbMissing(error,table))RT.off[table]=true;return}marks.slice(i,i+25).forEach(([id,h])=>{S[id]=h})}}
async function rtPull(table){if(RT.off[table]||!CL.user||!CL.sb)return null;const {data,error}=await CL.sb.from(table).select('id,data,deleted,updated_at');
  if(error){if(dbMissing(error,table))RT.off[table]=true;return null}
  const S=RT.sent[table]||(RT.sent[table]={}),live=[],gone={};
  (data||[]).forEach(r=>{if(!r||!CL_ID.test(String(r.id)))return;const t=Date.parse(r.updated_at)||0;if(r.deleted){gone[r.id]=t;S[r.id]='gone'}else if(r.data&&typeof r.data==='object'&&!Array.isArray(r.data)){const x=Object.assign({},r.data,{id:r.id});if(x._m==null)x._m=t;live.push(x);S[r.id]=rtHash(x)}});
  return {live,gone}}
const rtSyncAll=()=>Promise.all([rtPush('user_characters',clOwnParty(),store.get('partygone',{})),rtPush('journal_entries',(store.get('journal',[])||[]).filter(e=>e&&e.id),store.get('journalgone',{}))]).catch(()=>{});
// journal entries: an id each (old entries get one made from their text, so every device names them alike) and a change stamp
var JH=null;
const jHash=e=>JSON.stringify(e,(k,v)=>k==='_m'?undefined:v);
function jLegacyId(e,used){const t=JSON.stringify([e.t||'',e.d||'',e.body||'']);let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0}let id='j'+h.toString(36),k=1;while(used.has(id))id='j'+h.toString(36)+'-'+(k++);return id}
function journalStamp(J){if(!Array.isArray(J))return;if(!JH){JH={};let old=[];try{old=JSON.parse(localStorage.getItem('fand.journal')||'[]')}catch(e){}(Array.isArray(old)?old:[]).forEach(e=>{if(e&&e.id)JH[e.id]=jHash(e)})}
  const now=Date.now(),seen=new Set(),used=new Set(J.map(e=>e&&e.id).filter(Boolean));let gone=null;const G0=()=>gone||(gone=Object.assign({},store.get('journalgone',{})));
  const G1=store.get('journalgone',{})||{};
  J.forEach(e=>{if(!e||typeof e!=='object')return;if(!e.id||!/^[A-Za-z0-9_-]{1,40}$/.test(String(e.id))||seen.has(e.id)){e.id=jLegacyId(e,used);used.add(e.id)}seen.add(e.id);const h=jHash(e);
    if(JH[e.id]!==h){if(JH[e.id]!==undefined||e._m==null)e._m=now;JH[e.id]=h}if(G1[e.id]){const g=G0();delete g[e.id];e._m=now}});
  Object.keys(JH).forEach(id=>{if(seen.has(id))return;delete JH[id];G0()[id]=now});
  if(gone){Object.keys(gone).forEach(id=>{if(now-gone[id]>180*864e5)delete gone[id]});store.set('journalgone',gone)}}
function journalMerge(L,R,G){const by=new Map(),order=[];const put=e=>{if(!e||typeof e!=='object'||!e.id)return;const o=by.get(e.id);if(!o)order.push(e.id);if(!o||(+e._m||0)>(+o._m||0))by.set(e.id,e)};
  L.forEach(put);R.slice().sort((a,b)=>String(a.d||'').localeCompare(String(b.d||''))||(+a._m||0)-(+b._m||0)).forEach(put);return order.map(id=>by.get(id)).filter(e=>!(G[e.id]>=(+e._m||0)))}
const jSig=J=>JSON.stringify(J.map(e=>[e.id,+e._m||0,jHash(e)]));
// data that changed on another device: the party is redrawn in place; anything else needs the page loaded again
function clApply(changed){if(changed.includes('party'))clRerender();if(!changed.some(k=>k!=='party'))return;
  let at=0;try{at=+sessionStorage.getItem('fand.__reload')||0}catch(e){}
  if(!CL.touched&&Date.now()-at>15000){try{sessionStorage.setItem('fand.__reload',String(Date.now()))}catch(e){}location.reload();return}
  $('cloudupd').hidden=false}

// ── campaigns ──
// Characters from other players arrive live, and some of the party and sheet code shows their fields as they are, so
// nothing that could open HTML gets in: ids must be plain, and <, >, " and ` in text become look-alikes. Apostrophes stay
// (hundreds of Blueprint names have one, and gear is looked up by name).
const CL_ID=/^[A-Za-z0-9_-]{1,40}$/;
const CL_SAFE={'<':'‹','>':'›','"':'”','`':'ʼ'};
function clClean(v,d){if(typeof v==='string')return v.replace(/[<>"`]/g,ch=>CL_SAFE[ch]);if(!v||typeof v!=='object'||(d|0)>8)return typeof v==='number'||typeof v==='boolean'||v==null?v:undefined;
  if(Array.isArray(v))return v.map(x=>clClean(x,(d|0)+1));const o={};Object.keys(v).forEach(k=>{if(k==='__proto__')return;o[clClean(k)]=clClean(v[k],(d|0)+1)});return o}
function clIdOk(c){if(!CL_ID.test(String(c.id))){c.id=uid();PARTY_SEL=c.id}return c}
const campName=(camp,u)=>{const m=(CL.members[camp]||[]).find(x=>x.user_id===u);return m&&m.name||'A player'};
async function campRefresh(){if(!CL.user)return;
  const [a,b]=await Promise.all([CL.sb.from('campaigns').select('id,name,dm,invite,created_at').order('created_at'),CL.sb.from('campaign_members').select('campaign_id,user_id,name,role,joined_at').order('joined_at')]);
  if(a.error)throw a.error;if(b.error)throw b.error;
  CL.camps=a.data||[];CL.members={};(b.data||[]).forEach(m=>(CL.members[m.campaign_id]||(CL.members[m.campaign_id]=[])).push(m));
  await clAvLoad([CL.user.id].concat((b.data||[]).map(m=>m.user_id)));
  await campPull();campSubscribe();clStatus();clRerender();hoLoad().catch(()=>{})}
// ── profile pictures: a small square image per account, seen by yourself and the people in your campaigns ──
const CL_AV=/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
const clAvOk=a=>typeof a==='string'&&a.length<200000&&CL_AV.test(a);
function clAv(u){if(!u)return '';const a=CL.avatars[u];if(clAvOk(a))return a;if(CL.user&&u===CL.user.id){let c='';try{c=localStorage.getItem('fand.__avatar')||''}catch(e){}return clAvOk(c)?c:''}return ''}
function clAvHTML(u,name,size){const a=clAv(u),n=String(name||'?').trim();
  return a?`<img class="av" src="${a}" alt="" style="width:${size}px;height:${size}px">`:`<span class="av av-i" style="width:${size}px;height:${size}px;font-size:${Math.round(size*.45)}px">${esc(n.charAt(0).toUpperCase()||'?')}</span>`}
async function clAvLoad(ids){ids=[...new Set(ids.filter(Boolean))];if(!ids.length||!CL.sb)return;
  const {data,error}=await CL.sb.from('profiles').select('user_id,avatar').in('user_id',ids);if(error)return; // no profiles table yet: initials only
  ids.forEach(id=>{delete CL.avatars[id]});(data||[]).forEach(r=>{if(clAvOk(r.avatar))CL.avatars[r.user_id]=r.avatar});
  if(CL.user)try{localStorage.setItem('fand.__avatar',CL.avatars[CL.user.id]||'')}catch(e){}}
// a picture from the device: cropped to the middle square and shrunk to 192 px before it leaves the browser
const clCanvasURL=c=>{const d=c.toDataURL('image/webp',0.85);return /^data:image\/webp/.test(d)?d:c.toDataURL('image/jpeg',0.85)};
function clCrop(f){return new Promise((res,rej)=>{if(!f||!/^image\//.test(f.type)){rej(new Error('Choose a picture file.'));return}
  const url=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);const S=192,c=document.createElement('canvas');c.width=c.height=S;const w=img.naturalWidth,h=img.naturalHeight,m=Math.min(w,h),x=c.getContext('2d');
    x.fillStyle='#2a2633';x.fillRect(0,0,S,S);x.imageSmoothingQuality='high';x.drawImage(img,(w-m)/2,(h-m)/2,m,m,0,0,S,S);res(clCanvasURL(c))};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('That picture could not be opened.'))};img.src=url})}
async function clSetAvatar(d,quiet){if(!CL.user)return false;if(d&&!clAvOk(d)){toast('That picture can\'t be used. Try another one.');return false}
  const {error}=await CL.sb.rpc('fand_set_avatar',{p_avatar:d||null});
  if(error){toast(/schema cache|could not find|does not exist/i.test(error.message||'')?'Pictures need the updated database setup: run tools/cloud/schema.sql in Supabase again.':clMsg(error));return false}
  if(d)CL.avatars[CL.user.id]=d;else delete CL.avatars[CL.user.id];try{localStorage.setItem('fand.__avatar',d||'')}catch(e){}
  if(!quiet)toast(d?'Picture saved':'Picture removed');clHeader();clRerender();return true}
// ready-made pictures: an emblem on a realm's colour, drawn here and saved like an uploaded picture
const CL_EMBLEMS=['✦','☽','☀','✠','❖','♛','✧','☠','⚜','♆','✪','❂','☘','❄','⚔','✺'];
function clEmblems(){if(clEmblems.list)return clEmblems.list;const cols=(typeof REALMS!=='undefined'?REALMS.map(r=>r.color):[]).concat(['#7b5cd6','#c9a54a','#3aa58a','#c2563f','#4a7fd1']);
  clEmblems.list=CL_EMBLEMS.map((sym,i)=>{const S=192,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),col=cols[i%cols.length]||'#888';
    const g=x.createRadialGradient(S*.35,S*.3,S*.1,S/2,S/2,S*.75);g.addColorStop(0,col);g.addColorStop(1,'#141019');x.fillStyle=g;x.fillRect(0,0,S,S);
    x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=6;x.beginPath();x.arc(S/2,S/2,S/2-14,0,Math.PI*2);x.stroke();
    x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=10;x.font='bold 92px Georgia, "Times New Roman", serif';x.textAlign='center';x.textBaseline='middle';x.fillText(sym,S/2,S/2+6);
    return clCanvasURL(c)});return clEmblems.list}

// ── the account menu in the top bar ──
function clAcctClick(btn){if(!CL.user){openAccount();return}const p=$('acctpop');if(p.classList.contains('open')){clAcctClose();return}
  p.innerHTML=clAcctMenuHTML();const r=btn.getBoundingClientRect();p.style.top=(r.bottom+6)+'px';p.style.setProperty('--navtop',(r.bottom+6)+'px');p.style.left=Math.max(8,Math.min(r.right-300,innerWidth-308))+'px';
  p.classList.add('open');btn.setAttribute('aria-expanded','true');const f=p.querySelector('.ap-i');if(f)f.focus()}
function clAcctClose(){const p=$('acctpop');if(!p)return;p.classList.remove('open');const b=$('acctBtn');if(b)b.setAttribute('aria-expanded','false')}
const AP_ICON={profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',camps:'<circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5"/>',sync:'<path d="M20 11a8 8 0 0 0-14-5l-2 2M4 13a8 8 0 0 0 14 5l2-2M4 4v4h4M20 20v-4h-4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',out:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'};
function clAcctMenuHTML(){const u=CL.user,n=clMyName(),it=(k,l,sub)=>`<button class="ap-i" role="menuitem" data-ap="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${AP_ICON[k]}</svg>${l}${sub?`<small>${sub}</small>`:''}</button>`;
  return `<div class="ap-h">${clAvHTML(u.id,n||u.email,48)}<div style="min-width:0"><b>${esc(n||'No name yet')}</b><small>${esc(u.email||'')}</small><small style="${CL.err?'color:var(--red)':''}">${clStatusText()}</small></div></div>
    ${it('profile','Edit profile','picture and name')}${it('camps','Campaigns',CL.camps.length?String(CL.camps.length):'')}${it('sync','Sync now')}${it('settings','Settings')}<div class="ap-sep"></div>${it('out','Sign out')}`}
document.addEventListener('click',e=>{const b=e.target.closest('#acctpop [data-ap]');if(!b)return;const k=b.dataset.ap;clAcctClose();
  if(k==='profile')openAccount();else if(k==='camps')go('party');else if(k==='sync')clSyncNow();else if(k==='settings')go('settings');else if(k==='out')cloudSignOut()});
document.addEventListener('mousedown',e=>{if(!e.target.closest('#acctpop')&&!e.target.closest('#acctBtn'))clAcctClose()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('acctpop')&&$('acctpop').classList.contains('open')){clAcctClose();$('acctBtn').focus()}});
window.addEventListener('resize',clAcctClose);

// ── Edit profile: a picture (upload, a ready-made emblem, or none) and a name ──
let PROF=null;
function openProfile(){openAccount()}
function renderProfile(){const u=CL.user,em=clEmblems(),cur=PROF.pick,n=$('pf-name')?$('pf-name').value:clMyName();
  const prev=cur?`<img class="av" src="${cur}" alt="" style="width:96px;height:96px">`:`<span class="av av-i" style="width:96px;height:96px;font-size:42px">${esc((n||u.email||'?').trim().charAt(0).toUpperCase()||'?')}</span>`;
  const tile=(src,on,label,i)=>`<button type="button" class="pf-tile${on?' on':''}" data-pf="${i}" aria-label="${esc(label)}" aria-pressed="${on}">${src?`<img src="${src}" alt="">`:`<span>${label}</span>`}</button>`;
  const tiles=[`<label class="pf-tile up" title="Upload a picture from this device" aria-label="Upload a picture"><span>＋<br>Upload</span><input type="file" accept="image/*" hidden id="pf-file"></label>`]
    .concat(PROF.up?[tile(PROF.up,cur===PROF.up,'Your uploaded picture','up')]:[])
    .concat(clAv(u.id)&&clAv(u.id)!==PROF.up&&!em.includes(clAv(u.id))?[tile(clAv(u.id),cur===clAv(u.id),'Your current picture','cur')]:[])
    .concat(em.map((src,i)=>tile(src,cur===src,'Emblem '+CL_EMBLEMS[i],i)))
    .concat([tile('',!cur,'No picture','none')]);
  const host=$('pf-host');if(!host)return;
  host.innerHTML=`<div>
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${prev}<div style="flex:1;min-width:200px"><label class="note" style="display:block;margin:0 0 4px" for="pf-name">Your name at the table</label><input class="sel" id="pf-name" maxlength="60" placeholder="What the others in your campaigns see" value="${esc(n||'')}" style="max-width:none;width:100%"><div class="note" style="margin:6px 0 0">${esc(u.email||'')}</div></div></div>
      <div class="blk" style="margin-top:16px"><h4>Picture <em>seen by you and the people in your campaigns</em></h4><div class="pf-grid">${tiles.join('')}</div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btn" type="button" onclick="PROF=null;renderAccount()">Undo changes</button><button class="btn primary" type="button" id="pf-save">Save profile</button></div>
    </div>`;
  host.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{const k=b.dataset.pf;PROF.pick=k==='none'?null:k==='up'?PROF.up:k==='cur'?clAv(u.id):em[+k];renderProfile()});
  $('pf-file').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{PROF.up=await clCrop(f);PROF.pick=PROF.up;renderProfile()}catch(err){toast(err.message)}};
  $('pf-name').onkeydown=e=>{if(e.key==='Enter')$('pf-save').click()};
  $('pf-save').onclick=async()=>{const b=$('pf-save');b.disabled=true;b.textContent='Saving…';
    try{const nm=$('pf-name').value.trim().slice(0,60);let ok=true;
      if(nm&&nm!==clMyName()){await clSetName(nm);await campRefresh().catch(()=>{})}
      if((PROF.pick||null)!==(clAv(u.id)||null))ok=await clSetAvatar(PROF.pick,true);
      if(ok){PROF=null;toast('Profile saved');renderAccount()}}
    catch(err){toast(clMsg(err))}
    finally{if($('pf-save')){b.disabled=false;b.textContent='Save profile'}}}}
function clRefreshSoon(){clearTimeout(CL.rtimer);CL.rtimer=setTimeout(()=>{campRefresh().catch(e=>{CL.err=clMsg(e);clStatus()})},700)}
// a character as the campaign has it; returns true when the copy here changed
function campApply(r){if(!CL_ID.test(String(r.id)))return false;const d=Object.assign(clClean(r.data||{}),{id:r.id,camp:r.campaign_id,_cs:1});
  if(r.owner!==CL.user.id)d._by={u:r.owner,n:campName(r.campaign_id,r.owner)};else delete d._by;
  const i=PARTY.findIndex(c=>c.id===r.id),keep=()=>{if(PH){PH[d.id]=charHash(d);PHC[d.id]=d.camp}};
  if(i<0){PARTY.push(d);keep();return true}
  const L=PARTY[i],lm=+L._m||0,rm=+d._m||0;
  if(rm>lm||(!clCanEdit(L)&&charHash(L)!==charHash(d))){PARTY[i]=d;keep();return true}
  L._cs=1;if(lm>rm&&clCanEdit(L))CL.cdirty.add(L.id);
  if(d._by&&(!L._by||L._by.n!==d._by.n)){L._by=d._by;return true}
  return false}
async function campPull(){const ids=CL.camps.map(k=>k.id);let rows=[];
  if(ids.length){const {data,error}=await CL.sb.from('campaign_characters').select('campaign_id,id,owner,data').in('campaign_id',ids);if(error)throw error;rows=data||[]}
  let ch=false;const have=new Set(rows.map(r=>r.campaign_id+'|'+r.id));
  rows.forEach(r=>{if(campApply(r))ch=true});rows=rows.filter(r=>CL_ID.test(String(r.id)));
  const keep=[];PARTY.forEach(c=>{if(!c.camp||have.has(c.camp+'|'+c.id)){keep.push(c);return}
    if(c._by){ch=true;return}                                          // someone else's, no longer shared
    if(!ids.includes(c.camp)||c._cs){delete c.camp;delete c._cs;ch=true} // you left the campaign, or the DM took it out
    else CL.cdirty.add(c.id);                                          // shared here but not sent yet
    keep.push(c)});
  if(ch){PARTY=keep;clPartyChanged()}
  if(CL.cdirty.size||CL.cgone.length)clCampSchedule()}
function clCampSchedule(){clearTimeout(CL.ctimer);CL.ctimer=setTimeout(()=>{campPush().catch(()=>{})},900)}
async function campPush(){if(!CL.user||CL.cpushing)return;CL.cpushing=true;let retry=false;
  try{for(const id of [...CL.cdirty]){CL.cdirty.delete(id);const c=PARTY.find(x=>x.id===id);if(!c||!c.camp||!clCanEdit(c))continue;
      const {error}=await CL.sb.rpc('fand_save_character',{p_campaign:c.camp,p_id:c.id,p_data:clStrip(c)});
      if(error){if(error.code&&!/fetch|network/i.test(error.message||''))toast(clMsg(error));else{CL.cdirty.add(id);CL.err=clMsg(error);retry=true;break}}else c._cs=1}
    while(CL.cgone.length){const [camp,id]=CL.cgone[0];if(!PARTY.some(x=>x.id===id&&x.camp===camp)){const {error}=await CL.sb.from('campaign_characters').delete().match({campaign_id:camp,id});if(error){CL.err=clMsg(error);retry=true;break}}CL.cgone.shift()}}
  finally{CL.cpushing=false;clStatus()}
  if(!retry&&(CL.cdirty.size||CL.cgone.length))clCampSchedule()}
// live: characters and members as they change
function campSubscribe(){if(CL.chan){CL.sb.removeChannel(CL.chan);CL.chan=null}if(!CL.camps.length)return;
  const ch=CL.sb.channel('fand-campaigns');
  CL.camps.forEach(k=>{ch.on('postgres_changes',{event:'*',schema:'public',table:'campaign_characters',filter:'campaign_id=eq.'+k.id},campEvent)
    .on('postgres_changes',{event:'*',schema:'public',table:'campaign_members',filter:'campaign_id=eq.'+k.id},clRefreshSoon)});
  CL.chan=ch.subscribe()}
function campEvent(p){if(!CL.user)return;
  if(p.eventType==='DELETE'){const o=p.old||{},i=PARTY.findIndex(c=>c.id===o.id&&c.camp===o.campaign_id);if(i<0)return;const c=PARTY[i];
    if(c._by)PARTY.splice(i,1);else{delete c.camp;delete c._cs;toast((c.name||'Your character')+' is no longer shared with the campaign')}clPartyChanged();return}
  const r=p.new;if(!r||!CL.camps.some(k=>k.id===r.campaign_id))return;const was=PARTY.find(c=>c.id===r.id);
  if(!campApply(r))return;clPartyChanged();
  const nm=(r.data&&r.data.name)||'A character';
  if(!was)toast(nm+' joined the party');else if(r.owner===CL.user.id)toast(nm+' was updated')}

// ── signing in and out ──
function clHasSession(){try{for(let i=0;i<localStorage.length;i++){if(/^sb-.+-auth-token$/.test(localStorage.key(i)||''))return true}}catch(e){}return false}
function clLoad(){return window.supabase&&window.supabase.createClient?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/supabase.js';s.onload=()=>window.supabase?res():rej(new Error('lib'));s.onerror=()=>rej(new Error('The account library could not be loaded. Check your connection.'));document.head.appendChild(s)})}
const clRedirect=()=>/^https?:$/.test(location.protocol)?location.origin+location.pathname:undefined;
function cloudStart(){if(!CL.on)return Promise.reject(new Error('Accounts are not set up on this site.'));if(CL.ready)return CL.ready;
  CL.ready=(async()=>{await clLoad();
    CL.sb=window.supabase.createClient(CLOUD.url,CLOUD.key,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const q=new URLSearchParams(location.search),had=q.has('code'),bad=q.get('error_description');
    const {data}=await CL.sb.auth.getSession();
    if(had||bad){['code','error','error_code','error_description'].forEach(k=>q.delete(k));history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash)}
    if(bad)toast(bad);else if(had&&!(data&&data.session))toast('That sign-in link was opened in another browser. Type the code from the email instead.');
    CL.sb.auth.onAuthStateChange((ev,s)=>{setTimeout(()=>clAuth(ev,s),0)});
    if(data&&data.session)await clSignedIn(data.session.user);
    return CL.sb})();
  CL.ready.catch(e=>{CL.err=clMsg(e);CL.ready=null;clStatus()});
  return CL.ready}
function clAuth(ev,s){if(s&&s.user){if(!CL.user||CL.user.id!==s.user.id)clSignedIn(s.user);else CL.user=s.user}else if(ev==='SIGNED_OUT'&&CL.user)clSignedOut()}
function clSignedIn(user){if(CL.signing)return CL.signing;
  CL.signing=(async()=>{const M=clMeta();
    if(M.uid!==user.id){ // the first time this account is used on this device: keep a backup of what was here
      const keys=clKeys();
      if(keys.length){const bk={at:Date.now(),data:{}};keys.forEach(k=>{try{bk.data[k]=localStorage.getItem('fand.'+k)}catch(e){}});try{localStorage.setItem('fand.__backup',JSON.stringify(bk))}catch(e){}}
      if(M.uid&&keys.length&&confirm('This device has saved data from another account. Replace it with this account\'s data?\n\nOK replaces it (a backup is kept on this device). Cancel adds it to this account.')){
        keys.forEach(k=>{try{localStorage.removeItem('fand.'+k)}catch(e){}});PARTY=[];clRaw('party',[])}
      M.ts={};M.uid=user.id;clMetaSave();partyHashInit()}
    CL.user=user;CL.err='';CL.step='';clPendingSet(null);let changed=[];
    try{changed=await cloudPull();await campRefresh();await cloudPush()}catch(e){CL.err=clMsg(e)}
    clStatus();clApply(changed);
    let j=null;try{j=sessionStorage.getItem('fand.__join');sessionStorage.removeItem('fand.__join')}catch(e){}
    if(j)setTimeout(()=>campJoin(j),100);
    clRerender()})().finally(()=>{CL.signing=null});
  return CL.signing}
function clSignedOut(){if(CL.chan&&CL.sb){CL.sb.removeChannel(CL.chan);CL.chan=null}CL.user=null;CL.camps=[];CL.members={};CL.avatars={};try{localStorage.removeItem('fand.__avatar')}catch(e){}CL.dirty.clear();CL.cdirty.clear();CL.cgone=[];CL.hc=false;
  if(PARTY.some(c=>c._by)){PARTY=PARTY.filter(c=>!c._by);partyHashInit();clRaw('party',PARTY)}
  clStatus();clRerender()}
async function cloudSignOut(){const wipe=confirm('Sign out.\n\nAlso remove your saved data from this device? OK removes it (it stays in your account). Cancel keeps a copy here.');
  try{clearTimeout(CL.timer);await cloudPush();await campPush()}catch(e){}
  try{await CL.sb.auth.signOut()}catch(e){}
  clSignedOut();
  if(wipe){clKeys().forEach(k=>{try{localStorage.removeItem('fand.'+k)}catch(e){}});try{localStorage.removeItem('fand.__cloud');localStorage.removeItem('fand.__backup')}catch(e){}location.reload();return}
  toast('Signed out')}
async function clSyncNow(quiet){if(!CL.user)return;try{const ch=await cloudPull();await campRefresh();await cloudPush();await campPush();if(!quiet)toast(CL.err?CL.err:'Synced');clApply(ch)}catch(e){CL.err=clMsg(e);if(!quiet)toast(CL.err)}clStatus()}
const clBackup=()=>{try{return JSON.parse(localStorage.getItem('fand.__backup')||'null')}catch(e){return null}};
function clRestore(){const b=clBackup();if(!b||!b.data)return;
  if(!confirm('Put back the data this device had before you signed in ('+new Date(b.at).toLocaleString()+')? It replaces the same data in your account.'))return;
  const M=clMeta(),now=Date.now();
  Object.entries(b.data).forEach(([k,raw])=>{if(raw==null)return;let v=raw;if(k==='party'){try{v=JSON.stringify((JSON.parse(raw)||[]).map(c=>Object.assign(c,{_m:now})))}catch(e){}}try{localStorage.setItem('fand.'+k,v)}catch(e){}M.ts[k]=now;CL.dirty.add(k)});
  try{localStorage.removeItem('fand.__backup')}catch(e){}
  try{localStorage.removeItem('fand.partygone')}catch(e){}
  clMetaSave();cloudPush().finally(()=>location.reload())}
function clStatusText(){if(!CL.user)return '';if(CL.err)return 'Not synced: '+esc(CL.err);if(navigator.onLine===false)return 'Offline. Changes are kept here and sent when you are back online.';
  if(CL.pushing||CL.dirty.size)return 'Saving…';if(!CL.last)return 'Connecting…';const s=Math.round((Date.now()-CL.last)/1000);
  return 'Synced '+(s<60?'just now':s<3600?Math.round(s/60)+' min ago':new Date(CL.last).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'.'}
function clStatus(){if($('clStat'))$('clStat').innerHTML=clStatusText();clHeader();clDot()}
// the sync light on the account button: green synced, amber (pulsing) saving, grey offline, red not synced
function syncState(){if(!CL||!CL.user)return '';if(CL.err)return 'err';if(navigator.onLine===false)return 'offline';if(CL.pushing||CL.dirty.size)return 'saving';return 'ok'}
function clDot(){const b=$('acctBtn');if(!b)return;const st=syncState();if(!st){delete b.dataset.sync;return}b.dataset.sync=st;b.setAttribute('aria-description',clStatusText().replace(/<[^>]+>/g,''));b.title=(b.title||'').split(' · ')[0]+' · '+clStatusText().replace(/<[^>]+>/g,'')}
addEventListener('offline',()=>clDot());
// the account button in the top bar: Sign in, or your initial once signed in (a red dot when not synced)
function clHeader(){const b=$('acctBtn');if(!b)return;if(!CL||!CL.on){b.hidden=true;return}b.hidden=false;
  if(CL.user||(clHasSession()&&!CL.err&&CL.ready)){const who=CL.user?(clMyName()||CL.user.email||'?'):'…',t=CL.user?'Signed in as '+(CL.user.email||who)+(CL.err?' (not synced: '+CL.err+')':''):'Signing in…';
    b.className='icon-btn acct-btn on'+(CL.err&&CL.user?' err':'');const pic=clAv(CL.user?CL.user.id:null)||(()=>{let c='';try{c=localStorage.getItem('fand.__avatar')||''}catch(e){}return clAvOk(c)?c:''})();b.innerHTML=`<span class="acct-av">${pic?`<img src="${pic}" alt="">`:esc(who.trim().charAt(0).toUpperCase()||'?')}</span>`;b.title=t;b.setAttribute('aria-label',t);return}
  b.className='icon-btn acct-btn';b.title='Sign in to keep your characters and data on every device';b.setAttribute('aria-label','Sign in');
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg><span class="acct-l">Sign in</span>'}
const clMyName=()=>(CL.user&&CL.user.user_metadata&&CL.user.user_metadata.name)||'';
async function clSetName(n){n=(n||'').trim().slice(0,60);if(!n)return;const {data,error}=await CL.sb.auth.updateUser({data:{name:n}});if(error)throw error;if(data&&data.user)CL.user=data.user;await CL.sb.rpc('fand_set_name',{p_me:n})}
async function clAskName(){let n=clMyName();if(n)return n;n=(prompt('Your name at the table (the others in the campaign see it):','')||'').trim().slice(0,60);if(!n)return null;try{await clSetName(n)}catch(e){}return n}

// ── the Account page (account.html): sign in, or your profile, sync, and campaigns ──
function renderAccount(){const C=$('content');
  if(!CL.on){C.innerHTML=`<div class="page acct-wrap"><div class="acct-card" style="max-width:560px;margin:40px auto;text-align:center"><h2 style="font-family:var(--serif);margin:0 0 8px">Accounts</h2><p class="note">Accounts aren't switched on for this copy of FAND. With them, your characters and saved data follow you to every device, and a DM can share the party with the players. The site owner sets this up once (README: Accounts and campaigns).</p></div></div>`;return}
  if(!CL.user&&clHasSession()&&!CL.err&&!CL.tried){C.innerHTML=`<div class="page acct-wrap"><div class="acct-card" style="max-width:420px;margin:60px auto;text-align:center"><div class="note">Signing you in…</div></div></div>`;cloudStart().catch(()=>{}).finally(()=>{const w=CL.signing||Promise.resolve();w.finally(()=>{CL.tried=true;if(TAB==='account')renderAccount()})});return}
  if(!CL.user){C.innerHTML=`<div class="page acct-wrap"><div class="acct-hero">
      <div><div class="kind" style="color:var(--gold2)">Your FAND account</div><h2 class="acct-title">Sign in to keep your table together</h2>
        <ul class="acct-ben"><li><span>🧙</span><div><b>Your characters on every device.</b> Sheets, journal, crafting plans, designs, dice, and pins follow you wherever you sign in.</div></li>
          <li><span>🛡️</span><div><b>Play in your DM's campaign.</b> Join with an invite code and share your characters; everyone sees changes as they happen.</div></li>
          <li><span>🎨</span><div><b>A profile.</b> Your name at the table and a picture: upload one or pick an emblem.</div></li>
          <li><span>✉️</span><div><b>No password.</b> Each sign-in sends a link and a code to your email.</div></li></ul></div>
      <div class="acct-card"><h3 style="margin:0 0 4px;font-family:var(--serif)">${CL.step==='code'?'Check your email':'Sign in or create an account'}</h3><p class="note" style="margin:0 0 14px">${CL.step==='code'?'':'Enter your email. New here? The same step creates your account.'}</p>${cloudSignInForm()}</div>
    </div></div>`;cloudSettingsBind();return}
  const u=CL.user,hc=CL.hc;if(!PROF)PROF={pick:clAv(u.id)||null,up:null};
  C.innerHTML=`<div class="page acct-wrap">
    <div class="acct-head">${clAvHTML(u.id,clMyName()||u.email,72)}<div style="flex:1;min-width:200px"><h2 class="acct-title" style="margin:0">${esc(clMyName()||'Your account')}</h2><div class="note" style="margin:2px 0 0">${esc(u.email||'')}</div><div class="note" id="clStat" style="margin:2px 0 0">${clStatusText()}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" onclick="clSyncNow()">Sync now</button><button class="btn" type="button" onclick="go('settings')">Settings</button><button class="btn" type="button" onclick="cloudSignOut()">Sign out</button></div></div>
    <section class="panel set-sec"><h3>Profile</h3><p class="note" style="margin:2px 0 12px">Your name and picture, seen by you and the people in your campaigns.</p><div id="pf-host"></div></section>
    <section class="panel set-sec"><h3>Campaigns</h3><p class="note" style="margin:2px 0 12px">Start one as the DM or join with an invite code. Choose which characters to share on the Party page or the sheet.</p>${campPanelHTML()}<a class="btn" href="${pageUrl('party')}" data-go="party">Open the Party page</a></section>
    <section class="panel set-sec"><h3>Your saved data</h3><p class="note" style="margin:2px 0 10px">Your characters, journal, crafting plans, designs, dice, pins, and tool settings are kept in your account and follow you to every device where you sign in. Appearance, filters, the hidden-class locks, and the assistant's API key stay on each device.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" onclick="clSyncNow()">Sync now</button><button class="btn" type="button" onclick="setExport()">Download a backup</button>${clBackup()?'<button class="btn" type="button" onclick="clRestore()" title="What this device had saved before you first signed in here">Restore this device\'s old data</button>':''}</div></section>
    ${hc?`<section class="panel set-sec"><h3>Hidden classes</h3><p class="note" style="margin:2px 0 0">Your account opens the hidden class list on any device where you sign in. <a href="${pageUrl('hidden')}" data-go="hidden">Hidden classes →</a></p></section>`:''}
  </div>`;
  renderProfile()}
function cloudSignInForm(){return CL.step==='code'?`<div class="note" style="margin:0 0 10px">We emailed <b>${esc(CL.email)}</b>. ${clApp()?'Type the code from that email here. (The link in the email opens in Safari or your browser, not in this app.) You can switch to your email and back: this step is kept.':'Tap the link in that email on this device, or type its code here.'}</div><div class="keyrow"><input class="sel" id="clCode" inputmode="numeric" autocomplete="one-time-code" placeholder="Code from the email" style="max-width:none;flex:1"><button class="btn primary" type="button" id="clVerify">Sign in</button></div><div class="okline" id="clMsg" style="color:var(--red)">${esc(CL.err)}</div><a href="#" class="note" onclick="CL.step='';CL.err='';clPendingSet(null);renderAccount();return false">Use a different email</a>`
  :`<label class="note" for="clEmail" style="display:block;margin:0 0 4px">Email</label><div class="keyrow"><input class="sel" id="clEmail" type="email" autocomplete="email" spellcheck="false" placeholder="you@example.com" value="${esc(CL.email)}" style="max-width:none;flex:1"><button class="btn primary" type="button" id="clSend">Email me a code</button></div>${CLOUD.google&&!clIOSApp()?'<button class="btn" type="button" id="clGoogle" style="margin-top:10px;width:100%">Sign in with Google</button>':CLOUD.google?'<div class="note" style="margin-top:10px">Google sign-in opens in Safari and can\'t come back to a Home Screen app, so here sign in with the emailed code.</div>':''}<div class="okline" id="clMsg" style="color:var(--red)">${esc(CL.err)}</div>`}
function clSetMsg(m){CL.err=m;if($('clMsg'))$('clMsg').textContent=m}
function cloudSettingsBind(){if(!CL.on||CL.user)return;if($('clEmail'))setTimeout(()=>{if($('clEmail'))$('clEmail').focus()},30);
  if($('clCode'))setTimeout(()=>{const c=$('clCode');if(c)c.scrollIntoView({block:'center'})},30);
  if($('clSend')){const send=async()=>{const e=$('clEmail').value.trim(),b=$('clSend');if(!/^\S+@\S+\.\S+$/.test(e)){clSetMsg('Enter your email address.');return}b.disabled=true;b.textContent='Sending…';
      try{const sb=await cloudStart();const {error}=await sb.auth.signInWithOtp({email:e,options:{shouldCreateUser:true,emailRedirectTo:clRedirect()}});if(error)throw error;CL.email=e;CL.step='code';CL.err='';clPendingSet(e);renderAccount();setTimeout(()=>{if($('clCode'))$('clCode').focus()},40)}
      catch(err){b.disabled=false;b.textContent='Email me a code';clSetMsg(clMsg(err))}};
    $('clSend').onclick=send;$('clEmail').onkeydown=e=>{if(e.key==='Enter')send()}}
  if($('clVerify')){const verify=async()=>{const t=$('clCode').value.replace(/\s/g,''),b=$('clVerify');if(!t){clSetMsg('Type the code from the email.');return}b.disabled=true;b.textContent='Signing in…';
      try{const sb=await cloudStart();const {data,error}=await sb.auth.verifyOtp({email:CL.email,token:t,type:'email'});if(error)throw error;CL.step='';clPendingSet(null);if(data&&data.user)await clSignedIn(data.user);renderAccount();toast('Signed in')}
      catch(err){b.disabled=false;b.textContent='Sign in';clSetMsg(clMsg(err))}};
    $('clVerify').onclick=verify;$('clCode').onkeydown=e=>{if(e.key==='Enter')verify()}}
  if($('clGoogle'))$('clGoogle').onclick=async()=>{try{const sb=await cloudStart();const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:clRedirect()}});if(error)throw error}catch(err){clSetMsg(clMsg(err))}}}

// ── the Campaigns box on the Party page, and who a character belongs to ──
function campPanelHTML(){if(!CL.on)return '';
  if(!CL.user)return `<div class="panel" style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span><b>Play together.</b> <span class="note" style="margin:0">Sign in to keep this party in your account and share it with your DM and the other players: everyone sees each shared character as it changes.</span></span><button class="btn primary" style="margin-left:auto" onclick="openAccount()">Sign in</button></div>`;
  const me=CL.user.id,v=campView(),N=CL.camps.length,pl=(n,w)=>n+' '+w+(n===1?'':'s');
  const card=k=>{const dm=k.dm===me,ms=CL.members[k.id]||[],n=PARTY.filter(c=>c.camp===k.id).length,on=v===k.id,open=CAMP_MORE.has(k.id);
    return `<div class="camp-card${on?' on':''}"><div class="camp-top"><b class="camp-name">${esc(k.name)}</b><span class="b ${dm?'green':'ghost'}">${dm?'👑 DM':'Player'}</span></div>
      <div class="camp-meta"><span class="camp-avs" aria-hidden="true">${ms.slice(0,6).map(m=>clAvHTML(m.user_id,m.name,26)).join('')}</span><small>${pl(ms.length,'member')} · ${pl(n,'character')}</small></div>
      <div class="camp-btns">${on?`<button class="btn" type="button" onclick="campSetView('')" title="Show every character again">✓ Showing</button>`:`<button class="btn primary" type="button" onclick="campSetView('${k.id}')">Open</button>`}<button class="btn" type="button" onclick="campInvite('${k.id}')">Copy invite</button></div>
      ${campMoreHTML(k,dm,ms)}</div>`};
  return `<div class="panel camp-panel" style="margin-bottom:14px">
    <div class="camp-head"><b class="camp-title">Campaigns</b><span class="note" style="margin:0">${N?(N>1?`You are in ${N} campaigns. Open one to see only its characters; `:'')+'every member sees the characters shared with a campaign, live.':'Start one as the DM, or join with the invite code your DM gave you.'}</span>
      <span class="camp-acts"><button class="btn" onclick="campCreate()">+ New campaign (as DM)</button><button class="btn" onclick="campJoin()">Join with a code</button></span></div>
    ${N?`<div class="camp-grid">${CL.camps.map(card).join('')}</div>`:''}</div>`}
function campMoreHTML(k,dm,ms){const me=CL.user.id,open=CAMP_MORE.has(k.id);return `<details class="camp-more"${open?' open':''} ontoggle="campMoreT('${k.id}',this.open)"><summary>Manage${dm?'':' · leave'}</summary>
        <div class="camp-code"><small>Invite code</small><code>${esc(k.invite)}</code></div>
        <div class="chips">${ms.map(m=>`<span class="chip" style="cursor:default;display:inline-flex;align-items:center;gap:6px">${clAvHTML(m.user_id,m.name,22)}${m.role==='dm'?'👑 ':''}${esc(m.name||'Unnamed')}${m.user_id===me?' <small>(you)</small>':''}${dm&&m.user_id!==me?` <a href="#" title="Remove from the campaign" aria-label="Remove ${esc(m.name||'player')}" onclick="campKick('${k.id}','${m.user_id}');return false">✕</a>`:''}</span>`).join('')}</div>
        <div class="camp-btns"><button class="btn" onclick="wikiOpen('${k.id}')">📖 Wiki</button>${dm?`<button class="btn" onclick="campNewCode('${k.id}')" title="A new code; the old one stops working">New code</button><button class="btn" onclick="campRename('${k.id}')">Rename</button><button class="btn" onclick="campDelete('${k.id}')">Delete</button>`:`<button class="btn" onclick="campLeave('${k.id}')">Leave</button>`}</div></details>`}
// The Party page shows campaigns as tabs: All characters, one tab per campaign, and Not shared. The open tab holds that
// campaign's members, invite, and settings, and the characters below are only its own.
function campTabsHTML(){if(!CL.on)return '';if(!CL.user||!CL.camps.length)return campPanelHTML();
  const L=CL.camps,v=campView(),me=CL.user.id,cnt=f=>PARTY.filter(f).length,solo=cnt(c=>!c.camp||!L.some(k=>k.id===c.camp)),pl=(n,w)=>n+' '+w+(n===1?'':'s');
  const tab=(id,label,n)=>`<button type="button" role="tab" id="ctab-${id||'all'}" class="camp-tab${v===id?' on':''}" aria-selected="${v===id}" tabindex="${v===id?0:-1}" onclick="campSetView('${id}')">${label}<small>${n}</small></button>`;
  const k=L.find(x=>x.id===v);let pane;
  if(k){const dm=k.dm===me,ms=CL.members[k.id]||[];
    pane=`<div class="camp-pane-top"><span class="b ${dm?'green':'ghost'}">${dm?'👑 You are the DM':'Player'}</span><span class="camp-avs" aria-hidden="true">${ms.slice(0,8).map(m=>clAvHTML(m.user_id,m.name,26)).join('')}</span><small class="note" style="margin:0">${ms.map(m=>esc(m.name||'Unnamed')).join(', ')} · ${pl(cnt(c=>c.camp===k.id),'character')}</small>
      <span class="camp-acts"><button class="btn" type="button" onclick="campInvite('${k.id}')">Copy invite</button></span></div>${campMoreHTML(k,dm,ms)}`}
  else pane=`<p class="note" style="margin:0">${v==='solo'?'Characters shared with no campaign: only you see them. Share one from its sheet to bring it to a table.':`Every character, grouped by campaign. Open a campaign's tab to see only its characters: rests, standing, the DM controls, and Add the party in combat then use just that campaign.`}</p>`;
  return `<div class="panel camp-tabs" style="margin-bottom:14px"><div class="camp-tabbar"><div class="camp-tablist" role="tablist" aria-label="Campaigns" onkeydown="campTabKey(event)">${tab('','All characters',PARTY.length)}${L.map(x=>tab(x.id,(x.dm===me?'<span class="camp-crown" title="You are the DM">👑</span>':'')+esc(x.name),cnt(c=>c.camp===x.id))).join('')}${solo||v==='solo'?tab('solo','Not shared',solo):''}</div>
    <span class="camp-tabacts"><button class="btn" type="button" onclick="campCreate()" title="Start a campaign as its DM">+ New</button><button class="btn" type="button" onclick="campJoin()" title="Join with the invite code from your DM">Join</button></span></div>
    <div class="camp-pane" role="tabpanel" aria-labelledby="ctab-${v||'all'}">${pane}</div></div>`}
function campTabKey(e){const T=[...e.currentTarget.querySelectorAll('[role=tab]')],i=T.indexOf(document.activeElement);if(i<0)return;
  const j=e.key==='ArrowRight'?(i+1)%T.length:e.key==='ArrowLeft'?(i-1+T.length)%T.length:e.key==='Home'?0:e.key==='End'?T.length-1:-1;if(j<0)return;e.preventDefault();T[j].focus();T[j].click();
  setTimeout(()=>{const t=document.querySelector('.camp-tab.on');if(t)t.focus()},0)}
const CAMP_MORE=new Set();function campMoreT(id,o){if(o)CAMP_MORE.add(id);else CAMP_MORE.delete(id)}
function campCharHTML(c){if(!CL.on||!CL.user||!c||c.id==='blank')return '';const k=CL.camps.find(x=>x.id===c.camp);
  if(!clMine(c))return `<div class="cw-next sh-noprint" style="display:flex;gap:10px;align-items:center">${clAvHTML(c._by.u,c._by.n,32)}<span>${clIsDM(c.camp)?`<b>${esc(c._by.n||'A player')}'s character</b> in ${esc(k?k.name:'your campaign')}. You are the DM: your changes are saved to their sheet.`:`<b>Shared by ${esc(c._by.n||'another player')}</b> in ${esc(k?k.name:'your campaign')}. Only they and the DM can change it; changes made here are replaced by their copy.`}</span></div>`;
  if(!CL.camps.length)return '';
  return `<div class="sh-noprint" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><span class="note" style="margin:0">🌐 Share with</span><select class="sel" data-cid="${esc(c.id)}" onchange="campShare(this.dataset.cid,this.value)" style="max-width:260px"><option value="">Not shared (only you)</option>${CL.camps.map(x=>`<option value="${x.id}"${c.camp===x.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select>${k?`<small style="color:var(--muted)">Every member of ${esc(k.name)} sees this character, and the DM can change it.</small>`:''}</div>`}
function campShare(id,camp){const c=PARTY.find(x=>x.id===id);if(!c||!clMine(c))return;
  if(c.camp&&c.camp!==camp)CL.cgone.push([c.camp,id]);
  if(camp){clIdOk(c);c.camp=camp}else delete c.camp;delete c._cs;saveParty();
  const k=CL.camps.find(x=>x.id===camp);toast(k?(c.name||'Character')+' is shared with '+k.name:(c.name||'Character')+' is no longer shared');clRerender()}
async function clRpc(fn,args){const {data,error}=await CL.sb.rpc(fn,args);if(error)throw error;return data}
async function clDo(f,ok){try{await f();await campRefresh();if(ok)toast(ok)}catch(e){toast(clMsg(e))}clRerender()}
async function campCreate(){const name=(prompt('Name of the new campaign:','')||'').trim();if(!name)return;const me=await clAskName();if(me==null)return;
  let id=null;await clDo(async()=>{const r=await clRpc('fand_create_campaign',{p_name:name,p_me:me});id=r&&(r.id||r)},'Campaign started. Copy the invite and send it to your players.');if(typeof id==='string'&&CL.camps.some(k=>k.id===id))campSetView(id)}
async function campJoin(code){if(!CL.user){try{sessionStorage.setItem('fand.__join',code||'')}catch(e){}openAccount();return}
  code=code||prompt('Invite code from your DM:','');if(!code)return;const me=await clAskName();if(me==null)return;
  let k=null;await clDo(async()=>{k=await clRpc('fand_join_campaign',{p_code:code,p_me:me})},null);if(!k)return;toast('You joined '+k.name);if(k.id&&CL.camps.some(x=>x.id===k.id))store.set('campview',k.id);
  const mine=PARTY.filter(c=>clMine(c)&&!c.camp);
  if(mine.length&&confirm(`Share ${mine.length>1?'your characters':'your character'} (${mine.map(c=>c.name||'Unnamed').join(', ')}) with ${k.name}?\n\nYou can change this on each character later.`)){mine.forEach(c=>{clIdOk(c);c.camp=k.id});saveParty();clRerender()}}
function campInvite(id){const k=CL.camps.find(x=>x.id===id);if(!k)return;
  const link=SITE&&/^https?:$/.test(location.protocol)?new URL(pageUrl('party'),location.href).href+'#/party?join='+k.invite:'';
  const text=`Join my FAND campaign "${k.name}"${link?': '+link:''} (invite code ${k.invite})`;
  (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(()=>toast('Invite copied'),()=>prompt('Copy this invite:',text))}
function campNewCode(id){if(confirm('Make a new invite code? The old one stops working (members already in stay in).'))clDo(()=>clRpc('fand_new_invite',{p_campaign:id}),'New invite code made')}
function campRename(id){const k=CL.camps.find(x=>x.id===id),n=(prompt('New name for the campaign:',k?k.name:'')||'').trim();if(n)clDo(()=>clRpc('fand_rename_campaign',{p_campaign:id,p_name:n}),'Campaign renamed')}
function campDelete(id){const k=CL.camps.find(x=>x.id===id);if(!k||!confirm(`Delete ${k.name} for everyone? Each player keeps their own characters on their own devices.`))return;
  clDo(async()=>{const {error}=await CL.sb.from('campaigns').delete().eq('id',id);if(error)throw error},'Campaign deleted')}
function campLeave(id){const k=CL.camps.find(x=>x.id===id);if(!k||!confirm(`Leave ${k.name}? Your characters stop being shared with it, and you keep them.`))return;
  clDo(async()=>{const {error}=await CL.sb.from('campaign_members').delete().match({campaign_id:id,user_id:CL.user.id});if(error)throw error},'You left '+k.name)}
function campKick(id,u){if(!confirm(`Remove ${campName(id,u)} from the campaign? Their characters stop being shared; they keep them.`))return;
  clDo(async()=>{const {error}=await CL.sb.from('campaign_members').delete().match({campaign_id:id,user_id:u});if(error)throw error},'Removed')}
// an invite link (party.html#/party?join=CODE): join once signed in
function campLinkJoin(){const j=parseHash().params.get('join');if(!j)return;history.replaceState(null,'',hashFor('party'));
  if(!CL.on){toast('Accounts are not set up on this site');return}
  if(CL.user){setTimeout(()=>campJoin(j),50);return}
  try{sessionStorage.setItem('fand.__join',j)}catch(e){}
  if(clHasSession())cloudStart().catch(()=>{});else{toast('Sign in to join the campaign');setTimeout(openAccount,60)}}
window.addEventListener('hashchange',()=>{if(TAB==='party')campLinkJoin()});

// ── the hidden-class passphrase, kept in the account if its owner asks ──
async function clHcGet(){const {data}=await CL.sb.from('user_data').select('value').eq('key','__hc').maybeSingle();return data&&typeof data.value==='string'?data.value:null}
async function clHcSave(on){let code=null;try{code=sessionStorage.getItem('fand.hc')}catch(e){}if(on&&!code){toast('Unlock with the passphrase first');renderHidden();return}
  const {error}=on?await CL.sb.from('user_data').upsert({user_id:CL.user.id,key:'__hc',value:code,ts:Date.now()}):await CL.sb.from('user_data').delete().match({user_id:CL.user.id,key:'__hc'});
  if(error){toast(clMsg(error));return}CL.hc=on;toast(on?'Your account now opens the hidden list':'The passphrase is no longer kept in your account');renderHidden()}
async function clHcAuto(){if(!CL.on||!(CL.user||clHasSession()))return null;
  const t=new Promise(r=>setTimeout(()=>r(null),4000));
  return Promise.race([t,(async()=>{await cloudStart();if(CL.signing)await CL.signing;return CL.user&&CL.hc?clHcGet():null})().catch(()=>null)])}
function cloudHcHTML(){if(!CL.on)return '';
  if(!CL.user)return `<p class="note" style="margin-top:12px">Signed in (Settings, Account), your account can keep the passphrase and open this list on any device where you sign in.</p>`;
  return `<label class="note" style="display:flex;gap:8px;align-items:center;margin-top:12px;color:var(--text2)"><input type="checkbox" ${CL.hc?'checked':''} onchange="clHcSave(this.checked)"> Open the hidden list on any device where I'm signed in (${esc(CL.user.email||'')})</label><p class="note" style="margin:4px 0 0">The passphrase is kept in your account, where only you can read it. Untick to remove it.</p>`}

function cloudBoot(){if(!CL.on)return;partyHashInit();clHeader();
  {const q=new URLSearchParams(location.search);if(q.has('signin')){q.delete('signin');history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);setTimeout(openAccount,300)}}
  ['pointerdown','keydown','input'].forEach(t=>document.addEventListener(t,()=>{CL.touched=true},{once:true,capture:true}));
  document.addEventListener('visibilitychange',()=>{if(!CL.user)return;if(document.visibilityState==='visible'){if(Date.now()-CL.last>60000)clSyncNow(true)}else{clearTimeout(CL.timer);cloudPush().catch(()=>{});campPush().catch(()=>{})}});
  addEventListener('online',()=>{if(!CL.user)return;CL.err='';cloudPush().catch(()=>{});clCampSchedule()});
  let j=null;try{j=sessionStorage.getItem('fand.__join')}catch(e){}
  if(clHasSession()||/[?&](code|error_description)=/.test(location.search)||(j&&clHasSession())){cloudStart().catch(()=>{});clHeader()}
  else if(clApp()&&clPending()&&TAB!=='account')setTimeout(()=>{if(!CL.user&&clPending()&&TAB!=='account'){openAccount();toast('Type the code from your email to finish signing in')}},300)
}

// ════════════════════════════════════════════════════════════════
//  Assistant (Claude, called from the browser with the visitor's own key)
// ════════════════════════════════════════════════════════════════
const AI={model:'claude-opus-5-5',client:null,busy:false,msgs:[],view:[]};
try{const c=JSON.parse(sessionStorage.getItem('fand.chat')||'null');if(c&&Array.isArray(c.msgs)){AI.msgs=c.msgs;AI.view=c.view||[]}}catch(e){}
function saveChat(){try{sessionStorage.setItem('fand.chat',JSON.stringify({msgs:AI.msgs,view:AI.view}))}catch(e){}}
const KIND={rune:'rune',note:'note',blueprint:'bp',material:'mat',monster:'mon',god:'god',realm:'realm',subclass:'sub',demon:'demon',patron:'patron',spell:'spell'};
const KIND_NAME=Object.fromEntries(Object.entries(KIND).map(([k,v])=>[v,k]));
const HAY={rune:VIEWS.runes.hay,note:VIEWS.codex.hay,bp:VIEWS.blueprints.hay,mat:VIEWS.materials.hay,mon:VIEWS.bestiary.hay,god:VIEWS.gods.hay,spell:VIEWS.spells.hay,sub:VIEWS.subclasses.hay,demon:VIEWS.demons.hay,patron:VIEWS.patrons.hay,realm:r=>r.n+' '+(REALM_BLURB[r.n]||'')};
function brief(x){
  const t=x._t,o={kind:KIND_NAME[t],name:x.n};
  if(t==='bp')Object.assign(o,{profession:x.pr,specialty:x.sp,type:x.cat,level:x.lv,rarity:x.r,damage:x.dc&&x.dm?x.dc+' '+x.dm:undefined,ac:x.ac,property:x.prop,materialGrade:x.gr,materials:x.mats});
  else if(t==='mat')Object.assign(o,{origin:x.org+(x.origin?' ('+x.origin+')':''),uniqueTrait:x.tr?x.tr.n:undefined,grade:x.gr,rank:x.rank,itemLevel:x.il,type:x.ty||x.cat,rarity:x.rar,property:x.pn,potency:x.pot,priceGp:x.price||(x.tier>=8?'not sold':undefined)});
  else if(t==='mon')Object.assign(o,{grade:x.realm+' '+x.g,cr:x.cr,source:x.hb?'Homebrew':x.myth?x.myth+' mythology':(BOOKS[x.book]||x.book),habitat:x.hab,drops:(x.drops||[]).map(d=>d[0]+' ('+d[1]+')')});
  else if(t==='god')Object.assign(o,{pantheon:x.grp,homeRealm:x.home,runes:x.runes,fingersSeated:x.seated});
  else if(t==='spell')Object.assign(o,{school:x.sc,level:x.lv,classes:x.cls,damage:x.dmg&&x.dmg!=='None'?x.dmg:undefined});
  else if(t==='sub')Object.assign(o,{class:x.par,source:subSource(x)});
  else if(t==='demon'||t==='patron')Object.assign(o,{group:x.grp});
  else if(t==='realm')Object.assign(o,{tier:x.tier,pressure:x.pressure});
  else if(t==='rune')Object.assign(o,{progenitor:x.fig.name+', '+x.fig.title,fate:x.fig.fate,figure:x.fig.name+', '+x.fig.title,heldBy:x.gods.map(godKey),contested:x.contested});
  else if(t==='note')Object.assign(o,{folder:x.f,snippet:plainMd(x.md).slice(0,200)});
  return o;
}
function detail(x){
  const t=x._t,o=brief(x);
  if(t==='bp'){o.traitsWhenEquipped=x.mats.map(findMat).filter(m=>m&&m.tr).map(m=>m.tr.n+' (from '+m.n+'): '+m.tr.t);o.description=x.ds||(x.lost?'(description lost from this app; see the vault note)':'');o.materials=x.mats.map(n=>{const m=findMat(n);return m?{name:m.n,grade:m.gr,priceGp:m.price||0,property:m.pn}:{name:n}});const s=strongestMat(x);if(s)o.strongestMaterial=s.n+' (rank '+s.rank+', item level '+s.il+')';o.estimatedMaterialCostGp=x.mats.reduce((a,n)=>a+((findMat(n)||{}).price||0),0);o.connections=x.conns}
  else if(t==='mat'){o.uniqueTraitText=x.tr?x.tr.t:x.basic;o.propertyText=x.prop;o.description=x.ds;o.source=x.src;o.gatheredAt=x.where;o.gatheredBy=x.by;o.usedFor=x.use;o.weaponEffect=MAT_FX[x.n];const u=bpByMat().get(lc(x.n))||[];o.usedInBlueprints={count:u.length,examples:u.slice(0,15).map(b=>b.n)};o.droppedBy=(monByMat().get(lc(x.n))||[]).map(m=>m.n);o.signatureMaterialOf=(GOD_BY_MAT.get(lc(x.n))||[]).map(godKey)}
  else if(t==='mon'){o.description=x.txt||x.ds;o.statBlock=x.sb;o.lore=Object.fromEntries(monsterLore(x));o.drops=(x.drops||[]).map(d=>d[0]+' ('+d[1]+')');if(!(x.drops||[]).length)o.note='Official monster: its drops are on the realm Bestiary page in the vault.'}
  else if(t==='god'){o.title=godTitle(x);o.myth=x.myth||x.ds;o.wants=x.wants;o.signatureMaterials=x.sig;o.fingerRelic=x.relic;o.hand=x.hand;const r=new Map();(x.runes||[]).forEach(rn=>(RUNE_GODS.get(rn)||[]).forEach(g=>{if(g!==x){if(!r.has(g))r.set(g,[]);r.get(g).push(rn)}}));o.rivals=[...r].map(([g,rs])=>godKey(g)+' (over '+rs.join(', ')+')')}
  else if(t==='spell'){o.castingTime=x.ct;o.range=x.rng;o.duration=x.dur;o.description=x.desc}
  else if(t==='sub'||t==='demon'||t==='patron')o.description=x.ds;
  if(VDETAILS){const vt={bp:'bp',mat:'mat',spell:'spell',sub:'sub',mon:'mon',god:'god'}[t];const d=vt&&(VDETAILS[vt]||{})[vt==='god'?godKey(x):x.n];if(d)o.fromVault=d.md.slice(0,8000)}
  if(t==='rune'){Object.assign(o,{vaultProgenitor:x.vprog||undefined,vaultLineage:x.lin?x.lin.chain.map(c=>c.n):undefined,vaultOrigin:x.lin&&x.lin.origin||undefined,suggestedProgenitorNote:'progenitorFate etc. below are website suggestions, not vault lore',progenitorFate:x.fig.fate,progenitorFateText:x.fig.fateText,progenitorFell:x.fig.fell,progenitorRemains:x.fig.remains,figureForm:x.fig.form,figureNature:x.fig.temper,figureOrigin:x.fig.origin,symbol:x.fig.symbol,relics:x.bps.map(b=>b.n).slice(0,30)})}
  if(t==='note'){o.text=x.md.slice(0,12000);o.frontmatter=x.fm;if(SUPERSEDED[x.n])o.supersededBy='The website version applies: '+SUPERSEDED[x.n].msg}
  else if(t==='realm'){o.description=REALM_BLURB[x.n];o.materialRanks=((x.tier-1)*10+1)+'-'+x.tier*10;o.basePriceGp=x.base||'not sold';o.monsters=MONSTERS.filter(m=>m.realm===x.n).sort((a,b)=>a.g-b.g).map(m=>m.n+' (G'+m.g+')').slice(0,60);o.materialCount=MATS.filter(m=>m.realm===x.n).length;o.godsAtHome=GODS.filter(g=>g.home===x.n).map(godKey)}
  return JSON.parse(JSON.stringify(o));
}
function aiSearch(inp){
  const q=lc(inp.query||'').trim(),words=q.split(/\s+/).filter(Boolean);
  const kinds=inp.kind&&inp.kind!=='any'?[KIND[inp.kind]]:['rune','note','bp','mat','mon','god','realm','sub','demon','patron','spell'];
  const lim=Math.min(25,Math.max(1,inp.limit||10));
  const res=[];let total=0;
  for(const t of kinds){
    const arr=TYPES[t].arr;
    for(const x of arr){
      if(inp.realm&&lc(x.realm||realmOf(x.gr)||x.home||'')!==lc(inp.realm))continue;
      const g=t==='mat'||t==='mon'?x.g:null;
      if(inp.min_grade&&!(g>=inp.min_grade))continue;
      if(inp.max_grade&&!(g<=inp.max_grade))continue;
      if(inp.profession&&lc(x.pr)!==lc(inp.profession))continue;
      if(inp.min_level&&!(x.lv>=inp.min_level))continue;
      if(inp.max_level&&!(x.lv<=inp.max_level))continue;
      if(words.length){const h=x._ah||(x._ah=lc(HAY[t](x)));if(!words.every(w=>h.includes(w)))continue}
      total++;const n=lc(x.n);res.push([n===q?0:n.startsWith(q)?1:n.includes(q)?2:3,x]);
    }
  }
  res.sort((a,b)=>a[0]-b[0]||a[1].n.length-b[1].n.length);
  const out={totalMatches:total,showing:Math.min(lim,res.length),results:res.slice(0,lim).map(r=>brief(r[1]))};
  if(kinds.includes('spell')&&!SP.length)out.note='Spells are not loaded on this page; tell the user to open the Spells page to search spells.';
  return out;
}
function aiGet(inp){
  const ks=inp.kind&&KIND[inp.kind]?[KIND[inp.kind]]:Object.keys(TYPES);const n=lc(inp.name||'').trim();
  for(const t of ks){const arr=TYPES[t].arr;const x=arr.find(y=>lc(y.n)===n)||arr.find(y=>lc(y.n.split(' - ')[0])===n);if(x)return detail(x)}
  return {error:'No entry named "'+inp.name+'". Use search_compendium to find the exact name.'};
}
const AI_TOOLS=[
  {name:'search_compendium',eager_input_streaming:true,
   description:'Search the FAND compendium (the campaign data on this website). Returns short summaries of matching entries and the total number of matches. Matches every word of `query` against names and descriptions; leave `query` empty to list entries by filters alone. Use it before answering anything about specific Blueprints, materials, monsters, gods, realms, subclasses, demons, patrons, or spells.',
   input_schema:{type:'object',properties:{
     query:{type:'string',description:'Words to match, e.g. "dragon scale" or "fire". May be empty.'},
     kind:{type:'string',enum:['any','rune','note','blueprint','material','monster','god','realm','subclass','demon','patron','spell'],description:'Restrict to one kind of entry. Default any. "note" means a note from the campaign\'s Obsidian vault (rules pages, Runes, realms, classes, lore, patch notes).'},
     realm:{type:'string',description:'Only entries from this realm, e.g. "Hell", "Inner Void". Applies to materials, monsters, Blueprints (by material grade), and gods (by home realm).'},
     min_grade:{type:'integer',minimum:1,maximum:10,description:'Materials and monsters: lowest grade.'},
     max_grade:{type:'integer',minimum:1,maximum:10,description:'Materials and monsters: highest grade.'},
     profession:{type:'string',description:'Blueprints only: profession, e.g. "Blacksmithing".'},
     min_level:{type:'integer',description:'Blueprints and spells: lowest level.'},
     max_level:{type:'integer',description:'Blueprints and spells: highest level.'},
     limit:{type:'integer',minimum:1,maximum:25,description:'How many results to return. Default 10.'}},required:['query']}},
  {name:'get_entry',eager_input_streaming:true,
   description:'Get the full details of one entry by its exact name, with cross-references: the Blueprints that use a material, the monsters that drop it and gods who hold it; a Blueprint\'s materials, prices, and estimated cost; a god\'s Runes, Hand, and rivals; a realm\'s monsters and gods.',
   input_schema:{type:'object',properties:{name:{type:'string',description:'Exact entry name as returned by search_compendium.'},kind:{type:'string',enum:['rune','note','blueprint','material','monster','god','realm','subclass','demon','patron','spell']}},required:['name']}},
];
function validTool(name,inp){
  if(!inp||typeof inp!=='object')return false;
  if(name==='search_compendium')return typeof inp.query==='string';
  if(name==='get_entry')return typeof inp.name==='string'&&inp.name.length>0;
  return false;
}
const AI_SYSTEM=()=>`You are the FAND Assistant, a helper built into the FAND Compendium website for FAND (Fantasy and Numerous Disasters), a homebrew D&D campaign set in the world of Vestige (called Atrious in older vault notes; treat the two names as the same world). You answer questions from players and the DM about the campaign's Blueprints (craftable items), materials, monsters, realms, gods, professions, spells, subclasses, demons, patrons, and rules.

The compendium includes notes from the campaign's Obsidian vault (kind "note"). Where a vault note disagrees with the website's data or rules, the website takes priority.

Ground every specific claim in the compendium: use search_compendium and get_entry to look things up rather than relying on memory, and say plainly when the data doesn't contain something. General D&D 5e knowledge is fine for context, but FAND's own rules (below) override the books where they differ. Don't invent stats, prices, or lore.

When you name an entry that exists in the compendium, wrap its exact name in double square brackets, like [[Adamantine]] or [[Zeus]], so the website can turn it into a link. Keep answers focused and skimmable: short paragraphs and bullet lists, bold for key numbers. Don't use tables. Show the arithmetic briefly when you calculate something (damage after AC, prices, refining counts).

FAND cosmology: Infinatas (sometimes written Infinitas) is the creator of all things and the highest being, and cares only for balance, keeping it through creation. He cannot stay dead: if Infinatas is killed, Inane takes over and destroys everything, Infinatas included, until nothing is left; only then does Infinatas return and recreate everything. Inane is Infinatas's split personality and keeps balance through destruction; to the gods it was an unknown entity. The gods' own world eroded because of Inane, and Infinatas allowed the gods into this realm under strict regulation.

Runes: the vault's Rune notes are the source of truth: Runes are the power of lost or weakened original gods and spirits; today's gods are replicas built from them; Ignis, Undine, Gnome, and Sylph are dead progenitor spirits whose corpses became the Fire, Water, Earth, and Air Laws; Iron (Gnome's child) is caged alive; Cosmic was never fully killed; Infinatas is one of the last original gods. Where the vault is silent, the site suggests a progenitor: every Rune had a progenitor, its original holder and the first being to embody that principle, who was killed or vanished before the gods arrived; the gods inherited the Runes they hold (use get_entry with kind "rune"). Infinatas and Creation belong to Infinatas, Destruction to Inane, Balance to both; Ignis, Sylph, Undine, and Gnome are the progenitors.

FAND rules summary:
- Rolls: a skill roll is d20 + the skill's bonus only (never + an ability modifier). A basic action that no skill covers (lifting, shoving, holding breath, balance) is d20 + the ability modifier. Never both. Saves and initiative are a plain d20 plus class-ability and gear bonuses.
- Hitting (campaign owner's rule): there is no attack bonus; it is called Accuracy (proficiency + STR, or DEX for finesse/ranged, + the weapon's own Forge bonus; spells use proficiency + casting modifier). Every attack is an opposed roll: attacker rolls d20 + Accuracy, target rolls d20 + Dodge (its DEX modifier); the higher roll wins, a tie misses. A natural 20 Accuracy roll that hits is a critical (x1.5 damage before AC). AC never decides hitting, only damage. Monster damage scales with the realm by a flat +4 per tier past Human (already in stat blocks); monster dice are NOT multiplied by the realm tier.
- Armor Class starts at 0, adds the character's CON modifier once (campaign owner's rule; no cap, never below 0); is subtracted flat from the damage of each hit that beats the Dodge: damage taken = damage - AC, at least 1 (a hit that lands always deals 1 or more). Armor and other gear each add a small amount of AC to the total: slot units Body 4, Head 2, Hands/Feet/Shoulders/Back 1 each (a full set is 10); shields Buckler 1, Shield 2, Tower 3; x1 for metal, x0.7 bone/scale/stone, x0.4 hide/cloth, x(1 + (Item Level - 1)/20); minimum 1 per piece. A full set of iron gear gives 10 AC. Drawbacks depend on the pieces actually worn: each piece's slot and material weight (metal heavy; bone/scale/stone/gem medium; hide/cloth light, no drawbacks). Heavy body: Stealth disadvantage and speed -5 ft; medium body: Stealth disadvantage; heavy hands: Sleight of Hand disadvantage; heavy feet: Stealth disadvantage; heavy head: Perception disadvantage for hearing/side sight; heavy shoulders or back, or a metal shield: Acrobatics disadvantage; tower shield: speed -5 ft. A full heavy set (metal on 8+ of the 10 body units) means you lose Acrobatics, Athletics, and Dexterity; a full medium set gives disadvantage on Athletics and Acrobatics. AC is subtracted flat from the total damage of each hit: damage taken = damage - AC.
- Material grading: every material has a realm (tier 1-10) and a grade 1-10. Material Rank = (tier - 1) x 10 + grade (1-100). Item Level = ceil(Rank / 2) (1-50). Blueprints record their strongest material.
- Material origins and unique traits: creature parts carry a unique trait drawn from the creature's signature ability and the body part (a hawk's eye sharpens sight; troll blood regenerates); plants give small herbal effects; ores, stones, gems, and supplies are basic and carry only their property. An item gains the unique traits of its materials while equipped.
- Material properties: each material gives a property (48 in all); supplies give none. Potency = min(10, max(1, floor(Item Level / 5)) + 1 at grade 9, + 2 at grade 10). Weapons, armor, and shields carry the property of their strongest material.
- Refining: 3 materials of one grade make 1 of the next grade. Moving up to the next realm takes 5, a binding agent, and a Realm Forge.
- Custom Blueprints: players design items from a primary material and up to two secondaries, then pass a design check; traits come from the materials' properties.
- Money: each realm has its own coin worth its base price / 5 gp: ${REALMS.filter(r=>CURRENCY[r.n]&&CURRENCY[r.n].coin).map(r=>CURRENCY[r.n].coin+' ('+r.n+') = '+CURRENCY[r.n].gp+' gp').join(', ')}. Void, Inner Void, and Primordial have no coin. Moneychangers take 10%. Flux Chips (Chaos) change value daily: 2d6 x 50 gp.\n- Monsters have generated stat blocks in the Monster Manual layout (use get_entry for them) and 6-10 harvestable parts each.\n- Economy: price = realm base x grade (doubled at grade 9-10; supplies cost one fifth). Merchants buy at half. Void-grade materials and above aren't sold for coin: they cost Favor (Favor base Void 1, Inner Void 2, Primordial 4, x grade, x2 at grade 9-10), earned per task for a god (Minor 1, Normal 2, Major 3, Senior 5, Apostle 8, Fingers 12-30) and spent only with that god. Contract ranks give a temple discount on the god's goods, coin or Favor: Minor 10%, Normal 20%, Major 25%, Senior 30%, Apostle 40%, Fingers 50%.
- Professions: 10 (Blacksmithing, Carving, Tailoring, Alchemy, Cooking, Enchanting, Engineering, Harvesting, Scavenging, Navigation); the 31 old crafts are specialties. You start with one specialty and gain more; crafting outside your specialties is at disadvantage. Hell, Heaven, and Void metals need a Blacksmith with the matching realm specialty. Harvesting gathers ore, stone, crystal, and plants; Scavenging strips hide, bone, blood, organs, and essences from corpses. Profession XP comes from crafting, designing, refining, and gathering.
- Realm Travel: each realm has a Pressure 0-9; a traveler's Attunement is the highest of level ÷ 10, contract rank ÷ 2, or the Potency rank of worn gear made from that realm's material. If Pressure exceeds Attunement the traveler suffers strain. 11 travel methods; an anchor from home eases the return.
- God Contracts: ten ranks from Minor up to 1st Finger; the five Fingers form a god's Hand. Each rank has spells, AC, duties, and rewards. Gods sharing a Rune are rivals.
- Monsters: homebrew monsters have level, HP, AC, attacks, a save DC, and a signature trait from their best drop; grade 10 monsters have boss rules. Official monsters have CR, a grade from CR, and graded drops; no stat blocks.
- Every class picks its subclass at level 3.
- Levelling (campaign owner's rule): no XP; characters level up through accomplishments (big deeds such as a Tower boss floor, a god's task, a contract rank, a class change trial, a named monster, a hidden class), at the DM's pace. The character sheet logs accomplishments and has a Level up button.
- Stages (campaign owner's rules): every 20 levels is a stage, five in all, max level 100. Levels 1-20 are the original class; at 21 the class turns into its II (Ranger -> Ranger II), at 41 III, at 61 IV, at 81 V. Subclasses turn too (Gloom Stalker II, ...), each with its own features. Each stage opens a band of realms: I Human and Mysterious; II Hell, Heaven, Chaos; III Abyss, Inner Realm; IV Outer Realm, Void; V Inner Void, Primordial. A spell's realm is the home realm of the god holding its Rune (an unclaimed Rune's spells belong to the realm whose Tower it feeds; spells with no Rune are Human). Professions use the same stages: a crafter can only work materials from realms their profession stage has reached; harvesting deeper-realm parts is at disadvantage. Towers keep the realms' 10-level difficulty ladder (Human level 1, Mysterious 11, Hell and Heaven 21, Chaos 31, ...). Website proposals: past level 20 each change adds one slot at every spell level; encounter budgets are realm-relative: each realm tier past the Mysterious takes 10 levels off the party's level (a level-95 party in the Primordial budgets as level 15), and past an effective level of 20 the budget grows about 12% a level.
- Realm-bound magic (campaign owner's rule): a spell is bound to the realm where it was learnt and can be cast only there (a god's domain counts as its home realm). Its damage and healing dice are multiplied by that realm's tier (Human x1, Mysterious x2, Hell/Heaven x3, Chaos x4, Abyss x5, Inner x6, Outer x7, Void x8, Inner Void x9, Primordial x10) or by the caster's 10-level band (x1 at 1-10 ... x10 at 91-100), whichever is higher.
- Spellcasting focus (campaign owner's choice): an equipped Wand, Orb, Staff, or Amulet adds to spell Accuracy and save DC (forged: good main part Item Level/10, usable half, good structure +Item Level/20; ready-made: Item Level/10) and adds flat damage or healing to every spell that rolls dice (good main part Item Level/5, usable Item Level/10; ready-made Item Level/5, at least 1). Only the best focus counts. Every kind of focus has a buff and favoured schools (double focus damage): Wand range x1.5 (Evocation, Elemental); Staff range +30 ft (Nature Magic, Transmutation, Abjuration); Rod areas +5 ft (Evocation, Runic Magic); Orb areas +5 ft (Divination, Illusion, Chronomancy); Amulet touch spells reach 30 ft (Healing, Abjuration, Celestial); Scepter +1 DC (Enchantment, Celestial, Infernal); Tome +1 Accuracy (Runic Magic, Divination, Chronomancy); Totem range +30 ft (Nature, Elemental, Wild); Holy Symbol areas +5 ft (Celestial, Healing); Crystal range x1.5 (Psionics, Divination, Void); bard instruments: Lute +1 DC (Enchantment, Resonance), Flute range x1.5, Drum areas +10 ft, Harp touch 30 ft, War Horn areas +15 ft, Lyre +1 DC, Viol range +30 ft, Bagpipes areas +10 ft, Pan Flute range x1.5, Dulcimer areas +5 ft, Shawm range +30 ft, Chimes +1 Accuracy. One shared pool of slots, spendable only on spells bound to the current realm. Rune spells are learnt only in their own realm; Runeless spells in any realm the caster's stage opens. Magic Towers keep a hall in every realm.
- Steady Growth (campaign owner's rule): levels marked Steady Growth (2, 4, 6-9, 11-14, 16-19 of every 20-level stage) give +2 to the class's main stat, or +1 to each of two main stats (Fighter STR/DEX, Monk DEX/WIS, Paladin STR/CHA, Ranger DEX/WIS). Hidden classes are bonus classes with their own level 1-100 (starts at 1 when unlocked, +1 each time the holder levels up; features at class levels 1, 7, 14, evolution at 20, class changes II-V at 21/41/61/81 adding uses; dice follow the holder's level) and their own Steady Growth on their class levels 2, 4, 6-9, 11-14, 16-19: Unique own stats, Epic 4 points, Legendary 5, on top of the main class's growth. A character can hold several hidden classes; any further rules about where they are found are DM-only (in the encrypted list).
- Crafting and harvesting DCs (website proposal): +5 per realm tier past the Human, matching the profession bonus (half the profession level).
- Schools of magic (campaign owner's rule): a caster starts with one school and learns spells only from schools they hold. Each level gives one school point: progress a held school (+1 mastery) or open a new one (mastery 1). Highest spell level from a school = ceil(mastery/2), within the class's own limit. Each school beyond the first costs 1 slot at every spell level (minimum 1); Warlocks lose 1 pact slot per extra school. Cantrips from any held school.
- Temple passages (campaign owner's rule): an offering related to a god (its Minor signature material, an item made from its signature materials, or a deed serving its wants) given at its temple or shrine opens a passage to the god's own domain in its home realm, where its signature materials, temple stock, and general goods are sold (contract discount applies; Void-grade goods cost Favor). Passage time depends on the offering (base 1 hour): Minor signature material 1 h, Normal 2 h, Major 4 h, Senior 8 h, Apostle 1 day, Finger 3 days; an item made from a signature material doubles it; deeds: small 1 h, contract task 4 h, major task 1 day; more of the same adds again. No realm Pressure inside the domain. Major+ contractors open it for an hour without an offering.
- Contracts (campaign owner's rule, replaces the vault's exclusivity): a character can hold contracts with several gods at any rank; when there is a conflict of interest they must choose a side and break the other contract, suffering its consequences. Natural AC from contracts does not stack (highest rank counts).
- Legendary secret rooms (campaign owner's rule): any floor of any Tower can hold a secret room with the trial of a Legendary class (website odds: 3% a floor, 8% on boss floors), drawn from Legendary classes whose level requirement the floor's level meets. The floor's own mission is unchanged and the room is never needed to climb; the DM has the unlock condition, and whoever finds the room and passes its trial earns the class's Class Change Book.
- Hidden class scaling (campaign owner's rule): a hidden class's damage and healing dice multiply every 10 levels (x2 at 11 ... x10 at 91), and at each class change (II at 21, III at 41, IV at 61, V at 81) it turns too (e.g. Ashborn Sovereign III), its limited-use features gaining one more use per stage.
- Hidden classes and Towers (campaign owner's rules): besides the basic classes there are hidden classes, unlocked only through quests and Towers. Up to five Towers stand in every realm, each grown from the excess energy of a group of related unclaimed Runes (Runes no god holds; about six Runes per Tower, at most five Towers); every Tower in a realm has that realm's floors, by realm: Human 10 up to Primordial 100. Tiers: Unique (one of a kind; only one holder in the world at a time), Epic (a specialisation of one basic class, e.g. a Rogue whose assassin skills are honed into poison), Legendary (classes that follow the progenitors of the Runes). Epic classes are found halfway up a Tower, Unique three quarters up, Legendary at the top. The site's Hidden classes and Towers pages list them.
- The Forge: every Blueprint is a version of a general design (every standard weapon such as Battleaxe, Greataxe, Longsword, Rapier, Longbow, Heavy Crossbow, Whip; armor pieces Helm, Cuirass, Gauntlets, Boots, Pauldrons, Cloak, Barding; Buckler, Shield, Tower Shield; focuses Staff, Wand, Orb, Amulet, Ring) built from parts. Each part accepts some material categories well, some poorly, and the rest are wrong (an axe head takes metal, stone, or hard bone/horn/fang; a gem is a poor, brittle head; a dragon eye is soft tissue and useless). The main part sets the item's level (its Item Level × 2, the Blueprint scale of 1 to 100) and the damage dice (the weapon's own die, enough of them to average about 3 damage a level, like the vault's Blueprints: a level 10 longsword deals 7d8) and a damage bonus of Item Level / 5, or the AC; the structure (haft, hilt, string, lining) sets the Accuracy of Item Level / 10, or +1 AC at Item Level 20+. Main and structure parts give their property at full Potency, extras at half, and every part's unique trait applies. A wrong main part makes the item useless (1d2 damage, -5 Accuracy, breaks on 1-5); a wrong structure gives -3 Accuracy and breaks on 1-3; a poor fit loses that part's bonus and breaks on a natural 1; a structure more than 10 Item Levels weaker than the main part breaks on 1-2.
- Armor drawbacks by total armor AC worn: 10+ = lose Acrobatics, Athletics, and Dexterity (campaign rule); 4-6 and 7-9 rows are proposed (Stealth; Stealth and Acrobatics at disadvantage).

Realms (tier, base price per grade): ${REALMS.map(r=>r.n+' (tier '+r.tier+', '+(r.base?r.base+' gp':'not sold')+')').join('; ')}.

The user is currently on the ${(TABS.find(t=>t[0]===(SITE?SITE.page:'home'))||[])[1]||'Home'} page of the website.`;
function linkify(html){
  return html.replace(/\[\[([^\]]{1,120})\]\]/g,(m,name)=>{
    const raw=name.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
    for(const t of ['mat','bp','mon','god','realm','sub','demon','patron','spell']){
      const arr=TYPES[t].arr,n=lc(raw);const x=arr.find(y=>lc(y.n)===n)||(t==='god'||t==='demon'||t==='patron'?arr.find(y=>lc(y.n.split(' - ')[0])===n):null);
      if(x)return `<button class="chip" data-ref="${ref(x)}">${name}</button>`;
    }
    return '<strong>'+name+'</strong>';
  });
}
function md(src){
  const lines=esc(src).split('\n');let out='',list=null;
  const inline=s=>linkify(s.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>'));
  const close=()=>{if(list){out+='</'+list+'>';list=null}};
  for(const l of lines){
    let m;
    if((m=/^\s*[-*•]\s+(.*)/.exec(l))){if(list!=='ul'){close();out+='<ul>';list='ul'}out+='<li>'+inline(m[1])+'</li>'}
    else if((m=/^\s*\d+[.)]\s+(.*)/.exec(l))){if(list!=='ol'){close();out+='<ol>';list='ol'}out+='<li>'+inline(m[1])+'</li>'}
    else if((m=/^#{1,4}\s+(.*)/.exec(l))){close();out+='<h4>'+inline(m[1])+'</h4>'}
    else if(!l.trim()){close()}
    else{close();out+='<p>'+inline(l)+'</p>'}
  }
  close();return out;
}
function toggleAI(on){const a=$('ai'),v=on==null?!a.classList.contains('open'):on;a.classList.toggle('open',v);$('aiFab').style.display=v?'none':'';if(v){renderAI();setTimeout(()=>$('aiQ').focus(),50)}}
function newChat(){if(AI.busy)return;AI.msgs=[];AI.view=[];saveChat();renderAI()}
const AI_SUGG=['What can I craft with Adamantine?','Which monsters in Hell drop grade 5+ materials?','How much damage does a 30-damage hit do against AC 12?','Who are Zeus\'s rivals and why?','Plan refining Human 1 materials up to Mysterious 1'];
function renderAI(statusText){
  const box=$('aiMsgs');
  if(!getKey()){box.innerHTML=`<div class="ai-empty"><b>Ask anything about FAND</b><span>The assistant looks things up in this compendium and answers with links to the entries it used. It runs on Claude through your own Anthropic API key, which stays in this browser.</span><div><button class="btn primary" onclick="openSettings()">Add your API key</button></div></div>`;return}
  if(!AI.view.length&&!statusText){box.innerHTML=`<div class="ai-empty"><b>Ask anything about FAND</b><span>Try one of these:</span><div class="ai-sugg">${AI_SUGG.map(s=>`<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;return}
  box.innerHTML=AI.view.map(v=>v.role==='user'?`<div class="ai-m user">${esc(v.text)}</div>`:v.role==='err'?`<div class="ai-m err">${esc(v.text)}</div>`:`<div class="ai-m bot">${md(v.text)}</div>`).join('')+(statusText?`<div class="ai-status" id="aiStatus">${esc(statusText)}</div>`:'');
  box.scrollTop=box.scrollHeight;
}
$('aiMsgs').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b){$('aiQ').value=b.dataset.q;ask()}});
$('aiForm').addEventListener('submit',e=>{e.preventDefault();ask()});
$('aiQ').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}});
$('aiQ').addEventListener('input',e=>{e.target.style.height='auto';e.target.style.height=Math.min(140,e.target.scrollHeight)+'px'});
function loadSDK(){
  if(window.Anthropic)return Promise.resolve();
  return new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/anthropic.js';s.onload=()=>window.Anthropic?res():rej(new Error('sdk'));s.onerror=()=>rej(new Error('The assistant library could not be loaded.'));document.head.appendChild(s)});
}
function setStatus(t){const s=$('aiStatus');if(s)s.textContent=t;else renderAI(t)}
async function ask(){
  loadDetails();
  const q=$('aiQ').value.trim();if(!q||AI.busy)return;
  if(!getKey()){openSettings();return}
  AI.busy=true;$('aiSend').disabled=true;$('aiQ').value='';$('aiQ').style.height='';
  AI.view.push({role:'user',text:q});AI.msgs.push({role:'user',content:q});saveChat();
  renderAI('Thinking…');
  const bot={role:'bot',text:''};let shown=false;
  try{
    await loadSDK();
    const Anthropic=window.Anthropic;
    if(!AI.client)AI.client=new Anthropic({apiKey:getKey(),dangerouslyAllowBrowser:true});
    let jsonRetries=0;
    for(let turn=0;turn<10;turn++){
      const stream=AI.client.beta.messages.stream({
        model:AI.model,max_tokens:64000,
        betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
        output_config:{effort:'medium'},
        cache_control:{type:'ephemeral'},
        system:AI_SYSTEM(),tools:AI_TOOLS,messages:AI.msgs,
      });
      stream.on('text',d=>{if(!shown){AI.view.push(bot);shown=true}bot.text+=d;renderAI('Writing…')});
      let msg;
      try{msg=await stream.finalMessage();jsonRetries=0}
      catch(err){if(err instanceof Anthropic.APIError||jsonRetries++>=2)throw err;continue}
      if(msg.stop_reason==='refusal'){AI.msgs.push({role:'assistant',content:msg.content});if(!shown){AI.view.push(bot);shown=true}bot.text+=(bot.text?'\n\n':'')+'*I can\'t help with that request.*';break}
      if(msg.stop_reason==='pause_turn'){AI.msgs.push({role:'assistant',content:msg.content});continue}
      const uses=msg.content.filter(b=>b.type==='tool_use');
      AI.msgs.push({role:'assistant',content:msg.content});
      if(msg.stop_reason==='max_tokens'&&uses.length)throw new Error('The answer was cut off. Try a narrower question.');
      if(msg.stop_reason!=='tool_use'||!uses.length)break;
      const results=[];
      for(const u of uses){
        if(!validTool(u.name,u.input)){results.push({type:'tool_result',tool_use_id:u.id,is_error:true,content:JSON.stringify({INVALID_JSON:JSON.stringify(u.input)})});continue}
        setStatus(u.name==='get_entry'?'Reading '+u.input.name+'…':'Searching the compendium'+(u.input.query?' for “'+u.input.query+'”':'')+'…');
        let r;try{r=u.name==='get_entry'?aiGet(u.input):aiSearch(u.input)}catch(e){r={error:String(e&&e.message||e)}}
        results.push({type:'tool_result',tool_use_id:u.id,content:JSON.stringify(r)});
      }
      AI.msgs.push({role:'user',content:results});
      if(bot.text&&!/\n$/.test(bot.text))bot.text+='\n\n';
      setStatus('Thinking…');
    }
  }catch(err){
    const A=window.Anthropic;let m=err&&err.message||String(err);
    if(A&&err instanceof A.AuthenticationError)m='Your API key was rejected. Check it in Settings.';
    else if(A&&err instanceof A.PermissionDeniedError)m='This API key isn\'t allowed to use '+AI.model+'.';
    else if(A&&err instanceof A.RateLimitError)m='Rate limit reached. Wait a moment and try again.';
    else if(A&&err instanceof A.APIConnectionError)m='Couldn\'t reach Anthropic. Check your connection.';
    else if(A&&err instanceof A.APIError)m='The API returned an error: '+m;
    // Drop the unanswered turn so the conversation stays valid for the next question.
    while(AI.msgs.length&&!(AI.msgs[AI.msgs.length-1].role==='assistant'&&!AI.msgs[AI.msgs.length-1].content.some(b=>b.type==='tool_use')))AI.msgs.pop();
    AI.view.push({role:'err',text:m});
  }
  if(shown&&!bot.text.trim())AI.view.splice(AI.view.indexOf(bot),1);
  AI.busy=false;$('aiSend').disabled=false;saveChat();renderAI();
}

// ════════════════════════════════════════════════════════════════
//  Boot
// ════════════════════════════════════════════════════════════════
if(!location.hash)history.replaceState(null,'',hashFor(SITE?SITE.page:'home'));
cloudBoot();
route();
guideAuto();
cmpTray();
hoFromHash();
// Home Screen app: the offline worker (sw.js) keeps every page and its data on the device. Site pages only, not FAND.html.
if(SITE&&'serviceWorker'in navigator&&/^https?:$/.test(location.protocol)){
  const had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)$('upd').hidden=false});
}
