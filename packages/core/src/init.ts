import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { DIRS } from './loader.ts';

const here = dirname(fileURLToPath(import.meta.url));

/** Locate the shipped contracts folder: resolve @himz-genui/rules from the consumer project first, then from this repo. */
function shippedRulesDir(root: string): string {
  const candidates: string[] = [];
  try {
    const req = createRequire(join(root, 'package.json'));
    candidates.push(join(dirname(req.resolve('@himz-genui/rules/package.json')), 'src'));
  } catch { /* not installed in consumer */ }
  candidates.push(join(here, '..', '..', 'rules', 'src'));
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('Cannot find @himz-genui/rules — install it next to @himz-genui/core');
  return found;
}

export interface InitOptions { agent: 'claude' | 'cursor' | 'codex' | 'copilot'; platform: 'react' | 'flutter'; create?: 'vite' | 'next' | 'flutter'; name?: string }

export function init(root: string, o: InitOptions): string[] {
  const made: string[] = [];
  if (o.create) {
    const cmd = o.create === 'vite' ? ['npm', 'create', 'vite@latest', '.', '--', '--template', 'react-ts']
      : o.create === 'next' ? ['npx', 'create-next-app@latest', '.', '--ts', '--no-eslint', '--app', '--src-dir', '--use-npm']
      : ['flutter', 'create', '.'];
    console.log(`[fw] scaffolding with: ${cmd.join(' ')}`);
    const res = spawnSync(cmd[0], cmd.slice(1), { cwd: root, stdio: 'inherit' });
    if (res.status !== 0) throw new Error('scaffold command failed');
  }
  const specDir = join(root, DIRS.spec);
  const w = (rel: string, content: string) => {
    const p = join(root, rel);
    if (existsSync(p)) return;
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    made.push(rel);
  };

  // shipped contracts → ui-rules/ (copied so the agent can read them and diffs show on upgrade)
  const rulesDst = join(root, DIRS.rules);
  if (!existsSync(rulesDst)) {
    mkdirSync(rulesDst, { recursive: true });
    const src = shippedRulesDir(root);
    for (const f of readdirSync(src).filter((f) => f.endsWith('.rule.ts'))) cpSync(join(src, f), join(rulesDst, f));
    made.push(`${DIRS.rules}/ (${readdirSync(rulesDst).length} contracts)`);
  }
  mkdirSync(join(root, DIRS.ui), { recursive: true });
  mkdirSync(join(root, DIRS.screens), { recursive: true });
  mkdirSync(join(specDir, 'components'), { recursive: true });

  w(`${DIRS.spec}/project.ts`, `import { defineProject } from '@himz-genui/core';

export default defineProject({
  name: '${o.name ?? 'My App'}',
  platforms: ['${o.platform}'],
  agent: '${o.agent}',
  tokens: {
    color: { primary: '#2563EB', secondary: '#64748B', danger: '#DC2626', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  guards: [],
  // Several languages? List them (the first is the default), add ui-spec/strings/<lang>.ts per language,
  // and say how code translates: languages: ['en', 'vi'], i18nLibrary: 'i18next',
});
`);
  w(`${DIRS.spec}/app.ts`, `import { defineApp } from '@himz-genui/core';

// The outline: every screen and every component this app uses, by name. Write it first.
// Screen details go in ui-spec/screens/<name>.ts; flows, specs and screen code may only use names listed here.
export default defineApp({
  name: '${o.name ?? 'My App'}',
  screens: {
    Home: 'TODO: one line on what this screen is for',
  },
  components: ['Container', 'Stack', 'TopBar', 'Heading', 'Text', 'Button'],
});
`);
  w(`${DIRS.spec}/domain.ts`, `import { defineDomain, t } from '@himz-genui/core';

// Business types the screens receive. Referenced by name in screen data, e.g. "Card[]".
export default defineDomain({
  Example: t.object({ id: t.string(), name: t.string() }),
});
`);
  w(`${DIRS.spec}/screens/home.ts`, `import { defineScreen } from '@himz-genui/core';

// One file per screen. The file name is the screen name (card-detail.ts → CardDetail),
// the purpose is in ui-spec/app.ts. Not sure what to write? Ask your agent to draft it.
export default defineScreen({
  // What does the user see here?
  shows: ['TODO: e.g. "Top bar with the app name", "List of items: name, price"'],

  // What can the user do here that does NOT change screen? action name → what it does
  local: {},

  // Special cases: situation → what the screen does. e.g. empty: 'Say there is nothing yet'
  when: {},

  // Which data does the screen receive? name → type from domain.ts, e.g. { items: 'Example[]' }
  data: {},

  // Where can the user go from here, and how? target screen → what the user does
  // e.g. { Detail: 'tap an item', Home: { how: 'press Done', replace: true } }
  goTo: {},

  // back: omit = back to the previous screen · false = no back · 'Home' = fallback when there is none
  // params: what this screen receives when opened, e.g. { itemId: 'string' }
  // guard: a guard name from project.ts that must pass to open this screen
});
`);
  w(`${DIRS.ui}/README.md`, `# ui/

Materialized components live here, one file per contract (\`Button.tsx\`, \`Card.tsx\`…).
Written once by the agent from \`fw docs <Name>\`, verified with \`fw verify <Name>\`, then reused by every screen.
Never write components anywhere else.
`);
  return made;
}
