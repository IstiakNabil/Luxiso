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
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";

import authReducer from "@/features/auth/store/authSlice";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import GuestRoute from "@/features/auth/components/GuestRoute";
import LoginForm from "@/features/auth/components/LoginForm";
import * as authService from "@/features/auth/services/auth.service";

// jsdom has no matchMedia (used by sonner via next-themes internals in some setups)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  login: vi.fn(),
  refreshToken: vi.fn(),
}));

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

function renderApp(initialPath: string, store = makeStore()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/", element: <div>Home Page</div> },
      {
        element: <GuestRoute />,
        children: [
          { path: "/login", element: <LoginForm /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/cart", element: <div>Cart Page</div> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>,
  );

  return { store, router };
}

describe("Authentication flow (integration)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    renderApp("/cart");

    // ProtectedRoute must bounce to /login (LoginForm heading)
    expect(
      await screen.findByRole("heading", { name: /log in/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Cart Page"),
    ).not.toBeInTheDocument();
  });

  it("shows Zod validation errors on empty login submit", async () => {
    const user = userEvent.setup();

    renderApp("/login");

    await user.click(
      screen.getByRole("button", { name: /log in/i }),
    );

    expect(
      await screen.findByText(/email is required/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/password is required/i),
    ).toBeInTheDocument();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it("logs in, persists the session, updates Redux, and redirects", async () => {
    const user = userEvent.setup();

    vi.mocked(authService.login).mockResolvedValue({
      message: "Login successful.",
      access: "access-token",
      refresh: "refresh-token",
      user: {
        email: "nabil@example.com",
        first_name: "Nabil",
        last_name: "Rahman",
      },
    });

    const { store, router } = renderApp("/login");

    await user.type(
      screen.getByPlaceholderText("Email"),
      "nabil@example.com",
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "supersecret",
    );

    await user.click(
      screen.getByRole("button", { name: /log in/i }),
    );

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    expect(
      vi.mocked(authService.login).mock.calls[0][0],
    ).toEqual({
      email: "nabil@example.com",
      password: "supersecret",
    });

    expect(localStorage.getItem("accessToken")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");

    // Redirected away from /login after success
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });

  it("keeps authenticated users out of guest-only routes", async () => {
    // The slice hydrates from localStorage at module import
    // (page load in production), so tests inject the session
    // through preloadedState instead.
    const authenticatedStore = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: {
            email: "nabil@example.com",
            first_name: "Nabil",
            last_name: "Rahman",
          },
          accessToken: "a",
          refreshToken: "r",
          isAuthenticated: true,
        },
      },
    });

    renderApp("/login", authenticatedStore);

    expect(
      await screen.findByText("Home Page"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /log in/i }),
    ).not.toBeInTheDocument();
  });
});
