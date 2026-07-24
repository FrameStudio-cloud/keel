# Database Audit — Keel (hmcowpwfefeeossztuem)

**Date:** 2026-07-24 | **Tables:** 30 | **Migrations:** 55 | **Shops:** 6

---

## 1. RLS & Access Control

### Critical (must fix)

| Issue | Table(s) | Impact |
|---|---|---|
| **RLS disabled** | `shops`, `mpesa_transactions` | Anyone with anon key can read/write every row. `shops` contains subscription data, `mpesa_transactions` contains financial records. |
| **Anon full access** | `keel_shops`, `keel_approvals`, `keel_activity_log`, `chat_config` | These tables have `USING (true)` policies for the `anon` role on ALL operations (SELECT/INSERT/UPDATE/DELETE). Anyone with the anon key can read or modify framestudio monitoring data and chat configuration. |

### High (should fix)

| Issue | Detail |
|---|---|
| **SECURITY DEFINER exposed** | 8 functions are `SECURITY DEFINER` and executable by `anon` or `authenticated` roles: `auto_close_expired_subscriptions`, `cleanup_expired_shops`, `get_dashboard_summary`, `get_profit_margins`, `merge_onboarding_progress`, `sync_shops_to_keel_shops`, `cron_send_daily_summaries`, `cron_send_weekly_reports`. Cron-only functions should have `EXECUTE` revoked from anon/authenticated. |
| **Mutable search_path** | `cron_send_daily_summaries` and `cron_send_weekly_reports` set `search_path TO 'public'` (role-mutable, enables search_path hijacking). `get_dashboard_summary` (2-param version) and `sync_shops_to_keel_shops` have no search_path set at all. |
| **Leaked password protection** | Disabled in Auth settings. |

### Low

| Issue | Detail |
|---|---|
| **Policy naming inconsistency** | Most tables use `"Tenant isolation"` (single policy per table, ALL commands). Newer tables use `tenant_isolation_*_select/insert/update/delete` (per-command). Consolidate to one convention. |
| **`chat_config` double policies** | Has both `"Tenant isolation"` (authenticated) and `"Anon admin access"` (anon, `true`). Anon policy effectively bypasses tenant isolation. |
| **`users` table anon SELECT** | `anon can read users` policy allows any anon to query the `users` table (exposes `auth_user_id` ↔ `shop_id` mapping). |

---

## 2. Indexing

### Duplicate indexes (remove)

| Table | Indexes | Issue |
|---|---|---|
| `shops` | `shops_slug_idx` + `shops_slug_key` | Both are UNIQUE btree on `slug`. `shops_slug_idx` should be dropped. |
| `store_settings` | `store_settings_shop_id_idx` + `store_settings_shop_id_key` | Both are UNIQUE btree on `shop_id`. The `_idx` variant should be dropped. |

### Redundant indexes

| Table | Index | Redundant because |
|---|---|---|
| `services` | `idx_services_shop_id` (single on `shop_id`) | `idx_services_shop_category` covers `(shop_id, category)` queries, and the unique constraint covers `(shop_id, category, name)`. The single-column index provides no additional benefit. |

### Missing compound indexes

| Query Pattern | Missing Index |
|---|---|
| `service_orders` filtered by `status` + `shop_id` | `idx_service_orders_shop_status ON service_orders(shop_id, status)` — current separate indexes miss this common filter. |
| `service_orders` filtered by `customer_id` + `shop_id` | `idx_service_orders_shop_customer ON service_orders(shop_id, customer_id)` — the current `idx_service_orders_customer_id` doesn't include `shop_id`, forcing a filter. |
| `services` query by `shop_id` + `visible` | Query filters `visible=true` + `shop_id`, but neither index includes `visible`. |

### Overall index health

**Good:** 10+ compound `(shop_id, created_at DESC)` indexes on high-volume tables (products, sales, catalogue, expenses, stock_movements, page_views, payments, posts). `service_orders` has individual indexes on shop_id, status, customer_id, and created_at.

**Score:** 7/10 — duplicates and missing coverage on service tables.

---

## 3. Schema Design & Constraints

### Good practices

- All tables use UUID PKs with `gen_random_uuid()` defaults.
- All tenant-scoped tables have `shop_id UUID NOT NULL` with FK to `shops(id)`.
- CHECK constraints on `service_orders.status` (5 valid values) and `services.pricing_mode` (4 valid values).
- `service_orders.status_history` uses JSONB for flexible audit trail.
- `category_attributes.type` has a CHECK constraint limiting to `select/text/number`.
- Unique constraints exist on critical pairs: `product_attribute_values(product_id, attribute_id)`, `catalogue_attribute_values(catalogue_id, attribute_id)`, `announcement_dismissals(announcement_id, shop_id)`.

### Missing constraints

| Table | Column(s) | Missing |
|---|---|---|
| `banners.type` | `text` | No CHECK — values like `hero/sale/info/alert` should be constrained. |
| `sales.method` | `text` | No CHECK — payment method strings could drift from valid values. |
| `posts.platform` | `text` | No CHECK — platform names are free text. |
| `chat_config.position` | `text` | No CHECK — expected `left/right` but any string accepted. |
| `payments.invoice_id` | `text, nullable` | Should be `UUID` with FK to `sales.id` (or `service_orders.id`). Currently a free-text field with no referential integrity. |
| `customers.phone` | `text, nullable` | No UNIQUE constraint — prevents duplicate phone numbers within a shop. |
| `content_templates.platform` | `text, nullable` | No CHECK — expected to match `posts.platform` values. |

### Data type concerns

- `service_order_items.quantity` and `service_order_items.weight_kg` are `numeric` — should these be `integer` and `numeric(8,3)` respectively?
- `chat_messages.id`, `chat_faqs.id`, `chat_callbacks.id`, `chat_stock_alerts.id` use `bigint IDENTITY` instead of `UUID` — inconsistent with the rest of the schema.
- `sales.amount` is `numeric` (good), but `sales.quantity` is `integer` (fine).
- `store_settings` has 25 columns — borderline wide table. Consider splitting into `store_branding` (colors, logo, social), `store_contact` (phone, address, whatsapp), etc.

---

## 4. Functions & RPCs

### Overloaded `get_dashboard_summary`

Two versions exist:
1. `get_dashboard_summary(p_shop_id uuid, p_threshold int DEFAULT 6)` — **no search_path**, no SECURITY DEFINER, appears to be an older version.
2. `get_dashboard_summary(p_shop_id uuid)` — SECURITY DEFINER with `search_path = 'public'`.

The first version should be dropped — it's dead code and creates ambiguity.

### Cron function security

All 4 cron functions (`auto_close_expired_subscriptions`, `cleanup_expired_shops`, `cron_send_daily_summaries`, `cron_send_weekly_reports`) should have `REVOKE EXECUTE ON FUNCTION ... FROM anon, authenticated;` since they're only meant to be called by `pg_cron`.

### `sync_shops_to_keel_shops` security

This trigger function is SECURITY DEFINER with no search_path. It runs on INSERT/UPDATE/DELETE of `shops`. Malicious search_path hijacking could escalate privileges during trigger execution.

---

## 5. Migration Quality

### Issues

| Issue | Example |
|---|---|
| **Duplicate migration** | `create_get_profit_margins_rpc` applied twice (versions 20260618171748 and 20260618171800) — the second overwrote the first but both appear in the list. |
| **Inconsistent naming** | Mix of `initial_schema`, `20260709_create_announcements`, `20260710_add_scheduled_deletion`, and `announcements_add_variant_scheduling_dismissals` (no prefix). |
| **Unnecessary `.sql` in name** | `20260710_pro_chat_tables.sql` (the `.sql` suffix is redundant — all migrations are SQL). |
| **No down-migration support** | None of the 55 migrations have rollback scripts. |

### Strength

55 migrations applied cleanly in order. No failed migrations. All new tables follow the established `shop_id` + RLS pattern.

---

## 6. Storage

| Bucket | Policy | Issue |
|---|---|---|
| `product-images` | Public bucket with broad SELECT policy | `public_all` policy allows anyone to list all files in the bucket. Public buckets don't need this for URL access — it exposes filenames and paths. |

---

## 7. Overall Ratings

| Category | Score | Notes |
|---|---|---|
| **Security** | 5/10 | RLS disabled on 2 critical tables + anon full access on 4 keel tables + SECURITY DEFINER functions exposed to public |
| **Schema Design** | 7/10 | Solid multi-tenant foundation, good constraints on new tables, but drifting conventions and loose typing on older tables |
| **Indexing** | 7/10 | Good compound indexes on most query patterns, but 2+ duplicate indexes and missing coverage on service tables |
| **Migrations** | 7/10 | Well-structured with timestamps, clean history, but inconsistent naming and no rollback support |
| **Data Quality** | 6/10 | Only 6 shops (pre-production scale), some tables empty, no data validation beyond constraints |
| **Extensibility** | 8/10 | JSONB columns for flexible fields (variants, specs, business_hours, status_history, onboarding_progress), category system is fully data-driven |

**Overall:** 6.7/10 — Solid foundation with clear multi-tenant architecture. Security is the primary concern (5/10 drags the average down). Schema design and indexing are above average for an early-stage product. The most urgent work is RLS on `shops`/`mpesa_transactions`, revoking public access on `keel_*` tables, securing SECURITY DEFINER functions, and cleaning up dead function overloads.

---

## 8. Priority Action Items

### Applied (migration `20260724_db_audit_cleanup_p1_p2`)
- Dropped 3 duplicate/redundant indexes: `shops_slug_idx`, `store_settings_shop_id_idx`, `idx_services_shop_id`
- Dropped dead overloaded `get_dashboard_summary(p_shop_id uuid, p_threshold int)`
- Revoked EXECUTE on 4 cron functions from `anon`/`authenticated`
- Added CHECK constraints on `banners.type`, `sales.method` (normalized `"Bank"` → `"Bank Transfer"`), `posts.platform` (normalized to lowercase)
- Added compound indexes `idx_service_orders_shop_status` and `idx_service_orders_shop_customer`
- Added unique index `idx_customers_shop_phone` (non-null phones only)
- Secured `search_path` on `sync_shops_to_keel_shops()` trigger function

### Remaining

| Priority | Action | Effort | Blockers |
|---|---|---|---|
| P0 | Enable RLS on `shops` and `mpesa_transactions` with proper policies | 30 min | Signup chicken-and-egg problem on `shops` |
| P0 | Restrict `keel_*` + `chat_config` anon policies | 30 min | Framestudio dashboard may depend on anon access |
| P2 | Convert `payments.invoice_id` to UUID FK | 20 min | None |
