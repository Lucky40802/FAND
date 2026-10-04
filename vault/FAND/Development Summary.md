# FAND Development Summary

Everything built in the FAND vault since the Patch Notes began, organized by system. Version-by-version detail is in the [[FAND/Patch Notes|Patch Notes]] database. Current version: **1.24** (2026-10-04).

## At a glance

| Area | Now |
|---|---|
| Subclasses | 163, all official PHB, Xanathar's, Tasha's, and SCAG ones plus three from the 2024 PHB, alongside the homebrew Rune subclasses |
| Professions | 10 broad professions, absorbing the 31 old crafts as specialties |
| Blueprints | 6,503 in the vault and 6,550 in FAND.html |
| Spells | About 2,330, all with classes filled in; 73 converted to healing and support |
| Materials | 1,597 graded materials, each with a property, price, and its own note |
| Monsters | 103 homebrew with full stats, plus 643 official D&D monsters |
| Realms | 11 realm tiers, each with lore, a Bestiary, and a Gathering page |
| Gods | 70 gods with Runes, realms, signature materials, and 201 named Fingers |
| Rules pages | Armor Class, Material Grading, Material Properties, Material Refining, Custom Blueprints, Crafting, Economy, Profession Progression, God Contracts, Realm Travel, Monster Stats |
| Player-facing | Player's Guide, Profession Quick Reference, Realm Map |
| Tools | FAND.html app; GitHub repo with generator and check scripts |

## Classes and subclasses
- **Official subclasses:** 58 official subclasses were added as paraphrased summaries labeled with their source book (v1.03). Three new 2024 PHB subclasses followed: Path of the World Tree, College of Dance, and Circle of the Sea (v1.18).
- **2024 revisions:** each class page notes which of its subclasses the 2024 Player's Handbook revised, and that every class picks its subclass at level 3.
- **Spell classes:** every spell now lists classes. Pyramid spells get them from their school, plus the class tied to their Rune where one applies (v1.17).

## Armor Class (v1.04–v1.06)
- **How AC works:** [[FAND/Atrious/Armor Class|Armor Class]] starts at 0 and is built from Constitution, natural traits, armor, shields, and magic.
- **Damage reduction:** AC reduces damage in reverse tax brackets on a 1/x curve, AC ÷ (AC + 30). It never reaches 100%, and every hit deals at least 1 damage.
- **Crits:** headshots are critical hits, ×1.5 damage before AC.
- **Natural vs. Gear AC:** Natural AC can't be looted. Gear AC can, but looted armor is Damaged until it's repaired.
- **AC on Blueprints:** all 837 armor and shield Blueprints have an AC value, armor type, and slot. Slots are Body, Head, Hands, Feet, Shoulders, and Back; shields come in Buckler, Shield, and Tower.

## Materials and crafting
- **[[FAND/Atrious/Material Grading|Material Grading]] (v1.07):** every material has a realm and a grade from 1 to 10. That gives a Material Rank (1–100), which sets an Item Level (1–50).

  | Tier | Realm |
  |---|---|
  | 1 | Human |
  | 2 | Mysterious |
  | 3 | Hell / Heaven |
  | 4 | Chaos |
  | 5 | Abyss |
  | 6 | Inner Realm |
  | 7 | Outer Realm |
  | 8 | Void |
  | 9 | Inner Void |
  | 10 | Primordial |

- **Grading (v1.10):** all existing Blueprint materials are graded, and Blueprints record their strongest material.
- **[[FAND/Atrious/Material Properties|Material Properties]] (v1.13, v1.18):** every material gives a property, 48 in all, such as Shapeshifting, Sovereign of the Dead, Eye Ray, Burning, and Piercing Edge. Strength scales with Potency (1–10), and grade 9–10 materials get a boost.
- **Materials database (v1.14):** one note per material in an Obsidian Base. Each note has its realm, grade, rank, Item Level, rarity, type, property, Potency, source, and price.
- **[[FAND/Atrious/Material Index|Material Index]]:** all materials listed by realm.
- **[[FAND/Atrious/Material Refining|Material Refining]] (v1.17):** three materials of one grade make one of the next grade. Moving up to the next realm takes five, a binding agent, and a Realm Forge.
- **[[FAND/Atrious/Custom Blueprints|Custom Blueprints]] (v1.07):** players design their own items from a primary material and up to two secondaries, then pass a design check. Traits come from the materials' properties. There's a template and a `Blueprints/Custom/` folder for player-made items.
- **Blueprint properties (v1.18):** 1,925 weapons, armor pieces, and shields carry the property of their strongest material.
- **[[FAND/Atrious/Economy|Economy]] (v1.20):** a material's price is its realm base × grade, and Void-grade materials and above aren't sold. The page also covers where to buy and sell, Blueprint prices, crafting labor, services, and contract tithes.

## Professions
- **Ten professions (v1.21):** the 31 old crafts became 10. Each old craft is now a specialty kept on its profession's page.

  | Profession | Absorbed |
  |---|---|
  | Blacksmithing | Infernal Forging, Celestial Metallurgy, Void Smithing |
  | Carving | Woodworking, Stonecutting, Bone Carving, Dragon Carving, Crystal Shaping, Tide Craft |
  | Tailoring | Arcane Tailoring, Shadow Weaving |
  | Alchemy | Potionmaking, Blood Alchemy |
  | Cooking | Spirit Cooking |
  | Enchanting | Sigilcraft, Glyph Inscription, Soul Binding, Elemental Binding, Relic Restoration |
  | Engineering | Clockwork Engineering, Golemancy, Siege Engineering, Building, Masonry |
  | Harvesting | Farming, Beast Taming, plus the new Mining and Foraging |
  | Scavenging | Scavenger |
  | Navigation | Astral Navigation |

- **Blueprint fields:** every Blueprint has a `profession` and a `specialty` field.
- **Harvesting and Scavenging (v1.23):** Harvesting gathers ore, stone, crystal, and plants. Scavenging strips hide, bone, blood, organs, and essences from corpses.
- **[[FAND/Atrious/Profession Progression|Profession Progression]] (v1.20):** Profession XP from crafting, designing, refining, and gathering, with teachers and milestones.
- **Specialty rules (v1.23):** you start with one specialty and gain more over time. Crafting outside your specialties is at disadvantage, and each specialty has its own requirement.
- **Realm specialties:** Hell, Heaven, and Void metals need a Blacksmith with the matching realm specialty.
- **[[FAND/Atrious/Profession Quick Reference|Profession Quick Reference]] (v1.23):** example Blueprints for each profession at levels 1, 5, 10, 15, and 20.
- **More Blueprints for the newer professions:** 177 across v1.17 and v1.20, and 59 Scavenging tools in v1.23.
- **Cleanup (v1.23):** 26 duplicates merged and names tidied. Same-stat variants (1,632 Blueprints) link each other in their descriptions.

## Monsters and realms
- **Realm lore (v1.09):** pages for the Mortal, Mysterious, Chaos, Abyss, Inner, and Primordial Realms. The pages for Hell, Heaven, the Outer Realm, the Void, and the Inner Void already existed.
- **Bestiaries (v1.10–v1.12):** one per realm.
  - **Homebrew:** 103 monsters with drops.
  - **Official:** 643 D&D monsters from the Monster Manual, Volo's, Mordenkainen's, Fizban's, and Glory of the Giants. Each has its CR, a grade from that CR, a description in my own words, and graded drops. There are no stat blocks.
- **Gathering pages (v1.10):** ores, plants, and crystals for each realm.
- **[[FAND/Atrious/Monster Stats|Monster Stats]] (v1.20):**
  - **Homebrew:** each monster has a level, HP, Natural AC, attacks, a save DC, and a signature trait from its best drop. Grade 10 monsters have boss rules.
  - **Official:** monsters convert to this AC system with Natural AC = 2 × (book AC − 10) + CR.
- **[[FAND/Atrious/Realm Travel|Realm Travel]] (v1.17):**
  - **Pressure vs. Attunement:** each realm has a Pressure from 0 to 9. A traveler's Attunement comes from their level, contract rank, or realm-material gear. If Pressure is higher, the traveler suffers strain.
  - **Getting there:** 11 travel methods, and an anchor from home makes the return trip easier.
- **[[FAND/Atrious/Realm Map|Realm Map]] (v1.20):** a diagram of every route between realms.

## Gods
- **[[FAND/Atrious/God Contracts|God Contracts]] (v1.08, v1.15):** ten ranks, from Minor up to 1st Finger, and the five Fingers form the god's Hand. Each rank has spells, Natural AC, duties, and a reward ladder. There are rules for rising in rank, staying loyal to one god, breaking a contract, and what happens when a god dies.
- **[[FAND/Atrious/God Roster|God Roster]] (v1.15–v1.16):** all 70 gods, each with:
  - the Runes it holds and its home realm,
  - what it wants from contractors,
  - three signature materials and a Finger relic,
  - its Hand, with 201 named Fingers in total,
  - its rivals: 31 contested Runes create rivalries between gods.

## Runes and lore
- **Stub pages filled (v1.17):** Ignis, Sylph, Infinatas, Elves, Horn, and Terraformation. New pages: Ambulance, Nick, Knocking, and God-Specific Runes.
- **Name-clash links:** Rune names shared with spells or Blueprints are linked by their full `FAND/Runes/` path so they open the right note.

## Spells
- **Support spells (v1.23):** 73 Tertiary and Secondary damage spells now heal, cure, ward, shield, teleport, or otherwise support. Each was renamed to match its new effect and scales with spell level.

## Player-facing pages
- **[[FAND/Atrious/Player's Guide|Player's Guide]] (v1.20, updated v1.23):** a plain-language tour of every system.
- **[[FAND/Atrious/Profession Quick Reference|Profession Quick Reference]]** and **[[FAND/Atrious/Realm Map|Realm Map]]**.

## Content policy and cleanup
- **Trademark scans (v1.20):** franchise and WotC-specific names are replaced throughout the vault and FAND.html, for example Tharizdun, Kyuss, Rivendell, and the Master Sword.
- **Official monsters:** names are allowed by your decision. Named unique beings (deities, demon lords, archdevils) stay renamed.
- **Link scans:** repeated scans keep the vault at no broken links and no orphan notes.

## FAND.html app
- **Materials tab:** all 1,597 materials, grouped by realm, with grades and properties.
- **Bestiary tab:** 738 monsters.
- **Subclasses:** 183.
- **Gods:** roster details for every god.
- **Blueprints:** synced with the vault (6,550), showing specialty, material grade, AC, and property.
- **Professions:** remapped to the 10.
- **Party tab:** removed (v1.22).

## Tools and repository
- **GitHub repository:** **github.com/Lucky40802/FAND** holds `app/FAND.html` and `tools/`. The tools folder has the data files, the generators for the Bestiary, Gathering pages, materials, God Roster, and Properties, the link and trademark checks, and the past migration scripts, with a README.
- **Patch Notes database (v1.19):** one note per version with full details, plus a hub page.
- **CLAUDE.md:** the handoff file that keeps future sessions consistent.

## Still open
- More official subclasses from late books.
- Placing the party in the new systems: contracts, rivals, and materials for each PC.
- Table tools: a crafting app, an encounter and loot generator, and a combat calculator.
- A god wars timeline and an adventure-hooks compendium.
- More conversions of damage spells to support spells, if wanted.
