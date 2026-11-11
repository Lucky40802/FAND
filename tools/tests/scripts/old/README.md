# Retired test scripts

These were written against earlier versions of the site: they call functions that have since been renamed or removed
(for example `defenseOf`, `PROC`) or expect pages to load the way they did before the multi-page split. They are kept
for reference and are not run by `node tools/tests/run.js`. To bring one back, update it to the current code and move it
up to `tools/tests/scripts/`.
