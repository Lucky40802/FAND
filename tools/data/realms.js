var T = {
  Hu: ['Human', 1, 'Mortal Realm'], My: ['Mysterious', 2, 'Mysterious Realm'], He: ['Hell', 3, 'Hell'], Hv: ['Heaven', 3, 'Heaven'],
  Ch: ['Chaos', 4, 'Chaos Realm'], Ab: ['Abyss', 5, 'Abyss'], In: ['Inner Realm', 6, 'Inner Realm'], Ou: ['Outer Realm', 7, 'Outer Realm'],
  Vo: ['Void', 8, 'Void'], IV: ['Inner Void', 9, 'Inner Void'], Pr: ['Primordial', 10, 'Primordial Realm']
};
var TYPES = { O: 'Ore / Metal', W: 'Wood / Plant', G: 'Crystal / Gem', S: 'Stone', F: 'Hide / Cloth / Fiber', B: 'Bone / Fang / Horn / Scale', L: 'Blood / Organ', E: 'Essence / Soul / Core', K: 'Mechanism', U: 'Supply' };
module.exports = {
  T: T, TYPES: TYPES, order: ['Hu', 'My', 'He', 'Hv', 'Ch', 'Ab', 'In', 'Ou', 'Vo', 'IV', 'Pr'],
  name: function (c) { return T[c][0]; }, tier: function (c) { return T[c][1]; }, page: function (c) { return T[c][2]; },
  rank: function (c, g) { return (T[c][1] - 1) * 10 + g; },
  level: function (c, g) { return Math.ceil(((T[c][1] - 1) * 10 + g) / 2); }
};
