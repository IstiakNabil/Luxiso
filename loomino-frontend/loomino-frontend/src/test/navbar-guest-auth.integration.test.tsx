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
import Navbar from "@/components/layout/Navbar";
import * as cartService from "@/features/cart/services/cart.service";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

vi.mock("@/features/cart/services/cart.service", () => ({
  getCart: vi.fn(),
}));

vi.mock("@/features/wishlist/services/wishlist.service", () => ({
  getWishlist: vi.fn(),
}));

function renderNavbar(isAuthenticated: boolean) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: isAuthenticated
          ? ({ email: "a@b.com" } as never)
          : null,
        accessToken: isAuthenticated ? "token" : null,
        refreshToken: isAuthenticated ? "refresh" : null,
        isAuthenticated,
      },
    },
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Navbar />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Navbar — guest vs authenticated data fetching", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does NOT call the cart or wishlist endpoints for a guest (regression: this caused a 401 -> /login redirect loop on every page)", async () => {
    renderNavbar(false);

    // Give any accidental effect a moment to fire before asserting
    // it never did.
    await waitFor(() => {
      expect(screen.getByLabelText("Cart")).toBeInTheDocument();
    });

    expect(cartService.getCart).not.toHaveBeenCalled();
    expect(wishlistService.getWishlist).not.toHaveBeenCalled();
  });

  it("DOES call the cart and wishlist endpoints once logged in", async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      items: [],
      total_items: 3,
      total_price: "0.00",
    });
    vi.mocked(wishlistService.getWishlist).mockResolvedValue([]);

    renderNavbar(true);

    await waitFor(() => {
      expect(cartService.getCart).toHaveBeenCalled();
    });
    expect(wishlistService.getWishlist).toHaveBeenCalled();
  });
});
