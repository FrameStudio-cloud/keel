/* eslint-disable no-unused-vars */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLowStockCount, useLowStockProducts, useSlowMovingStock, useAnnouncements, useUpcomingScheduledPosts } from "./useQueries";

const mockShopId = "shop-uuid-456";

vi.mock("../lib/format", () => ({ formatPrice: (v) => `KSh ${v}` }));

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../lib/shop", () => ({
  getShopId: vi.fn(),
}));

vi.mock("../hooks/useSettings", () => ({
  useSettings: vi.fn(),
}));

import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { useSettings } from "../hooks/useSettings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  queryClient.clear();
  getShopId.mockResolvedValue(mockShopId);
  useSettings.mockReturnValue({ lowStockThreshold: 6 });
});

describe("useLowStockCount", () => {
  it("returns count from products query", async () => {
    const lte = vi.fn(() => Promise.resolve({ count: 7, error: null }));
    const eq = vi.fn(() => ({ lte }));
    const select = vi.fn(() => ({ eq }));
    supabase.from.mockReturnValue({ select });

    const { result } = renderHook(() => useLowStockCount(), { wrapper });

    await waitFor(() => expect(result.current.data).toBe(7));
    expect(select).toHaveBeenCalledWith("*", { count: "exact", head: true });
  });

  it("returns 0 when no shopId", async () => {
    getShopId.mockResolvedValue(null);

    const { result } = renderHook(() => useLowStockCount(), { wrapper });

    await waitFor(() => expect(result.current.data).toBe(0));
  });
});

describe("useLowStockProducts", () => {
  it("returns products with stock below threshold", async () => {
    const products = [{ id: "1", name: "Low Stock Item", stock: 2 }];
    const limit = vi.fn(() => Promise.resolve({ data: products, error: null }));
    const order = vi.fn(() => ({ limit }));
    const lte = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ lte }));
    const select = vi.fn(() => ({ eq }));
    supabase.from.mockReturnValue({ select });

    const { result } = renderHook(() => useLowStockProducts(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(products));
  });

  it("returns empty array when no shopId", async () => {
    getShopId.mockResolvedValue(null);

    const { result } = renderHook(() => useLowStockProducts(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});

describe("useSlowMovingStock", () => {
  it("returns products with no sales in 30 days", async () => {
    const products = [
      { id: "p1", name: "Slow Mover", stock: 50 },
      { id: "p2", name: "Normal", stock: 10 },
    ];
    const sales = [{ product_id: "p2", quantity: 10 }];

    // Sales chain: select → eq → gte → limit → Promise
    const salesLimit = vi.fn(() => Promise.resolve({ data: sales, error: null }));
    const salesGte = vi.fn(() => ({ limit: salesLimit }));
    const salesEq = vi.fn(() => ({ gte: salesGte }));
    const salesSelect = vi.fn(() => ({ eq: salesEq }));

    // Products chain: select → eq → order → limit → Promise
    const prodLimit = vi.fn(() => Promise.resolve({ data: products, error: null }));
    const prodOrder = vi.fn(() => ({ limit: prodLimit }));
    const prodEq = vi.fn(() => ({ order: prodOrder }));
    const prodSelect = vi.fn(() => ({ eq: prodEq }));

    supabase.from.mockImplementation((table) => {
      if (table === "sales") return { select: salesSelect };
      return { select: prodSelect };
    });

    const { result } = renderHook(() => useSlowMovingStock(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe("p1");
    });
  });
});

describe("useAnnouncements", () => {
  it("returns active announcements not dismissed by shop", async () => {
    const announcements = [
      { id: "a1", title: "Active" },
      { id: "a2", title: "Dismissed" },
    ];
    const dismissals = [{ announcement_id: "a2" }];

    // Announcements chain: select → eq → lte → or → order → order → limit → Promise
    const annLimit = vi.fn(() => Promise.resolve({ data: announcements, error: null }));
    const annOrder2 = vi.fn(() => ({ limit: annLimit }));
    const annOrder = vi.fn(() => ({ order: annOrder2 }));
    const annOr = vi.fn(() => ({ order: annOrder }));
    const annLte = vi.fn(() => ({ or: annOr }));
    const annEq = vi.fn(() => ({ lte: annLte }));
    const annSelect = vi.fn(() => ({ eq: annEq }));

    // Dismissals chain: select → eq → Promise
    const dissEq = vi.fn(() => Promise.resolve({ data: dismissals, error: null }));
    const dissSelect = vi.fn(() => ({ eq: dissEq }));

    supabase.from.mockImplementation((table) => {
      if (table === "announcements") return { select: annSelect };
      if (table === "announcement_dismissals") return { select: dissSelect };
      return {};
    });

    const { result } = renderHook(() => useAnnouncements(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe("a1");
    });
  });

  it("returns all announcements when no shopId (no dismissals filter)", async () => {
    getShopId.mockResolvedValue(null);
    const announcements = [{ id: "a1", title: "Active" }];

    const annLimit = vi.fn(() => Promise.resolve({ data: announcements, error: null }));
    const annOrder2 = vi.fn(() => ({ limit: annLimit }));
    const annOrder = vi.fn(() => ({ order: annOrder2 }));
    const annOr = vi.fn(() => ({ order: annOrder }));
    const annLte = vi.fn(() => ({ or: annOr }));
    const annEq = vi.fn(() => ({ lte: annLte }));
    const annSelect = vi.fn(() => ({ eq: annEq }));

    supabase.from.mockReturnValue({ select: annSelect });

    const { result } = renderHook(() => useAnnouncements(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });
  });
});

describe("useUpcomingScheduledPosts", () => {
  it("returns scheduled posts for the week", async () => {
    const posts = [{ id: "post1", caption: "Sale!", platform: "instagram", scheduled_at: new Date().toISOString(), post_type: "promo" }];

    // Posts chain: select → eq → eq → gte → lte → order → limit → Promise
    const limit = vi.fn(() => Promise.resolve({ data: posts, error: null }));
    const order = vi.fn(() => ({ limit }));
    const lte = vi.fn(() => ({ order }));
    const gte = vi.fn(() => ({ lte }));
    const statusEq = vi.fn(() => ({ gte }));
    const shopEq = vi.fn(() => ({ eq: statusEq }));
    const select = vi.fn(() => ({ eq: shopEq }));

    supabase.from.mockReturnValue({ select });

    const { result } = renderHook(() => useUpcomingScheduledPosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });
  });

  it("returns empty array when no shopId", async () => {
    getShopId.mockResolvedValue(null);

    const { result } = renderHook(() => useUpcomingScheduledPosts(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
