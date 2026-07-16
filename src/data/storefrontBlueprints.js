export const SECTION_OPTIONS = {
  navbar: [
    {
      id: "transparent",
      name: "Transparent",
      description: "Scroll-aware — starts transparent, turns solid on scroll",
    },
    {
      id: "solid",
      name: "Solid",
      description: "Always has a solid background, good for dark hero sections",
    },
  ],
  hero: [
    {
      id: "slideshow",
      name: "Slideshow",
      description: "Full-bleed image carousel with auto-advance and dot navigation",
    },
    {
      id: "static",
      name: "Static Gradient",
      description: "Gradient background with subtle pattern overlay and CTA",
    },
    {
      id: "split",
      name: "Split Layout",
      description: "Left text, right image — ideal for fashion lookbooks",
    },
  ],
  catalogue: [
    {
      id: "grid",
      name: "Grid",
      description: "Searchable 2-4 column grid with category filter chips",
    },
    {
      id: "carousel",
      name: "Carousel",
      description: "Horizontal scroll — best for featured or new arrivals",
    },
  ],
  footer: [
    {
      id: "4-column",
      name: "4-Column",
      description: "Brand info, contact details, business hours, social links",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Compact footer with just brand and copyright",
    },
  ],
};

export const DEFAULT_BLUEPRINTS = {
  classic: {
    navbar: "transparent",
    hero: "slideshow",
    catalogue: "grid",
    footer: "4-column",
    extras: { announcements: true, whatsapp: true, about: true, backToTop: true },
  },
  fashion: {
    navbar: "solid",
    hero: "split",
    catalogue: "carousel",
    footer: "4-column",
    extras: { announcements: true, whatsapp: true, about: false, backToTop: true },
  },
  custom: {
    navbar: "",
    hero: "",
    catalogue: "",
    footer: "",
    extras: { announcements: false, whatsapp: false, about: false, backToTop: false },
  },
};

const COMMON_SCREENSHOTS = [
  { label: "Homepage", desc: "Full storefront homepage with hero, catalogue grid, and footer", file: "/templates/classic-homepage.png" },
  { label: "Product Detail", desc: "Product page with specs, variants, and WhatsApp ordering", file: "/templates/classic-product-detail.png" },
];

const FASHION_SCREENSHOTS = [
  { label: "Homepage", desc: "Full storefront homepage with lookbook hero, category strip, and carousel" },
  { label: "Product Detail", desc: "Product page with size/color options and WhatsApp ordering" },
];

const MINIMAL_SCREENSHOTS = [
  { label: "Homepage", desc: "Clean homepage with gradient banner, catalogue grid, and compact footer" },
  { label: "Product Detail", desc: "Product page with specs, options, and WhatsApp ordering" },
];

const BOLD_SCREENSHOTS = [
  { label: "Homepage", desc: "Dark homepage with gradient hero, spec-heavy grid, and footer", file: "/templates/bold-homepage.png" },
  { label: "Product Detail", desc: "Dark product detail with spec table and variant badges", file: "/templates/bold-product-detail.png" },
];

function addScreenshots(cards, screenshots, templateId) {
  return cards.map((c, i) => ({
    id: `${templateId}-${i}`,
    templateId,
    ...c,
    screenshots: screenshots.map((s) => ({ ...s })),
  }));
}

const GALLERY_TEMPLATE_ID = "classic";
const FASHION_TEMPLATE_ID = "fashion";
const MINIMAL_TEMPLATE_ID = "minimal";
const BOLD_TEMPLATE_ID = "bold";

const MOCK_CARDS = [
  { name: "Campus Glow", shopType: "General" },
  { name: "Tech Haven", shopType: "Electronics" },
  { name: "Urban Boutique", shopType: "Clothing" },
  { name: "Fresh Market", shopType: "General" },
  { name: "Auto Parts KE", shopType: "Electricals" },
  { name: "Book Nook", shopType: "General" },
  { name: "Sleek Sounds", shopType: "Electronics" },
  { name: "Grace Collection", shopType: "Clothing" },
  { name: "Fix It Hub", shopType: "Electricals" },
  { name: "Bloom Florist", shopType: "General" },
];

const FASHION_CARDS = [
  { name: "Style Lab", shopType: "Clothing" },
  { name: "Vogue Avenue", shopType: "Clothing" },
  { name: "Thread Africa", shopType: "Clothing" },
  { name: "Luxe Layers", shopType: "Clothing" },
  { name: "Neo Wear", shopType: "Clothing" },
  { name: "Sis' Boutique", shopType: "Clothing" },
  { name: "Drip KE", shopType: "Clothing" },
  { name: "Her Wardrobe", shopType: "Clothing" },
  { name: "Street Couture", shopType: "Clothing" },
  { name: "Premium Threads", shopType: "Clothing" },
];

const MINIMAL_CARDS = [
  { name: "Simple Shop", shopType: "General" },
  { name: "Essentials", shopType: "General" },
  { name: "Daily Needs", shopType: "General" },
  { name: "Corner Store", shopType: "General" },
  { name: "Basics KE", shopType: "Electricals" },
  { name: "Pure Goods", shopType: "General" },
  { name: "Minimal Mart", shopType: "General" },
  { name: "Clean Cuts", shopType: "Electronics" },
  { name: "Plain & Simple", shopType: "General" },
  { name: "Tiny Shop", shopType: "General" },
];

const BOLD_CARDS = [
  { name: "Power Tech", shopType: "Electronics" },
  { name: "Volt Store", shopType: "Electricals" },
  { name: "Neon Gadgets", shopType: "Electronics" },
  { name: "Dark Mode", shopType: "General" },
  { name: "Circuit Hub", shopType: "Electricals" },
  { name: "Matrix Shop", shopType: "Electronics" },
  { name: "Bold Tech", shopType: "Electronics" },
  { name: "Spark KE", shopType: "Electricals" },
  { name: "Hyper Store", shopType: "General" },
  { name: "Pulse Electronics", shopType: "Electronics" },
];

export const GALLERY_ITEMS = {
  classic: addScreenshots(MOCK_CARDS, COMMON_SCREENSHOTS, GALLERY_TEMPLATE_ID),
  fashion: addScreenshots(FASHION_CARDS, FASHION_SCREENSHOTS, FASHION_TEMPLATE_ID),
  minimal: addScreenshots(MINIMAL_CARDS, MINIMAL_SCREENSHOTS, MINIMAL_TEMPLATE_ID),
  bold: addScreenshots(BOLD_CARDS, BOLD_SCREENSHOTS, BOLD_TEMPLATE_ID),
};

export const TEMPLATES = [
  { id: "classic", name: "Classic", description: "Clean, professional layout for any shop type" },
  { id: "fashion", name: "Fashion", description: "Lookbook hero, category strips, featured carousel" },
  { id: "minimal", name: "Minimal", description: "Clean, sparse layout with gradient header banner" },
  { id: "bold", name: "Bold", description: "Dark theme with spec-heavy cards for electronics" },
  { id: "custom", name: "Custom", description: "Pick each section yourself — build from scratch" },
];

export const TEMPLATE_DETAILS = {
  classic: {
    tagline: "Built for every shop — clean, fast, professional",
    description:
      "The Classic template gives you a hero slideshow, searchable product catalogue grid, announcement bars, WhatsApp integration, and a full contact footer with business hours. Works for any category — general, electronics, electricals, or clothing.",
    highlights: [
      "Full-screen hero with image slideshow or gradient fallback",
      "Searchable product grid with category filter chips",
      "Product detail pages with specs, includes list, WhatsApp order button",
      "Announcement bars for sales and promotions",
      "4-column footer with contact, hours, and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", file: "/templates/classic-homepage.png" },
      { label: "Product Detail", file: "/templates/classic-product-detail.png" },
    ],
  },
  fashion: {
    tagline: "Made for clothing and apparel — bold, visual, trendy",
    description:
      "The Fashion template features a lookbook-style split hero, horizontal category chips, a new-arrivals carousel, and a featured collection banner. Designed to showcase visual products like clothes, shoes, and accessories.",
    highlights: [
      "Split-layout hero with bold imagery and WhatsApp CTA",
      "Scrollable category chips with item counts",
      "New arrivals horizontal carousel for featured items",
      "Featured collection banner section",
      "Searchable product grid with category filtering",
      "WhatsApp ordering and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", file: null },
      { label: "Product Detail", file: null },
    ],
  },
  minimal: {
    tagline: "No-fuss online presence — clean, fast, distraction-free",
    description:
      "The Minimal template strips away everything but the essentials: a gradient header banner with your store name and tagline, a searchable product grid with borderless cards, and a compact footer. No hero slideshow, no carousels — just products.",
    highlights: [
      "Gradient header banner with store name, tagline, and CTA",
      "Searchable product grid with clean borderless cards",
      "Category filter chips for easy browsing",
      "Product detail page with specs, options, and WhatsApp ordering",
      "Compact footer with contact info and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", file: null },
      { label: "Product Detail", file: null },
    ],
  },
  bold: {
    tagline: "Dark, striking, spec-focused — built for tech shops",
    description:
      "The Bold template uses a dark color scheme with high-contrast typography and accent colors. The hero has a full-width gradient background with an inline search bar. Product cards show spec previews right on the grid, and the product detail page features a clean spec table layout.",
    highlights: [
      "Full-width dark gradient hero with inline product search",
      "Dark-themed product grid with spec previews on cards",
      "Spec table layout on product detail pages",
      "Variant badges and WhatsApp ordering",
      "Dark footer with contact details and social links",
      "WhatsApp floating button and back-to-top",
    ],
    screenshots: [
      { label: "Homepage", file: "/templates/bold-homepage.png" },
      { label: "Product Detail", file: "/templates/bold-product-detail.png" },
    ],
  },
};

export const STEPS_CONFIG = [
  { key: "navbar", title: "Navbar", subtitle: "Choose how your navigation looks", optionsKey: "navbar" },
  { key: "hero", title: "Hero", subtitle: "Pick your hero section style", optionsKey: "hero" },
  { key: "catalogue", title: "Catalogue", subtitle: "How products are displayed", optionsKey: "catalogue" },
  { key: "footer", title: "Footer", subtitle: "Footer layout and content", optionsKey: "footer" },
  { key: "extras", title: "Extras", subtitle: "Toggle additional features", optionsKey: null },
];

export function getDefaultBlueprint(templateType) {
  return JSON.parse(JSON.stringify(DEFAULT_BLUEPRINTS[templateType] || DEFAULT_BLUEPRINTS.classic));
}

// Convert a blueprint object to an ordered array of section IDs for the provisioner API
export function blueprintToSectionIds(blueprint) {
  if (!blueprint) return []
  const ids = []
  const e = blueprint.extras || {}
  if (e.announcements) ids.push('announcements')
  if (blueprint.navbar) ids.push(`navbar/${blueprint.navbar}`)
  if (blueprint.hero) ids.push(`hero/${blueprint.hero}`)
  if (e.about) ids.push('about')
  if (blueprint.catalogue) ids.push(`catalogue/${blueprint.catalogue}`)
  if (blueprint.footer) ids.push(`footer/${blueprint.footer}`)
  if (e.whatsapp) ids.push('whatsapp-float')
  if (e.backToTop) ids.push('back-to-top')
  return ids
}
