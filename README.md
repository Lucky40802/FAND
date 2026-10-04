# FAND

Non-Obsidian files for **FAND**, a homebrew D&D campaign. The campaign notes themselves live in an Obsidian vault; this repository holds the parts that aren't Obsidian notes:

- **`app/FAND.html`**: a single self-contained web app (about 26 MB) for browsing Blueprints, spells, materials, subclasses, gods, demons, patrons, and the Bestiary. Open it in any browser; it needs no server.
- **`tools/`**: the Node scripts and data files used to generate and maintain the vault's Bestiary, Gathering, Material Index, materials database, God Roster, and Blueprints.

## Requirements
- Node.js. The scripts are written for Node 6 (no modern syntax), so they run on any version.
- The Obsidian vault at `C:/Users/Lakshan Jagadeishan/OneDrive/FAND`. Scripts write into it using that path; change the path constants at the top of a script if the vault moves.

## Layout
| Folder | What's in it |
|---|---|
| `tools/data/` | Source data: realms and grades (`realms.js`, `grades.js`), material properties (`properties.js`), homebrew monsters and gatherables (`world1.js`, `world2.js`), official monster lists (`official1–5.js`), gods and their Hands (`gods.js`, `hands.js`, `hands2.js`), the profession mapping (`profmap.js`), extra Blueprint lists (`profbp*.js`, `scavbp.js`), subclass data (`data1–3.js`), and the generated `all.json` / `mats.tsv` |
| `tools/generators/` | Scripts that write vault pages |
| `tools/checks/` | Read-only scans |
| `tools/oneoff/` | Migration scripts already applied to the vault, kept for reference. Don't rerun them; most aren't idempotent |

## Generators
Run from the `tools` folder. With no argument they do a dry run; add `go` to write.

| Script | Writes |
|---|---|
| `node generators/genworld.js go` | `Bestiary/`, `Gathering/`, `Material Index.md`, and `data/all.json` |
| `node generators/genmaterials.js go` | `Materials/` (one note per material) and `Materials.base`. Run after `genworld` |
| `node generators/genprops.js` | `Material Properties.md` |
| `node generators/genroster.js go` | `God Roster.md` |
| `node generators/quickref.js` | `Profession Quick Reference.md` |

After running `genroster`, re-check Rune links: 16 Rune names are shared with spells or Blueprints, and vault notes link them as `[[FAND/Runes/Heal|Heal]]`.

## The website
The site is published with GitHub Pages at **https://lucky40802.github.io/FAND/**. The root `index.html` redirects to `site/`.

`node generators/buildapp.js go` (from `tools/`) builds two outputs from one template, `tools/app/template.html`:

- **`site/`**: one page per section (`index.html`, `blueprints.html`, `materials.html`, `bestiary.html`, `realms.html`, `gods.html`, `professions.html`, `spells.html`, `subclasses.html`, `demons.html`, `patrons.html`, `rules.html`, `tools.html`, `about.html`). The pages share `data/core.js` (about 3.5 MB); only `spells.html` loads the 23 MB `data/spells.js`.
- **`app/FAND.html`**: the same interface as a single self-contained file with every data array inline, for offline use. Scripts that patch the data arrays (`const BPS=[…];` and so on) work on this file, since each array stays on one line.

The build reads the data arrays from `app/FAND.html`, cleans and enriches them (material rank, Item Level, price, and sources; monster grades and drops; god Runes, Hands, and rivals), and writes both outputs. It's safe to rerun. To change the interface, edit the template and rebuild.

Materials get an **origin** and a **unique trait** from `tools/data/traits.js`: creature parts carry an effect drawn from the creature's signature ability and the body part (a hawk's eye sharpens sight, troll blood regenerates), plants carry small herbal effects, and ores, stones, gems, and supplies are basic. Blueprints list the traits their materials give when equipped.

**AI assistant.** Every page has an "Ask FAND" assistant that answers from the compendium's data, using Claude through the visitor's own Anthropic API key (entered in Settings and kept only in that browser). It uses the official Anthropic JavaScript SDK, bundled at `tools/app/vendor/anthropic.js` (rebuild with esbuild from `@anthropic-ai/sdk` to update it).

The site has a home page, cross-linked detail views (a material shows the Blueprints that use it, the monsters that drop it, and the gods who hold it), Realms, Professions, Rules, Tools, and About pages, search across everything (Ctrl K), pins, shareable links to any item, and light and dark themes.

## Table tools on the site
- **Forge** (`forge.html`): every weapon and armor is a base design (Axe, Sword, Dagger, Hammer, Spear, Bow, Staff, Body Armor, Shield, Focus) built part by part. Each part accepts certain material categories; the wrong material carries heavy penalties. Named Blueprints open in the Forge with their materials filled in.
- **Craft** (`craft.html`): every material for a Blueprint, where to get it, cost, refining counts, and what a party member is missing.
- **Party** (`party.html`): characters with contracts, rivals, gear, traits, materials, money, and armor drawbacks. Saved in the browser; export and import as JSON.
- **Encounters** and **Combat** (`encounter.html`, `combat.html`): XP-budget encounters by realm, and an initiative tracker that applies flat AC to every hit.

All of this is stored in each visitor's browser (`localStorage`), so nothing is shared between devices unless exported.

## Content added by the build
- `tools/data/myth.js`: creatures from world mythology and folklore (Greek, Norse, Egyptian, Hindu, Aztec, Celtic, Japanese, Mesopotamian, and more), each with an original description. They get harvest parts, stat blocks, and lore like every other monster.
- Monster lore (Overview, Appearance, Behavior and Tactics, Habitat and Ecology, Society, Harvesting, In FAND, Adventure Hook) is written by the site from each monster's body plan, realm, stats, and drops.

## Bringing data back to the vault
| Script | Does |
|---|---|
| `node generators/importspells.js "<vault>/FAND/Atrious/Spells" go` | Replaces the app's spell list with the vault's spell notes (reads each note's frontmatter: school, level, casting time, range, duration, damage, class). Then run `buildapp.js go`. Dry run without `go` prints a report |
| `node generators/vaultac.js go` | Updates the AC of every armor and shield Blueprint note in the vault to the flat system (a full set of iron gear gives 10; formula in `tools/data/armor.js`). Keeps the old value as `acOld` and backs up each note to `tools/out/backup_blueprints_ac` first. Dry run without `go`; pass the Blueprints folder as a second argument if the vault has moved |
| `node generators/exportharvest.js go "<vault>/FAND/Atrious/Materials"` | Writes the generated harvest parts as material notes plus a `Harvest Parts.md` index. Without a path it writes to `tools/out/harvest`. Never overwrites a note that isn't a harvest part |

## Checks
| Script | Does |
|---|---|
| `node checks/linkscan.js` | Broken links and orphan notes across the vault |
| `node checks/tmscan.js` | Trademarked or franchise names in the vault and `FAND.html` (book titles used as source labels are expected) |
| `node checks/dupscan.js` | Duplicate and near-duplicate Blueprints |

## Notes
- The vault's own change log is its Patch Notes database (`FAND/Patch Notes/`). Changes made here that affect the vault should get a patch note there too.
- Official D&D monster names appear in the data under the campaign's content policy: names, CR, and short original descriptions only, no book stat blocks or book text. The website shows **generated** stat blocks in the Monster Manual layout (`tools/data/statblock.js`), built from each monster's CR, body plan, and drops; they are original, not copied from any book.
- Every monster yields 6-10 materials: the vault's drops plus generated harvest parts (`tools/data/harvest.js`, marked "Harvest part" on the site). Generated parts exist only in the app until they're added to the vault.
- Each realm has its own coin (defined in `tools/app/template.html`, `CURRENCY`), worth the realm's base price ÷ 5 gp.
