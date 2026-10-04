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

## Checks
| Script | Does |
|---|---|
| `node checks/linkscan.js` | Broken links and orphan notes across the vault |
| `node checks/tmscan.js` | Trademarked or franchise names in the vault and `FAND.html` (book titles used as source labels are expected) |
| `node checks/dupscan.js` | Duplicate and near-duplicate Blueprints |

## Notes
- The vault's own change log is its Patch Notes database (`FAND/Patch Notes/`). Changes made here that affect the vault should get a patch note there too.
- Official D&D monster names appear in the data under the campaign's content policy: names, CR, and short original descriptions only, no stat blocks or book text.
