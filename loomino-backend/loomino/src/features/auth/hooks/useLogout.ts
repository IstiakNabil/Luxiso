import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { AppDispatch } from "@/app/store/store";
import { logoutUser } from "../services/auth.service";
import { logout } from "../store/authSlice";
import { authStorage } from "../utils/authStorage";

/**
 * Logs the user out:
 * 1. Blacklists the refresh token on the backend (best effort).
 * 2. Clears local storage + Redux auth state.
 * 3. Clears cached server state (cart, profile, etc).
 * 4. Redirects to the home page.
 */
export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logoutUser,
  });

  const performLogout = async () => {
    const refresh = authStorage.getRefreshToken();

    if (refresh) {
      try {
        await mutation.mutateAsync({ refresh });
      } catch {
        // Token may already be expired/blacklisted.
        // Local logout must still proceed.
      }
    }

    authStorage.clear();
    dispatch(logout());
    queryClient.clear();

    toast.success("Logged out successfully.");
    navigate("/", { replace: true });
  };

  return {
    logout: performLogout,
    isPending: mutation.isPending,
  };
}
