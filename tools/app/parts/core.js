'use strict';
// ════════════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════════════
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const fmt=n=>Number(n||0).toLocaleString();
const gp=n=>n?fmt(n)+' gp':'—';
const rk=r=>String(r||'').replace(/\s+/g,'_');
const lc=s=>String(s||'').toLowerCase();
const by=f=>(a,b)=>{const x=f(a),y=f(b);return x<y?-1:x>y?1:0};
const byName=by(x=>lc(x.n));
const ICON={
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  starf:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  filter:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>'
};
// Dice: any "2d6 + 3" on the site can be clicked to roll it; results also go to the Tools page's dice log.
const DICE_RX=/\b(\d{0,2})d(4|6|8|10|12|20|100)\b(?:\s*([+\-−])\s*(\d{1,3})\b)?/g;
// Rigging (the DM's secret option on the Tools page): the next roll, or every roll until switched off, comes out as set.
// Rigged rolls look exactly like normal ones; only the DM's panel shows that the rig is armed.
const DIE=x=>1+Math.floor(Math.random()*x);
function rigDice(n,x,mod){const g=store.get('dicerig',null);if(!g||!g.mode)return null;
  let r;const half=Math.ceil(x/2);
  if(g.mode==='max')r=Array(n).fill(x);else if(g.mode==='min')r=Array(n).fill(1);
  else if(g.mode==='nat20')r=x===20?Array(n).fill(20):null;else if(g.mode==='nat1')r=x===20?Array(n).fill(1):null;
  else if(g.mode==='high')r=Array.from({length:n},()=>x-Math.floor(Math.random()*(x-half+1)));else if(g.mode==='low')r=Array.from({length:n},()=>1+Math.floor(Math.random()*half));
  else if(g.mode==='total'){let need=Math.max(n,Math.min(n*x,(+g.value||0)-mod));r=Array(n).fill(1);need-=n;const idx=[...r.keys()].sort(()=>Math.random()-.5);while(need>0){for(const i of idx){if(need<=0)break;const add=Math.min(x-r[i],Math.max(1,Math.ceil(Math.random()*Math.min(need,x-r[i]))));if(add>0){r[i]+=add;need-=add}}if(r.every(v=>v===x))break}}
  if(!r)return null;if(g.once)store.set('dicerig',null);if($('dr-rig-state'))rigState();return r}
function rollExpr(e){const m=/^\s*(\d{0,2})d(\d+)(?:\s*([+\-−])\s*(\d+))?\s*$/i.exec(e);if(!m||m[1]==='0'||m[1]==='00'||+m[2]<1)return null;const n=Math.min(50,+m[1]||1),x=+m[2],mod=m[3]?(m[3]==='+'?1:-1)*+m[4]:0;const r=rigDice(n,x,mod)||Array.from({length:n},()=>DIE(x));return {e:e.trim(),r,mod,t:r.reduce((a,b)=>a+b,0)+mod}}
const RIG_MODES=[['','Off (fair dice)'],['nat20','Natural 20 (d20 rolls)'],['nat1','Natural 1 (d20 rolls)'],['max','Maximum on every die'],['min','Minimum on every die'],['high','High (each die in its top half)'],['low','Low (each die in its bottom half)'],['total','Exact total…']];
function rigState(){const g=store.get('dicerig',null),el=$('dr-rig-state');if(!el)return;el.innerHTML=g&&g.mode?`<b style="color:var(--red)">Armed:</b> ${esc((RIG_MODES.find(x=>x[0]===g.mode)||[])[1]||'')}${g.mode==='total'?' '+(+g.value||0):''} · ${g.once?'next roll only':'until switched off'} <a href="#" onclick="store.set('dicerig',null);rigState();return false">disarm</a>`:'Fair dice.'}
function rigSet(){const mode=$('dr-rig').value,once=$('dr-rig-once').checked,value=+$('dr-rig-v').value||0;$('dr-rig-v').style.display=mode==='total'?'':'none';store.set('dicerig',mode?{mode,once,value}:null);rigState()}
// Dice overlay: the dice tumble across the screen, their faces flicker, and they land on the rolled numbers.
// Each die is drawn as a solid seen from the front: its outline, the face turned toward you (where the number sits), and
// the edges running back to the outline. The front face is lit; the faces around it fall into shade.
const DIE_SHAPE={4:'50,6 94,88 6,88',6:'12,12 88,12 88,88 12,88',8:'50,4 92,28 92,72 50,96 8,72 8,28',10:'50,4 94,44 94,58 50,96 6,58 6,44',12:'50,4 77,12.8 93.7,35.8 93.7,64.2 77,87.2 50,96 23,87.2 6.3,64.2 6.3,35.8 23,12.8',20:'50,3 92,26 92,74 50,97 8,74 8,26',100:'50,4 94,44 94,58 50,96 6,58 6,44'};
const DIE_NUM={4:[61,.74],6:[50,1],8:[53,.92],10:[43,.78],12:[50,.8],20:[55,.7],100:[43,.74]};
const dieNumStyle=n=>{const [y,f]=DIE_NUM[n]||[50,1],d=2*(y-50);return `--fs:${f};${d>=0?'padding-top':'padding-bottom'}:${Math.abs(d)}%`};
const DIE_EDGES={4:{f:'50,30 76,78 24,78',l:[[50, 6, 50, 30], [94, 88, 76, 78], [6, 88, 24, 78]]},6:{f:'12,12 88,12 88,88 12,88',l:[]},8:{f:'50,4 92,72 8,72',l:[]},10:{f:'50,4 76,52 50,66 24,52',l:[[24, 52, 6, 58], [76, 52, 94, 58], [50, 66, 50, 96]]},12:{f:'50,25 73.8,42.3 64.7,70.2 35.3,70.2 26.2,42.3',l:[[50.0, 25.0, 50.0, 4.0], [73.8, 42.3, 93.7, 35.8], [64.7, 70.2, 77.0, 87.2], [35.3, 70.2, 23.0, 87.2], [26.2, 42.3, 6.3, 35.8]]},20:{f:'50,24 76,66 24,66',l:[[50, 24, 50, 3], [50, 24, 8, 26], [50, 24, 92, 26], [24, 66, 8, 26], [24, 66, 8, 74], [24, 66, 50, 97], [76, 66, 92, 26], [76, 66, 92, 74], [76, 66, 50, 97]]},100:{f:'50,4 76,52 50,66 24,52',l:[[24, 52, 6, 58], [76, 52, 94, 58], [50, 66, 50, 96]]}};
// Dice styles (the colour and finish of the dice in the rolling animation and the Dice pool), after the dice sold for
// tabletop play: plain colours, metals, gemstones, and resin specials (galaxy, glitter, marble, liquid core, glow).
const DSK=(()=>{const L=(id,name,group,o)=>Object.assign({id,name,group},o);return [
  L('fand','FAND violet','Classic',{grad:['#8b6cf0','#5a3cc4'],stroke:'#fff',ink:'#fff'}),
  L('crimson','Crimson','Classic',{grad:['#e75656','#8e1414'],stroke:'#ffd9d9',ink:'#fff'}),
  L('midnight','Midnight blue','Classic',{grad:['#4467e0','#14204f'],stroke:'#c9d6ff',ink:'#fff'}),
  L('forest','Forest green','Classic',{grad:['#46ad73','#174a2e'],stroke:'#d8f3e3',ink:'#fff'}),
  L('ivory','Bone and ivory','Classic',{grad:['#fdf8ec','#d4c6a4'],stroke:'#8a7a55',ink:'#3b2f1a',sh:'none'}),
  L('onyx','Onyx and gold','Classic',{grad:['#3a3a42','#08080b'],stroke:'#c9a54a',ink:'#f0d27a'}),
  L('gold','Gold','Metal',{metal:['#7a5a10','#f7e08a','#b8902a','#fff3c0','#8a6612'],stroke:'#5a420c',ink:'#4a3507',engrave:1}),
  L('silver','Silver','Metal',{metal:['#6b7078','#f4f6f8','#a9aeb6','#ffffff','#7c8189'],stroke:'#4a4e55',ink:'#2c2f34',engrave:1}),
  L('copper','Copper','Metal',{metal:['#6e3216','#f2a36f','#b5602f','#ffd2b0','#7a3a1a'],stroke:'#4a200c',ink:'#3a1806',engrave:1}),
  L('bronze','Ancient bronze','Metal',{metal:['#3f3416','#b39a52','#6f5f2c','#d8c58a','#4a3e1a'],stroke:'#2c240e',ink:'#efe3b5',patina:1}),
  L('rosegold','Rose gold','Metal',{metal:['#8a4f4a','#f6c7bd','#c78d84','#ffe6df','#9a5c56'],stroke:'#6a3a35',ink:'#5a2e2a',engrave:1}),
  L('gunmetal','Gunmetal','Metal',{metal:['#1e2126','#7d858f','#3a3f46','#a5adb7','#24282d'],stroke:'#0d0f12',ink:'#eef1f4'}),
  L('ruby','Ruby','Gemstone',{gem:['#ff9aa8','#d1103a','#4a0010'],ink:'#fff'}),
  L('sapphire','Sapphire','Gemstone',{gem:['#9dbdff','#1f4fd6','#061650'],ink:'#fff'}),
  L('emerald','Emerald','Gemstone',{gem:['#a6f5c8','#14a35a','#033a1c'],ink:'#fff'}),
  L('amethyst','Amethyst','Gemstone',{gem:['#e8c4ff','#8a3fd6','#280850'],ink:'#fff'}),
  L('obsidian','Obsidian','Gemstone',{gem:['#7a808c','#15161b','#000000'],ink:'#e2e6ee'}),
  L('opal','Opal','Gemstone',{lin:['#f7f4ff','#bfe9ff','#ffd6f0','#d9ffe9','#fff3c9','#e6dcff'],facets:1,stroke:'#ffffff',ink:'#3a3550',sh:'0 1px 0 rgba(255,255,255,.8)'}),
  L('tigerseye',"Tiger's eye",'Gemstone',{bands:['#3a1f07','#c98a2a','#6b3c0d','#f1c060','#4a2808'],facets:1,stroke:'#2a1504',ink:'#fff'}),
  L('lapis','Lapis lazuli','Gemstone',{gem:['#6688e8','#1d3a9a','#0a1747'],flecks:'#e8c45a',ink:'#fff'}),
  L('galaxy','Galaxy','Resin & special',{galaxy:1,stroke:'#cfe8ff',ink:'#fff'}),
  L('stardust','Stardust glitter','Resin & special',{grad:['#33235e','#120a2a'],glitter:'#ffffff',stroke:'#e8dcff',ink:'#fff'}),
  L('marble','White marble','Resin & special',{grad:['#fbfaf7','#d9d6dd'],veins:'#6b6875',stroke:'#6b6875',ink:'#2a2833',sh:'none'}),
  L('dragon','Dragon blood (liquid core)','Resin & special',{grad:['rgba(255,140,110,.55)','rgba(110,10,10,.9)'],core:['#ffd04a','#ff3a1a','#7a0505'],stroke:'#ffd0c4',ink:'#fff'}),
  L('glow','Glow in the dark','Resin & special',{grad:['#e2ffd8','#86e870'],stroke:'#f0ffea',ink:'#1d4a14',sh:'none',glow:'#8dff6a'}),
  L('ice','Frost (clear)','Resin & special',{grad:['rgba(230,245,255,.7)','rgba(120,170,220,.4)'],stroke:'#f0f9ff',ink:'#ffffff',sh:'0 1px 3px rgba(20,60,110,.7)'}),
  L('twotone','Two-tone dusk','Resin & special',{split:['#ff8a3a','#4a2a8a'],stroke:'#fff',ink:'#fff'}),
  L('rainbow','Rainbow prism','Resin & special',{lin:['#ff4d4d','#ffa53a','#ffe14a','#4ad66d','#3ab0ff','#8a5cff'],stroke:'#fff',ink:'#fff'}),
  L('wood','Oak wood','Resin & special',{grad:['#c99358','#8a5a2b'],grain:'#4a2c12',stroke:'#4a2c12',ink:'#2a170a',sh:'0 1px 0 rgba(255,220,170,.55)'}),
  L('bloodmoon','Blood moon','Resin & special',{gem:['#ff7a4a','#8a0a1a','#1a0005'],glitter:'#ffb38a',ink:'#fff'})
]})();
const DSK_IDX=new Map(DSK.map(x=>[x.id,x]));
const dskById=id=>DSK_IDX.get(id)||DSK[0];
const diceSkin=()=>dskById(store.get('diceskin','fand'));
// a die drawn in a style: returns the SVG and the colours for its number
function dieSVG(sides,sk,uid){sk=sk?(typeof sk==='string'?dskById(sk):sk):diceSkin();const P=DIE_SHAPE[sides]||DIE_SHAPE[20],pts=P.split(' ').map(q=>q.split(',').map(Number));
  const cx=pts.reduce((a,q)=>a+q[0],0)/pts.length,cy=pts.reduce((a,q)=>a+q[1],0)/pts.length,id='dk'+uid;let seed=0;for(const ch of id+sk.id)seed=(seed*31+ch.charCodeAt(0))>>>0;
  const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296,stops=a=>a.map((c,i)=>`<stop offset="${Math.round(i/(a.length-1)*100)}%" stop-color="${c}"/>`).join('');
  let defs=`<clipPath id="${id}c"><polygon points="${P}"/></clipPath>`,fill='',over='';
  if(sk.grad||sk.metal||sk.lin){defs+=`<linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1">${stops(sk.grad||sk.metal||sk.lin)}</linearGradient>`;fill=`url(#${id}f)`}
  if(sk.bands){defs+=`<linearGradient id="${id}f" x1="0" y1="0" x2="1" y2=".3" spreadMethod="reflect">${stops(sk.bands)}</linearGradient>`;fill=`url(#${id}f)`}
  if(sk.split){defs+=`<linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="50%" stop-color="${sk.split[0]}"/><stop offset="50%" stop-color="${sk.split[1]}"/></linearGradient>`;fill=`url(#${id}f)`}
  if(sk.gem){defs+=`<radialGradient id="${id}f" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="${sk.gem[0]}"/><stop offset="45%" stop-color="${sk.gem[1]}"/><stop offset="100%" stop-color="${sk.gem[2]}"/></radialGradient>`;fill=`url(#${id}f)`}
  if(sk.galaxy){defs+=`<radialGradient id="${id}f" cx="35%" cy="35%" r="85%"><stop offset="0%" stop-color="#4fe3e0"/><stop offset="35%" stop-color="#5a3ad6"/><stop offset="70%" stop-color="#2a0f5a"/><stop offset="100%" stop-color="#090320"/></radialGradient><filter id="${id}b"><feGaussianBlur stdDeviation="6"/></filter>`;fill=`url(#${id}f)`;
    over+=`<ellipse cx="62" cy="58" rx="26" ry="12" fill="#ff5ad8" opacity=".35" filter="url(#${id}b)" transform="rotate(-25 62 58)"/><ellipse cx="38" cy="40" rx="20" ry="9" fill="#5affef" opacity=".3" filter="url(#${id}b)"/>`;
    for(let k=0;k<26;k++)over+=`<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" r="${(0.4+rnd()*1.3).toFixed(2)}" fill="#fff" opacity="${(0.5+rnd()*0.5).toFixed(2)}"/>`}
  if(sk.veins||sk.grain){const g=!!sk.grain;defs+=`<filter id="${id}v" x="0" y="0" width="100%" height="100%"><feTurbulence type="${g?'turbulence':'fractalNoise'}" baseFrequency="${g?'0.012 0.22':'0.022 0.05'}" numOctaves="${g?2:4}" seed="${Math.floor(rnd()*90)}"/><feColorMatrix type="luminanceToAlpha"/><feComponentTransfer><feFuncA type="table" tableValues="${g?'0 0.55 0 0.55 0 0.55 0':'0 0 0 0.85 0 0 0'}"/></feComponentTransfer><feComposite in="SourceGraphic" operator="in"/></filter>`;
    over+=`<rect x="0" y="0" width="100" height="100" fill="${sk.veins||sk.grain}" filter="url(#${id}v)" opacity="${g?.55:.7}"/>`}
  if(sk.patina)for(let k=0;k<6;k++)over+=`<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" r="${(5+rnd()*9).toFixed(1)}" fill="#4fa58a" opacity=".22"/>`;
  if(sk.core){defs+=`<radialGradient id="${id}k"><stop offset="0%" stop-color="${sk.core[0]}"/><stop offset="55%" stop-color="${sk.core[1]}"/><stop offset="100%" stop-color="${sk.core[2]}" stop-opacity="0"/></radialGradient>`;over+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="26" fill="url(#${id}k)"/>`;for(let k=0;k<14;k++){const a=rnd()*6.283,r=rnd()*18;over+=`<circle cx="${(cx+Math.cos(a)*r).toFixed(1)}" cy="${(cy+Math.sin(a)*r).toFixed(1)}" r="${(0.5+rnd()).toFixed(2)}" fill="#ffe9a8" opacity=".85"/>`}}
  if(sk.glitter)for(let k=0;k<42;k++)over+=`<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" r="${(0.35+rnd()*1.1).toFixed(2)}" fill="${sk.glitter}" opacity="${(0.35+rnd()*0.6).toFixed(2)}"/>`;
  if(sk.flecks)for(let k=0;k<16;k++)over+=`<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" r="${(0.5+rnd()*1.2).toFixed(2)}" fill="${sk.flecks}" opacity=".9"/>`;
  // metals and gems catch more light on the front face (the real edges below give the facets)
  if(sk.metal||sk.gem||sk.facets){const E0=DIE_EDGES[sides]||DIE_EDGES[20];over+=`<polygon points="${E0.f}" fill="rgba(255,255,255,.12)"/>`}
  // the solid: shade the faces around the front face (darker toward the lower right), light the front face, and draw
  // every edge as a pale ridge with a dark seam beside it
  const E=DIE_EDGES[sides]||DIE_EDGES[20];
  if(E){defs+=`<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity=".10"/><stop offset="55%" stop-color="#000" stop-opacity=".16"/><stop offset="100%" stop-color="#000" stop-opacity=".38"/></linearGradient><linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity=".22"/><stop offset="100%" stop-color="#fff" stop-opacity=".02"/></linearGradient>`;
    const seg=l=>l.map(([a,b,c,d])=>`M${a} ${b}L${c} ${d}`).join('');
    over+=`<rect x="0" y="0" width="100" height="100" fill="url(#${id}s)"/><polygon points="${E.f}" fill="url(#${id}t)"/>`
      +`<path d="${seg(E.l)}M${E.f.split(' ').join('L').replace(/,/g,' ')}Z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2.6" stroke-linejoin="round" transform="translate(.8 1)"/>`
      +`<path d="${seg(E.l)}M${E.f.split(' ').join('L').replace(/,/g,' ')}Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.3" stroke-linejoin="round"/>`}
  const stroke=sk.stroke||'rgba(255,255,255,.75)';
  const svg=`<svg viewBox="0 0 100 100" aria-hidden="true"><defs>${defs}</defs><polygon points="${P}" style="fill:${fill||'#6d4bd6'};stroke:none"/><g clip-path="url(#${id}c)">${over}</g><polygon points="${P}" style="fill:none;stroke:rgba(0,0,0,.45);stroke-width:4.5;stroke-linejoin:round"/><polygon points="${P}" style="fill:none;stroke:${stroke};stroke-width:2.2;stroke-linejoin:round"/></svg>`;
  const sh=sk.sh||(sk.engrave?'0 1px 0 rgba(255,255,255,.6), 0 -1px 0 rgba(0,0,0,.35)':'0 2px 4px rgba(0,0,0,.45)');
  return {svg,ink:sk.ink||'#fff',sh,glow:sk.glow||'',num:dieNumStyle(sides)}}
function setDiceSkin(id){const sk=dskById(id);store.set('diceskin',sk.id);toast('Dice style: '+sk.name);document.querySelectorAll('.dsk-grid').forEach(g=>{g.outerHTML=diceSkinGrid(g.dataset.k)});if($('dp-box'))dicePool();
  if(store.get('diceanim',true))diceOverlay({e:'d20 · '+sk.name,t:0,r:[DIE(20)],mod:0,preview:true},20)}
function diceSkinGrid(k){k=k||'g';const cur=diceSkin().id,groups=[...new Set(DSK.map(x=>x.group))];
  return `<div class="dsk-grid" data-k="${k}">${groups.map(g=>`<div class="dsk-group"><div class="dsk-h">${esc(g)}</div><div class="dsk-row">${DSK.filter(x=>x.group===g).map(x=>{const d=dieSVG(20,x,k+x.id);return `<button type="button" class="dsk${x.id===cur?' on':''}" onclick="setDiceSkin('${x.id}')" aria-pressed="${x.id===cur}" title="${esc(x.name)}"><span class="dsk-die" style="${d.glow?`filter:drop-shadow(0 0 6px ${d.glow})`:''}">${d.svg}<b style="color:${d.ink};text-shadow:${d.sh};${d.num}">20</b></span><small>${esc(x.name)}</small></button>`}).join('')}</div></div>`).join('')}</div>`}
// The roll: each die is thrown in from the edge of the screen, tumbles, bounces twice on the table with a shadow beneath it,
// and settles in its place; then the total counts up. Highest faces glow gold and 1s red; a natural 20 bursts, a natural
// 1 shakes. Each bounce clacks (Web Audio, no files) and taps the phone; both can be turned off. Less motion: no throw.
let DICE_AC=null;
function diceClack(v){if(!store.get('dicesound',true))return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;DICE_AC=DICE_AC||new AC();const c=DICE_AC,t=c.currentTime,n=Math.floor(c.sampleRate*.05),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,6);const src=c.createBufferSource();src.buffer=buf;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800+Math.random()*2200;f.Q.value=1.4;const g=c.createGain();g.gain.value=.5*v;src.connect(f).connect(g).connect(c.destination);src.start(t);
  const o=c.createOscillator(),og=c.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(60,t+.06);og.gain.setValueAtTime(.25*v,t);og.gain.exponentialRampToValueAtTime(.001,t+.07);o.connect(og).connect(c.destination);o.start(t);o.stop(t+.08)}catch(e){}}
// keyframes for one throw: flight in an arc from (dx,dy) to the slot, two bounces (squashing on each landing), a short slide, and a wobble
function diceThrow(dx,dy,H,rot){const F=[],S=[],N=46,L1=.46,L2=.66,L3=.8;
  for(let i=0;i<=N;i++){const t=i/N;let x,y,sq=0;
    if(t<=L1){const u=t/L1;x=dx*(1-u)*(1-u*.25)+dx*.04*u;y=dy*(1-u)-H*4*u*(1-u)}
    else if(t<=L2){const u=(t-L1)/(L2-L1);x=dx*.04*(1-u*.6);y=-H*.24*4*u*(1-u)}
    else if(t<=L3){const u=(t-L2)/(L3-L2);x=dx*.016*(1-u*.7);y=-H*.07*4*u*(1-u)}
    else{const u=(t-L3)/(1-L3);x=dx*.005*(1-u);y=0}
    [L1,L2,L3].forEach(l=>{const dd=Math.abs(t-l);if(dd<.03)sq=Math.max(sq,(1-dd/.03)*(l===L1?.16:l===L2?.09:.04))});
    const r=rot*Math.pow(1-Math.min(1,t/.86),2.2)+(t>.8?Math.sin((t-.8)*40)*6*(1-t)/.2:0);
    F.push({offset:t,transform:`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${(1+sq).toFixed(3)},${(1-sq).toFixed(3)})`});
    const h=Math.max(0,-y)/Math.max(1,H),off=t<L1*.5?Math.min(1,t/(L1*.5)):1;S.push({offset:t,transform:`translate(${x.toFixed(1)}px,0) scale(${(1-h*.55).toFixed(3)})`,opacity:((1-h*.75)*off).toFixed(3)})}
  return {F,S,hits:[L1,L2,L3]}}
function diceOverlay(R,sides){
  let ov=$('dice-ov');if(!ov){ov=document.createElement('div');ov.id='dice-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Dice roll');document.body.appendChild(ov);ov.onclick=e=>{if(!e.target.closest('.dice-acts'))ov.classList.remove('on')}}
  const reduce=lessMotion(),shown=R.r.slice(0,12),single20=!R.preview&&R.r.length===1&&(R.sd?R.sd[0]:sides)===20,crit=single20&&R.r[0]===20,fumble=single20&&R.r[0]===1;
  ov.innerHTML=`<div class="dice-box"><div class="dice-row">${shown.map((v,i)=>{const x=(R.sd&&R.sd[i])||sides,d=dieSVG(x,null,'ov'+i),hi=!R.preview&&x>2&&Math.abs(v)===x,lo=!R.preview&&x>2&&Math.abs(v)===1;return `<div class="die-slot${hi?' max':lo?' min':''}"><div class="die-sh"></div><div class="die"${d.glow?` style="filter:drop-shadow(0 0 14px ${d.glow}) drop-shadow(0 6px 10px rgba(0,0,0,.35))"`:''}>${d.svg}<span data-final="${v}" data-sides="${x}" style="color:${d.ink};text-shadow:${d.sh};${d.num}">${Math.abs(v)}</span></div></div>`}).join('')}${R.r.length>12?`<div class="note" style="color:#fff">+${R.r.length-12} more</div>`:''}</div>
    <div class="dice-total${crit?' crit':fumble?' fumble':''}"><span class="dice-expr">${esc(R.e)}</span><b data-total="${R.preview?R.r[0]:R.t}">${R.preview?R.r[0]:R.t}</b><small>${R.r.join(' + ')}${R.mod?(R.mod>0?' + ':' − ')+Math.abs(R.mod):''}${crit?' · natural 20!':fumble?' · natural 1':''}</small></div>
    <div class="dice-acts">${R.again?'<button type="button" data-again>🎲 Roll again</button>':''}<button type="button" data-snd aria-pressed="${store.get('dicesound',true)}" title="Dice sounds">${store.get('dicesound',true)?'🔊':'🔇'}</button></div><div class="note" style="color:#fff9;margin:0">tap anywhere to close</div></div>`;
  const acts=ov.querySelector('.dice-acts');acts.onclick=e=>{if(e.target.closest('[data-again]')){R.again()}else if(e.target.closest('[data-snd]')){const v=!store.get('dicesound',true);store.set('dicesound',v);e.target.closest('[data-snd]').textContent=v?'🔊':'🔇';if(v)diceClack(.6)}};
  ov.classList.add('on');clearTimeout(diceOverlay.t);(diceOverlay.timers||[]).forEach(clearTimeout);diceOverlay.timers=[];
  const tot=ov.querySelector('.dice-total'),totB=tot.querySelector('b'),final=+totB.dataset.total;
  const later=(f,ms)=>diceOverlay.timers.push(setTimeout(f,ms));
  const finish=()=>{tot.classList.add('show');if(!reduce&&!R.preview&&Math.abs(final)>1){const t0=performance.now(),D=380;const step=now=>{const k=Math.min(1,(now-t0)/D);totB.textContent=Math.round(final*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};totB.textContent='0';requestAnimationFrame(step)}
    if(crit&&!reduce){const box=ov.querySelector('.dice-box');for(let i=0;i<22;i++){const sp=document.createElement('i');sp.className='dice-spark';box.appendChild(sp);const a=Math.random()*Math.PI*2,dist=90+Math.random()*120;sp.style.left='50%';sp.style.top='40%';sp.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) scale(.2)`,opacity:0}],{duration:700+Math.random()*400,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'})}if(navigator.vibrate)try{navigator.vibrate([20,40,30])}catch(e){}}
    diceOverlay.t=setTimeout(()=>ov.classList.remove('on'),5500)};
  if(reduce||!ov.animate){finish();return}
  const slots=[...ov.querySelectorAll('.die-slot')];let last=0;
  slots.forEach((sl,i)=>{const die=sl.querySelector('.die'),sh=sl.querySelector('.die-sh'),sp=die.querySelector('span'),b=sl.getBoundingClientRect(),side=i%2?1:-1;
    const dx=side*(innerWidth*.45+Math.random()*innerWidth*.2)+(b.left+b.width/2-innerWidth/2)*-.3,dy=innerHeight-b.top+60+Math.random()*80,H=Math.min(innerHeight*.32,180+Math.random()*90),rot=-side*(560+Math.random()*540);
    const T=1050+Math.random()*250,delay=i*70+Math.random()*60,{F,S,hits}=diceThrow(dx,dy,H,rot);last=Math.max(last,delay+T);
    die.animate(F,{duration:T,delay,easing:'linear',fill:'backwards'});sh.animate(S,{duration:T,delay,easing:'linear',fill:'backwards'});
    die.classList.add('moving');const sides2=+sp.dataset.sides||sides,fin=Math.abs(+sp.dataset.final);
    const fl=setInterval(()=>{sp.textContent=1+Math.floor(Math.random()*sides2)},70);diceOverlay.timers.push(fl);
    hits.forEach((h,k)=>later(()=>{diceClack(k===0?1:k===1?.55:.25);if(k===0&&navigator.vibrate)try{navigator.vibrate(8)}catch(e){}},delay+T*h));
    later(()=>{clearInterval(fl);sp.textContent=fin;die.classList.remove('moving');die.classList.add('landed');if(sl.classList.contains('max')||sl.classList.contains('min')){const r=document.createElement('div');r.className='die-ring';if(sl.classList.contains('min'))r.style.borderColor='rgba(255,100,100,.8)';sl.appendChild(r)}},delay+T*hits[2])});
  later(finish,last-120);
}
// A mix of dice and numbers, like 2d6+1d8+3 or 4d6-1d4: each dice term is rolled with rollExpr (so the DM rig still applies)
function rollMulti(e){const src=String(e||'').replace(/−/g,'-').replace(/\s+/g,'');if(!src)return null;const one=rollExpr(src);if(one)return one;
  const terms=src.match(/[+\-]?[^+\-]+/g);if(!terms)return null;let r=[],sd=[],mod=0,first=0;
  // the DM rig covers the whole mixed roll: a 'next roll only' rig is spent once, after every term; an exact total is spread over the dice
  const g=store.get('dicerig',null),tot=g&&g.mode==='total';if(g&&g.mode)store.set('dicerig',tot?null:{...g,once:false});
  try{for(const t of terms){const sg=t[0]==='-'?-1:1,body=t.replace(/^[+\-]/,'');if(/^\d+$/.test(body)){mod+=sg*+body;continue}if(!/^\d{0,2}d\d+$/i.test(body))return null;const R=rollExpr(body),x=+(/d(\d+)/i.exec(body)||[])[1];if(!first)first=x;r=r.concat(R.r.map(v=>sg*v));sd=sd.concat(R.r.map(()=>sg*x))}}
  finally{if(g&&g.mode)store.set('dicerig',g.once?null:g)}
  if(!r.length)return null;
  if(tot){const lo=sd.reduce((a,x)=>a+(x>0?1:x),0),hi=sd.reduce((a,x)=>a+(x>0?x:-1),0),want=Math.max(lo,Math.min(hi,(+g.value||0)-mod));let left=want-lo;r=sd.map(x=>{if(x>0){const k=Math.min(x-1,left);left-=k;return 1+k}const k=Math.min(-x-1,left);left-=k;return x+k})}
  if($('dr-rig-state'))rigState();return {e:src.replace(/([+\-])/g,' $1 ').trim(),r,mod,t:r.reduce((a,b)=>a+b,0)+mod,sides:first,sd:sd.map(Math.abs)}}
function rollShow(e,label){const R=rollMulti(e);if(R&&label)R.e=label+' · '+R.e;if(!R){if(String(e||'').trim())toast('Not a roll: try 2d6+3');return}const log=store.get('dicelog',[]);log.unshift({e:R.e,t:R.t,r:R.r,mod:R.mod});store.set('dicelog',log.slice(0,50));
  const sides=R.sides||+(/d(\d+)/i.exec(R.e)||[])[1]||20;if(store.get('diceanim',true))diceOverlay(Object.assign(R,{again:()=>rollShow(e,label)}),sides);else toast(`🎲 ${R.e}: ${R.t}  (${R.r.join(' + ')}${R.mod?(R.mod>0?' + ':' − ')+Math.abs(R.mod):''})`);if($('dl-log'))diceLog()}
function diceify(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('input,textarea,select,button,a,.dice,script,style')?NodeFilter.FILTER_REJECT:(DICE_RX.lastIndex=0,DICE_RX.test(n.nodeValue))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});const ns=[];while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(n=>{const f=document.createDocumentFragment();let last=0;const t=n.nodeValue;DICE_RX.lastIndex=0;let m;while((m=DICE_RX.exec(t))){f.append(t.slice(last,m.index));const sp=document.createElement('span');sp.className='dice';sp.textContent=m[0];sp.title='Click to roll';f.append(sp);last=m.index+m[0].length}f.append(t.slice(last));n.replaceWith(f)})}
document.addEventListener('click',e=>{const d=e.target.closest('.dice');if(d){e.preventDefault();e.stopPropagation();rollShow(d.textContent)}},true);
function diceLog(){const L=store.get('dicelog',[]);$('dl-log').innerHTML=L.length?L.map(x=>`<div style="display:flex;gap:8px;font-size:.88rem"><b style="width:44px;text-align:right">${x.t}</b><span class="mono">${esc(x.e)}</span><span style="color:var(--muted)">${x.r.join(', ')}${x.mod?(x.mod>0?' +':' ')+x.mod:''}</span></div>`).join(''):'<div class="note">No rolls yet.</div>'}
// On every page but the big lists (and Home), dice in freshly drawn content become clickable; list windows do it themselves.
let DICE_OBS=null;function diceWatch(){if(DICE_OBS)DICE_OBS.disconnect();if(VIEWS[TAB]||TAB==='home')return;diceify($('content'));DICE_OBS=new MutationObserver(()=>{DICE_OBS.disconnect();diceify($('content'));DICE_OBS.observe($('content'),{childList:true,subtree:true})});DICE_OBS.observe($('content'),{childList:true,subtree:true})}
// Deleting happens at once and the toast offers Undo for 6 seconds, instead of asking "Are you sure?" first.
function actToast(msg,label,fn){const t=$('toast');t.innerHTML=`<span>${esc(msg)}</span><button type="button">${esc(label)}</button>`;t.classList.add('show','act');clearTimeout(toast._t);
  t.querySelector('button').onclick=()=>{t.classList.remove('show','act');clearTimeout(toast._t);fn()};toast._t=setTimeout(()=>t.classList.remove('show','act'),6000)}
const undoToast=(msg,undo)=>actToast(msg,'Undo',()=>{undo();toast('Restored')});
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('act');t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1800)}
// set() returns false when the browser refuses (its storage is full): the change is then not saved, so say so
// ── Undo and Redo: every change to saved data (store.set) is kept as a step, for this browser tab. Changes that come
// within a second of each other, or keep changing the same thing (typing), make one step. Undo puts the earlier values
// back the same way the site saves them, so the account and the campaign get the undone version too.
var UNDO={steps:[],redo:[],busy:false,max:40};
// things that are about how the page looks or where you are, not your data: never part of an undo
var UNDO_SKIP=new Set(['inbox','npcf','tradelog','tlview','dmpad','dmpadui','livecamp','recentq','theme','wakelock','tooltab','viewmode','charwiz','jedit','clsfocus','placefocus','diceanim','recent','spells','hc','hclv','jq','magic','rmap','dpool','hcpat','hcpin','hcqm','hcguard','hclog','anthropicKey','groqKey','groqModel','campview','role','partygone','journalgone','askmass','onboard','tour','diceskin','homeorder','homehide','sbtab','sess','standOpen','dmOpen','homelayout','toursDone','guided','genopts','dicesound','forgeSound','dicelog','scavpop','sbt','cmp','trialtrack','fightPaceOn','groqforge']);
const UNDO_NAMES={party:'the party',combat:'the combat tracker',journal:'the journal',enc:'the encounter',npcs:'the NPCs',designs:'your designs',pins:'your pins',fights:'the fight reports',rules:'the table rules',prep:'the session prep',stand:'faction standing',hooks:'the hooks',dice:'the dice'};
function undoLoad(){try{const o=JSON.parse(sessionStorage.getItem('fand.__undo')||'null');if(o&&Array.isArray(o.steps)){UNDO.steps=o.steps;UNDO.redo=o.redo||[]}}catch(e){}}
function undoSave(){for(let i=0;i<40;i++){try{sessionStorage.setItem('fand.__undo',JSON.stringify({steps:UNDO.steps,redo:UNDO.redo}));return}catch(e){if(UNDO.redo.length)UNDO.redo.shift();else if(UNDO.steps.length>1)UNDO.steps.shift();else{try{sessionStorage.removeItem('fand.__undo')}catch(x){}return}}}}
undoLoad();setTimeout(()=>{undoBtn();inboxBadge()},0);
function undoRec(k,js){if(UNDO.busy||!k||k.startsWith('__')||UNDO_SKIP.has(k))return;let old=null;try{old=localStorage.getItem('fand.'+k)}catch(e){return}if(old===js)return; // saving the same thing again is not a change
  let tab='';try{tab=TAB}catch(e){}const now=Date.now(),L=UNDO.steps[UNDO.steps.length-1];
  const same=L&&Object.keys(L.k).length===1&&L.k.hasOwnProperty(k);
  if(L&&(now-L.at<1000||same&&now-L.at<4000&&L.tab===tab)){if(!L.k.hasOwnProperty(k))L.k[k]=old;L.at=now}
  else{UNDO.steps.push({at:now,tab,k:{[k]:old}});if(UNDO.steps.length>UNDO.max)UNDO.steps.shift()}
  UNDO.redo=[];clearTimeout(UNDO.t);UNDO.t=setTimeout(()=>{undoSave();undoBtn()},300)}
const undoLabel=st=>{const ks=Object.keys(st.k);return ks.length===1?(UNDO_NAMES[ks[0]]||ks[0]):ks.map(k=>UNDO_NAMES[k]||k).slice(0,3).join(', ')};
// ── the inbox: trade answers, counter-offers, swap offers, handouts and loot stay here until read (kept with your account) ──
const INBOX_GO={shop:()=>go('shop'),sheet:()=>go('sheet'),home:()=>go('home'),party:()=>go('party'),combat:()=>go('combat')};
function inboxPush(t,goTo,extra){const L=store.get('inbox',[]),id='ib'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  if(L.length&&L[0].t===t&&Date.now()-L[0].at<5000)return;L.unshift(Object.assign({id,at:Date.now(),t:String(t).slice(0,300),go:goTo||'',read:false},extra||{}));store.set('inbox',L.slice(0,60));inboxBadge()}
function inboxBadge(){const b=$('inboxBtn'),n=$('inboxN');if(!b)return;const L=store.get('inbox',[]),u=L.filter(x=>!x.read).length;b.hidden=!L.length;
  if(n){n.hidden=!u;n.textContent=u>9?'9+':String(u)}b.setAttribute('aria-label',u?`Inbox, ${u} unread`:'Inbox');b.title=u?`${u} unread in your inbox`:'Inbox'}
function inboxToggle(open){const P=$('inboxpop'),b=$('inboxBtn');if(!P)return;const on=open==null?!P.classList.contains('open'):open;P.classList.toggle('open',on);if(b)b.setAttribute('aria-expanded',on);if(on){inboxRender();const r=b.getBoundingClientRect(),w=P.offsetWidth||Math.min(360,innerWidth-16);P.style.top=(r.bottom+6)+'px';P.style.right='auto';P.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';setTimeout(()=>{const f=P.querySelector('button');if(f)f.focus()},0)}}
function inboxRender(){const P=$('inboxpop');if(!P)return;const L=store.get('inbox',[]),ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':new Date(t).toLocaleDateString([], {month:'short',day:'numeric'})};
  P.innerHTML=`<div class="ib-h"><b>Inbox</b>${L.some(x=>!x.read)?'<button class="btn" onclick="inboxAllRead()">Mark all read</button>':''}${L.length?'<button class="btn" onclick="inboxClear()">Clear</button>':''}<button class="icon-btn" aria-label="Close inbox" onclick="inboxToggle(false)">${ICON.x}</button></div>
    <div class="ib-list">${L.length?L.map(x=>`<button class="ib-row${x.read?'':' unread'}" data-ib="${x.id}"><span class="ib-t">${esc(x.t)}</span><span class="ib-at">${esc(ago(x.at))}${x.go?' · open →':''}</span></button>`).join(''):'<div class="note" style="padding:10px">Nothing here. Answers to your trade requests, swap offers, handouts and loot arrive here.</div>'}</div>`;
  P.querySelectorAll('[data-ib]').forEach(b=>b.onclick=()=>inboxOpen(b.dataset.ib))}
function inboxOpen(id){const L=store.get('inbox',[]),x=L.find(z=>z.id===id);if(!x)return;x.read=true;store.set('inbox',L);inboxBadge();inboxToggle(false);
  if(x.ho)showHandout(x.ho);else if(x.go&&INBOX_GO[x.go])INBOX_GO[x.go]()}
function inboxAllRead(){const L=store.get('inbox',[]);L.forEach(x=>x.read=true);store.set('inbox',L);inboxBadge();inboxRender()}
function inboxClear(){const was=store.get('inbox',[]);store.set('inbox',[]);inboxBadge();inboxRender();undoToast('Inbox cleared',()=>{store.set('inbox',was);inboxBadge();if($('inboxpop').classList.contains('open'))inboxRender()})}
document.addEventListener('mousedown',e=>{const P=$('inboxpop');if(P&&P.classList.contains('open')&&!e.target.closest('#inboxpop')&&!e.target.closest('#inboxBtn'))inboxToggle(false)});
document.addEventListener('keydown',e=>{const P=$('inboxpop');if(e.key==='Escape'&&P&&P.classList.contains('open')){inboxToggle(false);$('inboxBtn').focus()}});
function undoBtn(){const b=$('undoBtn');if(!b)return;const L=UNDO.steps[UNDO.steps.length-1];b.disabled=!L;b.title=L?'Undo the last change to '+undoLabel(L)+' (Ctrl+Z)':'Nothing to undo';b.setAttribute('aria-label',L?'Undo the last change to '+undoLabel(L):'Undo (nothing to undo)')}
// put one step's values back; returns the step that would put them forward again
function undoApply(st){const back={at:Date.now(),tab:st.tab,k:{}};UNDO.busy=true;
  try{Object.keys(st.k).forEach(k=>{let cur=null;try{cur=localStorage.getItem('fand.'+k)}catch(e){}back.k[k]=cur;const raw=st.k[k];
    if(k==='party'){let v=[];try{v=JSON.parse(raw||'[]')}catch(e){}if(!Array.isArray(v))v=[];PARTY.length=0;v.forEach(c=>PARTY.push(c));saveParty();return}
    if(raw==null){try{localStorage.removeItem('fand.'+k)}catch(e){}cloudMark(k);return}
    let v;try{v=JSON.parse(raw)}catch(e){return}store.set(k,v)})}
  finally{UNDO.busy=false}
  // the pages keep some of the data in memory: read it again
  if(st.k.hasOwnProperty('pins'))PINS=new Set(store.get('pins',[]));
  if(st.k.hasOwnProperty('combat')&&typeof CB!=='undefined'&&CB)CB=store.get('combat',{round:1,turn:0,list:[]});
  if(st.k.hasOwnProperty('designs')&&typeof DESIGNS!=='undefined'){DESIGNS=store.get('designs',[]);if(typeof designPlace==='function')designPlace(true)}
  if(st.k.hasOwnProperty('npcs')&&typeof NPCS!=='undefined'){NPCS=store.get('npcs',[]);if(!Array.isArray(NPCS))NPCS=[]}
  if(st.k.hasOwnProperty('party')&&typeof PARTY_SEL!=='undefined'&&PARTY_SEL&&!PARTY.some(c=>c.id===PARTY_SEL))PARTY_SEL=null;
  UNDO.busy=true;try{const y=$('content').scrollTop;if(typeof renderTab==='function')renderTab();$('content').scrollTop=y}finally{UNDO.busy=false}return back}
function undoDo(){const st=UNDO.steps.pop();if(!st){toast('Nothing to undo');return}if(typeof dmPadFlush==='function')dmPadFlush();
  UNDO.redo.push(undoApply(st));undoSave();undoBtn();actToast('Undone: the last change to '+undoLabel(st),'Redo',redoDo)}
function redoDo(){const st=UNDO.redo.pop();if(!st){toast('Nothing to redo');return}
  UNDO.steps.push(undoApply(st));undoSave();undoBtn();actToast('Redone: the change to '+undoLabel(st),'Undo',undoDo)}
// Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) undo and redo, except while typing in a box (there they undo the typing)
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const a=document.activeElement;if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable))return;
  const k=e.key.toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();undoDo()}else if(k==='z'&&e.shiftKey||k==='y'){e.preventDefault();redoDo()}});
// changes to many things at once ask first (Settings → Saved data can turn this off)
function massOk(what){if(store.get('askmass',true)===false)return true;return confirm(what+'\n\nYou can undo it afterwards with ↶ Undo. (Settings → Saved data can turn off this question.)')}
const store={get(k,d){try{const v=localStorage.getItem('fand.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){if(k==='journal')journalStamp(v);let ok=true;const js=JSON.stringify(v);undoRec(k,js);try{localStorage.setItem('fand.'+k,js)}catch(e){ok=false;storeFull(e)}cloudMark(k);if(k==='combat')liveSchedule();return ok}};
function storeFull(e){if(e&&!/quota|full|exceed/i.test(String(e.name)+' '+String(e.message)))return;const now=Date.now();if(now-(storeFull.t||0)<8000)return;storeFull.t=now;
  setTimeout(()=>{try{toast('Not saved: this browser\'s storage is full. Remove some portraits, or download a backup in Settings and clear old data.')}catch(x){}},0)}
// how much this site keeps in the browser (characters, portraits, notes): characters × 2 bytes, as browsers count it
function storeUsage(){let n=0,pics=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith('fand.'))continue;const v=localStorage.getItem(k)||'';n+=(k.length+v.length)*2;if(k==='fand.party')pics+=(v.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g)||[]).reduce((a,x)=>a+x.length*2,0)}}catch(e){}return {bytes:n,pics}}
const kbmb=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';

// ════════════════════════════════════════════════════════════════
//  Realms & indexes
// ════════════════════════════════════════════════════════════════
const REALM_COLOR={'Human':'#a8a29e','Mysterious':'#60a5fa','Hell':'#ef4444','Heaven':'#facc15','Chaos':'#e879f9','Abyss':'#8b5cf6','Inner Realm':'#2dd4bf','Outer Realm':'#38bdf8','Void':'#6366f1','Inner Void':'#a5b4fc','Primordial':'#f97316'};
const REALM_BLURB={
  'Human':'The Mortal Realm. Ordinary beasts grown large or mean, and the ores and herbs of the known world.',
  'Mysterious':'The realm of fey, elementals, and wandering oddities that sits just past the mortal world.',
  'Hell':'The infernal layers ruled by archdevils, where contracts are law and the metals burn.',
  'Heaven':'The celestial realm of angels and the gods who rule from on high.',
  'Chaos':'A realm that refuses to hold one shape for long; wild magic is the weather here.',
  'Abyss':'The bottomless home of demon princes and everything they have devoured.',
  'Inner Realm':'Ordered halls and anchors that keep the realms in place.',
  'Outer Realm':'The far edge of creation, where distances stop behaving.',
  'Void':'Absence given shape. Its materials are not sold; they pass only between gods and their Fingers.',
  'Inner Void':'Deeper still. What lives here makes things go missing.',
  'Primordial':'The realm of the progenitors, older than the gods themselves.'
};
// The realm atlas (built from tools/data/realm-atlas.js): a write-up for every realm, and the Inner Realm's dimensions
// and the Outer Realm's pocket dimensions, each with its materials, gear and natives.
const ATL=()=>typeof ATLAS!=='undefined'&&ATLAS?ATLAS:{realms:{},dims:[]};
const dimsOf=realm=>ATL().dims.filter(d=>d.realm===realm);
const dimByName=n=>ATL().dims.find(d=>d.n===n);
function realmAtlasHTML(r){const A=ATL().realms[r.n];if(!A)return `<div class="prose">${esc(REALM_BLURB[r.n]||'')}</div>`;
  const li=L=>L&&L.length?`<ul class="atl-l">${L.map(x=>Array.isArray(x)?`<li><b>${esc(x[0])}.</b> ${esc(x[1])}</li>`:`<li>${esc(x)}</li>`).join('')}</ul>`:'';
  return `<div class="prose"><p>${esc(A.ds)}</p>${A.travel?`<p><b>Traveling here.</b> ${esc(A.travel)}</p>`:''}</div>`
    +blk('Regions',li(A.regions))+blk('Who holds power',li(A.factions))+blk('Dangers',li(A.dangers))+blk('Adventure hooks',li(A.hooks))}
function dimCardHTML(d,open){const R=REALMS.find(x=>x.n===d.realm)||{},lv=d.realm==='Inner Realm'?'51–60':d.realm==='Outer Realm'?'61–70':'';
  const chips=(names,find)=>names.map(n=>{const x=find(n);return x?refChip(x):`<span class="chip">${esc(n)}</span>`}).join('');
  return `<details class="fold dim-card" data-dim="${esc(d.n)}"${open?' open':''} style="--rc:${R.color||'var(--acc)'}"><summary><b>${esc(d.n)}</b> <small class="dim-k">${esc(d.kind)}${d.law?' · Law of '+esc(d.law):''}${lv?' · levels '+lv:''}</small></summary>
    <div class="dim-b"><p>${esc(d.ds)}</p>${d.life?`<p><b>Who lives here.</b> ${esc(d.life)}</p>`:''}${d.dangers?`<p><b>Dangers.</b> ${esc(d.dangers)}</p>`:''}${d.travel?`<p><b>Getting in.</b> ${esc(d.travel)}</p>`:''}
    ${d.hooks&&d.hooks.length?`<p><b>Adventure hooks.</b></p><ul class="atl-l">${d.hooks.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>`:''}
    ${d.mons&&d.mons.length?`<div class="dim-row"><span>Natives</span><div class="chips">${chips(d.mons,n=>MON_IDX.get(lc(n)))}</div></div>`:''}
    ${d.mats&&d.mats.length?`<div class="dim-row"><span>Materials</span><div class="chips">${chips(d.mats,findMat)}</div></div>`:''}
    ${d.gear&&d.gear.length?`<div class="dim-row"><span>Made here</span><div class="chips">${chips(d.gear,findBP)}</div></div>`:''}
    <div class="dim-act"><button type="button" class="btn" onclick="dimEncounter(${esc(JSON.stringify(d.n))},this)">🎲 Random encounter</button><button type="button" class="btn" onclick="dimFight(${esc(JSON.stringify(d.n))})">⚔ Build a fight here</button><button type="button" class="btn" onclick="dimNpc(${esc(JSON.stringify(d.n))},this)">👤 Someone from here</button></div><div class="dim-out" aria-live="polite"></div></div></details>`}
// at the table: what the party runs into in a dimension, a balanced fight there, and someone who lives there
const DIM_SIT=['blocking the only way forward','fighting each other over a kill','guarding a cache of {mat}','ambushing travelers on the way in','hunting something larger, and in no mood to be interrupted','wounded and cornered, and twice as dangerous for it','following the party since they arrived','gathered around a breach where the Law-vein shows through'];
function dimEncounter(n,btn){const d=dimByName(n);if(!d)return;const out=btn.closest('.dim-b').querySelector('.dim-out'),M=(d.mons||[]).map(x=>MON_IDX.get(lc(x))).filter(Boolean);if(!M.length)return;
  const R=Math.random,m=M[Math.floor(R()*M.length)],cr=+String(m.cr||'1').split('/').reduce((a,b)=>a/b),k=cr<=5?2+Math.floor(R()*4):cr<=12?1+Math.floor(R()*3):1;
  const sit=DIM_SIT[Math.floor(R()*DIM_SIT.length)].replace('{mat}',(d.mats||[])[Math.floor(R()*(d.mats||[1]).length)]||'something valuable');
  out.innerHTML=`<div class="callout" style="margin-top:8px"><b>${k>1?k+' × ':''}${refChip(m)}</b> ${esc(sit)}.${d.dangers?`<div class="note" style="margin:4px 0 0">Here too: ${esc(d.dangers)}</div>`:''}</div>`}
function dimFight(n){const d=dimByName(n);if(!d)return;const st=store.get('enc',{});Object.assign(st,{realm:d.realm,dim:d.n,list:[],autoroll:1});const L=d.realm==='Inner Realm'?55:d.realm==='Outer Realm'?65:st.level;if(!PARTY.length)st.level=L;store.set('enc',st);closeAll();go('encounter')}
function dimNpc(n,btn){const d=dimByName(n);if(!d)return;const out=btn.closest('.dim-b').querySelector('.dim-out'),r=makeNPC(rng32((Math.random()*4294967296)>>>0),d.realm);r.dim=d.n;
  const roles=String(d.life||'').replace(/\.$/,'').split(/,\s*(?:and\s+)?|\s+and\s+/).map(x=>x.trim()).filter(Boolean);if(roles.length)r.trait=(r.trait?r.trait+'; ':'')+'one of '+d.n+'\'s '+roles[Math.floor(Math.random()*roles.length)].replace(/^the /,'');
  out.innerHTML=npcHTML(r)}
// open a dimension: its realm's window, with the dimension unfolded and in view
function openDim(n){const d=dimByName(n),r=d&&REALMS.find(x=>x.n===d.realm);if(!r)return;openItem(r,$('mbg').classList.contains('open'));setTimeout(()=>{const el=[...document.querySelectorAll('#modal .dim-card')].find(x=>x.dataset.dim===n);if(el){el.open=true;el.scrollIntoView({block:'start'})}},60)}
// where a material is found, for every material: its gathering site, its monster's home, or its realm region
function foundOf(m){if(m.where)return 'Gathered at '+m.where+'.';const f=(m.from||[]).map(n=>MON_IDX.get(lc(n))).filter(Boolean);
  if(f.length){const x=f[0];return 'Harvested from '+(f.length>1?f.map(y=>y.n).join(', '):'the '+x.n)+(x.hab?', found in '+x.hab.charAt(0).toLowerCase()+x.hab.slice(1):'')+(x.realm?' ('+x.realm+(/Realm$/.test(x.realm)?'':' Realm')+')':'')+'.'}
  if(m.found)return m.found.replace(/\.?$/,'.');if(m.from&&m.from.length)return 'Harvested from '+m.from.join(', ')+'.';return m.realm?'Found in the '+m.realm+(/Realm$/.test(m.realm)?'':' Realm')+'.':''}
const dimNote=x=>{if(!x||!x.dim)return '';const d=dimByName(x.dim);if(!d)return '';const w={mat:'Found only in',bp:'Made in',mon:'Native to'}[x._t]||'From';
  return `<div class="callout dim-note" style="margin-bottom:12px">${w} <button type="button" class="linkish" onclick="openDim(${esc(JSON.stringify(d.n))})"><b>${esc(d.n)}</b></button>, ${esc(d.kind.charAt(0).toLowerCase()+d.kind.slice(1))} in the ${esc(d.realm)}.</div>`};
// Money: each realm's coin is worth its base material price ÷ 5 gp, so a grade-g material costs 5×g local coins.
const CURRENCY={
  'Human':{coin:'Gold Piece',pl:'gp',gp:1,sub:'10 copper = 1 silver, 10 silver = 1 gold, 10 gold = 1 platinum',what:'Minted copper, silver, gold, and platinum coins.',note:'The common measure of value across Vestige; every price on this site is given in gp.'},
  'Mysterious':{coin:'Glimmer',pl:'glimmers',gp:10,sub:'10 motes = 1 glimmer',what:'A sliver of fey-touched crystal that glows faintly when held.',note:'Left in the Mortal Realm for a month, a glimmer fades to dull glass.'},
  'Hell':{coin:'Soul Mark',pl:'soul marks',gp:100,sub:'10 ashpennies = 1 soul mark',what:'A brass-iron coin stamped with a binding clause.',note:'Every Soul Mark is a tiny contract: spending one counts as a promise kept.'},
  'Heaven':{coin:'Halo Crown',pl:'halo crowns',gp:100,sub:'10 prayer beads = 1 halo crown',what:'A gold coin ringed with a stamped sun.',note:'A stolen crown burns the thief\'s hand for 1 radiant damage per coin.'},
  'Chaos':{coin:'Flux Chip',pl:'flux chips',gp:500,sub:'no smaller coin; chips split and merge on their own',what:'A shard that changes color and shape in the hand.',note:'Its worth shifts daily: roll 2d6 × 50 gp at dawn. 500 gp is the average.'},
  'Abyss':{coin:'Hunger Tooth',pl:'hunger teeth',gp:2000,sub:'10 milk teeth = 1 hunger tooth',what:'A demon\'s tooth that still bites.',note:'Carrying more than 10 gives disadvantage on Wisdom saves against greed and hunger.'},
  'Inner Realm':{coin:'Anchor Seal',pl:'anchor seals',gp:10000,sub:'10 tithe-stamps = 1 anchor seal',what:'A law-stamped disc that can\'t be forged or broken.',note:'Each seal remembers every hand it has passed through.'},
  'Outer Realm':{coin:'Starweight',pl:'starweights',gp:20000,sub:'10 glints = 1 starweight',what:'A pebble of compressed starlight.',note:'It grows heavier the farther it travels from the Outer Realm.'},
  'Void':{coin:'',note:'No coin. Void goods are traded only between gods and their Fingers, by favor, contract, and oath.'},
  'Inner Void':{coin:'',note:'No coin. Nothing here is bought or sold; it is owed.'},
  'Primordial':{coin:'',note:'No coin. The progenitors predate money; trade is by oath and gift.'}
};
const EXCHANGE_FEE=0.1;
// Cosmology, from the campaign's own lore
const COSMOLOGY=[
  ['Infinatas','The creator of all things and the highest being in existence. Infinatas cares for one thing only: balance, and keeps it through creation.'],
  ['The cycle','Infinatas cannot stay dead. If he is killed, Inane takes over and destroys everything, what is left of Infinatas included, until nothing remains. Only then does Infinatas return, and he creates everything again.'],
  ['Inane','Infinatas\'s split personality. Inane also keeps balance, but through destruction. To the gods, Inane was an unknown entity.'],
  ['Isorropía','Infinatas\'s third personality. It keeps balance by changing things: it made a vessel of its own and walks the realm, adding new things to it. This is how FAND changes. Infinatas and Inane share one vessel; Isorropía has its own.'],
  ['Who keeps which Rune','Balance belongs to Infinatas and Destruction to Inane: the gods who hold them hold only a share. The Runes of creation keep their holders, but Isorropía holds a fragment of each to keep them in balance. Space is Infinatas\'s alone.'],
  ['The fall of the gods\' world','The gods\' own world eroded away because of Inane.'],
  ['The gods in Vestige','Infinatas allowed the other gods to come to this realm, but only under strict regulation.'],
];
function cosmologyHTML(compact){
  return `<div class="panel" style="border-color:var(--gold);background:radial-gradient(120% 140% at 0% 0%,var(--goldbg),transparent 60%),var(--surf)">
    <h4 style="font-size:1.2rem">Cosmology: Infinatas, Inane, and Isorropía</h4>
    <div style="display:grid;grid-template-columns:${compact?'1fr':'repeat(auto-fill,minmax(240px,1fr))'};gap:12px;margin-top:8px">${COSMOLOGY.map(([h,t])=>`<div><b style="font-family:var(--serif);color:var(--gold2)">${esc(h)}</b><p style="font-size:.86rem;color:var(--text2);margin-top:2px">${esc(t)}</p></div>`).join('')}</div></div>`;
}
const localPrice=(gpv,realm)=>{const c=CURRENCY[realm];if(!c||!c.coin||!gpv||c.gp===1)return '';const v=gpv/c.gp;return (v%1?v.toFixed(1):fmt(v))+' '+(v===1?c.coin.toLowerCase():c.pl)};
const REALMS=META.realms.map(r=>Object.assign(r,{color:REALM_COLOR[r.n]||'#888',pressure:r.tier-1}));
const REALM=Object.fromEntries(REALMS.map(r=>[r.n,r]));
const realmOf=s=>{const m=/^(.+) \d+$/.exec(String(s||''));return m?m[1]:''};
const rcol=n=>(REALM[n]||{}).color||'var(--muted)';

// ── names for screen readers: any field without a label gets one from its placeholder (or its setting's name), and any
// button that shows only a symbol gets a word; runs on whatever is drawn, so every page and window is covered ──
const A11Y_SYM={'−':'Decrease','-':'Decrease','+':'Increase','×':'Remove','✕':'Remove','✖':'Remove','↩':'Undo','⋯':'More','…':'More','‹':'Previous','›':'Next','←':'Back','→':'Forward','▲':'Up','▼':'Down','★':'Pin','☆':'Pin'};
function a11yName(root){(root||document).querySelectorAll('input:not([type=hidden]):not([aria-label]):not([aria-labelledby]),select:not([aria-label]):not([aria-labelledby]),textarea:not([aria-label]):not([aria-labelledby])').forEach(e=>{if(e.labels&&e.labels.length&&[...e.labels].some(l=>l.textContent.trim()))return;if(e.title&&e.title.trim())return;
    const ph=(e.getAttribute('placeholder')||'').trim(),key=e.dataset.s||e.dataset.f||e.dataset.mc||e.id||'',opt=e.tagName==='SELECT'&&e.options[0]&&!e.options[0].value?e.options[0].textContent.trim():'';
    const name=ph||opt||key.replace(/^.*[.:]/,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').trim();if(name)e.setAttribute('aria-label',name.slice(0,80))});
  (root||document).querySelectorAll('button:not([aria-label])').forEach(b=>{const t=(b.textContent||'').trim();if(/[A-Za-z]{2}/.test(t)||(b.title&&b.title.trim()))return;
    // number buttons say what they do: hit points, and the sheet's rolls
    if(b.dataset.hpd){const n=+b.dataset.hpd;b.setAttribute('aria-label',n<0?`Take ${-n} damage`:`Heal ${n}`);return}
    if(b.dataset.what){b.setAttribute('aria-label',`${b.dataset.what}: roll ${t.replace('−','-')}`);return}
    const sn=/^([−+-])\s?(\d+)$/.exec(t);if(sn){b.setAttribute('aria-label',(sn[1]==='+'?'Add ':'Subtract ')+sn[2]);return}
    const w=A11Y_SYM[t];if(w)b.setAttribute('aria-label',w)})}
{let pend=0;new MutationObserver(()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;a11yName(document.body)})}).observe(document.documentElement,{childList:true,subtree:true})}
