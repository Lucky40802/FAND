// Pictures for monsters, gods, demons, and patrons: each is matched to an illustration from game-icons.net
// (CC BY 3.0, by Lorc, Delapouite and contributors; https://game-icons.net). The full set is vendored in
// tools/app/vendor/game-icons/icons.json (from the @iconify-json/game-icons package); only the icons used are shipped.
// Rules are tried in order and the first match wins: the entity's name first, then (monsters) its creature type,
// then words in its description. Run `node generators/art.js report` to see what each entry got.
var fs = require('fs'), path = require('path');

// ---- monsters: by name ----
var MON = [
  [/tarrasque/, 'horned-reptile'],
  [/elder brain|intellect devourer/, 'brain'],
  [/mind flayer|alhoon|ulitharid|neothelid|grell/, 'brain-tentacle'],
  [/beholder zombie/, 'shambling-zombie'],
  [/beholder|spectator|gauth|gazer|death tyrant|mindwitness|^watcher$|first watcher/, 'surrounded-eye'],
  [/kraken|morkoth/, 'giant-squid'],
  [/octopus/, 'octopus'],
  [/darkmantle/, 'squid'],
  [/hydra|yamata|ladon/, 'hydra'],
  [/dragon turtle|zaratan/, 'sea-turtle'],
  [/tortle/, 'turtle-shell'],
  [/faerie dragon/, 'fairy-wings'],
  [/ancient .*dragon|greatwyrm|chromatic|godfall wyrm/, 'spiked-dragon-head'],
  [/wyrmling|pseudodragon/, 'dragon-spiral'],
  [/young .*dragon/, 'double-dragon'],
  [/dragon|fafnir|zmey|nidhoggr$|vritra$|lindworm|draconic|ember wyrm|tatzelwurm/, 'dragon-head'],
  [/rootwyrm/, 'tree-roots'],
  [/timeworm|purple worm|remorhaz|bulette|grick|deepmaw|vritra brood|nidhoggr spawn|rotspawn/, 'worm-mouth'],
  [/wyvern|dragonnel|guard drake|piasa/, 'wyvern'],
  [/jiaolong/, 'sea-dragon'],
  [/leviathan|jormungandr|charybdis|world fish|makara|taniwha|sea serpent|ninki nanka|caoranach|scylla/, 'sea-serpent'],
  [/apep|uktena|choir serpent|vein serpent|mushussu|wretched coil/, 'snake-spiral'],
  [/naga|yuan-ti|uraeus/, 'cobra'],
  [/poisonous snake|rattle/, 'rattlesnake'],
  [/snake|serpent|iron cobra/, 'snake'],
  [/behemoth|mammoth|mokele/, 'mammoth'],
  [/elephant/, 'elephant-head'],
  [/rhinoceros/, 'rhinoceros-horn'],
  [/tyrannosaurus|allosaurus|velociraptor|deinonychus|hadrosaurus/, 'dinosaur-rex'],
  [/triceratops|ankylosaurus/, 'triceratops-head'],
  [/stegosaurus|dimetrodon/, 'stegosaurus-scales'],
  [/brontosaurus|plesiosaurus/, 'sauropod-skeleton'],
  [/pteranodon|quetzalcoatlus/, 'pterodactylus'],
  [/demilich/, 'death-skull'],
  [/lich|undead king/, 'crowned-skull'],
  [/flameskull/, 'burning-skull'],
  [/skull lord/, 'triple-skulls'],
  [/vampiric mist/, 'vampire-cape'],
  [/vampire|strigoi|vetala|jiangshi|aswang|manananggal|impundulu/, 'vampire-dracula'],
  [/mummy/, 'mummy-head'],
  [/banshee|cihuateteo/, 'female-vampire'],
  [/ghost|poltergeist|allip|dybbuk|sluagh|hollow$|the returning/, 'ghost'],
  [/specter|spectre|wraith|shade$|nightwalker|absence|eidolon/, 'spectre'],
  [/ghoul|ghast|draugr|revenant|wight|bodak|zombie|deathlock|meazel|cadaver/, 'shambling-zombie'],
  [/death knight|helmed horror|animated armor|narzugon|sword wraith|einherjar|fey court knight|prince's champion/, 'black-knight-helm'],
  [/death giant|reaper|keres|soul tormentor/, 'grim-reaper'],
  [/gashadokuro|boneclaw|bone naga|minotaur skeleton|warhorse skeleton|skeleton|bone devil/, 'skeleton'],
  [/balor|goristro|molydeus|marilith|nalfeshnee|glabrezu|hezrou|vrock|demon duke|hell general/, 'horned-skull'],
  [/pit fiend|amnizu|orthon|horned devil|erinyes/, 'diablo-skull'],
  [/succubus|lilitu|empusa|lamia|yochlol/, 'evil-wings'],
  [/imp$|quasit|homunculus|boggle|rutterkin|mephit/, 'imp-laugh'],
  [/manes|lemure|dretch|nupperibo|demon thrall/, 'gooey-daemon'],
  [/cerberus|orthrus|garmr|hel hound|hellhound|barghest|death dog|yeth hound|shadow mastiff|judgement hound|xolotl hound|hollow hound|black shuck|chimera hound|blink dog|cu sith|mastiff|hound|howler/, 'hound'],
  [/nightmare|warhorse|riding horse|draft horse|pony|hippocamp|kelpie|each-uisge|nuckelavee/, 'horse-head'],
  [/mule/, 'donkey'],
  [/camel/, 'camel-head'],
  [/unicorn|ki-rin|qilin|pixiu/, 'unicorn'],
  [/pegasus/, 'pegasus'],
  [/griffon|hippogriff|anzu|ugallu/, 'griffin-symbol'],
  [/phoenix|bennu|simurgh|alkonost|halo sparrow|garuda/, 'hawk-emblem'],
  [/thunderbird|stormhawk|raiju/, 'eagle-emblem'],
  [/roc$|ziz|eagle|hawk|stymphalian|peryton|aarakocra|tengu|giant vulture|vulture/, 'eagle-head'],
  [/axe beak|cockatrice/, 'rooster'],
  [/owlbear|owl/, 'owl'],
  [/raven|nue|kenku/, 'raven'],
  [/camazotz|bat/, 'evil-bat'],
  [/werewolf|skinwalker|wendigo/, 'werewolf'],
  [/wererat|cranium rat|rat$|rats/, 'rat'],
  [/werebear|bear/, 'bear-head'],
  [/wereboar|boar/, 'boar'],
  [/weretiger|tiger|panther|displacer|ocelot|serpopard|bakeneko|catoblepas/, 'tiger-head'],
  [/saber-toothed/, 'saber-toothed-cat-head'],
  [/lion|sphinx|lamassu/, 'lion'],
  [/fenrir|fenris|skoll|hati|worg|wolf|leucrotta|ironwood/, 'wolf-head'],
  [/gnoll|hyena|jackal|ammit/, 'hyena-head'],
  [/kitsune|huli jing|fox/, 'fox-head'],
  [/minotaur|cretan bull|bull of heaven|gorgon|ophiotaurus/, 'minotaur'],
  [/ox$|bull$/, 'bull'],
  [/elk|stag|hind|deer|peryton/, 'stag-head'],
  [/goat|satyr|krampus/, 'goat'],
  [/ape|baboon|girallon|yeti|su-monster|sasquatch/, 'gorilla'],
  [/badger|weasel|domovoi/, 'badger'],
  [/spider|ettercap|drider|jorogumo|chitine|choldrith|steeder|neogi|arachn/, 'spider-alt'],
  [/scorpion|girtablullu|tlincalli/, 'scorpion'],
  [/centipede|carrion crawler|layer crawler|rock crawler/, 'centipede'],
  [/wasp|stirge|vein mite/, 'wasp-sting'],
  [/kruthik|myrmekes|ankheg|thri-kreen|umber hulk/, 'praying-mantis'],
  [/beetle|rust monster/, 'scarab-beetle'],
  [/moon moth|moth/, 'butterfly'],
  [/swarm of insects|thornsprite|unnamed swarm|negation swarm/, 'fly'],
  [/crab|chuul/, 'crab'],
  [/shark/, 'shark-jaws'],
  [/killer whale/, 'sperm-whale'],
  [/crocodile|kappa|lizard king/, 'croc-jaws'],
  [/eel|storm eel|gravity eel/, 'eel'],
  [/froghemoth|frog|toad|bullywug|grung|slaad/, 'frog'],
  [/sea horse/, 'seahorse'],
  [/snail/, 'snail'],
  [/kuo-toa|sahuagin|aboleth|sea spawn|ichthyocentaur|deep scion|vodyanoy|kraken priest/, 'fish-monster'],
  [/lizardfolk|troglodyte|lizard|basilisk|salamander|azer|tanarukk/, 'lizardman'],
  [/merfolk|merrow|selkie|rusalka/, 'mermaid'],
  [/siren|harpy|pit siren/, 'harpy'],
  [/medusa|stheno/, 'medusa-head'],
  [/centaur/, 'centaur'],
  [/cyclops|fomorian/, 'cyclops'],
  [/manticore|chimera|leucrotta/, 'bestial-fangs'],
  [/mimic/, 'mimic-chest'],
  [/gargoyle|galeb duhr/, 'gargoyle'],
  [/cloaker|rug of smothering|trapper/, 'vampire-cape'],
  [/roper|piercer|stalker$/, 'stalactites'],
  [/otyugh|choker|gibbering|shoggoth|tentacle/, 'tentacle-strike'],
  [/nothic|one-eyed/, 'one-eyed'],
  [/hag|annis|mara$|baba yaga|chicken-legged hut|mestama/, 'witch-face'],
  [/treant|awakened tree|root guardian|wood woad|oaken bolter|leshy/, 'tree-face'],
  [/blight|awakened shrub|thorny|needle/, 'thorny-vine'],
  [/shambling mound/, 'swamp'],
  [/corpse flower|violet fungus|shrieker|myconid|gas spore|vegepygmy|quaggoth spore|sporemara/, 'mushroom-gills'],
  [/ooze|pudding|cube|jelly|oblex|vylumex|slime/, 'slime'],
  [/fire elemental|efreeti|ifrit|fire snake|magmin|cinder|emberask/, 'fire-silhouette'],
  [/water elemental|marid|water weird/, 'wave-crest'],
  [/air elemental|djinni|elder tempest|invisible stalker|southwest wind/, 'tornado'],
  [/earth elemental|dao$|xorn/, 'rock-golem'],
  [/frost salamander|ice devil|winter wolf|frost giant|ice shaper/, 'ice-golem'],
  [/iron golem|steel predator|iron's jailer/, 'metal-golem-head'],
  [/flesh golem/, 'frankenstein-creature'],
  [/golem|stone defender|colossus|talos|gate sentinel|keeper|anchor-warden|pit warden|god's grave guardian/, 'golem-head'],
  [/monodrone|duodrone|tridrone|quadrone|pentadrone|retriever|hellfire engine|marut|shield guardian|spin wheel|throne wheel/, 'robot-golem'],
  [/flying sword/, 'winged-sword'],
  [/storm giant|cloud giant/, 'lightning-storm'],
  [/fire giant/, 'fire-silhouette'],
  [/giant$|giant (?!ape|badger|bat|boar|constrictor|crab|crocodile|eagle|elk|fire beetle|frog|goat|hyena|lizard|octopus|owl|poisonous|rat|scorpion|sea horse|shark|spider|strider|toad|vulture|wasp|weasel|wolf|centipede)|jotunn|ettin|gegenees|titan|primeval/, 'giant'],
  [/troll/, 'troll'],
  [/ogre|oni|half-ogre|humbaba|banderhobb/, 'ogre'],
  [/orc|orog/, 'orc-head'],
  [/goblin|hobgoblin|bugbear|nilbog|xvart|redcap|darkling|grimlock/, 'goblin-head'],
  [/kobold/, 'goblin'],
  [/duergar|svartalf|derro|deep gnome|korred/, 'dwarf-face'],
  [/drow|eladrin|shadar-kai|firbolg|huldra|dryad/, 'woman-elf-face'],
  [/githyanki|githzerai|goliath|warrior|captain|warlord|chief|commander|knight|valkyrie|asura/, 'swordman'],
  [/mage|priest|shaman|savant|sorcerer|arcanist|warlock|seer|weaver|monger|mastermind|scribe|oracle|inquisitor|matron|consort/, 'wizard-face'],
  [/pixie|sprite|quickling|fairy|glimmer wisp|will-o|fear dearg|meenlock/, 'fairy'],
  [/deva|planetar|solar$|seraph|empyrean|couatl|heaven's herald|last light/, 'angel-wings'],
  [/star spawn|starless|khirad|acamar/, 'cursed-star'],
  [/sorrowsworn|unborn|unmade|unclaimed|nothing|emptiness|null mote|far mote|void|silence|silent|zero stalker/, 'hood'],
  [/scarecrow/, 'scarecrow'],
  [/doppelganger|rakshasa|mirror/, 'double-face-mask'],
  [/oath-eater|law|contract|echo/, 'scales'],
  [/chaos-spawn|warpbeast|warpling/, 'spiky-explosion'],
  [/shifting maw|dream eater|maw demon|taotie|devourer/, 'carnivore-mouth'],
  [/cipactli/, 'croc-jaws'], [/umibozu/, 'giant'], [/hook horror|cave fisher/, 'bird-claw'], [/quaggoth/, 'gorilla'],
  [/flind/, 'hyena-head'], [/nagpa/, 'vulture'], [/bronze scout/, 'robot-golem'], [/balhannoth/, 'tentacle-strike'],
  [/flumph/, 'jellyfish'], [/behir/, 'horned-reptile'], [/bunyip/, 'fish-monster'], [/chupacabra/, 'bestial-fangs'],
  [/echidna|typhon/, 'snake-spiral'], [/grootslang/, 'elephant-head'], [/berbalang|vargouille/, 'evil-bat'],
  [/abishai/, 'evil-wings'], [/chain devil|shackle/, 'crossed-chains'], [/chasme/, 'fly'], [/merregon/, 'black-knight-helm'],
  [/loth$/, 'gooey-daemon'], [/barlgura|bulezau|armanite|alkilith|nabassu|shoosuva|wastrilith|maurezhi/, 'daemon-skull'],
  [/shadow/, 'shadow-grasp'], [/dullahan/, 'cloaked-figure-on-horseback'], [/death kiss|sibriex/, 'surrounded-eye']
];
// ---- monsters: by creature type ----
var MON_TYPE = [
  [/humanoid/, 'cowled'], [/aberration/, 'tentacles-skull'], [/beast/, 'paw'], [/undead/, 'death-skull'], [/dragon/, 'dragon-head'],
  [/monstrosity/, 'beast-eye'], [/ooze/, 'slime'], [/elemental/, 'vortex'], [/devil/, 'devil-mask'], [/demon/, 'daemon-skull'],
  [/yugoloth/, 'gooey-daemon'], [/fiend/, 'devil-mask'], [/construct/, 'robot-golem'], [/fey/, 'fairy'], [/giant/, 'giant'],
  [/plant/, 'tree-face'], [/celestial/, 'angel-wings']
];

// ---- gods: by name, then by their Runes (first Rune with a picture) ----
var GOD_NAME = [
  [/^zeus\b/, 'zeus-sword'], [/^thor\b/, 'thor-hammer'], [/^anubis\b/, 'anubis'], [/^horus\b/, 'horus'], [/^poseidon\b/, 'trident'],
  [/^hades\b/, 'hades-symbol'], [/^(ra|amun-ra|amun)\b/, 'sun'], [/^odin\b/, 'raven'], [/^loki\b/, 'duality-mask'], [/^hel\b/, 'death-skull'],
  [/^athena\b/, 'owl'], [/^ares\b/, 'crossed-swords'], [/^apollo\b/, 'lyre'], [/^artemis\b/, 'bow-arrow'], [/^hephaestus\b/, 'anvil-impact'],
  [/^aphrodite\b/, 'heart-wings'], [/^dionysus\b/, 'grapes'], [/^hermes\b/, 'winged-leg'], [/^demeter\b/, 'wheat'], [/^hera\b/, 'queen-crown'],
  [/^quetzalcoatl\b/, 'feathered-wing'], [/^sobek\b/, 'croc-jaws'], [/^bastet\b/, 'cat'], [/^thoth\b/, 'egyptian-bird'], [/^osiris\b/, 'egyptian-profile'],
  [/^set\b/, 'sandstorm'], [/^isis\b/, 'ankh'], [/^ganesha\b/, 'elephant-head'], [/^shiva\b/, 'trident'], [/^hanuman\b/, 'monkey'],
  [/^susanoo\b/, 'big-wave'], [/^amaterasu\b/, 'sunrise'], [/^tsukuyomi\b/, 'moon'], [/^fenrir\b/, 'wolf-head'], [/^freyja\b/, 'cat'],
  [/^tyr\b/, 'mailed-fist'], [/^heimdall\b/, 'hunting-horn'], [/^tiamat\b/, 'hydra'], [/^marduk\b/, 'lightning-trio'], [/^ishtar|^inanna/, 'lion'],
  [/^dagda\b/, 'harp'], [/^morrigan|^the morrigan/, 'raven'], [/^lugh\b/, 'spear-feather'], [/^tezcatlipoca\b/, 'mirror-mirror'], [/^huitzilopochtli\b/, 'hummingbird'],
  [/^arceus\b/, 'triforce'], [/^herobrine|^notch\b/, 'war-pick'], [/ender dragon/, 'dragon-head'], [/^wither\b/, 'triple-skulls']
];
var RUNE = {
  Death: 'death-skull', 'Grim Reaper': 'grim-reaper', Bones: 'skeleton', Decay: 'leaf-skeleton', Ending: 'tombstone', Grief: 'broken-heart',
  Heal: 'caduceus', Health: 'heart-plus', Mend: 'healing', Regeneration: 'regeneration', Life: 'ankh', Lifesteal: 'heart-drop', Resurrection: 'raise-skeleton', Rebirth: 'hawk-emblem',
  Water: 'water-drop', Tide: 'wave-crest', Wave: 'big-wave', Rain: 'heavy-rain', Wet: 'water-splash', Swamp: 'swamp',
  Nurture: 'sprout', Grow: 'ground-sprout', Fruit: 'fruit-tree', Bloom: 'flower-twirl', Blossom: 'lotus-flower', Flower: 'flowers', Herb: 'herbs-bundle', Root: 'tree-roots',
  Forest: 'pine-tree', Nature: 'oak-leaf', Season: 'falling-leaf', 'Cycle of Life': 'cycle', Land: 'mountains', Earth: 'earth-crack', Terraformation: 'mountaintop',
  War: 'crossed-swords', Battle: 'sword-clash', Martial: 'fist', Blade: 'broadsword', Katana: 'katana', Spear: 'spears', Bow: 'bow-arrow', Projectile: 'arrow-flights', Rage: 'enrage', Destruction: 'crowned-explosion',
  Love: 'heart-wings', Desire: 'love-mystery', Lust: 'lips', Seduction: 'lips', Charm: 'charm', Chastity: 'lotus-flower',
  Fire: 'flame', Lava: 'lava', Forging: 'anvil-impact', Blacksmith: 'anvil', Hammer: 'thor-hammer', Pickaxe: 'war-pick', Alchemy: 'erlenmeyer',
  Lightning: 'lightning-helix', Electric: 'lightning-arc', Storm: 'lightning-storm', Typhoon: 'tornado', Air: 'whirlwind', Breath: 'wind-slap', Sky: 'sun-cloud', Cloud: 'fluffy-cloud', Flight: 'feathered-wing',
  Sun: 'sun', Dawn: 'sunrise', Day: 'sunbeams', Light: 'sun-radiations', Moon: 'moon', Night: 'night-sky', Dusk: 'sunset', Dark: 'evil-moon', Shadow: 'shadow-grasp', Shade: 'hood',
  Star: 'polar-star', Cosmic: 'galaxy', Gravity: 'orbit', Spatial: 'portal', Dimension: 'magic-portal',
  Protect: 'shield', Protection: 'checked-shield', Preserve: 'shield-reflect',
  Creation: 'sparkles', Origin: 'explosion-rays', Beginning: 'sprout-disc', Supreme: 'crowned-explosion', Divinity: 'spiked-halo',
  Sovereignty: 'imperial-crown', Royalty: 'crown', Governance: 'throne-king', Law: 'gavel', Order: 'law-star', Justice: 'scales', Balance: 'scales', Punish: 'whip', Trial: 'tarot-11-justice', Imprison: 'imprisoned', Bind: 'crossed-chains',
  Wisdom: 'owl', Knowledge: 'book-pile', Learning: 'open-book', Memory: 'brain', Mind: 'brain', Sentience: 'brainstorm', Truth: 'third-eye', Vision: 'all-seeing-eye', Foresee: 'crystal-ball', Prophet: 'crystal-ball', Omen: 'evil-comet', Fate: 'spinning-wheel', Weave: 'spinning-wheel',
  Music: 'lyre', Entertainment: 'drama-masks', Happiness: 'sun', Art: 'paint-brush', Hearing: 'sound-waves',
  Voyage: 'ship-wheel', Speed: 'winged-leg', Riding: 'horse-head', Migration: 'flying-flag', Trade: 'coins', Commerce: 'two-coins', Wealth: 'gold-bar', Treasure: 'open-treasure-chest', Greed: 'coins-pile', Gamble: 'rolling-dices', Probability: 'rolling-dices', Gambit: 'chess-knight', Ransom: 'money-stack',
  Strength: 'muscle-up', Power: 'mighty-force', Courage: 'lion', Loyalty: 'dog-bowl', Dedication: 'kneeling', Trust: 'shaking-hands', Belonging: 'family-tree',
  Word: 'scroll-quill', Speech: 'chat-bubble', Diplomacy: 'shaking-hands', Signal: 'aerial-signal', Transmission: 'radio-tower', Chronicles: 'tied-scroll', Numerical: 'abacus',
  Time: 'hourglass', 'Time Duration': 'sands-of-time', Tempo: 'pendulum-swing', Age: 'old-king', Past: 'backward-time', Youth: 'baby-face',
  Chaos: 'spiky-explosion', Fear: 'terror', Betrayal: 'backstab', Rebellion: 'broken-shield', Curse: 'cursed-star', Plague: 'plague-doctor-profile', Poison: 'poison-bottle', Famine: 'wheat', Pain: 'pierced-heart', Envy: 'evil-eyes', Gluttony: 'meat', Lies: 'duality-mask', Sin: 'tarot-15-the-devil', Instigate: 'burning-dot',
  Dreams: 'dream-catcher', Illusion: 'magic-swirl', 'Shape-shifter': 'duality-mask', Transformation: 'transform', Double: 'duality-mask', Clone: 'duality-mask', Reflection: 'mirror-mirror', Image: 'mirror-mirror', Twist: 'twirl-center',
  Magic: 'magic-swirl', Animal: 'paw', Tame: 'paw-heart', Dragon: 'dragon-head', Blood: 'blood', Snow: 'snowflake-2', Frost: 'snowflake-1', Dry: 'sandstorm',
  Release: 'breaking-chain', Unlock: 'skeleton-key', Descend: 'falling-star', Mechanical: 'gears', Yin: 'yin-yang', Yang: 'yin-yang', Success: 'trophy', Gift: 'present', Inheritance: 'tied-scroll',
  Purity: 'holy-water', Mercy: 'prayer', Clean: 'water-drop', Health_: 'heart-plus'
};
// ---- demons and patrons: by words in the name and title, then by group ----
var FIEND = [
  [/cthulhu|drowned|bathyrax|abyssal leviathan|pearl empress|beneath the sea/, 'kraken-tentacle'],
  [/hastur|yellow/, 'tentacles-skull'],
  [/vyrekala|evil dragons|dracolich|void dragon/, 'double-dragon'],
  [/titania|summer queen|thorn court|dreaming loom|air & darkness/, 'fairy-wings'],
  [/oberon|green lord|blighted root|thornivax/, 'tree-face'],
  [/fools/, 'jester-hat'],
  [/baba yaga|hag|witch/, 'witch-face'],
  [/lord of the hunt/, 'stag-head'],
  [/frost|frozen|winter|cryovant/, 'ice-golem'],
  [/unicorn/, 'unicorn'],
  [/solar|redeemed|sunhallow|dawn/, 'angel-wings'],
  [/eternal flame|living embodiment of light/, 'flame'],
  [/blind oracle|voice between stars|prophecy/, 'crystal-ball'],
  [/iron scales|justice/, 'scales'],
  [/morning bell/, 'ringing-bell'],
  [/warden of souls/, 'shield'],
  [/emerald sultan|dao /, 'rock-golem'],
  [/windborn|djinn/, 'djinn'],
  [/brass tyrant|efreeti/, 'fire-silhouette'],
  [/bottled king/, 'magic-lamp'],
  [/lich/, 'crowned-skull'],
  [/vampire|bloodlord|crimson/, 'vampire-dracula'],
  [/clockwork/, 'clockwork'],
  [/loaded die/, 'rolling-dices'],
  [/living library/, 'book-pile'],
  [/mirror/, 'mirror-mirror'],
  [/thunder|storm/, 'lightning-storm'],
  [/war incarnate|endless war|marshal|korvenn|warlord/, 'crossed-swords'],
  [/secrets/, 'secret-book'],
  [/sleeping colossus/, 'giant'],
  [/broken things|inevitability|entropy|crawling chaos/, 'cracked-mask'],
  [/autumn/, 'falling-leaf'],
  [/chained|chains|shackle/, 'imprisoned'],
  [/gnoll|howling pack|skarrgoth/, 'hyena-head'],
  [/wild beast/, 'bestial-fangs'],
  [/horned|maze|cerneth/, 'minotaur'],
  [/ooze|slime|faceless|bile/, 'gooey-daemon'],
  [/silken|web|weaver/, 'spider-face'],
  [/swarm|maggot|infest|myrkuth|fly|flies/, 'fly'],
  [/worm|burrowing/, 'worm-mouth'],
  [/scaled host|serpent|coil|vashkiri/, 'cobra'],
  [/plague|pox|morbi|fetid wind/, 'plague-doctor-profile'],
  [/fester|canker|gangren|sore|suppurat|seeping|jaundiced|necrotic/, 'death-juice'],
  [/rot|spore|decay|putrid|rancid|decompos/, 'goo-skull'],
  [/eye|seer|sees/, 'bleeding-eye'],
  [/star/, 'cursed-star'],
  [/mind|thought|dream/, 'brain-tentacle'],
  [/iron|rust|corroded/, 'iron-mask'],
  [/gold|hoard/, 'gold-stack'],
  [/maw|mouth|hunger|devour|gnaw|feast|eater|consuming|vore/, 'carnivore-mouth'],
  [/blood|flesh|wound|pain|salted|flayed|agony|veins/, 'bleeding-heart'],
  [/chorus|voices|wailing|grave|dead voices/, 'screaming'],
  [/undeath|undying|corpse|carrion|horde|death|souls|nyxmourne/, 'death-skull'],
  [/venom|poison/, 'poison-bottle'],
  [/crown|throne|king|emperor|sovereign|tyrant|queen|prince|lord|duke|ruler|countess/, 'crowned-skull'],
  [/fire|ash|ember|hellfire|molten|scorched|cinder|flame|phlethis/, 'burning-skull'],
  [/void|dark|shadow|hollow|nothing|absence|oblivion|empty|veil/, 'shadow-grasp']
];
var FIEND_GRP = [
  [/archdevil|fiend patron/, 'devil-mask'], [/demon prince/, 'daemon-skull'], [/great old one/, 'tentacles-skull'], [/corruption/, 'goo-skull'],
  [/archfey/, 'fairy'], [/undying/, 'death-skull'], [/celestial/, 'angel-wings'], [/genie/, 'djinn'], [/.*/, 'cursed-star']
];

// ---- emoji used around the site, drawn as game-icons symbols instead (the page swaps them in as it draws; see symbolize()).
// Interface marks (arrows, ✕, ★, ✓) and system emoji (🔍 🔊 🖨 ⚠ 🗑 …) stay as text.
var SYMBOLS = {
  '🎲': 'perspective-dice-six-faces-random', '⚔': 'crossed-swords', '🔱': 'trident', '🗡': 'plain-dagger', '🪓': 'battle-axe', '🛡': 'shield',
  '🔨': 'claw-hammer', '⛓': 'crossed-chains', '🏹': 'bow-arrow', '⛑': 'visored-helm', '🏏': 'flanged-mace', '⚒': 'anvil-impact', '📜': 'scroll-unfurled',
  '🔪': 'bowie-knife', '✨': 'sparkles', '⚖': 'scales', '⛏': 'war-pick', '🔥': 'flame', '🧤': 'gloves', '🎁': 'present', '🥾': 'leather-boot',
  '🧥': 'cape', '🪄': 'fairy-wand', '🔧': 'spanner', '🔫': 'blunderbuss', '📝': 'quill-ink', '👁': 'eyeball', '🔮': 'crystal-ball', '🌾': 'wheat',
  '🧪': 'round-potion', '☀': 'sun', '📖': 'open-book', '🪙': 'two-coins', '🎯': 'archery-target', '🪝': 'meat-hook', '🎴': 'card-random',
  '☠': 'skull-crossed-bones', '🪨': 'stone-pile', '⚗': 'erlenmeyer', '🧭': 'compass', '🐉': 'dragon-head', '⚰': 'coffin', '🌙': 'moon',
  '💥': 'crowned-explosion', '🏮': 'paper-lantern', '📓': 'book-cover', '📕': 'book-cover', '👊': 'fist', '🪢': 'rope-coil', '👑': 'crown', '👘': 'robe',
  '🧺': 'basket', '🏛': 'greek-temple', '🧵': 'sewing-string', '🍲': 'cauldron', '🦴': 'crossed-bones', '💨': 'whirlwind', '🗝': 'skeleton-key',
  '🕳': 'hole', '⚡': 'lightning-helix', '💰': 'coins-pile', '🕸': 'spider-web', '🐎': 'horse-head', '📿': 'prayer-beads', '💍': 'ring',
  '💣': 'fire-bomb', '🫙': 'mason-jar', '🍳': 'saucepan', '🐾': 'paw-print', '🪃': 'boomerang', '🥋': 'black-belt', '🎭': 'drama-masks',
  '🗿': 'stone-bust', '💎': 'gems', '🪕': 'banjo', '🎶': 'musical-notes', '🎼': 'musical-notes', '🥁': 'drum', '📯': 'hunting-horn', '🧹': 'broom',
  '🪚': 'hand-saw', '🪣': 'empty-wood-bucket', '🚪': 'door', '🧙': 'wizard-face', '🎨': 'paint-brush', '❄': 'snowflake-1', '☘': 'clover',
  '✝': 'holy-symbol', '🎋': 'bamboo', '🍀': 'clover', '🗺': 'treasure-map', '🏰': 'castle', '🐺': 'wolf-head', '🦇': 'evil-bat', '🕯': 'candle-light',
  '⏳': 'hourglass', '🌲': 'pine-tree', '🌊': 'big-wave', '🌋': 'volcano', '🧿': 'third-eye', '🩸': 'drop', '🦷': 'fangs', '🪶': 'feather', '🐚': 'spiral-shell'
};
// ---- one symbol for each page (menu entries and page headings) and each menu group ----
var PAGE_SYMBOLS = {
  home: 'castle', lore: 'scroll-unfurled', realms: 'world', towers: 'stone-tower', gods: 'spiked-halo', runes: 'rune-stone', demons: 'devil-mask',
  patrons: 'pentacle', codex: 'book-pile', bestiary: 'dragon-head', materials: 'ore', properties: 'sparkles', blueprints: 'scroll-quill',
  forge: 'anvil-impact', workshop: 'hammer-nails', craft: 'crafting', shop: 'shop', professions: 'war-pick', classes: 'swordman',
  subclasses: 'two-handed-sword', hidden: 'hood', spells: 'spell-book', magic: 'wizard-staff', prep: 'notebook', sheet: 'id-card',
  party: 'campfire', journal: 'quill-ink', hooks: 'compass', encounter: 'battle-gear', combat: 'sword-clash', dice: 'perspective-dice-six-faces-random',
  tools: 'toolbox', guide: 'treasure-map', rules: 'rule-book', help: 'help', about: 'info', account: 'cowled', settings: 'cog',
  'g:World': 'world', 'g:Creatures & Materials': 'dragon-head', 'g:Items & Crafting': 'anvil-impact', 'g:Magic & Classes': 'magic-swirl',
  'g:Play': 'perspective-dice-six-faces-random', 'g:Reference': 'book-cover', 'g:DM': 'crowned-skull'
};

function first(rules, s) { for (var i = 0; i < rules.length; i++) if (rules[i][0].test(s)) return rules[i][1]; return null; }
function icons() { return require(path.join(__dirname, '..', 'app', 'vendor', 'game-icons', 'icons.json')); }

// returns {icons:[svg bodies], mon:{name:i}, god:{name:i}, demon:{name:i}, patron:{name:i}, sym:{emoji:i}, pg:{page:i}}, plus `pick` for the report
function buildArt(D) {
  var J = icons(), list = [], at = {}, out = { icons: list, mon: {}, god: {}, demon: {}, patron: {} }, pick = {};
  var has = function (n) { return !!(J.icons[n] || (J.aliases && J.aliases[n])); };
  var body = function (n) { var x = J.icons[n] || J.icons[(J.aliases[n] || {}).parent]; return x.body.replace(/ fill="currentColor"/g, ''); };
  var use = function (n) { if (!has(n)) throw new Error('art: no icon called ' + n); if (!(n in at)) { at[n] = list.length; list.push(body(n)); } return at[n]; };
  D.MONSTERS.forEach(function (m) {
    var n = m.n.toLowerCase(), ty = (m.sb && m.sb.ty || '').toLowerCase();
    var ic = first(MON, n) || first(MON_TYPE, ty) || first(MON, (m.txt || '').toLowerCase()) || 'paw';
    out.mon[m.n] = use(ic); pick['mon:' + m.n] = ic;
  });
  D.GODS.forEach(function (g) {
    var n = g.n.toLowerCase(), ic = first(GOD_NAME, n);
    if (!ic) (g.runes || []).some(function (r) { if (RUNE[r] && has(RUNE[r])) { ic = RUNE[r]; return true; } });
    ic = ic || 'spiked-halo';
    out.god[g.n] = use(ic); pick['god:' + g.n] = ic;
  });
  [['demon', D.DEMONS], ['patron', D.PATRONS]].forEach(function (t) {
    t[1].forEach(function (e) {
      var ic = first(FIEND, e.n.toLowerCase()) || first(FIEND_GRP, (e.grp || '').toLowerCase());
      out[t[0]][e.n] = use(ic); pick[t[0] + ':' + e.n] = ic;
    });
  });
  out.sym = {}; Object.keys(SYMBOLS).forEach(function (e) { out.sym[e] = use(SYMBOLS[e]); });
  out.pg = {}; Object.keys(PAGE_SYMBOLS).forEach(function (k) { out.pg[k] = use(PAGE_SYMBOLS[k]); });
  // check every Rune picture exists, so a typo shows up at build time instead of silently falling back
  Object.keys(RUNE).forEach(function (r) { if (!has(RUNE[r])) throw new Error('art: Rune ' + r + ' names a missing icon ' + RUNE[r]); });
  Object.defineProperty(out, 'pick', { value: pick, enumerable: false });
  return out;
}
module.exports = { buildArt: buildArt };

if (require.main === module && process.argv[2] === 'report') {
  var s = fs.readFileSync(path.join(__dirname, '..', '..', 'site', 'data', 'core.js'), 'utf8');
  var D = new Function(s + ';return {MONSTERS,GODS,DEMONS,PATRONS}')();
  var A = buildArt(D), c = {};
  Object.keys(A.pick).forEach(function (k) { console.log(k + ' → ' + A.pick[k]); c[A.pick[k]] = (c[A.pick[k]] || 0) + 1; });
  console.log('\n' + A.icons.length + ' icons used; most shared: ' + Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 15).map(function (k) { return k + ' ' + c[k]; }).join(', '));
}
