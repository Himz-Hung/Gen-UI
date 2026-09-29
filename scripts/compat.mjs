// Compatibility fixtures: screens written against popular libraries (state, data, forms, router, i18n, UI kits).
// Each screen file starts with `// expect: pass` or one `// expect: <text>` line per error fw check must report.
// Files under a freeformDirs folder must not be reported at all. Libraries are not installed: fw check is static.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const fw = join(repo, 'packages/core/bin/fw.js');
let failed = 0, passed = 0;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
}

const only = process.argv[2];
for (const platform of readdirSync(join(repo, 'tests/compat')).filter((d) => statSync(join(repo, 'tests/compat', d)).isDirectory() && (!only || d === only || d.startsWith(`${only}-`)))) {
  const root = join(repo, 'tests/compat', platform);
  // contracts come from the shipped rules, copied fresh (git-ignored) so the fixture never drifts
  mkdirSync(join(root, 'ui-rules'), { recursive: true });
  for (const f of readdirSync(join(repo, 'packages/rules/src')).filter((f) => f.endsWith('.rule.ts'))) cpSync(join(repo, 'packages/rules/src', f), join(root, 'ui-rules', f));
  // Flutter: the screen check reads package sources through .dart_tool/package_config.json
  if (existsSync(join(root, 'pubspec.yaml')) && !existsSync(join(root, '.dart_tool', 'package_config.json'))) {
    const got = spawnSync('flutter', ['pub', 'get'], { cwd: root, encoding: 'utf8' });
    if (got.status !== 0) { console.log(`skip  ${platform}: flutter pub get failed (${(got.error?.message ?? got.stderr).trim().split('\n').pop()})`); continue; }
  }
  const screens = walk(root).filter((f) => !f.includes('/.dart_tool/') && /\.(tsx|dart)$/.test(f) && /^\/\/ expect: /m.test(readFileSync(f, 'utf8')));
  for (const file of screens) {
    const rel = relative(root, file);
    const expects = [...readFileSync(file, 'utf8').matchAll(/^\/\/ expect: (.+)$/gm)].map((m) => m[1].trim());
    const out = spawnSync(process.execPath, [fw, 'check', rel], { cwd: root, encoding: 'utf8' }).stdout;
    const errors = out.split('\n').filter((l) => l.startsWith('error')).length;
    const problems = [];
    if (expects[0] === 'pass') { if (errors) problems.push(`expected pass, got ${errors} error(s):\n${out.split('\n').filter((l) => /^error|^ {7}/.test(l)).join('\n')}`); }
    else {
      for (const e of expects) if (!out.includes(e)) problems.push(`missing error: ${e}`);
      if (errors !== expects.length) problems.push(`expected ${expects.length} error(s), got ${errors}:\n${out}`);
    }
    if (problems.length) { failed++; console.log(`FAIL  ${platform}/${rel}\n  ${problems.join('\n  ')}`); } else { passed++; console.log(`ok    ${platform}/${rel}`); }
  }
  // freeformDirs: a full fw check never mentions those files
  const full = spawnSync(process.execPath, [fw, 'check'], { cwd: root, encoding: 'utf8' }).stdout;
  const free = walk(root).filter((f) => !f.includes('/.dart_tool/') && /^\/\/ freeform/m.test(existsSync(f) ? readFileSync(f, 'utf8') : ''));
  for (const f of free) {
    const rel = relative(root, f);
    if (full.includes(rel)) { failed++; console.log(`FAIL  ${platform}/${rel}: freeform file reported by fw check`); } else { passed++; console.log(`ok    ${platform}/${rel} (freeform, not reported)`); }
  }
}
console.log(`compat: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
