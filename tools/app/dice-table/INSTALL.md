# Instructions for Claude: add the Dice Table page to this site

You have been given `dice-table.html`: a **finished, self-contained page** (about 135 KB). It has no dependencies (no libraries, no CDN, no network calls) and works offline. Your job is to add it to the user's site and link to it. **Do not rewrite, refactor or "improve" the page's code**: it contains a custom 3D physics engine, a renderer, a GIF encoder and a small game, all tuned and tested together. If something needs changing, use the `CONFIG` block near the top of the `<script>` (listed below), or ask the user.

## What the page does
- **Physics:** real rigid-body dice (own engine, 120 Hz): mass from volume (a d20 is heavier than a d4), inertia, friction, bounce, sleeping. The number read is the face actually pointing up. A die that ends up leaning or stacked is dropped again automatically.
- **Dice:** d2 (a coin), d4, d6, d8, d10, d12, d20 and d100, which is a true 100-sided die (100 triangular faces, opposite faces add up to 101).
- **Mouse rolling:** press and hold on the table to scoop up all the dice, drag, release to throw. The dice hang off the mouse on a springy link, so they swing and lag (heavy dice more) and carry the hand's velocity when released; a dotted arrow and a power bar show where and how hard they will go. A slow drag just drops them, a flick throws hard. Press on one die to re-roll just that die. Roll button / Space also throw. Works with touch.
- **Roll types and modifiers:** advantage / disadvantage (each d20 becomes two dice, the dropped one is greyed out), a flat bonus plus any number of named modifiers (toggle or remove each), an optional target number (DC) that tints the table green or red.
- **Criticals:** natural 19-20 on the d20 that counts = critical success, natural 1-2 = critical failure (adjustable in the page).
- **Surfaces and maps:** felt, wood, ice, grass, rocks (each with its own friction, bounce, sound and look), rails on/off (rails off = open ground: throw as hard as you can and the camera follows the dice and zooms out as they spread), map presets (tavern, frozen lake, moon table, windy deck, heavy dice...) and "save current as map".
- **Physics mods:** gravity, bounciness, friction, drag, dice weight, throw power, rail bounce, wind (strength and direction), table size, dice size.
- **Dice customiser:** 22 built-in colour sets, plus a creator with marble streaks, swirl, galaxy, speckle, stripes, gradient, finish (matte/gloss/metal/gem) and number style (serif/sans/mono/Roman). Sets can be saved, edited and deleted, and applied to all dice or to one die type.
- **Skip:** a Skip button (or the S key) fast-forwards the physics so the result shows at once; "Instant rolls" does that for every roll.
- **Roll log:** every roll is logged (time, expression, total, breakdown, DC result, surface). It can only be cleared completely (with a confirmation), unless the user enters a secret code, which unlocks deleting single rolls for 5 minutes. CSV export.
- **Streaks and GIFs:** repeating the same result in a row shows a streak badge and the GIF export grows to include every roll in the streak.
- **Dice Dungeon (pop-up, barebones):** opened from the ⚔ button in the header. 10 floors, each with a DC and a fixed dice pool, rolled on the main table. Beat the DC to go down; **fail once and you are sent back to the start (floor 1)**. Clearing floor 10 plays a victory animation. A small floor label with Map / Leave buttons stays on the table while you play.
- **Share and embed:** the page reads its dice setup from the link (`#pool=2d6,d20&adv=adv&...`), has a "Copy link to this setup" button, an `embed=1` mode that shows only the table, and a postMessage API so another page can ask for a roll and get the result back. See `EMBED_API.md`.
- **Throw styles:** Flick, Scoop, Spin-heavy, Soft drop, Table-slam. They change the Roll button throw and the mouse release.
- **Bullet-time:** when a natural critical d20 is about to land the table slows down, the camera pushes in and letterbox bars appear. Switch off under Table, Effects.
- **Replay and ghost dice:** the last 15 rolls of the session can be replayed (restart, pause, scrub, 0.25x to 1x) from the Roll tab or the play button in the Log. Ghost dice leave a faint copy of the previous roll on the table for comparison.
- **Atmospheres:** Tavern, Dungeon, Casino, Wizard's tower and Spaceship console add lighting, vignette, sometimes a different felt or the new Metal surface, and an optional procedural ambient sound (no audio files).
- **GIFs:** each frame gets its own best 256 colours. Streak GIFs slow down and shake for later throws and grow with every repeat; a Share button uses the phone's share sheet when available. Streaks also play a rising sound.
- **More dice:** a Weather die (☀️⛅🌧️⛈️❄️🌫️) and a Mood die (😄😠😰😎😴😈😢🤩) that can change the table's weather and atmosphere when rolled (switch in Table, Dice flavour), and Fate dice (+, −, blank). Dice can have custom faces: emoji, pictures, runes, or blank, plus a see-through glass finish and glints on gems and metal.
- **Fun physics:** 12 extra map presets (Underwater, Zero-G, Bouncy castle, Jupiter, Earthquake, Wobbly table, Pinball, Carnival with magnetic rails, Snow globe, Thunderstorm, Sloping table, Block maze), plus sliders for chaos, table tilt, earthquake and wobble, rail behaviours (sticky, rubber, magnetic), obstacles (pillars, bumpers, ramps, blocks), weather (rain and storms change the friction, snow settles, fog, embers, dust, bubbles), dents and marks on the table, a wind brush (hold the right mouse button and sweep), and a physics debug overlay.
- **Blessed and cursed dice:** cosmetic halos and sounds with a slightly lighter or heavier die. They are exactly as fair as any other.
- **Rules:** exploding dice, re-roll 1s once, count successes, drop the lowest of each type (Roll tab, Rules).
- **Mini-games and challenges:** Closest to the centre, Lucky bounce, Tower builder (🎯 Games button); a "Challenge a friend" link that sets the other player's DC to your total.
- **Share:** a QR code for the share link.
- **Accessibility and comfort:** colour-blind safe colours, high contrast, aimed throws with arrow keys or a gamepad (hold Space or A to charge), a one-handed thumb pad, voice-powered throws (microphone), recording a video of the next roll, and an AR-lite camera background (no surface tracking).
- **Log and replay:** the roll log can be imported (CSV or JSON), exported as JSON, and, when unlocked, a range of rolls can be deleted. Replays are kept across reloads (IndexedDB).
- **Atmosphere extras:** candles, torches, chip stacks, floating orbs, status lights and kelp on the rails; animated weather and fog; stereo-panned impact sounds that depend on the die's material.
- **Extras:** dice trails, impact dust, per-surface sounds, performance presets (Pretty / Balanced / Potato), settings backup (copy / import), light and dark theme.

## Fairness
The page has been tested so that no die repeats results too easily (see `FAIRNESS_NOTES.md`; `tests/fairness.py` re-runs the test). If you ever change the physics or how dice are picked up or released, re-run it. Do not remove the per-pick-up shuffle (`startShuffle` / `shuffleStep`): it is what keeps a die that is picked up and dropped from landing on the same face again.

## Install steps

1. **Copy** `dice-table.html` into the folder that holds the site's other built pages (the folder that contains `dice.html`, `index.html` and `sw.js`; in the FAND repo that is `site/`). Keep the file name unless you also change the links below.

2. **Link to it.** The page's own "← Dice tools" button points to `./dice.html` (set by `CONFIG.backUrl`; change it if the site's dice page lives elsewhere). Add a link *to* the new page from the existing dice page, for example a button labelled "🎲 Open the physics Dice Table" with `href="./dice-table.html"`.
   - In the FAND repo the pages in `site/` are **generated**. Do not hand-edit `site/*.html`. The dice page is `renderDice()` in `tools/app/template.html`; add the link there, then rebuild with `node tools/generators/buildapp.js` (read the repo README first to confirm the build command and any steps before/after it).
   - If the site is not generated, just edit the dice page's HTML.

3. **Make it work offline / be found** (only if the site has these):
   - Service worker: the FAND `sw.js` precache list is built by `tools/generators/buildapp.js`. Add `dice-table.html` to the precache list there (not to `sw.js` directly, since the build overwrites it). A file that is not in the list still works online; it just is not saved for offline use.
   - `sitemap.xml` (also generated by `buildapp.js`): add the page if you want it indexed.
   - Make sure the build does not delete the file. If the build wipes `site/` before writing, have it copy `dice-table.html` from somewhere permanent (for example `tools/app/dice-table.html`) as part of the build instead.

4. **Check it works** in a real browser (a local server or `file://` both work):
   - The page loads with one d20 on the table and no console errors. Press Space: the dice are thrown, settle in a few seconds, and a result appears.
   - Add every die type (d2, d4, d6, d8, d10, d12, d20, d100), roll, and confirm every die shows a number and the total is right.
   - Advantage / Disadvantage: two d20s appear, one is tagged "dropped", the higher (or lower) one counts. Add a modifier: the total changes at once.
   - Hold on the empty table, drag quickly and release: the dice fly in that direction. A slow drag just drops them. Press on one die and throw it: only that die is re-rolled.
   - Table tab: pick Ice and Grass and roll (they should feel clearly different); switch Rails off, hold the dice and flick the mouse hard: the dice fly far and the camera follows and zooms out; try Gravity and Wind; save a map and reload it.
   - Dice tab: pick Galaxy, then change the pattern, press "New streaks", Save as new set, reload and confirm it is still there.
   - Roll while it is moving and press Skip: the result appears at once. Turn on "Instant rolls" and roll.
   - Log tab: roll a few times; no delete buttons are shown. Unlock deleting (it asks you to set a code the first time), delete one roll, lock again. "Clear whole log" asks for confirmation.
   - Roll a d2 repeatedly until the same result appears twice or more in a row, then press "Save GIF": a GIF downloads.
   - Press the ⚔ Dungeon button: enter the dungeon, win a floor (you go down), then fail one (you are sent back to floor 1; the Map button re-opens the pop-up and says so).
   - Roll twice: a faint ghost copy of the first roll stays until the second settles. Press "Replay last roll" and scrub it. Pick "Spaceship console" under Atmosphere and roll: the lighting and the Metal surface change. Choose "Soft drop" and "Table-slam" throw styles and roll.
   - Open `dice-table.html#embed=1&pool=2d6,d20&autoroll=1`: only the table shows and it rolls by itself. Then try the postMessage example in `EMBED_API.md` from a page on the same site.
   - Table tab: apply the Pinball, Underwater, Zero-G and Thunderstorm presets and roll; set Weather to Snow and watch it settle; hold the right mouse button and sweep to blow the dice. Pool: add a Wx, a Mood and some dF dice, roll, and check the card reads words and symbols and the table changes.
   - Roll tab: switch on Exploding dice and roll 4d6; open Games and play Closest to the centre; press the QR button and scan the code. Table tab, Comfort: turn on Aimed throws, press the arrow keys, hold Space and release.
   - At phone width the table stays pinned at the top and the controls scroll underneath. Theme toggle works, and so does the link back to the dice page.

## Settings you may change (top of the `<script>`, the `CONFIG` object)
| Setting | Meaning | Default |
|---|---|---|
| `backUrl`, `backLabel` | Target and text of the "← Dice tools" link | `./dice.html`, `Dice tools` |
| `storagePrefix` | Prefix for saved settings | `fand.` |
| `maxDice`, `maxPerType` | Most physical dice on the table, and per type | `30`, `20` |
| `defaultCritSuccess` | Natural d20 at or above this is a critical success | `19` |
| `defaultCritFail` | Natural d20 at or below this is a critical failure | `2` |
| `allowedOrigins` | Who may control the page with postMessage (`'same-origin'`, `'*'`, or exact origins) | `['same-origin']` |

The colours near the top of the `<style>` block (`:root{ --bg … }`) are copied from the FAND site. If the site's theme changes, update those variables.
The Dice Dungeon floors are the `FLOORS` array (each entry is a DC and a dice pool; the DCs were chosen for about a 25% chance of clearing all ten floors in one run, because a failure restarts the run). The built-in maps are the `MAPS` array, surfaces are `SURF`, and built-in colour sets are `PRESETS`.

## Things worth knowing
- **Saved data (browser `localStorage`):** `fand.theme`, `fand.diceskin` and `fand.dicesound` are the same keys the FAND site uses, so theme, dice colour and sound carry over. The page's own data is `fand.dphys` (dice pool, modifiers, crit rules, surface, physics, maps, colour sets, dungeon progress), `fand.dicelog3` (roll log, up to 1000 rolls), `fand.dlogcode` (salted hash of the log's secret code; the code itself is never stored), and `fand.dtab`. It never touches the site's existing `fand.dicelog`.
- **Secret code:** if the user forgets it they can still clear the whole log; nothing else depends on it. Do not add a recovery backdoor.
- The GIF recorder keeps a few quantised frames of recent rolls in memory only (about 3 MB per roll). It can be switched off in the Log tab.
- The d100 is a single 100-faced die. A ball with 100 faces does not roll evenly (some faces attract it more), so its number is drawn uniformly at random and, once the die has settled, the labels are swapped so the top face shows it (every number stays on the die once). The other dice read straight from the physics. Multiplayer rooms are **not** included: they need a server to relay messages, which a static site does not have. See `ROADMAP.md` for everything not built yet.
- For testing or for other pages, the page exposes `window.DiceTable` (current dice, state, `throwAll()`, `skipRoll()`, `evaluate()`).
- If you change the file, run it in a real browser afterwards. Do not judge it by reading the code alone.
