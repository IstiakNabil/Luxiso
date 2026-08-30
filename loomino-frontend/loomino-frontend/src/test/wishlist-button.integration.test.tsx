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
import WishlistButton from "@/features/wishlist/components/WishlistButton";
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

const wishlisted: WishlistItem = {
  id: 1,
  product_variant: {
    id: 55,
    sku: "X",
    color: null,
    size: null,
    price: "130.00",
    stock: 3,
    available: true,
  },
  product_name: "Casual Wild Leg",
  product_slug: "casual-wild-leg",
  product_image: null,
  created_at: "2026-01-01T00:00:00Z",
};

function makeStore(authenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: authenticated
        ? {
            user: {
              email: "n@x.com",
              first_name: "N",
              last_name: "D",
            },
            accessToken: "a",
            refreshToken: "r",
            isAuthenticated: true,
          }
        : {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          },
    },
  });
}

function renderButton(
  variantId: number | null,
  authenticated = true,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={makeStore(authenticated)}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WishlistButton
            variantId={variantId}
            productName="Casual Wild Leg"
          />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("WishlistButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([]);
  });

  it("adds a variant when not yet wishlisted", async () => {
    const user = userEvent.setup();
    vi.mocked(
      wishlistService.addToWishlist,
    ).mockResolvedValue({ message: "Added." });

    renderButton(55);

    const btn = await screen.findByRole("button", {
      name: /add casual wild leg to wishlist/i,
    });

    await user.click(btn);

    await waitFor(() => {
      expect(
        wishlistService.addToWishlist,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(wishlistService.addToWishlist).mock
        .calls[0][0],
    ).toEqual({ product_variant_id: 55 });
  });

  it("removes when already wishlisted (reflects state)", async () => {
    const user = userEvent.setup();
    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([wishlisted]);
    vi.mocked(
      wishlistService.removeFromWishlist,
    ).mockResolvedValue({ message: "Removed." });

    renderButton(55);

    // Button reflects wishlisted state -> "remove" label
    const btn = await screen.findByRole("button", {
      name: /remove casual wild leg from wishlist/i,
    });

    await user.click(btn);

    await waitFor(() => {
      expect(
        wishlistService.removeFromWishlist,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(wishlistService.removeFromWishlist).mock
        .calls[0][0],
    ).toBe(55);
  });

  it("is disabled when there is no variant id", () => {
    renderButton(null);

    expect(
      screen.getByRole("button"),
    ).toBeDisabled();
  });
});
