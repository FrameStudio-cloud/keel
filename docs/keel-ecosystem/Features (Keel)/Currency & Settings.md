# Currency & Settings

## Settings Context

Settings are fetched once by `SettingsProvider` (wraps the entire app) and consumed via `useSettings()` hook.

```jsx
const { storeName, currencySymbol, lowStockThreshold, theme, businessCategory } = useSettings();
```

### What SettingsProvider Does

1. On mount: fetches `store_settings` row + shop `business_category`
2. Applies side-effects:
   - Theme class on `<html>` (`.dark` toggle)
   - Currency symbol → module-level singleton in `src/lib/format.js`
   - Payment methods → `paymentConfig` singleton in `src/payment/paymentConfig.js`
3. Provides all settings via React context

## Currency Singleton

Currency is stored as a module-level variable in `src/lib/format.js`, not in React state or context:

```js
let currencySymbol = "KSh"

export function setCurrency(symbol) { currencySymbol = symbol }
export function getCurrency() { return currencySymbol }

export function formatPrice(amount) {
  return `${currencySymbol} ${Number(amount).toLocaleString()}`
}
```

This means any module can import `formatPrice` without needing React context — it reads the latest symbol from the module variable. `SettingsProvider` calls `setCurrency()` when settings load.

## Payment Methods

Payments are dynamic — stored in `store_settings.payment_methods` (JSONB array) and loaded into a `paymentConfig` singleton:

```js
// src/payment/paymentConfig.js
let methods = ["Cash", "M-Pesa"]

export function setPaymentConfig(settings) { /* ... */ }
export function getPaymentMethods() { return methods }
export function getDefaultPayment() { return methods[0] }
```

## Settings Page

`/settings` is a flat-scroll form. Reads initial values from `useSettings()`. Upserts use `onConflict: "shop_id"`. No re-fetch on mount (values come from context).

Fields:
- Store name, phone, address
- Currency symbol
- Low stock threshold
- Default payment method
- Receipt footer
- Theme toggle
- WhatsApp number
- Website URL
- Business hours (JSONB)
- Data export (Promise.allSettled)
- Link to `/terms`

## Key Files

| File | Purpose |
|---|---|
| `src/context/SettingsProvider.jsx` | Fetches settings, applies side-effects |
| `src/context/settingsContext.js` | Context + provider, default theme "light" |
| `src/lib/format.js` | Currency singleton, formatPrice |
| `src/payment/paymentConfig.js` | Payment methods singleton |
