# FAND Dice Table: features not built yet

Updated after the "Section 2" and "Section 3" batch was built (everything except spoken result announcement, which you set aside), plus the weather/mood dice and the fun physics presets. Tags: **[you]** you asked for it or approved it, **[Grok]** suggested in the Grok brainstorm, **[me]** my own note or a known weak spot.

**Built so far (not listed below):** mouse-momentum throwing, rails on/off with a following camera, six surfaces and 25 saved map presets, physics sliders (including chaos, tilt, earthquake, wobble), the dice customiser with streaks, glass dice, custom face symbols, runes and blank dice, skip and instant rolls, the roll log with a secret code (CSV and JSON export, import, delete a range), DC highlighting, a barebones Dice Dungeon pop-up, the true 100-sided die, settings backup, performance presets, share links with a QR code, embed mode and a postMessage API, adaptive-colour GIFs with streak extras and sparkles, roll replay that survives a reload, ghost dice, five throw styles, bullet-time and a camera push-in on criticals, atmospheres with props, lighting and ambient sound, weather (rain, thunderstorm, snow that settles, fog, embers, dust, bubbles), obstacles (pillars, pinball bumpers, ramps, blocks), rail behaviours (sticky, rubber, magnetic), a wind brush, dents and marks on the table, a physics debug overlay, weather, mood and Fate dice, blessed and cursed dice, per-material and stereo-panned impact sounds, a rules engine (exploding dice, re-roll 1s, successes, drop lowest), three mini-games, challenge links, colour-blind and high-contrast modes, aimed throws with keyboard or gamepad, a one-handed throw pad, voice-powered throws, video recording and an AR-lite camera background.

---

## 1. Still to build

### Multiplayer room with a shared physics table [you]
- Room codes or short links. Everyone sees the same table and dice.
- Only the owner of a die (or the DM) can throw it. Collisions between different players' dice are allowed.
- Dice positions and spins streamed at about 10-20 Hz with prediction and smoothing; only while dice move; read-only spectators.
- DM mode in the room: a visible or hidden DC, green/red glow on dice that beat or miss it, a table lock until the DM says "roll", a "request roll" button, and the DM seeing results privately before revealing them.
- **Why it isn't built:** it needs a relay server (or a WebRTC signalling service). You said you accept the bandwidth cost. A static site cannot do this alone. Roll replay already records full dice motion, which is the same data a room would stream.

---

## 2. Ideas from the Grok brainstorm and gaps in what was just built

### Rules and gameplay
- **Opposed rolls** [Grok]: two dice pools thrown from opposite sides that collide in the middle, with a winner.
- **Group rolls** [Grok]: several players' dice on one table, with a scoreboard (a local hot-seat version would not need a server).
- **Narrative symbol dice** [Grok]: dice with success, failure, advantage, threat, triumph and despair faces (the Fate die is built).
- More rule options [me]: choose the number that explodes, "rule of 6", re-roll anything below a number, keep highest N across all dice.

### Environments and tables
- **Multi-level tables with a pit**, **round tables** and **procedurally generated table shapes** [Grok]. Obstacles exist, but the table itself is still a flat rectangle.
- **Real-time reflections** on dice [Grok]: shiny dice have glints, not reflections.

### Dice
- **Labelling blank dice face by face** [Grok]: today custom faces are a list that maps to the numbers 1, 2, 3 and so on.
- **Dice with personality** [Grok]: a name, mood or voice per die (cosmetic only, so it never touches fairness). Blessed and cursed dice are the cosmetic start.

### Camera and AR
- **Real AR** [Grok]: placing the table on a real surface with tracking. AR-lite only puts your camera view behind the dice.

---

## 3. Known weak spots and loose ends [me]

- **Coin repeats:** with 17 dice crowded on the table and a quick tap, the coin repeated its previous result about 53-57% of the time (fair is 50%). Cause not found; fair everywhere else.
- **d100:** a 100-faced ball does not roll evenly, so the d100 draws its number at random and swaps the labels when the die settles. Its numbers are small on a phone.
- **Weather and mood dice** change the table by a fixed mapping (for example Storm starts a thunderstorm, Sorrowful switches to the underwater atmosphere). The mapping is not editable yet.
- **Bullet-time** predicts the face when the die is almost still, so very rarely it slows down for a die that then rolls over to a different face.
- **Lucky bounce** only works with real-time throws, not with Skip or instant rolls.
- **Voice throws, video recording and the camera background** need permissions and were tested with fake devices only.
- **Replays** keep the last 15 rolls. A mouse throw's replay starts when the dice are picked up, and the d100's labels show their final numbers throughout.
- **Not tested on real devices:** everything was tested in a desktop browser (including touch emulation). Real phones, other browsers, gamepads, real audio output and the feel of a throw with a real mouse have not been tried.
- **The roll log is per browser.** Nothing syncs between devices.

---

## 4. Set aside

- **Spoken result announcement** [Grok]: you asked to leave this out.

---

## 5. Suggested order from here

1. Multiplayer rooms (large: needs a relay server).
2. Opposed rolls and group rolls with a scoreboard, then narrative dice (medium).
3. Pit and round tables, dice personality, editable weather and mood mapping (small to medium).
