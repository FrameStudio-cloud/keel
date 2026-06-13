import { useState } from "react";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";

export function usePayment() {
  const [processing, setProcessing] = useState(false);

  async function saveIntaSendSale({ product, quantity, amount, method, invoiceId }) {
    const shopId = await getShopId();
    setProcessing(true);

    const { error: saleError } = await supabase.from("sales").insert(withShop({
      product_id: product.id,
      product_name: product.name,
      amount,
      quantity,
      method: method || "IntaSend",
    }));

    if (saleError) {
      setProcessing(false);
      return { error: saleError };
    }

    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: product.stock - quantity })
      .eq("id", product.id)
      .eq("shop_id", shopId);

    if (stockError) {
      setProcessing(false);
      return { error: stockError };
    }

    await supabase.from("payments").insert(withShop({
      invoice_id: invoiceId,
      provider: "IntaSend",
      amount,
      status: "completed",
    }));

    await supabase.from("stock_movements").insert(withShop({
      product_id: product.id,
      product_name: product.name,
      change: -quantity,
      reason: `Sale via IntaSend (${method})`,
    }));

    setProcessing(false);
    return { success: true };
  }

  async function handleIntaFailed(error) {
    console.error("IntaSend payment failed:", error);
  }

  return { processing, saveIntaSendSale, handleIntaFailed };
}
