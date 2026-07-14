# Storefront Overhaul Plan

Goal: Turn the generated mini-catalogue storefronts from a static brochure into a properly functional, well-designed e-commerce site — plus add a clothing/fashion template.

cite-ui is already on npm (v1.1.0, `npm view cite-ui`).

---

## ✅ Phase 1 — cite-ui audit & improvements (Complete)

### Bug fixes

| Component | Bug | Fix |
|---|---|---|
| `Hero` | Slideshow renders `h-screen` with broken `<img src="">` when no banner image | Added fallback gradient + `min-h-[60vh]`; normalized `image` prop (string → `{src}`) |
| `CatalogueCard` | Never renders `specs`, `variants`, or `includes` from catalogue data | Added spec badges, color swatches, includes list, `onClick` handler, `loading="lazy"` |
| `CatalogueGrid` | `SearchBar` imported but no filtering state wired | Integrated full search + category filter state; external/internal mode for controlled/uncontrolled |
| `Navbar` | `brand` prop passed but component reads `logo`; dead `cartCount`/`onCartClick` | Accepts `brand` as alias for `logo`; removed dead cart props |

### Design refresh

- `Grid`: replaced dynamic `gap-${gap}` with gap map (Tailwind v3 safelist-safe)
- `BackToTop`: fixed invalid `w-13` → `w-12`

### New components

| Component | Purpose | Status |
|---|---|---|
| `ImageWithFallback` | Renders image with category-colored gradient SVG placeholder on error/missing | Built |
| `VariantPicker` | Color swatches + size/option selector | Built |
| `CategoryFilter` | Row of filter pills/chips for categories | Built |
| `ProductDetail` | Full product page — image, specs, variants, description, WhatsApp CTA | Built |

### Published

- cite-ui v1.2.0 built (user to publish — npm OTP required)
- Both repos committed + pushed

---

## ✅ Phase 2 — Classic template overhaul (Complete)

Template directory: `storefront-provisioner/src/templates/classic/`

### Changes made

| Change | Files | Details |
|---|---|---|
| React Router | `package.json.ejs`, `main.jsx.ejs`, `App.jsx.ejs` | `BrowserRouter` in main.jsx; `Routes`/`Route` for `/` and `/product/:id` in App.jsx |
| Product detail | `App.jsx.ejs` | New `ProductPage` component with `useParams()`, `ProductDetail`, WhatsApp CTA with pre-filled message, `useEffect` for document.title |
| Search + filter | `App.jsx.ejs` | `CatalogueGrid` with `searchable` prop, `searchPlaceholder`, `onItemClick` for client-side navigation |
| Hero fix | cite-ui `Hero/index.jsx` | `min-h-[60vh]` instead of `h-screen`; fallback gradient when `slide.image` is empty |
| Image placeholders | cite-ui `ImageWithFallback/index.jsx` | Category-colored gradient SVG placeholder with icon overlay |
| About section | `App.jsx.ejs`, `renderer.js`, `site.js.ejs` | Conditionally renders "About {name}" section when `description` is non-empty |
| Brand colors | `index.html.ejs`, `renderer.js` | CSS custom properties `--color-primary` and `--color-accent` injected via `<style>` in HTML head |
| JSON-LD | `index.html.ejs` | `Store` schema with name, description, URL, contactPoint, address |
| Currency | `renderer.js`, `site.js.ejs`, `App.jsx.ejs` | `currency_symbol` from settings passed through to `ProductDetail.currency` |
| Navbar fix | `App.jsx.ejs` | Passes `logo={c.name}` instead of `brand`; uses SPA `navigate()` for internal links |
| Section fix | `App.jsx.ejs` | Title/subtitle rendered inline instead of as unused Section props |
| Footer fix | (already correct) | Contact items already use `value` key — no change needed |

### Effort: 1 session (done)

---

## ✅ Phase 3 — New Clothing/Fashion template (Complete)

New directory: `storefront-provisioner/src/templates/clothing/`

### Structure

| Section | Implementation | Details |
|---|---|---|
| Lookbook hero | `Hero variant="split" imagePosition="left"` | 2-col: fashion image or gradient left, brand + tagline + CTAs right |
| Category strips | Custom horizontal scroll with `Icon` + count | Extracts unique categories from catalogue data; snap-scroll on mobile |
| New Arrivals | Horizontal scroll of `CatalogueCard` | Filters by `featured` flag; `badge="New"` on cards |
| Featured Collection | Full-width black Section with CTA | Centered heading + description + "Explore Collection" button |
| All Products | `CatalogueGrid` with `searchable` | Full search + category filter; onItemClick navigates to /product/:id |
| Product detail | `ProductDetail` at `/product/:id` | Image, specs, variants, WhatsApp CTA, back button |
| Footer | `Footer` with `social` links | Social links from `socialLinks` config (empty for now — no migration needed) |

### Files created (16 total in `src/templates/clothing/`)

| File | Type |
|---|---|
| `package.json.ejs` | Dependencies (react-router-dom, cite-ui ^1.2.0) |
| `index.html.ejs` | ClothingStore JSON-LD, og:title "Fashion Storefront" |
| `src/main.jsx.ejs` | BrowserRouter wrapper |
| `src/App.jsx.ejs` | Full layout: hero, categories, arrivals, featured, catalogue, detail |
| `src/config/site.js.ejs` | Config with socialLinks, websiteUrl |
| `src/lib/supabase.js.ejs` | Supabase client factory |
| `src/lib/shop.js.ejs` | Shop ID helpers (maybeSingle) |
| `src/styles.css.ejs` | Tailwind directives |
| `tailwind.config.js.ejs` | Animation keyframes + cite-ui content scan |
| `vite.config.js.ejs`, `postcss.config.js.ejs`, `vercel.json.ejs`, `.gitignore.ejs` | Build config |

### renderer.js changes
- Added `websiteUrl` field (from settings.website_url)
- Added `socialLinks` field (empty array — ready for future social_links column)

### Effort: 1 session (done)

---

## Phase 4 — Keel integration

### TemplateModal update
- Show both templates with: name, description, small preview thumbnail
- Classic: "Clean & professional — works for any shop"
- Clothing: "Lookbook style — perfect for fashion & apparel"
- Default selection based on shop's business_category

### "Refresh catalogue" button
- Add button to deployed status card: "Update catalogue" (re-runs provisioner with same template)
- Button triggers `POST /provision` with existing shop data
- Keel shows progress modal during redeploy

### Effort: 1 session

---

## Remaining: Phase 4 — Keel integration

| Task | Details |
|---|---|
| TemplateModal update | Show both templates (classic + clothing) with name, description, preview |
| Auto-select | Default based on `business_category` (clothing → clothing template) |
| Refresh button | "Update catalogue" on deployed status card → re-runs provisioner |
| Plan guard | Already works — planTier from chat_config.plan_tier |

### Effort: 1 session

---

## Decisions made

1. ✅ **cite-ui v1.2.0** — published by user
2. ✅ **Template priority** — Phase 2 (classic) before Phase 3 (clothing)
3. 🔲 **Default template logic** — TBD in Phase 4
4. 🔲 **Catalogue refresh** — Manual button per plan

---

## Total: 3/4 sessions done
