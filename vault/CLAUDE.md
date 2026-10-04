# CLAUDE.md — handoff for Claude Code sessions on the FAND vault

This is the user's Obsidian vault for a homebrewed D&D campaign called **FAND** (the umbrella name; "Archive of the Lost" was the original name of the imported Atrious material). Read this first, then `FAND/Patch Notes.md` for what changed most recently.

## Standing rules from the user
1. **Patch notes:** after any change to vault content, create a new version note `FAND/Patch Notes/Patch vX.XX.md` (copy the frontmatter of the latest one: version, date, title, areas, added/changed/fixed counts, tags: [patch]) with full Added / Changed / Fixed detail, add a one-line entry at the top of the "All versions" list in `FAND/Patch Notes.md` and bump its "Current version", and bump the version in the Patch Notes line of `FAND/FAND.md`. `Patch Notes.base` picks up new notes automatically. Current version: **1.24**.
2. **Ask what's next** after finishing a chunk of work; don't assume direction. Use short option questions when scope is genuinely ambiguous.
3. The user is decisive and often repeats a request until it's done. Act on clear requests; only stop for real ambiguity or a legal/content boundary (below).
4. Auto-memory lives in `C:\Users\Lakshan Jagadeishan\.claude\projects\C--Users-Lakshan-Jagadeishan-OneDrive-FAND\memory\`.

## GitHub repository (non-Obsidian work)
- Anything for this project that isn't an Obsidian note goes in the git repo **github.com/Lucky40802/FAND**, cloned at `C:/Users/Lakshan Jagadeishan/Documents/GitHub/FAND` (user request, 2026-10-04). It holds `app/FAND.html` and `tools/` (data/, generators/, checks/, oneoff/; see its README). Write new scripts there instead of the session scratchpad, keep `app/FAND.html` in sync with the vault copy, and commit with a clear message. Push only when the user has asked for it in the session.

## Layout (vault root is this folder; content is in `FAND/`)
- `.mcp.json` — Obsidian MCP config. **Must stay at vault root.** (Obsidian MCP is frequently disconnected; work on files directly.)
- `FAND/FAND.md` — hub note. `FAND/Patch Notes.md` — one-page version hub embedding `FAND/Patch Notes/Patch Notes.base`; one full note per version in `FAND/Patch Notes/`.
- `FAND/Runes/` — ~515 Rune notes (the Law/magic system). `Runes/Class.md` maps Runes to a D&D class + subclass and defines the Primary/Secondary/Tertiary acquisition tiers (a Primary piece of a progenitor unlocks a unique class ability).
- `FAND/Atrious/` — the setting content:
  - `Classes/` (13 classes, each lists its subclasses), `Subclasses/` (163 notes; class pages note the 2024 PHB revisions), `Professions/` (10 broad professions: Blacksmithing, Carving, Tailoring, Alchemy (note: `Alchemy (Profession).md`, since Alchemy is a Rune), Cooking, Enchanting, Engineering, Harvesting, Scavenging, Navigation; the 31 old crafts are listed as specialties on each page), `Crafting Rules.md`, `Master Professions.md`, `Material Grading.md` (realm tier + grade 1-10 → Material Rank → Item Level), `Custom Blueprints.md` + `Custom Blueprint Template.md` (player-designed items; saved in `Blueprints/Custom/`), `Materials/` (1,597 material notes + `Materials.base`; generated from the Bestiary/Gathering/Index data, so edit a material in both its note and its page) + `Material Index.md` + `Bestiary/` and `Gathering/` (one page per realm; monsters, drops, gatherables), `Material Properties.md` (each material's crafting property, scaled by Potency 1-10), `God Roster.md` (70 gods: Runes, realm, signature materials, Hand, rivals by shared Rune), `God Contracts.md` (10 ranks Minor→1st Finger; Fingers = the god's Hand), `Player's Guide.md` (player-facing summary of all systems; update it when rules change), `Economy.md` (prices; material notes have `price`), `Profession Progression.md`, `Monster Stats.md` (formula stats for homebrew monsters; AC conversion for official ones), `Realm Map.md` (Mermaid), `Realm Travel.md` (Realm Pressure vs Attunement, travel methods), `Material Refining.md` (3→1 grade up), `Armor Class.md` (AC starts at 0; damage reduction in reverse tax brackets on a 1/x curve)
  - `Blueprints/` — ~6,290 individual item notes + one `.base` (Obsidian Base) per profession; `Blueprints Index.md`
  - `Spells/` — ~2,330 spell notes + 20 `.base` files + 20 `<School> (School).md` hub notes + `Spell Index.md`, `Spell Slots.md`, `School of Resonance.md`
  - `Gods/`, `Demons/`, `Patrons.md`, `Party/` (8 PCs), `FAND.html` (25 MB self-contained database app; synced 2026-09-27 with materials by realm, a Bestiary tab (no Party tab since v1.22), 183 subclasses, and god roster details. Its 90k spells are its own older dataset; its Blueprints were synced with the vault on 2026-10-04 (6,550 incl. app-only items; fields pr, sp, gr, ac, prop), not the vault's. Node 6 can't JSON.parse the SPELLS array: patch it by regex)

## Data conventions
- Spell frontmatter: `school, tier, rune, class, level, castingTime, range, duration, components, damage, tags`. Tiers: Cantrip / Tertiary / Secondary / Primary (original pyramid; Primary is tied to a named Rune), `SRD` (real 5e spells), `Original` (25 supplement-inspired spells). `tags: [tier]` drives graph coloring. All spells link to their school hub, so there are no orphans.
- Blueprint frontmatter: `profession, specialty, category, level, damage, rarity, materials`. Blueprints with materials also have `materialGrade, materialRank` (strongest material; grades in `Material Index.md`). Weapon/armor/shield blueprints also have `property, potency` (strongest material's property). Armor and Shield blueprints also have `ac, armorType, slot`, derived from level by the table in `Armor Class.md`. Weapon damage scales with level (~`round(3*level/dieAvg)` dice).
- Wikilinks use full paths `[[FAND/Atrious/...|Label]]`. Inside markdown tables the pipe is escaped `\|` — that is correct; naive link checkers flag it as broken (false positive). `.base` links include the extension.
- Naming clashes to avoid: don't name new things after existing Runes, spell schools, or professions (e.g. Runic Craft was renamed Sigilcraft; Wizard/Sorcerer subclasses that collide are suffixed "(Wizard)", "(Sorcerer)", "(Patron)").
- Professions were consolidated to 10 in v1.21. Blueprints have `profession` (new) and `specialty` (old craft name). Harvesting gathers ore/stone/crystal/plants (specialties incl. Mining, Foraging); Scavenging strips organic parts from corpses (user definition, 2026-10-04); Hell/Heaven/Void metals need a Blacksmith realm specialty.

## Content / legal policy (decided with the user — follow it)
- **Verbatim** WotC text is not reproduced. Open-licensed **SRD 5.1/5.2** spells and the 13 SRD subclasses are included (paraphrased) with CC-BY-4.0 attribution in `Spell Index.md`.
- Non-SRD subclasses (PHB/Xanathar's/Tasha's/Wildemount etc.) are included **under official names as paraphrased summaries** labeled with the source book and "check the book for exact wording". Don't paste book text.
- Trademarked characters/franchise IP were purged everywhere (archmage-named spells like Bigby/Mordenkainen → renamed; demon lords, Tiamat→Vyrekala, Game of Thrones/Tolkien/FF/Zelda items, etc.). Keep new content original; if adding blueprints/lore, don't reuse franchise names. Check `FAND.html` too: it embeds the same data and was cleansed in place (backup was in a scratchpad, not the vault).
- **Monsters (user decision 2026-09-27):** official D&D monster names are allowed in the Bestiaries, including WotC trademarked ones (beholder, mind flayer, githyanki, etc.), with CR, a short own-words description, and graded drops only: no stat blocks or book text. Named unique characters (deities, demon lords, archdevils) stay renamed. The generator scripts and data are in the GitHub repo under tools/.
- Party notes (Miranda, Olivia, Kelvin, Jimmy, Farhan, Arham, Jash, Peverthan) are live characters — treat their subclass/traits as canon.

## Tooling pitfalls (Windows, Git Bash + PowerShell)
- Node is **v6.14** (no modern syntax; `fs.readdirSync(..., {withFileTypes})` doesn't exist). No Python, no `zip` — use PowerShell `Compress-Archive` for zips.
- Inline `node -e` with regex/backslashes breaks under bash escaping. **Write a `.js` file to the session scratchpad and run it.** Use `C:/...` paths, not `/c/...`, inside Node.
- Bulk edits: script them, test on a copied sample first, verify counts and duplicates afterward. The vault is not a git repo, so back up before destructive changes.
- Useful checks already written in past sessions: orphan finder (0 in / 0 out links), broken-link scan, duplicate-description scan for spells and blueprints, residual trademark-term scan. Recreate as needed.

## Open ideas / not done
- Official subclasses: all PHB, Xanathar's, Tasha's, and SCAG subclasses are in, plus a few from other books. Not yet added: 2024 PHB revisions and some late-book options (e.g. Circle of the Sea, Path of the World Tree).
- Spell `class` is filled for every vault spell (pyramid spells by school + Rune class). 73 damage spells were converted to healing/support in v1.23 (renamed; tagged healing/support).
- 16 Rune notes share a basename with a spell or Blueprint (Heal, Light, Wish, Shield, Resistance, Fear, Haste, Creation, etc.). Link them as `[[FAND/Runes/Heal|Heal]]`, never bare `[[Heal]]`.
- Tabs: a concurrent Claude session may also be editing the vault — re-read files before overwriting.
