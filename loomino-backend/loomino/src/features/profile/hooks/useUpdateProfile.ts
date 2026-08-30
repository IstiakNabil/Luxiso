import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/app/store/store";
import { updateProfile } from "@/features/auth/services/auth.service";
import { setUser } from "@/features/auth/store/authSlice";
import { authStorage } from "@/features/auth/utils/authStorage";
import { PROFILE_QUERY_KEY } from "./useProfile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      // Keep cache, Redux, and localStorage in sync so the
      // navbar/user menu reflect the new name immediately.
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);

      const user = {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      };

      dispatch(setUser(user));

      if (authStorage.getUser()) {
        authStorage.setUser(user);
      }
    },
  });
}
