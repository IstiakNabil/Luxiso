import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

import useProducts from "@/features/shop/hooks/useProducts";
import * as productService from "@/services/product.service";

vi.mock("@/services/product.service", () => ({
  getProducts: vi.fn(),
}));

function wrapper(initialEntry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      {children}
    </MemoryRouter>
  );
}

describe("Shop URL filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productService.getProducts).mockResolvedValue({
      results: [],
      count: 0,
      next: null,
      previous: null,
    } as never);
  });

  it("applies category slug from the URL on load", async () => {
    renderHook(() => useProducts(), {
      wrapper: wrapper("/shop?category=pants"),
    });

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    const firstCall = vi.mocked(productService.getProducts)
      .mock.calls[0][0];
    expect(firstCall).toMatchObject({ category: "pants" });
  });

  it("applies is_new_arrival=true from the URL", async () => {
    renderHook(() => useProducts(), {
      wrapper: wrapper("/shop?is_new_arrival=true"),
    });

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    const firstCall = vi.mocked(productService.getProducts)
      .mock.calls[0][0];
    expect(firstCall).toMatchObject({
      is_new_arrival: true,
    });
  });

  it("defaults to no filters on a plain /shop", async () => {
    renderHook(() => useProducts(), {
      wrapper: wrapper("/shop"),
    });

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    const firstCall = vi.mocked(productService.getProducts)
      .mock.calls[0][0];
    expect(firstCall).toMatchObject({
      category: "",
      is_new_arrival: false,
    });
  });
});
