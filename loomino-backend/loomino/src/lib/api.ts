import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { getNewAccessToken } from "@/features/auth/services/token.service";
import { authStorage } from "@/features/auth/utils/authStorage";
import {
  adminStorage,
  isAdminContext,
} from "@/features/admin/utils/adminStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Endpoints where a 401 must NOT trigger a token refresh
 * (wrong credentials / expired refresh token, not an
 * expired access token).
 */
const AUTH_ENDPOINTS = [
  "/auth/login/",
  "/auth/refresh/",
  "/auth/register/",
  "/auth/verify-email/",
  "/auth/forgot-password/",
  "/auth/reset-password/",
  "/auth/resend-otp/",
];

function isAuthEndpoint(url?: string) {
  if (!url) return false;

  return AUTH_ENDPOINTS.some((endpoint) =>
    url.includes(endpoint),
  );
}

api.interceptors.request.use((config) => {
  // Never attach a (possibly stale) token to auth endpoints
  // like login/register/forgot-password — the backend runs
  // JWT auth on every request and would reject a stale token
  // with 401 before the AllowAny view even runs.
  if (isAuthEndpoint(config.url)) {
    return config;
  }

  // Admin pages use their own session, kept separate from
  // the shopper session, so the two never bleed into
  // each other.
  const token = isAdminContext()
    ? adminStorage.getAccessToken()
    : authStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Single-flight refresh: if multiple requests fail with
 * 401 at the same time, only one refresh call is made
 * and all requests retry with the new token.
 */
let refreshPromise: Promise<string> | null = null;

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetriableRequest | undefined;

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url);

    if (shouldAttemptRefresh) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= getNewAccessToken().finally(
          () => {
            refreshPromise = null;
          },
        );

        const access = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch {
        if (isAdminContext()) {
          adminStorage.clear();
          window.location.href = "/admin/login";
        } else {
          authStorage.clear();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api").replace("/api", "");

/** Single source of truth for the display currency. */
export const CURRENCY_SYMBOL = "$";
