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
import ReviewsSection from "@/features/reviews/components/ReviewsSection";
import * as reviewService from "@/features/reviews/services/review.service";
import type { Review } from "@/features/reviews/types/review";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/features/reviews/services/review.service", () => ({
  getProductReviews: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

const existing: Review = {
  id: 10,
  user: "someone@else.com",
  rating: 4,
  title: "Lovely fabric",
  review: "Soft and well made.",
  is_verified_purchase: true,
  created_at: "2026-01-01T00:00:00Z",
};

function makeStore(authenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: authenticated
        ? {
            user: {
              email: "nina@gmail.com",
              first_name: "Nina",
              last_name: "Davis",
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

function renderSection(authenticated = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={makeStore(authenticated)}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewsSection
            productId={7}
            slug="wrap-top"
            averageRating={4}
            reviewCount={1}
          />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Reviews section (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists reviews with verified badge", async () => {
    vi.mocked(
      reviewService.getProductReviews,
    ).mockResolvedValue([existing]);

    renderSection();

    expect(
      await screen.findByText("Lovely fabric"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/verified purchase/i),
    ).toBeInTheDocument();
    // Email masked to name part
    expect(screen.getByText("someone")).toBeInTheDocument();
  });

  it("submits a new review with the product id", async () => {
    const user = userEvent.setup();
    vi.mocked(
      reviewService.getProductReviews,
    ).mockResolvedValue([]);
    vi.mocked(
      reviewService.createReview,
    ).mockResolvedValue({ message: "Review submitted." });

    renderSection();

    // Wait for the form (no existing reviews from this user)
    await screen.findByText("Write a Review");

    // Pick 5 stars
    await user.click(
      screen.getByRole("button", { name: /5 stars/i }),
    );
    await user.type(
      screen.getByPlaceholderText("Review title"),
      "Great fit",
    );
    await user.type(
      screen.getByPlaceholderText(
        /what did you think/i,
      ),
      "Fits perfectly and looks great.",
    );
    await user.click(
      screen.getByRole("button", {
        name: /submit review/i,
      }),
    );

    await waitFor(() => {
      expect(
        reviewService.createReview,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(reviewService.createReview).mock
        .calls[0][0],
    ).toEqual({
      product: 7,
      rating: 5,
      title: "Great fit",
      review: "Fits perfectly and looks great.",
    });
  });

  it("prompts guests to log in", async () => {
    vi.mocked(
      reviewService.getProductReviews,
    ).mockResolvedValue([]);

    renderSection(false);

    expect(
      await screen.findByText(/log in/i),
    ).toBeInTheDocument();
  });

  it("blocks a second review from the same user", async () => {
    vi.mocked(
      reviewService.getProductReviews,
    ).mockResolvedValue([
      { ...existing, user: "nina@gmail.com" },
    ]);

    renderSection();

    expect(
      await screen.findByText(
        /already reviewed this product/i,
      ),
    ).toBeInTheDocument();
  });
});
