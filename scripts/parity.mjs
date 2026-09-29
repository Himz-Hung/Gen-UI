// Keeps examples/gallery-react and examples/gallery-flutter in sync:
//  - the same ui-spec (outline, domain, screen descriptions) and the same screen specs,
//  - every shipped contract materialized on both platforms (per each project's ui.catalog.json),
//  - every contract exercised by at least one test on both platforms.
// Run after `fw check` in both galleries (it refreshes the catalogs). Exit 1 on any difference.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const R = join(root, 'examples/gallery-react'), F = join(root, 'examples/gallery-flutter');
const problems = [];
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

for (const rel of ['ui-spec/app.ts', 'ui-spec/domain.ts', 'ui-spec/screens', 'screens']) {
  const a = join(R, rel), b = join(F, rel);
  const files = existsSync(a) && !rel.endsWith('.ts') ? [...new Set([...readdirSync(a), ...(existsSync(b) ? readdirSync(b) : [])])].map((f) => join(rel, f)) : [rel];
  for (const f of files) if (read(join(R, f)) !== read(join(F, f))) problems.push(`${f} differs between the React and Flutter galleries`);
}

const contracts = readdirSync(join(root, 'packages/rules/src')).filter((f) => f.endsWith('.rule.ts')).map((f) => f.slice(0, -8)).sort();
const catalog = (dir) => JSON.parse(read(join(dir, 'ui.catalog.json')) ?? '{"components":{}}').components;
const rc = catalog(R), fc = catalog(F);
const snake = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const tests = (dir, ext) => (existsSync(join(dir, 'test')) ? readdirSync(join(dir, 'test')).filter((f) => f.endsWith(ext)).map((f) => read(join(dir, 'test', f))).join('\n') : '');
const rt = tests(R, '.tsx'), ft = tests(F, '.dart');

const rows = [];
for (const c of contracts) {
  const react = !!rc[c]?.impl?.react, flutter = !!fc[c]?.impl?.flutter;
  const rTest = new RegExp(`<${c}[\\s/>]`).test(rt), fTest = new RegExp(`\\bUi${c}\\(`).test(ft);
  if (!react) problems.push(`${c}: no verified React implementation (ui/${c}.tsx)`);
  if (!flutter) problems.push(`${c}: no verified Flutter implementation (lib/ui/${snake(c)}.dart)`);
  if (!rTest) problems.push(`${c}: no React test renders <${c}>`);
  if (!fTest) problems.push(`${c}: no Flutter test builds Ui${c}(…)`);
  rows.push([c, react, flutter, rTest, fTest]);
}

const ok = (b) => (b ? 'yes' : 'NO ');
console.log(`contract                 react  flutter  react-test  flutter-test`);
for (const [c, a, b, d, e] of rows) if (!(a && b && d && e)) console.log(`${c.padEnd(24)} ${ok(a)}    ${ok(b)}      ${ok(d)}         ${ok(e)}`);
console.log(`${contracts.length} contracts: ${rows.filter((r) => r.slice(1).every(Boolean)).length} in sync on both platforms`);
if (problems.length) { console.log(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log('parity OK');
