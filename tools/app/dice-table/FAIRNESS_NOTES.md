# Fairness notes (for whoever maintains this page)

The page was tested to make sure no die can be rolled to the same result too easily.

**What was found and fixed**
- Picking dice up and dropping them again (a click on the table, grabbing a single die, or a slow drag) used to give the same result as the previous roll almost every time (a plain click repeated 100%, re-dropping a single die about 95%, slow drags 30-65%). A die was released in the orientation it already had and simply fell. Now every pick-up lifts the dice into the air and gives each one a quick tumble to a fresh, uniformly random orientation (`startShuffle` / `shuffleStep` in the engine), then a fresh random spin that does not depend on its old orientation.
- A subtler leak was found while testing: the spin used to steer a die into its new orientation was kept after the shuffle, which made the final pose slightly depend on the old one. The spin is now reset to a random value when the shuffle ends.
- Gentle releases scatter the dice sideways a little, and a quick tap drops the whole handful from the cursor in a fresh arrangement, so dice never land in the same pocket twice.
- Rolls from the Roll button always started from a random orientation and were already fair.

**Measured afterwards** (seven roll types, hundreds of rolls each, plus 3,000 to 7,000 simulated throws per die type)
- d2, d4, d6, d8, d10, d12, d20 and the d100 pair: results are uniform (chi-square tests pass; the coin came up heads 50.3% of the time over 3,200 throws), and repeat-of-previous rates match chance (for example d2 about 50%, d4 about 25%, d6 about 16%, d20 about 5%).
- Dice thrown together are independent of each other (two coins thrown side by side matched exactly 50.0% of the time), and the d100 tens and units dice are independent.
- Known small wobble: with 17 dice crowded on the table and a quick tap, the coin repeated its previous result about 53-54% of the time (fair is 50%). It is fair in small pools and with the Roll button. The cause was not pinned down.

**The d100 (a true 100-sided die)**
- The shape is 52 points (26 opposite pairs) whose hull is 100 triangles, tuned so every face covers the same solid angle (spread under 0.5%) and every face has a parallel opposite face (opposite faces sum to 101).
- Even so, simulation showed a rolling 100-faced ball is not fair: over 7,200 throws some faces came up 2-3 times too often and others almost never (chi-square 562 against a limit of 123). So for this die only, the result is drawn uniformly at random and the labels are swapped when the die settles so the top face shows it (`fairRelabel` in the engine). Measured through the page afterwards: chi-square 106 and 109 over 1,350 rolls each (limit 123), repeat-of-previous about 1%, same-throw match about 1%, all as fair as chance.
- Do not read the top face of a d100 straight from the physics. If it ever needs to be physically driven, re-run the simulation first.

**Throw styles.** The Soft drop and Table-slam styles were re-tested: every die type stays uniform with repeat rates at chance (for example slam: d10 chi-square 4.5 on 9 degrees of freedom over 5,900 simulated throws, d20 26.8 on 19 over 6,900). Replay, ghost dice, bullet-time and atmospheres do not touch the dice physics.

**Weather, mood and Fate dice, rules, presets.** The Weather die and the Fate die use the cube and the Mood die the octahedron, so they roll exactly like a d6 and a d8; tested through the page (button throws, taps, drop in place): uniform, repeat rates at chance. Blessed and cursed dice change only the look, the sound and the weight by about 12 percent, not the shape. Exploding dice, re-rolled 1s, success counting and drop-lowest are applied to the dice's own results and never choose a face. The chaos slider, earthquake, wobble, tilt, rails and obstacles change how the dice move, not which face a die starts from, and each pick-up still shuffles the die to a random orientation.

**To re-run:** `python tests/fairness.py drop 150` (see the top of that file). Any change to the physics or to how dice are picked up or released should be re-tested this way.
