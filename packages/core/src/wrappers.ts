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
  hooks_riverpod: ['Consumer', 'HookConsumer', 'HookBuilder', 'ProviderScope'],
  provider: ['Consumer', 'Consumer2', 'Consumer3', 'Selector', 'Selector2', 'ChangeNotifierProvider', 'MultiProvider', 'Provider', 'ProxyProvider'],
  signals: ['Watch'],
  signals_flutter: ['Watch'],
  flutter_hooks: ['HookBuilder'],
  // Flutter forms: the builders pass form state and draw what their builder returns (ReactiveTextField etc. draw
  // inputs themselves, so they are not listed: use a lib/ui input inside a builder)
  reactive_forms: ['ReactiveForm', 'ReactiveFormBuilder', 'ReactiveFormConsumer', 'ReactiveValueListenableBuilder', 'ReactiveFormField', 'ReactiveFormArray', 'ReactiveStatusListenableBuilder'],
  flutter_form_builder: ['FormBuilder', 'FormBuilderField'],
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
  '@reduxjs/toolkit': ['Provider'],
  recoil: ['RecoilRoot'],
  // React data
  '@apollo/client': ['ApolloProvider'],
  apollo: ['ApolloProvider'],
  urql: ['Provider'],
  swr: ['SWRConfig'],
  'react-relay': ['RelayEnvironmentProvider'],
  relay: ['RelayEnvironmentProvider'],
  // React forms. TanStack Form's form.Field / form.Subscribe are members of the form object: ".Field" matches any x.Field.
  '@tanstack/react-form': ['.Field', '.Subscribe'],
  'tanstack-form': ['.Field', '.Subscribe'],
  formik: ['Formik', 'FieldArray'],
  'react-final-form': ['Form', 'FormSpy'],
  // React router: redirects draw nothing (links do: wrap them in ui/Link)
  'react-router': ['Navigate'],
  'react-router-dom': ['Navigate'],
  // React i18n providers (usually in the shell, allowed in screens too)
  i18next: ['I18nextProvider'],
  'react-i18next': ['I18nextProvider'],
  'react-intl': ['IntlProvider'],
  'next-intl': ['NextIntlClientProvider'],
  lingui: ['I18nProvider'],
  '@lingui/react': ['I18nProvider'],
};

/** Names in `stateLibrary` ("bloc", "zustand, react-hook-form, react-router") and `i18nLibrary` that have presets. */
function libraries(config: ProjectConfig): string[] {
  return `${config.stateLibrary ?? ''} ${config.i18nLibrary ?? ''}`.toLowerCase().split(/[\s,+&|;]+|\band\b/).map((s) => s.trim()).filter(Boolean);
}

/** Every wrapper name a screen may use in this project. */
export function screenWrappers(config: ProjectConfig): string[] {
  const out = new Set<string>(config.screenWrappers ?? []);
  for (const lib of libraries(config)) for (const w of WRAPPER_PRESETS[lib] ?? []) out.add(w);
  return [...out];
}
