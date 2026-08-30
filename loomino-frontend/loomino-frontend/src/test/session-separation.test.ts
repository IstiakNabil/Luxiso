import { describe, it, expect, beforeEach } from "vitest";

import { authStorage } from "@/features/auth/utils/authStorage";
import { adminStorage } from "@/features/admin/utils/adminStorage";

const shopper = {
  email: "shopper@example.com",
  first_name: "Sam",
  last_name: "Shopper",
};
const admin = {
  email: "admin@loomino.com",
  first_name: "Nabil",
  last_name: "Ahammed",
  is_staff: true,
};

describe("Admin and storefront sessions are independent", () => {
  beforeEach(() => localStorage.clear());

  it("signing into admin does not create a shopper session", () => {
    adminStorage.setSession("a-token", "a-refresh", admin);

    expect(adminStorage.getAccessToken()).toBe("a-token");
    // The storefront must still see nobody logged in.
    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });

  it("signing into the storefront does not grant admin", () => {
    authStorage.setSession("u-token", "u-refresh", shopper);

    expect(authStorage.getAccessToken()).toBe("u-token");
    expect(adminStorage.getAccessToken()).toBeNull();
    expect(adminStorage.getUser()).toBeNull();
  });

  it("keeps both sessions side by side without collision", () => {
    authStorage.setSession("u-token", "u-refresh", shopper);
    adminStorage.setSession("a-token", "a-refresh", admin);

    expect(authStorage.getAccessToken()).toBe("u-token");
    expect(adminStorage.getAccessToken()).toBe("a-token");
    expect(authStorage.getUser().email).toBe(shopper.email);
    expect(adminStorage.getUser().email).toBe(admin.email);
  });

  it("admin logout leaves the shopper session intact", () => {
    authStorage.setSession("u-token", "u-refresh", shopper);
    adminStorage.setSession("a-token", "a-refresh", admin);

    adminStorage.clear();

    expect(adminStorage.getAccessToken()).toBeNull();
    expect(authStorage.getAccessToken()).toBe("u-token");
  });

  it("shopper logout leaves the admin session intact", () => {
    authStorage.setSession("u-token", "u-refresh", shopper);
    adminStorage.setSession("a-token", "a-refresh", admin);

    authStorage.clear();

    expect(authStorage.getAccessToken()).toBeNull();
    expect(adminStorage.getAccessToken()).toBe("a-token");
  });
});
