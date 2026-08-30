import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContactForm from "@/features/contact/components/ContactForm";

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

describe("Contact form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(
      screen.getByRole("button", { name: /^send$/i }),
    );

    expect(
      await screen.findByText(/full name is required/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/email is required/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please choose a subject/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please enter a message/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/accept the privacy policy/i),
    ).toBeInTheDocument();
  });

  it("submits valid input and shows the success state", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("Full Name"),
      "Nina Davis",
    );
    await user.type(
      screen.getByPlaceholderText("Email"),
      "nina@example.com",
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      "Order Support",
    );
    await user.type(
      screen.getByPlaceholderText("Message"),
      "Where is my order?",
    );
    await user.click(screen.getByRole("checkbox"));

    await user.click(
      screen.getByRole("button", { name: /^send$/i }),
    );

    expect(
      await screen.findByText(
        /your message has been received/i,
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
