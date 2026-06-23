// node supabase/seed.mjs
// Run: node supabase/seed.mjs
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const SEED_SHOP_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
  console.log("Seeding Keel mock data...\n");

  // ─── 1. Shop ───────────────────────────────────
  const { error: shopErr } = await supabase.from("shops").upsert({
    id: SEED_SHOP_ID,
    name: "Lewis Shop",
    slug: "lewis-shop",
    business_category: "electronics",
  });
  if (shopErr) { console.error("shops:", shopErr.message); return; }
  console.log("✓ shop");

  // ─── 2. Store settings ──────────────────────────
  const { error: settingsErr } = await supabase.from("store_settings").upsert({
    shop_id: SEED_SHOP_ID,
    store_name: "Lewis Shop",
    store_phone: "+254 700 123 456",
    store_address: "Thika, Kenya",
    currency_symbol: "KSh",
    low_stock_threshold: 6,
    default_payment: "M-Pesa",
    receipt_footer: "Thank you for shopping with Lewis Shop!",
    theme: "dark",
    website_url: "https://lewis-shop.vercel.app",
    whatsapp: "254700123456",
    business_hours: { mon: "8:00-18:00", tue: "8:00-18:00", wed: "8:00-18:00", thu: "8:00-18:00", fri: "8:00-18:00", sat: "9:00-15:00", sun: "closed" },
  });
  if (settingsErr) { console.error("store_settings:", settingsErr.message); return; }
  console.log("✓ store_settings");

  // ─── 3. Products ────────────────────────────────
  const products = [
    { name: "iPhone 15 Pro Max Case", category: "Cases", price: 1800, stock: 12, variants: { colors: ["Black", "Blue", "Clear"], storage: [] } },
    { name: "Samsung Galaxy S24 Ultra Case", category: "Cases", price: 1500, stock: 8, variants: { colors: ["Black", "Green", "Purple"], storage: [] } },
    { name: "Tempered Glass Screen Protector", category: "Screen Protection", price: 350, stock: 45, variants: { colors: [], storage: ["iPhone 15", "iPhone 15 Pro", "S24 Ultra"] } },
    { name: "Bluetooth Wireless Earbuds", category: "Audio", price: 2500, stock: 20, variants: { colors: ["White", "Black"], storage: [] } },
    { name: "USB-C Fast Charger 65W", category: "Chargers", price: 2200, stock: 3, variants: { colors: ["White"], storage: [] } },
    { name: "Lightning Cable 2m", category: "Cables", price: 600, stock: 30, variants: { colors: ["White", "Black"], storage: [] } },
    { name: "USB-C to USB-C Cable 2m", category: "Cables", price: 700, stock: 25, variants: { colors: ["White", "Black", "Blue"], storage: [] } },
    { name: "Phone Stand Adjustable", category: "Accessories", price: 900, stock: 15, variants: { colors: ["Black", "Silver"], storage: [] } },
    { name: "Smart Watch Band 22mm", category: "Wearables", price: 500, stock: 40, variants: { colors: ["Black", "Brown", "Blue", "Red"], storage: ["22mm", "24mm"] } },
    { name: "Power Bank 20000mAh", category: "Chargers", price: 3500, stock: 2, variants: { colors: ["Black", "White"], storage: [] } },
    { name: "AirPods Pro 2 Case Cover", category: "Cases", price: 400, stock: 18, variants: { colors: ["Black", "Pink", "Blue", "Green"], storage: [] } },
    { name: "HDMI Cable 1.5m", category: "Cables", price: 450, stock: 22, variants: { colors: [], storage: [] } },
  ];
  const productIds = [];
  for (const p of products) {
    const { data, error } = await supabase.from("products").insert({ shop_id: SEED_SHOP_ID, ...p }).select("id").single();
    if (error) { console.error("products:", error.message); return; }
    productIds.push(data.id);
  }
  console.log("✓ products (12)");

  // ─── 4. Sales ───────────────────────────────────
  const now = Date.now();
  const sales = [];
  const methods = ["Cash", "M-Pesa", "Bank"];
  for (let i = 0; i < 60; i++) {
    const productIdx = Math.floor(Math.random() * products.length);
    const product = products[productIdx];
    const qty = 1 + Math.floor(Math.random() * 3);
    const daysAgo = Math.floor(Math.random() * 60);
    sales.push({
      shop_id: SEED_SHOP_ID,
      product_id: productIds[productIdx],
      product_name: product.name,
      amount: product.price * qty,
      quantity: qty,
      method: methods[Math.floor(Math.random() * methods.length)],
      created_at: new Date(now - daysAgo * 86400000 - Math.random() * 86400000).toISOString(),
    });
  }
  // Sort by created_at and insert
  sales.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const { error: salesErr } = await supabase.from("sales").insert(sales);
  if (salesErr) { console.error("sales:", salesErr.message); return; }
  console.log("✓ sales (60)");

  // ─── 5. Stock movements ─────────────────────────
  const movements = [
    { product_id: productIds[0], product_name: products[0].name, change: 20, reason: "Initial stock", shop_id: SEED_SHOP_ID },
    { product_id: productIds[1], product_name: products[1].name, change: 15, reason: "Initial stock", shop_id: SEED_SHOP_ID },
    { product_id: productIds[2], product_name: products[2].name, change: 50, reason: "Initial stock", shop_id: SEED_SHOP_ID },
    { product_id: productIds[6], product_name: products[6].name, change: -3, reason: "Damaged in transit", shop_id: SEED_SHOP_ID },
    { product_id: productIds[9], product_name: products[9].name, change: 10, reason: "Restock from supplier", shop_id: SEED_SHOP_ID },
    { product_id: productIds[4], product_name: products[4].name, change: -1, reason: "Return — faulty unit", shop_id: SEED_SHOP_ID },
    { product_id: productIds[3], product_name: products[3].name, change: 25, reason: "New shipment arrived", shop_id: SEED_SHOP_ID },
  ];
  const { error: movErr } = await supabase.from("stock_movements").insert(movements);
  if (movErr) { console.error("stock_movements:", movErr.message); return; }
  console.log("✓ stock_movements (7)");

  // ─── 6. Catalogue (website listings) ────────────
  const catalogue = [
    { name: "iPhone 15 Pro Max Case", type: "product", category: "Cases", price: 1800, image: "https://picsum.photos/seed/case1/400/400", available: true, featured: true, variants: { colors: ["Black", "Blue", "Clear"] }, specs: ["Premium silicone", "Shockproof", "Wireless charging compatible"], includes: ["1x Case"], shop_id: SEED_SHOP_ID },
    { name: "Samsung Galaxy S24 Ultra Case", type: "product", category: "Cases", price: 1500, image: "https://picsum.photos/seed/case2/400/400", available: true, featured: true, variants: { colors: ["Black", "Green", "Purple"] }, specs: ["Military-grade drop protection", "Soft-touch finish"], includes: ["1x Case"], shop_id: SEED_SHOP_ID },
    { name: "Bluetooth Wireless Earbuds", type: "product", category: "Audio", price: 2500, image: "https://picsum.photos/seed/buds/400/400", available: true, featured: false, variants: { colors: ["White", "Black"] }, specs: ["Bluetooth 5.3", "24hr battery", "IPX5 waterproof"], includes: ["Earbuds", "Charging case", "3x ear tips"], shop_id: SEED_SHOP_ID },
    { name: "USB-C Fast Charger 65W", type: "product", category: "Chargers", price: 2200, image: "https://picsum.photos/seed/charger/400/400", available: true, featured: false, specs: ["GaN technology", "65W PD 3.0", "Foldable plug"], includes: ["Charger", "USB-C cable"], shop_id: SEED_SHOP_ID },
    { name: "Power Bank 20000mAh", type: "product", category: "Chargers", price: 3500, image: "https://picsum.photos/seed/powerbank/400/400", available: true, featured: false, variants: { colors: ["Black", "White"] }, specs: ["20000mAh", "PD 45W", "LED display"], includes: ["Power bank", "USB-C cable"], shop_id: SEED_SHOP_ID },
    { name: "Smart Watch Band 22mm", type: "product", category: "Wearables", price: 500, image: "https://picsum.photos/seed/band/400/400", available: true, featured: false, variants: { colors: ["Black", "Brown", "Blue", "Red"] }, specs: ["Silicone", "Quick-release pins", "Adjustable"], includes: ["1x band"], shop_id: SEED_SHOP_ID },
    { name: "AirPods Pro 2 Case Cover", type: "product", category: "Cases", price: 400, image: "https://picsum.photos/seed/airpodcase/400/400", available: true, featured: false, variants: { colors: ["Black", "Pink", "Blue", "Green"] }, specs: ["Silicone gel", "Shock-absorbent", "Includes carabiner"], includes: ["1x cover"], shop_id: SEED_SHOP_ID },
  ];
  const { error: catErr } = await supabase.from("catalogue").insert(catalogue);
  if (catErr) { console.error("catalogue:", catErr.message); return; }
  console.log("✓ catalogue (7)");

  // ─── 7. Banners ─────────────────────────────────
  const banners = [
    { type: "hero", title: "New Arrivals", subtitle: "Check out the latest cases and chargers", image_url: "https://picsum.photos/seed/banner1/1200/400", active: true, sort_order: 1, shop_id: SEED_SHOP_ID },
    { type: "sale", title: "40% Off Screen Protectors", message: "Limited time offer — stock running out!", image_url: "https://picsum.photos/seed/banner2/1200/400", active: true, sort_order: 2, shop_id: SEED_SHOP_ID },
    { type: "info", title: "Free Delivery", message: "Free delivery on orders over KSh 3,000 within Thika", active: true, sort_order: 3, shop_id: SEED_SHOP_ID },
    { type: "alert", title: "Holiday Hours", message: "We're open 9am-3pm on Saturdays. Closed Sundays.", active: true, sort_order: 4, shop_id: SEED_SHOP_ID },
  ];
  const { error: banErr } = await supabase.from("banners").insert(banners);
  if (banErr) { console.error("banners:", banErr.message); return; }
  console.log("✓ banners (4)");

  // ─── 8. Posts (social media) ─────────────────────
  const posts = [
    { platform: "Instagram", caption: "New iPhone 15 cases have arrived! Grab yours today 🔥 #iPhone15 #Cases", status: "published", likes: 47, comments: 12, reach: 2340, shop_id: SEED_SHOP_ID, created_at: new Date(now - 2 * 86400000).toISOString() },
    { platform: "Instagram", caption: "USB-C fast chargers now in stock — 65W GaN technology ⚡", status: "published", likes: 31, comments: 8, reach: 1890, shop_id: SEED_SHOP_ID, created_at: new Date(now - 5 * 86400000).toISOString() },
    { platform: "Instagram", caption: "Customer review: 'Best earbuds I've ever used!' 🎧", status: "published", likes: 23, comments: 5, reach: 1560, shop_id: SEED_SHOP_ID, created_at: new Date(now - 10 * 86400000).toISOString() },
    { platform: "Instagram", caption: "Flash sale this weekend — 20% off all accessories!", status: "scheduled", scheduled_at: new Date(now + 3 * 86400000).toISOString(), shop_id: SEED_SHOP_ID },
    { platform: "TikTok", caption: "Unboxing the new Samsung S24 Ultra case — link in bio!", status: "published", likes: 89, comments: 21, reach: 5600, shop_id: SEED_SHOP_ID, created_at: new Date(now - 7 * 86400000).toISOString() },
    { platform: "Instagram", caption: "We've restocked the 20000mAh power banks. Stay charged! 🔋", status: "published", likes: 15, comments: 3, reach: 890, shop_id: SEED_SHOP_ID, created_at: new Date(now - 14 * 86400000).toISOString() },
  ];
  const { error: postErr } = await supabase.from("posts").insert(posts);
  if (postErr) { console.error("posts:", postErr.message); return; }
  console.log("✓ posts (6)");

  // ─── 9. Page views (analytics) ─────────────────
  const referrers = ["google", "instagram", "facebook", "direct", "twitter", "whatsapp"];
  const pageViews = [];
  for (let i = 0; i < 200; i++) {
    const catIdx = Math.floor(Math.random() * catalogue.length);
    const cat = catalogue[catIdx];
    const daysAgo = Math.floor(Math.random() * 60);
    pageViews.push({
      shop_id: SEED_SHOP_ID,
      page: `/product/${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
      product_name: cat.name,
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      created_at: new Date(now - daysAgo * 86400000 - Math.random() * 86400000).toISOString(),
    });
  }
  const { error: pvErr } = await supabase.from("page_views").insert(pageViews);
  if (pvErr) { console.error("page_views:", pvErr.message); return; }
  console.log("✓ page_views (200)");

  console.log("\n✅ Seed complete!");
}

seed().catch(console.error);
