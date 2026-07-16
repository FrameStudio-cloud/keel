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
  { label: "Hero", desc: "Full-screen hero section with slideshow or gradient background and CTA" },
  { label: "Catalogue Grid", desc: "Searchable product grid with category filter chips and WhatsApp ordering" },
  { label: "Product Detail", desc: "Product page with specs table, includes list, and WhatsApp order button" },
  { label: "Footer", desc: "Footer with contact info, business hours, social links, and developer credit" },
];

const FASHION_SCREENSHOTS = [
  { label: "Lookbook Hero", desc: "Split-layout hero with bold imagery, tagline, and WhatsApp CTA" },
  { label: "Category Strip", desc: "Horizontal scrollable category chips with item counts" },
  { label: "New Arrivals", desc: "Horizontal product carousel for featured items with badge" },
  { label: "Product Detail", desc: "Product page with size/color options and WhatsApp ordering" },
];

function addScreenshots(cards, screenshots, templateId) {
  return cards.map((c, i) => ({
    id: `${templateId}-${i}`,
    templateId,
    ...c,
    screenshots: screenshots.map((s) => ({ ...s, file: null })),
  }));
}

const GALLERY_TEMPLATE_ID = "classic";
const FASHION_TEMPLATE_ID = "fashion";

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

export const GALLERY_ITEMS = {
  classic: addScreenshots(MOCK_CARDS, COMMON_SCREENSHOTS, GALLERY_TEMPLATE_ID),
  fashion: addScreenshots(FASHION_CARDS, FASHION_SCREENSHOTS, FASHION_TEMPLATE_ID),
};

export const TEMPLATES = [
  { id: "classic", name: "Classic", description: "Clean, professional layout for any shop type" },
  { id: "fashion", name: "Fashion", description: "Lookbook hero, category strips, featured carousel" },
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
      { label: "Homepage", file: null },
      { label: "Catalogue Grid", file: null },
      { label: "Product Detail", file: null },
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
      { label: "Lookbook Hero", file: null },
      { label: "New Arrivals", file: null },
      { label: "Product Detail", file: null },
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
