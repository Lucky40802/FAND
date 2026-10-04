var PHB="Player's Handbook",XGE="Xanathar's Guide to Everything",TCE="Tasha's Cauldron of Everything",SCAG="Sword Coast Adventurer's Guide",EGW="Explorer's Guide to Wildemount",DMG="Dungeon Master's Guide",VRGR="Van Richten's Guide to Ravenloft",FTD="Fizban's Treasury of Dragons",BGG="Bigby Presents: Glory of the Giants",DSQ="Dragonlance: Shadow of the Dragon Queen";
module.exports=[
// BARBARIAN
{n:"Path of the Ancestral Guardian",c:"Barbarian",s:XGE,o:"Barbarians who call on the spirits of their ancestors to shield their allies.",f:[
[3,"Ancestral Protectors","While raging, the first creature you hit each turn has disadvantage on attacks against anyone but you, and its hits on others deal half damage."],
[6,"Spirit Shield","Reaction while raging: reduce damage to an ally within 30 ft by 2d6 (scales to 4d6 by 14th)."],
[10,"Consult the Spirits","Cast augury or clairvoyance without a slot, once per short or long rest."],
[14,"Vengeful Ancestors","When Spirit Shield prevents damage, the attacker takes force damage equal to the amount prevented."]],g:"A tank that punishes enemies for ignoring the barbarian."},
{n:"Path of the Beast",c:"Barbarian",s:TCE,o:"Barbarians whose rage reveals a bestial form within.",f:[
[3,"Form of the Beast","When you rage, grow natural weapons: a bite that can heal you, claws that allow an extra claw attack, or a tail that can deflect a hit with a reaction."],
[6,"Bestial Soul","Natural weapons count as magical; each rest choose a climbing speed, swimming speed with water breathing, or an improved jump."],
[10,"Infectious Fury","When you hit with natural weapons, force a Wisdom save: the target attacks a creature you choose or takes extra psychic damage."],
[14,"Call the Hunt","When you rage, allies you choose gain bonus damage once per turn and you gain temporary hit points for each."]],g:"A shapeshifting brawler that picks its weapon every fight."},
{n:"Path of Wild Magic",c:"Barbarian",s:TCE,o:"Barbarians whose rage leaks raw, unpredictable magic.",f:[
[3,"Magic Awareness","Action: sense spells and magic items nearby (uses equal to proficiency bonus)."],
[3,"Wild Surge","Each time you rage, roll on a short table of chaotic magical effects (explosions, teleports, protective light, etc.)."],
[6,"Bolstering Magic","Touch a creature to grant a d3 bonus to attacks and checks, or restore a low-level spell slot."],
[10,"Unstable Backlash","When you take damage or fail a save while raging, you can reroll your Wild Surge effect."],
[14,"Controlled Surge","Roll twice on the Wild Surge table and pick the result."]],g:"Chaos-flavored rage with a random bonus every fight."},
{n:"Path of the Battlerager",c:"Barbarian",s:SCAG,o:"Armored brawlers who fight in spiked armor. (Originally dwarf-only in the book; many tables drop that restriction.)",f:[
[3,"Battlerager Armor","While raging in spiked armor, make a bonus-action spike attack, and grappling deals piercing damage."],
[6,"Reckless Abandon","Gain temporary hit points when you use Reckless Attack while raging."],
[10,"Battlerager Charge","Dash as a bonus action while raging."],
[14,"Spiked Retribution","Creatures that hit you in melee while you rage in spiked armor take piercing damage."]],g:"A grappler who turns their own body into a weapon."},
{n:"Path of the Giant",c:"Barbarian",s:BGG,o:"Barbarians who draw on the might of giants.",f:[
[3,"Giant's Power","Learn druidcraft or thaumaturgy and the Giant language."],
[3,"Giant's Havoc","While raging, your reach grows, you can grapple and throw larger creatures, and you count as one size larger."],
[6,"Elemental Cleaver","Infuse your weapon with an element while raging; it deals extra elemental damage and flies back when thrown."],
[10,"Mighty Impel","Bonus action while raging: hurl a creature you're grappling or one nearby."],
[14,"Demiurgic Colossus","Rage size and reach grow further; Elemental Cleaver damage increases."]],g:"A thrower and battlefield-mover built around size."},
// BARD
{n:"College of Creation",c:"Bard",s:TCE,o:"Bards who channel the song that shaped the world.",f:[
[3,"Mote of Potential","Bardic Inspiration dice gain an extra effect depending on whether they are used on an attack, check, or save."],
[3,"Performance of Creation","Conjure a nonmagical item of limited value and size, lasting a number of hours."],
[6,"Animating Performance","Animate an object into a dancing construct that fights alongside you."],
[14,"Creative Crescendo","Create several items at once, and larger ones, with Performance of Creation."]],g:"A utility bard who makes the tools the party needs.",r:"Creation"},
{n:"College of Eloquence",c:"Bard",s:TCE,o:"Masters of oratory and persuasion.",f:[
[3,"Silver Tongue","Treat low rolls on Persuasion and Deception as a 10."],
[3,"Unsettling Words","Spend Bardic Inspiration to reduce a creature's next saving throw."],
[6,"Unfailing Inspiration","Inspiration dice aren't spent if the roll still fails."],
[6,"Universal Speech","Make creatures understand you regardless of language."],
[14,"Infectious Inspiration","When an inspired roll succeeds, give a free Inspiration die to another creature."]],g:"The best face and save-debuffer among bards."},
{n:"College of Swords",c:"Bard",s:XGE,o:"Blade-dancing performers who fight as they entertain.",f:[
[3,"Bonus Proficiencies","Medium armor and scimitars; use a weapon as a spellcasting focus."],
[3,"Fighting Style","Choose Dueling or Two-Weapon Fighting."],
[3,"Blade Flourish","When you attack, gain speed and spend Inspiration dice for Defensive, Slashing, or Mobile flourishes."],
[6,"Extra Attack","Attack twice when you take the Attack action."],
[14,"Master's Flourish","Use a d6 for a flourish without spending Bardic Inspiration."]],g:"A swashbuckling melee bard."},
{n:"College of Spirits",c:"Bard",s:VRGR,o:"Storytellers who channel spirits through their tales.",f:[
[3,"Guiding Whispers","Learn the guidance cantrip at longer range."],
[3,"Spiritual Focus","Use a candle, crystal ball, skull, or similar as a focus; later it boosts damage and healing spells."],
[3,"Tales from Beyond","Spend Bardic Inspiration to roll on a table of spirit tales and hold one for later use."],
[6,"Spirit Session","Hold a ritual with others to learn a divination or necromancy spell temporarily."],
[14,"Mystical Connection","Roll twice on the tales table and choose."]],g:"A random-but-flavorful spooky bard.",r:"Spirits"},
// CLERIC
{n:"Arcana Domain",c:"Cleric",s:SCAG,o:"Clerics of a god of magic, blending divine and arcane.",f:[
[1,"Arcane Initiate","Arcana proficiency and two wizard cantrips."],
[2,"Channel Divinity: Arcane Abjuration","Turn, and later banish, celestials, elementals, fey, and fiends."],
[6,"Spell Breaker","Healing an ally can also end a spell affecting them."],
[8,"Potent Spellcasting","Add Wisdom modifier to cantrip damage."],
[17,"Arcane Mastery","Add one wizard spell of each of 6th through 9th level to your domain spells."]],g:"A cleric with a wizard's toolbox."},
{n:"Forge Domain",c:"Cleric",s:XGE,o:"Clerics of smithing gods who craft and armor.",f:[
[1,"Bonus Proficiencies","Heavy armor and smith's tools."],
[1,"Blessing of the Forge","Once per long rest, make a weapon or armor +1 until your next long rest."],
[2,"Channel Divinity: Artisan's Blessing","Hour-long ritual to create a simple metal item."],
[6,"Soul of the Forge","Fire resistance and +1 AC in heavy armor."],
[8,"Divine Strike","Extra fire damage once per turn on weapon hits."],
[17,"Saint of Forge and Fire","Fire immunity and resistance to nonmagical weapon damage in heavy armor."]],g:"The highest-AC cleric; a front-line smith."},
{n:"Knowledge Domain",c:"Cleric",s:PHB,o:"Clerics of lore, learning, and secrets.",f:[
[1,"Blessings of Knowledge","Two extra languages and expertise in two knowledge skills."],
[2,"Channel Divinity: Knowledge of the Ages","Gain proficiency with any skill or tool for 10 minutes."],
[6,"Channel Divinity: Read Thoughts","Read a creature's surface thoughts and cast suggestion on it."],
[8,"Potent Spellcasting","Add Wisdom modifier to cantrip damage."],
[17,"Visions of the Past","Meditate to see the history of an object or place."]],g:"An investigator and skill-monkey cleric.",r:"Knowledge"},
{n:"Nature Domain",c:"Cleric",s:PHB,o:"Clerics of wild gods of beasts and growth.",f:[
[1,"Acolyte of Nature","Learn a druid cantrip and a nature skill."],
[1,"Bonus Proficiency","Heavy armor."],
[2,"Channel Divinity: Charm Animals and Plants","Charm nearby beasts and plant creatures."],
[6,"Dampen Elements","Reaction: grant resistance to acid, cold, fire, lightning, or thunder damage."],
[8,"Divine Strike","Extra cold, fire, or lightning damage once per turn."],
[17,"Master of Nature","Command charmed animals and plants as a bonus action."]],g:"An armored druid-flavored cleric.",r:"Nature"},
{n:"Tempest Domain",c:"Cleric",s:PHB,o:"Clerics of storm and sea.",f:[
[1,"Bonus Proficiencies","Martial weapons and heavy armor."],
[1,"Wrath of the Storm","Reaction: deal lightning or thunder damage to a creature that hits you."],
[2,"Channel Divinity: Destructive Wrath","Deal maximum damage with a lightning or thunder spell."],
[6,"Thunderbolt Strike","Push Large or smaller creatures when you deal lightning damage to them."],
[8,"Divine Strike","Extra thunder damage once per turn."],
[17,"Stormborn","Flying speed while outdoors and not underground."]],g:"A blaster cleric with big storm damage."},
{n:"Trickery Domain",c:"Cleric",s:PHB,o:"Clerics of mischief and deception.",f:[
[1,"Blessing of the Trickster","Give a creature advantage on Stealth checks."],
[2,"Channel Divinity: Invoke Duplicity","Create an illusory double to cast spells through and gain advantage near it."],
[6,"Channel Divinity: Cloak of Shadows","Turn invisible until the end of your next turn."],
[8,"Divine Strike","Extra poison damage once per turn."],
[17,"Improved Duplicity","Create up to four duplicates."]],g:"A sneaky support cleric."},
{n:"War Domain",c:"Cleric",s:PHB,o:"Clerics of battle gods.",f:[
[1,"Bonus Proficiencies","Martial weapons and heavy armor."],
[1,"War Priest","Bonus-action weapon attack a limited number of times per long rest."],
[2,"Channel Divinity: Guided Strike","+10 to one of your attack rolls."],
[6,"Channel Divinity: War God's Blessing","Reaction: grant +10 to an ally's attack roll."],
[8,"Divine Strike","Extra weapon damage once per turn."],
[17,"Avatar of Battle","Resistance to nonmagical bludgeoning, piercing, and slashing."]],g:"A martial cleric.",r:"War"},
{n:"Peace Domain",c:"Cleric",s:TCE,o:"Clerics of harmony who bind allies together.",f:[
[1,"Implement of Peace","A social skill proficiency."],
[1,"Emboldening Bond","Bond allies; once per turn they add a d4 to a roll while near each other."],
[2,"Channel Divinity: Balm of Peace","Move without provoking and heal creatures you pass."],
[6,"Protective Bond","Bonded creatures can teleport to take damage for each other."],
[8,"Potent Spellcasting","Add Wisdom modifier to cantrip damage."],
[17,"Expansive Bond","Bond range grows and the protector gains resistance."]],g:"A support cleric widely considered one of the strongest."},
// DRUID
{n:"Circle of the Moon",c:"Druid",s:PHB,o:"Druids who master Wild Shape for combat.",f:[
[2,"Combat Wild Shape","Wild Shape as a bonus action; spend spell slots to heal while transformed."],
[2,"Circle Forms","Transform into stronger beasts (CR 1 at 2nd, scaling with level)."],
[6,"Primal Strike","Beast-form attacks count as magical."],
[10,"Elemental Wild Shape","Spend two Wild Shape uses to become an elemental."],
[14,"Thousand Forms","Cast alter self at will."]],g:"The shapeshifter tank druid.",r:"Moon"},
{n:"Circle of Dreams",c:"Druid",s:XGE,o:"Druids tied to the fey realm of dreams.",f:[
[2,"Balm of the Summer Court","Pool of d6s to heal allies at range as a bonus action."],
[6,"Hearth of Moonlight and Shadow","Make a warded, hidden camp during rests."],
[10,"Hidden Paths","Teleport yourself or an ally a short distance."],
[14,"Walker in Dreams","Once per long rest, cast dream, scrying, or teleportation circle after waking."]],g:"A mobile healer druid.",r:"Dreams"},
{n:"Circle of Wildfire",c:"Druid",s:TCE,o:"Druids of destructive and renewing flame.",f:[
[2,"Summon Wildfire Spirit","Spend Wild Shape to summon a fiery spirit that fights and can teleport allies."],
[6,"Enhanced Bond","Fire and healing spells gain a bonus die and can originate from the spirit."],
[10,"Cauterizing Flames","When creatures die near you, create flames that heal or burn."],
[14,"Blazing Revival","When you drop to 0 HP, sacrifice the spirit to return with half your hit points."]],g:"A fire-and-healing druid with a pet."},
// FIGHTER
{n:"Arcane Archer",c:"Fighter",s:XGE,o:"Elite archers who weave magic into their arrows.",f:[
[3,"Arcane Archer Lore","Learn prestidigitation or druidcraft and a skill."],
[3,"Arcane Shot","Twice per short rest, add a magical effect (banishing, beguiling, bursting, grasping, etc.) to an arrow hit."],
[7,"Magic Arrow","Your arrows count as magical."],
[7,"Curving Shot","Redirect a missed magic arrow to another target."],
[15,"Ever-Ready Shot","Regain one Arcane Shot when rolling initiative with none left."]],g:"A ranged fighter with trick shots."},
{n:"Samurai",c:"Fighter",s:XGE,o:"Warriors of unbreakable resolve.",f:[
[3,"Bonus Proficiency","A social skill or a language."],
[3,"Fighting Spirit","Bonus action: advantage on attacks this turn and temporary hit points, a few times per long rest."],
[7,"Elegant Courtier","Add Wisdom to Persuasion; gain Wisdom save proficiency."],
[10,"Tireless Spirit","Regain a Fighting Spirit use when rolling initiative with none."],
[15,"Rapid Strike","Trade advantage on one attack for an extra attack."],
[18,"Strength Before Death","Take an extra turn when reduced to 0 hit points."]],g:"A consistent damage dealer who refuses to fall."},
{n:"Echo Knight",c:"Fighter",s:EGW,o:"Fighters who summon echoes of themselves from other timelines.",f:[
[3,"Manifest Echo","Bonus action: summon a translucent echo; attack from its space and swap places with it."],
[3,"Unleash Incarnation","Make an extra attack through the echo a limited number of times per long rest."],
[7,"Echo Avatar","See and hear through the echo at long range."],
[10,"Shadow Martyr","Have the echo take an attack meant for an ally."],
[15,"Reclaim Potential","Gain temporary hit points when the echo is destroyed."],
[18,"Legion of One","Summon two echoes."]],g:"A mobile, reach-extending fighter."},
{n:"Psi Warrior",c:"Fighter",s:TCE,o:"Fighters who augment strikes with psionic power.",f:[
[3,"Psionic Power","Psionic energy dice fuel a protective field, a psionic strike, and telekinetic movement."],
[7,"Telekinetic Adept","Psi-powered leap (brief flight) and telekinetic thrust (knock prone)."],
[10,"Guarded Mind","Resistance to psychic damage; end charm or fright by spending a die."],
[15,"Bulwark of Force","Grant half cover to allies."],
[18,"Telekinetic Master","Cast telekinesis and attack while concentrating on it."]],g:"A flexible psionic fighter."},
{n:"Rune Knight",c:"Fighter",s:TCE,o:"Fighters who carve giant runes into their gear.",f:[
[3,"Rune Carver","Inscribe giant runes on gear for passive bonuses and activated effects."],
[3,"Giant's Might","Bonus action: become Large, gain advantage on Strength, and deal extra damage."],
[7,"Runic Shield","Reaction: force an attacker to reroll."],
[10,"Great Stature","Grow taller; Giant's Might damage increases."],
[15,"Master of Runes","Use each rune twice per short rest."],
[18,"Runic Juggernaut","Giant's Might makes you Huge with more reach and damage."]],g:"A size-changing controller fighter. In this vault the giant runes are flavor; they don't interact with the Rune (Law) system unless the DM rules otherwise."},
{n:"Banneret",c:"Fighter",s:SCAG,o:"Knights who inspire and rally allies. (Printed in SCAG under a setting-specific name; later reprinted as Banneret.)",f:[
[3,"Rallying Cry","When you use Second Wind, nearby allies also regain hit points."],
[7,"Royal Envoy","Persuasion proficiency with doubled proficiency bonus."],
[10,"Inspiring Surge","When you Action Surge, an ally can make an attack as a reaction."],
[15,"Bulwark","When you use Indomitable, an ally can reroll a failed save too."]],g:"A leader-style fighter."},
// MONK
{n:"Way of the Drunken Master",c:"Monk",s:XGE,o:"Monks with an unpredictable, swaying style.",f:[
[3,"Bonus Proficiencies","Performance and brewer's supplies."],
[3,"Drunken Technique","Flurry of Blows grants Disengage and extra speed."],
[6,"Tipsy Sway","Redirect missed attacks onto another creature; stand up cheaply."],
[11,"Drunkard's Luck","Spend ki to cancel disadvantage."],
[17,"Intoxicated Frenzy","Flurry of Blows can make extra attacks against different creatures."]],g:"A skirmisher monk."},
{n:"Way of the Kensei",c:"Monk",s:XGE,o:"Monks who master specific weapons.",f:[
[3,"Path of the Kensei","Chosen kensei weapons count as monk weapons; gain AC and damage tricks with them."],
[6,"One with the Blade","Kensei weapons count as magical; spend ki for extra damage."],
[11,"Sharpen the Blade","Spend ki to give a weapon a temporary bonus."],
[17,"Unerring Accuracy","Reroll a missed monk weapon attack once per turn."]],g:"A weapon-focused monk."},
{n:"Way of the Sun Soul",c:"Monk",s:XGE,o:"Monks who channel radiant energy.",f:[
[3,"Radiant Sun Bolt","Ranged radiant attacks that work with Martial Arts."],
[6,"Searing Arc Strike","Spend ki to cast burning hands after attacking."],
[11,"Searing Sunburst","Throw a radiant orb that explodes."],
[17,"Sun Shield","Shed light and damage melee attackers with radiance."]],g:"A ranged radiant monk.",r:"Sun"},
{n:"Way of the Long Death",c:"Monk",s:SCAG,o:"Monks who study death itself.",f:[
[3,"Touch of Death","Gain temporary hit points when you reduce a creature to 0."],
[6,"Hour of Reaping","Frighten creatures around you."],
[11,"Mastery of Death","Spend ki to drop to 1 HP instead of 0."],
[17,"Touch of the Long Death","Spend ki for heavy necrotic damage on a touch."]],g:"A hard-to-kill monk."},
{n:"Way of the Ascendant Dragon",c:"Monk",s:FTD,o:"Monks who emulate dragons.",f:[
[3,"Draconic Disciple","Change unarmed damage to an element; reroll failed social checks."],
[3,"Breath of the Dragon","Replace an attack with an elemental breath."],
[6,"Wings Unfurled","Fly while using Step of the Wind."],
[11,"Aspect of the Wyrm","Aura of fear or elemental resistance."],
[17,"Ascendant Aspect","Stronger breath and resistance aura."]],g:"An elemental, mobile monk."}
];
