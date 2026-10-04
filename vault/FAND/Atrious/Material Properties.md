# Material Properties

Every material has a **property**: what it adds to an item when used in a [[FAND/Atrious/Custom Blueprints|Custom Blueprint]]. A mimic's hide lets a weapon change shape. An Undead King's Heart makes an item a necromancy focus that strengthens your undead. Each material's property is listed in the [[FAND/Atrious/Material Index|Material Index]] and on its Bestiary or Gathering page.

## How properties work
- The **primary** material's property always applies. Each **secondary** material adds its property. Binding agents and supplies add none.
- The item's rarity caps how many properties it can hold (see Custom Blueprints).
- The same property twice doesn't stack: use the higher Potency.
- **Existing Blueprints:** every weapon, armor, and shield Blueprint carries the property of its strongest non-supply material, on top of its written stats. It's listed in the note's `property` and `potency` fields, in a Material Property section, and as columns in each profession's Base. Other categories (artifacts, potions, and so on) keep only their written stats.

## Potency
A property's strength comes from the material's grade:

- **Potency** = Item Level ÷ 5, rounded down (minimum 1).
- **Peak materials** are stronger: grade 9 adds +1 Potency and grade 10 adds +2 (maximum 10). A realm's best materials outclass the next realm's weakest.
- **B** (the bonus) = Potency ÷ 2, rounded up, so 1 to 5.
- Save DCs from properties are **10 + 2×B**.

| Realm | Potency range |
|---|---|
| Human | 1–3 |
| Mysterious | 1–4 |
| Hell / Heaven | 2–5 |
| Chaos | 3–6 |
| Abyss | 4–7 |
| Inner Realm | 5–8 |
| Outer Realm | 6–9 |
| Void | 7–10 |
| Inner Void | 8–10 |
| Primordial | 9–10 |

## All properties
| Property | Effect |
|---|---|
| **Shapeshifting** | The item can switch between Potency + 1 forms you design (for example sword, spear, whip, shield) as a bonus action. Each form uses its own weapon die or AC. |
| **Sovereign of the Dead** | Necromancy focus: +B to necromancy spell attacks and save DCs. Each casting that raises undead raises one extra. Your undead get +B to attacks and 5×Potency extra hit points. You resist necrotic damage. |
| **Necromantic** | Necromancy focus: +B to necromancy spell attacks and save DCs. Undead you raise get 5×Potency extra hit points. |
| **Burning** | Weapon: +Potency d6 fire damage. Armor: fire resistance (immunity at Potency 8+). |
| **Freezing** | Weapon: +Potency d6 cold damage, and a hit cuts the target's speed by 10 ft. Armor: cold resistance. |
| **Stormcharged** | Weapon: +Potency d6 lightning or thunder damage. Armor: lightning resistance. |
| **Corrosive** | Weapon: +Potency d6 acid damage, and a hit lowers the target's Gear AC by 1 until repaired. Armor: acid resistance. |
| **Venomous** | Weapon: +Potency d6 poison damage; Constitution save (DC 10 + 2×B) or poisoned. Armor: poison resistance. |
| **Holy** | Weapon: +Potency d6 radiant damage, doubled against fiends and undead. Focus: +B to healing. |
| **Shadowed** | +B to Stealth. Once per rest, turn invisible in dim light or darkness until you attack. Weapon: +Potency d6 necrotic damage. |
| **Psychic** | Weapon: +Potency d6 psychic damage. Focus: +B to enchantment spell DCs. |
| **Mind Blast** | Weapon: +Potency d6 psychic damage. Once per long rest, a 30-ft cone: Intelligence save (DC 10 + 2×B) or stunned for 1 round. |
| **Eye Ray** | Once per short rest, fire a ray (60 ft, DC 10 + 2×B): charm, fear, sleep, or slow. At Potency 6+ also paralysis or disintegration (10d6 force). |
| **Nullifying** | Weapon: once per turn, a hit ends one spell of level B + 1 or lower on the target. Armor: advantage on saves against spells. |
| **Timebound** | +B to initiative. Once per long rest, take one extra action (once per short rest at Potency 5+). |
| **Gravitic** | Weapon: a hit pushes or pulls the target up to 5×Potency ft. Armor: you can't be knocked prone or moved against your will. |
| **Regenerating** | Regain Potency hit points at the start of each of your turns while above 0. The item repairs itself overnight. |
| **Rebirth** | Once per long rest, when you drop to 0 hit points, return with half your hit points in a burst of fire (Potency d6 fire to creatures within 10 ft). |
| **All-Seeing** | Darkvision 60 ft. At Potency 3+ see invisible; at Potency 6+ truesight 30 ft. Focus: +B to divination spell DCs. |
| **Farreaching** | Ranged weapons and spells cast through the item gain +10×Potency ft range. |
| **Skyborne** | +5×Potency ft speed. At Potency 3+ you take no falling damage; at Potency 6+ you gain a fly speed equal to your walking speed. |
| **Blinking** | Bonus action: teleport up to 30 ft, once per short rest (at will at Potency 5+). |
| **Displacement** | Attacks against you have disadvantage until you are hit; the effect returns at the start of your next turn. |
| **Hardened** | Armor or shield: +B AC. Weapon: can't be broken, and ignores Potency Natural AC. |
| **Piercing Edge** | Weapon: ignores 2×Potency AC (see Armor Class) and crits on 19–20 (18–20 at Potency 6+). |
| **Binding** | Weapon: on a hit, Strength save (DC 10 + 2×B) or restrained. Armor: advantage on grapple checks. |
| **Petrifying** | Weapon: on a hit, Constitution save (DC 10 + 2×B) or slowed. A creature slowed twice is petrified until the end of its next turn. |
| **Lifedrinking** | Weapon: once per turn, regain 2×Potency hit points when you hit. |
| **Elemental Core** | Pick one element when the item is made: weapon +Potency d6 of that type, or armor resistance to it. |
| **Spell Vessel** | Stores one spell of level B or lower, recast once per long rest. Focus: +B to spell attacks. |
| **Living** | Druid and ranger focus: +B to spell DCs. The item slowly regrows if damaged. |
| **Enduring** | Can't be broken by nonmagical means. Shield: +B AC. Weapon: +B damage. |
| **Tempered** | Weapon: +B damage. Armor: +B Gear AC. |
| **Supple** | Light or medium armor: +B AC and no disadvantage on Stealth. Cloth: +B to one Charisma skill. |
| **Mechanical** | Ranged mechanisms reload as a free action; +B to attacks with them. |
| **Glamoured** | Once per long rest cast charm person or disguise self (also mislead at Potency 5+). +B to Deception. |
| **Fortunate** | B times per long rest, reroll one d20 you rolled. |
| **Chaotic** | Weapon: +Potency d6 damage of a random type each hit. Once per long rest, trigger a wild magic surge on purpose. |
| **Resonant** | Weapon: +Potency d6 thunder damage. Once per rest, a shout: creatures within 15 ft make a Wisdom save (DC 10 + 2×B) or are frightened. |
| **Tidal** | Swim speed and water breathing. Weapons work normally underwater and deal +Potency d6 cold to creatures in water. |
| **Earthbound** | Tremorsense 5×Potency ft while touching the ground. Weapon: +Potency d6 damage against objects and structures. |
| **Lawful** | Can't be disarmed or moved against your will. Once per day, bind a creature to a spoken promise; breaking it deals Potency d6 psychic damage. |
| **Dreadful** | Weapon: on a hit, Wisdom save (DC 10 + 2×B) or frightened. Armor: advantage on saves against fear. |
| **Purifying** | Weapon: +Potency d6 radiant damage. Once per day, end one poison or disease by touch. |
| **Invulnerable** | Resistance to damage from nonmagical sources. At Potency 6+, spells that target only you are reflected back on a d20 roll of 15+. |
| **Ink Cloud** | Once per short rest, fill a 20-ft sphere with magical darkness around you. |
| **Progenitor Piece** | Counts as a Primary acquisition toward this progenitor's class (see Class) and unlocks a unique ability the DM designs. |
| **Divine Spark** | Holds a fragment of a god's power. The DM designs one legendary ability; the item counts as a relic that gods and their contractors will want. |

## How a material gets its property
Named materials use the property that fits them best:
- Mimic, doppelganger, and lycanthrope parts → **Shapeshifting**
- Lich, vampire, death knight, mummy lord, and Undead King parts → **Sovereign of the Dead**
- Other undead parts → **Necromantic**
- Beholder kin → **Eye Ray**. Mind flayer kin → **Mind Blast**. Phoenix → **Rebirth**. Tarrasque and behemoth → **Invulnerable**
- Progenitor remains (Ignis Cinder, Undine Tear, Sylph Breath, Gnome Knuckle) → **Progenitor Piece**. Remains of original gods → **Divine Spark**
- Element words (fire, frost, storm, acid, venom, holy, shadow, psychic, and so on) → the matching elemental property. Dragon parts follow the dragon's color.

Anything else falls back on its realm, then on its type:

| Realm fallback (hides, bones, blood, essences) | Property |
|---|---|
| Hell, Abyss | Dreadful |
| Heaven | Holy |
| Chaos | Chaotic |
| Inner Realm | Lawful |
| Outer Realm | Farreaching |
| Void, Inner Void | Nullifying |
| Primordial | Divine Spark |

| Type fallback | Property |
|---|---|
| Ore / Metal | Tempered |
| Wood / Plant | Living |
| Crystal / Gem | Spell Vessel |
| Stone | Enduring |
| Hide / Cloth / Fiber | Supple |
| Bone / Fang / Horn / Scale | Piercing Edge |
| Blood / Organ | Lifedrinking |
| Essence / Soul / Core | Elemental Core |
| Mechanism | Mechanical |
| Supply | none |

The DM can overrule any assignment that doesn't fit.

## Related
- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]
- [[FAND/Atrious/Material Index|Material Index]]
- [[FAND/Atrious/Material Grading|Material Grading]]
- [[FAND/Atrious/Armor Class|Armor Class]]
