#!/usr/bin/env node
// The CLI is prebuilt JavaScript (dist/). tsx is registered in-process only so that the project's own
// TypeScript files (ui-spec/, ui-rules/) can be imported, whether or not its package.json has "type": "module".
import { register as registerEsm } from 'tsx/esm/api';
import { register as registerCjs } from 'tsx/cjs/api';
registerEsm();
registerCjs();
await import('../dist/cli.js');
