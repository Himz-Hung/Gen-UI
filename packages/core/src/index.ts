// Public, browser-safe surface. Contracts and ui-spec files import from here, and ui/tokens.ts pulls
// project.ts into the app bundle, so nothing Node-only may be exported from this file.
export { t, typeText, parseTypeString, sameType, checkLiteral } from './types.ts';
export type { TypeNode } from './types.ts';
export { defineComponent, defineProject, defineDomain, defineScreen, defineFlow, defineApp, defineStrings, isScreenDetail } from './define.ts';
export type { Strings, AppOutline, ComponentContract, ProjectConfig, DomainTypes, ScreenDescription, ScreenDetail, LegacyScreenDescription, GoTo, FlowConfig, ScreenSpec, SpecElement, Catalog, CatalogEntry, Check, CheckKind, CheckProps, CheckSize, CheckActivation, CheckRole, CheckKey } from './define.ts';
export { cssVariables, tailwindPreset, muiTheme } from './themes.ts';
export { normalizeTokens, resolveTheme, modeAxes, modeCombos, defaultMode, modeLabel, contrastRatio, contrastPairs, themeProblems, isLegacyTokens, toDesignTokens, fromDesignTokens } from './theme.ts';
export type { ThemeTokens, LegacyTokens, ProjectTokens, SemanticTokens, TokenOverrides, ResolvedTheme, ModeSelection, ModeAxis, Palette, ThemeProblem } from './theme.ts';
