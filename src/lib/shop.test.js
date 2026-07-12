import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearShopId, getShopId, withShop } from "./shop";

const mockUserId = "auth-user-123";
const mockShopId = "shop-uuid-456";

vi.mock("./supabase", () => ({
  supabase: { from: vi.fn() },
  getPersistedSession: vi.fn(),
}));

import { supabase, getPersistedSession } from "./supabase";

beforeEach(() => {
  vi.clearAllMocks();
  clearShopId();
  getPersistedSession.mockReturnValue({
    user: { id: mockUserId },
    access_token: "token-abc",
  });
});

function mockSupabase(data) {
  const maybeSingle = vi.fn().mockResolvedValue({ data });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  supabase.from.mockReturnValue({ select });
  return { eq, select, maybeSingle };
}

describe("getShopId", () => {
  it("returns null when no session", async () => {
    getPersistedSession.mockReturnValue(null);
    const result = await getShopId();
    expect(result).toBeNull();
  });

  it("returns shop_id from users table", async () => {
    const { eq, select } = mockSupabase({ shop_id: mockShopId });

    const result = await getShopId();
    expect(result).toBe(mockShopId);
    expect(supabase.from).toHaveBeenCalledWith("users");
    expect(select).toHaveBeenCalledWith("shop_id");
    expect(eq).toHaveBeenCalledWith("auth_user_id", mockUserId);
  });

  it("caches the result on subsequent calls", async () => {
    mockSupabase({ shop_id: mockShopId });

    await getShopId();
    await getShopId();

    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent calls", async () => {
    let resolve;
    const maybeSingle = vi.fn(() => new Promise((r) => { resolve = () => r({ data: { shop_id: mockShopId } }); }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    supabase.from.mockReturnValue({ select });

    const promise1 = getShopId();
    const promise2 = getShopId();

    resolve();
    const [r1, r2] = await Promise.all([promise1, promise2]);

    expect(r1).toBe(mockShopId);
    expect(r2).toBe(mockShopId);
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("handles no data from users table", async () => {
    mockSupabase(null);

    const result = await getShopId();
    expect(result).toBeNull();
  });
});

describe("withShop", () => {
  it("adds shop_id when currentShopId is set", async () => {
    mockSupabase({ shop_id: mockShopId });
    await getShopId();

    const result = withShop({ name: "Test Product" });
    expect(result).toEqual({ name: "Test Product", shop_id: mockShopId });
  });

  it("returns payload unchanged when no shop_id", () => {
    const result = withShop({ name: "Test Product" });
    expect(result).toEqual({ name: "Test Product" });
  });
});

describe("clearShopId", () => {
  it("resets cached shop_id", async () => {
    mockSupabase({ shop_id: mockShopId });
    await getShopId();
    clearShopId();

    supabase.from.mockClear();

    mockSupabase({ shop_id: "new-shop" });

    const result = await getShopId();
    expect(result).toBe("new-shop");
  });
});
