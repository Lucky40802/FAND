// Edit the hidden class list without ever committing it in plain text.
//   FAND_HIDDEN_CODE=<passphrase> node generators/hidden-tool.js export <file outside the repo>   decrypt to an editable JSON file
//   FAND_HIDDEN_CODE=<passphrase> node generators/hidden-tool.js import <file>                    encrypt it back into data/hidden-lock.json
//   FAND_HIDDEN_CODE=<old> FAND_NEW_CODE=<new> node generators/hidden-tool.js rekey               change the passphrase
// Then rebuild the site (node generators/buildapp.js go). Never put the exported file or the passphrase in the repository.
var fs = require('fs'), path = require('path'), H = require('./hidden-lock.js');
var FILE = path.join(__dirname, '..', 'data', 'hidden-lock.json'), cmd = process.argv[2], arg = process.argv[3], code = process.env.FAND_HIDDEN_CODE;
if (!code) { console.error('Set FAND_HIDDEN_CODE to the passphrase.'); process.exit(1); }
var REPO = path.resolve(__dirname, '..', '..');
if (cmd === 'export') {
  if (!arg) { console.error('Give a file to write.'); process.exit(1); }
  if (path.resolve(arg).indexOf(REPO + path.sep) === 0) { console.error('Refusing to write the plain list inside the repository.'); process.exit(1); }
  fs.writeFileSync(arg, JSON.stringify(H.unlock(JSON.parse(fs.readFileSync(FILE, 'utf8')), code), null, 1));
  console.log('Exported to ' + arg);
} else if (cmd === 'import') {
  var cls = JSON.parse(fs.readFileSync(arg, 'utf8'));
  fs.writeFileSync(FILE, JSON.stringify(H.lock(cls, code), null, 1) + '\n');
  console.log('Locked ' + cls.length + ' classes into data/hidden-lock.json');
} else if (cmd === 'rekey') {
  var nc = process.env.FAND_NEW_CODE; if (!nc) { console.error('Set FAND_NEW_CODE.'); process.exit(1); }
  fs.writeFileSync(FILE, JSON.stringify(H.lock(H.unlock(JSON.parse(fs.readFileSync(FILE, 'utf8')), code), nc), null, 1) + '\n');
  console.log('Passphrase changed.');
} else { console.error('Use export, import, or rekey.'); process.exit(1); }
