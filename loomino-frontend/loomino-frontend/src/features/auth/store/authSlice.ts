import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "../types/auth";
import { authStorage } from "../utils/authStorage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

/**
 * Hydrate synchronously from localStorage so route guards
 * see the correct auth state on the very first render
 * (no redirect flash on page refresh).
 */
function getInitialState(): AuthState {
  const accessToken = authStorage.getAccessToken();
  const refreshToken = authStorage.getRefreshToken();
  const user = authStorage.getUser() as User | null;

  if (accessToken && refreshToken && user) {
    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    };
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },

    restoreSession: (
      state,
      action: PayloadAction<AuthState>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = action.payload.isAuthenticated;
    },

    setUser: (
      state,
      action: PayloadAction<User>,
    ) => {
      state.user = action.payload;
    },

    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  loginSuccess,
  restoreSession,
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
