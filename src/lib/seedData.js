import { getShopId, withShop } from "./shop";
import { supabase } from "./supabase";

const DEMO_PRODUCTS = [
  { name: "iPhone 15 Case", category: "Cases", price: 3500, cost_price: 1800, stock: 15, barcode: null },
  { name: "Wireless Charger", category: "Accessories", price: 2500, cost_price: 1200, stock: 20, barcode: null },
  { name: "Bluetooth Speaker", category: "Audio", price: 4500, cost_price: 2800, stock: 10, barcode: null },
  { name: "Screen Protector", category: "Accessories", price: 800, cost_price: 350, stock: 30, barcode: null },
  { name: "USB-C Cable", category: "Accessories", price: 600, cost_price: 250, stock: 50, barcode: null },
];

const METHODS = ["Cash", "M-Pesa", "M-Pesa", "Cash", "Bank"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
  return d;
}

export async function seedDemoData() {
  const shopId = await getShopId();
  if (!shopId) return { ok: false, error: "No shop ID" };

  await supabase.from("sales").delete().eq("shop_id", shopId);
  await supabase.from("expenses").delete().eq("shop_id", shopId);

  const insertedProducts = [];
  for (const p of DEMO_PRODUCTS) {
    const { data: existing } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .eq("name", p.name)
      .maybeSingle();

    if (existing) {
      await supabase.from("products").update({ cost_price: p.cost_price }).eq("id", existing.id);
      insertedProducts.push({ ...existing, cost_price: p.cost_price });
    } else {
      const { data: created } = await supabase
        .from("products")
        .insert(withShop(p))
        .select()
        .single();
      if (created) insertedProducts.push(created);
    }
  }

  if (insertedProducts.length === 0) {
    return { ok: false, error: "Could not create or find products." };
  }

  const sales = [];
  for (let day = 6; day >= 0; day--) {
    const numSales = randomInt(3, 8);
    for (let i = 0; i < numSales; i++) {
      const product = insertedProducts[randomInt(0, insertedProducts.length - 1)];
      const qty = randomInt(1, 3);
      const amount = product.price * qty;
      sales.push({
        product_id: product.id,
        product_name: product.name,
        amount,
        quantity: qty,
        method: METHODS[randomInt(0, METHODS.length - 1)],
        shop_id: shopId,
        created_at: daysAgo(day).toISOString(),
      });
    }
  }

  for (const s of sales) {
    await supabase.from("sales").insert(s);
  }

  const expenseDescriptions = [
    { desc: "Shop electricity bill", cat: "Utilities", amt: 3500 },
    { desc: "Transport to supplier", cat: "Transport", amt: 800 },
    { desc: "Cleaning supplies", cat: "Supplies", amt: 1200 },
    { desc: "Social media ads", cat: "Marketing", amt: 2000 },
    { desc: "Staff transport refund", cat: "Transport", amt: 500 },
    { desc: "Packaging materials", cat: "Supplies", amt: 1500 },
    { desc: "Internet bill", cat: "Utilities", amt: 3000 },
    { desc: "Store maintenance", cat: "Maintenance", amt: 2500 },
  ];

  const expenses = [];
  for (let day = 29; day >= 0; day--) {
    if (Math.random() > 0.35) continue;
    const e = expenseDescriptions[randomInt(0, expenseDescriptions.length - 1)];
    expenses.push({
      description: e.desc,
      amount: e.amt + randomInt(-200, 500),
      category: e.cat,
      payment_method: METHODS[randomInt(0, METHODS.length - 1)],
      expense_date: daysAgo(day).toISOString().slice(0, 10),
      shop_id: shopId,
    });
  }

  for (const e of expenses) {
    await supabase.from("expenses").insert(e);
  }

  return { ok: true };
}
