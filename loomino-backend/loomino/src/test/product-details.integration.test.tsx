import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import authReducer from "@/features/auth/store/authSlice";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import * as productService from "@/services/product.service";
import * as cartService from "@/features/cart/services/cart.service";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/services/product.service", () => ({
  getProductBySlug: vi.fn(),
  getRelatedProducts: vi.fn(),
}));

vi.mock("@/features/cart/services/cart.service", () => ({
  addToCart: vi.fn(),
  getCart: vi.fn(),
}));

vi.mock(
  "@/features/wishlist/services/wishlist.service",
  () => ({
    getWishlist: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  }),
);

const product = {
  id: 1,
  name: "Wrap Top",
  slug: "wrap-top",
  short_description: "A breezy wrap top.",
  description: "Full description.",
  fitting: "Regular fit.",
  fabric_and_care: "Cotton.",
  shipping_and_return: "Free shipping.",
  regular_price: "160.00",
  discount_price: null,
  category: "Tops",
  brand: "Loomino",
  is_featured: false,
  is_new_arrival: false,
  average_rating: 4.5,
  review_count: 12,
  images: [
    { id: 1, image: "/media/a.jpg", image_type: "front", display_order: 1 },
  ],
  variants: [
    {
      id: 101,
      sku: "WT-S-WHT",
      color: { id: 1, name: "White", hex_code: "#FFFFFF" },
      size: { id: 1, name: "S" },
      price: 160,
      stock: 5,
      available: true,
    },
  ],
};

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          email: "n@x.com",
          first_name: "N",
          last_name: "D",
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
        <MemoryRouter initialEntries={["/products/wrap-top"]}>
          <Routes>
            <Route
              path="/products/:slug"
              element={<ProductDetailsPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Product details (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      productService.getProductBySlug,
    ).mockResolvedValue(product as never);
    vi.mocked(
      productService.getRelatedProducts,
    ).mockResolvedValue({ results: [] } as never);
    vi.mocked(
      wishlistService.getWishlist,
    ).mockResolvedValue([]);
  });

  it("selects a size and adds the variant to the cart", async () => {
    const user = userEvent.setup();
    vi.mocked(cartService.addToCart).mockResolvedValue({
      message: "Added.",
    } as never);

    renderPage();

    // Product loaded
    expect(
      await screen.findByRole("heading", {
        name: "Wrap Top",
      }),
    ).toBeInTheDocument();

    // Color auto-selects; choose size from the dropdown
    await user.selectOptions(
      screen.getByLabelText("Size"),
      "1",
    );

    await user.click(
      screen.getByRole("button", {
        name: /add to cart/i,
      }),
    );

    await waitFor(() => {
      expect(cartService.addToCart).toHaveBeenCalledTimes(
        1,
      );
    });

    expect(
      vi.mocked(cartService.addToCart).mock.calls[0][0],
    ).toEqual({ product_variant_id: 101, quantity: 1 });
  });

  it("blocks add-to-cart until a size is chosen", async () => {
    renderPage();

    await screen.findByRole("heading", {
      name: "Wrap Top",
    });

    // No size selected -> add button disabled
    expect(
      screen.getByRole("button", {
        name: /add to cart/i,
      }),
    ).toBeDisabled();
  });
});
