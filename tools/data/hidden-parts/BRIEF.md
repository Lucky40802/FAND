# Brief: FAND hidden classes (shared by every writer)

FAND ("Fantasy and Numerous Disasters") is a homebrew D&D 5e campaign set in the world of Vestige. Vault: /home/user/FAND/tools/data/vault.json ({notes:[{f,n,md}]}). House style: read /home/user/FAND/tools/data/hidden.js first (45 existing hidden classes) and match it: player-manga / LitRPG hidden-class tropes (job-change quests, odd specific conditions, system-style notices, evolutions, named Skills and an Ultimate) plus folklore and fantasy motifs as flavour. All names and abilities ORIGINAL: no names or signature powers from any manga/anime/game/franchise, no official D&D subclass names, no vault subclass names, no Rune names used alone as a class name, no names already in hidden.js.

Canon rules:
- Hidden classes are unlocked only through quests and the Towers (one Tower per realm, grown from the excess energy of unclaimed Runes).
- Tiers: Unique (one of a kind), Epic (a specialisation of a basic class or subclass), Legendary (follows the progenitor of a Rune).
- Stages: every 10 levels is a stage tied to a realm tier (1-10 Human, 11-20 Mysterious, 21-30 Hell and Heaven, 31-40 Chaos, 41-50 Abyss, 51-60 Inner Realm, 61-70 Outer Realm, 71-80 Void, 81-90 Inner Void, 91-100 Primordial). Max level 100.
- Towers and their level ranges (floor levels): Human (The Milestone Spire, levels 1), Mysterious (Fogglass Spire, 11-12), Hell (Ledger Spire, 21-23), Heaven (Choir Spire, 21-23), Chaos (Shuffled Spire, 31-34), Abyss (Sunken Spire, 41-45), Inner Realm (Heartwood Spire, 51-56), Outer Realm (Horizon Spire, 61-67), Void (Hollow Spire, 71-78), Inner Void (Unlit Spire, 81-89), Primordial (First Spire, 91-100).
- FAND mechanics: AC is a flat subtraction from each hit's damage (keep AC grants to +1 or +2 max); materials have realm grades and Potency; gods hold Runes and grant contracts (Minor up to 1st Finger); Realm Pressure 0-9 strains travellers below that Attunement.

Entry schema (JSON object):
{ "n": name, "tier": "Epic" | "Legendary", "base": basic class name or "Any", "sub": subclass name (Epic for a subclass only), "prog": progenitor name (Legendary only), "rune": the Rune (Legendary only), "tower": realm name exactly as listed above, "requires": short prerequisite, "unlock": concrete job-change quest (1-2 sentences), "secret": hidden condition for the DM (1 sentence), "notice": one line in square brackets, "blurb": 1-2 sentences, "features": [[level, "Skill: Name", "effect, 1-2 sentences"], [level, "Skill: Name", "..."], [level, "Ultimate: Name", "..."]], "evolves": 1 sentence, "cost": a drawback or price, 1 sentence }

Plain ASCII only (straight apostrophes, no em dashes, no curly quotes), no markdown inside strings. Keep each entry tight (aim for 60-110 words total) so the whole file stays manageable.

Write your output as a JSON array to the exact output path you were given (pretty-printed, one entry per object). Then verify with node that it parses, the count is right, every entry has all fields for its tier with 3 features, names are unique within your file and do not appear in hidden.js, and there is no non-ASCII. Report only the count and 5 sample names.
