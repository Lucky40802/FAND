// FAND offline worker, written by tools/generators/buildapp.js. Build 43a2808a62.
const CACHE="fand-43a2808a62-a44c728b";
const FILES=["index.html","lore.html","codex.html","blueprints.html","materials.html","properties.html","bestiary.html","realms.html","gods.html","runes.html","professions.html","spells.html","magic.html","classes.html","subclasses.html","demons.html","patrons.html","forge.html","workshop.html","craft.html","party.html","sheet.html","encounter.html","prep.html","hooks.html","journal.html","hidden.html","towers.html","combat.html","rules.html","dice.html","tools.html","about.html","help.html","account.html","settings.html","data/core.js?v=43a2808a62","data/vault.js?v=43a2808a62","data/spells.js?v=43a2808a62","data/vault-details.js?v=43a2808a62","vendor/anthropic.js","vendor/qrcode.js","manifest.webmanifest","img/icons/icon-180.png","img/icons/icon-192.png","img/icons/icon-512.png","vendor/supabase.js","img/maps/human.jpg"];
// Each file is saved on its own, so one file a phone refuses to store (the data is large) cannot stop the update.
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:"reload"})).then(res=>res.ok?c.put(f,res):null).catch(()=>null)))))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("fand-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  // pages and anything unversioned: the network first (always the newest site when online), the saved copy offline;
  // versioned data (?v=build) never changes, so the saved copy is used first
  // "Check for updates" asks the server directly (?fresh=…): never answered or kept by the worker
  if(u.searchParams.has("fresh"))return;
  const page=r.mode==="navigate",fixed=u.searchParams.has("v");
  if(fixed)return e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));
  e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(page?new Request(u.pathname.split("/").pop()||"index.html"):r,cp))}return res}).catch(()=>caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:page}).then(hit=>hit||(page?c.match("index.html"):Response.error())))));
});
