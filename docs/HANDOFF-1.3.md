# Bàn giao cho phiên Claude tiếp theo: genui-fw 1.3 (check hành vi chạy được)

Ngày viết: 2026-09-29. Người viết: phiên Claude trước (Opus 5.5).
> **Cập nhật 2026-09-29:** 1.3 đã làm xong (chưa commit / publish). Trạng thái và việc còn lại: `docs/PLAN-1.3-1.4.md`.

Đọc file này **trước khi làm bất cứ gì**. Memory cũng đã có tóm tắt (`genui-fw-project`, `genui-fw-1-3-behavioural-checks`).

---

## 0. Việc cần làm, tóm tắt một dòng

Biến các cam kết UX của contract (chiều cao theo size, loading giữ kích thước, focus ring, accessible name, bàn phím…)
thành **check chạy được**, **sinh test** từ đó cho React và Flutter, và cho **`fw verify` chạy test**. Chạy trên hai
gallery, **dừng lại báo số component fail** trước khi sửa hàng loạt.

---

## 1. Người dùng và cách làm việc

- Người dùng nói **tiếng Việt**, thích câu trả lời ngắn, có bảng, có con số. Trả lời bằng tiếng Việt.
- Trước mỗi bước lớn, người dùng muốn thấy **danh sách thay đổi cụ thể** rồi mới đồng ý ("nêu rõ sẽ sửa những gì").
- **Chỉ commit / push khi người dùng bảo.** Cách đã dùng mọi lần: tạo branch tạm → commit → `git merge --ff-only` vào
  `main` → `git push origin main` → xoá branch. Commit message kết thúc bằng dòng Co-Authored-By được hệ thống yêu cầu.
- **Publish npm do người dùng tự chạy** trong Terminal.app (tài khoản `himz-genui`, 2FA bằng passkey, Claude không làm được).
  - Nếu `npm whoami` báo 401 → `npm logout && npm login` trước. Token hỏng làm `npm publish` báo **E404** gây hiểu nhầm.
  - Sau khi publish, registry mất **~2–5 phút** mới hiện version và tarball. Kiểm bằng
    `curl -H 'Cache-Control: no-cache' https://registry.npmjs.org/@himz-genui%2Fcore` và tải thử tarball, rồi cài vào
    project trống (`npm i -D --prefer-online @himz-genui/core @himz-genui/rules`) và chạy `fw init` cho cả hai nền tảng.
- Người dùng rất quan tâm **token**. Số đo thật trên gói của họ: **1% session 5 giờ ≈ 6–7 triệu token**
  (>95% là cache read). Phiên dài làm mỗi lượt Opus tốn ~0,7 triệu token → giữ phiên gọn, dùng agent Sonnet cho việc viết
  hàng loạt, Opus cho thiết kế và rà soát, `/compact` khi dài. Báo cáo chi phí **theo token**, không theo giá.
- Ngân sách người dùng đã chấp nhận cho 1.3: **~60–95 triệu token** (bước sửa có thể thêm 20–35 triệu).

---

## 2. Trạng thái hiện tại

| | |
|---|---|
| npm | `@himz-genui/core` **1.2.1**, `@himz-genui/rules` **1.2.0** (rules peer `core ^1.2.0`) |
| GitHub | `git@github.com:Himz-Hung/Gen-UI.git`, nhánh `main` ở `fee530c`, working tree sạch |
| Repo | `~/genui-fw` (chuyển khỏi Desktop ngày 2026-09-29 vì macOS chặn quyền đọc Desktop; npm workspaces: `packages/*`, `examples/*`) |
| Design doc (tiếng Việt) | `~/Desktop/generative-ui-note.md`, phần 16 là lịch sử và trạng thái. **Hiện Claude không đọc được Desktop**: cấp quyền cho terminal hoặc chuyển file ra ngoài |
| Flutter SDK | `~/development/flutter` (Dart 3.12). Chạy được offline: `flutter create --offline`, `flutter analyze --no-pub`, `flutter test --no-pub` |
| Node | 20.20 (vì vậy jsdom bị ghim ở 25, xem mục 7) |

Lệnh kiểm tra, phải xanh trước và sau mỗi bước:

```sh
npm test               # typecheck + Pokemon (fw check, tsc, vite build) + gallery-react (fw check, tsc, vitest, build) + parity
npm run test:flutter   # gallery-flutter: fw check + flutter analyze + flutter test
npm run test:parity    # hai gallery đồng bộ (đã nằm trong npm test)
```

Kết quả lần cuối: Pokemon 42 passed · gallery-react fw check 81 passed, vitest **92** · gallery-flutter fw check 81 passed,
flutter test **91** · parity **76/76**.

---

## 3. Bản đồ code

### `packages/core/src` (CLI `fw`, chạy TS qua tsx)
| File | Vai trò |
|---|---|
| `types.ts` | hệ kiểu `t` (`t.string/text/number().int()/enum/array/object/ref/node/void`), `plain`, `checkLiteral`, `typeText`, `refsIn` |
| `define.ts` | `defineComponent/Project/Domain/Screen/Flow/App/Strings`, kiểu `ComponentContract`, `ProjectConfig` (có `stateLibrary`, `screenWrappers`, `languages`, `i18nLibrary`) |
| `loader.ts` | nạp `ui-spec/`, `ui-rules/`, strings, screens |
| `catalog.ts` | sinh `ui.catalog.json` (gồm `impl.react` / `impl.flutter` sau khi verify qua) |
| `verify.ts` | **`fw verify` React**: đọc TSX bằng TypeScript AST, so props/enum/handler/children. Chỉ bề mặt |
| `dart.ts` | bộ đọc Dart nhẹ + **`verifyFlutter`**. Chỉ bề mặt (có kiểm kiểu payload callback, field của item class) |
| `flutter.ts` | quy ước Flutter (tiền tố `Ui`, `enumValue` `'5:7'`→`v5x7`, `snake`, chữ ký Dart, sinh `tokens.g.dart`, `ui.dart`, `strings.g.dart`) |
| `docs.ts` | `fw docs`: markdown contract + **chữ ký React** + **chữ ký Dart**; `fw docs <Screen>` in cây màn |
| `check.ts`, `values.ts` | `fw check` spec: binding, repeat, i18n, composition |
| `codecheck.ts` / `dartcheck.ts` | kiểm code màn React / Dart (chỉ dùng `ui/`, chữ viết cứng, wrapper của state library) |
| `appcheck.ts`, `flowcheck.ts`, `i18ncheck.ts`, `screens.ts` | outline, điều hướng, strings, mô tả màn |
| `wrappers.ts` | preset wrapper theo `stateLibrary` (Bloc, GetX, MobX, Riverpod, Provider, react-hook-form…) |
| `rules.ts` | sinh rule cho agent (SKILL.md / AGENTS.md…) theo nền tảng |
| `cli.ts` | 5 lệnh: `init`, `add`, `check [path…]`, `docs <Name>`, `verify [<Name>…]`. Mọi lệnh tự sync trước |

### `packages/rules/src`: 76 contract `*.rule.ts` + `index.ts` (`SHIPPED`)
Mỗi contract: `props`, `events`, `children`, `states`, **`rules` (chữ)**, `a11y` (chữ), `composition`, `platform` (gợi ý
react/flutter), `examples`. **Phần `rules` và `a11y` hiện không được máy kiểm**, đó là đúng việc của 1.3.

### `examples/`
| Thư mục | Nội dung |
|---|---|
| `pokemon-shop` | app React thật (Vite), 22 component, i18n en/vi. `dist/` **được commit** (build lại thì commit bundle mới) |
| `gallery-react` | cả 76 component React + 92 test vitest/Testing Library, màn Home. `dist/` bị gitignore |
| `gallery-flutter` | cả 76 component Flutter (`lib/ui/<snake>.dart`, `class Ui<Name>`) + 91 widget test, màn Home, chỉ nền tảng web |
| hai gallery | **dùng chung** `ui-spec/` và `screens/home.ui.json`; `scripts/parity.mjs` bắt lệch |

README của hai gallery có mục **"Where React and Flutter still differ"** / **"Contract rules not fully met"**, là danh sách
các chỗ hiện không đạt. Test sinh ra ở 1.3 gần như chắc chắn sẽ bắt đúng những chỗ đó.

---

## 4. Kế hoạch 1.3 (đã được người dùng đồng ý)

### Bước 1. Định nghĩa `checks` trong contract
Thêm field `checks?: Check[]` vào `ComponentContract` (`define.ts`). Đây là các cam kết **máy chạy được**, đặt cạnh `rules`.
Đề xuất khoảng 10–12 loại (chỉnh lại nếu thấy cần):

```ts
checks: [
  { height: { byProp: 'size', values: { sm: 32, md: 40, lg: 48 } } },            // kích thước theo enum
  { whenProps: { loading: true }, keepsSizeOf: { loading: false } },               // giữ kích thước
  { whenProps: { disabled: true }, neverEmits: 'press' },                          // không phát event
  { emits: 'press', on: 'activate' },                                               // bấm / Enter / Space phát event
  { role: 'button', name: { fromProp: 'label' } },                                 // role + accessible name
  { focusVisible: true },                                                           // có focus ring khi focus bằng bàn phím
  { key: 'Escape', emits: 'close', whenProps: { open: true } },                     // bàn phím
  { whenProps: { open: false }, rendersNothing: true },                             // overlay đóng thì không render
  { tokenColor: { part: 'background', token: 'primary', whenProps: { variant: 'primary' } } },
  { minTarget: 44 },                                                                 // vùng bấm tối thiểu
]
```

Nguyên tắc:
- Check phải **platform-neutral**: cùng một check sinh ra test cho cả hai nền tảng.
- Kiểu `Check` nằm trong `define.ts`, được export ở `index.ts` (browser-safe).
- Thêm field vào contract **không** được tăng `version` (tăng version sẽ xoá `impl` trong catalog).

### Bước 2. Bộ sinh test
- File mới trong core, ví dụ `testgen.ts`, gồm `generateReactTests(contract)` và `generateFlutterTests(contract)`.
- Nơi đặt test sinh ra:
  - React: `test/fw/<Name>.contract.test.tsx`
  - Flutter: `test/fw/<snake>_contract_test.dart`
  - Các file này là sinh ra, đầu file ghi "GENERATED, do not edit".
- Props mẫu để render: lấy từ `examples` của contract, hoặc sinh giá trị tối thiểu hợp lệ từ kiểu. Prop bắt buộc kiểu
  `ref` / `node` thì cần giá trị giả hợp lý.
- **React:**
  - Testing Library chạy trong jsdom kiểm được: event, role/name, bàn phím, render/không render.
  - jsdom **không có layout**, nên kích thước, focus ring và computed style phải chạy trong trình duyệt thật:
    `vitest` browser mode + Playwright Chromium. Việc này cần tải Chromium (có mạng); thử trước.
    Nếu không khả thi thì báo người dùng, và đánh dấu các check đó là `skipped on react (needs browser)` chứ không bỏ im lặng.
- **Flutter:** `flutter_test`. Đo kích thước bằng `tester.getSize(find.byType(UiButton))`, semantics bằng
  `tester.ensureSemantics()` + `find.bySemanticsLabel`, bàn phím bằng `tester.sendKeyEvent`.
  Chạy `flutter test --no-pub`.

### Bước 3. `fw verify` chạy test
- Sau phần kiểm bề mặt như cũ, `fw verify` sinh test (nếu contract có `checks`) rồi chạy runner của nền tảng:
  - React: `vitest run test/fw`, tìm vitest trong project; không có thì báo cách cài.
  - Flutter: `flutter test --no-pub test/fw`; không có Flutter SDK thì báo.
- Kết quả gộp vào `Report` như lỗi thường, có vị trí `checks[i]`.
- Giữ nguyên triết lý: không thêm cờ CLI mới nếu tránh được (CLI hiện có 5 lệnh, chỉ `init`/`add` có cờ).
- Nếu chạy test chậm quá, cân nhắc cho `fw verify <Name>` chạy test của đúng component đó, còn `fw check` (không tham số)
  chạy hết.

### Bước 4. Gắn `checks` cho 76 contract
- Dùng agent Sonnet, chia theo nhóm (xem cách chia ở mục 6).
- Mỗi agent đọc `rules` / `a11y` của contract và viết các check tương ứng.
- Chỉ viết check cho cam kết **đo được**. Thẩm mỹ, bố cục đẹp xấu thì giữ ở dạng chữ.

### Bước 5. Chạy trên hai gallery rồi **DỪNG**
- Chạy `fw verify` ở `examples/gallery-react` và `examples/gallery-flutter`.
- **Báo người dùng:** bao nhiêu component fail, fail ở check nào, React và Flutter mỗi bên bao nhiêu, và ước lượng token để sửa.
- Chờ người dùng đồng ý rồi mới sửa hàng loạt.

### Bước 6. Sửa, tài liệu, phát hành 1.3.0
- Sửa component bằng agent Sonnet, mỗi agent làm trên bản copy riêng (mục 6), rồi gộp về, chạy lại toàn bộ test và parity.
- Cập nhật CHANGELOG (1.3.0), README (mục Contracts: `checks`; mục Limitations: bỏ dòng "fw verify is static" nếu đã đúng),
  `docs/vi/README.md`, rule cho agent (`rules.ts`: "fw verify chạy test hành vi"), design doc phần 16, và memory.
- Phát hành: cả `core` và `rules` đều đổi, lên **1.3.0**; `rules` peer `core ^1.3.0`.
  Cập nhật version trong 3 example, `npm install --package-lock-only`, `packages/core/README.md` = copy của `README.md` gốc.
  Người dùng tự publish (mục 1). Người dùng project cũ phải copy lại `ui-rules/` để có `checks`, ghi rõ trong CHANGELOG.

---

## 5. Quy ước quan trọng (đừng phá)

- Contract là cam kết chung, code là việc riêng của từng nền tảng. **Luật cứng nằm ở validator, file md chỉ mô tả quy trình.**
- Text agent đọc (rule, purpose, message lỗi) viết **tiếng Anh**. Design doc và trao đổi với người dùng viết **tiếng Việt**.
- **Flutter:** mọi class có tiền tố `Ui` (`UiButton`, `UiSelectOption`, enum `UiButtonVariant`), vì 19 tên trùng widget Flutter
  và `List` trùng `dart:core`. Màn chỉ import `lib/ui/ui.dart` và
  `package:flutter/widgets.dart show StatelessWidget, StatefulWidget, State, Widget, BuildContext`.
  `*.g.dart` và `ui.dart` là file sinh ra, không sửa tay. Children luôn là `List<Widget> children`.
  `number` là `double`, còn `.int()` là `int`.
  Nút / control Material đặt `tapTargetSize: MaterialTapTargetSize.shrinkWrap` để chiều cao layout đúng số của contract (quyết định 1a, 2026-09-29).
- **React:** `ui/<Name>.tsx` gồm `export interface <Name>Props` và `export function <Name>`; style lấy từ `./tokens`.
- Chữ hiển thị là `t.text()`. Có nhiều ngôn ngữ thì không được viết cứng (spec dùng `{ "i18n": key }`).
- **Hai gallery phải đồng bộ** (`npm run test:parity`). Sửa hành vi ở bên nào thì sửa luôn bên kia, hoặc ghi vào mục
  "differ" trong README của gallery.

---

## 6. Cách chia việc cho agent (đã chạy tốt hai lần)

- 5 agent Sonnet, mỗi agent một nhóm component, chạy song song:
  1. layout / text / action
  2. input / form
  3. data / media
  4. feedback / navigation
  5. overlay / chart
- **Mỗi agent làm trên một bản copy riêng** trong scratchpad (`cp -R examples/gallery-x <scratch>/gN`), vì các lệnh `fw`
  chạy đồng thời sẽ cùng ghi `ui.catalog.json` và `ui.dart`.
  - Bản copy React: xoá `node_modules` trong bản copy rồi `ln -s ~/genui-fw/node_modules`.
    Gọi `tsc` và `vitest` bằng đường dẫn `~/genui-fw/node_modules/.bin/…`, chạy `fw` bằng
    `node ~/genui-fw/packages/core/bin/fw.js`.
  - Không `rm -rf "$VAR/…"`: công cụ an toàn sẽ chặn. Dùng đường dẫn cụ thể.
- Prompt cho agent phải tự đủ:
  - đường dẫn bản copy,
  - danh sách component,
  - lệnh `fw docs` / `fw verify`,
  - file mẫu cần đọc,
  - bắt đọc bản của nền tảng kia để giữ hành vi giống nhau,
  - cấm thêm dependency và cấm sửa file không phải của mình,
  - yêu cầu báo cáo ngắn (file đã tạo, kết quả lệnh, rule không làm được).
- Gộp lại:
  - copy file mới về, so `cmp` các file dùng chung (không agent nào được sửa file dùng chung),
  - chạy `fw verify`, `tsc` / `flutter analyze`, test, rồi `npm run test:parity`.
- Nếu phải tạm dừng: `TaskStop` từng agent. Làm tiếp bằng `SendMessage` tới agent đó; file trên đĩa vẫn còn.

---

## 7. Những bẫy đã gặp

- **jsdom 30 cần Node mới hơn 20.** Đã ghim `jsdom@^25` ở root `devDependencies` và `overrides`. Vitest nằm ở
  `node_modules` gốc nên jsdom cũng phải nằm ở gốc.
- `flutter analyze` báo `unnecessary_underscores`: dùng `(_, _, _)` thay vì `(_, __, ___)`.
- `Semantics(scopesRoute: true)` phải đi kèm `explicitChildNodes: true`, nếu không Flutter assert.
- `ExpansionTile` / `ListTile` nằm dưới `Container(color:)` sẽ assert. Dùng `Material(color:)`.
- Overlay trên Flutter (Modal, Drawer, ImageViewer, FAB) dùng `OverlayPortal`. Gọi `show()` / `hide()` trong
  `addPostFrameCallback`, không gọi trong lúc build.
- `showDateRangePicker` / `formatMediumDate` không in năm. Test phải khớp định dạng.
- Tap vào widget ngoài màn test 800×600 thì bị miss: gọi `tester.ensureVisible` trước.
- Log token cục bộ nằm ở `~/.claude/projects/-Users-danghung-genui-fw/*.jsonl` (phiên cũ trước 2026-09-29: `-Users-danghung-Desktop-genui-fw`) và
  `…/<session>/subagents/*.jsonl`. Mỗi request có nhiều dòng, nên lấy **max** theo `(message.id, requestId)`.
  Output token trong log bị thiếu.

---

## 8. Việc còn mở sau 1.3 (ưu tiên thấp hơn)

- **`fw init --with-components`:** copy bản component có sẵn từ gallery vào `ui/` hoặc `lib/ui/`. Giảm khoảng một nửa token
  cho lần xây đầu. Người dùng có quan tâm.
- Pokemon shop bản Flutter (cùng `ui-spec` với bản React). Chưa làm.
- Toast toàn cục (`toast.show()` ở shell) làm ví dụ trong Pokemon. Người dùng chưa yêu cầu.
- `fw add` cho Flutter (hiện chỉ React). `defineShell`, `defineSources`, MCP server. Build core ra JS (hiện chạy TS qua tsx).
- Các chỗ React và Flutter còn khác nhau: xem README của hai gallery.

---

## 9. Câu mở đầu gợi ý cho phiên mới

> Tiếp tục genui-fw: làm 1.3 behavioural checks theo `docs/HANDOFF-1.3.md` và memory. Làm bước 1–4, chạy bước 5
> rồi dừng lại báo số component fail trước khi sửa hàng loạt.
