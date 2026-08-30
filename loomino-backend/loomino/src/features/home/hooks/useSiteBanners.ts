import { useQuery } from "@tanstack/react-query";

import { getSiteBanners } from "@/services/cms.service";

export function useSiteBanners() {
  return useQuery({
    queryKey: ["site-banners"],
    queryFn: getSiteBanners,
    staleTime: 5 * 60 * 1000,
  });
}
