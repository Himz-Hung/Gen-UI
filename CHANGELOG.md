# Changelog

## 1.0.0 — 2026-09-24

First release.

- `@himz-genui/core`: `t` type system, `defineComponent` / `defineProject` / `defineDomain` / `defineScreen` / `defineFlow`, and the `fw` CLI with five commands: `init`, `add`, `check`, `docs`, `verify`.
- `@himz-genui/rules`: 29 platform-neutral component contracts.
- Checks: spec vs catalog (types, props, bindings, events, actions, composition, reachability), flows vs screens (targets, params, guards), screen code vs `ui/` (imports, raw markup), component code vs contract (static, TypeScript AST).
- Agent rules generated for Claude Code, Cursor, Codex and GitHub Copilot.
- React only. Flutter, behavioural test generation, `defineShell`, `defineSources` and an MCP server are planned.
