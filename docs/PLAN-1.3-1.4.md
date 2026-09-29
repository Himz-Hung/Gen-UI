# Kế hoạch genui-fw 1.3 và 1.4

Ngày viết: 2026-09-29. Đọc cùng `docs/HANDOFF-1.3.md`. File này **đã được duyệt toàn bộ** (Q1–Q6, 2026-09-29). Bắt đầu từ mục 4, phiên A.
Repo đã chuyển từ `~/Desktop/genui-fw` sang `~/genui-fw` (macOS chặn quyền đọc Desktop).

## Trạng thái (cập nhật 2026-09-29, chưa commit)

- **Bước 1–3 xong ở dạng pilot**: `Check` (`define.ts`), `packages/core/src/behaviour.ts` (validate, sinh test React/Flutter, chạy vitest / flutter test), `fw verify` chạy test, `fw check` chỉ validate tĩnh (Q1), `fw docs` in checks.
- Contract có checks: Button, Modal, Checkbox (cả `packages/rules` và `ui-rules/` của hai gallery). Test sinh ra ở `examples/*/test/fw/`.
- Kết quả: React 3/3 PASS, Flutter 3/3 PASS. Tất cả test xanh (npm test, test:flutter, parity).
- **Đã chốt 1a**: component Flutter dùng `tapTargetSize: MaterialTapTargetSize.shrinkWrap`, chiều cao layout = số trong contract (Button đã sửa, và sửa luôn loading giữ width). Bước 4/6 áp dụng cho các input khác.
- Check mức `warn` chỉ chạy trong `fw verify` (`FW_VERIFY` env / `--dart-define`), `vitest` / `flutter test` thường bỏ qua để suite không đỏ vì cảnh báo.
- **Đã chốt gitignore `test/fw/`** và đã làm: `fw init` thêm `test/fw/` vào `.gitignore`, React project chưa có script test thì đặt `"test": "fw verify"` (có rồi thì in gợi ý nối); README mục CI thêm `npx fw verify`; `npm test` / `test:flutter` của repo gọi `fw verify`; hai gallery ignore `test/fw/`.
- **Bước 4 xong** (5 agent Sonnet): 53/76 contract có checks, 124 check. 23 contract không có gì đo được với các kind hiện có.
- Harness sửa theo báo cáo agent: pump sau render (overlay post-frame), bấm `target` bằng text range (link trong đoạn văn), role `alertdialog`/`searchbox`, `null` = bỏ prop, tên lấy cả từ tooltip.
- Bước 5: React 2 component fail (Image, Toast), Flutter 7 (FloatingActionButton = giới hạn harness overlay, IconButton, Input, Textarea, Slider, Spinner, SegmentedControl). Cảnh báo tầng 2: phím mũi tên Tabs, SegmentedControl (Flutter). `npm test` / `test:flutter` đang đỏ vì `fw verify` fail.
- **Bước 6a xong**: sửa Toast (role alert khi danger), Image (alt đọc được khi đang tải / lỗi), IconButton + FloatingActionButton (shrinkWrap), Input / Textarea / Slider (MergeSemantics: label là tên field), Spinner (liveRegion), SegmentedControl (radio semantics). Harness đo được component vẽ qua OverlayPortal (`_shown`). **Tất cả xanh**: React verify 81/81, Flutter verify 129/129, vitest 206, flutter test 211, parity 76/76.
- **Bước 6b xong**: `tsconfig.build.json` → `packages/core/dist` (JS + .d.ts, `rewriteRelativeImportExtensions`), `exports` trỏ dist, `files` bỏ src, `prepack` build, `bin/fw.js` import `dist/cli.js` và đăng ký tsx in-process (ESM + CJS) chỉ để đọc file .ts của người dùng. Root `npm test` / `test:flutter` build trước. Bỏ `allowImportingTsExtensions` khỏi tsconfig của pokemon-shop và gallery-react. Kiểm bằng `npm pack` + cài vào project trống: `fw init` React/Flutter, `fw check`, `tsc` strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess + skipLibCheck:false = 0 lỗi. Project CJS chạy được. `fw --help` 0,63s → 0,48s.
- **Bước 6c xong**: README chính (mục Checks, `fw verify` chạy test, CI, Limitations, bỏ `allowImportingTsExtensions`), `packages/core/README.md` = bản copy, `docs/vi/README.md`, README 2 gallery (mục Behavioural checks), `rules.ts` (fix component, không sửa check), `verify.ts` header, CHANGELOG 1.3.0, version core + rules 1.3.0 (rules peer ^1.3.0), 3 example, package-lock. Thử `npm pack` 1.3.0 vào project trống: init, check, docs, verify (báo thiếu vitest → cài → pass; project không có vite config được sinh `test/fw/vitest.config.mjs`).
- **Hạng mục 1.4 gộp vào bản 1.3.0** (người dùng chốt: phát hành chung một bản 1.3.0), đã xong:
  - `fw add` React dùng type checker (`propsof.ts`): forwardRef / memo / extends / intersection; prop kế thừa từ thư viện chỉ liệt kê; `fw verify` resolve prop thư viện cho component đã đăng ký. Thử thật với @mui/material và shadcn (cva + forwardRef): PASS.
  - `fw add` Flutter (`addFlutterWidget`): constructor → contract (enum, callback, children, default); `verifyFlutter` / test sinh ra / `fw check` màn chấp nhận tên class và enum riêng của widget.
  - `screenDirs` / `freeformDirs` trong `ProjectConfig`; `fw check` gợi ý thư mục UI phổ biến chưa khai báo.
  - README, docs/vi, CHANGELOG đã cập nhật. Tất cả test xanh.
- Adapter MUI / shadcn: vẫn để sau.
- Đã chốt (2026-09-29): **giữ tsx** trong runtime (chỉ để nạp file .ts của người dùng); không tự viết loader.
- **Chưa làm**: design doc phần 16 (`~/Desktop/generative-ui-note.md`, Claude không đọc được Desktop); commit + push; người dùng publish 1.3.0; 1.4.
- Việc treo cho 6c: `verify.ts` header và README Limitations vẫn ghi "static"; CHANGELOG: React cần `vitest jsdom @testing-library/react @testing-library/user-event` cho `fw verify`.

---

## 0. Điểm cần người dùng chốt trước khi làm

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Test hành vi chạy ở `fw check` hay chỉ ở `fw verify`? | **ĐÃ DUYỆT (2026-09-29).** **Chỉ `fw verify [Name…]`.** `fw check` giữ tĩnh, để CI (`npx fw check`) không cần vitest/Flutter/Chromium |
| Q2 | Có tải Chromium (~150 MB) cho vitest browser mode không? | **ĐÃ CHỐT (2026-09-29): KHÔNG.** Bỏ bước 0. React chỉ chạy jsdom; `size`, `keepsSize`, `focusVisible`, `minTarget` ghi `skipped on react (needs browser)`, Flutter vẫn kiểm |
| Q3 | Check nào là lỗi (error), check nào là cảnh báo (warn)? | **ĐÃ DUYỆT (2026-09-29).** Chia 2 tầng (mục 1.2). Phím mũi tên, minTarget, màu token, focus ring = tầng 2 (warn) |
| Q4 | Làm issue 2 (build core ra JS) trong 1.3? | **ĐÃ DUYỆT (2026-09-29).** **Có**, vì 1.3 đằng nào cũng sửa core và phát hành |
| Q5 | 1.4 làm bản gọn hay có adapter MUI/shadcn? | **ĐÃ DUYỆT (2026-09-29).** Bản gọn trước (1.4.0), adapter tách ra 1.5 sau khi có người dùng thật |
| Q6 | Sửa đường dẫn `~/Desktop/genui-fw` → `~/genui-fw` trong HANDOFF-1.3.md (mục 2, 6, 7)? | **ĐÃ LÀM (2026-09-29).** |

---

## 1. Bản 1.3: check hành vi chạy được (issue 1) và build ra JS (issue 2)

### 1.1 Những gì đã kiểm lại (2026-09-29)

| Điều cần biết | Kết quả |
|---|---|
| `verify.ts` / `verifyFlutter` | chỉ kiểm bề mặt (tên, loại, enum, handler, children). `rules` và `a11y` không được kiểm |
| Cam kết đo được trong 76 contract | "arrow" 39 lần, "accessible name" 27, "height" 26, "Escape" ở 9 contract, "focus" ở 30 contract |
| vitest | 2.1.9 ở root. `@vitest/browser@2.1.9` có trên npm. **Playwright và Chromium chưa cài** |
| Thời gian test hiện tại | vitest 92 test **1,9s**; flutter test 91 test **7,8s**. Chạy hết khi verify là chấp nhận được |
| `catalog.ts:16` | tăng `version` sẽ xoá `impl`, nên thêm `checks` **không** được tăng version |
| `loader.ts:27` | nạp `ui-spec/*.ts` và `ui-rules/*.rule.ts` của người dùng bằng `import()`, dựa vào tsx đang chạy. **Build core ra JS vẫn cần tsx** (qua API `tsImport`) để đọc file `.ts` của người dùng |
| `index.ts` | browser-safe (app bundle kéo `project.ts` qua `ui/tokens.ts`). Kiểu `Check` chỉ là type nên không phá điều này |
| Lỗi đã biết | hai README gallery liệt kê ~25 chỗ chưa đạt, phần lớn là phím mũi tên và a11y nâng cao |

### 1.2 Kiểu `Check` và hai tầng

Kiểu union có trường `kind`. `fw check` bắt `kind` lạ, prop, event hoặc giá trị enum không tồn tại (5 agent viết 76 contract nên cần chặn sai sót).

| Tầng | `kind` | React chạy ở | Flutter |
|---|---|---|---|
| 1 (error) | `size`: chiều cao/rộng theo enum, **nhận số hoặc token** (`{ token: 'control.md' }`) | browser | `tester.getSize` |
| 1 | `keepsSize`: `whenProps` A giữ kích thước như B | browser | `getSize` |
| 1 | `neverEmits`: không phát event khi `whenProps` | jsdom | tap |
| 1 | `emits`: bấm / Enter / Space phát event | jsdom | tap + `sendKeyEvent` |
| 1 | `role` + `name` (từ prop) | jsdom | semantics |
| 1 | `key`: phím (Escape…) phát event | jsdom | `sendKeyEvent` |
| 1 | `rendersNothing` khi `whenProps` | jsdom | `findsNothing` |
| 2 (warn) | `arrowNav`, `minTarget`, `tokenColor`, `focusVisible` | browser / jsdom | tương ứng |

Chia tầng để kết quả bước 5 không bị lấn át bởi những lỗi đã ghi sẵn trong README.

### 1.3 Các bước

| Bước | Sẽ làm gì (file) | Ai làm | Token |
|---|---|---|---|
| 1. Kiểu `Check` | `define.ts` (type + field `checks?`), `index.ts` (export type), `check.ts` (validate `checks`), `docs.ts` (in checks trong `fw docs`) | Opus | 3–5M |
| 2. Bộ sinh test | `testgen.ts` mới: `generateReactTests` (jsdom, check cần layout sinh `it.skip` kèm lý do), `generateFlutterTests` (`test/fw/<snake>_contract_test.dart`); props mẫu từ `examples`, giá trị giả cho `ref`/`node` | Opus | 15–30M |
| 3. `fw verify` chạy test | `cli.ts` + `verify.ts`/`dart.ts`: sinh test, gọi vitest / `flutter test --no-pub test/fw`, gộp kết quả vào `Report` tại `checks[i]`; thiếu runner thì báo cách cài. Không thêm cờ CLI | Opus | 5–10M |
| 4. Gắn `checks` cho 76 contract | 5 agent Sonnet theo nhóm (handoff mục 6), mỗi agent một bản copy; Opus rà soát | Sonnet + Opus | 20–35M |
| 5. Chạy trên hai gallery rồi **DỪNG** | báo: số component fail theo tầng, theo nền tảng, theo check; ước lượng token để sửa | Opus | 5–10M |
| **Tới điểm dừng** | | | **48–90M** |
| 6a. Sửa component fail (tầng 1 trước) | agent Sonnet, bản copy riêng, giữ parity | Sonnet | 20–45M |
| 6b. Build ra JS (issue 2) | `tsconfig.build.json` → `dist/*.js` + `.d.ts`; `exports` trỏ `dist`; `bin/fw.js` chạy `dist/cli.js` trực tiếp; `loader.ts` dùng `tsImport` của tsx cho file người dùng; sửa lỗi `exactOptionalPropertyTypes` / `noUncheckedIndexedAccess` ở `define.ts:37`, `types.ts:124`; `prepack` build; test cài vào project trống với tsconfig chặt | Opus | 10–20M |
| 6c. Tài liệu + phát hành | CHANGELOG 1.3.0, README (Contracts: `checks`; Limitations), `docs/vi`, `rules.ts`, parity kiểm cả `test/fw/`, design doc phần 16, memory; core + rules lên 1.3.0 | Opus | 5–10M |
| **Tổng 1.3** | | | **~80–165M**, khả năng cao nhất ~**110M** |

Không dùng trình duyệt (Q2): các check đo layout chỉ được Flutter kiểm; React ghi `skipped (needs browser)` trong báo cáo, không bỏ im lặng. Có thể bật lại ở bản sau.

Kết quả của 6b (nói rõ để khỏi hiểu nhầm): **hết** cờ `allowImportingTsExtensions`, hết lỗi strict lọt từ core, khởi động nhanh hơn (bỏ spawn process con).
**Vẫn còn** `tsx` (đọc file `.ts` của người dùng) và `typescript` (verify/add dùng AST) trong `dependencies`.

---

## 2. Bản 1.4: dùng chung với design system có sẵn (issue 3)

### 2.1 Những gì đã kiểm lại

| Điều cần biết | Kết quả |
|---|---|
| `fw add` với `interface P extends MuiButtonProps { tone? }` | PASS nhưng contract chỉ có `tone`: **mất hết prop kế thừa, không báo gì** |
| `fw add` với shadcn `React.forwardRef<…, ButtonProps>` | FAIL "could not find a props type" |
| Nguyên nhân | `add.ts` `extractProps` chỉ đọc member khai báo trực tiếp, không dùng type checker |
| Luật raw markup | `codecheck.ts:48`, chỉ quét `src/screens`, `screens` (`cli.ts:124`). `src/pages`, `app/` (Next.js) **không bị kiểm** |
| `checkCode` | đã nhận tham số `dirs`, nên thêm thư mục cấu hình được chỉ là việc nối dây |
| `fw add` Flutter | chưa có (`cli.ts:71` báo lỗi) |

### 2.2 Các bước (bản gọn = 1.4.0)

| Bước | Sẽ làm gì | Token |
|---|---|---|
| 1. `fw add` dùng type checker | tạo `ts.Program` từ tsconfig người dùng; đọc `forwardRef`/`memo`/arrow; prop kế thừa **từ code của project** đưa vào `props`, prop kế thừa **từ node_modules** (MUI, HTML attrs) liệt kê ở `todo` để người dùng tự chọn. Không thêm cờ | 10–20M |
| 2. Thư mục áp luật cấu hình được | `ProjectConfig.screenDirs` (mặc định như cũ) và `freeformDirs` (miễn luật, ví dụ landing page) trong `define.ts`; `cli.ts:124` đọc cấu hình; `fw init` gợi ý `app/`, `src/pages` theo framework | 5–10M |
| 3. `fw add` cho Flutter | dùng bộ đọc Dart có sẵn trong `dart.ts`: đọc constructor của widget, sinh contract với `impl.flutter` | 10–20M |
| 4. Tài liệu + phát hành 1.4.0 | README mục "Existing design systems", Limitations, CHANGELOG | 5–10M |
| **Tổng 1.4.0** | | **30–60M** |

### 2.3 Để sau (1.5): preset adapter MUI / shadcn

| Hạng mục | Token |
|---|---|
| Thiết kế: override giá trị check theo design system (dựa vào `size` nhận token từ 1.3) | 10–20M |
| Adapter MUI: 76 component bọc MUI, qua checks tầng 1 | 40–70M |
| Adapter shadcn | 40–70M |

Lưu ý: chiều cao mặc định của nút MUI (khoảng 31/37/42px, **cần đo lại**) khác 32/40/48 của contract, nên adapter chỉ khả thi khi check nhận token.

---

## 3. Tổng token

| Bản | Token | % phiên 5 giờ (1% ≈ 6–7M) |
|---|---|---|
| 1.3 (kèm build JS) | ~80–165M | ~12–26% |
| 1.4.0 bản gọn | ~30–60M | ~5–9% |
| 1.5 adapter (nếu làm) | ~90–160M | ~14–25% |

Cơ sở: phiên 1.1→1.2.1 tốn ~300M (phiên chính 232,6M / 471 lượt, subagent 67,2M), 80% do context phiên chính phình to.
Giữ số trên bằng cách **mỗi bước một phiên hoặc `/compact`**, Sonnet cho việc viết hàng loạt.

## 4. Thứ tự phiên đề xuất

1. Phiên A: bước 1.
2. Phiên B: bước 2–3.
3. Phiên C: bước 4–5, **dừng báo số fail**.
4. Phiên D: 6a (sau khi người dùng duyệt), 6b, 6c → người dùng publish 1.3.0.
5. Phiên E: 1.4.0.
