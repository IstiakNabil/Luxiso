import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSiteSettings } from "@/services/settings.service";
import { setCurrencySymbol } from "@/lib/utils";

/**
 * Global site settings (contact info, socials, delivery charge,
 * currency, map). Cached for a while since it rarely changes.
 *
 * Side effect: whenever settings load, the configured currency
 * symbol is pushed into formatPrice() so every price across the
 * app reflects the admin-set symbol.
 */
export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.currency_symbol) {
      setCurrencySymbol(query.data.currency_symbol);
    }
  }, [query.data?.currency_symbol]);

  return query;
}
