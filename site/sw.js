// FAND offline worker, written by tools/generators/buildapp.js. Build 252033c740.
const CACHE="fand-252033c740";
const FILES=["index.html","lore.html","codex.html","blueprints.html","materials.html","bestiary.html","realms.html","gods.html","runes.html","professions.html","spells.html","magic.html","classes.html","subclasses.html","demons.html","patrons.html","forge.html","craft.html","party.html","sheet.html","encounter.html","prep.html","hooks.html","journal.html","hidden.html","towers.html","combat.html","rules.html","tools.html","about.html","data/core.js?v=252033c740","data/vault.js?v=252033c740","data/spells.js?v=252033c740","data/vault-details.js?v=252033c740","vendor/anthropic.js","manifest.webmanifest","img/icons/icon-180.png","img/icons/icon-192.png","img/icons/icon-512.png","img/maps/human.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("fand-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  const page=r.mode==="navigate";
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:page}).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&!page)c.put(r,res.clone());return res}).catch(()=>page?c.match("index.html"):Response.error()))))});
