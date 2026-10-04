---
version: "1.22"
date: 2026-10-04
title: "Party removed from FAND.html"
areas: ["FAND.html", "Party", "Professions"]
added: 0
changed: 1
fixed: 1
tags: [patch]
---

# v1.22 — Party removed from FAND.html

*2026-10-04 · FAND.html, Party, Professions*

**Changed**
- `FAND.html`: removed the Party tab, the 8 player character entries, the party editing code, and its styles. The app now has 8 tabs: Blueprints, Spells, Materials, Subclasses, Gods, Demons, Patrons, and Bestiary. The vault's own [[FAND/Atrious/Party/Party|Party]] notes are unchanged. A backup is in the session scratchpad.

**Fixed**
- `FAND.html`: 216 Blueprints still used "Runic Craft", the original name of Sigilcraft. They're now Enchanting (specialty Sigilcraft), so the app shows exactly the 10 professions.

Tested by loading the app in the browser: every tab renders and there are no console errors.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
