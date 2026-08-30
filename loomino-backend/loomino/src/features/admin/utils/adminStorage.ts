/**
 * Admin session storage — deliberately kept under different
 * localStorage keys from the storefront session, so signing
 * into the admin panel does NOT sign you in as a shopper
 * (and vice versa). The two sessions are independent.
 */
const ACCESS_TOKEN_KEY = "admin_accessToken";
const REFRESH_TOKEN_KEY = "admin_refreshToken";
const USER_KEY = "admin_user";

export const adminStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setAccessToken(accessToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  setUser(user: unknown) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setSession(
    accessToken: string,
    refreshToken: string,
    user: unknown,
  ) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/** True when the app is currently inside the admin panel. */
export function isAdminContext() {
  return window.location.pathname.startsWith("/admin");
}
