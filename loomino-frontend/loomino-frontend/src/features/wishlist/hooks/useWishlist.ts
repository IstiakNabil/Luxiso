import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getWishlist } from "../services/wishlist.service";

export const WISHLIST_QUERY_KEY = ["wishlist"];

/**
 * Wishlist requires auth. Only fetch when logged in so
 * guests don't trigger a 401.
 */
export function useWishlist() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });
}
