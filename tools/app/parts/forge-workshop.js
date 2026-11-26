// ── Forge: general Blueprints built part by part ───────────────
// Every Blueprint is a general design (an Axe, a Longsword, a Helm). You choose a material for each part, and the
// finished item takes something from every material: the main part sets damage (or AC), the structure sets the
// Accuracy and durability, and every part adds its property and trait. Each part accepts some material
// categories well, some poorly, and the rest are wrong: a wrong main part makes the item useless.
// Material categories (type codes): O metal, W wood/plant, G gem/crystal, S stone, F hide/cloth/fiber,
// B bone/fang/horn/scale, L blood/organ, E essence/core, K mechanism, U supply.
const CAT_NAME={O:'Metal',W:'Wood / Plant',G:'Gem / Crystal',S:'Stone',F:'Hide / Fiber',B:'Bone / Horn / Scale',L:'Blood / Organ',E:'Essence / Core',K:'Mechanism',U:'Supply'};
const HARD=/fang|tooth|tusk|claw|talon|horn|antler|scale|shell|carapace|plate|chitin|bone|spine|beak|mandible|stinger|barb|spike|quill/i;
const STRING=/sinew|silk|string|thread|gut|hair|tendon|strand|web|cord|fiber|fibre|tentacle|vine|rope/i;
const HOLLOW=/reed|bamboo|bone|horn|tube|stalk|cane/i;
// Why a category is wrong for a kind of part, shown with the penalty.
const WHY_WRONG={
  edge:{L:'Blood and organs are soft tissue: they can\'t hold an edge or take a blow.',E:'An essence has no solid form to shape into an edge.',F:'Hide and fiber bend instead of cutting.',W:'Wood won\'t keep a cutting edge.',U:'A supply is used up in crafting, not shaped into a weapon.',K:'A mechanism is a fitting, not a striking surface.',G:'Gems chip and shatter under impact.'},
  blunt:{L:'Soft tissue has no weight or hardness to strike with.',E:'An essence has no mass to swing.',F:'Hide and fiber are too soft to crush anything.',U:'A supply is used up in crafting.',K:'A mechanism would break on the first blow.'},
  shaft:{L:'Organs and blood can\'t bear weight or hold a shape.',E:'An essence can\'t be shaped into a shaft.',F:'Hide and fiber flop; a shaft needs to be rigid.',G:'A gem can\'t be cut long and thin without snapping.',S:'Stone this long snaps under its own weight.',U:'A supply is used up in crafting.',K:'A mechanism is not a shaft.'},
  flex:{L:'Soft tissue has no spring to it.',E:'An essence has no physical spring.',O:'Most metal bends and stays bent; it won\'t spring back like a bow limb.',S:'Stone doesn\'t flex; it breaks.',G:'Gems don\'t flex; they break.',F:'Hide has no stiffness to spring back.',U:'A supply is used up in crafting.',K:'A mechanism is not a limb.'},
  string:{L:'Organs and blood can\'t be drawn into a cord.',E:'An essence can\'t be spun.',O:'Metal wire cuts the hand and doesn\'t stretch.',W:'Wood can\'t be strung.',B:'Bone doesn\'t bend into a string.',S:'Stone can\'t be strung.',G:'A gem can\'t be strung.',U:'A supply is used up in crafting.',K:'A mechanism is not a string.'},
  cover:{L:'Soft tissue rots and stops nothing.',E:'An essence has no substance to stop a blow.',W:'Wood splits when worn as armor.',G:'Gems are too brittle and heavy to wear as plates.',S:'Stone this heavy can\'t be worn.',U:'A supply is used up in crafting.',K:'A mechanism is not armor.'},
  lining:{L:'Organs rot against the skin.',E:'An essence can\'t be sewn.',O:'Metal next to the skin chafes and freezes.',W:'Wood can\'t be worn as padding.',B:'Bone can\'t be worn as padding.',S:'Stone can\'t be worn as padding.',G:'Gems can\'t be worn as padding.',U:'A supply is used up in crafting.',K:'A mechanism is not padding.'},
  focus:{O:'Plain metal doesn\'t hold magic well.',W:'Wood conducts magic only weakly.',F:'Hide and fiber don\'t hold magic.',S:'Stone is dead to magic.',U:'A supply is used up in crafting.',K:'A mechanism doesn\'t hold magic.',B:'Bone conducts magic only weakly.'},
  fit:{L:'Organs rot and can\'t be fitted.',E:'An essence can\'t be fitted.',U:'A supply is used up in crafting.'},
  brew:{O:'Metal won\'t dissolve; at best it poisons the brew.',S:'Stone won\'t dissolve.',G:'A gem won\'t dissolve; grind it as a catalyst instead.',K:'A mechanism doesn\'t belong in a cauldron.',F:'Hide and cloth only soak the brew up.'},
  liquid:{O:'Metal is not a liquid base.',S:'Stone is not a liquid base.',G:'A gem is not a liquid base.',K:'A mechanism is not a liquid base.',F:'Hide and cloth are not a liquid base.',B:'Bone is not a liquid base.'},
};
// Part templates. ok: good categories; weak: workable but poor; ideal: within a good category, names that fit best
// (others in that category count as poor). kind picks the WHY_WRONG reasons.
const P={
  edge:(name,qty,extra)=>Object.assign({name,role:'primary',qty,kind:'edge',ok:['O','B'],weak:['S','G'],ideal:{B:HARD,S:/obsidian|flint|glass/i},why:'Needs a hard edge: metal, or a fang, claw, horn, or bone that holds one. Knapped stone and gems cut but are brittle.'},extra||{}),
  axehead:(qty)=>({name:'Head',role:'primary',qty,kind:'edge',ok:['O','B','S'],weak:['G'],ideal:{B:HARD,S:/obsidian|flint|granite|basalt|stone/i},why:'A hard, heavy edge: metal, knapped stone, or a fang, horn, tusk, or scale.'}),
  blunt:(qty)=>({name:'Head',role:'primary',qty,kind:'blunt',ok:['O','S','B'],weak:['W','G'],ideal:{B:/bone|horn|shell|carapace|skull|knuckle|plate|tusk/i},why:'Something heavy and hard: metal, stone, or dense bone or shell. Hardwood works, but poorly.'}),
  point:(qty)=>({name:'Point',role:'primary',qty,kind:'edge',ok:['O','B','S'],weak:['G'],ideal:{B:HARD,S:/obsidian|flint/i},why:'Metal, a fang, horn, or tusk, or knapped stone.'}),
  haft:(name,qty)=>({name:name||'Haft',role:'structure',qty:qty||1,kind:'shaft',ok:['W','B','O'],ideal:{B:/bone|horn|antler|spine|tusk/i},why:'A long, rigid shaft: wood, bone, or metal.'}),
  hilt:()=>({name:'Hilt and guard',role:'structure',qty:1,kind:'shaft',ok:['O','W','B'],why:'Metal, wood, or bone.'}),
  grip:(name)=>({name:name||'Grip wrap',role:'minor',qty:1,kind:'fit',ok:['F','W'],optional:true,why:'Leather, cord, or wood.'}),
  inlay:(name)=>({name:name||'Inlay',role:'minor',qty:1,kind:'focus',ok:['G','E'],weak:['L'],optional:true,why:'A gem or essence to carry magic. Blood or venom works as a coating.'}),
  limbs:(qty)=>({name:'Limbs',role:'primary',qty,kind:'flex',ok:['W','B'],ideal:{B:/horn|antler|bone|baleen|rib/i},why:'Springy wood, or horn or bone.'}),
  string:()=>({name:'String',role:'structure',qty:1,kind:'string',ok:['F'],ideal:{F:STRING},why:'Sinew, silk, gut, or cord. Hide that isn\'t stringy is a poor fit.'}),
  stock:()=>({name:'Stock',role:'structure',qty:1,kind:'shaft',ok:['W','O','B'],why:'Wood, metal, or bone.'}),
  trigger:()=>({name:'Trigger and lock',role:'minor',qty:1,kind:'fit',ok:['K','O'],why:'A mechanism or metal fittings.'}),
  cover:(qty,ok)=>({name:'Outer layer',role:'primary',qty,kind:'cover',ok:ok||['O','B','F'],ideal:{B:/scale|shell|carapace|plate|chitin|bone|hide/i,F:/hide|pelt|leather|skin|scale|silk|wool|cloth|fur/i},why:'Metal plates, scales or shell, or hide.'}),
  lining:(qty)=>({name:'Lining',role:'structure',qty:qty||1,kind:'lining',ok:['F'],why:'Cloth, leather, fur, or down.'}),
  fittings:()=>({name:'Buckles and fittings',role:'minor',qty:1,kind:'fit',ok:['O','B'],optional:true,why:'Metal or bone.'}),
  ward:()=>({name:'Ward stone',role:'minor',qty:1,kind:'focus',ok:['G','E'],optional:true,why:'A gem or essence.'}),
  heart:(name)=>({name:name||'Focus stone',role:'primary',qty:1,kind:'focus',ok:['G','E'],weak:['L'],ideal:{L:/eye|heart|brain|blood|ichor/i},why:'A gem or essence. A potent organ (an eye, a heart) works, but less reliably.'}),
  shift:()=>({name:'Everchanging core',role:'minor',qty:1,kind:'shift',ok:['E'],only:/everchanging substance/i,optional:true,why:'An Everchanging Substance, left by a creature that changes its shape (a mimic, a doppelganger, a werewolf). Only used when the weapon is made Everchanging.'}),
  setting:(name)=>({name:name||'Setting',role:'structure',qty:1,kind:'shaft',ok:['O','B','W'],why:'Metal, bone, or wood.'}),
};
const pid=n=>n.toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'');
function mk(slots){return slots.map(sl=>Object.assign({id:pid(sl.name)},sl))}
// SRD weapon stats (damage, properties); FAND parts.
// every weapon also has an optional Everchanging core (forgeForms)
const W_=(group,icon,cat,n,dmg,type,props,slots,extra)=>[n,Object.assign({group,icon,cat,dmg:[dmg,type],props,slots:mk(slots.concat(P.shift()))},extra||{})];
const GEN=[
  W_('Simple melee','🏏','Hammer','Club','1d4','bludgeoning','Light',[P.blunt(1),P.grip()]),
  W_('Simple melee','🗡','Dagger','Dagger','1d4','piercing','Finesse, light, thrown (20/60)',[P.edge('Blade',1),Object.assign(P.hilt(),{name:'Grip',ok:['F','W','B','O']}),P.inlay()]),
  W_('Simple melee','🏏','Hammer','Greatclub','1d8','bludgeoning','Two-handed',[P.blunt(2),P.haft('Haft'),P.grip()]),
  W_('Simple melee','🪓','Axe','Handaxe','1d6','slashing','Light, thrown (20/60)',[P.axehead(1),P.haft(),P.grip()]),
  W_('Simple melee','🔱','Spear','Javelin','1d6','piercing','Thrown (30/120)',[P.point(1),P.haft('Shaft'),P.grip('Binding')]),
  W_('Simple melee','🔨','Hammer','Light Hammer','1d4','bludgeoning','Light, thrown (20/60)',[P.blunt(1),P.haft(),P.grip()]),
  W_('Simple melee','🔨','Hammer','Mace','1d6','bludgeoning','',[P.blunt(2),P.haft(),P.grip(),P.inlay('Rune stone')]),
  W_('Simple melee','🪄','Staff','Quarterstaff','1d6','bludgeoning','Versatile (1d8)',[Object.assign(P.haft('Staff',2),{role:'primary',kind:'shaft',weak:['O']}),Object.assign(P.fittings(),{name:'End caps'}),P.inlay()]),
  W_('Simple melee','🗡','Dagger','Sickle','1d4','slashing','Light',[P.edge('Blade',1),P.haft('Handle'),P.grip()]),
  W_('Simple melee','🔱','Spear','Spear','1d6','piercing','Thrown (20/60), versatile (1d8)',[P.point(1),P.haft('Shaft',2),P.grip('Binding')]),
  W_('Simple ranged','🏹','Bow','Light Crossbow','1d8','piercing','Ammunition (80/320), loading, two-handed',[P.limbs(1),P.string(),P.stock(),P.trigger()],{ranged:'80/320 ft.'}),
  W_('Simple ranged','🎯','Dagger','Dart','1d4','piercing','Finesse, thrown (20/60)',[P.point(1),Object.assign(P.grip('Flight'),{ok:['F','B'],why:'Feathers, hide, or thin bone.'})],{ranged:'20/60 ft.'}),
  W_('Simple ranged','🏹','Bow','Shortbow','1d6','piercing','Ammunition (80/320), two-handed',[P.limbs(2),P.string(),P.grip()],{ranged:'80/320 ft.'}),
  W_('Simple ranged','🪨','Bow','Sling','1d4','bludgeoning','Ammunition (30/120)',[Object.assign(P.lining(1),{name:'Pouch',role:'primary',kind:'string',ideal:{F:/hide|leather|skin|pelt/i},why:'A pouch of hide or leather.'}),Object.assign(P.string(),{name:'Cords'})],{ranged:'30/120 ft.'}),
  W_('Martial melee','🪓','Axe','Battleaxe','1d8','slashing','Versatile (1d10)',[P.axehead(2),P.haft(),P.grip(),P.inlay()]),
  W_('Martial melee','⛓','Hammer','Flail','1d8','bludgeoning','',[P.blunt(2),Object.assign(P.haft('Chain'),{ok:['O'],weak:['F'],kind:'shaft',why:'Metal chain. Rope or sinew works, but snaps.'}),P.haft('Handle')]),
  W_('Martial melee','🔱','Spear','Glaive','1d10','slashing','Heavy, reach, two-handed',[P.edge('Blade',2),P.haft('Pole',2),P.grip()]),
  W_('Martial melee','🪓','Axe','Greataxe','1d12','slashing','Heavy, two-handed',[P.axehead(3),P.haft('Haft',2),P.grip(),P.inlay()]),
  W_('Martial melee','⚔','Sword','Greatsword','2d6','slashing','Heavy, two-handed',[P.edge('Blade',4),P.hilt(),P.grip(),P.inlay('Pommel stone')]),
  W_('Martial melee','🔱','Spear','Halberd','1d10','slashing','Heavy, reach, two-handed',[P.axehead(2),P.haft('Pole',2),P.grip()]),
  W_('Martial melee','🔱','Spear','Lance','1d12','piercing','Reach, special (mounted)',[P.point(2),P.haft('Shaft',3),Object.assign(P.fittings(),{name:'Vamplate (hand guard)'})]),
  W_('Martial melee','⚔','Sword','Longsword','1d8','slashing','Versatile (1d10)',[P.edge('Blade',3),P.hilt(),P.grip(),P.inlay('Pommel stone')]),
  W_('Martial melee','🔨','Hammer','Maul','2d6','bludgeoning','Heavy, two-handed',[P.blunt(4),P.haft('Haft',2),P.grip()]),
  W_('Martial melee','🔨','Hammer','Morningstar','1d8','piercing','',[P.blunt(2),Object.assign(P.point(1),{name:'Spikes',role:'minor',optional:true}),P.haft(),P.grip()]),
  W_('Martial melee','🔱','Spear','Pike','1d10','piercing','Heavy, reach, two-handed',[P.point(1),P.haft('Pole',3),P.grip('Binding')]),
  W_('Martial melee','⚔','Sword','Rapier','1d8','piercing','Finesse',[Object.assign(P.edge('Blade',2),{ok:['O'],weak:['B','G'],why:'A thin, springy blade: metal. Bone or a long fang works, but snaps more easily.'}),P.hilt(),P.grip(),P.inlay('Pommel stone')]),
  W_('Martial melee','⚔','Sword','Scimitar','1d6','slashing','Finesse, light',[P.edge('Blade',2),P.hilt(),P.grip()]),
  W_('Martial melee','⚔','Sword','Shortsword','1d6','piercing','Finesse, light',[P.edge('Blade',2),P.hilt(),P.grip(),P.inlay('Pommel stone')]),
  W_('Martial melee','🔱','Spear','Trident','1d6','piercing','Thrown (20/60), versatile (1d8)',[P.point(2),P.haft('Shaft',2),P.grip('Binding')]),
  W_('Martial melee','⛏','Hammer','War Pick','1d8','piercing','',[P.point(2),P.haft(),P.grip()]),
  W_('Martial melee','🔨','Hammer','Warhammer','1d8','bludgeoning','Versatile (1d10)',[P.blunt(2),P.haft(),P.grip(),P.inlay('Rune stone')]),
  W_('Martial melee','➰','Sword','Whip','1d4','slashing','Finesse, reach',[{name:'Lash',role:'primary',qty:2,kind:'string',ok:['F'],ideal:{F:/hide|leather|sinew|tentacle|tail|gut|hair|cord|rope|strand/i},why:'A long braid of hide, sinew, or cord.'},P.haft('Handle'),Object.assign(P.point(1),{name:'Tip',role:'minor',optional:true,why:'A metal or bone barb.'})]),
  W_('Martial ranged','🎋','Bow','Blowgun','1','piercing','Ammunition (25/100), loading',[{name:'Tube',role:'primary',qty:1,kind:'shaft',ok:['W','B','O'],ideal:{W:HOLLOW,B:HOLLOW},why:'A straight hollow tube: reed, bamboo, bone, or metal.'},Object.assign(P.fittings(),{name:'Mouthpiece'})],{ranged:'25/100 ft.'}),
  W_('Martial ranged','🏹','Bow','Hand Crossbow','1d6','piercing','Ammunition (30/120), light, loading',[P.limbs(1),P.string(),P.stock(),P.trigger()],{ranged:'30/120 ft.'}),
  W_('Martial ranged','🏹','Bow','Heavy Crossbow','1d10','piercing','Ammunition (100/400), heavy, loading, two-handed',[Object.assign(P.limbs(2),{ok:['W','B','O'],why:'Springy wood, horn, or a steel prod.'}),P.string(),P.stock(),P.trigger()],{ranged:'100/400 ft.'}),
  W_('Martial ranged','🏹','Bow','Longbow','1d8','piercing','Ammunition (150/600), heavy, two-handed',[P.limbs(3),P.string(),P.grip(),P.inlay('Arrow-rest inlay')],{ranged:'150/600 ft.'}),
  ['Net',{group:'Martial ranged',icon:'🕸',cat:'Artifact',props:'Thrown (5/15); a Large or smaller creature hit is restrained (escape DC 10)',slots:mk([{name:'Mesh',role:'primary',qty:2,kind:'string',ok:['F'],ideal:{F:STRING},why:'Cord, sinew, silk, or web.'},Object.assign(P.fittings(),{name:'Weights',ok:['O','S','B']})])}],
  // armor pieces, one per slot
  ...[['Helm','Head','⛑',2],['Cuirass','Body','🛡',4],['Gauntlets','Hands','🧤',1],['Boots','Feet','🥾',1],['Pauldrons','Shoulders','🛡',1]].map(([n,slot,icon,q])=>[n,{group:'Armor',icon,cat:'Armor',armor:true,slot,slots:mk([P.cover(q),P.lining(q>2?2:1),P.fittings(),P.ward()])}]),
  ['Cloak',{group:'Armor',icon:'🧥',cat:'Armor',armor:true,slot:'Back',slots:mk([P.cover(2,['F','B']),Object.assign(P.fittings(),{name:'Clasp',ok:['O','B','G']}),P.ward()])}],
  ['Barding',{group:'Armor',icon:'🐎',cat:'Armor',armor:true,slot:'Mount',slots:mk([P.cover(4),P.lining(2),P.fittings()])}],
  ...[['Buckler',1],['Shield',3],['Tower Shield',5]].map(([n,q])=>[n,{group:'Shields',icon:'🛡',cat:'Shield',shield:true,kind:n==='Tower Shield'?'Tower':n,slots:mk([Object.assign(P.cover(q,['O','W','B']),{name:'Face',ideal:{B:/scale|shell|carapace|plate|bone|hide/i},why:'Metal, wood, or a broad scale or shell.'}),Object.assign(P.haft('Frame'),{why:'Wood, metal, or bone.'}),Object.assign(P.grip('Straps'),{ok:['F']}),Object.assign(P.inlay('Boss'),{ok:['O','G','E']})])}]),
  // spellcasting focuses
  ['Staff',{group:'Focuses',icon:'🪄',cat:'Staff',focus:true,dmg:['1d6','bludgeoning'],props:'Versatile (1d8); spellcasting focus',slots:mk([P.heart('Focus crown'),Object.assign(P.haft('Shaft',2),{ok:['W','B'],weak:['O']}),Object.assign(P.fittings(),{name:'Bands'}),P.grip('Wrap')])}],
  ['Wand',{group:'Focuses',icon:'🪄',cat:'Artifact',focus:true,props:'Spellcasting focus',slots:mk([P.heart('Core'),Object.assign(P.haft('Body'),{ok:['W','B'],weak:['O','G']})])}],
  ['Orb',{group:'Focuses',icon:'🔮',cat:'Artifact',focus:true,props:'Spellcasting focus',slots:mk([Object.assign(P.heart('Orb'),{qty:2}),P.setting('Cradle')])}],
  ['Amulet',{group:'Focuses',icon:'📿',cat:'Artifact',focus:true,props:'Spellcasting focus; worn',slots:mk([P.heart('Heart stone'),P.setting(),Object.assign(P.grip('Chain or cord'),{ok:['O','F']})])}],
  ['Ring',{group:'Focuses',icon:'💍',cat:'Artifact',focus:true,props:'Worn; spellcasting focus',slots:mk([Object.assign(P.setting('Band'),{role:'primary',kind:'fit',ok:['O','B'],weak:['W','G']}),P.heart('Stone')])}],
];
// Alchemy: potions and the like, built the same way. The main reagent's alchemy effect is the brew's effect.
const P_REAGENT=(name,ok)=>({id:'reagent',name:name||'Main reagent',role:'primary',qty:2,kind:'brew',ok:ok||['L','E','W'],weak:['B','U'],why:'The heart of the brew: an organ, blood, venom, an essence, or a herb. Its alchemy effect becomes the brew\'s.'});
const P_BASE=()=>({id:'base',name:'Base liquid',role:'structure',qty:1,kind:'liquid',ok:['L','W','U'],weak:['E'],ideal:{W:/sap|dew|water|milk|honey|nectar|oil|juice|wine|tea/i,L:/blood|ichor|bile|milk|honey|venom/i},why:'What it all dissolves in: water, sap, honey, blood, or oil. A better base makes it last longer.'});
const P_CAT=()=>({id:'catalyst',name:'Catalyst',role:'minor',qty:1,kind:'brew',ok:['G','E','O'],weak:['S'],optional:true,why:'A ground gem, an essence, or a pinch of quicksilver: adds its own effect at half strength.'});
const P_STAB=()=>({id:'stabilizer',name:'Stabilizer',role:'minor',qty:1,kind:'brew',ok:['U','S','W'],optional:true,why:'Salt, ash, or a binding root to keep it from spoiling: doubles its shelf life.'});
GEN.push(
  ['Healing Potion',{group:'Alchemy',icon:'🧪',cat:'Potion',potion:'drink',props:'Drink as an action',slots:[P_REAGENT(),P_BASE(),P_CAT(),P_STAB()]}],
  ['Elixir',{group:'Alchemy',icon:'⚗',cat:'Potion',potion:'drink',props:'Drink as an action; lasts longer',slots:[P_REAGENT(),P_BASE(),P_CAT(),P_STAB()]}],
  ['Poison',{group:'Alchemy',icon:'☠',cat:'Potion',potion:'poison',props:'Ingested or injected; Constitution save',slots:[P_REAGENT('Venom or toxin',['L','W','E']),P_BASE(),P_CAT(),P_STAB()]}],
  ['Weapon Oil',{group:'Alchemy',icon:'🗡',cat:'Potion',potion:'coat',props:'Coat a weapon as a bonus action; lasts for 3 hits',slots:[P_REAGENT(),Object.assign(P_BASE(),{ideal:{W:/oil|sap|resin|wax/i,L:/fat|oil|ichor|venom/i}}),P_CAT(),P_STAB()]}],
  ['Bomb',{group:'Alchemy',icon:'💣',cat:'Potion',potion:'bomb',props:'Thrown 20/60 ft.; 10 ft. radius; Dexterity save for half',slots:[P_REAGENT('Volatile reagent',['E','L','W']),Object.assign(P_BASE(),{name:'Shell',ok:['S','G','O','W'],weak:['B'],kind:'fit',why:'A clay, glass, or metal shell to throw it in.'}),P_CAT(),P_STAB()]}],
  ['Salve',{group:'Alchemy',icon:'🫙',cat:'Potion',potion:'salve',props:'Applied over a minute',slots:[P_REAGENT(),Object.assign(P_BASE(),{ok:['L','W','U'],ideal:{W:/wax|oil|sap|resin|moss/i,L:/fat|tallow|oil/i},why:'Fat, wax, or oil to carry it into the skin.'}),P_CAT(),P_STAB()]}]
);
GEN.forEach(([,b])=>{if(b.group==='Alchemy')b.slots.forEach(sl=>{sl.id=sl.id||pid(sl.name)})});
// A material's alchemy effect: written for gathered herbs and fauna; for other organic parts it comes from the
// creature's unique trait (what the part does when worn, it does for a while when drunk).
const ORGANIC=['L','E','W','B','F'];
function alchOf(m){if(!m)return '';if(m.alch)return m.alch;const c=matCode(m);if(!ORGANIC.includes(c))return '';
  const t=m.tr?m.tr.t:m.prop?m.prop.replace(/^[^:]+:\s*/,''):'';if(!t)return '';const dur=(m.g||1)>=7?'8 hours':(m.g||1)>=4?'1 hour':'10 minutes';
  return 'Drink: for '+dur+', '+t.replace(/^While equipped,?\s*/i,'').replace(/^A weapon (coated )?with this material/i,'your weapon attacks').replace(/^Armor with this material/i,'your body').replace(/,?\s*while (wearing|carrying|holding) (this|it)\b/gi,'').replace(/\s+while equipped\b/gi,'').replace(/^\w/,x=>x.toLowerCase())}
// More general Blueprints (campaign owner's request: as many as the Forge can hold). Each is built from the parts of its
// nearest relative above, with SRD-style damage and properties; tools that double as weapons come first (the Shovel).
const S_BLADE=(q,o)=>[P.edge('Blade',q,o),P.hilt(),P.grip(),P.inlay('Pommel stone')];
const S_KNIFE=(q,o)=>[P.edge('Blade',q||1,o),Object.assign(P.hilt(),{name:'Grip',ok:['F','W','B','O']}),P.inlay()];
const S_AXE=(q,h)=>[P.axehead(q),P.haft('Haft',h||1),P.grip(),P.inlay()];
const S_BLUNT=(q,h,n)=>[Object.assign(P.blunt(q),n?{name:n}:{}),P.haft('Haft',h||1),P.grip()];
const S_POLE=(head,h)=>[head,P.haft('Pole',h||2),P.grip()];
const S_POINT=(q,n,h)=>[Object.assign(P.point(q),n?{name:n}:{}),P.haft('Shaft',h||1),P.grip('Binding')];
const S_BOW=(q,o)=>[Object.assign(P.limbs(q),o||{}),P.string(),P.grip(),P.inlay('Arrow-rest inlay')];
const S_XBOW=(q)=>[P.limbs(q),P.string(),P.stock(),P.trigger()];
const S_CHAIN=(head)=>[head,Object.assign(P.haft('Chain'),{ok:['O'],weak:['F'],why:'Metal chain. Rope or sinew works, but snaps.'}),P.grip()];
const S_FIST=(head)=>[head,Object.assign(P.lining(1),{name:'Wrap',role:'structure',why:'Leather or cloth that holds it to the hand.'}),P.inlay()];
const SPADE={name:'Spade blade',role:'primary',qty:2,kind:'blunt',ok:['O','W','B'],weak:['S'],ideal:{B:/shoulder|blade|scapula|shell|plate|scale/i},why:'A broad, flat blade: metal, hardwood, or a flat bone like a shoulder blade. Stone is heavy and chips.'};
const AR=(n,slot,icon,q,ok,o)=>[n,Object.assign({group:'Armor',icon,cat:'Armor',armor:true,slot,slots:mk([P.cover(q,ok),P.lining(q>2?2:1),P.fittings(),P.ward()])},o||{})];
const SH=(n,kind,q,o)=>[n,Object.assign({group:'Shields',icon:'🛡',cat:'Shield',shield:true,kind,slots:mk([Object.assign(P.cover(q,['O','W','B']),{name:'Face',ideal:{B:/scale|shell|carapace|plate|bone|hide/i},why:'Metal, wood, or a broad scale or shell.'}),Object.assign(P.haft('Frame'),{why:'Wood, metal, or bone.'}),Object.assign(P.grip('Straps'),{ok:['F']}),Object.assign(P.inlay('Boss'),{ok:['O','G','E']})])},o||{})];
const FOC=(n,icon,cat,props,slots,o)=>[n,Object.assign({group:'Focuses',icon,cat,focus:true,props,slots:mk(slots)},o||{})];
GEN.push(
  // tools that are weapons too
  W_('Tools and farm weapons','⛏','Hammer','Shovel','1d8','bludgeoning','Also digs (a trench, a grave, or loose earth in a tenth of the time by hand)',[SPADE,P.haft('Handle',2),P.grip()]),
  W_('Tools and farm weapons','⛏','Hammer','Pickaxe','1d8','piercing','Two-handed; also digs ore, gems, and stone from a vein',[Object.assign(P.point(2),{name:'Head'}),P.haft('Haft',2),P.grip()]),
  W_('Tools and farm weapons','🔨','Hammer','Sledgehammer','1d10','bludgeoning','Heavy, two-handed; double damage to objects and structures',S_BLUNT(3,2)),
  W_('Tools and farm weapons','🔱','Spear','Pitchfork','1d6','piercing','Versatile (1d8)',S_POINT(2,'Tines',2)),
  W_('Tools and farm weapons','🌾','Spear','Scythe','1d8','slashing','Heavy, two-handed',[P.edge('Blade',2),P.haft('Snath',2),P.grip()]),
  W_('Tools and farm weapons','🪓','Axe','Felling Axe','1d10','slashing','Heavy, two-handed; double damage to wood',S_AXE(2,2)),
  W_('Tools and farm weapons','🔪','Dagger','Cleaver','1d6','slashing','Light',[P.edge('Blade',1),P.grip('Handle')]),
  W_('Tools and farm weapons','🔪','Sword','Machete','1d6','slashing','Light; cuts through brush at full speed',[P.edge('Blade',2),P.grip('Handle'),P.inlay()]),
  W_('Tools and farm weapons','🔧','Hammer','Crowbar','1d6','bludgeoning','Advantage on Strength checks to force things open',[Object.assign(P.blunt(1),{name:'Bar',ok:['O'],weak:['B','W'],why:'A bar of metal. Bone or hardwood bends.'})]),
  W_('Tools and farm weapons','🍳','Hammer','Frying Pan','1d4','bludgeoning','Light; also cooks',[Object.assign(P.blunt(1),{name:'Pan',ok:['O','S'],weak:['B'],why:'Metal or stone that takes heat.'}),P.grip('Handle')]),
  W_('Tools and farm weapons','🔱','Spear','Harpoon','1d8','piercing','Thrown (20/60); a creature hit can be pulled 10 feet toward you',[Object.assign(P.point(1),{name:'Barbed head'}),P.haft('Shaft',2),Object.assign(P.string(),{name:'Line'})],{ranged:'20/60 ft.'}),
  // swords
  W_('Martial melee','⚔','Sword','Katana','1d8','slashing','Finesse, versatile (1d10)',S_BLADE(3,{ok:['O'],weak:['B','G'],why:'Folded metal that holds a fine edge. Bone or a long fang works, but chips.'})),
  W_('Martial melee','⚔','Sword','Wakizashi','1d6','slashing','Finesse, light',S_BLADE(2)),
  W_('Martial melee','🗡','Dagger','Tanto','1d4','piercing','Finesse, light, thrown (20/60)',S_KNIFE(1)),
  W_('Martial melee','⚔','Sword','Odachi','2d6','slashing','Heavy, reach, two-handed',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Claymore','2d6','slashing','Heavy, two-handed',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Zweihander','2d6','slashing','Heavy, reach, two-handed',S_BLADE(5)),
  W_('Martial melee','⚔','Sword','Flamberge','2d6','slashing','Heavy, two-handed; a hit leaves a bleeding wound (1 damage at the start of each of its turns until healed)',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Bastard Sword','1d10','slashing','Versatile (1d12)',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Broadsword','1d8','slashing','Versatile (1d10)',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Falchion','2d4','slashing','',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Sabre','1d8','slashing','Finesse',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Cutlass','1d6','slashing','Finesse, light',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Khopesh','1d8','slashing','Versatile (1d10); can hook a shield or weapon aside',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Gladius','1d6','piercing','Light',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Estoc','1d10','piercing','Two-handed; ignores 1 AC from armor',S_BLADE(3,{ok:['O'],weak:['B'],why:'A stiff, narrow blade: metal.'})),
  W_('Martial melee','⚔','Sword','Jian','1d8','slashing','Finesse, versatile (1d10)',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Dao','1d8','slashing','Versatile (1d10)',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Shotel','1d6','slashing','Finesse; reaches around a shield (ignores its AC)',S_BLADE(2)),
  W_('Martial melee','🔪','Dagger','Kukri','1d6','slashing','Finesse, light',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Main-gauche','1d4','piercing','Finesse, light; +1 AC while held in the off hand',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Stiletto','1d4','piercing','Finesse, light; ignores 1 AC from armor',S_KNIFE(1,{ok:['O','B']})),
  W_('Martial melee','🗡','Dagger','Throwing Knife','1d4','piercing','Finesse, light, thrown (30/90)',S_KNIFE(1),{ranged:'30/90 ft.'}),
  // axes and polearms
  W_('Martial melee','🪓','Axe','Bardiche','1d10','slashing','Heavy, reach, two-handed',S_POLE(P.axehead(2))),
  W_('Martial melee','🪓','Axe','Double Axe','1d10','slashing','Heavy, two-handed',S_AXE(4,2)),
  W_('Martial melee','🪓','Axe','Tomahawk','1d6','slashing','Light, thrown (30/120)',S_AXE(1),{ranged:'30/120 ft.'}),
  W_('Martial melee','🔱','Spear','Naginata','1d10','slashing','Heavy, reach, two-handed',S_POLE(P.edge('Blade',2))),
  W_('Martial melee','🔱','Spear','Guandao','1d10','slashing','Heavy, reach, two-handed',S_POLE(P.edge('Blade',3))),
  W_('Martial melee','🔱','Spear','Partisan','1d10','piercing','Heavy, reach, two-handed',S_POLE(P.point(2))),
  W_('Martial melee','🔱','Spear','Billhook','1d10','slashing','Heavy, reach, two-handed; can pull a rider from a mount (Strength contest)',S_POLE(P.edge('Hook blade',2))),
  W_('Martial melee','🔨','Hammer','Lucerne Hammer','1d10','piercing','Heavy, reach, two-handed',S_POLE(P.blunt(2))),
  W_('Martial melee','🌾','Spear','War Scythe','2d4','slashing','Heavy, reach, two-handed',S_POLE(P.edge('Blade',2))),
  W_('Martial melee','🔱','Spear','Hooked Spear','1d6','piercing','Reach, two-handed; can trip (Strength contest)',S_POINT(1,'Hooked point',2)),
  // blunt, chain, and fist weapons
  W_('Martial melee','🔨','Hammer','Kanabo','2d6','bludgeoning','Heavy, two-handed',S_BLUNT(4,2,'Studded head')),
  W_('Martial melee','🏏','Hammer','Spiked Club','1d6','piercing','',S_BLUNT(1,1,'Spiked head')),
  W_('Martial melee','🏏','Sword','Macuahuitl','1d8','slashing','Versatile (1d10)',[Object.assign(P.edge('Obsidian edges',2),{ok:['S','O','B'],weak:['G'],ideal:{S:/obsidian|flint|glass/i},why:'Rows of knapped obsidian or flint, metal, or teeth set into the club.'}),Object.assign(P.haft('Club body',2),{role:'structure'}),P.grip()]),
  W_('Martial melee','⛓','Hammer','Nunchaku','1d6','bludgeoning','Finesse, light',[Object.assign(P.blunt(2),{name:'Sticks',ok:['W','B','O']}),Object.assign(P.haft('Chain'),{ok:['O','F'],why:'A short chain or cord.'})]),
  W_('Martial melee','🏏','Hammer','Tonfa','1d4','bludgeoning','Light; +1 AC while you hold one in each hand',[Object.assign(P.blunt(1),{name:'Body',ok:['W','O','B']}),P.grip('Handle')]),
  W_('Martial melee','👊','Hammer','Knuckledusters','1d4','bludgeoning','Light; counts as an unarmed strike for your features',S_FIST(Object.assign(P.blunt(1),{name:'Knuckles'}))),
  W_('Martial melee','👊','Dagger','Katar','1d6','piercing','Finesse, light',S_FIST(P.edge('Blade',1))),
  W_('Martial melee','🐾','Dagger','Tiger Claws','1d4','slashing','Finesse, light; counts as an unarmed strike for your features',S_FIST(Object.assign(P.edge('Claws',1),{ideal:{B:/claw|talon|fang|tooth/i}}))),
  W_('Martial melee','🗡','Dagger','Sai','1d4','piercing','Finesse, light; advantage on checks to disarm',S_KNIFE(1,{name:'Prongs'})),
  W_('Martial melee','⛓','Hammer','Meteor Hammer','1d6','bludgeoning','Finesse, reach',S_CHAIN(P.blunt(1))),
  W_('Martial melee','⛓','Dagger','Kusarigama','1d6','slashing','Finesse, reach',S_CHAIN(P.edge('Sickle blade',1))),
  W_('Martial melee','⛓','Sword','Chain Whip','1d4','slashing','Finesse, reach',S_CHAIN(Object.assign(P.edge('Blades',1),{role:'primary'}))),
  W_('Martial melee','➰','Dagger','Rope Dart','1d4','piercing','Finesse, reach, thrown (15/30)',[P.point(1),Object.assign(P.string(),{name:'Rope'})],{ranged:'15/30 ft.'}),
  // ranged
  W_('Martial ranged','🏹','Bow','Composite Bow','1d8','piercing','Ammunition (100/400), two-handed',S_BOW(2,{ok:['W','B'],ideal:{B:/horn|antler|bone|sinew/i},why:'Wood backed with horn and sinew.'}),{ranged:'100/400 ft.'}),
  W_('Martial ranged','🏹','Bow','Recurve Bow','1d8','piercing','Ammunition (80/320), two-handed',S_BOW(2),{ranged:'80/320 ft.'}),
  W_('Martial ranged','🏹','Bow','Greatbow','1d10','piercing','Ammunition (150/600), heavy, two-handed',S_BOW(4),{ranged:'150/600 ft.'}),
  W_('Martial ranged','🏹','Bow','Repeating Crossbow','1d6','piercing','Ammunition (60/240), two-handed; holds 10 bolts and needs no loading',S_XBOW(1),{ranged:'60/240 ft.'}),
  W_('Simple ranged','🪨','Bow','Slingshot','1d4','bludgeoning','Ammunition (30/120)',[Object.assign(P.limbs(1),{name:'Fork',why:'A forked stick or bone.'}),Object.assign(P.string(),{name:'Band'})],{ranged:'30/120 ft.'}),
  W_('Simple ranged','🪨','Bow','Staff Sling','1d6','bludgeoning','Ammunition (60/240), two-handed',[Object.assign(P.lining(1),{name:'Pouch',role:'primary',kind:'string',why:'A pouch of hide or leather.'}),P.haft('Staff',2),Object.assign(P.string(),{name:'Cords'})],{ranged:'60/240 ft.'}),
  W_('Simple ranged','🎯','Spear','Atlatl','1d6','piercing','Thrown (60/240); throws darts and javelins farther',[Object.assign(P.haft('Thrower'),{role:'primary'}),P.point(1)],{ranged:'60/240 ft.'}),
  W_('Simple ranged','🪃','Hammer','Boomerang','1d4','bludgeoning','Thrown (60/120); returns to your hand on a miss',[Object.assign(P.blunt(1),{name:'Body',ok:['W','B','O']})],{ranged:'60/120 ft.'}),
  W_('Martial ranged','⭕','Dagger','Chakram','1d6','slashing','Finesse, thrown (30/90)',[P.edge('Ring blade',1),P.grip('Wrap')],{ranged:'30/90 ft.'}),
  W_('Martial ranged','✴','Dagger','Shuriken','1d4','slashing','Finesse, thrown (20/60)',[P.edge('Star',1)],{ranged:'20/60 ft.'}),
  W_('Martial ranged','🪢','Dagger','Bolas','1','bludgeoning','Thrown (20/60); a Large or smaller creature hit must succeed on a DC 10 Strength save or be knocked prone and restrained',[Object.assign(P.blunt(1),{name:'Weights',ok:['O','S','B']}),Object.assign(P.string(),{name:'Cords'})],{ranged:'20/60 ft.'}),
  // armor
  AR('Breastplate','Body','🛡',4,['O','B']),AR('Hauberk','Body','🛡',4,['O']),AR('Brigandine','Body','🛡',4,['O','F']),AR('Scale Coat','Body','🛡',4,['B','O']),AR('Lamellar','Body','🛡',4,['O','B','F']),AR('Plate Harness','Body','🛡',4,['O']),
  AR('Gambeson','Body','🧥',4,['F']),AR('Robe','Body','🥋',4,['F']),AR('Hide Coat','Body','🧥',4,['F','B']),
  AR('Coif','Head','⛑',2,['O','F']),AR('Hood','Head','🧢',2,['F']),AR('Mask','Head','🎭',2,['O','B','W']),AR('Circlet','Head','👑',2,['O','B','G']),
  AR('Bracers','Hands','🧤',1,['O','B','F']),AR('Gloves','Hands','🧤',1,['F']),AR('Greaves','Feet','🥾',1,['O','B']),AR('Sandals','Feet','🩴',1,['F','W']),
  AR('Spaulders','Shoulders','🛡',1,['O','B']),AR('Mantle','Back','🧥',1,['O','B','F']),AR('Cape','Back','🧥',1,['F']),
  // shields
  SH('Targe','Buckler',1),SH('Round Shield','Shield',3),SH('Kite Shield','Shield',3),SH('Heater Shield','Shield',3),SH('Pavise','Tower',5),
  // spellcasting focuses and bardic instruments
  FOC('Rod','🪄','Artifact','Spellcasting focus',[P.heart('Core'),Object.assign(P.haft('Rod'),{ok:['O','B','W']})]),
  FOC('Scepter','🪄','Artifact','Spellcasting focus; a mace in a pinch (1d6 bludgeoning)',[P.heart('Crown stone'),Object.assign(P.haft('Shaft'),{ok:['O','B','W']}),Object.assign(P.fittings(),{name:'Bands'})]),
  FOC('Tome','📖','Artifact','Spellcasting focus; holds written spells',[Object.assign(P.heart('Binding sigil'),{qty:1}),Object.assign(P.lining(2),{name:'Pages and cover',role:'structure'}),Object.assign(P.fittings(),{name:'Clasp'})]),
  FOC('Totem','🗿','Artifact','Spellcasting focus (druid or shaman)',[P.heart('Spirit stone'),Object.assign(P.setting('Carving'),{ok:['W','B','S']})]),
  FOC('Holy Symbol','✝','Artifact','Spellcasting focus (cleric or paladin); worn or held',[P.heart('Blessed stone'),P.setting('Emblem'),Object.assign(P.grip('Chain or cord'),{ok:['O','F']})]),
  FOC('Crystal','💎','Artifact','Spellcasting focus',[Object.assign(P.heart('Crystal'),{qty:2,ok:['G'],weak:['E']}),P.setting('Cradle')]),
  FOC('Lute','🪕','Instrument','Bardic spellcasting focus; two-handed when played',[Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'}),Object.assign(P.haft('Body and neck',2),{role:'primary',ok:['W','B'],why:'Seasoned wood or bone that rings.'}),Object.assign(P.string(),{name:'Strings'})]),
  FOC('Flute','🎶','Instrument','Bardic spellcasting focus; two-handed when played',[{name:'Tube',role:'primary',qty:1,kind:'shaft',ok:['W','B','O'],ideal:{W:HOLLOW,B:HOLLOW},why:'A hollow tube: reed, bamboo, bone, or metal.'},Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Drum','🥁','Instrument','Bardic spellcasting focus; heard 300 feet away',[Object.assign(P.cover(1,['F']),{name:'Drumhead'}),Object.assign(P.haft('Shell'),{role:'structure',ok:['W','B','O']}),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Harp','🎼','Instrument','Bardic spellcasting focus; two-handed when played',[Object.assign(P.haft('Frame',2),{role:'primary',ok:['W','B','O']}),Object.assign(P.string(),{name:'Strings'}),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('War Horn','📯','Instrument','Bardic spellcasting focus; heard a mile away',[{name:'Horn',role:'primary',qty:1,kind:'shaft',ok:['B','O','W'],ideal:{B:/horn|tusk|shell/i},why:'A hollow horn, tusk, or shell, or brass.'},Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  // more bardic instruments (owner's request, 2026-11-04)
  FOC('Lyre','🎼','Instrument','Bardic spellcasting focus; played in one arm',[Object.assign(P.haft('Frame',2),{role:'primary',ok:['W','B','O'],ideal:{B:/horn|antler|shell|tortoise/i},why:'A frame of wood, horn, or shell, or metal.'}),Object.assign(P.string(),{name:'Strings'}),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Viol','🎻','Instrument','Bardic spellcasting focus; two-handed when played',[Object.assign(P.haft('Body and neck',2),{role:'primary',ok:['W','B'],why:'Seasoned wood or bone that rings.'}),Object.assign(P.string(),{name:'Strings'}),Object.assign(P.grip('Bow hair'),{ok:['F'],why:'Horsehair, silk, or fine fiber.'}),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Bagpipes','🎶','Instrument','Bardic spellcasting focus; heard across a battlefield',[Object.assign(P.cover(1,['F']),{name:'Bag',why:'A hide or bladder that holds air.',ideal:{F:/hide|bladder|skin|leather/i}}),{name:'Pipes',role:'structure',qty:2,kind:'shaft',ok:['W','B','O'],ideal:{W:HOLLOW,B:HOLLOW},why:'Hollow pipes: reed, bamboo, bone, or metal.'},Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Pan Flute','🎶','Instrument','Bardic spellcasting focus',[{name:'Pipes',role:'primary',qty:2,kind:'shaft',ok:['W','B','O'],ideal:{W:HOLLOW,B:HOLLOW},why:'Hollow reeds, bamboo, bone, or metal tubes.'},Object.assign(P.grip('Binding'),{ok:['F','W']}),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Dulcimer','🎼','Instrument','Bardic spellcasting focus; played resting on the lap',[Object.assign(P.haft('Soundboard',2),{role:'primary',ok:['W','B'],why:'Seasoned wood or bone that rings.'}),Object.assign(P.string(),{name:'Strings'}),{name:'Hammers',role:'minor',qty:1,kind:'fit',ok:['W','B'],optional:true,why:'Light wood or bone.'}]),
  FOC('Shawm','🎶','Instrument','Bardic spellcasting focus; a piercing voice heard 600 feet away',[{name:'Bore',role:'primary',qty:1,kind:'shaft',ok:['W','B','O'],ideal:{W:HOLLOW,B:HOLLOW},why:'A hollow bore of wood, bone, or metal.'},{name:'Reed',role:'minor',qty:1,kind:'fit',ok:['W','F'],why:'A cane reed, or fine fiber.'},Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})]),
  FOC('Chimes','🔔','Instrument','Bardic spellcasting focus; a frame of bells or chime bars',[{name:'Chime bars',role:'primary',qty:2,kind:'shaft',ok:['O','G','S'],weak:['B'],why:'Metal, crystal, or stone that rings when struck.'},P.setting('Frame'),Object.assign(P.heart('Resonance stone'),{optional:true,role:'minor'})])
);
// Still more general Blueprints, from the great lists of historical weapons, armour pieces, shields, farm tools, and
// workshop tools: everything a realm's smiths could make with what Vestige knows. What is too advanced for them (guns,
// cannon) becomes an Arcane version: a spark core does what powder would.
const P_BARREL=(q)=>({name:'Barrel',role:'primary',qty:q||2,kind:'blunt',ok:['O'],weak:['B','W'],why:'A tube of metal that can take the spark-core\'s blast. Bone or hardwood bursts after a few shots.'});
const P_SPARK=()=>({name:'Spark core',role:'minor',qty:1,kind:'focus',ok:['E','G'],why:'An essence or a charged gem: it does what powder would, a burst of force behind the shot. Without it the weapon is a club.'});
const S_GUN=(q)=>[P_BARREL(q),Object.assign(P.stock(),{why:'Wood, metal, or bone to hold and brace it.'}),Object.assign(P.trigger(),{name:'Lock'}),P_SPARK()];
const TOOL=(icon,cat,n,dmg,type,props,slots,extra)=>W_('Tools and farm weapons',icon,cat,n,dmg,type,props,slots,extra);
GEN.push(
  // swords and long knives
  W_('Martial melee','⚔','Sword','Arming Sword','1d8','slashing','Versatile (1d10)',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Messer','1d8','slashing','Light; a hit after a parry deals +1',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Kriegsmesser','2d6','slashing','Heavy, two-handed',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Backsword','1d8','slashing','Versatile (1d10)',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Spatha','1d8','slashing','Versatile (1d10); +1 Accuracy when mounted',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Xiphos','1d6','piercing','Finesse, light',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Kopis','1d8','slashing','Forward-weighted: +1 damage on a charge',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Falcata','1d8','slashing','Cleaves: on a critical hit, roll the damage dice three times',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Talwar','1d8','slashing','Finesse',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Shamshir','1d8','slashing','Finesse; +1 damage when mounted',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Kilij','1d8','slashing','Finesse, versatile (1d10)',S_BLADE(3)),
  W_('Martial melee','⚔','Sword','Yatagan','1d6','slashing','Finesse, light',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Kampilan','1d10','slashing','Two-handed, heavy',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Ninjato','1d6','slashing','Finesse, light; +1 to Stealth while sheathed on your back',S_BLADE(2)),
  W_('Martial melee','⚔','Sword','Dadao','1d10','slashing','Heavy, versatile (1d12)',S_BLADE(4)),
  W_('Martial melee','⚔','Sword','Miao Dao','1d8','slashing','Finesse, two-handed, reach',S_BLADE(3)),
  W_('Martial melee','🪝','Sword','Hook Sword','1d6','slashing','Finesse; pairs can be hooked together for reach; a hit can disarm (Strength save DC 10)',S_BLADE(2)),
  W_('Martial melee','🗡','Dagger','Butterfly Sword','1d6','slashing','Finesse, light; used in pairs',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Swordbreaker','1d4','piercing','Finesse, light; once per round, a parry can trap a blade (disarm, Strength save DC 12)',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Rondel Dagger','1d4','piercing','Finesse, light; ignores 1 AC',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Baselard','1d6','piercing','Finesse, light',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Cinquedea','1d6','slashing','Finesse, light',S_KNIFE(2)),
  W_('Martial melee','🗡','Dagger','Misericorde','1d4','piercing','Finesse, light; +2 damage against a prone or grappled creature',S_KNIFE(1)),
  W_('Simple melee','🗡','Dagger','Dirk','1d4','piercing','Finesse, light, thrown (20/60)',S_KNIFE(1)),
  W_('Simple melee','🗡','Dagger','Seax','1d6','slashing','Light',S_KNIFE(1)),
  W_('Simple melee','🗡','Dagger','Hunting Knife','1d4','slashing','Light; also skins and butchers',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Karambit','1d4','slashing','Finesse, light; can\'t be disarmed',S_KNIFE(1)),
  W_('Simple ranged','🗡','Dagger','Kunai','1d4','piercing','Finesse, light, thrown (20/60); also a climbing spike',S_KNIFE(1),{ranged:'20/60 ft.'}),
  W_('Martial melee','🗡','Dagger','Kris','1d4','piercing','Finesse, light; a wavy blade: +1 damage on a critical hit',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Jambiya','1d4','piercing','Finesse, light',S_KNIFE(1)),
  W_('Martial melee','🗡','Dagger','Push Dagger','1d4','piercing','Light; can\'t be disarmed',S_FIST(P.edge('Blade',1))),
  // axes
  W_('Martial melee','🪓','Axe','Bearded Axe','1d8','slashing','Versatile (1d10); a hit can hook a shield aside (the target loses its shield AC until its turn)',S_AXE(2)),
  W_('Martial melee','🪓','Axe','Dane Axe','1d12','slashing','Heavy, two-handed',S_AXE(3,2)),
  W_('Martial ranged','🪓','Axe','Francisca','1d6','slashing','Thrown (20/60); a hit on a shield-bearer can knock the shield aside',S_AXE(1),{ranged:'20/60 ft.'}),
  W_('Martial melee','🪓','Axe','Labrys','1d10','slashing','Heavy, two-handed',S_AXE(3,2)),
  W_('Martial melee','🪓','Axe','Sagaris','1d6','slashing','Light; also pierces (choose the damage type)',S_AXE(1)),
  W_('Martial melee','🪓','Axe','Broad Axe','1d10','slashing','Heavy, two-handed; also shapes timber',S_AXE(3,2)),
  W_('Martial ranged','🪓','Axe','Hurlbat','1d6','slashing','Thrown (20/60); always lands blade-first',S_AXE(1),{ranged:'20/60 ft.'}),
  // polearms and spears
  W_('Martial melee','🔱','Spear','Pollaxe','1d10','slashing','Heavy, reach, two-handed; can also pierce or bludgeon',S_POLE(P.axehead(2),2)),
  W_('Martial melee','🔱','Spear','Voulge','1d10','slashing','Heavy, reach, two-handed',S_POLE(P.axehead(2),2)),
  W_('Martial melee','🔱','Spear','Fauchard','1d8','slashing','Heavy, reach, two-handed',S_POLE(P.edge('Blade',2),2)),
  W_('Martial melee','🔱','Spear','Guisarme','2d4','slashing','Heavy, reach, two-handed; a hit can pull a mounted rider off (Strength save DC 12)',S_POLE(P.edge('Hook blade',2),2)),
  W_('Martial melee','🔱','Spear','Ranseur','2d4','piercing','Heavy, reach, two-handed; a hit can disarm',S_POLE(P.point(2),2)),
  W_('Martial melee','🔱','Spear','Spetum','1d8','piercing','Heavy, reach, two-handed',S_POLE(P.point(2),2)),
  W_('Martial melee','🔱','Spear','Spontoon','1d8','piercing','Reach, two-handed',S_POLE(P.point(1),2)),
  W_('Martial melee','🔱','Spear','Corseque','1d8','piercing','Heavy, reach, two-handed',S_POLE(P.point(2),2)),
  W_('Martial melee','🔱','Spear','Boar Spear','1d8','piercing','Versatile (1d10); its crossbar stops a charging foe at the end of the spear',S_POINT(2,'Head',2)),
  W_('Martial melee','🔱','Spear','Sarissa','1d10','piercing','Heavy, reach (15 ft.), two-handed',S_POLE(P.point(1),3)),
  W_('Martial melee','🔱','Spear','Ji','1d10','piercing','Heavy, reach, two-handed; also slashes',S_POLE(P.edge('Blade and point',2),2)),
  W_('Martial melee','🔱','Spear','Yari','1d8','piercing','Reach, two-handed',S_POLE(P.point(1),2)),
  W_('Martial melee','🔱','Spear','Monk\'s Spade','1d8','slashing','Reach, two-handed; also digs',S_POLE(Object.assign({},SPADE,{qty:2}),2)),
  W_('Martial melee','🔱','Spear','Military Fork','1d8','piercing','Reach, two-handed',S_POLE(P.point(2),2)),
  W_('Martial melee','🔱','Spear','Swordstaff','1d10','slashing','Heavy, reach, two-handed',S_POLE(P.edge('Blade',2),2)),
  W_('Martial melee','🔱','Spear','Bec de Corbin','1d8','piercing','Heavy, reach, two-handed; ignores 1 AC',S_POLE(P.point(2),2)),
  W_('Martial ranged','🔱','Spear','Pilum','1d6','piercing','Thrown (30/90); a hit on a shield bends into it (the shield gives no AC until pulled out, an action)',S_POINT(1,'Head',2),{ranged:'30/90 ft.'}),
  W_('Simple ranged','🔱','Spear','Plumbata','1d4','piercing','Thrown (30/90); weighted dart',S_POINT(1,'Head'),{ranged:'30/90 ft.'}),
  // blunt
  W_('Simple melee','🏏','Hammer','Cudgel','1d4','bludgeoning','Light',S_BLUNT(1)),
  W_('Simple melee','🏏','Hammer','Shillelagh','1d6','bludgeoning','Versatile (1d8)',S_BLUNT(1)),
  W_('Simple melee','🏏','Hammer','Knobkerrie','1d6','bludgeoning','Thrown (20/60)',S_BLUNT(1),{ranged:'20/60 ft.'}),
  W_('Simple melee','🏏','Hammer','Mere','1d6','bludgeoning','Light; a flat club of stone or bone',[Object.assign(P.blunt(1),{ok:['S','B','O']}),P.grip()]),
  W_('Martial melee','🏏','Hammer','Taiaha','1d8','bludgeoning','Versatile (1d10), finesse',S_BLUNT(1,2)),
  W_('Martial melee','🔨','Hammer','Flanged Mace','1d8','bludgeoning','Ignores 1 AC',S_BLUNT(2)),
  W_('Martial melee','🔨','Hammer','Horseman\'s Pick','1d8','piercing','+1 damage when mounted; ignores 1 AC',S_BLUNT(2)),
  W_('Martial melee','🔨','Hammer','Goedendag','1d8','bludgeoning','Versatile (1d10); also pierces with its spike',S_BLUNT(2,2)),
  W_('Martial melee','⛓','Hammer','Two-Handed Flail','1d10','bludgeoning','Heavy, two-handed',S_CHAIN(P.blunt(3))),
  W_('Martial melee','🏏','Hammer','War Club','1d8','bludgeoning','Versatile (1d10)',S_BLUNT(2)),
  // bows and shooters
  W_('Martial ranged','🏹','Bow','Yumi','1d8','piercing','Ammunition (150/600), heavy, two-handed; can be shot from horseback',S_BOW(3),{ranged:'150/600 ft.'}),
  W_('Martial ranged','🏹','Bow','Horse Bow','1d6','piercing','Ammunition (80/320), two-handed; no penalty when mounted',S_BOW(2),{ranged:'80/320 ft.'}),
  W_('Martial ranged','🏹','Bow','Arbalest','1d12','piercing','Ammunition (120/480), heavy, loading, two-handed',S_XBOW(3),{ranged:'120/480 ft.'}),
  W_('Martial ranged','🏹','Bow','Gastraphetes','1d10','piercing','Ammunition (80/320), heavy, loading, two-handed; braced against the belly to draw',S_XBOW(2),{ranged:'80/320 ft.'}),
  W_('Simple ranged','🏹','Bow','Pellet Bow','1d4','bludgeoning','Ammunition (30/120), two-handed; shoots stones',S_BOW(1),{ranged:'30/120 ft.'}),
  W_('Simple ranged','🪢','Staff','Lasso','1','bludgeoning','Thrown (15 ft.); a Large or smaller creature hit is restrained (Strength or Dexterity check DC 12 to escape)',[Object.assign(P.string(),{name:'Rope',role:'primary'})],{ranged:'15 ft.'}),
  // arcane versions of what the realms can't yet build
  W_('Arcane ranged','🔫','Bow','Arcane Arquebus','1d10','piercing','Ammunition (80/320), loading, two-handed; a spark core does what powder would',S_GUN(2),{ranged:'80/320 ft.'}),
  W_('Arcane ranged','🔫','Bow','Arcane Musket','1d12','piercing','Ammunition (100/400), loading, two-handed',S_GUN(3),{ranged:'100/400 ft.'}),
  W_('Arcane ranged','🔫','Bow','Arcane Pistol','1d8','piercing','Ammunition (30/90), loading, light',S_GUN(1),{ranged:'30/90 ft.'}),
  W_('Arcane ranged','🔫','Bow','Arcane Blunderbuss','2d6','piercing','Ammunition (15/60), loading, two-handed; hits every creature in a 15-ft. cone (Dexterity save for half)',S_GUN(3),{ranged:'15/60 ft.'}),
  W_('Arcane ranged','💥','Hammer','Arcane Hand Cannon','2d8','bludgeoning','Ammunition (60/240), heavy, loading, two-handed',S_GUN(4),{ranged:'60/240 ft.'}),
  W_('Arcane ranged','🔥','Spear','Arcane Fire Lance','2d6','fire','Ammunition (10 ft. cone), loading, reach; spits fire, then fights as a spear (1d8 piercing)',[P.point(1),Object.assign(P_BARREL(1),{name:'Fire tube',role:'structure'}),P.haft('Shaft',2),P_SPARK()]),
  W_('Arcane ranged','🔫','Bow','Arcane Repeater','1d8','piercing','Ammunition (80/320), two-handed; holds 6 shots',S_GUN(2).concat([Object.assign(P.trigger(),{name:'Cylinder'})]),{ranged:'80/320 ft.'}),
  // farm and workshop tools that can fight
  TOOL('⛏','Hammer','Hoe','1d4','slashing','Two-handed; tills an acre a day',[Object.assign({},SPADE,{name:'Blade',qty:1}),P.haft('Handle',2),P.grip()]),
  TOOL('⛏','Hammer','Mattock','1d8','piercing','Heavy, two-handed; breaks stone and roots',[P.axehead(2),P.haft('Handle',2),P.grip()]),
  TOOL('🧹','Hammer','Rake','1d4','piercing','Two-handed, reach',[Object.assign(P.point(1),{name:'Tines'}),P.haft('Handle',2),P.grip()]),
  TOOL('🪝','Axe','Pruning Hook','1d6','slashing','Reach, two-handed',S_POLE(P.edge('Hook',1),2)),
  TOOL('🔪','Dagger','Hay Knife','1d6','slashing','Two-handed; cuts hay and thatch',S_KNIFE(2)),
  TOOL('⛓','Hammer','Threshing Flail','1d6','bludgeoning','Two-handed',S_CHAIN(Object.assign(P.blunt(1),{ok:['W','O','B']}))),
  TOOL('🔱','Spear','Winnowing Fork','1d4','piercing','Two-handed, reach',S_POLE(Object.assign(P.point(1),{name:'Tines',ok:['W','O','B']}),2)),
  TOOL('🪓','Axe','Adze','1d6','slashing','Light; shapes timber and hollows logs',S_AXE(1)),
  TOOL('🔪','Dagger','Drawknife','1d4','slashing','Light; shaves wood',S_KNIFE(1)),
  TOOL('🪓','Axe','Froe','1d4','bludgeoning','Splits shingles and staves',S_AXE(1)),
  TOOL('⛏','Spear','Dibber','1d4','piercing','Light; plants seeds',[Object.assign(P.point(1),{ok:['W','O','B','S']}),P.grip()]),
  TOOL('🔨','Hammer','Smith\'s Hammer','1d6','bludgeoning','Light; a blacksmith\'s tool (+1 to Blacksmithing checks made with it)',S_BLUNT(1)),
  TOOL('🔨','Hammer','Mallet','1d4','bludgeoning','Light',S_BLUNT(1)),
  TOOL('🪚','Sword','Saw','1d4','slashing','Two-handed; cuts timber',[Object.assign(P.edge('Toothed blade',2),{ok:['O']}),P.hilt()]),
  TOOL('🔧','Dagger','Chisel','1d4','piercing','Light; carves stone and wood',S_KNIFE(1)),
  TOOL('🔧','Dagger','Awl','1d4','piercing','Light; punches leather',S_KNIFE(1)),
  TOOL('🔧','Hammer','Tongs','1d4','bludgeoning','Light; a hit can grab (grapple, Strength check DC 10)',[Object.assign(P.edge('Jaws',1),{kind:'blunt',ok:['O']}),P.hilt()]),
  TOOL('🔧','Spear','Auger','1d4','piercing','Two-handed; bores holes',[Object.assign(P.point(1),{ok:['O']}),P.haft('Handle')]),
  TOOL('🪣','Hammer','Trowel','1d4','slashing','Light; lays mortar',[Object.assign({},SPADE,{name:'Blade',qty:1}),P.grip()]),
  TOOL('🏮','Hammer','Lantern Staff','1d6','bludgeoning','Two-handed; sheds light in a 20-ft. radius',[P.haft('Staff',2),Object.assign(P.heart('Lantern stone'),{optional:true,role:'minor'})]),
  // armour pieces from the great harnesses
  AR('Great Helm','Head','⛑',2,['O']),AR('Bascinet','Head','⛑',2,['O']),AR('Sallet','Head','⛑',2,['O']),AR('Barbute','Head','⛑',2,['O']),AR('Armet','Head','⛑',2,['O']),
  AR('Kettle Hat','Head','⛑',2,['O','B']),AR('Spangenhelm','Head','⛑',2,['O','B']),AR('Nasal Helm','Head','⛑',2,['O']),AR('Morion','Head','⛑',2,['O']),AR('Burgonet','Head','⛑',2,['O']),
  AR('Gorget','Shoulders','🛡',1,['O','B']),AR('Bevor','Shoulders','🛡',1,['O']),AR('Besagews','Shoulders','🛡',1,['O','B']),
  AR('Haubergeon','Body','🛡',4,['O']),AR('Jack of Plates','Body','🛡',4,['O','F']),AR('Cuir Bouilli','Body','🧥',4,['F']),AR('Coat of Plates','Body','🛡',4,['O','F']),AR('Surcoat','Body','👘',4,['F']),
  AR('Vambraces','Hands','🧤',1,['O','B']),AR('Rerebraces','Hands','🧤',1,['O','B']),AR('Couters','Hands','🧤',1,['O']),AR('Mitten Gauntlets','Hands','🧤',1,['O']),
  AR('Cuisses','Feet','🥾',1,['O','B','F']),AR('Poleyns','Feet','🥾',1,['O']),AR('Tassets','Feet','🥾',1,['O','B']),AR('Sabatons','Feet','🥾',1,['O']),
  AR('Tabard','Back','👘',1,['F']),
  // shields of many lands
  SH('Aspis','Shield',3),SH('Scutum','Tower',4),SH('Parma','Buckler',1),SH('Pelta','Shield',2),SH('Wicker Shield','Shield',2),SH('Hide Shield','Shield',2),
  SH('Adarga','Shield',2),SH('Rotella','Shield',3),SH('Bouche Shield','Shield',3),SH('Lantern Shield','Buckler',2),SH('Mantlet','Tower',6)
);
// ammunition (owner's request, 2026-11-23: "add arrow blueprint and ammunition blueprint in forge"): what every ranged weapon
// shoots. The head (or shot) is the main part: a good material adds damage to each hit (Item Level ÷ 5, ÷ 4 for heavy kinds),
// armor-piercing kinds also make a hit ignore some AC, and a craft makes a bundle. The sheet adds it to the weapon it fits.
const AMMO_FITS={bow:'bows',crossbow:'crossbows',sling:'slings and slingshots',blowgun:'blowguns',firearm:'firearms',siege:'ballistas and scorpions',parts:'plain arrow shafts (Fletcher\'s Tools)'};
const AM=(n,icon,fits,qty,slots,o)=>[n,Object.assign({group:'Ammunition',icon,cat:'Ammunition',ammo:Object.assign({fits,qty},o||{}),props:`Ammunition for ${AMMO_FITS[fits]}; a craft makes ${qty}`,slots:mk(slots)})];
const P_HEAD=(name)=>Object.assign(P.point(1),{name:name||'Arrowheads'}),P_SHAFT=(name)=>Object.assign(P.haft(name||'Shafts'),{ok:['W','B','O']}),P_FLETCH=(name)=>Object.assign(P.grip(name||'Fletching'),{ok:['F','B'],why:'Feathers, hide, or thin bone.'});
const P_SHOT=(name)=>({name:name||'Shot',role:'primary',qty:1,kind:'blunt',ok:['O','S','B','G'],ideal:{S:/flint|basalt|granite|river/i},why:'Something small and heavy: metal, stone, dense bone, or a gem.'});
GEN.push(
  AM('Arrows','🏹','bow',20,[P_HEAD(),P_SHAFT(),P_FLETCH()]),
  AM('Broadhead Arrows','🏹','bow',20,[P_HEAD('Broadheads'),P_SHAFT(),P_FLETCH()],{heavy:true}),
  AM('Bodkin Arrows','🏹','bow',20,[P_HEAD('Bodkin points'),P_SHAFT(),P_FLETCH()],{pierce:true}),
  AM('Barbed Arrows','🏹','bow',20,[Object.assign(P_HEAD('Barbed heads'),{ideal:{B:/fang|tooth|claw|barb|spine|hook/i}}),P_SHAFT(),P_FLETCH()],{note:'A creature hit has its speed cut by 10 feet until it spends an action to pull the arrow out.'}),
  AM('Arrowheads','🔺','parts',20,[P_HEAD('Heads')],{note:'Fit them to plain shafts with Fletcher\'s Tools (an hour for twenty): the arrows they make carry these numbers.'}),
  AM('Crossbow Bolts','🎯','crossbow',20,[P_HEAD('Bolt heads'),P_SHAFT(),Object.assign(P_FLETCH('Vanes'),{ok:['F','W','B']})]),
  AM('Heavy Bolts','🎯','crossbow',20,[P_HEAD('Bolt heads'),P_SHAFT(),Object.assign(P_FLETCH('Vanes'),{ok:['F','W','B']})],{heavy:true}),
  AM('Piercing Quarrels','🎯','crossbow',20,[P_HEAD('Square heads'),P_SHAFT(),Object.assign(P_FLETCH('Vanes'),{ok:['F','W','B']})],{pierce:true}),
  AM('Sling Bullets','🪨','sling',20,[P_SHOT('Bullets')]),
  AM('Blowgun Needles','📍','blowgun',50,[Object.assign(P_HEAD('Needles'),{ok:['O','B']}),Object.assign(P_FLETCH('Tufts'),{ok:['F']})],{light:true}),
  AM('Firearm Shot','💥','firearm',20,[P_SHOT('Balls'),{name:'Charge',role:'structure',qty:1,kind:'fit',ok:['E','L','S'],optional:true,why:'An essence or a reactive substance for the cartridge; plain powder if left empty.'}],{heavy:true}),
  AM('Ballista Bolts','🏹','siege',5,[P_HEAD('Bolt heads'),Object.assign(P_SHAFT('Shafts'),{qty:2})],{pierce:true})
);
const BASES=Object.fromEntries(GEN);
// the Staff is a weapon and a focus, built outside W_: it gets the Everchanging core too
Object.values(BASES).forEach(b=>{if(b.dmg&&!b.slots.some(s=>s.kind==='shift'))b.slots.push(...mk([P.shift()]))});
const BASE_GROUPS=[...new Set(GEN.map(([,b])=>b.group))];
const SHIELD_KIND={Buckler:1,Shield:2,Tower:3};
const ARMOR_SLOT_UNITS={Body:4,Head:2,Hands:1,Feet:1,Shoulders:1,Back:1,Mount:4};  // keep in step with tools/data/armor.js
const ARMOR_SLOT_MULT=ARMOR_SLOT_UNITS;
// Same formula as tools/data/armor.js (used by the build and by generators/vaultac.js): a full set of iron gear (10 units of metal at Item Level 1) gives 10 AC.
// Damage after AC (campaign owner's rule): a hit that gets past the Dodge deals its damage minus the target's AC, and
// at least 1 (owner's rule, 2026-11-15: a hit that lands always hurts, however thick the armor).
// A realm's price base (Economy rules). Void-grade and deeper materials aren't sold, but coin still moves there (Tower
// hoards, purses, services), so those realms extend the last base, doubling with each tier.
// Favor: the currency of Void-grade and deeper goods, which aren't sold for coin but pass between gods and their contractors
// "by favor, contract, and oath". Favor price = realm Favor base × grade (×2 at grade 9–10, like coin prices): Void 1,
// Inner Void 2, Primordial 4. Contractors earn Favor for each task done for their god, and a god's temple discount applies
// to Favor prices as well as coin.
const favorBase=t=>t>=8?Math.pow(2,t-8):0;
function favorOf(m){if(!m||m.price)return 0;const t=m.tier||(REALM[m.realm]||{}).tier||1,b=favorBase(t);if(!b)return 0;const g=m.g||1;return b*g*(g>=9?2:1)}
const fav=n=>`⟡ ${fmt(n)} Favor`;
// General goods every god's temple sells (campaign owner's rule): the basic Human-grade materials of each kind (two per
// category, lowest grade, gathered or mined rather than monster parts) and the most basic material of each kind from the
// god's home realm. Contractors buy them at their rank's temple discount, in coin or, for Void-grade goods, in Favor.
const TEMPLE_CATS=['O','W','F','S','G','B','L','E','U','K'];
function templeGoods(home){templeGoods.c=templeGoods.c||{};if(templeGoods.c[home])return templeGoods.c[home];
  const basic=(realm,k,n)=>MATS.filter(m=>m.realm===realm&&!m.gen&&m.org!=='Creature'&&matCode(m)===k&&(m.price||favorOf(m))).sort((a,b)=>a.g-b.g||(a.price||0)-(b.price||0)||a.n.localeCompare(b.n)).slice(0,n);
  // everyday staples first, then the most basic of each kind
  const out=['Iron','Steel','Tin','Copper','Silver','Gold','Leather','Bone','Oak','Ash','Yew','Herb Bundle','Granite','Marble','Coal'].map(findMat).filter(m=>m&&m.realm==='Human');
  TEMPLE_CATS.forEach(k=>basic('Human',k,2).forEach(m=>{if(!out.includes(m))out.push(m)}));
  if(home&&home!=='Human')TEMPLE_CATS.forEach(k=>basic(home,k,1).forEach(m=>out.push(m)));
  return templeGoods.c[home]=out}
// Temple passages (campaign owner's rule): a god's temples and shrines are doors. Giving an offering related to the god opens a
// passage to the god's own domain, a pocket of its home realm, where its goods are sold. The domain's name comes from the
// god's Runes and title; the offering can be the god's Minor signature material, any item made from one of its signature
// materials, or a deed that serves what it wants.
const DOMAIN_KINDS=[[/fire|forg|smith|ember|flame|volcan|craft/i,'Forge'],[/death|dead|grave|underworld|soul|mourn|grief/i,'Halls'],[/sea|water|tide|river|ocean|rain|flood/i,'Deep'],[/sky|lightning|thunder|storm|wind|air/i,'Spire'],[/sun|light|dawn|day|radian|divin/i,'Court'],[/night|dark|moon|shadow|void|dream|sleep/i,'Hollow'],[/war|battle|strength|victory|conquest/i,'Citadel'],[/hunt|bow|animal|beast|wild/i,'Hunting Grounds'],[/love|beauty|desire|seduc|joy|fertil/i,'Garden'],[/music|art|poet|song|dance/i,'Amphitheatre'],[/wisdom|knowledge|writ|magic|secret|law|justice|truth/i,'Library'],[/time|prophe|fate|destiny|star/i,'Observatory'],[/grow|harvest|season|earth|nature|grain|maize|wine|famine|plant/i,'Grove'],[/wealth|trade|treasure|luck|fortune|coin/i,'Vault'],[/trick|chaos|mischief|discord|lie/i,'Labyrinth'],[/heal|medicin|health/i,'Infirmary'],[/home|hearth|family|loyal|royal|sovereign|marriage/i,'Palace'],[/destruct|release|rebel/i,'Ruin']];
function domainOf(g){if(g._dom)return g._dom;let kind='Sanctum';
  for(const t of (g.runes||[]).concat([godTitle(g)])){const k=DOMAIN_KINDS.find(([re])=>re.test(t));if(k){kind=k[1];break}}
  const minor=g.rk&&g.rk.Minor&&findMat(g.rk.Minor);
  return g._dom={name:`The ${kind} of ${godKey(g)}`,realm:g.home||'Heaven',offer:minor}}
// How long a passage stays open depends on the offering (campaign owner's rule, base one hour): the god's Minor signature
// material opens it for an hour, each higher rank's material for longer; an item made from a signature material doubles that
// material's time; deeds count by size. More of the same offering adds its time again.
const PASSAGE_TIME=[['Minor','1 hour',1],['Normal','2 hours',2],['Major','4 hours',4],['Senior','8 hours',8],['Apostle','1 day',24],['Finger','3 days',72]];
const PASSAGE_DEEDS=[['A small deed or offering of service','1 hour'],['A completed task for the god (a contract task)','4 hours'],['A major task, or a deed that clearly serves what the god wants','1 day']];
const hrs=h=>h>=24?(h%24?h+' hours':(h/24)+(h===24?' day':' days')):h+(h===1?' hour':' hours');
function passageHTML(g){const d=domainOf(g);
  const rows=PASSAGE_TIME.map(([rk,,h])=>{const x=g.rk&&g.rk[rk]&&findMat(g.rk[rk]);return x?`<tr><td>${refChip(x)}<small style="color:var(--muted)"> ${rk}</small></td><td class="num">${hrs(h)}</td><td class="num">${hrs(h*2)}</td></tr>`:''}).join('');
  return `<div class="callout" style="border-color:var(--acc)"><b>🚪 Passage to ${esc(d.name)}</b> <small style="color:var(--muted)">in the ${esc(realmLabel(d.realm))}</small>
    <div style="line-height:1.6;margin-top:4px">Any temple or shrine of ${esc(godKey(g))} opens into its domain when given an offering related to the god. The offering is taken, and <b>how long the passage stays open depends on what was offered</b> (base: one hour). Offering more of the same adds its time again. Inside the domain, the home realm's Pressure doesn't apply, and the domain's market sells everything below. Contractors of Major rank and above open it for an hour without an offering, and can offer to stay longer.</div>
    <div class="tablewrap" style="margin-top:8px"><table class="t"><thead><tr><th>Signature material</th><th class="num">Offered</th><th class="num">As an item</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="tablewrap" style="margin-top:6px"><table class="t"><thead><tr><th>Offering: a deed${g.wants?` (it wants: <i style="text-transform:none;letter-spacing:0">${esc(g.wants.charAt(0).toLowerCase()+g.wants.slice(1))}</i>)`:''}</th><th class="num">Open for</th></tr></thead><tbody>${PASSAGE_DEEDS.map(([t,h])=>`<tr><td>${t}</td><td class="num">${h}</td></tr>`).join('')}</tbody></table></div></div>`}
const realmLabel=r=>/realm$/i.test(r||'')?r:(r||'')+' Realm';
function realmBase(rn){const r=REALM[rn]||REALMS[0];if(r.base)return r.base;const priced=REALMS.filter(x=>x.base).sort((a,b)=>b.tier-a.tier)[0];return priced.base*Math.pow(2,r.tier-priced.tier)}
// the table's damage floor (owner's rule: at least 1; the DM can pick a stronger one on the Rules page): 'one' at least 1,
// 'realm' at least the realm's tier (1 in the Human Realm … 10 in the Primordial), 'quarter' at least a quarter of the hit
const DMG_FLOORS=[['one','At least 1 (the campaign rule)'],['realm','At least the realm tier (Human 1, Mysterious 2, … Primordial 10)'],['quarter','At least a quarter of the hit']];
const dmgFloor=()=>{const v=store.get('dmgFloor','one');return DMG_FLOORS.some(x=>x[0]===v)?v:'one'};
const acTaken=(d,ac,tier)=>{if(!(d>0))return 0;const m=dmgFloor(),fl=m==='quarter'?Math.max(1,Math.floor(d/4)):m==='realm'?Math.max(1,Math.round(+tier||1)):1;return Math.max(fl,d-Math.max(0,ac||0))};
function dmgFloorSet(v){store.set('dmgFloor',v);toast('Damage floor: '+(DMG_FLOORS.find(x=>x[0]===v)||DMG_FLOORS[0])[1]);if(typeof renderTab==='function')renderTab()}
// the realm of the fight in the combat tracker: where most of its monsters come from
function cbTier(){const cnt={};(CB.list||[]).forEach(x=>{const m=x.mon&&MON_IDX.get(lc(x.mon));if(m)cnt[m.realm]=(cnt[m.realm]||0)+1});const r=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];return r&&REALM[r]?REALM[r].tier:1}
const armorAC=(units,code,il)=>Math.max(1,Math.round(units*(code==='O'?1:/[BSG]/.test(code||'')?.7:.4)*(1+((il||1)-1)/20)));
const matCode=m=>m.tc||({'Ore / Metal':'O','Metal':'O','Wood / Plant':'W','Wood':'W','Crystal / Gem':'G','Gemstone & Crystal':'G','Stone':'S','Hide / Cloth / Fiber':'F','Bone / Fang / Horn / Scale':'B','Blood / Organ':'L','Essence / Soul / Core':'E','Mechanism':'K','Supply':'U'})[m.ty||m.cat]||'?';
function slotFit(slot,m){if(m&&m.any)return {lv:'good',why:''};return slotFitBase(slot,m)}
function slotFitBase(slot,m){
  if(!m)return slot.optional?{lv:'empty'}:{lv:'missing'};
  if(slot.only&&!slot.only.test(m.n))return {lv:'wrong',c:matCode(m),why:'Only an Everchanging Substance fits here: it comes from creatures that change their shape.'};
  const c=matCode(m);
  if((slot.weak||[]).includes(c))return {lv:'poor',c,why:(WHY_WRONG[slot.kind]||{})[c]||''};
  if(!slot.ok.includes(c))return {lv:'wrong',c,why:(WHY_WRONG[slot.kind]||{})[c]||'This kind of material doesn\'t work in this part.'};
  const rx=slot.ideal&&slot.ideal[c];
  if(rx&&!rx.test(m.baseN||m.n))return {lv:'poor',c,why:'Right category, but not the best kind for this part.'};
  return {lv:'good',c};
}
const PENALTY={
  primary:{wrong:'Useless: damage drops to 1d2 (armor gives 0 AC, a focus gives no bonus), −5 Accuracy, the item breaks on a roll of 1–5, and this material\'s property and trait don\'t work.',poor:'Poor fit: −1 Accuracy (−1 AC for armor), no damage bonus from this part, the item breaks on a natural 1, and the property works at half Potency.'},
  structure:{wrong:'Falls apart: −3 Accuracy (−2 AC), the item breaks on a natural 1–3, and this material\'s property doesn\'t work.',poor:'Poor fit: no Accuracy from this part, and the item breaks on a natural 1.'},
  minor:{wrong:'Wasted: this part gives nothing, and the item has −1 Accuracy.',poor:'Weak fit: this part\'s property works at half Potency.'}
};
let FORGE=store.get('forge',{base:'Battleaxe',parts:{},name:'',showAll:false,realm:''});
if(FORGE.parts)Object.keys(FORGE.parts).forEach(k=>{FORGE.parts[k]=unprep(FORGE.parts[k])});delete FORGE.proc;
if(!BASES[FORGE.base])FORGE.base=({Axe:'Battleaxe',Sword:'Longsword','Body Armor':'Cuirass','Focus / Amulet':'Amulet'})[FORGE.base]||'Battleaxe';
if(FORGE.ever==null)FORGE.ever=!!(FORGE.parts||{})['everchanging-core'];
if(FORGE.forms&&!FORGE.everForms){FORGE.everForms=FORGE.forms.map(n=>({base:n,parts:{}}));delete FORGE.forms}
let DESIGNS=store.get('designs',[]);if(potMigrate(DESIGNS))store.set('designs',DESIGNS);
const saveForge=()=>{if(typeof FF!=='undefined'){FF.made='';FF.strikes=0;FF.res=null}store.set('forge',FORGE)};
// Materials and Blueprints use two scales: a material's Item Level runs 1-50 (five to a realm), a Blueprint's level
// 1-100 (ten to a realm, like character and profession levels). A forged item's level is its best material's Item
// Level on the Blueprint scale, so an item made of Void metal (Item Level 36-40) is a level 71-80 item, like the vault's.
const ilLevel=il=>il?Math.min(MAX_LEVEL,Math.max(1,2*(+il||1))):0;
// Damage keeps pace with the vault's Blueprints of the same level: they average about 3 damage a level (a level 11
// longsword deals 7d8). The weapon keeps its own die and never drops below its base dice.
const VAULT_DMG_PER_LEVEL=2.95;
function growDice(d,il){const m=/^(\d+)d(\d+)$/.exec(d);if(!m)return d;const n=+m[1],x=+m[2];return Math.max(n,Math.round(VAULT_DMG_PER_LEVEL*ilLevel(il||1)/((x+1)/2)))+'d'+x}
// Designs forged before forged items moved to the Blueprint scale held the material's Item Level as their level and
// the old, slower dice. Bring them up: level from their materials (Item Level × 2), and the leading dice recomputed
// from the base weapon; the flat bonus after the dice (quality, growth) is kept. Running it again changes nothing.
function lvMigrate(L){let n=0;(Array.isArray(L)?L:[]).forEach(d=>{if(!d||typeof d!=='object')return;const was=JSON.stringify([d.il,d.dmg,d.vers,d.forms]);
  const ils=Object.values(d.parts||{}).map(x=>findMat(x||'')).filter(Boolean).map(m=>m.il||1),mil=ils.length?Math.max(...ils):d.lvV?0:+d.il||0;
  if(mil)d.il=ilLevel(mil);const B=BASES[d.base];
  const redo=(s,G,die)=>{const m=/^(\d+d\d+)(.*)$/.exec(s||'');if(!m||!G||!G.dmg||!mil||(m[1]==='1d2'&&G.dmg[0]!=='1d2'))return s;let x=growDice(G.dmg[0],mil);if(die)x=x.replace(/d\d+$/,'d'+die);return x+m[2]};
  if(B&&B.dmg){d.dmg=redo(d.dmg,B);const vm=/Versatile \((\d+)d(\d+)\)/.exec(B.props||'');if(d.vers&&vm)d.vers=redo(d.vers,B,vm[2])}
  if(Array.isArray(d.forms))d.forms.forEach(f=>{if(f&&f.dmg)f.dmg=redo(f.dmg,BASES[f.n])});
  d.lvV=2;if(JSON.stringify([d.il,d.dmg,d.vers,d.forms])!==was)n++});return n}
if(lvMigrate(DESIGNS))store.set('designs',DESIGNS);
PARTY.forEach(c=>{if(c&&c.fd&&typeof c.fd==='object')lvMigrate(Object.values(c.fd))});
// Everchanging (campaign owner's rule): a weapon is Everchanging only when the Forge's checkbox is on. Its core must hold
// an Everchanging Substance (left by a shapechanger such as a mimic), and the substance's grade decides how many forms
// it has (campaign owner's rule): one extra form per realm, so a Human grade gives 2 forms (the weapon and one more), a
// Mysterious grade 3, Hell or Heaven 4, and so on.
const formsFor=m=>m?(m.tier||1)+1:0;
// a design's parts: the Everchanging core only when the weapon is Everchanging (and then it is required)
const forgeSlots=(B,ever)=>B.slots.filter(s=>s.kind!=='shift'||ever).map(s=>s.kind==='shift'?Object.assign({},s,{optional:false,why:'An Everchanging Substance, left by a creature that changes its shape (a mimic, a doppelganger, a werewolf). It decides how many forms the weapon has.'}):s);
const forgeEver=()=>!!(FORGE.ever&&BASES[FORGE.base]&&BASES[FORGE.base].dmg);
// An Everchanging weapon's other forms are weapons of their own (a Longsword that becomes a Spear). Each form's part
// reuses a material already in the weapon when it is a good fit there; any part no material carries over to needs a
// material added for that form (the player's own choice always wins).
function everParts(i){const f=(FORGE.everForms||[])[i]||{},G=BASES[f.base];if(!G||!G.dmg)return null;const own=f.parts||{},
  main=forgeSlots(BASES[FORGE.base],false).map(s=>({s,m:findMat(FORGE.parts[s.id]||'')})).filter(x=>x.m),parts={},from={};
  forgeSlots(G,false).forEach(s=>{if(own[s.id]){parts[s.id]=own[s.id];return}const c=main.filter(x=>slotFit(s,x.m).lv==='good').sort((a,b)=>(b.s.role===s.role)-(a.s.role===s.role))[0];if(c){parts[s.id]=c.m.n;from[s.id]=c.s.name}});
  return {base:f.base,G,parts,from,own}}
// every chosen form, worked out like a weapon of its own (the main weapon is form 1)
function everResults(n){const out=[];for(let i=0;i<Math.max(0,n-1);i++){const e=everParts(i);if(!e){out.push(null);continue}const r=forgeResult(e.base,e.parts,{form:true});
  out.push({i,e,r,missing:r.parts.filter(p=>!p.s.optional&&!p.m).map(p=>p.s.name),added:Object.values(e.own).map(findMat).filter(Boolean)})}return out}
function forgeResult(baseName,partsMap,opt){
  baseName=baseName||FORGE.base;partsMap=partsMap||FORGE.parts;opt=opt||{};const main=!opt.form,ever=main&&forgeEver();
  const B=BASES[baseName],parts=forgeSlots(B,ever).map(s=>{const m=findMat(partsMap[s.id]||'');return {s,m,fit:slotFit(s,m)}});
  const prim=parts.find(p=>p.s.role==='primary'),struc=parts.find(p=>p.s.role==='structure');
  let hit=0,acAdj=0,breakOn=0,useless=false;const notes=[],props=[],traits=[],adds=[];
  parts.forEach(p=>{
    if(p.fit.lv==='wrong'||p.fit.lv==='poor')notes.push([p.s.name,p.fit.lv,PENALTY[p.s.role][p.fit.lv],p.fit.why||'']);
    if(p.fit.lv==='wrong'){if(p.s.role==='primary'){useless=true;hit-=5;breakOn=Math.max(breakOn,5)}else if(p.s.role==='structure'){hit-=3;acAdj-=2;breakOn=Math.max(breakOn,3)}else hit-=1}
    if(p.fit.lv==='poor'&&p.s.role!=='minor'){if(p.s.role==='primary'){hit-=1;acAdj-=1}breakOn=Math.max(breakOn,1)}
    if(p.m&&p.fit.lv!=='wrong'){
      if(p.m.pn)props.push({m:p.m,s:p.s,half:p.s.role==='minor'||p.fit.lv==='poor'});
      if(p.m.tr)traits.push({m:p.m,s:p.s});
    }
  });
  const used=parts.filter(p=>p.m);
  const il=used.length?Math.max(...used.map(p=>p.m.il||1)):0;
  const pm=prim&&prim.m,pok=pm&&prim.fit.lv!=='wrong',pil=pok?(pm.il||1):0;
  const sm=struc&&struc.m,sil=sm&&struc.fit.lv==='good'?(sm.il||1):0;
  // a structure much weaker than the main part can't carry it
  if(pm&&sm&&struc.fit.lv!=='wrong'&&(pm.il||1)>(sm.il||1)+10){breakOn=Math.max(breakOn,2);notes.push([struc.s.name,'weak',`Too weak for the ${prim.s.name.toLowerCase()}: the ${esc(sm.n)} (Item Level ${sm.il||1}) can't carry a ${esc(pm.n)} (Item Level ${pm.il||1}). The item breaks on a natural 1–2.`,''])}
  const strongest=used.slice().sort((a,b)=>(b.m.rank||0)-(a.m.rank||0))[0];
  const cost=used.reduce((a,p)=>a+(p.m.price||0)*p.s.qty,0);
  const out={B,parts,notes,props,traits,il:ilLevel(il),mil:il,cost,strongest:strongest&&strongest.m,breakOn,adds,
    dcMod:0};
  parts.forEach(p=>{const v=p.m&&p.fit.proc;if(v&&(v[4]||{}).ac&&v[2].includes(p.s.kind))acAdj+=(v[4]||{}).ac});
  const dmgBonus=pok&&prim.fit.lv==='good'?Math.floor(pil/5):0,atkBonus=Math.floor(sil/10);
  // Everchanging core (only when the weapon is Everchanging): its substance sets the number of forms (formsFor)
  const sh=ever&&parts.find(p=>p.s.kind==='shift'&&p.m&&p.fit.lv==='good');
  if(sh&&!useless){out.forms=formsFor(sh.m);out.formDmg=n=>{const G=BASES[n];return G&&G.dmg?`${growDice(G.dmg[0],pil)}${dmgBonus?' + '+dmgBonus:''} ${G.dmg[1]}`:''};adds.push([sh.s.name,sh.m,`${out.forms} forms (the weapon reshapes between them)`])}
  if(B.dmg){
    out.attack=atkBonus+hit;out.damage=useless?'1d2':`${growDice(B.dmg[0],pil)}${dmgBonus?' + '+dmgBonus:''}`;out.dtype=B.dmg[1];
    // two-handed: the same number of dice, one size bigger (so it never rolls less than one-handed)
    const vm=/Versatile \((\d+)d(\d+)\)/.exec(B.props||'');if(vm&&!useless)out.vers=`${growDice(B.dmg[0],pil).replace(/d\d+$/,'d'+vm[2])}${dmgBonus?' + '+dmgBonus:''}`;
    if(pm)adds.push([prim.s.name,pm,useless?'nothing: wrong material':`damage ${growDice(B.dmg[0],pil)}${dmgBonus?' + '+dmgBonus:''}`]);
    if(sm)adds.push([struc.s.name,sm,struc.fit.lv==='wrong'?'nothing: wrong material':`attack ${atkBonus>=0?'+':''}${atkBonus}`]);
  }
  if(B.focus){const fb=pok&&prim.fit.lv==='good'?Math.floor(pil/10):pok?Math.floor(pil/20):0,sb=Math.floor(sil/20),fd=pok&&prim.fit.lv==='good'?Math.floor(pil/5):pok?Math.floor(pil/10):0;out.focusBonus=useless?0:fb+sb;out.focusDmg=useless?0:fd;
    if(pm)adds.push([prim.s.name,pm,useless?'nothing: wrong material':`+${fb} spell Accuracy and save DC${fd?`, +${fd} spell damage`:''}`]);if(FOCUS_BUFF[baseName])notes.push(['As a focus','buff',esc(focusBuffText(baseName))+'.','']);if(sm&&sb)adds.push([struc.s.name,sm,`+${sb} to spell attacks and save DC`]);}
  if(B.armor||B.shield){
    const c=pm&&matCode(pm);let base=0;const units=B.shield?SHIELD_KIND[B.kind]:ARMOR_SLOT_UNITS[B.slot];
    if(pok)base=armorAC(units,c,pil);
    const lin=sil>=20?1:0;
    out.ac=Math.max(0,base+acAdj+lin);out.weight=ARMOR_WEIGHT[c]||'Light';out.drawback=pieceDrawbacks({slot:B.shield?B.kind:B.slot,weight:out.weight});
    if(pm)adds.push([prim.s.name,pm,pok?`AC ${base} (${out.weight.toLowerCase()})`:'nothing: wrong material']);
    if(sm)adds.push([struc.s.name,sm,struc.fit.lv==='wrong'?'nothing: wrong material':lin?'+1 AC (Item Level 20+)':'comfort; +1 AC from Item Level 20']);
  }
  if(B.potion){const eff=pm&&pok?alchOf(pm):'',cm=parts.find(p=>p.s.id==='catalyst'),cat=cm&&cm.m&&cm.fit.lv!=='wrong'?alchOf(cm.m):'',st=parts.find(p=>p.s.id==='stabilizer');
    const P=pm?(pm.pot?potRank(pm.pot):Math.max(1,Math.ceil((pm.il||1)/5))):0,base=struc&&struc.m&&struc.fit.lv!=='wrong'?(struc.fit.lv==='good'?1:.5):0;
    out.potion={kind:B.potion,effect:useless?'Inert: the brew does nothing.':eff?eff.replace(/^(Drink|Brew|Coat|Burn|Salve):\s*/,''):(pm?'A mild tonic: no special effect (this reagent has no alchemy effect).':''),cat:cat?cat.replace(/^(Drink|Brew|Coat|Burn|Salve):\s*/,''):'',
      dc:8+Math.floor((pil||1)/3)+(base===1?1:0),dmg:`${Math.max(1,Math.ceil((pil||1)/3))}d6`,heal:`${2+Math.floor(((pil||1)-1)/2)}d6 + ${pil||1}`,
      shelf:(base?base===1?'a season':'a week':'a day')+(st&&st.m&&st.fit.lv!=='wrong'?', doubled by the stabilizer':''),unstable:struc&&struc.fit.lv==='poor'};
    if(pm)adds.push([prim.s.name,pm,useless?'nothing: wrong material':eff?'the effect: '+eff.slice(0,90)+(eff.length>90?'…':''):'no alchemy effect']);
    if(struc&&struc.m)adds.push([struc.s.name,struc.m,struc.fit.lv==='wrong'?'nothing: wrong material':struc.fit.lv==='good'?'a stable brew':'an unstable brew (on a 1 on a d6 it spoils when used)']);
    if(cm&&cm.m&&cat)adds.push([cm.s.name,cm.m,'adds at half strength: '+cat.slice(0,70)+(cat.length>70?'…':'')]);
  }
  if(B.ammo){const A=B.ammo,good=pok&&prim.fit.lv==='good',dv=A.light?10:A.heavy?4:5,dmg=useless||!pok?0:Math.floor(pil/(good?dv:dv*2)),pierce=A.pierce&&pok&&!useless?Math.max(1,Math.floor(pil/(good?8:12))):0;
    out.ammo={fits:A.fits,qty:A.qty,dmg,pierce};
    if(pm)adds.push([prim.s.name,pm,useless||!pok?'nothing: wrong material':(dmg?`+${dmg} damage per hit`:'no extra damage yet (Item Level too low)')+(pierce?`, a hit ignores ${pierce} AC`:'')+` · ${A.qty} for ${AMMO_FITS[A.fits]}`]);
    if(A.note)adds.push(['Shape',null,A.note])}
  const prof=B.potion?'Alchemy':B.focus?'Enchanting':(B.armor||B.shield)&&pm&&matCode(pm)==='F'?'Tailoring':pm&&['W','B','S'].includes(matCode(pm))?'Carving':'Blacksmithing';
  out.prof=prof;
  out.realmSpec=pm&&matCode(pm)==='O'&&/Hell|Heaven|Void/.test(pm.realm)?{Hell:'Infernal Forging',Heaven:'Celestial Metallurgy',Void:'Void Smithing','Inner Void':'Void Smithing'}[pm.realm]:'';
  out.rar=strongest?strongest.m.rar:'';
  out.name=main?FORGE.name||(pm?(pm.any?pm.label.replace(/^(a|an|the|some) /i,'').replace(/\b\w/g,ch=>ch.toUpperCase()):pm.n.replace(/ (Ore|Ingot|Bar)$/,''))+' '+baseName:baseName):baseName;
  return out;
}
// Which general Blueprint a vault Blueprint is an instance of: by its name first, then its category.
// the newer, more specific general Blueprints come first, so a katana is a Katana and not just a Longsword
const GEN_KEYS_NEW=[['Shovel',/shovel|\bspade\b/i],['Pickaxe',/pickaxe|pick-axe|mattock/i],['Sledgehammer',/sledge/i],['Pitchfork',/pitchfork|hayfork/i],['War Scythe',/war ?scythe/i],['Scythe',/scythe/i],['Felling Axe',/felling axe|woodcutter|lumber ?axe/i],['Cleaver',/cleaver/i],['Machete',/machete|\bbolo\b|parang/i],['Crowbar',/crowbar|pry ?bar/i],['Frying Pan',/frying pan|skillet/i],['Harpoon',/harpoon/i],
  ['Katana',/katana/i],['Wakizashi',/wakizashi/i],['Tanto',/tanto/i],['Odachi',/odachi|nodachi/i],['Claymore',/claymore/i],['Zweihander',/zweih[aä]nder/i],['Flamberge',/flamberge/i],['Bastard Sword',/bastard sword|hand-and-a-half/i],['Broadsword',/broadsword/i],['Falchion',/falchion/i],['Sabre',/sabre|saber/i],['Cutlass',/cutlass/i],['Khopesh',/khopesh/i],['Gladius',/gladius/i],['Estoc',/estoc/i],['Jian',/\bjian\b/i],['Dao',/\bdao\b/i],['Shotel',/shotel/i],['Kukri',/kukri|khukuri/i],['Main-gauche',/main[- ]gauche|parrying dagger/i],['Stiletto',/stiletto/i],['Throwing Knife',/throwing knife|throwing knives/i],
  ['Bardiche',/bardiche/i],['Double Axe',/double axe|double-bladed axe/i],['Tomahawk',/tomahawk/i],['Naginata',/naginata/i],['Guandao',/guandao/i],['Partisan',/partisan/i],['Billhook',/billhook|bill-hook/i],['Lucerne Hammer',/lucerne/i],['Hooked Spear',/hooked spear/i],
  ['Kanabo',/kanabo|tetsubo/i],['Spiked Club',/spiked club/i],['Macuahuitl',/macuahuitl/i],['Nunchaku',/nunchaku/i],['Tonfa',/tonfa/i],['Knuckledusters',/knuckle|cestus/i],['Katar',/katar/i],['Tiger Claws',/tiger claws?|bagh nakh/i],['Sai',/\bsai\b/i],['Meteor Hammer',/meteor hammer/i],['Kusarigama',/kusarigama/i],['Chain Whip',/chain whip/i],['Rope Dart',/rope dart/i],
  ['Composite Bow',/composite bow/i],['Recurve Bow',/recurve/i],['Greatbow',/great ?bow/i],['Repeating Crossbow',/repeating crossbow|chu-ko-nu/i],['Slingshot',/slingshot/i],['Staff Sling',/staff sling/i],['Atlatl',/atlatl/i],['Boomerang',/boomerang/i],['Chakram',/chakram/i],['Shuriken',/shuriken/i],['Bolas',/bolas/i],
  ['Scepter',/scepter|sceptre/i],['Rod',/\brod\b/i],['Tome',/\btome\b|grimoire/i],['Totem',/totem/i],['Holy Symbol',/holy symbol/i],['Crystal',/\bcrystal\b(?! ball)/i],['Lute',/\blute\b/i],['Flute',/^(?!.*pan ?flute).*flute/i],['Drum',/\bdrum\b/i],['Harp',/\bharp\b/i],['War Horn',/war ?horn|\bhorn$/i],['Lyre',/\blyre\b/i],['Viol',/\bviol\b|fiddle|violin/i],['Bagpipes',/bagpipe/i],['Pan Flute',/pan ?flute|pan ?pipes|syrinx/i],['Dulcimer',/dulcimer|zither/i],['Shawm',/shawm|oboe/i],['Chimes',/chimes?\b|\bbell$|handbells?/i]];
const GEN_KEYS=[...GEN_KEYS_NEW,['Greataxe',/great ?axe|war ?axe|bearded axe|dane axe/i],['Handaxe',/hand ?axe|hatchet|tomahawk|throwing axe/i],['Halberd',/halberd|bardiche|poleaxe|pole axe|voulge|lochaber|\bji\b/i],['Glaive',/glaive|naginata|guandao|scythe|bill\b|fauchard/i],
  ['Pike',/\bpike\b|sarissa/i],['Lance',/\blance\b/i],['Trident',/trident/i],['Javelin',/javelin|pilum|atlatl/i],['War Pick',/war ?pick|pickaxe|\bpick\b|hammer of war pick/i],['Maul',/\bmaul\b|great ?hammer|sledge/i],['Light Hammer',/light hammer|throwing hammer/i],
  ['Morningstar',/morning ?star|holy water sprinkler/i],['Flail',/flail|nunchaku|chain/i],['Mace',/mace|club of|cudgel|scepter|sceptre/i],['Greatclub',/great ?club|tetsubo|kanabo/i],['Club',/\bclub\b|baton|shillelagh/i],
  ['Greatsword',/great ?sword|claymore|zweihander|flamberge|nodachi|odachi|two-hand(ed)? sword|executioner/i],['Rapier',/rapier|estoc|epee|smallsword/i],['Scimitar',/scimitar|sabre|saber|shamshir|tulwar|falchion|cutlass|khopesh|talwar/i],
  ['Shortsword',/short ?sword|gladius|wakizashi|seax|xiphos|kopis|machete|sai\b/i],['Longsword',/long ?sword|katana|broadsword|bastard sword|arming sword|blade|sword/i],['Sickle',/sickle|kama|karambit/i],['Dagger',/dagger|knife|dirk|stiletto|kris|tanto|kunai|shiv|athame/i],
  ['Whip',/whip|lash/i],['Heavy Crossbow',/heavy crossbow|arbalest|ballista/i],['Hand Crossbow',/hand crossbow/i],['Light Crossbow',/crossbow/i],['Longbow',/long ?bow|warbow|yumi/i],['Shortbow',/short ?bow|horse ?bow|recurve|composite bow/i],['Blowgun',/blowgun|blowpipe/i],['Sling',/\bsling\b|slingshot/i],['Dart',/\bdart|shuriken/i],['Net',/\bnet\b/i],
  ['Tower Shield',/tower|pavise|scutum|wall shield/i],['Buckler',/buckler|targe|parma/i],['Wand',/\bwand\b|rod\b/i],['Orb',/\borb\b|crystal ball|sphere/i],['Ring',/\bring\b|band of/i],['Amulet',/amulet|pendant|talisman|necklace|locket|charm|focus/i],['Quarterstaff',/quarterstaff|\bbo staff|jo staff/i],['Staff',/\bstaff\b|stave/i],
  ['Helm',/helm|helmet|\bcap\b|hood|coif|crown|circlet|mask|visor/i],['Gauntlets',/gauntlet|glove|bracer|vambrace|mitt/i],['Boots',/boot|greave|sabaton|shoe|sandal/i],['Pauldrons',/pauldron|spaulder|epaulet/i],['Cloak',/cloak|cape|mantle|shroud/i],['Barding',/barding/i]];
const GEN_CAT={Axe:'Battleaxe',Sword:'Longsword',Dagger:'Dagger',Hammer:'Warhammer',Spear:'Spear',Bow:'Shortbow',Staff:'Quarterstaff',Shield:'Shield'};
const GEN_SLOT={Head:'Helm',Body:'Cuirass',Hands:'Gauntlets',Feet:'Boots',Shoulders:'Pauldrons',Back:'Cloak',Mount:'Barding',Enhancement:null};
const WEAPON_CATS=['Axe','Sword','Dagger','Hammer','Spear','Bow','Staff'];
function genOf(b){
  if(b._gen!==undefined)return b._gen;
  // the build re-filed many vault Blueprints (cat0 is where the vault had them): which template one is follows the vault's filing
  if(b.cat0!=null&&!b._g0){const c=b.cat;b._g0=1;b.cat=b.cat0;try{return genOf(b)}finally{b.cat=c;delete b._g0}}
  let g=null;
  if(b.cat==='Armor')g=GEN_SLOT[b.slot]===undefined?'Cuirass':GEN_SLOT[b.slot];
  else if(b.cat==='Shield')g=/pavise/i.test(b.n)?'Pavise':/tower|scutum|wall|bastion/i.test(b.n)?'Tower Shield':/\btarge\b/i.test(b.n)?'Targe':/buckler|parma/i.test(b.n)?'Buckler':/round shield/i.test(b.n)?'Round Shield':/kite shield/i.test(b.n)?'Kite Shield':/heater/i.test(b.n)?'Heater Shield':'Shield';
  // tools and instruments that have a general Blueprint of their own (a shovel, a pickaxe, a lute)
  else if(b.cat==='Tool'||b.cat==='Instrument'){const k=GEN_KEYS_NEW.find(([n,rx])=>rx.test(b.n)&&BASES[n]&&(BASES[n].group==='Tools and farm weapons'||BASES[n].cat==='Instrument'));g=k?k[0]:null}
  else if(WEAPON_CATS.includes(b.cat)||b.cat==='Artifact'||b.cat==='Focus'){const k=GEN_KEYS.find(([n,rx])=>rx.test(b.n)&&!['Helm','Gauntlets','Boots','Pauldrons','Cloak','Barding','Tower Shield','Buckler'].includes(n));g=k?k[0]:b.cat==='Artifact'||b.cat==='Focus'?null:GEN_CAT[b.cat];
    if((b.cat==='Artifact'||b.cat==='Focus')&&g&&!BASES[g].focus&&!/weapon|blade|sword|axe|dagger|spear|bow|hammer|whip|net|dart|sling/i.test(b.n))g=null}
  return b._gen=g&&BASES[g]?g:null;
}
// Fill a general Blueprint's parts from a list of materials: best fit first, in part order.
function assignParts(base,mats){
  const B=BASES[base],parts={},left=mats.slice();
  B.slots.forEach(s=>{const rank=lv=>left.findIndex(m=>slotFit(s,m).lv===lv);let j=rank('good');if(j<0)j=rank('poor');if(j<0&&!s.optional&&left.length&&s.role==='primary')j=0;if(j>=0){parts[s.id]=left[j].n;left.splice(j,1)}});
  return parts;
}
const CAT_TO_BASE=GEN_CAT;
function openInForge(b){
  const base=genOf(b)||'Amulet';
  FORGE={base,parts:assignParts(base,b.mats.map(findMat).filter(Boolean)),name:b.n,showAll:false,realm:FORGE.realm||''};saveForge();closeAll();go('forge');
}
const BP_BY_GEN=()=>{if(!BP_BY_GEN.m){BP_BY_GEN.m=new Map();BPS.forEach(b=>{const g=genOf(b);if(g){if(!BP_BY_GEN.m.has(g))BP_BY_GEN.m.set(g,[]);BP_BY_GEN.m.get(g).push(b)}})}return BP_BY_GEN.m};
function forgeSuggest(s){
  const realm=FORGE.realm,taken=new Set(Object.values(FORGE.parts).map(lc));
  const pool=invMats(invIndex()).filter(m=>(!realm||m.realm===realm)&&!taken.has(lc(m.n))&&slotFit(s,m).lv==='good').sort((a,b)=>(!!a.gen-!!b.gen)||(a.g||0)-(b.g||0)||(a.price||0)-(b.price||0)||byName(a,b));
  // a few from each accepted category, cheapest first, so every option shows
  const by=s.ok.map(c=>pool.filter(m=>matCode(m)===c)),out=[];
  for(let i=0;out.length<6&&i<6;i++)by.forEach(l=>{if(l[i]&&out.length<6)out.push(l[i])});
  return out;
}
// Material comparison: up to four materials side by side (picked from any material page), shown on the Forge.
function cmpList(){return store.get('cmp',[]).map(findMat).filter(Boolean)}
function cmpToggle(n){let c=store.get('cmp',[]);if(c.includes(n))c=c.filter(x=>x!==n);else{c.push(n);if(c.length>4)c.shift()}store.set('cmp',c);toast(c.includes(n)?`Comparing ${c.length} material${c.length>1?'s':''}: see the Forge`:'Removed from comparison')}
function compareHTML(){
  const L=cmpList();if(!L.length)return '';
  const fitFor=m=>{const B=BASES[FORGE.base];return B.slots.map(s=>{const f=slotFit(s,m);return f.lv==='good'?`✓ ${s.name}`:f.lv==='poor'?`△ ${s.name}`:''}).filter(Boolean).join(', ')||'✕ no part'};
  const rows=[['Realm · grade',m=>esc(m.gr)],['Category',m=>esc(CAT_NAME[matCode(m)]||'')],['Item Level',m=>m.il||1],['Rarity',m=>esc(m.rar||'')],['Property',m=>m.pn?`<b>${esc(m.pn)}</b>${m.pot?' · Potency '+m.pot:''}<br><small>${esc((m.prop||'').replace(/^[^:]+:\s*/,''))}</small>`:'—'],['Unique trait',m=>m.tr?`<b style="color:var(--gold2)">◆ ${esc(m.tr.n)}</b><br><small>${esc(m.tr.t)}</small>`:'—'],['Armor weight',m=>ARMOR_WEIGHT[matCode(m)]||'Light'],[`Fits in a ${esc(FORGE.base)}`,fitFor],['Price',m=>m.price?gp(m.price):'not sold']];
  return `<section class="sec" id="cmp"><div class="sec-h"><h3>Comparing materials</h3><p>Add up to four from any material's page (⚖ Compare).</p><button class="btn" style="margin-left:auto" onclick="store.set('cmp',[]);renderForge()">Clear</button></div><div class="tablewrap"><table class="t"><thead><tr><th></th>${L.map(m=>`<th><a href="#" data-ref="${ref(m)}">${esc(m.n)}</a> <span style="cursor:pointer;color:var(--muted)" onclick="cmpToggle(${esc(JSON.stringify(m.n))});renderForge()" title="Remove">✕</span></th>`).join('')}</tr></thead><tbody>${rows.map(([l,f])=>`<tr><td style="white-space:nowrap;color:var(--muted)">${l}</td>${L.map(m=>`<td>${f(m)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
// One search bar for every general Blueprint: it matches the name, the group, the category, and the properties (so
// "two-handed", "thrown", "farm", or "focus" work), and with nothing typed it shows the design being made plus a fold
// with every template.
const baseHay=(n,b)=>lc([n,b.group,b.cat,b.props||'',b.slot||'',b.kind||'',b.focus?'focus spellcasting':'',b.armor?'armor':'',b.shield?'shield':'',b.dmg?'weapon '+b.dmg.join(' '):''].join(' '));
function baseChip(k,b,byGen){return `<button class="chip" style="padding:5px 11px${k===FORGE.base?';border-color:var(--gold);background:var(--goldbg);color:var(--text)':''}" data-base="${esc(k)}" title="${esc(b.group+(b.dmg?' · '+b.dmg.join(' '):'')+(b.props?' · '+b.props:''))}">${b.icon} ${esc(k)}${byGen.get(k)?` <small>${byGen.get(k).length}</small>`:''}</button>`}
function forgeBaseList(q){const byGen=BP_BY_GEN(),row=(gr,items)=>`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0"><span style="width:130px;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">${esc(gr)}</span>${items.map(([k,b])=>baseChip(k,b,byGen)).join('')}</div>`;
  if(q){const ws=q.split(/\s+/).filter(Boolean),hits=GEN.filter(([n,b])=>{const h=baseHay(n,b);return ws.every(w=>h.includes(w))}).sort((a,b)=>(lc(b[0]).startsWith(q)-lc(a[0]).startsWith(q))||a[0].localeCompare(b[0]));
    return hits.length?`<div class="note" style="margin:0 0 4px">${hits.length} template${hits.length>1?'s':''} match “${esc(q)}”.</div>`+BASE_GROUPS.map(gr=>{const it=hits.filter(([,b])=>b.group===gr);return it.length?row(gr,it):''}).join(''):`<div class="note" style="margin:0">No template matches “${esc(q)}”. Try a weapon type (sword, bow), a property (two-handed, thrown), or a group (armor, focus).</div>`}
  const cur=BASES[FORGE.base];
  return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="note" style="margin:0">Making:</span>${baseChip(FORGE.base,cur,byGen)}<span class="note" style="margin:0">${esc(cur.group)} · type above to find another</span></div><details class="fold" style="margin-top:6px"><summary>Browse all ${GEN.length} templates</summary>${BASE_GROUPS.map(gr=>row(gr,GEN.filter(([,b])=>b.group===gr))).join('')}</details>`}
function forgeFormsHTML(){const r=forgeResult(),n=r.forms||0,W=GEN.filter(([,b])=>b.dmg).map(([k])=>k);
  if(!n)return `<div class="note" style="margin:0;color:var(--acc)">⟳ Put an Everchanging Substance in the core to unlock this weapon's other forms.</div>`;
  FORGE.everForms=(FORGE.everForms||[]).slice(0,n-1);const res=everResults(n);
  return `<datalist id="dl-fg-weapons">${W.map(k=>`<option value="${esc(k)}">${esc(BASES[k].group+' · '+BASES[k].dmg.join(' '))}</option>`).join('')}</datalist>
  <div style="border:1px solid var(--acc);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:10px"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b>⟳ Forms (${n})</b><span class="note" style="margin:0">Form 1 is the ${esc(FORGE.base)} above. Choose a weapon template for each other form.</span></div>
  ${Array.from({length:n-1},(_,i)=>{const x=res[i],f=(FORGE.everForms[i]||{});return `<div style="border-top:1px solid var(--line);padding-top:8px"><div class="keyrow"><b style="white-space:nowrap">Form ${i+2}</b><input class="sel" data-ever-base="${i}" list="dl-fg-weapons" value="${esc(f.base||'')}" placeholder="Search a weapon template (spear, katana, shovel…)" style="flex:1;max-width:none">${f.base?`<button class="btn" data-ever-clear="${i}" title="Remove this form">✕</button>`:''}</div>
    ${x?`<div class="note" style="margin:4px 0">${BASES[f.base].icon} ${esc(f.base)} · <span class="mono">${esc(x.r.damage||'')}</span> ${esc(x.r.dtype||'')}${x.r.attack!=null?' · attack '+(x.r.attack>=0?'+':'')+x.r.attack:''}${BASES[f.base].props?' · '+esc(BASES[f.base].props):''}</div>
      ${x.r.parts.map(p=>{const k='fe:'+i+':'+p.s.id,carried=x.e.from[p.s.id],col={good:'var(--green)',poor:'var(--gold2)',wrong:'var(--red)',missing:'var(--red)',empty:'var(--muted)'}[p.fit.lv],okc=[...p.s.ok,...(p.s.weak||[])];MC_OPTS[k]=forgeDM()?{opts:MATS.filter(m=>FORGE.showAll||okc.includes(matCode(m))),slot:p.s,arts:artifacts(),any:true}:{opts:invMats(invIndex()).filter(m=>FORGE.showAll||okc.includes(matCode(m))),slot:p.s,arts:invArts(invIndex()),inv:true};// the DM's forge: any material, artifact, or thing, as in the main weapon's parts
        return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0"><span style="min-width:120px"><b>${esc(p.s.name)}</b> <small style="color:var(--muted)">${p.s.role==='primary'?'main':p.s.role==='structure'?'structure':'extra'}${p.s.optional?', optional':''}</small></span>${carried&&!x.e.own[p.s.id]?`<span style="color:var(--green);font-size:.85rem">✓ ${esc(p.m.n)} carries over from the ${esc(carried.toLowerCase())}</span>`:`<span style="flex:1;min-width:200px">${mcHTML(k,x.e.own[p.s.id]||'',p.s.optional?'Optional: add a material…':'Add a material for this part…')}</span>`}${x.e.own[p.s.id]?`<button class="btn" data-ever-rm="${i}:${p.s.id}" title="Clear">✕</button>`:''}${p.m&&p.m.any?`<small style="color:var(--gold2)">🎲 ${esc(p.m.ds.replace(/^Made from /,'').replace(/, by the DM's word\.$/,''))}</small>`:''}<small style="color:${col};font-weight:600">${p.m?({good:'✓ good',poor:'△ poor',wrong:'✕ wrong'})[p.fit.lv]||'':p.s.optional?'':'needs a material'}</small></div>`}).join('')}
      ${x.missing.length?`<div class="note" style="margin:2px 0 0;color:var(--red)">No material in the weapon fits ${x.missing.map(esc).join(', ').toLowerCase()}: add one for this form.</div>`:''}`:f.base?`<div class="note" style="color:var(--red)">“${esc(f.base)}” is not a weapon template.</div>`:''}</div>`}).join('')}</div>`}
// the shortcut bar under the Forge's title: a link to each part of the page (built from what is on it), and the part in
// view lit up as you scroll
function forgeJump(){const P=document.querySelector('.page.forge');if(!P)return;const old=P.querySelector('.fg-jump');if(old)old.remove();
  const T=[];const add=(el,l)=>{if(el){el.id=el.id||'fgj-'+T.length;T.push([el,l])}};
  add(P.querySelector(':scope>.panel:not(details):not(#gk)'),'⚒ Design');add(P.querySelector(':scope>#gk'),'🔮 Mystic Forge');add(P.querySelector(':scope>.cols'),'🔨 Parts & anvil');
  P.querySelectorAll(':scope>section.sec:not([hidden])').forEach(s=>{const h=s.querySelector('h3');if(h)add(s,h.textContent.trim().replace(/^(.{0,26}).*$/,(m,a)=>a.length<h.textContent.trim().length?a.trim()+'…':a))});
  if(T.length<2)return;const bar=document.createElement('nav');bar.className='fg-jump';bar.setAttribute('aria-label','Parts of the Forge');
  bar.innerHTML=T.map(([el,l])=>`<a href="#${el.id}" data-fgj="${el.id}">${esc(l)}</a>`).join('');
  bar.onclick=e=>{const a=e.target.closest('[data-fgj]');if(!a)return;e.preventDefault();bar.dataset.pick=a.dataset.fgj;const t=document.getElementById(a.dataset.fgj);if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
  const at=P.querySelector(':scope>details.panel')||P.querySelector(':scope>.fg-hero').nextElementSibling;P.insertBefore(bar,at);
  const C=$('content');if(!C._fgj){C._fgj=1;C.addEventListener('scroll',()=>{if(TAB!=='forge')return;cancelAnimationFrame(C._fgr);C._fgr=requestAnimationFrame(forgeJumpLit)},{passive:true})}forgeJumpLit()}
function forgeJumpLit(){const B=document.querySelector('.fg-jump');if(!B)return;const top=$('content').getBoundingClientRect().top+80;let cur=null;
  B.querySelectorAll('[data-fgj]').forEach(a=>{const t=document.getElementById(a.dataset.fgj);if(t&&t.getBoundingClientRect().top<=top)cur=a});
  // at the bottom of the page a late part can't scroll up to the bar: light the shortcut that was clicked
  const C=$('content'),pk=B.dataset.pick&&B.querySelector('[data-fgj="'+B.dataset.pick+'"]');if(pk&&C.scrollTop+C.clientHeight>=C.scrollHeight-4)cur=pk;
  B.querySelectorAll('.on').forEach(a=>a.classList.remove('on'));if(cur){cur.classList.add('on');const bl=B.getBoundingClientRect(),r=cur.getBoundingClientRect();if(r.left<bl.left||r.right>bl.right)B.scrollLeft+=r.left-bl.left-20}}
// Players get the Forge's planning view: pick a design, fill its parts from their pack, see how hard it is in words.
// The DM (who has entered the DM code) gets the full Forge: hired smiths, the odds, the smelter, commissions, and the roll.
function fgUnlockForm(){const box=$('fg-lock');if(!box)return;box.innerHTML=quickModes().length&&!PAT_SKIP&&window.crypto&&crypto.subtle?patLockHTML('renderForge'):hcLockHTML();if($('hc-pat')||$('hc-pin'))patLockBind(renderForge);else hcBindLock(renderForge)}
function renderForge(){const FULL=dmUnlocked();if(!FULL&&!renderForge._auto){renderForge._auto=1;hcAuto().then(()=>{if(dmUnlocked()&&TAB==='forge')renderForge()}).catch(()=>{})}
  const B=BASES[FORGE.base],q=lc((FORGE.find||'').trim()),byGen=BP_BY_GEN();
  const INV=invIndex(),invN=invMats(INV).length;
  $('content').innerHTML=`<div class="page forge">${datalists()}<div class="fg-bgwrap" aria-hidden="true"><canvas id="fg-fx"></canvas></div>
    <div class="fg-hero"><div class="fg-hero-t"><span class="fg-hell">🔥 The Hell Forge</span><span class="fg-heaven">☀ The Heaven Forge</span></div><div class="fg-hero-sub"><span class="fg-hell">Hellfire and brimstone: the dark-mode forge</span><span class="fg-heaven">Sunlight and gold: the light-mode forge</span></div><p>Bring your party's materials to the anvil. Choose a design, set a material in each part, and see how high the item will reach and what forge it needs. Strike three times, and if the roll holds, the item is yours: only then is it fully revealed.</p>
      <div class="fg-hero-s"><span>🧺 ${invN} kind${invN===1?'':'s'} of material in the party's packs</span><span>⚒ ${PARTY.filter(c=>c.prof||c.prof2).length} crafter${PARTY.filter(c=>c.prof||c.prof2).length===1?'':'s'}</span><span>📜 ${DESIGNS.filter(d=>d.forged).length} forged so far</span></div></div>
    ${invN?'':`<div class="callout" style="border-color:var(--gold)">The party's inventories hold no materials yet. Materials come only from your characters' packs: add them on the <a href="${pageUrl('party')}" data-go="party">Party page</a> or the character sheet, or bring them back from a hunt.</div>`}
    ${FULL&&forgeDMok()?`<div class="callout fg-dmbar" style="margin-bottom:14px;border-color:var(--acc);display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>🎲 DM forge</b><div class="seg" role="group" aria-label="Forge mode"><button type="button" class="${forgeDM()?'':'on'}" aria-pressed="${!forgeDM()}" onclick="FORGE.dm=false;saveForge();renderForge()">Normal forge</button><button type="button" class="${forgeDM()?'on':''}" aria-pressed="${forgeDM()}" onclick="FORGE.dm=true;saveForge();renderForge()">DM forge</button></div><span class="note" style="margin:0">${forgeDM()?'Making equipment out of anything: any material or made-up thing in any part, any quality, no roll, nothing taken from the packs.':'Switch on to create equipment for the table out of anything, with no roll.'}</span></div>`:''}
    ${FULL?'':`<div class="callout fg-pv" style="margin-bottom:14px;border-color:var(--gold)"><b>🔒 Player view.</b> Plan your item here: choose a design and fill its parts from your pack. The DM opens the full Forge with the DM code, hires smiths, sees the odds, calls for your roll, and can make equipment out of anything in the DM forge. <span id="fg-lock"><button class="btn" type="button" style="margin-left:6px;padding:3px 10px" onclick="fgUnlockForm()">I'm the DM</button></span></div>`}
    <details class="panel" style="margin-bottom:14px"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700">How the Forge works</summary><p class="note" style="margin:8px 0 0">Every Blueprint is a general design: an Axe, a Longsword, a Helm. Choose the material for each part (the head, the haft, the grip) and the finished item takes something from each: the main part sets the damage or AC, the structure sets the Accuracy and how well it holds together, and every part adds its property and trait. Each part only takes certain kinds of material; the wrong kind brings heavy penalties, and a wrong main part makes the item useless.</p>
      <details class="fold" style="margin-top:8px"><summary style="cursor:pointer">The quirk table (d100, rolled when an item is forged)</summary><div class="tablewrap" style="margin-top:6px"><table class="t"><thead><tr><th class="num">d100</th><th>Quirk</th><th>What it does</th></tr></thead><tbody><tr><td class="num">1–40</td><td>None</td><td>Nothing unusual happens.</td></tr>${FQUIRKS.map(q=>`<tr><td class="num">${q[0]}–${q[1]}</td><td><b>${esc(q[2])}</b></td><td>${esc(q[3]||'A god marks it with their sign: once per long rest, add 1d6 to a roll that fits that god\'s Runes, and the god now knows the smith\'s name.')}</td></tr>`).join('')}</tbody></table></div></details></details>
    <div class="panel" style="margin-bottom:14px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><b style="font-family:var(--serif)">General Blueprints</b><input class="sel" id="fg-find" type="search" placeholder="Search ${GEN.length} templates: shovel, katana, robe, lute…" value="${esc(FORGE.find||'')}" style="flex:1;min-width:220px;max-width:none"><span class="note" style="margin:0">${fmt([...byGen.values()].reduce((a,x)=>a+x.length,0))} vault Blueprints are versions of them.</span></div>
      <div id="fg-bases">${forgeBaseList(q)}</div>
    </div>
    ${groqPanel()}
    ${compareHTML()}
    <div class="cols" style="align-items:start">
      <div class="panel" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><h4 style="font-size:1.15rem;margin:0">${B.icon} ${esc(FORGE.base)}</h4><span class="note" style="margin:0">${esc(B.group)}${B.dmg?` · ${esc(B.dmg[0])} ${esc(B.dmg[1])}`:''}${B.props?` · ${esc(B.props)}`:''}${B.armor?` · ${esc(B.slot)} slot`:''}</span></div>
        ${forgeDMok()?`<div class="callout" style="margin:0;border-color:var(--acc)"><label class="note" style="display:flex;gap:8px;align-items:center;margin:0"><input type="checkbox" ${forgeDM()?'checked':''} onchange="FORGE.dm=this.checked;saveForge();renderForge()"> <b>🎲 DM forge: make it out of anything</b></label>
          ${forgeDM()?`<div class="note" style="margin:6px 0 0">Any vault material or artifact goes in any part, nothing comes from the packs, and there is no roll. Type anything that isn't a material (a chair leg, the king's crown, a dragon's last breath) and it becomes one; start with <b>!</b> to keep exactly what you typed. Made-up materials count as a good fit at item level <input type="number" min="1" max="50" value="${+FORGE.dmLv||1}" style="width:56px" onchange="FORGE.dmLv=Math.max(1,Math.min(50,+this.value||1));saveForge();renderForge()">.</div>`:''}</div>`:''}
        <label class="note" style="margin:0">Suggest materials from <select class="sel" id="fg-realm"><option value="">Every realm</option>${REALMS.map(r=>`<option${r.n===FORGE.realm?' selected':''}>${esc(r.n)}</option>`).join('')}</select></label>
        ${B.dmg?`<label class="chk" style="display:flex;gap:8px;align-items:flex-start;margin:0;padding:8px 10px;border:1px dashed var(--acc);border-radius:8px"><input type="checkbox" id="fg-ever" ${forgeEver()?'checked':''} style="margin-top:3px"><span><b>⟳ Everchanging weapon</b><br><small style="color:var(--text2)">It can change between weapon forms as a bonus action. Needs an Everchanging Substance (from a mimic, doppelganger, werewolf, or another shapechanger) in its core: one extra form for each realm of its grade (a Human grade gives 1 extra form, Mysterious 2, Hell or Heaven 3, and so on). Then choose a weapon template for each extra form; materials already in the weapon carry over where they fit, and you add a material for any part they can't fill.</small></span></label>`:''}
        ${forgeSlots(B,forgeEver()).map(s=>{const m=findMat(FORGE.parts[s.id]||''),f=slotFit(s,m);const col={good:'var(--green)',poor:'var(--gold2)',wrong:'var(--red)',missing:'var(--muted)',empty:'var(--muted)'}[f.lv];
          const lab={good:'✓ Good fit',poor:'△ Poor fit',wrong:'✕ Wrong material',missing:'Required',empty:'Optional'}[f.lv];
          const okCats=[...s.ok,...(s.weak||[])];const opts=(forgeDM()?MATS:invMats(INV)).filter(x=>FORGE.showAll||okCats.includes(matCode(x))&&(!s.only||s.only.test(x.n)));
          const sug=m?[]:forgeSuggest(s);
          return `<div style="border:1px solid ${f.lv==='wrong'?'var(--red)':f.lv==='good'?'color-mix(in srgb,var(--green) 45%,var(--line))':'var(--line)'};border-radius:8px;padding:10px 12px">
            <div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b>${esc(s.name)}</b><span class="b ghost">${s.role==='primary'?'main part':s.role==='structure'?'structure':'extra'}</span><span class="b ghost">× ${s.qty}</span><span style="margin-left:auto;font-size:.78rem;color:${col};font-weight:600">${lab}</span></div>
            <div class="note" style="margin:4px 0 6px">${esc(s.why)}<br><span style="color:var(--green)">Good:</span> ${s.ok.map(c=>CAT_NAME[c]).join(', ')}${(s.weak||[]).length?` · <span style="color:var(--gold2)">Poor:</span> ${s.weak.map(c=>CAT_NAME[c]).join(', ')}`:''} · <span style="color:var(--red)">Anything else is wrong.</span></div>
            <div class="keyrow">${mcHTML('fg:'+s.id,FORGE.parts[s.id]||'','Choose or type a material…')}<button class="btn" data-clear-slot="${s.id}" title="Clear">✕</button></div>
            
            ${(MC_OPTS['fg:'+s.id]=forgeDM()?{opts,slot:s,arts:s.only?[]:artifacts(),any:true}:{opts,slot:s,arts:s.only?[]:invArts(INV),inv:true,hold:n=>holdersText(INV,n)},'')}
            ${forgeDM()?(m&&m.any?`<div style="margin-top:4px;font-size:.78rem;color:var(--gold2)">🎲 Made from ${esc(m.ds.replace(/^Made from /,'').replace(/, by the DM's word\.$/,''))}: counts as ${esc(CAT_NAME[m.tc]||'')}, a good fit, item level ${m.il}.</div>`:''):m&&!invHas(INV,m.n)?`<div style="margin-top:6px;font-size:.8rem;color:var(--red)">✕ Nobody in the party has ${esc(m.art?'the artifact '+m.art:m.n)}. Choose a material from someone's pack.</div>`:m?`<div style="margin-top:4px;font-size:.78rem;color:var(--muted)">In the packs of ${esc(holdersText(INV,m.n))}</div>`:''}
            ${sug.length?`<div class="chips" style="margin-top:6px">${sug.map(x=>`<button class="chip" data-pick="${s.id}" data-mat="${esc(x.n)}" title="${esc(x.gr)}">${esc(x.n)} <small>${esc(x.gr)}</small></button>`).join('')}</div>`:''}
            ${m&&m.art?`<div style="margin-top:6px;font-size:.8rem;color:var(--text2)">⟡ Broken down from the artifact ${refChip(BP_IDX.get(lc(m.art))||m,esc(m.art))}: counts as <b>${esc(m.baseN)}</b> (${esc(m.gr)} · Item Level ${m.il||1} · ${esc(CAT_NAME[matCode(m)]||'')}) and passes on one of its ${m.tr?'traits':'properties'} at random: <b>${m.tr?'◆ '+esc(m.tr.n):'✧ '+esc(m.pn)}</b>. The artifact is used up.</div>`:m?`<div style="margin-top:6px;font-size:.8rem;color:var(--text2)">${refChip(m)} ${esc(m.gr)} · Item Level ${m.il||1} · ${esc(CAT_NAME[matCode(m)]||'')}${m.pn?' · ✧ '+esc(m.pn):''}${m.tr?' · ◆ '+esc(m.tr.n):''}</div>`:''}
            ${f.lv==='wrong'||f.lv==='poor'?`<div style="margin-top:6px;font-size:.8rem;color:${col}">${f.why?`<b>${esc(f.why)}</b> `:''}${esc(PENALTY[s.role][f.lv])}</div>`:''}</div>`}).join('')}
        ${forgeEver()?forgeFormsHTML():''}
        <label class="note" style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" id="fg-all" ${FORGE.showAll?'checked':''}> List every material in the packs, including ones that don't fit (to see the penalties)</label>
      </div>
      <div id="fg-out"></div>
    </div>
    <div class="callout" style="margin:14px 0;border-color:var(--gold)">🏛 Blueprints players have forged and shared are in <a href="${pageUrl('workshop')}" data-go="workshop"><b>the Workshop</b></a>.</div>
    ${forgeExtrasHTML()}
    ${byGen.get(FORGE.base)?`<section class="sec"><div class="sec-h"><h3>${esc(FORGE.base)} Blueprints in the vault</h3><p>${byGen.get(FORGE.base).length} named versions of this design. Open one to load its materials here.</p></div><div class="chips">${byGen.get(FORGE.base).slice(0,40).map(b=>`<button class="chip" data-load-bp="${esc(b.n)}">${esc(b.n)} <small>Lv ${b.lv}</small></button>`).join('')}${byGen.get(FORGE.base).length>40?`<button class="chip" data-go="blueprints" data-setup='${esc(JSON.stringify({f:{gen:FORGE.base}}))}'>All ${byGen.get(FORGE.base).length} →</button>`:''}</div></section>`:''}
    ${DESIGNS.length?`<section class="sec"><div class="sec-h"><h3>Saved designs</h3><p>${DESIGNS.length} on this device. They can be equipped on the Party page.</p></div><div class="chips">${DESIGNS.map((d,i)=>`<span class="chip" style="padding:5px 10px"><a href="#" onclick="loadDesign(${i});return false" style="color:var(--text);text-decoration:none"><b>${esc(d.n)}</b></a> <small>${esc(d.base)}${d.ac!=null?' · AC '+d.ac:''}${d.dmg?' · '+esc(d.dmg):''}</small> <span style="cursor:pointer" onclick="designDelete(${i})" title="Delete">✕</span></span>`).join('')}</div></section>`:''}
  </div>`;
  const C=$('content');
  const pickBase=k=>{const nb=BASES[k];const keep=FORGE.parts;FORGE.base=k;FORGE.parts=assignParts(FORGE.base,Object.values(keep).map(findMat).filter(Boolean).filter(m=>nb.slots.some(sl=>slotFit(sl,m).lv==='good')));if(!nb.dmg)FORGE.ever=false;FORGE.name='';saveForge();renderForge();if(innerWidth<=900){const w=document.querySelector('#content .cols');if(w)w.scrollIntoView({block:'start'})}};
  C.querySelectorAll('[data-base]').forEach(el=>el.onclick=()=>pickBase(el.dataset.base));
  mcBind(C,(key,v)=>{if(key.startsWith('fe:')){const [,i,id]=key.split(':'),f=(FORGE.everForms=FORGE.everForms||[])[+i]=FORGE.everForms[+i]||{parts:{}};f.parts=f.parts||{};if(v)f.parts[id]=v;else delete f.parts[id];saveForge();setTimeout(renderForge);return}
    const id=key.slice(3);if(v)FORGE.parts[id]=v;else delete FORGE.parts[id];FORGE.name='';FORGE.lore='';saveForge();setTimeout(renderForge)});
  if($('fg-ever'))$('fg-ever').onchange=e=>{FORGE.ever=e.target.checked;saveForge();renderForge()};
  C.querySelectorAll('[data-ever-base]').forEach(el=>el.onchange=()=>{const i=+el.dataset.everBase,v=el.value.trim(),k=Object.keys(BASES).find(n=>lc(n)===lc(v));FORGE.everForms=FORGE.everForms||[];FORGE.everForms[i]={base:k&&BASES[k].dmg?k:v,parts:{}};saveForge();setTimeout(renderForge)});
  C.querySelectorAll('[data-ever-clear]').forEach(el=>el.onclick=()=>{FORGE.everForms[+el.dataset.everClear]={};saveForge();renderForge()});
  C.querySelectorAll('[data-ever-rm]').forEach(el=>el.onclick=()=>{const [i,id]=el.dataset.everRm.split(':');delete ((FORGE.everForms[+i]||{}).parts||{})[id];saveForge();renderForge()});
  C.querySelectorAll('[data-clear-slot]').forEach(el=>el.addEventListener('click',()=>{delete FORGE.parts[el.dataset.clearSlot];saveForge();renderForge()}));
  C.querySelectorAll('[data-pick]').forEach(el=>el.addEventListener('click',()=>{FORGE.parts[el.dataset.pick]=el.dataset.mat;FORGE.name='';saveForge();renderForge()}));
  C.querySelectorAll('[data-load-bp]').forEach(el=>el.addEventListener('click',()=>{const b=findBP(el.dataset.loadBp);if(b){FORGE.parts=assignParts(FORGE.base,b.mats.map(findMat).filter(Boolean));FORGE.name=b.n;saveForge();renderForge();$('content').scrollTop=0}}));
  const bindBases=()=>C.querySelectorAll('#fg-bases [data-base]').forEach(el=>el.onclick=()=>pickBase(el.dataset.base));
  $('fg-find').oninput=e=>{FORGE.find=e.target.value;saveForge();$('fg-bases').innerHTML=forgeBaseList(lc(FORGE.find.trim()));bindBases()};
  $('fg-all').onchange=e=>{FORGE.showAll=e.target.checked;saveForge();setTimeout(renderForge)};
  $('fg-realm').onchange=e=>{FORGE.realm=e.target.value;saveForge();renderForge()};
  bindGroq();
  forgeJump();
  forgeOut();
  forgeFx();
  if(!HC&&!renderForge._hc){renderForge._hc=1;hcAuto().then(()=>{if(HC&&TAB==='forge')renderForge()}).catch(()=>{})}
}
// ════════════════════════════════════════════════════════════════
//  Forging for real: a crafter (or a hired master smith) rolls against the design's DC, the margin sets its
//  quality, a quirk may take hold, and the finished item goes onto the character's gear with its materials used.
//  A forged item is its own design record (d.forged), so its quality, rune sockets, and growth stay with it.
// ════════════════════════════════════════════════════════════════
const FQ=[['Flawed','−1 Accuracy (armor and shields: −1 AC), and it breaks on a natural 1.',-1,0],['Standard','Made just as designed.',0,0],
  ['Fine','+1 Accuracy (armor and shields: +1 AC).',1,0],['Masterwork','+1 Accuracy and +1 damage (armor and shields: +1 AC), and one more rune socket.',1,1]];
const fqOf=n=>FQ.find(q=>q[0]===n)||FQ[1];
// the quirk table (d100): on 40 or less nothing happens; above that, small oddities are common, real boons rarer, and a
// god's notice rarest. A few quirks are mixed blessings.
const FQUIRKS=[[41,43,'Maker\'s mark','The smith\'s mark glows faintly when its maker is near, and anyone who knows the smith can tell who made it.'],
  [44,46,'Never dulls','It never needs sharpening, oiling, or polishing.'],
  [47,49,'Jealous','It dislikes rivals: after you attack with another weapon (or wear other armor), its next attack has −1 (armor: −1 AC for a round).'],
  [50,52,'Light sleeper','It stirs when a hostile creature comes within 30 feet, and wakes you if you are asleep with it at hand.'],
  [53,56,'Whispering echo','Once in a while it repeats, in a whisper, the last word spoken near it.'],
  [57,60,'Drinks the light','Its surface swallows light: you have advantage on checks to hide it on you.'],
  [61,65,'The metal sings','It rings like a bell when struck. +1 damage (armor and shields: +1 AC).',{dmg:1}],
  [66,69,'Never tarnishes','Rust, rot, and acid never mar it.'],
  [70,73,'Feather-light','It weighs half as much as it should.'],
  [74,76,'Forge-warm','It stays warm to the touch and sheds dim light in 5 feet at will.'],
  [77,79,'Stormglass','Frost or beads of water form on it a day before bad weather.'],
  [80,82,'Blood-eager','+1 damage on its first hit in each fight (armor and shields: +1 AC in the first round).'],
  [83,85,'Rune-scar','A Rune brushed it as it cooled: it has one more rune socket.',{sock:1}],
  [86,88,'Homing','You always know which way it lies, if it is within a mile of you.'],
  [89,91,'A Rune\'s power gets in','Its strongest property counts as 5 Potency higher (one rank).'],
  [92,94,'It remembers','+1 Accuracy against the first kind of creature it kills. Write that kind down.'],
  [95,96,'Twin-forged','Somewhere in the world another item was forged in the same instant (the DM decides what and where). Once a day you can sense which way it lies.'],
  [97,100,'A god notices','',{god:1}]];
const godShort=g=>String(g.n||'').split(' - ')[0];
const godRunes=g=>Array.isArray(g.runes)?g.runes.join(', '):String(g.runes||'their Runes');
function fqQuirk(){const d=1+Math.floor(Math.random()*100),q=FQUIRKS.find(x=>d>=x[0]&&d<=x[1]);if(!q)return {d,n:'',t:'Nothing unusual happens.'};
  const o={d,n:q[2],t:q[3],fx:q[4]||{}};if(o.fx.god&&GODS.length){const g=GODS[Math.floor(Math.random()*GODS.length)];o.god=godShort(g);
    o.t=`${o.god} marks it with their sign. Once per long rest, add 1d6 to a roll that fits ${godRunes(g)}. ${o.god} now knows the smith's name, and may come asking.`}return o}
// rune sockets: from the main material's grade (5+, 8+, 10), plus Masterwork and a Rune-scar; at most 4
const sockBase=m=>{const g=+(m&&m.g)||0;return g>=10?3:g>=8?2:g>=5?1:0};
const RUNE_DMG={Fire:'fire',Lava:'fire',Heat:'fire',Frost:'cold',Ice:'cold',Snow:'cold',Hail:'cold',Lightning:'lightning',Storm:'lightning',Electric:'lightning',Poison:'poison',Plague:'poison',Light:'radiant',Sun:'radiant',Holy:'radiant',Dark:'necrotic',Death:'necrotic',Night:'necrotic',Shadow:'necrotic',Air:'thunder',Sky:'thunder',Typhoon:'thunder',Water:'cold',Tide:'cold',Earth:'bludgeoning',Metal:'piercing',Iron:'piercing',Blade:'slashing',Psychic:'psychic',Mental:'psychic',Gravity:'force',Space:'force'};
// two Laws that fight each other: socketed together, the item turns unstable
const RUNE_OPP=[['Fire','Water'],['Air','Earth'],['Light','Dark'],['Life','Death'],['Creation','Destruction'],['Order','Chaos'],['Day','Night'],['Sun','Moon'],['Heal','Hurt'],['Frost','Heat'],['Hope','Despair'],['Love','Hate'],['Yin','Yang'],['Beginning','End'],['Mercy','Punish'],['Truth','Lies']];
const runeFx=(n,weapon)=>{const t=RUNE_DMG[n];return t?(weapon?`+1d4 ${t} damage on a hit.`:`Once per long rest, halve the damage of one ${t} hit.`):`Once per short rest, add 1d4 to an attack, check, or save that the ${n} Law fits (the DM's call).`};
const runeClash=runes=>RUNE_OPP.filter(([a,b])=>runes.includes(a)&&runes.includes(b));
// growth: marks for big deeds, and what the item wakes into at 3, 7, 12, and 20
const FGROW=[[3,'Named','It earns a name of its own. +1 Accuracy (armor and shields: +1 AC).',{atk:1}],[7,'Awakened','Its strongest property counts as 5 Potency higher (one rank).'],
  [12,'Bonded','It answers only to you: call it to your hand from up to 30 feet as a bonus action, and no one else can use its properties.'],[20,'Legend','+1 damage (armor and shields: +1 AC), and the DM writes the legend people tell about it.',{dmg:1}]];
const FMARK_WHY=['Beat a boss','Cleared a Tower floor','Finished a god\'s task','A deed the bards sing about','Other (the DM\'s call)'];
const bumpDmg=(s,n)=>{const m=/^(\S+)(?: \+ (\d+))?(.*)$/.exec(s||'');if(!m)return s;const v=(+m[2]||0)+n;return m[1]+(v?' + '+v:'')+m[3]};
// +n to attack (or AC when it has no attack), +n damage (or AC when it deals none)
function fBump(d,{atk,dmg}){if(atk){if(d.atk!=null)d.atk+=atk;else if(d.ac!=null)d.ac=Math.max(0,d.ac+atk)}if(dmg){if(d.dmg)d.dmg=bumpDmg(d.dmg,dmg);else if(d.ac!=null)d.ac=Math.max(0,d.ac+dmg)}
  (d.forms||[]).forEach(f=>{if(atk&&f.atk!=null)f.atk+=atk;if(dmg&&f.dmg)f.dmg=bumpDmg(f.dmg,dmg)})}
// material combos: two properties in one item unlock something neither has alone
const FCOMBOS=[['Burning','Freezing','Steam Burst','Fire and frost clash in it: once per short rest, on a hit, scalding steam deals 2d6 fire damage and blinds the target until the end of its next turn.'],
  ['Stormcharged','Tidal','Thunderstorm','Once per long rest, call a 20-foot storm on a point within 60 feet: 3d8 lightning damage, Dexterity save for half.'],
  ['Holy','Necromantic','Twilight Edge','Its hits deal radiant or necrotic damage, whichever the target resists less. Cursed: undead and celestials can always sense where it is.'],
  ['Lifedrinking','Regenerating','Bloodloop','When it drains life, you also end being poisoned or bleeding.'],
  ['Venomous','Corrosive','Rotting Venom','A creature it poisons also takes −1 AC until the end of the fight.'],
  ['Shadowed','Hushed','Silent Night','In dim light or darkness, creatures more than 30 feet away cannot see you.'],
  ['Blinking','Displacement','Phase Step','Once per short rest, when you are hit, teleport 15 feet; the hit deals half damage.'],
  ['Mighty','Hardened','Juggernaut','You cannot be pushed or knocked prone while you wield or wear it.'],
  ['Keen-Eyed','Farreaching','Hawk\'s Reach','Ranged attacks with it ignore half and three-quarters cover; a reach weapon gains 5 more feet of reach.'],
  ['Psychic','Mind Blast','Mindbreaker','Once per long rest, on a hit, the target makes an Intelligence save or is stunned until the end of its next turn.'],
  ['Gravitic','Earthbound','Worldweight','Once per short rest, on a hit, the target\'s speed drops to 0 until the end of its next turn.'],
  ['Skyborne','Quickening','Windrunner','+10 feet of speed, and you can run across water and webs without sinking or sticking.'],
  ['Lawful','Chaotic','Paradox','Roll a d6 each dawn: 1–3, reroll any 1s on its damage; 4–6, roll its damage twice and take either.'],
  ['Warding','Steadfast','Bulwark','+1 to every saving throw while you wield or wear it, on top of each property.'],
  ['Living','Shapeshifting','Wildgrowth','It slowly regrows when damaged, and once per long rest it can become any simple tool for 10 minutes.'],
  ['Burning','Stormcharged','Plasma Edge','Its fire and lightning damage ignore resistance (not immunity).'],
  ['Divine Spark','Purifying','Sanctified','Fiends and undead it hits cannot regain hit points until the start of your next turn.'],
  ['Fortunate','Timebound','Second Chance','Once per long rest, reroll a missed attack with it, or a failed save while you wear it.'],
  // hidden until someone forges them: the Forge page shows only how many are left to find
  ['Burning','Tidal','Boiling Tide','Once per short rest, on a hit, the target is scalded: 1d6 fire damage at the start of each of its next two turns.'],
  ['Freezing','Petrifying','Glacier Heart','A creature it hits twice in one turn is frozen solid (restrained) until the end of its next turn. Once per short rest.'],
  ['Venomous','Lifedrinking','Black Blood','Poison damage it deals also heals you for half that much.'],
  ['Shadowed','Glamoured','Mirror Shade','Once per long rest, step into a shadow and out as an illusion of yourself 30 feet away; your real self is invisible until your next attack.'],
  ['Holy','Purifying','Dawnbreaker','Once per long rest, flare with sunlight: undead and fiends within 20 feet make a Wisdom save or flee for 1 minute.'],
  ['Necromantic','Sovereign of the Dead','Gravecaller','Once per long rest, a creature it kills rises as a Zombie that serves you for 1 hour (it does not use a summon slot).'],
  ['Dreadful','Mind Blast','Nightmare Edge','A creature frightened by you also takes 1d6 psychic damage at the start of each of its turns.'],
  ['Stormcharged','Skyborne','Thunderwing','Once per short rest, after you jump or fall, land with a thunderclap: 2d6 thunder damage to creatures within 10 feet.'],
  ['Earthbound','Hardened','Mountain\'s Root','While you stand on stone or earth, the first hit against you each round deals 2 less damage.'],
  ['Corrosive','Piercing Edge','Armor Eater','Each hit lowers the target\'s AC by 1 until the end of the fight (up to −3).'],
  ['Nullifying','Spell Vessel','Spellbreaker','Once per long rest, a spell that targets you is stored in the item instead of affecting you; you can release it once within the hour.'],
  ['All-Seeing','Eye Ray','Watcher\'s Gaze','You cannot be surprised, and once per short rest you can see through invisibility for 1 minute.'],
  ['Mechanical','Ever-Ready','Clockwork Draw','Drawing or stowing it costs nothing, and it can reload itself once per round.'],
  ['Living','Regenerating','Evergreen','At the end of a long rest you regain 1d6 extra hit points, and it repairs any damage to itself.'],
  ['Enduring','Steadfast','Unbroken','Once per long rest, when you would drop to 0 hit points, drop to 1 instead.'],
  ['Quickening','Timebound','Borrowed Moment','Once per long rest, take one extra action on your turn; at the end of your next turn you are slowed (half speed, no reactions).'],
  ['Blinking','Farreaching','Long Step','Once per short rest, teleport up to 60 feet to a space you can see as a bonus action.'],
  ['Mighty','Gravitic','Crusher','A creature it hits that is Large or smaller is knocked prone on a critical hit, and its speed is halved until your next turn.'],
  ['Supple','Hushed','Silk Step','You make no sound when you move, and you can squeeze through a space one size smaller without slowing down.'],
  ['Keen-Eyed','Piercing Edge','Weak Spot','Your hits score a critical hit on a 19 or 20.'],
  ['Clear-Minded','Warding','Iron Will','You have advantage on saves against being charmed or frightened.'],
  ['Silver-Tongued','Glamoured','Honeyed Lie','Once per long rest, one lie you tell is believed unless the listener rolls a natural 20 on Insight.'],
  ['Learned','Spell Vessel','Scholar\'s Edge','Once per long rest, cast a cantrip you have seen cast in the last day, without knowing it.'],
  ['Wild-Wise','Living','Beastkin','Beasts are friendly to you unless harmed, and once per long rest you can speak with one for 10 minutes.'],
  ['Resonant','Stormcharged','Thunder Chord','Once per short rest, strike it to make a 15-foot cone of sound: 2d8 thunder damage, Constitution save for half.'],
  ['Resonant','Holy','Choir','Allies within 10 feet who can hear it gain +1 to saving throws.'],
  ['Displacement','Shadowed','Blur','The first attack against you each round has disadvantage.'],
  ['Invulnerable','Hardened','Bastion','Once per long rest, become immune to all damage until the start of your next turn; you cannot move while it lasts.'],
  ['Rebirth','Regenerating','Phoenix Ember','Once per long rest, when you drop to 0 hit points, you burst into flame and return with hit points equal to your level; creatures within 10 feet take 2d6 fire damage.'],
  ['Rebirth','Necromantic','Undying','Once per long rest, a creature you kill with it cannot be brought back by any magic short of a god.'],
  ['Elemental Core','Burning','Living Flame','Once per long rest, the flame inside it steps out as a fire spirit that fights beside you for 1 minute (the DM uses a fire elemental at half HP).'],
  ['Elemental Core','Tidal','Living Water','Once per long rest, the water inside it rises as a water spirit that fights beside you for 1 minute (the DM uses a water elemental at half HP).'],
  ['Binding','Petrifying','Stone Chain','Once per short rest, on a hit, the target is restrained by stone until the end of its next turn (Strength save to break free).'],
  ['Ink Cloud','Hushed','Squid\'s Escape','Once per short rest, as a reaction to being hit, burst into a 10-foot cloud of ink and move half your speed.'],
  ['Divine Spark','Progenitor Piece','Echo of the First','Once per long rest, one roll of yours counts as a natural 20. A god somewhere feels it.'],
  ['Chaotic','Fortunate','Wild Luck','Roll a d20 at dawn: on 20, your next roll today is a natural 20; on 1, your next roll is a natural 1.'],
  ['Shapeshifting','Glamoured','Thousand Faces','Once per long rest, take the look of any humanoid you have seen for 1 hour.'],
  ['Tempered','Mighty','Smith\'s Pride','+1 damage, and it can never be broken by a natural 1.'],
  // combos for the properties of the old tales
  ['Foe-Sensing','Unseen','Shadow of the Hunter','While its glow warns you of foes, they can\'t see you: you are invisible to goblins, orcs, and their kin until you attack.'],
  ['Soul-Drinking','Necromantic','Black Hunger','Each kill also raises the slain as a shade that fights for you until the end of the fight.'],
  ['Soul-Drinking','Holy','Penitent Blade','Its hunger turns to mercy: kills heal an ally within 30 ft for the temporary hit points instead.'],
  ['Wyrmsbane','Freezing','Dragon\'s Winter','A dragon it hits can\'t use its breath weapon on its next turn.'],
  ['Wyrmsbane','Burning','Wyrmfire','Its fire damage ignores the resistance and immunity of dragons.'],
  ['Giant-Felling','Ever-Returning','Shepherd\'s Sling','A thrown hit against a Large or larger creature stuns it until the end of its next turn on a natural 18 or higher.'],
  ['Giant-Felling','Mighty','Beanstalk Breaker','Once per long rest, a hit topples a Huge or larger creature: it falls prone and its speed is 0 until your next turn.'],
  ['Truename-Etched','Spell Vessel','Book of Names','It remembers every true name spoken near it, and once per long rest you can learn one name it holds.'],
  ['Truename-Etched','Binding','The Binding Word','When you command a creature by its true name, the command lasts 1 minute (it repeats the save each turn).'],
  ['Unseen','Hushed','Ring of Shadows','While invisible through it, you make no sound and leave no tracks. Each use, the DM may let something in the dark notice you anyway.'],
  ['Unseen','Shadowed','Wraith-World','Invisible through it, you see invisible and ethereal creatures as they see you.'],
  ['Wayfarer\'s Stride','Quickening','Seven Leagues','Once per day, each step covers seven: cross up to a mile as your move.'],
  ['Wayfarer\'s Stride','Skyborne','Winged Heels','You can run on air for one round per short rest, as long as you end on solid ground.'],
  ['Starsilver','Holy','Moonblade','It sheds moonlight that reveals shapechangers in their true form, and its hits deal +1d6 radiant to them.'],
  ['Starsilver','Hardened','Mithril Coat','Armor of it gives +1 AC and can\'t be pierced by critical hits.'],
  ['Heartwood','Living','Elder Grove','Once per long rest, plant it and a tree grows around you in a round: half cover, and you heal 1d8 a turn for 1 minute while you stand in it.'],
  ['Heartwood','Wild-Wise','Shepherd of Trees','Trees within 60 ft will answer one question each per day, and once per long rest one walks with you for an hour.'],
  ['Ever-Returning','Stormcharged','Thunder Hammer','When it returns to your hand, it brings a lightning bolt with it: 2d8 lightning to one creature in its path.'],
  ['Oathkeeper','Lawful','Oath of the Sworn','Once per long rest, swear an oath on it: you have advantage on every roll that keeps that oath until your next long rest.'],
  ['Oathkeeper','Divine Spark','Godsworn','A god hears every oath sworn on it. Breaking one brings a curse; keeping a great one earns a boon (the DM\'s call).'],
  ['Hoard-Cursed','Fortunate','Dragon\'s Luck','Once per long rest, turn a failed save into a success. Each time, the item\'s hold on you grows: the Wisdom save DC rises by 1.'],
  ['Hoard-Cursed','Unseen','The Ring','Invisibility through it lasts until you choose to end it, but each hour of it costs a Wisdom save or a point of the item\'s hold on you.'],
  ['Emberglass','Holy','Dawnglass','Undead it hits can\'t regain hit points until your next long rest.'],
  ['Emberglass','Burning','Dragonglass','Creatures of ice it hits take double fire damage and shatter at 0 hit points.'],
  ['Rightful Heir','Oathkeeper','Sword in the Stone','Only you can lift it from where you set it down. Allies who swear to follow you gain +1 to every saving throw.'],
  ['Rightful Heir','Holy','Crowned in Light','Once per long rest, raise it: allies within 30 ft are freed from being frightened or charmed.'],
  ['Spellward','Nullifying','Mageslayer','Spells you resist through it rebound on their caster on a 6.'],
  ['Spellward','Warding','Witchward','+1 to saves against spells, and curses on you end at your next long rest.'],
  ['Songbound','Resonant','Battle Hymn','Allies within 30 ft add +1 damage while you play or sing (a bonus action each turn).'],
  ['Songbound','Silver-Tongued','Siren\'s Lay','Once per long rest, a creature that hears your song makes a Wisdom save or follows you, entranced, for 1 minute.'],
  ['Stormcaller','Tidal','The Tempest','Your storm can also raise a wave: once during it, a 30-ft line of water knocks creatures prone (Strength save).'],
  ['Stormcaller','Skyborne','Eye of the Storm','While your storm rages, you can fly at your walking speed inside it.'],
  ['Mirrorbound','Glamoured','Through the Looking-Glass','Step through a mirror and come out as anyone you have seen in it, for 1 hour.'],
  ['Mirrorbound','All-Seeing','Scrying Glass','Once per long rest, look through any mirror you have touched, anywhere, for 1 minute.'],
  // more combos: properties, traits from creature materials, and the two together
  ['Freezing','Tidal','Black Ice','Once per short rest, the ground within 10 ft of a creature you hit freezes over: difficult terrain, and creatures there make a Dexterity save or fall prone.'],
  ['Necromantic','Lifedrinking','Grave Hunger','When it drops a creature to 0 hit points, you gain temporary hit points equal to half the damage of that hit.'],
  ['Venomous','Necromantic','Black Rot','A creature it poisons can\'t regain hit points until the poison ends.'],
  ['Dreadful','Necromantic','Deathknell','A creature you drop to 0 hit points lets out a scream: enemies within 30 ft make a Wisdom save or are frightened until the end of their next turn.'],
  ['Divine Spark','Holy','Godsfire','Once per long rest, on a hit, call down a pillar of light: 4d10 radiant damage to the target (Constitution save for half).'],
  ['Rebirth','Undying','Phoenix Heart','Once ever, when you die, you return to life at the start of your next turn with half your hit points, and the item loses this combo.'],
  ['Wild-Wise','Shapeshifting','Beast-Bond','Once per long rest, become a beast of challenge rating 1 or lower for 1 hour, keeping your mind.'],
  ['Ever-Returning','Blinking','Homing Blink','When you throw it, you can teleport to the spot where it lands, once per short rest.'],
  ['Clear-Minded','Learned','Sage\'s Calm','You can\'t be confused, and you add your proficiency bonus to Intelligence checks you aren\'t proficient in.'],
  ['Supple','Quickening','Whiplash','Once per turn, when a creature misses you with a melee attack, you can attack it.'],
  ['Elemental Core','Stormcaller','Tempest Heart','Choose fire, cold, or lightning each dawn: its hits deal +1d6 of that type and you resist it.'],
  ['Starsilver','Foe-Sensing','Moonwatch','It glows faint silver when a hostile creature is within 120 ft, and you can\'t be surprised.'],
  ['Wyrmsbane','Dreadful','Dragonslayer\'s Roar','Dragons have disadvantage on saves against being frightened by you, and your hits on them deal +2d6 damage.'],
  ['Soul-Drinking','Spell Vessel','Soul Battery','When it drops a creature to 0 hit points, it stores a spell slot of 1st level that you can use once.'],
  ['Truename-Etched','Oathkeeper','Bound by Name','Once per long rest, speak a creature\'s true name: it has disadvantage on saves against you for 1 minute.'],
  ['Rightful Heir','Steadfast','Crowned Blade','Allies who can see you have advantage on saves against being frightened.'],
  ['Fire Gland','Inner Furnace','Dragonfire','Once per long rest, breathe fire in a 15-foot cone: 4d6 fire damage (Dexterity save for half).'],
  ['Frost Gland','Frostproof','Winter\'s Breath','Once per long rest, breathe frost in a 15-foot cone: 4d6 cold damage and speed halved (Constitution save for half and no slow).'],
  ['Dragon-Hide','Dragon-Blood','Dragon-Kin','You resist the damage type of the dragon\'s element and gain +2 to Charisma (Intimidation) checks.'],
  ['Dragon-Sight','Frightful Presence','Wyrm\'s Glare','When a creature you can see fails a save against being frightened by you, it is also stunned until the end of its next turn, once per long rest.'],
  ['Hellbrand','Brimstone Hide','Hellforged','Your hits deal +1d6 fire damage that ignores fire resistance, and you resist fire.'],
  ['Infernal Vigor','Contract-Sense','Devil\'s Due','When a creature breaks a promise made to you, your next hit on it deals +3d6 damage.'],
  ['Grave-Cold','Ghostly','Wraith-Touched','You can see invisible undead, and necrotic damage you take is halved.'],
  ['Undying','Relentless','Deathless','Once per long rest, when you drop to 0 hit points, you stay at 1 and gain 2d10 temporary hit points.'],
  ['Water-Breathing','Sea-Breath','Child of the Deep','You have a swimming speed of 40 ft and see normally underwater out to 60 ft.'],
  ['Blood in the Water','Ravening','Feeding Frenzy','Your hits deal +1d8 damage to a creature that is bleeding or below half hit points.'],
  ['Thick Coat','Thick Hide','Mammoth Hide','Cold damage you take is halved and you can\'t be knocked prone by creatures your size or smaller.'],
  ['Barkskin','Sap-Blood','Old Oak','You regain 1 hit point at the start of each turn while standing on soil, and you have advantage on saves against being moved.'],
  ['Thorn-Lashed','Barkskin','Bramble Guard','A creature that hits you with a melee attack takes 1d6 piercing damage.'],
  ['Spore Cloud','Rot-Proof','Fungal Bloom','Creatures poisoned by your spores also can\'t take reactions.'],
  ['Alien Thought','Psychic Lash','Elder Mind','Once per long rest, speak telepathically to a creature within 1 mile you know.'],
  ['Mind Spike','Telepathy','Thought-Thief','Once per long rest, on a hit, learn the target\'s surface thoughts and one secret it is hiding.'],
  ['Swarm-Bite','Hive-Sense','Hive-Mind','You and allies within 30 ft can\'t be surprised and share what each of you sees.'],
  ['Monster-Maw','Monster-Heart','Apex Predator','When you score a critical hit, you regain hit points equal to the extra damage.'],
  ['Monster-Hide','Titan\'s Hide','Living Fortress','Once per long rest, for 1 minute, you resist bludgeoning, piercing, and slashing damage.'],
  ['Unmaking','Null-Skin','Edge of Nothing','Once per long rest, on a hit, the target is banished to an empty space between worlds until the end of its next turn.'],
  ['Fold-Step','Phasing','Ghost-Walk','Once per long rest, move through walls for 1 minute.'],
  ['Lure-Voice','Fey Charm','Siren\'s Call','Once per long rest, charm up to three creatures that hear you for 1 minute (Wisdom save).'],
  ['Hag\'s Bargain','Curse-Mark','Witchery','Once per long rest, curse a creature you hit: it has disadvantage on one ability\'s checks of your choice for 1 hour.'],
  ['Spell-Shrug','Fox-Fire Step','Nine-Tailed','When you succeed on a save against a spell, you can teleport 15 ft.'],
  ['Riddle-Lore','Truth-Sight','Sphinx\'s Question','Once per long rest, ask a creature a question: if it lies, it takes 3d6 psychic damage.'],
  ['Riveted','Tough Plates','Ironclad','Your AC can\'t be lowered, and you have advantage on saves against being pushed or knocked prone.'],
  ['Blood Fury','War-Hardened','Berserker\'s Blood','While below half hit points, your hits deal +1d6 damage and you resist bludgeoning, piercing, and slashing.'],
  ['Cold Blood','Amphibious','Marsh-Born','You move through swamps and mud without slowing and can hide in water while only lightly obscured.'],
  ['Pack Tactics','Keen Nose','Pack Leader','Allies within 10 ft of you have advantage on attacks against creatures you hit this turn.'],
  ['Shed Skin','Venom Fang','Serpent King','You are immune to poison, and once per long rest your hit poisons the target for 1 minute (Constitution save ends at the end of each turn).'],
  ['Ink Cloud','Slip Away','Vanishing Act','When you release your ink, you can also move up to your speed without provoking opportunity attacks.'],
  ['Glider','Diving Strike','Stoop','When you fall or dive at least 20 ft before a melee attack, it deals +2d8 damage.'],
  ['Night Wing','Devil\'s Sight','Night Hunter','You see in magical darkness out to 60 ft and have advantage on attacks against creatures in darkness.'],
  ['Great Leap','Pounce','Leap of the Lion','After you jump at least 10 ft toward a creature, your first hit knocks it prone (Strength save).'],
  ['Fleet-Footed','Wind-Step','Quicksilver Feet','Your speed increases by 10 ft and you take no opportunity attacks from creatures you hit this turn.'],
  ['Stone-Patient','Stoneskin','Mountain\'s Patience','While you don\'t move on your turn, you resist all damage except psychic until the start of your next turn.'],
  ['Regenerating','Healing Touch','Troll\'s Gift','Once per long rest, touch a creature to let it regain 2d8 hit points and regrow a lost finger, toe, or ear.'],
  ['Freezing','Frostproof','Heart of Winter','You are immune to cold damage while you hold it.'],
  ['Holy','Undying','Saint\'s Relic','Once per long rest, when an ally within 30 ft drops to 0 hit points, they drop to 1 instead.'],
  ['Necromantic','Grave-Cold','Lich-Touch','Your hits deal +1d6 necrotic damage and the target can\'t regain hit points until your next turn.'],
  ['Venomous','Venom Fang','Basilisk Venom','Poison from it ignores resistance to poison damage.'],
  ['Shadowed','Night Wing','Bat-Shadow','In darkness you can fly at your walking speed.'],
  ['Psychic','Alien Thought','Mind-Shield','You are immune to psychic damage while you hold it.'],
  ['Stormcharged','Thunder Hide','Stormborn','You resist lightning and thunder damage; once per long rest, call down lightning on a creature within 60 ft for 3d10 lightning damage.'],
  ['Tidal','Water-Breathing','Tidecaller','Once per long rest, part water or raise a 10-foot wave that pushes creatures 15 ft (Strength save).'],
  ['Mighty','Brute Strength','Titan-Grip','You can wield a two-handed weapon in one hand.'],
  ['Hardened','Monster-Hide','Behemoth Plate','Your AC increases by 1 against attacks from Large or larger creatures, and theirs from you deal −2 damage.'],
  ['Living','Barkskin','Dryad\'s Heart','Once per long rest, step into a tree and out of another within 100 ft.'],
  ['Gravitic','Unmaking','Collapse','Once per long rest, on a hit, the target and creatures within 10 ft of it are pulled 10 ft toward it and take 2d10 force damage.'],
  ['Glamoured','Fey Charm','Fey-Court Grace','You have advantage on Charisma checks with fey, and once per long rest can cast Charm Person without a spell slot.'],
  ['Lawful','Contract-Sense','Arbiter','Once per long rest, a creature that swears a promise to you takes 4d6 psychic damage if it breaks it.'],
  ['Burning','Tempered','Forge-Heart','Once per long rest, it heats white-hot for 1 minute: +1d6 fire damage, and it cuts through nonmagical metal bars and locks.'],
  ['Freezing','Hushed','Snowfall Silence','Once per long rest, the area within 20 ft of you is filled with soft snow for 1 minute: silent, and difficult terrain for your enemies.'],
  ['Freezing','Starsilver','Rimelight','Its hits on a creature in darkness also blind it until the end of its next turn, once per short rest.'],
  ['Holy','Oathkeeper','Paladin\'s Oath','While you keep an oath sworn on it, your hits deal +1d4 radiant damage.'],
  ['Holy','Songbound','Hymn of Dawn','Once per long rest, sing: undead within 30 ft make a Wisdom save or are turned for 1 minute.'],
  ['Shadowed','Silver-Tongued','Whisper in the Dark','Once per long rest, speak from any shadow you can see within 120 ft.'],
  ['Mighty','Earthbound','Quake Strike','Once per short rest, strike the ground: creatures within 10 ft make a Strength save or fall prone.'],
  ['Mighty','Hoard-Cursed','Dragon\'s Greed','Your hits deal +1d6 damage to a creature carrying coin or gems; you can\'t give the item away.'],
  ['Keen-Eyed','Starsilver','Night-Sighted Archer','You ignore disadvantage from dim light and darkness on ranged attacks.'],
  ['Chaotic','Wild-Wise','Untamed Surge','When you roll a 1 on an attack with it, roll on a wild magic table instead of missing.'],
  ['Lawful','Steadfast','Unbending Law','You can\'t be moved against your will while you hold it in both hands.'],
  ['Timebound','Ever-Ready','First Strike','You always act first in the first round of a fight unless surprised.'],
  ['Gravitic','Skyborne','Weightless','You can fall up: once per long rest, reverse gravity for yourself for 1 minute.'],
  ['Psychic','Learned','Mind Palace','You remember everything you have read in the last 30 days.'],
  ['Spellward','Lawful','Anti-Magic Ward','Once per long rest, for 1 minute, spells cast by creatures within 10 ft of you have disadvantage on their attack rolls and give advantage on saves.'],
  ['Hardened','Wyrmsbane','Dragonscale Bane','Dragon breath damage you take is halved.'],
  ['Warding','Truename-Etched','Named Ward','Name one creature: its attacks against you have disadvantage until you name another.'],
  ['Living','Songbound','Birdsong','Birds follow you and warn you: you can\'t be surprised outdoors.'],
  ['Silver-Tongued','Rightful Heir','Kingsword','Once per long rest, command up to five creatures that can hear you (as the Command spell).'],
  ['Divine Spark','Rebirth','Ember of the Gods','Once per long rest, when an ally dies within 30 ft, they return at 1 hit point.'],
  ['Eye Ray','Freezing','Frost Ray','Once per short rest, shoot a ray of cold at a creature within 60 ft: 2d8 cold damage and speed 0 until the end of its next turn.'],
  ['Binding','Oathkeeper','Chain of Oaths','A creature that swears to you and breaks it is restrained for 1 minute.']];
// more combos (website addition): for the newer properties, the commonest traits that had none, and the commonest
// properties that had few. A pair already on the list, or a name already taken, is skipped.
(()=>{const MORE=[
    ["Rooted", "Earthbound", "Bedrock Stance", "While you stand on the ground you can't be pushed, knocked prone, or teleported against your will."],
    ["Rooted", "Living", "Deep Roots", "Once per long rest, when you would drop to 0 hit points while standing on earth, you drop to 1 instead."],
    ["Slick", "Shadowed", "Eel's Escape", "You have advantage on checks to escape grapples and restraints, and can slip through a space one size smaller without squeezing."],
    ["Slick", "Venomous", "Coated Edge", "Poison applied to it lasts for three hits instead of one."],
    ["Blossoming", "Holy", "Sacred Bloom", "Once per long rest, flowers burst around you: you and allies within 10 feet regain 2d8 hit points."],
    ["Blossoming", "Glamoured", "Lure of Petals", "Once per short rest, a creature you hit makes a Wisdom save or is charmed by you until the end of its next turn."],
    ["Tolling", "Dreadful", "Death Knell", "When a creature within 30 feet drops to 0 hit points, each enemy within 30 feet of it makes a Wisdom save or is frightened until the end of its next turn."],
    ["Tolling", "Resonant", "Great Bell", "Once per short rest, strike it to deal 2d8 thunder damage to every other creature within 10 feet (Constitution save for half)."],
    ["Shifting Sands", "Earthbound", "Quicksand", "Once per long rest, turn a 15-foot square within 30 feet into sinking sand for 1 minute: difficult terrain, and a creature that ends its turn there makes a Strength save or is restrained."],
    ["Shifting Sands", "Timebound", "Hourglass", "Once per long rest, after initiative is rolled, swap your initiative with a willing ally's."],
    ["Mycelial", "Necromantic", "Rot Bloom", "Once per long rest, a creature it kills sprouts fungus and rises a minute later as a spore-thrall that obeys you for 1 hour."],
    ["Mycelial", "Regenerating", "Fungal Mend", "When you regain hit points from a short or long rest, regain an extra 1d6."],
    ["Clockwork", "Mechanical", "Perfect Mechanism", "Once per short rest, after you roll an attack or check with it, treat a d20 roll of 9 or lower as a 10."],
    ["Clockwork", "Timebound", "Escapement", "Once per long rest, take one extra action on your turn; on your next turn you can take only a bonus action."],
    ["Thorned", "Living", "Briar Guard", "A creature that hits you with a melee attack takes 1d6 piercing damage."],
    ["Thorned", "Venomous", "Nettle Sting", "A creature it hits itches and burns: −1 on attack rolls until the end of its next turn."],
    ["Ashen", "Burning", "Cinderfall", "Once per short rest, on a hit, hot ash fills 10 feet around the target: heavily obscured until the end of your next turn."],
    ["Ashen", "Rebirth", "Phoenix Ash", "Once per long rest, when you drop to 0 hit points, you crumble to ash and re-form with half your hit points at the start of your next turn."],
    ["Moulded", "Hardened", "Second Skin", "It shapes itself to whoever holds or wears it: anyone can use it without penalty, and armor made with it goes on or off in a single action."],
    ["Moulded", "Shapeshifting", "Clay of Ages", "Once per long rest, reshape it into any other weapon or tool of about the same size for 1 hour."],
    ["Smoky", "Shadowed", "Smoke Step", "Once per short rest, as a bonus action, vanish in a puff of smoke and reappear up to 20 feet away in dim light or darkness."],
    ["Smoky", "Ink Cloud", "Blackout", "Once per long rest, fill a 20-foot radius around you with magical smoke for 1 minute; you can see through it."],
    ["Sprouting", "Living", "Green Wake", "Once per long rest, grow a thorny hedge wall up to 30 feet long and 10 feet high (60 hit points) on ground you can see within 30 feet."],
    ["Sprouting", "Heartwood", "World Seed", "Planted over a long rest, it grows one fruit that restores 4d8 hit points when eaten (once per long rest; it withers by the next dusk)."],
    ["Preserving", "Undying", "Embalmed", "You stop aging while you carry it, and you are immune to disease."],
    ["Preserving", "Freezing", "Cold Storage", "Food, potions, and remains you carry never spoil; a body kept on it can be raised as if it had died that day."],
    ["Lifedrinking", "Piercing Edge", "Leech Point", "When you score a critical hit with it, you regain hit points equal to the extra damage the critical dealt."],
    ["Lifedrinking", "Burning", "Ember Thirst", "When it drains life, the target also catches fire: 1d6 fire damage at the start of its next turn."],
    ["All-Seeing", "Foe-Sensing", "Watchtower", "You can't be surprised, and you know how many hostile creatures are within 60 feet, and what kind."],
    ["All-Seeing", "Piercing Edge", "Flaw-Finder", "Once per short rest, your next hit against a creature you can see ignores its resistance to the weapon's damage."],
    ["Giant-Felling", "Earthbound", "Topple", "Once per turn, a Large or bigger creature you hit makes a Strength save or is knocked prone."],
    ["Giant-Felling", "Wyrmsbane", "Dragonslayer's Oath", "+1d6 damage against Huge and bigger creatures."],
    ["Nullifying", "Binding", "Spell Chains", "Once per long rest, a creature you hit makes a Charisma save or can't teleport, turn invisible, or change shape for 1 minute."],
    ["Corrosive", "Giant-Felling", "Hide Melter", "A Large or bigger creature it hits loses 1 AC until the end of the fight (once per creature)."],
    ["Binding", "Psychic", "Mind Shackle", "Once per long rest, a creature you hit makes a Wisdom save or can't take reactions or cast spells until the end of its next turn."],
    ["Unyielding", "Hardened", "Unbowed", "Once per long rest, when a hit would take you below half your hit points, reduce its damage by 10."],
    ["Fiend-Hide", "Hellbrand", "Infernal Mantle", "You resist fire damage, and fiends take you for one of their own until you attack them."],
    ["Acid-Proof", "Corrosive", "Acidwalker", "You are immune to acid damage, and its touch eats a hand-sized hole through metal in 1 minute."],
    ["Wail", "Dreadful", "Banshee Cry", "Once per long rest, wail: creatures within 30 feet make a Wisdom save or are frightened for 1 minute (save again at the end of each of their turns)."],
    ["Grounded", "Stormcharged", "Lightning Rod", "You resist lightning damage, and once per short rest, after you take lightning damage, your next hit deals 2d8 more lightning damage."],
    ["Flameproof", "Burning", "Salamander", "You are immune to fire damage, and standing in fire heals you 1d6 at the start of your turn (up to 1 minute, once per long rest)."],
    ["Thunderstrike", "Tolling", "Thunderclap", "Once per short rest, on a hit, a thunderclap deafens the target for 1 minute and pushes it 10 feet away."],
    ["Searing", "Holy", "Brand of Dawn", "Undead and fiends it hits shed bright light and can't turn invisible until the end of your next turn."],
    ["Wild Surge", "Chaotic", "Wild Tide", "When you roll a 20 to hit with it, roll on the wild magic table and choose whether the result happens."],
    ["Dissolving", "Corrosive", "Melt", "Once per long rest, a nonmagical object it touches, no bigger than a door, dissolves over 1 minute."],
    ["Tongue-Taste", "Venomous", "Poison-Taster", "You can taste poison in any food or drink, and you have advantage on saves against poison."],
    ["Hellish", "Necromantic", "Pact of Ash", "Once per long rest, when it kills a creature, you gain temporary hit points equal to that creature's level."],
    ["Thirsting Vigor", "Lifedrinking", "Red Thirst", "When it drains life, you regain 2 more hit points."],
    ["Eat to Heal", "Regenerating", "Feast", "A short rest with a hot meal restores 2d6 more hit points."],
    ["Deep-Sight", "All-Seeing", "Abyssal Eye", "You can see through magical darkness out to 60 feet."],
    ["Crushing Blow", "Mighty", "Bonebreaker", "On a critical hit, the target's speed is halved until it regains hit points."],
    ["Warded", "Spellward", "Bastion of Wards", "+1 to saves against spells, and once per long rest you can turn a failed save against a spell into a success."],
    ["Null Ward", "Nullifying", "Silent Field", "Once per long rest, end one spell of 3rd rank or lower on a creature or object you touch with it."],
    ["Earth-Glide", "Earthbound", "Stone Swimmer", "Once per long rest, for 1 minute you can move through earth and stone (not metal) at half speed."],
    ["Paralyzing", "Venomous", "Stillness", "Once per long rest, a creature you hit makes a Constitution save or is paralyzed until the end of its next turn."],
    ["World-Heart", "Living", "Gaia's Pulse", "Once per long rest, you and allies within 15 feet regain 3d8 hit points."],
    ["Dirty Fighting", "Shadowed", "Low Blow", "Once per turn, when you hit a creature that can't see you, it can't take reactions until the start of its next turn."],
    ["Gore", "Mighty", "Charging Horn", "If you move 20 feet straight toward a creature and then hit it, it takes 2d6 more damage and is pushed 10 feet."],
    ["Chitin Plating", "Hardened", "Carapace", "+1 AC against ranged attacks."],
    ["Chilling Touch", "Freezing", "Rime Grip", "A creature it hits loses 10 feet of speed until the end of its next turn."],
    ["Truesight Glimpse", "All-Seeing", "Clear Sight", "Once per long rest, you gain truesight out to 30 feet for 1 minute."],
    ["Battle-Born", "Mighty", "War-Forged", "+1 to initiative, and you have advantage on saves against being frightened."],
    ["Spider Climb", "Binding", "Web-Walker", "You climb sheer walls and webs at your full speed and never stick in webs."],
    ["Fey Step", "Blinking", "Faerie Path", "Once per short rest, as a bonus action, teleport up to 30 feet; the first attack against you before your next turn has disadvantage."],
    ["Soft Step", "Hushed", "Ghost Feet", "Moving at half speed, you leave no tracks and make no sound."],
    ["Hawk-Sight", "Keen-Eyed", "Eagle Eye", "The long range of ranged attacks with it is doubled, and you can make out details a mile away."],
    ["Death Roll", "Tidal", "Drowning Grip", "A creature you grapple underwater can't breathe and takes 2d6 bludgeoning damage at the start of each of its turns."],
    ["Self-Mending", "Tempered", "Undying Steel", "It can't be broken for good: after a long rest it mends itself fully, even from a single shard."],
    ["Mimicry", "Glamoured", "Perfect Mimic", "You can copy any voice you have heard for at least a minute, and creatures have disadvantage on Insight checks to see through it."],
  ];const has=(a,b)=>FCOMBOS.some(x=>(x[0]===a&&x[1]===b)||(x[0]===b&&x[1]===a));MORE.forEach(c=>{if(!has(c[0],c[1])&&!FCOMBOS.some(x=>x[2]===c[2]))FCOMBOS.push(c)})})();
const forgeCombos=r=>{const P=new Set((r.props||[]).filter(p=>!p.half).map(p=>p.m.pn).concat((r.parts||[]).filter(p=>p.m&&p.m.tr&&p.fit&&p.fit.lv!=='wrong').map(p=>p.m.tr.n)));return FCOMBOS.filter(([a,b])=>P.has(a)&&P.has(b))};
let COMBOS_FOUND=store.get('combos',[]);
function combosNote(list){let n=0;list.forEach(c=>{if(!COMBOS_FOUND.includes(c[2])){COMBOS_FOUND.push(c[2]);n++}});if(n){store.set('combos',COMBOS_FOUND);toast('✦ Combo found: '+list.map(c=>c[2]).join(', '))}}
// master smiths: one in every realm; each can forge up to its grade, for a fee or a task
const SMITHS={Human:['Bram Ashdown','the Ironhand of Vestige\'s towns',1,'Clear the bandits from his ore road'],Mysterious:['Nim of the Lanterns','who forges only by lantern-light',2,'Bring back a lantern from a Mysterious ruin'],
  Hell:['Varka Cinderoath','a contract smith of Hell\'s halls',3,'Sign one small clause in Varka\'s favour'],Heaven:['Seraphine Dawnanvil','who quenches steel in morning light',3,'Escort a pilgrim to a cloud shrine'],
  Chaos:['Ott the Unsteady','whose work is never the same twice',3,'Fetch a stone that has stayed one shape for a year'],Abyss:['Morrow Deephammer','who works at the bottom of the Abyss',4,'Hunt the beast that ate his last apprentice'],
  'Inner Realm':['Ilse Quietflame','who forges without a sound',4,'Carry a message no one else may hear'],'Outer Realm':['Kestrel Starwright','who works fallen stars',4,'Catch a falling star before it lands'],
  Void:['The Hollow Smith','who has no face and takes a memory as payment',5,'Give up one memory the DM chooses'],'Inner Void':['Ash-That-Remains','what is left of a god\'s smith',5,'Recover a tool from a dead god\'s forge'],
  Primordial:['Orrun','the last apprentice of the progenitor Gnome',5,'Prove your work: show Orrun a Masterwork you made yourself']};
// a master smith scales with their realm: level 10 per tier (Human 10 … Primordial 100), a forge grade to match,
// materials no deeper than their own realm, and a fee that doubles with every tier
// any smith from level 1 to 100 can be hired: every 10 levels is one realm tier (1–10 Human, 11–20 Mysterious, … 91–100
// Primordial), and the 10th level of each tier is that realm's named master. The fee (the campaign owner's formula) is
// half the materials' cost + 100 × (tier + step ÷ 10) + tier × 10, where the step is the level within its tier (1–10):
// a level 1 Human smith is 100 × 1.1 + 10 = 120 gp plus half the materials
const HIRE_TITLE=['Apprentice','Apprentice','Apprentice','Journeyman','Journeyman','Journeyman','Expert','Expert','Expert','Master'];
function hireOf(L,matCost){L=Math.max(1,Math.min(100,Math.round(+L)||0));if(!L)return null;const t=Math.ceil(L/10),step=L-(t-1)*10,Z=REALMS.filter(z=>(z.tier||1)===t),realm=Z.map(z=>z.n).join(' or ')||'Human',
  M=step===10?Z.map(z=>SMITHS[z.n]).filter(Boolean):[],title=HIRE_TITLE[step-1],base=Math.round(100*(t+step/10)+t*10);
  return {lv:L,tier:t,step,g:Math.min(MAX_STAGE,Math.ceil(t/2)),realm,base,fee:Math.round(base+.5*(+matCost||0)),master:!!M.length,
    n:M.length?M.map(x=>x[0]).join(' or '):`${aAn(title)} ${title.toLowerCase()} smith of the ${realm}`,d:M.length?M[0][1]:`level ${L} for hire`,task:M.length?M[0][3]:''}}
// the smiths you can hire, as people rather than levels: in each realm an apprentice, a journeyman, an expert, and the
// realm's famous master (the same smiths and fees as before, levels 2, 5, 8, and 10 of each realm's ten)
const SMITH_FIRST=['Hilde','Oren','Maeve','Tobin','Sigrun','Corwin','Asha','Brannoc','Elka','Dov','Rhosyn','Garrick','Isolde','Pell','Yara','Thane','Wynn','Kesh','Mira','Ulric','Sefa','Joss','Nell','Ravi'];
const SMITH_LAST=['Ashfoot','Coalbrook','Ironvale','Emberly','Tongs','Hammerfall','Flint','Bellows','Cinder','Stokes','Anvilheart','Quench','Slagg','Rivet','Forgewell','Brand'];
const SMITH_STEPS=[[2,'apprentice'],[5,'journeyman'],[8,'expert'],[10,'master']];
function smithName(t,step){const h=(t*31+step*7)%SMITH_FIRST.length,k=(t*13+step*5)%SMITH_LAST.length;return SMITH_FIRST[h]+' '+SMITH_LAST[k]}
function smithRoster(cost){const out=[];for(let t=1;t<=10;t++)SMITH_STEPS.forEach(([st,role])=>{const S=hireOf((t-1)*10+st,cost);if(!S)return;S.who=S.master?S.n:smithName(t,st);S.role=role;out.push(S)});return out}
// does the Forge show its numbers (odds, DCs, roll math)? In the DM's view, or when someone ticks Show the numbers
const forgeNums=()=>dmUnlocked()&&(FORGE.nums!=null?!!FORGE.nums:role()==='dm');
// how hard the work is, in words, from the chance of making anything at all
function forgeHardWords(o){const ok=o.Masterwork+o.Fine+o.Standard+(o.Flawed||0)*0;return ok>=.9?['Easy work','the smith could do this in their sleep']:ok>=.7?['Steady work','it should take, with care']:ok>=.45?['A fair challenge','it may take more than one try']:ok>=.25?['Hard work','expect failed attempts']:['Beyond their skill','a gamble at best: think about hiring a better smith']}
function smithOf(z){const S=SMITHS[z];if(!S)return null;const t=(REALM[z]||{}).tier||1;return hireOf(t*10)}
const bpTier=b=>Math.max(1,...(b.mats||[]).map(n=>((REALM[(findMat(n)||{}).realm]||{}).tier||1)));
const smithCan=(S,b,F)=>!!S&&S.g>=F.g&&S.tier>=bpTier(b);
// the smith rolls like any forger: half their level, advantage and up to +5 at or above the item's level, −2 a level below
function smithCheck(S,b){const gap=S.lv-b.lv;return {bonus:Math.floor(S.lv/2)+(gap>0?Math.min(5,Math.floor(gap/5)):gap*2),mode:gap>=0?'adv':''}}
// the commission board: a week's orders from people who want something made
const FC_CLIENTS=['Captain Mirelle Vance','Old Tobin the miller','Sister Aldra','Lord Pell of the river towns','Hessa the hunter','Guildmaster Quorr','the twins Lio and Lia','Brother Kael','Madam Ivette','Ranger Dask','a masked buyer','Warden Holt'];
function fcBoard(){const wk=Math.floor(Date.now()/(7*864e5)),R=(i=>()=>{i=(i*16807)%2147483647;return i/2147483647})(wk*97+13),W=GEN.filter(([,b])=>b.dmg||b.armor||b.shield).map(([k])=>k);
  return Array.from({length:5},(_,i)=>{const base=W[Math.floor(R()*W.length)],q=['Standard','Standard','Fine','Fine','Masterwork'][Math.floor(R()*5)],rz=REALMS[Math.min(REALMS.length-1,Math.floor(R()*R()*6))];
    return {id:wk+'-'+i,client:FC_CLIENTS[Math.floor(R()*FC_CLIENTS.length)],base,q,realm:rz.n,tier:rz.tier||1,gp:({Standard:40,Fine:90,Masterwork:220})[q]*(rz.tier||1)}})}
let FCOMM=store.get('commissions',[]);
const saveComm=()=>store.set('commissions',FCOMM);
const fqRank=n=>FQ.findIndex(q=>q[0]===n);
function fcTake(id){const o=fcBoard().find(x=>x.id===id);if(!o||FCOMM.some(x=>x.id===id))return;FCOMM.push(Object.assign({},o,{took:Date.now()}));saveComm();toast('Taken: '+o.base+' for '+o.client);renderForge()}
function fcDrop(id){FCOMM=FCOMM.filter(x=>x.id!==id);saveComm();renderForge()}
function fcBoardHTML(){const B=fcBoard();return `<section class="sec"><div class="sec-h"><h3>📜 Commission board</h3><p>This week's orders. Take one, forge it to the quality asked with materials from its realm or deeper, and deliver it from the Forge for the reward. A delivered commission counts as a profession milestone (tell your DM). New orders every week.</p></div>
  <div class="tablewrap"><table class="t"><thead><tr><th>Client</th><th>Wants</th><th>Quality</th><th>Materials from</th><th class="num">Reward</th><th></th></tr></thead><tbody>${B.map(o=>{const t=FCOMM.find(x=>x.id===o.id);return `<tr><td>${esc(o.client)}</td><td><b>${esc(o.base)}</b></td><td>${esc(o.q)}+</td><td>${esc(o.realm)} or deeper</td><td class="num">${o.gp} gp</td><td>${t?(t.done?'<span class="b green">Delivered</span>':`<button class="btn" onclick="fcDrop('${o.id}')">Drop</button>`):`<button class="btn" onclick="fcTake('${o.id}')">Take</button>`}</td></tr>`}).join('')}</tbody></table></div>
  ${FCOMM.filter(x=>!x.done&&!B.some(o=>o.id===x.id)).length?`<p class="note">Still open from earlier weeks: ${FCOMM.filter(x=>!x.done&&!B.some(o=>o.id===x.id)).map(x=>`${esc(x.base)} for ${esc(x.client)} (${x.gp} gp) <a href="#" onclick="fcDrop('${x.id}');return false">drop</a>`).join(' · ')}</p>`:''}</section>`}
// the open commissions a forged item would satisfy
const fcMatch=(base,q,tier)=>FCOMM.filter(x=>!x.done&&x.base===base&&fqRank(q)>=fqRank(x.q)&&tier>=x.tier);
// the design as a Blueprint for the crafting check (its rarity, materials, profession, and item level)
function forgeBP(r){return {dcMod:r.dcMod||0,n:r.name,r:r.rar||'Common',mats:[...new Set(r.parts.filter(p=>p.m&&p.fit.lv!=='wrong').map(p=>p.m.n))],pr:r.prof,sp:r.realmSpec||'',lv:Math.max(1,r.il||1)}}
// ── where materials come from: the party's own inventories, and the artifacts they carry ──
function invIndex(){const M=new Map(),add=(n,c,q,gear)=>{const k=lc(n);if(!M.has(k))M.set(k,[]);M.get(k).push({n,c,q,gear})};
  PARTY.forEach(c=>(c.inv||[]).forEach(([n,q])=>{if((+q||0)>0)add(n,c,+q)}));
  PARTY.forEach(c=>(c.gear||[]).forEach(n=>{const b=BP_IDX.get(lc(n));if(b&&!b.design&&artifacts().includes(b))add(n,c,1,1)}));return M}
const artOf=n=>{const x=/^Artifact: (.+) \([^()]+\)$/.exec(n||'');return x?x[1]:n};
const invHas=(M,n)=>(M.get(lc(artOf(n)))||[]).reduce((a,h)=>a+h.q,0);
const invMats=M=>MATS.filter(m=>M.has(lc(m.n))).concat([...M.values()].map(h=>h[0]&&!MAT_IDX.get(lc(h[0].n))&&/\)$/.test(h[0].n)?varMat(h[0].n):null).filter(Boolean));
const invArts=M=>artifacts().filter(b=>M.has(lc(b.n)));
const holdersText=(M,n)=>(M.get(lc(artOf(n)))||[]).map(h=>(h.c.name||'?')+' ('+h.q+')').join(', ');
// what the forge uses: each part's material times its quantity (an artifact once), and how many the party has
function forgeNeeds(r,M){const need={};r.parts.forEach(p=>{if(p.m&&p.fit.lv!=='wrong')need[p.m.n]=(need[p.m.n]||0)+(p.m.art?1:(p.s.qty||1))});
  (r.forms?everResults(r.forms).filter(Boolean).flatMap(x=>x.added):[]).forEach(m=>{need[m.n]=(need[m.n]||0)+1});
  return Object.entries(need).map(([n,q])=>({n,q,have:invHas(M,n)}))}
// take materials out of the party's inventories, the forger's own first
function invTake(M,n,q,first){const hs=(M.get(lc(artOf(n)))||[]).slice().sort((a,b)=>(b.c===first)-(a.c===first));
  hs.forEach(h=>{if(q<=0)return;const k=Math.min(q,h.q);q-=k;h.q-=k;
    if(h.gear){const i=(h.c.gear||[]).findIndex(x=>lc(x)===lc(artOf(n)));if(i>=0)h.c.gear.splice(i,1)}
    else h.c.inv=(h.c.inv||[]).map(([x,v])=>lc(x)===lc(artOf(n))?[x,Math.max(0,(+v||0)-k)]:[x,v]).filter(([,v])=>v>0)})}
// the forger's level against the item's level sets the odds: at or above it, advantage, plus +1 quality for every 5 levels
// to spare (up to +5); below it, −2 for every level of difference
function forgeCheck(b,c){const k=craftCheck(b,c),lv=profLvIn(c,b.pr),gap=lv-b.lv,qb=gap>0?Math.min(5,Math.floor(gap/5)):0,pen=gap<0?gap*2:0;
  const fb=k.have<k.F.g-1?`It needs a grade ${ROMAN[k.F.g-1]} ${k.F.station} (${k.F.name}); ${k.have?'a grade '+ROMAN[k.have-1]+' one':'working without one'} is too far below.`:'';
  const blocked=!hasProfession(c,b.pr)?`${c.name||'They'} ${c.prof||c.prof2?'work '+profsOf(c).map(x=>x[0]).join(' and ')+', not '+b.pr:'have no profession'}: ${b.pr} is needed.`:fb;
  const mode=gap>=0&&!k.dis.length?'adv':gap<0&&k.dis.length?'dis':'';
  return {dc:k.dc+(b.dcMod||0),base:k.bonus,qb,pen,bonus:k.bonus+qb+pen,gap,lv,mode,dis:k.dis,blocked,F:k.F,time:k.time}}
function forgeQ(d,m,smith){if(d===1&&!smith)return 'ruin';if(d===20||m>=10)return 'Masterwork';if(m>=5)return 'Fine';if(m>=0||smith)return 'Standard';return m>=-3?'Flawed':'fail'}
function forgeOdds(dc,bonus,mode,smith){const o={Masterwork:0,Fine:0,Standard:0,Flawed:0,fail:0,ruin:0};
  for(let a=1;a<=20;a++)for(let b=1;b<=20;b++){const d=mode==='adv'?Math.max(a,b):mode==='dis'?Math.min(a,b):a;o[forgeQ(d,d+bonus-dc,smith)]+=1/400}return o}
const oddsHTML=o=>`<div class="fg-odds">${[['Masterwork','gold'],['Fine','green'],['Standard','text2'],['Flawed','gold2'],['fail','muted'],['ruin','red']].filter(([k])=>o[k]>.004).map(([k,col])=>`<span style="flex:${o[k]};background:color-mix(in srgb,var(--${col}) 55%,transparent)" title="${k==='fail'?'Nothing made':k==='ruin'?'A material ruined':k}: ${Math.round(o[k]*100)}%">${o[k]>.08?(k==='fail'?'none':k==='ruin'?'ruin':k)+' '+Math.round(o[k]*100)+'%':''}</span>`).join('')}</div>`;
// powers: the same property from several parts merges, equal Potencies combining a step higher (1+1=2, 2+2=3);
// an item keeps up to three properties and three traits, and the smith chooses which
function potMerge(list){const pots=list.map(x=>Math.max(1,x|0));if(!pots.length)return 0;const a=pots.map(potRank).sort((x,y)=>x-y);for(let i=0;i<a.length-1;){if(a[i]===a[i+1]){a.splice(i,2,a[i]+1);a.sort((x,y)=>x-y);i=0}else i++}return Math.min(50,Math.max(Math.max(...pots),a[a.length-1]*5))}
function forgePowers(r){const P={},T={};
  (r.props||[]).forEach(p=>{const pot=p.half?Math.max(1,Math.floor((p.m.pot||1)/2)):(p.m.pot||1),x=P[p.m.pn]=P[p.m.pn]||{k:'p',n:p.m.pn,pots:[],t:(p.m.prop||'').replace(/^[^:]+:\s*/,''),from:[]};x.pots.push(pot);x.from.push(p.m.n)});
  (r.traits||[]).forEach(t=>{const tr=t.m.tr;if(tr&&!T[tr.n])T[tr.n]={k:'t',n:tr.n,t:tr.t||'',from:[t.m.n]}});
  return Object.values(P).map(x=>Object.assign(x,{pot:potMerge(x.pots),id:'p:'+x.n})).sort((a,b)=>b.pot-a.pot).concat(Object.values(T).map(x=>Object.assign(x,{id:'t:'+x.n})))}
// an item keeps up to three properties and up to three traits, chosen by the smith
const FORGE_MAX_POW=3;
const powKind=id=>id.slice(0,2)==='p:'?'p':'t';
function forgePick(r){const A=forgePowers(r),ids=A.map(x=>x.id);let p=Array.isArray(FORGE.pick)?FORGE.pick.filter(x=>ids.includes(x)):ids.filter(x=>powKind(x)==='p').slice(0,FORGE_MAX_POW).concat(ids.filter(x=>powKind(x)==='t').slice(0,FORGE_MAX_POW));
  p=p.filter(x=>powKind(x)==='p').slice(0,FORGE_MAX_POW).concat(p.filter(x=>powKind(x)==='t').slice(0,FORGE_MAX_POW));return {A,p}}
function forgePickToggle(id){const {p}=forgePick(forgeResult());let n=p.slice();const k=powKind(id),what=k==='p'?'properties':'traits';if(n.includes(id))n=n.filter(x=>x!==id);else{if(n.filter(x=>powKind(x)===k).length>=FORGE_MAX_POW){toast('An item holds up to '+FORGE_MAX_POW+' '+what+': untick one first');return}n.push(id)}FORGE.pick=n;store.set('forge',FORGE);forgeOut()}
const pickedCombos=(A,p)=>{const S=new Set(A.filter(x=>p.includes(x.id)).map(x=>x.n));return FCOMBOS.filter(([a,b])=>S.has(a)&&S.has(b))};
// evolving weapons are a god's gift, never forged: Stable ones grow 3 ranks (15 Potency) with each of the wielder's levels;
// Unstable ones feed on materials (three of one kind for its trait), keep up to 15 traits, and use 5 at a time
const EVO_MAX_STOCK=15,EVO_MAX_ACT=5;
// ── sound: each strike sounds like what is being made ──
let FSND=store.get('forgeSound',true),_fac=null;
function forgeKind(r){const pm=(r.parts.find(p=>p.s.role==='primary')||{}).m,B=r.B;if(B.potion)return 'brew';if(B.focus&&!B.dmg)return 'arcane';const c=pm?matCode(pm):'O';return c==='O'||c==='K'?'metal':c==='W'?'wood':c==='B'?'bone':c==='S'||c==='G'?'stone':c==='F'?'cloth':'metal'}
function forgeSound(kind,n){if(!FSND)return;try{_fac=_fac||new (window.AudioContext||window.webkitAudioContext)();const ac=_fac,t=ac.currentTime+.01,out=ac.createGain();out.gain.value=.3;out.connect(ac.destination);
  const tone=(f,d,type,g,at,slide)=>{at=at||0;const o=ac.createOscillator(),v=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t+at);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+at+d);v.gain.setValueAtTime(g,t+at);v.gain.exponentialRampToValueAtTime(.001,t+at+d);o.connect(v);v.connect(out);o.start(t+at);o.stop(t+at+d+.05)};
  const noise=(d,f,g,at)=>{at=at||0;const len=Math.max(1,Math.floor(ac.sampleRate*d)),buf=ac.createBuffer(1,len,ac.sampleRate),x=buf.getChannelData(0);for(let i=0;i<len;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
    const s=ac.createBufferSource(),bp=ac.createBiquadFilter(),v=ac.createGain();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=1.2;v.gain.value=g;s.buffer=buf;s.connect(bp);bp.connect(v);v.connect(out);s.start(t+at)};
  const p=1+((n||1)-1)*.06;
  if(kind==='metal'){noise(.08,3200,1.2);tone(880*p,.9,'triangle',.3);tone(1320*p,.6,'sine',.15);tone(2210*p,.35,'sine',.08)}
  else if(kind==='wood'){noise(.06,900,1.4);tone(220*p,.18,'triangle',.45,0,140)}
  else if(kind==='bone'){noise(.05,1700,1.2);tone(420*p,.22,'square',.1,0,300)}
  else if(kind==='stone'){noise(.12,650,1.6);tone(140*p,.25,'sine',.4,0,90)}
  else if(kind==='cloth'){noise(.15,420,.9);tone(110,.15,'sine',.25)}
  else if(kind==='brew')[0,.07,.15].forEach((a,i)=>tone((300+i*120)*p,.12,'sine',.25,a,700+i*150));
  else if(kind==='arcane')[0,.05,.1].forEach((a,i)=>tone((660+i*220)*p,.6,'sine',.14,a));
  else if(kind==='done')[523,659,784,1047].forEach((f,i)=>tone(f,.55,'triangle',.2,i*.09));
  else if(kind==='fail'){tone(160,.5,'sawtooth',.12,0,70);noise(.2,300,.6)}}catch(e){}}
function forgeSoundToggle(){FSND=!FSND;store.set('forgeSound',FSND);const b=$('fg-snd');if(b)b.textContent=FSND?'🔊 Sound on':'🔇 Sound off'}
function forgeSpark(){const a=document.querySelector('.fg-anvil');if(!a||matchMedia('(prefers-reduced-motion: reduce)').matches)return;a.classList.remove('hit');void a.offsetWidth;a.classList.add('hit');
  for(let i=0;i<14;i++){const s=document.createElement('i');s.className='fg-spark';const ang=-Math.PI*(.15+Math.random()*.7),d=40+Math.random()*70;s.style.setProperty('--dx',Math.cos(ang)*d+'px');s.style.setProperty('--dy',Math.sin(ang)*d+'px');a.appendChild(s);setTimeout(()=>s.remove(),700)}}
// ── the forge's living background: embers rising from a glowing hearth (after vantajs.com's moving backdrops) ──
function forgeFx(){const cv=$('fg-fx');if(!cv||!cv.getContext)return;const x=cv.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1),still=matchMedia('(prefers-reduced-motion: reduce)').matches;let W=0,H=0;const P=[];
  const size=()=>{const r=cv.getBoundingClientRect();W=cv.width=Math.max(1,Math.round(r.width*dpr));H=cv.height=Math.max(1,Math.round(r.height*dpr))};size();
  const make=fresh=>({x:Math.random()*W,y:fresh?Math.random()*H:H+Math.random()*40*dpr,r:(Math.random()*1.8+.6)*dpr,vy:-(Math.random()*.9+.35)*dpr,vx:(Math.random()-.5)*.35*dpr,life:Math.random()*.5+.5,h:18+Math.random()*28,w:Math.random()*6});
  for(let i=0;i<(still?40:110);i++)P.push(make(true));
  const draw=ts=>{if(!cv.isConnected)return;const r=cv.getBoundingClientRect();if(Math.round(r.width*dpr)!==W||Math.round(r.height*dpr)!==H)size();x.clearRect(0,0,W,H);
    const heaven=document.documentElement.dataset.theme==='light',fl=.5+.5*Math.sin((ts||0)/700);
    if(heaven){HV=HV&&HV.W===W&&HV.H===H?HV:heavenScene(W,H,dpr);heavenPaint(x,HV,ts||0,still);x.shadowColor='rgba(255,215,110,.9)';x.shadowBlur=10*dpr}
    else{HL=HL&&HL.W===W&&HL.H===H?HL:hellScene(W,H,dpr);hellPaint(x,HL,ts||0,still);x.shadowColor='rgba(255,90,30,.95)';x.shadowBlur=8*dpr}
    P.forEach(p=>{if(!still){p.y+=p.vy*(heaven?.55:1);p.x+=p.vx+Math.sin(p.y/(60*dpr)+p.w)*(heaven?.6:.3)*dpr;p.life-=.0016}if(p.y<-10||p.life<=0)Object.assign(p,make(false));
      const a=Math.max(0,Math.min(1,p.life));x.beginPath();x.fillStyle=heaven?`hsla(${44+p.h/6},90%,${70+p.r*4}%,${a*.9})`:`hsla(${p.h-12},100%,${52+p.r*3}%,${a})`;x.arc(p.x,p.y,p.r*(heaven?1.2:1),0,Math.PI*2);x.fill()});
    x.shadowBlur=0;if(heaven)heavenFront(x,HV,ts||0,still);else hellFront(x,HL,ts||0,still);if(!still)requestAnimationFrame(draw)};let HV=null,HL=null;requestAnimationFrame(draw)}
// ── the Hell Forge, painted: a smoke-red sky under a black eclipse ringed in fire and a turning circle of infernal marks,
// jagged peaks and an erupting volcano, a dark citadel with burning windows, a lava river, smoke lit from below, hanging chains,
// red lightning in the clouds, and ash falling through the rising embers ──
function hellSmoke(w,h,seed){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
  for(let i=0;i<18;i++){const px=w*(.1+rnd()*.8),py=h*(.35+rnd()*.4),pr=h*(.2+rnd()*.25),q=g.createRadialGradient(px,py,pr*.1,px,py,pr);q.addColorStop(0,'rgba(40,18,16,.9)');q.addColorStop(.6,'rgba(30,12,12,.55)');q.addColorStop(1,'rgba(20,8,8,0)');g.fillStyle=q;g.beginPath();g.arc(px,py,pr,0,Math.PI*2);g.fill()}
  g.globalCompositeOperation='source-atop';const t=g.createLinearGradient(0,0,0,h);t.addColorStop(0,'rgba(20,6,8,.4)');t.addColorStop(.6,'rgba(90,20,10,.25)');t.addColorStop(1,'rgba(220,70,20,.55)');g.fillStyle=t;g.fillRect(0,0,w,h);return c}
function hellRidge(W,H,base,amp,jag,seed){let r=seed;const rnd=()=>(r=(r*9301+49297)%233280)/233280,pts=[];let y=base;for(let x0=0;x0<=W+40;x0+=W/jag){y=base-rnd()*amp-(rnd()<.18?amp*.8:0);pts.push([x0,y])}return pts}
function hellScene(W,H,dpr){const S={W,H,dpr,smoke:[],ash:[],bolts:[],nextBolt:0},n=Math.max(1,Math.round(W/(300*dpr)));
  S.far=hellRidge(W,H,H*.6,H*.16,Math.max(14,n*7),7);S.near=hellRidge(W,H,H*.74,H*.1,Math.max(10,n*5),31);
  S.volc={x:W*(W>H?.1:.15),y:H*.6,w:W*(W>H?.13:.3),h:H*.26};S.cit={x:W*(W>H?.9:.82),y:H*.68,s:Math.min(1.15,W/(1200*dpr))*dpr};
  for(let i=0;i<n+4;i++){const w=Math.round((220+Math.random()*260)*dpr),h=Math.round(w*.5);S.smoke.push({img:hellSmoke(w,h,1+Math.floor(Math.random()*9999)),x:Math.random()*(W+w)-w,y:H*(.15+Math.random()*.55),sp:(.08+Math.random()*.16)*dpr,vy:-(.03+Math.random()*.05)*dpr,al:.45+Math.random()*.35})}
  for(let i=0;i<Math.min(50,14+n*8);i++)S.ash.push(hellAsh(W,H,dpr,true));return S}
function hellAsh(W,H,dpr,fresh){return {x:Math.random()*W,y:fresh?Math.random()*H:-10*dpr,r:(.8+Math.random()*1.8)*dpr,vy:(.2+Math.random()*.4)*dpr,sw:Math.random()*6.3,rot:Math.random()*6.3}}
function hellCitadel(x,C,ts){const s=C.s;x.save();x.translate(C.x,C.y);x.scale(s,s);x.fillStyle='#0d0607';x.beginPath();
  const tw=[[-70,-90,16],[-40,-150,20],[-10,-210,24],[22,-160,20],[52,-110,16],[78,-70,14]];x.moveTo(-95,10);tw.forEach(([cx,top,w])=>{x.lineTo(cx-w,-20);x.lineTo(cx-w,top+18);x.lineTo(cx-w-4,top+18);x.lineTo(cx,top-26);x.lineTo(cx+w+4,top+18);x.lineTo(cx+w,top+18);x.lineTo(cx+w,-20)});x.lineTo(95,10);x.closePath();x.fill();
  tw.forEach(([cx,top,w],i)=>{for(let k=0;k<3;k++){const fl=.55+.45*Math.sin(ts/300+i*1.7+k*2.3);x.fillStyle=`rgba(255,${110+Math.round(60*fl)},40,${.55+.4*fl})`;x.fillRect(cx-2.5,top+30+k*26,5,9)}});
  x.globalAlpha=.6;x.fillStyle='#ff6a2a';x.shadowColor='#ff4a10';x.shadowBlur=18;x.beginPath();x.arc(-10,-236,3.2,0,Math.PI*2);x.fill();x.restore()}
function hellPaint(x,S,ts,still){const{W,H,dpr}=S,t=still?0:ts,ex=W*(W>H?.22:.2),ey=H*(W>H?.15:.08),R=Math.max(W,H);
  // the sky: black at the top, a burning red low over the peaks
  let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#070304');g.addColorStop(.3,'#1c0606');g.addColorStop(.55,'#4a0c06');g.addColorStop(.72,'#7a1906');g.addColorStop(1,'#2a0603');x.fillStyle=g;x.fillRect(0,0,W,H);
  // red lightning lights the clouds now and then
  if(!still&&t>S.nextBolt){S.nextBolt=t+3500+Math.random()*7000;const bx=W*(.3+Math.random()*.6);let px=bx,py=0;const pts=[[px,py]];while(py<H*(.3+Math.random()*.15)){px+=(Math.random()-.5)*40*dpr;py+=(12+Math.random()*22)*dpr;pts.push([px,py])}S.bolts.push({pts,born:t})}
  S.bolts=S.bolts.filter(b=>t-b.born<420);S.bolts.forEach(b=>{const a=1-(t-b.born)/420;g=x.createRadialGradient(b.pts[0][0],H*.12,0,b.pts[0][0],H*.12,R*.5);g.addColorStop(0,`rgba(255,80,60,${.28*a})`);g.addColorStop(1,'rgba(255,60,40,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.save();x.strokeStyle=`rgba(255,190,170,${.9*a})`;x.shadowColor='#ff3b2a';x.shadowBlur=14*dpr;x.lineWidth=1.6*dpr;x.beginPath();b.pts.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.stroke();x.restore()});
  // the black eclipse: a corona of fire, a dark disc, and a turning ring of infernal marks
  g=x.createRadialGradient(ex,ey,0,ex,ey,R*.55);g.addColorStop(0,'rgba(255,90,30,.35)');g.addColorStop(.2,'rgba(160,30,10,.18)');g.addColorStop(1,'rgba(80,10,5,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.translate(ex,ey);const pulse=1+.04*Math.sin(t/900);x.rotate(t/70000);g=x.createRadialGradient(0,0,40*dpr,0,0,R*.6);g.addColorStop(0,'rgba(255,110,40,.35)');g.addColorStop(.4,'rgba(200,40,10,.08)');g.addColorStop(1,'rgba(200,40,10,0)');x.fillStyle=g;x.beginPath();
  for(let i=0;i<36;i++){const a=i*Math.PI/18,w=i%3?.01:.025;x.moveTo(0,0);x.arc(0,0,R*.6,a-w,a+w)}x.fill();x.rotate(-t/70000);
  g=x.createRadialGradient(0,0,34*dpr,0,0,62*dpr*pulse);g.addColorStop(0,'rgba(255,235,180,1)');g.addColorStop(.12,'rgba(255,150,50,.95)');g.addColorStop(.45,'rgba(220,50,10,.5)');g.addColorStop(1,'rgba(150,20,5,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,62*dpr*pulse,0,Math.PI*2);x.fill();
  x.fillStyle='#060203';x.beginPath();x.arc(0,0,36*dpr,0,Math.PI*2);x.fill();
  x.rotate(-t/45000);x.strokeStyle='rgba(255,90,40,.5)';x.lineWidth=1.2*dpr;x.beginPath();x.arc(0,0,92*dpr,0,Math.PI*2);x.stroke();x.beginPath();x.arc(0,0,104*dpr,0,Math.PI*2);x.stroke();x.fillStyle='rgba(255,120,50,.75)';
  for(let i=0;i<12;i++){x.save();x.rotate(i*Math.PI/6);x.translate(0,-98*dpr);x.beginPath();if(i%3===0){x.moveTo(0,-6*dpr);x.lineTo(4*dpr,4*dpr);x.lineTo(-4*dpr,4*dpr)}else{x.moveTo(-1*dpr,-4*dpr);x.lineTo(3*dpr,0);x.lineTo(-1*dpr,4*dpr);x.lineTo(1*dpr,0)}x.closePath();x.fill();x.restore()}
  x.rotate(t/30000);x.globalAlpha=.4;x.setLineDash([1.5*dpr,9*dpr]);x.beginPath();x.arc(0,0,128*dpr,0,Math.PI*2);x.stroke();x.setLineDash([]);x.restore();
  // smoke, drifting and rising, lit from below
  S.smoke.forEach(c=>{if(!still){c.x+=c.sp;c.y+=c.vy;if(c.x>W)c.x=-c.img.width;if(c.y<-c.img.height)c.y=H*.7}x.globalAlpha=c.al;x.drawImage(c.img,c.x,c.y)});x.globalAlpha=1;
  // the far peaks, the volcano and its fire, and the citadel
  const ridge=(pts,fill,glow)=>{x.beginPath();x.moveTo(0,H);pts.forEach(([px,py])=>x.lineTo(px,py));x.lineTo(W,H);x.closePath();x.fillStyle=fill;x.fill();if(glow){x.save();x.strokeStyle=glow;x.lineWidth=1.2*dpr;x.beginPath();pts.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.stroke();x.restore()}};
  ridge(S.far,'#1a0707','rgba(255,90,40,.25)');
  const V=S.volc,fl=.6+.4*Math.sin(t/260)*Math.sin(t/710);g=x.createRadialGradient(V.x,V.y-V.h,0,V.x,V.y-V.h,V.w*1.4);g.addColorStop(0,`rgba(255,140,40,${.55*fl})`);g.addColorStop(1,'rgba(255,60,10,0)');x.fillStyle=g;x.fillRect(V.x-V.w*1.5,V.y-V.h*2.4,V.w*3,V.h*2.6);
  x.fillStyle='#120505';x.beginPath();x.moveTo(V.x-V.w,V.y+H*.1);x.lineTo(V.x-V.w*.14,V.y-V.h);x.lineTo(V.x+V.w*.14,V.y-V.h);x.lineTo(V.x+V.w,V.y+H*.1);x.closePath();x.fill();
  x.strokeStyle=`rgba(255,${90+Math.round(70*fl)},30,.85)`;x.lineWidth=2*dpr;x.shadowColor='#ff4a10';x.shadowBlur=10*dpr;x.beginPath();x.moveTo(V.x-V.w*.08,V.y-V.h+2*dpr);x.quadraticCurveTo(V.x-V.w*.2,V.y-V.h*.5,V.x-V.w*.32,V.y-V.h*.1);x.moveTo(V.x+V.w*.06,V.y-V.h+2*dpr);x.quadraticCurveTo(V.x+V.w*.24,V.y-V.h*.4,V.x+V.w*.18,V.y);x.stroke();x.shadowBlur=0;
  hellCitadel(x,S.cit,t);
  ridge(S.near,'#0c0405','rgba(255,70,20,.35)')}
// in front of the embers: the lava river, hanging chains, falling ash, and a dark vignette
function hellFront(x,S,ts,still){const{W,H,dpr}=S,t=still?0:ts,ly=H*.86;
  let g=x.createLinearGradient(0,ly-20*dpr,0,H);g.addColorStop(0,'rgba(255,90,20,0)');g.addColorStop(.18,'rgba(255,110,30,.55)');g.addColorStop(.45,'rgba(220,50,10,.85)');g.addColorStop(1,'rgba(120,15,5,.95)');x.fillStyle=g;x.beginPath();x.moveTo(0,H);
  for(let px=0;px<=W;px+=12*dpr)x.lineTo(px,ly+Math.sin(px/(90*dpr)+t/1400)*5*dpr+Math.sin(px/(37*dpr)-t/900)*2*dpr);x.lineTo(W,H);x.closePath();x.fill();
  x.save();x.globalCompositeOperation='lighter';for(let k=0;k<4;k++){x.strokeStyle=`rgba(255,${180-k*25},70,${.35-k*.06})`;x.lineWidth=(1.4-k*.2)*dpr;x.beginPath();const yy=ly+(12+k*14)*dpr;
    for(let px=0;px<=W;px+=10*dpr){const yv=yy+Math.sin(px/(60*dpr)+t/(800+k*300)+k)*3*dpr;px?x.lineTo(px,yv):x.moveTo(px,yv)}x.stroke()}x.restore();
  [[W*.035,1],[W*.965,-1]].forEach(([cxp,d],j)=>{const sw=Math.sin(t/2200+j)*.05,len=H*(.42+.08*j);x.save();x.translate(cxp,0);x.rotate(sw*d);x.strokeStyle='#2a1a17';x.lineWidth=3*dpr;
    for(let y=0,k=0;y<len;y+=14*dpr,k++){x.beginPath();if(k%2)x.ellipse(0,y,3.2*dpr,7*dpr,0,0,Math.PI*2);else x.ellipse(0,y,1.5*dpr,7*dpr,0,0,Math.PI*2);x.stroke()}
    x.strokeStyle='rgba(255,90,30,.35)';x.lineWidth=1*dpr;x.beginPath();x.moveTo(2*dpr,0);x.lineTo(2*dpr,len);x.stroke();x.restore()});
  S.ash.forEach((a,i)=>{if(!still){a.y+=a.vy;a.sw+=.015;a.x+=Math.sin(a.sw)*.4*dpr;a.rot+=.02;if(a.y>H)S.ash[i]=a=hellAsh(W,H,dpr,false)}x.save();x.translate(a.x,a.y);x.rotate(a.rot);x.fillStyle='rgba(140,128,124,.55)';x.fillRect(-a.r,-a.r*.6,a.r*2,a.r*1.2);x.restore()});
  g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.4,W/2,H*.5,Math.max(W,H)*.85);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,0,W,H)}
// ── the Heaven Forge, painted: a sky from azure to gold, a turning sunburst with halo rings and a ring of celestial marks,
// god rays, clouds lit gold from above in three depths, marble temples on the cloud banks, falling feathers, and glints ──
function heavenCloud(w,h,seed){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
  for(let i=0;i<22;i++){const px=w*(.12+rnd()*.76),py=h*(.42+rnd()*.32)-Math.sin((px/w)*Math.PI)*h*.2,pr=h*(.18+rnd()*.24),q=g.createRadialGradient(px,py-pr*.25,pr*.1,px,py,pr);
    q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.6,'rgba(255,253,248,.85)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.beginPath();g.arc(px,py,pr,0,Math.PI*2);g.fill()}
  g.globalCompositeOperation='source-atop';const t=g.createLinearGradient(0,0,0,h);t.addColorStop(0,'rgba(255,214,120,.55)');t.addColorStop(.38,'rgba(255,246,222,.12)');t.addColorStop(.7,'rgba(214,206,236,.22)');t.addColorStop(1,'rgba(184,176,214,.5)');g.fillStyle=t;g.fillRect(0,0,w,h);return c}
function heavenScene(W,H,dpr){const S={W,H,dpr,clouds:[],feathers:[],glints:[]},n=Math.max(1,Math.round(W/(260*dpr)));
  [[.5,.06,.22,.12,.32],[.75,.1,.36,.22,.55],[1,.16,.62,.34,.9]].forEach(([depth,sp,y0,y1,al],L)=>{for(let i=0;i<n+2;i++){const w=Math.round((180+Math.random()*220)*dpr*depth*1.4),h=Math.round(w*.42);
    S.clouds.push({L,img:heavenCloud(w,h,1+Math.floor(Math.random()*9999)),x:Math.random()*(W+w)-w,y:H*(y0+Math.random()*(y1))+(L===2?H*.12:0),sp:sp*dpr*(.6+Math.random()*.8),al:al*(.75+Math.random()*.25),bob:Math.random()*6})}});
  for(let i=0;i<Math.min(14,4+n*2);i++)S.feathers.push(heavenFeather(W,H,dpr,true));
  for(let i=0;i<Math.min(40,10+n*6);i++)S.glints.push({x:Math.random()*W,y:Math.random()*H*.6,r:(1.5+Math.random()*3)*dpr,ph:Math.random()*6.3,sp:.6+Math.random()*1.4});
  S.temples=[{x:W*.06,y:H*.7,s:Math.min(1.1,W/(1300*dpr))*dpr},{x:W*.95,y:H*.62,s:Math.min(.8,W/(1700*dpr))*dpr}];return S}
function heavenFeather(W,H,dpr,fresh){return {x:Math.random()*W,y:fresh?Math.random()*H:-30*dpr,len:(14+Math.random()*16)*dpr,rot:Math.random()*6.3,vr:(Math.random()-.5)*.02,vy:(.25+Math.random()*.35)*dpr,sw:Math.random()*6.3}}
function heavenTemple(x,T,ts){const s=T.s;x.save();x.translate(T.x,T.y);x.scale(s,s);x.globalAlpha=.55;const m=x.createLinearGradient(0,-120,0,10);m.addColorStop(0,'#fffdf6');m.addColorStop(1,'#e9e1f2');x.fillStyle=m;x.strokeStyle='rgba(176,132,40,.45)';x.lineWidth=1.2/s*T.s;
  x.fillRect(-78,-6,156,8);x.fillRect(-70,-12,140,7);for(let i=0;i<6;i++){x.fillRect(-60+i*24-5,-92,10,80);x.strokeRect(-60+i*24-5,-92,10,80)}
  x.fillRect(-72,-100,144,9);x.beginPath();x.moveTo(-78,-100);x.lineTo(0,-132);x.lineTo(78,-100);x.closePath();x.fill();x.stroke();
  x.globalAlpha=.35+.15*Math.sin(ts/1300+T.x);x.fillStyle='#ffd77a';x.beginPath();x.arc(0,-112,5,0,Math.PI*2);x.fill();x.restore()}
function heavenPaint(x,S,ts,still){const{W,H,dpr}=S,t=still?0:ts,sx=W*(W>H?.8:.9),sy=H*(W>H?.1:.05),R=Math.max(W,H)*1.2,ra=Math.atan2(H*.75-sy,W*.42-sx);
  // the sky
  let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7fa9df');g.addColorStop(.22,'#b9d1ef');g.addColorStop(.48,'#f6e7c4');g.addColorStop(.72,'#fff6e2');g.addColorStop(1,'#f3ecf6');x.fillStyle=g;x.fillRect(0,0,W,H);
  // the sun's glow
  g=x.createRadialGradient(sx,sy,0,sx,sy,R*.75);g.addColorStop(0,'rgba(255,250,225,1)');g.addColorStop(.08,'rgba(255,236,170,.9)');g.addColorStop(.3,'rgba(255,222,140,.35)');g.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
  // a sunburst that turns very slowly
  x.save();x.translate(sx,sy);x.rotate(t/90000);g=x.createRadialGradient(0,0,30*dpr,0,0,R);g.addColorStop(0,'rgba(255,243,200,.5)');g.addColorStop(.5,'rgba(255,236,180,.12)');g.addColorStop(1,'rgba(255,236,180,0)');x.fillStyle=g;x.beginPath();
  const N=48;for(let i=0;i<N;i++){const a=i*2*Math.PI/N,w=(i%2?.012:.03);x.moveTo(0,0);x.arc(0,0,R,a-w,a+w)}x.fill();x.restore();
  // god rays that sway
  x.save();x.globalCompositeOperation='screen';for(let k=0;k<7;k++){const a=ra+(k-3)*.17+Math.sin(t/5200+k*1.7)*.035,w=(.025+.02*((k*37)%5)/5),len=H*1.3,bx=sx+Math.cos(a)*len,by=sy+Math.sin(a)*len;
    g=x.createLinearGradient(sx,sy,bx,by);g.addColorStop(0,`rgba(255,244,205,${.32+.1*Math.sin(t/2300+k)})`);g.addColorStop(1,'rgba(255,244,205,0)');x.fillStyle=g;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(a-w)*len,sy+Math.sin(a-w)*len);x.lineTo(sx+Math.cos(a+w)*len,sy+Math.sin(a+w)*len);x.closePath();x.fill()}x.restore();
  // halo rings and a ring of celestial marks around the sun
  x.save();x.translate(sx,sy);const br=1+.03*Math.sin(t/1800);x.strokeStyle='rgba(205,160,60,.45)';x.lineWidth=1.4*dpr;[64,98].forEach((r,i)=>{x.globalAlpha=i?.55:.8;x.beginPath();x.arc(0,0,r*dpr*br,0,Math.PI*2);x.stroke()});
  x.rotate(-t/40000);x.globalAlpha=.6;x.fillStyle='rgba(190,140,40,.75)';for(let i=0;i<24;i++){x.save();x.rotate(i*Math.PI/12);x.translate(0,-81*dpr*br);if(i%6===0){x.beginPath();x.moveTo(0,-5*dpr);x.lineTo(3*dpr,0);x.lineTo(0,5*dpr);x.lineTo(-3*dpr,0);x.closePath();x.fill()}else x.fillRect(-.7*dpr,-3*dpr,1.4*dpr,6*dpr);x.restore()}
  x.rotate(t/26000);x.globalAlpha=.35;x.setLineDash([2*dpr,7*dpr]);x.beginPath();x.arc(0,0,128*dpr*br,0,Math.PI*2);x.stroke();x.setLineDash([]);x.restore();
  // the sun's disc
  g=x.createRadialGradient(sx,sy,0,sx,sy,40*dpr);g.addColorStop(0,'#fffef6');g.addColorStop(.55,'#fff3c4');g.addColorStop(1,'rgba(255,230,150,0)');x.fillStyle=g;x.beginPath();x.arc(sx,sy,40*dpr,0,Math.PI*2);x.fill();
  // glints: four-pointed stars that twinkle
  S.glints.forEach(p=>{const a=Math.max(0,Math.sin(t/1000*p.sp+p.ph));if(a<.05)return;const r=p.r*(.6+a*.6);x.save();x.translate(p.x,p.y);x.globalAlpha=a*.85;x.fillStyle='#fff7d6';x.beginPath();
    x.moveTo(0,-r*2.4);x.quadraticCurveTo(0,0,r*2.4,0);x.quadraticCurveTo(0,0,0,r*2.4);x.quadraticCurveTo(0,0,-r*2.4,0);x.quadraticCurveTo(0,0,0,-r*2.4);x.fill();x.globalAlpha=a*.5;x.fillStyle='#f2c75a';x.beginPath();x.arc(0,0,r*.5,0,Math.PI*2);x.fill();x.restore()});
  // far and middle clouds, with the temples standing on the middle bank
  S.clouds.forEach(c=>{if(c.L===2)return;if(!still){c.x+=c.sp;if(c.x>W)c.x=-c.img.width}x.globalAlpha=c.al;x.drawImage(c.img,c.x,c.y+Math.sin(t/4000+c.bob)*3*dpr)});x.globalAlpha=1;
  S.temples.forEach(T=>heavenTemple(x,T,t))}
// in front of the golden motes: the near cloud bank, falling feathers, and a soft gilded vignette
function heavenFront(x,S,ts,still){const{W,H,dpr}=S,t=still?0:ts;
  S.clouds.forEach(c=>{if(c.L!==2)return;if(!still){c.x+=c.sp;if(c.x>W)c.x=-c.img.width}x.globalAlpha=c.al;x.drawImage(c.img,c.x,c.y+Math.sin(t/3500+c.bob)*4*dpr)});x.globalAlpha=1;
  let g=x.createLinearGradient(0,H*.82,0,H);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,252,244,.85)');x.fillStyle=g;x.fillRect(0,H*.82,W,H*.18);
  S.feathers.forEach((f,i)=>{if(!still){f.y+=f.vy;f.sw+=.012;f.x+=Math.sin(f.sw)*.6*dpr;f.rot+=f.vr+Math.sin(f.sw)*.004;if(f.y>H+30*dpr)S.feathers[i]=f=heavenFeather(W,H,dpr,false)}
    x.save();x.translate(f.x,f.y);x.rotate(f.rot);const L=f.len;x.globalAlpha=.85;g=x.createLinearGradient(0,-L,0,L);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#efe9f7');x.fillStyle=g;x.strokeStyle='rgba(170,150,190,.45)';x.lineWidth=.8*dpr;
    x.beginPath();x.moveTo(0,-L);x.bezierCurveTo(L*.42,-L*.55,L*.36,L*.45,0,L*.8);x.bezierCurveTo(-L*.3,L*.4,-L*.4,-L*.5,0,-L);x.fill();x.stroke();x.strokeStyle='rgba(200,170,90,.6)';x.beginPath();x.moveTo(0,-L*.9);x.quadraticCurveTo(L*.05,0,0,L*1.15);x.stroke();x.restore()});
  g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.45,W/2,H*.5,Math.max(W,H)*.9);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(1,'rgba(214,176,90,.16)');x.fillStyle=g;x.fillRect(0,0,W,H)}
// ── the forge panel before the item exists: the estimate, the powers to keep, and the hammer ──
let FF={who:'',smith:'',strikes:0,res:null,made:''};
// the DM's forge opens only for someone who has entered the hidden class code (this browser session)
const forgeDMok=()=>!!HC;
const forgeDM=()=>!!FORGE.dm&&forgeDMok();
const forgeSmithOk=()=>{if(FF.smith&&!(+FF.smith>=1))FF.smith=''};
function forgeDMHTML(r,ready){const c=PARTY.find(x=>x.id===FF.who)||null,{A,p}=forgePick(r);
  return `<div class="fg-est"><div class="blk"><h4>🎲 The DM's forge</h4></div>
    ${kv([['Item level',`<b>${r.il||'?'}</b>${r.mil?` <small class="note" style="margin:0">(materials' Item Level ${r.mil} × 2, the Blueprint scale)</small>`:''}${r.rar?' · '+rarB(r.rar):''}`],['Forge it would need',esc(forgeText(forgeReq(forgeBP(r))))]])}
    ${A.length?`<div class="blk" style="margin-top:10px"><h4>✧ Powers to keep (${p.filter(x=>powKind(x)==='p').length} of ${FORGE_MAX_POW} properties · ${p.filter(x=>powKind(x)==='t').length} of ${FORGE_MAX_POW} traits)</h4></div><div class="fg-pows">${A.map(x=>`<label class="fg-pow${p.includes(x.id)?' on':''}"><input type="checkbox" ${p.includes(x.id)?'checked':''} onchange="forgePickToggle(${esc(JSON.stringify(x.id))})"> <span><b>${x.k==='p'?'✧':'◆'} ${esc(x.n)}</b>${x.k==='p'?` <span class="b ghost">Potency ${x.pot}</span>`:''}</span></label>`).join('')}</div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px"><label class="note" style="margin:0">Give it to <select class="sel" id="ff-who"><option value="">Choose…</option><option value="-"${FF.who==='-'?' selected':''}>Nobody yet: keep it as a Blueprint</option>${PARTY.map(x=>`<option value="${x.id}"${x.id===FF.who?' selected':''}>${esc(x.name||'Unnamed')}</option>`).join('')}</select></label>
      <label class="note" style="margin:0">Quality <select class="sel" id="ff-dmq">${FQ.map(q=>`<option${(FF.dmq||'Standard')===q[0]?' selected':''}>${q[0]}</option>`).join('')}</select></label>
      <label class="note" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox" id="ff-dmquirk" ${FF.dmQuirk?'checked':''}> roll a quirk</label></div>
    <div class="fg-anvilrow"><div class="fg-anvil" aria-hidden="true">⚒</div><div><button class="btn primary" ${ready&&(c||FF.who==='-')?'':'disabled'} onclick="forgeDMMake()">✨ Make it</button><div class="note" style="margin:4px 0 0">${!ready?'Fill every required part first.':!(c||FF.who==='-')?'Choose who gets it, or keep it as a Blueprint.':c?'No roll and no materials used: the DM\'s word is enough.':'No roll and no materials used. It goes into the Blueprints (your designs), ready to give out on the Party page.'}</div></div></div></div>`}
function forgeDMMake(){const r=forgeResult(),c=PARTY.find(x=>x.id===FF.who)||null;if((!c&&FF.who!=='-')||!forgeDM())return;FF.dmq=($('ff-dmq')||{}).value||'Standard';FF.dmQuirk=!!($('ff-dmquirk')||{}).checked;
  [1,2,3].forEach((n,i)=>setTimeout(()=>{forgeSound(forgeKind(r),n);forgeSpark()},i*260));
  setTimeout(()=>forgeMake(r,c,FF.dmq,FF.dmQuirk?fqQuirk():{d:0,n:'',t:''},'Made by the DM.',null,invIndex(),true),820)}
function forgeEstimateHTML(r,ready,formGap){forgeSmithOk();if(forgeDM())return forgeDMHTML(r,ready);const M=invIndex(),b=forgeBP(r),F=forgeReq(b),c=PARTY.find(x=>x.id===FF.who)||null,sm=FF.smith&&hireOf(FF.smith,r.cost),smOk=smithCan(sm,b,F),need=forgeNeeds(r,M),short=need.filter(x=>x.have<x.q);
  const chk=c&&!sm?forgeCheck(b,c):null,odds=sm?forgeOdds(craftCheck(b,c||{}).dc+(b.dcMod||0),smithCheck(sm,b).bonus,smithCheck(sm,b).mode,true):chk&&!chk.blocked?forgeOdds(chk.dc,chk.bonus,chk.mode):null;
  const {A,p}=forgePick(r),cb=pickedCombos(A,p);
  const can=ready&&!short.length&&c&&(sm?smOk:!chk.blocked);
  const why=!ready?(formGap.length?'Add the missing materials for form '+formGap.map(x=>x.i+2).join(', '):'Fill every required part first'):short.length?'The party is missing some materials':!c?'Choose who forges it':sm&&!smOk?'That smith can\'t work a forge this grade':chk&&chk.blocked?chk.blocked:'';
  return `<div class="fg-est">
    <div class="blk"><h4>📜 Before the forge</h4></div>
    ${kv([['Estimated item level',`<b>${r.il||'?'}</b>${r.mil?` <small class="note" style="margin:0">(materials' Item Level ${r.mil} × 2, the Blueprint scale)</small>`:''}${r.rar?' · '+rarB(r.rar):''}`],['Forge needed',esc(forgeText(F))],['Profession',esc(r.prof)+(r.realmSpec?` <small>(${esc(r.realmSpec)})</small>`:'')],r.dcMod?['Prepared materials',`DC ${r.dcMod}`]:null])}
    <div class="note" style="margin:6px 0 0">The full description, damage, and effects appear once it is forged.${FORGE.lore?' 🔮 The Mystic Forge has written its story; you will read it then.':''}</div>
    <div class="blk" style="margin-top:10px"><h4>🧺 Materials from the party</h4></div>
    ${need.length?`<ul style="margin:0 0 0 18px;font-size:.88rem">${need.map(x=>`<li>${esc(x.n)} ×${x.q} <span style="color:var(--${x.have>=x.q?'green':'red'})">${x.have>=x.q?'✓':'✕'} ${x.have?'held by '+esc(holdersText(M,x.n)):'nobody has it'}</span></li>`).join('')}</ul>`:'<div class="note" style="margin:0">No materials chosen yet.</div>'}
    ${A.length?`<div class="blk" style="margin-top:10px"><h4>✧ Powers to keep (${p.filter(x=>powKind(x)==='p').length} of ${FORGE_MAX_POW} properties · ${p.filter(x=>powKind(x)==='t').length} of ${FORGE_MAX_POW} traits)</h4></div><div class="note" style="margin:0 0 4px">An item holds up to ${FORGE_MAX_POW} properties and ${FORGE_MAX_POW} traits. The same property from two parts at the same rank merges into the next rank: Potency 10 + 10 = 15, 15 + 15 = 20.</div>
      <div class="fg-pows">${A.map(x=>`<label class="fg-pow${p.includes(x.id)?' on':''}"><input type="checkbox" ${p.includes(x.id)?'checked':''} onchange="forgePickToggle(${esc(JSON.stringify(x.id))})"> <span><b>${x.k==='p'?'✧':'◆'} ${esc(x.n)}</b>${x.k==='p'?` <span class="b ghost">Potency ${x.pot}</span>${x.pots.length>1?` <small style="color:var(--gold2)">merged from ${x.pots.join(' + ')}</small>`:''}`:' <small>trait</small>'}</span></label>`).join('')}</div>
      ${cb.length?`<div class="note" style="margin:4px 0 0">✦ ${cb.every(x=>COMBOS_FOUND.includes(x[2]))?`These powers together unlock <b>${cb.map(x=>esc(x[2])).join(', ')}</b>.`:'Something stirs between these powers… forge it to find out.'}</div>`:''}`:''}
    <div class="blk" style="margin-top:10px"><h4>🔥 At the anvil</h4></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${PARTY.length?`<label class="note" style="margin:0">Forger <select class="sel" id="ff-who"><option value="">Choose…</option>${PARTY.map(x=>`<option value="${x.id}"${x.id===FF.who?' selected':''}>${esc(x.name||'Unnamed')}${x.prof||x.prof2?' ('+esc(profLabel(x))+')':''}</option>`).join('')}</select></label>`:'<span class="note" style="margin:0">Add a character on the Party page first.</span>'}
      ${dmUnlocked()?`<label class="note" style="margin:0">or hire <select class="sel" id="ff-smith" style="max-width:330px"><option value="">no one</option>${(()=>{const R=smithRoster(r.cost),cur=+FF.smith,G={};R.forEach(S=>{(G[S.realm]=G[S.realm]||[]).push(S)});
        const extra=cur&&!R.some(S=>S.lv===cur)?hireOf(cur,r.cost):null;
        return (extra?`<option value="${extra.lv}" selected>${esc(extra.n)} · ${fmt(extra.fee)} gp</option>`:'')+Object.keys(G).map(z=>`<optgroup label="${esc(z)}">${G[z].map(S=>`<option value="${S.lv}"${cur===S.lv?' selected':''}${smithCan(S,b,F)?'':' disabled'}>${esc(S.who)} · ${S.master?'the realm\'s master':S.role} · ${fmt(S.fee)} gp${forgeNums()?' (level '+S.lv+')':''}</option>`).join('')}</optgroup>`).join('')})()}</select></label>`:''}</div>
    ${sm?`<div class="note" style="margin:6px 0 0"><b>${esc(sm.master?sm.n:smithName(sm.tier,sm.step))}</b>, ${sm.master?esc(sm.d):`${aAn(HIRE_TITLE[sm.step-1])} ${HIRE_TITLE[sm.step-1].toLowerCase()} smith of the ${esc(sm.realm)}`} (${forgeNums()?`level ${sm.lv}, `:''}grade ${ROMAN[sm.g-1]} forge, materials up to the ${esc(sm.realm)}), forges it for <b>${fmt(sm.fee)} gp</b>: ${fmt(sm.base)} for the work plus half the materials' cost (${fmt(r.cost||0)} gp). It comes from ${c?esc(c.name||'the forger'):'the character you choose'}${sm.task?`, or a task instead: <i>${esc(sm.task)}</i>`:''}. A hired smith never ruins your materials or makes a Flawed item.${sm.master&&sm.task&&role()!=='player'?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${sm.realm.split(' or ').map((z,i)=>`<button class="btn" type="button" onclick="standMove('smith:'+${esc(JSON.stringify(z))},1,${esc(JSON.stringify('Did a task for '+(sm.n.split(' or ')[i]||sm.n)))})">⚖ Task done: raise the ${esc(z)} smiths</button>`).join('')}</div>`:''}</div>`
      :chk&&!chk.blocked&&!forgeNums()?(()=>{const [h,w]=forgeHardWords(odds);return `<div class="note" style="margin:6px 0 0"><b>${esc(h)}:</b> ${esc(w)}. ${c.name?esc(c.name)+(chk.gap>=0?' knows this work well':' is reaching beyond what they know'):(chk.gap>=0?'They know this work well':'They are reaching beyond what they know')}${chk.dis.length?`, and ${esc(chk.dis.join('; ').toLowerCase())}`:''}. When you strike, the DM calls for a ${esc(b.pr)} check. Time: ${esc(chk.time)}.</div>`})()
      :chk?`<div class="note" style="margin:6px 0 0">${chk.blocked?`<span style="color:var(--red)"><b>Can't forge:</b> ${esc(chk.blocked)}</span>`:`${esc(c.name||'They')}: ${esc(b.pr)} level <b>${chk.lv}</b> against item level <b>${b.lv}</b>. ${chk.gap>=0?`At or above it: <b>advantage</b>${chk.qb?` and +${chk.qb} for the ${chk.gap} levels to spare`:''}.`:`<b>${-chk.gap} level${chk.gap===-1?'':'s'} short:</b> ${chk.pen} to the roll.`}${chk.dis.length?` Disadvantage: ${esc(chk.dis.join('; '))}.`:''} Roll d20 ${chk.bonus>=0?'+':'−'} ${Math.abs(chk.bonus)} vs <b>DC ${chk.dc}</b>. Time: ${esc(chk.time)}.`}</div>`:''}
    ${odds&&forgeNums()?`<div style="margin-top:6px">${oddsHTML(odds)}</div>`:''}
    ${dmUnlocked()?`<label class="note" style="display:flex;gap:6px;align-items:center;margin:8px 0 0" title="Odds, DCs, and the roll math. On by itself in the DM's view (Settings, How you play)."><input type="checkbox" ${forgeNums()?'checked':''} onchange="FORGE.nums=this.checked;store.set('forge',FORGE);forgeOut()"> 🎲 Show the numbers (odds, DC, levels)</label>`:''}
    <label class="note" style="display:flex;gap:6px;align-items:center;margin:8px 0 0"><input type="checkbox" ${FORGE.share?'checked':''} onchange="FORGE.share=this.checked;store.set('forge',FORGE)"> Share this Blueprint in the Workshop, where other players can see it ${CL.on&&CL.user?'':'<small>(sign in to save Blueprints to the Workshop)</small>'}</label>
    ${dmUnlocked()?`<div class="fg-anvilrow"><div class="fg-anvil" aria-hidden="true">⚒</div><div>
      <button class="btn primary fg-strike" ${can?'':`disabled title="${esc(why)}"`} onclick="forgeStrike()">🔨 ${sm?'Hand the work to '+esc(sm.n):'Call for the roll'}</button>
      <button class="btn" id="fg-snd" type="button" onclick="forgeSoundToggle()">${FSND?'🔊 Sound on':'🔇 Sound off'}</button>
      <div class="note" style="margin:4px 0 0">${can?(sm?'The smith rolls for the work at the anvil.':`The anvil opens full screen: ${esc(c.name||'the forger')} rolls (tap to roll, or use real dice), three strikes, and the item is theirs.`):esc(why)}</div></div></div>`:`<div class="fg-anvilrow"><div class="fg-anvil" aria-hidden="true">⚒</div><div><b>${can?'Ready for the forge':'Not ready yet'}</b><div class="note" style="margin:4px 0 0">${can?`Show your DM: they open the full Forge with the DM code, choose who strikes, and call for ${esc(c.name||'your')}${c.name?'\'s':''} roll at the anvil.`:esc(why)}</div></div></div>`}
    ${FF.res?`<div class="callout" style="margin-top:8px;border-color:var(--${FF.res.bad?'red':'gold'})">${FF.res.html}</div>`:''}
  </div>`}
// the DM sets the work up; the player rolls at the anvil (a full-screen scene: tap to roll, or enter real dice)
function forgeStrike(){const c=PARTY.find(x=>x.id===FF.who);if(!c)return;FF.res=null;fmOpen()}
function forgeRollInfo(r,c){const b=forgeBP(r),sm=FF.smith&&hireOf(FF.smith,r.cost);
  if(sm){if(!smithCan(sm,b,forgeReq(b)))return {blocked:sm.n+' can\'t work these materials'};const k=craftCheck(b,c),sc=smithCheck(sm,b);return {b,sm,dc:k.dc+(b.dcMod||0),bonus:sc.bonus,mode:sc.mode,who:sm.n,pr:b.pr}}
  const k=forgeCheck(b,c);if(k.blocked)return {blocked:k.blocked};return {b,sm:null,dc:k.dc,bonus:k.bonus,mode:k.mode,who:c.name||'The forger',pr:b.pr}}
// what the dice say (the player's own dice when given, otherwise rolled here); nothing changes until forgeApply
function forgeOutcome(r,c,dice){const I=forgeRollInfo(r,c);if(I.blocked){toast("Can't forge: "+I.blocked);return null}const R=()=>1+Math.floor(Math.random()*20);
  const a1=dice&&dice[0]?dice[0]:R(),a2=dice&&dice[1]?dice[1]:R(),mode=I.mode,d=mode==='adv'?Math.max(a1,a2):mode==='dis'?Math.min(a1,a2):a1,tot=d+I.bonus,q=forgeQ(d,tot-I.dc,!!I.sm);
  const line=`${esc(I.who)} rolls <b>${d}${mode?` <small>(${a1}, ${a2}, ${mode==='adv'?'advantage':'disadvantage'})</small>`:''} ${I.bonus>=0?'+':'−'} ${Math.abs(I.bonus)} = ${tot}</b>${forgeNums()?` vs DC ${I.dc}`:''}.`;
  return {q,d,a1,a2,tot,mode,line,sm:I.sm,who:I.who}}
function forgeApply(r,c,O){const M=invIndex();
  if(O.q==='ruin'){const ms=forgeNeeds(r,M).filter(x=>x.have>0),lost=ms.length?ms[Math.floor(Math.random()*ms.length)].n:'';if(lost){invTake(M,lost,1,c);saveParty()}
    forgeSound('fail');FF.res={bad:1,html:`${O.line} <b style="color:var(--red)">Natural 1:</b> the metal cracks${lost?` and the <b>${esc(lost)}</b> is ruined`:''}. Strike again when ready.`};forgeOut();return {lost}}
  if(O.q==='fail'){forgeSound('fail');FF.res={bad:1,html:`${O.line} <b>It doesn't take.</b> Nothing is lost: strike again.`};forgeOut();return {}}
  forgeMake(r,c,O.q,fqQuirk(),O.line,O.sm,M);return {made:true}}
function forgeResolve(r,c,dice){const O=forgeOutcome(r,c,dice);return O?forgeApply(r,c,O):null}
// ── The anvil scene ──
let FM=null;
const FM_BLOWS=[['The first blow rings out across the forge.','The first blow lands, heavy and sure.','Sparks leap at the first strike.'],['The second strike: the metal glows and gives.','A second blow; the shape begins to show.','Again: the hammer finds its rhythm.'],['The last strike. Everyone holds their breath…','One final blow, and the forge falls quiet…','The third strike rings, and the hiss of the quench…']];
const FM_Q={Masterwork:['A masterwork!','#ffd36b','Smiths will talk about this one.'],Fine:['Fine work','#9fe6a0','Better than most smiths could hope for.'],Standard:['It holds','#e9dcc4','Solid, honest work.'],Flawed:['Flawed, but whole','#f0b27a','It works, with a quirk or two.'],fail:['It doesn\'t take','#c9b8a6','The metal won\'t hold its shape. Nothing is lost: try again.'],ruin:['The metal cracks','#ff7b6b','A natural 1. Something is lost to the fire.']};
function fmOpen(){if(!dmUnlocked())return;const r=forgeResult(),c=PARTY.find(x=>x.id===FF.who);if(!c)return;const I=forgeRollInfo(r,c);if(I.blocked){toast("Can't forge: "+I.blocked);return}
  FM={r,c,I,step:'call',ret:document.activeElement};fmDraw()}
function fmClose(){const O=$('fmo');if(!O||O.hidden)return;if(FM&&FM.step==='roll')return;O.hidden=true;const ret=FM&&FM.ret;FM=null;forgeOut();if(ret&&document.contains(ret))try{ret.focus()}catch(e){}}
function fmBox(inner){let O=$('fmo');if(!O){O=document.createElement('div');O.id='fmo';O.className='fmo';O.setAttribute('role','dialog');O.setAttribute('aria-modal','true');O.setAttribute('aria-label','At the anvil');document.body.appendChild(O)}
  O.hidden=false;O.innerHTML=`<div class="fmo-box" id="fmo-box">${FM.step==='roll'?'':`<button type="button" class="icon-btn fmo-x" onclick="fmClose()" aria-label="Step away from the anvil">${ICON.x}</button>`}${inner}</div>`;return O}
function fmDraw(){const {r,c,I}=FM,name=esc(c.name||'The forger'),item=esc(r.name||FORGE.base||'the item'),mod=(I.bonus>=0?'+ ':'− ')+Math.abs(I.bonus),two=!!I.mode,
    adv=I.mode==='adv'?' with <b>advantage</b> (roll two, keep the higher)':I.mode==='dis'?' with <b>disadvantage</b> (roll two, keep the lower)':'';
  if(FM.step==='call'){fmBox(`<div class="fmo-anvil" aria-hidden="true">⚒</div><div class="fmo-kicker">At the anvil</div>
      <h2 class="fmo-h">${I.sm?esc(I.who)+' takes '+name+'\'s materials':name+' takes up the hammer'}</h2>
      <p class="fmo-p">${item}${r.il?' · item level '+r.il:''}. ${I.sm?'The smith will roll for the work.':'The fire is hot and the metal is ready.'}</p>
      ${I.sm?'':`<div class="fmo-call"><b>${name}</b>, roll ${esc(I.pr)}: <span class="fmo-dice">d20 ${mod}</span>${adv}.</div>`}${forgeNums()?`<div class="fmo-dm">For the DM: DC ${I.dc}</div>`:''}
      <div class="fmo-btns"><button type="button" class="btn primary fmo-roll" onclick="fmRoll()">🎲 ${I.sm?'Let them work':'Roll the die'}</button>${I.sm?'':`<button type="button" class="btn" onclick="FM.step='real';fmDraw()">We rolled real dice</button>`}</div>`);
    setTimeout(()=>{const b=document.querySelector('#fmo .fmo-roll');if(b)b.focus()},0);return}
  if(FM.step==='real'){fmBox(`<div class="fmo-kicker">Real dice</div><h2 class="fmo-h">What did ${name} roll?</h2><p class="fmo-p">Enter what the d20${two?'s':''} showed, before the ${mod}.</p>
      <div class="fmo-real"><label>d20<input class="sel" id="fm-d1" type="number" min="1" max="20" inputmode="numeric"></label>${two?'<label>second d20<input class="sel" id="fm-d2" type="number" min="1" max="20" inputmode="numeric"></label>':''}</div>
      <div class="fmo-btns"><button type="button" class="btn primary" onclick="fmReal()">Use these</button><button type="button" class="btn" onclick="FM.step='call';fmDraw()">Back</button></div>`);
    setTimeout(()=>{const e=$('fm-d1');if(e)e.focus()},0);const k=e=>{if(e.key==='Enter')fmReal()};['fm-d1','fm-d2'].forEach(id=>{const e=$(id);if(e)e.onkeydown=k});return}}
function fmReal(){const two=!!FM.I.mode,a=+($('fm-d1')||{}).value,b=+(($('fm-d2')||{}).value||0),okd=v=>v>=1&&v<=20&&Math.round(v)===v;
  if(!okd(a)||(two&&!okd(b))){toast('Enter what the d20 showed: a whole number from 1 to 20');return}fmRoll(two?[a,b]:[a])}
function fmRoll(dice){const {r,c,I}=FM,O=forgeOutcome(r,c,dice);if(!O){FM.step='call';return fmClose()}FM.O=O;FM.step='roll';const two=!!I.mode,vals=two?[O.a1,O.a2]:[O.a1],still=matchMedia('(prefers-reduced-motion: reduce)').matches,kind=forgeKind(r);
  fmBox(`<div class="fmo-kicker">${esc(O.who)} rolls</div><div class="fmo-dies">${vals.map((v,i)=>`<div class="fmo-die${still?'':' spin'}" id="fm-die${i}">${still?v:'?'}</div>`).join('')}</div><div class="fmo-call" id="fm-roll" aria-live="polite"></div><div class="fmo-strike" id="fm-line" aria-live="polite"></div><div class="fmo-anvil fmo-small" id="fm-anvil" aria-hidden="true">⚒</div>`);
  const T=still?120:1;let spin=null;if(!still)spin=setInterval(()=>vals.forEach((v,i)=>{const e=$('fm-die'+i);if(e)e.textContent=1+Math.floor(Math.random()*20)}),70);
  const settle=()=>{clearInterval(spin);let kept=false;vals.forEach((v,i)=>{const e=$('fm-die'+i);if(!e)return;e.classList.remove('spin');e.textContent=v;if(two){const k=!kept&&v===O.d;if(k)kept=true;e.classList.add(k?'keep':'drop')}});const L=$('fm-roll');if(L)L.innerHTML=O.line};
  const blow=n=>{forgeSound(kind,n+1);const L=$('fm-line'),A=$('fm-anvil'),B=$('fmo-box');if(L)L.textContent=FM_BLOWS[n][Math.floor(Math.random()*3)];if(B&&!still){B.classList.remove('fmo-shake');void B.offsetWidth;B.classList.add('fmo-shake')}if(A&&!still){A.classList.remove('fmo-hit');void A.offsetWidth;A.classList.add('fmo-hit')}};
  setTimeout(settle,still?0:1200);[0,1,2].forEach(n=>setTimeout(()=>blow(n),(still?T:2100)+n*(still?T:800)));setTimeout(fmDone,(still?T*4:2100+3*800+500))}
function fmDone(){if(!FM||!FM.O)return;const {r,c,O}=FM,res=forgeApply(r,c,O),Q=FM_Q[O.q]||FM_Q.Standard,ok=!!res&&res.made;FM.step='done';
  const made=ok&&FF.made?DESIGNS.find(d=>d.n===FF.made):null;
  fmBox(`<div class="fmo-kicker">${ok?'The work is done':'Not this time'}</div><div class="fmo-q" style="color:${Q[1]}">${esc(Q[0])}</div><p class="fmo-p">${esc(Q[2])}</p><div class="fmo-call">${O.line}</div>
    ${ok&&made?`<p class="fmo-p"><b>${esc(made.n)}</b> goes into ${esc(c.name||'the forger')}'s gear.</p>`:res&&res.lost?`<p class="fmo-p">The <b>${esc(res.lost)}</b> is lost.</p>`:''}
    <div class="fmo-btns">${ok?'<button type="button" class="btn primary" onclick="fmClose();const o=$(\'fg-out\');if(o)o.scrollIntoView({behavior:\'smooth\',block:\'start\'})">See the item</button>':`<button type="button" class="btn primary" onclick="FM.step='call';FM.O=null;fmDraw()">Try again</button>`}<button type="button" class="btn" onclick="fmClose()">Back to the forge</button></div>`);
  setTimeout(()=>{const b=document.querySelector('#fmo .btn.primary');if(b)b.focus()},0)}
document.addEventListener('keydown',e=>{const O=$('fmo');if(O&&!O.hidden&&e.key==='Escape'){fmClose();e.stopPropagation()}},true);
// the item is made: the materials are used, its record is written, and it goes on the forger's gear
function forgeMake(r,c,q,qk,line,sm,M,dm){if(!dm)forgeNeeds(r,M).forEach(x=>invTake(M,x.n,x.q,c));
  if(sm){c.coins=c.coins||{};const fee=sm.fee;if((+c.coins.gp||0)>=fee)c.coins.gp=(+c.coins.gp||0)-fee}
  const d=designFromForge(),prim=r.parts.find(p=>p.s.role==='primary'),{A,p}=forgePick(r),keep=A.filter(x=>p.includes(x.id));let n=d.n;while(findBP(n))n+='\u200b';d.n=n;d.serial=forgeSerial(n);d.serialV=2;
  d.powers=keep.map(x=>({k:x.k,n:x.n,pot:x.pot||0,t:x.t,from:x.from}));d.potV=2;d.prop=keep.filter(x=>x.k==='p').map(x=>`${x.n} (Potency ${x.pot})`).join(', ');d.combos=pickedCombos(A,p).map(x=>x[2]);combosNote(pickedCombos(A,p));
  const Q=fqOf(q);fBump(d,{atk:Q[2],dmg:Q[3]});if(qk.fx&&qk.fx.dmg)fBump(d,{dmg:qk.fx.dmg});
  d.forged={q,by:dm?'the DM':sm?sm.n:(c&&c.name||''),on:new Date().toISOString().slice(0,10),line,quirk:qk.n?{n:qk.n,t:qk.t,god:qk.god||''}:null,
    sockets:Math.min(4,sockBase(prim&&prim.m)+(q==='Masterwork'?1:0)+(qk.fx&&qk.fx.sock?1:0)),runes:[],marks:0,log:[],flawed:q==='Flawed'};
  d.owner=CL.on&&CL.user?CL.user.id:'';d.maker=c?c.name||'':'the DM';d.shared=!!FORGE.share;
  d.sort=designSortRules(d);DESIGNS.push(d);store.set('designs',DESIGNS);designPlace();if(c){c.gear=(c.gear||[]).concat(d.n);saveParty()}
  FF.made=d.n;FF.res=null;forgeSound('done');toast(d.n+' forged: '+q);wsUpload(d);forgeOut()}
// deliver a forged item for a commission: it leaves the forger's gear and the reward is paid
function forgeDeliver(name,id){const o=FCOMM.find(x=>x.id===id),c=PARTY.find(x=>(x.gear||[]).includes(name));if(!o||!c)return;c.gear.splice(c.gear.indexOf(name),1);o.done=Date.now();o.by=c.name||'';saveComm();c.coins=c.coins||{};c.coins.gp=(+c.coins.gp||0)+o.gp;saveParty();toast(`Delivered to ${o.client}: +${o.gp} gp`);renderForge()}
// copies of the same name are told apart by a number: the first “Twin Blade” forged is #00000001, the second #00000002,
// and a weapon with another name starts again at #00000001 (the record also tells copies apart with invisible zero-width characters at the end of the name)
const baseName=n=>String(n||'').replace(/\u200b/g,'');
function forgeSerial(n){const b=baseName(n);return Math.max(0,...DESIGNS.filter(d=>d&&d.forged&&baseName(d.n)===b).map(d=>+d.serial||0))+1}
// items forged before the count went by name: number them again, oldest first, within each name
if(DESIGNS.some(d=>d&&d.serial&&!d.serialV)){const k={};DESIGNS.forEach(d=>{if(d&&d.forged&&d.serial){const b=baseName(d.n);d.serial=k[b]=(k[b]||0)+1;d.serialV=2}});store.set('designs',DESIGNS)}
const serialTag=d=>d&&+d.serial?`<small class="fg-serial" title="Copy number ${fmt(+d.serial)} of the forged items named ${esc(baseName(d.n))}">#${String(+d.serial).padStart(8,'0')}</small>`:'';
// the made item, described in full
function forgedCardHTML(d){const F=d.forged||{},cs=(d.combos||[]).map(n=>FCOMBOS.find(x=>x[2]===n)).filter(Boolean),tier=Math.max(1,...(d.mats||[]).map(n=>((REALM[(findMat(n)||{}).realm]||{}).tier||1))),cm=fcMatch(d.base,F.q||'Standard',tier);
  return `<div class="panel fg-made"><div class="fg-reveal">✦ Forged ✦</div><h3 style="font-family:var(--serif);font-size:1.45rem;margin:0">${esc(d.n)} ${serialTag(d)}</h3>
    <div class="badges">${d.r?rarB(d.r):''}<span class="b ${F.q==='Masterwork'?'gold':F.q==='Flawed'?'red':'ghost'}">${esc(F.q||'')}</span><span class="b ghost">${esc(d.base)}</span>${d.il?`<span class="b">Item level ${d.il}</span>`:''}${d.evo?`<span class="b gold">⟲ ${d.evo.t==='stable'?'Stable':'Unstable'} evolving</span>`:''}</div>
    ${d.lore?`<div class="callout" style="border-color:var(--acc)">${esc(d.lore)}</div>`:''}
    ${kv([d.dmg?['Damage',`<span class="mono">${esc(d.dmg)}</span>${d.vers?` <small>(<span class="mono">${esc(d.vers)}</span> two-handed)</small>`:''}`]:null,(()=>{const f=gearFx({design:d,cat:d.cat});return d.dmg&&f.src.length?['Full total',`<span class="mono"><b>${esc(fxDmg(d.dmg,f))}</b></span>${f.atk?` · Accuracy +${f.atk}`:''} <small class="note" style="margin:0">(with ${esc(f.src.join(', '))}${f.capDmg?'; capped at half the weapon\'s own damage':''})</small>`]:!d.dmg&&(f.ac||f.speed)?['Powers add',[f.ac?`+${f.ac} AC${f.capAC?' (capped at half its AC)':''}`:'',f.speed?`+${f.speed} ft speed`:''].filter(Boolean).join(' · ')+` <small class="note" style="margin:0">(${esc(f.src.join(', '))})</small>`]:null})(),d.atk!=null?['Accuracy',(d.atk>=0?'+':'')+d.atk]:null,d.ac!=null?['AC',d.ac]:null,d.props?['Properties',esc(d.props)]:null,F.line?['The forging',F.line]:null].filter(Boolean))}
    ${(d.powers||[]).length?`<div><div class="blk"><h4>Powers</h4></div>${d.powers.map(x=>`<div class="note" style="margin:0 0 6px"><b>${x.k==='p'?'✧':'◆'} ${esc(x.n)}</b>${x.k==='p'?` <span class="b ghost">Potency ${x.pot}</span>`:''}: ${esc(x.t||'')}</div>`).join('')}</div>`:''}
    ${cs.length?`<div><div class="blk"><h4>✦ Combos</h4></div>${cs.map(([a,b,n,t])=>`<div class="note" style="margin:0 0 4px"><b>${esc(n)}</b> <small>(${esc(a)} + ${esc(b)})</small>: ${esc(t)}</div>`).join('')}</div>`:''}
    <div class="note" style="margin:0">${esc(fqOf(F.q)[1])}${F.quirk?` <b>${esc(F.quirk.n)}:</b> ${esc(F.quirk.t)}`:' No quirk took hold.'} Rune sockets: ${F.sockets||0}. Sockets, growth marks, and a god's gift of evolving are on the character sheet (Equipment).</div>
    <label class="note" style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" ${d.shared?'checked':''} onchange="wsShare(${esc(JSON.stringify(d.n))},this.checked)"> Shared in the Workshop</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${cm.map(o=>`<button class="btn" onclick="forgeDeliver(${esc(JSON.stringify(d.n))},'${o.id}')">Deliver to ${esc(o.client)} for ${o.gp} gp</button>`).join('')}<button class="btn primary" onclick="FF.made='';renderForge()">Forge another</button></div></div>`}
// the forged-item panel on the character sheet: quality, quirk, rune sockets, and growth
const forgedOf=n=>DESIGNS.find(d=>d&&d.n===n&&d.forged&&!d.foreign)||null;
function forgedSave(){store.set('designs',DESIGNS);designPlace();saveParty();renderSheet()}
function forgedRune(n,i,v){const d=forgedOf(n);if(!d)return;const F=d.forged;F.runes=F.runes||[];if(v)F.runes[i]=v;else F.runes.splice(i,1);F.runes=F.runes.filter(Boolean);const cl=runeClash(F.runes);if(cl.length)toast('Unstable: '+cl.map(x=>x.join(' and ')).join(', ')+' fight inside it');forgedSave()}
function forgedMark(n){const d=forgedOf(n);if(!d)return;const why=prompt('What did it do? ('+FMARK_WHY.join(', ')+')',FMARK_WHY[0]);if(why==null)return;const F=d.forged,was=F.marks||0;F.marks=was+1;F.log=(F.log||[]).concat([[new Date().toISOString().slice(0,10),why.slice(0,80)]]);
  FGROW.filter(g=>g[0]>was&&g[0]<=F.marks).forEach(g=>{if(g[3])fBump(d,g[3]);toast(`${d.n} is ${g[1]}! ${g[2]}`)});forgedSave()}
// a god grants evolving (the DM's call): Stable grows 3 ranks (15 Potency) per wielder level; Unstable feeds on materials
function evoGrant(n,t){const d=forgedOf(n),c=sheetChar();if(!d||!c)return;const sel=$('evo-god-'+btoa(unescape(encodeURIComponent(n))).replace(/=/g,'')),god=sel?sel.value:'';
  if(!god){toast('Choose the god who grants it');return}if(!confirm(`Only a god can make an item evolve. Has ${god} granted ${d.n} ${t==='stable'?'Stable':'Unstable'} evolving (the DM agrees)?`))return;
  d.evo=t==='stable'?{t,god,c:c.id,lv0:+c.level||1,spent:0}:{t,god,stock:[],act:[]};forgedSave();toast(`${god} has made ${d.n} evolve`)}
const evoPts=(d,c)=>d.evo&&d.evo.t==='stable'?Math.max(0,3*((+c.level||1)-(d.evo.lv0||1))-(d.evo.spent||0)):0;
function evoSpend(n,i){const d=forgedOf(n),c=sheetChar();if(!d||!c||evoPts(d,c)<1)return;const x=(d.powers||[])[i];if(!x||x.k!=='p'){toast('Only a property has Potency to raise');return}if((x.pot||0)>=50){toast('Potency is at most 50');return}
  x.pot=Math.min(50,(x.pot||0)+5);d.evo.spent=(d.evo.spent||0)+1;d.prop=d.powers.filter(y=>y.k==='p').map(y=>`${y.n} (Potency ${y.pot})`).join(', ');forgedSave()}
// an Unstable item eats three of one material from its wielder's inventory and keeps that material's trait
function evoFeed(n){const d=forgedOf(n),c=sheetChar();if(!d||!c||!d.evo||d.evo.t!=='unstable')return;const sel=$('evo-feed-'+btoa(unescape(encodeURIComponent(n))).replace(/=/g,'')),mn=sel?sel.value:'',m=findMat(mn);
  if(!m||!m.tr){toast('Choose a material with a trait');return}const row=(c.inv||[]).find(x=>lc(x[0])===lc(mn));if(!row||(+row[1]||0)<3){toast('It needs three of the same material');return}
  if(d.evo.stock.length>=EVO_MAX_STOCK){toast(`Its stockpile is full (${EVO_MAX_STOCK} traits)`);return}if(d.evo.stock.some(x=>x.n===m.tr.n)){toast('It already holds '+m.tr.n);return}
  row[1]=(+row[1]||0)-3;c.inv=c.inv.filter(x=>(+x[1]||0)>0);d.evo.stock.push({n:m.tr.n,t:m.tr.t||'',from:m.n});if(d.evo.act.length<EVO_MAX_ACT)d.evo.act.push(m.tr.n);forgedSave();forgeSound('brew');toast(`${d.n} devours three ${m.n}: ${m.tr.n}`)}
function evoToggle(n,t){const d=forgedOf(n);if(!d||!d.evo)return;const a=d.evo.act;if(a.includes(t))d.evo.act=a.filter(x=>x!==t);else{if(a.length>=EVO_MAX_ACT){toast(`Only ${EVO_MAX_ACT} traits can be active: switch one out (a bonus action)`);return}a.push(t)}forgedSave()}
// the forged-item panel on the character sheet: quality, powers, quirk, rune sockets, growth, and a god's gift of evolving
function forgedHTML(c){const L=(c.gear||[]).map(n=>forgedOf(n)||(c.fd&&c.fd[n]&&c.fd[n].forged?Object.assign({},c.fd[n],{n}):null)).filter((d,i,a)=>d&&a.findIndex(x=>x&&x.n===d.n)===i);if(!L.length)return '';const rn=RUNES.map(x=>x.n).sort(),key=n=>btoa(unescape(encodeURIComponent(n))).replace(/=/g,''),J=n=>esc(JSON.stringify(n));
  const gods=[...new Set([c.god?godShort(godByKey(c.god)||{n:c.god}):'',...(c.extra||[]).map(x=>x.god?godShort(godByKey(x.god)||{n:x.god}):'')].filter(Boolean))];
  return L.map(d=>{const F=d.forged,wep=!!d.dmg,cl=runeClash(F.runes||[]),next=FGROW.find(g=>g[0]>(F.marks||0)),got=FGROW.filter(g=>g[0]<=(F.marks||0)),E=d.evo,pts=evoPts(d,c);
    const feedable=E&&E.t==='unstable'?(c.inv||[]).filter(([n,q])=>(+q||0)>=3).map(([n])=>findMat(n)).filter(m=>m&&m.tr&&!E.stock.some(x=>x.n===m.tr.n)):[];
    return `<div style="border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:0 0 8px"><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:baseline"><b>${esc(d.n)}</b>${serialTag(d)}<span class="b ${F.q==='Masterwork'?'gold':F.q==='Flawed'?'red':'ghost'}">${esc(F.q)}</span>${E?`<span class="b gold">⟲ ${E.t==='stable'?'Stable':'Unstable'} · ${esc(E.god||'a god')}</span>`:''}<small style="color:var(--muted)">forged by ${esc(F.by||'?')} · ${esc(F.on||'')}</small></div>
      <div class="note" style="margin:4px 0 0">${esc(fqOf(F.q)[1])}${F.quirk?` <b>${esc(F.quirk.n)}:</b> ${esc(F.quirk.t)}`:''}${(d.combos||[]).length?` <b>Combos:</b> ${d.combos.map(esc).join(', ')}.`:''}</div>
      ${(d.powers||[]).length?`<div style="margin-top:6px"><small><b>Powers</b>${E&&E.t==='stable'?` · <b style="color:var(--gold2)">${pts} Potency to spend</b> (3 for each level since the gift)`:''}</small>${d.powers.map((x,i)=>`<div class="note" style="margin:2px 0 0">${x.k==='p'?'✧':'◆'} <b>${esc(x.n)}</b>${x.k==='p'?` · Potency ${x.pot}`:''}${x.t?`: ${esc(x.t)}`:''}${E&&E.t==='stable'&&x.k==='p'&&pts>0&&x.pot<50?` <a href="#" onclick="evoSpend(${J(d.n)},${i});return false">+1</a>`:''}</div>`).join('')}</div>`:''}
      ${E&&E.t==='unstable'?`<div style="margin-top:6px"><small><b>Stockpile (${E.stock.length} of ${EVO_MAX_STOCK})</b> · ${E.act.length} of ${EVO_MAX_ACT} active · switching one is a bonus action</small>
        ${E.stock.map(x=>`<label class="note" style="display:flex;gap:6px;align-items:flex-start;margin:2px 0 0"><input type="checkbox" ${E.act.includes(x.n)?'checked':''} onchange="evoToggle(${J(d.n)},${J(x.n)})"> <span><b>${esc(x.n)}</b> <small>from ${esc(x.from)}</small>: ${esc(x.t)}</span></label>`).join('')||'<div class="note" style="margin:2px 0 0">Empty. Feed it three of one material.</div>'}
        ${E.stock.length<EVO_MAX_STOCK?`<div class="keyrow" style="margin-top:4px"><select class="sel" id="evo-feed-${key(d.n)}" style="max-width:280px">${feedable.length?feedable.map(m=>`<option value="${esc(m.n)}">${esc(m.n)} → ${esc(m.tr.n)}</option>`).join(''):'<option value="">No material with three or more and a new trait</option>'}</select><button class="btn" ${feedable.length?'':'disabled'} onclick="evoFeed(${J(d.n)})">Feed three</button></div>`:''}</div>`:''}
      ${!E?`<details style="margin-top:6px"><summary class="note" style="cursor:pointer">⟲ A god's gift: evolving</summary><div class="note" style="margin:4px 0 0">Only a god can make an item evolve. <b>Stable</b>: it gains 3 ranks (15 Potency) each time its wielder levels up. <b>Unstable</b>: it feeds on materials, three of one kind for that material's trait, and holds up to ${EVO_MAX_STOCK} traits with ${EVO_MAX_ACT} active.</div>
        <div class="keyrow" style="margin-top:4px"><select class="sel" id="evo-god-${key(d.n)}" style="max-width:220px"><option value="">The god who grants it…</option>${gods.map(g=>`<option>${esc(g)}</option>`).join('')}${GODS.map(g=>godShort(g)).filter(g=>!gods.includes(g)).sort().map(g=>`<option>${esc(g)}</option>`).join('')}</select><button class="btn" onclick="evoGrant(${J(d.n)},'stable')">Stable</button><button class="btn" onclick="evoGrant(${J(d.n)},'unstable')">Unstable</button></div></details>`:''}
      ${F.sockets?`<div style="margin-top:6px"><small><b>Rune sockets (${(F.runes||[]).length} of ${F.sockets})</b> · a rune must be found or earned first</small>${(F.runes||[]).map((x,i)=>`<div class="note" style="margin:2px 0 0">◆ <b>${esc(x)}</b>: ${esc(runeFx(x,wep))} <a href="#" onclick="forgedRune(${J(d.n)},${i},'');return false">remove</a></div>`).join('')}
        ${(F.runes||[]).length<F.sockets?`<select class="sel" style="max-width:240px;margin-top:4px" onchange="forgedRune(${J(d.n)},${(F.runes||[]).length},this.value)"><option value="">Fit a rune…</option>${rn.map(x=>`<option>${esc(x)}</option>`).join('')}</select>`:''}
        ${cl.length?`<div style="color:var(--red);font-size:.82rem;margin-top:4px"><b>Unstable runes:</b> ${cl.map(x=>x.join(' and ')).join('; ')} fight inside it. It breaks on a natural 1, and after each long rest roll a d20: on a 1, one rune cracks and is lost.</div>`:''}</div>`:'<div class="note" style="margin:4px 0 0">No rune sockets (its main material is below grade 5).</div>'}
      <div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><small><b>Growth:</b> ${F.marks||0} mark${(F.marks||0)===1?'':'s'}${got.length?' · '+got.map(g=>esc(g[1])).join(', '):''}${next?` · next: <b>${esc(next[1])}</b> at ${next[0]}`:''}</small><button class="btn" style="padding:2px 8px" onclick="forgedMark(${J(d.n)})">+ Mark</button></div>
      ${got.length?`<div class="note" style="margin:2px 0 0">${got.map(g=>`<b>${esc(g[1])}:</b> ${esc(g[2])}`).join(' ')}</div>`:''}</div>`}).join('')}
// ── the Workshop: Blueprints players forge, kept in the database; shared ones everyone can see ──
let WS={rows:null,err:'',busy:false};
// the shared pop-up window: focus moves in, Tab stays inside, Escape (or Close) closes it and focus goes back where it was
var MODAL_BACK=null;
function openModal(html){let host=document.getElementById('wsHost');if(!host){host=document.createElement('div');host.id='wsHost';document.body.appendChild(host);host.addEventListener('keydown',modalKeys)}
  if(!html){const was=!!host.innerHTML;host.innerHTML='';if(was&&MODAL_BACK&&document.contains(MODAL_BACK))try{MODAL_BACK.focus()}catch(e){}MODAL_BACK=null;return}
  const fresh=!host.innerHTML;if(fresh)MODAL_BACK=document.activeElement;
  host.innerHTML=`<div class="scav-pop" onclick="if(event.target===this)openModal()" role="dialog" aria-modal="true"><div class="scav-win" tabindex="-1"><div class="panel" style="border-color:var(--gold)">${html}<div style="margin-top:10px"><button class="btn" onclick="openModal()">Close</button></div></div></div></div>`;
  setTimeout(()=>{const d=host.querySelector('.scav-pop');if(!d)return;const h=d.querySelector('h3,h4');if(h)d.setAttribute('aria-label',h.textContent.trim());if(fresh||!d.contains(document.activeElement))(d.querySelector('.scav-win')).focus()},0)}
function modalKeys(e){const host=$('wsHost');if(!host||!host.innerHTML)return;if(e.key==='Escape'){e.stopPropagation();openModal();return}
  if(e.key!=='Tab')return;const f=[...host.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
  const first=f[0],last=f[f.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===host.querySelector('.scav-win'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
const num=v=>Number.isFinite(+v)?+v:'?';
const wsMine=row=>!!(CL.user&&row.owner===CL.user.id);
function wsData(d){const o=JSON.parse(JSON.stringify(d));delete o.sort;return o}
async function wsUpload(d){if(!(CL.on&&CL.user&&CL.sb))return;try{const {error}=await CL.sb.from('blueprints').upsert({owner:CL.user.id,maker:String(d.maker||'').slice(0,80),name:d.n.slice(0,120),base:String(d.base||'').slice(0,60),data:wsData(d),shared:!!d.shared,updated_at:new Date().toISOString()},{onConflict:'owner,name'});
  if(error)throw error;WS.rows=null}catch(e){toast('Saved here, but not to the Workshop yet: '+(e.message||e))}}
async function wsShare(n,on){const d=DESIGNS.find(x=>x.n===n);if(!d)return;d.shared=!!on;store.set('designs',DESIGNS);if(!(CL.on&&CL.user&&CL.sb)){toast('Sign in to share Blueprints in the Workshop');return}
  await wsUpload(d);toast(on?n+' is shared in the Workshop':n+' is private now')}
async function wsLoad(){if(WS.busy)return;if(CL.on&&!CL.sb){try{await cloudStart()}catch(e){}}if(!(CL.on&&CL.sb)){WS.err='The Workshop lives in the FAND database: it needs the site\'s cloud connection.';WS.rows=[];return}WS.busy=true;
  try{const {data,error}=await Promise.race([CL.sb.from('blueprints').select('id,owner,maker,name,base,data,shared,updated_at').or(CL.user?`shared.eq.true,owner.eq.${CL.user.id}`:'shared.eq.true').order('updated_at',{ascending:false}).limit(200),
      new Promise((_,no)=>setTimeout(()=>no(new Error('The FAND database did not answer. Check your connection and press Refresh.')),12000))]);
    if(error)throw error;WS.rows=data||[];WS.err='';lvMigrate(WS.rows.map(r=>{if(r.data&&typeof r.data==='object'&&!r.data.base)r.data.base=r.base;return r.data}));
    let fix=0;DESIGNS.forEach((d,i)=>{if(!d||!d.foreign||d.mats)return;const w=WS.rows.find(r=>r.owner===d.foreign.owner&&d.n===r.name+' (by '+(r.maker||'someone')+')');if(w){DESIGNS[i]=wsCopy(w,d.n);fix++}});
    if(fix){store.set('designs',DESIGNS);designPlace(true)}}catch(e){WS.rows=[];WS.err=/failed to fetch|network/i.test(e.message||'')?'Couldn\'t reach the FAND database. Check your connection and press Refresh.':/relation|does not exist|schema cache/i.test(e.message||'')?'The Workshop\'s table is not set up yet: the site owner runs the blueprints part of tools/cloud/schema.sql once (it ends by reloading the API\'s list of tables). The database said: '+(e.message||String(e)):(e.message||String(e))}
  WS.busy=false;if($('fg-ws'))$('fg-ws').innerHTML=wsHTML()}
function wsHTML(){if(WS.rows==null){setTimeout(wsLoad,0);return '<div class="note">Opening the Workshop…</div>'}if(WS.err)return `<div class="note">${esc(WS.err)}</div>`;
  const q=lc((WS.find||'').trim()),L=WS.rows.filter(w=>(WS.view!=='mine'||wsMine(w))&&(!q||lc(w.name+' '+w.base+' '+(w.maker||'')).includes(q)));
  if(!L.length)return WS.rows.length?'<div class="note">Nothing matches.</div>':'<div class="note">No Blueprints yet. Forge something and tick “Share this Blueprint in the Workshop”.</div>';
  return `<div class="note" style="margin:0 0 8px">${L.length} Blueprint${L.length===1?'':'s'}</div><div class="fg-ws">${L.map(w=>{const d=w.data||{},F=d.forged||{};return `<div class="fg-wscard"><b>${esc(w.name)}</b> ${serialTag(d)} ${wsMine(w)?`<span class="b ghost">${w.shared?'yours, shared':'yours, private'}</span>`:''}
    <div class="note" style="margin:2px 0 4px">${esc(w.base)} · item level ${num(d.il)} · ${esc(d.r||'Common')}${F.q?' · '+esc(F.q):''} · by ${esc(w.maker||'someone')}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" onclick="wsView(${esc(JSON.stringify(String(w.id)))})">View</button>${PARTY.length?`<button class="btn" onclick="wsEquip(${esc(JSON.stringify(String(w.id)))})">Equip…</button>`:''}${wsMine(w)?`<button class="btn" onclick="wsShare(${esc(JSON.stringify(w.name))},${!w.shared});setTimeout(()=>{WS.rows=null;renderTab()},400)">${w.shared?'Make private':'Share'}</button>`:''}</div></div>`}).join('')}</div>`}
// the Workshop page: everyone's shared Blueprints (and your own), searchable
function renderWorkshop(){const q=lc((WS.find||'').trim()),rows=WS.rows;
  $('content').innerHTML=`<div class="page"><section class="hero" style="margin-bottom:14px"><h2>🏛 The Workshop</h2><p>Blueprints forged by players, kept in the FAND database. Shared ones everyone can see; your own stay private unless you share them. You can study anyone's Blueprint, but an item only works for the one who forged it: equip someone else's and it is an invalid item. To make one, go to <a href="${pageUrl('forge')}" data-go="forge">the Forge</a>.</p></section>
    <div class="keyrow" style="margin-bottom:12px;flex-wrap:wrap;gap:8px"><input class="sel" id="ws-find" type="search" placeholder="Search by name, design, or maker" value="${esc(WS.find||'')}" style="flex:1;min-width:220px;max-width:none">
      <div class="seg">${[['all','Everyone\'s'],['mine','Mine']].map(([k,l])=>`<button class="${(WS.view||'all')===k?'on':''}" onclick="WS.view='${k}';renderWorkshop()">${l}</button>`).join('')}</div><button class="btn" onclick="WS.rows=null;renderWorkshop()">↻ Refresh</button></div>
    <div id="fg-ws">${wsHTML()}</div></div>`;
  const f=$('ws-find');if(f)f.oninput=e=>{WS.find=e.target.value;const at=e.target.selectionStart;renderWorkshop();const g=$('ws-find');if(g){g.focus();try{g.setSelectionRange(at,at)}catch(x){}}}}
function wsView(id){const w=(WS.rows||[]).find(x=>x.id===id);if(!w)return;const d=w.data||{},F=d.forged||{};
  openModal(`<h3 style="font-family:var(--serif)">${esc(w.name)}</h3><div class="note">${esc(w.base)} · forged by ${esc(w.maker||'someone')}${F.on?' on '+esc(F.on):''}</div>
    ${kv([['Item level',num(d.il)],['Rarity',esc(d.r||'Common')],F.q?['Quality',esc(F.q)]:null,d.dmg?['Damage',esc(fxDmg(d.dmg,gearFx({design:d,cat:d.cat})))]:null,d.atk!=null?['Accuracy',(+d.atk>=0?'+':'')+num(d.atk)]:null,d.ac!=null?['AC',num(d.ac)]:null,['Materials',esc([].concat(d.mats||[]).join(', '))],Array.isArray(d.powers)&&d.powers.length?['Powers',d.powers.map(x=>esc(x.n)+(x.k==='p'?' (Potency '+num(x.pot)+')':'')).join(', ')]:null].filter(Boolean))}
    ${d.lore||forgedDesc(d)?`<div class="callout" style="white-space:pre-line">${esc([d.lore,forgedDesc(d)].filter(Boolean).join('\n\n'))}</div>`:''}<div class="note">${wsMine(w)?'Your own Blueprint: equipping it gives a working item.':'Someone else\'s Blueprint: you can study it, but equipping it gives an invalid item. To use it, gather the materials and forge it yourself.'}</div>`)}
function wsEquip(id){const w=(WS.rows||[]).find(x=>x.id===id);if(!w)return;const who=prompt('Equip on which character? ('+PARTY.map(c=>c.name||'Unnamed').join(', ')+')',(PARTY[0]||{}).name||'');if(who==null)return;
  const c=PARTY.find(x=>lc(x.name||'')===lc(who.trim()))||PARTY[0];if(!c)return;let n=w.name;
  if(wsMine(w)){if(!DESIGNS.some(x=>x.n===w.name)){DESIGNS.push(Object.assign({},w.data,{n:w.name}));store.set('designs',DESIGNS);designPlace()}}
  else{n=w.name+' (by '+(w.maker||'someone')+')';if(!DESIGNS.some(x=>x.n===n)){DESIGNS.push(wsCopy(w,n));store.set('designs',DESIGNS);designPlace()}}
  c.gear=(c.gear||[]).concat(n);saveParty();toast(wsMine(w)?n+' equipped on '+(c.name||'character'):n+' equipped on '+(c.name||'character')+', but it is not theirs: it is an invalid item')}
function isForeign(b){return !!(b&&b.design&&b.design.foreign)}
function designPeekHTML(b){const D=b.design,P=D.peek,F=D.foreign;
  return `<div class="callout" style="border-color:var(--gold)">⚒ <b>Forged by ${esc((P||F).by||'another player')}</b>${P&&P.who?`, carried by <b>${esc(P.who)}</b>`:''}${D.base?' · made from the general '+esc(D.base):''}. ${F?'Equipped from the Workshop: it is someone else\'s item, so it gives you nothing (an invalid item). To use it, forge your own.':'You can read what it is and does; only the one who forged it can change it.'}${D.lore&&D.lore!==b.ds?`<div style="margin-top:6px">${esc(D.lore)}</div>`:''}</div>`}
// a copy of someone's Workshop Blueprint, kept so its description can be read; marked foreign so it never works for you
const wsCopy=(w,n)=>{const o=wsData(w.data||{});delete o.evo;delete o.shared;return Object.assign(o,{n,base:w.base,cat:o.cat||'Item',foreign:{by:w.maker||'someone',owner:w.owner}})};
// ── the Smelter: one of each component metal from the party's packs makes one of the alloy ──
let SMELT={who:'',all:false};
function smeltHTML(){const A=MATS.filter(m=>m.alloy&&Array.isArray(m.recipe)),M=invIndex(),c=PARTY.find(x=>x.id===SMELT.who)||null,dm=forgeDM();
  const rows=A.map(m=>({m,parts:m.recipe.map(n=>({n,have:invHas(M,n)}))})).filter(x=>SMELT.all||x.parts.some(p=>p.have)).sort((a,b)=>(a.m.tier-b.m.tier)||(a.m.g-b.m.g)||byName(a.m,b.m));
  const smith=c&&(hasProfession(c,'Blacksmithing')||dm);
  return `<section class="sec"><div class="sec-h"><h3>🔥 The Smelter: alloys</h3><p>Melt metals together into an alloy: one of each component from the party's packs makes one of the alloy, in the smelter's pack. It takes a smith (Blacksmithing) and an afternoon at the furnace. ${A.length} alloys are known, from pewter and bronze to star-metal.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px">${PARTY.length?`<label class="note" style="margin:0">Smelter <select class="sel" onchange="SMELT.who=this.value;renderForge()"><option value="">Choose…</option>${PARTY.map(x=>`<option value="${x.id}"${x.id===SMELT.who?' selected':''}>${esc(x.name||'Unnamed')}${x.prof||x.prof2?' ('+esc(profsOf(x).map(y=>y[0]).join(', '))+')':''}</option>`).join('')}</select></label>`:''}
      <label class="note" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox" ${SMELT.all?'checked':''} onchange="SMELT.all=this.checked;renderForge()"> Show every alloy, not only ones the party has a metal for</label>${c&&!smith?'<span class="note" style="margin:0;color:var(--red)">Only a Blacksmith can smelt.</span>':''}</div>
    ${rows.length?`<div class="tablewrap"><table class="t"><thead><tr><th>Alloy</th><th>Realm</th><th>Made from</th><th></th></tr></thead><tbody>${rows.map(({m,parts})=>{const ok=parts.every(p=>p.have>0);return `<tr><td>${refChip(m)}${m.pn?` <small style="color:var(--muted)">✧ ${esc(m.pn)}</small>`:''}</td><td>${esc(m.gr||'')}</td><td>${parts.map(p=>`<span style="color:var(--${p.have?'green':'muted'})">${esc(p.n)}${p.have?' ✓':''}</span>`).join(' + ')}</td><td>${ok&&smith?`<button class="btn" onclick="smelt(${esc(JSON.stringify(m.n))})">Smelt</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="note">No one in the party carries a metal for any alloy yet. Tick “Show every alloy” to see the recipes.</div>'}</section>`}
function smelt(n){const m=findMat(n),c=PARTY.find(x=>x.id===SMELT.who);if(!m||!c)return;const M=invIndex();if(m.recipe.some(x=>invHas(M,x)<1)){toast('Missing a metal');return}
  m.recipe.forEach(x=>invTake(M,x,1,c));invAdd(c,m.n,1,true,true);saveParty();forgeSound('metal',1);setTimeout(()=>forgeSound('metal',2),180);toast(`Smelted 1 ${m.n} into ${c.name||'their'} pack`);renderForge()}
// the Forge page's own sections: combos found, the master smiths, and the commission board
function forgeExtrasHTML(){const full=dmUnlocked();return artiForgeHTML()+(full?smeltHTML():'')+`<section class="sec"><div class="sec-h"><h3>✦ Material combos</h3><p>Two powers in one item, two properties, two traits, or one of each, can unlock something neither has alone (a property counts only at full Potency, so not from an extra part or a poor fit; a trait counts from any part it fits). Found ${COMBOS_FOUND.length} of ${FCOMBOS.length}.</p></div>
    <div class="mlist">${FCOMBOS.filter(x=>COMBOS_FOUND.includes(x[2])).map(([a,b,n,t])=>`<div style="padding:6px 10px;border:1px solid var(--gold);border-radius:8px"><b>✦ ${esc(n)}</b> <small>${esc(a)} + ${esc(b)}</small><div style="font-size:.82rem">${esc(t)}</div></div>`).join('')}${FCOMBOS.length>COMBOS_FOUND.length?`<div style="padding:6px 10px;border:1px dashed var(--line);border-radius:8px;color:var(--muted)"><b>??? + ???</b> <small>${FCOMBOS.length-COMBOS_FOUND.filter(n=>FCOMBOS.some(x=>x[2]===n)).length} combos still hidden. Try two properties or traits together and forge.</small></div>`:''}</div></section>
  <section class="sec"${full?'':' hidden'}><div class="sec-h"><h3>⚒ Master smiths</h3><p>Every realm has smiths who take commissions: an apprentice for simple work, a journeyman, an expert, and the realm's famous master, each able to work that realm's materials and forges. Bring them the materials and the coin (or, for a master, a task done in their name). A hired smith never ruins your materials or turns out a Flawed piece; the better the smith, the finer the work tends to be.${forgeNums()?' <small>(Numbers: a smith rolls like any forger, half their level, with advantage at or above the item\'s level. Fee: half the materials\' cost + 100 × (tier + step ÷ 10) + tier × 10, where the step is the level within the realm.)</small>':''}</p></div>
    <div class="tablewrap"><table class="t"><thead><tr><th>Realm</th><th>Master</th><th class="num">Level</th><th>Forge grade</th><th class="num">Fee</th><th>Or a task</th></tr></thead><tbody>${REALMS.filter(z=>SMITHS[z.n]).map(z=>{const S=smithOf(z.n),M=SMITHS[z.n];return `<tr><td>${esc(z.n)}</td><td><b>${esc(M[0])}</b><br><small style="color:var(--muted)">${esc(M[1])}</small></td><td class="num">${S.lv}</td><td>${ROMAN[S.g-1]}</td><td class="num">${fmt(S.base)} gp + half the materials</td><td>${esc(M[3])}</td></tr>`}).join('')}</tbody></table></div></section>
  ${full?fcBoardHTML():''}`}
function forgeOut(){const el=$('fg-out');if(!el)return;const made=FF.made&&DESIGNS.find(d=>d.n===FF.made);
  if(made){el.innerHTML=forgedCardHTML(made);return}
  const r=forgeResult(),B=r.B;
  const formGap=r.forms?everResults(r.forms).filter(x=>x&&x.missing.length):[],ready=r.parts.every(p=>p.s.optional||p.m)&&!formGap.length,bad=r.notes.some(n=>n[1]==='wrong');
  el.innerHTML=`<div class="panel" style="display:flex;flex-direction:column;gap:12px;border-color:${bad?'var(--red)':'var(--gold)'}">
    <label class="note" style="margin:0">Name<input class="sel" id="fg-name" value="${esc(r.name)}" style="max-width:none;width:100%;margin-top:4px;font-family:var(--serif);font-size:1.1rem;font-weight:700"></label>
    <div class="badges"><span class="b ghost">${esc(FORGE.base)}</span>${B.armor||B.shield?`<span class="b">${esc(B.slot||B.kind)}</span>`:''}${bad?'<span class="b red">Wrong material</span>':''}</div>
    ${r.notes.length?`<div class="callout" style="border-color:var(--red);background:color-mix(in srgb,var(--red) 8%,transparent)"><b style="color:var(--red)">Penalties</b><ul style="margin:6px 0 0 18px">${r.notes.map(([s,lv,t,why])=>`<li><b>${esc(s)}</b> (${lv==='wrong'?'wrong material':lv==='poor'?'poor fit':'too weak'}): ${why?esc(why)+' ':''}${lv==='weak'?t:esc(t)}</li>`).join('')}</ul></div>`:''}
    ${forgeEstimateHTML(r,ready,formGap)}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="FORGE.parts={};FORGE.name='';FORGE.pick=null;saveForge();renderForge()">Clear parts</button></div>
  </div>`;
  $('fg-name').onchange=e=>{FORGE.name=e.target.value.trim();saveForge()};
  if($('ff-who'))$('ff-who').onchange=e=>{FF.who=e.target.value;FF.res=null;FF.strikes=0;forgeOut()};
  if($('ff-smith'))$('ff-smith').onchange=e=>{FF.smith=e.target.value;FF.res=null;FF.strikes=0;forgeOut()};
  if($('ff-dmq'))$('ff-dmq').onchange=e=>{FF.dmq=e.target.value};if($('ff-dmquirk'))$('ff-dmquirk').onchange=e=>{FF.dmQuirk=e.target.checked};
}
// ════════════════════════════════════════════════════════════════
//  The Mystic Forge (Groq): the player describes a weapon and adds materials; Groq picks the design, places each
//  material on a part, and names it. FAND's own forge rules then work out the stats, so a Groq weapon is
//  balanced like any other, and the result is saved as a design (a Blueprint) like one made by hand.
// ════════════════════════════════════════════════════════════════
let GROQ=Object.assign({want:'',mats:[],msg:'',busy:false},store.get('groqforge',{}),{busy:false});
const saveGroqState=()=>store.set('groqforge',{want:GROQ.want,mats:GROQ.mats});
const GROQ_MAX_MATS=8;
// every general design but potions: weapons, armor, shields, and spellcasting focuses
const groqWeapons=()=>GEN.filter(([,b])=>!b.potion);
// who pays: the player's own key if they added one, else (signed in) the site's key through the `forge` Edge Function
const groqVia=()=>groqKey()?'own':CL.on&&(CL.user||clHasSession())?'site':'';
function groqPanel(){const key=groqVia(),mats=GROQ.mats.map(n=>findMat(n)).filter(Boolean);
  return `<div class="panel" id="gk" style="margin-bottom:14px;border-color:var(--acc)">
    <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:1.15rem">🔮 The Mystic Forge</b><span class="note" style="margin:0">Describe a weapon, armor, shield, or spellcasting focus, add your materials, and the Mystic Forge designs its Blueprint. The stats follow the Forge's rules.</span></div>
    <label class="note" style="display:block;margin:10px 0 0"><b>1. The item you want</b> <small style="font-weight:400">(a weapon, armor, a shield, or a spellcasting focus)</small><textarea id="gk-want" rows="2" maxlength="400" placeholder="A long, curved blade that hums in the dark…" style="display:block;width:100%;margin-top:4px;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:7px 9px;color:var(--text);font:inherit">${esc(GROQ.want)}</textarea></label>
    <div class="note" style="margin:10px 0 4px"><b>2. Your materials</b> (up to ${GROQ_MAX_MATS})</div>
    <div class="keyrow">${(MC_OPTS.gk={opts:invMats(invIndex()),arts:invArts(invIndex()),inv:true},'')}${mcHTML('gk','','Choose or type a material, or an artifact…')}</div>
    <div class="chips" style="margin-top:6px">${mats.length?mats.map((m,i)=>`<span class="chip">${refChip(m)} <small>${esc(m.gr||'')} · ${esc(CAT_NAME[matCode(m)]||'')}</small> <span style="cursor:pointer" data-gk-rm="${i}" title="Remove">✕</span></span>`).join(''):'<span class="note" style="margin:0">No materials yet. A weapon needs at least a hard main part (metal, bone, or stone) and something for the haft or hilt.</span>'}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px"><b class="note" style="margin:0">3.</b>
      ${key?`<button class="btn primary" type="button" id="gk-go" ${GROQ.busy?'disabled':''}>${GROQ.busy?'Forging…':'Forge the Blueprint'}</button>`:`<span class="note" style="margin:0">${CL.on?`<a href="${pageUrl('account')}" data-go="account">Sign in</a> to use the Mystic Forge, or add`:'Add'} your own Groq API key in <a href="${pageUrl('settings')}" data-go="settings">Settings → Assistant</a>.</span>`}
      <span class="note" id="gk-msg" style="margin:0">${esc(GROQ.msg||'')}</span></div>
  </div>`}
function bindGroq(){if(!$('gk'))return;
  $('gk-want').oninput=e=>{GROQ.want=e.target.value;saveGroqState()};
  mcBind($('gk'),(key,v)=>{const m=v&&findMat(v);if(!m)return;if(GROQ.mats.length>=GROQ_MAX_MATS){toast('Up to '+GROQ_MAX_MATS+' materials');return}GROQ.mats.push(m.n);saveGroqState();renderForge()});
  $('gk').querySelectorAll('[data-gk-rm]').forEach(el=>el.onclick=()=>{GROQ.mats.splice(+el.dataset.gkRm,1);saveGroqState();renderForge()});
  if($('gk-go'))$('gk-go').onclick=groqForge;
}
// Groq's free tier allows about 8,000 tokens a minute, so the prompt stays small: only the designs that fit the
// request (by its words, the Forge's own name keywords, and the kind of item), each in one compact line.
const CAT_SHORT={O:'Metal',W:'Wood',G:'Gem',S:'Stone',F:'Hide',B:'Bone',L:'Organ',E:'Essence',K:'Mechanism',U:'Supply'};
const designKind=b=>b.dmg&&!b.focus?'weapon':b.focus?'focus':b.shield?'shield':'armor';
function groqPick(want,n){const q=lc(want),words=q.split(/[^a-z]+/).filter(w=>w.length>2).map(w=>w.replace(/(es|s)$/,''));
  const kindHit={weapon:/weapon|sword|blade|axe|spear|bow|dagger|knife|hammer|mace|club|whip|lance|pike|glaive|halberd|trident|sling|dart|crossbow|scythe|sickle|flail|maul|rapier|scimitar|katana/,
    armor:/armou?r|helm|helmet|cuirass|breastplate|mail|plate|boots|gauntlet|glove|cloak|pauldron|barding|robe|hat|hood/,shield:/shield|buckler/,focus:/focus|spell|magic|wand|staff|orb|amulet|ring|rod|talisman|totem|charm|arcane|cast/};
  const sc=([n,b])=>{let v=0;const k=designKind(b),t=lc(n+' '+b.cat+' '+b.group+' '+(b.props||''));
    if(kindHit[k].test(q))v+=3;if(new RegExp('\\b'+lc(n).replace(/[^a-z ]/g,'')+'s?\\b').test(q))v+=10;
    const gk=GEN_KEYS.find(x=>x[0]===n);if(gk&&gk[1].test(q))v+=8;words.forEach(w=>{if(t.includes(w))v+=2});return v};
  const all=groqWeapons(),ranked=all.map(x=>[x,sc(x)]).sort((a,b)=>b[1]-a[1]);
  const top=ranked[0][1]>0?ranked.filter(x=>x[1]>0).slice(0,n).map(x=>x[0]):[];
  // nothing in the request points anywhere: a spread of common designs
  return top.length?top:all.filter(([nm])=>['Longsword','Battleaxe','Spear','Dagger','Warhammer','Shortbow','Cuirass','Helm','Shield','Staff','Wand','Amulet'].includes(nm))}
function groqPrompt(want,mats){
  const part=s=>`${s.id}(${s.role==='primary'?'main':s.role==='structure'?'structure':'extra'}${s.optional?', optional':''}): ${s.only?'Everchanging Substance only':s.ok.map(c=>CAT_SHORT[c]).join('/')+((s.weak||[]).length?'; poor '+s.weak.map(c=>CAT_SHORT[c]).join('/'):'')}`;
  const D=groqPick(want,12).map(([n,b])=>`${n} [${designKind(b)}${b.dmg?', '+b.dmg.join(' '):''}${b.slot?', '+b.slot:''}] parts: ${b.slots.map(part).join('; ')}`).join('\n');
  const M=mats.map(m=>`${m.n} | ${CAT_SHORT[matCode(m)]||''} | ${m.gr||''} | item level ${m.il||1}${m.pn?' | property '+m.pn:''}${m.tr?' | trait '+m.tr.n:''}`).join('\n');
  return [{role:'system',content:`You design items for FAND, a tabletop RPG: weapons, armor, shields, and spellcasting focuses. An item is one of the listed designs, and each part is made from one material. Never invent stats: the game works out damage, AC, focus bonuses, rarity, and properties; describe any special wish of the player in the lore only. Reply with JSON only:
{"design":"<a design name from the list>","parts":{"<part id>":"<material name>"},"name":"<a new, original name>","lore":"<2 to 4 plain sentences: how it looks and how each material shows>","unused":["<materials not placed>"]}
Rules: pick the design closest to the request. Use only the player's materials, spelled exactly. A material goes only on a part that lists its category (a poor one only if nothing else fits). Fill every part that is not optional if you can. A material may go on several parts. The name must not be the plain design name.`},
    {role:'user',content:`Request: ${want}\n\nMaterials (name | category | grade | item level | property | trait):\n${M}\n\nDesigns:\n${D}`}]}
// ════════════════════════════════════════════════════════════════
//  Material picker (the Forge): a dropdown of vault materials, best fits first. Whatever is typed is corrected to
//  the closest real material, so a made-up name never reaches a design. Artifacts can be broken down into a part:
//  one counts as its strongest material and passes on one of its materials' traits or properties, chosen at random.
// ════════════════════════════════════════════════════════════════
const MC_OPTS={};
const mcHTML=(key,val,ph)=>`<div class="mc"><input class="sel" data-mc="${esc(key)}" value="${esc(val)}" placeholder="${esc(ph)}" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" style="max-width:none;width:100%"><div class="mc-list" role="listbox" hidden></div></div>`;
let _arts=null;
function artifacts(){if(!_arts)_arts=BPS.slice(0,BP_VAULT).filter(b=>(b.mg||b.r==='Artifact')&&artTraits(b).length);return _arts}
function artTraits(b){const out=[],seen=new Set();(b.mats||[]).forEach(n=>{const m=MAT_IDX.get(lc(n));if(!m)return;
  if(m.tr&&!seen.has(m.tr.n)){seen.add(m.tr.n);out.push({k:'tr',n:m.tr.n,t:m.tr.t||'',tr:m.tr,from:m.n})}
  if(m.pn&&!seen.has(m.pn)){seen.add(m.pn);out.push({k:'pn',n:m.pn,t:m.prop||'',pot:m.pot,from:m.n})}});return out}
const artBase=b=>(b.mats||[]).map(n=>MAT_IDX.get(lc(n))).filter(Boolean).sort((a,c)=>(c.rank||0)-(a.rank||0))[0];
// "Artifact: <Blueprint> (<trait>)": the trait is chosen once, when the artifact is picked; a trait keeps its scope (weapon, armor, or worn)
function artPick(b){const T=artTraits(b);if(!T.length)return '';return `Artifact: ${b.n} (${T[Math.floor(Math.random()*T.length)].n})`}
const _artCache=new Map();
function artMat(name){if(_artCache.has(name))return _artCache.get(name);const x=/^Artifact: (.+) \(([^()]+)\)$/.exec(name||'');let v;
  const b=x&&BP_IDX.get(lc(x[1])),base=b&&artBase(b),t=b&&artTraits(b).find(t=>t.n===x[2]);
  if(base&&t){v={n:name,art:b.n,baseN:base.n,tc:matCode(base),ty:base.ty,realm:base.realm,gr:base.gr,tier:base.tier,g:base.g,rank:base.rank,il:Math.max(base.il||1,+b.lv||1),rar:b.r,price:0,_t:'bp',_i:b._i,
    ds:`The ${b.n}, broken down at the forge. It counts as ${base.n} and passes on one of its ${t.k==='tr'?'traits':'properties'}: ${t.n}.`};
    if(t.k==='tr')v.tr=Object.assign({},t.tr,{a:b.n});else{v.pn=t.n;v.pot=t.pot;v.prop=t.t}}
  _artCache.set(name,v);return v}
// closest real material (or an artifact by its name) to what was typed; '' when nothing is close
function mcCorrect(text,o){const q=lc(String(text||'').trim());if(!q)return '';
  if(/^artifact: /.test(q)&&findMat(text))return text.trim();
  const exact=MAT_IDX.get(q);if(exact&&(!o||!o.inv||o.opts.includes(exact)))return exact.n;
  if(o&&o.arts){const b=BP_IDX.get(q);if(b&&!b.design&&(Array.isArray(o.arts)?o.arts:artifacts()).includes(b))return artPick(b)}
  // word by word, forgiving typos: each typed word against its closest word in the name, and the other way round
  const lev=(x,y)=>{if(x===y)return 0;let p=null,r=Array.from({length:y.length+1},(_,i)=>i);for(let i=1;i<=x.length;i++){const n=[i];for(let j=1;j<=y.length;j++){n[j]=Math.min(r[j]+1,n[j-1]+1,r[j-1]+(x[i-1]===y[j-1]?0:1));if(p&&i>1&&j>1&&x[i-1]===y[j-2]&&x[i-2]===y[j-1])n[j]=Math.min(n[j],p[j-2]+1)}p=r;r=n}return r[y.length]};// a swap of two letters is one typo
  const sim=(x,y)=>1-lev(x,y)/Math.max(x.length,y.length),words=t=>t.split(/[^a-z0-9']+/).filter(Boolean),Q=words(q);
  const score=n=>{const l=lc(n);if(l.startsWith(q))return 3-l.length/1000;if(l.includes(q))return 2-l.length/1000;const W=words(l);if(!W.length||!Q.length)return 0;
    const a=Q.reduce((t,x)=>t+Math.max(...W.map(w=>sim(x,w))),0)/Q.length,b=W.reduce((t,w)=>t+Math.max(...Q.map(x=>sim(x,w))),0)/W.length;return .7*a+.3*b};
  // the whole vault is searched; materials that suit the part get a small head start, and so does a matching first letter
  const pref=new Set(o&&o.opts&&o.opts!==MATS?o.opts:[]);let best=null,bs=0;
  (o&&o.inv?o.opts:MATS).forEach(m=>{const v=score(m.n)+(pref.has(m)?.04:0)+(lc(m.n)[0]===q[0]?.02:0);if(v>bs){bs=v;best=m}});
  return bs>=0.45?best.n:''}
function mcList(inp){const o=MC_OPTS[inp.dataset.mc]||{opts:MATS},q=lc(inp.value.trim()),box=inp.nextElementSibling;
  const fit=m=>o.slot?slotFit(o.slot,m).lv:'',rank={good:0,poor:1,'':2,wrong:3};
  let L=q?o.opts.filter(m=>lc(m.n).includes(q)):o.opts.slice();
  L.sort((a,b)=>(q?(!lc(a.n).startsWith(q))-(!lc(b.n).startsWith(q)):0)||rank[fit(a)]-rank[fit(b)]);
  const A=Array.isArray(o.arts)?o.arts.filter(b=>!q||lc(b.n).includes(q)).slice(0,8):o.arts&&q.length>=2?artifacts().filter(b=>lc(b.n).includes(q)).slice(0,8):[];
  const row=(v,l,sub)=>`<div class="mc-opt" role="option" data-v="${esc(v)}"><span>${esc(l)}</span><small>${sub}</small></div>`;
  box.innerHTML=(L.length?`<div class="mc-h">Materials${q?'':' (best fits first)'}</div>`+L.slice(0,40).map(m=>row(m.n,m.n,esc((m.gr||'')+' · '+(CAT_NAME[matCode(m)]||'')+(o.hold?' · '+o.hold(m.n):''))+(o.slot?' · '+({good:'✓ good fit',poor:'△ poor fit',wrong:'✕ wrong'}[fit(m)]||''):''))).join('')+(L.length>40?`<div class="mc-more">${fmt(L.length-40)} more: type to narrow the list</div>`:''):'')
    +(A.length?`<div class="mc-h">⟡ Artifacts: break one down for one of its traits, at random</div>`+A.map(b=>row('@'+b.n,'⟡ '+b.n,esc(b.r+' · '+b.cat))).join(''):'')
    +(!L.length&&!A.length?`<div class="mc-more">${o.inv&&!o.opts.length?'Nobody in the party carries a material for this part.':`No material matches “${esc(inp.value)}”. Leave the box and it is corrected to the closest one.`}</div>`:'');
  box.hidden=false;inp.setAttribute('aria-expanded','true')}
function mcBind(root,onPick){root.querySelectorAll('input[data-mc]').forEach(inp=>{const box=inp.nextElementSibling,key=inp.dataset.mc,o=()=>MC_OPTS[key]||{opts:MATS};let start=inp.value;
  const close=()=>{box.hidden=true;inp.setAttribute('aria-expanded','false')};
  const pick=v=>{close();if(v&&v[0]==='@'){const b=BP_IDX.get(lc(v.slice(1)));v=b?artPick(b):''}inp.value=v;start=v;onPick(key,v)};
  const commit=()=>{const t=inp.value.trim();if(t===start)return;if(!t){pick('');return}if(o().any&&o().slot&&t[0]==='!'){pick('Anything: '+t.slice(1).trim().slice(0,60)+' ['+o().slot.ok[0]+']');return}const v=mcCorrect(t,o());if(!v&&o().any&&o().slot){pick('Anything: '+t.slice(0,60)+' ['+o().slot.ok[0]+']');return}if(!v){toast('No material like “'+t+'” '+(o().inv?'in the party\'s packs':'in the vault'));inp.value=start;return}if(lc(v)!==lc(t))toast('Corrected to '+(v.startsWith('Artifact: ')?v.replace(/^Artifact: /,'the artifact '):v));pick(v)};
  inp.addEventListener('focus',()=>{start=inp.value;mcList(inp)});inp.addEventListener('input',()=>mcList(inp));
  inp.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==inp){close();commit()}},120));
  inp.addEventListener('keydown',e=>{const opts=[...box.querySelectorAll('.mc-opt')],i=opts.findIndex(x=>x.classList.contains('on'));
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(box.hidden)mcList(inp);const n=opts.length?(i+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length:-1;opts.forEach((x,j)=>x.classList.toggle('on',j===n));if(n>=0)opts[n].scrollIntoView({block:'nearest'})}
    else if(e.key==='Enter'){e.preventDefault();if(i>=0)pick(opts[i].dataset.v);else{close();commit()}}else if(e.key==='Escape'){close();inp.value=start}});
  box.addEventListener('mousedown',e=>{const x=e.target.closest('.mc-opt');if(!x)return;e.preventDefault();pick(x.dataset.v)})})}
// the site's own keys, on the server (`forge` Edge Function): kind 'forge' uses the Groq key, 'sort' the sorting key
async function aiServer(kind,messages){
  if(CL.on&&!CL.user&&clHasSession()){try{await cloudStart();if(CL.signing)await CL.signing}catch(e){}}
  if(!(CL.on&&CL.user&&CL.sb))throw new Error('Sign in, or add your own Groq key in Settings.');
  const {data,error}=await CL.sb.functions.invoke('forge',{body:{kind,messages}});
  if(error){let t='';try{t=(await error.context.json()).error}catch(e){}const err=new Error(t||(/Failed to send|fetch/i.test(error.message||'')?'Could not reach the FAND server.':'The FAND server had a problem. Try again.'));err.status=error.context&&error.context.status;throw err}
  return String((data&&data.content)||'')}
let GROQ_AUTO='';
async function groqPickModel(){try{const r=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:'Bearer '+groqKey()}});if(!r.ok)return '';
  const ids=((await r.json()).data||[]).filter(m=>m.active!==false).map(m=>m.id).filter(id=>!/whisper|tts|guard|playai|orpheus|distil|compound|vision/i.test(id));
  for(const rx of [/gpt-oss-120b/i,/llama-4-maverick/i,/llama-3\.3-70b/i,/kimi-k2/i,/qwen3/i,/llama-4-scout/i,/gpt-oss-20b/i,/llama/i]){const f=ids.find(i=>rx.test(i));if(f)return f}return ids[0]||''}catch(e){return ''}}
async function groqCall(messages,json){
  if(!groqKey())return aiServer('forge',messages);
  const call=model=>fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+groqKey()},body:JSON.stringify(Object.assign({model,messages,temperature:0.8,max_completion_tokens:1500},/gpt-oss/i.test(model)?{reasoning_effort:'low'}:{},json?{response_format:{type:'json_object'}}:{}))});
  let model=GROQ_AUTO||groqModel(),r=await call(model);
  // Groq retires models over time: when this one is gone, use the best chat model the key can reach
  if(r.status===404||r.status===400&&/model_not_found|decommissioned|does not exist/i.test(await r.clone().text())){const m=await groqPickModel();if(m&&m!==model){GROQ_AUTO=m;r=await call(m)}}
  if(!r.ok){let t='';try{const j=await r.json();t=(j.error&&(j.error.message||j.error))||j.message||''}catch(e){}const err=new Error(r.status===401||r.status===403?'Groq did not accept the key. Check it in Settings.':r.status===429?'Groq says too many requests or no credit left. Try again later.':r.status===413?'That request was too large for Groq\'s per-minute limit. Try fewer materials, or wait a minute.':'Groq error '+r.status+(t?': '+String(t).slice(0,160):''));err.status=r.status;throw err}
  const j=await r.json();return String(((j.choices||[])[0]||{}).message?.content||'')}
function groqParse(t){const s=String(t).replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();const a=s.indexOf('{'),b=s.lastIndexOf('}');return JSON.parse(s.slice(a,b+1))}
async function groqForge(){
  const want=GROQ.want.trim(),mats=GROQ.mats.map(n=>findMat(n)).filter(Boolean);
  if(!want){toast('Describe the item you want first');$('gk-want').focus();return}
  if(!mats.length){toast('Add at least one material');return}
  GROQ.busy=true;GROQ.msg='Groq is designing your item…';renderForge();
  try{
    const msgs=groqPrompt(want,mats);let txt;
    try{txt=await groqCall(msgs,true)}catch(e){if(e.status===400&&groqKey())txt=await groqCall(msgs,false);else throw e}
    const o=groqParse(txt),W=new Map(groqWeapons().map(([n,b])=>[lc(n),[n,b]])),hit=W.get(lc(o.design||''));
    if(!hit)throw new Error('Groq picked a design the Forge does not know ('+String(o.design||'none').slice(0,40)+'). Try again or reword the request.');
    const [base,B]=hit,byName=new Map(mats.map(m=>[lc(m.n),m])),parts={};
    Object.entries(o.parts||{}).forEach(([id,mn])=>{const sl=B.slots.find(s=>s.id===id||lc(s.name)===lc(id)),m=byName.get(lc(mn||''));if(sl&&m&&slotFit(sl,m).lv!=='wrong')parts[sl.id]=m.n});
    if(!Object.keys(parts).length)throw new Error('None of these materials fit a '+base+'. Add a metal, bone, or stone for the main part.');
    let name=String(o.name||'').replace(/\s+/g,' ').trim().slice(0,60)||base;if(vaultBP(name))name+=' (forged)';
    FORGE=Object.assign({},FORGE,{base,parts,name,lore:String(o.lore||'').replace(/\s+/g,' ').trim().slice(0,700),want});saveForge();
    const miss=B.slots.filter(s=>!s.optional&&!parts[s.id]).map(s=>s.name);
    GROQ.busy=false;
    if(miss.length){GROQ.msg='Almost: still needs '+miss.join(', ')+'. Fill it below, then save.';renderForge()}
    else{GROQ.msg='';const d=saveDesign();GROQ.msg=d?'Forged “'+d.n+'”. Its Blueprint is saved below and in Saved designs.':'';renderForge()}
    $('fg-out')?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){GROQ.busy=false;GROQ.msg=e instanceof SyntaxError?'Groq\'s answer could not be read. Try again.':(e.message||'Could not reach Groq')+'';if(/Failed to fetch|NetworkError|Load failed/i.test(GROQ.msg))GROQ.msg='Could not reach Groq (api.groq.com). Check your connection.';renderForge()}
}
function designFromForge(){
  const r=forgeResult();
  return {lore:FORGE.lore||'',want:FORGE.want||'',n:FORGE.name||r.name,base:FORGE.base,parts:Object.assign({},FORGE.parts),ac:r.ac!=null?r.ac:null,ammo:r.ammo||null,dmg:r.damage?r.damage+' '+r.dtype:'',atk:r.attack!=null?r.attack:null,vers:r.vers||'',props:r.B.props||'',cat:r.B.cat,slot:r.B.slot||r.B.kind||'',mats:[...new Set(r.parts.filter(p=>p.m&&p.fit.lv!=='wrong').map(p=>p.m.n).concat(r.forms?everResults(r.forms).filter(Boolean).flatMap(x=>x.added.map(m=>m.n)):[]))],pr:r.prof,il:r.il,r:r.rar||'Common',gr:((r.parts.find(p=>p.s.role==='primary')||{}).m||{}).gr||'',prop:[...new Set(r.props.map(p=>p.m.pn).filter(Boolean))].concat(r.forms?[`Everchanging (${r.forms} forms)`]:[]).join(', '),
    combos:forgeCombos(r).map(x=>x[2]),forms:r.forms?[{n:FORGE.base,dmg:(r.damage||'')+' '+(r.dtype||''),atk:r.attack,props:r.B.props||''}].concat(everResults(r.forms).filter(x=>x&&!x.missing.length).map(x=>({n:x.e.base,dmg:(x.r.damage||'')+' '+(x.r.dtype||''),atk:x.r.attack,props:x.e.G.props||'',parts:Object.assign({},x.e.own)}))):null,formMax:r.forms||0,lvV:2};
}
const vaultBP=n=>{const b=BP_IDX.get(lc(n||''));return b&&!b.design?b:null};
function saveDesign(){const d=designFromForge();if(vaultBP(d.n)){toast('“'+d.n+'” is already a Blueprint in the vault: give your design another name');return null}d.sort=designSortRules(d);const i=DESIGNS.findIndex(x=>x.n===d.n);if(i>=0)DESIGNS[i]=d;else DESIGNS.push(d);store.set('designs',DESIGNS);designPlace();toast('Saved '+d.n+': filed under '+d.sort.pr+(d.sort.sp?' → '+d.sort.sp:''));renderForge();designAISort(d);return d}
function giveDesign(){const d=saveDesign();if(!d)return;const c=PARTY.find(x=>x.id===$('fg-who')?.value)||PARTY[0];if(!c)return;c.gear=(c.gear||[]).concat(d.n);saveParty();toast(d.n+' equipped on '+(c.name||'character'))}
function loadDesign(i){const d=DESIGNS[i];FORGE={base:BASES[d.base]?d.base:'Battleaxe',parts:Object.assign({},d.parts),ever:!!(d.forms&&d.forms.length),everForms:(d.forms||[]).slice(1).map(f=>({base:f.n,parts:Object.assign({},f.parts||{})})),name:d.n,lore:d.lore||'',want:d.want||'',showAll:FORGE.showAll,realm:FORGE.realm};saveForge();renderForge()}
// Saved designs act like Blueprints in the party tracker and crafting planner
const _findBP=findBP;
// a saved design wins over a vault Blueprint of the same name (new designs cannot take a vault name, older ones may have)
findBP=n=>{const k=lc(n||'');for(let i=BPS.length-1;i>=BP_VAULT;i--)if(lc(BPS[i].n)===k)return BPS[i];return _findBP(n)};
// rebuild the design part of the Blueprint list after a design is saved, filed again, or deleted
function designPlace(quiet){BPS.length=BP_VAULT;DESIGNS.forEach(d=>{if(d&&d.n)BPS.push(designBP(d))});
  const have=new Set(DESIGNS.map(d=>d&&d.n));PARTY.forEach(c=>{if(!c||!c.fd||typeof c.fd!=='object')return;Object.keys(c.fd).forEach(n=>{const d=c.fd[n];if(have.has(n)||!d||typeof d!=='object')return;have.add(n);
    BPS.push(designBP(Object.assign({},d,{n,peek:{by:(d.forged&&d.forged.by)||(c._by&&c._by.n)||'another player',who:c.name||''}})))})});for(let i=BP_VAULT;i<BPS.length;i++){BPS[i]._t='bp';BPS[i]._i=i}
  BP_IDX.clear();BPS.forEach(b=>{if(!BP_IDX.has(lc(b.n)))BP_IDX.set(lc(b.n),b)});_bpByMat=null;BP_BY_GEN.m=null;if(!quiet&&TAB==='blueprints')renderTab()}
designPlace(true);
function designDelete(i){const [x]=DESIGNS.splice(i,1);if(!x)return;store.set('designs',DESIGNS);designPlace();renderForge();undoToast('Deleted '+x.n,()=>{DESIGNS.splice(i,0,x);store.set('designs',DESIGNS);designPlace();renderForge()})}
function designOpen(n){const i=DESIGNS.findIndex(d=>d.n===n);if(i<0)return;go('forge');setTimeout(()=>loadDesign(i),0)}
// FAND's own filing: the design's crafting profession, and the specialty most vault Blueprints of the same general design use
function designSortRules(d){const V=BPS.slice(0,BP_VAULT),pr=d.pr||'Blacksmithing',same=V.filter(b=>b.pr===pr&&genOf(b)===d.base),pool=same.length?same:V.filter(b=>b.pr===pr&&b.cat===d.cat),c={};
  pool.forEach(b=>{if(b.sp&&b.sp!==b.pr)c[b.sp]=(c[b.sp]||0)+1});const sp=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
  return {pr,sp:sp?sp[0]:'',cat:d.cat||'Item',ds:d.lore||`A ${lc(d.base||'item')} made from ${(d.mats||[]).join(', ')||'unknown materials'}.`,by:'rules'}}
// AI filing (the site's sort key through the server when signed in, else the player's own Groq key): profession,
// specialty, and item type chosen from the ones the Blueprint library already uses, plus a short description
async function designAISort(d,loud){const site=CL.on&&CL.user&&CL.sb,own=!!groqKey();if(!site&&!own){if(loud)toast('Filing by AI needs you signed in, or your own Groq key in Settings');return}
  const V=BPS.slice(0,BP_VAULT),profs={};V.forEach(b=>{if(!b.pr)return;const p=profs[b.pr]||(profs[b.pr]={});if(b.sp&&b.sp!==b.pr)p[b.sp]=(p[b.sp]||0)+1});
  const P=Object.fromEntries(Object.entries(profs).map(([p,sp])=>[p,Object.entries(sp).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0])])),cats=[...new Set(V.map(b=>b.cat).filter(Boolean))];
  const msgs=[{role:'system',content:`You file new item Blueprints in the Blueprint library of FAND, a tabletop RPG. Reply with JSON only: {"pr":"<profession>","sp":"<specialty>","cat":"<item type>","ds":"<description>"}
Rules: pr must be one of the given professions, the one that would craft this item. sp must be one of that profession's specialties, or "" if none fits. cat must be one of the given item types. ds is one or two sentences in plain English describing the item and what its materials give it; no numbers or game stats.`},
    {role:'user',content:JSON.stringify({item:{name:d.n,design:d.base,type:d.cat,damage:d.dmg||'',ac:d.ac,properties:[d.props,d.prop].filter(Boolean).join('; '),materials:d.mats,rarity:d.r,itemLevel:d.il,craftedWith:d.pr,lore:d.lore||''},professions:P,itemTypes:cats})}];
  let txt;try{txt=site?await aiServer('sort',msgs).catch(e=>{if(own)return groqCall(msgs,true);throw e}):await groqCall(msgs,true)}catch(e){if(loud)toast(e.message||'Could not file it by AI');return}
  let o;try{o=groqParse(txt)}catch(e){if(loud)toast('The AI\'s answer could not be read');return}
  const pr=P[o.pr]?o.pr:d.sort&&d.sort.pr||d.pr,sp=P[pr]&&(P[pr].includes(o.sp)||V.some(b=>b.pr===pr&&b.sp===o.sp))?o.sp:'',cat=cats.includes(o.cat)?o.cat:d.cat,ds=String(o.ds||'').replace(/\s+/g,' ').trim().slice(0,400)||(d.sort&&d.sort.ds)||'';
  const live=DESIGNS.find(x=>x.n===d.n);if(!live)return;live.sort={pr,sp,cat,ds,by:'ai'};store.set('designs',DESIGNS);designPlace();toast(d.n+' filed under '+pr+(sp?' → '+sp:'')+' by AI')}
function designResort(n){const d=DESIGNS.find(x=>x.n===n);if(!d)return;d.sort=designSortRules(d);store.set('designs',DESIGNS);designPlace();designAISort(d,true);closeAll();openItem(findBP(n))}

// ════════════════════════════════════════════════════════════════
//  Settings
// ════════════════════════════════════════════════════════════════
const KEY_NAME='fand.anthropicKey';
// Groq (Groq) key for the Forge: kept in this browser only, like the Anthropic key
const GROQ_KEY='fand.groqKey',GROQ_DEFAULT_MODEL='openai/gpt-oss-120b';
function groqKey(){try{return localStorage.getItem(GROQ_KEY)||''}catch(e){return ''}}
function groqModel(){return store.get('groqModel','')||GROQ_DEFAULT_MODEL}
function saveGroq(k,model){try{if(k)localStorage.setItem(GROQ_KEY,k);else localStorage.removeItem(GROQ_KEY)}catch(e){}if(model!=null)store.set('groqModel',model&&model!==GROQ_DEFAULT_MODEL?model:'')}
function getKey(){try{return sessionStorage.getItem(KEY_NAME)||localStorage.getItem(KEY_NAME)||''}catch(e){return ''}}
function keyRemembered(){try{return !!localStorage.getItem(KEY_NAME)}catch(e){return false}}
function saveKey(k,remember){try{localStorage.removeItem(KEY_NAME);sessionStorage.removeItem(KEY_NAME);if(k)(remember?localStorage:sessionStorage).setItem(KEY_NAME,k)}catch(e){}AI.client=null}
// Settings and Account are pages of their own (settings.html, account.html); these keep the old names working
function openSettings(){go('settings')}
function openAccount(){go('account')}
function closeSettings(){}
const setSec=(id,title,sub,body)=>`<section class="panel set-sec" id="set-${id}"><h3>${title}</h3>${sub?`<p class="note" style="margin:2px 0 12px">${sub}</p>`:''}${body}</section>`;
document.addEventListener('change',e=>{const s=e.target.closest('[data-bslot]');if(s)bnavSet(+s.dataset.bslot,s.value)});
function renderSettings(){const k=getKey(),u=CL.user,dark=document.documentElement.dataset.theme!=='light';
  const nav=[['account','Account'],['play','How you play'],['look','Appearance'],['ai','Assistant'],['data','Saved data'],['app','App']];
  $('content').innerHTML=`<div class="page set-wrap">
    <div class="sec-h pg-h" style="margin-top:4px"><h3 style="font-size:1.5rem">Settings</h3><p>How FAND looks and behaves on this device, the assistant's key, and your saved data.</p></div>
    <div class="set-layout"><nav class="set-nav" aria-label="Settings sections">${nav.map(([id,l])=>`<a href="#" onclick="document.getElementById('set-${id}').scrollIntoView({behavior:'smooth'});return false">${l}</a>`).join('')}</nav>
    <div class="set-main">
      ${setSec('account','Account',CL.on?'Your characters and saved data follow your account to every device.':'',!CL.on?`<div class="note">Accounts aren't switched on for this copy of FAND.</div>`
        :u?`<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${clAvHTML(u.id,clMyName()||u.email,56)}<div style="flex:1;min-width:160px"><b style="display:block">${esc(clMyName()||'No name yet')}</b><small style="color:var(--muted)">${esc(u.email||'')}</small><div class="note" id="clStat" style="margin:2px 0 0">${clStatusText()}</div></div><button class="btn primary" type="button" onclick="openAccount()">Your account</button><button class="btn" type="button" onclick="cloudSignOut()">Sign out</button></div>`
        :`<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:200px">You're not signed in. Signed in, your characters, journal, and the rest are kept in your account, and you can play in your DM's campaign.</span><button class="btn primary" type="button" onclick="openAccount()">Sign in</button></div>`)}
      ${setSec('play','How you play','FAND puts the pages you use most first: in the menu, on Home, and in the bar at the bottom of phones.',`<div class="set-row"><span>I mostly use FAND as<small>${role()==='dm'?'DM: a DM menu with hidden classes, session prep, encounters, combat, hooks, and Towers':role()==='player'?'Player: your character, party, dice, and journal first; the hidden class list stays with the DM':'Every page in its usual place'}</small></span><div class="seg">${Object.entries(ROLES).map(([k,l])=>`<button type="button" class="${(role()||'both')===k?'on':''}" onclick="setRole('${k}')">${k==='dm'?'DM':l}</button>`).join('')}</div></div>`)}
      ${setSec('bar','Bottom bar','The bar of buttons along the bottom of the screen on a phone. Choose its four buttons: pages you go to most, or actions like Quick note, Undo or the Table screen. Menu, with every page, is always the fifth.',bnavSetHTML())}
      ${setSec('look','Appearance','',`<div class="set-row"><span>Theme</span><div class="seg"><button type="button" class="${dark?'on':''}" onclick="store.set('theme','dark');applyTheme('dark');renderSettings()">Dark</button><button type="button" class="${!dark?'on':''}" onclick="store.set('theme','light');applyTheme('light');renderSettings()">Light</button></div></div>
        <div class="set-row" style="display:block"><span style="display:block;margin-bottom:8px">Dice style<small>${esc(diceSkin().name)} · ${DSK.length} styles to choose from</small></span>${diceSkinGrid('st')}</div>
        <div class="set-row"><span>Text size<small>Makes every page's text bigger or smaller</small></span><div class="seg" style="flex-wrap:wrap">${TSCALES.map(([z,l])=>`<button type="button" class="${Math.abs(+store.get('tscale',1)-z)<.01?'on':''}" onclick="setComfort('tscale',${z})" style="font-size:${z}em">${l}</button>`).join('')}</div></div>
        <label class="set-row"><span>High contrast<small>Brighter text and stronger borders</small></span><input type="checkbox" ${store.get('contrast',false)?'checked':''} onchange="setComfort('contrast',this.checked)"></label>
        <label class="set-row"><span>Less motion<small>No sliding, fading, or tumbling dice${matchMedia('(prefers-reduced-motion: reduce)').matches?' (your device already asks for this)':''}</small></span><input type="checkbox" ${lessMotion()?'checked':''} onchange="setComfort('motion',this.checked?'reduce':'full')"></label>
        <label class="set-row"><span>Dice sounds<small>A clack each time a die hits the table</small></span><input type="checkbox" ${store.get('dicesound',true)?'checked':''} onchange="store.set('dicesound',this.checked);if(this.checked)diceClack(.7)"></label>
        <label class="set-row"><span>Rolling dice animation<small>Dice are thrown onto the table, bounce, and settle when you roll</small></span><input type="checkbox" ${store.get('diceanim',true)?'checked':''} onchange="store.set('diceanim',this.checked);toast(this.checked?'Rolling dice on':'Rolling dice off')"></label>${SITE?`
        <label class="set-row"><span>Roll with the 3D Dice Table<small>Every roll on the site (the dice you tap, the sheet, the quick roll) is thrown on the physics table. A DM rig still uses the quick dice.</small></span><input type="checkbox" ${store.get('dice3d',false)?'checked':''} onchange="store.set('dice3d',this.checked);toast(this.checked?'Rolls go to the 3D Dice Table':'Rolls use the quick dice')"></label>`:''}`)}
      ${setSec('ai','Assistant <em>Ask FAND</em>','The assistant answers from the compendium using Claude, through your own Anthropic API key.',`
        <div class="keyrow"><input class="sel" id="setKey" type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" value="${esc(k)}" style="max-width:none;flex:1"><button class="btn" id="setShow" type="button">Show</button></div>
        <label class="note" style="display:flex;gap:8px;align-items:center;margin-top:8px;color:var(--text2)"><input type="checkbox" id="setRemember" ${!k||keyRemembered()?'checked':''}> Remember on this device</label>
        <div id="setMsg" class="okline">${k?'A key is saved.':''}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px"><button class="btn primary" type="button" id="setSave">Save key</button><button class="btn" type="button" id="setRemove" ${k?'':'disabled'}>Remove key</button></div>
        <div class="note">The key is stored only in this browser (never in your account) and is sent only to Anthropic's API (api.anthropic.com). Usage is billed to your Anthropic account. Get a key at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. On a shared computer, untick “Remember” so the key is forgotten when the tab closes.</div>
        <h4 style="margin:18px 0 6px;font-family:var(--serif)">The Mystic Forge</h4>
        <p class="note" style="margin:0 0 8px">The Forge can design a weapon from your description and materials using Groq.${CL.on?' Signed-in players use this site\'s key (a few forges a day); add your own key to use yours instead, with no daily limit.':' Add your own Groq API key to use it.'}</p>
        <div class="keyrow"><input class="sel" id="setGroq" type="password" autocomplete="off" spellcheck="false" placeholder="gsk_…" value="${esc(groqKey())}" style="max-width:none;flex:1"><button class="btn" id="setGroqShow" type="button">Show</button></div>
        <label class="note" style="display:flex;gap:8px;align-items:center;margin:8px 0 0">Model <input class="sel" id="setGroqModel" value="${esc(groqModel())}" style="max-width:200px" spellcheck="false"></label>
        <div id="setGroqMsg" class="okline">${groqKey()?'A Groq key is saved.':''}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px"><button class="btn primary" type="button" id="setGroqSave">Save Groq key</button><button class="btn" type="button" id="setGroqRemove" ${groqKey()?'':'disabled'}>Remove</button></div>
        <div class="note">Like the Anthropic key, it is stored only in this browser (never in your account or backups) and is sent only to Groq's API (api.groq.com). Usage is billed to your Groq account. Get a key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com</a>.</div>`)}
      ${setSec('rules','Table rules','Choices your table makes about FAND\'s rules. They are saved with your other settings.',(()=>{const R=profRule();return `<div class="set-row"><span>Second profession<small>Whether a character can take up a second profession, and when</small></span><select class="sel" id="setProf2" aria-label="Second profession rule">${PROF2_MODES.map(([k,l])=>`<option value="${k}"${k===R.mode?' selected':''}>${esc(l)}</option>`).join('')}</select></div>${R.mode==='gate'||R.mode==='both'?`<div class="set-row"><span>Unlocks at first-profession level</span><input class="sel" id="setProf2At" type="number" min="1" max="100" value="${R.at}" style="width:90px" aria-label="Level the first profession needs"></div>`:''}`})())}
      ${setSec('data','Saved data','Everything FAND saves lives in this browser'+(u?' and in your account.':'. Sign in to keep it in an account too.'),`
        <div class="set-row"><span>Ask before changing many things at once<small>A rest for the whole party, splitting loot, clearing the tracker, ending a fight, clearing pins, a faction's standing for everyone. ↶ Undo (Ctrl+Z) takes back any change either way.</small></span><label class="chk"><input type="checkbox" id="setAskMass"${store.get('askmass',true)!==false?' checked':''} onchange="store.set('askmass',this.checked);toast(this.checked?'FAND asks before changes to many things':'Changes to many things happen at once (↶ Undo still works)')"> Ask first</label></div>
        <div class="set-row"><span>Undo history<small>${UNDO.steps.length?UNDO.steps.length+' change'+(UNDO.steps.length>1?'s':'')+' you can undo in this tab, the last to '+esc(undoLabel(UNDO.steps[UNDO.steps.length-1])):'Nothing to undo yet in this tab'}. Kept until you close the tab.</small></span><button class="btn" type="button" onclick="undoDo();renderSettings()"${UNDO.steps.length?'':' disabled'}>↶ Undo</button></div>
        <div class="set-row"><span>Back up everything<small>A file with your characters, journal, plans, designs, dice, and settings</small></span><button class="btn" type="button" onclick="setExport()">Download backup</button></div>
        <div class="set-row"><span>Restore a backup<small>Replaces the same data on this device${u?' and in your account':''}</small></span><label class="btn" style="cursor:pointer">Choose file<input type="file" accept=".json,application/json" hidden onchange="setImport(this)"></label></div>
        ${(()=>{const U=storeUsage();return `<div class="set-row"><span>Space used on this device<small>${kbmb(U.bytes)} of about 5 MB${U.pics?` (portraits ${kbmb(U.pics)})`:''}. When it is full, changes can't be saved; FAND will say so.</small></span><meter min="0" max="5242880" low="3500000" high="4500000" optimum="0" value="${U.bytes}" aria-label="Space used" style="width:120px"></meter></div>`})()}
        <div class="set-row"><span>Pins<small>${PINS.size} pinned item${PINS.size===1?'':'s'}</small></span><button class="btn" type="button" onclick="clearPins()">Clear pins</button></div>
        <div class="set-row"><span>Assistant chat<small>The conversation in this tab</small></span><button class="btn" type="button" onclick="newChat();toast('Chat cleared')">Clear chat</button></div>`)}
      ${setSec('app','App','',`<div class="set-row"><span>Install FAND<small>Its own window, the Start menu, and offline play</small></span><button class="btn" type="button" onclick="installApp()">Install</button></div>
        <div class="set-row"><span>Version<small>${esc(String(META.version||''))}${META.built?' · built '+esc(META.built):''}${SITE&&SITE.b?' · build '+esc(SITE.b):''}</small></span>${SITE&&SITE.b?'<button class="btn" type="button" id="updBtn" onclick="checkUpdate()">Check for updates</button>':''}</div>
        <div class="okline" id="updMsg" style="min-height:0"></div>
        <div class="note">${SITE?'FAND keeps a copy of itself for offline play and loads the newest version whenever you\'re online. A new version can take up to 10 minutes to reach everyone after it is published; if a change still doesn\'t show, use Check for updates.':'This is the single-file version (FAND.html): download it again from the website for the newest version.'}</div>`)}
    </div></div></div>`;
  if($('setProf2'))$('setProf2').onchange=()=>{const r=store.get('rules',{})||{};r.prof2=$('setProf2').value;store.set('rules',r);toast('Second-profession rule saved');renderSettings()};
  if($('setProf2At'))$('setProf2At').onchange=()=>{const r=store.get('rules',{})||{};r.prof2At=Math.max(1,Math.min(100,Math.round(+$('setProf2At').value)||10));store.set('rules',r);toast('Saved')};
  if($('setShow')){$('setShow').onclick=()=>{const i=$('setKey');i.type=i.type==='password'?'text':'password';$('setShow').textContent=i.type==='password'?'Show':'Hide'};
    $('setSave').onclick=()=>{const v=$('setKey').value.trim();if(v&&!/^sk-ant-/.test(v)){$('setMsg').style.color='var(--red)';$('setMsg').textContent='That doesn\'t look like an Anthropic API key (they start with sk-ant-).';return}saveKey(v,$('setRemember').checked);toast(v?'API key saved':'API key removed');renderAI();renderSettings()};
    $('setKey').onkeydown=e=>{if(e.key==='Enter')$('setSave').click()};
    $('setGroqShow').onclick=()=>{const i=$('setGroq');i.type=i.type==='password'?'text':'password';$('setGroqShow').textContent=i.type==='password'?'Show':'Hide'};
    $('setGroqSave').onclick=()=>{const v=$('setGroq').value.trim();if(v&&!/^gsk_/.test(v)){$('setGroqMsg').style.color='var(--red)';$('setGroqMsg').textContent='That doesn\'t look like an Groq API key (they start with gsk_).';return}saveGroq(v,$('setGroqModel').value.trim());toast(v?'Groq key saved':'Groq key removed');renderSettings()};
    $('setGroq').onkeydown=e=>{if(e.key==='Enter')$('setGroqSave').click()};
    $('setGroqRemove').onclick=()=>{saveGroq('');toast('Groq key removed');renderSettings()};
    $('setRemove').onclick=()=>{saveKey('',false);toast('API key removed');renderAI();renderSettings()}}}
function clearPins(){if(PINS.size>1&&!massOk('Clear all '+PINS.size+' pins?'))return;const was=[...PINS];PINS=new Set();store.set('pins',[]);renderSettings();undoToast('Pins cleared',()=>{PINS=new Set(was);store.set('pins',was);if(TAB==='settings')renderSettings()})}
// backups: every key this site saves (never the API key or account bookkeeping)
function setExport(){const data={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('fand.')&&k!==KEY_NAME&&k!==GROQ_KEY&&!k.startsWith('fand.__'))data[k.slice(5)]=localStorage.getItem(k)}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({fand:'backup',at:new Date().toISOString(),data},null,1)],{type:'application/json'}));a.download='FAND backup '+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();toast('Backup downloaded')}
function setImport(inp){const f=inp.files&&inp.files[0];inp.value='';if(!f)return;f.text().then(async t=>{let o;try{o=JSON.parse(t)}catch(e){}if(!o||o.fand!=='backup'||!o.data||typeof o.data!=='object'){toast('That file is not a FAND backup');return}
  o.data=Object.fromEntries(Object.entries(o.data).map(([k,v])=>[k.startsWith('fand.')?k.slice(5):k,v]));// accepts the Tools backup too (keys with the fand. prefix)
  const keys=Object.keys(o.data).filter(k=>/^[\w.-]{1,64}$/.test(k)&&!k.startsWith('__')&&k!=='anthropicKey'&&k!=='groqKey');if(!confirm('Restore '+keys.length+' saved items from '+(o.at?new Date(o.at).toLocaleString():'this backup')+'? They replace the same items on this device'+(CL.user?' and in your account':'')+'.'))return;
  const now=Date.now();keys.forEach(k=>{let v;try{v=JSON.parse(o.data[k])}catch(e){return}if(k==='party'&&Array.isArray(v))v=v.map(c=>Object.assign({},c,{_m:now}));store.set(k,v)});
  if(CL.user)try{await cloudPush()}catch(e){}toast('Backup restored');setTimeout(()=>location.reload(),400)})}
// ════════════════════════════════════════════════════════════════
//  First-visit guide and Help
// ════════════════════════════════════════════════════════════════
// Five short steps the first time someone opens Home (skippable; replay it from Help). Each step can point at a part of
// the screen: the first one of its targets that is visible gets a gold ring.
const GUIDE=[
  {t:'Welcome to FAND',b:'The compendium for Fantasy and Numerous Disasters: every Blueprint, material, monster, realm, god, and rule of Vestige, with tools for the table. How do you mostly use it?',role:true},
  {t:'Search everything',b:'Find any Blueprint, monster, spell, god, or rule from any page. On a computer, press Ctrl K.',at:['.search-btn','#bnav button:nth-child(2)']},
  {t:'Make a character',b:'The character builder walks you through it in a few steps, then your sheet does the maths: hit points, armour, spells, and gear.',act:['Build a character',()=>charWizard()]},
  {t:'Roll dice anywhere',b:'Tap any dice like 2d6 + 3 on a page to roll it. The Dice page has a dice pool, saved rolls, and 30 dice styles.',at:['#bnav a[data-tab="dice"]']},
  {t:'Your account and settings',b:'Sign in to keep your characters on every device and join your DM\'s campaign. Settings has the theme, text size, and more; Help is in the menu under Reference.',at:['#acctBtn:not([hidden])','.top .icon-btn[aria-label="Settings"]']},
  {t:'Want the full tour?',b:'The New player guide shows every feature of FAND and has short hands-on tutorials: finding things, your first character, dice, crafting, the world, and running a game. It is always in the Reference menu.',act:['Open the guide',()=>go('guide')]},
];
let GSTEP=-1,GT=GUIDE,GTID='welcome';
// a tour is a list of steps: {t,b, go:'page' to open first, at:[selectors to highlight, first one found], act:[label,fn]}
function openGuide(k){openTour('welcome',k)}
function openTour(id,k){GTID=id;GT=id==='welcome'?GUIDE:(TOURS[id]||{}).steps||GUIDE;GSTEP=k||0;if(!$('gd')){document.body.insertAdjacentHTML('beforeend','<div class="gd-bg" id="gd-bg"></div><div class="gd-ring" id="gd-ring" hidden></div><div class="gd-card" id="gd" role="dialog" aria-modal="true" aria-labelledby="gd-t"></div>');$('gd-bg').onclick=()=>closeGuide()}guideDraw()}
function guideDraw(){const g=GT[GSTEP];if(!g){closeGuide();return}
  if(g.go&&TAB!==g.go){$('gd').innerHTML='<p class="note" style="margin:0">Opening '+esc((TABS.find(t=>t[0]===g.go)||[])[1]||g.go)+'…</p>';$('gd-ring').hidden=true;
    // the website is one file per page, so a tour remembers its place for this tab and picks up again on the next page
    if(SITE)try{sessionStorage.setItem('fand.tour',JSON.stringify({id:GTID,k:GSTEP}))}catch(e){}go(g.go);setTimeout(()=>{if(GSTEP>=0&&GT[GSTEP]===g)guideDraw()},550);return}
  const last=GSTEP===GT.length-1,r=role(),tour=GTID!=='welcome'&&TOURS[GTID];
  $('gd').innerHTML=`${tour?`<div class="gd-tour">${esc(tour.icon+' '+tour.t)} · ${GSTEP+1} of ${GT.length}</div>`:''}<div class="gd-dots" aria-hidden="true">${GT.map((_,i)=>`<i class="${i===GSTEP?'on':''}"></i>`).join('')}</div><h3 id="gd-t">${esc(g.t)}</h3><p>${esc(g.b)}</p>
    ${g.role?`<div class="gd-roles">${[['player','I\'m a player'],['dm','I\'m the DM'],['both','Both']].map(([k,l])=>`<button type="button" class="btn${r===k?' primary':''}" data-gr="${k}">${l}</button>`).join('')}</div>`:''}
    <div class="gd-foot"><button type="button" class="btn" data-gx>${last?'Close':'Skip'}</button><span style="flex:1"></span>${GSTEP?'<button type="button" class="btn" data-gp>Back</button>':''}${g.act?`<button type="button" class="btn" data-ga>${esc(g.act[0])}</button>`:''}<button type="button" class="btn primary" data-gn>${last?'Done':'Next'}</button></div>`;
  const ring=$('gd-ring'),el=(g.at||[]).map(q=>{try{return document.querySelector(q)}catch(e){return null}}).find(e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&getComputedStyle(e).visibility!=='hidden'});// (floating buttons count too)
  const place=()=>{if(GSTEP<0||GT[GSTEP]!==g)return;if(el){const b=el.getBoundingClientRect();Object.assign(ring.style,{left:(b.left-6)+'px',top:(b.top-6)+'px',width:(b.width+12)+'px',height:(Math.min(b.height,innerHeight*.6)+12)+'px'});ring.hidden=false;$('gd-bg').classList.remove('dim');
    $('gd').classList.toggle('gd-up',b.top>innerHeight/2)}else{ring.hidden=true;$('gd-bg').classList.add('dim');$('gd').classList.remove('gd-up')}};
  if(el){const b=el.getBoundingClientRect();if(b.top<80||b.bottom>innerHeight-120){el.scrollIntoView({block:'center'});ring.hidden=true;setTimeout(place,180)}else place()}else place();
  $('gd').onclick=e=>{const t=e.target;if(t.closest('[data-gx]'))closeGuide();else if(t.closest('[data-gp]')){GSTEP--;guideDraw()}else if(t.closest('[data-gn]')){if(last){tourDone(GTID);closeGuide()}else{GSTEP++;guideDraw()}}
    else if(t.closest('[data-ga]')){const f=g.act[1];if(!g.keep)closeGuide();f()}else{const b=t.closest('[data-gr]');if(b){store.set('role',b.dataset.gr);renderTabs();renderBnav();if(TAB==='home')renderHome();GSTEP++;guideDraw()}}};
  const f=$('gd').querySelector('[data-gn]');if(f)f.focus()}
function closeGuide(){try{sessionStorage.removeItem('fand.tour')}catch(e){}store.set('guided',true);['gd','gd-bg','gd-ring'].forEach(id=>{const e=$(id);if(e)e.remove()});GSTEP=-1;if(TAB==='guide')renderGuide()}
const toursDone=()=>store.get('toursDone',[]);
function tourResume(){let t=null;try{t=JSON.parse(sessionStorage.getItem('fand.tour')||'null');sessionStorage.removeItem('fand.tour')}catch(e){}if(!t||GSTEP>=0||!(t.id==='welcome'||TOURS[t.id]))return;setTimeout(()=>{if(GSTEP<0)openTour(t.id,t.k)},400)}
function tourDone(id){const d=toursDone();if(!d.includes(id)){d.push(id);store.set('toursDone',d)}if(TOURS[id])toast('✓ Tutorial finished: '+TOURS[id].t)}
document.addEventListener('keydown',e=>{if(GSTEP<0)return;if(e.key==='Escape'){closeGuide();e.stopPropagation()}else if(e.key==='ArrowRight'&&GSTEP<GT.length-1){GSTEP++;guideDraw()}else if(e.key==='ArrowLeft'&&GSTEP>0){GSTEP--;guideDraw()}},true);
window.addEventListener('resize',()=>{if(GSTEP>=0)guideDraw()});

// ===================== The Artificer's Forge =====================
// The Artificer's Forge (website rule, 2026-11-25): an Artificer works its own magic into gear and builds a construct.
// Infusions: from level 2 it knows a few infusions (4, then 6 at level 6, 8 at 10, 10 at 14, 12 at 18, two more every 20
// levels past 20) and keeps some of them active at once (2, then 3, 4, 5, 6 at levels 6, 10, 14, 18, one more every 20
// levels past 20), each in one item: its own or a party member's. Active infusions change only after a long rest (the
// DM can change them any time): they stay open until the Artificer locks them, and a long rest opens them again. A weapon infusion's +1 (+2 from level 10)
// adds to Accuracy and damage, and past level 10 its damage bonus becomes that many d4 times the level-band multiplier,
// like Rage. Armor and shield infusions add +1 AC (+2 from level 10). Infusions with charges get them back on a long rest.
// The construct: one at a time (an Artillerist keeps two cannons from level 15), built from three materials in the
// Artificer's pack (a frame, a core and an armament), used up. Like a bonded summon it is a share of the typical monster
// of the Artificer's realm band: a Steel Defender (level 3) has 75% of its hit points, its AC + 2 and its hit; an
// Eldritch Cannon (level 3) a quarter of the hit points and twice the hit; a Homunculus (level 2) 15% and half. Each part
// counts by its realm against the Artificer's band (that realm or deeper counts fully), and its grade moves it up to 10%
// either way (grade 5 is even); the construct gets half its share plus half that score. A metal or stone frame adds +1
// AC. Every part and upgrade carries its property and trait, and an armament with a damage type gives it to the hit.
// One upgrade slot every 10 levels: any material, used up, +10% hit points and +5% to the hit. It acts on the
// Artificer's turn, counts in the Party check, joins the combat tracker with its Artificer, and if it falls it is
// rebuilt at the next long rest.
// Subclasses: an Artillerist picks its cannon's mode (Flamethrower, Force Ballista, or Protector, which heals instead
// of hitting); an Armorer turns its armor into Arcane Armor (Guardian: thunder gauntlets; Infiltrator: a lightning
// launcher), whose weapon rolls its die (two from level 11) times the multiplier; an Armorer or a Battle Smith attacks
// twice from level 5; an Alchemist gets free Experimental Elixirs each long rest (1, 2 at 9, 3 at 15, one more every
// 20 levels past 20) and brews more from an organ or an essence in its pack.
const isArti=c=>!!c&&(c.cls==='Artificer'||c.cls2==='Artificer');
const artSub=(c,re)=>isArti(c)&&re.test(c.sub||'');
const INF_DEFS=[
  {n:'Enhanced Weapon',lv:2,fits:'weapon',wpn:1,t:'Accuracy and damage bonus.'},
  {n:'Repeating Shot',lv:2,fits:'ammo',wpn:1,noAmmo:1,t:'Accuracy and damage bonus, and it makes its own ammunition: shooting it spends none.'},
  {n:'Returning Weapon',lv:2,fits:'thrown',wpn:1,t:'Accuracy and damage bonus, and it flies back to the hand after a throw.'},
  {n:'Radiant Weapon',lv:6,fits:'weapon',wpn:1,ch:4,t:'Accuracy and damage bonus; it sheds bright light 30 ft. on command, and when its wielder is hit, a charge and a reaction blind the attacker until the end of its next turn (Constitution save against the Artificer\'s spell save DC).'},
  {n:'Runic Edge',lv:6,fits:'weapon',wpn:1,rune:1,opt:'rune',t:'Its damage bonus is of the chosen rune\'s damage type (no Accuracy bonus). A FAND infusion.'},
  {n:'Enhanced Defense',lv:2,fits:'defense',ac:1,t:'AC bonus.'},
  {n:'Repulsion Shield',lv:6,fits:'shield',ac:1,ch:4,t:'AC bonus; when the wearer is hit in melee, a charge and a reaction push the attacker 15 ft. away.'},
  {n:'Resistant Armor',lv:6,fits:'armor',opt:'type',t:'Resistance to the chosen damage type.'},
  {n:'Runic Ward',lv:6,fits:'armor',opt:'rune',t:'Resistance to the chosen rune\'s damage type, and the wearer can\'t be pushed by it. A FAND infusion.'},
  {n:'Armor of Magical Strength',lv:10,fits:'armor',ch:6,t:'A charge adds the wearer\'s Intelligence modifier to a Strength check or save, or keeps it from being knocked prone.'},
  {n:'Boots of the Winding Path',lv:6,fits:'feet',t:'As a bonus action the wearer teleports up to 15 ft. to a spot it stood in this turn.'},
  {n:'Helm of Awareness',lv:10,fits:'head',t:'Advantage on initiative, and the wearer can\'t be surprised while awake.'},
  {n:'Enhanced Arcane Focus',lv:2,fits:'focus',t:'+1 to spell Accuracy (+2 from level 10), and spells cast through it ignore half cover.'},
  {n:'Mind Sharpener',lv:2,fits:'armor',ch:4,t:'When the wearer fails a Constitution save to keep concentrating, a charge and a reaction make it a success.'},
  {n:'Spell-Refueling Ring',lv:6,fits:'ring',ch:1,t:'Once a day, as an action, the wearer regains one spell slot of 3rd level or lower.'},
  {n:'Replicate Magic Item',lv:2,fits:'any',opt:'text',t:'The item works as a common magic item of the Artificer\'s choice (named below).'}];
const infCap=L=>L<2?0:L<6?2:L<10?3:L<14?4:L<18?5:6+Math.floor(Math.max(0,L-20)/20);
const infKnownCap=L=>L<2?0:L<6?4:L<10?6:L<14?8:L<18?10:12+2*Math.floor(Math.max(0,L-20)/20);
const infBase=L=>L>=10?2:1;
function infDmg(L){const b=infBase(L),m=diceMult(bandOf(L));return m>1?{dice:b*m,d:4,txt:b*m+'d4',avg:b*m*2.5}:{flat:b,txt:'+'+b,avg:b}}
const artSlot=b=>b.cat==='Shield'?'Shield':b.slot||(b.design&&BASES[b.design.base]&&BASES[b.design.base].slot)||armorPiece(b).slot;
function infFits(f,b){if(!b||b.ammo)return false;const k=gearKind(b),base=b.design?b.design.base:genOf(b),foc=!!(base&&BASES[base]&&BASES[base].focus),arm=ARMOR_CATS.includes(b.cat)||k==='armor';
  return f==='any'?true:f==='ring'?k==='worn'&&!foc:f==='weapon'?k==='weapon':f==='ammo'?k==='weapon'&&wpnRanged(b)&&!!ammoKind(b):f==='thrown'?k==='weapon'&&/Thrown/i.test(wpnProps(b)):
    f==='defense'?arm:f==='shield'?b.cat==='Shield':f==='armor'?arm&&artSlot(b)==='Body':f==='feet'?arm&&artSlot(b)==='Feet':f==='head'?arm&&artSlot(b)==='Head':f==='focus'?foc:false}
const infKnown=c=>Array.isArray(c.infKnown)?c.infKnown:[...new Set((c.infuse||[]).map(x=>x.n))];
// whose gear an infusion is in: its Artificer's, or a party member's
const infHolder=(a,x)=>x.on&&x.on!==a.id?PARTY.find(p=>p.id===x.on)||null:a;
// an Artificer's working infusions: known, of its level, in an item its holder still carries, up to its limit
function infOn(a){if(!isArti(a))return [];const L=+a.level||1,K=new Set(infKnown(a)),A=(a.infuse||[]).map(x=>({a,x,d:INF_DEFS.find(d=>d.n===x.n)})).filter(o=>{if(!o.d||!o.x.dm&&(o.d.lv>L||!K.has(o.d.n)))return false;const h=infHolder(a,o.x);return !!h&&(h.gear||[]).some(n=>lc(n)===lc(o.x.item||''))});
  // a DM's gift doesn't count against the Artificer's limit
  return A.filter(o=>!o.x.dm).slice(0,infCap(L)).concat(A.filter(o=>o.x.dm))}
// every working infusion that reaches a character (the party's Artificers', and its own when it is a sample character)
const infAll=c=>PARTY.filter(isArti).concat(isArti(c)&&!PARTY.includes(c)?[c]:[]).flatMap(infOn);
const infFor=(c,b)=>b?infAll(c).find(o=>infHolder(o.a,o.x)===c&&lc(o.x.item)===lc(b.n))||null:null;
const infAcc=(c,b)=>{const o=infFor(c,b);return o&&o.d.wpn&&!o.d.rune?infBase(+o.a.level||1):0};
const infDmgFor=(c,b)=>{const o=infFor(c,b);return o&&o.d.wpn?infDmg(+o.a.level||1):null};
const infNoAmmo=(c,b)=>{const o=infFor(c,b);return !!(o&&o.d.noAmmo)};
function infAC(c,act){const names=new Set((act||[]).map(b=>lc(b.n)));return infAll(c).filter(o=>o.d.ac&&infHolder(o.a,o.x)===c&&names.has(lc(o.x.item))).reduce((s,o)=>s+infBase(+o.a.level||1),0)}
const runeType=r=>RUNE_DMG[r]||'';
function infLine(c,b){const o=infFor(c,b);if(!o)return '';const L=+o.a.level||1,by=o.a===c?'':` (by ${esc(o.a.name||'an Artificer')})`,opt=o.x.opt?` · ${esc(o.d.opt==='rune'?o.x.opt+' ('+runeType(o.x.opt)+')':o.x.opt)}`:'';
  if(!o.d.wpn)return `<br><small style="color:var(--muted)" title="${esc(o.d.t)}">✦ ${esc(o.d.n)}${opt}${by}</small>`;const D=infDmg(L);
  return `<br><small style="color:var(--muted)" title="${esc(o.d.t)}">✦ ${esc(o.d.n)}${by}: ${o.d.rune?'':`+${infBase(L)} Accuracy (included), `}damage ${D.flat!=null?'+'+D.flat:`<button class="sh-roll" type="button" data-roll="${D.txt}" data-what="${esc(o.d.n)}">+${D.txt}</button>`}${o.d.rune&&o.x.opt?' '+esc(runeType(o.x.opt)):''}${o.d.noAmmo?', makes its own ammunition':''}</small>`}
const canInf=c=>dmUnlocked()||!c.infLocked;
// the construct
const ART_KINDS={'Steel Defender':{lv:3,hp:.75,acB:2,hit:1,dt:'force',t:'A loyal construct of plates and gears. As a reaction it gives disadvantage to an attack against a creature within 5 ft. of it.'},
  'Eldritch Cannon':{lv:3,hp:.25,acB:0,hit:2,dt:'fire',t:'A small magical cannon on legs that acts on the Artificer\'s turn.'},
  'Homunculus':{lv:2,hp:.15,acB:0,hit:.5,dt:'piercing',t:'A tiny flying servant. It can deliver the Artificer\'s touch spells from up to 120 ft. away.'}};
const CANNON_MODES={'Flamethrower':{dt:'fire',hit:1,t:'A 15-ft. cone: each creature in it takes the hit as fire damage (Dexterity save for half).'},'Force Ballista':{dt:'force',hit:1,t:'A bolt at one creature within 120 ft.: the hit as force damage, and it is pushed 5 ft. away.'},'Protector':{dt:'',hit:0,t:'No attack: the Artificer and each ally within 10 ft. gain temporary hit points equal to half the hit.'}};
const ART_PARTS=[['frame','Frame',['O','W','B','S'],'Metal, wood, bone or stone: its body'],['core','Core',['G','E','K'],'A gem, an essence or a mechanism: what makes it move'],['arm','Armament',['O','B','G','K'],'Metal, bone, a gem or a mechanism: what it fights with']];
const artUpSlots=L=>Math.min(10,Math.floor((+L||1)/10));
const artTier=m=>(REALM[m.realm]||{tier:1}).tier;
function artScore(P,band){if(!P.length)return {q:0,gb:0,f:.5};const q=P.reduce((a,m)=>a+Math.min(1,artTier(m)/band),0)/ART_PARTS.length,gb=P.reduce((a,m)=>a+((+m.g||5)-5)*.02,0)/P.length;return {q,gb,f:(.5+.5*q)*(1+gb)}}
const matDmgType=m=>{const t=lc([m.pn,m.prop,m.tr&&m.tr.n,m.tr&&m.tr.t].filter(Boolean).join(' '));return DMG_TYPES.filter(x=>x!=='Healing').map(lc).find(x=>t.includes(x))||''};
function artNow(c){const K=c&&c.construct,D=K&&ART_KINDS[K.kind];if(!D)return null;const L=+c.level||1,R=bondRef(L),band=bandOf(L);
  const P=ART_PARTS.map(([k])=>findMat((K.parts||{})[k]||'')).filter(Boolean),U=(K.ups||[]).map(findMat).filter(Boolean).slice(0,K.pct?10:artUpSlots(L)),S=artScore(P,band),frame=findMat((K.parts||{}).frame||'');
  const cannon=K.kind==='Eldritch Cannon',mode=cannon&&artSub(c,/Artillerist/)?(CANNON_MODES[K.mode]?K.mode:'Flamethrower'):'',two=cannon&&artSub(c,/Artillerist/)&&L>=15,M=mode?CANNON_MODES[mode]:null;
  if(+K.pct>0){S.f=+K.pct/100;S.dm=1}const hp=Math.max(1,Math.round(R.hp*D.hp*S.f*(1+.1*U.length))),hit=Math.max(1,Math.round(R.h*D.hit*S.f*(1+.05*U.length)*(two?.6:1)));
  const arm=findMat((K.parts||{}).arm||''),dt=(M&&M.dt)||(arm&&matDmgType(arm))||D.dt,cur=k=>{const v=K[k?'hp2':'hp'];return v==null||v===''?hp:Math.max(0,Math.min(hp,+v||0))};
  return {L,D,kind:K.kind,n:K.n||K.kind,q:S.q,gb:S.gb,f:S.f,dm:!!S.dm,hp,cur:cur(0),cur2:cur(1),ac:Math.max(0,R.ac+D.acB+(frame&&['O','S'].includes(matCode(frame))?1:0)),acc:profBonus(L)+2,dmg:hit,dt,mode,M,heals:!!(M&&!M.hit),count:two?2:1,parts:P,ups:U,dead:!!K.dead,dead2:!!K.dead2}}
// the construct's round against a target's AC (nothing when it heals, or for each cannon that has fallen)
function artRound(c,tAC,tr){const A=artNow(c);if(!A||A.heals)return {v:0,A};const up=(A.dead?0:1)+(A.count>1&&!A.dead2?1:0);return {v:up*acTaken(A.dmg,tAC,tr),A}}
const artParts=(c,codes)=>(c.inv||[]).map(([n,q])=>({m:findMat(n),q:+q||0})).filter(x=>x.m&&x.q>0&&(!codes||codes.includes(matCode(x.m)))).sort((a,b)=>artTier(b.m)-artTier(a.m)||a.m.n.localeCompare(b.m.n));
const artUse=(c,n)=>{const r=(c.inv||[]).find(z=>lc(z[0])===lc(n));if(r){r[1]=(+r[1]||0)-1;if(r[1]<=0)c.inv=c.inv.filter(z=>z!==r)}};
// Arcane Armor (Armorer)
const ARC_MODELS={Guardian:{w:'Thunder Gauntlets',d:8,mel:true,dt:'thunder',t:'A creature hit by a gauntlet has disadvantage on attacks against anyone but the Armorer until its next turn. Defensive Field: a bonus action gives the Armorer temporary hit points equal to its level, proficiency bonus times a long rest.'},
  Infiltrator:{w:'Lightning Launcher',d:6,mel:false,dt:'lightning',once:1,t:'Range 90/300 ft.; once a turn a hit deals the die again. +5 ft. speed and advantage on Stealth checks.'}};
function arcNow(c){const A=c&&c.arcArmor,M=A&&ARC_MODELS[A.model],L=+c.level||1;if(!M||!artSub(c,/Armorer/)||L<3||!(c.gear||[]).some(n=>lc(n)===lc(A.item||'')))return null;const m=diceMult(bandOf(L)),n=(L<11?1:2)*m,INT=Math.floor(((+(c.abil||{}).int||10)-10)/2);
  return {model:A.model,M,item:A.item,dice:n+'d'+M.d,avg:n*(M.d+1)/2,int:INT,once:M.once?{dice:m+'d'+M.d,avg:m*(M.d+1)/2}:null}}
// Experimental Elixirs (Alchemist)
const ELIXIRS=[['Healing','The drinker regains hit points.'],['Swiftness','+10 ft. walking speed for 1 hour.'],['Resilience','+1 AC for 10 minutes.'],['Boldness','For 1 minute, +1d4 to attack rolls and saving throws.'],['Flight','A flying speed of 10 ft. for 10 minutes.'],['Transformation','The drinker\'s body changes as with Alter Self for 10 minutes.']];
const elixFree=L=>L<3?0:L<9?1:L<15?2:3+Math.floor(Math.max(0,L-20)/20);
const elixHeal=c=>{const L=+c.level||1,m=diceMult(bandOf(L)),INT=Math.max(1,Math.floor(((+(c.abil||{}).int||10)-10)/2));return `${2*m}d4 + ${INT}`};
function elixRest(c){if(!artSub(c,/Alchemist/))return;c.elixirs=(c.elixirs||[]).filter(e=>!e.free);for(let i=0;i<elixFree(+c.level||1);i++)c.elixirs.push({t:ELIXIRS[Math.floor(Math.random()*6)][0],free:true})}
// the forge's state
let ARTF=store.get('artForge',{});
const artDM=()=>dmUnlocked()&&!!ARTF.dm;
const artWho=()=>{const A=artDM()?PARTY:PARTY.filter(isArti);return A.find(c=>c.id===ARTF.who)||A[0]||null};
function artSet(k,v){ARTF[k]=v;store.set('artForge',ARTF);artRedraw()}
function artRedraw(){const el=$('art-forge');if(el)el.outerHTML=artiForgeHTML();if(TAB==='sheet')renderSheet()}
function artInfSet(i,k,v){const c=artWho();if(!c)return;if(!canInf(c)){toast('Infusions change after a long rest');return}const I=c.infuse=c.infuse||[];
  if(k==='rm')I.splice(i,1);else if(i>=I.length){if(!v)return;I.push({n:v,item:''})}else if(k==='who'){const [on,item]=String(v).split('\u0001');I[i].on=on||c.id;I[i].item=item||''}else{I[i][k]=v;if(k==='n'){I[i].item='';delete I[i].opt;delete I[i].on}}
  saveParty();artRedraw()}
function artKnow(n,on){const c=artWho();if(!c)return;if(!canInf(c)){toast('Known infusions change after a long rest');return}const K=new Set(infKnown(c));if(on){if(K.size>=infKnownCap(+c.level||1)){toast('It knows as many infusions as its level allows');artRedraw();return}K.add(n)}else K.delete(n);c.infKnown=[...K];saveParty();artRedraw()}
function artLock(open){const c=artWho();if(!c)return;if(open&&!dmUnlocked()){toast('Infusions open after a long rest (or the DM opens them)');return}if(open)delete c.infLocked;else c.infLocked=true;saveParty();artRedraw()}
function artCharge(id,key,max,d){const c=PARTY.find(x=>x.id===id);if(!c)return;c.infCh=c.infCh||{};c.infCh[key]=Math.max(0,Math.min(max,(+c.infCh[key]||0)+d));saveParty();artRedraw()}
const artKind=c=>ART_KINDS[ARTF.kind]&&ARTF.kind||((+c.level||1)<3?'Homunculus':/Battle Smith/i.test(c.sub||'')?'Steel Defender':'Eldritch Cannon');
function artBuild(){const c=artWho();if(!c)return;const kind=artKind(c),D=ART_KINDS[kind],L=+c.level||1;if(!D||L<D.lv){toast('Pick a construct the Artificer can build');return}
  const pick={};for(const [k,lab,codes] of ART_PARTS){const n=ARTF['p_'+k];if(!n||!artParts(c,codes).some(x=>x.m.n===n)){toast('Choose a '+lab.toLowerCase()+' from '+(c.name||'the Artificer')+'’s pack');return}pick[k]=n}
  if(pick.frame===pick.arm&&artParts(c,['O','W','B','S','G','K']).find(x=>x.m.n===pick.frame).q<2){toast('Only one '+pick.frame+' in the pack: it can’t be the frame and the armament');return}
  if(c.construct&&!confirm('Build a new '+kind+'? '+(c.construct.n||c.construct.kind)+' is taken apart and its materials and upgrades are lost.'))return;
  Object.values(pick).forEach(n=>artUse(c,n));c.construct={kind,n:(ARTF.name||'').trim().slice(0,40)||kind,parts:pick,ups:[]};['p_frame','p_core','p_arm','name'].forEach(k=>delete ARTF[k]);store.set('artForge',ARTF);saveParty();
  const N=artNow(c);toast(`${c.name||'The Artificer'} builds ${N.n}: ${fmt(N.hp)} HP, AC ${N.ac}, hit ${fmt(N.dmg)}`);artRedraw()}
function artUp(n){const c=artWho(),K=c&&c.construct;if(!K||!n)return;if((K.ups||[]).length>=artUpSlots(+c.level||1)){toast('No upgrade slot free');return}if(!artParts(c).some(x=>x.m.n===n))return;artUse(c,n);K.ups=(K.ups||[]).concat([n]);saveParty();toast((K.n||K.kind)+' takes the '+n);artRedraw()}
function artUpRm(j){const c=artWho(),K=c&&c.construct;if(!K||!confirm('Remove this upgrade? The material is lost.'))return;K.ups=(K.ups||[]).filter((_,i)=>i!==j);saveParty();artRedraw()}
function artCon(k,v,id){const c=(id&&PARTY.find(x=>x.id===id))||artWho(),K=c&&c.construct;if(!K)return;
  if(k==='dead'||k==='dead2'){const h=k==='dead'?'hp':'hp2';if(v){K[k]=true;K[h]=0}else{delete K[k];delete K[h]}}else if(k==='hp'||k==='hp2')K[k]=Math.max(0,Math.round(+v||0));else if(k==='n')K.n=String(v||'').slice(0,40);else if(k==='mode'&&CANNON_MODES[v])K.mode=v;saveParty();artRedraw()}
function artArc(k,v){const c=artWho();if(!c)return;c.arcArmor=c.arcArmor||{model:'Guardian',item:''};c.arcArmor[k]=v;saveParty();artRedraw()}
function artElix(act,v,id){const c=(id&&PARTY.find(x=>x.id===id))||artWho();if(!c)return;c.elixirs=c.elixirs||[];
  if(act==='brew'){const n=ARTF.elixMat,t=ARTF.elixT||'Healing';if(!n||!artParts(c,['L','E']).some(x=>x.m.n===n)){toast('Choose an organ or an essence from the pack');return}artUse(c,n);c.elixirs.push({t});toast(`${c.name||'The Alchemist'} brews an elixir of ${t} from the ${n}`)}
  else if(act==='drink'){const e=c.elixirs[v];if(!e)return;c.elixirs.splice(v,1);if(e.t==='Healing')rollShow(elixHeal(c),'Elixir of Healing');else toast('Elixir of '+e.t+': '+(ELIXIRS.find(x=>x[0]===e.t)||[])[1])}
  saveParty();artRedraw()}
function artPartLines(list){const cnt={};list.forEach(m=>cnt[m.n]=(cnt[m.n]||0)+1);return [...new Map(list.map(m=>[m.n,m])).values()].map(m=>{const p=m.pn?propAt(m.pn,m.pot)||m.prop||'':m.prop||'';return p||(m.tr&&m.tr.n)?`<div class="note" style="margin:2px 0 0"><b>${esc(m.n)}</b>${cnt[m.n]>1?' ×'+cnt[m.n]:''} <small>(${esc(m.realm)}, grade ${+m.g||'?'})</small>${p?': '+esc(p):''}${m.tr&&m.tr.n?` <i>${esc(m.tr.n)}:</i> ${esc(m.tr.t||'')}`:''}</div>`:''}).join('')}
function artStatsHTML(N){return `<b>${esc(N.n)}</b>${N.n!==N.kind?` <small style="color:var(--muted)">${esc(N.kind)}</small>`:''}${N.count>1?' <small>×2 (Fortified Position)</small>':''}${N.dead&&(N.count<2||N.dead2)?' <span class="b red">fallen until a long rest</span>':''}
  <div class="bond-stats">Level ${N.L} · HP ${fmt(N.cur)}${N.count>1?' and '+fmt(N.cur2):''} / ${fmt(N.hp)} · AC ${N.ac} · Accuracy +${N.acc} · ${N.heals?`Protector: ${fmt(Math.round(N.dmg/2))} temporary HP to each ally within 10 ft.`:`Hit: ${fmt(N.dmg)} ${esc(N.dt)} damage`} · ${N.dm?`${Math.round(N.f*100)}% strength (set by the DM)`:`materials ${Math.round(N.q*100)}%${N.gb?`, grades ${N.gb>0?'+':''}${Math.round(N.gb*100)}%`:''} (${Math.round(N.f*100)}% strength)`}${N.ups.length?` · ${N.ups.length} upgrade${N.ups.length>1?'s':''}`:''}</div>
  <div class="note" style="margin:2px 0 0">${esc(N.D.t)}${N.M?' '+esc(N.mode)+': '+esc(N.M.t):''}</div>${artPartLines(N.parts.concat(N.ups))}`}
const artLab=(t,h)=>`<label class="note" style="margin:0;display:flex;flex-direction:column;gap:3px">${t}${h}</label>`;
function artiForgeHTML(){const DM=artDM(),A=DM?PARTY.slice():PARTY.filter(isArti);
  const head=`<div class="sec-h"><h3>🔧 The Artificer's Forge</h3><p>Infusions an Artificer works into the party's gear, the construct it builds from the materials in its pack, and its subclass's own work.</p></div>`;
  const dmBar=dmUnlocked()?`<div class="callout" style="margin:0 0 10px;border-color:var(--acc);display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="note" style="margin:0;display:flex;gap:6px;align-items:center"><input type="checkbox"${DM?' checked':''} onchange="artSet('dm',this.checked)"> <b>🎲 DM mode</b></label><small class="note" style="margin:0">Any character, any material from the vault, nothing used up, no limits; enemy constructs for the combat tracker.</small></div>`:'';
  if(!A.length)return `<section class="sec" id="art-forge">${head}${dmBar}${DM?artDmEnemyHTML():''}<div class="note">No Artificer in the party yet. Make one on the Party page or with the character builder, and its forge opens here.</div></section>`;
  const c=artWho(),L=+c.level||1,cap=infCap(L),kcap=infKnownCap(L),I=c.infuse||[],on=infOn(c),D=infDmg(L),open=canInf(c),known=new Set(infKnown(c));
  const who=A.length>1?`<label class="note" style="margin:0">${DM?'Character':'Artificer'} <select class="sel" onchange="artSet('who',this.value)">${A.map(x=>`<option value="${esc(x.id)}"${x===c?' selected':''}>${esc(x.name||'Unnamed')} (level ${+x.level||1} ${esc(x.cls||'')})</option>`).join('')}</select></label>`:`<div class="note" style="margin:0"><b>${esc(c.name||'Unnamed')}</b>, level ${L} Artificer${c.sub?' ('+esc(c.sub)+')':''}</div>`;
  const avail=INF_DEFS.filter(d=>d.lv<=L),used=new Set(I.map(x=>(x.on||c.id)+'|'+lc(x.item||''))),dis=open?'':' disabled';
  const knowHTML=`<div class="note" style="margin:0 0 4px">Known infusions: ${known.size} of ${kcap}.</div><div style="display:flex;gap:6px 14px;flex-wrap:wrap">${avail.map(d=>`<label class="note" style="margin:0;display:inline-flex;gap:4px;align-items:center" title="${esc(d.t)}"><input type="checkbox"${known.has(d.n)?' checked':''}${dis} onchange="artKnow(${esc(JSON.stringify(d.n))},this.checked)">${esc(d.n)}</label>`).join('')}</div>`;
  const row=(x,i)=>{const d=INF_DEFS.find(y=>y.n===x.n),opts=[];PARTY.forEach(h=>(h.gear||[]).map(findBP).filter(Boolean).forEach(b=>{const key=h.id+'|'+lc(b.n),mine=(x.on||c.id)===h.id&&lc(b.n)===lc(x.item||'');if(d&&infFits(d.fits,b)&&(mine||!used.has(key)))opts.push({h,b,mine})}));
    const live=on.some(o=>o.x===x),optSel=!d||!d.opt?'':d.opt==='text'?`<input class="sel" aria-label="Which common magic item" placeholder="Common magic item" value="${esc(x.opt||'')}" maxlength="60"${dis} onchange="artInfSet(${i},'opt',this.value)">`:`<select class="sel" aria-label="${d.opt==='rune'?'Rune':'Damage type'}"${dis} onchange="artInfSet(${i},'opt',this.value)"><option value="">${d.opt==='rune'?'Choose a rune…':'Choose a damage type…'}</option>${(d.opt==='rune'?Object.keys(RUNE_DMG).map(r=>[r,r+' ('+RUNE_DMG[r]+')']):DMG_TYPES.filter(t=>t!=='Healing').map(t=>[t,t])).map(([v,l])=>`<option value="${esc(v)}"${v===x.opt?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
    const note=d?d.wpn?`${d.rune?'':`+${infBase(L)} Accuracy, `}damage ${D.txt}${d.rune&&x.opt?' '+runeType(x.opt):''}. `+d.t.replace(/^Accuracy and damage bonus[.,;]?\s*(and )?/,'').replace(/^Its damage bonus is of the chosen rune's damage type \(no Accuracy bonus\)\.\s*/,''):d.ac?`+${infBase(L)} AC. `+d.t.replace(/^AC bonus[.;]?\s*/,''):d.t:'';
    return `<div class="sh-feat" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select class="sel" aria-label="Infusion"${dis} onchange="artInfSet(${i},'n',this.value)">${avail.filter(y=>known.has(y.n)||y.n===x.n).map(y=>`<option${y.n===x.n?' selected':''}>${esc(y.n)}</option>`).join('')}</select>
      <select class="sel" aria-label="Item to infuse"${dis} onchange="artInfSet(${i},'who',this.value)"><option value="">${opts.length?'Choose an item…':'No item it fits in the party’s gear'}</option>${opts.map(o=>`<option value="${esc(o.h.id+'\u0001'+o.b.n)}"${o.mine?' selected':''}>${esc(o.b.n)}${o.h!==c?' · '+esc(o.h.name||'?'):''}</option>`).join('')}</select>${optSel}
      ${live?'<span class="b green">active</span>':`<span class="b ghost" title="${!known.has(x.n)?'Not a known infusion':!x.item?'No item chosen':'Not in effect'}">not active</span>`}${open?`<button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artInfSet(${i},'rm')" title="End this infusion">✕</button>`:''}
      <div class="note" style="margin:0;flex-basis:100%">${esc(note)}</div></div>`};
  const inf=L<2?`<div class="note">Infusions open at level 2.</div>`:`<div class="note" style="margin:0 0 6px">${on.length} of ${cap} infusions active at level ${L}, each in one item of the party's gear (an item that leaves its holder's gear loses it). Weapon infusions add +${infBase(L)} to Accuracy and ${D.flat!=null?'+'+D.flat:D.txt} to damage${D.flat!=null?'':` (+${infBase(L)} becomes ${infBase(L)}d4 × ${diceMult(bandOf(L))} past level 10, like Rage)`}; armor and shield infusions +${infBase(L)} AC.</div>
    ${knowHTML}<div style="margin-top:8px">${I.map(row).join('')}</div>${open&&I.length<cap?`<select class="sel" aria-label="Add an infusion" onchange="artInfSet(${I.length},'n',this.value)"><option value="">＋ Add an infusion (${I.length}/${cap})…</option>${avail.filter(y=>known.has(y.n)).map(y=>`<option>${esc(y.n)}</option>`).join('')}</select>`:''}
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px">${open?`<span class="b green">open</span> <button class="btn" type="button" onclick="artLock(false)">🔒 Done: lock the infusions</button><small class="note" style="margin:0">They open again after a long rest.</small>`:`<span class="b ghost">locked</span> <small class="note" style="margin:0">Infusions change after a long rest${dmUnlocked()?'':' (or when the DM opens them)'}.</small>${dmUnlocked()?`<button class="btn" type="button" onclick="artLock(true)">Open them (DM)</button>`:''}`}</div>`;
  const N=artNow(c),kinds=Object.entries(ART_KINDS),kind=artKind(c),K=ART_KINDS[kind],R=bondRef(L),band=bandOf(L),bandRealm=(REALMS.find(r=>r.tier===band)||{}).n||'',slots=artUpSlots(L);
  const parts=ART_PARTS.map(([k,lab,codes,why])=>{const P=artParts(c,codes),cur=ARTF['p_'+k];return artLab(`${lab} <small>${esc(why)}</small>`,`<select class="sel" aria-label="${lab}" onchange="ARTF['p_${k}']=this.value;store.set('artForge',ARTF);artRedraw()"><option value="">${P.length?'Choose…':'Nothing in the pack'}</option>${P.map(x=>`<option value="${esc(x.m.n)}"${x.m.n===cur?' selected':''}>${esc(x.m.n)} · ${esc(x.m.realm)} · G${+x.m.g||'?'}${x.q>1?' ×'+x.q:''}</option>`).join('')}</select>`)}).join('');
  const pv=(()=>{const S=artScore(ART_PARTS.map(([k])=>findMat(ARTF['p_'+k]||'')).filter(Boolean),band);return `HP ${fmt(Math.round(R.hp*K.hp*S.f))} · hit ${fmt(Math.round(R.h*K.hit*S.f))} (${Math.round(S.f*100)}% strength)`})();
  const upHTML=N?`<div style="margin-top:6px"><div class="note" style="margin:0 0 4px">Upgrades: ${N.ups.length} of ${slots} (one slot every 10 levels). Any material from the pack: +10% hit points and +5% to the hit, and its property and trait.</div>${(c.construct.ups||[]).map((n,j)=>`<span class="chip" style="cursor:default">${esc(n)} <span style="cursor:pointer;color:var(--muted)" onclick="artUpRm(${j})" title="Remove (the material is lost)">✕</span></span>`).join(' ')}${N.ups.length<slots?(()=>{const P=artParts(c);return P.length?`<select class="sel" aria-label="Add an upgrade" onchange="artUp(this.value)"><option value="">＋ Add an upgrade…</option>${P.map(x=>`<option value="${esc(x.m.n)}">${esc(x.m.n)} · ${esc(x.m.realm)} · G${+x.m.g||'?'}${x.q>1?' ×'+x.q:''}</option>`).join('')}</select>`:'<small class="note">No materials in the pack.</small>'})():''}</div>`:'';
  const modeHTML=N&&N.mode?artLab('Cannon mode',`<select class="sel" aria-label="Cannon mode" onchange="artCon('mode',this.value)">${Object.keys(CANNON_MODES).map(k=>`<option${k===N.mode?' selected':''}>${esc(k)}</option>`).join('')}</select>`):'';
  const build=L<2?`<div class="note">Constructs open at level 2 (a Homunculus) and 3 (a Steel Defender or an Eldritch Cannon).</div>`:`${N?`<div class="sh-feat bond"${N.dead?' style="opacity:.6"':''}>${artStatsHTML(N)}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;align-items:end">${modeHTML}<button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artCon('dead',${N.dead?'false':'true'})">${N.dead?'Back now':'Mark fallen'}</button>${N.count>1?`<button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artCon('dead2',${N.dead2?'false':'true'})">${N.dead2?'Second cannon back':'Second cannon fallen'}</button>`:''}</div>${upHTML}</div>`:''}
    <div class="panel" style="margin-top:8px;display:grid;gap:8px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab(N?'Build a new one':'Build',`<select class="sel" aria-label="Construct" onchange="artSet('kind',this.value)">${kinds.map(([k,d])=>`<option${k===kind?' selected':''}${L<d.lv?' disabled':''}>${esc(k)}${L<d.lv?' (level '+d.lv+')':''}</option>`).join('')}</select>`)}${artLab('Name',`<input class="sel" maxlength="40" placeholder="${esc(kind)}" value="${esc(ARTF.name||'')}" onchange="ARTF.name=this.value;store.set('artForge',ARTF)">`)}</div>
      <div class="note" style="margin:0">${esc(K.t)} Parts from the ${esc(bandRealm)} Realm or deeper count fully at level ${L}; shallower ones count by their realm (half strength at worst), and each part's grade moves it up to 10% either way. A metal or stone frame adds +1 AC; an armament with a damage type gives it to the hit. The three materials are used up.</div>
      <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${parts}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn primary" type="button" onclick="artBuild()"${L<K.lv?' disabled':''}>🔧 Build the ${esc(kind)}</button><small class="note" style="margin:0">With these parts: ${pv}</small></div></div>`;
  // subclass work
  let sub='';
  if(artSub(c,/Armorer/)){const AR=c.arcArmor||{},X=arcNow(c),body=(c.gear||[]).map(findBP).filter(b=>b&&infFits('armor',b));
    sub+=`<div><h4 style="margin:0 0 6px">Arcane Armor <small style="color:var(--muted)">Armorer</small></h4>${L<3?'<div class="note">From level 3.</div>':`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab('Armor',`<select class="sel" aria-label="Arcane armor" onchange="artArc('item',this.value)"><option value="">${body.length?'Choose the armor…':'No body armor in the gear'}</option>${body.map(b=>`<option${lc(b.n)===lc(AR.item||'')?' selected':''}>${esc(b.n)}</option>`).join('')}</select>`)}${artLab('Model',`<select class="sel" aria-label="Armor model" onchange="artArc('model',this.value)">${Object.keys(ARC_MODELS).map(k=>`<option${k===(AR.model||'Guardian')?' selected':''}>${esc(k)}</option>`).join('')}</select>`)}</div>
      ${X?`<div class="note" style="margin:6px 0 0"><b>${esc(X.M.w)}</b>: ${X.dice} + ${X.int} ${esc(X.M.dt)} damage${X.once?`, and once a turn +${X.once.dice}`:''} (its die${L>=11?', two from level 11,':''} × ${diceMult(bandOf(L))}). ${esc(X.M.t)} It attacks twice from level 5.</div>`:'<div class="note" style="margin:6px 0 0">Choose the armor it wears to make it Arcane Armor.</div>'}`}</div>`}
  if(artSub(c,/Alchemist/)){const E=c.elixirs||[],P=artParts(c,['L','E']);
    sub+=`<div><h4 style="margin:0 0 6px">Experimental Elixirs <small style="color:var(--muted)">Alchemist</small></h4>${L<3?'<div class="note">From level 3.</div>':`<div class="note" style="margin:0 0 4px">${elixFree(L)} free each long rest (a random kind; unused ones spoil at the next long rest), and more brewed from an organ or an essence. Healing: ${elixHeal(c)}.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${E.map((e,j)=>`<button class="chip" type="button" onclick="artElix('drink',${j})" title="Drink it: ${esc((ELIXIRS.find(x=>x[0]===e.t)||[])[1]||'')}">🧪 ${esc(e.t)}${e.free?' <small>(free)</small>':''}</button>`).join('')||'<small class="note">No elixirs yet.</small>'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:6px">${artLab('Brew',`<select class="sel" aria-label="Elixir" onchange="ARTF.elixT=this.value;store.set('artForge',ARTF)">${ELIXIRS.map(([k])=>`<option${k===(ARTF.elixT||'Healing')?' selected':''}>${esc(k)}</option>`).join('')}</select>`)}${artLab('From',`<select class="sel" aria-label="Organ or essence" onchange="ARTF.elixMat=this.value;store.set('artForge',ARTF)"><option value="">${P.length?'Choose…':'No organ or essence in the pack'}</option>${P.map(x=>`<option value="${esc(x.m.n)}"${x.m.n===ARTF.elixMat?' selected':''}>${esc(x.m.n)}${x.q>1?' ×'+x.q:''}</option>`).join('')}</select>`)}<button class="btn" type="button" onclick="artElix('brew')">🧪 Brew</button></div>`}</div>`}
  if(DM)return `<section class="sec" id="art-forge">${head}${dmBar}<div class="panel" style="display:grid;gap:14px">${who}${artDmOverviewHTML()}${isArti(c)?`<div><h4 style="margin:0 0 6px">Infusions</h4>${inf}</div>`:''}${artDmHTML(c)}${sub}</div>${artDmEnemyHTML()}</section>`;
  return `<section class="sec" id="art-forge">${head}${dmBar}<div class="panel" style="display:grid;gap:14px">${who}<div><h4 style="margin:0 0 6px">Infusions</h4>${inf}</div><div><h4 style="margin:0 0 6px">Construct</h4>${build}</div>${sub}</div></section>`}
// on a sheet: an Artificer's infusions (with charges), its construct, its Arcane Armor and elixirs; infusions others put
// in this character's gear show on its attack rows and AC
function artiSheetHTML(c){const L=+c.level||1,on=infOn(c),N=artNow(c),X=arcNow(c),id=esc(c.id),cid=`'${id}'`;
  const ch=on.filter(o=>o.d.ch).map(o=>{const key=o.d.n+'|'+o.x.item,used=+((c.infCh||{})[key])||0,left=o.d.ch-used;return `<div class="note" style="margin:2px 0 0;display:flex;gap:6px;align-items:center;flex-wrap:wrap"><b>${esc(o.d.n)}</b> charges: ${'●'.repeat(left)}${'○'.repeat(used)} <button class="btn" type="button" style="padding:0 6px;font-size:.75rem"${left?'':' disabled'} onclick="artCharge(${cid},${esc(JSON.stringify(key))},${o.d.ch},1)">Use one</button></div>`}).join('');
  const holder=o=>{const h=infHolder(o.a,o.x);return h&&h!==c?' ('+esc(h.name||'?')+')':''};
  return `${on.length?`<div class="note" style="margin:0 0 4px">Infused (${on.length}/${infCap(L)}${canInf(c)?', open':', locked'}): ${on.map(o=>`<b>${esc(o.d.n)}</b> in ${esc(o.x.item)}${holder(o)}${o.x.opt?' · '+esc(o.x.opt):''}`).join(', ')}.</div>${ch}`:`<div class="note" style="margin:0 0 4px">${L<2?'Infusions open at level 2.':'No infusions yet.'}</div>`}
    ${N?`<div class="sh-feat bond"${N.dead?' style="opacity:.6"':''}>${artStatsHTML(N)}<div class="sh-noprint" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;align-items:center">HP <input type="number" aria-label="Construct's current HP" min="0" max="${N.hp}" value="${N.cur}" style="width:80px" onchange="artCon('hp',this.value,${cid})"><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artCon('dead',${N.dead?'false':'true'},${cid})">${N.dead?'Back now':'Mark fallen'}</button>${N.heals?'':`<button class="sh-roll" type="button" data-roll="${d20x(N.acc)}" data-what="${esc(N.n)} attack">${sgn(N.acc)}</button>`}</div></div>`:''}
    ${X?`<div class="note" style="margin:6px 0 0"><b>Arcane Armor (${esc(X.model)})</b> in ${esc(X.item)}: ${esc(X.M.w)} <button class="sh-roll" type="button" data-roll="${X.dice} + ${X.int}" data-what="${esc(X.M.w)}">${X.dice} + ${X.int}</button>${X.once?` once a turn <button class="sh-roll" type="button" data-roll="${X.once.dice}" data-what="${esc(X.M.w)}">+${X.once.dice}</button>`:''} ${esc(X.M.dt)}</div>`:''}
    ${artSub(c,/Alchemist/)&&(c.elixirs||[]).length?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${c.elixirs.map((e,j)=>`<button class="chip" type="button" onclick="artElix('drink',${j},${cid})">🧪 ${esc(e.t)}</button>`).join('')}</div>`:''}
    <button class="btn sh-noprint" type="button" style="margin-top:6px" onclick="ARTF.who=${cid};store.set('artForge',ARTF);go('forge');setTimeout(()=>{const e=$('art-forge');if(e)e.scrollIntoView({block:'start'})},60)">🔧 Open the Artificer's Forge</button>`}
// a long rest: charges back, a fallen construct rebuilt, infusions open to change, an Alchemist's free elixirs
function artRest(c){if(c.construct)['hp','dead','hp2','dead2'].forEach(k=>delete c.construct[k]);if(!isArti(c))return;delete c.infCh;delete c.infLocked;elixRest(c)}
// the character builder's Artificer comes with known and active infusions, a construct built from its realm band's
// materials, its Arcane Armor (an Armorer) and its free elixirs (an Alchemist)
function artGen(c){if(!isArti(c))return;const L=+c.level||1,band=bandOf(L),rn=(REALMS.find(r=>r.tier===band)||REALMS[0]).n,gear=(c.gear||[]).map(findBP).filter(Boolean),I=[],used=new Set();
  const order=['Enhanced Weapon','Enhanced Defense','Repeating Shot','Enhanced Arcane Focus','Radiant Weapon','Repulsion Shield','Helm of Awareness','Boots of the Winding Path','Returning Weapon','Mind Sharpener','Resistant Armor','Armor of Magical Strength'];
  order.forEach(n=>{const d=INF_DEFS.find(x=>x.n===n);if(I.length>=infCap(L)||!d||d.lv>L)return;const b=gear.find(b=>infFits(d.fits,b)&&!used.has(lc(b.n)));if(b){I.push({n,item:b.n});used.add(lc(b.n))}});
  c.infuse=I;c.infKnown=[...new Set(I.map(x=>x.n).concat(order.filter(n=>(INF_DEFS.find(d=>d.n===n)||{}).lv<=L)))].slice(0,Math.max(I.length,infKnownCap(L)));
  if(artSub(c,/Armorer/)&&L>=3){const b=gear.find(b=>infFits('armor',b));if(b)c.arcArmor={item:b.n,model:Math.random()<.5?'Guardian':'Infiltrator'}}
  elixRest(c);const kind=L>=3?(/Battle Smith/i.test(c.sub||'')?'Steel Defender':'Eldritch Cannon'):L>=2?'Homunculus':'';if(!kind)return;
  const pick={};ART_PARTS.forEach(([k,,codes])=>{const m=MATS.find(x=>x.realm===rn&&!x.gen&&codes.includes(matCode(x)));if(m)pick[k]=m.n});c.construct={kind,n:kind,parts:pick,ups:[]}}
// an enemy Artificer's construct: a cannon of a quarter of its hit points that hits for six tenths of its best attack
function artEnemyFeat(sb,L){if(L<3)return null;const h=Math.max(1,Math.round((monHits(sb).h||4)*.6)),hp=Math.max(1,Math.round((+sb.hp||10)/4));
  return ['Eldritch Cannon','It has built a cannon on legs (HP '+hp+', AC '+(+sb.ac||0)+') that acts on its turn: a 15-ft. cone of fire (Dexterity save for half) or a force bolt at one creature within 120 ft. Hit: '+h+' damage, or it gives each ally within 10 ft. '+Math.round(h/2)+' temporary hit points. It is destroyed at 0 hit points.']}

// ---- The DM's Artificer's Forge (website addition): with DM mode on, the DM works on any character in the party: grants
// infusions that skip the known list, the level and the limit; builds or rebuilds a construct of any kind from any
// vault materials (nothing used up), at the strength the materials give or at a strength the DM sets; adds upgrades and
// elixirs; restores every Artificer as a long rest would; and makes enemy constructs (a Steel Defender, an Eldritch
// Cannon or a Homunculus of any realm and level) to drop into the combat tracker.
const artDmIn=(id,ph,v)=>`<input class="sel" id="${id}" list="dl-mat" placeholder="${esc(ph)}" value="${esc(v||'')}" style="min-width:12em">`;
function artDmOverviewHTML(){const A=PARTY.filter(isArti);if(!A.length)return '';
  return `<div><h4 style="margin:0 0 6px">The party's Artificers</h4><div class="tablewrap"><table class="t"><thead><tr><th>Artificer</th><th>Infusions</th><th>Construct</th><th></th></tr></thead><tbody>${A.map(a=>{const on=infOn(a),N=artNow(a);
    return `<tr><td><b>${esc(a.name||'Unnamed')}</b><br><small>level ${+a.level||1}${a.sub?' · '+esc(a.sub):''}</small></td><td>${on.length}/${infCap(+a.level||1)}${a.infLocked?' <small>locked</small>':' <small>open</small>'}<br><small>${on.map(o=>esc(o.d.n)+(o.x.dm?' (DM)':'')).join(', ')||'none'}</small></td><td>${N?`${esc(N.n)}: ${fmt(N.cur)}/${fmt(N.hp)} HP, hit ${fmt(N.dmg)}${N.dead?' <span class="b red">fallen</span>':''}`:'<small>none</small>'}</td><td><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artSet('who','${esc(a.id)}')">Open</button></td></tr>`}).join('')}</tbody></table></div>
    <button class="btn" type="button" onclick="artDmRestAll()" title="Charges back, constructs rebuilt, infusions open, free elixirs">↻ Restore every Artificer (as a long rest)</button></div>`}
function artDmHTML(c){const N=artNow(c),K=c.construct||{},kinds=Object.keys(ART_KINDS),f=N?Math.round(N.f*100):100;
  const infGive=`<div><h4 style="margin:0 0 6px">Give an infusion (DM)</h4>${isArti(c)?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab('Infusion',`<select class="sel" id="adm-inf">${INF_DEFS.map(d=>`<option>${esc(d.n)}</option>`).join('')}</select>`)}${artLab('Item',`<select class="sel" id="adm-item">${PARTY.flatMap(h=>(h.gear||[]).map(n=>`<option value="${esc(h.id+'\u0001'+n)}">${esc(n)}${h!==c?' · '+esc(h.name||'?'):''}</option>`)).join('')}</select>`)}${artLab('Choice',`<input class="sel" id="adm-opt" placeholder="Rune, damage type or item" style="width:12em">`)}<button class="btn" type="button" onclick="artDmInf()">✦ Infuse</button></div><div class="note" style="margin:4px 0 0">It skips the known list, the level and the limit, and doesn't count against them.</div>`:'<div class="note">Only Artificers infuse items. This character can still be given a construct below.</div>'}</div>`;
  const build=`<div><h4 style="margin:0 0 6px">Construct (DM)</h4>${N?`<div class="sh-feat bond">${artStatsHTML(N)}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;align-items:center"><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artCon('dead',${N.dead?'false':'true'})">${N.dead?'Back now':'Mark fallen'}</button><button class="btn" type="button" style="padding:1px 8px;font-size:.78rem" onclick="artDmRemove()">Take it apart</button>${N.mode?artLab('Mode',`<select class="sel" onchange="artCon('mode',this.value)">${Object.keys(CANNON_MODES).map(k=>`<option${k===N.mode?' selected':''}>${esc(k)}</option>`).join('')}</select>`):''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:6px">${artLab('Add an upgrade',artDmIn('adm-up','Any material'))}<button class="btn" type="button" onclick="artDmUp()">＋ Upgrade</button>${(K.ups||[]).map((n,j)=>`<span class="chip" style="cursor:default">${esc(n)} <span style="cursor:pointer;color:var(--muted)" onclick="artUpRm(${j})">✕</span></span>`).join(' ')}</div></div>`:''}
    <div class="panel" style="margin-top:8px;display:grid;gap:8px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab(N?'Rebuild as':'Build',`<select class="sel" id="adm-kind">${kinds.map(k=>`<option${k===(K.kind||artKind(c))?' selected':''}>${esc(k)}</option>`).join('')}</select>`)}${artLab('Name',`<input class="sel" id="adm-name" maxlength="40" value="${esc(K.n||'')}" placeholder="Name">`)}${artLab('Strength',`<span style="display:flex;gap:4px;align-items:center"><input class="sel" id="adm-pct" type="number" min="10" max="300" step="5" value="${K.pct||''}" placeholder="${f}" style="width:6em">%</span>`)}</div>
      <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${ART_PARTS.map(([k,lab])=>artLab(lab,artDmIn('adm-'+k,'Any material',(K.parts||{})[k]))).join('')}</div>
      <div class="note" style="margin:0">Any vault material, nothing used up, any level. Leave Strength empty to let the materials decide (by realm and grade, as for players); set it to fix the construct's share of a typical monster of its level.</div>
      <div><button class="btn primary" type="button" onclick="artDmBuild()">🔧 ${N?'Rebuild':'Build'} (DM)</button></div></div></div>`;
  const elix=artSub(c,/Alchemist/)?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab('Give an elixir (DM)',`<select class="sel" id="adm-elix">${ELIXIRS.map(([k])=>`<option>${esc(k)}</option>`).join('')}</select>`)}<button class="btn" type="button" onclick="artDmElix()">🧪 Give</button></div>`:'';
  return infGive+build+elix}
function artDmEnemyHTML(){const E=ARTF.en||{};return `<div class="panel" style="margin-top:12px;display:grid;gap:8px"><h4 style="margin:0">Enemy construct (DM)</h4><div class="note" style="margin:0">A construct for a foe: a share of a typical monster of that level, like the characters' own. It joins the combat tracker on the monsters' side.</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${artLab('Kind',`<select class="sel" id="aen-kind">${Object.keys(ART_KINDS).map(k=>`<option${k===E.kind?' selected':''}>${esc(k)}</option>`).join('')}</select>`)}${artLab('Level',`<input class="sel" id="aen-lv" type="number" min="1" max="${MAX_LEVEL}" value="${+E.lv||10}" style="width:6em">`)}${artLab('Strength',`<span style="display:flex;gap:4px;align-items:center"><input class="sel" id="aen-pct" type="number" min="10" max="300" step="5" value="${+E.pct||100}" style="width:6em">%</span>`)}${artLab('How many',`<input class="sel" id="aen-n" type="number" min="1" max="10" value="${+E.n||1}" style="width:5em">`)}${artLab('Name',`<input class="sel" id="aen-name" maxlength="40" placeholder="${esc(E.kind||'Steel Defender')}" value="${esc(E.name||'')}">`)}<button class="btn" type="button" onclick="artDmEnemy()">⚔ Add to the combat tracker</button></div></div>`}
const admV=id=>(($(id)||{}).value||'').trim();
function artDmInf(){const c=artWho();if(!c||!artDM()||!isArti(c))return;const n=admV('adm-inf'),[on,item]=admV('adm-item').split('\u0001');if(!n||!item){toast('Choose an infusion and an item');return}
  c.infuse=(c.infuse||[]).filter(x=>!((x.on||c.id)===(on||c.id)&&lc(x.item||'')===lc(item)));c.infuse.push({n,item,on:on||c.id,dm:true,opt:admV('adm-opt')||undefined});saveParty();toast(`${n} in the ${item} (DM)`);artRedraw()}
function artDmBuild(){const c=artWho();if(!c||!artDM())return;const kind=admV('adm-kind'),parts={};for(const [k,lab] of ART_PARTS){const v=admV('adm-'+k);if(v){const m=findMat(v);if(!m){toast('No material called “'+v+'” ('+lab.toLowerCase()+')');return}parts[k]=m.n}}
  const pct=Math.max(0,Math.min(300,Math.round(+admV('adm-pct')||0)));if(!pct&&Object.keys(parts).length<3){toast('Choose all three parts, or set a strength');return}
  const old=c.construct||{};c.construct={kind,n:admV('adm-name')||kind,parts,ups:old.kind===kind?old.ups||[]:[],mode:old.mode};if(pct)c.construct.pct=pct;saveParty();const N=artNow(c);toast(`${N.n}: ${fmt(N.hp)} HP, AC ${N.ac}, hit ${fmt(N.dmg)} (DM)`);artRedraw()}
function artDmUp(){const c=artWho(),K=c&&c.construct;if(!K||!artDM())return;const m=findMat(admV('adm-up'));if(!m){toast('Choose a material from the vault');return}if((K.ups||[]).length>=10){toast('Ten upgrades at most');return}K.ups=(K.ups||[]).concat([m.n]);saveParty();artRedraw()}
function artDmRemove(){const c=artWho();if(!c||!c.construct||!confirm('Take '+(c.construct.n||c.construct.kind)+' apart?'))return;delete c.construct;saveParty();artRedraw()}
function artDmElix(){const c=artWho();if(!c||!artDM())return;c.elixirs=(c.elixirs||[]).concat([{t:admV('adm-elix')||'Healing'}]);saveParty();artRedraw()}
function artDmRestAll(){if(!artDM())return;PARTY.filter(isArti).forEach(artRest);saveParty();toast('Every Artificer restored: charges, constructs, infusions open, free elixirs');artRedraw()}
// an enemy construct's stat line (the same shares as the characters' constructs)
function artEnemy(kind,L,pct){const D=ART_KINDS[kind]||ART_KINDS['Steel Defender'],R=bondRef(L),f=(pct||100)/100;return {hp:Math.max(1,Math.round(R.hp*D.hp*f)),ac:R.ac+D.acB,hit:Math.max(1,Math.round(R.h*D.hit*f)),acc:profBonus(L)+2,dt:D.dt,D}}
function artDmEnemy(){if(!artDM())return;const kind=admV('aen-kind'),L=Math.max(1,Math.min(MAX_LEVEL,Math.round(+admV('aen-lv')||1))),pct=Math.max(10,Math.min(300,+admV('aen-pct')||100)),n=Math.max(1,Math.min(10,Math.round(+admV('aen-n')||1))),name=admV('aen-name')||kind;
  ARTF.en={kind,lv:L,pct,n,name:admV('aen-name')};store.set('artForge',ARTF);const E=artEnemy(kind,L,pct),cb=store.get('combat',{round:1,turn:0,list:[]});
  for(let i=0;i<n;i++)cb.list.push({id:uid(),name:name+(n>1?' '+(i+1):''),init:0,dex:0,hp:E.hp,max:E.hp,ac:E.ac,dodge:profBonus(L),cond:[],atk:`Accuracy +${E.acc}, hit ${E.hit} ${E.dt}`});
  store.set('combat',cb);if(typeof CB!=='undefined')CB=cb;actToast(`${n>1?n+' × ':''}${name} added to the combat tracker: ${fmt(E.hp)} HP, AC ${E.ac}, hit ${fmt(E.hit)}`,'Open the tracker',()=>go('combat'))}
