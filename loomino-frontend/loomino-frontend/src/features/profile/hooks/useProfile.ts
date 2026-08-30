import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/features/auth/services/auth.service";

export const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
  });
}
