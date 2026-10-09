// Locks and unlocks the hidden class list (AES-256-GCM, key from the passphrase by PBKDF2-SHA256).
// The same format is decrypted in the browser by the Hidden classes page (hcUnlock in app/template.html).
var crypto = require('crypto');
var ROUNDS = 1000000;
function lock(classes, code) {
  var plain = Buffer.from(JSON.stringify(classes), 'utf8'), salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  var key = crypto.pbkdf2Sync(code, salt, ROUNDS, 32, 'sha256');
  var c = crypto.createCipheriv('aes-256-gcm', key, iv), enc = Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]);
  var counts = {}, byTower = {};
  classes.forEach(function (x) { counts[x.tier] = (counts[x.tier] || 0) + 1; byTower[x.tower] = (byTower[x.tower] || 0) + 1; });
  return { counts: counts, byTower: byTower, lock: { salt: salt.toString('base64'), iv: iv.toString('base64'), data: enc.toString('base64'), it: ROUNDS } };
}
function unlock(file, code) {
  var L = file.lock, salt = Buffer.from(L.salt, 'base64'), iv = Buffer.from(L.iv, 'base64'), data = Buffer.from(L.data, 'base64');
  var key = crypto.pbkdf2Sync(code, salt, L.it, 32, 'sha256'), d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(data.slice(data.length - 16));
  return JSON.parse(Buffer.concat([d.update(data.slice(0, data.length - 16)), d.final()]).toString('utf8'));
}
module.exports = { lock: lock, unlock: unlock, ROUNDS: ROUNDS };
