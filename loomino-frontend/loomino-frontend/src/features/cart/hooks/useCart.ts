import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCart } from "../services/cart.service";

/**
 * Cart requires auth (backend CartAPIView is IsAuthenticated).
 * Only fetch when logged in so guests don't trigger a 401 —
 * this matters especially now that the Navbar reads cart count
 * globally on every page, including for guests who aren't
 * logged in at all.
 */
export function useCart() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
  });
}