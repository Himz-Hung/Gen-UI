#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Run the CLI through tsx's own CLI, resolved relative to THIS package. This works from any cwd,
// with symlinked (file:) installs, and regardless of whether the consumer's package.json has "type": "module".
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const tsxCli = require.resolve('tsx/cli');
const cli = join(here, '..', 'src', 'cli.ts');
const r = spawnSync(process.execPath, [tsxCli, cli, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
