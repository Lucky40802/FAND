var fs = require('fs');
var A = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious', D = A + '/Blueprints';
var SC = require('path').join(__dirname, '..', 'data');
var MODE = process.argv[2] || 'dry';
// items that don't strip corpses -> [profession, specialty]
var MOVE = {
  'Ore Pick': ['Harvesting', 'Mining'], "Prospector's Pan": ['Harvesting', 'Mining'], 'Ore Sieve': ['Harvesting', 'Mining'], 'Ore Sounding Rod': ['Harvesting', 'Mining'], 'Law-Vein Tap': ['Harvesting', 'Mining'],
  'Collapsible Cage': ['Harvesting', 'Beast Taming'], "Tracker's Snare": ['Harvesting', 'Beast Taming'], 'Mirror-Shard Trap': ['Harvesting', 'Beast Taming'], 'Astral Net': ['Harvesting', 'Foraging'],
  'Pry Bar': ['Engineering', 'Clockwork Engineering'], 'Lockpick Roll': ['Engineering', 'Clockwork Engineering'], 'Trap-Disarm Kit': ['Engineering', 'Clockwork Engineering'], 'Salvage Magnet': ['Engineering', 'Clockwork Engineering'], 'Salvage Golem Core': ['Engineering', 'Golemancy'],
  'Collapsible Ladder': ['Engineering', 'Building'], 'Crypt-Breaker\'s Kit': ['Engineering', 'Clockwork Engineering'], 'Deep-Salvage Diving Bell': ['Engineering', 'Building'], "Wreck-Diver's Weights": ['Engineering', 'Building'], 'Sea-Wreck Grapnel': ['Engineering', 'Building'],
  'Rift Anchor Spike': ['Engineering', 'Building'], "Rift-Scavenger's Harness": ['Engineering', 'Building'], 'Abyssal Climbing Rig': ['Engineering', 'Building'], "Ruin Delver's Harness": ['Engineering', 'Building'], 'Rope-and-Hook Kit': ['Engineering', 'Building'],
  "Smelter's Crucible": ['Blacksmithing', 'Blacksmithing'], 'Rag-and-Oil Kit': ['Blacksmithing', 'Blacksmithing'],
  'Ruin Map Rubbings': ['Navigation', 'Navigation'], "Wreck-Finder's Rod": ['Navigation', 'Navigation'],
  'Mirror-Realm Mirror Hook': ['Enchanting', 'Glyph Inscription'], 'Loot-Sense Charm': ['Enchanting', 'Sigilcraft'], 'Fey-Proof Satchel': ['Tailoring', 'Arcane Tailoring'],
  'Brimstone Respirator': ['Harvesting', 'Mining'], 'Starless Lantern': ['Harvesting', 'Foraging'], "Watcher-Lid Hood": ['Tailoring', 'Shadow Weaving']
};
// kept items whose wording needs to be about corpses
var REWORD = {
  'Scrap Sack': 'A waxed sack for carrying harvested parts. Holds twice what a normal sack does, and keeps blood from soaking through.',
  'Lantern on a Pole': 'Lights a 30-ft circle and keeps your hands free while you work on a corpse at night.',
  'Grave Shovel': 'Unearths buried carcasses and bones twice as fast. Popular with the less scrupulous.',
  'Scent Hound Leash': 'Trains a hound to find fresh carcasses by smell, up to a mile away.',
  'Heatproof Tongs': 'Harvest parts from creatures that burn to the touch, such as hellhounds, salamanders, and fire elementals.',
  'Salvage Ledger': 'Records which creature each part came from. Merchants pay 10% more for documented parts.',
  "Salvager's Magnifier": 'Identifies a harvested part\'s realm and grade on sight.',
  "Salvager's Sledge-Wagon": 'Hauls a Huge carcass with a team of oxen.',
  'Realm-Sealed Satchel': 'A bag that keeps parts harvested from other realms from decaying or escaping.',
  'Godfall Excavator\'s Kit': 'Strips remains at a god-fall safely. Primordial parts harvested with it don\'t lash out.',
  'Realm-Tagging Chalk': 'Marks harvested parts with their realm and grade so they\'re easier to sell.',
  "Master Scavenger's Coat": 'Endless pockets: carries twenty harvested parts without encumbrance, each kept fresh.'
};
var log = [], moved = 0, reworded = 0;
var BK = SC + '/scavfocus_backup'; if (MODE === 'go' && !fs.existsSync(BK)) fs.mkdirSync(BK);
function prof(n) { return '[[FAND/Atrious/Professions/' + (n === 'Alchemy' ? 'Alchemy (Profession)' : n) + '|' + n + ']]'; }
Object.keys(MOVE).concat(Object.keys(REWORD)).forEach(function (n) {
  var p = D + '/' + n + '.md'; if (!fs.existsSync(p)) { log.push('MISSING ' + n); return; }
  var t = fs.readFileSync(p, 'utf8'), nt = t;
  if (MOVE[n]) {
    nt = nt.replace(/^profession:[^\r\n]*/m, 'profession: "' + MOVE[n][0] + '"').replace(/^specialty:[^\r\n]*/m, 'specialty: "' + MOVE[n][1] + '"')
      .replace('[[FAND/Atrious/Professions/Scavenging|Scavenging]]', prof(MOVE[n][0]));
    moved++;
  }
  if (REWORD[n]) {
    var lines = nt.split(/\r?\n/), i = lines.findIndex ? -1 : -1;
    for (var k = 0; k < lines.length; k++) { if (/^\*[^*].*\*$/.test(lines[k])) { i = k; break; } }
    for (var j = i + 1; j < lines.length; j++) { if (lines[j].trim() && !/^(\*\*|##|See )/.test(lines[j])) { lines[j] = REWORD[n]; reworded++; break; } }
    nt = lines.join('\n');
  }
  if (nt !== t && MODE === 'go') { fs.writeFileSync(BK + '/' + n + '.md', t); fs.writeFileSync(p, nt); }
});
console.log(MODE, 'moved', moved, 'reworded', reworded, log.join('; '));
