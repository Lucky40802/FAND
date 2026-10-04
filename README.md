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

The site has a home page, cross-linked detail views (a material shows the Blueprints that use it, the monsters that drop it, and the gods who hold it), Realms, Professions, Rules, Tools, and About pages, search across everything (Ctrl K), pins, shareable links to any item, and light and dark themes.

## Checks
| Script | Does |
|---|---|
| `node checks/linkscan.js` | Broken links and orphan notes across the vault |
| `node checks/tmscan.js` | Trademarked or franchise names in the vault and `FAND.html` (book titles used as source labels are expected) |
| `node checks/dupscan.js` | Duplicate and near-duplicate Blueprints |

## Notes
- The vault's own change log is its Patch Notes database (`FAND/Patch Notes/`). Changes made here that affect the vault should get a patch note there too.
- Official D&D monster names appear in the data under the campaign's content policy: names, CR, and short original descriptions only, no stat blocks or book text.
