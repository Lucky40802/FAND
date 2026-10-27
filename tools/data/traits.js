// Unique material traits, from what a material is and where it came from.
// - Creature parts get an effect from the creature's signature ability, shaped by the body part
//   (a hawk's eye sharpens sight; a troll's blood regenerates; a basilisk's eye petrifies).
// - Plants get a small herbal effect from what the plant is known for.
// - Ores, stones, gems, supplies, and crafted goods are basic: no trait beyond their property.
// Numbers scale with the Potency rank (P = Potency / 5, 1-10), matching data/properties.js.
// trait(material, creature) -> { org, origin, name, text } ; creature = { n, txt } or null.

// ---- body parts: which kind of effect a part carries
var PARTS = [
  [/\b(eye|eyes|lens|gaze|eyestalk|iris|pupil)\b/i, 'eye', 'sense'],
  [/\b(ear|ears|antenna|antennae|whisker|whiskers)\b/i, 'ear', 'sense'],
  [/\b(brain|mind|cranium|skull)\b/i, 'brain', 'mind'],
  [/\b(fang|fangs|tooth|teeth|tusk|tusks|maw|jaw|beak|mandible|bite)\b/i, 'fang', 'offense'],
  [/\b(claw|claws|talon|talons|nail|pincer|stinger|barb|spike|spikes|quill|quills|spine|spines)\b/i, 'claw', 'offense'],
  [/\b(horn|horns|antler|antlers)\b/i, 'horn', 'offense'],
  [/\b(venom|poison|gland|sac|bile|toxin|spit)\b/i, 'venom', 'offense'],
  [/\b(tail)\b/i, 'tail', 'offense'],
  [/\b(wing|wings|feather|feathers|plume|down|membrane)\b/i, 'wing', 'move'],
  [/\b(leg|legs|hoof|hooves|foot|paw|paws|sinew|tendon)\b/i, 'leg', 'move'],
  [/\b(hide|pelt|skin|fur|leather|mane|wool|hair)\b/i, 'hide', 'defense'],
  [/\b(scale|scales|shell|carapace|plate|plating|chitin|husk|armor|armour)\b/i, 'scale', 'defense'],
  [/\b(bone|bones|knucklebone|knuckle|rib|marrow|vertebra|skeleton)\b/i, 'bone', 'defense'],
  [/\b(heart)\b/i, 'heart', 'vital'],
  [/\b(blood|ichor|plasma)\b/i, 'blood', 'vital'],
  [/\b(fat|tallow|oil|lard|liver|organ|tongue|stomach|lung|lungs)\b/i, 'organ', 'vital'],
  [/\b(silk|web|thread|tendril|tentacle)\b/i, 'silk', 'move'],
  [/\b(essence|core|soul|spirit|ectoplasm|wisp|heartstone|spark|ember|breath|tear|cinder|dust|ash)\b/i, 'essence', 'mind'],
  [/\b(egg|eggs|pearl|ink)\b/i, 'egg', 'mind']
];

// ---- creature abilities: matched against the creature's name and description, first match wins.
// Each gives text per effect kind; {P} {B} {DC} {FT} {D} are filled from Potency.
var ABILITIES = [
  { re: /hawk|eagle|falcon|owl|raptor|griffon|gryphon|roc\b|vulture|peryton|kenku|aarakocra|harpy|hippogriff/i, label: 'Keen-Eyed Flier',
    sense: ['Hawk-Sight', ["While equipped, you have advantage on Wisdom (Perception) checks that rely on sight.", "While equipped, you see clearly twice as far as normal and have advantage on Wisdom (Perception) checks that rely on sight.", "While equipped, you see clearly twice as far as normal and have advantage on Wisdom (Perception) checks that rely on sight. You spot hidden creatures within {FT} ft on a passive Perception of 10 + {P}."]],
    move: ['Glider', ["While equipped, you take half damage from falls.", "While equipped, you take no falling damage from {FT} ft or less and can glide 2 ft forward for every 1 ft you fall.", "While equipped, you take no falling damage and can glide 2 ft forward for every 1 ft you fall. At Potency 6+, you gain a flying speed of {FT} ft for 1 minute once per long rest."]],
    offense: ['Diving Strike', 'A weapon with this material deals +{P}d4 damage when you attack after moving at least 20 ft toward the target.'] },
  { re: /\bbat\b|bats\b|cave fisher|echo/i, label: 'Echolocation',
    sense: ['Echo-Sense', ["While equipped, you have advantage on Wisdom (Perception) checks that rely on hearing, even in darkness.", "While equipped, you have blindsight out to 10 ft, as long as you aren't deafened.", "While equipped, you have blindsight out to {B0} ft, as long as you aren't deafened."]],
    move: ['Night Wing', ["While equipped, you take half damage from falls.", "While equipped, you can hang from ceilings and take no falling damage from {FT} ft or less.", "While equipped, you can hang from ceilings and take no falling damage from {FT} ft or less."]] },
  { re: /wolf|hound|jackal|\bdog\b|worg|coyote|hyena|gnoll/i, label: 'Pack Hunter',
    sense: ['Keen Nose', 'While equipped, you have advantage on Wisdom (Perception) checks that rely on smell and can track a creature by scent for {P} days.'],
    offense: ['Pack Tactics', 'A weapon with this material deals +{P}d4 damage to a creature that one of your allies is within 5 ft of.'],
    defense: ['Thick Coat', ["While equipped, you have advantage on saves against extreme cold.", "While equipped, you ignore the effects of extreme cold.", "While equipped, you ignore the effects of extreme cold and gain +{B} to saves against being knocked prone."]] },
  { re: /troll|hydra|regenerat|ooze king|treant/i, label: 'Regeneration',
    vital: ['Regenerating', ["When you finish a short rest while wearing this, you regain {P2} extra hit points.", "While equipped and below half your hit points, you regain {P} hit points at the start of each of your turns. Fire or acid damage stops it until your next turn.", "While equipped, you regain {P} hit points at the start of each of your turns while you have at least 1 hit point. Fire or acid damage stops it until your next turn."]],
    defense: ['Self-Mending', ["Damaged armor with this material can be repaired in half the usual time.", "Armor with this material repairs itself: Damaged armor is restored after a long rest.", "Armor with this material repairs itself: Damaged armor is restored after a long rest, and you regain {P} hit points when you finish a short rest."]],
    offense: ['Festering Wound', ["A creature hit by a weapon with this material regains 2 fewer hit points from the next healing it receives before the end of your next turn.", "A creature hit by a weapon with this material regains only half the hit points from healing until the start of your next turn.", "A creature hit by a weapon with this material can't regain hit points until the start of your next turn."]] },
  { re: /basilisk|medusa|gorgon|cockatrice|petrif/i, label: 'Petrifying Gaze',
    sense: ['Stone Gaze', ["Once per long rest, as an action, a creature within 30 ft that can see you makes a Constitution save (DC {DC}) or has its speed halved until the end of its next turn.", "Once per long rest, as an action, a creature within 30 ft that can see you makes a Constitution save (DC {DC}) or is restrained until the end of its next turn.", "Once per long rest, as an action, a creature within 30 ft that can see you makes a Constitution save (DC {DC}) or is restrained as it begins to turn to stone; it is petrified if it fails again on its next turn."]],
    offense: ['Calcifying', ["A creature hit by a weapon with this material has its speed reduced by 5 ft until the end of its next turn.", "A creature hit by a weapon with this material has its speed reduced by 10 ft until the end of its next turn.", "A creature hit by a weapon with this material has its speed reduced by 10 ft until the end of its next turn as its flesh stiffens. On a critical hit it is restrained (DC {DC} Constitution save ends)."]],
    defense: ['Stoneskin', ["Once per long rest, when you are hit, you can use your reaction to reduce the damage by {P2} (after AC).", "Once per long rest, you resist bludgeoning, piercing, and slashing damage from nonmagical attacks until the start of your next turn.", "While equipped, you resist bludgeoning, piercing, and slashing damage from nonmagical attacks for 1 minute once per long rest."]],
    vital: ['Unpetrifying', 'Potions and salves made with this material cure petrification. While equipped, you have advantage on saves against being petrified.'] },
  { re: /spider|ettercap|drider|arachn|web/i, label: 'Web-Spinner',
    move: ['Spider Climb', ["While equipped, you have advantage on checks to climb, and webbing doesn't slow you.", "While equipped, you climb at your full speed without an ability check (but not upside down), and webbing doesn't slow you.", "While equipped, you can climb difficult surfaces, including ceilings, without an ability check, and you ignore movement restrictions caused by webbing."]],
    offense: ['Webbed Strike', ["Once per long rest, a creature hit by a weapon with this material is restrained by sticky strands (DC {DC} Strength check to escape).", "Once per short rest, a creature hit by a weapon with this material is restrained by sticky strands (DC {DC} Strength check to escape).", "Once per turn, a creature hit by a weapon with this material is restrained by sticky strands (DC {DC} Strength check to escape)."]],
    sense: ['Web-Sense', ["While equipped, you have advantage on checks to notice creatures touching the same surface as you within 10 ft.", "While equipped, you know the exact location of any creature touching the same surface as you within {FT} ft.", "While equipped, you know the exact location of any creature touching the same surface as you within {FT} ft."]] },
  { re: /snake|serpent|viper|cobra|python|yuan-ti|naga|asp\b|constrictor/i, label: 'Serpent',
    offense: ['Venom Fang', 'A weapon with this material deals +{P}d6 poison damage, and the target makes a Constitution save (DC {DC}) or is poisoned until the end of its next turn.'],
    defense: ['Shed Skin', ["While equipped, you have advantage on checks to escape a grapple.", "Once per long rest, when you would be grappled or restrained, you slip free automatically.", "Once per long rest, when you would be grappled or restrained, you slip free automatically."]],
    sense: ['Tongue-Taste', 'While equipped, you have advantage on checks to detect invisible creatures within 10 ft.'] },
  { re: /shark|fish|\beel\b|sahuagin|merrow|kraken|octopus|squid|whale|sea |sea$|tide|coral|kuo-toa|marid|water|dragon turtle|leviathan|deep/i, label: 'Creature of the Deep',
    vital: ['Water-Breathing', ["While equipped, you can hold your breath ten times as long as normal.", "While equipped, you can breathe underwater.", "While equipped, you can breathe underwater and have a swimming speed equal to your walking speed."]],
    move: ['Current-Rider', ["While equipped, your swimming speed equals your walking speed.", "While equipped, you have a swimming speed of {FT} ft and can't be pushed by water currents.", "While equipped, you have a swimming speed of {FT} ft and can't be pushed by water currents."]],
    offense: ['Blood in the Water', 'A weapon with this material deals +{P}d4 damage to creatures that are below half their hit points.'],
    sense: ['Deep-Sight', ["While equipped, you can see normally through murky water and have advantage on Perception checks in dim light.", "While equipped, you have darkvision out to {FT} ft and can see normally through murky water.", "While equipped, you have darkvision out to {FT} ft and can see normally through murky water."]] },
  { re: /red dragon|gold dragon|brass dragon|fire|flame|salamander|hell ?hound|magma|ember|cinder|phoenix|efreet|azer|lava|\bsun\b|sunfire/i, label: 'Fire-Born',
    defense: ['Flameproof', ["While equipped, you have advantage on saves against extreme heat, and fire damage you take is reduced by {P}.", "While equipped, you resist fire damage and ignore the effects of extreme heat.", "While equipped, you resist fire damage{IMM} and ignore the effects of extreme heat."]],
    offense: ['Searing', 'A weapon with this material deals +{P}d6 fire damage and ignites flammable objects it hits.'],
    vital: ['Inner Furnace', ["While equipped, you have advantage on saves against extreme cold.", "While equipped, you don't need warm clothing or fire to survive the cold.", "While equipped, you don't need warm clothing or fire to survive the cold, and once per long rest you can regain {P5} hit points as a bonus action."]] },
  { re: /white dragon|silver dragon|frost|ice|cold|yeti|winter|remorhaz|polar|glacial|snow|rime/i, label: 'Frost-Born',
    defense: ['Frostproof', ["While equipped, you have advantage on saves against extreme cold, and cold damage you take is reduced by {P}.", "While equipped, you resist cold damage and walk on ice and snow without slipping or slowing.", "While equipped, you resist cold damage{IMM} and walk on ice and snow without slipping or slowing."]],
    offense: ['Freezing', 'A weapon with this material deals +{P}d6 cold damage, and a hit reduces the target\'s speed by 10 ft until the end of its next turn.'] },
  { re: /blue dragon|bronze dragon|storm|lightning|thunder|behir|spark|djinni|air/i, label: 'Storm-Born',
    defense: ['Grounded', ["While equipped, lightning and thunder damage you take is reduced by {P}.", "While equipped, you resist lightning damage.", "While equipped, you resist lightning and thunder damage."]],
    offense: ['Thunderstrike', 'A weapon with this material deals +{P}d6 lightning damage. On a critical hit, the target is deafened until the end of its next turn.'],
    move: ['Wind-Step', ["While equipped, your speed increases by 5 ft.", "While equipped, your speed increases by 10 ft.", "While equipped, your speed increases by 10 ft and you can Dash as a bonus action once per short rest."]] },
  { re: /green dragon|black dragon|copper dragon|acid|ooze|pudding|jelly|slime|cube|oblex/i, label: 'Corrosive',
    defense: ['Acid-Proof', ["While equipped, acid damage you take is reduced by {P}, and your gear can't be corroded.", "While equipped, you resist acid damage and your gear can't be corroded.", "While equipped, you resist acid damage and your gear can't be corroded."]],
    offense: ['Dissolving', 'A weapon with this material deals +{P}d6 acid damage and lowers the target\'s AC by 1 until repaired.'] },
  { re: /dragon|wyvern|drake|wyrm|draconic/i, label: 'Draconic',
    defense: ['Dragon-Hide', ["While equipped, damage of the dragon's element that you take is reduced by {P}.", "While equipped, you resist one damage type of the dragon's element.", "Armor or a shield with this material gives +{B} AC and resistance to one damage type of the dragon's element."]],
    offense: ['Frightful Presence', ["Once per long rest, when you hit a creature with a weapon with this material, it makes a Wisdom save (DC {DC}) or is frightened of you until the end of your next turn.", "Once per long rest, when you hit with a weapon with this material, each enemy within 15 ft makes a Wisdom save (DC {DC}) or is frightened of you until the end of your next turn.", "Once per long rest, when you hit with a weapon with this material, each enemy within 30 ft makes a Wisdom save (DC {DC}) or is frightened of you for 1 minute."]],
    vital: ['Dragon-Blood', ["While equipped, you have advantage on saves against being frightened.", "While equipped, you have advantage on saves against being frightened and +{P2} maximum hit points.", "While equipped, you have advantage on saves against being frightened and +{P5} maximum hit points."]],
    sense: ['Dragon-Sight', ["While equipped, you have darkvision out to 30 ft.", "While equipped, you have darkvision out to {FT} ft.", "While equipped, you have blindsight out to 10 ft and darkvision out to {FT} ft."]] },
  { re: /ghost|wraith|specter|spectre|banshee|shadow|shade|wight|poltergeist|phantom|allip/i, label: 'Incorporeal',
    move: ['Phasing', ["While equipped, you have advantage on checks to escape grapples and to squeeze through tight spaces.", "Once per long rest, you can move through creatures as if they were difficult terrain for 1 minute.", "Once per long rest, you can move through creatures and objects as difficult terrain for 1 minute. You take 1d10 force damage if you end your turn inside an object."]],
    defense: ['Ghostly', ["While equipped, necrotic damage you take is reduced by {P}.", "While equipped, you resist necrotic damage.", "While equipped, you resist necrotic damage and nonmagical attacks against you have disadvantage in dim light or darkness."]],
    offense: ['Chilling Touch', 'A weapon with this material deals +{P}d6 necrotic damage, and the target can\'t regain hit points until the start of your next turn.'],
    vital: ['Wail', ["Once per long rest, one creature of your choice within 30 ft makes a Wisdom save (DC {DC}) or is frightened until the end of your next turn.", "Once per long rest, each creature of your choice within 15 ft makes a Wisdom save (DC {DC}) or is frightened until the end of your next turn.", "Once per long rest, each creature of your choice within 30 ft makes a Wisdom save (DC {DC}) or is frightened until the end of your next turn."]] },
  { re: /vampire|blood|lamia|stirge|leech|mosquito/i, label: 'Blood-Drinker',
    offense: ['Life Drain', 'When you hit with a weapon with this material, you regain hit points equal to half the extra {P}d4 necrotic damage it deals.'],
    vital: ['Thirsting Vigor', 'While equipped, you regain {P} extra hit points whenever you spend a Hit Die.'] },
  { re: /zombie|skeleton|ghoul|ghast|mummy|lich|undead|revenant|bone|corpse|grave|death/i, label: 'Undying',
    vital: ['Undying', ["While equipped, you have advantage on death saving throws.", "Once per long rest, when you drop to 0 hit points but aren't killed outright, roll a d20: on 10 or higher you drop to 1 hit point instead.", "Once per long rest, when you drop to 0 hit points but aren't killed outright, you drop to 1 hit point instead."]],
    defense: ['Grave-Cold', ["While equipped, you have advantage on saves against disease and poison.", "While equipped, you resist poison damage and have advantage on saves against disease.", "While equipped, you resist necrotic and poison damage and have advantage on saves against disease."]],
    offense: ['Paralyzing', ["A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or has its speed halved until the end of its next turn.", "Once per short rest, a creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is paralyzed until the end of its next turn. Elves and undead are immune.", "A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is paralyzed until the end of its next turn. Elves and undead are immune."]] },
  { re: /angel|deva|planetar|solar|celestial|unicorn|pegasus|couatl|ki-rin|seraph|holy|halo|empyrean|choir/i, label: 'Celestial',
    vital: ['Healing Touch', 'Once per long rest, as an action, you touch a creature and restore {P5} hit points and end one disease or poison.'],
    offense: ['Radiant', 'A weapon with this material deals +{P}d6 radiant damage, doubled against fiends and undead.'],
    defense: ['Warded', ["While equipped, you have advantage on saves against being frightened.", "While equipped, you have advantage on saves against being charmed or frightened.", "While equipped, you have advantage on saves against being charmed or frightened and resist radiant damage."]],
    sense: ['Truesight Glimpse', ["Once per long rest, you can see invisible creatures within 10 ft for 1 minute.", "Once per long rest, you can see invisible creatures within 30 ft for 1 minute.", "Once per long rest, you gain truesight out to 30 ft for 1 minute."]] },
  { re: /demon|devil|fiend|imp\b|hell|abyss|infernal|quasit|succubus|incubus|balor|pit fiend|nalfeshnee|hezrou|vrock/i, label: 'Fiendish',
    defense: ['Fiend-Hide', ["While equipped, fire damage you take is reduced by {P}.", "While equipped, you resist fire damage.", "While equipped, you resist fire and poison damage and have advantage on saves against spells cast by fiends."]],
    offense: ['Hellish', 'A weapon with this material deals +{P}d6 fire or necrotic damage (your choice).'],
    sense: ['Devil\'s Sight', ["While equipped, you have darkvision out to 30 ft.", "While equipped, you can see normally in magical and nonmagical darkness out to 10 ft.", "While equipped, you can see normally in magical and nonmagical darkness out to {FT} ft."]] },
  { re: /mind flayer|illithid|beholder|aboleth|brain|psionic|psychic|intellect|gith|nothic|elder brain/i, label: 'Psionic',
    mind: ['Telepathy', ["While equipped, you can sense the surface emotions of a creature you touch.", "Once per short rest, you can speak telepathically with one creature you can see within 30 ft for 1 minute.", "While equipped, you can speak telepathically with any creature within {FT} ft that shares a language with you."]],
    offense: ['Mind Spike', 'A weapon with this material deals +{P}d6 psychic damage, and the target has disadvantage on its next Intelligence or Wisdom save before the end of your next turn.'],
    sense: ['Thought-Sight', ["Once per long rest, you learn the current emotion of one creature you can see (Wisdom save DC {DC} negates).", "Once per long rest, you can read the surface thoughts of one creature you can see for 1 minute (Wisdom save DC {DC} negates).", "Once per long rest, you can read the surface thoughts of one creature you can see for 1 minute (Wisdom save DC {DC} negates)."]] },
  { re: /displacer/i, label: 'Displacement',
    defense: ['Displacement', ["While equipped, the first attack made against you in each combat has disadvantage.", "Once per short rest, when a creature attacks you, you can use your reaction to give that attack disadvantage.", "While equipped, attacks against you have disadvantage until you are hit; the effect returns at the start of your next turn."]] },
  { re: /blink|phase|teleport|hidden path/i, label: 'Blinking',
    move: ['Blink-Step', ["Once per long rest, as a bonus action, you teleport up to 10 ft to a space you can see.", "As a bonus action {P} times per long rest, you teleport up to {FT} ft to a space you can see.", "As a bonus action {P} times per long rest, you teleport up to {FT} ft to a space you can see."]] },
  { re: /mimic|doppelganger|shapechang|changeling|chameleon|kenku/i, label: 'Shapechanger',
    defense: ['Mimicry', 'While equipped, you can make the item look like any ordinary object of similar size, and you have advantage on checks to disguise yourself.'],
    mind: ['Borrowed Voice', 'While equipped, you can perfectly mimic any voice or sound you have heard.'] },
  { re: /boar|rhino|bull|minotaur|bison|ram\b|goat|charg|bulette|mammoth|elephant/i, label: 'Charging Beast',
    offense: ['Gore', 'If you move at least 20 ft straight toward a target and then hit it with a weapon with this material, it takes +{P}d6 damage and makes a Strength save (DC {DC}) or is knocked prone.'],
    defense: ['Relentless', ["While equipped, you have advantage on death saving throws.", "Once per long rest, when you take damage that would drop you to 0 hit points, you drop to 1 instead.", "Once per long rest, when you take damage that would drop you to 0 hit points, you drop to 1 instead."]] },
  { re: /\bcat\b|lion|tiger|panther|leopard|lynx|jaguar|sabre|saber|cougar|displacer/i, label: 'Stalking Cat',
    offense: ['Pounce', ["If you move at least 20 ft toward a creature and hit it with a weapon with this material, it makes a Strength save (DC {DC}) or is knocked prone.", "If you move at least 20 ft toward a creature and hit it with a weapon with this material, it makes a Strength save (DC {DC}) or is knocked prone, and you can make one more attack as a bonus action.", "If you move at least 20 ft toward a creature and hit it with a weapon with this material, it makes a Strength save (DC {DC}) or is knocked prone, and you can make one more attack as a bonus action."]],
    move: ['Soft Step', 'While equipped, you have advantage on Dexterity (Stealth) checks and take half damage from falls.'],
    sense: ['Night Eyes', 'While equipped, you have darkvision out to {FT} ft.'] },
  { re: /scorpion|wasp|bee\b|hornet|centipede|crawler|ankheg|insect|beetle|mantis/i, label: 'Venomous Hunter',
    offense: ['Paralytic Venom', ["A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is poisoned until the end of its next turn.", "A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is poisoned for 1 minute.", "A creature hit by a weapon with this material makes a Constitution save (DC {DC}) or is poisoned for 1 minute; while poisoned this way it is also paralyzed if it fails by 5 or more."]],
    defense: ['Chitin Plating', 'Armor or a shield with this material gives +{B} AC against ranged attacks.'] },
  { re: /mole|bulette|purple worm|umber hulk|burrow|tunnel|xorn|rock crawler|earth|galeb|dao/i, label: 'Burrower',
    sense: ['Tremorsense', ["While equipped, you have advantage on checks to notice creatures moving on the ground within 30 ft.", "While equipped, you have tremorsense out to 10 ft while you touch the ground.", "While equipped, you have tremorsense out to {B0} ft while you touch the ground."]],
    move: ['Earth-Glide', ["While equipped, rubble and loose sand don't slow you.", "While equipped, you can burrow through loose earth and sand at half your walking speed.", "While equipped, you can burrow through loose earth and sand at half your walking speed."]] },
  { re: /turtle|tortoise|crab|crustac|shell|armadillo|ankylo/i, label: 'Shelled',
    defense: ['Shell Guard', 'While you wear armor or hold a shield with this material, you can use your reaction to gain +{P} AC against one attack, and you have advantage on saves against being pushed or knocked prone.'] },
  { re: /horse|elk|deer|stag|antelope|camel|axe beak|gazelle/i, label: 'Swift',
    move: ['Fleet-Footed', ["While equipped, your walking speed increases by 5 ft.", "While equipped, your walking speed increases by {MV} ft and difficult terrain costs you no extra movement on open ground.", "While equipped, your walking speed increases by {MV} ft and difficult terrain costs you no extra movement on open ground."]] },
  { re: /frog|toad|bullywug|grung|kangaroo|grasshopper/i, label: 'Leaper',
    move: ['Great Leap', ["While equipped, your jump distances are doubled.", "While equipped, your long jump is up to {FT} ft and your high jump up to {HJ} ft, with or without a running start.", "While equipped, your long jump is up to {FT} ft and your high jump up to {HJ} ft, with or without a running start."]] },
  { re: /\bape\b|gorilla|bear|giant|ogre|troll|owlbear|sasquatch|baboon|monkey/i, label: 'Mighty',
    offense: ['Crushing Blow', 'A weapon with this material deals +{P}d4 damage, and on a hit you can push the target 5 ft away from you.'],
    vital: ['Brute Strength', ["While equipped, you have advantage on Strength (Athletics) checks to grapple.", "While equipped, you count as one size larger for carrying capacity and have advantage on Strength (Athletics) checks to climb or grapple.", "While equipped, you count as one size larger for carrying capacity and have advantage on Strength (Athletics) checks to climb or grapple."]],
    defense: ['Thick Hide', 'Armor or a shield with this material gives +{B} AC.'] },
  { re: /golem|construct|modron|clockwork|animated|automaton/i, label: 'Construct',
    defense: ['Unyielding', ["While equipped, you have advantage on saves against being charmed or poisoned.", "While equipped, you can't be poisoned, and you have advantage on saves against being charmed or stunned.", "While equipped, you can't be charmed or poisoned, and you have advantage on saves against being stunned."]] },
  { re: /fey|faerie|fairy|pixie|sprite|dryad|satyr|hag|eladrin|quickling|redcap|moon|twilight|wisp/i, label: 'Fey',
    mind: ['Fey Charm', ["Once per long rest, you have advantage on one Charisma check against a creature that can see you.", "Once per long rest, as an action, one creature within 30 ft makes a Wisdom save (DC {DC}) or is charmed by you for 1 minute.", "Once per long rest, as an action, one creature within 30 ft makes a Wisdom save (DC {DC}) or is charmed by you for 1 minute."]],
    move: ['Fey Step', ["Once per long rest, as a bonus action, you teleport up to 10 ft to a space you can see.", "Once per long rest, as a bonus action, you teleport up to 30 ft to a space you can see.", "Once per short rest, as a bonus action, you teleport up to 30 ft to a space you can see."]],
    defense: ['Glamoured', ["While equipped, you have advantage on saves against being charmed.", "While equipped, you have advantage on saves against being charmed and magic can't put you to sleep.", "While equipped, you have advantage on saves against being charmed and magic can't put you to sleep."]] },
  { re: /chaos|slaad|wild|paradox|entropy|unmade/i, label: 'Chaotic',
    mind: ['Wild Surge', 'Once per long rest, when you cast a spell or hit with this item, roll on the wild magic table; you may keep or ignore the result.'] },
  { re: /void|null|absence|hollow|empty|silence|star spawn|far /i, label: 'Void-Touched',
    defense: ['Null Ward', ["While equipped, you gain +1 to saving throws against spells.", "While equipped, you have advantage on saving throws against spells of 3rd level or lower.", "While equipped, you have advantage on saves against spells and resist force damage."]],
    offense: ['Unmaking', ["A weapon with this material deals +{P}d4 force damage.", "A weapon with this material deals +{P}d6 force damage.", "A weapon with this material deals +{P}d6 force damage and ignores resistance to it."]] },
  // creatures of the old tales, for the parts that had only a plain trait (original wording, inspired by fantasy stories)
  { re: /\bdrow\b|duergar|derro|grimlock|svirfneblin|deep gnome|underdark|choldrith|kuo-toa/i, label: 'Deep-Dweller',
    sense: ['Deep Sight', ["While equipped, you have darkvision out to 30 ft (or 30 ft more if you have it).", "While equipped, you have darkvision out to 60 ft (or 60 ft more if you have it).", "While equipped, you see in magical darkness out to 60 ft."]],
    defense: ['Stone-Patient', 'While equipped, you have advantage on saves against being charmed, and on Constitution saves against poison.'],
    offense: ['Underdark Venom', 'A weapon with this material can be coated once per long rest: the next hit forces a Constitution save (DC {DC}) or the target falls unconscious for 1 minute.'] },
  { re: /goblin|hobgoblin|bugbear|kobold|gnoll|grick|norker|nilbog/i, label: 'Cunning Raider',
    sense: ['Ambusher\'s Eye', 'While equipped, you have +{B} to Perception and can\'t be surprised by creatures that are hiding.'],
    move: ['Slip Away', 'While equipped, you can Disengage or Hide as a bonus action once per short rest.'],
    offense: ['Dirty Fighting', 'A weapon with this material deals +{P}d4 damage to a creature that is prone, restrained, or flanked.'] },
  { re: /gargoyle|golem|stone guardian|flying sword|animated|helmed horror|caryatid/i, label: 'Sleepless Guardian',
    defense: ['Stone Sleep', ["While equipped, you can stay perfectly still: you look like a statue or object until you move.", "While equipped, you look like a statue while still, and resist damage from nonmagical attacks while you don\'t move.", "While equipped, you look like a statue while still, resist nonmagical damage, and need no sleep."]],
    sense: ['Watchful Stone', 'While equipped, you don\'t need to sleep to finish a long rest, and you stay aware the whole time.'] },
  { re: /crocodile|allosaurus|tyrannosaur|dimetrodon|brontosaur|ankylosaur|triceratops|velociraptor|deinonychus|dinosaur|raptor|saurus/i, label: 'Primeval Beast',
    offense: ['Death Roll', 'A weapon with this material: once per short rest, after you hit a creature you are grappling, deal +{P}d8 damage and knock it prone.'],
    defense: ['Thunder Hide', 'Armor or a shield with this material gives +{B} AC against creatures larger than you.'],
    move: ['Earthshaker Stride', 'While equipped, difficult terrain from mud, sand, or rubble doesn\'t slow you.'] },
  { re: /cloaker|darkmantle|choker|chuul|piercer|lurker|trapper|gibbering|mouther/i, label: 'Ambush Lurker',
    offense: ['From Above', 'A weapon with this material deals +{P}d6 damage on the first attack of a fight against a creature that hasn\'t seen you.'],
    defense: ['Shroud of the Ceiling', 'While equipped, you have advantage on Stealth checks while clinging to a wall or ceiling, and you can climb at half speed.'] },
  { re: /einherjar|valkyrie|asura|champion|warlord|knight|paladin|hero/i, label: 'Undying Warrior',
    vital: ['Battle-Born', ["While equipped, you gain {P2} temporary hit points at the start of each fight.", "While equipped, you gain {P5} temporary hit points at the start of each fight.", "While equipped, you gain {P5} temporary hit points at the start of each fight, and once per long rest you stand back up at 1 hit point when you would die."]],
    offense: ['Last Stand', 'A weapon with this material deals +{P}d6 damage while you are below half your hit points.'] },
  { re: /dream eater|baku|night hag|nightmare|dreamer|sandman|meenlock/i, label: 'Dream-Eater',
    mind: ['Nightmare Ward', 'While equipped, you can\'t be frightened while asleep, and you wake from magical sleep after one round.'],
    offense: ['Waking Dread', 'A weapon with this material deals +{P}d4 psychic damage, doubled against sleeping or frightened creatures.'] },
  { re: /behemoth|dreadnought|colossus|titan|tarrasque|leviathan|zaratan/i, label: 'Colossal',
    defense: ['Titan\'s Hide', ["Armor or a shield with this material gives +{B} AC.", "Armor or a shield with this material gives +{B} AC, and critical hits against you are normal hits once per long rest.", "Armor or a shield with this material gives +{B} AC, and critical hits against you are normal hits."]],
    vital: ['World-Heart', 'While equipped, you gain +{P5} maximum hit points.'] },
  { re: /cyclops|oracle|seer|prophet|augur|sibyl|norn/i, label: 'Farseer',
    sense: ['Glimpse of Fate', 'While equipped, once per long rest, roll a d20 and keep the result: you can swap it for any one roll you or an ally within 30 ft makes.'],
    mind: ['Foretold', 'While equipped, you can\'t be surprised, and you have +{B} to initiative.'] },
  { re: /bennu|alkonost|sirin|firebird|phoenix|simurgh|thunderbird|sunbird/i, label: 'Bird of Legend',
    vital: ['Ember of Return', 'While equipped, once per long rest, when you drop to 0 hit points, you return with {P5} hit points in a burst of warm light.'],
    move: ['Sky-Song', 'While equipped, you can glide 3 ft forward for every 1 ft you fall, and you never take falling damage.'] },
  { re: /dullahan|headless|cihuateteo|banshee|bodak|soul tormentor|death/i, label: 'Harbinger',
    offense: ['Death\'s Name', 'A weapon with this material: once per long rest, name a creature you can see; your next hit on it deals +{P}d10 necrotic damage.'],
    sense: ['Doom-Sight', 'While equipped, you know when a creature within 30 ft is below a quarter of its hit points.'] },
  { re: /wolf|warg|worg|hound|jackal|coyote/i, label: 'Pack Hunter',
    offense: ['Pack Tactics', 'A weapon with this material deals +{P}d4 damage when an ally is within 5 ft of the target.'],
    sense: ['Scent of Prey', 'While equipped, you can track by scent and have advantage on Survival checks to follow a trail.'] },
  { re: /bear|owlbear|boar|bull|bison|aurochs|mammoth|rhino/i, label: 'Wild Strength',
    offense: ['Crushing Charge', 'A weapon with this material deals +{P}d6 damage when you charge at least 20 ft first, and the target must make a Strength save (DC {DC}) or be knocked prone.'],
    vital: ['Hibernal Heart', 'While equipped, a long rest also ends one level of exhaustion and restores {P2} extra hit points.'] },
  { re: /spider|ettercap|drider|phase spider|aranea/i, label: 'Web-Weaver',
    move: ['Spider-Walk', 'While equipped, you can climb walls and ceilings at half your speed, hands free.'],
    offense: ['Paralysing Bite', 'A weapon with this material forces a Constitution save (DC {DC}) on a critical hit, or the target is paralysed until the end of its next turn.'] },
  { re: /serpent|snake|naga|basilisk|wyrmling|lindworm|jormun/i, label: 'Old Serpent',
    mind: ['Serpent\'s Gaze', 'While equipped, once per short rest, a creature that meets your eyes makes a Wisdom save (DC {DC}) or is charmed until the end of its next turn.'],
    vital: ['Shed Skin', 'While equipped, once per long rest, shed your skin to end one disease, poison, or curse on yourself.'] },
  // more families (campaign owner's request for more traits), only for creatures nothing above already covers;
  // they match the creature's own name, never words in its description (byName)
  { re: /\borc|orog|tanarukk|goblin|hobgoblin|bugbear|gnoll|ogre|oni\b/i, label: 'Warband', byName: true,
    offense: ['Blood Fury', 'A weapon with this material: once per short rest, when you drop below half your hit points, your next hit deals +{P}d8 damage.'],
    vital: ['War-Hardened', 'While equipped, once per long rest, when you would drop to 0 hit points, you drop to 1 instead.'],
    defense: ['Scarred Hide', 'While equipped, slashing damage you take is reduced by {B}.'],
    sense: ['War-Cry Ears', 'While equipped, you can\'t be surprised while an ally within 30 ft is awake.'] },
  { re: /lizardfolk|kobold|troglodyte|grung|bullywug|frog|toad|newt|salamander|lizard|tortle|turtle/i, label: 'Cold-Blooded', byName: true,
    vital: ['Cold Blood', 'While equipped, you can hold your breath for {P5} minutes and have advantage on saves against poison.'],
    defense: ['Basking Scales', 'While equipped, in bright sunlight you gain +{B} AC.'],
    move: ['Amphibious', 'While equipped, you have a swimming speed equal to your walking speed and can breathe air and water.'],
    offense: ['Tail Sweep', 'A weapon with this material: once per short rest, on a hit, the target makes a Dexterity save (DC {DC}) or is knocked prone.'] },
  { re: /myconid|fung|spore|shrieker|mold|mould|mushroom|gas spore|violet/i, label: 'Sporebound', byName: true,
    offense: ['Spore Burst', 'A weapon with this material: once per short rest, on a hit, a puff of spores poisons the target (Constitution save DC {DC}) until the end of its next turn.'],
    mind: ['Rapport Spores', 'While equipped, once per long rest, you and up to {B} willing creatures within 30 ft can speak mind to mind for 1 hour.'],
    vital: ['Rot-Proof', 'While equipped, you have advantage on saves against disease and poison.'] },
  { re: /treant|blight|shambling|woad|dryad|leshy|shrub|awakened tree|root|thorn|vine|huldra|vegepygmy/i, label: 'Green Growth', byName: true,
    defense: ['Barkskin', 'While equipped, you gain +{B} AC while you wear no metal armor, but fire damage you take is increased by 1.'],
    vital: ['Sap-Blood', 'While equipped, standing on soil or grass at the start of your turn heals you {P} hit points (only while you have at least 1).'],
    offense: ['Thorn-Lashed', 'A weapon with this material deals +{P}d4 piercing damage, and the target\'s speed drops by 10 ft until the end of its next turn.'],
    move: ['Root-Step', 'While equipped, difficult terrain from plants doesn\'t slow you.'] },
  { re: /aboleth|ulitharid|neothelid|intellect devourer|mind ?flayer|illithid|grell|gauth|beholder|spectator|nothic|mindwitness|star spawn/i, label: 'Far-Mind', byName: true,
    mind: ['Alien Thought', 'While equipped, your thoughts can\'t be read and you have advantage on saves against being charmed or frightened.'],
    sense: ['Mind-Sense', 'While equipped, you sense creatures with an Intelligence of 4 or more within {FT} ft, though not where exactly.'],
    offense: ['Psychic Lash', 'A weapon with this material deals +{P}d6 psychic damage.'] },
  { re: /\w+loth\b|yugoloth|abishai|erinyes|narzugon|merregon|orthon|amnizu|nupperibo|spined|barbed|bearded|horned|chain|lemure|manes|dretch|chasme|glabrezu|goristro|bulezau|barlgura|alkilith|armanite|molydeus|nabassu|wastrilith|yochlol|sibriex|rutterkin|maurezhi|cambion|draegloth/i, label: 'Lower Planes', byName: true,
    offense: ['Hellbrand', 'A weapon with this material deals +{P}d6 fire damage, and a creature it hits can\'t become invisible until the end of its next turn.'],
    defense: ['Brimstone Hide', 'While equipped, fire and poison damage you take is reduced by {P}.'],
    mind: ['Contract-Sense', 'While equipped, you know when someone speaking to you is breaking a promise they made.'],
    vital: ['Infernal Vigor', 'While equipped, once per long rest, regain {P5} hit points when you reduce a hostile creature to 0 hit points.'] },
  { re: /\bhag\b|night hag|sea hag|green hag|annis|krampus|baba|chicken-legged/i, label: 'Hag-Craft', byName: true,
    mind: ['Hag\'s Bargain', 'While equipped, once per long rest, reroll a failed save; you then have disadvantage on your next ability check.'],
    sense: ['Hag-Eye', 'While equipped, once per long rest, you can see through a small token you left somewhere for 10 minutes.'],
    offense: ['Curse-Mark', 'A weapon with this material: on a hit, the target has −{B} on its next save before the end of your next turn.'] },
  { re: /siren|rusalka|selkie|kelpie|each-uisge|nixie|merfolk|mermaid|merrow|lorelei|vodyanoy|ichthyocentaur|hippocamp/i, label: 'Siren-Song', byName: true,
    mind: ['Lure-Voice', 'While equipped, you have advantage on Charisma (Persuasion) checks while you sing, and once per long rest can cast Charm Person (DC {DC}).'],
    move: ['Tide-Swimmer', 'While equipped, you swim at your walking speed + {MV} ft.'],
    vital: ['Sea-Breath', 'While equipped, you can breathe water.'] },
  { re: /wendigo|skinwalker|aswang|manananggal|pishacha|vargouille|berbalang|ammit|devourer|taotie|ghoul-?eater|hunger/i, label: 'Hungering', byName: true,
    offense: ['Ravening', 'A weapon with this material deals +{P}d6 damage to a creature below half its hit points.'],
    vital: ['Eat to Heal', 'While equipped, once per short rest, when you reduce a creature to 0 hit points, regain {P2} hit points.'],
    move: ['Stalking Gait', 'While equipped, you move silently: advantage on Dexterity (Stealth) checks while you move at half speed.'] },
  { re: /rakshasa|kitsune|huli jing|tengu|kappa|yaksha|qilin|div\b|ifrit|djinn|efreet|marid|dao/i, label: 'Spirit of Legend', byName: true,
    mind: ['Spell-Shrug', 'While equipped, you have advantage on saves against spells of level {SL} or lower.'],
    move: ['Fox-Fire Step', 'While equipped, once per short rest, teleport 15 ft to a spot you can see in dim light or darkness.'],
    offense: ['Trickster\'s Strike', 'A weapon with this material deals +{P}d6 force damage to a creature that hasn\'t yet acted in this fight.'] },
  { re: /sphinx|lamassu|shedu|androsphinx|gynosphinx|watcher|marut|law-beast|throne/i, label: 'Riddle-Keeper', byName: true,
    mind: ['Riddle-Lore', 'While equipped, you gain +{B} to Intelligence checks and know when you hear a lie told in a language you understand (once per long rest).'],
    sense: ['Truth-Sight', 'While equipped, you see through illusions within 10 ft.'],
    defense: ['Warded Mane', 'While equipped, you have advantage on saves against being banished or teleported against your will.'] },
  { re: /mephit|wisp|weird|elemental|glimmer|ember|smoke|steam|mud|magma|ooze/i, label: 'Elemental Mote', byName: true,
    offense: ['Elemental Burst', 'A weapon with this material: once per short rest, on a hit, burst for +{P}d8 damage of its element to the target and each creature within 5 ft of it.'],
    defense: ['Element-Proof', 'While equipped, damage of its element that you take is reduced by {P}.'],
    mind: ['Mote-Speech', 'While equipped, you can speak with elementals and have advantage on Charisma checks with them.'] },
  { re: /swarm|rats?\b|ravens?\b|stirge|mite|xvart|kruthik|myrmekes|ant\b|bee\b|wasp|locust/i, label: 'Swarming', byName: true,
    offense: ['Swarm-Bite', 'A weapon with this material deals +{P} damage for each other creature within 5 ft of the target, up to +{P5}.'],
    move: ['Scatter', 'While equipped, once per short rest, when you are hit, you break into a cloud of tiny shapes and take half damage.'],
    sense: ['Hive-Sense', 'While equipped, you can\'t be flanked while an ally is within 10 ft.'] },
  { re: /tarrasque|tarasque|zaratan|world fish|charybdis|scylla|bunyip|taniwha|umibozu|ninki|mokele|makara|cipactli|jiaolong|humbaba|bulette|remorhaz|behir|catoblepas|gorgon|chimera|manticore|hydra|froghemoth|otyugh|roper|cloaker|chuul|morkoth|balhannoth|banderhobb/i, label: 'Monstrous', byName: true,
    offense: ['Monster-Maw', 'A weapon with this material deals +{P}d6 damage on a critical hit, and you score a critical hit on a 19 or 20.'],
    defense: ['Monster-Hide', 'While equipped, bludgeoning, piercing, and slashing damage you take is reduced by {B}.'],
    vital: ['Monster-Heart', 'While equipped, your hit point maximum increases by {P5}.'],
    sense: ['Tremor-Sense', 'While equipped, you sense movement through the ground within {FT} ft.'] },
  { re: /\bhut\b|construct|engine|wheel|jailer|steel predator|clockwork|golem/i, label: 'Made Thing', byName: true,
    defense: ['Riveted', 'While equipped, you have advantage on saves against being poisoned, and critical hits against you become normal hits once per long rest.'],
    offense: ['Piston Blow', 'A weapon with this material pushes a target it hits 5 ft away from you (no save), once per turn.'] },
  { re: /void|empt|nothing|negation|silen|unnamed|lightless|unborn|last light|zero|horizon|warp|timeworm|shifting|gravity|balance stalker|oath-eater|contract scribe|first watcher|returning|spin wheel|godfall/i, label: 'Of the Deep Dark', byName: true,
    mind: ['Hollow Mind', 'While equipped, you are immune to being charmed while you can see no light.'],
    offense: ['Unmaking', 'A weapon with this material deals +{P}d6 force damage and ignores resistance to force damage.'],
    defense: ['Null-Skin', 'While equipped, once per long rest, when a spell targets only you, roll a d20: on 20 − {P} or higher, it fails.'],
    move: ['Fold-Step', 'While equipped, once per long rest, step through a fold in space to a spot you can see within {FT} ft.'] },
  { re: /crab|shark|squid|crocodile|sea horse|plesiosaur|whale|orca|ox\b|mule|horse|camel|pteranodon|quetzalcoatl|stegosaur|steeder|flail snail|flumph|ahuizotl|kuo-toa|sahuagin/i, label: 'Hardy Beast', byName: true,
    vital: ['Beast\'s Vigor', 'While equipped, you have advantage on Constitution saves against exhaustion and gain {P} temporary hit points after a short rest.'],
    defense: ['Tough Plates', 'While equipped, you gain +1 AC against attacks from creatures larger than you.'],
    offense: ['Clamping Grip', 'A weapon with this material: on a critical hit, the target is grappled (escape DC {DC}).'] }
];

// glands and sacs that hold something other than venom
var GLANDS = [
  [/breath|flame|fire|brimstone|magma|ember/i, 'Fire Gland', 'A weapon with this material: once per short rest, on a hit, a gout of flame deals +{P}d8 fire damage to the target and each creature within 5 ft of it (Dexterity save DC {DC} for half).'],
  [/frost|cold|ice|rime/i, 'Frost Gland', 'A weapon with this material: once per short rest, on a hit, the target is coated in rime: +{P}d8 cold damage and its speed is halved until the end of its next turn.'],
  [/lightning|spark|storm|shock/i, 'Spark Gland', 'A weapon with this material: once per short rest, on a hit, lightning arcs to a second creature within 10 ft for {P}d8 lightning damage.'],
  [/ink/i, 'Ink Cloud', 'While equipped, once per short rest, as a reaction to being hit, release a cloud of ink: the area within 10 ft of you is heavily obscured until the end of your next turn.'],
  [/spore/i, 'Spore Cloud', 'While equipped, once per long rest, release spores: creatures within 10 ft make a Constitution save (DC {DC}) or are poisoned for 1 minute.'],
  [/acid|bile/i, 'Acid Gland', 'A weapon with this material deals +{P}d4 acid damage, and a nonmagical shield or armor it hits loses 1 AC until repaired (once per fight).'],
  [/silk|web/i, 'Silk Gland', 'While equipped, once per short rest, shoot a line of sticky silk: a creature within 30 ft makes a Dexterity save (DC {DC}) or is restrained until it escapes.'],
  [/musk|scent/i, 'Musk Gland', 'While equipped, once per long rest, release a stench: creatures within 10 ft make a Constitution save (DC {DC}) or are poisoned until the end of their next turn.'],
  [/song|voice|siren/i, 'Song Sac', 'While equipped, once per long rest, sing: one creature that hears you makes a Wisdom save (DC {DC}) or is charmed for 1 minute.'],
  [/light|glow|lumin/i, 'Glow Sac', 'While equipped, you shed bright light for 20 ft when you choose, and once per short rest can flash it: creatures within 10 ft are blinded until the end of their next turn (Constitution save DC {DC}).']
];

// generic effects per part when no ability matches
var GENERIC = {
  eye: ['Keen Eye', 'While equipped, you gain +{B} to Wisdom (Perception) checks that rely on sight.'],
  ear: ['Keen Ear', ["While equipped, you gain +{B} to Wisdom (Perception) checks that rely on hearing.", "While equipped, you gain +{B} to Wisdom (Perception) checks that rely on hearing and can't be surprised while awake.", "While equipped, you gain +{B} to Wisdom (Perception) checks that rely on hearing and can't be surprised while awake."]],
  brain: ['Sharp Mind', 'While equipped, you gain +{B} to Intelligence checks and saves against being charmed.'],
  fang: ['Rending Bite', 'A weapon with this material deals +{P}d4 piercing damage on a critical hit and bites deeper: the target bleeds for 1d4 at the start of its next turn.'],
  claw: ['Rending Claw', 'A weapon with this material deals +{P}d4 slashing damage to creatures that aren\'t wearing armor.'],
  horn: ['Goring', 'A weapon with this material deals +{P}d4 damage when you charge at least 10 ft before attacking.'],
  venom: ['Toxic', 'A weapon coated with this material deals +{P}d4 poison damage (Constitution save DC {DC} for half).'],
  tail: ['Lashing', 'A weapon with this material has reach +5 ft once per turn.'],
  wing: ['Featherfall', 'While equipped, you fall slowly enough to take no falling damage from {FT} ft or less.'],
  leg: ['Sure-Footed', 'While equipped, your speed increases by 5 ft and you have advantage on saves against being knocked prone.'],
  hide: ['Weathered', ["While equipped, you have advantage on saves against one kind of extreme weather (heat or cold, chosen when crafted).", "While equipped, you ignore the effects of one kind of extreme weather (heat or cold, chosen when crafted).", "While equipped, you ignore the effects of extreme heat and cold and gain +{B} to Constitution saves against exhaustion."]],
  scale: ['Hardened Scales', 'Armor or a shield with this material gives +{B} AC against one damage type of your choice (chosen when crafted).'],
  bone: ['Bone-Strong', ["Items with this material have advantage on checks to avoid being Damaged.", "Items with this material are hard to break: they can't be Damaged by nonmagical means, and you have +{B} to saves against being pushed.", "Items with this material are hard to break: they can't be Damaged by nonmagical means, and you have +{B} to saves against being pushed."]],
  heart: ['Stout Heart', ["While equipped, you gain +{P2} maximum hit points.", "While equipped, you gain +{P2} maximum hit points.", "While equipped, you gain +{P5} maximum hit points."]],
  blood: ['Vital Blood', 'Potions and salves made with this material restore +{P} extra hit points.'],
  organ: ['Rendered', 'Potions and salves made with this material last twice as long; worn items keep you warm and dry.'],
  silk: ['Binding Strands', 'Items with this material can bind or snare: once per short rest, a creature you hit is restrained until it uses an action to break free (DC {DC}).'],
  essence: ['Living Essence', 'Items with this material can hold a charge: once per long rest, you regain one expended spell slot of level {SL} or lower.'],
  egg: ['Potential', 'Items with this material grow with you: the first time you finish a long rest while wearing it at a new character level, you gain {P} temporary hit points that last until your next long rest.']
};

var PLANTS = [
  [/silverleaf|heal|mint|bloom|lotus|life|sage|chamomile|aloe|balm|willow/i, 'Healing Herb', 'Potions and food made with it restore +{P} hit points, and worn charms of it give advantage on saves against disease.'],
  [/bane|night|shade|death|toad|hemlock|wolfsbane|nightshade|poison|rot|mushroom|fung|spore|cap\b/i, 'Toxic Plant', 'Poisons made with it deal +{P}d4 poison damage; a weapon coated with it poisons on a failed DC {DC} Constitution save.'],
  [/oak|iron|ironwood|stone|thorn|bark|briar|blackthorn|ash/i, 'Hardwood', 'Weapons and shields made with it can\'t be Damaged by nonmagical means. Thorned versions deal 1d4 piercing damage to creatures that grapple you.'],
  [/sun|fire|ember|pepper|flame|ash/i, 'Warming Plant', 'While carried or eaten, you ignore extreme cold and have advantage on saves against exhaustion from cold.'],
  [/frost|winter|ice|snow|cold/i, 'Frost Plant', 'While carried or eaten, you ignore extreme heat for 8 hours.'],
  [/dream|moon|poppy|sleep|lull|calm|lavender/i, 'Soporific Plant', 'Brewed or burned, a creature that breathes it makes a Constitution save (DC {DC}) or falls asleep for 1 minute.'],
  [/sap|resin|amber|gum|pitch/i, 'Sticky Resin', 'Seals and binds: items made with it are waterproof, and thrown flasks of it stick a creature in place (DC {DC} Strength to escape).'],
  [/vine|root|moss|reed|creeper|living|awakened|shrub/i, 'Living Plant', 'Items made with it slowly regrow: they mend minor damage after a long rest, and once per day you can make it sprout a 10 ft vine rope.'],
  [/wheat|grain|corn|rice|berry|fruit|apple|root vegetable|crop/i, 'Hearty Crop', 'Food made with it counts as a full day\'s ration in half the amount and grants {P} temporary hit points.'],
  // herbs of the old stories
  [/mandrake|mandragora|screaming/i, 'Screaming Root', 'Pulled or crushed, it shrieks: creatures within 30 ft make a Constitution save (DC {DC}) or are stunned until the end of their next turn. Potions of it cure one curse.'],
  [/garlic|wolfsbane|aconite/i, 'Hunter\'s Ward', 'Carried, it keeps vampires and werewolves from touching you willingly (Wisdom save DC {DC}); weapons rubbed with it deal +{P}d4 damage to them.'],
  [/rowan|mistletoe|holly|hawthorn/i, 'Fey-Ward', 'Carried, it gives advantage on saves against fey magic, and fey can\'t enter a circle drawn with it.'],
  [/clover|four-leaf|lucky/i, 'Luckleaf', 'Carried, once per long rest you can reroll one die and keep the better result.'],
  [/fern|fernseed|bracken/i, 'Fernseed', 'Eaten at midnight, it makes you invisible for 1 minute; carried, you always find the hidden path out of a forest.'],
  [/kingsfoil|athel|starleaf|waybread|elf-?bread|lembas/i, 'Kingsfoil', 'Crushed into warm water, it heals {P5} hit points and ends one poison or the cold of a wraith\'s wound.'],
  [/hazel|wisdom|sage/i, 'Hazel of Knowing', 'Eaten, it gives +{B} to Intelligence checks for 1 hour; staves of it point toward water or lost things.'],
  // more plant traits (website addition): for plants the list above didn't cover. Checked after it, so no plant's
  // earlier trait changes.
  [/ghost|soul|spirit/i, 'Spirit-Touched', 'Weapons and foci made with it strike incorporeal creatures as if they were solid, and a focus of it adds +{B} to spells against spirits and undead.'],
  [/dread|ebon|umbral/i, 'Gloomgrowth', 'Worn, it gives advantage on Stealth checks in dim light or darkness; a weapon of it frightens a creature it critically hits (Wisdom save, DC {DC}).'],
  [/blood|ichor/i, 'Bloodsap', 'Potions made with it also give {P} temporary hit points; a weapon of it heals you 1 hit point whenever it kills a creature.'],
  [/light|dawn|halo|angel|gloria|lantern/i, 'Radiant Bloom', 'It glows like a torch on command. Potions made with it end blindness, and a focus of it adds +{B} to radiant spell damage.'],
  [/law|oath|ledger|ward|unshaken/i, 'Oathgrowth', 'Carried, it gives advantage on saves against being charmed or compelled; a promise made with a hand on it can\'t be broken without the maker knowing.'],
  [/drown|kelp|wrack|sargasso|pearlweed|algae|trench/i, 'Sea Growth', 'Eaten, it lets you breathe underwater for {P} × 10 minutes; armor lined with it gives a swim speed of 20 ft.'],
  [/chang|shift|trickster|\bmad\b|entropy|unravel|unbeing|collapse|comet|astral/i, 'Wild Growth', 'Brewed, the drinker can change their appearance (as disguise self) for 1 hour; once per long rest, a focus of it lets you roll twice on the wild magic table and pick one result.'],
  [/yarrow|comfrey|feverfew|ginseng|st\.? john|valerian|thyme|herb|wort|hearthleaf|mallow/i, 'Field Remedy', 'Potions and poultices made with it restore +{P} hit points and end one disease or poison; carried, it gives advantage on Medicine checks.'],
  [/seed|grass|horizon/i, 'First Growth', 'Planted, it grows into a full plant in a day. Potions made with it remove one level of exhaustion, and a focus of it adds +{B} to druid and ranger spell DCs.'],
  [/lily|rose|orchid|petal|myrrh/i, 'Fragrant Bloom', 'Burned or worn, its scent gives creatures within 10 ft disadvantage on Insight checks against you and you +{B} to Persuasion.'],
  [/lichen|morel|puffball|hellebore|belladonna|ivy/i, 'Wild Herb', 'Brewed, a draught gives advantage on saves against poison for 1 hour; once, a weapon coated with it deals +{P}d4 poison damage on a hit.'],
  [/thistle|dandelion|storm/i, 'Windborne Seed', 'Carried, once per long rest you can fall slowly (60 ft per round) for 1 minute; brewed, a draught gives advantage on one Dexterity save.'],
  [/wood|pine|yew|flax/i, 'Seasoned Grain', 'Bows, staffs, and shields made with it can\'t be broken by nonmagical means, and the item mends itself overnight.']
];

var BASIC = {
  O: 'Basic metal. Forges standard weapons, armor, and tools; it carries only its property.',
  G: 'Basic gem. Used for focuses, settings, and enchantment anchors; it carries only its property.',
  S: 'Basic stone. Used for masonry, carvings, and heavy weapons; it carries only its property.',
  W: 'Basic wood. Used for bows, staves, hafts, and structures; it carries only its property.',
  F: 'Basic cloth or fiber. Used for clothing, padding, and bindings; it carries only its property.',
  K: 'Basic mechanism. Used in clockwork and engineering; it carries only its property.',
  U: 'Supply. Used up in crafting; it gives no trait or property.',
  E: 'Raw arcane essence. It carries only its property.',
  B: 'Basic animal part. It carries only its property.',
  L: 'Basic organic matter. It carries only its property.'
};
var KIND = { O: 'Mineral', G: 'Mineral', S: 'Mineral', W: 'Plant', F: 'Crafted', K: 'Crafted', U: 'Supply', E: 'Essence', B: 'Creature', L: 'Creature' };

// Trait strength scales with Potency: a [low, mid, high] text is chosen by Potency 1-2, 3-5, and 6+,
// so common materials give a small edge and only high-grade ones give immunities or big effects.
function tier(t, P) { return Array.isArray(t) ? t[P <= 2 ? 0 : P <= 5 ? 1 : 2] : t; }
function fill(s, P) {
  s = tier(s, P);
  var B = Math.ceil(P / 2);
  return s.replace(/\{IMM\}/g, P >= 8 ? ' (immunity at this Potency)' : '')
    .replace(/\{P5\}/g, P * 5).replace(/\{P2\}/g, P * 2).replace(/\{FT\}/g, 20 + P * 10).replace(/\{B0\}/g, 10 + B * 10).replace(/\{MV\}/g, 5 + B * 5)
    .replace(/\{HJ\}/g, 5 + P * 2).replace(/\{SL\}/g, Math.min(9, B)).replace(/\{DC\}/g, 10 + B * 2)
    .replace(/\{P\}/g, P).replace(/\{B\}/g, B).replace(/\b1 hit points\b/g, '1 hit point');
}
var PART_WORDS = new RegExp(PARTS.map(function (p) { return p[0].source.replace(/^\\b\(|\)\\b$/g, ''); }).join('|').replace(/^/, '\\b(').replace(/$/, ')\\b'), 'gi');
// where a trait works: 'w' only from a weapon, 'a' only from armor or a shield, '' from anything equipped (or used in crafting)
function scope(t) {
  t = String(t || '');
  if (/^(A weapon|Weapons? (coated )?with this material|When you hit with a weapon)|hit (it )?(by|with) a weapon (coated )?with this material|with a weapon (coated )?with this material/i.test(t) && !/^(Armor|While you wear)/.test(t)) return 'w';
  if (/^(Armor or a shield with this material|While you wear armor or hold a shield|Armor with this material|Damaged armor with this material)/i.test(t)) return 'a';
  return '';
}
// a trait that is about crafting (potions, food, how items mend) rather than something a creature could do
function craftOnly(t) { return /^(Potions|Poisons|Food|Items with this material|Items made with it|Weapons and shields made with it|Brewed|Seals and binds|Damaged armor)/i.test(String(t || '')); }
function part(name) { for (var i = 0; i < PARTS.length; i++) if (PARTS[i][0].test(name)) return { p: PARTS[i][1], k: PARTS[i][2] }; return null; }
var ORDER = { sense: ['sense', 'mind', 'offense', 'move', 'vital', 'defense'], mind: ['mind', 'sense', 'vital', 'offense', 'defense', 'move'],
  offense: ['offense', 'vital', 'defense', 'move', 'sense', 'mind'], move: ['move', 'defense', 'sense', 'vital', 'offense', 'mind'],
  defense: ['defense', 'vital', 'move', 'offense', 'sense', 'mind'], vital: ['vital', 'defense', 'offense', 'mind', 'move', 'sense'] };

function trait(m, creature, typeCode) {
  // the trait's numbers use the Potency rank (Potency / 5, 1-10), as property texts do
  var P = Math.min(10, Math.max(1, Math.floor((m.pot || 0) / 5))), name = m.n, t = typeCode || '';
  var pt = part(name);
  var isCreature = !!creature || ((t === 'B' || t === 'L') && !!pt) || (t === 'F' && !!pt && pt.p === 'hide') || (t === 'E' && !!creature);
  if (t === 'U') return { org: 'Supply', origin: '', name: '', text: BASIC.U };
  if (isCreature) {
    var who = creature ? creature.n : '';
    var hay = (who + ' ' + (creature && creature.txt || '') + ' ' + name);
    // the creature decides first; the material's own name only counts without its body-part words, so a baboon's bone or
    // blood doesn't read as undead ("bone") or a vampire ("blood")
    var ab = null, bare = name.replace(PART_WORDS, ' ').replace(/\s+/g, ' ').trim();
    for (var i = 0; i < ABILITIES.length; i++) if (who && ABILITIES[i].re.test(who)) { ab = ABILITIES[i]; break; }
    if (!ab && !who) for (var i2 = 0; i2 < ABILITIES.length; i2++) if (bare && !ABILITIES[i2].byName && ABILITIES[i2].re.test(bare)) { ab = ABILITIES[i2]; break; }
    if (!ab && creature && creature.txt) for (var j = 0; j < ABILITIES.length; j++) if (!ABILITIES[j].byName && ABILITIES[j].re.test(creature.txt)) { ab = ABILITIES[j]; break; }
    var kind = pt ? pt.k : (t === 'E' ? 'mind' : t === 'L' ? 'vital' : 'defense');
    var pick = null;
    if (pt && pt.p === 'venom' && !(ab && ab.offense && /poison|venom/i.test(ab.offense[1]))) ab = null;
    // a gland or sac that holds something other than venom (fire, ink, spores...) gives a trait from what it holds
    if (pt && pt.p === 'venom') for (var g = 0; g < GLANDS.length; g++) if (GLANDS[g][0].test(name)) return { org: 'Creature', origin: who, name: GLANDS[g][1], text: fill(GLANDS[g][2], P), from: 'Gland' };
    if (ab) { var ord = ORDER[kind]; for (var k = 0; k < ord.length; k++) if (ab[ord[k]]) { pick = ab[ord[k]]; break; } }
    if (!pick) pick = GENERIC[pt ? pt.p : (t === 'L' ? 'blood' : t === 'E' ? 'essence' : 'bone')];
    var nm = pick[0];
    if (!ab && who) nm = who.split(' ').pop() + ' ' + (pt && pt.p === 'venom' ? 'Venom' : nm);
    return { org: 'Creature', origin: who, name: nm, text: fill(pick[1], P), from: ab ? ab.label : '' };
  }
  if (t === 'W' || (t === 'F' && /fiber|leaf|reed|flax|cotton|hemp|moss|vine/i.test(name)) || (t === 'L' && /sap|resin/i.test(name))) {
    for (var q = 0; q < PLANTS.length; q++) if (PLANTS[q][0].test(name)) return { org: 'Plant', origin: m.where || '', name: PLANTS[q][1], text: fill(PLANTS[q][2], P) };
    return { org: 'Plant', origin: m.where || '', name: '', text: BASIC.W };
  }
  return { org: KIND[t] || 'Mineral', origin: m.where || '', name: '', text: BASIC[t] || BASIC.O };
}
module.exports = { trait: trait, part: part, scope: scope, craftOnly: craftOnly };
