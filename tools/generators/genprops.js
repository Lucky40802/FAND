var fs = require('fs');
var SC = require('path').join(__dirname, '..', 'data');
var PR = require(require('path').join(__dirname, '..', 'data', 'properties.js'));
var nice = function (s) {
  return s.replace(/\{P1\}/g, 'Potency + 1').replace(/\{B1\}/g, 'B + 1').replace(/\{P2\}/g, '2×Potency').replace(/\{P5\}/g, '5×Potency')
    .replace(/\{P10\}/g, '10×Potency').replace(/\{DC\}/g, '10 + 2×B').replace(/\{P\}d6/g, 'Potency d6').replace(/\{P\}/g, 'Potency').replace(/\{B\}/g, 'B');
};
var used = {};
PR.RULES.forEach(function (r) { used[r[1]] = 1; });
var L = ['# Material Properties', '',
  'Every material has a **property**: what it adds to an item when used in a [[FAND/Atrious/Custom Blueprints|Custom Blueprint]]. A mimic\'s hide lets a weapon change shape. An Undead King\'s Heart makes an item a necromancy focus that strengthens your undead. Each material\'s property is listed in the [[FAND/Atrious/Material Index|Material Index]] and on its Bestiary or Gathering page.', '',
  '## How properties work',
  '- The **primary** material\'s property always applies. Each **secondary** material adds its property. Binding agents and supplies add none.',
  '- The item\'s rarity caps how many properties it can hold (see Custom Blueprints).',
  '- The same property twice doesn\'t stack: use the higher Potency.',
  '- **Existing Blueprints:** every weapon, armor, and shield Blueprint carries the property of its strongest non-supply material, on top of its written stats. It\'s listed in the note\'s `property` and `potency` fields, in a Material Property section, and as columns in each profession\'s Base. Other categories (artifacts, potions, and so on) keep only their written stats.', '',
  '## Potency',
  'A property\'s strength comes from the material\'s grade:', '',
  '- **Potency** = Item Level ÷ 5, rounded down (minimum 1).',
  '- **Peak materials** are stronger: grade 9 adds +1 Potency and grade 10 adds +2 (maximum 10). A realm\'s best materials outclass the next realm\'s weakest.',
  '- **B** (the bonus) = Potency ÷ 2, rounded up, so 1 to 5.',
  '- Save DCs from properties are **10 + 2×B**.', '',
  '| Realm | Potency range |', '|---|---|',
  ].concat(require(require('path').join(__dirname, '..', 'data', 'realms.js')).order.filter(function (c) { return c !== 'Hv'; }).map(function (c) { var RR = require(require('path').join(__dirname, '..', 'data', 'realms.js')), lo = PR.potency(c, 1), hi = PR.potency(c, 10); return '| ' + (c === 'He' ? 'Hell / Heaven' : RR.name(c)) + ' | ' + (lo === hi ? lo : lo + '–' + hi) + ' |'; })).concat(['',
  '## All properties', '| Property | Effect |', '|---|---|']);
Object.keys(PR.A).forEach(function (k) { if (k === 'supply') return; L.push('| **' + PR.A[k][0] + '** | ' + nice(PR.A[k][1]).replace(/\|/g, '\\|') + ' |'); });
L.push('', '## How a material gets its property',
  'Named materials use the property that fits them best:',
  '- Mimic, doppelganger, and lycanthrope parts → **Shapeshifting**',
  '- Lich, vampire, death knight, mummy lord, and Undead King parts → **Sovereign of the Dead**',
  '- Other undead parts → **Necromantic**',
  '- Beholder kin → **Eye Ray**. Mind flayer kin → **Mind Blast**. Phoenix → **Rebirth**. Tarrasque and behemoth → **Invulnerable**',
  '- Progenitor remains (Ignis Cinder, Undine Tear, Sylph Breath, Gnome Knuckle) → **Progenitor Piece**. Remains of original gods → **Divine Spark**',
  '- Element words (fire, frost, storm, acid, venom, holy, shadow, psychic, and so on) → the matching elemental property. Dragon parts follow the dragon\'s color.', '',
  'Anything else falls back on its realm, then on its type:', '',
  '| Realm fallback (hides, bones, blood, essences) | Property |', '|---|---|',
  '| Hell, Abyss | Dreadful |', '| Heaven | Holy |', '| Chaos | Chaotic |', '| Inner Realm | Lawful |', '| Outer Realm | Farreaching |', '| Void, Inner Void | Nullifying |', '| Primordial | Divine Spark |', '',
  '| Type fallback | Property |', '|---|---|',
  '| Ore / Metal | Tempered |', '| Wood / Plant | Living |', '| Crystal / Gem | Spell Vessel |', '| Stone | Enduring |', '| Hide / Cloth / Fiber | Supple |', '| Bone / Fang / Horn / Scale | Piercing Edge |', '| Blood / Organ | Lifedrinking |', '| Essence / Soul / Core | Elemental Core |', '| Mechanism | Mechanical |', '| Supply | none |', '',
  'The DM can overrule any assignment that doesn\'t fit.', '',
  '## Related', '- [[FAND/Atrious/Custom Blueprints|Custom Blueprints]]', '- [[FAND/Atrious/Material Index|Material Index]]', '- [[FAND/Atrious/Material Grading|Material Grading]]', '- [[FAND/Atrious/Armor Class|Armor Class]]', '');
fs.writeFileSync('C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND/Atrious/Material Properties.md', L.join('\n'));
console.log('written', Object.keys(PR.A).length - 1, 'properties');
