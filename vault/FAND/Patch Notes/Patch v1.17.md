---
version: "1.17"
date: 2026-09-27
title: "Realm Travel, Material Refining, profession Blueprints, stub Runes, spell classes, cleanup"
areas: ["Realms", "Materials", "Blueprints", "Runes", "Spells", "Bestiary", "Cleanup"]
added: 4
changed: 1
fixed: 3
tags: [patch]
---

# v1.17 — Realm Travel, Material Refining, profession Blueprints, stub Runes, spell classes, cleanup

*2026-09-27 · Realms, Materials, Blueprints, Runes, Spells, Bestiary, Cleanup*

**Added**
- [[FAND/Atrious/Realm Travel|Realm Travel]]: Realm Pressure (0–9) against traveler Attunement from level, contract rank, or realm-material gear; strain effects; 11 travel methods; getting home with anchors.
- [[FAND/Atrious/Material Refining|Material Refining]]: 3 same-grade materials become 1 of the next grade; crossing into the next realm needs 5, a binding agent, and a Realm Forge.
- 76 Blueprints for the six new professions (Cooking, Scavenger, Navigation, Farming, Building, Masonry), each with its own Base, listed in the Blueprints Index and linked from the profession pages. They use graded materials.
- Lore pages for the empty stubs: [[Ignis]], [[Sylph]], [[Infinatas]], [[Elves]], [[Horn]], [[Terraformation]]. New Rune pages: [[Ambulance]], [[Nick]], [[Knocking]], [[God-Specific Runes]].

**Changed**
- Spells: the empty `class` field on 1,799 pyramid spells is filled from their school (for example, Necromancy is Cleric, Warlock, Wizard), plus the Rune's class from Class.md where one applies (52 spells).

**Fixed**
- 37 hornless devils and demons dropped "Horn". They now drop Essence and Ichor. Bestiaries, Material Index, and the materials database were regenerated.
- 90 links in 52 notes pointed at Rune names that also belong to a spell or Blueprint (Heal, Light, Wish, Shield, Resistance, and others). They now use explicit `FAND/Runes/...` paths. The Resistance Rune is no longer orphaned.
- Broken-link and orphan scan across 11,116 notes: no broken links, no orphans.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
