import { refreshToken } from "./auth.service";
import { authStorage } from "../utils/authStorage";
import {
  adminStorage,
  isAdminContext,
} from "@/features/admin/utils/adminStorage";

/**
 * Exchanges the stored refresh token for a new access
 * token.
 *
 * IMPORTANT: the backend uses ROTATE_REFRESH_TOKENS +
 * BLACKLIST_AFTER_ROTATION, so every refresh response
 * also contains a NEW refresh token that must be stored
 * (the old one is blacklisted immediately).
 *
 * Admin and storefront sessions are stored separately, so
 * refresh reads/writes whichever session is in play.
 */
export async function getNewAccessToken(): Promise<string> {
  const admin = isAdminContext();

  const refresh = admin
    ? adminStorage.getRefreshToken()
    : authStorage.getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token");
  }

  const response = await refreshToken({ refresh });

  if (admin) {
    adminStorage.setAccessToken(response.access);
    if (response.refresh) {
      localStorage.setItem(
        "admin_refreshToken",
        response.refresh,
      );
    }
  } else {
    authStorage.setAccessToken(response.access);
    if (response.refresh) {
      authStorage.setRefreshToken(response.refresh);
    }
  }

  return response.access;
}
