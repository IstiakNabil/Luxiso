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
import ModiweekPage from "@/pages/ModiweekPage";
import * as productService from "@/services/product.service";

vi.mock("@/services/product.service", () => ({
  getModiweekProducts: vi.fn(),
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
  name: "Fabric Trench",
  slug: "fabric-trench",
  price: "140.00",
  thumbnail: "/media/trench.jpg",
  category: "Jackets",
  brand: "Loomino",
  is_featured: false,
  is_new_arrival: false,
  in_stock: true,
  default_variant_id: 3,
  average_rating: 4,
  review_count: 1,
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
        <MemoryRouter initialEntries={["/modiweek"]}>
          <ModiweekPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Modiweek page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders modiweek products from the endpoint", async () => {
    vi.mocked(
      productService.getModiweekProducts,
    ).mockResolvedValue([product] as never);

    renderPage();

    expect(
      await screen.findByText("Fabric Trench"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This Week's Picks"),
    ).toBeInTheDocument();
  });

  it("shows empty state when the edit is empty", async () => {
    vi.mocked(
      productService.getModiweekProducts,
    ).mockResolvedValue([] as never);

    renderPage();

    expect(
      await screen.findByText(/nothing in the edit yet/i),
    ).toBeInTheDocument();
  });
});
