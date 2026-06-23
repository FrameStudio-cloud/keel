# Shop Config

The file `config/shop.js` controls all shop-specific content. It's the only file that differs between deployments.

## Structure

```js
const shopConfig = {
  // Core
  name: "Zuri",                  // Shop display name
  nameAccent: "Fashion",         // Accent word in name
  tagline: "Dress to Impress",   // Short tagline
  description: "..." ,            // Meta description
  about: "..." ,                  // About text (paragraph)
  aboutExtra: "..." ,             // Secondary about text
  heroTag: "New Collection 2026", // Label on hero
  catalogueTag: "Our Collection", // Section label
  catalogueTitle: "Latest Catalogue",
  catalogueDescription: "...",

  // Contact
  whatsapp: "254712345678",      // WhatsApp number (no +)
  email: "hello@zurifashion.co.ke",
  location: "Westlands, Nairobi, Kenya",
  hours: "Mon - Sat: 9am - 7pm", // String or array of {day, time}

  // Social
  instagram: "https://...",
  facebook: "https://...",
  tiktok: "https://...",

  // Stats (displayed in about section)
  stats: [
    { number: "500+", label: "Happy Clients" },
    { number: "200+", label: "Products" },
    { number: "5★", label: "Rating" },
  ],

  // Hero slideshow
  slides: [
    {
      id: 1,
      image: "https://...",
      tag: "New Arrivals",
      title: "Dress to",
      titleAccent: "Impress",
      description: "...",
      buttonText: "Shop Now",
      buttonLink: "#catalogue",
    },
  ],

  // Features grid (icon + text)
  features: [
    { icon: "🌿", text: "Locally sourced" },
  ],

  // Timeline (about page)
  timeline: [
    { year: "2019", title: "How It Started", side: "left", description: "..." },
  ],
}

export default shopConfig
```

## Per-Deployment Differences

| Field | Zuri (phase2) | Electricals | Wix (Lumière Hair) |
|---|---|---|---|
| `name` | "Zuri" | "..." | "Lumière Hair" |
| `tagline` | "Dress to Impress" | "..." | "Premium Virgin Hair Extensions" |
| `hours` | String format | String format | Array of `{day, time}` |
| `slides` | 3 slides | Custom | 1 slide |
| `about` | Simple paragraphs | Custom | Object with `headline`, `story`, `mission`, `stats`, `values` |
| `features` | Array of `{icon, text}` | Custom | Not present |
| `timeline` | Array of events | Custom | Not present |

## Wix-specific Structure

The Wix deployment uses an extended `about` object instead of flat fields:

```js
about: {
  headline: "Born from a love of effortless beauty",
  story: "...",
  mission: "Real hair. Real quality. Real women.",
  stats: [{ value: "500+", label: "Happy Clients" }, ...],
  values: [{ title: "Ethically Sourced", body: "..." }, ...],
},
```

The components in each deployment handle both formats gracefully.

## Shop Resolution

The mini-catalogue resolves which shop to display data for via:
1. `VITE_SHOP_SLUG` environment variable (if set)
2. Automatic hostname lookup via `store_settings.website_url`
3. Falls back to config file data

Lib file: `src/lib/shop.js`
