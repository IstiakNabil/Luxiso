import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { User } from "@/features/auth/types/auth";
import { adminStorage } from "../utils/adminStorage";

interface AdminAuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

/** Hydrate from the admin-only storage keys. */
function getInitialState(): AdminAuthState {
  const accessToken = adminStorage.getAccessToken();
  const refreshToken = adminStorage.getRefreshToken();
  const user = adminStorage.getUser() as User | null;

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

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: getInitialState(),
  reducers: {
    adminLoginSuccess: (
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

    setAdminUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    adminLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  adminLoginSuccess,
  setAdminUser,
  adminLogout,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
