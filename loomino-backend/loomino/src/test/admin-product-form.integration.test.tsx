import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import ProductForm from "@/features/admin/components/ProductForm";

vi.mock("@/features/admin/services/catalog.service", () => ({
  listCategories: vi.fn().mockResolvedValue([
    { id: 3, name: "Shirt", slug: "shirt" },
  ]),
}));
vi.mock("@/features/admin/services/commerce.service", () => ({
  listBrands: vi
    .fn()
    .mockResolvedValue([
      { id: 1, name: "Loomino", slug: "loomino" },
    ]),
}));

function renderForm(onSubmit = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <ProductForm
        initial={null}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    </QueryClientProvider>,
  );
  return onSubmit;
}

describe("Admin ProductForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires a name before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(
      screen.getByRole("button", { name: /add product/i }),
    );

    expect(
      await screen.findByText(/product name is required/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits with the chosen storefront section flags", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    // Wait for categories to load
    await screen.findByRole("option", { name: "Shirt" });

    await user.type(
      screen.getByPlaceholderText(
        /classic linen blend shirt/i,
      ),
      "Silk Kurti",
    );
    await user.selectOptions(
      screen.getByDisplayValue("Select category"),
      "3",
    );
    await user.type(
      screen.getByPlaceholderText("0.00"),
      "1500",
    );

    // Tick New In and Modiweek
    await user.click(
      screen.getByRole("checkbox", { name: /new in/i }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: /modiweek/i }),
    );

    await user.click(
      screen.getByRole("button", { name: /add product/i }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: "Silk Kurti",
      category: 3,
      regular_price: "1500",
      is_new_arrival: true,
      is_modiweek: true,
      is_featured: false,
      is_active: true,
    });
  });
});
