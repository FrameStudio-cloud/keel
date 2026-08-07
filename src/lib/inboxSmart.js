const ORDER_WORDS = [
  "i want", "i'd like", "i would like", "i need", "i will take", "i'll take",
  "how much", "how many", "what's the price", "what is the price", "price",
  "cost", "order", "ordering", "order for", "buy", "buying", "purchase",
  "available", "do you have", "you have", "do u have", "in stock", "stock",
  "can i get", "can i order", "get one", "deliver", "delivery", "delivery fee",
  "send it", "bring", "take one", "i want to pay", "pay",
];

export function detectIntent(text) {
  const lower = String(text || "").toLowerCase();
  if (!lower) return null;
  if (ORDER_WORDS.some((w) => lower.includes(w))) return "order";
  return null;
}

export function matchProduct(text, products) {
  const lower = String(text || "").toLowerCase();
  if (!lower || !Array.isArray(products) || products.length === 0) return null;

  const tokens = lower
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  for (const product of products) {
    const name = String(product.name || "").toLowerCase();
    if (!name) continue;
    if (name.length > 2 && lower.includes(name)) return product;
    const nameTokens = name.split(/\s+/).filter((w) => w.length >= 4);
    if (nameTokens.length > 0 && nameTokens.some((t) => tokens.includes(t))) {
      return product;
    }
  }
  return null;
}

export function suggestAction(text, products) {
  const product = matchProduct(text, products);
  if (product) {
    return { kind: "product", product, label: product.name };
  }
  const intent = detectIntent(text);
  if (intent === "order") {
    return { kind: "order", product: null, label: "Looks like an order request" };
  }
  return null;
}
