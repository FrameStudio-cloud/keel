import { supabase } from "./supabase";
import { withShop } from "./shop";

const QUEUE_KEY = "keel_write_queue";
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 1000;

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.error("[writeQueue] Failed to save queue");
  }
}

export function getPendingWrites() {
  return getQueue().filter((i) => i.status !== "completed").length;
}

function emitEvent(name, detail) {
  try {
    window.dispatchEvent(new CustomEvent(`writeQueue:${name}`, { detail }));
  } catch {}
}

export function enqueueWrite(item) {
  const queue = getQueue();
  queue.push({
    id: crypto.randomUUID(),
    ...item,
    createdAt: Date.now(),
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    lastError: null,
    status: "pending",
  });
  saveQueue(queue);
  emitEvent("enqueued", queue[queue.length - 1]);
  scheduleProcess();
}

let processing = false;
let scheduleId = null;

function scheduleProcess() {
  if (scheduleId) clearTimeout(scheduleId);
  scheduleId = setTimeout(() => {
    scheduleId = null;
    processQueue();
  }, 100);
}

export async function processQueue() {
  if (processing) return;
  processing = true;

  const queue = getQueue();
  const pending = queue.filter(
    (i) => i.status === "pending" || i.status === "retrying"
  );

  for (const item of pending) {
    try {
      await executeWrite(item);
      item.status = "completed";
      item.completedAt = Date.now();
      item.lastError = null;
      saveQueue(queue);
      emitEvent("completed", { ...item });
    } catch (err) {
      item.retryCount++;
      item.lastError = err.message || String(err);
      if (item.retryCount >= item.maxRetries) {
        item.status = "failed";
        saveQueue(queue);
        emitEvent("failed", { ...item });
      } else {
        item.status = "retrying";
        saveQueue(queue);
        emitEvent("retrying", { ...item });
        const delay = Math.min(
          RETRY_BASE_MS * Math.pow(2, item.retryCount - 1),
          16000
        );
        setTimeout(() => processQueue(), delay);
      }
    }
  }

  cleanupQueue();
  processing = false;

  if (
    getQueue().some(
      (i) => i.status === "pending" || i.status === "retrying"
    )
  ) {
    scheduleProcess();
  }
}

async function executeWrite(item) {
  const shopId = item.shopId;

  switch (item.type) {
    case "logSale": {
      const { sale, stockUpdate } = item.payload;
      const { error: saleError } = await supabase
        .from("sales")
        .insert({ ...sale, shop_id: shopId });
      if (saleError) throw saleError;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: stockUpdate.newStock })
        .eq("id", stockUpdate.productId)
        .eq("shop_id", shopId);
      if (stockError) throw stockError;

      if (stockUpdate.lowStockAlert) {
        supabase.functions
          .invoke("send-low-stock-alert", stockUpdate.lowStockAlert)
          .catch((e) => console.error("low stock alert failed", e));
      }
      break;
    }

    case "addProduct": {
      const { product, attributes } = item.payload;
      const { data: newProduct, error: prodError } = await supabase
        .from("products")
        .insert({ ...product, shop_id: shopId })
        .select("id")
        .single();
      if (prodError) throw prodError;

      if (attributes && attributes.length > 0) {
        const attrEntries = attributes.map((a) => ({
          product_id: newProduct.id,
          attribute_id: a.attribute_id,
          value: a.value,
          shop_id: shopId,
        }));
        const { error: attrError } = await supabase
          .from("product_attribute_values")
          .insert(attrEntries);
        if (attrError) throw attrError;
      }
      break;
    }

    case "updateProduct": {
      const { productId, product, attributes } = item.payload;
      const { error: prodError } = await supabase
        .from("products")
        .update(product)
        .eq("id", productId)
        .eq("shop_id", shopId);
      if (prodError) throw prodError;

      if (attributes && attributes.length > 0) {
        const attrEntries = attributes.map((a) => ({
          product_id: productId,
          attribute_id: a.attribute_id,
          value: a.value,
          shop_id: shopId,
        }));
        const { error: attrError } = await supabase
          .from("product_attribute_values")
          .upsert(attrEntries, { onConflict: "product_id, attribute_id" });
        if (attrError) throw attrError;
      }
      break;
    }

    case "deleteProduct": {
      const { id } = item.payload;
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("shop_id", shopId);
      if (error) throw error;
      break;
    }

    case "adjustStock": {
      const { movement, stockUpdate } = item.payload;
      const { error: moveError } = await supabase
        .from("stock_movements")
        .insert({ ...movement, shop_id: shopId });
      if (moveError) throw moveError;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: stockUpdate.newStock })
        .eq("id", stockUpdate.productId)
        .eq("shop_id", shopId);
      if (stockError) throw stockError;

      if (stockUpdate.lowStockAlert) {
        supabase.functions
          .invoke("send-low-stock-alert", stockUpdate.lowStockAlert)
          .catch((e) => console.error("low stock alert failed", e));
      }
      break;
    }

    default:
      console.error(`[writeQueue] Unknown type: ${item.type}`);
  }
}

function cleanupQueue() {
  const queue = getQueue();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const filtered = queue.filter(
    (i) =>
      i.status !== "completed" ||
      (i.completedAt && i.completedAt > cutoff)
  );
  if (filtered.length !== queue.length) saveQueue(filtered);
}

export function retryWrite(id) {
  const queue = getQueue();
  const item = queue.find((i) => i.id === id);
  if (!item) return;
  item.status = "pending";
  item.retryCount = 0;
  item.lastError = null;
  saveQueue(queue);
  scheduleProcess();
}

export function retryAllFailed() {
  const queue = getQueue();
  let changed = false;
  queue.forEach((i) => {
    if (i.status === "failed") {
      i.status = "pending";
      i.retryCount = 0;
      i.lastError = null;
      changed = true;
    }
  });
  if (changed) {
    saveQueue(queue);
    scheduleProcess();
  }
}
