import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import * as orderService from "@/features/orders/services/order.service";
import type {
  OrderDetail,
  OrderListItem,
  Paginated,
} from "@/features/orders/types/order";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/features/orders/services/order.service", () => ({
  getOrders: vi.fn(),
  getOrder: vi.fn(),
  cancelOrder: vi.fn(),
}));

function makePage(
  page: number,
  totalPages: number,
): Paginated<OrderListItem> {
  return {
    count: totalPages * 2,
    page,
    page_size: 12,
    total_pages: totalPages,
    next: page < totalPages ? "x" : null,
    previous: page > 1 ? "x" : null,
    results: [
      {
        order_number: `LM-${page}00`,
        status: "pending",
        subtotal: "160.00",
        shipping_cost: "0.00",
        discount: "0.00",
        total: "160.00",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        order_number: `LM-${page}01`,
        status: "delivered",
        subtotal: "195.00",
        shipping_cost: "0.00",
        discount: "0.00",
        total: "195.00",
        created_at: "2026-01-02T00:00:00Z",
      },
    ],
  };
}

const orderDetail: OrderDetail = {
  order_number: "LM-100",
  status: "pending",
  subtotal: "160.00",
  shipping_cost: "0.00",
  discount: "0.00",
  total: "160.00",
  created_at: "2026-01-01T00:00:00Z",
  shipment_status: "pending",
  tracking_number: "TRK123",
  shipping_address: {
    id: 1,
    full_name: "Nina Davis",
    phone_number: "+1 646 555 3890",
    country: "USA",
    division: "New York",
    district: "New York",
    postal_code: "12401",
    address_line: "132 Green Street",
    landmark: "",
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  items: [
    {
      product_name: "Wrap Top",
      sku: "WT-S-WHT",
      color: "White",
      size: "S",
      price: "160.00",
      quantity: 1,
      subtotal: "160.00",
    },
  ],
};

function renderWithClient(ui: React.ReactElement, path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/orders/:orderNumber"
            element={<OrderDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return ui;
}

describe("Orders flow (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists orders and paginates through pages", async () => {
    const user = userEvent.setup();

    vi.mocked(orderService.getOrders).mockImplementation(
      (page: number) =>
        Promise.resolve(makePage(page, 3)),
    );

    renderWithClient(<div />, "/orders");

    expect(
      await screen.findByText("#LM-100"),
    ).toBeInTheDocument();

    // Page 1 requested
    expect(orderService.getOrders).toHaveBeenCalledWith(1);

    // Go to next page
    await user.click(
      screen.getByRole("button", { name: /next page/i }),
    );

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenCalledWith(
        2,
      );
    });

    expect(
      await screen.findByText("#LM-200"),
    ).toBeInTheDocument();
  });

  it("shows the empty state with no orders", async () => {
    vi.mocked(orderService.getOrders).mockResolvedValue({
      count: 0,
      page: 1,
      page_size: 12,
      total_pages: 1,
      next: null,
      previous: null,
      results: [],
    });

    renderWithClient(<div />, "/orders");

    expect(
      await screen.findByText("No Orders Yet"),
    ).toBeInTheDocument();
  });

  it("renders order detail with items, tracking and status", async () => {
    vi.mocked(orderService.getOrder).mockResolvedValue(
      orderDetail,
    );

    renderWithClient(<div />, "/orders/LM-100");

    expect(
      await screen.findByText("Order #LM-100"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Wrap Top"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/TRK123/),
    ).toBeInTheDocument();

    // Pending order is cancellable
    expect(
      screen.getByRole("button", {
        name: /cancel this order/i,
      }),
    ).toBeInTheDocument();
  });

  it("cancels a cancellable order after confirmation", async () => {
    const user = userEvent.setup();

    vi.mocked(orderService.getOrder).mockResolvedValue(
      orderDetail,
    );
    vi.mocked(orderService.cancelOrder).mockResolvedValue({
      message: "Order cancelled successfully.",
    });

    renderWithClient(<div />, "/orders/LM-100");

    await screen.findByText("Order #LM-100");

    await user.click(
      screen.getByRole("button", {
        name: /cancel this order/i,
      }),
    );

    // Confirmation appears
    const confirmBtn = await screen.findByRole("button", {
      name: /yes, cancel/i,
    });

    await user.click(confirmBtn);

    await waitFor(() => {
      expect(
        orderService.cancelOrder,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(orderService.cancelOrder).mock.calls[0][0],
    ).toBe("LM-100");
  });
});
