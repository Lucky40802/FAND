# Brief: completing the pantheons (FAND)

FAND is a homebrew D&D 5e campaign in the world of Vestige. Gods from real-world mythologies came to Vestige as refugees after their world wore away; each holds Runes (Laws), lives in a home realm, wants things from its contracted mortals, has three signature materials (given at Normal, Senior, and Apostle contract ranks), a Finger relic, and a Hand of up to five named mortal Fingers.

Existing gods are in /home/user/FAND/app/FAND.html as `const GODS=[...]` (one line). Read them first: match their style exactly, and do NOT add any god already present (compare the name before " - ").

Data you must use (read from /home/user/FAND/app/FAND.html and /home/user/FAND/tools/data/vault.json):
- runes: 1 to 3 names, each EXACTLY an existing Rune: a note name in vault.json whose folder ("f") is "Runes". Prefer Runes that fit the god's myth. Sharing a Rune with another god (existing or new) is good: it creates a rivalry. Avoid Rune notes that are terms rather than Laws (God, Class, Runes, Pacts, Worship, realm names).
- home: one of the home values already used by existing gods (look at their "home" fields; e.g. "Heaven", "Hell", "Abyss", "Inner Realm", "Outer Realm", "Void", "Chaos Realm", "Mysterious Realm"). Underworld gods suit Hell or the Abyss; sky and order gods Heaven; trickster and chaos gods the Chaos Realm; fey and nature the Mysterious Realm.
- sig: exactly 3 names, each EXACTLY an existing material name from `const MATS=[...]` (non-generated ones preferred: entries without "gen":1), fitting the god, rising in grade.

Entry schema (JSON object):
{ "n": "<Name> - <Title>", "grp": "<Pantheon> Pantheon" (exactly as existing, e.g. "Greek Pantheon"), "myth": "1-2 sentences in your own words: who they are in the myths", "runes": [...], "home": "...", "wants": "what the god wants from contractors (one line, no full stop)", "sig": [3 materials], "relic": "Finger relic name", "seated": 0-5, "hand": [names of seated Fingers, 1st first, length = seated] }
Hand names are original mortal names (like the existing ones). Mix of seated counts (some gods have open seats).

Plain ASCII (straight apostrophes, no em dashes). Write a JSON array to your output path. Verify with node: parses; every rune and sig material exists exactly; no duplicate of an existing god; hand length equals seated; no non-ASCII. Report counts per pantheon and the names added.
