# 03 — Ideas That Never Shipped

*Features, approaches, and directions considered but not implemented. Fill in what you remember.*

## Documented Ideas

- **IntaSend payment integration** — Was mentioned in earlier docs and seed files, later removed entirely (now uses dynamic `payment_methods` from settings)
- **Per-shop databases** — Considered instead of shared database with `shop_id`, rejected for simplicity
- **CSS variables for dark mode** — Considered instead of `dark:` Tailwind variants, rejected in favor of consistency with Tailwind v4 patterns
- **`supabase.auth` approach** — Abandoned after GoTrueClient hang in production builds

## Questions

- Were there any other payment providers considered (M-Pesa API, Stripe, etc.)?
- Was there ever a mobile app planned?
- What about barcode scanning via a dedicated hardware scanner vs. camera?
- Were there any Shopify/WooCommerce import features discussed?
- What about multi-language support (Swahili + English)?
