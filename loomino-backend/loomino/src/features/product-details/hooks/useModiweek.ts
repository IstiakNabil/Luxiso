import { useQuery } from "@tanstack/react-query";

import { getModiweekProducts } from "@/services/product.service";

export function useModiweek() {
  return useQuery({
    queryKey: ["modiweek"],
    queryFn: getModiweekProducts,
  });
}
