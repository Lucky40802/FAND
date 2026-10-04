---
version: "1.21"
date: 2026-10-04
title: "Professions consolidated from 31 to 10"
areas: ["Professions", "Blueprints", "Crafting", "Materials", "FAND.html"]
added: 2
changed: 7
fixed: 1
tags: [patch]
---

# v1.21 — Professions consolidated from 31 to 10

*2026-10-04 · Professions, Blueprints, Crafting, Materials, FAND.html*

**Added**
- 10 broad professions, each with its own page: [[FAND/Atrious/Professions/Blacksmithing|Blacksmithing]], [[FAND/Atrious/Professions/Carving|Carving]], [[FAND/Atrious/Professions/Tailoring|Tailoring]], [[FAND/Atrious/Professions/Alchemy (Profession)|Alchemy]], [[FAND/Atrious/Professions/Cooking|Cooking]], [[FAND/Atrious/Professions/Enchanting|Enchanting]], [[FAND/Atrious/Professions/Engineering|Engineering]], [[FAND/Atrious/Professions/Harvesting|Harvesting]], [[FAND/Atrious/Professions/Scavenging|Scavenging]], [[FAND/Atrious/Professions/Navigation|Navigation]].
- Each page lists the old crafts it absorbed as **specialties**, with their original summaries and signature creations. The mapping:

  | New profession | Absorbed |
  |---|---|
  | Blacksmithing | Blacksmithing, Infernal Forging, Celestial Metallurgy, Void Smithing |
  | Carving | Woodworking, Stonecutting, Bone Carving, Dragon Carving, Crystal Shaping, Tide Craft |
  | Tailoring | Arcane Tailoring, Shadow Weaving |
  | Alchemy | Potionmaking, Blood Alchemy |
  | Cooking | Cooking, Spirit Cooking |
  | Enchanting | Sigilcraft, Glyph Inscription, Soul Binding, Elemental Binding, Relic Restoration |
  | Engineering | Clockwork Engineering, Golemancy, Siege Engineering, Building, Masonry |
  | Harvesting | Farming, Beast Taming |
  | Scavenging | Scavenger |
  | Navigation | Navigation, Astral Navigation |

- New `specialty` field on every Blueprint, holding its old profession (for example, `profession: Blacksmithing`, `specialty: Infernal Forging`).

**Changed**
- All 6,468 Blueprints moved to the new professions. The Blueprint counts by profession:

  | Profession | Blueprints |
  |---|---|
  | Enchanting | 1,473 |
  | Blacksmithing | 1,226 |
  | Carving | 1,186 |
  | Engineering | 662 |
  | Alchemy | 569 |
  | Tailoring | 455 |
  | Cooking | 289 |
  | Harvesting | 289 |
  | Navigation | 288 |
  | Scavenging | 31 |

- 31 profession Bases replaced by 10, each with a `specialty` column. The [[FAND/Atrious/Blueprints Index|Blueprints Index]] lists the 10.
- [[FAND/Atrious/Master Professions|Master Professions]] rewritten as a table of the 10 professions, what each covers, its specialties, and its Blueprint count.
- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]: simpler crafter table. Hell, Heaven, and Void metals now need a Blacksmith with the matching **realm specialty** (Infernal Forging, Celestial Metallurgy, or Void Smithing), or the craft is at disadvantage. The specialty is gained by finishing one item of that metal under a teacher.
- [[FAND/Atrious/Material Grading|Material Grading]]: the Material Types table lists the new professions.
- Gathering: every gatherable material is now gathered by **Harvesting** (plus Scavenging where it applied). The Gathering pages, Material Index, and all 1,597 material notes were regenerated.
- Every link to an old profession page or Base across the vault now points to its new profession. `FAND.html` Blueprints use the new professions (3,456 remapped, old name kept as `sp`), and its header shows 10 Professions.

**Fixed**
- Removed an empty stray note (`Blueprints/Tide Craft.md`) left over from the old profession pages. The link scan shows no broken links and no orphans.

The old profession notes and Bases are backed up in the session scratchpad.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
