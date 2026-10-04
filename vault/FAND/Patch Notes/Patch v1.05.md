---
version: "1.05"
date: 2026-09-26
title: "Reverse-tax-bracket damage reduction"
areas: ["Armor Class"]
added: 0
changed: 2
fixed: 0
tags: [patch]
---

# v1.05 — Reverse-tax-bracket damage reduction

*2026-09-26 · Armor Class*

**Changed**
- [[FAND/Atrious/Armor Class|Armor Class]]: damage reduction now works as reverse tax brackets. Each higher bracket of AC blocks less per point (2.5% per point for the first 10 AC, 1.5% for the next 10, and so on), following the 1/x curve AC / (AC + 30).
- Reduction approaches 100% but never reaches it, and every hit deals at least 1 damage. Added a bracket table with a worked example.

---
Back to [[FAND/Patch Notes|Patch Notes]] · all versions in [[FAND/Patch Notes/Patch Notes.base|the Patch Notes database]]
