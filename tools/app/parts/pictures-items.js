// ── Pictures for monsters, gods, demons, and patrons: illustrations from game-icons.net (CC BY 3.0), matched by generators/art.js ──
const ART_TINT={red:'#e8553f',blue:'#4f93ea',green:'#4cbb6c',black:'#9d90b4',white:'#e4ecf3',gold:'#ecc04f',silver:'#c9d2dc',bronze:'#cf9152',brass:'#dcb85e',copper:'#d27c4e',amethyst:'#b084e3',crystal:'#a6e8f4',emerald:'#43c985',sapphire:'#4a78e4',topaz:'#eda844',moonstone:'#cfd9f5',deep:'#8c69c0',shadow:'#8a80a6'};
// the Human realm's colour is grey, so its creatures take a colour from their kind instead
const ART_TYPE={fiend:'#e2513f',undead:'#8fd6c4',dragon:'#e8553f',celestial:'#ecc04f',fey:'#d68be0',aberration:'#a98be0',elemental:'#f0a04b',construct:'#b8c2cc',ooze:'#9ad35a',plant:'#6fcf6a',giant:'#c7a27a',monstrosity:'#d08a5a',humanoid:'#dcb98f',beast:'#d1a66b'};
function artIdx(x){if(typeof ART==='undefined'||!x||!ART[x._t])return -1;const i=ART[x._t][x.n];return i==null?-1:i}
function artTint(x){const w=x._t==='mon'&&/dragon|abishai|slaad|greatwyrm/i.test(x.n)&&/\b(red|blue|green|black|white|gold|silver|bronze|brass|copper|amethyst|crystal|emerald|sapphire|topaz|moonstone|deep|shadow)\b/i.exec(x.n);if(w)return ART_TINT[w[1].toLowerCase()];
  if(x._t==='mon'){if(x.realm!=='Human'&&REALM[x.realm])return rcol(x.realm);const ty=String(x.sb&&x.sb.ty||'');const k=Object.keys(ART_TYPE).find(t=>ty.includes(t));return k?ART_TYPE[k]:'#d1a66b'}
  if(x._t==='god'){const h0=String(x.home||''),h=REALM[h0]?h0:h0.replace(/ Realm$/,'');return h!=='Human'&&REALM[h]?rcol(h):'#ecc04f'}return /celestial/i.test(x.grp)?'#ecc04f':/archfey/i.test(x.grp)?'#5fd08a':/old one|corruption/i.test(x.grp)?'#9d7fe0':/vyrekala|dragon/i.test(x.grp+x.n)?'#e8553f':'#e2513f'}
// a material's or item's type symbol (cards and chips)
function typeIdx(x){if(typeof ART==='undefined'||!x)return -1;let i;if(x._t==='mat')i=(ART.mty||{})[x.rune||/Rune/.test(x.cat||'')?'Rune':x.ty];else if(x._t==='bp')i=(ART.ity||{})[x.cat];return i==null?-1:i}
// pictures a DM picked instead (Picture picker), kept on this device
let ART_PICK=store.get('artPick',{})||{};
const PICKABLE={mon:1,god:1,demon:1,patron:1};
function artBody(x){if(!x||typeof ART==='undefined')return '';const o=PICKABLE[x._t]&&ART_PICK[x._t+':'+x.n];if(o&&o.b)return o.b;const i=artIdx(x);if(i>=0)return ART.icons[i];const t=typeIdx(x);return t>=0?ART.icons[t]:''}
function artHTML(x,cls){const b=artBody(x);if(!b)return '';const ty=x._t==='mat'||x._t==='bp';
  return `<span class="art ${ty?'ty ':''}${cls||''}" style="--ac:${ty?(x.realm&&x.realm!=='Human'&&REALM[x.realm]?rcol(x.realm):x.mg?'#ecc04f':'#d8c7a4'):artTint(x)}" aria-hidden="true"><svg viewBox="0 0 512 512" focusable="false">${b}</svg></span>`}
// Picture picker: a DM can give a monster, god, demon, or patron a different picture from about a thousand creature and fantasy icons
function loadIconPick(){if(typeof ICON_PICK!=='undefined')return Promise.resolve();return new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='data/icons-pick.js'+(typeof SITE==='object'&&SITE&&SITE.v?'?v='+SITE.v:'');sc.onload=res;sc.onerror=()=>rej(new Error('The picture list could not load. Check your connection.'));document.body.appendChild(sc)})}
function artPicker(x,onSet){if(!x||(!PICKABLE[x._t]&&!onSet))return;let P=$('artpick');if(!P){P=document.createElement('div');P.id='artpick';P.className='artpick';P.setAttribute('role','dialog');P.setAttribute('aria-modal','true');document.body.appendChild(P)}
  const key=x._t+':'+x.n,name=x.n.split(' - ')[0];P.hidden=false;
  P.innerHTML=`<div class="ap-box"><div class="ap-h"><b>Choose a picture for ${esc(name)}</b><button type="button" class="icon-btn" onclick="artPickClose()" aria-label="Close">${ICON.x}</button></div><input class="sel" id="ap-q" type="search" placeholder="Search pictures: dragon, skull, wolf, flame…" style="max-width:none" aria-label="Search pictures"><div class="ap-grid" id="ap-grid" role="list"><div class="note">Loading pictures…</div></div><div class="ap-f"><button type="button" class="btn" onclick="artPickSet(null)" ${(onSet?x.pic:ART_PICK[key])?'':'disabled'}>Use the default picture</button><span class="note" style="margin:0">Saved on this device.</span></div></div>`;
  P._ret=document.activeElement;P._x=x;P._cb=onSet||null;P.onclick=e=>{if(e.target===P)artPickClose()};
  loadIconPick().then(()=>{const draw=()=>{const q=lc(($('ap-q')||{}).value||'').trim().replace(/\s+/g,'-'),L=ICON_PICK.filter(([n])=>!q||n.includes(q)),cur=((onSet?x.pic:ART_PICK[key])||{}).n;
      $('ap-grid').innerHTML=L.length?L.slice(0,240).map(([n,b],i)=>`<button type="button" role="listitem" class="ap-i${n===cur?' on':''}" data-i="${ICON_PICK.indexOf(L[i])}" title="${esc(n.replace(/-/g,' '))}" aria-label="${esc(n.replace(/-/g,' '))}"><svg viewBox="0 0 512 512" focusable="false">${b}</svg></button>`).join('')+(L.length>240?`<div class="note" style="grid-column:1/-1">${fmt(L.length-240)} more: narrow the search.</div>`:''):'<div class="note">Nothing matches. Try another word.</div>'};
    draw();$('ap-q').oninput=draw;$('ap-grid').onclick=e=>{const b=e.target.closest('.ap-i');if(b)artPickSet(ICON_PICK[+b.dataset.i])};setTimeout(()=>$('ap-q').focus(),0)},e=>{$('ap-grid').innerHTML=`<div class="note">${esc(e.message)}</div>`})}
function artPickClose(){const P=$('artpick');if(!P||P.hidden)return;const back=P.contains(document.activeElement);P.hidden=true;if(back)setTimeout(()=>{const b=document.querySelector('#modal .art-edit')||P._ret;if(b&&document.contains(b))b.focus()},0)}
function artPickSet(ic){const P=$('artpick'),x=P&&P._x;if(!x)return;if(P._cb){const cb=P._cb;artPickClose();cb(ic?{n:ic[0],b:ic[1]}:null);return}const key=x._t+':'+x.n,was=ART_PICK[key];if(ic)ART_PICK[key]={n:ic[0],b:ic[1]};else delete ART_PICK[key];store.set('artPick',ART_PICK);artPickClose();
  const redraw=()=>{if($('mbg').classList.contains('open')&&CUR===x)showModal(x);if(VIEWS[TAB])renderList();else if(TAB==='combat')renderCombat()};redraw();
  undoToast(ic?'New picture for '+x.n.split(' - ')[0]:'Default picture back for '+x.n.split(' - ')[0],()=>{if(was)ART_PICK[key]=was;else delete ART_PICK[key];store.set('artPick',ART_PICK);redraw()})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const P=$('artpick');if(P&&!P.hidden){artPickClose();e.stopPropagation()}}},true);
// Symbols: emoji in the text become matching game-icons symbols as the page draws (a watcher on the page catches every
// render, toast, and popup). Text the browser draws itself can't hold a symbol, so there the emoji are left out:
// dropdown options, tooltips, placeholders and the tab title.
const SYM_RE=typeof ART!=='undefined'&&ART.sym?new RegExp('('+Object.keys(ART.sym).sort((a,b)=>b.length-a.length).map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\uFE0F?','gu'):null;
const SYM_SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,OPTION:1,SELECT:1,INPUT:1,TITLE:1,CODE:1,PRE:1,svg:1};
// (its own tag, so no page's "span" or "i" styles reach it)
function symSVG(i,cls,label){return `<g-sym class="sym${cls?' '+cls:''}" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'}><svg viewBox="0 0 512 512" focusable="false">${ART.icons[i]}</svg></g-sym>`}
function condSym(c){return typeof ART!=='undefined'&&ART.cond&&ART.cond[c]!=null?symSVG(ART.cond[c]):''}
function iconSVG(i){return `<svg viewBox="0 0 512 512" focusable="false">${ART.icons[i]}</svg>`}
function pgSym(k,cls){return typeof ART!=='undefined'&&ART.pg&&ART.pg[k]!=null?symSVG(ART.pg[k],cls):''}
function symbolize(root){if(!SYM_RE||!root||root.nodeType!==1||!root.isConnected)return;
  if(root.nodeName==='SELECT'||root.nodeName==='OPTION'){(root.nodeName==='OPTION'?[root]:[...root.options]).forEach(o=>{SYM_RE.lastIndex=0;if(SYM_RE.test(o.textContent)){SYM_RE.lastIndex=0;o.textContent=o.textContent.replace(SYM_RE,'').replace(/^\s+/,'').replace(/\s{2,}/g,' ')}});return}
  for(let p=root;p&&p!==document.body;p=p.parentNode)if(p.nodeType===1&&(SYM_SKIP[p.nodeName]||p.isContentEditable))return;
  const L=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode(n){if(n.nodeType===1)return SYM_SKIP[n.nodeName]||n.isContentEditable?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_SKIP;SYM_RE.lastIndex=0;return SYM_RE.test(n.data)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});
  while(w.nextNode())L.push(w.currentNode);
  L.forEach(n=>{const s=n.data,f=document.createDocumentFragment();let last=0,m;SYM_RE.lastIndex=0;
    while((m=SYM_RE.exec(s))){if(m.index>last)f.appendChild(document.createTextNode(s.slice(last,m.index)));const t=document.createElement('template');t.innerHTML=symSVG(ART.sym[m[1]],'',m[1]);f.appendChild(t.content);last=m.index+m[0].length}
    if(last<s.length)f.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(f,n)})
  // a list's options can't hold a symbol: their emoji are left out rather than shown in colour
  ;(root.nodeName==='OPTION'?[root]:root.querySelectorAll?root.querySelectorAll('option'):[]).forEach(o=>{SYM_RE.lastIndex=0;if(SYM_RE.test(o.textContent)){SYM_RE.lastIndex=0;o.textContent=o.textContent.replace(SYM_RE,'').replace(/^\s+/,'').replace(/\s{2,}/g,' ')}})
  // nor can tooltips and placeholders (an element's own attributes, and those of everything inside it)
  ;(root.querySelectorAll?[root,...root.querySelectorAll('[title],[placeholder]')]:[]).forEach(e=>['title','placeholder'].forEach(a=>{const v=e.getAttribute&&e.getAttribute(a);if(v){SYM_RE.lastIndex=0;if(SYM_RE.test(v)){SYM_RE.lastIndex=0;e.setAttribute(a,v.replace(SYM_RE,'').replace(/^\s+/,'').replace(/\s{2,}/g,' '))}}}));
  if(SYM_RE.test(document.title)){SYM_RE.lastIndex=0;document.title=document.title.replace(SYM_RE,'').replace(/^\s+/,'').replace(/\s{2,}/g,' ')}SYM_RE.lastIndex=0}
if(SYM_RE&&window.MutationObserver){new MutationObserver(ms=>{const q=new Set();ms.forEach(m=>{if(m.type==='characterData')q.add(m.target.parentNode);else m.addedNodes.forEach(n=>q.add(n.nodeType===3?n.parentNode:n))});q.forEach(symbolize);
  if(typeof TAB==='string'&&typeof VIEWS==='object'&&!VIEWS[TAB]&&$('content'))pageSym()}).observe(document.body,{childList:true,subtree:true,characterData:true});symbolize(document.body)}
const RAR_ORDER=['Common','Uncommon','Rare','Very Rare','Legendary','Artifact'];
const rarRank=r=>{const i=RAR_ORDER.indexOf(r);return i<0?9:i};

const SP=typeof SPELLS!=='undefined'?SPELLS:[];
const VAULT_DATA=typeof VAULT!=='undefined'?VAULT:{imported:'',notes:[]};
const NOTES=VAULT_DATA.notes;
const pageUrl=t=>SITE?(t==='home'?'index.html':t+'.html'):'#/'+t;
const TYPES={
  bp:{arr:BPS,tab:'blueprints',label:'Blueprint'},
  mat:{arr:MATS,tab:'materials',label:'Material'},
  mon:{arr:MONSTERS,tab:'bestiary',label:'Monster'},
  god:{arr:GODS,tab:'gods',label:'God'},
  spell:{arr:SP,tab:'spells',label:'Spell'},
  sub:{arr:SUBS,tab:'subclasses',label:'Subclass'},
  demon:{arr:DEMONS,tab:'demons',label:'Demon'},
  patron:{arr:PATRONS,tab:'patrons',label:'Patron'},
  realm:{arr:REALMS,tab:'realms',label:'Realm'},
  note:{arr:NOTES,tab:'codex',label:'Vault note'},
  prop:{arr:PROPS,tab:'properties',label:'Property'},
};
PROPS.forEach(x=>{x.ds=x.t});
const PROP_IDX=new Map(PROPS.map(x=>[lc(x.n),x]));
const propChip=(n,pot)=>{const x=PROP_IDX.get(lc(n||''));return x?`<a href="#" data-ref="${x._t}:${x._i}" style="font-weight:700;color:inherit">${esc(n)}</a>`:esc(n||'')};
// Saved Forge designs are Blueprints too. They join the list after the vault's (so vault links and pins keep their
// place), filed by profession and specialty: d.sort is set when a design is saved, by AI when a key is available, else
// by FAND's own rules (designSortRules).
const BP_VAULT=BPS.length;
// a forged item's description, written from its record (powers, quality, quirk, combos), for items with no lore of their own
function forgedDesc(d){const F=d&&d.forged;if(!F)return '';const P=d.powers||[],a=/^[aeiou]/i.test(F.q||'')?'An':'A';
  return [`${a} ${F.q||'Standard'} ${d.base||d.cat||'item'}${F.by?' forged by '+F.by:''}${F.on?' on '+F.on:''}${(d.mats||[]).length?', made of '+d.mats.join(', '):''}.`,
    d.dmg?`It deals ${d.dmg}${d.vers?' ('+d.vers+' two-handed)':''}${d.atk!=null?', with '+(d.atk>=0?'+':'')+d.atk+' Accuracy':''}.`:d.ac!=null?`It gives AC ${d.ac}.`:'',
    ...P.map(x=>`${x.n}${x.k==='p'?' (Potency '+x.pot+')':''}: ${x.t||''}`.trim()),
    F.quirk?`${F.quirk.n}: ${F.quirk.t}`:'',(d.combos||[]).length?`Combos: ${d.combos.join(', ')}.`:''].filter(Boolean).join('\n')}
function designBP(d){const so=d.sort||{},m=/^(\S+)\s+(.*)$/.exec(d.dmg||'');return {n:d.n,design:d,ammo:d.ammo||null,pr:so.pr||d.pr||'Blacksmithing',sp:so.sp||'',cat:so.cat||d.cat||'Item',r:d.r||'Common',lv:d.il||1,mats:(d.mats||[]).slice(),ds:d.lore||forgedDesc(d)||so.ds||'',prop:d.prop||'',mg:false,gr:d.gr||'',ac:d.ac!=null?String(d.ac):'',dc:m?m[1]:'',dm:m?m[2]:'',slot:d.slot||''}}
// Potency runs 1-50 (website rule); its rank (Potency / 5, 1-10) sets a property's numbers. Designs forged before the
// scale was widened kept Potency 1-10: they are moved to the new scale once (x5) and marked potV 2.
const potRank=p=>Math.min(10,Math.max(1,Math.floor((+p||0)/5)));
function potMigrate(L){let n=0;(Array.isArray(L)?L:[]).forEach(d=>{if(!d||d.potV>=2||!Array.isArray(d.powers))return;d.powers.forEach(x=>{if(x&&x.k==='p'&&x.pot)x.pot=Math.min(50,x.pot*5)});if(d.powers.some(x=>x&&x.k==='p'))d.prop=d.powers.filter(y=>y&&y.k==='p').map(y=>`${y.n} (Potency ${y.pot})`).join(', ');d.potV=2;n++});return n}
(()=>{const D=store.get('designs',[]);if(potMigrate(D))store.set('designs',D);(Array.isArray(D)?D:[]).forEach(d=>{if(d&&d.n)BPS.push(designBP(d))})})();
for(const k in TYPES)TYPES[k].arr.forEach((x,i)=>{x._t=k;x._i=i});
const ref=x=>x._t+':'+x._i;
const deref=r=>{const [t,i]=String(r).split(':');return TYPES[t]&&TYPES[t].arr[+i]};

const MAT_IDX=new Map();MATS.forEach(m=>MAT_IDX.set(lc(m.n),m));
const MON_IDX=new Map();MONSTERS.forEach(m=>MON_IDX.set(lc(m.n),m));
{const get=MON_IDX.get.bind(MON_IDX);MON_IDX.get=k=>get(k)||(/, \w+ champion( · | ✦ |$)/.test(k)?champFromName(k,get):undefined)}
const godKey=g=>g.n.split(' - ')[0].trim();
const godTitle=g=>{const p=g.n.split(' - ');return p.slice(1).join(' - ')};
const GOD_IDX=new Map();GODS.forEach(g=>GOD_IDX.set(lc(godKey(g)),g));
const findMat=n=>MAT_IDX.get(lc(n))||(/^Artifact: /.test(n||'')?artMat(n):/^Anything: /.test(n||'')?anyMat(n):/\)$/.test(n||'')?varMat(n):undefined);
// Material variants (tanned hide, seasoned wood, folded steel...) were removed. Their old names, still in packs and in
// designs saved before, read as the plain material
const OLD_PREP=new Set(["tanned", "rawhide", "cuir bouilli", "oiled", "spun", "brain-tanned", "scaled", "smoke-cured", "felted", "waxed", "seasoned", "fire-hardened", "laminated", "ebonized", "dried", "distilled", "bog-seasoned", "steam-bent", "charred", "petrified", "tinctured", "candied", "wrought", "cast", "folded", "tempered", "annealed", "wire", "pattern-welded", "case-hardened", "blued", "gilded", "granulated", "polished", "boiled", "carved", "split", "scrimshawed", "bone-meal", "lacquered", "knapped", "dressed", "honed", "powdered", "fire-glazed", "cut", "cabochon", "ground", "tumbled", "moon-attuned", "cleaved", "salted", "rendered", "fermented", "clotted", "infused", "bound", "refined", "crystallized", "diluted", "volatile", "calibrated", "greased"]);
function unprep(n){const x=/^(.+) \(([^()]+)\)$/.exec(n||''),base=x&&OLD_PREP.has(lc(x[2]))&&MAT_IDX.get(lc(x[1]));return base?base.n:n}
function varMat(name){const b=unprep(name);return b!==name?MAT_IDX.get(lc(b)):undefined}
// the DM can make an item out of anything: "Anything: <what> [<kind code>]" counts as that kind of material, a good fit
// for the part it was put in, at the level the DM sets (no property or trait unless the DM writes one in)
function anyMat(name){const x=/^Anything: (.+) \[([A-Z])\]$/.exec(name||'');if(!x)return undefined;const lv=Math.max(1,Math.min(50,+((typeof FORGE!=='undefined'&&FORGE.dmLv)||1)));
  return {n:name,label:x[1],realm:'Human',gr:'Human 1',tc:x[2],ty:CAT_NAME[x[2]]||'',tier:1,g:1,rank:lv*2,il:lv,rar:'Common',price:0,any:1,ds:'Made from '+x[1]+', by the DM\'s word.'}}
let _bpByMat=null;
function bpByMat(){if(!_bpByMat){_bpByMat=new Map();BPS.forEach(b=>b.mats.forEach(m=>{const k=lc(m);if(!_bpByMat.has(k))_bpByMat.set(k,[]);_bpByMat.get(k).push(b)}))}return _bpByMat}
let _monByMat=null;
function monByMat(){if(!_monByMat){_monByMat=new Map();const add=(k,m)=>{k=lc(k);if(!_monByMat.has(k))_monByMat.set(k,[]);const a=_monByMat.get(k);if(!a.includes(m))a.push(m)};
  MONSTERS.forEach(m=>(m.drops||[]).forEach(d=>add(d[0],m)));
  MATS.forEach(x=>(x.from||[]).forEach(f=>{const m=MON_IDX.get(lc(f));if(m)add(x.n,m)}))}return _monByMat}
const GOD_BY_MAT=new Map();GODS.forEach(g=>(g.sig||[]).forEach(s=>{const k=lc(s);if(!GOD_BY_MAT.has(k))GOD_BY_MAT.set(k,[]);GOD_BY_MAT.get(k).push(g)}));
const RUNE_GODS=new Map();GODS.forEach(g=>(g.runes||[]).forEach(r=>{if(!RUNE_GODS.has(r))RUNE_GODS.set(r,[]);RUNE_GODS.get(r).push(g)}));
const CONTESTED=[...RUNE_GODS].filter(([,gs])=>gs.length>1).map(([r])=>r).sort();
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
// ── Runes and the figures behind them ─────────────────────────
// Every Rune: held by gods, channeled by Blueprints, or described in the vault. Each has a progenitor: its original holder,
// who vanished or was killed before the gods arrived (Infinatas and Inane were never lost). Before that, it was the first being to
// embody that principle when Infinatas shaped the realm. Figures are website lore, generated from the Rune's nature.
const RUNE_CAT={
  Emotion:/^(Anger|Belonging|Betrayal|Clarity|Confusion|Depression|Despair|Empathy|Envy|Fear|Grief|Hate|Heartbreak|Hope|Isolation|Lust|Obsession|Pride|Sadness|Scorn|Serenity|Trust|Love|Happiness|Courage|Seduction|Gluttony|Greed|Sloth|Dedication|Loyalty)$/,
  Element:/^(Fire|Water|Lightning|Sky|Tide|Wave|Snow|Frost|Storm|Rain|Air|Typhoon|Sun|Moon|Night|Dark|Dawn|Day|Light|Lava|Heat|Plasma|Star|Swamp|Iron|Diamond|Bloom|Grow|Season|Fruit|Mold|Animal|Forest|Nature)$/,
  Cosmos:/^(Gravity|Cosmic|Void|Zero|Singularity|Dimension|Spin|Symmetry|Entropy|Time|Paradox|Infinite|Existence|Deletion|Decay|Chaos|Order|Beginning|Descend)$/,
  Craft:/^(Forging|Blacksmith|Hammer|Bow|Trade|Commerce|Wealth|Treasure|Art|Music|Entertainment|Weave|Word|Learning|Knowledge|Wisdom|Memory|Aptitude|Unlock|Success|Voyage|Speed)$/,
  Rule:/^(Governance|Diplomacy|Sovereignty|Royalty|Law|Justice|Punish|Martial|Battle|War|Strength|Power|Protect|Protection|Preserve|Purity|Truth)$/,
  Fate:/^(Life|Death|Rebirth|Resurrection|Heal|Regeneration|Nurture|Youth|Famine|Fatigue|Pain|Blood|Necromancy|Fate|Omen|Prophet|Foresee|Vision|Dreams|Probability|Gamble|Curse|Magic|Enchantment|Illusion|Transmutation|Transformation|Divine|Divinity|Reflection|Resistance|Runes|Devil)$/
};
const runeCat=r=>{for(const k in RUNE_CAT)if(RUNE_CAT[k].test(r))return k;return 'Mystery'};
const SPECIAL_FIGURES={
  Infinatas:{fate:'Never lost',fateText:'This Rune has never changed hands. Infinatas is one of the last original gods and has never been usurped. He cannot truly die: if he is killed, Inane unmakes everything, him included, until nothing is left, and then Infinatas returns and creates it all again.',fell:'',remains:'',name:'Infinatas',title:'the Creator of All, the Balance Itself',form:'No fixed form. Those who have felt his attention describe a stillness so complete that time seems to wait for it.',temper:'Infinatas cares for nothing but balance. He creates to restore what Inane destroys, and he lets the gods stay in this realm only because, so far, they have not tipped the scales.',symbol:'A circle with nothing inside it'},
  Creation:{fate:'Never lost',fateText:'This Rune has never changed hands. It belongs to the creator of all things. Killing him only hands the world to Inane; when nothing is left, Infinatas returns and makes it again.',fell:'',remains:'',name:'Infinatas',title:'in its aspect of Creation',form:'Seen, when it is seen at all, as light taking shape before the eye can follow.',temper:'Infinatas keeps the balance by making. Every new thing in Vestige is, in a small way, its answer to Inane.',symbol:'An open hand'},
  Destruction:{fate:'Never lost',fateText:'This Rune has never changed hands. It belongs to the highest being. Inane wakes fully when Infinatas is killed, and then it destroys everything, Infinatas with it, until nothing is left.',fell:'',remains:'',name:'Inane',title:'Infinatas\'s other self',form:'An absence that moves. Places it has passed look worn, as if centuries went by in a breath.',temper:'Inane keeps the same balance as Infinatas, but by unmaking. The gods\' old world eroded under its attention; they never learned what it was.',symbol:'A closed fist'},
  Balance:{fate:'Never lost',fateText:'This Rune has never changed hands. It belongs to the highest being, which cannot be ended: kill one half and the other carries the cycle through to nothing, and then back to creation.',fell:'',remains:'',name:'Infinatas and Inane',title:'the Two Who Are One',form:'Never seen together, yet never apart: where one has been, the other always follows.',temper:'Creation and destruction in equal measure. Balance is the only Rune that both halves of the highest being agree on.',symbol:'A scale with an empty pan on each side'},
  Ignis:{fate:'Killed',fateText:'Ignis fell long before the gods came; its cinders still burn in the Primordial Realm. Its remains count as Primary pieces toward its class.',fell:'Primordial',remains:'Ignis Cinder',name:'Ignis',title:'Progenitor of Fire',form:'A living blaze older than the gods, whose cinders still burn in the Primordial Realm.',temper:'Hungry, generous, and impossible to hold. Its remains count toward the Fire class.',symbol:'A cinder that never cools'},
  Sylph:{fate:'Killed',fateText:'Sylph fell long before the gods came; its last breath still stirs in the Primordial Realm. Its remains count as Primary pieces toward its class.',fell:'Primordial',remains:'Sylph Breath',name:'Sylph',title:'Progenitor of Air',form:'A breath with a will, felt more than seen.',temper:'Restless and free. Its breath, once bottled, counts toward the Air class.',symbol:'A spiral of wind'},
  Undine:{fate:'Killed',fateText:'Undine fell long before the gods came; its tears still lie in the Primordial Realm. Its remains count as Primary pieces toward its class.',fell:'Primordial',remains:'Undine Tear',name:'Undine',title:'Progenitor of Water',form:'A shape of moving water that weeps tears of the first sea.',temper:'Patient and deep. Its tears count toward the Water class.',symbol:'A single tear'},
  Gnome:{fate:'Killed',fateText:'Gnome fell long before the gods came; its bones still lie in the Primordial Realm. Its remains count as Primary pieces toward its class.',fell:'Primordial',remains:'Gnome Knuckle',name:'Gnome',title:'Progenitor of Earth',form:'A shape of stone and root, slow as mountains.',temper:'Stubborn and steadfast. Its knuckle-bones count toward the Earth class.',symbol:'A knuckle of stone'}
};
const SYL=[['Va','Ish','Or','Ael','Ka','Ze','Mor','Thal','Ny','Sel','Bra','Ul','Eir','Quo','Dra','Lio','Ves','Ha','Ry','Ost'],['ra','ka','le','no','the','mi','sa','ri','do','va','lu','ze','ni','ro','sha','ta'],['n','th','el','is','ar','os','une','ael','eth','or','ix','ane','iel','ur','yr','as']];
const FIG_ADJ={Emotion:['Weeping','Burning','Hollow','Tender','Restless','Smiling','Silent','Unquiet'],Element:['Ever-Turning','Untamed','Radiant','Deep','Wild','First','Bright','Endless'],Cosmos:['Unfathomable','Silent','Turning','Unbound','Last','First','Infinite','Folded'],Craft:['Tireless','Patient','Clever','Steady','Gifted','First','Wandering','Watchful'],Rule:['Iron','Crowned','Unbending','Sworn','Stern','Shining','Vigilant','Just'],Fate:['Veiled','Pale','Patient','Thread-Spinning','Unblinking','Twice-Born','Hidden','Quiet'],Mystery:['Nameless','Strange','Hidden','Unknown','Forgotten','Shrouded','Twin-Faced','Quiet']};
const FIG_ROLE={Emotion:'Heart',Element:'Spirit',Cosmos:'Shape',Craft:'Hand',Rule:'Warden',Fate:'Keeper',Mystery:'Shade'};
const FIG_FORM={
  Emotion:['A figure whose face shifts to mirror whoever looks at it, always showing {r}.','A tall, shadowed figure; those near it feel {rl} rise in them unbidden.','A child-sized figure with ancient eyes, wrapped in the colors of {rl}.'],
  Element:['A shape of living {rl}, loosely human, that never stays still.','A towering figure crowned with {rl}, its footsteps leaving marks of its element.','An animal of {rl}, too large and too old to be a beast.'],
  Cosmos:['A rip in the world shaped like a person, through which {rl} shows.','A geometry that hurts to look at, folding around the idea of {rl}.','A robed figure whose outline flickers between here and somewhere else.'],
  Craft:['A broad-handed figure who never stops working, its tools made of {rl} itself.','A wanderer in plain clothes who leaves {rl} in its wake.','A figure of many hands, each busy with a different art of {rl}.'],
  Rule:['An armored figure on a throne of {rl}, its gaze weighing everyone it sees.','A sentinel taller than a gate, holding a standard of {rl}.','A crowned figure whose voice compels silence.'],
  Fate:['A veiled figure holding threads, one of which is always {rl}.','A pale figure who appears at doorways at the moment {rl} arrives.','A figure with an hourglass for a heart, counting out {rl}.'],
  Mystery:['A figure no two witnesses describe the same way.','A shape at the edge of sight that vanishes when looked at directly.','A masked figure; behind the mask, only {rl}.']
};
const FIG_TEMPER={Emotion:'It feeds on {rl} and gives it back a hundredfold. It is drawn to mortals at the height of that feeling, and those it touches rarely forget it.',Element:'It is as fickle or as steady as its element. It favors those who respect {rl} and punishes those who waste it.',Cosmos:'It is barely aware of mortals. It turns the great wheels of {rl}, and the gods who draw on it borrow more than they understand.',Craft:'It loves work done well. It teaches, in dreams, those who devote their lives to {rl}, and despises shortcuts.',Rule:'It is proud and exacting. It lends its strength to those who uphold {rl} and withdraws it the moment they falter.',Fate:'It is patient beyond measure. It knows how every story of {rl} ends and seldom says.',Mystery:'Its purposes are its own. Even the gods who hold {rl} are not sure what it wants.'};
const FIG_SYMBOL={Fire:'A flame',Water:'A wave',Lightning:'A forked bolt',Sky:'An open eye in a cloud',Sun:'A rayed disc',Moon:'A crescent',Night:'A black star',Dark:'A closed eye',Dawn:'A half-risen sun',Day:'A full sun',Light:'A lantern',Death:'A closed door',Life:'A sprouting seed',War:'Crossed blades',Battle:'A broken shield',Love:'Two joined hands',Wisdom:'An owl\'s eye',Knowledge:'An open book',Memory:'A knot in a cord',Time:'An hourglass',Void:'An empty circle',Zero:'A ring with nothing inside',Storm:'A spiral cloud',Music:'A struck string',Trade:'A balanced coin',Wealth:'A stack of coins',Justice:'A drawn sword over a scale',Law:'A sealed scroll',Order:'A square',Chaos:'A broken square',Fate:'A spindle',Dreams:'A sleeping eye',Heal:'A bound wound',Blood:'A single drop',Iron:'An anvil',Forging:'A hammer on an anvil',Hammer:'A hammer',Bow:'A drawn bow',Gravity:'A falling stone',Star:'A seven-pointed star',Hope:'A candle in the dark',Fear:'A shadow larger than its caster',Anger:'A clenched jaw',Pride:'A raised chin',Greed:'A closed hand full of coins',Envy:'A green eye',Lust:'A red ribbon',Gluttony:'An empty plate',Sloth:'A drooping candle',Despair:'A well with no bottom',Grief:'A broken vase'};
function runeFigure(r,gods){
  if(SPECIAL_FIGURES[r])return Object.assign({special:true,cat:runeCat(r)},SPECIAL_FIGURES[r]);
  const h=hashStr('rune:'+r),cat=runeCat(r),rl=r.toLowerCase();
  const name=SYL[0][h%SYL[0].length]+SYL[1][(h>>>5)%SYL[1].length]+SYL[2][(h>>>9)%SYL[2].length];
  const adj=FIG_ADJ[cat][(h>>>13)%FIG_ADJ[cat].length];
  const fill=s=>s.replace(/\{r\}/g,r).replace(/\{rl\}/g,rl);
  const ruinous=/^(Decay|Deletion|Despair|Entropy|Zero|Void|Famine|Curse|Pain|Hate|Scorn|Isolation|Depression)$/.test(r);
  const fell={Emotion:'Chaos',Element:'Primordial',Cosmos:'Inner Void',Craft:'Inner Realm',Rule:'Outer Realm',Fate:'Void',Mystery:'Mysterious'}[cat];
  const killed=ruinous||((h>>>21)&1)===0;
  const gn=gods.map(godKey),place=(REALM[fell]&&REALM[fell].page)||fell;
  const heirs=!gn.length?'No god has taken up its Rune.':gn.length===1?`Its Rune passed to ${gn[0]}.`:gn.length===2?`Its Rune split between ${gn[0]} and ${gn[1]}.`:`Its Rune split among ${gn.slice(0,-1).join(', ')}, and ${gn[gn.length-1]}.`;
  const fateText=ruinous?`Unmade by Inane. Nothing of ${name} was left but the Rune itself. ${heirs}`
    :killed?[`Killed in the age before the gods came, though no record says by whom. ${heirs}`,`Slain in the ${place}, where it had ruled alone for ages. ${heirs}`][(h>>>22)%2]
    :[`Vanished without a trace. Some say it sleeps somewhere in the ${place}; others that it simply stopped. ${heirs}`,`Walked into the ${place} and never returned; its Rune stayed behind. ${heirs}`][(h>>>22)%2];
  return {cat,name,fate:ruinous?'Killed':killed?'Killed':'Vanished',fateText,fell,remains:'',title:`the ${adj} ${FIG_ROLE[cat]} of ${r}`,form:fill(FIG_FORM[cat][(h>>>17)%FIG_FORM[cat].length]),temper:fill(FIG_TEMPER[cat]),symbol:FIG_SYMBOL[r]||`A sigil of ${r}`,
    origin:ruinous?`${name} took shape from what Inane left behind when the gods' old world wore away, and some say it still answers to Inane.`:`When Infinatas shaped this realm, ${name} was the first being to embody ${rl}.`};
}
const RUNE_BP=new Map();
BPS.forEach(b=>{const m=/fragment of ([A-Z][\w' -]*?) directly/.exec(b.ds||'');const r=m&&m[1];if(r){if(!RUNE_BP.has(r))RUNE_BP.set(r,[]);RUNE_BP.get(r).push(b)}
  (b.mats||[]).forEach(n=>{const f=/^Fragment of (.+)$/.exec(n);if(f){if(!RUNE_BP.has(f[1]))RUNE_BP.set(f[1],[]);RUNE_BP.get(f[1]).push(b)}})});
// a Rune note's frontmatter can name a holder who is not a god (Space: Infinatas alone)
const runeHolder=r=>r.note&&r.note.fm&&r.note.fm.holder||'';
// Above the gods (campaign lore): Balance belongs to Infinatas, Destruction to Inane, and Isorropía (Infinatas's third
// personality, in a vessel of its own) keeps a fragment of every Rune of creation.
const CREATION_RUNES=['Creation','Origin','Rebirth','the Original'];
function runeAbove(r){if(r.n==='Balance')return ['Infinatas','Balance belongs to Infinatas. The gods who hold it hold only a share he allows.'];
  if(r.n==='Destruction')return ['Inane','Destruction belongs to Inane, Infinatas\'s other self. The gods who hold it hold only what Inane has not taken back.'];
  if(CREATION_RUNES.includes(r.n)||(r.lin&&r.lin.chain.some(c=>c.n==='Creation')&&r.n!=='Destruction'))return ['Isorropía','Its holders keep it, but Isorropía, Infinatas\'s third personality, holds a fragment of it to keep it in balance.'];return null}
const RUNES=(()=>{const names=new Set([...RUNE_GODS.keys(),...RUNE_BP.keys()]);NOTES.filter(n=>/(^|\/)Runes(\/|$)/i.test(n.f)).forEach(n=>names.add(n.n));
  return [...names].sort().map(n=>{const gods=RUNE_GODS.get(n)||[];const note=NOTES.find(x=>lc(x.n)===lc(n)&&/(^|\/)Runes(\/|$)/i.test(x.f))||null;const fig=runeFigure(n,gods);
    // The vault comes first: a Rune note's frontmatter can set progenitor, progenitorTitle, progenitorForm, progenitorNature,
    // progenitorOrigin, progenitorFate (Killed / Vanished), progenitorFateText, progenitorFell, progenitorRemains, and symbol.
    const fm=note&&note.fm||{},v=k=>fm['progenitor'+k]||fm['figure'+k];
    if(fm.progenitor||fm.figure){fig.name=fm.progenitor||fm.figure;fig.special=true}
    [['Title','title'],['Form','form'],['Nature','temper'],['Origin','origin'],['Fate','fate'],['FateText','fateText'],['Fell','fell'],['Remains','remains']].forEach(([k,f])=>{if(v(k))fig[f]=v(k)});if(fm.symbol)fig.symbol=fm.symbol;
    return {n,gods,contested:gods.length>1,bps:RUNE_BP.get(n)||[],note,fig}})})();
// Lineage from the vault: each Rune note's opening paragraph says where the Law came from
// ("formed from the corpse of [[Ignis]]", "a splinter of [[Dark]]", "[[Gnome]]'s first child", "its own entity").
const RUNE_NOTE=new Map(NOTES.filter(n=>/(^|\/)Runes(\/|$)/i.test(n.f)).map(n=>[lc(n.n),n]));
const NOT_A_LAW=/not a class/i;
const TERM_NAMES=new Set(['class','god','law','spell','runes','rune','mortal','devil','spirit realm']);
const isTerm=n=>{if(TERM_NAMES.has(lc(n.n)))return true;const m=/\*\*D&D class:\*\*([^\n]*)/.exec(n.md);return !!(m&&(NOT_A_LAW.test(m[1])||/^\s*[—-]/.test(m[1]))&&/(realm|race|title|term|umbrella|trait|word)/i.test(m[1]))};
const firstPara=n=>(n.md.split(/\n\s*\n/).find(p=>p.trim()&&!/^#/.test(p.trim()))||'').trim();
const linksIn=t=>{const out=[],re=/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\\?\|[^\]]*)?\]\]/g;let m;while((m=re.exec(t)))out.push(m[1].split('/').pop().trim());return out};
function runeRel(n){
  const t=firstPara(n),links=linksIn(t).filter(x=>RUNE_NOTE.has(lc(x))&&lc(x)!==lc(n.n)&&!isTerm(RUNE_NOTE.get(lc(x))));
  let m;
  if((m=/corpse of \[\[([^\]|]+)/i.exec(t)))return {type:'corpse',prog:m[1].split('/').pop()};
  if(/one of the last original gods/i.test(t))return {type:'original'};
  if(/one of the progenitors/i.test(t))return {type:'progenitor'};
  if((m=/\[\[([^\]|]+)\]\]['’]?s? (?:first |favorite |only )?child|child(?:ren)? of \[\[([^\]|]+)/i.exec(t)))return {type:'child',prog:(m[1]||m[2]).split('/').pop()};
  if(/single, specific entity|never fully killed/i.test(t))return {type:'original'};
  if(/its own entity/i.test(t))return {type:'entity',parents:/formed|siphon|portion/i.test(t)?links.slice(0,2):[]};
  if(/paired opposite|counterpart|opposite of|mirror of|other half|answer to/i.test(t)&&links.length)return {type:'opposite',of:links[0],parents:links.slice(1,2)};
  if(/mortal realm/i.test(t)&&/emotion|masses/i.test(t))return {type:'mortal'};
  return links.length?{type:'derived',parents:links.slice(0,2)}:{type:'unknown'};
}
const PROG_STATUS={Ignis:'Dead: its corpse became the Fire Law',Undine:'Dead: its corpse became the Water Law',Gnome:'Dead: its corpse became the Earth Law',Sylph:'Dead: her corpse became the Air Law',Iron:'Alive, but stuck in the Spirit Realm for unknown reasons',Cosmic:'Never fully killed; siphoned piece by piece',Infinatas:'One of the last original gods; never killed or usurped'};
function runeLineage(name){
  const chain=[],seen=new Set();let cur=name,prog=null,origin='';
  for(let i=0;i<8&&cur&&!seen.has(lc(cur));i++){
    seen.add(lc(cur));const note=RUNE_NOTE.get(lc(cur));if(!note)break;
    const r=runeRel(note);chain.push({n:note.n,rel:r.type});
    if(PROG_STATUS[note.n]&&i>0){prog=note.n;break}
    if(r.type==='child'&&PROG_STATUS[note.n]){prog=note.n;break}
    if(r.type==='corpse'||r.type==='child'){prog=r.prog;break}
    if(r.type==='original'||r.type==='progenitor'){prog=note.n;break}
    if(r.type==='mortal'){origin='Born from the gathered emotion of the Mortal Realm';break}
    if(r.type==='entity'&&!(r.parents||[]).length){prog=note.n;break}
    cur=(r.parents||[])[0];
  }
  return {chain,prog,origin};
}
RUNES.forEach(r=>{if(!r.note){const n=RUNE_NOTE.get(lc(r.n));if(n)r.note=n}const L=runeLineage(r.n);r.lin=L;r.vprog=L.prog&&L.prog!==r.n?L.prog:(L.prog===r.n?r.n:null)});
for(let i=RUNES.length-1;i>=0;i--){if(RUNES[i].note&&isTerm(RUNES[i].note))RUNES.splice(i,1)}
RUNES.forEach((x,i)=>{x._i=i});
const RUNE_IDX=new Map(RUNES.map(r=>[lc(r.n),r]));

TYPES.rune={arr:RUNES,tab:'runes',label:'Rune'};RUNES.forEach((x,i)=>{x._t='rune';x._i=i;x.cat=x.fig.cat});
const strongestMat=b=>{let best=null;b.mats.forEach(n=>{const m=findMat(n);if(m&&m.rank&&(!best||m.rank>best.rank))best=m});return best};

const PROFS={
  Blacksmithing:{icon:'⚒',blurb:'Forges metal weapons and armor. Hell, Heaven, and Void metals need a smith with the matching realm specialty.',abs:['Infernal Forging','Celestial Metallurgy','Void Smithing']},
  Carving:{icon:'🪓',blurb:'Shapes wood, stone, bone, crystal, and dragon parts into weapons, tools, and charms.',abs:['Woodworking','Stonecutting','Bone Carving','Dragon Carving','Crystal Shaping','Tide Craft']},
  Tailoring:{icon:'🧵',blurb:'Works cloth, leather, and hide into armor, cloaks, and enchanted garments.',abs:['Arcane Tailoring','Shadow Weaving']},
  Alchemy:{icon:'⚗',blurb:'Brews potions, poisons, and reagents, including blood-fuelled concoctions.',abs:['Potionmaking','Blood Alchemy']},
  Cooking:{icon:'🍲',blurb:'Prepares meals and rations that grant short buffs, up to spirit-touched feasts.',abs:['Spirit Cooking']},
  Enchanting:{icon:'✶',blurb:'Inscribes sigils and glyphs, binds souls and elements, and restores relics.',abs:['Sigilcraft','Glyph Inscription','Soul Binding','Elemental Binding','Relic Restoration']},
  Engineering:{icon:'⚙',blurb:'Builds clockwork, golems, siege engines, and structures.',abs:['Clockwork Engineering','Golemancy','Siege Engineering','Building','Masonry']},
  Harvesting:{icon:'🌾',blurb:'Gathers ore, stone, crystal, and plants; covers farming, beast taming, mining, and foraging.',abs:['Farming','Beast Taming','Mining','Foraging']},
  Scavenging:{icon:'🦴',blurb:'Strips hide, bone, blood, organs, and essences from corpses.',abs:['Scavenger']},
  Navigation:{icon:'🧭',blurb:'Makes maps, charts, and instruments, up to routes between realms.',abs:['Astral Navigation']},
};

// ════════════════════════════════════════════════════════════════
//  Pins
// ════════════════════════════════════════════════════════════════
let PINS=new Set(store.get('pins',[]));
const pinKey=x=>x._t+'|'+x.n;
const isPinned=x=>PINS.has(pinKey(x));
function togglePin(x){const k=pinKey(x);PINS.has(k)?PINS.delete(k):PINS.add(k);store.set('pins',[...PINS]);toast(PINS.has(k)?'Pinned':'Unpinned')}
function pinnedItems(){const out=[];PINS.forEach(k=>{const [t,...rest]=k.split('|');const n=rest.join('|');const T=TYPES[t];if(!T)return;const x=T.arr.find(y=>y.n===n);if(x)out.push(x)});return out}

// ════════════════════════════════════════════════════════════════
//  Small renderers
// ════════════════════════════════════════════════════════════════
const rarB=r=>r?`<span class="b rar r-${rk(r)}">${esc(r)}</span>`:'';
const realmB=(gr,ex='')=>{const r=realmOf(gr)||gr;return gr?`<span class="b rlm" style="--rc:${rcol(r)}"><span class="sw" style="background:${rcol(r)}"></span>${esc(gr)}${ex}</span>`:''};
function matChip(n,extra){const m=findMat(n);
  if(!m)return `<span class="chip" title="Not in the materials list">${esc(n)}</span>`;
  return `<button class="chip" data-ref="${ref(m)}" title="${esc(m.gr||'')}${m.pn?' · '+esc(m.pn):''}"><span class="sw" style="background:${rcol(m.realm)}"></span>${esc(m.n)}${extra?` <small>${extra}</small>`:''}</button>`}
function refChip(x,label,extra){const t=x&&(x._t==='mat'||x._t==='bp')?typeIdx(x):-1;return `<button class="chip" data-ref="${ref(x)}">${t>=0?symSVG(t,'tsym'):''}${label||esc(x.n)}${extra?` <small>${extra}</small>`:''}</button>`}
const pips=(n,of=5)=>`<span class="pips" title="${n} of ${of}">${Array.from({length:of},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
const kv=rows=>`<div class="kvg">${rows.filter(r=>r&&r[1]!==''&&r[1]!=null).map(([l,v])=>`<div><span>${l}</span><b>${v}</b></div>`).join('')}</div>`;
const blk=(title,body,note)=>body?`<div class="blk"><h4>${title}${note?` <em>${note}</em>`:''}</h4>${body}</div>`:'';
const subSource=s=>{const m=/\(([^()]*?(?:Guide|Handbook|Cauldron|Coast|Tome|Player|Xanathar|Tasha|Volo|Fizban|Mordenkainen|Glory|Book|Explorer|Ravnica|Theros|Wildemount|Strixhaven|Eberron|Spelljammer|Dragonlance|Ravenloft|Planescape|PHB|Acquisitions|Phandelver)[^()]*)\)\s*$/i.exec(s.ds||'');return m?m[1]:'Homebrew'};
const BOOKS={Myth:'Mythology',MM:'Monster Manual',VGM:"Volo's Guide",MTF:"Mordenkainen's Tome",FTD:"Fizban's Treasury",BGG:'Glory of the Giants'};
const crNum=c=>{if(!c)return -1;if(String(c).includes('/')){const [a,b]=c.split('/');return a/b}return +c};

// ════════════════════════════════════════════════════════════════
//  Cards
// ════════════════════════════════════════════════════════════════
// a school's colour (stable per school), for the strip down a spell card
const schCol=sc=>`hsl(${hashStr(String(sc||''))%360} 60% 58%)`;
const CARD={
  prop(x){
    return `<button class="card" style="--strip:var(--gold)" data-ref="${ref(x)}">
      <div class="t"><div class="nm">✧ ${esc(x.n)}</div>${isPinned(x)?'<span class="pin">★</span>':''}</div>
      <div class="badges"><span class="b acc">${esc(x.fam)}</span>${x.mats?`<span class="b">${fmt(x.mats)} materials</span>`:'<span class="b ghost">Not yet on a material</span>'}</div>
      <div class="ds">${esc(x.steps[0].text)}</div>
      <div class="ln" style="color:var(--gold2)">Potency 50: ${esc(x.steps[9].add)}</div>
    </button>`},
  bp(b){
    const sm=b.mats.slice(0,4).map(n=>{const m=findMat(n);return `<span class="chip"><span class="sw" style="background:${m?rcol(m.realm):'var(--muted2)'}"></span>${esc(n)}</span>`}).join('')+(b.mats.length>4?`<span class="chip">+${b.mats.length-4}</span>`:'');
    let line='';
    if(b.dc&&b.dm)line=`<div class="ln"><b class="mono">${esc(b.dc)}</b> ${esc(b.dm)}</div>`;
    else if(b.ac)line=`<div class="ln">AC <b>${esc(b.ac)}</b></div>`;
    return `<button class="card r-${rk(b.r)}" style="--strip:var(--rc)" data-ref="${ref(b)}">
      <div class="t">${artHTML(b)}<div class="nm">${b.mg?'<span style="color:var(--gold)">✦</span> ':''}${esc(b.n)}</div>${isPinned(b)?'<span class="pin">★</span>':''}</div>
      <div class="badges">${b.design?(b.design.peek||b.design.foreign?`<span class="b gold">⚒ Forged by ${esc((b.design.peek||b.design.foreign).by||'another player')}</span>`:'<span class="b gold">✎ Your design</span>'):''}<span class="b acc">${esc(b.pr)}</span><span class="b">Lv ${b.lv}</span>${rarB(b.r)}<span class="b ghost">${esc(b.cat)}</span></div>
      ${line}<div class="ln" style="color:var(--muted)">Worn on: ${esc(wornOn(b))}</div>${b.prop?`<div class="ln">✧ ${esc(b.prop)}</div>`:''}
      ${b.ds?`<div class="ds">${esc(b.ds)}</div>`:''}
      ${sm?`<div class="chips">${sm}</div>`:''}
    </button>`},
  mat(m){
    return `<button class="card" style="--strip:${rcol(m.realm)}" data-ref="${ref(m)}">
      <div class="t">${artHTML(m)}<div class="nm">${esc(m.n)}</div>${isPinned(m)?'<span class="pin">★</span>':''}</div>
      <div class="badges">${realmB(m.gr)}${rarB(m.rar)}<span class="b ghost">${esc(m.ty||m.cat)}</span>${m.gen?'<span class="b blue" title="Generated harvest part: in this app, not yet in the vault">Harvest part</span>':''}${m.cursed?'<span class="b red">☠ Cursed</span>':''}</div>
      ${m.tr?`<div class="ln" style="color:var(--gold2)">◆ <b style="color:var(--gold2)">${esc(m.tr.n)}</b>${m.tr.s?` <span style="color:var(--muted)">· ${m.tr.s==='w'?'weapons':'armor'}</span>`:''}${m.origin&&m.org==='Creature'?` <span style="color:var(--muted)">· from ${esc(m.origin)}</span>`:''}</div>`:''}
      ${m.pn?`<div class="ln">✧ <b>${esc(m.pn)}</b>${m.pot?` · Potency ${m.pot} (rank ${potRank(m.pot)})`:''}</div>`:m.supply?'<div class="ln">Supply · used up in crafting</div>':''}
      <div class="ln">${m.price?`<b>${gp(m.price)}</b>`:favorOf(m)?`<b>${fav(favorOf(m))}</b>`:m.tier>=8?'<span style="color:var(--muted)">Not sold</span>':''}${m.il?` · Item Lv ${m.il}`:''}${m.used?` · in ${fmt(m.used)} blueprints`:''}</div>
      <div class="ds">${esc(m.tr?m.tr.t:(m.ds||m.basic||''))}</div>
    </button>`},
  mon(m){
    // a part named after its creature shows only the part ("Pelt", not "Ape Pelt"); the full name is in the tooltip
    const drops=(m.drops||[]).slice(0,3).map(d=>{const short=d[0].toLowerCase().startsWith(m.n.toLowerCase()+' ')?d[0].slice(m.n.length+1):d[0];return `<span class="chip" title="${esc(d[0])}"><span class="sw" style="background:${rcol(realmOf(d[1]))}"></span>${esc(short)}</span>`}).join('');
    return `<button class="card" style="--strip:${rcol(m.realm)}" data-ref="${ref(m)}">
      <div class="t">${artHTML(m)}<div class="nm">${esc(m.n)}</div>${isPinned(m)?'<span class="pin">★</span>':''}</div>
      <div class="badges">${realmB(m.realm+' '+m.g)}${m.gb?'<span class="b red" title="A god-level beast: CR 26 or more">God-beast</span>':''}${m.cr?`<span class="b">CR ${esc(m.cr)}</span><span class="b ${m.myth?'blue':'ghost'}" title="${esc(BOOKS[m.book]||m.book)}">${esc(m.myth?m.myth+' myth':m.book)}</span>`:`<span class="b">CR ${esc(m.sb?m.sb.cr:'?')}</span><span class="b gold">Homebrew</span>`}</div>
      ${m.sb?`<div class="ln">AC <b>${m.sb.ac}</b> · HP <b>${m.sb.hp}</b> · ${esc(m.sb.sz)} ${esc(m.sb.ty)}${m.sb.lg?' · <b style="color:var(--gold2)">Legendary</b>':''}</div>`:''}
      ${m.hab?`<div class="ln">⌖ ${esc(m.hab)}</div>`:''}
      <div class="ds">${esc(m.txt||m.ds)}</div>
      ${drops?`<div class="chips">${drops}</div>`:''}
    </button>`},
  god(g){
    const runes=(g.runes||[]).map(r=>`<span class="chip"${CONTESTED.includes(r)?' style="border-color:var(--red)" title="Contested Rune"':''}>ᚱ ${esc(r)}</span>`).join('');
    return `<button class="card" style="--strip:${rcol(g.home)}" data-ref="${ref(g)}">
      <div class="t">${artHTML(g)}<div class="nm">${esc(godKey(g))}<div class="ep" style="font-weight:400;font-size:.86rem;margin-top:2px">${esc(godTitle(g))}</div></div>${isPinned(g)?'<span class="pin">★</span>':''}</div>
      <div class="badges"><span class="b acc">${esc(g.grp)}</span>${g.home?realmB(g.home):''}${g.seated!=null?`<span class="b ghost">Hand ${pips(g.seated)}</span>`:''}</div>
      ${runes?`<div class="chips">${runes}</div>`:''}
      ${g.wants?`<div class="ds"><b style="color:var(--text)">Wants:</b> ${esc(g.wants)}</div>`:''}
    </button>`},
  spell(s){
    return `<button class="card" style="--strip:${schCol(s.sc)}" data-ref="${ref(s)}">
      <div class="t"><div class="nm">${esc(s.n)}</div>${isPinned(s)?'<span class="pin">★</span>':''}</div>
      <div class="badges"><span class="b acc">${esc(s.sc)}</span><span class="b ${s.lv===0?'gold':''}">${s.lv===0?'Cantrip':'Level '+s.lv}</span>${s.tier?`<span class="b ghost">${esc(s.tier)}</span>`:''}${(s.cls||[]).slice(0,3).map(c=>`<span class="b green">${esc(c)}</span>`).join('')}</div>
      <div class="ln">${esc(s.ct)} · ${esc(s.rng)} · ${esc(s.dur)}</div>
      ${s.dmg&&s.dmg!=='None'?`<div class="ln mono" style="color:var(--red)">${esc(s.dmg)}</div>`:''}
    </button>`},
  sub(s){
    const src=subSource(s);
    return `<button class="card" data-ref="${ref(s)}">
      <div class="t"><div class="nm">${esc(s.n)}</div>${isPinned(s)?'<span class="pin">★</span>':''}</div>
      <div class="badges"><span class="b acc">${esc(s.par)}</span><span class="b ${src==='Homebrew'?'gold':'ghost'}">${esc(src)}</span></div>
      <div class="ds">${esc(String(s.ds||'').replace(/\s*\([^()]*\)\s*$/,''))}</div>
    </button>`},
  entity(e){
    const p=e.n.split(' - ');
    return `<button class="card" data-ref="${ref(e)}">
      <div class="t">${artHTML(e)}<div class="nm">${esc(p[0])}${p[1]?`<div class="ep" style="font-weight:400;font-size:.86rem;margin-top:2px">${esc(p.slice(1).join(' - '))}</div>`:''}</div>${isPinned(e)?'<span class="pin">★</span>':''}</div>
      <div class="badges"><span class="b acc">${esc(e.grp)}</span></div>
      ${e.ds?`<div class="ds">${esc(e.ds)}</div>`:''}
    </button>`},
};
CARD.demon=CARD.entity;CARD.patron=CARD.entity;
const plainMd=s=>String(s||'').replace(/(^|[^/\w])Atrious\b(?!\/)/g,'$1Vestige').replace(/^#.*$/gm,'').replace(/!\[\[[^\]]*\]\]/g,'').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g,(m,a)=>a.split('/').pop()).replace(/[*_`>|#-]+/g,' ').replace(/\[!\w+\]/g,'').replace(/\s+/g,' ').trim();
CARD.rune=r=>`<button class="card" style="--strip:${r.contested?'var(--red)':r.gods.length?'var(--gold)':'var(--acc)'}" data-ref="${ref(r)}"><div class="t"><div class="nm">ᚱ ${esc(r.n)}</div>${isPinned(r)?'<span class="pin">★</span>':''}</div><div class="ep">${r.vprog?`Progenitor: ${esc(r.vprog)}`:r.lin&&r.lin.origin?esc(r.lin.origin):r.lin&&r.lin.chain.length>1?'From '+esc(r.lin.chain.slice(1).map(c=>c.n).join(' ← ')):`Suggested progenitor: ${esc(r.fig.name)}`}</div><div class="badges"><span class="b acc">${esc(r.cat)}</span>${r.note?'<span class="b green">In the vault</span>':''}${r.vprog?'':`<span class="b ${r.fig.fate==='Killed'?'red':r.fig.fate==='Vanished'?'blue':'gold'}">${esc(r.fig.fate)}</span>`}${r.contested?'<span class="b red">Contested</span>':''}${r.gods.length?`<span class="b gold">${r.gods.length} god${r.gods.length>1?'s':''}</span>`:'<span class="b ghost">Unclaimed</span>'}${r.bps.length?`<span class="b ghost">${r.bps.length} relics</span>`:''}</div>${r.gods.length?`<div class="chips">${r.gods.map(g=>`<span class="chip">${esc(godKey(g))}</span>`).join('')}</div>`:''}<div class="ds">${esc(r.note?plainMd(firstPara(r.note)):r.fig.form)}</div></button>`;
CARD.note=n=>`<button class="card" data-ref="${ref(n)}"><div class="t"><div class="nm">${esc(n.n)}</div>${isPinned(n)?'<span class="pin">★</span>':''}</div><div class="badges"><span class="b acc">${esc(n.f)}</span>${SUPERSEDED[n.n]?'<span class="b gold">Updated on the website</span>':''}</div><div class="ds">${esc(plainMd(n.md).slice(0,260))}</div></button>`;
const card=x=>CARD[x._t](x);

// ════════════════════════════════════════════════════════════════
//  List views (config)
// ════════════════════════════════════════════════════════════════
const uniq=(arr,f)=>[...new Set(arr.map(f).filter(v=>v!==''&&v!=null))];
const opts=(arr,f,sort)=>{const c={};arr.forEach(x=>{const v=f(x);if(v!==''&&v!=null)c[v]=(c[v]||0)+1});let k=Object.keys(c);k.sort(sort||((a,b)=>a.localeCompare(b)));return k.map(v=>[v,`${v} (${fmt(c[v])})`])};
const CT_KINDS=[['a','Action'],['b','Bonus action'],['r','Reaction'],['m','Minutes'],['h','Hours']];
const ctKind=ct=>{ct=lc(ct||'');return /bonus/.test(ct)?'b':/reaction/.test(ct)?'r':/action/.test(ct)?'a':/minute/.test(ct)?'m':/hour/.test(ct)?'h':''};
const realmSort=(a,b)=>((REALM[a]||{}).tier||99)-((REALM[b]||{}).tier||99)||a.localeCompare(b);
// Blueprint item types in groups (the filter, and the Item type sort's order)
const BP_GROUPS={'Weapons':['Sword','Axe','Hammer','Dagger','Spear','Bow','Staff','Ammunition'],'Armor and clothing':['Armor','Shield','Clothing'],
  'Magic':['Focus','Glyph','Talisman','Jewelry','Relic','Arcane Core','Artifact'],'Consumables':['Potion','Poison','Oil & Coating','Food','Explosive'],
  'Gear and tools':['Tool','Navigation','Light Source','Restraint','Instrument','Storage','Vessel','Book','Map'],'Engineering':['Mechanism','Siege Engine','Trap','Vehicle'],
  'Building':['Structure','Fortification'],'Farm and beasts':['Crop','Livestock','Fertilizer','Beast Gear']};
const BP_GROUP_ORDER=Object.values(BP_GROUPS).flat(),bpGroupRank=b=>{const i=BP_GROUP_ORDER.indexOf(b.cat);return i<0?999:i};
// a monster's creature type (the first word of its stat block's type, "fiend (devil)" → Fiend); a spell's damage type
const monType=m=>{const t=String((m.sb&&m.sb.ty)||m.ty||'').trim().split(/[\s(,]/)[0];return t?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():''};
const SIZE_ORDER=['Tiny','Small','Medium','Large','Huge','Gargantuan'];
const DMG_TYPES=['Acid','Bludgeoning','Cold','Fire','Force','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder','Healing'];
const spDmgType=s=>{const d=typeof spellDmg==='function'?spellDmg(s):'';const w=String(d||'').match(/[A-Za-z]+/g)||[];const k=w.map(x=>x.charAt(0).toUpperCase()+x.slice(1).toLowerCase()).find(x=>DMG_TYPES.includes(x));return k||''};
// a monster's level on the Blueprints' scale: its realm's band and its grade (Hell grade 5 is level 25)
const monLevel=m=>((REALM[m.realm]||{tier:1}).tier-1)*10+(+m.g||1);
const LV_BANDS=[[1,10,'Human'],[11,20,'Mysterious'],[21,30,'Hell & Heaven'],[31,40,'Chaos'],[41,50,'Abyss'],[51,60,'Inner Realm'],[61,70,'Outer Realm'],[71,80,'Void'],[81,90,'Inner Void'],[91,100,'Primordial']];

const VIEWS={
  blueprints:{type:'bp',arr:BPS,title:'Blueprints',
    side:{label:'Profession',key:'pr',sub:'sp',order:Object.keys(PROFS)},
    hay:b=>[b.n,b.ds,b.pr,b.sp,b.cat,b.prop,b.mats.join(' ')].join(' '),
    filters:[
      {id:'grp',label:'All item groups',opts:()=>Object.keys(BP_GROUPS).map(g=>[g,g+' ('+fmt(BPS.filter(b=>BP_GROUPS[g].includes(b.cat)).length)+')']),test:(b,v)=>(BP_GROUPS[v]||[]).includes(b.cat)},
      {id:'cat',label:'All item types',opts:()=>opts(BPS,b=>b.cat),test:(b,v)=>b.cat===v},
      {id:'r',label:'All rarities',opts:()=>opts(BPS,b=>b.r,(a,b)=>rarRank(a)-rarRank(b)),test:(b,v)=>b.r===v},
      // levels by the realm whose band they sit in (Blueprints run 1 to 100, ten levels to a realm)
      {id:'lv',label:'All levels',opts:()=>LV_BANDS.map(([lo,hi,r])=>[lo+'-'+hi,`Level ${lo}–${hi} · ${r} (${fmt(BPS.filter(b=>b.lv>=lo&&b.lv<=hi).length)})`]),test:(b,v)=>{const [lo,hi]=v.split('-').map(Number);return b.lv>=lo&&b.lv<=hi}},
      {id:'realm',label:'Any material realm',opts:()=>opts(BPS,b=>realmOf(b.gr),realmSort),test:(b,v)=>realmOf(b.gr)===v},
      {id:'dim',label:'Any dimension',opts:()=>opts(BPS,b=>b.dim),test:(b,v)=>b.dim===v},
      {id:'gen',label:'Any general Blueprint',opts:()=>GEN.map(([n])=>[n,n+' ('+fmt((BP_BY_GEN().get(n)||[]).length)+')']).filter(o=>!/\(0\)$/.test(o[1])),test:(b,v)=>genOf(b)===v},
      {id:'mat',label:'',hidden:true,test:(b,v)=>b.mats.some(m=>lc(m)===lc(v)),chip:v=>'Uses '+v},
    ],
    toggles:[
      {id:'mine',label:'✎ Your designs',test:b=>!!b.design&&!b.design.peek&&!b.design.foreign},
      {id:'mg',label:'✦ Magic',test:b=>!!b.mg},
      {id:'ac',label:'Has AC',test:b=>!!b.ac},
      {id:'prop',label:'Has property',test:b=>!!b.prop},
      {id:'pin',label:'★ Pinned',test:b=>isPinned(b)},
    ],
    sorts:[['name','Name A–Z',byName],['lv','Level ↑',(a,b)=>a.lv-b.lv||byName(a,b)],['lvd','Level ↓',(a,b)=>b.lv-a.lv||byName(a,b)],['rar','Rarity',(a,b)=>rarRank(a.r)-rarRank(b.r)||a.lv-b.lv],
      ['type','Item type',(a,b)=>bpGroupRank(a)-bpGroupRank(b)||String(a.cat).localeCompare(String(b.cat))||a.lv-b.lv||byName(a,b)],['prof','Profession',(a,b)=>String(a.pr).localeCompare(String(b.pr))||String(a.sp||'').localeCompare(String(b.sp||''))||a.lv-b.lv||byName(a,b)],
      ['realm','Realm',(a,b)=>realmSort(realmOf(a.gr)||'Human',realmOf(b.gr)||'Human')||a.lv-b.lv||byName(a,b)]],
  },
  materials:{type:'mat',arr:MATS,title:'Materials',
    side:{label:'Realm',key:'realm',order:REALMS.map(r=>r.n),color:true},
    hay:m=>[m.n,m.ds,m.cat,m.ty,m.prop,m.src,m.use,(m.from||[]).join(' '),m.origin,m.tr?m.tr.n+' '+m.tr.t:''].join(' '),
    filters:[
      {id:'ty',label:'All types',opts:()=>opts(MATS,m=>m.ty||m.cat),test:(m,v)=>(m.ty||m.cat)===v},
      {id:'g',label:'All grades',opts:()=>Array.from({length:10},(_,i)=>[String(i+1),'Grade '+(i+1)+' ('+fmt(MATS.filter(m=>m.g===i+1).length)+')']),test:(m,v)=>m.g===+v},
      {id:'pn',label:'All properties',opts:()=>opts(MATS,m=>m.pn),test:(m,v)=>m.pn===v},
      {id:'rar',label:'All rarities',opts:()=>opts(MATS,m=>m.rar,(a,b)=>rarRank(a)-rarRank(b)),test:(m,v)=>m.rar===v},
      {id:'gen',label:'Vault and harvest parts',opts:()=>[['v','Vault materials ('+fmt(MATS.filter(m=>!m.gen).length)+')'],['g','Harvest parts ('+fmt(MATS.filter(m=>m.gen).length)+')']],test:(m,v)=>v==='g'?!!m.gen:!m.gen},
      {id:'org',label:'Any origin',opts:()=>opts(MATS,m=>m.org),test:(m,v)=>m.org===v},
      {id:'dim',label:'Any dimension',opts:()=>opts(MATS,m=>m.dim||((m.from||[]).map(n=>(MON_IDX.get(lc(n))||{}).dim).find(Boolean))),test:(m,v)=>(m.dim||(m.from||[]).map(n=>(MON_IDX.get(lc(n))||{}).dim).find(Boolean))===v},
      {id:'tr',label:'',hidden:true,test:(m,v)=>!!m.tr&&m.tr.n===v,chip:v=>'Trait: '+v},
    ],
    toggles:[
      {id:'drop',label:'Monster drops',test:m=>!!(m.from&&m.from.length)},
      {id:'gath',label:'Gathered',test:m=>!!m.where},
      {id:'alch',label:'🧪 Alchemy',test:m=>!!alchOf(m)},
      {id:'fx',label:'⚔ Weapon effect',test:m=>!!MAT_FX[m.n]},
      {id:'hastr',label:'Unique trait',test:m=>!!m.tr},
      {id:'pin',label:'★ Pinned',test:m=>isPinned(m)},
    ],
    sorts:[['rank','Rank ↑',(a,b)=>(a.rank||0)-(b.rank||0)||byName(a,b)],['rankd','Rank ↓',(a,b)=>(b.rank||0)-(a.rank||0)||byName(a,b)],['name','Name A–Z',byName],['price','Price ↓',(a,b)=>(b.price||0)-(a.price||0)||byName(a,b)],['used','Most used',(a,b)=>(b.used||0)-(a.used||0)||byName(a,b)],['realm','Realm, then grade',(a,b)=>realmSort(a.realm||'',b.realm||'')||(a.g||0)-(b.g||0)||byName(a,b)],['type','Type',(a,b)=>String(a.ty||a.cat||'').localeCompare(String(b.ty||b.cat||''))||(a.rank||0)-(b.rank||0)||byName(a,b)]],
  },
  bestiary:{type:'mon',arr:MONSTERS,title:'Bestiary',noun:'monsters',
    side:{label:'Realm',key:'realm',order:REALMS.map(r=>r.n),color:true},
    hay:m=>[m.n,m.txt,m.hab,m.realm,(m.drops||[]).map(d=>d[0]).join(' ')].join(' '),
    filters:[
      {id:'src',label:'All sources',opts:()=>[['hb','Homebrew'],...opts(MONSTERS,m=>m.book).map(([v,l])=>[v,l.replace(v,BOOKS[v]||v)])],test:(m,v)=>v==='hb'?!!m.hb:m.book===v},
      {id:'ty',label:'All creature types',opts:()=>opts(MONSTERS,monType),test:(m,v)=>monType(m)===v},
      {id:'sz',label:'All sizes',opts:()=>opts(MONSTERS,m=>m.sb&&m.sb.sz,(a,b)=>SIZE_ORDER.indexOf(a)-SIZE_ORDER.indexOf(b)),test:(m,v)=>!!m.sb&&m.sb.sz===v},
      {id:'lvb',label:'All levels',opts:()=>LV_BANDS.map(([lo,hi,r])=>[lo+'-'+hi,`Level ${lo}–${hi} · ${r} (${fmt(MONSTERS.filter(m=>{const l=monLevel(m);return l>=lo&&l<=hi}).length)})`]),test:(m,v)=>{const [lo,hi]=v.split('-').map(Number),l=monLevel(m);return l>=lo&&l<=hi}},
      {id:'g',label:'All grades',opts:()=>Array.from({length:10},(_,i)=>[String(i+1),'Grade '+(i+1)+' ('+fmt(MONSTERS.filter(m=>m.g===i+1).length)+')']),test:(m,v)=>m.g===+v},
      {id:'myth',label:'Any mythology',opts:()=>opts(MONSTERS,m=>m.myth),test:(m,v)=>m.myth===v},
      {id:'dim',label:'Any dimension',opts:()=>opts(MONSTERS,m=>m.dim),test:(m,v)=>m.dim===v},
      {id:'gb',label:'All creatures',opts:()=>[['gb','God-beasts only'],['kin','God-beasts and their spawn']],test:(m,v)=>v==='gb'?!!m.gb:!!(m.gb||(m.rel||[]).some(n=>{const x=MON_IDX.get(lc(n));return x&&x.gb}))},
    ],
    toggles:[{id:'pin',label:'★ Pinned',test:m=>isPinned(m)}],
    sorts:[['g','Grade ↑',(a,b)=>(a.tier-b.tier)||(a.g-b.g)||byName(a,b)],['gd','Grade ↓',(a,b)=>(b.tier-a.tier)||(b.g-a.g)||byName(a,b)],['name','Name A–Z',byName],['cr','CR ↓',(a,b)=>crNum(b.sb?b.sb.cr:b.cr)-crNum(a.sb?a.sb.cr:a.cr)||byName(a,b)],['lv','Level ↑',(a,b)=>monLevel(a)-monLevel(b)||byName(a,b)],['lvd','Level ↓',(a,b)=>monLevel(b)-monLevel(a)||byName(a,b)],['hp','Hit points ↓',(a,b)=>(+(b.sb||{}).hp||0)-(+(a.sb||{}).hp||0)||byName(a,b)],['type','Creature type',(a,b)=>String(monType(a)).localeCompare(String(monType(b)))||monLevel(a)-monLevel(b)||byName(a,b)]],
  },
  gods:{type:'god',arr:GODS,title:'Gods',
    side:{label:'Pantheon',key:'grp'},
    hay:g=>[g.n,g.ds,(g.runes||[]).join(' '),(g.hand||[]).join(' ')].join(' '),
    filters:[
      {id:'home',label:'Any home realm',opts:()=>opts(GODS,g=>g.home,realmSort),test:(g,v)=>g.home===v},
      {id:'rune',label:'',hidden:true,test:(g,v)=>(g.runes||[]).includes(v),chip:v=>'Holds '+v},
    ],
    toggles:[{id:'rival',label:'Contested Runes',test:g=>(g.runes||[]).some(r=>CONTESTED.includes(r))},{id:'open',label:'Open Finger seats',test:g=>g.seated!=null&&g.seated<5},{id:'pin',label:'★ Pinned',test:g=>isPinned(g)}],
    sorts:[['grp','Pantheon',(a,b)=>a.grp.localeCompare(b.grp)||byName(a,b)],['name','Name A–Z',byName],['seat','Hand size ↓',(a,b)=>(b.seated||0)-(a.seated||0)||byName(a,b)]],
  },
  spells:{type:'spell',arr:SP,title:'Spells',
    side:{label:'School',key:'sc'},
    hay:s=>s.n+' '+s.desc+' '+(s.cls||[]).join(' '),
    filters:[
      {id:'cls',label:'All classes',opts:()=>opts(SP.flatMap(s=>(s.cls||[]).map(c=>({c}))),x=>x.c),test:(s,v)=>(s.cls||[]).includes(v)},
      {id:'lv',label:'All levels',opts:()=>Array.from({length:10},(_,i)=>[String(i),(i?'Level '+i:'Cantrip')+' ('+fmt(SP.filter(s=>s.lv===i).length)+')']),test:(s,v)=>s.lv===+v},
      {id:'dt',label:'Any damage type',opts:()=>opts(SP,spDmgType),test:(s,v)=>spDmgType(s)===v},
      {id:'ct',label:'Any casting time',opts:()=>CT_KINDS.map(([k,l])=>[k,l+' ('+fmt(SP.filter(s=>ctKind(s.ct)===k).length)+')']).filter(o=>!/\(0\)$/.test(o[1])),test:(s,v)=>ctKind(s.ct)===v},
      {id:'tier',label:'Any tier',opts:()=>opts(SP,s=>s.tier),test:(s,v)=>s.tier===v},
      {id:'need',label:'Any realm of magic',opts:()=>[1,2,3,4,5].map(t=>[String(t),`${STAGE_REALMS(t).join(', ')} (${t===1?'any class':'stage '+ROMAN[t-1]}) (${fmt(SP.filter(s=>spellNeed(s)===t).length)})`]).filter(o=>!/\(0\)$/.test(o[1])),test:(s,v)=>spellNeed(s)===+v},
    ],
    toggles:[{id:'rit',label:'Ritual',test:s=>/ritual/i.test(s.ct||'')},{id:'hascls',label:'With classes',test:s=>!!(s.cls&&s.cls.length)},{id:'nodmg',label:'Non-damage',test:s=>!spellScales(s)},{id:'lock',label:'🔒 Needs DM approval',test:s=>!!spellLock(s)},{id:'pin',label:'★ Pinned',test:s=>isPinned(s)}],
    sorts:[['def','Default',null],['name','Name A–Z',byName],['lv','Level ↑',(a,b)=>a.lv-b.lv||byName(a,b)],['lvd','Level ↓',(a,b)=>b.lv-a.lv||byName(a,b)],['sc','School',(a,b)=>String(a.sc||'').localeCompare(String(b.sc||''))||a.lv-b.lv||byName(a,b)],['dmg','Damage ↓',(a,b)=>dmgAvg(spellDmg(b))-dmgAvg(spellDmg(a))||byName(a,b)]],
  },
  subclasses:{type:'sub',arr:SUBS,title:'Subclasses',
    side:{label:'Class',key:'par'},
    hay:s=>s.n+' '+s.ds+' '+s.par,
    filters:[{id:'src',label:'All sources',opts:()=>opts(SUBS,subSource),test:(s,v)=>subSource(s)===v}],
    toggles:[{id:'pin',label:'★ Pinned',test:s=>isPinned(s)}],
    sorts:[['name','Name A–Z',byName]],
  },
  codex:{type:'note',arr:NOTES,title:'Codex',noun:'notes',side:{label:'Folder',key:'f'},hay:n=>n.n+' '+n.f+' '+n.md,filters:[],toggles:[{id:'pin',label:'★ Pinned',test:n=>isPinned(n)}],sorts:[['name','Name A–Z',byName],['folder','Folder',(a,b)=>a.f.localeCompare(b.f)||byName(a,b)]]},
  runes:{type:'rune',arr:RUNES,title:'Runes',side:{label:'Kind',key:'cat'},hay:r=>[r.n,r.vprog||'',r.note?r.note.md:'',r.fig.name,r.fig.title,r.fig.form,r.fig.temper,r.fig.fateText,r.fig.fell,r.gods.map(godKey).join(' ')].join(' '),
    filters:[{id:'pan',label:'Any pantheon',opts:()=>opts(RUNES.flatMap(r=>[...new Set(r.gods.map(g=>g.grp))].map(p=>({p}))),x=>x.p),test:(r,v)=>r.gods.some(g=>g.grp===v)},{id:'god',label:'',hidden:true,test:(r,v)=>r.gods.some(g=>godKey(g)===v),chip:v=>'Held by '+v}],
    toggles:[{id:'vault',label:'In the vault',test:r=>!!r.note},{id:'vprog',label:'Progenitor known',test:r=>!!r.vprog},{id:'killed',label:'Progenitor killed',test:r=>r.fig.fate==='Killed'},{id:'vanished',label:'Progenitor vanished',test:r=>r.fig.fate==='Vanished'},{id:'con',label:'Contested',test:r=>r.contested},{id:'held',label:'Held by a god',test:r=>r.gods.length>0},{id:'free',label:'Unclaimed',test:r=>!r.gods.length},{id:'pin',label:'★ Pinned',test:r=>isPinned(r)}],
    sorts:[['name','Name A–Z',byName],['gods','Most claimed',(a,b)=>b.gods.length-a.gods.length||byName(a,b)],['bps','Most relics',(a,b)=>b.bps.length-a.bps.length||byName(a,b)]]},
  properties:{type:'prop',arr:PROPS,title:'Properties',side:{label:'Family',key:'fam'},hay:x=>[x.n,x.t,x.fam,x.el,x.steps.map(z=>z.add).join(' ')].join(' '),filters:[],toggles:[{id:'pin',label:'★ Pinned',test:x=>isPinned(x)},{id:'carried',label:'Carried by materials',test:x=>x.mats>0}],sorts:[['name','Name A–Z',byName],['mats','Most materials',(a,b)=>b.mats-a.mats||byName(a,b)]]},
  demons:{type:'demon',arr:DEMONS,title:'Demons',side:{label:'Group',key:'grp'},hay:e=>e.n+' '+(e.ds||''),filters:[],toggles:[{id:'pin',label:'★ Pinned',test:e=>isPinned(e)}],sorts:[['def','Default',null],['name','Name A–Z',byName]]},
  patrons:{type:'patron',arr:PATRONS,title:'Patrons',side:{label:'Group',key:'grp'},hay:e=>e.n+' '+(e.ds||''),filters:[],toggles:[{id:'pin',label:'★ Pinned',test:e=>isPinned(e)}],sorts:[['def','Default',null],['name','Name A–Z',byName]]},
};

const COLS={
  prop:[['Name',x=>x.n],['Family',x=>x.fam],['Materials',x=>x.mats],['At Potency 5',x=>x.steps[0].text]],
  bp:[['Name',b=>b.n],['Profession',b=>b.pr],['Specialty',b=>b.sp&&b.sp!==b.pr?b.sp:''],['Type',b=>b.cat],['Level',b=>b.lv],['Rarity',b=>b.r],['Damage',b=>b.dc&&b.dm?b.dc+' '+b.dm:''],['AC',b=>b.ac||''],['Property',b=>b.prop||''],['Forge',b=>'Grade '+ROMAN[forgeReq(b).g-1]],['Material grade',b=>b.gr||''],['Materials',b=>b.mats.join(', ')]],
  mat:[['Name',m=>m.n],['Origin',m=>m.org+(m.origin&&m.org==='Creature'?' · '+m.origin:'')],['Unique trait',m=>m.tr?m.tr.n:''],['Realm',m=>m.realm],['Grade',m=>m.g],['Rank',m=>m.rank],['Item level',m=>m.il],['Type',m=>m.ty||m.cat],['Rarity',m=>m.rar||''],['Property',m=>m.pn||''],['Potency',m=>m.pot||''],['Price (gp)',m=>m.price||'']],
  mon:[['Name',m=>m.n],['Realm',m=>m.realm],['Grade',m=>m.g],['CR',m=>m.sb?m.sb.cr:m.cr||''],['AC',m=>m.sb?m.sb.ac:''],['HP',m=>m.sb?m.sb.hp:''],['Type',m=>m.sb?m.sb.sz+' '+m.sb.ty:''],['Source',m=>m.hb?'Homebrew':m.myth?m.myth+' mythology':(BOOKS[m.book]||m.book)],['Habitat',m=>m.hab||''],['Drops',m=>(m.drops||[]).map(d=>d[0]).join(', ')]],
  god:[['Name',g=>godKey(g)],['Title',g=>godTitle(g)],['Pantheon',g=>g.grp],['Home realm',g=>g.home||''],['Runes',g=>(g.runes||[]).join(', ')],['Hand',g=>g.seated!=null?g.seated+'/5':''],['Signature materials',g=>(g.sig||[]).join(', ')]],
  spell:[['Name',x=>x.n],['School',x=>x.sc],['Level',x=>x.lv],['Casting time',x=>x.ct],['Range',x=>x.rng],['Duration',x=>x.dur],['Damage',x=>x.dmg&&x.dmg!=='None'?x.dmg:''],['Classes',x=>(x.cls||[]).join(', ')]],
  sub:[['Name',x=>x.n],['Class',x=>x.par],['Source',x=>subSource(x)]],
  note:[['Name',n=>n.n],['Folder',n=>n.f]],
  rune:[['Rune',r=>r.n],['Kind',r=>r.cat],['Progenitor (vault)',r=>r.vprog||''],['Lineage (vault)',r=>r.lin?r.lin.chain.map(c=>c.n).join(' <- '):''],['Suggested progenitor',r=>r.fig.name+', '+r.fig.title],['Fate',r=>r.fig.fate],['Held by',r=>r.gods.map(godKey).join(', ')],['Relics',r=>r.bps.length]],
  demon:[['Name',e=>e.n],['Group',e=>e.grp],['Description',e=>e.ds||'']],
  patron:[['Name',e=>e.n],['Group',e=>e.grp],['Description',e=>e.ds||'']],
};
const LIST_COLS=t=>COLS[t].filter(c=>!/Description|Materials|Drops|Signature/.test(c[0]));
const row=x=>`<tr data-ref="${ref(x)}">${LIST_COLS(x._t).map(([,f],i)=>{const v=f(x);return `<td${typeof v==='number'?' class="num"':''} title="${esc(v)}">${i===0&&isPinned(x)?'<span style="color:var(--gold)">★</span> ':''}${esc(v)}</td>`}).join('')}</tr>`;
let VIEWMODE=store.get('viewmode',{});
function setMode(m){VIEWMODE[TAB]=m;store.set('viewmode',VIEWMODE);renderControls();renderList()}
function exportCSV(){
  const V=VIEWS[TAB],cols=COLS[V.type];
  const q=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const csv=[cols.map(c=>q(c[0])).join(',')].concat(LIST.map(x=>cols.map(([,f])=>q(f(x))).join(','))).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));
  a.download='fand-'+TAB+(LIST.length<V.arr.length?'-filtered':'')+'.csv';document.body.appendChild(a);a.click();a.remove();
  toast('Exported '+fmt(LIST.length)+' rows');
}
function randomItem(arr){arr=arr||LIST;if(!arr.length)return;const x=arr[Math.floor(Math.random()*arr.length)];openItem(x)}
const TABS=[
  ['home','Home'],['lore','Lore'],['codex','Codex',NOTES.length],['blueprints','Blueprints',BPS.length],['materials','Materials',MATS.length],['properties','Properties',PROPS.length],['bestiary','Bestiary',MONSTERS.length],
  ['realms','Realms',REALMS.length],['gods','Gods',GODS.length],['runes','Runes',RUNES.length],['professions','Professions',Object.keys(PROFS).length],
  ['spells','Spells',META.counts.spells],['magic','Magic Towers',21],['classes','Classes',Object.keys(typeof STAGES!=='undefined'?STAGES:{}).length],['subclasses','Subclasses',SUBS.length],['demons','Demons',DEMONS.length],['patrons','Patrons',PATRONS.length],
  ['forge','Forge'],['workshop','Workshop'],['craft','Craft'],['shop','Shop'],['party','Party'],['chargen','Character generator'],['sheet','Character sheet'],['encounter','Encounters'],['hooks','Hooks'],['npcs','NPCs'],['prep','Session prep'],['journal','Journal'],['archive','Archive'],['hidden','Hidden classes'],['towers','Towers'],['combat','Combat'],
  ['rules','Rules'],['dice','Dice'],['tools','Tools'],['about','About'],['guide','New player guide'],['help','Help'],['account','Account'],['settings','Settings'],
];
const PAGES={chargen:()=>renderCharGen(),guide:()=>renderGuide(),help:()=>renderHelp(),account:()=>renderAccount(),settings:()=>renderSettings(),home:renderHome,realms:renderRealms,professions:renderProfessions,rules:renderRules,tools:renderTools,dice:()=>renderDice(),about:renderAbout,lore:()=>renderLore(),forge:()=>renderForge(),workshop:()=>renderWorkshop(),craft:()=>renderCraft(),party:()=>renderParty(),sheet:()=>renderSheet(),encounter:()=>renderEncounter(),hooks:()=>renderHooks(),npcs:()=>renderNpcs(),magic:()=>renderMagic(),shop:()=>renderShop(),classes:()=>renderClasses(),prep:()=>renderPrep(),journal:()=>renderJournal(),archive:()=>renderArchive(),hidden:()=>renderHidden(),towers:()=>renderTowers(),combat:()=>renderCombat()};

// ════════════════════════════════════════════════════════════════
//  State & routing
// ════════════════════════════════════════════════════════════════
let TAB='home';
const STATE={};
const st=tab=>STATE[tab]||(STATE[tab]={q:'',side:'',f:{},tg:{},sort:VIEWS[tab]?VIEWS[tab].sorts[0][0]:'',shown:60});
let LIST=[];      // current filtered list (for modal prev/next)

function parseHash(){
  const h=decodeURIComponent(location.hash.replace(/^#\/?/,''));
  const [path,query]=h.split('?');
  const parts=path.split('/');
  const params=new URLSearchParams(query||'');
  return {tab:parts[0]||'',type:parts[1],name:parts.slice(2).join('/'),params};
}
function hashFor(tab,x){return '#/'+tab+(x?'/'+x._t+'/'+encodeURIComponent(x.n):'')}
function go(tab,setup){
  if(SITE&&tab!==SITE.page){location.href=pageUrl(tab)+'#/'+tab+(setup?'?s='+encodeURIComponent(JSON.stringify(setup)):'');return}
  if(setup&&VIEWS[tab]){const s=st(tab);Object.assign(s,{q:'',side:'',f:{},tg:{},shown:60},setup)}
  history.pushState(null,'',hashFor(tab));$('content').dataset.tab='';route();
  $('content').scrollTop=0;
}
function route(){
  const {tab,type,name,params}=parseHash();
  const valid=TABS.some(x=>x[0]===tab);
  if(SITE&&valid&&tab!==SITE.page){location.replace(pageUrl(tab)+location.hash);return}
  const t=SITE?SITE.page:valid?tab:'home';
  const setup=params.get('s');
  if(setup&&VIEWS[t]){try{Object.assign(st(t),{q:'',side:'',f:{},tg:{},shown:60},JSON.parse(setup))}catch(e){}history.replaceState(null,'',hashFor(t));$('content').dataset.tab=''}
  // the sheet can be opened on a character and page ({id, tab}), e.g. from a spell's Add to spells
  if(setup&&t==='sheet'){try{const o=JSON.parse(setup);if(o.id)SHEET_ID=o.id;if(o.tab)SHEET_TAB=o.tab}catch(e){}history.replaceState(null,'',hashFor(t));$('content').dataset.tab=''}
  if(t!==TAB||!$('content').dataset.tab||$('content').dataset.tab!==t){TAB=t;renderTab()}
  if(type&&TYPES[type]){
    const arr=TYPES[type].arr;
    const x=arr.find(y=>y.n===name)||arr.find(y=>lc(y.n)===lc(name))||arr.find(y=>lc(y.n.split(' - ')[0].trim())===lc(name));
    if(x){if(!MODAL_LIST.includes(x)&&LIST.includes(x))MODAL_LIST=LIST;showModal(x)}else hideModal();
  } else hideModal();
}
window.addEventListener('popstate',route);

const NAV_GROUPS=[
  ['World',['lore','realms','towers','gods','runes','demons','patrons','codex']],
  ['Creatures & Materials',['bestiary','materials','properties']],
  ['Items & Crafting',['blueprints','forge','workshop','craft','shop','professions']],
  ['Magic & Classes',['classes','subclasses','hidden','spells','magic']],
  ['Play',['prep','sheet','party','chargen','archive','encounter','hooks','npcs','combat','dice','tools']],
  ['Reference',['guide','rules','help','about','account','settings']],
];
const NAV_BLURB={archive:'Every note in one place: notes, mind maps, contacts, quests, the party notebook and the journal',chargen:'A whole character in one tap, at any level',npcs:'Your roster of named NPCs: faces, factions, voices, and secrets',guide:'Every feature in plain words, and hands-on tutorials for new players',shop:'Buy and sell at a realm\'s market with your character\'s own coin',help:'How to use FAND, and what to do when something looks wrong',prep:'Plan a session: the party, a Tower floor, encounters, and hooks',account:'Sign in, your profile and picture, sync, and campaigns',settings:'Appearance, the assistant\'s API key, and your saved data',magic:'The Magic Towers: one for each school of magic, where spells are taught and sold',classes:'Every class and subclass with its class changes, II to V, levels 1 to 100',sheet:'Create a character on a full sheet worked out with FAND\'s rules',hidden:'Unique, Epic, and Legendary classes unlocked through quests and Towers',towers:'Up to five Towers in every realm, grown from unclaimed Runes',journal:'Session notes that link to the world',hooks:'Story starters from the gods, Runes, and monsters',lore:'Infinatas, the gods, and the history of Vestige',realms:'The eleven realms and their coin',gods:'Pantheons, Runes, Hands, and rivals',runes:'Every Law, its lineage, and its progenitor',demons:'Archdevils, demon princes, and corruptions',patrons:'Warlock patrons',codex:'Every note from the Obsidian vault',bestiary:'Monsters with stat blocks, lore, and drops',materials:'Graded materials, traits, and prices',properties:'Every material property, what Potency does, and what it gains every 5 Potency',blueprints:'Ready-made designs for every profession',forge:'General Blueprints: pick a material for every part',workshop:'Blueprints forged by players, shared for everyone to see',craft:'Plan what to gather and buy',professions:'The ten professions and their specialties',spells:'Spells by school, tier, and class',subclasses:'Official and homebrew subclasses',party:'Characters, gear, contracts, and money',encounter:'Balanced fights by realm and level',combat:'Initiative, HP, and flat AC',dice:'Roll dice, build pools, and save your rolls',tools:'Calculators and converters',rules:'Rules summaries',about:'What FAND has, version by version'};
// Player or DM (Settings, or the first-visit guide): which pages FAND puts first in the menu, on Home, and in the phone bar.
// A DM gets a DM group (hidden classes, session prep, encounters, combat, hooks, Towers); a player gets the Play pages that
// matter at the table first and no Hidden classes entry (the list is the DM's). 'Both' leaves everything as it is.
const ROLES={player:'Player',dm:'Dungeon Master',both:'Both'};
const role=()=>{const r=store.get('role','');return ROLES[r]?r:''};
// pages only the DM opens (with the DM code): left out of the player view's menu
const DM_ONLY=['hidden','shop','npcs'];
const DM_PAGES=['hidden','prep','encounter','combat','hooks','npcs','shop','forge','towers'],PLAYER_FIRST=['sheet','party','dice','journal'];
function navGroups(){const r=role();
  if(r==='dm')return [['DM',DM_PAGES]].concat(NAV_GROUPS.map(([g,ids])=>[g,ids.filter(id=>!DM_PAGES.includes(id)||id==='towers')]));
  if(r==='player')return NAV_GROUPS.map(([g,ids])=>[g,(g==='Play'?PLAYER_FIRST.filter(x=>ids.includes(x)).concat(ids.filter(x=>!PLAYER_FIRST.includes(x))):ids).filter(x=>!DM_ONLY.includes(x))]);
  return NAV_GROUPS}
function setRole(r){store.set('role',ROLES[r]?r:'');renderTabs();if(typeof renderBnav==='function')renderBnav();if(['home','settings','hidden','help'].includes(TAB))renderTab();
  toast(r==='dm'?'DM view: your table tools come first':r==='player'?'Player view: your character comes first':'Showing every page')}
function navGroupOf(t){const g=navGroups().find(([,ids])=>ids.includes(t));return g?g[0]:null}
let NAV_BTN=null,KB_LAST=false;
document.addEventListener('keydown',e=>{if(['Tab','Enter',' ','ArrowDown'].includes(e.key))KB_LAST=true},true);document.addEventListener('pointerdown',()=>{KB_LAST=false},true);
function openNav(g,btn){NAV_BTN=btn;
  const pop=$('navpop'),grp=navGroups().find(x=>x[0]===g);if(!grp)return;
  if(pop.classList.contains('open')&&pop.dataset.g===g){closeNav();return}
  pop.dataset.g=g;
  pop.innerHTML=grp[1].map(id=>{const t=TABS.find(x=>x[0]===id);if(!t)return '';return `<a href="${pageUrl(id)}" data-tab="${id}" role="menuitem" class="${id===TAB?'on':''}">${pgSym(id)}<span><b>${t[1]}</b><small>${esc(NAV_BLURB[id]||'')}</small></span>${t[2]!=null?`<span class="n">${fmt(t[2])}</span>`:''}</a>`}).join('');
  const r=btn.getBoundingClientRect();pop.style.top=(r.bottom+6)+'px';pop.style.setProperty('--navtop',(r.bottom+6)+'px');pop.scrollTop=0;pop.style.left=Math.max(8,Math.min(r.left,innerWidth-Math.min(380,innerWidth*.92)-8))+'px';
  pop.classList.add('open');btn.setAttribute('aria-expanded','true');
  if(KB_LAST)setTimeout(()=>{const a=pop.querySelector('a[role=menuitem]');if(a)a.focus()},0);
}
// keyboard: Tab stays inside an open popup (detail page, picture picker), arrow keys move through an open menu
const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown',e=>{
  const P=$('artpick'),F=$('fmo'),box=F&&!F.hidden?F:P&&!P.hidden?P:$('mbg').classList.contains('open')?$('mbg'):null;
  if(e.key==='Tab'&&box){const f=[...box.querySelectorAll(FOCUSABLE)].filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(!box.contains(document.activeElement)){e.preventDefault();a.focus();return}if(e.shiftKey&&(document.activeElement===a||document.activeElement===$('mtitle'))){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}return}
  const nav=$('navpop');if(nav.classList.contains('open')&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){const L=[...nav.querySelectorAll('a[role=menuitem]')];if(!L.length)return;e.preventDefault();const i=L.indexOf(document.activeElement);
    const j=e.key==='Home'?0:e.key==='End'?L.length-1:e.key==='ArrowDown'?(i+1)%L.length:(i<=0?L.length-1:i-1);L[j].focus()}
},true);
function closeNav(){if($('navpop').contains(document.activeElement)&&NAV_BTN&&document.contains(NAV_BTN))setTimeout(()=>NAV_BTN.focus(),0);$('navpop').classList.remove('open');$('tabs').querySelectorAll('[aria-expanded]').forEach(b=>b.setAttribute('aria-expanded','false'))}
document.addEventListener('mousedown',e=>{if(!e.target.closest('#navpop')&&!e.target.closest('.navg'))closeNav()});
$('navpop').addEventListener('click',e=>{const a=e.target.closest('a[data-tab]');if(!a)return;closeNav();if(SITE||e.ctrlKey||e.metaKey)return;e.preventDefault();go(a.dataset.tab)});
window.addEventListener('resize',closeNav);
function renderTabs(){dmPadBtn();
  const cur=navGroupOf(TAB);
  $('tabs').innerHTML=`<a class="tab${TAB==='home'?' on':''}" href="${pageUrl('home')}" data-tab="home">${pgSym('home')}Home</a>`+navGroups().map(([g,ids])=>{const n=ids.reduce((a,id)=>{const t=TABS.find(x=>x[0]===id);return a+(t&&t[2]||0)},0);return `<span class="navg"><button class="tab${g===cur?' on':''}" data-group="${esc(g)}" aria-haspopup="menu" aria-expanded="false">${pgSym('g:'+g)}${g}${g===cur?`<span class="n">· ${(TABS.find(t=>t[0]===TAB)||[])[1]||''}</span>`:''}<span class="car">▾</span></button></span>`}).join('');
  const on=$('tabs').querySelector('.tab.on');if(on){const T=$('tabs'),r=on.getBoundingClientRect(),tr=T.getBoundingClientRect();if(r.right>tr.right||r.left<tr.left)T.scrollLeft+=r.left-tr.left-16}
}
function renderTabs_flat(){
  $('tabs').innerHTML=TABS.map(([id,label,n])=>`<a class="tab${id===TAB?' on':''}" href="${pageUrl(id)}" data-tab="${id}"${id===TAB?' aria-current="page"':''}>${label}${n!=null?`<span class="n">${fmt(n)}</span>`:''}</a>`).join('');
  const on=$('tabs').querySelector('.on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'});
}
$('tabs').addEventListener('click',e=>{const g=e.target.closest('[data-group]');if(g){e.preventDefault();openNav(g.dataset.group,g);return}const b=e.target.closest('.tab');if(!b||SITE||e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();go(b.dataset.tab)});

// Phones: a bar at the bottom with Home, Search, Dice, your character (the DM gets Combat), and Menu (every page).
const BNAV_ICON={party:'<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5M15 15c2.5 0 4.6 1.6 5.5 5"/>',archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',spells:'<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',bestiary:'<path d="M5 20c0-6 3-11 7-11s7 5 7 11"/><path d="M8 9L6 4l4 3M16 9l2-5-4 3"/><circle cx="10" cy="14" r=".5"/><circle cx="14" cy="14" r=".5"/>',notepad:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',qnote:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',table:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 12h8M12 8v8"/>',rules:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V5.5"/>',encounter:'<path d="M12 3l8 4v5c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V7z"/>',journal:'<path d="M5 3h12a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z"/>',home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',dice:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2v6M3 7l9 5 9-5M12 12v10"/>',sheet:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',combat:'<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5L18 3h3v3l-3.5 8.5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'};
const bIcon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BNAV_ICON[k]}</svg>`;
// what the bottom bar can hold: pages (a link) and actions (a button). Menu is always the last button.
const BNAV_ITEMS={home:['Home','home'],search:['Search','search',()=>openPalette()],dice:['Dice','dice'],sheet:['Character','sheet'],party:['Party','party'],combat:['Combat','combat'],
  archive:['Archive','archive'],journal:['Journal','journal'],spells:['Spells','spells'],bestiary:['Bestiary','bestiary'],encounter:['Encounters','encounter'],rules:['Rules','rules'],
  qnote:['Quick note','qnote',()=>quickNote(typeof sheetChar==='function'&&PARTY.length?(PARTY.find(c=>c.id===SHEET_ID)||PARTY[0]):null)],undo:['Undo','undo',()=>undoDo()],
  notepad:['Notepad','notepad',()=>dmPad()],table:['Table','table',()=>openTable()],quick:['Quick rules','rules',()=>openQuick()]};
const bnavDefault=()=>['home','search','dice',role()==='dm'?'combat':'sheet'];
// your own choice (Settings → Bottom bar), else the default; anything no longer known is skipped
function bnavItems(){const c=store.get('bnav',null);const L=Array.isArray(c)?c.filter(k=>BNAV_ITEMS[k]).slice(0,4):[];return L.length?L:bnavDefault()}
function renderBnav(){const b=$('bnav');if(!b)return;
  b.innerHTML=bnavItems().map(id=>{const [l,ic,act]=BNAV_ITEMS[id];return act?`<button type="button" data-bact="${id}">${bIcon(ic)}<span>${l}</span></button>`:`<a href="${pageUrl(id)}" data-tab="${id}"${TAB===id?' class="on" aria-current="page"':''}>${bIcon(ic)}<span>${l}</span></a>`}).join('')
    +`<button type="button" onclick="openMenuDrawer()" aria-haspopup="dialog">${bIcon('menu')}<span>Menu</span></button>`}
$('bnav').addEventListener('click',e=>{const b=e.target.closest('[data-bact]');if(b){const it=BNAV_ITEMS[b.dataset.bact];if(it&&it[2])it[2]()}});
// Settings: choose the bar's four buttons
function bnavSetHTML(){const cur=bnavItems(),opt=(sel)=>Object.entries(BNAV_ITEMS).filter(([k])=>k!=='notepad'||role()!=='player').map(([k,[l]])=>`<option value="${k}"${k===sel?' selected':''}>${esc(l)}</option>`).join('');
  return `<div class="bnav-set">${[0,1,2,3].map(i=>`<label class="note" style="margin:0">Button ${i+1}<select class="sel" data-bslot="${i}" aria-label="Bottom bar button ${i+1}">${opt(cur[i])}</select></label>`).join('')}<div class="bnav-last note" style="margin:0">Button 5<span class="sel" aria-disabled="true">Menu (always)</span></div></div>
    <div class="bnav-prev" aria-hidden="true">${cur.map(k=>`<span>${bIcon(BNAV_ITEMS[k][1])}<small>${esc(BNAV_ITEMS[k][0])}</small></span>`).join('')}<span>${bIcon('menu')}<small>Menu</small></span></div>
    <div style="margin-top:8px"><button type="button" class="btn" onclick="store.set('bnav',null);renderBnav();renderSettings();toast('Bottom bar back to the usual buttons')">Reset to the usual buttons</button></div>`}
function bnavSet(i,v){const L=bnavItems().slice();const j=L.indexOf(v);if(j>=0&&j!==i)L[j]=L[i];L[i]=v;store.set('bnav',L);renderBnav();renderSettings()}
function openMenuDrawer(){const d=$('mdrawer'),u=typeof CL!=='undefined'&&CL.user;
  d.innerHTML=`<div class="md-h"><b>Menu</b><button type="button" class="icon-btn" onclick="closeMenuDrawer()" aria-label="Close menu">${ICON.x}</button></div>
    <div class="md-quick"><a href="${pageUrl('account')}" data-tab="account">${bIcon('sheet')}<span>${u?'Your account':'Sign in'}</span></a><a href="${pageUrl('settings')}" data-tab="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg><span>Settings</span></a><a href="#" onclick="closeMenuDrawer();openTable();return false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 12h8M12 8v8"/></svg><span>Table screen</span></a><a href="#" onclick="closeMenuDrawer();openQuick();return false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/></svg><span>Quick rules</span></a></div>
    <a class="md-custom" href="${pageUrl('settings')}#set-bar" data-tab="settings" onclick="setTimeout(()=>{const x=$('set-bar');if(x)x.scrollIntoView({block:'start'})},300)">✎ Choose the buttons on this bar</a>
    ${navGroups().map(([g,ids])=>`<div class="md-g"><h4>${esc(g)}</h4><div class="md-grid">${ids.map(id=>{const t=TABS.find(x=>x[0]===id);return t?`<a href="${pageUrl(id)}" data-tab="${id}"${id===TAB?' class="on"':''}><b>${esc(t[1])}</b>${t[2]!=null?`<small>${fmt(t[2])}</small>`:''}</a>`:''}).join('')}</div></div>`).join('')}`;
  d.hidden=false;d.scrollTop=0;const f=d.querySelector('.md-h button');if(f)f.focus()}
function closeMenuDrawer(){$('mdrawer').hidden=true}
['bnav','mdrawer'].forEach(id=>$(id).addEventListener('click',e=>{const a=e.target.closest('a[data-tab]');if(!a)return;closeMenuDrawer();if(SITE||e.ctrlKey||e.metaKey)return;e.preventDefault();go(a.dataset.tab)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('mdrawer').hidden){closeMenuDrawer();e.stopPropagation()}},true);
// Phone gestures: in a window, swipe left or right for the next or previous item and swipe down (from the top) to close it;
// on a page, pull down from the top to refresh it (and sync, when signed in). Inputs and sideways-scrolling tables are left alone.
(function(){const skip=t=>t.closest('input,textarea,select,.tablewrap,.dice-row,.hcx-list,[contenteditable]');
  let g=null;const mb=$('mbg'),md=$('modal');
  mb.addEventListener('touchstart',e=>{if(e.touches.length!==1||skip(e.target)){g=null;return}const t=e.touches[0];g={x:t.clientX,y:t.clientY,t:Date.now(),top:mb.scrollTop<=0,ax:null}},{passive:true});
  mb.addEventListener('touchmove',e=>{if(!g)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;if(g.ax==null&&Math.hypot(dx,dy)>12)g.ax=Math.abs(dx)>Math.abs(dy)*1.3?'x':'y';
    if(g.ax==='x'&&document.querySelector('#modal .mnav'))md.style.transform=`translateX(${dx*.35}px)`;else if(g.ax==='y'&&g.top&&dy>0){md.style.transform=`translateY(${dy*.5}px)`;md.style.opacity=String(Math.max(.4,1-dy/600))}},{passive:true});
  mb.addEventListener('touchend',e=>{if(!g)return;const t=e.changedTouches[0],dx=t.clientX-g.x,dy=t.clientY-g.y,fast=Date.now()-g.t<700;md.style.transition='transform .18s,opacity .18s';md.style.transform='';md.style.opacity='';setTimeout(()=>{md.style.transition=''},200);
    if(g.ax==='x'&&Math.abs(dx)>70&&fast&&document.querySelector('#modal .mnav')){const b=[...document.querySelectorAll('#modal .mnav .btn')][dx<0?1:0];if(b&&!b.disabled)step(dx<0?1:-1)}
    else if(g.ax==='y'&&g.top&&dy>110)closeModal();g=null},{passive:true});
  // pull to refresh
  const C=$('content'),pull=document.createElement('div');pull.className='pull';pull.innerHTML='<span>↓</span><b>Pull to refresh</b>';C.parentNode.insertBefore(pull,C);let p=null;
  C.addEventListener('touchstart',e=>{p=C.scrollTop<=0&&e.touches.length===1&&!skip(e.target)?{y:e.touches[0].clientY,d:0}:null},{passive:true});
  C.addEventListener('touchmove',e=>{if(!p)return;p.d=Math.max(0,e.touches[0].clientY-p.y);if(C.scrollTop>0){p=null;pull.style.height='0';return}const h=Math.min(70,p.d*.45);pull.style.height=h+'px';pull.classList.toggle('ready',p.d>130);pull.querySelector('b').textContent=p.d>130?'Release to refresh':'Pull to refresh'},{passive:true});
  C.addEventListener('touchend',()=>{if(!p)return;const go2=p.d>130;p=null;if(!go2){pull.style.height='0';return}pull.classList.add('busy');pull.querySelector('b').textContent='Refreshing…';
    Promise.resolve(typeof CL!=='undefined'&&CL.user?clSyncNow(true):null).catch(()=>{}).then(()=>{renderTab();toast('Refreshed');pull.style.height='0';pull.classList.remove('busy','ready')})},{passive:true});
})();
function renderTab(){
  renderTabs();renderBnav();
  toggleDrawer(false);
  $('content').dataset.tab=TAB;
  document.title=(TABS.find(t=>t[0]===TAB)||[])[1]+' · FAND';
  if(TAB==='codex'&&!NOTES.length){$('sb').hidden=true;$('ctrl').hidden=true;$('content').innerHTML=`<div class="page"><div class="empty" style="text-align:left;max-width:640px;margin:40px auto"><b>The Codex is empty</b><p>The Codex shows every note from the FAND Obsidian vault. To fill it, run these from the repository's <code>tools</code> folder on the computer that has the vault, then commit and push:</p><pre class="formula">node generators/importvault.js go\nnode generators/buildapp.js go</pre><p class="note">Blueprints, materials, spells, and the Bestiary come from the website's own data and aren't duplicated here. Where a note and the website differ, the website takes priority.</p></div></div>`;return}
  if(VIEWS[TAB]){renderSidebar();renderControls();renderList()}
  else{$('sb').hidden=true;$('ctrl').hidden=true;$('content').innerHTML='';PAGES[TAB]();diceWatch();pageSym()}
  pageArt(TAB);
  $('content').scrollTop=0;
  // a soft fade in when the page changes (not when the same page redraws)
  if(renderTab._last!==TAB){renderTab._last=TAB;const pg=$('content').querySelector('.page');if(pg)pg.classList.add('pg-in')}
  if(typeof tourResume==='function')tourResume();
}

// a "⋯ More" menu for actions that don't need a button of their own (a <details>: closes on a pick or a click outside)
const moreMenu=(items,label)=>`<details class="mmenu"><summary class="btn" aria-label="${esc(label||'More actions')}">⋯ ${esc(label||'More')}</summary><div class="mmenu-p">${items.filter(Boolean).join('')}</div></details>`;
// Escape closes an open More menu and puts the keyboard back on its button
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const d=document.querySelector('details.mmenu[open]');if(!d)return;d.removeAttribute('open');const s=d.querySelector('summary');if(s)s.focus();e.stopPropagation()},true);
// "choose a file" buttons are labels around a hidden file input: let the keyboard reach and press them too
const fileLabels=()=>document.querySelectorAll('label:not([tabindex])').forEach(l=>{if(l.querySelector('input[type=file]')){l.tabIndex=0;l.setAttribute('role','button')}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('label[role=button]')){const i=e.target.querySelector('input[type=file]');if(i){e.preventDefault();i.click()}}});
new MutationObserver(()=>{if(fileLabels.q)return;fileLabels.q=requestAnimationFrame(()=>{fileLabels.q=0;fileLabels()})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{document.querySelectorAll('details.mmenu[open]').forEach(d=>{if(!d.contains(e.target)||e.target.closest('.mmenu-p button,.mmenu-p a,.mmenu-p label input'))setTimeout(()=>d.removeAttribute('open'),0)})});
// a class's crest: its symbol on its colour (the sheet's portrait, the party tabs)
const CLASS_EMO={Barbarian:'🪓',Fighter:'⚔',Paladin:'🛡',Ranger:'🏹',Artificer:'🔧',Bard:'🪕',Cleric:'☀',Druid:'🌲',Monk:'👊',Rogue:'🗡',Warlock:'👁',Sorcerer:'🔥',Wizard:'🧙'};
const CLASS_HUE={Barbarian:8,Fighter:28,Paladin:45,Ranger:110,Artificer:190,Bard:320,Cleric:50,Druid:135,Monk:200,Rogue:260,Warlock:285,Sorcerer:15,Wizard:235};
function classCrest(cls,name,size){const e=CLASS_EMO[cls],i=e&&typeof ART!=='undefined'&&ART.sym?ART.sym[e]:null,h=CLASS_HUE[cls]!=null?CLASS_HUE[cls]:hashStr(name||'?')%360;
  return `<span class="crest" style="--h:${h};${size?`--cs:${size}px`:''}" aria-hidden="true">${i!=null?symSVG(i,'crest-s'):`<b>${esc(String(name||cls||'?').trim().charAt(0).toUpperCase()||'?')}</b>`}</span>`}
// the page's symbol beside its title (the first heading the page draws)
function pageSym(){const C=$('content');if(pageSym.at===C.firstElementChild)return;pageSym.at=C.firstElementChild;if(TAB==='home'||C.querySelector('.fg-hero,.pgsym'))return;const top=C.getBoundingClientRect().top,h=[...C.querySelectorAll('h1,h2,.sec-h h3')].find(x=>x.getBoundingClientRect().top-top<260&&x.offsetParent);if(h)h.insertAdjacentHTML('afterbegin',pgSym(TAB,'pgsym'))}

// ════════════════════════════════════════════════════════════════
//  List engine
// ════════════════════════════════════════════════════════════════
function sideCounts(V){
  if(V._counts)return V._counts;
  const c={},sc={};
  V.arr.forEach(x=>{const k=x[V.side.key]||'Other';c[k]=(c[k]||0)+1;if(V.side.sub&&x[V.side.sub]&&x[V.side.sub]!==k){const s=k+'|'+x[V.side.sub];sc[s]=(sc[s]||0)+1}});
  return V._counts={c,sc};
}
function renderSidebar(){
  const V=VIEWS[TAB],s=st(TAB),{c,sc}=sideCounts(V);
  let keys=Object.keys(c);
  if(V.side.order)keys.sort((a,b)=>{const i=V.side.order.indexOf(a),j=V.side.order.indexOf(b);return (i<0?99:i)-(j<0?99:j)||a.localeCompare(b)});else keys.sort();
  const top=s.side.split('|')[0];
  let h=`<div class="sb-h">${V.side.label}</div><button class="sb-i${s.side?'':' on'}" data-side="">All<span class="c">${fmt(V.arr.length)}</span></button><div class="sb-sep"></div>`;
  keys.forEach(k=>{
    h+=`<button class="sb-i${s.side===k?' on':''}" data-side="${esc(k)}">${V.side.color?`<span class="dot" style="background:${rcol(k)}"></span>`:''}${esc(k)}<span class="c">${fmt(c[k])}</span></button>`;
    if(V.side.sub&&top===k){
      Object.keys(sc).filter(x=>x.startsWith(k+'|')).sort().forEach(x=>{h+=`<button class="sb-i sub${s.side===x?' on':''}" data-side="${esc(x)}">${esc(x.split('|')[1])}<span class="c">${fmt(sc[x])}</span></button>`});
    }
  });
  $('sb').innerHTML=h;$('sb').hidden=false;
}
$('sb').addEventListener('click',e=>{const b=e.target.closest('[data-side]');if(!b)return;const s=st(TAB);s.side=b.dataset.side;s.shown=60;renderSidebar();renderList();updateActive();if(innerWidth<=900)toggleDrawer(false)});

// on a phone the list's filters, sort, and view tools fold behind a Filters button (open stays open between lists)
let CTRL_OPEN=false;
function renderControls(){
  const V=VIEWS[TAB],s=st(TAB);
  if(!V._opts)V._opts={};
  // the first two filters, sort, the view, and the list tools stay in the main row; the other filters and the toggles fold
  // behind "More filters" (on a phone everything but the search and the side filter folds behind "Filters")
  const FV=V.filters.filter(f=>!f.hidden),selA=FV.map(f=>{
    const o=V._opts[f.id]||(V._opts[f.id]=f.opts());
    return `<select class="sel cx${s.f[f.id]?' is-set':''}" data-f="${f.id}" aria-label="${esc(f.label)}"><option value="">${esc(f.label)}</option>${o.map(([v,l])=>`<option value="${esc(v)}"${s.f[f.id]===v?' selected':''}>${esc(l)}</option>`).join('')}</select>`}),selMain=selA.slice(0,2).join(''),sel=selA.slice(2).join('');
  const tg=V.toggles.map(t=>`<button class="btn${s.tg[t.id]?' on':''}" data-tg="${t.id}" aria-pressed="${!!s.tg[t.id]}">${t.label}</button>`).join('');
  const so=V.sorts.length>1?`<select class="sel cx" data-sort aria-label="Sort">${V.sorts.map(([id,l])=>`<option value="${id}"${s.sort===id?' selected':''}>Sort: ${l}</option>`).join('')}</select>`:'';
  $('ctrl').innerHTML=`<button class="btn filters-btn" onclick="toggleDrawer()">${ICON.filter}&nbsp;${V.side.label}</button>
    <div class="field${s.q?' has':''}">${ICON.search}<input id="q" type="search" placeholder="Search ${V.title.toLowerCase()}…" value="${esc(s.q)}" autocomplete="off" spellcheck="false"><button class="clear" aria-label="Clear search" data-clear>×</button></div>
    ${selMain}${so}${selA.length||tg?`<button class="btn more-btn${CTRL_OPEN?' on':''}${sel||tg?' has-rest':''}" type="button" aria-expanded="${CTRL_OPEN}" aria-controls="ctrl-more" onclick="CTRL_OPEN=!CTRL_OPEN;this.closest('.ctrl').classList.toggle('open',CTRL_OPEN);this.classList.toggle('on',CTRL_OPEN);this.setAttribute('aria-expanded',CTRL_OPEN);this.querySelector('.mb-dt').textContent=CTRL_OPEN?'Fewer filters':'More filters'"><span class="mb-ph">Filters</span><span class="mb-dt">${CTRL_OPEN?'Fewer filters':'More filters'}</span><span class="b gold" id="ctrl-n" hidden></span></button>`:''}<div class="ctrl-more" id="ctrl-more">${sel}${tg}</div><span class="seg cx" role="group" aria-label="View"><button class="${VIEWMODE[TAB]==='table'?'':'on'}" onclick="setMode('cards')" title="Card view">Cards</button><button class="${VIEWMODE[TAB]==='table'?'on':''}" onclick="setMode('table')" title="Table view">Table</button></span><button class="btn cx" onclick="randomItem()" title="Open a random item from this list">🎲 Random</button><button class="btn cx" onclick="exportCSV()" title="Download the current list as a spreadsheet">⇩ CSV</button><span class="count" id="cnt"></span><div class="chips-active" id="act"></div>`;
  $('ctrl').hidden=false;$('ctrl').classList.toggle('open',CTRL_OPEN);
  updateActive();
}
let qTimer;
$('ctrl').addEventListener('input',e=>{
  if(e.target.id!=='q')return;
  const s=st(TAB);s.q=e.target.value;s.shown=60;
  e.target.parentNode.classList.toggle('has',!!s.q);
  clearTimeout(qTimer);qTimer=setTimeout(renderList,TAB==='spells'?220:90);
});
$('ctrl').addEventListener('change',e=>{
  const s=st(TAB),t=e.target;
  if(t.dataset.f){s.f[t.dataset.f]=t.value;t.classList.toggle('is-set',!!t.value)}
  else if(t.dataset.sort!==undefined)s.sort=t.value;
  else return;
  s.shown=60;renderList();updateActive();
});
$('ctrl').addEventListener('click',e=>{
  const s=st(TAB),b=e.target.closest('button');if(!b)return;
  if(b.dataset.tg){s.tg[b.dataset.tg]=!s.tg[b.dataset.tg];b.classList.toggle('on');b.setAttribute('aria-pressed',!!s.tg[b.dataset.tg]);s.shown=60;renderList();updateActive()}
  else if(b.dataset.clear!==undefined){s.q='';$('q').value='';b.parentNode.classList.remove('has');s.shown=60;renderList();$('q').focus()}
  else if(b.dataset.rm){const [k,id]=b.dataset.rm.split(':');if(k==='f')delete s.f[id];else if(k==='side')s.side='';else if(k==='q')s.q='';s.shown=60;renderTab()}
  else if(b.dataset.reset!==undefined){Object.assign(s,{q:'',side:'',f:{},tg:{},shown:60});renderTab()}
});
// how many filters are on, on the phone's Filters button
function ctrlBadge(){const el=$('ctrl-n'),V=VIEWS[TAB];if(!el||!V)return;const s=st(TAB),n=V.filters.filter(f=>!f.hidden&&s.f[f.id]).length+V.toggles.filter(t=>s.tg[t.id]).length;el.textContent=n;el.style.display=n?'':'none';el.style.marginLeft='6px'}
function updateActive(){ctrlBadge();
  const V=VIEWS[TAB],s=st(TAB),a=[];
  if(s.side)a.push(['side:',V.side.label+': '+s.side.replace('|',' › ')]);
  V.filters.filter(f=>f.hidden&&s.f[f.id]).forEach(f=>a.push(['f:'+f.id,f.chip(s.f[f.id])]));
  const n=Object.values(s.f).filter(Boolean).length+Object.values(s.tg).filter(Boolean).length+(s.q?1:0)+(s.side?1:0);
  const el=$('act');if(!el)return;
  el.innerHTML=a.map(([k,l])=>`<span class="achip">${esc(l)}<button data-rm="${k}" aria-label="Remove filter">×</button></span>`).join('')+(n>1?`<button class="btn" data-reset style="padding:2px 10px;font-size:.75rem">Clear all</button>`:'')+(n?`<button class="btn sq-save" type="button" onclick="saveSearch()" style="padding:2px 10px;font-size:.75rem" title="Keep this search and its filters on the Home page">☆ Save search</button>`:'');
}
function filtered(){
  const V=VIEWS[TAB],s=st(TAB);
  const words=lc(s.q).split(/\s+/).filter(Boolean);
  const [side,sub]=s.side.split('|');
  const fs=V.filters.filter(f=>s.f[f.id]),ts=V.toggles.filter(t=>s.tg[t.id]);
  let out=V.arr.filter(x=>{
    if(side&&(x[V.side.key]||'Other')!==side)return false;
    if(sub&&x[V.side.sub]!==sub)return false;
    for(const f of fs)if(!f.test(x,s.f[f.id]))return false;
    for(const t of ts)if(!t.test(x))return false;
    if(words.length){const h=x._h||(x._h=lc(V.hay(x)));for(const w of words)if(!h.includes(w))return false}
    return true;
  });
  const so=V.sorts.find(x=>x[0]===s.sort);
  if(words.length){const w0=words.join(' ');const score=x=>{const n=lc(x.n);return n===w0?0:n.startsWith(w0)?1:n.includes(w0)?2:3};out=out.map(x=>[score(x),x]).sort((a,b)=>a[0]-b[0]||(so&&so[2]?so[2](a[1],b[1]):0)).map(x=>x[1])}
  else if(so&&so[2])out.sort(so[2]);
  return out;
}
let io;
function renderList(){
  const V=VIEWS[TAB],s=st(TAB);
  LIST=filtered();
  const n=LIST.length,show=LIST.slice(0,s.shown);
  $('cnt').textContent=n===V.arr.length?`${fmt(n)} ${V.noun||V.title.toLowerCase()}`:`${fmt(n)} of ${fmt(V.arr.length)}`;
  const table=VIEWMODE[TAB]==='table'&&show.length;
  if(table)$('content').innerHTML=`<div class="tablewrap"><table class="t list"><thead><tr>${LIST_COLS(V.type).map(([h])=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${show.map(row).join('')}</tbody></table></div>${n>show.length?`<div class="more" id="more"><button class="btn" onclick="showMore()">Show more · ${fmt(n-show.length)} left</button></div>`:''}`;
  else $('content').innerHTML=(TAB==='gods'&&!s.q&&!s.side?`<div style="margin-bottom:14px">${cosmologyHTML()}</div>`:'')+`<div class="grid">${show.length?show.map(card).join(''):`<div class="empty"><b>Nothing matches</b>Try a different search or clear a filter.<div style="margin-top:12px"><button class="btn" onclick="resetFilters()">Clear filters</button></div></div>`}</div>${n>show.length?`<div class="more" id="more"><button class="btn" onclick="showMore()">Show more · ${fmt(n-show.length)} left</button></div>`:''}`;
  if(io)io.disconnect();
  const m=$('more');if(m&&'IntersectionObserver' in window){io=new IntersectionObserver(es=>{if(es[0].isIntersecting)showMore()},{root:$('content'),rootMargin:'600px'});io.observe(m)}
}
function showMore(){
  const s=st(TAB),from=s.shown;s.shown+=90;
  const table=VIEWMODE[TAB]==='table';
  const add=LIST.slice(from,s.shown).map(table?row:card).join('');
  const g=$('content').querySelector(table?'tbody':'.grid');if(!g)return;
  g.insertAdjacentHTML('beforeend',add);
  const m=$('more');
  if(s.shown>=LIST.length){if(m)m.remove();if(io)io.disconnect()}
  else if(m)m.querySelector('button').textContent=`Show more · ${fmt(LIST.length-s.shown)} left`;
}
function resetFilters(){const s=st(TAB);Object.assign(s,{q:'',side:'',f:{},tg:{},shown:60});renderTab()}
function toggleDrawer(on){const sb=$('sb');const v=on==null?!sb.classList.contains('drawer'):on;sb.classList.toggle('drawer',v);$('scrim').classList.toggle('on',v)}

// global click → open referenced item
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-ref]');if(!el)return;
  const x=deref(el.dataset.ref);if(!x)return;
  e.preventDefault();openItem(x,!!el.closest('#modal'));
});
document.addEventListener('click',e=>{const el=e.target.closest('[data-go]');if(!el)return;e.preventDefault();const setup=el.dataset.setup?JSON.parse(el.dataset.setup):null;closeAll();go(el.dataset.go,setup)});

// ════════════════════════════════════════════════════════════════
//  Modal
// ════════════════════════════════════════════════════════════════
let CUR=null,MODAL_PUSHED=false,MODAL_LIST=[];
function openItem(x,fromModal){
  const h=hashFor(TAB,x);
  if($('mbg').classList.contains('open')||fromModal)history.replaceState({m:1},'',h);
  else{history.pushState({m:1},'',h);MODAL_PUSHED=true}
  MODAL_LIST=(!fromModal&&LIST.includes(x))?LIST:(fromModal?MODAL_LIST:[]);
  showModal(x);
}
function closeAll(){if($('pbg').classList.contains('open'))closePalette();if($('mbg').classList.contains('open')){hideModal();history.replaceState(null,'',hashFor(TAB));MODAL_PUSHED=false}}
function closeModal(){
  if(MODAL_PUSHED&&history.state&&history.state.m){MODAL_PUSHED=false;history.back()}
  else{history.replaceState(null,'',hashFor(TAB));hideModal()}
}
let MODAL_RET=null;
function hideModal(){const ret=MODAL_RET;MODAL_RET=null;setTimeout(()=>{if(ret&&document.contains(ret)&&!$('mbg').classList.contains('open'))try{ret.focus({preventScroll:true})}catch(e){}},0);$('mbg').classList.remove('open');document.body.classList.remove('mopen');CUR=null;CHAMP_FOR=null;document.body.style.overflow=''}
$('mbg').addEventListener('mousedown',e=>{if(e.target===$('mbg'))closeModal()});
function step(d){const i=MODAL_LIST.indexOf(CUR);if(i<0)return;const x=MODAL_LIST[i+d];if(x){history.replaceState({m:1},'',hashFor(TAB,x));showModal(x)}}

// Recently viewed entries (this device), shown on Home and in the search box
function recentAdd(x){if(!x||!x._t||x._t==='note'&&!x.n)return;const k=x._t+'|'+x.n;let r=store.get('recent',[]).filter(z=>z!==k);r.unshift(k);store.set('recent',r.slice(0,16))}
function recentItems(){return store.get('recent',[]).map(k=>{const [t,...rest]=k.split('|'),n=rest.join('|'),T=TYPES[t];return T&&T.arr.find(y=>y.n===n)}).filter(Boolean)}
// Notes on anything: your own note on any monster, Blueprint, god, rule… shown in its window, found by search, and kept in your
// account like the rest of your saved data.
const noteOf=x=>(store.get('notes',{})[pinKey(x)]||{}).t||'';
function noteHTML(x){const t=noteOf(x);return `<details class="mnote"${t?' open':''}><summary>📝 ${t?'Your note':'Add a note'}</summary><textarea class="sel" id="noteTxt" rows="3" placeholder="Only you see this. It's saved as you type.">${esc(t)}</textarea><small id="noteMsg"></small></details>`}
function noteBind(x){const ta=$('noteTxt');if(!ta)return;let tm;ta.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{const N=store.get('notes',{}),v=ta.value.trim(),k=pinKey(x);if(v)N[k]={t:v,at:Date.now()};else delete N[k];store.set('notes',N);$('noteMsg').textContent=v?'Saved':'Note removed';ta.closest('details').querySelector('summary').textContent='📝 '+(v?'Your note':'Add a note')},400)}}
function noteItems(){return Object.entries(store.get('notes',{})).map(([k,v])=>{const [t,...r]=k.split('|'),T=TYPES[t],n=r.join('|');const x=T&&T.arr.find(y=>y.n===n);return x?{x,t:v.t,at:v.at||0}:null}).filter(Boolean).sort((a,b)=>b.at-a.at)}
// Compare: up to 4 Blueprints, monsters, or materials side by side; the tray at the bottom collects them, the table shows
// every stat with the cells that differ highlighted (and the highest number in a row marked).
const CMP_TYPES={bp:[['Category','cat'],['Level','lv'],['Rarity','r'],['Grade','gr'],['Profession','pr'],['Damage',x=>x.dc?x.dc+(x.dm?' '+x.dm:''):''],['Armor Class','ac'],['Property','prop'],['Magic',x=>x.mg?'Yes':'']],
  mon:[['Realm','realm'],['Grade','g'],['CR','cr'],['HP',x=>x.sb&&x.sb.hp],['AC',x=>x.sb&&x.sb.ac],['Body',x=>x.body],['Source','book'],['Homebrew',x=>x.hb?'Yes':'']],
  mat:[['Realm','realm'],['Grade','g'],['Material Rank','rank'],['Item Level','il'],['Rarity','rar'],['Price (gp)','price'],['Type','ty'],['Property','prop'],['Use','use']]};
let CMP=store.get('compare',[]);
const cmpHas=x=>CMP.includes(pinKey(x));
function cmpItems(){return CMP.map(k=>{const [t,...r]=k.split('|');return TYPES[t]&&TYPES[t].arr.find(y=>y.n===r.join('|'))}).filter(Boolean)}
function cmpItemToggle(x){const k=pinKey(x);if(cmpHas(x))CMP=CMP.filter(y=>y!==k);else{const t=CMP[0]&&CMP[0].split('|')[0];if(t&&t!==x._t){CMP=[];toast('Compare holds one kind at a time: started a new comparison')}if(CMP.length>=4){toast('Compare holds up to 4: the oldest was taken out');CMP.shift()}CMP.push(k)}store.set('compare',CMP);cmpTray()}
function cmpTray(){let t=$('ctray');if(!t){t=document.createElement('div');t.id='ctray';t.className='ctray';document.body.appendChild(t)}const L=cmpItems();t.hidden=!L.length;if(!L.length)return;
  t.innerHTML=`<b>⚖ Compare</b>${L.map(x=>`<span class="chip">${esc(x.n.length>22?x.n.slice(0,21)+'…':x.n)}<button type="button" aria-label="Remove ${esc(x.n)}" data-crm="${esc(pinKey(x))}">×</button></span>`).join('')}<button class="btn primary" type="button" data-cgo ${L.length<2?'disabled title="Add at least 2"':''}>Compare ${L.length}</button><button class="btn" type="button" data-cclr>Clear</button>`;
  t.onclick=e=>{const r=e.target.closest('[data-crm]');if(r){CMP=CMP.filter(y=>y!==r.dataset.crm);store.set('compare',CMP);cmpTray();const b=$('cmpBtn');if(b&&CUR)b.classList.toggle('on',cmpHas(CUR));return}if(e.target.closest('[data-cgo]'))openCompare();if(e.target.closest('[data-cclr]')){CMP=[];store.set('compare',CMP);cmpTray()}}}
function openCompare(){const L=cmpItems();if(L.length<2)return;const F=CMP_TYPES[L[0]._t],val=(x,f)=>{const v=typeof f==='function'?f(x):x[f];return v==null?'':v};
  const rows=F.map(([l,f])=>{const vs=L.map(x=>val(x,f));if(vs.every(v=>v===''))return '';const diff=new Set(vs.map(String)).size>1,nums=vs.map(v=>typeof v==='number'?v:/^\d+(\.\d+)?$/.test(String(v))?+v:null),mx=nums.every(n=>n!=null)?Math.max(...nums):null;
    return `<tr><th>${l}</th>${vs.map((v,i)=>`<td class="${diff?'cdiff':''}${mx!=null&&diff&&nums[i]===mx?' cbest':''}">${esc(String(v))||'—'}</td>`).join('')}</tr>`}).join('');
  $('qBox').innerHTML=`<div class="mh"><div class="kind">Compare ${L.length} ${esc(TYPES[L[0]._t].label)}</div><h2 id="qTitle">Side by side</h2><div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div>
    <div class="tablewrap"><table class="t ctab"><thead><tr><th></th>${L.map(x=>`<th><a href="#" data-cop="${esc(pinKey(x))}">${esc(x.n)}</a></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p class="note">Highlighted cells differ; the highest number in a row is marked in green.</p>`;
  $('qBox').style.maxWidth='min(1000px,96vw)';$('qbg').classList.add('open');
  $('qBox').onclick=e=>{const a=e.target.closest('[data-cop]');if(!a)return;e.preventDefault();const x=L.find(y=>pinKey(y)===a.dataset.cop);closeQuick();if(x)openItem(x)}}
// Handouts: a spoiler-free card the DM gives players: a monster's look (no stats or drops), an item, a god, a place, or a
// letter written from scratch. Shown full-screen on this device, shared as a link (the card travels inside the link, so it
// works for anyone), or sent into a campaign, where players see it on Home and get a message the moment it arrives.
function hoText(x){const T=TYPES[x._t]||{label:''},cut=t=>{t=String(t||'').replace(/\s+/g,' ').trim();return t.length>600?t.slice(0,597)+'…':t};
  if(x._t==='mon')return {t:x.n,k:'Creature',b:cut((x.txt?x.txt+' ':'')+(x.realm?'It is found in the '+x.realm+' Realm.':''))};
  if(x._t==='bp')return {t:x.n,k:[x.cat,x.r].filter(Boolean).join(' · ')||'Item',b:cut(x.ds)};
  if(x._t==='mat')return {t:x.n,k:[x.ty,x.realm&&x.realm+' Realm'].filter(Boolean).join(' · ')||'Material',b:cut(x.use||x.ds||'')};
  if(x._t==='god')return {t:godKey(x),k:'God',b:cut(x.ds||x.title||'')};
  return {t:x.n.split(' - ')[0],k:T.label||'',b:cut(x.ds||x.txt||x.md||'')}}
const hoEnc=h=>btoa(unescape(encodeURIComponent(JSON.stringify({t:h.t,k:h.k||'',b:h.b||''})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function hoDec(c){try{const o=JSON.parse(decodeURIComponent(escape(atob(c.replace(/-/g,'+').replace(/_/g,'/')))));return o&&typeof o.t==='string'?{t:o.t.slice(0,120),k:String(o.k||'').slice(0,40),b:String(o.b||'').slice(0,4000)}:null}catch(e){return null}}
const hoLink=h=>(SITE?new URL('index.html',location.href).href:location.href.split('#')[0])+'#handout='+hoEnc(h);
const hoDMCamps=()=>typeof CL!=='undefined'&&CL.user?CL.camps.filter(k=>k.dm===CL.user.id):[];
// a ready-made handout for players: the recent changes that touch their characters, in plain words (the DM edits it before
// sending, and can strike anything their table doesn't use)
const WHATS_NEW=`Recent changes to the rules and the character sheet:

• Spells hit harder in the deeper realms. Spell dice now multiply ×1, ×2, ×6, ×9, ×12, ×16, ×22, ×27, ×32 and ×40 across the ten realms (or your level band, whichever is higher). A Fireball at level 25 is 48d6. The sheet shows each spell's dice.
• A spellcasting focus (wand, orb, staff, amulet) adds to spell damage, Accuracy and save DC, and some boost a school of magic.
• Mage Armor: if you know it and wear no body armor, your sheet adds +3 AC (untick "Mage Armor is up" when it isn't). If you know Shield, the sheet shows your AC with it.
• Stronger item properties: Regenerating heals 5 HP per rank each turn, Lifedrinking deals extra necrotic damage and heals you that much, and Eye Ray fires more often and deals force damage.
• Bonded summons (if the DM gives them to you): up to five summons that level with you, come back after every long rest, and grow by eating monster parts from your inventory. They join combat with you.
• A second people (heritage), a cantrip picker for peoples that choose one, and more people options in the builder.

Tell the DM what feels too strong or too weak.`;
function whatsNewHandout(){openHandout({t:"What's new for players",k:'Notice',b:WHATS_NEW})}
function openHandout(h){h=h||{t:'',k:'Letter',b:''};const camps=hoDMCamps();
  $('qBox').innerHTML=`<div class="mh"><div class="kind">For your players</div><h2 id="qTitle">Handout</h2><div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div>
    <p class="note" style="margin-top:0">Players see only what is written here: change anything that would give too much away.</p>
    <label class="note" style="display:block;margin:0 0 4px">Title</label><input class="sel" id="hoT" maxlength="120" value="${esc(h.t)}" style="max-width:none;width:100%">
    <label class="note" style="display:block;margin:10px 0 4px">Kind <small>(shown above the title)</small></label><input class="sel" id="hoK" maxlength="40" value="${esc(h.k)}" style="max-width:none;width:100%">
    <label class="note" style="display:block;margin:10px 0 4px">Text</label><textarea class="sel" id="hoB" rows="7" maxlength="4000" style="max-width:none;width:100%;resize:vertical;font:inherit">${esc(h.b)}</textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" type="button" data-ho="show">👁 Show on this screen</button><button class="btn" type="button" data-ho="link">🔗 Share link</button>
      ${camps.length?`<span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><select class="sel" id="hoC" style="width:auto">${camps.map(k=>`<option value="${esc(k.id)}">${esc(k.name)}</option>`).join('')}</select><button class="btn primary" type="button" data-ho="send">📜 Send to campaign</button></span>`:''}</div>
    ${camps.length?'':`<p class="note">Run a campaign (Account → Campaigns) to send handouts straight to your players' screens.</p>`}<div class="okline" id="hoMsg"></div>`;
  $('qBox').style.maxWidth='620px';$('qbg').classList.add('open');
  const get=()=>({t:$('hoT').value.trim()||'Handout',k:$('hoK').value.trim(),b:$('hoB').value.trim()});
  $('qBox').onclick=async e=>{const b=e.target.closest('[data-ho]');if(!b)return;const H=get();
    if(b.dataset.ho==='show'){showHandout(H);return}
    if(b.dataset.ho==='link'){const u=hoLink(H);try{if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({title:H.t,url:u});return}}catch(x){}(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{$('hoMsg').textContent='Link copied: anyone who opens it sees this handout.'},()=>{$('hoMsg').textContent=u});return}
    if(b.dataset.ho==='send'){b.disabled=true;const {error}=await CL.sb.rpc('fand_add_handout',{p_campaign:$('hoC').value,p_title:H.t,p_body:H.b,p_kind:H.k});b.disabled=false;
      if(error){$('hoMsg').style.color='var(--red)';$('hoMsg').textContent=/function|schema cache|does not exist/i.test(error.message||'')?'Handouts need the latest database setup: run tools/cloud/schema.sql again in Supabase.':clMsg(error);return}
      closeQuick();toast('Handout sent');hoLoad()}}}
function showHandout(h){let v=$('hoView');if(!v){v=document.createElement('div');v.id='hoView';v.className='hov';v.setAttribute('role','dialog');v.setAttribute('aria-modal','true');document.body.appendChild(v);v.onclick=e=>{if(e.target===v||e.target.closest('[data-hox]'))v.hidden=true}}
  v.innerHTML=`<div class="ho-card">${h.k?`<div class="ho-k">${esc(h.k)}</div>`:''}<h2>${esc(h.t)}</h2><div class="ho-b">${esc(h.b).replace(/\n/g,'<br>')}</div><button type="button" class="btn" data-hox>Close</button></div>`;v.hidden=false}
function hoFromHash(){const m=/[#&]handout=([\w-]+)/.exec(location.hash);if(!m)return;const h=hoDec(m[1]);if(h)showHandout(h)}
window.addEventListener('hashchange',hoFromHash);
document.addEventListener('keydown',e=>{const v=$('hoView');if(e.key==='Escape'&&v&&!v.hidden){v.hidden=true;e.stopPropagation()}},true);
// campaign handouts (needs the campaign_handouts table from schema.sql; without it this stays quiet)
async function hoLoad(){if(typeof CL==='undefined'||!CL.user||!CL.sb||!CL.camps.length){if(typeof CL!=='undefined')CL.handouts=[];return}
  const {data,error}=await CL.sb.from('campaign_handouts').select('id,campaign_id,title,body,kind,created_at').in('campaign_id',CL.camps.map(k=>k.id)).order('created_at',{ascending:false});
  liveLoad().catch(()=>{});trLoad().catch(()=>{});swLoad().catch(()=>{});ltLoad().catch(()=>{});stashLoad().catch(()=>{});
  if(error){CL.handouts=[];return}CL.handouts=(data||[]).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,30);hoSubscribe();if(TAB==='home')renderHome()}
function hoSubscribe(){if(CL.hochan){CL.sb.removeChannel(CL.hochan);CL.hochan=null}const ch=CL.sb.channel('fand-handouts');CL.camps.forEach(k=>ch.on('postgres_changes',{event:'*',schema:'public',table:'campaign_handouts',filter:'campaign_id=eq.'+k.id},hoEvent));CL.hochan=ch.subscribe()}
function hoEvent(p){const r=p.new||{};if(p.eventType==='DELETE'){CL.handouts=(CL.handouts||[]).filter(x=>x.id!==(p.old||{}).id)}else if(r.id&&!(CL.handouts||[]).some(x=>x.id===r.id)){CL.handouts=[r].concat(CL.handouts||[]);const k=CL.camps.find(c=>c.id===r.campaign_id);if(!k||k.dm!==CL.user.id){inboxPush('New handout from your DM: '+r.title,'',{ho:{t:r.title,k:r.kind,b:String(r.body||'').slice(0,4000)}});actToast('New handout from your DM: '+r.title,'Open',()=>showHandout({t:r.title,k:r.kind,b:r.body}))}}if(TAB==='home')renderHome()}
async function hoDelete(id){const {error}=await CL.sb.from('campaign_handouts').delete().match({id});if(error){toast(clMsg(error));return}CL.handouts=CL.handouts.filter(x=>x.id!==id);if(TAB==='home')renderHome();toast('Handout removed')}
function hoHomeHTML(){const v=campView(),L=(typeof CL!=='undefined'&&CL.handouts||[]).filter(h=>!v||v==='solo'||h.campaign_id===v),dm=hoDMCamps().length;if(!L.length&&!dm)return '';
  return `<section class="sec"><div class="sec-h"><h3>Handouts</h3><p>${dm?'What you have shared with your players':'From your DM'}</p>${dm?'<button class="btn" type="button" onclick="openHandout()">📜 New handout</button>':''}</div>${L.length?`<div class="ho-list">${L.slice(0,8).map(h=>{const k=CL.camps.find(c=>c.id===h.campaign_id),mine=k&&k.dm===CL.user.id;return `<div class="ho-item"><button type="button" class="ho-open" onclick='showHandout(${esc(JSON.stringify({t:h.title,k:h.kind,b:h.body}))})'><small>${esc(h.kind||'Handout')}${k?' · '+esc(k.name):''}</small><b>${esc(h.title)}</b></button>${mine?`<button type="button" class="icon-btn" title="Remove for everyone" aria-label="Remove handout" onclick="hoDelete('${esc(h.id)}')">${ICON.x}</button>`:''}</div>`}).join('')}</div>`:'<div class="note">Nothing shared yet. Open any monster, item, or god and tap 📜, or write a new handout.</div>'}</section>`}
