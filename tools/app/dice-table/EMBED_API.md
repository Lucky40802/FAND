# Embedding the Dice Table and driving it from another page

## 1. Share links (no code needed)
The page reads its setup from the address, in the part after `#` (or after `?`). Example:

    dice-table.html#pool=2d6,d20&adv=adv&flat=2&mods=Prof%3A3&dc=15&surface=wood&theme=tavern&style=scoop

| Setting | Meaning |
|---|---|
| `pool` | Dice, like `2d6,d20,d100` (sides 2, 4, 6, 8, 10, 12, 20, 100), plus `dw` (weather die), `dm` (mood die) and `df` (Fate die), for example `pool=d20,dw,2df` |
| `adv` | `adv` or `dis` |
| `flat` | Flat bonus, for example `3` or `-1` |
| `mods` | Named modifiers, `Name:value` separated by commas (encode names with `encodeURIComponent`) |
| `dc` | Target number |
| `map` | A saved map or preset id (`default`, `tavern`, `lake`, `meadow`, `cavern`, `dungeon`, `casino`, `wizard`, `ship`, `moon`, `deck`, `heavy`, `underwater`, `zerog`, `bouncy`, `jupiter`, `quake`, `wobble`, `pinball`, `carnival`, `snowglobe`, `storm`, `slope`, `maze`) |
| `surface` | `felt`, `wood`, `ice`, `grass`, `rocks`, `metal` |
| `rails` | `0` for open ground |
| `theme` | `none`, `tavern`, `dungeon`, `casino`, `wizard`, `ship` |
| `skin` | One of the built-in colour set ids (for example `galaxy`, `gold`) |
| `style` | Throw style: `flick`, `scoop`, `spin`, `soft`, `slam` |
| `critS`, `critF` | Critical thresholds (18-20 and 1-3) |
| `challenge=1` | With `dc`, shows a "match or beat" banner for a friend's challenge |
| `autoroll=1` | Throw the dice as soon as the page has loaded |
| `embed=1` | Embed mode: only the table is shown (no header or side panel) and nothing is saved to the visitor's browser |

The page's "Roll" tab has a **Copy link to this setup** button that builds such a link from the current settings.

## 2. Embedding
    <iframe src="dice-table.html#embed=1&pool=d20" style="width:100%;height:560px;border:0"></iframe>

## 3. postMessage API
Host to page (`iframe.contentWindow.postMessage(message, origin)`):

    { type: 'fand-dice:roll',  id: 'any-string', pool: '2d6,d20' | {d6:2,d20:1}, adv: 'adv', flat: 2,
      mods: [{n:'Prof', v:3}], dc: 15, surface: 'wood', theme: 'tavern', style: 'scoop', instant: true }
    { type: 'fand-dice:set',   ...same fields, nothing is thrown }
    { type: 'fand-dice:skip' }          fast-forward a roll that is in progress
    { type: 'fand-dice:state' }         ask for the current setup
    { type: 'fand-dice:ping' }          ask the page to say it is ready

Page to host (all carry `source: 'fand-dice'`):

    { type: 'fand-dice:ready', version: 3 }
    { type: 'fand-dice:result', id, expr, total, sum, modifier, crit: 'success'|'failure'|'mixed'|'',
      critSuccesses, critFailures, dc, success, breakdown, streak,
      dice: [ { die:'d20', items:[ { values:[14,7], kept:0, crit:'' } ] } ] }
    { type: 'fand-dice:state', ... }
    { type: 'fand-dice:error', id, error }

A `roll` message gets exactly one `result` back with the same `id`. When the page is embedded, rolls the visitor makes by hand are also reported to the host, with `id: null`.

Example host code:

    const frame = document.querySelector('iframe');
    window.addEventListener('message', e => {
      if (e.data && e.data.source === 'fand-dice' && e.data.type === 'fand-dice:result')
        console.log('Rolled', e.data.total, e.data.breakdown);
    });
    frame.contentWindow.postMessage({type:'fand-dice:roll', id:'r1', pool:'d20', adv:'adv', flat:5, dc:14}, location.origin);

## 4. Who may talk to the page
By default only pages on the **same origin** are obeyed. To allow another site, add it to `CONFIG.allowedOrigins` at the top of the page's script, for example `['same-origin', 'https://example.com']` (`'*'` allows anyone). Messages from other origins are ignored, and replies go only to the sender's origin. Driving the page from outside never changes the visitor's saved settings.
