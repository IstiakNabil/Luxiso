import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import authReducer from "@/features/auth/store/authSlice";
import BestSellersPage from "@/pages/BestSellersPage";
import * as productService from "@/services/product.service";

vi.mock("@/services/product.service", () => ({
  getBestSellers: vi.fn(),
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
  is_featured: true,
  is_new_arrival: false,
  in_stock: true,
  default_variant_id: 5,
  average_rating: 4.5,
  review_count: 3,
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
        <MemoryRouter initialEntries={["/best-sellers"]}>
          <BestSellersPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Best Sellers page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders best seller products", async () => {
    vi.mocked(
      productService.getBestSellers,
    ).mockResolvedValue([product] as never);

    renderPage();

    expect(
      await screen.findByText("Formal Shirt"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Best Sellers" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are none", async () => {
    vi.mocked(
      productService.getBestSellers,
    ).mockResolvedValue([] as never);

    renderPage();

    expect(
      await screen.findByText(/nothing here yet/i),
    ).toBeInTheDocument();
  });
});
