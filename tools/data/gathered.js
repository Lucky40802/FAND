// Ores, herbs and flora, and small fauna gathered in each realm. Website additions (original), built into the material list.
module.exports = [
  // [name, realm, grade, kind, description (1 sentence), where found (short), alchemy effect or null]

  // ===== ORES =====
  // Human (Mortal Realm)
  ["Pyrite", "Human", 1, "ore", "Brassy cubes of fool's gold that throw sparks when struck against flint, prized more by con men than smiths.", "Shale seams and riverbeds in hill country", null],
  ["Lodestone", "Human", 2, "ore", "Naturally magnetic black stone that always turns one face north, used for compasses and dowsing rods.", "Lightning-struck iron hills", null],
  ["Tungsten Ore", "Human", 3, "ore", "Heavy dark ore that refuses to melt in common forges and makes the hardest drill bits and arrowheads.", "Deep granite veins beside tin lodes", null],
  ["Rose Gold", "Human", 3, "ore", "Copper-blushed natural gold that jewellers favour for wedding rings and noble seals.", "Placer gravels below copper hills", null],
  ["White Gold", "Human", 4, "ore", "Pale gold naturally alloyed with nickel, prized for crowns because it never shows a fingerprint.", "Quartz reefs in northern mountains", null],
  ["Wootz Steel", "Human", 5, "ore", "Crucible-cake steel from southern furnaces whose blades carry rippled carbide patterns and an unreal edge.", "Smelted in sealed clay crucibles in desert kingdoms", null],
  ["Damascus Steel", "Human", 5, "ore", "Pattern-welded billets of hard and soft iron folded until the grain runs like flowing water.", "Master forges in old trade cities", null],
  ["Tamahagane", "Human", 6, "ore", "Bloom steel won from black iron sand in a three-day clay furnace, sorted by hand into hard and soft pieces.", "Coastal iron-sand beaches and river deltas", null],
  ["Dwarf-Steel", "Human", 7, "ore", "Dense, faintly warm steel smelted by mountain clans with secret fluxes that keep its edge for a century.", "Clan forge-halls under the highest peaks", null],

  // Mysterious
  ["Witchsilver", "Mysterious", 3, "ore", "Tarnish-free silver that hums near hexes and is traded by hedge witches at crossroads.", "Crossroads barrows and fairy mounds", null],
  ["Frost Iron", "Mysterious", 4, "ore", "Iron from the winter courts that stays bitterly cold to the touch and rimes with frost in summer.", "Winter-court glens where snow never melts", null],
  ["Dreamsilver", "Mysterious", 5, "ore", "Soft silver that remembers the dreams of whoever sleeps near it and shows them faintly on its surface.", "Under the pillows of sleeping hills in fey pockets", "Burn: filings burned as incense let you enter the dream of one sleeping creature within 30 ft for up to 10 minutes, as if you were present; DC 13 Wis save negates."],
  ["Mirrorsteel", "Mysterious", 6, "ore", "Steel pulled from behind looking-glasses, polished so perfectly it reflects things that are not in the room.", "The far side of old mirrors and still ponds", null],
  ["Hihiirokane", "Mysterious", 7, "ore", "Legendary sun-red metal that never rusts and is warm as a hearth, said to be found where spirits sleep.", "Shrine roots at the spirit edge", null],

  // Hell
  ["Ember Iron", "Hell", 2, "ore", "Iron that smoulders red at its core forever, so tools made from it never need a forge to stay hot.", "Ash fields of the outer circles", null],
  ["Bloodsteel", "Hell", 4, "ore", "Dark crimson steel quenched in the blood of the damned that drinks a little of every wound it makes.", "Torture-pit foundries", null],
  ["Penance Iron", "Hell", 5, "ore", "Heavy grey iron that grows heavier for anyone carrying guilt, used for shackles and penitent armour.", "Chain-quarries of the judgment circles", null],
  ["Sinbrass", "Hell", 6, "ore", "Gleaming brass that swells and brightens near greed, worked into devil coin and contract seals.", "Vaults beneath infernal counting-houses", null],
  ["Ashen Adamant", "Hell", 8, "ore", "Raw adamant blackened by hellfire, near unbreakable and wreathed in faint smoke.", "Magma veins beneath the deepest pits", null],

  // Heaven
  ["Hallowed Tin", "Heaven", 1, "ore", "Bright tin that rings like a bell when tapped, used for censers and small holy bells.", "Cloud-shore streams below the gates", null],
  ["Choir Bronze", "Heaven", 3, "ore", "Golden bronze cast into the great bells of Heaven, which sings a single note when struck.", "Bell-foundries of the lower choirs", null],
  ["Sunsteel Ore", "Heaven", 5, "ore", "Steel ore that holds daylight inside it and glows softly for hours after the sun sets.", "Sunward cliffs of the high meadows", null],
  ["Seraph Gold", "Heaven", 7, "ore", "Radiant gold too pure to tarnish that burns fiends who touch it bare-handed.", "Riverbeds beneath the thrones", null],
  ["Sun Orichalcum", "Heaven", 9, "ore", "A blazing orichalcum variant flecked with living light, worked only by angelic smiths.", "Molten seams in the sunwell crater", null],

  // Chaos
  ["Quick Iron", "Chaos", 2, "ore", "Restless iron that creeps across the ground when no one watches and snaps back into shape when bent.", "Shifting scree slopes of the Chaos Realm", "Drink: a pinch of powdered quick iron in wine raises your speed by 10 ft and lets you Dash as a bonus action for 1 minute."],
  ["Thunder Iron", "Chaos", 4, "ore", "Storm-charged iron that cracks with lightning when struck and leaves the smith's hair standing.", "Storm peaks where lightning never stops", null],
  ["Kaleidoscope Ore", "Chaos", 5, "ore", "Ore whose colour, weight and hardness change every hour, maddening to smiths and loved by tricksters.", "Prismatic canyons of unstable stone", null],
  ["Living Metal", "Chaos", 6, "ore", "Warm, pulsing metal that slowly heals its own scratches and flinches from flame.", "Breathing veins in the walls of chaos caverns", "Salve: rubbed into a wound it knits flesh like metal, restoring 3d8+6 hit points and granting +1 AC for 10 minutes."],
  ["Storm Orichalcum", "Chaos", 8, "ore", "A violent orichalcum variant laced with trapped lightning that arcs between ingots stored too close.", "Eye of the endless tempest", null],

  // Abyss
  ["Brine Iron", "Abyss", 2, "ore", "Sea-black iron that never rusts in salt water because it was born in it.", "Shallow shelves of the Abyssal sea", null],
  ["Pressure Lead", "Abyss", 3, "ore", "Lead crushed so dense by the deep that a fist-sized lump weighs as much as a man.", "Seafloor trenches", null],
  ["Gulf Steel", "Abyss", 5, "ore", "Blue-black steel from the gulf vents that keeps its edge under any weight of water.", "Hydrothermal vents of the drowned gulf", null],
  ["Leviathan Gold", "Abyss", 7, "ore", "Gold swallowed and passed by leviathans over centuries, smooth as river stone and faintly magical.", "Leviathan graveyards on the abyssal plain", null],
  ["Abyss Adamant", "Abyss", 9, "ore", "Raw adamant formed under the weight of the whole Abyss, darker than ink and colder than ice.", "The lightless floor of the deepest trench", null],

  // Inner Realm
  ["Edict Iron", "Inner Realm", 3, "ore", "Iron stamped by nature with tiny geometric marks, used for courthouse doors and binding cuffs.", "Fault lines beneath Law anchors", null],
  ["Axiom Gold", "Inner Realm", 5, "ore", "Gold whose crystals grow in perfect ratios, so any coin of it weighs exactly the same as any other.", "Lattice caves near the Law of Measure", null],
  ["Tribunal Steel", "Inner Realm", 6, "ore", "Grey steel that grows harder when it is used to keep a sworn oath and softer when it is used to break one.", "Forges around the Hall of Judgment", null],
  ["Keystone Platinum", "Inner Realm", 7, "ore", "Platinum from the roots of an anchored Law that holds enchantments without ever drifting.", "Root vaults of the Law anchors", null],
  ["Anchor Adamant", "Inner Realm", 9, "ore", "Raw adamant that cannot be moved by magic, teleportation or force once set in place.", "Bedrock pinned beneath the greatest Laws", null],

  // Outer Realm
  ["Astral Bronze", "Outer Realm", 2, "ore", "Silvery bronze that floats a little when let go, used for Astral ship fittings.", "Drifting islands just past the Astral", null],
  ["Star-Iron", "Outer Realm", 3, "ore", "Meteoric iron fallen from the outer stars, pitted, cold and faintly magnetic to magic.", "Impact craters on outer islands", null],
  ["Moonsteel", "Outer Realm", 5, "ore", "Pale steel mined from shattered moons that waxes stronger and wanes softer with their cycle.", "Broken moons orbiting the far shore", null],
  ["Farshore Electrum", "Outer Realm", 6, "ore", "Gold-silver alloy from the farthest shores that conducts spells over great distances.", "Beaches at the edge of known space", null],
  ["Orbit Orichalcum", "Outer Realm", 8, "ore", "An orichalcum variant that circles anything heavy set near it, forged into returning weapons.", "Rings around dead worlds", null],

  // Void
  ["Hush Iron", "Void", 2, "ore", "Iron that makes no sound however hard it is struck, favoured for thieves' tools.", "Silent drifts at the Void's edge", null],
  ["Pale Lead", "Void", 3, "ore", "Colourless lead that blocks scrying and sight like a wall of nothing.", "Grey shoals of the Void", null],
  ["Silence Steel", "Void", 5, "ore", "Steel that swallows spells cast near it, leaving only a faint chill.", "Hollows where light goes out", null],
  ["Unlit Gold", "Void", 7, "ore", "Gold that reflects no light at all and appears as a gold-shaped hole in the world.", "Deep Void caverns", null],
  ["Absence Adamant", "Void", 9, "ore", "Raw adamant that is mostly not there, cutting things by erasing the space they occupy.", "The edges of true nothing", null],

  // Inner Void
  ["Inward Iron", "Inner Void", 3, "ore", "Iron that bends in toward its own centre over time, so blades of it curl unless kept straight by will.", "Spiral caverns of the Inner Void", null],
  ["Underlight Silver", "Inner Void", 5, "ore", "Silver that glows from the inside with a light that illuminates nothing around it.", "Pockets beneath the Inner Void crust", null],
  ["Ouroboros Steel", "Inner Void", 6, "ore", "Ring-shaped steel ore that regrows anything cut from it within a day.", "Looping tunnels that end where they begin", null],
  ["Kernel Gold", "Inner Void", 8, "ore", "Gold from the innermost core of the Inner Void, so dense with meaning it changes the weight of words spoken near it.", "The Inner Void kernel", null],
  ["Singular Adamant", "Inner Void", 10, "ore", "A single point of raw adamant that unfolds into a full ingot only when touched by a worthy smith.", "The collapse point at the centre of the Inner Void", null],

  // Primordial
  ["Dawnmetal", "Primordial", 4, "ore", "The first metal ever made, warm, golden and quick to take any shape asked of it.", "Strata from before the first sunrise", null],
  ["Godmarrow Iron", "Primordial", 5, "ore", "Iron grown in the marrow of fallen gods that still faintly answers prayer.", "Cracked bones of dead gods", null],
  ["Dragonsteel", "Primordial", 6, "ore", "Scale-patterned steel smelted from the hoard-beds of the progenitor dragons, warm as a living hide.", "Hoard-beds of the first dragons", null],
  ["Progenitor Gold", "Primordial", 8, "ore", "Gold from the bodies of the progenitors that slowly makes anything it touches more alive.", "Veins in progenitor remains", null],
  ["Raw Adamant", "Primordial", 10, "ore", "Unworked adamant from the world's foundation, the hardest substance that exists.", "The bones of creation", null],

  // ===== HERBS AND FLORA =====
  // Human
  ["Hearthleaf", "Human", 1, "herb", "Broad fuzzy leaves that grow by every cottage door and smell of fresh bread when crushed.", "Cottage gardens and hedgerows", "Drink: regain 2d4+2 hit points."],
  ["Wolfsbane Root", "Human", 2, "herb", "Purple-hooded flower whose root shapechangers fear more than silver.", "Shaded forest edges", "Coat: for 1 minute a shapechanger hit takes an extra 1d6 poison damage and must succeed on a DC 12 Con save or be unable to change shape for 1 minute."],
  ["Barrow Yarrow", "Human", 2, "herb", "Feathery white yarrow from old battlefields that stops bleeding on contact.", "Barrows and old battlefields", "Salve: a dying creature is stabilized, regains 1d6+2 hit points and ends any bleeding effect."],
  ["Nightshade Berry", "Human", 3, "herb", "Glossy black berries that look like a sweet treat and kill like a curse.", "Ruined walls and graveyards", "Coat: for 1 minute a creature hit must succeed on a DC 13 Con save or take 2d6 poison damage and be poisoned for 1 minute."],
  ["Owlseye Moss", "Human", 3, "herb", "Pale moss with tiny golden spore-heads that glimmer like eyes in the dark.", "North faces of old trees", "Drink: darkvision out to 60 ft for 1 hour."],
  ["Ironbark Resin", "Human", 4, "herb", "Amber sap from ironbark trees that sets as hard as horn.", "Ancient oak forests", "Drink: your skin hardens, granting +1 AC for 10 minutes."],
  ["Sleepwort", "Human", 4, "herb", "Drooping blue bells whose smoke has quieted many a feverish child and many a guard.", "Damp meadows", "Burn: each creature in a 15-ft cube must succeed on a DC 13 Con save or fall asleep for 1 minute or until damaged."],
  ["Crownmallow", "Human", 6, "herb", "Tall purple mallow once grown only in royal gardens for its healing roots.", "Palace gardens and monastery cloisters", "Drink: regain 4d4+4 hit points and end the poisoned condition."],
  ["Dragonblood Pepper", "Human", 7, "herb", "Scarlet pepper said to have sprouted where a dragon bled, hot enough to blister the tongue.", "Volcanic hillsides", "Drink: resistance to cold damage for 8 hours; once in that time you can exhale fire in a 15-ft cone (DC 14 Dex, 4d6 fire, half on success)."],
  ["Elder Mandrake Root", "Human", 8, "herb", "A man-shaped root a century old whose scream when pulled can stop a heart.", "Gallows hills under the full moon", "Drink: regain 6d4+6 hit points and gain 10 temporary hit points for 1 hour."],

  // Mysterious
  ["Fairy Ring Puffball", "Mysterious", 1, "herb", "Round white puffballs that grow in perfect circles and burst into glittering spores.", "Fairy rings in moonlit meadows", "Burn: each creature in a 10-ft radius must succeed on a DC 12 Wis save or be compelled to dance for 1 minute (speed halved, disadvantage on attack rolls)."],
  ["Ghostcap", "Mysterious", 2, "herb", "Translucent mushrooms that are only visible out of the corner of the eye.", "Spirit-edge woods at dusk", "Drink: for 1 hour you can see invisible spirits within 30 ft."],
  ["Mirrorbloom", "Mysterious", 3, "herb", "Silver-petalled flower that grows on the reflection of a pond rather than the bank.", "Reflections of still water", "Drink: for 10 minutes you know when a creature within 30 ft is disguised or under an illusion, though not its true form."],
  ["Changeling Thyme", "Mysterious", 4, "herb", "Thyme whose leaves never look the same twice and smell of whatever you last ate.", "Changeling cradles and fey thresholds", "Drink: you can alter your appearance as the disguise self spell for 1 hour."],
  ["Moonmilk Lily", "Mysterious", 5, "herb", "A lily that drips white nectar only under moonlight.", "Moonlit fey lakes", "Drink: regain 4d4+4 hit points, or 4d4+8 if drunk at night."],
  ["Hollowhill Root", "Mysterious", 6, "herb", "A pale root that grows through the walls between mirrors and the fey pockets behind them.", "Inside hollow hills", "Drink: once within 1 hour you can step into a mirror or still water surface you touch and emerge from another within 1 mile."],
  ["Thistlewing Seed", "Mysterious", 7, "herb", "Huge downy thistle seeds that drift upward against the wind.", "Fey highlands", "Drink: fly speed 30 ft (hover) for 10 minutes."],
  ["Dreaming Poppy", "Mysterious", 8, "herb", "Violet poppies that pull sleepers into a shared fey dream.", "Sleeping fields of the fey courts", "Burn: each creature in a 20-ft radius must succeed on a DC 15 Wis save or fall into a magical sleep for 1 hour, all sleepers sharing one dream."],

  // Hell
  ["Brimstone Nettle", "Hell", 1, "herb", "Yellow nettles whose stings leave sulphur burns.", "Ash wastes of the outer circles", "Coat: for 1 minute hits deal an extra 1d4 fire damage."],
  ["Sinner's Thorn", "Hell", 2, "herb", "Black briars that grow fastest around the guilty.", "Prison hedges of Hell", "Coat: for 1 minute a creature hit must succeed on a DC 13 Con save or take 2d6 poison damage and be unable to regain hit points until the end of its next turn."],
  ["Cinderbloom", "Hell", 3, "herb", "A flower of living embers that wilts in cool air.", "Lava-lit cliffs", "Drink: resistance to fire damage for 1 hour."],
  ["Wrathroot", "Hell", 5, "herb", "A gnarled red root that steams with anger when cut.", "Battlefields of the wrath circle", "Drink: regain 3d8 hit points and gain resistance to bludgeoning, piercing and slashing damage for 1 minute, but you have disadvantage on Wis saves."],
  ["Ashlily", "Hell", 6, "herb", "A grey lily that blooms only in fresh ash and smells of rain.", "Burnt-out ruins of Hell", "Salve: regain 4d8+8 hit points and gain immunity to fire damage for 1 minute."],
  ["Ledgerfern", "Hell", 7, "herb", "Fern fronds whose veins form columns of tiny infernal numerals.", "Archives of the counting circle", "Burn: each creature in a 20-ft radius must succeed on a DC 15 Cha save or be unable to speak a deliberate lie for 10 minutes."],
  ["Pit Hellebore", "Hell", 8, "herb", "Black hellebore that grows at the rims of the deepest pits.", "Rims of the deepest pits", "Coat: for 1 minute a creature hit must make a DC 16 Con save, taking 6d8 poison damage and being poisoned for 1 minute on a failure, or half as much damage on a success."],

  // Heaven
  ["Halo Clover", "Heaven", 1, "herb", "Four-leafed clover ringed by a faint gold glow.", "Meadows below the gates", "Drink: regain 2d4+4 hit points and add 1d4 to your next saving throw within 1 hour."],
  ["Dawnpetal", "Heaven", 3, "herb", "Rose-gold petals that open at the first light of each day.", "Eastern slopes of the high meadows", "Salve: regain 3d4+3 hit points and end the blinded condition."],
  ["Seraph Sage", "Heaven", 4, "herb", "Silver sage whose smoke burns fiends and stings the undead.", "Temple gardens of Heaven", "Burn: each fiend or undead in a 20-ft radius must succeed on a DC 14 Wis save or be frightened for 1 minute."],
  ["Mercy Moss", "Heaven", 5, "herb", "Soft white moss that grows on the steps of healing halls.", "Steps of the halls of mercy", "Drink: regain 4d8+4 hit points and end one disease or the poisoned condition."],
  ["Gracewheat", "Heaven", 6, "herb", "Golden wheat whose grains glow faintly in the dark.", "Fields tended by angels", "Brew: baked into bread; up to 10 creatures who eat it regain 2d8 hit points and need no other food for 3 days."],
  ["Gloria Myrrh", "Heaven", 7, "herb", "Fragrant resin wept by trees that stand beside the thrones.", "Groves around the thrones", "Burn: for 1 hour a 30-ft radius is sanctified; allies inside add 1d4 to saves and fiends and undead have disadvantage on attack rolls."],
  ["Sunwell Lotus", "Heaven", 8, "herb", "A blazing white lotus that floats on the pool where Heaven's light is drawn.", "The sunwell pool", "Drink: regain 8d8+16 hit points and gain resistance to necrotic and radiant damage for 1 hour."],

  // Chaos
  ["Shiftgrass", "Chaos", 1, "herb", "Grass that changes colour and length each time you look away.", "Chaos plains", "Drink: roll 1d6 for a random resistance (acid, cold, fire, lightning, poison, thunder) lasting 1 hour."],
  ["Mad Morel", "Chaos", 3, "herb", "Twisting morels whose spores whisper nonsense.", "Fungal tangles in chaos caverns", "Burn: each creature in a 15-ft radius must succeed on a DC 14 Wis save or be affected as the confusion spell for 1 minute (save repeats each turn)."],
  ["Stormthistle", "Chaos", 4, "herb", "Spiky thistle that crackles with static and draws lightning.", "Storm peaks", "Coat: for 1 minute hits deal an extra 1d8 lightning damage and a creature hit cannot take reactions until its next turn."],
  ["Entropy Gourd", "Chaos", 5, "herb", "A lopsided gourd whose flesh is different in every slice.", "Wild vines of the Chaos Realm", "Drink: regain 1d100 hit points (minimum 4d8)."],
  ["Kaleid Fern", "Chaos", 6, "herb", "Fronds of shifting prismatic colours that flicker in and out of sight.", "Prismatic canyons", "Drink: you are affected as the blink spell for 1 minute."],
  ["Unravel Ivy", "Chaos", 7, "herb", "Ivy that loosens anything it grows on, stone, rope or spell.", "Ruined fortresses of Chaos", "Coat: for 1 minute a creature hit must succeed on a DC 16 Con save or take 5d10 force damage and lose its resistances until the end of its next turn."],
  ["Possibility Bloom", "Chaos", 8, "herb", "A flower that blooms in a different shape for each person who sees it.", "The heart of the storm", "Drink: roll two d20s and record them; within 8 hours you can replace any attack roll, check or save made by you or a creature you can see with one of them."],

  // Abyss
  ["Trench Kelp", "Abyss", 1, "herb", "Rubbery black kelp that grows toward the dark instead of the light.", "Abyssal shelves", "Drink: you can breathe water for 1 hour."],
  ["Lantern Algae", "Abyss", 2, "herb", "Glowing blue-green algae that coats the walls of deep caves.", "Sea caves of the Abyss", "Drink: darkvision out to 120 ft for 1 hour."],
  ["Drowning Lily", "Abyss", 4, "herb", "A pale lily whose sap fills the lungs with brine.", "Drowned ruins", "Coat: for 1 minute a creature hit must succeed on a DC 14 Con save or take 3d8 poison damage and be unable to speak for 1 minute."],
  ["Gulf Sargasso", "Abyss", 5, "herb", "Golden floating weed that drifts in endless rafts over the drowned gulf.", "Surface rafts above the gulf", "Brew: swim speed 60 ft and blindsight 30 ft underwater for 1 hour."],
  ["Pearlweed", "Abyss", 6, "herb", "Seagrass that grows tiny pearls in its stems under crushing pressure.", "Pressure plains", "Drink: regain 6d8+6 hit points and for 1 hour you cannot be moved against your will."],
  ["Nethersea Wrack", "Abyss", 7, "herb", "Black seaweed that rots everything it touches except itself.", "Lightless seafloor", "Coat: for 1 minute a creature hit must succeed on a DC 17 Con save or take 6d10 necrotic damage, its hit point maximum reduced by the same amount until a long rest."],
  ["Leviathan Kelp", "Abyss", 8, "herb", "Towering kelp forests that leviathans graze on.", "Leviathan grazing grounds", "Drink: regain 8d8+8 hit points and gain 20 temporary hit points for 1 hour."],

  // Inner Realm
  ["Edict Clover", "Inner Realm", 1, "herb", "Clover with exactly three leaves, every time, without exception.", "Fields near minor Law anchors", "Drink: regain 4d8 hit points and end the charmed condition."],
  ["Oathgrass", "Inner Realm", 2, "herb", "Stiff grass that only grows where a vow was kept.", "Old oath-stones", "Drink: for 1 hour you cannot speak a deliberate lie, and creatures who hear you know your words are true."],
  ["Measure Moss", "Inner Realm", 3, "herb", "Moss that grows in exact squares across stone.", "Walls of the Law of Measure", "Burn: for 10 minutes invisible creatures and illusions within 30 ft of the smoke are outlined and revealed."],
  ["Verdict Hemlock", "Inner Realm", 5, "herb", "Hemlock that grows at the foot of judgment halls.", "Below the judgment halls", "Coat: for 1 minute a creature hit must succeed on a DC 16 Con save or take 5d8 poison damage, doubled if it has broken an oath."],
  ["Keystone Rose", "Inner Realm", 6, "herb", "A grey rose that grows from the keystone of every Law anchor.", "Law anchor arches", "Salve: regain 6d10 hit points and end one condition of your choice."],
  ["Lawbinder Ivy", "Inner Realm", 8, "herb", "Iron-grey ivy that pins things in place by Law.", "Walls of the great anchors", "Burn: for 10 minutes no creature in a 30-ft radius can teleport, plane shift or change shape unless it succeeds on a DC 18 Cha save each attempt."],
  ["Judgment Lotus", "Inner Realm", 9, "herb", "A white lotus floating in the scales of the great tribunal.", "The tribunal pools", "Drink: regain 10d10 hit points and gain immunity to being charmed or frightened for 1 hour."],

  // Outer Realm
  ["Starmoss", "Outer Realm", 1, "herb", "Moss sprinkled with tiny points of light like a night sky.", "Outer island cliffs", "Drink: darkvision out to 120 ft for 1 hour and you can see through magical darkness within 10 ft."],
  ["Comet Fern", "Outer Realm", 2, "herb", "Fern with streaming silver tails that point away from the nearest star.", "Comet trails", "Drink: your speed increases by 20 ft for 10 minutes."],
  ["Astral Dandelion", "Outer Realm", 3, "herb", "Dandelion clocks whose seeds drift between islands.", "Astral meadows", "Drink: for 1 hour your jump distance is tripled and you fall at 60 ft per round, taking no falling damage."],
  ["Nebula Poppy", "Outer Realm", 4, "herb", "Poppies of shifting purple and blue light.", "Nebula fields", "Burn: a 20-ft radius cloud of starlight is heavily obscured for 1 minute; creatures inside must succeed on a DC 15 Wis save or be blinded while inside."],
  ["Horizon Orchid", "Outer Realm", 6, "herb", "An orchid that always seems farther away than it is.", "The far horizon", "Drink: for 1 minute you can teleport up to 30 ft to a space you can see as a bonus action each turn."],
  ["Farshore Amber", "Outer Realm", 7, "herb", "Golden tree sap from the farthest shores that preserves whatever it touches.", "Farshore forests", "Salve: regain 8d10 hit points and ignore one level of exhaustion for 8 hours."],
  ["Eclipse Bloom", "Outer Realm", 9, "herb", "A black flower ringed with fire that blooms only during eclipses.", "Shadowed moons", "Drink: regain 10d10+10 hit points and become invisible for 1 minute."],

  // Void
  ["Hushmoss", "Void", 1, "herb", "Grey moss that swallows all sound around it.", "Void-edge caverns", "Burn: a 20-ft radius is affected as the silence spell for 1 minute."],
  ["Pale Lichen", "Void", 2, "herb", "Colourless lichen that grows on nothing at all.", "Floating Void debris", "Drink: regain 4d10 hit points."],
  ["Nullthorn", "Void", 3, "herb", "Thorns that cut magic out of the blood.", "Void thickets", "Coat: for 1 minute a creature hit must succeed on a DC 16 Con save or lose concentration and be unable to regain hit points until the end of its next turn."],
  ["Absence Fern", "Void", 5, "herb", "Fern fronds with holes where leaves should be.", "Hollows of the Void", "Drink: resistance to force and necrotic damage for 1 hour."],
  ["Starless Lotus", "Void", 6, "herb", "A black lotus that grows where stars have died.", "Dead-star pools", "Salve: regain 8d10 hit points and remove one level of exhaustion."],
  ["Oblivion Poppy", "Void", 8, "herb", "Grey poppies whose scent erases memory.", "The deep Void", "Burn: each creature in a 20-ft radius must succeed on a DC 18 Int save or forget the last 10 minutes and be incapacitated until the end of its next turn."],
  ["Zero Root", "Void", 9, "herb", "A root that grows into the space between spaces.", "The Void's floor", "Drink: immunity to force, necrotic and psychic damage for 1 minute."],

  // Inner Void
  ["Inward Bloom", "Inner Void", 1, "herb", "A flower whose petals curl inward and never open.", "Spiral caves", "Drink: regain 5d10 hit points and gain advantage on concentration saves for 1 hour."],
  ["Coreseed", "Inner Void", 3, "herb", "A dense black seed heavier than its size suggests.", "Kernel caverns", "Drink: for 1 hour you cannot be knocked prone or moved against your will, and your weight triples."],
  ["Recursion Fern", "Inner Void", 4, "herb", "Fern whose fronds are made of smaller fronds forever.", "Looping tunnels", "Drink: once within 1 minute, when you take damage, you can reduce it by 5d10."],
  ["Collapse Thistle", "Inner Void", 5, "herb", "A thistle that implodes into dust when picked.", "Collapse zones", "Coat: for 1 minute a creature hit must succeed on a DC 17 Str save or take 6d10 force damage and be pulled 15 ft toward you."],
  ["Ouroboros Vine", "Inner Void", 6, "herb", "A vine that grows in a perfect loop, eating its own tip.", "Ouroboros tunnels", "Drink: for 1 minute you regain 15 hit points at the start of each of your turns."],
  ["Kernel Lotus", "Inner Void", 8, "herb", "A dark lotus at the core of the Inner Void that drinks in light.", "The kernel pool", "Drink: regain 12d10 hit points and gain resistance to all damage for 1 minute."],
  ["Unbeing Rose", "Inner Void", 10, "herb", "A rose that exists only when no one is looking at it.", "The centre of the Inner Void", "Coat: for 1 minute a creature hit must succeed on a DC 20 Con save or take 12d10 force damage, or half on a success; a creature reduced to 0 hit points is erased without remains."],

  // Primordial
  ["Firstgrass", "Primordial", 1, "herb", "The first grass to ever grow, impossibly green and soft.", "Primordial plains", "Drink: regain 6d10 hit points."],
  ["Godmarrow Fungus", "Primordial", 3, "herb", "Golden fungus that grows inside the bones of dead gods.", "Inside god-bones", "Drink: regain 8d10 hit points and gain advantage on all saving throws for 10 minutes."],
  ["Ichor Lily", "Primordial", 5, "herb", "A lily that blooms red-gold where divine ichor has spilled.", "God-blood pools", "Salve: regain 10d10 hit points and end all conditions."],
  ["Worldtree Sap", "Primordial", 6, "herb", "Sap from the roots of the first tree that held the world together.", "Roots of the first tree", "Drink: regain 12d10 hit points and your hit point maximum increases by 20 for 8 hours."],
  ["Progenitor Ginseng", "Primordial", 7, "herb", "A root shaped like a sleeping progenitor that pulses like a heartbeat.", "Progenitor graves", "Drink: regain 14d10 hit points and gain 30 temporary hit points for 1 hour."],
  ["Elderwyrm Pepper", "Primordial", 8, "herb", "A pepper from the first dragons' hoards that burns like their breath.", "Progenitor dragon hoards", "Drink: for 1 hour you can use an action to exhale fire in a 60-ft cone (DC 19 Dex, 12d10 fire, half on success) once per minute."],
  ["Genesis Seed", "Primordial", 10, "herb", "A seed from before creation that holds a whole forest inside it.", "The world's foundation", "Drink: regain all hit points, end all conditions and curses, and gain immunity to death effects for 24 hours."],

  // ===== FAUNA =====
  // Human
  ["Hedge Honey", "Human", 1, "fauna", "Dark wildflower honey from hedgerow bees, sweet and slightly medicinal.", "Wild hives in hedgerows", "Drink: regain 1d4+2 hit points and end a cough or sore throat."],
  ["Marsh Leech", "Human", 2, "fauna", "Fat black leeches that draw out poison as well as blood.", "Marsh pools", "Salve: applied to a wound, ends the poisoned condition after 1 minute."],
  ["Blister Toad", "Human", 4, "fauna", "A warty orange toad whose skin oozes paralytic slime.", "Swamp edges", "Coat: for 1 minute a creature hit must succeed on a DC 13 Con save or be paralyzed until the end of its next turn."],
  ["Ember Salamander Tail", "Human", 5, "fauna", "The shed tail of a fire salamander, still warm and glowing.", "Volcanic vents and charcoal pits", "Drink: resistance to fire damage for 1 hour and you regain 2d8 hit points."],

  // Mysterious
  ["Wisp Firefly", "Mysterious", 1, "fauna", "Fireflies that lead travellers astray or home, depending on their mood.", "Fey bogs", "Drink: you shed bright light in a 10-ft radius for 1 hour and advantage on Survival checks to navigate."],
  ["Spirit Snail", "Mysterious", 3, "fauna", "A translucent snail that leaves trails only spirits can see.", "Spirit-edge shrines", "Salve: for 1 hour your touch can affect incorporeal creatures and objects as if they were solid."],
  ["Changeling Toad", "Mysterious", 4, "fauna", "A toad that takes the colour and shape of whatever it sits on.", "Fey stream banks", "Drink: for 1 hour you can become invisible while motionless."],
  ["Dreamweaver Silk", "Mysterious", 5, "fauna", "Silk from spiders that spin webs out of sleepers' dreams.", "Fey dream groves", "Brew: steeped silk lets a creature who drinks it be immune to magical sleep and dream intrusion for 8 hours."],

  // Hell
  ["Sin Leech", "Hell", 3, "fauna", "A red leech that drinks guilt along with blood.", "Penitent pools", "Salve: removes one curse of grade 3 or lower but leaves you poisoned for 1 hour."],
  ["Hellfire Salamander Tail", "Hell", 4, "fauna", "The shed tail of an infernal salamander, smouldering with hellfire.", "Lava rivers", "Drink: immunity to fire damage for 1 hour."],
  ["Ash Wasp Venom", "Hell", 5, "fauna", "Venom from wasps that build nests from cinders.", "Cinder nests", "Coat: for 1 minute a creature hit must succeed on a DC 15 Con save or take 4d8 fire damage and be poisoned for 1 minute."],
  ["Chain Centipede", "Hell", 6, "fauna", "A centipede with iron-ringed segments that rattles like a chain.", "Prison walls", "Coat: for 1 minute a creature hit must succeed on a DC 15 Str save or be restrained for 1 minute (save repeats each turn)."],

  // Heaven
  ["Halo Bee Honey", "Heaven", 2, "fauna", "Golden honey from bees with tiny halos.", "Hives on cloud cliffs", "Drink: regain 3d4+3 hit points and end one disease."],
  ["Dawn Butterfly Scales", "Heaven", 3, "fauna", "Wing scales from butterflies that hatch at dawn.", "Eastern gardens", "Salve: your skin glows with sunlight for 1 hour, shedding bright light 20 ft and dealing 1d6 radiant to undead that touch you."],
  ["Lumen Glowworm", "Heaven", 4, "fauna", "Worms of pure light that live in the cracks of holy stones.", "Temple foundations", "Drink: for 1 hour you see invisible creatures and objects within 30 ft."],
  ["Sunfire Salamander Tail", "Heaven", 7, "fauna", "The radiant shed tail of a celestial salamander.", "The sunwell crater", "Drink: regain 6d8+12 hit points and your weapon attacks deal an extra 2d6 radiant damage for 1 minute."],

  // Chaos
  ["Flux Toad", "Chaos", 2, "fauna", "A toad that changes species every hour.", "Chaos marshes", "Drink: you can cast alter self once within 1 hour (no concentration, lasts 10 minutes)."],
  ["Thunder Eel Gland", "Chaos", 4, "fauna", "The spark gland of an eel that lives in storm clouds.", "Storm clouds", "Coat: for 1 minute hits deal an extra 2d6 lightning damage."],
  ["Madness Moth", "Chaos", 5, "fauna", "A moth whose wing pattern hurts to look at.", "Chaos caverns", "Burn: creatures in a 20-ft radius must succeed on a DC 15 Wis save or take 4d8 psychic damage and be frightened for 1 minute."],
  ["Entropy Beetle", "Chaos", 7, "fauna", "A beetle that ages whatever it crawls across.", "Ruins of Chaos", "Coat: for 1 minute a creature hit must succeed on a DC 17 Con save or take 6d8 necrotic damage and age 1d10 years."],

  // Abyss
  ["Brine Leech", "Abyss", 1, "fauna", "A pale leech that drinks salt from the blood.", "Abyssal shallows", "Salve: for 8 hours you can drink seawater safely and have resistance to cold damage."],
  ["Pressure Snail", "Abyss", 3, "fauna", "A snail with a shell as hard as steel from the crushing deep.", "Seafloor", "Salve: for 1 hour you gain +2 AC."],
  ["Inkling Squid Ink", "Abyss", 6, "fauna", "Ink from tiny squids that drink light.", "Lightless trenches", "Burn: creates a 30-ft radius of magical darkness for 1 minute."],
  ["Abyssal Isopod Shell", "Abyss", 7, "fauna", "The pale armoured shell of a giant deep-sea woodlouse.", "The abyssal floor", "Salve: for 1 hour you gain resistance to bludgeoning, piercing and slashing damage."],

  // Inner Realm
  ["Ledger Ant", "Inner Realm", 1, "fauna", "Ants that march in perfect columns and count everything they carry.", "Law anchor gardens", "Drink: for 1 hour you know the exact number of any group of objects you see."],
  ["Oath Beetle", "Inner Realm", 3, "fauna", "A beetle that dies if its keeper breaks an oath.", "Oath-stones", "Brew: two creatures who share the brew each know if the other breaks a stated promise within 30 days."],
  ["Verdict Wasp", "Inner Realm", 5, "fauna", "Grey wasps that sting only the guilty.", "Judgment halls", "Coat: for 1 minute a creature hit must succeed on a DC 16 Con save or take 5d8 poison damage, doubled if it has broken a Law."],
  ["Axiom Spider Silk", "Inner Realm", 7, "fauna", "Silk woven in perfect geometric webs that bind by Law.", "Lattice caves", "Coat: for 1 minute a creature hit must succeed on a DC 18 Str save or be restrained and unable to teleport for 1 minute."],

  // Outer Realm
  ["Comet Firefly", "Outer Realm", 1, "fauna", "Fireflies that trail tiny comet tails.", "Outer island meadows", "Drink: for 1 hour you shed bright light 20 ft and know true north on any plane."],
  ["Astral Krill", "Outer Realm", 3, "fauna", "Tiny glowing krill that swim through the Astral sea.", "Astral currents", "Drink: for 1 hour you can move through the Astral sea at a fly speed of 60 ft."],
  ["Drift Jelly", "Outer Realm", 5, "fauna", "A translucent jellyfish that floats between islands.", "Island gaps", "Drink: fly speed 60 ft for 10 minutes."],
  ["Nebula Spider Silk", "Outer Realm", 7, "fauna", "Silk spun from starlight by spiders that live in nebulae.", "Nebula clouds", "Salve: for 1 hour you are immune to falling damage and can walk on walls and ceilings."],

  // Void
  ["Hush Moth", "Void", 2, "fauna", "A grey moth whose wingbeats swallow sound.", "Silent drifts", "Burn: creatures in a 15-ft radius cannot speak for 1 minute (DC 15 Con negates)."],
  ["Null Leech", "Void", 3, "fauna", "A leech that drinks magic instead of blood.", "Void pools", "Salve: ends one spell of 4th level or lower affecting the creature it is applied to."],
  ["Hollow Snail", "Void", 5, "fauna", "A snail whose shell holds nothing, not even air.", "Hollows of the Void", "Drink: for 1 hour you don't need to breathe and are immune to suffocation."],
  ["Silence Eel", "Void", 7, "fauna", "An eel that swims through nothing and erases what it bites.", "The deep Void", "Coat: for 1 minute a creature hit must succeed on a DC 18 Con save or take 8d10 necrotic damage, half on a success."],

  // Inner Void
  ["Echo Leech", "Inner Void", 3, "fauna", "A leech that drinks echoes of past wounds.", "Inner Void tunnels", "Salve: regain 6d10 hit points."],
  ["Ouroboros Worm", "Inner Void", 4, "fauna", "A worm that eats its own tail forever.", "Looping tunnels", "Drink: for 1 hour, when you drop to 0 hit points, you instead drop to 1 hit point (once)."],
  ["Kernel Bee Honey", "Inner Void", 6, "fauna", "Black honey from bees that feed on the light at the core.", "The kernel hives", "Drink: regain 10d10 hit points and gain advantage on all checks for 10 minutes."],
  ["Collapse Spider Silk", "Inner Void", 8, "fauna", "Silk that pulls itself inward into a tight point.", "Collapse zones", "Coat: for 1 minute a creature hit must succeed on a DC 19 Str save or take 10d10 force damage and be pulled 30 ft toward you."],

  // Primordial
  ["Firstborn Toad", "Primordial", 3, "fauna", "One of the first creatures ever made, a toad that never dies.", "Primordial swamps", "Drink: regain 10d10 hit points."],
  ["Godblood Leech", "Primordial", 5, "fauna", "A golden leech grown fat on divine ichor.", "God-blood pools", "Salve: regain 12d10 hit points and end one curse of any grade."],
  ["Genesis Bee Honey", "Primordial", 8, "fauna", "Honey from the first bees, made from the pollen of creation.", "The first gardens", "Drink: regain 16d10 hit points and gain immunity to poison and disease for 24 hours."],
  ["Progenitor Salamander Tail", "Primordial", 9, "fauna", "The shed tail of a progenitor salamander, still burning with the first fire.", "The first flame", "Drink: immunity to fire damage and your attacks deal an extra 4d10 fire damage for 1 minute."],
];
