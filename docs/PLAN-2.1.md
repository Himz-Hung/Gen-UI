# Kế hoạch 2.1: UI dùng được thật (tương tác, chuyển động, layout web, responsive)

Ghi ngày 2026-10-12. Nguồn: app thật **Beats Fitness** (`~/gym-booking`) build từ gallery 2.0 — pass mọi `fw check` /
`fw verify` nhưng UI "xấu và chết" (không phản hồi, không animation, không loading) và trên web bị dồn một cột hẹp
(ảnh chụp 2026-09-30: nội dung ~400px trên màn 2000px, sidebar viết tay hụt chiều cao). Đọc kèm:
- `docs/TODO-interaction-motion.md` — chi tiết kỹ thuật + những gì **đã làm sẵn trong gym-booking** cần đưa ngược về.
- `~/gym-booking/docs/GAPS.md` — lỗi / thiếu sót component tìm được khi build app thật.
- `docs/BACKLOG.md` — việc khác (nhóm A gộp vào đây, `defineShell` để 2.2).

Phát hành: **2.1.0** (thêm, không phá tương thích 2.0). Ước lượng tổng: ~110–170M token (không phải ràng buộc).
Quy ước như các bản trước: test xanh sau mỗi giai đoạn; chỉ commit / push khi người dùng bảo; người dùng tự publish
(core trước, rules sau).

---

## Giai đoạn

### 1. Chuyển động và tương tác (ưu tiên cao nhất) — ~35–50M
Đưa ngược code mẫu đã có trong gym-booking (`apps/web/ui/motion.ts`, `ui/interactions.css`, `apps/mobile/lib/ui/motion.dart`).

| Việc | Chi tiết |
|---|---|
| Token chuyển động | `motion.duration.{fast,normal,slow}`, `motion.easing.{standard,enter,exit}` trong theme model (có thể đổi theo mode); sinh `--ui-motion-*` và `context.ui.motion`; tôn trọng reduced motion |
| Trạng thái tương tác trong contract | Button, IconButton, Link, Card pressable, ListItem, Chip/ChipGroup, Tabs, SegmentedControl, Sidebar, Menu, Switch, Checkbox, Input focus: hover, pressed (scale ≈ 0.97 / ripple), focus-visible ring, disabled |
| Overlay vào / ra | Modal, Drawer, ConfirmDialog, Toast, Menu, Tooltip (web: `usePresence` + `data-state`; Flutter: một AnimationController) |
| Loading | Skeleton shimmer (token-tinted), Spinner, ProgressBar |
| Check mới | `pressedFeedback`, `focusRing`, `motion { maxMs }`, `reducedMotion` (chỗ nào đo được trên jsdom / flutter_test) |
| Gallery | web: một `ui/interactions.css` (class + biến, base vẫn inline để `tokenColor` đọc được); Flutter: `UiPressable`, ripple theo token, haptics, implicit animations |
| Công thức cấp app | chuyển trang (React `<ViewTransition>` ở page, go_router `CustomTransitionPage`), thanh tiến trình điều hướng, skeleton theo route, shared element (`transitionTag` trên Image / Heading) — tài liệu + template `fw init` |
| Rule cho agent | bước **duyệt bằng ảnh chụp** (sáng + tối, điện thoại + desktop) trước khi báo xong |

### 2. Bộ layout web — ~25–40M
| Việc | Chi tiết |
|---|---|
| Contract mới | `Columns` (tỉ lệ / độ rộng cố định), `SplitView` (master–detail, thu thành chuyển màn khi hẹp), `Sticky`, `ScrollArea`, `Section` (dải nền tràn viền, nội dung có giới hạn bề rộng) |
| `Grid` mở rộng | số cột cố định, con có `span`, vùng đặt tên |
| Thuộc tính cha quy định cho con | contract cha khai báo (`childProps`: `span`, `grow`, `width`), spec ghi trên phần tử con, `fw check` kiểm |
| `PageHeader` | breadcrumb + tiêu đề + nút hành động (đúng chỗ thiếu trong ảnh Beats Fitness) |
| Check | Flutter đo tỉ lệ cột / span; React kiểm style grid |

### 3. Responsive — ~10–20M
| Việc | Chi tiết |
|---|---|
| Biến thể theo bề rộng trong spec | `responsive: { wide: { props / children / thứ tự } }` trong `*.ui.json`; breakpoint từ token (`size.breakpointWide`…); `fw check` kiểm mọi biến thể |
| Mật độ cho desktop | dùng mode `density` (có từ 2.0): `compact` cho màn rộng; gallery dùng thử, tài liệu |
| Rule cho agent | màn rộng dùng `Columns` / `SplitView`, không chồng hết thành một cột |

### 4. Sửa lỗi và thiếu sót tìm được ở gym-booking (`GAPS.md`) — ~20–30M
| Việc |
|---|
| Icon giả `<span data-icon>` ở 11 component React → render `Icon` thật; bổ sung icon: bell, facebook, instagram, chart, logo Google / Facebook / Apple |
| `Image`: `onLoad` với ảnh SSR, reset lỗi khi đổi `src`, tỉ lệ rộng / độ rộng cố định; Flutter `UiImage` / `UiAvatar` nhận cả asset |
| `SiteHeader` logo bị Tailwind preflight phóng to; `SiteFooter` dùng namespace `JSX` toàn cục (React 19); lỗi hydration `useWide` / HorizontalScroll |
| Flutter: `UiInput` sụp khi không có icon cuối, placeholder sai màu; `UiChipGroup` chữ không đọc được ở dark; `UiPullToRefresh._handleRefresh`; `UiToast` cần slot overlay; `ClassCard`-kiểu tràn hàng tag |
| `Sidebar` có slot cuối (người dùng / theme / đăng xuất); `SiteHeader` / `SiteFooter` có slot ngôn ngữ / theme |
| `Table` ô không chỉ là chuỗi (avatar, ảnh, switch); spec bind `Table.rows` / `BarChart.bars` từ mảng domain |
| Bug `fw check`: kiểu hàm trong màn Flutter (`final void Function(String)? onToast;`, typedef cục bộ) bị coi là gọi constructor |
| Định dạng spec: phần tử có điều kiện, nhiều hành động cho một event, Accordion lặp item, prop `t.array(t.text())` bind vào trường của danh sách |
| Chia sẻ khối dùng chung giữa các màn (khối sidebar admin bị lặp ở 11 màn) — tạm thời qua contract `ui-spec/components`, tận gốc ở `defineShell` (2.2) |

### 5. Bản vá nhỏ (backlog nhóm A) — ~5–8M
Thông báo lỗi với `import * as X`; preset Sentry (`@sentry/react`, `sentry_flutter`); `/* eslint-disable */` ở file sinh ra;
`fw init` thêm file sinh ra vào `.prettierignore`; phong cách file sinh ra ổn định.

### 6. Tài liệu và phát hành — ~5–10M
README (Interaction & motion, Layout, Responsive), docs/vi, CHANGELOG 2.1.0, rule cho agent, design doc phần 16 (cần file
ngoài Desktop), version core + rules 2.1.0.

---

## Để sang 2.2
`defineShell` (khung app sinh sẵn: sidebar cao hết màn, bottom nav / rail / sidebar theo bề rộng, React Router + go_router),
`defineSources` (loading / error của dữ liệu), spec riêng theo form factor (`home.wide.ui.json`).

## Trạng thái

| # | Giai đoạn | Trạng thái |
|---|---|---|
| 1 | Chuyển động và tương tác | |
| 2 | Bộ layout web | |
| 3 | Responsive | |
| 4 | Sửa lỗi từ gym-booking | |
| 5 | Bản vá nhỏ | |
| 6 | Tài liệu, phát hành 2.1.0 | |
