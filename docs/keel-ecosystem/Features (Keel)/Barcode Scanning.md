# Barcode Scanning

Uses `html5-qrcode` library (v2.x) for camera-based barcode scanning. All client-side, no API key needed.

## Dynamic Import

```js
const { Html5Qrcode } = await import("html5-qrcode")
```

Keeps the bundle small — the library is only loaded when the scanner is opened.

## Component

`BarcodeScanner.jsx`:
- Reusable modal with camera viewfinder
- Auto-detects barcodes on scan
- Returns scanned code via `onScan(code)` callback
- Close button to dismiss

## Category-Gated

Only shown when the shop's `businessCategory` is `"electricals"` or `"electronics"`:

```jsx
if (businessCategory !== "electricals" && businessCategory !== "electronics") return null
```

## Used In

| Component | Behavior |
|---|---|
| `AddProductModal` | Scan → auto-fill barcode field |
| `EditProductModal` | Scan → auto-fill barcode field |
| `LogSaleModal` | Scan → find product by barcode |
| `Inventory` | Barcode column in table + search by barcode |

## DB Migration

```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode text;
```
