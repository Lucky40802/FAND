var fs = require('fs');
var V = 'C:/Users/Lakshan Jagadeishan/OneDrive/FAND/FAND';
// franchise / trademarked names the content policy says to purge (official D&D monster names are allowed)
var TERMS = ['Bigby', 'Mordenkainen', 'Tasha\'s Hideous', 'Tiamat', 'Bahamut', 'Lolth', 'Vecna', 'Orcus', 'Demogorgon', 'Asmodeus', 'Mephistopheles', 'Baphomet', 'Juiblex', 'Graz\'zt', 'Yeenoghu', 'Zuggtmoy', 'Fraz-Urb', 'Kostchtchie', 'Pazuzu', 'Dispater', 'Levistus', 'Glasya', 'Baalzebul', 'Zariel', 'Tharizdun', 'Gruumsh', 'Moradin', 'Corellon', 'Raven Queen', 'Lathander', 'Elminster', 'Drizzt', 'Strahd', 'Acererak', 'Faerûn', 'Faerun', 'Forgotten Realms', 'Waterdeep', 'Neverwinter', 'Greyhawk', 'Krynn', 'Evard', 'Otiluke', 'Melf', 'Leomund', 'Rary', 'Tenser', 'Drawmij', 'Nystul', 'Kyuss', 'Imix', 'Ogremoch', 'Olhydra', 'Yan-C-Bin',
  'Sauron', 'Gandalf', 'Mordor', 'Balrog', 'Mithril', 'Rivendell', 'Valyrian', 'Westeros', 'Lannister', 'Targaryen', 'Dothraki', 'Hylian', 'Triforce', 'Master Sword', 'Hyrule', 'Chocobo', 'Buster Sword', 'Materiab', 'Geralt', 'Daedric', 'Dwemer', 'Adeptus', 'Vibranium', 'Adamantium', 'Estus', 'Pokémon', 'Pokemon', 'Guts of Berserk', 'Ghaunadaur', 'Hyrsam', 'Frozen Sighs', 'Lightsaber', 'Jedi', 'Sith', 'Hogwarts', 'Horcrux', 'Frostmourne', 'Ashbringer', 'Keyblade'];
var re = new RegExp('\\b(' + TERMS.map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
var hits = {};
function walk(d) {
  fs.readdirSync(d).forEach(function (f) {
    var p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) return walk(p);
    if (!/\.(md|base)$/.test(f)) return;
    var t = fs.readFileSync(p, 'utf8'), m;
    re.lastIndex = 0;
    while ((m = re.exec(t))) {
      var line = t.slice(t.lastIndexOf('\n', m.index) + 1, t.indexOf('\n', m.index)).slice(0, 160);
      (hits[m[1]] = hits[m[1]] || []).push(p.replace(V + '/', '') + ' :: ' + line);
    }
  });
}
walk(V);
var ht = fs.readFileSync(V + '/Atrious/FAND.html', 'utf8'), hh = {}, m2; re.lastIndex = 0;
while ((m2 = re.exec(ht))) { hh[m2[1]] = (hh[m2[1]] || 0) + 1; }
Object.keys(hits).forEach(function (k) { console.log('## ' + k + ' (' + hits[k].length + ')'); hits[k].slice(0, 6).forEach(function (h) { console.log('   ' + h); }); });
console.log('FAND.html hits:', JSON.stringify(hh));
