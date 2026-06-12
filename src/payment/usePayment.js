import { useState } from "react";
import { supabase } from "../lib/supabase";

export function usePayment() {
  const [processing, setProcessing] = useState(false);

  async function saveIntaSendSale({ product, quantity, amount, method, invoiceId }) {
    setProcessing(true);

    const { error: saleError } = await supabase.from("sales").insert({
      product_id: product.id,
      product_name: product.name,
      amount,
      quantity,
      method: method || "IntaSend",
    });

    if (saleError) {
      setProcessing(false);
      return { error: saleError };
    }

    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: product.stock - quantity })
      .eq("id", product.id);

    if (stockError) {
      setProcessing(false);
      return { error: stockError };
    }

    await supabase.from("payments").insert({
      invoice_id: invoiceId,
      provider: "IntaSend",
      amount,
      status: "completed",
    });

    await supabase.from("stock_movements").insert({
      product_id: product.id,
      product_name: product.name,
      change: -quantity,
      reason: `Sale via IntaSend (${method})`,
    });

    setProcessing(false);
    return { success: true };
  }

  async function handleIntaFailed(error) {
    console.error("IntaSend payment failed:", error);
  }

  return { processing, saveIntaSendSale, handleIntaFailed };
}
