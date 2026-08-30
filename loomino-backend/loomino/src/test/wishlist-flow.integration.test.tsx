import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import authReducer from "@/features/auth/store/authSlice";
import WishlistPage from "@/pages/WishlistPage";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";
import type { WishlistItem } from "@/features/wishlist/types/wishlist";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock(
  "@/features/wishlist/services/wishlist.service",
  () => ({
    getWishlist: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  }),
);

const item: WishlistItem = {
  id: 1,
  product_variant: {
    id: 55,
    sku: "CWL-S-BLU",
    color: { id: 2, name: "Dark Blue", hex_code: "#1B2A4A" },
    size: { id: 1, name: "S" },
    price: "130.00",
    stock: 4,
    available: true,
  },
  product_name: "Casual Wild Leg",
  product_slug: "casual-wild-leg",
  product_image: "/media/products/cwl.jpg",
  created_at: "2026-01-01T00:00:00Z",
};

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          email: "nina@gmail.com",
          first_name: "Nina",
          last_name: "Davis",
        },
        accessToken: "a",
        refreshToken: "r",
        isAuthenticated: true,
      },
    },
  });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/wishlist"]}>
          <WishlistPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Wishlist flow (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders wishlist items with product info and count", async () => {
    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([item]);

    renderPage();

    expect(
      await screen.findByText("Casual Wild Leg"),
    ).toBeInTheDocument();

    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(screen.getByText("৳130.00")).toBeInTheDocument();
    expect(
      screen.getByText(/Size: S/),
    ).toBeInTheDocument();
  });

  it("removes an item via the heart button (by variant id)", async () => {
    const user = userEvent.setup();

    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([item]);
    vi.mocked(
      wishlistService.removeFromWishlist,
    ).mockResolvedValue({ message: "Removed." });

    renderPage();

    await screen.findByText("Casual Wild Leg");

    await user.click(
      screen.getByRole("button", {
        name: /remove casual wild leg from wishlist/i,
      }),
    );

    await waitFor(() => {
      expect(
        wishlistService.removeFromWishlist,
      ).toHaveBeenCalledTimes(1);
    });

    // Removal keys off the VARIANT id, not the item id
    expect(
      vi.mocked(wishlistService.removeFromWishlist).mock
        .calls[0][0],
    ).toBe(55);
  });

  it("shows the empty state when there are no items", async () => {
    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("Your Wish List Is Empty"),
    ).toBeInTheDocument();

    expect(screen.getByText("0 items")).toBeInTheDocument();
  });
});
