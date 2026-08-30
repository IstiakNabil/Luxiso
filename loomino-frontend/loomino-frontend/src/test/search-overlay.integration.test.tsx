import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import SearchOverlay from "@/features/search/components/SearchOverlay";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="loc">
      {location.pathname + location.search}
    </div>
  );
}

function renderOverlay(open = true) {
  const onClose = vi.fn();
  render(
    <MemoryRouter initialEntries={["/"]}>
      <SearchOverlay open={open} onClose={onClose} />
      <LocationProbe />
    </MemoryRouter>,
  );
  return { onClose };
}

describe("SearchOverlay", () => {
  beforeEach(() => vi.clearAllMocks());

  it("navigates to shop with the search query on submit", async () => {
    const user = userEvent.setup();
    renderOverlay();

    await user.type(
      screen.getByPlaceholderText("Search"),
      "linen shirt",
    );
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("loc").textContent).toBe(
      "/shop?search=linen%20shirt",
    );
  });

  it("does not navigate on an empty query", async () => {
    const user = userEvent.setup();
    renderOverlay();

    await user.keyboard("{Enter}");
    expect(screen.getByTestId("loc").textContent).toBe("/");
  });

  it("renders nothing when closed", () => {
    renderOverlay(false);
    expect(
      screen.queryByPlaceholderText("Search"),
    ).not.toBeInTheDocument();
  });
});
