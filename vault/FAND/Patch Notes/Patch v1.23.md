---
version: "1.23"
date: 2026-10-04
title: "Blueprint cleanup, Scavenging refocus, specialty rules, stat variants, support spells, FAND.html Blueprint sync"
areas: ["Blueprints", "Professions", "Spells", "Documentation", "FAND.html", "Cleanup"]
added: 5
changed: 6
fixed: 2
tags: [patch]
---

# v1.23 — Blueprint cleanup, Scavenging refocus, specialty rules, stat variants, support spells, FAND.html Blueprint sync

*2026-10-04 · Blueprints, Professions, Spells, Documentation, FAND.html, Cleanup*

**Added**
- [[FAND/Atrious/Profession Quick Reference|Profession Quick Reference]]: milestones at levels 1, 5, 10, 15, and 20, real example Blueprints for every profession at each, and what each profession covers.
- **Specialty rules** on every profession page and in [[FAND/Atrious/Profession Progression|Profession Progression]]:
  - You start with one specialty, gain one free at levels 5, 10, 15, and 20, or learn one from a teacher.
  - Crafting outside your specialties is at disadvantage unless the item is no more than half your level.
  - Each specialty also has its own requirement; for example, Blood Alchemy needs fresh blood and Shadow Weaving works only in darkness.
- Harvesting gained **Mining** and **Foraging** specialties.
- **Stat variants:** 1,632 Blueprints in 668 groups share exactly the same stats (level, damage, materials, and AC where relevant). Each now names its siblings, for example "shares exactly the same stats with Abyssal Bronze Greatsword, Abyssal Bronze Shortsword."
- 59 new Scavenging Blueprints (knives, saws, jars, preservation kits, and realm-specific harvesting gear from Human up to Primordial).

- The FAND GitHub repository (github.com/Lucky40802/FAND) now holds `FAND.html` and the generator, data, and check scripts used to maintain the vault, with a README.

**Changed**
- **Scavenging is now about corpses:** stripping hide, bone, blood, organs, and essences from dead creatures for crafting. Every Bestiary drop is taken with Scavenging.
  - 34 tools that weren't about corpses moved to other professions. Ore, mining, and trapping went to Harvesting; lockpicks, ladders, and wreck gear went to Engineering; the rest went to Blacksmithing, Navigation, Enchanting, and Tailoring.
  - Twelve kept items were reworded around corpses.
  - Scavenging now has 56 Blueprints.
- The Scavenging and Harvesting pages, Master Professions, Custom Blueprints, Material Grading, Material Refining, Crafting Rules, the Bestiaries, and the Gathering pages all describe the split: Harvesting gathers from the land, Scavenging strips corpses.
- **Spells:** 73 Tertiary and Secondary damage spells in 12 schools now heal, protect, or help instead. Each was renamed to match its new effect, and the effect scales with spell level:
  - 11 heals, 6 cures, 6 ward spells, and 9 shield spells.
  - 9 teleports, 6 bloom spells, 5 blood gifts, 5 rune guards, 4 wild gifts, 3 reprieves, 3 weightless, 3 elemental wards, and 3 infernal vigor.
  - Examples: "Lash of Sanctum" is now "Stone Shelter" and "Bolt of Vast Depth" is now "Null Float".
  - Their `damage` field shows healing or None, and they're tagged `healing` or `support`. The originals are backed up in the session scratchpad.
- [[FAND/Atrious/Player's Guide|Player's Guide]] covers the 10 professions, specialties, Harvesting, and Scavenging.
- `FAND.html` Blueprints synced with the vault:
  - 4,265 existing entries updated with the vault's profession, specialty, level, damage, AC, property, and material grade.
  - 2,238 vault-only Blueprints added, for 6,550 in all.
  - Opening a Blueprint now shows its specialty, material grade, AC, and property.
- Blueprint counts after this version:

  | Profession | Blueprints |
  |---|---|
  | Enchanting | 1,472 |
  | Blacksmithing | 1,215 |
  | Carving | 1,187 |
  | Engineering | 676 |
  | Alchemy | 563 |
  | Tailoring | 457 |
  | Harvesting | 299 |
  | Navigation | 290 |
  | Cooking | 288 |
  | Scavenging | 56 |

  That's 6,503 in total.

**Fixed**
- Duplicate cleanup after the profession merge:
  - 26 near-duplicate Blueprints were merged, keeping the fuller description.
  - 18 kept items were renamed to clean names; for example, "Iron Mace (Blacksmithing 2)" is now "Iron Mace".
  - 20 cross-profession pairs now carry new profession tags, such as "Katana (Carving)".
- Link scan: no broken links, no orphans.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
