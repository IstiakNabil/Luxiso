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
import ProfileTab from "@/features/profile/components/ProfileTab";
import AddressesTab from "@/features/profile/components/AddressesTab";
import * as authService from "@/features/auth/services/auth.service";
import * as addressService from "@/features/addresses/services/address.service";
import type { Address } from "@/features/addresses/types/address";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock(
  "@/features/addresses/services/address.service",
  () => ({
    getAddresses: vi.fn(),
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
  }),
);

const profile = {
  email: "nina@gmail.com",
  first_name: "Nina",
  last_name: "Davis",
  phone_number: "12345",
  date_joined: "2026-01-01T00:00:00Z",
  is_email_verified: true,
};

const address: Address = {
  id: 7,
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
};

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          email: profile.email,
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

function renderUI(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe("Profile flow (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the profile and saves an edited name", async () => {
    const user = userEvent.setup();

    vi.mocked(authService.getProfile).mockResolvedValue(
      profile,
    );
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...profile,
      first_name: "Nabil",
    });

    renderUI(<ProfileTab />);

    // Email shown read-only, form populated
    expect(
      await screen.findByDisplayValue("nina@gmail.com"),
    ).toBeInTheDocument();

    const firstName =
      screen.getByDisplayValue("Nina");

    await user.clear(firstName);
    await user.type(firstName, "Nabil");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(
        authService.updateProfile,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(authService.updateProfile).mock.calls[0][0]
        .first_name,
    ).toBe("Nabil");
  });

  it("lists addresses and sets a non-default one as default", async () => {
    const user = userEvent.setup();

    const second: Address = {
      ...address,
      id: 8,
      full_name: "Work Address",
      is_default: false,
    };

    vi.mocked(
      addressService.getAddresses,
    ).mockResolvedValue([address, second]);
    vi.mocked(
      addressService.setDefaultAddress,
    ).mockResolvedValue();

    renderUI(<AddressesTab />);

    expect(
      await screen.findByText("Work Address"),
    ).toBeInTheDocument();

    // Only the non-default card exposes "Set As Default"
    await user.click(
      screen.getByRole("button", {
        name: /set as default/i,
      }),
    );

    await waitFor(() => {
      expect(
        addressService.setDefaultAddress,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(addressService.setDefaultAddress).mock
        .calls[0][0],
    ).toBe(8);
  });

  it("creates a new address from the add form", async () => {
    const user = userEvent.setup();

    vi.mocked(
      addressService.getAddresses,
    ).mockResolvedValue([]);
    vi.mocked(
      addressService.createAddress,
    ).mockResolvedValue(address);

    renderUI(<AddressesTab />);

    await screen.findByText(
      /haven't saved any addresses/i,
    );

    await user.click(
      screen.getByRole("button", {
        name: /add address/i,
      }),
    );

    await user.type(
      screen.getByLabelText("Full Name"),
      "Nina Davis",
    );
    await user.type(
      screen.getByLabelText("Phone Number"),
      "+16465553890",
    );
    await user.type(
      screen.getByLabelText("Street Address"),
      "132 Green Street",
    );
    await user.type(
      screen.getByLabelText("City"),
      "New York",
    );
    await user.type(
      screen.getByLabelText("State / Region"),
      "New York",
    );
    await user.type(
      screen.getByLabelText("Postal Code"),
      "12401",
    );

    await user.click(
      screen.getByRole("button", {
        name: /^add address$/i,
      }),
    );

    await waitFor(() => {
      expect(
        addressService.createAddress,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      vi.mocked(addressService.createAddress).mock
        .calls[0][0].full_name,
    ).toBe("Nina Davis");
  });
});
