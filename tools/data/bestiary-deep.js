// Monsters of the deep realms (website addition, original; owner's request, 2026-11-11). The deep realms were thin, and
// the Inner Realm's dimensions and the Outer Realm's pockets had no natives. Each line becomes a Bestiary monster with a
// generated stat block, corpse parts and materials, like the mythological creatures (data/myth.js).
// Past the Mysterious Realm a monster stands for CR + 10 levels per realm tier past the Mysterious (Hell and Heaven:
// CR + 10, Chaos + 20, Abyss + 30, Inner Realm + 40, Outer Realm + 50, Void + 60, Inner Void + 70, Primordial + 80), so a
// realm's own band of character levels is met by CR 11-20; lower CRs are minions and swarms, higher ones its bosses.
// Name|CR|Realm code|Body plan|Dimension (or blank)|Description|Habitat
// Body plans: beast bird reptile dragon insect aquatic aberration undead construct ooze elemental fiend celestial plant giant fey humanoid
module.exports = `
// ===== INNER REALM: dimension natives =====
Crown-Warden|17|In|construct|Aldermere|A knight of living steel that guards the anchor under the High Throne and answers only to a rightful king|Catacombs beneath the High Throne
Aldermere Knight-Errant|6|In|humanoid|Aldermere|A wandering knight sworn to a fallen house, seeking a cause worthy of its oath|Highland roads, tourney fields
Throne-Wyrm|21|In|dragon|Aldermere|An old dragon that sleeps on stolen crowns and grows stronger with every kingdom it humbles|Mountain lairs heaped with crowns
Hedge-Witch of Aldermere|9|In|humanoid|Aldermere|A forest witch who trades curses for royal secrets and keeps both in jars|Deep elven woods
Gryphon Lancer|12|In|bird|Aldermere|A royal gryphon bred for war, barded in crownsteel and fierce without its rider|Royal aeries, castle towers
Furnace Guard|16|In|construct|Brassholm|A towering brass sentinel fed by the Anchor-Boiler, venting scalding steam with every blow|The Anchor-Boiler, the capital's heart
Clockwork Servitor|4|In|construct|Brassholm|A brass servant that has started to ask questions its makers cannot answer|Mansions, factories, the undercity
Sky-Pirate Corsair|8|In|humanoid|Brassholm|An aeronaut raider with an aether pistol and no fear of falling|Airship decks, cloud harbors
Dreadnought Automaton|22|In|construct|Brassholm|A walking war-engine the size of a house, steered by a crew inside its chest|Brassholm frontier rails
Soot Wraith|11|In|undead|Brassholm|The ghost of a worker who died in the engine works, made of smoke and grievance|Undercity flues and boiler rooms
Vael Hive-Drone|5|In|insect|Kethra-Vael|A chitinous worker of the hive-mind, harmless alone and terrible in a thousand|Crystal forests, hive spires
Vael Hive-Queen|20|In|insect|Kethra-Vael|The hive's thinking heart, who speaks in chords of scent and commands every drone that hears|The central hive spire
Crystal Grazer|7|In|beast|Kethra-Vael|A six-legged grazer that eats crystal and sings as it digests|Crystal plains under the violet sun
Gel-Reef Leviathan|18|In|aquatic|Kethra-Vael|A living reef that drifts through the warm gel seas and absorbs whatever touches it|The gel seas
Spore-Stalker|13|In|aberration|Kethra-Vael|A predator that hunts by heartbeat and plants spores in its prey's lungs|Crystal forest floors
Pale Count|19|In|undead|Gloamhollow|A vampire noble of Gloamhollow who has ruled the same moor for six hundred years|Fog-bound castles
Moor Ghoul|5|In|undead|Gloamhollow|A hunched corpse-eater that follows funeral processions across the fog|Moors and graveyards
Gloam Werehound|10|In|beast|Gloamhollow|A cursed hound-man that hunts the villages on nights without stars|Village outskirts, dark woods
Pale Church Inquisitor|12|In|humanoid|Gloamhollow|A grim hunter of the dead who carries silver, stakes and absolutely no mercy|The Pale Church, crossroads gallows
Fog Banshee|15|In|undead|Gloamhollow|A wailing spirit that lives in the fog; its scream stops hearts|Fog banks over the moors
Leviathan Rider|8|In|humanoid|Thalassar|A sea-nomad who lives on a leviathan's back and fights with harpoon and net|Leviathan backs, kelp rafts
Trench Horror|20|In|aberration|Thalassar|A pale thing from the deepest trench that has never seen light and does not like it|The anchor trench
Thalassar Leviathan|24|In|aquatic|Thalassar|A whale the size of an island, carrying a whole town on its back|The open ocean
Merrow Sovereign|14|In|aquatic|Thalassar|A queen of the domed sea cities, armed with a coral trident and old grudges|Domed cities on the sea floor
Kelp Strangler|6|In|plant|Thalassar|A drifting mat of kelp that wraps swimmers and drags them down|Kelp forests
Sky-Whale|16|In|aquatic|Skyreach|A vast cloud-grazing whale that swims through the sky between islands|The open sky of Skyreach
Skyreach Roc|18|In|bird|Skyreach|An enormous raptor that hunts sky-whales and carries off whole gliders|High-island aeries
Glider Clan Raider|7|In|humanoid|Skyreach|A wind-rider who drops from the clouds on a glider and is gone before the alarm|Island clifftops
Gravity Wisp|11|In|elemental|Skyreach|A knot of loose gravity that pulls whatever comes near into a slow fall|Gravity storms
Rust Cultist|6|In|humanoid|Ashfall Expanse|A scavenger who worships the old machines and feeds them scrap and strangers|Ruined factories
Wasteland War-Engine|19|In|construct|Ashfall Expanse|A dead empire's battle machine, still following orders no one can countermand|Ash plains, crater fields
Ash Crawler|9|In|insect|Ashfall Expanse|A mutated beetle the size of a wagon that burrows through ash and rust|Ash dunes
Grey Rain Revenant|13|In|undead|Ashfall Expanse|The restless dead of the old world, risen in the poisoned rain|Ruined cities in the rain
Seal-Warden|17|In|construct|The Lantern Courts|A paper-armored enforcer of the Courts that binds oath-breakers with ribbons of sealed contract|Every office of the Courts
Paper Golem|6|In|construct|The Lantern Courts|A clerk folded from ten thousand forms, endlessly filing|Archive halls
Fox Magistrate|14|In|fey|The Lantern Courts|A nine-tailed spirit judge who loves a loophole and keeps every promise made to it|Magistrate courts
Lantern Ghost|9|In|undead|The Lantern Courts|A petitioner who died in the queue and is still waiting to be heard|Lantern-lit corridors
Frost Mammoth|12|In|beast|Rimefast|A shaggy mammoth of Rimefast, gentle until its herd is threatened|The tundra
Rimefast Giant|17|In|giant|Rimefast|A frost giant who guards the frozen gods and has not spoken in a hundred winters|Glacier halls
Ice-Priest|8|In|humanoid|Rimefast|A tribal holy one who listens to the frozen gods and carries their answers|Ice temples
Thawing God-Spawn|23|In|celestial|Rimefast|A fragment of a frozen god that thawed early, confused and furious|Cracking glaciers
Saber-Toothed Rimecat|10|In|beast|Rimefast|A great white cat that hunts mammoths and ambushes from snowdrifts|Snowfields
Academy Archmage|19|In|humanoid|Arcanopolis|A master of one of the great Academies, guarded by wards and arrogance in equal measure|Academy towers
Failed Experiment|11|In|aberration|Arcanopolis|Something an Academy made and threw away; it remembers, and it has grown|The Undercity
Rune-Engine Golem|15|In|construct|Arcanopolis|A city maintenance construct whose rune-engine has started to think for itself|Spell-engine yards
Spell-Junkie Gang|5|In|humanoid|Arcanopolis|A street gang hopped up on raw spells, unpredictable and dangerous|Back alleys, rune-light markets
Greenwarden|16|In|plant|Verdant Deep|A tree-shaped guardian of the anchor roots, slow and unstoppable|The roots of the anchor
Titan Beetle|12|In|insect|Verdant Deep|A horse-sized beetle with a shell harder than plate|The forest floor
Canopy Stalker|9|In|beast|Verdant Deep|A long-limbed hunter that moves through the canopy without a sound|The high canopy
Bloom Mother|21|In|plant|Verdant Deep|A flower grown into a whole meadow, with a hunger to match|Sunlit clearings
Iron Front Trooper|6|In|construct|The Iron Front|An automaton infantryman, one of millions, built only to advance|Trenches
Siege Walker|20|In|construct|The Iron Front|A four-legged artillery engine that shells anything that moves|No-man's-land
Gas Wraith|10|In|undead|The Iron Front|The dead of a gas attack, risen as a drifting yellow cloud|Shell craters
Deserter Automaton|8|In|construct|The Iron Front|A soldier-machine that walked away from the war and wants to stay away|Hidden bunkers
Glass Serpent|14|In|reptile|The Glass Dunes|A serpent of living glass that swims through the dunes and flashes blinding light|The Glass Dunes
Mirage-Folk|7|In|fey|The Glass Dunes|A shimmering figure that lives in reflections and lures caravans off course|Mirage cities
Sun-Priest|11|In|humanoid|The Glass Dunes|A desert priest who calls down the light of both suns|Oasis temples
Dune Colossus|22|In|elemental|The Glass Dunes|A giant of fused glass and sand that walks the dunes at noon|The heart of the dunes
Vein Cartographer|9|In|humanoid||A mapmaker who sells routes between dimensions and knows exactly how much they are worth|The Law-veins
Anchor Devourer|25|In|aberration||A thing from the Root that eats Law; where it feeds, a dimension starts to fail|The Root

// ===== OUTER REALM: pocket natives =====
Orchard-Keeper|8|Ou|humanoid|The Inverted Orchard|A tethered gardener who walks on ropes and fears only letting go|Rope walks under the hill
Upfallen|12|Ou|undead|The Inverted Orchard|Someone who fell up and kept falling, now drifting back down as something else|The sky below the orchard
Sky-Fruit Swarm|5|Ou|plant|The Inverted Orchard|Ripe fruit that falls upward in clouds and bursts on whatever it hits|The orchard canopy
Origami Dragon|17|Ou|dragon|Paperfold|A dragon of folded paper that breathes ink and can be killed only by tearing|Paper peaks
Folded Folk|5|Ou|humanoid|Paperfold|A paper person, polite and fragile, terrified of fire|Paper villages
Ink Leviathan|14|Ou|aquatic|Paperfold|A creature of the ink rivers that writes whatever it swallows into itself|Ink rivers
Stair-Wraith|13|Ou|undead|The Stairwell|A climber who never reached the top and now stalks the landings|Dark landings
Landlord|18|Ou|fiend|The Stairwell|The owner of a thousand landings, who collects rent in years|The landlord's landing
Step-Counter|6|Ou|construct|The Stairwell|A small brass device that counts every step and attacks miscounts|Every staircase
Looper|9|Ou|humanoid|The Clockless Hour|A native who knows the Hour repeats and will do anything to break it|The town square
Hour-Keeper|21|Ou|celestial|The Clockless Hour|The being that resets the Hour, ancient and very tired|The clock tower
Reset Hound|11|Ou|beast|The Clockless Hour|A hound that hunts anything that remembers the last loop|The edges of the Hour
Shrieker of Echoes|14|Ou|aberration|The Echo Chamber|A creature whose scream builds walls and whose silence tears them down|Sound-built ruins
Silent Hunter|10|Ou|beast|The Echo Chamber|A predator that moves in perfect silence, leaving no echo behind|Quiet hollows
Word-Golem|16|Ou|construct|The Echo Chamber|A golem built from spoken words, still repeating the speech that made it|Great halls of sound
Edge-Hunter|12|Ou|construct|Tessellate|A blade-sided polygon that hunts curves|Tiled plains
Polyhedral Sage|15|Ou|aberration|Tessellate|A many-faced being of perfect geometry who thinks in angles|The Grand Tiling
The Circle|20|Ou|celestial|Tessellate|An outlaw curve, hunted for being round, wise and very tired of running|Hidden among the tiles
Sky-Fish School|6|Ou|aquatic|The Drowned Air|A school of fish that swims through the air in glittering clouds|The open sky
Dry-Pool Keeper|13|Ou|elemental|The Drowned Air|A guardian of the lakes of air, where visitors suffocate in emptiness|The dry pools
Air-Kraken|19|Ou|aquatic|The Drowned Air|A great kraken that hunts through the sky with arms like clouds|High airs
Hostile Reflection|11|Ou|fey|Mirrorside|A reflection that has stopped copying its owner and wants their life|Mirror halls
Mirror-Warden|16|Ou|construct|Mirrorside|A silver sentinel that keeps reflections on their own side of the glass|Mirror gates
The Unreflected|22|Ou|aberration|Mirrorside|A being with no counterpart anywhere, hungry for someone else's reflection|The back of every mirror
Measurer|9|Ou|humanoid|Scale Shift|A surveyor who tries to record the true size of things, and fails daily|Survey towers
Pocket Mountain|18|Ou|elemental|Scale Shift|A mountain that is pebble-sized up close and crushing far away|Everywhere and nowhere
Shifting Titan|14|Ou|giant|Scale Shift|A giant who is tiny when near, and steps on those who back away|The open plains
Half-Written Wanderer|8|Ou|humanoid|The Last Library|A person a book started to describe and then abandoned|Library stacks
Escaped Villain|15|Ou|fiend|The Last Library|A villain who climbed out of a book before its ending|The Fiction Wing
Head Librarian|21|Ou|celestial|The Last Library|The keeper of the Library, who has read everything and finished nothing|The Reading Room
Wax Folk|5|Ou|humanoid|Candlewax|A soft, endlessly moving person who rebuilds their face each morning|Melting cities
Wick-Keeper|12|Ou|elemental|Candlewax|A guardian of the great candles, made of flame and tallow|The candle towers
Molten Behemoth|17|Ou|ooze|Candlewax|A vast puddle of hot wax that swallows whatever stands still|Wax lowlands
Painted Knight|10|Ou|humanoid|The Gallery of Frames|A knight from a painting, still in brushstrokes, defending its frame|The portrait wing
Art Critic|16|Ou|fiend|The Gallery of Frames|A sharp-tongued thing that destroys paintings it dislikes, with the people inside|Gallery halls
Living Landscape|19|Ou|plant|The Gallery of Frames|A painted wilderness that has stepped out of its frame|The landscape wing
Bone Gardener|9|Ou|humanoid|Bonegarden|A patient farmer of bone who is always looking for good seed|Bone fields
Rib-Crow|5|Ou|bird|Bonegarden|A crow made of ribs that pecks marrow from the grown dead|Bone hedges
Grown Dead|12|Ou|undead|Bonegarden|A skeleton grown from soil that has learned to walk|Bone fields
Ossuary Tree|18|Ou|plant|Bonegarden|A tree of skulls and spines, the oldest growth in the garden|The garden's heart
Hue-Thief|10|Ou|fey|Colorless|A grey thief who steals colors, and the feelings that come with them|Grey alleys
Color-Starved Wraith|14|Ou|undead|Colorless|A soul drained of every color, hunting for any shade at all|The greyest districts
Chromatic Sovereign|20|Ou|celestial|Colorless|The richest being in Colorless, wearing every color at once|The Prism Palace
Carnival Barker|8|Ou|fey|The Carnival at the End|A smiling host who invites everyone to play, and always collects|The midway
Masked Ringmaster|22|Ou|fiend|The Carnival at the End|A ringmaster no one has seen unmasked, who owns every stake ever lost|The big top
Eternal Loser|11|Ou|undead|The Carnival at the End|Someone who lost everything at the games and stayed to try again|The midway
Nightmare Walker|15|Ou|aberration|Sleeptide|A nightmare that washed ashore and learned to walk|The tide line
Dream-Comber|7|Ou|humanoid|Sleeptide|A beachcomber who collects dreams and sells them|The shore
Sleep Leviathan|20|Ou|aquatic|Sleeptide|A vast shape in the dream-sea that pulls sleepers under|The deep dream-sea
Flickerling|6|Ou|aberration|Static|A small thing that is there and not there, and bites in both states|Static fields
Noise Beast|13|Ou|beast|Static|A predator of pure hiss that flickers between its prey's sides|Noise storms
The Settled|19|Ou|celestial|Static|A being that can make things stay, revered and hunted in equal measure|The Still Point
Knot-Walker|8|Ou|humanoid|The Knot|A native who navigates by feel and never walks straight|The loops
Inverted Hunter|14|Ou|beast|The Knot|A creature that came back inside out and hunts others to share the experience|The far side of the Knot
The Untier|21|Ou|celestial|The Knot|A patient being trying to undo the Knot, whatever the cost|The center of the Knot
Flatfolk|5|Ou|humanoid|The Pressing|A person with no depth, who moves by sliding|Flat towns
The Thick|18|Ou|aberration|The Pressing|The only creature in the Pressing with depth, terrifying to the flat|Wherever it is
Shadow-Grazer|10|Ou|beast|The Pressing|A flat beast that grazes on shadows|Shadow meadows
Shelf Navigator|10|Ou|humanoid||A navigator of the Astral Shelf who charges a fortune and earns it|Shelf outposts
Far Edge Watcher|26|Ou|aberration||A watcher at the edge of creation, larger than a city, looking in|The Far Edge
Drifting Pocket|16|Ou|elemental||A tiny pocket dimension that drifts loose and swallows whatever it touches|Between pockets

// ===== VOID =====
Spin Current Eel|8|Vo|aquatic||An eel that rides the Spin Currents and strikes with the speed of the current|Spin Currents
Drift Scavenger|5|Vo|humanoid||A hollow scavenger that picks through the wreckage of failed worlds|The Drift
Stillwater Lurker|14|Vo|aberration||A creature from the region where time barely moves; it strikes before you see it move|The Stillwater
Balance Warden|18|Vo|construct||A perfectly symmetrical guardian of the Balance Point that cannot be moved|The Balance Point
Gravity Hound|11|Vo|beast||A hound with its own gravity, pulling prey toward its jaws|The Drift
Wreck-Wyrm|20|Vo|dragon||A dragon that nests in the hulls of dead worlds|Wreck-fields
Void Jelly|7|Vo|ooze||A drifting jelly that eats light|The Drift
Time Moth|9|Vo|insect||A moth that eats seconds; a swarm can age a traveler a year|The Stillwater
Hollow Pilgrim|12|Vo|undead||A traveler who came to the Void and stayed long enough to empty out|The Drift
Finger of the Unclaimed|16|Vo|fiend||A self-appointed servant of the Void's largest creature, collecting tribute|Wreck-fields
Spin Elemental|13|Vo|elemental||A whirling knot of pure motion that hurls anything it touches|Spin Currents
Wreck Golem|15|Vo|construct||A golem built of debris from a dozen dead worlds, still working|Wreck-fields
Second-Thief|6|Vo|fey||A small creature that steals moments from travelers|The Stillwater edges
Eventide Serpent|17|Vo|reptile||A serpent whose bite slows time in the wound|Spin Currents
Pull Titan|22|Vo|giant||A giant whose gravity bends the wreckage around it|The Deep Drift
Null Mantis|10|Vo|insect||A mantis that cuts through motion itself|The Drift
Lost Finger|11|Vo|humanoid||A god's agent who has been in the Void too long and no longer remembers which god|Wreck-fields
Stasis Spider|14|Vo|insect||A spider whose webs freeze time for whatever they catch|The Stillwater
Orbit Ray|8|Vo|aquatic||A flat creature that circles its prey faster and faster|Spin Currents
Weightless Horror|19|Vo|aberration||A shape that cannot be pushed, pulled or stopped|The Balance Point
Clock Wraith|12|Vo|undead||The ghost of someone lost in a time slip, still counting|The Stillwater
Wreckage Swarm|4|Vo|construct||A cloud of drifting debris that moves as one|The Drift
Void Kraken|21|Vo|aquatic||A kraken that hunts in the Spin Currents|The Deep Drift
Balance Devourer|24|Vo|aberration||A thing that eats imbalance and leaves perfect, terrible stillness|The Balance Point
Spin Sovereign|27|Vo|elemental||The oldest whirl in the Void, which nothing that enters ever leaves|The heart of the Spin Currents
Drifting Colossus|18|Vo|giant||A sleeping giant drifting through the Void, dangerous only if woken|The Drift
Tide of Hours|16|Vo|elemental||A wave of time that ages or youths whatever it passes|The Stillwater
Gravity Leech|7|Vo|beast||A leech that drains weight; its victims float away|Wreck-fields
Echo of a World|13|Vo|undead||The ghost of a whole world, wandering in the shape of its last city|The Drift
Starless Ray|10|Vo|aquatic||A ray that glides between drifting wrecks|The Drift
Wreck Pirate|9|Vo|humanoid||A raider who boards Fingers' ships for their Void-iron|Wreck-fields
Slowfall Wyrmling|6|Vo|dragon||A young wreck-wyrm, already greedy|Wreck nests
Spin Archon|20|Vo|celestial||A being of perfect motion that once served a god of speed|Spin Currents
Unmoving Knight|15|Vo|construct||A suit of armor that has stood at the Balance Point so long it has become part of it|The Balance Point
Fallen Star-Ship|19|Vo|construct||A ship that fell into the Void and became something like a creature|The Deep Drift
Lacuna Beast|12|Vo|beast||A beast that leaves gaps in time behind it|The Stillwater
Hourglass Golem|14|Vo|construct||A golem filled with Void-sand that turns over when struck|The Stillwater
Void Siren|11|Vo|fey||A siren that sings in silence and lures ships off course|Wreck-fields
Weightless Swarm|5|Vo|insect||A cloud of tiny floating insects that drift into lungs|The Drift
Drift Leviathan|25|Vo|aquatic||The largest swimmer of the Drift, with wrecks embedded in its hide|The Deep Drift

// ===== INNER VOID =====
Name-Eater|12|IV|aberration||A creature that eats names; its victims cannot be called, remembered or found|The Hollows
Quiet Stalker|9|IV|beast||A predator of the Quiet that hunts by the sounds its prey can no longer make|The Quiet
Forgetting Moth|5|IV|insect||A moth that drinks memories through the eyes of sleepers|The Hollows
Collector|16|IV|fiend||A hoarder of lost things who offers trades for what you have forgotten|Collectors' vaults
Zero Wraith|14|IV|undead||A spirit that subtracts; its touch removes something, and you never know what|The Zero Gate
The Absent|11|IV|humanoid||A person who chose to forget themselves; they are very hard to notice|The Hollows
Outline Golem|13|IV|construct||The outline of a golem, with nothing inside, still guarding|The Hollows
Erasure Swarm|7|IV|insect||A swarm that erases whatever it covers|The Quiet
Void-Hollowed Giant|18|IV|giant||A giant with its middle eaten away, still walking|The Hollows
Silence Wyrm|21|IV|dragon||A dragon that eats sound, light and heat; its breath is nothing|The Quiet
Lost Color|6|IV|elemental||A color that was removed from the world and is looking for something to stain|The Hollows
Memory Leech|8|IV|beast||A leech that drains memories and leaves blank spaces|The Quiet
Emptied Knight|15|IV|undead||A knight who forgot why he fights, but not how|The Zero Gate
Hush Spider|10|IV|insect||A spider whose webs are made of silence|The Quiet
Count-Ender|20|IV|aberration||A being from the Zero Gate where counting stops; numbers fail near it|The Zero Gate
Afterimage|9|IV|fey||The afterimage of something long gone, still moving|The Hollows
Gap Serpent|12|IV|reptile||A serpent that lives in the gaps between things|The Hollows
Unremembered God|25|IV|celestial||A god whose name was eaten, now just power without a self|The deepest Hollows
Grief Ooze|11|IV|ooze||An ooze that forms from things lost and grieved|The Hollows
The Last Echo|14|IV|undead||The final sound of something destroyed, still repeating|The Quiet
Unwriter|17|IV|aberration||A creature that unmakes written things, and then the people who wrote them|Collectors' vaults
Blank Hound|10|IV|beast||A hound with no features at all that tracks the scent of memories|The Hollows
Null Priest|13|IV|humanoid||A priest of emptiness who preaches that forgetting is peace|The Zero Gate
Remover|19|IV|construct||A machine that removes things, built by no one|The Hollows
Absence Kraken|22|IV|aquatic||A kraken that swims through nothing and pulls things into less|The Quiet
Missing Child|4|IV|undead||A small ghost of someone everyone forgot|The Hollows
Shade of Zero|16|IV|undead||A shadow of the Law of Zero, cold and absolute|The Zero Gate
Hollow Titan|23|IV|giant||A titan made only of its outline|The deepest Hollows
Quiet Choir|15|IV|celestial||A choir that sings in perfect silence; the silence kills|The Quiet
Vanisher|8|IV|fey||A trickster that makes small things disappear, and then larger ones|The Hollows
Nothing Wolf|12|IV|beast||A wolf-shaped absence that hunts in packs|The Quiet
Hoard-Keeper|18|IV|fiend||A guardian of a collector's vault of lost things|Collectors' vaults
Lost Hour|7|IV|elemental||An hour that was removed from time, wandering|The Zero Gate
Effacer|21|IV|aberration||A being that removes faces, names and pasts|The deepest Hollows
Empty Throne|17|IV|construct||A throne that remembers its king, and wants another|Collectors' vaults
Faded Angel|19|IV|celestial||An angel whose god was forgotten|The Hollows
Subtracted Swarm|6|IV|insect||A swarm that subtracts from what it touches|The Quiet
Unspoken|13|IV|aberration||A word that was never spoken, given shape|The Quiet
Mute Leviathan|24|IV|aquatic||A leviathan that swallows sound for miles|The Quiet
The Final Absence|28|IV|aberration||The deepest thing in the Inner Void; where it passes, nothing remains, not even absence|The Zero Gate

// ===== PRIMORDIAL =====
Godfall Scavenger|6|Pr|humanoid||A relic-hunter who has gone native among the dead gods|The Godfall
Divine Blood Ooze|11|Pr|ooze||A pool of a dead god's blood that has learned to move|The Godfall
Corpse-Mountain Crawler|9|Pr|insect||An insect that lives in the flesh of a dead god|God-corpse slopes
First Sea Serpent|17|Pr|reptile||One of the first serpents, older than any sea|The First Sea
Grave-Guardian Colossus|21|Pr|construct||A colossal guardian built by a dying god to watch its body|The Godfall
Progenitor Remnant|14|Pr|aberration||A fragment of a progenitor, still trying to finish its last act|The Godfall
Last Light Moth|7|Pr|insect||A moth drawn to the dying light of a god|The Last Light
Ironcage Warden|19|Pr|construct||A guardian of the Cage of Iron that no one remembers commissioning|The Cage of Iron
Primeval Raptor|12|Pr|bird||A raptor from before the first dawn|Primordial wilds
First Wolf|15|Pr|beast||The wolf every wolf descends from|Primordial wilds
Ancestor Dragon|23|Pr|dragon||One of the first dragons, larger than mountains|The First Sea cliffs
God-Marrow Golem|16|Pr|construct||A golem animated by a dead god's marrow|The Godfall
Relic Wraith|10|Pr|undead||A relic-hunter killed by what they sought, still guarding it|The Godfall
Returning Fragment|18|Pr|celestial||A piece of a god trying to reform|The Godfall
First Tree|20|Pr|plant||The first tree, whose roots drink god-blood|Primordial wilds
Primordial Titan|24|Pr|giant||A titan from before the gods, half-awake|The Godfall
Cage Prisoner's Shadow|13|Pr|aberration||A shadow that slipped through a crack in the Cage of Iron|The Cage of Iron
Bloodsea Shark|11|Pr|aquatic||A shark that swims in seas of god-blood|The Blood Seas
Divine Echo|8|Pr|celestial||An echo of a dead god's voice, still commanding|The Godfall
Mountain-Eater|22|Pr|beast||A beast that grazes on god-corpse mountains|God-corpse slopes
First Fire|19|Pr|elemental||The first flame, still burning|The Last Light
First Flood|19|Pr|elemental||The first water, still rising|The First Sea
Elder Behemoth|21|Pr|beast||An elder kin of the primeval behemoth|Primordial plains
Firstborn Fey|14|Pr|fey||A fey born before the courts, older than any bargain|Primordial wilds
Godbone Knight|16|Pr|undead||A knight armored in a dead god's bones|The Godfall
Primordial Wasp|7|Pr|insect||A wasp the size of a horse from the first summer|Primordial wilds
Relic-Hunter Captain|12|Pr|humanoid||A veteran relic-hunter with a crew and a contract|Hunter camps
Weeping Colossus|17|Pr|giant||A giant that weeps for its dead god forever|The Godfall
Ichor Hydra|20|Pr|reptile||A hydra born from spilled divine blood|The Blood Seas
Last Light Seraph|22|Pr|celestial||A servant of a dying god, guarding its last light|The Last Light
Primeval Ape|10|Pr|beast||An ape from before the first dawn, strong as a giant|Primordial wilds
Fossil Wyrm|18|Pr|dragon||A dragon fossilised and still awake|God-corpse slopes
Bone-Field Swarm|5|Pr|insect||A swarm that strips god-flesh|The Godfall
Heart of a God|26|Pr|aberration||A dead god's heart, beating again, and hungry|The Godfall
Iron Prisoner|29|Pr|aberration||The thing in the Cage of Iron, speaking through the crack|The Cage of Iron
Dead God's Hound|13|Pr|beast||A hound that still guards its dead master|The Godfall
Primordial Ooze|15|Pr|ooze||The first ooze, from which all oozes descend|The First Sea
Progenitor's Herald|23|Pr|celestial||A herald still announcing a progenitor that died|The Godfall

// ===== CHAOS =====
Maybe-Beast|6|Ch|beast||A beast that may or may not be there|The Maybe Woods
Shifting Sea Leviathan|17|Ch|aquatic||A creature of the moving land that swims through soil|The Shifting Sea
Storm Spire Sorcerer|12|Ch|humanoid||A wild sorcerer who climbed the Spire and came down changed|The Storm Spire
Unfixed One|9|Ch|aberration||A native of Chaos with no single shape|Everywhere
Surge Elemental|11|Ch|elemental||Raw wild magic that took a body|The Storm Spire
Prism Dragon|19|Ch|dragon||A dragon whose breath changes element every time|The Storm Spire
Chaos Hydra|15|Ch|reptile||A hydra whose heads are all different animals|The Shifting Sea
Unmade Knight|10|Ch|construct||A suit of armor that rebuilds into a new shape every round|The Maybe Woods
Laughing Swarm|5|Ch|insect||A swarm that giggles as it eats|The Maybe Woods
Order-Breaker|14|Ch|fiend||A demon of Chaos that hunts anything too orderly|The Shifting Sea
Wild Fey|8|Ch|fey||A fey drunk on wild magic|The Maybe Woods
Changeling Giant|13|Ch|giant||A giant whose size changes with its mood|The Shifting Sea
Dice Golem|7|Ch|construct||A golem that rolls itself to decide what to do|Chaos markets
Mood Ooze|10|Ch|ooze||An ooze that changes color with the mood of those nearby|The Maybe Woods
Spire Wraith|16|Ch|undead||A sorcerer who died climbing the Spire|The Storm Spire
Random Roc|12|Ch|bird||A great bird whose feathers are all different birds|The Storm Spire
Chaos Titan|20|Ch|giant||A titan who embodies the realm's refusal to settle|The heart of Chaos
Probability Spider|9|Ch|insect||A spider whose webs catch only the unlikely|The Maybe Woods
Twisted Treant|11|Ch|plant||A tree that walks in a different direction every step|The Maybe Woods
Lord of Maybes|22|Ch|aberration||The ruler of the Maybe Woods, who might be anything|The Maybe Woods
Entropy Wraith|14|Ch|undead||A spirit of disorder that unravels what it touches|The Shifting Sea
Patchwork Chimera|8|Ch|beast||A beast assembled from whatever animals were nearby|The Shifting Sea
Fractal Serpent|13|Ch|reptile||A serpent made of smaller serpents, all the way down|The Storm Spire
Wild Surge Angel|17|Ch|celestial||An angel who fell into Chaos and kept falling sideways|The Storm Spire
Kaleidoscope Beast|15|Ch|beast||A beast that shifts through every color and confuses every eye|The Shifting Sea

// ===== HEAVEN =====
Choir Warden|10|Hv|celestial||A singing guardian of the Choir Terraces|The Choir Terraces
Gate Captain|16|Hv|celestial||A commander of the Gates, who has fought off every intruder for a thousand years|The Gates
Garden Keeper|7|Hv|plant||A living hedge that tends the gardens of the faithful dead|The Gardens
Zealot Paladin|12|Hv|humanoid||A mortal champion of Heaven who sees heresy everywhere|The Choir Terraces
Hymn Golem|14|Hv|construct||A golem built of sung law, enforcing the terrace's hymns|The Choir Terraces
Judgment Hound|11|Hv|beast||A radiant hound that tests intruders by their sins|The Gates
Silent Angel|18|Hv|celestial||An angel who stopped singing mid-hymn and has not spoken since|The Choir Terraces
Quiet Saint|9|Hv|humanoid||A raised mortal who serves Heaven with doubts|The Gardens
Halo Serpent|13|Hv|reptile||A serpent of light that coils around the Gates|The Gates
Seraph Lancer|17|Hv|celestial||A six-winged warrior of the Gates|The Gates
Gilded Lion|12|Hv|beast||A golden lion that guards the entrances to the terraces|The Choir Terraces
Wrathful Choir|19|Hv|celestial||A choir that sings judgment and burns what it judges|The Choir Terraces
Lamb of Light|5|Hv|beast||A gentle creature of light that heals those who need it|The Gardens
Sky Bastion|20|Hv|construct||A walking fortress of the Gates|The Gates
Heaven's Falcon|8|Hv|bird||A falcon that carries messages between the terraces|The Choir Terraces
Penitent Fallen|14|Hv|fiend||A devil trying to earn its way back into Heaven|The Gates
Sunwing Griffon|10|Hv|bird||A griffon of gold feathers ridden by Heaven's scouts|The Choir Terraces
Radiant Treant|15|Hv|plant||A tree of light in the gardens|The Gardens
Archon of Hymns|22|Hv|celestial||The conductor of a whole terrace's song|The highest terrace
Trumpet Herald|9|Hv|celestial||A herald whose trumpet stuns sinners|The Gates
`;
