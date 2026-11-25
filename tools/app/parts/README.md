# The page, in parts

`tools/app/template.html` is the page's frame. Its style and script live here, split by topic, and
`tools/generators/buildapp.js` stitches them back in: a line holding only `/*@include parts/x*/` or
`//@include parts/x` is replaced by that file, so the built page is exactly what one big file would be.

| File | What is in it |
| --- | --- |
| `styles.css` | Every style on the site |
| `core.js` | Startup, saved data, Undo and Redo, the inbox |
| `pictures-items.js` | Pictures, Runes, the lists and an item's window, search |
| `campaign-notes.js` | Live initiative, the campaign wiki, the Archive, the notepad, sessions and the timeline |
| `search-home.js` | Traits, saved searches, This week, Home |
| `lore-tools.js` | Lore, Tools, the session clock, the calendar and downtime |
| `party-sheet.js` | Craft, the Party page, the character builder, the sheet, standing, cursed gear |
| `encounter-combat.js` | Encounters and combat |
| `classes-magic.js` | Classes and the Magic Towers |
| `shop-trade.js` | Reputation, trade requests, swaps, shared loot, the stash, the trade history, the loot pool, DM shops |
| `prep-spoils.js` | Session prep and spoils |
| `forge-workshop.js` | The Forge, the Workshop and the Smelter |
| `guide-account.js` | The New player guide, accounts, syncing and campaigns |

The script files are one program: they are joined in the order above (as listed in `template.html`), so a function in
one file can use anything defined in another.
