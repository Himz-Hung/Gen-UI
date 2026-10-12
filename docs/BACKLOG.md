# Backlog genui-fw (sau 2.0.0)

Ghi ngày 2026-09-30, cập nhật 2026-10-12. Chưa làm, chưa duyệt; chọn việc rồi mới làm.

> **Đã đưa vào kế hoạch 2.1 (`docs/PLAN-2.1.md`):** nhóm A, C1 (một phần), D (một phần: focus ring), chuyển động / tương tác
> (`docs/TODO-interaction-motion.md`), layout web + responsive. `defineShell` / `defineSources` để 2.2. Trạng thái phát hành: core + rules **2.0.0** trên npm,
GitHub `main` ở `d006391`.

---

## A. Bản vá nhỏ (đề xuất gộp thành 2.0.1, ~5–8M token)

| # | Việc | Chi tiết |
|---|---|---|
| A1 | Thông báo lỗi với `import * as X` | `codecheck.ts` bỏ qua namespace import, nên `<Sentry.ErrorBoundary>` báo "not imported from ui/ (locally defined component?)" thay vì "imported from @sentry/react". Luật vẫn chặn đúng, chỉ sai lời |
| A2 | Preset Sentry | `@sentry/react`: `Sentry.ErrorBoundary`, `Sentry.Profiler`; `sentry_flutter`: `SentryWidget`. Thêm màn mẫu vào `tests/compat` (React + Flutter) |
| A3 | File sinh ra có `/* eslint-disable */` | `ui/tokens.g.ts`, `test/fw/*.test.tsx`; Dart đã có `ignore_for_file` |
| A4 | `fw init` thêm file sinh ra vào `.prettierignore` | `ui/tokens.g.ts`, `ui/tokens.css`, `ui.catalog.json`, `CLAUDE.md` / `.claude/`, `test/fw/`, `lib/ui/*.g.dart`, `lib/ui/ui.dart` (tạo file nếu chưa có, như `.gitignore`) |
| A5 | Phong cách file sinh ra ổn định | nháy đơn, có `;`, thụt 2 dấu cách: diff ít khi ai đó lỡ format |

## B. Tích hợp công cụ

| # | Việc | Ghi chú |
|---|---|---|
| B1 | `@himz-genui/eslint-plugin` | bọc luật `fw check` (HTML thô ngoài `ui/`, prop ngoài contract, màu cứng) để báo ngay trong editor; Flutter: `custom_lint`. ~20–30M |
| B2 | GA4 / Sentry: tài liệu | README: khởi tạo và ErrorBoundary ở shell, ghi sự kiện trong handler của màn, không gọi analytics trong `ui/` (test hành vi render component không có SDK). Đã thử: `ReactGA.event`, `Sentry.captureException` được phép; `<Sentry.ErrorBoundary>` cần preset / `screenWrappers` |
| B3 | Prettier / ESLint: tài liệu | AST nên format không ảnh hưởng check; liệt kê file sinh ra cần ignore; ESLint flat config không đọc `.gitignore`; rule cấm inline style chỉ áp cho cách viết trong `ui/` |

## C. Theme (tiếp nối 2.0)

| # | Việc |
|---|---|
| C1 | Dark mode cho pokemon-shop (đang một mode) |
| C2 | Cấm giá trị thô cho space / radius / size / font trong `ui/` (2.0 mới áp cho màu) |
| C3 | Test ảnh chụp theo mode: golden test Flutter (offline); web cần trình duyệt (người dùng đã chọn không tải Chromium) |
| C4 | Token mở rộng: thang chữ (typography scale), elevation / shadow, motion |
| C5 | Bản nháp dark / high-contrast tự sinh từ primitive (tonal palette), người duyệt |

## D. Check hành vi

| # | Việc |
|---|---|
| D1 | Loại check mới: kéo / vuốt, bấm nút chỉ có icon (target theo accessible name thay vì chữ hiển thị), trạng thái aria (expanded, selected, sort), role list / menu / combobox, kích thước theo prop boolean |
| D2 | Focus ring, radius (React cần trình duyệt) |

## E. Kiến trúc lớn

| # | Việc | Ghi chú |
|---|---|---|
| E1 | `defineShell` | khung app (bottom nav / sidebar / top bar, tab, màn toàn màn hình), sinh code shell: React Router + go_router (`ShellRoute` + `Scaffold`); đề xuất đã nêu 2026-09-29, cần design doc gốc trên Desktop để đối chiếu. ~30–50M |
| E2 | `defineSources` | nguồn dữ liệu, trạng thái loading / error; làm cùng E1 |
| E3 | Adapter MUI / shadcn | 76 component bọc sẵn; cần check nhận token (đã có từ 2.0) |
| E4 | `fw init --with-components` | copy component gallery vào project mới |
| E5 | Pokemon shop bản Flutter, MCP server | từ HANDOFF mục 8 |

## F. Việc treo

- Design doc phần 16 (`~/Desktop/generative-ui-note.md`): Claude không đọc được Desktop (macOS chặn); cần người dùng chuyển file ra ngoài.
