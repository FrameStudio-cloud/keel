// Keel UI Inventory — Figma plugin (SOURCE)
// This is the human-edited source. The scanner (scripts/figma-ui-inventory.mjs)
// replaces the __DATA__ placeholder below with the generated manifest and writes
// code.js, which is what manifest.json points at. Do NOT edit code.js directly.
//
// Builds a board with one frame per page + a modal gallery.
const DATA = {
  "generatedAt": "2026-08-03T20:55:08.894Z",
  "app": "Keel",
  "version": "4.0.0",
  "routes": [
    {
      "path": "/terms",
      "component": "Terms",
      "file": "src/pages/Terms.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/privacy",
      "component": "Privacy",
      "file": "src/pages/Privacy.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/use-cases",
      "component": "UseCases",
      "file": "src/pages/UseCases.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/about",
      "component": "AboutFramestudio",
      "file": "src/pages/AboutFramestudio.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/features",
      "component": "Features",
      "file": "src/pages/Features.jsx",
      "guard": "open",
      "modals": [
        "ReceiptModal"
      ]
    },
    {
      "path": "/help",
      "component": "Help",
      "file": "src/pages/Help.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/blog",
      "component": "Blog",
      "file": "src/pages/Blog.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/blog/:slug",
      "component": "BlogPost",
      "file": "src/pages/BlogPost.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/p/:id",
      "component": "PublicProduct",
      "file": "src/pages/PublicProduct.jsx",
      "guard": "open",
      "modals": []
    },
    {
      "path": "/login",
      "component": "Login",
      "file": "src/pages/Login.jsx",
      "guard": "public",
      "modals": []
    },
    {
      "path": "/setup",
      "component": "SetupWizard",
      "file": "src/pages/SetupWizard.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/",
      "component": "HomeOrDashboard",
      "file": null,
      "guard": "open",
      "modals": []
    },
    {
      "path": "/inventory",
      "component": "Inventory",
      "file": "src/pages/Inventory.jsx",
      "guard": "protected",
      "modals": [
        "AddProductModal",
        "EditProductModal",
        "StockAdjustModal"
      ]
    },
    {
      "path": "/sales",
      "component": "Sales",
      "file": "src/pages/Sales.jsx",
      "guard": "protected",
      "modals": [
        "LogSaleModal",
        "ReceiptModal"
      ]
    },
    {
      "path": "/queue",
      "component": "Queue",
      "file": "src/pages/Queue.jsx",
      "guard": "protected",
      "modals": [
        "ContentLibrary",
        "PostComposer",
        "TemplateModal"
      ]
    },
    {
      "path": "/website",
      "component": "Website",
      "file": "src/pages/Website.jsx",
      "guard": "protected",
      "modals": [
        "ConfigModal"
      ]
    },
    {
      "path": "/settings",
      "component": "Settings",
      "file": "src/pages/Settings.jsx",
      "guard": "protected",
      "modals": [
        "ConfigModal"
      ]
    },
    {
      "path": "/profile",
      "component": "Profile",
      "file": "src/pages/Profile.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/stock-history",
      "component": "StockHistory",
      "file": "src/pages/StockHistory.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/finance",
      "component": "Finance",
      "file": "src/pages/Finance.jsx",
      "guard": "protected",
      "modals": [
        "ReceiptModal"
      ]
    },
    {
      "path": "/reports",
      "component": "Reports",
      "file": "src/pages/Reports.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/marketing",
      "component": "Marketing",
      "file": "src/pages/Marketing.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/storefront",
      "component": "Storefront",
      "file": "src/pages/Storefront.jsx",
      "guard": "protected",
      "modals": [
        "ConfigModal",
        "DeployProgressModal",
        "StorefrontLanding",
        "TemplateModal"
      ]
    },
    {
      "path": "/integrations",
      "component": "Integrations",
      "file": "src/pages/Integrations.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/integrations/:slug",
      "component": "IntegrationDetail",
      "file": "src/pages/IntegrationDetail.jsx",
      "guard": "protected",
      "modals": []
    },
    {
      "path": "/inbox",
      "component": "Inbox",
      "file": "src/pages/Inbox.jsx",
      "guard": "protected",
      "modals": [
        "ConfigModal"
      ]
    },
    {
      "path": "/orders",
      "component": "Orders",
      "file": "src/pages/Orders.jsx",
      "guard": "protected",
      "modals": [
        "EditOrderModal",
        "NewOrderModal",
        "ReceiptModal"
      ]
    },
    {
      "path": "/customers",
      "component": "Customers",
      "file": "src/pages/Customers.jsx",
      "guard": "protected",
      "modals": [
        "CustomerFormModal"
      ]
    },
    {
      "path": "/services",
      "component": "Services",
      "file": "src/pages/Services.jsx",
      "guard": "protected",
      "modals": [
        "ServiceFormModal"
      ]
    },
    {
      "path": "*",
      "component": "NotFound",
      "file": "src/pages/NotFound.jsx",
      "guard": "open",
      "modals": []
    }
  ],
  "modals": [
    {
      "name": "AddProductModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/AddProductModal.jsx",
      "description": "Add product"
    },
    {
      "name": "BarcodeScanner",
      "file": "C:/Users/Administrator/projects/keel/src/components/BarcodeScanner.jsx",
      "description": "Scan barcode"
    },
    {
      "name": "CustomerFormModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/CustomerFormModal.jsx",
      "description": "Close"
    },
    {
      "name": "EditOrderModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/EditOrderModal.jsx",
      "description": "Edit order"
    },
    {
      "name": "EditProductModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/EditProductModal.jsx",
      "description": "Edit product"
    },
    {
      "name": "LogOrderModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/inbox/LogOrderModal.jsx",
      "description": "Log an order"
    },
    {
      "name": "ProductPickerModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/inbox/ProductPickerModal.jsx",
      "description": "Send products"
    },
    {
      "name": "QuickRepliesPanel",
      "file": "C:/Users/Administrator/projects/keel/src/components/inbox/QuickRepliesPanel.jsx",
      "description": "Quick replies"
    },
    {
      "name": "SendReceiptModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/inbox/SendReceiptModal.jsx",
      "description": "Send a receipt"
    },
    {
      "name": "LogSaleModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/LogSaleModal.jsx",
      "description": "Log a sale"
    },
    {
      "name": "NewOrderModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/NewOrderModal.jsx",
      "description": "New order"
    },
    {
      "name": "ReceiptModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/ReceiptModal.jsx",
      "description": "Receipt"
    },
    {
      "name": "RenewModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/RenewModal.jsx",
      "description": "Renew subscription"
    },
    {
      "name": "ServiceFormModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/ServiceFormModal.jsx",
      "description": "Close"
    },
    {
      "name": "ContentLibrary",
      "file": "C:/Users/Administrator/projects/keel/src/components/social/ContentLibrary.jsx",
      "description": "Save as template"
    },
    {
      "name": "PostComposer",
      "file": "C:/Users/Administrator/projects/keel/src/components/social/PostComposer.jsx",
      "description": "Close"
    },
    {
      "name": "StockAdjustModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/StockAdjustModal.jsx",
      "description": "Adjust stock"
    },
    {
      "name": "ConfigModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/storefront/ConfigModal.jsx",
      "description": "Configure storefront"
    },
    {
      "name": "DeployProgressModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/storefront/DeployProgressModal.jsx",
      "description": null
    },
    {
      "name": "StorefrontLanding",
      "file": "C:/Users/Administrator/projects/keel/src/components/storefront/StorefrontLanding.jsx",
      "description": "Dismiss"
    },
    {
      "name": "TemplateModal",
      "file": "C:/Users/Administrator/projects/keel/src/components/storefront/TemplateModal.jsx",
      "description": "Choose a template"
    },
    {
      "name": "TourGuide",
      "file": "C:/Users/Administrator/projects/keel/src/components/TourGuide.jsx",
      "description": "Quick start guide"
    }
  ]
};

const { routes, modals, version, generatedAt, app } = DATA;

const PAGE_NAME = "Keel UI Inventory";

// Keel light-theme palette
const C = {
  brand: "#3B82F6",
  brandSoft: "#EFF6FF",
  accent: "#F59E0B",
  accentSoft: "#FFFBEB",
  success: "#059669",
  successSoft: "#F0FDF4",
  surface1: "#FFFFFF",
  surface2: "#F0EFEB",
  surface3: "#E6E4DE",
  border: "#E8E7E1",
  textPrimary: "#16181D",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  white: "#FFFFFF",
};

const GUARD_COLORS = {
  protected: { bg: "#EFF6FF", fg: "#2563EB", label: "Protected" },
  public: { bg: "#FFFBEB", fg: "#D97706", label: "Public" },
  open: { bg: "#F0FDF4", fg: "#047857", label: "Open" },
};

const FONT = { family: "Inter", style: "Regular" };
const FONT_BOLD = { family: "Inter", style: "Bold" };
const FONT_MEDIUM = { family: "Inter", style: "Medium" };

function hex(color) {
  const n = parseInt(color.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function solid(color) {
  return [{ type: "SOLID", color: hex(color) }];
}

async function loadFonts() {
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_BOLD);
  await figma.loadFontAsync(FONT_MEDIUM);
}

async function text(str, { x, y, size = 12, color = C.textPrimary, weight = "Regular", width = 200, letterSpacing = 0, italic = false } = {}) {
  const t = figma.createText();
  const fn = weight === "Bold" ? FONT_BOLD : weight === "Medium" ? FONT_MEDIUM : FONT;
  t.fontName = fn;
  t.characters = String(str);
  t.fontSize = size;
  t.fills = solid(color);
  t.x = x;
  t.y = y;
  t.resize(width, size + 4);
  if (letterSpacing) t.letterSpacing = { value: letterSpacing, unit: "PIXELS" };
  if (italic) t.textCase = "UPPERCASE";
  return t;
}

function rect({ x, y, w, h, fill, stroke = null, strokeWeight = 1, radius = 0, dash = null, opacity = 1 }) {
  const r = figma.createRectangle();
  r.x = x;
  r.y = y;
  r.resize(w, h);
  r.fills = fill ? solid(fill) : [];
  if (stroke) r.strokes = solid(stroke);
  if (stroke) r.strokeWeight = strokeWeight;
  if (stroke && dash) r.strokeDashArray = dash;
  if (radius) {
    r.cornerRadius = radius;
    r.topLeftRadius = radius;
    r.topRightRadius = radius;
    r.bottomLeftRadius = radius;
    r.bottomRightRadius = radius;
  }
  r.opacity = opacity;
  return r;
}

async function pill({ x, y, label, bg, fg, size = 9 }) {
  const padX = 6;
  const w = label.length * (size * 0.62) + padX * 2 + 2;
  const r = rect({ x, y, w, h: size + 8, fill: bg, radius: 20 });
  const t = await text(label.toUpperCase(), {
    x: x + padX,
    y: y + 1,
    size,
    color: fg,
    weight: "Medium",
    width: w - padX * 2,
    letterSpacing: 0.4,
  });
  return { frame: r, text: t, width: w };
}

function cardFrame({ x, y, w, h }) {
  const f = figma.createFrame();
  f.x = x;
  f.y = y;
  f.resize(w, h);
  f.name = "card";
  f.fills = solid(C.surface1);
  f.strokes = solid(C.border);
  f.strokeWeight = 1;
  f.cornerRadius = 10;
  return f;
}

async function pageCard(route, x, y) {
  const W = 248;
  const H = 348;
  const f = cardFrame({ x, y, w: W, h: H });
  f.name = `Page — ${route.path}`;

  const guard = GUARD_COLORS[route.guard] || GUARD_COLORS.open;

  // Header band
  const band = rect({ x, y, w: W, h: 52, fill: C.brand, radius: 10 });
  band.topLeftRadius = 10;
  band.topRightRadius = 10;
  band.bottomLeftRadius = 0;
  band.bottomRightRadius = 0;
  f.appendChild(band);

  await text(route.component, { x: x + 12, y: y + 8, size: 14, color: C.white, weight: "Bold", width: W - 24 });
  await text(route.path, { x: x + 12, y: y + 30, size: 11, color: "#DBEAFE", width: W - 24 });

  let cy = y + 52 + 12;

  // Guard chip + count
  const g = await pill({ x, y: cy, label: guard.label, bg: guard.bg, fg: guard.fg });
  const modalChip = await pill({
    x: x + g.width + 8,
    y: cy,
    label: route.modals.length ? `${route.modals.length} modal${route.modals.length > 1 ? "s" : ""}` : "no modals",
    bg: route.modals.length ? C.brandSoft : C.surface2,
    fg: route.modals.length ? C.brand : C.textMuted,
  });
  cy += 34;

  await text("Component", { x: x + 12, y: cy, size: 9, color: C.textFaint, weight: "Medium", width: W - 24, letterSpacing: 0.5 });
  cy += 15;
  await text(route.component, { x: x + 12, y: cy, size: 12, color: C.textPrimary, width: W - 24 });
  cy += 22;

  await text("Source file", { x: x + 12, y: cy, size: 9, color: C.textFaint, weight: "Medium", width: W - 24, letterSpacing: 0.5 });
  cy += 15;
  await text(route.file || "—", { x: x + 12, y: cy, size: 10, color: C.textMuted, width: W - 24 });

  cy += 26;
  if (route.modals.length) {
    await text("Modals", { x: x + 12, y: cy, size: 9, color: C.textFaint, weight: "Medium", width: W - 24, letterSpacing: 0.5 });
    cy += 15;
    let mx = x + 12;
    for (const m of route.modals) {
      const c = await pill({ x: mx, y: cy, label: m, bg: C.successSoft, fg: C.success, size: 8 });
      mx += c.width + 4;
      if (mx > x + W - 40) break;
    }
    cy += 30;
  } else {
    await text("No modals", { x: x + 12, y: cy, size: 10, color: C.textFaint, width: W - 24 });
    cy += 30;
  }

  // Screenshot placeholder
  const place = rect({
    x: x + 12,
    y: cy + 4,
    w: W - 24,
    h: y + H - 20 - (cy + 4),
    fill: C.surface2,
    stroke: C.border,
    dash: [4, 4],
    radius: 8,
  });
  await text(route.component, {
    x: x + 12,
    y: cy + 18,
    size: 11,
    color: C.textMuted,
    weight: "Medium",
    width: W - 24,
  });
  await text("drag a screenshot here", { x: x + 12, y: cy + 36, size: 9, color: C.textFaint, width: W - 24 });
}

async function modalCard(modal, x, y) {
  const W = 248;
  const H = 150;
  const f = cardFrame({ x, y, w: W, h: H });
  f.name = `Modal — ${modal.name}`;

  const band = rect({ x, y, w: W, h: 40, fill: C.accent, radius: 10 });
  band.topLeftRadius = 10;
  band.topRightRadius = 10;
  band.bottomLeftRadius = 0;
  band.bottomRightRadius = 0;
  f.appendChild(band);

  await text(modal.name, { x: x + 12, y: y + 9, size: 13, color: C.white, weight: "Bold", width: W - 24 });

  let cy = y + 52;
  await text("Source file", { x: x + 12, y: cy, size: 9, color: C.textFaint, weight: "Medium", width: W - 24, letterSpacing: 0.5 });
  cy += 15;
  await text(modal.file, { x: x + 12, y: cy, size: 10, color: C.textMuted, width: W - 24 });
  cy += 22;
  await text(modal.description ? `"${modal.description}"` : "No description", {
    x: x + 12,
    y: cy,
    size: 10,
    color: modal.description ? C.textPrimary : C.textFaint,
    width: W - 24,
  });
}

async function sectionLabel(label, x, y) {
  await text(label, { x, y, size: 16, color: C.textPrimary, weight: "Bold", width: 400 });
  const rule = rect({ x, y: y + 28, w: 1600, h: 1, fill: C.border });
  return rule;
}

async function main() {
  const existing = figma.root.children.find((p) => p.name === PAGE_NAME);
  if (existing) existing.remove();

  const page = figma.createPage();
  page.name = PAGE_NAME;
  figma.currentPage = page;

  await loadFonts();

  const X0 = 48;
  let y = 48;

  // Title block
  const accentBar = rect({ x: X0, y: y + 4, w: 6, h: 40, fill: C.brand, radius: 3 });
  await text("Keel UI Inventory", { x: X0 + 20, y, size: 30, color: C.textPrimary, weight: "Bold", width: 500 });
  await text(`v${version} · ${routes.length} pages · ${modals.length} modals · ${app} · generated ${new Date(generatedAt).toLocaleDateString()}`, {
    x: X0 + 20,
    y: y + 40,
    size: 13,
    color: C.textMuted,
    width: 700,
  });
  y += 100;

  // Pages
  await sectionLabel("Pages", X0, y);
  y += 56;

  const CELL_W = 264;
  const CELL_H = 372;
  const COLS = 6;

  routes.forEach((r, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    pageCard(r, X0 + col * CELL_W, y + row * CELL_H);
  });

  const pageRows = Math.ceil(routes.length / COLS);
  y += pageRows * CELL_H + 40;

  // Modals
  await sectionLabel("Modals", X0, y);
  y += 56;

  const M_CELL_W = 264;
  const M_CELL_H = 174;
  modals.forEach((m, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    modalCard(m, X0 + col * M_CELL_W, y + row * M_CELL_H);
  });

  const modalRows = Math.ceil(modals.length / COLS);
  y += modalRows * M_CELL_H + 48;

  // Legend / footer
  await text("How to update", { x: X0, y, size: 12, color: C.textPrimary, weight: "Bold", width: 400 });
  y += 20;
  await text("Run `node scripts/figma-ui-inventory.mjs`, then re-run this plugin to rebuild the board. Replace any dashed placeholder with a real screenshot of that screen.", {
    x: X0,
    y,
    size: 11,
    color: C.textMuted,
    width: 900,
  });

  figma.viewport.scrollAndZoomIntoView([page]);
  figma.closePlugin(`Keel UI Inventory built: ${routes.length} pages · ${modals.length} modals on "${PAGE_NAME}"`);
}

main().catch((err) => {
  console.error(err);
  figma.closePlugin(`Error: ${err.message}`);
});

