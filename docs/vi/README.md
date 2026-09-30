# genui-fw — Hướng dẫn sử dụng (tiếng Việt)

Bản đầy đủ tiếng Anh ở [README gốc](../../README.md). Tài liệu này đi theo hành trình người dùng.

Framework ship **hợp đồng** component, không ship code. Agent của bạn viết code từ hợp đồng, mỗi
component một lần vào `ui/`, rồi ráp màn hình từ đó. Ba cửa kiểm tất định giữ agent trong khuôn.

```
Pha A  vật chất hoá   hợp đồng → agent viết ui/Button.tsx → fw verify Button
Pha B  ráp màn         mô tả màn → agent viết screens/home.ui.json → fw check screens/home.ui.json
                       → agent ráp src/screens/HomeScreen.tsx từ ui/ → fw check src/screens/HomeScreen.tsx
```

Bạn chỉ chạm ba chỗ: **mô tả app** trong `ui-spec/`, **một câu lệnh** cho agent, và **review**.

## 1. Cài

Node ≥ 20, project React TypeScript hoặc folder trống. Package đã có trên npm.

```sh
npm i -D @himz-genui/core @himz-genui/rules
npx fw init --agent claude --platform react --name "My Shop"
#            --agent cursor | codex | copilot      --create vite (scaffold Vite trước, chưa thử)
npm i -D vitest jsdom @testing-library/react @testing-library/user-event   # React: để fw verify chạy check hành vi
```

`fw init` còn thêm `test/fw/` vào `.gitignore` (test sinh ra, không commit) và, nếu project chưa có script test,
đặt `"test": "fw verify"`.

Sinh ra:

| Đường dẫn | Là gì | Ai sửa |
|---|---|---|
| `ui-rules/*.rule.ts` | 76 hợp đồng ship sẵn | không — override trong `ui-spec/components/` |
| `ui-spec/app.ts` | outline: mọi màn và component, theo tên | **bạn**, viết đầu tiên |
| `ui-spec/project.ts` | tên, nền tảng, agent, token, guard | **bạn** |
| `ui-spec/domain.ts` | kiểu dữ liệu nghiệp vụ | **bạn** |
| `ui-spec/screens/*.ts` | mỗi màn một file: thấy gì, làm được gì, đi tới đâu | **bạn** (hoặc agent viết nháp để bạn duyệt) |
| `ui-spec/strings/<lang>.ts` | chữ hiển thị theo từng ngôn ngữ (chỉ khi có `languages`) | agent thêm key, **bạn** duyệt bản dịch |
| `ui-spec/components/` | hợp đồng thêm | bạn / agent |
| `ui-spec/added/` | hợp đồng từ `fw add` | sinh, sửa được |
| `ui/` | code component | **agent**, qua `fw verify` |
| `screens/*.ui.json` | spec màn | **agent**, qua `fw check` |
| `src/screens/*.tsx` | code màn | **agent**, qua `fw check` |
| `src/` ngoài `screens/` | shell: router, store, main | bạn, viết tay, không lint |
| `ui.catalog.json`, file chỉ dẫn agent | sinh tự động mỗi lần chạy `fw` | không |

## 2. Mô tả app trong `ui-spec/`

**`app.ts`**: outline, viết **đầu tiên**. Liệt kê toàn bộ màn (mỗi màn một dòng mục đích) và toàn bộ
component app sẽ dùng. Mọi file khác (mô tả màn, spec, code màn) chỉ được dùng tên có ở đây.

```ts
export default defineApp({
  name: 'PokéCards Shop',
  screens: {
    Home: 'Duyệt và tìm thẻ, mở một thẻ, nhảy sang giỏ',
    Cart: 'Xem giỏ, đổi số lượng, sang checkout',
  },
  components: ['Container', 'Stack', 'TopBar', 'List', 'ListItem', 'Button', 'EmptyState', 'Stat'],
});
```

Mục có trong outline mà chưa làm chi tiết **không phải lỗi**. `fw check` in ra dòng tiến độ, ví dụ
`spec 1/3   todo: CardDetail, Cart`. Gõ sai tên ở đâu thì `fw check` gợi ý tên đúng (`itemlisst` →
*Did you mean "ListItem"?*, `stat` → *Wrong case: it is "Stat"*). Không có `app.ts` thì bỏ qua check
outline, project 1.0 vẫn chạy như cũ. Chốt: `npx fw check ui-spec/app.ts`.

**`project.ts`** — token và cấu hình. Component đọc token qua `ui/tokens.ts`, đổi ở đây là đổi hết.

```ts
export default defineProject({
  name: 'PokéCards Shop', platforms: ['react'], agent: 'claude',
  tokens: {
    color:   { primary: '#E3350D', danger: '#B91C1C', success: '#15803D', surface: '#FFFFFF', text: '#1F2937', muted: '#6B7280' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],      // spec ghi "gap": "4" nghĩa là 16px
    radius:  { sm: 4, md: 8, lg: 16, full: 9999 },
    font:    { body: 'Inter', heading: 'Inter' },
  },
  guards: ['requireCartNotEmpty'],                // màn chỉ gọi tên qua guard; thân viết tay
});
```

**`domain.ts`** — kiểu dữ liệu, tham chiếu bằng tên trong màn (`"Card[]"`).

```ts
export default defineDomain({
  Card: t.object({ id: t.string(), name: t.string(), priceLabel: t.string().desc('đã format, "$12.50"'), stock: t.number() }),
  Cart: t.object({ items: t.array(t.ref('CartItem')), subtotalLabel: t.string(), count: t.number() }),
});
```

Hệ kiểu `t`: `string number boolean`, `enum([...])`, `ref('Tên')`, `array(x)`, `object({...})`,
`.opt()` bỏ trống được, `.def(v)` mặc định, `.desc('...')` mô tả cho agent.

**`screens/cart.ts`**: mô tả một màn. Mỗi màn một file, **tên file là tên màn** (`card-detail.ts` là
`CardDetail`), mục đích màn đã có ở `app.ts`. Mỗi field trả lời một câu hỏi:

```ts
export default defineScreen({
  // Người dùng thấy gì trên màn này?
  shows: ['Mỗi món: ảnh nhỏ, tên, số lượng, thành tiền, nút xoá', 'Tạm tính và nút checkout'],

  // Làm được gì mà KHÔNG chuyển màn? tên action → làm gì
  local: { changeQty: 'đổi số lượng một món', removeItem: 'xoá một món' },

  // Trường hợp đặc biệt: tình huống → màn làm gì
  when: { 'giỏ trống': 'hiện empty state có nút "Continue shopping"; checkout bị khoá' },

  // Màn nhận dữ liệu gì? Kiểu lấy từ domain.ts
  data: { cart: 'Cart' },

  // Từ đây đi được tới đâu, bằng cách nào? màn đích → người dùng làm gì
  goTo: {
    CardDetail: 'bấm vào một món',
    Checkout: 'bấm Checkout',
    Home: { how: 'bấm Continue shopping', replace: true },
  },
});
```

| Field | Nghĩa | Bắt buộc |
|---|---|---|
| `shows` | người dùng thấy gì (tiếng người) | có |
| `local` | action không chuyển màn: tên → mô tả | không |
| `when` | trường hợp đặc biệt: tình huống → nên hiển thị gì | không |
| `data` | dữ liệu màn nhận: tên → kiểu (`"Card[]"`) | không |
| `goTo` | màn đích → cách đi: một chuỗi, hoặc `{ how, action?, replace?, modal? }` | không |
| `back` | không ghi = về màn trước · `false` = không có back · `'Home'` = về Home nếu không có màn trước | không |
| `params` | tham số màn nhận khi được mở; **chỉ khai ở màn nhận**, màn gọi không khai lại | không |
| `guard` | guard trong `project.ts` phải thỏa mới được vào màn | không |

**Điều hướng nằm luôn trong từng màn**, không còn file flow riêng:

- Mỗi màn đích trong `goTo` sinh ra một action `go<Tên màn>` (`goCheckout`). Muốn đặt tên khác (khi action
  làm nhiều việc hơn là chuyển màn) thì dùng `action`: `OrderSuccess: { how: 'bấm Place order', action: 'placeOrder', replace: true }`.
- Mọi màn tự có `goBack`, trừ màn đầu tiên trong outline và màn có `back: false`.
- Action của màn = action từ `goTo` + key của `local` + `goBack`. Spec chỉ được bind các action này và không
  phải khai lại.
- Màn đầu tiên trong `app.ts` là màn mở đầu. Màn không có `goTo` nào dẫn tới thì bị báo là không tới được.
- `fw check` in ra sơ đồ điều hướng suy từ các `goTo`/`back` để bạn nhìn tổng thể.

**Không biết viết gì?** Chỉ cần viết outline, rồi nhờ agent (*"Viết nháp mô tả màn Cart cho tôi duyệt"*).
Agent viết nháp `ui-spec/screens/<tên>.ts`, **kèm luôn kiểu dữ liệu còn thiếu trong `domain.ts`**, chạy `fw check`,
rồi đưa bạn duyệt cả hai trước khi làm spec. Việc chờ duyệt là chỉ dẫn trong rule của agent; `fw check` không ép
được bước này. Kiểu được dùng mà chưa khai hiện ở dòng tiến độ `domain   todo: Cart, CartItem`.

`shows`, `local`, `when` là để agent đọc. `fw check` kiểm cấu trúc và mọi cái tên (màn đích, action,
kiểu, guard), gõ sai có gợi ý *Did you mean*. Chốt: `npx fw check ui-spec/screens`.

**Project 1.0** (mô tả màn có `name` / `purpose` / `actions` / `needs` và file `ui-spec/flows/*.ts`) vẫn
chạy như cũ. Chỉ không được dùng lẫn cho cùng một màn.

## 3. Gọi agent

> Làm màn Home theo ui-spec/screens/home.ts

hoặc, khi mới có outline:

> Viết nháp mô tả màn Cart cho tôi duyệt

Agent đọc file chỉ dẫn sinh ra và tự đi hết Pha A, Pha B, lặp sửa tới khi mọi cửa kiểm pass. Bạn
chỉ theo dõi.

## 4. Pha A — agent vật chất hoá component

```sh
npx fw docs Button      # đọc hợp đồng
# viết ui/Button.tsx
npx fw verify Button    # tới khi PASS
```

Ví dụ lỗi thật:

```
error  ui/Button.tsx  props.variant
       missing enum member(s): 'ghost', 'danger' (got 'primary' | 'secondary')
error  ui/Button.tsx  props.loading
       missing prop (boolean)
FAIL  ui/Button.tsx  (2 errors, 0 warnings)
```

Quy ước: `ui/<Name>.tsx`, `export function <Name>(props: <Name>Props)`, event `x` → prop `onX`.
`fw verify` kiểm bề mặt (export, props, enum, handler, children), rồi **chạy check hành vi**: mỗi mục trong
`checks` của hợp đồng thành một test (`test/fw/`, vitest + Testing Library trên React, `flutter test` trên Flutter).
8 loại: `size`, `keepsSize`, `emits`, `neverEmits`, `role`, `key`, `rendersNothing`, `minTarget`. Lỗi báo ở `checks[i]`
kèm giá trị mong đợi và thực tế. React chạy jsdom (không có layout) nên check kích thước chỉ đo trên Flutter.
`level: 'warn'` chỉ cảnh báo. File trong `test/fw/` sinh lại mỗi lần chạy, đừng sửa tay.

## 5. Pha B — agent ráp màn

Agent viết spec `screens/home.ui.json`. **Bạn không cần viết hay đọc file này**; muốn xem agent dựng
màn ra sao thì chạy `npx fw docs Home` (xem bên dưới). Spec là danh sách phẳng, cha–con bằng id, event →
**tên** action. Giá trị prop là một trong:

| Viết | Nghĩa |
|---|---|
| literal | `"xl"`, `240`, `true` |
| `{ "path": "/card/set/name" }` | dữ liệu của màn; mỗi đoạn được kiểm kiểu theo `domain.ts` |
| `{ "path": "card/name" }` | phần tử hiện tại của `repeat` (không có `/` đầu) |
| `{ "i18n": "cart.line", "params": { … } }` | chữ đã dịch (chỉ cho prop chữ, xem mục đa ngôn ngữ) |

```json
"tile": { "type": "Card", "repeat": { "path": "/cards", "as": "card" }, "on": { "press": "goCardDetail" }, "children": ["name", "add"] },
"name": { "type": "Heading", "props": { "value": { "path": "card/name" }, "level": "3" } },
"add":  { "type": "Button", "props": { "label": { "i18n": "common.addToCart" } }, "on": { "press": "addToCart" } }
```

`repeat` lặp một phần tử cho từng món trong danh sách; bên trong đọc món đó bằng `card/…`.

```sh
npx fw check screens/home.ui.json
```

Bắt: component / prop / event lạ, thiếu prop bắt buộc, sai kiểu, bind sai hoặc field không có (có gợi ý),
repeat trên thứ không phải danh sách, key chữ không có, thiếu param, chữ viết cứng khi app có nhiều ngôn
ngữ, action chưa khai, Button lồng Button, List chứa Text, vòng, không tới được, component chưa vật chất
hoá. Mỗi lỗi có vị trí.

**Xem màn ở dạng dễ đọc:** `npx fw docs Cart` in mô tả màn, bố cục agent dựng (dạng cây) và màn đi tới:

```
Container
├─ TopBar   title "Giỏ hàng của bạn" · back → goHome
└─ Stack
   ├─ List
   │  └─ ListItem   for each /cart/items as line: title line/card/name · press → goCardDetail
   └─ Inline
      ├─ Stat   label "Tạm tính" · value /cart/subtotalLabel
      └─ Button   label "Thanh toán" · press → goCheckout
```

### Đa ngôn ngữ

App một ngôn ngữ không cần làm gì. Nhiều ngôn ngữ thì:

```ts
// ui-spec/project.ts
languages: ['en', 'vi'],       // ngôn ngữ đầu là mặc định
i18nLibrary: 'i18next',        // quy ước: code dịch bằng gì (thư viện, hoặc file tự viết)

// ui-spec/strings/vi.ts: mỗi ngôn ngữ một file, cùng bộ key
export default defineStrings({
  cart: { title: 'Giỏ hàng của bạn', line: '{set} · {condition} · {price} mỗi thẻ' },
});
```

- Contract đánh dấu prop người dùng đọc bằng `t.text()` (`label`, `title`, `description`, `placeholder`,
  `alt`…). `fw docs` hiện là *(text)*.
- Spec dùng `{ "i18n": "cart.title" }`; code màn gọi hàm dịch của project với cùng key.
- Agent thêm key mới vào ngôn ngữ mặc định, viết nháp bản dịch cho các ngôn ngữ khác và đưa bạn duyệt.
- `fw check` báo: thiếu file ngôn ngữ, thiếu bản dịch, key thừa, placeholder lệch nhau giữa các ngôn ngữ,
  key không có (có gợi ý), thiếu param, `i18n` trên prop không phải chữ, **chữ viết cứng** trong spec và
  code màn. Key không ai dùng là warning. Tiến độ có dòng `strings vi  34/35   todo: …`.
- Không bắt được: chữ đi qua biến hay `setState('…')`; warning key không dùng chỉ là gợi ý (chữ nào trong `src/` trùng key đều bị tính là có dùng); và giá trị mặc định trong contract (ví dụ
  `SearchBox.placeholder = 'Search'`, hãy truyền prop). Tiền, ngày, số do app tự format; dữ liệu từ API không dịch.
- Nâng từ 1.0: `ui-rules/` là bản copy, nên copy lại contract từ `node_modules/@himz-genui/rules/src/`
  để có `t.text()`.

Rồi ráp `src/screens/HomeScreen.tsx` chỉ import từ `ui/`:

```sh
npx fw check src/screens/HomeScreen.tsx
```

Lỗi khi có `<div>`, import component ngoài, hay khai component ngay trong file màn.

## 5b. Flutter

`fw init --platform flutter` trong một project Flutter (hoặc thêm `--create flutter` để tạo mới). `ui-spec/` và
spec màn giữ nguyên, chỉ phần code khác đi:

| | React | Flutter |
|---|---|---|
| component | `ui/ListItem.tsx` | `lib/ui/list_item.dart`, `class UiListItem` |
| màn | `src/screens/CartScreen.tsx` | `lib/screens/cart_screen.dart`, `class CartScreen` |
| token | import thẳng `project.ts` | `lib/ui/tokens.g.dart` (`UiTokens.colorPrimary`), fw tự sinh |
| chữ đã dịch | hàm dịch của project | `lib/l10n/strings.g.dart` (`UiStrings.cartEmptyTitle`), fw tự sinh |
| kiểm kiểu | `tsc` | `flutter analyze` |

- **Mọi class Flutter có tiền tố `Ui`**, vì 19 tên component trùng widget Flutter và `List` trùng `dart:core`.
- **`fw docs <Tên>` in đúng chữ ký Dart** (enum, class con, constructor, field, callback `onX`,
  `List<Widget> children`); agent chỉ viết `build()`. `fw verify` kiểm đúng chữ ký đó. Giá trị enum được đổi
  thành tên Dart: `'5:7'` → `v5x7`, `'oldest-first'` → `oldestFirst`.
- **Màn** chỉ import `lib/ui/ui.dart` (fw tự sinh) và các lớp nền `package:flutter/widgets.dart show StatelessWidget,
  StatefulWidget, State, Widget, BuildContext`. `fw check` báo: import `material.dart`, dùng widget ngoài `lib/ui/`
  (`Column`, `Text`, widget của thư viện khác), khai widget thứ hai trong file màn, và chữ viết cứng khi app có
  nhiều ngôn ngữ.
- File sinh tự động (`ui.dart`, `tokens.g.dart`, `strings.g.dart`) không cần gói pub nào; đừng sửa tay.
- Ví dụ: `examples/gallery-flutter` vật chất hoá cả 76 contract.

## 5c. Thư viện state và form

`fw` chỉ lo phần giao diện. Component nhận giá trị qua props và báo thay đổi qua `onX`, nên thư viện state hay
validation nào cũng dùng được: màn đọc state bằng hook hoặc hàm của thư viện, rồi truyền kết quả validate vào prop
`error` của ô nhập. Hook và hàm gọi (`useStore`, `useForm`, `context.watch`, `ref.watch`) không cần khai gì.

Riêng các **wrapper** mà thư viện bọc quanh UI (`BlocBuilder`, `Obx`, `<FormProvider>`…) thì được phép trong màn khi
`stateLibrary` trong `project.ts` có tên thư viện đó (`bloc`, `getx`, `mobx`, `riverpod`, `provider`, `signals`,
`react-hook-form`, `react-redux`, `jotai`, `@tanstack/react-query`), hoặc khi khai thêm trong `screenWrappers`.
UI bên trong wrapper vẫn phải lấy từ `ui/`: `BlocBuilder(builder: (_, s) => Text('…'))` vẫn bị báo ở `Text`.
Component tự vẽ ô nhập (như `Field` của Formik) không phải wrapper.

## 6. Kiểm hết trước khi commit

```sh
npx fw check
```

Chạy lần lượt: outline, mọi component trong `ui/`, mọi spec, mô tả màn và điều hướng, mọi màn trong
`src/screens/`. Sau đó in tiến độ từng mục trong outline (đã mô tả, có spec, có code, component đã có trong
`ui/`) và sơ đồ điều hướng,
dòng cuối `N failed, M passed`. Exit `0` sạch, `1` có lỗi, `2` dùng sai. Dùng thẳng trong CI.

`fw check` chỉ kiểm tĩnh, không chạy test. Check hành vi chạy bằng `npx fw verify` (thêm vào CI; Flutter cần
Flutter SDK trên máy CI).

## 7. Tình huống thường gặp

| Tình huống | Làm gì |
|---|---|
| Team đã có component / design system | `npx fw add src/legacy/PriceTag.tsx` (hoặc `lib/widgets/price_tag.dart`) — sinh hợp đồng trỏ về file gốc, không copy |
| Thêm màn / component mới | thêm tên vào `ui-spec/app.ts` trước, rồi mới làm chi tiết |
| Cần component chưa có hợp đồng | viết `ui-spec/components/<Name>.rule.ts`, rồi Pha A |
| Muốn đổi hợp đồng ship sẵn | tạo file cùng `name` trong `ui-spec/components/`, không sửa `ui-rules/` |
| Đổi màu / font | sửa `project.ts`; mọi lệnh `fw` tự sync |
| Nâng version hợp đồng | tăng `version`; `impl` cũ bị xoá, phải `fw verify` lại |
| Chỉ kiểm một phần | `fw check ui-spec/app.ts` · `fw check screens/` · `fw check src/screens/` · `fw check ui-spec/screens` |

## 8. Bảng lệnh

| Lệnh | Ai | Làm gì |
|---|---|---|
| `fw init --agent … --platform … [--name] [--create]` | bạn | khởi tạo |
| `fw add <file.tsx / file.dart> [--name]` | bạn | đăng ký component React / widget Flutter sẵn có |
| `fw check` | bạn / CI | kiểm hết |
| `fw check <path…>` | agent | kiểm spec, file màn, folder, `ui-spec/screens` hoặc `ui-spec/app.ts` theo đường dẫn |
| `fw docs <Name>` | agent | in hợp đồng |
| `fw verify [<Name>…]` | agent | kiểm component; không tên = tất cả |

Mọi lệnh tự làm mới `ui.catalog.json` và file chỉ dẫn trước khi chạy. Không có lệnh sync riêng.

## 9. Lỗi hay gặp

| Thông báo | Sửa |
|---|---|
| `No ui-spec/ folder found` | cd vào project hoặc `fw init` |
| `unknown component "X", not in the catalog. Did you mean "Y"?` | sửa tên theo gợi ý; nếu thật sự là component mới thì viết hợp đồng vào `ui-spec/components/` |
| `X is in the catalog but not in ui-spec/app.ts components` | thêm X vào `components` của outline |
| `screen "X" is not in ui-spec/app.ts screens` | sửa tên theo gợi ý, hoặc thêm màn vào outline |
| `"X" has no contract` (trong `app.ts`) | outline gõ sai tên, hoặc component mới chưa có hợp đồng |
| `…which lists "Buton" (no such contract). Fix the typo` | sửa lỗi gõ trong `app.ts`, đừng sửa các file đang dùng tên đúng |
| `X is not materialized for react yet` | Pha A cho X |
| `path "/x" does not resolve in screen data` | thêm vào `data` của `ui-spec/screens/<màn>.ts` |
| `action "x" is not declared for this screen` | thêm vào `goTo` hoặc `local` của `ui-spec/screens/<màn>.ts`, hoặc sửa tên theo gợi ý |
| `…has goTo.Chekout, which is not a screen. Fix the typo there` | sửa tên màn đích trong mô tả màn, đừng sửa spec |
| `X has no back (back: false…), so "goBack" does not exist here` | bỏ `goBack` khỏi spec, hoặc cho màn có back |
| `unknown field. Did you mean "shows"?` | sửa tên field trong mô tả màn |
| `Button may not be inside Button` | sửa cấu trúc |
| `raw markup outside ui/` | thay bằng component trong `ui/` |
| `imported from "…", which is not ui/ or a registered impl` | `fw add` nó, hoặc viết hợp đồng và vật chất hoá |
| `guard "x" is not declared` | thêm vào `guards` trong `project.ts` |
| `nothing to check in: …` | đường dẫn không phải `.ui.json`, `.tsx`, folder, `ui-spec/screens`, `ui-spec/flows` hay `ui-spec/app.ts` |
| tsc `TS5097 allowImportingTsExtensions` | từ 1.3 không cần nữa: nâng `@himz-genui/core` lên 1.3 |
| `behavioural checks need …` | cài `vitest jsdom @testing-library/react @testing-library/user-event` |

## 10. Giới hạn 1.3

React và Flutter. `fw verify` chạy check hành vi, nhưng 8 loại check chưa diễn đạt được: gõ chữ, mở danh sách
rồi chọn, kéo, bấm nút chỉ có icon, trạng thái aria (expanded, selected), role list / menu / combobox. Những cam
kết đó vẫn là chữ trong `rules` / `a11y`. React không có trình duyệt nên check kích thước chỉ chạy trên Flutter.
`fw add` đọc được component React (kể cả bọc MUI, shadcn `forwardRef`) và widget Flutter; prop kế thừa từ thư viện chỉ được liệt kê, bạn chọn cái nào đưa vào contract. `screenDirs` / `freeformDirs` trong `project.ts` quyết định thư mục nào áp luật màn (landing page để ở `freeformDirs`). Chưa có `defineShell`, `defineSources`, MCP. `--create flutter` đã thử; `--create vite/next` chưa. Bản 1.3.0 (check hành vi, core build sẵn ra JS) sau 1.2.0 (React và Flutter, 76 contract).
Hứa nhất quán **trong một project**, không hứa hai project ra code giống nhau.

## 10a. Theme (sáng / tối và các mode khác)

Token có 3 tầng: `primitives` (bảng màu gốc) → `semantic` (vai trò: `primary`, `onPrimary`, `surface`, `text`, `border`…,
cùng `space`, `radius`, `size`, `font`) → `modes` (trục bất kỳ: `colorScheme: { light, dark }`, `density`, `brand`…; mỗi mode
chỉ ghi phần khác). `fw` sinh `ui/tokens.css` + `ui/tokens.g.ts` (web: biến CSS, `setMode({ colorScheme: 'dark' })`) và
`lib/ui/theme.g.dart` (Flutter: `context.ui.color.x`, `uiTheme(colorScheme: …)`). `fw check` kiểm tham chiếu và **độ tương
phản WCAG ở mọi tổ hợp mode**; `fw verify` cấm màu viết cứng trong `ui/` và kiểm `tokenColor` theo từng mode trên Flutter.
Xuất / nhập JSON chuẩn W3C (`toDesignTokens` / `fromDesignTokens`) cho Figma / Style Dictionary. Chi tiết: mục **Theming**
của README gốc; nâng cấp từ 1.x: CHANGELOG 2.0.0.

## 10b. Tương thích package

Một luật cho cả hai nền tảng: **màn hình không được tạo UI lấy từ ngoài `ui/` (`lib/ui/`)**. Hook, lời gọi hàm,
accessor tĩnh (`X.of(context)`) và wrapper không vẽ gì đều tự do; kit UI thì bọc trong `ui/` hoặc `fw add`.
Bảng đầy đủ (đã test / chạy được / theo công thức / không hỗ trợ): mục **Compatibility** của README gốc.

| Nhóm | React | Flutter |
|---|---|---|
| State | Zustand, Redux, TanStack Query (đã test); Jotai, Recoil, MobX… | bloc, GetX, riverpod + hooks, flutter_hooks (đã test); provider, MobX, signals |
| Data | Apollo, SWR (đã test); urql, Relay | get_it (đã test) |
| Router | React Router (đã test); Next.js, TanStack Router theo công thức; `Link` bọc trong `ui/Link` | go_router, auto_route, Navigator (đã test) |
| Form | react-hook-form `Controller`, TanStack Form, Formik (đã test) | reactive_forms, flutter_form_builder (đã test) |
| i18n | react-intl (đã test); i18next, next-intl, Lingui | ARB / `AppLocalizations` (fw sinh ARB), easy_localization (đã test) |
| UI | MUI, shadcn qua `fw add` (thử tay với package thật); Tailwind / MUI theme lấy từ tokens | Material / Cupertino trong `lib/ui`; `uiTheme()` sinh từ tokens |
| Không hỗ trợ | React Native / Expo | màn tự dựng `Scaffold` (shell giữ `Scaffold`) |

"đã test" = có màn mẫu trong `tests/compat/` chạy mỗi lần `npm test` / `npm run test:flutter`.

## 11. Ví dụ

`examples/pokemon-shop`: outline, 5 mô tả màn kèm điều hướng, 5 spec, 22 component, 5 màn, shell Vite có router và
store, `.fixtures/` cố tình sai.

```sh
cd examples/pokemon-shop
npm run check                                  # 42 passed
npx vite                                       # mở http://localhost:5173
node ../../packages/core/bin/fw.js check .fixtures   # 2 failed, cố tình
```
