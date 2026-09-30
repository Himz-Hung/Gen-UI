# Kế hoạch 2.0: hệ theme tổng quát (token 3 tầng + mode nhiều trục)

Ngày viết: 2026-09-30. Người dùng chốt: làm cách **tối ưu về kỹ thuật, dùng được đa dạng về sau**, không cần giữ
tương thích bản cũ (phát hành **2.0.0**), chi phí token không phải vấn đề. Light / dark chỉ là trường hợp đầu tiên.

---

## 1. Mục tiêu

1. Một nguồn token, đổi theme **lúc chạy** trên web và Flutter (sáng / tối / theo hệ thống; sau này tương phản cao,
   nhiều thương hiệu, mật độ) mà **không sửa component hay contract**.
2. Máy kiểm được: không còn giá trị thô trong `ui/`, mọi cặp chữ / nền đạt WCAG ở mọi tổ hợp mode, token toàn vẹn.
3. Trao đổi được với công cụ thiết kế (JSON chuẩn W3C Design Tokens) và thêm nền tảng mới bằng một bộ sinh.

## 2. Mô hình token

### 2.1 Ba tầng

| Tầng | Ví dụ | Ai dùng |
|---|---|---|
| primitive | `color.blue.600 = '#2563EB'`, `color.gray.900`, `color.white` | chỉ tầng semantic trỏ tới |
| semantic | `color.primary = '{color.blue.600}'`, `color.onSurface`, `space`, `radius.md`, `size.controlMd`, `font.body` | component, contract, check |
| component (tuỳ chọn) | `component.button.primaryBg = '{color.primary}'` | chỉnh riêng một component |

Tham chiếu viết dạng `'{nhóm.đường.dẫn}'` (giống chuẩn W3C), trỏ được tới primitive hoặc semantic khác; `fw` phát
hiện tham chiếu hỏng và vòng lặp.

### 2.2 Mode nhiều trục

```ts
// ui-spec/project.ts (2.0)
export default defineProject({
  name: 'Shop', platforms: ['react', 'flutter'], agent: 'claude',
  tokens: {
    primitives: {
      color: { blue: { 600: '#2563EB', 700: '#1D4ED8' }, gray: { 50: '#F8FAFC', 500: '#64748B', 900: '#0F172A' }, white: '#FFFFFF' },
    },
    semantic: {
      color: { primary: '{color.blue.600}', onPrimary: '{color.white}', surface: '{color.white}', onSurface: '{color.gray.900}', muted: '{color.gray.500}' },
      space: [0, 4, 8, 12, 16, 24, 32, 48],
      radius: { sm: 4, md: 8, lg: 16, full: 9999 },
      size: { controlSm: 32, controlMd: 40, controlLg: 48 },
      font: { body: 'Inter', heading: 'Inter' },
    },
    modes: {
      colorScheme: {
        light: {},
        dark: { color: { surface: '{color.gray.900}', onSurface: '{color.gray.50}', muted: '{color.gray.500}' } },
      },
      density: { comfortable: {}, compact: { size: { controlMd: 36 } } },
    },
    // contrast: [['onSurface', 'surface'], ['muted', 'surface', 3]]  // thêm / đổi ngưỡng; mặc định suy từ onX / X
  },
});
```

- Giá trị đầu tiên của mỗi trục là mặc định. Mode chỉ ghi token khác đi (override tầng semantic / component).
- `colorScheme` có ý nghĩa đặc biệt: `system` ánh xạ `light` / `dark` theo hệ điều hành.
- Trục khác (`brand`, `density`, `contrast`…) người dùng tự đặt tên.

## 3. Trình biên dịch token (`fw` sinh file ở mọi lệnh)

| Đích | File | Nội dung |
|---|---|---|
| Web | `ui/tokens.css` | CSS variables: `:root` = mặc định; `[data-ui-color-scheme="dark"]`, `[data-ui-density="compact"]`…; `@media (prefers-color-scheme: dark)` cho `system` |
| Web | `ui/tokens.ts` | `tokens.color.primary = 'var(--ui-color-primary)'`, `sp(4)`, `radius.md`, `size.controlMd` là `var(...)`; `alpha(color, 0.12)` → `color-mix()`; `setMode({ colorScheme: 'dark' })`, `getMode()`, lưu lựa chọn; `modeScript` chống nháy màu cho SSR; `values` = giá trị mặc định dạng số cho chỗ bắt buộc tính toán |
| Web | hàm trong core | `tailwindPreset(project)` trỏ tới biến CSS; `muiTheme(project, mode)` |
| Flutter | `lib/ui/theme.g.dart` | `UiTheme extends ThemeExtension` (color, space, radius, size) cho **mỗi tổ hợp mode**, có `lerp`; `uiTheme(mode)` → `ThemeData` đầy đủ (ColorScheme từ token, không `fromSeed`); `extension UiThemeX on BuildContext { UiTheme get ui }` |
| Flutter | `lib/ui/tokens.g.dart` | chỉ còn giá trị không đổi theo mode (font) — màu / space / radius / size đọc qua `context.ui` |
| Trao đổi | `fw tokens export` / `import` (cân nhắc, không thêm lệnh nếu tránh được: có thể sinh `ui-spec/tokens.json` ở mọi lệnh) | JSON W3C Design Tokens |

## 4. Kiểm tra

| Check | Ở đâu | Nội dung |
|---|---|---|
| Toàn vẹn token | `fw check` | tham chiếu hỏng, vòng lặp, override token không tồn tại, mode rỗng sai tên trục |
| Tương phản WCAG | `fw check` | mọi cặp `onX` / `X` (mặc định 4.5) và cặp khai báo thêm, **ở mọi tổ hợp mode** |
| Cấm giá trị thô trong `ui/` | `fw verify` | React: `'#fff'`, `rgb()`, `hsl()`, px cứng cho màu; Flutter: `Color(0x…)`, `Colors.x` (trừ `transparent`). Giai đoạn sau: space / radius cứng |
| `tokenColor` theo mode | `fw verify` | Flutter render từng `colorScheme`, so đúng màu; React kiểm component dùng đúng biến token |
| Parity | `npm test` | hai gallery có nút đổi mode ở shell |

## 5. Giai đoạn

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Mô hình token (types, chuẩn hoá, giải tham chiếu, tổ hợp mode), kiểm toàn vẹn + tương phản trong `fw check`; chuẩn hoá tạm định dạng cũ để repo xanh trong lúc chuyển | ✅ 2026-09-30: `theme.ts`, report `ui-spec/project.ts tokens` trong `fw check`, `scripts/theme.test.mjs` (9 test, trong `npm test`), template `fw init` dùng định dạng mới + dark |
| 2 | Bộ sinh web (`tokens.css`, `tokens.ts`, `alpha`, `setMode`, `modeScript`), `tailwindPreset` / `muiTheme` theo biến | ✅ 2026-09-30: `webtokens.ts` → `ui/tokens.css` + `ui/tokens.g.ts` ở mọi lệnh (project React); token semantic trỏ semantic thành `var()` nên tự theo mode; mặc định `colorScheme` = system; `tailwindPreset` trỏ biến, `muiTheme(project, mode)`; 13 test |
| 3 | Bộ sinh Flutter (`UiTheme` ThemeExtension, `uiTheme(mode)`, `context.ui`) | ✅ 2026-09-30: `themeDart` sinh enum mỗi trục, `UiColors` / `UiRadius` / `UiSizes` / `UiFonts` / component tokens, `const UiTheme` cho mỗi tổ hợp + `lerp`, `uiThemeFor(...)`, `uiTheme(...)` (ColorScheme từ token, onX tự chọn khi thiếu), `context.ui`. Thử widget test trên bản copy (light/dark, density, component, lerp). `UiTokens` cũ giữ tới giai đoạn 5 |
| 4 | Cấm giá trị thô trong `ui/`; `tokenColor` theo mode | ✅ 2026-09-30: `rawcheck.ts` trong `fw verify` (React: hex / rgb / hsl / tên màu trong chuỗi, nối hex alpha vào token; Flutter: `Color(0x…)`, `Colors.x`, `UiTokens.color*` và nhóm mà mode đổi) — lỗi với ThemeTokens, cảnh báo với token 1.x (hiện: gallery-react 47, pokemon 18, gallery-flutter 1). `tokenColor`: React nhận `var(--ui-color-x)` trong style; Flutter chạy từng `colorScheme` dưới `uiTheme(...)`. Thử trên bản copy: Card bị bắt ở dark, Button sửa xong thì qua. 15 test |
| 5 | Chuyển gallery-react, gallery-flutter, pokemon-shop sang 2.0 (agent Sonnet); nút đổi mode ở shell; bỏ chuẩn hoá định dạng cũ | ✅ 2026-09-30: 3 example dùng ThemeTokens (gallery: light/dark, thêm vai trò surfaceAlt, border, scrim, onScrim, shadow, on*; pokemon: một mode, primary #E3350D → #D12F0C vì chữ trắng chỉ 4.39:1, thêm warning). React: 65 màu cứng sửa, `tokens.css` import ở main, nút đổi mode (gallery). Flutter: ~310 `UiTokens.color*` → `context.ui.color.*` (3 agent), shell `theme` / `darkTheme` / `themeMode` + nút, `test/theme/theme_test.dart`. Định dạng 1.x vẫn đọc được nhưng `fw check` cảnh báo. Mọi test xanh |
| 6 | JSON W3C export / import; tài liệu (README, docs/vi, CHANGELOG hướng dẫn nâng cấp), rule cho agent; phát hành 2.0.0 | ✅ 2026-09-30 (chưa commit / publish): `toDesignTokens` / `fromDesignTokens` (token set theo tầng và mode, test round trip), README mục Theming, docs/vi 10a, CHANGELOG 2.0.0 + hướng dẫn nâng cấp, rule agent "màu chỉ qua token", template `fw init` = bộ vai trò của gallery (light + dark), version core + rules 2.0.0 (rules peer ^2.0.0). 16 test theme |

Ước lượng: 65–100M token (không phải ràng buộc).

## 5b. Việc của giai đoạn 5 (đã đo)

- gallery-react: 47 giá trị thô (hex, `${tokens.color.x}22`); `ui/tokens.ts` → `export * from './tokens.g'`; `project.ts` sang ThemeTokens
  (giữ tên vai trò contract dùng: primary, secondary, danger, warning, success, surface, text, muted + onPrimary, onDanger, border);
  import `ui/tokens.css` ở `src/main.tsx`; nút đổi mode ở shell (`setMode`).
- pokemon-shop: 18 giá trị thô, như trên; `dist/` commit lại sau khi build.
- gallery-flutter: `UiTokens.color*` (315) → `context.ui.color.*`, bỏ `const` nơi cần (85), 1 `Color(0x…)`; `UiTokens.space` giữ được nếu
  không mode nào đổi `space`; shell: `theme: uiTheme(), darkTheme: uiTheme(colorScheme: UiColorScheme.dark), themeMode`.
- Thêm test theme (light / dark) vào gallery-flutter như bản thử `test/theme/theme_test.dart`.
- Sau khi chuyển: bỏ chuẩn hoá định dạng 1.x? (quyết định lúc làm: giữ đọc được nhưng cảnh báo, hoặc bỏ hẳn cho 2.0).

## 6. Quy ước khi làm

- Test phải xanh sau mỗi giai đoạn (`npm test`, `npm run test:flutter`, compat, parity).
- Chỉ commit / push khi người dùng bảo; người dùng tự publish (core trước, rules sau).
- Token semantic là thứ contract và check nhắc tới (`color.primary`, `size.controlMd`); primitive không bao giờ xuất hiện
  trong contract hay component.
