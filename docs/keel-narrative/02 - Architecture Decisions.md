# 02 — Architecture Decisions

*Key architectural choices and their rationale.*

## Two-App Architecture

**Decision:** Split into Keel (dashboard) + Mini-Catalogue (public site)

**Why:**
- Keel uses Tailwind v4 (dark mode, modern CSS), mini-catalogue uses Tailwind v3 (stability)
- Customers should never see the dashboard loading spinner (384 KB recharts)
- Each mini-catalogue deployment can be independently customized per shop
- The public site needs to be lightweight and fast-loading

## No RLS / No GoTrueClient

**Decision:** Bypass GoTrueClient, disable RLS, use app-level multi-tenancy

**Why:**
- GoTrueClient `_recoverAndRefresh()` hangs on production page reload
- RLS requires `supabase.auth.getUser()` which is unavailable with `accessToken` approach
- All queries already filter by `shop_id` — RLS would add complexity without benefit

## Shared Database, Separate Deployments

**Decision:** Single Supabase database shared by all shops + all deployments

**Why:**
- Simpler than per-shop databases
- Easier migrations and backups
- Mini-catalogue reads from the same tables Keel writes to
- Multi-tenancy via `shop_id` is well-established

## Data-Driven Attribute System

**Decision:** EAV tables instead of hardcoded if/else variant logic

**Why:**
- Adding a new business category (like Wigs) needs zero code changes
- Shop owners with different product types need different attribute fields
- Same pattern as e-commerce platforms (WooCommerce, Shopify)

## No TypeScript

**Decision:** Plain JavaScript everywhere

**Why:**
- Faster development iteration
- No build step complexity for type generation
- Team preference / simpler mental model for target audience
