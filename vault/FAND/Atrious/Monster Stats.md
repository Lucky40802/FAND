# Monster Stats

How monsters work with FAND's rules, where [[FAND/Atrious/Armor Class|Armor Class]] reduces damage instead of being a number to beat.

## Homebrew monsters
Every original monster in the Bestiaries has stats built from its realm and grade (see [[FAND/Atrious/Material Grading|Material Grading]]):

| Stat | Formula |
|---|---|
| **Level** | Item Level of its grade: Material Rank ÷ 2, rounded up |
| **HP** | 12 × Level (doubled for grade 10 bosses) |
| **Natural AC** | 2 × Level |
| **Attacks** | 1 below Level 5, 2 from Level 5, 3 from Level 15 |
| **Damage per attack** | 3 × Level ÷ attacks ÷ 4.5, rounded, in d8s (minimum 1d8) |
| **Save DC** | 10 + Level ÷ 3, rounded up |
| **Trait** | The [[FAND/Atrious/Material Properties\|property]] of its strongest drop, at that drop's Potency, applied to the monster itself |
| **Boss (grade 10)** | Double HP and 3 legendary actions per round (one attack each) |

A monster's damage matches a weapon of the same Item Level (see [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]), so a fight between a monster and gear of its own grade is even.

| Example | Level | HP | Natural AC | Attacks |
|---|---|---|---|---|
| Marsh Troll (Human 6) | 3 | 36 | 6 (17%) | 1 × 2d8 |
| Behemoth (Human 10, boss) | 5 | 120 | 10 (25%) | 2 × 2d8 |
| Seraph (Heaven 8) | 14 | 168 | 28 (48%) | 2 × 5d8 |
| The Unclaimed (Void 10, boss) | 40 | 960 | 80 (73%) | 3 × 9d8 |

## Official D&D monsters
Official monsters keep their book stat blocks (hit points, attacks, damage, abilities). Only AC changes:

> **FAND Natural AC = 2 × (book AC − 10) + CR** (minimum 0)

| Example | Book AC | CR | FAND Natural AC | Damage reduction |
|---|---|---|---|---|
| Goblin | 15 | ¼ | 10 | 25% |
| Owlbear | 13 | 3 | 9 | 23% |
| Adult Red Dragon | 19 | 17 | 35 | 54% |
| Tarrasque | 25 | 30 | 60 | 67% |

Their grade (from CR) and drops are listed in each realm's Bestiary.

## Attacking
Attacks still roll to hit as your table normally does. What changes is what armor does after a hit: the damage is reduced by the target's AC brackets. Monster traits and material properties apply after the roll.

## Related
- [[FAND/Atrious/Armor Class|Armor Class]] · [[FAND/Atrious/Material Index|Material Index]] · [[FAND/Atrious/Realm Travel|Realm Travel]]
