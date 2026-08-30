import { useQuery } from "@tanstack/react-query";

import { getBestSellers } from "@/services/product.service";

export function useBestSellers() {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: getBestSellers,
  });
}
