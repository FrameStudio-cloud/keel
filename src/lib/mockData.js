import { DEFAULT_SERVICES } from "./defaultServices";

let services = [...DEFAULT_SERVICES];

let customers = [
  { id: "c1", name: "Jane Muthoni", phone: "0712345678", email: "jane@email.com", notes: "Prefers unscented detergent", total_orders: 12, total_spent: 8450 },
  { id: "c2", name: "Peter Kamau", phone: "0723456789", email: "", notes: "", total_orders: 5, total_spent: 3200 },
  { id: "c3", name: "Mary Wanjiku", phone: "0734567890", email: "mary@email.com", notes: "Regular — add fabric softener always", total_orders: 24, total_spent: 18600 },
  { id: "c4", name: "John Ochieng", phone: "0745678901", email: "", notes: "Prefers starch on shirts", total_orders: 3, total_spent: 2400 },
  { id: "c5", name: "Grace Akinyi", phone: "0756789012", email: "grace@email.com", notes: "", total_orders: 8, total_spent: 7200 },
  { id: "c6", name: "David Kimani", phone: "0767890123", email: "", notes: "Rush orders — always calls ahead", total_orders: 15, total_spent: 12350 },
  { id: "c7", name: "Sarah Chebet", phone: "0778901234", email: "sarah@email.com", notes: "Drop off after 2pm preferred", total_orders: 6, total_spent: 3800 },
  { id: "c8", name: "Michael Njoroge", phone: "0789012345", email: "", notes: "", total_orders: 2, total_spent: 1400 },
  { id: "c9", name: "Samuel Kiprop", phone: "0790123456", email: "sam@email.com", notes: "New customer — referred by Jane", total_orders: 1, total_spent: 1650 },
  { id: "c10", name: "Faith Nyambura", phone: "0701234567", email: "", notes: "Leather garments — handle with care", total_orders: 4, total_spent: 5100 },
];

let orders = [
  {
    id: "ORD-001", customer: { id: "c1", name: "Jane Muthoni", phone: "0712345678" },
    status: "in_progress", payment_method: "Cash", notes: "Collect by 5pm",
    items: [
      { service_id: "s4", service_name: "Dry Clean — Shirt", quantity: 2, notes: "Stain on left sleeve" },
      { service_id: "s1", service_name: "Wash & Fold", quantity: 4, weight_kg: 4, notes: "" },
      { service_id: "s3", service_name: "Pressing Only", quantity: 1, notes: "Lace trim — delicate" },
    ],
    subtotal: 1650, total: 1650, created_at: "2026-07-24T10:30:00",
  },
  {
    id: "ORD-002", customer: { id: "c2", name: "Peter Kamau", phone: "0723456789" },
    status: "ready", payment_method: "M-Pesa", notes: "",
    items: [
      { service_id: "s3", service_name: "Pressing Only", quantity: 3, notes: "" },
      { service_id: "s4", service_name: "Dry Clean — Shirt", quantity: 2, notes: "Cuff button missing" },
    ],
    subtotal: 1150, total: 1150, created_at: "2026-07-24T09:15:00",
  },
  {
    id: "ORD-003", customer: { id: "c3", name: "Mary Wanjiku", phone: "0734567890" },
    status: "completed", payment_method: "Cash", notes: "Regular customer — add fabric softener",
    items: [
      { service_id: "s1", service_name: "Wash & Fold", quantity: 10, weight_kg: 10, notes: "" },
      { service_id: "s13", service_name: "Stain Removal", quantity: 1, notes: "Collar stain" },
    ],
    subtotal: 2200, total: 2200, created_at: "2026-07-24T08:00:00",
  },
  {
    id: "ORD-004", customer: { id: "c4", name: "John Ochieng", phone: "0745678901" },
    status: "pending", payment_method: "Cash", notes: "Add starch",
    items: [
      { service_id: "s2", service_name: "Wash & Iron", quantity: 5, weight_kg: 5, notes: "Starch light" },
    ],
    subtotal: 1500, total: 1500, created_at: "2026-07-24T11:00:00",
  },
  {
    id: "ORD-005", customer: { id: "c5", name: "Grace Akinyi", phone: "0756789012" },
    status: "cancelled", payment_method: "M-Pesa", notes: "Customer changed mind",
    items: [
      { service_id: "s3", service_name: "Pressing Only", quantity: 2, notes: "" },
      { service_id: "s6", service_name: "Dry Clean — Dress", quantity: 1, notes: "Silk — delicate" },
    ],
    subtotal: 900, total: 900, created_at: "2026-07-23T16:30:00",
  },
  {
    id: "ORD-006", customer: { id: "c6", name: "David Kimani", phone: "0767890123" },
    status: "in_progress", payment_method: "Card", notes: "Rush order",
    items: [
      { service_id: "s5", service_name: "Dry Clean — Suit", quantity: 1, notes: "Button needs replacing" },
      { service_id: "s4", service_name: "Dry Clean — Shirt", quantity: 3, notes: "" },
      { service_id: "s17", service_name: "Express Service", quantity: 1, notes: "" },
    ],
    subtotal: 2050, total: 2050, created_at: "2026-07-24T10:45:00",
  },
  {
    id: "ORD-007", customer: { id: "c7", name: "Sarah Chebet", phone: "0778901234" },
    status: "pending", payment_method: "Cash", notes: "Drop off after 2pm",
    items: [
      { service_id: "s9", service_name: "Duvet Cleaning", quantity: 2, notes: "" },
    ],
    subtotal: 1200, total: 1200, created_at: "2026-07-24T11:30:00",
  },
  {
    id: "ORD-008", customer: { id: "c8", name: "Michael Njoroge", phone: "0789012345" },
    status: "completed", payment_method: "M-Pesa", notes: "",
    items: [
      { service_id: "s4", service_name: "Dry Clean — Shirt", quantity: 4, notes: "" },
    ],
    subtotal: 1400, total: 1400, created_at: "2026-07-23T14:00:00",
  },
  {
    id: "ORD-009", customer: { id: "c1", name: "Jane Muthoni", phone: "0712345678" },
    status: "ready", payment_method: "Cash", notes: "",
    items: [
      { service_id: "s3", service_name: "Pressing Only", quantity: 2, notes: "" },
    ],
    subtotal: 300, total: 300, created_at: "2026-07-24T07:30:00",
  },
  {
    id: "ORD-010", customer: { id: "c9", name: "Samuel Kiprop", phone: "0790123456" },
    status: "pending", payment_method: "M-Pesa", notes: "New customer",
    items: [
      { service_id: "s5", service_name: "Dry Clean — Suit", quantity: 1, notes: "Leather — special care" },
      { service_id: "s16", service_name: "Leather Care", quantity: 1, notes: "" },
    ],
    subtotal: 2000, total: 2000, created_at: "2026-07-24T12:00:00",
  },
  {
    id: "ORD-011", customer: { id: "c10", name: "Faith Nyambura", phone: "0701234567" },
    status: "in_progress", payment_method: "Cash", notes: "",
    items: [
      { service_id: "s3", service_name: "Pressing Only", quantity: 1, notes: "Beaded — hand wash" },
      { service_id: "s4", service_name: "Dry Clean — Shirt", quantity: 2, notes: "" },
    ],
    subtotal: 850, total: 850, created_at: "2026-07-24T10:00:00",
  },
];

let nextOrderId = 12;
let nextCustomerId = 11;
let listeners = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getServices() {
  return services;
}

export function getCustomers() {
  return customers;
}

export function getOrders() {
  return orders;
}

export function createOrder({ customerName, customerPhone, items, notes, total, payment_method }) {
  const now = new Date().toISOString();
  const orderId = `ORD-${String(++nextOrderId).padStart(3, "0")}`;

  let customer = customers.find((c) => c.phone === customerPhone);
  if (customer) {
    customer.total_orders++;
    customer.total_spent += total;
  } else {
    customer = {
      id: `c${++nextCustomerId}`,
      name: customerName,
      phone: customerPhone,
      email: "",
      notes: "",
      total_orders: 1,
      total_spent: total,
    };
    customers.unshift(customer);
  }

  const order = {
    id: orderId,
    customer: { id: customer.id, name: customer.name, phone: customer.phone },
    status: "pending",
    payment_method: payment_method || "Cash",
    notes: notes || "",
    items,
    subtotal: total,
    total,
    created_at: now,
  };

  orders.unshift(order);
  notify();
  return { order, isNewCustomer: !customers.find((c) => c.phone === customerPhone && c.total_orders === 1) };
}

export function updateOrder(orderId, data) {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    Object.assign(order, data);
    notify();
  }
}

export function updateCustomer(id, data) {
  const idx = customers.findIndex((c) => c.id === id);
  if (idx >= 0) {
    customers[idx] = { ...customers[idx], ...data };
    notify();
  }
}

export function deleteCustomer(id) {
  customers = customers.filter((c) => c.id !== id);
  notify();
}

export function updateOrderStatus(orderId, status) {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    notify();
  }
}