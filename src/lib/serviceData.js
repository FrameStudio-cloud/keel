import { supabase } from "./supabase";
import { getShopId } from "./shop";

export async function fetchOrders({ status, page = 0, pageSize = 50, search = "" } = {}) {
  const shopId = await getShopId();
  if (!shopId) return { data: [], total: 0 };

  let query = supabase
    .from("service_orders")
    .select("*, customer:customer_id(id, name, phone, email), items:service_order_items(*)", { count: "exact" })
    .eq("shop_id", shopId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    query = query.or(`id.ilike.%${escaped}%,customer_id.in:select id from customers where name.ilike.%${escaped}%`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  const mapped = (data || []).map((o) => ({
    id: o.id,
    customer: o.customer || { id: o.customer_id, name: "Unknown", phone: "" },
    customer_id: o.customer_id,
    status: o.status,
    payment_method: o.payment_method,
    notes: o.notes || "",
    items: (o.items || []).map((i) => ({
      service_id: i.id,
      service_name: i.service_name,
      service_price: i.service_price,
      quantity: i.quantity,
      weight_kg: i.weight_kg,
      line_total: i.line_total,
      notes: i.notes || "",
    })),
    subtotal: o.subtotal,
    total: o.total,
    status_history: o.status_history,
    created_at: o.created_at,
  }));

  return { data: mapped, total: count ?? 0 };
}

export async function fetchOrderById(orderId) {
  const { data, error } = await supabase
    .from("service_orders")
    .select("*, customer:customer_id(id, name, phone, email), items:service_order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    customer: data.customer || { id: data.customer_id, name: "Unknown", phone: "" },
    customer_id: data.customer_id,
    status: data.status,
    payment_method: data.payment_method,
    notes: data.notes || "",
    items: (data.items || []).map((i) => ({
      service_id: i.id,
      service_name: i.service_name,
      service_price: i.service_price,
      quantity: i.quantity,
      weight_kg: i.weight_kg,
      line_total: i.line_total,
      notes: i.notes || "",
    })),
    subtotal: data.subtotal,
    total: data.total,
    status_history: data.status_history,
    created_at: data.created_at,
  };
}

export async function createOrder({ customerName, customerPhone, items, notes, total, payment_method }) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  let customerId;
  const { data: existing } = await supabase
    .from("customers")
    .select("id, total_visits, total_spent")
    .eq("shop_id", shopId)
    .eq("phone", customerPhone)
    .maybeSingle();

  if (existing) {
    customerId = existing.id;
    await supabase.from("customers").update({
      total_visits: existing.total_visits + 1,
      total_spent: (existing.total_spent || 0) + total,
      last_seen: new Date().toISOString(),
    }).eq("id", existing.id);
  } else {
    const { data: newCust } = await supabase.from("customers").insert({
      shop_id: shopId,
      name: customerName,
      phone: customerPhone,
      total_visits: 1,
      total_spent: total,
    }).select("id").single();
    customerId = newCust.id;
  }

  const { data: order, error: orderError } = await supabase.from("service_orders").insert({
    shop_id: shopId,
    customer_id: customerId,
    status: "pending",
    payment_method: payment_method || "Cash",
    notes: notes || "",
    subtotal: total,
    total,
    status_history: [{ status: "pending", at: new Date().toISOString() }],
  }).select("id").single();

  if (orderError) throw orderError;

  const orderItems = items.filter((i) => i.service_id).map((i) => ({
    order_id: order.id,
    service_name: i.service_name,
    service_price: i.service_price,
    quantity: i.quantity,
    weight_kg: i.weight_kg || null,
    line_total: i.line_total,
    notes: i.notes || "",
  }));

  const { error: itemsError } = await supabase.from("service_order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  return { id: order.id };
}

export async function updateOrder(orderId, data) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const updates = {};
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.payment_method !== undefined) updates.payment_method = data.payment_method;
  if (data.subtotal !== undefined) updates.subtotal = data.subtotal;
  if (data.total !== undefined) updates.total = data.total;
  updates.updated_at = new Date().toISOString();

  const { error: orderError } = await supabase
    .from("service_orders")
    .update(updates)
    .eq("id", orderId)
    .eq("shop_id", shopId);
  if (orderError) throw orderError;

  if (data.items) {
    const { error: delError } = await supabase
      .from("service_order_items")
      .delete()
      .eq("order_id", orderId);
    if (delError) throw delError;

    const orderItems = data.items.filter((i) => i.service_id).map((i) => ({
      order_id: orderId,
      service_name: i.service_name,
      service_price: i.service_price,
      quantity: i.quantity,
      weight_kg: i.weight_kg || null,
      line_total: i.line_total,
      notes: i.notes || "",
    }));

    if (orderItems.length > 0) {
      const { error: insError } = await supabase.from("service_order_items").insert(orderItems);
      if (insError) throw insError;
    }
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { data: order } = await supabase
    .from("service_orders")
    .select("status_history")
    .eq("id", orderId)
    .eq("shop_id", shopId)
    .single();

  const history = order?.status_history || [];
  history.push({ status: newStatus, at: new Date().toISOString() });

  const { error } = await supabase
    .from("service_orders")
    .update({ status: newStatus, status_history: history, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("shop_id", shopId);
  if (error) throw error;
}

export async function fetchCustomers(search = "") {
  const shopId = await getShopId();
  if (!shopId) return [];

  let query = supabase
    .from("customers")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    query = query.or(`name.ilike.%${escaped}%,phone.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone || "",
    email: c.email || "",
    notes: c.notes || "",
    total_orders: c.total_visits || 0,
    total_spent: c.total_spent || 0,
  }));
}

export async function updateCustomer(id, data) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { error } = await supabase
    .from("customers")
    .update({ name: data.name, phone: data.phone, email: data.email || "", notes: data.notes || "" })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) throw error;
}

export async function deleteCustomer(id) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { error } = await supabase.from("customers").delete().eq("id", id).eq("shop_id", shopId);
  if (error) throw error;
}

export async function fetchServiceRevenue() {
  const shopId = await getShopId();
  if (!shopId) return { revenue: 0, transactions: 0, paymentData: [] };

  const { data, error } = await supabase
    .from("service_orders")
    .select("total, payment_method, created_at")
    .eq("shop_id", shopId)
    .eq("status", "completed")
    .limit(2000);

  if (error) throw error;

  const completed = data || [];
  const revenue = completed.reduce((sum, o) => sum + (o.total || 0), 0);

  const methodMap = {};
  completed.forEach((o) => {
    const m = o.payment_method || "Cash";
    methodMap[m] = (methodMap[m] || 0) + (o.total || 0);
  });

  const paymentData = Object.entries(methodMap).map(([method, amount]) => ({
    name: method,
    value: amount,
    color: { Cash: "#10b981", "M-Pesa": "#3b82f6", Card: "#8b5cf6", "Bank Transfer": "#f59e0b" }[method] || "#6b7280",
  }));

  return { revenue, transactions: completed.length, paymentData };
}

export async function fetchRevenuePerService() {
  const shopId = await getShopId();
  if (!shopId) return [];

  const { data, error } = await supabase
    .from("service_orders")
    .select("id, total, created_at, items:service_order_items(service_name, service_price, quantity, line_total)")
    .eq("shop_id", shopId)
    .eq("status", "completed")
    .limit(2000);

  if (error) throw error;

  const serviceMap = {};
  (data || []).forEach((o) => {
    (o.items || []).forEach((item) => {
      const name = item.service_name || "Unknown";
      if (!serviceMap[name]) serviceMap[name] = { name, qty: 0, revenue: 0 };
      serviceMap[name].qty += Number(item.quantity) || 1;
      serviceMap[name].revenue += Number(item.line_total) || 0;
    });
  });

  return Object.values(serviceMap);
}

export async function fetchOrderCounts() {
  const shopId = await getShopId();
  if (!shopId) return {};

  const { data, error } = await supabase
    .from("service_orders")
    .select("status")
    .eq("shop_id", shopId);

  if (error) throw error;

  const counts = { all: data?.length || 0, pending: 0, in_progress: 0, ready: 0, completed: 0, cancelled: 0 };
  (data || []).forEach((o) => {
    if (counts[o.status] !== undefined) counts[o.status]++;
  });

  return counts;
}

export async function fetchServices(category) {
  const shopId = await getShopId();
  if (!shopId) return [];

  let query = supabase
    .from("services")
    .select("*")
    .eq("shop_id", shopId)
    .eq("visible", true)
    .order("created_at", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function seedDefaultServices(category) {
  const shopId = await getShopId();
  if (!shopId) return [];

  const { count, error: countError } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);
  if (countError) throw countError;

  if (count > 0) {
    return await fetchServices(category);
  }

  const { DEFAULT_SERVICES } = await import("./defaultServices");
  const toSeed = DEFAULT_SERVICES.filter(
    (s) => s.category.toLowerCase() === (category || "").toLowerCase()
  );

  if (toSeed.length === 0) return [];

  const inserts = toSeed.map((s) => ({
    shop_id: shopId,
    category: s.category,
    name: s.name,
    pricing_mode: s.pricing_mode,
    price: s.price,
    unit_label: s.unit_label || null,
    description: s.description || null,
    visible: true,
  }));

  const { error: insError } = await supabase.from("services").insert(inserts);
  if (insError) throw insError;

  return await fetchServices(category);
}

export async function createService(data) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { error } = await supabase.from("services").insert({
    shop_id: shopId,
    category: data.category,
    name: data.name,
    pricing_mode: data.pricing_mode,
    price: data.price,
    unit_label: data.unit_label || null,
    description: data.description || null,
    visible: true,
  });
  if (error) throw error;
}

export async function updateService(id, data) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { error } = await supabase
    .from("services")
    .update({
      name: data.name,
      category: data.category,
      pricing_mode: data.pricing_mode,
      price: data.price,
      unit_label: data.unit_label || null,
      description: data.description || null,
    })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) throw error;
}

export async function deleteService(id) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop ID");

  const { error } = await supabase
    .from("services")
    .update({ visible: false })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) throw error;
}
