import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import authReducer from "@/features/auth/store/authSlice";
import PlusSizePage from "@/pages/PlusSizePage";
import {
  selectPlusSizes,
} from "@/features/plus-size/plusSizes";
import * as sizeService from "@/services/size.service";
import * as productService from "@/services/product.service";

vi.mock("@/services/size.service", () => ({
  getSizes: vi.fn(),
}));
vi.mock("@/services/product.service", () => ({
  getProducts: vi.fn(),
}));
vi.mock(
  "@/features/wishlist/services/wishlist.service",
  () => ({
    getWishlist: vi.fn().mockResolvedValue([]),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  }),
);

const product = {
  id: 1,
  name: "Formal Shirt",
  slug: "formal-shirt",
  price: "1800.00",
  thumbnail: "/media/shirt.jpg",
  category: "Shirts",
  brand: "Loomino",
  is_featured: false,
  is_new_arrival: false,
  in_stock: true,
  default_variant_id: 5,
  average_rating: 4,
  review_count: 2,
};

function renderPage() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      },
    },
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/plus-size"]}>
          <PlusSizePage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("selectPlusSizes", () => {
  it("picks XL/XXL/2XL/3XL and ignores S/M/L", () => {
    expect(
      selectPlusSizes([
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "2XL",
        "3XL",
      ]),
    ).toEqual(["XL", "XXL", "2XL", "3XL"]);
  });
});

describe("Plus Size page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries products with the joined plus sizes", async () => {
    vi.mocked(sizeService.getSizes).mockResolvedValue({
      results: [
        { id: 1, name: "S", display_order: 1 },
        { id: 2, name: "XL", display_order: 4 },
        { id: 3, name: "XXL", display_order: 5 },
      ],
      count: 3,
      next: null,
      previous: null,
    } as never);
    vi.mocked(productService.getProducts).mockResolvedValue(
      {
        results: [product],
        count: 1,
        next: null,
        previous: null,
      } as never,
    );

    renderPage();

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    expect(
      vi.mocked(productService.getProducts).mock.calls[0][0],
    ).toEqual({ size: "XL,XXL" });

    expect(
      await screen.findByText("Formal Shirt"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no plus sizes exist", async () => {
    vi.mocked(sizeService.getSizes).mockResolvedValue({
      results: [
        { id: 1, name: "S", display_order: 1 },
        { id: 2, name: "M", display_order: 2 },
      ],
      count: 2,
      next: null,
      previous: null,
    } as never);

    renderPage();

    expect(
      await screen.findByText(/no plus size items yet/i),
    ).toBeInTheDocument();
    expect(
      productService.getProducts,
    ).not.toHaveBeenCalled();
  });
});
