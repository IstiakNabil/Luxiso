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
import CheckoutPage from "@/pages/CheckoutPage";
import * as cartService from "@/features/cart/services/cart.service";
import * as addressService from "@/features/addresses/services/address.service";
import * as checkoutService from "@/features/checkout/services/checkout.service";
import type { CartResponse } from "@/features/cart/types/cart";
import type { Address } from "@/features/addresses/types/address";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/features/cart/services/cart.service", () => ({
  getCart: vi.fn(),
}));

vi.mock(
  "@/features/addresses/services/address.service",
  () => ({
    createAddress: vi.fn(),
    getAddresses: vi.fn(),
  }),
);

vi.mock(
  "@/features/checkout/services/checkout.service",
  () => ({
    checkout: vi.fn(),
    applyCoupon: vi.fn(),
  }),
);

const cart: CartResponse = {
  items: [
    {
      id: 1,
      product: "Wrap Top",
      slug: "wrap-top",
      image: null,
      color: "White",
      size: "S",
      price: "160.00",
      quantity: 1,
      subtotal: "160.00",
    },
  ],
  total_items: 1,
  total_price: "160.00",
};

const createdAddress: Address = {
  id: 42,
  full_name: "Nina Davis",
  phone_number: "+1 646 555 3890",
  country: "USA",
  division: "New York",
  district: "New York",
  postal_code: "12401",
  address_line: "132 Green Street",
  landmark: "",
  is_default: false,
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

function renderCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/checkout"]}>
          <CheckoutPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Checkout flow (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("walks Info -> Payment -> Success, hitting the real endpoints", async () => {
    const user = userEvent.setup();

    vi.mocked(cartService.getCart).mockResolvedValue(cart);
    vi.mocked(
      addressService.createAddress,
    ).mockResolvedValue(createdAddress);
    vi.mocked(checkoutService.checkout).mockResolvedValue({
      message: "Order created successfully.",
      order_number: "LM-1001",
      order_id: 1001,
      subtotal: "160.00",
      total: "160.00",
    });

    renderCheckout();

    // Info step renders
    await screen.findByText("Shipping Address");

    // Email is pre-filled read-only from auth
    expect(
      screen.getByDisplayValue("nina@gmail.com"),
    ).toBeInTheDocument();

    // Fill the address form
    await user.type(
      screen.getByPlaceholderText("First Name"),
      "Nina",
    );
    await user.type(
      screen.getByPlaceholderText("Last Name"),
      "Davis",
    );
    await user.type(
      screen.getByPlaceholderText("Street Address"),
      "132 Green Street",
    );
    await user.type(
      screen.getByPlaceholderText("Postal Code"),
      "12401",
    );
    await user.type(
      screen.getByPlaceholderText("City"),
      "New York",
    );
    await user.type(
      screen.getByPlaceholderText("State / Region"),
      "New York",
    );
    await user.type(
      screen.getByPlaceholderText("Phone"),
      "+16465553890",
    );

    await user.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      }),
    );

    // Address created with combined full_name
    await waitFor(() => {
      expect(
        addressService.createAddress,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(addressService.createAddress).mock
        .calls[0][0].full_name,
    ).toBe("Nina Davis");

    // Payment step renders
    await screen.findByText("Please Choose Your Payment Method");

    // Place order
    await user.click(
      screen.getByRole("button", {
        name: /pay and place order/i,
      }),
    );

    await waitFor(() => {
      expect(
        checkoutService.checkout,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(checkoutService.checkout).mock.calls[0][0],
    ).toEqual({
      address_id: 42,
      payment_method: "cod",
      coupon_code: undefined,
    });

    // Success screen
    expect(
      await screen.findByText("Payment Successful"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/LM-1001/),
    ).toBeInTheDocument();
  });

  it("shows the failure screen when checkout rejects", async () => {
    const user = userEvent.setup();

    vi.mocked(cartService.getCart).mockResolvedValue(cart);
    vi.mocked(
      addressService.createAddress,
    ).mockResolvedValue(createdAddress);
    vi.mocked(checkoutService.checkout).mockRejectedValue(
      new Error("boom"),
    );

    renderCheckout();

    await screen.findByText("Shipping Address");

    await user.type(
      screen.getByPlaceholderText("First Name"),
      "Nina",
    );
    await user.type(
      screen.getByPlaceholderText("Last Name"),
      "Davis",
    );
    await user.type(
      screen.getByPlaceholderText("Street Address"),
      "132 Green Street",
    );
    await user.type(
      screen.getByPlaceholderText("Postal Code"),
      "12401",
    );
    await user.type(
      screen.getByPlaceholderText("City"),
      "New York",
    );
    await user.type(
      screen.getByPlaceholderText("State / Region"),
      "New York",
    );
    await user.type(
      screen.getByPlaceholderText("Phone"),
      "+16465553890",
    );

    await user.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      }),
    );

    await screen.findByText("Please Choose Your Payment Method");

    await user.click(
      screen.getByRole("button", {
        name: /pay and place order/i,
      }),
    );

    expect(
      await screen.findByText("Sorry, Payment Failed"),
    ).toBeInTheDocument();
  });
});
