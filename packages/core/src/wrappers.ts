// Screen wrappers: widgets / components of state and form libraries that only pass state down and draw
// nothing themselves (BlocBuilder, Obx, <FormProvider>…). A screen may use them; everything they render
// is still checked as screen code, so the UI inside must come from ui/ (React) or lib/ui/ (Flutter).
import type { ProjectConfig } from './define.ts';

/** Known libraries → their non-visual wrappers. Components that draw inputs themselves (Formik's Field) are deliberately absent. */
export const WRAPPER_PRESETS: Record<string, string[]> = {
  // Flutter
  bloc: ['BlocBuilder', 'BlocListener', 'BlocConsumer', 'BlocSelector', 'BlocProvider', 'MultiBlocProvider', 'RepositoryProvider', 'MultiBlocListener'],
  flutter_bloc: ['BlocBuilder', 'BlocListener', 'BlocConsumer', 'BlocSelector', 'BlocProvider', 'MultiBlocProvider', 'RepositoryProvider', 'MultiBlocListener'],
  getx: ['Obx', 'GetBuilder', 'GetX'],
  get: ['Obx', 'GetBuilder', 'GetX'],
  mobx: ['Observer'],
  flutter_mobx: ['Observer'],
  riverpod: ['Consumer', 'ProviderScope'],
  flutter_riverpod: ['Consumer', 'ProviderScope'],
  hooks_riverpod: ['Consumer', 'HookConsumer', 'ProviderScope'],
  provider: ['Consumer', 'Selector', 'ChangeNotifierProvider', 'MultiProvider'],
  signals: ['Watch'],
  // React
  'react-hook-form': ['FormProvider', 'Controller'],
  redux: ['Provider'],
  'react-redux': ['Provider'],
  jotai: ['Provider'],
  mobx_react: ['Observer'],
  'mobx-react': ['Observer'],
  'mobx-react-lite': ['Observer'],
  '@tanstack/react-query': ['QueryClientProvider'],
  'react-query': ['QueryClientProvider'],
};

/** Names in `stateLibrary` ("bloc", "zustand, react-hook-form", "riverpod + formz") that have presets. */
function libraries(config: ProjectConfig): string[] {
  return (config.stateLibrary ?? '').toLowerCase().split(/[\s,+&|;]+|\band\b/).map((s) => s.trim()).filter(Boolean);
}

/** Every wrapper name a screen may use in this project. */
export function screenWrappers(config: ProjectConfig): string[] {
  const out = new Set<string>(config.screenWrappers ?? []);
  for (const lib of libraries(config)) for (const w of WRAPPER_PRESETS[lib] ?? []) out.add(w);
  return [...out];
}
