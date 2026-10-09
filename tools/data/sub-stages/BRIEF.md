# Brief: subclass class changes (shared by every writer)

FAND ("Fantasy and Numerous Disasters") is a homebrew D&D 5e campaign set in the world of Vestige. Characters level to 100. Every 10 levels a character's class changes into a stronger, renamed version (a "class change"): levels 1-10 the original class, the 2nd change at level 11, the 3rd at 21, then 31, 41, 51, 61, 71, 81, and the 10th change at 91. Each stage is tied to a realm tier and unlocks that realm's magic and materials:

| Stage | Level | Realm |
|---|---|---|
| 2 | 11 | Mysterious Realm (fog, illusion, the strange and half-seen) |
| 3 | 21 | Hell and Heaven (debts, contracts and fire; judgement, light and choirs) |
| 4 | 31 | Chaos (shifting, random, rearranging) |
| 5 | 41 | Abyss (depths, pressure, the drowned dark) |
| 6 | 51 | Inner Realm (living Law, growth, the heart of things) |
| 7 | 61 | Outer Realm (horizons, stars, vast open spaces) |
| 8 | 71 | Void (absence, silence, nothing) |
| 9 | 81 | Inner Void (the void folded inward, forgetting, collapse) |
| 10 | 91 | Primordial (raw first Law, progenitors, creation) |

Each base class already has its own named ladder (given in your input as `ladder`, with the class change names and blurbs). Your job: give **every subclass** its own version of each class change, stages 2 to 10.

For each subclass and each stage 2-10 write:
- `name`: the subclass's name at that stage. A fresh, evocative 1-4 word title that blends the subclass's identity with that stage's realm (and may echo the class change name). It must differ from the class change name and be unique within the subclass. Example: Fighter's stage 2 is "Fogline Captain"; Battle Master at stage 2 might be "Fogline Tactician", Champion "Mistborn Champion".
- `feat`: the name of ONE new subclass feature gained at that stage's level.
- `text`: what the feature does, 25-45 words, in plain rules language (5e style), building on the subclass's own theme and the realm. Powers should grow with the stage: stage 2 is roughly a strong level 11-15 feature, stage 10 is near-godlike but still a game rule (limited uses, a saving throw, a recharge). Use concrete numbers (dice, feet, rounds, uses per long rest). Damage dice scale by stage the same way spells do (the stage multiplies the dice), so you may write base dice like 2d8 and say nothing more about scaling.

FAND rules to respect:
- AC is subtracted flat from each hit's damage. If a feature grants AC, keep it to +1 or +2.
- No franchise names (no named D&D or fiction characters, places, or deities). Real-world myth names are fine only if the input already uses them. Original names only.
- Plain ASCII only (straight apostrophes and quotes, no em dashes, no curly quotes, no markdown).

Output: a single JSON object mapping each subclass name (exactly as in the input `n`) to an array of 9 objects, stages 2 through 10 in order:

```json
{
  "Battle Master": [
    { "stage": 2, "name": "Fogline Tactician", "feat": "Veiled Maneuver", "text": "..." },
    ...
    { "stage": 10, "name": "...", "feat": "...", "text": "..." }
  ],
  ...
}
```

Write it pretty-printed to the exact output path you were given. Then verify with node: it parses; every subclass in your input is present; each has exactly 9 entries with stages 2-10; every entry has non-empty name, feat, text; text is 15-70 words; all ASCII; no duplicate names within a subclass. Fix and re-verify until clean. Report the counts in your final reply (no need to paste the content).
