var PHB="Player's Handbook",XGE="Xanathar's Guide to Everything",TCE="Tasha's Cauldron of Everything",SCAG="Sword Coast Adventurer's Guide",DMG="Dungeon Master's Guide",VRGR="Van Richten's Guide to Ravenloft",FTD="Fizban's Treasury of Dragons",DSQ="Dragonlance: Shadow of the Dragon Queen";
module.exports=[
// PALADIN
{n:"Oath of Glory",c:"Paladin",s:TCE,o:"Paladins who pursue heroic deeds and legend.",f:[
[3,"Channel Divinity: Peerless Athlete","Advantage on Athletics and Acrobatics, and greater jumps."],
[3,"Channel Divinity: Inspiring Smite","After a Divine Smite, share temporary hit points among allies."],
[7,"Aura of Alacrity","Extra walking speed for you and nearby allies."],
[15,"Glorious Defense","Reaction: add Charisma to an ally's AC and counterattack on a miss."],
[20,"Living Legend","Advantage on Charisma checks, reroll saves, and turn misses into hits once per turn."]],g:"A mobile, athletic paladin."},
{n:"Oath of the Watchers",c:"Paladin",s:TCE,o:"Guardians against extraplanar threats.",f:[
[3,"Channel Divinity: Watcher's Will","Advantage on mental saves for you and several allies."],
[3,"Channel Divinity: Abjure the Extraplanar","Turn aberrations, celestials, elementals, fey, and fiends."],
[7,"Aura of the Sentinel","Bonus to initiative for you and nearby allies."],
[15,"Vigilant Rebuke","When an ally succeeds on a mental save, deal force damage to the source."],
[20,"Mortal Bulwark","Truesight, advantage against extraplanar foes, and banish them on a hit."]],g:"An anti-caster, anti-outsider paladin."},
{n:"Oath of Redemption",c:"Paladin",s:XGE,o:"Paladins who seek peace and redemption before violence.",f:[
[3,"Channel Divinity: Emissary of Peace","+5 to Persuasion for 10 minutes."],
[3,"Channel Divinity: Rebuke the Violent","Deal radiant damage back to a creature that hurt someone."],
[7,"Aura of the Guardian","Reaction: take damage meant for a nearby ally."],
[15,"Protective Spirit","Regain hit points at the end of your turn when below half."],
[20,"Emissary of Redemption","Resistance to creature damage, and attackers take radiant damage back."]],g:"A bodyguard paladin."},
{n:"Oath of the Crown",c:"Paladin",s:SCAG,o:"Paladins sworn to law, society, and sovereign.",f:[
[3,"Channel Divinity: Champion Challenge","Nearby creatures can't willingly move away from you."],
[3,"Channel Divinity: Turn the Tide","Heal nearby creatures below half hit points."],
[7,"Divine Allegiance","Reaction: take damage meant for an adjacent ally."],
[15,"Unyielding Spirit","Advantage on saves against paralysis and stun."],
[20,"Exalted Champion","Resistance to nonmagical weapon damage and advantage on death and Wisdom saves for allies."]],g:"A defender paladin."},
{n:"Oathbreaker",c:"Paladin",s:DMG,o:"Paladins who broke their oath and turned to darker ambitions. The DMG presents it as a villain option; DM approval recommended.",f:[
[3,"Channel Divinity: Control Undead","Take command of an undead creature."],
[3,"Channel Divinity: Dreadful Aspect","Frighten nearby creatures."],
[7,"Aura of Hate","You and nearby fiends and undead add Charisma to melee damage."],
[15,"Supernatural Resistance","Resistance to nonmagical weapon damage."],
[20,"Dread Lord","Aura of gloom that damages frightened enemies and lets you attack with shadows."]],g:"A dark paladin with undead minions."},
// RANGER
{n:"Horizon Walker",c:"Ranger",s:XGE,o:"Rangers who guard the boundaries between planes.",f:[
[3,"Detect Portal","Sense the nearest planar portal."],
[3,"Planar Warrior","Bonus action: mark a target; your next hit deals extra force damage."],
[7,"Ethereal Step","Briefly step into the Ethereal Plane."],
[11,"Distant Strike","Teleport before each attack; attack a third creature if you hit two."],
[15,"Spectral Defense","Reaction: gain resistance against an attack's damage."]],g:"A teleporting skirmisher ranger. Pairs well with this vault's Astral Navigation profession."},
{n:"Monster Slayer",c:"Ranger",s:XGE,o:"Hunters of supernatural threats.",f:[
[3,"Hunter's Sense","Learn a creature's immunities, resistances, and vulnerabilities."],
[3,"Slayer's Prey","Mark a creature to deal extra damage to it once per turn."],
[7,"Supernatural Defense","Add a bonus to saves and grapple escapes against your prey."],
[11,"Magic-User's Nemesis","Reaction: foil a creature's spell or teleport."],
[15,"Slayer's Counter","Reaction: attack your prey when it forces you to save."]],g:"An anti-monster, anti-caster ranger."},
{n:"Swarmkeeper",c:"Ranger",s:TCE,o:"Rangers bonded to a swarm of nature spirits.",f:[
[3,"Gathered Swarm","Once per turn, the swarm deals extra damage, pushes a target, or moves you."],
[3,"Swarmkeeper Magic","Bonus spells such as mage hand and faerie fire."],
[7,"Writhing Tide","Gain a short flying speed."],
[11,"Mighty Swarm","Swarm effects improve: more damage, knock prone, half cover."],
[15,"Swarming Dispersal","Reaction: gain resistance and teleport as your swarm scatters."]],g:"A controller ranger with a tiny-creature swarm."},
{n:"Drakewarden",c:"Ranger",s:FTD,o:"Rangers bonded to a young drake companion.",f:[
[3,"Draconic Gift","Learn thaumaturgy and Draconic."],
[3,"Drake Companion","Summon a small drake that fights alongside you and adds elemental damage."],
[7,"Bond of Fang and Scale","The drake grows; ride it and fly; its bite deals extra damage."],
[11,"Drake's Breath","Exhale or have the drake exhale a cone of elemental damage."],
[15,"Perfected Bond","The drake becomes Large and can grant resistance with its reaction."]],g:"A pet-and-mount ranger."},
// ROGUE
{n:"Inquisitive",c:"Rogue",s:XGE,o:"Rogues who root out secrets and lies.",f:[
[3,"Ear for Deceit","Treat low Insight rolls as an 8."],
[3,"Eye for Detail","Bonus action: search for clues or hidden things."],
[3,"Insightful Fighting","Bonus action Insight vs Deception to gain Sneak Attack without advantage."],
[9,"Steady Eye","Advantage on Perception and Investigation when moving slowly."],
[13,"Unerring Eye","Sense illusions and shapechangers."],
[17,"Eye for Weakness","Extra Sneak Attack damage with Insightful Fighting."]],g:"A detective rogue."},
{n:"Scout",c:"Rogue",s:XGE,o:"Skirmishers and outdoor experts.",f:[
[3,"Skirmisher","Reaction: move half your speed when an enemy ends its turn nearby, without provoking."],
[3,"Survivalist","Expertise in Nature and Survival."],
[9,"Superior Mobility","Extra walking, climbing, and swimming speed."],
[13,"Ambush Master","Advantage on initiative; the first target you hit is easier for allies to hit."],
[17,"Sudden Strike","Bonus-action attack that can use a second Sneak Attack on a different target."]],g:"A mobile hit-and-run rogue."},
{n:"Swashbuckler",c:"Rogue",s:XGE,o:"Dashing duelists who rely on charm and speed.",f:[
[3,"Fancy Footwork","Creatures you attack in melee can't make opportunity attacks against you this turn."],
[3,"Rakish Audacity","Add Charisma to initiative; Sneak Attack in one-on-one fights without advantage."],
[9,"Panache","Charm or taunt creatures with Persuasion."],
[13,"Elegant Maneuver","Bonus action: advantage on Acrobatics or Athletics."],
[17,"Master Duelist","Reroll a miss with advantage once per rest."]],g:"A melee duelist rogue."},
{n:"Phantom",c:"Rogue",s:TCE,o:"Rogues who walk alongside death and its spirits.",f:[
[3,"Whispers of the Dead","Gain a new skill or tool proficiency each rest."],
[3,"Wails from the Grave","After a Sneak Attack, deal half that damage to a second creature."],
[9,"Tokens of the Departed","Capture soul trinkets when creatures die; spend them for bonuses."],
[13,"Ghost Walk","Become spectral, fly, and move through objects."],
[17,"Death's Friend","Wails from the Grave deals damage to both creatures; always have a soul trinket."]],g:"A multi-target necrotic rogue."},
{n:"Soulknife",c:"Rogue",s:TCE,o:"Rogues who manifest psychic blades.",f:[
[3,"Psionic Power","Psionic dice add to failed checks and enable telepathy."],
[3,"Psychic Blades","Summon blades of psychic energy to attack, including a bonus-action strike."],
[9,"Soul Blades","Spend dice to boost missed attacks or teleport."],
[13,"Psychic Veil","Turn invisible for up to an hour."],
[17,"Rend Mind","Stun a creature with a Sneak Attack through your psychic blades."]],g:"A mind-powered infiltrator."},
// SORCERER
{n:"Clockwork Soul",c:"Sorcerer",s:TCE,o:"Sorcerers infused with the power of cosmic order.",f:[
[1,"Clockwork Magic","Bonus order-themed spells."],
[1,"Restore Balance","Reaction: cancel advantage or disadvantage on a roll."],
[6,"Bastion of Law","Spend sorcery points to create a ward that absorbs damage."],
[14,"Trance of Order","Treat low d20 rolls as 10 and attacks against you lose advantage."],
[18,"Clockwork Cavalcade","Heal, repair, and end spells in an area."]],g:"A defensive, order-themed sorcerer."},
{n:"Lunar Sorcery",c:"Sorcerer",s:DSQ,o:"Sorcerers empowered by the phases of the moon.",f:[
[1,"Lunar Embodiment","Bonus spells based on the current phase (full, new, crescent)."],
[1,"Moon Fire","Learn a radiant beam cantrip."],
[6,"Lunar Boons","Reduce metamagic cost for spells of the current phase."],
[6,"Waxing and Waning","Change phase as a bonus action."],
[14,"Lunar Empowerment","Phase-specific passive benefit."],
[18,"Lunar Phenomenon","Burst of phase-specific power."]],g:"A flexible sorcerer that changes spell lists.",r:"Moon"},
// WARLOCK
{n:"The Fathomless (Patron)",c:"Warlock",s:TCE,o:"A patron of the deep ocean.",f:[
[1,"Tentacle of the Deeps","Summon a spectral tentacle that strikes and slows."],
[1,"Gift of the Sea","Swimming speed and water breathing."],
[6,"Oceanic Soul","Cold resistance and underwater communication."],
[6,"Guardian Coil","Reaction: the tentacle reduces damage to an ally."],
[10,"Grasping Tentacles","Once per long rest, cast the black-tentacles spell without a slot; damage it deals to you can't break your concentration as easily."],
[14,"Fathomless Plunge","Teleport yourself and allies to a body of water."]],g:"A sea-themed controller warlock."},
{n:"The Genie (Patron)",c:"Warlock",s:TCE,o:"A patron who is a noble genie of one of the four elements.",f:[
[1,"Genie's Vessel","A small vessel you can enter to rest; add elemental damage once per turn."],
[6,"Elemental Gift","Resistance based on genie kind; fly briefly."],
[10,"Sanctuary Vessel","Bring allies into the vessel; resting there is faster."],
[14,"Limited Wish","Cast any 6th-level-or-lower spell once per long rest."]],g:"A flexible, elemental warlock."},
{n:"The Undying (Patron)",c:"Warlock",s:SCAG,o:"A patron who has cheated death.",f:[
[1,"Among the Dead","Learn spare the dying; undead have trouble attacking you."],
[6,"Defy Death","Regain hit points when you succeed on a death save or stabilize someone."],
[10,"Undying Nature","Need no food, water, or air; age slowly."],
[14,"Indestructible Life","Bonus action: regain hit points and reattach limbs."]],g:"A durable, death-flavored warlock."},
{n:"The Undead (Patron)",c:"Warlock",s:VRGR,o:"A patron that is a powerful undead being.",f:[
[1,"Form of Dread","Transform to gain temporary hit points, fear immunity, and a fear-inflicting hit."],
[6,"Grave Touched","Change attack damage to necrotic and add a die once per turn."],
[10,"Necrotic Husk","Necrotic resistance; explode into necrotic energy when you drop to 0."],
[14,"Spirit Projection","Project your spirit, flying and passing through objects."]],g:"A horror-themed warlock."},
// WIZARD
{n:"School of Abjuration (Wizard)",c:"Wizard",s:PHB,o:"Wizards of protective and warding magic.",f:[
[2,"Abjuration Savant","Copy abjuration spells cheaply."],
[2,"Arcane Ward","Create a ward that absorbs damage and recharges when you cast abjuration spells."],
[6,"Projected Ward","Use the ward to protect an ally."],
[10,"Improved Abjuration","Add proficiency to counterspell and dispel magic checks."],
[14,"Spell Resistance","Advantage on saves against spells and resistance to spell damage."]],g:"A durable defensive wizard.",sch:"Abjuration"},
{n:"School of Conjuration (Wizard)",c:"Wizard",s:PHB,o:"Wizards who summon creatures and objects.",f:[
[2,"Conjuration Savant","Copy conjuration spells cheaply."],
[2,"Minor Conjuration","Create a small nonmagical object for an hour."],
[6,"Benign Transposition","Teleport or swap places with an ally."],
[10,"Focused Conjuration","Damage can't break concentration on conjuration spells."],
[14,"Durable Summons","Summoned creatures gain temporary hit points."]],g:"A summoner wizard.",sch:"Conjuration"},
{n:"School of Divination (Wizard)",c:"Wizard",s:PHB,o:"Wizards who read the future.",f:[
[2,"Divination Savant","Copy divination spells cheaply."],
[2,"Portent","Roll two d20s after each long rest and swap them in for any creature's rolls."],
[6,"Expert Divination","Casting divination spells regains lower-level slots."],
[10,"The Third Eye","Choose a sense such as darkvision or seeing invisibility."],
[14,"Greater Portent","Roll three Portent dice."]],g:"The fate-bending wizard.",sch:"Divination"},
{n:"School of Enchantment (Wizard)",c:"Wizard",s:PHB,o:"Wizards who charm and bewilder.",f:[
[2,"Enchantment Savant","Copy enchantment spells cheaply."],
[2,"Hypnotic Gaze","Charm and incapacitate a nearby creature."],
[6,"Instinctive Charm","Reaction: redirect an attack against you to another creature."],
[10,"Split Enchantment","Single-target enchantments can target two creatures."],
[14,"Alter Memories","Make charmed creatures forget the charm."]],g:"A social-control wizard.",sch:"Enchantment"},
{n:"School of Illusion (Wizard)",c:"Wizard",s:PHB,o:"Wizards of deception and phantasm.",f:[
[2,"Illusion Savant","Copy illusion spells cheaply."],
[2,"Improved Minor Illusion","Minor illusion creates sound and image together."],
[6,"Malleable Illusions","Change illusions you're maintaining."],
[10,"Illusory Self","Reaction: an illusion makes an attack miss."],
[14,"Illusory Reality","Make part of an illusion briefly real."]],g:"A creative trickster wizard.",sch:"Illusion"},
{n:"School of Transmutation (Wizard)",c:"Wizard",s:PHB,o:"Wizards who change matter and form.",f:[
[2,"Transmutation Savant","Copy transmutation spells cheaply."],
[2,"Minor Alchemy","Temporarily change a material into another."],
[6,"Transmuter's Stone","Craft a stone that grants a chosen benefit."],
[10,"Shapechanger","Cast polymorph on yourself without a slot once per rest."],
[14,"Master Transmuter","Destroy the stone for a major effect such as restoring youth or raising the dead."]],g:"A utility wizard. Pairs well with this vault's Alchemy-style professions.",sch:"Transmutation"},
{n:"Order of Scribes",c:"Wizard",s:TCE,o:"Wizards whose spellbook is awakened and alive.",f:[
[2,"Wizardly Quill","A magic quill that copies spells quickly."],
[2,"Awakened Spellbook","Swap a spell's damage type and cast rituals quickly."],
[6,"Manifest Mind","Project the book's mind as a spectral point to cast from."],
[10,"Master Scrivener","Create a scroll from your book after a rest."],
[14,"One with the Word","Use the book to avoid damage, at the cost of forgetting spells temporarily."]],g:"A flexible wizard built around the spellbook."}
];
