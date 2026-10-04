# Custom Blueprints

Players can design their own unique weapons, armor, and gear instead of relying only on the existing [[FAND/Atrious/Blueprints Index|Blueprints]]. A custom item is built from graded materials (see [[FAND/Atrious/Material Grading|Material Grading]]) and must be made by the right kind of crafter.

Once designed, a custom Blueprint works like any other. It follows the normal [[FAND/Atrious/Crafting Rules|Crafting Rules]], and anyone with the right profession and the Blueprint can make it again.

## Step 1. Concept
Choose:
- **Form**: what the item is (longsword, tower shield, cloak, potion, crossbow, etc.). The form decides the crafter (see Step 3).
- **Name and look**: your own. Keep names original and not taken from other franchises.
- **Purpose**: one sentence on what it's for ("a greatsword that sets the battlefield on fire").

## Step 2. Materials
Every custom item has three kinds of material slot:

| Slot | How many | What it does |
|---|---|---|
| **Primary** | Exactly 1 | Sets the item's **grade**: Item Level, rarity, DC, and damage or AC. |
| **Secondary** | 0–2 | Each adds **one trait** (see Traits). Must be within one realm tier of the primary. |
| **Binding agent** | Required from Hell / Heaven upward | Holds realm materials together. Must be an Essence, Blood, or Crystal material of at least the primary's tier. |

The primary material sets the item's numbers:
- **Material Rank** = (tier − 1) × 10 + grade
- **Item Level** = Rank ÷ 2, rounded up
- **Rarity** follows the table in [[FAND/Atrious/Material Grading|Material Grading]]

## Step 3. Who can craft it
The **form** decides the base profession:

| Form | Crafter |
|---|---|
| Metal weapons, metal armor, helms, gauntlets, metal shields | [[FAND/Atrious/Professions/Blacksmithing\|Blacksmithing]] |
| Bows, staffs, wands, clubs, wooden, stone, bone, dragon-part, and crystal gear | [[FAND/Atrious/Professions/Carving\|Carving]] |
| Cloth and leather armor, cloaks, robes, stealth gear | [[FAND/Atrious/Professions/Tailoring\|Tailoring]] |
| Potions, elixirs, oils, poisons, blood items | [[FAND/Atrious/Professions/Alchemy (Profession)\|Alchemy]] |
| Crossbows, gadgets, constructs, siege weapons, buildings | [[FAND/Atrious/Professions/Engineering\|Engineering]] |
| Runes and sigils on gear; items with a bound soul or elemental core; restored relics | [[FAND/Atrious/Professions/Enchanting\|Enchanting]] |
| Food and drink buffs | [[FAND/Atrious/Professions/Cooking\|Cooking]] |
| Crops, seed stock, livestock lines, mining and foraging tools | [[FAND/Atrious/Professions/Harvesting\|Harvesting]] |
| Corpse-harvesting tools (knives, saws, jars, preservation kits) | [[FAND/Atrious/Professions/Scavenging\|Scavenging]] |
| Maps, charts, navigation instruments | [[FAND/Atrious/Professions/Navigation\|Navigation]] |

**Realm specialties.** Hell, Heaven, and Void metals need a Blacksmith with the matching specialty: Infernal Forging (Hell), Celestial Metallurgy (Heaven), or Void Smithing (Void and Inner Void). Without it, the craft is made at disadvantage. A Blacksmith gains a specialty by finishing one item of that metal under a teacher who has it (see [[FAND/Atrious/Professions/Blacksmithing|Blacksmithing]]).

**Profession level required:**
- Item Level 1–20: profession level at least equal to the Item Level.
- Item Level 21+ (Abyss and above): profession level 20 **and** a **Realm Forge**, a workspace inside or connected to the material's realm. Finding or building one is a story goal the DM sets.

## Step 4. Design check
Writing the Blueprint takes time and one check: **d20 + profession crafting bonus vs the design DC.**

| Primary realm | Design DC | Design time |
|---|---|---|
| Human | 10 (grades 1–5), 13 (6–10) | 1 day |
| Mysterious | 13 (1–5), 16 (6–10) | 2 days |
| Hell / Heaven | 16 (1–5), 19 (6–10) | 1 week |
| Chaos | 19 | 1 week |
| Abyss | 19 (1–5), 22 (6–10) | 2 weeks |
| Inner Realm / Outer Realm | 22 | 1 month |
| Void | 25 | 1 month |
| Inner Void | 27 | 2 months |
| Primordial | 30 | DM's call; always a story event |

- **Success:** the Blueprint exists. Copy the [[FAND/Atrious/Custom Blueprint Template|Custom Blueprint Template]] into `Blueprints/Custom/` and fill it in.
- **Failure:** the design doesn't work yet. You can try again after a long rest. No materials are used, because design happens before crafting.
- **Natural 20:** add one extra trait, even beyond the rarity cap.

Then **craft** the item under [[FAND/Atrious/Crafting Rules|Crafting Rules]], using the same DC. The materials are spent on that craft.

## Step 5. Stats

**Weapons.** Choose the weapon die, then dice = 3 × Item Level ÷ die average, rounded, with a minimum of 1. This is the same formula the existing Blueprints use.

| Weapon size | Die (average) | Examples |
|---|---|---|
| Light | d4 (2.5) | Dagger, dart |
| Simple one-handed | d6 (3.5) | Shortsword, handaxe, shortbow |
| Martial one-handed | d8 (4.5) | Longsword, warhammer, longbow |
| Heavy / polearm | d10 (5.5) | Halberd, glaive, heavy crossbow |
| Great weapon | d12 (6.5) | Greatsword, greataxe, maul |

**Armor and shields.** AC comes from the Item Level, using the tables in [[FAND/Atrious/Armor Class|Armor Class]] (body armor × 1 / 1.5 / 2, pieces ÷ 4, shields ÷ 3 / ÷ 2 / × 0.75).

**Traits come from material properties.** Every material has a **property** listed in the [[FAND/Atrious/Material Index|Material Index]]: a mimic's hide makes an item shapeshift, and an Undead King's Heart turns it into a necromancy focus. The primary material's property always applies, and each secondary material adds its own. Binding agents and supplies add none. See [[FAND/Atrious/Material Properties|Material Properties]] for every property and how it scales with grade. The rarity caps the total:

| Rarity | Max traits |
|---|---|
| Common | 1 |
| Uncommon | 1 |
| Rare | 2 |
| Very Rare | 3 |
| Legendary | 3 |
| Artifact | 4 |

Two materials with the same property don't stack. Use the higher Potency; it still counts as one trait. The DM can swap a property for a fitting custom trait (returning when thrown, a light source, a once-per-day ability) if the design calls for it.

**Realm damage types.** When a property lets you choose a damage type (such as Elemental Core), the primary's realm suggests one:

| Realm | Damage type |
|---|---|
| Human | Weapon's own type |
| Mysterious | Psychic or cold |
| Hell | Fire |
| Heaven | Radiant |
| Chaos | Roll randomly each hit |
| Abyss | Cold or necrotic |
| Inner Realm | Force |
| Outer Realm | Psychic |
| Void | Force |
| Inner Void | Necrotic |
| Primordial | The progenitor's own Law; DM's call |

## Worked example: Cinderfang Greatsword
- **Primary:** Brimstone iron, grade Hell 3. Rank 23 → Item Level 12 → Rare.
- **Secondary:** Imp horn, Hell 3.
- **Binding agent:** Hellhound gland, Hell 2 Blood. It adds no property.
- **Crafter:** Hell metal, so [[FAND/Atrious/Professions/Blacksmithing|Blacksmithing]] level 12 or higher.
- **Design DC:** 16, one week of design time.
- **Damage:** a d12 great weapon, 3 × 12 ÷ 6.5 = 5.54, rounded to **6d12 slashing**.
- **Traits (2 of 2):** Brimstone iron gives **Burning** at Potency 2 (+2d6 fire). The imp horn gives **Piercing Edge** at Potency 2 (ignores 4 AC; crits on 19–20).

## Worked example: Staff of the Dead Court
- **Primary:** Undead King's Heart, grade Mysterious 9. Rank 19 → Item Level 10 → Rare.
- **Secondary:** Shade Heart, Mysterious 6 (from a Shade).
- **Binding agent:** Necromancy Stone, Mysterious 6 (Crystal).
- **Crafter:** a staff with a bound soul, so [[FAND/Atrious/Professions/Enchanting|Enchanting]] level 10 or higher.
- **Design DC:** 16, two days of design time.
- **Traits (2 of 2):** the heart gives **Sovereign of the Dead** at Potency 3 (2, +1 for a grade 9 material): +2 to necromancy spell attacks and DCs, one extra undead per casting, and your undead get +2 to attacks and 15 extra hit points. The shade heart gives **Shadowed** at Potency 1: +1 to Stealth, turn invisible in darkness once per rest, and +1d6 necrotic when the staff strikes.

## Related
- [[FAND/Atrious/Material Grading|Material Grading]]
- [[FAND/Atrious/Crafting Rules|Crafting Rules]]
- [[FAND/Atrious/Armor Class|Armor Class]]
- [[FAND/Atrious/Custom Blueprint Template|Custom Blueprint Template]]
