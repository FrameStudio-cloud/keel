# New Shop Onboarding

Flow from signup to live mini-catalogue.

## Step 1: Sign Up

User visits `/login` and creates an account (email/password or Google OAuth).

1. AuthContext signs up via direct `POST /auth/v1/signup`
2. `ensureUserRecords()` creates a `users` row linked to the auth user
3. Creates a `shops` row with a generated slug
4. Creates a `store_settings` row with defaults (theme: `"light"`, currency: `"KSh"`)
5. Redirects to `/setup` (SetupWizard)

## Step 2: Setup Wizard

User fills in:
- Store name
- Business category (clothing, electronics, electricals, general)
- Phone number
- Default payment method

On save: upserts `store_settings` with `onConflict: "shop_id"`. Redirects to `/`.

## Step 3: Add Products

User navigates to `/inventory` and adds products:
- Name, price, stock, cost price, category
- Variant attributes (dynamic — depends on business category)
- Barcode (optional, for electricals/electronics)
- Image (optional)

## Step 4: Publish to Catalogue

Each product has a "Publish" button that creates a catalogue entry (copies product data to `catalogue` table with `shop_id` filter).

## Step 5: Configure Website

In `/website` tab:
- **Listings**: Manage published catalogue items
- **Banners**: Hero/sale/info/alert banners for the storefront
- **Business Info**: Store name, phone, address, hours, WhatsApp number
- **Gallery**: Upload images for the gallery section

## Step 6: Go Live

The mini-catalogue reads shop settings + catalogue items from the same Supabase project. As long as `VITE_SHOP_SLUG` or hostname resolves to the correct shop, the storefront shows live data immediately.

## Migration Path (Existing Shops)

For shops migrating from static config:
1. Import catalogue data from `config/catalogue.js` into the `catalogue` table
2. Set `store_settings.website_url` to the shop's domain
3. Deploy mini-catalogue with `VITE_SHOP_SLUG` set
