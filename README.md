# FAND

Everything for **FAND**, a homebrew D&D campaign: a mirror of the Obsidian vault, the database app, and the scripts that maintain them.

- **`app/FAND.html`**: a single self-contained web app (about 26 MB) for browsing Blueprints, spells, materials, subclasses, gods, demons, patrons, and the Bestiary. Open it in any browser; it needs no server.
- **`vault/`**: a mirror of the Obsidian vault: all notes under `vault/FAND/`, `CLAUDE.md`, and the safe parts of `.obsidian/` settings. Secrets and machine-local files are left out (see below). Open `vault/` as an Obsidian vault to browse it.
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
| `tools/cloud/` | Accounts and campaigns: the Supabase database setup (`schema.sql`) and the site's connection settings (`config.json`); also the Resinate shop's database setup (`resinate.sql`) |
| `resinate/` | The Resinate resin shop: a standalone page (`index.html`), its settings (`config.js`), and a copy of supabase-js (`vendor/`) |

## Syncing the vault
Run `node sync-vault.js go` from the `tools` folder to mirror the live vault into `vault/`; without `go` it only reports what would change. It deletes files from `vault/` that were removed from the live vault.

Left out on purpose:
- `.mcp.json`: holds the Obsidian Local REST API key. A copy with a placeholder is saved as `vault/.mcp.example.json`.
- `.obsidian/plugins/`: plugin data can store API keys.
- `.obsidian/workspace.json`: open tabs and panes only.
- `.claude/`: machine-local Claude Code settings.
- `FAND/Atrious/FAND.html`: the vault's older copy of the app. The current app is built by `buildapp.js` (see The website).

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

All of this is stored in each visitor's browser (`localStorage`). Without an account nothing is shared between devices unless exported; signed in, it follows the account (see Accounts and campaigns).

## Accounts and campaigns
Visitors can sign in with their email (Settings, Account). Signed in:

- **Their saved data follows them.** Everything the site keeps in the browser (characters, journal, crafting plans, designs, dice, pins, tool settings) is also kept in their account and loaded on every device where they sign in. Each saved item remembers when it last changed and the newest change wins; the party is merged character by character, so editing different characters on two devices loses nothing. Appearance, filters and searches, and the hidden-class locks stay on each device. The Anthropic API key is never sent.
- **A DM can run a campaign.** On the Party page the DM starts a campaign and copies its invite (a link and an 8-letter code). Players who join choose which of their characters to share. Every member sees the shared characters, and changes appear on everyone's Party page and sheet as they happen. Only a character's owner and the DM can change it. The DM can rename the campaign, make a new code, remove players, or delete the campaign; players can leave. Nobody loses their own characters by leaving.
- **Profile pictures.** In Settings, Account, anyone signed in can add a picture. The browser crops it to a square and shrinks it to 192 px before saving. It shows in the top bar, beside the person's name in a campaign, and on the characters they share. Only they and the people in their campaigns can see it. Added after the first release: an existing project needs `schema.sql` run again.
- **The DM's account can open the hidden classes.** Once the list is unlocked, a box on the Hidden classes page keeps the passphrase in the account, so it opens on any device where the DM signs in.

Accounts use [Supabase](https://supabase.com) (free tier is enough) and stay switched off until the site is connected to a project. To switch them on:

1. Create a Supabase project.
2. In its **SQL Editor**, paste all of `tools/cloud/schema.sql` and run it. It makes the tables, the row-level security that keeps each account's data private and each campaign visible only to its members, and the functions the site calls. It's safe to run again after an update.
3. Under **Authentication → URL Configuration**, set the Site URL to `https://lucky40802.github.io/FAND/site/` and add `https://lucky40802.github.io/FAND/**` to the Redirect URLs.
4. Under **Authentication → Emails**, add the code to two templates, **Magic link or OTP** and **Confirm sign up** (someone's first sign-in uses the second), for example `<p>Your FAND sign-in code: <b>{{ .Token }}</b></p>`. The code is what people type on a phone's Home Screen app, or when they open the email on another device. The built-in email sender is meant for testing and sends only a few emails an hour, so for a whole table set up your own sender under **SMTP Settings**.
5. From **Project Settings** (the Data API and API Keys pages), copy the project URL and the **publishable** key (or the legacy **anon** key) into `tools/cloud/config.json`. Both are meant to be public. Never put the secret or `service_role` key there.
6. Optional: to offer Google sign-in, turn on the Google provider under **Authentication → Sign In / Providers** and set `"google": true` in `config.json`.
7. Run `node generators/buildapp.js go` from `tools`, then commit and push.

With a URL and key in `config.json`, the build adds `vendor/supabase.js` (supabase-js 2.117.2) to the site and inlines it into `app/FAND.html`. Pages load it only when someone signs in. The offline app signs in with the emailed code, since a sign-in link can't open a local file.

### The site's own AI keys (optional)
FAND's AI features use [Groq](https://groq.com). By default **Forge with Groq** uses each player's own Groq key (Settings → Assistant), and new designs are filed on the Blueprints page by FAND's own rules. To let signed-in players use **your** keys instead, without ever sending them to a browser:

1. Run `tools/cloud/schema.sql` again (it adds a private `fand_private` schema the website can't reach, with a per-account daily counter).
2. In the **SQL Editor**, run the `vault.create_secret` lines from `tools/cloud/ai-keys.sql` with your real keys (from console.groq.com, starting `gsk_`): `fand_groq_key` for the Forge, `fand_sort_key` for filing new designs on the Blueprints page, and `fand_chat_key` for the chat assistant (stored for later; the assistant still uses each player's own Anthropic key). Keys are kept encrypted in Supabase Vault. Never put a real key in this repository.
3. Under **Edge Functions**, create a function named `forge` and paste `tools/cloud/functions/forge/index.ts` (or `supabase functions deploy forge` with the CLI). If calls fail with *Invalid JWT*, turn off **Verify JWT** for it: the function checks the sign-in itself.
4. Optional, under the function's **Secrets**: `FORGE_DAILY_LIMIT` (default 20), `SORT_DAILY_LIMIT` (default 60), `GROQ_MODEL` and `SORT_MODEL` (default `openai/gpt-oss-120b`).

Players who add their own key in Settings keep using it, with no daily limit.

## Resinate shop
`resinate/` is a separate site for selling handmade resin pieces, published at **https://lucky40802.github.io/FAND/resinate/**. The FAND build doesn't touch it. Customers pick a size and add-ons (printed design, colour dye, sparkle, LED, custom inclusions), put several pieces in one order, and place it; the page then shows the amount and the PayID or bank details to pay with, plus the order reference. Customers can check an order later under **Track order** with its reference and the contact they gave. At `#dashboard` the team signs in with an emailed code to see orders (new ones appear live), set prices for custom work, record payments (PayID, cash or card), copy messages for customers, export a spreadsheet, and, for editors, change prices, payment details, the photo gallery and the team list.

It stores everything in Supabase, in its own `resinate_*` tables. To switch it on:

1. In the project's **SQL Editor**, paste all of `tools/cloud/resinate.sql` and run it. (Until you do, `resinate/#dashboard` shows these steps with a link to the SQL Editor and a button that copies the file.) It makes the tables, a public `resinate` storage bucket for photos, live updates for orders, and row-level security: anyone can read prices, payment details and photos, customers can only place orders (priced on the server by `resinate_place_order`) and look up their own order with its reference and contact (`resinate_order_status`), and only the team can see or change orders.
2. Sign in at `resinate/#dashboard`. You aren't on the team list yet, so the page shows a one-line SQL statement with your email filled in; run it in the SQL Editor to make yourself the first editor, then reload.
3. Fill in **Payment details**, then add the rest of the team in the dashboard's **Team** section: role `staff` (orders and payments) or `editor` (also prices, payment details, photos and the team). A **Getting started** checklist tracks what's left.

`resinate/config.js` holds the Supabase project (FAND's by default) and the contact links shown to customers. Prices live in the database, with defaults in both `resinate/index.html` and `private.resinate_quote()` in the SQL; change the defaults in both places. Payments are checked by hand against the bank account; there's no card processing.

## Content added by the build
- `tools/data/myth.js`: creatures from world mythology and folklore (Greek, Norse, Egyptian, Hindu, Aztec, Celtic, Japanese, Mesopotamian, and more), each with an original description. They get harvest parts, stat blocks, and lore like every other monster.
- Monster lore (Overview, Appearance, Behavior and Tactics, Habitat and Ecology, Society, Harvesting, In FAND, Adventure Hook) is written by the site from each monster's body plan, realm, stats, and drops.

## Bringing data back to the vault
| Script | Does |
|---|---|
| `node generators/importspells.js "<vault>/FAND/Atrious/Spells" go` | Replaces the app's spell list with the vault's spell notes (reads each note's frontmatter: school, level, casting time, range, duration, damage, class). Then run `buildapp.js go`. Dry run without `go` prints a report |
| `node generators/vaultac.js go` | Updates the AC of every armor and shield Blueprint note in the vault to the flat system (a full set of iron gear gives 10; formula in `tools/data/armor.js`). Keeps the old value as `acOld` and backs up each note to `tools/out/backup_blueprints_ac` first. Dry run without `go`; pass the Blueprints folder as a second argument if the vault has moved |
| `node generators/importvault.js go` | Copies every note in the vault into `tools/data/vault.json`. The build attaches notes that match a website entry (Blueprint, material, spell, subclass, monster, god) to that entry as "From the vault", and puts the rest in the **Codex** page. Where a note and the website disagree, the website takes priority (`SUPERSEDED` in the template). A Rune note's frontmatter can set its progenitor (the Rune's original holder): `progenitor`, `progenitorTitle`, `progenitorForm`, `progenitorNature`, `progenitorOrigin`, `progenitorFate` (Killed or Vanished), `progenitorFateText`, `progenitorFell`, `progenitorRemains`, `symbol`. Run `buildapp.js go` afterwards |
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
