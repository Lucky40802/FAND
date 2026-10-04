---
version: "1.04"
date: 2026-09-26
title: "Armor Class rework"
areas: ["Armor Class"]
added: 1
changed: 4
fixed: 0
tags: [patch]
---

# v1.04 — Armor Class rework

*2026-09-26 · Armor Class*

**Added**
- [[FAND/Atrious/Armor Class|Armor Class]] rules page, linked from [[FAND]].

**Changed**
- AC now starts at 0 and is built from Constitution, natural traits, armor, shields, and magic. Armor and shields give AC based on their Blueprint level.
- AC is damage reduction as a percentage: damage × 30 / (30 + AC). Before, AC was subtracted from damage, so hits had to scale exponentially to get through high AC.
- Headshots (crits) stay ×1.5, applied before AC.
- AC is split into Natural AC (can't be looted) and Gear AC (can be looted). Looted armor starts Damaged at half AC until repaired through a profession, and gives half AC to a wearer below its level.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
