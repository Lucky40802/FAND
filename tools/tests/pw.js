// Playwright for the test scripts: the local install, or the global one (same lookup as run.js)
let pw;
try { pw = require('playwright'); } catch (e) {
  try { pw = require(require('child_process').execFileSync('npm', ['root', '-g']).toString().trim() + '/playwright'); }
  catch (e2) { try { pw = require('/opt/node-tools/node_modules/playwright'); } catch (e3) { console.error('Playwright is not installed. Run: npm install -g playwright && npx playwright install chromium'); process.exit(2); } }
}
module.exports = pw;
