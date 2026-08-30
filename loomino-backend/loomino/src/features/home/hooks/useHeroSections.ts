import { useQuery } from "@tanstack/react-query";

import { getHeroSections } from "@/services/cms.service";

export function useHeroSections() {
  return useQuery({
    queryKey: ["hero-sections"],
    queryFn: getHeroSections,
    // Rarely changes — no need to refetch aggressively.
    staleTime: 5 * 60 * 1000,
  });
}
