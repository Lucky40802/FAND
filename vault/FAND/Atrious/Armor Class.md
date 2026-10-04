# Armor Class

How Armor Class works in FAND. It replaces the 5e rule where AC is a number an attack must beat. Here, **AC starts at 0, is built up from sources, and then reduces damage.**

## 1. Building AC
Every creature starts at **AC 0**. Add everything below that applies:

| Source | AC gained | Lootable? |
|---|---|---|
| **Constitution** | Con modifier × 2 (never below 0) | No |
| **Natural traits** | Race, subclass, Rune, or monster feature (tough hide, scales, stone skin, etc.). Usually +2 to +10; bosses can go higher | No |
| **Body armor** | Light: level. Medium: level × 1.5. Heavy: level × 2 | Yes (see Looting) |
| **Armor pieces** | Head, Hands, Feet, Shoulders, Back: level ÷ 4 each (minimum 1) | Yes |
| **Shield** | Buckler: level ÷ 3. Shield: level ÷ 2. Tower Shield: level × 0.75 (minimum 1) | Yes |
| **Enhancements** | Runes, coatings, and inserts applied to worn armor: level ÷ 5 (minimum 1) | Only with the armor |
| **Magic** | Spells, potions, and effects such as a Ward Stone's "+1 AC". Temporary unless the item says otherwise | Depends on the item |

All values round down. "Level" is the `level` field on the item's [[FAND/Atrious/Blueprints Index|Blueprint]]. Each armor and shield Blueprint already lists its result in its `ac`, `armorType`, and `slot` fields, and the profession Bases show them as columns.

**Slots:** one Body armor, one Shield, one item per piece slot (Head, Hands, Feet, Shoulders, Back), and one Enhancement per worn armor item. Barding (slot "Mount") is armor for mounts and beasts only: level × 1.5.

**Example:** level 16 heavy plate (32) + level 20 helm (5) + level 13 gauntlets (3) + level 15 tower shield (11) + Con +3 (6) = **AC 57**. That's about 66% reduction.

Dexterity doesn't add to AC. AC now means toughness and protection, not dodging.

**Split AC in two** on every stat block and character sheet:
- **Natural AC**: Constitution + natural traits. It can't be taken.
- **Gear AC**: armor + shield + magic items. It can be looted.

Monsters and bosses should get most of their AC from Natural AC. Then killing them doesn't hand their defense to the party.

## 2. AC as damage reduction (reverse tax brackets)
AC works like tax brackets in reverse. In a tax system, each higher bracket of income is taxed at a *higher* rate. Here, each higher bracket of AC blocks damage at a *lower* rate. Your first 10 AC is worth a lot; your 200th point is worth almost nothing.

The rates follow a 1/x curve, so total reduction climbs toward 100% but **never reaches it**:

> **Reduction % = AC / (AC + 30)**
> **Damage taken = damage × (1 − reduction)**, rounded down, minimum 1.

### Bracket table
Add up the brackets you've filled, the same way you'd work out tax. The "Total reduction" column is that sum at the top of each bracket.

| AC bracket | Each AC point in this bracket blocks | Total reduction at top of bracket | 32-damage hit becomes |
|---|---|---|---|
| 0–10 | 2.5% | 25% | 24 |
| 10–20 | 1.5% | 40% | 19 |
| 20–30 | 1.0% | 50% | 16 |
| 30–40 | 0.71% | 57% | 13 |
| 40–50 | 0.54% | 62.5% | 12 |
| 50–60 | 0.42% | 67% | 10 |
| 60–80 | 0.30% | 73% | 8 |
| 80–100 | 0.21% | 77% | 7 |
| 100–150 | 0.13% | 83% | 5 |
| 150–200 | 0.07% | 87% | 4 |
| 200–300 | 0.04% | 91% | 2 |
| 300–500 | 0.017% | 94% | 1 |
| 500+ | keeps shrinking | approaches 100%, never reaches it | 1 (minimum) |

**Example:** AC 35 fills the first three brackets (50%) plus 5 points of the fourth (5 × 0.71% ≈ 3.6%), for about 54% reduction. A 32-damage hit deals 32 × 0.46 = **14**.

### Why brackets
- **Never immune.** Every hit deals at least 1 damage, and the reduction never reaches 100%.
- **No exponential damage race.** Doubling damage always doubles damage taken, whatever the AC.
- **Stacking AC has diminishing returns.** Going from 0 to 30 AC halves damage. Going from 100 to 200 only cuts it from 23% of a hit to 13%. Low AC characters benefit most from their first armor.

## 3. Critical hits (headshots)
A headshot is a critical hit. **Multiply the damage by 1.5, then apply AC** as above.
- 32 damage headshot vs AC 30: 48 × 30/60 = **24**.

*Optional, if crits feel weak:* a headshot also ignores half the target's AC. Using the same example: 48 × 30/45 = **32**.

## 4. Looting armor
Players stripping armor from enemies shouldn't let them skip the AC curve:
1. **Broken on kill.** Armor taken from a creature killed in combat is **Damaged** and gives only half its Gear AC until repaired.
2. **Repair** uses the armor's profession (e.g. [[FAND/Atrious/Professions/Blacksmithing|Blacksmithing]], [[FAND/Atrious/Professions/Tailoring|Tailoring]]). It needs a profession level at least equal to the armor's level, plus one unit of its `materials`, under [[FAND/Atrious/Crafting Rules|Crafting Rules]]. Otherwise it can be sold or broken down for materials by a [[FAND/Atrious/Professions/Scavenging|Scavenging]].
3. **Level requirement.** A character whose level is below the armor's level gets only half its Gear AC.
4. **Natural AC never transfers.** A dragon's scales make a dragon hard to hurt. Its looted scales only matter once someone crafts them into armor.

## Related
- [[FAND/FAND|FAND]]
- [[FAND/Atrious/Crafting Rules|Crafting Rules]]
- [[FAND/Atrious/Blueprints Index|Blueprints Index]]
