// The offline worker reuses the files the first page just downloaded (versioned, so they never change) instead of fetching
// them a second time; unversioned pages are still fetched fresh.
module.exports = [
  { name: 'first visit: the offline worker does not download the data a second time', run: async t => {
    const sw = require('fs').readFileSync(require('path').join(__dirname, '..', '..', '..', 'site', 'sw.js'), 'utf8');
    t.ok(/cache:\/\[\?&\]v=\/\.test\(f\)\?"force-cache":"reload"/.test(sw), 'versioned files use the copy already downloaded; pages are fetched fresh');
    t.ok(/"data\/core\.js\?v=/.test(sw) && /"app\.js\?v=/.test(sw), 'and the data and app are versioned');
  } },
];
