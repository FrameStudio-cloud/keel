// ── SECTION OPTIONS (shared by all templates) ──
export const SECTION_OPTIONS = {
  navbar: [
    { id: "transparent", name: "Transparent", description: "Scroll-aware — starts transparent, turns solid on scroll" },
    { id: "solid", name: "Solid", description: "Always has a solid background, good for dark hero sections" },
  ],
  hero: [
    { id: "slideshow", name: "Slideshow", description: "Full-bleed image carousel with auto-advance and dot navigation" },
    { id: "static", name: "Static Gradient", description: "Gradient background with subtle pattern overlay and CTA" },
    { id: "split", name: "Split Layout", description: "Left text, right image — ideal for fashion lookbooks" },
  ],
  catalogue: [
    { id: "grid", name: "Grid", description: "Searchable 2-4 column grid with category filter chips" },
    { id: "carousel", name: "Carousel", description: "Horizontal scroll — best for featured or new arrivals" },
  ],
  footer: [
    { id: "4-column", name: "4-Column", description: "Brand info, contact details, business hours, social links" },
    { id: "minimal", name: "Minimal", description: "Compact footer with just brand and copyright" },
  ],
}

// ── STEP CONFIG (section picker wizard) ──
const STEPS_CONFIG = [
  { key: "navbar", title: "Navbar", subtitle: "Choose how your navigation looks", optionsKey: "navbar" },
  { key: "hero", title: "Hero", subtitle: "Pick your hero section style", optionsKey: "hero" },
  { key: "catalogue", title: "Catalogue", subtitle: "How products are displayed", optionsKey: "catalogue" },
  { key: "footer", title: "Footer", subtitle: "Footer layout and content", optionsKey: "footer" },
  { key: "extras", title: "Extras", subtitle: "Toggle additional features", optionsKey: null },
]
export { STEPS_CONFIG }

// ── UI LIBRARIES (for output sites) ──
export const UI_LIBRARIES = {
  cite_ui: { name: "cite-ui", version: "^1.2.0", homepage: "https://www.npmjs.com/package/cite-ui" },
  heroui: { name: "@heroui/react", version: "^2.7.0", homepage: "https://www.heroui.com" },
  shadcn: { name: "shadcn/ui", version: "latest", homepage: "https://ui.shadcn.com" },
}
// ── THEME CAPABILITIES ──
export const THEME_CAPABILITIES = {
  none: { colors: false, fonts: false, spacing: false },
  basic: { colors: true, fonts: false, spacing: false },
  full: { colors: true, fonts: true, spacing: true },
}

// ── TEMPLATE REGISTRY (single source of truth) ──
const TEMPLATES_DATA = {
  classic: {
    id: "classic",
    name: "Classic",
    tagline: "Built for every shop — clean, fast, professional",
    description: "The Classic template gives you a hero slideshow, searchable product catalogue grid, announcement bars, WhatsApp integration, and a full contact footer with business hours. Works for any category — general, electronics, electricals, or clothing.",
    highlights: [
      "Full-screen hero with image slideshow or gradient fallback",
      "Searchable product grid with category filter chips",
      "Product detail pages with specs, includes list, WhatsApp order button",
      "Announcement bars for sales and promotions",
      "4-column footer with contact, hours, and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", desc: "Full storefront homepage with hero, catalogue grid, and footer", file: "/templates/classic-homepage.png" },
      { label: "Product Detail", desc: "Product page with specs, variants, and WhatsApp ordering", file: "/templates/classic-product-detail.png" },
    ],
    shopTypes: ["general", "electronics", "electricals", "clothing", "wigs", "shoes", "bags", "beauty", "health", "groceries", "furniture", "stationery", "books", "toys", "sports", "automotive"],
    defaultBlueprint: {
      navbar: "transparent", hero: "slideshow", catalogue: "grid", footer: "4-column",
      extras: { announcements: true, whatsapp: true, about: true, backToTop: true },
    },
    customizableSections: ["navbar", "hero", "catalogue", "footer", "extras"],
    uiLibrary: { id: "cite_ui", components: { hero: "Hero", card: "CatalogueCard", grid: "CatalogueGrid", navbar: "Navbar", footer: "Footer" } },
    themeCapabilities: "basic",
    toolchain: { ui: "heroui", icons: "lucide", fonts: ["Inter", "Outfit"] },
    provisionerTemplateId: "classic",
  },
  fashion: {
    id: "fashion",
    name: "Fashion",
    tagline: "Made for clothing and apparel — bold, visual, trendy",
    description: "The Fashion template features a lookbook-style split hero, horizontal category chips, a new-arrivals carousel, and a featured collection banner. Designed to showcase visual products like clothes, shoes, and accessories.",
    highlights: [
      "Split-layout hero with bold imagery and WhatsApp CTA",
      "Scrollable category chips with item counts",
      "New arrivals horizontal carousel for featured items",
      "Featured collection banner section",
      "Searchable product grid with category filtering",
      "WhatsApp ordering and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", desc: "Full storefront homepage with lookbook hero, category strip, and carousel", file: "/templates/fashion-homepage.png" },
      { label: "Product Detail", desc: "Product page with size/color options and WhatsApp ordering", file: "/templates/fashion-product-detail.png" },
    ],
    shopTypes: ["clothing", "wigs", "shoes", "bags", "beauty"],
    defaultBlueprint: {
      navbar: "solid", hero: "split", catalogue: "carousel", footer: "4-column",
      extras: { announcements: true, whatsapp: true, about: false, backToTop: true },
    },
    customizableSections: ["navbar", "hero", "catalogue", "footer", "extras"],
    uiLibrary: { id: "cite_ui", components: { hero: "Hero", card: "CatalogueCard", grid: "CatalogueGrid", navbar: "Navbar", footer: "Footer" } },
    themeCapabilities: "basic",
    toolchain: { ui: "heroui", icons: "lucide", fonts: ["Inter", "Outfit"] },
    provisionerTemplateId: "fashion",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    tagline: "No-fuss online presence — clean, fast, distraction-free",
    description: "The Minimal template strips away everything but the essentials: a gradient header banner with your store name and tagline, a searchable product grid with borderless cards, and a compact footer. No hero slideshow, no carousels — just products.",
    highlights: [
      "Gradient header banner with store name, tagline, and CTA",
      "Searchable product grid with clean borderless cards",
      "Category filter chips for easy browsing",
      "Product detail page with specs, options, and WhatsApp ordering",
      "Compact footer with contact info and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", desc: "Clean homepage with gradient banner, catalogue grid, and compact footer", file: "/templates/minimal-homepage.png" },
      { label: "Product Detail", desc: "Product page with specs, options, and WhatsApp ordering", file: "/templates/minimal-product-detail.png" },
    ],
    shopTypes: ["general", "stationery", "books", "toys", "groceries"],
    defaultBlueprint: {
      navbar: "transparent", hero: "static", catalogue: "grid", footer: "minimal",
      extras: { announcements: false, whatsapp: true, about: false, backToTop: true },
    },
    customizableSections: ["navbar", "hero", "catalogue", "footer", "extras"],
    uiLibrary: { id: "cite_ui", components: { hero: "Hero", card: "CatalogueCard", grid: "CatalogueGrid", navbar: "Navbar", footer: "Footer" } },
    themeCapabilities: "full",
    toolchain: { ui: "heroui", icons: "lucide", fonts: ["Inter", "Outfit"] },
    provisionerTemplateId: "minimal",
  },
  bold: {
    id: "bold",
    name: "Bold",
    tagline: "Dark, striking, spec-focused — built for tech shops",
    description: "The Bold template uses a dark color scheme with high-contrast typography and accent colors. The hero has a full-width gradient background with an inline search bar. Product cards show spec previews right on the grid, and the product detail page features a clean spec table layout.",
    highlights: [
      "Full-width dark gradient hero with inline product search",
      "Dark-themed product grid with spec previews on cards",
      "Spec table layout on product detail pages",
      "Variant badges and WhatsApp ordering",
      "Dark footer with contact details and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", desc: "Dark homepage with gradient hero, spec-heavy grid, and footer", file: "/templates/bold-homepage.png" },
      { label: "Product Detail", desc: "Dark product detail with spec table and variant badges", file: "/templates/bold-product-detail.png" },
    ],
    shopTypes: ["electronics", "electricals", "automotive", "sports"],
    defaultBlueprint: {
      navbar: "solid", hero: "static", catalogue: "grid", footer: "4-column",
      extras: { announcements: true, whatsapp: true, about: false, backToTop: true },
    },
    customizableSections: ["navbar", "hero", "catalogue", "footer", "extras"],
    uiLibrary: { id: "cite_ui", components: { hero: "Hero", card: "CatalogueCard", grid: "CatalogueGrid", navbar: "Navbar", footer: "Footer" } },
    themeCapabilities: "full",
    toolchain: { ui: "heroui", icons: "lucide", fonts: ["Inter", "Outfit"] },
    provisionerTemplateId: "bold",
  },
}

// ── DERIVED EXPORTS (backward-compatible aliases) ──

export const TEMPLATES = Object.values(TEMPLATES_DATA).map(t => ({
  id: t.id,
  name: t.name,
  description: t.description,
}))

export const TEMPLATE_DETAILS = Object.fromEntries(
  Object.values(TEMPLATES_DATA).map(t => [
    t.id,
    { tagline: t.tagline, description: t.description, highlights: t.highlights, screenshots: t.screenshots },
  ])
)

// Gallery from template defs — clean, limited, no mock names
const GALLERY_ITEMS = Object.fromEntries(
  Object.values(TEMPLATES_DATA).map(t => [
    t.id,
    [
      {
        id: `${t.id}-homepage`,
        templateId: t.id,
        name: `${t.name} Homepage`,
        shopType: t.shopTypes[0],
        screenshots: t.screenshots.filter(s => s.label === "Homepage"),
      },
      {
        id: `${t.id}-detail`,
        templateId: t.id,
        name: `${t.name} Product Detail`,
        shopType: t.shopTypes[0],
        screenshots: t.screenshots.filter(s => s.label === "Product Detail"),
      },
    ],
  ])
)
// Add custom tab entry
GALLERY_ITEMS.custom = []
export { GALLERY_ITEMS }

// ── DEFAULT BLUEPRINTS (backward compat) ──
const DEFAULT_BLUEPRINTS = Object.fromEntries(
  Object.values(TEMPLATES_DATA).map(t => [t.id, { ...t.defaultBlueprint }])
)
DEFAULT_BLUEPRINTS.custom = {
  navbar: "", hero: "", catalogue: "", footer: "",
  extras: { announcements: false, whatsapp: false, about: false, backToTop: false },
}
export { DEFAULT_BLUEPRINTS }

// ── HELPERS ──

export function getDefaultBlueprint(templateType) {
  return JSON.parse(JSON.stringify(DEFAULT_BLUEPRINTS[templateType] || DEFAULT_BLUEPRINTS.classic))
}

export function getTemplateById(id) {
  return TEMPLATES_DATA[id] || TEMPLATES_DATA.classic
}

export function getTemplatesForShopType(category) {
  return Object.values(TEMPLATES_DATA).filter(t => t.shopTypes.includes(category))
}

// Convert a blueprint object to an ordered array of section IDs for the provisioner API
export function blueprintToSectionIds(blueprint) {
  if (!blueprint) return []
  const ids = []
  const e = blueprint.extras || {}
  if (e.announcements) ids.push("announcements")
  if (blueprint.navbar) ids.push(`navbar/${blueprint.navbar}`)
  if (blueprint.hero) ids.push(`hero/${blueprint.hero}`)
  if (e.about) ids.push("about")
  if (blueprint.catalogue) ids.push(`catalogue/${blueprint.catalogue}`)
  if (blueprint.footer) ids.push(`footer/${blueprint.footer}`)
  if (e.whatsapp) ids.push("whatsapp-float")
  if (e.backToTop) ids.push("back-to-top")
  return ids
}

// Build the full payload to send to the provisioner, including brand colors + UI library info
export function buildProvisionerPayload({ shopId, templateId, subdomain, sections, shopSettings }) {
  const template = getTemplateById(templateId)
  const payload = {
    shop_id: shopId,
    template_id: sections ? "custom" : template.provisionerTemplateId || templateId,
    subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40),
  }
  if (sections?.length > 0) payload.sections = sections

  // Rich config object
  payload.config = {
    ui_library: template.uiLibrary.id,
    components: template.uiLibrary.components,
    toolchain: template.toolchain || { ui: "cite_ui", icons: "phosphor", fonts: [] },
    theme: {
      primary_color: shopSettings?.primaryColor || "#000000",
      secondary_color: shopSettings?.secondaryColor || "#4f46e5",
      accent_color: shopSettings?.accentColor || "#f59e0b",
      store_name: shopSettings?.storeName || "",
      description: shopSettings?.description || "",
      logo_url: shopSettings?.logoUrl || "",
    },
    theme_capabilities: THEME_CAPABILITIES[template.themeCapabilities] || THEME_CAPABILITIES.basic,
  }
  return payload
}