# Kế hoạch tương thích package (web trước, rồi Flutter)

Ngày viết: 2026-09-29. Người dùng chốt thứ tự: **nâng web từ Khá / Trung bình lên Tốt trước, rồi mới làm Flutter.**
Đọc cùng `docs/PLAN-1.3-1.4.md` (1.3.0 đã xong code, chưa publish).

---

## 1. Nguyên tắc (điều quyết định mức tương thích)

Framework chỉ ép 3 chỗ: (1) trong `ui/` / `lib/ui/` viết gì cũng được miễn đúng contract; (2) màn hình chỉ ghép từ
`ui/` hoặc component đã đăng ký (`fw add`), không viết thẳng HTML / widget, không viết cứng chữ khi nhiều ngôn ngữ;
(3) shell (router, store, main) viết tay, không kiểm.

- **Web:** hook / hàm tự do; chỉ **thẻ JSX lấy từ ngoài `ui/`** bị chặn (xác định theo import). Wrapper không vẽ gì
  (Provider, Controller…) được phép qua preset `stateLibrary` hoặc `screenWrappers`.
- **Flutter hiện tại:** chặn **mọi** `X(` và `X.y(` không phải `Ui…` / class của app, không biết X có phải widget
  không → báo nhầm `.of(context)`, `Get.to`, `AppLocalizations.of`. Đây là gốc của phần lớn lỗi tương thích Flutter.

## 2. Đánh giá hiện tại (1.3.0)

Ký hiệu: ✅ chạy ngay · 🟡 chạy được nếu theo cách làm nhất định · ❌ xung đột. Chưa thử trong project thật, trừ
MUI, shadcn (đã thử `fw add`) và các probe Flutter ở mục 2.2.

### 2.1 Web (React)

| Nhóm | Package | Mức | Ghi chú |
|---|---|---|---|
| UI | Tailwind, CSS Modules, styled-components, Emotion | ✅ | trong `ui/`. **Lỗ hổng:** màn hình truyền `className` / `style` vào component mà không bị kiểm |
| | MUI, Ant Design, Chakra, Mantine | 🟡 | bọc trong `ui/` hoặc `fw add`; import thẳng trong màn hình bị chặn; theme trùng nguồn với tokens |
| | shadcn/ui, Radix, Headless UI | 🟡 | `fw add` đọc được (đã thử) |
| State | Zustand, Redux hooks, Jotai, Recoil, Valtio, XState, MobX `observer()` | ✅ | hook |
| | react-redux / jotai `Provider`, mobx-react `Observer`, `QueryClientProvider` | ✅ | có preset |
| Data | TanStack Query, SWR, Apollo / urql hooks, RTK Query | ✅ / 🟡 | hook chạy ngay; `ApolloProvider`, urql `Provider`, `SWRConfig` chưa có preset |
| | loading / error | 🟡 | `defineSources` chưa làm |
| Router | React Router, TanStack Router | ✅ | router ở shell; `<Navigate>` trong màn hình chưa có preset |
| | Next.js App Router | 🟡 | `page.tsx` render Screen; `layout.tsx` để `freeformDirs`; chưa có hướng dẫn |
| | `next/link`, router `<Link>` trong màn hình | 🟡 | phải bọc trong `ui/Link.tsx` |
| | Expo Router / React Native | ❌ | chưa hỗ trợ nền tảng |
| Form | react-hook-form `Controller` / `FormProvider` | ✅ | preset |
| | react-hook-form `{...register()}` | 🟡 | rải prop DOM, không khớp `value` / `onChange(string)` → dùng `Controller` |
| | Formik `<Field>` | 🟡 | tự vẽ input; dùng `useFormik` hoặc bọc trong `ui/` |
| | TanStack Form `form.Field` | ❌ | thẻ `form.Field` bắt đầu bằng chữ thường → bị coi là HTML thô |
| | Zod, Yup, Valibot | ✅ | logic |
| i18n | i18next, react-intl, next-intl, Lingui | ✅ / 🟡 | hàm dịch chạy ngay; provider chưa có preset |

Tổng: State **Tốt** · Router **Khá** · Form **Khá** · UI **Trung bình** · i18n **Khá**.

### 2.2 Flutter (probe thật trên bản copy gallery-flutter)

| Cách gọi trong màn hình | Kết quả | |
|---|---|---|
| `context.go()`, `context.read<>()`, `ref.watch()`, `BlocBuilder`, `Consumer`, `GetIt.I<>()`, `'key'.tr()` | ✅ | |
| `MediaQuery.of`, `Navigator.of`, `GoRouter.of`, `ScaffoldMessenger.of`, `AppLocalizations.of`, `Get.toNamed` | ❌ | **báo nhầm** |
| `Theme.of` | ❌ | tranh cãi (style nên ở `lib/ui`) |
| `CartRoute()` (auto_route) | ❌ trong probe | chưa chắc với `*.gr.dart` thật |

| Nhóm | Mức | Điểm yếu |
|---|---|---|
| State | Tốt (trừ GetX: `Get.to` / `Get.find` báo nhầm) | |
| Router | **Kém** | `Navigator.of` / `GoRouter.of` báo nhầm |
| Form | Hạn chế | chưa có preset reactive_forms / flutter_form_builder |
| i18n | **Kém** | ARB `AppLocalizations.of` báo nhầm; `UiStrings` trùng nguồn với ARB |
| UI | Tốt | Material nằm gọn trong `lib/ui` |
| Cấu trúc | khác thói quen | app Flutter hay "mỗi màn một Scaffold"; framework để Scaffold ở shell |

---

## 3. Kế hoạch WEB (làm trước) — mục tiêu: mọi nhóm đạt Tốt

| # | Hạng mục | Sẽ làm | Nhóm lên |
|---|---|---|---|
| W1 | Chặn prop ngoài contract trong màn hình | `fw check` màn hình: prop truyền cho component `ui/` / đã đăng ký phải có trong contract (hoặc là handler của event, `key`). Bắt `className`, `style`, `sx`… | UI |
| W2 | Token cho thư viện UI | hàm browser-safe trong `@himz-genui/core`: `cssVariables(project)`, `tailwindPreset(project)`, `muiTheme(project)` (theme options); người dùng import `ui-spec/project.ts` trong `tailwind.config.ts` / `theme.ts` → một nguồn | UI |
| W3 | Preset mới | router: react-router `Navigate`; form: TanStack Form (`form.Field`, `form.Subscribe`, thẻ có dấu chấm), Formik (`Formik`, `FieldArray`), react-final-form (`Form`, `FormSpy`); data: `ApolloProvider`, urql `Provider`, `SWRConfig`; i18n: `I18nextProvider`, `IntlProvider`, `NextIntlClientProvider`, Lingui `I18nProvider` | Router, Form, i18n, Data |
| W4 | Thẻ có dấu chấm | `codecheck`: `form.Field` (biến cục bộ + thành viên) không bị coi là HTML thô khi có trong wrapper | Form |
| W5 | Bộ test tương thích web | fixture màn hình cho từng package (mong đợi pass / lỗi), chạy trong `npm test` | tất cả |
| W6 | Tài liệu tích hợp web | README mục "Integrations": công thức từng package; Next.js App Router (`page.tsx` → Screen, `layout.tsx` ở `freeformDirs`, `ui/Link` bọc `next/link`); react-hook-form `Controller` thay `register` | Router, Form |

Ước lượng: ~20–30M token.

## 4. Kế hoạch FLUTTER (làm sau web)

| # | Hạng mục | Sẽ làm | Token |
|---|---|---|---|
| A | Luật màn hình dựa trên import | đọc import, tìm file package qua `.dart_tool/package_config.json`, xác định class nào là widget (kể cả gián tiếp); chỉ chặn **tạo widget** từ ngoài `lib/ui` / đã đăng ký. `.of()`, `Get.to`, route sinh ra… tự do | 15–25M |
| B | Preset state / form | flutter_hooks `HookBuilder`, hooks_riverpod `HookConsumer`, reactive_forms (`ReactiveForm`, `ReactiveFormConsumer`, `ReactiveValueListenableBuilder`), flutter_form_builder (`FormBuilder`, `FormBuilderField`); màn hình kế thừa `ConsumerWidget` / `HookWidget` / `HookConsumerWidget` | 3–5M |
| C | i18n ARB | `i18nLibrary: 'flutter_localizations' / 'intl'` → sinh `lib/l10n/app_<lang>.arb` từ `ui-spec/strings`, dùng `AppLocalizations`; giữ `UiStrings` cho project không dùng ARB | 8–12M |
| D | Theme từ tokens | sinh `lib/ui/theme.g.dart` (`ThemeData` từ tokens) | 4–6M |
| F | Bộ test tương thích Flutter | probe màn hình cho từng package, chạy trong `test:flutter` | 3–5M |
| G | Tài liệu Flutter | go_router `ShellRoute` + Scaffold ở shell, auto_route, GetX, ARB | 2–3M |

Còn khác biệt chủ đích sau khi làm: màn hình Flutter không tự dựng `Scaffold` (cần `defineShell`, để sau).

## 5. Phát hành

Chưa chốt: gộp vào 1.3.0 hay 1.4.0. Đề xuất đã nêu: publish 1.3.0 như hiện tại, phần này thành 1.4.0.

## 6. Trạng thái

- [x] W1 · [x] W2 · [x] W3 · [x] W4 · [x] W5 · [x] W6 (2026-09-29, chưa commit)
- [x] A · [x] B · [x] C · [x] D · [x] F · [x] G (2026-09-29, chưa commit)

### Flutter sau A–G

| Nhóm | Trước | Sau | Nhờ |
|---|---|---|---|
| State | Tốt (trừ GetX) | Tốt | `Get.find` / `Get.toNamed` tự do; preset flutter_hooks, hooks_riverpod; màn kế thừa `ConsumerWidget` / `HookConsumerWidget` |
| Router | Kém | Tốt | `Navigator.of`, `GoRouter.of`, `context.router.push(CartRoute())` tự do; chỉ `Navigator(…)` (tạo widget) bị chặn |
| Form | Hạn chế | Tốt | preset reactive_forms, flutter_form_builder; công thức builder + `UiInput` |
| i18n | Kém | Tốt | ARB sinh từ `ui-spec/strings`, `AppLocalizations.of` tự do, `flutter gen-l10n` chạy được (đã thử) |
| UI / theme | Tốt | Tốt | `theme.g.dart` (`uiTheme()`), gallery shell dùng nó |

Code: `dartindex.ts` (mới: đọc thư viện qua package_config, widget hay không, tên constructor), `dartcheck.ts`
(luật theo import, `show` bắt buộc với thư viện Flutter), `wrappers.ts`, `flutter.ts` (`arbFile`, `usesArb`,
`themeDart`), `i18ncheck.ts`, `rules.ts`, `cli.ts`. Test: `tests/compat/flutter` 13 màn với package thật +
`tests/compat/flutter-l10n` 2 màn = 15/15 trong `npm run test:flutter`. Còn chủ đích: màn Flutter không tự dựng
`Scaffold` (cần `defineShell`).

### Web sau W1–W6

| Nhóm | Trước | Sau | Nhờ |
|---|---|---|---|
| State | Tốt | Tốt | + preset recoil, @reduxjs/toolkit |
| Data | Khá | Tốt | preset Apollo, urql, SWR, Relay |
| Router | Khá | Tốt | preset `Navigate`; công thức React Router / TanStack Router / Next.js App Router; `ui/Link` bọc router link |
| Form | Khá | Tốt | TanStack Form (`form.Field`), Formik, react-final-form; công thức RHF `Controller` |
| i18n | Khá | Tốt | preset provider i18next / react-intl / next-intl / lingui |
| UI | Trung bình | Tốt | chặn `className` / `style` / `sx` ngoài contract; `tailwindPreset` / `muiTheme` / `cssVariables` (một nguồn token, đã thử `createTheme` MUI thật); `fw add` cho kit có sẵn |

Code: `codecheck.ts` (`extraProps`, thẻ có dấu chấm), `wrappers.ts` (preset, `i18nLibrary` cũng tính), `themes.ts` (mới,
export ở `index.ts`), `rules.ts`. Test: `tests/compat/react/` (10 màn + 1 freeform) chạy bằng `scripts/compat.mjs`
trong `npm test`: 11/11. Còn chủ đích: kit UI vẫn phải bọc trong `ui/` hoặc `fw add` (không import thẳng trong màn);
adapter MUI / shadcn làm sẵn 76 component vẫn để sau.
