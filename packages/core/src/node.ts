// Node-only library surface (what the CLI is built from). Import as '@genui/core/node'.
export * from './index.ts';
export { checkSpec } from './check.ts';
export { checkFlows } from './flowcheck.ts';
export { checkCode } from './codecheck.ts';
export { verifyReact } from './verify.ts';
export { renderDocs } from './docs.ts';
export { buildCatalog, writeCatalog } from './catalog.ts';
export { baseRules, writeRules } from './rules.ts';
export { loadProject, findRoot, readCatalog, readSpec, listSpecs } from './loader.ts';
