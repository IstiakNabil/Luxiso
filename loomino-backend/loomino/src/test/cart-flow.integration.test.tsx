import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import CartPage from "@/pages/CartPage";
import * as cartService from "@/features/cart/services/cart.service";
import type { CartResponse } from "@/features/cart/types/cart";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

vi.mock("@/features/cart/services/cart.service", () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

const cartWithItems: CartResponse = {
  items: [
    {
      id: 1,
      product: "Wrap Top",
      slug: "wrap-top",
      image: "/media/products/wrap-top.jpg",
      color: "White",
      size: "S",
      price: "160.00",
      quantity: 1,
      subtotal: "160.00",
    },
    {
      id: 2,
      product: "Essential Dress",
      slug: "essential-dress",
      image: null,
      color: "Black",
      size: "XL",
      price: "195.00",
      quantity: 2,
      subtotal: "390.00",
    },
  ],
  total_items: 3,
  total_price: "550.00",
};

const emptyCart: CartResponse = {
  items: [],
  total_items: 0,
  total_price: "0.00",
};

function renderCartPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/cart"]}>
        <CartPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Cart flow (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders cart items with formatted prices and the order summary", async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(
      cartWithItems,
    );

    renderCartPage();

    expect(
      await screen.findByText("Wrap Top"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Essential Dress"),
    ).toBeInTheDocument();

    // Item price formatting (DRF string -> $160.00)
    expect(
      screen.getAllByText("৳160.00").length,
    ).toBeGreaterThan(0);

    // Summary: subtotal count and total
    expect(
      screen.getByText("Subtotal (3)"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("৳550.00"),
    ).toHaveLength(2); // subtotal + total rows

    expect(
      screen.getByRole("button", { name: "Next" }),
    ).toBeInTheDocument();
  });

  it("updates quantity through the API and refetches the cart", async () => {
    const user = userEvent.setup();

    vi.mocked(cartService.getCart).mockResolvedValue(
      cartWithItems,
    );

    vi.mocked(
      cartService.updateCartItem,
    ).mockResolvedValue({
      message: "Cart updated successfully.",
      quantity: 2,
    });

    renderCartPage();

    await screen.findByText("Wrap Top");

    const increaseButtons = screen.getAllByRole("button", {
      name: /increase quantity/i,
    });

    await user.click(increaseButtons[0]);

    await waitFor(() => {
      expect(
        vi.mocked(cartService.updateCartItem).mock
          .calls[0][0],
      ).toEqual({ id: 1, quantity: 2 });
    });

    // Invalidation triggers a refetch
    await waitFor(() => {
      expect(cartService.getCart).toHaveBeenCalledTimes(2);
    });
  });

  it("does not allow decreasing quantity below 1", async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(
      cartWithItems,
    );

    renderCartPage();

    await screen.findByText("Wrap Top");

    const decreaseButtons = screen.getAllByRole("button", {
      name: /decrease quantity/i,
    });

    // First item has quantity 1 -> its minus button is disabled
    expect(decreaseButtons[0]).toBeDisabled();

    // Second item has quantity 2 -> enabled
    expect(decreaseButtons[1]).toBeEnabled();
  });

  it("removes an item through the API and refetches the cart", async () => {
    const user = userEvent.setup();

    vi.mocked(cartService.getCart).mockResolvedValue(
      cartWithItems,
    );

    vi.mocked(
      cartService.removeCartItem,
    ).mockResolvedValue({
      message: "Item removed from cart.",
    });

    renderCartPage();

    await screen.findByText("Wrap Top");

    await user.click(
      screen.getByRole("button", {
        name: /remove wrap top from cart/i,
      }),
    );

    await waitFor(() => {
      expect(
        cartService.removeCartItem,
      ).toHaveBeenCalledWith(1, expect.anything());
    });

    await waitFor(() => {
      expect(cartService.getCart).toHaveBeenCalledTimes(2);
    });
  });

  it("shows the empty state when the cart has no items", async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(
      emptyCart,
    );

    renderCartPage();

    expect(
      await screen.findByText("Your Cart Is Empty"),
    ).toBeInTheDocument();

    // Header link + empty-state CTA both point to /shop
    expect(
      screen.getAllByRole("link", {
        name: /continue shopping/i,
      }),
    ).toHaveLength(2);

    // No order summary for an empty cart
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });
});
