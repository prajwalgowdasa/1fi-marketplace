import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HELPFUL_REVIEWS_KEY, useHelpfulReview } from "../use-helpful-reviews";
import { SAVED_PRODUCTS_KEY, useSavedProduct } from "../use-saved-product";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("persisted marketplace preferences", () => {
  it("hydrates a stored saved product after the initial render", () => {
    vi.useFakeTimers();
    localStorage.setItem(SAVED_PRODUCTS_KEY, '["iphone-17"]');

    const { result } = renderHook(() => useSavedProduct("iphone-17"));

    expect(result.current.active).toBe(false);
    act(() => vi.runAllTimers());
    expect(result.current.active).toBe(true);
  });

  it("preserves stored saved products when toggled before hydration", () => {
    vi.useFakeTimers();
    localStorage.setItem(SAVED_PRODUCTS_KEY, '["macbook-air"]');

    const { result } = renderHook(() => useSavedProduct("iphone-17"));

    act(() => result.current.toggle());

    expect(result.current.active).toBe(true);
    expect(JSON.parse(localStorage.getItem(SAVED_PRODUCTS_KEY)!)).toEqual(["iphone-17", "macbook-air"]);

    act(() => vi.runAllTimers());
    expect(result.current.active).toBe(true);
  });

  it("keeps a failed pre-hydration toggle active after the hydration timer", () => {
    vi.useFakeTimers();
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage quota exceeded");
    });
    const { result } = renderHook(() => useHelpfulReview("review-42"));

    act(() => result.current.toggle());

    expect(result.current.active).toBe(true);
    expect(result.current.persistenceAvailable).toBe(false);
    expect(setItem).toHaveBeenCalledWith(HELPFUL_REVIEWS_KEY, '["review-42"]');

    act(() => vi.runAllTimers());
    expect(result.current.active).toBe(true);
    expect(result.current.persistenceAvailable).toBe(false);
  });

  it("persists a saved product when toggled", async () => {
    const { result } = renderHook(() => useSavedProduct("iphone-17"));

    await waitFor(() => expect(result.current.active).toBe(false));
    act(() => result.current.toggle());

    expect(result.current.active).toBe(true);
    expect(JSON.parse(localStorage.getItem(SAVED_PRODUCTS_KEY)!)).toEqual(["iphone-17"]);
  });

  it("treats malformed saved-product storage as inactive without throwing", async () => {
    localStorage.setItem(SAVED_PRODUCTS_KEY, "not valid json");

    const { result } = renderHook(() => useSavedProduct("iphone-17"));

    await waitFor(() => expect(result.current.active).toBe(false));
    expect(result.current.persistenceAvailable).toBe(true);
  });

  it("keeps the toggle functional when writing helpful-review storage fails", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage quota exceeded");
    });
    const { result } = renderHook(() => useHelpfulReview("review-42"));

    await waitFor(() => expect(result.current.active).toBe(false));
    act(() => result.current.toggle());

    expect(result.current.active).toBe(true);
    expect(result.current.persistenceAvailable).toBe(false);
    expect(setItem).toHaveBeenCalledWith(HELPFUL_REVIEWS_KEY, '["review-42"]');
  });

  it("marks persistence unavailable when reading storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const { result } = renderHook(() => useSavedProduct("iphone-17"));

    await waitFor(() => expect(result.current.persistenceAvailable).toBe(false));
    expect(result.current.active).toBe(false);
  });
});
