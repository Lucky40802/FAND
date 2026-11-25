// ── live initiative: the DM's tracker, as the Player view shows it, on every player's phone (campaign_combat) ──
var LIVE={data:{},chan:null,timer:null,open:null};
const liveCamp=()=>{const c=store.get('livecamp','');return c&&hoDMCamps().some(k=>k.id===c)?c:''};
function liveOf(C){const L=C.list||[];return {round:+C.round||1,turn:+C.turn||0,at:Date.now(),list:L.slice(0,60).map(x=>{const by=x.sum&&L.find(y=>y.id===x.sum.by),mine=!!(x.pc||by&&by.pc);
  return {n:String(x.name||'?').slice(0,60),pc:!!x.pc,hp:mine?+x.hp||0:null,max:mine?+x.max||0:null,st:pvState(x)[0],cond:(x.cond||[]).slice(0,8).map(c=>String(c).slice(0,30)),sum:x.sum?(mine&&by?String(by.name).slice(0,60)+'\'s summon':'Summoned'):''}})}}
function liveSchedule(){if(typeof CL==='undefined'||!CL.user||!liveCamp())return;clearTimeout(LIVE.timer);LIVE.timer=setTimeout(livePush,600)}
async function livePush(){const c=liveCamp();if(!c||!CL.user)return;const {error}=await CL.sb.from('campaign_combat').upsert({campaign_id:c,data:liveOf(store.get('combat',{round:1,turn:0,list:[]})),updated_at:new Date().toISOString()},{onConflict:'campaign_id'});
  if(error)toast(dbMissing(error,'campaign_combat')?'Live initiative needs the latest database setup: run tools/cloud/schema.sql again in Supabase':clMsg(error))}
async function liveStart(id){const k=hoDMCamps().find(x=>x.id===id);if(!k)return;store.set('livecamp',id);await livePush();toast('Players in '+k.name+' now see the turn order on their phones');if(TAB==='combat')renderCombat()}
async function liveStop(){const c=liveCamp();store.set('livecamp','');if(c)await CL.sb.from('campaign_combat').delete().match({campaign_id:c});toast('Players no longer see this fight');if(TAB==='combat')renderCombat()}
function liveBtnHTML(){const camps=hoDMCamps();if(!camps.length)return '';const c=liveCamp(),k=camps.find(x=>x.id===c);
  return k?`<button class="btn primary" onclick="liveStop()" title="Players in ${esc(k.name)} see the turn order and how hurt everyone looks, live">📡 Live: ${esc(k.name)} · Stop</button>`:`<select class="sel" style="width:auto" aria-label="Show this fight on players' phones" onchange="if(this.value)liveStart(this.value)"><option value="">📡 Show on players' phones…</option>${camps.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select>`}
async function liveLoad(){if(typeof CL==='undefined'||!CL.user||!CL.sb||!CL.camps.length){LIVE.data={};return}
  const {data,error}=await CL.sb.from('campaign_combat').select('campaign_id,data,updated_at').in('campaign_id',CL.camps.map(k=>k.id));if(error)return;
  LIVE.data={};(data||[]).forEach(r=>{if(r.data&&Array.isArray(r.data.list))LIVE.data[r.campaign_id]=r.data});liveSubscribe();if(TAB==='home')renderHome()}
function liveSubscribe(){if(LIVE.chan){CL.sb.removeChannel(LIVE.chan);LIVE.chan=null}const ch=CL.sb.channel('fand-live');CL.camps.forEach(k=>ch.on('postgres_changes',{event:'*',schema:'public',table:'campaign_combat',filter:'campaign_id=eq.'+k.id},liveEvent));LIVE.chan=ch.subscribe()}
function liveEvent(p){const r=p.new||{},id=r.campaign_id||(p.old||{}).campaign_id;if(!id)return;const had=!!LIVE.data[id];
  if(p.eventType==='DELETE'||!r.data||!Array.isArray(r.data.list))delete LIVE.data[id];else LIVE.data[id]=r.data;
  const k=CL.camps.find(c=>c.id===id),dm=k&&CL.user&&k.dm===CL.user.id;
  if(!had&&LIVE.data[id]&&!dm){inboxPush('Combat started in '+(k?k.name:'your campaign'),'home');actToast('Combat started in '+(k?k.name:'your campaign'),'Watch',()=>liveOpen(id))}
  if(LIVE.open===id)liveRender();if(TAB==='home')renderHome()}
function liveRender(){const v=$('liveView'),id=LIVE.open,D=LIVE.data[id],k=(CL.camps||[]).find(c=>c.id===id);if(!v)return;
  if(!D){v.innerHTML=`<div style="max-width:720px;margin:0 auto"><div class="empty">The fight is over.</div><button class="btn primary" onclick="liveClose()">Close</button></div>`;return}
  const col={Unhurt:'var(--green)',Hurt:'var(--green)',Bloodied:'var(--gold)','Near death':'var(--red)',Down:'var(--muted)'},cur=D.list[D.turn];
  v.innerHTML=`<div style="max-width:720px;margin:0 auto"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><span style="font-family:var(--serif);font-size:1.8rem;font-weight:700">Round ${+D.round||1}</span>${cur?`<span class="b gold" style="font-size:.95rem">${esc(cur.n)}'s turn</span>`:''}<span class="note" style="margin:0">${esc(k?k.name:'')} · live</span><button class="btn primary" style="margin-left:auto" onclick="liveClose()">Close</button></div>
    ${D.list.map((x,i)=>{const pct=x.max?Math.max(0,Math.min(100,x.hp/x.max*100)):0,c=col[x.st]||'var(--muted)';return `<div class="pv-row${i===D.turn?' on':''}${x.st==='Down'?' down':''}"><span class="pv-mk" style="font-size:1.3rem;width:1.4em">${i===D.turn?'▶':''}</span><div style="flex:1;min-width:0"><div style="font-size:1.2rem;font-weight:700">${esc(x.n)}${x.pc?' <span class="b green">PC</span>':''}${x.sum?` <span class="b acc">✨ ${esc(x.sum)}</span>`:''}</div>
      ${x.max?`<div style="margin-top:4px"><b>${+x.hp}</b> / ${+x.max} HP<div class="bar" style="margin-top:4px"><i style="width:${pct}%;background:${c}"></i></div></div>`:`<div style="margin-top:4px;font-weight:600;color:${c}">${esc(x.st)}</div>`}
      ${(x.cond||[]).length?`<div class="chips" style="margin-top:6px">${x.cond.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>`:''}</div></div>`}).join('')||'<div class="empty">No combatants yet.</div>'}
    <div class="note">Follows your DM's combat tracker live. Monsters show how hurt they look, never their numbers.</div></div>`}
function liveOpen(id){let v=$('liveView');if(!v){v=document.createElement('div');v.id='liveView';v.className='pv';v.setAttribute('role','dialog');v.setAttribute('aria-label','Live combat');document.body.appendChild(v)}LIVE.open=id;liveRender();v.hidden=false}
function liveClose(){const v=$('liveView');if(v)v.hidden=true;LIVE.open=null}
document.addEventListener('keydown',e=>{const v=$('liveView');if(e.key==='Escape'&&v&&!v.hidden)liveClose()});
function liveHomeHTML(){if(typeof CL==='undefined'||!CL.user)return '';const L=Object.entries(LIVE.data).map(([id,D])=>[CL.camps.find(k=>k.id===id),id,D]).filter(x=>x[0]);
  const W=CL.camps||[];if(!L.length&&!W.length)return '';
  return `<section class="sec"><div class="sec-h"><h3>Your campaigns</h3><p>Live fights and each campaign's wiki</p></div><div class="chips">${L.map(([k,id,D])=>{const cur=D.list[D.turn];return `<button type="button" class="chip live-chip" onclick="liveOpen('${esc(id)}')">⚔ ${esc(k.name)}: round ${+D.round||1}${cur?', '+esc(cur.n)+'\'s turn':''}</button>`}).join('')}${W.map(k=>`<button type="button" class="chip" onclick="wikiOpen('${esc(k.id)}')">📖 ${esc(k.name)} wiki</button>`).join('')}</div></section>`}
// ── campaign wiki (campaign_pages): the DM writes pages; players read the ones the DM publishes ──
var WIKI={camp:null,pages:[],cur:null,edit:false,err:''};
const wikiDM=()=>{const k=(CL.camps||[]).find(x=>x.id===WIKI.camp);return !!(k&&CL.user&&k.dm===CL.user.id)};
async function wikiOpen(id){WIKI.camp=id;WIKI.cur=null;WIKI.edit=false;WIKI.err='';WIKI.pages=[];$('qBox').style.maxWidth='760px';$('qbg').classList.add('open');wikiRender('Loading…');
  const {data,error}=await CL.sb.from('campaign_pages').select('id,title,kind,body,published,updated_at').eq('campaign_id',id).order('title');
  if(error){WIKI.err=dbMissing(error,'campaign_pages')?'The wiki needs the latest database setup: whoever runs the site\'s Supabase project runs tools/cloud/schema.sql again.':clMsg(error)}else WIKI.pages=data||[];wikiRender()}
function wikiMd(b){const T=new Map(WIKI.pages.map(p=>[lc(p.title),p.id]));return dmPadMd(b).replace(/<input type="checkbox"/g,'<input type="checkbox" disabled').replace(/<span class="dp-miss"[^>]*>([^<]*)<\/span>/g,(m,n)=>{const id=T.get(lc(n.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')));return id?`<a href="#" data-wiki="${esc(id)}">${n}</a>`:m})}
function wikiRender(msg){const k=(CL.camps||[]).find(x=>x.id===WIKI.camp),dm=wikiDM(),L=WIKI.pages.filter(p=>dm||p.published),cur=L.find(p=>p.id===WIKI.cur);
  const list=`<div class="wk-list">${dm?'<button class="btn primary" type="button" data-wk="new">+ New page</button>':''}${L.map(p=>`<button type="button" class="dp-item${cur&&cur.id===p.id?' on':''}" data-wkp="${esc(p.id)}">${dm?(p.published?'🌐 ':'🔒 '):''}<b>${esc(p.title||'Untitled')}</b><small>${esc(p.kind||'')}</small></button>`).join('')||`<div class="note">${dm?'No pages yet. Write up places, people and factions; publish a page when the players should see it.':'Your DM hasn\'t published any pages yet.'}</div>`}</div>`;
  let main='';
  if(msg)main=`<p class="note">${esc(msg)}</p>`;else if(WIKI.err)main=`<p class="note" style="color:var(--red)">${esc(WIKI.err)}</p>`;
  else if(cur&&WIKI.edit)main=`<label class="note" style="display:block;margin:0 0 4px">Title</label><input class="sel" id="wkT" maxlength="200" value="${esc(cur.title||'')}" style="max-width:none;width:100%">
    <label class="note" style="display:block;margin:8px 0 4px">Kind <small>(place, person, faction…)</small></label><input class="sel" id="wkK" maxlength="40" value="${esc(cur.kind||'')}" style="max-width:none;width:100%">
    <label class="note" style="display:block;margin:8px 0 4px">Text <small>## heading, **bold**, - list, [[a monster, item or another page]]</small></label><textarea class="sel" id="wkB" rows="12" style="max-width:none;width:100%;resize:vertical;font:inherit">${esc(cur.body||'')}</textarea>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="wkP"${cur.published?' checked':''}> Published: players in this campaign can read it</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn primary" type="button" data-wk="save">Save</button><button class="btn" type="button" data-wk="cancel">Cancel</button><button class="btn" type="button" data-wk="del" style="margin-left:auto">Delete page</button></div><div class="okline" id="wkMsg"></div>`;
  else if(cur)main=`<div class="kind">${esc(cur.kind||'Page')}${dm?(cur.published?' · published':' · draft, only you see it'):''}</div><h3 style="font-family:var(--serif);margin:2px 0 8px">${esc(cur.title||'Untitled')}</h3><div class="dp-read wk-read">${wikiMd(cur.body)||'<p class="note">Nothing written yet.</p>'}</div>${dm?'<div style="margin-top:10px"><button class="btn" type="button" data-wk="edit">✎ Edit</button></div>':''}`;
  else main=`<p class="note">${L.length?'Pick a page.':''}</p>`;
  $('qBox').innerHTML=`<div class="mh"><div class="kind">Campaign wiki</div><h2 id="qTitle">${esc(k?k.name:'Campaign')}</h2><div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div><div class="wk-wrap">${list}<div class="wk-main">${main}</div></div>`;
  $('qBox').onclick=async e=>{const a=e.target.closest('a[data-wiki]');if(a){e.preventDefault();WIKI.cur=a.dataset.wiki;WIKI.edit=false;wikiRender();return}
    const p=e.target.closest('[data-wkp]');if(p){WIKI.cur=p.dataset.wkp;WIKI.edit=false;wikiRender();return}
    const b=e.target.closest('[data-wk]');if(!b)return;const w=b.dataset.wk;
    if(w==='new'){const n={id:uid(),title:'New page',kind:'',body:'',published:false};WIKI.pages.push(n);WIKI.cur=n.id;WIKI.edit=true;wikiRender();setTimeout(()=>{const t=$('wkT'),f=document.activeElement,busy=f&&f!==t&&$('qBox').contains(f)&&/^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName);if(t&&!busy){t.focus();t.select()}},30);return}
    if(w==='edit'){WIKI.edit=true;wikiRender();return}
    if(w==='cancel'){WIKI.edit=false;const c=WIKI.pages.find(x=>x.id===WIKI.cur);if(c&&!c.updated_at){WIKI.pages=WIKI.pages.filter(x=>x!==c);WIKI.cur=null}wikiRender();return}
    if(w==='save'){const c=WIKI.pages.find(x=>x.id===WIKI.cur);if(!c)return;const row={campaign_id:WIKI.camp,id:c.id,title:$('wkT').value.trim().slice(0,200)||'Untitled',kind:$('wkK').value.trim().slice(0,40),body:$('wkB').value,published:$('wkP').checked,updated_at:new Date().toISOString()};
      b.disabled=true;const {error}=await CL.sb.from('campaign_pages').upsert(row,{onConflict:'campaign_id,id'});b.disabled=false;
      if(error){$('wkMsg').style.color='var(--red)';$('wkMsg').textContent=dbMissing(error,'campaign_pages')?'The wiki needs the latest database setup (tools/cloud/schema.sql).':clMsg(error);return}
      Object.assign(c,row);WIKI.pages.sort((x,y)=>lc(x.title).localeCompare(lc(y.title)));WIKI.edit=false;wikiRender();toast(row.published?'Saved and published':'Saved as a draft');return}
    if(w==='del'){const c=WIKI.pages.find(x=>x.id===WIKI.cur);if(!c)return;if(c.updated_at){const {error}=await CL.sb.from('campaign_pages').delete().match({campaign_id:WIKI.camp,id:c.id});if(error){toast(clMsg(error));return}}
      WIKI.pages=WIKI.pages.filter(x=>x!==c);WIKI.cur=null;WIKI.edit=false;wikiRender();toast('Page deleted')}}}
// ════════════════════════════════════════════════════════════════
//  Mind maps and the links graph (the Archive, the DM notepad)
// ════════════════════════════════════════════════════════════════
// A note as a mind map, as Obsidian's mind-map plugin draws it: the title in the middle of the left edge, its headings
// branching right, and each heading's list items under it (indented items under the item above).
function mmFromMd(title,body){const root={t:title||'Untitled',k:[]},stack=[{lv:0,n:root}];let head=root,lists=[];
  String(body||'').split('\n').forEach(l=>{let m;
    if((m=/^(#{1,6})\s+(.*)$/.exec(l))){const lv=m[1].length;while(stack.length>1&&stack[stack.length-1].lv>=lv)stack.pop();const n={t:m[2].trim(),k:[]};stack[stack.length-1].n.k.push(n);stack.push({lv,n});head=n;lists=[];return}
    if((m=/^(\s*)[-*+]\s+(?:\[[ xX]\]\s*)?(.*)$/.exec(l))||(m=/^(\s*)\d+[.)]\s+(.*)$/.exec(l))){const ind=m[1].replace(/\t/g,'  ').length,n={t:m[2].trim(),k:[],done:/\[[xX]\]/.test(l)};if(!n.t)return;
      while(lists.length&&lists[lists.length-1].ind>=ind)lists.pop();(lists.length?lists[lists.length-1].n:head).k.push(n);lists.push({ind,n})}});
  return root}
// a tree laid out left to right, leaves spaced evenly, as board data (nodes and edges)
function mmTreeData(root){const nodes=[],edges=[];let row=0;const W=230,H=46;
  const tall=t=>Math.max(1,Math.ceil(String(t||'').length/24))*18+18;
  const walk=(n,d,par)=>{const id='t'+nodes.length,o={id,t:n.t,x:d*W,y:0,c:d===0?'gold':n.done?'muted':['','acc','green','red','blue'][d%5]||''};nodes.push(o);if(par)edges.push([par,id]);
    if(n.k.length){const ys=n.k.map(k=>walk(k,d+1,id));o.y=(ys[0]+ys[ys.length-1])/2}else{o.y=row;row+=Math.max(H,tall(n.t)+12)}return o.y};
  walk(root,0,null);return {nodes,edges}}
// ── the board: cards on a pan-and-zoom surface with curved links (edit mode: drag, add, connect, delete) ──
const MM_COLORS=['','gold','acc','green','red','blue','muted'];
function mmLabel(t){const h=dmPadInline(String(t||'').slice(0,300)).replace(/\n/g,'<br>');if(!/dp-miss/.test(h)||typeof ARC==='undefined'||!ARC.items.length)return h;const T=new Map(ARC.items.map(x=>[lc((x.title||'').trim()),x.id]));
  return h.replace(/<span class="dp-miss"[^>]*>([^<]*)<\/span>/g,(m,n)=>{const id=T.get(lc(n.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')));return id?`<a href="#" data-arlink="${esc(id)}">${n}</a>`:m})}
function mmBoard(el,data,o){o=o||{};data.nodes=data.nodes||[];data.edges=data.edges||[];const V=o.view||(o.view={x:40,y:40,z:1});
  el.classList.add('mm-wrap');el.tabIndex=0;el.innerHTML=`<div class="mm-world"><svg class="mm-edges" width="1" height="1" aria-hidden="true"></svg><div class="mm-nodes"></div></div>${o.edit?`<div class="mm-bar" role="toolbar" aria-label="Mind map tools"><button type="button" class="btn" data-mm="child" title="Add a card linked to the selected one (Tab)">+ Card</button><button type="button" class="btn" data-mm="link" title="Then click another card to link them">🔗 Link</button><button type="button" class="btn" data-mm="edit" title="Edit the selected card (Enter)">✎</button><span class="mm-cols">${MM_COLORS.map(c=>`<button type="button" class="mm-sw${c?' c-'+c:''}" data-mmc="${c}" title="${c||'plain'}" aria-label="Colour ${c||'plain'}"></button>`).join('')}</span><button type="button" class="btn" data-mm="del" title="Delete the selected card or link (Delete)">✕</button><span style="flex:1"></span>`:'<div class="mm-bar">'}<button type="button" class="btn" data-mm="out" aria-label="Zoom out">−</button><button type="button" class="btn" data-mm="in" aria-label="Zoom in">+</button><button type="button" class="btn" data-mm="fit">Fit</button></div>`;
  const world=el.querySelector('.mm-world'),svg=el.querySelector('.mm-edges'),box=el.querySelector('.mm-nodes');let sel=null,selE=null,linking=false;
  const place=()=>{world.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.z})`};
  const size=n=>{const d=box.querySelector(`[data-id="${CSS.escape(n.id)}"]`);return d?[d.offsetWidth,d.offsetHeight]:[120,36]};
  const drawEdges=()=>{const by=new Map(data.nodes.map(n=>[n.id,n]));let mx=0,my=0;data.nodes.forEach(n=>{const [w,h]=size(n);mx=Math.max(mx,n.x+w+40);my=Math.max(my,n.y+h+40)});svg.setAttribute('width',mx);svg.setAttribute('height',my);
    svg.innerHTML=data.edges.map((e,i)=>{const a=by.get(e[0]),b=by.get(e[1]);if(!a||!b)return '';const [aw,ah]=size(a),[bw,bh]=size(b);let x1=a.x+aw,y1=a.y+ah/2,x2=b.x,y2=b.y+bh/2;if(b.x+bw/2<a.x+aw/2){x1=a.x;x2=b.x+bw}const dx=Math.max(30,Math.abs(x2-x1)/2)*(x2>=x1?1:-1);
      return `<path d="M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}" class="mm-e${selE===i?' on':''}" data-e="${i}"/>`}).join('')};
  const drawNodes=()=>{box.innerHTML=data.nodes.map(n=>`<div class="mm-node${n.c?' c-'+n.c:''}${sel===n.id?' on':''}" data-id="${esc(n.id)}" style="left:${+n.x||0}px;top:${+n.y||0}px">${mmLabel(n.t)||'&nbsp;'}</div>`).join('');drawEdges()};
  const draw=()=>{drawNodes();place()};
  const changed=()=>{if(o.onChange)o.onChange(data)};
  const fit=()=>{if(!data.nodes.length){V.x=40;V.y=40;V.z=1;place();return}let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;data.nodes.forEach(n=>{const [w,h]=size(n);x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+w);y1=Math.max(y1,n.y+h)});
    const W=el.clientWidth||600,H=el.clientHeight||400;V.z=Math.max(0.25,Math.min(1.5,Math.min((W-40)/(x1-x0||1),(H-80)/(y1-y0||1))));V.x=(W-(x1-x0)*V.z)/2-x0*V.z;V.y=(H-(y1-y0)*V.z)/2-y0*V.z+10;place()};
  const pt=e=>{const r=el.getBoundingClientRect();return [(e.clientX-r.left-V.x)/V.z,(e.clientY-r.top-V.y)/V.z]};
  const add=(x,y,from)=>{const n={id:uid(),t:'',x:Math.round(x),y:Math.round(y),c:''};data.nodes.push(n);if(from)data.edges.push([from,n.id]);sel=n.id;selE=null;draw();changed();editNode(n)};
  const child=()=>{const p=data.nodes.find(n=>n.id===sel);if(!p){const c=[(el.clientWidth/2-V.x)/V.z,(el.clientHeight/2-V.y)/V.z];add(c[0],c[1]);return}const [w]=size(p),kids=data.edges.filter(e=>e[0]===p.id).length;add(p.x+w+70,p.y+kids*52,p.id)};
  const del=()=>{if(selE!=null){data.edges.splice(selE,1);selE=null;draw();changed();return}if(!sel)return;data.nodes=data.nodes.filter(n=>n.id!==sel);data.edges=data.edges.filter(e=>e[0]!==sel&&e[1]!==sel);sel=null;draw();changed()};
  function editNode(n){if(!o.edit||!n)return;const d=box.querySelector(`[data-id="${CSS.escape(n.id)}"]`);if(!d)return;d.innerHTML=`<textarea class="mm-ta" aria-label="Card text" rows="2">${esc(n.t||'')}</textarea>`;const ta=d.querySelector('textarea');ta.focus();ta.select();
    const done=keep=>{if(!ta.isConnected)return;if(keep!==false&&ta.value!==n.t){n.t=ta.value.slice(0,300);changed()}drawNodes()};
    const born=Date.now();ta.onblur=()=>{if(Date.now()-born<500){setTimeout(()=>{if(ta.isConnected)ta.focus()},0);return}done()};ta.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();done();el.focus()}else if(e.key==='Escape'){done(false);el.focus()}else if(e.key==='Tab'){e.preventDefault();done();child()}};ta.onpointerdown=e=>e.stopPropagation()}
  let drag=null;
  el.onpointerdown=e=>{if(e.target.closest('.mm-bar')||e.target.closest('.mm-ta'))return;const nd=e.target.closest('.mm-node'),ed=e.target.closest('.mm-e');
    if(nd){const n=data.nodes.find(x=>x.id===nd.dataset.id);const a=e.target.closest('a[data-ref]');if(a&&!o.edit)return;
      if(linking&&sel&&n&&n.id!==sel){if(!data.edges.some(x=>x[0]===sel&&x[1]===n.id||x[1]===sel&&x[0]===n.id))data.edges.push([sel,n.id]);linking=false;el.classList.remove('linking');sel=n.id;draw();changed();return}
      sel=n.id;selE=null;box.querySelectorAll('.mm-node.on').forEach(x=>x.classList.remove('on'));nd.classList.add('on');drawEdges();if(o.edit){const p=pt(e);drag={n,dx:p[0]-n.x,dy:p[1]-n.y,moved:false,id:e.pointerId};el.setPointerCapture(e.pointerId)}return}
    if(ed&&o.edit){selE=+ed.dataset.e;sel=null;drawNodes();return}
    sel=null;selE=null;linking=false;el.classList.remove('linking');box.querySelectorAll('.mm-node.on').forEach(x=>x.classList.remove('on'));drawEdges();drag={pan:true,x:e.clientX-V.x,y:e.clientY-V.y,id:e.pointerId};el.setPointerCapture(e.pointerId)};
  el.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;if(drag.pan){V.x=e.clientX-drag.x;V.y=e.clientY-drag.y;place();return}const p=pt(e);drag.n.x=Math.round(p[0]-drag.dx);drag.n.y=Math.round(p[1]-drag.dy);drag.moved=true;
    const d=box.querySelector(`[data-id="${CSS.escape(drag.n.id)}"]`);if(d){d.style.left=drag.n.x+'px';d.style.top=drag.n.y+'px'}drawEdges()};
  let tap={t:0,x:0,y:0};
  el.onpointerup=e=>{const d=drag;if(d&&d.moved)changed();drag=null;
    if(e.pointerType!=='mouse'&&o.edit&&!(d&&d.moved)&&!e.target.closest('.mm-bar,.mm-ta')){const now=Date.now();if(now-tap.t<400&&Math.abs(e.clientX-tap.x)<30&&Math.abs(e.clientY-tap.y)<30){tap.t=0;el.ondblclick(e);return}tap={t:now,x:e.clientX,y:e.clientY}}};
  el.ondblclick=e=>{if(!o.edit||e.target.closest('.mm-bar'))return;const nd=e.target.closest('.mm-node');if(nd){editNode(data.nodes.find(x=>x.id===nd.dataset.id));return}const p=pt(e);add(p[0]-50,p[1]-16)};
  el.onwheel=e=>{if(!e.ctrlKey&&!e.metaKey&&Math.abs(e.deltaY)<40&&!o.wheel)return;e.preventDefault();const r=el.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top,z=Math.max(0.2,Math.min(2.5,V.z*(e.deltaY<0?1.12:1/1.12)));V.x=cx-(cx-V.x)*z/V.z;V.y=cy-(cy-V.y)*z/V.z;V.z=z;place()};
  el.onkeydown=e=>{if(!o.edit||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;if(e.key==='Tab'){e.preventDefault();child()}else if(e.key==='Enter'&&sel){e.preventDefault();editNode(data.nodes.find(x=>x.id===sel))}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();del()}};
  el.onclick=e=>{const a=e.target.closest('a[data-ref]');if(a){e.preventDefault();return}const b=e.target.closest('[data-mm],[data-mmc]');if(!b)return;
    if(b.dataset.mmc!=null){const n=data.nodes.find(x=>x.id===sel);if(n){n.c=b.dataset.mmc;drawNodes();changed()}return}
    const k=b.dataset.mm,zoom=f=>{const cx=el.clientWidth/2,cy=el.clientHeight/2,z=Math.max(0.2,Math.min(2.5,V.z*f));V.x=cx-(cx-V.x)*z/V.z;V.y=cy-(cy-V.y)*z/V.z;V.z=z;place()};
    if(k==='in')zoom(1.25);else if(k==='out')zoom(0.8);else if(k==='fit')fit();else if(k==='child')child();else if(k==='del')del();else if(k==='edit')editNode(data.nodes.find(x=>x.id===sel));
    else if(k==='link'){if(!sel){toast('Select a card first, then press Link and click the card to link it to');return}linking=true;el.classList.add('linking');toast('Now click the card to link to')}};
  draw();if(o.fit!==false)requestAnimationFrame(fit);return {fit,draw,data}}
// ── the links graph, as Obsidian draws it: every note a dot, every [[link]] between notes a line; things on the site
// that notes link to are smaller grey dots. Laid out by a small force simulation; drag to pan, wheel or buttons to zoom.
function graphLayout(nodes,edges){const N=nodes.length,idx=new Map(nodes.map((n,i)=>[n.id,i]));nodes.forEach((n,i)=>{const a=i*2.399963,r=30*Math.sqrt(i+1);n.x=Math.cos(a)*r;n.y=Math.sin(a)*r;n.vx=0;n.vy=0});
  const E=edges.map(e=>[idx.get(e[0]),idx.get(e[1])]).filter(e=>e[0]!=null&&e[1]!=null);
  for(let it=0;it<260;it++){const t=1-it/260;for(let i=0;i<N;i++){const a=nodes[i];for(let j=i+1;j<N;j++){const b=nodes[j];let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+0.01;if(d2>250000)continue;const f=2200/d2;dx*=f;dy*=f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy}}
    E.forEach(([i,j])=>{const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)+0.01,f=(d-90)*0.02;a.vx+=dx/d*f*d/10;a.vy+=dy/d*f*d/10;b.vx-=dx/d*f*d/10;b.vy-=dy/d*f*d/10});
    nodes.forEach(n=>{n.vx-=n.x*0.004;n.vy-=n.y*0.004;const s=Math.min(1,Math.sqrt(n.vx*n.vx+n.vy*n.vy));const m=Math.min(18*t+1,Math.sqrt(n.vx*n.vx+n.vy*n.vy))/(s>0?Math.sqrt(n.vx*n.vx+n.vy*n.vy):1);n.x+=n.vx*m;n.y+=n.vy*m;n.vx*=0.5;n.vy*=0.5})}
  return E}
function graphView(el,nodes,edges,onOpen){const E=graphLayout(nodes,edges),deg=new Map();E.forEach(([i,j])=>{deg.set(i,(deg.get(i)||0)+1);deg.set(j,(deg.get(j)||0)+1)});
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;nodes.forEach(n=>{x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x);y1=Math.max(y1,n.y)});const pad=60,ox=-x0+pad,oy=-y0+pad;
  el.classList.add('mm-wrap','gr-wrap');el.innerHTML=`<div class="mm-world"><svg class="gr-svg" width="${x1-x0+pad*2}" height="${y1-y0+pad*2}" role="img" aria-label="Graph of linked notes">${E.map(([i,j])=>`<line x1="${nodes[i].x+ox}" y1="${nodes[i].y+oy}" x2="${nodes[j].x+ox}" y2="${nodes[j].y+oy}" data-a="${i}" data-b="${j}"/>`).join('')}
    ${nodes.map((n,i)=>{const r=n.site?4:5+Math.min(9,(deg.get(i)||0)*1.5);return `<g class="gr-n${n.site?' site':''}${n.kind==='map'?' map':''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(n.t)}"><circle cx="${n.x+ox}" cy="${n.y+oy}" r="${r}"/><text x="${n.x+ox}" y="${n.y+oy+r+12}">${esc(String(n.t).slice(0,28))}</text></g>`}).join('')}</svg></div>
    <div class="mm-bar"><span class="note" style="margin:0">${nodes.filter(n=>!n.site).length} notes · ${E.length} links</span><span style="flex:1"></span><button type="button" class="btn" data-mm="out" aria-label="Zoom out">−</button><button type="button" class="btn" data-mm="in" aria-label="Zoom in">+</button><button type="button" class="btn" data-mm="fit">Fit</button></div>`;
  const world=el.querySelector('.mm-world'),svg=el.querySelector('svg'),V={x:0,y:0,z:1},place=()=>{world.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.z})`};
  const fit=()=>{const W=el.clientWidth||600,H=el.clientHeight||400,w=+svg.getAttribute('width'),h=+svg.getAttribute('height');V.z=Math.max(0.2,Math.min(1.6,Math.min(W/w,(H-40)/h)));V.x=(W-w*V.z)/2;V.y=(H-40-h*V.z)/2;place()};
  const hi=i=>{svg.classList.toggle('focus',i!=null);svg.querySelectorAll('.on').forEach(x=>x.classList.remove('on'));if(i==null)return;svg.querySelector(`g[data-i="${i}"]`).classList.add('on');svg.querySelectorAll(`line[data-a="${i}"],line[data-b="${i}"]`).forEach(l=>{l.classList.add('on');svg.querySelector(`g[data-i="${l.dataset.a==i?l.dataset.b:l.dataset.a}"]`).classList.add('on')})};
  svg.onmouseover=e=>{const g=e.target.closest('g[data-i]');hi(g?+g.dataset.i:null)};svg.onmouseleave=()=>hi(null);
  let drag=null,moved=false;el.onpointerdown=e=>{if(e.target.closest('.mm-bar'))return;drag={x:e.clientX-V.x,y:e.clientY-V.y,id:e.pointerId,sx:e.clientX,sy:e.clientY};moved=false};
  el.onpointermove=e=>{if(!drag)return;if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>4){moved=true;el.setPointerCapture(drag.id)}if(moved){V.x=e.clientX-drag.x;V.y=e.clientY-drag.y;place()}};
  el.onpointerup=e=>{const d=drag;drag=null;if(moved||!d)return;const g=document.elementFromPoint(e.clientX,e.clientY);const n=g&&g.closest&&g.closest('g[data-i]');if(n&&onOpen)onOpen(nodes[+n.dataset.i])};
  el.onkeydown=e=>{const g=e.target.closest&&e.target.closest('g[data-i]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onOpen&&onOpen(nodes[+g.dataset.i])}};
  el.onwheel=e=>{e.preventDefault();const r=el.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top,z=Math.max(0.15,Math.min(3,V.z*(e.deltaY<0?1.12:1/1.12)));V.x=cx-(cx-V.x)*z/V.z;V.y=cy-(cy-V.y)*z/V.z;V.z=z;place()};
  el.onclick=e=>{const b=e.target.closest('[data-mm]');if(!b)return;const k=b.dataset.mm;if(k==='fit')return fit();const f=k==='in'?1.25:0.8,cx=el.clientWidth/2,cy=el.clientHeight/2,z=Math.max(0.15,Math.min(3,V.z*f));V.x=cx-(cx-V.x)*z/V.z;V.y=cy-(cy-V.y)*z/V.z;V.z=z;place()};
  requestAnimationFrame(fit)}
// the graph of a set of notes {id,t,body,kind}: lines for [[links]] between them (by title), grey dots for site items they link to
function graphOf(notes){const byT=new Map(notes.map(n=>[lc((n.t||'').trim()),n.id])),nodes=notes.map(n=>({id:n.id,t:n.t||'Untitled',kind:n.kind})),edges=[],site=new Map(),seen=new Set();
  notes.forEach(n=>{const txt=(n.body||'')+' '+(n.mapText||'');(txt.match(/\[\[([^\]]{1,80})\]\]/g)||[]).forEach(m=>{const name=m.slice(2,-2).trim(),to=byT.get(lc(name));let id=to;
    if(!id){const x=resolveLink(name);if(!x)return;id='site:'+ref(x);if(!site.has(id)){site.set(id,1);nodes.push({id,t:x.n.split(' - ')[0],site:true,x})}}
    const k=[n.id,id].sort().join('|');if(id!==n.id&&!seen.has(k)){seen.add(k);edges.push([n.id,id])}})});
  return {nodes,edges}}
const mapText=d=>((d&&d.nodes)||[]).map(n=>n.t||'').join('\n');

// ════════════════════════════════════════════════════════════════
//  The Archive: notes and mind maps for anyone signed in (archive_items)
// ════════════════════════════════════════════════════════════════
// Your own items, and items shared with a campaign you are in. The owner shares an item with a campaign (members read it,
// or edit it if allowed) or makes a link: anyone who opens the link sees that one item and can save a copy.
var ARC={items:[],state:'idle',err:'',uid:null,cur:null,view:'',scope:'',q:'',linked:null,chan:null,timer:null,flush:null,mapView:{}};
const arDB=()=>typeof CL!=='undefined'&&CL.on&&CL.sb?CL.sb:null;
const arMine=it=>!!(it&&CL.user&&it.owner===CL.user.id);
const arCanEdit=it=>!!it&&(arMine(it)||it.can_edit&&!!it.campaign_id&&CL.camps.some(k=>k.id===it.campaign_id));
const arCamp=id=>(CL.camps||[]).find(k=>k.id===id);
const arToken=()=>{const m=/[?&#]a=([A-Za-z0-9]{20,40})(?![A-Za-z0-9])/.exec(location.search+location.hash);return m?m[1]:''};
function arNewToken(){const a='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',b=new Uint32Array(24);crypto.getRandomValues(b);return [...b].map(x=>a[x%a.length]).join('')}
function arLinkUrl(t){if(SITE){const u=new URL(pageUrl('archive'),location.href);u.search='?a='+t;u.hash='';return u.href}return location.href.split('#')[0]+'#/archive?a='+t}
const arUUID=()=>{if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)};
const AR_COLS='id,owner,kind,title,body,data,campaign_id,can_edit,audience,link,updated_at,updated_by';
async function arLoad(){const db=arDB();if(!db||!CL.user)return;ARC.uid=CL.user.id;ARC.state='loading';
  const {data,error}=await db.from('archive_items').select(AR_COLS).order('updated_at',{ascending:false});
  if(error){ARC.state='error';ARC.err=dbMissing(error,'archive_items')?'setup':'net'}else{ARC.items=(data||[]).map(arFix);ARC.state='ready';arSubscribe()}
  if(TAB==='archive')renderArchive()}
// kinds of Archive item: a note, a mind map, an NPC contact, a quest, and a campaign's party notebook
const AR_KIND={note:['📄','Note','Notes'],map:['🧠','Mind map','Mind maps'],npc:['👤','Contact','Contacts'],quest:['📜','Quest','Quests'],party:['📓','Party notebook','Party notebooks']};
const AR_ATT=['Friendly','Neutral','Wary','Hostile','Unknown'],AR_QST=['Open','Done','Failed'];
const AR_FIELDS={npc:[['where','Where we met','The Gilded Goat, Millbrook'],['wants','What they want','A map of the old mine'],['faction','Faction or group','The Ash Cult'],['last','Last time we saw them','Said to meet at the mill at dawn']],quest:[['giver','Given by','[[Duke Varn]]'],['reward','Reward promised','500 gp and a horse'],['where','Where','The old mine'],['rgp','Reward coin (gp)','250'],['ritems','Reward items','2 × Steel, Healing Potion'],['due','Due on day','30']]};
const arText=it=>it.kind!=='map';
// tags: the item's own tags plus any #hashtag in its text
function arTags(it){const t=new Set((Array.isArray(it.data&&it.data.tags)?it.data.tags:[]).map(x=>lc(String(x)).replace(/^#/,'')).filter(Boolean));(String(it.body||'').match(/(^|\s)#([A-Za-z][\w-]{1,30})/g)||[]).forEach(m=>t.add(lc(m.trim().slice(1))));return [...t].slice(0,30)}
function arSub(it){const d=it.data||{};if(it.kind==='npc')return [d.att&&d.att!=='Unknown'?d.att:'',d.where||'',d.faction||''].filter(Boolean).join(' · ');if(it.kind==='quest')return [d.status||'Open',d.giver?'from '+dmPadPlain(d.giver):''].filter(Boolean).join(' · ');return ''}
function arFix(r){r=Object.assign({},r);r.kind=AR_KIND[r.kind]?r.kind:'note';r.audience=r.audience==='dm'?'dm':'all';if(!r.data||typeof r.data!=='object'||Array.isArray(r.data))r.data={};
  if(Array.isArray(r.data.tags))r.data.tags=r.data.tags.map(x=>String(x).slice(0,32)).slice(0,20);['where','wants','faction','last','giver','reward','rgp','ritems','due'].forEach(k=>{if(r.data[k]!=null)r.data[k]=String(r.data[k]).slice(0,300)});
  if(r.data.att!=null&&!AR_ATT.includes(r.data.att))r.data.att='Unknown';if(r.data.status!=null&&!AR_QST.includes(r.data.status))r.data.status='Open';if(r.kind==='map'){r.data.nodes=Array.isArray(r.data.nodes)?r.data.nodes.filter(n=>n&&n.id).map(n=>({id:String(n.id).slice(0,40),t:String(n.t||'').slice(0,300),x:+n.x||0,y:+n.y||0,c:MM_COLORS.includes(n.c)?n.c:''})):[];r.data.edges=Array.isArray(r.data.edges)?r.data.edges.filter(e=>Array.isArray(e)&&e.length===2).map(e=>[String(e[0]),String(e[1])]):[]}return r}
function arSubscribe(){const db=arDB();if(!db||!db.channel)return;if(ARC.chan){db.removeChannel(ARC.chan);ARC.chan=null}if(!CL.camps.length)return;const ch=db.channel('fand-archive');
  CL.camps.forEach(k=>ch.on('postgres_changes',{event:'*',schema:'public',table:'archive_items',filter:'campaign_id=eq.'+k.id},arEvent));ARC.chan=ch.subscribe()}
function arEvent(p){const r=p.new||{},old=p.old||{},id=r.id||old.id;if(!id)return;const i=ARC.items.findIndex(x=>x.id===id);
  if(p.eventType==='DELETE'){if(i>=0&&!arMine(ARC.items[i]))ARC.items.splice(i,1)}else if(r.updated_by!==(CL.user&&CL.user.id)){if(i>=0)ARC.items[i]=arFix(r);else ARC.items.unshift(arFix(r))}else return;
  if(TAB!=='archive')return;const a=document.activeElement;if(ARC.cur===id&&a&&$('content').contains(a)&&/^(INPUT|TEXTAREA)$/.test(a.tagName)){arListOnly();return}renderArchive()}
// typing saves 0.6 s after the last change; anything that redraws the page saves first
const arFlush=()=>{clearTimeout(ARC.timer);if(ARC.flush)ARC.flush()};
function arQueue(it){clearTimeout(ARC.timer);ARC.flush=()=>{ARC.flush=null;arSave(it)};ARC.timer=setTimeout(ARC.flush,600);const s=$('ar-saved');if(s)s.textContent='Saving…'}
async function arSave(it){const db=arDB();if(!db||!arCanEdit(it))return;it.updated_at=new Date().toISOString();const s=()=>$('ar-saved');
  const patch={title:String(it.title||'').slice(0,200),body:String(it.body||''),data:it.data,updated_at:it.updated_at};
  const {error}=it._new?await db.from('archive_items').insert(Object.assign({id:it.id,owner:CL.user.id,kind:it.kind,campaign_id:it.campaign_id||null,can_edit:!!it.can_edit,audience:it.audience==='dm'?'dm':'all',link:it.link||null},patch)):await db.from('archive_items').update(patch).eq('id',it.id);
  if(error){if(s())s().textContent=dbMissing(error,'archive_items')?'Not saved: the database isn\'t set up':'Not saved yet: retrying';clearTimeout(ARC.retry);ARC.retry=setTimeout(()=>arSave(it),10000);return}
  delete it._new;if(s())s().textContent='Saved'}
async function arShareSet(it,o){const db=arDB();if(!db||!arMine(it))return;if(it._new)await arSave(it);const was={campaign_id:it.campaign_id,can_edit:it.can_edit,audience:it.audience,link:it.link};Object.assign(it,o);if(!it.campaign_id)it.audience='all';
  const {error}=await db.from('archive_items').update({campaign_id:it.campaign_id||null,can_edit:!!it.can_edit,audience:it.audience==='dm'?'dm':'all',link:it.link||null}).eq('id',it.id);
  if(error){Object.assign(it,was);toast(clMsg(error))}renderArchive();return !error}
// ── quest rewards: a quest in the Archive can carry a reward (coin and items) and a due day; marking it Done (as the DM)
// puts the reward in the loot pool, once ──
function questItems(txt){return String(txt||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=/^(\d+)\s*(?:×|x|\*)?\s+(.+)$/i.exec(x);const q=m?Math.max(1,+m[1]):1,raw=(m?m[2]:x).trim(),it=findBP(raw)||findMat(raw);return {n:it?it.n:raw,q}})}
function questPay(it){const d=it.data||{};if(d.paid||role()==='player')return;const gpv=Math.max(0,Math.round((+String(d.rgp||'').replace(/[^\d.]/g,'')||0)*100)/100),items=questItems(d.ritems);if(!gpv&&!items.length)return;
  const P=lootPool();items.forEach(x=>{const r=P.items.find(y=>lc(y.n)===lc(x.n));if(r)r.q+=x.q;else P.items.push({n:x.n,q:x.q})});P.gp=Math.round((P.gp+gpv)*100)/100;if(!P.from)P.from='the quest: '+(it.title||'a quest');store.set('lootpool',P);
  it.data=Object.assign({},d,{paid:Date.now()});arQueue(it);const L=store.get('questlog',[]);L.unshift({at:Date.now(),t:`Quest done: ${it.title||'a quest'}${gpv||items.length?' (reward: '+[gpv?gp(gpv):'',items.map(x=>(x.q>1?x.q+' × ':'')+x.n).join(', ')].filter(Boolean).join(', ')+')':''}`});store.set('questlog',L.slice(0,100));
  actToast(`Quest done: the reward for ${it.title||'it'} is in the loot pool`,'Open the pool',()=>lootOpen())}
// open quests with a due day, for the calendar
const questsDue=()=>(typeof ARC!=='undefined'&&ARC.items||[]).filter(x=>x.kind==='quest'&&(x.data||{}).status!=='Done'&&(x.data||{}).status!=='Failed'&&+(x.data||{}).due>0).map(x=>({day:+x.data.due,t:'Quest due: '+(x.title||'a quest'),quest:1}));
function arNew(kind,o){if(ARC.state!=='ready')return;arFlush();const it=Object.assign({id:arUUID(),owner:CL.user.id,kind,title:{map:'New mind map',npc:'New contact',quest:'New quest'}[kind]||'New note',body:'',data:kind==='map'?{nodes:[{id:uid(),t:'Main idea',x:0,y:0,c:'gold'}],edges:[]}:kind==='npc'?{att:'Unknown'}:kind==='quest'?{status:'Open'}:{},campaign_id:ARC.scope&&ARC.scope!=='mine'?ARC.scope:null,can_edit:false,audience:'all',link:null,updated_at:new Date().toISOString(),_new:true},o||{});
  ARC.items.unshift(it);ARC.cur=it.id;ARC.view=kind==='map'?'':'edit';if(ARC.kind&&ARC.kind!==kind)ARC.kind='';arSave(it);renderArchive();setTimeout(()=>{const t=$('ar-title'),f=document.activeElement,busy=f&&f!==t&&$('content').contains(f)&&/^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName);if(t&&!o&&!busy){t.focus();t.select()}},40);return it}
async function arDelete(){const it=ARC.items.find(x=>x.id===ARC.cur),db=arDB();if(!it||!arMine(it)||!db)return;arFlush();const i=ARC.items.indexOf(it);ARC.items.splice(i,1);ARC.cur=null;renderArchive();
  const {error}=it._new?{error:null}:await db.from('archive_items').delete().match({id:it.id});if(error){ARC.items.splice(i,0,it);ARC.cur=it.id;renderArchive();toast(clMsg(error));return}
  undoToast('Deleted “'+(it.title||'Untitled')+'”',()=>{it._new=true;ARC.items.splice(i,0,it);ARC.cur=it.id;arSave(it).then(()=>it.link||it.campaign_id?arShareSet(it,{}):0);renderArchive()})}
async function arOpenLink(t){const db=arDB();if(!db)return;ARC.linked={state:'loading',t};const {data,error}=await db.rpc('fand_archive_open',{p_link:t});
  const r=Array.isArray(data)?data[0]:data;ARC.linked=error?{state:'error',t,err:dbMissing(error,'fand_archive_open')||/function/i.test(error.message||'')?'setup':'net'}:r?{state:'ready',t,it:arFix(r)}:{state:'none',t};
  if(r&&r.mine){ARC.cur=r.id;ARC.linked=null}if(TAB==='archive')renderArchive()}
function arCopy(src){const it=arNew(src.kind,{title:(src.title||'Untitled')+(arMine(src)?' (copy)':''),body:src.body||'',data:JSON.parse(JSON.stringify(src.data||{})),campaign_id:null});if(it){ARC.linked=null;toast('Saved a copy to your archive');renderArchive()}}
function arItemsShown(noTag){const q=lc(ARC.q||''),sc=ARC.scope,kd=ARC.kind,tg=ARC.tag;const qs={Open:0,Done:1,Failed:2};
  const L=ARC.items.filter(it=>(!sc||(sc==='mine'?arMine(it)&&!it.campaign_id:it.campaign_id===sc))&&(!kd||it.kind===kd)&&(noTag||!tg||arTags(it).includes(tg))&&(!q||lc(it.title+' '+it.body+' '+mapText(it.data)+' '+Object.values(it.data||{}).filter(v=>typeof v==='string').join(' ')+' '+arTags(it).join(' ')).includes(q)));
  return kd==='quest'?L.slice().sort((a,b)=>(qs[(a.data||{}).status]||0)-(qs[(b.data||{}).status]||0)):kd==='npc'?L.slice().sort((a,b)=>lc(a.title).localeCompare(lc(b.title))):L}
function arListHTML(){const L=arItemsShown();return L.map(it=>{const k=arCamp(it.campaign_id);const snip=it.kind==='map'?((it.data&&it.data.nodes)||[]).slice(0,4).map(n=>dmPadPlain(n.t)).filter(Boolean).join(' · '):dmPadPlain(it.body||'').replace(/^#+\s*/gm,'').replace(/^\s*[-*]\s+(\[[ xX]\]\s*)?/gm,'').replace(/\s+/g,' ').trim(),tg=arTags(it).slice(0,3);
  return `<button type="button" class="dp-item ar-card k-${it.kind}${it.id===ARC.cur?' on':''}" data-arit="${esc(it.id)}"><b>${AR_KIND[it.kind][0]} ${esc(it.title||'Untitled')}</b>${arSub(it)?`<small class="ar-sub">${esc(arSub(it))}</small>`:''}<small>${it.audience==='dm'?'🔒 DM only · ':''}${k?'👥 '+esc(k.name)+(it.can_edit?' · editable':''):arMine(it)?'Private':''}${it.link?' · 🔗':''}${!arMine(it)?' · shared with you':''} · ${esc(new Date(it.updated_at).toLocaleDateString())}</small>${snip?`<span class="ar-snip">${esc(snip.slice(0,110))}</span>`:''}${tg.length?`<span class="ar-ctags">${tg.map(t=>'#'+esc(t)).join(' ')}</span>`:''}</button>`}).join('')||`<div class="note" style="margin:6px">${ARC.q||ARC.kind||ARC.tag?'Nothing matches.':'Nothing here yet. Make a note, a mind map, a contact or a quest.'}</div>`}
function arListOnly(){const l=$('ar-items');if(l)l.innerHTML=arListHTML()}
function arMdHTML(b){const T=new Map(ARC.items.map(x=>[lc((x.title||'').trim()),x.id]));return dmPadMd(b).replace(/<input type="checkbox"/g,'<input type="checkbox" disabled').replace(/<span class="dp-miss"[^>]*>([^<]*)<\/span>/g,(m,n)=>{const id=T.get(lc(n.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')));return id?`<a href="#" data-arlink="${esc(id)}">${n}</a>`:m})}
function arShareHTML(it){if(it.kind==='party'){const k=arCamp(it.campaign_id);return `<div class="ar-share note">📓 The party notebook of <b>${esc(k?k.name:'your campaign')}</b>: every member reads and edits it.</div>`}
  if(!arMine(it))return `<div class="ar-share note">${arCamp(it.campaign_id)?'Shared with '+esc(arCamp(it.campaign_id).name)+(arCanEdit(it)?': you can edit it.':': read only.'):'Shared with you.'} <button type="button" class="btn" data-ar="copy">Save a copy</button></div>`;
  return `<details class="ar-share"${it.campaign_id||it.link?' open':''}><summary>Share${it.campaign_id?' · 👥 '+esc((arCamp(it.campaign_id)||{}).name||'a campaign'):''}${it.link?' · 🔗 link on':''}</summary>
    <div class="ar-share-b"><label class="note" style="margin:0">Campaign <select class="sel" id="ar-camp" style="width:auto"><option value="">Not shared</option>${(CL.camps||[]).map(k=>`<option value="${esc(k.id)}"${it.campaign_id===k.id?' selected':''}>${esc(k.name)}</option>`).join('')}</select></label>
      ${it.campaign_id?`<label class="note" style="margin:0">Who sees it <select class="sel" id="ar-aud" style="width:auto"><option value="all">Everyone in the campaign</option><option value="dm"${it.audience==='dm'?' selected':''}>Only the DM</option></select></label><label class="chk"><input type="checkbox" id="ar-edit"${it.can_edit?' checked':''}> ${it.audience==='dm'?'The DM can edit':'Members can edit'}</label>`:''}
      <span style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${it.link?`<button type="button" class="btn" data-ar="copylink">🔗 Copy link</button><button type="button" class="btn" data-ar="unlink" title="The link stops working">Stop sharing the link</button>`:`<button type="button" class="btn" data-ar="link" title="Anyone with the link can see this item (and only this item) and save a copy">🔗 Make a link</button>`}</span></div>
    <p class="note" style="margin:4px 0 0">${(CL.camps||[]).length?'Shared with a campaign, it shows in its members\' Archive; "Only the DM" keeps it from the other players (secrets, theories, plans). ':''}A link shows this one item to anyone who has it, signed in or not; they can save their own copy, never change yours.</p></details>`}
function arEditorHTML(it){const can=arCanEdit(it),v=it.kind==='map'?'map':(ARC.view||(can?'edit':'read'));
  const views=arText(it)?`<span class="ar-views" role="tablist">${can?`<button type="button" class="btn${v==='edit'?' primary':''}" data-arv="edit">✎ Edit</button>`:''}<button type="button" class="btn${v==='read'?' primary':''}" data-arv="read">👁 Read</button><button type="button" class="btn${v==='mind'?' primary':''}" data-arv="mind" title="The note's headings and lists as a mind map">🧠 Mind map</button></span>`:'';
  const tools=arText(it)&&v==='edit'?`<div class="dp-tools" role="toolbar" aria-label="Formatting"><button type="button" class="btn" data-arf="h" title="Heading">H</button><button type="button" class="btn" data-arf="b" title="Bold"><b>B</b></button><button type="button" class="btn" data-arf="li">• List</button><button type="button" class="btn" data-arf="ck">☐ Checklist</button></div>`:'';
  const main=it.kind==='map'?`<div class="ar-board" id="ar-board"></div><p class="note" style="margin:4px 0 0">${can?(matchMedia('(pointer:coarse)').matches?'Double-tap empty space for a new card, double-tap a card to write in it, drag cards to move them. + Card adds a card linked to the selected one.':'Double-click empty space for a new card, double-click a card to write in it, drag cards to move them. Tab adds a linked card.')+' Type [[a name]] in a card to link a monster, item or note.':'Drag to look around.'}</p>`
    :v==='edit'?`<textarea class="sel ar-body" id="ar-body" aria-label="Note" placeholder="${it.kind==='quest'?'Clues and steps: - [ ] a checklist ticks off as you go. #tags work here too.':it.kind==='npc'?'What we know about them, what they said, what they look like. [[Link]] other contacts and quests.':it.kind==='party'?'Anything the whole party should keep: plans, the shopping list, who owes what, what the NPCs told us.':'Write anything.'} ## a heading, - a list (indent for sub-points), **bold**, #tag, [[a monster, item, spell or another note]].">${esc(it.body||'')}</textarea>`
    
    :v==='mind'?`<div class="ar-board" id="ar-board"></div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn" data-ar="tomap" title="A mind map you can rearrange and add to, made from this note">Make an editable mind map from this</button></div>`
    :`<div class="dp-read ar-read" id="ar-read">${arMdHTML(it.body)||'<p class="note">Nothing written yet.</p>'}</div>`;
  const d=it.data||{},dis=can?'':' disabled',F=AR_FIELDS[it.kind]||[];
  const fields=it.kind==='npc'||it.kind==='quest'?`<div class="ar-fields">${it.kind==='npc'?`<label>Attitude to us<select class="sel" data-arfld="att"${dis}>${AR_ATT.map(a=>`<option${(d.att||'Unknown')===a?' selected':''}>${a}</option>`).join('')}</select></label>`:`<label>Status<select class="sel" data-arfld="status"${dis}>${AR_QST.map(a=>`<option${(d.status||'Open')===a?' selected':''}>${a}</option>`).join('')}</select></label>`}
      ${F.map(([k,l,ph])=>`<label>${l}<input class="sel" data-arfld="${k}" maxlength="300" placeholder="${esc(ph)}" value="${esc(d[k]||'')}"${can?'':' readonly'}></label>`).join('')}</div>`:'';
  const tags=`<label class="ar-tags note">Tags <input class="sel" id="ar-tags" placeholder="clue, lore, #villain" value="${esc((Array.isArray(d.tags)?d.tags:[]).join(', '))}"${can?'':' readonly'}></label>`;
  return `<div class="ar-ed ar-k-${it.kind}"><div class="ar-top"><span class="ar-kind" title="${AR_KIND[it.kind][1]}">${AR_KIND[it.kind][0]}</span><input class="sel dp-title" id="ar-title" aria-label="Title" value="${esc(it.title||'')}"${can?'':' readonly'}><span class="dp-saved" id="ar-saved" aria-live="polite">${can?'':'Read only'}</span></div>
    ${fields}<div class="ar-row">${views}<span style="flex:1"></span>${arMine(it)&&it.kind!=='party'?'<button type="button" class="btn" data-ar="del">Delete</button>':''}</div>${tools}${main}${tags}${arShareHTML(it)}</div>`}
function renderArchive(){arFlush();if(!ARC.sec){try{ARC.sec=sessionStorage.getItem('fand.nbsec')||'all';sessionStorage.removeItem('fand.nbsec')}catch(e){ARC.sec='all'}ARC.kind=['note','map','npc','quest'].includes(ARC.sec)?ARC.sec:'';if(ARC.sec==='graph')ARC.view='graph';if(/^party:/.test(ARC.sec)){const c=ARC.sec.slice(6);ARC.sec='all';setTimeout(()=>arParty(c),0)}}if(ARC.sec==='journal'){renderJournal();return}if(ARC.sec==='dmpad'&&role()==='player')ARC.sec='all';
  const host=nbFrame(ARC.sec);if(ARC.sec==='dmpad'){nbDmPad(host);return}const head='';
  const tok=arToken();if(tok&&(!ARC.linked||ARC.linked.t!==tok)&&!ARC.items.some(x=>x.link===tok&&arMine(x))){if(arDB())arOpenLink(tok)}
  const L=ARC.linked;let linked='';
  if(L){const it=L.it;linked=L.state==='loading'?'<div class="panel">Opening the shared item…</div>':L.state==='none'?'<div class="panel">This link doesn\'t open anything: its owner may have stopped sharing it.</div>':L.state==='error'?`<div class="panel">${L.err==='setup'?'Shared links need the latest database setup (tools/cloud/schema.sql).':'Couldn\'t open the shared item. Check your connection.'}</div>`
    :`<div class="panel ar-linked"><div class="ar-row"><div><div class="kind">Shared with you by link</div><h3 style="font-family:var(--serif);margin:0">${AR_KIND[it.kind][0]} ${esc(it.title||'Untitled')}</h3></div><span style="flex:1"></span>${CL.user?'<button type="button" class="btn primary" data-ar="savelinked">Save a copy to my archive</button>':'<button type="button" class="btn" data-go="account">Sign in to save a copy</button>'}<button type="button" class="btn" data-ar="closelinked">Close</button></div>
      ${it.kind==='map'?'<div class="ar-board" id="ar-lboard"></div>':`<div class="ar-row" style="margin:6px 0"><button type="button" class="btn${ARC.lview!=='mind'?' primary':''}" data-arlv="read">👁 Read</button><button type="button" class="btn${ARC.lview==='mind'?' primary':''}" data-arlv="mind">🧠 Mind map</button></div>${ARC.lview==='mind'?'<div class="ar-board" id="ar-lboard"></div>':`<div class="dp-read ar-read">${dmPadMd(it.body).replace(/<input type="checkbox"/g,'<input type="checkbox" disabled')||'<p class="note">Empty.</p>'}</div>`}`}</div>`}
  let body='';
  if(!(typeof CL!=='undefined'&&CL.on))body='<div class="panel"><p>The Archive saves to your FAND account, and accounts aren\'t set up on this copy of the site.</p></div>';
  else if(!CL.user)body=`<div class="panel"><p><b>Sign in to use the Archive.</b> Your notes and mind maps are saved to your account, follow you to every device, and are private until you share them.</p><button class="btn primary" data-go="account">Sign in</button></div>`;
  else if(ARC.uid!==CL.user.id||ARC.state==='idle'){ARC.items=[];ARC.cur=null;arLoad();body='<div class="panel">Loading your archive…</div>'}
  else if(ARC.state==='loading')body='<div class="panel">Loading your archive…</div>';
  else if(ARC.state==='error')body=`<div class="panel">${ARC.err==='setup'?'<p><b>The Archive\'s database table isn\'t set up yet.</b> Whoever runs this site\'s Supabase project needs to run <code>tools/cloud/schema.sql</code> again in its SQL Editor (it adds <code>archive_items</code>).</p>':'<p>Your archive couldn\'t be loaded. Check your connection.</p>'}<button class="btn" data-ar="retry">Try again</button></div>`;
  else{const it=ARC.items.find(x=>x.id===ARC.cur);
    const sec=nbSecs().find(x=>x[0]===ARC.sec)||(/^party:/.test(ARC.sec)?['party','📓','Party notebook']:ARC.sec==='graph'?['graph','🕸','Graph']:['all','🗂','Everything']);
    body=`<div class="ar-tool"><h3 class="nb-title">${sec[1]} ${esc(sec[2])}${ARC.tag?` <button type="button" class="chip on" data-nbtagx title="Show every tag">#${esc(ARC.tag)} ✕</button>`:''}</h3>
      <select class="sel" id="ar-scope" style="width:auto" aria-label="Show"><option value="">Everything</option><option value="mine"${ARC.scope==='mine'?' selected':''}>Only mine, not shared</option>${(CL.camps||[]).map(k=>`<option value="${esc(k.id)}"${ARC.scope===k.id?' selected':''}>👥 ${esc(k.name)}</option>`).join('')}</select>
      <input class="sel" id="ar-q" type="search" placeholder="Search the archive…" aria-label="Search the archive" value="${esc(ARC.q||'')}" style="max-width:240px"></div>

      ${ARC.view==='graph'&&!it?'<div class="ar-board ar-graph" id="ar-graph"></div>':/^party:/.test(ARC.sec)&&it?`<div class="ar-main"><button type="button" class="btn nb-back" data-nbback>← Archive</button>${arEditorHTML(it)}</div>`:`<div class="ar-wrap${it?' has-cur':''}"><div class="ar-list" id="ar-items" role="list">${arListHTML()}</div><div class="ar-main">${it?`<button type="button" class="btn nb-back" data-nbback>← ${esc(sec[2])}</button>`+arEditorHTML(it):'<div class="panel note">Pick something on the left, or make something new.</div>'}</div></div>`}`}
  host.innerHTML=`${linked}${body}`;const pg=document.querySelector('.page.nb');if(pg)pg.classList.toggle('nb-open',!!ARC.items.find(x=>x.id===ARC.cur)&&ARC.state==='ready');arBind()}
function arBind(){const C=$('content'),it=ARC.items.find(x=>x.id===ARC.cur);
  C.onclick=e=>{if(e.target.closest('[data-nbtagx]')){ARC.tag='';renderArchive();return}if(e.target.closest('[data-nbback]')){arFlush();ARC.cur=null;ARC.view='';if(/^party:/.test(ARC.sec)){ARC.sec='all';ARC.kind=''}renderArchive();nbTop();return}const a=e.target.closest('a[data-arlink]');if(a){e.preventDefault();arFlush();ARC.cur=a.dataset.arlink;ARC.view='';renderArchive();return}
    const r=e.target.closest('[data-arit]');if(r){arFlush();ARC.cur=r.dataset.arit;ARC.view='';renderArchive();nbTop();return}
    const v=e.target.closest('[data-arv]');if(v){arFlush();ARC.view=v.dataset.arv;renderArchive();return}
    const lv=e.target.closest('[data-arlv]');if(lv){ARC.lview=lv.dataset.arlv;renderArchive();return}
    const f=e.target.closest('[data-arf]');if(f){const t=$('ar-body');if(t)mdFmt(t,f.dataset.arf);return}
    const kf=e.target.closest('[data-arkind]');if(kf){arFlush();ARC.kind=kf.dataset.arkind;ARC.cur=null;renderArchive();return}
    const tf=e.target.closest('[data-artag]');if(tf){arFlush();ARC.tag=ARC.tag===tf.dataset.artag?'':tf.dataset.artag;renderArchive();return}
    const pn=e.target.closest('[data-arparty]');if(pn){arParty(pn.dataset.arparty);return}
    const b=e.target.closest('[data-ar]');if(!b)return;const k=b.dataset.ar;
    if(k==='note'||k==='map'||k==='npc'||k==='quest')arNew(k);else if(k==='graph'){arFlush();ARC.cur=null;ARC.view='graph';renderArchive()}else if(k==='retry'){ARC.state='idle';renderArchive()}
    else if(k==='del')arDelete();else if(k==='graph'){arFlush();ARC.cur=null;ARC.view='graph';ARC.sec='graph';renderArchive()}else if(k==='copy')arCopy(it);else if(k==='savelinked')arCopy(ARC.linked.it);else if(k==='closelinked'){ARC.linked=null;history.replaceState(null,'',location.pathname+(SITE?'':'#/archive'));ARC.skip=true;renderArchive()}
    else if(k==='link')arShareSet(it,{link:arNewToken()}).then(ok=>{if(ok)arCopyLink(it)});else if(k==='unlink')arShareSet(it,{link:null}).then(ok=>{if(ok)toast('The link no longer opens it')});else if(k==='copylink')arCopyLink(it);
    else if(k==='tomap'){const d=mmTreeData(mmFromMd(it.title,it.body));arNew('map',{title:(it.title||'Untitled')+' (mind map)',data:d,campaign_id:it.campaign_id&&arMine(it)?it.campaign_id:null});toast('Mind map made: rearrange and add to it')}};
  const q=$('ar-q');if(q)q.oninput=()=>{ARC.q=q.value;arListOnly()};
  const sc=$('ar-scope');if(sc)sc.onchange=()=>{ARC.scope=sc.value;arListOnly()};
  const cs=$('ar-camp');if(cs)cs.onchange=()=>arShareSet(it,{campaign_id:cs.value||null,can_edit:cs.value?it.can_edit:false}).then(ok=>{if(ok)toast(cs.value?'Shared with '+arCamp(cs.value).name:'No longer shared with a campaign')});
  const ce=$('ar-edit');if(ce)ce.onchange=()=>arShareSet(it,{can_edit:ce.checked});
  const au=$('ar-aud');if(au)au.onchange=()=>arShareSet(it,{audience:au.value}).then(ok=>{if(ok)toast(au.value==='dm'?'Only the DM of '+arCamp(it.campaign_id).name+' sees it now':'Everyone in '+arCamp(it.campaign_id).name+' sees it')});
  if(it){const t=$('ar-title');if(t&&arCanEdit(it))t.oninput=()=>{it.title=t.value;arQueue(it);const li=document.querySelector(`[data-arit="${CSS.escape(it.id)}"] b`);if(li)li.textContent=AR_KIND[it.kind][0]+' '+(t.value||'Untitled')};
    const bd=$('ar-body');if(bd)bd.oninput=()=>{it.body=bd.value;arQueue(it)};
    if(arCanEdit(it)){document.querySelectorAll('[data-arfld]').forEach(el=>{const up=()=>{it.data=Object.assign({},it.data,{[el.dataset.arfld]:el.value.slice(0,300)});arQueue(it);if(el.dataset.arfld==='status'&&el.value==='Done')questPay(it);const li=document.querySelector(`[data-arit="${CSS.escape(it.id)}"]`);if(li){let sub=li.querySelector('.ar-sub');if(!sub){sub=document.createElement('small');sub.className='ar-sub';li.querySelector('b').after(sub)}sub.textContent=arSub(it)}};el.oninput=up;el.onchange=up});
      const tg=$('ar-tags');if(tg)tg.oninput=()=>{it.data=Object.assign({},it.data,{tags:tg.value.split(/[,\s]+/).map(x=>x.replace(/^#/,'').trim()).filter(Boolean).slice(0,20)});arQueue(it)}}
    const bo=$('ar-board');if(bo){const ed=it.kind==='map'&&arCanEdit(it);const data=it.kind==='map'?it.data:mmTreeData(mmFromMd(it.title,it.body));const V=ARC.mapView[it.id+(it.kind==='map'?'':':md')]||(ARC.mapView[it.id+(it.kind==='map'?'':':md')]={x:40,y:40,z:1});
      mmBoard(bo,data,{edit:ed,view:V,fit:!V.seen,onChange:ed?()=>arQueue(it):null});V.seen=true}
}
  const lb=$('ar-lboard');if(lb&&ARC.linked&&ARC.linked.it){const L=ARC.linked.it;mmBoard(lb,L.kind==='map'?JSON.parse(JSON.stringify(L.data)):mmTreeData(mmFromMd(L.title,L.body)),{edit:false})}
  const gr=$('ar-graph');if(gr){const notes=(()=>{const k=ARC.kind;ARC.kind='';const L=arItemsShown();ARC.kind=k;return L})().map(x=>({id:x.id,t:x.title,body:x.body,kind:x.kind,mapText:mapText(x.data)})),G=graphOf(notes);
    if(!notes.length){gr.innerHTML='<div class="note" style="padding:20px">Nothing to draw yet. Make some notes and link them with [[their titles]].</div>';return}
    graphView(gr,G.nodes,G.edges,n=>{if(n.site){openItem(n.x);return}const x=ARC.items.find(y=>y.id===n.id);ARC.sec=x&&x.kind==='party'?'party:'+x.campaign_id:x?x.kind:'all';ARC.kind=ARC.sec.startsWith('party:')?'':ARC.sec;ARC.cur=n.id;ARC.view='';renderArchive()})}}
// ── the Archive page: every kind of note in one place. A sidebar of sections (everything, notes, mind maps, contacts,
// quests, each campaign's party notebook, the Journal, the DM notepad, the graph, tags); the section's list and the open
// item beside it. The Journal page is the same page opened at its section.
function nbSecs(){const S=[['all','🗂','Everything'],['note','📄','Notes'],['map','🧠','Mind maps'],['npc','👤','Contacts'],['quest','📜','Quests']];
  const n=k=>ARC.state==='ready'?ARC.items.filter(x=>k==='all'?x.kind!=='party':x.kind===k).length:'';
  return S.map(([k,i,l])=>[k,i,l,n(k)])}
function nbFrame(sec){const C=$('content'),signed=typeof CL!=='undefined'&&CL.on&&CL.user,ready=signed&&ARC.state==='ready'&&ARC.uid===CL.user.id;
  if(signed&&ARC.state==='idle')arLoad();
  const btn=(k,i,l,c)=>`<button type="button" class="nb-s${sec===k?' on':''}" data-nbsec="${esc(k)}"${sec===k?' aria-current="page"':''}><span class="nb-i" aria-hidden="true">${i}</span><span class="nb-l">${esc(l)}</span>${c!==''&&c!=null?`<span class="nb-c">${c}</span>`:''}</button>`;
  const tags=ready?[...new Set(ARC.items.flatMap(arTags))].sort():[];
  const J=store.get('journal',[]);
  C.innerHTML=`<div class="page nb">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Archive</h3><p>All your notes in one place: notes and mind maps, the people you've met, your quests, the party's shared notebook and the session journal. Private until you share; link anything with <code>[[a name]]</code>.</p></div>
    <div class="nb-grid"><nav class="nb-side" aria-label="Archive sections">
      <label class="nb-pickw"><span class="nb-h">Section</span><select class="sel nb-pick" id="nb-pick" aria-label="Archive section">${nbSecs().map(([k,i,l,c])=>`<option value="${k}"${sec===k?' selected':''}>${i} ${esc(l)}${c!==''?' ('+c+')':''}</option>`).join('')}${ready?(CL.camps||[]).map(k=>`<option value="party:${esc(k.id)}"${sec==='party:'+k.id?' selected':''}>📓 ${esc(k.name)} notebook</option>`).join(''):''}<option value="journal"${sec==='journal'?' selected':''}>📔 Journal</option>${role()!=='player'?`<option value="dmpad"${sec==='dmpad'?' selected':''}>📝 DM notepad</option>`:''}<option value="graph"${sec==='graph'?' selected':''}>🕸 Graph</option></select></label>
      ${ready?`<div class="nb-new"><span class="nb-h">New</span><button type="button" class="btn primary" data-nbnew="note">📄 Note</button><button type="button" class="btn" data-nbnew="map">🧠 Mind map</button><button type="button" class="btn" data-nbnew="npc">👤 Contact</button><button type="button" class="btn" data-nbnew="quest">📜 Quest</button></div>`:''}
      <div class="nb-group">${nbSecs().map(x=>btn(...x)).join('')}</div>
      ${ready&&(CL.camps||[]).length?`<div class="nb-group"><span class="nb-h">Party notebooks</span>${CL.camps.map(k=>btn('party:'+k.id,'📓',k.name,'')).join('')}</div>`:''}
      <div class="nb-group"><span class="nb-h">Table</span>${btn('journal','📔','Journal',J.length||'')}${role()!=='player'?btn('dmpad','📝','DM notepad',''):''}${btn('graph','🕸','Graph','')}</div>
      ${tags.length?`<div class="nb-group nb-tags"><span class="nb-h">Tags</span><div class="chips">${tags.slice(0,40).map(t=>`<button type="button" class="chip ar-tag${ARC.tag===t?' on':''}" data-nbtag="${esc(t)}">#${esc(t)}</button>`).join('')}</div></div>`:''}
    </nav><div class="nb-main" id="nb-main"></div></div></div>`;
  const pk=$('nb-pick');if(pk)pk.onchange=()=>{const b=C.querySelector(`.nb-side [data-nbsec="${CSS.escape(pk.value)}"]`);if(b)b.click();else{ARC.sec=pk.value;ARC.cur=null;ARC.kind='';if(pk.value==='graph')ARC.view='graph';nbGo(pk.value)}};
  C.querySelector('.nb-side').onclick=e=>{const b=e.target.closest('[data-nbsec],[data-nbnew],[data-nbtag]');if(!b)return;arFlush();
    if(b.dataset.nbnew){ARC.sec=b.dataset.nbnew;ARC.kind=b.dataset.nbnew;nbGo('x');arNew(b.dataset.nbnew);return}
    if(b.dataset.nbtag!=null){ARC.tag=ARC.tag===b.dataset.nbtag?'':b.dataset.nbtag;if(['journal','dmpad','graph'].includes(ARC.sec)||/^party:/.test(ARC.sec))ARC.sec='all';ARC.kind=ARC.sec==='all'?'':ARC.sec;ARC.cur=null;nbGo('x');return}
    const k=b.dataset.nbsec;ARC.sec=k;ARC.cur=null;ARC.view='';ARC.kind=['note','map','npc','quest'].includes(k)?k:'';
    if(/^party:/.test(k)){nbGo('x');arParty(k.slice(6));return}if(k==='graph')ARC.view='graph';nbGo(k)};
  return $('nb-main')}
// on a phone the open item replaces the list: bring the top of it into view
function nbTop(){$('content').scrollTop=0;if(matchMedia('(max-width:900px)').matches){const m=$('nb-main');if(m){const y=m.getBoundingClientRect().top+scrollY-70;if(scrollY>y)scrollTo(0,Math.max(0,y))}}}
// draw the section: the Journal has its own page (journal.html) but is drawn the same way on either
function nbGo(k){if(k==='journal'){renderJournal();return}if(SITE&&SITE.page==='journal'){try{sessionStorage.setItem('fand.nbsec',ARC.sec)}catch(e){}go('archive');return}renderArchive()}
function nbDmPad(host){const db=dmPadDB();
  if(!db){host.innerHTML=`<div class="panel"><p>The DM notepad saves to your account. Sign in to use it.</p><button class="btn primary" data-go="account">Sign in</button></div>`;return}
  if(DP.uid!==CL.user.id||DP.state==='idle'){DP.uid=CL.user.id;host.innerHTML='<div class="panel">Loading your notepad…</div>';dmPadLoad().then(()=>{if(ARC.sec==='dmpad'&&TAB==='archive')renderArchive()});return}
  if(DP.state!=='ready'){host.innerHTML=`<div class="panel">${DP.err==='setup'?'The notepad\'s table isn\'t set up yet (tools/cloud/schema.sql).':'Loading your notepad…'}</div>`;return}
  const L=DP.notes.slice().sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.at-a.at);
  host.innerHTML=`<div class="sec-h" style="margin-top:0"><h3>📝 DM notepad</h3><p>Your private DM pages. They open in the notepad beside any page of the site (📝 in the header, or Alt+N).</p><button class="btn primary" type="button" data-nbpad="">Open the notepad</button></div>
    <div class="nb-cards">${L.map(n=>`<button type="button" class="nb-card" data-nbpad="${esc(n.id)}"><b>${n.pin?'📌 ':''}${esc(dmPadTitle(n))}</b><span>${esc(dmPadPlain(n.body).replace(/[#*\-\[\]]/g,' ').replace(/\s+/g,' ').trim().slice(0,160))}</span><small>${esc(new Date(n.at).toLocaleDateString())}</small></button>`).join('')||'<div class="note">No pages yet.</div>'}</div>`;
  host.onclick=e=>{const b=e.target.closest('[data-nbpad]');if(!b)return;if(b.dataset.nbpad)dmPadUISet({cur:b.dataset.nbpad,view:'edit'});dmPad(true)}}
// the campaign's party notebook: whoever opens it first makes it; every member edits it after that
async function arParty(camp){arFlush();const k=arCamp(camp),db=arDB();if(!k||!db)return;let it=ARC.items.find(x=>x.kind==='party'&&x.campaign_id===camp);
  if(!it){const row={id:arUUID(),owner:CL.user.id,kind:'party',title:k.name+': party notebook',body:'## Plans\n- [ ] \n\n## Who owes what\n- \n\n## What we learned\n- ',data:{},campaign_id:camp,can_edit:true,audience:'all',link:null,updated_at:new Date().toISOString()};
    const {error}=await db.from('archive_items').insert(row);
    if(error){if(/duplicate|unique|archive_items_party/i.test(error.message||'')||error.code==='23505'){await arLoad();it=ARC.items.find(x=>x.kind==='party'&&x.campaign_id===camp)}else{toast(dbMissing(error,'archive_items')?'The Archive needs the latest database setup (tools/cloud/schema.sql)':clMsg(error));return}}
    else{it=arFix(row);ARC.items.unshift(it)}}
  if(!it)return;ARC.cur=it.id;ARC.view=ARC.view==='read'?'read':'edit';ARC.kind='';ARC.sec='party:'+camp;renderArchive()}
// a quick note from the character sheet: a timestamped line in today's session notes (in the Archive when signed in,
// otherwise in the Journal on this device)
function quickNote(c){const who=c&&c.name||'';$('qBox').innerHTML=`<div class="mh"><div class="kind">Quick note${who?' · '+esc(who):''}</div><h2 id="qTitle">📝 Jot it down</h2><div class="mact"><button class="icon-btn" onclick="closeQuick()" aria-label="Close">${ICON.x}</button></div></div>
    <textarea class="sel" id="qn-t" rows="4" maxlength="2000" placeholder="The innkeeper's name is Bram. The key opens the north door. #clue" style="max-width:none;width:100%;resize:vertical;font:inherit"></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center"><button class="btn primary" type="button" id="qn-save">Add to today's notes</button><span class="note" style="margin:0">${typeof CL!=='undefined'&&CL.on&&CL.user?'Saved to your Archive, in today\'s session notes.':'Saved in the Journal on this device (sign in to keep it in your Archive).'}</span></div>`;
  $('qBox').style.maxWidth='560px';$('qbg').classList.add('open');setTimeout(()=>{const t=$('qn-t');if(t)t.focus()},30);
  const go=async()=>{const txt=$('qn-t').value.trim();if(!txt)return;$('qn-save').disabled=true;const ok=await quickNoteSave(txt,who);$('qn-save').disabled=false;if(ok){closeQuick();toast('Noted')}};
  $('qn-save').onclick=go;$('qn-t').onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go()}}}
async function quickNoteSave(txt,who){const day=new Date().toISOString().slice(0,10),time=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),title='Session notes · '+new Date().toLocaleDateString([], {dateStyle:'medium'});
  const line='- '+time+(who?' **'+who.replace(/\*/g,'')+'**:':'')+' '+txt.replace(/\n+/g,' ');
  if(arDB()&&CL.user){if(ARC.uid!==CL.user.id||ARC.state!=='ready'){ARC.items=[];await arLoad()}
    if(ARC.state==='ready'){let it=ARC.items.find(x=>arMine(x)&&x.kind==='note'&&(x.data||{}).qn===day);
      if(!it){it={id:arUUID(),owner:CL.user.id,kind:'note',title,body:'',data:{qn:day,tags:['session']},campaign_id:null,can_edit:false,audience:'all',link:null,updated_at:new Date().toISOString(),_new:true};ARC.items.unshift(it)}
      it.body=(it.body?it.body.replace(/\s+$/,'')+'\n':'')+line;await arSave(it);if(!it._new)return true;clearTimeout(ARC.retry);ARC.items=ARC.items.filter(x=>x!==it)}}
  const J=store.get('journal',[]);let e=J.find(x=>x&&x.qn===day);if(!e){e={t:title,d:day,body:'',qn:day};J.push(e)}e.body=(e.body?e.body+'\n':'')+line;store.set('journal',J);return true}
function arCopyLink(it){const u=arLinkUrl(it.link);(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Link copied: anyone with it can open this item'),()=>prompt('Copy this link:',u))}
// formatting buttons for any note's text box: ## heading, **bold**, - list, - [ ] checklist (on the lines the cursor is in)
function mdFmt(t,k){const v=t.value,a=t.selectionStart,b=t.selectionEnd;
  if(k==='b'){const s=v.slice(a,b)||'bold text';t.value=v.slice(0,a)+'**'+s+'**'+v.slice(b);t.selectionStart=a+2;t.selectionEnd=a+2+s.length}
  else{const pre={h:'## ',li:'- ',ck:'- [ ] '}[k],ls=v.lastIndexOf('\n',a-1)+1;let le=v.indexOf('\n',b);if(le<0)le=v.length;
    const all=v.slice(ls,le).split('\n'),off=all.every(x=>x.startsWith(pre)),rep=all.map(x=>off?x.slice(pre.length):pre+x.replace(/^(#{1,3}\s+|[-*]\s+(\[[ xX]\]\s+)?)/,'')).join('\n');
    t.value=v.slice(0,ls)+rep+v.slice(le);t.selectionStart=t.selectionEnd=ls+rep.length}
  t.dispatchEvent(new Event('input'));t.focus()}
// Quick actions in a window: a monster goes straight into the combat tracker or the encounter builder; a Blueprint or a
// material goes to a character in the party.
// the character chosen in a window's quick actions, kept when the window redraws (e.g. once the vault text loads)
let QA_TO=null;
function modalQuick(x){const b=[];
  if(x._t==='mon')b.push(`<button class="btn" type="button" onclick="quickCombat()">⚔ Add to combat</button>`,`<button class="btn" type="button" onclick="quickEnc()">🐉 Add to encounter</button>`);
  if((x._t==='bp'||x._t==='mat')&&PARTY.length)b.push(`<span class="qa-give"><select class="sel" id="qa-to" aria-label="Character" onchange="QA_TO=this.value">${PARTY.map(c=>`<option value="${esc(c.id)}"${c.id===(QA_TO||SHEET_ID||PARTY_SEL)?' selected':''}>${esc(c.name||'Unnamed')}</option>`).join('')}</select><button class="btn" type="button" onclick="quickGive()">${x._t==='bp'?'Give':'Add to bag'}</button></span>`);
  if(x._t==='spell'){if(PARTY.length)b.push(`<span class="qa-give"><select class="sel" id="qa-sp-to" aria-label="Character" onchange="QA_TO=this.value">${PARTY.map(c=>`<option value="${esc(c.id)}"${c.id===(QA_TO||SHEET_ID||PARTY_SEL)?' selected':''}>${esc(c.name||'Unnamed')}</option>`).join('')}</select><button class="btn" type="button" onclick="quickSpell()">＋ Add to spells</button></span>`);else b.push(`<button class="btn" type="button" onclick="hideModal();go('sheet')">＋ Make a character to add spells to</button>`)}
  return b.length?`<div class="qa">${b.join('')}</div>`:''}
// adds the open spell to a character's spell list at its level, bound to the realm it is learnt in (as the sheet does)
function quickSpell(){const x=CUR,c=$('qa-sp-to')&&PARTY.find(y=>y.id===$('qa-sp-to').value);if(!x||x._t!=='spell'||!c)return;const who=c.name||'the character';
  c.spells=c.spells||{};const L=c.spells[x.lv]=c.spells[x.lv]||[];if(L.some(n=>lc(n)===lc(x.n))){toast(who+' already knows '+x.n);return}
  L.push(x.n);c.spBound=c.spBound||{};if(!c.spBound[lc(x.n)])c.spBound[lc(x.n)]=spellHome(x)||c.here||'Human';saveParty();
  actToast(x.n+' added to '+who+'\'s '+(x.lv?ORDN(x.lv)+'-level spells':'cantrips'),'Open sheet',()=>{SHEET_ID=c.id;SHEET_TAB='spells';hideModal();go('sheet',{id:c.id,tab:'spells'})})}
function quickCombat(){const m=champCur();if(!m||m._t!=='mon')return;const C=TAB==='combat'&&CB?CB:store.get('combat',{round:1,turn:0,list:[]}),have=C.list.filter(x=>x.mon===m.n).length;C.list.push(monCombatant(m,have?have+1:0));store.set('combat',C);
  if(TAB==='combat'){CB=C;renderCombat();toast(m.n+' added to combat')}else actToast(m.n+' added to combat'+(have?' ('+(have+1)+')':''),'Open',()=>go('combat'))}
function quickEnc(){const m=champCur();if(!m||m._t!=='mon')return;const st=store.get('enc',{});st.list=st.list||[];const r=st.list.find(x=>x[0]===m.n);if(r)r[1]++;else st.list.push([m.n,1]);store.set('enc',st);
  if(TAB==='encounter'){renderEncounter();toast(m.n+' added to the encounter')}else actToast(m.n+' added to the encounter','Open',()=>go('encounter'))}
function quickGive(){const x=CUR,c=$('qa-to')&&PARTY.find(y=>y.id===$('qa-to').value);if(!x||!c)return;const who=c.name||'the character';
  if(x._t==='bp'){c.gear=c.gear||[];c.gear.push(x.n);saveParty();toast(x.n+' given to '+who)}else{const before=((c.inv||[]).find(z=>lc(z[0])===lc(x.n))||[0,0])[1]||0;invAdd(c,x.n,1,true);saveParty();const after=((c.inv||[]).find(z=>lc(z[0])===lc(x.n))||[0,0])[1]||0;toast(after>before?x.n+' added to '+who+'\'s bag':who+'\'s bag is full')}
  if(['sheet','party'].includes(TAB))renderTab()}
function showModal(x){
  CUR=x;recentAdd(x);
  const M=MODAL[x._t](x);
  const i=MODAL_LIST.indexOf(x);
  const nav=i>=0&&MODAL_LIST.length>1?`<div class="mnav"><button class="btn" onclick="step(-1)" ${i===0?'disabled':''}>← Previous</button><span class="pos">${fmt(i+1)} / ${fmt(MODAL_LIST.length)}</span><button class="btn" onclick="step(1)" ${i===MODAL_LIST.length-1?'disabled':''}>Next →</button></div>`:'';
  M.body=dimNote(x)+M.body+vaultBlock(x);
  $('modal').innerHTML=`<div class="mh" style="${M.strip?'--strip:'+M.strip:''}">
      ${PICKABLE[x._t]&&artBody(x)?`<div class="mh-row">${role()!=='player'?`<button type="button" class="art-edit" onclick="artPicker(CUR)" title="Choose a different picture" aria-label="Choose a different picture for ${esc(x.n.split(' - ')[0])}">${artHTML(x,'lg')}<span class="art-pen" aria-hidden="true">✎</span></button>`:artHTML(x,'lg')}<div class="mh-txt">`:''}<div class="kind">${M.kind||TYPES[x._t].label}</div>
      <h2 id="mtitle">${M.title}</h2>${M.ep?`<div class="ep">${M.ep}</div>`:''}
      ${M.badges?`<div class="badges">${M.badges}</div>`:''}${PICKABLE[x._t]&&artBody(x)?'</div></div>':''}
      <div class="mact">
        <button class="icon-btn" id="hoBtn" title="Make a handout for players" aria-label="Make a handout">📜</button>
        ${CMP_TYPES[x._t]?`<button class="icon-btn${cmpHas(x)?' on':''}" id="cmpBtn" title="Compare" aria-label="Add to compare">⚖</button>`:''}
        ${x._t!=='realm'?`<button class="icon-btn${isPinned(x)?' on':''}" id="pinBtn" title="Pin" aria-label="Pin">${isPinned(x)?ICON.starf:ICON.star}</button>`:''}
        <button class="icon-btn" id="linkBtn" title="Copy link" aria-label="Copy link">${ICON.link}</button>
        <button class="icon-btn" onclick="closeModal()" title="Close (Esc)" aria-label="Close">${ICON.x}</button>
      </div>
    </div>
    <div class="mb">${modalQuick(x)}${noteHTML(x)}${dmPadBack(x)}${M.body}</div>${nav}`;
  diceify($('modal'));
  noteBind(x);$('hoBtn').onclick=()=>openHandout(hoText(x));const cb=$('cmpBtn');if(cb)cb.onclick=()=>{cmpItemToggle(x);cb.classList.toggle('on',cmpHas(x))};
  const pb=$('pinBtn');if(pb)pb.onclick=()=>{togglePin(x);pb.classList.toggle('on');pb.innerHTML=isPinned(x)?ICON.starf:ICON.star;if(VIEWS[TAB])renderList();else if(TAB==='home')renderTab()};
  $('linkBtn').onclick=()=>{const u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Link copied'),()=>toast('Copy failed: '+u))};
  if(!$('mbg').classList.contains('open')&&document.activeElement&&document.activeElement!==document.body)MODAL_RET=document.activeElement;
  $('mbg').classList.add('open');document.body.classList.add('mopen');$('mbg').scrollTop=0;
  setTimeout(()=>{const h=$('mtitle');if(h&&$('mbg').classList.contains('open')&&!$('mbg').contains(document.activeElement)){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}},0);
  document.title=x.n.split(' - ')[0]+' · FAND';
}

// ── Monster lore: original Monster Manual–style write-ups, generated from body plan, realm, stats, and drops ──
const LORE={
  beast:{look:['Its body is built for one thing: survival in the wilds of {realm}. Thick muscle, scarred hide, and eyes that miss little.','A hardy creature whose coat and hide bear the marks of a lifetime of fights over food and territory.'],act:'It fights like an animal: it tests a threat, retreats if wounded badly, and fights to the death only when cornered or defending its young.',eco:'It hunts or forages through its territory and marks it by scent. Where it thrives, smaller prey grows wary and scavengers follow in its wake.',soc:'It lives alone or in a small family group, and gathers in larger numbers only around a rich food source.',hook:'Farmers on the edge of {realm} report livestock torn apart. The tracks lead to {n}, but something larger has been driving it out of its usual hunting grounds.'},
  bird:{look:['Sleek feathers, a hooked beak, and talons that can lock onto prey. Its eyes are its greatest weapon.','A raptor-like body with broad wings; its feathers shift color with the light of {realm}.'],act:'It strikes from above, diving out of the sun or the clouds, and climbs away before its prey can answer. It rarely fights on the ground.',eco:'It nests on high cliffs, ruins, or treetops and ranges for miles in search of prey. Its feathers and eyes are prized by fletchers and seers alike.',soc:'It mates for life and defends its nest fiercely. Flocks form only during migrations between realms.',hook:'A noble wants a living {n} chick for their menagerie. The nest sits atop a cliff in {realm}, and both parents are home.'},
  reptile:{look:['Cold scales, a long tail, and patient, unblinking eyes.','Its scales are tough as boiled leather and patterned to blend into the stone and mud of {realm}.'],act:'It waits. It lies still for hours until prey comes close, then strikes in a burst of speed and drags its victim down.',eco:'It basks in warm places and slows in the cold. It swallows prey whole or in large pieces, then rests for days.',soc:'It is solitary except when breeding. Its eggs are buried in warm sand or rotting vegetation.',hook:'A clutch of {n} eggs has been stolen from a nest near a village in {realm}. The parent is following the thieves, and it is getting closer to the village every night.'},
  dragon:{look:['Massive, armored in overlapping scales, with horns that grow with age and wings that blot out the sky.','A sinuous, scaled body; every scale is a shield, every tooth a blade, and its breath is a weapon of its element.'],act:'It opens with its breath weapon from the air, then lands to finish the survivors with claw and fang. It retreats only to return with a better plan; it never forgets an insult.',eco:'It claims a lair at the heart of a territory and hoards treasure. Its presence reshapes the land around it: the climate, the beasts, and the people.',soc:'It is proud and solitary. Younger dragons may serve an elder or a god, and some hold contracts with the gods of {realm}.',hook:'{n} has demanded tribute from every settlement within a day\'s flight. One village refused, and now the party is its only hope, or its tribute.'},
  insect:{look:['A segmented body in a hard carapace, many legs, and mandibles that click as it moves.','Its chitin is glossy and ridged, and its compound eyes catch every flicker of movement.'],act:'It overwhelms prey with numbers or venom. It climbs walls and ceilings to drop on victims from above.',eco:'It builds nests, webs, or tunnels, and feeds on whatever it can paralyze or dissolve. Its venom and silk are valuable to alchemists and tailors.',soc:'It lives in a hive, a colony, or a lone web. Colonies follow a queen or a single strongest member.',hook:'Miners in {realm} broke into a cavern full of {n} nests. The miners want the tunnel back; an alchemist wants the venom glands intact.'},
  aquatic:{look:['Smooth or scaled skin, fins, and a body built for the crushing pressure and cold of the deep.','It glistens with slime and shifts color to match the water around it.'],act:'It ambushes from below, drags prey underwater, and lets the water do the rest. Out of the water it is clumsy and far less dangerous.',eco:'It hunts in the rivers, lakes, and seas of {realm}. Sailors know its feeding grounds and avoid them, or pay for charms against it.',soc:'It hunts alone or in schools, and some kinds serve the drowned gods of the deep.',hook:'Fishing boats on the coast of {realm} have been vanishing. The fishers say {n} has learned to follow the boats home.'},
  aberration:{look:['Its shape defies sense: too many eyes, tentacles where limbs should be, and skin that ripples as if something moves beneath it.','An alien form that hurts to look at for long. It smells of brine and ozone.'],act:'It fights with its mind first. It dominates, confuses, or terrifies, and lets its thralls do the dying. It flees through hidden tunnels when a fight turns against it.',eco:'It lairs deep underground or in the strange corners of {realm}, where it schemes toward goals no mortal understands.',soc:'It rules others or serves something greater still. Its thralls worship it, often without knowing why.',hook:'A town in {realm} has started dreaming the same dream. The dream leads to a sinkhole, and {n} is waiting at the bottom.'},
  undead:{look:['Rotting flesh, bare bone, or a cold shape of mist and malice. A chill follows it.','What is left of a living thing, held together by necromancy or a grudge too strong to die.'],act:'It feels no fear and no pain, and fights until destroyed. It is drawn to the living and hates them.',eco:'It haunts graveyards, battlefields, and ruins, and gathers where death came suddenly or unjustly. It needs no food, water, or rest.',soc:'Lesser undead obey whoever raised them. Greater undead gather servants and remember who they were in life.',hook:'The dead of a village cemetery in {realm} have risen, led by {n}. Someone is raising them, and they are getting better at it.'},
  construct:{look:['Metal, stone, wood, or flesh stitched together, animated by a core of bound magic.','Seams, rivets, and runes cover its body. Something glows faintly at its center.'],act:'It follows its orders to the letter and never tires. It fights without fear and without mercy, and stops only when its orders say so or when it is destroyed.',eco:'It guards tombs, vaults, workshops, and the anchors of {realm}. It does not eat or sleep; it waits.',soc:'It has no society, only a master, living or long dead. Its orders may outlive everyone who remembers them.',hook:'An old vault in {realm} has opened, and {n} has walked out of it. It is following orders written a thousand years ago.'},
  ooze:{look:['A mass of jelly, acid, or slime, half-transparent, with bones and coins floating inside it.','A shapeless mass that flows over the ground and dissolves whatever it touches.'],act:'It engulfs prey and dissolves it. It has no tactics beyond moving toward warmth and movement, which makes it predictable and very dangerous in tight places.',eco:'It lurks in sewers, dungeons, and caves of {realm}, cleaning them of organic matter and leaving metal and stone behind.',soc:'It has no society. Some divide when they grow too large.',hook:'The sewers under a city in {realm} have gone quiet; even the rats are gone. Something large is living down there: {n}.'},
  elemental:{look:['A living mass of its element: flame, wind, stone, or water, shaped loosely into a body.','It is not flesh but force, held in a shape by a spark of elemental will.'],act:'It fights with the raw power of its element and is hard to harm with ordinary weapons. It is bound to its element and weakens away from it.',eco:'It belongs to the elemental reaches of {realm}. In other places it is usually summoned, bound, or lost.',soc:'It serves elemental lords, binders, and summoners, often against its will.',hook:'A binder lost control of {n} during a ritual in {realm}. It is loose, it is angry, and it is heading for the binder\'s home town.'},
  fiend:{look:['Horns, claws, and burning eyes; skin of ash, scales, or leathery hide. It smells of sulfur.','A body made for cruelty, with features twisted by the realm that spawned it.'],act:'It fights with cunning and cruelty, and enjoys fear more than victory. It makes deals when outmatched and keeps them only to the letter.',eco:'It belongs to Hell or the Abyss, and comes to other realms through contracts, summonings, and torn places.',soc:'Devils obey a strict hierarchy of contracts. Demons follow whoever is strongest. Both serve greater lords.',hook:'A merchant in {realm} made a deal and the debt has come due. {n} has come to collect, and it will take a substitute.'},
  celestial:{look:['Radiant and beautiful, with feathered wings and eyes like stars. Its presence feels like sunlight.','A shining form of perfect proportion; its voice carries like a choir.'],act:'It fights only for a cause, and offers mercy to the repentant. Against fiends and undead it is relentless.',eco:'It belongs to Heaven and serves the gods there. In other realms it is a messenger, a guardian, or an exile.',soc:'It serves a god or a celestial host and follows a strict order of rank, much like a god\'s Hand.',hook:'{n} has fallen in {realm}, wounded and hunted. It asks the party for shelter, and something is following it.'},
  plant:{look:['Bark, vines, leaves, and fungus shaped into something that moves. It smells of earth and rot.','A living plant that has grown teeth, or awareness, or both.'],act:'It waits motionless until prey comes close, then lashes out with vines, spores, or crushing limbs. Fire is its great fear.',eco:'It grows in forests, swamps, and caves of {realm} and feeds on light, water, and sometimes blood.',soc:'It has no society, or a slow one. Some plants answer to a druid or an ancient tree.',hook:'The forest near a village in {realm} is spreading toward the fields. At its heart, {n} is growing.'},
  giant:{look:['Huge and broad, with skin like weathered stone and a voice like a rockslide.','A towering figure in rough hides and stolen armor, carrying a weapon the size of a tree.'],act:'It fights with brute strength and thrown boulders. It is proud and quick to anger, but it can be bargained with.',eco:'It lives in the mountains, hills, and cold places of {realm}, herding beasts and raiding the lowlands when food runs short.',soc:'It lives in clans ordered by strength or status, and remembers old grudges between clans for centuries.',hook:'A clan of giants in {realm} has blocked the only mountain pass. Their leader, {n}, demands a duel or a tribute.'},
  fey:{look:['Fey and beautiful, or fey and frightening, and often both. Its eyes reflect light like a cat\'s.','A small or slender form wrapped in glamour; what you see may not be what is there.'],act:'It fights with tricks, charms, and illusions, and loves a clever bargain. It flees from cold iron and from anyone who knows its true name.',eco:'It lives in the Mysterious Realm and the places where it touches others: fairy rings, old forests, and moonlit pools.',soc:'It serves a fey court or a powerful patron, and is bound by its word.',hook:'{n} has stolen a child from a village in {realm} and left a changeling in its place. It will return the child for a fair trade.'},
  humanoid:{look:['A person, more or less: armed, armored, and shaped by the hard life of {realm}.','Dressed for its trade, with scars that tell its story.'],act:'It fights with weapons and tactics, uses cover, and retreats when the odds turn. It can be reasoned with, bribed, or intimidated.',eco:'It lives in towns, camps, and strongholds across {realm}, and works, fights, or worships for a living.',soc:'It belongs to a band, a guild, a cult, or a kingdom, and has loyalties that can be used.',hook:'{n} has a bounty on its head in {realm}. The bounty is real, but so is the story it tells about who posted it.'}
};
const PART_PROF={B:'Scavenging',F:'Scavenging',L:'Scavenging',E:'Scavenging (essences fade within an hour unless bottled)',W:'Harvesting',K:'Engineering salvage'};
function monsterLore(m){
  const L=LORE[m.body]||LORE.beast,h=hashStr(m.n),f=s=>s.replace(/\{n\}/g,m.n).replace(/\{realm\}/g,m.realm);
  const b=m.sb||{},out=[];
  out.push(['Overview',`${m.n} is a ${(b.sz||'').toLowerCase()} ${b.ty||m.body} of the ${m.realm} (grade ${m.g}, challenge ${b.cr||m.cr}). ${m.txt||''}`]);
  out.push(['Appearance',f(L.look[h%L.look.length])]);
  const tac=[f(L.act)];
  if(b.ac2&&b.ac2.some(a=>/Breath/.test(a[0])))tac.push('It saves its breath weapon for clustered foes and uses it again the moment it recharges.');
  if(b.ac2&&b.ac2.some(a=>/Mind Blast/.test(a[0])))tac.push('It opens with a psychic blast to stun the most dangerous foes before closing in.');
  if(b.ac2&&b.ac2.some(a=>/Ranged/.test(a[1])))tac.push('It prefers to fight at range and keeps its distance from heavily armored foes.');
  if(b.lg)tac.push('As a legendary creature, it acts between its foes\' turns and shrugs off spells that would end a lesser monster. Treat it as a boss.');
  if(b.ac>=6)tac.push(`Its AC of ${b.ac} blunts weak blows entirely: small hits do nothing. Bring heavy weapons or spells.`);
  else if(b.ac===0)tac.push('It has no armor to speak of, so every hit lands in full.');
  out.push(['Behavior and Tactics',tac.join(' ')]);
  out.push(['Habitat and Ecology',(m.hab?`Found in ${m.hab.toLowerCase()}. `:'')+f(L.eco)]);
  out.push(['Society',f(L.soc)]);
  const parts=(m.drops||[]).map(d=>findMat(d[0])).filter(Boolean);
  if(parts.length){
    const by={};parts.forEach(x=>{const p=PART_PROF[matCode(x)]||'Scavenging';(by[p]=by[p]||[]).push(x)});
    const val=parts.reduce((a,x)=>a+(x.price||0),0);
    out.push(['Harvesting',`A careful harvester can take ${parts.length} parts from its body, worth about ${gp(val)} in all${CURRENCY[m.realm]&&CURRENCY[m.realm].coin&&CURRENCY[m.realm].gp>1?` (${localPrice(val,m.realm)})`:''}. `+Object.entries(by).map(([p,xs])=>`${p}: ${xs.map(x=>x.n.replace(m.n+' ','').toLowerCase()).join(', ')}.`).join(' ')+(parts.some(x=>matCode(x)==='L')?' Blood and organs spoil within a day unless salted, iced, or bottled.':'')]);
  }
  const r=REALM[m.realm],gods=[...new Set(parts.flatMap(x=>GOD_BY_MAT.get(lc(x.n))||[]))];
  const kin=MONSTERS.filter(x=>x!==m&&x.realm===m.realm&&Math.abs(x.g-m.g)<=1).sort((a,c)=>hashStr(m.n+a.n)-hashStr(m.n+c.n)).slice(0,4);
  out.push(['In FAND',`${m.realm} has a Pressure of ${r?r.pressure:'?'}; travelers with lower Attunement suffer strain while hunting it.`+(CURRENCY[m.realm]&&CURRENCY[m.realm].coin?` Its parts trade for ${CURRENCY[m.realm].pl} there.`:' Its parts are not sold; they are traded by favor and contract.')+(gods.length?` The gods ${gods.map(godKey).join(', ')} prize its parts as signature materials.`:'')+(kin.length?` It is often found near ${kin.map(x=>x.n).join(', ')}.`:'')]);
  out.push(['Adventure Hook',f(L.hook)]);
  return out;
}

function linkNames(html,m){const kin=MONSTERS.filter(x=>x!==m&&x.realm===m.realm&&html.includes(esc(x.n)));kin.sort((a,b)=>b.n.length-a.n.length).forEach(x=>{html=html.split(esc(x.n)).join(`<a href="#" data-ref="${ref(x)}">${esc(x.n)}</a>`)});GODS.forEach(g=>{const k=esc(godKey(g));if(html.includes(' '+k+','))html=html.split(' '+k+',').join(` <a href="#" data-ref="${ref(g)}">${k}</a>,`)});return html}
// Monster damage keeps pace with the realm through a flat +4 per realm tier past the Human Realm, already in each
// stat block (data/statblock.js). Its dice are not multiplied by the tier: with both, one deep-realm hit outweighed a
// same-level character's whole HP (website balance review, campaign owner's choice).
// Hitting (campaign owner's rule): the attacker rolls d20 + Accuracy, the target rolls d20 + Dodge (its DEX modifier);
// the higher roll wins and a tie is a miss. AC only reduces damage in FAND. Older text that says "+N to hit" is shown as Accuracy.
const dodgeOf=dex=>Math.floor(((+dex||10)-10)/2);
const sbDodge=b=>b?dodgeOf(b.ab[1])+(b.dodgeB||0):0;
function sbAcc(b){const a=(b&&b.ac2||[]).map(([n,t])=>accText(t)).find(t=>/Weapon Attack: Accuracy/.test(t));const m=a&&/Accuracy ([+−-]\d+)/.exec(a);return m?+m[1].replace('−','-'):null}
const accText=t=>String(t).replace(/([+−-]\d+) to hit with spell attacks/g,'spell Accuracy $1').replace(/([+−-]\d+) to hit/g,'Accuracy $1');
function sbHTML(m){
  const b=m.sb;if(!b)return '';const sc=a=>(a||[]).map(([n,t])=>[n,accText(t)]);
  const ab=b.ab.map((v,i)=>`<div><b>${['STR','DEX','CON','INT','WIS','CHA'][i]}</b>${v} (${(Math.floor((v-10)/2)>=0?'+':'')+Math.floor((v-10)/2)})</div>`).join('');
  const line=(l,v)=>v?`<div class="ln"><b>${l}</b> ${esc(v)}</div>`:'';
  const ent=a=>a.map(([n,t])=>`<p><i><b>${esc(n)}.</b></i> ${esc(t)}</p>`).join('');
  return `<div class="sblk"><div class="sbn">${esc(m.n)}</div><div class="sbt">${esc(b.sz)} ${esc(b.ty)}, ${esc(b.al)}</div><hr>
    ${line('Armor Class',String(b.ac))}${sbAcc(b)!=null?line('Accuracy',sgn(sbAcc(b))+' (weapon attacks; rolled against the target\'s Dodge)'):''}${line('Dodge',sgn(sbDodge(b))+(b.dodgeB?' (DEX '+sgn(dodgeOf(b.ab[1]))+', champion +'+b.dodgeB+')':' (DEX)')+'; rolled against each attack\'s Accuracy')}${line('Hit Points',b.hp+' ('+b.hd+')')}${line('Speed',b.sp)}<hr>
    <div class="abil">${ab}</div><hr>
    ${line('Saving Throws',b.sv)}${line('Skills',b.sk)}${line('Damage Vulnerabilities',b.vu)}${line('Damage Resistances',b.rs)}${line('Damage Immunities',b.im)}${line('Condition Immunities',b.ci)}${line('Senses',b.se)}${line('Languages',b.la)}
    <div class="ln"><b>Challenge</b> ${esc(b.cr)} (${fmt(b.xp)} XP) &nbsp; <b>Proficiency Bonus</b> +${b.pb}</div><hr>
    ${ent(sc(b.tr))}
    <h5>Actions</h5>${ent(sc(b.ac2))}
    ${b.lg?`<h5>Legendary Actions</h5><p>The creature can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.</p>${ent(sc(b.lg))}`:''}
    
    <div class="gen">Stat block generated for FAND from this monster's challenge, body, and drops. AC uses FAND's flat rule: subtract it from each hit's damage. An attack hits it only when the attacker\'s d20 + Accuracy beats its d20 + Dodge.</div></div>`;
}
// Where a vault note and the website disagree, the website's version applies.
const SUPERSEDED={
  'Material Properties':{msg:'Potency now runs 1–50 (it follows Item Level; every 5 Potency is one rank, and the numbers in a property use the rank). Each property has its own page with what it gains every 5 Potency.',go:'properties'},
  'Armor Class':{msg:'The Armor Class rules have changed. AC now starts at 0, gear adds small amounts (a full set of iron gear gives 10), heavier armor carries drawbacks, and AC is subtracted flat from each hit. The percentage formula, headshots, and Natural vs. Gear AC below no longer apply. Attacks are an opposed roll: d20 + Accuracy against the target\'s d20 + Dodge, not against AC.',go:'rules'},
  'Monster Stats':{msg:'Official monsters no longer convert AC with 2 × (book AC − 10) + CR; every monster now has a generated stat block on the website using the flat AC rule.',go:'bestiary'},
};
// Vault text attached to website entries; on the multi-page site it loads the first time an entry is opened.
let VDETAILS=typeof VAULT_DETAILS!=='undefined'?VAULT_DETAILS:null,VD_LOADING=false;
function loadDetails(){
  if(VDETAILS||VD_LOADING||!SITE)return;VD_LOADING=true;
  const s=document.createElement('script');s.src='data/vault-details.js'+(SITE&&SITE.v?'?v='+SITE.v:'');
  s.onload=()=>{VDETAILS=typeof VAULT_DETAILS!=='undefined'?VAULT_DETAILS:{};if(CUR&&$('mbg').classList.contains('open'))showModal(CUR)};
  s.onerror=()=>{VDETAILS={}};document.head.appendChild(s);
}
const SITE_FILL='<div class="note" style="margin-top:-4px">Written by the site to fill a gap; the vault has no description for this yet.</div>';
function vaultBlock(x){
  const t={bp:'bp',mat:'mat',spell:'spell',sub:'sub',mon:'mon',god:'god'}[x._t];if(!t)return '';
  if(!VDETAILS){loadDetails();return SITE&&VAULT_DATA.imported?'<div class="note">Loading the vault entry…</div>':''}
  const key=t==='god'?godKey(x):x.n,d=(VDETAILS[t]||{})[key];if(!d)return '';
  return `<details class="fold" open style="border-top:1px solid var(--line);padding-top:10px"><summary>From the vault <span style="color:var(--muted)">· ${esc(d.f)}</span></summary><div><div class="note" style="margin:0 0 8px">The website's data above takes priority where the two differ.</div><div class="prose vault" style="font-family:var(--sans);font-size:.9rem">${mdVault(d.md)}</div></div></details>`;
}
// ── DM notepad (2026-11-12; in the account's database since 2026-11-14): pages of private notes for the DM, on every page
// from the header (Alt+N). Each page is a row of the dm_notes table (tools/cloud/schema.sql), readable and writable only
// by the signed-in account that wrote it, so the notes follow the account, not the browser. This device keeps only its
// own preferences (the open page, the search, the passphrase lock). [[Name]] in a note links to that monster, Blueprint,
// spell, god, realm or note.
const DP={notes:[],uid:null,state:'idle',err:'',dirty:new Set(),retry:null};
const dmPadUI=()=>store.get('dmpadui',null)||{};
const dmPadUISet=o=>store.set('dmpadui',Object.assign(dmPadUI(),o));
const dmPadDB=()=>CL&&CL.on&&CL.user&&CL.sb?CL.sb:null;
const dmPadRow=n=>({owner:CL.user.id,id:n.id,title:String(n.t||'').slice(0,200),body:String(n.body||''),pinned:!!n.pin,updated_at:new Date(n.at||Date.now()).toISOString()});
const dmPadMissing=e=>!!e&&(e.code==='42P01'||e.code==='PGRST205'||/dm_notes/.test(e.message||'')&&/(exist|find|schema cache)/i.test(e.message||''));
// read the account's pages; the first time, move pages kept in this browser before the notepad used the account
async function dmPadLoad(){const db=dmPadDB();if(!db)return;DP.uid=CL.user.id;DP.state='loading';dmPadRender();
  const {data,error}=await db.from('dm_notes').select('id,title,body,pinned,updated_at').order('updated_at',{ascending:false});
  if(error){DP.state='error';DP.err=dmPadMissing(error)?'setup':'net';dmPadRender();return}
  DP.notes=(data||[]).map(r=>({id:r.id,t:r.title||'',body:r.body||'',pin:!!r.pinned,at:Date.parse(r.updated_at)||Date.now()}));DP.state='ready';DP.err='';
  let old=null;try{old=JSON.parse(localStorage.getItem('fand.dmpad')||'null')}catch(e){}
  const keep=old&&Array.isArray(old.notes)?old.notes.filter(n=>n&&n.id&&(n.t||n.body)&&!DP.notes.some(x=>x.id===n.id)):[];
  if(keep.length){const rows=keep.map(n=>dmPadRow({id:String(n.id).slice(0,40),t:n.t,body:n.body,pin:n.pin,at:n.at}));const {error:e2}=await db.from('dm_notes').upsert(rows,{onConflict:'owner,id'});
    if(!e2){DP.notes=keep.map(n=>({id:String(n.id).slice(0,40),t:n.t||'',body:n.body||'',pin:!!n.pin,at:n.at||Date.now()})).concat(DP.notes);toast(keep.length+' page'+(keep.length>1?'s':'')+' moved from this browser to your account')}}
  if(old&&(!keep.length||DP.notes.length>=keep.length)){try{localStorage.removeItem('fand.dmpad')}catch(e){}}
  if(old&&old.lock!=null&&dmPadUI().lock==null)dmPadUISet({lock:!!old.lock});
  dmPadRender()}
// write one page (or every page waiting to be written); a failed write waits and tries again
async function dmPadPush(id){const db=dmPadDB();if(!db)return;if(id)DP.dirty.add(id);const ids=[...DP.dirty];if(!ids.length)return;
  const rows=ids.map(i=>DP.notes.find(n=>n.id===i)).filter(Boolean).map(dmPadRow);ids.forEach(i=>DP.dirty.delete(i));
  const {error}=rows.length?await db.from('dm_notes').upsert(rows,{onConflict:'owner,id'}):{error:null};
  const s=$('dp-saved');if(error){ids.forEach(i=>DP.dirty.add(i));if(s)s.textContent=dmPadMissing(error)?'Not saved: the database isn\'t set up':'Not saved yet: offline, retrying';clearTimeout(DP.retry);DP.retry=setTimeout(()=>dmPadPush(),10000)}
  else if(s&&!DP.dirty.size)s.textContent='Saved to your account'}
window.addEventListener('online',()=>{if(DP.dirty.size)dmPadPush()});
function dmPadBtn(){const b=$('dmPadBtn');if(b)b.hidden=role()==='player'}
function dmPad(open){const P=$('dmpad');if(!P)return;const show=open==null?P.hidden:open;if(!show)dmPadFlush();P.hidden=!show;const b=$('dmPadBtn');if(b)b.setAttribute('aria-expanded',show?'true':'false');
  document.body.classList.toggle('dmpad-open',show);if(show){if(dmPadDB()&&(DP.uid!==CL.user.id||DP.state==='idle'||DP.state==='error'))dmPadLoad();else dmPadRender();setTimeout(()=>{const t=$('dp-body');if(t)t.focus()},30)}else if(b)b.focus()}
function dmPadNew(){if(DP.state!=='ready')return;const n={id:uid(),t:'',body:'',at:Date.now()};DP.notes.unshift(n);dmPadUISet({cur:n.id});dmPadPush(n.id);dmPadRender();setTimeout(()=>{const t=$('dp-title');if(t)t.focus()},30)}
function dmPadCur(){const u=dmPadUI();return DP.notes.find(x=>x.id===u.cur)||DP.notes[0]}
const dmPadTitle=n=>(n.t||'').trim()||(n.body||'').trim().split('\n')[0].slice(0,40)||'Untitled page';
// typing saves 0.4 s after the last key; anything that redraws or closes the notepad saves what is typed first
let DP_TM=null,DP_FLUSH=null;const dmPadFlush=()=>{clearTimeout(DP_TM);if(DP_FLUSH)DP_FLUSH()};
window.addEventListener('pagehide',dmPadFlush);
function dmPadShell(inner){return `<div class="dp-head"><button class="btn dp-bk" type="button" onclick="dmPad(false)" aria-label="Back: close the notepad">‹ Back</button><b>📝 <span class="dp-long">DM </span>notepad</b><span class="dp-saved" id="dp-saved" aria-live="polite"></span><button class="icon-btn" onclick="dmPad(false)" aria-label="Close notepad" title="Close (Esc)">${ICON.x}</button></div>${inner}`}
function dmPadRender(){dmPadFlush();const P=$('dmpad');if(!P||P.hidden)return;const ui=dmPadUI();
  if(ui.lock&&!dmUnlocked()){P.innerHTML=dmPadShell(`<div class="dp-locked"><p>The notepad is kept behind the DM passphrase on this device.</p><button class="btn primary" onclick="dmPad(false);go('hidden')">Unlock DM content</button></div>`);return}
  if(!(CL&&CL.on)){P.innerHTML=dmPadShell(`<div class="dp-locked"><p>The DM notepad saves to your FAND account, and accounts aren't set up on this copy of the site.</p></div>`);return}
  if(!CL.user){DP.notes=[];DP.uid=null;DP.state='idle';DP.dirty.clear();P.innerHTML=dmPadShell(`<div class="dp-locked"><p><b>Sign in to use the notepad.</b> Your notes are saved to your account, so they follow you to every device, and only you can read them.</p><button class="btn primary" onclick="dmPad(false);go('account')">Sign in</button></div>`);return}
  if(DP.uid!==CL.user.id||DP.state==='idle'){dmPadLoad();return}
  if(DP.state==='loading'){P.innerHTML=dmPadShell(`<div class="dp-locked"><p>Loading your notes…</p></div>`);return}
  if(DP.state==='error'){P.innerHTML=dmPadShell(`<div class="dp-locked">${DP.err==='setup'?'<p><b>The notepad\'s database table isn\'t set up yet.</b> Whoever runs this site\'s Supabase project needs to run <code>tools/cloud/schema.sql</code> again in its SQL Editor (it adds the <code>dm_notes</code> table).</p>':'<p>Your notes couldn\'t be loaded. Check your connection.</p>'}<button class="btn" onclick="dmPadLoad()">Try again</button></div>`);return}
  if(!DP.notes.length){const n={id:uid(),t:'Session notes',body:'',at:Date.now()};DP.notes.push(n);dmPadUISet({cur:n.id});dmPadPush(n.id)}
  const cur=dmPadCur(),vw=ui.view||'edit',read=vw==='read',q=lc(ui.q||''),list=DP.notes.filter(n=>!q||lc(n.t+' '+n.body).includes(q)).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.at-a.at);
  const links=[...new Set(((cur.body||'').match(/\[\[([^\]]{1,80})\]\]/g)||[]).map(x=>x.slice(2,-2)))].map(n=>[n,resolveLink(n)]);
  P.innerHTML=`<div class="dp-head"><button class="btn dp-bk" type="button" onclick="dmPad(false)" aria-label="Back: close the notepad">‹ Back</button><b>📝 <span class="dp-long">DM </span>notepad</b><span class="dp-saved" id="dp-saved" aria-live="polite">${DP.dirty.size?'Not saved yet: retrying':'In your account'}</span><button class="btn" type="button" onclick="dmPadNew()">+ New page</button><button class="icon-btn" onclick="dmPad(false)" aria-label="Close notepad" title="Close (Esc)">${ICON.x}</button></div>
    <div class="dp-wrap"><div class="dp-list"><input class="sel" id="dp-q" type="search" placeholder="Search notes…" aria-label="Search notes" value="${esc(ui.q||'')}">
      <div class="dp-items" role="listbox" aria-label="Pages">${list.map(n=>`<button type="button" role="option" aria-selected="${n.id===cur.id}" class="dp-item${n.id===cur.id?' on':''}" onclick="dmPadOpen('${esc(n.id)}')">${n.pin?'📌 ':''}<b>${esc(dmPadTitle(n))}</b><small>${esc(new Date(n.at).toLocaleDateString())}</small></button>`).join('')||'<div class="note" style="margin:6px">No page matches.</div>'}</div></div>
    <div class="dp-ed"><input class="sel dp-title" id="dp-title" placeholder="Page title" aria-label="Page title" value="${esc(cur.t||'')}">
      <div class="dp-tools" role="toolbar" aria-label="Formatting">${vw!=='edit'?'':`<button type="button" class="btn" onclick="dmPadFmt('h')" title="Heading" aria-label="Heading">H</button><button type="button" class="btn" onclick="dmPadFmt('b')" title="Bold" aria-label="Bold"><b>B</b></button><button type="button" class="btn" onclick="dmPadFmt('li')" title="Bulleted list">• List</button><button type="button" class="btn" onclick="dmPadFmt('ck')" title="Checklist">☐ Checklist</button>`}<span style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap"><button type="button" class="btn" id="dp-view" onclick="dmPadView()">${vw!=='edit'?'✎ Edit':'👁 Read'}</button><button type="button" class="btn${vw==='mind'?' primary':''}" onclick="dmPadView('mind')" title="This page's headings and lists as a mind map">🧠 Mind map</button><button type="button" class="btn${vw==='graph'?' primary':''}" onclick="dmPadView('graph')" title="Every page as a dot, every [[link]] between pages as a line">🕸 Graph</button></span></div>
      ${vw==='mind'?'<div class="ar-board dp-board" id="dp-board"></div>':vw==='graph'?'<div class="ar-board dp-board" id="dp-graph"></div>':read?`<div class="dp-read" id="dp-read">${dmPadMd(cur.body)||'<p class="note">Nothing written yet. Tap ✎ Edit.</p>'}</div>`:`<textarea class="sel" id="dp-body" aria-label="Note" placeholder="Plans, secrets, what the party missed, who owes whom… Type [[a name]] to link a monster, item, spell, god or realm. ## makes a heading, **bold**, - a list, - [ ] a checklist.">${esc(cur.body||'')}</textarea>`}
      ${links.length?`<div class="chips dp-links"><span class="note" style="margin:0 4px 0 0">Linked</span>${links.map(([n,x])=>x?refChip(x):`<span class="chip" title="Nothing on the site has this name">${esc(n)}?</span>`).join('')}</div>`:''}
      <div class="dp-act"><button class="btn" type="button" onclick="dmPadLink()" title="Add a link to the item that is open, or this page">🔗 Link</button><button class="btn" type="button" onclick="dmPadStamp()">🕒 Time</button><button class="btn" type="button" onclick="dmPadPin()">${cur.pin?'Unpin':'📌 Pin'}</button><button class="btn" type="button" onclick="dmPadSession()" title="A new page with the party, the fight you have ready, recent loot and a checklist">▶ Start session</button><details class="more-menu dp-more"><summary class="btn" aria-label="More: recap, share, copy, delete">⋯ More</summary><div class="more-pop" role="menu"><button class="btn" type="button" onclick="dmPadRecap()" title="What happened since the session started: fights, loot, journal entries and the checklist">🧾 Session recap</button><button type="button" onclick="sessTimeline()" title="Everything since the session started, in order">🕰 Session timeline</button><button class="btn" type="button" onclick="dmPadShare()" title="Send this page to your players as a handout; the rest of the notepad stays private">📜 Share with players</button><button class="btn" type="button" onclick="dmPadToArchive()" title="Copy this page into your Archive, where you can share it with a campaign or by link">🗄 To Archive</button><button class="btn" type="button" onclick="dmPadCopy()">📋 Copy</button><button class="btn" type="button" onclick="dmPadDel()" style="color:var(--red)">🗑 Delete page</button><div class="more-sep"></div><label class="chk" title="Ask for the DM passphrase before showing the notepad on this device"><input type="checkbox" id="dp-lock"${ui.lock?' checked':''}> Keep behind the DM passphrase</label></div></details></div></div></div>`;
  const tEl=$('dp-title'),bEl=$('dp-body');
  const save=()=>{clearTimeout(DP_TM);DP_FLUSH=()=>{DP_FLUSH=null;const n=DP.notes.find(x=>x.id===cur.id);if(!n)return;if(n.t===tEl.value&&(!bEl||n.body===bEl.value))return;n.t=tEl.value;if(bEl)n.body=bEl.value;n.at=Date.now();dmPadPush(n.id)};DP_TM=setTimeout(DP_FLUSH,400);const s=$('dp-saved');if(s)s.textContent='Saving…'};
  tEl.oninput=save;if(bEl){bEl.oninput=save;bEl.onblur=()=>{if(/\[\[/.test(bEl.value))setTimeout(dmPadRender,450)}}
  dmPadBoards(cur);const rd=$('dp-read');if(rd){rd.onchange=e=>{const c=e.target.closest('[data-ln]');if(c)dmPadTick(+c.dataset.ln,c.checked)};rd.onclick=e=>{const a=e.target.closest('a[data-ref]');if(a)e.preventDefault()}}
  $('dp-q').oninput=e=>{dmPadUISet({q:e.target.value});const pos=e.target.selectionStart;dmPadRender();const q2=$('dp-q');q2.focus();q2.setSelectionRange(pos,pos)};
  $('dp-lock').onchange=e=>{dmPadUISet({lock:e.target.checked});toast(e.target.checked?'The notepad now asks for the DM passphrase':'The notepad opens without the passphrase')}}
function dmPadOpen(id){dmPadFlush();dmPadUISet({cur:id});dmPadRender()}
function dmPadEditMode(){if(!$('dp-body')&&$('dp-read')){dmPadUISet({view:'edit'});dmPadRender()}return $('dp-body')}
function dmPadInsert(txt){const t=dmPadEditMode();if(!t)return;const a=t.selectionStart,b=t.selectionEnd;t.value=t.value.slice(0,a)+txt+t.value.slice(b);t.selectionStart=t.selectionEnd=a+txt.length;t.dispatchEvent(new Event('input'));t.focus()}
function dmPadLink(){const x=$('mbg').classList.contains('open')&&CUR?CUR:null;if(x){dmPadInsert('[['+x.n.split(' - ')[0]+']] ');setTimeout(dmPadRender,450);return}
  const t=TABS.find(y=>y[0]===TAB);dmPadInsert((t?t[1]:TAB)+' page ('+location.href.split('#')[0].split('/').pop()+') ')}
function dmPadStamp(){if(!dmPadEditMode())return;dmPadInsert((($('dp-body').value&&!/\n$/.test($('dp-body').value))?'\n':'')+'— '+new Date().toLocaleString([], {dateStyle:'medium',timeStyle:'short'})+' —\n')}
function dmPadPin(){dmPadFlush();const n=dmPadCur();if(!n)return;n.pin=!n.pin;n.at=Date.now();dmPadPush(n.id);dmPadRender()}
function dmPadCopy(){const n=dmPadCur(),txt=(n.t?n.t+'\n\n':'')+(n.body||'');(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Page copied'),()=>toast('Copy failed'))}
// formatting: ## heading, **bold**, - list, - [ ] checklist. The read view shows them, with tick-boxes that save.
function dmPadFmt(k){const t=dmPadEditMode();if(t)mdFmt(t,k)}
function dmPadView(v){dmPadFlush();const now=dmPadUI().view||'edit';dmPadUISet({view:v?(now===v?'edit':v):(now==='edit'?'read':'edit')});dmPadRender()}
// the notepad's mind map and graph views, drawn once the page is in place
function dmPadBoards(cur){const b=$('dp-board');if(b)mmBoard(b,mmTreeData(mmFromMd(dmPadTitle(cur),cur.body)),{edit:false});
  const g=$('dp-graph');if(g){const G=graphOf(DP.notes.map(n=>({id:n.id,t:dmPadTitle(n),body:n.body})));graphView(g,G.nodes,G.edges,n=>{if(n.site){openItem(n.x);return}dmPadUISet({cur:n.id,view:'edit'});dmPadRender()})}}
// a notepad page into the Archive (as a private note there), e.g. to share it with players by link
async function dmPadToArchive(){dmPadFlush();const n=dmPadCur(),db=dmPadDB();if(!n||!db)return;const row={id:arUUID(),owner:CL.user.id,kind:'note',title:dmPadTitle(n).slice(0,200),body:n.body||'',data:{},updated_at:new Date().toISOString()};
  const {error}=await db.from('archive_items').insert(row);if(error){toast(dbMissing(error,'archive_items')?'The Archive needs the latest database setup (tools/cloud/schema.sql)':clMsg(error));return}
  if(ARC.state==='ready'&&ARC.uid===CL.user.id)ARC.items.unshift(arFix(row));actToast('Copied to your Archive (private)','Open',()=>{dmPad(false);ARC.cur=row.id;ARC.view='';go('archive')})}
function dmPadInline(s){return String(s).split(/(\[\[[^\]]{1,80}\]\])/).map((p,i)=>{if(i%2){const n=p.slice(2,-2),x=resolveLink(n);return x?`<a href="#" data-ref="${ref(x)}">${esc(n)}</a>`:`<span class="dp-miss" title="Nothing on the site has this name">${esc(n)}</span>`}
  return esc(p).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>')}).join('')}
function dmPadMd(src){const L=String(src||'').split('\n');let out='',list=null;const close=()=>{if(list){out+='</ul>';list=null}};
  L.forEach((l,i)=>{let m;
    if((m=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/.exec(l))){if(list!=='ck'){close();out+='<ul class="dp-ck">';list='ck'}out+=`<li><label><input type="checkbox" data-ln="${i}"${m[1]!==' '?' checked':''}> <span>${dmPadInline(m[2])}</span></label></li>`;return}
    if((m=/^\s*[-*]\s+(.*)$/.exec(l))){if(list!=='ul'){close();out+='<ul>';list='ul'}out+=`<li>${dmPadInline(m[1])}</li>`;return}
    close();if((m=/^(#{1,3})\s+(.*)$/.exec(l))){const h=m[1].length+3;out+=`<h${h}>${dmPadInline(m[2])}</h${h}>`;return}
    if(l.trim())out+=`<p>${dmPadInline(l)}</p>`});close();return out}
function dmPadTick(ln,on){const n=dmPadCur();if(!n)return;const L=String(n.body||'').split('\n');if(L[ln]==null)return;L[ln]=L[ln].replace(/\[[ xX]\]/,on?'[x]':'[ ]');n.body=L.join('\n');n.at=Date.now();dmPadPush(n.id);
  const P=$('dp-read'),y=P?P.scrollTop:0;dmPadRender();const P2=$('dp-read');if(P2)P2.scrollTop=y}
const dmPadPlain=b=>String(b||'').replace(/\[\[([^\]]{1,80})\]\]/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1');
// one page as a handout: players get only this text, in the campaign the DM picks
function dmPadShare(){dmPadFlush();const n=dmPadCur();if(!n)return;let b=dmPadPlain(n.body).trim();if(b.length>4000){b=b.slice(0,3990)+'…';toast('Handouts hold 4,000 characters: the end of this page is cut')}
  dmPad(false);openHandout({t:dmPadTitle(n).slice(0,120),k:'Notes',b})}
// pages that link to an item, shown in the item's window (DM only)
function dmPadBack(x){if(role()==='player'||!x||!x.n||!dmPadDB())return '';if(DP.uid!==CL.user.id||DP.state==='idle'){DP.uid=CL.user.id;dmPadLoad().then(()=>{if(CUR===x&&$('mbg').classList.contains('open')){const el=$('dp-back');if(el)el.outerHTML=dmPadBack(x)}});return '<div id="dp-back"></div>'}
  if(DP.state!=='ready')return '<div id="dp-back"></div>';const me=lc(x.n.split(' - ')[0]),hits=DP.notes.filter(n=>((n.body||'').match(/\[\[([^\]]{1,80})\]\]/g)||[]).some(m=>{const y=resolveLink(m.slice(2,-2));return y===x||lc(m.slice(2,-2))===me}));
  return hits.length?`<div class="dp-back" id="dp-back"><span>📝 In your notepad:</span>${hits.slice(0,8).map(n=>`<button type="button" class="chip" onclick="closeModal();dmPad(true);dmPadOpen('${esc(n.id)}')">${esc(dmPadTitle(n))}</button>`).join('')}</div>`:'<div id="dp-back"></div>'}
// ── sessions: a start page filled from the party and what is ready, and a recap of what happened since ──
const sessDay=()=>new Date().toISOString().slice(0,10);
function sessStartText(){const L=[],enc=store.get('enc',{}),C=store.get('combat',{round:1,turn:0,list:[]}),d=new Date().toLocaleDateString([], {dateStyle:'long'});
  L.push('## Party');PARTY.forEach(c=>{const cs=Array.isArray(c.cond)&&c.cond.length?' ('+c.cond.join(', ')+')':'';L.push(`- **${c.name||'Unnamed'}** · ${c.cls||'?'} ${c.level||1}${c.hpMax?`, HP ${c.hp??c.hpMax}/${c.hpMax}`:''}${cs}`)});if(!PARTY.length)L.push('- (no characters on the Party page)');
  if(enc.realm||enc.dim)L.push('','## Where','- '+[enc.dim,enc.realm].filter(Boolean).join(', ')+(enc.level?' · party level '+enc.level:''));
  if((enc.list||[]).length){L.push('','## Fight ready');enc.list.forEach(([n,k])=>L.push(`- ${k>1?k+' × ':''}[[${n}]]`))}
  if(C.list&&C.list.length)L.push('','## Combat in the tracker','- Round '+C.round+': '+C.list.map(x=>x.name).join(', '));
  const loot=[];PARTY.forEach(c=>(c.log||[]).forEach(e=>{if(/^Spoils/.test(e.deed||''))loot.push([e.d||'',(c.name||'?')+': '+e.deed.replace(/^Spoils from the .*? fight: /,'')])}));loot.sort((a,b)=>b[0].localeCompare(a[0]));
  if(loot.length){L.push('','## Recent loot');loot.slice(0,6).forEach(x=>L.push('- '+x[1]))}
  L.push('','## Plan','- [ ] ','','## Notes','');return {t:'Session: '+d,body:L.join('\n')}}
function dmPadSession(){if(DP.state!=='ready')return;dmPadFlush();const s=sessStartText(),n={id:uid(),t:s.t,body:s.body,at:Date.now()};DP.notes.unshift(n);dmPadUISet({cur:n.id,view:'edit'});store.set('sess',{at:Date.now(),d:sessDay(),page:n.id});dmPadPush(n.id);dmPadRender();toast('Session started')}
// ── the session timeline: everything that happened since the session started, in order ──
const TLK={quest:['📜','Quests'],downtime:['📅','Downtime'],fight:['⚔','Fights'],trade:['🪙','Trades'],loot:['💰','Loot'],request:['📨','Requests'],swap:['⇄','Swaps'],handout:['📜','Handouts'],journal:['📖','Journal'],rest:['🌙','Rests']};
const sessSince=()=>{const S=store.get('sess',null);if(S&&S.at)return S.at;const d=new Date();d.setHours(0,0,0,0);return +d};
const dayAt=d=>Date.parse((d||'')+'T12:00:00')||0;
function sessEvents(since){const E=[],add=(at,k,t)=>{if(at>=since)E.push({at,k,t})};
  store.get('questlog',[]).forEach(x=>add(x.at,'quest',x.t));
  store.get('downtime',[]).forEach(x=>{if(x.at)add(x.at,'downtime',`${x.who} started ${x.label} (days ${x.start}–${x.end})`);if(x.doneAt)add(x.doneAt,'downtime',`${x.who} finished ${x.label}`)});
  store.get('fights',[]).forEach(f=>add(f.at||dayAt(f.d),'fight',`${f.mons}: ${f.won?'won':'not won'} in ${f.rounds} round${f.rounds>1?'s':''}${f.dropped&&f.dropped.length?' · dropped '+f.dropped.map(x=>x.n).join(', '):''}`));
  store.get('tradelog',[]).forEach(x=>add(x.at,x.src==='loot'?'loot':'trade',`${x.who} ${tlVerb(x)} ${x.kind==='loot'&&/^coin/.test(x.item)?gp(x.gp)+' '+x.item.slice(4).trim():x.kind==='change'?x.item:(x.qty>1?x.qty+' × ':'')+x.item}${x.gp&&x.kind!=='loot'?' for '+gp(x.gp):''}`));
  (TR.list||[]).filter(r=>!['open','countered','agreed'].includes(r.status)&&clIsDM(r.campaign_id)).forEach(r=>{const c=trChar(r);add(Date.parse(r.updated_at||r.created_at)||0,'request',`${c?c.name:'A player'} asked to ${trWhat(r)}: ${r.status==='done'?'agreed':r.status}`)});
  (SW.list||[]).filter(r=>r.status==='accepted').forEach(r=>add(Date.parse(r.updated_at||r.created_at)||0,'swap',`${swName(r,'from')} gave ${swList(r.give)} to ${swName(r,'to')} for ${swList(r.want)}`));
  ((typeof CL!=='undefined'&&CL.handouts)||[]).forEach(h=>add(Date.parse(h.created_at)||0,'handout',`Handout shared: ${h.title}`));
  (store.get('journal',[])||[]).forEach(e=>{if(!e||/^(Recap|Downtime: )/.test(e.t||''))return;const rest=/^(Long|Short) rest$/.test(e.t||'');add(e.at||dayAt(e.d),rest?'rest':'journal',rest?(e.t+' for the party'):`Journal: ${e.t||'Untitled'}`)});
  return E.sort((a,b)=>a.at-b.at)}
function sessTimelineText(E){const tm=t=>new Date(t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});return E.map(e=>`- ${tm(e.at)} ${TLK[e.k][0]} ${e.t}`).join('\n')}
var STL={k:''};
function sessTimeline(){openModal('<div id="stl"></div>');stlRender()}
function stlRender(){const el=$('stl');if(!el)return;const since=sessSince(),S=store.get('sess',null),E=sessEvents(since),L=E.filter(e=>!STL.k||e.k===STL.k),kinds=Object.keys(TLK).filter(k=>E.some(e=>e.k===k));
  const tm=t=>new Date(t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}),dt=t=>new Date(t).toLocaleDateString([], {month:'short',day:'numeric'});
  el.innerHTML=`<h3 style="margin:0 0 4px;font-family:var(--serif)">Session timeline</h3><div class="note" style="margin:0 0 8px">${S&&S.at?`Since the session started, ${dt(since)} at ${tm(since)}`:'Since the start of today (start a session in the notepad to set the time)'} · ${fmt(E.length)} event${E.length===1?'':'s'}. Times are from this device; fights and journal entries from before this update only have their day.</div>
    ${kinds.length>1?`<div class="chips" style="margin-bottom:8px"><button class="chip${!STL.k?' on':''}" data-stk="">All</button>${kinds.map(k=>`<button class="chip${STL.k===k?' on':''}" data-stk="${k}">${TLK[k][0]} ${TLK[k][1]}</button>`).join('')}</div>`:''}
    <div class="stl-list">${L.length?L.map(e=>`<div class="stl-row"><span class="stl-at">${tm(e.at)}</span><span class="stl-ic" aria-hidden="true">${TLK[e.k][0]}</span><span>${esc(e.t)}</span></div>`).join(''):'<div class="empty">Nothing yet. Fights ended in the tracker, trades, loot, requests, swaps, handouts, rests and journal entries show up here as they happen.</div>'}</div>
    ${E.length?`<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText(sessTimelineText(sessEvents(sessSince()))).then(()=>toast('Timeline copied'))">Copy as text</button></div>`:''}`;
  el.querySelectorAll('[data-stk]').forEach(b=>b.onclick=()=>{STL.k=b.dataset.stk;stlRender()})}
function sessRecapText(){const S=store.get('sess',null),since=S&&S.d||sessDay(),L=[];
  const F=store.get('fights',[]).filter(f=>(f.d||'')>=since).reverse();if(F.length){L.push('## Fights');F.forEach(f=>L.push(`- ${f.mons}: ${f.won?'won':'not won'} in ${f.rounds} round${f.rounds>1?'s':''}${f.dropped&&f.dropped.length?'; dropped: '+f.dropped.map(x=>x.n).join(', '):''}`))}
  const loot=[];PARTY.forEach(c=>(c.log||[]).forEach(e=>{if(/^Spoils/.test(e.deed||'')&&(e.d||'')>=since)loot.push((c.name||'?')+': '+e.deed.replace(/^Spoils from the .*? fight: /,''))}));if(loot.length){L.push('','## Loot');loot.forEach(x=>L.push('- '+x))}
  {const T=sessEvents(S&&S.at||dayAt(since)-12*3600e3).filter(e=>['trade','loot','request','swap','handout'].includes(e.k));if(T.length){L.push('','## Trades, loot and handouts');T.forEach(e=>L.push('- '+TLK[e.k][0]+' '+e.t))}}
  const J=(store.get('journal',[])||[]).filter(e=>e&&(e.d||'')>=since&&!/^Recap/.test(e.t||''));if(J.length){L.push('','## Journal');J.forEach(e=>L.push('- '+(e.t||'Untitled')))}
  const pg=S&&DP.notes.find(n=>n.id===S.page);if(pg){const ck=String(pg.body||'').split('\n').map(l=>/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/.exec(l)).filter(m=>m&&m[2].trim());const done=ck.filter(m=>m[1]!==' '),open=ck.filter(m=>m[1]===' ');
    if(done.length){L.push('','## Done');done.forEach(m=>L.push('- '+m[2]))}if(open.length){L.push('','## Still to do');open.forEach(m=>L.push('- [ ] '+m[2]))}
    const notes=/##\s*Notes\s*\n([\s\S]*)$/.exec(pg.body||'');if(notes&&notes[1].trim()){L.push('','## Notes',notes[1].trim())}}
  if(!L.length)L.push('Nothing recorded yet: fights ended in the tracker, loot given out, journal entries and the session page\'s checklist show up here.');
  return {t:'Recap: '+new Date(since+'T12:00').toLocaleDateString([], {dateStyle:'long'}),body:L.join('\n'),since}}
function dmPadRecap(){if(DP.state!=='ready')return;dmPadFlush();const r=sessRecapText(),n={id:uid(),t:r.t,body:r.body,at:Date.now()};DP.notes.unshift(n);dmPadUISet({cur:n.id,view:'read'});dmPadPush(n.id);dmPadRender();
  actToast('Recap written','Add to journal',()=>{const J=store.get('journal',[]);J.push({t:r.t,d:sessDay(),body:dmPadPlain(r.body)});store.set('journal',J);toast('Recap added to the Journal')})}
async function dmPadDel(){dmPadFlush();const n=dmPadCur(),db=dmPadDB();if(!n||!db)return;const i=DP.notes.indexOf(n);DP.notes.splice(i,1);DP.dirty.delete(n.id);dmPadUISet({cur:(DP.notes[0]||{}).id});dmPadRender();
  const {error}=await db.from('dm_notes').delete().match({owner:CL.user.id,id:n.id});if(error){DP.notes.splice(i,0,n);dmPadRender();toast('Couldn\'t delete: '+(dmPadMissing(error)?'the database isn\'t set up':'check your connection'));return}
  undoToast('Deleted "'+dmPadTitle(n)+'"',()=>{DP.notes.splice(i,0,n);dmPadUISet({cur:n.id});dmPadPush(n.id);dmPadRender()})}
document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.key==='n'||e.key==='N'||e.code==='KeyN')&&role()!=='player'){e.preventDefault();dmPad()}
  else if(e.key==='Escape'&&$('dmpad')&&!$('dmpad').hidden&&!$('mbg').classList.contains('open')&&!document.querySelector('details.mmenu[open]')){dmPad(false)}});
function noteByName(name){const k=lc(name.split('/').pop().replace(/#.*$/,''));return NOTES.find(n=>lc(n.n)===k)}
function resolveLink(target){
  let k=lc(target.split('/').pop().replace(/#.*$/,'').trim());if(k==='vestige'&&!NOTES.some(n=>lc(n.n)==='vestige'))k='atrious';
  const note=NOTES.find(n=>lc(n.n)===k);if(note)return note;
  for(const t of ['god','realm','mat','bp','mon','sub','demon','patron','spell']){const arr=TYPES[t].arr;const x=arr.find(y=>lc(y.n)===k)||(t==='god'||t==='demon'||t==='patron'?arr.find(y=>lc(y.n.split(' - ')[0])===k):null)||(t==='realm'?arr.find(y=>lc(y.page||'')===k):null);if(x)return x}
  return null;
}
function mdVault(src){
  const inline=s=>esc(s.replace(/(^|[^/\w])Atrious\b(?!\/)/g,'$1Vestige')).replace(/!\[\[[^\]]*\]\]/g,'').replace(/\[\[([^\]|]+)(?:\\?\|([^\]]+))?\]\]/g,(m,t,a)=>{const label=a||t.split('/').pop().replace(/#.*$/,'');const base=/([^/]+)\.base$/.exec(t);if(base){const sc=base[1].trim();return SP.length&&SP.some(y=>y.sc===sc)||/Spells/.test(t)?`<a href="${pageUrl('spells')}" data-go="spells" data-setup='${esc(JSON.stringify({side:sc}))}'>${label.replace(/\.base$/,'')}</a>`:`<span style="color:var(--muted)">${label}</span>`}const x=resolveLink(t.replace(/&amp;/g,'&').replace(/&#39;/g,"'"));return x?`<a href="#" data-ref="${ref(x)}">${label}</a>`:`<span style="color:var(--muted)" title="Not on the website">${label}</span>`})
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>').replace(/==([^=]+)==/g,'<mark>$1</mark>');
  const L=String(src||'').split('\n');let out='',i=0;
  while(i<L.length){
    let l=L[i];
    if(/^\s*\|/.test(l)&&i+1<L.length&&/^\s*\|?\s*:?-{2,}/.test(L[i+1])){
      const row=x=>x.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(c=>c.trim());
      const head=row(l);i+=2;const body=[];while(i<L.length&&/^\s*\|/.test(L[i])){body.push(row(L[i]));i++}
      out+=`<div class="tablewrap" style="margin:10px 0"><table class="t"><thead><tr>${head.map(h=>`<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>`<tr>${r.map(c=>`<td>${inline(c.replace(/\\\|/g,'|'))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;continue;
    }
    if(/^>/.test(l)){const q=[];while(i<L.length&&/^>/.test(L[i])){q.push(L[i].replace(/^>\s?/,''));i++}let title='';const m=/^\[!(\w+)\][-+]?\s*(.*)$/.exec(q[0]||'');if(m){title=m[2]||m[1];q.shift()}out+=`<div class="callout" style="margin:10px 0">${title?`<b>${inline(title)}</b><br>`:''}${q.map(inline).join('<br>')}</div>`;continue}
    let m;
    if((m=/^(#{1,6})\s+(.*)/.exec(l))){const lv=m[1].length;out+=lv<=1?'':`<h${Math.min(5,lv+2)} style="font-family:var(--serif);margin:16px 0 6px;color:var(--text)">${inline(m[2])}</h${Math.min(5,lv+2)}>`;i++;continue}
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(l)){out+='<hr style="border:0;border-top:1px solid var(--line);margin:12px 0">';i++;continue}
    if(/^\s*([-*+]|\d+[.)])\s+/.test(l)){const ord=/^\s*\d/.test(l);let h=ord?'<ol>':'<ul>';while(i<L.length&&/^\s*([-*+]|\d+[.)])\s+/.test(L[i])){const ind=(/^\s*/.exec(L[i])[0].length);h+=`<li style="margin-left:${ind*6}px">${inline(L[i].replace(/^\s*([-*+]|\d+[.)])\s+(\[[ x]\]\s*)?/,''))}</li>`;i++}out+=h+(ord?'</ol>':'</ul>');continue}
    if(!l.trim()){i++;continue}
    const para=[];while(i<L.length&&L[i].trim()&&!/^(#|>|\s*\||\s*([-*+]|\d+[.)])\s)/.test(L[i])){para.push(L[i]);i++}
    if(!para.length){para.push(L[i]);i++} // a line no other rule takes (a stray table row): show it as text rather than loop forever
    out+=`<p>${para.map(inline).join('<br>')}</p>`;
  }
  return out;
}
const MODAL={
  bp(b){
    const rows=[['Profession',esc(b.pr)],['Specialty',b.sp&&b.sp!==b.pr?esc(b.sp):''],['Item type',!b.design&&dmUnlocked()?`<select class="sel" style="max-width:220px" aria-label="Item type (DM)" onchange="bpTypeSet(${esc(JSON.stringify(b.n))},this.value)">${BP_TYPES().map(c=>`<option${c===b.cat?' selected':''}>${esc(c)}</option>`).join('')}</select> <small style="font-weight:400;color:var(--muted)">DM: file it elsewhere${b.bt0!=null&&b.bt0!==b.cat?' (was '+esc(b.bt0)+')':''}</small>`:esc(b.cat)],['Level',b.lv],['Rarity',esc(b.r)],
      ['Damage',b.dc&&b.dm?`<span class="mono">${esc(b.dc)}</span> ${esc(b.dm)}`:''],['AC',b.ac?esc(b.ac)+(b.ac0&&b.ac0!==b.ac?` <small style="font-weight:400;color:var(--muted)">(vault: ${esc(b.ac0)})</small>`:''):''],['Worn on',esc(wornOn(b))],['Material grade',b.gr?esc(b.gr):''],['Lets you take',b.kit?b.kit.map(k=>KIND_LABEL[k]||k).join(', ')+' from a corpse':''],['Digs',b.mine?'ore, gems, and stone from a vein (a pick)':''],['Bonus',b.kb?'+'+b.kb+(b.mine?' to mining rolls':' to Scavenging rolls'):b.kg?`+${b.kg} to Scavenging ${esc((b.kr||[]).join(' and '))} monsters`:''],['Storage',b.cap?`<b>${b.cap} items</b>${b.grow?` (+${b.grow} for each further Fragment of Space)`:''}${b.carry?', on top of the 20 a character carries':', stays where it is left'}`:b.voidbag?'Holds nothing: whatever goes in is unmade':b.devotion?'Holds nothing: whatever goes in is given to its god':''],['Also needs',b.needs?b.needs.map(x=>{const y=findBP(x);return y?refChip(y,esc(y.n)):esc(x)}).join(', '):''],['Forge needed',(F=>`${esc(forgeText(F))} <small style="font-weight:400;color:var(--muted)">${esc(F.how)}</small>`)(forgeReq(b))]];
    const mats=b.mats.map(n=>({n,m:findMat(n)}));
    const total=mats.reduce((a,x)=>a+(x.m&&x.m.price||0),0),unsold=mats.some(x=>x.m&&!x.m.price&&x.m.tier>=8);
    const strong=strongestMat(b);
    const mlist=mats.length?`<div class="mlist">${mats.map(({n,m})=>m?`<button data-ref="${ref(m)}"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:${rcol(m.realm)}"></span>${esc(m.n)} <span class="x">${esc(m.gr||'')}${m.pn?' · '+esc(m.pn):''}</span><span class="r">${m.price?gp(m.price):favorOf(m)?fav(favorOf(m)):m.tier>=8?'not sold':'—'}</span></button>`:`<button disabled>${esc(n)} <span class="x">not in materials list</span></button>`).join('')}</div>
      <div class="note">${(()=>{const C=craftCost(b,1);return C.matGp||C.matFavor?`Materials: <b style="color:var(--gold2)">${costText(C.matGp,C.matFavor)}</b> for one unit of each. Worth <b>${costText(C.valueGp,C.valueFavor)}</b> when made (twice the materials plus ${costText(C.laborGp,C.laborFavor)} of hired labor); the Blueprint costs ${costText(C.bpGp,C.bpFavor)}. Prices follow the Economy rules, scaled to the ${esc(C.deep)} Realm.`:''})()}${strong?` Strongest material: <b>${esc(strong.n)}</b> (Rank ${strong.rank}, Item Level ${strong.il}).`:''}</div>`:'';
    let vars='';
    if(['Sword','Axe','Hammer','Dagger','Bow','Staff','Spear'].includes(b.cat)){
      const mine=new Set(b.mats.map(lc));
      const ents=Object.entries(MAT_FX).sort((a,c)=>(mine.has(lc(c[0]))-mine.has(lc(a[0]))));
      vars=`<details class="fold"><summary>Material weapon variants: how each special material changes this ${esc(b.cat.toLowerCase())}</summary><div class="vgrid">${ents.map(([n,f])=>{const m=findMat(n);return `<div class="vcard${mine.has(lc(n))?' mine':''}"><b>${m?`<a href="#" data-ref="${ref(m)}" style="color:inherit;text-decoration:none">${esc(n)}</a>`:esc(n)}</b><span class="bn">${esc(f.bonus)} · ${esc(f.dt)}</span><div>${esc(f.fx)}</div></div>`}).join('')}</div></details>`;
    }
    const conns=(b.conns||[]).filter(c=>!/Index$/.test(c)).map(c=>{const g=GOD_IDX.get(lc(c.split(' - ')[0]));const d=DEMONS.find(x=>x.n===c)||PATRONS.find(x=>x.n===c);const t=g||d;return t?refChip(t,esc(c)):`<span class="chip">${esc(c)}</span>`}).join('');
    return {title:(b.mg?'<span style="color:var(--gold)">✦</span> ':'')+esc(b.n),strip:`var(--c-${{Common:'common',Uncommon:'uncommon',Rare:'rare','Very Rare':'vrare',Legendary:'legend',Artifact:'artifact'}[b.r]||'common'})`,
      kind:'Blueprint · '+esc(b.pr),
      badges:`${rarB(b.r)}<span class="b">Level ${b.lv}</span><span class="b ghost">${esc(b.cat)}</span>${b.mg?'<span class="b gold">✦ Magic artifact</span>':''}`,
      body:(b.design&&(b.design.peek||b.design.foreign)?designPeekHTML(b):b.design?`<div class="callout" style="border-color:var(--gold)">✎ <b>Your design</b>, made in the Forge${b.design.base?' from the general '+esc(b.design.base):''}. Filed under <b>${esc(b.pr)}${b.sp?' → '+esc(b.sp):''}</b> ${b.design.sort&&b.design.sort.by==='ai'?'by AI':'by FAND\'s rules'}.${b.design.lore&&b.design.lore!==b.ds?`<div style="margin-top:6px">${esc(b.design.lore)}</div>`:''}${b.design.forms&&b.design.forms.length?`<div style="margin-top:6px"><b>Everchanging, ${b.design.formMax} forms</b> (a bonus action to reshape): ${b.design.forms.map(f=>`${esc(f.n)} <span class="mono">${esc(f.dmg)}</span>`).join(' · ')}${b.design.forms.length<b.design.formMax?` · ${b.design.formMax-b.design.forms.length} not chosen yet (open it in the Forge)`:''}</div>`:''}<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="closeAll();designOpen(${esc(JSON.stringify(b.n))})">⚒ Open in the Forge</button><button class="btn" onclick="designResort(${esc(JSON.stringify(b.n))})">↻ File it again</button></div></div>`:'')+kv(rows)+(b.prop?`<div class="callout">✧ <b>${esc(b.prop)}</b>${strong&&strong.prop?`<div style="margin-top:4px">${esc(strong.prop.replace(/^[^:]+:\s*/,''))}</div>`:''}</div>`:'')
        +(b.ds?`<div class="prose"${b.design?' style="white-space:pre-line"':''}>${esc(b.ds)}</div>${b.dsg?SITE_FILL:''}`:b.lost?`<div class="prose lost">This Blueprint's description was lost in an earlier sync of this app; its materials were recovered. The full text is in the vault note <b>${esc(b.n)}</b>.</div>`:'')
        +(()=>{if(b.design)return '';const cap=bpPotCap(b),hi=mats.map(x=>x.m).filter(m=>m&&m.pn&&(m.pot||0)>cap);return hi.length?`<div class="callout" style="border-color:var(--gold)"><b>Held back by its level.</b> A level ${b.lv} item's properties work at Potency ${cap} at most, so ${hi.map(m=>`${esc(m.pn)} (from ${esc(m.n)}, Potency ${m.pot})`).join(', ')} ${hi.length>1?'act':'acts'} at Potency ${cap} here.</div>`:''})()
        +(ARMOR_CATS.includes(b.cat)&&b.ac?(()=>{const pc=armorPiece(b),d=pieceDrawbacks(pc);return `<div class="callout"><b>Armor drawback</b> (${esc(pc.weight.toLowerCase())} ${esc(pc.slot.toLowerCase())} piece): ${d.length?esc(d.join('; ')):'none'}.${pc.weight!=='Light'&&!['Mount','Enhancement','Buckler','Shield','Tower'].includes(pc.slot)?` Wearing ${pc.weight.toLowerCase()} pieces on 8 or more armor units adds the full-set drawback.`:''}</div>`})():'')
        +`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="store.set('craft',Object.assign(store.get('craft',{}),{bp:${esc(JSON.stringify(b.n))},qty:1}));closeAll();go('craft')">⚒ Plan crafting</button>${genOf(b)?`<button class="btn" onclick="openInForge(BPS[${b._i}])">🔥 Build it in the Forge</button>`:''}</div>`
        +(genOf(b)?blk('General Blueprint',(()=>{const g=genOf(b),G=BASES[g],parts=assignParts(g,b.mats.map(findMat).filter(Boolean));return `<div class="note" style="margin:0 0 8px">This is a version of the general <b>${G.icon} ${esc(g)}</b>${G.props?` (${esc(G.props)})`:''}. Its materials fill these parts; any other material that fits can replace them in the Forge.</div><div class="tablewrap"><table class="t"><tbody>${G.slots.map(sl=>{const m=findMat(parts[sl.id]||''),f=slotFit(sl,m);return `<tr><td style="white-space:nowrap"><b>${esc(sl.name)}</b> <small style="color:var(--muted)">${sl.role==='primary'?'main':sl.role==='structure'?'structure':'extra'}</small></td><td>${m?`<a href="#" data-ref="${ref(m)}">${esc(m.n)}</a>`:`<span style="color:var(--muted)">${sl.optional?'empty (optional)':'not set'}</span>`}</td><td style="color:${{good:'var(--green)',poor:'var(--gold2)',wrong:'var(--red)'}[f.lv]||'var(--muted)'}">${{good:'✓ good fit',poor:'△ poor fit',wrong:'✕ wrong material',missing:'needs a '+sl.ok.map(c=>CAT_NAME[c].toLowerCase()).join(' or '),empty:''}[f.lv]}</td></tr>`}).join('')}</tbody></table></div>`})()):'')
        +blk('Traits when equipped',(()=>{const tr=mats.filter(x=>x.m&&x.m.tr).map(x=>x.m);return tr.length?trListHTML(tr,gearKind(b),m=>'from '+esc(m.n)+(m.origin&&m.org==='Creature'?' ('+esc(m.origin)+')':'')):''})(),'from its materials')
        +blk('Materials',mlist+(b.mi?`<div class="note">The vault lists no materials for this Blueprint. These are suggested by the site: materials its description names, or ones of the right kind for its level. Change them freely.</div>`:''),mats.length?mats.length+(b.mi?' suggested':' required'):'')+blk('Connections',conns?`<div class="chips">${conns}</div>`:'')+vars};
  },
  mat(m){
    const users=bpByMat().get(lc(m.n))||[];
    const mons=monByMat().get(lc(m.n))||[];
    const gods=GOD_BY_MAT.get(lc(m.n))||[];
    const fx=MAT_FX[m.n];
    const originMon=m.origin&&MON_IDX.get(lc(m.origin));
    const rows=[['Origin',esc(m.org||'')+(m.origin?`<small style="display:block;font-size:.75rem;color:var(--muted);font-weight:400">${m.org==='Creature'?'from ':''}${originMon?`<a href="#" data-ref="${ref(originMon)}">${esc(m.origin)}</a>`:esc(m.origin)}</small>`:'')],['Realm',`<span style="color:${rcol(m.realm)}">●</span> ${esc(m.realm)}`],['Grade',m.g],['Material rank',m.rank],['Item level',m.il],['Rarity',esc(m.rar||'')],['Potency',m.pot||''],['Type',esc(m.ty||m.cat)],
      ['Price',m.price?gp(m.price)+(localPrice(m.price,m.realm)?` <em style="font-style:normal;font-weight:400;color:var(--muted)">· ${localPrice(m.price,m.realm)}</em>`:'')+`<small style="display:block;font-size:.72rem;color:var(--muted);font-weight:400">merchants buy at ${gp(Math.floor(m.price/2))}</small>`:favorOf(m)?`${fav(favorOf(m))}<small style="display:block;font-size:.72rem;color:var(--muted);font-weight:400">not sold for coin; bought from a god or its contractors with Favor (temple discounts apply)</small>`:m.tier>=8?'Not sold':'—']];
    const src=[m.where?`Gathered at ${esc(m.where)}${m.by?` by <b>${esc(m.by)}</b>`:''}.`:'',m.src&&!/^(Gathered|Drops from|Used in)/.test(m.src)?esc(m.src):m.where?'':esc(foundOf(m)),m.use?`Used for: ${esc(m.use)}.`:''].filter(Boolean).join('<br>');
    return {title:esc(m.n),strip:rcol(m.realm),kind:'Material · '+esc(m.ty||m.cat),
      badges:`<button class="b" style="cursor:pointer" onclick="cmpToggle(${esc(JSON.stringify(m.n))})" title="Compare side by side on the Forge">⚖ Compare</button>${realmB(m.gr)}${rarB(m.rar)}${m.gen?'<span class="b blue">Harvest part</span>':''}${m.gath?`<span class="b green">${esc({ore:'Ore',herb:'Herb',fauna:'Small fauna',hide:'Hide'}[m.gath]||'Gathered')}</span>`:''}${m.supply?'<span class="b ghost">Supply</span>':''}${fx?'<span class="b gold">⚔ Weapon effect</span>':''}${m.cursed?'<span class="b red" title="A cursed material: its curse can\'t be shed by taking the item off; Remove Curse quiets it for a day">☠ Cursed</span>':''}`,
      body:(m.cursed&&m.twin?`<div class="callout" style="border-color:var(--red)">☠ <b>Cursed.</b> The Abyss's dark twin of ${(()=>{const t=findMat(m.twin);return t?refChip(t):esc(m.twin)})()}: stronger, and it costs. Its curse can't be shed by taking the item off; Remove Curse quiets it for a day, and destroying the item ends it.</div>`:'')
        +(m.dark?`<div class="note">It has a cursed twin in the Abyss: ${(()=>{const t=findMat(m.dark);return t?refChip(t):esc(m.dark)})()}.</div>`:'')+kv(rows)
        +(m.rfx?`<div class="callout" style="border-color:var(--acc)">ᚱ <b>Rune effect: ${esc(m.rfx.n)}</b> <span style="color:var(--muted)">(set into gear, from ${esc(m.rfx.a)})</span><div style="margin-top:4px">${esc(m.rfx.t)}</div></div>`:'')
        +(m.tr?`<div class="callout" style="border-color:${m.tr.rune?'var(--acc)':'var(--gold)'}">${m.tr.rune?'ᚱ':'◆'} <b>${m.tr.rune?'Rune effect':'Unique trait'}: ${esc(m.tr.n)}</b>${m.tr.rune?` <span style="color:var(--muted)">(set into gear; this is the ore of the ${(()=>{const ru=RUNE_IDX.get(lc(m.tr.rune));return ru?refChip(ru,'ᚱ '+esc(ru.n)):esc(m.tr.rune)})()} Rune)</span>`:''}${m.tr.a&&!m.tr.rune?` <span style="color:var(--muted)">(${esc(m.tr.a)})</span>`:''}${m.tr.s?` <span class="b ghost">works only ${TR_WHERE[m.tr.s]}</span>`:''}<div style="margin-top:4px">${esc(m.tr.t)}</div>${MATS.filter(o=>o.tr&&o.tr.n===m.tr.n).length>1?`<div style="margin-top:6px"><button class="chip" data-go="materials" data-setup='${esc(JSON.stringify({f:{tr:m.tr.n}}))}'>All ${fmt(MATS.filter(o=>o.tr&&o.tr.n===m.tr.n).length)} materials with ${esc(m.tr.n)} →</button></div>`:''}</div>`:m.basic?`<div class="callout" style="background:var(--surf2);border-color:var(--line)">${esc(m.basic)}</div>`:'')
        +(m.prop?`<div class="callout">✧ <b>Property: ${propChip(m.pn)}</b>${m.pot?` · Potency ${m.pot} (rank ${potRank(m.pot)})`:''}<div style="margin-top:4px">${esc(m.prop.replace(/^[^:]+:\s*/,''))}</div></div>`:m.supply?`<div class="callout">Supply: used up in crafting and gives no property.</div>`:'')
        +(/everchanging substance/i.test(m.n)?`<div class="callout" style="border-color:var(--acc)">🜁 <b>Everchanging:</b> tick <b>Everchanging weapon</b> at the Forge and set this in the weapon's core: it can change between <b>${formsFor(m)} forms</b>: the weapon and one extra form for each realm of its grade (this is ${esc(m.gr||m.realm)}, so ${formsFor(m)-1} extra). Each extra form is a weapon template of your choice; materials already in the weapon carry over where they fit, and you add materials for the parts they can't fill. The wielder reshapes it as a bonus action.</div>`:'')
        +(alchOf(m)?`<div class="callout" style="border-color:var(--green)">🧪 <b>In alchemy:</b> ${esc(alchOf(m))}${m.alch?'':' <small style="color:var(--muted)">(from its trait)</small>'}</div>`:'')
        +(m.ds?`<div class="prose">${esc(m.ds)}</div>`:'')
        +((m.hab||m.how)?blk('Gathering',`${kv([m.hab?['Habitat',esc(m.hab)]:null,m.how?['How to collect',esc(m.how)]:null,['Find it',`DC <b>${gatherDC(m)}</b> Harvesting check, about ${gatherHours(m)} of searching${m.shaft?'; also turns up in a '+esc(m.realm)+' mine shaft':''}`],['Collect',`Meet the DC to take 1, and 1 more for every 2 points above it; each new try at the same spot adds ${SCAV_STEP} to the DC`]].filter(Boolean))}<div class="note">The higher its grade and realm, the harder it is to find: DC 10 + grade ${m.g}${realmDC((REALM[m.realm]||{}).tier)?' + '+realmDC((REALM[m.realm]||{}).tier)+' for the '+esc(m.realm):''}. Without the Harvesting profession, or below the stage the realm needs, roll at disadvantage.</div>`):'')
        +(m.gen?`<div class="note" style="margin:0">Harvest part generated in this app so every monster lists every part of its body. It isn't in the vault yet.</div>`:'')
        +(fx?blk('Weapon effect',`<div class="vcard mine"><span class="bn">${esc(fx.bonus)} · ${esc(fx.dt)} damage</span><div>${esc(fx.fx)}</div></div>${m.bonus&&m.bonus!=='+0'?`<div class="note">Listed bonus: ${esc(m.bonus)}</div>`:''}`):(m.bonus&&m.bonus!=='+0'?blk('Bonus',`<div class="prose" style="font-size:.9rem">${esc(m.bonus)}</div>`):''))
        
        +blk('Source',src?`<div style="font-size:.88rem;color:var(--text2)">${src}</div>`:'')
        +blk('Dropped by',mons.length?`<div class="chips">${mons.map(x=>{const d=(x.drops||[]).find(d=>lc(d[0])===lc(m.n));return refChip(x,esc(x.n)+(d&&d[2]?' ×'+d[2]:''),x.realm+' '+x.g)}).join('')}</div>${mons.some(x=>(x.drops||[]).some(d=>lc(d[0])===lc(m.n)&&d[2]))?'<div class="note">×N: how many one corpse holds.</div>':''}`:'')
        +blk('Signature material of',gods.length?`<div class="chips">${gods.map(g=>refChip(g,esc(godKey(g)))).join('')}</div>`:'')
        +blk('Used in Blueprints',users.length?`<div class="chips">${users.slice(0,24).map(b=>refChip(b,esc(b.n),'Lv '+b.lv)).join('')}</div>${users.length>24?`<div style="margin-top:8px"><button class="btn" data-go="blueprints" data-setup='${esc(JSON.stringify({f:{mat:m.n}}))}'>See all ${fmt(users.length)} in Blueprints →</button></div>`:''}`:'',users.length?fmt(users.length):'')};
  },
  mon(m){
    const realm=REALM[m.realm];
    if(CHAMP_NEXT&&CHAMP_NEXT.base===m.n){CHAMP_SEL=CHAMP_NEXT.cls;CHAMP_SUB=CHAMP_NEXT.sub||'';CHAMP_HC=CHAMP_NEXT.hc||'';CHAMP_NEXT=null}else if(CHAMP_FOR!==m.n){CHAMP_SEL='';CHAMP_SUB='';CHAMP_HC=''}CHAMP_FOR=m.n;
    if(m.sb&&!HC&&HIDDEN.lock&&!CHAMP_HC_TRIED){CHAMP_HC_TRIED=true;hcAuto().then(()=>{if(HC&&CUR===m)champRefresh()}).catch(()=>{})}
    let drops='';
    if(m.drops&&m.drops.length)drops=`<div class="mlist">${m.drops.map(([n,gr,q])=>{const x=findMat(n);return x?`<button data-ref="${ref(x)}"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:${rcol(x.realm)}"></span>${typeIdx(x)>=0?symSVG(typeIdx(x),'tsym'):''}${esc(n)} <b>×${q||1}</b> <span class="x">${esc(gr)}${x.tr?' · ◆ '+esc(x.tr.n):x.pn?' · '+esc(x.pn):''}</span><span class="r">${x.price?gp(x.price):'not sold'}</span></button>`:`<button disabled>${esc(n)} <span class="x">${esc(gr)}</span></button>`}).join('')}</div>`;
    const sugg=!drops?suggestDrops(m,4):[];
    return {title:esc(m.n),strip:rcol(m.realm),kind:(m.hb?'Homebrew monster':m.myth?m.myth+' mythology':'Official monster')+' · '+esc(m.realm)+' Bestiary',
      badges:`${realmB(m.realm+' '+m.g)}${m.gb?'<span class="b red" title="A god-level beast: CR 26 or more">God-beast</span>':''}${m.cr?`<span class="b">CR ${esc(m.cr)}</span><span class="b ${m.myth?'blue':'ghost'}">${esc(m.myth?m.myth+' mythology':BOOKS[m.book]||m.book)}</span>`:'<span class="b gold">Homebrew</span>'}`,
      body:kv([['Realm',esc(m.realm)],['Grade',m.g],m.cr?['Challenge',esc(m.cr)]:null,m.hab?['Habitat',esc(m.hab)]:null,realm?['Realm pressure',realm.pressure]:null])
        +`<div class="prose">${esc(m.txt||m.ds)}</div>`
        +(m.gb?`<div class="note"><b>God-beast.</b> A creature on the level of the gods (CR 26+). Its corpse counts as level ${corpseLv(m)} for raising the dead, so only a necromancer near that level has a real chance. Fighting one is a campaign event: expect a lair, legendary actions, and a god who wants it bound or freed.</div>`:'')
        +((m.rel||[]).length?blk('Related',`<div class="mlist">${m.rel.map(n=>{const x=MON_IDX.get(lc(n)),g=!x&&godByKey(n);return x?`<button data-ref="${ref(x)}"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:${rcol(x.realm)}"></span>${esc(x.n)} <span class="x">CR ${esc(x.cr||'?')} · ${esc(x.realm)}</span><span class="r">${x.gb?'God-beast':/spawn|young|calf|fledgling|whelp|brood/i.test(x.n)?'Spawn':'Kin'}</span></button>`:g?`<button data-ref="${ref(g)}"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:var(--gold2)"></span>${esc(g.n)} <span class="x">God</span><span class="r">Bound by myth</span></button>`:`<button disabled>${esc(n)}</button>`}).join('')}</div><div class="note">Parents, spawn, kin and the gods tied to this creature in its myths.</div>`,m.rel.length+' links'):'')
        +(m.sb?`<div class="champ-pick" id="mon-champ-box">${champPickerHTML(m)}</div>`:'')
        +`<div id="mon-sb">${sbHTML(CHAMP_SEL&&m.sb?champion(m,CHAMP_SEL,champOpts()):m)}</div>`
        +`<div class="lore">${monsterLore(m).map(([h,t])=>`<h5>${esc(h)}</h5><p>${linkNames(esc(t),m)}</p>`).join('')}</div>`
        +((m.drops||[]).length?`<div><button class="btn primary" type="button" onclick="scavPop(${esc(JSON.stringify(m.n))})">🔪 Scavenge a corpse</button> <span class="note" style="margin:0">Opens the Scavenging rolls for one ${esc(m.n)} corpse.</span></div>`:'')
        +blk('Drops',drops+`<div class="note">×N is how many one corpse holds (${esc(m.sb&&m.sb.sz||'Medium')} body). Scavenging DC ${scavBase(m)}: meet it to take 1 part, +1 part for every 2 points above it; each new try on the same corpse adds ${scavStep(m)} to the DC (bigger bodies climb more slowly: Tiny and Small +5, Medium +4, Large +3, Huge +2, Gargantuan +1). These counts are for a whole corpse: the killing blow's damage type can ruin some parts (bludgeoning crushes bone, fire burns hide, poison taints organs).</div>`,(m.drops||[]).length+' parts · '+(m.drops||[]).reduce((a,d)=>a+(d[2]||1),0)+' pieces per corpse')
        +(sugg.length?blk('Suggested drops',`<div class="chips">${sugg.map(x=>matChip(x.n,x.gr)).join('')}</div><div class="note">This official monster's drops are listed on the ${esc(m.realm)} Bestiary page in the vault. These are same-realm materials near its grade, as a starting point.</div>`):'')
        +(realm?`<div><button class="btn" data-ref="${ref(realm)}">Open the ${esc(m.realm)} realm →</button></div>`:'')};
  },
  god(g){
    const rivals=new Map();
    (g.runes||[]).forEach(r=>(RUNE_GODS.get(r)||[]).forEach(o=>{if(o!==g){if(!rivals.has(o))rivals.set(o,[]);rivals.get(o).push(r)}}));
    const hand=g.seated!=null?`<div class="mlist">${['1st','2nd','3rd','4th','5th'].map((o,i)=>`<button disabled style="cursor:default;opacity:1"><b style="color:var(--gold2);width:84px;flex-shrink:0;white-space:nowrap">${o} Finger</b>${g.hand&&g.hand[i]?esc(g.hand[i]):'<span class="x">Vacant seat</span>'}</button>`).join('')}</div>`:'';
    return {title:esc(godKey(g)),ep:esc(godTitle(g)),strip:rcol(g.home),kind:'God · '+esc(g.grp),
      badges:`${g.home?realmB(g.home):''}${(g.runes||[]).map(r=>{const x=RUNE_IDX.get(lc(r));return `<button class="b ${CONTESTED.includes(r)?'red':'acc'}" style="cursor:pointer;border:0" ${x?`data-ref="${ref(x)}"`:''} title="${x?esc(x.fig.name+', '+x.fig.title):''}">ᚱ ${esc(r)}</button>`}).join('')}`,
      body:(g.myth?`<div class="prose">${esc(g.myth)}</div>`:`<div class="prose">${esc(g.ds||'')}</div>`)
        +(g.wants?`<div class="callout"><b>Wants from contractors:</b> ${esc(g.wants)}</div>`:'')
        +(g.pop?`<div class="note">A pop-culture joke god added by the site. It plays by the same rules as every other god: contracts, ranks, Fingers, contract spells and Apostle class all work.</div>`:g.site?`<div class="note">Added by the site to complete the ${esc(g.grp)}; not yet in the vault's God Roster.</div>`:'')
        +kv([['Home realm',g.home?esc(g.home):''],['Runes',(g.runes||[]).length||''],['Hand',g.seated!=null?g.seated+' of 5 seated':''],['Finger relic',g.relic?esc(g.relic):'']])
        +blk('Apostle class',apostleHTML(g,false))
        +blk('How to gain a contract',ctWaysHTML(g)+'<div class="note">No other way works: a character cannot sign with a god they have never reached.</div>')
        +blk('Signature materials',g.rk?`<div class="mlist">${Object.entries(g.rk).map(([rk,n])=>{const x=findMat(n);if(!x)return '';const ct=CONTRACTS.find(c=>c.r===rk)||CONTRACTS[5];const base=x.price?gp(x.price):favorOf(x)?fav(favorOf(x)):'',dis=x.price?gp(Math.round(x.price*(100-ct.disc)/100)):favorOf(x)?fav(Math.max(1,Math.round(favorOf(x)*(100-ct.disc)/100))):'';return `<button data-ref="${ref(x)}"><b style="width:74px;flex-shrink:0;color:var(--gold2)">${rk}</b>${esc(x.n)} <span class="x">${esc(x.gr)}${['Normal','Senior','Apostle'].includes(rk)?' · vault':''}</span><span class="r">${dis?dis+(dis!==base?` <s style="opacity:.6">${base}</s>`:''):''}</span></button>`}).join('')}</div>`:(g.sig||[]).length?`<div class="chips">${g.sig.map(n=>matChip(n,(findMat(n)||{}).gr)).join('')}</div>`:'',g.rk?'one for each contract rank; prices at that rank\'s temple discount':'')
        +passageHTML(g)
        +(()=>{const tg=templeGoods(g.home);return tg.length?`<details class="fold"><summary>General goods sold in ${esc(domainOf(g).name)} (${tg.length})</summary><div class="note" style="margin:6px 0">Basic materials of every kind, sold to anyone who comes through the passage at list price, and to contractors at their rank's discount (Minor 10% up to 50% for the Fingers).</div><div class="mlist">${tg.map(x=>`<button data-ref="${ref(x)}">${esc(x.n)} <span class="x">${esc(CAT_NAME[matCode(x)]||'')} · ${esc(x.gr)}</span><span class="r">${x.price?gp(x.price):fav(favorOf(x))}</span></button>`).join('')}</div></details>`:''})()
        +(g.stock&&g.stock.length?blk('Temple stock',`<div class="mlist">${g.stock.map(n=>{const x=findMat(n);return x?`<button data-ref="${ref(x)}">${esc(x.n)} <span class="x">${esc(x.gr)}${x.pn?' · '+esc(x.pn):''}</span><span class="r">${x.price?gp(x.price):favorOf(x)?fav(favorOf(x)):''}</span></button>`:''}).join('')}</div>`,'sold in its domain to contractors, less their rank\'s discount'):'')
        +blk('The Hand',hand,'the five Fingers')
        +blk('Contract spells',godSpellsHTML(g),'what '+esc(godKey(g))+' gives its contractors, by rank')
        +`<details class="fold"><summary>Contract ranks and rewards with ${esc(godKey(g))}</summary><div>${contractTable(g)}<p class="note"><a href="${pageUrl('rules')}" data-go="rules">Duties, rising in rank, and breaking a contract →</a></p></div></details>`
        +blk('Rivals',rivals.size?`<div class="chips">${[...rivals].map(([o,rs])=>refChip(o,esc(godKey(o)),'over '+rs.join(', '))).join('')}</div>`:'','gods holding the same Runes')
        +(REALM[g.home]?`<div><button class="btn" data-ref="${ref(REALM[g.home])}">Open ${esc(g.home)} →</button></div>`:'')};
  },
  spell(s){
    return {title:esc(s.n),kind:'Spell · '+esc(s.sc),
      badges:`<span class="b acc">${esc(s.sc)}</span><span class="b ${s.lv===0?'gold':''}">${s.lv===0?'Cantrip':'Level '+s.lv}</span>`,
      body:`<div class="sp-does"><h4>What it does</h4><div class="prose">${esc(s.desc||'No description yet.')}</div></div>`
        +kv([['Realm of magic',`${esc(spellRealm(s))} · ${spellNeed(s)===1?'any class can learn it':'needs stage '+ROMAN[spellNeed(s)-1]+' (a class II or higher, level '+stageStart(spellNeed(s))+'+)'.replace('a class II or higher','class '+ROMAN[spellNeed(s)-1])}`],['Taught at',typeof MAGIC_TOWERS!=='undefined'&&MAGIC_TOWERS[s.sc]?`<a href="${pageUrl('magic')}" onclick="store.set('magic',Object.assign(store.get('magic',{}),{school:${esc(JSON.stringify(s.sc))},q:''}))">${esc(MAGIC_TOWERS[s.sc][0])}</a>${s.tier==='Primary'?' (not sold: Rune-bound)':' · '+priceText(spellPrice(s),1)+' to learn'}`:''],['Tier',esc(s.tier||'')+({SRD:' <small style="font-weight:400;color:var(--muted)">from the official D&amp;D 5e System Reference Document (the open-licensed core rules), outside the vault\'s own Cantrip/Tertiary/Secondary/Primary tiers</small>',Original:' <small style="font-weight:400;color:var(--muted)">an original spell built on an idea from a non-SRD supplement, with its own name and text</small>',Resonance:' <small style="font-weight:400;color:var(--muted)">the Bard-only School of Resonance</small>',Tertiary:' <small style="font-weight:400;color:var(--muted)">common (levels 1–3)</small>',Secondary:' <small style="font-weight:400;color:var(--muted)">levels 4–6</small>',Primary:' <small style="font-weight:400;color:var(--muted)">rare (levels 7–9), tied to a Rune</small>'}[s.tier]||'')],['Rune',s.rune&&RUNE_IDX.get(lc(s.rune))?refChip(RUNE_IDX.get(lc(s.rune)),esc(s.rune)):esc(s.rune||'')],['Components',esc(s.comp||'')],['Casting time',esc(s.ct)],['Range',esc(s.rng)],['Duration',esc(s.dur)],['Damage',s.dmg&&s.dmg!=='None'?`<span class="mono" style="color:var(--red)">${esc(s.dmg)}</span>`:'']])
        +(spellLock(s)?`<div class="callout" style="border-color:var(--red);margin:8px 0">🔒 <b>Needs DM approval.</b> This spell ${esc(spellLock(s))}, so a character can learn or cast it only once the DM approves it for them.</div>`:'')
        +blk('Where it works',`<div class="note" style="margin:0 0 6px">${spellHome(s)?`A Rune spell: learnt only in the <b>${esc(spellHome(s))} Realm</b>, and cast only there.`:'Learnt in any realm the caster\'s stage opens, and cast only in the realm where it was learnt. Learn it again in another realm to use it there.'}</div>${spellScales(s)?`<div class="chips">${spellLearnIn(s).map(rn=>`<span class="chip" style="cursor:default;border-color:${(REALM[rn]||{}).color||'var(--line)'}"><small>${esc(rn)}</small> <b class="mono">${esc(spellAt(spellDmg(s),diceMult(realmPow(rn))))}</b></span>`).join('')}</div>`:''}`,spellScales(s)?'its dice in each realm: the realm\'s magic sets its power':'')
        +(/animate dead|animate remains|create undead|legion of bones|summon undead|unmarked grave/i.test(s.n)?`<div class="callout" style="border-color:var(--gold)">⚰ <b>In FAND, raising the dead follows the necromancy rules:</b> the chance depends on the corpse's level against yours (20% at your level, 2% one above), each point of INT is one summon slot, and each kind of undead keeps its own share of the original and needs its own kind of corpse. <a href="${pageUrl('rules')}" data-go="rules">Necromancy rules →</a></div>`:'')
        +blk('Classes',(s.cls||[]).length?`<div class="chips">${s.cls.map(c=>`<button class="chip" data-go="spells" data-setup='${esc(JSON.stringify({f:{cls:c}}))}'>${esc(c)}</button>`).join('')}</div>`:'<div class="note" style="margin:0">No classes listed for this spell in the app data.</div>')
        +(typeof SCHOOL_INFO!=='undefined'&&SCHOOL_INFO[s.sc]?blk('School of '+esc(s.sc),`<div class="note" style="margin:0">${esc(SCHOOL_INFO[s.sc][0])} ${esc(SCHOOL_INFO[s.sc][1])} <a href="#" onclick="store.set('magic',Object.assign(store.get('magic',{}),{school:${esc(JSON.stringify(s.sc))},q:''}));closeAll();go('magic');return false">Its tower →</a></div>`):'')};
  },
  sub(s){
    const src=subSource(s),sibs=SUBS.filter(x=>x.par===s.par&&x!==s);
    return {title:esc(s.n),kind:esc(s.par)+' subclass',
      badges:`<span class="b acc">${esc(s.par)}</span><span class="b ${src==='Homebrew'?'gold':'ghost'}">${esc(src)}</span>`,
      body:`<div class="prose">${esc(String(s.ds||'').replace(/\s*\([^()]*\)\s*$/,''))}</div>`
        +(src!=='Homebrew'?`<div class="note" style="margin:0">Official subclass, summarised in the campaign's own words. Every class picks its subclass at level 3.</div>`:'')+((s.lv||typeof SUBSTAGES!=='undefined'&&SUBSTAGES[s.n])?blk('Features by level',subLadderHTML(s.n),'levels 3–20, then II to V with its class every 20 levels'):'')+(typeof STAGES!=='undefined'&&STAGES[s.par]?`<div><a class="btn" href="${pageUrl('classes')}" onclick="store.set('clsfocus','cl-${pid(s.par)}')">All ${esc(s.par)} changes (${esc(s.par)} II to V) →</a></div>`:'')
        +blk('Other '+esc(s.par)+' subclasses',`<div class="chips">${sibs.map(x=>refChip(x)).join('')}</div>`)};
  },
  demon(e){return entityModal(e,PATRONS,'Also a patron')},
  patron(e){return entityModal(e,DEMONS,'Also listed among the demons')},
  note(n){
    const sup=SUPERSEDED[n.n];
    const fm=Object.entries(n.fm||{}).filter(([k])=>!/^(tags|aliases|cssclass)/i.test(k)).slice(0,12);
    return {title:esc(n.n),kind:'Vault note · '+esc(n.f),
      badges:`<span class="b acc">${esc(n.f)}</span>${sup?'<span class="b gold">Updated on the website</span>':''}${n.site?'<span class="b blue">Written for the site</span>':''}`,
      body:(sup?`<div class="callout" style="border-color:var(--gold)"><b>The website takes priority.</b> ${esc(sup.msg)} <a href="${pageUrl(sup.go)}" data-go="${sup.go}">See the current version →</a></div>`:'')
        +(fm.length?kv(fm.map(([k,v])=>[esc(k),esc(v)])):'')
        +`<div class="prose vault" style="font-family:var(--sans);font-size:.92rem">${mdVault(n.md)}</div>`
        +`<div class="note" style="margin:0">${n.site?'Written for the site in vault format (tools/data/vault-extra). Copy it into the Obsidian vault to keep it there; a vault note with the same name replaces it.':`From the Obsidian vault (imported ${esc(VAULT_DATA.imported||'')}). Where it differs from the website, the website's version applies.`}</div>`};
  },
  prop(x){
    const mats=MATS.filter(m=>m.pn===x.n).sort((a,b)=>(b.pot||0)-(a.pot||0)||(b.rank||0)-(a.rank||0));
    return {title:'✧ '+esc(x.n),ep:esc(x.fam)+' property'+(x.el&&x.el!=='elemental'?' · '+esc(x.el):''),kind:'Property',strip:'var(--gold)',
      badges:`<span class="b acc">${esc(x.fam)}</span><span class="b">${fmt(x.mats)} material${x.mats===1?'':'s'}</span>`,
      body:`<div class="callout"><b>What it does.</b> ${esc(x.t.replace(/\{P1\}/g,'rank + 1').replace(/\{B1\}/g,'half the rank + 1').replace(/\{P2\}/g,'2 × rank').replace(/\{P5\}/g,'5 × rank').replace(/\{P10\}/g,'10 × rank').replace(/\{DC\}/g,'10 + 2 × half the rank').replace(/\{P\}d(\d+)/g,'(rank)d$1').replace(/\{P\}/g,'rank').replace(/\{B\}/g,'half the rank (rounded up)'))}</div>
        <div class="prose" style="margin-top:8px"><b>Potency</b> is how strongly a material carries its property. It runs from <b>1 to 50</b> and follows the material's <b>Item Level</b>: a grade 9 material adds 5 and a grade 10 material adds 10 (the best of a realm outclass the next realm's weakest). <b>Every 5 Potency is one rank</b> (Potency 5 = rank 1, … Potency 50 = rank 10; below 5 it still works at rank 1). The numbers in the property's text come from its rank, and each rank also unlocks the next step in the table below, so a property gets something better every 5 Potency. The same property twice doesn't stack (use the higher Potency); a Forge extra part gives its property at half Potency, and two parts with the same property at the same rank merge into the next rank.</div>
        ${blk('Every 5 Potency','<div class="tablewrap"><table class="t"><thead><tr><th class="num">Potency</th><th class="num">Rank</th><th>What it does at this rank</th><th>New at this step</th></tr></thead><tbody>'+x.steps.map(z=>`<tr><td class="num"><b>${z.pot}</b>${z.pot<50?'–'+(z.pot+4):''}</td><td class="num">${z.rank}</td><td>${esc(z.text)}</td><td style="color:var(--gold2)">${esc(z.add)}</td></tr>`).join('')+'</tbody></table></div><div class="note">Each step keeps every step below it. Potency 1–4 works at rank 1 without the Potency 5 step.</div>')}
        ${mats.length?blk('Materials that carry it',`<div class="chips">${mats.slice(0,40).map(m=>`<button class="chip" data-ref="${ref(m)}"><span class="sw" style="background:${rcol(m.realm)}"></span>${esc(m.n)} <small>Potency ${m.pot||'?'}</small></button>`).join('')}${mats.length>40?`<span class="chip">+${fmt(mats.length-40)} more</span>`:''}</div><div class="note"><a href="#" data-go="materials" data-setup='${esc(JSON.stringify({f:{pn:x.n}}))}'>All ${fmt(mats.length)} materials with ${esc(x.n)} →</a></div>`,'strongest first'):'<div class="note">No material carries it yet; a DM can give it to a custom material or relic.</div>'}`};
  },
  rune(r){
    const f=r.fig,rivals=r.contested?r.gods.map(godKey):[];
    const remains=f.remains&&findMat(f.remains);
    return {title:'ᚱ '+esc(r.n),ep:'Progenitor: '+esc(f.name)+', '+esc(f.title),kind:'Rune · '+esc(r.cat),strip:r.contested?'var(--red)':'',
      badges:`${runeAbove(r)?`<span class="b gold">${esc(runeAbove(r)[0])}</span>`:''}<span class="b acc">${esc(r.cat)}</span>${r.contested?'<span class="b red">Contested</span>':''}${runeHolder(r)?`<span class="b gold">Held by ${esc(runeHolder(r))}</span>`:r.gods.length?'':'<span class="b ghost">Unclaimed</span>'}`,
      body:(runeAbove(r)?`<div class="callout" style="border-color:var(--gold)"><b>Above the gods: ${esc(runeAbove(r)[0])}.</b> ${esc(runeAbove(r)[1])}</div>`:'')+(r.note?`<div class="prose vault" style="font-family:var(--sans);font-size:.92rem">${mdVault(r.note.md)}</div>`:'')
        +(()=>{const ore=MATS.find(m=>m.rune===r.n);return ore?`<div class="callout" style="border-color:var(--acc)">ᚱ <b>Its ore:</b> ${refChip(ore,esc(ore.n),esc(ore.gr))}<div style="margin-top:4px">${esc((ore.rfx||ore.tr||{}).t||'')}</div><div class="note" style="margin:4px 0 0">Mined where this Rune's power pools; set into gear, it gives this effect.</div></div>`:''})()
        +((r.lin&&(r.lin.chain.length>1||r.vprog||r.lin.origin))?`<div class="callout" style="border-color:var(--green)"><b>Lineage, from the vault</b><div class="chips" style="margin-top:6px">${r.lin.chain.map(c=>{const x=RUNE_IDX.get(lc(c.n));return x?refChip(x,'ᚱ '+esc(c.n)):`<span class="chip">${esc(c.n)}</span>`}).join(' <span style="color:var(--muted)">←</span> ')}${r.vprog&&!r.lin.chain.some(c=>lc(c.n)===lc(r.vprog))?` <span style="color:var(--muted)">←</span> ${RUNE_IDX.get(lc(r.vprog))?refChip(RUNE_IDX.get(lc(r.vprog)),esc(r.vprog)):`<span class="chip">${esc(r.vprog)}</span>`}`:''}</div>${r.vprog?`<div style="margin-top:8px"><b>Progenitor:</b> ${esc(r.vprog)}${PROG_STATUS[r.vprog]?' · '+esc(PROG_STATUS[r.vprog]):''}</div>`:''}${r.lin.origin?`<div style="margin-top:8px">${esc(r.lin.origin)}.</div>`:''}</div>`:'')
        +(!f.special&&(r.vprog||(r.note&&r.lin&&r.lin.origin))?'<details class="fold"><summary>Website-generated progenitor (not in the vault)</summary><div>':'')+`<div class="callout" style="border-color:var(--gold)"><b>${!f.special&&(r.vprog||(r.note&&r.lin&&r.lin.origin))?'Suggested progenitor':f.special?'Behind this Rune':'The progenitor'}: ${esc(f.name)}</b>, ${esc(f.title)}<div style="margin-top:6px">${esc(f.form)}</div></div>`
        +kv([['Progenitor\'s fate',`<span style="color:${f.fate==='Killed'?'var(--red)':f.fate==='Vanished'?'var(--blue)':'var(--gold2)'}">${esc(f.fate)}</span>`],[f.fate==='Vanished'?'Last seen':'Where it fell',f.fell&&REALM[f.fell]?`<a href="#" data-ref="${ref(REALM[f.fell])}">${esc(f.fell)}</a>`:esc(f.fell||'')],['Remains',remains?refChip(remains):esc(f.remains||'')],['Symbol',esc(f.symbol)],['Held by now',r.gods.length?r.gods.length+' god'+(r.gods.length>1?'s':''):'No god'],['Relics',r.bps.length||'']])
        +`<div class="lore"><h5>Nature</h5><p>${esc(f.temper)}</p>${f.origin?`<h5>Origin</h5><p>${esc(f.origin)}</p>`:''}<h5>${f.fate==='Never lost'?'Never lost':f.fate==='Vanished'?'How it vanished':'How it fell'}</h5><p>${esc(f.fateText||'')}</p><h5>The gods</h5><p>${r.gods.length?(r.contested?`${esc(rivals.length>2?rivals.slice(0,-1).join(', ')+',':rivals[0])} and ${esc(rivals.slice(-1)[0])} ${rivals.length>2?'all ':'both '}claim ${esc(r.n)}${f.fate==='Never lost'?'':`, the inheritance ${esc(f.name)} left behind,`} and the feud between them never cools.`:f.fate==='Never lost'?`${esc(godKey(r.gods[0]))} draws on ${esc(r.n)}, but only by Infinatas's leave.`:`${esc(godKey(r.gods[0]))} holds ${esc(r.n)} alone, inherited after ${esc(f.name)} ${f.fate==='Vanished'?'vanished':'fell'}.`):`No god holds ${esc(r.n)}. Its power reaches the world only through relics that hold a fragment of it.`}</p></div>`
        +blk('Held by',runeHolder(r)&&!r.gods.length?`<p style="margin:0"><b>${esc(runeHolder(r))}</b> alone. No god can hold it and no contract grants it.</p>`:r.gods.length?`<div class="chips">${r.gods.map(g=>refChip(g,esc(godKey(g)),g.grp.replace(' Pantheon',''))).join('')}</div>`:'')
        +blk('Relics that channel it',r.bps.length?`<div class="chips">${r.bps.slice(0,24).map(b=>refChip(b,esc(b.n),b.cat)).join('')}</div>`:'',r.bps.length?String(r.bps.length):'')
        +(!f.special&&(r.vprog||(r.note&&r.lin&&r.lin.origin))?'</div></details>':'')
        +`<div class="note" style="margin:0">${r.note?'The vault note above comes first; anything below it that isn\'t in the vault is website lore.':f.special?'This progenitor comes from the campaign\'s own lore.':'This progenitor is website lore written for this Rune. To replace it, add progenitor, progenitorTitle, progenitorFate, progenitorFateText, and similar fields to the Rune\'s note in the vault and re-import.'}</div>`};
  },
  realm(r){
    const mats=MATS.filter(m=>m.realm===r.n),mons=MONSTERS.filter(m=>m.realm===r.n).sort((a,b)=>a.g-b.g||byName(a,b)),gods=GODS.filter(g=>g.home===r.n);
    const byG={};mats.forEach(m=>{(byG[m.g]=byG[m.g]||[]).push(m)});
    const grades=Object.keys(byG).sort((a,b)=>a-b).map(g=>`<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--line)"><b style="width:64px;flex-shrink:0;font-size:.8rem;color:var(--muted)">Grade ${g}</b><div class="chips">${byG[g].sort(byName).slice(0,14).map(m=>refChip(m)).join('')}${byG[g].length>14?`<button class="chip" data-go="materials" data-setup='${esc(JSON.stringify({side:r.n,f:{g:g}}))}'>+${byG[g].length-14} more</button>`:''}</div></div>`).join('');
    return {title:esc(r.n),strip:r.color,kind:'Realm · Tier '+r.tier,
      badges:`<span class="b rlm" style="--rc:${r.color}">Tier ${r.tier}</span><span class="b ghost">Pressure ${r.pressure}</span><span class="b ghost">${r.base?'Base price '+gp(r.base):'Not sold'}</span>`,
      body:realmAtlasHTML(r)+(dimsOf(r.n).length?blk(r.n==='Outer Realm'?'Pocket dimensions':'Dimensions',dimsOf(r.n).map(d=>dimCardHTML(d,false)).join(''),dimsOf(r.n).length+' known'):'')+realmMapPhotoHTML(r.n)
        +(()=>{const v=[r.page,r.n+' Realm',r.n].filter(Boolean).map(noteByName).find(Boolean);return v?`<details class="fold" open style="border-top:1px solid var(--line);padding-top:10px"><summary>From the vault <span style="color:var(--muted)">· ${esc(v.f)}/${esc(v.n)}</span></summary><div class="prose vault" style="font-family:var(--sans);font-size:.9rem">${mdVault(v.md)}</div></details>`:''})()
        +kv([['Tier',r.tier],['Material ranks',`${(r.tier-1)*10+1}–${r.tier*10}`],['Item levels',`${Math.ceil(((r.tier-1)*10+1)/2)}–${r.tier*5}`],['Pressure',r.pressure],['Materials',fmt(mats.length)],['Monsters',fmt(mons.length)],['Gods at home',gods.length]])
        +blk('Money',(()=>{const c=CURRENCY[r.n];if(!c)return '';return c.coin?`<div class="callout"><b>${esc(c.coin)}</b> = ${gp(c.gp)}${c.gp>1?' each':''} · ${esc(c.sub)}<div style="margin-top:4px">${esc(c.what)} ${esc(c.note)}</div></div>`:`<div class="callout">${esc(c.note)}</div>`})())
        +blk('Monsters',`<div class="chips">${mons.slice(0,40).map(m=>refChip(m,esc(m.n),'G'+m.g)).join('')}</div>${mons.length>40?`<div style="margin-top:8px"><button class="btn" data-go="bestiary" data-setup='${esc(JSON.stringify({side:r.n}))}'>All ${fmt(mons.length)} in the Bestiary →</button></div>`:''}`,fmt(mons.length))
        +blk('Materials by grade',grades+`<div style="margin-top:10px"><button class="btn" data-go="materials" data-setup='${esc(JSON.stringify({side:r.n}))}'>Browse ${fmt(mats.length)} materials →</button></div>`)
        +blk('Gathering',(()=>{const g=mats.filter(m=>m.where).sort((a,b)=>a.g-b.g||byName(a,b));return g.length?`<div class="mlist">${g.slice(0,30).map(m=>`<button data-ref="${ref(m)}"><span class="sw" style="width:9px;height:9px;border-radius:50%;background:${r.color}"></span>${esc(m.n)} <span class="x">G${m.g} · ${esc(m.where)}${m.by?' · '+esc(m.by):''}</span><span class="r">${m.price?gp(m.price):''}</span></button>`).join('')}</div>`:''})(),'ores, plants, and crystals')
        +blk('Gods who call it home',gods.length?`<div class="chips">${gods.map(g=>refChip(g,esc(godKey(g)))).join('')}</div>`:'')};
  },
};
function entityModal(e,other,label){
  const key=e.n.split(' - ')[0].trim(),p=e.n.split(' - ');
  const twin=other.find(x=>x.n.split(' - ')[0].trim()===key);
  const sibs=TYPES[e._t].arr.filter(x=>x.grp===e.grp&&x!==e);
  return {title:esc(p[0]),ep:esc(p.slice(1).join(' - ')),kind:TYPES[e._t].label+' · '+esc(e.grp),badges:`<span class="b acc">${esc(e.grp)}</span>`,
    body:(e.ds?`<div class="prose">${esc(e.ds)}</div>${e.dsg?SITE_FILL:''}`:`<div class="prose lost">No description yet. See the vault note for ${esc(p[0])}.</div>`)
      +(twin?blk(label,`<div class="chips">${refChip(twin)}</div>`):'')
      +blk('Others in '+esc(e.grp),`<div class="chips">${sibs.slice(0,30).map(x=>refChip(x,esc(x.n.split(' - ')[0]))).join('')}</div>`)};
}
function suggestDrops(m,n){
  const pool=MATS.filter(x=>x.realm===m.realm&&Math.abs((x.g||0)-m.g)<=1&&!x.supply&&/Bone|Blood|Hide|Essence|Creature/.test(x.ty||x.cat));
  pool.sort((a,b)=>hashStr(m.n+a.n)-hashStr(m.n+b.n));
  return pool.slice(0,n);
}

// ════════════════════════════════════════════════════════════════
//  Command palette
// ════════════════════════════════════════════════════════════════
let PSEL=0,PRES=[];
function openPalette(){$('pbg').classList.add('open');$('pq').value='';paletteSearch();setTimeout(()=>$('pq').focus(),10)}
function closePalette(){$('pbg').classList.remove('open')}
$('pbg').addEventListener('mousedown',e=>{if(e.target===$('pbg'))closePalette()});
const PAL_ORDER=[['rune','Runes'],['note','Codex'],['bp','Blueprints'],['mat','Materials'],['mon','Bestiary'],['god','Gods'],['realm','Realms'],['sub','Subclasses'],['demon','Demons'],['patron','Patrons'],['spell','Spells']];
function hl(s,q){const i=lc(s).indexOf(q);return i<0?esc(s):esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+q.length))+'</mark>'+esc(s.slice(i+q.length))}
// Smarter search: filters you can type (type:monster realm:Hell grade:5 lv:10 rarity:rare school:evocation cr:5), actions
// ("roll 2d6+3", "new character", "dark theme"…), recent searches, and a "Did you mean" list when a typo finds nothing.
const PAL_TYPES={monster:'mon',monsters:'mon',mon:'mon',creature:'mon',creatures:'mon',blueprint:'bp',blueprints:'bp',bp:'bp',item:'bp',items:'bp',material:'mat',materials:'mat',mat:'mat',property:'prop',properties:'prop',prop:'prop',god:'god',gods:'god',spell:'spell',spells:'spell',rune:'rune',runes:'rune',realm:'realm',realms:'realm',subclass:'sub',subclasses:'sub',sub:'sub',demon:'demon',demons:'demon',patron:'patron',patrons:'patron',note:'note',notes:'note',codex:'note'};
function palParse(raw){const f={},rest=[];raw.split(/\s+/).forEach(w=>{const m=/^(type|is|realm|grade|g|lv|level|rarity|rar|school|cr):(.+)$/i.exec(w);if(!m){if(w)rest.push(w);return}const k=lc(m[1]),v=lc(m[2]);
    if(k==='type'||k==='is'){if(PAL_TYPES[v])f.type=PAL_TYPES[v]}else if(k==='realm')f.realm=v;else if(k==='grade'||k==='g')f.g=+v;else if(k==='lv'||k==='level')f.lv=+v;else if(k==='rarity'||k==='rar')f.rar=v;else if(k==='school')f.sc=v;else f.cr=v});
  if(Object.keys(f).length&&!f.type&&rest.length&&PAL_TYPES[lc(rest[0])])f.type=PAL_TYPES[lc(rest.shift())];
  return {f,q:lc(rest.join(' ')),has:Object.keys(f).length>0}}
const palGr=x=>x.gr?String(x.gr).split(' '):[];
const palMatch=(x,f)=>(!f.realm||lc(x.realm||x.home||palGr(x)[0]||'').startsWith(f.realm))&&(!f.g||(x.g!=null?x.g:+palGr(x).pop())===f.g)&&(!f.lv||+x.lv===f.lv)&&(!f.rar||lc((x._t==='bp'?x.r:x.rar)||'').startsWith(f.rar))&&(!f.sc||lc(x.sc||'').startsWith(f.sc))&&(!f.cr||String(x.cr)===f.cr);
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const cur=[i];let best=i;for(let j=1;j<=b.length;j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));if(cur[j]<best)best=cur[j]}if(best>max)return max+1;prev=cur}return prev[b.length]}
function palFuzzy(q){const max=q.length>7?2:1,out=[];PAL_ORDER.forEach(([t])=>{for(const x of TYPES[t].arr){const n=lc(x.n);let d=lev(n.slice(0,q.length),q,max);if(d>max)for(const w of n.split(/[^a-z0-9']+/)){if(w.length<3)continue;d=Math.min(d,lev(w,q,max),lev(w.slice(0,q.length),q,max));if(!d)break}if(d<=max)out.push([d,x])}});return out.sort((a,b)=>a[0]-b[0]||a[1].n.length-b[1].n.length).slice(0,8).map(r=>r[1])}
const PAL_ACTIONS=[['🎒 Party stash','stash party pack shared bag treasury group',()=>stashOpen()],['📅 Calendar and downtime','calendar downtime day days week training carousing research festival',()=>calOpen()],['🕰 Session timeline','session timeline what happened today log events history',()=>sessTimeline()],['💰 Loot pool','loot pool treasure split coin hoard chest reward share',()=>lootOpen()],['◆ Browse every trait','trait traits ability abilities feature features racial people peoples',()=>traitBrowse()],['📜 New handout','handout letter note players share',()=>openHandout()],['🎲 Table screen','table screen play big hp fullscreen',()=>openTable()],['✨ Build a new character','new character build make create hero',()=>charWizard()],['🌙 Dark theme','dark theme night',()=>{store.set('theme','dark');applyTheme('dark')}],['☀ Light theme','light theme day bright',()=>{store.set('theme','light');applyTheme('light')}],['⟳ Check for updates','update updates version newest refresh',()=>go('settings')],['❓ Help','help how faq trouble',()=>go('help')],['🧭 Show me around','tour guide welcome around',()=>openGuide(0)],['👤 Sign in','sign in login log account profile',()=>go('account')],['📖 Quick rules','quick rules conditions',()=>openQuick()],['🎲 Something random','random surprise',()=>randomItem(BPS.concat(MATS,MONSTERS,GODS))],['⚔ Combat tracker','combat initiative fight tracker',()=>go('combat')]];
const PAL_DICE=/^(?:roll\s+)?(\d{0,2}d\d+(?:\s*[+\-−]\s*(?:\d{0,2}d\d+|\d+))*)$/i;
function palActions(raw){let h='';const m=PAL_DICE.exec(raw),acts=[];if(m)acts.push(['🎲 Roll '+m[1],()=>rollShow(m[1])]);const q=lc(raw);if(q.length>=3)PAL_ACTIONS.forEach(([l,k,f])=>{if(k.split(' ').some(w=>w.startsWith(q))||k.includes(q))acts.push([l,f])});
  if(acts.length){h+=`<div class="pal-g">Actions</div>`;acts.slice(0,4).forEach(([l,f])=>{PRES.push({run:f,act:1});h+=`<button class="pal-i" data-pi="${PRES.length-1}"><span>${esc(l)}</span><span class="r">action</span></button>`})}return h}
function palFiltered(P){let h='';const types=P.f.type?[[P.f.type,(PAL_ORDER.find(o=>o[0]===P.f.type)||[0,TYPES[P.f.type].label])[1]]]:PAL_ORDER,lim=P.f.type?30:6,lab={realm:'realm',g:'grade',lv:'level',rar:'rarity',sc:'school',cr:'CR',type:'type'};
  h+=`<div class="pal-hint">Filters: ${Object.entries(P.f).map(([k,v])=>`<span class="b ghost">${lab[k]} ${esc(k==='type'?TYPES[v].label:v)}</span>`).join(' ')}${P.q?` · “${esc(P.q)}”`:''}</div>`;let n=0;
  types.forEach(([t,label])=>{const hits=TYPES[t].arr.filter(x=>palMatch(x,P.f)&&(!P.q||lc(x.n).includes(P.q)));if(!hits.length)return;n+=hits.length;h+=`<div class="pal-g">${label} <span class="r">${fmt(hits.length)}</span></div>`;hits.slice(0,lim).forEach(x=>{PRES.push({x});h+=palRow(x,P.q?hl(x.n,P.q):esc(x.n),PRES.length-1)})});
  return n?h:h+`<div class="empty" style="padding:24px">Nothing matches these filters.</div>`}
function palRemember(raw){if(!raw)return;const L=store.get('recentq',[]).filter(x=>x!==raw);L.unshift(raw);store.set('recentq',L.slice(0,8))}
