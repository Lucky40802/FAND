# Crafting Rules

How a character actually makes something from [[FAND/Atrious/Blueprints Index|Blueprints]], rather than just buying or looting it.

## Requirements

To craft a specific Blueprint item, a character needs all three of the following at once:

1. **The Blueprint itself.** A recipe the character has learned, been taught, or found written down (a physical schematic, a master's notes, a purchased pattern). Knowing a profession does not mean knowing every Blueprint in it — access to the specific recipe is a separate, GM-adjudicated unlock (taught by an NPC, bought from a supplier, found as loot, or reverse-engineered from an existing item — see **Reverse-Engineering** below).
2. **The required Materials.** Every item lists its `materials` field. All of them must be in hand and are consumed on a successful craft (a failed attempt only consumes materials on a natural 1 — see **Crafting Checks**). Materials can come from a market, a [[FAND/Atrious/Professions/Harvesting|Harvesting]] gather or a [[FAND/Atrious/Professions/Scavenging|Scavenging]] harvest from a corpse, or another profession's own byproducts.
3. **The matching Profession, at a high enough level.** The item's `level` field is the minimum profession level required to attempt it at all — a character below that level cannot try, full stop, regardless of materials or blueprint access. This mirrors the level column on every profession's own page (e.g. [[FAND/Atrious/Professions/Blacksmithing|Blacksmithing]]).

If all three are met, the character can attempt the craft. If any one is missing, they can't — no partial credit for having two out of three.

## Crafting Checks

Crafting takes time (see **Time**, below) and ends in one check: **d20 + the profession's crafting bonus** (from that profession's own Level Progression table) **vs. a DC set by the item's rarity**:

| Rarity | DC |
|---|---|
| Common | 10 |
| Uncommon | 13 |
| Rare | 16 |
| Very Rare | 19 |
| Legendary | 22 |
| Artifact | 25 |

- **Success:** the item is completed at the end of the crafting time.
- **Failure:** the attempt fails, but materials aren't lost — the character can try again (spending the time again) once circumstances change, or simply try once more.
- **Natural 1:** the attempt fails *and* the materials are ruined. This is the one case where materials are lost without a completed item.
- **Natural 20:** the item is completed, and the GM may add a minor, non-mechanical flourish (a maker's mark, a slightly finer finish) at no cost.

A character may take a Tertiary-tier item's craft at disadvantage to skip the roll entirely and simply succeed, if the GM judges the item mechanically trivial for that character's profession level (a level-15 Blacksmith doesn't need to sweat a level-1 dagger).

## Time

- **Tertiary-tier items:** roughly a day of dedicated work (or several shorter sessions totaling similar time), assuming a proper workspace.
- **Secondary-tier items:** roughly a week.
- **Primary/Legendary/Artifact-tier items:** at GM discretion, often a month or more, frequently gated behind an in-story requirement beyond just time (a special forge, a particular season, a witness, etc.) on top of the normal three requirements above.

Working without proper tools or a proper workspace for the profession roughly doubles the time and imposes disadvantage on the crafting check.

## Reverse-Engineering

A character with the matching profession, at a level meeting or exceeding the item's own level, who has an example of a finished item in hand for at least one full day, may attempt to learn its Blueprint without ever having been taught it. This requires a crafting check at the same DC as actually making the item (see table above) — success unlocks the Blueprint for future crafting; failure means the item's secrets simply don't give themselves up, though the item itself is undamaged and can be tried again after a long rest.

## Related
- [[FAND/Atrious/Blueprints Index|Blueprints Index]]
- [[FAND/Atrious/Master Professions|Master Professions]]
- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]: design your own items
- [[FAND/Atrious/Material Grading|Material Grading]]: realm grades for materials
