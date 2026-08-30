import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import WelcomeModal from "@/features/welcome/WelcomeModal";

function renderModal() {
  render(
    <MemoryRouter>
      <WelcomeModal />
    </MemoryRouter>,
  );
}

describe("WelcomeModal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows on first visit", () => {
    renderModal();
    expect(
      screen.getByText("Welcome to Loomino"),
    ).toBeInTheDocument();
  });

  it("does not show once dismissed (persists)", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <MemoryRouter>
        <WelcomeModal />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: /^close$/i }),
    );
    expect(
      screen.queryByText("Welcome to Loomino"),
    ).not.toBeInTheDocument();

    unmount();
    renderModal();
    expect(
      screen.queryByText("Welcome to Loomino"),
    ).not.toBeInTheDocument();
  });

  it("does not show if already seen", () => {
    localStorage.setItem("loomino_welcome_seen", "true");
    renderModal();
    expect(
      screen.queryByText("Welcome to Loomino"),
    ).not.toBeInTheDocument();
  });
});
