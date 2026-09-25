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
```

Sinh ra:

| Đường dẫn | Là gì | Ai sửa |
|---|---|---|
| `ui-rules/*.rule.ts` | 29 hợp đồng ship sẵn | không — override trong `ui-spec/components/` |
| `ui-spec/project.ts` | tên, nền tảng, agent, token, guard | **bạn** |
| `ui-spec/domain.ts` | kiểu dữ liệu nghiệp vụ | **bạn** |
| `ui-spec/flows/*.ts` | màn nào đi đâu khi action gì | **bạn** |
| `ui-spec/screens/*.ts` | mô tả từng màn | **bạn** |
| `ui-spec/components/` | hợp đồng thêm | bạn / agent |
| `ui-spec/added/` | hợp đồng từ `fw add` | sinh, sửa được |
| `ui/` | code component | **agent**, qua `fw verify` |
| `screens/*.ui.json` | spec màn | **agent**, qua `fw check` |
| `src/screens/*.tsx` | code màn | **agent**, qua `fw check` |
| `src/` ngoài `screens/` | shell: router, store, main | bạn, viết tay, không lint |
| `ui.catalog.json`, file chỉ dẫn agent | sinh tự động mỗi lần chạy `fw` | không |

## 2. Mô tả app trong `ui-spec/`

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
  guards: ['requireCartNotEmpty'],                // flow chỉ gọi tên; thân viết tay
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

**`flows/shop.ts`** — điều hướng. Action không có trong `on` là action nội bộ, không cần khai.

```ts
export default defineFlow({
  name: 'Shop', entry: 'Home',
  screens: {
    Home:     { on: { openCard: { go: 'CardDetail', params: { cardId: 'string' } }, openCart: { go: 'Cart' } } },
    CardDetail: { params: { cardId: 'string' }, back: 'Home', on: { goBack: { back: true } } },
    Cart:     { back: 'Home', on: { checkout: { go: 'Checkout' } } },
    Checkout: { guard: 'requireCartNotEmpty', on: { placeOrder: { go: 'OrderSuccess', mode: 'replace', params: { orderId: 'string' } } } },
  },
});
```

**`screens/home.ts`** — mô tả màn. `data` và `actions` là những tên duy nhất agent được bind.

```ts
export default defineScreen({
  name: 'Home',
  purpose: 'Duyệt và tìm thẻ, mở một thẻ, nhảy sang giỏ.',
  data: { cards: 'Card[]', cartCount: 'number', page: 'number', pageCount: 'number' },
  actions: ['openCard', 'openCart', 'search', 'changePage', 'addToCart'],
  needs: ['Top bar có tên shop và nút giỏ', 'Grid thẻ: ảnh, tên, badge độ hiếm, giá, nút thêm', 'Pagination dưới grid'],
});
```

Chốt: `npx fw check ui-spec/flows`.

## 3. Gọi agent

> Làm màn Home theo ui-spec/screens/home.ts

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
`fw verify` v1 kiểm bề mặt (export, props, enum, handler, children), chưa kiểm hành vi.

## 5. Pha B — agent ráp màn

Viết spec `screens/home.ui.json`: danh sách phẳng, cha–con bằng id, prop là literal hoặc
`{ "path": "/tênData" }`, event → **tên** action.

```json
"add":   { "type": "Button", "props": { "label": "Add to cart", "size": "sm" }, "on": { "press": "addToCart" } },
"pager": { "type": "Pagination", "props": { "page": { "path": "/page" }, "pageCount": { "path": "/pageCount" } }, "on": { "change": "changePage" } }
```

```sh
npx fw check screens/home.ui.json
```

Bắt: component / prop / event lạ, thiếu prop bắt buộc, sai kiểu, bind sai, action chưa khai, Button
lồng Button, List chứa Text, vòng, không tới được, component chưa vật chất hoá. Mỗi lỗi có vị trí.

Rồi ráp `src/screens/HomeScreen.tsx` chỉ import từ `ui/`:

```sh
npx fw check src/screens/HomeScreen.tsx
```

Lỗi khi có `<div>`, import component ngoài, hay khai component ngay trong file màn.

## 6. Kiểm hết trước khi commit

```sh
npx fw check
```

Chạy lần lượt: mọi component trong `ui/`, mọi spec, flow, mọi màn trong `src/screens/`. Dòng cuối
`N failed, M passed`. Exit `0` sạch, `1` có lỗi, `2` dùng sai. Dùng thẳng trong CI.

## 7. Tình huống thường gặp

| Tình huống | Làm gì |
|---|---|
| Team đã có component | `npx fw add src/legacy/PriceTag.tsx` — sinh hợp đồng trỏ về file gốc, không copy |
| Cần component chưa có hợp đồng | viết `ui-spec/components/<Name>.rule.ts`, rồi Pha A |
| Muốn đổi hợp đồng ship sẵn | tạo file cùng `name` trong `ui-spec/components/`, không sửa `ui-rules/` |
| Đổi màu / font | sửa `project.ts`; mọi lệnh `fw` tự sync |
| Nâng version hợp đồng | tăng `version`; `impl` cũ bị xoá, phải `fw verify` lại |
| Chỉ kiểm một phần | `fw check screens/` · `fw check src/screens/` · `fw check ui-spec/flows` |

## 8. Bảng lệnh

| Lệnh | Ai | Làm gì |
|---|---|---|
| `fw init --agent … --platform … [--name] [--create]` | bạn | khởi tạo |
| `fw add <file.tsx> [--name]` | bạn | đăng ký component sẵn có |
| `fw check` | bạn / CI | kiểm hết |
| `fw check <path…>` | agent | kiểm spec, file màn, folder, hoặc flows theo đường dẫn |
| `fw docs <Name>` | agent | in hợp đồng |
| `fw verify [<Name>…]` | agent | kiểm component; không tên = tất cả |

Mọi lệnh tự làm mới `ui.catalog.json` và file chỉ dẫn trước khi chạy. Không có lệnh sync riêng.

## 9. Lỗi hay gặp

| Thông báo | Sửa |
|---|---|
| `No ui-spec/ folder found` | cd vào project hoặc `fw init` |
| `unknown component "X" — not in catalog` | viết hợp đồng vào `ui-spec/components/`, hoặc dùng cái có sẵn |
| `X is not materialized for react yet` | Pha A cho X |
| `path "/x" does not resolve in screen data` | thêm vào `data` của spec và của `ui-spec/screens/<màn>.ts` |
| `action "x" is not declared` | thêm vào `actions` |
| `Button may not be inside Button` | sửa cấu trúc |
| `raw markup outside ui/` | thay bằng component trong `ui/` |
| `imported from "…", which is not ui/ or a registered impl` | `fw add` nó, hoặc viết hợp đồng và vật chất hoá |
| `guard "x" is not declared` | thêm vào `guards` trong `project.ts` |
| `nothing to check in: …` | đường dẫn không phải `.ui.json`, `.tsx`, folder hay `ui-spec/flows` |
| tsc `TS5097 allowImportingTsExtensions` | thêm `"allowImportingTsExtensions": true` vào tsconfig |

## 10. Giới hạn 1.0

Chỉ React. `fw verify` kiểm bề mặt. Chưa có `defineShell`, `defineSources`, MCP. `--create` chưa thử. Đã publish npm 25/09/2026.
Hứa nhất quán **trong một project**, không hứa hai project ra code giống nhau.

## 11. Ví dụ

`examples/pokemon-shop`: 5 mô tả màn, 1 flow, 5 spec, 25 component, 5 màn, shell Vite có router và
store, `.fixtures/` cố tình sai.

```sh
cd examples/pokemon-shop
npm run check                                  # 36 passed
npx vite                                       # mở http://localhost:5173
node ../../packages/core/bin/fw.js check .fixtures   # 2 failed, cố tình
```
